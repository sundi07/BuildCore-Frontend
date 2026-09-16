import { useState, useMemo, useEffect } from "react";
import {
  Printer,
  Award,
  FileCheck2,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldCheck,
  TrendingDown,
  Building2,
  Eye,
} from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { DataTable, type Column, type TableFilter } from "@/components/common/DataTable";
import { WorkflowChain } from "@/components/common/Timeline";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/common/StatusBadge";
import { quotationService } from "@/services/quotationService";
import { rfqService } from "@/services/rfqService";
import { QuotationDetailDrawer } from "@/components/procurement/QuotationDetailDrawer";
import { RfqDetailDrawer } from "@/components/procurement/RfqDetailDrawer";
import { formatDate, formatINR, formatNumber } from "@/utils/format";
import type { Quotation, Enquiry } from "@/types";

interface QuotationsPageProps {
  initialQuotationId?: string | undefined;
}

export function QuotationsPage({ initialQuotationId }: QuotationsPageProps) {
  // Quotations list state
  const [quotations, setQuotations] = useState<Quotation[]>(() => quotationService.getQuotations());

  // Selected Quotation for detail drawer
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);

  // Selected RFQ for RFQ detail drawer (cross-navigation)
  const [selectedRfq, setSelectedRfq] = useState<Enquiry | null>(null);

  // Auto-select if initialQuotationId is provided
  useEffect(() => {
    if (initialQuotationId) {
      const match = quotationService.getQuotationById(initialQuotationId);
      if (match) setSelectedQuotation(match);
    }
  }, [initialQuotationId]);

  // Dynamic KPI calculations
  const dynamicKpis = useMemo(() => {
    const totalCount = quotations.length;
    const pendingCount = quotations.filter(
      (q) =>
        q.status === "Received" ||
        q.status === "Under Technical Evaluation" ||
        !q.technicalEvaluation?.result ||
        q.technicalEvaluation.result === "Pending",
    ).length;

    const technicallyQualifiedCount = quotations.filter(
      (q) =>
        q.status === "Technically Qualified" ||
        q.status === "Commercially Qualified" ||
        q.technicalEvaluation?.result === "Qualified",
    ).length;

    const commerciallyQualifiedCount = quotations.filter(
      (q) =>
        q.status === "Commercially Qualified" ||
        (q.commercialEvaluation?.rank && q.technicalEvaluation?.result === "Qualified"),
    ).length;

    // Lowest bid among all active quotations
    const lowestBid = quotations.reduce((min, q) => {
      const val = q.grandTotal || q.total || 0;
      return val > 0 && val < min ? val : min;
    }, Infinity);

    // RFQs awaiting quotations
    const allRfqs = rfqService.getEnquiries();
    const awaitingRfqsCount = allRfqs.filter((r) => !r.responses || r.responses === 0).length;

    return [
      {
        label: "Total Quotations",
        value: String(totalCount),
      },
      {
        label: "Pending Evaluation",
        value: String(pendingCount),
        tone: "warning" as const,
      },
      {
        label: "Technically Qualified",
        value: String(technicallyQualifiedCount),
        tone: "success" as const,
      },
      {
        label: "Commercially Qualified",
        value: String(commerciallyQualifiedCount),
        tone: "info" as const,
      },
      {
        label: "Lowest Bid Value",
        value: lowestBid < Infinity ? formatINR(lowestBid, { compact: true }) : "—",
        tone: "success" as const,
      },
      {
        label: "RFQs Awaiting Quotation",
        value: String(awaitingRfqsCount),
        tone: "warning" as const,
      },
    ];
  }, [quotations]);

  function handleUpdateQuotation(updated: Quotation) {
    setQuotations((prev) =>
      prev.map((item) =>
        item.id === updated.id || item.quotationNo === updated.quotationNo ? updated : item,
      ),
    );
    setSelectedQuotation(updated);
  }

  function handleOpenRfq(rfqNo: string) {
    const rfq = rfqService
      .getEnquiries()
      .find(
        (r) => r.enquiryNo === rfqNo || r.id === rfqNo || r.enquiryNo.replace(/\//g, "-") === rfqNo,
      );
    if (rfq) {
      setSelectedRfq(rfq);
    } else {
      window.location.href = `/app/procurement/enquiries?rfq=${encodeURIComponent(rfqNo)}`;
    }
  }

  // 14 Table Columns
  const columns = useMemo<Column<Quotation>[]>(
    () => [
      {
        key: "quotationNo",
        header: "Quotation No.",
        render: (row) => (
          <div className="flex items-center gap-1.5 font-mono text-xs font-semibold text-primary">
            <span>{row.quotationNo}</span>
          </div>
        ),
      },
      {
        key: "sourceRFQNumber",
        header: "RFQ No.",
        render: (row) => (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleOpenRfq(row.sourceRFQNumber);
            }}
            className="font-mono text-xs text-muted-foreground hover:text-foreground hover:underline flex items-center gap-1 text-left"
            title="Open RFQ Details"
          >
            <span>{row.sourceRFQNumber}</span>
            <ExternalLink className="size-3 shrink-0 text-muted-foreground" />
          </button>
        ),
      },
      {
        key: "supplierName",
        header: "Supplier",
        render: (row) => (
          <div>
            <span className="font-medium text-foreground block truncate max-w-[180px]">
              {row.supplierName}
            </span>
            {row.supplierCode && (
              <span className="text-[10px] font-mono text-muted-foreground">
                {row.supplierCode}
              </span>
            )}
          </div>
        ),
      },
      {
        key: "projectName",
        header: "Project",
        render: (row) => (
          <span
            className="text-xs text-muted-foreground block truncate max-w-[170px]"
            title={row.projectName}
          >
            {row.projectName}
          </span>
        ),
      },
      {
        key: "date",
        header: "Quotation Date",
        render: (row) => (
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {formatDate(row.date)}
          </span>
        ),
      },
      {
        key: "validUntil",
        header: "Valid Until",
        render: (row) => (
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {formatDate(row.validUntil || row.validity)}
          </span>
        ),
      },
      {
        key: "items",
        header: "Items",
        align: "center",
        render: (row) => (
          <Badge variant="outline" className="text-[11px] px-1.5 py-0 font-normal">
            {row.totalItems || row.items?.length || 1}
          </Badge>
        ),
      },
      {
        key: "basicAmount",
        header: "Basic Value",
        align: "right",
        render: (row) => (
          <span className="font-mono text-xs text-muted-foreground whitespace-nowrap">
            {formatINR(row.basicAmount, { compact: true })}
          </span>
        ),
      },
      {
        key: "gst",
        header: "GST",
        align: "right",
        render: (row) => (
          <span className="font-mono text-xs text-muted-foreground whitespace-nowrap">
            {formatINR(row.gst, { compact: true })}
          </span>
        ),
      },
      {
        key: "grandTotal",
        header: "Total Value",
        align: "right",
        render: (row) => (
          <span className="font-mono text-xs font-bold text-foreground whitespace-nowrap">
            {formatINR(row.grandTotal || row.total || 0, { compact: true })}
          </span>
        ),
      },
      {
        key: "deliveryDays",
        header: "Delivery",
        align: "center",
        render: (row) => (
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {row.deliveryDays ? `${row.deliveryDays} Days` : "—"}
          </span>
        ),
      },
      {
        key: "status",
        header: "Status",
        render: (row) => <StatusBadge value={row.status} />,
      },
      {
        key: "evaluation",
        header: "Evaluation",
        render: (row) => {
          const rank = row.commercialEvaluation?.rank;
          const techResult = row.technicalEvaluation?.result;
          const isQualified =
            row.status === "Technically Qualified" ||
            row.status === "Under Commercial Evaluation" ||
            row.status === "Commercially Qualified" ||
            techResult === "Qualified";

          if (isQualified && rank === "L1") {
            return (
              <Badge
                variant="outline"
                className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30 text-[11px] px-1.5 py-0 font-bold"
              >
                <Award className="size-3 mr-1" /> L1 - Lowest
              </Badge>
            );
          }
          if (isQualified && (rank === "L2" || rank === "L3")) {
            return (
              <Badge
                variant="outline"
                className="bg-blue-500/15 text-blue-600 border-blue-500/30 text-[11px] px-1.5 py-0 font-bold"
              >
                Rank: {rank}
              </Badge>
            );
          }
          if (isQualified) {
            return (
              <Badge
                variant="outline"
                className="bg-emerald-500/10 text-emerald-600 border-emerald-500/25 text-[11px] px-1.5 py-0"
              >
                Tech Qualified
              </Badge>
            );
          }
          if (
            techResult === "Rejected" ||
            row.status === "Technically Rejected" ||
            row.status === "Rejected"
          ) {
            return (
              <Badge
                variant="outline"
                className="bg-destructive/10 text-destructive border-destructive/25 text-[11px] px-1.5 py-0"
              >
                Tech Rejected
              </Badge>
            );
          }
          return (
            <Badge
              variant="outline"
              className="bg-amber-500/10 text-amber-600 border-amber-500/25 text-[11px] px-1.5 py-0"
            >
              Pending Evaluation
            </Badge>
          );
        },
      },
    ],
    [],
  );

  // Filters setup (Search, RFQ, Project, Supplier, Status, Date, Evaluation Status)
  const filters = useMemo<TableFilter<Quotation>[]>(() => {
    // Unique project names
    const distinctProjects = Array.from(new Set(quotations.map((q) => q.projectName))).filter(
      Boolean,
    );
    // Unique suppliers
    const distinctSuppliers = Array.from(new Set(quotations.map((q) => q.supplierName))).filter(
      Boolean,
    );
    // Unique RFQs
    const distinctRfqs = Array.from(new Set(quotations.map((q) => q.sourceRFQNumber))).filter(
      Boolean,
    );

    return [
      {
        key: "rfq",
        label: "RFQ",
        options: distinctRfqs,
        predicate: (row, val) => row.sourceRFQNumber === val,
      },
      {
        key: "project",
        label: "Project",
        options: distinctProjects,
        predicate: (row, val) => row.projectName === val,
      },
      {
        key: "supplier",
        label: "Supplier",
        options: distinctSuppliers,
        predicate: (row, val) => row.supplierName === val,
      },
      {
        key: "status",
        label: "Status",
        options: [
          "Received",
          "Technically Qualified",
          "Commercially Qualified",
          "Under Technical Evaluation",
          "Under Commercial Evaluation",
          "Rejected",
        ],
        predicate: (row, val) => row.status === val,
      },
      {
        key: "date",
        label: "Date",
        options: ["Last 7 Days", "Last 15 Days", "Last 30 Days", "Current Month"],
        predicate: (row, val) => {
          if (!val) return true;
          const qTime = new Date(row.date).getTime();
          if (isNaN(qTime)) return true;
          const refTime = new Date("2026-09-16").getTime();
          const diffDays = Math.abs(refTime - qTime) / (1000 * 60 * 60 * 24);
          if (val === "Last 7 Days") return diffDays <= 7;
          if (val === "Last 15 Days") return diffDays <= 15;
          if (val === "Last 30 Days") return diffDays <= 30;
          if (val === "Current Month") {
            const d = new Date(row.date);
            return d.getMonth() === 8 && d.getFullYear() === 2026;
          }
          return true;
        },
      },
      {
        key: "evaluation",
        label: "Evaluation Status",
        options: ["Pending", "Technically Qualified", "Commercially Qualified", "Rejected"],
        predicate: (row, val) => {
          if (val === "Pending") {
            return (
              row.status === "Received" ||
              row.status === "Under Technical Evaluation" ||
              !row.technicalEvaluation?.result ||
              row.technicalEvaluation?.result === "Pending"
            );
          }
          if (val === "Technically Qualified") {
            return (
              row.status === "Technically Qualified" ||
              row.technicalEvaluation?.result === "Qualified"
            );
          }
          if (val === "Commercially Qualified") {
            return (
              row.status === "Commercially Qualified" ||
              Boolean(
                row.commercialEvaluation?.rank && row.technicalEvaluation?.result === "Qualified",
              )
            );
          }
          if (val === "Rejected") {
            return (
              row.status === "Rejected" ||
              row.status === "Technically Rejected" ||
              row.technicalEvaluation?.result === "Rejected"
            );
          }
          return true;
        },
      },
    ];
  }, [quotations]);

  return (
    <>
      <PageHeader
        title="Supplier Quotations"
        description="Supplier bids received against floated RFQs."
        breadcrumbs={[
          { label: "Home", to: "/app/dashboard" },
          { label: "Procurement & Purchase", to: "/app/procurement" },
          { label: "Supplier Quotations" },
        ]}
        actions={
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => window.print()}>
            <Printer className="size-3.5" /> Print Summary
          </Button>
        }
      />

      {/* Connected Workflow Chain */}
      <div className="rounded-xl border bg-card px-4 py-3 shadow-card">
        <p className="mb-2 text-xs font-medium text-muted-foreground">Connected workflow</p>
        <WorkflowChain
          steps={[
            "Indent",
            "Approval",
            "Enquiry / RFQ",
            "Supplier Quotation",
            "Comparative Statement",
            "Purchase Order",
          ]}
          activeIndex={3}
        />
      </div>

      {/* Dynamic 6 Top KPI Metrics */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 xl:grid-cols-6">
        {dynamicKpis.map((k) => (
          <StatCard key={k.label} {...k} />
        ))}
      </div>

      {/* Quotations DataTable */}
      <DataTable
        title="Supplier Quotations"
        rows={quotations as never[]}
        columns={columns as never[]}
        getId={(row) => (row as Quotation).id}
        searchKeys={(row) =>
          `${(row as Quotation).quotationNo} ${(row as Quotation).supplierName} ${(row as Quotation).sourceRFQNumber} ${(row as Quotation).projectName}`
        }
        filters={filters as never[]}
        rowActions={(row) => [
          {
            label: "View Quotation Details",
            onSelect: () => setSelectedQuotation(row as Quotation),
          },
          {
            label: "View Source RFQ",
            onSelect: () => handleOpenRfq((row as Quotation).sourceRFQNumber),
          },
          {
            label: "Print Quotation",
            onSelect: () => window.print(),
          },
        ]}
        onRowClick={(row) => setSelectedQuotation(row as Quotation)}
      />

      {/* Quotation Detail Drawer */}
      <QuotationDetailDrawer
        quotation={selectedQuotation}
        open={Boolean(selectedQuotation)}
        onClose={() => setSelectedQuotation(null)}
        onUpdateQuotation={handleUpdateQuotation}
        onOpenRfq={handleOpenRfq}
      />

      {/* Cross-navigation RFQ Detail Drawer */}
      <RfqDetailDrawer
        rfq={selectedRfq}
        open={Boolean(selectedRfq)}
        onClose={() => setSelectedRfq(null)}
        onUpdateRfq={(updated) => setSelectedRfq(updated)}
      />
    </>
  );
}
