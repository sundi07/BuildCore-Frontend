import { useState, useMemo, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowUpDown,
  Building2,
  Calendar,
  Filter,
  IndianRupee,
  Layers,
  LayoutGrid,
  ListFilter,
  MapPin,
  Plus,
  RotateCcw,
  Search,
  Table as TableIcon,
  TrendingUp,
  UserCheck,
  Edit,
  Loader2,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { ChartCard } from "@/components/common/ChartCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ProjectHealthBadge } from "@/components/projects/ProjectHealthBadge";
import { NewProjectModal } from "@/components/projects/NewProjectModal";
import { DataTable, type Column } from "@/components/common/DataTable";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { projectService } from "@/services/projectService";
import { companyService } from "@/services/companyService";
import { InlineLoader } from "@/components/common/states";
import { formatDate, formatINR, formatNumber } from "@/utils/format";
import type {
  Project,
  ProjectHealth,
  ProjectStatus,
  ProjectType,
  Company,
  ProjectRequest,
} from "@/types";
import { toast } from "sonner";

const axis = { fontSize: 11, fill: "var(--color-muted-foreground)" };
const tooltipStyle = {
  borderRadius: 8,
  border: "1px solid var(--color-border)",
  background: "var(--color-popover)",
  fontSize: 12,
};

export function ProjectsPage() {
  const navigate = useNavigate();
  const [newProjectOpen, setNewProjectOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");

  // Project and Company data from backend
  const [projectsList, setProjectsList] = useState<Project[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [companyFilter, setCompanyFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [healthFilter, setHealthFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [clientFilter, setClientFilter] = useState("all");
  const [pmFilter, setPmFilter] = useState("all");
  const [sortBy, setSortBy] = useState<
    "name" | "budget-desc" | "progress-desc" | "date" | "actual-desc"
  >("name");

  // Edit Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editFormData, setEditFormData] = useState<ProjectRequest>({
    companyId: 0,
    code: "",
    name: "",
    description: "",
    location: "",
    projectType: "Residential",
    startDate: "",
    expectedEndDate: "",
    actualEndDate: "",
  });
  const [editSubmitting, setEditSubmitting] = useState(false);

  const fetchCompanies = useCallback(async () => {
    try {
      const comps = await companyService.getCompanies();
      setCompanies(comps);
    } catch (err) {
      console.error("Failed to load companies:", err);
    }
  }, []);

  const fetchProjects = useCallback(async (companyIdNum?: number) => {
    try {
      setLoading(true);
      const data = await projectService.getProjects(companyIdNum);
      setProjectsList(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load projects");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchCompanies();
  }, [fetchCompanies]);

  useEffect(() => {
    const cId = companyFilter !== "all" ? Number(companyFilter) : undefined;
    void fetchProjects(cId);
  }, [companyFilter, fetchProjects]);

  function refreshProjects() {
    const cId = companyFilter !== "all" ? Number(companyFilter) : undefined;
    void fetchProjects(cId);
  }

  const handleOpenEdit = (p: Project) => {
    setEditingProject(p);
    const compId = p.companyId ?? (companies[0]?.id ? Number(companies[0].id) : 1);
    setEditFormData({
      companyId: Number(compId),
      code: p.code,
      name: p.name,
      description: p.description ?? "",
      location: p.location,
      projectType: p.projectType ?? p.type,
      startDate: p.startDate ?? "",
      expectedEndDate: p.expectedEndDate ?? p.expectedCompletion ?? "",
      actualEndDate: p.actualEndDate ?? "",
    });
    setEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingProject) return;
    if (!editFormData.name.trim() || !editFormData.code.trim()) {
      toast.error("Project Name and Code are required");
      return;
    }
    try {
      setEditSubmitting(true);
      await projectService.updateProject(editingProject.id, {
        ...editFormData,
        companyId: Number(editFormData.companyId),
      });
      toast.success("Project updated successfully!");
      setEditModalOpen(false);
      refreshProjects();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update project");
    } finally {
      setEditSubmitting(false);
    }
  };

  // Aggregate options for filter dropdowns
  const uniqueTypes = useMemo(() => {
    return Array.from(new Set(projectsList.map((p) => p.type))).filter(Boolean);
  }, [projectsList]);

  const uniqueClients = useMemo(() => {
    return Array.from(new Set(projectsList.map((p) => p.client))).filter(Boolean);
  }, [projectsList]);

  const uniquePMs = useMemo(() => {
    return Array.from(new Set(projectsList.map((p) => p.projectManager || p.siteEngineer))).filter(
      Boolean,
    );
  }, [projectsList]);

  const uniqueLocations = useMemo(() => {
    return Array.from(
      new Set(
        projectsList.map((p) => {
          const parts = p.location.split(",");
          return (parts[parts.length - 1] || p.location).trim();
        }),
      ),
    ).filter(Boolean);
  }, [projectsList]);

  // Filtered and Sorted Projects
  const filteredProjects = useMemo(() => {
    let result = [...projectsList];

    // Search query across name, code, client, location, PM
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.code.toLowerCase().includes(q) ||
          p.client.toLowerCase().includes(q) ||
          p.location.toLowerCase().includes(q) ||
          (p.projectManager || p.siteEngineer).toLowerCase().includes(q),
      );
    }

    // Type filter
    if (typeFilter !== "all") {
      result = result.filter((p) => p.type === typeFilter);
    }

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter((p) => p.status === statusFilter);
    }

    // Health filter
    if (healthFilter !== "all") {
      result = result.filter((p) => (p.health ?? "On Track") === healthFilter);
    }

    // Location filter
    if (locationFilter !== "all") {
      result = result.filter((p) =>
        p.location.toLowerCase().includes(locationFilter.toLowerCase()),
      );
    }

    // Client filter
    if (clientFilter !== "all") {
      result = result.filter((p) => p.client === clientFilter);
    }

    // PM filter
    if (pmFilter !== "all") {
      result = result.filter((p) => (p.projectManager || p.siteEngineer) === pmFilter);
    }

    // Company filter (client-side check in addition to backend company query)
    if (companyFilter !== "all") {
      result = result.filter((p) => p.companyId === Number(companyFilter));
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === "budget-desc") return b.budget - a.budget;
      if (sortBy === "progress-desc") return b.progress - a.progress;
      if (sortBy === "actual-desc") return b.actualCost - a.actualCost;
      if (sortBy === "date") return a.expectedCompletion.localeCompare(b.expectedCompletion);
      return a.name.localeCompare(b.name);
    });

    return result;
  }, [
    projectsList,
    searchQuery,
    companyFilter,
    typeFilter,
    statusFilter,
    healthFilter,
    locationFilter,
    clientFilter,
    pmFilter,
    sortBy,
  ]);

  const hasActiveFilters =
    searchQuery !== "" ||
    companyFilter !== "all" ||
    typeFilter !== "all" ||
    statusFilter !== "all" ||
    healthFilter !== "all" ||
    locationFilter !== "all" ||
    clientFilter !== "all" ||
    pmFilter !== "all";

  function handleResetFilters() {
    setSearchQuery("");
    setCompanyFilter("all");
    setTypeFilter("all");
    setStatusFilter("all");
    setHealthFilter("all");
    setLocationFilter("all");
    setClientFilter("all");
    setPmFilter("all");
    setSortBy("name");
  }

  // Portfolio metrics
  const totalValue = projectsList.reduce((s, p) => s + p.budget, 0);
  const totalActual = projectsList.reduce((s, p) => s + p.actualCost, 0);
  const activeCount = projectsList.filter((p) => p.status === "In Progress").length;
  const avgProgress =
    projectsList.length > 0
      ? Math.round(projectsList.reduce((s, p) => s + p.progress, 0) / projectsList.length)
      : 0;

  // Chart data formatted for cost performance in Cr
  const chartData = useMemo(() => {
    return projectsList.slice(0, 8).map((p) => ({
      name: p.code,
      fullName: p.name,
      budget: Number((p.budget / 10000000).toFixed(1)),
      actual: Number((p.actualCost / 10000000).toFixed(1)),
    }));
  }, [projectsList]);

  // DataTable columns definition
  const tableColumns: Column<Project>[] = [
    {
      key: "code",
      header: "Code",
      render: (p) => <span className="font-mono text-xs font-semibold text-primary">{p.code}</span>,
    },
    {
      key: "name",
      header: "Project Name",
      render: (p) => (
        <div>
          <p className="font-medium text-foreground">{p.name}</p>
          <p className="text-[11px] text-muted-foreground">
            {p.type} · {p.location}
          </p>
        </div>
      ),
    },
    {
      key: "client",
      header: "Client",
      render: (p) => <span className="text-xs text-muted-foreground">{p.client}</span>,
    },
    {
      key: "pm",
      header: "Project Manager",
      render: (p) => (
        <span className="text-xs font-medium">{p.projectManager || p.siteEngineer}</span>
      ),
    },
    {
      key: "dates",
      header: "Timeline",
      render: (p) => (
        <span className="text-xs text-muted-foreground">
          {formatDate(p.startDate)} → {formatDate(p.expectedCompletion)}
        </span>
      ),
    },
    {
      key: "progress",
      header: "Progress",
      render: (p) => (
        <div className="w-24">
          <div className="mb-1 flex justify-between text-[11px]">
            <span className="font-semibold">{p.progress}%</span>
          </div>
          <Progress value={p.progress} className="h-1.5" />
        </div>
      ),
    },
    {
      key: "budget",
      header: "Budget",
      render: (p) => (
        <span className="font-mono text-xs font-semibold">
          {formatINR(p.budget, { compact: true })}
        </span>
      ),
    },
    {
      key: "actualCost",
      header: "Actual Cost",
      render: (p) => (
        <span className="font-mono text-xs font-semibold text-amber-600 dark:text-amber-400">
          {formatINR(p.actualCost, { compact: true })}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (p) => <StatusBadge value={p.status} />,
    },
    {
      key: "health",
      header: "Health",
      render: (p) => <ProjectHealthBadge health={p.health ?? "On Track"} />,
    },
    {
      key: "actions",
      header: "Actions",
      className: "w-20 text-right",
      render: (p) => (
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs"
          onClick={(e) => {
            e.stopPropagation();
            handleOpenEdit(p);
          }}
        >
          <Edit className="mr-1 size-3" /> Edit
        </Button>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Projects"
        description="Portfolio of residential, commercial, infrastructure and industrial projects with live execution tracking."
        breadcrumbs={[{ label: "Projects" }]}
        actions={
          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center rounded-lg border bg-card p-0.5">
              <Button
                variant={viewMode === "cards" ? "secondary" : "ghost"}
                size="sm"
                className="h-7 px-2.5 text-xs"
                onClick={() => setViewMode("cards")}
                aria-label="Cards View"
              >
                <LayoutGrid className="mr-1 size-3.5" /> Cards
              </Button>
              <Button
                variant={viewMode === "table" ? "secondary" : "ghost"}
                size="sm"
                className="h-7 px-2.5 text-xs"
                onClick={() => setViewMode("table")}
                aria-label="Table View"
              >
                <TableIcon className="mr-1 size-3.5" /> Table
              </Button>
            </div>

            <Button size="sm" onClick={() => setNewProjectOpen(true)} className="text-xs">
              <Plus className="mr-1.5 size-3.5" /> New Project
            </Button>
          </div>
        }
      />

      {/* KPI Top Cards */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Active Projects"
          value={String(activeCount)}
          hint={`${projectsList.length} total across portfolio`}
          icon={Building2}
        />
        <StatCard
          label="Total Portfolio Budget"
          value={formatINR(totalValue, { compact: true })}
          hint={`Incurred: ${formatINR(totalActual, { compact: true })}`}
          icon={IndianRupee}
          tone="info"
        />
        <StatCard
          label="Average Progress"
          value={`${avgProgress}%`}
          progress={avgProgress}
          icon={TrendingUp}
          tone="success"
        />
        <StatCard
          label="Total Managed Sites"
          value={formatNumber(projectsList.reduce((s, p) => s + p.sites.length, 0))}
          hint={`${projectsList.filter((p) => p.health === "Delayed").length} delayed, ${projectsList.filter((p) => p.health === "At Risk").length} at risk`}
          icon={Layers}
        />
      </div>

      {/* Cost Performance Bar Chart */}
      <ChartCard
        title="Project Cost Performance"
        subtitle="Budget vs actual cost incurred, ₹ Crore"
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ ...axis, fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis tick={axis} axisLine={false} tickLine={false} unit=" Cr" />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(val) => [`₹${val} Cr`, ""]}
              labelFormatter={(label) => {
                const item = chartData.find((c) => c.name === label);
                return item ? `${item.fullName} (${item.name})` : String(label);
              }}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar
              dataKey="budget"
              name="Approved Budget"
              fill="var(--color-chart-2)"
              radius={[4, 4, 0, 0]}
              barSize={20}
            />
            <Bar
              dataKey="actual"
              name="Actual Incurred"
              fill="var(--color-chart-1)"
              radius={[4, 4, 0, 0]}
              barSize={20}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Enterprise Filter & Search Bar */}
      <div className="rounded-xl border bg-card p-3 shadow-card space-y-2.5">
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Query Input */}
          <div className="relative min-w-[220px] flex-1">
            <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by project name, code, client, site, PM..."
              className="h-8.5 pl-8 text-xs"
            />
          </div>

          {/* Company Filter */}
          <Select value={companyFilter} onValueChange={setCompanyFilter}>
            <SelectTrigger className="h-8.5 w-auto min-w-[145px] text-xs">
              <Building2 className="mr-1.5 size-3.5 text-muted-foreground" />
              <SelectValue placeholder="All Companies" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">
                All Companies
              </SelectItem>
              {companies.map((c) => (
                <SelectItem key={c.id} value={String(c.id)} className="text-xs">
                  {c.name} ({c.code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Project Type Filter */}
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="h-8.5 w-auto min-w-[130px] text-xs">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">
                All Types
              </SelectItem>
              {uniqueTypes.map((t) => (
                <SelectItem key={t} value={t} className="text-xs">
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-8.5 w-auto min-w-[130px] text-xs">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">
                All Statuses
              </SelectItem>
              <SelectItem value="Planning" className="text-xs">
                Planning
              </SelectItem>
              <SelectItem value="Not Started" className="text-xs">
                Not Started
              </SelectItem>
              <SelectItem value="In Progress" className="text-xs">
                In Progress
              </SelectItem>
              <SelectItem value="On Hold" className="text-xs">
                On Hold
              </SelectItem>
              <SelectItem value="Completed" className="text-xs">
                Completed
              </SelectItem>
              <SelectItem value="Cancelled" className="text-xs">
                Cancelled
              </SelectItem>
            </SelectContent>
          </Select>

          {/* Health Filter */}
          <Select value={healthFilter} onValueChange={setHealthFilter}>
            <SelectTrigger className="h-8.5 w-auto min-w-[130px] text-xs">
              <SelectValue placeholder="All Health" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">
                All Health
              </SelectItem>
              <SelectItem value="On Track" className="text-xs">
                On Track
              </SelectItem>
              <SelectItem value="At Risk" className="text-xs">
                At Risk
              </SelectItem>
              <SelectItem value="Delayed" className="text-xs">
                Delayed
              </SelectItem>
            </SelectContent>
          </Select>

          {/* Sort By Dropdown */}
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
            <SelectTrigger className="h-8.5 w-auto min-w-[145px] text-xs">
              <ArrowUpDown className="mr-1 size-3 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name" className="text-xs">
                Name (A → Z)
              </SelectItem>
              <SelectItem value="budget-desc" className="text-xs">
                Budget (High → Low)
              </SelectItem>
              <SelectItem value="actual-desc" className="text-xs">
                Actual Cost (High → Low)
              </SelectItem>
              <SelectItem value="progress-desc" className="text-xs">
                Progress (High → Low)
              </SelectItem>
              <SelectItem value="date" className="text-xs">
                Completion Date
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
        </div>

        {/* Secondary filters row: Location, Client, PM */}
        <div className="flex flex-wrap items-center gap-2 border-t pt-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Filter className="size-3" /> Quick filters:
          </span>

          <Select value={locationFilter} onValueChange={setLocationFilter}>
            <SelectTrigger className="h-7 w-auto min-w-[110px] text-xs">
              <span className="text-muted-foreground">City: </span>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">
                All Cities
              </SelectItem>
              {uniqueLocations.map((loc) => (
                <SelectItem key={loc} value={loc} className="text-xs">
                  {loc}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={clientFilter} onValueChange={setClientFilter}>
            <SelectTrigger className="h-7 w-auto min-w-[130px] text-xs">
              <span className="text-muted-foreground">Client: </span>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">
                All Clients
              </SelectItem>
              {uniqueClients.map((c) => (
                <SelectItem key={c} value={c} className="text-xs">
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={pmFilter} onValueChange={setPmFilter}>
            <SelectTrigger className="h-7 w-auto min-w-[130px] text-xs">
              <span className="text-muted-foreground">PM: </span>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">
                All PMs
              </SelectItem>
              {uniquePMs.map((pm) => (
                <SelectItem key={pm} value={pm} className="text-xs">
                  {pm}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <span className="ml-auto text-[11px]">
            Showing{" "}
            <strong className="font-semibold text-foreground">{filteredProjects.length}</strong> of{" "}
            {projectsList.length} projects
          </span>
        </div>
      </div>

      {/* Projects View: CARDS vs TABLE */}
      {loading ? (
        <div className="flex h-64 items-center justify-center rounded-xl border bg-card p-6 shadow-card">
          <InlineLoader label="Loading projects from backend" />
        </div>
      ) : viewMode === "cards" ? (
        filteredProjects.length === 0 ? (
          <div className="rounded-xl border bg-card py-12 text-center shadow-card">
            <Building2 className="mx-auto size-10 text-muted-foreground/60" />
            <h3 className="mt-2 text-sm font-semibold">No Projects Match Filter</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              {projectsList.length === 0
                ? "No projects have been created yet. Click 'New Project' to create your first project."
                : "Try adjusting your search criteria or clear active filters."}
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={handleResetFilters}
              className="mt-3 text-xs"
            >
              Reset All Filters
            </Button>
          </div>
        ) : (
          <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((p) => (
              <div
                key={p.id}
                onClick={() => navigate(`/app/projects/${p.id}`)}
                className="group relative flex cursor-pointer flex-col justify-between rounded-xl border bg-card p-4 shadow-card transition-all hover:border-primary/60 hover:shadow-md"
              >
                <div>
                  {/* Top Bar: Code, Name, Badges */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-semibold text-primary">
                          {p.code}
                        </span>
                        <span className="text-[11px] text-muted-foreground">• {p.type}</span>
                      </div>
                      <h3 className="mt-0.5 truncate text-sm font-semibold tracking-tight text-foreground group-hover:text-primary">
                        {p.name}
                      </h3>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <StatusBadge value={p.status} />
                      <ProjectHealthBadge health={p.health ?? "On Track"} />
                    </div>
                  </div>

                  {/* Metadata Row */}
                  <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <UserCheck className="size-3 text-muted-foreground/80" /> {p.client}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="size-3 text-muted-foreground/80" /> {p.location}
                    </span>
                  </div>

                  <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground/80">PM:</span>
                    <span>{p.projectManager || p.siteEngineer}</span>
                  </div>

                  {/* Financial & Timeline Metrics Grid */}
                  <div className="mt-3 grid grid-cols-2 gap-2 rounded-lg border bg-surface/50 p-2.5 text-xs">
                    <div>
                      <p className="text-[11px] text-muted-foreground">Budget</p>
                      <p className="font-mono font-semibold text-foreground">
                        {formatINR(p.budget, { compact: true })}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] text-muted-foreground">Actual Cost</p>
                      <p className="font-mono font-semibold text-amber-600 dark:text-amber-400">
                        {formatINR(p.actualCost, { compact: true })}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] text-muted-foreground">Start Date</p>
                      <p className="font-medium text-foreground">{formatDate(p.startDate)}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-muted-foreground">Completion</p>
                      <p className="font-medium text-foreground">
                        {formatDate(p.expectedCompletion)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Progress Bar & Footer */}
                <div className="mt-3 border-t pt-2.5">
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Overall Progress</span>
                    <span className="font-bold text-foreground">{p.progress}%</span>
                  </div>
                  <Progress value={p.progress} className="h-1.5" />

                  <div className="mt-2.5 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-muted-foreground">
                      {p.sites.length} Site(s) active
                    </span>
                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-[11px]"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEdit(p);
                        }}
                      >
                        <Edit className="mr-1 size-3" /> Edit
                      </Button>
                      <span className="font-medium text-primary group-hover:underline">
                        Open Workspace →
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* TABLE VIEW */
        <div className="rounded-xl border bg-card p-2 shadow-card">
          <DataTable
            rows={filteredProjects}
            columns={tableColumns}
            getId={(p) => p.id}
            pageSize={10}
            onRowClick={(p) => navigate(`/app/projects/${p.id}`)}
            emptyTitle="No projects match current criteria"
          />
        </div>
      )}

      {/* New Project Modal */}
      <NewProjectModal
        open={newProjectOpen}
        onOpenChange={setNewProjectOpen}
        defaultCompanyId={companyFilter !== "all" ? companyFilter : undefined}
        onProjectCreated={(newProject) => {
          refreshProjects();
          navigate(`/app/projects/${newProject.id}`);
        }}
      />

      {/* Edit Project Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">Edit Project</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Update project master details, dates, and classification.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3.5 py-2">
            <div>
              <Label className="text-xs">
                Company / Entity <span className="text-destructive">*</span>
              </Label>
              <Select
                value={String(editFormData.companyId)}
                onValueChange={(v) => setEditFormData({ ...editFormData, companyId: Number(v) })}
              >
                <SelectTrigger className="mt-1 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)} className="text-xs">
                      {c.name} ({c.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">
                  Project Code <span className="text-destructive">*</span>
                </Label>
                <Input
                  className="mt-1 h-8 text-xs font-mono uppercase"
                  value={editFormData.code}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      code: e.target.value.toUpperCase(),
                    })
                  }
                />
              </div>
              <div>
                <Label className="text-xs">Project Type</Label>
                <Select
                  value={editFormData.projectType || "Residential"}
                  onValueChange={(v) => setEditFormData({ ...editFormData, projectType: v })}
                >
                  <SelectTrigger className="mt-1 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Residential", "Commercial", "Infrastructure", "Mixed Use", "Industrial"].map(
                      (t) => (
                        <SelectItem key={t} value={t} className="text-xs">
                          {t}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-xs">
                Project Name <span className="text-destructive">*</span>
              </Label>
              <Input
                className="mt-1 h-8 text-xs"
                value={editFormData.name}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
              />
            </div>
            <div>
              <Label className="text-xs">Location / Site Address</Label>
              <Input
                className="mt-1 h-8 text-xs"
                value={editFormData.location || ""}
                onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Start Date</Label>
                <Input
                  type="date"
                  className="mt-1 h-8 text-xs"
                  value={editFormData.startDate || ""}
                  onChange={(e) => setEditFormData({ ...editFormData, startDate: e.target.value })}
                />
              </div>
              <div>
                <Label className="text-xs">Expected End Date</Label>
                <Input
                  type="date"
                  className="mt-1 h-8 text-xs"
                  value={editFormData.expectedEndDate || ""}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      expectedEndDate: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <div>
              <Label className="text-xs">Actual End Date</Label>
              <Input
                type="date"
                className="mt-1 h-8 text-xs"
                value={editFormData.actualEndDate || ""}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    actualEndDate: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <Label className="text-xs">Description</Label>
              <Textarea
                rows={2}
                className="mt-1 text-xs"
                value={editFormData.description || ""}
                onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => setEditModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              className="text-xs"
              onClick={handleSaveEdit}
              disabled={editSubmitting}
            >
              {editSubmitting ? (
                <>
                  <Loader2 className="mr-1.5 size-3.5 animate-spin" /> Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
