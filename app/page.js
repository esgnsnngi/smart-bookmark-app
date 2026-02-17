'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import AuthComponent from '@/components/AuthComponent'
import BookmarkList from '@/components/BookmarkList'

export default function Home() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Set a timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      setLoading(false)
    }, 3000)

    supabase.auth.getSession().then(({ data: { session }, error }) => {
      clearTimeout(timeout)
      console.log('Session:', session)
      console.log('Error:', error)
      setSession(session)
      setLoading(false)
    }).catch((err) => {
      clearTimeout(timeout)
      console.error('Failed to get session:', err)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => {
      subscription.unsubscribe()
      clearTimeout(timeout)
    }
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