import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'

const USERNAME_REGEX = /^[a-zA-Z0-9_.]{3,20}$/

export default function UsernameSetup() {
  const [username, setUsername] = useState('')
  const [status, setStatus] = useState('idle') // idle | checking | available | taken | invalid
  const [saving, setSaving] = useState(false)
  const { user, refreshProfile } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!username) {
      setStatus('idle')
      return
    }
    if (!USERNAME_REGEX.test(username)) {
      setStatus('invalid')
      return
    }

    setStatus('checking')
    const handle = setTimeout(async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id')
        .ilike('username', username)
        .maybeSingle()
      setStatus(data ? 'taken' : 'available')
    }, 400)

    return () => clearTimeout(handle)
  }, [username])

  const handleSave = async () => {
    if (status !== 'available') return
    setSaving(true)
    const { error } = await supabase
      .from('profiles')
      .upsert({ id: user.id, username })
    setSaving(false)
    if (!error) {
      await refreshProfile()
      navigate('/setup/avatar')
    } else {
      setStatus('taken')
    }
  }

  const helperText = {
    idle: 'letters, numbers, underscore, period · 3-20 characters',
    checking: 'checking availability...',
    available: '✓ available',
    taken: '✗ already taken',
    invalid: '✗ invalid — only letters, numbers, _ and . (3-20 chars)'
  }[status]

  const helperColor = {
    idle: 'text-ink/60',
    checking: 'text-ink/60',
    available: 'text-green-600',
    taken: 'text-red-600',
    invalid: 'text-red-600'
  }[status]

  return (
    <div className="max-w-md mx-auto mt-10 px-4">
      <div className="pixel-border bg-white dark:bg-midnightCard p-6">
        <h1 className="font-pixel text-base mb-2 text-pink-deep">
          pick a username
        </h1>
        <p className="font-hand text-ink/70 mb-4">
          this is the name that will show up on your letters and profile
        </p>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value.trim())}
          placeholder="username"
          className="pixel-input w-full"
          maxLength={20}
        />
        <p className={`font-pixel text-sm mt-2 ${helperColor}`}>
          {helperText}
        </p>
        <button
          onClick={handleSave}
          disabled={status !== 'available' || saving}
          className="pixel-btn w-full mt-5"
        >
          {saving ? 'saving...' : 'continue'}
        </button>
      </div>
    </div>
  )
}
