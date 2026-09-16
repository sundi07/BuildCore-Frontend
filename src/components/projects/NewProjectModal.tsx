import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { projectService } from "@/services/projectService";
import { companyService } from "@/services/companyService";
import type { Project, ProjectType, ProjectDocItem, Company } from "@/types";
import { formatINR } from "@/utils/format";
import { toast } from "sonner";
import {
  Building2,
  MapPin,
  Calendar,
  IndianRupee,
  Layers,
  FileText,
  Check,
  ChevronRight,
  ChevronLeft,
  UploadCloud,
  FileCheck,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NewProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProjectCreated?: ((project: Project) => void) | undefined;
  defaultCompanyId?: number | string | undefined;
}

type FormSection = "basic" | "location" | "timeline" | "financial" | "config" | "documents";

const projectTypes: ProjectType[] = [
  "Residential",
  "Commercial",
  "Infrastructure",
  "Mixed Use",
  "Industrial",
];

const samplePMs = [
  "Rohit Deshmukh",
  "Amit Kulkarni",
  "Nilesh Patel",
  "Sanjay Rane",
  "Prakash Joshi",
  "Vikas Shah",
  "Sachin Kadam",
];

const gstOptions = [
  "GST 18% (Standard Construction Works Contract)",
  "GST 12% (Government / Infrastructure Contract)",
  "GST 5% (Affordable Residential Scheme)",
  "Exempt / Composite Scheme",
];

const uomOptions = ["Sq.Ft", "Sq.M", "Acres", "Metres", "Brass"];

export function NewProjectModal({
  open,
  onOpenChange,
  onProjectCreated,
  defaultCompanyId,
}: NewProjectModalProps) {
  const [activeSection, setActiveSection] = useState<FormSection>("basic");

  // Companies & Company Selection
  const [companies, setCompanies] = useState<Company[]>([]);
  const [companyId, setCompanyId] = useState<string>(
    defaultCompanyId ? String(defaultCompanyId) : "",
  );
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      companyService
        .getCompanies()
        .then((data) => {
          setCompanies(data);
          if (defaultCompanyId) {
            setCompanyId(String(defaultCompanyId));
          } else if (data.length > 0) {
            setCompanyId((prev) => prev || String(data[0]!.id));
          }
        })
        .catch((err) => {
          console.error("Failed to load companies for project modal:", err);
        });
    }
  }, [open, defaultCompanyId]);

  // Basic Information
  const [code, setCode] = useState(() => `PRJ-${Math.floor(100 + Math.random() * 900)}`);
  const [name, setName] = useState("");
  const [type, setType] = useState<ProjectType>("Residential");
  const [client, setClient] = useState("");
  const [projectManager, setProjectManager] = useState(samplePMs[0]!);
  const [description, setDescription] = useState("");

  // Location
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Pune");
  const [state, setState] = useState("Maharashtra");
  const [pincode, setPincode] = useState("411001");
  const [siteName, setSiteName] = useState("");

  // Timeline
  const [startDate, setStartDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [expectedCompletion, setExpectedCompletion] = useState("2028-03-31");

  // Financial
  const [contractValue, setContractValue] = useState("250000000"); // 25 Cr default
  const [budget, setBudget] = useState("225000000"); // 22.5 Cr default
  const [contingencyPct, setContingencyPct] = useState("5.0");
  const [taxGstApplicable, setTaxGstApplicable] = useState(gstOptions[0]!);

  // Configuration
  const [towersCount, setTowersCount] = useState("2");
  const [unitsCount, setUnitsCount] = useState("120");
  const [floorsCount, setFloorsCount] = useState("18");
  const [projectArea, setProjectArea] = useState("250000");
  const [uom, setUom] = useState("Sq.Ft");

  // Documents Mock State
  const [documents, setDocuments] = useState<
    {
      name: string;
      category: ProjectDocItem["category"];
    }[]
  >([
    { name: "Project Agreement Draft v1.pdf", category: "Project Agreement" },
    { name: "Architectural Concept Drawings.dwg", category: "Drawings" },
    { name: "Municipal Zone Approval NOC.pdf", category: "Approvals" },
  ]);
  const [newDocName, setNewDocName] = useState("");
  const [newDocCategory, setNewDocCategory] =
    useState<ProjectDocItem["category"]>("Other Documents");

  // Validation
  const [errors, setErrors] = useState<Record<string, string>>({});

  const sections: { id: FormSection; label: string; icon: typeof Building2 }[] = [
    { id: "basic", label: "Basic Info", icon: Building2 },
    { id: "location", label: "Location", icon: MapPin },
    { id: "timeline", label: "Timeline", icon: Calendar },
    { id: "financial", label: "Financial", icon: IndianRupee },
    { id: "config", label: "Configuration", icon: Layers },
    { id: "documents", label: "Documents", icon: FileText },
  ];

  function validateCurrentSection(): boolean {
    const errs: Record<string, string> = {};

    if (activeSection === "basic") {
      if (!companyId) errs["company"] = "Company is required";
      if (!name.trim()) errs["name"] = "Project Name is required";
      if (!code.trim()) errs["code"] = "Project Code is required";
      if (!client.trim()) errs["client"] = "Client / Entity is required";
    } else if (activeSection === "location") {
      if (!city.trim()) errs["city"] = "City is required";
      if (!state.trim()) errs["state"] = "State is required";
    } else if (activeSection === "timeline") {
      if (!startDate) errs["startDate"] = "Start date is required";
      if (!expectedCompletion) errs["expectedCompletion"] = "Completion date is required";
      if (startDate && expectedCompletion && startDate > expectedCompletion) {
        errs["expectedCompletion"] = "Completion date cannot be earlier than start date";
      }
    } else if (activeSection === "financial") {
      const cv = Number(contractValue);
      const b = Number(budget);
      if (isNaN(cv) || cv <= 0) errs["contractValue"] = "Enter valid contract value";
      if (isNaN(b) || b <= 0) errs["budget"] = "Enter valid budget amount";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleNext() {
    if (!validateCurrentSection()) return;
    const order: FormSection[] = [
      "basic",
      "location",
      "timeline",
      "financial",
      "config",
      "documents",
    ];
    const idx = order.indexOf(activeSection);
    if (idx < order.length - 1) {
      setActiveSection(order[idx + 1]!);
    }
  }

  function handlePrevious() {
    const order: FormSection[] = [
      "basic",
      "location",
      "timeline",
      "financial",
      "config",
      "documents",
    ];
    const idx = order.indexOf(activeSection);
    if (idx > 0) {
      setActiveSection(order[idx - 1]!);
    }
  }

  function handleAddDocument() {
    if (!newDocName.trim()) return;
    setDocuments((prev) => [...prev, { name: newDocName.trim(), category: newDocCategory }]);
    setNewDocName("");
    toast.success("Document attached to project bundle");
  }

  async function handleSubmit() {
    // Validate all critical sections
    if (!companyId || !name.trim() || !code.trim() || !client.trim()) {
      setActiveSection("basic");
      setErrors({
        company: !companyId ? "Company is required" : "",
        name: !name.trim() ? "Project Name is required" : "",
        code: !code.trim() ? "Project Code is required" : "",
        client: !client.trim() ? "Client is required" : "",
      });
      toast.error("Please fill required basic project details");
      return;
    }

    try {
      setSubmitting(true);
      const created = await projectService.createProject({
        companyId: Number(companyId),
        code: code.trim().toUpperCase(),
        name: name.trim(),
        description: description.trim() || undefined,
        location: `${city.trim()}, ${state.trim()}`,
        projectType: type,
        startDate: startDate || undefined,
        expectedEndDate: expectedCompletion || undefined,
      });

      toast.success(`Project ${created.name} (${created.code}) created successfully!`);
      onProjectCreated?.(created);
      onOpenChange(false);
    } catch (err) {
      console.error(err);
      toast.error(
        err instanceof Error ? err.message : "Failed to create project. Please check values.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto p-0 sm:max-h-[85vh]">
        <DialogHeader className="border-b px-6 pt-5 pb-4">
          <DialogTitle className="font-display text-lg font-semibold tracking-tight">
            Create New Construction Project
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Initialize project master data, site locations, commercial budgets, building
            configuration and baseline documents.
          </DialogDescription>

          {/* Section Step Tabs */}
          <div className="mt-3 flex flex-wrap gap-1.5 border-t pt-3">
            {sections.map((sec, i) => {
              const Icon = sec.icon;
              const isActive = activeSection === sec.id;
              return (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => setActiveSection(sec.id)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <Icon className="size-3.5" />
                  <span>
                    {i + 1}. {sec.label}
                  </span>
                </button>
              );
            })}
          </div>
        </DialogHeader>

        {/* Section Contents */}
        <div className="px-6 py-4">
          {/* 1. Basic Information */}
          {activeSection === "basic" && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="proj-company" className="text-xs">
                  Company / Organization <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={companyId}
                  onValueChange={(val) => {
                    setCompanyId(val);
                    setErrors((prev) => ({ ...prev, company: "" }));
                  }}
                >
                  <SelectTrigger
                    id="proj-company"
                    className={cn("mt-1.5 h-9 text-xs", errors["company"] && "border-destructive")}
                  >
                    <SelectValue placeholder="Select Company" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)} className="text-xs">
                        {c.name} ({c.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors["company"] && (
                  <p className="mt-1 text-[11px] text-destructive">{errors["company"]}</p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="proj-code" className="text-xs">
                    Project Code <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="proj-code"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="e.g. PRJ-GVR-01"
                    className={cn(
                      "mt-1.5 h-9 text-xs font-mono",
                      errors["code"] && "border-destructive",
                    )}
                  />
                  {errors["code"] && (
                    <p className="mt-1 text-[11px] text-destructive">{errors["code"]}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="proj-type" className="text-xs">
                    Project Type
                  </Label>
                  <Select value={type} onValueChange={(v) => setType(v as ProjectType)}>
                    <SelectTrigger id="proj-type" className="mt-1.5 h-9 text-xs">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {projectTypes.map((t) => (
                        <SelectItem key={t} value={t} className="text-xs">
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="proj-name" className="text-xs">
                  Project Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="proj-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Green Valley Residency Phase 2"
                  className={cn("mt-1.5 h-9 text-xs", errors["name"] && "border-destructive")}
                />
                {errors["name"] && (
                  <p className="mt-1 text-[11px] text-destructive">{errors["name"]}</p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="proj-client" className="text-xs">
                    Client / SPV Entity <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="proj-client"
                    value={client}
                    onChange={(e) => setClient(e.target.value)}
                    placeholder="e.g. Buildcore Realty LLP / Client Corp"
                    className={cn("mt-1.5 h-9 text-xs", errors["client"] && "border-destructive")}
                  />
                  {errors["client"] && (
                    <p className="mt-1 text-[11px] text-destructive">{errors["client"]}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="proj-pm" className="text-xs">
                    Project Manager (Site In-Charge)
                  </Label>
                  <Select value={projectManager} onValueChange={setProjectManager}>
                    <SelectTrigger id="proj-pm" className="mt-1.5 h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {samplePMs.map((pm) => (
                        <SelectItem key={pm} value={pm} className="text-xs">
                          {pm}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="proj-desc" className="text-xs">
                  Project Description & Scope
                </Label>
                <Textarea
                  id="proj-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Brief summary of civil scope, RERA number, amenities, structural highlights..."
                  className="mt-1.5 text-xs"
                />
              </div>
            </div>
          )}

          {/* 2. Location */}
          {activeSection === "location" && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="loc-site" className="text-xs">
                  Site / Campus Name
                </Label>
                <Input
                  id="loc-site"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  placeholder="e.g. Wagholi Central Site Campus"
                  className="mt-1.5 h-9 text-xs"
                />
              </div>

              <div>
                <Label htmlFor="loc-address" className="text-xs">
                  Plot / Survey Address
                </Label>
                <Textarea
                  id="loc-address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={2}
                  placeholder="Survey No, Plot No, Highway / Landmark"
                  className="mt-1.5 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <Label htmlFor="loc-city" className="text-xs">
                    City <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="loc-city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Pune"
                    className="mt-1.5 h-9 text-xs"
                  />
                </div>
                <div>
                  <Label htmlFor="loc-state" className="text-xs">
                    State <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="loc-state"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="e.g. Maharashtra"
                    className="mt-1.5 h-9 text-xs"
                  />
                </div>
                <div>
                  <Label htmlFor="loc-pincode" className="text-xs">
                    Pincode
                  </Label>
                  <Input
                    id="loc-pincode"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="e.g. 411014"
                    className="mt-1.5 h-9 text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 3. Timeline */}
          {activeSection === "timeline" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="t-start" className="text-xs">
                    Planned Start Date <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="t-start"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className={cn(
                      "mt-1.5 h-9 text-xs",
                      errors["startDate"] && "border-destructive",
                    )}
                  />
                  {errors["startDate"] && (
                    <p className="mt-1 text-[11px] text-destructive">{errors["startDate"]}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="t-end" className="text-xs">
                    Expected Completion Date <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="t-end"
                    type="date"
                    value={expectedCompletion}
                    onChange={(e) => setExpectedCompletion(e.target.value)}
                    className={cn(
                      "mt-1.5 h-9 text-xs",
                      errors["expectedCompletion"] && "border-destructive",
                    )}
                  />
                  {errors["expectedCompletion"] && (
                    <p className="mt-1 text-[11px] text-destructive">
                      {errors["expectedCompletion"]}
                    </p>
                  )}
                </div>
              </div>

              <div className="rounded-lg border bg-muted/40 p-3 text-xs text-muted-foreground">
                <p className="font-medium text-foreground">Timeline Baseline</p>
                <p className="mt-1">
                  Once set, this timeline serves as the master baseline against which WBS progress,
                  slab casting milestones, and DPR schedules are calculated.
                </p>
              </div>
            </div>
          )}

          {/* 4. Financial */}
          {activeSection === "financial" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="fin-contract" className="text-xs">
                    Contract Value (₹) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="fin-contract"
                    type="number"
                    value={contractValue}
                    onChange={(e) => setContractValue(e.target.value)}
                    className="mt-1.5 h-9 text-xs"
                  />
                  <p className="mt-1 text-[11px] font-medium text-muted-foreground">
                    Formatted: {formatINR(Number(contractValue) || 0, { compact: true })} (₹
                    {Number(contractValue).toLocaleString("en-IN")})
                  </p>
                </div>

                <div>
                  <Label htmlFor="fin-budget" className="text-xs">
                    Approved Project Budget (₹) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="fin-budget"
                    type="number"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="mt-1.5 h-9 text-xs"
                  />
                  <p className="mt-1 text-[11px] font-medium text-muted-foreground">
                    Formatted: {formatINR(Number(budget) || 0, { compact: true })} (₹
                    {Number(budget).toLocaleString("en-IN")})
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="fin-contingency" className="text-xs">
                    Contingency Allocation (%)
                  </Label>
                  <Input
                    id="fin-contingency"
                    type="number"
                    step="0.5"
                    value={contingencyPct}
                    onChange={(e) => setContingencyPct(e.target.value)}
                    className="mt-1.5 h-9 text-xs"
                  />
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Contingency Fund:{" "}
                    {formatINR(((Number(budget) || 0) * (Number(contingencyPct) || 0)) / 100, {
                      compact: true,
                    })}
                  </p>
                </div>

                <div>
                  <Label htmlFor="fin-tax" className="text-xs">
                    Tax / GST Applicability
                  </Label>
                  <Select value={taxGstApplicable} onValueChange={setTaxGstApplicable}>
                    <SelectTrigger id="fin-tax" className="mt-1.5 h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {gstOptions.map((g) => (
                        <SelectItem key={g} value={g} className="text-xs">
                          {g}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* 5. Configuration */}
          {activeSection === "config" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <Label htmlFor="cfg-towers" className="text-xs">
                    Number of Towers / Buildings
                  </Label>
                  <Input
                    id="cfg-towers"
                    type="number"
                    value={towersCount}
                    onChange={(e) => setTowersCount(e.target.value)}
                    className="mt-1.5 h-9 text-xs"
                  />
                </div>

                <div>
                  <Label htmlFor="cfg-units" className="text-xs">
                    Total Units / Flats / Offices
                  </Label>
                  <Input
                    id="cfg-units"
                    type="number"
                    value={unitsCount}
                    onChange={(e) => setUnitsCount(e.target.value)}
                    className="mt-1.5 h-9 text-xs"
                  />
                </div>

                <div>
                  <Label htmlFor="cfg-floors" className="text-xs">
                    Max Floors / Storeys
                  </Label>
                  <Input
                    id="cfg-floors"
                    type="number"
                    value={floorsCount}
                    onChange={(e) => setFloorsCount(e.target.value)}
                    className="mt-1.5 h-9 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="cfg-area" className="text-xs">
                    Total Built-up / Project Area
                  </Label>
                  <Input
                    id="cfg-area"
                    type="number"
                    value={projectArea}
                    onChange={(e) => setProjectArea(e.target.value)}
                    className="mt-1.5 h-9 text-xs"
                  />
                </div>

                <div>
                  <Label htmlFor="cfg-uom" className="text-xs">
                    Unit of Measurement (UOM)
                  </Label>
                  <Select value={uom} onValueChange={setUom}>
                    <SelectTrigger id="cfg-uom" className="mt-1.5 h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {uomOptions.map((u) => (
                        <SelectItem key={u} value={u} className="text-xs">
                          {u}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* 6. Documents */}
          {activeSection === "documents" && (
            <div className="space-y-4">
              <div className="rounded-lg border border-dashed border-border bg-muted/20 p-4 text-center">
                <UploadCloud className="mx-auto size-8 text-muted-foreground/60" />
                <p className="mt-2 text-xs font-medium text-foreground">
                  Attach Baseline Project Documents
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Upload Project Agreement, Structural / Architectural Drawings, RERA / Municipal
                  Approvals.
                </p>

                <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                  <Input
                    placeholder="Document Title (e.g. Master Layout Rev 2.dwg)"
                    value={newDocName}
                    onChange={(e) => setNewDocName(e.target.value)}
                    className="h-8 max-w-xs text-xs"
                  />
                  <Select
                    value={newDocCategory}
                    onValueChange={(v) => setNewDocCategory(v as ProjectDocItem["category"])}
                  >
                    <SelectTrigger className="h-8 w-44 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Project Agreement">Project Agreement</SelectItem>
                      <SelectItem value="Drawings">Drawings</SelectItem>
                      <SelectItem value="Approvals">Approvals</SelectItem>
                      <SelectItem value="Other Documents">Other Documents</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={handleAddDocument}
                    className="h-8 text-xs"
                  >
                    Add Document
                  </Button>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold">
                  Attached Baseline Documents ({documents.length})
                </p>
                <div className="mt-2 divide-y rounded-lg border bg-card">
                  {documents.map((doc, idx) => (
                    <div key={idx} className="flex items-center justify-between px-3 py-2 text-xs">
                      <div className="flex items-center gap-2">
                        <FileCheck className="size-4 text-success" />
                        <div>
                          <p className="font-medium text-foreground">{doc.name}</p>
                          <p className="text-[10px] text-muted-foreground">{doc.category}</p>
                        </div>
                      </div>
                      <span className="rounded bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                        Ready to link
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer with Step Navigation */}
        <DialogFooter className="flex flex-row items-center justify-between border-t bg-muted/20 px-6 py-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handlePrevious}
            disabled={activeSection === "basic"}
            className="text-xs"
          >
            <ChevronLeft className="size-3.5" /> Previous
          </Button>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs"
            >
              Cancel
            </Button>

            {activeSection !== "documents" ? (
              <Button type="button" size="sm" onClick={handleNext} className="text-xs">
                Next <ChevronRight className="size-3.5" />
              </Button>
            ) : (
              <Button
                type="button"
                size="sm"
                onClick={handleSubmit}
                disabled={submitting}
                className="text-xs"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-1.5 size-3.5 animate-spin" /> Creating...
                  </>
                ) : (
                  <>
                    <Check className="mr-1.5 size-3.5" /> Create Project
                  </>
                )}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
