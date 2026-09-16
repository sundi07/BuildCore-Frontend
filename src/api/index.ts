import * as m from "@/mock/data";
import { mockResponse, request } from "@/services/http";
import { companyService } from "@/services/companyService";
import { departmentService } from "@/services/departmentService";

export { companyService as companyApi };
export { departmentService as departmentApi };

/* ------------------------------- auth ------------------------------- */
export interface Session {
  token: string;
  tokenType?: string;
  userId?: number;
  user: { name: string; username: string; role: string; email: string; branch: string; id?: number };
}

export const authApi = {
  /** Maps to POST /api/v1/auth/login */
  login: async (username: string, password: string): Promise<Session> => {
    interface LoginBackendResponse {
      accessToken?: string;
      token?: string;
      tokenType?: string;
      userId?: number;
      username?: string;
      data?: {
        accessToken?: string;
        token?: string;
        tokenType?: string;
        userId?: number;
        username?: string;
      };
    }

    const res = await request<LoginBackendResponse>("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify({ username: username.trim(), password }),
    });

    const token =
      res.accessToken ||
      res.token ||
      res.data?.accessToken ||
      res.data?.token ||
      "";

    const tokenType = res.tokenType || res.data?.tokenType || "Bearer";
    const userId = res.userId ?? res.data?.userId ?? 1;
    const uname = res.username ?? res.data?.username ?? username;

    return {
      token,
      tokenType,
      userId,
      user: {
        id: userId,
        name: uname === "admin" ? "Sanket Ganjegaonkar" : uname,
        username: uname,
        role: "Director",
        email: `${uname}@buildcore.in`,
        branch: "Pune Head Office",
      },
    };
  },
  forgotPassword: (email: string) => mockResponse({ ok: true, email }, 600),
  resetPassword: (_token: string, _password: string) => mockResponse({ ok: true }, 600),
  changePassword: (_current: string, _next: string) => mockResponse({ ok: true }, 600),
  logout: () => mockResponse({ ok: true }, 100),
};

import { projectService } from "@/services/projectService";

export const projectApi = {
  list: (companyId?: number) => projectService.getProjects(companyId),
  byId: (id: string | number) => projectService.getProjectById(id),
  create: (data: Parameters<typeof projectService.createProject>[0]) =>
    projectService.createProject(data),
  update: (id: number | string, data: Parameters<typeof projectService.updateProject>[1]) =>
    projectService.updateProject(id, data),
  boq: (project?: string) =>
    mockResponse(project ? projectService.getProjectBoq(project) : m.boqLines),
  budget: (project?: string) =>
    mockResponse(project ? projectService.getProjectBudget(project) : m.budgetLines),
  documents: () => mockResponse(m.documents),
};

export const procurementApi = {
  indents: () => mockResponse(m.indents),
  enquiries: () => mockResponse(m.enquiries),
  quotations: () => mockResponse(m.quotations),
  purchaseOrders: () => mockResponse(m.purchaseOrders),
  grns: () => mockResponse(m.grns),
  bills: () => mockResponse(m.purchaseBills),
  suppliers: () => mockResponse(m.suppliers),
};

export const inventoryApi = {
  stock: () => mockResponse(m.stockItems),
  transactions: () => mockResponse(m.stockTxns),
  requisitions: () => mockResponse(m.materialRequisitions),
  warehouses: () => mockResponse(m.warehouses),
};

export const constructionApi = {
  workPlan: () => mockResponse(m.workPlan),
  workOrders: () => mockResponse(m.workOrders),
  contractors: () => mockResponse(m.contractors),
  dprs: () => mockResponse(m.dprs),
  contractorBills: () => mockResponse(m.contractorBills),
};

export const crmApi = {
  leads: () => mockResponse(m.leads),
  followUps: () => mockResponse(m.followUps),
  appointments: () => mockResponse(m.appointments),
  tasks: () => mockResponse(m.tasks),
  customers: () => mockResponse(m.customers),
};

export const salesApi = {
  units: () => mockResponse(m.units),
  paymentSchedule: () => mockResponse(m.paymentSchedule),
  brokerage: () => mockResponse(m.brokerage),
  brokerPerformance: () => mockResponse(m.brokerPerformance),
};

export const accountingApi = {
  ledger: () => mockResponse(m.ledgerEntries),
  receivables: () => mockResponse(m.receivables),
  payables: () => mockResponse(m.payables),
  trialBalance: () => mockResponse(m.trialBalance),
  fixedAssets: () => mockResponse(m.fixedAssets),
  gst: () => mockResponse(m.gstRegister),
  tds: () => mockResponse(m.tdsRegister),
  bankReconciliation: () => mockResponse(m.bankReconciliation),
  chartOfAccounts: () => mockResponse(m.chartOfAccounts),
};

export const payrollApi = {
  employees: () => mockResponse(m.employees),
  attendance: () => mockResponse(m.attendance),
  leaves: () => mockResponse(m.leaveRequests),
  payroll: () => mockResponse(m.payrollRuns),
};

export const adminApi = {
  users: () => mockResponse(m.usersList),
  roles: () => mockResponse(m.roles),
  permissions: () => mockResponse(m.permissionMatrix),
  auditLogs: () => mockResponse(m.auditLogs),
  numberSeries: () => mockResponse(m.numberSeries),
  workflows: () => mockResponse(m.workflowConfig),
  branches: () => mockResponse(m.branches),
  companies: () => companyService.getCompanies(),
  departments: () => departmentService.getDepartments(),
};

export const dashboardApi = {
  totals: () => mockResponse(m.dashboardTotals),
  monthly: () => mockResponse(m.monthlySeries),
  projectCost: () => mockResponse(m.projectCostSeries),
  consumption: () => mockResponse(m.consumptionByCategory),
  approvals: () => mockResponse(m.approvalTasks),
  activity: () => mockResponse(m.activityFeed),
  notifications: () => mockResponse(m.notifications),
  lowStock: () => mockResponse(m.lowStockItems),
};
