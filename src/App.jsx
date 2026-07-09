import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import Feed from './pages/Feed'
import SignUp from './pages/SignUp'
import Login from './pages/Login'
import UsernameSetup from './pages/UsernameSetup'
import AvatarSetup from './pages/AvatarSetup'
import Compose from './pages/Compose'
import MyLetters from './pages/MyLetters'
import Settings from './pages/Settings'

export default function App() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Feed />
            </ProtectedRoute>
          }
        />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/setup/username"
          element={
            <ProtectedRoute requireOnboarded={false}>
              <UsernameSetup />
            </ProtectedRoute>
          }
        />
        <Route
          path="/setup/avatar"
          element={
            <ProtectedRoute requireOnboarded={false}>
              <AvatarSetup />
            </ProtectedRoute>
          }
        />
        <Route
          path="/compose"
          element={
            <ProtectedRoute>
              <Compose />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-letters"
          element={
            <ProtectedRoute>
              <MyLetters />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  )
}
