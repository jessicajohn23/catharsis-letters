import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { LETTER_COLORS } from '../lib/constants'
import StampAndColorPicker from '../components/StampAndColorPicker'

export default function Compose() {
  const [step, setStep] = useState('type') // type | write
  const [isFuture, setIsFuture] = useState(false)
  const [recipient, setRecipient] = useState('')
  const [body, setBody] = useState('')
  const [color, setColor] = useState(LETTER_COLORS[0].hex)
  const [stamp, setStamp] = useState(null)
  const [unlockDate, setUnlockDate] = useState('')
  const [futureVisibility, setFutureVisibility] = useState('private') // private | public
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const { user } = useAuth()
  const navigate = useNavigate()

  const handlePost = async () => {
    setError('')
    if (!recipient.trim() || !body.trim()) {
      setError('fill in both the "to:" and the letter itself')
      return
    }
    if (isFuture && !unlockDate) {
      setError('pick an unlock date for your future letter')
      return
    }
    if (isFuture && new Date(unlockDate) <= new Date()) {
      setError('the unlock date needs to be in the future')
      return
    }

    setSaving(true)
    const payload = {
      author_id: user.id,
      recipient: recipient.trim(),
      body: body.trim(),
      color_hex: color,
      stamp,
      is_future: isFuture,
      unlock_at: isFuture ? new Date(unlockDate).toISOString() : null,
      // a future letter is 'locked' until unlock time; a normal letter posts immediately
      status: isFuture ? 'locked' : 'posted',
      // for future letters, whether it should also go public once unlocked
      future_visibility: isFuture ? futureVisibility : null,
      is_public: isFuture ? false : true,
      posted_at: isFuture ? null : new Date().toISOString()
    }

    const { error } = await supabase.from('letters').insert(payload)
    setSaving(false)

    if (error) {
      setError(error.message)
    } else {
      navigate(isFuture ? '/my-letters' : '/')
    }
  }

  if (step === 'type') {
    return (
      <div className="max-w-md mx-auto mt-10 px-4">
        <div className="pixel-border bg-white dark:bg-midnightCard p-6 text-center">
          <h1 className="font-pixel text-base mb-6 text-pink-deep">
            what kind of letter?
          </h1>
          <div className="flex flex-col gap-3">
            <button
              className="pixel-btn"
              onClick={() => {
                setIsFuture(false)
                setStep('write')
              }}
            >
              a letter for now
            </button>
            <button
              className="pixel-btn pixel-btn-outline"
              onClick={() => {
                setIsFuture(true)
                setStep('write')
              }}
            >
              a letter to the future
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 px-4 mb-16">
      <div className="pixel-border bg-white dark:bg-midnightCard p-6 flex flex-col gap-5">
        <h1 className="font-pixel text-base text-pink-deep">
          {isFuture ? 'a letter to the future~' : 'write your letter'}
        </h1>

        <div>
          <label className="font-pixel text-base block mb-1">to:</label>
          <input
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="who you never got to say it to..."
            className="pixel-input w-full"
            maxLength={60}
          />
        </div>

        <div>
          <label className="font-pixel text-base block mb-1">
            your letter
          </label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={8}
            placeholder="say what you wish you could say..."
            className="pixel-input w-full font-hand text-xl"
            maxLength={3000}
          />
        </div>

        <StampAndColorPicker
          color={color}
          onColorChange={setColor}
          stamp={stamp}
          onStampChange={setStamp}
        />

        {isFuture && (
          <div className="flex flex-col gap-3 border-t-2 border-ink/10 pt-4">
            <div>
              <label className="font-pixel text-base block mb-1">
                unlock on:
              </label>
              <input
                type="datetime-local"
                value={unlockDate}
                onChange={(e) => setUnlockDate(e.target.value)}
                className="pixel-input"
                min={new Date().toISOString().slice(0, 16)}
              />
            </div>
            <div>
              <p className="font-pixel text-base mb-1">
                when it unlocks, should it...
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setFutureVisibility('private')}
                  className={`font-pixel text-sm px-3 py-2 border-2 ${
                    futureVisibility === 'private'
                      ? 'bg-violet text-white'
                      : 'bg-pink'
                  }`}
                >
                  stay just for you
                </button>
                <button
                  onClick={() => setFutureVisibility('public')}
                  className={`font-pixel text-sm px-3 py-2 border-2 ${
                    futureVisibility === 'public'
                      ? 'bg-violet text-white'
                      : 'bg-pink'
                  }`}
                >
                  post anonymously
                </button>
              </div>
            </div>
          </div>
        )}

        {error && <p className="font-hand text-red-600">{error}</p>}

        <button onClick={handlePost} disabled={saving} className="pixel-btn">
          {saving ? 'sending...' : isFuture ? 'lock it away' : 'post anonymously'}
        </button>
      </div>
    </div>
  )
}
