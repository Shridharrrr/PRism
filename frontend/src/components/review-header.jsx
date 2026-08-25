import { ExternalLink, AlertTriangle, ListChecks } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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
          <div className="prose prose-sm max-w-none dark:prose-invert prose-p:leading-relaxed prose-headings:font-medium prose-a:text-primary hover:prose-a:underline prose-code:text-xs prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-muted prose-pre:p-3 prose-pre:rounded-md prose-pre:text-xs text-foreground/90 font-light font-sans tracking-wide">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={{
                strong: ({ node, ...props }) => {
                  const text = props.children;
                  let str = "";
                  if (typeof text === "string") {
                    str = text;
                  } else if (Array.isArray(text)) {
                    str = text.map(c => (typeof c === "string" ? c : "")).join("");
                  }
                  
                  if (str.includes("Overall Assessment:")) {
                    const isApproved = str.includes("Approve") || str.includes("Looks good");
                    const colorClass = isApproved 
                      ? "text-success bg-success/10 border-success/20" 
                      : "text-error bg-error/10 border-error/20";
                    return (
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-sm font-semibold border mb-2 ${colorClass}`} {...props} />
                    );
                  }
                  if (str.includes("Critical Issues")) {
                    return (
                      <span className="text-error font-semibold inline-flex items-center gap-1.5 mt-1">
                        <AlertTriangle className="w-4 h-4" />
                        {props.children}
                      </span>
                    );
                  }
                  if (str.includes("Top 3 Action Items") || str.includes("Action Items")) {
                    return (
                      <span className="text-primary font-semibold text-sm inline-flex items-center gap-1.5 mt-3">
                        <ListChecks className="w-4 h-4" />
                        {props.children}
                      </span>
                    );
                  }
                  return <strong className="font-semibold text-foreground" {...props} />;
                },
                ul: ({ node, ...props }) => (
                  <ul className="list-none space-y-3 my-4 ml-1" {...props} />
                ),
                li: ({ node, ...props }) => (
                  <li className="flex gap-3 items-start" {...props}>
                    <div className="min-w-1.5 min-h-1.5 max-w-1.5 max-h-1.5 rounded-full bg-primary/40 mt-2.5 shrink-0" />
                    <span className="flex-1">{props.children}</span>
                  </li>
                ),
              }}
            >
              {finalReport}
            </ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}
