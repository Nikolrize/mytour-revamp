import type {
  AdminKind,
  AdminPageOptions,
  CommunityPageOptions,
  Coordinates,
  GeocodePlace,
  ManagedAccountPageOptions,
  ProfileActivityKind,
  TripPageOptions,
} from "@/lib/type";

// Prefixes let a mutation refresh every cached page of the affected collection.
export const queryKeys = {
  profile: ["profile"] as const,
  states: ["states"] as const,
  trips: {
    all: ["trips"] as const,
    page: (
      scope: NonNullable<TripPageOptions["scope"]>,
      filters: Omit<TripPageOptions, "scope">,
    ) => ["trips", scope, filters] as const,
  },
  tripDetails: {
    all: ["trip"] as const,
    detail: (id: string) => ["trip", id] as const,
  },
  tripStops: {
    all: ["trip-stops"] as const,
    detail: (id: string) => ["trip-stops", id] as const,
  },
  tripSaves: {
    all: ["trip-save-status"] as const,
    detail: (id: string) => ["trip-save-status", id] as const,
  },
  tripComments: {
    all: ["trip-comments"] as const,
    forTrip: (id: string) => ["trip-comments", id] as const,
    page: (id: string, page: number) => ["trip-comments", id, page] as const,
  },
  publicProfiles: {
    all: ["public-profile"] as const,
    page: (
      id: string,
      kind: Exclude<ProfileActivityKind, "recent">,
      page: number,
    ) => ["public-profile", id, { kind, page }] as const,
  },
  communityPosts: {
    all: ["community-posts"] as const,
    page: (options: CommunityPageOptions) =>
      ["community-posts", options] as const,
  },
  communityComments: {
    all: ["community-comments"] as const,
    forPost: (id: string) => ["community-comments", id] as const,
  },
  admin: {
    all: ["admin"] as const,
    overview: ["admin", "overview"] as const,
    records: (kind: AdminKind) => ["admin", kind] as const,
    page: (kind: AdminKind, options: AdminPageOptions) =>
      ["admin", kind, options] as const,
    users: (options: ManagedAccountPageOptions) =>
      ["admin", "users", options] as const,
    passwordRequests: ["admin", "password-requests"] as const,
    passwordRequestPage: (page: number, filters: Record<string, string>) =>
      ["admin", "password-requests", page, filters] as const,
    reportDetails: ["admin", "report-detail"] as const,
    report: (targetType: "trip" | "post", id: string) =>
      ["admin", "report-detail", targetType, id] as const,
    accounts: ["admin-account"] as const,
    account: (id: string) => ["admin-account", id] as const,
  },
  maps: {
    places: (places: readonly GeocodePlace[]) =>
      ["map-places", places] as const,
    route: (coordinates: readonly Coordinates[]) =>
      ["map-route", coordinates] as const,
  },
};
