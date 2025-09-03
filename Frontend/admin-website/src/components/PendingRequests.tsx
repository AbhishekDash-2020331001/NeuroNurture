import { useState } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { 
  UserCheck, 
  School, 
  Stethoscope, 
  CheckCircle, 
  XCircle, 
  Clock,
  Eye,
  FileText
} from 'lucide-react'

interface PendingRequest {
  id: string
  name: string
  email: string
  type: 'school' | 'doctor'
  status: 'pending' | 'approved' | 'rejected'
  submittedAt: string
  details: {
    phone?: string
    address?: string
    license?: string
    specialization?: string
    studentCount?: number
    patientCount?: number
  }
  documents: string[]
}

const mockPendingRequests: PendingRequest[] = [
  {
    id: '1',
    name: 'Sunshine Elementary School',
    email: 'admin@sunshine.edu',
    type: 'school',
    status: 'pending',
    submittedAt: '2024-01-15T10:30:00Z',
    details: {
      phone: '+1-555-0123',
      address: '123 Sunshine Blvd, City, State 12345',
      studentCount: 250
    },
    documents: ['Business License', 'Tax Certificate', 'Principal Credentials']
  },
  {
    id: '2',
    name: 'Dr. Michael Chen',
    email: 'dr.chen@neurology.com',
    type: 'doctor',
    status: 'pending',
    submittedAt: '2024-01-14T14:20:00Z',
    details: {
      phone: '+1-555-0456',
      address: '456 Medical Center Dr, City, State 12345',
      license: 'MD123456',
      specialization: 'Pediatric Neurology',
      patientCount: 45
    },
    documents: ['Medical License', 'Board Certification', 'Malpractice Insurance']
  },
  {
    id: '3',
    name: 'Riverside Middle School',
    email: 'principal@riverside.edu',
    type: 'school',
    status: 'pending',
    submittedAt: '2024-01-13T09:15:00Z',
    details: {
      phone: '+1-555-0789',
      address: '789 Riverside Ave, City, State 12345',
      studentCount: 180
    },
    documents: ['School Charter', 'Accreditation Certificate', 'Administrative License']
  },
  {
    id: '4',
    name: 'Dr. Emily Rodriguez',
    email: 'dr.rodriguez@childpsych.com',
    type: 'doctor',
    status: 'pending',
    submittedAt: '2024-01-12T16:45:00Z',
    details: {
      phone: '+1-555-0321',
      address: '321 Child Psychology Center, City, State 12345',
      license: 'PSY654321',
      specialization: 'Child Psychology',
      patientCount: 32
    },
    documents: ['Psychology License', 'Specialization Certificate', 'References']
  }
]

export default function PendingRequests() {
  const [requests, setRequests] = useState<PendingRequest[]>(mockPendingRequests)
  const [selectedType, setSelectedType] = useState<'all' | 'school' | 'doctor'>('all')
  const [expandedRequests, setExpandedRequests] = useState<Set<string>>(new Set())

  const toggleRequestExpansion = (requestId: string) => {
    const newExpanded = new Set(expandedRequests)
    if (newExpanded.has(requestId)) {
      newExpanded.delete(requestId)
    } else {
      newExpanded.add(requestId)
    }
    setExpandedRequests(newExpanded)
  }

  const handleApprove = (requestId: string) => {
    setRequests(prev => 
      prev.map(req => 
        req.id === requestId 
          ? { ...req, status: 'approved' as const }
          : req
      )
    )
  }

  const handleReject = (requestId: string) => {
    setRequests(prev => 
      prev.map(req => 
        req.id === requestId 
          ? { ...req, status: 'rejected' as const }
          : req
      )
    )
  }

  const filteredRequests = selectedType === 'all' 
    ? requests 
    : requests.filter(req => req.type === selectedType)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100'
      case 'approved': return 'text-green-600 bg-green-100'
      case 'rejected': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'school': return <School className="h-5 w-5" />
      case 'doctor': return <Stethoscope className="h-5 w-5" />
      default: return <UserCheck className="h-5 w-5" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'school': return 'bg-green-100 text-green-600'
      case 'doctor': return 'bg-purple-100 text-purple-600'
      default: return 'bg-gray-100 text-gray-600'
    }
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

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Pending Requests</h2>
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
        {filteredRequests.map((request) => (
          <Card key={request.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${getTypeColor(request.type)}`}>
                    {getTypeIcon(request.type)}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{request.name}</CardTitle>
                    <p className="text-sm text-gray-600">{request.email}</p>
                    <p className="text-xs text-gray-500">
                      Submitted: {formatDate(request.submittedAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                    {request.status === 'pending' && <Clock className="h-3 w-3 inline mr-1" />}
                    {request.status}
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
                    {request.status === 'pending' && (
                      <>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-green-600 hover:text-green-700"
                          onClick={() => handleApprove(request.id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleReject(request.id)}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
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
                    <h4 className="font-medium text-gray-900 mb-3">Contact Information</h4>
                    <div className="space-y-2 text-sm">
                      {request.details.phone && (
                        <p><span className="font-medium">Phone:</span> {request.details.phone}</p>
                      )}
                      {request.details.address && (
                        <p><span className="font-medium">Address:</span> {request.details.address}</p>
                      )}
                      {request.details.license && (
                        <p><span className="font-medium">License:</span> {request.details.license}</p>
                      )}
                      {request.details.specialization && (
                        <p><span className="font-medium">Specialization:</span> {request.details.specialization}</p>
                      )}
                      {request.details.studentCount && (
                        <p><span className="font-medium">Students:</span> {request.details.studentCount}</p>
                      )}
                      {request.details.patientCount && (
                        <p><span className="font-medium">Patients:</span> {request.details.patientCount}</p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Documents</h4>
                    <div className="space-y-2">
                      {request.documents.map((doc, index) => (
                        <div key={index} className="flex items-center space-x-2 text-sm">
                          <FileText className="h-4 w-4 text-gray-400" />
                          <span>{doc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}
