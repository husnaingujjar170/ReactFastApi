"use client"

import { createContext, useState, useEffect, useContext } from "react"
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth"
import { auth } from "../firebase" 

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true) 
  const [error, setError] = useState(null)

  useEffect(() => {
    console.log("AuthContext: Setting up onAuthStateChanged listener.")
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      console.log("AuthContext: onAuthStateChanged fired. User:", firebaseUser ? firebaseUser.uid : "null")
      setUser(firebaseUser)
      setLoading(false) 
      if (!firebaseUser) {
        setError(null) 
      }
    })

    return () => {
      console.log("AuthContext: Cleaning up onAuthStateChanged listener.")
      unsubscribe() 
    }
  }, [])

  const signup = async (username, email, password) => {
    try {
      setError(null)
      setLoading(true)
      console.log("AuthContext: Attempting signup for", email)

      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      console.log("AuthContext: Firebase user created:", userCredential.user.uid)

      await updateProfile(userCredential.user, {
        displayName: username,
      })
      console.log("AuthContext: Firebase user profile updated.")

      await registerUserInBackend(email, password, username)
      console.log("AuthContext: Backend registration initiated.")

      return true 
    } catch (error) {
      setError(error.message)
      console.error("AuthContext: Signup error:", error)
      throw error 
    } finally { 
      console.log("AuthContext: Signup operation finished.")
    }
  }

  const login = async (email, password) => {
    try {
      setError(null)
      setLoading(true) 
      console.log("AuthContext: Attempting login for", email)

      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      console.log("AuthContext: Firebase user signed in:", userCredential.user.uid)

      await verifyUserInBackend(email, password)
      console.log("AuthContext: Backend verification initiated.")

      return true 
    } catch (error) {
      setError(error.message)
      console.error("AuthContext: Login error:", error)
      throw error 
    } finally {
      console.log("AuthContext: Login operation finished.")
    }
  }

  const logout = async () => {
    try {
      setError(null)
      console.log("AuthContext: Attempting logout.")
      await signOut(auth)
      console.log("AuthContext: Firebase user logged out.")
    } catch (error) {
      setError(error.message)
      console.error("AuthContext: Logout error:", error)
      throw error 
    }
  }

  const getIdToken = async () => {
    if (user) {
      const token = await user.getIdToken()
      console.log("AuthContext: Fetched ID Token (first 10 chars):", token ? token.substring(0, 10) : "null")
      return token
    }
    console.log("AuthContext: No user found to get ID Token.")
    return null
  }

  const registerUserInBackend = async (email, password, username) => {
    try {
      console.log("AuthContext: Calling backend /auth/signup")
      const response = await fetch("http://localhost:8000/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, username }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: "Unknown backend error" }))
        throw new Error(errorData.detail || `Backend registration failed with status: ${response.status}`)
      }

      console.log("AuthContext: Backend signup successful.")
      return await response.json()
    } catch (error) {
      console.error("AuthContext: Backend registration error:", error)
    }
  }
  const verifyUserInBackend = async (email, password) => {
    try {
      console.log("AuthContext: Calling backend /auth/signin")
      const response = await fetch("http://localhost:8000/auth/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: "Unknown backend error" }))
        throw new Error(errorData.detail || `Backend verification failed with status: ${response.status}`)
      }

      console.log("AuthContext: Backend signin verification successful.")
      return await response.json()
    } catch (error) {
      console.error("AuthContext: Backend verification error:", error)
    }
  }

  const apiCall = async (url, options = {}) => {
    setError(null)
    console.log(`AuthContext: Initiating API call to ${url}`)

    try {
      const idToken = await getIdToken() 

      if (!idToken) {
        console.error("AuthContext: No ID token available for API call.")
        throw new Error("User not authenticated. Please sign in.")
      }

      const response = await fetch(`http://localhost:8000${url}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          "id-token": idToken, 
          ...options.headers, 
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error(`AuthContext: API call to ${url} failed. Status: ${response.status}`, errorData)
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log(`AuthContext: API call to ${url} successful. Response:`, data)
      return data
    } catch (err) {
      setError(err.message) 
      console.error("AuthContext: API call error caught:", err)
      throw err 
    } finally {
      console.log(`AuthContext: API call to ${url} finished.`)
    }
  }

  const value = {
    user,
    loading, 
    error, 
    signup,
    login,
    logout,
    getIdToken, 
    apiCall, 
    isAuthenticated: !!user, 
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}