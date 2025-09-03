import { useState } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { 
  Users, 
  School, 
  Stethoscope, 
  UserCheck, 
  ChevronDown, 
  ChevronRight,
  Eye,
  Ban,
  CheckCircle
} from 'lucide-react'

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

const mockUsers: User[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john.smith@email.com',
    status: 'active',
    type: 'parent',
    children: [
      { id: 'c1', name: 'Emma Smith', age: 8, progress: 75 },
      { id: 'c2', name: 'Liam Smith', age: 6, progress: 60 }
    ]
  },
  {
    id: '2',
    name: 'ABC Elementary School',
    email: 'admin@abcelementary.edu',
    status: 'active',
    type: 'school',
    children: [
      { id: 'c3', name: 'Sarah Johnson', age: 7, progress: 85 },
      { id: 'c4', name: 'Michael Brown', age: 9, progress: 90 },
      { id: 'c5', name: 'Emily Davis', age: 8, progress: 78 }
    ]
  },
  {
    id: '3',
    name: 'Dr. Sarah Wilson',
    email: 'dr.wilson@clinic.com',
    status: 'active',
    type: 'doctor',
    children: [
      { id: 'c6', name: 'Alex Thompson', age: 10, progress: 92 },
      { id: 'c7', name: 'Sophie Lee', age: 7, progress: 68 }
    ]
  },
  {
    id: '4',
    name: 'Mary Johnson',
    email: 'mary.johnson@email.com',
    status: 'suspended',
    type: 'parent',
    children: [
      { id: 'c8', name: 'David Johnson', age: 9, progress: 45 }
    ]
  }
]

export default function UserManagement() {
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set())
  const [selectedType, setSelectedType] = useState<'all' | 'parent' | 'school' | 'doctor'>('all')

  const toggleUserExpansion = (userId: string) => {
    const newExpanded = new Set(expandedUsers)
    if (newExpanded.has(userId)) {
      newExpanded.delete(userId)
    } else {
      newExpanded.add(userId)
    }
    setExpandedUsers(newExpanded)
  }

  const filteredUsers = selectedType === 'all' 
    ? mockUsers 
    : mockUsers.filter(user => user.type === selectedType)

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
            Parents
          </Button>
          <Button
            variant={selectedType === 'school' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedType('school')}
          >
            Schools
          </Button>
          <Button
            variant={selectedType === 'doctor' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedType('doctor')}
          >
            Doctors
          </Button>
        </div>
      </div>

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
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                        <Ban className="h-4 w-4 mr-2" />
                        Suspend
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm" className="text-green-600 hover:text-green-700">
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
    </div>
  )
}
