'use client'

import React from "react"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useData } from '@/lib/data-context'
import { useAuth } from '@/lib/auth-context'
import { Sidebar } from '@/components/dashboard/sidebar'

export default function StaffLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { currentUser } = useData()
  const { isLoading } = useAuth()
  const [hasRedirected, setHasRedirected] = useState(false)

  useEffect(() => {
    // TEMPORARILY DISABLE ALL REDIRECTS TO STOP THE LOOP
    console.log('StaffLayout - User check (redirects disabled):', {
      currentUser: currentUser ? {
        id: currentUser.id,
        role: currentUser.role,
        email: currentUser.email,
        department: currentUser.department
      } : null,
      isLoading,
      hasRedirected
    })
    
    // TODO: Re-enable redirects after debugging
    /*
    if (!currentUser) {
      console.log('StaffLayout - No user, redirecting to home')
      setHasRedirected(true)
      router.replace('/')
    } else if (currentUser.role === 'md') {
      console.log('StaffLayout - MD user detected, redirecting to MD dashboard. Role:', currentUser.role)
      setHasRedirected(true)
      router.replace('/md/dashboard')
    } else {
      console.log('StaffLayout - Staff user confirmed, staying on staff dashboard. Role:', currentUser.role)
    }
    */
  }, [currentUser, isLoading, router, hasRedirected])

  // Show loading while checking authentication
  if (isLoading) {
    console.log('StaffLayout - Still loading auth...')
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  // Show loading while redirecting
  if (!currentUser) {
    console.log('StaffLayout - No current user, showing loading...')
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (currentUser.role === 'md') {
    console.log('StaffLayout - MD user, showing loading while redirecting...')
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  console.log('StaffLayout - Rendering staff layout for user:', currentUser.role)

  return (
    <div className="min-h-screen bg-background">
      <Sidebar type="staff" />
      <main className="lg:pl-64">
        <div className="pt-16 lg:pt-0">
          {children}
        </div>
      </main>
    </div>
  )
}
