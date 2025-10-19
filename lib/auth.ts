import { supabase } from './supabase'
import { LoginCredentials, SignUpCredentials, AuthUser } from './types/auth'
import type { User } from '@supabase/supabase-js'

// User 객체를 AuthUser로 변환하는 헬퍼 함수
export const userToAuthUser = (user: User): AuthUser => ({
  id: user.id,
  email: user.email!,
  created_at: user.created_at,
  updated_at: user.updated_at || user.created_at
})

export const signUp = async (credentials: SignUpCredentials) => {
  const { email, password } = credentials
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export const signIn = async (credentials: LoginCredentials) => {
  const { email, password } = credentials
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`
    }
  })

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  
  if (error) {
    throw new Error(error.message)
  }
}

// 빠른 세션 기반 사용자 조회 (캐시 사용)
export const getCurrentUser = async (): Promise<AuthUser | null> => {
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session?.user) return null
  
  return userToAuthUser(session.user)
}

export const resetPassword = async (email: string) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`
  })

  if (error) {
    throw new Error(error.message)
  }
}
