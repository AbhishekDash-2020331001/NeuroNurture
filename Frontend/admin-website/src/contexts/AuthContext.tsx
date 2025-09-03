import React, { createContext, useContext, useState, useEffect } from 'react'

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
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Check if admin is already logged in (from localStorage)
    const storedAdmin = localStorage.getItem('admin')
    if (storedAdmin) {
      try {
        const adminData = JSON.parse(storedAdmin)
        setAdmin(adminData)
        setIsAuthenticated(true)
      } catch (error) {
        localStorage.removeItem('admin')
      }
    }
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // TODO: Replace with actual API call
      // For now, using mock authentication
      if (email === 'admin@neuronurture.com' && password === 'admin123') {
        const adminData: Admin = {
          id: '1',
          email: 'admin@neuronurture.com',
          name: 'System Administrator',
          role: 'admin'
        }
        
        setAdmin(adminData)
        setIsAuthenticated(true)
        localStorage.setItem('admin', JSON.stringify(adminData))
        return true
      }
      return false
    } catch (error) {
      console.error('Login error:', error)
      return false
    }
  }

  const logout = () => {
    setAdmin(null)
    setIsAuthenticated(false)
    localStorage.removeItem('admin')
  }

  return (
    <AuthContext.Provider value={{ admin, isAuthenticated, login, logout }}>
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
