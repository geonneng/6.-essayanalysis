import { useState, useEffect, createContext, useContext } from 'react'
import { supabase } from '@/lib/supabase'
import { AuthUser, AuthState } from '@/lib/types/auth'
import { getCurrentUser } from '@/lib/auth'

interface AuthContextType extends AuthState {
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const useAuthState = () => {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null
  })

  const refreshUser = async () => {
    try {
      console.log('🔄 refreshUser 호출됨')
      setState(prev => ({ ...prev, loading: true, error: null }))
      const user = await getCurrentUser()
      console.log('👤 사용자 정보:', user)
      setState({ user, loading: false, error: null })
    } catch (error) {
      console.error('❌ refreshUser 오류:', error)
      setState({ user: null, loading: false, error: (error as Error).message })
    }
  }

  const signOut = async () => {
    try {
      console.log('🚪 로그아웃 시도')
      await supabase.auth.signOut()
      console.log('✅ 로그아웃 성공')
      setState({ user: null, loading: false, error: null })
    } catch (error) {
      console.error('❌ 로그아웃 오류:', error)
      setState(prev => ({ ...prev, error: (error as Error).message }))
    }
  }

  useEffect(() => {
    console.log('🔧 useAuthState useEffect 실행')
    refreshUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔔 Auth 상태 변경:', event, session?.user?.email)
        
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('✅ 로그인 이벤트 감지')
          const user = await getCurrentUser()
          console.log('👤 로그인된 사용자:', user)
          setState({ user, loading: false, error: null })
        } else if (event === 'SIGNED_OUT') {
          console.log('🚪 로그아웃 이벤트 감지')
          setState({ user: null, loading: false, error: null })
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('🔄 토큰 갱신 이벤트 감지')
          const user = await getCurrentUser()
          setState({ user, loading: false, error: null })
        }
      }
    )

    return () => {
      console.log('🧹 useAuthState cleanup')
      subscription.unsubscribe()
    }
  }, [])

  console.log('📊 현재 인증 상태:', state)
  return { ...state, signOut, refreshUser }
}
