import {
    CheckCircle,
    Clock,
    Eye,
    Loader2,
    School,
    Stethoscope,
    XCircle
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '../../../components/common/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/common/card'

// PendingRequest interface removed - using specific DTOs instead

interface SchoolApprovalDto {
  id: number
  schoolName: string
  contactPerson: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zipCode: string
  studentCount: number
  emailVerified: boolean
  isVerified: boolean
  assignedAdminId: number | null
  subscriptionStatus: string
  childrenLimit: number
  currentChildren: number
  registrationDate: string
  emailVerificationDate: string | null
}

interface DoctorApprovalDto {
  id: number
  username: string
  email: string
  firstName: string
  lastName: string
  phone: string
  specialization: string
  licenseNumber: string
  hospital: string
  address: string
  city: string
  state: string
  zipCode: string
  yearsOfExperience: number
  emailVerified: boolean
  isVerified: boolean
  assignedAdminId: number | null
  subscriptionStatus: string
  patientLimit: number
  currentPatients: number
  registrationDate: string
  emailVerificationDate: string | null
}

export default function PendingRequests() {
  const [schoolRequests, setSchoolRequests] = useState<SchoolApprovalDto[]>([])
  const [doctorRequests, setDoctorRequests] = useState<DoctorApprovalDto[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedType, setSelectedType] = useState<'all' | 'school' | 'doctor'>('all')
  const [expandedRequests, setExpandedRequests] = useState<Set<string>>(new Set())
  const [processing, setProcessing] = useState<Set<string>>(new Set())

  // Get admin ID from localStorage or context
  const adminId = localStorage.getItem('adminId') || '1' // Fallback for testing

  useEffect(() => {
    fetchPendingRequests()
  }, [])

  const fetchPendingRequests = async () => {
    try {
      setLoading(true)
      await Promise.all([
        fetchPendingSchools(),
        fetchPendingDoctors()
      ])
    } catch (error) {
      console.error('Error fetching pending requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPendingSchools = async () => {
    try {
      const response = await fetch(`http://localhost:8090/api/admin/schools/pending/${adminId}`)
      if (response.ok) {
        const data = await response.json()
        setSchoolRequests(data)
      } else {
        console.error('Failed to fetch pending schools')
      }
    } catch (error) {
      console.error('Error fetching pending schools:', error)
    }
  }

  const fetchPendingDoctors = async () => {
    try {
      const response = await fetch(`http://localhost:8090/api/admin/doctors/pending/${adminId}`)
      if (response.ok) {
        const data = await response.json()
        setDoctorRequests(data)
      } else {
        console.error('Failed to fetch pending doctors')
      }
    } catch (error) {
      console.error('Error fetching pending doctors:', error)
    }
  }

  const toggleRequestExpansion = (requestId: string) => {
    const newExpanded = new Set(expandedRequests)
    if (newExpanded.has(requestId)) {
      newExpanded.delete(requestId)
    } else {
      newExpanded.add(requestId)
    }
    setExpandedRequests(newExpanded)
  }

  const handleApproveSchool = async (schoolId: number) => {
    try {
      setProcessing(prev => new Set(prev).add(`school-${schoolId}`))
      const response = await fetch(`http://localhost:8090/api/admin/schools/${schoolId}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (response.ok) {
        // Remove from pending list
        setSchoolRequests(prev => prev.filter(req => req.id !== schoolId))
      } else {
        console.error('Failed to approve school')
      }
    } catch (error) {
      console.error('Error approving school:', error)
    } finally {
      setProcessing(prev => {
        const newSet = new Set(prev)
        newSet.delete(`school-${schoolId}`)
        return newSet
      })
    }
  }

  const handleRejectSchool = async (schoolId: number) => {
    try {
      setProcessing(prev => new Set(prev).add(`school-${schoolId}`))
      const response = await fetch(`http://localhost:8090/api/admin/schools/${schoolId}/reject`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (response.ok) {
        // Remove from pending list
        setSchoolRequests(prev => prev.filter(req => req.id !== schoolId))
      } else {
        console.error('Failed to reject school')
      }
    } catch (error) {
      console.error('Error rejecting school:', error)
    } finally {
      setProcessing(prev => {
        const newSet = new Set(prev)
        newSet.delete(`school-${schoolId}`)
        return newSet
      })
    }
  }

  const handleApproveDoctor = async (doctorId: number) => {
    try {
      setProcessing(prev => new Set(prev).add(`doctor-${doctorId}`))
      const response = await fetch(`http://localhost:8090/api/admin/doctors/${doctorId}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (response.ok) {
        // Remove from pending list
        setDoctorRequests(prev => prev.filter(req => req.id !== doctorId))
      } else {
        console.error('Failed to approve doctor')
      }
    } catch (error) {
      console.error('Error approving doctor:', error)
    } finally {
      setProcessing(prev => {
        const newSet = new Set(prev)
        newSet.delete(`doctor-${doctorId}`)
        return newSet
      })
    }
  }

  const handleRejectDoctor = async (doctorId: number) => {
    try {
      setProcessing(prev => new Set(prev).add(`doctor-${doctorId}`))
      const response = await fetch(`http://localhost:8090/api/admin/doctors/${doctorId}/reject`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (response.ok) {
        // Remove from pending list
        setDoctorRequests(prev => prev.filter(req => req.id !== doctorId))
      } else {
        console.error('Failed to reject doctor')
      }
    } catch (error) {
      console.error('Error rejecting doctor:', error)
    } finally {
      setProcessing(prev => {
        const newSet = new Set(prev)
        newSet.delete(`doctor-${doctorId}`)
        return newSet
      })
    }
  }

  const getStatusColor = (isVerified: boolean, emailVerified: boolean) => {
    if (!emailVerified) return 'text-orange-600 bg-orange-100'
    if (!isVerified) return 'text-yellow-600 bg-yellow-100'
    return 'text-green-600 bg-green-100'
  }

  const getStatusText = (isVerified: boolean, emailVerified: boolean) => {
    if (!emailVerified) return 'Email Pending'
    if (!isVerified) return 'Admin Pending'
    return 'Approved'
  }

  const getTypeIcon = (type: 'school' | 'doctor') => {
    return type === 'school' ? <School className="h-5 w-5" /> : <Stethoscope className="h-5 w-5" />
  }
  
  const getTypeColor = (type: 'school' | 'doctor') => {
    return type === 'school' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading pending requests...</span>
      </div>
    )
  }

  const allRequests = [
    ...schoolRequests.map(req => ({ ...req, type: 'school' as const })),
    ...doctorRequests.map(req => ({ ...req, type: 'doctor' as const }))
  ]

  const filteredRequests = selectedType === 'all' 
    ? allRequests 
    : allRequests.filter(req => req.type === selectedType)

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Pending Approvals</h2>
        <div className="flex space-x-2">
          <Button
            variant={selectedType === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedType('all')}
          >
            All Requests
          </Button>
          <Button
            variant={selectedType === 'school' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedType('school')}
          >
            Schools Only
          </Button>
          <Button
            variant={selectedType === 'doctor' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedType('doctor')}
          >
            Doctors Only
          </Button>
        </div>
      </div>

      {filteredRequests.length === 0 ? (
        <div className="text-center py-12">
          <School className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Requests</h3>
          <p className="text-gray-500">There are currently no requests waiting for approval.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((request) => (
            <Card key={`${request.type}-${request.id}`} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${getTypeColor(request.type)}`}>
                      {getTypeIcon(request.type)}
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        {request.type === 'school' 
                          ? (request as SchoolApprovalDto).schoolName
                          : `${(request as DoctorApprovalDto).firstName} ${(request as DoctorApprovalDto).lastName}`
                        }
                      </CardTitle>
                      <p className="text-sm text-gray-600">{request.email}</p>
                      <p className="text-xs text-gray-500">
                        {request.type === 'school' 
                          ? `Contact: ${(request as SchoolApprovalDto).contactPerson}`
                          : `Specialization: ${(request as DoctorApprovalDto).specialization}`
                        }
                      </p>
                      <p className="text-xs text-gray-500">
                        Registered: {formatDate(request.registrationDate)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.isVerified, request.emailVerified)}`}>
                      {!request.isVerified && <Clock className="h-3 w-3 inline mr-1" />}
                      {getStatusText(request.isVerified, request.emailVerified)}
                    </span>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => toggleRequestExpansion(`${request.type}-${request.id}`)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                      {request.emailVerified && !request.isVerified && (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-green-600 hover:text-green-700"
                            onClick={() => request.type === 'school' 
                              ? handleApproveSchool(request.id)
                              : handleApproveDoctor(request.id)
                            }
                            disabled={processing.has(`${request.type}-${request.id}`)}
                          >
                            {processing.has(`${request.type}-${request.id}`) ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <CheckCircle className="h-4 w-4 mr-2" />
                            )}
                            Approve
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-red-600 hover:text-red-700"
                            onClick={() => request.type === 'school' 
                              ? handleRejectSchool(request.id)
                              : handleRejectDoctor(request.id)
                            }
                            disabled={processing.has(`${request.type}-${request.id}`)}
                          >
                            {processing.has(`${request.type}-${request.id}`) ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <XCircle className="h-4 w-4 mr-2" />
                            )}
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              {expandedRequests.has(`${request.type}-${request.id}`) && (
                <CardContent className="pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">
                        {request.type === 'school' ? 'School Information' : 'Doctor Information'}
                      </h4>
                      <div className="space-y-2 text-sm">
                        {request.type === 'school' ? (
                          <>
                            <p><span className="font-medium">School Name:</span> {(request as SchoolApprovalDto).schoolName}</p>
                            <p><span className="font-medium">Contact Person:</span> {(request as SchoolApprovalDto).contactPerson}</p>
                            <p><span className="font-medium">Email:</span> {request.email}</p>
                            <p><span className="font-medium">Phone:</span> {request.phone}</p>
                            <p><span className="font-medium">Address:</span> {request.address}</p>
                            <p><span className="font-medium">City:</span> {request.city}, {request.state} {request.zipCode}</p>
                            <p><span className="font-medium">Expected Students:</span> {(request as SchoolApprovalDto).studentCount}</p>
                            <p><span className="font-medium">Student Limit:</span> {(request as SchoolApprovalDto).childrenLimit}</p>
                            <p><span className="font-medium">Subscription Status:</span> {request.subscriptionStatus}</p>
                          </>
                        ) : (
                          <>
                            <p><span className="font-medium">Name:</span> {(request as DoctorApprovalDto).firstName} {(request as DoctorApprovalDto).lastName}</p>
                            <p><span className="font-medium">Username:</span> {(request as DoctorApprovalDto).username}</p>
                            <p><span className="font-medium">Email:</span> {request.email}</p>
                            <p><span className="font-medium">Phone:</span> {request.phone}</p>
                            <p><span className="font-medium">Specialization:</span> {(request as DoctorApprovalDto).specialization}</p>
                            <p><span className="font-medium">License Number:</span> {(request as DoctorApprovalDto).licenseNumber}</p>
                            <p><span className="font-medium">Hospital:</span> {(request as DoctorApprovalDto).hospital}</p>
                            <p><span className="font-medium">Address:</span> {request.address}</p>
                            <p><span className="font-medium">City:</span> {request.city}, {request.state} {request.zipCode}</p>
                            <p><span className="font-medium">Years of Experience:</span> {(request as DoctorApprovalDto).yearsOfExperience}</p>
                            <p><span className="font-medium">Patient Limit:</span> {(request as DoctorApprovalDto).patientLimit}</p>
                            <p><span className="font-medium">Subscription Status:</span> {request.subscriptionStatus}</p>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Verification Status</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${request.emailVerified ? 'bg-green-500' : 'bg-orange-500'}`}></div>
                          <span>Email Verified: {request.emailVerified ? 'Yes' : 'No'}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${request.isVerified ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                          <span>Admin Approved: {request.isVerified ? 'Yes' : 'No'}</span>
                        </div>
                        {request.assignedAdminId && (
                          <p><span className="font-medium">Assigned Admin ID:</span> {request.assignedAdminId}</p>
                        )}
                        {request.emailVerificationDate && (
                          <p><span className="font-medium">Email Verified:</span> {formatDate(request.emailVerificationDate)}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
