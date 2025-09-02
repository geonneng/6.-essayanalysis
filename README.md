# 초등 교직논술 분석 플랫폼

AI 기반 초등 교직논술 분석 및 피드백 서비스입니다.

## 주요 기능

- 🔐 **이메일 로그인/회원가입**: 전통적인 이메일 기반 인증
- 🌐 **구글 소셜 로그인**: Google OAuth를 통한 간편한 인증
- 🛡️ **보안**: Supabase를 통한 안전한 인증 시스템
- 📱 **반응형 UI**: 모바일과 데스크톱에서 최적화된 사용자 경험
- 🎨 **현대적 디자인**: shadcn/ui 컴포넌트를 활용한 아름다운 인터페이스

## 기술 스택

- **Frontend**: Next.js 15, React 19, TypeScript
- **UI**: Tailwind CSS, shadcn/ui
- **인증**: Supabase Auth
- **폼 관리**: React Hook Form, Zod
- **상태 관리**: React Context API
- **아이콘**: Lucide React

## 설치 및 설정

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```env
# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Supabase 프로젝트 설정

1. [Supabase](https://supabase.com)에서 새 프로젝트를 생성합니다.
2. Authentication > Settings에서 다음을 설정합니다:
   - Site URL: `http://localhost:3000` (개발용)
   - Redirect URLs: `http://localhost:3000/auth/callback`
3. Authentication > Providers에서 Google OAuth를 활성화합니다:
   - Google Client ID와 Secret을 설정
   - Authorized redirect URI: `https://your-project.supabase.co/auth/v1/callback`

### 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 프로젝트 구조

```
├── app/                    # Next.js App Router
│   ├── auth/              # 인증 관련 페이지
│   │   ├── callback/      # OAuth 콜백 처리
│   │   └── page.tsx       # 로그인/회원가입 페이지
│   ├── layout.tsx         # 루트 레이아웃
│   └── page.tsx           # 홈페이지
├── components/             # React 컴포넌트
│   ├── auth/              # 인증 관련 컴포넌트
│   │   ├── AuthContainer.tsx
│   │   ├── LoginForm.tsx
│   │   ├── SignUpForm.tsx
│   │   ├── ProtectedRoute.tsx
│   │   └── UserProfile.tsx
│   ├── providers/         # Context Provider
│   │   └── AuthProvider.tsx
│   └── ui/                # shadcn/ui 컴포넌트
├── hooks/                 # 커스텀 훅
│   └── useAuth.ts         # 인증 상태 관리
├── lib/                   # 유틸리티 및 설정
│   ├── auth.ts            # 인증 관련 함수
│   ├── supabase.ts        # Supabase 클라이언트
│   └── types/             # TypeScript 타입 정의
│       └── auth.ts        # 인증 관련 타입
└── styles/                # 전역 스타일
```

## 사용 방법

### 로그인

1. `/auth` 페이지로 이동
2. 이메일과 비밀번호를 입력하거나 구글 로그인 버튼 클릭
3. 인증 성공 시 홈페이지로 자동 리다이렉트

### 회원가입

1. `/auth` 페이지에서 "회원가입" 링크 클릭
2. 이메일, 비밀번호, 비밀번호 확인 입력
3. 이메일 인증 후 로그인 가능

### 보호된 라우트

`ProtectedRoute` 컴포넌트로 감싸면 인증된 사용자만 접근 가능합니다:

```tsx
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

export default function ProtectedPage() {
  return (
    <ProtectedRoute>
      <div>인증된 사용자만 볼 수 있는 내용</div>
    </ProtectedRoute>
  )
}
```

## 주요 컴포넌트

### AuthProvider

전체 앱에 인증 상태를 제공하는 Context Provider입니다.

### useAuth

인증 상태와 함수를 제공하는 커스텀 훅입니다:

```tsx
const { user, loading, error, signOut } = useAuth()
```

### LoginForm / SignUpForm

로그인과 회원가입을 위한 폼 컴포넌트입니다. 이메일과 구글 소셜 로그인을 모두 지원합니다.

## 환경 변수

| 변수명 | 설명 | 필수 |
|--------|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 익명 키 | ✅ |

## 배포

### Vercel 배포

1. Vercel에 프로젝트를 연결
2. 환경 변수 설정
3. Supabase 프로젝트의 Site URL과 Redirect URLs를 프로덕션 도메인으로 업데이트

### 다른 플랫폼

다른 호스팅 플랫폼을 사용하는 경우, Supabase 프로젝트 설정의 Site URL과 Redirect URLs를 해당 도메인으로 변경하세요.

## 문제 해결

### 구글 로그인이 작동하지 않는 경우

1. Supabase 프로젝트의 Google OAuth 설정 확인
2. Google Cloud Console에서 OAuth 2.0 클라이언트 ID와 Secret 확인
3. Authorized redirect URI가 올바르게 설정되었는지 확인

### 이메일 인증이 작동하지 않는 경우

1. Supabase 프로젝트의 이메일 설정 확인
2. SMTP 설정이 올바른지 확인
3. 스팸 폴더 확인

## 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 기여

버그 리포트나 기능 제안은 이슈를 통해 해주세요. 풀 리퀘스트도 환영합니다.
