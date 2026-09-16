import {
  BadgeIndianRupee,
  Boxes,
  Building2,
  CalendarClock,
  ClipboardCheck,
  ClipboardList,
  Coins,
  FileBarChart,
  FileSpreadsheet,
  FileStack,
  Gauge,
  HardHat,
  LayoutDashboard,
  Layers,
  Package,
  ReceiptIndianRupee,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Smartphone,
  Truck,
  Users,
  Wallet,
  Warehouse,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  /** slug used as the /app/$ splat path */
  slug: string;
  label: string;
}

export interface NavGroup {
  id: string;
  label: string;
  icon: LucideIcon;
  slug?: string;
  items?: NavItem[];
}

export const navigation: NavGroup[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, slug: "dashboard" },
  { id: "projects", label: "Projects", icon: Building2, slug: "projects" },
  {
    id: "procurement",
    label: "Procurement & Purchase",
    icon: ShoppingCart,
    items: [
      { slug: "procurement", label: "Procurement Dashboard" },
      { slug: "procurement/indents", label: "Indents" },
      { slug: "procurement/indent-approvals", label: "Indent Approvals" },
      { slug: "procurement/enquiries", label: "Enquiries" },
      { slug: "procurement/quotations", label: "Supplier Quotations" },
      { slug: "procurement/comparative-statement", label: "Comparative Statements" },
      { slug: "procurement/purchase-orders", label: "Purchase Orders" },
      { slug: "procurement/grn", label: "GRN" },
      { slug: "procurement/purchase-bills", label: "Purchase Bills" },
      { slug: "procurement/supplier-payments", label: "Supplier Payments" },
      { slug: "procurement/vendor-analysis", label: "Vendor Analysis" },
      { slug: "procurement/rate-analysis", label: "Rate Analysis" },
    ],
  },
  {
    id: "stores",
    label: "Stores & Inventory",
    icon: Warehouse,
    items: [
      { slug: "inventory", label: "Inventory Dashboard" },
      { slug: "inventory/requisition", label: "Material Requisition" },
      { slug: "inventory/stock-issue", label: "Stock Issue" },
      { slug: "inventory/stock-receipt", label: "Stock Receipt" },
      { slug: "inventory/stock-transfer", label: "Stock Transfer" },
      { slug: "inventory/physical-stock", label: "Physical Stock" },
      { slug: "inventory/stock-in-hand", label: "Stock in Hand" },
      { slug: "inventory/stock-valuation", label: "Stock Valuation" },
      { slug: "inventory/stock-consumption", label: "Stock Consumption" },
      { slug: "inventory/item-history", label: "Item History" },
      { slug: "inventory/item-ageing", label: "Item Ageing" },
      { slug: "inventory/warehouses", label: "Store / Warehouse" },
      { slug: "inventory/site-inventory", label: "Site Inventory" },
    ],
  },
  {
    id: "construction",
    label: "Planning & Construction",
    icon: HardHat,
    items: [
      { slug: "construction/planning", label: "Project Planning" },
      { slug: "construction/boq", label: "BOQ" },
      { slug: "construction/boq-analysis", label: "BOQ Analysis" },
      { slug: "construction/budget", label: "Budget" },
      { slug: "construction/budget-allocation", label: "Budget Allocation" },
      { slug: "construction/budget-vs-actual", label: "Budget vs Actual" },
      { slug: "construction/material-costing", label: "Material Costing" },
      { slug: "construction/work-plan", label: "Work Plan" },
      { slug: "construction/work-orders", label: "Job / Work Order" },
      { slug: "construction/contractors", label: "Contractor Management" },
      { slug: "construction/dpr", label: "DPR" },
      { slug: "construction/contractor-billing", label: "Contractor Billing" },
      { slug: "construction/work-bills", label: "Work Bills" },
      { slug: "construction/subcontracting", label: "Subcontracting" },
      { slug: "construction/site-progress", label: "Site Progress" },
    ],
  },
  {
    id: "crm",
    label: "Sales & CRM",
    icon: Users,
    items: [
      { slug: "crm", label: "CRM Dashboard" },
      { slug: "crm/leads", label: "Leads" },
      { slug: "crm/prospects", label: "Prospects" },
      { slug: "crm/customers", label: "Customers" },
      { slug: "crm/lead-sources", label: "Lead Sources" },
      { slug: "crm/follow-ups", label: "Follow-ups" },
      { slug: "crm/tasks", label: "Tasks" },
      { slug: "crm/appointments", label: "Appointments" },
      { slug: "crm/missing-appointments", label: "Missing Appointments" },
      { slug: "sales/price-list", label: "Project Price List" },
      { slug: "sales/units", label: "Units" },
      { slug: "sales/booking", label: "Unit Booking" },
      { slug: "sales/payment-schedule", label: "Payment Schedule" },
      { slug: "sales/interest", label: "Interest Calculation" },
      { slug: "sales/defaulters", label: "Defaulters" },
      { slug: "sales/brokerage", label: "Brokerage" },
      { slug: "sales/broker-performance", label: "Broker Performance" },
      { slug: "sales/unit-transfer", label: "Unit Transfer" },
      { slug: "sales/unit-cancellation", label: "Unit Cancellation" },
      { slug: "sales/post-sales", label: "Post Sales CRM" },
    ],
  },
  {
    id: "accounts",
    label: "Financial Accounting",
    icon: Wallet,
    items: [
      { slug: "accounts", label: "Accounting Dashboard" },
      { slug: "accounts/chart-of-accounts", label: "Chart of Accounts" },
      { slug: "accounts/vouchers", label: "Voucher Entry" },
      { slug: "accounts/receivables", label: "Accounts Receivable" },
      { slug: "accounts/payables", label: "Accounts Payable" },
      { slug: "accounts/general-ledger", label: "General Ledger" },
      { slug: "accounts/fixed-assets", label: "Fixed Assets" },
      { slug: "accounts/budget", label: "Budget" },
      { slug: "accounts/tds", label: "TDS" },
      { slug: "accounts/gst", label: "GST" },
      { slug: "accounts/bank-reconciliation", label: "Bank Reconciliation" },
      { slug: "accounts/trial-balance", label: "Trial Balance" },
      { slug: "accounts/profit-loss", label: "Profit & Loss" },
      { slug: "accounts/balance-sheet", label: "Balance Sheet" },
      { slug: "accounts/financial-reports", label: "Financial Reports" },
    ],
  },
  {
    id: "payroll",
    label: "Payroll & HR",
    icon: BadgeIndianRupee,
    items: [
      { slug: "hr/employee-cards", label: "Employee Cards" },
      { slug: "hr/employees", label: "Employee Master" },
      { slug: "hr/attendance", label: "Attendance" },
      { slug: "hr/leave", label: "Leave" },
      { slug: "hr/salary", label: "Salary" },
      { slug: "hr/payroll", label: "Payroll Processing" },
      { slug: "hr/pf", label: "PF" },
      { slug: "hr/esic", label: "ESIC" },
      { slug: "hr/gratuity", label: "Gratuity" },
      { slug: "hr/loans", label: "Loans & Advances" },
      { slug: "hr/overtime", label: "Overtime" },
      { slug: "hr/bonus", label: "Bonus" },
      { slug: "hr/payslips", label: "Payslips" },
      { slug: "hr/statutory-reports", label: "Statutory Reports" },
    ],
  },
  {
    id: "reports",
    label: "Reports & MIS",
    icon: FileBarChart,
    items: [
      { slug: "reports", label: "Management Dashboard" },
      { slug: "reports/procurement", label: "Procurement Reports" },
      { slug: "reports/inventory", label: "Inventory Reports" },
      { slug: "reports/projects", label: "Project Reports" },
      { slug: "reports/sales", label: "Sales Reports" },
      { slug: "reports/crm", label: "CRM Reports" },
      { slug: "reports/accounting", label: "Accounting Reports" },
      { slug: "reports/payroll", label: "Payroll Reports" },
      { slug: "reports/custom", label: "Custom Reports" },
    ],
  },
  {
    id: "approvals",
    label: "Approvals",
    icon: ClipboardCheck,
    items: [
      { slug: "approvals", label: "Approval Inbox" },
      { slug: "approvals/history", label: "Approval History" },
      { slug: "admin/workflow", label: "Workflow Configuration" },
    ],
  },
  { id: "mobile", label: "Mobile Operations", icon: Smartphone, slug: "mobile-operations" },
  { id: "documents", label: "Documents", icon: FileStack, slug: "documents" },
  {
    id: "admin",
    label: "Administration",
    icon: Settings,
    items: [
      { slug: "admin/company", label: "Company" },
      { slug: "admin/departments", label: "Departments" },
      { slug: "admin/branch", label: "Branch" },
      { slug: "admin/sites", label: "Sites" },
      { slug: "admin/users", label: "Users" },
      { slug: "admin/roles", label: "Roles" },
      { slug: "admin/permissions", label: "Permissions" },
      { slug: "admin/workflow", label: "Workflow Configuration" },
      { slug: "admin/approval-config", label: "Approval Configuration" },
      { slug: "admin/number-series", label: "Number Series" },
      { slug: "admin/settings", label: "System Settings" },
      { slug: "admin/audit-logs", label: "Audit Logs" },
    ],
  },
];

/** Flat slug -> breadcrumb trail lookup. */
export const slugIndex: Record<string, { group: string; label: string }> = (() => {
  const out: Record<string, { group: string; label: string }> = {};
  for (const g of navigation) {
    if (g.slug) out[g.slug] = { group: g.label, label: g.label };
    for (const it of g.items ?? []) out[it.slug] = { group: g.label, label: it.label };
  }
  return out;
})();

export const moduleIcons = {
  Boxes,
  CalendarClock,
  ClipboardList,
  Coins,
  FileSpreadsheet,
  Gauge,
  Layers,
  Package,
  ReceiptIndianRupee,
  ShieldCheck,
  Truck,
};
