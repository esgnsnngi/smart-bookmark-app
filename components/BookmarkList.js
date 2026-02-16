'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function BookmarkList({ user }) {
  const [bookmarks, setBookmarks] = useState([])
  const [newBookmark, setNewBookmark] = useState({ url: '', title: '' })
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)

  // Fetch bookmarks on component mount
  useEffect(() => {
    fetchBookmarks()
    
    // Set up real-time subscription
    const channel = supabase
      .channel('bookmarks-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookmarks',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Real-time update:', payload)
          
          if (payload.eventType === 'INSERT') {
            setBookmarks(prev => [payload.new, ...prev])
          } else if (payload.eventType === 'DELETE') {
            setBookmarks(prev => prev.filter(b => b.id !== payload.old.id))
          } else if (payload.eventType === 'UPDATE') {
            setBookmarks(prev => prev.map(b => b.id === payload.new.id ? payload.new : b))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user.id])

  const fetchBookmarks = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('bookmarks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching bookmarks:', error)
    } else {
      setBookmarks(data || [])
    }
    setLoading(false)
  }

  const addBookmark = async (e) => {
    e.preventDefault()
    
    if (!newBookmark.url || !newBookmark.title) {
      alert('Please fill in both URL and title')
      return
    }

    setAdding(true)
    const { error } = await supabase
      .from('bookmarks')
      .insert([
        {
          user_id: user.id,
          url: newBookmark.url,
          title: newBookmark.title
        }
      ])

    if (error) {
      console.error('Error adding bookmark:', error)
      alert('Failed to add bookmark')
    } else {
      setNewBookmark({ url: '', title: '' })
    }
    setAdding(false)
  }

  const deleteBookmark = async (id) => {
    const { error } = await supabase
      .from('bookmarks')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting bookmark:', error)
      alert('Failed to delete bookmark')
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-1">
                📚 My Bookmarks
              </h1>
              <p className="text-gray-600">
                Logged in as {user.email}
              </p>
            </div>
            <button
              onClick={handleSignOut}
              className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Add Bookmark Form */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            ➕ Add New Bookmark
          </h2>
          <form onSubmit={addBookmark} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Title
              </label>
              <input
                type="text"
                value={newBookmark.title}
                onChange={(e) => setNewBookmark({ ...newBookmark, title: e.target.value })}
                placeholder="My Awesome Website"
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                URL
              </label>
              <input
                type="url"
                value={newBookmark.url}
                onChange={(e) => setNewBookmark({ ...newBookmark, url: e.target.value })}
                placeholder="https://example.com"
                className="input-field"
                required
              />
            </div>
            <button
              type="submit"
              disabled={adding}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {adding ? 'Adding...' : 'Add Bookmark'}
            </button>
          </form>
        </div>

        {/* Bookmarks List */}
        <div className="space-y-4">
          {loading ? (
            <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
              <p className="mt-4 text-gray-600">Loading bookmarks...</p>
            </div>
          ) : bookmarks.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
              <p className="text-2xl mb-2">📭</p>
              <p className="text-gray-600 text-lg">No bookmarks yet!</p>
              <p className="text-gray-500 text-sm mt-2">Add your first bookmark above</p>
            </div>
          ) : (
            <>
              <div className="bg-white rounded-2xl shadow-xl p-4">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">{bookmarks.length}</span> bookmark{bookmarks.length !== 1 ? 's' : ''} saved
                </p>
              </div>
              
              {bookmarks.map((bookmark) => (
                <div key={bookmark.id} className="bookmark-card">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-800 mb-1 truncate">
                        {bookmark.title}
                      </h3>
                      <a
                        href={bookmark.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm break-all hover:underline"
                      >
                        {bookmark.url}
                      </a>
                      <p className="text-xs text-gray-500 mt-2">
                        Added {new Date(bookmark.created_at).toLocaleDateString()} at{' '}
                        {new Date(bookmark.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteBookmark(bookmark.id)}
                      className="btn-danger ml-4 flex-shrink-0"
                      title="Delete bookmark"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
