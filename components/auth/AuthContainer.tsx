'use client'

import { useState } from 'react'
import { LoginForm } from './LoginForm'
import { SignUpForm } from './SignUpForm'

export const AuthContainer = () => {
  const [isLogin, setIsLogin] = useState(true)

  const switchToSignUp = () => setIsLogin(false)
  const switchToLogin = () => setIsLogin(true)

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {isLogin ? (
          <LoginForm onSwitchToSignUp={switchToSignUp} />
        ) : (
          <SignUpForm onSwitchToLogin={switchToLogin} />
        )}
      </div>
    </div>
  )
}
