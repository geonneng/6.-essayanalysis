# Vercel 배포 가이드

## 🚨 중요: 배포 후 localhost로 리다이렉트되는 문제 해결

배포 후 로그인하면 `localhost:3000`으로 리다이렉트되는 문제는 **Supabase Dashboard 설정** 때문입니다.

---

## 📋 배포 전 체크리스트

- [ ] Supabase 프로젝트가 활성화되어 있음
- [ ] 모든 API 키가 준비됨 (Gemini, Supabase, Naver OCR)
- [ ] 로컬에서 정상 작동 확인 (`npm run dev`)
- [ ] 빌드가 성공함 (`npm run build`)

---

## 1️⃣ Vercel에 배포하기

### 1-1. Vercel 프로젝트 연결

```bash
# Vercel CLI 설치 (선택사항)
npm install -g vercel

# 배포
vercel
```

또는 Vercel Dashboard에서:

1. https://vercel.com 접속
2. "Add New Project" 클릭
3. GitHub/GitLab 저장소 선택
4. Import 클릭

### 1-2. 환경 변수 설정 (매우 중요!)

Vercel Dashboard에서:

1. **프로젝트 선택** → **Settings** → **Environment Variables**

2. **다음 변수들을 추가**:

| 변수 이름 | 값 | 설명 |
|-----------|-----|------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxxx.supabase.co` | Supabase 프로젝트 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGc...` | Supabase Anon Key |
| `GEMINI_API_KEY` | `AIzaSy...` | Gemini API 키 |
| `GOOGLE_GEMINI_API_KEY` | `AIzaSy...` | Gemini API 키 (백업) |
| `NAVER_CLOVA_OCR_API_URL` | `https://...` | 네이버 OCR URL (선택) |
| `NAVER_CLOVA_OCR_SECRET_KEY` | `...` | 네이버 OCR Key (선택) |

3. **Environment**: 모든 환경에 적용 (Production, Preview, Development)

4. **Save** 클릭

---

## 2️⃣ Supabase Dashboard 설정 (필수!)

### ⚠️ 이 단계를 건너뛰면 로그인 후 localhost로 리다이렉트됩니다!

### 2-1. Site URL 변경

1. **Supabase Dashboard** 접속: https://supabase.com
2. **프로젝트 선택**
3. **Settings** → **Authentication**
4. **URL Configuration** 섹션 찾기

5. **Site URL** 변경:
   ```
   https://your-app-name.vercel.app
   ```
   (실제 Vercel 배포 URL로 변경)

### 2-2. Redirect URLs 추가

같은 URL Configuration 섹션에서:

**Redirect URLs**에 다음을 추가:

```
https://your-app-name.vercel.app/**
https://your-app-name.vercel.app/auth/callback
http://localhost:3000/auth/callback
```

**중요:**
- `**` 와일드카드를 꼭 포함하세요
- `https://`를 빠뜨리지 마세요
- `localhost:3000`은 개발용으로 유지

### 2-3. 설정 저장

- **Save** 버튼 클릭
- 변경 사항이 즉시 적용됩니다

---

## 3️⃣ 재배포

Supabase 설정을 변경한 후:

### Vercel Dashboard에서:

1. **Deployments** 탭 클릭
2. 최신 배포의 **•••** 메뉴 클릭
3. **Redeploy** 클릭
4. **Redeploy** 확인

또는 터미널에서:

```bash
vercel --prod
```

---

## 4️⃣ 배포 후 테스트

### 테스트 순서

1. **홈페이지 접속**
   ```
   https://your-app-name.vercel.app
   ```

2. **회원가입 테스트**
   - 회원가입 버튼 클릭
   - 이메일/비밀번호 입력
   - 이메일 확인 (Supabase에서 발송)

3. **로그인 테스트**
   - 로그인 버튼 클릭
   - 이메일/비밀번호 입력
   - ✅ 로그인 후 **배포된 URL로 유지**되는지 확인
   - ❌ `localhost:3000`으로 리다이렉트되면 Supabase 설정 재확인

4. **Google 로그인 테스트** (설정한 경우)
   - Google 로그인 버튼 클릭
   - Google 계정 선택
   - ✅ 콜백 후 정상 리다이렉트 확인

5. **논술 분석 테스트**
   - `/essay` 페이지 접속
   - 샘플 문제/답안 입력
   - 분석 버튼 클릭
   - ✅ Gemini API가 정상 작동하는지 확인

---

## 🔍 문제 해결

### 문제 1: 로그인 후 localhost:3000으로 리다이렉트

**원인**: Supabase Dashboard의 Site URL이 `localhost:3000`으로 설정됨

**해결**:
1. Supabase Dashboard > Settings > Authentication
2. Site URL을 `https://your-app.vercel.app`로 변경
3. Redirect URLs에 배포 URL 추가
4. Save 후 재배포

### 문제 2: 로그인이 안됨

**원인**: 환경 변수가 Vercel에 설정되지 않음

**해결**:
1. Vercel Dashboard > Settings > Environment Variables
2. 모든 `NEXT_PUBLIC_*` 변수 추가
3. Redeploy

### 문제 3: API 오류 (Gemini, OCR)

**원인**: API 키가 Vercel 환경 변수에 없음

**해결**:
1. Vercel Dashboard > Settings > Environment Variables
2. `GEMINI_API_KEY` 추가
3. `NAVER_CLOVA_OCR_*` 추가 (OCR 사용 시)
4. Redeploy

### 문제 4: "Environment variable not found" 오류

**원인**: `NEXT_PUBLIC_` 접두사가 빠졌거나 오타

**확인**:
- `NEXT_PUBLIC_SUPABASE_URL` (❌ `SUPABASE_URL`)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (❌ `SUPABASE_ANON_KEY`)

**참고**: 
- 클라이언트에서 접근하는 변수는 `NEXT_PUBLIC_` 필수
- 서버에서만 사용하는 변수는 `NEXT_PUBLIC_` 불필요 (`GEMINI_API_KEY` 등)

---

## 🌐 Supabase 설정 상세 가이드

### Supabase URL Configuration 찾는 법

```
Supabase Dashboard
 └─ 왼쪽 메뉴: Settings (⚙️)
     └─ Authentication
         └─ URL Configuration 섹션
             ├─ Site URL ← 여기를 변경!
             └─ Redirect URLs ← 여기에 추가!
```

### 올바른 설정 예시

**Site URL:**
```
https://essay-analysis-ai.vercel.app
```

**Redirect URLs:**
```
https://essay-analysis-ai.vercel.app/**
https://essay-analysis-ai.vercel.app/auth/callback
http://localhost:3000/auth/callback
```

---

## 📊 환경 변수 확인 방법

### Vercel에서 확인

1. Vercel Dashboard > 프로젝트 선택
2. Settings > Environment Variables
3. 모든 변수가 표시되는지 확인

### 배포된 앱에서 확인

브라우저에서:
```
https://your-app.vercel.app/api/check-env
```

응답 예시:
```json
{
  "NEXT_PUBLIC_SUPABASE_URL_exists": true,
  "NEXT_PUBLIC_SUPABASE_ANON_KEY_exists": true,
  "NEXT_PUBLIC_SUPABASE_URL_sample": "https://xxxxx.supabase.co..."
}
```

---

## 🚀 배포 워크플로우

### 초기 배포

```bash
# 1. 코드 푸시
git add .
git commit -m "Initial deployment"
git push

# 2. Vercel이 자동 배포 (GitHub 연동 시)
# 또는 수동 배포:
vercel --prod

# 3. 배포 완료 후 URL 확인
# 예: https://essay-analysis-ai.vercel.app
```

### 배포 후 설정

1. **배포된 URL 복사**
   - 예: `https://essay-analysis-ai.vercel.app`

2. **Supabase Dashboard에서 설정**
   - Site URL: 배포된 URL
   - Redirect URLs: 배포된 URL + `/auth/callback`

3. **Vercel에서 재배포**
   - Settings에서 환경 변수 확인
   - Redeploy 클릭

### 업데이트 배포

```bash
# 코드 변경 후
git add .
git commit -m "Update feature"
git push

# Vercel이 자동으로 재배포
```

---

## 🔐 보안 체크리스트

배포 전 확인:

- [ ] `.env.local` 파일이 `.gitignore`에 포함됨 (비밀키 보호)
- [ ] API 키가 코드에 하드코딩되지 않음
- [ ] Supabase Row Level Security (RLS)가 활성화됨
- [ ] HTTPS만 사용 (HTTP 차단)

---

## 📱 도메인 연결 (선택사항)

커스텀 도메인을 사용하는 경우:

### Vercel Dashboard

1. Settings > Domains
2. 도메인 추가 (예: `essay-ai.com`)
3. DNS 설정 (Vercel 안내 따르기)

### Supabase Dashboard 업데이트

도메인 추가 후 Supabase에서도 업데이트:

**Site URL:**
```
https://essay-ai.com
```

**Redirect URLs:**
```
https://essay-ai.com/**
https://essay-ai.com/auth/callback
https://essay-analysis-ai.vercel.app/**
https://essay-analysis-ai.vercel.app/auth/callback
http://localhost:3000/auth/callback
```

---

## 🐛 트러블슈팅

### 로그 확인

**Vercel 로그:**
1. Vercel Dashboard > 프로젝트
2. Deployments 탭
3. 최신 배포 클릭
4. Runtime Logs 확인

**Supabase 로그:**
1. Supabase Dashboard
2. Logs 메뉴
3. Auth Logs 확인

### 일반적인 오류

#### 1. "Invalid redirect URL"
```
원인: Redirect URL이 Supabase에 등록되지 않음
해결: Supabase Dashboard에서 Redirect URLs 추가
```

#### 2. "Session not found"
```
원인: 쿠키 설정 문제 또는 CORS 문제
해결: 
- Supabase Site URL이 올바른지 확인
- 브라우저 캐시 삭제
- 시크릿 모드에서 테스트
```

#### 3. "Gemini API 키가 설정되지 않았습니다"
```
원인: Vercel 환경 변수 미설정
해결:
- Vercel > Settings > Environment Variables 확인
- GEMINI_API_KEY 추가
- Redeploy
```

#### 4. "Supabase connection failed"
```
원인: Supabase URL 또는 Key가 잘못됨
해결:
- Supabase Dashboard > Settings > API에서 값 재확인
- Vercel 환경 변수 업데이트
- Redeploy
```

---

## 📖 참고 링크

### Vercel
- 배포 문서: https://vercel.com/docs
- 환경 변수: https://vercel.com/docs/environment-variables

### Supabase
- 인증 문서: https://supabase.com/docs/guides/auth
- URL 설정: https://supabase.com/docs/guides/auth/redirect-urls

### Next.js
- 배포 가이드: https://nextjs.org/docs/deployment

---

## 💡 베스트 프랙티스

### 환경별 설정

**개발 환경 (.env.local):**
```env
NEXT_PUBLIC_SUPABASE_URL=https://dev-project.supabase.co
```

**프로덕션 (Vercel):**
```env
NEXT_PUBLIC_SUPABASE_URL=https://prod-project.supabase.co
```

### Git 워크플로우

```bash
# 개발
git checkout develop
# ... 코드 작성 ...
git commit -m "Add feature"
git push

# 배포 (main 브랜치)
git checkout main
git merge develop
git push
# → Vercel이 자동 배포
```

---

## ✅ 배포 완료 후 최종 확인

다음 사항들을 모두 테스트하세요:

1. [ ] 홈페이지가 정상 로드됨
2. [ ] 회원가입이 작동함
3. [ ] 로그인이 작동함
4. [ ] 로그인 후 **배포 URL에 그대로 있음** (localhost로 안 감)
5. [ ] Google 로그인이 작동함 (설정한 경우)
6. [ ] 논술 분석이 작동함 (Gemini API)
7. [ ] OCR이 작동함 (설정한 경우)
8. [ ] 모든 페이지가 정상 로드됨 (`/essay`, `/analysis`, `/dashboard`)

---

## 🎯 요약: 가장 중요한 3가지

### 1. Vercel 환경 변수 설정
```
Settings > Environment Variables
→ NEXT_PUBLIC_SUPABASE_URL
→ NEXT_PUBLIC_SUPABASE_ANON_KEY
→ GEMINI_API_KEY
```

### 2. Supabase URL 설정
```
Settings > Authentication > URL Configuration
→ Site URL: https://your-app.vercel.app
→ Redirect URLs: https://your-app.vercel.app/**
```

### 3. 재배포
```
Vercel Dashboard > Redeploy
```

이 3가지만 제대로 하면 배포 성공! 🎉

---

## 🆘 도움이 필요하신가요?

배포 중 문제가 발생하면:

1. **Vercel Runtime Logs** 확인
2. **Supabase Auth Logs** 확인
3. **브라우저 Console** 확인 (F12)
4. 이 문서의 트러블슈팅 섹션 참고

현재 배포 URL: `___________________` (여기에 실제 URL 기록)

