import {
    Ban,
    CheckCircle,
    ChevronDown,
    ChevronRight,
    Eye,
    Loader2,
    School,
    Stethoscope,
    UserCheck,
    Users
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { adminService } from '../services/adminService'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'

// Convert Parent to User interface for compatibility
interface User {
  id: string
  name: string
  email: string
  status: 'active' | 'suspended' | 'pending'
  children?: Child[]
  type: 'parent' | 'school' | 'doctor'
}

interface Child {
  id: string
  name: string
  age: number
  progress: number
}

export default function UserManagement() {
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set())
  const [selectedType, setSelectedType] = useState<'all' | 'parent' | 'school' | 'doctor'>('all')
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch parents data on component mount
  useEffect(() => {
    const fetchParents = async () => {
      try {
        setLoading(true)
        const parents = await adminService.getAllParents()
        
        // Convert Parent[] to User[] format
        const convertedUsers: User[] = parents.map(parent => ({
          id: parent.id.toString(),
          name: parent.name,
          email: parent.email,
          status: parent.status,
          type: 'parent' as const,
          children: parent.children.map(child => ({
            id: child.id.toString(),
            name: child.name,
            age: child.age,
            progress: Math.floor(Math.random() * 100) // Mock progress for now
          }))
        }))
        
        setUsers(convertedUsers)
        setError(null)
      } catch (err) {
        console.error('Error fetching parents:', err)
        setError('Failed to load parent data')
        setUsers([])
      } finally {
        setLoading(false)
      }
    }

    fetchParents()
  }, [])

  const toggleUserExpansion = (userId: string) => {
    const newExpanded = new Set(expandedUsers)
    if (newExpanded.has(userId)) {
      newExpanded.delete(userId)
    } else {
      newExpanded.add(userId)
    }
    setExpandedUsers(newExpanded)
  }

  const handleStatusUpdate = async (userId: string, newStatus: 'active' | 'suspended') => {
    try {
      const parentId = parseInt(userId)
      const updatedParent = await adminService.updateParentStatus(parentId, newStatus)
      
      if (updatedParent) {
        // Update the user in the local state
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user.id === userId 
              ? { ...user, status: newStatus }
              : user
          )
        )
      }
    } catch (err) {
      console.error('Error updating parent status:', err)
      setError('Failed to update parent status')
    }
  }

  const filteredUsers = selectedType === 'all' 
    ? users 
    : users.filter(user => user.type === selectedType)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100'
      case 'suspended': return 'text-red-600 bg-red-100'
      case 'pending': return 'text-yellow-600 bg-yellow-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'parent': return <Users className="h-5 w-5" />
      case 'school': return <School className="h-5 w-5" />
      case 'doctor': return <Stethoscope className="h-5 w-5" />
      default: return <UserCheck className="h-5 w-5" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'parent': return 'bg-blue-100 text-blue-600'
      case 'school': return 'bg-green-100 text-green-600'
      case 'doctor': return 'bg-purple-100 text-purple-600'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading parent data...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
        <div className="flex space-x-2">
          <Button
            variant={selectedType === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedType('all')}
          >
            All Users
          </Button>
          <Button
            variant={selectedType === 'parent' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedType('parent')}
          >
            Parents ({users.filter(u => u.type === 'parent').length})
          </Button>
          <Button
            variant={selectedType === 'school' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedType('school')}
            disabled
          >
            Schools (Coming Soon)
          </Button>
          <Button
            variant={selectedType === 'doctor' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedType('doctor')}
            disabled
          >
            Doctors (Coming Soon)
          </Button>
        </div>
      </div>

      {filteredUsers.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No parents found.</p>
        </div>
      ) : (
        <div className="space-y-4">
        {filteredUsers.map((user) => (
          <Card key={user.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${getTypeColor(user.type)}`}>
                    {getTypeIcon(user.type)}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{user.name}</CardTitle>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                    {user.status}
                  </span>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                    {user.status === 'active' ? (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleStatusUpdate(user.id, 'suspended')}
                      >
                        <Ban className="h-4 w-4 mr-2" />
                        Suspend
                      </Button>
                    ) : (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-green-600 hover:text-green-700"
                        onClick={() => handleStatusUpdate(user.id, 'active')}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Activate
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            
            {user.children && user.children.length > 0 && (
              <CardContent className="pt-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleUserExpansion(user.id)}
                  className="w-full justify-between text-left"
                >
                  <span>
                    {user.children.length} child{user.children.length !== 1 ? 'ren' : ''} enrolled
                  </span>
                  {expandedUsers.has(user.id) ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
                
                {expandedUsers.has(user.id) && (
                  <div className="mt-4 space-y-3">
                    {user.children.map((child) => (
                      <div key={child.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{child.name}</p>
                          <p className="text-sm text-gray-600">Age: {child.age}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">Progress</p>
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${child.progress}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-gray-600">{child.progress}%</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        ))}
        </div>
      )}
    </div>
  )
}
