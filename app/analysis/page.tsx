'use client'

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, BarChart3, Download, Share2, FileText, CheckCircle, AlertTriangle, Lightbulb } from "lucide-react"
import { useRouter } from "next/navigation"

export default function AnalysisResults() {
  const router = useRouter()
  const [analysisResult, setAnalysisResult] = useState<any>(null)

  useEffect(() => {
    // 세션 스토리지에서 분석 결과 가져오기
    const storedResult = sessionStorage.getItem('latestAnalysisResult')
    console.log('세션 스토리지에서 읽어온 데이터:', storedResult)
    
    if (storedResult) {
      try {
        const parsedResult = JSON.parse(storedResult)
        console.log('세션 스토리지에서 파싱된 분석 결과:', parsedResult)
        setAnalysisResult(parsedResult)
        // 세션 스토리지에서 제거하지 않음 (페이지 새로고침 시에도 유지)
      } catch (error) {
        console.error('분석 결과 파싱 오류:', error)
        // 파싱 실패 시 기본값 사용
        setDefaultResult()
      }
    } else {
      console.log('세션 스토리지에 데이터가 없음')
      // 세션 스토리지에 데이터가 없으면 기본값 사용
      setDefaultResult()
    }
  }, [])

  const setDefaultResult = () => {
    // 세션 스토리지에 데이터가 없을 때만 기본값 사용
    setAnalysisResult({
      score: 0,
      maxScore: 20,
      strengths: ["분석 데이터가 없습니다."],
      weaknesses: ["분석 데이터가 없습니다."],
      improvements: ["분석 데이터가 없습니다."],
      detailedAnalysis: {
        contentAnalysis: "분석할 논술 내용이 없습니다. /essay 페이지에서 먼저 분석을 진행해주세요.",
        structureAnalysis: "분석할 논술 체계가 없습니다. /essay 페이지에서 먼저 분석을 진행해주세요.",
        educationalPerspective: "교육적 관점 분석 데이터가 없습니다. /essay 페이지에서 먼저 분석을 진행해주세요.",
        educationalTheory: "교육학 이론 관점 분석 데이터가 없습니다. /essay 페이지에서 먼저 분석을 진행해주세요.",
      },
      categories: {
        logicalStructure: 0,
        spelling: 0,
        vocabulary: 0,
      },
      analysisDate: new Date().toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      questionTitle: "분석 데이터 없음",
      questionText: "분석할 문제가 없습니다. /essay 페이지에서 먼저 분석을 진행해주세요.",
      answerText: "분석할 답안이 없습니다. /essay 페이지에서 먼저 분석을 진행해주세요.",
    })
  }

  const handleNewAnalysis = () => {
    // 새로운 분석을 시작할 때 세션 스토리지 정리
    sessionStorage.removeItem('latestAnalysisResult')
    router.push('/essay')
  }

  if (!analysisResult) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                홈으로 돌아가기
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-foreground">분석 결과</h1>
              <p className="text-sm text-muted-foreground">{analysisResult.analysisDate}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              PDF 다운로드
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="w-4 h-4 mr-2" />
              공유하기
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          {/* Question Title */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{analysisResult.questionTitle}</CardTitle>
              <CardDescription>분석 완료된 논술 문제</CardDescription>
            </CardHeader>
          </Card>

          {/* Overall Score */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5" />
                <span>종합 점수</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center p-8 bg-muted/30 rounded-lg">
                <div className="text-5xl font-bold text-primary mb-4">
                  {analysisResult.score}/{analysisResult.maxScore}
                </div>
                <Badge variant={analysisResult.score > 0 ? "secondary" : "destructive"} className="text-lg px-4 py-2">
                  {analysisResult.score > 0 ? 
                    (analysisResult.score >= 16 ? "우수한 수준" : 
                     analysisResult.score >= 12 ? "보통 수준" : "개선 필요") : 
                    "분석 데이터 없음"}
                </Badge>
                <p className="text-muted-foreground mt-2">
                  {analysisResult.score > 0 ? 
                    "전체 평균보다 높은 점수입니다" : 
                    "분석을 먼저 진행해주세요"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Category Scores */}
          <Card>
            <CardHeader>
              <CardTitle>세부 평가 항목</CardTitle>
              <CardDescription>각 평가 기준별 상세 점수입니다</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <div className="text-2xl font-bold text-primary mb-2">{analysisResult.categories.logicalStructure}/10</div>
                  <p className="font-medium mb-2">논리적 체계성</p>
                  <Progress value={analysisResult.categories.logicalStructure * 10} className="h-2" />
                </div>
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <div className="text-2xl font-bold text-secondary mb-2">
                    {analysisResult.categories.spelling}/10
                  </div>
                  <p className="font-medium mb-2">맞춤법</p>
                  <Progress value={analysisResult.categories.spelling * 10} className="h-2" />
                </div>
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <div className="text-2xl font-bold text-accent mb-2">{analysisResult.categories.vocabulary}/10</div>
                  <p className="font-medium mb-2">어휘 및 문장의 적절성</p>
                  <Progress value={analysisResult.categories.vocabulary * 10} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Analysis */}
          <div className="grid md:grid-cols-1 gap-6">
            {/* Original Question and Answer */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="w-5 h-5" />
                  <span>원본 문제 및 답안</span>
                </CardTitle>
                <CardDescription>분석된 논술 문제와 작성한 답안입니다</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-foreground mb-2">문제</h4>
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <p className="text-foreground whitespace-pre-wrap">{analysisResult.questionText}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">답안</h4>
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <p className="text-foreground whitespace-pre-wrap">{analysisResult.answerText}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Strengths */}
            <Card>
              <CardHeader>
                <CardTitle className="text-green-600 flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5" />
                  <span>주요 강점</span>
                </CardTitle>
                <CardDescription>답안에서 잘 작성된 부분들입니다</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {analysisResult.strengths.map((strength: string, index: number) => (
                    <li
                      key={index}
                      className="flex items-start space-x-3 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800"
                    >
                      <div className="w-7 h-7 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-sm font-bold">{index + 1}</span>
                      </div>
                      <div className="flex-1">
                        <span className="text-foreground leading-relaxed text-sm">{strength}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Weaknesses */}
            <Card>
              <CardHeader>
                <CardTitle className="text-orange-600 flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5" />
                  <span>보완이 필요한 부분</span>
                </CardTitle>
                <CardDescription>개선할 수 있는 영역들입니다</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {analysisResult.weaknesses.map((weakness: string, index: number) => (
                    <li
                      key={index}
                      className="flex items-start space-x-3 p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800"
                    >
                      <div className="w-7 h-7 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-sm font-bold">{index + 1}</span>
                      </div>
                      <div className="flex-1">
                        <span className="text-foreground leading-relaxed text-sm">{weakness}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Improvements */}
            <Card>
              <CardHeader>
                <CardTitle className="text-blue-600 flex items-center space-x-2">
                  <Lightbulb className="w-5 h-5" />
                  <span>구체적 개선 방안</span>
                </CardTitle>
                <CardDescription>다음 논술 작성 시 참고할 수 있는 개선 방향입니다</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {analysisResult.improvements.map((improvement: string, index: number) => (
                    <li
                      key={index}
                      className="flex items-start space-x-3 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800"
                    >
                      <div className="w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-sm font-bold">{index + 1}</span>
                      </div>
                      <div className="flex-1">
                        <span className="text-foreground leading-relaxed text-sm">{improvement}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Detailed Analysis */}
            {analysisResult.detailedAnalysis && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="w-5 h-5" />
                    <span>상세 분석 결과</span>
                  </CardTitle>
                  <CardDescription>배점 기준에 따른 종합적이고 상세한 분석입니다</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">논술 내용 분석</h4>
                        <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
                          {analysisResult.detailedAnalysis.contentAnalysis}
                        </p>
                      </div>
                      <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                        <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">논술 체계 분석</h4>
                        <p className="text-sm text-green-700 dark:text-green-300 leading-relaxed">
                          {analysisResult.detailedAnalysis.structureAnalysis}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
                        <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">교육적 관점 평가</h4>
                        <p className="text-sm text-purple-700 dark:text-purple-300 leading-relaxed">
                          {analysisResult.detailedAnalysis.educationalPerspective}
                        </p>
                      </div>
                      <div className="p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
                        <h4 className="font-semibold text-orange-800 dark:text-orange-200 mb-2">교육학 이론 관점 평가</h4>
                        <p className="text-sm text-orange-700 dark:text-orange-300 leading-relaxed">
                          {analysisResult.detailedAnalysis.educationalTheory}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Score Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5" />
                  <span>점수 상세 분석</span>
                </CardTitle>
                <CardDescription>각 평가 기준별 상세 점수와 분석입니다</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-muted/30 rounded-lg">
                      <div className="text-3xl font-bold text-primary mb-2">{analysisResult.categories.logicalStructure}/10</div>
                      <p className="font-medium mb-2">논리적 체계성</p>
                      <Progress value={analysisResult.categories.logicalStructure * 10} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-2">논리적 구조와 전개 방식</p>
                    </div>
                    <div className="text-center p-4 bg-muted/30 rounded-lg">
                      <div className="text-3xl font-bold text-secondary mb-2">{analysisResult.categories.spelling}/10</div>
                      <p className="font-medium mb-2">맞춤법</p>
                      <Progress value={analysisResult.categories.spelling * 10} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-2">맞춤법과 띄어쓰기 정확성</p>
                    </div>
                    <div className="text-center p-4 bg-muted/30 rounded-lg">
                      <div className="text-3xl font-bold text-accent mb-2">{analysisResult.categories.vocabulary}/10</div>
                      <p className="font-medium mb-2">어휘 및 문장의 적절성</p>
                      <Progress value={analysisResult.categories.vocabulary * 10} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-2">어휘 선택과 문장 구성</p>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <h4 className="font-semibold text-foreground mb-2">종합 평가</h4>
                    <p className="text-sm text-foreground">
                      총 {analysisResult.score}점으로 {analysisResult.maxScore}점 만점 중 {Math.round((analysisResult.score / analysisResult.maxScore) * 100)}%를 획득했습니다.
                      {analysisResult.score >= 16 ? " 우수한 수준의 논술입니다." : 
                       analysisResult.score >= 12 ? " 보통 수준의 논술입니다." : 
                       " 개선이 필요한 논술입니다."}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <Button 
              onClick={handleNewAnalysis}
              variant="outline" 
              className="flex-1 bg-transparent"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              새로운 분석 시작하기
            </Button>
            <Button className="flex-1">
              <Download className="w-4 h-4 mr-2" />
              결과 저장하기
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
