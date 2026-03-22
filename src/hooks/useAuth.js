import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

export function useAuth() {
  const [user, setUser] = useState(undefined) // undefined = not yet known
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION' || event === 'SIGNED_OUT') {
          setUser(session?.user ?? null)
          setLoading(false)
        }

        if (event === 'SIGNED_IN' && session?.user) {
          await supabase.from('profiles').upsert({
            id: session.user.id,
            email: session.user.email,
            display_name: session.user.user_metadata?.full_name,
            avatar_url: session.user.user_metadata?.avatar_url,
          }, { onConflict: 'id' })
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    })
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  return { user, loading, signInWithGoogle, signOut }
}