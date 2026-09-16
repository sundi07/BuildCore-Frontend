import { cn } from "@/lib/utils";

const toneMap: Record<string, string> = {
  draft: "bg-muted text-muted-foreground border-border",
  pending: "bg-warning/12 text-warning-foreground border-warning/30",
  "pending approval": "bg-warning/12 text-warning-foreground border-warning/30",
  approved: "bg-success/12 text-success border-success/30",
  rejected: "bg-destructive/10 text-destructive border-destructive/30",
  "sent back": "bg-accent/15 text-accent-foreground border-accent/35",
  cancelled: "bg-muted text-muted-foreground border-border",
  "partially received": "bg-accent/15 text-accent-foreground border-accent/35",
  "fully received": "bg-success/12 text-success border-success/30",
  closed: "bg-muted text-muted-foreground border-border",
  // generic states
  active: "bg-success/12 text-success border-success/30",
  inactive: "bg-muted text-muted-foreground border-border",
  completed: "bg-success/12 text-success border-success/30",
  "in progress": "bg-primary/10 text-primary border-primary/25",
  planning: "bg-info/12 text-info border-info/30",
  "on hold": "bg-warning/12 text-warning-foreground border-warning/30",
  delayed: "bg-destructive/10 text-destructive border-destructive/30",
  "not started": "bg-muted text-muted-foreground border-border",
  // quotation & evaluation
  received: "bg-primary/10 text-primary border-primary/25",
  "under technical evaluation": "bg-info/12 text-info border-info/30",
  "technically qualified": "bg-success/12 text-success border-success/30",
  "technically rejected": "bg-destructive/10 text-destructive border-destructive/30",
  "under commercial evaluation": "bg-accent/15 text-accent-foreground border-accent/35",
  "commercially qualified": "bg-success/12 text-success border-success/30",
  withdrawn: "bg-muted text-muted-foreground border-border",
  // payment
  paid: "bg-success/12 text-success border-success/30",
  unpaid: "bg-muted text-muted-foreground border-border",
  "partially paid": "bg-warning/12 text-warning-foreground border-warning/30",
  overdue: "bg-destructive/10 text-destructive border-destructive/30",
  due: "bg-warning/12 text-warning-foreground border-warning/30",
  upcoming: "bg-info/12 text-info border-info/30",
  payable: "bg-warning/12 text-warning-foreground border-warning/30",
  // inventory / sales
  available: "bg-success/12 text-success border-success/30",
  hold: "bg-warning/12 text-warning-foreground border-warning/30",
  booked: "bg-primary/10 text-primary border-primary/25",
  sold: "bg-info/12 text-info border-info/30",
  transferred: "bg-accent/15 text-accent-foreground border-accent/35",
  passed: "bg-success/12 text-success border-success/30",
  "partially accepted": "bg-warning/12 text-warning-foreground border-warning/30",
  failed: "bg-destructive/10 text-destructive border-destructive/30",
  matched: "bg-success/12 text-success border-success/30",
  unmatched: "bg-destructive/10 text-destructive border-destructive/30",
  // priority
  urgent: "bg-destructive/10 text-destructive border-destructive/30",
  high: "bg-accent/15 text-accent-foreground border-accent/35",
  medium: "bg-info/12 text-info border-info/30",
  low: "bg-muted text-muted-foreground border-border",
  // misc
  open: "bg-info/12 text-info border-info/30",
  won: "bg-success/12 text-success border-success/30",
  lost: "bg-destructive/10 text-destructive border-destructive/30",
  new: "bg-primary/10 text-primary border-primary/25",
  qualified: "bg-success/12 text-success border-success/30",
  missed: "bg-destructive/10 text-destructive border-destructive/30",
  issued: "bg-success/12 text-success border-success/30",
  scheduled: "bg-info/12 text-info border-info/30",
};

export function StatusBadge({ value, className }: { value: string; className?: string }) {
  const tone =
    toneMap[value?.toLowerCase()] ?? "bg-secondary text-secondary-foreground border-border";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        tone,
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-current opacity-70" />
      {value}
    </span>
  );
}

export function ApprovalBadge({ value, level }: { value: string; level?: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <StatusBadge value={value} />
      {level && level !== "—" ? (
        <span className="text-[11px] text-muted-foreground">{level}</span>
      ) : null}
    </div>
  );
}
