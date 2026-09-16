import { useState, useMemo } from "react";
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  FileText,
  Download,
  Eye,
  Paperclip,
  Send,
  Printer,
  Building2,
  MapPin,
  Calendar,
  User,
  Copy,
  Plus,
  ArrowRight,
  ShieldCheck,
  FileSpreadsheet,
  MessageSquare,
  CornerUpLeft,
  Share2,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/common/StatusBadge";
import { formatDate, formatINR, formatNumber } from "@/utils/format";
import { toast } from "sonner";
import { enrichIndentDetails, getTimelineForStatus } from "@/mock/indentDetailsData";
import { CreateRfqDrawer } from "@/components/procurement/CreateRfqDrawer";
import type {
  Indent,
  IndentAttachment,
  IndentComment,
  IndentTimelineEvent,
  ApprovalStatus,
} from "@/types";
import { cn } from "@/lib/utils";

interface IndentDetailDrawerProps {
  indent: Indent | null;
  open: boolean;
  onClose: () => void;
  onUpdateIndent?: ((updated: Indent) => void) | undefined;
}

export function IndentDetailDrawer({
  indent: initialIndent,
  open,
  onClose,
  onUpdateIndent,
}: IndentDetailDrawerProps) {
  // Enrich record with complete details
  const enriched = useMemo(() => {
    if (!initialIndent) return null;
    return enrichIndentDetails(initialIndent);
  }, [initialIndent]);

  // Local interactive state for comments, attachments, timeline, and status
  const [currentIndent, setCurrentIndent] = useState<Indent | null>(enriched);

  // Sync when prop changes
  useMemo(() => {
    if (enriched) {
      setCurrentIndent(enriched);
    }
  }, [enriched]);

  // Modals for Actions
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [approvalRemarks, setApprovalRemarks] = useState("");

  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const [sendBackModalOpen, setSendBackModalOpen] = useState(false);
  const [sendBackQuery, setSendBackQuery] = useState("");

  // Create RFQ Drawer State
  const [createRfqOpen, setCreateRfqOpen] = useState(false);

  const [attachModalOpen, setAttachModalOpen] = useState(false);
  const [newAttachName, setNewAttachName] = useState("");
  const [newAttachType, setNewAttachType] = useState("PDF");

  const [previewAttachment, setPreviewAttachment] = useState<IndentAttachment | null>(null);

  // New Comment state
  const [newCommentText, setNewCommentText] = useState("");

  // Displayed timeline strictly ordered without contradictory states
  const displayedTimeline = useMemo(() => {
    const list = currentIndent?.timeline ?? [];
    if (currentIndent?.status === "Approved") {
      return list.filter((t) => t.title !== "Approval Pending");
    }
    return list;
  }, [currentIndent?.timeline, currentIndent?.status]);

  if (!currentIndent) return null;

  function updateRecord(
    patch: Partial<Indent>,
    newTimelineTitle?: string,
    newTimelineDesc?: string,
  ) {
    if (!currentIndent) return;

    let updatedTimeline = [...(currentIndent.timeline ?? [])];
    if (newTimelineTitle && newTimelineDesc) {
      const newEvent: IndentTimelineEvent = {
        id: `tl-${Date.now()}`,
        title: newTimelineTitle,
        description: newTimelineDesc,
        timestamp: "Just now",
        user: "Current User",
        type:
          patch.status === "Approved"
            ? "approved"
            : patch.status === "Rejected"
              ? "rejected"
              : patch.status === "Returned" || patch.status === "Sent Back"
                ? "returned"
                : "system",
      };
      updatedTimeline = [newEvent, ...updatedTimeline];
    }

    const updated: Indent = {
      ...currentIndent,
      ...patch,
      timeline: updatedTimeline,
    };

    setCurrentIndent(updated);
    if (onUpdateIndent) {
      onUpdateIndent(updated);
    }
  }

  // --- ACTIONS HANDLERS ---
  function handleConfirmApprove() {
    if (!currentIndent) return;
    const cleanTimeline = getTimelineForStatus(
      currentIndent,
      "Approved",
      approvalRemarks.trim() || undefined,
    );
    const updated: Indent = {
      ...currentIndent,
      status: "Approved",
      level: "Final Approved",
      timeline: cleanTimeline,
    };
    setCurrentIndent(updated);
    if (onUpdateIndent) {
      onUpdateIndent(updated);
    }
    setApproveModalOpen(false);
    setApprovalRemarks("");
    toast.success(`Indent ${currentIndent.indentNo} approved successfully`);
  }

  function handleConfirmReject() {
    if (!rejectReason.trim() || !currentIndent) {
      toast.error("Please provide a reason for rejection");
      return;
    }
    const cleanTimeline = getTimelineForStatus(currentIndent, "Rejected", rejectReason.trim());
    const updated: Indent = {
      ...currentIndent,
      status: "Rejected",
      level: "Rejected by Approver",
      timeline: cleanTimeline,
    };
    setCurrentIndent(updated);
    if (onUpdateIndent) {
      onUpdateIndent(updated);
    }
    setRejectModalOpen(false);
    setRejectReason("");
    toast.error(`Indent ${currentIndent.indentNo} has been rejected`);
  }

  function handleConfirmSendBack() {
    if (!sendBackQuery.trim() || !currentIndent) {
      toast.error("Please provide clarification query");
      return;
    }
    const cleanTimeline = getTimelineForStatus(currentIndent, "Returned", sendBackQuery.trim());
    const updated: Indent = {
      ...currentIndent,
      status: "Returned",
      level: "Sent Back to Site Incharge",
      timeline: cleanTimeline,
    };
    setCurrentIndent(updated);
    if (onUpdateIndent) {
      onUpdateIndent(updated);
    }
    setSendBackModalOpen(false);
    setSendBackQuery("");
    toast.warning(`Indent ${currentIndent.indentNo} returned to site`);
  }

  function handleSubmitForApproval() {
    if (!currentIndent) return;
    const cleanTimeline = getTimelineForStatus(currentIndent, "Pending");
    const updated: Indent = {
      ...currentIndent,
      status: "Pending",
      level: "Level 1 — Project Manager",
      timeline: cleanTimeline,
    };
    setCurrentIndent(updated);
    if (onUpdateIndent) {
      onUpdateIndent(updated);
    }
    toast.success(`Indent ${currentIndent.indentNo} submitted for approval`);
  }

  function handleResubmitRejected() {
    if (!currentIndent) return;
    const cleanTimeline = getTimelineForStatus(currentIndent, "Pending");
    const updated: Indent = {
      ...currentIndent,
      status: "Pending",
      level: "Level 1 — Project Manager",
      timeline: cleanTimeline,
    };
    setCurrentIndent(updated);
    if (onUpdateIndent) {
      onUpdateIndent(updated);
    }
    toast.success(`Indent ${currentIndent.indentNo} reopened and submitted`);
  }

  // --- COMMENTS HANDLER ---
  function handlePostComment() {
    if (!newCommentText.trim() || !currentIndent) return;

    const newComment: IndentComment = {
      id: `cm-${Date.now()}`,
      author: "Site User (You)",
      role: "Project Engineer",
      timestamp: "Just now",
      text: newCommentText.trim(),
    };

    const newTimelineEvent: IndentTimelineEvent = {
      id: `tl-${Date.now()}`,
      title: "Comment Added",
      description: newCommentText.trim(),
      timestamp: "Just now",
      user: "Site User",
      type: "comment",
    };

    const updated: Indent = {
      ...currentIndent,
      comments: [...(currentIndent.comments ?? []), newComment],
      timeline: [newTimelineEvent, ...(currentIndent.timeline ?? [])],
    };

    setCurrentIndent(updated);
    if (onUpdateIndent) {
      onUpdateIndent(updated);
    }
    setNewCommentText("");
    toast.success("Comment posted");
  }

  // --- ATTACHMENT HANDLER ---
  function handleAddAttachment() {
    if (!newAttachName.trim() || !currentIndent) return;

    const newDoc: IndentAttachment = {
      id: `att-${Date.now()}`,
      fileName: newAttachName.trim().endsWith(`.${newAttachType.toLowerCase()}`)
        ? newAttachName.trim()
        : `${newAttachName.trim()}.${newAttachType.toLowerCase()}`,
      fileType: newAttachType,
      fileSize: "1.2 MB",
      uploadedBy: "Site Engineer",
      uploadedDate: new Date().toISOString().slice(0, 10),
    };

    const updated: Indent = {
      ...currentIndent,
      attachments: [...(currentIndent.attachments ?? []), newDoc],
    };

    setCurrentIndent(updated);
    if (onUpdateIndent) {
      onUpdateIndent(updated);
    }
    setNewAttachName("");
    setAttachModalOpen(false);
    toast.success("Document attached to indent");
  }

  // Totals for the items table
  const totalIndentQuantity = currentIndent.items.reduce(
    (s, it) => s + (it.indentQty ?? it.quantity),
    0,
  );
  const totalIndentAmount = currentIndent.items.reduce(
    (s, it) => s + (it.amount ?? it.quantity * it.rate),
    0,
  );

  // Workflow steps logic
  const workflowSteps = [
    {
      step: 1,
      title: "Created",
      role: currentIndent.requestedBy,
      state: "completed" as const,
      date: formatDate(currentIndent.date),
    },
    {
      step: 2,
      title: "Project Manager Approval",
      role: "Project Manager",
      state:
        currentIndent.status === "Approved"
          ? ("completed" as const)
          : currentIndent.status === "Rejected"
            ? ("rejected" as const)
            : currentIndent.status === "Returned" || currentIndent.status === "Sent Back"
              ? ("returned" as const)
              : currentIndent.status === "Pending"
                ? ("active" as const)
                : ("upcoming" as const),
      date:
        currentIndent.status === "Approved"
          ? formatDate(currentIndent.date)
          : currentIndent.status === "Pending"
            ? "In Progress"
            : currentIndent.status === "Draft"
              ? "Pending Submission"
              : "Action Taken",
    },
    {
      step: 3,
      title: "Purchase Head Approval",
      role: "Purchase Head",
      state:
        currentIndent.status === "Approved"
          ? ("completed" as const)
          : currentIndent.status === "Pending" && currentIndent.level?.includes("Purchase")
            ? ("active" as const)
            : ("upcoming" as const),
      date:
        currentIndent.status === "Approved" ? formatDate(currentIndent.date) : "Pending Level 1",
    },
    {
      step: 4,
      title: "Finance Approval",
      role: "Finance Controller",
      state: currentIndent.status === "Approved" ? ("completed" as const) : ("upcoming" as const),
      date:
        currentIndent.status === "Approved" ? formatDate(currentIndent.date) : "Pending Level 2",
    },
    {
      step: 5,
      title: "Final Approval",
      role: "Procurement Release",
      state: currentIndent.status === "Approved" ? ("completed" as const) : ("upcoming" as const),
      date: currentIndent.status === "Approved" ? formatDate(currentIndent.date) : "Pending Final",
    },
  ];

  return (
    <>
      <Sheet open={open} onOpenChange={(val) => !val && onClose()}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-3xl md:max-w-4xl lg:max-w-5xl h-full p-0 flex flex-col bg-background text-foreground shadow-2xl border-l"
        >
          {/* 1. HEADER */}
          <div className="sticky top-0 z-20 border-b bg-card px-5 py-4 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="font-mono text-lg font-bold text-foreground sm:text-xl">
                    {currentIndent.indentNo}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7"
                    onClick={() => {
                      void navigator.clipboard.writeText(currentIndent.indentNo);
                      toast.success("Indent number copied");
                    }}
                    title="Copy Indent Number"
                  >
                    <Copy className="size-3.5" />
                  </Button>
                  <StatusBadge value={currentIndent.status} />
                  <StatusBadge value={currentIndent.priority} />
                </div>
                <SheetDescription className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Building2 className="size-3 text-primary" /> {currentIndent.project}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="size-3 text-muted-foreground" /> {currentIndent.site}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="size-3 text-muted-foreground" /> Created:{" "}
                    {formatDate(currentIndent.date)}
                  </span>
                  <span className="flex items-center gap-1 font-medium text-destructive">
                    <Clock className="size-3 text-destructive" /> Required:{" "}
                    {formatDate(currentIndent.requiredDate)}
                  </span>
                </SheetDescription>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs gap-1"
                  onClick={() => window.print()}
                >
                  <Printer className="size-3.5" /> Print
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={() => {
                    void navigator.clipboard.writeText(window.location.href);
                    toast.success("Link copied to clipboard");
                  }}
                >
                  <Share2 className="size-3.5" />
                </Button>
              </div>
            </div>

            {/* Department & Requester Sub-bar */}
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t pt-2.5 text-xs text-muted-foreground">
              <div className="flex items-center gap-3">
                <span>
                  Dept: <strong className="text-foreground">{currentIndent.department}</strong>
                </span>
                <span>•</span>
                <span>
                  Raised By:{" "}
                  <strong className="text-foreground">{currentIndent.requestedBy}</strong>
                </span>
              </div>
              <div>
                Approval Stage:{" "}
                <span className="font-semibold text-primary">{currentIndent.level || "—"}</span>
              </div>
            </div>
          </div>

          {/* SCROLLABLE BODY */}
          <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
            {/* 2. SUMMARY (4 KPI cards) */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-xl border bg-card p-3 shadow-card">
                <span className="text-[11px] text-muted-foreground">Total Items</span>
                <p className="mt-1 font-mono text-lg font-bold text-foreground">
                  {currentIndent.itemCount} <span className="text-xs font-normal">lines</span>
                </p>
                <span className="text-[10px] text-muted-foreground">Requisition scope</span>
              </div>

              <div className="rounded-xl border bg-card p-3 shadow-card">
                <span className="text-[11px] text-muted-foreground">Indent Value</span>
                <p className="mt-1 font-mono text-lg font-bold text-foreground">
                  {formatINR(totalIndentAmount || currentIndent.value, { compact: true })}
                </p>
                <span className="text-[10px] text-muted-foreground">Estimated landed cost</span>
              </div>

              <div className="rounded-xl border bg-card p-3 shadow-card">
                <span className="text-[11px] text-muted-foreground">Current Level</span>
                <p className="mt-1 text-xs font-bold text-primary truncate leading-tight">
                  {currentIndent.level || "Pending Review"}
                </p>
                <span className="text-[10px] text-muted-foreground">Active approval node</span>
              </div>

              <div className="rounded-xl border bg-card p-3 shadow-card">
                <span className="text-[11px] text-muted-foreground">Created Date</span>
                <p className="mt-1 text-sm font-semibold text-foreground">
                  {formatDate(currentIndent.date)}
                </p>
                <span className="text-[10px] text-muted-foreground">
                  Target: {formatDate(currentIndent.requiredDate)}
                </span>
              </div>
            </div>

            {/* 4. APPROVAL WORKFLOW TIMELINE */}
            <div className="rounded-xl border bg-card p-4 shadow-card">
              <div className="flex items-center justify-between border-b pb-2.5">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="size-4 text-primary" />
                  <h3 className="text-sm font-semibold">Multi-Level Approval Workflow</h3>
                </div>
                <span className="text-[11px] text-muted-foreground">
                  Status: <strong>{currentIndent.status}</strong>
                </span>
              </div>

              {/* Status Alert Banner */}
              {currentIndent.status === "Pending" && (
                <div className="mt-3 flex items-center gap-2.5 rounded-lg border border-amber-500/20 bg-amber-500/10 p-2.5 text-xs text-amber-800 dark:text-amber-300">
                  <Clock className="size-4 shrink-0 text-amber-600" />
                  <span>
                    This indent is currently pending review at{" "}
                    <strong>{currentIndent.level || "Level 1 — Project Manager"}</strong>.
                  </span>
                </div>
              )}
              {currentIndent.status === "Approved" && (
                <div className="mt-3 flex items-center gap-2.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-2.5 text-xs text-emerald-800 dark:text-emerald-300">
                  <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
                  <span>
                    This indent has received final approval and is cleared for floating RFQ
                    enquiries.
                  </span>
                </div>
              )}
              {currentIndent.status === "Rejected" && (
                <div className="mt-3 flex items-center gap-2.5 rounded-lg border border-destructive/20 bg-destructive/10 p-2.5 text-xs text-destructive">
                  <XCircle className="size-4 shrink-0 text-destructive" />
                  <span>
                    Indent was rejected during review. Review activity history or submit revised
                    indent.
                  </span>
                </div>
              )}
              {(currentIndent.status === "Returned" || currentIndent.status === "Sent Back") && (
                <div className="mt-3 flex items-center gap-2.5 rounded-lg border border-amber-500/20 bg-amber-500/10 p-2.5 text-xs text-amber-800 dark:text-amber-300">
                  <AlertTriangle className="size-4 shrink-0 text-amber-600" />
                  <span>
                    Returned to site engineer for quantity clarification or physical stock
                    re-verification.
                  </span>
                </div>
              )}

              {/* Step Chain */}
              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
                {workflowSteps.map((s, idx) => (
                  <div
                    key={s.title}
                    className={cn(
                      "relative flex flex-col justify-between rounded-lg border p-2.5 text-xs transition-all",
                      s.state === "completed" && "border-emerald-500/30 bg-emerald-500/5",
                      s.state === "active" &&
                        "border-primary ring-2 ring-primary/20 bg-primary/5 font-semibold",
                      s.state === "rejected" && "border-destructive/40 bg-destructive/5",
                      s.state === "returned" && "border-amber-500/40 bg-amber-500/5",
                      s.state === "upcoming" && "border-border/60 opacity-60 bg-muted/20",
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] text-muted-foreground">
                        0{idx + 1}
                      </span>
                      {s.state === "completed" && (
                        <CheckCircle2 className="size-3.5 text-emerald-600" />
                      )}
                      {s.state === "active" && (
                        <Clock className="size-3.5 animate-pulse text-primary" />
                      )}
                      {s.state === "rejected" && <XCircle className="size-3.5 text-destructive" />}
                      {s.state === "returned" && (
                        <AlertTriangle className="size-3.5 text-amber-600" />
                      )}
                      {s.state === "upcoming" && (
                        <div className="size-2 rounded-full bg-muted-foreground/40" />
                      )}
                    </div>
                    <div className="mt-2">
                      <p className="font-medium text-foreground leading-tight">{s.title}</p>
                      <p className="mt-0.5 text-[10px] text-muted-foreground truncate">{s.role}</p>
                    </div>
                    <div className="mt-2 border-t pt-1 text-[10px] text-muted-foreground">
                      {s.date}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 7. ACTIONS TOOLBAR (Contextual) */}
            <div className="rounded-xl border bg-card p-3 shadow-card">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-semibold text-muted-foreground">
                  Available Actions ({currentIndent.status}):
                </span>

                <div className="flex flex-wrap items-center gap-2">
                  {/* PENDING ACTIONS */}
                  {currentIndent.status === "Pending" && (
                    <>
                      <Button
                        size="sm"
                        className="h-8 gap-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                        onClick={() => setApproveModalOpen(true)}
                      >
                        <CheckCircle2 className="size-3.5" /> Approve Indent
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 gap-1 text-xs border-amber-500/40 text-amber-700 hover:bg-amber-500/10 dark:text-amber-400"
                        onClick={() => setSendBackModalOpen(true)}
                      >
                        <CornerUpLeft className="size-3.5" /> Send Back
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="h-8 gap-1 text-xs"
                        onClick={() => setRejectModalOpen(true)}
                      >
                        <XCircle className="size-3.5" /> Reject
                      </Button>
                    </>
                  )}

                  {/* APPROVED ACTIONS */}
                  {currentIndent.status === "Approved" && (
                    <Button
                      size="sm"
                      className="h-8 gap-1 text-xs"
                      onClick={() => setCreateRfqOpen(true)}
                    >
                      <Share2 className="size-3.5" /> Create Enquiry / RFQ
                    </Button>
                  )}

                  {/* DRAFT ACTIONS */}
                  {currentIndent.status === "Draft" && (
                    <>
                      <Button
                        size="sm"
                        className="h-8 gap-1 text-xs"
                        onClick={handleSubmitForApproval}
                      >
                        <Send className="size-3.5" /> Submit for Approval
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 gap-1 text-xs"
                        onClick={() =>
                          toast.info(
                            "Edit form loaded. You can modify quantities and specs directly.",
                          )
                        }
                      >
                        Edit Draft
                      </Button>
                    </>
                  )}

                  {/* REJECTED / RETURNED ACTIONS */}
                  {(currentIndent.status === "Rejected" ||
                    currentIndent.status === "Returned" ||
                    currentIndent.status === "Sent Back") && (
                    <Button
                      size="sm"
                      className="h-8 gap-1 text-xs"
                      onClick={handleResubmitRejected}
                    >
                      <CornerUpLeft className="size-3.5" /> Edit & Resubmit
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* 3. INDENT ITEMS TABLE (10 Columns) */}
            <div className="rounded-xl border bg-card p-4 shadow-card">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-2.5">
                <div>
                  <h3 className="text-sm font-semibold">
                    Requisition Line Items ({currentIndent.items.length})
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Required materials, unit rates, on-site stock, and approved specifications
                  </p>
                </div>
                <span className="font-mono text-xs font-semibold text-primary">
                  Total: {formatINR(totalIndentAmount, { compact: false })}
                </span>
              </div>

              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b bg-muted/40 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                      <th className="py-2.5 px-3 text-left">Item Code</th>
                      <th className="py-2.5 px-3 text-left min-w-[180px]">Item Description</th>
                      <th className="py-2.5 px-3 text-left">Category</th>
                      <th className="py-2.5 px-3 text-center">Unit</th>
                      <th className="py-2.5 px-3 text-right">Req. Qty</th>
                      <th className="py-2.5 px-3 text-right">Site Stock</th>
                      <th className="py-2.5 px-3 text-right">Indent Qty</th>
                      <th className="py-2.5 px-3 text-right">Rate (₹)</th>
                      <th className="py-2.5 px-3 text-right">Amount (₹)</th>
                      <th className="py-2.5 px-3 text-left min-w-[140px]">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {currentIndent.items.map((it, idx) => {
                      const amount = it.amount ?? (it.indentQty ?? it.quantity) * it.rate;
                      return (
                        <tr key={it.itemCode ?? idx} className="hover:bg-muted/30">
                          <td className="py-2.5 px-3 font-mono font-medium text-foreground">
                            {it.itemCode || `MAT-${101 + idx}`}
                          </td>
                          <td className="py-2.5 px-3">
                            <p className="font-medium text-foreground">{it.item}</p>
                            <p className="text-[11px] text-muted-foreground line-clamp-1">
                              {it.itemDescription}
                            </p>
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                              {it.category || "General Civil"}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-center text-muted-foreground">
                            {it.unit}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-muted-foreground">
                            {formatNumber(it.requestedQty ?? Math.round(it.quantity * 1.08))}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-muted-foreground">
                            {formatNumber(it.availableStock ?? Math.round(it.quantity * 0.12))}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-semibold text-foreground">
                            {formatNumber(it.indentQty ?? it.quantity)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-muted-foreground">
                            {formatINR(it.rate)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-foreground">
                            {formatINR(amount)}
                          </td>
                          <td className="py-2.5 px-3 text-[11px] text-muted-foreground">
                            {it.remarks || "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 bg-muted/30 font-semibold">
                      <td colSpan={6} className="py-2.5 px-3 text-left">
                        Total {currentIndent.items.length} Requisition Items
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-foreground">
                        {formatNumber(totalIndentQuantity)}
                      </td>
                      <td className="py-2.5 px-3 text-right text-muted-foreground">—</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-primary">
                        {formatINR(totalIndentAmount)}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* 5. ATTACHMENTS & 6. ACTIVITY TIMELINE (2-Column Grid) */}
            <div className="grid gap-4 md:grid-cols-2">
              {/* 5. ATTACHMENTS */}
              <div className="rounded-xl border bg-card p-4 shadow-card flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b pb-2.5">
                    <div className="flex items-center gap-2">
                      <Paperclip className="size-4 text-primary" />
                      <h3 className="text-sm font-semibold">
                        Attachments ({(currentIndent.attachments ?? []).length})
                      </h3>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs gap-1"
                      onClick={() => setAttachModalOpen(true)}
                    >
                      <Plus className="size-3" /> Attach Document
                    </Button>
                  </div>

                  <div className="mt-3 space-y-2.5">
                    {(currentIndent.attachments ?? []).length === 0 ? (
                      <p className="py-4 text-center text-xs text-muted-foreground">
                        No documents attached.
                      </p>
                    ) : (
                      (currentIndent.attachments ?? []).map((doc) => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between rounded-lg border p-2.5 text-xs hover:bg-muted/20"
                        >
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            {doc.fileType === "XLSX" ? (
                              <FileSpreadsheet className="size-6 text-emerald-600 shrink-0" />
                            ) : (
                              <FileText className="size-6 text-primary shrink-0" />
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-foreground truncate">{doc.fileName}</p>
                              <p className="text-[10px] text-muted-foreground">
                                {doc.fileSize} · Uploaded by {doc.uploadedBy} on{" "}
                                {formatDate(doc.uploadedDate)}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0 ml-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-7"
                              onClick={() => setPreviewAttachment(doc)}
                              title="Preview Document"
                            >
                              <Eye className="size-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-7"
                              onClick={() => toast.success(`Downloading ${doc.fileName}...`)}
                              title="Download Document"
                            >
                              <Download className="size-3.5" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* 6. ACTIVITY TIMELINE */}
              <div className="rounded-xl border bg-card p-4 shadow-card">
                <div className="flex items-center justify-between border-b pb-2.5">
                  <div className="flex items-center gap-2">
                    <Clock className="size-4 text-primary" />
                    <h3 className="text-sm font-semibold">Activity & Audit Timeline</h3>
                  </div>
                  <span className="text-[11px] text-muted-foreground">Chronological Log</span>
                </div>

                <div className="mt-3 relative pl-4 border-l border-border/80 space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
                  {displayedTimeline.map((evt) => (
                    <div key={evt.id} className="relative text-xs">
                      <div
                        className={cn(
                          "absolute -left-[21px] top-1 size-2.5 rounded-full border-2 bg-background",
                          evt.type === "approved" && "border-emerald-600 bg-emerald-600",
                          evt.type === "rejected" && "border-destructive bg-destructive",
                          evt.type === "returned" && "border-amber-600 bg-amber-600",
                          evt.type === "submitted" && "border-primary bg-primary",
                          evt.type === "created" && "border-muted-foreground",
                          evt.type === "comment" && "border-blue-500 bg-blue-500",
                          evt.type === "system" && "border-muted-foreground",
                        )}
                      />
                      <div>
                        <div className="flex items-baseline justify-between gap-2">
                          <p className="font-semibold text-foreground">{evt.title}</p>
                          <span className="text-[10px] text-muted-foreground">{evt.timestamp}</span>
                        </div>
                        <p className="mt-0.5 text-[11px] text-muted-foreground leading-snug">
                          {evt.description}
                        </p>
                        <p className="mt-0.5 text-[10px] text-muted-foreground/80">By {evt.user}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 8. COMMENTS & NOTES */}
            <div className="rounded-xl border bg-card p-4 shadow-card">
              <div className="flex items-center justify-between border-b pb-2.5">
                <div className="flex items-center gap-2">
                  <MessageSquare className="size-4 text-primary" />
                  <h3 className="text-sm font-semibold">
                    Internal Collaboration & Comments ({(currentIndent.comments ?? []).length})
                  </h3>
                </div>
                <span className="text-[11px] text-muted-foreground">Site & Purchase Team</span>
              </div>

              <div className="mt-3 space-y-3">
                {(currentIndent.comments ?? []).map((cm) => (
                  <div key={cm.id} className="rounded-lg border bg-surface/50 p-3 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="size-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[10px]">
                          {cm.author.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-semibold text-foreground">{cm.author}</span>
                          <span className="text-[10px] text-muted-foreground ml-1.5">
                            ({cm.role})
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] text-muted-foreground">{cm.timestamp}</span>
                    </div>
                    <p className="mt-2 text-foreground/90 leading-relaxed">{cm.text}</p>
                  </div>
                ))}

                {/* Comment Input */}
                <div className="pt-2">
                  <Textarea
                    placeholder="Write an internal comment, note or query regarding this indent..."
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    rows={2}
                    className="text-xs"
                  />
                  <div className="mt-2 flex justify-end">
                    <Button
                      size="sm"
                      className="h-8 gap-1 text-xs"
                      onClick={handlePostComment}
                      disabled={!newCommentText.trim()}
                    >
                      <Send className="size-3" /> Post Comment
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* STICKY FOOTER */}
          <div className="sticky bottom-0 z-20 flex items-center justify-between border-t bg-card px-5 py-3">
            <span className="text-xs text-muted-foreground">
              Total Requisition Value:{" "}
              <strong className="font-mono text-foreground">{formatINR(totalIndentAmount)}</strong>
            </span>
            <Button variant="outline" size="sm" onClick={onClose} className="h-8 text-xs">
              Close
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* MODAL: APPROVE INDENT */}
      <Dialog open={approveModalOpen} onOpenChange={setApproveModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Approve Indent {currentIndent.indentNo}</DialogTitle>
            <DialogDescription>
              Confirm approval for requisition of {currentIndent.itemCount} items worth{" "}
              {formatINR(totalIndentAmount)}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2 text-xs">
            <div>
              <Label htmlFor="appr-rem">Approval Remarks / Instructions (Optional)</Label>
              <Textarea
                id="appr-rem"
                placeholder="e.g. Approved. Priority dispatch requested within 10 days."
                value={approvalRemarks}
                onChange={(e) => setApprovalRemarks(e.target.value)}
                rows={3}
                className="mt-1 text-xs"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setApproveModalOpen(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleConfirmApprove}
              className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Confirm Approval
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL: REJECT INDENT */}
      <Dialog open={rejectModalOpen} onOpenChange={setRejectModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-destructive">
              Reject Indent {currentIndent.indentNo}
            </DialogTitle>
            <DialogDescription>
              Please specify the technical or budget ground for rejecting this site indent.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2 text-xs">
            <div>
              <Label htmlFor="rej-reas">
                Rejection Reason <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="rej-reas"
                placeholder="e.g. Discrepancy between BOQ permissible consumption and requested quantity."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
                className="mt-1 text-xs"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRejectModalOpen(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleConfirmReject}
              className="text-xs"
            >
              Reject Indent
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL: SEND BACK */}
      <Dialog open={sendBackModalOpen} onOpenChange={setSendBackModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Send Back Indent {currentIndent.indentNo}</DialogTitle>
            <DialogDescription>
              Return to {currentIndent.requestedBy} for required clarifications or adjustments.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2 text-xs">
            <div>
              <Label htmlFor="sb-query">
                Clarification Query <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="sb-query"
                placeholder="e.g. Please verify physical stock in warehouse before we issue new PO."
                value={sendBackQuery}
                onChange={(e) => setSendBackQuery(e.target.value)}
                rows={3}
                className="mt-1 text-xs"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSendBackModalOpen(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button size="sm" onClick={handleConfirmSendBack} className="text-xs">
              Send Back to Site
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CREATE RFQ DRAWER */}
      <CreateRfqDrawer
        indent={currentIndent}
        open={createRfqOpen}
        onClose={() => setCreateRfqOpen(false)}
        onRfqCreated={(newRfq) => {
          setCreateRfqOpen(false);
          toast.success(
            `Enquiry ${newRfq.enquiryNo} generated against Indent ${currentIndent.indentNo}. Opened in Enquiries register.`,
          );
        }}
      />

      {/* MODAL: ATTACH DOCUMENT */}
      <Dialog open={attachModalOpen} onOpenChange={setAttachModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Attach Document</DialogTitle>
            <DialogDescription>
              Attach site reports, drawings, or specification sheets.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2 text-xs">
            <div>
              <Label htmlFor="att-nam">Document Title / File Name</Label>
              <Input
                id="att-nam"
                placeholder="e.g. Third_Party_Test_Certificate"
                value={newAttachName}
                onChange={(e) => setNewAttachName(e.target.value)}
                className="mt-1 h-8 text-xs"
              />
            </div>
            <div>
              <Label htmlFor="att-typ">File Type</Label>
              <select
                id="att-typ"
                value={newAttachType}
                onChange={(e) => setNewAttachType(e.target.value)}
                className="mt-1 flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-xs ring-offset-background"
              >
                <option value="PDF">PDF Document</option>
                <option value="XLSX">Excel Spreadsheet (XLSX)</option>
                <option value="DOCX">Word Document (DOCX)</option>
                <option value="DWG">CAD Drawing (DWG)</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAttachModalOpen(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleAddAttachment}
              disabled={!newAttachName.trim()}
              className="text-xs"
            >
              Attach File
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL: PREVIEW DOCUMENT */}
      <Dialog
        open={Boolean(previewAttachment)}
        onOpenChange={(open) => !open && setPreviewAttachment(null)}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="size-4 text-primary" /> {previewAttachment?.fileName}
            </DialogTitle>
            <DialogDescription>
              Document Preview · {previewAttachment?.fileSize} · Uploaded by{" "}
              {previewAttachment?.uploadedBy} on{" "}
              {previewAttachment?.uploadedDate ? formatDate(previewAttachment.uploadedDate) : "—"}
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-lg border bg-surface/50 p-6 text-center text-xs text-muted-foreground my-2 space-y-3">
            <FileText className="size-12 mx-auto text-muted-foreground/60" />
            <p className="font-semibold text-foreground">{previewAttachment?.fileName}</p>
            <p>
              BUILDCORE Document Viewer: This {previewAttachment?.fileType} document has been
              digitally signed and stored in the secure project repository.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPreviewAttachment(null)}
              className="text-xs"
            >
              Close Preview
            </Button>
            <Button
              size="sm"
              onClick={() => {
                toast.success(`Downloading ${previewAttachment?.fileName}...`);
                setPreviewAttachment(null);
              }}
              className="text-xs gap-1"
            >
              <Download className="size-3.5" /> Download File
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
