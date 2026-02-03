'use client'

import { useState, useMemo } from 'react'
import { useData } from '@/lib/data-context'
import { RequisitionTable } from '@/components/dashboard/requisition-table'
import { RequisitionForm } from '@/components/dashboard/requisition-form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search } from 'lucide-react'

export default function AllRequisitionsPage() {
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

      <RequisitionTable
        requisitions={filteredRequisitions}
        emptyMessage="No requisitions found matching your search criteria"
      />
    </div>
  )
}
