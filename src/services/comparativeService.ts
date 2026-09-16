import type { ComparativeStatement } from "@/types";

const COMPARATIVE_STORAGE_KEY = "buildcore_comparatives_v1";

const seedComparatives: ComparativeStatement[] = [
  {
    id: "cs-330-1",
    csNo: "CS/26-27/001",
    title: "Comparative Statement for Bulk Cement, TMT Steel & RMC",
    date: "2026-09-17",
    status: "Approved",
    approvalStatus: "Approved",
    approvedBy: "Rajesh Sharma (VP Procurement)",
    approvalDate: "2026-09-17",

    sourceRFQId: "enq-330",
    sourceRFQNumber: "RFQ/26-27/330",
    sourceIndentNumber: "IND/26-27/1041",
    projectId: "p9",
    projectName: "Baner Gateway Signature Suites",
    siteName: "Main Plot Site",

    recommendedSupplierId: "ven-1",
    recommendedSupplierName: "ABC Cement Suppliers",
    recommendedSupplierCode: "VEN-001",
    recommendationRemarks:
      "L1 bidder ABC Cement Suppliers recommended on techno-commercial compliance, BIS certification conformance and lowest landed cost (₹21.83 Lakhs). Final negotiation conducted with supplier representatives on 16/09/2026. Approved for Purchase Order release.",

    suppliersEvaluated: 3,
    supplierBids: [
      {
        supplierId: "ven-1",
        supplierName: "ABC Cement Suppliers",
        supplierCode: "VEN-001",
        quotationNo: "QT/26-27/001",
        basicAmount: 1850000,
        taxAmount: 333000,
        landedCost: 2183000,
        deliveryDays: 7,
        rank: "L1",
        isRecommended: true,
      },
      {
        supplierId: "ven-2",
        supplierName: "Maharashtra Steel Traders",
        supplierCode: "VEN-002",
        quotationNo: "QT/26-27/002",
        basicAmount: 1898305,
        taxAmount: 341695,
        landedCost: 2240000,
        deliveryDays: 10,
        rank: "L2",
        isRecommended: false,
      },
      {
        supplierId: "ven-3",
        supplierName: "Shree Ganesh RMC Plant",
        supplierCode: "VEN-003",
        quotationNo: "QT/26-27/003",
        basicAmount: 1957627,
        taxAmount: 352373,
        landedCost: 2310000,
        deliveryDays: 12,
        rank: "L3",
        isRecommended: false,
      },
    ],

    items: [
      {
        itemCode: "MAT-101",
        itemDescription: "UltraTech/Ambuja OPC 53 Grade conforming to IS 269",
        category: "Cement",
        unit: "Bag",
        approvedQty: 500,
        recommendedSupplierRate: 420,
        negotiatedRate: 420,
        rates: {
          "ven-1": { rate: 420, discount: 0, taxable: 210000, tax: 37800, total: 247800 },
          "ven-2": { rate: 428, discount: 0, taxable: 214000, tax: 38520, total: 252520 },
          "ven-3": { rate: 435, discount: 0, taxable: 217500, tax: 39150, total: 256650 },
        },
      },
      {
        itemCode: "MAT-102",
        itemDescription: "Primary producer Tata/Jindal Fe500D TMT Rebars conforming to IS 1786",
        category: "Steel & Rebars",
        unit: "MT",
        approvedQty: 20,
        recommendedSupplierRate: 62500,
        negotiatedRate: 62500,
        rates: {
          "ven-1": { rate: 62500, discount: 0, taxable: 1250000, tax: 225000, total: 1475000 },
          "ven-2": { rate: 64500, discount: 0, taxable: 1290000, tax: 232200, total: 1522200 },
          "ven-3": { rate: 66500, discount: 0, taxable: 1330000, tax: 239400, total: 1569400 },
        },
      },
      {
        itemCode: "MAT-103",
        itemDescription: "M30 Grade Ready Mix Concrete with flyash replacement",
        category: "Concrete / RMC",
        unit: "Cum",
        approvedQty: 50,
        recommendedSupplierRate: 7800,
        negotiatedRate: 7800,
        rates: {
          "ven-1": { rate: 7800, discount: 0, taxable: 390000, tax: 70200, total: 460200 },
          "ven-2": { rate: 7886.1, discount: 0, taxable: 394305, tax: 70975, total: 465280 },
          "ven-3": { rate: 8202.54, discount: 0, taxable: 410127, tax: 73823, total: 483950 },
        },
      },
    ],

    poGenerated: true,
    generatedPoNo: "PO/26-27/0001",
  },
];

class ComparativeService {
  private memoryComparatives: ComparativeStatement[] | null = null;

  private loadSaved(): ComparativeStatement[] {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(COMPARATIVE_STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.error("Failed to load Comparatives from localStorage:", e);
    }
    return [];
  }

  private save(list: ComparativeStatement[]) {
    this.memoryComparatives = list;
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(COMPARATIVE_STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.error("Failed to persist Comparatives to localStorage:", e);
    }
  }

  getComparatives(): ComparativeStatement[] {
    if (!this.memoryComparatives) {
      const saved = this.loadSaved();
      const merged = [...saved];
      for (const s of seedComparatives) {
        if (!merged.some((m) => m.id === s.id || m.csNo === s.csNo)) {
          merged.push(s);
        }
      }
      this.memoryComparatives = merged;
    }
    return [...this.memoryComparatives];
  }

  getComparativeByNo(csNo: string): ComparativeStatement | undefined {
    return this.getComparatives().find((c) => c.csNo === csNo || c.id === csNo);
  }

  markPoGenerated(csNo: string, poNo: string): ComparativeStatement | undefined {
    const list = this.getComparatives();
    const target = list.find((c) => c.csNo === csNo || c.id === csNo);
    if (!target) return undefined;

    target.poGenerated = true;
    target.generatedPoNo = poNo;
    this.save(list);
    return target;
  }
}

export const comparativeService = new ComparativeService();
