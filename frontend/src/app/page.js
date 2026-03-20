import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LoginButton } from '@/components/login-button'

export default async function LoginPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) redirect('/repos')

  return (
    <main className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-semibold tracking-tight">
            PRism
          </CardTitle>
          <CardDescription>
            AI-powered code review for your pull requests
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <LoginButton />
        </CardContent>
      </Card>
    </main>
  )
}