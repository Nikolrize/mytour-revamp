import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import path from "node:path";
import { createRequire } from "node:module";
import { webcrypto } from "node:crypto";
import ts from "typescript";

const nodeRequire = createRequire(import.meta.url);
const root = path.resolve(import.meta.dirname, "..");
const USER = "11111111-1111-4111-8111-111111111111";
const OTHER = "22222222-2222-4222-8222-222222222222";
const POST = "33333333-3333-4333-8333-333333333333";
const TRIP = "44444444-4444-4444-8444-444444444444";
const next = { NextResponse: { json: (value, options) => new Response(JSON.stringify(value), options) } };

function load(file, mocks = {}) {
  const loadedModule = { exports: {} };
  const code = ts.transpileModule(fs.readFileSync(path.join(root, file), "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  vm.runInNewContext(code, { exports: loadedModule.exports, module: loadedModule, Buffer, File, FormData, Response, Request, URL, crypto: webcrypto, console, process, require: (name) => mocks[name] ?? (name === "next/server" ? next : nodeRequire(name)) });
  return loadedModule.exports;
}
const schemas = load("lib/schemas.ts");

function setup({ user = { id: USER }, admin = false, resolve = () => ({ data: null, error: null }) } = {}) {
  const operations = [];
  const uploads = [];
  const removed = [];
  const supabase = {
    from(table) {
      const operation = { table, method: "select", filters: [] };
      const finish = () => { operations.push(operation); return resolve(operation); };
      const query = {
        select() { return query; }, eq(key, value) { operation.filters.push([key, value]); return query; },
        in() { return query; }, order() { return query; }, range() { return query; },
        insert(payload) { operation.method = "insert"; operation.payload = payload; return query; },
        upsert(payload, options) { operation.method = "upsert"; operation.payload = payload; operation.options = options; return query; },
        delete() { operation.method = "delete"; return query; },
        maybeSingle() { return Promise.resolve(finish()); }, single() { return Promise.resolve(finish()); },
        then(yes, no) { return Promise.resolve(finish()).then(yes, no); },
      };
      return query;
    },
    storage: { from: () => ({ upload: async (name) => { uploads.push(name); return { error: null }; }, remove: async (names) => { removed.push(...names); return { error: null }; }, getPublicUrl: (name) => ({ data: { publicUrl: `https://example.test/${name}` } }) }) },
  };
  const api = { supabase, user };
  const shared = { getApiContext: async () => api, userIsAdmin: async () => admin };
  const helpers = load("app/api/community/_shared.ts", { "@/app/api/_shared": shared });
  const mocks = { "@/app/api/_shared": shared, "@/app/api/community/_shared": helpers, "@/lib/schemas": schemas };
  return { route: (file) => load(file, mocks), operations, uploads, removed };
}
function postRequest({ content = "A day in Penang", tripId = "", photo } = {}) {
  const body = new FormData(); body.set("content", content); body.set("tripId", tripId);
  if (photo) body.append("photos", photo);
  return new Request("http://localhost/api/community/posts", { method: "POST", body });
}
const context = { params: Promise.resolve({ postId: POST }) };

test("posting, liking and commenting require authentication", async () => {
  const scenario = setup({ user: null });
  assert.equal((await scenario.route("app/api/community/posts/route.ts").POST(postRequest())).status, 401);
  assert.equal((await scenario.route("app/api/community/posts/[postId]/like/route.ts").POST(null, context)).status, 401);
  assert.equal((await scenario.route("app/api/community/posts/[postId]/comments/route.ts").POST(null, context)).status, 401);
  assert.equal(scenario.operations.length, 0);
});
test("empty posts and forged image types are rejected before uploads", async () => {
  const scenario = setup(); const route = scenario.route("app/api/community/posts/route.ts");
  assert.equal((await route.POST(postRequest({ content: " " }))).status, 400);
  assert.equal((await route.POST(postRequest({ photo: new File(["not a photo"], "photo.png", { type: "image/png" }) }))).status, 400);
  assert.equal(scenario.uploads.length, 0);
});
test("private attachments are rejected before image upload", async () => {
  const scenario = setup();
  const response = await scenario.route("app/api/community/posts/route.ts").POST(postRequest({ tripId: TRIP }));
  assert.equal(response.status, 400);
  assert(scenario.operations[0].filters.some(([key, value]) => key === "is_public" && value === true));
  assert.equal(scenario.uploads.length, 0);
});
test("post creation assigns the authenticated author", async () => {
  const scenario = setup({ resolve: () => ({ data: { id: POST }, error: null }) });
  assert.equal((await scenario.route("app/api/community/posts/route.ts").POST(postRequest())).status, 201);
  const insertion = scenario.operations.find((operation) => operation.method === "insert");
  assert.equal(insertion.payload.user_id, USER);
  assert.equal(insertion.payload.trip_id, null);
});
test("failed post insertion cleans up uploaded photos", async () => {
  const scenario = setup({ resolve: () => ({ data: null, error: { code: "42P01", message: "missing table" } }) });
  const photo = new File([new Uint8Array([255, 216, 255])], "photo.jpg", { type: "image/jpeg" });
  assert.equal((await scenario.route("app/api/community/posts/route.ts").POST(postRequest({ photo }))).status, 503);
  assert.equal(scenario.uploads.length, 1);
  assert.deepEqual(scenario.removed, scenario.uploads);
});
test("likes are idempotent and use the current user's identity", async () => {
  const scenario = setup({ resolve: () => ({ data: { id: POST }, error: null }) });
  const route = scenario.route("app/api/community/posts/[postId]/like/route.ts");
  assert.equal((await route.POST(null, context)).status, 200);
  const write = scenario.operations.find((operation) => operation.method === "upsert");
  assert.equal(write.payload.user_id, USER);
  assert.equal(write.options.ignoreDuplicates, true);
  assert.equal(write.options.onConflict, "post_id,user_id");
  await route.DELETE(null, context);
  assert(scenario.operations.find((operation) => operation.method === "delete").filters.some(([key, value]) => key === "user_id" && value === USER));
});
test("another user's post cannot be deleted by a regular account", async () => {
  const scenario = setup({ resolve: () => ({ data: { id: POST, user_id: OTHER, image_paths: [] }, error: null }) });
  assert.equal((await scenario.route("app/api/community/posts/[postId]/route.ts").DELETE(null, context)).status, 404);
  assert(!scenario.operations.some((operation) => operation.method === "delete"));
});
test("admins can delete posts without deleting their attached itinerary", async () => {
  const scenario = setup({ admin: true, resolve: () => ({ data: { id: POST, user_id: OTHER, image_paths: [`${OTHER}/photo.jpg`] }, error: null }) });
  assert.equal((await scenario.route("app/api/community/posts/[postId]/route.ts").DELETE(null, context)).status, 200);
  assert(!scenario.operations.some((operation) => operation.table === "trips"));
  assert.equal(scenario.removed.length, 1);
});


test("trip owners cannot submit ratings or comments on their own trip", async () => {
  const scenario = setup({ resolve: () => ({ data: { id: TRIP, user_id: USER, is_public: true }, error: null }) });
  const request = new Request("http://localhost/api/trips/" + TRIP + "/comments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ rating: 5, message: "My own trip" }) });
  const response = await scenario.route("app/api/trips/[tripId]/comments/route.ts").POST(request, { params: Promise.resolve({ tripId: TRIP }) });
  assert.equal(response.status, 403);
  assert(!scenario.operations.some((operation) => operation.method === "insert" || operation.method === "upsert"));
});

test("trip descriptions are optional and limited independently of tags", () => {
  const preferences = { title: "Trip", states: ["Johor"], startTime: "", endTime: "", travellers: "Just me", style: "Relaxed", interests: ["Local food"] };
  assert.equal(schemas.tripPlanSchema.safeParse(preferences).success, true);
  assert.equal(schemas.tripPlanSchema.safeParse({ ...preferences, description: "A family weekend." }).success, true);
  assert.equal(schemas.tripPlanSchema.safeParse({ ...preferences, description: "x".repeat(2001) }).success, false);
});


test("trip status follows inclusive dates and Malaysia midnight", () => {
  const { getTripStatus, getMalaysiaDate } = load("lib/trip-status.ts");
  assert.equal(getTripStatus("2026-10-24", "2026-10-26", "2026-10-23"), "Planning");
  assert.equal(getTripStatus("2026-10-24", "2026-10-26", "2026-10-24"), "Ongoing");
  assert.equal(getTripStatus("2026-10-24", "2026-10-26", "2026-10-26"), "Ongoing");
  assert.equal(getTripStatus("2026-10-24", "2026-10-26", "2026-10-27"), "Completed");
  assert.equal(getTripStatus(null, null, "2026-10-24"), "Planning");
  assert.equal(getTripStatus("2026-10-24", null, "2026-10-25"), "Ongoing");
  assert.equal(getMalaysiaDate(new Date("2026-10-23T15:59:59Z")), "2026-10-23");
  assert.equal(getMalaysiaDate(new Date("2026-10-23T16:00:00Z")), "2026-10-24");
});
