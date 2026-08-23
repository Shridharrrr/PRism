import { ExternalLink } from "lucide-react";

const statusConfig = {
  analyzing: {
    label: "Analyzing",
    class: "bg-amber-50 text-amber-700 border border-amber-200",
  },
  completed: {
    label: "Completed",
    class: "bg-green-50 text-green-700 border border-green-200",
  },
  failed: {
    label: "Failed",
    class: "bg-red-50 text-red-700 border border-red-200",
  },
  queued: {
    label: "Queued",
    class: "bg-blue-50 text-blue-700 border border-blue-200",
  },
};

export function ReviewHeader({ review, flagCount, decidedCount, finalReport }) {
  const undecided = flagCount - decidedCount;
  const status = statusConfig[review.status] ?? {
    label: review.status,
    class: "",
  };

  return (
    <div className="mb-10">
      {/* Header card */}
      <div className="rounded-lg border border-border bg-card p-6 mb-6 shadow-sm">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-muted-foreground font-mono">
                PR #{review.pr_number}
              </span>
              {review.triggered_by === "webhook" && (
                <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full">
                  Auto-triggered
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight leading-snug text-foreground mb-1 truncate">
              {review.pr_title}
            </h1>
            <p className="text-sm text-muted-foreground">
              by{" "}
              <span className="text-foreground font-medium">
                {review.pr_author}
              </span>
            </p>
          </div>
          <span
            className={`text-xs font-medium px-3 py-1 rounded-full capitalize shrink-0 ${status.class}`}
          >
            {status.label}
          </span>
        </div>

        {review.pr_url && (
          <a
            href={review.pr_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-foreground hover:text-foreground/70 transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            View on GitHub
          </a>
        )}
      </div>

      {/* Stats row */}
      {review.status === "completed" && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            {
              value: flagCount,
              label: "Total flags",
              color: "text-foreground",
            },
            { value: decidedCount, label: "Reviewed", color: "text-green-600" },
            { value: undecided, label: "Pending", color: "text-amber-600" },
          ].map(({ value, label, color }) => (
            <div
              key={label}
              className="rounded-lg border border-border bg-card p-4 text-center"
            >
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Final report */}
      {finalReport && (
        <div className="rounded-lg border border-border bg-muted/50 p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1.5 h-1.5 rounded-full bg-foreground" />
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
              AI Review Summary
            </p>
          </div>
          <p className="text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed">
            {finalReport}
          </p>
        </div>
      )}
    </div>
  );
}
