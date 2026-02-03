'use client'

import React from "react"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useData } from '@/lib/data-context'
import { useAuth } from '@/lib/auth-context'
import { Sidebar } from '@/components/dashboard/sidebar'

export default function MDLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { currentUser } = useData()
  const { isLoading } = useAuth()
  const [hasRedirected, setHasRedirected] = useState(false)

  useEffect(() => {
    // Only redirect once and when not loading
    if (isLoading || hasRedirected) return
    
    console.log('MDLayout - Checking user:', {
      currentUser: currentUser ? {
        id: currentUser.id,
        role: currentUser.role,
        email: currentUser.email,
        department: currentUser.department
      } : null,
      isLoading,
      hasRedirected
    })
    
    if (!currentUser) {
      console.log('MDLayout - No user, redirecting to home')
      setHasRedirected(true)
      router.replace('/')
    } else if (currentUser.role !== 'md') {
      console.log('MDLayout - Non-MD user, redirecting to staff dashboard. Role:', currentUser.role)
      setHasRedirected(true)
      router.replace('/staff/dashboard')
    } else {
      console.log('MDLayout - MD user confirmed, staying on MD dashboard')
    }
  }, [currentUser, isLoading, router, hasRedirected])

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  // Show loading while redirecting
  if (!currentUser || currentUser.role !== 'md') {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar type="md" />
      <main className="lg:pl-64">
        <div className="pt-16 lg:pt-0">
          {children}
        </div>
      </main>
    </div>
  )
}
