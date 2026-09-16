import { request, type BackendResponse } from "@/services/http";
import {
  boqLines,
  budgetLines,
  workPlan,
  dprs,
  indents,
  purchaseOrders,
  stockItems,
  contractors,
  contractorBills,
  approvalTasks,
  ledgerEntries,
} from "@/mock/data";
import type {
  Project,
  BackendProject,
  ProjectRequest,
  ProjectHealth,
  ProjectStatus,
  ProjectType,
  BoqLine,
  BudgetLine,
  WorkPlanTask,
  Dpr,
  Indent,
  PurchaseOrder,
  StockItem,
  ContractorBill,
  ApprovalTask,
  LedgerEntry,
  ProjectIssueItem,
  ProjectDocItem,
  WBSNode,
  WBSActivity,
  PlanningSummary,
  BOQItem,
  BOQRevision,
  MaterialRequirement,
  Priority,
} from "@/types";
import {
  defaultWbsNodes,
  defaultBoqItems,
  defaultBoqRevisions,
  defaultMaterialRequirements,
} from "@/mock/planningAndBoqData";

function mapStatus(s?: string | null): ProjectStatus {
  if (!s) return "Planning";
  const upper = s.toUpperCase();
  if (upper === "ACTIVE" || upper === "IN_PROGRESS") return "In Progress";
  if (upper === "COMPLETED") return "Completed";
  if (upper === "ON_HOLD") return "On Hold";
  if (upper === "NOT_STARTED") return "Not Started";
  if (upper === "CANCELLED") return "Cancelled";
  if (upper === "PLANNED" || upper === "PLANNING") return "Planning";
  return "In Progress";
}

function mapType(t?: string | null): ProjectType {
  if (!t) return "Commercial";
  const lower = t.toLowerCase();
  if (lower.includes("resid")) return "Residential";
  if (lower.includes("comm")) return "Commercial";
  if (lower.includes("infra")) return "Infrastructure";
  if (lower.includes("mix")) return "Mixed Use";
  if (lower.includes("indus")) return "Industrial";
  return "Commercial";
}

export function mapBackendProjectToProject(bp: BackendProject): Project {
  const status = mapStatus(bp.status);
  const type = mapType(bp.projectType);
  const startDate = bp.startDate || new Date().toISOString().slice(0, 10);
  const expectedCompletion = bp.expectedEndDate || bp.startDate || "2028-12-31";
  const locParts = (bp.location || "Pune, Maharashtra").split(",");
  const city = locParts[0]?.trim() || "Pune";
  const state = locParts[1]?.trim() || "Maharashtra";

  let progress = 0;
  if (status === "Completed") progress = 100;
  else if (status === "In Progress") progress = 35;
  else if (status === "On Hold") progress = 20;

  const defaultBudget = 150000000;
  const actualCost = Math.round(defaultBudget * (progress / 100) * 0.85);

  return {
    id: String(bp.id),
    companyId: bp.companyId,
    code: bp.code,
    name: bp.name,
    type,
    projectType: bp.projectType || type,
    client: "Client Entity",
    siteEngineer: "Site Engineer",
    projectManager: "Project Manager",
    location: bp.location || `${city}, ${state}`,
    startDate,
    expectedCompletion,
    expectedEndDate: bp.expectedEndDate || undefined,
    actualEndDate: bp.actualEndDate || undefined,
    budget: defaultBudget,
    actualCost,
    progress,
    status,
    health: "On Track",
    sites: [`${bp.name} Main Site`],
    soldValue: 0,
    collection: 0,
    description: bp.description || `Project ${bp.name} (${bp.code})`,
    locationDetails: {
      address: bp.location || "Site Office",
      city,
      state,
      pincode: "411001",
      siteName: `${bp.name} Site`,
    },
    financials: {
      contractValue: Math.round(defaultBudget * 1.15),
      budget: defaultBudget,
      actualCost,
      committedCost: Math.round(defaultBudget * 0.4),
      balanceBudget: defaultBudget - actualCost,
      billing: Math.round(actualCost * 1.1),
      collection: Math.round(actualCost * 0.9),
      outstanding: Math.round(actualCost * 0.2),
      contingencyPct: 5.0,
      taxGstApplicable: "GST 18%",
    },
    configuration: {
      towersCount: 1,
      unitsCount: 50,
      floorsCount: 10,
      projectArea: 50000,
      uom: "Sq.Ft",
    },
    healthBreakdown: {
      schedule: "Healthy",
      budget: "Healthy",
      cost: "Healthy",
      procurement: "Healthy",
      construction: "Healthy",
      notes: {
        schedule: "Schedule tracked against project milestones.",
        budget: "Budget managed via cost codes.",
      },
    },
    procurementSummary: {
      totalIndents: 0,
      pendingIndents: 0,
      purchaseOrders: 0,
      poValue: 0,
      pendingGrn: 0,
    },
    inventorySummary: {
      stockValue: 0,
      lowStockItems: 0,
      materialReceived: 0,
      materialIssued: 0,
      materialConsumed: 0,
    },
    constructionSummary: {
      overallProgress: progress,
      plannedProgress: progress + 5,
      actualProgress: progress,
      variance: -5,
    },
    documentsList: [],
    recentActivity: [
      {
        id: `act-${bp.id}`,
        action: `Project initialized in system (${bp.code})`,
        category: "Civil",
        timestamp: "Recently",
        user: "System Admin",
        badgeTone: "info",
      },
    ],
    issuesList: [],
  };
}

/**
 * Service to manage Project data integrated with Spring Boot REST API.
 */
export const projectService = {
  /** GET /api/v1/projects or GET /api/v1/projects/company/{companyId} */
  async getProjects(companyId?: number): Promise<Project[]> {
    const url =
      companyId && companyId > 0 ? `/api/v1/projects/company/${companyId}` : "/api/v1/projects";
    const res = await request<BackendResponse<BackendProject[]>>(url);
    const backendItems = res.data ?? [];
    return backendItems.map(mapBackendProjectToProject);
  },

  /** GET /api/v1/projects/{id} */
  async getProjectById(idOrCode: string | number): Promise<Project | undefined> {
    const idStr = String(idOrCode).trim();
    if (/^\d+$/.test(idStr)) {
      try {
        const res = await request<BackendResponse<BackendProject>>(`/api/v1/projects/${idStr}`);
        if (res.data) {
          return mapBackendProjectToProject(res.data);
        }
      } catch {
        // Fallback to searching all projects
      }
    }

    const all = await projectService.getProjects();
    const query = idStr.toLowerCase();
    return all.find((p) => p.id.toLowerCase() === query || p.code.toLowerCase() === query);
  },

  /** POST /api/v1/projects */
  async createProject(payload: ProjectRequest): Promise<Project> {
    const res = await request<BackendResponse<BackendProject>>("/api/v1/projects", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return mapBackendProjectToProject(res.data);
  },

  /** PUT /api/v1/projects/{id} */
  async updateProject(id: number | string, payload: ProjectRequest): Promise<Project> {
    const res = await request<BackendResponse<BackendProject>>(`/api/v1/projects/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    return mapBackendProjectToProject(res.data);
  },

  // Tab data helpers
  getProjectBoq(projectName: string): BoqLine[] {
    const lines = boqLines.filter((b) => b.project === projectName);
    if (lines.length > 0) return lines;
    // Fallback realistic template so new/other projects have sample BOQ
    return boqLines.slice(0, 8).map((b, idx) => ({
      ...b,
      id: `boq-gen-${idx}`,
      project: projectName,
    }));
  },

  getProjectBudget(projectName: string): BudgetLine[] {
    const lines = budgetLines.filter((b) => b.project === projectName);
    if (lines.length > 0) return lines;
    return [
      {
        id: "bg-1",
        head: "Civil & Structural RCC",
        project: projectName,
        budget: 125000000,
        committed: 84000000,
        actual: 72000000,
      },
      {
        id: "bg-2",
        head: "Steel Rebar Fe500D",
        project: projectName,
        budget: 68000000,
        committed: 48000000,
        actual: 44000000,
      },
      {
        id: "bg-3",
        head: "Cement & RMC Concrete",
        project: projectName,
        budget: 52000000,
        committed: 36000000,
        actual: 31000000,
      },
      {
        id: "bg-4",
        head: "Masonry & Plastering",
        project: projectName,
        budget: 34000000,
        committed: 18000000,
        actual: 12000000,
      },
      {
        id: "bg-5",
        head: "Finishing & Flooring Tiles",
        project: projectName,
        budget: 42000000,
        committed: 15000000,
        actual: 8000000,
      },
      {
        id: "bg-6",
        head: "Electrical & Substation",
        project: projectName,
        budget: 28000000,
        committed: 12000000,
        actual: 6000000,
      },
      {
        id: "bg-7",
        head: "Plumbing & Sanitary MEP",
        project: projectName,
        budget: 26000000,
        committed: 9000000,
        actual: 5000000,
      },
      {
        id: "bg-8",
        head: "Site Overheads & Safety",
        project: projectName,
        budget: 14000000,
        committed: 8000000,
        actual: 6500000,
      },
    ];
  },

  getProjectPlan(projectName: string): WorkPlanTask[] {
    const tasks = workPlan.filter((t) => t.project === projectName);
    if (tasks.length > 0) return tasks;
    return workPlan.slice(0, 10).map((t, idx) => ({
      ...t,
      id: `task-gen-${idx}`,
      project: projectName,
    }));
  },

  getProjectDprs(projectName: string): Dpr[] {
    const dprList = dprs.filter((d) => d.project === projectName);
    if (dprList.length > 0) return dprList;
    return dprs.slice(0, 8).map((d, idx) => ({
      ...d,
      id: `dpr-gen-${idx}`,
      project: projectName,
    }));
  },

  getProjectIndents(projectName: string): Indent[] {
    let custom: Indent[] = [];
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem(`buildcore_indents_${projectName}`);
        if (raw) custom = JSON.parse(raw);
      } catch {
        // ignore
      }
    }
    const list = indents.filter((i) => i.project === projectName);
    const base =
      list.length > 0
        ? list
        : indents.slice(0, 6).map((i, idx) => ({
            ...i,
            id: `ind-gen-${idx}`,
            project: projectName,
          }));
    return [...custom, ...base];
  },

  getProjectPurchaseOrders(projectName: string): PurchaseOrder[] {
    const list = purchaseOrders.filter((po) => po.project === projectName);
    if (list.length > 0) return list;
    return purchaseOrders.slice(0, 6).map((po, idx) => ({
      ...po,
      id: `po-gen-${idx}`,
      project: projectName,
    }));
  },

  getProjectStock(projectName: string): StockItem[] {
    const list = stockItems.filter((s) => s.project === projectName);
    if (list.length > 0) return list;
    return stockItems.slice(0, 8).map((s, idx) => ({
      ...s,
      id: `stk-gen-${idx}`,
      project: projectName,
    }));
  },

  getProjectContractorBills(projectName: string): ContractorBill[] {
    const list = contractorBills.filter((cb) => cb.project === projectName);
    if (list.length > 0) return list;
    return contractorBills.slice(0, 6).map((cb, idx) => ({
      ...cb,
      id: `cb-gen-${idx}`,
      project: projectName,
    }));
  },

  getProjectApprovals(projectName: string): ApprovalTask[] {
    const list = approvalTasks.filter((a) => a.project === projectName);
    if (list.length > 0) return list;
    return approvalTasks.slice(0, 4).map((a, idx) => ({
      ...a,
      id: `apv-gen-${idx}`,
      project: projectName,
    }));
  },

  getProjectLedger(projectName: string): LedgerEntry[] {
    const list = ledgerEntries.filter((le) => le.project === projectName);
    if (list.length > 0) return list;
    return ledgerEntries.slice(0, 8).map((le, idx) => ({
      ...le,
      id: `le-gen-${idx}`,
      project: projectName,
    }));
  },

  /* ------------------- PHASE 2: WBS & PLANNING ------------------- */

  getWbsHierarchy(projectName: string): WBSNode[] {
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem(`buildcore_wbs_${projectName}`);
        if (raw) return JSON.parse(raw);
      } catch {
        // ignore
      }
    }
    // Return template mapped to project name
    return defaultWbsNodes.map((n) => ({
      ...n,
      project: projectName,
      activities: n.activities.map((a) => ({
        ...a,
        project: projectName,
      })),
    }));
  },

  saveWbsHierarchy(projectName: string, nodes: WBSNode[]) {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(`buildcore_wbs_${projectName}`, JSON.stringify(nodes));
    } catch (err) {
      console.error("Failed to save WBS hierarchy:", err);
    }
  },

  addWbsNode(projectName: string, code: string, name: string): WBSNode {
    const nodes = projectService.getWbsHierarchy(projectName);
    const newNode: WBSNode = {
      id: `wbs-${Date.now().toString(36)}`,
      code: code.trim(),
      name: name.trim(),
      project: projectName,
      progress: 0,
      plannedProgress: 0,
      activities: [],
    };
    const updated = [...nodes, newNode];
    projectService.saveWbsHierarchy(projectName, updated);
    return newNode;
  },

  addWbsActivity(projectName: string, activity: Omit<WBSActivity, "id">): WBSActivity {
    const nodes = projectService.getWbsHierarchy(projectName);
    const newAct: WBSActivity = {
      ...activity,
      id: `act-${Date.now().toString(36)}`,
      project: projectName,
    };

    let targetNode = nodes.find((n) => n.code === activity.parentWbs);
    if (!targetNode) {
      // Create parent node if not existing
      targetNode = {
        id: `wbs-${Date.now().toString(36)}`,
        code: activity.parentWbs,
        name: `WBS ${activity.parentWbs}`,
        project: projectName,
        progress: 0,
        plannedProgress: 0,
        activities: [],
      };
      nodes.push(targetNode);
    }

    targetNode.activities.push(newAct);

    // Recalculate parent node progress
    const totalActs = targetNode.activities.length;
    if (totalActs > 0) {
      targetNode.progress = Math.round(
        targetNode.activities.reduce((s, a) => s + a.actualProgress, 0) / totalActs,
      );
      targetNode.plannedProgress = Math.round(
        targetNode.activities.reduce((s, a) => s + a.plannedProgress, 0) / totalActs,
      );
    }

    projectService.saveWbsHierarchy(projectName, nodes);
    return newAct;
  },

  updateWbsActivity(
    projectName: string,
    activityId: string,
    patch: Partial<WBSActivity>,
  ): WBSActivity | undefined {
    const nodes = projectService.getWbsHierarchy(projectName);
    let updatedActivity: WBSActivity | undefined;

    for (const node of nodes) {
      const idx = node.activities.findIndex((a) => a.id === activityId);
      if (idx !== -1) {
        node.activities[idx] = { ...node.activities[idx]!, ...patch };
        // recalculate variance
        if (patch.actualProgress !== undefined || patch.plannedProgress !== undefined) {
          node.activities[idx]!.variance =
            node.activities[idx]!.actualProgress - node.activities[idx]!.plannedProgress;
        }
        updatedActivity = node.activities[idx];

        // recalculate parent
        const totalActs = node.activities.length;
        if (totalActs > 0) {
          node.progress = Math.round(
            node.activities.reduce((s, a) => s + a.actualProgress, 0) / totalActs,
          );
          node.plannedProgress = Math.round(
            node.activities.reduce((s, a) => s + a.plannedProgress, 0) / totalActs,
          );
        }
        break;
      }
    }

    if (updatedActivity) {
      projectService.saveWbsHierarchy(projectName, nodes);
    }
    return updatedActivity;
  },

  deleteWbsActivity(projectName: string, activityId: string): boolean {
    const nodes = projectService.getWbsHierarchy(projectName);
    let found = false;

    for (const node of nodes) {
      const idx = node.activities.findIndex((a) => a.id === activityId);
      if (idx !== -1) {
        node.activities.splice(idx, 1);
        found = true;
        const totalActs = node.activities.length;
        node.progress =
          totalActs > 0
            ? Math.round(node.activities.reduce((s, a) => s + a.actualProgress, 0) / totalActs)
            : 0;
        node.plannedProgress =
          totalActs > 0
            ? Math.round(node.activities.reduce((s, a) => s + a.plannedProgress, 0) / totalActs)
            : 0;
        break;
      }
    }

    if (found) {
      projectService.saveWbsHierarchy(projectName, nodes);
    }
    return found;
  },

  getPlanningSummary(projectName: string): PlanningSummary {
    const nodes = projectService.getWbsHierarchy(projectName);
    const allActivities = nodes.flatMap((n) => n.activities);
    const totalActivities = allActivities.length;

    if (totalActivities === 0) {
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

    const overallProgress = Math.round(
      allActivities.reduce((s, a) => s + a.actualProgress, 0) / totalActivities,
    );
    const plannedProgress = Math.round(
      allActivities.reduce((s, a) => s + a.plannedProgress, 0) / totalActivities,
    );
    const scheduleVariance = overallProgress - plannedProgress;
    const completedActivities = allActivities.filter((a) => a.status === "Completed").length;
    const delayedActivities = allActivities.filter((a) => a.status === "Delayed").length;
    const criticalActivities = allActivities.filter((a) => a.criticalPath).length;

    // Earliest start and latest end
    const starts = allActivities.map((a) => a.startDate).sort();
    const ends = allActivities.map((a) => a.endDate).sort();

    return {
      plannedStart: starts[0] || "2026-06-01",
      plannedCompletion: ends[ends.length - 1] || "2027-04-30",
      overallProgress,
      plannedProgress,
      scheduleVariance,
      totalActivities,
      completedActivities,
      delayedActivities,
      criticalActivities,
    };
  },

  /* ------------------- PHASE 2: BOQ MODULE ------------------- */

  getBoqItems(projectName: string, revisionId?: string): BOQItem[] {
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem(`buildcore_boq_${projectName}`);
        if (raw) {
          const items: BOQItem[] = JSON.parse(raw);
          if (revisionId && revisionId !== "all") {
            return items.filter((i) => !i.revisionId || i.revisionId === revisionId);
          }
          return items;
        }
      } catch {
        // ignore
      }
    }
    return defaultBoqItems.map((b) => ({ ...b, project: projectName }));
  },

  saveBoqItems(projectName: string, items: BOQItem[]) {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(`buildcore_boq_${projectName}`, JSON.stringify(items));
    } catch (err) {
      console.error("Failed to save BOQ items:", err);
    }
  },

  addBoqItem(
    projectName: string,
    input: Omit<BOQItem, "id" | "amount" | "balanceQty" | "progress">,
  ): BOQItem {
    const items = projectService.getBoqItems(projectName);
    const approvedQty = Number(input.approvedQty) || 0;
    const consumedQty = Number(input.consumedQty) || 0;
    const rate = Number(input.rate) || 0;
    const amount = approvedQty * rate;
    const balanceQty = Math.max(0, approvedQty - consumedQty);
    const progress =
      approvedQty > 0 ? Math.min(100, Math.round((consumedQty / approvedQty) * 100)) : 0;

    const newItem: BOQItem = {
      ...input,
      id: `boq-${Date.now().toString(36)}`,
      amount,
      balanceQty,
      progress,
      project: projectName,
    };

    const updated = [newItem, ...items];
    projectService.saveBoqItems(projectName, updated);
    return newItem;
  },

  updateBoqItem(projectName: string, itemId: string, patch: Partial<BOQItem>): BOQItem | undefined {
    const items = projectService.getBoqItems(projectName);
    const idx = items.findIndex((b) => b.id === itemId);
    if (idx === -1) return undefined;

    const current = items[idx]!;
    const approvedQty =
      patch.approvedQty !== undefined ? Number(patch.approvedQty) : current.approvedQty;
    const consumedQty =
      patch.consumedQty !== undefined ? Number(patch.consumedQty) : current.consumedQty;
    const rate = patch.rate !== undefined ? Number(patch.rate) : current.rate;
    const amount = approvedQty * rate;
    const balanceQty = Math.max(0, approvedQty - consumedQty);
    const progress =
      approvedQty > 0 ? Math.min(100, Math.round((consumedQty / approvedQty) * 100)) : 0;

    const updated: BOQItem = {
      ...current,
      ...patch,
      approvedQty,
      consumedQty,
      rate,
      amount,
      balanceQty,
      progress,
    };

    items[idx] = updated;
    projectService.saveBoqItems(projectName, items);
    return updated;
  },

  deleteBoqItem(projectName: string, itemId: string): boolean {
    const items = projectService.getBoqItems(projectName);
    const filtered = items.filter((b) => b.id !== itemId);
    if (filtered.length !== items.length) {
      projectService.saveBoqItems(projectName, filtered);
      return true;
    }
    return false;
  },

  duplicateBoqItem(projectName: string, itemId: string): BOQItem | undefined {
    const items = projectService.getBoqItems(projectName);
    const orig = items.find((b) => b.id === itemId);
    if (!orig) return undefined;

    const copy: BOQItem = {
      ...orig,
      id: `boq-${Date.now().toString(36)}`,
      boqNo: `${orig.boqNo}-COPY`,
      description: `${orig.description} (Copy)`,
      consumedQty: 0,
      balanceQty: orig.approvedQty,
      progress: 0,
      status: "Not Started",
    };

    const updated = [copy, ...items];
    projectService.saveBoqItems(projectName, updated);
    return copy;
  },

  getBoqRevisions(projectName: string): BOQRevision[] {
    return defaultBoqRevisions.map((r) => ({ ...r, project: projectName }));
  },

  /* ------------------- PHASE 2: MATERIAL REQUIREMENTS & INDENTS ------------------- */

  getMaterialRequirements(projectName: string): MaterialRequirement[] {
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem(`buildcore_mat_req_${projectName}`);
        if (raw) return JSON.parse(raw);
      } catch {
        // ignore
      }
    }
    return defaultMaterialRequirements.map((m) => ({ ...m, project: projectName }));
  },

  saveMaterialRequirements(projectName: string, items: MaterialRequirement[]) {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(`buildcore_mat_req_${projectName}`, JSON.stringify(items));
    } catch (err) {
      console.error("Failed to save material requirements:", err);
    }
  },

  createIndentFromMaterial(
    projectName: string,
    data: {
      material: string;
      quantity: number;
      unit: string;
      requiredDate: string;
      priority: Priority;
      remarks?: string | undefined;
    },
  ): Indent {
    const reqs = projectService.getMaterialRequirements(projectName);
    const mat = reqs.find((m) => m.material.toLowerCase() === data.material.toLowerCase());
    const rate = mat?.estimatedRate ?? 1000;
    const value = data.quantity * rate;

    const indentNo = `IND-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newIndent: Indent = {
      id: `ind-${Date.now().toString(36)}`,
      indentNo,
      date: new Date().toISOString().slice(0, 10),
      project: projectName,
      site: `${projectName} Site`,
      department: "Civil Stores",
      requestedBy: "Site Engineer",
      requiredDate: data.requiredDate,
      priority: data.priority,
      itemCount: 1,
      value,
      status: "Pending",
      level: "L1 Site Incharge",
      remarks: data.remarks || `Purchase Indent created from BOQ Material Shortfall`,
      items: [
        {
          item: data.material,
          quantity: data.quantity,
          unit: data.unit,
          rate,
          ...(data.remarks ? { remarks: data.remarks } : {}),
        },
      ],
    };

    // Save indent to project indents
    if (typeof window !== "undefined") {
      try {
        const key = `buildcore_indents_${projectName}`;
        const raw = localStorage.getItem(key);
        const existing: Indent[] = raw ? JSON.parse(raw) : [];
        localStorage.setItem(key, JSON.stringify([newIndent, ...existing]));
      } catch (err) {
        console.error("Failed to save indent:", err);
      }
    }

    // Update material requirement shortfall
    if (mat) {
      mat.availableStock += data.quantity;
      mat.shortfall = Math.max(0, mat.required - mat.availableStock);
      mat.status = mat.shortfall === 0 ? "Sufficient" : "Low Stock";
      projectService.saveMaterialRequirements(projectName, reqs);
    }

    return newIndent;
  },
};
