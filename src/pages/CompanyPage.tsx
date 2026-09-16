import { useState, useEffect, useCallback, useMemo } from "react";
import { Plus, Building2, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { DataTable, type Column } from "@/components/common/DataTable";
import { StatusBadge } from "@/components/common/StatusBadge";
import { InlineLoader } from "@/components/common/states";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { companyService, type CompanyRequest } from "@/services/companyService";
import type { Company } from "@/types";
import { toast } from "sonner";

interface CompanyFormState {
  code: string;
  name: string;
  legalName: string;
  gstin: string;
  pan: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

const initialFormState: CompanyFormState = {
  code: "",
  name: "",
  legalName: "",
  gstin: "",
  pan: "",
  email: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  pincode: "",
  country: "India",
};

export function CompanyPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [viewingCompany, setViewingCompany] = useState<Company | null>(null);
  const [formData, setFormData] = useState<CompanyFormState>(initialFormState);
  const [submitting, setSubmitting] = useState(false);

  const fetchCompanies = useCallback(async () => {
    try {
      setLoading(true);
      const data = await companyService.getCompanies();
      setCompanies(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load companies");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchCompanies();
  }, [fetchCompanies]);

  const handleOpenCreate = () => {
    setEditingCompany(null);
    setFormData(initialFormState);
    setDialogOpen(true);
  };

  const handleOpenEdit = (comp: Company) => {
    setEditingCompany(comp);
    setFormData({
      code: comp.code ?? "",
      name: comp.name ?? "",
      legalName: comp.legalName ?? "",
      gstin: comp.gstin ?? "",
      pan: comp.pan ?? "",
      email: comp.email ?? "",
      phone: comp.phone ?? "",
      addressLine1: comp.addressLine1 ?? "",
      addressLine2: comp.addressLine2 ?? "",
      city: comp.city ?? "",
      state: comp.state ?? "",
      pincode: comp.pincode ?? "",
      country: comp.country ?? "India",
    });
    setDialogOpen(true);
  };

  const handleOpenView = (comp: Company) => {
    setViewingCompany(comp);
    setViewDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code.trim() || !formData.name.trim()) {
      toast.error("Company Code and Name are required");
      return;
    }

    setSubmitting(true);
    const payload: CompanyRequest = {
      code: formData.code.trim(),
      name: formData.name.trim(),
      legalName: formData.legalName.trim() || null,
      gstin: formData.gstin.trim() || null,
      pan: formData.pan.trim() || null,
      email: formData.email.trim() || null,
      phone: formData.phone.trim() || null,
      addressLine1: formData.addressLine1.trim() || null,
      addressLine2: formData.addressLine2.trim() || null,
      city: formData.city.trim() || null,
      state: formData.state.trim() || null,
      pincode: formData.pincode.trim() || null,
      country: formData.country.trim() || "India",
    };

    try {
      if (editingCompany) {
        await companyService.updateCompany(editingCompany.id, payload);
        toast.success("Company updated successfully");
      } else {
        await companyService.createCompany(payload);
        toast.success("Company created successfully");
      }
      setDialogOpen(false);
      await fetchCompanies();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save company");
    } finally {
      setSubmitting(false);
    }
  };

  const columns: Column<Company>[] = useMemo(
    () => [
      {
        key: "code",
        header: "Company Code",
        render: (r) => <span className="font-semibold text-primary">{r.code || "—"}</span>,
      },
      {
        key: "name",
        header: "Company Name",
        render: (r) => <span className="font-medium">{r.name}</span>,
      },
      {
        key: "legalName",
        header: "Legal Name",
        hideOnMobile: true,
        render: (r) => r.legalName || "—",
      },
      {
        key: "gstin",
        header: "GSTIN",
        hideOnMobile: true,
        render: (r) => r.gstin || "—",
      },
      {
        key: "city",
        header: "City",
        render: (r) => r.city || "—",
      },
      {
        key: "state",
        header: "State",
        hideOnMobile: true,
        render: (r) => r.state || "—",
      },
      {
        key: "status",
        header: "Status",
        align: "center",
        render: (r) => <StatusBadge value={r.status || "Active"} />,
      },
    ],
    [],
  );

  const activeCount = companies.filter((c) => c.status === "ACTIVE" || !c.status).length;

  return (
    <>
      <PageHeader
        title="Company"
        description="Registered legal entities, business units and corporate profile."
        breadcrumbs={[{ label: "Administration" }, { label: "Company" }]}
        actions={
          <Button size="sm" className="gap-1.5" onClick={handleOpenCreate}>
            <Plus className="size-3.5" /> Add Company
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Companies"
          value={String(companies.length)}
          hint="Registered organizations"
          icon={Building2}
        />
        <StatCard
          label="Active Companies"
          value={String(activeCount)}
          tone="success"
          hint="Operational entities"
        />
      </div>

      {loading ? (
        <div className="flex min-h-[250px] items-center justify-center rounded-xl border bg-card p-10">
          <InlineLoader label="Loading companies from server" />
        </div>
      ) : (
        <DataTable
          title="Company Master"
          rows={companies}
          columns={columns}
          getId={(r) => String(r.id)}
          searchKeys={(r) => `${r.code ?? ""} ${r.name} ${r.legalName ?? ""} ${r.city ?? ""}`}
          rowActions={(r) => [
            { label: "View", onSelect: () => handleOpenView(r) },
            { label: "Edit", onSelect: () => handleOpenEdit(r) },
          ]}
          onRowClick={(r) => handleOpenView(r)}
        />
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingCompany ? "Edit Company" : "Add Company"}</DialogTitle>
            <DialogDescription>
              {editingCompany
                ? `Update details for company code ${editingCompany.code || editingCompany.id}`
                : "Register a new company entity in the system."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="code">Company Code *</Label>
                <Input
                  id="code"
                  placeholder="e.g. BC001"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  disabled={submitting}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="name">Company Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g. BuildCore Construction"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={submitting}
                  required
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="legalName">Legal / Registered Name</Label>
                <Input
                  id="legalName"
                  placeholder="e.g. BuildCore Construction Private Limited"
                  value={formData.legalName}
                  onChange={(e) => setFormData({ ...formData, legalName: e.target.value })}
                  disabled={submitting}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="gstin">GSTIN</Label>
                <Input
                  id="gstin"
                  placeholder="e.g. 27AAACB2134E1Z9"
                  value={formData.gstin}
                  onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                  disabled={submitting}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="pan">PAN</Label>
                <Input
                  id="pan"
                  placeholder="e.g. AAACB2134E"
                  value={formData.pan}
                  onChange={(e) => setFormData({ ...formData, pan: e.target.value })}
                  disabled={submitting}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@buildcore.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={submitting}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  placeholder="e.g. 9999999999"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  disabled={submitting}
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="addressLine1">Address Line 1</Label>
                <Input
                  id="addressLine1"
                  placeholder="Street / Office Address"
                  value={formData.addressLine1}
                  onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                  disabled={submitting}
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="addressLine2">Address Line 2</Label>
                <Input
                  id="addressLine2"
                  placeholder="Suite, Floor, Landmark"
                  value={formData.addressLine2}
                  onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
                  disabled={submitting}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  placeholder="e.g. Pune"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  disabled={submitting}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  placeholder="e.g. Maharashtra"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  disabled={submitting}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="pincode">Pincode</Label>
                <Input
                  id="pincode"
                  placeholder="e.g. 411001"
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  disabled={submitting}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  placeholder="India"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
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
                {editingCompany ? "Update Company" : "Create Company"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Company Details</DialogTitle>
            <DialogDescription>
              {viewingCompany?.name} ({viewingCompany?.code || "—"})
            </DialogDescription>
          </DialogHeader>

          {viewingCompany && (
            <div className="grid grid-cols-2 gap-3 py-2 text-sm">
              <div>
                <span className="text-xs text-muted-foreground block">Code</span>
                <span className="font-semibold">{viewingCompany.code || "—"}</span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">Status</span>
                <StatusBadge value={viewingCompany.status || "Active"} />
              </div>
              <div className="col-span-2">
                <span className="text-xs text-muted-foreground block">Legal Name</span>
                <span>{viewingCompany.legalName || "—"}</span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">GSTIN</span>
                <span className="font-mono">{viewingCompany.gstin || "—"}</span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">PAN</span>
                <span className="font-mono">{viewingCompany.pan || "—"}</span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">Email</span>
                <span>{viewingCompany.email || "—"}</span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">Phone</span>
                <span>{viewingCompany.phone || "—"}</span>
              </div>
              <div className="col-span-2">
                <span className="text-xs text-muted-foreground block">Address</span>
                <span>
                  {[
                    viewingCompany.addressLine1,
                    viewingCompany.addressLine2,
                    viewingCompany.city,
                    viewingCompany.state,
                    viewingCompany.pincode,
                    viewingCompany.country,
                  ]
                    .filter(Boolean)
                    .join(", ") || "—"}
                </span>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              Close
            </Button>
            {viewingCompany && (
              <Button
                onClick={() => {
                  setViewDialogOpen(false);
                  handleOpenEdit(viewingCompany);
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
