import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function GET() {
  try {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY
    
    console.log('Checking API keys:', {
      GEMINI_API_KEY: !!process.env.GEMINI_API_KEY,
      GOOGLE_GEMINI_API_KEY: !!process.env.GOOGLE_GEMINI_API_KEY,
      NEXT_PUBLIC_GEMINI_API_KEY: !!process.env.NEXT_PUBLIC_GEMINI_API_KEY,
      apiKeyLength: apiKey?.length
    })
    
    if (!apiKey || apiKey === 'your_gemini_api_key_here' || apiKey.length < 30) {
      return NextResponse.json({ 
        error: 'API 키가 설정되지 않았습니다.',
        hint: '.env.local 파일에 다음 중 하나를 설정해주세요: GEMINI_API_KEY, GOOGLE_GEMINI_API_KEY',
        checkedVars: {
          GEMINI_API_KEY: !!process.env.GEMINI_API_KEY,
          GOOGLE_GEMINI_API_KEY: !!process.env.GOOGLE_GEMINI_API_KEY,
          NEXT_PUBLIC_GEMINI_API_KEY: !!process.env.NEXT_PUBLIC_GEMINI_API_KEY
        }
      }, { status: 400 })
    }

    // REST API로 직접 모델 목록 조회
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models?key=' + apiKey)
    
    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json({ 
        error: '모델 목록 조회 실패',
        status: response.status,
        details: errorText
      }, { status: response.status })
    }
    
    const data = await response.json()
    
    // generateContent를 지원하는 모델만 필터링
    const generateContentModels = data.models?.filter((model: any) => 
      model.supportedGenerationMethods?.includes('generateContent')
    ).map((model: any) => ({
      name: model.name,
      displayName: model.displayName,
      description: model.description,
      supportedMethods: model.supportedGenerationMethods
    })) || []
    
    return NextResponse.json({
      totalModels: data.models?.length || 0,
      generateContentModels,
      allModels: data.models?.map((m: any) => m.name) || []
    })
  } catch (error: any) {
    console.error('모델 목록 조회 오류:', error)
    return NextResponse.json({ 
      error: error?.message || 'Unknown error',
      details: error?.toString()
    }, { status: 500 })
  }
}

