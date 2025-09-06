import {
  CheckCircle,
  Clock,
  Eye,
  Loader2,
  School,
  XCircle
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'

interface PendingRequest {
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

export default function PendingRequests() {
  const [requests, setRequests] = useState<PendingRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedType, setSelectedType] = useState<'all' | 'school' | 'doctor'>('all')
  const [expandedRequests, setExpandedRequests] = useState<Set<number>>(new Set())
  const [processing, setProcessing] = useState<Set<number>>(new Set())

  // Get admin ID from localStorage or context
  const adminId = localStorage.getItem('adminId') || '1' // Fallback for testing

  useEffect(() => {
    fetchPendingSchools()
  }, [])

  const fetchPendingSchools = async () => {
    try {
      setLoading(true)
      const response = await fetch(`http://localhost:8090/api/admin/schools/pending/${adminId}`)
      if (response.ok) {
        const data = await response.json()
        setRequests(data)
      } else {
        console.error('Failed to fetch pending schools')
      }
    } catch (error) {
      console.error('Error fetching pending schools:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleRequestExpansion = (requestId: number) => {
    const newExpanded = new Set(expandedRequests)
    if (newExpanded.has(requestId)) {
      newExpanded.delete(requestId)
    } else {
      newExpanded.add(requestId)
    }
    setExpandedRequests(newExpanded)
  }

  const handleApprove = async (schoolId: number) => {
    try {
      setProcessing(prev => new Set(prev).add(schoolId))
      const response = await fetch(`http://localhost:8090/api/admin/schools/${schoolId}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (response.ok) {
        // Remove from pending list
        setRequests(prev => prev.filter(req => req.id !== schoolId))
      } else {
        console.error('Failed to approve school')
      }
    } catch (error) {
      console.error('Error approving school:', error)
    } finally {
      setProcessing(prev => {
        const newSet = new Set(prev)
        newSet.delete(schoolId)
        return newSet
      })
    }
  }

  const handleReject = async (schoolId: number) => {
    try {
      setProcessing(prev => new Set(prev).add(schoolId))
      const response = await fetch(`http://localhost:8090/api/admin/schools/${schoolId}/reject`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (response.ok) {
        // Remove from pending list
        setRequests(prev => prev.filter(req => req.id !== schoolId))
      } else {
        console.error('Failed to reject school')
      }
    } catch (error) {
      console.error('Error rejecting school:', error)
    } finally {
      setProcessing(prev => {
        const newSet = new Set(prev)
        newSet.delete(schoolId)
        return newSet
      })
    }
  }

  const filteredRequests = selectedType === 'all' 
    ? requests 
    : requests.filter(req => selectedType === 'school')

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

  const getTypeIcon = () => <School className="h-5 w-5" />
  const getTypeColor = () => 'bg-green-100 text-green-600'

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
        <span className="ml-2">Loading pending schools...</span>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Pending School Approvals</h2>
        <div className="flex space-x-2">
          <Button
            variant={selectedType === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedType('all')}
          >
            All Schools
          </Button>
          <Button
            variant={selectedType === 'school' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedType('school')}
          >
            Schools Only
          </Button>
        </div>
      </div>

      {filteredRequests.length === 0 ? (
        <div className="text-center py-12">
          <School className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Schools</h3>
          <p className="text-gray-500">There are currently no schools waiting for approval.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((request) => (
            <Card key={request.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${getTypeColor()}`}>
                      {getTypeIcon()}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{request.schoolName}</CardTitle>
                      <p className="text-sm text-gray-600">{request.email}</p>
                      <p className="text-xs text-gray-500">
                        Contact: {request.contactPerson}
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
                        onClick={() => toggleRequestExpansion(request.id)}
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
                            onClick={() => handleApprove(request.id)}
                            disabled={processing.has(request.id)}
                          >
                            {processing.has(request.id) ? (
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
                            onClick={() => handleReject(request.id)}
                            disabled={processing.has(request.id)}
                          >
                            {processing.has(request.id) ? (
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
              
              {expandedRequests.has(request.id) && (
                <CardContent className="pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">School Information</h4>
                      <div className="space-y-2 text-sm">
                        <p><span className="font-medium">School Name:</span> {request.schoolName}</p>
                        <p><span className="font-medium">Contact Person:</span> {request.contactPerson}</p>
                        <p><span className="font-medium">Email:</span> {request.email}</p>
                        <p><span className="font-medium">Phone:</span> {request.phone}</p>
                        <p><span className="font-medium">Address:</span> {request.address}</p>
                        <p><span className="font-medium">City:</span> {request.city}, {request.state} {request.zipCode}</p>
                        <p><span className="font-medium">Expected Students:</span> {request.studentCount}</p>
                        <p><span className="font-medium">Student Limit:</span> {request.childrenLimit}</p>
                        <p><span className="font-medium">Subscription Status:</span> {request.subscriptionStatus}</p>
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
