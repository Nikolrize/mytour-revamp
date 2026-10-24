"use client";

import { CommunityAuthor } from "@/components/community-author";
import { CommunityDelete } from "@/components/community-delete";
import { CommentsLoadingSkeleton } from "@/components/loading-skeletons";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCommunityComments } from "@/hooks/use-community";
import { useProfile } from "@/hooks/use-profile";
import { communityCommentSchema } from "@/lib/schemas";
import type {
  CommunityCommentsProps,
  CommunityCommentValues,
} from "@/lib/type";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useForm } from "react-hook-form";

export function CommunityComments({
  postId,
  signedIn,
}: CommunityCommentsProps) {
  const { query, create, remove } = useCommunityComments(postId);
  const { profileQuery } = useProfile();
  const canComment = profileQuery.data?.profile?.role === "client";
  const form = useForm<CommunityCommentValues>({
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
            aria-invalid={Boolean(form.formState.errors.content)}
            aria-describedby={
              form.formState.errors.content
                ? `comment-${postId}` + "-error"
                : undefined
            }
            id={`comment-${postId}`}
            {...form.register("content")}
            maxLength={1000}
            placeholder="Add to the conversation…"
            rows={2}
            disabled={create.isPending}
            className="rounded-xl"
          />
          {form.formState.errors.content && (
            <FieldError
              id={`comment-${postId}` + "-error"}
              role="alert"
              className="text-xs text-destructive"
            >
              {form.formState.errors.content.message}
            </FieldError>
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
            <FieldError role="alert" className="text-sm text-destructive">
              {create.error.message}
            </FieldError>
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
        <FieldError role="alert" className="text-sm text-destructive">
          {query.error.message}
        </FieldError>
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
