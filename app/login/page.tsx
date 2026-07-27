'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/context/AuthContext'
import { useLogin } from '@/api/client/auth'
import { Eye, EyeOff } from 'lucide-react'
import Image from 'next/image'

export default function LoginPage() {
  const router = useRouter()
  const { persistLogin } = useAuth()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(false)

  const { login, isPending } = useLogin({
    onSuccess(data) {
      persistLogin(data)
      // is_staff flag determines admin vs restaurant user
      if (data.user.is_staff) {
        router.push('/admin')
      } else {
        router.push('/dashboard')
      }
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim() || !password.trim()) return
    login({ username: username.trim(), password })
  }

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left side illustration */}
      <div className="hidden lg:block w-1/2 relative">
        <Image
          src="/images/login_image.svg"
          alt="Login illustration"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Right form side */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-10 bg-white">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
            <p className="text-gray-500">Sign in to continue to your dashboard.</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Username */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Username <span className="text-sky-600">*</span>
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  autoComplete="username"
                  disabled={isPending}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:border-sky-600 focus:bg-white transition-colors disabled:opacity-60"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Password <span className="text-sky-600">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    disabled={isPending}
                    required
                    className="w-full px-4 py-3 pr-11 border-2 border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:border-sky-600 focus:bg-white transition-colors disabled:opacity-60"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Remember me / Forgot password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 accent-sky-600"
                  />
                  Remember me
                </label>
                <a href="#" className="text-sm text-sky-600 font-medium hover:underline">
                  Forgot Password?
                </a>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isPending || !username.trim() || !password.trim()}
                className="w-full bg-gradient-to-r from-sky-600 to-blue-700 text-white font-bold py-3 rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isPending && (
                  <svg
                    className="w-4 h-4 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12" cy="12" r="10"
                      stroke="currentColor" strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                )}
                {isPending ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <p className="text-center text-xs text-gray-400 mt-6">
              Secure and seamless access to your point of sale system
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
