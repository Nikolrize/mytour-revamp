"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type {
  CommunityPostPhotosProps,
  CommunityPostTextProps,
} from "@/lib/type";
import Image from "next/image";
import { useState } from "react";

export function CommunityPostText({ content }: CommunityPostTextProps) {
  const [expanded, setExpanded] = useState(false);
  const preview = content.split("\n").slice(0, 4).join("\n").slice(0, 300);
  const truncated = preview.length < content.length;
  return (
    <div className="flex min-w-0 flex-col items-start gap-1">
      <p className="whitespace-pre-wrap break-words text-sm leading-7">
        {expanded ? content : preview}
        {!expanded && truncated ? "…" : ""}
      </p>
      {truncated && (
        <Button
          variant="link"
          size="sm"
          aria-expanded={expanded}
          onClick={() => setExpanded((value) => !value)}
          className="h-auto px-0 text-brand-blue"
        >
          {expanded ? "See less" : "See more"}
        </Button>
      )}
    </div>
  );
}

export function CommunityPostPhotos({
  images,
  author,
}: CommunityPostPhotosProps) {
  const [active, setActive] = useState<number | null>(null);
  const visible = images.slice(0, 4);
  return (
    <>
      <div
        className={
          "grid w-full max-w-3xl gap-2 overflow-hidden rounded-2xl " +
          (visible.length === 1 ? "grid-cols-1" : "grid-cols-2")
        }
      >
        {visible.map((src, index) => {
          const remaining = index === 3 ? images.length - 4 : 0;
          return (
            <button
              key={src + index}
              type="button"
              onClick={() => setActive(index)}
              className="relative min-w-0 overflow-hidden rounded-xl focus-visible:outline-2 focus-visible:outline-brand-blue"
              aria-label={
                remaining > 0
                  ? "View " + remaining + " more photos"
                  : "Open photo " + (index + 1)
              }
            >
              <Image
                src={src}
                alt={"Travel photo " + (index + 1) + " by " + author}
                width={800}
                height={600}
                unoptimized
                className={
                  "w-full object-cover " +
                  (visible.length === 1
                    ? "h-[32svh] max-h-80"
                    : "h-[18svh] max-h-40")
                }
              />
              {remaining > 0 && (
                <span className="absolute inset-0 grid place-items-center bg-black/50 text-3xl font-semibold text-white">
                  +{remaining}
                </span>
              )}
            </button>
          );
        })}
      </div>
      <Dialog
        open={active !== null}
        onOpenChange={(open) => {
          if (!open) setActive(null);
        }}
      >
        <DialogContent className="max-w-[92vw] sm:max-w-[75vw]">
          <DialogHeader>
            <DialogTitle>Photos by {author}</DialogTitle>
            <DialogDescription>
              Photo {(active ?? 0) + 1} of {images.length}
            </DialogDescription>
          </DialogHeader>
          {active !== null && (
            <Image
              src={images[active]}
              alt={"Travel photo " + (active + 1) + " by " + author}
              width={1600}
              height={1200}
              unoptimized
              className="max-h-[65svh] w-full rounded-xl object-contain"
            />
          )}
          <div className="flex items-center justify-between gap-3">
            <Button
              variant="outline"
              disabled={active === null || active === 0}
              onClick={() =>
                setActive((value) => Math.max(0, (value ?? 0) - 1))
              }
            >
              Previous
            </Button>
            <Button
              variant="outline"
              disabled={active === null || active === images.length - 1}
              onClick={() =>
                setActive((value) =>
                  Math.min(images.length - 1, (value ?? 0) + 1),
                )
              }
            >
              Next
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
