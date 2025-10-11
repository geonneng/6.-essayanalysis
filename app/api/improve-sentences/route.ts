import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY
    
    if (!apiKey || apiKey === 'your_gemini_api_key_here' || apiKey.length < 30) {
      // API 키가 없으면 빈 배열 반환
      return NextResponse.json({
        improvements: []
      })
    }

    const { answerText, weaknesses, improvements, questionText } = await request.json()
    
    if (!answerText) {
      return NextResponse.json({ error: 'answerText is required' }, { status: 400 })
    }

    // REST API로 사용 가능한 모델 먼저 확인
    console.log('Fetching available models for sentence improvement...')
    let availableModelName = null
    
    try {
      const modelsResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`)
      if (modelsResponse.ok) {
        const modelsData = await modelsResponse.json()
        const generateContentModels = modelsData.models?.filter((m: any) => 
          m.supportedGenerationMethods?.includes('generateContent')
        ) || []
        
        if (generateContentModels.length > 0) {
          availableModelName = generateContentModels[0].name
          console.log('Using model for sentence improvement:', availableModelName)
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
    
    for (const modelName of modelNamesToTry) {
      try {
        model = genAI.getGenerativeModel({ model: modelName })
        break
      } catch (error: any) {
        lastError = error
        continue
      }
    }
    
    if (!model) {
      console.error('All models failed for sentence improvement')
      return NextResponse.json({ 
        improvements: [],
        error: 'No available models'
      })
    }

    const prompt = `당신은 교직논술 전문 평가자입니다. OCR로 추출된 답안의 문장을 분석하여 개선이 필요한 부분만 찾아주세요.

**중요: 분석 기준**
- OCR로 인한 일반적인 오류(예: '따리서'→'따라서', '겅우'→'경우', '학생돌'→'학생들')도 맞춤법 오류로 지적하세요
- 맞춤법, 띄어쓰기, 문법 오류를 모두 포함하세요
- 문장 구조, 논리적 연결성, 표현의 적절성도 함께 검토하세요
- 최대 5-6개의 개선 사항을 선택하여 제시하세요 (맞춤법 + 내용)

**분석 기준:**
1. 맞춤법/띄어쓰기/문법 오류 (OCR 오류 포함하여 모두 지적)
2. 기존 보완점(weaknesses)과 개선 방안(improvements)을 참고하여 관련 문장 찾기
3. 문장 구조의 문제 (주어-서술어 불일치, 중복 표현 등)
4. 논리적 비약이나 불명확한 표현
5. 교육학적 용어 사용의 부적절함
6. 표현의 명확성과 구체성

**문제:**
${questionText || '제공되지 않음'}

**답안:**
${answerText}

**기존 보완점:**
${JSON.stringify(weaknesses || [])}

**기존 개선 방안:**
${JSON.stringify(improvements || [])}

답안을 문장 단위로 분석하여, 개선이 필요한 문장에 대해서만 다음 JSON 형식으로 반환하세요.
중요: 5-6개 정도의 개선 사항을 선택하여 제시하세요 (맞춤법 오류와 내용 개선을 모두 포함).

{
  "improvements": [
    {
      "position": 문장_순서_번호(0부터 시작),
      "originalSentence": "원본_문장_전체",
      "improvedSentence": "수정된_문장_전체",
      "reason": "개선_이유를_한_문장으로_간단히_설명"
    }
  ]
}

**주의사항:**
- position은 답안에서 문장의 순서 번호입니다 (0부터 시작)
- originalSentence는 답안에서 해당 문장을 정확히 복사하세요
- improvedSentence는 구체적이고 명확하게 수정된 문장을 제시하세요
- reason은 왜 이렇게 수정해야 하는지 간단히 설명하세요 (맞춤법 오류인 경우 "맞춤법 오류" 명시)
- 문제가 없는 문장은 포함하지 마세요
- 5-6개 정도의 개선 사항을 선택하세요 (맞춤법과 내용 개선 모두 포함)`

    console.log('Generating sentence improvements...')
    const result = await model.generateContent(prompt)
    const text = result.response.text()
    
    console.log('Sentence improvement API response:', text.substring(0, 200))
    
    const jsonString = text.trim().replace(/^```(?:json)?/i, '').replace(/```$/,'').trim()
    const parsed = JSON.parse(jsonString)
    
    // 안전 가드
    const safe = {
      improvements: Array.isArray(parsed?.improvements) ? parsed.improvements : []
    }
    
    console.log(`Found ${safe.improvements.length} sentence improvements`)
    
    return NextResponse.json(safe)
  } catch (error: any) {
    console.error('문장 개선 분석 오류:', error)
    return NextResponse.json({ 
      improvements: [],
      error: error?.message 
    }, { status: 500 })
  }
}

