"use client";

import { HomeItineraryPreview } from "@/components/home-itinerary-preview";
import { NewPlanMenu } from "@/components/new-plan-menu";

import Link from "next/link";
import { ExploreTrips } from "@/components/explore-trips";
import { ArrowDownRight, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex w-full flex-col gap-10 bg-background py-6 text-foreground sm:gap-12 sm:py-8 lg:gap-14">
      <section id="top" className="relative w-full">
        <div className="relative min-h-[48svh] overflow-hidden rounded-[30px] bg-brand-blue-deep sm:min-h-[52svh] lg:min-h-[56svh]">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=2200&q=90')",
            }}
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-black/50" aria-hidden="true" />

          <div className="relative flex min-h-[48svh] flex-col justify-center gap-5 px-6 py-8 text-white sm:min-h-[52svh] sm:px-12 lg:min-h-[56svh] lg:px-[7.5%]">
            <h1 className="max-w-[720px] text-4xl sm:text-5xl lg:text-6xl xl:text-7xl leading-[0.94] font-medium tracking-[-0.075em]">
              Find your own
              <br />
              way through{" "}
              <span className="font-normal text-brand-yellow">Malaysia.</span>
            </h1>
            <p className="max-w-[430px] text-[15px] leading-7 text-white/75 sm:text-base">
              Big adventures, tiny food spots, and everything in between. Build
              a trip that feels like yours.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                nativeButton={false}
                render={<Link href="/plan" />}
                className="h-12 rounded-full bg-brand-yellow px-6 text-sm font-semibold text-foreground shadow-lg shadow-black/10 hover:bg-brand-yellow-hover"
              >
                <Sparkles className="size-4" /> Plan with AI
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  document
                    .getElementById("discover")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="h-12 rounded-full border-white/35 bg-white/10 px-6 text-sm text-white backdrop-blur-sm hover:bg-white/20 hover:text-white"
              >
                Explore trips <ArrowDownRight className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Available published trips share the same browser as Explore. */}
      <section
        id="discover"
        className="flex w-full scroll-mt-28 flex-col gap-5 sm:gap-6"
      >
        <div className="flex flex-col gap-3">
          <p className="text-[11px] font-semibold tracking-[0.18em] text-brand-red uppercase">
            A good place to begin
          </p>
          <h2 className="text-4xl leading-tight font-medium tracking-[-0.06em] sm:text-5xl">
            Where to next?
          </h2>
          <p className="text-sm leading-6 text-muted-foreground">
            Discover available trips shared by travellers. Find a route you love
            and make it your own.
          </p>
        </div>
        <ExploreTrips embedded maxItems={6} />
      </section>

      <section id="how-it-works" className="w-full">
        <div className="grid gap-4 rounded-[28px] bg-brand-blue-soft p-6 sm:p-8 lg:grid-cols-[1fr_1.1fr] lg:items-center lg:p-10">
          <div className="flex max-w-md flex-col items-start gap-4">
            <p className="text-[11px] font-semibold tracking-[0.18em] text-brand-red uppercase">
              A little help, a lot of possibility
            </p>
            <h2 className="text-3xl leading-tight font-medium tracking-[-0.055em] sm:text-4xl">
              Less planning tabs.
              <br />
              More <span className="text-brand-red">“we&apos;re here.”</span>
            </h2>
            <p className="text-sm leading-6 text-muted-foreground">
              Start with a rough idea. Shape it into a day-by-day trip, move
              stops around, and see how it all connects.
            </p>
            <NewPlanMenu
              label="Make my itinerary"
              className="h-11 rounded-full bg-brand-blue px-5 hover:bg-brand-blue-hover"
            />
          </div>
          <HomeItineraryPreview />
        </div>
      </section>

      {/* Community invitation */}
      <section className="flex w-full flex-col items-start gap-4 rounded-3xl bg-brand-blue-soft p-6 sm:p-8">
        <h2 className="text-2xl font-medium tracking-tight">
          Every trip has a story.
        </h2>
        <p className="max-w-xl text-sm leading-6 text-muted-foreground">
          See where other travellers have been, share your favourite photos, and
          swap local tips.
        </p>
        <Button
          nativeButton={false}
          render={<Link href="/community" />}
          className="rounded-full bg-brand-blue text-white hover:bg-brand-blue-hover"
        >
          Visit Community <ArrowRight className="size-4" />
        </Button>
      </section>
    </div>
  );
}
