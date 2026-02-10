'use client'

import { useState, useMemo } from 'react'
import { useData } from '@/lib/data-context'
import { RequisitionTable } from '@/components/dashboard/requisition-table'
import { RequisitionForm } from '@/components/dashboard/requisition-form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Search, Crown } from 'lucide-react'

export default function MDAllRequisitionsPage() {
  const { requisitions } = useData()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const filteredRequisitions = useMemo(() => {
    return requisitions.filter(req => {
      const matchesSearch =
        search === '' ||
        req.requisitionNumber.toLowerCase().includes(search.toLowerCase()) ||
        req.requesterName.toLowerCase().includes(search.toLowerCase()) ||
        req.requesterDepartment.toLowerCase().includes(search.toLowerCase())

      const matchesStatus = statusFilter === 'all' || req.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [requisitions, search, statusFilter])

  // Group requisitions by year
  const requisitionsByYear = useMemo(() => {
    const grouped: { [year: string]: typeof filteredRequisitions } = {}
    
    filteredRequisitions.forEach(req => {
      const year = new Date(req.createdAt).getFullYear().toString()
      if (!grouped[year]) {
        grouped[year] = []
      }
      grouped[year].push(req)
    })
    
    // Sort years in descending order (newest first)
    return Object.keys(grouped)
      .sort((a, b) => parseInt(b) - parseInt(a))
      .map(year => ({
        year,
        requisitions: grouped[year]
      }))
  }, [filteredRequisitions])

  return (
    <div className="p-4 lg:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">All Requisitions</h1>
          <p className="text-muted-foreground">
            View and manage all requisitions in the system
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
              <p className="font-medium text-foreground">Full Administrative Access</p>
              <p className="text-sm text-muted-foreground">
                As Managing Director, you can view, approve (at any stage), and delete any requisition in the system.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search requisitions..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="Pending Procurement">Pending Procurement</SelectItem>
            <SelectItem value="Pending Account">Pending Account</SelectItem>
            <SelectItem value="Approved">Approved</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results count */}
      <p className="text-sm text-muted-foreground mb-4">
        Showing {filteredRequisitions.length} of {requisitions.length} requisitions
      </p>

      {/* Requisitions grouped by year */}
      {requisitionsByYear.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-muted-foreground">No requisitions found matching your search criteria</p>
        </div>
      ) : (
        <div className="space-y-8">
          {requisitionsByYear.map(({ year, requisitions: yearRequisitions }) => (
            <div key={year}>
              {/* Year Label */}
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-foreground">{year}</h2>
                <div className="h-px bg-border mt-2" />
              </div>
              
              {/* Requisitions Table for this year */}
              <RequisitionTable
                requisitions={yearRequisitions}
                showDeleteAction
                emptyMessage={`No requisitions found for ${year}`}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
