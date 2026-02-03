'use client'

import { useData } from '@/lib/data-context'
import { DashboardOverview } from '@/components/dashboard/dashboard-overview'
import { RequisitionForm } from '@/components/dashboard/requisition-form'
import { Badge } from '@/components/ui/badge'
import { Crown } from 'lucide-react'

export default function MDDashboardPage() {
  const { currentUser } = useData()

  return (
    <div className="p-4 lg:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-foreground">Executive Dashboard</h1>
            <Badge className="bg-[oklch(0.65_0.18_45)] text-white">
              <Crown className="h-3 w-3 mr-1" />
              MD
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Welcome back, {currentUser?.name}
          </p>
        </div>
        <RequisitionForm />
      </div>

      <DashboardOverview showExecutiveMetrics />
    </div>
  )
}
