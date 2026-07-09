import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import PixelClock from './PixelClock'
import NotificationBell from './NotificationBell'

export default function Navbar() {
  const { user, onboarded } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  return (
    <nav className="pixel-border bg-white dark:bg-midnightCard mx-3 mt-3 px-4 py-3 flex items-center justify-between flex-wrap gap-3">
      <Link to="/" className="font-pixel text-sm text-pink-deep">
        CATHARSIS: a quiet place for unfinished thoughts and unspoken feelings.
      </Link>

      <div className="flex items-center gap-4 flex-wrap">
        {user && onboarded && (
          <>
            <Link to="/" className="font-pixel text-base">
              feed
            </Link>
            <Link to="/compose" className="font-pixel text-base">
              write
            </Link>
            <Link to="/my-letters" className="font-pixel text-base">
              my letters
            </Link>
            <Link to="/settings" className="font-pixel text-base">
              settings
            </Link>
          </>
        )}
        {!user && (
          <button
            onClick={() => navigate('/login')}
            className="pixel-btn"
          >
            sign in
          </button>
        )}
        <button
          onClick={toggleTheme}
          className="font-pixel text-base"
          aria-label="Toggle dark mode"
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
        <NotificationBell />
        <PixelClock />
      </div>
    </nav>
  )
}
