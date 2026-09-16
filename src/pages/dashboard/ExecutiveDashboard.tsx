import { Link } from "react-router-dom";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AlertTriangle,
  Building2,
  ClipboardCheck,
  Coins,
  HardHat,
  Layers,
  PackageSearch,
  ReceiptIndianRupee,
  ShoppingCart,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { FilterBar } from "@/components/common/FilterBar";
import { StatCard } from "@/components/common/StatCard";
import { ChartCard, PanelCard } from "@/components/common/ChartCard";
import { ActivityFeed } from "@/components/common/ActivityFeed";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  activityFeed,
  approvalTasks,
  consumptionByCategory,
  dashboardTotals as t,
  lowStockItems,
  monthlySeries,
  paymentSchedule,
  projectCostSeries,
  projects,
  purchaseBills,
  tasks,
} from "@/mock/data";
import { compactINR, formatDate, formatINR } from "@/utils/format";

const axis = { fontSize: 11, fill: "var(--color-muted-foreground)" };
const tooltipStyle = {
  borderRadius: 8,
  border: "1px solid var(--color-border)",
  background: "var(--color-popover)",
  fontSize: 12,
};

export function ExecutiveDashboard() {
  const overdueTasks = tasks.filter((x) => x.status === "Overdue");
  const upcoming = paymentSchedule
    .filter((p) => p.status === "Due" || p.status === "Upcoming")
    .slice(0, 6);
  const overduePayments = purchaseBills.filter((b) => b.paymentStatus === "Overdue").slice(0, 5);

  return (
    <>
      <PageHeader
        title="Executive Dashboard"
        description="Company-wide position across projects, procurement, inventory, sales and finance."
        breadcrumbs={[{ label: "Executive Dashboard" }]}
        actions={
          <>
            <Button variant="outline" size="sm">
              Export MIS pack
            </Button>
            <Button size="sm" asChild>
              <Link to="/app/approvals">{t.pendingApprovals} approvals pending</Link>
            </Button>
          </>
        }
      />

      <FilterBar />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <StatCard
          label="Total Projects"
          value={String(t.totalProjects)}
          hint={`${t.activeProjects} active`}
          icon={Building2}
          to="projects"
        />
        <StatCard
          label="Avg Project Completion"
          value={`${t.avgProgress}%`}
          progress={t.avgProgress}
          icon={HardHat}
          tone="info"
          to="construction/site-progress"
        />
        <StatCard
          label="Total Project Budget"
          value={formatINR(t.totalBudget, { compact: true })}
          delta={4.2}
          deltaLabel="vs last FY"
          icon={Layers}
        />
        <StatCard
          label="Actual Project Cost"
          value={formatINR(t.actualCost, { compact: true })}
          hint={`${Math.round((t.actualCost / t.totalBudget) * 100)}% of budget consumed`}
          icon={Coins}
          tone="warning"
          to="construction/budget-vs-actual"
        />
        <StatCard
          label="Procurement Value"
          value={formatINR(t.procurementValue, { compact: true })}
          delta={8.6}
          deltaLabel="this FY"
          icon={ShoppingCart}
          to="procurement"
        />
        <StatCard
          label="Pending Purchase Orders"
          value={String(t.pendingPOs)}
          hint="Awaiting approval"
          icon={ClipboardCheck}
          tone="warning"
          to="procurement/purchase-orders"
        />
        <StatCard
          label="Inventory Value"
          value={formatINR(t.inventoryValue, { compact: true })}
          hint={`${lowStockItems.length} items below reorder`}
          icon={PackageSearch}
          to="inventory"
        />
        <StatCard
          label="Outstanding Receivables"
          value={formatINR(t.receivables, { compact: true })}
          delta={-3.1}
          deltaLabel="vs last month"
          icon={ReceiptIndianRupee}
          tone="danger"
          to="accounts/receivables"
        />
        <StatCard
          label="Outstanding Payables"
          value={formatINR(t.payables, { compact: true })}
          hint="Supplier + contractor dues"
          icon={Wallet}
          tone="warning"
          to="accounts/payables"
        />
        <StatCard
          label="Sales Value"
          value={formatINR(t.salesValue, { compact: true })}
          delta={12.4}
          deltaLabel="booking value"
          icon={TrendingUp}
          tone="success"
          to="sales/units"
        />
        <StatCard
          label="Collection"
          value={formatINR(t.collection, { compact: true })}
          hint={`${Math.round((t.collection / t.salesValue) * 100)}% of sales collected`}
          icon={Coins}
          tone="success"
          to="sales/payment-schedule"
        />
        <StatCard
          label="Pending Approvals"
          value={String(t.pendingApprovals)}
          hint="Indents, POs, GRNs, bills"
          icon={ClipboardCheck}
          tone="danger"
          to="approvals"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <ChartCard
          title="Project Progress"
          subtitle="Planned completion vs achieved progress"
          className="xl:col-span-2"
          height={280}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={projects.map((p) => ({
                name: p.name.split(" ")[0],
                progress: p.progress,
                planned: Math.min(100, p.progress + 8),
              }))}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="name" tick={axis} axisLine={false} tickLine={false} />
              <YAxis tick={axis} axisLine={false} tickLine={false} unit="%" />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar
                dataKey="planned"
                name="Planned %"
                fill="var(--color-chart-2)"
                radius={[4, 4, 0, 0]}
                barSize={18}
              />
              <Bar
                dataKey="progress"
                name="Actual %"
                fill="var(--color-chart-1)"
                radius={[4, 4, 0, 0]}
                barSize={18}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Inventory Consumption"
          subtitle="Material category share (₹ Lakh)"
          height={280}
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={consumptionByCategory}
                dataKey="value"
                nameKey="name"
                isAnimationActive={false}
                innerRadius={54}
                outerRadius={86}
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

        <ChartCard title="Budget vs Actual" subtitle="Project-wise, ₹ Crore" height={270}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={projectCostSeries}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="project" tick={axis} axisLine={false} tickLine={false} />
              <YAxis tick={axis} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar
                dataKey="budget"
                name="Budget"
                fill="var(--color-chart-2)"
                radius={[4, 4, 0, 0]}
                barSize={16}
              />
              <Bar
                dataKey="actual"
                name="Actual"
                fill="var(--color-chart-3)"
                radius={[4, 4, 0, 0]}
                barSize={16}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Procurement Trend" subtitle="Monthly PO value, ₹ Lakh" height={270}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlySeries}>
              <defs>
                <linearGradient id="proc" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="month" tick={axis} axisLine={false} tickLine={false} />
              <YAxis tick={axis} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area
                type="monotone"
                dataKey="procurement"
                stroke="var(--color-chart-1)"
                strokeWidth={2}
                fill="url(#proc)"
                name="Procurement"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Sales & Collection Trend" subtitle="₹ Lakh per month" height={270}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlySeries}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="month" tick={axis} axisLine={false} tickLine={false} />
              <YAxis tick={axis} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line
                type="monotone"
                dataKey="sales"
                name="Sales"
                stroke="var(--color-chart-4)"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="collection"
                name="Collection"
                stroke="var(--color-chart-1)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Receivables vs Payables"
          subtitle="Closing balances, ₹ Lakh"
          className="xl:col-span-2"
          height={260}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlySeries}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="month" tick={axis} axisLine={false} tickLine={false} />
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

        <ChartCard title="Project-wise Revenue" subtitle="Booking value, ₹ Crore" height={260}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={projectCostSeries} layout="vertical">
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--color-border)"
                horizontal={false}
              />
              <XAxis type="number" tick={axis} axisLine={false} tickLine={false} />
              <YAxis
                type="category"
                dataKey="project"
                tick={axis}
                axisLine={false}
                tickLine={false}
                width={70}
              />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar
                dataKey="revenue"
                name="Revenue"
                fill="var(--color-chart-4)"
                radius={[0, 4, 4, 0]}
                barSize={14}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <PanelCard
          title="Pending Approvals"
          subtitle="Awaiting your action"
          action={
            <Button variant="ghost" size="sm" asChild>
              <Link to="/app/approvals">View all</Link>
            </Button>
          }
          bodyClassName="p-0"
        >
          <ul className="divide-y">
            {approvalTasks.slice(0, 6).map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {a.document} · {a.docNo}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {a.project} · {a.level}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="num text-sm font-semibold">
                    {formatINR(a.amount, { compact: true })}
                  </p>
                  <StatusBadge value={a.priority} />
                </div>
              </li>
            ))}
          </ul>
        </PanelCard>

        <PanelCard
          title="Recent Activities"
          subtitle="Across all modules"
          bodyClassName="px-4 py-3"
        >
          <ActivityFeed events={activityFeed.slice(0, 7)} />
        </PanelCard>

        <PanelCard title="Project Alerts" subtitle="Needs management attention" bodyClassName="p-0">
          <ul className="divide-y">
            {projects.slice(0, 4).map((p) => (
              <li key={p.id} className="px-4 py-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-medium">{p.name}</p>
                  <span className="num text-xs text-muted-foreground">{p.progress}%</span>
                </div>
                <Progress value={p.progress} className="mt-2 h-1.5" />
                <p className="mt-1.5 text-xs text-muted-foreground">
                  Cost {compactINR(p.actualCost)} of {compactINR(p.budget)} ·{" "}
                  {p.actualCost / p.budget > p.progress / 100 ? (
                    <span className="text-destructive">cost ahead of progress</span>
                  ) : (
                    <span className="text-success">within budget curve</span>
                  )}
                </p>
              </li>
            ))}
          </ul>
        </PanelCard>

        <PanelCard title="Low Stock Items" subtitle="Below reorder level" bodyClassName="p-0">
          <ul className="divide-y">
            {lowStockItems.slice(0, 6).map((i) => (
              <li key={i.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{i.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{i.warehouse}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="num text-sm font-semibold text-destructive">
                    {i.quantity} {i.unit}
                  </p>
                  <p className="num text-xs text-muted-foreground">Reorder {i.reorderLevel}</p>
                </div>
              </li>
            ))}
          </ul>
        </PanelCard>

        <PanelCard
          title="Outstanding Supplier Payments"
          subtitle="Overdue bills"
          bodyClassName="p-0"
        >
          <ul className="divide-y">
            {overduePayments.map((b) => (
              <li key={b.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{b.supplier}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {b.billNo} · due {formatDate(b.dueDate)}
                  </p>
                </div>
                <p className="num shrink-0 text-sm font-semibold">
                  {formatINR(b.total - b.paid, { compact: true })}
                </p>
              </li>
            ))}
          </ul>
        </PanelCard>

        <PanelCard title="Upcoming Customer Payments" subtitle="Milestones due" bodyClassName="p-0">
          <ul className="divide-y">
            {upcoming.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{p.customer}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {p.milestone} · {formatDate(p.dueDate)}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="num text-sm font-semibold">
                    {formatINR(p.amount, { compact: true })}
                  </p>
                  <StatusBadge value={p.status} />
                </div>
              </li>
            ))}
          </ul>
        </PanelCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <PanelCard title="Upcoming Tasks" subtitle="Next 7 days" bodyClassName="p-0">
          <ul className="divide-y">
            {tasks
              .filter((x) => x.status !== "Completed")
              .slice(0, 6)
              .map((x) => (
                <li key={x.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{x.title}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {x.assignedTo} · due {formatDate(x.dueDate)}
                    </p>
                  </div>
                  <StatusBadge value={x.priority} />
                </li>
              ))}
          </ul>
        </PanelCard>

        <PanelCard
          title="Overdue Tasks"
          subtitle={`${overdueTasks.length} items past due date`}
          bodyClassName="p-0"
        >
          <ul className="divide-y">
            {overdueTasks.slice(0, 6).map((x) => (
              <li key={x.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                <div className="flex min-w-0 items-center gap-2.5">
                  <AlertTriangle className="size-4 shrink-0 text-destructive" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{x.title}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {x.assignedTo} · was due {formatDate(x.dueDate)}
                    </p>
                  </div>
                </div>
                <StatusBadge value="Overdue" />
              </li>
            ))}
          </ul>
        </PanelCard>
      </div>
    </>
  );
}
