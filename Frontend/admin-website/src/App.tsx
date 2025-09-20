import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import { Toaster } from 'sonner'
import './App.css'
import { AuthProvider, useAuth } from './features/auth/components/AuthContext'
import LoginPage from './features/auth/pages/LoginPage'
import Dashboard from './features/dashboard/pages/Dashboard'

const queryClient = new QueryClient()

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  
  if (isLoading) {
    return <div>Loading...</div>
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  return <>{children}</>
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard/*" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-background">
            <AppRoutes />
            <Toaster />
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
