import { CommunityFeed } from "@/components/community-feed";
import { Badge } from "@/components/ui/badge";

export default function CommunityPage() {
  return (
    <div className="flex w-full flex-col gap-6 py-8 sm:gap-8 sm:py-10">
      {/* Community is a social feed; shared itinerary discovery lives in Explore. */}
      <header className="flex w-full flex-col gap-3">
        <Badge
          variant="outline"
          className="w-fit rounded-full border-brand-line bg-white text-brand-blue"
        >
          Stories from the road
        </Badge>
        <h1 className="text-4xl font-medium tracking-[-0.06em] sm:text-6xl">
          A little more <span className="text-brand-red">community.</span>
        </h1>
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
          Share your Malaysian adventures, favourite photos, and the itineraries
          that made them happen.
        </p>
      </header>
      <CommunityFeed />
    </div>
  );
}
