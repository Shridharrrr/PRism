'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ReviewHeader } from '@/components/review-header'
import { FlagGroup } from '@/components/flag-group'
import { useParams } from 'next/navigation'

export default function ReviewPage() {
  const { id } = useParams()
  const [review, setReview] = useState(null)
  const [flags, setFlags] = useState([])
  const [finalReport, setFinalReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  async function load() {
    const res = await fetch(`http://localhost:8000/api/reviews/${id}`)
    const data = await res.json()
    setReview(data.review)
    setFlags(data.flags ?? [])
    const report = data.agent_outputs?.find(o => o.agent_name === 'report_writer')
    setFinalReport(report?.raw_output ?? null)
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [id])

  useEffect(() => {
    const channel = supabase
      .channel(`review-${id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'reviews',
          filter: `id=eq.${id}`,
        },
        (payload) => {
          setReview(prev => ({ ...prev, ...payload.new }))
          if (payload.new.status === 'completed') load()
        }
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [id])

  if (loading) return (
    <main className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <p className="text-muted-foreground text-sm">Loading review...</p>
      </div>
    </main>
  )

  if (!review) return (
    <main className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <p className="text-destructive text-sm">Review not found.</p>
      </div>
    </main>
  )

  const decidedCount = flags.filter(f => f.user_decision !== null).length

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <ReviewHeader
          review={review}
          flagCount={flags.length}
          decidedCount={decidedCount}
          finalReport={finalReport}
        />

        {review.status === 'analyzing' || review.status === 'queued' ? (
          <div className="flex items-center gap-3 py-12 justify-center">
            <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            <p className="text-muted-foreground text-sm">
              {review.status === 'queued'
                ? 'Waiting for worker to pick up the job...'
                : 'Agents are analyzing this PR...'}
            </p>
          </div>
        ) : review.status === 'failed' ? (
          <p className="text-destructive text-sm">
            Analysis failed. Please try again.
          </p>
        ) : (
          <FlagGroup flags={flags} />
        )}
      </div>
    </main>
  )
}