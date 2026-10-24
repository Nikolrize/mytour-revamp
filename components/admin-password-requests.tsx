"use client";

import { useState } from "react";
import { ItineraryPagination } from "@/components/itinerary-pagination";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { KeyRound } from "lucide-react";
import { resetPasswordSchema } from "@/lib/schemas";
import type { PasswordResetRequest } from "@/lib/type";
import { usePasswordRequests } from "@/hooks/use-password-requests";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableText,
} from "@/components/ui/table";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

function ResetRequestDialog({ request }: { request: PasswordResetRequest }) {
  const [open, setOpen] = useState(false);
  const { reset } = usePasswordRequests();
  const form = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });
  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!reset.isPending) {
          setOpen(value);
          form.reset();
          reset.reset();
        }
      }}
    >
      <DialogTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            className="rounded-full text-brand-blue"
          />
        }
      >
        <KeyRound className="size-4" />
        Reset password
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reset password for {request.displayName}</DialogTitle>
          <DialogDescription>
            Verify the requester’s identity before proceeding. Arrange delivery
            of their new password directly with them. Saving will mark this
            request as handled.
          </DialogDescription>
        </DialogHeader>
        <form
          className="flex flex-col gap-4"
          onSubmit={form.handleSubmit((values) =>
            reset.mutate(
              { id: request.id, ...values },
              {
                onSuccess: () => {
                  form.reset();
                  setOpen(false);
                },
              },
            ),
          )}
        >
          <p className="text-sm text-muted-foreground">{request.email}</p>
          <div className="flex flex-col gap-2">
            <Label htmlFor={"request-password-" + request.id}>
              New password
            </Label>
            <Input
              id={"request-password-" + request.id}
              type="password"
              autoComplete="new-password"
              disabled={reset.isPending}
              {...form.register("password")}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor={"request-confirm-" + request.id}>
              Confirm new password
            </Label>
            <Input
              id={"request-confirm-" + request.id}
              type="password"
              autoComplete="new-password"
              disabled={reset.isPending}
              {...form.register("confirmPassword")}
            />
          </div>
          {Object.entries(form.formState.errors).map(([key, error]) => (
            <p key={key} role="alert" className="text-sm text-destructive">
              {error.message}
            </p>
          ))}
          {reset.error && (
            <p role="alert" className="text-sm text-destructive">
              {reset.error.message}
            </p>
          )}
          <DialogFooter>
            <Button type="submit" disabled={reset.isPending}>
              {reset.isPending ? "Resetting…" : "Confirm password reset"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function AdminPasswordRequests() {
  const [page, setPage] = useState(1);
  const { query } = usePasswordRequests(page, true);
  const requests = query.data?.requests ?? [];
  return (
    <section
      className="flex min-w-0 flex-col gap-4 rounded-2xl border border-brand-line bg-white p-4 sm:p-5"
      aria-label="Password reset requests"
    >
      {/* Pending requests follow the administrator account hierarchy. */}
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-lg font-semibold">Password reset requests</h2>
        <Badge
          variant="secondary"
          className="rounded-full bg-brand-blue-soft text-brand-blue"
        >
          {query.data?.total ?? 0} pending
        </Badge>
      </div>
      {query.isPending ? (
        <p className="text-sm text-muted-foreground">Loading requests…</p>
      ) : query.error ? (
        <p role="alert" className="text-sm text-destructive">
          {query.error.message}
        </p>
      ) : requests.length ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Account</TableHead>
              <TableHead>Requested</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((request) => (
              <TableRow key={request.id}>
                <TableCell>
                  <TableText className="font-medium">
                    {request.displayName}
                  </TableText>
                  <TableText className="text-xs text-muted-foreground">
                    {request.email}
                  </TableText>
                </TableCell>
                <TableCell className="text-sm">
                  {new Date(request.requestedAt).toLocaleString("en-MY", {
                    timeZone: "Asia/Kuala_Lumpur",
                  })}
                </TableCell>
                <TableCell className="overflow-visible text-right">
                  <ResetRequestDialog request={request} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <p className="text-sm text-muted-foreground">No pending requests.</p>
      )}
      <ItineraryPagination
        label="Password request pages"
        page={query.data?.page ?? page}
        totalPages={query.data?.totalPages ?? 1}
        busy={query.isFetching}
        onPageChange={setPage}
      />
    </section>
  );
}
