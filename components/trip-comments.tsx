"use client";

import { AuthorProfileLink } from "@/components/author-profile-link";
import { ItineraryPagination } from "@/components/itinerary-pagination";
import { CommentsLoadingSkeleton } from "@/components/loading-skeletons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FieldError } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { useTripComments } from "@/hooks/use-comments";
import { useProfile } from "@/hooks/use-profile";
import { commentSchema } from "@/lib/schemas";
import type { CommentValues, TripCommentsProps } from "@/lib/type";
import { getInitials } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { formatDistanceToNow } from "date-fns";
import { MessageCircle, Send, Star } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";

export function TripComments({
  tripSlug,
  canReview = true,
}: TripCommentsProps) {
  const { profileQuery } = useProfile();
  const signedIn = Boolean(profileQuery.data?.profile);
  const [page, setPage] = useState(1);
  const { commentsQuery, postComment } = useTripComments(tripSlug, page);
  const form = useForm<CommentValues>({
    resolver: zodResolver(commentSchema),
    defaultValues: { rating: 5, message: "" },
  });
  const rating = useWatch({ control: form.control, name: "rating" }) ?? 5;
  const message = useWatch({ control: form.control, name: "message" }) ?? "";
  // Reset the editor after a successful post.
  useEffect(() => {
    if (postComment.isSuccess) form.reset({ rating: 5, message: "" });
  }, [postComment.isSuccess, form]);
  const comments = commentsQuery.data?.comments ?? [];
  const notice =
    postComment.error?.message ||
    (postComment.isSuccess
      ? "Your comment has been posted."
      : commentsQuery.error?.message || "");

  return (
    <section
      className="flex w-full flex-col gap-5"
      aria-labelledby="trip-comments-heading"
    >
      {/* Community comments and rating summary */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <MessageCircle className="size-5 text-brand-blue" />
          <h2 id="trip-comments-heading" className="font-semibold">
            Traveller comments
          </h2>
        </div>
        <p className="text-sm text-muted-foreground">
          {canReview
            ? "Share how this route went or ask the community a question."
            : "Read feedback from other travellers about this itinerary."}
        </p>
      </div>

      {canReview && !signedIn && !profileQuery.isPending && (
        <Button
          nativeButton={false}
          render={<Link href="/login" />}
          variant="outline"
          className="w-fit rounded-full"
        >
          Log in to rate or comment
        </Button>
      )}
      {/* Comment form */}
      {canReview && signedIn && (
        <Card className="rounded-[22px] border-brand-line bg-white shadow-none">
          <CardContent className="p-5 sm:p-6">
            <form
              onSubmit={form.handleSubmit((values) =>
                postComment.mutate(values, { onSuccess: () => setPage(1) }),
              )}
              className="flex flex-col gap-4"
            >
              <div className="flex flex-col gap-2">
                <p id="trip-rating-label" className="text-sm font-medium">
                  Your rating
                </p>
                <RadioGroup
                  value={String(rating)}
                  onValueChange={(value) =>
                    form.setValue("rating", Number(value), {
                      shouldValidate: true,
                      shouldDirty: true,
                    })
                  }
                  aria-labelledby="trip-rating-label"
                  aria-invalid={Boolean(form.formState.errors.rating)}
                  aria-describedby={
                    form.formState.errors.rating
                      ? "trip-rating-error"
                      : undefined
                  }
                  className="flex flex-wrap items-center gap-1"
                >
                  {Array.from({ length: 5 }, (_, index) => {
                    const value = index + 1;
                    const id = `trip-rating-${tripSlug}-${value}`;
                    return (
                      <div key={value} className="relative">
                        <RadioGroupItem
                          id={id}
                          value={String(value)}
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor={id}
                          className="grid size-9 cursor-pointer place-items-center rounded-full text-brand-yellow hover:bg-brand-yellow-soft peer-focus-visible:outline-2 peer-focus-visible:outline-brand-blue"
                        >
                          <Star
                            aria-hidden="true"
                            className={`size-5 ${value <= rating ? "fill-current" : ""}`}
                          />
                          <span className="sr-only">
                            {value} {value === 1 ? "star" : "stars"}
                          </span>
                        </Label>
                      </div>
                    );
                  })}
                  <span className="text-xs text-muted-foreground">
                    {rating} out of 5
                  </span>
                </RadioGroup>
                {form.formState.errors.rating && (
                  <FieldError
                    id="trip-rating-error"
                    className="text-xs text-destructive"
                  >
                    {form.formState.errors.rating.message}
                  </FieldError>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="trip-comment">Your comment</Label>
                <Textarea
                  aria-invalid={Boolean(form.formState.errors.message)}
                  aria-describedby={
                    form.formState.errors.message
                      ? "trip-comment-error"
                      : undefined
                  }
                  id="trip-comment"
                  {...form.register("message")}
                  placeholder="What should other travellers know about this route?"
                  maxLength={500}
                  required
                  rows={3}
                  className="rounded-xl border-brand-line px-3"
                />
                <span className="text-right text-xs text-muted-foreground">
                  {message.length}/500
                </span>
                {form.formState.errors.message && (
                  <FieldError
                    id={"trip-comment-error"}
                    className="text-xs text-destructive"
                  >
                    {form.formState.errors.message.message}
                  </FieldError>
                )}
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-muted-foreground" role="status">
                  {notice}
                </p>
                <Button
                  type="submit"
                  disabled={postComment.isPending}
                  className="h-10 shrink-0 rounded-full bg-brand-blue px-4 text-white hover:bg-brand-blue-hover"
                >
                  <Send className="size-4" />{" "}
                  {postComment.isPending ? "Posting…" : "Post comment"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Existing community comments */}
      <div className="flex flex-col gap-3">
        {commentsQuery.isPending && <CommentsLoadingSkeleton />}
        {commentsQuery.error && (
          <FieldError role="alert" className="text-sm text-destructive">
            {commentsQuery.error.message}
          </FieldError>
        )}
        {!commentsQuery.isPending &&
          comments.map((comment) => (
            <Card
              key={comment.id}
              className="rounded-[20px] border-brand-line bg-white shadow-none"
            >
              <CardContent className="flex gap-3 p-4 sm:p-5">
                <Avatar className="size-10 shrink-0">
                  {comment.authorAvatar && (
                    <AvatarImage
                      src={comment.authorAvatar}
                      alt={comment.author}
                    />
                  )}
                  <AvatarFallback className="bg-brand-blue-soft text-xs font-semibold text-brand-blue">
                    {getInitials(comment.author)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <AuthorProfileLink
                        authorId={comment.authorId}
                        className="text-sm font-semibold hover:text-brand-blue"
                      >
                        {comment.author}
                      </AuthorProfileLink>
                      <span className="text-xs text-muted-foreground">
                        ·{" "}
                        {Number.isNaN(Date.parse(comment.date))
                          ? comment.date
                          : formatDistanceToNow(new Date(comment.date), {
                              addSuffix: true,
                            })}
                      </span>
                    </div>
                    {comment.rating > 0 && (
                      <span className="flex items-center gap-1 text-xs font-medium text-brand-red">
                        <Star className="size-3.5 fill-current" />{" "}
                        {comment.rating}.0
                      </span>
                    )}
                  </div>
                  <p className="text-sm leading-6 break-words text-muted-foreground">
                    {comment.message}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        {!commentsQuery.isPending &&
          !commentsQuery.error &&
          !comments.length && (
            <p className="rounded-xl border border-dashed border-brand-line p-6 text-center text-sm text-muted-foreground">
              {canReview
                ? "No comments yet. Be the first to share your experience."
                : "No feedback from other travellers yet."}
            </p>
          )}
      </div>
      <ItineraryPagination
        label="Trip comment pages"
        page={commentsQuery.data?.page ?? page}
        totalPages={commentsQuery.data?.totalPages ?? 1}
        busy={commentsQuery.isFetching}
        onPageChange={setPage}
      />
    </section>
  );
}
