import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// 더미 값인지 확인
const isDummyConfig = supabaseUrl.includes('example.supabase.co') || supabaseAnonKey === 'dummy-key-for-testing'

if (isDummyConfig) {
  console.warn('⚠️ 더미 Supabase 설정이 감지되었습니다. 실제 프로젝트 정보로 업데이트해주세요.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 연결 상태 확인 함수
export const checkSupabaseConnection = async () => {
  if (isDummyConfig) {
    throw new Error('Supabase 설정이 더미 값입니다. .env.local 파일을 실제 프로젝트 정보로 업데이트해주세요.')
  }
  
  try {
    const { data, error } = await supabase.auth.getSession()
    if (error) {
      throw new Error(`Supabase 연결 실패: ${error.message}`)
    }
    return true
  } catch (error) {
    throw new Error(`Supabase 연결 확인 실패: ${error}`)
  }
}
