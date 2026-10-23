import { Suspense } from "react";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin-shell";
import { getApiContext, userIsAdmin } from "@/app/api/_shared";

async function AdminAccess({ children }: { children: React.ReactNode }) {
  const { supabase, user } = await getApiContext();
  if (!user) redirect("/login");
  if (!(await userIsAdmin(supabase, user.id))) redirect("/trips");
  return <AdminShell>{children}</AdminShell>;
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <p className="p-6 text-sm text-muted-foreground">
          Loading admin workspace…
        </p>
      }
    >
      <AdminAccess>{children}</AdminAccess>
    </Suspense>
  );
}
