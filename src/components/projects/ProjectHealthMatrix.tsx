import {
  CalendarClock,
  Wallet,
  Coins,
  ShoppingCart,
  HardHat,
  Info,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
} from "lucide-react";
import type { ProjectHealthBreakdown, HealthIndicatorStatus } from "@/types";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ProjectHealthMatrixProps {
  health?: ProjectHealthBreakdown | undefined;
  className?: string | undefined;
}

interface HealthPillConfig {
  label: HealthIndicatorStatus;
  bg: string;
  text: string;
  border: string;
  dot: string;
  icon: typeof CheckCircle2;
}

const statusStyles: Record<HealthIndicatorStatus, HealthPillConfig> = {
  Healthy: {
    label: "Healthy",
    bg: "bg-success/12",
    text: "text-success",
    border: "border-success/30",
    dot: "bg-success",
    icon: CheckCircle2,
  },
  Attention: {
    label: "Attention",
    bg: "bg-warning/15",
    text: "text-warning-foreground",
    border: "border-warning/35",
    dot: "bg-warning",
    icon: AlertTriangle,
  },
  Critical: {
    label: "Critical",
    bg: "bg-destructive/12",
    text: "text-destructive",
    border: "border-destructive/30",
    dot: "bg-destructive",
    icon: AlertCircle,
  },
};

export function ProjectHealthMatrix({ health, className }: ProjectHealthMatrixProps) {
  const indicators: {
    key: keyof Omit<ProjectHealthBreakdown, "notes">;
    title: string;
    icon: typeof CalendarClock;
    fallbackStatus: HealthIndicatorStatus;
    defaultDesc: string;
  }[] = [
    {
      key: "schedule",
      title: "Schedule",
      icon: CalendarClock,
      fallbackStatus: "Healthy",
      defaultDesc: "Milestone timeline & slab casting cycle",
    },
    {
      key: "budget",
      title: "Budget",
      icon: Wallet,
      fallbackStatus: "Healthy",
      defaultDesc: "Overall commitment vs baseline allocation",
    },
    {
      key: "cost",
      title: "Cost",
      icon: Coins,
      fallbackStatus: "Healthy",
      defaultDesc: "Cost performance index & raw material variance",
    },
    {
      key: "procurement",
      title: "Procurement",
      icon: ShoppingCart,
      fallbackStatus: "Attention",
      defaultDesc: "Indent turnaround, PO delivery & pending GRN",
    },
    {
      key: "construction",
      title: "Construction",
      icon: HardHat,
      fallbackStatus: "Healthy",
      defaultDesc: "Quality compliance, manpower muster & daily progress",
    },
  ];

  return (
    <div className={cn("rounded-xl border bg-card p-4 shadow-card", className)}>
      <div className="flex items-center justify-between border-b pb-3">
        <div>
          <h3 className="text-sm font-semibold tracking-tight">Project Health Scorecard</h3>
          <p className="text-xs text-muted-foreground">
            Multi-dimensional risk & operational performance across 5 key indices
          </p>
        </div>
        <div className="hidden items-center gap-3 text-xs sm:flex">
          <span className="flex items-center gap-1 text-muted-foreground">
            <span className="size-2 rounded-full bg-success" /> Healthy
          </span>
          <span className="flex items-center gap-1 text-muted-foreground">
            <span className="size-2 rounded-full bg-warning" /> Attention
          </span>
          <span className="flex items-center gap-1 text-muted-foreground">
            <span className="size-2 rounded-full bg-destructive" /> Critical
          </span>
        </div>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <TooltipProvider delayDuration={200}>
          {indicators.map((ind) => {
            const status: HealthIndicatorStatus = health?.[ind.key] ?? ind.fallbackStatus;
            const style = statusStyles[status] ?? statusStyles.Healthy;
            const note = health?.notes?.[ind.key] ?? ind.defaultDesc;
            const Icon = ind.icon;
            const StatusIcon = style.icon;

            return (
              <Tooltip key={ind.key}>
                <TooltipTrigger asChild>
                  <div
                    className={cn(
                      "flex flex-col justify-between rounded-lg border p-3 text-left transition-colors hover:border-primary/40",
                      status === "Critical"
                        ? "border-destructive/30 bg-destructive/[0.02]"
                        : status === "Attention"
                          ? "border-warning/30 bg-warning/[0.02]"
                          : "border-border/80 bg-surface/50",
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                        <Icon className="size-3.5 text-muted-foreground" />
                        {ind.title}
                      </span>
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[11px] font-medium",
                          style.bg,
                          style.text,
                          style.border,
                        )}
                      >
                        <StatusIcon className="size-2.5" />
                        {style.label}
                      </span>
                    </div>

                    <div className="mt-2.5">
                      <p className="line-clamp-2 text-xs text-muted-foreground">{note}</p>
                    </div>

                    <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground/70">
                      <span>Live status</span>
                      <Info className="size-3 text-muted-foreground/50" />
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs text-xs">
                  <p className="font-semibold">
                    {ind.title} Index: {status}
                  </p>
                  <p className="mt-1 text-muted-foreground">{note}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </TooltipProvider>
      </div>
    </div>
  );
}
