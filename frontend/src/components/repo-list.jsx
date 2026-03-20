'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export function RepoList({ accessToken, userId }) {
  const [repos, setRepos] = useState([])
  const [connected, setConnected] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    async function load() {
      const res = await fetch(
        'https://api.github.com/user/repos?sort=updated&per_page=30',
        { headers: { Authorization: `Bearer ${accessToken}` } }
      )
      const data = await res.json()

      if (!Array.isArray(data)) {
        setError(data.message || 'Failed to fetch repos')
        setLoading(false)
        return
      }

      setRepos(data)

      const { data: saved } = await supabase
        .from('repos')
        .select('github_repo_id')
        .eq('user_id', userId)

      if (saved) setConnected(new Set(saved.map(r => r.github_repo_id)))
      setLoading(false)
    }
    load()
  }, [])

  const connect = async (repo) => {
    await supabase.from('repos').upsert({
      user_id: userId,
      github_repo_id: repo.id,
      full_name: repo.full_name,
      name: repo.name,
      owner: repo.owner.login,
      private: repo.private,
    })
    setConnected(prev => new Set(prev).add(repo.id))
  }

  if (loading) return (
    <p className="text-muted-foreground text-sm">Loading repositories...</p>
  )

  if (error) return (
    <p className="text-destructive text-sm">Error: {error}</p>
  )

  return (
    <div className="flex flex-col gap-3">
      {repos.map(repo => (
        <Card
          key={repo.id}
          className="flex flex-row items-center justify-between px-5 py-4"
        >
          <div>
            <p className="font-medium text-sm">{repo.full_name}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {repo.private ? 'Private' : 'Public'} · updated{' '}
              {new Date(repo.updated_at).toLocaleDateString()}
            </p>
          </div>
          <div className="flex gap-2">
            {connected.has(repo.id) && (
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  router.push(`/repos/${repo.owner.login}/${repo.name}/prs`)
                }
              >
                View PRs
              </Button>
            )}
            <Button
              size="sm"
              variant={connected.has(repo.id) ? 'secondary' : 'default'}
              onClick={() => !connected.has(repo.id) && connect(repo)}
            >
              {connected.has(repo.id) ? 'Connected' : 'Connect'}
            </Button>
          </div>
        </Card>
      ))}
    </div>
  )
}