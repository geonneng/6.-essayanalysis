# Vercel 배포 가이드

## 수정 완료된 사항
✅ 프로덕션 빌드에서 실행되던 console.log 제거
✅ @vercel/analytics 패키지 설치 완료

## Vercel 환경 변수 설정

Vercel 대시보드에서 다음 환경 변수를 **반드시** 설정해야 합니다:

### 1. Vercel 프로젝트 설정으로 이동
1. Vercel 대시보드 접속
2. 프로젝트 선택
3. Settings → Environment Variables

### 2. 필수 환경 변수 추가

```bash
# Gemini AI API Key (필수)
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here

# Clova OCR API (필수)
NEXT_PUBLIC_CLOVA_OCR_API_URL=your_clova_ocr_api_url
NEXT_PUBLIC_CLOVA_OCR_SECRET_KEY=your_clova_secret_key

# Supabase (필수)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. 환경 변수 설정 방법

각 변수를 다음과 같이 추가하세요:

1. **Name**: `NEXT_PUBLIC_GEMINI_API_KEY`
   - **Value**: 실제 Gemini API 키
   - **Environment**: Production, Preview, Development 모두 체크

2. **Name**: `NEXT_PUBLIC_CLOVA_OCR_API_URL`
   - **Value**: 실제 Clova OCR API URL
   - **Environment**: Production, Preview, Development 모두 체크

3. **Name**: `NEXT_PUBLIC_CLOVA_OCR_SECRET_KEY`
   - **Value**: 실제 Clova OCR Secret Key
   - **Environment**: Production, Preview, Development 모두 체크

4. **Name**: `NEXT_PUBLIC_SUPABASE_URL`
   - **Value**: 실제 Supabase 프로젝트 URL
   - **Environment**: Production, Preview, Development 모두 체크

5. **Name**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Value**: 실제 Supabase Anonymous Key
   - **Environment**: Production, Preview, Development 모두 체크

### 4. Supabase 리디렉션 URL 설정

Supabase 대시보드에서도 설정이 필요합니다:

1. Supabase 프로젝트 → Authentication → URL Configuration
2. **Site URL**: `https://your-app.vercel.app`
3. **Redirect URLs**에 다음 추가:
   ```
   https://your-app.vercel.app
   https://your-app.vercel.app/auth/callback
   https://your-app.vercel.app/dashboard
   ```

## 배포 후 확인사항

### 1. 빌드 로그 확인
- Vercel 대시보드 → Deployments → 최신 배포 선택
- Build Logs에서 에러 확인

### 2. 런타임 로그 확인
- Functions 탭에서 실시간 로그 확인
- API 호출 에러가 있는지 확인

### 3. 브라우저 콘솔 확인
- 배포된 사이트 접속
- 개발자 도구(F12) → Console 탭
- 에러 메시지 확인

## 일반적인 문제 해결

### 문제 1: "Module not found" 에러
**원인**: 패키지가 설치되지 않음
**해결**: 
```bash
npm install
git add package.json package-lock.json
git commit -m "Update dependencies"
git push
```

### 문제 2: 환경 변수가 undefined
**원인**: Vercel에서 환경 변수가 설정되지 않음
**해결**: 
1. Vercel 대시보드에서 환경 변수 재확인
2. 변수명이 정확한지 확인 (대소문자 구분)
3. 재배포 (Deployments → 점 3개 → Redeploy)

### 문제 3: Supabase 인증 실패
**원인**: Redirect URL이 설정되지 않음
**해결**:
1. Supabase → Authentication → URL Configuration
2. 모든 Vercel URL 추가 (production, preview 포함)

### 문제 4: API 요청 실패
**원인**: CORS 또는 API 키 문제
**해결**:
1. Gemini API 키 확인
2. Clova OCR API 키 확인
3. API 할당량 확인

## 재배포하기

환경 변수를 추가/수정한 후:

1. **자동 재배포**:
   ```bash
   git commit --allow-empty -m "Trigger redeploy"
   git push
   ```

2. **수동 재배포**:
   - Vercel 대시보드 → Deployments
   - 최신 배포 옆 점 3개 클릭
   - "Redeploy" 선택

## 배포 성공 확인

배포가 성공하면:
- ✅ Build: Completed
- ✅ Status: Ready
- ✅ 사이트 접속 가능
- ✅ 로그인/회원가입 작동
- ✅ 분석 기능 작동

## 추가 지원

문제가 계속되면:
1. Vercel 빌드 로그 전체 복사
2. 브라우저 콘솔 에러 메시지 복사
3. Supabase 프로젝트 URL 확인

