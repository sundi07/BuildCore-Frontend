import type { ReactNode } from "react";
import { ExecutiveDashboard } from "@/pages/dashboard/ExecutiveDashboard";
import { ProcurementDashboard } from "@/pages/dashboards/ProcurementDashboard";
import { InventoryDashboard } from "@/pages/dashboards/InventoryDashboard";
import { CrmDashboard } from "@/pages/dashboards/CrmDashboard";
import { AccountsDashboard } from "@/pages/dashboards/AccountsDashboard";
import { ProjectsPage } from "@/pages/ProjectsPage";
import { ProjectWorkspacePage } from "@/pages/ProjectWorkspacePage";
import { ApprovalsPage } from "@/pages/ApprovalsPage";
import { ReportsPage } from "@/pages/ReportsPage";
import { MobileOperationsPage } from "@/pages/MobileOperationsPage";
import { ChangePasswordPage, ProfilePage } from "@/pages/AccountPages";
import { GenericModulePage } from "@/pages/GenericModulePage";
import { PresetPage } from "@/pages/PresetPage";
import { IndentsPage } from "@/pages/procurement/IndentsPage";
import { EnquiriesPage } from "@/pages/procurement/EnquiriesPage";
import { QuotationsPage } from "@/pages/procurement/QuotationsPage";
import { PurchaseOrdersPage } from "@/pages/procurement/PurchaseOrdersPage";
import { ComparativeStatementPage } from "@/pages/procurement/ComparativeStatementPage";
import { CompanyPage } from "@/pages/CompanyPage";
import { DepartmentsPage } from "@/pages/DepartmentsPage";
import { SitesPage } from "@/pages/SitesPage";
import { EmployeesPage } from "@/pages/EmployeesPage";
import { presets } from "@/pages/presets";

export function resolvePage(slug: string): ReactNode {
  const key = slug.replace(/\/+$/, "") || "dashboard";

  if (key === "dashboard") return <ExecutiveDashboard />;
  if (key === "admin/company" || key === "company") return <CompanyPage />;
  if (key === "admin/departments" || key === "admin/department" || key === "departments") {
    return <DepartmentsPage />;
  }
  if (key === "admin/sites" || key === "admin/site" || key === "sites") {
    return <SitesPage />;
  }
  if (
    key === "hr/employees" ||
    key === "hr/employee-cards" ||
    key === "employees" ||
    key === "admin/employees"
  ) {
    return <EmployeesPage />;
  }
  if (key === "projects") return <ProjectsPage />;
  if (key.startsWith("projects/")) {
    const projId = key.replace(/^projects\//, "");
    return <ProjectWorkspacePage projectId={projId} />;
  }
  if (key === "procurement/indents") return <IndentsPage />;
  if (key.startsWith("procurement/indents/")) {
    const indentId = decodeURIComponent(key.replace(/^procurement\/indents\//, ""));
    return <IndentsPage initialIndentId={indentId} />;
  }
  if (key === "procurement/enquiries") return <EnquiriesPage />;
  if (key.startsWith("procurement/enquiries/")) {
    const rfqId = decodeURIComponent(key.replace(/^procurement\/enquiries\//, ""));
    return <EnquiriesPage initialRfqId={rfqId} />;
  }
  if (key === "procurement/quotations") return <QuotationsPage />;
  if (key.startsWith("procurement/quotations/")) {
    const quoteId = decodeURIComponent(key.replace(/^procurement\/quotations\//, ""));
    return <QuotationsPage initialQuotationId={quoteId} />;
  }
  if (
    key === "procurement/comparative-statement" ||
    key.startsWith("procurement/comparative-statement/")
  ) {
    return <ComparativeStatementPage />;
  }
  if (key === "procurement/purchase-orders") return <PurchaseOrdersPage />;
  if (key.startsWith("procurement/purchase-orders/")) {
    const poId = decodeURIComponent(key.replace(/^procurement\/purchase-orders\//, ""));
    return <PurchaseOrdersPage initialPoId={poId} />;
  }
  if (key === "procurement") return <ProcurementDashboard />;
  if (key === "inventory") return <InventoryDashboard />;
  if (key === "crm") return <CrmDashboard />;
  if (key === "accounts") return <AccountsDashboard />;
  if (key === "approvals") return <ApprovalsPage />;
  if (key === "approvals/history") return <ApprovalsPage history />;
  if (key === "procurement/indent-approvals") return <ApprovalsPage />;
  if (key === "mobile-operations") return <MobileOperationsPage />;
  if (key === "profile") return <ProfilePage />;
  if (key === "change-password") return <ChangePasswordPage />;
  if (key === "reports" || key.startsWith("reports/")) return <ReportsPage slug={key} />;

  const preset = presets[key];
  if (preset) return <PresetPage preset={preset} />;

  return <GenericModulePage slug={key} />;
}
