'use client'

import { useData } from '@/lib/data-context'
import { RequisitionForm } from '@/components/dashboard/requisition-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FilePlus, FileText, ArrowRight, Crown } from 'lucide-react'
import Link from 'next/link'

export default function MDNewRequisitionPage() {
  const { currentUser, requisitions } = useData()

  const userRequisitions = requisitions.filter(r => r.requesterId === currentUser?.id)
  const recentRequisitions = requisitions.slice(0, 5)

  return (
    <div className="p-4 lg:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">New Requisition</h1>
        <p className="text-muted-foreground">
          Create a new requisition request
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form Card */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FilePlus className="h-5 w-5 text-[oklch(0.65_0.18_45)]" />
                Create Requisition
              </CardTitle>
              <CardDescription>
                As Managing Director, you can create requisitions that will follow the standard approval process.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-20 h-20 rounded-full bg-[oklch(0.65_0.18_45)]/10 flex items-center justify-center mb-4">
                  <FilePlus className="h-10 w-10 text-[oklch(0.65_0.18_45)]" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Ready to create a requisition?</h3>
                <p className="text-muted-foreground mb-6 max-w-md">
                  Fill in the requisition details including items, quantities, and prices.
                  You have full approval authority over all requisitions.
                </p>
                <RequisitionForm
                  trigger={
                    <Button size="lg" className="bg-[oklch(0.65_0.18_45)] hover:bg-[oklch(0.6_0.18_45)] text-white">
                      <FilePlus className="h-5 w-5 mr-2" />
                      Open Requisition Form
                    </Button>
                  }
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          {/* MD Powers */}
          <Card className="border-[oklch(0.65_0.18_45)]/30 bg-gradient-to-br from-[oklch(0.65_0.18_45)]/5 to-transparent">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Crown className="h-4 w-4 text-[oklch(0.65_0.18_45)]" />
                MD Privileges
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="text-muted-foreground">As Managing Director, you can:</p>
              <ul className="space-y-1 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Approve as Procurement
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Approve as Accounts
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Delete any requisition
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Manage all users
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Recent System Requisitions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent System Requisitions</CardTitle>
            </CardHeader>
            <CardContent>
              {recentRequisitions.length > 0 ? (
                <div className="space-y-3">
                  {recentRequisitions.map(req => (
                    <div
                      key={req.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{req.requisitionNumber}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {req.requesterName} - {req.status}
                        </p>
                      </div>
                    </div>
                  ))}
                  <Link href="/md/all-requisitions">
                    <Button variant="ghost" size="sm" className="w-full mt-2">
                      View All
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No requisitions yet
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
