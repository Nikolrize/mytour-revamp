import type { ManagedAccount } from "@/lib/type";
export type AccountRole = ManagedAccount["role"];

export function canEditAccount(
  actorId: string | undefined,
  actorRole: AccountRole | undefined,
  targetId: string,
  targetRole: AccountRole,
) {
  if (!actorId || (actorRole !== "admin" && actorRole !== "master_admin"))
    return false;
  if (actorId === targetId) return true;
  return (
    targetRole === "client" ||
    (actorRole === "master_admin" && targetRole === "admin")
  );
}
export function canManageAccount(
  actorId: string | undefined,
  actorRole: AccountRole | undefined,
  targetId: string,
  targetRole: AccountRole,
) {
  return (
    actorId !== targetId &&
    canEditAccount(actorId, actorRole, targetId, targetRole)
  );
}
