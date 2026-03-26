import { FlagCard } from "@/components/flag-card";
import { ShieldAlert, AlertTriangle, Info, CheckCircle } from "lucide-react";

const severityOrder = ["critical", "warning", "info"];

const groupConfig = {
  critical: {
    label: "Critical",
    desc: "Must address before merging",
    icon: ShieldAlert,
    color: "text-red-400",
    bg: "bg-red-500/10 border-red-500/20",
  },
  warning: {
    label: "Warnings",
    desc: "Should address, review carefully",
    icon: AlertTriangle,
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20",
  },
  info: {
    label: "Suggestions",
    desc: "Nice-to-have improvements",
    icon: Info,
    color: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/20",
  },
};

export function FlagGroup({ flags }) {
  const grouped = severityOrder.reduce((acc, severity) => {
    const items = flags.filter((f) => f.severity === severity);
    if (items.length > 0) acc[severity] = items;
    return acc;
  }, {});

  if (Object.keys(grouped).length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
        <div className="w-14 h-14 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
          <CheckCircle className="w-7 h-7 text-green-400" />
        </div>
        <div>
          <p className="font-semibold text-foreground mb-1">No issues found</p>
          <p className="text-sm text-muted-foreground max-w-xs">
            The AI agents found no flags to report. This PR looks clean!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10">
      {severityOrder.map((severity) => {
        const items = grouped[severity];
        if (!items) return null;
        const config = groupConfig[severity];
        const Icon = config.icon;
        return (
          <div key={severity}>
            <div className="flex items-center gap-3 mb-4">
              <div
                className={`w-8 h-8 rounded-lg border ${config.bg} flex items-center justify-center shrink-0`}
              >
                <Icon className={`w-4 h-4 ${config.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <h2 className={`text-sm font-semibold ${config.color}`}>
                    {config.label}
                  </h2>
                  <span className="text-xs text-muted-foreground">
                    {config.desc}
                  </span>
                </div>
              </div>
              <span className="text-xs text-muted-foreground shrink-0 bg-secondary px-2 py-0.5 rounded-full">
                {items.length} {items.length === 1 ? "flag" : "flags"}
              </span>
            </div>
            <div className="flex flex-col gap-3">
              {items.map((flag) => (
                <FlagCard key={flag.id} flag={flag} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
