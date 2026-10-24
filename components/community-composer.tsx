"use client";

import { CommunityAuthor } from "@/components/community-author";
import { ItineraryPagination } from "@/components/itinerary-pagination";
import { LoadingBlock } from "@/components/loading-skeletons";
import { SearchField } from "@/components/search-field";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useCreateCommunityPost } from "@/hooks/use-community";
import { useTripPage } from "@/hooks/use-trips";
import { communityPostSchema } from "@/lib/schemas";
import type {
  CommunityComposerProps,
  CommunityPostInput,
  CommunityPostValues,
  PhotoPreviewProps,
} from "@/lib/type";
import { zodResolver } from "@hookform/resolvers/zod";
import { ImagePlus, Send, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";

function PhotoPreview({ file, onRemove, disabled }: PhotoPreviewProps) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") setUrl(reader.result);
    };
    reader.readAsDataURL(file);
    return () => {
      reader.onload = null;
      if (reader.readyState === FileReader.LOADING) reader.abort();
    };
  }, [file]);
  return (
    <div className="relative overflow-hidden rounded-xl">
      {url ? (
        <Image
          src={url}
          alt={file.name}
          width={300}
          height={300}
          unoptimized
          className="h-[14svh] max-h-28 w-full object-cover"
        />
      ) : (
        <LoadingBlock label="Loading photo preview">
          <Skeleton className="h-[14svh] max-h-28 w-full rounded-none" />
        </LoadingBlock>
      )}
      <Button
        type="button"
        variant="secondary"
        size="icon"
        disabled={disabled}
        onClick={onRemove}
        aria-label={`Remove ${file.name}`}
        className="absolute top-2 right-2 size-7 rounded-full"
      >
        <X className="size-4" />
      </Button>
    </div>
  );
}

export function CommunityComposer({
  author,
  onPublished,
}: CommunityComposerProps) {
  const form = useForm<CommunityPostInput, unknown, CommunityPostValues>({
    resolver: zodResolver(communityPostSchema),
    defaultValues: { content: "", tripId: "" },
  });
  const create = useCreateCommunityPost();
  const [tripSearch, setTripSearch] = useState("");
  const [tripPage, setTripPage] = useState(1);
  const [selectedTripLabel, setSelectedTripLabel] = useState("");
  const [draftTripSearch, setDraftTripSearch] = useState("");
  const tripOptions = useTripPage({
    scope: "all",
    page: tripPage,
    publicOnly: true,
    search: tripSearch,
  });
  const options = tripOptions.data?.trips ?? [];
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoError, setPhotoError] = useState("");
  const submit = form.handleSubmit((values) => {
    if (!values.content && !photos.length) {
      form.setError("content", { message: "Write something or add a photo." });
      return;
    }
    create.mutate(
      { values, photos },
      {
        onSuccess: () => {
          form.reset({ content: "", tripId: "" });
          setSelectedTripLabel("");
          setPhotos([]);
          setPhotoError("");
          onPublished?.();
        },
      },
    );
  });
  return (
    <Card className="rounded-3xl border-brand-line bg-white shadow-none">
      <CardContent className="flex flex-col gap-5 p-5 sm:p-6">
        <CommunityAuthor author={author} />
        {/* Post composition and optional itinerary attachment */}
        <form onSubmit={submit} className="flex flex-col gap-4">
          <Label htmlFor="community-content" className="sr-only">
            Your travel story
          </Label>
          <Textarea
            aria-invalid={Boolean(form.formState.errors.content)}
            aria-describedby={
              form.formState.errors.content
                ? "community-content-error"
                : undefined
            }
            id="community-content"
            placeholder="Where did your trip take you? Share a story, a photo, or a local find…"
            maxLength={5000}
            rows={4}
            disabled={create.isPending}
            {...form.register("content")}
            className="resize-y rounded-2xl border-brand-line"
          />
          {form.formState.errors.content && (
            <FieldError
              id={"community-content-error"}
              role="alert"
              className="text-sm text-destructive"
            >
              {form.formState.errors.content.message}
            </FieldError>
          )}
          {!!photos.length && (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {photos.map((file) => (
                <PhotoPreview
                  key={`${file.name}-${file.lastModified}-${file.size}`}
                  file={file}
                  disabled={create.isPending}
                  onRemove={() =>
                    setPhotos((current) =>
                      current.filter((photo) => photo !== file),
                    )
                  }
                />
              ))}
            </div>
          )}
          <div className="flex flex-col gap-2">
            <Label htmlFor="community-trip">
              Attach an itinerary (optional)
            </Label>
            <SearchField
              placeholder="Search itineraries to attach"
              value={draftTripSearch}
              onChange={setDraftTripSearch}
              disabled={create.isPending}
              onSearch={() => {
                setTripSearch(draftTripSearch.trim());
                setTripPage(1);
              }}
            />
            {tripOptions.isPending ? (
              <LoadingBlock label="Loading itinerary options">
                <Skeleton className="h-10 w-full rounded-xl" />
              </LoadingBlock>
            ) : (
              <Controller
                control={form.control}
                name="tripId"
                render={({ field }) => (
                  <Select
                    value={field.value || "none"}
                    disabled={create.isPending}
                    onValueChange={(value) => {
                      field.onChange(value === "none" ? "" : value);
                      setSelectedTripLabel(
                        options.find((trip) => trip.slug === value)?.title ??
                          "",
                      );
                    }}
                  >
                    <SelectTrigger
                      id="community-trip"
                      className="w-full rounded-xl"
                    >
                      <SelectValue>
                        {selectedTripLabel || "No itinerary attached"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">
                        No itinerary attached
                      </SelectItem>
                      {options.map((trip) => (
                        <SelectItem key={trip.slug} value={trip.slug}>
                          {trip.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            )}
            <p className="text-xs leading-5 text-muted-foreground">
              Choose one of your published or saved itineraries.{" "}
              <Link href="/trips" className="text-brand-blue hover:underline">
                Publish a trip in Explore first
              </Link>{" "}
              to make it available here.
            </p>
            {tripOptions.data && (
              <ItineraryPagination
                page={tripOptions.data.page}
                totalPages={tripOptions.data.totalPages}
                busy={tripOptions.isFetching}
                onPageChange={setTripPage}
              />
            )}
            {tripOptions.error && (
              <FieldError role="alert" className="text-xs text-destructive">
                Could not load itinerary options. You can still publish without
                attaching one.
              </FieldError>
            )}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-brand-line pt-4">
            <div className="flex flex-col gap-1">
              <Label
                htmlFor="community-photos"
                className="flex items-center gap-2 text-sm text-brand-blue"
              >
                <ImagePlus className="size-4" /> Photos (optional, maximum 10)
              </Label>
              <Input
                id="community-photos"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                disabled={create.isPending || photos.length >= 10}
                className="max-w-64 text-xs"
                onChange={(event) => {
                  const next = [
                    ...photos,
                    ...Array.from(event.target.files ?? []),
                  ].filter(
                    (file, index, list) =>
                      list.findIndex(
                        (other) =>
                          other.name === file.name &&
                          other.size === file.size &&
                          other.lastModified === file.lastModified,
                      ) === index,
                  );
                  event.target.value = "";
                  if (
                    next.length > 10 ||
                    next.some(
                      (file) =>
                        file.size > 2097152 ||
                        !["image/jpeg", "image/png", "image/webp"].includes(
                          file.type,
                        ),
                    ) ||
                    next.reduce((sum, file) => sum + file.size, 0) > 20971520
                  ) {
                    setPhotoError(
                      "Choose up to ten JPG, PNG, or WebP photos, 2 MB each and 20 MB total.",
                    );
                    return;
                  }
                  setPhotos(next);
                  setPhotoError("");
                }}
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Photos are optional: add 0–10 photos, 2 MB each and 20 MB total.
            Posts and photos are public.
          </p>
          {photoError && (
            <FieldError role="alert" className="text-sm text-destructive">
              {photoError}
            </FieldError>
          )}
          {create.error && (
            <FieldError role="alert" className="text-sm text-destructive">
              {create.error.message}
            </FieldError>
          )}
          {create.isSuccess && (
            <p role="status" className="text-sm text-brand-blue">
              Your story has been published.
            </p>
          )}
          {/* Final action follows photo guidance and validation messages. */}
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={create.isPending}
              className="rounded-full bg-brand-blue px-5 text-white hover:bg-brand-blue-hover"
            >
              <Send className="size-4" />
              {create.isPending ? "Publishing…" : "Publish post"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
