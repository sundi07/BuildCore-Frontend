import type { ActivityEvent } from "@/types";

export function ActivityFeed({ events }: { events: ActivityEvent[] }) {
  return (
    <ul className="divide-y">
      {events.map((e) => (
        <li key={e.id} className="flex gap-3 py-2.5 first:pt-0 last:pb-0">
          <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-primary-soft text-[11px] font-semibold text-primary">
            {e.actor
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)}
          </span>
          <div className="min-w-0">
            <p className="text-sm leading-snug">
              <span className="font-medium">{e.actor}</span> {e.action}{" "}
              <span className="font-medium text-primary">{e.target}</span>
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {e.module} · {e.time}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
