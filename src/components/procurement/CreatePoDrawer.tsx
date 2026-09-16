import { useState, useEffect, useMemo } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  FileCheck2,
  Lock,
  Building2,
  MapPin,
  Calendar,
  Layers,
  Send,
  Save,
  ShieldCheck,
  Percent,
  Truck,
  FileText,
} from "lucide-react";
import { formatINR } from "@/utils/format";
import { poService } from "@/services/poService";
import { comparativeService } from "@/services/comparativeService";
import type {
  ComparativeStatement,
  PurchaseOrder,
  PoType,
  PoLineItem,
  PoCommercialTerms,
  PoDeliveryScheduleItem,
} from "@/types";

interface CreatePoDrawerProps {
  open: boolean;
  onClose: () => void;
  sourceComparative?: ComparativeStatement | null;
  initialPo?: PurchaseOrder | null;
  onPoCreated?: (newPo: PurchaseOrder) => void;
  onPoUpdated?: (updatedPo: PurchaseOrder) => void;
}

export function CreatePoDrawer({
  open,
  onClose,
  sourceComparative: propComparative,
  initialPo,
  onPoCreated,
  onPoUpdated,
}: CreatePoDrawerProps) {
  const isEditMode = Boolean(initialPo);

  // Active comparative statement
  const activeComparative = useMemo(() => {
    if (propComparative) return propComparative;
    const defaultCs = comparativeService.getComparativeByNo("CS/26-27/001");
    return defaultCs || comparativeService.getComparatives()[0] || null;
  }, [propComparative]);

  // Pre-populated Header State
  const [poNo, setPoNo] = useState("");
  const [poDate, setPoDate] = useState(new Date().toISOString().slice(0, 10));
  const [deliveryDate, setDeliveryDate] = useState("2026-10-15");
  const [poType, setPoType] = useState<PoType>("Material");
  const [currency] = useState("INR");
  const [remarks, setRemarks] = useState(
    "Contract order against approved techno-commercial comparative statement.",
  );

  // GST State: Intra-State (CGST + SGST) vs Inter-State (IGST)
  const [taxType, setTaxType] = useState<"intrastate" | "interstate">("intrastate");

  // Commercial Terms State (9 required fields)
  const [paymentTerms, setPaymentTerms] = useState(
    "30 days net from receipt of material and verified invoice",
  );
  const [deliveryTerms, setDeliveryTerms] = useState("FOR Site (Main Plot Site, Baner, Pune)");
  const [freight, setFreight] = useState("Included in quoted unit rates");
  const [insurance, setInsurance] = useState(
    "Transit insurance covered under supplier transit policy",
  );
  const [loadingUnloading, setLoadingUnloading] = useState(
    "Unloading at site by buyer; loading at plant by seller",
  );
  const [taxesTerm, setTaxesTerm] = useState(
    "GST 18% extra as applicable with RERA ITC eligibility",
  );
  const [warranty, setWarranty] = useState(
    "12 Months standard manufacturer defect warranty from delivery",
  );
  const [penaltyLd, setPenaltyLd] = useState(
    "0.5% per week of delayed dispatch capped at 5% of PO basic value",
  );
  const [otherTerms, setOtherTerms] = useState(
    "Manufacturer test certificates (MTC) conforming to IS standard must accompany each consignment",
  );

  // Line items state (14 required columns)
  const [items, setItems] = useState<PoLineItem[]>([]);
  const [otherCharges, setOtherCharges] = useState<number>(0);
  const [poDiscount, setPoDiscount] = useState<number>(0);

  // Reset or pre-populate whenever drawer opens, initialPo changes, or activeComparative changes
  useEffect(() => {
    if (!open) return;

    if (initialPo) {
      // Edit Draft Mode
      setPoNo(initialPo.poNo);
      setPoDate(initialPo.date);
      setDeliveryDate(initialPo.deliveryDate || "2026-10-15");
      setPoType(initialPo.poType || "Material");
      setRemarks(initialPo.remarks || "");
      setOtherCharges(initialPo.otherCharges || 0);
      setPoDiscount(initialPo.discount || 0);

      const isInter = Boolean(initialPo.igst && initialPo.igst > 0);
      setTaxType(isInter ? "interstate" : "intrastate");

      if (initialPo.commercialTerms) {
        setPaymentTerms(initialPo.commercialTerms.paymentTerms || "");
        setDeliveryTerms(initialPo.commercialTerms.deliveryTerms || "");
        setFreight(initialPo.commercialTerms.freight || "");
        setInsurance(initialPo.commercialTerms.insurance || "");
        setLoadingUnloading(initialPo.commercialTerms.loadingUnloading || "");
        setTaxesTerm(initialPo.commercialTerms.taxes || "");
        setWarranty(initialPo.commercialTerms.warranty || "");
        setPenaltyLd(initialPo.commercialTerms.penaltyLd || "");
        setOtherTerms(initialPo.commercialTerms.otherTerms || "");
      }

      setItems(initialPo.items || []);
      return;
    }

    // New PO Mode: Generate new PO number
    setPoNo(poService.getNextPoNumber());
    setPoDate(new Date().toISOString().slice(0, 10));
    setDeliveryDate("2026-10-15");
    setPoType("Material");
    setRemarks("Contract order against approved techno-commercial comparative statement.");
    setTaxType("intrastate");
    setOtherCharges(0);
    setPoDiscount(0);

    if (activeComparative) {
      const compItems: PoLineItem[] = activeComparative.items.map((ci, idx) => {
        const approvedQty = ci.approvedQty || 100;
        const rate = ci.negotiatedRate || ci.recommendedSupplierRate || 500;
        const discountAmount = 0;
        const taxable = approvedQty * rate - discountAmount;
        const gstPct = 18;
        const totalGst = Math.round((taxable * gstPct) / 100);
        const cgst = Math.round(totalGst / 2);
        const sgst = totalGst - cgst;

        return {
          id: `poi-draft-${idx + 1}`,
          itemCode: ci.itemCode,
          itemDescription: ci.itemDescription,
          category: ci.category,
          unit: ci.unit,
          approvedQty,
          poQty: approvedQty, // defaults to approved qty; editable
          rate, // defaults to selected supplier negotiated rate; editable
          discountPct: 0,
          discountAmount,
          taxableAmount: taxable,
          gstPct,
          cgstAmount: cgst,
          sgstAmount: sgst,
          igstAmount: 0,
          gstAmount: totalGst,
          lineTotal: taxable + totalGst,
          deliveryDate: "2026-10-15",
          deliveryLocation: `${activeComparative.siteName} Central Godown`,
          remarks: `IS standard conforming batch report required`,
        };
      });

      setItems(compItems);
    }
  }, [open, initialPo, activeComparative]);

  // Derived calculation updater for items
  function updateItem(index: number, patch: Partial<PoLineItem>) {
    setItems((prev) =>
      prev.map((it, idx) => {
        if (idx !== index) return it;
        const merged = { ...it, ...patch };
        const poQty = merged.poQty >= 0 ? merged.poQty : it.poQty;
        const rate = merged.rate >= 0 ? merged.rate : it.rate;
        const discountAmount = (merged.discountAmount ?? 0) >= 0 ? (merged.discountAmount ?? 0) : (it.discountAmount || 0);
        const lineBasic = poQty * rate;
        const taxable = Math.max(0, lineBasic - discountAmount);
        const gstPct = merged.gstPct ?? it.gstPct ?? 18;
        const totalGst = Math.round((taxable * gstPct) / 100);
        const isInterState = taxType === "interstate";
        const cgst = isInterState ? 0 : Math.round(totalGst / 2);
        const sgst = isInterState ? 0 : totalGst - cgst;
        const igst = isInterState ? totalGst : 0;

        return {
          ...merged,
          poQty,
          rate,
          discountAmount,
          taxableAmount: taxable,
          gstPct,
          cgstAmount: cgst,
          sgstAmount: sgst,
          igstAmount: igst,
          gstAmount: totalGst,
          lineTotal: taxable + totalGst,
        };
      }),
    );
  }

  // Handle Tax Type change (Intra vs Inter-State)
  function handleTaxTypeChange(newType: "intrastate" | "interstate") {
    setTaxType(newType);
    setItems((prev) =>
      prev.map((it) => {
        const isInter = newType === "interstate";
        const cgst = isInter ? 0 : Math.round(it.gstAmount / 2);
        const sgst = isInter ? 0 : it.gstAmount - cgst;
        const igst = isInter ? it.gstAmount : 0;
        return {
          ...it,
          cgstAmount: cgst,
          sgstAmount: sgst,
          igstAmount: igst,
        };
      }),
    );
  }

  // Summary Totals Calculation
  const totals = useMemo(() => {
    const basicValue = items.reduce((s, it) => s + it.poQty * it.rate, 0);
    const itemDiscount = items.reduce((s, it) => s + (it.discountAmount || 0), 0);
    const overallDiscount = poDiscount || 0;
    const totalDiscount = itemDiscount + overallDiscount;
    const taxableValue = items.reduce((s, it) => s + it.taxableAmount, 0);
    const cgst = items.reduce((s, it) => s + (it.cgstAmount || 0), 0);
    const sgst = items.reduce((s, it) => s + (it.sgstAmount || 0), 0);
    const igst = items.reduce((s, it) => s + (it.igstAmount || 0), 0);
    const totalGst = cgst + sgst + igst;
    const rawGrandTotal = taxableValue + totalGst + otherCharges - overallDiscount;
    const grandTotal = Math.round(rawGrandTotal);
    const roundOff = Math.round((grandTotal - rawGrandTotal) * 100) / 100;

    return {
      basicValue,
      discount: totalDiscount,
      taxableValue,
      cgst,
      sgst,
      igst,
      totalGst,
      otherCharges,
      roundOff,
      grandTotal,
    };
  }, [items, otherCharges, poDiscount]);

  function handleSave(status: "Draft" | "Pending Approval") {
    const commercialTermsObj: PoCommercialTerms = {
      paymentTerms,
      deliveryTerms,
      freight,
      insurance,
      loadingUnloading,
      taxes: taxesTerm,
      warranty,
      penaltyLd,
      otherTerms,
    };

    const deliverySchedule: PoDeliveryScheduleItem[] = items.map((it, idx) => ({
      id: `ds-${idx + 1}`,
      itemCode: it.itemCode,
      itemDescription: it.itemDescription,
      quantity: it.poQty,
      unit: it.unit,
      deliveryDate: it.deliveryDate || deliveryDate,
      deliveryLocation: it.deliveryLocation || `${activeComparative?.siteName || "Site"} Godown`,
      remarks: it.remarks || "Batch dispatch",
    }));

    if (isEditMode && initialPo) {
      // Update existing draft PO
      const updated = poService.updatePurchaseOrder(initialPo.id, {
        poType,
        deliveryDate,
        paymentTerms,
        deliveryTerms,
        warrantyTerms: warranty,
        remarks,
        items,
        commercialTerms: commercialTermsObj,
        deliverySchedule,
        otherCharges,
        discount: totals.discount,
        status,
      });

      if (updated) {
        toast.success(
          status === "Draft"
            ? `Purchase Order ${updated.poNo} updated successfully!`
            : `Purchase Order ${updated.poNo} submitted for multi-level approval!`,
        );
        onPoUpdated?.(updated);
        onClose();
      }
      return;
    }

    // Create New PO pre-populated from approved comparative
    const newPo = poService.createPurchaseOrder({
      poNo,
      date: poDate,
      status,
      poType,
      currency,
      deliveryDate,
      paymentTerms,
      deliveryTerms,
      warrantyTerms: warranty,
      remarks,

      sourceComparativeNo: activeComparative?.csNo || "CS/26-27/001",
      sourceRFQNumber: activeComparative?.sourceRFQNumber || "RFQ/26-27/330",
      sourceIndentNumber: activeComparative?.sourceIndentNumber || "IND/26-27/1041",
      projectId: activeComparative?.projectId || "p9",
      projectName: activeComparative?.projectName || "Baner Gateway Signature Suites",
      siteName: activeComparative?.siteName || "Main Plot Site",

      // Strictly locked supplier details
      supplierId: activeComparative?.recommendedSupplierId || "ven-1",
      supplierName: activeComparative?.recommendedSupplierName || "ABC Cement Suppliers",
      supplierCode: activeComparative?.recommendedSupplierCode || "VEN-001",
      contactPerson: "Rajesh Nair",
      phone: "+91 98231 44550",
      email: "sales@abccement.com",
      billingAddress: "Plot No. 42, Bhosari Industrial Area, Pune, Maharashtra 411026",
      gstin: "27AACCA1234M1Z2",
      pan: "AACCA1234M",

      items,
      commercialTerms: commercialTermsObj,
      deliverySchedule,
      otherCharges,
      discount: totals.discount,
      igst: taxType === "interstate" ? totals.totalGst : 0,
    });

    toast.success(
      status === "Draft"
        ? `Purchase Order ${newPo.poNo} saved as Draft`
        : `Purchase Order ${newPo.poNo} submitted for multi-level approval!`,
      {
        description: `Pre-populated from ${activeComparative?.csNo || "CS/26-27/001"} with supplier ${newPo.supplierName}. Upstream transactions remain intact.`,
      },
    );

    onPoCreated?.(newPo);
    onClose();
  }

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-5xl p-0 flex flex-col gap-0 border-l bg-background shadow-2xl overflow-hidden"
      >
        {/* HEADER STRIP */}
        <SheetHeader className="px-6 py-4 border-b bg-card text-card-foreground shrink-0">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <SheetTitle className="text-xl font-bold font-mono tracking-tight text-foreground">
                  {isEditMode ? `Edit Purchase Order ${poNo}` : "Create Purchase Order"}
                </SheetTitle>
                <Badge
                  variant="outline"
                  className="bg-primary/10 text-primary border-primary/25 text-xs font-semibold"
                >
                  {poType} PO
                </Badge>
                {isEditMode && (
                  <Badge variant="secondary" className="text-xs bg-amber-500/10 text-amber-600 border-amber-500/20">
                    Draft Revision
                  </Badge>
                )}
              </div>
              <SheetDescription className="text-xs text-muted-foreground mt-0.5">
                Generate contractual purchase order from approved techno-commercial comparative statement.
              </SheetDescription>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="font-mono text-xs px-2.5 py-1 font-bold">
                {poNo}
              </Badge>
            </div>
          </div>

          {/* Traceability Reference Strip (Section 2 & 11) */}
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t text-[11px] text-muted-foreground bg-muted/20 p-2 rounded">
            <div className="flex items-center gap-1.5 truncate">
              <FileCheck2 className="size-3.5 text-primary shrink-0" />
              <span className="truncate">
                Source Comparative:{" "}
                <strong className="text-foreground font-mono">
                  {activeComparative?.csNo || "CS/26-27/001"}
                </strong>
              </span>
            </div>
            <div className="flex items-center gap-1.5 truncate">
              <FileCheck2 className="size-3.5 text-primary shrink-0" />
              <span className="truncate">
                Source RFQ:{" "}
                <strong className="text-foreground font-mono">
                  {activeComparative?.sourceRFQNumber || "RFQ/26-27/330"}
                </strong>
              </span>
            </div>
            <div className="flex items-center gap-1.5 truncate">
              <FileCheck2 className="size-3.5 text-primary shrink-0" />
              <span className="truncate">
                Source Indent:{" "}
                <strong className="text-foreground font-mono">
                  {activeComparative?.sourceIndentNumber || "IND/26-27/1041"}
                </strong>
              </span>
            </div>
          </div>
        </SheetHeader>

        {/* SCROLLABLE FORM BODY */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* 1. LOCKED SUPPLIER INFORMATION & SITE (Section 4) */}
          <div className="rounded-xl border bg-card p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-emerald-600" />
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Supplier Master Details & Site Location
                </h4>
              </div>
              <Badge
                variant="outline"
                className="bg-emerald-500/10 text-emerald-600 border-emerald-500/25 text-[11px] flex items-center gap-1 font-medium"
              >
                <Lock className="size-3" /> Locked to Approved Recommended Supplier
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Supplier Master Info Card */}
              <div className="space-y-1.5 text-xs">
                <Label className="text-xs text-muted-foreground">Contracted Supplier (Master Record)</Label>
                <div className="p-3 rounded-md border bg-muted/30 flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="font-bold text-foreground text-sm block">
                      {activeComparative?.recommendedSupplierName || "ABC Cement Suppliers"}
                    </span>
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                      <span>Code: <strong className="font-mono text-foreground">{activeComparative?.recommendedSupplierCode || "VEN-001"}</strong></span>
                      <span>•</span>
                      <span>GSTIN: <strong className="font-mono text-foreground">27AACCA1234M1Z2</strong></span>
                      <span>•</span>
                      <span>PAN: <strong className="font-mono text-foreground">AACCA1234M</strong></span>
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      Contact: <span className="font-medium text-foreground">Rajesh Nair</span> • Ph: +91 98231 44550 • Email: sales@abccement.com
                    </div>
                    <div className="text-[10px] text-muted-foreground pt-0.5">
                      Billing Address: Plot No. 42, Bhosari Industrial Area, Pune, Maharashtra 411026
                    </div>
                  </div>
                  <Lock className="size-4 text-muted-foreground/60 shrink-0 mt-1" />
                </div>
              </div>

              {/* Project & Delivery Site Info */}
              <div className="space-y-1.5 text-xs">
                <Label className="text-xs text-muted-foreground">Project & Delivery Site</Label>
                <div className="p-3 rounded-md border bg-muted/30 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-foreground font-semibold">
                    <Building2 className="size-4 text-primary shrink-0" />
                    <span>{activeComparative?.projectName || "Baner Gateway Signature Suites"}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
                    <MapPin className="size-4 text-primary shrink-0" />
                    <span>{activeComparative?.siteName || "Main Plot Site, Baner, Pune"}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t text-[11px] text-muted-foreground">
                    <span>Destination State: <strong>27 (Maharashtra)</strong></span>
                    <div className="flex items-center gap-1">
                      <Label className="text-[10px] uppercase font-semibold">GST Mode:</Label>
                      <Select value={taxType} onValueChange={(v) => handleTaxTypeChange(v as "intrastate" | "interstate")}>
                        <SelectTrigger className="h-6 text-[10px] w-36">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="intrastate">Intra-State (CGST+SGST)</SelectItem>
                          <SelectItem value="interstate">Inter-State (IGST)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. PO HEADER CONFIGURATION (Section 3) */}
          <div className="rounded-xl border bg-card p-4 shadow-xs space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              PO Header General Details & Commitments
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div className="space-y-1">
                <Label className="text-xs">PO Number</Label>
                <Input
                  className="h-8 text-xs font-mono font-bold"
                  value={poNo}
                  onChange={(e) => setPoNo(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">PO Date</Label>
                <div className="relative">
                  <Calendar className="size-3.5 text-muted-foreground absolute left-2.5 top-2.5" />
                  <Input
                    type="date"
                    className="h-8 pl-8 text-xs"
                    value={poDate}
                    onChange={(e) => setPoDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Delivery Required By</Label>
                <div className="relative">
                  <Calendar className="size-3.5 text-muted-foreground absolute left-2.5 top-2.5" />
                  <Input
                    type="date"
                    className="h-8 pl-8 text-xs"
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">PO Type</Label>
                <Select value={poType} onValueChange={(v) => setPoType(v as PoType)}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Material">Material</SelectItem>
                    <SelectItem value="Service">Service</SelectItem>
                    <SelectItem value="Subcontract">Subcontract</SelectItem>
                    <SelectItem value="Asset">Asset</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Header Remarks / Special Instructions</Label>
              <Input
                className="h-8 text-xs"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Enter special order instructions or references..."
              />
            </div>
          </div>

          {/* 3. TABS: ITEMS TABLE, COMMERCIAL TERMS, DELIVERY SCHEDULE */}
          <Tabs defaultValue="items" className="w-full">
            <TabsList className="grid w-full grid-cols-3 h-9">
              <TabsTrigger value="items" className="text-xs gap-1.5">
                <Layers className="size-3.5" /> PO Items & Indian GST ({items.length})
              </TabsTrigger>
              <TabsTrigger value="terms" className="text-xs gap-1.5">
                <FileText className="size-3.5" /> Commercial Terms (9 Clauses)
              </TabsTrigger>
              <TabsTrigger value="delivery" className="text-xs gap-1.5">
                <Truck className="size-3.5" /> Delivery Schedule
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: 14-COLUMN PO ITEMS TABLE (Section 5) */}
            <TabsContent value="items" className="space-y-3 pt-2">
              <div className="rounded-xl border overflow-x-auto shadow-xs">
                <table className="w-full text-left text-xs border-collapse min-w-[1000px]">
                  <thead>
                    <tr className="border-b bg-muted/40 font-semibold text-[11px] text-muted-foreground">
                      <th className="p-2.5 w-10 text-center">#</th>
                      <th className="p-2.5 w-24">Item Code</th>
                      <th className="p-2.5 min-w-[180px]">Description & Category</th>
                      <th className="p-2.5 text-center w-14">Unit</th>
                      <th className="p-2.5 text-center w-20">Approved Qty</th>
                      <th className="p-2.5 text-center w-24">PO Qty</th>
                      <th className="p-2.5 text-right w-24">Rate (₹)</th>
                      <th className="p-2.5 text-right w-20">Discount (₹)</th>
                      <th className="p-2.5 text-right w-28">Taxable Amt (₹)</th>
                      <th className="p-2.5 text-center w-16">GST %</th>
                      <th className="p-2.5 text-right w-24">GST Amt (₹)</th>
                      <th className="p-2.5 text-right w-28">Total Amt (₹)</th>
                      <th className="p-2.5 w-28">Delivery Date</th>
                      <th className="p-2.5 min-w-[140px]">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-xs">
                    {items.map((it, idx) => (
                      <tr key={idx} className="hover:bg-muted/20 transition-colors">
                        <td className="p-2.5 text-center text-muted-foreground">{idx + 1}</td>
                        <td className="p-2.5 font-mono font-bold text-primary">{it.itemCode}</td>
                        <td className="p-2.5">
                          <span className="font-semibold text-foreground block line-clamp-1">
                            {it.itemDescription}
                          </span>
                          <span className="text-[10px] text-muted-foreground block">
                            {it.category}
                          </span>
                        </td>
                        <td className="p-2.5 text-center text-muted-foreground font-medium">{it.unit}</td>
                        <td className="p-2.5 text-center text-muted-foreground font-medium">
                          {it.approvedQty}
                        </td>
                        <td className="p-2.5">
                          <Input
                            type="number"
                            className="h-7 text-center text-xs font-bold w-20 mx-auto"
                            value={it.poQty}
                            onChange={(e) => updateItem(idx, { poQty: Math.max(0, parseFloat(e.target.value) || 0) })}
                            min={0}
                          />
                        </td>
                        <td className="p-2.5">
                          <Input
                            type="number"
                            className="h-7 text-right text-xs font-mono w-22 ml-auto"
                            value={it.rate}
                            onChange={(e) => updateItem(idx, { rate: Math.max(0, parseFloat(e.target.value) || 0) })}
                            min={0}
                          />
                        </td>
                        <td className="p-2.5">
                          <Input
                            type="number"
                            className="h-7 text-right text-xs font-mono w-18 ml-auto"
                            value={it.discountAmount || 0}
                            onChange={(e) => updateItem(idx, { discountAmount: Math.max(0, parseFloat(e.target.value) || 0) })}
                            min={0}
                          />
                        </td>
                        <td className="p-2.5 text-right font-mono font-semibold">
                          {formatINR(it.taxableAmount)}
                        </td>
                        <td className="p-2.5 text-center">
                          <select
                            className="h-7 text-xs border rounded bg-background px-1 font-mono text-center"
                            value={it.gstPct}
                            onChange={(e) => updateItem(idx, { gstPct: parseFloat(e.target.value) || 0 })}
                          >
                            <option value={18}>18%</option>
                            <option value={28}>28%</option>
                            <option value={12}>12%</option>
                            <option value={5}>5%</option>
                            <option value={0}>0%</option>
                          </select>
                        </td>
                        <td className="p-2.5 text-right font-mono text-muted-foreground">
                          {formatINR(it.gstAmount)}
                        </td>
                        <td className="p-2.5 text-right font-mono font-bold text-foreground">
                          {formatINR(it.lineTotal)}
                        </td>
                        <td className="p-2.5">
                          <Input
                            type="date"
                            className="h-7 text-[10px] w-26"
                            value={it.deliveryDate}
                            onChange={(e) => updateItem(idx, { deliveryDate: e.target.value })}
                          />
                        </td>
                        <td className="p-2.5">
                          <Input
                            className="h-7 text-[11px] min-w-[120px]"
                            value={it.remarks || ""}
                            onChange={(e) => updateItem(idx, { remarks: e.target.value })}
                            placeholder="Line remarks..."
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* INDIAN GST & FINANCIAL TOTALS BREAKDOWN (Section 5) */}
              <div className="rounded-xl border bg-card p-4 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b pb-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Percent className="size-3.5 text-primary" /> Indian GST & Commercial Landed Totals
                  </h4>
                  <Badge variant="secondary" className="text-[10px] font-mono">
                    {taxType === "intrastate"
                      ? "CGST (9%) + SGST (9%) Intra-State"
                      : "IGST (18%) Inter-State"}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
                  <div className="p-2.5 rounded-lg border bg-muted/20">
                    <span className="text-muted-foreground block text-[11px]">Basic Value</span>
                    <span className="text-sm font-bold text-foreground mt-0.5 block font-mono">
                      {formatINR(totals.basicValue)}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg border bg-muted/20">
                    <span className="text-muted-foreground block text-[11px]">Discount</span>
                    <span className="text-sm font-bold text-foreground mt-0.5 block font-mono">
                      {formatINR(totals.discount)}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg border bg-muted/20">
                    <span className="text-muted-foreground block text-[11px]">Taxable Value</span>
                    <span className="text-sm font-bold text-foreground mt-0.5 block font-mono">
                      {formatINR(totals.taxableValue)}
                    </span>
                  </div>

                  {taxType === "intrastate" ? (
                    <>
                      <div className="p-2.5 rounded-lg border bg-muted/20">
                        <span className="text-muted-foreground block text-[11px]">CGST (9%)</span>
                        <span className="text-sm font-bold text-foreground mt-0.5 block font-mono">
                          {formatINR(totals.cgst)}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-lg border bg-muted/20">
                        <span className="text-muted-foreground block text-[11px]">SGST (9%)</span>
                        <span className="text-sm font-bold text-foreground mt-0.5 block font-mono">
                          {formatINR(totals.sgst)}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="p-2.5 rounded-lg border bg-muted/20 col-span-2">
                      <span className="text-muted-foreground block text-[11px]">IGST (18%)</span>
                      <span className="text-sm font-bold text-foreground mt-0.5 block font-mono">
                        {formatINR(totals.igst)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2 text-xs border-t">
                  <div className="space-y-1">
                    <Label className="text-[11px] text-muted-foreground">Other Charges (Freight/Loading)</Label>
                    <Input
                      type="number"
                      className="h-8 text-xs font-mono"
                      value={otherCharges}
                      onChange={(e) => setOtherCharges(parseFloat(e.target.value) || 0)}
                      placeholder="₹0"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11px] text-muted-foreground">Overall Additional Discount</Label>
                    <Input
                      type="number"
                      className="h-8 text-xs font-mono"
                      value={poDiscount}
                      onChange={(e) => setPoDiscount(parseFloat(e.target.value) || 0)}
                      placeholder="₹0"
                    />
                  </div>

                  <div className="p-2 rounded-lg border bg-muted/15 flex flex-col justify-center">
                    <span className="text-[11px] text-muted-foreground">Round Off</span>
                    <span className="text-xs font-mono font-semibold text-foreground">
                      {totals.roundOff >= 0 ? `+₹${totals.roundOff}` : `-₹${Math.abs(totals.roundOff)}`}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg border bg-primary/10 border-primary/25 flex flex-col justify-center">
                    <span className="text-primary font-bold text-[11px]">Grand Total</span>
                    <span className="text-base font-extrabold text-foreground font-mono">
                      {formatINR(totals.grandTotal)}
                    </span>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* TAB 2: COMMERCIAL TERMS (Section 6 - 9 Clauses) */}
            <TabsContent value="terms" className="space-y-3 pt-2 text-xs">
              <div className="rounded-xl border bg-card p-4 shadow-xs space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Commercial Terms & Contract Clauses (Editable)
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">1. Payment Terms</Label>
                    <Input
                      className="h-8 text-xs"
                      value={paymentTerms}
                      onChange={(e) => setPaymentTerms(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">2. Delivery Terms</Label>
                    <Input
                      className="h-8 text-xs"
                      value={deliveryTerms}
                      onChange={(e) => setDeliveryTerms(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">3. Freight & Transportation</Label>
                    <Input
                      className="h-8 text-xs"
                      value={freight}
                      onChange={(e) => setFreight(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">4. Transit Insurance</Label>
                    <Input
                      className="h-8 text-xs"
                      value={insurance}
                      onChange={(e) => setInsurance(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">5. Loading / Unloading</Label>
                    <Input
                      className="h-8 text-xs"
                      value={loadingUnloading}
                      onChange={(e) => setLoadingUnloading(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">6. Taxes & Duties</Label>
                    <Input
                      className="h-8 text-xs"
                      value={taxesTerm}
                      onChange={(e) => setTaxesTerm(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t">
                  <div className="space-y-1">
                    <Label className="text-xs">7. Warranty Terms</Label>
                    <Input
                      className="h-8 text-xs"
                      value={warranty}
                      onChange={(e) => setWarranty(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">8. Penalty / Liquidated Damages (LD)</Label>
                    <Input
                      className="h-8 text-xs"
                      value={penaltyLd}
                      onChange={(e) => setPenaltyLd(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1 pt-1">
                  <Label className="text-xs">9. Other Terms & Special Conditions</Label>
                  <Textarea
                    className="text-xs min-h-[65px]"
                    value={otherTerms}
                    onChange={(e) => setOtherTerms(e.target.value)}
                  />
                </div>
              </div>
            </TabsContent>

            {/* TAB 3: DELIVERY SCHEDULE (Section 7) */}
            <TabsContent value="delivery" className="space-y-3 pt-2 text-xs">
              <div className="rounded-xl border bg-card p-4 shadow-xs space-y-3">
                <div className="flex items-center justify-between pb-1 border-b">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Truck className="size-3.5 text-primary" /> Item-Wise Delivery Schedule & Destination Location
                  </h4>
                  <span className="text-[11px] text-muted-foreground">
                    Synchronized with PO Items
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
                      {items.map((it, idx) => (
                        <tr key={idx} className="hover:bg-muted/20 transition-colors">
                          <td className="p-2.5 font-medium">
                            <span className="font-mono text-primary font-bold mr-1.5">{it.itemCode}</span>
                            {it.itemDescription}
                          </td>
                          <td className="p-2.5 text-center font-bold font-mono">
                            {it.poQty} {it.unit}
                          </td>
                          <td className="p-2.5">
                            <Input
                              type="date"
                              className="h-7 text-xs"
                              value={it.deliveryDate}
                              onChange={(e) => updateItem(idx, { deliveryDate: e.target.value })}
                            />
                          </td>
                          <td className="p-2.5">
                            <Input
                              className="h-7 text-xs"
                              value={it.deliveryLocation || `${activeComparative?.siteName || "Site"} Godown`}
                              onChange={(e) => updateItem(idx, { deliveryLocation: e.target.value })}
                            />
                          </td>
                          <td className="p-2.5">
                            <Input
                              className="h-7 text-xs"
                              value={it.remarks || ""}
                              onChange={(e) => updateItem(idx, { remarks: e.target.value })}
                              placeholder="Batch notes..."
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* FOOTER ACTIONS (Section 8) */}
        <SheetFooter className="p-4 border-t bg-card shrink-0 flex flex-row items-center justify-between sm:justify-between">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs"
              onClick={() => handleSave("Draft")}
            >
              <Save className="size-3.5" /> Save Draft
            </Button>
            <Button
              size="sm"
              className="gap-1.5 text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
              onClick={() => handleSave("Pending Approval")}
            >
              <Send className="size-3.5" /> Submit for Approval
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
