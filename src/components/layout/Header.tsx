import { Link, useNavigate } from "react-router-dom";
import {
  Bell,
  Building2,
  ChevronDown,
  KeyRound,
  LogOut,
  Menu,
  Moon,
  Plus,
  Search,
  Sun,
  UserCircle2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { StatusBadge } from "@/components/common/StatusBadge";
import { useAuth } from "@/hooks/useAuth";
import {
  customers,
  employees,
  indents,
  notifications,
  projects,
  purchaseOrders,
  stockItems,
  suppliers,
  units,
} from "@/mock/data";
import { cn } from "@/lib/utils";

interface SearchHit {
  label: string;
  sub: string;
  group: string;
  slug: string;
}

export function Header({ onOpenMenu }: { onOpenMenu: () => void }) {
  const { session, signOut } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [dark, setDark] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const searchIndex = useMemo<SearchHit[]>(
    () => [
      ...projects.map((p) => ({
        label: p.name,
        sub: `${p.code} · ${p.location}`,
        group: "Projects",
        slug: "projects",
      })),
      ...customers.slice(0, 12).map((c) => ({
        label: c.name,
        sub: `${c.customerNo} · ${c.project}`,
        group: "Customers",
        slug: "crm/customers",
      })),
      ...suppliers.map((s) => ({
        label: s.name,
        sub: `${s.category} · ${s.city}`,
        group: "Suppliers",
        slug: "procurement/vendor-analysis",
      })),
      ...stockItems.slice(0, 14).map((i) => ({
        label: i.name,
        sub: `${i.code} · ${i.warehouse}`,
        group: "Items",
        slug: "inventory/stock-in-hand",
      })),
      ...purchaseOrders.slice(0, 12).map((p) => ({
        label: p.poNo,
        sub: `${p.supplier} · ${p.project}`,
        group: "Purchase Orders",
        slug: "procurement/purchase-orders",
      })),
      ...indents.slice(0, 12).map((i) => ({
        label: i.indentNo,
        sub: `${i.project} · ${i.department}`,
        group: "Indents",
        slug: "procurement/indents",
      })),
      ...units.slice(0, 14).map((u) => ({
        label: `${u.unitNo} — ${u.unitType}`,
        sub: `${u.project} · ${u.tower}`,
        group: "Units",
        slug: "sales/units",
      })),
      ...employees.slice(0, 12).map((e) => ({
        label: e.name,
        sub: `${e.empId} · ${e.designation}`,
        group: "Employees",
        slug: "hr/employees",
      })),
    ],
    [],
  );

  const hits =
    query.length > 1
      ? searchIndex
          .filter((h) => `${h.label} ${h.sub}`.toLowerCase().includes(query.toLowerCase()))
          .slice(0, 8)
      : [];

  const unread = notifications.filter((n) => n.unread).length;

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-2 border-b bg-surface/95 px-3 backdrop-blur sm:px-4">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onOpenMenu}
        aria-label="Open menu"
      >
        <Menu className="size-5" />
      </Button>

      <div className="relative w-full max-w-md">
        <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search projects, POs, items, customers…"
          className="h-9 ps-8"
        />
        {hits.length ? (
          <div className="absolute top-11 left-0 z-40 w-full overflow-hidden rounded-lg border bg-popover shadow-pop">
            {hits.map((h) => (
              <Link
                key={`${h.group}-${h.label}`}
                to={`/app/${h.slug}`}
                onClick={() => setQuery("")}
                className="flex items-center justify-between gap-3 border-b px-3 py-2 last:border-0 hover:bg-muted"
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">{h.label}</span>
                  <span className="block truncate text-xs text-muted-foreground">{h.sub}</span>
                </span>
                <span className="shrink-0 text-[10px] tracking-wide text-muted-foreground uppercase">
                  {h.group}
                </span>
              </Link>
            ))}
          </div>
        ) : null}
      </div>

      <div className="ms-auto flex items-center gap-1.5">
        <div className="hidden items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs text-muted-foreground xl:flex">
          <Building2 className="size-3.5" />
          Buildcore Infra Pvt Ltd
          <ChevronDown className="size-3" />
        </div>

        <Button
          variant="outline"
          size="sm"
          className="hidden gap-1.5 sm:flex"
          onClick={() => navigate("/app/procurement/indents")}
        >
          <Plus className="size-3.5" /> New Indent
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setDark((d) => !d)}
          aria-label="Toggle theme"
        >
          {dark ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}
        </Button>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
              <Bell className="size-[18px]" />
              {unread ? (
                <span className="absolute top-1.5 right-1.5 grid size-4 place-items-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground">
                  {unread}
                </span>
              ) : null}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-[340px] p-0">
            <div className="flex items-center justify-between border-b px-3 py-2.5">
              <p className="text-sm font-semibold">Notifications</p>
              <span className="text-xs text-muted-foreground">{unread} unread</span>
            </div>
            <ul className="max-h-80 overflow-y-auto">
              {notifications.map((n) => (
                <li
                  key={n.id}
                  className={cn(
                    "border-b px-3 py-2.5 last:border-0",
                    n.unread && "bg-primary/[0.04]",
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium">{n.title}</p>
                    <span className="shrink-0 text-[11px] text-muted-foreground">{n.time}</span>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">{n.detail}</p>
                </li>
              ))}
            </ul>
            <div className="border-t p-2">
              <Link
                to="/app/approvals"
                className="block rounded-md px-2 py-1.5 text-center text-xs font-medium text-primary hover:bg-muted"
              >
                Open approval inbox
              </Link>
            </div>
          </PopoverContent>
        </Popover>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-lg px-1.5 py-1 hover:bg-muted">
              <span className="grid size-8 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                {session?.user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2) ?? "AD"}
              </span>
              <span className="hidden text-left leading-tight sm:block">
                <span className="block text-[13px] font-medium">
                  {session?.user.name ?? "Admin"}
                </span>
                <span className="block text-[11px] text-muted-foreground">
                  {session?.user.role ?? "Director"}
                </span>
              </span>
              <ChevronDown className="hidden size-3.5 text-muted-foreground sm:block" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <p className="text-sm">{session?.user.name}</p>
              <p className="text-xs font-normal text-muted-foreground">{session?.user.email}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => navigate("/app/profile")}>
              <UserCircle2 className="size-4" /> My Profile
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => navigate("/app/change-password")}>
              <KeyRound className="size-4" /> Change Password
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={() => {
                signOut();
                navigate("/");
              }}
            >
              <LogOut className="size-4" /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
