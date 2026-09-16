# BUILDCORE — Construction ERP (Frontend Demo)

A premium, light-theme enterprise ERP web app covering the full Real Builder scope with mock data, built so real APIs can be plugged in later.

## Approach

The scope is very large (~150 screens). Rather than 150 thin placeholders, the build is phased: a real app shell with the complete menu tree from day one, then depth added module by module — the 25 client-demo screens get production-quality treatment, everything else gets a meaningful dashboard/list/detail with realistic data.

Before building, I will show 3 rendered design directions for the shell + executive dashboard so you pick the look once and it applies everywhere.

## Phase 1 — Foundation and shell

- Design system: light enterprise theme, dark-mode-ready tokens, professional type scale, consistent spacing and icons.
- Reusable component kit: AppLayout, Sidebar (full menu tree, collapsible groups), Header, global search, notifications, Breadcrumbs, PageHeader, StatCard, ChartCard, DataTable (search/filter/sort/pagination/column controls/export/row actions), StatusBadge, ApprovalBadge, Modal, Drawer, form fields (text/select/date/currency), Timeline, ActivityFeed, DocumentUploader, Empty/Loading/Error states, ConfirmationDialog.
- Auth: Login (admin / Admin@123), Forgot Password, Reset Password, Change Password, Profile, Logout, mock session with role-based permissions.
- Indian demo data set: 4 projects, materials, suppliers, contractors, employees, customers, units — INR, DD/MM/YYYY.

## Phase 2 — Executive dashboard + Projects

- Executive dashboard: all KPI cards, 10 charts, alert/activity widgets, filters (date, company, project, site, financial year), drill-down links.
- Project list and project detail with 12 tabs; project dashboard with progress, budget vs actual, procurement, consumption, sales, collections.

## Phase 3 — Procurement

Indent → Approval → Enquiry → Quotation → Comparative Statement → PO → GRN → Purchase Bill → Supplier Payment, plus vendor and rate analysis. Each document shows its linked upstream/downstream records so the integration is visible.

## Phase 4 — Stores & Inventory

Inventory dashboard, requisition, issue, receipt, transfer, physical stock, and the stock/valuation/consumption/history/ageing report screens.

## Phase 5 — Planning & Construction

BOQ and BOQ analysis, budget and budget allocation, budget vs actual, work plan, job/work orders, contractor management, DPR (entry + dashboard), contractor billing, subcontracting, site progress.

## Phase 6 — CRM & Sales

CRM dashboard, leads, prospects, customers, follow-ups, tasks, appointments and missing appointments; price list, unit availability grid, booking, payment schedule, interest, defaulters, brokerage, broker performance, transfer, cancellation, post-sales.

## Phase 7 — Finance, Payroll, Reports, Admin

Accounting dashboard, chart of accounts, vouchers, AR/AP, GL, fixed assets, GST, TDS, bank reconciliation, Trial Balance / P&L / Balance Sheet. Payroll: employee master and card, attendance, leave, payroll processing, printable payslip, statutory reports. Reports hub with shared filter/export/print layout. Administration: company, branch, sites, warehouses, users, roles, permissions, number series, workflow and approval configuration, audit logs. Approval inbox and workflow status shown across modules. Mobile Operations screen for the field workflows.

## Technical notes

- React 19 + TypeScript on TanStack Start; file-based routes mirroring the menu tree, with layout routes per module and an auth-gated app shell.
- `src/api/*Api.ts` modules expose typed async functions returning promises; mock implementations read from `src/mock/*` behind the same signatures, so swapping in REST calls to the Spring Boot backend is a one-file change per module. No component imports mock data directly.
- Typed domain models in `src/types/`, data fetching via TanStack Query, charts via Recharts, tables via a single generic DataTable.
- No backend, database, or auth provider is added — everything is client-side mock data. Login is simulated against the demo credentials.

## Delivery

Each phase lands as a working, clickable slice. Given the size, this will span multiple runs; after each phase you can review and reprioritise.
