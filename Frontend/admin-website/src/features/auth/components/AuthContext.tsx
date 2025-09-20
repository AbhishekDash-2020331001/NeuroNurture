import React, { createContext, useContext, useEffect, useState } from 'react'
import { adminAuthService } from '../../../shared/services/adminAuthService'

interface Admin {
  id: string
  email: string
  name: string
  role: 'admin'
}

interface AuthContextType {
  admin: Admin | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  

  useEffect(() => {
    // Check if admin is already logged in by validating session
    checkSession()

    // Set up periodic session check (every 5 minutes)
    const sessionCheckInterval = setInterval(() => {
      if (isAuthenticated) {
        checkSession()
      }
    }, 5 * 60 * 1000) // 5 minutes

    return () => clearInterval(sessionCheckInterval)
  }, [isAuthenticated])

  const checkSession = async () => {
    try {
      const token = adminAuthService.getToken()
      if (!token) {
        setAdmin(null)
        setIsAuthenticated(false)
        return
      }

      // Verify token with admin service
      const adminData = await adminAuthService.getCurrentAdmin(token)
      
      // Store adminId in localStorage
      localStorage.setItem('adminId', adminData.adminId.toString())
      
      const admin: Admin = {
        id: adminData.adminId.toString(),
        email: adminData.email,
        name: adminData.username,
        role: 'admin'
      }
      setAdmin(admin)
      setIsAuthenticated(true)
    } catch (error) {
      console.error('Session check error:', error)
      adminAuthService.removeToken()
      localStorage.removeItem('adminId')
      setAdmin(null)
      setIsAuthenticated(false)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const loginData = await adminAuthService.login(email, password)
      
      // Store token
      adminAuthService.setToken(loginData.token)
      
      // Store adminId in localStorage
      localStorage.setItem('adminId', loginData.adminId.toString())
      
      const admin: Admin = {
        id: loginData.adminId.toString(),
        email: loginData.email,
        name: loginData.username,
        role: 'admin'
      }
      
      setAdmin(admin)
      setIsAuthenticated(true)
      return true
    } catch (error) {
      console.error('Login error:', error)
      return false
    }
  }

  const logout = async () => {
    try {
      // Remove token and adminId from localStorage
      adminAuthService.removeToken()
      localStorage.removeItem('adminId')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Clear local state
      setAdmin(null)
      setIsAuthenticated(false)
    }
  }

  return (
    <AuthContext.Provider value={{ admin, isAuthenticated, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
