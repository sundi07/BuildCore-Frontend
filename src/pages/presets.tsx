import type { ReactNode } from "react";
import type { Column, TableFilter } from "@/components/common/DataTable";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Progress } from "@/components/ui/progress";
import { compactINR, formatDate, formatINR, formatNumber } from "@/utils/format";
import * as m from "@/mock/data";
import type { StatCardProps } from "@/components/common/StatCard";

export interface Preset {
  title: string;
  description: string;
  breadcrumbs: { label: string; to?: string | undefined }[];
  kpis?: StatCardProps[] | undefined;
  rows: unknown[];
  columns: Column<never>[];
  getId: (row: never) => string;
  searchKeys?: ((row: never) => string) | undefined;
  filters?: TableFilter<never>[] | undefined;
  primaryAction?: string | undefined;
  workflow?: { steps: string[]; activeIndex: number } | undefined;
  footnote?: ReactNode | undefined;
}

const money = (v: number) => formatINR(v, { compact: true });
const uniq = (values: string[]) => Array.from(new Set(values)).sort();

function col<T>(key: string, header: string, extra: Partial<Column<T>> = {}): Column<T> {
  return { key, header, ...extra } as Column<T>;
}

/* ============================ PROCUREMENT ============================ */

const indentPreset = {
  title: "Indents",
  description:
    "Material indents raised from sites, routed through multi-level approval before enquiry.",
  breadcrumbs: [{ label: "Procurement & Purchase" }, { label: "Indents" }],
  workflow: {
    steps: [
      "Indent",
      "Approval",
      "Enquiry",
      "Quotation",
      "Comparative",
      "PO",
      "GRN",
      "Bill",
      "Payment",
    ],
    activeIndex: 0,
  },
  primaryAction: "New Indent",
  rows: m.indents,
};

/* The presets below are declared with explicit generics for column typing. */

type IndentRow = (typeof m.indents)[number];
const indents: Preset = {
  ...indentPreset,
  getId: ((r: IndentRow) => r.id) as never,
  searchKeys: ((r: IndentRow) =>
    `${r.indentNo} ${r.project} ${r.requestedBy} ${r.department}`) as never,
  filters: [
    {
      key: "status",
      label: "Status",
      options: uniq(m.indents.map((r) => r.status)),
      predicate: (r: IndentRow, v: string) => r.status === v,
    },
    {
      key: "project",
      label: "Projects",
      options: uniq(m.indents.map((r) => r.project)),
      predicate: (r: IndentRow, v: string) => r.project === v,
    },
    {
      key: "priority",
      label: "Priority",
      options: ["Urgent", "High", "Medium", "Low"],
      predicate: (r: IndentRow, v: string) => r.priority === v,
    },
  ] as never,
  kpis: [
    { label: "Total Indents", value: String(m.indents.length), hint: "This financial year" },
    {
      label: "Pending Approval",
      value: String(m.indents.filter((i) => i.status === "Pending").length),
      tone: "warning",
    },
    {
      label: "Approved",
      value: String(m.indents.filter((i) => i.status === "Approved").length),
      tone: "success",
    },
    { label: "Indent Value", value: money(m.indents.reduce((s, i) => s + i.value, 0)) },
  ],
  columns: [
    col<IndentRow>("indentNo", "Indent No", {
      render: (r) => <span className="font-medium">{r.indentNo}</span>,
    }),
    col<IndentRow>("date", "Date", { render: (r) => formatDate(r.date), value: (r) => r.date }),
    col<IndentRow>("project", "Project", { hideOnMobile: true }),
    col<IndentRow>("site", "Site", { hideOnMobile: true }),
    col<IndentRow>("department", "Dept", { hideOnMobile: true }),
    col<IndentRow>("requestedBy", "Requested By", { hideOnMobile: true }),
    col<IndentRow>("requiredDate", "Required", {
      render: (r) => formatDate(r.requiredDate),
      value: (r) => r.requiredDate,
    }),
    col<IndentRow>("itemCount", "Items", { align: "right" }),
    col<IndentRow>("value", "Value", {
      align: "right",
      render: (r) => money(r.value),
      value: (r) => r.value,
    }),
    col<IndentRow>("priority", "Priority", { render: (r) => <StatusBadge value={r.priority} /> }),
    col<IndentRow>("status", "Status", { render: (r) => <StatusBadge value={r.status} /> }),
  ] as never,
};

type EnquiryRow = (typeof m.enquiries)[number];
const enquiries: Preset = {
  title: "Enquiries / RFQ",
  description: "Requests for quotation floated to shortlisted suppliers against approved indents.",
  breadcrumbs: [{ label: "Procurement & Purchase" }, { label: "Enquiries" }],
  primaryAction: "New Enquiry",
  workflow: {
    steps: ["Indent", "Approval", "Enquiry", "Quotation", "Comparative", "PO"],
    activeIndex: 2,
  },
  rows: m.enquiries,
  getId: ((r: EnquiryRow) => r.id) as never,
  searchKeys: ((r: EnquiryRow) => `${r.enquiryNo} ${r.item} ${r.project}`) as never,
  filters: [
    {
      key: "status",
      label: "Status",
      options: uniq(m.enquiries.map((r) => r.status)),
      predicate: (r: EnquiryRow, v: string) => r.status === v,
    },
  ] as never,
  kpis: [
    { label: "Open RFQs", value: String(m.enquiries.filter((e) => e.status !== "Closed").length) },
    { label: "Suppliers Invited", value: String(m.enquiries.reduce((s, e) => s + e.suppliers, 0)) },
    {
      label: "Responses Received",
      value: String(m.enquiries.reduce((s, e) => s + e.responses, 0)),
      tone: "success",
    },
    {
      label: "Awaiting Response",
      value: String(m.enquiries.filter((e) => e.responses === 0).length),
      tone: "warning",
    },
  ],
  columns: [
    col<EnquiryRow>("enquiryNo", "RFQ No", {
      render: (r) => <span className="font-medium">{r.enquiryNo}</span>,
    }),
    col<EnquiryRow>("date", "Date", { render: (r) => formatDate(r.date) }),
    col<EnquiryRow>("project", "Project", { hideOnMobile: true }),
    col<EnquiryRow>("item", "Item"),
    col<EnquiryRow>("quantity", "Qty", {
      align: "right",
      render: (r) => `${formatNumber(r.quantity)} ${r.unit}`,
    }),
    col<EnquiryRow>("suppliers", "Suppliers", { align: "right" }),
    col<EnquiryRow>("responses", "Responses", { align: "right" }),
    col<EnquiryRow>("sentDate", "Sent", {
      render: (r) => formatDate(r.sentDate),
      hideOnMobile: true,
    }),
    col<EnquiryRow>("status", "Status", { render: (r) => <StatusBadge value={r.status} /> }),
  ] as never,
};

type PoRow = (typeof m.purchaseOrders)[number];
const purchaseOrders: Preset = {
  title: "Purchase Orders",
  description: "Approved purchase orders with delivery tracking, terms and receipt status.",
  breadcrumbs: [{ label: "Procurement & Purchase" }, { label: "Purchase Orders" }],
  primaryAction: "New Purchase Order",
  workflow: {
    steps: ["Comparative", "PO", "Challan", "GRN", "Purchase Bill", "Payment"],
    activeIndex: 1,
  },
  rows: m.purchaseOrders,
  getId: ((r: PoRow) => r.id) as never,
  searchKeys: ((r: PoRow) => `${r.poNo} ${r.supplier} ${r.project}`) as never,
  filters: [
    {
      key: "status",
      label: "Status",
      options: uniq(m.purchaseOrders.map((r) => r.status)),
      predicate: (r: PoRow, v: string) => r.status === v,
    },
    {
      key: "supplier",
      label: "Suppliers",
      options: uniq(m.purchaseOrders.map((r) => r.supplier)),
      predicate: (r: PoRow, v: string) => r.supplier === v,
    },
    {
      key: "project",
      label: "Projects",
      options: uniq(m.purchaseOrders.map((r) => r.project)),
      predicate: (r: PoRow, v: string) => r.project === v,
    },
  ] as never,
  kpis: [
    { label: "Total POs", value: String(m.purchaseOrders.length) },
    { label: "PO Value", value: money(m.purchaseOrders.reduce((s, p) => s + p.total, 0)) },
    {
      label: "Pending Approval",
      value: String(m.purchaseOrders.filter((p) => p.status === "Pending").length),
      tone: "warning",
    },
    {
      label: "Partially Received",
      value: String(
        m.purchaseOrders.filter((p) => p.receivedPct > 0 && p.receivedPct < 100).length,
      ),
      tone: "info",
    },
  ],
  columns: [
    col<PoRow>("poNo", "PO No", { render: (r) => <span className="font-medium">{r.poNo}</span> }),
    col<PoRow>("date", "Date", { render: (r) => formatDate(r.date), value: (r) => r.date }),
    col<PoRow>("supplier", "Supplier"),
    col<PoRow>("project", "Project", { hideOnMobile: true }),
    col<PoRow>("itemCount", "Items", { align: "right", hideOnMobile: true }),
    col<PoRow>("amount", "Basic", {
      align: "right",
      render: (r) => money(r.amount),
      value: (r) => r.amount,
      hideOnMobile: true,
    }),
    col<PoRow>("gst", "GST", {
      align: "right",
      render: (r) => money(r.gst),
      value: (r) => r.gst,
      hideOnMobile: true,
    }),
    col<PoRow>("total", "Total", {
      align: "right",
      render: (r) => <span className="font-semibold">{money(r.total)}</span>,
      value: (r) => r.total,
    }),
    col<PoRow>("deliveryDate", "Delivery", {
      render: (r) => formatDate(r.deliveryDate),
      value: (r) => r.deliveryDate,
    }),
    col<PoRow>("receivedPct", "Received", {
      align: "right",
      render: (r) => (
        <div className="flex items-center justify-end gap-2">
          <Progress value={r.receivedPct} className="h-1.5 w-14" />
          <span className="num text-xs">{r.receivedPct}%</span>
        </div>
      ),
      value: (r) => r.receivedPct,
    }),
    col<PoRow>("status", "Status", { render: (r) => <StatusBadge value={r.status} /> }),
  ] as never,
};

type GrnRow = (typeof m.grns)[number];
const grns: Preset = {
  title: "Goods Receipt Notes",
  description:
    "Material receipts against purchase orders with inspection and acceptance recorded at site stores.",
  breadcrumbs: [{ label: "Procurement & Purchase" }, { label: "GRN" }],
  primaryAction: "New GRN",
  workflow: {
    steps: ["PO", "Challan", "GRN", "Inventory", "Purchase Bill", "Payment"],
    activeIndex: 2,
  },
  rows: m.grns,
  getId: ((r: GrnRow) => r.id) as never,
  searchKeys: ((r: GrnRow) => `${r.grnNo} ${r.poNo} ${r.supplier} ${r.material}`) as never,
  filters: [
    {
      key: "inspection",
      label: "Inspection",
      options: uniq(m.grns.map((r) => r.inspection)),
      predicate: (r: GrnRow, v: string) => r.inspection === v,
    },
    {
      key: "status",
      label: "Status",
      options: uniq(m.grns.map((r) => r.status)),
      predicate: (r: GrnRow, v: string) => r.status === v,
    },
  ] as never,
  kpis: [
    { label: "GRNs Booked", value: String(m.grns.length) },
    {
      label: "Pending Inspection",
      value: String(m.grns.filter((g) => g.inspection === "Pending").length),
      tone: "warning",
    },
    {
      label: "Rejected Quantity",
      value: formatNumber(m.grns.reduce((s, g) => s + g.rejected, 0)),
      tone: "danger",
    },
    {
      label: "Awaiting Approval",
      value: String(m.grns.filter((g) => g.status === "Pending").length),
      tone: "info",
    },
  ],
  columns: [
    col<GrnRow>("grnNo", "GRN No", {
      render: (r) => <span className="font-medium">{r.grnNo}</span>,
    }),
    col<GrnRow>("date", "Date", { render: (r) => formatDate(r.date), value: (r) => r.date }),
    col<GrnRow>("poNo", "PO Ref", {
      render: (r) => <span className="text-primary">{r.poNo}</span>,
    }),
    col<GrnRow>("supplier", "Supplier", { hideOnMobile: true }),
    col<GrnRow>("material", "Material"),
    col<GrnRow>("ordered", "Ordered", {
      align: "right",
      render: (r) => `${formatNumber(r.ordered)} ${r.unit}`,
    }),
    col<GrnRow>("received", "Received", {
      align: "right",
      render: (r) => formatNumber(r.received),
    }),
    col<GrnRow>("accepted", "Accepted", {
      align: "right",
      render: (r) => formatNumber(r.accepted),
    }),
    col<GrnRow>("rejected", "Rejected", {
      align: "right",
      render: (r) => formatNumber(r.rejected),
    }),
    col<GrnRow>("warehouse", "Store", { hideOnMobile: true }),
    col<GrnRow>("inspection", "Inspection", {
      render: (r) => <StatusBadge value={r.inspection} />,
    }),
    col<GrnRow>("status", "Status", { render: (r) => <StatusBadge value={r.status} /> }),
  ] as never,
};

type BillRow = (typeof m.purchaseBills)[number];
const purchaseBills: Preset = {
  title: "Purchase Bills",
  description: "Supplier invoices matched with PO and GRN, feeding accounts payable.",
  breadcrumbs: [{ label: "Procurement & Purchase" }, { label: "Purchase Bills" }],
  primaryAction: "Book Bill",
  workflow: {
    steps: ["GRN", "Purchase Bill", "Accounts Payable", "Supplier Payment"],
    activeIndex: 1,
  },
  rows: m.purchaseBills,
  getId: ((r: BillRow) => r.id) as never,
  searchKeys: ((r: BillRow) => `${r.billNo} ${r.supplier} ${r.poNo} ${r.grnNo}`) as never,
  filters: [
    {
      key: "paymentStatus",
      label: "Payment",
      options: uniq(m.purchaseBills.map((r) => r.paymentStatus)),
      predicate: (r: BillRow, v: string) => r.paymentStatus === v,
    },
  ] as never,
  kpis: [
    { label: "Bills Booked", value: String(m.purchaseBills.length) },
    { label: "Bill Value", value: money(m.purchaseBills.reduce((s, b) => s + b.total, 0)) },
    {
      label: "Outstanding",
      value: money(m.purchaseBills.reduce((s, b) => s + (b.total - b.paid), 0)),
      tone: "warning",
    },
    {
      label: "Overdue Bills",
      value: String(m.purchaseBills.filter((b) => b.paymentStatus === "Overdue").length),
      tone: "danger",
    },
  ],
  columns: [
    col<BillRow>("billNo", "Bill No", {
      render: (r) => <span className="font-medium">{r.billNo}</span>,
    }),
    col<BillRow>("date", "Date", { render: (r) => formatDate(r.date), value: (r) => r.date }),
    col<BillRow>("supplier", "Supplier"),
    col<BillRow>("poNo", "PO", { hideOnMobile: true }),
    col<BillRow>("grnNo", "GRN", { hideOnMobile: true }),
    col<BillRow>("amount", "Basic", {
      align: "right",
      render: (r) => money(r.amount),
      value: (r) => r.amount,
      hideOnMobile: true,
    }),
    col<BillRow>("gst", "GST", {
      align: "right",
      render: (r) => money(r.gst),
      value: (r) => r.gst,
      hideOnMobile: true,
    }),
    col<BillRow>("total", "Total", {
      align: "right",
      render: (r) => <span className="font-semibold">{money(r.total)}</span>,
      value: (r) => r.total,
    }),
    col<BillRow>("dueDate", "Due Date", {
      render: (r) => formatDate(r.dueDate),
      value: (r) => r.dueDate,
    }),
    col<BillRow>("paymentStatus", "Payment", {
      render: (r) => <StatusBadge value={r.paymentStatus} />,
    }),
  ] as never,
};

type SupplierRow = (typeof m.suppliers)[number];
const vendorAnalysis: Preset = {
  title: "Vendor Analysis",
  description: "Supplier performance on delivery, quality and purchase value across projects.",
  breadcrumbs: [{ label: "Procurement & Purchase" }, { label: "Vendor Analysis" }],
  rows: m.suppliers,
  getId: ((r: SupplierRow) => r.id) as never,
  searchKeys: ((r: SupplierRow) => `${r.name} ${r.category} ${r.city}`) as never,
  kpis: [
    { label: "Active Vendors", value: String(m.suppliers.length) },
    { label: "Purchase Value", value: money(m.suppliers.reduce((s, x) => s + x.purchaseValue, 0)) },
    {
      label: "Avg On-time Delivery",
      value: `${Math.round(m.suppliers.reduce((s, x) => s + x.onTimePct, 0) / m.suppliers.length)}%`,
      tone: "success",
    },
    {
      label: "Avg Quality Score",
      value: `${Math.round(m.suppliers.reduce((s, x) => s + x.qualityScore, 0) / m.suppliers.length)}%`,
      tone: "info",
    },
  ],
  columns: [
    col<SupplierRow>("name", "Supplier", {
      render: (r) => <span className="font-medium">{r.name}</span>,
    }),
    col<SupplierRow>("category", "Category"),
    col<SupplierRow>("city", "City", { hideOnMobile: true }),
    col<SupplierRow>("gstin", "GSTIN", { hideOnMobile: true }),
    col<SupplierRow>("orders", "Orders", { align: "right" }),
    col<SupplierRow>("purchaseValue", "Purchase Value", {
      align: "right",
      render: (r) => money(r.purchaseValue),
      value: (r) => r.purchaseValue,
    }),
    col<SupplierRow>("onTimePct", "On-time %", {
      align: "right",
      render: (r) => `${r.onTimePct}%`,
    }),
    col<SupplierRow>("qualityScore", "Quality", {
      align: "right",
      render: (r) => `${r.qualityScore}%`,
    }),
    col<SupplierRow>("rating", "Rating", { align: "right", render: (r) => r.rating.toFixed(1) }),
  ] as never,
};

/* ============================== INVENTORY ============================== */

type StockRow = (typeof m.stockItems)[number];
function stockPreset(title: string, description: string, rows = m.stockItems): Preset {
  return {
    title,
    description,
    breadcrumbs: [{ label: "Stores & Inventory" }, { label: title }],
    rows,
    getId: ((r: StockRow) => r.id) as never,
    searchKeys: ((r: StockRow) => `${r.code} ${r.name} ${r.warehouse} ${r.project}`) as never,
    filters: [
      {
        key: "category",
        label: "Category",
        options: uniq(rows.map((r) => r.category)),
        predicate: (r: StockRow, v: string) => r.category === v,
      },
      {
        key: "project",
        label: "Projects",
        options: uniq(rows.map((r) => r.project)),
        predicate: (r: StockRow, v: string) => r.project === v,
      },
    ] as never,
    kpis: [
      { label: "Items Tracked", value: String(rows.length) },
      { label: "Stock Value", value: money(rows.reduce((s, i) => s + i.value, 0)) },
      {
        label: "Below Reorder",
        value: String(rows.filter((i) => i.quantity < i.reorderLevel).length),
        tone: "warning",
      },
      {
        label: "Out of Stock",
        value: String(rows.filter((i) => i.quantity === 0).length),
        tone: "danger",
      },
    ],
    columns: [
      col<StockRow>("code", "Item Code", {
        render: (r) => <span className="font-medium">{r.code}</span>,
      }),
      col<StockRow>("name", "Item"),
      col<StockRow>("category", "Category", { hideOnMobile: true }),
      col<StockRow>("warehouse", "Store", { hideOnMobile: true }),
      col<StockRow>("project", "Project", { hideOnMobile: true }),
      col<StockRow>("quantity", "Qty", {
        align: "right",
        render: (r) => `${formatNumber(r.quantity)} ${r.unit}`,
        value: (r) => r.quantity,
      }),
      col<StockRow>("reorderLevel", "Reorder", {
        align: "right",
        render: (r) => formatNumber(r.reorderLevel),
      }),
      col<StockRow>("rate", "Rate", {
        align: "right",
        render: (r) => formatINR(r.rate),
        value: (r) => r.rate,
      }),
      col<StockRow>("value", "Value", {
        align: "right",
        render: (r) => <span className="font-semibold">{money(r.value)}</span>,
        value: (r) => r.value,
      }),
      col<StockRow>("lastMovement", "Last Movement", {
        render: (r) => formatDate(r.lastMovement),
        hideOnMobile: true,
      }),
    ] as never,
  };
}

type TxnRow = (typeof m.stockTxns)[number];
function txnPreset(type: TxnRow["type"] | "all", title: string, description: string): Preset {
  const rows = type === "all" ? m.stockTxns : m.stockTxns.filter((t) => t.type === type);
  return {
    title,
    description,
    breadcrumbs: [{ label: "Stores & Inventory" }, { label: title }],
    primaryAction: type === "all" ? undefined : `New ${type}`,
    rows,
    getId: ((r: TxnRow) => r.id) as never,
    searchKeys: ((r: TxnRow) =>
      `${r.docNo} ${r.item} ${r.project} ${r.site} ${r.contractor ?? ""}`) as never,
    filters: [
      {
        key: "project",
        label: "Projects",
        options: uniq(rows.map((r) => r.project)),
        predicate: (r: TxnRow, v: string) => r.project === v,
      },
      {
        key: "status",
        label: "Status",
        options: uniq(rows.map((r) => r.status)),
        predicate: (r: TxnRow, v: string) => r.status === v,
      },
    ] as never,
    kpis: [
      { label: "Documents", value: String(rows.length) },
      { label: "Total Quantity", value: formatNumber(rows.reduce((s, r) => s + r.quantity, 0)) },
      {
        label: "Pending Approval",
        value: String(rows.filter((r) => r.status === "Pending").length),
        tone: "warning",
      },
      { label: "Sites Covered", value: String(uniq(rows.map((r) => r.site)).length), tone: "info" },
    ],
    columns: [
      col<TxnRow>("docNo", "Document No", {
        render: (r) => <span className="font-medium">{r.docNo}</span>,
      }),
      col<TxnRow>("date", "Date", { render: (r) => formatDate(r.date), value: (r) => r.date }),
      col<TxnRow>("type", "Type", { hideOnMobile: true }),
      col<TxnRow>("item", "Item"),
      col<TxnRow>("quantity", "Qty", {
        align: "right",
        render: (r) => `${formatNumber(r.quantity)} ${r.unit}`,
        value: (r) => r.quantity,
      }),
      col<TxnRow>("project", "Project", { hideOnMobile: true }),
      col<TxnRow>("site", "Site", { hideOnMobile: true }),
      col<TxnRow>("issuedTo", "Issued To", {
        hideOnMobile: true,
        render: (r) => r.issuedTo ?? "—",
      }),
      col<TxnRow>("contractor", "Contractor", {
        hideOnMobile: true,
        render: (r) => r.contractor ?? "—",
      }),
      col<TxnRow>("workOrder", "Work Order", {
        hideOnMobile: true,
        render: (r) => r.workOrder ?? "—",
      }),
      col<TxnRow>("status", "Status", { render: (r) => <StatusBadge value={r.status} /> }),
    ] as never,
  };
}

type ReqRow = (typeof m.materialRequisitions)[number];
const requisitions: Preset = {
  title: "Material Requisition",
  description:
    "Site requisitions for material issue from store, linked to project and work purpose.",
  breadcrumbs: [{ label: "Stores & Inventory" }, { label: "Material Requisition" }],
  primaryAction: "New Requisition",
  rows: m.materialRequisitions,
  getId: ((r: ReqRow) => r.id) as never,
  searchKeys: ((r: ReqRow) => `${r.reqNo} ${r.item} ${r.project} ${r.site}`) as never,
  filters: [
    {
      key: "status",
      label: "Status",
      options: uniq(m.materialRequisitions.map((r) => r.status)),
      predicate: (r: ReqRow, v: string) => r.status === v,
    },
  ] as never,
  kpis: [
    { label: "Requisitions", value: String(m.materialRequisitions.length) },
    {
      label: "Pending",
      value: String(m.materialRequisitions.filter((r) => r.status === "Pending").length),
      tone: "warning",
    },
    {
      label: "Issued",
      value: String(m.materialRequisitions.filter((r) => r.status === "Issued").length),
      tone: "success",
    },
    {
      label: "Partially Issued",
      value: String(m.materialRequisitions.filter((r) => r.status === "Partially Issued").length),
      tone: "info",
    },
  ],
  columns: [
    col<ReqRow>("reqNo", "Requisition No", {
      render: (r) => <span className="font-medium">{r.reqNo}</span>,
    }),
    col<ReqRow>("date", "Date", { render: (r) => formatDate(r.date) }),
    col<ReqRow>("project", "Project"),
    col<ReqRow>("site", "Site", { hideOnMobile: true }),
    col<ReqRow>("department", "Dept", { hideOnMobile: true }),
    col<ReqRow>("item", "Item"),
    col<ReqRow>("quantity", "Qty", {
      align: "right",
      render: (r) => `${formatNumber(r.quantity)} ${r.unit}`,
    }),
    col<ReqRow>("requiredDate", "Required", { render: (r) => formatDate(r.requiredDate) }),
    col<ReqRow>("purpose", "Purpose", { hideOnMobile: true }),
    col<ReqRow>("status", "Status", { render: (r) => <StatusBadge value={r.status} /> }),
  ] as never,
};

type WarehouseRow = (typeof m.warehouses)[number];
const warehouses: Preset = {
  title: "Store / Warehouse",
  description: "Site stores and central warehouses with custody and stock value.",
  breadcrumbs: [{ label: "Stores & Inventory" }, { label: "Store / Warehouse" }],
  primaryAction: "New Store",
  rows: m.warehouses,
  getId: ((r: WarehouseRow) => r.id) as never,
  searchKeys: ((r: WarehouseRow) => `${r.name} ${r.project} ${r.keeper}`) as never,
  kpis: [
    { label: "Stores", value: String(m.warehouses.length) },
    { label: "Total Stock Value", value: money(m.warehouses.reduce((s, w) => s + w.value, 0)) },
    { label: "Items Stored", value: formatNumber(m.warehouses.reduce((s, w) => s + w.items, 0)) },
    {
      label: "Projects Covered",
      value: String(uniq(m.warehouses.map((w) => w.project)).length),
      tone: "info",
    },
  ],
  columns: [
    col<WarehouseRow>("name", "Store", {
      render: (r) => <span className="font-medium">{r.name}</span>,
    }),
    col<WarehouseRow>("project", "Project"),
    col<WarehouseRow>("location", "Location", { hideOnMobile: true }),
    col<WarehouseRow>("keeper", "Store Keeper", { hideOnMobile: true }),
    col<WarehouseRow>("items", "Items", { align: "right" }),
    col<WarehouseRow>("value", "Stock Value", {
      align: "right",
      render: (r) => money(r.value),
      value: (r) => r.value,
    }),
  ] as never,
};

/* ============================ CONSTRUCTION ============================ */

type BoqRow = (typeof m.boqLines)[number];
function boqPreset(analysis: boolean): Preset {
  return {
    title: analysis ? "BOQ Analysis" : "Bill of Quantities",
    description: analysis
      ? "Planned versus executed quantity and rate with variance for every BOQ line."
      : "Work-item wise quantities, rates and material/labour split for each project.",
    breadcrumbs: [
      { label: "Planning & Construction" },
      { label: analysis ? "BOQ Analysis" : "BOQ" },
    ],
    primaryAction: analysis ? undefined : "Add BOQ Item",
    rows: m.boqLines,
    getId: ((r: BoqRow) => r.id) as never,
    searchKeys: ((r: BoqRow) => `${r.code} ${r.workItem} ${r.project}`) as never,
    filters: [
      {
        key: "project",
        label: "Projects",
        options: uniq(m.boqLines.map((r) => r.project)),
        predicate: (r: BoqRow, v: string) => r.project === v,
      },
    ] as never,
    kpis: [
      { label: "BOQ Items", value: String(m.boqLines.length) },
      { label: "BOQ Value", value: money(m.boqLines.reduce((s, b) => s + b.amount, 0)) },
      {
        label: "Material Component",
        value: money(m.boqLines.reduce((s, b) => s + b.material, 0)),
        tone: "info",
      },
      {
        label: "Labour Component",
        value: money(m.boqLines.reduce((s, b) => s + b.labour, 0)),
        tone: "warning",
      },
    ],
    columns: (analysis
      ? [
          col<BoqRow>("code", "BOQ Code", {
            render: (r) => <span className="font-medium">{r.code}</span>,
          }),
          col<BoqRow>("workItem", "Work Item"),
          col<BoqRow>("project", "Project", { hideOnMobile: true }),
          col<BoqRow>("quantity", "Planned Qty", {
            align: "right",
            render: (r) => `${formatNumber(r.quantity)} ${r.unit}`,
            value: (r) => r.quantity,
          }),
          col<BoqRow>("actualQty", "Actual Qty", {
            align: "right",
            render: (r) => formatNumber(r.actualQty),
            value: (r) => r.actualQty,
          }),
          col<BoqRow>("rate", "Planned Rate", { align: "right", render: (r) => formatINR(r.rate) }),
          col<BoqRow>("actualRate", "Actual Rate", {
            align: "right",
            render: (r) => formatINR(r.actualRate),
          }),
          col<BoqRow>("variance", "Rate Variance", {
            align: "right",
            value: (r) => r.actualRate - r.rate,
            render: (r) => (
              <span className={r.actualRate > r.rate ? "text-destructive" : "text-success"}>
                {r.actualRate > r.rate ? "+" : ""}
                {formatINR(r.actualRate - r.rate)}
              </span>
            ),
          }),
        ]
      : [
          col<BoqRow>("code", "BOQ Code", {
            render: (r) => <span className="font-medium">{r.code}</span>,
          }),
          col<BoqRow>("workItem", "Work Item"),
          col<BoqRow>("project", "Project", { hideOnMobile: true }),
          col<BoqRow>("unit", "Unit", { hideOnMobile: true }),
          col<BoqRow>("quantity", "Quantity", {
            align: "right",
            render: (r) => formatNumber(r.quantity),
            value: (r) => r.quantity,
          }),
          col<BoqRow>("rate", "Rate", {
            align: "right",
            render: (r) => formatINR(r.rate),
            value: (r) => r.rate,
          }),
          col<BoqRow>("amount", "Amount", {
            align: "right",
            render: (r) => <span className="font-semibold">{money(r.amount)}</span>,
            value: (r) => r.amount,
          }),
          col<BoqRow>("material", "Material", {
            align: "right",
            render: (r) => money(r.material),
            hideOnMobile: true,
          }),
          col<BoqRow>("labour", "Labour", {
            align: "right",
            render: (r) => money(r.labour),
            hideOnMobile: true,
          }),
        ]) as never,
  };
}

type WorkPlanRow = (typeof m.workPlan)[number];
const workPlan: Preset = {
  title: "Work Plan",
  description: "WBS activities with planned dates, assigned contractor, dependency and progress.",
  breadcrumbs: [{ label: "Planning & Construction" }, { label: "Work Plan" }],
  primaryAction: "Add Activity",
  rows: m.workPlan,
  getId: ((r: WorkPlanRow) => r.id) as never,
  searchKeys: ((r: WorkPlanRow) => `${r.wbs} ${r.activity} ${r.project} ${r.contractor}`) as never,
  filters: [
    {
      key: "project",
      label: "Projects",
      options: uniq(m.workPlan.map((r) => r.project)),
      predicate: (r: WorkPlanRow, v: string) => r.project === v,
    },
    {
      key: "status",
      label: "Status",
      options: uniq(m.workPlan.map((r) => r.status)),
      predicate: (r: WorkPlanRow, v: string) => r.status === v,
    },
  ] as never,
  kpis: [
    { label: "Activities", value: String(m.workPlan.length) },
    {
      label: "Completed",
      value: String(m.workPlan.filter((w) => w.status === "Completed").length),
      tone: "success",
    },
    {
      label: "In Progress",
      value: String(m.workPlan.filter((w) => w.status === "In Progress").length),
      tone: "info",
    },
    {
      label: "Delayed",
      value: String(m.workPlan.filter((w) => w.status === "Delayed").length),
      tone: "danger",
    },
  ],
  columns: [
    col<WorkPlanRow>("wbs", "WBS", { render: (r) => <span className="font-medium">{r.wbs}</span> }),
    col<WorkPlanRow>("activity", "Activity"),
    col<WorkPlanRow>("project", "Project", { hideOnMobile: true }),
    col<WorkPlanRow>("startDate", "Start", {
      render: (r) => formatDate(r.startDate),
      value: (r) => r.startDate,
    }),
    col<WorkPlanRow>("endDate", "Finish", {
      render: (r) => formatDate(r.endDate),
      value: (r) => r.endDate,
    }),
    col<WorkPlanRow>("plannedQty", "Planned Qty", {
      align: "right",
      render: (r) => `${formatNumber(r.plannedQty)} ${r.unit}`,
    }),
    col<WorkPlanRow>("contractor", "Contractor", { hideOnMobile: true }),
    col<WorkPlanRow>("dependency", "Dependency", { hideOnMobile: true }),
    col<WorkPlanRow>("progress", "Progress", {
      align: "right",
      render: (r) => (
        <div className="flex items-center justify-end gap-2">
          <Progress value={r.progress} className="h-1.5 w-16" />
          <span className="num text-xs">{r.progress}%</span>
        </div>
      ),
      value: (r) => r.progress,
    }),
    col<WorkPlanRow>("status", "Status", { render: (r) => <StatusBadge value={r.status} /> }),
  ] as never,
};

type WoRow = (typeof m.workOrders)[number];
const workOrders: Preset = {
  title: "Job / Work Orders",
  description: "Contractor work orders against BOQ items with rate, quantity and execution status.",
  breadcrumbs: [{ label: "Planning & Construction" }, { label: "Job / Work Order" }],
  primaryAction: "New Work Order",
  workflow: {
    steps: ["Work Order", "Material Consumption", "DPR", "Work Bill", "Contractor Payment"],
    activeIndex: 0,
  },
  rows: m.workOrders,
  getId: ((r: WoRow) => r.id) as never,
  searchKeys: ((r: WoRow) => `${r.woNo} ${r.contractor} ${r.project} ${r.work}`) as never,
  filters: [
    {
      key: "contractor",
      label: "Contractors",
      options: uniq(m.workOrders.map((r) => r.contractor)),
      predicate: (r: WoRow, v: string) => r.contractor === v,
    },
    {
      key: "status",
      label: "Status",
      options: uniq(m.workOrders.map((r) => r.status)),
      predicate: (r: WoRow, v: string) => r.status === v,
    },
  ] as never,
  kpis: [
    { label: "Work Orders", value: String(m.workOrders.length) },
    { label: "Order Value", value: money(m.workOrders.reduce((s, w) => s + w.amount, 0)) },
    {
      label: "Avg Progress",
      value: `${Math.round(m.workOrders.reduce((s, w) => s + w.progress, 0) / m.workOrders.length)}%`,
      tone: "info",
    },
    {
      label: "Pending Approval",
      value: String(m.workOrders.filter((w) => w.status === "Pending").length),
      tone: "warning",
    },
  ],
  columns: [
    col<WoRow>("woNo", "WO No", { render: (r) => <span className="font-medium">{r.woNo}</span> }),
    col<WoRow>("date", "Date", { render: (r) => formatDate(r.date), value: (r) => r.date }),
    col<WoRow>("contractor", "Contractor"),
    col<WoRow>("project", "Project", { hideOnMobile: true }),
    col<WoRow>("work", "Work"),
    col<WoRow>("boqRef", "BOQ Ref", { hideOnMobile: true }),
    col<WoRow>("quantity", "Qty", {
      align: "right",
      render: (r) => `${formatNumber(r.quantity)} ${r.unit}`,
    }),
    col<WoRow>("rate", "Rate", { align: "right", render: (r) => formatINR(r.rate) }),
    col<WoRow>("amount", "Amount", {
      align: "right",
      render: (r) => <span className="font-semibold">{money(r.amount)}</span>,
      value: (r) => r.amount,
    }),
    col<WoRow>("progress", "Progress", {
      align: "right",
      render: (r) => (
        <div className="flex items-center justify-end gap-2">
          <Progress value={r.progress} className="h-1.5 w-14" />
          <span className="num text-xs">{r.progress}%</span>
        </div>
      ),
      value: (r) => r.progress,
    }),
    col<WoRow>("status", "Status", { render: (r) => <StatusBadge value={r.status} /> }),
  ] as never,
};

type ContractorRow = (typeof m.contractors)[number];
const contractors: Preset = {
  title: "Contractor Management",
  description: "Contractor profiles with work orders, billing, payments and performance rating.",
  breadcrumbs: [{ label: "Planning & Construction" }, { label: "Contractor Management" }],
  primaryAction: "Add Contractor",
  rows: m.contractors,
  getId: ((r: ContractorRow) => r.id) as never,
  searchKeys: ((r: ContractorRow) => `${r.name} ${r.trade} ${r.city}`) as never,
  kpis: [
    { label: "Contractors", value: String(m.contractors.length) },
    { label: "Work Awarded", value: money(m.contractors.reduce((s, c) => s + c.workValue, 0)) },
    {
      label: "Billed",
      value: money(m.contractors.reduce((s, c) => s + c.billedValue, 0)),
      tone: "info",
    },
    {
      label: "Outstanding",
      value: money(m.contractors.reduce((s, c) => s + (c.billedValue - c.paidValue), 0)),
      tone: "warning",
    },
  ],
  columns: [
    col<ContractorRow>("name", "Contractor", {
      render: (r) => <span className="font-medium">{r.name}</span>,
    }),
    col<ContractorRow>("trade", "Trade"),
    col<ContractorRow>("city", "City", { hideOnMobile: true }),
    col<ContractorRow>("activeWorkOrders", "Active WO", { align: "right" }),
    col<ContractorRow>("workValue", "Work Value", {
      align: "right",
      render: (r) => money(r.workValue),
      value: (r) => r.workValue,
    }),
    col<ContractorRow>("billedValue", "Billed", {
      align: "right",
      render: (r) => money(r.billedValue),
      value: (r) => r.billedValue,
    }),
    col<ContractorRow>("paidValue", "Paid", {
      align: "right",
      render: (r) => money(r.paidValue),
      value: (r) => r.paidValue,
    }),
    col<ContractorRow>("performance", "Performance", {
      align: "right",
      render: (r) => (
        <div className="flex items-center justify-end gap-2">
          <Progress value={r.performance} className="h-1.5 w-16" />
          <span className="num text-xs">{r.performance}</span>
        </div>
      ),
      value: (r) => r.performance,
    }),
  ] as never,
};

type CbRow = (typeof m.contractorBills)[number];
const contractorBills: Preset = {
  title: "Contractor Billing",
  description:
    "RA bills with measurement, retention, TDS and net payable routed through site and accounts approval.",
  breadcrumbs: [{ label: "Planning & Construction" }, { label: "Contractor Billing" }],
  primaryAction: "New RA Bill",
  workflow: {
    steps: ["Measurement", "Site Engineer", "Project Manager", "Accounts", "Payment"],
    activeIndex: 1,
  },
  rows: m.contractorBills,
  getId: ((r: CbRow) => r.id) as never,
  searchKeys: ((r: CbRow) => `${r.billNo} ${r.contractor} ${r.project} ${r.workOrder}`) as never,
  filters: [
    {
      key: "status",
      label: "Approval",
      options: uniq(m.contractorBills.map((r) => r.status)),
      predicate: (r: CbRow, v: string) => r.status === v,
    },
    {
      key: "paymentStatus",
      label: "Payment",
      options: uniq(m.contractorBills.map((r) => r.paymentStatus)),
      predicate: (r: CbRow, v: string) => r.paymentStatus === v,
    },
  ] as never,
  kpis: [
    { label: "Bills", value: String(m.contractorBills.length) },
    { label: "Gross Value", value: money(m.contractorBills.reduce((s, b) => s + b.gross, 0)) },
    {
      label: "Retention Held",
      value: money(m.contractorBills.reduce((s, b) => s + b.retention, 0)),
      tone: "info",
    },
    {
      label: "Net Payable",
      value: money(
        m.contractorBills.filter((b) => b.paymentStatus !== "Paid").reduce((s, b) => s + b.net, 0),
      ),
      tone: "warning",
    },
  ],
  columns: [
    col<CbRow>("billNo", "Bill No", {
      render: (r) => <span className="font-medium">{r.billNo}</span>,
    }),
    col<CbRow>("date", "Date", { render: (r) => formatDate(r.date), value: (r) => r.date }),
    col<CbRow>("contractor", "Contractor"),
    col<CbRow>("project", "Project", { hideOnMobile: true }),
    col<CbRow>("workOrder", "Work Order", { hideOnMobile: true }),
    col<CbRow>("measurement", "Measurement", { hideOnMobile: true }),
    col<CbRow>("gross", "Gross", {
      align: "right",
      render: (r) => money(r.gross),
      value: (r) => r.gross,
    }),
    col<CbRow>("retention", "Retention", {
      align: "right",
      render: (r) => money(r.retention),
      hideOnMobile: true,
    }),
    col<CbRow>("tds", "TDS", { align: "right", render: (r) => money(r.tds), hideOnMobile: true }),
    col<CbRow>("net", "Net Payable", {
      align: "right",
      render: (r) => <span className="font-semibold">{money(r.net)}</span>,
      value: (r) => r.net,
    }),
    col<CbRow>("status", "Approval", { render: (r) => <StatusBadge value={r.status} /> }),
    col<CbRow>("paymentStatus", "Payment", {
      render: (r) => <StatusBadge value={r.paymentStatus} />,
    }),
  ] as never,
};

/* ============================== CRM & SALES ============================== */

type LeadRow = (typeof m.leads)[number];
const leads: Preset = {
  title: "Leads",
  description:
    "Enquiry pipeline with source, project interest, assigned salesperson and next follow-up.",
  breadcrumbs: [{ label: "Sales & CRM" }, { label: "Leads" }],
  primaryAction: "Add Lead",
  workflow: {
    steps: ["Lead", "Prospect", "Customer", "Unit Booking", "Payment Schedule", "Collection"],
    activeIndex: 0,
  },
  rows: m.leads,
  getId: ((r: LeadRow) => r.id) as never,
  searchKeys: ((r: LeadRow) =>
    `${r.leadNo} ${r.name} ${r.contact} ${r.projectInterest} ${r.assignedTo}`) as never,
  filters: [
    {
      key: "status",
      label: "Status",
      options: uniq(m.leads.map((r) => r.status)),
      predicate: (r: LeadRow, v: string) => r.status === v,
    },
    {
      key: "source",
      label: "Source",
      options: uniq(m.leads.map((r) => r.source)),
      predicate: (r: LeadRow, v: string) => r.source === v,
    },
    {
      key: "assignedTo",
      label: "Owner",
      options: uniq(m.leads.map((r) => r.assignedTo)),
      predicate: (r: LeadRow, v: string) => r.assignedTo === v,
    },
  ] as never,
  kpis: [
    { label: "Total Leads", value: String(m.leads.length) },
    {
      label: "Qualified",
      value: String(m.leads.filter((l) => l.status === "Qualified").length),
      tone: "success",
    },
    {
      label: "Negotiation",
      value: String(m.leads.filter((l) => l.status === "Negotiation").length),
      tone: "info",
    },
    { label: "Pipeline Value", value: money(m.leads.reduce((s, l) => s + l.budget, 0)) },
  ],
  columns: [
    col<LeadRow>("leadNo", "Lead ID", {
      render: (r) => <span className="font-medium">{r.leadNo}</span>,
    }),
    col<LeadRow>("name", "Name"),
    col<LeadRow>("contact", "Contact", { hideOnMobile: true }),
    col<LeadRow>("source", "Source", { hideOnMobile: true }),
    col<LeadRow>("projectInterest", "Project Interest"),
    col<LeadRow>("unitInterest", "Unit", { hideOnMobile: true }),
    col<LeadRow>("budget", "Budget", {
      align: "right",
      render: (r) => money(r.budget),
      value: (r) => r.budget,
    }),
    col<LeadRow>("assignedTo", "Owner", { hideOnMobile: true }),
    col<LeadRow>("nextFollowUp", "Next Follow-up", {
      render: (r) => formatDate(r.nextFollowUp),
      value: (r) => r.nextFollowUp,
    }),
    col<LeadRow>("priority", "Priority", { render: (r) => <StatusBadge value={r.priority} /> }),
    col<LeadRow>("status", "Status", { render: (r) => <StatusBadge value={r.status} /> }),
  ] as never,
};

type CustomerRow = (typeof m.customers)[number];
const customers: Preset = {
  title: "Customers",
  description: "Booked customers with unit, agreement value, collection and outstanding.",
  breadcrumbs: [{ label: "Sales & CRM" }, { label: "Customers" }],
  primaryAction: "Add Customer",
  rows: m.customers,
  getId: ((r: CustomerRow) => r.id) as never,
  searchKeys: ((r: CustomerRow) =>
    `${r.customerNo} ${r.name} ${r.contact} ${r.project} ${r.unit}`) as never,
  filters: [
    {
      key: "project",
      label: "Projects",
      options: uniq(m.customers.map((r) => r.project)),
      predicate: (r: CustomerRow, v: string) => r.project === v,
    },
    {
      key: "status",
      label: "Status",
      options: uniq(m.customers.map((r) => r.status)),
      predicate: (r: CustomerRow, v: string) => r.status === v,
    },
  ] as never,
  kpis: [
    { label: "Customers", value: String(m.customers.length) },
    {
      label: "Agreement Value",
      value: money(m.customers.reduce((s, c) => s + c.agreementValue, 0)),
    },
    {
      label: "Collected",
      value: money(m.customers.reduce((s, c) => s + c.received, 0)),
      tone: "success",
    },
    {
      label: "Outstanding",
      value: money(m.customers.reduce((s, c) => s + c.outstanding, 0)),
      tone: "warning",
    },
  ],
  columns: [
    col<CustomerRow>("customerNo", "Customer No", {
      render: (r) => <span className="font-medium">{r.customerNo}</span>,
    }),
    col<CustomerRow>("name", "Name"),
    col<CustomerRow>("contact", "Contact", { hideOnMobile: true }),
    col<CustomerRow>("city", "City", { hideOnMobile: true }),
    col<CustomerRow>("project", "Project"),
    col<CustomerRow>("unit", "Unit"),
    col<CustomerRow>("agreementValue", "Agreement Value", {
      align: "right",
      render: (r) => money(r.agreementValue),
      value: (r) => r.agreementValue,
    }),
    col<CustomerRow>("received", "Received", {
      align: "right",
      render: (r) => money(r.received),
      value: (r) => r.received,
    }),
    col<CustomerRow>("outstanding", "Outstanding", {
      align: "right",
      render: (r) => <span className="font-semibold text-destructive">{money(r.outstanding)}</span>,
      value: (r) => r.outstanding,
    }),
    col<CustomerRow>("status", "Status", { render: (r) => <StatusBadge value={r.status} /> }),
  ] as never,
};

type FollowRow = (typeof m.followUps)[number];
const followUps: Preset = {
  title: "Follow-ups",
  description: "Interaction log across leads and customers with outcome and next action date.",
  breadcrumbs: [{ label: "Sales & CRM" }, { label: "Follow-ups" }],
  primaryAction: "Log Follow-up",
  rows: m.followUps,
  getId: ((r: FollowRow) => r.id) as never,
  searchKeys: ((r: FollowRow) => `${r.entity} ${r.assignedTo} ${r.outcome}`) as never,
  filters: [
    {
      key: "status",
      label: "Status",
      options: uniq(m.followUps.map((r) => r.status)),
      predicate: (r: FollowRow, v: string) => r.status === v,
    },
    {
      key: "type",
      label: "Type",
      options: uniq(m.followUps.map((r) => r.type)),
      predicate: (r: FollowRow, v: string) => r.type === v,
    },
  ] as never,
  kpis: [
    { label: "Follow-ups", value: String(m.followUps.length) },
    {
      label: "Pending",
      value: String(m.followUps.filter((f) => f.status === "Pending").length),
      tone: "warning",
    },
    {
      label: "Overdue",
      value: String(m.followUps.filter((f) => f.status === "Overdue").length),
      tone: "danger",
    },
    {
      label: "Completed",
      value: String(m.followUps.filter((f) => f.status === "Completed").length),
      tone: "success",
    },
  ],
  columns: [
    col<FollowRow>("entity", "Lead / Customer", {
      render: (r) => <span className="font-medium">{r.entity}</span>,
    }),
    col<FollowRow>("entityType", "Type", { hideOnMobile: true }),
    col<FollowRow>("date", "Date", { render: (r) => formatDate(r.date), value: (r) => r.date }),
    col<FollowRow>("type", "Mode"),
    col<FollowRow>("assignedTo", "Owner", { hideOnMobile: true }),
    col<FollowRow>("outcome", "Outcome"),
    col<FollowRow>("nextFollowUp", "Next Follow-up", {
      render: (r) => formatDate(r.nextFollowUp),
      value: (r) => r.nextFollowUp,
    }),
    col<FollowRow>("status", "Status", { render: (r) => <StatusBadge value={r.status} /> }),
  ] as never,
};

type ApptRow = (typeof m.appointments)[number];
function appointments(missingOnly: boolean): Preset {
  const rows = missingOnly ? m.appointments.filter((a) => a.status === "Missed") : m.appointments;
  return {
    title: missingOnly ? "Missing Appointments" : "Appointments",
    description: missingOnly
      ? "Appointments not attended — needs immediate reassignment or rescheduling."
      : "Scheduled customer meetings, site visits and document handovers.",
    breadcrumbs: [
      { label: "Sales & CRM" },
      { label: missingOnly ? "Missing Appointments" : "Appointments" },
    ],
    primaryAction: missingOnly ? undefined : "New Appointment",
    rows,
    getId: ((r: ApptRow) => r.id) as never,
    searchKeys: ((r: ApptRow) =>
      `${r.customer} ${r.salesperson} ${r.location} ${r.purpose}`) as never,
    filters: [
      {
        key: "status",
        label: "Status",
        options: uniq(m.appointments.map((r) => r.status)),
        predicate: (r: ApptRow, v: string) => r.status === v,
      },
    ] as never,
    kpis: [
      { label: "Appointments", value: String(rows.length) },
      {
        label: "Scheduled",
        value: String(rows.filter((a) => a.status === "Scheduled").length),
        tone: "info",
      },
      {
        label: "Completed",
        value: String(rows.filter((a) => a.status === "Completed").length),
        tone: "success",
      },
      {
        label: "Missed",
        value: String(m.appointments.filter((a) => a.status === "Missed").length),
        tone: "danger",
      },
    ],
    columns: [
      col<ApptRow>("customer", "Customer", {
        render: (r) => <span className="font-medium">{r.customer}</span>,
      }),
      col<ApptRow>("salesperson", "Salesperson"),
      col<ApptRow>("datetime", "Date & Time"),
      col<ApptRow>("location", "Location", { hideOnMobile: true }),
      col<ApptRow>("purpose", "Purpose"),
      col<ApptRow>("status", "Status", { render: (r) => <StatusBadge value={r.status} /> }),
    ] as never,
  };
}

type TaskRow = (typeof m.tasks)[number];
const crmTasks: Preset = {
  title: "Tasks",
  description: "Tasks assigned across projects, procurement, collections and CRM.",
  breadcrumbs: [{ label: "Sales & CRM" }, { label: "Tasks" }],
  primaryAction: "New Task",
  rows: m.tasks,
  getId: ((r: TaskRow) => r.id) as never,
  searchKeys: ((r: TaskRow) => `${r.title} ${r.assignedTo} ${r.related}`) as never,
  filters: [
    {
      key: "status",
      label: "Status",
      options: uniq(m.tasks.map((r) => r.status)),
      predicate: (r: TaskRow, v: string) => r.status === v,
    },
    {
      key: "priority",
      label: "Priority",
      options: ["Urgent", "High", "Medium", "Low"],
      predicate: (r: TaskRow, v: string) => r.priority === v,
    },
  ] as never,
  kpis: [
    { label: "Tasks", value: String(m.tasks.length) },
    {
      label: "Open",
      value: String(m.tasks.filter((t) => t.status === "Open").length),
      tone: "info",
    },
    {
      label: "Overdue",
      value: String(m.tasks.filter((t) => t.status === "Overdue").length),
      tone: "danger",
    },
    {
      label: "Completed",
      value: String(m.tasks.filter((t) => t.status === "Completed").length),
      tone: "success",
    },
  ],
  columns: [
    col<TaskRow>("title", "Task", {
      render: (r) => <span className="font-medium">{r.title}</span>,
    }),
    col<TaskRow>("assignedTo", "Assigned To"),
    col<TaskRow>("related", "Related To", { hideOnMobile: true }),
    col<TaskRow>("dueDate", "Due Date", {
      render: (r) => formatDate(r.dueDate),
      value: (r) => r.dueDate,
    }),
    col<TaskRow>("priority", "Priority", { render: (r) => <StatusBadge value={r.priority} /> }),
    col<TaskRow>("status", "Status", { render: (r) => <StatusBadge value={r.status} /> }),
  ] as never,
};

type UnitRow = (typeof m.units)[number];
function unitsPreset(title: string, description: string): Preset {
  return {
    title,
    description,
    breadcrumbs: [{ label: "Sales & CRM" }, { label: title }],
    rows: m.units,
    getId: ((r: UnitRow) => r.id) as never,
    searchKeys: ((r: UnitRow) =>
      `${r.unitNo} ${r.project} ${r.tower} ${r.unitType} ${r.customer ?? ""}`) as never,
    filters: [
      {
        key: "project",
        label: "Projects",
        options: uniq(m.units.map((r) => r.project)),
        predicate: (r: UnitRow, v: string) => r.project === v,
      },
      {
        key: "status",
        label: "Status",
        options: uniq(m.units.map((r) => r.status)),
        predicate: (r: UnitRow, v: string) => r.status === v,
      },
      {
        key: "unitType",
        label: "Unit Type",
        options: uniq(m.units.map((r) => r.unitType)),
        predicate: (r: UnitRow, v: string) => r.unitType === v,
      },
    ] as never,
    kpis: [
      { label: "Total Units", value: String(m.units.length) },
      {
        label: "Available",
        value: String(m.units.filter((u) => u.status === "Available").length),
        tone: "success",
      },
      {
        label: "Booked / Sold",
        value: String(m.units.filter((u) => u.status === "Booked" || u.status === "Sold").length),
        tone: "info",
      },
      { label: "Inventory Value", value: money(m.units.reduce((s, u) => s + u.totalPrice, 0)) },
    ],
    columns: [
      col<UnitRow>("unitNo", "Unit", {
        render: (r) => <span className="font-medium">{r.unitNo}</span>,
      }),
      col<UnitRow>("project", "Project"),
      col<UnitRow>("tower", "Tower / Block", { hideOnMobile: true }),
      col<UnitRow>("floor", "Floor", { align: "right", hideOnMobile: true }),
      col<UnitRow>("unitType", "Type"),
      col<UnitRow>("carpetArea", "Carpet (sqft)", {
        align: "right",
        render: (r) => formatNumber(r.carpetArea),
        value: (r) => r.carpetArea,
      }),
      col<UnitRow>("saleableArea", "Saleable (sqft)", {
        align: "right",
        render: (r) => formatNumber(r.saleableArea),
        hideOnMobile: true,
      }),
      col<UnitRow>("basePrice", "Base Price", {
        align: "right",
        render: (r) => money(r.basePrice),
        value: (r) => r.basePrice,
      }),
      col<UnitRow>("otherCharges", "Other Charges", {
        align: "right",
        render: (r) => money(r.otherCharges),
        hideOnMobile: true,
      }),
      col<UnitRow>("totalPrice", "Total Price", {
        align: "right",
        render: (r) => <span className="font-semibold">{money(r.totalPrice)}</span>,
        value: (r) => r.totalPrice,
      }),
      col<UnitRow>("customer", "Customer", {
        render: (r) => r.customer ?? "—",
        hideOnMobile: true,
      }),
      col<UnitRow>("status", "Status", { render: (r) => <StatusBadge value={r.status} /> }),
    ] as never,
  };
}

type MilestoneRow = (typeof m.paymentSchedule)[number];
function paymentPreset(mode: "schedule" | "defaulters" | "interest"): Preset {
  const rows =
    mode === "schedule"
      ? m.paymentSchedule
      : mode === "defaulters"
        ? m.paymentSchedule.filter((p) => p.status === "Overdue")
        : m.paymentSchedule.filter((p) => p.interest > 0);
  const title =
    mode === "schedule"
      ? "Payment Schedule"
      : mode === "defaulters"
        ? "Defaulters"
        : "Interest Calculation";
  return {
    title,
    description:
      mode === "schedule"
        ? "Milestone-wise demand, receipt and balance for every booked unit."
        : mode === "defaulters"
          ? "Customers with overdue milestones, days delayed and interest exposure."
          : "Delay interest computed at 18% p.a. on overdue milestone amounts.",
    breadcrumbs: [{ label: "Sales & CRM" }, { label: title }],
    rows,
    getId: ((r: MilestoneRow) => r.id) as never,
    searchKeys: ((r: MilestoneRow) => `${r.customer} ${r.unit} ${r.milestone}`) as never,
    filters: [
      {
        key: "status",
        label: "Status",
        options: uniq(m.paymentSchedule.map((r) => r.status)),
        predicate: (r: MilestoneRow, v: string) => r.status === v,
      },
    ] as never,
    kpis: [
      { label: "Milestones", value: String(rows.length) },
      { label: "Demand Raised", value: money(rows.reduce((s, r) => s + r.amount, 0)) },
      { label: "Collected", value: money(rows.reduce((s, r) => s + r.paid, 0)), tone: "success" },
      {
        label: mode === "interest" ? "Interest Receivable" : "Outstanding",
        value: money(
          mode === "interest"
            ? rows.reduce((s, r) => s + r.interest, 0)
            : rows.reduce((s, r) => s + (r.amount - r.paid), 0),
        ),
        tone: "danger",
      },
    ],
    columns: [
      col<MilestoneRow>("customer", "Customer", {
        render: (r) => <span className="font-medium">{r.customer}</span>,
      }),
      col<MilestoneRow>("unit", "Project / Unit"),
      col<MilestoneRow>("milestone", "Milestone"),
      col<MilestoneRow>("dueDate", "Due Date", {
        render: (r) => formatDate(r.dueDate),
        value: (r) => r.dueDate,
      }),
      col<MilestoneRow>("amount", "Amount", {
        align: "right",
        render: (r) => money(r.amount),
        value: (r) => r.amount,
      }),
      col<MilestoneRow>("paid", "Paid", {
        align: "right",
        render: (r) => money(r.paid),
        value: (r) => r.paid,
      }),
      col<MilestoneRow>("balance", "Balance", {
        align: "right",
        render: (r) => money(r.amount - r.paid),
        value: (r) => r.amount - r.paid,
      }),
      col<MilestoneRow>("interest", "Interest", {
        align: "right",
        render: (r) =>
          r.interest ? <span className="text-destructive">{money(r.interest)}</span> : "—",
        value: (r) => r.interest,
      }),
      col<MilestoneRow>("status", "Status", { render: (r) => <StatusBadge value={r.status} /> }),
    ] as never,
  };
}

type BrokerageRow = (typeof m.brokerage)[number];
const brokerage: Preset = {
  title: "Brokerage",
  description: "Channel partner brokerage on bookings with payment status.",
  breadcrumbs: [{ label: "Sales & CRM" }, { label: "Brokerage" }],
  rows: m.brokerage,
  getId: ((r: BrokerageRow) => r.id) as never,
  searchKeys: ((r: BrokerageRow) => `${r.broker} ${r.customer} ${r.project}`) as never,
  kpis: [
    { label: "Brokerage Entries", value: String(m.brokerage.length) },
    { label: "Booking Value", value: money(m.brokerage.reduce((s, b) => s + b.bookingValue, 0)) },
    {
      label: "Brokerage Payable",
      value: money(
        m.brokerage.filter((b) => b.paymentStatus !== "Paid").reduce((s, b) => s + b.amount, 0),
      ),
      tone: "warning",
    },
    {
      label: "Brokerage Paid",
      value: money(
        m.brokerage.filter((b) => b.paymentStatus === "Paid").reduce((s, b) => s + b.amount, 0),
      ),
      tone: "success",
    },
  ],
  columns: [
    col<BrokerageRow>("broker", "Broker", {
      render: (r) => <span className="font-medium">{r.broker}</span>,
    }),
    col<BrokerageRow>("customer", "Customer"),
    col<BrokerageRow>("project", "Project", { hideOnMobile: true }),
    col<BrokerageRow>("unit", "Unit", { hideOnMobile: true }),
    col<BrokerageRow>("bookingDate", "Booking Date", { render: (r) => formatDate(r.bookingDate) }),
    col<BrokerageRow>("bookingValue", "Booking Value", {
      align: "right",
      render: (r) => money(r.bookingValue),
      value: (r) => r.bookingValue,
    }),
    col<BrokerageRow>("percent", "%", { align: "right", render: (r) => `${r.percent}%` }),
    col<BrokerageRow>("amount", "Brokerage", {
      align: "right",
      render: (r) => <span className="font-semibold">{money(r.amount)}</span>,
      value: (r) => r.amount,
    }),
    col<BrokerageRow>("paymentStatus", "Payment", {
      render: (r) => <StatusBadge value={r.paymentStatus} />,
    }),
  ] as never,
};

type BrokerPerfRow = (typeof m.brokerPerformance)[number];
const brokerPerformance: Preset = {
  title: "Broker Performance",
  description: "Channel partner productivity: leads, bookings, sales value and conversion.",
  breadcrumbs: [{ label: "Sales & CRM" }, { label: "Broker Performance" }],
  rows: m.brokerPerformance,
  getId: ((r: BrokerPerfRow) => r.broker) as never,
  searchKeys: ((r: BrokerPerfRow) => r.broker) as never,
  kpis: [
    { label: "Channel Partners", value: String(m.brokerPerformance.length) },
    { label: "Leads Sourced", value: String(m.brokerPerformance.reduce((s, b) => s + b.leads, 0)) },
    {
      label: "Bookings",
      value: String(m.brokerPerformance.reduce((s, b) => s + b.bookings, 0)),
      tone: "success",
    },
    {
      label: "Sales Value",
      value: money(m.brokerPerformance.reduce((s, b) => s + b.salesValue, 0)),
    },
  ],
  columns: [
    col<BrokerPerfRow>("broker", "Broker", {
      render: (r) => <span className="font-medium">{r.broker}</span>,
    }),
    col<BrokerPerfRow>("leads", "Leads", { align: "right" }),
    col<BrokerPerfRow>("bookings", "Bookings", { align: "right" }),
    col<BrokerPerfRow>("salesValue", "Sales Value", {
      align: "right",
      render: (r) => money(r.salesValue),
      value: (r) => r.salesValue,
    }),
    col<BrokerPerfRow>("brokerage", "Brokerage", {
      align: "right",
      render: (r) => money(r.brokerage),
      value: (r) => r.brokerage,
    }),
    col<BrokerPerfRow>("conversion", "Conversion", {
      align: "right",
      render: (r) => `${r.conversion}%`,
      value: (r) => r.conversion,
    }),
  ] as never,
};

/* ============================== ACCOUNTING ============================== */

type LedgerRow = (typeof m.ledgerEntries)[number];
function ledgerPreset(title: string, description: string): Preset {
  return {
    title,
    description,
    breadcrumbs: [{ label: "Financial Accounting" }, { label: title }],
    primaryAction: title.includes("Voucher") ? "New Voucher" : undefined,
    rows: m.ledgerEntries,
    getId: ((r: LedgerRow) => r.id) as never,
    searchKeys: ((r: LedgerRow) =>
      `${r.voucherNo} ${r.account} ${r.narration} ${r.project}`) as never,
    filters: [
      {
        key: "voucherType",
        label: "Voucher Type",
        options: uniq(m.ledgerEntries.map((r) => r.voucherType)),
        predicate: (r: LedgerRow, v: string) => r.voucherType === v,
      },
      {
        key: "project",
        label: "Projects",
        options: uniq(m.ledgerEntries.map((r) => r.project)),
        predicate: (r: LedgerRow, v: string) => r.project === v,
      },
    ] as never,
    kpis: [
      { label: "Vouchers", value: String(m.ledgerEntries.length) },
      { label: "Total Debit", value: money(m.ledgerEntries.reduce((s, e) => s + e.debit, 0)) },
      { label: "Total Credit", value: money(m.ledgerEntries.reduce((s, e) => s + e.credit, 0)) },
      {
        label: "Projects Posted",
        value: String(uniq(m.ledgerEntries.map((e) => e.project)).length),
        tone: "info",
      },
    ],
    columns: [
      col<LedgerRow>("date", "Date", { render: (r) => formatDate(r.date), value: (r) => r.date }),
      col<LedgerRow>("voucherNo", "Voucher No", {
        render: (r) => <span className="font-medium">{r.voucherNo}</span>,
      }),
      col<LedgerRow>("voucherType", "Type"),
      col<LedgerRow>("account", "Account"),
      col<LedgerRow>("narration", "Narration", { hideOnMobile: true }),
      col<LedgerRow>("project", "Project", { hideOnMobile: true }),
      col<LedgerRow>("debit", "Debit", {
        align: "right",
        render: (r) => (r.debit ? money(r.debit) : "—"),
        value: (r) => r.debit,
      }),
      col<LedgerRow>("credit", "Credit", {
        align: "right",
        render: (r) => (r.credit ? money(r.credit) : "—"),
        value: (r) => r.credit,
      }),
    ] as never,
  };
}

type ArRow = (typeof m.receivables)[number];
function arApPreset(mode: "ar" | "ap"): Preset {
  const rows = mode === "ar" ? m.receivables : m.payables;
  const title = mode === "ar" ? "Accounts Receivable" : "Accounts Payable";
  return {
    title,
    description:
      mode === "ar"
        ? "Customer invoices with receipts, outstanding and ageing bucket."
        : "Supplier and contractor bills with payments, outstanding and ageing bucket.",
    breadcrumbs: [{ label: "Financial Accounting" }, { label: title }],
    rows,
    getId: ((r: ArRow) => r.id) as never,
    searchKeys: ((r: ArRow) => `${r.party} ${r.invoiceNo} ${r.project}`) as never,
    filters: [
      {
        key: "ageingBucket",
        label: "Ageing",
        options: ["0-30", "31-60", "61-90", "90+"],
        predicate: (r: ArRow, v: string) => r.ageingBucket === v,
      },
      {
        key: "project",
        label: "Projects",
        options: uniq(rows.map((r) => r.project)),
        predicate: (r: ArRow, v: string) => r.project === v,
      },
    ] as never,
    kpis: [
      { label: "Open Documents", value: String(rows.length) },
      { label: "Billed Value", value: money(rows.reduce((s, r) => s + r.amount, 0)) },
      {
        label: mode === "ar" ? "Collected" : "Paid",
        value: money(rows.reduce((s, r) => s + r.paid, 0)),
        tone: "success",
      },
      {
        label: "Outstanding",
        value: money(rows.reduce((s, r) => s + r.outstanding, 0)),
        tone: "danger",
      },
    ],
    columns: [
      col<ArRow>("party", mode === "ar" ? "Customer" : "Supplier", {
        render: (r) => <span className="font-medium">{r.party}</span>,
      }),
      col<ArRow>("invoiceNo", "Document No"),
      col<ArRow>("date", "Date", { render: (r) => formatDate(r.date), value: (r) => r.date }),
      col<ArRow>("dueDate", "Due Date", {
        render: (r) => formatDate(r.dueDate),
        value: (r) => r.dueDate,
      }),
      col<ArRow>("project", "Project", { hideOnMobile: true }),
      col<ArRow>("amount", "Amount", {
        align: "right",
        render: (r) => money(r.amount),
        value: (r) => r.amount,
      }),
      col<ArRow>("paid", mode === "ar" ? "Received" : "Paid", {
        align: "right",
        render: (r) => money(r.paid),
        value: (r) => r.paid,
      }),
      col<ArRow>("outstanding", "Outstanding", {
        align: "right",
        render: (r) => (
          <span className="font-semibold text-destructive">{money(r.outstanding)}</span>
        ),
        value: (r) => r.outstanding,
      }),
      col<ArRow>("ageingBucket", "Ageing", {
        render: (r) => <StatusBadge value={`${r.ageingBucket} days`} />,
      }),
    ] as never,
  };
}

type AssetRow = (typeof m.fixedAssets)[number];
const fixedAssets: Preset = {
  title: "Fixed Assets",
  description: "Plant, machinery and equipment register with depreciation and written down value.",
  breadcrumbs: [{ label: "Financial Accounting" }, { label: "Fixed Assets" }],
  primaryAction: "Add Asset",
  rows: m.fixedAssets,
  getId: ((r: AssetRow) => r.id) as never,
  searchKeys: ((r: AssetRow) => `${r.asset} ${r.category}`) as never,
  kpis: [
    { label: "Assets", value: String(m.fixedAssets.length) },
    { label: "Gross Block", value: money(m.fixedAssets.reduce((s, a) => s + a.cost, 0)) },
    {
      label: "Depreciation",
      value: money(m.fixedAssets.reduce((s, a) => s + a.depreciation, 0)),
      tone: "warning",
    },
    {
      label: "Net Block",
      value: money(m.fixedAssets.reduce((s, a) => s + a.wdv, 0)),
      tone: "success",
    },
  ],
  columns: [
    col<AssetRow>("asset", "Asset", {
      render: (r) => <span className="font-medium">{r.asset}</span>,
    }),
    col<AssetRow>("category", "Category"),
    col<AssetRow>("purchaseDate", "Purchase Date", { render: (r) => formatDate(r.purchaseDate) }),
    col<AssetRow>("cost", "Cost", {
      align: "right",
      render: (r) => money(r.cost),
      value: (r) => r.cost,
    }),
    col<AssetRow>("depreciation", "Depreciation", {
      align: "right",
      render: (r) => money(r.depreciation),
      value: (r) => r.depreciation,
    }),
    col<AssetRow>("wdv", "Net Book Value", {
      align: "right",
      render: (r) => <span className="font-semibold">{money(r.wdv)}</span>,
      value: (r) => r.wdv,
    }),
  ] as never,
};

type GstRow = (typeof m.gstRegister)[number];
const gst: Preset = {
  title: "GST Register",
  description: "Input and output GST transactions with CGST/SGST split, ready for return filing.",
  breadcrumbs: [{ label: "Financial Accounting" }, { label: "GST" }],
  rows: m.gstRegister,
  getId: ((r: GstRow) => r.id) as never,
  searchKeys: ((r: GstRow) => `${r.party} ${r.invoiceNo} ${r.gstin}`) as never,
  filters: [
    {
      key: "type",
      label: "Type",
      options: ["Input", "Output"],
      predicate: (r: GstRow, v: string) => r.type === v,
    },
    {
      key: "period",
      label: "Period",
      options: uniq(m.gstRegister.map((r) => r.period)),
      predicate: (r: GstRow, v: string) => r.period === v,
    },
  ] as never,
  kpis: [
    { label: "Transactions", value: String(m.gstRegister.length) },
    { label: "Taxable Value", value: money(m.gstRegister.reduce((s, g) => s + g.taxable, 0)) },
    {
      label: "Input Tax Credit",
      value: money(
        m.gstRegister.filter((g) => g.type === "Input").reduce((s, g) => s + g.cgst + g.sgst, 0),
      ),
      tone: "success",
    },
    {
      label: "Output Tax",
      value: money(
        m.gstRegister.filter((g) => g.type === "Output").reduce((s, g) => s + g.cgst + g.sgst, 0),
      ),
      tone: "warning",
    },
  ],
  columns: [
    col<GstRow>("invoiceNo", "Invoice No", {
      render: (r) => <span className="font-medium">{r.invoiceNo}</span>,
    }),
    col<GstRow>("period", "Period"),
    col<GstRow>("party", "Party"),
    col<GstRow>("gstin", "GSTIN", { hideOnMobile: true }),
    col<GstRow>("type", "Type", { render: (r) => <StatusBadge value={r.type} /> }),
    col<GstRow>("taxable", "Taxable", {
      align: "right",
      render: (r) => money(r.taxable),
      value: (r) => r.taxable,
    }),
    col<GstRow>("cgst", "CGST", { align: "right", render: (r) => money(r.cgst) }),
    col<GstRow>("sgst", "SGST", { align: "right", render: (r) => money(r.sgst) }),
    col<GstRow>("total", "Total", {
      align: "right",
      render: (r) => <span className="font-semibold">{money(r.total)}</span>,
      value: (r) => r.total,
    }),
  ] as never,
};

type TdsRow = (typeof m.tdsRegister)[number];
const tds: Preset = {
  title: "TDS Register",
  description: "Section-wise TDS deducted on contractor and supplier payments.",
  breadcrumbs: [{ label: "Financial Accounting" }, { label: "TDS" }],
  rows: m.tdsRegister,
  getId: ((r: TdsRow) => r.id) as never,
  searchKeys: ((r: TdsRow) => `${r.party} ${r.pan} ${r.section}`) as never,
  filters: [
    {
      key: "section",
      label: "Section",
      options: uniq(m.tdsRegister.map((r) => r.section)),
      predicate: (r: TdsRow, v: string) => r.section === v,
    },
    {
      key: "status",
      label: "Status",
      options: uniq(m.tdsRegister.map((r) => r.status)),
      predicate: (r: TdsRow, v: string) => r.status === v,
    },
  ] as never,
  kpis: [
    { label: "Entries", value: String(m.tdsRegister.length) },
    { label: "Base Amount", value: money(m.tdsRegister.reduce((s, t) => s + t.amount, 0)) },
    {
      label: "TDS Deducted",
      value: money(m.tdsRegister.reduce((s, t) => s + t.tds, 0)),
      tone: "info",
    },
    {
      label: "TDS Payable",
      value: money(
        m.tdsRegister.filter((t) => t.status === "Payable").reduce((s, t) => s + t.tds, 0),
      ),
      tone: "warning",
    },
  ],
  columns: [
    col<TdsRow>("party", "Party", {
      render: (r) => <span className="font-medium">{r.party}</span>,
    }),
    col<TdsRow>("pan", "PAN", { hideOnMobile: true }),
    col<TdsRow>("section", "Section"),
    col<TdsRow>("rate", "Rate", { align: "right", render: (r) => `${r.rate}%` }),
    col<TdsRow>("amount", "Amount", {
      align: "right",
      render: (r) => money(r.amount),
      value: (r) => r.amount,
    }),
    col<TdsRow>("tds", "TDS", {
      align: "right",
      render: (r) => <span className="font-semibold">{money(r.tds)}</span>,
      value: (r) => r.tds,
    }),
    col<TdsRow>("quarter", "Quarter", { hideOnMobile: true }),
    col<TdsRow>("status", "Status", { render: (r) => <StatusBadge value={r.status} /> }),
  ] as never,
};

type BrRow = (typeof m.bankReconciliation)[number];
const bankRec: Preset = {
  title: "Bank Reconciliation",
  description: "Book versus bank comparison with matched and unmatched entries.",
  breadcrumbs: [{ label: "Financial Accounting" }, { label: "Bank Reconciliation" }],
  rows: m.bankReconciliation,
  getId: ((r: BrRow) => r.id) as never,
  searchKeys: ((r: BrRow) => r.particulars) as never,
  filters: [
    {
      key: "status",
      label: "Status",
      options: ["Matched", "Unmatched"],
      predicate: (r: BrRow, v: string) => r.status === v,
    },
  ] as never,
  kpis: [
    { label: "Entries", value: String(m.bankReconciliation.length) },
    {
      label: "Book Balance",
      value: money(m.bankReconciliation.reduce((s, b) => s + b.bookAmount, 0)),
    },
    {
      label: "Bank Balance",
      value: money(m.bankReconciliation.reduce((s, b) => s + b.bankAmount, 0)),
    },
    {
      label: "Unmatched",
      value: String(m.bankReconciliation.filter((b) => b.status === "Unmatched").length),
      tone: "danger",
    },
  ],
  columns: [
    col<BrRow>("date", "Date", { render: (r) => formatDate(r.date), value: (r) => r.date }),
    col<BrRow>("particulars", "Particulars", {
      render: (r) => <span className="font-medium">{r.particulars}</span>,
    }),
    col<BrRow>("bookAmount", "Book Amount", {
      align: "right",
      render: (r) => money(r.bookAmount),
      value: (r) => r.bookAmount,
    }),
    col<BrRow>("bankAmount", "Bank Amount", {
      align: "right",
      render: (r) => money(r.bankAmount),
      value: (r) => r.bankAmount,
    }),
    col<BrRow>("diff", "Difference", {
      align: "right",
      render: (r) => money(r.bookAmount - r.bankAmount),
      value: (r) => r.bookAmount - r.bankAmount,
    }),
    col<BrRow>("status", "Status", { render: (r) => <StatusBadge value={r.status} /> }),
  ] as never,
};

type TbRow = (typeof m.trialBalance)[number];
const trialBalance: Preset = {
  title: "Trial Balance",
  description: "Ledger-wise debit and credit balances grouped by account head.",
  breadcrumbs: [{ label: "Financial Accounting" }, { label: "Trial Balance" }],
  rows: m.trialBalance,
  getId: ((r: TbRow) => r.id) as never,
  searchKeys: ((r: TbRow) => `${r.account} ${r.group}`) as never,
  filters: [
    {
      key: "group",
      label: "Group",
      options: uniq(m.trialBalance.map((r) => r.group)),
      predicate: (r: TbRow, v: string) => r.group === v,
    },
  ] as never,
  kpis: [
    { label: "Ledgers", value: String(m.trialBalance.length) },
    { label: "Total Debit", value: money(m.trialBalance.reduce((s, r) => s + r.debit, 0)) },
    { label: "Total Credit", value: money(m.trialBalance.reduce((s, r) => s + r.credit, 0)) },
    {
      label: "Groups",
      value: String(uniq(m.trialBalance.map((r) => r.group)).length),
      tone: "info",
    },
  ],
  columns: [
    col<TbRow>("account", "Ledger Account", {
      render: (r) => <span className="font-medium">{r.account}</span>,
    }),
    col<TbRow>("group", "Group"),
    col<TbRow>("debit", "Debit", {
      align: "right",
      render: (r) => (r.debit ? money(r.debit) : "—"),
      value: (r) => r.debit,
    }),
    col<TbRow>("credit", "Credit", {
      align: "right",
      render: (r) => (r.credit ? money(r.credit) : "—"),
      value: (r) => r.credit,
    }),
  ] as never,
};

/* ================================ PAYROLL ================================ */

type EmpRow = (typeof m.employees)[number];
const employees: Preset = {
  title: "Employee Master",
  description: "Company-wide employee register across head office and project sites.",
  breadcrumbs: [{ label: "Payroll & HR" }, { label: "Employee Master" }],
  primaryAction: "Add Employee",
  rows: m.employees,
  getId: ((r: EmpRow) => r.id) as never,
  searchKeys: ((r: EmpRow) =>
    `${r.empId} ${r.name} ${r.department} ${r.designation} ${r.location}`) as never,
  filters: [
    {
      key: "department",
      label: "Department",
      options: uniq(m.employees.map((r) => r.department)),
      predicate: (r: EmpRow, v: string) => r.department === v,
    },
    {
      key: "status",
      label: "Status",
      options: uniq(m.employees.map((r) => r.status)),
      predicate: (r: EmpRow, v: string) => r.status === v,
    },
    {
      key: "location",
      label: "Location",
      options: uniq(m.employees.map((r) => r.location)),
      predicate: (r: EmpRow, v: string) => r.location === v,
    },
  ] as never,
  kpis: [
    { label: "Employees", value: String(m.employees.length) },
    {
      label: "Active",
      value: String(m.employees.filter((e) => e.status === "Active").length),
      tone: "success",
    },
    { label: "Monthly Payroll", value: money(m.employees.reduce((s, e) => s + e.grossSalary, 0)) },
    {
      label: "Departments",
      value: String(uniq(m.employees.map((e) => e.department)).length),
      tone: "info",
    },
  ],
  columns: [
    col<EmpRow>("empId", "Employee ID", {
      render: (r) => <span className="font-medium">{r.empId}</span>,
    }),
    col<EmpRow>("name", "Name"),
    col<EmpRow>("department", "Department"),
    col<EmpRow>("designation", "Designation", { hideOnMobile: true }),
    col<EmpRow>("joiningDate", "Joining Date", {
      render: (r) => formatDate(r.joiningDate),
      value: (r) => r.joiningDate,
    }),
    col<EmpRow>("location", "Location", { hideOnMobile: true }),
    col<EmpRow>("grossSalary", "Gross Salary", {
      align: "right",
      render: (r) => formatINR(r.grossSalary),
      value: (r) => r.grossSalary,
    }),
    col<EmpRow>("status", "Status", { render: (r) => <StatusBadge value={r.status} /> }),
  ] as never,
};

type AttRow = (typeof m.attendance)[number];
const attendance: Preset = {
  title: "Attendance",
  description: "Monthly attendance summary with leave, half days and overtime hours.",
  breadcrumbs: [{ label: "Payroll & HR" }, { label: "Attendance" }],
  rows: m.attendance,
  getId: ((r: AttRow) => r.id) as never,
  searchKeys: ((r: AttRow) => `${r.empId} ${r.name} ${r.department}`) as never,
  kpis: [
    { label: "Employees Tracked", value: String(m.attendance.length) },
    {
      label: "Total Present Days",
      value: formatNumber(m.attendance.reduce((s, a) => s + a.present, 0)),
    },
    {
      label: "Leave Days",
      value: formatNumber(m.attendance.reduce((s, a) => s + a.leave, 0)),
      tone: "warning",
    },
    {
      label: "Overtime Hours",
      value: formatNumber(m.attendance.reduce((s, a) => s + a.overtimeHours, 0)),
      tone: "info",
    },
  ],
  columns: [
    col<AttRow>("empId", "Employee ID", {
      render: (r) => <span className="font-medium">{r.empId}</span>,
    }),
    col<AttRow>("name", "Name"),
    col<AttRow>("department", "Department", { hideOnMobile: true }),
    col<AttRow>("present", "Present", { align: "right" }),
    col<AttRow>("absent", "Absent", { align: "right" }),
    col<AttRow>("leave", "Leave", { align: "right" }),
    col<AttRow>("halfDay", "Half Day", { align: "right", hideOnMobile: true }),
    col<AttRow>("overtimeHours", "OT Hours", { align: "right" }),
  ] as never,
};

type LeaveRow = (typeof m.leaveRequests)[number];
const leaves: Preset = {
  title: "Leave",
  description: "Leave requests with balance and approval routing through manager and HR.",
  breadcrumbs: [{ label: "Payroll & HR" }, { label: "Leave" }],
  primaryAction: "Apply Leave",
  workflow: { steps: ["Leave Request", "Reporting Manager", "HR", "Payroll"], activeIndex: 1 },
  rows: m.leaveRequests,
  getId: ((r: LeaveRow) => r.id) as never,
  searchKeys: ((r: LeaveRow) => `${r.empId} ${r.name} ${r.type}`) as never,
  filters: [
    {
      key: "status",
      label: "Status",
      options: uniq(m.leaveRequests.map((r) => r.status)),
      predicate: (r: LeaveRow, v: string) => r.status === v,
    },
  ] as never,
  kpis: [
    { label: "Requests", value: String(m.leaveRequests.length) },
    {
      label: "Pending",
      value: String(m.leaveRequests.filter((l) => l.status === "Pending").length),
      tone: "warning",
    },
    {
      label: "Approved",
      value: String(m.leaveRequests.filter((l) => l.status === "Approved").length),
      tone: "success",
    },
    { label: "Leave Days", value: formatNumber(m.leaveRequests.reduce((s, l) => s + l.days, 0)) },
  ],
  columns: [
    col<LeaveRow>("empId", "Employee ID", {
      render: (r) => <span className="font-medium">{r.empId}</span>,
    }),
    col<LeaveRow>("name", "Name"),
    col<LeaveRow>("type", "Leave Type"),
    col<LeaveRow>("from", "From", { render: (r) => formatDate(r.from), value: (r) => r.from }),
    col<LeaveRow>("to", "To", { render: (r) => formatDate(r.to), value: (r) => r.to }),
    col<LeaveRow>("days", "Days", { align: "right" }),
    col<LeaveRow>("balance", "Balance", { align: "right", hideOnMobile: true }),
    col<LeaveRow>("approver", "Pending With", { hideOnMobile: true }),
    col<LeaveRow>("status", "Status", { render: (r) => <StatusBadge value={r.status} /> }),
  ] as never,
};

type PayRow = (typeof m.payrollRuns)[number];
function payrollPreset(title: string, description: string): Preset {
  return {
    title,
    description,
    breadcrumbs: [{ label: "Payroll & HR" }, { label: title }],
    primaryAction: title.includes("Processing") ? "Process Payroll" : undefined,
    rows: m.payrollRuns,
    getId: ((r: PayRow) => r.id) as never,
    searchKeys: ((r: PayRow) => `${r.empId} ${r.name} ${r.department}`) as never,
    filters: [
      {
        key: "department",
        label: "Department",
        options: uniq(m.payrollRuns.map((r) => r.department)),
        predicate: (r: PayRow, v: string) => r.department === v,
      },
    ] as never,
    kpis: [
      { label: "Employees", value: String(m.payrollRuns.length) },
      { label: "Gross Payroll", value: money(m.payrollRuns.reduce((s, p) => s + p.gross, 0)) },
      {
        label: "Deductions",
        value: money(m.payrollRuns.reduce((s, p) => s + p.pf + p.esic + p.pt + p.tds + p.loan, 0)),
        tone: "warning",
      },
      {
        label: "Net Payout",
        value: money(m.payrollRuns.reduce((s, p) => s + p.net, 0)),
        tone: "success",
      },
    ],
    columns: [
      col<PayRow>("empId", "Employee ID", {
        render: (r) => <span className="font-medium">{r.empId}</span>,
      }),
      col<PayRow>("name", "Name"),
      col<PayRow>("department", "Department", { hideOnMobile: true }),
      col<PayRow>("month", "Month", { hideOnMobile: true }),
      col<PayRow>("basic", "Basic", {
        align: "right",
        render: (r) => formatINR(r.basic),
        value: (r) => r.basic,
      }),
      col<PayRow>("hra", "HRA", {
        align: "right",
        render: (r) => formatINR(r.hra),
        hideOnMobile: true,
      }),
      col<PayRow>("overtime", "Overtime", {
        align: "right",
        render: (r) => formatINR(r.overtime),
        hideOnMobile: true,
      }),
      col<PayRow>("gross", "Gross", {
        align: "right",
        render: (r) => formatINR(r.gross),
        value: (r) => r.gross,
      }),
      col<PayRow>("pf", "PF", {
        align: "right",
        render: (r) => formatINR(r.pf),
        hideOnMobile: true,
      }),
      col<PayRow>("esic", "ESIC", {
        align: "right",
        render: (r) => formatINR(r.esic),
        hideOnMobile: true,
      }),
      col<PayRow>("tds", "TDS", {
        align: "right",
        render: (r) => formatINR(r.tds),
        hideOnMobile: true,
      }),
      col<PayRow>("net", "Net Salary", {
        align: "right",
        render: (r) => <span className="font-semibold">{formatINR(r.net)}</span>,
        value: (r) => r.net,
      }),
    ] as never,
  };
}

/* ============================= ADMINISTRATION ============================= */

type UserRow = (typeof m.usersList)[number];
const users: Preset = {
  title: "Users",
  description: "Workspace users with role, branch and last login.",
  breadcrumbs: [{ label: "Administration" }, { label: "Users" }],
  primaryAction: "Invite User",
  rows: m.usersList,
  getId: ((r: UserRow) => r.id) as never,
  searchKeys: ((r: UserRow) => `${r.name} ${r.username} ${r.role} ${r.email}`) as never,
  filters: [
    {
      key: "role",
      label: "Role",
      options: uniq(m.usersList.map((r) => r.role)),
      predicate: (r: UserRow, v: string) => r.role === v,
    },
    {
      key: "status",
      label: "Status",
      options: ["Active", "Inactive"],
      predicate: (r: UserRow, v: string) => r.status === v,
    },
  ] as never,
  kpis: [
    { label: "Users", value: String(m.usersList.length) },
    {
      label: "Active",
      value: String(m.usersList.filter((u) => u.status === "Active").length),
      tone: "success",
    },
    { label: "Roles", value: String(m.roles.length), tone: "info" },
    { label: "Branches", value: String(m.branches.length) },
  ],
  columns: [
    col<UserRow>("name", "Name", { render: (r) => <span className="font-medium">{r.name}</span> }),
    col<UserRow>("username", "Username"),
    col<UserRow>("role", "Role"),
    col<UserRow>("email", "Email", { hideOnMobile: true }),
    col<UserRow>("branch", "Branch", { hideOnMobile: true }),
    col<UserRow>("lastLogin", "Last Login", { hideOnMobile: true }),
    col<UserRow>("status", "Status", { render: (r) => <StatusBadge value={r.status} /> }),
  ] as never,
};

type RoleRow = (typeof m.roles)[number];
const rolesPreset: Preset = {
  title: "Roles",
  description: "Role definitions with module scope and approval authority.",
  breadcrumbs: [{ label: "Administration" }, { label: "Roles" }],
  primaryAction: "New Role",
  rows: m.roles,
  getId: ((r: RoleRow) => r.id) as never,
  searchKeys: ((r: RoleRow) => `${r.name} ${r.modules}`) as never,
  columns: [
    col<RoleRow>("name", "Role", { render: (r) => <span className="font-medium">{r.name}</span> }),
    col<RoleRow>("users", "Users", { align: "right" }),
    col<RoleRow>("modules", "Module Access"),
    col<RoleRow>("approval", "Approval Authority"),
    col<RoleRow>("description", "Description", { hideOnMobile: true }),
  ] as never,
};

type AuditRow = (typeof m.auditLogs)[number];
const auditLogs: Preset = {
  title: "Audit Logs",
  description: "Every create, update, approve and delete with before and after values.",
  breadcrumbs: [{ label: "Administration" }, { label: "Audit Logs" }],
  rows: m.auditLogs,
  getId: ((r: AuditRow) => r.id) as never,
  searchKeys: ((r: AuditRow) => `${r.user} ${r.action} ${r.module} ${r.record}`) as never,
  filters: [
    {
      key: "module",
      label: "Module",
      options: uniq(m.auditLogs.map((r) => r.module)),
      predicate: (r: AuditRow, v: string) => r.module === v,
    },
    {
      key: "action",
      label: "Action",
      options: uniq(m.auditLogs.map((r) => r.action)),
      predicate: (r: AuditRow, v: string) => r.action === v,
    },
  ] as never,
  kpis: [
    { label: "Log Entries", value: String(m.auditLogs.length) },
    { label: "Modules Touched", value: String(uniq(m.auditLogs.map((a) => a.module)).length) },
    {
      label: "Approvals Logged",
      value: String(m.auditLogs.filter((a) => a.action === "Approved").length),
      tone: "success",
    },
    {
      label: "Deletions",
      value: String(m.auditLogs.filter((a) => a.action === "Deleted").length),
      tone: "danger",
    },
  ],
  columns: [
    col<AuditRow>("timestamp", "Timestamp", {
      render: (r) => <span className="num">{r.timestamp}</span>,
    }),
    col<AuditRow>("user", "User", { render: (r) => <span className="font-medium">{r.user}</span> }),
    col<AuditRow>("action", "Action", { render: (r) => <StatusBadge value={r.action} /> }),
    col<AuditRow>("module", "Module"),
    col<AuditRow>("record", "Record"),
    col<AuditRow>("oldValue", "Old Value", { hideOnMobile: true }),
    col<AuditRow>("newValue", "New Value", { hideOnMobile: true }),
  ] as never,
};

type SeriesRow = (typeof m.numberSeries)[number];
const numberSeries: Preset = {
  title: "Number Series",
  description: "Document numbering with prefix, running number and reset rule.",
  breadcrumbs: [{ label: "Administration" }, { label: "Number Series" }],
  primaryAction: "Add Series",
  rows: m.numberSeries,
  getId: ((r: SeriesRow) => r.id) as never,
  searchKeys: ((r: SeriesRow) => `${r.document} ${r.prefix}`) as never,
  columns: [
    col<SeriesRow>("document", "Document", {
      render: (r) => <span className="font-medium">{r.document}</span>,
    }),
    col<SeriesRow>("prefix", "Prefix"),
    col<SeriesRow>("start", "Start From", { align: "right" }),
    col<SeriesRow>("current", "Current No", { align: "right" }),
    col<SeriesRow>("resetOn", "Reset On"),
  ] as never,
};

type WfRow = (typeof m.workflowConfig)[number];
const workflows: Preset = {
  title: "Workflow Configuration",
  description: "Multi-level approval chains per document with value condition and escalation.",
  breadcrumbs: [{ label: "Administration" }, { label: "Workflow Configuration" }],
  primaryAction: "New Workflow",
  rows: m.workflowConfig,
  getId: ((r: WfRow) => r.id) as never,
  searchKeys: ((r: WfRow) => `${r.document} ${r.condition}`) as never,
  columns: [
    col<WfRow>("document", "Document", {
      render: (r) => <span className="font-medium">{r.document}</span>,
    }),
    col<WfRow>("levels", "Approval Chain", { render: (r) => r.levels.join(" → ") }),
    col<WfRow>("condition", "Condition"),
    col<WfRow>("escalation", "Escalation"),
    col<WfRow>("active", "Status", {
      render: (r) => <StatusBadge value={r.active ? "Active" : "Inactive"} />,
    }),
  ] as never,
};

type BranchRow = (typeof m.branches)[number];
const branches: Preset = {
  title: "Branch",
  description: "Registered offices with GST registration, project and headcount split.",
  breadcrumbs: [{ label: "Administration" }, { label: "Branch" }],
  primaryAction: "Add Branch",
  rows: m.branches,
  getId: ((r: BranchRow) => r.id) as never,
  searchKeys: ((r: BranchRow) => `${r.name} ${r.city} ${r.state}`) as never,
  columns: [
    col<BranchRow>("name", "Branch", {
      render: (r) => <span className="font-medium">{r.name}</span>,
    }),
    col<BranchRow>("city", "City"),
    col<BranchRow>("state", "State"),
    col<BranchRow>("gstin", "GSTIN"),
    col<BranchRow>("projects", "Projects", { align: "right" }),
    col<BranchRow>("employees", "Employees", { align: "right" }),
  ] as never,
};

type DocRow = (typeof m.documents)[number];
const documents: Preset = {
  title: "Document Management",
  description: "Drawings, agreements, statutory files and site photos linked to any record.",
  breadcrumbs: [{ label: "Documents" }],
  primaryAction: "Upload Document",
  rows: m.documents,
  getId: ((r: DocRow) => r.id) as never,
  searchKeys: ((r: DocRow) => `${r.name} ${r.type} ${r.linkedTo} ${r.uploadedBy}`) as never,
  filters: [
    {
      key: "type",
      label: "Type",
      options: uniq(m.documents.map((r) => r.type)),
      predicate: (r: DocRow, v: string) => r.type === v,
    },
  ] as never,
  kpis: [
    { label: "Documents", value: String(m.documents.length) },
    {
      label: "Document Types",
      value: String(uniq(m.documents.map((d) => d.type)).length),
      tone: "info",
    },
    { label: "Latest Upload", value: formatDate(m.documents[3]!.uploadedAt) },
    { label: "Linked Records", value: String(uniq(m.documents.map((d) => d.linkedTo)).length) },
  ],
  columns: [
    col<DocRow>("name", "File", { render: (r) => <span className="font-medium">{r.name}</span> }),
    col<DocRow>("type", "Type"),
    col<DocRow>("linkedTo", "Linked To"),
    col<DocRow>("version", "Version", { align: "center" }),
    col<DocRow>("size", "Size", { align: "right", hideOnMobile: true }),
    col<DocRow>("uploadedBy", "Uploaded By", { hideOnMobile: true }),
    col<DocRow>("uploadedAt", "Uploaded On", {
      render: (r) => formatDate(r.uploadedAt),
      value: (r) => r.uploadedAt,
    }),
  ] as never,
};

type BudgetRow = (typeof m.budgetLines)[number];
function budgetPreset(title: string, description: string): Preset {
  return {
    title,
    description,
    breadcrumbs: [{ label: "Planning & Construction" }, { label: title }],
    rows: m.budgetLines,
    getId: ((r: BudgetRow) => r.id) as never,
    searchKeys: ((r: BudgetRow) => `${r.head} ${r.project}`) as never,
    filters: [
      {
        key: "project",
        label: "Projects",
        options: uniq(m.budgetLines.map((r) => r.project)),
        predicate: (r: BudgetRow, v: string) => r.project === v,
      },
    ] as never,
    kpis: [
      { label: "Budget Heads", value: String(m.budgetLines.length) },
      { label: "Budgeted", value: money(m.budgetLines.reduce((s, b) => s + b.budget, 0)) },
      {
        label: "Actual",
        value: money(m.budgetLines.reduce((s, b) => s + b.actual, 0)),
        tone: "warning",
      },
      {
        label: "Committed",
        value: money(m.budgetLines.reduce((s, b) => s + b.committed, 0)),
        tone: "info",
      },
    ],
    columns: [
      col<BudgetRow>("head", "Budget Head", {
        render: (r) => <span className="font-medium">{r.head}</span>,
      }),
      col<BudgetRow>("project", "Project"),
      col<BudgetRow>("budget", "Budget", {
        align: "right",
        render: (r) => money(r.budget),
        value: (r) => r.budget,
      }),
      col<BudgetRow>("actual", "Actual", {
        align: "right",
        render: (r) => money(r.actual),
        value: (r) => r.actual,
      }),
      col<BudgetRow>("committed", "Committed", {
        align: "right",
        render: (r) => money(r.committed),
        value: (r) => r.committed,
      }),
      col<BudgetRow>("variance", "Variance", {
        align: "right",
        value: (r) => r.budget - r.actual,
        render: (r) => (
          <span
            className={
              r.actual > r.budget ? "font-semibold text-destructive" : "font-semibold text-success"
            }
          >
            {compactINR(r.budget - r.actual)}
          </span>
        ),
      }),
      col<BudgetRow>("used", "Utilisation", {
        align: "right",
        value: (r) => Math.round((r.actual / r.budget) * 100),
        render: (r) => (
          <div className="flex items-center justify-end gap-2">
            <Progress value={Math.min(100, (r.actual / r.budget) * 100)} className="h-1.5 w-16" />
            <span className="num text-xs">{Math.round((r.actual / r.budget) * 100)}%</span>
          </div>
        ),
      }),
    ] as never,
  };
}

/* ============================== SLUG MAPPING ============================== */

export const presets: Record<string, Preset> = {
  "procurement/indents": indents,
  "procurement/enquiries": enquiries,
  "procurement/purchase-orders": purchaseOrders,
  "procurement/grn": grns,
  "procurement/purchase-bills": purchaseBills,
  "procurement/vendor-analysis": vendorAnalysis,

  "inventory/requisition": requisitions,
  "inventory/stock-issue": txnPreset(
    "Issue",
    "Stock Issue",
    "Material issued from store to sites, contractors and work orders.",
  ),
  "inventory/stock-receipt": txnPreset(
    "Receipt",
    "Stock Receipt",
    "Material received into store against GRN and transfer documents.",
  ),
  "inventory/stock-transfer": txnPreset(
    "Transfer",
    "Stock Transfer",
    "Inter-site and inter-warehouse material movement.",
  ),
  "inventory/physical-stock": txnPreset(
    "Adjustment",
    "Physical Stock",
    "Physical verification against system stock with adjustment entries.",
  ),
  "inventory/item-history": txnPreset(
    "all",
    "Item History",
    "Complete movement history of every item across stores.",
  ),
  "inventory/stock-in-hand": stockPreset(
    "Stock in Hand",
    "Current stock position by item, store and project.",
  ),
  "inventory/stock-valuation": stockPreset(
    "Stock Valuation",
    "Closing stock value at weighted average rate.",
  ),
  "inventory/item-ageing": stockPreset(
    "Item Ageing",
    "Slow moving and ageing stock based on last movement date.",
  ),
  "inventory/site-inventory": stockPreset(
    "Site Inventory",
    "Site-wise material availability for execution teams.",
  ),
  "inventory/stock-consumption": txnPreset(
    "Issue",
    "Stock Consumption",
    "Consumption booked against work orders and BOQ activities.",
  ),
  "inventory/warehouses": warehouses,

  "construction/boq": boqPreset(false),
  "construction/boq-analysis": boqPreset(true),
  "construction/budget": budgetPreset(
    "Project Budget",
    "Head-wise budget with committed and actual cost.",
  ),
  "construction/budget-allocation": budgetPreset(
    "Budget Allocation",
    "Allocation of approved budget across heads and projects.",
  ),
  "construction/material-costing": budgetPreset(
    "Material Costing",
    "Material cost build-up against budget heads.",
  ),
  "construction/work-plan": workPlan,
  "construction/planning": workPlan,
  "construction/work-orders": workOrders,
  "construction/subcontracting": workOrders,
  "construction/contractors": contractors,
  "construction/contractor-billing": contractorBills,
  "construction/work-bills": contractorBills,

  "crm/leads": leads,
  "crm/prospects": leads,
  "crm/customers": customers,
  "crm/follow-ups": followUps,
  "crm/tasks": crmTasks,
  "crm/appointments": appointments(false),
  "crm/missing-appointments": appointments(true),

  "sales/units": unitsPreset(
    "Unit Inventory",
    "Live unit availability with pricing and booking status.",
  ),
  "sales/price-list": unitsPreset(
    "Project Price List",
    "Tower, floor and unit-wise price list with other charges.",
  ),
  "sales/payment-schedule": paymentPreset("schedule"),
  "sales/defaulters": paymentPreset("defaulters"),
  "sales/interest": paymentPreset("interest"),
  "sales/brokerage": brokerage,
  "sales/broker-performance": brokerPerformance,
  "sales/post-sales": followUps,

  "accounts/vouchers": ledgerPreset(
    "Voucher Entry",
    "Payment, receipt, journal and contra vouchers posted this year.",
  ),
  "accounts/general-ledger": ledgerPreset(
    "General Ledger",
    "Account-wise voucher postings with debit and credit.",
  ),
  "accounts/receivables": arApPreset("ar"),
  "accounts/payables": arApPreset("ap"),
  "accounts/fixed-assets": fixedAssets,
  "accounts/gst": gst,
  "accounts/tds": tds,
  "accounts/bank-reconciliation": bankRec,
  "accounts/trial-balance": trialBalance,
  "accounts/budget": budgetPreset(
    "Accounting Budget",
    "Account and project-wise budget versus actual.",
  ),

  "hr/employees": employees,
  "hr/employee-cards": employees,
  "hr/attendance": attendance,
  "hr/leave": leaves,
  "hr/payroll": payrollPreset(
    "Payroll Processing",
    "Monthly payroll run with earnings, statutory deductions and net payout.",
  ),
  "hr/salary": payrollPreset(
    "Salary Structure",
    "Employee-wise salary structure and monthly components.",
  ),
  "hr/overtime": attendance,

  "admin/users": users,
  "admin/roles": rolesPreset,
  "admin/audit-logs": auditLogs,
  "admin/number-series": numberSeries,
  "admin/workflow": workflows,
  "admin/approval-config": workflows,
  "admin/branch": branches,

  documents: documents,
};
