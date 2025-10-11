import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY
    if (!apiKey || (apiKey?.length ?? 0) < 20) {
      return NextResponse.json({ 
        error: 'Gemini API 키가 설정되지 않았습니다.',
        details: '.env.local 파일에 GEMINI_API_KEY 또는 GOOGLE_GEMINI_API_KEY를 설정해주세요.'
      }, { status: 400 })
    }

    const { strengths = [], weaknesses = [], improvements = [], detailedAnalysis = {}, questionTitle, preferences = {} } = await request.json()

    const genAI = new GoogleGenerativeAI(apiKey)
    
    // 여러 모델 이름을 순차적으로 시도
    const modelNames = [
      'models/gemini-1.5-flash',
      'models/gemini-1.5-pro',
      'models/gemini-pro',
      'gemini-1.5-flash',
      'gemini-1.5-pro',
      'gemini-pro'
    ]
    
    let model
    for (const modelName of modelNames) {
      try {
        const testModel = genAI.getGenerativeModel({ model: modelName })
        await testModel.generateContent('test')
        model = testModel
        break
      } catch (error: any) {
        continue
      }
    }
    
    if (!model) {
      return NextResponse.json({ 
        error: '사용 가능한 Gemini 모델을 찾을 수 없습니다.',
        hint: 'API 키를 확인해주세요.'
      }, { status: 500 })
    }

    const prompt = `당신은 교직논술 전문 평가자입니다. 모든 문장은 존댓말로 작성하세요.
문항 제목: ${questionTitle || ''}

다음 항목 각각에 대해 배점(루브릭) 관점에서 핵심을 강화하는 해설을 2개씩 만들어 주세요.
각 해설은 해당 배점 항목이 무엇인지, 어떻게 충족/강화되는지, 채점 근거를 어떻게 제시할지에 초점을 맞춥니다.
금지: "사례 중심", "통계 중심", "이론" 등의 관점 라벨, 괄호 표기, 라벨성 단어 삽입.
허용: 배점 기준 키워드(예: 문제 이해, 해결 방안 구체성, 실행 가능성, 논리적 연결성, 근거 타당성 등)를 자연스럽게 포함.

다양성을 높이기 위한 선호 설정(가능하면 반영):
- 선호 이론: ${(preferences.theories && Array.isArray(preferences.theories) ? preferences.theories.join(', ') : '비고츠키 ZPD, 피아제 인지발달, 반두라 사회학습, 브루너 발견학습, 콜버그 도덕성')}
- 통계 출처 힌트: ${(preferences.statsSources && Array.isArray(preferences.statsSources) ? preferences.statsSources.join(', ') : '교육부 실태조사, 학업성취도 평가, 자체 학급 설문')}
- 주제 도메인: ${(preferences.domains && Array.isArray(preferences.domains) ? preferences.domains.join(', ') : '학급경영, 학교폭력 예방, 학부모 소통, 협동학습')}
- 톤: ${preferences.tone || '전문적이고 친절한 교원 평가 톤'}

JSON으로만 답하며, 키는 아래 형식을 따르세요.
입력 예시:
strengths: ["근거 제시가 명확하다", ...]
weaknesses: ["실행 계획이 구체적이지 않다", ...]
improvements: ["사례를 추가하라", ...]

출력 스키마:
{
  "strengthsDetails": string[][], // strengths 각 항목당 3개의 해설 배열
  "weaknessesDetails": string[][],
  "improvementsDetails": string[][],
  "detailed": {
    "contentAnalysis": string, // 존댓말로 약간 확장
    "structureAnalysis": string,
    "educationalPerspective": string,
    "educationalTheory": string
  }
}

요구사항:
- 각 해설은 2~4문장, 존댓말.
- 라벨이나 관점 명시(사례/통계/이론 등) 금지. 괄호도 금지.
- 배점 항목 키워드를 활용해 채점 근거가 선명하도록 작성.
- 상세 분석(detailed.*) 문장도 배점 관점에서 1~2문장 확장.
- 각 항목 간 서술이 중복되지 않도록 표현을 바꿔서 제시.

입력 데이터:
strengths: ${JSON.stringify(strengths)}
weaknesses: ${JSON.stringify(weaknesses)}
improvements: ${JSON.stringify(improvements)}
detailed: ${JSON.stringify(detailedAnalysis)}
`

    const result = await model.generateContent(prompt)
    const text = result.response.text().trim().replace(/^```(?:json)?/i, '').replace(/```$/,'').trim()
    const parsed = JSON.parse(text)

    return NextResponse.json(parsed)
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Enrichment failed' }, { status: 500 })
  }
}


