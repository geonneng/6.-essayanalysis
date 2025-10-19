'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { AuthUser, AuthState } from '@/lib/types/auth'
import { userToAuthUser } from '@/lib/auth'
import { AuthContext, useAuth } from '@/hooks/useAuth'

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null
  })
  
  const [isClient, setIsClient] = useState(false)

  const refreshUser = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))
      
      // getSession은 로컬 캐시를 사용하므로 매우 빠름
      const { data: { session } } = await supabase.auth.getSession()
      const user = session?.user ? userToAuthUser(session.user) : null
      
      setState({ user, loading: false, error: null })
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('❌ AuthProvider - refreshUser 오류:', error)
      }
      setState({ user: null, loading: false, error: (error as Error).message })
    }
  }

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      setState({ user: null, loading: false, error: null })
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('❌ AuthProvider - 로그아웃 오류:', error)
      }
      setState(prev => ({ ...prev, error: (error as Error).message }))
    }
  }

  useEffect(() => {
    // 클라이언트에서만 실행되도록 설정
    setIsClient(true)
    refreshUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (process.env.NODE_ENV === 'development') {
          console.log('🔔 Auth 상태 변경:', event, session?.user?.email)
        }
        
        // 세션에서 직접 유저 정보 사용 (추가 API 호출 없음)
        if (event === 'SIGNED_IN' && session?.user) {
          const user = userToAuthUser(session.user)
          setState({ user, loading: false, error: null })
        } else if (event === 'SIGNED_OUT') {
          setState({ user: null, loading: false, error: null })
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          const user = userToAuthUser(session.user)
          setState({ user, loading: false, error: null })
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])
  
  const contextValue = {
    ...state,
    isClient,
    signOut,
    refreshUser
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}
