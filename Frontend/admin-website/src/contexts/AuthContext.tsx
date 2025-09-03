import React, { createContext, useContext, useEffect, useState } from 'react'

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

const JWT_SERVICE_URL = 'http://localhost:8080'

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
      const response = await fetch(`${JWT_SERVICE_URL}/auth/session`, {
        credentials: 'include'
      })
      
      if (response.ok) {
        const isAuthenticated = await response.json()
        if (isAuthenticated) {
          // Get user info to verify it's an admin
          const userResponse = await fetch(`${JWT_SERVICE_URL}/auth/me?format=json`, {
            credentials: 'include'
          })
          
          if (userResponse.ok) {
            const userData = await userResponse.json()
            if (userData.role === 'ADMIN') {
              const adminData: Admin = {
                id: userData.id || '1',
                email: userData.email,
                name: userData.name || 'System Administrator',
                role: 'admin'
              }
              setAdmin(adminData)
              setIsAuthenticated(true)
            } else {
              // User is authenticated but not an admin
              console.warn('Authenticated user is not an admin:', userData.role)
              setAdmin(null)
              setIsAuthenticated(false)
            }
          } else {
            // Session exists but user info fetch failed
            console.warn('Failed to fetch user info during session check')
            setAdmin(null)
            setIsAuthenticated(false)
          }
        } else {
          // Not authenticated
          setAdmin(null)
          setIsAuthenticated(false)
        }
      } else {
        // Session check failed
        setAdmin(null)
        setIsAuthenticated(false)
      }
    } catch (error) {
      console.error('Session check error:', error)
      setAdmin(null)
      setIsAuthenticated(false)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch(`${JWT_SERVICE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ username: email, password })
      })

      if (response.ok) {
        const userData = await response.json()
        
        // Verify this is an admin user
        if (userData.role === 'ADMIN') {
          const adminData: Admin = {
            id: userData.id || '1',
            email: userData.email,
            name: userData.name || 'System Administrator',
            role: 'admin'
          }
          
          setAdmin(adminData)
          setIsAuthenticated(true)
          return true
        } else {
          // Not an admin user
          return false
        }
      }
      return false
    } catch (error) {
      console.error('Login error:', error)
      return false
    }
  }

  const logout = async () => {
    try {
      // Call backend logout endpoint
      await fetch(`${JWT_SERVICE_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Clear local state regardless of backend response
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
