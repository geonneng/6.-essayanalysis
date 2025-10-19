# 인증 설정 확인 문서

## ✅ 동적 리다이렉트 URL 처리 확인

이 애플리케이션은 **환경에 따라 자동으로 올바른 URL을 사용**하도록 설정되어 있습니다.

---

## 📋 코드 분석

### 1. Google OAuth 리다이렉트 (`lib/auth.ts`)

```typescript
export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`
      // ✅ 동적으로 처리됨!
      // 로컬: http://localhost:3000/auth/callback
      // 배포: https://your-app.vercel.app/auth/callback
    }
  })
}
```

### 2. 비밀번호 재설정 리다이렉트 (`lib/auth.ts`)

```typescript
export const resetPassword = async (email: string) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`
    // ✅ 동적으로 처리됨!
  })
}
```

### 3. 인증 콜백 처리 (`app/auth/callback/page.tsx`)

```typescript
export default function AuthCallback() {
  useEffect(() => {
    const handleAuthCallback = async () => {
      const { data, error } = await supabase.auth.getSession()
      
      if (data.session) {
        router.push('/')  // ✅ 상대 경로 사용 (동적)
      }
    }
  }, [])
}
```

---

## 🎯 결론

### 코드는 이미 동적으로 처리됩니다!

- ✅ `window.location.origin` 사용
- ✅ 상대 경로 (`/`, `/essay`) 사용
- ✅ 하드코딩된 URL 없음

### 그렇다면 왜 localhost로 리다이렉트될까?

**문제는 코드가 아닌 Supabase Dashboard 설정입니다!**

```
[코드] 
redirectTo: `${window.location.origin}/auth/callback`
→ https://your-app.vercel.app/auth/callback 생성 ✅

[Supabase Dashboard]
Site URL: http://localhost:3000 ← 잘못된 설정! ❌
→ Supabase가 강제로 localhost로 리다이렉트

[해결]
Supabase Dashboard에서 Site URL 변경:
http://localhost:3000 → https://your-app.vercel.app ✅
```

---

## 🔧 필수 설정 단계

### 1단계: Vercel 배포 URL 확인

```
배포 완료 후:
https://your-app-name.vercel.app
```

### 2단계: Supabase Dashboard 업데이트

1. https://supabase.com 접속
2. 프로젝트 선택
3. **Settings** > **Authentication** > **URL Configuration**

4. **Site URL** 변경:
   ```
   FROM: http://localhost:3000
   TO:   https://your-app-name.vercel.app
   ```

5. **Redirect URLs** 추가:
   ```
   https://your-app-name.vercel.app/**
   https://your-app-name.vercel.app/auth/callback
   http://localhost:3000/auth/callback (개발용 유지)
   ```

6. **Save** 클릭

### 3단계: Vercel 재배포

설정 변경 후 반드시 재배포:

```bash
# 방법 1: Vercel Dashboard
Deployments > •••메뉴 > Redeploy

# 방법 2: Git push
git commit --allow-empty -m "Trigger redeploy"
git push
```

---

## 📝 환경별 동작 방식

### 로컬 개발 (localhost:3000)

```
1. 로그인 시도
2. window.location.origin = "http://localhost:3000"
3. redirectTo = "http://localhost:3000/auth/callback"
4. Supabase에서 redirect URL 확인
5. Redirect URLs에 localhost:3000이 있음 ✅
6. 로그인 성공 → localhost:3000으로 리다이렉트 ✅
```

### Vercel 배포 (your-app.vercel.app)

**올바른 설정:**
```
1. 로그인 시도
2. window.location.origin = "https://your-app.vercel.app"
3. redirectTo = "https://your-app.vercel.app/auth/callback"
4. Supabase에서 redirect URL 확인
5. Site URL = "https://your-app.vercel.app" ✅
6. Redirect URLs에 해당 URL 있음 ✅
7. 로그인 성공 → https://your-app.vercel.app으로 리다이렉트 ✅
```

**잘못된 설정:**
```
1. 로그인 시도
2. window.location.origin = "https://your-app.vercel.app"
3. redirectTo = "https://your-app.vercel.app/auth/callback"
4. Supabase에서 redirect URL 확인
5. Site URL = "http://localhost:3000" ❌ (잘못됨!)
6. Supabase가 강제로 localhost:3000으로 리다이렉트 ❌
7. 로그인 성공 → localhost:3000으로 잘못 리다이렉트 ❌
```

---

## 🎓 핵심 포인트

### 코드는 문제없음!

현재 코드는 이미 올바르게 작성되어 있습니다:

- `window.location.origin` 사용 (동적)
- 상대 경로 사용 (환경 독립적)
- 하드코딩 없음

### 문제는 Supabase 설정!

**반드시 해야 할 것:**

1. ✅ Supabase Site URL을 배포 URL로 변경
2. ✅ Redirect URLs에 배포 URL 추가
3. ✅ Vercel에서 재배포

**하지 말아야 할 것:**

- ❌ 코드에 URL 하드코딩
- ❌ localhost를 Site URL로 유지
- ❌ 환경 변수 없이 배포

---

## 📞 긴급 체크리스트

배포 후 로그인이 안되면 **순서대로** 확인:

1. [ ] Vercel 환경 변수에 `NEXT_PUBLIC_SUPABASE_URL` 있는가?
2. [ ] Vercel 환경 변수에 `NEXT_PUBLIC_SUPABASE_ANON_KEY` 있는가?
3. [ ] Supabase Site URL이 Vercel URL인가? (localhost 아님!)
4. [ ] Supabase Redirect URLs에 Vercel URL이 추가되었는가?
5. [ ] Vercel에서 재배포했는가?
6. [ ] 브라우저 캐시를 삭제했는가?

모두 체크했는데도 안되면:

- Supabase Dashboard > Logs에서 오류 확인
- Vercel Dashboard > Runtime Logs에서 오류 확인
- 브라우저 Console (F12)에서 오류 확인

---

## 🔄 배포 후 설정 변경 시

Supabase나 Vercel 설정을 변경한 경우:

1. **항상 재배포**하세요
2. **브라우저 캐시**를 삭제하세요
3. **시크릿 모드**에서 테스트하세요

설정 변경은 즉시 적용되지 않을 수 있습니다!

---

## 📌 Quick Start

### 최소 설정으로 배포하기

1. **Vercel 환경 변수** (2개만 필수):
   ```
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   ```

2. **Supabase Site URL**:
   ```
   https://your-app.vercel.app
   ```

3. **Supabase Redirect URLs**:
   ```
   https://your-app.vercel.app/**
   ```

4. **재배포**

이것만 하면 최소한 로그인은 작동합니다!

Gemini API는 나중에 추가해도 됩니다 (분석 기능만 안됨).

