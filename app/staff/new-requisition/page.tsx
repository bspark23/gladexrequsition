'use client'

import { useData } from '@/lib/data-context'
import { RequisitionForm } from '@/components/dashboard/requisition-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FilePlus, FileText, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function NewRequisitionPage() {
  const { currentUser, requisitions } = useData()

  const userRequisitions = requisitions.filter(r => r.requesterId === currentUser?.id)
  const recentRequisitions = userRequisitions.slice(0, 3)

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
                Click the button below to open the requisition form and submit your request.
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
                  Your request will be sent to Procurement for approval.
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
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Your Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total Requisitions</span>
                <span className="font-bold">{userRequisitions.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Pending</span>
                <span className="font-bold text-[oklch(0.65_0.18_45)]">
                  {userRequisitions.filter(r => r.status !== 'Approved').length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Approved</span>
                <span className="font-bold text-emerald-500">
                  {userRequisitions.filter(r => r.status === 'Approved').length}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Recent Requisitions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Your Recent Requisitions</CardTitle>
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
                        <p className="text-xs text-muted-foreground">
                          {(req.totalAmount || 0).toLocaleString('en-NG', {
                            style: 'currency',
                            currency: 'NGN',
                            minimumFractionDigits: 0,
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                  <Link href="/staff/all-requisitions">
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

          {/* Process Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Approval Process</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[oklch(0.65_0.18_45)] text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                    1
                  </div>
                  <div>
                    <p className="text-sm font-medium">Submit Request</p>
                    <p className="text-xs text-muted-foreground">Create and submit your requisition</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[oklch(0.55_0.15_220)] text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                    2
                  </div>
                  <div>
                    <p className="text-sm font-medium">Procurement Review</p>
                    <p className="text-xs text-muted-foreground">Procurement department reviews</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                    3
                  </div>
                  <div>
                    <p className="text-sm font-medium">Account Approval</p>
                    <p className="text-xs text-muted-foreground">Final approval by Accounts</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
