import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY
    console.log('API Key exists:', !!apiKey)
    console.log('API Key length:', apiKey?.length)
    console.log('Trying env vars:', {
      GEMINI_API_KEY: !!process.env.GEMINI_API_KEY,
      GOOGLE_GEMINI_API_KEY: !!process.env.GOOGLE_GEMINI_API_KEY,
      NEXT_PUBLIC_GEMINI_API_KEY: !!process.env.NEXT_PUBLIC_GEMINI_API_KEY
    })
    
    if (!apiKey || apiKey === 'your_gemini_api_key_here' || apiKey.length < 30) {
      return NextResponse.json({ 
        error: 'Gemini API 키가 설정되지 않았습니다.',
        details: '.env.local 파일에 GEMINI_API_KEY 또는 GOOGLE_GEMINI_API_KEY를 설정해주세요.',
        hint: 'Google AI Studio(https://makersuite.google.com/app/apikey)에서 API 키를 발급받을 수 있습니다.'
      }, { status: 400 })
    }

    const { questionText, answerText } = await request.json()
    if (!questionText || !answerText) {
      return NextResponse.json({ error: 'questionText and answerText are required' }, { status: 400 })
    }

    // REST API로 사용 가능한 모델 먼저 확인
    console.log('Fetching available models...')
    let availableModelName = null
    
    try {
      const modelsResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`)
      if (modelsResponse.ok) {
        const modelsData = await modelsResponse.json()
        const generateContentModels = modelsData.models?.filter((m: any) => 
          m.supportedGenerationMethods?.includes('generateContent')
        ) || []
        
        console.log('Available models:', generateContentModels.map((m: any) => m.name))
        
        if (generateContentModels.length > 0) {
          // 첫 번째 사용 가능한 모델 선택
          availableModelName = generateContentModels[0].name
          console.log('Using model:', availableModelName)
        }
      }
    } catch (error) {
      console.log('Failed to fetch models list:', error)
    }
    
    // 사용 가능한 모델이 없으면 기본 모델 이름들 시도
    const modelNamesToTry = availableModelName 
      ? [availableModelName]
      : [
          'models/gemini-1.5-flash',
          'models/gemini-1.5-pro',
          'models/gemini-pro',
          'gemini-1.5-flash',
          'gemini-1.5-pro',
          'gemini-pro'
        ]
    
    const genAI = new GoogleGenerativeAI(apiKey)
    let model
    let lastError
    
    console.log('Models to try:', modelNamesToTry)
    
    for (const modelName of modelNamesToTry) {
      try {
        console.log(`Creating model instance: ${modelName}`)
        model = genAI.getGenerativeModel({ model: modelName })
        break // 모델 인스턴스 생성 성공
      } catch (error: any) {
        console.log(`Model ${modelName} creation failed:`, error.message)
        lastError = error
        continue
      }
    }
    
    if (!model) {
      console.error('All models failed. Last error:', lastError)
      return NextResponse.json({ 
        error: '사용 가능한 Gemini 모델을 찾을 수 없습니다. API 키를 확인하거나 /api/list-models에서 사용 가능한 모델을 확인해주세요.',
        details: lastError?.message || 'No models available',
        hint: 'Google AI Studio(https://makersuite.google.com/app/apikey)에서 새 API 키를 발급받아보세요.',
        checkedKeys: {
          GEMINI_API_KEY: !!process.env.GEMINI_API_KEY,
          GOOGLE_GEMINI_API_KEY: !!process.env.GOOGLE_GEMINI_API_KEY
        }
      }, { status: 500 })
    }

    const prompt = `당신은 교직논술 전문 평가자입니다. 아래 문제와 답안을 바탕으로 배점 기준에 따라 점수와 피드백을 JSON으로만 반환하세요. 모든 문장은 존댓말로 작성하세요. OCR의 특성을 고려하여 실용적인 평가를 해주세요.

**평가 지침:**
1. 문제 하단의 배점 기준(예: 방안 3가지[3점], 문제 파악[5점] 등)을 정확히 파악하여 해당 배점에 맞춰 채점하세요
2. 각 배점 항목별로 충족도를 분석하고 점수를 부여하세요 (예: 방안 3가지[3점] → 3가지 모두 제시했으면 3점, 2가지만 제시했으면 2점)
3. **총점 계산: 각 배점 항목별 점수의 합계에서 감점을 정확히 차감하세요. 예: 20점 만점에서 2점 감점이면 18점이어야 합니다.**
4. 강점과 보완점을 각 배점 항목에 연결하여 제시하세요. 어느 항목을 충족/미충족했는지 분명히 밝히세요.
5. 개선 방향은 배점 항목 충족을 목표로 구체적인 예시와 함께 실용적인 제안을 하세요.
6. OCR로 인한 문단 구분의 한계를 고려하여, 서론/본론/결론의 구조적 완벽성보다는 내용의 논리적 연결성을 평가하세요.
7. **맞춤법 평가: OCR 오류로 인한 맞춤법 실수는 최대 0.5점까지만 감점하세요.**
8. **논리적 체계성 평가: 구조적 완벽성보다는 내용의 논리적 연결성을 중시하여 최대 0.5점까지만 감점하세요.**
9. **전반적 점수 관대함: 핵심 내용이 제시되었다면 배점의 80% 이상을 부여하세요.**
10. **감점 정확성: 보완점에서 명시한 감점 사항을 정확히 반영하여 최종 점수를 계산하세요.**

문제:
${questionText}

답안:
${answerText}

**상세 분석 요구사항:**
- 배점 기준에 따른 세부 평가 (각 배점 항목별 충족도 분석)
- 논리적 체계성: 내용의 논리적 연결성과 일관성 (구조적 완벽성보다는 내용의 흐름 중시, 최대 0.5점 감점)
- 맞춤법: OCR의 한계로 인한 오류는 최대 0.5점까지만 감점 (예: '따리서' → '따라서' 같은 OCR 오류는 관대하게 평가)
- 어휘 및 문장의 적절성: 어휘 선택과 문장 구성의 적절성 (OCR로 인한 어색한 표현은 관대하게 평가)
- 교육적 관점과 교육학 이론의 실용적 평가
- 교육학 이론 관점에서의 핵심 내용 평가 (과도한 구체성보다는 이론적 근거의 적절성 중시)
- 문제 해결 접근법의 교육학적 적절성 평가
- 개선 방안에 구체적인 예시와 함께 실용적인 제안 포함
- **점수 계산 정확성: 보완점에서 명시한 감점 사항을 정확히 반영하여 최종 점수를 계산하세요 (예: 1점+0.5점+0.5점=2점 감점이면 20-2=18점)**

JSON 형식(키와 타입을 반드시 지키세요):
{
  "score": number,              // 배점 기준에 따른 총점 (각 배점 항목별 점수의 합계에서 감점 차감)
  "maxScore": number,           // 문제의 총 배점 (문제에서 제시된 모든 배점의 합계)
  "strengths": string[],       // 배점 항목과 연결된 강점 4~6개 (채점 근거가 드러나게)
  "weaknesses": string[],      // 배점 항목과 연결된 보완점 4~6개 (미충족 항목과 이유 포함)
  "improvements": string[],    // 배점 항목 충족을 위한 구체적 개선방안 4~6개 (실행 문장/조치 포함)
  "detailedAnalysis": {
    "contentAnalysis": string,     // 논술 내용에 대한 상세 분석 (200-300자) - 핵심 내용의 완성도 중시
    "structureAnalysis": string,   // 논술 체계에 대한 상세 분석 (200-300자) - 논리적 연결성과 일관성 중시
    "educationalPerspective": string, // 교육적 관점에서의 평가 (200-300자) - 실용적 관점 중시
    "educationalTheory": string   // 교육학 이론의 관점에서 평가 (200-300자) - 이론적 근거의 적절성 중시
  },
  "categories": {
    "logicalStructure": number,    // 논리적 체계성 (최대 0.5점 감점, 내용의 논리적 연결성 중시) 0~10
    "spelling": number,           // 맞춤법 (OCR 오류 고려하여 최대 0.5점 감점) 0~10
    "vocabulary": number          // 어휘 및 문장의 적절성 (OCR로 인한 어색한 표현은 관대하게 평가) 0~10
  }
}

**중요: 점수 계산 시 다음 순서를 정확히 따르세요:
1. 각 배점 항목별로 충족도를 평가하여 기본 점수를 계산하세요
2. 보완점에서 명시한 감점 사항을 확인하세요 (예: 1점+0.5점+0.5점=2점)
3. 기본 점수에서 감점을 정확히 차감하여 최종 점수를 계산하세요
예: 20점 만점에서 2점 감점이면 18점이어야 합니다.**`

    // 직접 API 호출 (재시도 없음, 서버 부하 최소화)
    const result = await model.generateContent(prompt)

    const text = result.response.text()
    
    console.log('Gemini response:', text)

    // 모델이 코드블록으로 감싸거나 설명을 덧붙이는 경우를 방지하고 JSON만 파싱
    const jsonString = text.trim().replace(/^```(?:json)?/i, '').replace(/```$/,'').trim()
    console.log('Parsed JSON string:', jsonString)
    
    const parsed = JSON.parse(jsonString)

    // 안전 가드 및 기본값 보정
    const safe = {
      score: Number(parsed?.score ?? 0),
      maxScore: Number(parsed?.maxScore ?? 20),
      strengths: Array.isArray(parsed?.strengths) ? parsed.strengths : [],
      weaknesses: Array.isArray(parsed?.weaknesses) ? parsed.weaknesses : [],
      improvements: Array.isArray(parsed?.improvements) ? parsed.improvements : [],
      detailedAnalysis: {
        contentAnalysis: parsed?.detailedAnalysis?.contentAnalysis ?? "상세 분석 데이터가 없습니다.",
        structureAnalysis: parsed?.detailedAnalysis?.structureAnalysis ?? "구조 분석 데이터가 없습니다.",
        educationalPerspective: parsed?.detailedAnalysis?.educationalPerspective ?? "교육적 관점 분석 데이터가 없습니다.",
        educationalTheory: parsed?.detailedAnalysis?.educationalTheory ?? "교육학 이론 관점 분석 데이터가 없습니다.",
      },
      categories: {
        logicalStructure: Number(parsed?.categories?.logicalStructure ?? 0),
        spelling: Number(parsed?.categories?.spelling ?? 0),
        vocabulary: Number(parsed?.categories?.vocabulary ?? 0),
      },
    }

    return NextResponse.json(safe)
  } catch (error: any) {
    console.error('Full error:', error)
    console.error('Error message:', error?.message)
    console.error('Error stack:', error?.stack)
    
    // 503 오류나 과부하 오류인 경우 사용자에게 친화적인 메시지 제공
    if (error?.message?.includes('503') || error?.message?.includes('overloaded')) {
      return NextResponse.json({ 
        error: 'AI 서버가 일시적으로 과부하 상태입니다. 잠시 후 다시 시도해주세요.',
        details: 'Gemini API is temporarily overloaded. Please try again later.',
        retryable: true
      }, { status: 503 })
    }
    
    return NextResponse.json({ 
      error: error?.message ?? 'Unknown error',
      details: error?.toString() 
    }, { status: 500 })
  }
}


