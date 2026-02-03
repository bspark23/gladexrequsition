'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { ArrowRight, CheckCircle2, FileText, Shield, Users } from 'lucide-react'

// Splash Screen Component
function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true)
      setTimeout(onComplete, 500)
    }, 2000)

    return () => clearTimeout(timer)
  }, [onComplete])

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-[#1a365d] via-[#2c5282] to-[#1a365d] transition-opacity duration-500 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="flex flex-col items-center animate-in fade-in zoom-in duration-700">
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-white/20 rounded-2xl blur-xl scale-110" />
          <img
            src="/images/gladex-logo.jpg"
            alt="Gladex Dynamic Resources Limited"
            className="relative h-32 w-auto rounded-xl bg-white p-3 shadow-2xl"
          />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2 text-center tracking-tight">
          Gladex Dynamic Resources
        </h1>
        <p className="text-lg text-blue-200 text-center">
          Requisition Management System
        </p>
        <div className="mt-8 flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-orange-400 animate-pulse" />
          <div className="h-2 w-2 rounded-full bg-orange-400 animate-pulse delay-150" style={{ animationDelay: '150ms' }} />
          <div className="h-2 w-2 rounded-full bg-orange-400 animate-pulse delay-300" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  )
}

// Landing Page Component
function LandingPage() {
  const router = useRouter()
  const { isAuthenticated, currentUser, isLoading } = useAuth()
  const [hasRedirected, setHasRedirected] = useState(false)

  useEffect(() => {
    // TEMPORARILY DISABLE ALL REDIRECTS TO STOP THE LOOP
    console.log('LandingPage - User check (redirects disabled):', {
      isAuthenticated,
      currentUser: currentUser ? {
        role: currentUser.role,
        email: currentUser.email,
        department: currentUser.department
      } : null,
      isLoading,
      hasRedirected
    })
    
    // TODO: Re-enable redirects after debugging
    /*
    if (isAuthenticated && currentUser) {
      console.log('LandingPage - Redirecting authenticated user:')
      console.log('  - Role:', currentUser.role)
      console.log('  - Email:', currentUser.email)
      console.log('  - Department:', currentUser.department)
      console.log('  - Role type:', typeof currentUser.role)
      console.log('  - Role === "md":', currentUser.role === 'md')
      
      setHasRedirected(true)
      const targetPath = currentUser.role === 'md' ? '/md/dashboard' : '/staff/dashboard'
      console.log('  - Target path:', targetPath)
      router.replace(targetPath)
    }
    */
  }, [isAuthenticated, currentUser, isLoading, router, hasRedirected])

  // Don't render anything if we're redirecting
  if (isAuthenticated && currentUser && !isLoading) {
    console.log('LandingPage - User is authenticated, showing loading while redirecting')
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <span className="ml-2">Redirecting...</span>
      </div>
    )
  }

  const features = [
    {
      icon: FileText,
      title: 'Streamlined Requisitions',
      description: 'Create and submit requisitions with ease, track status in real-time',
    },
    {
      icon: Shield,
      title: 'Multi-Stage Approval',
      description: 'Procurement and Account approval workflow ensures proper authorization',
    },
    {
      icon: Users,
      title: 'Department Management',
      description: 'Organized by departments with role-based access control',
    },
    {
      icon: CheckCircle2,
      title: 'Complete Audit Trail',
      description: 'Full activity logging and PDF generation for documentation',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <img
                src="/images/gladex-logo.jpg"
                alt="Gladex"
                className="h-10 w-auto rounded-lg"
              />
              <div className="hidden sm:block">
                <p className="font-semibold text-foreground text-sm">Gladex Dynamic Resources</p>
                <p className="text-xs text-muted-foreground">Requisition System</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                onClick={() => router.push('/auth/staff/login')}
                className="text-muted-foreground hover:text-foreground"
              >
                Sign In
              </Button>
              <Button
                onClick={() => router.push('/auth/staff/signup')}
                className="bg-[#1a365d] hover:bg-[#2c5282] text-white"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 text-orange-700 text-sm font-medium">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500" />
                </span>
                Enterprise Solution
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight text-balance">
                Company-Wide{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1a365d] to-[#4299e1]">
                  Requisition
                </span>{' '}
                & Approval System
              </h1>
              
              <p className="text-lg text-muted-foreground leading-relaxed max-w-xl text-pretty">
                Streamline your procurement process with our comprehensive requisition management system. 
                From request to approval, track every step with complete transparency and efficiency.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  onClick={() => router.push('/auth/staff/signup')}
                  className="bg-gradient-to-r from-[#1a365d] to-[#2c5282] hover:from-[#2c5282] hover:to-[#1a365d] text-white shadow-lg shadow-blue-900/25 h-12 px-8"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => router.push('/auth/staff/login')}
                  className="h-12 px-8 border-2"
                >
                  Sign In to Account
                </Button>
              </div>

              <div className="flex items-center gap-6 pt-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-white flex items-center justify-center text-white text-xs font-medium"
                    >
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">13 Departments</span> connected
                </p>
              </div>
            </div>

            <div className="relative hidden lg:block">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400/20 to-blue-400/20 rounded-3xl blur-3xl" />
              <div className="relative bg-card rounded-2xl shadow-2xl border border-border/50 p-6 space-y-4">
                <div className="flex items-center justify-between pb-4 border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#1a365d] to-[#4299e1] flex items-center justify-center">
                      <FileText className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Requisition Dashboard</p>
                      <p className="text-xs text-muted-foreground">Real-time overview</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                    Active
                  </span>
                </div>
                
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Pending', value: '12', color: 'bg-orange-100 text-orange-700' },
                    { label: 'Processing', value: '8', color: 'bg-blue-100 text-blue-700' },
                    { label: 'Approved', value: '45', color: 'bg-green-100 text-green-700' },
                  ].map((stat) => (
                    <div key={stat.label} className="text-center p-3 rounded-lg bg-muted/50">
                      <p className={`text-2xl font-bold ${stat.color.split(' ')[1]}`}>{stat.value}</p>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  {[
                    { status: 'Pending Procurement', dept: 'Engineering', amount: '₦450,000' },
                    { status: 'Pending Account', dept: 'Operations', amount: '₦125,000' },
                    { status: 'Approved', dept: 'Maintenance', amount: '₦280,000' },
                  ].map((req, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`h-2 w-2 rounded-full ${
                          req.status === 'Approved' ? 'bg-green-500' : 
                          req.status === 'Pending Account' ? 'bg-blue-500' : 'bg-orange-500'
                        }`} />
                        <div>
                          <p className="text-sm font-medium text-foreground">{req.dept}</p>
                          <p className="text-xs text-muted-foreground">{req.status}</p>
                        </div>
                      </div>
                      <p className="text-sm font-semibold text-foreground">{req.amount}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Everything You Need for Efficient Requisitions
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our system provides all the tools necessary for managing company-wide requisitions 
              from creation to final approval.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-card rounded-xl p-6 shadow-sm border border-border/50 hover:shadow-md hover:border-border transition-all duration-200"
              >
                <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-[#1a365d] to-[#4299e1] flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-[#1a365d] via-[#2c5282] to-[#1a365d] rounded-2xl p-8 sm:p-12 shadow-2xl">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              Ready to Streamline Your Requisitions?
            </h2>
            <p className="text-blue-200 mb-8 max-w-xl mx-auto">
              Join your colleagues in using the most efficient requisition management system 
              designed specifically for Gladex Dynamic Resources.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => router.push('/auth/staff/signup')}
                className="bg-white text-[#1a365d] hover:bg-blue-50 h-12 px-8 font-semibold"
              >
                Create Staff Account
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => router.push('/auth/md')}
                className="border-2 border-white/30 text-white hover:bg-white/10 h-12 px-8 bg-transparent"
              >
                MD Portal
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 lg:px-8 border-t border-border">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src="/images/gladex-logo.jpg"
              alt="Gladex"
              className="h-8 w-auto rounded"
            />
            <p className="text-sm text-muted-foreground">
              Gladex Dynamic Resources Limited
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            Internal Use Only - Requisition Management System
          </p>
        </div>
      </footer>
    </div>
  )
}

export default function Home() {
  const [showSplash, setShowSplash] = useState(true)

  return (
    <>
      {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
      <LandingPage />
    </>
  )
}
