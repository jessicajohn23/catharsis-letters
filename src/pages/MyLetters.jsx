import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'

function timeUntil(target) {
  const diff = new Date(target) - new Date()
  if (diff <= 0) return null
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
  if (days > 0) return `${days}d ${hours}h left`
  const mins = Math.floor((diff / (1000 * 60)) % 60)
  return `${hours}h ${mins}m left`
}

export default function MyLetters() {
  const [letters, setLetters] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('letters')
      .select('*, hearts(count)')
      .eq('author_id', user.id)
      .order('created_at', { ascending: false })
    setLetters(data || [])
    setLoading(false)
  }

  const handleDelete = async (letterId) => {
  if (!confirm('delete this letter forever? this can\'t be undone.')) return
  await supabase.from('letters').delete().eq('id', letterId)
  setLetters((prev) => prev.filter((l) => l.id !== letterId))}

  const statusLabel = (letter) => {
    if (letter.status === 'locked') {
      return `🔒 unlocks in ${timeUntil(letter.unlock_at) || 'soon'}`
    }
    if (letter.status === 'unlocked') {
      return letter.future_visibility === 'public'
        ? '🔓 unlocked · posted publicly'
        : '🔓 unlocked · private'
    }
    return '📬 posted';
  }

  return (
    <div className="max-w-2xl mx-auto px-4 mt-8 mb-16">
      <h1 className="font-pixel text-lg text-pink-deep mb-6">~my letters~</h1>

      {loading && <p className="font-pixel text-xs">loading...</p>}
      {!loading && letters.length === 0 && (
        <p className="font-hand text-ink/60 text-lg">
          you haven't written anything yet
        </p>
      )}

      <div className="flex flex-col gap-4">
        {letters.map((letter) => (
          <div
            key={letter.id}
            className="pixel-border p-4"
            style={{ backgroundColor: letter.color_hex }}
          >
            <div className="flex justify-between items-start gap-3">
              <div>
                <p className="font-pixel text-base text-ink/70 mb-1">
                  TO: {letter.recipient}
                </p>
                <p className="font-pixel text-sm text-ink/60">
                  {statusLabel(letter)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {letter.status !== 'locked' && (
                  <span className="font-pixel text-[10px] whitespace-nowrap">
                    💜 {letter.hearts?.[0]?.count || 0}
                    </span>
                  )}
                  <button
                  onClick={() => handleDelete(letter.id)}
                  className="font-pixel text-[9px] text-red-600 underline"
                  >
                    delete
                    </button>
                    </div>
            </div>

            {letter.status !== 'locked' && (
              <p className="font-hand text-lg mt-2 text-ink whitespace-pre-wrap">
                {letter.body}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
