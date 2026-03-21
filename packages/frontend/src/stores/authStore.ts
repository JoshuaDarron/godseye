import { create } from 'zustand'
import type { User, TokenPayload } from '@godseye/shared'

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean

  setAuth: (user: User, accessToken: string, refreshToken: string) => void
  clearAuth: () => void
  loadFromStorage: () => void
}

function decodeToken(token: string): TokenPayload | null {
  try {
    const payload = token.split('.')[1]
    return JSON.parse(atob(payload))
  } catch {
    return null
  }
}

function isTokenExpired(token: string): boolean {
  const payload = decodeToken(token)
  if (!payload) return true
  return payload.exp * 1000 < Date.now()
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,

  setAuth: (user, accessToken, refreshToken) => {
    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', refreshToken)
    localStorage.setItem('user', JSON.stringify(user))
    set({ user, accessToken, refreshToken, isAuthenticated: true })
  },

  clearAuth: () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false })
  },

  loadFromStorage: () => {
    const accessToken = localStorage.getItem('accessToken')
    const refreshToken = localStorage.getItem('refreshToken')
    const userStr = localStorage.getItem('user')

    if (!accessToken || !refreshToken || !userStr) return

    // If the access token is expired but we have a refresh token,
    // keep the auth state — the API client will handle refreshing.
    if (isTokenExpired(accessToken) && !refreshToken) return

    try {
      const user = JSON.parse(userStr) as User
      set({ user, accessToken, refreshToken, isAuthenticated: true })
    } catch {
      // Corrupted storage — clear it.
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
    }
  },
}))
