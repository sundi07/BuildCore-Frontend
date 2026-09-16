import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, CheckCircle2, HardHat, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authApi } from "@/api";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

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

        {sent ? (
          <div className="rounded-xl border bg-card p-6 text-center shadow-card">
            <CheckCircle2 className="mx-auto size-9 text-success" />
            <h1 className="mt-3 font-display text-lg font-semibold">Reset link sent</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              We have emailed a password reset link to{" "}
              <span className="font-medium text-foreground">{email}</span>. The link stays valid for
              30 minutes.
            </p>
            <Button asChild variant="outline" className="mt-5 w-full">
              <Link to="/auth/reset-password">Open reset screen</Link>
            </Button>
          </div>
        ) : (
          <div className="rounded-xl border bg-card p-6 shadow-card">
            <h1 className="font-display text-xl font-semibold tracking-tight">Forgot password</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Enter the email registered with your workspace and we will send a reset link.
            </p>
            <form
              className="mt-5 space-y-4"
              onSubmit={async (e) => {
                e.preventDefault();
                setBusy(true);
                await authApi.forgotPassword(email);
                setBusy(false);
                setSent(true);
              }}
            >
              <div className="space-y-1.5">
                <Label htmlFor="email">Work email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.in"
                />
              </div>
              <Button type="submit" className="w-full gap-2" disabled={busy}>
                {busy ? <Loader2 className="size-4 animate-spin" /> : null}
                Send reset link
              </Button>
            </form>
          </div>
        )}

        <Link
          to="/"
          className="mt-6 flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Back to sign in
        </Link>
      </div>
    </div>
  );
}
