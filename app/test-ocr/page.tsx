"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"

export default function TestOCRPage() {
  const [file, setFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState("")
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setResult(null)
      setError(null)
    }
  }

  const handleOCR = async () => {
    if (!file) {
      alert("파일을 선택해주세요.")
      return
    }

    setIsProcessing(true)
    setProgress(0)
    setStatus("파일 업로드 중...")
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      setProgress(30)
      setStatus("OCR 처리 중...")

      const response = await fetch('/api/ocr', {
        method: 'POST',
        body: formData,
      })

      setProgress(70)
      setStatus("결과 처리 중...")

      const data = await response.json()

      setProgress(100)
      setStatus("완료!")

      if (!response.ok) {
        throw new Error(data.error || 'OCR 처리 실패')
      }

      setResult(data)
      console.log('OCR 결과:', data)

    } catch (err) {
      console.error('OCR 오류:', err)
      setError(err instanceof Error ? err.message : '알 수 없는 오류')
    } finally {
      setIsProcessing(false)
      setTimeout(() => {
        setProgress(0)
        setStatus("")
      }, 1000)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>네이버 클로바 OCR 테스트</CardTitle>
          <CardDescription>
            이미지를 업로드하여 OCR 기능을 테스트해보세요.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 파일 선택 */}
          <div>
            <label className="text-sm font-medium mb-2 block">이미지 파일 선택</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full p-2 border rounded"
            />
            {file && (
              <p className="text-sm text-gray-600 mt-1">
                선택된 파일: {file.name} ({file.size} bytes)
              </p>
            )}
          </div>

          {/* OCR 버튼 */}
          <Button 
            onClick={handleOCR} 
            disabled={!file || isProcessing}
            className="w-full"
          >
            {isProcessing ? "OCR 처리 중..." : "OCR 실행"}
          </Button>

          {/* 진행 상태 */}
          {isProcessing && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-800">{status}</p>
                  <Progress value={progress} className="mt-2" />
                </div>
              </div>
            </div>
          )}

          {/* 오류 메시지 */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">오류: {error}</p>
            </div>
          )}

          {/* 결과 표시 */}
          {result && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">추출된 텍스트</h3>
                <Textarea
                  value={result.text || "텍스트를 추출할 수 없습니다."}
                  readOnly
                  className="min-h-[200px]"
                />
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">원본 응답</h3>
                <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto max-h-[300px]">
                  {JSON.stringify(result.rawResult, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

