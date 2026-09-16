import { useState, useMemo, useEffect } from "react";
import { Plus, Printer } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { DataTable } from "@/components/common/DataTable";
import { WorkflowChain } from "@/components/common/Timeline";
import { Button } from "@/components/ui/button";
import { presets } from "@/pages/presets";
import { IndentDetailDrawer } from "@/components/procurement/IndentDetailDrawer";
import { formatINR } from "@/utils/format";
import { toast } from "sonner";
import * as m from "@/mock/data";
import type { Indent } from "@/types";

interface IndentsPageProps {
  initialIndentId?: string | undefined;
}

export function IndentsPage({ initialIndentId }: IndentsPageProps) {
  const preset = presets["procurement/indents"];

  // Initialize indents state with mock records + any locally saved indents
  const [indentsList, setIndentsList] = useState<Indent[]>(() => {
    let list: Indent[] = [...m.indents];

    // Check localStorage for custom generated indents across projects
    if (typeof window !== "undefined") {
      try {
        const customKeys = Object.keys(localStorage).filter((k) =>
          k.startsWith("buildcore_indents_"),
        );
        for (const k of customKeys) {
          const raw = localStorage.getItem(k);
          if (raw) {
            const saved: Indent[] = JSON.parse(raw);
            // Prepend new ones that don't already exist
            for (const item of saved) {
              if (
                !list.some(
                  (existing) => existing.id === item.id || existing.indentNo === item.indentNo,
                )
              ) {
                list = [item, ...list];
              }
            }
          }
        }
      } catch (e) {
        console.error("Failed to load local indents:", e);
      }
    }

    return list;
  });

  // Selected indent for detail drawer
  const [selectedIndent, setSelectedIndent] = useState<Indent | null>(null);

  // Auto-select if initialIndentId is passed
  useEffect(() => {
    if (initialIndentId) {
      const match = indentsList.find(
        (i) =>
          i.id === initialIndentId ||
          i.indentNo === initialIndentId ||
          i.indentNo.replace(/\//g, "-") === initialIndentId,
      );
      if (match) {
        setSelectedIndent(match);
      }
    }
  }, [initialIndentId, indentsList]);

  // Dynamic KPIs that react to approval / status changes
  const dynamicKpis = useMemo(() => {
    const totalCount = indentsList.length;
    const pendingCount = indentsList.filter((i) => i.status === "Pending").length;
    const approvedCount = indentsList.filter((i) => i.status === "Approved").length;
    const totalValue = indentsList.reduce((s, i) => s + i.value, 0);

    return [
      {
        label: "Total Indents",
        value: String(totalCount),
        hint: "This financial year",
      },
      {
        label: "Pending Approval",
        value: String(pendingCount),
        tone: "warning" as const,
      },
      {
        label: "Approved",
        value: String(approvedCount),
        tone: "success" as const,
      },
      {
        label: "Indent Value",
        value: formatINR(totalValue, { compact: true }),
      },
    ];
  }, [indentsList]);

  // Handler for updating an indent (from actions / comments in drawer)
  function handleUpdateIndent(updated: Indent) {
    setIndentsList((prev) =>
      prev.map((item) =>
        item.id === updated.id || item.indentNo === updated.indentNo ? updated : item,
      ),
    );
    setSelectedIndent(updated);

    // Also persist to localStorage for project indents if applicable
    if (typeof window !== "undefined" && updated.project) {
      try {
        const key = `buildcore_indents_${updated.project}`;
        const raw = localStorage.getItem(key);
        const existing: Indent[] = raw ? JSON.parse(raw) : [];
        const filtered = existing.filter(
          (i) => i.id !== updated.id && i.indentNo !== updated.indentNo,
        );
        localStorage.setItem(key, JSON.stringify([updated, ...filtered]));
      } catch (err) {
        console.error("Failed to sync indent to localStorage:", err);
      }
    }
  }

  function handleDeleteIndent(target: Indent) {
    setIndentsList((prev) => prev.filter((i) => i.id !== target.id));
    if (selectedIndent?.id === target.id) {
      setSelectedIndent(null);
    }
    toast.success(`Indent ${target.indentNo} removed`);
  }

  if (!preset) return null;

  return (
    <>
      <PageHeader
        title={preset.title}
        description={preset.description}
        breadcrumbs={preset.breadcrumbs}
        actions={
          <>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => window.print()}>
              <Printer className="size-3.5" /> Print
            </Button>
            {preset.primaryAction ? (
              <Button
                size="sm"
                className="gap-1.5"
                onClick={() => toast.info(`${preset.primaryAction} — requisition form`)}
              >
                <Plus className="size-3.5" /> {preset.primaryAction}
              </Button>
            ) : null}
          </>
        }
      />

      {/* Connected Workflow Chain */}
      {preset.workflow ? (
        <div className="rounded-xl border bg-card px-4 py-3 shadow-card">
          <p className="mb-2 text-xs font-medium text-muted-foreground">Connected workflow</p>
          <WorkflowChain steps={preset.workflow.steps} activeIndex={preset.workflow.activeIndex} />
        </div>
      ) : null}

      {/* Dynamic Top KPIs */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {dynamicKpis.map((k) => (
          <StatCard key={k.label} {...k} />
        ))}
      </div>

      {/* DataTable with dynamic click to open detail drawer */}
      <DataTable
        title={preset.title}
        rows={indentsList as never[]}
        columns={preset.columns}
        getId={preset.getId}
        searchKeys={preset.searchKeys}
        filters={preset.filters}
        rowActions={(row) => [
          {
            label: "View Details",
            onSelect: () => setSelectedIndent(row as Indent),
          },
          {
            label: "Edit Indent",
            onSelect: () => setSelectedIndent(row as Indent),
          },
          {
            label: "Print",
            onSelect: () => window.print(),
          },
          {
            label: "Delete",
            onSelect: () => handleDeleteIndent(row as Indent),
          },
        ]}
        onRowClick={(row) => setSelectedIndent(row as Indent)}
      />

      {preset.footnote}

      {/* Detailed Slide-over Drawer */}
      <IndentDetailDrawer
        indent={selectedIndent}
        open={Boolean(selectedIndent)}
        onClose={() => setSelectedIndent(null)}
        onUpdateIndent={handleUpdateIndent}
      />
    </>
  );
}
