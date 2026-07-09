import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { AVATARS } from '../lib/constants'
import PixelAvatar from '../components/PixelAvatar'

export default function AvatarSetup() {
  const [selected, setSelected] = useState(null)
  const [saving, setSaving] = useState(false)
  const { user, refreshProfile } = useAuth()
  const navigate = useNavigate()

  const handleSave = async () => {
    if (!selected) return
    setSaving(true)
    const { error } = await supabase
      .from('profiles')
      .update({ avatar_id: selected })
      .eq('id', user.id)
    setSaving(false)
    if (!error) {
      await refreshProfile()
      navigate('/')
    }
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 px-4">
      <div className="pixel-border bg-white dark:bg-midnightCard p-6">
        <h1 className="font-pixel text-base mb-2 text-pink-deep">
          ~choose your avatar~
        </h1>
        <p className="font-hand text-ink/70 mb-5">
          pick one that feels like you 
        </p>
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
          {AVATARS.map((avatar) => (
            <button
              key={avatar.id}
              onClick={() => setSelected(avatar.id)}
              className="p-1 border-2"
              style={{
                borderColor: selected === avatar.id ? '#3D2352' : 'transparent',
                boxShadow:
                  selected === avatar.id
                    ? '2px 2px 0px 0px #3D2352'
                    : 'none'
              }}
            >
              <PixelAvatar avatar={avatar} size={56} />
            </button>
          ))}
        </div>
        <button
          onClick={handleSave}
          disabled={!selected || saving}
          className="pixel-btn w-full mt-6"
        >
          {saving ? 'saving...' : 'enter catharsis'}
        </button>
      </div>
    </div>
  )
}
