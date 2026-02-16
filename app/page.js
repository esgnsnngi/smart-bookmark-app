'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import AuthComponent from '@/components/AuthComponent'
import BookmarkList from '@/components/BookmarkList'

export default function Home() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => { 
      console.log('Session:', session)
      console.log('Error:', error)
      setSession(session)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {   
      console.log('Auth event:', event)
      console.log('Session:', session)
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"></div>  
          <p className="mt-4 text-gray-600 text-lg">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {!session ? (
        <AuthComponent />
      ) : (
        <BookmarkList user={session.user} />
      )}
    </>
  )
}
