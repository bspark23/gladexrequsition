import type { Requisition } from './types'

export function generateRequisitionPDF(requisition: Requisition) {
  // Create a new window for the PDF content
  const printWindow = window.open('', '_blank')
  if (!printWindow) {
    alert('Please allow popups to download the PDF')
    return
  }

  const formatCurrency = (amount: number) =>
    amount.toLocaleString('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2,
    })

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-GB')

  const itemsHtml = (requisition.items || [])
    .map(
      (item, index) => `
      <div class="grid grid-cols-12 border-b">
        <div class="col-span-1 border-r p-2 text-center text-sm">${index + 1}</div>
        <div class="col-span-5 border-r p-2 text-sm">${item.description || 'N/A'}</div>
        <div class="col-span-1 border-r p-2 text-center text-sm">${item.quantity || 0}</div>
        <div class="col-span-2 border-r p-2 text-right text-sm">${formatCurrency(item.unitPrice || 0)}</div>
        <div class="col-span-3 p-2 text-right text-sm font-semibold">${formatCurrency(item.totalPrice || 0)}</div>
      </div>
    `
    )
    .join('')

  const printDocument = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Material Requisition Form - ${requisition.requisitionNumber || 'N/A'}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: Arial, sans-serif; 
          background: white; 
          color: black; 
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
          padding: 20px;
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
        .col-span-5 { grid-column: span 5; }
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
        .mb-4 { margin-bottom: 1rem; }
        .mt-4 { margin-top: 1rem; }
      </style>
    </head>
    <body>
      <div class="border-2">
        <!-- Header -->
        <div class="grid grid-cols-12 border-b-2">
          <div class="col-span-3 border-r-2 p-4 flex items-center justify-center">
            <div class="text-center">
              <div class="font-bold text-xl mb-1">GLADEX</div>
              <div class="text-xs">Dynamic Resources Limited</div>
            </div>
          </div>
          <div class="col-span-6 border-r-2 p-4 text-center">
            <div class="font-bold text-xl">MATERIAL REQUISITION FORM</div>
          </div>
          <div class="col-span-3 p-2">
            <div class="text-xs mb-1">Doc. No: GDRL-PL-QF-005</div>
            <div class="text-xs mb-1">Rev. Date: 26.06.2024</div>
            <div class="text-xs">Date of Request: ${formatDate(requisition.createdAt || new Date().toISOString())}</div>
          </div>
        </div>

        <!-- Form Fields -->
        <div class="grid grid-cols-12">
          <div class="col-span-6 border-r p-2">
            <div class="text-xs mb-1">Client:</div>
            <div class="border-b text-sm p-1">Gladex Dynamic Resources</div>
          </div>
          <div class="col-span-6 p-2">
            <div class="text-xs mb-1">Requisition No:</div>
            <div class="border-b text-sm p-1 font-semibold">${requisition.requisitionNumber || 'N/A'}</div>
          </div>
        </div>

        <div class="grid grid-cols-12 border-t">
          <div class="col-span-6 border-r p-2">
            <div class="text-xs mb-1">Requested By:</div>
            <div class="border-b text-sm p-1">${requisition.requesterName || 'N/A'}</div>
          </div>
          <div class="col-span-6 p-2">
            <div class="text-xs mb-1">Department:</div>
            <div class="border-b text-sm p-1">${requisition.requesterDepartment || 'N/A'}</div>
          </div>
        </div>

        <div class="grid grid-cols-12 border-t">
          <div class="col-span-6 border-r p-2">
            <div class="text-xs mb-1">Project Title:</div>
            <div class="border-b text-sm p-1">${requisition.purpose || 'N/A'}</div>
          </div>
          <div class="col-span-3 border-r p-2">
            <div class="text-xs mb-1">Project Job No:</div>
            <div class="border-b text-sm p-1">-</div>
          </div>
          <div class="col-span-3 p-2">
            <div class="text-xs mb-1">Currency:</div>
            <div class="border-b text-sm p-1">NGN</div>
          </div>
        </div>

        <!-- Table Header -->
        <div class="grid grid-cols-12 border-t bg-gray-100">
          <div class="col-span-1 border-r p-2 text-center text-xs font-bold">S/N</div>
          <div class="col-span-5 border-r p-2 text-xs font-bold">ITEM DESCRIPTION</div>
          <div class="col-span-1 border-r p-2 text-center text-xs font-bold">QTY</div>
          <div class="col-span-2 border-r p-2 text-center text-xs font-bold">UNIT COST (NGN)</div>
          <div class="col-span-3 p-2 text-center text-xs font-bold">AMOUNT (NGN)</div>
        </div>

        <!-- Items -->
        ${itemsHtml}

        <!-- Add empty rows to fill space -->
        ${Array.from({ length: Math.max(0, 10 - (requisition.items?.length || 0)) }, (_, i) => `
          <div class="grid grid-cols-12 border-b">
            <div class="col-span-1 border-r p-2 text-center text-sm">${(requisition.items?.length || 0) + i + 1}</div>
            <div class="col-span-5 border-r p-2 text-sm">&nbsp;</div>
            <div class="col-span-1 border-r p-2 text-center text-sm">&nbsp;</div>
            <div class="col-span-2 border-r p-2 text-right text-sm">&nbsp;</div>
            <div class="col-span-3 p-2 text-right text-sm">&nbsp;</div>
          </div>
        `).join('')}

        <!-- Total -->
        <div class="grid grid-cols-12 border-t-2 bg-gray-50">
          <div class="col-span-9 border-r p-2 text-right text-sm font-bold">TOTAL:</div>
          <div class="col-span-3 p-2 text-right text-sm font-bold">${formatCurrency(requisition.totalAmount || 0)}</div>
        </div>

        <!-- Approval Section -->
        <div class="grid grid-cols-12 border-t-2">
          <div class="col-span-4 border-r p-4 text-center">
            <div class="text-xs font-bold mb-4">REQUESTED BY</div>
            <div class="mb-4" style="height: 40px;"></div>
            <div class="border-t text-xs">
              <div>${requisition.requesterName || 'N/A'}</div>
              <div>Date: ${formatDate(requisition.createdAt || new Date().toISOString())}</div>
            </div>
          </div>
          <div class="col-span-4 border-r p-4 text-center">
            <div class="text-xs font-bold mb-4">REVIEWED BY (PROCUREMENT)</div>
            <div class="mb-4" style="height: 40px;"></div>
            <div class="border-t text-xs">
              <div>${requisition.procurementApprovedBy || 'Pending'}</div>
              <div>Date: ${requisition.procurementApprovedAt ? formatDate(requisition.procurementApprovedAt) : 'Pending'}</div>
            </div>
          </div>
          <div class="col-span-4 p-4 text-center">
            <div class="text-xs font-bold mb-4">APPROVED BY (ACCOUNTS)</div>
            <div class="mb-4" style="height: 40px;"></div>
            <div class="border-t text-xs">
              <div>${requisition.accountApprovedBy || 'Pending'}</div>
              <div>Date: ${requisition.accountApprovedAt ? formatDate(requisition.accountApprovedAt) : 'Pending'}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-4 text-center text-xs">
        <p>Gladex Dynamic Resources Limited - Requisition Management System</p>
        <p>Generated on ${new Date().toLocaleString('en-NG')}</p>
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
