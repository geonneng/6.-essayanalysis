"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, CreditCard, History, Star, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function CreditsPage() {
  const [currentCredits] = useState(25)
  const [purchaseHistory] = useState([
    { id: 1, date: "2025-01-15", amount: 20, price: 9000, type: "프리미엄 패키지" },
    { id: 2, date: "2025-01-10", amount: 10, price: 5000, type: "기본 패키지" },
    { id: 3, date: "2025-01-05", amount: 10, price: 0, type: "무료 크레딧" },
  ])

  const handlePurchase = (packageType: string) => {
    alert(`${packageType} 구매 기능은 준비 중입니다.`)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="w-full px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">교직논술 AI</span>
            </Link>
            <Badge variant="outline">크레딧 관리</Badge>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">보유 크레딧:</span>
              <Badge variant="secondary" className="text-lg px-3 py-1">
                {currentCredits}
              </Badge>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="w-4 h-4 mr-2" />
                대시보드로
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Current Credits Status */}
        <div className="mb-8">
          <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="w-6 h-6 text-primary" />
                <span>현재 보유 크레딧</span>
              </CardTitle>
              <CardDescription>논술 분석 1회당 1크레딧이 소모됩니다</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-primary mb-2">{currentCredits} 크레딧</div>
              <p className="text-muted-foreground">약 {currentCredits}회의 논술 분석이 가능합니다</p>
            </CardContent>
          </Card>
        </div>

        {/* Purchase Packages */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">크레딧 구매</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Basic Package */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-xl">기본 패키지</CardTitle>
                <CardDescription>가장 인기있는 선택</CardDescription>
                <div className="text-3xl font-bold text-foreground">
                  5,000<span className="text-lg font-normal text-muted-foreground">원</span>
                </div>
                <p className="text-sm text-muted-foreground">10 크레딧 (500원/회)</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
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
                <Button
                  className="w-full bg-transparent"
                  variant="outline"
                  onClick={() => handlePurchase("기본 패키지")}
                >
                  구매하기
                </Button>
              </CardContent>
            </Card>

            {/* Premium Package */}
            <Card className="border-primary relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground">10% 할인</Badge>
              </div>
              <CardHeader>
                <CardTitle className="text-xl">프리미엄 패키지</CardTitle>
                <CardDescription>집중 학습을 위한 최고의 선택</CardDescription>
                <div className="text-3xl font-bold text-foreground">
                  9,000<span className="text-lg font-normal text-muted-foreground">원</span>
                </div>
                <p className="text-sm text-muted-foreground">20 크레딧 (450원/회)</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
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
                <Button className="w-full" onClick={() => handlePurchase("프리미엄 패키지")}>
                  구매하기
                </Button>
              </CardContent>
            </Card>

            {/* Enterprise Package */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-xl">대용량 패키지</CardTitle>
                <CardDescription>집중 준비생을 위한 특별 혜택</CardDescription>
                <div className="text-3xl font-bold text-foreground">
                  20,000<span className="text-lg font-normal text-muted-foreground">원</span>
                </div>
                <p className="text-sm text-muted-foreground">50 크레딧 (400원/회)</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    <span className="text-sm">50회 논술 분석</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    <span className="text-sm">프리미엄 피드백</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    <span className="text-sm">우선 분석 처리</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Star className="w-4 h-4 text-secondary" />
                    <span className="text-sm font-medium">20% 할인 혜택</span>
                  </li>
                </ul>
                <Button
                  className="w-full bg-transparent"
                  variant="outline"
                  onClick={() => handlePurchase("대용량 패키지")}
                >
                  구매하기
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Purchase History */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center space-x-2">
            <History className="w-6 h-6" />
            <span>구매 내역</span>
          </h2>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-border">
                    <tr>
                      <th className="text-left p-4 font-medium text-muted-foreground">날짜</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">패키지</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">크레딧</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">결제 금액</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchaseHistory.map((item) => (
                      <tr key={item.id} className="border-b border-border last:border-b-0">
                        <td className="p-4 text-sm">{item.date}</td>
                        <td className="p-4">
                          <Badge variant={item.price === 0 ? "secondary" : "outline"}>{item.type}</Badge>
                        </td>
                        <td className="p-4 text-sm font-medium">+{item.amount} 크레딧</td>
                        <td className="p-4 text-sm">
                          {item.price === 0 ? (
                            <span className="text-green-600 font-medium">무료</span>
                          ) : (
                            `${item.price.toLocaleString()}원`
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
