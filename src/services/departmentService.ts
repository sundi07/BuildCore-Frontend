import { request, type BackendResponse } from "@/services/http";
import type { Department } from "@/types";

export interface DepartmentRequest {
  companyId: number;
  code: string;
  name: string;
}

export const departmentService = {
  /** GET /api/v1/departments */
  async getDepartments(): Promise<Department[]> {
    const res = await request<BackendResponse<Department[]>>("/api/v1/departments");
    return res.data ?? [];
  },

  /** GET /api/v1/departments/{id} */
  async getDepartmentById(id: number | string): Promise<Department> {
    const res = await request<BackendResponse<Department>>(`/api/v1/departments/${id}`);
    return res.data;
  },

  /** GET /api/v1/departments/company/{companyId} */
  async getDepartmentsByCompany(companyId: number | string): Promise<Department[]> {
    const res = await request<BackendResponse<Department[]>>(
      `/api/v1/departments/company/${companyId}`,
    );
    return res.data ?? [];
  },

  /** POST /api/v1/departments */
  async createDepartment(payload: DepartmentRequest): Promise<Department> {
    const res = await request<BackendResponse<Department>>("/api/v1/departments", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  /** PUT /api/v1/departments/{id} */
  async updateDepartment(id: number | string, payload: DepartmentRequest): Promise<Department> {
    const res = await request<BackendResponse<Department>>(`/api/v1/departments/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    return res.data;
  },
};
