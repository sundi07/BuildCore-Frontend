import { Link } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ClipboardList, FileCheck2, PackageCheck, ShoppingCart } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { FilterBar } from "@/components/common/FilterBar";
import { StatCard } from "@/components/common/StatCard";
import { ChartCard, PanelCard } from "@/components/common/ChartCard";
import { WorkflowChain } from "@/components/common/Timeline";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  grns,
  indents,
  monthlySeries,
  purchaseBills,
  purchaseOrders,
  suppliers,
} from "@/mock/data";
import { formatDate, formatINR } from "@/utils/format";

const axis = { fontSize: 11, fill: "var(--color-muted-foreground)" };
const tooltipStyle = {
  borderRadius: 8,
  border: "1px solid var(--color-border)",
  background: "var(--color-popover)",
  fontSize: 12,
};

export function ProcurementDashboard() {
  const poValue = purchaseOrders.reduce((s, p) => s + p.total, 0);
  const outstanding = purchaseBills.reduce((s, b) => s + (b.total - b.paid), 0);

  return (
    <>
      <PageHeader
        title="Procurement Dashboard"
        description="Indent to payment pipeline across all projects with vendor performance."
        breadcrumbs={[{ label: "Procurement & Purchase" }, { label: "Procurement Dashboard" }]}
        actions={
          <Button size="sm" asChild>
            <Link to="/app/procurement/indents">Open indents</Link>
          </Button>
        }
      />
      <FilterBar />

      <div className="rounded-xl border bg-card px-4 py-3 shadow-card">
        <p className="mb-2 text-xs font-medium text-muted-foreground">Procurement cycle</p>
        <WorkflowChain
          steps={[
            "Indent",
            "Approval",
            "Enquiry",
            "Quotation",
            "Comparative",
            "PO",
            "Challan",
            "GRN",
            "Bill",
            "Payment",
          ]}
          activeIndex={5}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Open Indents"
          value={String(indents.filter((i) => i.status !== "Approved").length)}
          hint="Awaiting action"
          icon={ClipboardList}
          tone="warning"
          to="procurement/indents"
        />
        <StatCard
          label="PO Value (FY)"
          value={formatINR(poValue, { compact: true })}
          delta={8.6}
          deltaLabel="vs last FY"
          icon={ShoppingCart}
          to="procurement/purchase-orders"
        />
        <StatCard
          label="GRNs Pending Inspection"
          value={String(grns.filter((g) => g.inspection === "Pending").length)}
          icon={PackageCheck}
          tone="info"
          to="procurement/grn"
        />
        <StatCard
          label="Supplier Outstanding"
          value={formatINR(outstanding, { compact: true })}
          icon={FileCheck2}
          tone="danger"
          to="procurement/purchase-bills"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <ChartCard
          title="Procurement Trend"
          subtitle="Monthly PO value, ₹ Lakh"
          className="xl:col-span-2"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlySeries}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="month" tick={axis} axisLine={false} tickLine={false} />
              <YAxis tick={axis} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line
                type="monotone"
                dataKey="procurement"
                name="PO Value"
                stroke="var(--color-chart-1)"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="consumption"
                name="Consumption"
                stroke="var(--color-chart-3)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Purchase Value by Supplier" subtitle="Top vendors, ₹ Crore">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={suppliers.map((s) => ({
                name: s.name.split(" ")[0],
                value: Math.round(s.purchaseValue / 10000000),
              }))}
              layout="vertical"
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--color-border)"
                horizontal={false}
              />
              <XAxis type="number" tick={axis} axisLine={false} tickLine={false} />
              <YAxis
                type="category"
                dataKey="name"
                tick={axis}
                axisLine={false}
                tickLine={false}
                width={80}
              />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar
                dataKey="value"
                name="Purchase"
                fill="var(--color-chart-1)"
                radius={[0, 4, 4, 0]}
                barSize={13}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <PanelCard
          title="Indents Awaiting Approval"
          subtitle="Route to Level 1 / Level 2"
          bodyClassName="p-0"
          action={
            <Button variant="ghost" size="sm" asChild>
              <Link to="/app/procurement/indent-approvals">Approval inbox</Link>
            </Button>
          }
        >
          <ul className="divide-y">
            {indents
              .filter((i) => i.status === "Pending")
              .slice(0, 6)
              .map((i) => (
                <li key={i.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{i.indentNo}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {i.project} · {i.requestedBy} · required {formatDate(i.requiredDate)}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="num text-sm font-semibold">
                      {formatINR(i.value, { compact: true })}
                    </p>
                    <StatusBadge value={i.priority} />
                  </div>
                </li>
              ))}
          </ul>
        </PanelCard>

        <PanelCard
          title="Recent Purchase Orders"
          subtitle="Latest released orders"
          bodyClassName="p-0"
        >
          <ul className="divide-y">
            {purchaseOrders.slice(0, 6).map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{p.poNo}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {p.supplier} · {p.project}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="num text-sm font-semibold">
                    {formatINR(p.total, { compact: true })}
                  </p>
                  <StatusBadge value={p.status} />
                </div>
              </li>
            ))}
          </ul>
        </PanelCard>
      </div>
    </>
  );
}
