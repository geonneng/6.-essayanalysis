-- 사용자 프로필 테이블 (크레딧 관리)
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  credits INTEGER DEFAULT 10 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 분석 히스토리 테이블
CREATE TABLE IF NOT EXISTS public.analysis_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  answer_text TEXT NOT NULL,
  question_title TEXT,
  score INTEGER NOT NULL,
  max_score INTEGER NOT NULL,
  strengths JSONB,
  weaknesses JSONB,
  improvements JSONB,
  detailed_analysis JSONB,
  categories JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security (RLS) 활성화
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_history ENABLE ROW LEVEL SECURITY;

-- user_profiles RLS 정책
CREATE POLICY "사용자는 자신의 프로필만 조회 가능" 
  ON public.user_profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "사용자는 자신의 프로필만 업데이트 가능" 
  ON public.user_profiles FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "사용자는 자신의 프로필만 삽입 가능" 
  ON public.user_profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- analysis_history RLS 정책
CREATE POLICY "사용자는 자신의 히스토리만 조회 가능" 
  ON public.analysis_history FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "사용자는 자신의 히스토리만 삽입 가능" 
  ON public.analysis_history FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "사용자는 자신의 히스토리만 삭제 가능" 
  ON public.analysis_history FOR DELETE 
  USING (auth.uid() = user_id);

-- 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_analysis_history_user_id 
  ON public.analysis_history(user_id);

CREATE INDEX IF NOT EXISTS idx_analysis_history_created_at 
  ON public.analysis_history(created_at DESC);

-- 트리거: 새 사용자 생성 시 자동으로 프로필 생성
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, credits)
  VALUES (NEW.id, NEW.email, 10);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 트리거 생성
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- updated_at 자동 업데이트 함수
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- updated_at 트리거
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

