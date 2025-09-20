import {
    Ban,
    CheckCircle,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Eye,
    Filter,
    Loader2,
    School,
    Search,
    Stethoscope,
    UserCheck,
    Users,
    X
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '../../../components/common/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/common/card'
import { adminService } from '../../../shared/services/adminService'

// Convert Parent/School/Doctor to User interface for compatibility
interface User {
  id: string
  name: string
  email: string
  status: 'active' | 'suspended' | 'pending'
  children?: Child[]
  type: 'parent' | 'school' | 'doctor'
  // Additional parent details for view modal
  address?: string
  numberOfChildren?: number
  suspectedAutisticChildCount?: number
  // School specific fields
  schoolName?: string
  contactPerson?: string
  phone?: string
  city?: string
  state?: string
  zipCode?: string
  studentCount?: number
  childrenLimit?: number
  currentChildren?: number
  // Doctor specific fields
  firstName?: string
  lastName?: string
  specialization?: string
  licenseNumber?: string
  hospital?: string
  yearsOfExperience?: number
  patientLimit?: number
  currentPatients?: number
}

interface Child {
  id: string
  name: string
  dateOfBirth?: string
  age?: number // Fallback for backward compatibility
  gender: string
  height: number
  weight: number
}

export default function UserManagement() {
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set())
  const [selectedType, setSelectedType] = useState<'all' | 'parent' | 'school' | 'doctor'>('all')
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedParent, setSelectedParent] = useState<User | null>(null)
  const [showViewModal, setShowViewModal] = useState(false)
  
  // Search and filter states
  const [searchEmail, setSearchEmail] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended'>('all')
  const [minChildrenCount, setMinChildrenCount] = useState<number>(0)
  const [showFilters, setShowFilters] = useState(false)
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Helper function to calculate age from date of birth or use fallback age
  const calculateAge = (child: Child): number => {
    // If we have dateOfBirth, calculate from it
    if (child.dateOfBirth) {
      try {
        const today = new Date()
        const birthDate = new Date(child.dateOfBirth)
        
        // Check if the date is valid
        if (isNaN(birthDate.getTime())) {
          console.warn('Invalid date of birth:', child.dateOfBirth)
          // Fall back to age if available
          return child.age || 0
        }
        
        let age = today.getFullYear() - birthDate.getFullYear()
        const monthDiff = today.getMonth() - birthDate.getMonth()
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--
        }
        
        return age
      } catch (error) {
        console.warn('Error calculating age for date:', child.dateOfBirth, error)
        // Fall back to age if available
        return child.age || 0
      }
    }
    
    // Fall back to pre-calculated age if dateOfBirth is not available
    return child.age || 0
  }

  // Fetch all users data on component mount
  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        setLoading(true)
        const [parents, schools, doctors] = await Promise.all([
          adminService.getAllParents(),
          adminService.getAllSchools(),
          adminService.getAllDoctors()
        ])
        
        // Convert all data to User[] format
        const convertedUsers: User[] = []
        
        // Convert parents
        const parentUsers: User[] = parents.map(parent => ({
          id: parent.id.toString(),
          name: parent.name,
          email: parent.email,
          status: parent.status,
          type: 'parent' as const,
          address: parent.address,
          numberOfChildren: parent.numberOfChildren,
          suspectedAutisticChildCount: parent.suspectedAutisticChildCount,
          children: parent.children.map(child => ({
            id: child.id.toString(),
            name: child.name,
            dateOfBirth: child.dateOfBirth,
            age: child.age,
            gender: child.gender,
            height: child.height,
            weight: child.weight
          }))
        }))
        
        // Convert schools
        const schoolUsers: User[] = schools.map(school => ({
          id: school.id.toString(),
          name: school.schoolName,
          email: school.email,
          status: (school.status || 'active') as 'active' | 'suspended' | 'pending',
          type: 'school' as const,
          schoolName: school.schoolName,
          contactPerson: school.contactPerson,
          phone: school.phone,
          address: school.address,
          city: school.city,
          state: school.state,
          zipCode: school.zipCode,
          studentCount: school.studentCount,
          childrenLimit: school.childrenLimit,
          currentChildren: school.currentChildren
        }))
        
        // Convert doctors
        const doctorUsers: User[] = doctors.map(doctor => ({
          id: doctor.id.toString(),
          name: `${doctor.firstName} ${doctor.lastName}`,
          email: doctor.email,
          status: (doctor.status || 'active') as 'active' | 'suspended' | 'pending',
          type: 'doctor' as const,
          firstName: doctor.firstName,
          lastName: doctor.lastName,
          phone: doctor.phone,
          specialization: doctor.specialization,
          licenseNumber: doctor.licenseNumber,
          hospital: doctor.hospital,
          address: doctor.address,
          city: doctor.city,
          state: doctor.state,
          zipCode: doctor.zipCode,
          yearsOfExperience: doctor.yearsOfExperience,
          patientLimit: doctor.patientLimit,
          currentPatients: doctor.currentPatients
        }))
        
        // Combine all users
        convertedUsers.push(...parentUsers, ...schoolUsers, ...doctorUsers)
        
        setUsers(convertedUsers)
        setError(null)
      } catch (err) {
        console.error('Error fetching users:', err)
        setError('Failed to load user data')
        setUsers([])
      } finally {
        setLoading(false)
      }
    }

    fetchAllUsers()
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
      const user = users.find(u => u.id === userId)
      if (!user) return
      
      let updatedUser = null
      
      if (user.type === 'parent') {
        const parentId = parseInt(userId)
        updatedUser = await adminService.updateParentStatus(parentId, newStatus)
      } else if (user.type === 'school') {
        const schoolId = parseInt(userId)
        updatedUser = await adminService.updateSchoolStatus(schoolId, newStatus)
      } else if (user.type === 'doctor') {
        const doctorId = parseInt(userId)
        updatedUser = await adminService.updateDoctorStatus(doctorId, newStatus)
      }
      
      if (updatedUser) {
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
      console.error('Error updating user status:', err)
      setError('Failed to update user status')
    }
  }

  const handleViewUser = async (userId: string) => {
    try {
      const user = users.find(u => u.id === userId)
      if (!user) return
      
      let detailedUser = null
      
      if (user.type === 'parent') {
        const parentId = parseInt(userId)
        const parent = await adminService.getParentById(parentId)
        if (parent) {
          detailedUser = {
            id: parent.id.toString(),
            name: parent.name,
            email: parent.email,
            status: parent.status,
            type: 'parent' as const,
            address: parent.address,
            numberOfChildren: parent.numberOfChildren,
            suspectedAutisticChildCount: parent.suspectedAutisticChildCount,
            children: parent.children.map(child => ({
              id: child.id.toString(),
              name: child.name,
              dateOfBirth: child.dateOfBirth,
              age: child.age,
              gender: child.gender,
              height: child.height,
              weight: child.weight
            }))
          }
        }
      } else if (user.type === 'school') {
        const schoolId = parseInt(userId)
        const school = await adminService.getSchoolById(schoolId)
        if (school) {
          detailedUser = {
            id: school.id.toString(),
            name: school.schoolName,
            email: school.email,
            status: (school.status || 'active') as 'active' | 'suspended' | 'pending',
            type: 'school' as const,
            schoolName: school.schoolName,
            contactPerson: school.contactPerson,
            phone: school.phone,
            address: school.address,
            city: school.city,
            state: school.state,
            zipCode: school.zipCode,
            studentCount: school.studentCount,
            childrenLimit: school.childrenLimit,
            currentChildren: school.currentChildren
          }
        }
      } else if (user.type === 'doctor') {
        const doctorId = parseInt(userId)
        const doctor = await adminService.getDoctorById(doctorId)
        if (doctor) {
          detailedUser = {
            id: doctor.id.toString(),
            name: `${doctor.firstName} ${doctor.lastName}`,
            email: doctor.email,
            status: (doctor.status || 'active') as 'active' | 'suspended' | 'pending',
            type: 'doctor' as const,
            firstName: doctor.firstName,
            lastName: doctor.lastName,
            phone: doctor.phone,
            specialization: doctor.specialization,
            licenseNumber: doctor.licenseNumber,
            hospital: doctor.hospital,
            address: doctor.address,
            city: doctor.city,
            state: doctor.state,
            zipCode: doctor.zipCode,
            yearsOfExperience: doctor.yearsOfExperience,
            patientLimit: doctor.patientLimit,
            currentPatients: doctor.currentPatients
          }
        }
      }
      
      if (detailedUser) {
        setSelectedParent(detailedUser)
        setShowViewModal(true)
      }
    } catch (err) {
      console.error('Error fetching user details:', err)
      setError('Failed to load user details')
    }
  }

  const filteredUsers = users.filter(user => {
    // Type filter
    const typeMatch = selectedType === 'all' || user.type === selectedType
    
    // Email search
    const emailMatch = searchEmail === '' || user.email.toLowerCase().includes(searchEmail.toLowerCase())
    
    // Status filter
    const statusMatch = statusFilter === 'all' || user.status === statusFilter
    
    // Minimum children count filter (only for parents)
    const childrenCount = user.children ? user.children.length : 0
    const childrenMatch = user.type !== 'parent' || childrenCount >= minChildrenCount
    
    return typeMatch && emailMatch && statusMatch && childrenMatch
  })

  // Pagination calculations
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex)

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchEmail, statusFilter, minChildrenCount, selectedType])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-700 bg-green-100 border border-green-200'
      case 'suspended': return 'text-red-700 bg-red-100 border border-red-200'
      case 'pending': return 'text-amber-700 bg-amber-100 border border-amber-200'
      default: return 'text-gray-700 bg-gray-100 border border-gray-200'
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
      case 'parent': return 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg'
      case 'school': return 'bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg'
      case 'doctor': return 'bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg'
      default: return 'bg-gradient-to-br from-gray-500 to-gray-600 text-white shadow-lg'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading user data...</span>
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
          >
            Schools ({users.filter(u => u.type === 'school').length})
          </Button>
          <Button
            variant={selectedType === 'doctor' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedType('doctor')}
          >
            Doctors ({users.filter(u => u.type === 'doctor').length})
          </Button>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Bar */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search by email..."
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {searchEmail && (
                <button
                  onClick={() => setSearchEmail('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Filter Toggle */}
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2"
          >
            <Filter className="h-4 w-4" />
            <span>Filters</span>
          </Button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>

              {/* Minimum Children Count Filter - Only for parents */}
              {selectedType === 'parent' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Children Count</label>
                  <select
                    value={minChildrenCount}
                    onChange={(e) => setMinChildrenCount(Number(e.target.value))}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value={0}>All Parents (0+)</option>
                    <option value={1}>1+ Children</option>
                    <option value={2}>2+ Children</option>
                    <option value={3}>3+ Children</option>
                    <option value={4}>4+ Children</option>
                    <option value={5}>5+ Children</option>
                  </select>
                </div>
              )}
            </div>

            {/* Clear Filters */}
            <div className="mt-4 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchEmail('')
                  setStatusFilter('all')
                  setMinChildrenCount(0)
                  setCurrentPage(1)
                }}
              >
                Clear All Filters
              </Button>
            </div>
          </div>
        )}
      </div>

      {filteredUsers.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-gray-500 text-lg font-medium mb-2">
            {searchEmail || statusFilter !== 'all' || minChildrenCount > 0
              ? 'No users match your filters' 
              : 'No users found'
            }
          </p>
          <p className="text-gray-400 text-sm">
            {searchEmail || statusFilter !== 'all' || minChildrenCount > 0
              ? 'Try adjusting your search criteria or clear filters'
              : 'Users will appear here once they register'
            }
          </p>
        </div>
      ) : (
        <>
          {/* Results summary */}
          <div className="mb-4 flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Showing {startIndex + 1}-{Math.min(endIndex, filteredUsers.length)} of {filteredUsers.length} users
            </p>
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600">Items per page:</label>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value))
                  setCurrentPage(1)
                }}
                className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
          {paginatedUsers.map((user) => (
          <Card key={user.id} className="overflow-hidden hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500 bg-gradient-to-br from-white to-gray-50">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-xl shadow-sm ${getTypeColor(user.type)}`}>
                    {getTypeIcon(user.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-xl font-semibold text-gray-900 truncate">{user.name}</CardTitle>
                    <p className="text-sm text-gray-600 truncate mt-1">{user.email}</p>
                    <div className="flex items-center mt-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${getStatusColor(user.status)}`}>
                        {user.status}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Action buttons moved to top row */}
                <div className="flex space-x-2 ml-4">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleViewUser(user.id)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                  {user.status === 'active' ? (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                      onClick={() => handleStatusUpdate(user.id, 'suspended')}
                    >
                      <Ban className="h-4 w-4 mr-2" />
                      Suspend
                    </Button>
                  ) : (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
                      onClick={() => handleStatusUpdate(user.id, 'active')}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Activate
                    </Button>
                  )}
                </div>
              </div>
              
              {/* Children count and stats - Only for parents */}
              {user.type === 'parent' && user.children && user.children.length > 0 && (
                <div 
                  className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100 cursor-pointer hover:bg-blue-100 transition-colors"
                  onClick={() => toggleUserExpansion(user.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-900">
                        {user.children.length} child{user.children.length !== 1 ? 'ren' : ''}
                      </span>
                    </div>
                    <div className="text-blue-600">
                      {expandedUsers.has(user.id) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardHeader>
            
            
            {/* Expanded children section - Only for parents */}
            {user.type === 'parent' && expandedUsers.has(user.id) && user.children && user.children.length > 0 && (
              <CardContent className="pt-0 border-t border-gray-100 bg-gray-50/50">
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Children Details</h4>
                  {user.children.map((child) => (
                    <div key={child.id} className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {child.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{child.name}</p>
                          <p className="text-sm text-gray-600">{child.gender} • Age: {calculateAge(child)} years</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Height:</span>
                          <span className="ml-2 font-medium">{child.height} cm</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Weight:</span>
                          <span className="ml-2 font-medium">{child.weight} kg</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                >
                  First
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                <div className="flex space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className="w-8 h-8 p-0"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                >
                  Last
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* View Parent Modal */}
      {showViewModal && selectedParent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full mx-4">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-xl">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">
                      {selectedParent.type === 'parent' ? 'Parent' : 
                       selectedParent.type === 'school' ? 'School' : 'Doctor'} Details
                    </h3>
                    <p className="text-blue-100 text-sm">Complete information</p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowViewModal(false)}
                  className="text-white hover:bg-white hover:bg-opacity-20"
                >
                  ✕
                </Button>
              </div>
            </div>
            
            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-xl">
                      {selectedParent.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-2xl font-bold text-gray-900">{selectedParent.name}</h4>
                    <p className="text-gray-600">{selectedParent.email}</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide mt-2 ${getStatusColor(selectedParent.status)}`}>
                      {selectedParent.status}
                    </span>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="font-semibold text-gray-700">Address</span>
                    </div>
                    <p className="text-gray-900">{selectedParent.address || 'Not provided'}</p>
                  </div>

                  {selectedParent.type === 'parent' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="font-semibold text-gray-700">Total Children</span>
                        </div>
                        <p className="text-2xl font-bold text-blue-600">{selectedParent.numberOfChildren || 0}</p>
                      </div>

                      <div className="bg-amber-50 p-4 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                          <span className="font-semibold text-gray-700">Suspected Autistic</span>
                        </div>
                        <p className="text-2xl font-bold text-amber-600">{selectedParent.suspectedAutisticChildCount || 0}</p>
                      </div>
                    </div>
                  )}

                  {selectedParent.type === 'school' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="font-semibold text-gray-700">Student Count</span>
                        </div>
                        <p className="text-2xl font-bold text-green-600">{selectedParent.studentCount || 0}</p>
                      </div>

                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="font-semibold text-gray-700">Current Children</span>
                        </div>
                        <p className="text-2xl font-bold text-blue-600">{selectedParent.currentChildren || 0}</p>
                      </div>
                    </div>
                  )}

                  {selectedParent.type === 'doctor' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                          <span className="font-semibold text-gray-700">Specialization</span>
                        </div>
                        <p className="text-lg font-bold text-purple-600">{selectedParent.specialization || 'Not specified'}</p>
                      </div>

                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="font-semibold text-gray-700">Years of Experience</span>
                        </div>
                        <p className="text-2xl font-bold text-blue-600">{selectedParent.yearsOfExperience || 0}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 rounded-b-xl">
              <div className="flex justify-end">
                <Button 
                  onClick={() => setShowViewModal(false)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
