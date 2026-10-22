"use client";

import { useState, type FormEvent } from "react";
import { MessageCircle, Send, Star } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { tripComments } from "@/lib/data";
import { getInitials } from "@/lib/utils";
import type { TripComment } from "@/lib/type";

type TripCommentsProps = { tripSlug: string };

export function TripComments({ tripSlug }: TripCommentsProps) {
  const [comments, setComments] = useState(tripComments[tripSlug] ?? []);
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState(5);
  const [notice, setNotice] = useState("");

  function addComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const newComment: TripComment = {
      id: `${tripSlug}-${Date.now()}`,
      author: "You",
      date: "Just now",
      rating,
      message: message.trim(),
    };
    setComments((current) => [newComment, ...current]);
    setMessage("");
    setNotice("Your comment has been added to this preview.");
  }

  return (
    <section
      className="flex w-full flex-col gap-5"
      aria-labelledby="trip-comments-heading"
    >
      {/* Community comments and rating summary */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <MessageCircle className="size-5 text-brand-blue" />
          <h2
            id="trip-comments-heading"
            className="text-2xl font-medium tracking-tight"
          >
            Traveller comments
          </h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Share how this route went or ask the community a question.
        </p>
      </div>

      {/* Comment form */}
      <Card className="rounded-[22px] border-brand-line bg-white shadow-none">
        <CardContent className="p-5 sm:p-6">
          <form onSubmit={addComment} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label>Your rating</Label>
              <div
                className="flex items-center gap-1"
                role="radiogroup"
                aria-label="Your rating"
              >
                {Array.from({ length: 5 }, (_, index) => {
                  const value = index + 1;
                  return (
                    <Button
                      key={value}
                      type="button"
                      variant="ghost"
                      size="icon"
                      role="radio"
                      aria-checked={rating === value}
                      aria-label={`${value} ${value === 1 ? "star" : "stars"}`}
                      onClick={() => setRating(value)}
                      className="size-9 rounded-full text-brand-yellow hover:bg-brand-yellow-soft hover:text-brand-yellow"
                    >
                      <Star
                        className={`size-5 ${value <= rating ? "fill-current" : ""}`}
                      />
                    </Button>
                  );
                })}
                <span className="ml-2 text-xs text-muted-foreground">
                  {rating} out of 5
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="trip-comment">Your comment</Label>
              <Textarea
                id="trip-comment"
                value={message}
                onChange={(event) => {
                  setMessage(event.target.value);
                  setNotice("");
                }}
                placeholder="What should other travellers know about this route?"
                maxLength={500}
                required
                rows={3}
                className="rounded-xl border-brand-line px-3"
              />
              <span className="text-right text-xs text-muted-foreground">
                {message.length}/500
              </span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground" role="status">
                {notice}
              </p>
              <Button
                type="submit"
                disabled={!message.trim()}
                className="h-10 shrink-0 rounded-full bg-brand-blue px-4 text-white hover:bg-brand-blue-hover"
              >
                <Send className="size-4" /> Post comment
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Existing community comments */}
      <div className="flex flex-col gap-3">
        {comments.map((comment) => (
          <Card
            key={comment.id}
            className="rounded-[20px] border-brand-line bg-white shadow-none"
          >
            <CardContent className="flex gap-3 p-4 sm:p-5">
              <Avatar className="size-10 shrink-0">
                <AvatarFallback className="bg-brand-blue-soft text-xs font-semibold text-brand-blue">
                  {getInitials(comment.author)}
                </AvatarFallback>
              </Avatar>
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">
                      {comment.author}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      · {comment.date}
                    </span>
                  </div>
                  <span className="flex items-center gap-1 text-xs font-medium text-brand-red">
                    <Star className="size-3.5 fill-current" /> {comment.rating}
                    .0
                  </span>
                </div>
                <p className="text-sm leading-6 text-muted-foreground">
                  {comment.message}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
        {!comments.length && (
          <p className="rounded-xl border border-dashed border-brand-line p-6 text-center text-sm text-muted-foreground">
            No comments yet. Be the first to share your experience.
          </p>
        )}
      </div>
    </section>
  );
}
