import { connection } from "next/server";
import { stateImages } from "@/lib/data";
import { getTripStatus, getMalaysiaDate } from "@/lib/trip-status";
import { getTripInterests } from "@/lib/trip-interests";
import { differenceInCalendarDays } from "date-fns";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import type { Itinerary } from "@/lib/type";

export type TripRow = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  cover_image_url: string | null;
  start_date: string | null;
  end_date: string | null;
  start_time: string | null;
  end_time: string | null;
  status: string;
  interests?: string[];
  is_public: boolean;
  created_at: string;
  updated_at: string;
};

export async function getApiContext() {
  // Authenticated account checks must run for a real request, not during prerendering.
  await connection();
  const supabase = createClient(await cookies());
  const { data, error } = await supabase.auth.getUser();
  if (data.user) {
    const account = await supabase
      .from("users")
      .select("status")
      .eq("id", data.user.id)
      .maybeSingle();
    if (account.error || account.data?.status === "inactive")
      return {
        supabase,
        user: null,
        authError: account.error || new Error("Account is inactive."),
      };
  }
  return { supabase, user: data.user, authError: error };
}

export async function userIsAdmin(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
) {
  const { data, error } = await supabase
    .from("users")
    .select("role, status")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw new Error("Account role lookup: " + error.message);
  return (
    (data?.role === "admin" || data?.role === "master_admin") &&
    data?.status === "active"
  );
}

export async function removeIncompleteTrip(
  supabase: Awaited<ReturnType<typeof createClient>>,
  tripId: string,
  userId: string,
) {
  await supabase.from("itinerary_stops").delete().eq("trip_id", tripId);
  await supabase.from("trip_states").delete().eq("trip_id", tripId);
  await supabase.from("trips").delete().eq("id", tripId).eq("user_id", userId);
}

export async function mapTripsToItineraries(
  supabase: Awaited<ReturnType<typeof createClient>>,
  trips: TripRow[],
): Promise<Itinerary[]> {
  if (!trips.length) return [];

  const tripIds = trips.map((trip) => trip.id);
  const authorIds = [...new Set(trips.map((trip) => trip.user_id))];
  const [stopResult, stateLinkResult, profileResult, ratingResult, saveResult] =
    await Promise.all([
      supabase
        .from("itinerary_stops")
        .select("*")
        .in("trip_id", tripIds)
        .order("position"),
      supabase
        .from("trip_states")
        .select("trip_id, state_id")
        .in("trip_id", tripIds),
      supabase
        .from("users")
        .select("id, display_name, avatar_url")
        .in("id", authorIds),
      supabase
        .from("trip_ratings")
        .select("trip_id, user_id, rating")
        .in("trip_id", tripIds),
      supabase.rpc("get_public_trip_save_counts", { _trip_ids: tripIds }),
    ]);

  if (stopResult.error)
    throw new Error(
      "Could not load itinerary stops: " + stopResult.error.message,
    );
  if (stateLinkResult.error)
    throw new Error(
      "Could not load trip states: " + stateLinkResult.error.message,
    );
  if (profileResult.error)
    throw new Error(
      "Could not load trip authors: " + profileResult.error.message,
    );
  if (ratingResult.error)
    throw new Error(
      "Could not load trip ratings: " + ratingResult.error.message,
    );
  // Trip pages remain available if this optional aggregate RPC has not been
  // installed in Supabase yet. Save counts show as zero until it is migrated.
  const missingSaveCountFunction =
    saveResult.error?.code === "PGRST202" || saveResult.error?.code === "42883";
  if (saveResult.error && !missingSaveCountFunction)
    throw new Error(saveResult.error.message);

  const destinationIds = [
    ...new Set(
      (stopResult.data ?? []).flatMap((stop) =>
        stop.destination_id ? [stop.destination_id] : [],
      ),
    ),
  ];
  const stateIds = [
    ...new Set((stateLinkResult.data ?? []).map((link) => link.state_id)),
  ];
  const [destinationResult, stateResult] = await Promise.all([
    destinationIds.length
      ? supabase
          .from("destinations")
          .select("id, name, category, address, image_url")
          .in("id", destinationIds)
      : Promise.resolve({ data: [], error: null }),
    stateIds.length
      ? supabase.from("states").select("id, name").in("id", stateIds)
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (destinationResult.error)
    throw new Error(
      "Could not load destinations: " + destinationResult.error.message,
    );
  if (stateResult.error)
    throw new Error("Could not load states: " + stateResult.error.message);

  const stopsByTrip = new Map<string, typeof stopResult.data>();
  for (const stop of stopResult.data ?? []) {
    const group = stopsByTrip.get(stop.trip_id) ?? [];
    group.push(stop);
    stopsByTrip.set(stop.trip_id, group);
  }

  const statesById = new Map(
    (stateResult.data ?? []).map((state) => [state.id, state.name]),
  );
  const destinationsById = new Map(
    (destinationResult.data ?? []).map((destination) => [
      destination.id,
      destination,
    ]),
  );
  const statesByTrip = new Map<string, string[]>();
  for (const link of stateLinkResult.data ?? []) {
    const stateName = statesById.get(link.state_id);
    if (!stateName) continue;
    const names = statesByTrip.get(link.trip_id) ?? [];
    names.push(stateName);
    statesByTrip.set(link.trip_id, names);
  }

  const authors = new Map(
    (profileResult.data ?? []).map((profile) => [
      profile.id,
      profile.display_name,
    ]),
  );
  const ratingsByTrip = new Map<string, number[]>();
  const owners = new Map(trips.map((trip) => [trip.id, trip.user_id]));
  for (const row of ratingResult.data ?? []) {
    if (row.user_id === owners.get(row.trip_id)) continue;
    const ratings = ratingsByTrip.get(row.trip_id) ?? [];
    ratings.push(row.rating);
    ratingsByTrip.set(row.trip_id, ratings);
  }
  const savesByTrip = new Map<string, number>(
    (saveResult.data ?? []).map(
      (row: { trip_id: string; save_count: number | string }) => [
        row.trip_id,
        Number(row.save_count),
      ],
    ),
  );

  const today = getMalaysiaDate(new Date());
  return trips.map((trip) => {
    const rawStops = [...(stopsByTrip.get(trip.id) ?? [])].sort((a, b) => {
      const byDate = (a.stop_date ?? "").localeCompare(b.stop_date ?? "");
      return (
        (a.day_number ?? 1) - (b.day_number ?? 1) ||
        byDate ||
        a.position - b.position
      );
    });
    const stateNames = statesByTrip.get(trip.id) ?? [];
    const start = trip.start_date
      ? new Date(trip.start_date + "T00:00:00")
      : null;
    const end = trip.end_date ? new Date(trip.end_date + "T00:00:00") : null;
    const stopDays = [
      ...new Set(rawStops.map((stop) => stop.stop_date).filter(Boolean)),
    ];
    const dayCount =
      start && end
        ? Math.max(1, differenceInCalendarDays(end, start) + 1)
        : Math.max(
            1,
            stopDays.length,
            ...rawStops.map((stop) => stop.day_number || 1),
          );
    const mappedStops = rawStops.map((stop, index) => {
      const destination = stop.destination_id
        ? destinationsById.get(stop.destination_id)
        : undefined;
      const stopDate = stop.stop_date
        ? new Date(stop.stop_date + "T00:00:00")
        : null;
      const day =
        stop.day_number ||
        (stopDate && start
          ? Math.max(1, differenceInCalendarDays(stopDate, start) + 1)
          : index + 1);
      const time = stop.start_time
        ? formatTime(stop.start_time)
        : "Time flexible";
      return {
        day,
        time,
        place: stop.title,
        area: destination?.address || stateNames[0] || "Malaysia",
        note: stop.description || stop.notes || "",
        id: String(stop.id),
        latitude: stop.latitude,
        longitude: stop.longitude,
        startTime: stop.start_time,
        endTime: stop.end_time,
      };
    });
    const ratings = ratingsByTrip.get(trip.id) ?? [];
    const average = ratings.length
      ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
      : 0;

    return {
      slug: trip.id,
      title: trip.title,
      author: authors.get(trip.user_id) || "Traveller",
      authorId: trip.user_id,
      authorAvatar:
        profileResult.data?.find((profile) => profile.id === trip.user_id)
          ?.avatar_url ?? null,
      location: stateNames.join(", ") || "Malaysia",
      days: dayCount + (dayCount === 1 ? " day" : " days"),
      category:
        rawStops
          .map((stop) =>
            stop.destination_id
              ? destinationsById.get(stop.destination_id)?.category
              : null,
          )
          .find(Boolean) || "Malaysia trip",
      rating: average.toFixed(1),
      saves: savesByTrip.get(trip.id) ?? 0,
      image:
        trip.cover_image_url ||
        rawStops
          .map((stop) =>
            stop.destination_id
              ? destinationsById.get(stop.destination_id)?.image_url
              : null,
          )
          .find(Boolean) ||
        stateImages[stateNames[0]] ||
        stateImages["Kuala Lumpur"],
      note: trip.description || "",
      description: trip.description || "",
      interests: getTripInterests(trip.interests, trip.description),
      isPublic: trip.is_public,
      status: getTripStatus(trip.start_date, trip.end_date, today),
      stops: mappedStops,
    } satisfies Itinerary;
  });
}

function formatTime(time: string) {
  const [hourText, minuteText] = time.split(":");
  const hour = Number(hourText);
  const minute = minuteText ?? "00";
  return (hour % 12 || 12) + ":" + minute + " " + (hour < 12 ? "AM" : "PM");
}
