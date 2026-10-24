"use client";

import { LoadingBlock } from "@/components/loading-skeletons";
import { NewPlanMenu } from "@/components/new-plan-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FieldError } from "@/components/ui/field";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { useSignOut } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-profile";
import { LayoutDashboard, LogOut, Menu, UserRound } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const navigation = [
  { label: "Home", href: "/" },
  { label: "Explore", href: "/explore" },
  { label: "Community", href: "/community" },
  { label: "My trips", href: "/trips" },
];

export function SiteHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const signOut = useSignOut(() => {
    router.replace("/");
    router.refresh();
  });
  const { profileQuery } = useProfile();
  const profile = profileQuery.data?.profile;
  const isAdmin = profile?.role === "admin" || profile?.role === "master_admin";
  const visibleNavigation = navigation.filter(
    (item) => item.href !== "/trips" || (Boolean(profile) && !isAdmin),
  );
  const initials = (profile?.display_name || "Traveller")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-brand-line bg-background/95 shadow-sm backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between px-[4vw] py-5 sm:px-[3.5vw] lg:px-[3.3vw]">
        {/* Brand and main navigation */}
        <Link href="/" className="flex items-center" aria-label="MYTOUR home">
          <Image
            src="/mytour-logo.png"
            alt="MYTOUR"
            width={660}
            height={203}
            priority
            className="h-10 w-auto"
          />
        </Link>
        <nav
          className="hidden items-center gap-5 lg:gap-8 text-[13px] font-medium text-muted-foreground md:flex"
          aria-label="Main navigation"
        >
          {visibleNavigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={pathname === item.href ? "page" : undefined}
              className={`transition-colors hover:text-brand-blue ${pathname === item.href ? "text-brand-blue" : ""}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Account access shared across desktop and mobile */}
        <div className="flex items-center gap-3">
          {profile ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                aria-label="Open account menu"
                title={profile.display_name}
                disabled={signOut.isPending}
                className="rounded-full outline-none ring-offset-background transition-shadow hover:ring-2 hover:ring-brand-blue/30 focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2"
              >
                <Avatar size="lg">
                  {profile.avatar_url && (
                    <AvatarImage src={profile.avatar_url} alt="" />
                  )}
                  <AvatarFallback className="bg-brand-blue-soft font-semibold text-brand-blue">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                sideOffset={8}
                className="min-w-44"
              >
                <DropdownMenuItem
                  render={<Link href={isAdmin ? "/admin" : "/profile"} />}
                >
                  {isAdmin ? (
                    <LayoutDashboard className="size-4" />
                  ) : (
                    <UserRound className="size-4" />
                  )}{" "}
                  {isAdmin ? "Dashboard" : "Profile"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  disabled={signOut.isPending}
                  onClick={() => signOut.mutate()}
                >
                  <LogOut className="size-4" />{" "}
                  {signOut.isPending ? "Signing out…" : "Sign out"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : profileQuery.isPending ? (
            <LoadingBlock label="Loading account">
              <Skeleton className="size-10 rounded-full" />
            </LoadingBlock>
          ) : (
            <Button
              nativeButton={false}
              render={<Link href="/login" />}
              variant="ghost"
              className="hidden h-10 rounded-full px-4 text-brand-blue hover:bg-brand-blue-soft md:inline-flex"
            >
              Log in
            </Button>
          )}
          <NewPlanMenu className="hidden h-10 rounded-full bg-brand-blue px-5 text-white shadow-sm hover:bg-brand-blue-hover md:inline-flex" />

          {/* Mobile navigation */}
          <Sheet>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-10 rounded-full md:hidden"
                  aria-label="Open navigation"
                >
                  <Menu className="size-5" />
                </Button>
              }
            />
            <SheetContent
              side="right"
              className="border-brand-line bg-background p-0"
            >
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2 text-brand-blue-deep">
                  <Image
                    src="/mytour-logo.png"
                    alt="MYTOUR"
                    width={660}
                    height={203}
                    className="h-8 w-auto"
                  />
                </SheetTitle>
                <SheetDescription>
                  Find your own way through Malaysia.
                </SheetDescription>
              </SheetHeader>
              <nav
                className="flex flex-col gap-1 px-4"
                aria-label="Mobile navigation"
              >
                {visibleNavigation.map((item) => (
                  <SheetClose
                    nativeButton={false}
                    key={item.href}
                    render={
                      <Link
                        href={item.href}
                        className="rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-brand-surface-muted hover:text-foreground"
                      >
                        {item.label}
                      </Link>
                    }
                  />
                ))}
                {!profile && !profileQuery.isPending && (
                  <SheetClose
                    nativeButton={false}
                    render={
                      <Link
                        href="/login"
                        className="rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-brand-surface-muted"
                      >
                        Log in
                      </Link>
                    }
                  />
                )}
              </nav>
              <div className="p-4">
                <NewPlanMenu className="h-11 w-full rounded-xl bg-brand-blue text-white hover:bg-brand-blue-hover" />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
      {signOut.error && (
        <FieldError
          role="alert"
          className="px-[4vw] pb-3 text-right text-sm text-destructive"
        >
          {signOut.error.message}
        </FieldError>
      )}
    </header>
  );
}
