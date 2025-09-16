import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY
    console.log('API Key exists:', !!apiKey)
    console.log('API Key length:', apiKey?.length)
    
    if (!apiKey || apiKey === 'your_gemini_api_key_here' || apiKey.length < 30) {
      // Mock 데이터 반환 (API 키가 설정되지 않은 경우)
      return NextResponse.json({
        score: 17.5,
        maxScore: 20,
        strengths: [
          "문제 상황에 대한 정확한 인식과 체계적인 접근",
          "피해자 보호를 최우선으로 하는 교육적 관점",
          "개별 상담과 집단 지도를 병행하는 균형잡힌 해결책",
        ],
        weaknesses: [
          "구체적인 실행 방안과 단계별 계획이 부족",
          "학부모 및 학교 차원의 협력 방안 미흡",
          "장기적 관찰과 사후 관리 계획 부재",
        ],
        improvements: [
          "단계별 실행 계획을 구체적으로 제시하여 실현 가능성을 높이세요",
          "학부모, 동료 교사, 관리자와의 협력 체계를 명시하세요",
          "사후 관리와 지속적 모니터링 방안을 포함하세요",
        ],
        categories: {
          logic: 9,
          creativity: 8,
          expression: 7.5,
        },
      })
    }

    const { questionText, answerText } = await request.json()
    if (!questionText || !answerText) {
      return NextResponse.json({ error: 'questionText and answerText are required' }, { status: 400 })
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
    
    console.log('Attempting to call Gemini API...')

    const prompt = `당신은 교직논술 평가자입니다. 아래 문제와 답안을 바탕으로 점수와 피드백을 JSON으로만 반환하세요.

문제:
${questionText}

답안:
${answerText}

JSON 형식(키와 타입을 반드시 지키세요):
{
  "score": number,              // 0~20
  "maxScore": 20,
  "strengths": string[],       // 강점 3~5개
  "weaknesses": string[],      // 보완점 3~5개
  "improvements": string[],    // 구체적 개선방안 3~5개
  "categories": {"logic": number, "creativity": number, "expression": number} // 각 0~10
}`

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
      maxScore: 20,
      strengths: Array.isArray(parsed?.strengths) ? parsed.strengths : [],
      weaknesses: Array.isArray(parsed?.weaknesses) ? parsed.weaknesses : [],
      improvements: Array.isArray(parsed?.improvements) ? parsed.improvements : [],
      categories: {
        logic: Number(parsed?.categories?.logic ?? 0),
        creativity: Number(parsed?.categories?.creativity ?? 0),
        expression: Number(parsed?.categories?.expression ?? 0),
      },
    }

    return NextResponse.json(safe)
  } catch (error: any) {
    console.error('Full error:', error)
    console.error('Error message:', error?.message)
    console.error('Error stack:', error?.stack)
    return NextResponse.json({ 
      error: error?.message ?? 'Unknown error',
      details: error?.toString() 
    }, { status: 500 })
  }
}


