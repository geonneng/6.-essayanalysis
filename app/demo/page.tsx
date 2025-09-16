"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, FileText, BarChart3, History, CreditCard, User, LogOut, Eye, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import Tesseract from 'tesseract.js'

export default function Demo() {
  const [credits, setCredits] = useState(8)
  const [questionFile, setQuestionFile] = useState<File | null>(null)
  const [answerFile, setAnswerFile] = useState<File | null>(null)
  const [questionText, setQuestionText] = useState("")
  const [answerText, setAnswerText] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<any>(null)
  const [isProcessingOCR, setIsProcessingOCR] = useState(false)
  const [ocrProgress, setOcrProgress] = useState(0)
  const [ocrStatus, setOcrStatus] = useState("")

  const handleFileUpload = async (file: File, type: "question" | "answer") => {
    if (type === "question") {
      setQuestionFile(file)
    } else {
      setAnswerFile(file)
    }

    setIsProcessingOCR(true)
    setOcrProgress(0)
    setOcrStatus("OCR 처리 중...")

    try {
      setOcrStatus('텍스트 인식 중...')
      const { data: { text } } = await Tesseract.recognize(file, 'kor+eng')

      if (type === "question") {
        setQuestionText(text)
      } else {
        setAnswerText(text)
      }

      setOcrStatus("OCR 완료!")
      setTimeout(() => {
        setIsProcessingOCR(false)
        setOcrStatus("")
        setOcrProgress(0)
      }, 1000)

    } catch (error) {
      console.error('OCR 오류:', error)
      setOcrStatus("OCR 처리 중 오류가 발생했습니다.")
      
      // 오류 시 기본 텍스트 설정
      if (type === "question") {
        setQuestionText(
          "다음 상황에서 교사로서 어떻게 대응할 것인지 서술하시오.\n\n학급에서 일부 학생들이 다른 학생을 따돌리는 상황이 발생했습니다. 피해 학생은 위축되어 있고, 가해 학생들은 자신들의 행동이 잘못되었다는 것을 인식하지 못하고 있습니다.",
        )
      } else {
        setAnswerText(
          "이러한 상황에서 교사로서 다음과 같이 대응하겠습니다.\n\n첫째, 즉시 상황을 파악하고 피해 학생을 보호하겠습니다. 피해 학생과 개별 상담을 통해 심리적 안정을 도모하고, 필요시 상담교사나 학부모와 연계하여 지원체계를 구축하겠습니다.\n\n둘째, 가해 학생들과 개별 및 집단 상담을 실시하여 자신들의 행동이 타인에게 미치는 영향을 깨닫게 하고, 공감 능력을 기르도록 지도하겠습니다.\n\n셋째, 학급 전체를 대상으로 인권 교육과 배려 문화 조성을 위한 활동을 전개하여 재발 방지에 힘쓰겠습니다.",
        )
      }
      
      setTimeout(() => {
        setIsProcessingOCR(false)
        setOcrStatus("")
        setOcrProgress(0)
      }, 2000)
    }
  }

  const handleAnalysis = async () => {
    if (!questionText || !answerText) return
    setIsAnalyzing(true)
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
      setAnalysisResult(data)
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
        alert(`${errorMessage}\n\n잠시 후 다시 시도해주세요.`)
      } else {
        alert(errorMessage)
      }
    } finally {
      setIsAnalyzing(false)
    }
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
            <Badge variant="secondary" className="ml-2 bg-orange-100 text-orange-800 border-orange-200">
              <Eye className="w-3 h-3 mr-1" />
              데모 모드
            </Badge>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Badge variant="outline" className="flex items-center space-x-1">
              <CreditCard className="w-4 h-4" />
              <span className="hidden sm:inline">무제한</span>
              <span className="sm:hidden">∞</span>
            </Badge>
            <Button variant="outline" size="sm" className="hidden sm:flex bg-transparent">
              <User className="w-4 h-4 mr-2" />
              데모 사용자
            </Button>
            <Button variant="outline" size="sm" className="sm:hidden bg-transparent">
              <User className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="bg-gradient-to-r from-orange-50 to-amber-50 border-b border-orange-200">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-center space-x-2 text-orange-800">
            <Eye className="w-4 h-4" />
            <span className="text-sm font-medium">
              이것은 데모 버전입니다. 실제 크레딧이 차감되지 않으며, 모든 기능을 무료로 체험할 수 있습니다.
            </span>
          </div>
        </div>
      </div>

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
            <div className="grid lg:grid-cols-2 gap-4">
              {/* File Upload Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Upload className="w-5 h-5" />
                    <span>파일 업로드</span>
                  </CardTitle>
                  <CardDescription>문제지와 작성 답안을 업로드하세요 (JPG, PNG, PDF 지원)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">문제지</label>
                    <div
                      className={cn(
                        "border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors",
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
                    <label className="text-sm font-medium text-foreground mb-2 block">작성 답안</label>
                    <div
                      className={cn(
                        "border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors",
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
                </CardContent>
              </Card>

              {/* Text Editing Section */}
              <Card>
                <CardHeader>
                  <CardTitle>텍스트 확인 및 수정</CardTitle>
                  <CardDescription>OCR로 추출된 텍스트를 확인하고 필요시 수정하세요</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* OCR Progress */}
                  {isProcessingOCR && (
                    <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center space-x-3 mb-2">
                        <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                        <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                          {ocrStatus}
                        </span>
                      </div>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">문제 텍스트</label>
                    <Textarea
                      placeholder="문제 텍스트가 여기에 표시됩니다..."
                      value={questionText}
                      onChange={(e) => setQuestionText(e.target.value)}
                      className="min-h-[120px]"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">답안 텍스트</label>
                    <Textarea
                      placeholder="답안 텍스트가 여기에 표시됩니다..."
                      value={answerText}
                      onChange={(e) => setAnswerText(e.target.value)}
                      className="min-h-[200px]"
                    />
                  </div>
                  <Button
                    onClick={handleAnalysis}
                    disabled={!questionText || !answerText || isAnalyzing}
                    className="w-full"
                    size="lg"
                  >
                    {isAnalyzing ? "분석 중..." : `데모 분석 시작하기 (무료)`}
                  </Button>
                </CardContent>
              </Card>
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
                <div className="text-center py-8 text-muted-foreground">
                  <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>데모 모드에서는 히스토리가 저장되지 않습니다</p>
                  <p className="text-sm mt-2">회원가입 후 실제 서비스를 이용해보세요</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="credits">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>현재 크레딧</CardTitle>
                  <CardDescription>데모 모드에서는 무제한 크레딧을 제공합니다</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center p-6">
                    <div className="text-4xl font-bold text-primary mb-2">∞</div>
                    <p className="text-muted-foreground">무제한 크레딧 (데모)</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>실제 서비스 이용하기</CardTitle>
                  <CardDescription>회원가입하고 실제 서비스를 이용해보세요</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                      <div>
                        <p className="font-medium">무료 체험</p>
                        <p className="text-sm text-muted-foreground">10 크레딧 무료 제공</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">무료</p>
                        <Button size="sm" asChild>
                          <Link href="/signup">회원가입</Link>
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
                          <Link href="/signup">시작하기</Link>
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
