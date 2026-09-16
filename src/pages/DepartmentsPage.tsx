import { useState, useEffect, useCallback, useMemo } from "react";
import { Plus, Network, Building2, Loader2, Filter } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { DataTable, type Column } from "@/components/common/DataTable";
import { StatusBadge } from "@/components/common/StatusBadge";
import { InlineLoader } from "@/components/common/states";
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
import { companyService } from "@/services/companyService";
import { departmentService, type DepartmentRequest } from "@/services/departmentService";
import type { Company, Department } from "@/types";
import { toast } from "sonner";

interface DepartmentFormState {
  companyId: string;
  code: string;
  name: string;
}

const initialFormState: DepartmentFormState = {
  companyId: "",
  code: "",
  name: "",
};

export function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyFilter, setSelectedCompanyFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [viewingDepartment, setViewingDepartment] = useState<Department | null>(null);
  const [formData, setFormData] = useState<DepartmentFormState>(initialFormState);
  const [submitting, setSubmitting] = useState(false);

  // Load companies
  const fetchCompanies = useCallback(async () => {
    try {
      const data = await companyService.getCompanies();
      setCompanies(data);
      return data;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load companies");
      return [];
    }
  }, []);

  // Load departments based on company filter
  const fetchDepartments = useCallback(
    async (companyIdFilter = selectedCompanyFilter) => {
      try {
        setLoading(true);
        let data: Department[];
        if (companyIdFilter === "all" || !companyIdFilter) {
          data = await departmentService.getDepartments();
        } else {
          data = await departmentService.getDepartmentsByCompany(Number(companyIdFilter));
        }
        setDepartments(data);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to load departments");
      } finally {
        setLoading(false);
      }
    },
    [selectedCompanyFilter],
  );

  useEffect(() => {
    void fetchCompanies();
  }, [fetchCompanies]);

  useEffect(() => {
    void fetchDepartments(selectedCompanyFilter);
  }, [selectedCompanyFilter, fetchDepartments]);

  const companyMap = useMemo(() => {
    const map = new Map<number | string, Company>();
    for (const c of companies) {
      map.set(Number(c.id), c);
      map.set(String(c.id), c);
    }
    return map;
  }, [companies]);

  const handleOpenCreate = () => {
    setEditingCompanySelection();
  };

  const setEditingCompanySelection = () => {
    setEditingDepartment(null);
    const defaultCompanyId =
      selectedCompanyFilter !== "all" && selectedCompanyFilter
        ? selectedCompanyFilter
        : companies.length > 0
          ? String(companies[0]?.id)
          : "";

    setFormData({
      companyId: defaultCompanyId,
      code: "",
      name: "",
    });
    setDialogOpen(true);
  };

  const handleOpenEdit = (dept: Department) => {
    setEditingDepartment(dept);
    setFormData({
      companyId: String(dept.companyId),
      code: dept.code ?? "",
      name: dept.name ?? "",
    });
    setDialogOpen(true);
  };

  const handleOpenView = (dept: Department) => {
    setViewingDepartment(dept);
    setViewDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numCompanyId = Number(formData.companyId);
    if (!numCompanyId || isNaN(numCompanyId)) {
      toast.error("Please select a valid company");
      return;
    }
    if (!formData.code.trim()) {
      toast.error("Department Code is required");
      return;
    }
    if (!formData.name.trim()) {
      toast.error("Department Name is required");
      return;
    }

    setSubmitting(true);
    const payload: DepartmentRequest = {
      companyId: numCompanyId,
      code: formData.code.trim(),
      name: formData.name.trim(),
    };

    try {
      if (editingDepartment) {
        await departmentService.updateDepartment(editingDepartment.id, payload);
        toast.success("Department updated successfully");
      } else {
        await departmentService.createDepartment(payload);
        toast.success("Department created successfully");
      }
      setDialogOpen(false);
      await fetchDepartments(selectedCompanyFilter);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save department");
    } finally {
      setSubmitting(false);
    }
  };

  const columns: Column<Department>[] = useMemo(
    () => [
      {
        key: "code",
        header: "Dept Code",
        render: (r) => <span className="font-semibold text-primary">{r.code || "—"}</span>,
      },
      {
        key: "name",
        header: "Department Name",
        render: (r) => <span className="font-medium">{r.name}</span>,
      },
      {
        key: "companyId",
        header: "Company",
        render: (r) => {
          const comp = companyMap.get(r.companyId);
          return (
            <span className="inline-flex items-center gap-1.5 text-xs">
              <Building2 className="size-3 text-muted-foreground" />
              {comp?.name || `Company #${r.companyId}`}
            </span>
          );
        },
      },
      {
        key: "status",
        header: "Status",
        align: "center",
        render: (r) => <StatusBadge value={r.status || "Active"} />,
      },
    ],
    [companyMap],
  );

  const activeCount = departments.filter((d) => d.status === "ACTIVE" || !d.status).length;
  const linkedCompanyIds = new Set(departments.map((d) => d.companyId));

  return (
    <>
      <PageHeader
        title="Departments"
        description="Departmental hierarchy, operational divisions and cost centers."
        breadcrumbs={[{ label: "Administration" }, { label: "Departments" }]}
        actions={
          <Button size="sm" className="gap-1.5" onClick={handleOpenCreate}>
            <Plus className="size-3.5" /> Add Department
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Departments"
          value={String(departments.length)}
          hint="Across selected view"
          icon={Network}
        />
        <StatCard
          label="Active Departments"
          value={String(activeCount)}
          tone="success"
          hint="Operational divisions"
        />
        <StatCard
          label="Linked Companies"
          value={String(linkedCompanyIds.size)}
          tone="info"
          hint="Entities with departments"
        />
      </div>

      {/* Filter toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card p-3 shadow-card">
        <div className="flex items-center gap-2">
          <Filter className="size-4 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground">Filter by Company:</span>
          <Select
            value={selectedCompanyFilter}
            onValueChange={(val) => setSelectedCompanyFilter(val)}
          >
            <SelectTrigger className="h-8 w-[240px] text-xs">
              <SelectValue placeholder="All Companies" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Companies</SelectItem>
              {companies.map((c) => (
                <SelectItem key={String(c.id)} value={String(c.id)}>
                  {c.code ? `[${c.code}] ` : ""}
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <span className="text-xs text-muted-foreground">
          Showing {departments.length} {departments.length === 1 ? "department" : "departments"}
        </span>
      </div>

      {loading ? (
        <div className="flex min-h-[250px] items-center justify-center rounded-xl border bg-card p-10">
          <InlineLoader label="Loading departments from server" />
        </div>
      ) : (
        <DataTable
          title="Department Master"
          rows={departments}
          columns={columns}
          getId={(r) => String(r.id)}
          searchKeys={(r) => {
            const comp = companyMap.get(r.companyId);
            return `${r.code ?? ""} ${r.name} ${comp?.name ?? ""}`;
          }}
          rowActions={(r) => [
            { label: "View", onSelect: () => handleOpenView(r) },
            { label: "Edit", onSelect: () => handleOpenEdit(r) },
          ]}
          onRowClick={(r) => handleOpenView(r)}
        />
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingDepartment ? "Edit Department" : "Add Department"}</DialogTitle>
            <DialogDescription>
              {editingDepartment
                ? `Update details for department ${editingDepartment.code}`
                : "Create a new department under a registered company."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="companyId">Company *</Label>
                <Select
                  value={formData.companyId}
                  onValueChange={(val) => setFormData({ ...formData, companyId: val })}
                  disabled={submitting}
                >
                  <SelectTrigger id="companyId" className="w-full">
                    <SelectValue placeholder="Select a company" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((c) => (
                      <SelectItem key={String(c.id)} value={String(c.id)}>
                        {c.code ? `[${c.code}] ` : ""}
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-[11px] text-muted-foreground">
                  Database company ID: {formData.companyId || "None selected"}
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="deptCode">Department Code *</Label>
                <Input
                  id="deptCode"
                  placeholder="e.g. PROC, HR, ACCT"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  disabled={submitting}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="deptName">Department Name *</Label>
                <Input
                  id="deptName"
                  placeholder="e.g. Procurement & Purchase"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={submitting}
                  required
                />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting} className="gap-2">
                {submitting ? <Loader2 className="size-4 animate-spin" /> : null}
                {editingDepartment ? "Update Department" : "Create Department"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Department Details</DialogTitle>
            <DialogDescription>
              {viewingDepartment?.name} ({viewingDepartment?.code || "—"})
            </DialogDescription>
          </DialogHeader>

          {viewingDepartment && (
            <div className="space-y-3 py-2 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-xs text-muted-foreground block">Code</span>
                  <span className="font-semibold">{viewingDepartment.code || "—"}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Status</span>
                  <StatusBadge value={viewingDepartment.status || "Active"} />
                </div>
              </div>

              <div>
                <span className="text-xs text-muted-foreground block">Department Name</span>
                <span className="font-medium">{viewingDepartment.name}</span>
              </div>

              <div>
                <span className="text-xs text-muted-foreground block">Parent Company</span>
                <span className="font-medium text-primary">
                  {companyMap.get(viewingDepartment.companyId)?.name ||
                    `Company ID: ${viewingDepartment.companyId}`}
                </span>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              Close
            </Button>
            {viewingDepartment && (
              <Button
                onClick={() => {
                  setViewDialogOpen(false);
                  handleOpenEdit(viewingDepartment);
                }}
              >
                Edit
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
