import { request, type BackendResponse } from "@/services/http";
import type { Employee, EmployeeRequest } from "@/types";

export type { EmployeeRequest };

export const employeeService = {
  /** GET /api/v1/employees */
  async getEmployees(): Promise<Employee[]> {
    const res = await request<BackendResponse<Employee[]>>("/api/v1/employees");
    return res.data ?? [];
  },

  /** GET /api/v1/employees/{id} */
  async getEmployeeById(id: number | string): Promise<Employee> {
    const res = await request<BackendResponse<Employee>>(`/api/v1/employees/${id}`);
    return res.data;
  },

  /** GET /api/v1/employees/company/{companyId} */
  async getEmployeesByCompany(companyId: number | string): Promise<Employee[]> {
    const res = await request<BackendResponse<Employee[]>>(
      `/api/v1/employees/company/${companyId}`,
    );
    return res.data ?? [];
  },

  /** GET /api/v1/employees/department/{departmentId} */
  async getEmployeesByDepartment(departmentId: number | string): Promise<Employee[]> {
    const res = await request<BackendResponse<Employee[]>>(
      `/api/v1/employees/department/${departmentId}`,
    );
    return res.data ?? [];
  },

  /** POST /api/v1/employees */
  async createEmployee(payload: EmployeeRequest): Promise<Employee> {
    const res = await request<BackendResponse<Employee>>("/api/v1/employees", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  /** PUT /api/v1/employees/{id} */
  async updateEmployee(id: number | string, payload: EmployeeRequest): Promise<Employee> {
    const res = await request<BackendResponse<Employee>>(`/api/v1/employees/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    return res.data;
  },
};
