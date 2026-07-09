import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    setLoading(false)
    if (error) {
      setError(error.message)
    } else {
      navigate('/')
    }
  }

  const handleOAuth = async (provider) => {
    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: window.location.origin }
    })
  }

  return (
    <div className="max-w-md mx-auto mt-10 px-4">
      <div className="pixel-border bg-white dark:bg-midnightCard p-6">
        <h1 className="font-pixel text-lg mb-6 text-pink-deep">Welcome back</h1>

        <form onSubmit={handleLogin} className="flex flex-col gap-3">
          <input
            type="email"
            required
            placeholder="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pixel-input"
          />
          <input
            type="password"
            required
            placeholder="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pixel-input"
          />
          {error && <p className="font-hand text-red-600 text-sm">{error}</p>}
          <button disabled={loading} className="pixel-btn mt-2">
            {loading ? 'signing in...' : 'Sign in'}
          </button>
        </form>

        <div className="my-5 flex items-center gap-2">
          <div className="h-px bg-ink/20 flex-1" />
          <span className="font-pixel text-sm text-ink/50">or</span>
          <div className="h-px bg-ink/20 flex-1" />
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={() => handleOAuth('google')}
            className="pixel-btn pixel-btn-outline"
          >
            Continue with Google
          </button>
        </div>

        <p className="font-hand text-center mt-6 text-ink/70">
          New here?{' '}
          <Link to="/signup" className="text-pink-deep underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  )
}
