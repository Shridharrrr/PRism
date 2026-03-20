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
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const res = await fetch(`http://localhost:8000/api/reviews/${id}`)
      const data = await res.json()
      setReview(data.review)
      setFlags(data.flags ?? [])
      setLoading(false)
    }
    load()
  }, [id])

  // Supabase Realtime — update review status live while analyzing
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
          // Reload flags when analysis completes
          if (payload.new.status === 'completed') {
            fetch(`http://localhost:8000/api/reviews/${id}`)
              .then(r => r.json())
              .then(data => setFlags(data.flags ?? []))
          }
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
        />

        {review.status === 'analyzing' && (
          <div className="flex items-center gap-3 py-12 justify-center">
            <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            <p className="text-muted-foreground text-sm">
              Agents are analyzing this PR...
            </p>
          </div>
        )}

        {review.status === 'failed' && (
          <p className="text-destructive text-sm">
            Analysis failed. Please try again.
          </p>
        )}

        {review.status === 'completed' && (
          <FlagGroup flags={flags} />
        )}
      </div>
    </main>
  )
}