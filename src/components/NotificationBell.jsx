import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'

export default function NotificationBell() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!user) return
    load()
    // poll every 60s - cheap and enough for this use case
    const interval = setInterval(load, 60000)
    return () => clearInterval(interval)
  }, [user])

  const load = async () => {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .eq('read', false)
      .order('created_at', { ascending: false })
    setNotifications(data || [])
  }

  const markAllRead = async () => {
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', user.id)
      .eq('read', false)
    setNotifications([])
  }

  if (!user) return null

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="font-pixel text-base relative"
        aria-label="Notifications"
      >
        🔔
        {notifications.length > 0 && (
          <span className="absolute -top-2 -right-2 bg-pink-deep text-white text-[8px] w-4 h-4 flex items-center justify-center rounded-full">
            {notifications.length}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-64 pixel-border bg-white dark:bg-midnightCard p-3 z-10">
          {notifications.length === 0 ? (
            <p className="font-hand text-ink/60">nothing new</p>
          ) : (
            <>
              <ul className="flex flex-col gap-2 max-h-56 overflow-y-auto">
                {notifications.map((n) => (
                  <li key={n.id} className="font-hand text-ink text-sm">
                    💌 a letter you locked away has unlocked
                  </li>
                ))}
              </ul>
              <button
                onClick={markAllRead}
                className="font-pixel text-[8px] mt-3 underline"
              >
                mark all read
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
