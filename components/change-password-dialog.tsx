"use client";

import { KeyRound } from "lucide-react";
import { ChangePasswordForm } from "@/components/change-password-form";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

// Password settings are a separate action from editing public profile details.
export function ChangePasswordDialog() {
  return <Dialog>
    <DialogTrigger render={<Button variant="outline" className="rounded-full" />}><KeyRound className="size-4" />Change password</DialogTrigger>
    <DialogContent className="sm:max-w-lg">
      <DialogHeader><DialogTitle>Change password</DialogTitle><DialogDescription>Enter a new password with at least 8 characters and confirm it below.</DialogDescription></DialogHeader>
      <ChangePasswordForm />
    </DialogContent>
  </Dialog>;
}
