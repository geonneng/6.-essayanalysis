import { supabase } from './supabase'
import type { AnalysisResult, AnalysisHistory } from './types/analysis'

export async function saveAnalysisHistory(
  analysisResult: AnalysisResult,
  title: string,
  memo?: string
): Promise<{ data: AnalysisHistory | null; error: Error | null }> {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { data: null, error: new Error('로그인이 필요합니다.') }
  }

  const { data, error } = await supabase
    .from('analysis_history')
    .insert({
      user_id: user.id,
      title,
      memo,
      question_text: analysisResult.questionText,
      answer_text: analysisResult.answerText,
      score: analysisResult.score,
      max_score: analysisResult.maxScore,
      strengths: analysisResult.strengths,
      weaknesses: analysisResult.weaknesses,
      improvements: analysisResult.improvements,
      detailed_analysis: analysisResult.detailedAnalysis
    })
    .select()
    .single()

  return { data, error: error as Error | null }
}

export async function getAnalysisHistory(): Promise<{
  data: AnalysisHistory[] | null
  error: Error | null
}> {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { data: null, error: new Error('로그인이 필요합니다.') }
  }

  const { data, error } = await supabase
    .from('analysis_history')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return { data, error: error as Error | null }
}

export async function getAnalysisById(id: string): Promise<{
  data: AnalysisHistory | null
  error: Error | null
}> {
  const { data, error } = await supabase
    .from('analysis_history')
    .select('*')
    .eq('id', id)
    .single()

  return { data, error: error as Error | null }
}

export async function deleteAnalysisHistory(id: string): Promise<{
  error: Error | null
}> {
  const { error } = await supabase
    .from('analysis_history')
    .delete()
    .eq('id', id)

  return { error: error as Error | null }
}

