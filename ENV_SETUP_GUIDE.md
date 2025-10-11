# 환경 변수 설정 가이드

## ⚠️ 중요: API 키 설정 문제 해결

현재 오류가 발생하는 주요 원인은 **환경 변수 이름 불일치**입니다.

### 문제 진단

다음 단계를 따라 문제를 해결하세요:

## 1. `.env.local` 파일 확인

프로젝트 루트 디렉토리에 `.env.local` 파일이 있는지 확인하세요.

**파일 위치:**
```
C:\Users\경남교육청\Desktop\코딩\바이브코딩 심화\6. essayanalysis\.env.local
```

### `.env.local` 파일이 없는 경우

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```env
# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key-here

# Gemini API 설정 (둘 다 설정하는 것을 권장)
GEMINI_API_KEY=여기에_실제_API_키_입력
GOOGLE_GEMINI_API_KEY=여기에_실제_API_키_입력

# 네이버 클로바 OCR 설정 (선택사항, OCR 기능을 사용하지 않으면 생략 가능)
NAVER_CLOVA_OCR_API_URL=your-naver-ocr-api-url-here
NAVER_CLOVA_OCR_SECRET_KEY=your-naver-ocr-secret-key-here
```

## 2. Gemini API 키 발급

### 새 API 키 발급 방법

1. **Google AI Studio 접속**
   - 브라우저에서 https://makersuite.google.com/app/apikey 열기
   - Google 계정으로 로그인

2. **API 키 생성**
   - "Create API Key" 버튼 클릭
   - 기존 Google Cloud 프로젝트 선택 또는 새 프로젝트 생성
   - API 키가 생성되면 복사

3. **API 키 형식 확인**
   - API 키는 보통 `AIza...` 로 시작
   - 길이: 약 39자
   - 예: `AIzaSyBCDEFGHIJKLMNOPQRSTUVWXYZ1234567`

4. **`.env.local` 파일에 추가**
   ```env
   GEMINI_API_KEY=AIzaSyBCDEFGHIJKLMNOPQRSTUVWXYZ1234567
   GOOGLE_GEMINI_API_KEY=AIzaSyBCDEFGHIJKLMNOPQRSTUVWXYZ1234567
   ```

## 3. 서버 재시작

**중요:** 환경 변수를 변경한 후에는 반드시 개발 서버를 재시작해야 합니다!

### 재시작 방법

1. 터미널에서 `Ctrl+C` 눌러서 서버 중지
2. 다음 명령어로 서버 재시작:
   ```bash
   npm run dev
   ```

## 4. API 키 테스트

서버를 재시작한 후, 브라우저에서 다음 URL에 접속하여 API 키를 테스트하세요:

```
http://localhost:3000/api/list-models
```

### 예상 결과

**성공한 경우:**
```json
{
  "totalModels": 3,
  "generateContentModels": [
    {
      "name": "models/gemini-1.5-flash",
      "displayName": "Gemini 1.5 Flash",
      "description": "Fast and versatile..."
    }
  ],
  "allModels": ["models/gemini-1.5-flash", "models/gemini-1.5-pro"]
}
```

**실패한 경우:**
```json
{
  "error": "API 키가 설정되지 않았습니다.",
  "checkedVars": {
    "GEMINI_API_KEY": false,
    "GOOGLE_GEMINI_API_KEY": false
  }
}
```

## 5. 일반적인 문제 해결

### 문제 1: "API 키가 설정되지 않았습니다"

**원인:** `.env.local` 파일이 없거나, 환경 변수 이름이 잘못됨

**해결:**
- `.env.local` 파일이 프로젝트 루트에 있는지 확인
- 환경 변수 이름이 `GEMINI_API_KEY` 또는 `GOOGLE_GEMINI_API_KEY`인지 확인
- 서버 재시작

### 문제 2: "404 Not Found" 또는 "models/gemini-pro is not found"

**원인:** API 키가 잘못되었거나 만료됨

**해결:**
1. Google AI Studio에서 새 API 키 발급
2. `.env.local` 파일에 새 API 키 추가
3. 서버 재시작

### 문제 3: 환경 변수가 적용되지 않음

**원인:** 서버를 재시작하지 않음

**해결:**
- 반드시 `Ctrl+C`로 서버 중지 후 `npm run dev`로 재시작
- Next.js는 서버 시작 시에만 환경 변수를 로드합니다

## 6. 디버그 정보 확인

터미널(서버 로그)에서 다음과 같은 로그를 확인하세요:

```
Checking API keys: {
  GEMINI_API_KEY: true,
  GOOGLE_GEMINI_API_KEY: true,
  NEXT_PUBLIC_GEMINI_API_KEY: false,
  apiKeyLength: 39
}
```

- `true`: 환경 변수가 설정됨
- `false`: 환경 변수가 설정되지 않음
- `apiKeyLength`: API 키의 길이 (약 39자여야 함)

## 7. 체크리스트

완료하기 전에 다음 사항을 확인하세요:

- [ ] `.env.local` 파일이 프로젝트 루트에 존재
- [ ] `GEMINI_API_KEY` 또는 `GOOGLE_GEMINI_API_KEY`가 설정됨
- [ ] API 키가 `AIza...`로 시작하고 약 39자 길이
- [ ] 서버를 재시작함 (`Ctrl+C` 후 `npm run dev`)
- [ ] `http://localhost:3000/api/list-models`에서 모델 목록이 표시됨
- [ ] 터미널에서 "API Key exists: true" 로그 확인

## 8. 추가 도움

여전히 문제가 발생하는 경우:

1. **터미널 로그 확인**
   - 서버 시작 시 로그 확인
   - "API Key exists: false"가 보이면 환경 변수가 설정되지 않은 것

2. **브라우저 개발자 도구**
   - F12 키를 눌러서 Console 탭 확인
   - Network 탭에서 API 요청 확인

3. **Gemini API 대시보드**
   - https://console.cloud.google.com/apis/api/generativelanguage.googleapis.com
   - API가 활성화되어 있는지 확인
   - 사용량 확인 (할당량 초과 여부)

