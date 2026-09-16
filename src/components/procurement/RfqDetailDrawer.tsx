import { useState, useMemo } from "react";
import {
  Send,
  Printer,
  Copy,
  Building2,
  MapPin,
  Calendar,
  Layers,
  FileCheck2,
  Users,
  CheckCircle2,
  Clock,
  ExternalLink,
  Eye,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/common/StatusBadge";
import { formatDate, formatINR, formatNumber } from "@/utils/format";
import { toast } from "sonner";
import { rfqService } from "@/services/rfqService";
import { quotationService } from "@/services/quotationService";
import { QuotationDetailDrawer } from "@/components/procurement/QuotationDetailDrawer";
import type { Enquiry, Quotation } from "@/types";

interface RfqDetailDrawerProps {
  rfq: Enquiry | null;
  open: boolean;
  onClose: () => void;
  onUpdateRfq?: ((updated: Enquiry) => void) | undefined;
}

export function RfqDetailDrawer({
  rfq: initialRfq,
  open,
  onClose,
  onUpdateRfq,
}: RfqDetailDrawerProps) {
  const [currentRfq, setCurrentRfq] = useState<Enquiry | null>(initialRfq);
  const [selectedQuote, setSelectedQuote] = useState<Quotation | null>(null);

  // Sync prop changes
  useMemo(() => {
    if (initialRfq) {
      setCurrentRfq(initialRfq);
    }
  }, [initialRfq]);

  // Retrieve received quotations for this RFQ
  const receivedQuotes = useMemo(() => {
    if (!currentRfq) return [];
    return quotationService.getQuotationsByRfq(currentRfq.enquiryNo);
  }, [currentRfq]);

  if (!currentRfq) return null;

  function handleSendRfq() {
    if (!currentRfq) return;
    const updated = rfqService.updateRfqStatus(currentRfq.id, "Sent");
    if (updated) {
      setCurrentRfq(updated);
      if (onUpdateRfq) {
        onUpdateRfq(updated);
      }
      toast.success(`RFQ ${updated.enquiryNo} sent to suppliers! Status is now Sent.`);
    }
  }

  const suppliersList = currentRfq.selectedSuppliers ?? [];
  const itemsList = currentRfq.items ?? [];
  const totalQuantity = itemsList.reduce((s, it) => s + it.quantity, 0);

  return (
    <>
      <Sheet open={open} onOpenChange={(val) => !val && onClose()}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-3xl md:max-w-4xl lg:max-w-5xl h-full p-0 flex flex-col bg-background text-foreground shadow-2xl border-l"
        >
          {/* STICKY HEADER */}
          <div className="sticky top-0 z-20 border-b bg-card px-5 py-4 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="font-mono text-lg font-bold text-foreground sm:text-xl">
                    {currentRfq.enquiryNo}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7"
                    onClick={() => {
                      void navigator.clipboard.writeText(currentRfq.enquiryNo);
                      toast.success("RFQ number copied");
                    }}
                    title="Copy RFQ Number"
                  >
                    <Copy className="size-3.5" />
                  </Button>
                  <StatusBadge value={currentRfq.status} />
                </div>

                <SheetDescription className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1 font-semibold text-foreground">
                    <Building2 className="size-3 text-primary" /> {currentRfq.project}
                  </span>
                  {currentRfq.site && (
                    <span className="flex items-center gap-1">
                      <MapPin className="size-3 text-muted-foreground" /> {currentRfq.site}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar className="size-3 text-muted-foreground" /> RFQ Date:{" "}
                    {formatDate(currentRfq.date)}
                  </span>
                  {currentRfq.sentDate && (
                    <span className="flex items-center gap-1 font-semibold text-emerald-600">
                      <CheckCircle2 className="size-3" /> Dispatched:{" "}
                      {formatDate(currentRfq.sentDate)}
                    </span>
                  )}
                </SheetDescription>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs gap-1"
                  onClick={() => window.print()}
                >
                  <Printer className="size-3.5" /> Print RFQ
                </Button>
              </div>
            </div>

            {/* Department & Sub-bar */}
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t pt-2.5 text-xs text-muted-foreground">
              <div className="flex items-center gap-3">
                <span>
                  Department:{" "}
                  <strong className="text-foreground">
                    {currentRfq.department || "Procurement"}
                  </strong>
                </span>
                <span>•</span>
                <span>
                  Total Line Items:{" "}
                  <strong className="text-foreground">{itemsList.length || 1}</strong>
                </span>
              </div>
              <div>
                Suppliers Invited:{" "}
                <strong className="text-primary">
                  {suppliersList.length || currentRfq.suppliers}
                </strong>
              </div>
            </div>
          </div>

          {/* SCROLLABLE BODY */}
          <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
            {/* PROMINENT SOURCE INDENT BANNER */}
            {currentRfq.sourceIndent && (
              <div className="rounded-xl border border-primary/30 bg-primary/5 p-3.5 text-xs shadow-card flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <FileCheck2 className="size-5 text-primary shrink-0" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                        Source Requisition Reference
                      </span>
                    </div>
                    <p className="font-mono text-sm font-bold text-foreground">
                      Source Indent: {currentRfq.sourceIndent}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      This Request for Quotation was created against approved site indent{" "}
                      <strong>{currentRfq.sourceIndent}</strong>.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-semibold px-2 py-0.5 text-[11px]">
                    Approved Indent
                  </span>
                </div>
              </div>
            )}

            {/* SUMMARY 4-KPI CARDS */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-xl border bg-card p-3 shadow-card">
                <span className="text-[11px] text-muted-foreground">Line Items</span>
                <p className="mt-1 font-mono text-lg font-bold text-foreground">
                  {itemsList.length || 1} <span className="text-xs font-normal">items</span>
                </p>
                <span className="text-[10px] text-muted-foreground">Scope of inquiry</span>
              </div>

              <div className="rounded-xl border bg-card p-3 shadow-card">
                <span className="text-[11px] text-muted-foreground">Invited Bidders</span>
                <p className="mt-1 font-mono text-lg font-bold text-primary">
                  {suppliersList.length || currentRfq.suppliers}{" "}
                  <span className="text-xs font-normal">vendors</span>
                </p>
                <span className="text-[10px] text-muted-foreground">Shortlisted suppliers</span>
              </div>

              <div className="rounded-xl border bg-card p-3 shadow-card">
                <span className="text-[11px] text-muted-foreground">Quotation Due</span>
                <p className="mt-1 text-xs font-bold text-foreground">
                  {currentRfq.expectedQuotationDate
                    ? formatDate(currentRfq.expectedQuotationDate)
                    : "Within 7 Days"}
                </p>
                <span className="text-[10px] text-muted-foreground">Submission deadline</span>
              </div>

              <div className="rounded-xl border bg-card p-3 shadow-card">
                <span className="text-[11px] text-muted-foreground">Delivery Required</span>
                <p className="mt-1 text-xs font-bold text-destructive">
                  {currentRfq.deliveryRequiredBy
                    ? formatDate(currentRfq.deliveryRequiredBy)
                    : "Target Schedule"}
                </p>
                <span className="text-[10px] text-muted-foreground">Site need date</span>
              </div>
            </div>

            {/* DRAFT STATE ACTION BANNER */}
            {currentRfq.status === "Draft" && (
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Clock className="size-4 text-amber-600 shrink-0" />
                  <div>
                    <p className="font-semibold text-foreground">RFQ Status: Draft</p>
                    <p className="text-[11px] text-muted-foreground">
                      This quotation request is saved as a draft. Click Send RFQ to dispatch
                      inquiries to invited vendors.
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  className="h-8 gap-1.5 text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                  onClick={handleSendRfq}
                >
                  <Send className="size-3.5" /> Send RFQ to Suppliers
                </Button>
              </div>
            )}

            {/* 1. INVITED SUPPLIERS TABLE */}
            <div className="rounded-xl border bg-card p-4 shadow-card">
              <div className="flex items-center justify-between border-b pb-2.5">
                <div className="flex items-center gap-2">
                  <Users className="size-4 text-primary" />
                  <h3 className="text-sm font-semibold">
                    Invited Vendors & Bidders ({suppliersList.length})
                  </h3>
                </div>
                <span className="text-xs text-muted-foreground">Empaneled Tier-1 Vendors</span>
              </div>

              <div className="mt-3 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                {suppliersList.map((sup) => (
                  <div key={sup.id} className="rounded-lg border p-3 text-xs bg-surface/30">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-foreground">{sup.name}</p>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {sup.category && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                            {sup.category}
                          </Badge>
                        )}
                        <span className="font-mono text-[10px] text-muted-foreground">
                          {sup.code}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 text-[11px] text-muted-foreground space-y-0.5">
                      <p>Contact: {sup.contactPerson}</p>
                      <p className="truncate">Email: {sup.email}</p>
                      <p>Phone: {sup.phone}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 1.5 SUPPLIER RESPONSES / QUOTATIONS RECEIVED */}
            <div className="rounded-xl border bg-card p-4 shadow-card">
              <div className="flex items-center justify-between border-b pb-2.5">
                <div className="flex items-center gap-2">
                  <FileCheck2 className="size-4 text-primary" />
                  <h3 className="text-sm font-semibold text-foreground">
                    Supplier Responses ({receivedQuotes.length} Received)
                  </h3>
                </div>
                <span className="text-xs text-muted-foreground">
                  {suppliersList.length} Suppliers Invited • {receivedQuotes.length} Quotations
                  Received
                </span>
              </div>

              {receivedQuotes.length === 0 ? (
                <div className="py-6 text-center text-xs text-muted-foreground">
                  <Clock className="size-6 mx-auto mb-1.5 text-muted-foreground/50" />
                  <p className="font-medium">No supplier quotations received yet</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Quotations floated to vendors will appear here upon submission.
                  </p>
                </div>
              ) : (
                <div className="mt-3 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                  {receivedQuotes.map((quote) => {
                    const rank = quote.commercialEvaluation?.rank;
                    return (
                      <div
                        key={quote.id}
                        className="rounded-lg border p-3 text-xs bg-muted/20 flex flex-col justify-between hover:border-primary/40 transition-colors"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-start justify-between gap-1.5">
                            <p className="font-semibold text-foreground leading-tight">
                              {quote.supplierName}
                            </p>
                            {rank && (
                              <Badge
                                variant="outline"
                                className={`text-[10px] px-1.5 py-0 font-bold shrink-0 ${
                                  rank === "L1"
                                    ? "bg-emerald-500/15 text-emerald-600 border-emerald-500/30"
                                    : "bg-blue-500/15 text-blue-600 border-blue-500/30"
                                }`}
                              >
                                {rank}
                              </Badge>
                            )}
                          </div>

                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-mono text-primary font-medium">
                              {quote.quotationNo}
                            </span>
                            <StatusBadge value={quote.status} className="text-[10px] py-0 px-2" />
                          </div>

                          <div className="pt-1.5 border-t text-[11px] flex items-center justify-between">
                            <span className="text-muted-foreground">Quoted Value:</span>
                            <span className="font-bold font-mono text-foreground text-sm">
                              {formatINR(quote.grandTotal || quote.total || 0)}
                            </span>
                          </div>
                        </div>

                        <div className="mt-3 pt-2 border-t flex items-center justify-end">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs px-2 gap-1 text-primary hover:text-primary font-medium"
                            onClick={() => setSelectedQuote(quote)}
                          >
                            <Eye className="size-3.5" /> View Quotation
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 2. COMMERCIAL TERMS */}
            <div className="rounded-xl border bg-card p-4 shadow-card">
              <h3 className="text-sm font-semibold border-b pb-2 mb-3">
                Quotation & Delivery Terms
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="rounded-lg border p-2.5 bg-muted/20">
                  <span className="text-[11px] text-muted-foreground">Payment Terms</span>
                  <p className="font-semibold text-foreground mt-0.5">
                    {currentRfq.paymentTerms || "30 Days from GRN inspection"}
                  </p>
                </div>
                <div className="rounded-lg border p-2.5 bg-muted/20">
                  <span className="text-[11px] text-muted-foreground">Delivery Terms</span>
                  <p className="font-semibold text-foreground mt-0.5">
                    {currentRfq.deliveryTerms ||
                      "F.O.R. Site Store, inclusive of transit insurance"}
                  </p>
                </div>
                <div className="rounded-lg border p-2.5 bg-muted/20">
                  <span className="text-[11px] text-muted-foreground">Quotation Validity</span>
                  <p className="font-semibold text-foreground mt-0.5">
                    {currentRfq.quotationValidity || "30 Days from bid submission"}
                  </p>
                </div>
                <div className="rounded-lg border p-2.5 bg-muted/20">
                  <span className="text-[11px] text-muted-foreground">General Remarks / Notes</span>
                  <p className="font-semibold text-foreground mt-0.5">
                    {currentRfq.remarks ||
                      "Delivery required at site store as per approved project schedule."}
                  </p>
                </div>
              </div>
            </div>

            {/* 3. RFQ ITEMS TABLE */}
            <div className="rounded-xl border bg-card p-4 shadow-card">
              <div className="flex items-center justify-between border-b pb-2.5">
                <h3 className="text-sm font-semibold">RFQ Line Items ({itemsList.length})</h3>
                <span className="text-xs font-mono text-muted-foreground">
                  Total Qty: {formatNumber(totalQuantity)}
                </span>
              </div>

              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b bg-muted/40 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                      <th className="py-2.5 px-3 text-left">Item Code</th>
                      <th className="py-2.5 px-3 text-left min-w-[180px]">Material Description</th>
                      <th className="py-2.5 px-3 text-left">Category</th>
                      <th className="py-2.5 px-3 text-center">Unit</th>
                      <th className="py-2.5 px-3 text-right">Inquiry Qty</th>
                      <th className="py-2.5 px-3 text-left min-w-[150px]">
                        Specifications / Remarks
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {itemsList.map((it, idx) => (
                      <tr key={it.id ?? idx} className="hover:bg-muted/30">
                        <td className="py-2.5 px-3 font-mono font-medium text-foreground">
                          {it.itemCode}
                        </td>
                        <td className="py-2.5 px-3">
                          <p className="font-semibold text-foreground">{it.item}</p>
                          <p className="text-[11px] text-muted-foreground line-clamp-1">
                            {it.itemDescription}
                          </p>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                            {it.category}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center text-muted-foreground">{it.unit}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-foreground">
                          {formatNumber(it.quantity)}
                        </td>
                        <td className="py-2.5 px-3 text-[11px] text-muted-foreground">
                          {it.remarks || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* STICKY FOOTER */}
          <div className="sticky bottom-0 z-20 flex items-center justify-between border-t bg-card px-5 py-3 shadow-md">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {currentRfq.sourceIndent && (
                <span>
                  Source Indent:{" "}
                  <strong className="text-foreground">{currentRfq.sourceIndent}</strong>
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={onClose} className="h-8 text-xs">
                Close
              </Button>
              {currentRfq.status === "Draft" && (
                <Button
                  size="sm"
                  className="h-8 gap-1.5 text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                  onClick={handleSendRfq}
                >
                  <Send className="size-3.5" /> Send RFQ to Suppliers
                </Button>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* QUOTATION DETAIL DRAWER */}
      <QuotationDetailDrawer
        quotation={selectedQuote}
        open={Boolean(selectedQuote)}
        onClose={() => setSelectedQuote(null)}
        onUpdateQuotation={(updated) => {
          setSelectedQuote(updated);
        }}
      />
    </>
  );
}
