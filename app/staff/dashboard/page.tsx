'use client'

import { useData } from '@/lib/data-context'
import { DashboardOverview } from '@/components/dashboard/dashboard-overview'
import { RequisitionForm } from '@/components/dashboard/requisition-form'

export default function StaffDashboardPage() {
  const { currentUser } = useData()

  return (
    <div className="p-4 lg:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {currentUser?.name}
          </p>
        </div>
        <RequisitionForm />
      </div>

      <DashboardOverview />
    </div>
  )
}
