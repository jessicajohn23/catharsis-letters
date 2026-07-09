import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { AVATARS } from '../lib/constants'
import PixelAvatar from '../components/PixelAvatar'

const USERNAME_REGEX = /^[a-zA-Z0-9_.]{3,20}$/

export default function Settings() {
  const { profile, user, signOut, refreshProfile } = useAuth()
  const [username, setUsername] = useState(profile?.username || '')
  const [status, setStatus] = useState('idle')
  const [selectedAvatar, setSelectedAvatar] = useState(profile?.avatar_id)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    if (!username || username === profile?.username) {
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
  }, [username, profile?.username])

  const handleSave = async () => {
    setSaving(true)
    setMessage('')
    const updates = { avatar_id: selectedAvatar }
    if (username !== profile?.username && status === 'available') {
      updates.username = username
    }
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
    setSaving(false)
    if (!error) {
      await refreshProfile()
      setMessage('saved!')
    } else {
      setMessage(error.message)
    }
  }

  const handleLogout = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="max-w-xl mx-auto px-4 mt-8 mb-16">
      <div className="pixel-border bg-white dark:bg-midnightCard p-6 flex flex-col gap-6">
        <h1 className="font-pixel text-lg text-pink-deep">SETTINGS</h1>

        <div>
          <label className="font-pixel text-base block mb-1">
            USERNAME
          </label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value.trim())}
            className="pixel-input w-full"
            maxLength={20}
          />
          {username !== profile?.username && (
            <p className="font-pixel text-sm mt-1">
              {
                {
                  idle: '',
                  checking: 'checking...',
                  available: '✓ available',
                  taken: '✗ already taken',
                  invalid: '✗ invalid format'
                }[status]
              }
            </p>
          )}
        </div>

        <div>
          <p className="font-pixel text-base mb-2">AVATAR</p>
          <div className="grid grid-cols-5 gap-2">
            {AVATARS.map((avatar) => (
              <button
                key={avatar.id}
                onClick={() => setSelectedAvatar(avatar.id)}
                className="p-1 border-2"
                style={{
                  borderColor:
                    selectedAvatar === avatar.id ? '#3D2352' : 'transparent'
                }}
              >
                <PixelAvatar avatar={avatar} size={44} />
              </button>
            ))}
          </div>
        </div>

        {message && <p className="font-hand text-ink/70">{message}</p>}

        <button onClick={handleSave} disabled={saving} className="pixel-btn">
          {saving ? 'saving...' : 'save changes'}
        </button>

        <button
          onClick={handleLogout}
          className="pixel-btn pixel-btn-outline"
        >
          LOG OUT
        </button>
      </div>
    </div>
  )
}
