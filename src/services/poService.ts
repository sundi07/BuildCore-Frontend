import type {
  PurchaseOrder,
  PoStatus,
  PoLineItem,
  PoCommercialTerms,
  PoDeliveryScheduleItem,
  PoAuditTimelineEvent,
  PoDocument,
} from "@/types";
import * as m from "@/mock/data";
import { comparativeService } from "./comparativeService";

const PO_STORAGE_KEY = "buildcore_purchase_orders_v1";

export const baselinePo0001: PurchaseOrder = {
  id: "po-330-001",
  poNo: "PO/26-27/0001",
  date: "2026-09-18",
  status: "Approved",
  poType: "Material",
  currency: "INR",
  deliveryDate: "2026-10-15",
  paymentTerms: "30 days net from receipt of material and verified invoice",
  deliveryTerms: "FOR Site (Main Plot Site, Baner, Pune)",
  warrantyTerms: "12 Months standard manufacturer defect warranty from delivery",
  remarks: "Immediate dispatch required for Tower A foundation RCC casting cycle.",

  // Legacy mappings for backwards compatibility
  supplier: "ABC Cement Suppliers",
  project: "Baner Gateway Signature Suites",
  site: "Main Plot Site",
  itemCount: 3,
  amount: 1850000,
  gst: 333000,
  total: 2183000,
  receivedPct: 0,

  // Traceability references
  sourceComparativeNo: "CS/26-27/001",
  sourceComparativeId: "cs-330-1",
  sourceRFQNumber: "RFQ/26-27/330",
  sourceRFQId: "enq-330",
  sourceIndentNumber: "IND/26-27/1041",
  sourceIndentId: "ind-1",
  projectId: "p9",
  projectName: "Baner Gateway Signature Suites",
  siteId: "site-baner-1",
  siteName: "Main Plot Site",

  // Supplier Information
  supplierId: "ven-1",
  supplierName: "ABC Cement Suppliers",
  supplierCode: "VEN-001",
  contactPerson: "Rajesh Nair",
  phone: "+91 98231 44550",
  email: "sales@abccement.com",
  billingAddress: "Plot No. 42, Bhosari Industrial Area, Pune, Maharashtra 411026",
  gstin: "27AACCA1234M1Z2",
  pan: "AACCA1234M",

  // Financial summary
  basicValue: 1850000,
  discount: 0,
  taxableValue: 1850000,
  cgst: 166500,
  sgst: 166500,
  igst: 0,
  totalGst: 333000,
  otherCharges: 0,
  roundOff: 0,
  grandTotal: 2183000,

  items: [
    {
      id: "poi-1",
      itemCode: "MAT-101",
      itemDescription: "UltraTech/Ambuja OPC 53 Grade conforming to IS 269",
      category: "Cement",
      unit: "Bag",
      approvedQty: 500,
      poQty: 500,
      rate: 420,
      discountPct: 0,
      discountAmount: 0,
      taxableAmount: 210000,
      gstPct: 18,
      cgstAmount: 18900,
      sgstAmount: 18900,
      igstAmount: 0,
      gstAmount: 37800,
      lineTotal: 247800,
      deliveryDate: "2026-09-28",
      deliveryLocation: "Central Site Cement Godown",
      remarks: "Fresh factory batch test certificate conforming to IS 269",
    },
    {
      id: "poi-2",
      itemCode: "MAT-102",
      itemDescription: "Primary producer Tata/Jindal Fe500D TMT Rebars conforming to IS 1786",
      category: "Steel & Rebars",
      unit: "MT",
      approvedQty: 20,
      poQty: 20,
      rate: 62500,
      discountPct: 0,
      discountAmount: 0,
      taxableAmount: 1250000,
      gstPct: 18,
      cgstAmount: 112500,
      sgstAmount: 112500,
      igstAmount: 0,
      gstAmount: 225000,
      lineTotal: 1475000,
      deliveryDate: "2026-10-05",
      deliveryLocation: "Steel Fabrication Yard #1",
      remarks: "12-meter straight lengths with physical and chemical MTC",
    },
    {
      id: "poi-3",
      itemCode: "MAT-103",
      itemDescription: "M30 Grade Ready Mix Concrete with flyash replacement",
      category: "Concrete / RMC",
      unit: "Cum",
      approvedQty: 50,
      poQty: 50,
      rate: 7800,
      discountPct: 0,
      discountAmount: 0,
      taxableAmount: 390000,
      gstPct: 18,
      cgstAmount: 35100,
      sgstAmount: 35100,
      igstAmount: 0,
      gstAmount: 70200,
      lineTotal: 460200,
      deliveryDate: "2026-10-12",
      deliveryLocation: "Tower A Raft Pouring Point",
      remarks: "Pumpable concrete mix with 120±25mm slump and cube test report",
    },
  ],

  commercialTerms: {
    paymentTerms: "30 days net from receipt of material and verified invoice",
    deliveryTerms: "FOR Site (Main Plot Site, Baner, Pune)",
    freight: "Included in quoted unit rates",
    insurance: "Transit insurance covered under supplier open marine policy",
    loadingUnloading: "Unloading at site by buyer; loading at plant by seller",
    taxes: "GST 18% extra as applicable with RERA ITC eligibility",
    warranty: "12 Months standard manufacturer defect warranty from delivery",
    penaltyLd: "0.5% per week of delayed dispatch capped at 5% of PO basic value",
    otherTerms: "Quality test certificates must accompany each consignment",
  },

  deliverySchedule: [
    {
      id: "ds-1",
      itemCode: "MAT-101",
      itemDescription: "OPC 53 Grade Cement (500 Bags)",
      quantity: 500,
      unit: "Bag",
      deliveryDate: "2026-09-28",
      deliveryLocation: "Central Site Cement Godown",
      remarks: "Part 1 of dispatch: 250 bags, Part 2: 250 bags",
    },
    {
      id: "ds-2",
      itemCode: "MAT-102",
      itemDescription: "Fe500D TMT Steel Rebars (20 MT)",
      quantity: 20,
      unit: "MT",
      deliveryDate: "2026-10-05",
      deliveryLocation: "Steel Fabrication Yard #1",
      remarks: "Direct trailer dispatch to site",
    },
    {
      id: "ds-3",
      itemCode: "MAT-103",
      itemDescription: "M30 Grade Ready Mix Concrete (50 Cum)",
      quantity: 50,
      unit: "Cum",
      deliveryDate: "2026-10-12",
      deliveryLocation: "Tower A Raft Pouring Point",
      remarks: "Transit mixer dispatch in continuous rotation",
    },
  ],

  auditTimeline: [
    {
      id: "atl-1",
      stage: "PO Created",
      title: "Purchase Order Initiated",
      description: "Draft generated from approved Comparative Statement CS/26-27/001.",
      timestamp: "17 Sep 2026 11:30 AM",
      user: "Pooja Hegde",
      role: "Purchase Manager",
      status: "completed",
    },
    {
      id: "atl-2",
      stage: "Purchase Head Approval",
      title: "Technical & Commercial Verification",
      description: "Rates verified against approved L1 supplier tender quotation.",
      timestamp: "17 Sep 2026 03:45 PM",
      user: "Rajesh Sharma",
      role: "VP Procurement",
      status: "completed",
    },
    {
      id: "atl-3",
      stage: "Finance Approval",
      title: "Budget & Cashflow Clearance",
      description: "Fund allocation checked against Project Procurement Budget WBS-2.1.",
      timestamp: "18 Sep 2026 10:15 AM",
      user: "Suresh Menon",
      role: "Finance Controller",
      status: "completed",
    },
    {
      id: "atl-4",
      stage: "Final Approval",
      title: "Director Executive Sign-off",
      description: "Final commercial release approved. Order ready for supplier issuance.",
      timestamp: "18 Sep 2026 02:00 PM",
      user: "Vikram Malhotra",
      role: "Director Operations",
      status: "completed",
    },
    {
      id: "atl-5",
      stage: "PO Approved",
      title: "Purchase Order Approved",
      description: "Ready for formal issuance to ABC Cement Suppliers.",
      timestamp: "18 Sep 2026 02:05 PM",
      user: "System",
      role: "Workflow Engine",
      status: "completed",
    },
    {
      id: "atl-6",
      stage: "PO Issued",
      title: "Formal PO Issuance to Supplier",
      description: "PO dispatched with delivery schedule and commercial terms.",
      timestamp: "Pending",
      user: "Purchase Desk",
      role: "Procurement Lead",
      status: "upcoming",
    },
  ],

  documents: [
    {
      id: "doc-po-1",
      name: "BUILDCORE_Purchase_Order_PO-0001_Signed.pdf",
      type: "PDF",
      size: "2.8 MB",
      uploadedAt: "2026-09-18",
      category: "PO PDF",
    },
    {
      id: "doc-po-2",
      name: "Approved_Comparative_Statement_CS-001.pdf",
      type: "PDF",
      size: "1.4 MB",
      uploadedAt: "2026-09-17",
      category: "Quotation",
    },
    {
      id: "doc-po-3",
      name: "ABC_Cement_GST_Certificate_27AACCA1234M1Z2.pdf",
      type: "PDF",
      size: "520 KB",
      uploadedAt: "2026-09-16",
      category: "GST Certificate",
    },
  ],
};

export interface PoFilters {
  search?: string | undefined;
  project?: string | undefined;
  supplier?: string | undefined;
  status?: string | undefined;
  date?: string | undefined;
  poType?: string | undefined;
}

class PoService {
  private memoryPos: PurchaseOrder[] | null = null;

  private loadSaved(): PurchaseOrder[] {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(PO_STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.error("Failed to load POs from localStorage:", e);
    }
    return [];
  }

  private save(pos: PurchaseOrder[]) {
    this.memoryPos = pos;
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(PO_STORAGE_KEY, JSON.stringify(pos));
    } catch (e) {
      console.error("Failed to persist POs to localStorage:", e);
    }
  }

  getPurchaseOrders(filters?: PoFilters): PurchaseOrder[] {
    if (!this.memoryPos) {
      const saved = this.loadSaved();

      // Convert mock data items into rich PO records if not already populated
      const enrichedMockPos: PurchaseOrder[] = m.purchaseOrders.map((legacy, idx) => {
        const basic = legacy.amount || 1200000;
        const totalGst = legacy.gst || Math.round(basic * 0.18);
        const grandTotal = legacy.total || basic + totalGst;
        const cgst = Math.round(totalGst / 2);
        const sgst = totalGst - cgst;
        const poStatus =
          legacy.status === "Pending"
            ? ("Pending Approval" as PoStatus)
            : (legacy.status as PoStatus);

        const itemCount = legacy.itemCount || 3;
        const perItemBasic = Math.round(basic / itemCount);
        const perItemGst = Math.round(totalGst / itemCount);
        const items = Array.from({ length: itemCount }).map((_, i) => ({
          id: `poi-${legacy.id}-${i + 1}`,
          itemCode: `MAT-${100 + ((idx * 3 + i) % 50)}`,
          itemDescription: `High Grade Construction Material Specification #${i + 1}`,
          category: i === 0 ? "Civil & Structural" : i === 1 ? "Steel & Rebars" : "Finishes",
          unit: i === 0 ? "Bags" : i === 1 ? "MT" : "Nos",
          approvedQty: 100 * (i + 1),
          poQty: 100 * (i + 1),
          rate: Math.round(perItemBasic / (100 * (i + 1))),
          discountAmount: 0,
          taxableAmount: perItemBasic,
          gstPct: 18,
          cgstAmount: Math.round(perItemGst / 2),
          sgstAmount: perItemGst - Math.round(perItemGst / 2),
          igstAmount: 0,
          gstAmount: perItemGst,
          lineTotal: perItemBasic + perItemGst,
          deliveryDate: legacy.deliveryDate || "2026-10-15",
          deliveryLocation: `Central Site Godown, ${legacy.site}`,
          remarks: "Conforming to certified laboratory test requirements",
        }));

        return {
          ...legacy,
          status: poStatus,
          poType: "Material",
          currency: "INR",
          projectName: legacy.project,
          siteName: legacy.site,
          supplierName: legacy.supplier,
          supplierCode: `VEN-${String(100 + (idx % 30)).padStart(3, "0")}`,
          contactPerson: "Authorized Vendor Manager",
          phone: "+91 98220 12345",
          email: "orders@supplier.com",
          billingAddress: "Industrial Estate, Plot 14, Pune, Maharashtra 411018",
          gstin: "27AAACB1234F1Z5",
          pan: "AAACB1234F",
          sourceComparativeNo: `CS/26-27/${String(100 + (idx % 20))}`,
          sourceRFQNumber: `RFQ/26-27/${String(300 + (idx % 20))}`,
          sourceIndentNumber: `IND/26-27/${String(1000 + (idx % 20))}`,
          basicValue: basic,
          discount: 0,
          taxableValue: basic,
          cgst,
          sgst,
          igst: 0,
          totalGst,
          otherCharges: 0,
          roundOff: 0,
          grandTotal,
          items,
          deliveryTerms: `FOR Site (${legacy.site})`,
          commercialTerms: {
            paymentTerms: legacy.paymentTerms || "30 Days Credit",
            deliveryTerms: `FOR Site (${legacy.site})`,
            freight: "Included in basic rate",
            insurance: "Transit insurance covered by vendor",
            loadingUnloading: "Unloading at site by buyer",
            taxes: "GST 18% as applicable",
            warranty: "Standard manufacturer warranty",
            penaltyLd: "0.5% per week of delay capped at 5%",
            otherTerms: "MTC required with each dispatch",
          },
          deliverySchedule: items.map((it, dIdx) => ({
            id: `ds-${legacy.id}-${dIdx + 1}`,
            itemCode: it.itemCode,
            itemDescription: it.itemDescription,
            quantity: it.poQty,
            unit: it.unit,
            deliveryDate: it.deliveryDate,
            deliveryLocation: it.deliveryLocation || `Central Store, ${legacy.site}`,
            remarks: "Batch delivery",
          })),
          auditTimeline: [
            {
              id: `atl-${legacy.id}-1`,
              stage: "PO Created",
              title: "Purchase Order Initiated",
              description: `Generated from source Comparative CS/26-27/${String(100 + (idx % 20))}.`,
              timestamp: legacy.date,
              user: "Purchase Desk",
              role: "Procurement Lead",
              status: "completed",
            },
            {
              id: `atl-${legacy.id}-2`,
              stage: "Purchase Head Approval",
              title: "Technical Review Passed",
              description: "Commercial evaluation approved.",
              timestamp: legacy.date,
              user: "Rajesh Sharma",
              role: "VP Procurement",
              status: poStatus === "Draft" ? "upcoming" : "completed",
            },
            {
              id: `atl-${legacy.id}-3`,
              stage: "Final Approval",
              title: "Executive Sign-Off",
              description: "Director authorization confirmed.",
              timestamp: legacy.date,
              user: "Vikram Malhotra",
              role: "Director",
              status: ["Approved", "Issued", "Partially Received", "Fully Received"].includes(poStatus)
                ? "completed"
                : "upcoming",
            },
            {
              id: `atl-${legacy.id}-4`,
              stage: "PO Issued",
              title: "Released to Supplier",
              description: "Order transmitted to vendor.",
              timestamp: legacy.date,
              user: "Store & Purchase",
              role: "Purchase Desk",
              status: ["Issued", "Partially Received", "Fully Received"].includes(poStatus)
                ? "completed"
                : "upcoming",
            },
          ],
        };
      });

      const baseList: PurchaseOrder[] = [
        baselinePo0001,
        ...enrichedMockPos.filter((p) => p.poNo !== baselinePo0001.poNo),
      ];

      const merged = [...saved];
      for (const b of baseList) {
        if (!merged.some((m) => m.id === b.id || m.poNo === b.poNo)) {
          merged.push(b);
        }
      }

      this.memoryPos = merged;
    }

    let result = [...this.memoryPos];

    if (filters) {
      const { search, project, supplier, status, date, poType } = filters;

      if (search?.trim()) {
        const q = search.toLowerCase();
        result = result.filter(
          (p) =>
            p.poNo.toLowerCase().includes(q) ||
            p.supplier.toLowerCase().includes(q) ||
            (p.supplierName && p.supplierName.toLowerCase().includes(q)) ||
            p.project.toLowerCase().includes(q) ||
            (p.projectName && p.projectName.toLowerCase().includes(q)) ||
            (p.sourceComparativeNo && p.sourceComparativeNo.toLowerCase().includes(q)),
        );
      }

      if (project && project !== "All") {
        result = result.filter((p) => p.project === project || p.projectName === project);
      }

      if (supplier && supplier !== "All") {
        result = result.filter((p) => p.supplier === supplier || p.supplierName === supplier);
      }

      if (status && status !== "All") {
        result = result.filter((p) => p.status === status);
      }

      if (poType && poType !== "All") {
        result = result.filter((p) => (p.poType || "Material") === poType);
      }

      if (date && date !== "All") {
        const refDate = new Date("2026-09-18").getTime();
        result = result.filter((p) => {
          const poDate = new Date(p.date).getTime();
          if (isNaN(poDate)) return true;
          const diffDays = Math.abs(refDate - poDate) / (1000 * 60 * 60 * 24);
          if (date === "Last 7 Days") return diffDays <= 7;
          if (date === "Last 15 Days") return diffDays <= 15;
          if (date === "Last 30 Days") return diffDays <= 30;
          if (date === "Current Month") {
            const d = new Date(p.date);
            return d.getMonth() === 8 && d.getFullYear() === 2026;
          }
          return true;
        });
      }
    }

    return result;
  }

  getPurchaseOrderById(idOrNo: string): PurchaseOrder | undefined {
    return this.getPurchaseOrders().find(
      (p) =>
        p.id === idOrNo ||
        p.poNo === idOrNo ||
        p.poNo.replace(/\//g, "-") === idOrNo ||
        p.poNo.replace(/-/g, "/") === idOrNo,
    );
  }

  getNextPoNumber(): string {
    const list = this.getPurchaseOrders();
    const count = list.length + 1;
    return `PO/26-27/${String(count).padStart(4, "0")}`;
  }

  createPurchaseOrder(data: Partial<PurchaseOrder>): PurchaseOrder {
    const list = this.getPurchaseOrders();
    const poNo = data.poNo || this.getNextPoNumber();

    const items = (data.items || []).map((it, idx) => {
      const lineBasic = it.poQty * it.rate;
      const lineDiscount = it.discountAmount || 0;
      const taxableAmount = Math.max(0, lineBasic - lineDiscount);
      const gstPct = it.gstPct ?? 18;
      const gstAmount = Math.round((taxableAmount * gstPct) / 100);
      const isInterState = (it.igstAmount && it.igstAmount > 0) || (data.igst && data.igst > 0);
      const cgstAmount = isInterState ? 0 : Math.round(gstAmount / 2);
      const sgstAmount = isInterState ? 0 : gstAmount - cgstAmount;
      const igstAmount = isInterState ? gstAmount : 0;
      const lineTotal = taxableAmount + gstAmount;

      return {
        ...it,
        id: it.id || `poi-item-${idx + 1}`,
        taxableAmount,
        gstPct,
        gstAmount,
        cgstAmount,
        sgstAmount,
        igstAmount,
        lineTotal,
      };
    });

    const basicValue = items.reduce((s, it) => s + it.poQty * it.rate, 0);
    const itemDiscount = items.reduce((s, it) => s + (it.discountAmount || 0), 0);
    const overallDiscount = data.discount || 0;
    const totalDiscount = itemDiscount + overallDiscount;
    const taxableValue = items.reduce((s, it) => s + it.taxableAmount, 0);
    const cgst = items.reduce((s, it) => s + (it.cgstAmount || 0), 0);
    const sgst = items.reduce((s, it) => s + (it.sgstAmount || 0), 0);
    const igst = items.reduce((s, it) => s + (it.igstAmount || 0), 0);
    const totalGst = cgst + sgst + igst;
    const otherCharges = data.otherCharges || 0;
    const rawTotal = taxableValue + totalGst + otherCharges - overallDiscount;
    const grandTotal = Math.round(rawTotal);
    const roundOff = Math.round((grandTotal - rawTotal) * 100) / 100;

    const newPo: PurchaseOrder = {
      id: `po-${Date.now()}`,
      poNo,
      date: data.date || new Date().toISOString().slice(0, 10),
      supplier: data.supplierName || data.supplier || "Supplier",
      supplierName: data.supplierName || data.supplier || "Supplier",
      supplierId: data.supplierId || "ven-1",
      supplierCode: data.supplierCode || "VEN-001",
      contactPerson: data.contactPerson || "Supplier Representative",
      phone: data.phone || "+91 98220 00000",
      email: data.email || "sales@supplier.com",
      billingAddress: data.billingAddress || "Bhosari Industrial Estate, Pune, Maharashtra 411026",
      gstin: data.gstin || "27AACCA1234M1Z2",
      pan: data.pan || "AACCA1234M",

      project: data.projectName || data.project || "Project",
      projectName: data.projectName || data.project || "Project",
      projectId: data.projectId || "p9",
      site: data.siteName || data.site || "Main Site",
      siteName: data.siteName || data.site || "Main Site",

      sourceComparativeNo: data.sourceComparativeNo || "CS/26-27/001",
      sourceComparativeId: data.sourceComparativeId || "cs-330-1",
      sourceRFQNumber: data.sourceRFQNumber || "RFQ/26-27/330",
      sourceIndentNumber: data.sourceIndentNumber || "IND/26-27/1041",

      poType: data.poType || "Material",
      currency: "INR",
      deliveryDate: data.deliveryDate || "2026-10-15",
      paymentTerms: data.paymentTerms || "30 days net from invoice",
      deliveryTerms: data.deliveryTerms || `FOR Site (${data.siteName || "Site"})`,
      warrantyTerms: data.warrantyTerms || "Standard 12 Months warranty",
      remarks: data.remarks || "",

      itemCount: items.length,
      amount: basicValue,
      gst: totalGst,
      total: grandTotal,
      basicValue,
      discount: totalDiscount,
      taxableValue,
      cgst,
      sgst,
      igst,
      totalGst,
      otherCharges,
      roundOff,
      grandTotal,

      status: data.status || "Draft",
      receivedPct: 0,
      items,
      commercialTerms: data.commercialTerms || {
        paymentTerms: data.paymentTerms || "30 days net from invoice",
        deliveryTerms: data.deliveryTerms || "FOR Site",
        freight: "Included",
        insurance: "Covered by vendor",
        loadingUnloading: "Unloading at site by buyer",
        taxes: "GST 18% as applicable",
        warranty: "12 Months defect liability",
        penaltyLd: "0.5% per week up to 5%",
        otherTerms: "MTC required",
      },
      deliverySchedule:
        data.deliverySchedule ||
        items.map((it, idx) => ({
          id: `ds-${idx + 1}`,
          itemCode: it.itemCode,
          itemDescription: it.itemDescription,
          quantity: it.poQty,
          unit: it.unit,
          deliveryDate: it.deliveryDate || data.deliveryDate || "2026-10-15",
          deliveryLocation: it.deliveryLocation || data.siteName || "Central Site Yard",
          remarks: "Standard batch delivery",
        })),
      auditTimeline: [
        {
          id: `atl-${Date.now()}-1`,
          stage: "PO Created",
          title: data.status === "Pending Approval" ? "Submitted for Approval" : "PO Draft Created",
          description: `Generated from source Comparative Statement ${data.sourceComparativeNo || "CS/26-27/001"}.`,
          timestamp: new Date().toLocaleString("en-IN", {
            dateStyle: "medium",
            timeStyle: "short",
          }),
          user: "Current User (Purchase Lead)",
          role: "Procurement Desk",
          status: "completed",
        },
        {
          id: `atl-${Date.now()}-2`,
          stage: "Purchase Head Approval",
          title: "Technical & Commercial Review",
          description: "Forwarded to VP Procurement for authorization.",
          timestamp: data.status === "Pending Approval" ? "In Progress" : "Pending",
          user: "Rajesh Sharma",
          role: "VP Procurement",
          status: data.status === "Pending Approval" ? "current" : "upcoming",
        },
        {
          id: `atl-${Date.now()}-3`,
          stage: "Finance Approval",
          title: "Financial Budget Verification",
          description: "WBS procurement budget check.",
          timestamp: "Pending",
          user: "Suresh Menon",
          role: "Finance Controller",
          status: "upcoming",
        },
        {
          id: `atl-${Date.now()}-4`,
          stage: "Final Approval",
          title: "Director Executive Sign-off",
          description: "Director authorization.",
          timestamp: "Pending",
          user: "Vikram Malhotra",
          role: "Director",
          status: "upcoming",
        },
        {
          id: `atl-${Date.now()}-5`,
          stage: "PO Approved",
          title: "Order Authorization",
          description: "Ready for formal supplier release.",
          timestamp: "Pending",
          user: "System",
          role: "Workflow Engine",
          status: "upcoming",
        },
        {
          id: `atl-${Date.now()}-6`,
          stage: "PO Issued",
          title: "Issued to Vendor",
          description: "Dispatch order released to vendor.",
          timestamp: "Pending",
          user: "Store & Purchase",
          role: "Purchase Desk",
          status: "upcoming",
        },
      ],
      documents: [
        {
          id: `doc-${Date.now()}-1`,
          name: `${poNo.replace(/\//g, "_")}_Contract_Order.pdf`,
          type: "PDF",
          size: "2.1 MB",
          uploadedAt: new Date().toISOString().slice(0, 10),
          category: "PO PDF",
        },
      ],
    };

    const updated = [newPo, ...list];
    this.save(updated);

    if (data.sourceComparativeNo) {
      comparativeService.markPoGenerated(data.sourceComparativeNo, newPo.poNo);
    }

    return newPo;
  }

  updatePurchaseOrder(idOrNo: string, data: Partial<PurchaseOrder>): PurchaseOrder | undefined {
    const list = this.getPurchaseOrders();
    const target = list.find((p) => p.id === idOrNo || p.poNo === idOrNo);
    if (!target) return undefined;

    // Recalculate financial totals if items or charges updated
    if (data.items) {
      const items = data.items.map((it, idx) => {
        const lineBasic = it.poQty * it.rate;
        const lineDiscount = it.discountAmount || 0;
        const taxableAmount = Math.max(0, lineBasic - lineDiscount);
        const gstPct = it.gstPct ?? 18;
        const gstAmount = Math.round((taxableAmount * gstPct) / 100);
        const isInterState = (it.igstAmount && it.igstAmount > 0) || (data.igst && data.igst > 0);
        const cgstAmount = isInterState ? 0 : Math.round(gstAmount / 2);
        const sgstAmount = isInterState ? 0 : gstAmount - cgstAmount;
        const igstAmount = isInterState ? gstAmount : 0;
        const lineTotal = taxableAmount + gstAmount;

        return {
          ...it,
          id: it.id || `poi-item-${idx + 1}`,
          taxableAmount,
          gstPct,
          gstAmount,
          cgstAmount,
          sgstAmount,
          igstAmount,
          lineTotal,
        };
      });

      const basicValue = items.reduce((s, it) => s + it.poQty * it.rate, 0);
      const itemDiscount = items.reduce((s, it) => s + (it.discountAmount || 0), 0);
      const overallDiscount = data.discount ?? target.discount ?? 0;
      const totalDiscount = itemDiscount + overallDiscount;
      const taxableValue = items.reduce((s, it) => s + it.taxableAmount, 0);
      const cgst = items.reduce((s, it) => s + (it.cgstAmount || 0), 0);
      const sgst = items.reduce((s, it) => s + (it.sgstAmount || 0), 0);
      const igst = items.reduce((s, it) => s + (it.igstAmount || 0), 0);
      const totalGst = cgst + sgst + igst;
      const otherCharges = data.otherCharges ?? target.otherCharges ?? 0;
      const rawTotal = taxableValue + totalGst + otherCharges - overallDiscount;
      const grandTotal = Math.round(rawTotal);
      const roundOff = Math.round((grandTotal - rawTotal) * 100) / 100;

      target.items = items;
      target.itemCount = items.length;
      target.basicValue = basicValue;
      target.amount = basicValue;
      target.discount = totalDiscount;
      target.taxableValue = taxableValue;
      target.cgst = cgst;
      target.sgst = sgst;
      target.igst = igst;
      target.totalGst = totalGst;
      target.gst = totalGst;
      target.otherCharges = otherCharges;
      target.roundOff = roundOff;
      target.grandTotal = grandTotal;
      target.total = grandTotal;
    }

    if (data.poType) target.poType = data.poType;
    if (data.deliveryDate) target.deliveryDate = data.deliveryDate;
    if (data.paymentTerms) target.paymentTerms = data.paymentTerms;
    if (data.deliveryTerms) target.deliveryTerms = data.deliveryTerms;
    if (data.warrantyTerms) target.warrantyTerms = data.warrantyTerms;
    if (data.remarks !== undefined) target.remarks = data.remarks;
    if (data.commercialTerms) target.commercialTerms = data.commercialTerms;
    if (data.deliverySchedule) target.deliverySchedule = data.deliverySchedule;

    if (data.status && data.status !== target.status) {
      return this.updatePurchaseOrderStatus(target.id, data.status as PoStatus);
    }

    this.save(list);
    return target;
  }

  updatePurchaseOrderStatus(idOrNo: string, newStatus: PoStatus): PurchaseOrder | undefined {
    const list = this.getPurchaseOrders();
    const target = list.find((p) => p.id === idOrNo || p.poNo === idOrNo);
    if (!target) return undefined;

    target.status = newStatus;

    // Append audit event for status transition
    const nowStr = new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
    if (!target.auditTimeline) target.auditTimeline = [];

    if (newStatus === "Pending Approval") {
      target.auditTimeline.forEach((a) => {
        if (a.stage === "PO Created") a.status = "completed";
        if (a.stage === "Purchase Head Approval") a.status = "current";
      });
      target.auditTimeline.push({
        id: `atl-${Date.now()}`,
        stage: "Submitted for Approval",
        title: "Submitted for Multi-Level Approval",
        description: "Sent to Purchase Head & Finance Controller for commercial clearance.",
        timestamp: nowStr,
        user: "Current User",
        role: "Procurement Lead",
        status: "completed",
      });
    } else if (newStatus === "Approved") {
      target.auditTimeline.forEach((a) => {
        if (a.stage !== "PO Issued") a.status = "completed";
      });
      target.auditTimeline.push({
        id: `atl-${Date.now()}`,
        stage: "Final Approval",
        title: "Final Management Approval Granted",
        description: "All budgetary and technical clearances confirmed. Ready for supplier issue.",
        timestamp: nowStr,
        user: "Vikram Malhotra",
        role: "Director",
        status: "completed",
      });
    } else if (newStatus === "Issued") {
      target.auditTimeline.forEach((a) => (a.status = "completed"));
      target.auditTimeline.push({
        id: `atl-${Date.now()}`,
        stage: "PO Issued",
        title: "Purchase Order Issued to Supplier",
        description: `Order successfully transmitted to ${target.supplierName || target.supplier}. Handoff to Stores & GRN initiated.`,
        timestamp: nowStr,
        user: "Current User",
        role: "Purchase Desk",
        status: "completed",
      });
    } else if (newStatus === "Draft") {
      target.auditTimeline.push({
        id: `atl-${Date.now()}`,
        stage: "Sent Back",
        title: "Returned to Draft for Revision",
        description: "Sent back to purchase desk for clarifications/adjustments.",
        timestamp: nowStr,
        user: "Reviewer",
        role: "Approver",
        status: "completed",
      });
    } else if ((newStatus as string) === "Cancelled" || (newStatus as string) === "Rejected") {
      target.auditTimeline.push({
        id: `atl-${Date.now()}`,
        stage: "Order Rejected",
        title: "Purchase Order Rejected / Cancelled",
        description: "Commercial or budgetary non-conformance.",
        timestamp: nowStr,
        user: "Approver",
        role: "Management",
        status: "completed",
      });
    }

    this.save(list);
    return target;
  }

  deletePurchaseOrder(idOrNo: string): boolean {
    const list = this.getPurchaseOrders();
    const filtered = list.filter((p) => p.id !== idOrNo && p.poNo !== idOrNo);
    if (filtered.length === list.length) return false;
    this.save(filtered);
    return true;
  }
}

export const poService = new PoService();
