import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/common/StatusBadge";
import { toast } from "sonner";
import {
  Building2,
  MapPin,
  Calendar,
  Layers,
  Printer,
  Copy,
  FileCheck2,
  PackageCheck,
  Send,
  CheckCircle2,
  XCircle,
  FileText,
  Clock,
  ShieldCheck,
  Truck,
  ExternalLink,
  Edit,
  Share2,
  Download,
} from "lucide-react";
import { formatINR, formatDate } from "@/utils/format";
import { poService } from "@/services/poService";
import { GrnInitiationModal } from "./GrnInitiationModal";
import type { PurchaseOrder, PoStatus } from "@/types";

interface PoDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  po: PurchaseOrder | null;
  onUpdatePo?: (updated: PurchaseOrder) => void;
  onDeletePo?: (id: string) => void;
  onEditPo?: (po: PurchaseOrder) => void;
  onOpenIndent?: (indentNo: string) => void;
  onOpenRfq?: (rfqNo: string) => void;
  onOpenComparative?: (csNo: string) => void;
}

export function PoDetailDrawer({
  open,
  onClose,
  po: initialPo,
  onUpdatePo,
  onDeletePo,
  onEditPo,
  onOpenIndent,
  onOpenRfq,
  onOpenComparative,
}: PoDetailDrawerProps) {
  const [currentPo, setCurrentPo] = useState<PurchaseOrder | null>(initialPo);
  const [grnModalOpen, setGrnModalOpen] = useState(false);

  useEffect(() => {
    setCurrentPo(initialPo);
  }, [initialPo]);

  if (!currentPo) return null;

  const po = currentPo;
  const items = po.items || [];
  const status = po.status;
  const isInterState = Boolean(po.igst && po.igst > 0);

  function copyPoNo() {
    navigator.clipboard.writeText(po.poNo);
    toast.success(`Copied ${po.poNo} to clipboard`);
  }

  function handleStatusTransition(newStatus: PoStatus) {
    const updated = poService.updatePurchaseOrderStatus(po.id, newStatus);
    if (updated) {
      setCurrentPo(updated);
      onUpdatePo?.(updated);
      toast.success(
        newStatus === "Issued"
          ? `PO ${po.poNo} successfully issued to ${po.supplierName || po.supplier}! Ready for GRN receipt.`
          : `PO ${po.poNo} status updated to ${newStatus}`,
      );
    }
  }

  function handleDelete() {
    if (confirm(`Are you sure you want to delete draft PO ${po.poNo}?`)) {
      poService.deletePurchaseOrder(po.id);
      toast.success(`Deleted draft PO ${po.poNo}`);
      onDeletePo?.(po.id);
      onClose();
    }
  }

  return (
    <>
      <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-5xl p-0 flex flex-col gap-0 border-l bg-background shadow-2xl overflow-hidden"
        >
          {/* HEADER STRIP */}
          <SheetHeader className="px-6 py-4 border-b bg-card text-card-foreground shrink-0">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <SheetTitle className="text-xl font-bold font-mono tracking-tight text-foreground flex items-center gap-2">
                    {po.poNo}
                    <button
                      onClick={copyPoNo}
                      className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors"
                      title="Copy PO Number"
                    >
                      <Copy className="size-3.5" />
                    </button>
                  </SheetTitle>

                  <StatusBadge value={po.status} />

                  <Badge variant="secondary" className="text-[11px] font-mono">
                    {po.poType || "Material"} PO
                  </Badge>

                  {isInterState ? (
                    <Badge
                      variant="outline"
                      className="text-[10px] text-blue-600 border-blue-500/30 bg-blue-500/5"
                    >
                      Inter-State (IGST)
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="text-[10px] text-emerald-600 border-emerald-500/30 bg-emerald-500/5"
                    >
                      Intra-State (CGST + SGST)
                    </Badge>
                  )}
                </div>

                <SheetDescription className="text-xs text-muted-foreground flex items-center gap-2 flex-wrap">
                  <span>Contracted Supplier:</span>
                  <span className="font-semibold text-foreground">
                    {po.supplierName || po.supplier}
                  </span>
                  {po.supplierCode && (
                    <Badge variant="outline" className="text-[10px] py-0 font-mono">
                      {po.supplierCode}
                    </Badge>
                  )}
                </SheetDescription>
              </div>

              {/* Top Quick Actions */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1.5 text-xs"
                  onClick={() => window.print()}
                >
                  <Printer className="size-3.5" /> Print
                </Button>

                {status === "Draft" && (
                  <Button
                    size="sm"
                    className="h-8 gap-1.5 text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                    onClick={() => {
                      onEditPo?.(po);
                      onClose();
                    }}
                  >
                    <Edit className="size-3.5" /> Edit Draft
                  </Button>
                )}

                {status === "Issued" && (
                  <Button
                    size="sm"
                    className="h-8 gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs"
                    onClick={() => setGrnModalOpen(true)}
                  >
                    <PackageCheck className="size-3.5" /> + Create GRN
                  </Button>
                )}
              </div>
            </div>

            {/* FULL PROCUREMENT TRACEABILITY CHAIN (Section 11) */}
            <div className="mt-3.5 p-2.5 rounded-lg border bg-muted/40 text-[11px] space-y-1.5">
              <div className="flex items-center justify-between text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                <span>Procurement Traceability Chain</span>
                <span className="text-emerald-600 font-bold">100% Relational Linkage</span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5 text-foreground font-mono">
                <span className="px-2 py-0.5 rounded bg-card border text-[11px] font-sans font-medium flex items-center gap-1">
                  <Building2 className="size-3 text-primary" /> {po.projectName || po.project}
                </span>
                <span className="text-muted-foreground">→</span>
                <button
                  onClick={() =>
                    onOpenIndent
                      ? onOpenIndent(po.sourceIndentNumber || "IND/26-27/1041")
                      : (window.location.href = `/app/procurement/indents`)
                  }
                  className="px-2 py-0.5 rounded bg-primary/10 text-primary hover:underline border border-primary/20 flex items-center gap-1"
                >
                  Indent: {po.sourceIndentNumber || "IND/26-27/1041"}
                </button>
                <span className="text-muted-foreground">→</span>
                <button
                  onClick={() =>
                    onOpenRfq
                      ? onOpenRfq(po.sourceRFQNumber || "RFQ/26-27/330")
                      : (window.location.href = `/app/procurement/enquiries`)
                  }
                  className="px-2 py-0.5 rounded bg-primary/10 text-primary hover:underline border border-primary/20 flex items-center gap-1"
                >
                  RFQ: {po.sourceRFQNumber || "RFQ/26-27/330"}
                </button>
                <span className="text-muted-foreground">→</span>
                <button
                  onClick={() =>
                    onOpenComparative
                      ? onOpenComparative(po.sourceComparativeNo || "CS/26-27/001")
                      : (window.location.href = `/app/procurement/comparative-statement`)
                  }
                  className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-600 font-bold hover:underline border border-emerald-500/30 flex items-center gap-1"
                >
                  CS: {po.sourceComparativeNo || "CS/26-27/001"}
                </button>
                <span className="text-muted-foreground">→</span>
                <span className="px-2 py-0.5 rounded bg-card border text-foreground font-sans font-medium">
                  {po.supplierName || po.supplier}
                </span>
                <span className="text-muted-foreground">→</span>
                <span className="px-2 py-0.5 rounded bg-primary text-primary-foreground font-bold">
                  {po.poNo}
                </span>
              </div>
            </div>

            {/* Context breadcrumb details */}
            <div className="mt-2.5 grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t text-[11px] text-muted-foreground">
              <div className="flex items-center gap-1.5 truncate">
                <Building2 className="size-3.5 text-primary shrink-0" />
                <span className="truncate">{po.projectName || po.project}</span>
              </div>
              <div className="flex items-center gap-1.5 truncate">
                <MapPin className="size-3.5 text-primary shrink-0" />
                <span className="truncate">{po.siteName || po.site}</span>
              </div>
              <div className="flex items-center gap-1.5 truncate">
                <Calendar className="size-3.5 text-primary shrink-0" />
                <span>PO Date: {formatDate(po.date)}</span>
              </div>
              <div className="flex items-center gap-1.5 truncate">
                <Truck className="size-3.5 text-primary shrink-0" />
                <span>Delivery: {formatDate(po.deliveryDate)}</span>
              </div>
            </div>
          </SheetHeader>

          {/* SCROLLABLE BODY */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* 1. FINANCIAL SUMMARY METRIC STRIP (Section 10) */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Commercial Summary & Indian GST
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-6 gap-2.5">
                <div className="rounded-lg border bg-card p-2.5 shadow-xs">
                  <span className="text-[10px] text-muted-foreground uppercase block">
                    Basic Value
                  </span>
                  <p className="text-base font-bold text-foreground mt-0.5 font-mono">
                    {formatINR(po.basicValue || po.amount)}
                  </p>
                  <span className="text-[10px] text-muted-foreground">Pre-tax basic</span>
                </div>

                <div className="rounded-lg border bg-card p-2.5 shadow-xs">
                  <span className="text-[10px] text-muted-foreground uppercase block">
                    Discount
                  </span>
                  <p className="text-base font-bold text-foreground mt-0.5 font-mono">
                    {formatINR(po.discount || 0)}
                  </p>
                  <span className="text-[10px] text-muted-foreground">Contracted concession</span>
                </div>

                <div className="rounded-lg border bg-card p-2.5 shadow-xs">
                  <span className="text-[10px] text-muted-foreground uppercase block">
                    Taxable Value
                  </span>
                  <p className="text-base font-bold text-foreground mt-0.5 font-mono">
                    {formatINR(
                      po.taxableValue || (po.basicValue || po.amount) - (po.discount || 0),
                    )}
                  </p>
                  <span className="text-[10px] text-muted-foreground">Assessable base</span>
                </div>

                <div className="rounded-lg border bg-card p-2.5 shadow-xs">
                  <span className="text-[10px] text-muted-foreground uppercase block">
                    Total GST
                  </span>
                  <p className="text-base font-bold text-foreground mt-0.5 font-mono">
                    {formatINR(po.totalGst || po.gst)}
                  </p>
                  <span className="text-[10px] text-muted-foreground font-mono truncate block">
                    {isInterState
                      ? `IGST: ${formatINR(po.igst || po.totalGst || po.gst)}`
                      : `CGST: ${formatINR(po.cgst || Math.round((po.totalGst || po.gst) / 2))}`}
                  </span>
                </div>

                <div className="rounded-lg border bg-card p-2.5 shadow-xs">
                  <span className="text-[10px] text-muted-foreground uppercase block">
                    Other Charges
                  </span>
                  <p className="text-base font-bold text-foreground mt-0.5 font-mono">
                    {formatINR(po.otherCharges || 0)}
                  </p>
                  <span className="text-[10px] text-muted-foreground">Freight & loading</span>
                </div>

                <div className="rounded-lg border bg-primary/10 border-primary/25 p-2.5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-primary uppercase">
                      Grand Total
                    </span>
                    <Badge
                      variant="outline"
                      className="text-[9px] px-1 py-0 font-bold bg-background"
                    >
                      Landed
                    </Badge>
                  </div>
                  <p className="text-base font-extrabold text-foreground mt-0.5 font-mono">
                    {formatINR(po.grandTotal || po.total)}
                  </p>
                  <span className="text-[10px] text-muted-foreground">
                    Round off:{" "}
                    {po.roundOff
                      ? po.roundOff > 0
                        ? `+₹${po.roundOff}`
                        : `-₹${Math.abs(po.roundOff)}`
                      : "₹0"}
                  </span>
                </div>
              </div>
            </div>

            {/* 2. SUPPLIER MASTER INFORMATION CARD (Section 4) */}
            <div className="rounded-xl border bg-card p-4 shadow-xs space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <ShieldCheck className="size-3.5 text-primary" /> Supplier Master Information
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-muted-foreground text-[11px] block">Supplier Name</span>
                  <span className="font-bold text-foreground block">
                    {po.supplierName || po.supplier}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {po.supplierCode || "VEN-001"}
                  </span>
                </div>

                <div>
                  <span className="text-muted-foreground text-[11px] block">Contact Person</span>
                  <span className="font-semibold text-foreground block">
                    {po.contactPerson || "Rajesh Nair"}
                  </span>
                  <span className="text-[10px] text-muted-foreground block">
                    {po.phone || "+91 98231 44550"}
                  </span>
                </div>

                <div>
                  <span className="text-muted-foreground text-[11px] block">GSTIN</span>
                  <span className="font-mono font-bold text-foreground block">
                    {po.gstin || "27AACCA1234M1Z2"}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {isInterState ? "Inter-State Supplier" : "State: 27 (Maharashtra)"}
                  </span>
                </div>

                <div>
                  <span className="text-muted-foreground text-[11px] block">PAN</span>
                  <span className="font-mono font-bold text-foreground block">
                    {po.pan || "AACCA1234M"}
                  </span>
                  <span className="text-[10px] text-muted-foreground">Entity Verified</span>
                </div>
              </div>

              <div className="pt-2 border-t text-xs text-muted-foreground flex items-center gap-2">
                <span className="font-semibold text-foreground">Billing Address:</span>
                <span>
                  {po.billingAddress ||
                    "Plot No. 42, Bhosari Industrial Area, Pune, Maharashtra 411026"}
                </span>
              </div>
            </div>

            {/* 3. TABS: ITEMS, COMMERCIAL TERMS, DELIVERY SCHEDULE, APPROVAL WORKFLOW, DOCUMENTS */}
            <Tabs defaultValue="items" className="w-full">
              <TabsList className="grid w-full grid-cols-5 h-9">
                <TabsTrigger value="items" className="text-xs gap-1">
                  <Layers className="size-3.5" /> PO Items ({items.length})
                </TabsTrigger>
                <TabsTrigger value="terms" className="text-xs gap-1">
                  <FileText className="size-3.5" /> Terms (9)
                </TabsTrigger>
                <TabsTrigger value="delivery" className="text-xs gap-1">
                  <Truck className="size-3.5" /> Delivery Schedule
                </TabsTrigger>
                <TabsTrigger value="timeline" className="text-xs gap-1">
                  <Clock className="size-3.5" /> Approval Timeline
                </TabsTrigger>
                <TabsTrigger value="docs" className="text-xs gap-1">
                  <FileCheck2 className="size-3.5" /> Documents
                </TabsTrigger>
              </TabsList>

              {/* TAB 1: 14-COLUMN PO ITEMS TABLE (Section 5) */}
              <TabsContent value="items" className="space-y-4 pt-3">
                <div className="rounded-xl border overflow-x-auto shadow-xs">
                  <table className="w-full text-left text-xs border-collapse min-w-[960px]">
                    <thead>
                      <tr className="border-b bg-muted/40 font-semibold text-[11px] text-muted-foreground">
                        <th className="p-2.5 w-10 text-center">#</th>
                        <th className="p-2.5 w-24">Item Code</th>
                        <th className="p-2.5 min-w-[180px]">Description & Category</th>
                        <th className="p-2.5 text-center w-14">Unit</th>
                        <th className="p-2.5 text-center w-20">Approved Qty</th>
                        <th className="p-2.5 text-center w-20">PO Qty</th>
                        <th className="p-2.5 text-right w-24">Rate (₹)</th>
                        <th className="p-2.5 text-right w-20">Discount</th>
                        <th className="p-2.5 text-right w-24">Taxable</th>
                        <th className="p-2.5 text-center w-16">GST %</th>
                        <th className="p-2.5 text-right w-24">GST Amt</th>
                        <th className="p-2.5 text-right w-28">Total Amount</th>
                        <th className="p-2.5 w-28">Delivery Date</th>
                        <th className="p-2.5 min-w-[120px]">Remarks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y text-xs">
                      {items.map((it, idx) => (
                        <tr key={idx} className="hover:bg-muted/20 transition-colors">
                          <td className="p-2.5 text-center text-muted-foreground">{idx + 1}</td>
                          <td className="p-2.5 font-mono text-[10px] text-primary font-bold">
                            {it.itemCode}
                          </td>
                          <td className="p-2.5">
                            <span className="font-semibold text-foreground block line-clamp-1">
                              {it.itemDescription}
                            </span>
                            <span className="text-[10px] text-muted-foreground block">
                              {it.category}
                            </span>
                          </td>
                          <td className="p-2.5 text-center text-muted-foreground font-medium">
                            {it.unit}
                          </td>
                          <td className="p-2.5 text-center text-muted-foreground">
                            {it.approvedQty}
                          </td>
                          <td className="p-2.5 text-center font-bold font-mono text-foreground">
                            {it.poQty}
                          </td>
                          <td className="p-2.5 text-right font-mono">{formatINR(it.rate)}</td>
                          <td className="p-2.5 text-right font-mono text-muted-foreground">
                            {it.discountAmount ? formatINR(it.discountAmount) : "₹0"}
                          </td>
                          <td className="p-2.5 text-right font-mono font-medium">
                            {formatINR(it.taxableAmount)}
                          </td>
                          <td className="p-2.5 text-center font-mono">
                            <Badge variant="outline" className="text-[10px] px-1 py-0">
                              {it.gstPct}%
                            </Badge>
                          </td>
                          <td className="p-2.5 text-right font-mono text-muted-foreground">
                            {formatINR(it.gstAmount)}
                          </td>
                          <td className="p-2.5 text-right font-mono font-bold text-foreground">
                            {formatINR(it.lineTotal)}
                          </td>
                          <td className="p-2.5 text-muted-foreground">
                            {formatDate(it.deliveryDate)}
                          </td>
                          <td className="p-2.5 text-muted-foreground text-[11px] truncate">
                            {it.remarks || "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>

              {/* TAB 2: COMMERCIAL TERMS (Section 6 - 9 Clauses) */}
              <TabsContent value="terms" className="space-y-3 pt-3 text-xs">
                <div className="rounded-xl border bg-card p-4 shadow-xs space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1 p-2.5 rounded-lg border bg-muted/20">
                      <span className="text-[11px] text-muted-foreground block font-semibold">
                        1. Payment Terms
                      </span>
                      <p className="text-foreground font-medium">
                        {po.commercialTerms?.paymentTerms ||
                          po.paymentTerms ||
                          "30 Days from receipt"}
                      </p>
                    </div>

                    <div className="space-y-1 p-2.5 rounded-lg border bg-muted/20">
                      <span className="text-[11px] text-muted-foreground block font-semibold">
                        2. Delivery Terms
                      </span>
                      <p className="text-foreground font-medium">
                        {po.commercialTerms?.deliveryTerms || po.deliveryTerms || "FOR Site"}
                      </p>
                    </div>

                    <div className="space-y-1 p-2.5 rounded-lg border bg-muted/20">
                      <span className="text-[11px] text-muted-foreground block font-semibold">
                        3. Freight & Transportation
                      </span>
                      <p className="text-foreground font-medium">
                        {po.commercialTerms?.freight || "Included in unit rates"}
                      </p>
                    </div>

                    <div className="space-y-1 p-2.5 rounded-lg border bg-muted/20">
                      <span className="text-[11px] text-muted-foreground block font-semibold">
                        4. Transit Insurance
                      </span>
                      <p className="text-foreground font-medium">
                        {po.commercialTerms?.insurance || "Covered under supplier transit policy"}
                      </p>
                    </div>

                    <div className="space-y-1 p-2.5 rounded-lg border bg-muted/20">
                      <span className="text-[11px] text-muted-foreground block font-semibold">
                        5. Loading / Unloading
                      </span>
                      <p className="text-foreground font-medium">
                        {po.commercialTerms?.loadingUnloading ||
                          "Unloading at site by buyer; loading at plant by seller"}
                      </p>
                    </div>

                    <div className="space-y-1 p-2.5 rounded-lg border bg-muted/20">
                      <span className="text-[11px] text-muted-foreground block font-semibold">
                        6. Taxes & Duties
                      </span>
                      <p className="text-foreground font-medium">
                        {po.commercialTerms?.taxes ||
                          "GST 18% extra as applicable with RERA ITC eligibility"}
                      </p>
                    </div>

                    <div className="space-y-1 p-2.5 rounded-lg border bg-muted/20">
                      <span className="text-[11px] text-muted-foreground block font-semibold">
                        7. Warranty Terms
                      </span>
                      <p className="text-foreground font-medium">
                        {po.commercialTerms?.warranty ||
                          po.warrantyTerms ||
                          "12 Months standard manufacturer defect warranty"}
                      </p>
                    </div>

                    <div className="space-y-1 p-2.5 rounded-lg border bg-muted/20">
                      <span className="text-[11px] text-muted-foreground block font-semibold">
                        8. Penalty / Liquidated Damages (LD)
                      </span>
                      <p className="text-foreground font-medium">
                        {po.commercialTerms?.penaltyLd ||
                          "0.5% per week of delayed dispatch capped at 5%"}
                      </p>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg border bg-muted/20 mt-2">
                    <span className="text-[11px] text-muted-foreground block font-semibold">
                      9. Other Special Terms & Conditions
                    </span>
                    <p className="text-foreground mt-0.5">
                      {po.commercialTerms?.otherTerms ||
                        "Manufacturer test certificates (MTC) conforming to IS standard must accompany each consignment."}
                    </p>
                  </div>
                </div>
              </TabsContent>

              {/* TAB 3: DELIVERY SCHEDULE (Section 7) */}
              <TabsContent value="delivery" className="space-y-3 pt-3 text-xs">
                <div className="rounded-xl border bg-card p-4 shadow-xs space-y-3">
                  <div className="flex items-center justify-between pb-1 border-b">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Truck className="size-3.5 text-primary" /> Item-Wise Delivery Commitments &
                      Site Locations
                    </h4>
                    <span className="text-[11px] text-muted-foreground">
                      Destination: {po.siteName || po.site}
                    </span>
                  </div>

                  <div className="rounded-lg border overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b bg-muted/40 font-semibold text-[11px] text-muted-foreground">
                          <th className="p-2.5">Item Description</th>
                          <th className="p-2.5 text-center w-28">Quantity</th>
                          <th className="p-2.5 w-36">Delivery Date</th>
                          <th className="p-2.5 min-w-[200px]">Delivery Location</th>
                          <th className="p-2.5 min-w-[150px]">Remarks</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y text-xs">
                        {(
                          po.deliverySchedule ||
                          items.map((it, idx) => ({
                            id: `ds-${idx + 1}`,
                            itemCode: it.itemCode,
                            itemDescription: it.itemDescription,
                            quantity: it.poQty,
                            unit: it.unit,
                            deliveryDate: it.deliveryDate,
                            deliveryLocation:
                              it.deliveryLocation || `${po.siteName || "Site"} Godown`,
                            remarks: it.remarks || "Batch dispatch",
                          }))
                        ).map((ds, idx) => (
                          <tr key={idx} className="hover:bg-muted/20 transition-colors">
                            <td className="p-2.5 font-medium">
                              <span className="font-mono text-primary font-bold mr-1.5">
                                {ds.itemCode}
                              </span>
                              {ds.itemDescription}
                            </td>
                            <td className="p-2.5 text-center font-bold font-mono">
                              {ds.quantity} {ds.unit}
                            </td>
                            <td className="p-2.5 font-mono text-muted-foreground">
                              {formatDate(ds.deliveryDate)}
                            </td>
                            <td className="p-2.5 flex items-center gap-1 text-muted-foreground">
                              <MapPin className="size-3 text-primary shrink-0" />
                              <span>{ds.deliveryLocation}</span>
                            </td>
                            <td className="p-2.5 text-muted-foreground text-[11px]">
                              {ds.remarks || "Standard dispatch"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </TabsContent>

              {/* TAB 4: APPROVAL WORKFLOW & AUDIT TIMELINE (Section 9) */}
              <TabsContent value="timeline" className="space-y-3 pt-3 text-xs">
                <div className="rounded-xl border bg-card p-4 shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Clock className="size-3.5 text-primary" /> Approval Workflow (Section 9)
                    </h4>
                    <Badge variant="outline" className="text-xs font-semibold">
                      Current: {po.status}
                    </Badge>
                  </div>

                  {/* Visual Workflow Steps */}
                  <div className="p-3 rounded-lg border bg-muted/20 overflow-x-auto">
                    <div className="flex items-center gap-2 text-xs min-w-[620px]">
                      {[
                        "PO Created",
                        "Purchase Head Approval",
                        "Finance Approval",
                        "Final Approval",
                        "PO Approved",
                        "PO Issued",
                      ].map((stage, idx) => {
                        const isIssued = po.status === "Issued";
                        const isApproved = ["Approved", "Issued"].includes(po.status);
                        const isPending = ["Pending Approval", "Approved", "Issued"].includes(
                          po.status,
                        );

                        let stepDone = false;
                        let stepCurrent = false;

                        if (stage === "PO Created") stepDone = true;
                        else if (stage === "Purchase Head Approval") {
                          stepDone = isApproved;
                          stepCurrent = po.status === "Pending Approval";
                        } else if (stage === "Finance Approval") {
                          stepDone = isApproved;
                        } else if (stage === "Final Approval" || stage === "PO Approved") {
                          stepDone = isApproved;
                          stepCurrent = po.status === "Approved";
                        } else if (stage === "PO Issued") {
                          stepDone = isIssued;
                          stepCurrent = po.status === "Approved";
                        }

                        return (
                          <div key={idx} className="flex items-center gap-2">
                            <span
                              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                                stepDone
                                  ? "bg-emerald-500/15 text-emerald-600 border border-emerald-500/30 font-semibold"
                                  : stepCurrent
                                    ? "bg-amber-500/15 text-amber-600 border border-amber-500/30 font-bold animate-pulse"
                                    : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {stage}
                            </span>
                            {idx < 5 && <span className="text-muted-foreground/60 text-xs">→</span>}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Audit Event List */}
                  <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
                    {(po.auditTimeline || []).map((event, idx) => (
                      <div key={idx} className="relative group">
                        <div
                          className={`absolute -left-[29px] top-1 size-4 rounded-full border-2 bg-background flex items-center justify-center ${
                            event.status === "completed"
                              ? "border-emerald-500 text-emerald-500"
                              : event.status === "current"
                                ? "border-amber-500 text-amber-500 animate-pulse"
                                : "border-muted text-muted"
                          }`}
                        >
                          <div
                            className={`size-1.5 rounded-full ${
                              event.status === "completed"
                                ? "bg-emerald-500"
                                : event.status === "current"
                                  ? "bg-amber-500"
                                  : "bg-muted"
                            }`}
                          />
                        </div>

                        <div className="p-3 rounded-lg border bg-card shadow-2xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-foreground text-xs">{event.title}</span>
                            <span className="text-[10px] text-muted-foreground font-mono">
                              {event.timestamp}
                            </span>
                          </div>
                          <p className="text-[11px] text-muted-foreground">{event.description}</p>
                          <div className="text-[10px] text-muted-foreground pt-1 flex items-center gap-2">
                            <span className="font-semibold text-foreground">{event.user}</span>
                            <span>•</span>
                            <span>{event.role}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* TAB 5: DOCUMENTS */}
              <TabsContent value="docs" className="space-y-3 pt-3 text-xs">
                <div className="rounded-xl border bg-card p-4 shadow-xs space-y-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Associated Order & Tender Documents
                  </h4>
                  <div className="divide-y border rounded-lg overflow-hidden">
                    {(
                      po.documents || [
                        {
                          id: "doc-po-1",
                          name: `Purchase_Order_${po.poNo.replace(/\//g, "_")}.pdf`,
                          type: "PDF",
                          size: "2.4 MB",
                          uploadedAt: po.date,
                          category: "PO PDF",
                        },
                        {
                          id: "doc-po-2",
                          name: "Supplier_Signed_Quotation.pdf",
                          type: "PDF",
                          size: "1.8 MB",
                          uploadedAt: po.date,
                          category: "Quotation",
                        },
                        {
                          id: "doc-po-3",
                          name: "Approved_Comparative_Statement.pdf",
                          type: "PDF",
                          size: "3.1 MB",
                          uploadedAt: po.date,
                          category: "Technical Specifications",
                        },
                      ]
                    ).map((doc, idx) => (
                      <div
                        key={idx}
                        className="p-3 flex items-center justify-between hover:bg-muted/20 transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <FileText className="size-4 text-primary" />
                          <div>
                            <span className="font-medium text-foreground block">{doc.name}</span>
                            <span className="text-[10px] text-muted-foreground">
                              {doc.category} • {doc.size} • {formatDate(doc.uploadedAt)}
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs gap-1 text-primary hover:text-primary"
                          onClick={() => toast.success(`Viewing mock ${doc.name}`)}
                        >
                          <ExternalLink className="size-3" /> Preview
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* FOOTER ACTIONS BASED ON PO STATUS (Section 8) */}
          <SheetFooter className="p-4 border-t bg-card shrink-0 flex flex-row items-center justify-between sm:justify-between">
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Draft Actions: Edit, Submit for Approval, Delete */}
              {status === "Draft" && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs text-destructive hover:text-destructive"
                    onClick={handleDelete}
                  >
                    Delete Draft
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs gap-1"
                    onClick={() => {
                      onEditPo?.(po);
                      onClose();
                    }}
                  >
                    <Edit className="size-3.5" /> Edit
                  </Button>
                  <Button
                    size="sm"
                    className="text-xs gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                    onClick={() => handleStatusTransition("Pending Approval")}
                  >
                    <Send className="size-3.5" /> Submit for Approval
                  </Button>
                </>
              )}

              {/* Pending Approval Actions: Approve, Reject, Send Back */}
              {status === "Pending Approval" && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs gap-1 text-destructive hover:text-destructive"
                    onClick={() => handleStatusTransition("Cancelled")}
                  >
                    <XCircle className="size-3.5" /> Reject
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => handleStatusTransition("Draft")}
                  >
                    Send Back
                  </Button>
                  <Button
                    size="sm"
                    className="text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs"
                    onClick={() => handleStatusTransition("Approved")}
                  >
                    <CheckCircle2 className="size-3.5" /> Approve PO
                  </Button>
                </>
              )}

              {/* Approved Actions: Issue PO, Print, Share */}
              {status === "Approved" && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs gap-1"
                    onClick={() =>
                      toast.success(`PO ${po.poNo} link copied and shared with supplier email!`)
                    }
                  >
                    <Share2 className="size-3.5" /> Share
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs gap-1"
                    onClick={() => window.print()}
                  >
                    <Printer className="size-3.5" /> Print
                  </Button>
                  <Button
                    size="sm"
                    className="text-xs gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-xs"
                    onClick={() => handleStatusTransition("Issued")}
                  >
                    <Send className="size-3.5" /> Issue PO
                  </Button>
                </>
              )}

              {/* Issued Actions: Print, Download, Create GRN */}
              {status === "Issued" && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs gap-1"
                    onClick={() => window.print()}
                  >
                    <Printer className="size-3.5" /> Print
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs gap-1"
                    onClick={() => toast.success(`Downloading ${po.poNo}.pdf...`)}
                  >
                    <Download className="size-3.5" /> Download
                  </Button>
                  <Button
                    size="sm"
                    className="text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs"
                    onClick={() => setGrnModalOpen(true)}
                  >
                    <PackageCheck className="size-3.5" /> + Create GRN
                  </Button>
                </>
              )}
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* GRN Initiation Modal (Section 12) */}
      <GrnInitiationModal
        open={grnModalOpen}
        onClose={() => setGrnModalOpen(false)}
        po={currentPo}
      />
    </>
  );
}
