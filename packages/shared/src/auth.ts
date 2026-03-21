/** Authenticated user profile returned from the auth service. */
export interface User {
  id: string
  email: string
  name: string
  avatarUrl: string
  provider: string
  createdAt: string
  updatedAt: string
}

/** Response from login, register, and refresh endpoints. */
export interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: User
}

/** Decoded JWT access token payload (client-side decode via atob). */
export interface TokenPayload {
  uid: string
  email: string
  name: string
  iss: string
  iat: number
  exp: number
}
