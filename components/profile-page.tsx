"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Check,
  MapPin,
  Pencil,
  Route,
  Share2,
  Sparkles,
} from "lucide-react";
import { ItineraryCard } from "@/components/itinerary-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { currentProfile, myTrips } from "@/lib/data";
import type { TravelerProfile } from "@/lib/type";

const interestOptions = [
  "Local food",
  "Culture",
  "Nature",
  "Beaches",
  "Slow travel",
  "City breaks",
  "Hidden gems",
];

export function ProfilePage() {
  const [profile, setProfile] = useState(currentProfile);
  const [draft, setDraft] = useState(currentProfile);
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);

  function updateDraft<Key extends keyof TravelerProfile>(
    key: Key,
    value: TravelerProfile[Key],
  ) {
    setDraft((current) => ({ ...current, [key]: value }));
    setSaved(false);
  }

  function toggleInterest(interest: string) {
    const interests = draft.interests.includes(interest)
      ? draft.interests.filter((item) => item !== interest)
      : [...draft.interests, interest];
    updateDraft("interests", interests);
  }

  function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setProfile(draft);
    setEditing(false);
    setSaved(true);
  }

  function cancelEdit() {
    setDraft(profile);
    setEditing(false);
  }

  const initials = profile.name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="flex w-full flex-col gap-8 py-10 sm:gap-10 sm:py-14">
      {/* Profile page heading */}
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div className="flex flex-col gap-2">
          <Badge
            variant="outline"
            className="w-fit rounded-full border-brand-line bg-white px-3 py-1 text-brand-blue"
          >
            Your MYTOUR space
          </Badge>
          <h1 className="text-4xl font-medium tracking-[-0.06em] sm:text-5xl">
            Your{" "}
            <span className="font-serif italic text-brand-red">profile.</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            Keep your travel story and favourite trips in one place.
          </p>
        </div>
        {!editing && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="h-10 rounded-full border-brand-line bg-white px-4"
              onClick={() => {
                setDraft(profile);
                setEditing(true);
                setSaved(false);
              }}
            >
              <Pencil className="size-4" /> Edit profile
            </Button>
            <Button
              nativeButton={false}
              render={<Link href="/trips" />}
              className="h-10 rounded-full bg-brand-blue px-4 text-white hover:bg-brand-blue-hover"
            >
              My trips <ArrowRight className="size-4" />
            </Button>
          </div>
        )}
      </header>

      {/* Profile identity card */}
      <Card className="overflow-hidden rounded-[26px] border-brand-line bg-white p-0 shadow-sm">
        <div className="relative h-40 bg-brand-blue-soft sm:h-52">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url('${profile.coverImage}')` }}
            aria-hidden="true"
          />
          <div
            className="absolute inset-0 bg-gradient-to-r from-brand-blue-deep/50 to-transparent"
            aria-hidden="true"
          />
          <Badge className="absolute right-5 bottom-4 rounded-full border border-white/25 bg-white/15 text-white backdrop-blur hover:bg-white/15">
            <Sparkles className="size-3.5" /> Travel profile preview
          </Badge>
        </div>
        <CardContent className="flex flex-col justify-between gap-5 p-5 sm:flex-row sm:items-end sm:p-7">
          <div className="flex items-center gap-4">
            <Avatar
              size="lg"
              className="size-20 border-4 border-white ring-2 ring-brand-blue-soft"
            >
              <AvatarImage src={profile.avatar} alt={profile.name} />
              <AvatarFallback className="bg-brand-yellow-soft text-xl font-semibold text-brand-red-deep">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-1">
              <h2 className="text-2xl font-semibold tracking-tight">
                {profile.name}
              </h2>
              <p className="text-sm text-muted-foreground">
                @{profile.username}
              </p>
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="size-3.5" /> {profile.location}
              </p>
            </div>
          </div>
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <CalendarDays className="size-4" /> Member since {profile.joined}
          </p>
        </CardContent>
      </Card>

      {saved && (
        <p
          role="status"
          className="flex items-center gap-2 rounded-xl border border-brand-blue-soft bg-brand-blue-soft px-4 py-3 text-sm text-brand-blue"
        >
          <Check className="size-4" /> Profile changes saved for this preview.
        </p>
      )}

      {/* Editable profile information */}
      {editing ? (
        <Card className="rounded-[24px] border-brand-line bg-white shadow-sm">
          <CardContent className="p-5 sm:p-7">
            <form onSubmit={handleSave} className="flex flex-col gap-6">
              <div className="flex flex-col gap-1">
                <h2 className="text-xl font-semibold tracking-tight">
                  Edit your profile
                </h2>
                <p className="text-sm text-muted-foreground">
                  Add the details you want other travellers to see.
                </p>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="profile-name">Name</Label>
                  <Input
                    id="profile-name"
                    value={draft.name}
                    onChange={(event) =>
                      updateDraft("name", event.target.value)
                    }
                    maxLength={60}
                    required
                    className="h-11 rounded-xl border-brand-line px-3"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="profile-username">Username</Label>
                  <Input
                    id="profile-username"
                    value={draft.username}
                    onChange={(event) =>
                      updateDraft(
                        "username",
                        event.target.value.replace(/[^a-zA-Z0-9_]/g, ""),
                      )
                    }
                    maxLength={24}
                    required
                    className="h-11 rounded-xl border-brand-line px-3"
                  />
                </div>
                <div className="flex flex-col gap-2 sm:col-span-2">
                  <Label htmlFor="profile-location">Location</Label>
                  <Input
                    id="profile-location"
                    value={draft.location}
                    onChange={(event) =>
                      updateDraft("location", event.target.value)
                    }
                    maxLength={80}
                    className="h-11 rounded-xl border-brand-line px-3"
                    placeholder="City, country"
                  />
                </div>
                <div className="flex flex-col gap-2 sm:col-span-2">
                  <Label htmlFor="profile-bio">A little about you</Label>
                  <Textarea
                    id="profile-bio"
                    value={draft.bio}
                    onChange={(event) => updateDraft("bio", event.target.value)}
                    maxLength={240}
                    rows={3}
                    className="rounded-xl border-brand-line px-3"
                    placeholder="What do you love about travelling?"
                  />
                  <p className="text-right text-xs text-muted-foreground">
                    {draft.bio.length}/240
                  </p>
                </div>
              </div>
              <fieldset className="flex flex-col gap-3">
                <legend className="text-sm font-medium">
                  Travel interests
                </legend>
                <div className="flex flex-wrap gap-2">
                  {interestOptions.map((interest) => {
                    const selected = draft.interests.includes(interest);
                    return (
                      <Button
                        key={interest}
                        type="button"
                        variant={selected ? "secondary" : "outline"}
                        aria-pressed={selected}
                        onClick={() => toggleInterest(interest)}
                        className={`h-9 rounded-full px-4 text-xs ${selected ? "bg-brand-blue-soft text-brand-blue hover:bg-brand-blue-soft" : "border-brand-line text-muted-foreground"}`}
                      >
                        {interest}
                      </Button>
                    );
                  })}
                </div>
              </fieldset>
              <div className="flex flex-col-reverse gap-2 border-t border-brand-line pt-5 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={cancelEdit}
                  className="h-10 rounded-full border-brand-line bg-white px-5"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="h-10 rounded-full bg-brand-blue px-5 text-white hover:bg-brand-blue-hover"
                >
                  <Check className="size-4" /> Save profile
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <div className="grid items-start gap-6 lg:grid-cols-[1fr_340px]">
          {/* About and travel interests */}
          <div className="flex flex-col gap-6">
            <Card className="rounded-[24px] border-brand-line bg-white shadow-sm">
              <CardContent className="flex flex-col gap-5 p-5 sm:p-7">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <h2 className="text-lg font-semibold">A little about me</h2>
                    <p className="text-sm leading-6 text-muted-foreground">
                      {profile.bio}
                    </p>
                  </div>
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-blue-soft text-brand-blue">
                    <UserRoundIcon />
                  </span>
                </div>
                <div className="flex flex-col gap-2 border-t border-brand-line pt-4">
                  <p className="text-xs font-medium text-muted-foreground">
                    Travel interests
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {profile.interests.map((interest) => (
                      <Badge
                        key={interest}
                        variant="secondary"
                        className="rounded-full bg-brand-blue-soft px-3 py-1 text-brand-blue"
                      >
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
            <section className="flex flex-col gap-4" aria-label="Recent trips">
              <div className="flex items-end justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <h2 className="text-xl font-semibold tracking-tight">
                    Recent trips
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    A few routes from your travel notebook.
                  </p>
                </div>
                <Link
                  href="/trips"
                  className="flex shrink-0 items-center gap-1 text-sm font-medium text-brand-blue hover:underline"
                >
                  See all <ArrowRight className="size-4" />
                </Link>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {myTrips.slice(0, 2).map((trip) => (
                  <ItineraryCard
                    key={trip.slug}
                    itinerary={trip}
                    showAuthor={false}
                  />
                ))}
              </div>
            </section>
          </div>

          {/* Traveller stats and profile links */}
          <aside className="flex flex-col gap-4 lg:sticky lg:top-6">
            <Card className="rounded-[24px] border-brand-line bg-white shadow-sm">
              <CardContent className="flex flex-col gap-5 p-5">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold">Travel so far</h2>
                  <Route className="size-4 text-brand-blue" />
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="flex flex-col gap-1 rounded-xl bg-brand-surface-muted p-3">
                    <span className="text-xl font-semibold">
                      {profile.tripsPlanned}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      trips
                    </span>
                  </div>
                  <div className="flex flex-col gap-1 rounded-xl bg-brand-surface-muted p-3">
                    <span className="text-xl font-semibold">
                      {profile.tripsShared}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      shared
                    </span>
                  </div>
                  <div className="flex flex-col gap-1 rounded-xl bg-brand-surface-muted p-3">
                    <span className="text-xl font-semibold">
                      {profile.placesExplored}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      places
                    </span>
                  </div>
                </div>
                <Button
                  nativeButton={false}
                  render={<Link href="/community" />}
                  variant="outline"
                  className="h-10 rounded-full border-brand-line bg-white text-brand-blue"
                >
                  Explore community <ArrowRight className="size-4" />
                </Button>
              </CardContent>
            </Card>
            <Card className="rounded-[24px] border-0 bg-brand-blue-soft shadow-none">
              <CardContent className="flex flex-col gap-3 p-5">
                <span className="grid size-10 place-items-center rounded-xl bg-white text-brand-blue">
                  <Share2 className="size-4" />
                </span>
                <h2 className="font-semibold">Your next story is waiting</h2>
                <p className="text-sm leading-6 text-muted-foreground">
                  Turn a rough idea into a route you’ll want to remember.
                </p>
                <Button
                  nativeButton={false}
                  render={<Link href="/plan" />}
                  className="h-10 w-fit rounded-full bg-brand-blue px-4 text-white hover:bg-brand-blue-hover"
                >
                  Plan a trip <ArrowRight className="size-4" />
                </Button>
              </CardContent>
            </Card>
          </aside>
        </div>
      )}
    </div>
  );
}

function UserRoundIcon() {
  return (
    <span className="text-sm font-semibold">
      {currentProfile.name
        .split(" ")
        .map((part) => part[0])
        .join("")}
    </span>
  );
}
