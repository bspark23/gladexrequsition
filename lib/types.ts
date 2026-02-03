export type Department =
  | 'Business Department'
  | 'Human Resources / Administration'
  | 'Accounts'
  | 'Procurement'
  | 'Quality Assurance (QA)'
  | 'Health, Safety & Environment (HSE)'
  | 'Quality Control (QC)'
  | 'Calibration & Testing'
  | 'Maintenance'
  | 'Engineering Department'
  | 'Project Department'
  | 'Operations'
  | 'Welding and Fabrication'
  | 'Managing Director'

export const DEPARTMENTS: Department[] = [
  'Business Department',
  'Human Resources / Administration',
  'Accounts',
  'Procurement',
  'Quality Assurance (QA)',
  'Health, Safety & Environment (HSE)',
  'Quality Control (QC)',
  'Calibration & Testing',
  'Maintenance',
  'Engineering Department',
  'Project Department',
  'Operations',
  'Welding and Fabrication',
]

// MD Department is separate and not in the regular departments list
export const MD_DEPARTMENT: Department = 'Managing Director'

export type RequisitionStatus = 'Pending Procurement' | 'Pending Account' | 'Approved'

export type UserRole = 'staff' | 'md'

export interface User {
  id: string
  name: string
  email: string
  department: Department
  role: UserRole
  isActive: boolean
  createdAt: string
}

export interface RequisitionItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

export interface Requisition {
  id: string
  requisitionNumber: string
  requesterId: string
  requesterName: string
  requesterDepartment: Department
  items: RequisitionItem[]
  totalAmount: number
  status: RequisitionStatus
  purpose: string
  createdAt: string
  updatedAt: string
  procurementApprovedBy?: string
  procurementApprovedAt?: string
  accountApprovedBy?: string
  accountApprovedAt?: string
}

export interface ActivityLogEntry {
  id: string
  action: string
  userId: string
  userName: string
  requisitionId?: string
  requisitionNumber?: string
  timestamp: string
  details?: string
}
