"use client";

import { Suspense } from "react";
import { useParams } from "next/navigation";
import { PublicProfilePage } from "@/components/public-profile-page";
import { ProfileLoadingSkeleton } from "@/components/loading-skeletons";

function TravellerProfile() {
  const { userId } = useParams<{ userId: string }>();
  return <PublicProfilePage key={userId} userId={userId} />;
}
export default function UserProfilePage() {
  return <Suspense fallback={<ProfileLoadingSkeleton />}><TravellerProfile /></Suspense>;
}
