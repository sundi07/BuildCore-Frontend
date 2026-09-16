import { Link, useLocation } from "react-router-dom";
import { ChevronDown, HardHat, X } from "lucide-react";
import { useEffect, useState } from "react";
import { navigation } from "@/config/navigation";
import { cn } from "@/lib/utils";

function useCurrentSlug() {
  const location = useLocation();
  const match = location.pathname.match(/^\/app\/?(.*)$/);
  const splat = match?.[1]?.replace(/\/+$/, "");
  return splat || "dashboard";
}

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const slug = useCurrentSlug();
  const activeGroup =
    navigation.find(
      (g) =>
        g.slug === slug ||
        (g.slug && slug.startsWith(`${g.slug}/`)) ||
        g.items?.some((i) => i.slug === slug || slug.startsWith(`${i.slug}/`)),
    )?.id ?? "dashboard";
  const [open, setOpen] = useState<string[]>([activeGroup]);

  useEffect(() => {
    setOpen((p) => (p.includes(activeGroup) ? p : [...p, activeGroup]));
  }, [activeGroup]);

  return (
    <nav className="scrollbar-slim flex-1 overflow-y-auto px-2 py-3">
      {navigation.map((group) => {
        const Icon = group.icon;
        const isOpen = open.includes(group.id);
        const groupActive =
          group.slug === slug ||
          (group.slug && slug.startsWith(`${group.slug}/`)) ||
          group.items?.some((i) => i.slug === slug || slug.startsWith(`${i.slug}/`));

        if (group.slug) {
          return (
            <Link
              key={group.id}
              to={`/app/${group.slug}`}
              onClick={onNavigate}
              className={cn(
                "mb-0.5 flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-colors",
                groupActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              <Icon className="size-4 shrink-0" />
              {group.label}
            </Link>
          );
        }

        return (
          <div key={group.id} className="mb-0.5">
            <button
              type="button"
              onClick={() =>
                setOpen((p) => (isOpen ? p.filter((x) => x !== group.id) : [...p, group.id]))
              }
              className={cn(
                "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-colors",
                groupActive
                  ? "text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              <Icon className="size-4 shrink-0" />
              <span className="flex-1 text-left">{group.label}</span>
              <ChevronDown
                className={cn("size-3.5 transition-transform", isOpen && "rotate-180")}
              />
            </button>
            {isOpen ? (
              <ul className="mt-0.5 ms-[19px] space-y-px border-s border-sidebar-border ps-2.5">
                {group.items?.map((item) => (
                  <li key={item.slug}>
                    <Link
                      to={`/app/${item.slug}`}
                      onClick={onNavigate}
                      className={cn(
                        "block rounded-md px-2.5 py-1.5 text-[12.5px] transition-colors",
                        slug === item.slug
                          ? "bg-sidebar-primary/90 font-medium text-sidebar-primary-foreground"
                          : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      )}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        );
      })}
    </nav>
  );
}

export function BrandMark({ compact }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="grid size-9 place-items-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
        <HardHat className="size-5" />
      </span>
      {!compact ? (
        <div className="leading-tight">
          <p className="font-display text-[15px] font-bold tracking-tight text-sidebar-accent-foreground">
            BUILDCORE
          </p>
          <p className="text-[10px] tracking-[0.14em] text-sidebar-foreground/60 uppercase">
            Construction ERP
          </p>
        </div>
      ) : null}
    </div>
  );
}

export function DesktopSidebar() {
  return (
    <aside className="hidden w-[268px] shrink-0 flex-col bg-sidebar lg:flex">
      <div className="flex h-16 items-center border-b border-sidebar-border px-4">
        <BrandMark />
      </div>
      <SidebarNav />
      <div className="border-t border-sidebar-border p-3">
        <p className="text-[11px] text-sidebar-foreground/60">
          FY 2026-27 · Buildcore Infra Pvt Ltd
        </p>
      </div>
    </aside>
  );
}

export function MobileSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="absolute inset-0 bg-foreground/40" onClick={onClose} />
      <div className="absolute inset-y-0 start-0 flex w-[280px] flex-col bg-sidebar">
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
          <BrandMark />
          <button onClick={onClose} className="text-sidebar-foreground" aria-label="Close menu">
            <X className="size-5" />
          </button>
        </div>
        <SidebarNav onNavigate={onClose} />
      </div>
    </div>
  );
}
