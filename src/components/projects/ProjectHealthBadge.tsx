import { cn } from "@/lib/utils";
import type { ProjectHealth } from "@/types";
import { CheckCircle2, AlertTriangle, AlertCircle } from "lucide-react";

interface ProjectHealthBadgeProps {
  health?: ProjectHealth | string | undefined;
  showIcon?: boolean | undefined;
  className?: string | undefined;
  size?: "sm" | "md" | undefined;
}

const healthConfig: Record<
  string,
  { bg: string; text: string; border: string; dot: string; icon: typeof CheckCircle2 }
> = {
  "on track": {
    bg: "bg-success/12",
    text: "text-success",
    border: "border-success/30",
    dot: "bg-success",
    icon: CheckCircle2,
  },
  "at risk": {
    bg: "bg-warning/15",
    text: "text-warning-foreground",
    border: "border-warning/35",
    dot: "bg-warning",
    icon: AlertTriangle,
  },
  delayed: {
    bg: "bg-destructive/12",
    text: "text-destructive",
    border: "border-destructive/30",
    dot: "bg-destructive",
    icon: AlertCircle,
  },
};

export function ProjectHealthBadge({
  health = "On Track",
  showIcon = true,
  className,
  size = "sm",
}: ProjectHealthBadgeProps) {
  const normalized = (health || "On Track").toLowerCase();
  const config = healthConfig[normalized] ?? {
    bg: "bg-muted",
    text: "text-muted-foreground",
    border: "border-border",
    dot: "bg-muted-foreground",
    icon: CheckCircle2,
  };

  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-medium whitespace-nowrap",
        config.bg,
        config.text,
        config.border,
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs sm:text-sm",
        className,
      )}
    >
      {showIcon ? (
        <Icon className={cn("shrink-0", size === "sm" ? "size-3" : "size-3.5")} />
      ) : (
        <span className={cn("size-1.5 rounded-full", config.dot)} />
      )}
      <span>{health}</span>
    </span>
  );
}
