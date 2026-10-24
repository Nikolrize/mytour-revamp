import { AuthorProfileLink } from "@/components/author-profile-link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { CommunityAuthorProps } from "@/lib/type";
import { getInitials } from "@/lib/utils";

export function CommunityAuthor({ author, createdAt }: CommunityAuthorProps) {
  return (
    <AuthorProfileLink
      authorId={author.id}
      className="flex min-w-0 items-center gap-3 rounded-lg hover:text-brand-blue focus-visible:outline-2 focus-visible:outline-brand-blue"
    >
      <Avatar size="lg">
        {author.avatarUrl && <AvatarImage src={author.avatarUrl} alt="" />}
        <AvatarFallback className="bg-brand-blue-soft text-brand-blue">
          {getInitials(author.name)}
        </AvatarFallback>
      </Avatar>
      <div className="flex min-w-0 flex-col gap-0.5">
        <p className="truncate text-sm font-semibold">{author.name}</p>
        {createdAt && (
          <time dateTime={createdAt} className="text-xs text-muted-foreground">
            {new Date(createdAt).toLocaleString("en-MY", {
              timeZone: "Asia/Kuala_Lumpur",
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </time>
        )}
      </div>
    </AuthorProfileLink>
  );
}
