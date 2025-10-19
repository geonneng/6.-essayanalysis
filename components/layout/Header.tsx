'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { FileText, User, LogOut } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

export const Header = () => {
  const { user, loading, signOut } = useAuth()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('로그아웃 실패:', error)
    }
  }

  const getInitials = (email: string) => {
    return email.charAt(0).toUpperCase()
  }

  // 마운트되지 않았거나 로딩 중일 때 기본 UI (하이드레이션 미스매치 방지)
  const showDefaultUI = !mounted || loading

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <span className="text-xl font-bold text-gray-900 cursor-pointer">교직논술 AI</span>
          </Link>
        </div>
        
        <nav className="flex items-center space-x-4">
          {showDefaultUI ? (
            // 초기 로딩 상태 - 항상 로그인 버튼 표시
            <div className="flex items-center space-x-4">
              <Button variant="outline" asChild>
                <Link href="/auth">로그인</Link>
              </Button>
              <Button asChild>
                <Link href="/auth">회원가입</Link>
              </Button>
            </div>
          ) : user ? (
            // 로그인된 사용자
            <div className="flex items-center space-x-4">
              <Button variant="outline" asChild>
                <Link href="/dashboard">대시보드</Link>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-blue-100 text-blue-600 text-sm">
                        {getInitials(user.email)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:inline text-sm">{user.email}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>내 정보</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={handleSignOut}
                    className="flex items-center space-x-2 text-red-600"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>로그아웃</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            // 로그인되지 않은 사용자
            <div className="flex items-center space-x-4">
              <Button variant="outline" asChild>
                <Link href="/auth">로그인</Link>
              </Button>
              <Button asChild>
                <Link href="/auth">회원가입</Link>
              </Button>
            </div>
          )}
        </nav>
      </div>
    </header>
  )
}
