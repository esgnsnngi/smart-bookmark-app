'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

export default function BookmarkList({ user }) {
  const [bookmarks, setBookmarks] = useState([])
  const [newBookmark, setNewBookmark] = useState({ url: '', title: '' })
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [error, setError] = useState(null)

  const fetchBookmarks = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase
        .from('bookmarks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setBookmarks(data || [])
    } catch (err) {
      console.error('Error fetching bookmarks:', err)
      setError('Failed to load bookmarks. Please refresh.')
    } finally {
      setLoading(false)
    }
  }, [user.id])

  useEffect(() => {
    fetchBookmarks()
  }, [fetchBookmarks])

  const addBookmark = async (e) => {
    e.preventDefault()
    if (!newBookmark.url || !newBookmark.title) {
      alert('Please fill in both URL and title')
      return
    }

    setAdding(true)
    try {
      const { data, error } = await supabase
        .from('bookmarks')
        .insert([{
          user_id: user.id,
          url: newBookmark.url,
          title: newBookmark.title
        }])
        .select()

      if (error) throw error

      if (data && data.length > 0) {
        setBookmarks(prev => [data[0], ...prev])
      }
      setNewBookmark({ url: '', title: '' })
    } catch (err) {
      console.error('Error adding bookmark:', err)
      alert('Failed to add bookmark: ' + err.message)
    } finally {
      setAdding(false)
    }
  }

  const deleteBookmark = async (id) => {
    setDeletingId(id)
    try {
      const { error } = await supabase
        .from('bookmarks')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error

      setBookmarks(prev => prev.filter(b => b.id !== id))
    } catch (err) {
      console.error('Error deleting bookmark:', err)
      alert('Failed to delete bookmark: ' + err.message)
    } finally {
      setDeletingId(null)
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
                My Bookmarks
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
            Add New Bookmark
          </h2>
          <form onSubmit={addBookmark} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Title
              </label>
              <input
                type="text"
                value={newBookmark.title}
                onChange={(e) => setNewBookmark(prev => ({ ...prev, title: e.target.value }))}
                placeholder="My Awesome Website"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                onChange={(e) => setNewBookmark(prev => ({ ...prev, url: e.target.value }))}
                placeholder="https://example.com"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <button
              type="submit"
              disabled={adding}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {adding ? 'Adding...' : 'Add Bookmark'}
            </button>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
            <button
              onClick={fetchBookmarks}
              className="ml-4 underline font-semibold"
            >
              Retry
            </button>
          </div>
        )}

        {/* Bookmarks List */}
        <div className="space-y-4">
          {loading ? (
            <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
              <p className="mt-4 text-gray-600">Loading bookmarks...</p>
            </div>
          ) : bookmarks.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
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
                <div
                  key={bookmark.id}
                  className="bg-white rounded-2xl shadow-xl p-6"
                >
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
                      disabled={deletingId === bookmark.id}
                      className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg ml-4 flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {deletingId === bookmark.id ? 'Deleting...' : 'Delete'}
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