import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Building2,
  Plus,
  Loader2,
  Filter,
  Layers,
  MapPin,
  Eye,
  Edit,
  Search,
  RotateCcw,
} from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { DataTable, type Column } from "@/components/common/DataTable";
import { StatusBadge } from "@/components/common/StatusBadge";
import { InlineLoader, EmptyState } from "@/components/common/states";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { siteService, type SiteRequest } from "@/services/siteService";
import { projectService } from "@/services/projectService";
import type { Site, Project } from "@/types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface SiteFormState {
  projectId: string;
  code: string;
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  status: "ACTIVE" | "INACTIVE";
}

const initialFormState: SiteFormState = {
  projectId: "",
  code: "",
  name: "",
  address: "",
  city: "Pune",
  state: "Maharashtra",
  pincode: "",
  status: "ACTIVE",
};

export function SitesPage() {
  const [sites, setSites] = useState<Site[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectFilter, setSelectedProjectFilter] = useState<string>("all");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // Modals
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editingSite, setEditingSite] = useState<Site | null>(null);
  const [viewingSite, setViewingSite] = useState<Site | null>(null);
  const [formData, setFormData] = useState<SiteFormState>(initialFormState);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Load real projects from backend
  const fetchProjects = useCallback(async () => {
    try {
      const data = await projectService.getProjects();
      setProjects(data);
      return data;
    } catch (err) {
      console.error("Failed to load projects:", err);
      return [];
    }
  }, []);

  // Load sites from backend (optionally filtered by project)
  const fetchSites = useCallback(
    async (projectIdFilter = selectedProjectFilter) => {
      try {
        setLoading(true);
        let data: Site[];
        if (projectIdFilter === "all" || !projectIdFilter) {
          data = await siteService.getSites();
        } else {
          data = await siteService.getSitesByProject(Number(projectIdFilter));
        }
        setSites(data);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to load sites");
      } finally {
        setLoading(false);
      }
    },
    [selectedProjectFilter],
  );

  useEffect(() => {
    void fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    void fetchSites(selectedProjectFilter);
  }, [selectedProjectFilter, fetchSites]);

  // Project lookup map
  const projectMap = useMemo(() => {
    const map = new Map<number | string, Project>();
    for (const p of projects) {
      map.set(Number(p.id), p);
      map.set(String(p.id), p);
    }
    return map;
  }, [projects]);

  // Filtered sites for search and status
  const filteredSites = useMemo(() => {
    return sites.filter((site) => {
      // Status filter
      if (selectedStatusFilter !== "all") {
        const siteStatus = (site.status || "ACTIVE").toUpperCase();
        if (siteStatus !== selectedStatusFilter) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const p = projectMap.get(site.projectId);
        const matchCode = site.code?.toLowerCase().includes(q);
        const matchName = site.name?.toLowerCase().includes(q);
        const matchCity = site.city?.toLowerCase().includes(q);
        const matchAddress = site.address?.toLowerCase().includes(q);
        const matchProject =
          p?.name?.toLowerCase().includes(q) || p?.code?.toLowerCase().includes(q);

        return matchCode || matchName || matchCity || matchAddress || matchProject;
      }

      return true;
    });
  }, [sites, selectedStatusFilter, searchQuery, projectMap]);

  // Active filters check
  const hasActiveFilters =
    searchQuery.trim() !== "" || selectedProjectFilter !== "all" || selectedStatusFilter !== "all";

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedProjectFilter("all");
    setSelectedStatusFilter("all");
  };

  // Open Create Dialog
  const handleOpenCreate = () => {
    setEditingSite(null);
    setFormData({
      ...initialFormState,
      projectId:
        selectedProjectFilter !== "all" && selectedProjectFilter
          ? selectedProjectFilter
          : projects[0]
            ? String(projects[0].id)
            : "",
    });
    setFormErrors({});
    setDialogOpen(true);
  };

  // Open Edit Dialog
  const handleOpenEdit = (site: Site) => {
    setEditingSite(site);
    setFormData({
      projectId: String(site.projectId),
      code: site.code,
      name: site.name,
      address: site.address ?? "",
      city: site.city ?? "Pune",
      state: site.state ?? "Maharashtra",
      pincode: site.pincode ?? "",
      status: (site.status as "ACTIVE" | "INACTIVE") ?? "ACTIVE",
    });
    setFormErrors({});
    setDialogOpen(true);
  };

  // Open View Dialog
  const handleOpenView = (site: Site) => {
    setViewingSite(site);
    setViewDialogOpen(true);
  };

  // Validate form
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.projectId) errors["projectId"] = "Please select a Project";
    if (!formData.code.trim()) errors["code"] = "Site Code is required";
    if (!formData.name.trim()) errors["name"] = "Site Name is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle Save
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload: SiteRequest = {
      projectId: Number(formData.projectId),
      code: formData.code.trim().toUpperCase(),
      name: formData.name.trim(),
      address: formData.address.trim() || undefined,
      city: formData.city.trim() || undefined,
      state: formData.state.trim() || undefined,
      pincode: formData.pincode.trim() || undefined,
      status: formData.status,
    };

    try {
      setSubmitting(true);
      if (editingSite) {
        await siteService.updateSite(editingSite.id, payload);
        toast.success(`Site "${payload.name}" updated successfully`);
      } else {
        await siteService.createSite(payload);
        toast.success(`Site "${payload.name}" created successfully`);
      }
      setDialogOpen(false);
      await fetchSites(selectedProjectFilter);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save site");
    } finally {
      setSubmitting(false);
    }
  };

  // Table columns
  const columns: Column<Site>[] = [
    {
      key: "code",
      header: "Site Code",
      className: "w-36 font-mono text-xs font-semibold text-primary",
      render: (site) => (
        <span className="font-mono text-xs font-semibold text-primary">{site.code}</span>
      ),
    },
    {
      key: "name",
      header: "Site Name",
      render: (site) => (
        <div>
          <p className="font-medium text-foreground">{site.name}</p>
          {site.city && (
            <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
              <MapPin className="size-3 text-muted-foreground/70" />
              {site.city}
              {site.state ? `, ${site.state}` : ""}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "project",
      header: "Project",
      render: (site) => {
        const p = projectMap.get(site.projectId);
        return p ? (
          <div className="flex flex-col">
            <span className="font-medium text-foreground text-xs">{p.name}</span>
            <span className="font-mono text-[11px] text-muted-foreground">{p.code}</span>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">Project #{site.projectId}</span>
        );
      },
    },
    {
      key: "location",
      header: "Address / Pincode",
      render: (site) => (
        <span className="text-xs text-muted-foreground">
          {site.address ? `${site.address}` : "—"}
          {site.pincode ? ` (${site.pincode})` : ""}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      className: "w-28",
      render: (site) => <StatusBadge value={site.status || "ACTIVE"} />,
    },
    {
      key: "actions",
      header: "Actions",
      className: "w-28 text-right",
      render: (site) => (
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            title="View Details"
            onClick={() => handleOpenView(site)}
          >
            <Eye className="size-3.5" />
            <span className="sr-only">View</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            title="Edit Site"
            onClick={() => handleOpenEdit(site)}
          >
            <Edit className="size-3.5" />
            <span className="sr-only">Edit</span>
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Sites"
        description="Manage physical construction sites, plots, and execution locations linked to enterprise projects."
        breadcrumbs={[{ label: "Administration" }, { label: "Sites" }]}
        actions={
          <Button size="sm" onClick={handleOpenCreate} className="gap-1.5 text-xs">
            <Plus className="size-3.5" /> Add Site
          </Button>
        }
      />

      {/* KPI Top Cards */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Sites"
          value={String(sites.length)}
          hint="Active physical site locations"
          icon={Building2}
        />
        <StatCard
          label="Active Sites"
          value={String(sites.filter((s) => (s.status || "ACTIVE") === "ACTIVE").length)}
          hint="Sites in active construction"
          icon={Building2}
          tone="success"
        />
        <StatCard
          label="Linked Projects"
          value={String(new Set(sites.map((s) => s.projectId)).size)}
          hint="Projects with active site footprints"
          icon={Layers}
          tone="info"
        />
        <StatCard
          label="Cities Coverage"
          value={String(new Set(sites.map((s) => s.city).filter(Boolean)).size)}
          hint="Geographical execution centers"
          icon={MapPin}
          tone="warning"
        />
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-xl border bg-card p-3 shadow-card space-y-2.5">
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Query Input */}
          <div className="relative min-w-[220px] flex-1">
            <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by site name, code, city, or project..."
              className="h-8.5 pl-8 text-xs"
            />
          </div>

          {/* Project Filter */}
          <div className="flex items-center gap-1.5">
            <Select value={selectedProjectFilter} onValueChange={setSelectedProjectFilter}>
              <SelectTrigger className="h-8.5 w-auto min-w-[170px] text-xs">
                <Layers className="mr-1.5 size-3.5 text-muted-foreground" />
                <SelectValue placeholder="All Projects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">
                  All Projects
                </SelectItem>
                {projects.map((p) => (
                  <SelectItem key={p.id} value={String(p.id)} className="text-xs">
                    {p.name} ({p.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
          <Select value={selectedStatusFilter} onValueChange={setSelectedStatusFilter}>
            <SelectTrigger className="h-8.5 w-auto min-w-[130px] text-xs">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">
                All Statuses
              </SelectItem>
              <SelectItem value="ACTIVE" className="text-xs">
                Active
              </SelectItem>
              <SelectItem value="INACTIVE" className="text-xs">
                Inactive
              </SelectItem>
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetFilters}
              className="h-8.5 px-2 text-xs text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="mr-1 size-3" /> Reset
            </Button>
          )}

          <span className="ml-auto text-[11px] text-muted-foreground">
            Showing{" "}
            <strong className="font-semibold text-foreground">{filteredSites.length}</strong> of{" "}
            {sites.length} site(s)
          </span>
        </div>
      </div>

      {/* Main Table Content */}
      <div className="rounded-xl border bg-card p-2 shadow-card">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <InlineLoader label="Loading sites from backend" />
          </div>
        ) : filteredSites.length === 0 ? (
          <EmptyState
            title="No sites found"
            description={
              hasActiveFilters
                ? "Try adjusting your search criteria or clearing filters."
                : "No construction sites have been created yet. Click 'Add Site' to link a new site to a project."
            }
            action={
              hasActiveFilters ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleResetFilters}
                  className="mt-2 text-xs"
                >
                  Reset Filters
                </Button>
              ) : (
                <Button size="sm" onClick={handleOpenCreate} className="mt-2 text-xs">
                  <Plus className="mr-1 size-3" /> Add First Site
                </Button>
              )
            }
          />
        ) : (
          <DataTable
            rows={filteredSites}
            columns={columns}
            getId={(s) => String(s.id)}
            pageSize={10}
            onRowClick={handleOpenView}
            emptyTitle="No sites match criteria"
          />
        )}
      </div>

      {/* Create / Edit Site Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
          <form onSubmit={handleSave}>
            <DialogHeader>
              <DialogTitle className="text-base font-semibold">
                {editingSite ? "Edit Site" : "Add New Site"}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                {editingSite
                  ? "Update site details and location parameters."
                  : "Link a physical execution site to a master project."}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3.5 py-3">
              {/* Project Selection */}
              <div>
                <Label htmlFor="site-project" className="text-xs">
                  Project <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.projectId}
                  onValueChange={(val) => {
                    setFormData((prev) => ({ ...prev, projectId: val }));
                    setFormErrors((prev) => ({ ...prev, projectId: "" }));
                  }}
                >
                  <SelectTrigger
                    id="site-project"
                    className={cn(
                      "mt-1 h-8.5 text-xs",
                      formErrors["projectId"] && "border-destructive",
                    )}
                  >
                    <SelectValue placeholder="Select linked Project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((p) => (
                      <SelectItem key={p.id} value={String(p.id)} className="text-xs">
                        {p.name} ({p.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors["projectId"] && (
                  <p className="mt-1 text-[11px] text-destructive">{formErrors["projectId"]}</p>
                )}
              </div>

              {/* Code & Name */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="site-code" className="text-xs">
                    Site Code <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="site-code"
                    value={formData.code}
                    onChange={(e) => {
                      setFormData((prev) => ({ ...prev, code: e.target.value.toUpperCase() }));
                      setFormErrors((prev) => ({ ...prev, code: "" }));
                    }}
                    placeholder="e.g. STE-001"
                    className={cn(
                      "mt-1 h-8.5 font-mono text-xs uppercase",
                      formErrors["code"] && "border-destructive",
                    )}
                  />
                  {formErrors["code"] && (
                    <p className="mt-1 text-[11px] text-destructive">{formErrors["code"]}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="site-status" className="text-xs">
                    Status
                  </Label>
                  <Select
                    value={formData.status}
                    onValueChange={(val: "ACTIVE" | "INACTIVE") =>
                      setFormData((prev) => ({ ...prev, status: val }))
                    }
                  >
                    <SelectTrigger id="site-status" className="mt-1 h-8.5 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE" className="text-xs">
                        Active
                      </SelectItem>
                      <SelectItem value="INACTIVE" className="text-xs">
                        Inactive
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="site-name" className="text-xs">
                  Site Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="site-name"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, name: e.target.value }));
                    setFormErrors((prev) => ({ ...prev, name: "" }));
                  }}
                  placeholder="e.g. Baner North Tower Plot Site"
                  className={cn("mt-1 h-8.5 text-xs", formErrors["name"] && "border-destructive")}
                />
                {formErrors["name"] && (
                  <p className="mt-1 text-[11px] text-destructive">{formErrors["name"]}</p>
                )}
              </div>

              {/* Address */}
              <div>
                <Label htmlFor="site-address" className="text-xs">
                  Address / Plot Details
                </Label>
                <Input
                  id="site-address"
                  value={formData.address}
                  onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
                  placeholder="e.g. Survey No. 45/2, Near Expressway Junction"
                  className="mt-1 h-8.5 text-xs"
                />
              </div>

              {/* City, State, Pincode */}
              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <Label htmlFor="site-city" className="text-xs">
                    City
                  </Label>
                  <Input
                    id="site-city"
                    value={formData.city}
                    onChange={(e) => setFormData((prev) => ({ ...prev, city: e.target.value }))}
                    className="mt-1 h-8.5 text-xs"
                  />
                </div>
                <div>
                  <Label htmlFor="site-state" className="text-xs">
                    State
                  </Label>
                  <Input
                    id="site-state"
                    value={formData.state}
                    onChange={(e) => setFormData((prev) => ({ ...prev, state: e.target.value }))}
                    className="mt-1 h-8.5 text-xs"
                  />
                </div>
                <div>
                  <Label htmlFor="site-pincode" className="text-xs">
                    Pincode
                  </Label>
                  <Input
                    id="site-pincode"
                    value={formData.pincode}
                    onChange={(e) => setFormData((prev) => ({ ...prev, pincode: e.target.value }))}
                    placeholder="411045"
                    className="mt-1 h-8.5 text-xs"
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" className="text-xs" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-1.5 size-3.5 animate-spin" /> Saving...
                  </>
                ) : editingSite ? (
                  "Save Changes"
                ) : (
                  "Create Site"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Site Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">Site Details</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Master details and project alignment.
            </DialogDescription>
          </DialogHeader>

          {viewingSite && (
            <div className="space-y-3.5 py-2">
              <div className="flex items-start justify-between border-b pb-3">
                <div>
                  <span className="font-mono text-xs font-semibold text-primary">
                    {viewingSite.code}
                  </span>
                  <h3 className="text-sm font-semibold text-foreground mt-0.5">
                    {viewingSite.name}
                  </h3>
                </div>
                <StatusBadge value={viewingSite.status || "ACTIVE"} />
              </div>

              {/* Linked Project info */}
              <div className="rounded-lg border bg-muted/40 p-2.5 text-xs space-y-1">
                <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                  Linked Project
                </span>
                {(() => {
                  const p = projectMap.get(viewingSite.projectId);
                  return p ? (
                    <div>
                      <p className="font-semibold text-foreground">{p.name}</p>
                      <p className="text-[11px] text-muted-foreground font-mono">
                        {p.code} • {p.type}
                      </p>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Project ID #{viewingSite.projectId}</p>
                  );
                })()}
              </div>

              {/* Location details */}
              <div className="space-y-1.5 text-xs">
                <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                  Location Information
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground text-[11px]">Address</span>
                    <p className="font-medium text-foreground">{viewingSite.address || "—"}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-[11px]">City / State</span>
                    <p className="font-medium text-foreground">
                      {viewingSite.city || "—"}
                      {viewingSite.state ? `, ${viewingSite.state}` : ""}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-[11px]">Pincode</span>
                    <p className="font-medium text-foreground">{viewingSite.pincode || "—"}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-[11px]">Status</span>
                    <p className="font-medium text-foreground">{viewingSite.status || "ACTIVE"}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => setViewDialogOpen(false)}
            >
              Close
            </Button>
            {viewingSite && (
              <Button
                type="button"
                size="sm"
                className="text-xs"
                onClick={() => {
                  setViewDialogOpen(false);
                  handleOpenEdit(viewingSite);
                }}
              >
                <Edit className="mr-1.5 size-3.5" /> Edit Site
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
