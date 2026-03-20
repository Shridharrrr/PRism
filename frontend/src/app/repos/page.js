import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { RepoList } from '@/components/repo-list'
import { LogoutButton } from '@/components/logout-button'

export default async function ReposPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/')

  const { data: profile } = await supabase
    .from('profiles')
    .select('github_username, github_avatar_url, github_access_token')
    .eq('id', user.id)
    .single()

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <LogoutButton></LogoutButton>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold">Your repositories</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Select a repo to start reviewing pull requests
            </p>
          </div>
          <span className="text-sm text-muted-foreground">
            @{profile?.github_username}
          </span>
        </div>
        <RepoList
          accessToken={profile?.github_access_token ?? ''}
          userId={user.id}
        />
      </div>
    </main>
  )
}