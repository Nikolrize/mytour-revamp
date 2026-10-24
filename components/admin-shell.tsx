"use client";

import Image from "next/image";
import Link from "next/link";
import { useProfile } from "@/hooks/use-profile";
import { getInitials } from "@/lib/utils";
import { useSignOut } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import {
  LogOut,
  LayoutDashboard,
  Map,
  MessageSquareText,
  Users,
  Flag,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const links = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Manage users", href: "/admin/users", icon: Users },
  { label: "Manage trips", href: "/admin/trips", icon: Map },
  { label: "Community posts", href: "/admin/posts", icon: MessageSquareText },
  { label: "Reports", href: "/admin/reports", icon: Flag },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { profileQuery } = useProfile();
  const profile = profileQuery.data?.profile;
  const router = useRouter();
  const signOut = useSignOut(() => {
    router.replace("/login");
    router.refresh();
  });

  return (
    <SidebarProvider defaultOpen>
      {/* Admin navigation using the shared shadcn Sidebar */}
      <Sidebar collapsible="icon" className="border-brand-line">
        <SidebarHeader className="gap-4 border-b border-brand-line p-4">
          <div className="flex items-center justify-between gap-3 group-data-[collapsible=icon]:justify-center">
            <Link
              href="/admin"
              aria-label="MYTOUR admin dashboard"
              className="min-w-0 group-data-[collapsible=icon]:hidden"
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
              variant="secondary"
              className="rounded-full bg-brand-blue-soft text-brand-blue"
            >
              Admin
            </Badge>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Workspace</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {links.map(({ label, href, icon: Icon }) => {
                  const active =
                    pathname === href ||
                    (href !== "/admin" && pathname.startsWith(`${href}/`));
                  return (
                    <SidebarMenuItem key={href}>
                      <SidebarMenuButton
                        render={
                          <Link
                            href={href}
                            aria-current={active ? "page" : undefined}
                          />
                        }
                        isActive={active}
                        tooltip={label}
                        className="h-10 rounded-xl px-3 text-sm"
                      >
                        <Icon />
                        <span>{label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="border-t border-brand-line p-3 group-data-[collapsible=icon]:p-2">
          <div className="flex min-w-0 items-center gap-3 rounded-xl bg-brand-surface-muted p-2.5 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand-blue text-xs font-semibold text-white group-data-[collapsible=icon]:size-8">
              {getInitials(profile?.display_name || "Admin")}
            </span>
            <span className="min-w-0 group-data-[collapsible=icon]:hidden">
              <span className="block truncate text-sm font-semibold">
                {profile?.display_name || "Admin"}
              </span>
              <span className="block text-xs text-muted-foreground">
                {profile?.role === "master_admin" ? "Master admin" : "Admin"}
              </span>
            </span>
          </div>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip={signOut.isPending ? "Signing out…" : "Sign out"}
                aria-label={signOut.isPending ? "Signing out…" : "Sign out"}
                disabled={signOut.isPending}
                onClick={() => signOut.mutate()}
                className="rounded-xl"
              >
                <LogOut />
                <span>{signOut.isPending ? "Signing out…" : "Sign out"}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
          {signOut.error && (
            <p role="alert" className="text-xs text-destructive">
              {signOut.error.message}
            </p>
          )}
        </SidebarFooter>
      </Sidebar>

      {/* Admin workspace */}
      <SidebarInset className="min-w-0 min-h-screen bg-brand-surface-muted">
        <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-brand-line bg-white px-4 py-3 sm:px-8">
          <div className="flex items-center gap-3">
            <SidebarTrigger className="rounded-lg" />
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                MYTOUR / Admin
              </p>
              <p className="text-sm font-semibold">Management workspace</p>
            </div>
          </div>
          <Link
            href="/"
            className="text-sm font-medium text-brand-blue hover:underline"
          >
            Visit client homepage ↗
          </Link>
        </header>
        <main className="mx-auto flex min-w-0 w-full max-w-[1480px] flex-col gap-6 px-[4vw] py-[3vh] sm:gap-8 sm:px-[3vw] sm:py-[4vh]">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
