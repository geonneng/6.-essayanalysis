# Supabase Redirect URL 설정 가이드

## 🎯 귀하의 Vercel URL

```
https://6-essayanalysis-git-main-noid3719-5451s-projects.vercel.app
```

---

## ✅ Supabase Dashboard 설정 (필수!)

### 1단계: Supabase Dashboard 접속

1. 브라우저에서 https://supabase.com 접속
2. 로그인
3. 귀하의 교직논술 프로젝트 선택

### 2단계: Authentication 설정 페이지로 이동

```
왼쪽 메뉴에서:
⚙️ Settings 클릭
 └─ Authentication 클릭
     └─ 아래로 스크롤
         └─ "URL Configuration" 섹션 찾기
```

### 3단계: Site URL 설정

**Site URL** 필드에 다음을 입력:

```
https://6-essayanalysis-git-main-noid3719-5451s-projects.vercel.app
```

**주의:**
- ❌ 마지막에 `/` 붙이지 마세요
- ✅ `https://`로 시작해야 합니다

### 4단계: Redirect URLs 설정

**Redirect URLs** 필드에 다음 **3개**를 모두 추가:

```
https://6-essayanalysis-git-main-noid3719-5451s-projects.vercel.app/**
https://6-essayanalysis-git-main-noid3719-5451s-projects.vercel.app/auth/callback
http://localhost:3000/auth/callback
```

**입력 방법:**
- 한 줄에 하나씩 입력
- Enter 키로 구분
- 총 3줄

**결과:**
```
┌─────────────────────────────────────────────────────────────┐
│ Redirect URLs                                               │
├─────────────────────────────────────────────────────────────┤
│ https://6-essayanalysis-git-main-noid3719-5451s-proje.../** │
│ https://6-essayanalysis-git-main-noid3719-5451s-.../callback│
│ http://localhost:3000/auth/callback                         │
└─────────────────────────────────────────────────────────────┘
```

### 5단계: 저장

- 페이지 맨 아래로 스크롤
- **Save** 버튼 클릭
- 저장 완료 메시지 확인

---

## 📋 각 URL의 역할

### 1. Site URL
```
https://6-essayanalysis-git-main-noid3719-5451s-projects.vercel.app
```
**역할:** 
- 인증 후 기본 리다이렉트 위치
- 이메일 링크의 기본 URL
- 가장 중요한 설정!

### 2. 와일드카드 URL (`/**`)
```
https://6-essayanalysis-git-main-noid3719-5451s-projects.vercel.app/**
```
**역할:**
- 모든 페이지로의 리다이렉트 허용
- `/essay`, `/dashboard`, `/analysis` 등 모든 경로 허용
- 없으면 특정 페이지로 리다이렉트 실패

### 3. 콜백 URL
```
https://6-essayanalysis-git-main-noid3719-5451s-projects.vercel.app/auth/callback
```
**역할:**
- Google OAuth 로그인 후 처리
- 인증 토큰 교환
- 세션 생성

### 4. Localhost (개발용)
```
http://localhost:3000/auth/callback
```
**역할:**
- 로컬 개발 시 인증 작동
- 개발과 배포 동시 지원

---

## ⚠️ 설정하지 않으면?

### Site URL을 설정하지 않으면:
```
로그인 후 → localhost:3000으로 리다이렉트 ❌
```

### Redirect URLs를 설정하지 않으면:
```
Google 로그인 → "Invalid redirect URL" 오류 ❌
특정 페이지 접근 → "Unauthorized" 오류 ❌
```

### 와일드카드(`**`)를 빠뜨리면:
```
/essay, /dashboard 등 → 접근 불가 ❌
```

---

## 🔍 설정 확인 방법

설정 완료 후:

1. **Vercel에서 재배포**
   ```
   Vercel Dashboard → Deployments → Redeploy
   ```

2. **배포된 사이트에서 테스트**
   ```
   https://6-essayanalysis-git-main-noid3719-5451s-projects.vercel.app
   ```

3. **로그인 시도**
   - 이메일/비밀번호로 로그인
   - 또는 Google 로그인

4. **확인**
   - ✅ 로그인 후 URL이 그대로 배포 URL인지
   - ❌ localhost로 가지 않는지

---

## 💡 문제 해결

### 여전히 localhost로 간다면?

1. **Supabase 설정 재확인**
   - Site URL이 정확한지
   - Redirect URLs가 모두 추가되었는지
   - Save 버튼을 눌렀는지

2. **브라우저 캐시 삭제**
   ```
   Ctrl + Shift + Delete
   → 쿠키 및 사이트 데이터 삭제
   ```

3. **시크릿 모드에서 테스트**
   ```
   Ctrl + Shift + N (Chrome)
   → 배포 URL 접속
   → 로그인 시도
   ```

4. **Vercel 재배포**
   - 설정 변경 후 반드시 재배포!

---

## 📞 빠른 설정 체크리스트

- [ ] Supabase Dashboard 접속
- [ ] Settings → Authentication 클릭
- [ ] URL Configuration 섹션 찾기
- [ ] Site URL 변경: `https://6-essayanalysis-git-main-noid3719-5451s-projects.vercel.app`
- [ ] Redirect URLs 추가 (3개):
  - [ ] `https://6-essayanalysis-git-main-noid3719-5451s-projects.vercel.app/**`
  - [ ] `https://6-essayanalysis-git-main-noid3719-5451s-projects.vercel.app/auth/callback`
  - [ ] `http://localhost:3000/auth/callback`
- [ ] Save 버튼 클릭
- [ ] Vercel에서 Redeploy
- [ ] 배포 완료 후 로그인 테스트

모두 완료하시면 정상 작동합니다! 🎉

---

## 🆘 여전히 문제가 있다면?

다음 정보를 확인해주세요:

1. **Supabase URL Configuration 스크린샷**
2. **Vercel Environment Variables 스크린샷**
3. **브라우저 Console 오류 메시지** (F12)
4. **Vercel Runtime Logs**

이 정보가 있으면 더 정확한 해결책을 제시할 수 있습니다!

