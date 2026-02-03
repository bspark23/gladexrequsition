'use client'

import { useAuth } from '@/lib/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { User, Building2, Mail, Calendar, Shield } from 'lucide-react'

export default function SettingsPage() {
  const { currentUser } = useAuth()

  if (!currentUser) return null

  return (
    <div className="p-4 lg:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">
          View your account information and system settings
        </p>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Information
            </CardTitle>
            <CardDescription>
              Your account details and department information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
              <div className="h-16 w-16 rounded-full bg-[oklch(0.35_0.12_250)] flex items-center justify-center text-white font-bold text-xl">
                {currentUser?.name ? currentUser.name.split(' ').map(n => n[0]).join('').substring(0, 2) : '??'}
              </div>
              <div>
                <h3 className="font-bold text-lg">{currentUser?.name || 'Loading...'}</h3>
                <p className="text-muted-foreground">{currentUser?.department || 'Loading...'}</p>
                <Badge variant="outline" className="mt-1">
                  {currentUser.role === 'md' ? 'Managing Director' : 'Staff'}
                </Badge>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{currentUser.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <Building2 className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Department</p>
                  <p className="font-medium">{currentUser.department}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Member Since</p>
                  <p className="font-medium">
                    {new Date(currentUser.createdAt).toLocaleDateString('en-NG', { dateStyle: 'long' })}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Permissions Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Permissions
            </CardTitle>
            <CardDescription>
              Your access levels within the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <span className="text-sm">Create Requisitions</span>
                <Badge className="bg-emerald-500 text-white">Allowed</Badge>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <span className="text-sm">View All Requisitions</span>
                <Badge className="bg-emerald-500 text-white">Allowed</Badge>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <span className="text-sm">Approve Procurement</span>
                <Badge
                  className={
                    currentUser.department === 'Procurement'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-muted text-muted-foreground'
                  }
                >
                  {currentUser.department === 'Procurement' ? 'Allowed' : 'Not Allowed'}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <span className="text-sm">Approve Account</span>
                <Badge
                  className={
                    currentUser.department === 'Accounts'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-muted text-muted-foreground'
                  }
                >
                  {currentUser.department === 'Accounts' ? 'Allowed' : 'Not Allowed'}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <span className="text-sm">Download PDFs</span>
                <Badge className="bg-emerald-500 text-white">Allowed</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Info */}
        <Card>
          <CardHeader>
            <CardTitle>System Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">System</p>
                <p className="font-medium">Gladex RMS v1.0</p>
              </div>
              <div>
                <p className="text-muted-foreground">Company</p>
                <p className="font-medium">Gladex Dynamic Resources Ltd</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
