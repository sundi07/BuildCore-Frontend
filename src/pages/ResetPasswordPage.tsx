import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HardHat, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authApi } from "@/api";
import { toast } from "sonner";

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-5 py-12">
      <div className="w-full max-w-[420px]">
        <div className="mb-8 flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground">
            <HardHat className="size-5" />
          </span>
          <div>
            <p className="font-display font-bold tracking-tight">BUILDCORE</p>
            <p className="text-[10px] tracking-[0.14em] text-muted-foreground uppercase">
              Construction ERP
            </p>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-card">
          <h1 className="font-display text-xl font-semibold tracking-tight">Set a new password</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Use at least 8 characters with one uppercase letter, one number and one symbol.
          </p>
          <form
            className="mt-5 space-y-4"
            onSubmit={async (e) => {
              e.preventDefault();
              if (password.length < 8) return setError("Password must be at least 8 characters.");
              if (password !== confirm) return setError("Passwords do not match.");
              setError(null);
              setBusy(true);
              await authApi.resetPassword("demo-token", password);
              setBusy(false);
              toast.success("Password updated. Please sign in.");
              navigate("/");
            }}
          >
            <div className="space-y-1.5">
              <Label htmlFor="pwd">New password</Label>
              <Input
                id="pwd"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cpwd">Confirm password</Label>
              <Input
                id="cpwd"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
              />
            </div>
            {error ? (
              <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            ) : null}
            <Button type="submit" className="w-full gap-2" disabled={busy}>
              {busy ? <Loader2 className="size-4 animate-spin" /> : null}
              Update password
            </Button>
          </form>
        </div>

        <Link
          to="/"
          className="mt-6 block text-center text-sm text-muted-foreground hover:text-foreground"
        >
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
