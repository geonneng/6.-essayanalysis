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

  const refreshUser = async () => {
    try {
      console.log('🔄 AuthProvider - refreshUser 호출됨')
      setState(prev => ({ ...prev, loading: true, error: null }))
      const user = await getCurrentUser()
      console.log('👤 AuthProvider - 사용자 정보:', user)
      setState({ user, loading: false, error: null })
    } catch (error) {
      console.error('❌ AuthProvider - refreshUser 오류:', error)
      setState({ user: null, loading: false, error: (error as Error).message })
    }
  }

  const signOut = async () => {
    try {
      console.log('🚪 AuthProvider - 로그아웃 시도')
      await supabase.auth.signOut()
      console.log('✅ AuthProvider - 로그아웃 성공')
      setState({ user: null, loading: false, error: null })
    } catch (error) {
      console.error('❌ AuthProvider - 로그아웃 오류:', error)
      setState(prev => ({ ...prev, error: (error as Error).message }))
    }
  }

  useEffect(() => {
    console.log('🔧 AuthProvider - useEffect 실행')
    refreshUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔔 AuthProvider - Auth 상태 변경:', event, session?.user?.email)
        
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('✅ AuthProvider - 로그인 이벤트 감지')
          const user = await getCurrentUser()
          console.log('👤 AuthProvider - 로그인된 사용자:', user)
          setState({ user, loading: false, error: null })
        } else if (event === 'SIGNED_OUT') {
          console.log('🚪 AuthProvider - 로그아웃 이벤트 감지')
          setState({ user: null, loading: false, error: null })
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('🔄 AuthProvider - 토큰 갱신 이벤트 감지')
          const user = await getCurrentUser()
          setState({ user, loading: false, error: null })
        }
      }
    )

    return () => {
      console.log('🧹 AuthProvider cleanup')
      subscription.unsubscribe()
    }
  }, [])

  console.log('📊 AuthProvider - 현재 인증 상태:', state)
  
  const contextValue = {
    ...state,
    signOut,
    refreshUser
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}
