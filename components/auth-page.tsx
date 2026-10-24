"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { createAuthFormSchema } from "@/lib/schemas";
import type { AuthPageProps, AuthValues } from "@/lib/type";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  UserRound,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";

export function AuthPage({ mode }: AuthPageProps) {
  const router = useRouter();
  const isSignup = mode === "signup";
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const form = useForm<AuthValues>({
    resolver: zodResolver(createAuthFormSchema(isSignup)),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      agreed: false,
    },
  });
  const authMutation = useAuth(mode, (redirectTo) => {
    router.replace(redirectTo);
    router.refresh();
  });
  const handleSubmit = form.handleSubmit((values) =>
    authMutation.mutate(values),
  );

  return (
    <div className="flex w-full items-center justify-center py-8 sm:py-12">
      <div className="grid w-full max-w-[1040px] overflow-hidden rounded-[30px] border border-brand-line bg-white shadow-[0_24px_80px_-45px_rgba(35,72,153,0.28)] lg:min-h-[78svh] lg:grid-cols-[0.95fr_1.05fr]">
        {/* Travel brand panel */}
        <section className="relative hidden flex-col justify-between overflow-hidden bg-brand-blue-deep p-9 text-white lg:flex xl:p-12">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=1400&q=85')",
            }}
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-black/50" aria-hidden="true" />
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
          </div>
          <div className="relative flex flex-col gap-5">
            <h1 className="max-w-md text-4xl font-medium leading-[1.08] tracking-[-0.06em] xl:text-5xl">
              The best stories start with{" "}
              <span className="text-brand-yellow">a place.</span>
            </h1>
            <p className="max-w-sm text-sm leading-6 text-white/75">
              Collect the little discoveries, local favourites, and routes
              you&apos;ll remember long after the trip.
            </p>
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
                      aria-invalid={Boolean(form.formState.errors.name)}
                      aria-describedby={
                        form.formState.errors.name
                          ? "full-name-error"
                          : undefined
                      }
                      id="full-name"
                      {...form.register("name")}
                      autoComplete="name"
                      required
                      placeholder="Your name"
                      className="h-11 rounded-xl border-brand-line pl-10"
                    />
                  </span>
                  {form.formState.errors.name && (
                    <FieldError
                      id={"full-name-error"}
                      className="text-xs text-destructive"
                    >
                      {form.formState.errors.name.message}
                    </FieldError>
                  )}
                </div>
              )}
              <div className="flex flex-col gap-2">
                <Label htmlFor="email">Email address</Label>
                <span className="relative">
                  <Mail className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    aria-invalid={Boolean(form.formState.errors.email)}
                    aria-describedby={
                      form.formState.errors.email ? "email-error" : undefined
                    }
                    id="email"
                    {...form.register("email")}
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="you@example.com"
                    className="h-11 rounded-xl border-brand-line pl-10"
                  />
                </span>
                {form.formState.errors.email && (
                  <FieldError
                    id={"email-error"}
                    className="text-xs text-destructive"
                  >
                    {form.formState.errors.email.message}
                  </FieldError>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="password">Password</Label>
                <span className="relative">
                  <LockKeyhole className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    aria-invalid={Boolean(form.formState.errors.password)}
                    aria-describedby={
                      form.formState.errors.password
                        ? "password-error"
                        : undefined
                    }
                    id="password"
                    {...form.register("password")}
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
                {form.formState.errors.password && (
                  <FieldError
                    id={"password-error"}
                    className="text-xs text-destructive"
                  >
                    {form.formState.errors.password.message}
                  </FieldError>
                )}
              </div>
              {isSignup && (
                <div className="flex flex-col gap-2">
                  <Label htmlFor="confirm-password">Confirm password</Label>
                  <span className="relative">
                    <LockKeyhole className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      aria-invalid={Boolean(
                        form.formState.errors.confirmPassword,
                      )}
                      aria-describedby={
                        form.formState.errors.confirmPassword
                          ? "confirm-password-error"
                          : undefined
                      }
                      id="confirm-password"
                      {...form.register("confirmPassword")}
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      minLength={8}
                      required
                      placeholder="Enter your password again"
                      className="h-11 rounded-xl border-brand-line pl-10"
                    />
                  </span>
                  {form.formState.errors.confirmPassword && (
                    <FieldError
                      id={"confirm-password-error"}
                      className="text-xs text-destructive"
                    >
                      {form.formState.errors.confirmPassword.message}
                    </FieldError>
                  )}
                </div>
              )}

              {isSignup ? (
                <div className="flex flex-col gap-1">
                  <label className="flex items-start gap-2.5 text-xs leading-5 text-muted-foreground">
                    <Controller
                      control={form.control}
                      name="agreed"
                      render={({ field }) => (
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={(checked) =>
                            field.onChange(checked === true)
                          }
                          className="mt-0.5"
                        />
                      )}
                    />
                    <span>
                      I agree to use MYTOUR respectfully and understand that my
                      account information will be used to provide the service.
                    </span>
                  </label>
                  {form.formState.errors.agreed && (
                    <FieldError className="text-xs text-destructive">
                      {form.formState.errors.agreed.message}
                    </FieldError>
                  )}
                </div>
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
                  <Link
                    href="/forgot-password"
                    className="text-xs text-brand-blue hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
              )}

              {authMutation.error && (
                <p
                  role="status"
                  aria-live="polite"
                  className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
                >
                  {authMutation.error.message}
                </p>
              )}
              <Button
                type="submit"
                disabled={authMutation.isPending}
                className="h-11 w-full rounded-xl bg-brand-blue text-white hover:bg-brand-blue-hover"
              >
                {authMutation.isPending
                  ? isSignup
                    ? "Creating account..."
                    : "Signing in..."
                  : isSignup
                    ? "Create account"
                    : "Sign in"}{" "}
                {!authMutation.isPending && <ArrowRight className="size-4" />}
              </Button>
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
