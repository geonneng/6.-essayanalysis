export interface AnalysisResult {
  score: number
  maxScore: number
  strengths: string[]
  weaknesses: string[]
  improvements: string[]
  categories?: {
    logicalStructure: number
    spelling: number
    vocabulary: number
  }
  detailedAnalysis?: {
    contentAnalysis: string
    structureAnalysis: string
    educationalPerspective: string
    educationalTheory: string
  }
  questionText: string
  answerText: string
  questionTitle?: string
  analysisDate?: string
}

export interface AnalysisHistory {
  id: string
  user_id: string
  title: string
  memo?: string
  question_text: string
  answer_text: string
  score: number
  max_score: number
  strengths: string[]
  weaknesses: string[]
  improvements: string[]
  categories?: {
    logicalStructure: number
    spelling: number
    vocabulary: number
  }
  detailed_analysis?: {
    contentAnalysis: string
    structureAnalysis: string
    educationalPerspective: string
    educationalTheory: string
  }
  created_at: string
  updated_at: string
}

