'use client'

import { useMemo } from 'react'
import { useData } from '@/lib/data-context'
import { RequisitionTable } from '@/components/dashboard/requisition-table'
import { RequisitionForm } from '@/components/dashboard/requisition-form'
import { Card, CardContent } from '@/components/ui/card'
import { Clock, Crown } from 'lucide-react'

export default function MDPendingProcurementPage() {
  const { requisitions } = useData()

  const pendingRequisitions = useMemo(() => {
    return requisitions.filter(req => req.status === 'Pending Procurement')
  }, [requisitions])

  return (
    <div className="p-4 lg:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pending Procurement</h1>
          <p className="text-muted-foreground">
            Requisitions awaiting procurement approval
          </p>
        </div>
        <RequisitionForm />
      </div>

      {/* MD Info Card */}
      <Card className="mb-6 border-[oklch(0.65_0.18_45)]/30 bg-[oklch(0.65_0.18_45)]/5">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Crown className="h-5 w-5 text-[oklch(0.65_0.18_45)] flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-foreground">MD Approval Authority</p>
              <p className="text-sm text-muted-foreground">
                You can approve any requisition at the procurement stage. Click the actions menu to approve.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="flex items-center gap-4 mb-6">
        <div className="px-4 py-2 bg-[oklch(0.65_0.18_45)]/10 rounded-lg">
          <span className="text-sm text-muted-foreground">Total Pending: </span>
          <span className="font-bold text-[oklch(0.65_0.18_45)]">{pendingRequisitions.length}</span>
        </div>
        <div className="px-4 py-2 bg-muted rounded-lg">
          <span className="text-sm text-muted-foreground">Total Value: </span>
          <span className="font-bold">
            {pendingRequisitions
              .reduce((sum, r) => sum + (r.totalAmount || 0), 0)
              .toLocaleString('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 })}
          </span>
        </div>
      </div>

      <RequisitionTable
        requisitions={pendingRequisitions}
        showApprovalActions
        approvalType="procurement"
        showDeleteAction
        emptyMessage="No requisitions pending procurement approval"
      />
    </div>
  )
}
