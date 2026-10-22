"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  MapPin,
  UserRound,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type AuthPageProps = { mode: "login" | "signup" };

export function AuthPage({ mode }: AuthPageProps) {
  const isSignup = mode === "signup";
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [agreed, setAgreed] = useState(false);
  const [notice, setNotice] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    if (isSignup && form.get("password") !== form.get("confirm-password")) {
      setNotice("Those passwords don't match yet. Please check and try again.");
      return;
    }
    if (isSignup && !agreed) {
      setNotice("Please agree to the terms to continue.");
      return;
    }
    setNotice(
      "The sign-in service will be connected when authentication is added.",
    );
  }

  return (
    <div className="flex w-full items-center justify-center py-8 sm:py-12">
      <div className="grid w-full max-w-[1040px] overflow-hidden rounded-[30px] border border-brand-line bg-white shadow-[0_24px_80px_-45px_rgba(35,72,153,0.28)] lg:min-h-[78svh] lg:grid-cols-[0.95fr_1.05fr]">
        {/* Travel brand panel */}
        <section className="relative hidden flex-col justify-between overflow-hidden bg-brand-blue-deep p-9 text-white lg:flex xl:p-12">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-70"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=1400&q=85')",
            }}
            aria-hidden="true"
          />
          <div
            className="absolute inset-0 bg-gradient-to-b from-brand-blue-deep/85 via-brand-blue-deep/45 to-brand-blue-deep/90"
            aria-hidden="true"
          />
          <div className="relative flex flex-col gap-8">
            <Link
              href="/"
              className="w-fit rounded-xl bg-white px-3 py-2"
              aria-label="MYTOUR home"
            >
              <Image
                src="/mytour-logo.png"
                alt="MYTOUR"
                width={660}
                height={203}
                className="h-8 w-auto"
              />
            </Link>
            <Badge className="w-fit rounded-full border border-white/25 bg-white/10 px-3 py-1 text-white backdrop-blur hover:bg-white/10">
              <MapPin className="size-3.5" /> MADE FOR MALAYSIA
            </Badge>
          </div>
          <div className="relative flex flex-col gap-5">
            <h1 className="max-w-md text-4xl font-medium leading-[1.08] tracking-[-0.06em] xl:text-5xl">
              The best stories start with{" "}
              <span className="text-brand-yellow">
                a place.
              </span>
            </h1>
            <p className="max-w-sm text-sm leading-6 text-white/75">
              Collect the little discoveries, local favourites, and routes
              you'll remember long after the trip.
            </p>
            <div className="flex items-center gap-3 border-t border-white/20 pt-5">
              <div className="flex -space-x-2">
                {[
                  "photo-1534528741775-53994a69daeb",
                  "photo-1500648767791-00dcc994a43e",
                  "photo-1531123897727-8f129e1688ce",
                ].map((photo) => (
                  <span
                    key={photo}
                    className="size-8 rounded-full border-2 border-brand-blue-deep bg-cover bg-center"
                    style={{
                      backgroundImage: `url(https://images.unsplash.com/${photo}?auto=format&fit=crop&w=80&q=75)`,
                    }}
                    aria-hidden="true"
                  />
                ))}
              </div>
              <p className="text-xs text-white/75">
                <strong className="text-white">
                  Made for curious travellers
                </strong>
                <br />
                One thoughtful trip at a time.
              </p>
            </div>
          </div>
        </section>

        {/* Sign-in and account creation form */}
        <section className="flex flex-col justify-center p-5 sm:p-9 lg:p-10 xl:p-14">
          <div className="mx-auto flex w-full max-w-[430px] flex-col gap-7">
            <div className="flex flex-col gap-3">
              <Link
                href="/"
                className="w-fit rounded-lg bg-white px-2 py-1 lg:hidden"
                aria-label="MYTOUR home"
              >
                <Image
                  src="/mytour-logo.png"
                  alt="MYTOUR"
                  width={660}
                  height={203}
                  className="h-8 w-auto"
                />
              </Link>
              <Badge
                variant="outline"
                className="w-fit rounded-full border-brand-line bg-brand-surface-muted px-3 py-1 text-brand-blue"
              >
                {isSignup
                  ? "A little more Malaysia awaits"
                  : "Welcome back, traveller"}
              </Badge>
              <div className="flex flex-col gap-2">
                <h2 className="text-3xl font-medium tracking-[-0.055em] sm:text-4xl">
                  {isSignup ? "Create your account" : "Good to see you again."}
                </h2>
                <p className="text-sm leading-6 text-muted-foreground">
                  {isSignup
                    ? "Save your itineraries and share the places you love."
                    : "Sign in to pick up right where your next trip begins."}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {isSignup && (
                <div className="flex flex-col gap-2">
                  <Label htmlFor="full-name">Full name</Label>
                  <span className="relative">
                    <UserRound className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="full-name"
                      name="name"
                      autoComplete="name"
                      required
                      placeholder="Your name"
                      className="h-11 rounded-xl border-brand-line pl-10"
                    />
                  </span>
                </div>
              )}
              <div className="flex flex-col gap-2">
                <Label htmlFor="email">Email address</Label>
                <span className="relative">
                  <Mail className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="you@example.com"
                    className="h-11 rounded-xl border-brand-line pl-10"
                  />
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="password">Password</Label>
                <span className="relative">
                  <LockKeyhole className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete={
                      isSignup ? "new-password" : "current-password"
                    }
                    minLength={8}
                    required
                    placeholder={
                      isSignup ? "At least 8 characters" : "Enter your password"
                    }
                    className="h-11 rounded-xl border-brand-line pr-11 pl-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowPassword((visible) => !visible)}
                    className="absolute top-1/2 right-1.5 size-8 -translate-y-1/2 rounded-lg text-muted-foreground hover:bg-brand-surface-muted"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </Button>
                </span>
              </div>
              {isSignup && (
                <div className="flex flex-col gap-2">
                  <Label htmlFor="confirm-password">Confirm password</Label>
                  <span className="relative">
                    <LockKeyhole className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="confirm-password"
                      name="confirm-password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      minLength={8}
                      required
                      placeholder="Enter your password again"
                      className="h-11 rounded-xl border-brand-line pl-10"
                    />
                  </span>
                </div>
              )}

              {isSignup ? (
                <label className="flex items-start gap-2.5 text-xs leading-5 text-muted-foreground">
                  <Checkbox
                    checked={agreed}
                    onCheckedChange={(checked) => setAgreed(checked === true)}
                    className="mt-0.5"
                  />
                  <span>
                    I agree to use MYTOUR respectfully and understand that
                    account features will be available once sign-up is
                    connected.
                  </span>
                </label>
              ) : (
                <div className="flex items-center justify-between gap-3">
                  <label className="flex items-center gap-2.5 text-xs text-muted-foreground">
                    <Checkbox
                      checked={remember}
                      onCheckedChange={(checked) =>
                        setRemember(checked === true)
                      }
                    />{" "}
                    Remember me
                  </label>
                  <span className="text-xs text-brand-blue">
                    Forgot password?
                  </span>
                </div>
              )}

              {notice && (
                <p
                  role="status"
                  className="rounded-xl border border-brand-blue-soft bg-brand-blue-soft px-3 py-2.5 text-sm text-brand-blue"
                >
                  {notice}
                </p>
              )}
              <Button
                type="submit"
                className="h-11 w-full rounded-xl bg-brand-blue text-white hover:bg-brand-blue-hover"
              >
                {isSignup ? "Create account" : "Sign in"}{" "}
                <ArrowRight className="size-4" />
              </Button>
              <p className="text-center text-xs leading-5 text-muted-foreground">
                {isSignup
                  ? "This creates the account interface only; sign-up will work once authentication is connected."
                  : "Sign-in is a visual preview until authentication is connected."}
              </p>
            </form>

            <p className="text-center text-sm text-muted-foreground">
              {isSignup ? "Already have an account?" : "New to MYTOUR?"}{" "}
              <Link
                href={isSignup ? "/login" : "/signup"}
                className="font-semibold text-brand-blue hover:underline"
              >
                {isSignup ? "Sign in" : "Create an account"}
              </Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
