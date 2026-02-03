'use client'

import React from "react"

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useData } from '@/lib/data-context'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import {
  LayoutDashboard,
  FilePlus,
  FileText,
  Clock,
  Calculator,
  CheckCircle,
  Settings,
  Users,
  BarChart3,
  LogOut,
  Menu,
  ChevronRight,
} from 'lucide-react'

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
}

interface SidebarProps {
  type: 'staff' | 'md'
}

export function Sidebar({ type }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { currentUser } = useData()
  const { requisitions } = useData()
  const { logout, isLoading } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  // Don't render sidebar if user data is still loading
  if (isLoading || !currentUser) {
    return null
  }

  const basePath = type === 'md' ? '/md' : '/staff'

  const pendingProcurement = requisitions.filter(r => r.status === 'Pending Procurement').length
  const pendingAccount = requisitions.filter(r => r.status === 'Pending Account').length
  const approved = requisitions.filter(r => r.status === 'Approved').length

  const staffNavItems: NavItem[] = [
    { label: 'Dashboard', href: `${basePath}/dashboard`, icon: <LayoutDashboard className="h-5 w-5" /> },
    { label: 'New Requisition', href: `${basePath}/new-requisition`, icon: <FilePlus className="h-5 w-5" /> },
    { label: 'All Requisitions', href: `${basePath}/all-requisitions`, icon: <FileText className="h-5 w-5" /> },
    { label: 'Pending Procurement', href: `${basePath}/pending-procurement`, icon: <Clock className="h-5 w-5" /> },
    { label: 'Pending Account', href: `${basePath}/pending-account`, icon: <Calculator className="h-5 w-5" /> },
    { label: 'Approved Requisitions', href: `${basePath}/approved`, icon: <CheckCircle className="h-5 w-5" /> },
    { label: 'Settings', href: `${basePath}/settings`, icon: <Settings className="h-5 w-5" /> },
  ]

  const mdNavItems: NavItem[] = [
    ...staffNavItems.slice(0, -1), // All staff items except Settings
    { label: 'User Management', href: `${basePath}/users`, icon: <Users className="h-5 w-5" /> },
    { label: 'Analytics', href: `${basePath}/analytics`, icon: <BarChart3 className="h-5 w-5" /> },
    { label: 'Settings', href: `${basePath}/settings`, icon: <Settings className="h-5 w-5" /> },
  ]

  const navItems = type === 'md' ? mdNavItems : staffNavItems

  const getBadgeCount = (href: string): number | null => {
    if (href.includes('pending-procurement')) return pendingProcurement || null
    if (href.includes('pending-account')) return pendingAccount || null
    if (href.includes('approved')) return approved || null
    return null
  }

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <img
            src="/images/gladex-logo.jpg"
            alt="Gladex Logo"
            className="h-10 w-10 rounded-md bg-white object-contain"
          />
          <div className="flex flex-col">
            <span className="font-bold text-sm text-sidebar-foreground leading-tight">GLADEX</span>
            <span className="text-xs text-sidebar-foreground/70">Dynamic Resources</span>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-sidebar-primary flex items-center justify-center text-sidebar-primary-foreground font-bold">
            {currentUser?.name ? currentUser.name.split(' ').map(n => n[0]).join('').substring(0, 2) : '??'}
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="font-medium text-sm text-sidebar-foreground truncate">
              {currentUser?.name || 'Loading...'}
            </span>
            <span className="text-xs text-sidebar-foreground/70 truncate">
              {currentUser?.role === 'md' ? 'MD' : (currentUser?.department || 'Loading...')}
            </span>
          </div>
        </div>
        {type === 'md' && (
          <div className="mt-3 px-2 py-1 bg-sidebar-primary/20 rounded text-xs text-sidebar-primary font-medium text-center">
            Managing Director
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map(item => {
            const isActive = pathname === item.href
            const badge = getBadgeCount(item.href)

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                  )}
                >
                  {item.icon}
                  <span className="flex-1">{item.label}</span>
                  {badge && (
                    <span className="px-2 py-0.5 text-xs rounded-full bg-sidebar-primary text-sidebar-primary-foreground">
                      {badge}
                    </span>
                  )}
                  {isActive && <ChevronRight className="h-4 w-4" />}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-sidebar-border">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5" />
          Sign Out
        </Button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-sidebar border-r border-sidebar-border">
        <SidebarContent />
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 h-16 bg-sidebar border-b border-sidebar-border flex items-center px-4">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-sidebar-foreground">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Open menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0 bg-sidebar border-sidebar-border">
            <SidebarContent />
          </SheetContent>
        </Sheet>
        <div className="flex-1 flex items-center justify-center">
          <img
            src="/images/gladex-logo.jpg"
            alt="Gladex Logo"
            className="h-8 w-8 rounded bg-white object-contain"
          />
          <span className="ml-2 font-bold text-sidebar-foreground">GLADEX</span>
        </div>
        <div className="w-10" /> {/* Spacer for centering */}
      </header>
    </>
  )
}
