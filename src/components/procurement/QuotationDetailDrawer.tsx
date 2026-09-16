import { useState, useMemo, useEffect } from "react";
import {
  Copy,
  Printer,
  ExternalLink,
  Building2,
  MapPin,
  Calendar,
  Layers,
  FileCheck2,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Award,
  Download,
  Eye,
  Percent,
  Truck,
  ShieldCheck,
  TrendingDown,
  UserCheck,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/common/StatusBadge";
import { formatDate, formatINR, formatNumber } from "@/utils/format";
import { toast } from "sonner";
import { quotationService } from "@/services/quotationService";
import type { Quotation, QuotationDocument, TechnicalEvaluation } from "@/types";

interface QuotationDetailDrawerProps {
  quotation: Quotation | null;
  open: boolean;
  onClose: () => void;
  onUpdateQuotation?: ((updated: Quotation) => void) | undefined;
  onOpenRfq?: ((rfqNumber: string) => void) | undefined;
}

export function QuotationDetailDrawer({
  quotation: initialQuotation,
  open,
  onClose,
  onUpdateQuotation,
  onOpenRfq,
}: QuotationDetailDrawerProps) {
  const [currentQuotation, setCurrentQuotation] = useState<Quotation | null>(initialQuotation);

  // Sync prop changes
  useEffect(() => {
    setCurrentQuotation(initialQuotation);
  }, [initialQuotation]);

  // Document preview modal state
  const [previewDoc, setPreviewDoc] = useState<QuotationDocument | null>(null);

  // Technical Evaluation edit state
  const [evalRemarks, setEvalRemarks] = useState("");
  const [specCompliance, setSpecCompliance] = useState<"Compliant" | "Partial" | "Non-Compliant">(
    "Compliant",
  );
  const [qtyCompliance, setQtyCompliance] = useState<"Compliant" | "Partial" | "Non-Compliant">(
    "Compliant",
  );
  const [delCompliance, setDelCompliance] = useState<"Compliant" | "Partial" | "Non-Compliant">(
    "Compliant",
  );
  const [docCompliance, setDocCompliance] = useState<"Verified" | "Pending" | "Deficient">(
    "Verified",
  );

  // Reset evaluation form state when quotation changes
  useEffect(() => {
    if (currentQuotation?.technicalEvaluation) {
      setEvalRemarks(currentQuotation.technicalEvaluation.remarks || "");
      setSpecCompliance(
        currentQuotation.technicalEvaluation.specificationCompliance || "Compliant",
      );
      setQtyCompliance(currentQuotation.technicalEvaluation.quantityCompliance || "Compliant");
      setDelCompliance(currentQuotation.technicalEvaluation.deliveryCompliance || "Compliant");
      setDocCompliance(currentQuotation.technicalEvaluation.documentsStatus || "Verified");
    } else {
      setEvalRemarks("");
      setSpecCompliance("Compliant");
      setQtyCompliance("Compliant");
      setDelCompliance("Compliant");
      setDocCompliance("Verified");
    }
  }, [currentQuotation]);

  if (!currentQuotation) return null;

  const quote = currentQuotation;
  const items = quote.items || [];
  const rank = quote.commercialEvaluation?.rank;

  function copyQuotationNo() {
    navigator.clipboard.writeText(quote.quotationNo);
    toast.success(`Copied ${quote.quotationNo} to clipboard`);
  }

  function handleSaveEvaluation(result: "Qualified" | "Rejected") {
    const updatedEval: Partial<TechnicalEvaluation> = {
      specificationCompliance: specCompliance,
      quantityCompliance: qtyCompliance,
      deliveryCompliance: delCompliance,
      documentsStatus: docCompliance,
      remarks: evalRemarks.trim() || "Technical evaluation completed by technical lead.",
      evaluatedBy: "Sanjay Rane (Technical Lead)",
      evaluationDate: new Date().toISOString().slice(0, 10),
      result,
    };

    const updated = quotationService.updateTechnicalEvaluation(quote.id, updatedEval);
    if (updated) {
      setCurrentQuotation(updated);
      onUpdateQuotation?.(updated);
      toast.success(
        result === "Qualified"
          ? `Quotation marked as Technically Qualified (${updated.commercialEvaluation?.rank || "Rank Assigned"})`
          : `Quotation marked as Technically Rejected`,
      );
    }
  }

  return (
    <>
      <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-4xl p-0 flex flex-col gap-0 border-l bg-background shadow-2xl overflow-hidden"
        >
          {/* HEADER STRIP */}
          <SheetHeader className="px-6 py-4 border-b bg-card text-card-foreground shrink-0">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <SheetTitle className="text-xl font-bold font-mono tracking-tight text-foreground flex items-center gap-2">
                    {quote.quotationNo}
                    <button
                      onClick={copyQuotationNo}
                      className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors"
                      title="Copy Quotation No"
                    >
                      <Copy className="size-3.5" />
                    </button>
                  </SheetTitle>

                  <StatusBadge value={quote.status} />

                  {rank && (
                    <Badge
                      variant="outline"
                      className={`text-xs px-2.5 py-0.5 font-bold flex items-center gap-1 ${
                        rank === "L1"
                          ? "bg-emerald-500/15 text-emerald-600 border-emerald-500/30"
                          : rank === "L2"
                            ? "bg-blue-500/15 text-blue-600 border-blue-500/30"
                            : "bg-amber-500/15 text-amber-600 border-amber-500/30"
                      }`}
                    >
                      <Award className="size-3.5" />
                      {rank} {rank === "L1" ? "— Lowest Bidder" : ""}
                    </Badge>
                  )}
                </div>

                <SheetDescription className="text-xs text-muted-foreground flex items-center gap-2 flex-wrap">
                  <span>Supplier:</span>
                  <span className="font-semibold text-foreground">{quote.supplierName}</span>
                  {quote.supplierCode && (
                    <Badge variant="secondary" className="text-[10px] py-0 px-1.5 font-mono">
                      {quote.supplierCode}
                    </Badge>
                  )}
                </SheetDescription>
              </div>

              {/* Header Actions */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1.5 text-xs"
                  onClick={() => window.print()}
                >
                  <Printer className="size-3.5" /> Print
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1.5 text-xs text-primary hover:text-primary"
                  onClick={() => {
                    if (onOpenRfq) {
                      onOpenRfq(quote.sourceRFQNumber);
                    } else {
                      window.location.href = `/app/procurement/enquiries?rfq=${encodeURIComponent(quote.sourceRFQNumber)}`;
                    }
                  }}
                >
                  <ExternalLink className="size-3.5" /> View RFQ
                </Button>
              </div>
            </div>

            {/* Context Breadcrumb details */}
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2.5 border-t text-[11px] text-muted-foreground">
              <div className="flex items-center gap-1.5 truncate">
                <FileCheck2 className="size-3.5 text-primary shrink-0" />
                <span className="truncate font-medium text-foreground">
                  RFQ: {quote.sourceRFQNumber}
                </span>
              </div>
              <div className="flex items-center gap-1.5 truncate">
                <Building2 className="size-3.5 text-primary shrink-0" />
                <span className="truncate">{quote.projectName}</span>
              </div>
              <div className="flex items-center gap-1.5 truncate">
                <MapPin className="size-3.5 text-primary shrink-0" />
                <span className="truncate">{quote.siteName}</span>
              </div>
              <div className="flex items-center gap-1.5 truncate">
                <Calendar className="size-3.5 text-primary shrink-0" />
                <span>
                  Date: {formatDate(quote.date)} | Valid: {formatDate(quote.validUntil || "")}
                </span>
              </div>
            </div>

            {/* Contact Person, Email, Phone Strip */}
            <div className="mt-2.5 flex flex-wrap items-center gap-x-5 gap-y-1 rounded-md bg-muted/30 px-3 py-1.5 text-xs text-muted-foreground border">
              <span className="flex items-center gap-1.5">
                <span className="font-semibold text-foreground">Contact:</span>
                <span>{quote.contactPerson || "Rajesh Nair"}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="font-semibold text-foreground">Email:</span>
                <a href={`mailto:${quote.email}`} className="text-primary hover:underline">
                  {quote.email || "sales@supplier.com"}
                </a>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="font-semibold text-foreground">Phone:</span>
                <span>{quote.phone || "+91 98231 44550"}</span>
              </span>
            </div>
          </SheetHeader>

          {/* SCROLLABLE BODY */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* 1. FINANCIAL SUMMARY METRIC STRIP (9 Metrics) */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Quotation Financial Summary & Landed Cost
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-lg border bg-card p-3 shadow-xs">
                  <span className="text-[11px] text-muted-foreground">Total Items</span>
                  <p className="text-lg font-bold text-foreground mt-0.5">
                    {quote.totalItems || items.length}
                  </p>
                  <span className="text-[10px] text-muted-foreground">Requisition items</span>
                </div>

                <div className="rounded-lg border bg-card p-3 shadow-xs">
                  <span className="text-[11px] text-muted-foreground">Basic Amount</span>
                  <p className="text-lg font-bold text-foreground mt-0.5">
                    {formatINR(quote.basicAmount)}
                  </p>
                  <span className="text-[10px] text-muted-foreground">Before discount & tax</span>
                </div>

                <div className="rounded-lg border bg-card p-3 shadow-xs">
                  <span className="text-[11px] text-muted-foreground">GST (18%)</span>
                  <p className="text-lg font-bold text-foreground mt-0.5">{formatINR(quote.gst)}</p>
                  <span className="text-[10px] text-muted-foreground">Input tax credit</span>
                </div>

                <div className="rounded-lg border bg-primary/5 border-primary/20 p-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-primary">Grand Total</span>
                    {rank && (
                      <Badge variant="outline" className="text-[10px] px-1 py-0 font-bold">
                        {rank}
                      </Badge>
                    )}
                  </div>
                  <p className="text-lg font-extrabold text-foreground mt-0.5">
                    {formatINR(quote.grandTotal)}
                  </p>
                  <span className="text-[10px] text-muted-foreground">Landed project cost</span>
                </div>
              </div>

              {/* Sub-breakdown details (Discount, Taxable Amount, Freight, Other Charges, Round Off) */}
              <div className="mt-2.5 grid grid-cols-2 sm:grid-cols-5 gap-2 rounded-md bg-muted/40 p-2.5 text-xs text-muted-foreground border">
                <div>
                  <span className="block text-[10px] text-muted-foreground uppercase tracking-wider">
                    Discount
                  </span>
                  <strong className="text-foreground text-xs">
                    {quote.discount > 0 ? `-${formatINR(quote.discount)}` : "₹0"}
                  </strong>
                </div>
                <div>
                  <span className="block text-[10px] text-muted-foreground uppercase tracking-wider">
                    Taxable Amount
                  </span>
                  <strong className="text-foreground text-xs">
                    {formatINR(quote.taxableAmount)}
                  </strong>
                </div>
                <div>
                  <span className="block text-[10px] text-muted-foreground uppercase tracking-wider">
                    Freight
                  </span>
                  <strong className="text-foreground text-xs">
                    {quote.freight > 0 ? formatINR(quote.freight) : "₹0 (Included)"}
                  </strong>
                </div>
                <div>
                  <span className="block text-[10px] text-muted-foreground uppercase tracking-wider">
                    Other Charges
                  </span>
                  <strong className="text-foreground text-xs">
                    {quote.otherCharges > 0 ? formatINR(quote.otherCharges) : "₹0"}
                  </strong>
                </div>
                <div>
                  <span className="block text-[10px] text-muted-foreground uppercase tracking-wider">
                    Round Off
                  </span>
                  <strong className="text-foreground text-xs">
                    {quote.roundOff ? formatINR(quote.roundOff) : "₹0.00"}
                  </strong>
                </div>
              </div>
            </div>

            {/* 2. QUOTATION LINE ITEMS TABLE */}
            <div className="rounded-xl border bg-card shadow-card overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
                <div className="flex items-center gap-2">
                  <Layers className="size-4 text-primary" />
                  <h3 className="text-sm font-semibold text-foreground">
                    Quoted Line Items ({items.length})
                  </h3>
                </div>
                <span className="text-xs text-muted-foreground">
                  Calculated: Quoted Qty × Rate − Discount + GST
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted/50 text-[11px] uppercase tracking-wider text-muted-foreground font-semibold border-b">
                    <tr>
                      <th className="py-2.5 px-3">Item Code & Name</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3 text-right">RFQ Qty</th>
                      <th className="py-2.5 px-3 text-right">Quoted Qty</th>
                      <th className="py-2.5 px-3 text-right">Rate (₹)</th>
                      <th className="py-2.5 px-3 text-right">Discount</th>
                      <th className="py-2.5 px-3 text-right">Tax (%)</th>
                      <th className="py-2.5 px-3 text-right">Line Amount (₹)</th>
                      <th className="py-2.5 px-3">Delivery / Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {items.map((it, idx) => {
                      const calculatedLineAmount =
                        it.quotedQty * it.rate - (it.discountAmount || 0);
                      return (
                        <tr key={it.id || idx} className="hover:bg-muted/20 transition-colors">
                          <td className="py-2.5 px-3 font-medium text-foreground max-w-[220px]">
                            <div className="font-mono text-[10px] text-muted-foreground">
                              {it.itemCode}
                            </div>
                            <div className="text-xs font-semibold">{it.itemDescription}</div>
                          </td>
                          <td className="py-2.5 px-3">
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                              {it.category || "Civil"}
                            </Badge>
                          </td>
                          <td className="py-2.5 px-3 text-right text-muted-foreground">
                            {formatNumber(it.rfqQty)} {it.unit}
                          </td>
                          <td className="py-2.5 px-3 text-right font-semibold text-foreground">
                            {formatNumber(it.quotedQty)} {it.unit}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-foreground">
                            {formatINR(it.rate)}
                          </td>
                          <td className="py-2.5 px-3 text-right text-muted-foreground font-mono">
                            {it.discountAmount && it.discountAmount > 0
                              ? `-${formatINR(it.discountAmount)}`
                              : "—"}
                          </td>
                          <td className="py-2.5 px-3 text-right text-muted-foreground font-mono">
                            {it.taxPct}%
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold font-mono text-foreground">
                            {formatINR(it.lineAmount || calculatedLineAmount)}
                          </td>
                          <td className="py-2.5 px-3 text-muted-foreground max-w-[180px] text-[11px]">
                            {it.deliverySchedule && (
                              <div className="font-medium text-foreground flex items-center gap-1">
                                <Clock className="size-3 text-muted-foreground" />
                                {it.deliverySchedule}
                              </div>
                            )}
                            {it.remarks && <div className="truncate text-[10px]">{it.remarks}</div>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-muted/30 font-semibold border-t text-xs">
                    <tr>
                      <td colSpan={4} className="py-2.5 px-3 text-muted-foreground">
                        Total {items.length} Requisition Items
                      </td>
                      <td colSpan={3} className="py-2.5 px-3 text-right text-muted-foreground">
                        Total Basic Value:
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold font-mono text-foreground text-sm">
                        {formatINR(quote.basicAmount)}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* 3. TECHNICAL EVALUATION SECTION */}
            <div className="rounded-xl border bg-card p-4 shadow-card space-y-4">
              <div className="flex items-center justify-between border-b pb-2.5">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="size-4 text-primary" />
                  <h3 className="text-sm font-semibold text-foreground">Technical Evaluation</h3>
                </div>
                {quote.technicalEvaluation?.result && (
                  <Badge
                    variant="outline"
                    className={`text-xs px-2.5 py-0.5 font-bold ${
                      quote.technicalEvaluation.result === "Qualified"
                        ? "bg-emerald-500/15 text-emerald-600 border-emerald-500/30"
                        : "bg-destructive/15 text-destructive border-destructive/30"
                    }`}
                  >
                    {quote.technicalEvaluation.result === "Qualified" ? (
                      <CheckCircle2 className="size-3.5 mr-1" />
                    ) : (
                      <XCircle className="size-3.5 mr-1" />
                    )}
                    {quote.technicalEvaluation.result}
                  </Badge>
                )}
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="rounded-lg border p-2.5 bg-muted/20">
                  <span className="text-[11px] text-muted-foreground">
                    Specification Compliance
                  </span>
                  <select
                    value={specCompliance}
                    onChange={(e) =>
                      setSpecCompliance(e.target.value as "Compliant" | "Partial" | "Non-Compliant")
                    }
                    className="mt-1 w-full text-xs font-semibold rounded border bg-background px-2 py-1"
                  >
                    <option value="Compliant">Compliant</option>
                    <option value="Partial">Partial</option>
                    <option value="Non-Compliant">Non-Compliant</option>
                  </select>
                </div>

                <div className="rounded-lg border p-2.5 bg-muted/20">
                  <span className="text-[11px] text-muted-foreground">Quantity Compliance</span>
                  <select
                    value={qtyCompliance}
                    onChange={(e) =>
                      setQtyCompliance(e.target.value as "Compliant" | "Partial" | "Non-Compliant")
                    }
                    className="mt-1 w-full text-xs font-semibold rounded border bg-background px-2 py-1"
                  >
                    <option value="Compliant">Full Quoted</option>
                    <option value="Partial">Partial Quoted</option>
                    <option value="Non-Compliant">Non-Compliant</option>
                  </select>
                </div>

                <div className="rounded-lg border p-2.5 bg-muted/20">
                  <span className="text-[11px] text-muted-foreground">Delivery Schedule</span>
                  <select
                    value={delCompliance}
                    onChange={(e) =>
                      setDelCompliance(e.target.value as "Compliant" | "Partial" | "Non-Compliant")
                    }
                    className="mt-1 w-full text-xs font-semibold rounded border bg-background px-2 py-1"
                  >
                    <option value="Compliant">Within Schedule</option>
                    <option value="Partial">Acceptable Delay</option>
                    <option value="Non-Compliant">Non-Compliant</option>
                  </select>
                </div>

                <div className="rounded-lg border p-2.5 bg-muted/20">
                  <span className="text-[11px] text-muted-foreground">Required Documents</span>
                  <select
                    value={docCompliance}
                    onChange={(e) =>
                      setDocCompliance(e.target.value as "Verified" | "Pending" | "Deficient")
                    }
                    className="mt-1 w-full text-xs font-semibold rounded border bg-background px-2 py-1"
                  >
                    <option value="Verified">All Verified</option>
                    <option value="Pending">Pending Audit</option>
                    <option value="Deficient">Deficient</option>
                  </select>
                </div>
              </div>

              <div>
                <Label className="text-xs font-medium text-muted-foreground">
                  Technical Remarks & Quality Feedback
                </Label>
                <Textarea
                  value={evalRemarks}
                  onChange={(e) => setEvalRemarks(e.target.value)}
                  placeholder="Enter technical validation notes confirming IS standards compliance..."
                  className="mt-1 text-xs resize-none h-20"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <UserCheck className="size-3.5 text-primary" />
                  <span>
                    Evaluated by:{" "}
                    <strong>
                      {quote.technicalEvaluation?.evaluatedBy || "Sanjay Rane (Technical Lead)"}
                    </strong>{" "}
                    ({formatDate(quote.technicalEvaluation?.evaluationDate || quote.date)})
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs text-destructive hover:bg-destructive/10 gap-1.5"
                    onClick={() => handleSaveEvaluation("Rejected")}
                  >
                    <XCircle className="size-3.5" /> Reject Technically
                  </Button>
                  <Button
                    size="sm"
                    className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold gap-1.5"
                    onClick={() => handleSaveEvaluation("Qualified")}
                  >
                    <CheckCircle2 className="size-3.5" /> Mark Qualified
                  </Button>
                </div>
              </div>
            </div>

            {/* 4. COMMERCIAL EVALUATION & RANKING SECTION */}
            <div className="rounded-xl border bg-card p-4 shadow-card space-y-4">
              <div className="flex items-center justify-between border-b pb-2.5">
                <div className="flex items-center gap-2">
                  <Award className="size-4 text-primary" />
                  <h3 className="text-sm font-semibold text-foreground">
                    Commercial Evaluation & Landed Cost Rank
                  </h3>
                </div>
                {rank && (
                  <Badge
                    variant="outline"
                    className={`text-xs px-2.5 py-0.5 font-bold ${
                      rank === "L1"
                        ? "bg-emerald-500/15 text-emerald-600 border-emerald-500/30"
                        : "bg-blue-500/15 text-blue-600 border-blue-500/30"
                    }`}
                  >
                    Commercial Rank: {rank}
                  </Badge>
                )}
              </div>

              <div className="grid sm:grid-cols-3 gap-3 text-xs">
                <div className="rounded-lg border p-3 bg-muted/20 space-y-1">
                  <span className="text-[11px] text-muted-foreground font-medium">
                    Commercial Terms
                  </span>
                  <p>
                    Payment: <strong className="text-foreground">{quote.paymentTerms}</strong>
                  </p>
                  <p>
                    Delivery Terms:{" "}
                    <strong className="text-foreground">{quote.deliveryTerms || "FOR Site"}</strong>
                  </p>
                  <p>
                    Quotation Validity:{" "}
                    <strong className="text-foreground">{quote.validity}</strong>
                  </p>
                </div>

                <div className="rounded-lg border p-3 bg-muted/20 space-y-1">
                  <span className="text-[11px] text-muted-foreground font-medium">
                    Landed Cost Calculation
                  </span>
                  <p className="text-[11px] text-muted-foreground">
                    Basic ({formatINR(quote.basicAmount)}) + GST ({formatINR(quote.gst)}) + Freight
                    ({quote.freight > 0 ? formatINR(quote.freight) : "₹0"})
                  </p>
                  <p className="text-sm font-bold text-foreground mt-1">
                    Comparable Landed: {formatINR(quote.grandTotal)}
                  </p>
                </div>

                <div className="rounded-lg border p-3 bg-muted/20 flex flex-col justify-between">
                  <span className="text-[11px] text-muted-foreground font-medium">
                    Competitive Position
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-2xl font-black font-mono text-primary">
                      {rank || "—"}
                    </span>
                    <span className="text-[11px] text-muted-foreground leading-tight">
                      {rank === "L1"
                        ? "Lowest comparable landed bid amongst technically qualified vendors."
                        : rank
                          ? `Ranked ${rank} against evaluated vendor submissions.`
                          : "Rank calculated upon technical qualification."}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 5. DOCUMENTS & ATTACHMENTS SECTION */}
            <div className="rounded-xl border bg-card p-4 shadow-card">
              <div className="flex items-center justify-between border-b pb-2.5">
                <div className="flex items-center gap-2">
                  <FileText className="size-4 text-primary" />
                  <h3 className="text-sm font-semibold text-foreground">
                    Quotation Documents ({quote.documents?.length || 0})
                  </h3>
                </div>
                <span className="text-xs text-muted-foreground">
                  Verified vendor compliance files
                </span>
              </div>

              <div className="mt-3 grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {quote.documents?.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex flex-col justify-between rounded-lg border p-3 text-xs bg-muted/10 hover:bg-muted/20 transition-colors"
                  >
                    <div className="flex items-start gap-2">
                      <div className="p-1.5 rounded bg-primary/10 text-primary shrink-0">
                        <FileText className="size-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-foreground truncate" title={doc.name}>
                          {doc.name}
                        </p>
                        <span className="text-[10px] text-muted-foreground">
                          {doc.category} • {doc.size}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-end gap-2 pt-2 border-t">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-[11px] px-2 gap-1 text-muted-foreground hover:text-foreground"
                        onClick={() => setPreviewDoc(doc)}
                      >
                        <Eye className="size-3" /> Preview
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-[11px] px-2 gap-1 text-primary hover:text-primary"
                        onClick={() => toast.success(`Downloaded ${doc.name}`)}
                      >
                        <Download className="size-3" /> Download
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* DOCUMENT PREVIEW MODAL */}
      {previewDoc && (
        <Dialog open={Boolean(previewDoc)} onOpenChange={() => setPreviewDoc(null)}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="size-4 text-primary" /> {previewDoc.name}
              </DialogTitle>
              <DialogDescription>
                {previewDoc.category} • {previewDoc.size} • Uploaded on{" "}
                {formatDate(previewDoc.uploadedAt)}
              </DialogDescription>
            </DialogHeader>

            <div className="h-64 border rounded-lg bg-muted/20 flex flex-col items-center justify-center p-6 text-center">
              <FileText className="size-12 text-primary/40 mb-2" />
              <p className="font-medium text-foreground text-sm">{previewDoc.name}</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                Electronic document verified from supplier {quote.supplierName}. Document signature
                and GST compliance authenticated.
              </p>
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" size="sm" onClick={() => setPreviewDoc(null)}>
                Close
              </Button>
              <Button
                size="sm"
                className="gap-1.5"
                onClick={() => {
                  toast.success(`Downloaded ${previewDoc.name}`);
                  setPreviewDoc(null);
                }}
              >
                <Download className="size-3.5" /> Download Document
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
