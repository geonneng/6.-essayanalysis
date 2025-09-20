import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'file 필드가 필요합니다.' }, { status: 400 })
    }

    const ocrUrl = process.env.NAVER_CLOVA_OCR_API_URL
    const ocrSecret = process.env.NAVER_CLOVA_OCR_SECRET_KEY

    // 환경변수 미설정 시, 개발 편의를 위한 Mock 응답 반환
    if (!ocrUrl || !ocrSecret) {
      return NextResponse.json({
        text: '환경변수가 미설정되어 Mock 텍스트를 반환합니다. 실제 OCR 응답 대신입니다.',
        rawResult: { mock: true, reason: 'MISSING_ENV', fileName: file.name, size: file.size },
      })
    }

    // 실제 네이버 클로바 OCR 호출 (권장: JSON + Base64)
    // 스펙: Content-Type: application/json, 헤더 X-OCR-SECRET, 바디에 images[].data(Base64)
    const arrayBuffer = await file.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString('base64')
    const extFromType = file.type.split('/')[1] || 'jpg'
    const payload = {
      version: 'V2',
      requestId: (global as any).crypto?.randomUUID ? (global as any).crypto.randomUUID() : `${Date.now()}`,
      timestamp: Date.now(),
      images: [
        {
          format: extFromType.toUpperCase(),
          name: file.name,
          data: base64,
        },
      ],
    }

    const ocrRes = await fetch(ocrUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'X-OCR-SECRET': ocrSecret,
      },
      body: JSON.stringify(payload),
    })

    const contentType = ocrRes.headers.get('content-type') || ''
    const isJson = contentType.includes('application/json')
    const ocrData = isJson ? await ocrRes.json() : await ocrRes.text()

    if (!ocrRes.ok) {
      console.error('OCR API 오류:', {
        status: ocrRes.status,
        statusText: ocrRes.statusText,
        response: ocrData
      })
      return NextResponse.json({
        error: 'OCR 요청 실패',
        status: ocrRes.status,
        statusText: ocrRes.statusText,
        rawResult: ocrData,
        details: `HTTP ${ocrRes.status}: ${ocrRes.statusText}`
      }, { status: 502 })
    }

    // 결과에서 텍스트 필드 추출 (서비스별로 변경 필요)
    let extractedText = ''
    if (isJson) {
      try {
        // 디버깅을 위한 로그
        console.log('OCR 응답 구조:', {
          hasImages: !!ocrData?.images,
          imagesLength: ocrData?.images?.length || 0,
          hasLines: !!ocrData?.images?.[0]?.lines,
          linesLength: ocrData?.images?.[0]?.lines?.length || 0,
          hasFields: !!ocrData?.images?.[0]?.fields,
          fieldsLength: ocrData?.images?.[0]?.fields?.length || 0
        })
        
        // 첫 번째 라인의 구조 확인
        if (ocrData?.images?.[0]?.lines?.[0]) {
          console.log('첫 번째 라인 구조:', {
            hasWords: !!ocrData.images[0].lines[0].words,
            wordsLength: ocrData.images[0].lines[0].words?.length || 0,
            firstWord: ocrData.images[0].lines[0].words?.[0],
            lineText: ocrData.images[0].lines[0].inferText || ocrData.images[0].lines[0].text
          })
        }
        // 일반 텍스트 추출
        // Clova OCR 응답 구조 우선 처리 - 가장 단순한 방법
        // 1) images[].lines[].inferText 또는 images[].lines[].text 사용
        const lines = ocrData?.images?.[0]?.lines
        if (Array.isArray(lines)) {
          console.log('처리할 라인 수:', lines.length)
          
          // 라인의 inferText 또는 text를 직접 사용
          const lineTexts = lines
            .map((line: any) => line?.inferText || line?.text || '')
            .filter((text: string) => text.trim())
          
          console.log('처리된 라인 수:', lineTexts.length)
          console.log('첫 번째 라인:', lineTexts[0]?.substring(0, 50))
          
          // 각 라인을 그대로 유지하여 줄바꿈 보존
          extractedText = lineTexts.join('\n')
        }
        
        // 2) fallback: words 배열에서 추출
        if (!extractedText && Array.isArray(lines)) {
          console.log('inferText가 없어서 words에서 추출 시도')
          const lineTexts = lines
            .filter((line: any) => line?.words && Array.isArray(line.words) && line.words.length > 0)
            .map((line: any) => {
              const words = line.words
                .map((word: any) => word?.text || word?.inferText)
                .filter(Boolean)
              return words.join(' ')
            })
            .filter((text: string) => text.trim())
          
          if (lineTexts.length > 0) {
            extractedText = lineTexts.join('\n')
          }
        }
        
        // 3) fallback: fields[].inferText
        if (!extractedText) {
          const fields = ocrData?.images?.[0]?.fields
          if (Array.isArray(fields)) {
            console.log('fields에서 추출 시도')
            const fieldTexts = fields
              .map((f: any) => f?.inferText || f?.text)
              .filter(Boolean)
            extractedText = fieldTexts.join(' ')
          }
        }
        
        // 4) 마지막 안전망: 전체 트리에서 text/InferText 키 수집
        if (!extractedText) {
          const candidates: string[] = []
          const traverse = (obj: any) => {
            if (!obj || typeof obj !== 'object') return
            if (Array.isArray(obj)) {
              obj.forEach(traverse)
              return
            }
            for (const key of Object.keys(obj)) {
              const value = (obj as any)[key]
              if (/infertext|text/i.test(key) && typeof value === 'string') {
                candidates.push(value)
              }
              traverse(value)
            }
          }
          traverse(ocrData)
          extractedText = candidates.join('\n')
        }
      } catch {
        extractedText = ''
      }
    }

    return NextResponse.json({
      text: extractedText || '텍스트를 추출할 수 없습니다.',
      rawResult: ocrData,
    })
  } catch (error: any) {
    return NextResponse.json({
      error: error?.message || 'Unknown error',
    }, { status: 500 })
  }
}


