import { Plus, Printer } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { DataTable } from "@/components/common/DataTable";
import { WorkflowChain } from "@/components/common/Timeline";
import { Button } from "@/components/ui/button";
import { presets, type Preset } from "@/pages/presets";
import { toast } from "sonner";

export function PresetPage({ preset }: { preset: Preset }) {
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
                onClick={() => toast.info(`${preset.primaryAction} — demo form`)}
              >
                <Plus className="size-3.5" /> {preset.primaryAction}
              </Button>
            ) : null}
          </>
        }
      />

      {preset.workflow ? (
        <div className="rounded-xl border bg-card px-4 py-3 shadow-card">
          <p className="mb-2 text-xs font-medium text-muted-foreground">Connected workflow</p>
          <WorkflowChain steps={preset.workflow.steps} activeIndex={preset.workflow.activeIndex} />
        </div>
      ) : null}

      {preset.kpis?.length ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {preset.kpis.map((k) => (
            <StatCard key={k.label} {...k} />
          ))}
        </div>
      ) : null}

      <DataTable
        title={preset.title}
        rows={preset.rows as never[]}
        columns={preset.columns}
        getId={preset.getId}
        searchKeys={preset.searchKeys}
        filters={preset.filters}
        rowActions={() => [
          { label: "View" },
          { label: "Edit" },
          { label: "Print" },
          { label: "Delete" },
        ]}
        onRowClick={(row) =>
          toast.info(`${preset.title} record selected: ${(row as { id?: string })?.id ?? ""}`)
        }
      />

      {preset.footnote}
    </>
  );
}

export function presetFor(slug: string): Preset | undefined {
  return presets[slug];
}
