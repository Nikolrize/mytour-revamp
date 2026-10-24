import type { ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// One accessible status per placeholder; decorative shapes stay hidden.
export function LoadingBlock({
  children,
  label = "Loading content",
  className = "",
}: {
  children: ReactNode;
  label?: string;
  className?: string;
}) {
  return (
    <div role="status" aria-busy="true" className={className}>
      <span className="sr-only">{label}</span>
      <div aria-hidden="true">{children}</div>
    </div>
  );
}

export function TripCardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <LoadingBlock label="Loading itineraries">
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: count }, (_, index) => (
          <div
            key={index}
            className="min-h-[26rem] overflow-hidden rounded-3xl border border-brand-line bg-white"
          >
            <Skeleton className="h-44 w-full rounded-none" />
            <div className="flex flex-col gap-4 p-5">
              <div className="flex items-center gap-3">
                <Skeleton className="size-10 rounded-full" />
                <div className="flex flex-1 flex-col gap-2">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              </div>
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
              <div className="flex gap-2">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-5 w-14 rounded-full" />
              </div>
              <div className="flex justify-between border-t border-brand-line pt-3">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </LoadingBlock>
  );
}

export function TableLoadingSkeleton({
  rows = 5,
  columns = 5,
  toolbar = false,
}: {
  rows?: number;
  columns?: number;
  toolbar?: boolean;
}) {
  return (
    <LoadingBlock label="Loading table records">
      <div
        className={
          toolbar
            ? "flex flex-col gap-4 rounded-2xl border border-brand-line bg-white p-4 sm:p-5"
            : ""
        }
      >
        {toolbar && (
          <div className="flex items-center justify-between gap-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-10 w-1/3 rounded-xl" />
          </div>
        )}
        <Table>
          <TableHeader>
            <TableRow>
              {Array.from({ length: columns }, (_, index) => (
                <TableHead key={index}>
                  <Skeleton className="h-4 w-20" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: rows }, (_, row) => (
              <TableRow key={row}>
                {Array.from({ length: columns }, (_, column) => (
                  <TableCell key={column} className="py-4">
                    <Skeleton
                      className={column === 0 ? "h-8 w-28" : "h-5 w-20"}
                    />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </LoadingBlock>
  );
}

export function CommunityFeedSkeleton({ count = 3 }: { count?: number }) {
  return (
    <LoadingBlock label="Loading community posts">
      <div className="flex flex-col gap-6">
        {Array.from({ length: count }, (_, index) => (
          <div
            key={index}
            className="flex flex-col gap-5 rounded-3xl border border-brand-line bg-white p-5 sm:p-6"
          >
            <div className="flex items-center gap-3">
              <Skeleton className="size-10 rounded-full" />
              <div className="flex flex-col gap-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-2/3" />
            </div>
            <Skeleton className="h-56 w-full rounded-2xl" />
            <div className="flex gap-3 border-t border-brand-line pt-3">
              <Skeleton className="h-8 w-20 rounded-full" />
              <Skeleton className="h-8 w-28 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </LoadingBlock>
  );
}

export function CommentsLoadingSkeleton({
  label = "Loading comments",
}: {
  label?: string;
}) {
  return (
    <LoadingBlock label={label}>
      <div className="flex flex-col gap-3">
        {Array.from({ length: 3 }, (_, index) => (
          <div
            key={index}
            className="flex gap-3 rounded-2xl border border-brand-line p-4"
          >
            <Skeleton className="size-10 shrink-0 rounded-full" />
            <div className="flex flex-1 flex-col gap-3">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        ))}
      </div>
    </LoadingBlock>
  );
}

export function MetricsLoadingSkeleton({ count = 4 }: { count?: number }) {
  return (
    <LoadingBlock label="Loading statistics">
      <div
        className={
          count === 3
            ? "grid gap-3 sm:grid-cols-3"
            : "grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        }
      >
        {Array.from({ length: count }, (_, index) => (
          <div
            key={index}
            className="flex flex-col gap-4 rounded-2xl border border-brand-line bg-white p-5"
          >
            <div className="flex items-center justify-between gap-3">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="size-10 rounded-xl" />
            </div>
            <Skeleton className="h-9 w-16" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        ))}
      </div>
    </LoadingBlock>
  );
}

export function PageLoadingSkeleton({
  label = "Loading page",
}: {
  label?: string;
}) {
  return (
    <LoadingBlock label={label} className="w-full py-8">
      <div className="flex flex-col gap-6">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
        <div className="grid gap-5 md:grid-cols-2">
          <Skeleton className="h-64 rounded-3xl" />
          <Skeleton className="h-64 rounded-3xl" />
        </div>
      </div>
    </LoadingBlock>
  );
}

export function ProfileLoadingSkeleton() {
  return (
    <div className="flex w-full flex-col gap-8 py-10 sm:py-14">
      <LoadingBlock label="Loading profile">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-3">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-12 w-60" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
            <div className="flex items-center gap-6 rounded-3xl border border-brand-line bg-white p-6">
              <Skeleton className="size-32 shrink-0 rounded-full sm:size-40" />
              <div className="flex flex-1 flex-col gap-4">
                <Skeleton className="h-7 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
            <div className="flex flex-col gap-5 rounded-3xl border border-brand-line bg-white p-6">
              <Skeleton className="h-6 w-36" />
              <Skeleton className="h-7 w-full" />
              <Skeleton className="h-7 w-full" />
              <Skeleton className="h-7 w-full" />
            </div>
          </div>
          <Skeleton className="h-7 w-40" />
        </div>
      </LoadingBlock>
      <TripCardGridSkeleton count={3} />
    </div>
  );
}

export function TripDetailLoadingSkeleton() {
  return (
    <div className="flex w-full flex-col gap-7 py-10 sm:py-14">
      <LoadingBlock label="Loading trip">
        <div className="flex flex-col gap-7">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-60 w-full rounded-3xl" />
          <div className="grid gap-6 md:grid-cols-2">
            <div className="flex flex-col gap-5">
              <Skeleton className="h-8 w-44" />
              {Array.from({ length: 2 }, (_, index) => (
                <div
                  key={index}
                  className="flex flex-col gap-5 rounded-3xl border border-brand-line bg-white p-6"
                >
                  <Skeleton className="h-6 w-1/2" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-4/5" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-5">
              <Skeleton className="h-56 rounded-3xl" />
              <Skeleton className="h-64 rounded-3xl" />
            </div>
          </div>
        </div>
      </LoadingBlock>
    </div>
  );
}

// Matches the shared header while account/session data is being resolved.
export function HeaderLoadingSkeleton() {
  return (
    <header className="h-20 shrink-0 border-b border-brand-line bg-background px-[4vw]">
      <LoadingBlock label="Loading navigation">
        <div className="flex h-20 items-center justify-between gap-6">
          <Skeleton className="h-9 w-28" />
          <div className="hidden gap-5 md:flex">
            <Skeleton className="h-4 w-14" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
          </div>
          <Skeleton className="size-10 rounded-full" />
        </div>
      </LoadingBlock>
    </header>
  );
}
