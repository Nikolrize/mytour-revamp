"use client";

import { AdminTableFilters } from "@/components/admin-table-filters";
import { ItineraryPagination } from "@/components/itinerary-pagination";
import { TableLoadingSkeleton } from "@/components/loading-skeletons";
import { PasswordFields } from "@/components/password-fields";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FieldError } from "@/components/ui/field";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableText,
} from "@/components/ui/table";
import { usePasswordRequests } from "@/hooks/use-password-requests";
import { resetPasswordSchema } from "@/lib/schemas";
import type { ResetPasswordValues, ResetRequestDialogProps } from "@/lib/type";
import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

function ResetRequestDialog({ request }: ResetRequestDialogProps) {
  const [open, setOpen] = useState(false);
  const { reset } = usePasswordRequests();

  const form = useForm<ResetPasswordValues>({
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
            Verify the requester&apos;s identity before proceeding. Arrange delivery
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
          <PasswordFields
            idPrefix={"request-" + request.id}
            password={form.register("password")}
            confirmation={form.register("confirmPassword")}
            passwordError={form.formState.errors.password?.message}
            confirmError={form.formState.errors.confirmPassword?.message}
            disabled={reset.isPending}
          />
          {Object.entries(form.formState.errors)
            .filter(([key]) => key !== "password" && key !== "confirmPassword")
            .map(([key, error]) => (
              <FieldError
                key={key}
                role="alert"
                className="text-sm text-destructive"
              >
                {error.message}
              </FieldError>
            ))}
          {reset.error && (
            <FieldError role="alert" className="text-sm text-destructive">
              {reset.error.message}
            </FieldError>
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
  const [filters, setFilters] = useState<Record<string, string>>({
    accountRole: "all",
    sort: "oldest",
  });
  const { query } = usePasswordRequests(page, true, filters);
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
      <AdminTableFilters
        defaults={{ accountRole: "all", sort: "oldest" }}
        onApply={(values) => {
          setFilters(values);
          setPage(1);
        }}
        definitions={[
          {
            key: "accountRole",
            label: "Account type",
            options: [
              { value: "all", label: "All accounts" },
              { value: "client", label: "Client" },
              { value: "admin", label: "Admin" },
              { value: "master_admin", label: "Master admin" },
            ],
          },
          {
            key: "sort",
            label: "Sort by",
            options: [
              { value: "oldest", label: "Oldest first" },
              { value: "latest", label: "Newest first" },
            ],
          },
        ]}
      />
      {query.isPending ? (
        <TableLoadingSkeleton rows={3} columns={3} />
      ) : query.error ? (
        <FieldError role="alert" className="text-sm text-destructive">
          {query.error.message}
        </FieldError>
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
