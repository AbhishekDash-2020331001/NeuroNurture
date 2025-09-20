import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { childDoctorService, DoctorEnrollmentStatus, DoctorInfo } from '@/shared/services/doctor/childDoctorService';
import { getCurrentChild } from '@/shared/utils/childUtils';
import { Activity, Heart, Mail, MapPin, MessageCircle, Phone, Stethoscope } from 'lucide-react';
import { useEffect, useState } from 'react';
import ChildDoctorChatPage from './ChildDoctorChatPage';
import ChildDoctorTaskPage from './ChildDoctorTaskPage';

export default function ChildDoctorPage() {
  const [selectedChild, setSelectedChild] = useState<any>(null);
  const [doctorStatus, setDoctorStatus] = useState<DoctorEnrollmentStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeDoctorTab, setActiveDoctorTab] = useState<'overview' | 'tasks' | 'chat'>('overview');
  const [doctorInfo, setDoctorInfo] = useState<DoctorInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const childData = getCurrentChild();
    if (childData) {
      setSelectedChild(childData);
      loadDoctorData(childData.id);
    }
  }, []);

  const loadDoctorData = async (childId: number) => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await childDoctorService.getChildDoctorInfo(childId);
      setDoctorStatus(result.status);
      setDoctorInfo(result.doctorInfo);

    } catch (error) {
      console.error('Error loading doctor data:', error);
      
      // Check if it's a 404 error (service not available)
      if (error instanceof Error && error.message.includes('404')) {
        setError('Doctor service is currently unavailable. Please ensure all backend services are running.');
      } else {
        setError('Failed to load doctor information. Please try again.');
      }

      setDoctorStatus({
        childId: childId,
        childName: selectedChild?.name || 'Child',
        doctorId: null,
        problem: null,
        enrolled: false
      });
      setDoctorInfo(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
      {/* Professional Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        

        {/* Navigation Tabs - Only show if connected */}
        {doctorStatus?.enrolled && (
          <div className="bg-gray-50 border-t border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <nav className="flex space-x-8" aria-label="Tabs">
                <button
                  onClick={() => setActiveDoctorTab('overview')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${activeDoctorTab === 'overview'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  <div className="flex items-center space-x-2">
                    <Heart className="w-4 h-4" />
                    <span>Overview</span>
                  </div>
                </button>

                <button
                  onClick={() => setActiveDoctorTab('tasks')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${activeDoctorTab === 'tasks'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  <div className="flex items-center space-x-2">
                    <Activity className="w-4 h-4" />
                    <span>Health Tasks</span>
                  </div>
                </button>

                <button
                  onClick={() => setActiveDoctorTab('chat')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${activeDoctorTab === 'chat'
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  <div className="flex items-center space-x-2">
                    <MessageCircle className="w-4 h-4" />
                    <span>Chat with Doctor</span>
                  </div>
                </button>
              </nav>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        {/* Tab Content */}
        {doctorStatus?.enrolled && activeDoctorTab === 'tasks' ? (
          <ChildDoctorTaskPage
            childId={selectedChild?.id?.toString() || ''}
            childName={selectedChild?.name || ''}
          />
        ) : doctorStatus?.enrolled && activeDoctorTab === 'chat' ? (
          <ChildDoctorChatPage
            childId={selectedChild?.id?.toString() || ''}
            childName={selectedChild?.name || ''}
            doctorId={doctorInfo?.id || 0}
            doctorName={doctorInfo ? `${doctorInfo.firstName} ${doctorInfo.lastName}` : ''}
          />
        ) : (
          <div className="space-y-8">
            {/* Welcome Section - Only show if not connected or on overview tab */}
            {!doctorStatus?.enrolled && (
              <div className="text-center mb-12">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Stethoscope className="w-10 h-10 text-blue-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Health Portal</h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Connect with your healthcare provider to access medical resources, track health progress, and manage appointments.
                </p>
              </div>
            )}

            {/* Doctor Information Card - For connected patients on overview tab */}
            {doctorStatus?.enrolled && activeDoctorTab === 'overview' && doctorInfo && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Doctor Info */}
                <div className="lg:col-span-2">
                  <Card className="h-full shadow-sm border-gray-200">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4 mb-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Stethoscope className="w-8 h-8 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-gray-900 mb-1">
                            Dr. {doctorInfo.firstName} {doctorInfo.lastName}
                          </h3>
                          <p className="text-gray-600 mb-2">{doctorInfo.specialization}</p>
                          <div className="flex items-center text-sm text-gray-500">
                            <MapPin className="w-4 h-4 mr-1" />
                            {doctorInfo.hospital}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mt-6">
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">{doctorInfo.yearsOfExperience}</div>
                          <div className="text-sm text-gray-600">Years Experience</div>
                        </div>
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">Active</div>
                          <div className="text-sm text-gray-600">Status</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Contact Information */}
                <div>
                  <Card className="h-full shadow-sm border-gray-200">
                    <CardContent className="p-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h4>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <Phone className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-700">{doctorInfo.phone}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Mail className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-700">{doctorInfo.email}</span>
                        </div>
                        <div className="flex items-start space-x-3">
                          <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                          <span className="text-sm text-gray-700">{doctorInfo.address}</span>
                        </div>
                      </div>

                      {doctorStatus.problem && (
                        <div className="mt-6 p-4 bg-red-50 rounded-lg border border-red-200">
                          <h5 className="text-sm font-medium text-red-800 mb-1">Medical Condition</h5>
                          <p className="text-sm text-red-700">{doctorStatus.problem}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Connection Status Cards - Only show if not connected */}
            {!doctorStatus?.enrolled && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="text-center p-6 hover:shadow-lg transition-shadow border-gray-200">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Stethoscope className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Connect with Doctor</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Link your account with a healthcare provider to access medical services.
                  </p>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    Connect Doctor
                  </Button>
                </Card>

                <Card className="text-center p-6 hover:shadow-lg transition-shadow border-gray-200">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Activity className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Health Monitoring</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Track your health progress and receive personalized recommendations.
                  </p>
                  <Button variant="outline" className="w-full" disabled>
                    Available After Connection
                  </Button>
                </Card>

                <Card className="text-center p-6 hover:shadow-lg transition-shadow border-gray-200">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Direct Communication</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Chat directly with your healthcare provider for quick consultations.
                  </p>
                  <Button variant="outline" className="w-full" disabled>
                    Available After Connection
                  </Button>
                </Card>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="text-center py-8">
                <div className="inline-flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span className="text-gray-600">Loading health information...</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}