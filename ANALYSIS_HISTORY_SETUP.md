# 분석 히스토리 기능 설정 가이드

## 구현 완료된 기능

✅ **1. /analysis 페이지 저장 기능**
- 분석 결과 페이지 하단에 "분석 결과 저장" 버튼 추가
- 클릭 시 제목 + 메모(선택) 입력 다이얼로그 표시
- 저장 후 /essay 페이지 히스토리 탭으로 자동 이동

✅ **2. /essay 페이지 히스토리 탭**
- 제목 - 분석날짜 - 점수 표시
- 사용자별로 본인의 히스토리만 표시
- 메모가 있으면 함께 표시

✅ **3. 저장된 분석 결과 보기**
- 히스토리 목록에서 항목 클릭
- /analysis 페이지로 이동하여 저장된 분석 결과 전체 표시

## Supabase 설정

### 1단계: Supabase 대시보드 접속

1. [Supabase Dashboard](https://supabase.com/dashboard) 접속
2. 프로젝트 선택
3. 좌측 메뉴에서 **SQL Editor** 클릭

### 2단계: 테이블 생성

**New query** 버튼을 클릭하고, `supabase_schema.sql` 파일의 내용을 복사하여 붙여넣기:

```sql
-- 분석 히스토리 테이블 생성
CREATE TABLE analysis_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  memo TEXT,
  question_text TEXT NOT NULL,
  answer_text TEXT NOT NULL,
  score INTEGER NOT NULL,
  max_score INTEGER NOT NULL DEFAULT 20,
  strengths TEXT[] NOT NULL,
  weaknesses TEXT[] NOT NULL,
  improvements TEXT[] NOT NULL,
  detailed_analysis JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 사용자별 인덱스
CREATE INDEX idx_analysis_history_user_id ON analysis_history(user_id);
CREATE INDEX idx_analysis_history_created_at ON analysis_history(created_at DESC);

-- RLS 정책: 사용자는 자신의 히스토리만 볼 수 있음
ALTER TABLE analysis_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own history"
  ON analysis_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own history"
  ON analysis_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own history"
  ON analysis_history FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own history"
  ON analysis_history FOR DELETE
  USING (auth.uid() = user_id);
```

### 3단계: SQL 실행

**RUN** 버튼 (또는 Ctrl/Cmd + Enter) 클릭하여 실행

### 4단계: 테이블 확인

1. 좌측 메뉴에서 **Table Editor** 클릭
2. `analysis_history` 테이블이 생성되었는지 확인
3. 컬럼 구조 확인:
   - id (UUID)
   - user_id (UUID)
   - title (TEXT)
   - memo (TEXT, nullable)
   - question_text (TEXT)
   - answer_text (TEXT)
   - score (INTEGER)
   - max_score (INTEGER)
   - strengths (TEXT[])
   - weaknesses (TEXT[])
   - improvements (TEXT[])
   - detailed_analysis (JSONB)
   - created_at (TIMESTAMP)
   - updated_at (TIMESTAMP)

### 5단계: RLS 정책 확인

1. **Authentication** → **Policies** 클릭
2. `analysis_history` 테이블에 4개의 정책이 있는지 확인:
   - Users can view their own history
   - Users can insert their own history
   - Users can update their own history
   - Users can delete their own history

## 사용 방법

### 분석 결과 저장하기

1. 논술 분석 실행
2. `/analysis` 페이지에서 결과 확인
3. 하단의 **"분석 결과 저장"** 버튼 클릭
4. 제목 입력 (필수)
5. 메모 입력 (선택사항)
6. **"저장"** 버튼 클릭
7. 자동으로 `/essay` 페이지의 히스토리 탭으로 이동

### 저장된 분석 보기

1. `/essay` 페이지 접속
2. **"분석 히스토리"** 탭 클릭
3. 목록에서 보고 싶은 분석 클릭
4. `/analysis` 페이지에서 전체 결과 확인

## 기능 설명

### 저장되는 데이터

- ✅ 문제 텍스트
- ✅ 답안 텍스트
- ✅ 점수 (예: 15/20)
- ✅ 강점 목록
- ✅ 보완점 목록
- ✅ 개선 방안 목록
- ✅ 상세 분석 (4가지 관점)
- ✅ 제목 (사용자 입력)
- ✅ 메모 (사용자 입력, 선택사항)
- ✅ 생성 날짜

### 보안 및 프라이버시

- 🔒 **Row Level Security (RLS)** 활성화
- 🔒 사용자는 **자신의 히스토리만** 볼 수 있음
- 🔒 다른 사용자의 데이터는 접근 불가
- 🔒 사용자 삭제 시 관련 히스토리 자동 삭제

### 성능 최적화

- ⚡ 인덱스를 통한 빠른 조회
- ⚡ 날짜순 정렬 최적화
- ⚡ 사용자별 필터링 최적화

## 문제 해결

### "테이블이 생성되지 않아요"

**원인**: SQL 실행 중 오류 발생
**해결**:
1. SQL Editor에서 오류 메시지 확인
2. 각 SQL 문을 하나씩 실행
3. 이미 테이블이 있다면 먼저 삭제:
   ```sql
   DROP TABLE IF EXISTS analysis_history CASCADE;
   ```

### "히스토리가 표시되지 않아요"

**원인**: RLS 정책 문제
**해결**:
1. Supabase → Table Editor → analysis_history
2. RLS가 활성화되어 있는지 확인
3. Policies 탭에서 정책 확인
4. 로그인 상태 확인 (로그인 필요)

### "저장이 안 돼요"

**원인**: 환경 변수 또는 권한 문제
**해결**:
1. Supabase URL과 Anon Key 확인
2. 로그인 상태 확인
3. 브라우저 콘솔에서 에러 메시지 확인

## 추가 기능 (향후 구현 가능)

- [ ] 히스토리 항목 삭제 기능
- [ ] 히스토리 검색 기능
- [ ] 점수별 필터링
- [ ] 날짜별 필터링
- [ ] 히스토리 내보내기 (CSV/Excel)
- [ ] 히스토리 공유 기능

## 파일 구조

```
프로젝트/
├── supabase_schema.sql           # Supabase 테이블 생성 SQL
├── lib/
│   ├── analysisHistory.ts        # 히스토리 CRUD 함수
│   └── types/
│       └── analysis.ts           # 분석 관련 타입 정의
├── components/
│   └── analysis/
│       └── SaveAnalysisDialog.tsx  # 저장 다이얼로그
├── app/
│   ├── analysis/
│   │   └── page.tsx              # 저장 버튼 추가됨
│   └── essay/
│       └── page.tsx              # 히스토리 탭 업데이트됨
```

## 배포 전 체크리스트

- [x] 로컬 빌드 성공
- [ ] Supabase 테이블 생성
- [ ] RLS 정책 확인
- [ ] 로컬에서 기능 테스트
- [ ] Git 커밋 및 푸시
- [ ] Vercel 배포
- [ ] 프로덕션 환경에서 테스트

## 다음 단계

1. **Supabase SQL 실행**: 위의 SQL을 Supabase에서 실행
2. **로컬 테스트**: `npm run dev`로 기능 테스트
3. **Git 커밋**:
   ```bash
   git add .
   git commit -m "Add analysis history feature with Supabase"
   git push
   ```
4. **Vercel 자동 배포 확인**

