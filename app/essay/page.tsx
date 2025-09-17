"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, FileText, BarChart3, History, CreditCard, User, LogOut, Maximize2, Minimize2 } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/useAuth"
import { useRouter } from "next/navigation"

export default function EssayPage() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [credits, setCredits] = useState(25)
  const [questionFile, setQuestionFile] = useState<File | null>(null)
  const [answerFile, setAnswerFile] = useState<File | null>(null)
  const [questionText, setQuestionText] = useState("")
  const [answerText, setAnswerText] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<any>(null)
  const [analysisHistory, setAnalysisHistory] = useState<any[]>([])
  const [retryableError, setRetryableError] = useState<string | null>(null)
  const [isProcessingOCR, setIsProcessingOCR] = useState(false)
  const [ocrProgress, setOcrProgress] = useState(0)
  const [ocrStatus, setOcrStatus] = useState("")
  const [isQuestionFullscreen, setIsQuestionFullscreen] = useState(false)
  const [isAnswerFullscreen, setIsAnswerFullscreen] = useState(false)
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null)

  // 로컬 자동 저장 및 복원
  useEffect(() => {
    try {
      const q = localStorage.getItem('essay_question')
      const a = localStorage.getItem('essay_answer')
      if (q && !questionText) setQuestionText(q)
      if (a && !answerText) setAnswerText(a)
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const debouncedSave = (key: string, value: string) => {
    try {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
      // 이전 값 보관(되돌리기용)
      const prevKey = `${key}_prev`
      const prev = localStorage.getItem(key) ?? ''
      localStorage.setItem(prevKey, prev)
      saveTimerRef.current = setTimeout(() => {
        localStorage.setItem(key, value)
      }, 500)
    } catch {}
  }

  const handleFocusScroll = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    const target = e.currentTarget
    setTimeout(() => {
      target?.scrollIntoView({ block: 'center', behavior: 'smooth' })
    }, 100)
  }

  // OCR 결과를 문단 단위로 자연스럽게 이어붙이기
  const formatOcrText = (input: string) => {
    if (!input) return ""
    const lines = input.replace(/\r\n?/g, "\n").split("\n")
    const paragraphs: string[] = []
    let buffer = ""

    const shouldAddSpace = (prev: string) => {
      if (!prev) return false
      return !/[\.,!?:;\)]$/.test(prev)
    }

    for (const raw of lines) {
      const line = raw.trim()
      if (!line) {
        if (buffer.trim()) {
          paragraphs.push(buffer.trim())
          buffer = ""
        }
        continue
      }

      if (buffer.endsWith("-")) {
        buffer = buffer.slice(0, -1) + line.replace(/^\s+/, "")
      } else if (!buffer) {
        buffer = line
      } else {
        buffer += (shouldAddSpace(buffer) ? " " : "") + line
      }
    }

    if (buffer.trim()) paragraphs.push(buffer.trim())
    return paragraphs.join("\n\n")
  }

  // 클로바 OCR의 좌표 정보를 활용하여 원본 문단 레이아웃 복원 시도
  const formatOcrTextWithLayout = (rawResult: any, fallbackText: string) => {
    try {
      if (!rawResult || typeof rawResult !== 'object') return formatOcrText(fallbackText)

      type Line = { xLeft: number; yTop: number; yBottom: number; text: string }
      const lines: Line[] = []

      // 유틸: 다양한 키에서 꼭짓점 정보 추출
      const getVertices = (obj: any): { x: number; y: number }[] | null => {
        if (!obj || typeof obj !== 'object') return null
        if (Array.isArray(obj?.vertices)) return obj.vertices
        if (obj?.boundingPoly?.vertices) return obj.boundingPoly.vertices
        if (obj?.boundingBox?.vertices) return obj.boundingBox.vertices
        if (Array.isArray(obj?.boundingBox)) return obj.boundingBox
        return null
      }

      // 1) images[0].lines[].words[] 기반으로 한 줄 텍스트 구성
      const image0 = rawResult?.images?.[0]
      if (Array.isArray(image0?.lines)) {
        for (const ln of image0.lines) {
          const words = Array.isArray(ln?.words) ? ln.words : []
          const texts: string[] = []
          let xLeft = Number.POSITIVE_INFINITY
          let yTop = Number.POSITIVE_INFINITY
          let yBottom = 0
          for (const w of words) {
            const v = getVertices(w)
            if (v && v.length) {
              const xs = v.map((p: any) => p?.x ?? 0)
              const ys = v.map((p: any) => p?.y ?? 0)
              xLeft = Math.min(xLeft, Math.min(...xs))
              yTop = Math.min(yTop, Math.min(...ys))
              yBottom = Math.max(yBottom, Math.max(...ys))
            }
            if (w?.text || w?.inferText) texts.push((w.text ?? w.inferText) as string)
          }
          const text = texts.join(' ').trim()
          if (text) {
            lines.push({ xLeft: isFinite(xLeft) ? xLeft : 0, yTop: isFinite(yTop) ? yTop : 0, yBottom: isFinite(yBottom) ? yBottom : 0, text })
          }
        }
      }

      // 2) fallback: images[0].fields[]를 라인처럼 취급하여 정렬 후 합치기
      if (!lines.length && Array.isArray(image0?.fields)) {
        for (const f of image0.fields) {
          const v = getVertices(f)
          let xLeft = 0, yTop = 0, yBottom = 0
          if (v && v.length) {
            const xs = v.map((p: any) => p?.x ?? 0)
            const ys = v.map((p: any) => p?.y ?? 0)
            xLeft = Math.min(...xs)
            yTop = Math.min(...ys)
            yBottom = Math.max(...ys)
          }
          const text = (f?.inferText || f?.text || '').toString().trim()
          if (text) {
            lines.push({ xLeft, yTop, yBottom, text })
          }
        }
      }

      if (!lines.length) return formatOcrText(fallbackText)

      // 줄 정렬: 위→아래, 같은 행에서는 좌→우
      lines.sort((a, b) => (a.yTop === b.yTop ? a.xLeft - b.xLeft : a.yTop - b.yTop))

      // 기준 줄높이(중앙값)로 문단 분리 임계값 계산
      const heights = lines.map(l => Math.max(8, l.yBottom - l.yTop)).sort((a, b) => a - b)
      const medianHeight = heights[Math.floor(heights.length / 2)] || 16
      const gapThreshold = Math.max(12, Math.round(medianHeight * 0.9))

      const paragraphs: string[] = []
      let buffer: Line[] = []

      const flush = () => {
        if (!buffer.length) return
        // 같은 문단 내에서는 xLeft 증가를 이용해 자연스러운 공백을 추가
        const minIndent = Math.min(...buffer.map(b => b.xLeft))
        const parts: string[] = []
        let prevRight = minIndent
        for (const ln of buffer) {
          const indent = ln.xLeft - minIndent
          const needsSpace = parts.length > 0 && !/[\.,!?:;\)]$/.test(parts[parts.length - 1])
          const spacer = needsSpace ? ' ' : ''
          const indentCue = indent > medianHeight * 0.6 ? '' : '' // 필요 시 들여쓰기 마커 추가 가능
          parts.push(spacer + indentCue + ln.text)
          prevRight = ln.xLeft
        }
        paragraphs.push(parts.join(' ').replace(/\s{2,}/g, ' ').trim())
        buffer = []
      }

      for (let i = 0; i < lines.length; i++) {
        const curr = lines[i]
        const prev = lines[i - 1]
        if (!prev) {
          buffer.push(curr)
          continue
        }
        const verticalGap = curr.yTop - prev.yBottom
        const newParagraphByGap = verticalGap > gapThreshold
        const newParagraphByBullet = /^([0-9]+[\)\.\-]|[\-\u2022\u25CF\u25E6])\s+/.test(curr.text)
        const newParagraphByIndent = (curr.xLeft - prev.xLeft) > medianHeight * 1.2

        if (newParagraphByGap || newParagraphByBullet) {
          flush()
          buffer.push(curr)
        } else {
          buffer.push(curr)
        }
      }
      flush()

      return paragraphs.join('\n\n') || formatOcrText(fallbackText)
    } catch {
      return formatOcrText(fallbackText)
    }
  }

  const processOCR = async (file: File, type: "question" | "answer") => {
    setIsProcessingOCR(true)
    setOcrProgress(0)
    setOcrStatus("이미지 업로드 중...")

    try {
      const formData = new FormData()
      formData.append('file', file)

      setOcrProgress(30)
      setOcrStatus("OCR 처리 중...")

      const response = await fetch('/api/ocr', {
        method: 'POST',
        body: formData,
      })

      setOcrProgress(70)
      setOcrStatus("텍스트 추출 중...")

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'OCR 처리 중 오류가 발생했습니다.')
      }

      setOcrProgress(100)
      setOcrStatus("완료!")

      if (type === "question") {
        const formatted = formatOcrTextWithLayout(result.rawResult, result.text || "")
        setQuestionText(formatted || "텍스트를 추출할 수 없습니다.")
      } else {
        const formatted = formatOcrTextWithLayout(result.rawResult, result.text || "")
        setAnswerText(formatted || "텍스트를 추출할 수 없습니다.")
      }

      // 1초 후 상태 초기화
      setTimeout(() => {
        setIsProcessingOCR(false)
        setOcrProgress(0)
        setOcrStatus("")
      }, 1000)

    } catch (error) {
      console.error('OCR 처리 오류:', error)
      setIsProcessingOCR(false)
      setOcrProgress(0)
      setOcrStatus("")
      
      // 오류 발생 시 Mock 데이터 사용
      if (type === "question") {
        setQuestionText(
          "다음 상황에서 교사로서 어떻게 대응할 것인지 서술하시오.\n\n학급에서 일부 학생들이 다른 학생을 따돌리는 상황이 발생했습니다. 피해 학생은 위축되어 있고, 가해 학생들은 자신들의 행동이 잘못되었다는 것을 인식하지 못하고 있습니다.",
        )
      } else {
        setAnswerText(
          "이러한 상황에서 교사로서 다음과 같이 대응하겠습니다.\n\n첫째, 즉시 상황을 파악하고 피해 학생을 보호하겠습니다. 피해 학생과 개별 상담을 통해 심리적 안정을 도모하고, 필요시 상담교사나 학부모와 연계하여 지원체계를 구축하겠습니다.\n\n둘째, 가해 학생들과 개별 및 집단 상담을 실시하여 자신들의 행동이 타인에게 미치는 영향을 깨닫게 하고, 공감 능력을 기르도록 지도하겠습니다.\n\n셋째, 학급 전체를 대상으로 인권 교육과 배려 문화 조성을 위한 활동을 전개하여 재발 방지에 힘쓰겠습니다.",
        )
      }
      
      alert(`OCR 처리 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}\n\nMock 데이터로 대체됩니다.`)
    }
  }

  const handleFileUpload = (file: File, type: "question" | "answer") => {
    if (type === "question") {
      setQuestionFile(file)
    } else {
      setAnswerFile(file)
    }
    
    // OCR 처리 시작
    processOCR(file, type)
  }

  const handleAnalysis = async () => {
    if (!questionText || !answerText) {
      alert("문제와 답안을 모두 입력해주세요.")
      return
    }

    if (credits < 1) {
      alert("크레딧이 부족합니다. 크레딧을 구매해주세요.")
      return
    }

    setIsAnalyzing(true)
    setRetryableError(null) // 이전 오류 상태 초기화

    try {
      console.log('분석 요청 시작:', { questionText: questionText.substring(0, 100), answerText: answerText.substring(0, 100) })
      
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionText, answerText })
      })
      
      console.log('응답 상태:', res.status, res.statusText)
      
      if (!res.ok) {
        const errorText = await res.text()
        console.error('API 오류:', errorText)
        throw new Error(`분석 요청 실패: ${res.status} ${errorText}`)
      }
      
      const data = await res.json()
      console.log('분석 결과:', data)
      
      const result = {
        ...data,
        questionTitle: questionText.split('\n')[0] || "논술 문제",
        analysisDate: new Date().toLocaleDateString('ko-KR'),
        questionText,
        answerText,
      }
      
      setAnalysisResult(result)
      setCredits(prev => prev - 1)
      
      // 분석 히스토리에 추가
      const newHistoryItem = {
        id: Date.now(),
        ...result,
        createdAt: new Date().toISOString(),
      }
      setAnalysisHistory(prev => [newHistoryItem, ...prev])
      
      // 분석 결과와 함께 문제/답안 텍스트도 저장
      const analysisData = {
        ...result,
        questionText,
        answerText,
        analysisDate: new Date().toLocaleDateString('ko-KR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        questionTitle: questionText.substring(0, 50) + (questionText.length > 50 ? '...' : '')
      }
      
      // 분석 결과를 세션 스토리지에 저장
      console.log('저장할 분석 데이터:', analysisData)
      sessionStorage.setItem('latestAnalysisResult', JSON.stringify(analysisData))
      
      // 저장 확인
      const savedData = sessionStorage.getItem('latestAnalysisResult')
      console.log('세션 스토리지에 저장된 데이터:', savedData)
      
      // /analysis 페이지로 이동 (세션 스토리지만 사용)
      router.push('/analysis')
      
    } catch (e: any) {
      console.error('분석 오류:', e)
      
      // API 응답에서 오류 정보 추출
      let errorMessage = '분석 중 오류가 발생했습니다.'
      let isRetryable = false
      
      if (e.message) {
        try {
          const errorData = JSON.parse(e.message)
          if (errorData.error) {
            errorMessage = errorData.error
            isRetryable = errorData.retryable || false
          }
        } catch {
          // JSON 파싱 실패 시 원본 메시지 사용
          errorMessage = e.message
        }
      }
      
      if (isRetryable) {
        // 재시도 가능한 오류인 경우 상태에 저장하고 사용자에게 재시도 버튼 제공
        setRetryableError(errorMessage)
      } else {
        alert(errorMessage)
      }
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
  }

  const handleViewAnalysis = (analysisItem: any) => {
    console.log('히스토리에서 선택된 분석 아이템:', analysisItem)
    // 세션 스토리지에 저장 (이전 데이터 덮어쓰기)
    sessionStorage.setItem('latestAnalysisResult', JSON.stringify(analysisItem))
    console.log('히스토리 데이터를 세션 스토리지에 저장 완료')
    router.push('/analysis')
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary-foreground" />
            </div>
            <Link href="/" className="hover:opacity-80 transition-opacity">
              <span className="text-xl font-bold text-foreground cursor-pointer">교직논술 AI</span>
            </Link>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Badge variant="outline" className="flex items-center space-x-1">
              <CreditCard className="w-4 h-4" />
              <span className="hidden sm:inline">{credits}</span>
              <span className="sm:hidden">{credits}</span>
            </Badge>
            <Button variant="outline" size="sm" className="hidden sm:flex bg-transparent">
              <User className="w-4 h-4 mr-2" />
              {user?.email || "사용자"}
            </Button>
            <Button variant="outline" size="sm" className="sm:hidden bg-transparent">
              <User className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="analysis" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="analysis" className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span>논술 분석</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center space-x-2">
              <History className="w-4 h-4" />
              <span>분석 히스토리</span>
            </TabsTrigger>
            <TabsTrigger value="credits" className="flex items-center space-x-2">
              <CreditCard className="w-4 h-4" />
              <span>크레딧 관리</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analysis" className="space-y-6">
            {/* 모바일 전용 레이아웃: 아코디언 */}
            <div className="block lg:hidden">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="question">
                  <AccordionTrigger>문제</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4">
                      {isProcessingOCR && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <div className="flex items-center space-x-3">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-blue-800">{ocrStatus}</p>
                              <Progress value={ocrProgress} className="mt-2" />
                            </div>
                          </div>
                        </div>
                      )}
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">문제지</label>
                        <div
                          className={cn(
                            "border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 transition-colors",
                            questionFile && "border-primary bg-primary/5",
                          )}
                          onClick={() => document.getElementById("question-file")?.click()}
                        >
                          <input
                            id="question-file"
                            type="file"
                            accept=".jpg,.jpeg,.png,.pdf"
                            className="hidden"
                            onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], "question")}
                          />
                          {questionFile ? (
                            <div className="flex items-center justify-center space-x-2">
                              <FileText className="w-5 h-5 text-primary" />
                              <span className="text-sm text-primary">{questionFile.name}</span>
                            </div>
                          ) : (
                            <div>
                              <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                              <p className="text-sm text-muted-foreground">문제지 파일을 여기에 드래그하거나 클릭하세요</p>
                            </div>
                          )}
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm font-medium text-foreground">문제 텍스트</label>
                          <button className="text-xs text-primary flex items-center space-x-1" onClick={() => setIsQuestionFullscreen(true)}>
                            <Maximize2 className="w-3 h-3" />
                            <span>전체 화면</span>
                          </button>
                        </div>
                        <Textarea
                          placeholder="문제 텍스트가 여기에 표시됩니다..."
                          value={questionText}
                          onFocus={handleFocusScroll}
                          onChange={(e) => {
                            setQuestionText(e.target.value)
                            debouncedSave('essay_question', e.target.value)
                          }}
                          className="min-h-[260px]"
                        />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="answer">
                  <AccordionTrigger>답안</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">작성 답안</label>
                        <div
                          className={cn(
                            "border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 transition-colors",
                            answerFile && "border-primary bg-primary/5",
                          )}
                          onClick={() => document.getElementById("answer-file")?.click()}
                        >
                          <input
                            id="answer-file"
                            type="file"
                            accept=".jpg,.jpeg,.png,.pdf"
                            className="hidden"
                            onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], "answer")}
                          />
                          {answerFile ? (
                            <div className="flex items-center justify-center space-x-2">
                              <FileText className="w-5 h-5 text-primary" />
                              <span className="text-sm text-primary">{answerFile.name}</span>
                            </div>
                          ) : (
                            <div>
                              <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                              <p className="text-sm text-muted-foreground">답안 파일을 여기에 드래그하거나 클릭하세요</p>
                            </div>
                          )}
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm font-medium text-foreground">답안 텍스트</label>
                          <button className="text-xs text-primary flex items-center space-x-1" onClick={() => setIsAnswerFullscreen(true)}>
                            <Maximize2 className="w-3 h-3" />
                            <span>전체 화면</span>
                          </button>
                        </div>
                        <Textarea
                          placeholder="답안 텍스트가 여기에 표시됩니다..."
                          value={answerText}
                          onFocus={handleFocusScroll}
                          onChange={(e) => {
                            setAnswerText(e.target.value)
                            debouncedSave('essay_answer', e.target.value)
                          }}
                          className="min-h-[360px]"
                        />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

            {/* 데스크톱 레이아웃 */}
            <div className="hidden lg:grid lg:grid-cols-2 lg:gap-4">
              {/* 문제 섹션 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Upload className="w-5 h-5" />
                    <span>문제</span>
                  </CardTitle>
                  <CardDescription>문제지 업로드 및 텍스트 수정</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isProcessingOCR && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center space-x-3">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-blue-800">{ocrStatus}</p>
                          <Progress value={ocrProgress} className="mt-2" />
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">문제지</label>
                    <div
                      className={cn(
                        "border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 transition-colors",
                        questionFile && "border-primary bg-primary/5",
                      )}
                      onClick={() => document.getElementById("question-file")?.click()}
                    >
                      <input
                        id="question-file"
                        type="file"
                        accept=".jpg,.jpeg,.png,.pdf"
                        className="hidden"
                        onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], "question")}
                      />
                      {questionFile ? (
                        <div className="flex items-center justify-center space-x-2">
                          <FileText className="w-5 h-5 text-primary" />
                          <span className="text-sm text-primary">{questionFile.name}</span>
                        </div>
                      ) : (
                        <div>
                          <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">문제지 파일을 여기에 드래그하거나 클릭하세요</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">문제 텍스트</label>
                    <Textarea
                      placeholder="문제 텍스트가 여기에 표시됩니다..."
                      value={questionText}
                      onFocus={handleFocusScroll}
                      onChange={(e) => {
                        setQuestionText(e.target.value)
                        debouncedSave('essay_question', e.target.value)
                      }}
                      className="min-h-[300px] lg:min-h-[420px]"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* 답안 섹션 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Upload className="w-5 h-5" />
                    <span>답안</span>
                  </CardTitle>
                  <CardDescription>답안지 업로드 및 텍스트 수정</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isProcessingOCR && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center space-x-3">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-blue-800">{ocrStatus}</p>
                          <Progress value={ocrProgress} className="mt-2" />
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">작성 답안</label>
                    <div
                      className={cn(
                        "border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 transition-colors",
                        answerFile && "border-primary bg-primary/5",
                      )}
                      onClick={() => document.getElementById("answer-file")?.click()}
                    >
                      <input
                        id="answer-file"
                        type="file"
                        accept=".jpg,.jpeg,.png,.pdf"
                        className="hidden"
                        onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], "answer")}
                      />
                      {answerFile ? (
                        <div className="flex items-center justify-center space-x-2">
                          <FileText className="w-5 h-5 text-primary" />
                          <span className="text-sm text-primary">{answerFile.name}</span>
                        </div>
                      ) : (
                        <div>
                          <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">답안 파일을 여기에 드래그하거나 클릭하세요</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">답안 텍스트</label>
                    <Textarea
                      placeholder="답안 텍스트가 여기에 표시됩니다..."
                      value={answerText}
                      onFocus={handleFocusScroll}
                      onChange={(e) => {
                        setAnswerText(e.target.value)
                        debouncedSave('essay_answer', e.target.value)
                      }}
                      className="min-h-[420px] lg:min-h-[560px]"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 전체 화면 편집 오버레이 - 문제 */}
            {isQuestionFullscreen && (
              <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm p-4 flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold">문제 텍스트 - 전체 화면</span>
                  <button className="text-sm flex items-center space-x-1" onClick={() => setIsQuestionFullscreen(false)}>
                    <Minimize2 className="w-4 h-4" />
                    <span>닫기</span>
                  </button>
                </div>
                <Textarea
                  autoFocus
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  className="flex-1 min-h-[60vh]"
                  placeholder="문제 텍스트 편집"
                />
              </div>
            )}

            {/* 전체 화면 편집 오버레이 - 답안 */}
            {isAnswerFullscreen && (
              <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm p-4 flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold">답안 텍스트 - 전체 화면</span>
                  <button className="text-sm flex items-center space-x-1" onClick={() => setIsAnswerFullscreen(false)}>
                    <Minimize2 className="w-4 h-4" />
                    <span>닫기</span>
                  </button>
                </div>
                <Textarea
                  autoFocus
                  value={answerText}
                  onChange={(e) => setAnswerText(e.target.value)}
                  className="flex-1 min-h-[70vh]"
                  placeholder="답안 텍스트 편집"
                />
              </div>
            )}

            <div className="mt-4 hidden lg:block">
              <Button
                onClick={handleAnalysis}
                disabled={!questionText || !answerText || isAnalyzing || credits < 1}
                className="w-full"
                size="lg"
              >
                {isAnalyzing ? "분석 중..." : `논술 분석 시작하기 (1 크레딧 소모)`}
              </Button>

              {/* 재시도 가능한 오류 메시지 및 재시도 버튼 */}
              {retryableError && (
                <div className="mt-4 p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
                  <div className="flex items-start space-x-3">
                    <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs">!</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-orange-800 dark:text-orange-200 mb-2">
                        {retryableError}
                      </p>
                      <div className="text-xs text-orange-700 dark:text-orange-300 mb-3 space-y-1">
                        <p>• AI 서버가 일시적으로 과부하 상태입니다</p>
                        <p>• 보통 5-10분 후에 정상화됩니다</p>
                        <p>• 오전 시간대나 사용자가 적은 시간에 시도해보세요</p>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          onClick={handleAnalysis}
                          disabled={isAnalyzing}
                          size="sm"
                          className="bg-orange-500 hover:bg-orange-600 text-white"
                        >
                          {isAnalyzing ? "재시도 중..." : "다시 시도하기"}
                        </Button>
                        <Button
                          onClick={() => setRetryableError(null)}
                          variant="outline"
                          size="sm"
                        >
                          닫기
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 모바일 하단 고정 액션바 */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/75 p-3">
              <div className="flex items-center space-x-2">
                <Button
                  onClick={() => {
                    const prev = localStorage.getItem('essay_question_prev')
                    if (prev !== null) setQuestionText(prev)
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  문제 되돌리기
                </Button>
                <Button
                  onClick={() => {
                    const prev = localStorage.getItem('essay_answer_prev')
                    if (prev !== null) setAnswerText(prev)
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  답안 되돌리기
                </Button>
              </div>
              <Button
                onClick={handleAnalysis}
                disabled={!questionText || !answerText || isAnalyzing || credits < 1}
                className="w-full mt-2"
                size="lg"
              >
                {isAnalyzing ? "분석 중..." : `논술 분석 시작하기 (1 크레딧 소모)`}
              </Button>
              <div className="h-2" />
            </div>

            {/* Analysis Results Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5" />
                  <span>분석 결과</span>
                </CardTitle>
                <CardDescription>AI가 분석한 논술 평가 결과입니다</CardDescription>
              </CardHeader>
              <CardContent>
                {isAnalyzing ? (
                  <div className="space-y-4">
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                      <p className="text-muted-foreground">AI가 논술을 분석하고 있습니다...</p>
                    </div>
                  </div>
                ) : analysisResult ? (
                  <div className="space-y-6">
                    {/* Score */}
                    <div className="text-center p-6 bg-muted/30 rounded-lg">
                      <div className="text-3xl font-bold text-primary mb-2">
                        {analysisResult.score}/{analysisResult.maxScore}
                      </div>
                      <p className="text-muted-foreground">예상 점수</p>
                    </div>

                    {/* Category Scores */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-foreground">세부 평가</h4>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>논리성</span>
                            <span className="text-primary">{analysisResult.categories.logic}/10</span>
                          </div>
                          <Progress value={analysisResult.categories.logic * 10} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>창의성</span>
                            <span className="text-secondary">{analysisResult.categories.creativity}/10</span>
                          </div>
                          <Progress value={analysisResult.categories.creativity * 10} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>표현력</span>
                            <span className="text-accent">{analysisResult.categories.expression}/10</span>
                          </div>
                          <Progress value={analysisResult.categories.expression * 10} className="h-2" />
                        </div>
                      </div>
                    </div>

                    {/* Strengths */}
                    <div>
                      <h4 className="font-semibold text-foreground mb-3">주요 강점</h4>
                      <ul className="space-y-2">
                        {analysisResult.strengths.map((strength: string, index: number) => (
                          <li key={index} className="flex items-start space-x-2">
                            <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-sm text-foreground">{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Weaknesses */}
                    <div>
                      <h4 className="font-semibold text-foreground mb-3">보완점</h4>
                      <ul className="space-y-2">
                        {analysisResult.weaknesses.map((weakness: string, index: number) => (
                          <li key={index} className="flex items-start space-x-2">
                            <div className="w-2 h-2 bg-secondary rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-sm text-foreground">{weakness}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Improvements */}
                    <div>
                      <h4 className="font-semibold text-foreground mb-3">개선 방안</h4>
                      <ul className="space-y-2">
                        {analysisResult.improvements.map((improvement: string, index: number) => (
                          <li key={index} className="flex items-start space-x-2">
                            <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-sm text-foreground">{improvement}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>분석 결과가 여기에 표시됩니다</p>
                    <p className="text-sm mt-2">파일을 업로드하고 분석을 요청해주세요</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>분석 히스토리</CardTitle>
                <CardDescription>이전에 분석받았던 논술 내역을 확인할 수 있습니다</CardDescription>
              </CardHeader>
              <CardContent>
                {analysisHistory.length > 0 ? (
                  <div className="space-y-4">
                    {analysisHistory.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() => handleViewAnalysis(item)}
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                            <BarChart3 className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-medium text-foreground">
                              {item.questionTitle}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {item.analysisDate}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <Badge variant="secondary" className="text-lg px-3 py-1">
                            {item.score}/{item.maxScore}
                          </Badge>
                          <Button variant="ghost" size="sm">
                            결과 보기
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>분석 히스토리가 없습니다</p>
                    <p className="text-sm mt-2">논술을 분석하면 히스토리에 저장됩니다</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="credits">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>현재 크레딧</CardTitle>
                  <CardDescription>논술 분석에 사용할 수 있는 크레딧입니다</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center p-6">
                    <div className="text-4xl font-bold text-primary mb-2">{credits}</div>
                    <p className="text-muted-foreground">보유 크레딧</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>크레딧 구매</CardTitle>
                  <CardDescription>추가 크레딧을 구매하여 더 많은 분석을 받아보세요</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                      <div>
                        <p className="font-medium">기본 패키지</p>
                        <p className="text-sm text-muted-foreground">10 크레딧</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">5,000원</p>
                        <Button size="sm" asChild>
                          <Link href="/dashboard/credits">구매하기</Link>
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 border border-primary rounded-lg bg-primary/5">
                      <div>
                        <p className="font-medium">프리미엄 패키지</p>
                        <p className="text-sm text-muted-foreground">20 크레딧</p>
                        <Badge variant="secondary" className="text-xs">
                          10% 할인
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">9,000원</p>
                        <Button size="sm" asChild>
                          <Link href="/dashboard/credits">구매하기</Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
