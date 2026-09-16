import { Link } from "react-router-dom";
import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StatCardProps {
  label: string;
  value: string;
  hint?: string | undefined;
  delta?: number | undefined;
  deltaLabel?: string | undefined;
  icon?: LucideIcon | undefined;
  tone?: "default" | "success" | "warning" | "danger" | "info" | undefined;
  progress?: number | undefined;
  to?: string | undefined;
}

const toneRing: Record<string, string> = {
  default: "bg-primary/10 text-primary",
  success: "bg-success/12 text-success",
  warning: "bg-warning/15 text-warning-foreground",
  danger: "bg-destructive/10 text-destructive",
  info: "bg-info/12 text-info",
};

export function StatCard({
  label,
  value,
  hint,
  delta,
  deltaLabel,
  icon: Icon,
  tone = "default",
  progress,
  to,
}: StatCardProps) {
  const body = (
    <div className="group h-full rounded-xl border bg-card p-4 shadow-card transition-all hover:shadow-raised">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[13px] font-medium text-muted-foreground">{label}</p>
        {Icon ? (
          <span
            className={cn("grid size-8 shrink-0 place-items-center rounded-lg", toneRing[tone])}
          >
            <Icon className="size-4" />
          </span>
        ) : null}
      </div>
      <p className="num mt-2 font-display text-[22px] leading-tight font-semibold tracking-tight">
        {value}
      </p>
      <div className="mt-1.5 flex items-center gap-2">
        {typeof delta === "number" ? (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 text-xs font-semibold",
              delta >= 0 ? "text-success" : "text-destructive",
            )}
          >
            {delta >= 0 ? (
              <ArrowUpRight className="size-3.5" />
            ) : (
              <ArrowDownRight className="size-3.5" />
            )}
            {Math.abs(delta)}%
          </span>
        ) : null}
        {hint || deltaLabel ? (
          <span className="truncate text-xs text-muted-foreground">{deltaLabel ?? hint}</span>
        ) : null}
      </div>
      {typeof progress === "number" ? (
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary"
            style={{ width: `${Math.min(100, progress)}%` }}
          />
        </div>
      ) : null}
    </div>
  );

  if (to) {
    return (
      <Link to={`/app/${to}`} className="block h-full">
        {body}
      </Link>
    );
  }
  return body;
}
