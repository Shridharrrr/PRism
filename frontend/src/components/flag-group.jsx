import { FlagCard } from '@/components/flag-card'

const severityOrder = ['critical', 'warning', 'info']

const groupLabels = {
  critical: 'Critical',
  warning: 'Warnings',
  info: 'Info',
}

const groupDescriptions = {
  critical: 'Must address before merging',
  warning: 'Should address, review carefully',
  info: 'Nice to have improvements',
}

export function FlagGroup({ flags }) {
  const grouped = severityOrder.reduce((acc, severity) => {
    const items = flags.filter(f => f.severity === severity)
    if (items.length > 0) acc[severity] = items
    return acc
  }, {})

  if (Object.keys(grouped).length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No flags found for this PR.</p>
        <p className="text-sm text-muted-foreground mt-1">
          The agents found no issues to report.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      {severityOrder.map(severity => {
        const items = grouped[severity]
        if (!items) return null
        return (
          <div key={severity}>
            <div className="flex items-baseline gap-3 mb-3">
              <h2 className="text-base font-medium">{groupLabels[severity]}</h2>
              <span className="text-xs text-muted-foreground">
                {groupDescriptions[severity]}
              </span>
              <span className="text-xs text-muted-foreground ml-auto">
                {items.length} {items.length === 1 ? 'flag' : 'flags'}
              </span>
            </div>
            <div className="flex flex-col gap-3">
              {items.map(flag => (
                <FlagCard key={flag.id} flag={flag} />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}