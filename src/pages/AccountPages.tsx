import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { PanelCard } from "@/components/common/ChartCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";

export function ProfilePage() {
  const { session } = useAuth();
  return (
    <>
      <PageHeader
        title="My Profile"
        description="Your BUILDCORE account details and preferences."
        breadcrumbs={[{ label: "Profile" }]}
      />
      <PanelCard title="Account" subtitle="Demo account details">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Full name</Label>
            <Input defaultValue={session?.user.name ?? "Administrator"} />
          </div>
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input defaultValue={session?.user.email ?? "admin@buildcore.in"} />
          </div>
          <div className="space-y-1.5">
            <Label>Role</Label>
            <Input defaultValue={session?.user.role ?? "Administrator"} readOnly />
          </div>
          <div className="space-y-1.5">
            <Label>Mobile</Label>
            <Input defaultValue="+91 98200 11223" />
          </div>
        </div>
        <div className="mt-4">
          <Button size="sm" onClick={() => toast.success("Profile saved (demo)")}>
            Save changes
          </Button>
        </div>
      </PanelCard>
    </>
  );
}

export function ChangePasswordPage() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (next.length < 8) return setError("New password must be at least 8 characters.");
    if (next !== confirm) return setError("New password and confirmation do not match.");
    setError("");
    setCurrent("");
    setNext("");
    setConfirm("");
    toast.success("Password changed (demo)");
  };

  return (
    <>
      <PageHeader
        title="Change Password"
        description="Update the password for your BUILDCORE account."
        breadcrumbs={[{ label: "Change Password" }]}
      />
      <PanelCard title="Password" subtitle="Minimum 8 characters" className="max-w-xl">
        <form className="space-y-4" onSubmit={submit}>
          <div className="space-y-1.5">
            <Label htmlFor="cur">Current password</Label>
            <Input
              id="cur"
              type="password"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="new">New password</Label>
            <Input
              id="new"
              type="password"
              value={next}
              onChange={(e) => setNext(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cnf">Confirm new password</Label>
            <Input
              id="cnf"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <Button type="submit" size="sm">
            Update password
          </Button>
        </form>
      </PanelCard>
    </>
  );
}
