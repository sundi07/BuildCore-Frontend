import { CalendarDays, Building2, Layers, MapPin, CalendarRange } from "lucide-react";
import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { companyService } from "@/services/companyService";
import { financialYears, projectNames, sites } from "@/mock/data";

const dateRanges = [
  "Today",
  "This Week",
  "This Month",
  "This Quarter",
  "This Financial Year",
  "Custom Range",
];

export function FilterBar() {
  const [range, setRange] = useState("This Month");
  const [companyList, setCompanyList] = useState<string[]>([]);
  const [company, setCompany] = useState("");
  const [project, setProject] = useState("all");
  const [site, setSite] = useState("all");
  const [fy, setFy] = useState(financialYears[0]!);

  useEffect(() => {
    let active = true;
    companyService
      .getCompanies()
      .then((data) => {
        if (active && data && data.length > 0) {
          const names = data.map((c) => c.name);
          setCompanyList(names);
          setCompany(names[0] ?? "");
        }
      })
      .catch((err) => {
        console.error("Failed to load companies in filter bar:", err);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border bg-card p-2.5 shadow-card">
      <Field
        icon={<CalendarDays className="size-3.5" />}
        value={range}
        onChange={setRange}
        options={dateRanges}
      />
      <Field
        icon={<Building2 className="size-3.5" />}
        value={company}
        onChange={setCompany}
        options={companyList.length > 0 ? companyList : ["BuildCore Construction"]}
      />
      <Field
        icon={<Layers className="size-3.5" />}
        value={project}
        onChange={setProject}
        options={projectNames}
        allLabel="All Projects"
      />
      <Field
        icon={<MapPin className="size-3.5" />}
        value={site}
        onChange={setSite}
        options={sites}
        allLabel="All Sites"
      />
      <Field
        icon={<CalendarRange className="size-3.5" />}
        value={fy}
        onChange={setFy}
        options={financialYears}
      />
    </div>
  );
}

function Field({
  icon,
  value,
  onChange,
  options,
  allLabel,
}: {
  icon: React.ReactNode;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  allLabel?: string | undefined;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-9 w-auto min-w-[150px] gap-1.5 text-xs">
        <span className="text-muted-foreground">{icon}</span>
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="max-h-72">
        {allLabel ? <SelectItem value="all">{allLabel}</SelectItem> : null}
        {options.map((o) => (
          <SelectItem key={o} value={o}>
            {o}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
