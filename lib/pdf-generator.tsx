import type { Requisition } from './types'

export function generateRequisitionPDF(requisition: Requisition, signatureData?: {
  requestedBy?: { name: string; date: string; signature?: string };
  reviewedBy?: { name: string; date: string; signature?: string };
  approvedBy?: { name: string; date: string; signature?: string };
}) {
  // Create a new window for the PDF content
  const printWindow = window.open('', '_blank')
  if (!printWindow) {
    alert('Please allow popups to download the PDF')
    return
  }

  const formatCurrency = (amount: number) =>
    `₦${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`

  const formatDate = (dateString: string) =>
    new Date(dateString).toISOString().split('T')[0]

  // Get the logo URL with absolute path
  const logoUrl = `${window.location.origin}/images/gladex-logo.jpg`

  // Extract project details from purpose
  const purposeParts = (requisition.purpose || '').split(' | ')
  const projectTitle = purposeParts.find(p => p.startsWith('Project: '))?.replace('Project: ', '') || ''
  const jobNo = purposeParts.find(p => p.startsWith('Job No: '))?.replace('Job No: ', '') || ''
  const client = purposeParts.find(p => p.startsWith('Client: '))?.replace('Client: ', '') || ''

  const itemsHtml = (requisition.items || [])
    .map(
      (item, index) => `
      <div class="grid grid-cols-12 border-b border-black text-xs">
        <div class="col-span-1 p-2 border-r border-black text-center flex items-center justify-center">
          ${index + 1}
        </div>
        <div class="col-span-4 p-1 border-r border-black">
          ${item.description || ''}
        </div>
        <div class="col-span-1 p-1 border-r border-black text-center">
          ${item.quantity || 0}
        </div>
        <div class="col-span-2 p-1 border-r border-black text-right">
          ${(item.unitPrice || 0).toFixed(2)}
        </div>
        <div class="col-span-2 p-2 border-r border-black text-right">
          ${formatCurrency(item.totalPrice || 0)}
        </div>
        <div class="col-span-2 p-1">
          &nbsp;
        </div>
      </div>
    `
    )
    .join('')

  // Add empty rows to match form layout (minimum 5 rows for better appearance)
  const emptyRowsCount = Math.max(0, 5 - (requisition.items?.length || 0))
  const emptyRowsHtml = Array.from({ length: emptyRowsCount }, (_, i) => `
    <div class="grid grid-cols-12 border-b border-black text-xs">
      <div class="col-span-1 p-2 border-r border-black text-center">
        ${(requisition.items?.length || 0) + i + 1}
      </div>
      <div class="col-span-4 p-1 border-r border-black">&nbsp;</div>
      <div class="col-span-1 p-1 border-r border-black">&nbsp;</div>
      <div class="col-span-2 p-1 border-r border-black">&nbsp;</div>
      <div class="col-span-2 p-2 border-r border-black">&nbsp;</div>
      <div class="col-span-2 p-1">&nbsp;</div>
    </div>
  `).join('')

  const printDocument = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
      <title>Material Requisition Form - ${requisition.requisitionNumber || 'N/A'}</title>
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
        @media screen and (max-width: 768px) {
          body { font-size: 12px; }
          .text-xs { font-size: 0.65rem; }
          .text-sm { font-size: 0.75rem; }
          .text-xl { font-size: 1rem; }
          .p-1 { padding: 0.15rem; }
          .p-2 { padding: 0.35rem; }
          .p-4 { padding: 0.75rem; }
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
        .text-gray-400 { color: #9ca3af !important; }
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
        .relative { position: relative; }
        .absolute { position: absolute; }
        img { max-height: 3rem; max-width: 100%; object-fit: contain; }
      </style>
    </head>
    <body>
      <div class="w-full bg-white">
        <!-- HEADER SECTION - EXACT MATCH -->
        <div class="border-2 border-black">
          <div class="grid grid-cols-12 border-b-2 border-black">
            <!-- Logo Section -->
            <div class="col-span-3 p-4 border-r-2 border-black flex items-center justify-center">
              <img 
                src="${logoUrl}" 
                alt="Gladex Logo" 
                style="height: 4rem; width: auto; object-fit: contain;"
                onerror="this.style.display='none'; this.parentElement.innerHTML='<div style=\\'text-align: center;\\'><div style=\\'font-weight: bold; font-size: 1.125rem;\\'>GLADEX</div><div style=\\'font-size: 0.75rem;\\'>Dynamic Resources Limited</div></div>';"
              />
            </div>
            
            <!-- Title Section -->
            <div class="col-span-6 p-4 border-r-2 border-black flex items-center justify-center">
              <h1 class="text-xl font-bold text-center">
                MATERIAL REQUISITION FORM
              </h1>
            </div>
            
            <!-- Document Info Section -->
            <div class="col-span-3 p-2">
              <div class="border border-black p-2 mb-1">
                <div class="text-xs font-semibold">Doc No:</div>
                <div class="text-xs">GDRL-PL-QF-005</div>
              </div>
              <div class="border border-black p-2">
                <div class="text-xs font-semibold">Rev./Date:</div>
                <div class="text-xs">26.06.2024</div>
              </div>
            </div>
          </div>

          <!-- FORM META SECTION - EXACT LAYOUT -->
          <div class="p-0">
            <!-- Row 1 -->
            <div class="grid grid-cols-12 border-b border-black">
              <div class="col-span-3 border-r border-black p-2">
                <div class="text-xs font-semibold mb-1">Date of request:</div>
                <div class="text-xs">${formatDate(requisition.createdAt || new Date().toISOString())}</div>
              </div>
              <div class="col-span-3 border-r border-black p-2">
                <div class="text-xs font-semibold mb-1">Client:</div>
                <div class="text-xs">${client}</div>
              </div>
              <div class="col-span-6 p-2">
                <div class="text-xs font-semibold mb-1">Requisition No.:</div>
                <div class="text-xs">${requisition.requisitionNumber || 'N/A'}</div>
              </div>
            </div>

            <!-- Row 2 -->
            <div class="grid grid-cols-12 border-b border-black">
              <div class="col-span-6 border-r border-black p-2">
                <div class="text-xs font-semibold mb-1">Requested By (Name):</div>
                <div class="text-xs">${requisition.requesterName || 'N/A'}</div>
              </div>
              <div class="col-span-6 p-2">
                <div class="text-xs font-semibold mb-1">Department:</div>
                <div class="text-xs">${requisition.requesterDepartment || 'N/A'}</div>
              </div>
            </div>

            <!-- Row 3 -->
            <div class="grid grid-cols-12 border-b border-black">
              <div class="col-span-6 border-r border-black p-2">
                <div class="text-xs font-semibold mb-1">Project Title:</div>
                <div class="text-xs">${projectTitle}</div>
              </div>
              <div class="col-span-6 p-2">
                <div class="text-xs font-semibold mb-1">Project / Job No.:</div>
                <div class="text-xs">${jobNo}</div>
              </div>
            </div>
          </div>

          <!-- MATERIAL REQUIRED SECTION - EXACT TABLE -->
          <div>
            <!-- Section Header -->
            <div class="bg-blue-200 p-2 border-b border-black text-center">
              <h2 class="text-sm font-bold">MATERIAL REQUIRED</h2>
            </div>

            <!-- Currency Selector -->
            <div class="p-2 border-b border-black">
              <span class="text-xs font-semibold mr-2">Currency: NGN (₦)</span>
            </div>

            <!-- Table Header -->
            <div class="grid grid-cols-12 bg-gray-100 border-b border-black text-xs font-semibold">
              <div class="col-span-1 p-2 border-r border-black text-center">Item No.</div>
              <div class="col-span-4 p-2 border-r border-black text-center">
                Material Description / Part No / Specification / Local
              </div>
              <div class="col-span-1 p-2 border-r border-black text-center">Quantity</div>
              <div class="col-span-2 p-2 border-r border-black text-center">Unit Cost</div>
              <div class="col-span-2 p-2 border-r border-black text-center">Amount</div>
              <div class="col-span-2 p-2 text-center">Remarks</div>
            </div>

            <!-- Material Rows -->
            ${itemsHtml}
            ${emptyRowsHtml}

            <!-- Total Row -->
            <div class="grid grid-cols-12 border-b-2 border-black bg-gray-50">
              <div class="col-span-7"></div>
              <div class="col-span-3 p-2 text-center font-bold text-sm">TOTAL</div>
              <div class="col-span-2 p-2 text-right font-bold text-sm">
                ${formatCurrency(requisition.totalAmount || 0)}
              </div>
            </div>
          </div>

          <!-- APPROVALS SECTION - EXACT MATCH TO FORM -->
          <div>
            <!-- Section Header -->
            <div class="bg-blue-200 p-2 border-b border-black text-center">
              <h2 class="text-sm font-bold">APPROVALS</h2>
            </div>

            <!-- 1. Requested By Row -->
            <div class="grid grid-cols-12 border-b border-black text-xs">
              <div class="col-span-4 p-2 border-r border-black">
                <div class="font-semibold mb-1">Requested by:</div>
                <div class="text-xs">${signatureData?.requestedBy?.name || requisition.requesterName || ''}</div>
              </div>
              <div class="col-span-4 p-2 border-r border-black">
                <div class="font-semibold mb-1">Date:</div>
                <div class="text-xs">${signatureData?.requestedBy?.date || formatDate(requisition.createdAt || new Date().toISOString())}</div>
              </div>
              <div class="col-span-4 p-2">
                <div class="font-semibold mb-1">Sign:</div>
                <div style="min-height: 3rem; display: flex; align-items: center; justify-content: flex-start;">
                  ${signatureData?.requestedBy?.signature ? 
                    `<img src="${signatureData.requestedBy.signature}" alt="Signature" style="max-height: 3rem; max-width: 100%; object-fit: contain;" />` :
                    (signatureData?.requestedBy?.name || requisition.requesterName) ?
                      '<div class="text-xs" style="color: #9ca3af;">Signed</div>' :
                      '<div class="text-xs" style="color: #9ca3af;">Pending</div>'
                  }
                </div>
              </div>
            </div>

            <!-- 2. Reviewed By Row (Procurement) -->
            <div class="grid grid-cols-12 border-b border-black text-xs">
              <div class="col-span-4 p-2 border-r border-black">
                <div class="font-semibold mb-1">Reviewed by:</div>
                <div class="text-xs">${signatureData?.reviewedBy?.name || requisition.procurementApprovedBy || ''}</div>
              </div>
              <div class="col-span-4 p-2 border-r border-black">
                <div class="font-semibold mb-1">Date:</div>
                <div class="text-xs">${signatureData?.reviewedBy?.date || (requisition.procurementApprovedAt ? formatDate(requisition.procurementApprovedAt) : '')}</div>
              </div>
              <div class="col-span-4 p-2">
                <div class="font-semibold mb-1">Sign:</div>
                <div style="min-height: 3rem; display: flex; align-items: center; justify-content: flex-start;">
                  ${signatureData?.reviewedBy?.signature ? 
                    `<img src="${signatureData.reviewedBy.signature}" alt="Signature" style="max-height: 3rem; max-width: 100%; object-fit: contain;" />` :
                    (signatureData?.reviewedBy?.name || requisition.procurementApprovedBy) ? 
                      '<div class="text-xs" style="color: #9ca3af;">Signed</div>' : 
                      '<div class="text-xs" style="color: #9ca3af;">Pending</div>'
                  }
                </div>
              </div>
            </div>

            <!-- 3. Approved By Row (Account) -->
            <div class="grid grid-cols-12 border-b border-black text-xs">
              <div class="col-span-4 p-2 border-r border-black">
                <div class="font-semibold mb-1">Approved by:</div>
                <div class="text-xs">${signatureData?.approvedBy?.name || requisition.accountApprovedBy || ''}</div>
              </div>
              <div class="col-span-4 p-2 border-r border-black">
                <div class="font-semibold mb-1">Date:</div>
                <div class="text-xs">${signatureData?.approvedBy?.date || (requisition.accountApprovedAt ? formatDate(requisition.accountApprovedAt) : '')}</div>
              </div>
              <div class="col-span-4 p-2">
                <div class="font-semibold mb-1">Sign:</div>
                <div style="min-height: 3rem; display: flex; align-items: center; justify-content: flex-start;">
                  ${signatureData?.approvedBy?.signature ? 
                    `<img src="${signatureData.approvedBy.signature}" alt="Signature" style="max-height: 3rem; max-width: 100%; object-fit: contain;" />` :
                    (signatureData?.approvedBy?.name || requisition.accountApprovedBy) ? 
                      '<div class="text-xs" style="color: #9ca3af;">Signed</div>' : 
                      '<div class="text-xs" style="color: #9ca3af;">Pending</div>'
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `

  printWindow.document.write(printDocument)
  printWindow.document.close()

  // Wait for content to load then print
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 500)
  }
}