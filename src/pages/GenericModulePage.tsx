import { toast } from "sonner";
import { ArrowUpRight, CircleDot, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { PanelCard } from "@/components/common/ChartCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { navigation, slugIndex } from "@/config/navigation";
import { activityFeed, projects } from "@/mock/data";
import { formatINR } from "@/utils/format";

export function GenericModulePage({ slug }: { slug: string }) {
  const meta = slugIndex[slug] ?? { group: "Workspace", label: "Module" };
  const group = navigation.find((g) => g.label === meta.group);
  const siblings = (group?.items ?? []).filter((i) => i.slug !== slug).slice(0, 8);

  return (
    <>
      <PageHeader
        title={meta.label}
        description={`${meta.label} workspace under ${meta.group}. Records below are demo data connected to the same projects and masters used across BUILDCORE.`}
        breadcrumbs={[{ label: meta.group }, { label: meta.label }]}
        actions={
          <Button
            size="sm"
            className="gap-1.5"
            onClick={() => toast.info(`New ${meta.label} — demo form`)}
          >
            <Plus className="size-3.5" /> New entry
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Active Projects"
          value={String(projects.filter((p) => p.status === "In Progress").length)}
        />
        <StatCard
          label="Portfolio Budget"
          value={formatINR(
            projects.reduce((s, p) => s + p.budget, 0),
            { compact: true },
          )}
          tone="info"
        />
        <StatCard label="Records This Month" value={String(18 + slug.length)} tone="success" />
        <StatCard label="Pending Actions" value={String(3 + (slug.length % 7))} tone="warning" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <PanelCard
          title={`${meta.label} — project coverage`}
          subtitle="Status per project"
          bodyClassName="p-0"
        >
          <ul className="divide-y">
            {projects.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{p.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {p.location} · {p.type} · {p.progress}% complete
                  </p>
                </div>
                <StatusBadge value={p.status} />
              </li>
            ))}
          </ul>
        </PanelCard>

        <PanelCard
          title="Recent activity"
          subtitle="Linked documents and users"
          bodyClassName="p-0"
        >
          <ul className="divide-y">
            {activityFeed.slice(0, 8).map((a) => (
              <li key={a.id} className="flex items-start gap-3 px-4 py-2.5">
                <CircleDot className="mt-0.5 size-3.5 shrink-0 text-primary" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {a.action} {a.target}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {a.module} · {a.actor} · {a.time}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </PanelCard>
      </div>

      {siblings.length ? (
        <PanelCard title={`More in ${meta.group}`} subtitle="Related screens in this module">
          <div className="flex flex-wrap gap-2">
            {siblings.map((s) => (
              <Button key={s.slug} size="sm" variant="outline" className="gap-1.5" asChild>
                <Link to={`/app/${s.slug}`}>
                  {s.label} <ArrowUpRight className="size-3.5" />
                </Link>
              </Button>
            ))}
          </div>
        </PanelCard>
      ) : null}
    </>
  );
}
