import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, Clock, ShieldCheck, XCircle } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { PanelCard } from "@/components/common/ChartCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import { EmptyState } from "@/components/common/states";
import { Timeline } from "@/components/common/Timeline";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { approvalTasks } from "@/mock/data";
import { formatDate, formatINR } from "@/utils/format";

export function ApprovalsPage({ history = false }: { history?: boolean }) {
  const initial = approvalTasks.filter((a) =>
    history ? a.status !== "Pending" : a.status === "Pending",
  );
  const [items, setItems] = useState(initial);
  const [activeId, setActiveId] = useState(initial[0]?.id ?? "");
  const [remark, setRemark] = useState("");
  const active = items.find((a) => a.id === activeId);

  const act = (verdict: "Approved" | "Rejected") => {
    if (!active) return;
    setItems((prev) => prev.filter((a) => a.id !== active.id));
    setActiveId("");
    setRemark("");
    toast.success(`${active.docNo} ${verdict.toLowerCase()}`);
  };

  return (
    <>
      <PageHeader
        title={history ? "Approval History" : "Approval Inbox"}
        description={
          history
            ? "Completed approvals with approver, level and remarks for audit."
            : "Multi-level approvals pending your action across procurement, sales, payroll and accounts."
        }
        breadcrumbs={[
          { label: "Approvals" },
          { label: history ? "Approval History" : "Approval Inbox" },
        ]}
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Pending With Me"
          value={String(approvalTasks.filter((a) => a.status === "Pending").length)}
          icon={Clock}
          tone="warning"
        />
        <StatCard
          label="Approved"
          value={String(approvalTasks.filter((a) => a.status === "Approved").length)}
          icon={CheckCircle2}
          tone="success"
        />
        <StatCard
          label="Rejected"
          value={String(approvalTasks.filter((a) => a.status === "Rejected").length)}
          icon={XCircle}
          tone="danger"
        />
        <StatCard
          label="Approval Levels"
          value="3"
          hint="Site → Purchase → Director"
          icon={ShieldCheck}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <PanelCard
          title={history ? "Completed" : "Queue"}
          subtitle={`${items.length} documents`}
          bodyClassName="p-0"
          className="lg:col-span-2"
        >
          {items.length === 0 ? (
            <EmptyState
              title="Nothing pending"
              description="All approvals in this queue are cleared."
            />
          ) : (
            <ul className="divide-y">
              {items.map((a) => (
                <li key={a.id}>
                  <button
                    type="button"
                    onClick={() => setActiveId(a.id)}
                    className={`w-full px-4 py-3 text-left transition-colors hover:bg-muted/50 ${a.id === activeId ? "bg-muted/60" : ""}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-medium">
                        {a.document} · {a.docNo}
                      </p>
                      <StatusBadge value={a.priority} />
                    </div>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {a.project} · {a.raisedBy} · {formatDate(a.date)}
                    </p>
                    <p className="num mt-1 text-sm font-semibold">
                      {formatINR(a.amount, { compact: true })}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </PanelCard>

        <PanelCard
          title="Document detail"
          subtitle={active ? active.docNo : "Select a document"}
          className="lg:col-span-3"
        >
          {!active ? (
            <EmptyState
              title="No document selected"
              description="Pick a document from the queue to review its trail."
            />
          ) : (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Document type" value={active.document} />
                <Field label="Document number" value={active.docNo} />
                <Field label="Project" value={active.project} />
                <Field label="Raised by" value={active.raisedBy} />
                <Field label="Amount" value={formatINR(active.amount)} />
                <Field label="Current level" value={`${active.level}`} />
              </div>

              <div>
                <p className="mb-2 text-xs font-medium text-muted-foreground">Approval trail</p>
                <Timeline
                  steps={[
                    {
                      title: "Document created",
                      meta: formatDate(active.date),
                      detail: `Raised by ${active.raisedBy}`,
                      state: "done" as const,
                    },
                    {
                      title: "Level 1 — Site Engineer",
                      meta: "Approved",
                      detail: "Verified quantity against BOQ",
                      state: "done" as const,
                    },
                    {
                      title: `${active.level} — Pending`,
                      meta: "Awaiting action",
                      detail: `Priority ${active.priority}`,
                      state: "current" as const,
                    },
                  ]}
                />
              </div>

              {!history && (
                <div className="space-y-2">
                  <Textarea
                    placeholder="Approval remarks (optional)"
                    value={remark}
                    onChange={(e) => setRemark(e.target.value)}
                    rows={3}
                  />
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" onClick={() => act("Approved")}>
                      Approve
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => act("Rejected")}>
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toast.info("Sent back to originator")}
                    >
                      Send back
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </PanelCard>
      </div>
    </>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-muted/30 px-3 py-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-medium">{value}</p>
    </div>
  );
}
