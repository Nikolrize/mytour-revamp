import { CommunityFeed } from "@/components/community-feed";
import { Badge } from "@/components/ui/badge";

export default function ManagePostsPage() {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <Badge
          variant="outline"
          className="w-fit rounded-full border-brand-line bg-white text-brand-blue"
        >
          Moderation
        </Badge>
        <h1 className="text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
          Community posts
        </h1>
        <p className="text-sm text-muted-foreground">
          Review travel stories, photos, and comments. Remove posts or comments
          that need moderation.
        </p>
      </header>
      <CommunityFeed moderation />
    </div>
  );
}
