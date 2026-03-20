'use client'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

export function LogoutButton() {
  const supabase = createClient()
  return (
    <Button
      variant="outline"
      onClick={() => supabase.auth.signOut().then(() => window.location.href = '/')}
    >
      Sign out
    </Button>
  )
}