"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import {
  type User,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from "firebase/auth"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"

type UserRole = "manager" | "worker"

interface UserData {
  uid: string
  email: string | null
  role: UserRole
  displayName: string | null
  photoURL: string | null
}

interface AuthContextType {
  user: UserData | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<UserData>
  signUp: (email: string, password: string, role: UserRole, name: string) => Promise<UserData>
  signInWithGoogle: (role?: UserRole) => Promise<UserData>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Get user data from Firestore
        const userDoc = await getDoc(doc(db, "users", firebaseUser.uid))

        if (userDoc.exists()) {
          const userData = userDoc.data() as Omit<UserData, "uid">
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            ...userData,
          })
        } else {
          // If user document doesn't exist, sign out
          await firebaseSignOut(auth)
          setUser(null)
        }
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const createUserDocument = async (user: User, role: UserRole, displayName?: string) => {
    await setDoc(doc(db, "users", user.uid), {
      email: user.email,
      role,
      displayName: displayName || user.displayName,
      photoURL: user.photoURL,
      createdAt: new Date().toISOString(),
    })

    return {
      uid: user.uid,
      email: user.email,
      role,
      displayName: displayName || user.displayName,
      photoURL: user.photoURL,
    }
  }

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const userDoc = await getDoc(doc(db, "users", userCredential.user.uid))

      if (!userDoc.exists()) {
        throw new Error("User data not found")
      }

      const userData = userDoc.data() as Omit<UserData, "uid">
      const user = {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: userCredential.user.displayName,
        photoURL: userCredential.user.photoURL,
        ...userData,
      }

      setUser(user)
      return user
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, role: UserRole, name: string) => {
    setLoading(true)
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const userData = await createUserDocument(userCredential.user, role, name)
      setUser(userData)
      return userData
    } finally {
      setLoading(false)
    }
  }

  const signInWithGoogle = async (role?: UserRole) => {
    setLoading(true)
    try {
      const provider = new GoogleAuthProvider()
      const userCredential = await signInWithPopup(auth, provider)

      // Check if user already exists
      const userDoc = await getDoc(doc(db, "users", userCredential.user.uid))

      if (userDoc.exists()) {
        const userData = userDoc.data() as Omit<UserData, "uid">
        const user = {
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          displayName: userCredential.user.displayName,
          photoURL: userCredential.user.photoURL,
          ...userData,
        }
        setUser(user)
        return user
      } else {
        // If role is not provided and user doesn't exist, throw error
        if (!role) {
          throw new Error("Role is required for new users")
        }

        // Create new user document
        const userData = await createUserDocument(userCredential.user, role)
        setUser(userData)
        return userData
      }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    setLoading(true)
    try {
      await firebaseSignOut(auth)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

