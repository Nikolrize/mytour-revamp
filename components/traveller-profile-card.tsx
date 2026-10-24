import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import type { TravellerProfileCardProps } from "@/lib/type";
import { getInitials } from "@/lib/utils";
import { CalendarDays } from "lucide-react";

// Shared identity layout for personal and public traveller profiles.
export function TravellerProfileCard({
  name,
  avatar,
  bio,
  createdAt,
  action,
  children,
}: TravellerProfileCardProps) {
  return (
    <Card className="rounded-3xl border-brand-line bg-white shadow-sm">
      <CardContent className="flex flex-col gap-6 p-6 sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <Avatar className="size-36 shrink-0 sm:size-48">
            <AvatarImage src={avatar ?? undefined} alt={name} />
            <AvatarFallback className="bg-brand-yellow-soft text-4xl text-brand-red-deep">
              {getInitials(name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-1 flex-col gap-3">
            <h1 className="break-words text-3xl font-semibold tracking-tight">
              {name}
            </h1>
            <p className="flex items-center gap-2 text-xs text-muted-foreground">
              <CalendarDays className="size-4" />
              Member since{" "}
              {new Date(createdAt).toLocaleDateString("en-MY", {
                month: "long",
                year: "numeric",
                timeZone: "Asia/Kuala_Lumpur",
              })}
            </p>
            {bio && (
              <p className="whitespace-pre-wrap break-words text-sm leading-6 text-muted-foreground">
                {bio}
              </p>
            )}
            {children}
          </div>
          {action}
        </div>
      </CardContent>
    </Card>
  );
}
