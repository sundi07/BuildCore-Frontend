import { useState, useMemo, useEffect } from "react";
import { Plus, Printer } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { DataTable } from "@/components/common/DataTable";
import { WorkflowChain } from "@/components/common/Timeline";
import { Button } from "@/components/ui/button";
import { presets } from "@/pages/presets";
import { rfqService } from "@/services/rfqService";
import { RfqDetailDrawer } from "@/components/procurement/RfqDetailDrawer";
import { toast } from "sonner";
import type { Enquiry } from "@/types";

interface EnquiriesPageProps {
  initialRfqId?: string | undefined;
}

export function EnquiriesPage({ initialRfqId }: EnquiriesPageProps) {
  const preset = presets["procurement/enquiries"];

  // Initialize RFQs list from rfqService (merges saved custom ones with baseline)
  const [rfqList, setRfqList] = useState<Enquiry[]>(() => rfqService.getEnquiries());

  // Selected RFQ for detail drawer
  const [selectedRfq, setSelectedRfq] = useState<Enquiry | null>(null);

  // Auto-select if initialRfqId is passed
  useEffect(() => {
    if (initialRfqId) {
      const match = rfqList.find(
        (e) =>
          e.id === initialRfqId ||
          e.enquiryNo === initialRfqId ||
          e.enquiryNo.replace(/\//g, "-") === initialRfqId,
      );
      if (match) {
        setSelectedRfq(match);
      }
    }
  }, [initialRfqId, rfqList]);

  // Dynamic KPIs that react to newly added or updated RFQs
  const dynamicKpis = useMemo(() => {
    const openCount = rfqList.filter((e) => e.status !== "Closed").length;
    const suppliersCount = rfqList.reduce(
      (s, e) => s + (e.selectedSuppliers?.length || e.suppliers || 2),
      0,
    );
    const responsesCount = rfqList.reduce((s, e) => s + (e.responses || 0), 0);
    const awaitingCount = rfqList.filter((e) => !e.responses || e.responses === 0).length;

    return [
      {
        label: "Open RFQs",
        value: String(openCount),
      },
      {
        label: "Suppliers Invited",
        value: String(suppliersCount),
      },
      {
        label: "Responses Received",
        value: String(responsesCount),
        tone: "success" as const,
      },
      {
        label: "Awaiting Response",
        value: String(awaitingCount),
        tone: "warning" as const,
      },
    ];
  }, [rfqList]);

  function handleUpdateRfq(updated: Enquiry) {
    setRfqList((prev) =>
      prev.map((item) =>
        item.id === updated.id || item.enquiryNo === updated.enquiryNo ? updated : item,
      ),
    );
    setSelectedRfq(updated);
  }

  if (!preset) return null;

  return (
    <>
      <PageHeader
        title={preset.title}
        description={preset.description}
        breadcrumbs={preset.breadcrumbs}
        actions={
          <>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => window.print()}>
              <Printer className="size-3.5" /> Print
            </Button>
            {preset.primaryAction ? (
              <Button
                size="sm"
                className="gap-1.5"
                onClick={() =>
                  toast.info(
                    "To float an RFQ, open any Approved Indent and click 'Create Enquiry / RFQ'",
                  )
                }
              >
                <Plus className="size-3.5" /> {preset.primaryAction}
              </Button>
            ) : null}
          </>
        }
      />

      {/* Connected Workflow Chain */}
      {preset.workflow ? (
        <div className="rounded-xl border bg-card px-4 py-3 shadow-card">
          <p className="mb-2 text-xs font-medium text-muted-foreground">Connected workflow</p>
          <WorkflowChain steps={preset.workflow.steps} activeIndex={preset.workflow.activeIndex} />
        </div>
      ) : null}

      {/* Dynamic 4 Top KPIs */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {dynamicKpis.map((k) => (
          <StatCard key={k.label} {...k} />
        ))}
      </div>

      {/* DataTable with dynamic click to open detail drawer */}
      <DataTable
        title={preset.title}
        rows={rfqList as never[]}
        columns={preset.columns}
        getId={preset.getId}
        searchKeys={preset.searchKeys}
        filters={preset.filters}
        rowActions={(row) => [
          {
            label: "View Details",
            onSelect: () => setSelectedRfq(row as Enquiry),
          },
          {
            label: "Print RFQ",
            onSelect: () => window.print(),
          },
        ]}
        onRowClick={(row) => setSelectedRfq(row as Enquiry)}
      />

      {preset.footnote}

      {/* RFQ Detail Drawer */}
      <RfqDetailDrawer
        rfq={selectedRfq}
        open={Boolean(selectedRfq)}
        onClose={() => setSelectedRfq(null)}
        onUpdateRfq={handleUpdateRfq}
      />
    </>
  );
}
