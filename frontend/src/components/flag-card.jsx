'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const severityStyles = {
  critical: {
    badge: 'bg-red-100 text-red-800 border border-red-200',
    border: 'border-l-4 border-l-red-500',
  },
  warning: {
    badge: 'bg-amber-100 text-amber-800 border border-amber-200',
    border: 'border-l-4 border-l-amber-400',
  },
  info: {
    badge: 'bg-blue-100 text-blue-800 border border-blue-200',
    border: 'border-l-4 border-l-blue-400',
  },
}

const agentLabels = {
  security_auditor: 'Security',
  improvement_suggester: 'Quality',
}

export function FlagCard({ flag }) {
  const [decision, setDecision] = useState(flag.user_decision)
  const [loading, setLoading] = useState(null)
  const styles = severityStyles[flag.severity] ?? severityStyles.info

  const decide = async (value) => {
    setLoading(value)
    await fetch(`http://localhost:8000/api/flags/${flag.id}/decision`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ decision: value }),
    })
    setDecision(value)
    setLoading(null)
  }

  return (
    <Card className={`${styles.border} transition-opacity ${decision ? 'opacity-60' : 'opacity-100'}`}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${styles.badge}`}>
              {flag.severity}
            </span>
            <span className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">
              {agentLabels[flag.agent] ?? flag.agent}
            </span>
            <span className="text-xs text-muted-foreground font-mono">
              {flag.type}
            </span>
          </div>
          {decision && (
            <span className={`text-xs font-medium shrink-0 ${
              decision === 'safe'
                ? 'text-green-600'
                : 'text-red-600'
            }`}>
              {decision === 'safe' ? 'Marked safe' : 'Issue confirmed'}
            </span>
          )}
        </div>

        {(flag.file_path || flag.line_start) && (
          <p className="text-xs text-muted-foreground font-mono mt-1">
            {flag.file_path}
            {flag.line_start && `:${flag.line_start}`}
            {flag.line_end && flag.line_end !== flag.line_start
              ? `–${flag.line_end}`
              : ''}
          </p>
        )}
      </CardHeader>

      <CardContent className="flex flex-col gap-3">
        <p className="text-sm">{flag.description}</p>

        {flag.snippet && (
          <pre className="text-xs bg-secondary rounded-md p-3 overflow-x-auto font-mono whitespace-pre-wrap">
            {flag.snippet}
          </pre>
        )}

        {flag.suggestion && (
          <div className="bg-muted rounded-md px-3 py-2">
            <p className="text-xs text-muted-foreground font-medium mb-0.5">Suggestion</p>
            <p className="text-sm">{flag.suggestion}</p>
          </div>
        )}

        {!decision && (
          <div className="flex gap-2 pt-1">
            <Button
              size="sm"
              variant="outline"
              className="text-green-700 border-green-200 hover:bg-green-50"
              onClick={() => decide('safe')}
              disabled={!!loading}
            >
              {loading === 'safe' ? 'Saving...' : 'Mark safe'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-red-700 border-red-200 hover:bg-red-50"
              onClick={() => decide('confirmed')}
              disabled={!!loading}
            >
              {loading === 'confirmed' ? 'Saving...' : 'Confirm issue'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}