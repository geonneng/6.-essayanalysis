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
      return NextResponse.json({
        error: 'OCR 요청 실패',
        status: ocrRes.status,
        rawResult: ocrData,
      }, { status: 502 })
    }

    // 결과에서 텍스트 필드 추출 (서비스별로 변경 필요)
    let extractedText = ''
    if (isJson) {
      try {
        // Clova OCR 응답 구조 우선 처리 (fields/lines/words 등)
        // 1) images[].fields[].inferText - 좌표 기반 정렬
        const fields = ocrData?.images?.[0]?.fields
        if (Array.isArray(fields)) {
          // 좌표 정보가 있으면 y좌표로 정렬
          const sortedFields = fields
            .filter((f: any) => f?.inferText)
            .sort((a: any, b: any) => {
              const aY = a?.boundingPoly?.vertices?.[0]?.y || a?.vertices?.[0]?.y || 0
              const bY = b?.boundingPoly?.vertices?.[0]?.y || b?.vertices?.[0]?.y || 0
              return aY - bY
            })
          extractedText = sortedFields.map((f: any) => f?.inferText).join(' ')
        }
        // 2) fallback: lines[].words[].text
        if (!extractedText) {
          const lines = ocrData?.images?.[0]?.lines
          if (Array.isArray(lines)) {
            const texts: string[] = []
            for (const line of lines) {
              if (Array.isArray(line?.words)) {
                texts.push(line.words.map((w: any) => w?.text).filter(Boolean).join(' '))
              }
            }
            extractedText = texts.filter(Boolean).join(' ')
          }
        }
        // 3) 마지막 안전망: 전체 트리에서 text/InferText 키 수집
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


