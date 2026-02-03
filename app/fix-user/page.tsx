'use client'

import { useState } from 'react'
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function FixUserPage() {
  const [email, setEmail] = useState('')
  const [newRole, setNewRole] = useState<'staff' | 'md'>('staff')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const fixUserRole = async () => {
    if (!email) {
      setMessage('Please enter an email')
      return
    }

    setLoading(true)
    setMessage('')

    try {
      // Find user by email
      const usersSnapshot = await getDocs(collection(db, 'users'))
      const user = usersSnapshot.docs.find(doc => 
        doc.data().email?.toLowerCase() === email.toLowerCase()
      )

      if (!user) {
        setMessage('User not found')
        return
      }

      // Update user role
      await updateDoc(doc(db, 'users', user.id), {
        role: newRole
      })

      // Also update in system_users if exists
      try {
        await updateDoc(doc(db, 'system_users', user.id), {
          role: newRole
        })
      } catch (e) {
        // system_users doc might not exist, that's ok
      }

      setMessage(`Successfully updated ${email} to role: ${newRole}`)
    } catch (error) {
      console.error('Error updating user:', error)
      setMessage('Error updating user role')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Fix User Role</h1>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Email:</label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="user@example.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">New Role:</label>
          <select 
            value={newRole} 
            onChange={(e) => setNewRole(e.target.value as 'staff' | 'md')}
            className="w-full p-2 border rounded"
          >
            <option value="staff">Staff</option>
            <option value="md">MD</option>
          </select>
        </div>
        <Button 
          onClick={fixUserRole} 
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Updating...' : 'Fix User Role'}
        </Button>
        {message && (
          <div className={`p-3 rounded ${message.includes('Successfully') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message}
          </div>
        )}
      </div>
    </div>
  )
}