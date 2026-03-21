import { useEffect, useState } from 'react'
import Globe from './components/Globe/Globe'
import HUDToolbar from './components/HUD/HUDToolbar'
import EntityTooltip from './components/HUD/EntityTooltip'
import EntityDetailPanel from './components/HUD/EntityDetailPanel'
import LoginPage from './components/Auth/LoginPage'
import RegisterPage from './components/Auth/RegisterPage'
import OAuthCallback from './components/Auth/OAuthCallback'
import { useAuthStore } from './stores/authStore'
import { logout } from './api/auth'

type AuthModal = 'login' | 'register' | null

function App() {
  const { isAuthenticated, user, refreshToken, clearAuth, loadFromStorage } = useAuthStore()
  const [authModal, setAuthModal] = useState<AuthModal>(null)

  // Load auth state from localStorage on mount.
  useEffect(() => {
    loadFromStorage()
  }, [loadFromStorage])

  // Handle OAuth callback route.
  const isOAuthCallback = window.location.pathname === '/auth/callback'

  const handleLogout = async () => {
    if (refreshToken) {
      await logout(refreshToken).catch(() => {})
    }
    clearAuth()
  }

  return (
    <div className="relative h-full w-full bg-black">
      {isOAuthCallback && <OAuthCallback />}
      <Globe />
      <HUDToolbar />
      <EntityTooltip />
      <EntityDetailPanel />

      {/* Auth button in top-right corner */}
      <div className="pointer-events-auto absolute top-4 right-4 z-40">
        {isAuthenticated ? (
          <div className="flex items-center gap-2">
            {user?.avatarUrl && (
              <img
                src={user.avatarUrl}
                alt=""
                className="h-7 w-7 rounded-full border border-gray-600"
              />
            )}
            <span className="text-sm text-gray-300">{user?.name || user?.email}</span>
            <button
              onClick={handleLogout}
              className="rounded bg-gray-800 px-3 py-1 text-xs text-gray-300 hover:bg-gray-700"
            >
              Sign out
            </button>
          </div>
        ) : (
          <button
            onClick={() => setAuthModal('login')}
            className="rounded bg-gray-800 px-3 py-1.5 text-sm text-gray-300 hover:bg-gray-700"
          >
            Sign in
          </button>
        )}
      </div>

      {authModal === 'login' && (
        <LoginPage
          onSwitchToRegister={() => setAuthModal('register')}
          onClose={() => setAuthModal(null)}
        />
      )}
      {authModal === 'register' && (
        <RegisterPage
          onSwitchToLogin={() => setAuthModal('login')}
          onClose={() => setAuthModal(null)}
        />
      )}
    </div>
  )
}

export default App
