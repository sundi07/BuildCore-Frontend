import { Check, Circle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TimelineStep {
  title: string;
  meta?: string | undefined;
  detail?: string | undefined;
  state: "done" | "current" | "todo";
}

export function Timeline({ steps }: { steps: TimelineStep[] }) {
  return (
    <ol className="relative space-y-5 ps-6">
      <span className="absolute top-1 bottom-1 left-[9px] w-px bg-border" aria-hidden />
      {steps.map((s, i) => (
        <li key={i} className="relative">
          <span
            className={cn(
              "absolute top-0.5 -left-6 grid size-[19px] place-items-center rounded-full border-2 bg-card",
              s.state === "done" && "border-success text-success",
              s.state === "current" && "border-primary text-primary",
              s.state === "todo" && "border-border text-muted-foreground",
            )}
          >
            {s.state === "done" ? (
              <Check className="size-3" />
            ) : s.state === "current" ? (
              <Clock className="size-3" />
            ) : (
              <Circle className="size-2" />
            )}
          </span>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className={cn("text-sm font-medium", s.state === "todo" && "text-muted-foreground")}>
              {s.title}
            </p>
            {s.meta ? <span className="text-xs text-muted-foreground">{s.meta}</span> : null}
          </div>
          {s.detail ? <p className="mt-0.5 text-xs text-muted-foreground">{s.detail}</p> : null}
        </li>
      ))}
    </ol>
  );
}

export function WorkflowChain({ steps, activeIndex }: { steps: string[]; activeIndex: number }) {
  return (
    <div className="scrollbar-slim flex items-center gap-1.5 overflow-x-auto pb-1">
      {steps.map((s, i) => (
        <div key={s} className="flex shrink-0 items-center gap-1.5">
          <span
            className={cn(
              "rounded-md border px-2.5 py-1 text-xs font-medium whitespace-nowrap",
              i < activeIndex && "border-success/30 bg-success/10 text-success",
              i === activeIndex && "border-primary/30 bg-primary/10 text-primary",
              i > activeIndex && "bg-muted text-muted-foreground",
            )}
          >
            {s}
          </span>
          {i < steps.length - 1 ? <span className="text-muted-foreground">→</span> : null}
        </div>
      ))}
    </div>
  );
}
