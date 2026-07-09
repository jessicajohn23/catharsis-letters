import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// requireOnboarded: pass false for the onboarding pages themselves
export default function ProtectedRoute({ children, requireOnboarded = true }) {
  const { user, onboarded, loading } = useAuth()

  if (loading) {
    return (
      <div className="font-pixel text-xs text-center mt-20">loading...</div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  if (requireOnboarded && !onboarded) {
    return <Navigate to="/setup/username" replace />
  }

  return children
}
