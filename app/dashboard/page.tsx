"use client"

import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { UserProfile } from '@/components/auth/UserProfile'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, FileText, History, BarChart3 } from 'lucide-react'

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto py-8 px-4">
          <div className="mb-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                홈으로 돌아가기
              </Link>
            </Button>
          </div>
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              대시보드
            </h1>
            <p className="text-lg text-gray-600">
              AI 기반 초등 교직논술 분석 및 피드백 서비스에 오신 것을 환영합니다
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-4">사용자 정보</h2>
            <UserProfile />
          </div>

          <div className="mt-8 grid md:grid-cols-2 gap-6">
            <Card className="hover:shadow-md transition-shadow cursor-pointer" asChild>
              <Link href="/essay">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle>논술 분석 시작</CardTitle>
                      <CardDescription>새로운 논술 분석 진행</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    문제와 답안을 업로드하여 AI 분석을 시작하세요
                  </p>
                </CardContent>
              </Link>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer" asChild>
              <Link href="/essay?tab=history">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <History className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <CardTitle>분석 히스토리</CardTitle>
                      <CardDescription>저장된 분석 결과 확인</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    이전에 저장한 분석 결과를 다시 확인하세요
                  </p>
                </CardContent>
              </Link>
            </Card>
          </div>
          
          <div className="mt-8 bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-4">서비스 안내</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  <h3 className="font-medium">논술 분석</h3>
                </div>
                <p className="text-gray-600 text-sm">
                  AI가 초등 교직논술을 분석하고 개선점을 제안합니다.
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <FileText className="w-5 h-5 text-green-600" />
                  <h3 className="font-medium">피드백 제공</h3>
                </div>
                <p className="text-gray-600 text-sm">
                  체계적이고 구체적인 피드백으로 논술 실력을 향상시킵니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
