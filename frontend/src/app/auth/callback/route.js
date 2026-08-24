import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.session) {
      // provider_token is the GitHub access token - save it to profiles
      const providerToken = data.session.provider_token

      if (providerToken) {
        await supabase
          .from('profiles')
          .update({ github_access_token: providerToken })
          .eq('id', data.session.user.id)
      }
    }
  }

  return NextResponse.redirect(`${origin}/repos`)
}