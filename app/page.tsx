'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, BarChart3, CheckCircle, Upload } from 'lucide-react'
import { Header } from '@/components/layout/Header'

export default function HomePage() {
  const [showHeader, setShowHeader] = useState(false)

  useEffect(() => {
    // 컴포넌트가 마운트된 후 Header 표시
    setShowHeader(true)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - 마운트된 후에만 표시 */}
      {showHeader && <Header />}

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            AI로 완성하는 당신의 교직논술
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            사진만 찍어 올리면 AI가 채점부터 개선점까지 한번에 분석해 드립니다. 
            초등 교원 임용시험 준비를 더 효율적으로 시작하세요.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8" asChild>
              <Link href="/auth">무료로 시작하기</Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8" asChild>
              <Link href="/dashboard">데모 보기</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              왜 교직논술 AI를 선택해야 할까요?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              전문적인 AI 분석으로 논술 실력을 체계적으로 향상시킬 수 있습니다.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Upload className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle>간편한 업로드</CardTitle>
                <CardDescription>
                  문제지와 답안을 사진으로 찍어 업로드하면 OCR로 자동 텍스트 변환
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle>정확한 분석</CardTitle>
                <CardDescription>
                  AI가 논리성, 창의성, 표현력을 종합적으로 분석하여 예상 점수 제공
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <CheckCircle className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle>맞춤형 피드백</CardTitle>
                <CardDescription>
                  강점과 약점을 구체적으로 분석하고 개선 방안까지 제시
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            지금 바로 시작해보세요
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            무료 계정으로 AI 논술 분석을 체험해보고, 합격에 한 걸음 더 가까워지세요.
          </p>
          <Button size="lg" className="text-lg px-8" asChild>
            <Link href="/auth">무료로 시작하기</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
