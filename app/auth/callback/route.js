import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET(request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')

  console.log('=== AUTH CALLBACK ===')
  console.log('Full URL:', requestUrl.href)
  console.log('Code:', code)
  console.log('Error from URL:', error)
  console.log('Error Description:', errorDescription)

  if (code) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
    
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
    
    console.log('Exchange result:', data)
    console.log('Exchange error:', exchangeError)
    
    if (exchangeError) {
      console.error('Error exchanging code:', exchangeError)
      return NextResponse.redirect(new URL('/?error=auth', requestUrl.origin))
    }
  }

  return NextResponse.redirect(new URL('/', requestUrl.origin))
}
