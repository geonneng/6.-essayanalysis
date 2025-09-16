"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, FileText, BarChart3, History, CreditCard, User, LogOut } from "lucide-react"
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

  const handleFileUpload = (file: File, type: "question" | "answer") => {
    if (type === "question") {
      setQuestionFile(file)
      // Mock OCR result
      setQuestionText(
        "다음 상황에서 교사로서 어떻게 대응할 것인지 서술하시오.\n\n학급에서 일부 학생들이 다른 학생을 따돌리는 상황이 발생했습니다. 피해 학생은 위축되어 있고, 가해 학생들은 자신들의 행동이 잘못되었다는 것을 인식하지 못하고 있습니다.",
      )
    } else {
      setAnswerFile(file)
      // Mock OCR result
      setAnswerText(
        "이러한 상황에서 교사로서 다음과 같이 대응하겠습니다.\n\n첫째, 즉시 상황을 파악하고 피해 학생을 보호하겠습니다. 피해 학생과 개별 상담을 통해 심리적 안정을 도모하고, 필요시 상담교사나 학부모와 연계하여 지원체계를 구축하겠습니다.\n\n둘째, 가해 학생들과 개별 및 집단 상담을 실시하여 자신들의 행동이 타인에게 미치는 영향을 깨닫게 하고, 공감 능력을 기르도록 지도하겠습니다.\n\n셋째, 학급 전체를 대상으로 인권 교육과 배려 문화 조성을 위한 활동을 전개하여 재발 방지에 힘쓰겠습니다.",
      )
    }
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
      
      // 분석 결과를 세션 스토리지에 저장
      sessionStorage.setItem('latestAnalysisResult', JSON.stringify(result))
      
      // /analysis 페이지로 이동
      router.push('/analysis')
      
    } catch (e) {
      console.error('분석 오류:', e)
      alert(`분석 중 오류가 발생했습니다: ${e.message}`)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
  }

  const handleViewAnalysis = (analysisItem: any) => {
    // 선택된 분석 결과를 세션 스토리지에 저장
    sessionStorage.setItem('latestAnalysisResult', JSON.stringify(analysisItem))
    // /analysis 페이지로 이동
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
                    disabled={!questionText || !answerText || isAnalyzing || credits < 1}
                    className="w-full"
                    size="lg"
                  >
                    {isAnalyzing ? "분석 중..." : `논술 분석 시작하기 (1 크레딧 소모)`}
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
