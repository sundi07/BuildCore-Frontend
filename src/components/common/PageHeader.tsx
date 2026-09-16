import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";

export function PageHeader({
  title,
  description,
  breadcrumbs = [],
  actions,
  meta,
}: {
  title: string;
  description?: string | undefined;
  breadcrumbs?: { label: string; to?: string | undefined }[] | undefined;
  actions?: ReactNode | undefined;
  meta?: ReactNode | undefined;
}) {
  return (
    <div className="flex flex-col gap-3">
      <nav className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
        <Link to="/app/dashboard" className="hover:text-foreground">
          Home
        </Link>
        {breadcrumbs.map((b) => (
          <span key={b.label} className="flex items-center gap-1">
            <ChevronRight className="size-3" />
            {b.to ? (
              <Link to={`/app/${b.to}`} className="hover:text-foreground">
                {b.label}
              </Link>
            ) : (
              <span className="text-foreground">{b.label}</span>
            )}
          </span>
        ))}
      </nav>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-semibold tracking-tight sm:text-[22px]">
            {title}
          </h1>
          {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
          {meta}
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
    </div>
  );
}
