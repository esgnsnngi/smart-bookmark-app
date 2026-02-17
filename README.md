# Smart Bookmark App

A full-stack bookmark manager built with Next.js and Supabase that allows users to save, organize, and manage their favorite links with real-time sync.

## Live Demo
https://smart-bookmark-app-blush-eight.vercel.app

## Features
- Google OAuth authentication
- Add and delete bookmarks instantly
- Data persists across sessions
- Responsive design for mobile and desktop
- Secure - users can only access their own bookmarks

## Tech Stack
- **Frontend**: Next.js 14, React, Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth)
- **Deployment**: Vercel with CI/CD via GitHub

## Problems I Faced and How I Solved Them

### 1. Google OAuth Redirect URI Mismatch
**Problem**: After clicking "Sign in with Google", I got `Error 400: redirect_uri_mismatch`.  
**Solution**: I learned that Google OAuth requires the exact redirect URI to be whitelisted. I had to add `https://myproject.supabase.co/auth/v1/callback` to Google Cloud Console's authorized redirect URIs. This taught me how OAuth 2.0 flow works in production.

### 2. Session Not Persisting After Login
**Problem**: After signing in with Google, the app kept redirecting back to the login page instead of staying logged in.  
**Solution**: I discovered the issue was a missing `/auth/callback` route in Next.js. I created the route handler to exchange the OAuth code for a session using Supabase's `exchangeCodeForSession()`.

### 3. Bookmarks Not Showing After Adding
**Problem**: After adding a bookmark, it wouldn't appear until page refresh.  
**Solution**: I fixed this by using Supabase's `.select()` after `.insert()` to immediately get the newly created bookmark back and manually update the React state, instead of relying on real-time subscriptions.

### 4. Supabase Project Pausing
**Problem**: The app stopped working because Supabase paused my free tier project due to inactivity.  
**Solution**: I learned that Supabase free tier projects pause after 1 week of inactivity. I restored the project from the dashboard and learned to monitor project status regularly.

### 5. Package Compatibility Issues
**Problem**: Upgrading to Next.js 16 broke the app with `AbortError: signal is aborted without reason`.  
**Solution**: I downgraded back to Next.js 14.2.35 which was stable and compatible with the Supabase auth packages being used.

## Setup Instructions

1. Clone the repository:
   git clone https://github.com/esgnsnngi/smart-bookmark-app.git

2. Install dependencies:
   npm install

3. Create `.env.local` file:
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

4. Run the development server:
   npm run dev

5. Open http://localhost:3000

## Database Setup
Run the SQL script in `database.sql` in your Supabase SQL editor to create the bookmarks table with proper Row Level Security policies.

## Deployment
The app is deployed on Vercel and automatically redeploys on every push to the main branch.