import { useState, useMemo, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { DataTable, type Column, type TableFilter } from "@/components/common/DataTable";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import {
  Plus,
  MoreVertical,
  Eye,
  Send,
  Printer,
  PackageCheck,
  CheckCircle2,
  FileCheck2,
  Edit,
  Trash2,
  XCircle,
  Share2,
  Download,
} from "lucide-react";
import { formatINR, formatDate } from "@/utils/format";
import { poService } from "@/services/poService";
import { PoDetailDrawer } from "@/components/procurement/PoDetailDrawer";
import { CreatePoDrawer } from "@/components/procurement/CreatePoDrawer";
import type { PurchaseOrder } from "@/types";

interface PurchaseOrdersPageProps {
  initialPoId?: string | undefined;
}

export function PurchaseOrdersPage({ initialPoId }: PurchaseOrdersPageProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(() =>
    poService.getPurchaseOrders(),
  );

  const [selectedPo, setSelectedPo] = useState<PurchaseOrder | null>(() => {
    const targetId = initialPoId || searchParams.get("po");
    if (targetId) {
      return poService.getPurchaseOrderById(targetId) || null;
    }
    return null;
  });

  const [createPoOpen, setCreatePoOpen] = useState(false);
  const [editingPo, setEditingPo] = useState<PurchaseOrder | null>(null);

  // Sync with searchParams if "po" changes in URL
  useEffect(() => {
    const poParam = searchParams.get("po");
    if (poParam) {
      const match = poService.getPurchaseOrderById(poParam);
      if (match) {
        setSelectedPo(match);
      }
    }
  }, [searchParams]);

  // Dynamic KPI Metrics (Section 1)
  const kpis = useMemo(() => {
    const totalCount = purchaseOrders.length;
    const draftCount = purchaseOrders.filter((p) => p.status === "Draft").length;
    const pendingCount = purchaseOrders.filter(
      (p) => p.status === "Pending Approval" || p.status === "Pending",
    ).length;
    const approvedCount = purchaseOrders.filter((p) => p.status === "Approved").length;
    const issuedCount = purchaseOrders.filter((p) => p.status === "Issued").length;
    const totalValue = purchaseOrders.reduce((sum, p) => sum + (p.grandTotal || p.total || 0), 0);

    return [
      {
        label: "Total POs",
        value: String(totalCount),
      },
      {
        label: "Draft",
        value: String(draftCount),
        tone: "default" as const,
      },
      {
        label: "Pending Approval",
        value: String(pendingCount),
        tone: "warning" as const,
      },
      {
        label: "Approved",
        value: String(approvedCount),
        tone: "success" as const,
      },
      {
        label: "Issued",
        value: String(issuedCount),
        tone: "info" as const,
      },
      {
        label: "Total PO Value",
        value: formatINR(totalValue, { compact: true }),
        tone: "success" as const,
      },
    ];
  }, [purchaseOrders]);

  function handleUpdatePo(updated: PurchaseOrder) {
    setPurchaseOrders((prev) =>
      prev.map((item) => (item.id === updated.id || item.poNo === updated.poNo ? updated : item)),
    );
    setSelectedPo(updated);
  }

  function handleDeletePo(id: string) {
    poService.deletePurchaseOrder(id);
    setPurchaseOrders((prev) => prev.filter((item) => item.id !== id));
    setSelectedPo(null);
    toast.success("Purchase order removed");
  }

  // 13 Table Columns (Section 1)
  const columns = useMemo<Column<PurchaseOrder>[]>(
    () => [
      {
        key: "poNo",
        header: "PO Number",
        render: (row) => (
          <div className="flex flex-col">
            <span className="font-mono font-bold text-xs text-primary hover:underline cursor-pointer">
              {row.poNo}
            </span>
            <span className="text-[10px] text-muted-foreground font-mono">
              {row.poType || "Material"}
            </span>
          </div>
        ),
      },
      {
        key: "date",
        header: "PO Date",
        render: (row) => (
          <span className="text-xs text-muted-foreground font-mono">{formatDate(row.date)}</span>
        ),
      },
      {
        key: "supplier",
        header: "Supplier",
        render: (row) => (
          <div className="flex flex-col min-w-[140px]">
            <span className="font-semibold text-xs text-foreground truncate">
              {row.supplierName || row.supplier}
            </span>
            {row.supplierCode && (
              <span className="text-[10px] text-muted-foreground font-mono">
                {row.supplierCode}
              </span>
            )}
          </div>
        ),
      },
      {
        key: "project",
        header: "Project",
        render: (row) => (
          <span className="text-xs text-foreground font-medium max-w-[150px] truncate block">
            {row.projectName || row.project}
          </span>
        ),
      },
      {
        key: "site",
        header: "Site",
        render: (row) => (
          <span className="text-xs text-muted-foreground max-w-[110px] truncate block">
            {row.siteName || row.site}
          </span>
        ),
      },
      {
        key: "sourceComparative",
        header: "Source Comparative",
        render: (row) => (
          <Badge
            variant="outline"
            className="font-mono text-[10px] bg-muted/40 hover:bg-muted text-foreground cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              navigate("/app/procurement/comparative-statement");
            }}
          >
            <FileCheck2 className="size-3 mr-1 text-primary" />
            {row.sourceComparativeNo || "CS/26-27/001"}
          </Badge>
        ),
      },
      {
        key: "items",
        header: "Items",
        render: (row) => (
          <span className="text-xs font-mono font-medium text-center block">
            {row.itemCount || (row.items ? row.items.length : 3)}
          </span>
        ),
      },
      {
        key: "basicValue",
        header: "Basic Value",
        render: (row) => (
          <span className="text-xs font-mono text-right block">
            {formatINR(row.basicValue || row.amount)}
          </span>
        ),
      },
      {
        key: "gst",
        header: "GST",
        render: (row) => (
          <span className="text-xs font-mono text-muted-foreground text-right block">
            {formatINR(row.totalGst || row.gst)}
          </span>
        ),
      },
      {
        key: "totalValue",
        header: "Total Value",
        render: (row) => (
          <span className="text-xs font-mono font-bold text-foreground text-right block">
            {formatINR(row.grandTotal || row.total)}
          </span>
        ),
      },
      {
        key: "deliveryDate",
        header: "Delivery Date",
        render: (row) => (
          <span className="text-xs text-muted-foreground font-mono">
            {formatDate(row.deliveryDate)}
          </span>
        ),
      },
      {
        key: "status",
        header: "Status",
        render: (row) => <StatusBadge value={row.status} />,
      },
      {
        key: "actions",
        header: "Actions",
        render: (row) => (
          <div className="flex items-center justify-end gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
              title="View PO Details"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedPo(row);
              }}
            >
              <Eye className="size-3.5" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="size-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="text-xs min-w-[160px]">
                <DropdownMenuItem onClick={() => setSelectedPo(row)}>
                  <Eye className="size-3.5 mr-2" /> View Details
                </DropdownMenuItem>

                {/* Draft Actions: Edit, Submit for Approval, Delete */}
                {row.status === "Draft" && (
                  <>
                    <DropdownMenuItem
                      onClick={() => {
                        setEditingPo(row);
                        setCreatePoOpen(true);
                      }}
                    >
                      <Edit className="size-3.5 mr-2 text-primary" /> Edit Order
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        const updated = poService.updatePurchaseOrderStatus(
                          row.id,
                          "Pending Approval",
                        );
                        if (updated) {
                          handleUpdatePo(updated);
                          toast.success(`PO ${row.poNo} submitted for approval`);
                        }
                      }}
                    >
                      <Send className="size-3.5 mr-2 text-primary" /> Submit for Approval
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => handleDeletePo(row.id)}
                    >
                      <Trash2 className="size-3.5 mr-2" /> Delete Draft
                    </DropdownMenuItem>
                  </>
                )}

                {/* Pending Approval Actions: Approve, Reject, Send Back */}
                {row.status === "Pending Approval" && (
                  <>
                    <DropdownMenuItem
                      onClick={() => {
                        const updated = poService.updatePurchaseOrderStatus(row.id, "Approved");
                        if (updated) {
                          handleUpdatePo(updated);
                          toast.success(`PO ${row.poNo} approved successfully!`);
                        }
                      }}
                    >
                      <CheckCircle2 className="size-3.5 mr-2 text-emerald-600" /> Approve PO
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        const updated = poService.updatePurchaseOrderStatus(row.id, "Draft");
                        if (updated) {
                          handleUpdatePo(updated);
                          toast.info(`PO ${row.poNo} sent back to Draft`);
                        }
                      }}
                    >
                      Send Back to Draft
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => {
                        const updated = poService.updatePurchaseOrderStatus(row.id, "Cancelled");
                        if (updated) {
                          handleUpdatePo(updated);
                          toast.error(`PO ${row.poNo} rejected`);
                        }
                      }}
                    >
                      <XCircle className="size-3.5 mr-2" /> Reject
                    </DropdownMenuItem>
                  </>
                )}

                {/* Approved Actions: Issue PO, Print, Share */}
                {row.status === "Approved" && (
                  <>
                    <DropdownMenuItem
                      onClick={() => {
                        const updated = poService.updatePurchaseOrderStatus(row.id, "Issued");
                        if (updated) {
                          handleUpdatePo(updated);
                          toast.success(`PO ${row.poNo} issued to ${row.supplierName || row.supplier}!`);
                        }
                      }}
                    >
                      <Send className="size-3.5 mr-2 text-primary" /> Issue PO to Supplier
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => toast.success(`PO ${row.poNo} link copied and shared!`)}
                    >
                      <Share2 className="size-3.5 mr-2" /> Share PO
                    </DropdownMenuItem>
                  </>
                )}

                {/* Issued Actions: Print, Download, Create GRN */}
                {row.status === "Issued" && (
                  <>
                    <DropdownMenuItem onClick={() => setSelectedPo(row)}>
                      <PackageCheck className="size-3.5 mr-2 text-emerald-600" /> + Create GRN
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => toast.success(`Downloading ${row.poNo}.pdf...`)}
                    >
                      <Download className="size-3.5 mr-2" /> Download PDF
                    </DropdownMenuItem>
                  </>
                )}

                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => window.print()}>
                  <Printer className="size-3.5 mr-2" /> Print Order
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
      },
    ],
    [navigate],
  );

  // Filters Setup (Search, Project, Supplier, Status, Date, PO Type - Section 1)
  const filters = useMemo<TableFilter<PurchaseOrder>[]>(() => {
    const distinctProjects = Array.from(
      new Set(purchaseOrders.map((p) => p.projectName || p.project)),
    ).filter(Boolean);

    const distinctSuppliers = Array.from(
      new Set(purchaseOrders.map((p) => p.supplierName || p.supplier)),
    ).filter(Boolean);

    return [
      {
        key: "project",
        label: "Project",
        options: distinctProjects,
        predicate: (row, val) => row.projectName === val || row.project === val,
      },
      {
        key: "supplier",
        label: "Supplier",
        options: distinctSuppliers,
        predicate: (row, val) => row.supplierName === val || row.supplier === val,
      },
      {
        key: "status",
        label: "Status",
        options: [
          "Draft",
          "Pending Approval",
          "Approved",
          "Issued",
          "Partially Received",
          "Fully Received",
          "Closed",
          "Cancelled",
        ],
        predicate: (row, val) => row.status === val,
      },
      {
        key: "date",
        label: "Date",
        options: ["Last 7 Days", "Last 15 Days", "Last 30 Days", "Current Month"],
        predicate: (row, val) => {
          if (!val) return true;
          const poTime = new Date(row.date).getTime();
          if (isNaN(poTime)) return true;
          const refTime = new Date("2026-09-18").getTime();
          const diffDays = Math.abs(refTime - poTime) / (1000 * 60 * 60 * 24);
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
        key: "poType",
        label: "PO Type",
        options: ["Material", "Service", "Subcontract", "Asset"],
        predicate: (row, val) => (row.poType || "Material") === val,
      },
    ];
  }, [purchaseOrders]);

  return (
    <div className="space-y-5">
      {/* PAGE HEADER */}
      <PageHeader
        title="Purchase Orders"
        description="Manage approved supplier purchase orders, delivery commitments and commercial terms."
        breadcrumbs={[
          { label: "Procurement & Purchase", to: "procurement" },
          { label: "Purchase Orders" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 text-xs text-primary"
              onClick={() => navigate("/app/procurement/comparative-statement")}
            >
              <FileCheck2 className="size-3.5" /> View Approved Comparatives
            </Button>
            <Button
              size="sm"
              className="h-8 gap-1.5 text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
              onClick={() => {
                setEditingPo(null);
                setCreatePoOpen(true);
              }}
            >
              <Plus className="size-3.5" /> Create Purchase Order
            </Button>
          </div>
        }
      />

      {/* CONNECTED WORKFLOW PROGRESS BAR */}
      <div className="rounded-xl border bg-card/60 p-2.5 shadow-xs overflow-x-auto">
        <div className="flex items-center gap-2 text-xs min-w-[760px]">
          <span className="text-muted-foreground text-[11px] font-semibold uppercase tracking-wider px-2">
            Procurement Flow:
          </span>
          {[
            "Indent",
            "Approval",
            "Enquiry / RFQ",
            "Supplier Quotation",
            "Comparative Statement",
            "Purchase Order",
            "GRN",
          ].map((step, idx) => {
            const isCurrent = step === "Purchase Order";
            const isCompleted = [
              "Indent",
              "Approval",
              "Enquiry / RFQ",
              "Supplier Quotation",
              "Comparative Statement",
            ].includes(step);

            return (
              <div key={idx} className="flex items-center gap-2">
                <span
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                    isCurrent
                      ? "bg-primary text-primary-foreground font-bold shadow-xs"
                      : isCompleted
                        ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/25"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {step}
                </span>
                {idx < 6 && <span className="text-muted-foreground/60 text-xs">→</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* 6 KPI CARDS (Section 1) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpis.map((kpi, idx) => (
          <StatCard key={idx} {...kpi} />
        ))}
      </div>

      {/* DATA TABLE (Section 1) */}
      <DataTable
        title="Purchase Orders"
        rows={purchaseOrders as never[]}
        columns={columns as never[]}
        getId={(row) => (row as PurchaseOrder).id}
        searchKeys={(row) =>
          `${(row as PurchaseOrder).poNo} ${(row as PurchaseOrder).supplierName || (row as PurchaseOrder).supplier} ${(row as PurchaseOrder).projectName || (row as PurchaseOrder).project} ${(row as PurchaseOrder).sourceComparativeNo || ""}`
        }
        filters={filters as never[]}
        onRowClick={(row) => setSelectedPo(row as PurchaseOrder)}
      />

      {/* PO DETAIL DRAWER (Section 10) */}
      <PoDetailDrawer
        open={Boolean(selectedPo)}
        onClose={() => {
          setSelectedPo(null);
          // Clean search params if opened via URL
          if (searchParams.get("po")) {
            setSearchParams({});
          }
        }}
        po={selectedPo}
        onUpdatePo={handleUpdatePo}
        onDeletePo={handleDeletePo}
        onEditPo={(po) => {
          setEditingPo(po);
          setCreatePoOpen(true);
        }}
        onOpenIndent={() => navigate("/app/procurement/indents")}
        onOpenRfq={() => navigate("/app/procurement/enquiries")}
        onOpenComparative={() => navigate("/app/procurement/comparative-statement")}
      />

      {/* CREATE / EDIT PO DRAWER (Section 2 & 8) */}
      <CreatePoDrawer
        open={createPoOpen}
        onClose={() => {
          setCreatePoOpen(false);
          setEditingPo(null);
        }}
        initialPo={editingPo}
        onPoCreated={(newPo) => {
          setPurchaseOrders((prev) => [newPo, ...prev]);
          setSelectedPo(newPo);
        }}
        onPoUpdated={(updatedPo) => {
          handleUpdatePo(updatedPo);
        }}
      />
    </div>
  );
}
