import { useEffect, useRef } from 'react'
import { getMe } from '../../api/auth'
import { useAuthStore } from '../../stores/authStore'

/**
 * Reads access_token and refresh_token from URL query params after an OAuth redirect,
 * fetches the user profile, and stores the auth state.
 */
export default function OAuthCallback() {
  const setAuth = useAuthStore((s) => s.setAuth)
  const processed = useRef(false)

  useEffect(() => {
    if (processed.current) return
    processed.current = true

    const params = new URLSearchParams(window.location.search)
    const accessToken = params.get('access_token')
    const refreshToken = params.get('refresh_token')

    if (!accessToken || !refreshToken) return

    // Clean the URL so tokens aren't visible in the address bar.
    window.history.replaceState({}, '', '/')

    getMe(accessToken)
      .then(({ user }) => {
        setAuth(user, accessToken, refreshToken)
      })
      .catch(() => {
        // If fetching user fails, still store the tokens — the user info
        // can be decoded from the JWT as a fallback.
        try {
          const payload = JSON.parse(atob(accessToken.split('.')[1]))
          setAuth(
            {
              id: payload.uid,
              email: payload.email,
              name: payload.name,
              avatarUrl: '',
              provider: '',
              createdAt: '',
              updatedAt: '',
            },
            accessToken,
            refreshToken,
          )
        } catch {
          // Token is malformed — ignore.
        }
      })
  }, [setAuth])

  return null
}
