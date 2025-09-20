import { EnrollmentRequest, enrollmentRequestService } from '@/shared/services/enrollment/enrollmentRequestService';
import { AlertCircle, CheckCircle, Clock, GraduationCap, XCircle } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface EnrollmentRequestsProps {
  childId: number;
  childName: string;
}

const EnrollmentRequests: React.FC<EnrollmentRequestsProps> = ({ childId, childName }) => {
  const [requests, setRequests] = useState<EnrollmentRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [respondingTo, setRespondingTo] = useState<number | null>(null);

  useEffect(() => {
    loadEnrollmentRequests();
  }, [childId]);

  const loadEnrollmentRequests = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await enrollmentRequestService.getEnrollmentRequestsForChild(childId);
      setRequests(data);
    } catch (err) {
      setError('Failed to load enrollment requests');
      console.error('Error loading enrollment requests:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRespondToRequest = async (requestId: number, status: 'ACCEPTED' | 'REJECTED') => {
    try {
      setRespondingTo(requestId);
      const response = await enrollmentRequestService.respondToEnrollmentRequest({
        requestId,
        status,
        responseMessage: status === 'ACCEPTED' 
          ? `Thank you for the enrollment request! ${childName} is excited to join.`
          : `Thank you for the request, but we have decided not to proceed at this time.`
      });
      
      // Update the request in the list
      setRequests(prev => prev.map(req => 
        req.id === requestId ? response : req
      ));
      
      // Show success message
      alert(`Enrollment request ${status.toLowerCase()} successfully!`);
      
      // Reload the page to reflect the updated enrollment status
      window.location.reload();
    } catch (err) {
      setError(`Failed to ${status.toLowerCase()} enrollment request`);
      console.error('Error responding to enrollment request:', err);
    } finally {
      setRespondingTo(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'ACCEPTED':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'REJECTED':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'EXPIRED':
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'ACCEPTED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'EXPIRED':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading enrollment requests...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
          <span className="text-red-700">{error}</span>
        </div>
        <button
          onClick={loadEnrollmentRequests}
          className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="text-center py-8">
        <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Enrollment Requests</h3>
        <p className="text-gray-600 mb-4">
          You don't have any pending enrollment requests from schools.
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-2xl mx-auto">
          <p className="text-blue-800 text-sm">
            <strong>How it works:</strong> Schools can send you enrollment requests. When you receive one, you'll see it here and can choose to accept or decline it.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">School Enrollment Requests</h3>
        <p className="text-gray-600 mb-4">
          Schools have sent you enrollment invitations. Review and respond to them below.
        </p>
        <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
          {requests.filter(r => r.status === 'PENDING').length} pending request{requests.filter(r => r.status === 'PENDING').length !== 1 ? 's' : ''}
        </div>
      </div>

      {requests.map((request) => (
        <div
          key={request.id}
          className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <GraduationCap className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">
                    {request.schoolName}
                  </h4>
                  <p className="text-sm text-gray-600">
                    Grade: {request.grade}
                  </p>
                </div>
              </div>

              {request.message && (
                <p className="text-gray-700 mb-4 bg-gray-50 p-3 rounded-lg">
                  {request.message}
                </p>
              )}

              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span>Requested: {formatDate(request.createdAt)}</span>
                {request.respondedAt && (
                  <span>Responded: {formatDate(request.respondedAt)}</span>
                )}
              </div>
            </div>

            <div className="flex flex-col items-end space-y-3">
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(request.status)}`}>
                {getStatusIcon(request.status)}
                <span className="ml-2">{request.status}</span>
              </div>

              {request.status === 'PENDING' && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleRespondToRequest(request.id, 'ACCEPTED')}
                    disabled={respondingTo === request.id}
                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {respondingTo === request.id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    )}
                    Accept
                  </button>
                  <button
                    onClick={() => handleRespondToRequest(request.id, 'REJECTED')}
                    disabled={respondingTo === request.id}
                    className="inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {respondingTo === request.id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <XCircle className="h-4 w-4 mr-2" />
                    )}
                    Decline
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default EnrollmentRequests;
