import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Eye, EyeOff, HardHat, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/hooks/useAuth";

const highlights = [
  "Indent to payment procurement workflow with multi-level approvals",
  "Site-wise inventory, GRN and material consumption in real time",
  "BOQ, budget vs actual, DPR and contractor billing on one thread",
  "CRM, unit booking, collections and accounting fully connected",
];

export function LoginPage() {
  const { signIn, session, ready } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (ready && session) {
      navigate("/app/dashboard", { replace: true });
    }
  }, [ready, session, navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await signIn(username, password);
      navigate("/app/dashboard", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-sidebar p-10 lg:flex">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.14]"
          style={{
            backgroundImage:
              "linear-gradient(oklch(1 0 0 / 0.4) 1px, transparent 1px), linear-gradient(90deg, oklch(1 0 0 / 0.4) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        />
        <div className="relative flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground">
            <HardHat className="size-6" />
          </span>
          <div>
            <p className="font-display text-lg font-bold tracking-tight text-sidebar-accent-foreground">
              BUILDCORE
            </p>
            <p className="text-[11px] tracking-[0.16em] text-sidebar-foreground/60 uppercase">
              Construction ERP
            </p>
          </div>
        </div>

        <div className="relative max-w-xl">
          <h1 className="font-display text-4xl leading-[1.1] font-semibold text-sidebar-accent-foreground">
            Construction Management. Procurement. Inventory. Finance. Sales. CRM.
            <span className="block text-sidebar-primary"> All in one platform.</span>
          </h1>
          <ul className="mt-8 space-y-3">
            {highlights.map((h) => (
              <li key={h} className="flex items-start gap-2.5 text-sm text-sidebar-foreground/85">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-sidebar-primary" />
                {h}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative grid grid-cols-3 gap-4 border-t border-sidebar-border pt-6">
          {[
            { k: "₹128 Cr+", v: "Procurement managed" },
            { k: "6 Projects", v: "Live on platform" },
            { k: "20 Modules", v: "End-to-end coverage" },
          ].map((s) => (
            <div key={s.k}>
              <p className="font-display text-lg font-semibold text-sidebar-accent-foreground">
                {s.k}
              </p>
              <p className="text-[11px] text-sidebar-foreground/60">{s.v}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-center bg-background px-5 py-10">
        <div className="w-full max-w-[400px]">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
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

          <h2 className="font-display text-2xl font-semibold tracking-tight">
            Sign in to your workspace
          </h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Use the demo credentials below to explore the full platform.
          </p>

          <form onSubmit={submit} className="mt-7 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={show ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  className="pe-10"
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  className="absolute top-1/2 right-2.5 -translate-y-1/2 text-muted-foreground"
                  aria-label={show ? "Hide password" : "Show password"}
                >
                  {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <Checkbox defaultChecked /> Remember me
              </label>
              <Link
                to="/auth/forgot-password"
                className="text-sm font-medium text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            {error ? (
              <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            ) : null}

            <Button type="submit" className="w-full gap-2" disabled={busy}>
              {busy ? <Loader2 className="size-4 animate-spin" /> : null}
              Sign in
              {!busy ? <ArrowRight className="size-4" /> : null}
            </Button>
          </form>

          <div className="mt-6 rounded-lg border bg-card p-3 text-xs text-muted-foreground">
            <p className="font-medium text-foreground">Backend Authentication</p>
            <p className="mt-1">Sign in with your configured Spring Boot backend credentials.</p>
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Protected workspace · Session secured with role based access control
          </p>
        </div>
      </div>
    </div>
  );
}
