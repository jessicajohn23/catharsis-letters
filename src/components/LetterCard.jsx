import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { getReadableTextColor } from '../lib/constants'

export default function LetterCard({ letter, onHeartChange }) {
  const { user } = useAuth()
  const [hearted, setHearted] = useState(letter.viewer_has_hearted)
  const [heartCount, setHeartCount] = useState(letter.heart_count)
  const [busy, setBusy] = useState(false)
  const textColor = getReadableTextColor(letter.color_hex)

  const toggleHeart = async () => {
    if (!user || busy) return
    setBusy(true)
    const nextHearted = !hearted
    // optimistic update
    setHearted(nextHearted)
    setHeartCount((c) => c + (nextHearted ? 1 : -1))

    try {
      if (nextHearted) {
        await supabase
          .from('hearts')
          .insert({ letter_id: letter.id, user_id: user.id })
      } else {
        await supabase
          .from('hearts')
          .delete()
          .eq('letter_id', letter.id)
          .eq('user_id', user.id)
      }
      onHeartChange?.(letter.id, nextHearted)
    } catch (err) {
      // revert on failure
      setHearted(!nextHearted)
      setHeartCount((c) => c + (nextHearted ? -1 : 1))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div
      className="pixel-border p-4 relative flex flex-col gap-3 break-words"
      style={{ backgroundColor: letter.color_hex }}
    >
      {letter.stamp && (
        <div className="absolute -top-3 -right-3 text-2xl rotate-12 select-none">
          {letter.stamp}
        </div>
      )}
      <div className="font-pixel text-[10px]" style={{ color: textColor, opacity: 0.7 }}>
        TO: {letter.recipient || 'someone'}
      </div>
      <p className="font-hand text-xl leading-snug whitespace-pre-wrap" style={{ color: textColor }}>
        {letter.body}
      </p>
      <div className="flex items-center justify-between mt-2">
        <span className="font-pixel text-[9px]" style={{ color: textColor, opacity: 0.6 }}>
          {new Date(letter.posted_at || letter.created_at).toLocaleDateString()}
</span>
        <button
          onClick={toggleHeart}
          disabled={!user || busy}
          className="flex items-center gap-1 font-pixel text-base disabled:opacity-60"
          aria-label={hearted ? 'Remove heart' : 'Heart this letter'}
        >
          <span className={hearted ? '' : 'grayscale opacity-70'}>💜</span>
          <span>{heartCount}</span>
        </button>
      </div>
    </div>
  )
}
