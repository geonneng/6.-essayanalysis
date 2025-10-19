# Google OAuth 승인 가이드

## 문제: "Google hasn't verified this app" 또는 "액세스 차단" 오류

휴대폰에서 로그인 시 Google이 차단하는 이유:
- OAuth 앱이 **테스트 모드**로 설정되어 있음
- **승인되지 않은 사용자**만 로그인 가능
- WebView 차단 정책

## 해결 방법

### 옵션 1: 즉시 해결 (이메일 로그인 사용)

Google 로그인 없이 이메일 로그인 사용:

```
1. /auth 페이지 접속
2. "이메일로 회원가입" 선택
3. 이메일 + 비밀번호 입력
4. Supabase 인증 이메일 확인
5. 로그인 완료
```

**장점:**
- ✅ 즉시 사용 가능
- ✅ Google 승인 불필요
- ✅ 모든 기기에서 작동

### 옵션 2: Google OAuth 프로덕션 전환

#### Step 1: Google Cloud Console 설정

1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 프로젝트 선택
3. **APIs & Services** → **OAuth consent screen**

#### Step 2: Publishing status 변경

현재 상태 확인:
```
Publishing status: Testing ❌
↓ 변경
Publishing status: In production ✅
```

**테스트 모드 → 프로덕션 전환:**

1. **OAuth consent screen** 페이지
2. **PUBLISH APP** 버튼 클릭
3. 확인 대화상자에서 **CONFIRM** 클릭

#### Step 3: 승인된 도메인 추가

**Authorized domains** 섹션:
```
vercel.app
your-domain.com (커스텀 도메인이 있다면)
```

#### Step 4: OAuth Credentials 설정

**Credentials** 페이지에서:

1. OAuth 2.0 Client ID 선택
2. **Authorized redirect URIs** 확인:
```
https://your-project.vercel.app/auth/callback
https://your-supabase-url.supabase.co/auth/v1/callback
```

### 옵션 3: 테스트 사용자 추가 (임시 해결)

프로덕션 전환 없이 특정 사용자만 허용:

1. **OAuth consent screen** → **Test users**
2. **ADD USERS** 클릭
3. 테스트할 Gmail 주소 추가
4. **SAVE**

**제한사항:**
- 최대 100명까지만 추가 가능
- 추가된 사용자만 로그인 가능
- 일반 사용자는 차단됨

## Supabase 설정 확인

### 1. Supabase Dashboard 확인

1. [Supabase Dashboard](https://supabase.com/dashboard) 접속
2. 프로젝트 선택
3. **Authentication** → **Providers**
4. **Google** 설정 확인:

```
Client ID: [Google OAuth Client ID]
Client Secret: [Google OAuth Client Secret]
Redirect URL: https://[project-id].supabase.co/auth/v1/callback
```

### 2. Authorized redirect URIs

Google Cloud Console에서 다음 URI들이 모두 추가되어 있는지 확인:

```
# Supabase Callback
https://[project-id].supabase.co/auth/v1/callback

# Vercel Production
https://your-project.vercel.app/auth/callback

# 로컬 개발 (개발용)
http://localhost:3000/auth/callback
```

## 앱 내에서 Google 로그인 버튼 제거 (선택사항)

Google OAuth 승인을 받기 전까지 버튼을 숨기려면:

```typescript
// app/auth/page.tsx
// Google 로그인 버튼을 주석 처리하거나 조건부로 표시

{process.env.NEXT_PUBLIC_ENABLE_GOOGLE_LOGIN === 'true' && (
  <Button onClick={handleGoogleLogin}>
    Google로 로그인
  </Button>
)}
```

환경 변수 설정:
```bash
# .env.local (로컬)
NEXT_PUBLIC_ENABLE_GOOGLE_LOGIN=false

# Vercel (프로덕션)
Settings → Environment Variables
NEXT_PUBLIC_ENABLE_GOOGLE_LOGIN=false
```

## 휴대폰에서 Google 로그인 우회

### 방법 1: 외부 브라우저 사용

앱 내 브라우저(WebView) 대신:
1. Chrome, Safari 등 **시스템 기본 브라우저**로 직접 접속
2. URL 입력: `https://your-project.vercel.app`
3. Google 로그인 시도

### 방법 2: 브라우저 설정 변경

일부 앱의 경우:
- 설정 → "외부 브라우저로 열기" 활성화
- "기본 브라우저에서 열기" 옵션 사용

## 검증 프로세스 (선택사항)

Google OAuth 앱을 프로덕션으로 전환하면:

### 자동 승인되는 경우:
- 민감하지 않은 스코프만 사용 (이메일, 프로필)
- 즉시 프로덕션 모드 활성화

### 검증 필요한 경우:
- 민감한 스코프 사용 시
- Google의 수동 검토 필요 (최대 4-6주)
- 개인정보 처리방침, 이용약관 제출 필요

**현재 앱의 경우:**
- ✅ 기본 스코프만 사용 (이메일, 프로필)
- ✅ 자동 승인 가능성 높음

## 권장 사항

### 단기 (지금 당장):
1. ✅ **이메일 로그인 사용** (가장 빠름)
2. ✅ 외부 브라우저에서 접속

### 중기 (1주일 이내):
1. ✅ Google OAuth 앱 프로덕션 전환
2. ✅ 도메인 및 리디렉션 URI 설정 확인

### 장기 (향후):
1. ✅ 커스텀 도메인 연결
2. ✅ 개인정보 처리방침 추가
3. ✅ 이용약관 추가

## 문제 해결

### "This app is blocked" 메시지
→ OAuth 앱이 테스트 모드이고 사용자가 테스트 사용자 목록에 없음
→ 해결: 프로덕션 전환 또는 테스트 사용자 추가

### "Redirect URI mismatch" 오류
→ Google Cloud Console의 리디렉션 URI가 잘못됨
→ 해결: URI 확인 및 재설정

### "Access blocked: Authorization Error"
→ WebView에서 로그인 시도
→ 해결: 시스템 기본 브라우저 사용

## 참고 자료

- [Google OAuth 개발 가이드](https://developers.google.com/identity/protocols/oauth2)
- [Supabase Google OAuth 설정](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Google OAuth Verification](https://support.google.com/cloud/answer/9110914)

