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
        score: 15,
        maxScore: 20,
        strengths: [
          "문제 상황에 대한 정확한 인식과 체계적인 접근",
          "피해자 보호를 최우선으로 하는 교육적 관점",
          "개별 상담과 집단 지도를 병행하는 균형잡힌 해결책",
        ],
        weaknesses: [
          "핵심 해결 방안의 구체성이 부족",
          "학부모 및 학교 차원의 협력 방안이 미흡",
          "지속적 관리 방안이 부족",
        ],
        improvements: [
          "핵심 해결 방안을 더 구체적으로 제시하여 실현 가능성을 높이세요",
          "학부모, 동료 교사, 관리자와의 협력 체계를 명시하세요",
          "지속적 모니터링과 사후 관리 방안을 포함하세요",
        ],
        detailedAnalysis: {
          contentAnalysis: "답안은 학급 내 따돌림 상황에 대한 교육적 접근을 보여주고 있습니다. 피해자 보호와 가해자 지도를 균형있게 다루었으며, 학급 전체의 인권 교육까지 고려한 포괄적인 해결책을 제시했습니다.",
          structureAnalysis: "논술의 내용이 논리적으로 연결되어 있으며, 첫째, 둘째, 셋째로 구분하여 체계적으로 접근했습니다. 다만, 각 단계별 핵심 내용의 구체성이 부족합니다.",
          educationalPerspective: "교육학적 관점에서 볼 때, 개별 상담과 집단 지도를 병행하는 접근은 적절합니다. 다만, 장기적인 관점에서의 예방 교육과 지속적 모니터링 체계가 필요합니다.",
          educationalTheory: "개별 상담과 집단 지도를 병행하는 접근은 교육학적으로 적절합니다. 다만, 학생들의 발달 단계를 고려한 차별화된 접근과 근접발달영역을 활용한 지도 방안이 필요합니다.",
        },
        categories: {
          logicalStructure: 8.5,
          spelling: 9.5,  // OCR 오류 고려하여 관대하게 평가
          vocabulary: 8.5,  // OCR로 인한 어색한 표현 고려
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

    const prompt = `당신은 교직논술 전문 평가자입니다. 아래 문제와 답안을 바탕으로 배점 기준에 따라 점수와 피드백을 JSON으로만 반환하세요. 모든 문장은 존댓말로 작성하세요. OCR의 특성을 고려하여 실용적인 평가를 해주세요.

**평가 지침:**
1. 문제 하단의 배점 기준(예: 방안 3가지[3점], 문제 파악[5점] 등)을 정확히 파악하여 해당 배점에 맞춰 채점하세요
2. 각 배점 항목별로 충족도를 분석하고 점수를 부여하세요 (예: 방안 3가지[3점] → 3가지 모두 제시했으면 3점, 2가지만 제시했으면 2점)
3. 총점은 모든 배점 항목의 합계로 계산하세요 (문제에서 제시된 총 배점 확인)
4. 강점과 보완점을 각 배점 항목에 연결하여 제시하세요. 어느 항목을 충족/미충족했는지 분명히 밝히세요.
5. 개선 방향은 배점 항목 충족을 목표로 실용적인 제안을 하세요. 과도한 구체성보다는 핵심 내용의 완성도를 중시하세요.
6. OCR로 인한 문단 구분의 한계를 고려하여, 서론/본론/결론의 구조적 완벽성보다는 내용의 논리적 연결성을 평가하세요.
7. **중요: 점수 계산 시 감점을 정확히 반영하세요. 예: 20점 만점에서 5점 감점이면 15점이어야 합니다.**
8. **OCR 특성 고려: 맞춤법과 띄어쓰기 오류는 OCR의 한계로 인한 것으로 간주하여 최소한의 감점만 적용하세요.**

문제:
${questionText}

답안:
${answerText}

**상세 분석 요구사항:**
- 배점 기준에 따른 세부 평가 (각 배점 항목별 충족도 분석)
- 논리적 체계성: 내용의 논리적 연결성과 일관성 (구조적 완벽성보다는 내용의 흐름 중시)
- 맞춤법: OCR의 한계로 인한 오류는 최소한의 감점만 적용 (예: '따리서' → '따라서' 같은 OCR 오류는 0.5점 이하 감점)
- 어휘 및 문장의 적절성: 어휘 선택과 문장 구성의 적절성 (OCR로 인한 어색한 표현은 관대하게 평가)
- 교육적 관점과 교육학 이론의 실용적 평가
- 교육학 이론 관점에서의 핵심 내용 평가 (과도한 구체성보다는 이론적 근거의 적절성 중시)
- 문제 해결 접근법의 교육학적 적절성 평가
- 개선 방안에 실용적인 제안 포함 (과도한 구체성 지양)
- **점수 계산 정확성: 감점을 정확히 반영하여 최종 점수를 계산하세요 (최소 15점 이상 권장)**

JSON 형식(키와 타입을 반드시 지키세요):
{
  "score": number,              // 배점 기준에 따른 총점 (각 배점 항목별 점수의 합계)
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
    "logicalStructure": number,    // 논리적 체계성 (논리적 구조와 전개 방식) 0~10
    "spelling": number,           // 맞춤법 (OCR 오류 고려하여 관대하게 평가) 0~10
    "vocabulary": number          // 어휘 및 문장의 적절성 (OCR로 인한 어색한 표현은 관대하게 평가) 0~10
  }
}

**중요: 점수 계산 시 반드시 문제의 배점 기준을 정확히 파악하고, 각 배점 항목별로 충족도를 평가하여 점수를 부여하세요.**`

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


