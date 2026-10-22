import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdminProfilePage() {
  return (
    <div className="flex flex-col gap-6">
      {/* Admin profile page heading */}
      <header className="flex flex-col gap-2">
        <Badge
          variant="outline"
          className="w-fit rounded-full border-brand-line bg-white text-brand-blue"
        >
          Account
        </Badge>
        <h1 className="text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
          Admin profile
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage your administrator details and account information.
        </p>
      </header>

      {/* Admin identity summary */}
      <Card className="overflow-hidden rounded-2xl border-brand-line bg-white shadow-none">
        <div className="h-28 bg-brand-blue-soft" />
        <CardContent className="flex flex-col justify-between gap-5 p-5 sm:flex-row sm:items-end sm:px-7 sm:pb-7">
          <div className="flex items-end gap-4">
            <div className="-mt-12 grid size-20 shrink-0 place-items-center rounded-2xl border-4 border-white bg-brand-blue text-2xl font-semibold text-white">
              AM
            </div>
            <div className="flex flex-col gap-1">
              <h2 className="text-xl font-semibold">Alex Morgan</h2>
              <p className="text-sm text-muted-foreground">
                alex.morgan@mytour.my
              </p>
            </div>
          </div>
          <Badge className="w-fit rounded-full bg-brand-blue-soft px-3 py-1 text-brand-blue hover:bg-brand-blue-soft">
            Administrator
          </Badge>
        </CardContent>
      </Card>

      {/* Admin account details */}
      <Card className="rounded-2xl border-brand-line bg-white shadow-none">
        <CardContent className="flex flex-col gap-6 p-5 sm:p-7">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold">Personal details</h2>
            <p className="text-sm text-muted-foreground">
              Update the details associated with your admin account.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="admin-name">Full name</Label>
              <Input
                id="admin-name"
                defaultValue="Alex Morgan"
                className="h-11 rounded-xl border-brand-line"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="admin-email">Email address</Label>
              <Input
                id="admin-email"
                type="email"
                defaultValue="alex.morgan@mytour.my"
                className="h-11 rounded-xl border-brand-line"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="admin-role">Role</Label>
              <Input
                id="admin-role"
                value="Administrator"
                readOnly
                className="h-11 rounded-xl border-brand-line bg-brand-surface-muted"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="admin-team">Team</Label>
              <Input
                id="admin-team"
                defaultValue="Community operations"
                className="h-11 rounded-xl border-brand-line"
              />
            </div>
          </div>
          <div className="flex justify-end border-t border-brand-line pt-5">
            <Button className="h-10 rounded-full bg-brand-blue px-5 text-white hover:bg-brand-blue-hover">
              Save changes
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Admin access summary */}
      <Card className="rounded-2xl border-brand-line bg-white shadow-none">
        <CardContent className="flex flex-col gap-3 p-5 sm:p-6">
          <h2 className="font-semibold">Administrator access</h2>
          <p className="text-sm leading-6 text-muted-foreground">
            This account can review travellers, moderate community posts, and
            manage shared itineraries. Access will be enforced by the
            authentication service when it is connected.
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="rounded-full border-brand-line">
              User management
            </Badge>
            <Badge variant="outline" className="rounded-full border-brand-line">
              Community moderation
            </Badge>
            <Badge variant="outline" className="rounded-full border-brand-line">
              Trip management
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
