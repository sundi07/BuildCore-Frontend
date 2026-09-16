import type { Enquiry, RfqSupplier } from "@/types";
import * as m from "@/mock/data";

const RFQ_STORAGE_KEY = "buildcore_rfqs_v1";

export const empaneledSuppliers: RfqSupplier[] = [
  {
    id: "ven-1",
    name: "ABC Cement Suppliers",
    code: "VEN-001",
    category: "Cement",
    contactPerson: "Rajesh Nair",
    email: "sales@abccement.com",
    phone: "+91 98231 44550",
  },
  {
    id: "ven-2",
    name: "Maharashtra Steel Traders",
    code: "VEN-002",
    category: "Steel & Rebars",
    contactPerson: "Sunil Kulkarni",
    email: "orders@maharebar.com",
    phone: "+91 98220 88771",
  },
  {
    id: "ven-3",
    name: "Shree Ganesh RMC Plant",
    code: "VEN-003",
    category: "Concrete / RMC",
    contactPerson: "Ramesh Deshmukh",
    email: "rmc@ganeshinfra.com",
    phone: "+91 94230 11223",
  },
  {
    id: "ven-4",
    name: "BuildMart Materials",
    code: "VEN-004",
    category: "General Civil",
    contactPerson: "Harish Patel",
    email: "support@buildmart.in",
    phone: "+91 97120 33445",
  },
  {
    id: "ven-5",
    name: "Prime Electricals",
    code: "VEN-005",
    category: "Electrical & MEP",
    contactPerson: "Manoj Joshi",
    email: "prime@pune-electricals.com",
    phone: "+91 98500 22334",
  },
];

class RfqService {
  private memoryRfqs: Enquiry[] | null = null;

  private loadSaved(): Enquiry[] {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(RFQ_STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.error("Failed to load RFQs from localStorage:", e);
    }
    return [];
  }

  private save(rfqs: Enquiry[]) {
    this.memoryRfqs = rfqs;
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(RFQ_STORAGE_KEY, JSON.stringify(rfqs));
    } catch (e) {
      console.error("Failed to persist RFQs to localStorage:", e);
    }
  }

  getEmpaneledSuppliers(): RfqSupplier[] {
    return empaneledSuppliers;
  }

  getEnquiries(): Enquiry[] {
    if (this.memoryRfqs) return this.memoryRfqs;

    const saved = this.loadSaved();
    // Explicit baseline for RFQ/26-27/330 specified in Phase 3B requirements
    const rfq330: Enquiry = {
      id: "enq-330",
      enquiryNo: "RFQ/26-27/330",
      date: "2026-09-10",
      project: "Baner Gateway Signature Suites",
      site: "Main Plot Site",
      department: "Civil",
      sourceIndent: "IND/26-27/1041",
      indentId: "ind-1",
      item: "OPC 53 Cement + 2 more items",
      quantity: 570,
      unit: "Nos",
      suppliers: 3,
      responses: 3,
      sentDate: "2026-09-10",
      responseDate: "2026-09-16",
      expectedQuotationDate: "2026-09-16",
      quotationValidity: "30 Days",
      deliveryRequiredBy: "2026-10-15",
      paymentTerms: "30 days net from receipt of material and verified invoice",
      deliveryTerms: "FOR Site (Main Plot Site)",
      status: "Sent",
      selectedSuppliers: [
        empaneledSuppliers[0]!, // ABC Cement Suppliers
        empaneledSuppliers[1]!, // Maharashtra Steel Traders
        empaneledSuppliers[2]!, // Shree Ganesh RMC Plant
      ],
      items: [
        {
          itemCode: "MAT-101",
          item: "OPC 53 Grade Cement",
          itemDescription: "UltraTech/Ambuja OPC 53 Grade conforming to IS 269",
          category: "Cement",
          unit: "Bag",
          quantity: 500,
          rate: 420,
          remarks: "50kg paper sacks, delivery at site warehouse",
        },
        {
          itemCode: "MAT-102",
          item: "Fe500D TMT Steel Rebars",
          itemDescription: "Primary producer Tata/Jindal/SAIL Fe500D conforming to IS 1786",
          category: "Steel & Rebars",
          unit: "MT",
          quantity: 20,
          rate: 62500,
          remarks: "Corrosion resistant TMT bars, 12m length",
        },
        {
          itemCode: "MAT-103",
          item: "M30 Grade Ready Mix Concrete",
          itemDescription: "M30 Design mix concrete with flyash replacement, slump 120±25mm",
          category: "Concrete / RMC",
          unit: "Cum",
          quantity: 50,
          rate: 4900,
          remarks: "Pumpable mix for warehouse flooring slab",
        },
      ],
    };

    // Default baseline from mock data mapped to Enquiry interface
    const baseMock: Enquiry[] = [
      rfq330,
      ...(m.enquiries as unknown as Enquiry[]).map((e, idx) => ({
        ...e,
        sourceIndent: e.sourceIndent || `IND/26-27/${1030 + idx}`,
        selectedSuppliers:
          e.selectedSuppliers || empaneledSuppliers.slice(0, Math.min(e.suppliers || 2, 3)),
        expectedQuotationDate: e.expectedQuotationDate || new Date().toISOString().slice(0, 10),
        quotationValidity: e.quotationValidity || "30 Days",
        deliveryRequiredBy: e.deliveryRequiredBy || e.responseDate || "2026-10-15",
        paymentTerms: e.paymentTerms || "30 Days from GRN",
        deliveryTerms: e.deliveryTerms || "F.O.R. Site Store",
        items: e.items || [
          {
            itemCode: `MAT-${101 + idx}`,
            item: e.item,
            itemDescription: `${e.item} conforming to project specification`,
            category: "Civil",
            unit: e.unit,
            quantity: e.quantity,
            rate: 500,
          },
        ],
      })),
    ];

    // Merge saved custom RFQs on top
    const merged = [...saved];
    for (const b of baseMock) {
      if (!merged.some((m) => m.id === b.id || m.enquiryNo === b.enquiryNo)) {
        merged.push(b);
      }
    }

    this.memoryRfqs = merged;
    return merged;
  }

  getNextRfqNumber(): string {
    const list = this.getEnquiries();
    let max = 0;
    for (const item of list) {
      const match = item.enquiryNo.match(/RFQ\/26-27\/0*(\d+)/);
      if (match && match[1]) {
        const n = parseInt(match[1], 10);
        if (n > max) max = n;
      }
    }
    const next = max + 1;
    return `RFQ/26-27/${String(next).padStart(3, "0")}`;
  }

  createRfq(data: Omit<Enquiry, "id">): Enquiry {
    const list = this.getEnquiries();
    const newRecord: Enquiry = {
      ...data,
      id: `rfq-${Date.now().toString(36)}`,
    };

    const updated = [newRecord, ...list];
    this.save(updated);
    return newRecord;
  }

  updateRfqStatus(
    idOrNo: string,
    newStatus: "Draft" | "Sent" | "Partially Responded" | "Closed",
  ): Enquiry | null {
    const list = this.getEnquiries();
    const idx = list.findIndex((e) => e.id === idOrNo || e.enquiryNo === idOrNo);
    if (idx === -1) return null;

    const existing = list[idx]!;
    const updated: Enquiry = {
      ...existing,
      status: newStatus,
      sentDate:
        newStatus === "Sent"
          ? existing.sentDate || new Date().toISOString().slice(0, 10)
          : existing.sentDate,
    };

    const nextList = [...list];
    nextList[idx] = updated;
    this.save(nextList);
    return updated;
  }

  getEnquiryById(idOrNo: string): Enquiry | undefined {
    const list = this.getEnquiries();
    return list.find((e) => e.id === idOrNo || e.enquiryNo === idOrNo);
  }
}

export const rfqService = new RfqService();
