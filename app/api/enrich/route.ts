import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY
    if (!apiKey || (apiKey?.length ?? 0) < 20) {
      // 환경변수 없으면 간단한 폴백 생성
    const { strengths = [], weaknesses = [], improvements = [], detailedAnalysis = {} } = await request.json()
      const simple = (arr: string[]) => arr.map((s: string) => [
        `사례: ${s.slice(0, 30)}…와 유사한 현장 장면을 2~3문장으로 제시해 주십시오.`,
        `통계: 간단한 수치(참여율, 빈도 등)를 1개 포함해 주십시오.`,
        `이론: 교육학 이론(예: ZPD, 사회학습이론) 중 1개를 인용해 주세요.`,
      ])
      return NextResponse.json({
        strengthsDetails: simple(strengths),
        weaknessesDetails: simple(weaknesses),
        improvementsDetails: simple(improvements),
        detailed: {
          contentAnalysis: detailedAnalysis?.contentAnalysis ?? '',
          structureAnalysis: detailedAnalysis?.structureAnalysis ?? '',
          educationalPerspective: detailedAnalysis?.educationalPerspective ?? '',
          educationalTheory: detailedAnalysis?.educationalTheory ?? '',
        },
      })
    }

    const { strengths = [], weaknesses = [], improvements = [], detailedAnalysis = {}, questionTitle, preferences = {} } = await request.json()

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const prompt = `당신은 교직논술 전문 평가자입니다. 모든 문장은 존댓말로 작성하세요.
문항 제목: ${questionTitle || ''}

다음 항목 각각에 대해 "사례 중심", "통계 중심", "교육학 이론 인용" 예시를 1개씩 포함하여 2~3줄 해설을 만들어 주세요. 항목별로 3개의 서로 다른 관점 해설(사례/통계/이론)을 배열로 반환합니다.

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
- 각 해설은 2~3문장, 존댓말.
- 세 관점(사례/통계/이론)을 명확히 구분하되, 라벨은 문장 안에 자연스럽게 녹여 주세요.
- 통계 예시는 비율·빈도 등 간단 수치 활용.
- 이론 예시는 ZPD/사회학습/구성주의/인지발달 등 중 하나를 간단 인용.
- 상세 분석(detailed.*) 문장도 자연스럽게 1~2문장 확장.
- 각 항목 간 서술이 중복되지 않도록 예시·수치·이론을 바꿔서 제시.

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


