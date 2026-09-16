import { Link } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowDownToLine, ArrowLeftRight, ArrowUpFromLine, Boxes } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { FilterBar } from "@/components/common/FilterBar";
import { StatCard } from "@/components/common/StatCard";
import { ChartCard, PanelCard } from "@/components/common/ChartCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  consumptionByCategory,
  lowStockItems,
  stockItems,
  stockTxns,
  warehouses,
} from "@/mock/data";
import { formatDate, formatINR, formatNumber } from "@/utils/format";

const axis = { fontSize: 11, fill: "var(--color-muted-foreground)" };
const tooltipStyle = {
  borderRadius: 8,
  border: "1px solid var(--color-border)",
  background: "var(--color-popover)",
  fontSize: 12,
};

export function InventoryDashboard() {
  const value = stockItems.reduce((s, i) => s + i.value, 0);
  const today = stockTxns.slice(0, 12);

  return (
    <>
      <PageHeader
        title="Inventory Dashboard"
        description="Site-wise stock position, movement and consumption across all stores."
        breadcrumbs={[{ label: "Stores & Inventory" }, { label: "Inventory Dashboard" }]}
        actions={
          <>
            <Button variant="outline" size="sm" asChild>
              <Link to="/app/inventory/stock-issue">Stock issue</Link>
            </Button>
            <Button size="sm" asChild>
              <Link to="/app/inventory/stock-receipt">Stock receipt</Link>
            </Button>
          </>
        }
      />
      <FilterBar />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Items"
          value={String(stockItems.length)}
          hint={`${warehouses.length} stores`}
          icon={Boxes}
          to="inventory/stock-in-hand"
        />
        <StatCard
          label="Total Stock Value"
          value={formatINR(value, { compact: true })}
          delta={2.8}
          deltaLabel="vs last month"
          icon={Boxes}
          to="inventory/stock-valuation"
        />
        <StatCard
          label="Low Stock Items"
          value={String(lowStockItems.length)}
          hint="Below reorder level"
          icon={ArrowDownToLine}
          tone="warning"
        />
        <StatCard
          label="Out of Stock"
          value={String(stockItems.filter((i) => i.quantity === 0).length)}
          icon={ArrowUpFromLine}
          tone="danger"
        />
        <StatCard
          label="Today's Receipts"
          value={String(stockTxns.filter((t) => t.type === "Receipt").length)}
          icon={ArrowDownToLine}
          tone="success"
          to="inventory/stock-receipt"
        />
        <StatCard
          label="Today's Issues"
          value={String(stockTxns.filter((t) => t.type === "Issue").length)}
          icon={ArrowUpFromLine}
          tone="info"
          to="inventory/stock-issue"
        />
        <StatCard
          label="Today's Transfers"
          value={String(stockTxns.filter((t) => t.type === "Transfer").length)}
          icon={ArrowLeftRight}
          to="inventory/stock-transfer"
        />
        <StatCard
          label="Stores / Warehouses"
          value={String(warehouses.length)}
          icon={Boxes}
          to="inventory/warehouses"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <ChartCard
          title="Site-wise Stock Value"
          subtitle="₹ Lakh per store"
          className="xl:col-span-2"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={warehouses.slice(0, 8).map((w) => ({
                name: w.name.replace(" Store", ""),
                value: Math.round(w.value / 100000),
              }))}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ ...axis, fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                interval={0}
                angle={-12}
                height={50}
                textAnchor="end"
              />
              <YAxis tick={axis} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar
                dataKey="value"
                name="Stock value"
                fill="var(--color-chart-1)"
                radius={[4, 4, 0, 0]}
                barSize={22}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Consumption by Category" subtitle="₹ Lakh">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={consumptionByCategory}
                dataKey="value"
                nameKey="name"
                isAnimationActive={false}
                innerRadius={50}
                outerRadius={82}
                paddingAngle={2}
              >
                {consumptionByCategory.map((_, i) => (
                  <Cell key={i} fill={`var(--color-chart-${(i % 5) + 1})`} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <PanelCard title="Low Stock Alerts" subtitle="Raise indent immediately" bodyClassName="p-0">
          <ul className="divide-y">
            {lowStockItems.map((i) => (
              <li key={i.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{i.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {i.warehouse} · {i.project}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="num text-sm font-semibold text-destructive">
                    {formatNumber(i.quantity)} {i.unit}
                  </p>
                  <p className="num text-xs text-muted-foreground">
                    Reorder {formatNumber(i.reorderLevel)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </PanelCard>

        <PanelCard
          title="Latest Stock Movements"
          subtitle="Issue, receipt and transfer"
          bodyClassName="p-0"
        >
          <ul className="divide-y">
            {today.map((t) => (
              <li key={t.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {t.docNo} · {t.item}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {t.site} · {formatDate(t.date)}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="num text-sm font-semibold">
                    {formatNumber(t.quantity)} {t.unit}
                  </p>
                  <StatusBadge value={t.type} />
                </div>
              </li>
            ))}
          </ul>
        </PanelCard>
      </div>
    </>
  );
}
