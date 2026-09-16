import { toast } from "sonner";
import { Camera, ClipboardCheck, HardHat, MapPin, PackageCheck, Smartphone } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { PanelCard } from "@/components/common/ChartCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { attendance, dprs, materialRequisitions, stockTxns } from "@/mock/data";
import { formatDate, formatNumber } from "@/utils/format";

const quickActions = [
  { label: "Site attendance", detail: "Mark labour attendance with geo-tag", icon: HardHat },
  {
    label: "Daily progress report",
    detail: "Capture work done, manpower and machinery",
    icon: ClipboardCheck,
  },
  { label: "Material receipt", detail: "Record challan and GRN at the gate", icon: PackageCheck },
  { label: "Site photos", detail: "Upload progress photos to the project album", icon: Camera },
  {
    label: "Material requisition",
    detail: "Raise a site requisition from the field",
    icon: Smartphone,
  },
  { label: "Site visit check-in", detail: "Log engineer visits with location", icon: MapPin },
];

export function MobileOperationsPage() {
  return (
    <>
      <PageHeader
        title="Mobile Operations"
        description="Field-first workflows for site engineers, storekeepers and supervisors — optimised for phones."
        breadcrumbs={[{ label: "Mobile Operations" }]}
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="DPRs Submitted Today"
          value={String(dprs.slice(0, 6).length)}
          icon={ClipboardCheck}
          tone="success"
        />
        <StatCard
          label="Labour Marked Present"
          value={formatNumber(attendance.reduce((s, a) => s + a.present, 0))}
          icon={HardHat}
        />
        <StatCard
          label="Gate Receipts"
          value={String(stockTxns.filter((t) => t.type === "Receipt").length)}
          icon={PackageCheck}
          tone="info"
        />
        <StatCard
          label="Field Requisitions"
          value={String(materialRequisitions.length)}
          icon={Smartphone}
          tone="warning"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {quickActions.map((a) => (
          <button
            key={a.label}
            type="button"
            onClick={() => toast.info(`${a.label} — mobile form (demo)`)}
            className="flex items-start gap-3 rounded-xl border bg-card p-4 text-left shadow-card transition-colors hover:border-primary/50"
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
              <a.icon className="size-4" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold">{a.label}</span>
              <span className="block text-xs text-muted-foreground">{a.detail}</span>
            </span>
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <PanelCard title="Latest Field DPRs" subtitle="Submitted from mobile" bodyClassName="p-0">
          <ul className="divide-y">
            {dprs.slice(0, 7).map((d) => (
              <li key={d.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {d.activities[0]?.activity ?? d.dprNo}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {d.site} · {formatDate(d.date)} · {d.labour.skilled + d.labour.unskilled}{" "}
                    workers
                  </p>
                </div>
                <StatusBadge value={d.status} />
              </li>
            ))}
          </ul>
        </PanelCard>

        <PanelCard title="Site Requisitions" subtitle="Raised by field teams" bodyClassName="p-0">
          <ul className="divide-y">
            {materialRequisitions.slice(0, 7).map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{r.reqNo}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {r.site} · {r.department}
                  </p>
                </div>
                <StatusBadge value={r.status} />
              </li>
            ))}
          </ul>
        </PanelCard>
      </div>

      <Button
        className="w-full sm:hidden"
        onClick={() => toast.info("Offline sync complete (demo)")}
      >
        Sync offline entries
      </Button>
    </>
  );
}
