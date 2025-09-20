import {
    CreditCard,
    Home,
    LogOut,
    MessageSquare,
    School,
    Shield,
    Stethoscope,
    UserCheck,
    Users
} from 'lucide-react'
import { useState } from 'react'
import { Link, Route, Routes, useLocation } from 'react-router-dom'
import { Button } from '../../../components/common/button'
import Assistant from '../../assistant/components/Assistant'
import { useAuth } from '../../auth/components/AuthContext'
import SubscriptionManagement from '../../subscriptions/components/SubscriptionManagement'
import TicketManagement from '../../tickets/components/TicketManagement'
import PendingRequests from '../../users/components/PendingRequests'
import UserManagement from '../../users/components/UserManagement'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'User Management', href: '/dashboard/users', icon: Users },
  { name: 'Pending Requests', href: '/dashboard/pending', icon: UserCheck },
  { name: 'Subscriptions', href: '/dashboard/subscriptions', icon: CreditCard },
  { name: 'Tickets', href: '/dashboard/tickets', icon: MessageSquare },
]

export default function Dashboard() {
  const { admin, logout, isLoading } = useAuth()
  const location = useLocation()
  const [isAssistantOpen, setIsAssistantOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const toggleAssistant = () => {
    setIsAssistantOpen(!isAssistantOpen)
  }

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="px-2 sm:px-4 lg:px-6">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">
                NeuroNurture Admin
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Welcome, {admin?.name}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="px-2 sm:px-4 lg:px-6 py-8">
        <div className="flex space-x-6">
          {/* Sidebar */}
          <aside className="w-56 flex-shrink-0">
            <nav className="space-y-2">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive
                        ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            <Routes>
              <Route path="/" element={<DashboardHome />} />
              <Route path="/users" element={<UserManagement />} />
              <Route path="/pending" element={<PendingRequests />} />
              <Route path="/subscriptions" element={<SubscriptionManagement />} />
              <Route path="/tickets" element={<TicketManagement />} />
            </Routes>
          </main>
        </div>
      </div>

      {/* AI Assistant */}
      <Assistant 
        isOpen={isAssistantOpen} 
        onToggle={toggleAssistant} 
      />
    </div>
  )
}

function DashboardHome() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Parents</p>
              <p className="text-2xl font-semibold text-gray-900">2</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <School className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Schools</p>
              <p className="text-2xl font-semibold text-gray-900">1</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Stethoscope className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Doctors</p>
              <p className="text-2xl font-semibold text-gray-900">1</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <MessageSquare className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Open Tickets</p>
              <p className="text-2xl font-semibold text-gray-900">4</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          <div className="flex items-center text-sm text-gray-600">
            <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
            New school registration: Shahjalal School and College
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
            Doctor subscription renewed: Dr. Dipok Debnath
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <span className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></span>
            New support ticket: Payment issue #1234
          </div>
        </div>
      </div>
    </div>
  )
}
