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

    const { answerText, sentences, weaknesses, improvements, questionText } = await request.json()
    
    if (!answerText) {
      return NextResponse.json({ error: 'answerText is required' }, { status: 400 })
    }
    
    // 프론트엔드에서 전달받은 문장 목록 사용 (정확한 매칭을 위해)
    const sentenceList = sentences || []
    console.log(`📝 받은 문장 수: ${sentenceList.length}`)
    if (sentenceList.length > 0) {
      console.log(`📝 첫 번째 문장: ${sentenceList[0]?.substring(0, 50)}...`)
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

**중요: 분석 기준 - 매우 꼼꼼하게 검토하세요**
- OCR로 인한 일반적인 오류(예: '따리서'→'따라서', '겅우'→'경우', '학생돌'→'학생들')도 맞춤법 오류로 지적하세요
- 맞춤법, 띄어쓰기, 문법 오류를 빠짐없이 찾으세요
- 문장 구조, 논리적 연결성, 표현의 적절성을 세밀하게 검토하세요
- 가능한 한 많은 개선 사항을 찾아서 제시하세요 (8-12개 정도)
- 사소한 문제도 놓치지 말고 모두 지적하세요

**분석 기준 (모든 항목을 꼼꼼히 검토하세요):**
1. **맞춤법/띄어쓰기/문법 오류** - OCR 오류를 포함하여 모든 오류 지적
2. **문장 구조의 문제** - 주어-서술어 불일치, 중복 표현, 어색한 어순
3. **표현의 명확성** - 모호한 표현, 불분명한 지시어, 애매한 수식어
4. **구체성 부족** - 추상적 표현, 구체적 예시 부재, 수치/단계 누락
5. **논리적 연결성** - 앞뒤 문장 간 논리 비약, 인과관계 불명확
6. **교육학적 적절성** - 교육학 용어 오용, 이론적 근거 부족
7. **문장 길이와 리듬** - 지나치게 긴 문장, 단조로운 문장 구조
8. **기존 보완점 반영** - weaknesses와 improvements를 참고하여 관련 문장 매칭
9. **어휘 선택** - 부적절한 단어, 반복되는 표현, 교육 현장에 맞지 않는 용어
10. **문체 일관성** - 존댓말/반말 혼용, 어조 불일치

**문제:**
${questionText || '제공되지 않음'}

**답안 (전체):**
${answerText}

**답안 (문장별로 분리됨):**
${sentenceList.map((s: string, idx: number) => `[${idx}] ${s}`).join('\n')}

**기존 보완점:**
${JSON.stringify(weaknesses || [])}

**기존 개선 방안:**
${JSON.stringify(improvements || [])}

위에 제공된 **답안 (문장별로 분리됨)** 목록을 사용하여 매우 꼼꼼하게 분석하세요.
각 문장의 번호 [0], [1], [2] 등을 position으로 사용하세요.
중요: 가능한 한 많은 개선 사항을 찾아주세요 (8-12개 정도, 사소한 문제도 포함).

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
- position은 위의 [번호]와 정확히 일치해야 합니다 (0부터 시작)
- originalSentence는 위의 분리된 문장 목록에서 해당 번호의 문장을 **정확히 그대로** 복사하세요
- improvedSentence는 구체적이고 명확하게 수정된 문장을 제시하세요
- reason은 왜 이렇게 수정해야 하는지 간단히 설명하세요 (맞춤법/문법/표현/구조/논리 등 명시)
- 작은 문제라도 개선 가능한 모든 문장을 포함하세요
- 8-12개의 개선 사항을 목표로 하세요 (꼼꼼한 분석)
- 맞춤법, 문법, 표현, 구조, 논리 등 모든 측면을 검토하세요

**예시:**
입력: [0] 이러한 상황에서 교사로서 다음과 같이 대응하겠습니다.
출력: {"position": 0, "originalSentence": "이러한 상황에서 교사로서 다음과 같이 대응하겠습니다.", ...}`

    console.log('Generating sentence improvements with detailed analysis...')
    const result = await model.generateContent(prompt)
    const text = result.response.text()
    
    console.log('Sentence improvement API response:', text.substring(0, 200))
    
    const jsonString = text.trim().replace(/^```(?:json)?/i, '').replace(/```$/,'').trim()
    const parsed = JSON.parse(jsonString)
    
    // 안전 가드
    const safe = {
      improvements: Array.isArray(parsed?.improvements) ? parsed.improvements : []
    }
    
    console.log(`✅ API 호출 완료: ${safe.improvements.length}개의 문장별 개선 사항 발견`)
    console.log('💡 팁: 같은 답안은 캐시에서 불러오므로 추가 API 호출이 없습니다')
    
    return NextResponse.json(safe)
  } catch (error: any) {
    console.error('문장 개선 분석 오류:', error)
    return NextResponse.json({ 
      improvements: [],
      error: error?.message 
    }, { status: 500 })
  }
}

