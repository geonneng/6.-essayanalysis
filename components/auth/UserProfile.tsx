'use client'

import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { LogOut, User } from 'lucide-react'
import { toast } from 'sonner'

export const UserProfile = () => {
  const { user, signOut } = useAuth()

  const handleSignOut = async () => {
    try {
      await signOut()
      toast.success('로그아웃되었습니다')
    } catch (error) {
      toast.error('로그아웃에 실패했습니다')
    }
  }

  if (!user) return null

  const getInitials = (email: string) => {
    return email.charAt(0).toUpperCase()
  }

  return (
    <div className="flex items-center space-x-4 p-4 bg-white rounded-lg shadow-sm border">
      <Avatar className="h-10 w-10">
        <AvatarFallback className="bg-primary text-primary-foreground">
          {getInitials(user.email)}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {user.email}
        </p>
        <p className="text-xs text-gray-500">
          가입일: {new Date(user.created_at).toLocaleDateString('ko-KR')}
        </p>
      </div>
      
      <Button
        variant="outline"
        size="sm"
        onClick={handleSignOut}
        className="flex items-center space-x-2"
      >
        <LogOut className="h-4 w-4" />
        <span>로그아웃</span>
      </Button>
    </div>
  )
}
