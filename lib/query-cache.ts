import { queryKeys } from "@/lib/query-keys";
import type { QueryClient, QueryKey } from "@tanstack/react-query";

export async function invalidateQueryKeys(
  client: QueryClient,
  keys: readonly QueryKey[],
) {
  await Promise.all(
    keys.map((queryKey) => client.invalidateQueries({ queryKey })),
  );
}

export function refreshTripQueries(client: QueryClient, tripId?: string) {
  return invalidateQueryKeys(client, [
    queryKeys.trips.all,
    tripId ? queryKeys.tripDetails.detail(tripId) : queryKeys.tripDetails.all,
    queryKeys.publicProfiles.all,
    queryKeys.communityPosts.all,
    queryKeys.admin.all,
  ]);
}

export async function refreshTripStops(client: QueryClient, tripId: string) {
  await Promise.all([
    refreshTripQueries(client, tripId),
    invalidateQueryKeys(client, [queryKeys.tripStops.detail(tripId)]),
  ]);
}

export function refreshCommunityQueries(client: QueryClient, postId?: string) {
  return invalidateQueryKeys(client, [
    queryKeys.communityPosts.all,
    queryKeys.publicProfiles.all,
    queryKeys.admin.overview,
    queryKeys.admin.records("reports"),
    ...(postId ? [queryKeys.communityComments.forPost(postId)] : []),
  ]);
}

export function refreshModerationQueries(client: QueryClient) {
  return invalidateQueryKeys(client, [
    queryKeys.admin.records("reports"),
    queryKeys.admin.reportDetails,
    queryKeys.admin.overview,
  ]);
}

export function refreshProfileQueries(client: QueryClient) {
  return invalidateQueryKeys(client, [
    queryKeys.publicProfiles.all,
    queryKeys.trips.all,
    queryKeys.tripDetails.all,
    queryKeys.tripComments.all,
    queryKeys.communityPosts.all,
    queryKeys.communityComments.all,
    queryKeys.admin.all,
    queryKeys.admin.accounts,
  ]);
}

export async function refreshAccountQueries(client: QueryClient) {
  await Promise.all([
    refreshProfileQueries(client),
    invalidateQueryKeys(client, [queryKeys.profile]),
  ]);
}

// Remove data for a deleted trip, including cached reviews and save state.
export function removeTripQueries(client: QueryClient, tripId: string) {
  for (const queryKey of [
    queryKeys.tripDetails.detail(tripId),
    queryKeys.tripStops.detail(tripId),
    queryKeys.tripComments.forTrip(tripId),
    queryKeys.tripSaves.detail(tripId),
  ]) {
    client.removeQueries({ queryKey });
  }
}
