import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PRList } from '@/components/pr-list'

export default async function PRsPage({ params }) {
  const { owner, repo } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/')

  const { data: profile } = await supabase
    .from('profiles')
    .select('github_access_token')
    .eq('id', user.id)
    .single()

  const { data: repoData } = await supabase
    .from('repos')
    .select('id')
    .eq('owner', owner)
    .eq('name', repo)
    .single()

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold">{owner}/{repo}</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Open pull requests
          </p>
        </div>
        <PRList
          owner={owner}
          repo={repo}
          repoId={repoData?.id}
          accessToken={profile?.github_access_token ?? ''}
          userId={user.id}
        />
      </div>
    </main>
  )
}