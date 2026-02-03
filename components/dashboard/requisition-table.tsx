'use client'

import { useState } from 'react'
import { useData } from '@/lib/data-context'
import { generateRequisitionPDF } from '@/lib/pdf-generator'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Eye, Download, CheckCircle, MoreHorizontal, Trash2, FileText } from 'lucide-react'
import { toast } from 'sonner'
import type { Requisition, RequisitionStatus } from '@/lib/types'

interface RequisitionTableProps {
  requisitions: Requisition[]
  showApprovalActions?: boolean
  approvalType?: 'procurement' | 'account'
  showDeleteAction?: boolean
  emptyMessage?: string
}

export function RequisitionTable({
  requisitions,
  showApprovalActions = false,
  approvalType,
  showDeleteAction = false,
  emptyMessage = 'No requisitions found',
}: RequisitionTableProps) {
  const {
    currentUser,
    canApproveProcurement,
    canApproveAccount,
    approveAsProcurement,
    approveAsAccount,
    deleteRequisition,
  } = useData()

  const [selectedRequisition, setSelectedRequisition] = useState<Requisition | null>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [approveDialogOpen, setApproveDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const canApprove = approvalType === 'procurement'
    ? canApproveProcurement(currentUser)
    : approvalType === 'account'
    ? canApproveAccount(currentUser)
    : false

  console.log('RequisitionTable canApprove:', { 
    approvalType, 
    currentUser: currentUser ? {
      id: currentUser.id,
      name: currentUser.name,
      role: currentUser.role,
      department: currentUser.department
    } : null, 
    canApprove,
    showApprovalActions,
    canApproveProcurement: canApproveProcurement(currentUser),
    canApproveAccount: canApproveAccount(currentUser)
  })

  const getStatusBadge = (status: RequisitionStatus) => {
    switch (status) {
      case 'Pending Procurement':
        return <Badge className="bg-[oklch(0.65_0.18_45)] text-white hover:bg-[oklch(0.6_0.18_45)]">Pending Procurement</Badge>
      case 'Pending Account':
        return <Badge className="bg-[oklch(0.55_0.15_220)] text-white hover:bg-[oklch(0.5_0.15_220)]">Pending Account</Badge>
      case 'Approved':
        return <Badge className="bg-emerald-500 text-white hover:bg-emerald-600">Approved</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const handleView = (requisition: Requisition) => {
    setSelectedRequisition(requisition)
    setViewDialogOpen(true)
  }

  const handleDownload = (requisition: Requisition) => {
    generateRequisitionPDF(requisition)
    toast.success(`Downloading PDF for ${requisition.requisitionNumber}`)
  }

  const handleApproveClick = (requisition: Requisition) => {
    setSelectedRequisition(requisition)
    setApproveDialogOpen(true)
  }

  const handleApprove = async () => {
    if (!selectedRequisition || !currentUser) return

    try {
      if (approvalType === 'procurement') {
        await approveAsProcurement(selectedRequisition.id, currentUser.id, currentUser.name || 'Unknown User')
        toast.success(`Procurement approved for ${selectedRequisition.requisitionNumber}`)
      } else if (approvalType === 'account') {
        await approveAsAccount(selectedRequisition.id, currentUser.id, currentUser.name || 'Unknown User')
        toast.success(`Account approved for ${selectedRequisition.requisitionNumber}`)
      }

      setApproveDialogOpen(false)
      setSelectedRequisition(null)
    } catch (error) {
      console.error('Error approving requisition:', error)
      toast.error('Failed to approve requisition. Please try again.')
    }
  }

  const handleDeleteClick = (requisition: Requisition) => {
    setSelectedRequisition(requisition)
    setDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!selectedRequisition) return
    
    try {
      await deleteRequisition(selectedRequisition.id)
      toast.success(`Deleted requisition ${selectedRequisition.requisitionNumber}`)
      setDeleteDialogOpen(false)
      setSelectedRequisition(null)
    } catch (error) {
      console.error('Error deleting requisition:', error)
      toast.error('Failed to delete requisition. Please try again.')
    }
  }

  if (requisitions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Requisition ID</TableHead>
              <TableHead className="hidden md:table-cell">Requester</TableHead>
              <TableHead className="hidden lg:table-cell">Department</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden sm:table-cell">Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requisitions.map(requisition => (
              <TableRow key={requisition.id}>
                <TableCell className="font-medium">{requisition.requisitionNumber || 'N/A'}</TableCell>
                <TableCell className="hidden md:table-cell">{requisition.requesterName || 'Unknown'}</TableCell>
                <TableCell className="hidden lg:table-cell text-muted-foreground">
                  {requisition.requesterDepartment || 'Unknown'}
                </TableCell>
                <TableCell className="font-medium">
                  {(requisition.totalAmount || 0).toLocaleString('en-NG', {
                    style: 'currency',
                    currency: 'NGN',
                    minimumFractionDigits: 0,
                  })}
                </TableCell>
                <TableCell>{getStatusBadge(requisition.status)}</TableCell>
                <TableCell className="hidden sm:table-cell text-muted-foreground">
                  {requisition.createdAt ? new Date(requisition.createdAt).toLocaleDateString('en-NG') : 'N/A'}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleView(requisition)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDownload(requisition)}>
                        <Download className="h-4 w-4 mr-2" />
                        Download PDF
                      </DropdownMenuItem>
                      {showApprovalActions && canApprove && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleApproveClick(requisition)}
                            className="text-emerald-600"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            {approvalType === 'procurement' ? 'Approve Procurement' : 'Approve Account'}
                          </DropdownMenuItem>
                        </>
                      )}
                      {showDeleteAction && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDeleteClick(requisition)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Requisition Details</DialogTitle>
            <DialogDescription>
              {selectedRequisition?.requisitionNumber}
            </DialogDescription>
          </DialogHeader>
          {selectedRequisition && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <div>{getStatusBadge(selectedRequisition.status)}</div>
                </div>
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground">Total Amount</span>
                  <p className="font-bold text-lg">
                    {(selectedRequisition.totalAmount || 0).toLocaleString('en-NG', {
                      style: 'currency',
                      currency: 'NGN',
                    })}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground">Requester</span>
                  <p className="font-medium">{selectedRequisition.requesterName}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground">Department</span>
                  <p className="font-medium">{selectedRequisition.requesterDepartment}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground">Created</span>
                  <p className="font-medium">
                    {selectedRequisition.createdAt ? new Date(selectedRequisition.createdAt).toLocaleDateString('en-NG', { dateStyle: 'long' }) : 'Unknown'}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground">Last Updated</span>
                  <p className="font-medium">
                    {selectedRequisition.updatedAt ? new Date(selectedRequisition.updatedAt).toLocaleDateString('en-NG', { dateStyle: 'long' }) : 'Unknown'}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-sm text-muted-foreground">Purpose</span>
                <p className="p-3 bg-muted rounded-lg">{selectedRequisition.purpose}</p>
              </div>

              <div className="space-y-2">
                <span className="text-sm text-muted-foreground">Items</span>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-center">Qty</TableHead>
                        <TableHead className="text-right">Unit Price</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(selectedRequisition.items || []).map(item => (
                        <TableRow key={item.id || Math.random()}>
                          <TableCell>{item.description || 'N/A'}</TableCell>
                          <TableCell className="text-center">{item.quantity || 0}</TableCell>
                          <TableCell className="text-right">
                            {(item.unitPrice || 0).toLocaleString('en-NG', {
                              style: 'currency',
                              currency: 'NGN',
                            })}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {(item.totalPrice || 0).toLocaleString('en-NG', {
                              style: 'currency',
                              currency: 'NGN',
                            })}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Procurement Approval</h4>
                  {selectedRequisition.procurementApprovedBy ? (
                    <div>
                      <p className="font-medium text-emerald-600">Approved</p>
                      <p className="text-sm text-muted-foreground">By: {selectedRequisition.procurementApprovedBy}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(selectedRequisition.procurementApprovedAt!).toLocaleDateString('en-NG')}
                      </p>
                    </div>
                  ) : (
                    <p className="text-[oklch(0.65_0.18_45)] font-medium">Pending</p>
                  )}
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Account Approval</h4>
                  {selectedRequisition.accountApprovedBy ? (
                    <div>
                      <p className="font-medium text-emerald-600">Approved</p>
                      <p className="text-sm text-muted-foreground">By: {selectedRequisition.accountApprovedBy || 'Unknown'}</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedRequisition.accountApprovedAt ? new Date(selectedRequisition.accountApprovedAt).toLocaleDateString('en-NG') : 'N/A'}
                      </p>
                    </div>
                  ) : (
                    <p className="text-[oklch(0.55_0.15_220)] font-medium">Pending</p>
                  )}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              Close
            </Button>
            <Button onClick={() => selectedRequisition && handleDownload(selectedRequisition)}>
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve Dialog */}
      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {approvalType === 'procurement' ? 'Approve Procurement' : 'Approve Account'}
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to approve {selectedRequisition?.requisitionNumber}?
              {approvalType === 'procurement'
                ? ' This will move the requisition to Pending Account status.'
                : ' This will mark the requisition as fully Approved.'}
            </DialogDescription>
          </DialogHeader>
          {selectedRequisition && (
            <div className="p-4 bg-muted rounded-lg">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Requester:</span>
                  <p className="font-medium">{selectedRequisition.requesterName}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Amount:</span>
                  <p className="font-medium">
                    {(selectedRequisition.totalAmount || 0).toLocaleString('en-NG', {
                      style: 'currency',
                      currency: 'NGN',
                    })}
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleApprove} className="bg-emerald-500 hover:bg-emerald-600 text-white">
              <CheckCircle className="h-4 w-4 mr-2" />
              Confirm Approval
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Requisition</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedRequisition?.requisitionNumber}?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleDelete} variant="destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
