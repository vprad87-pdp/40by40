import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get current session on load
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for login/logout changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const currentUser = session?.user ?? null
        setUser(currentUser)

        // Auto-create profile row on first login
        if (event === 'SIGNED_IN' && currentUser) {
          await supabase.from('profiles').upsert({
            id: currentUser.id,
            email: currentUser.email,
            display_name: currentUser.user_metadata?.full_name,
            avatar_url: currentUser.user_metadata?.avatar_url,
          }, { onConflict: 'id' })
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    })
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  return { user, loading, signInWithGoogle, signOut }
}