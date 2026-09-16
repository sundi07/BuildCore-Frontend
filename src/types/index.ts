export type ApprovalStatus =
  "Draft" | "Pending" | "Approved" | "Rejected" | "Sent Back" | "Returned" | "Cancelled";

export type Priority = "Low" | "Medium" | "High" | "Urgent";

export interface Company {
  id: number | string;
  code?: string;
  name: string;
  legalName?: string | null;
  gstin?: string | null;
  pan?: string | null;
  email?: string | null;
  phone?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  country?: string | null;
  status?: "ACTIVE" | "INACTIVE";
  financialYear?: string;
}

export interface Department {
  id: number;
  companyId: number;
  code: string;
  name: string;
  status?: "ACTIVE" | "INACTIVE";
}

export type ProjectStatus =
  "Planning" | "Not Started" | "In Progress" | "On Hold" | "Completed" | "Cancelled";

export type ProjectHealth = "On Track" | "At Risk" | "Delayed";
export type HealthIndicatorStatus = "Healthy" | "Attention" | "Critical";

export type ProjectType =
  "Residential" | "Commercial" | "Infrastructure" | "Mixed Use" | "Industrial";

export interface ProjectLocationDetails {
  address: string;
  city: string;
  state: string;
  pincode: string;
  siteName: string;
}

export interface ProjectFinancials {
  contractValue: number;
  budget: number;
  actualCost: number;
  committedCost: number;
  balanceBudget: number;
  billing: number;
  collection: number;
  outstanding: number;
  contingencyPct: number;
  taxGstApplicable: string;
}

export interface ProjectConfiguration {
  towersCount: number;
  unitsCount: number;
  floorsCount: number;
  projectArea: number;
  uom: string;
}

export interface ProjectProcurementSummary {
  totalIndents: number;
  pendingIndents: number;
  purchaseOrders: number;
  poValue: number;
  pendingGrn: number;
}

export interface ProjectInventorySummary {
  stockValue: number;
  lowStockItems: number;
  materialReceived: number;
  materialIssued: number;
  materialConsumed: number;
}

export interface ProjectConstructionSummary {
  overallProgress: number;
  plannedProgress: number;
  actualProgress: number;
  variance: number;
}

export interface ProjectHealthBreakdown {
  schedule: HealthIndicatorStatus;
  budget: HealthIndicatorStatus;
  cost: HealthIndicatorStatus;
  procurement: HealthIndicatorStatus;
  construction: HealthIndicatorStatus;
  notes?: Record<string, string>;
}

export interface ProjectActivityItem {
  id: string;
  action: string;
  category: "PO" | "Material" | "Civil" | "Billing" | "Issue" | "Approval";
  timestamp: string;
  user: string;
  badgeTone?: "default" | "success" | "warning" | "danger" | "info";
}

export interface ProjectIssueItem {
  id: string;
  issueNo: string;
  title: string;
  category: "Safety" | "Quality" | "Civil Delay" | "Material Shortage" | "Drawing Revision";
  severity: Priority;
  assignedTo: string;
  status: "Open" | "In Progress" | "Resolved" | "Closed";
  reportedDate: string;
}

export interface ProjectDocItem {
  id: string;
  title: string;
  category: "Project Agreement" | "Drawings" | "Approvals" | "Other Documents";
  docNo: string;
  fileSize: string;
  uploadedAt: string;
  uploadedBy: string;
  fileType: string;
  status: "Approved" | "Under Review" | "Valid" | "Expired";
}

export interface BackendProject {
  id: number;
  companyId: number;
  code: string;
  name: string;
  description?: string | null | undefined;
  location?: string | null | undefined;
  projectType?: string | null | undefined;
  status?: string | null | undefined;
  startDate?: string | null | undefined;
  expectedEndDate?: string | null | undefined;
  actualEndDate?: string | null | undefined;
}

export interface ProjectRequest {
  companyId: number;
  code: string;
  name: string;
  description?: string | null | undefined;
  location?: string | null | undefined;
  projectType?: string | null | undefined;
  startDate?: string | null | undefined;
  expectedEndDate?: string | null | undefined;
  actualEndDate?: string | null | undefined;
}

export interface Project {
  id: string;
  companyId?: number | undefined;
  code: string;
  name: string;
  location: string;
  client: string;
  type: ProjectType;
  projectType?: string | null | undefined;
  startDate: string;
  expectedCompletion: string;
  expectedEndDate?: string | null | undefined;
  actualEndDate?: string | null | undefined;
  budget: number;
  actualCost: number;
  progress: number;
  status: ProjectStatus;
  siteEngineer: string;
  projectManager?: string;
  sites: string[];
  soldValue: number;
  collection: number;
  description?: string;
  health?: ProjectHealth;
  healthBreakdown?: ProjectHealthBreakdown;
  locationDetails?: ProjectLocationDetails;
  financials?: ProjectFinancials;
  configuration?: ProjectConfiguration;
  procurementSummary?: ProjectProcurementSummary;
  inventorySummary?: ProjectInventorySummary;
  constructionSummary?: ProjectConstructionSummary;
  documentsList?: ProjectDocItem[];
  recentActivity?: ProjectActivityItem[];
  issuesList?: ProjectIssueItem[];
}

export interface IndentAttachment {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: string;
  uploadedBy: string;
  uploadedDate: string;
  url?: string | undefined;
}

export interface IndentTimelineEvent {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  user: string;
  type: "created" | "submitted" | "approved" | "rejected" | "returned" | "comment" | "system";
}

export interface IndentComment {
  id: string;
  author: string;
  role: string;
  timestamp: string;
  text: string;
}

export interface Indent {
  id: string;
  indentNo: string;
  date: string;
  project: string;
  site: string;
  department: string;
  requestedBy: string;
  requiredDate: string;
  priority: Priority;
  itemCount: number;
  value: number;
  status: ApprovalStatus;
  level: string;
  remarks?: string | undefined;
  items: IndentItem[];
  attachments?: IndentAttachment[] | undefined;
  timeline?: IndentTimelineEvent[] | undefined;
  comments?: IndentComment[] | undefined;
}

export interface IndentItem {
  item: string;
  quantity: number;
  unit: string;
  rate: number;
  remarks?: string | undefined;
  itemCode?: string | undefined;
  itemDescription?: string | undefined;
  category?: string | undefined;
  requestedQty?: number | undefined;
  availableStock?: number | undefined;
  indentQty?: number | undefined;
  amount?: number | undefined;
}

export interface RfqSupplier {
  id: string;
  name: string;
  code: string;
  contactPerson: string;
  email: string;
  phone: string;
  category?: string;
  selected?: boolean;
}

export interface RfqItem {
  id?: string | undefined;
  itemCode: string;
  item: string;
  itemDescription: string;
  category: string;
  unit: string;
  quantity: number;
  rate?: number | undefined;
  remarks?: string | undefined;
}

export interface Enquiry {
  id: string;
  enquiryNo: string;
  date: string;
  project: string;
  site?: string | undefined;
  department?: string | undefined;
  sourceIndent?: string | undefined;
  indentId?: string | undefined;
  item: string;
  quantity: number;
  unit: string;
  suppliers: number;
  responses: number;
  sentDate?: string | undefined;
  responseDate?: string | undefined;
  expectedQuotationDate?: string | undefined;
  quotationValidity?: string | undefined;
  deliveryRequiredBy?: string | undefined;
  paymentTerms?: string | undefined;
  deliveryTerms?: string | undefined;
  remarks?: string | undefined;
  selectedSuppliers?: RfqSupplier[] | undefined;
  items?: RfqItem[] | undefined;
  status: "Draft" | "Sent" | "Partially Responded" | "Closed";
}

export type QuotationStatus =
  | "Draft"
  | "Received"
  | "Under Technical Evaluation"
  | "Technically Qualified"
  | "Technically Rejected"
  | "Under Commercial Evaluation"
  | "Commercially Qualified"
  | "Rejected"
  | "Withdrawn";

export interface QuotationDocument {
  id: string;
  name: string;
  type: "PDF" | "DOCX" | "XLSX" | "IMAGE";
  size: string;
  uploadedAt: string;
  category: "Quotation PDF" | "Technical Documents" | "GST Certificate" | "Other Attachments";
}

export interface TechnicalEvaluation {
  specificationCompliance: "Compliant" | "Partial" | "Non-Compliant";
  quantityCompliance: "Compliant" | "Partial" | "Non-Compliant";
  deliveryCompliance: "Compliant" | "Partial" | "Non-Compliant";
  documentsStatus: "Verified" | "Pending" | "Deficient";
  remarks: string;
  evaluatedBy: string;
  evaluationDate: string;
  result: "Qualified" | "Rejected" | "Pending";
}

export interface CommercialEvaluation {
  rank?: "L1" | "L2" | "L3" | string | undefined;
  basicValue: number;
  discount: number;
  taxableAmount: number;
  gst: number;
  freight: number;
  otherCharges: number;
  landedCost: number;
  paymentTerms: string;
  deliveryTerms: string;
  validity: string;
}

export interface QuotationLineItem {
  id?: string | undefined;
  itemCode: string;
  itemDescription: string;
  category?: string | undefined;
  unit: string;
  rfqQty: number;
  quotedQty: number;
  rate: number;
  discountPct?: number | undefined;
  discountAmount: number;
  taxPct: number;
  taxAmount: number;
  lineAmount: number;
  deliverySchedule?: string | undefined;
  remarks?: string | undefined;
}

export interface Quotation {
  id: string;
  quotationNo: string;
  date: string;
  validity: string;
  validUntil?: string | undefined;
  status: QuotationStatus;

  // Relationship pointers
  sourceRFQId: string;
  sourceRFQNumber: string;
  sourceIndentId?: string | undefined;
  sourceIndentNumber?: string | undefined;
  supplierId: string;
  supplierName: string;
  supplierCode?: string | undefined;
  projectId: string;
  projectName: string;
  siteId?: string | undefined;
  siteName: string;

  // Contact info
  contactPerson?: string | undefined;
  email?: string | undefined;
  phone?: string | undefined;

  // Summary financials
  totalItems: number;
  basicAmount: number;
  discount: number;
  taxableAmount: number;
  gst: number;
  freight: number;
  otherCharges: number;
  roundOff?: number | undefined;
  grandTotal: number; // Landed Cost
  deliveryTerms?: string | undefined;
  deliveryDays: number;
  paymentTerms: string;

  // Line items
  items?: QuotationLineItem[] | undefined;

  // Evaluation
  technicalEvaluation?: TechnicalEvaluation | undefined;
  commercialEvaluation?: CommercialEvaluation | undefined;

  // Documents
  documents?: QuotationDocument[] | undefined;

  // Backwards compatibility with data.ts legacy generator
  supplier?: string | undefined;
  item?: string | undefined;
  quantity?: number | undefined;
  unit?: string | undefined;
  rate?: number | undefined;
  total?: number | undefined;
  selected?: boolean | undefined;
}

export type PoStatus =
  | "Draft"
  | "Pending Approval"
  | "Approved"
  | "Issued"
  | "Partially Received"
  | "Fully Received"
  | "Closed"
  | "Cancelled";

export type PoType = "Material" | "Service" | "Subcontract" | "Asset";

export interface PoLineItem {
  id?: string | undefined;
  itemCode: string;
  itemDescription: string;
  category: string;
  unit: string;
  approvedQty: number;
  poQty: number;
  rate: number;
  discountPct?: number | undefined;
  discountAmount?: number | undefined;
  taxableAmount: number;
  gstPct: number;
  cgstAmount?: number | undefined;
  sgstAmount?: number | undefined;
  igstAmount?: number | undefined;
  gstAmount: number;
  lineTotal: number;
  deliveryDate: string;
  deliveryLocation?: string | undefined;
  remarks?: string | undefined;
}

export interface PoCommercialTerms {
  paymentTerms: string;
  deliveryTerms: string;
  freight: string;
  insurance: string;
  loadingUnloading: string;
  taxes: string;
  warranty: string;
  penaltyLd: string;
  otherTerms: string;
}

export interface PoDeliveryScheduleItem {
  id?: string | undefined;
  itemCode: string;
  itemDescription: string;
  quantity: number;
  unit: string;
  deliveryDate: string;
  deliveryLocation: string;
  remarks?: string | undefined;
}

export interface PoAuditTimelineEvent {
  id: string;
  stage: string;
  title: string;
  description: string;
  timestamp: string;
  user: string;
  role: string;
  status: "completed" | "current" | "upcoming";
}

export interface PoDocument {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadedAt: string;
  category: "PO PDF" | "Quotation" | "GST Certificate" | "Technical Specifications" | "Other";
  url?: string | undefined;
}

export interface PurchaseOrder {
  id: string;
  poNo: string;
  date: string;
  supplier: string;
  project: string;
  site: string;
  itemCount: number;
  amount: number;
  gst: number;
  total: number;
  deliveryDate: string;
  paymentTerms: string;
  status: PoStatus | ApprovalStatus;
  receivedPct: number;

  // Phase 3D Enterprise Fields & Traceability
  poType?: PoType | undefined;
  currency?: string | undefined;
  remarks?: string | undefined;
  warrantyTerms?: string | undefined;
  deliveryTerms?: string | undefined;

  // Traceability references
  sourceComparativeNo?: string | undefined;
  sourceComparativeId?: string | undefined;
  sourceRFQNumber?: string | undefined;
  sourceRFQId?: string | undefined;
  sourceIndentNumber?: string | undefined;
  sourceIndentId?: string | undefined;
  projectId?: string | undefined;
  projectName?: string | undefined;
  siteId?: string | undefined;
  siteName?: string | undefined;

  // Supplier Information
  supplierId?: string | undefined;
  supplierName?: string | undefined;
  supplierCode?: string | undefined;
  contactPerson?: string | undefined;
  phone?: string | undefined;
  email?: string | undefined;
  billingAddress?: string | undefined;
  gstin?: string | undefined;
  pan?: string | undefined;

  // Financial Summary Breakdown
  basicValue?: number | undefined;
  discount?: number | undefined;
  taxableValue?: number | undefined;
  cgst?: number | undefined;
  sgst?: number | undefined;
  igst?: number | undefined;
  totalGst?: number | undefined;
  otherCharges?: number | undefined;
  roundOff?: number | undefined;
  grandTotal?: number | undefined;

  // Items & Terms
  items?: PoLineItem[] | undefined;
  commercialTerms?: PoCommercialTerms | undefined;
  deliverySchedule?: PoDeliveryScheduleItem[] | undefined;
  auditTimeline?: PoAuditTimelineEvent[] | undefined;
  documents?: PoDocument[] | undefined;
}

// Comparative Statement Types for Upstream Link
export interface ComparativeItem {
  itemCode: string;
  itemDescription: string;
  category: string;
  unit: string;
  approvedQty: number;
  rates: Record<
    string,
    { rate: number; discount: number; taxable: number; tax: number; total: number }
  >;
  recommendedSupplierRate: number;
  negotiatedRate?: number | undefined;
}

export interface ComparativeSupplierBid {
  supplierId: string;
  supplierName: string;
  supplierCode: string;
  quotationNo: string;
  basicAmount: number;
  taxAmount: number;
  landedCost: number;
  deliveryDays: number;
  rank: string;
  isRecommended: boolean;
}

export interface ComparativeStatement {
  id: string;
  csNo: string;
  title: string;
  date: string;
  status: "Draft" | "Under Evaluation" | "Approved" | "Rejected";
  sourceRFQId: string;
  sourceRFQNumber: string;
  sourceIndentNumber: string;
  projectId: string;
  projectName: string;
  siteName: string;
  recommendedSupplierId: string;
  recommendedSupplierName: string;
  recommendedSupplierCode: string;
  approvalStatus: "Approved" | "Pending" | "Draft";
  approvedBy?: string | undefined;
  approvalDate?: string | undefined;
  suppliersEvaluated: number;
  supplierBids: ComparativeSupplierBid[];
  items: ComparativeItem[];
  recommendationRemarks: string;
  poGenerated?: boolean | undefined;
  generatedPoNo?: string | undefined;
}

export interface Grn {
  id: string;
  grnNo: string;
  date: string;
  poNo: string;
  supplier: string;
  material: string;
  ordered: number;
  received: number;
  accepted: number;
  rejected: number;
  unit: string;
  warehouse: string;
  inspection: "Pending" | "Passed" | "Partially Accepted" | "Failed";
  status: ApprovalStatus;
}

export interface PurchaseBill {
  id: string;
  billNo: string;
  date: string;
  supplier: string;
  poNo: string;
  grnNo: string;
  amount: number;
  gst: number;
  total: number;
  dueDate: string;
  paid: number;
  paymentStatus: "Unpaid" | "Partially Paid" | "Paid" | "Overdue";
}

export interface Supplier {
  id: string;
  name: string;
  category: string;
  gstin: string;
  city: string;
  purchaseValue: number;
  orders: number;
  onTimePct: number;
  qualityScore: number;
  rating: number;
}

export interface StockItem {
  id: string;
  code: string;
  name: string;
  category: string;
  unit: string;
  quantity: number;
  reorderLevel: number;
  rate: number;
  value: number;
  warehouse: string;
  project: string;
  lastMovement: string;
}

export interface StockTxn {
  id: string;
  docNo: string;
  date: string;
  type: "Issue" | "Receipt" | "Transfer" | "Adjustment";
  item: string;
  quantity: number;
  unit: string;
  project: string;
  site: string;
  issuedTo?: string;
  contractor?: string;
  workOrder?: string;
  reference?: string;
  status: ApprovalStatus;
}

export interface BoqLine {
  id: string;
  code: string;
  workItem: string;
  description: string;
  unit: string;
  quantity: number;
  rate: number;
  amount: number;
  material: number;
  labour: number;
  actualQty: number;
  actualRate: number;
  project: string;
}

export interface BudgetLine {
  id: string;
  head: string;
  project: string;
  budget: number;
  actual: number;
  committed: number;
}

export interface WorkPlanTask {
  id: string;
  wbs: string;
  activity: string;
  project: string;
  startDate: string;
  endDate: string;
  plannedQty: number;
  unit: string;
  contractor: string;
  dependency: string;
  progress: number;
  status: "Not Started" | "In Progress" | "Completed" | "Delayed";
}

export interface WorkOrder {
  id: string;
  woNo: string;
  date: string;
  contractor: string;
  project: string;
  work: string;
  boqRef: string;
  quantity: number;
  unit: string;
  rate: number;
  amount: number;
  startDate: string;
  completionDate: string;
  progress: number;
  status: ApprovalStatus;
}

export interface Dpr {
  id: string;
  dprNo: string;
  date: string;
  project: string;
  site: string;
  weather: string;
  activities: {
    activity: string;
    plannedQty: number;
    actualQty: number;
    unit: string;
  }[];
  labour: { skilled: number; unskilled: number; supervisors: number };
  machinery: string[];
  materials: { item: string; quantity: number; unit: string }[];
  progress: number;
  issues: string;
  safety: string;
  remarks: string;
  submittedBy: string;
  status: ApprovalStatus;
}

export interface ContractorBill {
  id: string;
  billNo: string;
  date: string;
  contractor: string;
  project: string;
  workOrder: string;
  measurement: string;
  quantity: number;
  rate: number;
  gross: number;
  retention: number;
  tds: number;
  otherDeductions: number;
  net: number;
  status: ApprovalStatus;
  paymentStatus: "Unpaid" | "Partially Paid" | "Paid";
}

export interface Contractor {
  id: string;
  name: string;
  trade: string;
  city: string;
  activeWorkOrders: number;
  workValue: number;
  billedValue: number;
  paidValue: number;
  performance: number;
}

export interface Lead {
  id: string;
  leadNo: string;
  name: string;
  contact: string;
  email: string;
  source: string;
  projectInterest: string;
  unitInterest: string;
  budget: number;
  assignedTo: string;
  status: "New" | "Contacted" | "Qualified" | "Site Visit" | "Negotiation" | "Won" | "Lost";
  priority: Priority;
  nextFollowUp: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  customerNo: string;
  name: string;
  contact: string;
  email: string;
  city: string;
  project: string;
  unit: string;
  agreementValue: number;
  received: number;
  outstanding: number;
  bookingDate: string;
  status: "Booked" | "Agreement Done" | "Possession" | "Cancelled";
}

export interface Unit {
  id: string;
  project: string;
  tower: string;
  floor: number;
  unitNo: string;
  unitType: string;
  carpetArea: number;
  saleableArea: number;
  basePrice: number;
  otherCharges: number;
  totalPrice: number;
  status: "Available" | "Hold" | "Booked" | "Sold" | "Cancelled" | "Transferred";
  customer?: string | undefined;
}

export interface PaymentMilestone {
  id: string;
  customer: string;
  unit: string;
  milestone: string;
  dueDate: string;
  amount: number;
  paid: number;
  status: "Paid" | "Due" | "Overdue" | "Upcoming";
  interest: number;
}

export interface FollowUp {
  id: string;
  entity: string;
  entityType: "Lead" | "Customer";
  date: string;
  type: "Call" | "Email" | "Site Visit" | "Meeting" | "WhatsApp";
  assignedTo: string;
  outcome: string;
  nextFollowUp: string;
  status: "Completed" | "Pending" | "Overdue";
}

export interface LedgerEntry {
  id: string;
  date: string;
  voucherNo: string;
  voucherType: "Payment" | "Receipt" | "Journal" | "Contra" | "Debit Note" | "Credit Note";
  account: string;
  narration: string;
  debit: number;
  credit: number;
  project: string;
}

export interface Receivable {
  id: string;
  party: string;
  invoiceNo: string;
  date: string;
  dueDate: string;
  amount: number;
  paid: number;
  outstanding: number;
  ageingBucket: "0-30" | "31-60" | "61-90" | "90+";
  project: string;
}

export interface Employee {
  id: string;
  empId: string;
  name: string;
  department: string;
  designation: string;
  joiningDate: string;
  location: string;
  grossSalary: number;
  status: "Active" | "On Leave" | "Resigned";
}

export interface ApprovalTask {
  id: string;
  document: string;
  docNo: string;
  project: string;
  raisedBy: string;
  date: string;
  amount: number;
  level: string;
  priority: Priority;
  status: ApprovalStatus;
}

export interface ActivityEvent {
  id: string;
  actor: string;
  action: string;
  target: string;
  module: string;
  time: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  detail: string;
  type: "approval" | "stock" | "payment" | "task" | "project" | "lead";
  time: string;
  unread: boolean;
}

export interface DocumentFile {
  id: string;
  name: string;
  type: string;
  size: string;
  version: string;
  uploadedBy: string;
  uploadedAt: string;
  linkedTo: string;
}

export interface Kpi {
  label: string;
  value: string;
  delta?: number | undefined;
  deltaLabel?: string | undefined;
  hint?: string | undefined;
  icon?: string | undefined;
  tone?: "default" | "success" | "warning" | "danger" | "info" | undefined;
  to?: string | undefined;
}

/* ------------------ Phase 2: WBS, BOQ & Material Requirements ------------------ */

export type WbsActivityStatus = "Not Started" | "In Progress" | "Completed" | "Delayed" | "On Hold";

export interface WBSActivity {
  id: string;
  wbsCode: string; // e.g. "01.01", "02.04"
  name: string;
  parentWbs: string; // e.g. "01", "02"
  responsible: string;
  startDate: string;
  endDate: string;
  duration: number; // in days
  plannedProgress: number;
  actualProgress: number;
  variance: number;
  status: WbsActivityStatus;
  dependency?: string | undefined;
  priority: Priority;
  criticalPath?: boolean | undefined;
  project: string;
}

export interface WBSNode {
  id: string;
  code: string; // e.g. "01", "02", "03", "04"
  name: string;
  project: string;
  progress: number;
  plannedProgress: number;
  activities: WBSActivity[];
}

export interface PlanningSummary {
  plannedStart: string;
  plannedCompletion: string;
  overallProgress: number;
  plannedProgress: number;
  scheduleVariance: number;
  totalActivities: number;
  completedActivities: number;
  delayedActivities: number;
  criticalActivities: number;
}

export type BOQCategory =
  | "Civil"
  | "Structural"
  | "Electrical"
  | "Plumbing"
  | "MEP"
  | "Finishing"
  | "External Works"
  | "Other";

export type BOQUnit =
  "Nos" | "Sq.ft" | "Sq.m" | "Cu.m" | "MT" | "Kg" | "Bag" | "Ltr" | "Day" | "Job";

export type BOQItemStatus = "Not Started" | "In Progress" | "Completed" | "On Hold";

export interface BOQItem {
  id: string;
  boqNo: string; // e.g. "BOQ-01", "BOQ-02"
  wbsCode: string; // e.g. "02.04"
  description: string;
  category: BOQCategory;
  unit: BOQUnit;
  estimatedQty: number;
  approvedQty: number;
  rate: number;
  amount: number; // approvedQty * rate
  taxPct: number; // GST %
  consumedQty: number;
  balanceQty: number; // approvedQty - consumedQty
  progress: number; // (consumedQty / approvedQty) * 100
  status: BOQItemStatus;
  itemType: "Material" | "Labour" | "Composite";
  materialRef?: string | undefined;
  remarks?: string | undefined;
  project: string;
  revisionId?: string | undefined;
}

export type BOQRevisionStatus = "Draft" | "Under Review" | "Approved" | "Superseded";

export interface BOQRevision {
  id: string;
  revNo: string; // "BOQ Rev 00", "BOQ Rev 01", "BOQ Rev 02"
  title: string;
  date: string;
  preparedBy: string;
  approvedBy: string;
  status: BOQRevisionStatus;
  totalValue: number;
  project: string;
}

export type MaterialRequirementStatus = "Sufficient" | "Low Stock" | "Procurement Required";

export interface MaterialRequirement {
  id: string;
  material: string;
  category: string;
  unit: string;
  boqQuantity: number;
  consumed: number;
  required: number; // boqQuantity - consumed
  availableStock: number;
  shortfall: number; // Math.max(0, required - availableStock)
  requiredDate: string;
  status: MaterialRequirementStatus;
  project: string;
  estimatedRate: number;
}
