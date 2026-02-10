'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy } from 'firebase/firestore'
import { db } from './firebase'
import type { User, Requisition, ActivityLogEntry, Department, RequisitionStatus } from './types'

interface DataContextType {
  currentUser: User | null
  users: User[]
  requisitions: Requisition[]
  activityLog: ActivityLogEntry[]
  setCurrentUser: (user: User | null) => void
  addUser: (user: Omit<User, 'id' | 'createdAt'>) => Promise<User>
  updateUser: (id: string, updates: Partial<User>) => Promise<void>
  deleteUser: (id: string) => Promise<void>
  addRequisition: (requisition: Omit<Requisition, 'id' | 'requisitionNumber' | 'createdAt' | 'updatedAt'>) => Promise<Requisition>
  updateRequisition: (id: string, updates: Partial<Requisition>) => Promise<void>
  deleteRequisition: (id: string) => Promise<void>
  approveAsProcurement: (requisitionId: string, approverId: string, approverName: string) => Promise<void>
  approveAsAccount: (requisitionId: string, approverId: string, approverName: string) => Promise<void>
  addActivity: (entry: Omit<ActivityLogEntry, 'id' | 'timestamp'>) => Promise<void>
  canApproveProcurement: (user: User | null) => boolean
  canApproveAccount: (user: User | null) => boolean
}

const DataContext = createContext<DataContextType | null>(null)

async function generateRequisitionNumber(db: any, requisitions: Requisition[]): Promise<string> {
  const year = new Date().getFullYear()
  
  // Find the highest number used so far by parsing all existing requisition numbers
  let maxNumber = 0
  
  requisitions.forEach(req => {
    // Extract number from format: GDRL-PL-MRF-XXXX or REQ-YYYY-XXXX
    const match = req.requisitionNumber.match(/(\d+)$/)
    if (match) {
      const num = parseInt(match[1], 10)
      if (num > maxNumber) {
        maxNumber = num
      }
    }
  })
  
  // Next number is maxNumber + 1
  const nextNumber = (maxNumber + 1).toString().padStart(2, '0')
  return `GDRL-PL-MRF-${nextNumber}`
}

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUserState] = useState<User | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [requisitions, setRequisitions] = useState<Requisition[]>([])
  const [activityLog, setActivityLog] = useState<ActivityLogEntry[]>([])
  const [isInitialized, setIsInitialized] = useState(false)

  // Load current user from localStorage (set by AuthContext)
  useEffect(() => {
    if (typeof window === 'undefined') return

    const storedUser = localStorage.getItem('gladex_current_user')
    console.log('DataContext - Loading user from localStorage:', storedUser)
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        console.log('DataContext - Parsed user:', parsedUser)
        setCurrentUserState(parsedUser)
      } catch (error) {
        console.error('Error parsing stored user:', error)
      }
    }

    // Listen for changes to current user
    const handleStorageChange = (e: StorageEvent) => {
      console.log('DataContext - Storage change event:', e.key, e.newValue)
      if (e.key === 'gladex_current_user') {
        if (e.newValue) {
          try {
            const parsedUser = JSON.parse(e.newValue)
            console.log('DataContext - Setting user from storage event:', parsedUser)
            setCurrentUserState(parsedUser)
          } catch (error) {
            console.error('Error parsing user from storage event:', error)
          }
        } else {
          console.log('DataContext - Clearing user from storage event')
          setCurrentUserState(null)
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  // Listen to Firebase collections
  useEffect(() => {
    const unsubscribes: (() => void)[] = []

    // Listen to users collection
    const usersQuery = query(collection(db, 'system_users'), orderBy('createdAt', 'desc'))
    const unsubscribeUsers = onSnapshot(usersQuery, (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as User[]
      setUsers(usersData)
    }, (error) => {
      console.error('Error listening to users:', error)
    })
    unsubscribes.push(unsubscribeUsers)

    // Listen to requisitions collection
    const requisitionsQuery = query(collection(db, 'requisitions'), orderBy('createdAt', 'desc'))
    const unsubscribeRequisitions = onSnapshot(requisitionsQuery, (snapshot) => {
      const requisitionsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Requisition[]
      setRequisitions(requisitionsData)
    }, (error) => {
      console.error('Error listening to requisitions:', error)
    })
    unsubscribes.push(unsubscribeRequisitions)

    // Listen to activity log collection
    const activityQuery = query(collection(db, 'activity_log'), orderBy('timestamp', 'desc'))
    const unsubscribeActivity = onSnapshot(activityQuery, (snapshot) => {
      const activityData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ActivityLogEntry[]
      setActivityLog(activityData.slice(0, 100)) // Keep last 100 entries
    }, (error) => {
      console.error('Error listening to activity log:', error)
    })
    unsubscribes.push(unsubscribeActivity)

    setIsInitialized(true)

    return () => {
      unsubscribes.forEach(unsubscribe => unsubscribe())
    }
  }, [])

  const setCurrentUser = useCallback((user: User | null) => {
    setCurrentUserState(user)
    if (user) {
      localStorage.setItem('gladex_current_user', JSON.stringify(user))
    } else {
      localStorage.removeItem('gladex_current_user')
    }
  }, [])

  const addUser = useCallback(async (userData: Omit<User, 'id' | 'createdAt'>): Promise<User> => {
    try {
      const newUser = {
        ...userData,
        createdAt: new Date().toISOString(),
      }
      const docRef = await addDoc(collection(db, 'system_users'), newUser)
      return { id: docRef.id, ...newUser }
    } catch (error) {
      console.error('Error adding user:', error)
      throw error
    }
  }, [])

  const updateUser = useCallback(async (id: string, updates: Partial<User>) => {
    try {
      await updateDoc(doc(db, 'system_users', id), updates)
    } catch (error) {
      console.error('Error updating user:', error)
      throw error
    }
  }, [])

  const deleteUser = useCallback(async (id: string) => {
    try {
      await deleteDoc(doc(db, 'system_users', id))
    } catch (error) {
      console.error('Error deleting user:', error)
      throw error
    }
  }, [])

  const addActivity = useCallback(async (entry: Omit<ActivityLogEntry, 'id' | 'timestamp'>) => {
    try {
      const newEntry = {
        ...entry,
        timestamp: new Date().toISOString(),
      }
      await addDoc(collection(db, 'activity_log'), newEntry)
    } catch (error) {
      console.error('Error adding activity:', error)
      throw error
    }
  }, [])

  const addRequisition = useCallback(async (
    requisitionData: Omit<Requisition, 'id' | 'requisitionNumber' | 'createdAt' | 'updatedAt'>
  ): Promise<Requisition> => {
    try {
      console.log('DataContext - addRequisition called with:', requisitionData)
      
      const now = new Date().toISOString()
      
      // Generate sequential requisition number based on existing requisitions
      const requisitionNumber = await generateRequisitionNumber(db, requisitions)
      
      const newRequisition = {
        ...requisitionData,
        requisitionNumber,
        createdAt: now,
        updatedAt: now,
      }
      
      console.log('DataContext - About to save to Firebase:', newRequisition)
      
      const docRef = await addDoc(collection(db, 'requisitions'), newRequisition)
      const requisition = { id: docRef.id, ...newRequisition }
      
      console.log('DataContext - Saved to Firebase successfully:', requisition)
      
      // Add activity log
      await addActivity({
        action: 'Created Requisition',
        userId: requisitionData.requesterId,
        userName: requisitionData.requesterName,
        requisitionId: docRef.id,
        requisitionNumber: newRequisition.requisitionNumber,
        details: `Created requisition for ${(requisitionData.totalAmount || 0).toLocaleString('en-NG', { style: 'currency', currency: 'NGN' })}`,
      })
      
      console.log('DataContext - Activity log added, returning requisition')
      return requisition
    } catch (error) {
      console.error('Error adding requisition:', error)
      throw error
    }
  }, [addActivity, requisitions])

  const updateRequisition = useCallback(async (id: string, updates: Partial<Requisition>) => {
    try {
      const updateData = { ...updates, updatedAt: new Date().toISOString() }
      await updateDoc(doc(db, 'requisitions', id), updateData)
    } catch (error) {
      console.error('Error updating requisition:', error)
      throw error
    }
  }, [])

  const deleteRequisition = useCallback(async (id: string) => {
    try {
      const requisition = requisitions.find(r => r.id === id)
      await deleteDoc(doc(db, 'requisitions', id))
      
      if (requisition && currentUser) {
        await addActivity({
          action: 'Deleted Requisition',
          userId: currentUser.id,
          userName: currentUser.name,
          requisitionId: id,
          requisitionNumber: requisition.requisitionNumber,
          details: `Deleted requisition ${requisition.requisitionNumber}`,
        })
      }
    } catch (error) {
      console.error('Error deleting requisition:', error)
      throw error
    }
  }, [requisitions, currentUser, addActivity])

  const canApproveProcurement = useCallback((user: User | null): boolean => {
    if (!user) return false
    return user.role === 'md' || user.department === 'Procurement'
  }, [])

  const canApproveAccount = useCallback((user: User | null): boolean => {
    if (!user) return false
    return user.role === 'md' || user.department === 'Accounts'
  }, [])

  const approveAsProcurement = useCallback(async (requisitionId: string, approverId: string, approverName: string) => {
    try {
      console.log('DataContext - approveAsProcurement called:', { requisitionId, approverId, approverName })
      
      const requisition = requisitions.find(r => r.id === requisitionId)
      if (!requisition) {
        console.error('DataContext - Requisition not found:', requisitionId)
        throw new Error('Requisition not found')
      }

      console.log('DataContext - Found requisition:', requisition)
      console.log('DataContext - Current status:', requisition.status)

      const updates = {
        status: 'Pending Account' as RequisitionStatus,
        procurementApprovedBy: approverName,
        procurementApprovedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      console.log('DataContext - Updating with:', updates)

      await updateDoc(doc(db, 'requisitions', requisitionId), updates)

      console.log('DataContext - Firebase update completed')

      await addActivity({
        action: 'Procurement Approved',
        userId: approverId,
        userName: approverName,
        requisitionId,
        requisitionNumber: requisition.requisitionNumber,
        details: `Approved procurement for ${requisition.requisitionNumber}`,
      })

      console.log('DataContext - Activity log added')
    } catch (error) {
      console.error('Error approving procurement:', error)
      throw error
    }
  }, [requisitions, addActivity])

  const approveAsAccount = useCallback(async (requisitionId: string, approverId: string, approverName: string) => {
    try {
      console.log('DataContext - approveAsAccount called:', { requisitionId, approverId, approverName })
      
      const requisition = requisitions.find(r => r.id === requisitionId)
      if (!requisition) {
        console.error('DataContext - Requisition not found:', requisitionId)
        throw new Error('Requisition not found')
      }

      console.log('DataContext - Found requisition:', requisition)
      console.log('DataContext - Current status:', requisition.status)

      const updates = {
        status: 'Approved' as RequisitionStatus,
        accountApprovedBy: approverName,
        accountApprovedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      console.log('DataContext - Updating with:', updates)

      await updateDoc(doc(db, 'requisitions', requisitionId), updates)

      console.log('DataContext - Firebase update completed')

      await addActivity({
        action: 'Account Approved',
        userId: approverId,
        userName: approverName,
        requisitionId,
        requisitionNumber: requisition.requisitionNumber,
        details: `Final approval for ${requisition.requisitionNumber}`,
      })

      console.log('DataContext - Activity log added')
    } catch (error) {
      console.error('Error approving account:', error)
      throw error
    }
  }, [requisitions, addActivity])

  if (!isInitialized) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <DataContext.Provider
      value={{
        currentUser,
        users,
        requisitions,
        activityLog,
        setCurrentUser,
        addUser,
        updateUser,
        deleteUser,
        addRequisition,
        updateRequisition,
        deleteRequisition,
        approveAsProcurement,
        approveAsAccount,
        addActivity,
        canApproveProcurement,
        canApproveAccount,
      }}
    >
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error('useData must be used within a DataProvider')
  }
  return context
}
