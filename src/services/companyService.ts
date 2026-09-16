import { request, type BackendResponse } from "@/services/http";
import type { Company } from "@/types";

export interface CompanyRequest {
  code: string;
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
}

export const companyService = {
  /** GET /api/v1/companies */
  async getCompanies(): Promise<Company[]> {
    const res = await request<BackendResponse<Company[]>>("/api/v1/companies");
    return res.data ?? [];
  },

  /** GET /api/v1/companies/{id} */
  async getCompanyById(id: number | string): Promise<Company> {
    const res = await request<BackendResponse<Company>>(`/api/v1/companies/${id}`);
    return res.data;
  },

  /** POST /api/v1/companies */
  async createCompany(payload: CompanyRequest): Promise<Company> {
    const res = await request<BackendResponse<Company>>("/api/v1/companies", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  /** PUT /api/v1/companies/{id} */
  async updateCompany(id: number | string, payload: CompanyRequest): Promise<Company> {
    const res = await request<BackendResponse<Company>>(`/api/v1/companies/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    return res.data;
  },
};
