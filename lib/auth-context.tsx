'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth'
import { doc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore'
import { auth, db } from './firebase'
import type { User, Department } from './types'

interface AuthUser {
  id: string
  email: string
  name: string
  department: Department
  whatsappNumber?: string
  role: 'staff' | 'md'
  isActive: boolean
  createdAt: string
}

interface SignupData {
  fullName: string
  email: string
  password: string
  whatsappNumber: string
  department: Department
}

interface MDSignupData {
  email: string
  password: string
  accessCode: string
}

interface LoginData {
  email: string
  password: string
}

interface AuthContextType {
  currentUser: AuthUser | null
  isLoading: boolean
  isAuthenticated: boolean
  signupStaff: (data: SignupData) => Promise<{ success: boolean; error?: string }>
  signupMD: (data: MDSignupData) => Promise<{ success: boolean; error?: string }>
  login: (data: LoginData, isMD?: boolean) => Promise<{ success: boolean; error?: string; redirectTo?: string }>
  logout: () => Promise<void>
  checkMDExists: () => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | null>(null)

const STORAGE_KEYS = {
  MD_ACCESS_CODE: process.env.NEXT_PUBLIC_MD_ACCESS_CODE || 'GLADEX-MD-2026',
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Listen for authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in, get their profile from Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid))
          if (userDoc.exists()) {
            const userData = userDoc.data() as AuthUser
            console.log('AuthContext - Setting user from Firebase:', userData)
            setCurrentUser(userData)
            
            // Also set in localStorage for DataContext compatibility
            const userForStorage = {
              id: userData.id,
              name: userData.name,
              email: userData.email,
              department: userData.department,
              role: userData.role,
              isActive: userData.isActive,
              createdAt: userData.createdAt,
            }
            console.log('AuthContext - Setting user in localStorage:', userForStorage)
            localStorage.setItem('gladex_current_user', JSON.stringify(userForStorage))
          }
        } catch (error) {
          console.error('Error fetching user data:', error)
        }
      } else {
        // User is signed out
        setCurrentUser(null)
        localStorage.removeItem('gladex_current_user')
      }
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const checkMDExists = useCallback(async (): Promise<boolean> => {
    try {
      const usersRef = collection(db, 'users')
      const q = query(usersRef, where('role', '==', 'md'))
      const querySnapshot = await getDocs(q)
      return !querySnapshot.empty
    } catch (error) {
      console.error('Error checking MD existence:', error)
      return false
    }
  }, [])

  const signupStaff = useCallback(async (data: SignupData): Promise<{ success: boolean; error?: string }> => {
    try {
      // Create Firebase user
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password)
      const firebaseUser = userCredential.user

      // Create user profile in Firestore
      const newUser: AuthUser = {
        id: firebaseUser.uid,
        email: data.email.toLowerCase(),
        name: data.fullName,
        department: data.department,
        whatsappNumber: data.whatsappNumber,
        role: 'staff',
        isActive: true,
        createdAt: new Date().toISOString(),
      }

      await setDoc(doc(db, 'users', firebaseUser.uid), newUser)

      // Also add to the data context users collection for the requisition system
      await setDoc(doc(db, 'system_users', firebaseUser.uid), {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        department: newUser.department,
        role: newUser.role,
        isActive: true,
        createdAt: newUser.createdAt,
      })

      return { success: true }
    } catch (error: any) {
      console.error('Signup error:', error)
      return { 
        success: false, 
        error: error.code === 'auth/email-already-in-use' 
          ? 'An account with this email already exists'
          : 'Failed to create account. Please try again.'
      }
    }
  }, [])

  const signupMD = useCallback(async (data: MDSignupData): Promise<{ success: boolean; error?: string }> => {
    try {
      // Verify access code (still required for security)
      if (data.accessCode !== STORAGE_KEYS.MD_ACCESS_CODE) {
        return { success: false, error: 'Invalid MD Access Code. Please contact system administrator.' }
      }

      // Create Firebase user
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password)
      const firebaseUser = userCredential.user

      // Create MD profile in Firestore
      const newMD: AuthUser = {
        id: firebaseUser.uid,
        email: data.email.toLowerCase(),
        name: 'Managing Director',
        department: 'Managing Director',
        role: 'md',
        isActive: true,
        createdAt: new Date().toISOString(),
      }

      await setDoc(doc(db, 'users', firebaseUser.uid), newMD)

      // Also add to system_users collection
      await setDoc(doc(db, 'system_users', firebaseUser.uid), {
        id: newMD.id,
        name: newMD.name,
        email: newMD.email,
        department: newMD.department,
        role: newMD.role,
        isActive: true,
        createdAt: newMD.createdAt,
      })

      return { success: true }
    } catch (error: any) {
      console.error('MD signup error:', error)
      return { 
        success: false, 
        error: error.code === 'auth/email-already-in-use' 
          ? 'An account with this email already exists'
          : 'Failed to create MD account. Please try again.'
      }
    }
  }, [])

  const login = useCallback(async (
    data: LoginData, 
    isMD = false
  ): Promise<{ success: boolean; error?: string; redirectTo?: string }> => {
    try {
      // Sign in with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password)
      const firebaseUser = userCredential.user

      // Get user profile from Firestore
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid))
      if (!userDoc.exists()) {
        await signOut(auth)
        return { success: false, error: 'User profile not found. Please contact administrator.' }
      }

      const user = userDoc.data() as AuthUser
      console.log('Login - User data from Firestore:', user)
      console.log('Login - isMD flag:', isMD)
      console.log('Login - User role:', user.role)
      console.log('Login - User email:', user.email)

      // Verify role matches login type
      if (isMD && user.role !== 'md') {
        console.log('Login - MD login attempted but user role is not md')
        await signOut(auth)
        return { success: false, error: 'No MD account found with this email' }
      }
      if (!isMD && user.role === 'md') {
        console.log('Login - Staff login attempted but user role is md')
        await signOut(auth)
        return { success: false, error: 'This email is registered as MD. Please use the MD portal to sign in.' }
      }

      // Check if account is active
      if (!user.isActive) {
        await signOut(auth)
        return { success: false, error: 'Your account has been disabled. Please contact administrator.' }
      }

      console.log('Login - Successful login, determining redirect path')
      console.log('Login - User role for redirect:', user.role)
      const redirectTo = user.role === 'md' ? '/md/dashboard' : '/staff/dashboard'
      console.log('Login - Redirect path:', redirectTo)
      return { success: true, redirectTo }
    } catch (error: any) {
      console.error('Login error:', error)
      let errorMessage = 'Login failed. Please try again.'
      
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMessage = 'Invalid email or password'
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later.'
      }
      
      return { success: false, error: errorMessage }
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await signOut(auth)
      // Firebase auth state listener will handle clearing currentUser and localStorage
    } catch (error) {
      console.error('Logout error:', error)
    }
  }, [])

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isLoading,
        isAuthenticated: !!currentUser,
        signupStaff,
        signupMD,
        login,
        logout,
        checkMDExists,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
