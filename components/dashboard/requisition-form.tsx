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
import { Plus, Minus, FilePlus, Download, Save, Upload, X } from 'lucide-react'
import { toast } from 'sonner'
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
}

export function RequisitionForm({ 
  trigger, 
  initialData, 
  readOnly = false, 
  userRole = 'staff' 
}: RequisitionFormProps) {
  const { currentUser, addRequisition } = useData()  // Use DataContext for consistency
  
  // Debug logging
  useEffect(() => {
    console.log('RequisitionForm - currentUser from DataContext:', currentUser)
    console.log('RequisitionForm - addRequisition function:', typeof addRequisition)
    
    // Check localStorage
    const storedUser = localStorage.getItem('gladex_current_user')
    console.log('RequisitionForm - localStorage user:', storedUser)
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        console.log('RequisitionForm - parsed localStorage user:', parsedUser)
      } catch (e) {
        console.error('RequisitionForm - error parsing localStorage user:', e)
      }
    }
  }, [currentUser, addRequisition])
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

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

  // Generate requisition number
  const generateRequisitionNo = () => {
    const year = new Date().getFullYear()
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
    return `GDRL-PL-MRF-${random}`
  }

  const [formData, setFormData] = useState<MaterialRequisitionData>(() => ({
    docNo: 'GDRL-PL-QF-005',
    revDate: '26.06.2024',
    dateOfRequest: new Date().toLocaleDateString('en-GB'),
    client: '',
    requisitionNo: generateRequisitionNo(),
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
    if (readOnly) return false
    
    switch (approvalType) {
      case 'requestedBy':
        return userRole === 'staff' && !formData.approvals.requestedBy
      case 'reviewedBy':
        return (userRole === 'procurement' || userRole === 'md') && 
               formData.approvals.requestedBy && !formData.approvals.reviewedBy
      case 'approvedBy':
        return (userRole === 'accounts' || userRole === 'md') && 
               formData.approvals.reviewedBy && !formData.approvals.approvedBy
      default:
        return false
    }
  }

  // Generate PDF
  const generatePDF = () => {
    const formElement = document.getElementById('material-requisition-form')
    if (!formElement) {
      toast.error('Form not found')
      return
    }

    // Create print window
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      toast.error('Could not open print window')
      return
    }

    // Clone form and prepare for PDF
    const clonedForm = formElement.cloneNode(true) as HTMLElement
    
    // Remove interactive elements
    const buttons = clonedForm.querySelectorAll('button')
    buttons.forEach(btn => btn.remove())
    
    const fileInputs = clonedForm.querySelectorAll('input[type="file"]')
    fileInputs.forEach(input => input.remove())

    const printDocument = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Material Requisition Form - ${formData.requisitionNo}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: Arial, sans-serif; 
            background: white; 
            color: black; 
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          @page { size: A4; margin: 0.5in; }
          @media print {
            body { background: white !important; color: black !important; }
            * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          }
          .border-2 { border: 2px solid black; }
          .border { border: 1px solid black; }
          .border-b-2 { border-bottom: 2px solid black; }
          .border-b { border-bottom: 1px solid black; }
          .border-r-2 { border-right: 2px solid black; }
          .border-r { border-right: 1px solid black; }
          .grid { display: grid; }
          .grid-cols-12 { grid-template-columns: repeat(12, minmax(0, 1fr)); }
          .col-span-1 { grid-column: span 1; }
          .col-span-2 { grid-column: span 2; }
          .col-span-3 { grid-column: span 3; }
          .col-span-4 { grid-column: span 4; }
          .col-span-6 { grid-column: span 6; }
          .col-span-7 { grid-column: span 7; }
          .p-1 { padding: 0.25rem; }
          .p-2 { padding: 0.5rem; }
          .p-4 { padding: 1rem; }
          .text-xs { font-size: 0.75rem; }
          .text-sm { font-size: 0.875rem; }
          .text-xl { font-size: 1.25rem; }
          .font-bold { font-weight: 700; }
          .font-semibold { font-weight: 600; }
          .text-center { text-align: center; }
          .text-right { text-align: right; }
          .bg-blue-200 { background-color: #dbeafe !important; }
          .bg-gray-100 { background-color: #f3f4f6 !important; }
          .bg-gray-50 { background-color: #f9fafb !important; }
          .flex { display: flex; }
          .items-center { align-items: center; }
          .justify-center { justify-content: center; }
          .h-16 { height: 4rem; }
          .w-auto { width: auto; }
          .max-h-12 { max-height: 3rem; }
          .max-w-full { max-width: 100%; }
          .object-contain { object-fit: contain; }
          .mb-1 { margin-bottom: 0.25rem; }
          input, select, textarea { border: none; background: transparent; font-size: inherit; font-family: inherit; }
          .print-hidden { display: none !important; }
        </style>
      </head>
      <body>
        ${clonedForm.outerHTML}
      </body>
      </html>
    `

    printWindow.document.write(printDocument)
    printWindow.document.close()
    
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print()
        printWindow.close()
      }, 500)
    }
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
      const requisitionData = {
        requesterId: currentUser.id,
        requesterName: currentUser.name || 'Unknown User',
        requesterDepartment: currentUser.role === 'md' ? 'MD' : (currentUser.department || 'Unknown'),
        items: requisitionItems,
        totalAmount: formData.total,
        status: 'Pending Procurement' as RequisitionStatus,
        purpose: purposeText
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
      
      // Reset form to initial state
      const newReqNo = generateRequisitionNo()
      setFormData({
        docNo: 'GDRL-PL-QF-005',
        revDate: '26.06.2024',
        dateOfRequest: new Date().toLocaleDateString('en-GB'),
        client: '',
        requisitionNo: newReqNo,
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
      
      setOpen(false)
    } catch (error) {
      console.error('Save error:', error)
      toast.error(`Failed to save requisition: ${error}`)
    } finally {
      setIsSubmitting(false)
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
      `}</style>
      
      <Sheet open={open} onOpenChange={setOpen}>
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
            onClick={() => setOpen(false)}
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
                      {currentUser?.role === 'md' ? 'MD' : (formData.department || 'Unknown')}
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
                  { key: 'requestedBy' as const, label: 'Requested by:' },
                  { key: 'reviewedBy' as const, label: 'Reviewed by:' },
                  { key: 'approvedBy' as const, label: 'Approved by:' }
                ].map(({ key, label }) => (
                  <div key={key} className="grid grid-cols-12 border-b border-black text-xs">
                    <div className="col-span-4 p-2 border-r border-black">
                      <div className="font-semibold mb-1">{label}</div>
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
                          className="border-0 p-0 h-auto text-xs"
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
                          className="border-0 p-0 h-auto text-xs"
                        />
                      ) : (
                        <div className="text-xs">{formData.approvals[key]?.date || ''}</div>
                      )}
                    </div>
                    <div className="col-span-4 p-2">
                      <div className="font-semibold mb-1">Sign:</div>
                      {formData.approvals[key]?.signature ? (
                        <img 
                          src={formData.approvals[key]?.signature} 
                          alt="Signature" 
                          className="max-h-12 max-w-full object-contain"
                        />
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
                          <label htmlFor={`signature-${key}`} className="cursor-pointer text-xs flex items-center">
                            <Upload className="h-4 w-4 mr-1" />
                            Upload Signature
                          </label>
                        </div>
                      ) : (
                        <div className="text-xs text-gray-400">Pending</div>
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
              onClick={() => setOpen(false)}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={generatePDF}
            >
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-[oklch(0.65_0.18_45)] hover:bg-[oklch(0.6_0.18_45)] text-white"
            >
              {isSubmitting ? 'Saving...' : 'Save Requisition'}
            </Button>
          </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
    </>
  )
}
