# Supabase 설정 가이드

## 1. Supabase 프로젝트 설정

### 데이터베이스 테이블 생성

Supabase가 만료되어 테이블이 삭제된 경우, 다음 단계를 따라 테이블을 다시 생성하세요:

1. **Supabase Dashboard 접속**
   - https://supabase.com 에 로그인
   - 프로젝트 선택

2. **SQL Editor 열기**
   - 왼쪽 메뉴에서 "SQL Editor" 클릭
   - "New Query" 버튼 클릭

3. **SQL 스크립트 실행**
   - `supabase_schema.sql` 파일의 내용을 복사
   - SQL Editor에 붙여넣기
   - "Run" 버튼 클릭

### 생성되는 테이블

- **user_profiles**: 사용자 프로필 및 크레딧 관리
- **analysis_history**: 논술 분석 히스토리 저장

## 2. 환경 변수 확인

`.env.local` 파일에 다음 변수가 올바르게 설정되어 있는지 확인하세요:

```env
# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Gemini API 설정
GEMINI_API_KEY=your-gemini-api-key-here

# 네이버 클로바 OCR 설정 (선택사항)
NAVER_CLOVA_OCR_API_URL=your-api-url-here
NAVER_CLOVA_OCR_SECRET_KEY=your-secret-key-here
```

### Supabase 설정 값 찾기

1. **Project URL**: 
   - Supabase Dashboard > Settings > API
   - "Project URL" 복사

2. **Anon Key**:
   - Supabase Dashboard > Settings > API
   - "Project API keys" 섹션에서 "anon" "public" 키 복사

## 3. Gemini API 문제 해결

### 사용 가능한 모델 확인

브라우저에서 다음 URL에 접속하여 사용 가능한 Gemini 모델을 확인하세요:

```
http://localhost:3000/api/list-models
```

이 엔드포인트는 현재 API 키로 사용 가능한 모든 모델 목록을 보여줍니다.

### Gemini API 키 발급

1. [Google AI Studio](https://makersuite.google.com/app/apikey) 접속
2. "Create API Key" 클릭
3. 새 프로젝트 생성 또는 기존 프로젝트 선택
4. API 키 복사하여 `.env.local` 파일에 추가

### API 키가 작동하지 않는 경우

- API 키가 만료되었을 수 있습니다
- API 키에 Gemini API 사용 권한이 없을 수 있습니다
- 새 API 키를 발급받아 다시 시도하세요

## 4. 인증 설정

### Google OAuth (선택사항)

1. **Google Cloud Console**
   - https://console.cloud.google.com 접속
   - 프로젝트 생성 또는 선택

2. **OAuth 2.0 클라이언트 ID 생성**
   - APIs & Services > Credentials
   - "Create Credentials" > "OAuth client ID"
   - Application type: Web application
   - Authorized redirect URIs: `https://your-project-id.supabase.co/auth/v1/callback`

3. **Supabase에 설정**
   - Supabase Dashboard > Authentication > Providers
   - Google 활성화
   - Client ID와 Client Secret 입력

## 5. 문제 해결

### 테이블이 생성되지 않은 경우

```sql
-- auth.users 테이블 확인
SELECT * FROM auth.users LIMIT 5;

-- 생성된 테이블 확인
SELECT tablename FROM pg_tables WHERE schemaname = 'public';
```

### RLS (Row Level Security) 문제

테이블에 접근할 수 없는 경우:

1. Supabase Dashboard > Authentication > Policies
2. 각 테이블의 정책이 올바르게 생성되었는지 확인
3. 필요시 SQL Editor에서 다시 실행

### 서버 재시작

환경 변수를 변경한 후에는 반드시 개발 서버를 재시작하세요:

```bash
# Ctrl+C로 서버 중지 후
npm run dev
```

## 6. 테스트

1. **회원가입 테스트**
   - http://localhost:3000/signup 접속
   - 이메일과 비밀번호로 회원가입

2. **로그인 테스트**
   - http://localhost:3000/login 접속
   - 생성한 계정으로 로그인

3. **논술 분석 테스트**
   - http://localhost:3000/essay 접속
   - 샘플 문제와 답안 입력
   - "분석 시작하기" 클릭

4. **모델 목록 확인**
   - http://localhost:3000/api/list-models 접속
   - 사용 가능한 Gemini 모델 확인

## 7. 추가 도움말

문제가 계속되는 경우:

1. 브라우저 개발자 도구 (F12) > Console 탭에서 오류 확인
2. 터미널에서 서버 로그 확인
3. `.env.local` 파일의 모든 값이 올바른지 재확인
4. Supabase Dashboard에서 실시간 로그 확인 (Logs 메뉴)

