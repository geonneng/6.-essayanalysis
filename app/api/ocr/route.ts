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

    // 실제 네이버 클로바 OCR 호출 (멀티파트 또는 JSON 스펙에 맞춰 조정 필요)
    // 여기서는 가장 단순한 멀티파트 프록시를 사용합니다.
    const proxyForm = new FormData()
    proxyForm.append('file', file, file.name)

    const ocrRes = await fetch(ocrUrl, {
      method: 'POST',
      headers: {
        'X-OCR-SECRET': ocrSecret,
      },
      body: proxyForm as any,
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
        // Clova OCR의 일반 구조 예시를 최대한 넓게 처리
        // 사용자 환경에 따라 필드명이 다를 수 있어 안전하게 탐색
        const candidates: string[] = []
        const traverse = (obj: any) => {
          if (!obj || typeof obj !== 'object') return
          if (Array.isArray(obj)) {
            obj.forEach(traverse)
            return
          }
          for (const key of Object.keys(obj)) {
            const value = (obj as any)[key]
            if (key.toLowerCase().includes('text') && typeof value === 'string') {
              candidates.push(value)
            }
            traverse(value)
          }
        }
        traverse(ocrData)
        extractedText = candidates.join('\n')
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


