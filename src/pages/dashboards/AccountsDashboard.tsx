import { Link } from "react-router-dom";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BadgeIndianRupee, Landmark, ReceiptIndianRupee, Wallet } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { FilterBar } from "@/components/common/FilterBar";
import { StatCard } from "@/components/common/StatCard";
import { ChartCard, PanelCard } from "@/components/common/ChartCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  gstRegister,
  ledgerEntries,
  monthlySeries,
  payables,
  receivables,
  tdsRegister,
} from "@/mock/data";
import { formatDate, formatINR } from "@/utils/format";

const axis = { fontSize: 11, fill: "var(--color-muted-foreground)" };
const tooltipStyle = {
  borderRadius: 8,
  border: "1px solid var(--color-border)",
  background: "var(--color-popover)",
  fontSize: 12,
};

export function AccountsDashboard() {
  const ar = receivables.reduce((s, r) => s + r.outstanding, 0);
  const ap = payables.reduce((s, r) => s + r.outstanding, 0);
  const ageing = ["0-30", "31-60", "61-90", "90+"].map((bucket) => ({
    bucket,
    receivable: Math.round(
      receivables.filter((r) => r.ageingBucket === bucket).reduce((s, r) => s + r.outstanding, 0) /
        100000,
    ),
    payable: Math.round(
      payables.filter((r) => r.ageingBucket === bucket).reduce((s, r) => s + r.outstanding, 0) /
        100000,
    ),
  }));

  return (
    <>
      <PageHeader
        title="Accounting Dashboard"
        description="Cash position, receivables, payables and statutory dues in one view."
        breadcrumbs={[{ label: "Financial Accounting" }, { label: "Accounting Dashboard" }]}
        actions={
          <Button size="sm" asChild>
            <Link to="/app/accounts/vouchers">New voucher</Link>
          </Button>
        }
      />
      <FilterBar />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Outstanding Receivables"
          value={formatINR(ar, { compact: true })}
          hint={`${receivables.length} open invoices`}
          icon={ReceiptIndianRupee}
          tone="danger"
          to="accounts/receivables"
        />
        <StatCard
          label="Outstanding Payables"
          value={formatINR(ap, { compact: true })}
          hint={`${payables.length} open bills`}
          icon={Wallet}
          tone="warning"
          to="accounts/payables"
        />
        <StatCard
          label="GST Input Credit"
          value={formatINR(
            gstRegister.filter((g) => g.type === "Input").reduce((s, g) => s + g.cgst + g.sgst, 0),
            { compact: true },
          )}
          icon={Landmark}
          tone="success"
          to="accounts/gst"
        />
        <StatCard
          label="TDS Payable"
          value={formatINR(
            tdsRegister.filter((t) => t.status === "Payable").reduce((s, t) => s + t.tds, 0),
            { compact: true },
          )}
          icon={BadgeIndianRupee}
          tone="info"
          to="accounts/tds"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <ChartCard
          title="Collection vs Payment"
          subtitle="₹ Lakh per month"
          className="xl:col-span-2"
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlySeries}>
              <defs>
                <linearGradient id="coll" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.32} />
                  <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="pay" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-chart-3)" stopOpacity={0.32} />
                  <stop offset="100%" stopColor="var(--color-chart-3)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="month" tick={axis} axisLine={false} tickLine={false} />
              <YAxis tick={axis} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Area
                type="monotone"
                dataKey="collection"
                name="Collection"
                stroke="var(--color-chart-1)"
                fill="url(#coll)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="procurement"
                name="Payments"
                stroke="var(--color-chart-3)"
                fill="url(#pay)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Ageing Analysis" subtitle="₹ Lakh by bucket">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={ageing}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="bucket" tick={axis} axisLine={false} tickLine={false} />
              <YAxis tick={axis} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar
                dataKey="receivable"
                name="Receivable"
                fill="var(--color-chart-1)"
                radius={[4, 4, 0, 0]}
                barSize={14}
              />
              <Bar
                dataKey="payable"
                name="Payable"
                fill="var(--color-chart-3)"
                radius={[4, 4, 0, 0]}
                barSize={14}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <PanelCard title="Recent Vouchers" subtitle="Last postings" bodyClassName="p-0">
          <ul className="divide-y">
            {ledgerEntries.slice(0, 8).map((e) => (
              <li key={e.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {e.voucherNo} · {e.account}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {e.narration} · {formatDate(e.date)}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="num text-sm font-semibold">
                    {formatINR(e.debit || e.credit, { compact: true })}
                  </p>
                  <StatusBadge value={e.voucherType} />
                </div>
              </li>
            ))}
          </ul>
        </PanelCard>

        <PanelCard
          title="Top Receivables"
          subtitle="Highest customer outstanding"
          bodyClassName="p-0"
        >
          <ul className="divide-y">
            {[...receivables]
              .sort((a, b) => b.outstanding - a.outstanding)
              .slice(0, 8)
              .map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{r.party}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {r.invoiceNo} · {r.project}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="num text-sm font-semibold text-destructive">
                      {formatINR(r.outstanding, { compact: true })}
                    </p>
                    <StatusBadge value={`${r.ageingBucket} days`} />
                  </div>
                </li>
              ))}
          </ul>
        </PanelCard>
      </div>
    </>
  );
}
