'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useData } from '@/lib/data-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from '@/components/ui/sheet'
import { Plus, Minus, FilePlus, Download, Upload, X, CheckCircle, Clock } from 'lucide-react'
import { toast } from 'sonner'
import { generateRequisitionPDF } from '@/lib/pdf-generator'
import type { RequisitionStatus } from '@/lib/types'

interface MaterialItem {
  id: string
  itemNo: number
  description: string
  quantity: number
  unitCost: number
  amount: number
  remarks: string
}

interface ApprovalSignature {
  name: string
  date: string
  signature: string // base64 image
}

interface MaterialRequisitionData {
  id?: string
  docNo: string
  revDate: string
  dateOfRequest: string
  client: string
  requisitionNo: string
  requestedBy: string
  requestedById: string
  department: string
  projectTitle: string
  projectJobNo: string
  currency: 'NGN' | 'USD'
  materials: MaterialItem[]
  total: number
  approvals: {
    requestedBy: ApprovalSignature | null
    reviewedBy: ApprovalSignature | null
    approvedBy: ApprovalSignature | null
  }
  status: 'draft' | 'requested' | 'reviewed' | 'approved'
  createdAt: string
  updatedAt: string
}

interface RequisitionFormProps {
  trigger?: React.ReactNode
  initialData?: MaterialRequisitionData
  readOnly?: boolean
  userRole?: 'staff' | 'procurement' | 'accounts' | 'md'
  onApprovalAction?: (action: 'approve-procurement' | 'approve-account') => Promise<void>
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function RequisitionForm({ 
  trigger, 
  initialData, 
  readOnly = false, 
  userRole = 'staff',
  onApprovalAction,
  open: externalOpen,
  onOpenChange: externalOnOpenChange
}: RequisitionFormProps) {
  const { currentUser, addRequisition, approveAsProcurement, approveAsAccount, updateRequisition, requisitions } = useData()  // Use DataContext for consistency
  
  // Determine user role from current user if not explicitly provided
  const effectiveUserRole = userRole !== 'staff' ? userRole : 
    currentUser?.role === 'md' ? 'md' :
    currentUser?.department === 'Procurement' ? 'procurement' :
    currentUser?.department === 'Accounts' ? 'accounts' :
    'staff'
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isApproving, setIsApproving] = useState(false)

  // Use external control if provided, otherwise use internal state
  const isOpen = externalOpen !== undefined ? externalOpen : open
  const setIsOpen = externalOnOpenChange || setOpen

  // Don't render the form if user is not loaded yet
  if (!currentUser) {
    console.log('RequisitionForm - No current user, showing loading state')
    return (
      <Button disabled className="bg-gray-400">
        <FilePlus className="h-4 w-4 mr-2" />
        Loading...
      </Button>
    )
  }

  // Generate next requisition number for display
  const getNextRequisitionNumber = () => {
    let maxNumber = 0
    
    requisitions.forEach(req => {
      const match = req.requisitionNumber.match(/(\d+)$/)
      if (match) {
        const num = parseInt(match[1], 10)
        if (num > maxNumber) {
          maxNumber = num
        }
      }
    })
    
    const nextNumber = (maxNumber + 1).toString().padStart(2, '0')
    return `GDRL-PL-MRF-${nextNumber}`
  }

  const [formData, setFormData] = useState<MaterialRequisitionData>(() => ({
    docNo: 'GDRL-PL-QF-005',
    revDate: '26.06.2024',
    dateOfRequest: new Date().toISOString().split('T')[0],
    client: '',
    requisitionNo: initialData?.requisitionNo || getNextRequisitionNumber(),
    requestedBy: currentUser?.name || '',
    requestedById: currentUser?.id || '',
    department: currentUser?.department || '',
    projectTitle: '',
    projectJobNo: '',
    currency: 'NGN',
    materials: [
      {
        id: '1',
        itemNo: 1,
        description: '',
        quantity: 0,
        unitCost: 0,
        amount: 0,
        remarks: ''
      }
    ],
    total: 0,
    approvals: {
      requestedBy: null,
      reviewedBy: null,
      approvedBy: null
    },
    status: 'draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...initialData
  }))

  // Debug logging for approval workflow
  useEffect(() => {
    console.log('RequisitionForm - Approval Debug:', {
      currentUser: currentUser ? {
        id: currentUser.id,
        name: currentUser.name,
        role: currentUser.role,
        department: currentUser.department
      } : null,
      userRole,
      effectiveUserRole,
      readOnly,
      initialData: initialData ? {
        id: initialData.id,
        status: initialData.status
      } : null,
      formDataApprovals: formData.approvals
    })
  }, [currentUser, userRole, effectiveUserRole, readOnly, initialData, formData.approvals])

  // Calculate amount for each material item
  const calculateAmount = useCallback((quantity: number, unitCost: number) => {
    return quantity * unitCost
  }, [])

  // Calculate total
  const calculateTotal = useCallback((materials: MaterialItem[]) => {
    return materials.reduce((sum, item) => sum + item.amount, 0)
  }, [])

  // Update material item
  const updateMaterial = (index: number, field: keyof MaterialItem, value: any) => {
    const newMaterials = [...formData.materials]
    newMaterials[index] = { ...newMaterials[index], [field]: value }
    
    // Recalculate amount if quantity or unitCost changed
    if (field === 'quantity' || field === 'unitCost') {
      newMaterials[index].amount = calculateAmount(
        newMaterials[index].quantity,
        newMaterials[index].unitCost
      )
    }
    
    const total = calculateTotal(newMaterials)
    
    setFormData(prev => ({
      ...prev,
      materials: newMaterials,
      total,
      updatedAt: new Date().toISOString()
    }))
  }

  // Add new material row
  const addMaterialRow = () => {
    const newItem: MaterialItem = {
      id: Date.now().toString(),
      itemNo: formData.materials.length + 1,
      description: '',
      quantity: 0,
      unitCost: 0,
      amount: 0,
      remarks: ''
    }
    
    setFormData(prev => ({
      ...prev,
      materials: [...prev.materials, newItem],
      updatedAt: new Date().toISOString()
    }))
  }

  // Remove material row
  const removeMaterialRow = (index: number) => {
    if (formData.materials.length > 1) {
      const newMaterials = formData.materials.filter((_, i) => i !== index)
      // Renumber items
      newMaterials.forEach((item, i) => {
        item.itemNo = i + 1
      })
      
      const total = calculateTotal(newMaterials)
      
      setFormData(prev => ({
        ...prev,
        materials: newMaterials,
        total,
        updatedAt: new Date().toISOString()
      }))
    }
  }

  // Handle signature upload
  const handleSignatureUpload = (approvalType: keyof typeof formData.approvals, file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const signature: ApprovalSignature = {
        name: currentUser?.name || '',
        date: new Date().toLocaleDateString('en-GB'),
        signature: e.target?.result as string
      }
      
      setFormData(prev => ({
        ...prev,
        approvals: {
          ...prev.approvals,
          [approvalType]: signature
        },
        updatedAt: new Date().toISOString()
      }))
    }
    reader.readAsDataURL(file)
  }

  // Currency symbol
  const getCurrencySymbol = () => {
    return formData.currency === 'NGN' ? '₦' : '$'
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return `${getCurrencySymbol()}${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
  }

  // Can edit approval section
  const canEditApproval = (approvalType: keyof typeof formData.approvals) => {
    const canEdit = (() => {
      if (readOnly) return false
      
      switch (approvalType) {
        case 'requestedBy':
          // ANY user can be a requester - Staff, Procurement, Account, or MD
          // They can edit during creation or if MD is editing existing requisition
          return (effectiveUserRole === 'md') || 
                 (!formData.approvals.requestedBy && !initialData) || // During new requisition creation
                 (effectiveUserRole === 'procurement' && !formData.approvals.requestedBy && !initialData) ||
                 (effectiveUserRole === 'accounts' && !formData.approvals.requestedBy && !initialData) ||
                 (effectiveUserRole === 'staff' && !formData.approvals.requestedBy && !initialData)
        case 'reviewedBy':
          // Procurement users and MD can edit this section
          return (effectiveUserRole === 'procurement' || effectiveUserRole === 'md')
        case 'approvedBy':
          // Account users and MD can edit this section  
          return (effectiveUserRole === 'accounts' || effectiveUserRole === 'md')
        default:
          return false
      }
    })()

    console.log(`canEditApproval(${approvalType}):`, {
      result: canEdit,
      readOnly,
      effectiveUserRole,
      approvalType,
      requestedBy: formData.approvals.requestedBy,
      reviewedBy: formData.approvals.reviewedBy,
      approvedBy: formData.approvals.approvedBy
    })

    return canEdit
  }

  // Can approve at specific stage
  const canApproveAtStage = (stage: 'procurement' | 'account') => {
    if (readOnly) return false
    
    switch (stage) {
      case 'procurement':
        return (effectiveUserRole === 'procurement' || effectiveUserRole === 'md') && 
               formData.approvals.requestedBy && 
               formData.approvals.reviewedBy?.name && 
               formData.approvals.reviewedBy?.date && 
               formData.approvals.reviewedBy?.signature
      case 'account':
        return (effectiveUserRole === 'accounts' || effectiveUserRole === 'md') && 
               formData.approvals.reviewedBy && 
               formData.approvals.approvedBy?.name && 
               formData.approvals.approvedBy?.date && 
               formData.approvals.approvedBy?.signature
      default:
        return false
    }
  }

  // Check if approval details are complete but not yet approved
  const hasApprovalDetails = (approvalType: 'reviewedBy' | 'approvedBy') => {
    const approval = formData.approvals[approvalType]
    return approval?.name && approval?.date && approval?.signature
  }

  // Generate PDF using the standardized PDF generator
  const generatePDF = () => {
    // Convert form data to Requisition format for consistent PDF generation
    const requisitionForPDF = {
      id: initialData?.id || 'temp-id',
      requisitionNumber: formData.requisitionNo,
      requesterId: formData.requestedById || currentUser?.id || '',
      requesterName: formData.requestedBy || currentUser?.name || '',
      requesterDepartment: (currentUser?.role === 'md' ? 'Managing Director' : (formData.department || currentUser?.department || 'Unknown')) as any,
      items: formData.materials.filter(m => m.description.trim()).map(material => ({
        id: material.id,
        description: material.description,
        quantity: material.quantity,
        unitPrice: material.unitCost,
        totalPrice: material.amount
      })),
      totalAmount: formData.total,
      status: (formData.status === 'draft' ? 'Pending Procurement' : 
              formData.status === 'requested' ? 'Pending Procurement' :
              formData.status === 'reviewed' ? 'Pending Account' : 'Approved') as any,
      purpose: [
        `Project: ${formData.projectTitle}`,
        formData.projectJobNo && `Job No: ${formData.projectJobNo}`,
        formData.client && `Client: ${formData.client}`,
        `Currency: ${formData.currency}`,
        `Doc No: ${formData.docNo}`
      ].filter(Boolean).join(' | '),
      createdAt: formData.createdAt || new Date().toISOString(),
      updatedAt: formData.updatedAt || new Date().toISOString(),
      // Map approval data from form to requisition format
      procurementApprovedBy: formData.approvals.reviewedBy?.name || undefined,
      procurementApprovedAt: formData.approvals.reviewedBy?.date ? 
        new Date(formData.approvals.reviewedBy.date).toISOString() : undefined,
      accountApprovedBy: formData.approvals.approvedBy?.name || undefined,
      accountApprovedAt: formData.approvals.approvedBy?.date ? 
        new Date(formData.approvals.approvedBy.date).toISOString() : undefined,
    }

    // Pass signature data to PDF generator for consistent rendering
    const signatureData = {
      requestedBy: formData.approvals.requestedBy ? {
        name: formData.approvals.requestedBy.name,
        date: formData.approvals.requestedBy.date,
        signature: formData.approvals.requestedBy.signature
      } : undefined,
      reviewedBy: formData.approvals.reviewedBy ? {
        name: formData.approvals.reviewedBy.name,
        date: formData.approvals.reviewedBy.date,
        signature: formData.approvals.reviewedBy.signature
      } : undefined,
      approvedBy: formData.approvals.approvedBy ? {
        name: formData.approvals.approvedBy.name,
        date: formData.approvals.approvedBy.date,
        signature: formData.approvals.approvedBy.signature
      } : undefined
    }

    // Use the standardized PDF generator with signature data for consistency
    generateRequisitionPDF(requisitionForPDF, signatureData)
    toast.success(`Downloading PDF for ${formData.requisitionNo}`)
  }

  const handleSubmit = async () => {
    console.log('handleSubmit called')
    console.log('currentUser:', currentUser)
    console.log('formData:', formData)
    console.log('addRequisition function available:', typeof addRequisition)

    if (!currentUser) {
      console.error('No current user')
      toast.error('User not authenticated')
      return
    }

    if (!addRequisition) {
      console.error('addRequisition function not available')
      toast.error('System error: Unable to save requisition')
      return
    }

    // Validation
    if (!formData.projectTitle.trim()) {
      console.error('No project title')
      console.log('formData.projectTitle:', formData.projectTitle)
      toast.error('Please enter the project title')
      return
    }

    const validMaterials = formData.materials.filter(item => item.description.trim() && item.quantity > 0)
    console.log('validMaterials:', validMaterials)
    console.log('formData.materials:', formData.materials)
    
    if (validMaterials.length === 0) {
      console.error('No valid materials')
      toast.error('Please add at least one material with description and quantity')
      return
    }

    setIsSubmitting(true)

    try {
      // If editing existing requisition, update it with signatures
      if (initialData?.id) {
        const updates: any = {
          updatedAt: new Date().toISOString()
        }
        
        // Only add signature fields if they exist (Firebase doesn't allow undefined)
        if (formData.approvals.requestedBy?.signature) {
          updates.requesterSignature = formData.approvals.requestedBy.signature
        }
        if (formData.approvals.reviewedBy?.signature) {
          updates.procurementSignature = formData.approvals.reviewedBy.signature
        }
        if (formData.approvals.approvedBy?.signature) {
          updates.accountSignature = formData.approvals.approvedBy.signature
        }
        
        await updateRequisition(initialData.id, updates)
        toast.success('Requisition updated successfully')
        setIsOpen(false)
        return
      }

      // Convert MaterialRequisitionData to the existing Requisition format
      const requisitionItems = validMaterials.map((material) => ({
        id: material.id,
        description: material.description,
        quantity: material.quantity,
        unitPrice: material.unitCost,
        totalPrice: material.amount
      }))

      console.log('requisitionItems:', requisitionItems)

      // Create the purpose string from project details
      const purposeText = [
        `Project: ${formData.projectTitle}`,
        formData.projectJobNo && `Job No: ${formData.projectJobNo}`,
        formData.client && `Client: ${formData.client}`,
        `Currency: ${formData.currency}`,
        `Doc No: ${formData.docNo}`
      ].filter(Boolean).join(' | ')

      // Create requisition using existing data context - matching exact interface
      const requisitionData: any = {
        requesterId: currentUser.id,
        requesterName: currentUser.name || 'Unknown User',
        requesterDepartment: (currentUser.role === 'md' ? 'Managing Director' : (currentUser.department || 'Unknown')) as any,
        items: requisitionItems,
        totalAmount: formData.total,
        status: 'Pending Procurement' as RequisitionStatus,
        purpose: purposeText
      }

      // Only add signature fields if they exist (Firebase doesn't allow undefined)
      if (formData.approvals.requestedBy?.signature) {
        requisitionData.requesterSignature = formData.approvals.requestedBy.signature
      }
      if (formData.approvals.reviewedBy?.signature) {
        requisitionData.procurementSignature = formData.approvals.reviewedBy.signature
      }
      if (formData.approvals.approvedBy?.signature) {
        requisitionData.accountSignature = formData.approvals.approvedBy.signature
      }

      console.log('About to save requisition:', requisitionData)
      console.log('addRequisition function:', addRequisition)
      console.log('Current user department:', currentUser.department)
      console.log('Current user role:', currentUser.role)

      // Add a try-catch specifically around the addRequisition call
      let savedRequisition
      try {
        savedRequisition = await addRequisition(requisitionData)
        console.log('addRequisition completed successfully:', savedRequisition)
      } catch (addError) {
        console.error('addRequisition failed:', addError)
        const errorMessage = addError instanceof Error ? addError.message : String(addError)
        throw new Error(`Failed to save to database: ${errorMessage}`)
      }
      
      console.log('Saved requisition:', savedRequisition)

      if (!savedRequisition) {
        throw new Error('No requisition returned from save operation')
      }

      toast.success(`Material Requisition ${savedRequisition.requisitionNumber} saved successfully`)
      
      console.log('Form save successful, closing form...')
      
      // Reset form to initial state with next requisition number
      setFormData({
        docNo: 'GDRL-PL-QF-005',
        revDate: '26.06.2024',
        dateOfRequest: new Date().toLocaleDateString('en-GB'),
        client: '',
        requisitionNo: getNextRequisitionNumber(),
        requestedBy: currentUser?.name || '',
        requestedById: currentUser?.id || '',
        department: currentUser?.department || '',
        projectTitle: '',
        projectJobNo: '',
        currency: 'NGN',
        materials: [
          {
            id: '1',
            itemNo: 1,
            description: '',
            quantity: 0,
            unitCost: 0,
            amount: 0,
            remarks: ''
          }
        ],
        total: 0,
        approvals: {
          requestedBy: null,
          reviewedBy: null,
          approvedBy: null
        },
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      
      setIsOpen(false)
    } catch (error) {
      console.error('Save error:', error)
      toast.error(`Failed to save requisition: ${error}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle approval actions
  const handleApprovalAction = async (action: 'approve-procurement' | 'approve-account') => {
    if (!currentUser || !initialData?.id) return

    setIsApproving(true)
    try {
      if (action === 'approve-procurement') {
        await approveAsProcurement(initialData.id, currentUser.id, currentUser.name || 'Unknown User')
        toast.success('Procurement approved successfully')
      } else if (action === 'approve-account') {
        await approveAsAccount(initialData.id, currentUser.id, currentUser.name || 'Unknown User')
        toast.success('Account approved successfully')
      }

      // Call external handler if provided
      if (onApprovalAction) {
        await onApprovalAction(action)
      }

      setIsOpen(false)
    } catch (error) {
      console.error('Approval error:', error)
      toast.error(`Failed to ${action.replace('-', ' ')}: ${error}`)
    } finally {
      setIsApproving(false)
    }
  }

  return (
    <>
      <style jsx global>{`
        [data-state="open"][data-side="right"] {
          width: 100vw !important;
          height: 100vh !important;
          max-width: none !important;
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          right: 0 !important;
          bottom: 0 !important;
          transform: none !important;
          z-index: 9999 !important;
        }
        
        .sheet-overlay {
          display: none !important;
        }

        /* Approval workflow animations */
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes pulse-soft {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }

        .animate-in {
          animation: fade-in 0.3s ease-out;
        }

        .animate-pulse {
          animation: pulse-soft 2s infinite;
        }

        /* Button hover animations */
        .hover\\:scale-105:hover {
          transform: scale(1.05);
        }

        /* Focus animations for inputs */
        .focus\\:bg-blue-50:focus {
          background-color: #eff6ff;
          transition: background-color 0.2s ease;
        }

        /* Signature hover effect */
        .hover\\:scale-105:hover {
          transform: scale(1.05);
          transition: transform 0.2s ease;
        }
      `}</style>
      
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        {trigger || (
          <Button className="bg-[oklch(0.65_0.18_45)] hover:bg-[oklch(0.6_0.18_45)] text-white">
            <FilePlus className="h-4 w-4 mr-2" />
            New Material Requisition
          </Button>
        )}
      </SheetTrigger>
      <SheetContent 
        className="!w-screen !h-screen !max-w-none !p-0 !m-0 !top-0 !left-0 !right-0 !bottom-0 !transform-none !translate-x-0 !translate-y-0 !border-0 !rounded-none"
        side="right"
        style={{ 
          width: '100vw', 
          height: '100vh', 
          maxWidth: 'none',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          transform: 'none',
          zIndex: 9999
        }}
      >
        <div className="w-full h-full overflow-y-auto p-4 bg-white relative">
          {/* Close Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 z-10 h-8 w-8 p-0 rounded-full bg-gray-100 hover:bg-gray-200"
          >
            <X className="h-4 w-4" />
          </Button>

          <SheetHeader className="mb-4">
            <SheetTitle className="text-lg">Material Requisition Form</SheetTitle>
            <SheetDescription className="text-sm">
              Official material requisition document for Gladex Dynamic Resources Limited
            </SheetDescription>
          </SheetHeader>

          {/* MATERIAL REQUISITION FORM - EXACT MATCH */}
          <div className="w-full bg-white" id="material-requisition-form">
            {/* HEADER SECTION - EXACT MATCH */}
            <div className="border-2 border-black">
              <div className="grid grid-cols-12 border-b-2 border-black">
                {/* Logo Section */}
                <div className="col-span-3 p-4 border-r-2 border-black flex items-center justify-center">
                  <img 
                    src="/images/gladex-logo.jpg" 
                    alt="Gladex Logo" 
                    className="h-16 w-auto object-contain"
                  />
                </div>
                
                {/* Title Section */}
                <div className="col-span-6 p-4 border-r-2 border-black flex items-center justify-center">
                  <h1 className="text-xl font-bold text-center">
                    MATERIAL REQUISITION FORM
                  </h1>
                </div>
                
                {/* Document Info Section */}
                <div className="col-span-3 p-2">
                  <div className="border border-black p-2 mb-1">
                    <div className="text-xs font-semibold">Doc No:</div>
                    <Input
                      value={formData.docNo}
                      onChange={(e) => setFormData(prev => ({ ...prev, docNo: e.target.value }))}
                      className="border-0 p-0 h-auto text-xs"
                      disabled={readOnly}
                    />
                  </div>
                  <div className="border border-black p-2">
                    <div className="text-xs font-semibold">Rev./Date:</div>
                    <Input
                      value={formData.revDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, revDate: e.target.value }))}
                      className="border-0 p-0 h-auto text-xs"
                      disabled={readOnly}
                    />
                  </div>
                </div>
              </div>

              {/* FORM META SECTION - EXACT LAYOUT */}
              <div className="p-0">
                {/* Row 1 */}
                <div className="grid grid-cols-12 border-b border-black">
                  <div className="col-span-3 border-r border-black p-2">
                    <label className="text-xs font-semibold block mb-1">Date of request:</label>
                    <Input
                      type="date"
                      value={formData.dateOfRequest}
                      onChange={(e) => setFormData(prev => ({ ...prev, dateOfRequest: e.target.value }))}
                      className="border-0 p-0 h-auto text-xs"
                      disabled={readOnly}
                    />
                  </div>
                  <div className="col-span-3 border-r border-black p-2">
                    <label className="text-xs font-semibold block mb-1">Client:</label>
                    <Input
                      value={formData.client}
                      onChange={(e) => setFormData(prev => ({ ...prev, client: e.target.value }))}
                      className="border-0 p-0 h-auto text-xs"
                      disabled={readOnly}
                    />
                  </div>
                  <div className="col-span-6 p-2">
                    <label className="text-xs font-semibold block mb-1">Requisition No.:</label>
                    <Input
                      value={formData.requisitionNo}
                      onChange={(e) => setFormData(prev => ({ ...prev, requisitionNo: e.target.value }))}
                      className="border-0 p-0 h-auto text-xs"
                      disabled={readOnly}
                    />
                  </div>
                </div>

                {/* Row 2 */}
                <div className="grid grid-cols-12 border-b border-black">
                  <div className="col-span-6 border-r border-black p-2">
                    <label className="text-xs font-semibold block mb-1">Requested By (Name):</label>
                    <Input
                      value={formData.requestedBy}
                      onChange={(e) => setFormData(prev => ({ ...prev, requestedBy: e.target.value }))}
                      className="border-0 p-0 h-auto text-xs"
                      disabled={readOnly}
                    />
                  </div>
                  <div className="col-span-6 p-2">
                    <label className="text-xs font-semibold block mb-1">Department:</label>
                    <div className="text-xs bg-gray-100 p-1">
                      {currentUser?.role === 'md' ? 'Managing Director' : (formData.department || 'Unknown')}
                    </div>
                  </div>
                </div>

                {/* Row 3 */}
                <div className="grid grid-cols-12 border-b border-black">
                  <div className="col-span-6 border-r border-black p-2">
                    <label className="text-xs font-semibold block mb-1">Project Title:</label>
                    <Input
                      value={formData.projectTitle}
                      onChange={(e) => setFormData(prev => ({ ...prev, projectTitle: e.target.value }))}
                      className="border-0 p-0 h-auto text-xs"
                      disabled={readOnly}
                    />
                  </div>
                  <div className="col-span-6 p-2">
                    <label className="text-xs font-semibold block mb-1">Project / Job No.:</label>
                    <Input
                      value={formData.projectJobNo}
                      onChange={(e) => setFormData(prev => ({ ...prev, projectJobNo: e.target.value }))}
                      className="border-0 p-0 h-auto text-xs"
                      disabled={readOnly}
                    />
                  </div>
                </div>
              </div>

              {/* MATERIAL REQUIRED SECTION - EXACT TABLE */}
              <div>
                {/* Section Header */}
                <div className="bg-blue-200 p-2 border-b border-black text-center">
                  <h2 className="text-sm font-bold">MATERIAL REQUIRED</h2>
                </div>

                {/* Currency Selector */}
                <div className="p-2 border-b border-black">
                  <label className="text-xs font-semibold mr-2">Currency:</label>
                  <Select
                    value={formData.currency}
                    onValueChange={(value: 'NGN' | 'USD') => setFormData(prev => ({ ...prev, currency: value }))}
                    disabled={readOnly}
                  >
                    <SelectTrigger className="w-20 h-6 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NGN">NGN (₦)</SelectItem>
                      <SelectItem value="USD">USD ($)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Table Header */}
                <div className="grid grid-cols-12 bg-gray-100 border-b border-black text-xs font-semibold">
                  <div className="col-span-1 p-2 border-r border-black text-center">Item No.</div>
                  <div className="col-span-4 p-2 border-r border-black text-center">
                    Material Description / Part No / Specification / Local
                  </div>
                  <div className="col-span-1 p-2 border-r border-black text-center">Quantity</div>
                  <div className="col-span-2 p-2 border-r border-black text-center">Unit Cost</div>
                  <div className="col-span-2 p-2 border-r border-black text-center">Amount</div>
                  <div className="col-span-2 p-2 text-center">Remarks</div>
                </div>

                {/* Material Rows */}
                {formData.materials.map((material, index) => (
                  <div key={material.id} className="grid grid-cols-12 border-b border-black text-xs">
                    <div className="col-span-1 p-2 border-r border-black text-center flex items-center justify-center">
                      {material.itemNo}
                    </div>
                    <div className="col-span-4 p-1 border-r border-black">
                      <Input
                        value={material.description}
                        onChange={(e) => updateMaterial(index, 'description', e.target.value)}
                        className="border-0 p-1 h-auto text-xs"
                        disabled={readOnly}
                      />
                    </div>
                    <div className="col-span-1 p-1 border-r border-black">
                      <Input
                        type="number"
                        value={material.quantity || ''}
                        onChange={(e) => updateMaterial(index, 'quantity', parseFloat(e.target.value) || 0)}
                        className="border-0 p-1 h-auto text-xs text-center"
                        disabled={readOnly}
                      />
                    </div>
                    <div className="col-span-2 p-1 border-r border-black">
                      <Input
                        type="number"
                        step="0.01"
                        value={material.unitCost || ''}
                        onChange={(e) => updateMaterial(index, 'unitCost', parseFloat(e.target.value) || 0)}
                        className="border-0 p-1 h-auto text-xs text-right"
                        disabled={readOnly}
                      />
                    </div>
                    <div className="col-span-2 p-2 border-r border-black text-right flex items-center justify-end">
                      {formatCurrency(material.amount)}
                    </div>
                    <div className="col-span-2 p-1 flex items-center">
                      <Input
                        value={material.remarks}
                        onChange={(e) => updateMaterial(index, 'remarks', e.target.value)}
                        className="border-0 p-1 h-auto text-xs flex-1"
                        disabled={readOnly}
                      />
                      {!readOnly && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeMaterialRow(index)}
                          className="ml-1 h-6 w-6 p-0 print-hidden"
                          disabled={formData.materials.length === 1}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}

                {/* Add Row Button */}
                {!readOnly && (
                  <div className="p-2 border-b border-black print-hidden">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addMaterialRow}
                      className="text-xs"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add Row
                    </Button>
                  </div>
                )}

                {/* Total Row */}
                <div className="grid grid-cols-12 border-b-2 border-black bg-gray-50">
                  <div className="col-span-7"></div>
                  <div className="col-span-3 p-2 text-center font-bold text-sm">TOTAL</div>
                  <div className="col-span-2 p-2 text-right font-bold text-sm">
                    {formatCurrency(formData.total)}
                  </div>
                </div>
              </div>

              {/* APPROVALS SECTION - EXACT LAYOUT */}
              <div>
                {/* Section Header */}
                <div className="bg-blue-200 p-2 border-b border-black text-center">
                  <h2 className="text-sm font-bold">APPROVALS</h2>
                </div>

                {/* Approval Rows */}
                {[
                  { key: 'requestedBy' as const, label: 'Requested by:', stage: null },
                  { key: 'reviewedBy' as const, label: 'Reviewed by:', stage: 'procurement' as const },
                  { key: 'approvedBy' as const, label: 'Approved by:', stage: 'account' as const }
                ].map(({ key, label, stage }) => (
                  <div key={key} className="grid grid-cols-12 border-b border-black text-xs relative">
                    {/* Visual indicator for approval details added */}
                    {stage && hasApprovalDetails(key) && (
                      <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 z-10">
                        <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center animate-pulse">
                          <CheckCircle className="h-2.5 w-2.5 text-white" />
                        </div>
                      </div>
                    )}
                    
                    <div className="col-span-4 p-2 border-r border-black">
                      <div className="font-semibold mb-1 flex items-center gap-2">
                        {label}
                        {stage && hasApprovalDetails(key) && (
                          <span className="text-blue-600 text-xs bg-blue-100 px-1 py-0.5 rounded animate-in fade-in duration-300">
                            Details Added
                          </span>
                        )}
                      </div>
                      {canEditApproval(key) ? (
                        <Input
                          value={formData.approvals[key]?.name || ''}
                          onChange={(e) => {
                            const approval = formData.approvals[key] || { name: '', date: '', signature: '' }
                            setFormData(prev => ({
                              ...prev,
                              approvals: {
                                ...prev.approvals,
                                [key]: { ...approval, name: e.target.value }
                              }
                            }))
                          }}
                          className="border-0 p-0 h-auto text-xs transition-all duration-200 focus:bg-blue-50"
                          placeholder="Name"
                        />
                      ) : (
                        <div className="text-xs">{formData.approvals[key]?.name || ''}</div>
                      )}
                    </div>
                    <div className="col-span-4 p-2 border-r border-black">
                      <div className="font-semibold mb-1">Date:</div>
                      {canEditApproval(key) ? (
                        <Input
                          type="date"
                          value={formData.approvals[key]?.date || ''}
                          onChange={(e) => {
                            const approval = formData.approvals[key] || { name: '', date: '', signature: '' }
                            setFormData(prev => ({
                              ...prev,
                              approvals: {
                                ...prev.approvals,
                                [key]: { ...approval, date: e.target.value }
                              }
                            }))
                          }}
                          className="border-0 p-0 h-auto text-xs transition-all duration-200 focus:bg-blue-50"
                        />
                      ) : (
                        <div className="text-xs">{formData.approvals[key]?.date || ''}</div>
                      )}
                    </div>
                    <div className="col-span-4 p-2">
                      <div className="font-semibold mb-1">Sign:</div>
                      {formData.approvals[key]?.signature ? (
                        <div className="relative">
                          <img 
                            src={formData.approvals[key]?.signature} 
                            alt="Signature" 
                            className="max-h-12 max-w-full object-contain transition-all duration-200 hover:scale-105"
                          />
                          {stage && hasApprovalDetails(key) && (
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                          )}
                        </div>
                      ) : canEditApproval(key) ? (
                        <div className="print-hidden">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) {
                                handleSignatureUpload(key, file)
                              }
                            }}
                            className="text-xs hidden"
                            id={`signature-${key}`}
                          />
                          <label 
                            htmlFor={`signature-${key}`} 
                            className="cursor-pointer text-xs flex items-center transition-all duration-200 hover:text-blue-600 hover:bg-blue-50 p-1 rounded"
                          >
                            <Upload className="h-4 w-4 mr-1" />
                            Upload Signature
                          </label>
                        </div>
                      ) : (
                        <div className="text-xs text-gray-400 flex items-center">
                          {formData.approvals[key]?.name ? (
                            <span>Signed</span>
                          ) : (
                            <>
                              <Clock className="h-3 w-3 mr-1" />
                              Pending
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <SheetFooter className="mt-4 print-hidden">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="transition-all duration-200 hover:scale-105"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={generatePDF}
              className="transition-all duration-200 hover:scale-105"
            >
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
            
            {/* Conditional action buttons based on user role and form state */}
            {!initialData ? (
              // New requisition - show save button
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-[oklch(0.65_0.18_45)] hover:bg-[oklch(0.6_0.18_45)] text-white transition-all duration-200 hover:scale-105"
              >
                {isSubmitting ? 'Saving...' : 'Save Requisition'}
              </Button>
            ) : (
              // Existing requisition - show edit/approve buttons
              <div className="flex gap-2">
                {/* Save/Edit button - always available for editing details */}
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  variant="outline"
                  className="transition-all duration-200 hover:scale-105"
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
                
                {/* Procurement Approve button */}
                {canApproveAtStage('procurement') && (
                  <Button
                    onClick={() => handleApprovalAction('approve-procurement')}
                    disabled={isApproving}
                    className="bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200 hover:scale-105 animate-in fade-in duration-300"
                  >
                    {isApproving ? 'Approving...' : 'Approve Procurement'}
                  </Button>
                )}
                
                {/* Account Approve button */}
                {canApproveAtStage('account') && (
                  <Button
                    onClick={() => handleApprovalAction('approve-account')}
                    disabled={isApproving}
                    className="bg-green-600 hover:bg-green-700 text-white transition-all duration-200 hover:scale-105 animate-in fade-in duration-300"
                  >
                    {isApproving ? 'Approving...' : 'Final Approve'}
                  </Button>
                )}
              </div>
            )}
          </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
    </>
  )
}
