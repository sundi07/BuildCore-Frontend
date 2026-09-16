import { useState, useMemo, useEffect } from "react";
import {
  Send,
  Save,
  X,
  Plus,
  Trash2,
  Building2,
  MapPin,
  Calendar,
  Layers,
  FileCheck2,
  CheckCircle2,
  AlertCircle,
  FileText,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { formatDate, formatINR, formatNumber } from "@/utils/format";
import { toast } from "sonner";
import { rfqService, empaneledSuppliers } from "@/services/rfqService";
import type { Indent, Enquiry, RfqSupplier, RfqItem } from "@/types";

interface CreateRfqDrawerProps {
  indent: Indent | null;
  open: boolean;
  onClose: () => void;
  onRfqCreated?: ((rfq: Enquiry) => void) | undefined;
}

export function CreateRfqDrawer({ indent, open, onClose, onRfqCreated }: CreateRfqDrawerProps) {
  // RFQ Fields State
  const [rfqNumber, setRfqNumber] = useState("RFQ/26-27/001");
  const [rfqDate, setRfqDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [expectedQuotationDate, setExpectedQuotationDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().slice(0, 10);
  });
  const [quotationValidity, setQuotationValidity] = useState("30 Days from submission");
  const [deliveryRequiredBy, setDeliveryRequiredBy] = useState("");
  const [paymentTerms, setPaymentTerms] = useState(
    "30 Days from receipt & inspection of materials (GRN)",
  );
  const [deliveryTerms, setDeliveryTerms] = useState(
    "F.O.R. Site Store, inclusive of transit insurance and unloading",
  );
  const [remarks, setRemarks] = useState("");

  // Suppliers State
  const [allSuppliers, setAllSuppliers] = useState<RfqSupplier[]>(() => [...empaneledSuppliers]);
  const [selectedSupplierIds, setSelectedSupplierIds] = useState<string[]>([
    "ven-1",
    "ven-2",
    "ven-3",
  ]);

  // Add Custom Supplier Modal
  const [addSupplierOpen, setAddSupplierOpen] = useState(false);
  const [newSupName, setNewSupName] = useState("");
  const [newSupCode, setNewSupCode] = useState("");
  const [newSupContact, setNewSupContact] = useState("");
  const [newSupEmail, setNewSupEmail] = useState("");
  const [newSupPhone, setNewSupPhone] = useState("");

  // Items State
  const [rfqItems, setRfqItems] = useState<RfqItem[]>([]);

  // Pre-populate when an approved indent is passed
  useEffect(() => {
    if (indent && open) {
      setRfqNumber(rfqService.getNextRfqNumber());
      setRfqDate(new Date().toISOString().slice(0, 10));
      setDeliveryRequiredBy(indent.requiredDate);
      setRemarks(`Procurement RFQ floated against approved Indent ${indent.indentNo}`);

      // Map indent items
      const items: RfqItem[] = indent.items.map((it, idx) => ({
        id: `rfq-it-${Date.now()}-${idx}`,
        itemCode: it.itemCode || `MAT-${101 + idx}`,
        item: it.item,
        itemDescription:
          it.itemDescription || `${it.item} conforming to approved construction specification`,
        category: it.category || "Civil",
        unit: it.unit,
        quantity: it.indentQty ?? it.quantity,
        rate: it.rate,
        remarks: it.remarks || "Delivery required at site store.",
      }));
      setRfqItems(items);

      // Default select first 3 suppliers
      setSelectedSupplierIds(["ven-1", "ven-2", "ven-3"]);
    }
  }, [indent, open]);

  if (!indent) return null;

  function toggleSupplier(supId: string) {
    setSelectedSupplierIds((prev) =>
      prev.includes(supId) ? prev.filter((id) => id !== supId) : [...prev, supId],
    );
  }

  function handleAddCustomSupplier() {
    if (!newSupName.trim()) {
      toast.error("Please enter a supplier name");
      return;
    }
    const newId = `ven-custom-${Date.now()}`;
    const newSup: RfqSupplier = {
      id: newId,
      name: newSupName.trim(),
      code: newSupCode.trim() || `VEN-${Math.floor(100 + Math.random() * 900)}`,
      contactPerson: newSupContact.trim() || "Sales Manager",
      email: newSupEmail.trim() || "orders@supplier.in",
      phone: newSupPhone.trim() || "+91 98000 00000",
    };

    setAllSuppliers((prev) => [...prev, newSup]);
    setSelectedSupplierIds((prev) => [...prev, newId]);
    setNewSupName("");
    setNewSupCode("");
    setNewSupContact("");
    setNewSupEmail("");
    setNewSupPhone("");
    setAddSupplierOpen(false);
    toast.success("Supplier added to RFQ selection list");
  }

  function handleItemQuantityChange(idx: number, newQty: number) {
    setRfqItems((prev) => {
      const next = [...prev];
      if (next[idx]) {
        next[idx] = { ...next[idx], quantity: Math.max(1, newQty) };
      }
      return next;
    });
  }

  function handleItemRemarksChange(idx: number, newRem: string) {
    setRfqItems((prev) => {
      const next = [...prev];
      if (next[idx]) {
        next[idx] = { ...next[idx], remarks: newRem };
      }
      return next;
    });
  }

  function handleRemoveItem(idx: number) {
    if (rfqItems.length <= 1) {
      toast.error("RFQ must contain at least 1 item");
      return;
    }
    setRfqItems((prev) => prev.filter((_, i) => i !== idx));
  }

  function handleSaveRfq(status: "Draft" | "Sent") {
    if (!indent) {
      toast.error("No source indent selected");
      return;
    }

    if (selectedSupplierIds.length === 0) {
      toast.error("Please select at least one supplier for the RFQ");
      return;
    }

    if (rfqItems.length === 0) {
      toast.error("RFQ must have at least one line item");
      return;
    }

    const selectedSuppliers = allSuppliers.filter((s) => selectedSupplierIds.includes(s.id));
    const totalQty = rfqItems.reduce((s, it) => s + it.quantity, 0);
    const primaryItem =
      rfqItems.length === 1
        ? rfqItems[0]!.item
        : `${rfqItems[0]!.item} + ${rfqItems.length - 1} more`;

    const newRfq = rfqService.createRfq({
      enquiryNo: rfqNumber,
      date: rfqDate,
      project: indent.project,
      site: indent.site,
      department: indent.department,
      sourceIndent: indent.indentNo,
      indentId: indent.id,
      item: primaryItem,
      quantity: totalQty,
      unit: rfqItems[0]?.unit || "Nos",
      suppliers: selectedSuppliers.length,
      responses: 0,
      sentDate: status === "Sent" ? rfqDate : undefined,
      expectedQuotationDate,
      quotationValidity,
      deliveryRequiredBy,
      paymentTerms,
      deliveryTerms,
      remarks,
      selectedSuppliers,
      items: rfqItems,
      status,
    });

    if (onRfqCreated) {
      onRfqCreated(newRfq);
    }

    if (status === "Sent") {
      toast.success(
        `RFQ ${newRfq.enquiryNo} sent to ${selectedSuppliers.length} suppliers successfully!`,
      );
    } else {
      toast.success(`RFQ ${newRfq.enquiryNo} saved as Draft in Enquiries repository.`);
    }

    onClose();
  }

  const selectedCount = selectedSupplierIds.length;

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
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-lg font-bold text-foreground sm:text-xl">
                    Create Request for Quotation (RFQ)
                  </span>
                  <span className="rounded bg-primary/10 px-2 py-0.5 font-mono text-xs font-semibold text-primary">
                    {rfqNumber}
                  </span>
                </div>
                <SheetDescription className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1 font-semibold text-foreground">
                    <FileCheck2 className="size-3.5 text-emerald-600" /> Source Indent:{" "}
                    {indent.indentNo}
                  </span>
                  <span className="flex items-center gap-1">
                    <Building2 className="size-3 text-primary" /> {indent.project}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="size-3 text-muted-foreground" /> {indent.site}
                  </span>
                  <span className="flex items-center gap-1">
                    <Layers className="size-3 text-muted-foreground" /> {indent.department}
                  </span>
                </SheetDescription>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={onClose} className="h-8 text-xs">
                  Cancel
                </Button>
              </div>
            </div>
          </div>

          {/* SCROLLABLE BODY */}
          <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
            {/* SOURCE INDENT HIGHLIGHT BANNER */}
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-900 dark:text-emerald-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                <span>
                  Floated against <strong>Approved Indent {indent.indentNo}</strong> for{" "}
                  <strong>{indent.project}</strong> ({indent.items.length} line items).
                </span>
              </div>
              <span className="text-[11px] font-mono text-muted-foreground">
                Required by: {formatDate(indent.requiredDate)}
              </span>
            </div>

            {/* 1. RFQ DETAILS & TERMS (Grid) */}
            <div className="rounded-xl border bg-card p-4 shadow-card space-y-3.5">
              <h3 className="text-sm font-semibold border-b pb-2">
                RFQ Parameters & Commercial Terms
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <Label htmlFor="rfq-no">RFQ Number</Label>
                  <Input
                    id="rfq-no"
                    value={rfqNumber}
                    onChange={(e) => setRfqNumber(e.target.value)}
                    className="mt-1 h-8 font-mono text-xs"
                  />
                </div>
                <div>
                  <Label htmlFor="rfq-dt">RFQ Date</Label>
                  <Input
                    id="rfq-dt"
                    type="date"
                    value={rfqDate}
                    onChange={(e) => setRfqDate(e.target.value)}
                    className="mt-1 h-8 text-xs"
                  />
                </div>
                <div>
                  <Label htmlFor="rfq-exp">Expected Quotation Date</Label>
                  <Input
                    id="rfq-exp"
                    type="date"
                    value={expectedQuotationDate}
                    onChange={(e) => setExpectedQuotationDate(e.target.value)}
                    className="mt-1 h-8 text-xs font-semibold text-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <Label htmlFor="rfq-del">Delivery Required By Date</Label>
                  <Input
                    id="rfq-del"
                    type="date"
                    value={deliveryRequiredBy}
                    onChange={(e) => setDeliveryRequiredBy(e.target.value)}
                    className="mt-1 h-8 text-xs text-destructive font-medium"
                  />
                </div>
                <div>
                  <Label htmlFor="rfq-val">Quotation Validity</Label>
                  <Input
                    id="rfq-val"
                    value={quotationValidity}
                    onChange={(e) => setQuotationValidity(e.target.value)}
                    className="mt-1 h-8 text-xs"
                  />
                </div>
                <div>
                  <Label htmlFor="rfq-pay">Payment Terms</Label>
                  <Input
                    id="rfq-pay"
                    value={paymentTerms}
                    onChange={(e) => setPaymentTerms(e.target.value)}
                    className="mt-1 h-8 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <Label htmlFor="rfq-term">Delivery Terms & Destination</Label>
                  <Input
                    id="rfq-term"
                    value={deliveryTerms}
                    onChange={(e) => setDeliveryTerms(e.target.value)}
                    className="mt-1 h-8 text-xs"
                  />
                </div>
                <div>
                  <Label htmlFor="rfq-rem">RFQ Notes & Instructions to Bidders</Label>
                  <Input
                    id="rfq-rem"
                    placeholder="Specific testing, warranty or freight instructions..."
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    className="mt-1 h-8 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* 2. SUPPLIER SELECTION */}
            <div className="rounded-xl border bg-card p-4 shadow-card">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-2.5">
                <div>
                  <h3 className="text-sm font-semibold">
                    Select Vendors / Suppliers ({selectedCount} Selected)
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Suppliers who will receive this enquiry and submit quotation bids
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs gap-1"
                  onClick={() => setAddSupplierOpen(true)}
                >
                  <Plus className="size-3" /> Add Supplier
                </Button>
              </div>

              <div className="mt-3 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                {allSuppliers.map((sup) => {
                  const isChecked = selectedSupplierIds.includes(sup.id);
                  return (
                    <div
                      key={sup.id}
                      onClick={() => toggleSupplier(sup.id)}
                      className={`cursor-pointer rounded-lg border p-3 text-xs transition-all ${
                        isChecked
                          ? "border-primary bg-primary/5 ring-1 ring-primary"
                          : "border-border hover:bg-muted/30"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={isChecked}
                            onCheckedChange={() => toggleSupplier(sup.id)}
                          />
                          <span className="font-semibold text-foreground leading-tight">
                            {sup.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
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
                      <div className="mt-2 text-[11px] text-muted-foreground space-y-0.5 pl-6">
                        <p>Contact: {sup.contactPerson}</p>
                        <p className="truncate">Email: {sup.email}</p>
                        <p>Phone: {sup.phone}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3. REQUISITION LINE ITEMS FROM INDENT */}
            <div className="rounded-xl border bg-card p-4 shadow-card">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-2.5">
                <div>
                  <h3 className="text-sm font-semibold">Enquiry Line Items ({rfqItems.length})</h3>
                  <p className="text-xs text-muted-foreground">
                    Items sourced from Indent {indent.indentNo}. You may adjust quantities or add
                    line remarks.
                  </p>
                </div>
                <span className="text-xs font-mono text-muted-foreground">
                  Total Items: {rfqItems.length}
                </span>
              </div>

              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b bg-muted/40 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                      <th className="py-2 px-2 text-left">Code</th>
                      <th className="py-2 px-2 text-left min-w-[180px]">Material Description</th>
                      <th className="py-2 px-2 text-left">Category</th>
                      <th className="py-2 px-2 text-center">Unit</th>
                      <th className="py-2 px-2 text-right w-[110px]">RFQ Qty</th>
                      <th className="py-2 px-2 text-left min-w-[160px]">Line Remarks</th>
                      <th className="py-2 px-2 text-center w-[40px]"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {rfqItems.map((item, idx) => (
                      <tr key={item.id ?? idx} className="hover:bg-muted/20">
                        <td className="py-2 px-2 font-mono font-medium text-foreground">
                          {item.itemCode}
                        </td>
                        <td className="py-2 px-2">
                          <p className="font-semibold text-foreground">{item.item}</p>
                          <p className="text-[10px] text-muted-foreground line-clamp-1">
                            {item.itemDescription}
                          </p>
                        </td>
                        <td className="py-2 px-2">
                          <span className="rounded bg-muted px-1.5 py-0.5 text-[10px]">
                            {item.category}
                          </span>
                        </td>
                        <td className="py-2 px-2 text-center text-muted-foreground">{item.unit}</td>
                        <td className="py-2 px-2 text-right">
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) =>
                              handleItemQuantityChange(idx, Number(e.target.value) || 1)
                            }
                            className="h-7 w-24 text-right font-mono text-xs"
                          />
                        </td>
                        <td className="py-2 px-2">
                          <Input
                            value={item.remarks ?? ""}
                            onChange={(e) => handleItemRemarksChange(idx, e.target.value)}
                            className="h-7 text-xs"
                            placeholder="e.g. Test certificate required"
                          />
                        </td>
                        <td className="py-2 px-2 text-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-6 text-muted-foreground hover:text-destructive"
                            onClick={() => handleRemoveItem(idx)}
                            title="Remove Line Item"
                          >
                            <Trash2 className="size-3" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* STICKY FOOTER ACTIONS */}
          <div className="sticky bottom-0 z-20 flex flex-wrap items-center justify-between gap-3 border-t bg-card px-5 py-3 shadow-md">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>
                Selected Suppliers: <strong className="text-foreground">{selectedCount}</strong>
              </span>
              <span>•</span>
              <span>
                Total Items: <strong className="text-foreground">{rfqItems.length}</strong>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={onClose} className="h-8 text-xs">
                Cancel
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1 text-xs"
                onClick={() => handleSaveRfq("Draft")}
              >
                <Save className="size-3.5" /> Save Draft
              </Button>
              <Button
                size="sm"
                className="h-8 gap-1 text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                onClick={() => handleSaveRfq("Sent")}
              >
                <Send className="size-3.5" /> Send RFQ to Suppliers
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* MODAL: ADD CUSTOM SUPPLIER */}
      <Dialog open={addSupplierOpen} onOpenChange={setAddSupplierOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Supplier to RFQ</DialogTitle>
            <DialogDescription>
              Enter vendor contact details to include in this Request for Quotation.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div>
              <Label htmlFor="new-sup-name">Supplier / Vendor Business Name *</Label>
              <Input
                id="new-sup-name"
                placeholder="e.g. Shree Ganesh RMC Plant"
                value={newSupName}
                onChange={(e) => setNewSupName(e.target.value)}
                className="mt-1 h-8 text-xs"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="new-sup-code">Vendor Code</Label>
                <Input
                  id="new-sup-code"
                  placeholder="e.g. VEN-003"
                  value={newSupCode}
                  onChange={(e) => setNewSupCode(e.target.value)}
                  className="mt-1 h-8 text-xs font-mono"
                />
              </div>
              <div>
                <Label htmlFor="new-sup-cont">Contact Person</Label>
                <Input
                  id="new-sup-cont"
                  placeholder="e.g. Ramesh Deshmukh"
                  value={newSupContact}
                  onChange={(e) => setNewSupContact(e.target.value)}
                  className="mt-1 h-8 text-xs"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="new-sup-email">Email Address</Label>
                <Input
                  id="new-sup-email"
                  type="email"
                  placeholder="e.g. rmc@ganeshinfra.com"
                  value={newSupEmail}
                  onChange={(e) => setNewSupEmail(e.target.value)}
                  className="mt-1 h-8 text-xs"
                />
              </div>
              <div>
                <Label htmlFor="new-sup-phone">Phone Number</Label>
                <Input
                  id="new-sup-phone"
                  placeholder="e.g. +91 94230 11223"
                  value={newSupPhone}
                  onChange={(e) => setNewSupPhone(e.target.value)}
                  className="mt-1 h-8 text-xs"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAddSupplierOpen(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleAddCustomSupplier}
              disabled={!newSupName.trim()}
              className="text-xs"
            >
              Add to RFQ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
