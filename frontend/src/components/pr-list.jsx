'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export function PRList({ owner, repo, repoId, accessToken, userId }) {
  const [prs, setPrs] = useState([])
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState({})
  const router = useRouter()

  useEffect(() => {
    async function load() {
      const res = await fetch(
        `http://localhost:8000/api/repos/${owner}/${repo}/prs?token=${accessToken}`
      )
      const data = await res.json()
      setPrs(data.prs || [])
      setLoading(false)
    }
    load()
  }, [])

  const analyze = async (pr) => {
    setAnalyzing(prev => ({ ...prev, [pr.number]: true }))

    const res = await fetch('http://localhost:8000/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        repo_id: repoId,
        owner,
        repo,
        pr_number: pr.number,
        pr_title: pr.title,
        pr_url: pr.url,
        pr_author: pr.author,
        user_id: userId,
        github_token: accessToken,
      }),
    })

    const data = await res.json()
    setAnalyzing(prev => ({ ...prev, [pr.number]: false }))

    if (data.review_id) {
      router.push(`/reviews/${data.review_id}`)
    }
  }

  if (loading) return (
    <p className="text-muted-foreground text-sm">Loading pull requests...</p>
  )

  if (prs.length === 0) return (
    <p className="text-muted-foreground text-sm">No open pull requests.</p>
  )

  return (
    <div className="flex flex-col gap-3">
      {prs.map(pr => (
        <Card
          key={pr.number}
          className="flex flex-row items-center justify-between px-5 py-4"
        >
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">#{pr.number}</span>
              <p className="font-medium text-sm">{pr.title}</p>
              {pr.draft && (
                <span className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">
                  Draft
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              by {pr.author} · opened {new Date(pr.created_at).toLocaleDateString()}
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => analyze(pr)}
            disabled={analyzing[pr.number]}
          >
            {analyzing[pr.number] ? 'Analyzing...' : 'Analyze PR'}
          </Button>
        </Card>
      ))}
    </div>
  )
}