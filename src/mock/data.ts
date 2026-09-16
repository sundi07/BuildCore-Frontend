import type {
  ActivityEvent,
  ApprovalStatus,
  ApprovalTask,
  BoqLine,
  BudgetLine,
  Company,
  Contractor,
  ContractorBill,
  Customer,
  DocumentFile,
  Dpr,
  MockEmployee,
  FollowUp,
  Grn,
  Indent,
  Lead,
  LedgerEntry,
  NotificationItem,
  PaymentMilestone,
  Priority,
  Project,
  PurchaseBill,
  PurchaseOrder,
  Quotation,
  QuotationStatus,
  Receivable,
  StockItem,
  StockTxn,
  Supplier,
  Unit,
  WorkOrder,
  WorkPlanTask,
} from "@/types";

/* ------------------------------------------------------------------ *
 * Deterministic pseudo-random helpers so demo data is stable on SSR   *
 * ------------------------------------------------------------------ */
let seed = 20260910;
function rnd() {
  seed = (seed * 1103515245 + 12345) % 2147483648;
  return seed / 2147483648;
}
function pick<T>(arr: T[]): T {
  return arr[Math.floor(rnd() * arr.length)]!;
}
function between(min: number, max: number, step = 1) {
  return Math.round((min + rnd() * (max - min)) / step) * step;
}
function isoDate(daysFromToday: number) {
  const base = new Date("2026-09-10T00:00:00Z");
  base.setUTCDate(base.getUTCDate() + daysFromToday);
  return base.toISOString().slice(0, 10);
}

export const companies: Company[] = [
  { id: "c1", name: "Buildcore Infra Pvt Ltd", gstin: "27AABCB1234C1ZK", financialYear: "2026-27" },
  { id: "c2", name: "Buildcore Realty LLP", gstin: "27AABCB9876D1ZP", financialYear: "2026-27" },
];

export const financialYears = ["2026-27", "2025-26", "2024-25"];

export const projects: Project[] = [
  {
    id: "p1",
    code: "PRJ-GVR-01",
    name: "Green Valley Residency",
    location: "Wagholi, Pune",
    client: "Buildcore Realty LLP",
    type: "Residential",
    startDate: "2024-06-12",
    expectedCompletion: "2027-03-31",
    budget: 2480000000,
    actualCost: 1512000000,
    progress: 62,
    status: "In Progress",
    health: "On Track",
    siteEngineer: "Rohit Deshmukh",
    projectManager: "Rohit Deshmukh",
    sites: ["Tower A Site", "Tower B Site", "Clubhouse Site"],
    soldValue: 1980000000,
    collection: 1246000000,
    description:
      "Premium high-rise residential complex with 3 residential towers, clubhouse, swimming pool, and underground double-basement parking. RERA Reg: P52100029811.",
    healthBreakdown: {
      schedule: "Healthy",
      budget: "Healthy",
      cost: "Healthy",
      procurement: "Attention",
      construction: "Healthy",
      notes: {
        schedule: "Casting cycle running at 11 days per slab against 12 days plan.",
        budget: "Cost performance within 1.5% of quarterly allocation.",
        cost: "Material rates locked via quarterly supplier contracts.",
        procurement: "Cement dispatch delayed by 2 days due to transporter strike.",
        construction: "Tower A 14th slab completed; brickwork in progress up to 9th floor.",
      },
    },
    locationDetails: {
      address: "Sr. No. 45/2, Nagar Road, Ahead of Lexicon School",
      city: "Pune",
      state: "Maharashtra",
      pincode: "412207",
      siteName: "Wagholi Central Site",
    },
    financials: {
      contractValue: 2650000000,
      budget: 2480000000,
      actualCost: 1512000000,
      committedCost: 520000000,
      balanceBudget: 448000000,
      billing: 1820000000,
      collection: 1246000000,
      outstanding: 574000000,
      contingencyPct: 4.5,
      taxGstApplicable: "GST 18% (RERA Input Tax Credit Applicable)",
    },
    configuration: {
      towersCount: 3,
      unitsCount: 360,
      floorsCount: 22,
      projectArea: 485000,
      uom: "Sq.Ft",
    },
    procurementSummary: {
      totalIndents: 84,
      pendingIndents: 6,
      purchaseOrders: 68,
      poValue: 1140000000,
      pendingGrn: 4,
    },
    inventorySummary: {
      stockValue: 48600000,
      lowStockItems: 3,
      materialReceived: 984000000,
      materialIssued: 935400000,
      materialConsumed: 924000000,
    },
    constructionSummary: {
      overallProgress: 62,
      plannedProgress: 60,
      actualProgress: 62,
      variance: 2.0,
    },
    documentsList: [
      {
        id: "doc-1",
        title: "RERA Registration Certificate",
        category: "Approvals",
        docNo: "P52100029811",
        fileSize: "2.4 MB",
        uploadedAt: "2024-05-10",
        uploadedBy: "Legal Team",
        fileType: "PDF",
        status: "Valid",
      },
      {
        id: "doc-2",
        title: "Principal Agreement with Buildcore Realty",
        category: "Project Agreement",
        docNo: "AGR-2024-001",
        fileSize: "8.1 MB",
        uploadedAt: "2024-05-18",
        uploadedBy: "Contracts Head",
        fileType: "PDF",
        status: "Approved",
      },
      {
        id: "doc-3",
        title: "Tower A & B RCC Structural GFC Drawings Rev 4",
        category: "Drawings",
        docNo: "STR-DWG-04",
        fileSize: "18.5 MB",
        uploadedAt: "2024-08-22",
        uploadedBy: "Chief Structural Eng",
        fileType: "DWG / PDF",
        status: "Approved",
      },
      {
        id: "doc-4",
        title: "Environmental Clearance & Tree Authority NOC",
        category: "Approvals",
        docNo: "ENV-NOC-2024",
        fileSize: "3.7 MB",
        uploadedAt: "2024-04-15",
        uploadedBy: "Liaison Officer",
        fileType: "PDF",
        status: "Valid",
      },
      {
        id: "doc-5",
        title: "Fire Safety Provisional NOC",
        category: "Other Documents",
        docNo: "PMC-FIRE-891",
        fileSize: "1.9 MB",
        uploadedAt: "2024-06-01",
        uploadedBy: "Safety Dept",
        fileType: "PDF",
        status: "Approved",
      },
    ],
    recentActivity: [
      {
        id: "act-1",
        action: "PO-1024 created for 60 MT Fe500D TMT Steel (Maharashtra Steel)",
        category: "PO",
        timestamp: "Today, 10:15 AM",
        user: "Pooja Hegde (Purchase)",
        badgeTone: "info",
      },
      {
        id: "act-2",
        action: "500 Bags OPC 53 Cement received at Tower A site (GRN-402)",
        category: "Material",
        timestamp: "Yesterday, 04:30 PM",
        user: "Kishore Mali (Storekeeper)",
        badgeTone: "success",
      },
      {
        id: "act-3",
        action: "Tower B 11th floor RCC slab progress updated to 68%",
        category: "Civil",
        timestamp: "10 Sep 2026",
        user: "Rohit Deshmukh (PM)",
        badgeTone: "default",
      },
      {
        id: "act-4",
        action: "Contractor RA Bill 09 approved for ₹48,60,000",
        category: "Billing",
        timestamp: "08 Sep 2026",
        user: "Sanket G (Director)",
        badgeTone: "success",
      },
      {
        id: "act-5",
        action: "Material issue slip MIS-889 issued for 12mm Plumbing pipes",
        category: "Material",
        timestamp: "07 Sep 2026",
        user: "Sachin Kadam (Site Eng)",
        badgeTone: "info",
      },
      {
        id: "act-6",
        action: "Site safety audit issue reported: Edge protection needed at Podium",
        category: "Issue",
        timestamp: "05 Sep 2026",
        user: "Vinod R (Safety Officer)",
        badgeTone: "warning",
      },
    ],
    issuesList: [
      {
        id: "iss-1",
        issueNo: "ISS-GVR-01",
        title: "Edge protection barrier missing on Tower B 11th floor slab",
        category: "Safety",
        severity: "High",
        assignedTo: "Rohit Deshmukh",
        status: "In Progress",
        reportedDate: "2026-09-08",
      },
      {
        id: "iss-2",
        issueNo: "ISS-GVR-02",
        title: "Batch variation in Ready Mix Concrete M30 supplier truck 4",
        category: "Quality",
        severity: "Medium",
        assignedTo: "Quality Lab Team",
        status: "Resolved",
        reportedDate: "2026-09-06",
      },
      {
        id: "iss-3",
        issueNo: "ISS-GVR-03",
        title: "CPVC 25mm pipe fittings delivery delayed by 3 days",
        category: "Material Shortage",
        severity: "Low",
        assignedTo: "Purchase Team",
        status: "Closed",
        reportedDate: "2026-09-02",
      },
    ],
  },
  {
    id: "p2",
    code: "PRJ-SKH-02",
    name: "Skyline Heights",
    location: "Thane West, Mumbai",
    client: "Skyline Developers",
    type: "Residential",
    startDate: "2025-01-20",
    expectedCompletion: "2028-06-30",
    budget: 3860000000,
    actualCost: 1424000000,
    progress: 38,
    status: "In Progress",
    health: "At Risk",
    siteEngineer: "Amit Kulkarni",
    projectManager: "Amit Kulkarni",
    sites: ["Tower 1 Site", "Tower 2 Site", "Podium Parking"],
    soldValue: 2410000000,
    collection: 1032000000,
    description:
      "Twin super-structure towers of 34 storeys overlooking Yeoor Hills with high-end luxury specifications and smart home automation.",
    healthBreakdown: {
      schedule: "Attention",
      budget: "Healthy",
      cost: "Attention",
      procurement: "Critical",
      construction: "Attention",
      notes: {
        schedule: "Podium 3 slab delayed by 14 days due to heavy monsoon downpours.",
        budget: "Within tolerance; contingency unutilized so far.",
        cost: "Steel prices surged by 6% in local MMR market.",
        procurement: "Rebar delivery backlog from primary rolling mill.",
        construction: "Retaining wall de-watering currently ongoing.",
      },
    },
    locationDetails: {
      address: "Ghodbunder Road, Near Ovala Junction",
      city: "Thane",
      state: "Maharashtra",
      pincode: "400615",
      siteName: "Thane Luxury Site",
    },
    financials: {
      contractValue: 4120000000,
      budget: 3860000000,
      actualCost: 1424000000,
      committedCost: 890000000,
      balanceBudget: 1546000000,
      billing: 1350000000,
      collection: 1032000000,
      outstanding: 318000000,
      contingencyPct: 5.0,
      taxGstApplicable: "GST 18%",
    },
    configuration: {
      towersCount: 2,
      unitsCount: 280,
      floorsCount: 34,
      projectArea: 620000,
      uom: "Sq.Ft",
    },
    procurementSummary: {
      totalIndents: 112,
      pendingIndents: 14,
      purchaseOrders: 82,
      poValue: 1450000000,
      pendingGrn: 9,
    },
    inventorySummary: {
      stockValue: 62400000,
      lowStockItems: 5,
      materialReceived: 890000000,
      materialIssued: 827600000,
      materialConsumed: 812000000,
    },
    constructionSummary: {
      overallProgress: 38,
      plannedProgress: 44,
      actualProgress: 38,
      variance: -6.0,
    },
    documentsList: [
      {
        id: "doc-201",
        title: "MahaRERA Registration Docket",
        category: "Approvals",
        docNo: "P51700034112",
        fileSize: "3.8 MB",
        uploadedAt: "2024-12-10",
        uploadedBy: "Legal Dept",
        fileType: "PDF",
        status: "Valid",
      },
      {
        id: "doc-202",
        title: "Joint Venture Development Agreement",
        category: "Project Agreement",
        docNo: "JDA-THN-02",
        fileSize: "12.4 MB",
        uploadedAt: "2024-11-20",
        uploadedBy: "VP Contracts",
        fileType: "PDF",
        status: "Approved",
      },
      {
        id: "doc-203",
        title: "Tower 1 & 2 Pile Foundation Layout GFC",
        category: "Drawings",
        docNo: "DWG-FND-01",
        fileSize: "22.1 MB",
        uploadedAt: "2025-01-05",
        uploadedBy: "Geotech Consultants",
        fileType: "DWG",
        status: "Approved",
      },
    ],
    recentActivity: [
      {
        id: "act-21",
        action: "Site issue reported: Dewatering pump failure during heavy rainfall",
        category: "Issue",
        timestamp: "Today, 08:30 AM",
        user: "Amit Kulkarni (PM)",
        badgeTone: "danger",
      },
      {
        id: "act-22",
        action: "PO-1089 issued for 120 MT TMT Steel 16mm",
        category: "PO",
        timestamp: "Yesterday, 02:15 PM",
        user: "Rahul Sharma (Procurement)",
        badgeTone: "info",
      },
      {
        id: "act-23",
        action: "Tower 1 Podium 2 concrete pour completed (180 cum)",
        category: "Civil",
        timestamp: "09 Sep 2026",
        user: "Amit Kulkarni (PM)",
        badgeTone: "success",
      },
    ],
    issuesList: [
      {
        id: "iss-201",
        issueNo: "ISS-SKH-01",
        title: "Dewatering pump capacity insufficient in basement 2 during rain",
        category: "Civil Delay",
        severity: "Urgent",
        assignedTo: "Site Mech Team",
        status: "Open",
        reportedDate: "2026-09-10",
      },
    ],
  },
  {
    id: "p3",
    code: "PRJ-RFT-03",
    name: "Riverfront Towers",
    location: "Vaishali, Ahmedabad",
    client: "Riverfront Housing Ltd",
    type: "Mixed Use",
    startDate: "2023-09-05",
    expectedCompletion: "2026-12-31",
    budget: 1720000000,
    actualCost: 1489000000,
    progress: 84,
    status: "In Progress",
    health: "On Track",
    siteEngineer: "Nilesh Patel",
    projectManager: "Nilesh Patel",
    sites: ["Block A", "Block B", "Retail Podium"],
    soldValue: 1560000000,
    collection: 1398000000,
    description:
      "Mixed-use urban hub featuring 2 commercial towers, ground retail promenade, and state-of-the-art office spaces along Sabarmati corridor.",
    healthBreakdown: {
      schedule: "Healthy",
      budget: "Healthy",
      cost: "Healthy",
      procurement: "Healthy",
      construction: "Healthy",
      notes: {
        schedule: "Finishing works and MEP testing proceeding on target.",
        budget: "Projected final cost within 2% variance.",
        cost: "No major cost overruns in MEP and HVAC works.",
        procurement: "Lift installation machinery delivered to site.",
        construction: "Glass facade 92% completed; interior plastering on 8th floor.",
      },
    },
    locationDetails: {
      address: "Riverfront West Road, Near Subhash Bridge",
      city: "Ahmedabad",
      state: "Gujarat",
      pincode: "380027",
      siteName: "Sabarmati Waterfront Zone",
    },
    financials: {
      contractValue: 1850000000,
      budget: 1720000000,
      actualCost: 1489000000,
      committedCost: 145000000,
      balanceBudget: 86000000,
      billing: 1610000000,
      collection: 1398000000,
      outstanding: 212000000,
      contingencyPct: 3.5,
      taxGstApplicable: "GST 18%",
    },
    configuration: {
      towersCount: 2,
      unitsCount: 160,
      floorsCount: 18,
      projectArea: 320000,
      uom: "Sq.Ft",
    },
    procurementSummary: {
      totalIndents: 96,
      pendingIndents: 2,
      purchaseOrders: 89,
      poValue: 1120000000,
      pendingGrn: 1,
    },
    inventorySummary: {
      stockValue: 24500000,
      lowStockItems: 1,
      materialReceived: 1080000000,
      materialIssued: 1055500000,
      materialConsumed: 1050000000,
    },
    constructionSummary: {
      overallProgress: 84,
      plannedProgress: 82,
      actualProgress: 84,
      variance: 2.0,
    },
    documentsList: [
      {
        id: "doc-301",
        title: "GujRERA Project Certificate",
        category: "Approvals",
        docNo: "PR/GJ/AHM/2023",
        fileSize: "1.8 MB",
        uploadedAt: "2023-08-15",
        uploadedBy: "Liaison",
        fileType: "PDF",
        status: "Valid",
      },
      {
        id: "doc-302",
        title: "Façade & Curtain Glazing Specification",
        category: "Drawings",
        docNo: "FAC-DWG-03",
        fileSize: "9.2 MB",
        uploadedAt: "2025-04-10",
        uploadedBy: "Facade Consultant",
        fileType: "PDF",
        status: "Approved",
      },
    ],
    recentActivity: [
      {
        id: "act-31",
        action: "Payment certificate approved for Schindler Elevators ₹34,20,000",
        category: "Billing",
        timestamp: "Today, 11:00 AM",
        user: "Nilesh Patel (PM)",
        badgeTone: "success",
      },
      {
        id: "act-32",
        action: "RCC progress updated to 84% - Retail podium handover ready",
        category: "Civil",
        timestamp: "08 Sep 2026",
        user: "Nilesh Patel (PM)",
        badgeTone: "default",
      },
    ],
  },
  {
    id: "p4",
    code: "PRJ-CCC-04",
    name: "City Center Commercial",
    location: "Hinjewadi, Pune",
    client: "Nexus Commercial Holdings",
    type: "Commercial",
    startDate: "2025-08-18",
    expectedCompletion: "2028-11-30",
    budget: 2960000000,
    actualCost: 612000000,
    progress: 19,
    status: "In Progress",
    health: "Delayed",
    siteEngineer: "Sanjay Rane",
    projectManager: "Sanjay Rane",
    sites: ["Main Structure", "Basement Works"],
    soldValue: 890000000,
    collection: 264000000,
    description:
      "Grade-A IT park building with double-glazed acoustic facade, solar rooftop grid, and large floor plates designed for global technology tenants.",
    healthBreakdown: {
      schedule: "Critical",
      budget: "Attention",
      cost: "Critical",
      procurement: "Attention",
      construction: "Critical",
      notes: {
        schedule: "Basement rock excavation encountered hard basalt stratum; 38 days delay.",
        budget: "Blasting & rock-breaker hiring exceeded baseline earthwork budget.",
        cost: "Excavator machinery fuel consumption higher than estimated.",
        procurement: "Piling rig mobilization completed; concrete batching operational.",
        construction: "Basement 2 retaining wall anchoring 42% complete.",
      },
    },
    locationDetails: {
      address: "Phase 1, Rajiv Gandhi Infotech Park",
      city: "Pune",
      state: "Maharashtra",
      pincode: "411057",
      siteName: "Hinjewadi Tech Park Site",
    },
    financials: {
      contractValue: 3200000000,
      budget: 2960000000,
      actualCost: 612000000,
      committedCost: 480000000,
      balanceBudget: 1868000000,
      billing: 450000000,
      collection: 264000000,
      outstanding: 186000000,
      contingencyPct: 6.0,
      taxGstApplicable: "GST 18%",
    },
    configuration: {
      towersCount: 1,
      unitsCount: 45,
      floorsCount: 16,
      projectArea: 510000,
      uom: "Sq.Ft",
    },
    procurementSummary: {
      totalIndents: 45,
      pendingIndents: 8,
      purchaseOrders: 32,
      poValue: 560000000,
      pendingGrn: 3,
    },
    inventorySummary: {
      stockValue: 31200000,
      lowStockItems: 4,
      materialReceived: 380000000,
      materialIssued: 348800000,
      materialConsumed: 340000000,
    },
    constructionSummary: {
      overallProgress: 19,
      plannedProgress: 28,
      actualProgress: 19,
      variance: -9.0,
    },
    documentsList: [
      {
        id: "doc-401",
        title: "MIDC Building Approval & Commencement Certificate",
        category: "Approvals",
        docNo: "MIDC/CC/2025/119",
        fileSize: "4.5 MB",
        uploadedAt: "2025-07-20",
        uploadedBy: "Liaison Officer",
        fileType: "PDF",
        status: "Valid",
      },
    ],
    recentActivity: [
      {
        id: "act-41",
        action: "Site issue reported: Rock breaker blade breakdown at Basement 2",
        category: "Issue",
        timestamp: "Today, 09:00 AM",
        user: "Sanjay Rane (PM)",
        badgeTone: "danger",
      },
      {
        id: "act-42",
        action: "PO-1045 placed for 80 Cum M35 Ready Mix Concrete",
        category: "PO",
        timestamp: "08 Sep 2026",
        user: "Purchase Dept",
        badgeTone: "info",
      },
    ],
    issuesList: [
      {
        id: "iss-401",
        issueNo: "ISS-CCC-01",
        title: "Heavy basalt rock stratum slowing basement excavation",
        category: "Civil Delay",
        severity: "Urgent",
        assignedTo: "Geotechnical Contractor",
        status: "Open",
        reportedDate: "2026-08-28",
      },
    ],
  },
  {
    id: "p5",
    code: "PRJ-MTR-05",
    name: "Metro Link Flyover Package 3",
    location: "Nashik Road, Nashik",
    client: "State Infra Development Corp",
    type: "Infrastructure",
    startDate: "2024-11-01",
    expectedCompletion: "2027-09-30",
    budget: 1180000000,
    actualCost: 486000000,
    progress: 44,
    status: "In Progress",
    health: "On Track",
    siteEngineer: "Prakash Joshi",
    projectManager: "Prakash Joshi",
    sites: ["Pier Works", "Deck Works"],
    soldValue: 0,
    collection: 0,
    description:
      "4-lane elevated corridor spanning 3.8 km including 112 piers, precast girder launching, and bituminous asphalt surfacing over railway crossing.",
    healthBreakdown: {
      schedule: "Healthy",
      budget: "Healthy",
      cost: "Healthy",
      procurement: "Healthy",
      construction: "Healthy",
      notes: {
        schedule: "Pier caps casting ahead of schedule by 5 days.",
        budget: "Escalation clause protection active for bitumen and steel.",
        cost: "Labour costs stable through multi-year contractor agreements.",
        procurement: "Segment casting yard fully supplied with high-strength prestressing cables.",
        construction: "34 out of 112 pier caps casted and load-tested.",
      },
    },
    locationDetails: {
      address: "Nashik-Pune National Highway Sector 4",
      city: "Nashik",
      state: "Maharashtra",
      pincode: "422101",
      siteName: "Flyover Section 3 Site",
    },
    financials: {
      contractValue: 1240000000,
      budget: 1180000000,
      actualCost: 486000000,
      committedCost: 290000000,
      balanceBudget: 404000000,
      billing: 540000000,
      collection: 462000000,
      outstanding: 78000000,
      contingencyPct: 5.0,
      taxGstApplicable: "GST 12% (Govt Infrastructure Works Contract)",
    },
    configuration: {
      towersCount: 0,
      unitsCount: 0,
      floorsCount: 0,
      projectArea: 3800,
      uom: "Metres",
    },
    procurementSummary: {
      totalIndents: 62,
      pendingIndents: 3,
      purchaseOrders: 51,
      poValue: 620000000,
      pendingGrn: 2,
    },
    inventorySummary: {
      stockValue: 38400000,
      lowStockItems: 2,
      materialReceived: 410000000,
      materialIssued: 371600000,
      materialConsumed: 368000000,
    },
    constructionSummary: {
      overallProgress: 44,
      plannedProgress: 42,
      actualProgress: 44,
      variance: 2.0,
    },
    documentsList: [
      {
        id: "doc-501",
        title: "NHAI / State Govt Work Award Agreement",
        category: "Project Agreement",
        docNo: "SIDC/INFRA/2024/09",
        fileSize: "15.1 MB",
        uploadedAt: "2024-10-10",
        uploadedBy: "Contracts Team",
        fileType: "PDF",
        status: "Approved",
      },
      {
        id: "doc-502",
        title: "Railway Overbridge Clearances & Safety Protocol",
        category: "Approvals",
        docNo: "CR-ROB-NOC-44",
        fileSize: "6.2 MB",
        uploadedAt: "2024-11-20",
        uploadedBy: "Liaison Dept",
        fileType: "PDF",
        status: "Valid",
      },
    ],
    recentActivity: [
      {
        id: "act-51",
        action: "Pier cap casting 34 passed 28-day cube compressive strength test (48.2 MPa)",
        category: "Civil",
        timestamp: "Yesterday, 03:40 PM",
        user: "Prakash Joshi (PM)",
        badgeTone: "success",
      },
      {
        id: "act-52",
        action: "Material issue created for Prestressing strand cables (8 coils)",
        category: "Material",
        timestamp: "08 Sep 2026",
        user: "Stores Yard Incharge",
        badgeTone: "info",
      },
    ],
  },
  {
    id: "p6",
    code: "PRJ-ORC-06",
    name: "Orchid Enclave Phase 1",
    location: "Gotri, Vadodara",
    client: "Orchid Habitat Pvt Ltd",
    type: "Residential",
    startDate: "2022-04-04",
    expectedCompletion: "2025-10-31",
    budget: 940000000,
    actualCost: 928000000,
    progress: 100,
    status: "Completed",
    health: "On Track",
    siteEngineer: "Vikas Shah",
    projectManager: "Vikas Shah",
    sites: ["Phase 1 Site"],
    soldValue: 1120000000,
    collection: 1104000000,
    description:
      "Completed and occupied residential gated community with 140 luxury apartments, club house, and landscaped podium gardens. Occupancy Certificate received.",
    healthBreakdown: {
      schedule: "Healthy",
      budget: "Healthy",
      cost: "Healthy",
      procurement: "Healthy",
      construction: "Healthy",
      notes: {
        schedule: "Completed on schedule with OC obtained.",
        budget: "Delivered under budget with ₹1.2 Cr savings.",
        cost: "Final contractor reconciliations completed.",
        procurement: "All procurement closed; residual inventory transferred.",
        construction: "Handover to RWA completed.",
      },
    },
    locationDetails: {
      address: "Gotri-Sevasi Road",
      city: "Vadodara",
      state: "Gujarat",
      pincode: "390021",
      siteName: "Orchid Enclave Site",
    },
    financials: {
      contractValue: 1050000000,
      budget: 940000000,
      actualCost: 928000000,
      committedCost: 0,
      balanceBudget: 12000000,
      billing: 1050000000,
      collection: 1104000000,
      outstanding: 16000000,
      contingencyPct: 3.0,
      taxGstApplicable: "GST 5% (Affordable/Mid-Income Category)",
    },
    configuration: {
      towersCount: 2,
      unitsCount: 140,
      floorsCount: 12,
      projectArea: 195000,
      uom: "Sq.Ft",
    },
    procurementSummary: {
      totalIndents: 74,
      pendingIndents: 0,
      purchaseOrders: 68,
      poValue: 710000000,
      pendingGrn: 0,
    },
    inventorySummary: {
      stockValue: 1200000,
      lowStockItems: 0,
      materialReceived: 680000000,
      materialIssued: 678800000,
      materialConsumed: 678800000,
    },
    constructionSummary: {
      overallProgress: 100,
      plannedProgress: 100,
      actualProgress: 100,
      variance: 0.0,
    },
    documentsList: [
      {
        id: "doc-601",
        title: "Occupancy Certificate (OC) by VMC",
        category: "Approvals",
        docNo: "VMC/OC/2025/892",
        fileSize: "2.1 MB",
        uploadedAt: "2025-10-25",
        uploadedBy: "Legal Head",
        fileType: "PDF",
        status: "Valid",
      },
    ],
    recentActivity: [
      {
        id: "act-61",
        action: "Final retention release approved for MEP Contractor ₹18,50,000",
        category: "Billing",
        timestamp: "02 Sep 2026",
        user: "Vikas Shah (PM)",
        badgeTone: "success",
      },
    ],
  },
  {
    id: "p7",
    code: "PRJ-PLN-07",
    name: "Phoenix Industrial Logistics Park",
    location: "Chakan MIDC, Pune",
    client: "Phoenix Logistics Hubs Pvt Ltd",
    type: "Industrial",
    startDate: "2026-10-15",
    expectedCompletion: "2028-04-30",
    budget: 1840000000,
    actualCost: 45000000,
    progress: 6,
    status: "Planning",
    health: "On Track",
    siteEngineer: "Sachin Kadam",
    projectManager: "Sachin Kadam",
    sites: ["Logistics Hub Phase 1"],
    soldValue: 420000000,
    collection: 85000000,
    description:
      "State-of-the-art grade-A warehousing facility with 14m clear height, FM2 industrial floor, docking bays, and automated fire suppression system in automotive corridor.",
    healthBreakdown: {
      schedule: "Healthy",
      budget: "Healthy",
      cost: "Healthy",
      procurement: "Healthy",
      construction: "Healthy",
      notes: {
        schedule: "Master BOQ & PEB structural designs submitted for peer review.",
        budget: "Contingency reserve allocated for site grading works.",
        cost: "Vendor rate enquiries dispatched for PEB steel fabrication.",
        procurement: "Vendor quotes evaluation underway.",
        construction: "Site clearing and contour survey completed.",
      },
    },
    locationDetails: {
      address: "Plot B-14, Chakan Industrial Area Phase 2",
      city: "Pune",
      state: "Maharashtra",
      pincode: "410501",
      siteName: "Chakan Hub Site",
    },
    financials: {
      contractValue: 1980000000,
      budget: 1840000000,
      actualCost: 45000000,
      committedCost: 210000000,
      balanceBudget: 1585000000,
      billing: 65000000,
      collection: 85000000,
      outstanding: 0,
      contingencyPct: 5.0,
      taxGstApplicable: "GST 18%",
    },
    configuration: {
      towersCount: 2,
      unitsCount: 8,
      floorsCount: 1,
      projectArea: 420000,
      uom: "Sq.Ft",
    },
    procurementSummary: {
      totalIndents: 12,
      pendingIndents: 4,
      purchaseOrders: 6,
      poValue: 85000000,
      pendingGrn: 0,
    },
    inventorySummary: {
      stockValue: 5600000,
      lowStockItems: 0,
      materialReceived: 18000000,
      materialIssued: 12400000,
      materialConsumed: 12400000,
    },
    constructionSummary: {
      overallProgress: 6,
      plannedProgress: 5,
      actualProgress: 6,
      variance: 1.0,
    },
    documentsList: [
      {
        id: "doc-701",
        title: "MIDC Industrial Allotment Letter",
        category: "Approvals",
        docNo: "MIDC/AL/CHK/2026",
        fileSize: "3.2 MB",
        uploadedAt: "2026-07-15",
        uploadedBy: "Legal",
        fileType: "PDF",
        status: "Valid",
      },
    ],
    recentActivity: [
      {
        id: "act-71",
        action: "Site contour survey and geotech soil investigation report signed off",
        category: "Civil",
        timestamp: "09 Sep 2026",
        user: "Sachin Kadam (PM)",
        badgeTone: "success",
      },
    ],
  },
  {
    id: "p8",
    code: "PRJ-HLD-08",
    name: "Kalyani Horizon Tech Park",
    location: "Whitefield, Bangalore",
    client: "Kalyani Developers Corp",
    type: "Commercial",
    startDate: "2024-03-01",
    expectedCompletion: "2027-12-31",
    budget: 3150000000,
    actualCost: 890000000,
    progress: 28,
    status: "On Hold",
    health: "Delayed",
    siteEngineer: "Ramesh Babu",
    projectManager: "Ramesh Babu",
    sites: ["Tech Block 1", "Tech Block 2"],
    soldValue: 780000000,
    collection: 310000000,
    description:
      "IT/ITES SEZ commercial development currently on temporary hold pending municipal master plan height clearance revision.",
    healthBreakdown: {
      schedule: "Critical",
      budget: "Attention",
      cost: "Attention",
      procurement: "Attention",
      construction: "Critical",
      notes: {
        schedule: "Work suspended awaiting Revised Master Plan approval.",
        budget: "Standing charges and site security costs being tracked.",
        cost: "Idle equipment costs contained via partial demobilization.",
        procurement: "Pending POs placed on hold.",
        construction: "Structural work halted at 4th floor slab.",
      },
    },
    locationDetails: {
      address: "EPIP Zone, Near ITPL Main Road",
      city: "Bangalore",
      state: "Karnataka",
      pincode: "560066",
      siteName: "Whitefield SEZ Site",
    },
    financials: {
      contractValue: 3450000000,
      budget: 3150000000,
      actualCost: 890000000,
      committedCost: 320000000,
      balanceBudget: 1940000000,
      billing: 480000000,
      collection: 310000000,
      outstanding: 170000000,
      contingencyPct: 7.0,
      taxGstApplicable: "GST 18%",
    },
    configuration: {
      towersCount: 2,
      unitsCount: 30,
      floorsCount: 20,
      projectArea: 650000,
      uom: "Sq.Ft",
    },
    procurementSummary: {
      totalIndents: 42,
      pendingIndents: 0,
      purchaseOrders: 36,
      poValue: 480000000,
      pendingGrn: 0,
    },
    inventorySummary: {
      stockValue: 18400000,
      lowStockItems: 1,
      materialReceived: 340000000,
      materialIssued: 321600000,
      materialConsumed: 321600000,
    },
    constructionSummary: {
      overallProgress: 28,
      plannedProgress: 52,
      actualProgress: 28,
      variance: -24.0,
    },
    documentsList: [
      {
        id: "doc-801",
        title: "KIADB Land Sanction Order",
        category: "Approvals",
        docNo: "KIADB/BLR/2024",
        fileSize: "4.1 MB",
        uploadedAt: "2024-02-12",
        uploadedBy: "Legal",
        fileType: "PDF",
        status: "Valid",
      },
    ],
    recentActivity: [
      {
        id: "act-81",
        action: "Site preservation protocol initiated during master plan review",
        category: "Issue",
        timestamp: "04 Sep 2026",
        user: "Ramesh Babu (PM)",
        badgeTone: "warning",
      },
    ],
  },
  {
    id: "p9",
    code: "PRJ-NST-09",
    name: "Baner Gateway Signature Suites",
    location: "Baner, Pune",
    client: "Gateway Spaces LLP",
    type: "Mixed Use",
    startDate: "2026-11-01",
    expectedCompletion: "2029-08-31",
    budget: 2100000000,
    actualCost: 12000000,
    progress: 0,
    status: "Not Started",
    health: "On Track",
    siteEngineer: "Amit Kulkarni",
    projectManager: "Amit Kulkarni",
    sites: ["Main Plot Site"],
    soldValue: 0,
    collection: 0,
    description:
      "High-end studio apartments and retail high-street along Mumbai-Bangalore Highway bypass corridor.",
    healthBreakdown: {
      schedule: "Healthy",
      budget: "Healthy",
      cost: "Healthy",
      procurement: "Healthy",
      construction: "Healthy",
      notes: {
        schedule: "Commencement scheduled post-Diwali holidays.",
        budget: "Detailed item-rate BOQ finalized.",
        cost: "Preliminary site setup contracts awarded.",
        procurement: "Procurement schedule established.",
        construction: "Soil testing completed.",
      },
    },
    locationDetails: {
      address: "Survey No 28, Near Pancard Club Road",
      city: "Pune",
      state: "Maharashtra",
      pincode: "411045",
      siteName: "Baner Highway Site",
    },
    financials: {
      contractValue: 2280000000,
      budget: 2100000000,
      actualCost: 12000000,
      committedCost: 85000000,
      balanceBudget: 2003000000,
      billing: 0,
      collection: 0,
      outstanding: 0,
      contingencyPct: 5.0,
      taxGstApplicable: "GST 18%",
    },
    configuration: {
      towersCount: 1,
      unitsCount: 180,
      floorsCount: 24,
      projectArea: 310000,
      uom: "Sq.Ft",
    },
    procurementSummary: {
      totalIndents: 6,
      pendingIndents: 2,
      purchaseOrders: 3,
      poValue: 24000000,
      pendingGrn: 0,
    },
    inventorySummary: {
      stockValue: 2100000,
      lowStockItems: 0,
      materialReceived: 8000000,
      materialIssued: 5900000,
      materialConsumed: 5900000,
    },
    constructionSummary: {
      overallProgress: 0,
      plannedProgress: 0,
      actualProgress: 0,
      variance: 0.0,
    },
    documentsList: [
      {
        id: "doc-901",
        title: "PMC Sanction Plan & IOD",
        category: "Approvals",
        docNo: "PMC/IOD/2026/410",
        fileSize: "5.8 MB",
        uploadedAt: "2026-08-10",
        uploadedBy: "Architect",
        fileType: "PDF",
        status: "Valid",
      },
    ],
    recentActivity: [
      {
        id: "act-91",
        action: "Site hoarding installation and temporary site office setup completed",
        category: "Civil",
        timestamp: "07 Sep 2026",
        user: "Amit Kulkarni (PM)",
        badgeTone: "info",
      },
    ],
  },
];

export const projectNames = projects.map((p) => p.name);
export const sites = projects.flatMap((p) => p.sites);

export const materials = [
  { name: "OPC 53 Grade Cement", unit: "Bag", rate: 392, category: "Cement" },
  { name: "PPC Cement", unit: "Bag", rate: 368, category: "Cement" },
  { name: "TMT Steel Fe500D 12mm", unit: "MT", rate: 62400, category: "Steel" },
  { name: "TMT Steel Fe500D 16mm", unit: "MT", rate: 61800, category: "Steel" },
  { name: "Red Clay Bricks", unit: "Nos", rate: 9.4, category: "Masonry" },
  { name: "AAC Blocks 600x200x150", unit: "Nos", rate: 62, category: "Masonry" },
  { name: "River Sand", unit: "Brass", rate: 5600, category: "Aggregates" },
  { name: "Crushed Aggregate 20mm", unit: "Brass", rate: 4200, category: "Aggregates" },
  { name: "Vitrified Tiles 600x600", unit: "Sqm", rate: 640, category: "Finishes" },
  { name: "Plumbing CPVC Pipe 25mm", unit: "Rmt", rate: 148, category: "Plumbing" },
  { name: "Electrical Cable 2.5 sqmm", unit: "Coil", rate: 2180, category: "Electrical" },
  { name: "Emulsion Paint Interior", unit: "Ltr", rate: 268, category: "Paint" },
  { name: "Waterproofing Compound", unit: "Kg", rate: 96, category: "Chemicals" },
  { name: "Ready Mix Concrete M30", unit: "Cum", rate: 5850, category: "Concrete" },
];

export const suppliers: Supplier[] = [
  {
    id: "s1",
    name: "ABC Cement Suppliers",
    category: "Cement",
    gstin: "27AACCA1234M1Z2",
    city: "Pune",
    purchaseValue: 184600000,
    orders: 142,
    onTimePct: 94,
    qualityScore: 92,
    rating: 4.6,
  },
  {
    id: "s2",
    name: "Maharashtra Steel Traders",
    category: "Steel",
    gstin: "27AAFCM5678K1Z8",
    city: "Mumbai",
    purchaseValue: 421800000,
    orders: 96,
    onTimePct: 88,
    qualityScore: 90,
    rating: 4.4,
  },
  {
    id: "s3",
    name: "BuildMart Materials",
    category: "General",
    gstin: "24AAGCB8765L1Z1",
    city: "Ahmedabad",
    purchaseValue: 96400000,
    orders: 210,
    onTimePct: 91,
    qualityScore: 86,
    rating: 4.2,
  },
  {
    id: "s4",
    name: "Prime Electricals",
    category: "Electrical",
    gstin: "27AAHCP4321N1Z6",
    city: "Pune",
    purchaseValue: 58200000,
    orders: 77,
    onTimePct: 82,
    qualityScore: 88,
    rating: 4.0,
  },
  {
    id: "s5",
    name: "Shree Ganesh RMC Plant",
    category: "Concrete",
    gstin: "27AAJCS1122Q1Z4",
    city: "Pune",
    purchaseValue: 268900000,
    orders: 188,
    onTimePct: 96,
    qualityScore: 94,
    rating: 4.7,
  },
  {
    id: "s6",
    name: "Nakoda Tiles & Sanitary",
    category: "Finishes",
    gstin: "24AAKCN3344R1Z9",
    city: "Morbi",
    purchaseValue: 74300000,
    orders: 64,
    onTimePct: 79,
    qualityScore: 83,
    rating: 3.8,
  },
];

const people = [
  "Rohit Deshmukh",
  "Amit Kulkarni",
  "Nilesh Patel",
  "Sanjay Rane",
  "Prakash Joshi",
  "Sneha Bhosale",
  "Kiran Waghmare",
  "Pooja Mehta",
  "Rahul Chavan",
  "Ganesh Pawar",
];

const departments = ["Civil", "Finishing", "MEP", "Store", "Planning", "Safety"];
const priorities: Priority[] = ["Low", "Medium", "High", "Urgent"];
const approvalStates: ApprovalStatus[] = ["Draft", "Pending", "Approved", "Rejected", "Sent Back"];

/* ----------------------------- Procurement ----------------------------- */

export const indents: Indent[] = Array.from({ length: 34 }, (_, i) => {
  const phoenixProject =
    projects.find((p) => p.name === "Phoenix Industrial Logistics Park") ?? projects[0]!;
  const project = (i === 0 ? phoenixProject : pick(projects)) ?? projects[0]!;
  const itemCount = i === 0 ? 3 : between(2, 6);
  const items = Array.from({ length: itemCount }, (_, itemIdx) => {
    const m = (i === 0 ? materials[itemIdx % materials.length] : pick(materials)) ?? materials[0]!;
    const quantity =
      i === 0 ? (itemIdx === 0 ? 50 : itemIdx === 1 ? 500 : 20) : between(20, 900, 5);
    return { item: m.name, quantity, unit: m.unit, rate: m.rate, remarks: "" };
  });
  const value = items.reduce((s, it) => s + it.quantity * it.rate, 0);
  const status: ApprovalStatus = i === 0 ? "Approved" : pick(approvalStates);
  return {
    id: `ind-${i + 1}`,
    indentNo: `IND/26-27/${String(1041 + i)}`,
    date: isoDate(-between(1, 70)),
    project: project.name,
    site: i === 0 ? project.sites[0] || "Warehouse Block A" : pick(project.sites) || "Site 1",
    department: i === 0 ? "Civil" : pick(departments),
    requestedBy: i === 0 ? "Nilesh Patel" : pick(people),
    requiredDate: isoDate(between(5, 40)),
    priority: i === 0 ? "Urgent" : pick(priorities),
    itemCount,
    value,
    status,
    level:
      status === "Pending" ? pick(["Level 1 — Project Manager", "Level 2 — Purchase Head"]) : "—",
    remarks:
      i === 0
        ? "Urgent requirement for Phase 2 warehouse PEB foundation and structural slab casting."
        : "Required for slab work in progress.",
    items,
  };
});

export const enquiries = Array.from({ length: 18 }, (_, i) => {
  const m = pick(materials);
  const project = pick(projects);
  return {
    id: `enq-${i + 1}`,
    enquiryNo: `RFQ/26-27/${String(311 + i)}`,
    date: isoDate(-between(1, 45)),
    project: project.name,
    item: m.name,
    quantity: between(50, 800, 10),
    unit: m.unit,
    suppliers: between(2, 5),
    responses: between(0, 4),
    sentDate: isoDate(-between(1, 40)),
    responseDate: isoDate(-between(0, 10)),
    status: pick(["Sent", "Partially Responded", "Closed", "Draft"]),
  };
});

export const quotations: Quotation[] = Array.from({ length: 26 }, (_, i) => {
  const m = pick(materials);
  const supplier = pick(suppliers);
  const quantity = between(40, 600, 10);
  const rate = Math.round(m.rate * (0.94 + rnd() * 0.14));
  const discount = between(0, 4);
  const freight = between(0, 42000, 500);
  const base = quantity * rate * (1 - discount / 100);
  const enquiry = enquiries[i % enquiries.length]!;
  const gst = 18;
  const taxableAmount = Math.round(base);
  const gstAmount = Math.round(taxableAmount * (gst / 100));
  const grandTotal = taxableAmount + gstAmount + freight;
  const status: QuotationStatus = pick([
    "Received",
    "Under Technical Evaluation",
    "Technically Qualified",
    "Commercially Qualified",
    "Rejected",
  ]);

  return {
    id: `qt-${i + 1}`,
    quotationNo: `QT/26-27/${String(701 + i)}`,
    date: isoDate(-between(1, 30)),
    validity: `${between(15, 60)} Days`,
    validUntil: isoDate(between(5, 45)),
    status,

    sourceRFQId: enquiry.id,
    sourceRFQNumber: enquiry.enquiryNo,
    sourceIndentNumber: `IND/26-27/${1040 + (i % 10)}`,
    supplierId: supplier.id,
    supplierName: supplier.name,
    supplierCode: `VEN-00${(i % 5) + 1}`,
    projectId: `p-${(i % 5) + 1}`,
    projectName: enquiry.project,
    siteId: `site-${(i % 3) + 1}`,
    siteName: "Main Construction Site",

    contactPerson: pick(people),
    email: `sales@${supplier.name.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`,
    phone: `+91 98${between(100, 999)} ${between(10000, 99999)}`,

    totalItems: 1,
    basicAmount: quantity * rate,
    discount: Math.round(quantity * rate * (discount / 100)),
    taxableAmount,
    gst: gstAmount,
    freight,
    otherCharges: 0,
    roundOff: 0,
    grandTotal,
    deliveryDays: between(3, 21),
    deliveryTerms: "FOR Destination Site",
    paymentTerms: pick([
      "30 Days Credit",
      "45 Days Credit",
      "Advance 20% + 30 Days",
      "Against Delivery",
    ]),

    items: [
      {
        itemCode: `MAT-${101 + (i % 20)}`,
        itemDescription: `${m.name} - Conforming to standard IS specifications`,
        category: "Civil",
        unit: m.unit,
        rfqQty: quantity,
        quotedQty: quantity,
        rate,
        discountPct: discount,
        discountAmount: Math.round(quantity * rate * (discount / 100)),
        taxPct: gst,
        taxAmount: gstAmount,
        lineAmount: taxableAmount,
        deliverySchedule: `${between(3, 15)} days`,
        remarks: "Standard plant delivery",
      },
    ],

    supplier: supplier.name,
    item: m.name,
    quantity,
    unit: m.unit,
    rate,
    total: grandTotal,
    selected: i % 7 === 0,
  };
});

export const purchaseOrders: PurchaseOrder[] = Array.from({ length: 32 }, (_, i) => {
  const project = pick(projects);
  const supplier = pick(suppliers);
  const amount = between(480000, 18600000, 1000);
  const gst = Math.round(amount * 0.18);
  const status = pick([
    "Approved",
    "Approved",
    "Pending",
    "Draft",
    "Approved",
    "Cancelled",
  ] as ApprovalStatus[]);
  return {
    id: `po-${i + 1}`,
    poNo: `PO/26-27/${String(2210 + i)}`,
    date: isoDate(-between(1, 90)),
    supplier: supplier.name,
    project: project.name,
    site: pick(project.sites),
    itemCount: between(1, 8),
    amount,
    gst,
    total: amount + gst,
    deliveryDate: isoDate(between(-10, 30)),
    paymentTerms: pick(["30 Days Credit", "45 Days Credit", "Against Delivery"]),
    status,
    receivedPct: status === "Approved" ? between(0, 100, 5) : 0,
  };
});

export const grns: Grn[] = Array.from({ length: 28 }, (_, i) => {
  const m = pick(materials);
  const po = pick(purchaseOrders);
  const ordered = between(50, 700, 10);
  const received = Math.round(ordered * (0.7 + rnd() * 0.3));
  const rejected = Math.round(received * (rnd() < 0.7 ? 0 : 0.04));
  return {
    id: `grn-${i + 1}`,
    grnNo: `GRN/26-27/${String(1520 + i)}`,
    date: isoDate(-between(0, 60)),
    poNo: po.poNo,
    supplier: po.supplier,
    material: m.name,
    ordered,
    received,
    accepted: received - rejected,
    rejected,
    unit: m.unit,
    warehouse: pick(sites),
    inspection: rejected > 0 ? "Partially Accepted" : pick(["Passed", "Passed", "Pending"]),
    status: pick(["Approved", "Approved", "Pending"] as ApprovalStatus[]),
  };
});

export const purchaseBills: PurchaseBill[] = Array.from({ length: 24 }, (_, i) => {
  const grn = pick(grns);
  const amount = between(320000, 12800000, 1000);
  const gst = Math.round(amount * 0.18);
  const total = amount + gst;
  const paid = pick([0, 0, Math.round(total * 0.5), total]);
  const dueDate = isoDate(between(-25, 40));
  return {
    id: `pb-${i + 1}`,
    billNo: `PB/26-27/${String(880 + i)}`,
    date: isoDate(-between(2, 70)),
    supplier: grn.supplier,
    poNo: grn.poNo,
    grnNo: grn.grnNo,
    amount,
    gst,
    total,
    dueDate,
    paid,
    paymentStatus:
      paid >= total
        ? "Paid"
        : paid > 0
          ? "Partially Paid"
          : dueDate < isoDate(0)
            ? "Overdue"
            : "Unpaid",
  };
});

/* ----------------------------- Inventory ----------------------------- */

export const stockItems: StockItem[] = materials.flatMap((m, mi) =>
  projects.slice(0, 4).map((p, pi) => {
    const quantity = between(0, 2400, 5);
    const reorderLevel = between(120, 600, 10);
    return {
      id: `st-${mi}-${pi}`,
      code: `MAT-${String(1000 + mi * 10 + pi)}`,
      name: m.name,
      category: m.category,
      unit: m.unit,
      quantity,
      reorderLevel,
      rate: m.rate,
      value: Math.round(quantity * m.rate),
      warehouse: p.sites[0]!,
      project: p.name,
      lastMovement: isoDate(-between(0, 20)),
    };
  }),
);

export const stockTxns: StockTxn[] = Array.from({ length: 46 }, (_, i) => {
  const m = pick(materials);
  const project = pick(projects);
  const type = pick(["Issue", "Receipt", "Transfer", "Adjustment"] as StockTxn["type"][]);
  return {
    id: `sx-${i + 1}`,
    docNo: `${type === "Issue" ? "SI" : type === "Receipt" ? "SR" : type === "Transfer" ? "ST" : "SA"}/26-27/${String(
      430 + i,
    )}`,
    date: isoDate(-between(0, 45)),
    type,
    item: m.name,
    quantity: between(10, 480, 5),
    unit: m.unit,
    project: project.name,
    site: pick(project.sites),
    issuedTo: pick(people),
    contractor: pick([
      "Shivam Constructions",
      "Sai Labour Contractors",
      "Kohinoor Finishers",
      "Metro Civil Works",
    ]),
    workOrder: `WO/26-27/${String(120 + (i % 20))}`,
    reference: `GRN/26-27/${String(1520 + (i % 28))}`,
    status: pick(["Approved", "Approved", "Pending"] as ApprovalStatus[]),
  };
});

export const materialRequisitions = Array.from({ length: 20 }, (_, i) => {
  const m = pick(materials);
  const project = pick(projects);
  return {
    id: `mr-${i + 1}`,
    reqNo: `MR/26-27/${String(640 + i)}`,
    date: isoDate(-between(0, 30)),
    project: project.name,
    site: pick(project.sites),
    department: pick(departments),
    item: m.name,
    quantity: between(20, 400, 5),
    unit: m.unit,
    requiredDate: isoDate(between(1, 20)),
    purpose: pick(["Slab casting", "Brickwork", "Plastering", "Tiling", "MEP rough-in"]),
    status: pick(["Pending", "Approved", "Issued", "Partially Issued"]),
  };
});

/* --------------------------- Construction --------------------------- */

const boqWorks = [
  { work: "Earthwork excavation in foundation", unit: "Cum", rate: 268 },
  { work: "PCC 1:4:8 in foundation", unit: "Cum", rate: 5240 },
  { work: "RCC M30 in footings & columns", unit: "Cum", rate: 8460 },
  { work: "RCC M30 in slabs & beams", unit: "Cum", rate: 8720 },
  { work: "Steel reinforcement Fe500D", unit: "MT", rate: 78400 },
  { work: "AAC block masonry 150mm", unit: "Sqm", rate: 1240 },
  { work: "Internal cement plaster 12mm", unit: "Sqm", rate: 268 },
  { work: "External sand faced plaster", unit: "Sqm", rate: 342 },
  { work: "Vitrified tile flooring 600x600", unit: "Sqm", rate: 1180 },
  { work: "Waterproofing to terrace & toilets", unit: "Sqm", rate: 640 },
  { work: "Internal painting — 2 coats emulsion", unit: "Sqm", rate: 168 },
  { work: "Plumbing & sanitary installation", unit: "Nos", rate: 26400 },
  { work: "Electrical wiring & fixtures", unit: "Nos", rate: 32800 },
  { work: "Aluminium windows with glazing", unit: "Sqm", rate: 4860 },
];

export const boqLines: BoqLine[] = projects.slice(0, 4).flatMap((p, pi) =>
  boqWorks.map((w, wi) => {
    const quantity = between(400, 9000, 10);
    const amount = Math.round(quantity * w.rate);
    const actualQty = Math.round(quantity * (p.progress / 100) * (0.9 + rnd() * 0.2));
    return {
      id: `boq-${pi}-${wi}`,
      code: `BOQ-${pi + 1}.${String(wi + 1).padStart(2, "0")}`,
      workItem: w.work,
      description: `${w.work} as per approved drawings and specifications.`,
      unit: w.unit,
      quantity,
      rate: w.rate,
      amount,
      material: Math.round(amount * 0.62),
      labour: Math.round(amount * 0.28),
      actualQty,
      actualRate: Math.round(w.rate * (0.97 + rnd() * 0.1)),
      project: p.name,
    };
  }),
);

export const budgetLines: BudgetLine[] = projects.slice(0, 5).flatMap((p, pi) =>
  [
    "Material — Cement & Steel",
    "Material — Aggregates",
    "Material — Finishes",
    "Labour & Contractors",
    "MEP Works",
    "Plant & Machinery",
    "Site Overheads",
    "Statutory & Approvals",
  ].map((head, hi) => {
    const budget = between(24000000, 420000000, 100000);
    return {
      id: `bl-${pi}-${hi}`,
      head,
      project: p.name,
      budget,
      actual: Math.round(budget * (p.progress / 100) * (0.85 + rnd() * 0.35)),
      committed: Math.round(budget * (0.1 + rnd() * 0.25)),
    };
  }),
);

export const workPlan: WorkPlanTask[] = projects.slice(0, 4).flatMap((p, pi) =>
  [
    "Excavation & PCC",
    "Raft & Footing RCC",
    "Column casting up to plinth",
    "Slab casting — Level 1 to 6",
    "Slab casting — Level 7 to 14",
    "Blockwork — Lower floors",
    "Internal plaster",
    "Waterproofing",
    "Flooring & tiling",
    "MEP rough-in",
    "Painting & finishing",
    "External development",
  ].map((activity, ai) => {
    const progress = Math.max(
      0,
      Math.min(100, Math.round(p.progress * 1.4 - ai * 9 + between(-6, 6))),
    );
    return {
      id: `wp-${pi}-${ai}`,
      wbs: `${pi + 1}.${ai + 1}`,
      activity,
      project: p.name,
      startDate: isoDate(-260 + ai * 22),
      endDate: isoDate(-200 + ai * 26),
      plannedQty: between(300, 6800, 10),
      unit: pick(["Cum", "Sqm", "MT", "Nos"]),
      contractor: pick([
        "Shivam Constructions",
        "Sai Labour Contractors",
        "Kohinoor Finishers",
        "Metro Civil Works",
      ]),
      dependency: ai === 0 ? "—" : `${pi + 1}.${ai}`,
      progress,
      status:
        progress >= 100
          ? "Completed"
          : progress <= 0
            ? "Not Started"
            : rnd() < 0.2
              ? "Delayed"
              : "In Progress",
    };
  }),
);

export const contractors: Contractor[] = [
  {
    id: "ct1",
    name: "Shivam Constructions",
    trade: "Civil & RCC",
    city: "Pune",
    activeWorkOrders: 8,
    workValue: 486000000,
    billedValue: 312000000,
    paidValue: 268000000,
    performance: 92,
  },
  {
    id: "ct2",
    name: "Sai Labour Contractors",
    trade: "Masonry & Plaster",
    city: "Nashik",
    activeWorkOrders: 6,
    workValue: 148000000,
    billedValue: 96400000,
    paidValue: 88200000,
    performance: 86,
  },
  {
    id: "ct3",
    name: "Kohinoor Finishers",
    trade: "Finishing & Painting",
    city: "Mumbai",
    activeWorkOrders: 5,
    workValue: 212000000,
    billedValue: 118000000,
    paidValue: 92600000,
    performance: 79,
  },
  {
    id: "ct4",
    name: "Metro Civil Works",
    trade: "Infrastructure",
    city: "Nashik",
    activeWorkOrders: 4,
    workValue: 324000000,
    billedValue: 186000000,
    paidValue: 174000000,
    performance: 88,
  },
  {
    id: "ct5",
    name: "Aqua MEP Services",
    trade: "Plumbing & MEP",
    city: "Pune",
    activeWorkOrders: 7,
    workValue: 168000000,
    billedValue: 74800000,
    paidValue: 61200000,
    performance: 84,
  },
];

export const workOrders: WorkOrder[] = Array.from({ length: 22 }, (_, i) => {
  const p = pick(projects);
  const c = pick(contractors);
  const w = pick(boqWorks);
  const quantity = between(400, 6000, 10);
  return {
    id: `wo-${i + 1}`,
    woNo: `WO/26-27/${String(120 + i)}`,
    date: isoDate(-between(20, 300)),
    contractor: c.name,
    project: p.name,
    work: w.work,
    boqRef: `BOQ-1.${String(between(1, 14)).padStart(2, "0")}`,
    quantity,
    unit: w.unit,
    rate: w.rate,
    amount: quantity * w.rate,
    startDate: isoDate(-between(10, 260)),
    completionDate: isoDate(between(-30, 180)),
    progress: between(5, 100, 5),
    status: pick(["Approved", "Approved", "Pending", "Draft"] as ApprovalStatus[]),
  };
});

export const dprs: Dpr[] = Array.from({ length: 24 }, (_, i) => {
  const p = pick(projects);
  return {
    id: `dpr-${i + 1}`,
    dprNo: `DPR/26-27/${String(2810 + i)}`,
    date: isoDate(-i),
    project: p.name,
    site: pick(p.sites),
    weather: pick(["Clear", "Cloudy", "Light Rain", "Heavy Rain", "Humid"]),
    activities: [
      {
        activity: "Slab shuttering",
        plannedQty: between(200, 600, 10),
        actualQty: between(150, 580, 10),
        unit: "Sqm",
      },
      {
        activity: "Reinforcement binding",
        plannedQty: between(4, 14),
        actualQty: between(3, 13),
        unit: "MT",
      },
      {
        activity: "Concrete pour M30",
        plannedQty: between(40, 180, 5),
        actualQty: between(30, 175, 5),
        unit: "Cum",
      },
      {
        activity: "Blockwork",
        plannedQty: between(120, 420, 10),
        actualQty: between(100, 400, 10),
        unit: "Sqm",
      },
    ],
    labour: { skilled: between(28, 96), unskilled: between(40, 180), supervisors: between(3, 9) },
    machinery: ["Tower Crane", "Concrete Pump", "Batching Plant", "JCB 3DX"].slice(
      0,
      between(2, 4),
    ),
    materials: [
      { item: "OPC 53 Grade Cement", quantity: between(80, 420, 10), unit: "Bag" },
      { item: "TMT Steel Fe500D 12mm", quantity: between(2, 12), unit: "MT" },
      { item: "River Sand", quantity: between(2, 9), unit: "Brass" },
    ],
    progress: between(40, 98),
    issues: pick([
      "Concrete pump breakdown for 2 hours.",
      "Steel delivery delayed by supplier.",
      "Rain stoppage in afternoon shift.",
      "No major issues reported.",
    ]),
    safety: pick([
      "Toolbox talk conducted, all PPE compliant.",
      "One near-miss at material hoist, corrective action taken.",
      "Edge protection installed on level 8.",
    ]),
    remarks: "Work progressing as per revised schedule.",
    submittedBy: pick(people),
    status: pick(["Approved", "Pending", "Approved"] as ApprovalStatus[]),
  };
});

export const contractorBills: ContractorBill[] = Array.from({ length: 26 }, (_, i) => {
  const wo = pick(workOrders);
  const quantity = between(80, 1800, 10);
  const gross = Math.round(quantity * wo.rate * 0.4);
  const retention = Math.round(gross * 0.05);
  const tds = Math.round(gross * 0.01);
  const other = Math.round(gross * 0.012);
  return {
    id: `cb-${i + 1}`,
    billNo: `WB/26-27/${String(510 + i)}`,
    date: isoDate(-between(1, 80)),
    contractor: wo.contractor,
    project: wo.project,
    workOrder: wo.woNo,
    measurement: `MB Page ${between(12, 240)}`,
    quantity,
    rate: wo.rate,
    gross,
    retention,
    tds,
    otherDeductions: other,
    net: gross - retention - tds - other,
    status: pick(["Approved", "Pending", "Sent Back", "Approved"] as ApprovalStatus[]),
    paymentStatus: pick(["Paid", "Unpaid", "Partially Paid"] as ContractorBill["paymentStatus"][]),
  };
});

/* ------------------------------ CRM & Sales ------------------------------ */

const leadSources = ["Website", "Referral", "Broker", "Walk-in", "Advertisement", "Campaign"];
const firstNames = [
  "Aarav",
  "Priya",
  "Rohan",
  "Sneha",
  "Vikram",
  "Anita",
  "Karan",
  "Meera",
  "Nikhil",
  "Divya",
  "Sameer",
  "Kavita",
];
const lastNames = [
  "Sharma",
  "Patil",
  "Iyer",
  "Mehta",
  "Kapoor",
  "Joshi",
  "Nair",
  "Gupta",
  "Shah",
  "Reddy",
];

export const leads: Lead[] = Array.from({ length: 42 }, (_, i) => {
  const p = pick(projects.slice(0, 4));
  return {
    id: `ld-${i + 1}`,
    leadNo: `LD/26-27/${String(3120 + i)}`,
    name: `${pick(firstNames)} ${pick(lastNames)}`,
    contact: `+91 ${between(70, 99)}${between(10000000, 99999999)}`,
    email: `lead${i + 1}@example.com`,
    source: pick(leadSources),
    projectInterest: p.name,
    unitInterest: pick(["2 BHK", "3 BHK", "3.5 BHK", "4 BHK", "Retail Shop", "Office Suite"]),
    budget: between(4500000, 26000000, 100000),
    assignedTo: pick(["Sneha Bhosale", "Pooja Mehta", "Rahul Chavan", "Kiran Waghmare"]),
    status: pick([
      "New",
      "Contacted",
      "Qualified",
      "Site Visit",
      "Negotiation",
      "Won",
      "Lost",
    ] as Lead["status"][]),
    priority: pick(priorities),
    nextFollowUp: isoDate(between(-6, 14)),
    createdAt: isoDate(-between(1, 90)),
  };
});

export const units: Unit[] = projects.slice(0, 4).flatMap((p, pi) => {
  const towers = p.type === "Commercial" ? ["Block A", "Block B"] : ["Tower A", "Tower B"];
  return towers.flatMap((tower) =>
    Array.from({ length: 18 }, (_, i) => {
      const floor = Math.floor(i / 3) + 1;
      const unitType =
        p.type === "Commercial"
          ? pick(["Retail Shop", "Office Suite", "Showroom"])
          : pick(["2 BHK", "3 BHK", "3.5 BHK", "4 BHK"]);
      const carpetArea = between(620, 1980, 5);
      const basePrice = Math.round(carpetArea * between(7200, 12800, 50));
      const otherCharges = Math.round(basePrice * 0.08);
      const status = pick([
        "Available",
        "Available",
        "Booked",
        "Sold",
        "Hold",
        "Available",
        "Cancelled",
      ] as Unit["status"][]);
      return {
        id: `u-${pi}-${tower}-${i}`,
        project: p.name,
        tower,
        floor,
        unitNo: `${tower.split(" ")[1] ?? "A"}-${floor}0${(i % 3) + 1}`,
        unitType,
        carpetArea,
        saleableArea: Math.round(carpetArea * 1.32),
        basePrice,
        otherCharges,
        totalPrice: basePrice + otherCharges,
        status,
        customer:
          status === "Booked" || status === "Sold"
            ? `${pick(firstNames)} ${pick(lastNames)}`
            : undefined,
      };
    }),
  );
});

export const customers: Customer[] = Array.from({ length: 32 }, (_, i) => {
  const u = pick(units.filter((x) => x.status === "Booked" || x.status === "Sold"));
  const agreementValue = u?.totalPrice ?? between(5200000, 22000000, 100000);
  const received = Math.round(agreementValue * (0.15 + rnd() * 0.8));
  return {
    id: `cu-${i + 1}`,
    customerNo: `CUST/26-27/${String(1180 + i)}`,
    name: `${pick(firstNames)} ${pick(lastNames)}`,
    contact: `+91 ${between(70, 99)}${between(10000000, 99999999)}`,
    email: `customer${i + 1}@example.com`,
    city: pick(["Pune", "Mumbai", "Nashik", "Ahmedabad", "Vadodara", "Nagpur"]),
    project: u?.project ?? pick(projectNames),
    unit: u?.unitNo ?? "A-401",
    agreementValue,
    received,
    outstanding: agreementValue - received,
    bookingDate: isoDate(-between(20, 500)),
    status: pick(["Booked", "Agreement Done", "Possession", "Booked"] as Customer["status"][]),
  };
});

export const paymentSchedule: PaymentMilestone[] = customers.slice(0, 14).flatMap((c, ci) =>
  [
    "Booking Amount",
    "On Agreement",
    "On Plinth Completion",
    "On 5th Slab",
    "On 10th Slab",
    "On Brickwork",
    "On Flooring",
    "On Possession",
  ].map((milestone, mi) => {
    const amount = Math.round(c.agreementValue * [0.1, 0.15, 0.15, 0.1, 0.1, 0.15, 0.15, 0.1][mi]!);
    const dueDate = isoDate(-360 + ci * 6 + mi * 55);
    const paid = dueDate < isoDate(-30) ? (rnd() < 0.82 ? amount : Math.round(amount * 0.4)) : 0;
    const overdue = paid < amount && dueDate < isoDate(0);
    return {
      id: `pm-${ci}-${mi}`,
      customer: c.name,
      unit: `${c.project} / ${c.unit}`,
      milestone,
      dueDate,
      amount,
      paid,
      status:
        paid >= amount ? "Paid" : overdue ? "Overdue" : dueDate < isoDate(30) ? "Due" : "Upcoming",
      interest: overdue ? Math.round((amount - paid) * 0.18 * (between(20, 180) / 365)) : 0,
    };
  }),
);

export const brokerage = Array.from({ length: 16 }, (_, i) => {
  const c = pick(customers);
  const broker = pick([
    "Prime Realty Advisors",
    "Homes & Beyond",
    "Metro Property Hub",
    "Shubham Estates",
  ]);
  const percent = between(1, 2);
  return {
    id: `br-${i + 1}`,
    broker,
    customer: c.name,
    unit: c.unit,
    project: c.project,
    bookingDate: c.bookingDate,
    bookingValue: c.agreementValue,
    percent,
    amount: Math.round((c.agreementValue * percent) / 100),
    paymentStatus: pick(["Paid", "Pending", "Partially Paid"]),
  };
});

export const brokerPerformance = [
  {
    broker: "Prime Realty Advisors",
    leads: 68,
    bookings: 14,
    salesValue: 218000000,
    brokerage: 3270000,
    conversion: 20.6,
  },
  {
    broker: "Homes & Beyond",
    leads: 52,
    bookings: 9,
    salesValue: 142000000,
    brokerage: 2130000,
    conversion: 17.3,
  },
  {
    broker: "Metro Property Hub",
    leads: 44,
    bookings: 11,
    salesValue: 176000000,
    brokerage: 2640000,
    conversion: 25,
  },
  {
    broker: "Shubham Estates",
    leads: 31,
    bookings: 5,
    salesValue: 78000000,
    brokerage: 1170000,
    conversion: 16.1,
  },
];

export const followUps: FollowUp[] = Array.from({ length: 28 }, (_, i) => {
  const isLead = rnd() < 0.6;
  const entity = isLead ? pick(leads).name : pick(customers).name;
  const date = isoDate(-between(0, 20));
  return {
    id: `fu-${i + 1}`,
    entity,
    entityType: isLead ? "Lead" : "Customer",
    date,
    type: pick(["Call", "Email", "Site Visit", "Meeting", "WhatsApp"] as FollowUp["type"][]),
    assignedTo: pick(["Sneha Bhosale", "Pooja Mehta", "Rahul Chavan", "Kiran Waghmare"]),
    outcome: pick([
      "Interested, wants floor plan",
      "Asked for payment plan",
      "Site visit scheduled",
      "Budget mismatch",
      "Will confirm after family discussion",
    ]),
    nextFollowUp: isoDate(between(-4, 12)),
    status: pick(["Completed", "Pending", "Overdue"] as FollowUp["status"][]),
  };
});

export const appointments = Array.from({ length: 18 }, (_, i) => ({
  id: `ap-${i + 1}`,
  customer: pick(leads).name,
  salesperson: pick(["Sneha Bhosale", "Pooja Mehta", "Rahul Chavan"]),
  datetime: `${isoDate(between(-5, 10))} ${between(9, 18)}:${pick(["00", "30"])}`,
  location: pick([
    "Green Valley Sales Gallery",
    "Skyline Site Office",
    "Corporate Office, Pune",
    "Riverfront Site",
  ]),
  purpose: pick(["Site Visit", "Price Discussion", "Agreement Signing", "Document Handover"]),
  status: pick(["Scheduled", "Completed", "Missed", "Rescheduled"]),
}));

export const tasks = Array.from({ length: 22 }, (_, i) => ({
  id: `tk-${i + 1}`,
  title: pick([
    "Follow up on pending indent approval",
    "Share revised BOQ with client",
    "Collect GST invoice from supplier",
    "Verify contractor measurement sheet",
    "Prepare monthly MIS pack",
    "Send payment reminder to defaulters",
    "Reconcile bank statement",
  ]),
  assignedTo: pick(people),
  dueDate: isoDate(between(-6, 12)),
  priority: pick(priorities),
  status: pick(["Open", "In Progress", "Completed", "Overdue"]),
  related: pick([...projectNames, ...suppliers.map((s) => s.name)]),
}));

/* ------------------------------- Accounting ------------------------------- */

export const chartOfAccounts = [
  {
    group: "Assets",
    accounts: [
      "Cash in Hand",
      "HDFC Bank — Current 4021",
      "ICICI Bank — Project Escrow",
      "Inventory — Site Stores",
      "Work in Progress",
      "Fixed Assets — Plant & Machinery",
      "Sundry Debtors",
    ],
  },
  {
    group: "Liabilities",
    accounts: [
      "Sundry Creditors",
      "Retention Payable",
      "TDS Payable",
      "GST Payable",
      "Secured Loans — Project Finance",
      "Customer Advances",
    ],
  },
  { group: "Income", accounts: ["Sale of Units", "Other Income", "Interest on Delayed Payment"] },
  {
    group: "Expenses",
    accounts: [
      "Material Consumption",
      "Labour & Subcontract",
      "Site Overheads",
      "Salaries & Wages",
      "Finance Cost",
      "Administrative Expenses",
    ],
  },
  {
    group: "Capital",
    accounts: ["Share Capital", "Reserves & Surplus", "Partner Current Account"],
  },
];

export const ledgerEntries: LedgerEntry[] = Array.from({ length: 48 }, (_, i) => {
  const type = pick([
    "Payment",
    "Receipt",
    "Journal",
    "Contra",
    "Debit Note",
    "Credit Note",
  ] as LedgerEntry["voucherType"][]);
  const amount = between(120000, 18000000, 1000);
  const isDebit = rnd() < 0.5;
  return {
    id: `le-${i + 1}`,
    date: isoDate(-between(0, 120)),
    voucherNo: `${type.slice(0, 3).toUpperCase()}/26-27/${String(410 + i)}`,
    voucherType: type,
    account: pick(chartOfAccounts.flatMap((g) => g.accounts)),
    narration: pick([
      "Material purchase settlement",
      "Customer collection against milestone",
      "Contractor RA bill payment",
      "Bank transfer between accounts",
      "TDS deduction on contractor bill",
      "GST input credit adjustment",
    ]),
    debit: isDebit ? amount : 0,
    credit: isDebit ? 0 : amount,
    project: pick(projectNames),
  };
});

export const receivables: Receivable[] = customers.slice(0, 22).map((c, i) => {
  const outstanding = Math.max(0, c.outstanding);
  return {
    id: `ar-${i + 1}`,
    party: c.name,
    invoiceNo: `INV/26-27/${String(2040 + i)}`,
    date: isoDate(-between(10, 200)),
    dueDate: isoDate(between(-120, 30)),
    amount: c.agreementValue,
    paid: c.received,
    outstanding,
    ageingBucket: pick(["0-30", "31-60", "61-90", "90+"] as Receivable["ageingBucket"][]),
    project: c.project,
  };
});

export const payables: Receivable[] = purchaseBills.map((b, i) => ({
  id: `ap-${i + 1}`,
  party: b.supplier,
  invoiceNo: b.billNo,
  date: b.date,
  dueDate: b.dueDate,
  amount: b.total,
  paid: b.paid,
  outstanding: b.total - b.paid,
  ageingBucket: pick(["0-30", "31-60", "61-90", "90+"] as Receivable["ageingBucket"][]),
  project: pick(projectNames),
}));

export const fixedAssets = [
  {
    id: "fa1",
    asset: "Tower Crane — Potain MC 175",
    category: "Plant & Machinery",
    purchaseDate: "2024-03-18",
    cost: 28400000,
    depreciation: 6820000,
    wdv: 21580000,
  },
  {
    id: "fa2",
    asset: "Batching Plant 30 Cum/hr",
    category: "Plant & Machinery",
    purchaseDate: "2023-11-02",
    cost: 19600000,
    depreciation: 7240000,
    wdv: 12360000,
  },
  {
    id: "fa3",
    asset: "JCB 3DX Backhoe Loader",
    category: "Vehicles",
    purchaseDate: "2025-01-24",
    cost: 4260000,
    depreciation: 682000,
    wdv: 3578000,
  },
  {
    id: "fa4",
    asset: "Site Office Cabins (12 Nos)",
    category: "Site Infrastructure",
    purchaseDate: "2024-07-11",
    cost: 2180000,
    depreciation: 546000,
    wdv: 1634000,
  },
  {
    id: "fa5",
    asset: "Concrete Pump — Schwing",
    category: "Plant & Machinery",
    purchaseDate: "2024-09-30",
    cost: 8900000,
    depreciation: 1968000,
    wdv: 6932000,
  },
  {
    id: "fa6",
    asset: "Survey Equipment — Total Station",
    category: "Equipment",
    purchaseDate: "2025-06-06",
    cost: 940000,
    depreciation: 128000,
    wdv: 812000,
  },
];

export const gstRegister = Array.from({ length: 18 }, (_, i) => {
  const taxable = between(480000, 14000000, 1000);
  return {
    id: `gst-${i + 1}`,
    period: pick(["Aug 2026", "Jul 2026", "Jun 2026"]),
    party: pick([...suppliers.map((s) => s.name), ...customers.slice(0, 6).map((c) => c.name)]),
    gstin: `27AA${String(between(1000, 9999))}Z${between(1, 9)}Z${between(1, 9)}`,
    type: pick(["Input", "Output"]),
    invoiceNo: `GST/${String(3300 + i)}`,
    taxable,
    cgst: Math.round(taxable * 0.09),
    sgst: Math.round(taxable * 0.09),
    total: Math.round(taxable * 1.18),
  };
});

export const tdsRegister = Array.from({ length: 16 }, (_, i) => {
  const amount = between(280000, 9800000, 1000);
  const section = pick(["194C", "194C", "194J", "194I", "194Q"]);
  const rate = section === "194C" ? 1 : section === "194J" ? 10 : section === "194I" ? 10 : 0.1;
  return {
    id: `tds-${i + 1}`,
    party: pick([...contractors.map((c) => c.name), ...suppliers.map((s) => s.name)]),
    pan: `AABC${String(between(1000, 9999))}K`,
    section,
    rate,
    amount,
    tds: Math.round((amount * rate) / 100),
    status: pick(["Deducted", "Paid", "Payable"]),
    quarter: pick(["Q1 FY26-27", "Q2 FY26-27"]),
  };
});

export const bankReconciliation = Array.from({ length: 16 }, (_, i) => ({
  id: `brl-${i + 1}`,
  date: isoDate(-between(0, 45)),
  particulars: pick([
    "NEFT — Shivam Constructions",
    "RTGS — Maharashtra Steel Traders",
    "Customer collection — Cheque 442019",
    "Bank charges",
    "Salary transfer batch",
    "GST payment",
  ]),
  bookAmount: between(80000, 12000000, 1000),
  bankAmount: between(80000, 12000000, 1000),
  status: pick(["Matched", "Matched", "Unmatched"]),
}));

export const trialBalance = chartOfAccounts.flatMap((g) =>
  g.accounts.map((a, i) => {
    const debit =
      g.group === "Assets" || g.group === "Expenses" ? between(1200000, 480000000, 1000) : 0;
    const credit = debit === 0 ? between(1200000, 480000000, 1000) : 0;
    return { id: `tb-${g.group}-${i}`, group: g.group, account: a, debit, credit };
  }),
);

/* -------------------------------- Payroll -------------------------------- */

export const employees: MockEmployee[] = Array.from({ length: 34 }, (_, i) => ({
  id: `emp-${i + 1}`,
  empId: `EMP${String(1040 + i)}`,
  name: `${pick(firstNames)} ${pick(lastNames)}`,
  department: pick([
    "Projects",
    "Procurement",
    "Stores",
    "Accounts",
    "Sales & CRM",
    "HR & Admin",
    "Planning",
    "Safety",
  ]),
  designation: pick([
    "Site Engineer",
    "Senior Engineer",
    "Project Manager",
    "Purchase Officer",
    "Store Keeper",
    "Accountant",
    "Sales Executive",
    "HR Executive",
    "Planning Engineer",
    "Safety Officer",
  ]),
  joiningDate: isoDate(-between(120, 2400)),
  location: pick([
    "Pune HO",
    "Green Valley Site",
    "Skyline Site",
    "Riverfront Site",
    "Nashik Site",
  ]),
  grossSalary: between(32000, 185000, 500),
  status: pick(["Active", "Active", "Active", "On Leave"] as MockEmployee["status"][]),
}));

export const attendance = employees.slice(0, 20).map((e, i) => ({
  id: `att-${i + 1}`,
  empId: e.empId,
  name: e.name,
  department: e.department,
  present: between(20, 26),
  absent: between(0, 3),
  leave: between(0, 3),
  halfDay: between(0, 2),
  overtimeHours: between(0, 26),
}));

export const leaveRequests = employees.slice(0, 14).map((e, i) => ({
  id: `lv-${i + 1}`,
  empId: e.empId,
  name: e.name,
  type: pick(["Casual Leave", "Sick Leave", "Earned Leave", "Comp Off"]),
  from: isoDate(between(-20, 8)),
  to: isoDate(between(-18, 12)),
  days: between(1, 6),
  balance: between(2, 18),
  status: pick(["Pending", "Approved", "Rejected"]),
  approver: pick(["Reporting Manager", "HR"]),
}));

export const payrollRuns = employees.slice(0, 22).map((e, i) => {
  const basic = Math.round(e.grossSalary * 0.5);
  const hra = Math.round(e.grossSalary * 0.2);
  const allowances = e.grossSalary - basic - hra;
  const pf = Math.round(basic * 0.12);
  const esic = e.grossSalary < 21000 ? Math.round(e.grossSalary * 0.0075) : 0;
  const pt = 200;
  const tds = Math.round(e.grossSalary * 0.06);
  return {
    id: `pr-${i + 1}`,
    empId: e.empId,
    name: e.name,
    department: e.department,
    month: "August 2026",
    basic,
    hra,
    allowances,
    overtime: between(0, 12000, 500),
    gross: e.grossSalary,
    pf,
    esic,
    pt,
    tds,
    loan: pick([0, 0, 5000, 12000]),
    net: e.grossSalary - pf - esic - pt - tds,
  };
});

/* ------------------------- Approvals, activity, docs ------------------------- */

export const approvalTasks: ApprovalTask[] = [
  ...indents
    .filter((i) => i.status === "Pending")
    .slice(0, 6)
    .map((i, n) => ({
      id: `at-i-${n}`,
      document: "Indent",
      docNo: i.indentNo,
      project: i.project,
      raisedBy: i.requestedBy,
      date: i.date,
      amount: i.value,
      level: i.level,
      priority: i.priority,
      status: "Pending" as ApprovalStatus,
    })),
  ...purchaseOrders
    .filter((p) => p.status === "Pending")
    .slice(0, 5)
    .map((p, n) => ({
      id: `at-p-${n}`,
      document: "Purchase Order",
      docNo: p.poNo,
      project: p.project,
      raisedBy: pick(people),
      date: p.date,
      amount: p.total,
      level: pick(["Manager", "Finance", "Final Approval"]),
      priority: pick(priorities),
      status: "Pending" as ApprovalStatus,
    })),
  ...contractorBills
    .filter((b) => b.status === "Pending")
    .slice(0, 5)
    .map((b, n) => ({
      id: `at-b-${n}`,
      document: "Contractor Bill",
      docNo: b.billNo,
      project: b.project,
      raisedBy: pick(people),
      date: b.date,
      amount: b.net,
      level: pick(["Site Engineer", "Project Manager", "Accounts"]),
      priority: pick(priorities),
      status: "Pending" as ApprovalStatus,
    })),
  ...grns
    .filter((g) => g.status === "Pending")
    .slice(0, 4)
    .map((g, n) => ({
      id: `at-g-${n}`,
      document: "GRN",
      docNo: g.grnNo,
      project: pick(projectNames),
      raisedBy: pick(people),
      date: g.date,
      amount: between(240000, 4800000, 1000),
      level: pick(["Store", "Manager"]),
      priority: pick(priorities),
      status: "Pending" as ApprovalStatus,
    })),
];

export const activityFeed: ActivityEvent[] = [
  {
    id: "a1",
    actor: "Rohit Deshmukh",
    action: "approved Indent",
    target: "IND/26-27/1058",
    module: "Procurement",
    time: "12 min ago",
  },
  {
    id: "a2",
    actor: "Sneha Bhosale",
    action: "booked unit",
    target: "Green Valley / A-1103",
    module: "Sales",
    time: "38 min ago",
  },
  {
    id: "a3",
    actor: "Kiran Waghmare",
    action: "posted GRN against",
    target: "PO/26-27/2224",
    module: "Stores",
    time: "1 hr ago",
  },
  {
    id: "a4",
    actor: "Amit Kulkarni",
    action: "submitted DPR for",
    target: "Skyline Heights — Tower 1",
    module: "Construction",
    time: "2 hrs ago",
  },
  {
    id: "a5",
    actor: "Pooja Mehta",
    action: "converted lead",
    target: "LD/26-27/3141",
    module: "CRM",
    time: "3 hrs ago",
  },
  {
    id: "a6",
    actor: "Ganesh Pawar",
    action: "issued material to",
    target: "Shivam Constructions",
    module: "Stores",
    time: "4 hrs ago",
  },
  {
    id: "a7",
    actor: "Rahul Chavan",
    action: "recorded collection of ₹42.5 L from",
    target: "Aarav Sharma",
    module: "Accounts",
    time: "5 hrs ago",
  },
  {
    id: "a8",
    actor: "Nilesh Patel",
    action: "certified contractor bill",
    target: "WB/26-27/0522",
    module: "Construction",
    time: "6 hrs ago",
  },
];

export const notifications: NotificationItem[] = [
  {
    id: "n1",
    title: "13 approvals pending",
    detail: "Indents, POs and contractor bills awaiting your action",
    type: "approval",
    time: "Just now",
    unread: true,
  },
  {
    id: "n2",
    title: "Low stock: OPC 53 Cement",
    detail: "Green Valley — Tower A store below reorder level",
    type: "stock",
    time: "22 min ago",
    unread: true,
  },
  {
    id: "n3",
    title: "Payment due today",
    detail: "Maharashtra Steel Traders — ₹38.4 L",
    type: "payment",
    time: "1 hr ago",
    unread: true,
  },
  {
    id: "n4",
    title: "Overdue customer payment",
    detail: "6 defaulters crossed 30 days",
    type: "payment",
    time: "2 hrs ago",
    unread: false,
  },
  {
    id: "n5",
    title: "Activity delayed",
    detail: "Skyline Heights — internal plaster slipped 9 days",
    type: "project",
    time: "4 hrs ago",
    unread: false,
  },
  {
    id: "n6",
    title: "New lead assigned",
    detail: "Website enquiry for 3 BHK, Riverfront Towers",
    type: "lead",
    time: "5 hrs ago",
    unread: false,
  },
];

export const documents: DocumentFile[] = [
  {
    id: "d1",
    name: "GVR-Structural-Drawings-Rev4.pdf",
    type: "Drawing",
    size: "8.4 MB",
    version: "v4",
    uploadedBy: "Rohit Deshmukh",
    uploadedAt: "2026-08-28",
    linkedTo: "Green Valley Residency",
  },
  {
    id: "d2",
    name: "PO-2224-Signed.pdf",
    type: "Purchase Order",
    size: "412 KB",
    version: "v1",
    uploadedBy: "Kiran Waghmare",
    uploadedAt: "2026-09-02",
    linkedTo: "PO/26-27/2224",
  },
  {
    id: "d3",
    name: "Contractor-Agreement-Shivam.pdf",
    type: "Agreement",
    size: "1.2 MB",
    version: "v2",
    uploadedBy: "Pooja Mehta",
    uploadedAt: "2026-07-19",
    linkedTo: "Shivam Constructions",
  },
  {
    id: "d4",
    name: "DPR-Photos-10Sep.zip",
    type: "Site Photos",
    size: "22.6 MB",
    version: "v1",
    uploadedBy: "Amit Kulkarni",
    uploadedAt: "2026-09-10",
    linkedTo: "DPR/26-27/2810",
  },
  {
    id: "d5",
    name: "Booking-Form-A1103.pdf",
    type: "Booking",
    size: "680 KB",
    version: "v1",
    uploadedBy: "Sneha Bhosale",
    uploadedAt: "2026-09-09",
    linkedTo: "Green Valley / A-1103",
  },
  {
    id: "d6",
    name: "GST-Return-Aug2026.xlsx",
    type: "Statutory",
    size: "340 KB",
    version: "v1",
    uploadedBy: "Rahul Chavan",
    uploadedAt: "2026-09-08",
    linkedTo: "Buildcore Infra Pvt Ltd",
  },
];

export const auditLogs = Array.from({ length: 24 }, (_, i) => ({
  id: `al-${i + 1}`,
  user: pick(people),
  action: pick(["Created", "Updated", "Approved", "Deleted", "Exported", "Rejected"]),
  module: pick([
    "Procurement",
    "Stores",
    "Construction",
    "Sales",
    "CRM",
    "Accounts",
    "Payroll",
    "Admin",
  ]),
  record: pick([
    "IND/26-27/1051",
    "PO/26-27/2218",
    "GRN/26-27/1533",
    "WB/26-27/0514",
    "Unit A-1103",
    "EMP1048",
  ]),
  timestamp: `${isoDate(-between(0, 20))} ${between(9, 20)}:${pick(["05", "18", "32", "47"])}`,
  oldValue: pick(["Pending", "₹12,40,000", "Draft", "—"]),
  newValue: pick(["Approved", "₹13,10,000", "Pending", "Booked"]),
}));

export const usersList = [
  {
    id: "us1",
    name: "Sanket Ganjegaonkar",
    username: "admin",
    role: "Director",
    email: "admin@buildcore.in",
    branch: "Pune HO",
    status: "Active",
    lastLogin: "2026-09-10 09:42",
  },
  {
    id: "us2",
    name: "Rohit Deshmukh",
    username: "rohit.d",
    role: "Project Manager",
    email: "rohit@buildcore.in",
    branch: "Green Valley Site",
    status: "Active",
    lastLogin: "2026-09-10 08:15",
  },
  {
    id: "us3",
    name: "Kiran Waghmare",
    username: "kiran.w",
    role: "Purchase Head",
    email: "kiran@buildcore.in",
    branch: "Pune HO",
    status: "Active",
    lastLogin: "2026-09-09 18:03",
  },
  {
    id: "us4",
    name: "Ganesh Pawar",
    username: "ganesh.p",
    role: "Store Manager",
    email: "ganesh@buildcore.in",
    branch: "Skyline Site",
    status: "Active",
    lastLogin: "2026-09-10 07:55",
  },
  {
    id: "us5",
    name: "Rahul Chavan",
    username: "rahul.c",
    role: "Accounts Manager",
    email: "rahul@buildcore.in",
    branch: "Pune HO",
    status: "Active",
    lastLogin: "2026-09-09 20:11",
  },
  {
    id: "us6",
    name: "Sneha Bhosale",
    username: "sneha.b",
    role: "Sales Executive",
    email: "sneha@buildcore.in",
    branch: "Pune HO",
    status: "Inactive",
    lastLogin: "2026-08-30 16:20",
  },
];

export const roles = [
  {
    id: "r1",
    name: "Director",
    users: 2,
    modules: "All modules",
    approval: "Final Approval",
    description: "Full access with company-wide MIS visibility",
  },
  {
    id: "r2",
    name: "Project Manager",
    users: 6,
    modules: "Projects, Construction, Stores, Procurement",
    approval: "Level 2",
    description: "Site execution, DPR and contractor certification",
  },
  {
    id: "r3",
    name: "Purchase Head",
    users: 3,
    modules: "Procurement, Vendors, Reports",
    approval: "Level 2",
    description: "Enquiry to PO cycle and vendor negotiation",
  },
  {
    id: "r4",
    name: "Store Manager",
    users: 8,
    modules: "Stores & Inventory",
    approval: "Level 1",
    description: "GRN, issue, receipt and physical stock",
  },
  {
    id: "r5",
    name: "Accounts Manager",
    users: 4,
    modules: "Accounting, Payroll, Reports",
    approval: "Level 2",
    description: "Vouchers, AR/AP, GST and TDS",
  },
  {
    id: "r6",
    name: "Sales Executive",
    users: 11,
    modules: "CRM, Sales",
    approval: "None",
    description: "Leads, follow-ups and bookings",
  },
];

export const permissionMatrix = [
  "Dashboard",
  "Projects",
  "Procurement",
  "Stores & Inventory",
  "Construction",
  "Sales & CRM",
  "Accounting",
  "Payroll & HR",
  "Reports",
  "Administration",
].map((module, i) => ({
  module,
  view: true,
  create: i % 4 !== 3,
  edit: i % 3 !== 2,
  delete: i % 5 === 0,
  approve: i % 2 === 0,
  export: true,
  print: true,
}));

export const numberSeries = [
  {
    id: "ns1",
    document: "Indent",
    prefix: "IND/26-27/",
    start: 1001,
    current: 1074,
    resetOn: "Financial Year",
  },
  {
    id: "ns2",
    document: "Purchase Order",
    prefix: "PO/26-27/",
    start: 2201,
    current: 2242,
    resetOn: "Financial Year",
  },
  {
    id: "ns3",
    document: "GRN",
    prefix: "GRN/26-27/",
    start: 1501,
    current: 1548,
    resetOn: "Financial Year",
  },
  {
    id: "ns4",
    document: "Stock Issue",
    prefix: "SI/26-27/",
    start: 401,
    current: 476,
    resetOn: "Financial Year",
  },
  {
    id: "ns5",
    document: "Work Bill",
    prefix: "WB/26-27/",
    start: 501,
    current: 536,
    resetOn: "Financial Year",
  },
  {
    id: "ns6",
    document: "Receipt Voucher",
    prefix: "RCP/26-27/",
    start: 401,
    current: 458,
    resetOn: "Financial Year",
  },
];

export const workflowConfig = [
  {
    id: "wf1",
    document: "Indent",
    levels: ["Site Engineer", "Project Manager", "Purchase Head"],
    condition: "Value > ₹1,00,000",
    escalation: "48 hrs",
    active: true,
  },
  {
    id: "wf2",
    document: "Purchase Order",
    levels: ["Purchase Head", "Finance Manager", "Director"],
    condition: "Value > ₹10,00,000",
    escalation: "24 hrs",
    active: true,
  },
  {
    id: "wf3",
    document: "GRN",
    levels: ["Store Manager", "Project Manager"],
    condition: "All GRNs",
    escalation: "24 hrs",
    active: true,
  },
  {
    id: "wf4",
    document: "Contractor Bill",
    levels: ["Site Engineer", "Project Manager", "Accounts"],
    condition: "All bills",
    escalation: "72 hrs",
    active: true,
  },
  {
    id: "wf5",
    document: "Leave Request",
    levels: ["Reporting Manager", "HR"],
    condition: "All requests",
    escalation: "48 hrs",
    active: true,
  },
  {
    id: "wf6",
    document: "Unit Booking Discount",
    levels: ["Sales Head", "Director"],
    condition: "Discount > 3%",
    escalation: "24 hrs",
    active: false,
  },
];

export const branches = [
  {
    id: "b1",
    name: "Pune Head Office",
    city: "Pune",
    state: "Maharashtra",
    gstin: "27AABCB1234C1ZK",
    projects: 3,
    employees: 68,
  },
  {
    id: "b2",
    name: "Mumbai Regional Office",
    city: "Mumbai",
    state: "Maharashtra",
    gstin: "27AABCB1234C2ZJ",
    projects: 1,
    employees: 34,
  },
  {
    id: "b3",
    name: "Ahmedabad Branch",
    city: "Ahmedabad",
    state: "Gujarat",
    gstin: "24AABCB1234C1ZQ",
    projects: 2,
    employees: 27,
  },
];

export const warehouses = projects.flatMap((p) =>
  p.sites.map((s, i) => ({
    id: `wh-${p.id}-${i}`,
    name: `${s} Store`,
    project: p.name,
    location: p.location,
    keeper: pick(people),
    items: between(28, 140),
    value: between(4200000, 78000000, 1000),
  })),
);

/* ------------------------------ Chart series ------------------------------ */

export const monthlySeries = [
  {
    month: "Apr",
    procurement: 186,
    sales: 242,
    collection: 198,
    consumption: 142,
    receivable: 386,
    payable: 264,
  },
  {
    month: "May",
    procurement: 214,
    sales: 268,
    collection: 226,
    consumption: 168,
    receivable: 402,
    payable: 288,
  },
  {
    month: "Jun",
    procurement: 242,
    sales: 214,
    collection: 242,
    consumption: 186,
    receivable: 374,
    payable: 302,
  },
  {
    month: "Jul",
    procurement: 268,
    sales: 306,
    collection: 264,
    consumption: 204,
    receivable: 412,
    payable: 326,
  },
  {
    month: "Aug",
    procurement: 296,
    sales: 342,
    collection: 288,
    consumption: 226,
    receivable: 438,
    payable: 348,
  },
  {
    month: "Sep",
    procurement: 248,
    sales: 318,
    collection: 302,
    consumption: 212,
    receivable: 424,
    payable: 332,
  },
];

export const projectCostSeries = projects.slice(0, 5).map((p) => ({
  project: p.name.split(" ")[0]!,
  budget: Math.round(p.budget / 10000000),
  actual: Math.round(p.actualCost / 10000000),
  revenue: Math.round(p.soldValue / 10000000),
}));

export const consumptionByCategory = [
  { name: "Cement", value: 268 },
  { name: "Steel", value: 412 },
  { name: "Aggregates", value: 148 },
  { name: "Finishes", value: 196 },
  { name: "MEP", value: 132 },
];

export const lowStockItems = stockItems.filter((i) => i.quantity < i.reorderLevel).slice(0, 8);

export const dashboardTotals = {
  totalProjects: projects.length,
  activeProjects: projects.filter((p) => p.status === "In Progress").length,
  avgProgress: Math.round(projects.reduce((s, p) => s + p.progress, 0) / projects.length),
  totalBudget: projects.reduce((s, p) => s + p.budget, 0),
  actualCost: projects.reduce((s, p) => s + p.actualCost, 0),
  procurementValue: purchaseOrders.reduce((s, p) => s + p.total, 0),
  pendingPOs: purchaseOrders.filter((p) => p.status === "Pending").length,
  inventoryValue: stockItems.reduce((s, i) => s + i.value, 0),
  receivables: receivables.reduce((s, r) => s + r.outstanding, 0),
  payables: payables.reduce((s, r) => s + r.outstanding, 0),
  salesValue: projects.reduce((s, p) => s + p.soldValue, 0),
  collection: projects.reduce((s, p) => s + p.collection, 0),
  pendingApprovals: approvalTasks.length,
};
