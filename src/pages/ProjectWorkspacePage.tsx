import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  Calendar,
  CalendarClock,
  CheckCircle2,
  Clock,
  Download,
  FileCheck,
  FileSpreadsheet,
  FileText,
  HardHat,
  IndianRupee,
  Layers,
  MapPin,
  Package,
  Plus,
  ReceiptIndianRupee,
  Share2,
  ShieldAlert,
  ShoppingCart,
  TrendingUp,
  UserCheck,
  Users,
  Wallet,
  Warehouse,
  XCircle,
} from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { ChartCard, PanelCard } from "@/components/common/ChartCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ProjectHealthBadge } from "@/components/projects/ProjectHealthBadge";
import { ProjectHealthMatrix } from "@/components/projects/ProjectHealthMatrix";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { projectService } from "@/services/projectService";
import { InlineLoader } from "@/components/common/states";
import { formatDate, formatINR, formatNumber } from "@/utils/format";
import { toast } from "sonner";
import type { Project, Priority, ProjectDocItem, ProjectIssueItem } from "@/types";
import { PlanningWorkspace } from "@/components/planning/PlanningWorkspace";
import { BOQWorkspace } from "@/components/boq/BOQWorkspace";

interface ProjectWorkspacePageProps {
  projectId: string;
}

export function ProjectWorkspacePage({ projectId }: ProjectWorkspacePageProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [issueModalOpen, setIssueModalOpen] = useState(false);

  // Fetch project dynamically from service
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  // Project documents & issues local interactive state
  const [projectDocs, setProjectDocs] = useState<ProjectDocItem[]>([]);
  const [projectIssues, setProjectIssues] = useState<ProjectIssueItem[]>([]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    projectService
      .getProjectById(projectId)
      .then((data) => {
        if (mounted) {
          setProject(data ?? null);
          if (data?.documentsList) setProjectDocs(data.documentsList);
          if (data?.issuesList) setProjectIssues(data.issuesList);
        }
      })
      .catch((err) => {
        console.error("Failed to load project:", err);
        if (mounted) setProject(null);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [projectId]);

  // Tab datasets from service
  const projectName = project?.name ?? "";
  const [indentRefreshKey, setIndentRefreshKey] = useState(0);
  const boq = useMemo(() => projectService.getProjectBoq(projectName), [projectName]);
  const budget = useMemo(() => projectService.getProjectBudget(projectName), [projectName]);
  const plan = useMemo(() => projectService.getProjectPlan(projectName), [projectName]);
  const dprs = useMemo(() => projectService.getProjectDprs(projectName), [projectName]);
  const indents = useMemo(() => {
    if (indentRefreshKey < 0) return [];
    return projectService.getProjectIndents(projectName);
  }, [projectName, indentRefreshKey]);
  const purchaseOrders = useMemo(
    () => projectService.getProjectPurchaseOrders(projectName),
    [projectName],
  );
  const stock = useMemo(() => projectService.getProjectStock(projectName), [projectName]);
  const contractorBills = useMemo(
    () => projectService.getProjectContractorBills(projectName),
    [projectName],
  );
  const approvals = useMemo(() => projectService.getProjectApprovals(projectName), [projectName]);
  const ledger = useMemo(() => projectService.getProjectLedger(projectName), [projectName]);

  // Upload Doc Form state
  const [newDocTitle, setNewDocTitle] = useState("");
  const [newDocCategory, setNewDocCategory] = useState<ProjectDocItem["category"]>("Drawings");

  // Report Issue Form state
  const [newIssueTitle, setNewIssueTitle] = useState("");
  const [newIssueCategory, setNewIssueCategory] = useState<ProjectIssueItem["category"]>("Quality");
  const [newIssueSeverity, setNewIssueSeverity] = useState<Priority>("Medium");

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <InlineLoader label="Loading project workspace" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <Building2 className="size-12 text-muted-foreground/60" />
        <h2 className="mt-3 text-lg font-semibold">Project Not Found</h2>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          The project code or ID &quot;{projectId}&quot; does not exist or has been removed.
        </p>
        <Button asChild className="mt-4" size="sm">
          <Link to="/app/projects">
            <ArrowLeft className="mr-1.5 size-4" /> Return to Projects
          </Link>
        </Button>
      </div>
    );
  }

  // Calculated financials
  const fin = project.financials ?? {
    contractValue: project.budget * 1.08,
    budget: project.budget,
    actualCost: project.actualCost,
    committedCost: Math.round(project.budget * 0.25),
    balanceBudget: Math.max(0, project.budget - project.actualCost),
    billing: Math.round(project.actualCost * 1.15),
    collection: project.collection,
    outstanding: Math.max(0, Math.round(project.actualCost * 1.15) - project.collection),
    contingencyPct: 5.0,
    taxGstApplicable: "GST 18%",
  };

  // Procurement summary
  const proc = project.procurementSummary ?? {
    totalIndents: indents.length || 42,
    pendingIndents: indents.filter((i) => i.status === "Pending").length || 3,
    purchaseOrders: purchaseOrders.length || 36,
    poValue: purchaseOrders.reduce((s, p) => s + p.amount, 0) || 540000000,
    pendingGrn: 2,
  };

  // Inventory summary
  const inv = project.inventorySummary ?? {
    stockValue: stock.reduce((s, i) => s + i.value, 0) || 32500000,
    lowStockItems: stock.filter((s) => s.quantity <= s.reorderLevel).length || 2,
    materialReceived: Math.round(project.actualCost * 0.55),
    materialIssued: Math.round(project.actualCost * 0.52),
    materialConsumed: Math.round(project.actualCost * 0.5),
  };

  // Construction summary
  const constr = project.constructionSummary ?? {
    overallProgress: project.progress,
    plannedProgress: Math.min(100, project.progress + 4),
    actualProgress: project.progress,
    variance: -4.0,
  };

  const activityList = project.recentActivity ?? [
    {
      id: "act-1",
      action: "Cement consignment of 400 bags received at site store",
      category: "Material" as const,
      timestamp: "Today, 10:30 AM",
      user: project.projectManager || "Site Store",
      badgeTone: "success" as const,
    },
    {
      id: "act-2",
      action: `RCC slab progress logged for ${project.sites[0] || "Main Tower"}`,
      category: "Civil" as const,
      timestamp: "Yesterday, 05:00 PM",
      user: project.siteEngineer,
      badgeTone: "info" as const,
    },
  ];

  function handleUploadDoc() {
    if (!newDocTitle.trim()) {
      toast.error("Please enter a document title");
      return;
    }
    const docItem: ProjectDocItem = {
      id: `doc-${Date.now()}`,
      title: newDocTitle.trim(),
      category: newDocCategory,
      docNo: `DOC-${project?.code}-${projectDocs.length + 1}`,
      fileSize: "2.8 MB",
      uploadedAt: new Date().toISOString().slice(0, 10),
      uploadedBy: "Project User",
      fileType: "PDF",
      status: "Approved",
    };
    setProjectDocs((p) => [docItem, ...p]);
    setNewDocTitle("");
    setUploadModalOpen(false);
    toast.success("Document attached to project repository");
  }

  function handleCreateIssue() {
    if (!newIssueTitle.trim()) {
      toast.error("Please enter an issue summary");
      return;
    }
    const issueItem: ProjectIssueItem = {
      id: `iss-${Date.now()}`,
      issueNo: `ISS-${project?.code}-${projectIssues.length + 1}`,
      title: newIssueTitle.trim(),
      category: newIssueCategory,
      severity: newIssueSeverity,
      assignedTo: project?.projectManager || "Site Engineer",
      status: "Open",
      reportedDate: new Date().toISOString().slice(0, 10),
    };
    setProjectIssues((prev) => [issueItem, ...prev]);
    setNewIssueTitle("");
    setIssueModalOpen(false);
    toast.success("Site issue logged successfully");
  }

  return (
    <div className="space-y-4">
      {/* Enterprise Project Header */}
      <div className="rounded-xl border bg-card p-4 shadow-card sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3 text-xs">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild className="-ml-2 h-7 px-2 text-xs">
              <Link to="/app/projects">
                <ArrowLeft className="mr-1 size-3.5" /> Projects
              </Link>
            </Button>
            <span className="text-muted-foreground">/</span>
            <span className="font-mono text-xs text-muted-foreground">{project.code}</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              onClick={() => {
                toast.success("Project summary MIS report exported (PDF/Excel)");
              }}
            >
              <Download className="mr-1.5 size-3.5" /> Export MIS
            </Button>
            <Button size="sm" className="h-8 text-xs" onClick={() => setUploadModalOpen(true)}>
              <Plus className="mr-1.5 size-3.5" /> Attach Document
            </Button>
          </div>
        </div>

        {/* Title, Badges & Meta Row */}
        <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="font-display text-xl font-bold tracking-tight sm:text-2xl">
                {project.name}
              </h1>
              <StatusBadge value={project.status} />
              <ProjectHealthBadge health={project.health ?? "On Track"} />
            </div>

            <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Building2 className="size-3.5 text-primary" /> {project.type}
              </span>
              <span className="flex items-center gap-1">
                <UserCheck className="size-3.5 text-primary" /> Client:{" "}
                <strong className="font-medium text-foreground">{project.client}</strong>
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="size-3.5 text-primary" /> {project.location}
              </span>
              <span className="flex items-center gap-1">
                <HardHat className="size-3.5 text-primary" /> PM:{" "}
                <strong className="font-medium text-foreground">
                  {project.projectManager || project.siteEngineer}
                </strong>
              </span>
            </div>
          </div>

          {/* Timeline and Quick Progress */}
          <div className="flex flex-col items-end gap-1.5 sm:min-w-[220px]">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-muted-foreground">Timeline:</span>
              <span className="font-medium">
                {formatDate(project.startDate)} → {formatDate(project.expectedCompletion)}
              </span>
            </div>
            <div className="w-full">
              <div className="mb-1 flex justify-between text-xs">
                <span className="text-muted-foreground">Overall Progress</span>
                <span className="font-bold text-foreground">{project.progress}%</span>
              </div>
              <Progress value={project.progress} className="h-2" />
            </div>
          </div>
        </div>

        {/* Quick Highlights Strip */}
        <div className="mt-4 grid grid-cols-2 gap-3 border-t pt-3 text-xs sm:grid-cols-4 lg:grid-cols-6">
          <div>
            <span className="text-muted-foreground">Contract Value</span>
            <p className="font-semibold text-foreground">
              {formatINR(fin.contractValue, { compact: true })}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">Approved Budget</span>
            <p className="font-semibold text-foreground">
              {formatINR(fin.budget, { compact: true })}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">Actual Incurred</span>
            <p className="font-semibold text-foreground">
              {formatINR(fin.actualCost, { compact: true })}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">Committed Cost</span>
            <p className="font-semibold text-foreground">
              {formatINR(fin.committedCost, { compact: true })}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">Balance Budget</span>
            <p className="font-semibold text-success">
              {formatINR(fin.balanceBudget, { compact: true })}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">Collections</span>
            <p className="font-semibold text-foreground">
              {formatINR(fin.collection, { compact: true })}
            </p>
          </div>
        </div>
      </div>

      {/* 12 Enterprise Workspace Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="scrollbar-slim overflow-x-auto rounded-lg border bg-card p-1 shadow-sm">
          <TabsList className="h-9 w-max justify-start gap-1 bg-transparent p-0">
            <TabsTrigger value="overview" className="text-xs data-[state=active]:bg-muted">
              Overview
            </TabsTrigger>
            <TabsTrigger value="planning" className="text-xs data-[state=active]:bg-muted">
              Planning
            </TabsTrigger>
            <TabsTrigger value="boq" className="text-xs data-[state=active]:bg-muted">
              BOQ
            </TabsTrigger>
            <TabsTrigger value="procurement" className="text-xs data-[state=active]:bg-muted">
              Procurement
            </TabsTrigger>
            <TabsTrigger value="inventory" className="text-xs data-[state=active]:bg-muted">
              Inventory
            </TabsTrigger>
            <TabsTrigger value="construction" className="text-xs data-[state=active]:bg-muted">
              Construction
            </TabsTrigger>
            <TabsTrigger value="labour" className="text-xs data-[state=active]:bg-muted">
              Labour
            </TabsTrigger>
            <TabsTrigger value="expenses" className="text-xs data-[state=active]:bg-muted">
              Expenses
            </TabsTrigger>
            <TabsTrigger value="billing" className="text-xs data-[state=active]:bg-muted">
              Billing
            </TabsTrigger>
            <TabsTrigger value="documents" className="text-xs data-[state=active]:bg-muted">
              Documents ({projectDocs.length})
            </TabsTrigger>
            <TabsTrigger value="issues" className="text-xs data-[state=active]:bg-muted">
              Issues ({projectIssues.length})
            </TabsTrigger>
            <TabsTrigger value="approvals" className="text-xs data-[state=active]:bg-muted">
              Approvals ({approvals.length})
            </TabsTrigger>
          </TabsList>
        </div>

        {/* TAB 1: OVERVIEW */}
        <TabsContent value="overview" className="mt-4 space-y-4">
          {/* E. Project Health Matrix */}
          <ProjectHealthMatrix health={project.healthBreakdown} />

          {/* 1, 2, 3: Key Visual Performance Cards */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Project Progress"
              value={`${project.progress}%`}
              progress={project.progress}
              hint={`Planned: ${constr.plannedProgress}% (${constr.variance >= 0 ? "+" : ""}${constr.variance}%)`}
              icon={TrendingUp}
              tone={constr.variance >= 0 ? "success" : "warning"}
            />
            <StatCard
              label="Budget Utilized"
              value={`${Math.round((fin.actualCost / fin.budget) * 100)}%`}
              hint={`Actual: ${formatINR(fin.actualCost, { compact: true })} / Budget: ${formatINR(fin.budget, { compact: true })}`}
              icon={Wallet}
              tone="info"
            />
            <StatCard
              label="Timeline Status"
              value={project.health ?? "On Track"}
              hint={`${formatDate(project.startDate)} to ${formatDate(project.expectedCompletion)}`}
              icon={CalendarClock}
              tone={
                project.health === "On Track"
                  ? "success"
                  : project.health === "At Risk"
                    ? "warning"
                    : "danger"
              }
            />
            <StatCard
              label="Committed POs"
              value={formatINR(fin.committedCost, { compact: true })}
              hint={`${proc.purchaseOrders} Purchase Orders active`}
              icon={ShoppingCart}
            />
          </div>

          {/* 4. Financial Summary Card */}
          <div className="rounded-xl border bg-card p-4 shadow-card">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-sm font-semibold tracking-tight">Project Financial Summary</h3>
                <p className="text-xs text-muted-foreground">
                  Commercial position, budget commitments, client billing and receivables
                </p>
              </div>
              <span className="rounded bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                {fin.taxGstApplicable}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
              <div className="rounded-lg border bg-surface/50 p-3">
                <span className="text-[11px] text-muted-foreground">Contract Value</span>
                <p className="mt-1 font-mono text-sm font-bold">
                  {formatINR(fin.contractValue, { compact: true })}
                </p>
              </div>
              <div className="rounded-lg border bg-surface/50 p-3">
                <span className="text-[11px] text-muted-foreground">Project Budget</span>
                <p className="mt-1 font-mono text-sm font-bold">
                  {formatINR(fin.budget, { compact: true })}
                </p>
              </div>
              <div className="rounded-lg border bg-surface/50 p-3">
                <span className="text-[11px] text-muted-foreground">Actual Cost</span>
                <p className="mt-1 font-mono text-sm font-bold text-amber-600 dark:text-amber-400">
                  {formatINR(fin.actualCost, { compact: true })}
                </p>
              </div>
              <div className="rounded-lg border bg-surface/50 p-3">
                <span className="text-[11px] text-muted-foreground">Committed Cost</span>
                <p className="mt-1 font-mono text-sm font-bold">
                  {formatINR(fin.committedCost, { compact: true })}
                </p>
              </div>
              <div className="rounded-lg border bg-surface/50 p-3">
                <span className="text-[11px] text-muted-foreground">Balance Budget</span>
                <p className="mt-1 font-mono text-sm font-bold text-success">
                  {formatINR(fin.balanceBudget, { compact: true })}
                </p>
              </div>
              <div className="rounded-lg border bg-surface/50 p-3">
                <span className="text-[11px] text-muted-foreground">Revenue / Billing</span>
                <p className="mt-1 font-mono text-sm font-bold">
                  {formatINR(fin.billing, { compact: true })}
                </p>
              </div>
              <div className="rounded-lg border bg-surface/50 p-3">
                <span className="text-[11px] text-muted-foreground">Collection</span>
                <p className="mt-1 font-mono text-sm font-bold text-primary">
                  {formatINR(fin.collection, { compact: true })}
                </p>
              </div>
              <div className="rounded-lg border bg-surface/50 p-3">
                <span className="text-[11px] text-muted-foreground">Outstanding</span>
                <p className="mt-1 font-mono text-sm font-bold text-destructive">
                  {formatINR(fin.outstanding, { compact: true })}
                </p>
              </div>
            </div>
          </div>

          {/* 5 & 6 & 7: Procurement, Inventory & Construction Summaries */}
          <div className="grid gap-4 lg:grid-cols-3">
            {/* Procurement Summary */}
            <div className="rounded-xl border bg-card p-4 shadow-card">
              <div className="flex items-center justify-between border-b pb-2.5">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="size-4 text-primary" />
                  <h4 className="text-sm font-semibold">Procurement Summary</h4>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={() => setActiveTab("procurement")}
                >
                  View POs →
                </Button>
              </div>
              <div className="mt-3 space-y-2.5 text-xs">
                <div className="flex justify-between border-b pb-1.5">
                  <span className="text-muted-foreground">Total Indents Raised</span>
                  <span className="font-semibold">{proc.totalIndents}</span>
                </div>
                <div className="flex justify-between border-b pb-1.5">
                  <span className="text-muted-foreground">Pending Indent Approvals</span>
                  <span className="font-semibold text-warning-foreground">
                    {proc.pendingIndents}
                  </span>
                </div>
                <div className="flex justify-between border-b pb-1.5">
                  <span className="text-muted-foreground">Purchase Orders Issued</span>
                  <span className="font-semibold">{proc.purchaseOrders}</span>
                </div>
                <div className="flex justify-between border-b pb-1.5">
                  <span className="text-muted-foreground">Total PO Value</span>
                  <span className="font-semibold">
                    {formatINR(proc.poValue, { compact: true })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pending Site GRN Inspections</span>
                  <span className="font-semibold text-primary">{proc.pendingGrn} consignments</span>
                </div>
              </div>
            </div>

            {/* Inventory Summary */}
            <div className="rounded-xl border bg-card p-4 shadow-card">
              <div className="flex items-center justify-between border-b pb-2.5">
                <div className="flex items-center gap-2">
                  <Warehouse className="size-4 text-primary" />
                  <h4 className="text-sm font-semibold">Inventory Summary</h4>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={() => setActiveTab("inventory")}
                >
                  Stock Items →
                </Button>
              </div>
              <div className="mt-3 space-y-2.5 text-xs">
                <div className="flex justify-between border-b pb-1.5">
                  <span className="text-muted-foreground">Material Stock Value on Site</span>
                  <span className="font-semibold">
                    {formatINR(inv.stockValue, { compact: true })}
                  </span>
                </div>
                <div className="flex justify-between border-b pb-1.5">
                  <span className="text-muted-foreground">Low Stock Alert Items</span>
                  <span className="font-semibold text-destructive">
                    {inv.lowStockItems} items below safety limit
                  </span>
                </div>
                <div className="flex justify-between border-b pb-1.5">
                  <span className="text-muted-foreground">Cumulative Material Received</span>
                  <span className="font-semibold">
                    {formatINR(inv.materialReceived, { compact: true })}
                  </span>
                </div>
                <div className="flex justify-between border-b pb-1.5">
                  <span className="text-muted-foreground">Cumulative Material Issued</span>
                  <span className="font-semibold">
                    {formatINR(inv.materialIssued, { compact: true })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cumulative Site Consumed</span>
                  <span className="font-semibold text-success">
                    {formatINR(inv.materialConsumed, { compact: true })}
                  </span>
                </div>
              </div>
            </div>

            {/* Construction Progress */}
            <div className="rounded-xl border bg-card p-4 shadow-card">
              <div className="flex items-center justify-between border-b pb-2.5">
                <div className="flex items-center gap-2">
                  <HardHat className="size-4 text-primary" />
                  <h4 className="text-sm font-semibold">Construction Progress</h4>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={() => setActiveTab("construction")}
                >
                  View DPRs →
                </Button>
              </div>
              <div className="mt-3 space-y-3 text-xs">
                <div>
                  <div className="mb-1 flex justify-between">
                    <span className="text-muted-foreground">Overall Progress</span>
                    <span className="font-bold">{constr.overallProgress}%</span>
                  </div>
                  <Progress value={constr.overallProgress} className="h-2" />
                </div>
                <div className="grid grid-cols-3 gap-2 rounded-lg border bg-surface/50 p-2.5 text-center">
                  <div>
                    <span className="text-[11px] text-muted-foreground">Planned</span>
                    <p className="font-semibold">{constr.plannedProgress}%</p>
                  </div>
                  <div>
                    <span className="text-[11px] text-muted-foreground">Actual</span>
                    <p className="font-semibold">{constr.actualProgress}%</p>
                  </div>
                  <div>
                    <span className="text-[11px] text-muted-foreground">Variance</span>
                    <p
                      className={
                        constr.variance >= 0
                          ? "font-semibold text-success"
                          : "font-semibold text-destructive"
                      }
                    >
                      {constr.variance >= 0 ? "+" : ""}
                      {constr.variance}%
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Configuration</span>
                  <span className="font-medium text-foreground">
                    {project.configuration?.towersCount ?? 2} Towers ·{" "}
                    {project.configuration?.unitsCount ?? 120} Units ·{" "}
                    {project.configuration?.floorsCount ?? 18} Floors
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Planning & BOQ Integration Highlights */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border bg-card p-4 shadow-card">
              <div className="flex items-center justify-between border-b pb-2.5">
                <div className="flex items-center gap-2">
                  <CalendarClock className="size-4 text-primary" />
                  <h4 className="text-sm font-semibold">WBS Planning & Schedule</h4>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={() => setActiveTab("planning")}
                >
                  Open Planning →
                </Button>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Master WBS Status</span>
                <span className="font-medium text-foreground">Active Work Breakdown Structure</span>
              </div>
              <div className="mt-2 grid grid-cols-3 gap-2 rounded-lg border bg-surface/50 p-2.5 text-center text-xs">
                <div>
                  <span className="text-[11px] text-muted-foreground">Planned Start</span>
                  <p className="font-semibold text-foreground">{formatDate(project.startDate)}</p>
                </div>
                <div>
                  <span className="text-[11px] text-muted-foreground">Baseline End</span>
                  <p className="font-semibold text-foreground">
                    {formatDate(project.expectedCompletion)}
                  </p>
                </div>
                <div>
                  <span className="text-[11px] text-muted-foreground">Variance</span>
                  <p className="font-semibold text-amber-600">-4 Days</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border bg-card p-4 shadow-card">
              <div className="flex items-center justify-between border-b pb-2.5">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="size-4 text-emerald-600" />
                  <h4 className="text-sm font-semibold">BOQ & Material Requirements</h4>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={() => setActiveTab("boq")}
                >
                  Open BOQ & Materials →
                </Button>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Active BOQ Revision</span>
                <span className="font-medium text-foreground">BOQ Rev 02 - Approved</span>
              </div>
              <div className="mt-2 grid grid-cols-3 gap-2 rounded-lg border bg-surface/50 p-2.5 text-center text-xs">
                <div>
                  <span className="text-[11px] text-muted-foreground">BOQ Budget</span>
                  <p className="font-semibold text-foreground">
                    {formatINR(project.budget, { compact: true })}
                  </p>
                </div>
                <div>
                  <span className="text-[11px] text-muted-foreground">Execution</span>
                  <p className="font-semibold text-foreground">{project.progress}% Billed</p>
                </div>
                <div>
                  <span className="text-[11px] text-muted-foreground">Shortfalls</span>
                  <p className="font-semibold text-destructive">Procurement Required</p>
                </div>
              </div>
            </div>
          </div>

          {/* 8, 9 & 10: Open Issues, Pending Approvals & D. Recent Activity */}
          <div className="grid gap-4 lg:grid-cols-3">
            {/* Open Issues */}
            <div className="rounded-xl border bg-card p-4 shadow-card">
              <div className="flex items-center justify-between border-b pb-2.5">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="size-4 text-amber-500" />
                  <h4 className="text-sm font-semibold">Open Issues ({projectIssues.length})</h4>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => setIssueModalOpen(true)}
                >
                  <Plus className="mr-1 size-3" /> Log Issue
                </Button>
              </div>
              <div className="mt-3 space-y-2.5">
                {projectIssues.length === 0 ? (
                  <p className="py-4 text-center text-xs text-muted-foreground">
                    No open issues reported on site.
                  </p>
                ) : (
                  projectIssues.slice(0, 3).map((iss) => (
                    <div key={iss.id} className="rounded-lg border p-2.5 text-xs">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-medium text-foreground">{iss.title}</p>
                        <StatusBadge value={iss.severity} />
                      </div>
                      <div className="mt-1 flex items-center justify-between text-[11px] text-muted-foreground">
                        <span>
                          {iss.category} · {iss.issueNo}
                        </span>
                        <span>{iss.status}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Pending Approvals */}
            <div className="rounded-xl border bg-card p-4 shadow-card">
              <div className="flex items-center justify-between border-b pb-2.5">
                <div className="flex items-center gap-2">
                  <FileCheck className="size-4 text-primary" />
                  <h4 className="text-sm font-semibold">Pending Approvals ({approvals.length})</h4>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={() => setActiveTab("approvals")}
                >
                  Inbox →
                </Button>
              </div>
              <div className="mt-3 space-y-2.5">
                {approvals.length === 0 ? (
                  <p className="py-4 text-center text-xs text-muted-foreground">
                    All approval workflows up to date.
                  </p>
                ) : (
                  approvals.slice(0, 3).map((apv) => (
                    <div key={apv.id} className="rounded-lg border p-2.5 text-xs">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium text-foreground">
                            {apv.document}: {apv.docNo}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            Raised by {apv.raisedBy} · {apv.level}
                          </p>
                        </div>
                        <p className="font-mono font-semibold">
                          {formatINR(apv.amount, { compact: true })}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* D. Recent Activity Timeline */}
            <div className="rounded-xl border bg-card p-4 shadow-card">
              <div className="flex items-center justify-between border-b pb-2.5">
                <div className="flex items-center gap-2">
                  <Clock className="size-4 text-primary" />
                  <h4 className="text-sm font-semibold">Recent Site Activity</h4>
                </div>
                <span className="text-[11px] text-muted-foreground">Live Feed</span>
              </div>
              <div className="mt-3 space-y-3">
                {activityList.slice(0, 5).map((act) => (
                  <div key={act.id} className="flex items-start gap-2.5 text-xs">
                    <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                      {act.category === "PO" ? (
                        <ShoppingCart className="size-3" />
                      ) : act.category === "Material" ? (
                        <Package className="size-3" />
                      ) : act.category === "Civil" ? (
                        <HardHat className="size-3" />
                      ) : act.category === "Billing" ? (
                        <IndianRupee className="size-3" />
                      ) : (
                        <Clock className="size-3" />
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-foreground leading-snug">{act.action}</p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        {act.timestamp} · {act.user}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* TAB 2: PLANNING */}
        <TabsContent value="planning" className="mt-4">
          <PlanningWorkspace projectName={project.name} />
        </TabsContent>

        {/* TAB 3: BOQ */}
        <TabsContent value="boq" className="mt-4">
          <BOQWorkspace
            projectName={project.name}
            onIndentCreated={() => {
              setIndentRefreshKey((prev) => prev + 1);
            }}
          />
        </TabsContent>

        {/* TAB 4: PROCUREMENT */}
        <TabsContent value="procurement" className="mt-4 space-y-4">
          <PanelCard
            title="Purchase Orders for this Project"
            subtitle="Committed vendor orders, delivery status and payment terms"
          >
            <SimpleTable
              head={[
                "PO No",
                "Date",
                "Supplier",
                "Site / Tower",
                "Amount",
                "GST",
                "Total",
                "Delivery Date",
                "Status",
              ]}
              rows={purchaseOrders.map((po) => [
                po.poNo,
                formatDate(po.date),
                po.supplier,
                po.site,
                formatINR(po.amount, { compact: true }),
                formatINR(po.gst, { compact: true }),
                formatINR(po.total, { compact: true }),
                formatDate(po.deliveryDate),
                po.status,
              ])}
            />
          </PanelCard>

          <PanelCard
            title="Material Indents Raised by Site"
            subtitle="Requisitions submitted for store purchase"
          >
            <SimpleTable
              head={[
                "Indent No",
                "Date",
                "Site",
                "Required By",
                "Priority",
                "Items",
                "Value",
                "Status",
              ]}
              rows={indents.map((i) => [
                i.indentNo,
                formatDate(i.date),
                i.site,
                formatDate(i.requiredDate),
                i.priority,
                i.itemCount,
                formatINR(i.value, { compact: true }),
                i.status,
              ])}
            />
          </PanelCard>
        </TabsContent>

        {/* TAB 5: INVENTORY */}
        <TabsContent value="inventory" className="mt-4">
          <PanelCard
            title="Site Material Stock & Warehouse Inventory"
            subtitle="Stock on hand at project stores and reorder levels"
          >
            <SimpleTable
              head={[
                "Item Code",
                "Material Name",
                "Category",
                "Stock In Hand",
                "Unit",
                "Rate",
                "Stock Value",
                "Warehouse / Yard",
              ]}
              rows={stock.map((s) => [
                s.code,
                s.name,
                s.category,
                formatNumber(s.quantity),
                s.unit,
                formatINR(s.rate),
                formatINR(s.value, { compact: true }),
                s.warehouse,
              ])}
            />
          </PanelCard>
        </TabsContent>

        {/* TAB 6: CONSTRUCTION */}
        <TabsContent value="construction" className="mt-4">
          <PanelCard
            title="Daily Progress Reports (DPR)"
            subtitle="Site execution logs, weather records, machinery and manpower"
          >
            <SimpleTable
              head={[
                "DPR No",
                "Date",
                "Site Area",
                "Primary Activity",
                "Weather",
                "Skilled Labour",
                "Unskilled Labour",
                "Status",
              ]}
              rows={dprs.map((d) => [
                d.dprNo,
                formatDate(d.date),
                d.site,
                d.activities[0]?.activity ?? "Civil Works",
                d.weather,
                d.labour.skilled,
                d.labour.unskilled,
                d.status,
              ])}
            />
          </PanelCard>
        </TabsContent>

        {/* TAB 7: LABOUR */}
        <TabsContent value="labour" className="mt-4">
          <PanelCard
            title="Site Labour & Contractor Attendance"
            subtitle="Daily manpower deployment across skilled, unskilled and supervisory staff"
          >
            <SimpleTable
              head={[
                "Date",
                "Contractor / Agency",
                "Skilled Workers",
                "Unskilled Workers",
                "Supervisors",
                "Total Manpower",
                "Work Area",
              ]}
              rows={dprs.map((d) => [
                formatDate(d.date),
                "Prime Civil Infrastructure Agency",
                d.labour.skilled,
                d.labour.unskilled,
                d.labour.supervisors,
                d.labour.skilled + d.labour.unskilled + d.labour.supervisors,
                d.site,
              ])}
            />
          </PanelCard>
        </TabsContent>

        {/* TAB 8: EXPENSES */}
        <TabsContent value="expenses" className="mt-4">
          <PanelCard
            title="Project Site Expense Ledger"
            subtitle="Site petty cash vouchers, equipment hire, testing and survey overheads"
          >
            <SimpleTable
              head={[
                "Voucher No",
                "Date",
                "Account Head",
                "Narration",
                "Type",
                "Debit (₹)",
                "Credit (₹)",
              ]}
              rows={ledger.map((l) => [
                l.voucherNo,
                formatDate(l.date),
                l.account,
                l.narration,
                l.voucherType,
                l.debit ? formatINR(l.debit) : "—",
                l.credit ? formatINR(l.credit) : "—",
              ])}
            />
          </PanelCard>
        </TabsContent>

        {/* TAB 9: BILLING */}
        <TabsContent value="billing" className="mt-4">
          <PanelCard
            title="Contractor & Client Running Account (RA) Bills"
            subtitle="Work measurements, certified valuations, retention and TDS"
          >
            <SimpleTable
              head={[
                "Bill No",
                "Date",
                "Contractor",
                "Work Measurement",
                "Gross Amount",
                "Retention",
                "TDS",
                "Net Payable",
                "Payment Status",
              ]}
              rows={contractorBills.map((cb) => [
                cb.billNo,
                formatDate(cb.date),
                cb.contractor,
                cb.measurement,
                formatINR(cb.gross, { compact: true }),
                formatINR(cb.retention, { compact: true }),
                formatINR(cb.tds, { compact: true }),
                formatINR(cb.net, { compact: true }),
                cb.paymentStatus,
              ])}
            />
          </PanelCard>
        </TabsContent>

        {/* TAB 10: DOCUMENTS */}
        <TabsContent value="documents" className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Official project repository: RERA filings, GFC drawings, sanction orders,
              environmental clearances.
            </p>
            <Button size="sm" onClick={() => setUploadModalOpen(true)} className="text-xs">
              <Plus className="mr-1.5 size-3.5" /> Upload Document
            </Button>
          </div>

          <PanelCard title="Project Documents & Engineering Drawings">
            <SimpleTable
              head={[
                "Doc Number",
                "Document Title",
                "Category",
                "File Size",
                "Uploaded At",
                "Uploaded By",
                "Status",
              ]}
              rows={projectDocs.map((doc) => [
                doc.docNo,
                doc.title,
                doc.category,
                doc.fileSize,
                formatDate(doc.uploadedAt),
                doc.uploadedBy,
                doc.status,
              ])}
            />
          </PanelCard>
        </TabsContent>

        {/* TAB 11: ISSUES */}
        <TabsContent value="issues" className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Site snags, quality non-conformances, safety observations, and delay notices.
            </p>
            <Button size="sm" onClick={() => setIssueModalOpen(true)} className="text-xs">
              <Plus className="mr-1.5 size-3.5" /> Report Issue
            </Button>
          </div>

          <PanelCard title="Site Issues & Snag Register">
            <SimpleTable
              head={[
                "Issue ID",
                "Issue Title",
                "Category",
                "Severity",
                "Assigned To",
                "Reported Date",
                "Status",
              ]}
              rows={projectIssues.map((iss) => [
                iss.issueNo,
                iss.title,
                iss.category,
                iss.severity,
                iss.assignedTo,
                formatDate(iss.reportedDate),
                iss.status,
              ])}
            />
          </PanelCard>
        </TabsContent>

        {/* TAB 12: APPROVALS */}
        <TabsContent value="approvals" className="mt-4">
          <PanelCard
            title="Approval Workflows Linked to this Project"
            subtitle="Indents, Purchase Orders, and Contractor Bills awaiting verification"
          >
            <SimpleTable
              head={[
                "Document Type",
                "Document No",
                "Raised By",
                "Date",
                "Amount",
                "Approval Level",
                "Priority",
                "Status",
              ]}
              rows={approvals.map((apv) => [
                apv.document,
                apv.docNo,
                apv.raisedBy,
                formatDate(apv.date),
                formatINR(apv.amount, { compact: true }),
                apv.level,
                apv.priority,
                apv.status,
              ])}
            />
          </PanelCard>
        </TabsContent>
      </Tabs>

      {/* Upload Document Modal */}
      <Dialog open={uploadModalOpen} onOpenChange={setUploadModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">
              Attach Document to {project.name}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Upload drawings, agreements, or municipal approvals into the project file repository.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div>
              <Label htmlFor="ud-title">Document Title</Label>
              <Input
                id="ud-title"
                value={newDocTitle}
                onChange={(e) => setNewDocTitle(e.target.value)}
                placeholder="e.g. Tower B Structural GFC Rev 05"
                className="mt-1 h-8 text-xs"
              />
            </div>
            <div>
              <Label htmlFor="ud-cat">Document Category</Label>
              <Select
                value={newDocCategory}
                onValueChange={(v) => setNewDocCategory(v as ProjectDocItem["category"])}
              >
                <SelectTrigger id="ud-cat" className="mt-1 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Project Agreement">Project Agreement</SelectItem>
                  <SelectItem value="Drawings">Drawings</SelectItem>
                  <SelectItem value="Approvals">Approvals</SelectItem>
                  <SelectItem value="Other Documents">Other Documents</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="rounded border border-dashed p-4 text-center">
              <p className="text-[11px] text-muted-foreground">
                Drop PDF, DWG, XLSX file or click to browse
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setUploadModalOpen(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button size="sm" onClick={handleUploadDoc} className="text-xs">
              Upload Document
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Report Issue Modal */}
      <Dialog open={issueModalOpen} onOpenChange={setIssueModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">Report Site Snag / Issue</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Log an engineering defect, safety hazard or material shortage for {project.name}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div>
              <Label htmlFor="iss-title">Issue Summary</Label>
              <Input
                id="iss-title"
                value={newIssueTitle}
                onChange={(e) => setNewIssueTitle(e.target.value)}
                placeholder="e.g. Honeycombing observed on Pier cap 14"
                className="mt-1 h-8 text-xs"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="iss-cat">Category</Label>
                <Select
                  value={newIssueCategory}
                  onValueChange={(v) => setNewIssueCategory(v as ProjectIssueItem["category"])}
                >
                  <SelectTrigger id="iss-cat" className="mt-1 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Quality">Quality</SelectItem>
                    <SelectItem value="Safety">Safety</SelectItem>
                    <SelectItem value="Civil Delay">Civil Delay</SelectItem>
                    <SelectItem value="Material Shortage">Material Shortage</SelectItem>
                    <SelectItem value="Drawing Revision">Drawing Revision</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="iss-sev">Severity</Label>
                <Select
                  value={newIssueSeverity}
                  onValueChange={(v) => setNewIssueSeverity(v as Priority)}
                >
                  <SelectTrigger id="iss-sev" className="mt-1 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Urgent">Urgent</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIssueModalOpen(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button size="sm" onClick={handleCreateIssue} className="text-xs">
              Submit Issue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SimpleTable({ head, rows }: { head: string[]; rows: (string | number)[][] }) {
  if (!rows.length)
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        No records for this project yet.
      </p>
    );

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-xs">
        <thead className="bg-muted/50 text-[11px] uppercase tracking-wide text-muted-foreground">
          <tr>
            {head.map((h) => (
              <th key={h} className="whitespace-nowrap px-3 py-2 text-left font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y">
          {rows.map((r, i) => (
            <tr key={i} className="hover:bg-muted/40 transition-colors">
              {r.map((c, j) => (
                <td key={j} className="whitespace-nowrap px-3 py-2">
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
