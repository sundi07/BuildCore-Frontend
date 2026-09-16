import type {
  Quotation,
  QuotationStatus,
  TechnicalEvaluation,
  CommercialEvaluation,
  QuotationLineItem,
  QuotationDocument,
} from "@/types";
import * as m from "@/mock/data";
import { rfqService } from "@/services/rfqService";

const QUOTATION_STORAGE_KEY = "buildcore_quotations_v2";

// Explicit baseline seed quotations for RFQ/26-27/330 specified in Phase 3B requirements
const seedQuotationsForRfq330: Quotation[] = [
  // 1. ABC Cement Suppliers (L1: ₹21.83 L)
  {
    id: "qt-330-1",
    quotationNo: "QT/26-27/001",
    date: "2026-09-16",
    validity: "14 Days",
    validUntil: "2026-09-30",
    status: "Received",

    sourceRFQId: "enq-330",
    sourceRFQNumber: "RFQ/26-27/330",
    sourceIndentId: "ind-1",
    sourceIndentNumber: "IND/26-27/1041",
    supplierId: "ven-1",
    supplierName: "ABC Cement Suppliers",
    supplierCode: "VEN-001",
    projectId: "p9",
    projectName: "Baner Gateway Signature Suites",
    siteId: "site-baner-1",
    siteName: "Main Plot Site",

    contactPerson: "Rajesh Nair",
    email: "sales@abccement.com",
    phone: "+91 98231 44550",

    totalItems: 3,
    basicAmount: 1850000,
    discount: 0,
    taxableAmount: 1850000,
    gst: 333000,
    freight: 0,
    otherCharges: 0,
    roundOff: 0,
    grandTotal: 2183000, // ₹21.83 L (L1)
    deliveryDays: 7,
    deliveryTerms: "FOR Site (Main Plot Site)",
    paymentTerms: "30 days net from receipt of material and verified invoice",

    items: [
      {
        itemCode: "MAT-101",
        itemDescription: "UltraTech/Ambuja OPC 53 Grade conforming to IS 269",
        category: "Cement",
        unit: "Bag",
        rfqQty: 500,
        quotedQty: 500,
        rate: 420,
        discountPct: 0,
        discountAmount: 0,
        taxPct: 18,
        taxAmount: 37800,
        lineAmount: 210000,
        deliverySchedule: "3-5 Days from PO",
        remarks: "Fresh factory batch test certificate will be enclosed with delivery",
      },
      {
        itemCode: "MAT-102",
        itemDescription: "Primary producer Tata/Jindal Fe500D TMT Rebars conforming to IS 1786",
        category: "Steel & Rebars",
        unit: "MT",
        rfqQty: 20,
        quotedQty: 20,
        rate: 62500,
        discountPct: 0,
        discountAmount: 0,
        taxPct: 18,
        taxAmount: 225000,
        lineAmount: 1250000,
        deliverySchedule: "7 Days from PO",
        remarks: "Physical & chemical test compliance certificates provided",
      },
      {
        itemCode: "MAT-103",
        itemDescription: "M30 Grade Ready Mix Concrete with flyash replacement",
        category: "Concrete / RMC",
        unit: "Cum",
        rfqQty: 50,
        quotedQty: 50,
        rate: 7800,
        discountPct: 0,
        discountAmount: 0,
        taxPct: 18,
        taxAmount: 70200,
        lineAmount: 390000,
        deliverySchedule: "Transit mixer pour on site",
        remarks: "Temperature controlled batching with cube test reports",
      },
    ],

    technicalEvaluation: {
      specificationCompliance: "Compliant",
      quantityCompliance: "Compliant",
      deliveryCompliance: "Compliant",
      documentsStatus: "Verified",
      remarks: "Quotation received from ABC Cement. Technical compliance review in progress.",
      evaluatedBy: "Sanjay Rane (Technical Lead)",
      evaluationDate: "2026-09-16",
      result: "Pending",
    },

    commercialEvaluation: {
      rank: "L1",
      basicValue: 1850000,
      discount: 0,
      taxableAmount: 1850000,
      gst: 333000,
      freight: 0,
      otherCharges: 0,
      landedCost: 2183000,
      paymentTerms: "30 days net from receipt of material and verified invoice",
      deliveryTerms: "FOR Site (Main Plot Site)",
      validity: "14 Days",
    },

    documents: [
      {
        id: "doc-qt-1",
        name: "ABC_Cement_Commercial_Quotation_QT-001.pdf",
        type: "PDF",
        size: "2.4 MB",
        uploadedAt: "2026-09-16",
        category: "Quotation PDF",
      },
      {
        id: "doc-qt-2",
        name: "OPC53_MTC_Test_Certificate_IS269.pdf",
        type: "PDF",
        size: "1.8 MB",
        uploadedAt: "2026-09-16",
        category: "Technical Documents",
      },
      {
        id: "doc-qt-3",
        name: "GST_Certificate_27AAJCS1122Q1Z4.pdf",
        type: "PDF",
        size: "620 KB",
        uploadedAt: "2026-09-16",
        category: "GST Certificate",
      },
    ],
  },

  // 2. Maharashtra Steel Traders (L2: ₹22.40 L)
  {
    id: "qt-330-2",
    quotationNo: "QT/26-27/002",
    date: "2026-09-16",
    validity: "14 Days",
    validUntil: "2026-09-30",
    status: "Received",

    sourceRFQId: "enq-330",
    sourceRFQNumber: "RFQ/26-27/330",
    sourceIndentId: "ind-1",
    sourceIndentNumber: "IND/26-27/1041",
    supplierId: "ven-2",
    supplierName: "Maharashtra Steel Traders",
    supplierCode: "VEN-002",
    projectId: "p9",
    projectName: "Baner Gateway Signature Suites",
    siteId: "site-baner-1",
    siteName: "Main Plot Site",

    contactPerson: "Sunil Kulkarni",
    email: "orders@maharebar.com",
    phone: "+91 98220 88771",

    totalItems: 3,
    basicAmount: 1898305,
    discount: 0,
    taxableAmount: 1898305,
    gst: 341695,
    freight: 0,
    otherCharges: 0,
    roundOff: 0,
    grandTotal: 2240000, // ₹22.40 L (L2)
    deliveryDays: 10,
    deliveryTerms: "FOR Site (Main Plot Site)",
    paymentTerms: "30 days net from receipt of material and verified invoice",

    items: [
      {
        itemCode: "MAT-101",
        itemDescription: "UltraTech/Ambuja OPC 53 Grade conforming to IS 269",
        category: "Cement",
        unit: "Bag",
        rfqQty: 500,
        quotedQty: 500,
        rate: 428,
        discountPct: 0,
        discountAmount: 0,
        taxPct: 18,
        taxAmount: 38520,
        lineAmount: 214000,
        deliverySchedule: "5-7 Days",
        remarks: "Supplied in standard 50kg bags",
      },
      {
        itemCode: "MAT-102",
        itemDescription: "Primary producer Tata/Jindal Fe500D TMT Rebars conforming to IS 1786",
        category: "Steel & Rebars",
        unit: "MT",
        rfqQty: 20,
        quotedQty: 20,
        rate: 64500,
        discountPct: 0,
        discountAmount: 0,
        taxPct: 18,
        taxAmount: 232200,
        lineAmount: 1290000,
        deliverySchedule: "10 Days",
        remarks: "Bundled rebar coils / straight lengths",
      },
      {
        itemCode: "MAT-103",
        itemDescription: "M30 Grade Ready Mix Concrete with flyash replacement",
        category: "Concrete / RMC",
        unit: "Cum",
        rfqQty: 50,
        quotedQty: 50,
        rate: 7886.1,
        discountPct: 0,
        discountAmount: 0,
        taxPct: 18,
        taxAmount: 70975,
        lineAmount: 394305,
        deliverySchedule: "Direct plant pump delivery",
        remarks: "Transit mixer delivery to site",
      },
    ],

    technicalEvaluation: {
      specificationCompliance: "Compliant",
      quantityCompliance: "Compliant",
      deliveryCompliance: "Compliant",
      documentsStatus: "Verified",
      remarks: "Mill test certificates and IS 1786 specifications validated.",
      evaluatedBy: "Sanjay Rane (Technical Lead)",
      evaluationDate: "2026-09-14",
      result: "Qualified",
    },

    commercialEvaluation: {
      rank: "L2",
      basicValue: 1898305,
      discount: 0,
      taxableAmount: 1898305,
      gst: 341695,
      freight: 0,
      otherCharges: 0,
      landedCost: 2240000,
      paymentTerms: "30 days net from receipt of material and verified invoice",
      deliveryTerms: "FOR Site (Main Plot Site)",
      validity: "14 Days",
    },

    documents: [
      {
        id: "doc-qt-21",
        name: "Maharashtra_Steel_Quotation_QT-002.pdf",
        type: "PDF",
        size: "2.1 MB",
        uploadedAt: "2026-09-16",
        category: "Quotation PDF",
      },
      {
        id: "doc-qt-22",
        name: "TMT_Fe500D_Batch_Quality_Report.pdf",
        type: "PDF",
        size: "1.5 MB",
        uploadedAt: "2026-09-16",
        category: "Technical Documents",
      },
    ],
  },

  // 3. Shree Ganesh RMC Plant (L3: ₹23.10 L)
  {
    id: "qt-330-3",
    quotationNo: "QT/26-27/003",
    date: "2026-09-16",
    validity: "14 Days",
    validUntil: "2026-09-30",
    status: "Received",

    sourceRFQId: "enq-330",
    sourceRFQNumber: "RFQ/26-27/330",
    sourceIndentId: "ind-1",
    sourceIndentNumber: "IND/26-27/1041",
    supplierId: "ven-3",
    supplierName: "Shree Ganesh RMC Plant",
    supplierCode: "VEN-003",
    projectId: "p9",
    projectName: "Baner Gateway Signature Suites",
    siteId: "site-baner-1",
    siteName: "Main Plot Site",

    contactPerson: "Ramesh Deshmukh",
    email: "rmc@ganeshinfra.com",
    phone: "+91 94230 11223",

    totalItems: 3,
    basicAmount: 1957627,
    discount: 0,
    taxableAmount: 1957627,
    gst: 352373,
    freight: 0,
    otherCharges: 0,
    roundOff: 0,
    grandTotal: 2310000, // ₹23.10 L (L3)
    deliveryDays: 12,
    deliveryTerms: "FOR Site (Main Plot Site)",
    paymentTerms: "30 days net from receipt of material and verified invoice",

    items: [
      {
        itemCode: "MAT-101",
        itemDescription: "UltraTech/Ambuja OPC 53 Grade conforming to IS 269",
        category: "Cement",
        unit: "Bag",
        rfqQty: 500,
        quotedQty: 500,
        rate: 435,
        discountPct: 0,
        discountAmount: 0,
        taxPct: 18,
        taxAmount: 39150,
        lineAmount: 217500,
        deliverySchedule: "7 Days",
        remarks: "Brand conforming to IS 269",
      },
      {
        itemCode: "MAT-102",
        itemDescription: "Primary producer Tata/Jindal Fe500D TMT Rebars conforming to IS 1786",
        category: "Steel & Rebars",
        unit: "MT",
        rfqQty: 20,
        quotedQty: 20,
        rate: 66500,
        discountPct: 0,
        discountAmount: 0,
        taxPct: 18,
        taxAmount: 239400,
        lineAmount: 1330000,
        deliverySchedule: "12 Days",
        remarks: "Corrosion resistant TMT bars",
      },
      {
        itemCode: "MAT-103",
        itemDescription: "M30 Grade Ready Mix Concrete with flyash replacement",
        category: "Concrete / RMC",
        unit: "Cum",
        rfqQty: 50,
        quotedQty: 50,
        rate: 8202.54,
        discountPct: 0,
        discountAmount: 0,
        taxPct: 18,
        taxAmount: 73823,
        lineAmount: 410127,
        deliverySchedule: "Direct plant pump delivery",
        remarks: "Transit mixer delivery to site",
      },
    ],

    technicalEvaluation: {
      specificationCompliance: "Compliant",
      quantityCompliance: "Compliant",
      deliveryCompliance: "Compliant",
      documentsStatus: "Verified",
      remarks: "Batching plant calibration and mix design documentation verified.",
      evaluatedBy: "Sanjay Rane (Technical Lead)",
      evaluationDate: "2026-09-14",
      result: "Qualified",
    },

    commercialEvaluation: {
      rank: "L3",
      basicValue: 1957627,
      discount: 0,
      taxableAmount: 1957627,
      gst: 352373,
      freight: 0,
      otherCharges: 0,
      landedCost: 2310000,
      paymentTerms: "30 days net from receipt of material and verified invoice",
      deliveryTerms: "FOR Site (Main Plot Site)",
      validity: "14 Days",
    },

    documents: [
      {
        id: "doc-qt-31",
        name: "Shree_Ganesh_RMC_Quotation_QT-003.pdf",
        type: "PDF",
        size: "1.9 MB",
        uploadedAt: "2026-09-16",
        category: "Quotation PDF",
      },
      {
        id: "doc-qt-32",
        name: "NABL_Concrete_Mix_Design_Report.pdf",
        type: "PDF",
        size: "3.2 MB",
        uploadedAt: "2026-09-16",
        category: "Technical Documents",
      },
    ],
  },
];

export interface QuotationFilters {
  search?: string | undefined;
  rfq?: string | undefined;
  project?: string | undefined;
  supplier?: string | undefined;
  status?: string | undefined;
  evaluationStatus?: string | undefined;
  dateFrom?: string | undefined;
  dateTo?: string | undefined;
}

class QuotationService {
  private memoryQuotations: Quotation[] | null = null;

  private loadSaved(): Quotation[] {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(QUOTATION_STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.error("Failed to load Quotations from localStorage:", e);
    }
    return [];
  }

  private save(quotes: Quotation[]) {
    this.memoryQuotations = quotes;
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(QUOTATION_STORAGE_KEY, JSON.stringify(quotes));
    } catch (e) {
      console.error("Failed to persist Quotations to localStorage:", e);
    }
  }

  getQuotations(filters?: QuotationFilters): Quotation[] {
    if (!this.memoryQuotations) {
      const saved = this.loadSaved();
      // Baseline: seed quotes for RFQ-330 + mock quotes from data.ts
      const base: Quotation[] = [
        ...seedQuotationsForRfq330,
        ...m.quotations.filter(
          (q) => !seedQuotationsForRfq330.some((s) => s.quotationNo === q.quotationNo),
        ),
      ];

      // Merge saved user modifications
      const merged = [...saved];
      for (const b of base) {
        if (!merged.some((m) => m.id === b.id || m.quotationNo === b.quotationNo)) {
          merged.push(b);
        }
      }

      this.memoryQuotations = merged;
    }

    let result = [...this.memoryQuotations];

    if (filters) {
      const { search, rfq, project, supplier, status, evaluationStatus } = filters;

      if (search && search.trim()) {
        const q = search.toLowerCase().trim();
        result = result.filter(
          (item) =>
            item.quotationNo.toLowerCase().includes(q) ||
            item.supplierName.toLowerCase().includes(q) ||
            item.sourceRFQNumber.toLowerCase().includes(q) ||
            item.projectName.toLowerCase().includes(q) ||
            item.items?.some(
              (it) =>
                it.itemCode.toLowerCase().includes(q) ||
                it.itemDescription.toLowerCase().includes(q),
            ),
        );
      }

      if (rfq && rfq !== "All") {
        result = result.filter((item) => item.sourceRFQNumber === rfq || item.sourceRFQId === rfq);
      }

      if (project && project !== "All") {
        result = result.filter(
          (item) => item.projectName === project || item.projectId === project,
        );
      }

      if (supplier && supplier !== "All") {
        result = result.filter(
          (item) => item.supplierName === supplier || item.supplierId === supplier,
        );
      }

      if (status && status !== "All") {
        result = result.filter((item) => item.status === status);
      }

      if (evaluationStatus && evaluationStatus !== "All") {
        if (evaluationStatus === "Pending") {
          result = result.filter(
            (item) =>
              item.status === "Received" ||
              item.status === "Under Technical Evaluation" ||
              !item.technicalEvaluation?.result ||
              item.technicalEvaluation?.result === "Pending",
          );
        } else if (evaluationStatus === "Technically Qualified") {
          result = result.filter(
            (item) =>
              item.status === "Technically Qualified" ||
              item.technicalEvaluation?.result === "Qualified",
          );
        } else if (evaluationStatus === "Commercially Qualified") {
          result = result.filter(
            (item) =>
              item.status === "Commercially Qualified" ||
              (item.commercialEvaluation?.rank && item.technicalEvaluation?.result === "Qualified"),
          );
        } else if (evaluationStatus === "Rejected") {
          result = result.filter(
            (item) =>
              item.status === "Rejected" ||
              item.status === "Technically Rejected" ||
              item.technicalEvaluation?.result === "Rejected",
          );
        }
      }
    }

    return result;
  }

  getQuotationById(idOrNo: string): Quotation | null {
    const list = this.getQuotations();
    return (
      list.find(
        (q) =>
          q.id === idOrNo ||
          q.quotationNo === idOrNo ||
          q.quotationNo.replace(/\//g, "-") === idOrNo,
      ) ?? null
    );
  }

  getQuotationsByRfq(rfqNumberOrId: string): Quotation[] {
    const list = this.getQuotations();
    return list.filter(
      (q) =>
        q.sourceRFQNumber === rfqNumberOrId ||
        q.sourceRFQId === rfqNumberOrId ||
        q.sourceRFQNumber.replace(/\//g, "-") === rfqNumberOrId,
    );
  }

  updateQuotationStatus(idOrNo: string, newStatus: QuotationStatus): Quotation | null {
    const list = this.getQuotations();
    const idx = list.findIndex(
      (q) =>
        q.id === idOrNo || q.quotationNo === idOrNo || q.quotationNo.replace(/\//g, "-") === idOrNo,
    );
    if (idx === -1) return null;

    const updated = {
      ...list[idx]!,
      status: newStatus,
    };
    list[idx] = updated;
    this.save(list);
    return updated;
  }

  updateTechnicalEvaluation(
    idOrNo: string,
    evalData: Partial<TechnicalEvaluation>,
    newStatus?: QuotationStatus,
  ): Quotation | null {
    const list = this.getQuotations();
    const idx = list.findIndex(
      (q) =>
        q.id === idOrNo || q.quotationNo === idOrNo || q.quotationNo.replace(/\//g, "-") === idOrNo,
    );
    if (idx === -1) return null;

    const current = list[idx]!;
    const existingEval = current.technicalEvaluation || {
      specificationCompliance: "Compliant",
      quantityCompliance: "Compliant",
      deliveryCompliance: "Compliant",
      documentsStatus: "Verified",
      remarks: "",
      evaluatedBy: "Technical Lead",
      evaluationDate: new Date().toISOString().slice(0, 10),
      result: "Pending",
    };

    const mergedEval: TechnicalEvaluation = {
      ...existingEval,
      ...evalData,
    };

    let status = newStatus || current.status;
    if (!newStatus) {
      if (mergedEval.result === "Qualified") {
        status = "Technically Qualified";
      } else if (mergedEval.result === "Rejected") {
        status = "Technically Rejected";
      }
    }

    const updated: Quotation = {
      ...current,
      technicalEvaluation: mergedEval,
      status,
    };

    list[idx] = updated;
    this.save(list);

    // If technical status changed, recalculate commercial ranks for this RFQ
    if (updated.sourceRFQNumber) {
      this.recalculateCommercialRanks(updated.sourceRFQNumber);
    }

    return this.getQuotationById(updated.id);
  }

  recalculateCommercialRanks(rfqNumber: string) {
    const list = this.getQuotations();
    const rfqQuotes = list.filter((q) => q.sourceRFQNumber === rfqNumber);
    if (rfqQuotes.length === 0) return;

    // Filter quotations that are technically qualified
    const qualifiedQuotes = rfqQuotes.filter(
      (q) =>
        q.status === "Technically Qualified" ||
        q.status === "Commercially Qualified" ||
        q.technicalEvaluation?.result === "Qualified",
    );

    // Sort by landedCost (grandTotal) ascending
    qualifiedQuotes.sort((a, b) => a.grandTotal - b.grandTotal);

    qualifiedQuotes.forEach((quote, rankIndex) => {
      const rankLabel = `L${rankIndex + 1}`;
      const fullListIdx = list.findIndex((q) => q.id === quote.id);
      if (fullListIdx >= 0) {
        list[fullListIdx] = {
          ...list[fullListIdx]!,
          commercialEvaluation: {
            rank: rankLabel,
            basicValue: quote.basicAmount,
            discount: quote.discount,
            taxableAmount: quote.taxableAmount,
            gst: quote.gst,
            freight: quote.freight,
            otherCharges: quote.otherCharges,
            landedCost: quote.grandTotal,
            paymentTerms: quote.paymentTerms,
            deliveryTerms: quote.deliveryTerms || "FOR Site",
            validity: quote.validity,
          },
        };
      }
    });

    this.save(list);
  }

  getNextQuotationNumber(): string {
    const list = this.getQuotations();
    let max = 0;
    for (const item of list) {
      const match = item.quotationNo.match(/QT\/26-27\/0*(\d+)/);
      if (match && match[1]) {
        const n = parseInt(match[1], 10);
        if (n > max) max = n;
      }
    }
    return `QT/26-27/${String(max + 1).padStart(3, "0")}`;
  }
}

export const quotationService = new QuotationService();
