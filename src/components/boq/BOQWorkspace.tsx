import { useState, useMemo } from "react";
import {
  ArrowUpDown,
  CheckCircle2,
  Copy,
  Download,
  Edit2,
  FileSpreadsheet,
  Filter,
  History,
  IndianRupee,
  Layers,
  Plus,
  RotateCcw,
  Search,
  Trash2,
  Upload,
  UserCheck,
} from "lucide-react";
import { StatCard } from "@/components/common/StatCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
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
import { MaterialRequirementSection } from "@/components/boq/MaterialRequirementSection";
import { toast } from "sonner";
import type { BOQItem, BOQCategory, BOQUnit, BOQItemStatus, BOQRevision, Indent } from "@/types";
import { cn } from "@/lib/utils";

interface BOQWorkspaceProps {
  projectName: string;
  onIndentCreated?: ((indent: Indent) => void) | undefined;
}

const categories: BOQCategory[] = [
  "Civil",
  "Structural",
  "Electrical",
  "Plumbing",
  "MEP",
  "Finishing",
  "External Works",
  "Other",
];

const units: BOQUnit[] = ["Nos", "Sq.ft", "Sq.m", "Cu.m", "MT", "Kg", "Bag", "Ltr", "Day", "Job"];

export function BOQWorkspace({ projectName, onIndentCreated }: BOQWorkspaceProps) {
  const [activeSubTab, setActiveSubTab] = useState<"items" | "materials">("items");

  // Revisions
  const revisions: BOQRevision[] = useMemo(
    () => projectService.getBoqRevisions(projectName),
    [projectName],
  );
  const [selectedRevId, setSelectedRevId] = useState<string>("rev-02");
  const currentRevision = revisions.find((r) => r.id === selectedRevId) || revisions[0]!;

  // BOQ items local state
  const [items, setItems] = useState<BOQItem[]>(() =>
    projectService.getBoqItems(projectName, selectedRevId),
  );

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all"); // Material / Labour / Composite
  const [wbsFilter, setWbsFilter] = useState("all");

  // Modals state
  const [addItemOpen, setAddItemOpen] = useState(false);
  const [editItemOpen, setEditItemOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);

  // Add/Edit Item Form Fields
  const [formWbs, setFormWbs] = useState("02.04");
  const [formDesc, setFormDesc] = useState("");
  const [formCategory, setFormCategory] = useState<BOQCategory>("Civil");
  const [formUnit, setFormUnit] = useState<BOQUnit>("Cu.m");
  const [formEstQty, setFormEstQty] = useState("1000");
  const [formAppQty, setFormAppQty] = useState("1000");
  const [formRate, setFormRate] = useState("4500");
  const [formTax, setFormTax] = useState("18");
  const [formConsumed, setFormConsumed] = useState("0");
  const [formItemType, setFormItemType] = useState<"Material" | "Labour" | "Composite">("Material");
  const [formStatus, setFormStatus] = useState<BOQItemStatus>("Not Started");
  const [formRemarks, setFormRemarks] = useState("");

  const [targetItemId, setTargetItemId] = useState<string | null>(null);

  function reloadItems() {
    setItems(projectService.getBoqItems(projectName, selectedRevId));
  }

  // Summary Cards Calculations
  const totalBOQValue = useMemo(() => items.reduce((s, i) => s + i.amount, 0), [items]);
  const approvedBOQValue = totalBOQValue;
  const revisedBOQValue = Math.round(totalBOQValue * 1.045);
  const totalItemsCount = items.length;
  const completedItemsCount = items.filter((i) => i.status === "Completed").length;
  const materialValue = useMemo(
    () => items.filter((i) => i.itemType === "Material").reduce((s, i) => s + i.amount, 0),
    [items],
  );
  const labourValue = useMemo(
    () => items.filter((i) => i.itemType === "Labour").reduce((s, i) => s + i.amount, 0),
    [items],
  );

  // Filtered BOQ items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchSearch =
        searchQuery === "" ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.boqNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.wbsCode.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCategory = categoryFilter === "all" || item.category === categoryFilter;
      const matchStatus = statusFilter === "all" || item.status === statusFilter;
      const matchType = typeFilter === "all" || item.itemType === typeFilter;
      const matchWbs = wbsFilter === "all" || item.wbsCode.startsWith(wbsFilter);

      return matchSearch && matchCategory && matchStatus && matchType && matchWbs;
    });
  }, [items, searchQuery, categoryFilter, statusFilter, typeFilter, wbsFilter]);

  const uniqueWbsCodes = useMemo(() => {
    return Array.from(new Set(items.map((i) => i.wbsCode.split(".")[0]))).filter(Boolean);
  }, [items]);

  function handleResetFilters() {
    setSearchQuery("");
    setCategoryFilter("all");
    setStatusFilter("all");
    setTypeFilter("all");
    setWbsFilter("all");
  }

  // Open Add Modal
  function openAddModal() {
    setTargetItemId(null);
    setFormWbs("02.04");
    setFormDesc("");
    setFormCategory("Civil");
    setFormUnit("Cu.m");
    setFormEstQty("500");
    setFormAppQty("500");
    setFormRate("4200");
    setFormTax("18");
    setFormConsumed("0");
    setFormItemType("Material");
    setFormStatus("Not Started");
    setFormRemarks("");
    setAddItemOpen(true);
  }

  // Handle Add Item Submit
  function handleAddItem() {
    if (!formDesc.trim()) {
      toast.error("Item Description is required");
      return;
    }
    const est = Number(formEstQty) || 0;
    const app = Number(formAppQty) || 0;
    const rate = Number(formRate) || 0;
    const tax = Number(formTax) || 18;
    const consumed = Number(formConsumed) || 0;

    const nextNo = `BOQ-${items.length + 1 < 10 ? `0${items.length + 1}` : items.length + 1}`;

    projectService.addBoqItem(projectName, {
      boqNo: nextNo,
      wbsCode: formWbs,
      description: formDesc.trim(),
      category: formCategory,
      unit: formUnit,
      estimatedQty: est,
      approvedQty: app,
      rate,
      taxPct: tax,
      consumedQty: consumed,
      status: formStatus,
      itemType: formItemType,
      remarks: formRemarks,
      project: projectName,
      revisionId: selectedRevId,
    });

    setAddItemOpen(false);
    reloadItems();
    toast.success(`BOQ Item ${nextNo} added successfully`);
  }

  // Open Edit Modal
  function openEditModal(item: BOQItem) {
    setTargetItemId(item.id);
    setFormWbs(item.wbsCode);
    setFormDesc(item.description);
    setFormCategory(item.category);
    setFormUnit(item.unit);
    setFormEstQty(String(item.estimatedQty));
    setFormAppQty(String(item.approvedQty));
    setFormRate(String(item.rate));
    setFormTax(String(item.taxPct));
    setFormConsumed(String(item.consumedQty));
    setFormItemType(item.itemType);
    setFormStatus(item.status);
    setFormRemarks(item.remarks || "");
    setEditItemOpen(true);
  }

  // Handle Edit Submit
  function handleEditItem() {
    if (!targetItemId) return;
    const est = Number(formEstQty) || 0;
    const app = Number(formAppQty) || 0;
    const rate = Number(formRate) || 0;
    const tax = Number(formTax) || 18;
    const consumed = Number(formConsumed) || 0;

    projectService.updateBoqItem(projectName, targetItemId, {
      wbsCode: formWbs,
      description: formDesc.trim(),
      category: formCategory,
      unit: formUnit,
      estimatedQty: est,
      approvedQty: app,
      rate,
      taxPct: tax,
      consumedQty: consumed,
      status: formStatus,
      itemType: formItemType,
      remarks: formRemarks,
    });

    setEditItemOpen(false);
    reloadItems();
    toast.success("BOQ item updated");
  }

  // Handle Duplicate
  function handleDuplicate(itemId: string) {
    const copy = projectService.duplicateBoqItem(projectName, itemId);
    if (copy) {
      reloadItems();
      toast.success(`BOQ Item duplicated as ${copy.boqNo}`);
    }
  }

  // Handle Delete Confirm
  function handleDeleteConfirm() {
    if (!targetItemId) return;
    projectService.deleteBoqItem(projectName, targetItemId);
    setDeleteConfirmOpen(false);
    setTargetItemId(null);
    reloadItems();
    toast.success("BOQ item deleted");
  }

  // Handle Export CSV
  function handleExportCSV() {
    const headers = [
      "BOQ No",
      "WBS Code",
      "Description",
      "Category",
      "Unit",
      "Est Qty",
      "Appr Qty",
      "Rate",
      "Amount",
      "Consumed Qty",
      "Balance Qty",
      "Progress %",
      "Status",
    ];
    const rows = filteredItems.map((i) => [
      i.boqNo,
      i.wbsCode,
      `"${i.description.replace(/"/g, '""')}"`,
      i.category,
      i.unit,
      i.estimatedQty,
      i.approvedQty,
      i.rate,
      i.amount,
      i.consumedQty,
      i.balanceQty,
      `${i.progress}%`,
      i.status,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `BOQ_${projectName}_${currentRevision.revNo}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("BOQ CSV export downloaded");
  }

  // Handle Import Mock
  function handleImportMock() {
    setImportModalOpen(false);
    toast.success("12 BOQ line items imported and reconciled with WBS codes");
  }

  return (
    <div className="space-y-4">
      {/* 4. BOQ Versioning Concept Header Bar */}
      <div className="rounded-xl border bg-card p-3 shadow-card sm:p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <History className="size-4 text-primary" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-foreground">Active Revision:</span>
                <Select value={selectedRevId} onValueChange={setSelectedRevId}>
                  <SelectTrigger className="h-7 w-auto min-w-[170px] text-xs font-semibold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {revisions.map((r) => (
                      <SelectItem key={r.id} value={r.id} className="text-xs">
                        {r.revNo} · {r.status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <StatusBadge value={currentRevision.status} />
              </div>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                {currentRevision.title} · Date: {formatDate(currentRevision.date)} · Prepared by:{" "}
                {currentRevision.preparedBy} · Approved by: {currentRevision.approvedBy}
              </p>
            </div>
          </div>

          {/* Sub-view Switcher: BOQ Items vs Material Requirements */}
          <div className="flex items-center rounded-lg border bg-surface p-0.5">
            <Button
              variant={activeSubTab === "items" ? "secondary" : "ghost"}
              size="sm"
              className="h-7 px-3 text-xs"
              onClick={() => setActiveSubTab("items")}
            >
              <Layers className="mr-1.5 size-3.5" /> BOQ Items ({items.length})
            </Button>
            <Button
              variant={activeSubTab === "materials" ? "secondary" : "ghost"}
              size="sm"
              className="h-7 px-3 text-xs"
              onClick={() => setActiveSubTab("materials")}
            >
              <FileSpreadsheet className="mr-1.5 size-3.5" /> Material Requirements
            </Button>
          </div>
        </div>
      </div>

      {activeSubTab === "materials" ? (
        <MaterialRequirementSection projectName={projectName} onIndentCreated={onIndentCreated} />
      ) : (
        <>
          {/* 2. Top Summary Cards (7 required) */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
            <div className="rounded-lg border bg-card p-3 shadow-card">
              <span className="text-[11px] text-muted-foreground">Total BOQ Value</span>
              <p className="mt-1 font-mono text-xs font-bold text-foreground sm:text-sm">
                {formatINR(totalBOQValue, { compact: true })}
              </p>
            </div>
            <div className="rounded-lg border bg-card p-3 shadow-card">
              <span className="text-[11px] text-muted-foreground">Approved Value</span>
              <p className="mt-1 font-mono text-xs font-bold text-success sm:text-sm">
                {formatINR(approvedBOQValue, { compact: true })}
              </p>
            </div>
            <div className="rounded-lg border bg-card p-3 shadow-card">
              <span className="text-[11px] text-muted-foreground">Revised Value</span>
              <p className="mt-1 font-mono text-xs font-bold text-primary sm:text-sm">
                {formatINR(revisedBOQValue, { compact: true })}
              </p>
            </div>
            <div className="rounded-lg border bg-card p-3 shadow-card">
              <span className="text-[11px] text-muted-foreground">Total Items</span>
              <p className="mt-1 font-mono text-xs font-bold text-foreground sm:text-sm">
                {totalItemsCount}
              </p>
            </div>
            <div className="rounded-lg border bg-card p-3 shadow-card">
              <span className="text-[11px] text-muted-foreground">Completed</span>
              <p className="mt-1 font-mono text-xs font-bold text-success sm:text-sm">
                {completedItemsCount}
              </p>
            </div>
            <div className="rounded-lg border bg-card p-3 shadow-card">
              <span className="text-[11px] text-muted-foreground">Material Value</span>
              <p className="mt-1 font-mono text-xs font-bold text-blue-600 dark:text-blue-400 sm:text-sm">
                {formatINR(materialValue, { compact: true })}
              </p>
            </div>
            <div className="rounded-lg border bg-card p-3 shadow-card">
              <span className="text-[11px] text-muted-foreground">Labour Value</span>
              <p className="mt-1 font-mono text-xs font-bold text-amber-600 dark:text-amber-400 sm:text-sm">
                {formatINR(labourValue, { compact: true })}
              </p>
            </div>
          </div>

          {/* 3. Main BOQ Workspace & Table */}
          <div className="rounded-xl border bg-card shadow-card">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b p-3 sm:p-4">
              <div className="flex flex-wrap items-center gap-2 flex-1">
                <div className="relative min-w-[200px] flex-1">
                  <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by BOQ No, description, or WBS..."
                    className="h-8 pl-8 text-xs"
                  />
                </div>

                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="h-8 w-auto min-w-[125px] text-xs">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="text-xs">
                      All Categories
                    </SelectItem>
                    {categories.map((c) => (
                      <SelectItem key={c} value={c} className="text-xs">
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="h-8 w-auto min-w-[120px] text-xs">
                    <SelectValue placeholder="Item Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="text-xs">
                      All Types
                    </SelectItem>
                    <SelectItem value="Material" className="text-xs">
                      Material
                    </SelectItem>
                    <SelectItem value="Labour" className="text-xs">
                      Labour
                    </SelectItem>
                    <SelectItem value="Composite" className="text-xs">
                      Composite
                    </SelectItem>
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-8 w-auto min-w-[120px] text-xs">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="text-xs">
                      All Statuses
                    </SelectItem>
                    <SelectItem value="Not Started" className="text-xs">
                      Not Started
                    </SelectItem>
                    <SelectItem value="In Progress" className="text-xs">
                      In Progress
                    </SelectItem>
                    <SelectItem value="Completed" className="text-xs">
                      Completed
                    </SelectItem>
                    <SelectItem value="On Hold" className="text-xs">
                      On Hold
                    </SelectItem>
                  </SelectContent>
                </Select>

                {(searchQuery ||
                  categoryFilter !== "all" ||
                  statusFilter !== "all" ||
                  typeFilter !== "all") && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleResetFilters}
                    className="h-8 px-2 text-xs text-muted-foreground"
                  >
                    <RotateCcw className="mr-1 size-3" /> Reset
                  </Button>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={() => setImportModalOpen(true)}
                >
                  <Upload className="mr-1.5 size-3.5" /> Import BOQ
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={handleExportCSV}
                >
                  <Download className="mr-1.5 size-3.5" /> Export CSV
                </Button>
                <Button size="sm" className="h-8 text-xs" onClick={openAddModal}>
                  <Plus className="mr-1.5 size-3.5" /> Add BOQ Item
                </Button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-muted/50 text-[11px] uppercase tracking-wide text-muted-foreground border-b">
                  <tr>
                    <th className="px-3 py-2.5 text-left font-medium">BOQ No</th>
                    <th className="px-3 py-2.5 text-left font-medium">WBS</th>
                    <th className="px-3 py-2.5 text-left font-medium min-w-[260px]">
                      Item Description
                    </th>
                    <th className="px-3 py-2.5 text-left font-medium">Category</th>
                    <th className="px-3 py-2.5 text-center font-medium">Unit</th>
                    <th className="px-3 py-2.5 text-right font-medium">Est Qty</th>
                    <th className="px-3 py-2.5 text-right font-medium">Approved Qty</th>
                    <th className="px-3 py-2.5 text-right font-medium">Rate (₹)</th>
                    <th className="px-3 py-2.5 text-right font-medium font-semibold text-foreground">
                      Amount (₹)
                    </th>
                    <th className="px-3 py-2.5 text-right font-medium">Consumed</th>
                    <th className="px-3 py-2.5 text-right font-medium">Balance Qty</th>
                    <th className="px-3 py-2.5 text-center font-medium min-w-[90px]">Progress</th>
                    <th className="px-3 py-2.5 text-left font-medium">Status</th>
                    <th className="px-3 py-2.5 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredItems.length === 0 ? (
                    <tr>
                      <td colSpan={14} className="py-8 text-center text-xs text-muted-foreground">
                        No BOQ items match the selected criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredItems.map((item) => (
                      <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-3 py-2 font-mono text-xs font-semibold text-primary">
                          {item.boqNo}
                        </td>
                        <td className="px-3 py-2 font-mono text-xs text-muted-foreground">
                          {item.wbsCode}
                        </td>
                        <td className="px-3 py-2">
                          <p className="font-medium text-foreground leading-snug">
                            {item.description}
                          </p>
                          <span className="text-[10px] text-muted-foreground">
                            {item.itemType} · GST {item.taxPct}%
                          </span>
                        </td>
                        <td className="px-3 py-2 text-muted-foreground">{item.category}</td>
                        <td className="px-3 py-2 text-center text-muted-foreground">{item.unit}</td>
                        <td className="px-3 py-2 text-right font-mono text-muted-foreground">
                          {formatNumber(item.estimatedQty)}
                        </td>
                        <td className="px-3 py-2 text-right font-mono font-medium">
                          {formatNumber(item.approvedQty)}
                        </td>
                        <td className="px-3 py-2 text-right font-mono text-muted-foreground">
                          {formatINR(item.rate)}
                        </td>
                        <td className="px-3 py-2 text-right font-mono font-bold text-foreground">
                          {formatINR(item.amount, { compact: true })}
                        </td>
                        <td className="px-3 py-2 text-right font-mono text-muted-foreground">
                          {formatNumber(item.consumedQty)}
                        </td>
                        <td className="px-3 py-2 text-right font-mono font-medium text-success">
                          {formatNumber(item.balanceQty)}
                        </td>
                        <td className="px-3 py-2">
                          <div className="space-y-1">
                            <div className="flex justify-between text-[10px]">
                              <span>{item.progress}%</span>
                            </div>
                            <Progress value={item.progress} className="h-1.5" />
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          <StatusBadge value={item.status} />
                        </td>
                        <td className="px-3 py-2 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                              onClick={() => openEditModal(item)}
                              aria-label="Edit Item"
                            >
                              <Edit2 className="size-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                              onClick={() => handleDuplicate(item.id)}
                              aria-label="Duplicate Item"
                            >
                              <Copy className="size-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 text-destructive/80 hover:text-destructive"
                              onClick={() => {
                                setTargetItemId(item.id);
                                setDeleteConfirmOpen(true);
                              }}
                              aria-label="Delete Item"
                            >
                              <Trash2 className="size-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Add BOQ Item Modal */}
      <Dialog open={addItemOpen} onOpenChange={setAddItemOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">Add BOQ Item</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Define work description, unit rates, quantities, and map to WBS activity.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-3 py-2 text-xs">
            <div>
              <Label htmlFor="boq-wbs">WBS Code</Label>
              <Input
                id="boq-wbs"
                value={formWbs}
                onChange={(e) => setFormWbs(e.target.value)}
                placeholder="e.g. 02.04"
                className="mt-1 h-8 text-xs font-mono"
              />
            </div>

            <div>
              <Label htmlFor="boq-cat">Category</Label>
              <Select value={formCategory} onValueChange={(v) => setFormCategory(v as BOQCategory)}>
                <SelectTrigger id="boq-cat" className="mt-1 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c} className="text-xs">
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2">
              <Label htmlFor="boq-desc">Item Description</Label>
              <Input
                id="boq-desc"
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                placeholder="e.g. Supply and pouring of Ready Mix Concrete M30 for floor slabs"
                className="mt-1 h-8 text-xs"
              />
            </div>

            <div>
              <Label htmlFor="boq-unit">Unit</Label>
              <Select value={formUnit} onValueChange={(v) => setFormUnit(v as BOQUnit)}>
                <SelectTrigger id="boq-unit" className="mt-1 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {units.map((u) => (
                    <SelectItem key={u} value={u} className="text-xs">
                      {u}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="boq-type">Item Type</Label>
              <Select
                value={formItemType}
                onValueChange={(v) => setFormItemType(v as "Material" | "Labour" | "Composite")}
              >
                <SelectTrigger id="boq-type" className="mt-1 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Material">Material</SelectItem>
                  <SelectItem value="Labour">Labour</SelectItem>
                  <SelectItem value="Composite">Composite</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="boq-est">Estimated Quantity</Label>
              <Input
                id="boq-est"
                type="number"
                value={formEstQty}
                onChange={(e) => setFormEstQty(e.target.value)}
                className="mt-1 h-8 text-xs font-mono"
              />
            </div>

            <div>
              <Label htmlFor="boq-app">Approved Quantity</Label>
              <Input
                id="boq-app"
                type="number"
                value={formAppQty}
                onChange={(e) => setFormAppQty(e.target.value)}
                className="mt-1 h-8 text-xs font-mono"
              />
            </div>

            <div>
              <Label htmlFor="boq-rate">Unit Rate (₹)</Label>
              <Input
                id="boq-rate"
                type="number"
                value={formRate}
                onChange={(e) => setFormRate(e.target.value)}
                className="mt-1 h-8 text-xs font-mono"
              />
            </div>

            <div>
              <Label htmlFor="boq-tax">GST / Tax (%)</Label>
              <Input
                id="boq-tax"
                type="number"
                value={formTax}
                onChange={(e) => setFormTax(e.target.value)}
                className="mt-1 h-8 text-xs font-mono"
              />
            </div>

            {/* Auto Amount Preview */}
            <div className="col-span-2 rounded-lg border bg-surface/50 p-2.5 flex items-center justify-between">
              <span className="text-muted-foreground">Calculated Item Amount:</span>
              <span className="font-mono text-sm font-bold text-primary">
                {formatINR((Number(formAppQty) || 0) * (Number(formRate) || 0))}
              </span>
            </div>

            <div className="col-span-2">
              <Label htmlFor="boq-rem">Remarks & Technical Specifications</Label>
              <Input
                id="boq-rem"
                value={formRemarks}
                onChange={(e) => setFormRemarks(e.target.value)}
                placeholder="e.g. As per IS 456-2000 specifications"
                className="mt-1 h-8 text-xs"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAddItemOpen(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button size="sm" onClick={handleAddItem} className="text-xs">
              Add Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit BOQ Item Modal */}
      <Dialog open={editItemOpen} onOpenChange={setEditItemOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">Edit BOQ Item</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Update quantities, rates, consumed quantities, and status.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-3 py-2 text-xs">
            <div className="col-span-2">
              <Label>Description</Label>
              <Input
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                className="mt-1 h-8 text-xs"
              />
            </div>

            <div>
              <Label>Approved Quantity</Label>
              <Input
                type="number"
                value={formAppQty}
                onChange={(e) => setFormAppQty(e.target.value)}
                className="mt-1 h-8 text-xs font-mono"
              />
            </div>

            <div>
              <Label>Unit Rate (₹)</Label>
              <Input
                type="number"
                value={formRate}
                onChange={(e) => setFormRate(e.target.value)}
                className="mt-1 h-8 text-xs font-mono"
              />
            </div>

            <div>
              <Label>Consumed Quantity</Label>
              <Input
                type="number"
                value={formConsumed}
                onChange={(e) => setFormConsumed(e.target.value)}
                className="mt-1 h-8 text-xs font-mono"
              />
            </div>

            <div>
              <Label>Status</Label>
              <Select value={formStatus} onValueChange={(v) => setFormStatus(v as BOQItemStatus)}>
                <SelectTrigger className="mt-1 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Not Started">Not Started</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="On Hold">On Hold</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2 rounded-lg border bg-surface/50 p-2.5 flex items-center justify-between">
              <span className="text-muted-foreground">Recalculated Amount:</span>
              <span className="font-mono text-sm font-bold text-primary">
                {formatINR((Number(formAppQty) || 0) * (Number(formRate) || 0))}
              </span>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditItemOpen(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button size="sm" onClick={handleEditItem} className="text-xs">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">Delete BOQ Item</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Are you sure you want to delete this BOQ item? This will remove its associated budget
              allocation.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDeleteConfirmOpen(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteConfirm}
              className="text-xs"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import BOQ Modal */}
      <Dialog open={importModalOpen} onOpenChange={setImportModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">
              Import BOQ from Excel / CSV
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Upload client tender schedules or quantity surveyor item sheets.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div className="rounded-lg border border-dashed p-6 text-center">
              <FileSpreadsheet className="mx-auto size-8 text-muted-foreground/60" />
              <p className="mt-2 font-medium text-foreground">
                Click to upload or drag .XLSX / .CSV
              </p>
              <p className="text-[11px] text-muted-foreground">
                Required columns: WBS, Description, Unit, Qty, Rate
              </p>
            </div>

            <div className="rounded-lg border bg-surface/50 p-2.5 text-[11px] text-muted-foreground">
              <p className="font-semibold text-foreground">Template Format:</p>
              <p className="font-mono mt-1">
                WBS_Code, Description, Category, Unit, Qty, Rate, Tax
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setImportModalOpen(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button size="sm" onClick={handleImportMock} className="text-xs">
              Simulate Import
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
