import { useMemo, useState, type ReactNode } from "react";
import {
  ArrowDown,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  Columns3,
  Download,
  MoreHorizontal,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState } from "@/components/common/states";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export interface Column<T> {
  key: string;
  header: string;
  render?: ((row: T) => ReactNode) | undefined;
  value?: ((row: T) => string | number) | undefined;
  align?: "left" | "right" | "center" | undefined;
  className?: string | undefined;
  hideOnMobile?: boolean | undefined;
}

export interface TableFilter<T> {
  key: string;
  label: string;
  options: string[];
  predicate: (row: T, value: string) => boolean;
}

export interface DataTableProps<T> {
  rows: T[];
  columns: Column<T>[];
  getId: (row: T) => string;
  searchKeys?: ((row: T) => string) | undefined;
  filters?: TableFilter<T>[] | undefined;
  pageSize?: number | undefined;
  onRowClick?: ((row: T) => void) | undefined;
  rowActions?: ((row: T) => { label: string; onSelect?: (() => void) | undefined }[]) | undefined;
  toolbar?: ReactNode | undefined;
  title?: string | undefined;
  selectable?: boolean | undefined;
  dense?: boolean | undefined;
  emptyTitle?: string | undefined;
}

export function DataTable<T>({
  rows,
  columns,
  getId,
  searchKeys,
  filters = [],
  pageSize: initialPageSize = 10,
  onRowClick,
  rowActions,
  toolbar,
  title,
  selectable,
  dense,
  emptyTitle,
}: DataTableProps<T>) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<{ key: string; dir: "asc" | "desc" } | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [hidden, setHidden] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>([]);

  const visibleColumns = columns.filter((c) => !hidden.includes(c.key));

  const processed = useMemo(() => {
    let out = [...rows];
    if (query && searchKeys) {
      const q = query.toLowerCase();
      out = out.filter((r) => searchKeys(r).toLowerCase().includes(q));
    }
    for (const f of filters) {
      const v = filterValues[f.key];
      if (v && v !== "all") out = out.filter((r) => f.predicate(r, v));
    }
    if (sort) {
      const col = columns.find((c) => c.key === sort.key);
      out.sort((a, b) => {
        const av = col?.value
          ? col.value(a)
          : ((a as Record<string, unknown>)[sort.key] as string | number);
        const bv = col?.value
          ? col.value(b)
          : ((b as Record<string, unknown>)[sort.key] as string | number);
        if (typeof av === "number" && typeof bv === "number")
          return sort.dir === "asc" ? av - bv : bv - av;
        return sort.dir === "asc"
          ? String(av ?? "").localeCompare(String(bv ?? ""))
          : String(bv ?? "").localeCompare(String(av ?? ""));
      });
    }
    return out;
  }, [rows, query, searchKeys, filters, filterValues, sort, columns]);

  const totalPages = Math.max(1, Math.ceil(processed.length / pageSize));
  const current = Math.min(page, totalPages);
  const pageRows = processed.slice((current - 1) * pageSize, current * pageSize);

  function exportCsv() {
    const head = visibleColumns.map((c) => c.header).join(",");
    const body = processed
      .map((r) =>
        visibleColumns
          .map((c) => {
            const v = c.value ? c.value(r) : ((r as Record<string, unknown>)[c.key] ?? "");
            return `"${String(v).replace(/"/g, '""')}"`;
          })
          .join(","),
      )
      .join("\n");
    const blob = new Blob([`${head}\n${body}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(title ?? "buildcore-export").toLowerCase().replace(/\s+/g, "-")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${processed.length} rows to CSV`);
  }

  return (
    <div className="rounded-xl border bg-card shadow-card">
      <div className="flex flex-wrap items-center gap-2 border-b p-3">
        {searchKeys ? (
          <div className="relative min-w-[220px] flex-1">
            <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search records…"
              className="h-9 ps-8"
            />
          </div>
        ) : (
          <div className="flex-1" />
        )}

        {filters.map((f) => (
          <Select
            key={f.key}
            value={filterValues[f.key] ?? "all"}
            onValueChange={(v) => {
              setFilterValues((p) => ({ ...p, [f.key]: v }));
              setPage(1);
            }}
          >
            <SelectTrigger className="h-9 w-auto min-w-[140px] gap-1.5 text-xs">
              <SlidersHorizontal className="size-3.5 text-muted-foreground" />
              <SelectValue placeholder={f.label} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All {f.label}</SelectItem>
              {f.options.map((o) => (
                <SelectItem key={o} value={o}>
                  {o}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ))}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-9 gap-1.5">
              <Columns3 className="size-3.5" /> Columns
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel className="text-xs">Visible columns</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {columns.map((c) => (
              <DropdownMenuCheckboxItem
                key={c.key}
                checked={!hidden.includes(c.key)}
                onCheckedChange={(v) =>
                  setHidden((p) => (v ? p.filter((k) => k !== c.key) : [...p, c.key]))
                }
              >
                {c.header}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="outline" size="sm" className="h-9 gap-1.5" onClick={exportCsv}>
          <Download className="size-3.5" /> Export
        </Button>
        {toolbar}
      </div>

      <div className="scrollbar-slim overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr className="border-b bg-muted/40 text-left">
              {selectable ? (
                <th className="w-9 px-3">
                  <Checkbox
                    checked={
                      pageRows.length > 0 && pageRows.every((r) => selected.includes(getId(r)))
                    }
                    onCheckedChange={(v) => setSelected(v ? pageRows.map(getId) : [])}
                    aria-label="Select all"
                  />
                </th>
              ) : null}
              {visibleColumns.map((c) => (
                <th
                  key={c.key}
                  className={cn(
                    "px-3 py-2.5 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase select-none",
                    c.align === "right" && "text-right",
                    c.align === "center" && "text-center",
                    c.hideOnMobile && "hidden md:table-cell",
                  )}
                >
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 hover:text-foreground"
                    onClick={() =>
                      setSort((p) =>
                        p?.key === c.key
                          ? { key: c.key, dir: p.dir === "asc" ? "desc" : "asc" }
                          : { key: c.key, dir: "asc" },
                      )
                    }
                  >
                    {c.header}
                    {sort?.key === c.key ? (
                      sort.dir === "asc" ? (
                        <ArrowUp className="size-3" />
                      ) : (
                        <ArrowDown className="size-3" />
                      )
                    ) : null}
                  </button>
                </th>
              ))}
              {rowActions ? <th className="w-10 px-3" /> : null}
            </tr>
          </thead>
          <tbody>
            {pageRows.map((row) => (
              <tr
                key={getId(row)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={cn(
                  "border-b last:border-0 hover:bg-muted/40",
                  onRowClick && "cursor-pointer",
                )}
              >
                {selectable ? (
                  <td className="px-3" onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selected.includes(getId(row))}
                      onCheckedChange={(v) =>
                        setSelected((p) =>
                          v ? [...p, getId(row)] : p.filter((x) => x !== getId(row)),
                        )
                      }
                      aria-label="Select row"
                    />
                  </td>
                ) : null}
                {visibleColumns.map((c) => (
                  <td
                    key={c.key}
                    className={cn(
                      dense ? "px-3 py-1.5" : "px-3 py-2.5",
                      c.align === "right" && "num text-right",
                      c.align === "center" && "text-center",
                      c.hideOnMobile && "hidden md:table-cell",
                      c.className,
                    )}
                  >
                    {c.render
                      ? c.render(row)
                      : String((row as Record<string, unknown>)[c.key] ?? "—")}
                  </td>
                ))}
                {rowActions ? (
                  <td className="px-3" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-7">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {rowActions(row).map((a) => (
                          <DropdownMenuItem
                            key={a.label}
                            onSelect={() =>
                              a.onSelect ? a.onSelect() : toast.info(`${a.label} — demo action`)
                            }
                          >
                            {a.label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
        {pageRows.length === 0 ? <EmptyState title={emptyTitle ?? "No matching records"} /> : null}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t px-3 py-2.5 text-xs text-muted-foreground">
        <span>
          Showing {pageRows.length ? (current - 1) * pageSize + 1 : 0}–
          {(current - 1) * pageSize + pageRows.length} of {processed.length}
          {selected.length ? ` · ${selected.length} selected` : ""}
        </span>
        <div className="flex items-center gap-2">
          <Select
            value={String(pageSize)}
            onValueChange={(v) => {
              setPageSize(Number(v));
              setPage(1);
            }}
          >
            <SelectTrigger className="h-8 w-[110px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[10, 25, 50, 100].map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n} / page
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            disabled={current <= 1}
            onClick={() => setPage(current - 1)}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <span className="num px-1">
            {current} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            disabled={current >= totalPages}
            onClick={() => setPage(current + 1)}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
