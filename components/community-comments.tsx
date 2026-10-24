"use client";

import { CommentsLoadingSkeleton } from "@/components/loading-skeletons";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { communityCommentSchema } from "@/lib/schemas";
import { useProfile } from "@/hooks/use-profile";
import { useCommunityComments } from "@/hooks/use-community";
import { CommunityAuthor } from "@/components/community-author";
import { CommunityDelete } from "@/components/community-delete";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export function CommunityComments({
  postId,
  signedIn,
}: {
  postId: string;
  signedIn: boolean;
}) {
  const { query, create, remove } = useCommunityComments(postId);
  const { profileQuery } = useProfile();
  const canComment = profileQuery.data?.profile.role === "client";
  const form = useForm<z.infer<typeof communityCommentSchema>>({
    resolver: zodResolver(communityCommentSchema),
    defaultValues: { content: "" },
  });
  const comments = [
    ...new Map(
      (query.data?.pages.flatMap((page) => page.comments) ?? []).map(
        (comment) => [comment.id, comment],
      ),
    ).values(),
  ];
  return (
    <section
      className="flex flex-col gap-4 border-t border-brand-line pt-4"
      aria-label="Post comments"
    >
      {signedIn && canComment ? (
        <form
          className="flex flex-col gap-2"
          onSubmit={form.handleSubmit(({ content }) =>
            create.mutate(content, { onSuccess: () => form.reset() }),
          )}
        >
          <Label htmlFor={`comment-${postId}`} className="sr-only">
            Add a comment
          </Label>
          <Textarea
            id={`comment-${postId}`}
            {...form.register("content")}
            maxLength={1000}
            placeholder="Add to the conversation…"
            rows={2}
            disabled={create.isPending}
            className="rounded-xl"
          />
          {form.formState.errors.content && (
            <p role="alert" className="text-xs text-destructive">
              {form.formState.errors.content.message}
            </p>
          )}
          <Button
            type="submit"
            size="sm"
            disabled={create.isPending}
            className="w-fit rounded-full bg-brand-blue text-white hover:bg-brand-blue-hover"
          >
            {create.isPending ? "Posting…" : "Post comment"}
          </Button>
          {create.error && (
            <p role="alert" className="text-sm text-destructive">
              {create.error.message}
            </p>
          )}
        </form>
      ) : signedIn ? null : (
        <p className="text-sm text-muted-foreground">
          <Link href="/login" className="text-brand-blue hover:underline">
            Sign in
          </Link>{" "}
          to comment.
        </p>
      )}
      {query.isPending && <CommentsLoadingSkeleton />}
      {query.error && (
        <p role="alert" className="text-sm text-destructive">
          {query.error.message}
        </p>
      )}
      {!query.isPending && !query.error && !comments.length && (
        <p className="text-sm text-muted-foreground">No comments yet.</p>
      )}
      {comments.map((comment) => (
        <div
          key={comment.id}
          className="flex flex-col gap-2 rounded-2xl bg-brand-surface-muted p-4"
        >
          <div className="flex items-start justify-between gap-3">
            <CommunityAuthor
              author={comment.author}
              createdAt={comment.createdAt}
            />
            {comment.canDelete && (
              <CommunityDelete
                kind="comment"
                pending={remove.isPending}
                error={remove.error?.message}
                onConfirm={() => remove.mutateAsync(comment.id)}
              />
            )}
          </div>
          <p className="whitespace-pre-wrap break-words text-sm leading-6">
            {comment.content}
          </p>
        </div>
      ))}
      {query.hasNextPage && (
        <Button
          variant="outline"
          size="sm"
          disabled={query.isFetchingNextPage}
          onClick={() => query.fetchNextPage()}
          className="w-fit rounded-full"
        >
          {query.isFetchingNextPage ? "Loading…" : "Load older comments"}
        </Button>
      )}
    </section>
  );
}
