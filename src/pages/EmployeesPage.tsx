import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Plus,
  Users,
  Building2,
  Network,
  Loader2,
  Filter,
  Mail,
  Phone,
  Calendar,
  Briefcase,
} from "lucide-react";
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
import { departmentService } from "@/services/departmentService";
import { employeeService, type EmployeeRequest } from "@/services/employeeService";
import type { Company, Department, Employee } from "@/types";
import { formatDate } from "@/utils/format";
import { toast } from "sonner";

interface EmployeeFormState {
  companyId: string;
  departmentId: string;
  employeeCode: string;
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  mobile: string;
  joiningDate: string;
  designation: string;
}

const initialFormState: EmployeeFormState = {
  companyId: "",
  departmentId: "none",
  employeeCode: "",
  firstName: "",
  middleName: "",
  lastName: "",
  email: "",
  mobile: "",
  joiningDate: "",
  designation: "",
};

export function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [formDepartments, setFormDepartments] = useState<Department[]>([]);

  const [selectedCompanyFilter, setSelectedCompanyFilter] = useState<string>("all");
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>("all");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("all");

  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [viewingEmployee, setViewingEmployee] = useState<Employee | null>(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [formData, setFormData] = useState<EmployeeFormState>(initialFormState);
  const [submitting, setSubmitting] = useState(false);

  // 1. Fetch Companies
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

  // 2. Fetch Departments for filter dropdown
  const fetchFilterDepartments = useCallback(async (companyIdFilter: string) => {
    try {
      if (companyIdFilter === "all" || !companyIdFilter) {
        const data = await departmentService.getDepartments();
        setDepartments(data);
      } else {
        const data = await departmentService.getDepartmentsByCompany(Number(companyIdFilter));
        setDepartments(data);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load departments");
    }
  }, []);

  // 3. Fetch Employees based on company & department filters
  const fetchEmployees = useCallback(
    async (companyId = selectedCompanyFilter, deptId = selectedDeptFilter) => {
      try {
        setLoading(true);
        let data: Employee[];
        if (deptId !== "all" && deptId) {
          // Scoped by department
          data = await employeeService.getEmployeesByDepartment(Number(deptId));
        } else if (companyId !== "all" && companyId) {
          // Scoped by company
          data = await employeeService.getEmployeesByCompany(Number(companyId));
        } else {
          // All employees
          data = await employeeService.getEmployees();
        }
        setEmployees(data);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to load employees");
      } finally {
        setLoading(false);
      }
    },
    [selectedCompanyFilter, selectedDeptFilter],
  );

  // Initial load
  useEffect(() => {
    void fetchCompanies();
  }, [fetchCompanies]);

  // When company filter changes: reload departments & reset dept filter to "all"
  useEffect(() => {
    void fetchFilterDepartments(selectedCompanyFilter);
  }, [selectedCompanyFilter, fetchFilterDepartments]);

  // When filters change: fetch employees
  useEffect(() => {
    void fetchEmployees(selectedCompanyFilter, selectedDeptFilter);
  }, [selectedCompanyFilter, selectedDeptFilter, fetchEmployees]);

  // Fetch departments for the Create/Edit form when formData.companyId changes
  useEffect(() => {
    if (formData.companyId && formData.companyId !== "") {
      void departmentService
        .getDepartmentsByCompany(Number(formData.companyId))
        .then((depts) => {
          setFormDepartments(depts);
        })
        .catch(() => setFormDepartments([]));
    } else {
      setFormDepartments([]);
    }
  }, [formData.companyId]);

  // Company and Department Maps for lookup
  const companyMap = useMemo(() => {
    const map = new Map<number | string, Company>();
    for (const c of companies) {
      map.set(Number(c.id), c);
      map.set(String(c.id), c);
    }
    return map;
  }, [companies]);

  const departmentMap = useMemo(() => {
    const map = new Map<number | string, Department>();
    for (const d of [...departments, ...formDepartments]) {
      map.set(Number(d.id), d);
      map.set(String(d.id), d);
    }
    return map;
  }, [departments, formDepartments]);

  // Open Create Dialog
  const handleOpenCreate = () => {
    setEditingEmployee(null);
    const defaultCompanyId =
      selectedCompanyFilter !== "all" && selectedCompanyFilter
        ? selectedCompanyFilter
        : companies.length > 0
          ? String(companies[0]?.id)
          : "";

    setFormData({
      companyId: defaultCompanyId,
      departmentId: "none",
      employeeCode: "",
      firstName: "",
      middleName: "",
      lastName: "",
      email: "",
      mobile: "",
      joiningDate: "",
      designation: "",
    });
    setDialogOpen(true);
  };

  // Open Edit Dialog
  const handleOpenEdit = (emp: Employee) => {
    setEditingEmployee(emp);
    setFormData({
      companyId: String(emp.companyId),
      departmentId: emp.departmentId ? String(emp.departmentId) : "none",
      employeeCode: emp.employeeCode ?? "",
      firstName: emp.firstName ?? "",
      middleName: emp.middleName ?? "",
      lastName: emp.lastName ?? "",
      email: emp.email ?? "",
      mobile: emp.mobile ?? "",
      joiningDate: emp.joiningDate ? emp.joiningDate.slice(0, 10) : "",
      designation: emp.designation ?? "",
    });
    setDialogOpen(true);
  };

  // Open View Dialog
  const handleOpenView = async (emp: Employee) => {
    setViewDialogOpen(true);
    setViewLoading(true);
    try {
      const fresh = await employeeService.getEmployeeById(emp.id);
      setViewingEmployee(fresh);
    } catch {
      setViewingEmployee(emp);
    } finally {
      setViewLoading(false);
    }
  };

  // Handle Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numCompanyId = Number(formData.companyId);
    if (!numCompanyId || isNaN(numCompanyId)) {
      toast.error("Please select a valid company");
      return;
    }
    if (!formData.employeeCode.trim()) {
      toast.error("Employee Code is required");
      return;
    }
    if (!formData.firstName.trim()) {
      toast.error("First Name is required");
      return;
    }
    if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      toast.error("Please enter a valid email address");
      return;
    }

    setSubmitting(true);
    const payload: EmployeeRequest = {
      companyId: numCompanyId,
      departmentId:
        formData.departmentId === "none" || !formData.departmentId
          ? null
          : Number(formData.departmentId),
      employeeCode: formData.employeeCode.trim(),
      firstName: formData.firstName.trim(),
      middleName: formData.middleName.trim() ? formData.middleName.trim() : null,
      lastName: formData.lastName.trim() ? formData.lastName.trim() : null,
      email: formData.email.trim() ? formData.email.trim() : null,
      mobile: formData.mobile.trim() ? formData.mobile.trim() : null,
      joiningDate: formData.joiningDate.trim() ? formData.joiningDate.trim() : null,
      designation: formData.designation.trim() ? formData.designation.trim() : null,
    };

    try {
      if (editingEmployee) {
        await employeeService.updateEmployee(editingEmployee.id, payload);
        toast.success("Employee updated successfully");
      } else {
        await employeeService.createEmployee(payload);
        toast.success("Employee created successfully");
      }
      setDialogOpen(false);
      await fetchEmployees(selectedCompanyFilter, selectedDeptFilter);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save employee");
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered employees for display
  const displayedEmployees = useMemo(() => {
    return employees.filter((emp) => {
      if (selectedStatusFilter !== "all") {
        const empStatus = emp.status?.toUpperCase() || "ACTIVE";
        if (empStatus !== selectedStatusFilter.toUpperCase()) {
          return false;
        }
      }
      return true;
    });
  }, [employees, selectedStatusFilter]);

  // Columns definition
  const columns: Column<Employee>[] = useMemo(
    () => [
      {
        key: "employeeCode",
        header: "Emp Code",
        render: (r) => <span className="font-semibold text-primary">{r.employeeCode || "—"}</span>,
      },
      {
        key: "firstName",
        header: "Full Name",
        render: (r) => {
          const fullName = [r.firstName, r.middleName, r.lastName].filter(Boolean).join(" ");
          return <span className="font-medium">{fullName || "—"}</span>;
        },
      },
      {
        key: "designation",
        header: "Designation",
        render: (r) => (
          <span className="text-xs text-muted-foreground">{r.designation || "—"}</span>
        ),
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
        key: "departmentId",
        header: "Department",
        render: (r) => {
          if (!r.departmentId) return <span className="text-muted-foreground text-xs">—</span>;
          const dept = departmentMap.get(r.departmentId);
          return (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium">
              <Network className="size-3 text-muted-foreground" />
              {dept?.name || `Dept #${r.departmentId}`}
            </span>
          );
        },
      },
      {
        key: "mobile",
        header: "Mobile",
        render: (r) => <span className="num text-xs">{r.mobile || "—"}</span>,
      },
      {
        key: "email",
        header: "Email",
        render: (r) => (
          <span className="text-xs text-muted-foreground truncate max-w-[160px] inline-block">
            {r.email || "—"}
          </span>
        ),
      },
      {
        key: "joiningDate",
        header: "Joining Date",
        render: (r) => (
          <span className="text-xs">{r.joiningDate ? formatDate(r.joiningDate) : "—"}</span>
        ),
      },
      {
        key: "status",
        header: "Status",
        align: "center",
        render: (r) => <StatusBadge value={r.status || "ACTIVE"} />,
      },
    ],
    [companyMap, departmentMap],
  );

  const activeCount = employees.filter(
    (e) => (e.status?.toUpperCase() || "ACTIVE") === "ACTIVE",
  ).length;
  const linkedDeptCount = new Set(employees.map((e) => e.departmentId).filter(Boolean)).size;
  const linkedCompanyCount = new Set(employees.map((e) => e.companyId)).size;

  return (
    <>
      <PageHeader
        title="Employee Master"
        description="Company-wide employee register across head office, departments and project sites."
        breadcrumbs={[{ label: "Payroll & HR" }, { label: "Employee Master" }]}
        actions={
          <Button size="sm" className="gap-1.5" onClick={handleOpenCreate}>
            <Plus className="size-3.5" /> Add Employee
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Employees"
          value={String(employees.length)}
          hint="Across selected view"
          icon={Users}
        />
        <StatCard
          label="Active Staff"
          value={String(activeCount)}
          tone="success"
          hint="Currently active headcount"
        />
        <StatCard
          label="Departments"
          value={String(linkedDeptCount)}
          tone="info"
          hint="Divisions with staff"
        />
        <StatCard
          label="Companies"
          value={String(linkedCompanyCount)}
          hint="Organizations represented"
        />
      </div>

      {/* Filter toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card p-3 shadow-card">
        <div className="flex flex-wrap items-center gap-2.5">
          <Filter className="size-4 text-muted-foreground" />

          {/* Company Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium text-muted-foreground">Company:</span>
            <Select
              value={selectedCompanyFilter}
              onValueChange={(val) => {
                setSelectedCompanyFilter(val);
                setSelectedDeptFilter("all");
              }}
            >
              <SelectTrigger className="h-8 w-[210px] text-xs">
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

          {/* Department Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium text-muted-foreground">Department:</span>
            <Select value={selectedDeptFilter} onValueChange={(val) => setSelectedDeptFilter(val)}>
              <SelectTrigger className="h-8 w-[210px] text-xs">
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((d) => (
                  <SelectItem key={String(d.id)} value={String(d.id)}>
                    {d.code ? `[${d.code}] ` : ""}
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium text-muted-foreground">Status:</span>
            <Select
              value={selectedStatusFilter}
              onValueChange={(val) => setSelectedStatusFilter(val)}
            >
              <SelectTrigger className="h-8 w-[140px] text-xs">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <span className="text-xs text-muted-foreground">
          Showing {displayedEmployees.length}{" "}
          {displayedEmployees.length === 1 ? "employee" : "employees"}
        </span>
      </div>

      {loading ? (
        <div className="flex min-h-[250px] items-center justify-center rounded-xl border bg-card p-10">
          <InlineLoader label="Loading employees from server" />
        </div>
      ) : (
        <DataTable
          title="Employee Directory"
          rows={displayedEmployees}
          columns={columns}
          getId={(r) => String(r.id)}
          searchKeys={(r) => {
            const comp = companyMap.get(r.companyId);
            const dept = r.departmentId ? departmentMap.get(r.departmentId) : undefined;
            const fullName = [r.firstName, r.middleName, r.lastName].filter(Boolean).join(" ");
            return `${r.employeeCode ?? ""} ${fullName} ${r.designation ?? ""} ${r.email ?? ""} ${r.mobile ?? ""} ${comp?.name ?? ""} ${dept?.name ?? ""}`;
          }}
          rowActions={(r) => [
            { label: "View Details", onSelect: () => void handleOpenView(r) },
            { label: "Edit", onSelect: () => handleOpenEdit(r) },
          ]}
          onRowClick={(r) => void handleOpenView(r)}
        />
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingEmployee ? "Edit Employee" : "Add Employee"}</DialogTitle>
            <DialogDescription>
              {editingEmployee
                ? `Update information for employee ${editingEmployee.employeeCode}`
                : "Create a new employee profile in the organizational directory."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-3">
              {/* Organization Assignment */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="companyId">Company *</Label>
                  <Select
                    value={formData.companyId}
                    onValueChange={(val) => {
                      setFormData({ ...formData, companyId: val, departmentId: "none" });
                    }}
                    disabled={submitting}
                  >
                    <SelectTrigger id="companyId" className="w-full">
                      <SelectValue placeholder="Select company" />
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
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="departmentId">Department</Label>
                  <Select
                    value={formData.departmentId}
                    onValueChange={(val) => setFormData({ ...formData, departmentId: val })}
                    disabled={submitting || formDepartments.length === 0}
                  >
                    <SelectTrigger id="departmentId" className="w-full">
                      <SelectValue
                        placeholder={
                          formDepartments.length ? "Select department" : "No departments"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None (General)</SelectItem>
                      {formDepartments.map((d) => (
                        <SelectItem key={String(d.id)} value={String(d.id)}>
                          {d.code ? `[${d.code}] ` : ""}
                          {d.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Code & Designation */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="empCode">Employee Code *</Label>
                  <Input
                    id="empCode"
                    placeholder="e.g. EMP-101"
                    value={formData.employeeCode}
                    onChange={(e) => setFormData({ ...formData, employeeCode: e.target.value })}
                    disabled={submitting}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="designation">Designation</Label>
                  <Input
                    id="designation"
                    placeholder="e.g. Senior Project Engineer"
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    disabled={submitting}
                  />
                </div>
              </div>

              {/* Name Details */}
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1.5">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    placeholder="First name"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    disabled={submitting}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="middleName">Middle Name</Label>
                  <Input
                    id="middleName"
                    placeholder="Middle name"
                    value={formData.middleName}
                    onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
                    disabled={submitting}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    placeholder="Last name"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    disabled={submitting}
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@buildcore.in"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={submitting}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="mobile">Mobile Number</Label>
                  <Input
                    id="mobile"
                    placeholder="e.g. 9876543210"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    disabled={submitting}
                  />
                </div>
              </div>

              {/* Joining Date */}
              <div className="space-y-1.5">
                <Label htmlFor="joiningDate">Joining Date</Label>
                <Input
                  id="joiningDate"
                  type="date"
                  value={formData.joiningDate}
                  onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                  disabled={submitting}
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
                {editingEmployee ? "Update Employee" : "Create Employee"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Employee Profile</DialogTitle>
            <DialogDescription>
              {viewingEmployee?.employeeCode} · System ID #{viewingEmployee?.id}
            </DialogDescription>
          </DialogHeader>

          {viewLoading ? (
            <div className="flex h-36 items-center justify-center">
              <InlineLoader label="Loading profile..." />
            </div>
          ) : viewingEmployee ? (
            <div className="space-y-4 py-2 text-sm">
              {/* Profile Card Summary */}
              <div className="flex items-center gap-3.5 rounded-lg border bg-muted/40 p-3">
                <span className="grid size-12 place-items-center rounded-xl bg-primary text-base font-bold text-primary-foreground">
                  {viewingEmployee.firstName?.[0]}
                  {viewingEmployee.lastName?.[0] || ""}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-foreground text-base">
                    {[
                      viewingEmployee.firstName,
                      viewingEmployee.middleName,
                      viewingEmployee.lastName,
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {viewingEmployee.designation || "Staff Member"}
                  </p>
                </div>
                <StatusBadge value={viewingEmployee.status || "ACTIVE"} />
              </div>

              {/* Organization Info */}
              <div className="space-y-2 rounded-lg border p-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Organization
                </p>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-muted-foreground block">Company:</span>
                    <span className="font-medium text-foreground">
                      {companyMap.get(viewingEmployee.companyId)?.name ||
                        `Company #${viewingEmployee.companyId}`}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Department:</span>
                    <span className="font-medium text-foreground">
                      {viewingEmployee.departmentId
                        ? departmentMap.get(viewingEmployee.departmentId)?.name ||
                          `Dept #${viewingEmployee.departmentId}`
                        : "—"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Contact & Employment */}
              <div className="space-y-2 rounded-lg border p-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Contact & Employment
                </p>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <Mail className="size-3.5 text-muted-foreground shrink-0" />
                    <span className="text-muted-foreground">Email:</span>
                    <span className="font-medium text-foreground truncate">
                      {viewingEmployee.email || "—"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="size-3.5 text-muted-foreground shrink-0" />
                    <span className="text-muted-foreground">Mobile:</span>
                    <span className="font-medium text-foreground">
                      {viewingEmployee.mobile || "—"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="size-3.5 text-muted-foreground shrink-0" />
                    <span className="text-muted-foreground">Joined:</span>
                    <span className="font-medium text-foreground">
                      {viewingEmployee.joiningDate ? formatDate(viewingEmployee.joiningDate) : "—"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase className="size-3.5 text-muted-foreground shrink-0" />
                    <span className="text-muted-foreground">Role:</span>
                    <span className="font-medium text-foreground">
                      {viewingEmployee.designation || "—"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              Close
            </Button>
            {viewingEmployee && (
              <Button
                onClick={() => {
                  setViewDialogOpen(false);
                  handleOpenEdit(viewingEmployee);
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
