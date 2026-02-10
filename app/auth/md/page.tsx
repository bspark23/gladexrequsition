'use client'

import React from "react"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AlertCircle, Eye, EyeOff, ArrowLeft, Loader2, CheckCircle2, Shield, Crown } from 'lucide-react'

export default function MDAuthPage() {
  const router = useRouter()
  const { signupMD, login, checkMDExists } = useAuth()
  
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login')
  const [mdExists, setMdExists] = useState(true)
  
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  })
  
  const [signupData, setSignupData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    accessCode: '',
  })
  
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const exists = checkMDExists()
    setMdExists(exists)
    // Always allow signup, even if MD exists (for backup purposes)
  }, [checkMDExists])

  const validateLoginForm = () => {
    if (!loginData.email.trim()) {
      setError('Email is required')
      return false
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginData.email)) {
      setError('Please enter a valid email address')
      return false
    }
    if (!loginData.password) {
      setError('Password is required')
      return false
    }
    return true
  }

  const validateSignupForm = () => {
    if (!signupData.email.trim()) {
      setError('Email is required')
      return false
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signupData.email)) {
      setError('Please enter a valid email address')
      return false
    }
    if (!signupData.password) {
      setError('Password is required')
      return false
    }
    if (signupData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return false
    }
    if (signupData.password !== signupData.confirmPassword) {
      setError('Passwords do not match')
      return false
    }
    if (!signupData.accessCode.trim()) {
      setError('MD Access Code is required')
      return false
    }
    return true
  }

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')

    if (!validateLoginForm()) return

    setIsLoading(true)

    try {
      const result = await login({
        email: loginData.email.trim(),
        password: loginData.password,
      }, true) // true = MD login

      if (result.success && result.redirectTo) {
        router.push(result.redirectTo)
      } else {
        setError(result.error || 'Login failed. Please check your credentials.')
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')

    if (!validateSignupForm()) return

    setIsLoading(true)

    try {
      const result = await signupMD({
        email: signupData.email.trim(),
        password: signupData.password,
        accessCode: signupData.accessCode.trim(),
      })

      if (result.success) {
        setSuccess(true)
        setTimeout(() => {
          setSuccess(false)
          setActiveTab('login')
          setLoginData({ email: signupData.email, password: '' })
        }, 2000)
      } else {
        setError(result.error || 'Signup failed. Please try again.')
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1a365d] via-[#0f172a] to-[#1a365d] p-4">
        <Card className="w-full max-w-md border-0 shadow-2xl bg-card">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">MD Account Created!</h2>
            <p className="text-muted-foreground text-center mb-4">
              Your Managing Director account has been successfully created. Redirecting to login...
            </p>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Please wait...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Premium Dark Gradient */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#0f172a] via-[#1a365d] to-[#0f172a] p-12 flex-col justify-between relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
        
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-8">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Home</span>
          </Link>
          
          <div className="flex items-center gap-3 mb-8">
            <img
              src="/images/gladex-logo.jpg"
              alt="Gladex Dynamic Resources Limited"
              className="h-14 w-auto rounded-xl bg-white p-2"
            />
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 border border-orange-500/30">
              <Crown className="h-4 w-4 text-orange-400" />
              <span className="text-sm font-medium text-orange-300">Executive Access</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/80 text-sm">
            <Shield className="h-4 w-4" />
            <span>Secure Executive Portal</span>
          </div>
          
          <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
            Managing Director<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-200">
              Access Portal
            </span>
          </h1>
          <p className="text-lg text-white/60 max-w-md leading-relaxed">
            Exclusive access for Gladex Dynamic Resources Limited Managing Director. 
            Full system control and administrative capabilities.
          </p>
          
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-5 max-w-sm border border-white/10">
            <p className="text-sm text-white/80 font-medium mb-3">MD Capabilities</p>
            <ul className="space-y-2 text-sm text-white/60">
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-orange-400" />
                Approve all requisition stages
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-orange-400" />
                Full user management
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-orange-400" />
                Advanced analytics & reporting
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-orange-400" />
                System-wide oversight
              </li>
            </ul>
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-sm text-white/40">
            Gladex Dynamic Resources Limited - Executive Portal
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-background">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8">
            <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Home</span>
            </Link>
            <div className="flex items-center gap-3 mb-4">
              <img
                src="/images/gladex-logo.jpg"
                alt="Gladex"
                className="h-10 w-auto rounded-lg"
              />
              <div>
                <p className="font-semibold text-foreground">Gladex RMS</p>
                <p className="text-xs text-orange-600 font-medium">MD Portal</p>
              </div>
            </div>
          </div>

          <Card className="border-0 shadow-xl bg-card">
            <CardHeader className="space-y-1 pb-4">
              <div className="flex items-center gap-2 mb-2">
                <Crown className="h-5 w-5 text-orange-500" />
                <span className="text-xs font-medium text-orange-600 uppercase tracking-wider">
                  Managing Director Only
                </span>
              </div>
              <CardTitle className="text-2xl font-bold text-foreground">MD Access</CardTitle>
              <CardDescription>
                {mdExists 
                  ? 'Sign in to your Managing Director account or create a new one'
                  : 'Set up the Managing Director account for this system'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v as 'login' | 'signup'); setError('') }}>
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="login">
                    Sign In
                  </TabsTrigger>
                  <TabsTrigger value="signup">
                    Create MD Account
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-4">
                    {error && (
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                        <AlertCircle className="h-4 w-4 flex-shrink-0" />
                        <span>{error}</span>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email Address</Label>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="md@gladexresources.com"
                        value={loginData.email}
                        onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                        disabled={isLoading}
                        className="h-11"
                        autoComplete="email"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="login-password">Password</Label>
                      <div className="relative">
                        <Input
                          id="login-password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Enter your password"
                          value={loginData.password}
                          onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                          disabled={isLoading}
                          className="h-11 pr-10"
                          autoComplete="current-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full h-11 bg-gradient-to-r from-[#1a365d] via-[#2c5282] to-[#1a365d] hover:from-[#2c5282] hover:via-[#1a365d] hover:to-[#2c5282] text-white font-medium"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Signing In...
                        </>
                      ) : (
                        'Sign In as MD'
                      )}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="signup">
                  <form onSubmit={handleSignup} className="space-y-4">
                    {error && (
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                        <AlertCircle className="h-4 w-4 flex-shrink-0" />
                        <span>{error}</span>
                      </div>
                    )}

                    {mdExists && (
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-orange-100 text-orange-700 text-sm mb-4">
                        <Shield className="h-4 w-4 flex-shrink-0" />
                        <span>Note: An MD account already exists. Creating another will replace the existing one.</span>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email Address</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="md@gladexresources.com"
                        value={signupData.email}
                        onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                        disabled={isLoading}
                        className="h-11"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="signup-password">Password</Label>
                        <div className="relative">
                          <Input
                            id="signup-password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Min. 6 chars"
                            value={signupData.password}
                            onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                            disabled={isLoading}
                            className="h-11 pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-confirm">Confirm</Label>
                        <div className="relative">
                          <Input
                            id="signup-confirm"
                            type={showConfirmPassword ? 'text' : 'password'}
                            placeholder="Repeat"
                            value={signupData.confirmPassword}
                            onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                            disabled={isLoading}
                            className="h-11 pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="access-code">MD Access Code</Label>
                      <Input
                        id="access-code"
                        type="password"
                        placeholder="Enter the special MD access code"
                        value={signupData.accessCode}
                        onChange={(e) => setSignupData({ ...signupData, accessCode: e.target.value })}
                        disabled={isLoading}
                        className="h-11"
                      />
                      <p className="text-xs text-muted-foreground">
                        Contact system administrator for the MD access code
                      </p>
                    </div>

                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full h-11 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-500 text-white font-medium"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating MD Account...
                        </>
                      ) : (
                        'Create MD Account'
                      )}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>

              <div className="mt-6 pt-6 border-t border-border">
                <p className="text-sm text-center text-muted-foreground">
                  Staff member?{' '}
                  <Link href="/auth/staff/login" className="font-medium text-primary hover:underline">
                    Go to Staff Portal
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>

          <p className="text-xs text-center text-muted-foreground mt-6">
            This portal is for authorized Managing Director access only.
          </p>
        </div>
      </div>
    </div>
  )
}
