const statusStyles = {
  analyzing: 'bg-amber-100 text-amber-800 border border-amber-200',
  completed: 'bg-green-100 text-green-800 border border-green-200',
  failed: 'bg-red-100 text-red-800 border border-red-200',
  queued: 'bg-blue-100 text-blue-800 border border-blue-200',
}

export function ReviewHeader({ review, flagCount, decidedCount, finalReport }) {
  const undecided = flagCount - decidedCount

  return (
    <div className="mb-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{review.pr_title}</h1>
          <p className="text-muted-foreground text-sm mt-1">
            PR #{review.pr_number} by {review.pr_author}
            {review.triggered_by === 'webhook' && (
              <span className="ml-2 text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">
                Auto-triggered
              </span>
            )}
          </p>
        </div>
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize shrink-0 ${statusStyles[review.status] ?? ''}`}>
          {review.status}
        </span>
      </div>

      {review.status === 'completed' && (
        <div className="flex gap-6 mt-4 pt-4 border-t">
          <div>
            <p className="text-2xl font-semibold">{flagCount}</p>
            <p className="text-xs text-muted-foreground">total flags</p>
          </div>
          <div>
            <p className="text-2xl font-semibold text-green-600">{decidedCount}</p>
            <p className="text-xs text-muted-foreground">reviewed</p>
          </div>
          <div>
            <p className="text-2xl font-semibold text-amber-600">{undecided}</p>
            <p className="text-xs text-muted-foreground">pending review</p>
          </div>
        </div>
      )}

      {finalReport && (
        <div className="mt-4 pt-4 border-t">
          <p className="text-xs font-medium text-muted-foreground mb-2">
            Review summary
          </p>
          <p className="text-sm whitespace-pre-wrap text-muted-foreground">
            {finalReport}
          </p>
        </div>
      )}
    </div>
  )
}