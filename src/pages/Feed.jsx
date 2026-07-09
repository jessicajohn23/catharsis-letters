import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import LetterCard from '../components/LetterCard'

export default function Feed() {
  const [letters, setLetters] = useState([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState('recent') // recent | hearts
  const { user } = useAuth()

  useEffect(() => {
    loadFeed()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortBy])

  const loadFeed = async () => {
    setLoading(true)
    // public_letters is a view (see schema.sql) that:
    //  - only returns is_public = true AND status = 'posted'
    //  - never includes author_id
    //  - includes heart_count and whether the current viewer hearted it
    const { data, error } = await supabase.rpc('get_public_feed', {
      sort_by: sortBy
    })
    if (!error) setLetters(data || [])
    setLoading(false)
  }

  return (
    <div className="max-w-3xl mx-auto px-4 mt-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-pixel text-lg text-pink-deep">~letter feed~</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setSortBy('recent')}
            className={`font-pixel text-sm px-2 py-1 border-2 ${
              sortBy === 'recent' ? 'bg-violet text-white' : 'bg-pink-deep'
            }`}
          >
            recent
          </button>
          <button
            onClick={() => setSortBy('hearts')}
            className={`font-pixel text-sm px-2 py-1 border-2 ${
              sortBy === 'hearts' ? 'bg-violet text-white' : 'bg-pink-deep'
            }`}
          >
            most loved
          </button>
        </div>
      </div>

      {loading && <p className="font-pixel text-xs">loading letters...</p>}

      {!loading && letters.length === 0 && (
        <p className="font-hand text-ink/60 text-lg">
          no letters yet, be the first to write one~
        </p>
      )}

      <div className="grid sm:grid-cols-2 gap-5">
        {letters.map((letter) => (
          <LetterCard key={letter.id} letter={letter} user={user} />
        ))}
      </div>
    </div>
  )
}
