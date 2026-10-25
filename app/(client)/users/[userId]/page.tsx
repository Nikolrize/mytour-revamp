"use client";

import { ChangePasswordDialog } from "@/components/change-password-dialog";
import { ProfileLoadingSkeleton } from "@/components/loading-skeletons";
import { ProfileActivity } from "@/components/profile-activity";
import { ProfileStats } from "@/components/profile-stats";
import { TravellerProfileCard } from "@/components/traveller-profile-card";
import { Button } from "@/components/ui/button";
import { usePublicProfile } from "@/hooks/use-public-profile";
import type { PublicProfileContentProps } from "@/lib/type";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Suspense, useState } from "react";

function PublicProfileContent({ userId }: PublicProfileContentProps) {
  const [kind, setKind] = useState<"trips" | "posts">("trips");
  const [page, setPage] = useState(1);
  const query = usePublicProfile(userId, kind, page);
  // Keep the profile header mounted while fetching another activity page.
  const [identity, setIdentity] = useState(query.data);

  if (query.data && identity !== query.data) setIdentity(query.data);
  if (query.isPending && !identity) return <ProfileLoadingSkeleton />;
  const data = query.data ?? identity;

  if (!data)
    return (
      <div className="flex flex-col items-start gap-4 py-12">
        <h1 className="text-2xl font-semibold">
          Traveller profile unavailable
        </h1>
        <p role="alert" className="text-sm text-muted-foreground">
          {query.error?.message ?? "This profile could not be found."}
        </p>
        <Button nativeButton={false} render={<Link href="/community" />}>
          Visit Community
        </Button>
      </div>
    );

  const profile = data.profile;
  return (
    <div className="flex w-full flex-col gap-8 py-10 sm:py-14">
      <Link
        href="/community"
        className="flex w-fit items-center gap-2 text-sm text-brand-blue"
      >
        <ArrowLeft className="size-4" />
        Community
      </Link>
      {/* Public profiles contain only shared activity and public identity fields. */}
      <TravellerProfileCard
        name={profile.display_name}
        avatar={profile.avatar_url}
        bio={profile.bio}
        createdAt={profile.created_at}
        action={
          data.isOwnProfile && (
            <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto">
              <Button
                nativeButton={false}
                render={<Link href="/profile" />}
                variant="outline"
                className="rounded-full"
              >
                Edit profile
              </Button>
              <ChangePasswordDialog />
            </div>
          )
        }
      >
        <ProfileStats
          items={[
            { label: "Shared itineraries", value: data.counts.trips },
            { label: "Community posts", value: data.counts.posts },
          ]}
        />
      </TravellerProfileCard>
      <ProfileActivity
        kind={kind}
        onKindChange={(value) => {
          if (value !== "recent") {
            setKind(value);
            setPage(1);
          }
        }}
        page={page}
        onPageChange={setPage}
        data={query.data}
        pending={query.isPending}
        fetching={query.isFetching}
        error={query.error}
      />
    </div>
  );
}

function TravellerProfile() {
  const { userId } = useParams<{ userId: string }>();
  return <PublicProfileContent key={userId} userId={userId} />;
}

export default function UserProfilePage() {
  return (
    <Suspense fallback={<ProfileLoadingSkeleton />}>
      <TravellerProfile />
    </Suspense>
  );
}
