'use client'

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, BarChart3, Download, Share2 } from "lucide-react"
import { useRouter } from "next/navigation"

export default function AnalysisResults() {
  const router = useRouter()
  const [analysisResult, setAnalysisResult] = useState<any>(null)

  useEffect(() => {
    // 세션 스토리지에서 분석 결과 가져오기
    const storedResult = sessionStorage.getItem('latestAnalysisResult')
    
    if (storedResult) {
      try {
        const parsedResult = JSON.parse(storedResult)
        setAnalysisResult(parsedResult)
        // 사용 후 세션 스토리지에서 제거
        sessionStorage.removeItem('latestAnalysisResult')
      } catch (error) {
        console.error('분석 결과 파싱 오류:', error)
        // 파싱 실패 시 기본값 사용
        setDefaultResult()
      }
    } else {
      // 세션 스토리지에 데이터가 없으면 기본값 사용
      setDefaultResult()
    }
  }, [])

  const setDefaultResult = () => {
    setAnalysisResult({
      score: 17.5,
      maxScore: 20,
      strengths: [
        "문제 상황에 대한 정확한 인식과 체계적인 접근",
        "피해자 보호를 최우선으로 하는 교육적 관점",
        "개별 상담과 집단 지도를 병행하는 균형잡힌 해결책",
      ],
      weaknesses: [
        "구체적인 실행 방안과 단계별 계획이 부족",
        "학부모 및 학교 차원의 협력 방안 미흡",
        "장기적 관찰과 사후 관리 계획 부재",
      ],
      improvements: [
        "단계별 실행 계획을 구체적으로 제시하여 실현 가능성을 높이세요",
        "학부모, 동료 교사, 관리자와의 협력 체계를 명시하세요",
        "사후 관리와 지속적 모니터링 방안을 포함하세요",
      ],
      categories: {
        logic: 9,
        creativity: 8,
        expression: 7.5,
      },
      analysisDate: "2025년 1월 15일",
      questionTitle: "학급 내 따돌림 상황 대응 방안",
    })
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
                <Badge variant="secondary" className="text-lg px-4 py-2">
                  우수한 수준
                </Badge>
                <p className="text-muted-foreground mt-2">전체 평균보다 높은 점수입니다</p>
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
                  <div className="text-2xl font-bold text-primary mb-2">{analysisResult.categories.logic}/10</div>
                  <p className="font-medium mb-2">논리성</p>
                  <Progress value={analysisResult.categories.logic * 10} className="h-2" />
                </div>
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <div className="text-2xl font-bold text-secondary mb-2">
                    {analysisResult.categories.creativity}/10
                  </div>
                  <p className="font-medium mb-2">창의성</p>
                  <Progress value={analysisResult.categories.creativity * 10} className="h-2" />
                </div>
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <div className="text-2xl font-bold text-accent mb-2">{analysisResult.categories.expression}/10</div>
                  <p className="font-medium mb-2">표현력</p>
                  <Progress value={analysisResult.categories.expression * 10} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Analysis */}
          <div className="grid md:grid-cols-1 gap-6">
            {/* Strengths */}
            <Card>
              <CardHeader>
                <CardTitle className="text-green-600">주요 강점</CardTitle>
                <CardDescription>답안에서 잘 작성된 부분들입니다</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {analysisResult.strengths.map((strength: string, index: number) => (
                    <li
                      key={index}
                      className="flex items-start space-x-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg"
                    >
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-sm font-bold">{index + 1}</span>
                      </div>
                      <span className="text-foreground leading-relaxed">{strength}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Weaknesses */}
            <Card>
              <CardHeader>
                <CardTitle className="text-orange-600">보완이 필요한 부분</CardTitle>
                <CardDescription>개선할 수 있는 영역들입니다</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {analysisResult.weaknesses.map((weakness: string, index: number) => (
                    <li
                      key={index}
                      className="flex items-start space-x-3 p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg"
                    >
                      <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-sm font-bold">{index + 1}</span>
                      </div>
                      <span className="text-foreground leading-relaxed">{weakness}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Improvements */}
            <Card>
              <CardHeader>
                <CardTitle className="text-blue-600">구체적 개선 방안</CardTitle>
                <CardDescription>다음 논술 작성 시 참고할 수 있는 개선 방향입니다</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {analysisResult.improvements.map((improvement: string, index: number) => (
                    <li
                      key={index}
                      className="flex items-start space-x-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg"
                    >
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-sm font-bold">{index + 1}</span>
                      </div>
                      <span className="text-foreground leading-relaxed">{improvement}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <Link href="/essay" className="flex-1">
              <Button variant="outline" className="w-full bg-transparent">
                <ArrowLeft className="w-4 h-4 mr-2" />
                새로운 분석 시작하기
              </Button>
            </Link>
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
