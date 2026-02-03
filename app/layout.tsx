import React from "react"
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { DataProvider } from '@/lib/data-context'
import { AuthProvider } from '@/lib/auth-context'
import { Toaster } from '@/components/ui/toaster'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Gladex Requisition Management System',
  description: 'Enterprise requisition management system for Gladex Dynamic Resources Limited - Streamline your company-wide requisition and approval processes',
  icons: {
    icon: '/images/gladex-logo.jpg',
  },
  keywords: ['requisition', 'management', 'gladex', 'approval', 'enterprise'],
    generator: 'v0.app'
}

export const viewport: Viewport = {
  themeColor: '#1a365d',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        <AuthProvider>
          <DataProvider>
            {children}
            <Toaster />
          </DataProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
