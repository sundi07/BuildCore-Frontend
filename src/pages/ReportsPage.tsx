import { Download, FileSpreadsheet, Printer } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { FilterBar } from "@/components/common/FilterBar";
import { PanelCard } from "@/components/common/ChartCard";
import { Button } from "@/components/ui/button";

const catalogue: Record<
  string,
  { title: string; description: string; reports: { name: string; detail: string }[] }
> = {
  "reports/procurement": {
    title: "Procurement Reports",
    description: "Indent, PO, GRN and vendor reports with project and date filters.",
    reports: [
      { name: "Indent Register", detail: "Site-wise indents with approval status and ageing" },
      { name: "Purchase Order Register", detail: "PO value, delivery status and pending quantity" },
      { name: "Pending PO Report", detail: "Ordered vs received quantity per supplier" },
      { name: "GRN Register", detail: "Receipts with inspection result and rejection" },
      { name: "Supplier Outstanding", detail: "Bill-wise payables with ageing buckets" },
      { name: "Rate Comparison", detail: "Item rate trend across suppliers and months" },
    ],
  },
  "reports/inventory": {
    title: "Inventory Reports",
    description: "Stock ledger, valuation, consumption and ageing statements.",
    reports: [
      { name: "Stock Ledger", detail: "Item-wise receipt, issue and closing balance" },
      { name: "Stock Valuation", detail: "Closing value at weighted average rate" },
      { name: "Consumption Statement", detail: "Consumption against work order and BOQ" },
      { name: "Reorder Level Report", detail: "Items below reorder level by store" },
      { name: "Item Ageing", detail: "Non-moving stock by last movement date" },
      { name: "Site-wise Stock", detail: "Availability across sites and warehouses" },
    ],
  },
  "reports/projects": {
    title: "Project Reports",
    description: "Progress, cost, BOQ and contractor performance statements.",
    reports: [
      { name: "Project Progress Report", detail: "Planned vs actual physical progress" },
      { name: "Budget vs Actual", detail: "Head-wise variance with committed cost" },
      { name: "BOQ Execution", detail: "Executed quantity against BOQ quantity" },
      { name: "DPR Summary", detail: "Manpower, machinery and work done per day" },
      { name: "Contractor Performance", detail: "Work orders, billing and retention" },
      { name: "Delay Analysis", detail: "Activities behind schedule with impact" },
    ],
  },
  "reports/sales": {
    title: "Sales Reports",
    description: "Booking, collection, unit inventory and brokerage statements.",
    reports: [
      { name: "Booking Register", detail: "Unit-wise bookings with agreement value" },
      { name: "Collection Report", detail: "Milestone-wise received and due amounts" },
      { name: "Unit Availability", detail: "Available, held, booked and registered units" },
      { name: "Defaulter Report", detail: "Overdue milestones with interest" },
      { name: "Brokerage Payable", detail: "Broker-wise commission and TDS" },
      { name: "Revenue Recognition", detail: "Project-wise revenue and receivables" },
    ],
  },
  "reports/crm": {
    title: "CRM Reports",
    description: "Lead funnel, source performance and follow-up compliance.",
    reports: [
      { name: "Lead Register", detail: "All leads with stage, owner and budget" },
      { name: "Source Performance", detail: "Leads and conversions per channel" },
      { name: "Salesperson Productivity", detail: "Calls, visits and bookings per executive" },
      { name: "Follow-up Compliance", detail: "Completed vs missed follow-ups" },
      { name: "Site Visit Report", detail: "Scheduled, completed and dropped visits" },
      { name: "Lost Lead Analysis", detail: "Reasons for lost opportunities" },
    ],
  },
  "reports/accounting": {
    title: "Accounting Reports",
    description: "Statutory and management financial statements.",
    reports: [
      { name: "Trial Balance", detail: "Group and ledger-wise debit / credit" },
      { name: "Profit & Loss", detail: "Income and expenditure with comparatives" },
      { name: "Balance Sheet", detail: "Assets, liabilities and equity position" },
      { name: "Cash Flow Statement", detail: "Operating, investing and financing flows" },
      { name: "GSTR-1 / GSTR-3B", detail: "Outward supply and summary returns" },
      { name: "TDS Return Statement", detail: "Section-wise deduction and deposit" },
    ],
  },
  "reports/payroll": {
    title: "Payroll Reports",
    description: "Salary, statutory and attendance registers.",
    reports: [
      { name: "Salary Register", detail: "Earnings, deductions and net payable" },
      { name: "PF / ESIC Statement", detail: "Employee and employer contribution" },
      { name: "Professional Tax", detail: "State-wise PT deduction summary" },
      { name: "Attendance Summary", detail: "Present, absent, leave and overtime" },
      { name: "Bank Transfer Advice", detail: "NEFT payment file for salary release" },
      { name: "Form 16 Summary", detail: "Annual TDS on salary per employee" },
    ],
  },
  "reports/custom": {
    title: "Custom Reports",
    description: "Build a report from any module with your own columns, filters and grouping.",
    reports: [
      { name: "New Custom Report", detail: "Choose module, columns, filters and sorting" },
      { name: "Saved: Site Cost Sheet", detail: "Material, labour and overhead per site" },
      { name: "Saved: Vendor Scorecard", detail: "Delivery, quality and rate performance" },
      { name: "Saved: MIS Pack", detail: "Director monthly review pack" },
      { name: "Scheduled Exports", detail: "Email PDF / Excel on a schedule" },
      { name: "Report Access Control", detail: "Role-wise visibility of reports" },
    ],
  },
};

export function ReportsPage({ slug }: { slug: string }) {
  const meta = catalogue[slug] ?? {
    title: "Reports & MIS",
    description: "Central catalogue of every operational and financial report.",
    reports: Object.values(catalogue).flatMap((c) => c.reports.slice(0, 2)),
  };

  return (
    <>
      <PageHeader
        title={meta.title}
        description={meta.description}
        breadcrumbs={[{ label: "Reports & MIS" }, { label: meta.title }]}
        actions={
          <>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => window.print()}>
              <Printer className="size-3.5" /> Print
            </Button>
            <Button
              size="sm"
              className="gap-1.5"
              onClick={() => toast.success("Report pack exported (demo)")}
            >
              <Download className="size-3.5" /> Export all
            </Button>
          </>
        }
      />
      <FilterBar />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {meta.reports.map((r) => (
          <PanelCard key={r.name} title={r.name} subtitle={r.detail}>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5"
                onClick={() => toast.info(`${r.name} — generating preview`)}
              >
                <FileSpreadsheet className="size-3.5" /> View
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="gap-1.5"
                onClick={() => toast.success(`${r.name} exported to Excel`)}
              >
                <Download className="size-3.5" /> Excel
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="gap-1.5"
                onClick={() => toast.success(`${r.name} exported to PDF`)}
              >
                <Download className="size-3.5" /> PDF
              </Button>
            </div>
          </PanelCard>
        ))}
      </div>
    </>
  );
}
