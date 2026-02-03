'use client'

import { useEffect, useState } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'

interface DebugUser {
  id: string
  email: string
  name: string
  role: string
  department: string
  isActive: boolean
}

export default function DebugPage() {
  const [users, setUsers] = useState<DebugUser[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersSnapshot = await getDocs(collection(db, 'users'))
        const usersData = usersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as DebugUser[]
        setUsers(usersData)
      } catch (error) {
        console.error('Error fetching users:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  if (loading) {
    return <div className="p-8">Loading users...</div>
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Debug: Users in Database</h1>
      <div className="space-y-4">
        {users.map(user => (
          <div key={user.id} className="border p-4 rounded">
            <p><strong>ID:</strong> {user.id}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Name:</strong> {user.name}</p>
            <p><strong>Role:</strong> <span className={user.role === 'md' ? 'text-red-600 font-bold' : 'text-blue-600'}>{user.role}</span></p>
            <p><strong>Department:</strong> {user.department}</p>
            <p><strong>Active:</strong> {user.isActive ? 'Yes' : 'No'}</p>
          </div>
        ))}
      </div>
      {users.length === 0 && (
        <p>No users found in database.</p>
      )}
    </div>
  )
}