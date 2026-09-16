import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  PackageCheck,
  Building2,
  MapPin,
  Truck,
  FileText,
  Warehouse,
  CheckCircle2,
} from "lucide-react";
import type { PurchaseOrder } from "@/types";

interface GrnInitiationModalProps {
  open: boolean;
  onClose: () => void;
  po: PurchaseOrder | null;
}

export function GrnInitiationModal({ open, onClose, po }: GrnInitiationModalProps) {
  const [challanNo, setChallanNo] = useState("DC/2026/8901");
  const [vehicleNo, setVehicleNo] = useState("MH-12-QZ-4590");
  const [gatePassNo, setGatePassNo] = useState("GP-2026-441");
  const [warehouse, setWarehouse] = useState("Central Project Store Yard - Block A");
  const [submitting, setSubmitting] = useState(false);

  if (!po) return null;

  const items = po.items || [];

  function handleInitiateGrn() {
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      toast.success(`GRN initiated successfully for PO ${po?.poNo}!`, {
        description: `Handed off to Stores & Inventory (${items.length} items ready for physical inspection).`,
      });
      onClose();
    }, 400);
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
              <PackageCheck className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                Initiate Goods Receipt Note (GRN)
                <Badge variant="outline" className="font-mono text-xs bg-muted">
                  {po.poNo}
                </Badge>
              </DialogTitle>
              <DialogDescription className="text-xs">
                Pre-populated from Issued Purchase Order for Stores & Site Material Receipt.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-1 text-xs">
          {/* Pre-populated Context Strip */}
          <div className="rounded-lg border bg-muted/30 p-3 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">
                Supplier
              </span>
              <span className="font-semibold text-foreground truncate block">
                {po.supplierName || po.supplier}
              </span>
              <span className="text-[10px] text-muted-foreground font-mono">
                {po.supplierCode || "VEN-001"}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">
                Project
              </span>
              <span className="font-semibold text-foreground truncate block flex items-center gap-1">
                <Building2 className="size-3 text-primary shrink-0" />
                {po.projectName || po.project}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">
                Site Location
              </span>
              <span className="font-semibold text-foreground truncate block flex items-center gap-1">
                <MapPin className="size-3 text-primary shrink-0" />
                {po.siteName || po.site}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">
                Order Value
              </span>
              <span className="font-bold text-emerald-600 text-sm block">
                ₹{(po.grandTotal || po.total || 0).toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          {/* Delivery & Gate Entry Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Delivery Challan / Invoice No</Label>
              <div className="relative">
                <FileText className="size-3.5 text-muted-foreground absolute left-2.5 top-2.5" />
                <Input
                  className="h-8 pl-8 text-xs font-mono"
                  value={challanNo}
                  onChange={(e) => setChallanNo(e.target.value)}
                  placeholder="e.g. DC-10294"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Delivery Vehicle Number</Label>
              <div className="relative">
                <Truck className="size-3.5 text-muted-foreground absolute left-2.5 top-2.5" />
                <Input
                  className="h-8 pl-8 text-xs font-mono uppercase"
                  value={vehicleNo}
                  onChange={(e) => setVehicleNo(e.target.value)}
                  placeholder="e.g. MH-12-XX-0000"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Site Inward Gate Pass</Label>
              <Input
                className="h-8 text-xs font-mono"
                value={gatePassNo}
                onChange={(e) => setGatePassNo(e.target.value)}
                placeholder="e.g. GP-0192"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Receiving Store / Godown</Label>
              <div className="relative">
                <Warehouse className="size-3.5 text-muted-foreground absolute left-2.5 top-2.5" />
                <Input
                  className="h-8 pl-8 text-xs"
                  value={warehouse}
                  onChange={(e) => setWarehouse(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Items to be received table */}
          <div className="rounded-lg border overflow-hidden">
            <div className="bg-muted/40 px-3 py-1.5 border-b font-semibold text-[11px] flex justify-between">
              <span>PO Items Handed Off for Inspection ({items.length})</span>
              <span className="text-muted-foreground">Ordered Quantity</span>
            </div>
            <div className="divide-y max-h-48 overflow-y-auto">
              {items.map((it, idx) => (
                <div key={idx} className="p-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-mono text-[11px] text-primary mr-2 font-bold">
                      {it.itemCode}
                    </span>
                    <span className="font-medium text-foreground">{it.itemDescription}</span>
                    <span className="text-[10px] text-muted-foreground ml-2">({it.category})</span>
                  </div>
                  <div className="text-right shrink-0">
                    <Badge variant="secondary" className="font-semibold text-xs">
                      {it.poQty} {it.unit}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" size="sm" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            size="sm"
            className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
            onClick={handleInitiateGrn}
            disabled={submitting}
          >
            <CheckCircle2 className="size-4" />
            {submitting ? "Initiating..." : "Confirm & Send to Stores"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
