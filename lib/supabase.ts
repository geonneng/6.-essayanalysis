import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// 더미 값이거나 환경변수 미설정 여부 확인 (안전 가드 포함)
const isDummyConfig =
  !supabaseUrl ||
  !supabaseAnonKey ||
  supabaseUrl.includes('example.supabase.co') ||
  supabaseAnonKey === 'dummy-key-for-testing'

if (isDummyConfig) {
  console.warn('⚠️ Supabase 설정이 누락되었거나 더미 값입니다. .env.local을 실제 프로젝트 정보로 업데이트하세요.')
}

// 환경변수가 없을 때는 즉시 createClient를 호출하지 않고, 접근 시 명확한 에러를 던지는 프록시를 사용
const createThrowingProxy = (message: string) =>
  new Proxy({}, {
    get() {
      throw new Error(message)
    }
  }) as unknown as SupabaseClient

export const supabase: SupabaseClient = isDummyConfig
  ? createThrowingProxy('Supabase 환경변수가 누락되었습니다. NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY를 설정하세요.')
  : createClient(supabaseUrl!, supabaseAnonKey!)

// 연결 상태 확인 함수
export const checkSupabaseConnection = async () => {
  if (isDummyConfig) {
    throw new Error('Supabase 설정이 누락되었거나 더미 값입니다. .env.local 파일을 실제 프로젝트 정보로 업데이트해주세요.')
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
