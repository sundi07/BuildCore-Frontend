import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/common/StatusBadge";
import {
  FileCheck2,
  Building2,
  MapPin,
  Calendar,
  CheckCircle2,
  Award,
  Layers,
  ArrowRight,
  ShieldCheck,
  Plus,
} from "lucide-react";
import { formatINR } from "@/utils/format";
import { comparativeService } from "@/services/comparativeService";
import { CreatePoDrawer } from "@/components/procurement/CreatePoDrawer";
import type { ComparativeStatement, PurchaseOrder } from "@/types";

export function ComparativeStatementPage() {
  const navigate = useNavigate();
  const [comparatives] = useState<ComparativeStatement[]>(() =>
    comparativeService.getComparatives(),
  );
  const [selectedCs] = useState<ComparativeStatement>(
    comparatives[0] || comparativeService.getComparatives()[0]!,
  );
  const [createPoOpen, setCreatePoOpen] = useState(false);

  const cs = selectedCs;
  const bids = cs.supplierBids;
  const items = cs.items;

  function handlePoCreated(newPo: PurchaseOrder) {
    comparativeService.markPoGenerated(cs.csNo, newPo.poNo);
    navigate(`/app/procurement/purchase-orders?po=${encodeURIComponent(newPo.poNo)}`);
  }

  return (
    <div className="space-y-5">
      {/* PAGE HEADER */}
      <PageHeader
        title="Comparative Statements"
        description="Techno-commercial bid comparison, supplier evaluation and contract recommendation."
        breadcrumbs={[
          { label: "Procurement & Purchase", to: "procurement" },
          { label: "Comparative Statements" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 text-xs text-primary"
              onClick={() => navigate(`/app/procurement/purchase-orders`)}
            >
              View Purchase Orders <ArrowRight className="size-3.5" />
            </Button>
            <Button
              size="sm"
              className="h-8 gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs"
              onClick={() => setCreatePoOpen(true)}
            >
              <Plus className="size-3.5" /> + Create Purchase Order
            </Button>
          </div>
        }
      />

      {/* CONNECTED WORKFLOW BAR */}
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
            const isCurrent = step === "Comparative Statement";
            const isCompleted = [
              "Indent",
              "Approval",
              "Enquiry / RFQ",
              "Supplier Quotation",
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

      {/* COMPARATIVE STATEMENT HERO CARD */}
      <div className="rounded-xl border bg-card p-5 shadow-sm space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-xl font-bold font-mono tracking-tight text-foreground">
                {cs.csNo}
              </span>
              <StatusBadge value={cs.status} />
              <Badge
                variant="outline"
                className="bg-emerald-500/10 text-emerald-600 border-emerald-500/25 text-xs font-semibold"
              >
                <CheckCircle2 className="size-3.5 mr-1" /> Approved by {cs.approvedBy}
              </Badge>
            </div>
            <p className="text-sm font-semibold text-foreground">{cs.title}</p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              className="gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 shadow-sm"
              onClick={() => setCreatePoOpen(true)}
            >
              <Plus className="size-4" /> + Create Purchase Order
            </Button>
          </div>
        </div>

        {/* Source References Chain */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 p-3 rounded-lg bg-muted/30 border text-xs">
          <div className="flex items-center gap-2">
            <Building2 className="size-4 text-primary shrink-0" />
            <div>
              <span className="text-[10px] text-muted-foreground uppercase block">Project</span>
              <span className="font-semibold text-foreground">{cs.projectName}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="size-4 text-primary shrink-0" />
            <div>
              <span className="text-[10px] text-muted-foreground uppercase block">
                Site Location
              </span>
              <span className="font-semibold text-foreground">{cs.siteName}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <FileCheck2 className="size-4 text-primary shrink-0" />
            <div>
              <span className="text-[10px] text-muted-foreground uppercase block">Source RFQ</span>
              <span className="font-mono font-semibold text-foreground">{cs.sourceRFQNumber}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="size-4 text-primary shrink-0" />
            <div>
              <span className="text-[10px] text-muted-foreground uppercase block">
                Source Indent
              </span>
              <span className="font-mono font-semibold text-foreground">
                {cs.sourceIndentNumber}
              </span>
            </div>
          </div>
        </div>

        {/* RECOMMENDED SUPPLIER BANNER */}
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Award className="size-5 text-emerald-600" />
              <div>
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
                  Recommended Supplier for PO Release:
                </span>
                <span className="text-base font-extrabold text-foreground">
                  {cs.recommendedSupplierName} ({cs.recommendedSupplierCode})
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-muted-foreground uppercase block">
                Lowest Landed Bid
              </span>
              <span className="text-base font-extrabold text-emerald-600 font-mono">
                ₹21.83 Lakhs
              </span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed pt-1 border-t border-emerald-500/20">
            {cs.recommendationRemarks}
          </p>
        </div>

        {/* 3-VENDOR COMPARISON MATRIX */}
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <ShieldCheck className="size-4 text-primary" /> Multi-Bidder Landed Cost Comparison (3
            Suppliers Evaluated)
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {bids.map((bid, idx) => (
              <div
                key={idx}
                className={`p-3.5 rounded-xl border transition-all ${
                  bid.isRecommended
                    ? "border-emerald-500/40 bg-emerald-500/5 shadow-xs ring-1 ring-emerald-500/20"
                    : "bg-card hover:bg-muted/20"
                }`}
              >
                <div className="flex items-center justify-between pb-2 border-b">
                  <Badge
                    variant="outline"
                    className={`font-mono text-[11px] font-bold ${
                      bid.rank === "L1"
                        ? "bg-emerald-500/15 text-emerald-600 border-emerald-500/30"
                        : "bg-blue-500/10 text-blue-600 border-blue-500/20"
                    }`}
                  >
                    {bid.rank} {bid.rank === "L1" ? "— Lowest Bidder" : ""}
                  </Badge>
                  {bid.isRecommended && (
                    <Badge
                      variant="secondary"
                      className="text-[10px] bg-emerald-600 text-white font-semibold"
                    >
                      Recommended
                    </Badge>
                  )}
                </div>
                <div className="pt-2 space-y-1">
                  <span className="font-bold text-xs text-foreground block">
                    {bid.supplierName}
                  </span>
                  <span className="text-[11px] text-muted-foreground block font-mono">
                    Quote: {bid.quotationNo} • Delivery: {bid.deliveryDays} Days
                  </span>
                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-[11px] text-muted-foreground">Landed Cost:</span>
                    <span className="text-sm font-extrabold text-foreground font-mono">
                      {formatINR(bid.landedCost)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* LINE ITEMS DETAIL TABLE */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Layers className="size-4 text-primary" /> Line Items Comparative Matrix
            </h4>
            <span className="text-xs text-muted-foreground font-mono">3 Requisition Items</span>
          </div>

          <div className="rounded-xl border overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[760px]">
              <thead>
                <tr className="border-b bg-muted/40 font-semibold text-[11px] text-muted-foreground">
                  <th className="p-2.5 w-12 text-center">#</th>
                  <th className="p-2.5">Item Code & Description</th>
                  <th className="p-2.5 text-center">Approved Qty</th>
                  <th className="p-2.5 text-right font-semibold text-emerald-600">
                    ABC Cement (L1)
                  </th>
                  <th className="p-2.5 text-right">Maharashtra Steel (L2)</th>
                  <th className="p-2.5 text-right">Shree Ganesh RMC (L3)</th>
                </tr>
              </thead>
              <tbody className="divide-y text-xs">
                {items.map((it, idx) => (
                  <tr key={idx} className="hover:bg-muted/20 transition-colors">
                    <td className="p-2.5 text-center text-muted-foreground">{idx + 1}</td>
                    <td className="p-2.5">
                      <span className="font-mono text-[10px] text-primary block font-bold">
                        {it.itemCode}
                      </span>
                      <span className="font-medium text-foreground block">
                        {it.itemDescription}
                      </span>
                      <span className="text-[10px] text-muted-foreground">{it.category}</span>
                    </td>
                    <td className="p-2.5 text-center font-bold text-foreground">
                      {it.approvedQty} {it.unit}
                    </td>
                    <td className="p-2.5 text-right font-mono font-bold text-emerald-600 bg-emerald-500/5">
                      ₹{it.rates["ven-1"]?.rate} / {it.unit}
                      <span className="block text-[10px] font-normal text-muted-foreground">
                        Total: {formatINR(it.rates["ven-1"]?.total || 0)}
                      </span>
                    </td>
                    <td className="p-2.5 text-right font-mono text-muted-foreground">
                      ₹{it.rates["ven-2"]?.rate} / {it.unit}
                      <span className="block text-[10px] text-muted-foreground">
                        Total: {formatINR(it.rates["ven-2"]?.total || 0)}
                      </span>
                    </td>
                    <td className="p-2.5 text-right font-mono text-muted-foreground">
                      ₹{it.rates["ven-3"]?.rate} / {it.unit}
                      <span className="block text-[10px] text-muted-foreground">
                        Total: {formatINR(it.rates["ven-3"]?.total || 0)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* CREATE PO DRAWER PRE-POPULATED FROM APPROVED COMPARATIVE */}
      <CreatePoDrawer
        open={createPoOpen}
        onClose={() => setCreatePoOpen(false)}
        sourceComparative={cs}
        onPoCreated={handlePoCreated}
      />
    </div>
  );
}
