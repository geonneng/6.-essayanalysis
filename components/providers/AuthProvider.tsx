'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { AuthUser, AuthState } from '@/lib/types/auth'
import { getCurrentUser } from '@/lib/auth'
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
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 AuthProvider - refreshUser 호출됨')
      }
      setState(prev => ({ ...prev, loading: true, error: null }))
      const user = await getCurrentUser()
      if (process.env.NODE_ENV === 'development') {
        console.log('👤 AuthProvider - 사용자 정보:', user)
      }
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
      if (process.env.NODE_ENV === 'development') {
        console.log('🚪 AuthProvider - 로그아웃 시도')
      }
      await supabase.auth.signOut()
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ AuthProvider - 로그아웃 성공')
      }
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
    if (process.env.NODE_ENV === 'development') {
      console.log('🔧 AuthProvider - useEffect 실행')
    }
    refreshUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (process.env.NODE_ENV === 'development') {
          console.log('🔔 AuthProvider - Auth 상태 변경:', event, session?.user?.email)
        }
        
        if (event === 'SIGNED_IN' && session?.user) {
          if (process.env.NODE_ENV === 'development') {
            console.log('✅ AuthProvider - 로그인 이벤트 감지')
          }
          const user = await getCurrentUser()
          if (process.env.NODE_ENV === 'development') {
            console.log('👤 AuthProvider - 로그인된 사용자:', user)
          }
          setState({ user, loading: false, error: null })
        } else if (event === 'SIGNED_OUT') {
          if (process.env.NODE_ENV === 'development') {
            console.log('🚪 AuthProvider - 로그아웃 이벤트 감지')
          }
          setState({ user: null, loading: false, error: null })
        } else if (event === 'TOKEN_REFRESHED') {
          if (process.env.NODE_ENV === 'development') {
            console.log('🔄 AuthProvider - 토큰 갱신 이벤트 감지')
          }
          const user = await getCurrentUser()
          setState({ user, loading: false, error: null })
        }
      }
    )

    return () => {
      if (process.env.NODE_ENV === 'development') {
        console.log('🧹 AuthProvider cleanup')
      }
      subscription.unsubscribe()
    }
  }, [])

  if (process.env.NODE_ENV === 'development') {
    console.log('📊 AuthProvider - 현재 인증 상태:', state)
  }
  
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
