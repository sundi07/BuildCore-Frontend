import { Link } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Funnel,
  FunnelChart,
  Legend,
  LabelList,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CalendarClock, PhoneCall, TrendingUp, Users } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { FilterBar } from "@/components/common/FilterBar";
import { StatCard } from "@/components/common/StatCard";
import { ChartCard, PanelCard } from "@/components/common/ChartCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import { WorkflowChain } from "@/components/common/Timeline";
import { Button } from "@/components/ui/button";
import { appointments, customers, followUps, leads } from "@/mock/data";
import { formatDate, formatINR } from "@/utils/format";

const axis = { fontSize: 11, fill: "var(--color-muted-foreground)" };
const tooltipStyle = {
  borderRadius: 8,
  border: "1px solid var(--color-border)",
  background: "var(--color-popover)",
  fontSize: 12,
};

export function CrmDashboard() {
  const stages = ["New", "Contacted", "Qualified", "Site Visit", "Negotiation", "Won"] as const;
  const funnel = stages.map((s, i) => ({
    name: s,
    value: leads.filter((l) => l.status === s).length + (stages.length - i),
  }));
  const bySource = Array.from(new Set(leads.map((l) => l.source))).map((source) => ({
    source,
    leads: leads.filter((l) => l.source === source).length,
  }));
  const won = leads.filter((l) => l.status === "Won").length;

  return (
    <>
      <PageHeader
        title="CRM Dashboard"
        description="Lead pipeline, follow-up discipline and conversion across sales teams."
        breadcrumbs={[{ label: "Sales & CRM" }, { label: "CRM Dashboard" }]}
        actions={
          <Button size="sm" asChild>
            <Link to="/app/crm/leads">Open leads</Link>
          </Button>
        }
      />
      <FilterBar />

      <div className="rounded-xl border bg-card px-4 py-3 shadow-card">
        <p className="mb-2 text-xs font-medium text-muted-foreground">Sales conversion chain</p>
        <WorkflowChain
          steps={[
            "Lead",
            "Prospect",
            "Customer",
            "Unit Booking",
            "Payment Schedule",
            "Collection",
            "Accounts",
          ]}
          activeIndex={1}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Leads"
          value={String(leads.length)}
          hint="This financial year"
          icon={Users}
          to="crm/leads"
        />
        <StatCard
          label="New Leads"
          value={String(leads.filter((l) => l.status === "New").length)}
          delta={14.2}
          deltaLabel="this month"
          icon={TrendingUp}
          tone="info"
        />
        <StatCard
          label="Qualified Leads"
          value={String(leads.filter((l) => l.status === "Qualified").length)}
          icon={Users}
          tone="success"
        />
        <StatCard
          label="Customers"
          value={String(customers.length)}
          hint="Booked and beyond"
          icon={Users}
          to="crm/customers"
        />
        <StatCard
          label="Conversion Rate"
          value={`${Math.round((won / leads.length) * 100)}%`}
          hint={`${won} bookings won`}
          icon={TrendingUp}
          tone="success"
        />
        <StatCard
          label="Follow-ups Today"
          value={String(followUps.filter((f) => f.status === "Pending").length)}
          icon={PhoneCall}
          tone="warning"
          to="crm/follow-ups"
        />
        <StatCard
          label="Overdue Follow-ups"
          value={String(followUps.filter((f) => f.status === "Overdue").length)}
          icon={PhoneCall}
          tone="danger"
          to="crm/follow-ups"
        />
        <StatCard
          label="Upcoming Appointments"
          value={String(appointments.filter((a) => a.status === "Scheduled").length)}
          icon={CalendarClock}
          to="crm/appointments"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <ChartCard title="Lead Funnel" subtitle="Stage-wise pipeline">
          <ResponsiveContainer width="100%" height="100%">
            <FunnelChart>
              <Tooltip contentStyle={tooltipStyle} />
              <Funnel dataKey="value" data={funnel} isAnimationActive>
                {funnel.map((_, i) => (
                  <Cell key={i} fill={`var(--color-chart-${(i % 5) + 1})`} />
                ))}
                <LabelList
                  position="right"
                  dataKey="name"
                  style={{ fontSize: 11, fill: "var(--color-foreground)" }}
                />
              </Funnel>
            </FunnelChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Leads by Source" subtitle="Channel effectiveness">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={bySource}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis
                dataKey="source"
                tick={{ ...axis, fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis tick={axis} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar
                dataKey="leads"
                name="Leads"
                fill="var(--color-chart-1)"
                radius={[4, 4, 0, 0]}
                barSize={22}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Salesperson Load" subtitle="Active leads per owner">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={Array.from(new Set(leads.map((l) => l.assignedTo))).map((owner) => ({
                  name: owner.split(" ")[0],
                  value: leads.filter((l) => l.assignedTo === owner).length,
                }))}
                dataKey="value"
                nameKey="name"
                innerRadius={48}
                outerRadius={80}
                paddingAngle={2}
              >
                {leads.slice(0, 5).map((_, i) => (
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
        <PanelCard title="Hot Leads" subtitle="High priority, action needed" bodyClassName="p-0">
          <ul className="divide-y">
            {leads
              .filter((l) => l.priority === "Urgent" || l.priority === "High")
              .slice(0, 7)
              .map((l) => (
                <li key={l.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{l.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {l.projectInterest} · {l.unitInterest} · {l.assignedTo}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="num text-sm font-semibold">
                      {formatINR(l.budget, { compact: true })}
                    </p>
                    <StatusBadge value={l.status} />
                  </div>
                </li>
              ))}
          </ul>
        </PanelCard>

        <PanelCard
          title="Today's Appointments"
          subtitle="Site visits and meetings"
          bodyClassName="p-0"
        >
          <ul className="divide-y">
            {appointments.slice(0, 7).map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{a.customer}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {a.purpose} · {a.location}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="num text-xs text-muted-foreground">
                    {formatDate(a.datetime.split(" ")[0]!)}
                  </p>
                  <StatusBadge value={a.status} />
                </div>
              </li>
            ))}
          </ul>
        </PanelCard>
      </div>
    </>
  );
}
