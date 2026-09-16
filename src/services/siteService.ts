import { request, type BackendResponse } from "@/services/http";
import type { Site, SiteRequest } from "@/types";

export type { SiteRequest };

export const siteService = {
  /** GET /api/v1/sites */
  async getSites(): Promise<Site[]> {
    const res = await request<BackendResponse<Site[]>>("/api/v1/sites");
    return res.data ?? [];
  },

  /** GET /api/v1/sites/{id} */
  async getSiteById(id: number | string): Promise<Site> {
    const res = await request<BackendResponse<Site>>(`/api/v1/sites/${id}`);
    return res.data;
  },

  /** GET /api/v1/sites/project/{projectId} */
  async getSitesByProject(projectId: number | string): Promise<Site[]> {
    const res = await request<BackendResponse<Site[]>>(`/api/v1/sites/project/${projectId}`);
    return res.data ?? [];
  },

  /** POST /api/v1/sites */
  async createSite(payload: SiteRequest): Promise<Site> {
    const res = await request<BackendResponse<Site>>("/api/v1/sites", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  /** PUT /api/v1/sites/{id} */
  async updateSite(id: number | string, payload: SiteRequest): Promise<Site> {
    const res = await request<BackendResponse<Site>>(`/api/v1/sites/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    return res.data;
  },
};
