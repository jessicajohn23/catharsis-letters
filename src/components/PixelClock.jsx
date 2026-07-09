import { useEffect, useState } from 'react'

export default function PixelClock() {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const date = now.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  })
  const time = now.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit'
  })

  return (
    <div className="font-pixel text-[10px] leading-relaxed text-ink dark:text-cream flex flex-col items-end">
      <span>{date}</span>
      <span>{time}</span>
    </div>
  )
}
