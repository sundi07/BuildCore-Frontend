import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function ChartCard({
  title,
  subtitle,
  action,
  children,
  className,
  height = 260,
}: {
  title: string;
  subtitle?: string | undefined;
  action?: ReactNode | undefined;
  children: ReactNode;
  className?: string | undefined;
  height?: number | undefined;
}) {
  return (
    <section className={cn("rounded-xl border bg-card shadow-card", className)}>
      <header className="flex flex-wrap items-start justify-between gap-2 border-b px-4 py-3">
        <div>
          <h3 className="text-sm font-semibold">{title}</h3>
          {subtitle ? <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p> : null}
        </div>
        {action}
      </header>
      <div className="p-3" style={{ height }}>
        {children}
      </div>
    </section>
  );
}

export function PanelCard({
  title,
  subtitle,
  action,
  children,
  className,
  bodyClassName,
}: {
  title: string;
  subtitle?: string | undefined;
  action?: ReactNode | undefined;
  children: ReactNode;
  className?: string | undefined;
  bodyClassName?: string | undefined;
}) {
  return (
    <section className={cn("rounded-xl border bg-card shadow-card", className)}>
      <header className="flex flex-wrap items-start justify-between gap-2 border-b px-4 py-3">
        <div>
          <h3 className="text-sm font-semibold">{title}</h3>
          {subtitle ? <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p> : null}
        </div>
        {action}
      </header>
      <div className={cn("p-4", bodyClassName)}>{children}</div>
    </section>
  );
}
