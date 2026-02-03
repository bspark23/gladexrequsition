'use client'

import { useMemo } from 'react'
import { useData } from '@/lib/data-context'
import { RequisitionTable } from '@/components/dashboard/requisition-table'
import { RequisitionForm } from '@/components/dashboard/requisition-form'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle } from 'lucide-react'

export default function MDApprovedRequisitionsPage() {
  const { requisitions } = useData()

  const approvedRequisitions = useMemo(() => {
    return requisitions.filter(req => req.status === 'Approved')
  }, [requisitions])

  return (
    <div className="p-4 lg:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Approved Requisitions</h1>
          <p className="text-muted-foreground">
            Fully approved requisitions ready for processing
          </p>
        </div>
        <RequisitionForm />
      </div>

      {/* Success Card */}
      <Card className="mb-6 border-emerald-500/30 bg-emerald-500/5">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-foreground">Approved Requisitions</p>
              <p className="text-sm text-muted-foreground">
                These requisitions have been fully approved and are ready for processing.
                You can still delete any requisition if needed.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="flex items-center gap-4 mb-6">
        <div className="px-4 py-2 bg-emerald-500/10 rounded-lg">
          <span className="text-sm text-muted-foreground">Total Approved: </span>
          <span className="font-bold text-emerald-600">{approvedRequisitions.length}</span>
        </div>
        <div className="px-4 py-2 bg-muted rounded-lg">
          <span className="text-sm text-muted-foreground">Total Value: </span>
          <span className="font-bold">
            {approvedRequisitions
              .reduce((sum, r) => sum + r.totalAmount, 0)
              .toLocaleString('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 })}
          </span>
        </div>
      </div>

      <RequisitionTable
        requisitions={approvedRequisitions}
        showDeleteAction
        emptyMessage="No approved requisitions yet"
      />
    </div>
  )
}
