import { supabase, checkSupabaseConnection } from './supabase'
import { LoginCredentials, SignUpCredentials, AuthUser } from './types/auth'

export const signUp = async (credentials: SignUpCredentials) => {
  // 연결 확인
  await checkSupabaseConnection()
  
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
  // 연결 확인
  await checkSupabaseConnection()
  
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
  // 연결 확인
  await checkSupabaseConnection()
  
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
  // 연결 확인
  await checkSupabaseConnection()
  
  const { error } = await supabase.auth.signOut()
  
  if (error) {
    throw new Error(error.message)
  }
}

export const getCurrentUser = async (): Promise<AuthUser | null> => {
  // 연결 확인
  await checkSupabaseConnection()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null
  
  return {
    id: user.id,
    email: user.email!,
    created_at: user.created_at,
    updated_at: user.updated_at || user.created_at
  }
}

export const resetPassword = async (email: string) => {
  // 연결 확인
  await checkSupabaseConnection()
  
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`
  })

  if (error) {
    throw new Error(error.message)
  }
}
