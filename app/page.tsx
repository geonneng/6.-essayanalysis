import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Upload, FileText, BarChart3, Users, Clock, Star } from "lucide-react"
import Link from "next/link"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">교직논술 AI</span>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
              서비스 소개
            </Link>
            <Link href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">
              가격 정책
            </Link>
            <Button variant="outline" asChild>
              <Link href="/login">로그인</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">회원가입</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <Badge variant="secondary" className="mb-4">
            AI 기반 논술 분석
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 text-balance">
            AI로 완성하는 당신의 교직논술, <span className="text-primary">합격에 더 가까워지세요</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 text-pretty max-w-2xl mx-auto">
            사진만 찍어 올리면 AI가 채점부터 개선점까지 한번에 분석해 드립니다. 초등 교원 임용시험 준비를 더 효율적으로
            시작하세요.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8" asChild>
              <Link href="/dashboard">무료 크레딧 받고 시작하기</Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 bg-transparent" asChild>
              <Link href="/demo">데모 보기</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">왜 교직논술 AI를 선택해야 할까요?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              전문적인 AI 분석으로 논술 실력을 체계적으로 향상시킬 수 있습니다.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-border">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Upload className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>간편한 업로드</CardTitle>
                <CardDescription>문제지와 답안을 사진으로 찍어 업로드하면 OCR로 자동 텍스트 변환</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6 text-secondary" />
                </div>
                <CardTitle>정확한 분석</CardTitle>
                <CardDescription>AI가 논리성, 창의성, 표현력을 종합적으로 분석하여 예상 점수 제공</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                  <CheckCircle className="w-6 h-6 text-accent" />
                </div>
                <CardTitle>맞춤형 피드백</CardTitle>
                <CardDescription>강점과 약점을 구체적으로 분석하고 개선 방안까지 제시</CardDescription>
              </CardHeader>
            </Card>
          </div>

          <div className="mt-16 grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold text-foreground mb-6">이런 분석 결과를 받을 수 있어요</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-foreground">종합 평가 및 예상 점수</p>
                    <p className="text-sm text-muted-foreground">20점 만점 기준 정확한 점수 예측</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-foreground">논리 구조 분석</p>
                    <p className="text-sm text-muted-foreground">서론-본론-결론의 체계성 평가</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-foreground">구체적 개선점</p>
                    <p className="text-sm text-muted-foreground">약점 보완을 위한 실질적 조언</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-foreground">모범 답안 제안</p>
                    <p className="text-sm text-muted-foreground">더 나은 표현과 논리 전개 방법</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">예상 점수</span>
                  <span className="text-2xl font-bold text-primary">17.5/20</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>논리성</span>
                    <span className="text-primary">9/10</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: "90%" }}></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>창의성</span>
                    <span className="text-secondary">8/10</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-secondary h-2 rounded-full" style={{ width: "80%" }}></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>표현력</span>
                    <span className="text-accent">7.5/10</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-accent h-2 rounded-full" style={{ width: "75%" }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">합리적인 가격으로 시작하세요</h2>
            <p className="text-xl text-muted-foreground">무료 크레딧으로 먼저 체험해보고, 필요한 만큼만 구매하세요</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Free Plan */}
            <Card className="border-border relative">
              <CardHeader>
                <Badge variant="secondary" className="w-fit">
                  무료 체험
                </Badge>
                <CardTitle className="text-2xl">무료 플랜</CardTitle>
                <CardDescription>회원가입 시 즉시 지급</CardDescription>
                <div className="text-3xl font-bold text-foreground">
                  10 <span className="text-lg font-normal text-muted-foreground">크레딧</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    <span className="text-sm">10회 논술 분석</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    <span className="text-sm">기본 피드백 제공</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    <span className="text-sm">분석 히스토리 저장</span>
                  </li>
                </ul>
                <Button className="w-full mt-6" asChild>
                  <Link href="/dashboard">무료로 시작하기</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Basic Plan */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-2xl">기본 패키지</CardTitle>
                <CardDescription>가장 인기있는 선택</CardDescription>
                <div className="text-3xl font-bold text-foreground">
                  5,000<span className="text-lg font-normal text-muted-foreground">원</span>
                </div>
                <p className="text-sm text-muted-foreground">10 크레딧 (500원/회)</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    <span className="text-sm">10회 논술 분석</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    <span className="text-sm">상세 피드백 제공</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    <span className="text-sm">모범 답안 제안</span>
                  </li>
                </ul>
                <Button className="w-full mt-6 bg-transparent" variant="outline" asChild>
                  <Link href="/dashboard/credits">크레딧 구매하기</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Premium Plan */}
            <Card className="border-primary relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground">10% 할인</Badge>
              </div>
              <CardHeader>
                <CardTitle className="text-2xl">프리미엄 패키지</CardTitle>
                <CardDescription>집중 학습을 위한 최고의 선택</CardDescription>
                <div className="text-3xl font-bold text-foreground">
                  9,000<span className="text-lg font-normal text-muted-foreground">원</span>
                </div>
                <p className="text-sm text-muted-foreground">20 크레딧 (450원/회)</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    <span className="text-sm">20회 논술 분석</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    <span className="text-sm">프리미엄 피드백</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    <span className="text-sm">개선 방안 상세 제공</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Star className="w-4 h-4 text-secondary" />
                    <span className="text-sm font-medium">10% 할인 혜택</span>
                  </li>
                </ul>
                <Button className="w-full mt-6" asChild>
                  <Link href="/dashboard/credits">크레딧 구매하기</Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="mt-12 text-center">
            <p className="text-sm text-muted-foreground">
              크레딧 소진 시 서비스 이용이 불가능합니다. 추가 크레딧은 언제든 구매 가능합니다.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <div className="text-3xl font-bold text-foreground mb-2">1,000+</div>
              <p className="text-muted-foreground">활성 사용자</p>
            </div>
            <div>
              <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-secondary" />
              </div>
              <div className="text-3xl font-bold text-foreground mb-2">10,000+</div>
              <p className="text-muted-foreground">분석 완료</p>
            </div>
            <div>
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-accent" />
              </div>
              <div className="text-3xl font-bold text-foreground mb-2">30초</div>
              <p className="text-muted-foreground">평균 분석 시간</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-2xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">지금 바로 시작해보세요</h2>
          <p className="text-xl text-muted-foreground mb-8">
            무료 크레딧 10개로 AI 논술 분석을 체험해보고, 합격에 한 걸음 더 가까워지세요.
          </p>
          <Button size="lg" className="text-lg px-8" asChild>
            <Link href="/dashboard">무료 크레딧 받고 시작하기</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold text-foreground">교직논술 AI</span>
              </div>
              <p className="text-sm text-muted-foreground">
                AI 기반 초등 교직논술 분석 플랫폼으로 합격을 위한 최고의 파트너입니다.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">서비스</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/dashboard?tab=analysis" className="hover:text-foreground transition-colors">
                    논술 분석
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard?tab=analysis" className="hover:text-foreground transition-colors">
                    피드백 제공
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard?tab=history" className="hover:text-foreground transition-colors">
                    히스토리 관리
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">지원</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    문의하기
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    사용 가이드
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">법적 고지</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    서비스 이용약관
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    개인정보처리방침
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2025 교직논술 AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
