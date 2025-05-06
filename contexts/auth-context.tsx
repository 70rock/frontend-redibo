"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { login, getProfile, logout } from "@/lib/api"

type User = {
  id: string
  email: string
  name?: string | null
}

type AuthContextType = {
  user: User | null
  isLoading: boolean
  error: string | null
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, name?: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  error: null,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    async function loadUserFromSession() {
      try {
        console.log("Cargando usuario desde la sesión...")
        setError(null)
        const data = await getProfile()
        console.log("Datos de usuario recibidos:", data)
        setUser(data.user || null)
      } catch (error: any) {
        console.error("Error getting session:", error)
        setUser(null)
        setError(error.message || "Error al cargar la sesión")
      } finally {
        setIsLoading(false)
      }
    }

    loadUserFromSession()
  }, [])

  const signIn = async (email: string, password: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await login(email, password)
      setUser(data.user)
      router.push("/")
    } catch (error: any) {
      console.error("Error signing in:", error)
      setError(error.message || "Error al iniciar sesión")
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const signUp = async (email: string, password: string, name?: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      setUser(data.user)
      router.push("/")
    } catch (error: any) {
      console.error("Error signing up:", error)
      setError(error.message || "Error al registrarse")
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const signOut = async () => {
    setError(null)
    try {
      await logout()
      setUser(null)
      router.push("/login")
    } catch (error: any) {
      console.error("Error signing out:", error)
      setError(error.message || "Error al cerrar sesión")
    }
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, error, signIn, signUp, signOut }}>{children}</AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
