export interface AuthUser {
  id: string
  email: string
  created_at: string
  updated_at: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface SignUpCredentials {
  email: string
  password: string
  confirmPassword: string
}

export interface AuthState {
  user: AuthUser | null
  loading: boolean
  error: string | null
}
