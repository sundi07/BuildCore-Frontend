import { useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  Boxes,
  CheckCircle2,
  Clock,
  Download,
  IndianRupee,
  Layers,
  PackagePlus,
  Search,
  ShoppingCart,
  TrendingDown,
} from "lucide-react";
import { StatCard } from "@/components/common/StatCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { projectService } from "@/services/projectService";
import { formatDate, formatINR, formatNumber } from "@/utils/format";
import { toast } from "sonner";
import type { MaterialRequirement, Priority, Indent } from "@/types";
import { cn } from "@/lib/utils";

interface MaterialRequirementSectionProps {
  projectName: string;
  onIndentCreated?: ((indent: Indent) => void) | undefined;
}

export function MaterialRequirementSection({
  projectName,
  onIndentCreated,
}: MaterialRequirementSectionProps) {
  const [requirements, setRequirements] = useState<MaterialRequirement[]>(() =>
    projectService.getMaterialRequirements(projectName),
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Create Indent Modal State
  const [indentModalOpen, setIndentModalOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialRequirement | null>(null);
  const [indentQty, setIndentQty] = useState("");
  const [requiredDate, setRequiredDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().slice(0, 10);
  });
  const [priority, setPriority] = useState<Priority>("Medium");
  const [remarks, setRemarks] = useState("");

  // Confirmation banner modal state
  const [createdIndent, setCreatedIndent] = useState<Indent | null>(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  function reloadRequirements() {
    setRequirements(projectService.getMaterialRequirements(projectName));
  }

  // Filtered List
  const filtered = requirements.filter((m) => {
    const matchesSearch =
      searchQuery === "" ||
      m.material.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || m.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // KPI Calculations
  const totalItems = requirements.length;
  const procurementRequiredCount = requirements.filter(
    (m) => m.status === "Procurement Required",
  ).length;
  const lowStockCount = requirements.filter((m) => m.status === "Low Stock").length;
  const totalShortfallValue = requirements.reduce(
    (s, m) => s + m.shortfall * (m.estimatedRate || 1000),
    0,
  );

  function handleOpenIndentModal(mat: MaterialRequirement) {
    setSelectedMaterial(mat);
    setIndentQty(String(mat.shortfall > 0 ? mat.shortfall : mat.required));
    setPriority(mat.shortfall > 1000 ? "Urgent" : "Medium");
    setRemarks(`Purchase Indent for ${mat.material} against project shortfall`);
    setIndentModalOpen(true);
  }

  function handleCreateIndent() {
    if (!selectedMaterial) return;
    const qty = Number(indentQty);
    if (isNaN(qty) || qty <= 0) {
      toast.error("Please enter a valid indent quantity");
      return;
    }

    const newIndent = projectService.createIndentFromMaterial(projectName, {
      material: selectedMaterial.material,
      quantity: qty,
      unit: selectedMaterial.unit,
      requiredDate,
      priority,
      remarks,
    });

    setIndentModalOpen(false);
    reloadRequirements();
    setCreatedIndent(newIndent);
    setConfirmModalOpen(true);
    onIndentCreated?.(newIndent);
    toast.success(`Purchase Indent ${newIndent.indentNo} created successfully!`);
  }

  return (
    <div className="space-y-4">
      {/* 1. Summary Cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Tracked Materials"
          value={String(totalItems)}
          hint="Derived from Project BOQ baseline"
          icon={Layers}
        />
        <StatCard
          label="Procurement Required"
          value={String(procurementRequiredCount)}
          hint="Items with immediate site deficit"
          icon={ShoppingCart}
          tone="danger"
        />
        <StatCard
          label="Low Stock Alert"
          value={String(lowStockCount)}
          hint="Buffer below 20% threshold"
          icon={AlertTriangle}
          tone="warning"
        />
        <StatCard
          label="Est. Shortfall Value"
          value={formatINR(totalShortfallValue, { compact: true })}
          hint="Estimated purchase commitment"
          icon={IndianRupee}
          tone="info"
        />
      </div>

      {/* 2. Main Material Requirements Table & Toolbar */}
      <div className="rounded-xl border bg-card shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b p-4">
          <div>
            <h3 className="text-sm font-semibold tracking-tight">
              Material Requirement Planning (MRP)
            </h3>
            <p className="text-xs text-muted-foreground">
              BOQ planned quantities versus actual site consumption, store stock in hand, and
              procurement shortfalls
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[180px]">
              <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search material or category..."
                className="h-8 pl-8 text-xs"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-8 w-auto min-w-[150px] text-xs">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">
                  All Statuses
                </SelectItem>
                <SelectItem value="Procurement Required" className="text-xs">
                  Procurement Required
                </SelectItem>
                <SelectItem value="Low Stock" className="text-xs">
                  Low Stock
                </SelectItem>
                <SelectItem value="Sufficient" className="text-xs">
                  Sufficient
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-muted/50 text-[11px] uppercase tracking-wide text-muted-foreground border-b">
              <tr>
                <th className="px-3 py-2.5 text-left font-medium">Material Name</th>
                <th className="px-3 py-2.5 text-left font-medium">Category</th>
                <th className="px-3 py-2.5 text-center font-medium">Unit</th>
                <th className="px-3 py-2.5 text-right font-medium">BOQ Qty</th>
                <th className="px-3 py-2.5 text-right font-medium">Consumed</th>
                <th className="px-3 py-2.5 text-right font-medium font-semibold text-foreground">
                  Required
                </th>
                <th className="px-3 py-2.5 text-right font-medium">Available Stock</th>
                <th className="px-3 py-2.5 text-right font-medium font-bold text-destructive">
                  Shortfall
                </th>
                <th className="px-3 py-2.5 text-left font-medium">Required By</th>
                <th className="px-3 py-2.5 text-left font-medium">Status</th>
                <th className="px-3 py-2.5 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-xs text-muted-foreground">
                    No material requirements match the current filters.
                  </td>
                </tr>
              ) : (
                filtered.map((mat) => {
                  const isProcRequired = mat.status === "Procurement Required";
                  const isLow = mat.status === "Low Stock";

                  return (
                    <tr key={mat.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-3 py-2.5 font-medium text-foreground">{mat.material}</td>
                      <td className="px-3 py-2.5 text-muted-foreground">{mat.category}</td>
                      <td className="px-3 py-2.5 text-center text-muted-foreground">{mat.unit}</td>
                      <td className="px-3 py-2.5 text-right font-mono text-muted-foreground">
                        {formatNumber(mat.boqQuantity)}
                      </td>
                      <td className="px-3 py-2.5 text-right font-mono text-muted-foreground">
                        {formatNumber(mat.consumed)}
                      </td>
                      <td className="px-3 py-2.5 text-right font-mono font-semibold text-foreground">
                        {formatNumber(mat.required)}
                      </td>
                      <td className="px-3 py-2.5 text-right font-mono text-muted-foreground">
                        {formatNumber(mat.availableStock)}
                      </td>
                      <td className="px-3 py-2.5 text-right font-mono font-bold">
                        {mat.shortfall > 0 ? (
                          <span className="text-destructive">{formatNumber(mat.shortfall)}</span>
                        ) : (
                          <span className="text-success">0</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-muted-foreground whitespace-nowrap">
                        {formatDate(mat.requiredDate)}
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium",
                            isProcRequired
                              ? "border-destructive/30 bg-destructive/10 text-destructive"
                              : isLow
                                ? "border-warning/35 bg-warning/15 text-warning-foreground"
                                : "border-success/30 bg-success/12 text-success",
                          )}
                        >
                          {isProcRequired ? (
                            <AlertCircle className="size-3" />
                          ) : isLow ? (
                            <AlertTriangle className="size-3" />
                          ) : (
                            <CheckCircle2 className="size-3" />
                          )}
                          {mat.status}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-right whitespace-nowrap">
                        <Button
                          size="sm"
                          variant={isProcRequired ? "default" : "outline"}
                          className="h-7 px-2.5 text-xs"
                          onClick={() => handleOpenIndentModal(mat)}
                        >
                          <PackagePlus className="mr-1 size-3" /> Create Indent
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Create Purchase Indent Modal */}
      <Dialog open={indentModalOpen} onOpenChange={setIndentModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">Create Purchase Indent</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Generate store requisition from material requirement shortfall for{" "}
              {selectedMaterial?.material}.
            </DialogDescription>
          </DialogHeader>

          {selectedMaterial && (
            <div className="space-y-3 py-2 text-xs">
              <div className="rounded-lg border bg-surface/50 p-3">
                <div className="flex justify-between border-b pb-1.5">
                  <span className="text-muted-foreground">Selected Material</span>
                  <span className="font-semibold text-foreground">{selectedMaterial.material}</span>
                </div>
                <div className="mt-1.5 flex justify-between border-b pb-1.5">
                  <span className="text-muted-foreground">Project Shortfall</span>
                  <span className="font-mono font-bold text-destructive">
                    {formatNumber(selectedMaterial.shortfall)} {selectedMaterial.unit}
                  </span>
                </div>
                <div className="mt-1.5 flex justify-between">
                  <span className="text-muted-foreground">Available Store Stock</span>
                  <span className="font-mono text-muted-foreground">
                    {formatNumber(selectedMaterial.availableStock)} {selectedMaterial.unit}
                  </span>
                </div>
              </div>

              <div>
                <Label htmlFor="ind-qty">
                  Indent Quantity ({selectedMaterial.unit}){" "}
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="ind-qty"
                  type="number"
                  value={indentQty}
                  onChange={(e) => setIndentQty(e.target.value)}
                  className="mt-1 h-8 text-xs font-mono"
                />
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Estimated value:{" "}
                  {formatINR((Number(indentQty) || 0) * selectedMaterial.estimatedRate, {
                    compact: true,
                  })}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="ind-date">Required By Date</Label>
                  <Input
                    id="ind-date"
                    type="date"
                    value={requiredDate}
                    onChange={(e) => setRequiredDate(e.target.value)}
                    className="mt-1 h-8 text-xs"
                  />
                </div>
                <div>
                  <Label htmlFor="ind-pri">Priority</Label>
                  <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
                    <SelectTrigger id="ind-pri" className="mt-1 h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low / Standard</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Urgent">Urgent / Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="ind-rem">Remarks & Specific Quality Specs</Label>
                <Input
                  id="ind-rem"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="e.g. 53 Grade cement to be delivered at Tower A store yard"
                  className="mt-1 h-8 text-xs"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIndentModalOpen(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button size="sm" onClick={handleCreateIndent} className="text-xs">
              <ShoppingCart className="mr-1.5 size-3.5" /> Submit Indent
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 4. Indent Created Confirmation Modal */}
      <Dialog open={confirmModalOpen} onOpenChange={setConfirmModalOpen}>
        <DialogContent className="max-w-sm text-center">
          <div className="mx-auto grid size-12 place-items-center rounded-full bg-success/15 text-success">
            <CheckCircle2 className="size-6" />
          </div>
          <DialogTitle className="mt-2 text-base font-semibold">
            Purchase Indent Created!
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            The indent has been submitted to project procurement and is routed for verification.
          </DialogDescription>

          {createdIndent && (
            <div className="my-2 rounded-lg border bg-surface/50 p-3 text-left text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Indent No:</span>
                <span className="font-mono font-bold text-primary">{createdIndent.indentNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Material:</span>
                <span className="font-medium text-foreground">{createdIndent.items[0]?.item}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Quantity:</span>
                <span className="font-mono font-semibold">
                  {formatNumber(createdIndent.items[0]?.quantity || 0)}{" "}
                  {createdIndent.items[0]?.unit}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Estimated Value:</span>
                <span className="font-mono font-semibold">
                  {formatINR(createdIndent.value, { compact: true })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <span className="font-medium text-warning-foreground">{createdIndent.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Requested By:</span>
                <span>{createdIndent.requestedBy}</span>
              </div>
            </div>
          )}

          <DialogFooter className="sm:justify-center">
            <Button size="sm" onClick={() => setConfirmModalOpen(false)} className="text-xs">
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
