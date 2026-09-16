import { useState, useMemo } from "react";
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Edit2,
  FolderPlus,
  HardHat,
  Layers,
  Plus,
  Trash2,
  TrendingUp,
  UserCheck,
} from "lucide-react";
import { StatCard } from "@/components/common/StatCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
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
import { formatDate } from "@/utils/format";
import { toast } from "sonner";
import type { WBSNode, WBSActivity, WbsActivityStatus, Priority } from "@/types";
import { cn } from "@/lib/utils";

interface PlanningWorkspaceProps {
  projectName: string;
}

export function PlanningWorkspace({ projectName }: PlanningWorkspaceProps) {
  const [nodes, setNodes] = useState<WBSNode[]>(() => projectService.getWbsHierarchy(projectName));

  // Expand / collapse state for parent WBS groups
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>(() => ({
    "01": true,
    "02": true,
    "03": true,
    "04": true,
  }));

  // Modals state
  const [addNodeOpen, setAddNodeOpen] = useState(false);
  const [addActOpen, setAddActOpen] = useState(false);
  const [editActOpen, setEditActOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  // Add WBS Node form
  const [newNodeCode, setNewNodeCode] = useState("");
  const [newNodeName, setNewNodeName] = useState("");

  // Add/Edit Activity form
  const [selectedParentWbs, setSelectedParentWbs] = useState("02");
  const [actWbsCode, setActWbsCode] = useState("02.07");
  const [actName, setActName] = useState("");
  const [actResponsible, setActResponsible] = useState("Sachin Kadam (PM)");
  const [actStartDate, setActStartDate] = useState("2026-10-01");
  const [actEndDate, setActEndDate] = useState("2026-11-15");
  const [actPlannedProgress, setActPlannedProgress] = useState("50");
  const [actActualProgress, setActActualProgress] = useState("35");
  const [actStatus, setActStatus] = useState<WbsActivityStatus>("In Progress");
  const [actPriority, setActPriority] = useState<Priority>("High");
  const [actDependency, setActDependency] = useState("02.04");
  const [actCriticalPath, setActCriticalPath] = useState(false);

  // Edit / Delete target
  const [targetActivityId, setTargetActivityId] = useState<string | null>(null);

  function reloadHierarchy() {
    setNodes(projectService.getWbsHierarchy(projectName));
  }

  // Live Planning Summary
  const summary = useMemo(() => {
    const all = nodes.flatMap((n) => n.activities);
    const total = all.length;
    if (total === 0) {
      return {
        plannedStart: "2026-06-01",
        plannedCompletion: "2027-04-30",
        overallProgress: 0,
        plannedProgress: 0,
        scheduleVariance: 0,
        totalActivities: 0,
        completedActivities: 0,
        delayedActivities: 0,
        criticalActivities: 0,
      };
    }
    const overall = Math.round(all.reduce((s, a) => s + a.actualProgress, 0) / total);
    const planned = Math.round(all.reduce((s, a) => s + a.plannedProgress, 0) / total);
    const variance = overall - planned;
    const completed = all.filter((a) => a.status === "Completed").length;
    const delayed = all.filter((a) => a.status === "Delayed").length;
    const critical = all.filter((a) => a.criticalPath).length;

    const starts = all.map((a) => a.startDate).sort();
    const ends = all.map((a) => a.endDate).sort();

    return {
      plannedStart: starts[0] || "2026-06-01",
      plannedCompletion: ends[ends.length - 1] || "2027-04-30",
      overallProgress: overall,
      plannedProgress: planned,
      scheduleVariance: variance,
      totalActivities: total,
      completedActivities: completed,
      delayedActivities: delayed,
      criticalActivities: critical,
    };
  }, [nodes]);

  function toggleExpand(code: string) {
    setExpandedNodes((prev) => ({ ...prev, [code]: !prev[code] }));
  }

  function toggleAll(expand: boolean) {
    const updated: Record<string, boolean> = {};
    nodes.forEach((n) => {
      updated[n.code] = expand;
    });
    setExpandedNodes(updated);
  }

  // Handle Add Parent WBS Group
  function handleAddNode() {
    if (!newNodeCode.trim() || !newNodeName.trim()) {
      toast.error("Please enter WBS Code and Section Name");
      return;
    }
    projectService.addWbsNode(projectName, newNodeCode, newNodeName);
    setNewNodeCode("");
    setNewNodeName("");
    setAddNodeOpen(false);
    reloadHierarchy();
    toast.success(`WBS Section ${newNodeCode} added successfully`);
  }

  // Handle Open Add Activity
  function openAddActivity(parentCode?: string) {
    const parent = parentCode || nodes[0]?.code || "01";
    setSelectedParentWbs(parent);
    const targetNode = nodes.find((n) => n.code === parent);
    const nextIdx = (targetNode?.activities.length || 0) + 1;
    const pad = nextIdx < 10 ? `0${nextIdx}` : `${nextIdx}`;
    setActWbsCode(`${parent}.${pad}`);
    setActName("");
    setActPlannedProgress("0");
    setActActualProgress("0");
    setActStatus("Not Started");
    setActPriority("Medium");
    setActDependency("—");
    setActCriticalPath(false);
    setAddActOpen(true);
  }

  // Handle Submit Add Activity
  function handleSubmitAddActivity() {
    if (!actName.trim() || !actWbsCode.trim()) {
      toast.error("Activity Name and WBS Code are required");
      return;
    }

    const start = new Date(actStartDate).getTime();
    const end = new Date(actEndDate).getTime();
    const duration = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)));
    const plan = Number(actPlannedProgress) || 0;
    const act = Number(actActualProgress) || 0;

    projectService.addWbsActivity(projectName, {
      wbsCode: actWbsCode.trim(),
      name: actName.trim(),
      parentWbs: selectedParentWbs,
      responsible: actResponsible,
      startDate: actStartDate,
      endDate: actEndDate,
      duration,
      plannedProgress: plan,
      actualProgress: act,
      variance: act - plan,
      status: actStatus,
      dependency: actDependency,
      priority: actPriority,
      criticalPath: actCriticalPath,
      project: projectName,
    });

    setAddActOpen(false);
    reloadHierarchy();
    toast.success(`Activity ${actWbsCode} added to project schedule`);
  }

  // Handle Open Edit Activity
  function openEditActivity(act: WBSActivity) {
    setTargetActivityId(act.id);
    setSelectedParentWbs(act.parentWbs);
    setActWbsCode(act.wbsCode);
    setActName(act.name);
    setActResponsible(act.responsible);
    setActStartDate(act.startDate);
    setActEndDate(act.endDate);
    setActPlannedProgress(String(act.plannedProgress));
    setActActualProgress(String(act.actualProgress));
    setActStatus(act.status);
    setActPriority(act.priority);
    setActDependency(act.dependency || "—");
    setActCriticalPath(Boolean(act.criticalPath));
    setEditActOpen(true);
  }

  // Handle Submit Edit Activity
  function handleSubmitEditActivity() {
    if (!targetActivityId) return;
    const start = new Date(actStartDate).getTime();
    const end = new Date(actEndDate).getTime();
    const duration = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)));
    const plan = Number(actPlannedProgress) || 0;
    const act = Number(actActualProgress) || 0;

    projectService.updateWbsActivity(projectName, targetActivityId, {
      name: actName,
      wbsCode: actWbsCode,
      responsible: actResponsible,
      startDate: actStartDate,
      endDate: actEndDate,
      duration,
      plannedProgress: plan,
      actualProgress: act,
      status: actStatus,
      priority: actPriority,
      dependency: actDependency,
      criticalPath: actCriticalPath,
    });

    setEditActOpen(false);
    reloadHierarchy();
    toast.success("Activity details updated");
  }

  // Handle Delete Activity
  function handleConfirmDelete() {
    if (!targetActivityId) return;
    projectService.deleteWbsActivity(projectName, targetActivityId);
    setDeleteConfirmOpen(false);
    setTargetActivityId(null);
    reloadHierarchy();
    toast.success("Activity removed from WBS");
  }

  return (
    <div className="space-y-4">
      {/* 1. Planning Summary KPI Cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Overall Progress"
          value={`${summary.overallProgress}%`}
          progress={summary.overallProgress}
          hint={`Planned: ${summary.plannedProgress}% (${summary.scheduleVariance >= 0 ? "+" : ""}${summary.scheduleVariance}%)`}
          icon={TrendingUp}
          tone={summary.scheduleVariance >= 0 ? "success" : "warning"}
        />
        <StatCard
          label="Schedule Timeline"
          value={`${formatDate(summary.plannedStart)}`}
          hint={`Target Finish: ${formatDate(summary.plannedCompletion)}`}
          icon={Calendar}
          tone="info"
        />
        <StatCard
          label="Activities Overview"
          value={String(summary.totalActivities)}
          hint={`${summary.completedActivities} Completed · ${summary.delayedActivities} Delayed`}
          icon={Layers}
        />
        <StatCard
          label="Critical Path Tasks"
          value={String(summary.criticalActivities)}
          hint="Zero float / High schedule risk"
          icon={AlertTriangle}
          tone={summary.criticalActivities > 0 ? "warning" : "default"}
        />
      </div>

      {/* 2. Main WBS Hierarchy Workspace */}
      <div className="rounded-xl border bg-card shadow-card">
        {/* Workspace Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b p-4">
          <div>
            <h3 className="text-sm font-semibold tracking-tight">Work Breakdown Structure (WBS)</h3>
            <p className="text-xs text-muted-foreground">
              Multi-tier hierarchical activity breakdown, durations, schedule variance, and critical
              dependencies
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              onClick={() => toggleAll(true)}
            >
              Expand All
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              onClick={() => toggleAll(false)}
            >
              Collapse All
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              onClick={() => setAddNodeOpen(true)}
            >
              <FolderPlus className="mr-1.5 size-3.5" /> Add WBS Level
            </Button>
            <Button size="sm" className="h-8 text-xs" onClick={() => openAddActivity()}>
              <Plus className="mr-1.5 size-3.5" /> Add Activity
            </Button>
          </div>
        </div>

        {/* WBS Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-muted/50 text-[11px] uppercase tracking-wide text-muted-foreground border-b">
              <tr>
                <th className="w-10 px-3 py-2.5 text-center"></th>
                <th className="px-3 py-2.5 text-left font-medium">WBS Code</th>
                <th className="px-3 py-2.5 text-left font-medium min-w-[240px]">
                  Activity Description
                </th>
                <th className="px-3 py-2.5 text-left font-medium">Responsible</th>
                <th className="px-3 py-2.5 text-left font-medium">Dates</th>
                <th className="px-3 py-2.5 text-center font-medium">Duration</th>
                <th className="px-3 py-2.5 text-left font-medium min-w-[120px]">
                  Planned vs Actual
                </th>
                <th className="px-3 py-2.5 text-center font-medium">Variance</th>
                <th className="px-3 py-2.5 text-left font-medium">Dependency</th>
                <th className="px-3 py-2.5 text-left font-medium">Status</th>
                <th className="px-3 py-2.5 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {nodes.map((node) => {
                const isExpanded = expandedNodes[node.code] ?? true;
                return (
                  <div key={node.id} style={{ display: "contents" }}>
                    {/* Parent WBS Row */}
                    <tr className="bg-muted/20 font-semibold hover:bg-muted/40 transition-colors">
                      <td className="px-3 py-2.5 text-center">
                        <button
                          type="button"
                          onClick={() => toggleExpand(node.code)}
                          className="rounded p-1 hover:bg-muted text-muted-foreground"
                          aria-label="Toggle WBS group"
                        >
                          {isExpanded ? (
                            <ChevronDown className="size-3.5" />
                          ) : (
                            <ChevronRight className="size-3.5" />
                          )}
                        </button>
                      </td>
                      <td className="px-3 py-2.5 font-mono text-xs font-bold text-primary">
                        {node.code}
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground">{node.name}</span>
                          <span className="rounded bg-muted px-1.5 py-0.2 text-[10px] text-muted-foreground">
                            {node.activities.length} tasks
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-muted-foreground">—</td>
                      <td className="px-3 py-2.5 text-muted-foreground">—</td>
                      <td className="px-3 py-2.5 text-center text-muted-foreground">
                        {node.activities.reduce((s, a) => s + a.duration, 0)}d
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2">
                          <Progress value={node.progress} className="h-2 flex-1" />
                          <span className="font-mono text-[11px] font-bold">{node.progress}%</span>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-center font-mono">
                        {node.progress - node.plannedProgress >= 0 ? (
                          <span className="text-success font-semibold">
                            +{node.progress - node.plannedProgress}%
                          </span>
                        ) : (
                          <span className="text-destructive font-semibold">
                            {node.progress - node.plannedProgress}%
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-muted-foreground">—</td>
                      <td className="px-3 py-2.5">
                        <StatusBadge
                          value={
                            node.progress === 100
                              ? "Completed"
                              : node.progress > 0
                                ? "In Progress"
                                : "Not Started"
                          }
                        />
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => openAddActivity(node.code)}
                        >
                          <Plus className="mr-1 size-3" /> Add Task
                        </Button>
                      </td>
                    </tr>

                    {/* Child Activity Rows */}
                    {isExpanded &&
                      node.activities.map((act) => (
                        <tr key={act.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-3 py-2 text-center text-muted-foreground">
                            <span className="text-muted-foreground/50">└</span>
                          </td>
                          <td className="px-3 py-2 font-mono text-xs text-muted-foreground pl-6">
                            {act.wbsCode}
                          </td>
                          <td className="px-3 py-2">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-foreground">{act.name}</span>
                              {act.criticalPath && (
                                <span className="rounded bg-destructive/10 px-1.5 py-0.2 text-[10px] font-semibold text-destructive">
                                  Critical
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-3 py-2 text-muted-foreground">{act.responsible}</td>
                          <td className="px-3 py-2 text-muted-foreground">
                            {formatDate(act.startDate)} → {formatDate(act.endDate)}
                          </td>
                          <td className="px-3 py-2 text-center font-mono">{act.duration}d</td>
                          <td className="px-3 py-2">
                            <div className="space-y-1">
                              <div className="flex justify-between text-[10px] text-muted-foreground">
                                <span>Act: {act.actualProgress}%</span>
                                <span>Plan: {act.plannedProgress}%</span>
                              </div>
                              <Progress value={act.actualProgress} className="h-1.5" />
                            </div>
                          </td>
                          <td className="px-3 py-2 text-center font-mono text-[11px]">
                            {act.variance >= 0 ? (
                              <span className="text-success font-medium">+{act.variance}%</span>
                            ) : (
                              <span className="text-destructive font-medium">{act.variance}%</span>
                            )}
                          </td>
                          <td className="px-3 py-2 font-mono text-muted-foreground">
                            {act.dependency || "—"}
                          </td>
                          <td className="px-3 py-2">
                            <StatusBadge value={act.status} />
                          </td>
                          <td className="px-3 py-2 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                                onClick={() => openEditActivity(act)}
                                aria-label="Edit Activity"
                              >
                                <Edit2 className="size-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 text-destructive/80 hover:text-destructive"
                                onClick={() => {
                                  setTargetActivityId(act.id);
                                  setDeleteConfirmOpen(true);
                                }}
                                aria-label="Delete Activity"
                              >
                                <Trash2 className="size-3" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </div>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add WBS Parent Level Modal */}
      <Dialog open={addNodeOpen} onOpenChange={setAddNodeOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">Add WBS Parent Group</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Create a primary branch in the project work breakdown structure (e.g. 05 External
              Infra).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div>
              <Label htmlFor="node-code">WBS Level Code</Label>
              <Input
                id="node-code"
                placeholder="e.g. 05"
                value={newNodeCode}
                onChange={(e) => setNewNodeCode(e.target.value)}
                className="mt-1 h-8 text-xs font-mono"
              />
            </div>
            <div>
              <Label htmlFor="node-name">WBS Section Name</Label>
              <Input
                id="node-name"
                placeholder="e.g. External Infrastructure & Landscaping"
                value={newNodeName}
                onChange={(e) => setNewNodeName(e.target.value)}
                className="mt-1 h-8 text-xs"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAddNodeOpen(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button size="sm" onClick={handleAddNode} className="text-xs">
              Create WBS Group
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Activity Modal */}
      <Dialog open={addActOpen} onOpenChange={setAddActOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">Add WBS Activity</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Define task schedule, duration, responsible personnel, and critical dependencies.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-3 py-2 text-xs">
            <div>
              <Label htmlFor="act-parent">Parent WBS</Label>
              <Select value={selectedParentWbs} onValueChange={setSelectedParentWbs}>
                <SelectTrigger id="act-parent" className="mt-1 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {nodes.map((n) => (
                    <SelectItem key={n.code} value={n.code} className="text-xs">
                      {n.code} {n.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="act-code">Activity WBS Code</Label>
              <Input
                id="act-code"
                value={actWbsCode}
                onChange={(e) => setActWbsCode(e.target.value)}
                className="mt-1 h-8 text-xs font-mono"
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="act-name">Activity Name</Label>
              <Input
                id="act-name"
                placeholder="e.g. Plinth beam formwork & casting"
                value={actName}
                onChange={(e) => setActName(e.target.value)}
                className="mt-1 h-8 text-xs"
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="act-resp">Responsible Person / Agency</Label>
              <Input
                id="act-resp"
                value={actResponsible}
                onChange={(e) => setActResponsible(e.target.value)}
                className="mt-1 h-8 text-xs"
              />
            </div>

            <div>
              <Label htmlFor="act-start">Start Date</Label>
              <Input
                id="act-start"
                type="date"
                value={actStartDate}
                onChange={(e) => setActStartDate(e.target.value)}
                className="mt-1 h-8 text-xs"
              />
            </div>

            <div>
              <Label htmlFor="act-end">End Date</Label>
              <Input
                id="act-end"
                type="date"
                value={actEndDate}
                onChange={(e) => setActEndDate(e.target.value)}
                className="mt-1 h-8 text-xs"
              />
            </div>

            <div>
              <Label htmlFor="act-status">Initial Status</Label>
              <Select value={actStatus} onValueChange={(v) => setActStatus(v as WbsActivityStatus)}>
                <SelectTrigger id="act-status" className="mt-1 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Not Started">Not Started</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Delayed">Delayed</SelectItem>
                  <SelectItem value="On Hold">On Hold</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="act-priority">Priority</Label>
              <Select value={actPriority} onValueChange={(v) => setActPriority(v as Priority)}>
                <SelectTrigger id="act-priority" className="mt-1 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="act-dep">Predecessor Dependency</Label>
              <Input
                id="act-dep"
                placeholder="e.g. 02.03"
                value={actDependency}
                onChange={(e) => setActDependency(e.target.value)}
                className="mt-1 h-8 text-xs font-mono"
              />
            </div>

            <div className="flex items-center gap-2 pt-5">
              <input
                id="act-crit"
                type="checkbox"
                checked={actCriticalPath}
                onChange={(e) => setActCriticalPath(e.target.checked)}
                className="size-4 rounded border-gray-300"
              />
              <Label htmlFor="act-crit" className="text-xs cursor-pointer">
                Critical Path Activity
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAddActOpen(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button size="sm" onClick={handleSubmitAddActivity} className="text-xs">
              Add Activity
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Activity Modal */}
      <Dialog open={editActOpen} onOpenChange={setEditActOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">
              Edit Activity: {actWbsCode}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Update progress percentages, completion dates, or contractor assignments.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-3 py-2 text-xs">
            <div className="col-span-2">
              <Label>Activity Name</Label>
              <Input
                value={actName}
                onChange={(e) => setActName(e.target.value)}
                className="mt-1 h-8 text-xs"
              />
            </div>

            <div>
              <Label>Actual Progress (%)</Label>
              <Input
                type="number"
                min={0}
                max={100}
                value={actActualProgress}
                onChange={(e) => setActActualProgress(e.target.value)}
                className="mt-1 h-8 text-xs"
              />
            </div>

            <div>
              <Label>Planned Progress (%)</Label>
              <Input
                type="number"
                min={0}
                max={100}
                value={actPlannedProgress}
                onChange={(e) => setActPlannedProgress(e.target.value)}
                className="mt-1 h-8 text-xs"
              />
            </div>

            <div>
              <Label>Status</Label>
              <Select value={actStatus} onValueChange={(v) => setActStatus(v as WbsActivityStatus)}>
                <SelectTrigger className="mt-1 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Not Started">Not Started</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Delayed">Delayed</SelectItem>
                  <SelectItem value="On Hold">On Hold</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Priority</Label>
              <Select value={actPriority} onValueChange={(v) => setActPriority(v as Priority)}>
                <SelectTrigger className="mt-1 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Start Date</Label>
              <Input
                type="date"
                value={actStartDate}
                onChange={(e) => setActStartDate(e.target.value)}
                className="mt-1 h-8 text-xs"
              />
            </div>

            <div>
              <Label>End Date</Label>
              <Input
                type="date"
                value={actEndDate}
                onChange={(e) => setActEndDate(e.target.value)}
                className="mt-1 h-8 text-xs"
              />
            </div>

            <div className="col-span-2">
              <Label>Responsible Person</Label>
              <Input
                value={actResponsible}
                onChange={(e) => setActResponsible(e.target.value)}
                className="mt-1 h-8 text-xs"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditActOpen(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button size="sm" onClick={handleSubmitEditActivity} className="text-xs">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">Delete Activity</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Are you sure you want to remove this activity from the WBS schedule? This action
              cannot be undone.
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
              onClick={handleConfirmDelete}
              className="text-xs"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
