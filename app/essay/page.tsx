"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, FileText, BarChart3, History, CreditCard, User, LogOut, Maximize2, Minimize2, X, ArrowUp, ArrowDown, Plus } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/useAuth"
import { useRouter } from "next/navigation"

export default function EssayPage() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [credits, setCredits] = useState(25)
  const [questionFile, setQuestionFile] = useState<File | null>(null)
  const [answerFiles, setAnswerFiles] = useState<File[]>([])
  const [answerFileTexts, setAnswerFileTexts] = useState<string[]>([])
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

  // 페이지 진입 시 분석 결과 초기화
  useEffect(() => {
    // 새로고침이나 페이지 재진입 시 이전 분석 결과 초기화
    setAnalysisResult(null)
    setRetryableError(null)
  }, [])

  // 답안 파일 텍스트가 변경될 때마다 답안 텍스트 업데이트
  useEffect(() => {
    if (answerFileTexts.length > 0) {
      updateAnswerText()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answerFileTexts])

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
    
    // 1. 기본 정리: 연속된 공백 제거, 줄바꿈 정리
    let text = input
      .replace(/\r\n?/g, "\n")  // 줄바꿈 통일
      .replace(/\n+/g, "\n")    // 연속된 줄바꿈을 하나로
      .replace(/\s+/g, " ")     // 연속된 공백을 하나로
      .trim()

    // 2. 문장 단위로 분리하여 자연스럽게 연결
    const sentences = text.split(/([.!?]+\s*)/)
    const paragraphs: string[] = []
    let currentParagraph = ""

    for (let i = 0; i < sentences.length; i += 2) {
      const sentence = sentences[i]?.trim()
      const punctuation = sentences[i + 1]?.trim()
      
      if (!sentence) continue
      
      const fullSentence = sentence + (punctuation || "")
      
      // 문단 구분 기준: 문장이 길거나 특정 키워드로 시작
      const isNewParagraph = 
        currentParagraph.length > 200 || // 문단이 충분히 길 때
        /^(먼저|다음으로|마지막으로|첫째|둘째|셋째|넷째|다섯째)/.test(fullSentence) ||
        /^[0-9]+[\)\.\-]/.test(fullSentence) // 번호 목록
        
      if (isNewParagraph && currentParagraph) {
        paragraphs.push(currentParagraph.trim())
        currentParagraph = fullSentence
      } else {
        currentParagraph += (currentParagraph ? " " : "") + fullSentence
      }
    }
    
    if (currentParagraph.trim()) {
      paragraphs.push(currentParagraph.trim())
    }

    return paragraphs.join("\n\n")
  }

  // 여러 파일의 OCR 결과를 순서대로 이어붙이기
  const combineAnswerTexts = () => {
    if (answerFileTexts.length === 0) return answerText
    
    const combinedTexts = answerFileTexts.filter(text => text.trim()).join("\n\n")
    return combinedTexts || answerText
  }

  // 답안 텍스트 업데이트 (여러 파일 + 수동 입력)
  const updateAnswerText = () => {
    const combined = combineAnswerTexts()
    setAnswerText(combined)
    debouncedSave('essay_answer', combined)
  }

  // 클로바 OCR 결과를 간단하고 안정적으로 처리
  const formatOcrTextWithLayout = (rawResult: any, fallbackText: string) => {
    try {
      // 1. API에서 이미 추출한 텍스트를 우선 사용 (가장 안정적)
      if (fallbackText && fallbackText.trim()) {
        return formatOcrText(fallbackText)
      }

      // 2. rawResult에서 텍스트 추출 시도 (fallback)
      if (!rawResult || typeof rawResult !== 'object') {
        return formatOcrText(fallbackText)
      }

      let extractedText = ""

      // 클로바 OCR 응답 구조에 맞게 텍스트 추출
      if (rawResult.images && Array.isArray(rawResult.images) && rawResult.images.length > 0) {
        const image = rawResult.images[0]
        
        // 방법 1: fields에서 텍스트 추출 (가장 안정적)
        if (image.fields && Array.isArray(image.fields)) {
          const fieldTexts = image.fields
            .map((field: any) => field.inferText || field.text || '')
            .filter((text: string) => text.trim())
          
          if (fieldTexts.length > 0) {
            extractedText = fieldTexts.join('\n')
          }
        }
        
        // 방법 2: lines에서 텍스트 추출
        if (!extractedText && image.lines && Array.isArray(image.lines)) {
          const lineTexts = image.lines
            .map((line: any) => {
              if (line.words && Array.isArray(line.words)) {
                return line.words
                  .map((word: any) => word.inferText || word.text || '')
                  .filter((text: string) => text.trim())
                  .join(' ')
              }
              return line.inferText || line.text || ''
            })
            .filter((text: string) => text.trim())
          
          if (lineTexts.length > 0) {
            extractedText = lineTexts.join('\n')
          }
        }
      }

      // 3. 추출된 텍스트가 있으면 포맷팅하여 반환
      if (extractedText.trim()) {
        return formatOcrText(extractedText)
      }

      // 4. 모든 방법이 실패하면 fallback 텍스트 사용
      return formatOcrText(fallbackText)

    } catch (error) {
      console.error('OCR 텍스트 처리 오류:', error)
      return formatOcrText(fallbackText)
    }
  }

  const processOCR = async (file: File, type: "question" | "answer", fileIndex?: number) => {
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

      // OCR 결과 디버깅
      console.log('OCR API 응답:', {
        text: result.text,
        hasRawResult: !!result.rawResult,
        rawResultKeys: result.rawResult ? Object.keys(result.rawResult) : []
      })

      const formatted = formatOcrTextWithLayout(result.rawResult, result.text || "")
      const extractedText = formatted || "텍스트를 추출할 수 없습니다."
      
      console.log('최종 추출된 텍스트:', extractedText.substring(0, 200) + '...')

      if (type === "question") {
        setQuestionText(extractedText)
      } else {
        // 답안의 경우 여러 파일 처리
        if (fileIndex !== undefined) {
          const newTexts = [...answerFileTexts]
          newTexts[fileIndex] = extractedText
          setAnswerFileTexts(newTexts)
          // 답안 텍스트 자동 업데이트
          setTimeout(() => updateAnswerText(), 100)
        } else {
          setAnswerText(extractedText)
        }
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
        const mockText = "이러한 상황에서 교사로서 다음과 같이 대응하겠습니다.\n\n첫째, 즉시 상황을 파악하고 피해 학생을 보호하겠습니다. 피해 학생과 개별 상담을 통해 심리적 안정을 도모하고, 필요시 상담교사나 학부모와 연계하여 지원체계를 구축하겠습니다.\n\n둘째, 가해 학생들과 개별 및 집단 상담을 실시하여 자신들의 행동이 타인에게 미치는 영향을 깨닫게 하고, 공감 능력을 기르도록 지도하겠습니다.\n\n셋째, 학급 전체를 대상으로 인권 교육과 배려 문화 조성을 위한 활동을 전개하여 재발 방지에 힘쓰겠습니다."
        
        if (fileIndex !== undefined) {
          const newTexts = [...answerFileTexts]
          newTexts[fileIndex] = mockText
          setAnswerFileTexts(newTexts)
          setTimeout(() => updateAnswerText(), 100)
        } else {
          setAnswerText(mockText)
        }
      }
      
      alert(`OCR 처리 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}\n\nMock 데이터로 대체됩니다.`)
    }
  }

  const handleFileUpload = (file: File, type: "question" | "answer") => {
    if (type === "question") {
      setQuestionFile(file)
      processOCR(file, type)
    } else {
      // 답안의 경우 여러 파일 추가
      const newFiles = [...answerFiles, file]
      setAnswerFiles(newFiles)
      
      // 새로운 파일 텍스트 배열 확장
      const newTexts = [...answerFileTexts, ""]
      setAnswerFileTexts(newTexts)
      
      // OCR 처리 (새 파일의 인덱스 전달)
      processOCR(file, type, newFiles.length - 1)
    }
  }

  const handleMultipleFileUpload = (files: FileList, type: "question" | "answer") => {
    if (type === "question") {
      // 문제는 하나의 파일만 허용
      if (files.length > 0) {
        handleFileUpload(files[0], type)
      }
    } else {
      // 답안은 여러 파일 허용
      const fileArray = Array.from(files)
      const newFiles = [...answerFiles, ...fileArray]
      setAnswerFiles(newFiles)
      
      // 새로운 파일 텍스트 배열 확장
      const newTexts = [...answerFileTexts, ...Array(fileArray.length).fill("")]
      setAnswerFileTexts(newTexts)
      
      // 각 파일에 대해 OCR 처리
      fileArray.forEach((file, index) => {
        const fileIndex = answerFiles.length + index
        processOCR(file, type, fileIndex)
      })
    }
  }

  const removeAnswerFile = (index: number) => {
    const newFiles = answerFiles.filter((_, i) => i !== index)
    const newTexts = answerFileTexts.filter((_, i) => i !== index)
    setAnswerFiles(newFiles)
    setAnswerFileTexts(newTexts)
    updateAnswerText()
  }

  const moveAnswerFile = (fromIndex: number, toIndex: number) => {
    const newFiles = [...answerFiles]
    const newTexts = [...answerFileTexts]
    
    // 파일과 텍스트를 함께 이동
    const [movedFile] = newFiles.splice(fromIndex, 1)
    const [movedText] = newTexts.splice(fromIndex, 1)
    
    newFiles.splice(toIndex, 0, movedFile)
    newTexts.splice(toIndex, 0, movedText)
    
    setAnswerFiles(newFiles)
    setAnswerFileTexts(newTexts)
    updateAnswerText()
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
      
      // 분석 결과가 현재 페이지에 표시되도록 하고, 사용자가 원할 때 /analysis 페이지로 이동할 수 있도록 함
      // router.push('/analysis') 제거
      
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

  const clearAnalysisResult = () => {
    setAnalysisResult(null)
    setRetryableError(null)
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
                            answerFiles.length > 0 && "border-primary bg-primary/5",
                          )}
                          onClick={() => document.getElementById("answer-file")?.click()}
                        >
                          <input
                            id="answer-file"
                            type="file"
                            accept=".jpg,.jpeg,.png,.pdf"
                            multiple
                            className="hidden"
                            onChange={(e) => e.target.files && handleMultipleFileUpload(e.target.files, "answer")}
                          />
                          {answerFiles.length > 0 ? (
                            <div className="space-y-2">
                              <div className="flex items-center justify-center space-x-2">
                                <FileText className="w-5 h-5 text-primary" />
                                <span className="text-sm text-primary">{answerFiles.length}개 파일 업로드됨</span>
                              </div>
                              <p className="text-xs text-muted-foreground">클릭하여 추가 파일 업로드</p>
                            </div>
                          ) : (
                            <div>
                              <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                              <p className="text-sm text-muted-foreground">답안 파일을 여기에 드래그하거나 클릭하세요</p>
                              <p className="text-xs text-muted-foreground mt-1">여러 장의 답안을 순서대로 업로드할 수 있습니다</p>
                            </div>
                          )}
                        </div>
                        
                        {/* 업로드된 파일 목록 */}
                        {answerFiles.length > 0 && (
                          <div className="mt-3 space-y-2">
                            <p className="text-xs font-medium text-foreground">업로드된 파일 ({answerFiles.length}개)</p>
                            {answerFiles.map((file, index) => (
                              <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                                <div className="flex items-center space-x-2 flex-1 min-w-0">
                                  <FileText className="w-4 h-4 text-primary flex-shrink-0" />
                                  <span className="text-sm text-foreground truncate">{file.name}</span>
                                  <Badge variant="outline" className="text-xs">
                                    {index + 1}번째
                                  </Badge>
                                </div>
                                <div className="flex items-center space-x-1">
                                  {index > 0 && (
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-6 w-6 p-0"
                                      onClick={() => moveAnswerFile(index, index - 1)}
                                    >
                                      <ArrowUp className="w-3 h-3" />
                                    </Button>
                                  )}
                                  {index < answerFiles.length - 1 && (
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-6 w-6 p-0"
                                      onClick={() => moveAnswerFile(index, index + 1)}
                                    >
                                      <ArrowDown className="w-3 h-3" />
                                    </Button>
                                  )}
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                                    onClick={() => removeAnswerFile(index)}
                                  >
                                    <X className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
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
                        {answerFiles.length > 0 && (
                          <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                            <p className="text-xs text-blue-800 dark:text-blue-200">
                              💡 여러 파일의 OCR 결과가 자동으로 결합되어 위 텍스트에 표시됩니다. 
                              필요시 수동으로 편집할 수 있습니다.
                            </p>
                          </div>
                        )}
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
                        answerFiles.length > 0 && "border-primary bg-primary/5",
                      )}
                      onClick={() => document.getElementById("answer-file-desktop")?.click()}
                    >
                      <input
                        id="answer-file-desktop"
                        type="file"
                        accept=".jpg,.jpeg,.png,.pdf"
                        multiple
                        className="hidden"
                        onChange={(e) => e.target.files && handleMultipleFileUpload(e.target.files, "answer")}
                      />
                      {answerFiles.length > 0 ? (
                        <div className="space-y-2">
                          <div className="flex items-center justify-center space-x-2">
                            <FileText className="w-5 h-5 text-primary" />
                            <span className="text-sm text-primary">{answerFiles.length}개 파일 업로드됨</span>
                          </div>
                          <p className="text-xs text-muted-foreground">클릭하여 추가 파일 업로드</p>
                        </div>
                      ) : (
                        <div>
                          <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">답안 파일을 여기에 드래그하거나 클릭하세요</p>
                          <p className="text-xs text-muted-foreground mt-1">여러 장의 답안을 순서대로 업로드할 수 있습니다</p>
                        </div>
                      )}
                    </div>
                    
                    {/* 업로드된 파일 목록 */}
                    {answerFiles.length > 0 && (
                      <div className="mt-3 space-y-2">
                        <p className="text-xs font-medium text-foreground">업로드된 파일 ({answerFiles.length}개)</p>
                        {answerFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                            <div className="flex items-center space-x-2 flex-1 min-w-0">
                              <FileText className="w-4 h-4 text-primary flex-shrink-0" />
                              <span className="text-sm text-foreground truncate">{file.name}</span>
                              <Badge variant="outline" className="text-xs">
                                {index + 1}번째
                              </Badge>
                            </div>
                            <div className="flex items-center space-x-1">
                              {index > 0 && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 w-6 p-0"
                                  onClick={() => moveAnswerFile(index, index - 1)}
                                >
                                  <ArrowUp className="w-3 h-3" />
                                </Button>
                              )}
                              {index < answerFiles.length - 1 && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 w-6 p-0"
                                  onClick={() => moveAnswerFile(index, index + 1)}
                                >
                                  <ArrowDown className="w-3 h-3" />
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                                onClick={() => removeAnswerFile(index)}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
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
                    {answerFiles.length > 0 && (
                      <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <p className="text-xs text-blue-800 dark:text-blue-200">
                          💡 여러 파일의 OCR 결과가 자동으로 결합되어 위 텍스트에 표시됩니다. 
                          필요시 수동으로 편집할 수 있습니다.
                        </p>
                      </div>
                    )}
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
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5" />
                    <span>분석 결과</span>
                  </div>
                  {analysisResult && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAnalysisResult}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-4 h-4 mr-1" />
                      초기화
                    </Button>
                  )}
                </div>
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

                    {/* 상세 결과 보기 버튼 */}
                    <div className="pt-4 border-t border-border">
                      <Button 
                        onClick={() => router.push('/analysis')}
                        className="w-full"
                        variant="outline"
                      >
                        <BarChart3 className="w-4 h-4 mr-2" />
                        상세 결과 보기
                      </Button>
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
