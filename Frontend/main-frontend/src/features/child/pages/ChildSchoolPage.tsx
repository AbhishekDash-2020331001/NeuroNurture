import EnrollmentRequests from '@/components/common/EnrollmentRequests';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { EnrollmentRequest, enrollmentRequestService } from '@/shared/services/enrollment/enrollmentRequestService';
import { SchoolEnrollmentStatus, schoolEnrollmentService } from '@/shared/services/enrollment/schoolEnrollmentService';
import { ChildSchoolInfo, schoolService } from '@/shared/services/school/schoolService';
import { getCurrentChild } from '@/shared/utils/childUtils';
import { BookOpen, ClipboardList, GraduationCap, MapPin, Trophy, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import ChildCompetitionPage from './ChildCompetitionPage';
import ChildTaskPage from './ChildTaskPage';

export default function ChildSchoolPage() {
  const [selectedChild, setSelectedChild] = useState<any>(null);
  const [enrollmentStatus, setEnrollmentStatus] = useState<SchoolEnrollmentStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSchoolTab, setActiveSchoolTab] = useState<'overview' | 'tasks' | 'competition'>('overview');
  const [schoolInfo, setSchoolInfo] = useState<ChildSchoolInfo | null>(null);
  const [isLoadingSchoolInfo, setIsLoadingSchoolInfo] = useState(false);
  const [enrollmentRequests, setEnrollmentRequests] = useState<EnrollmentRequest[]>([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);

  useEffect(() => {
    const childData = getCurrentChild();
    if (childData) {
      setSelectedChild(childData);
      loadSchoolData(childData.id);
    }
  }, []);

  const loadSchoolInfo = async (childId: number) => {
    try {
      setIsLoadingSchoolInfo(true);
      const info = await schoolService.getChildSchoolInfo(childId);
      setSchoolInfo(info);
    } catch (error) {
      console.error('Error loading school info:', error);
      // Set fallback data for demo
      setSchoolInfo({
        childId: childId,
        childName: selectedChild?.name || 'Child',
        grade: 'MILD',
        schoolId: 1,
        school: {
          id: 1,
          name: 'Sunshine Elementary School',
          email: 'info@sunshine.edu',
          address: '123 Learning Lane, Education City',
          phone: '+1 (555) 123-4567',
          website: 'www.sunshine.edu',
          description: 'A nurturing environment for special needs children',
          establishedYear: 2010,
          totalStudents: 250,
          principalName: 'Dr. Sarah Johnson'
        },
        enrollmentDate: '2024-01-15',
        status: 'active'
      });
    } finally {
      setIsLoadingSchoolInfo(false);
    }
  };


  const loadSchoolData = async (childId: number) => {
    try {
      setIsLoading(true);
      const status = await schoolEnrollmentService.getChildSchoolStatus(childId);
      setEnrollmentStatus(status);
      
      // If enrolled, load school information
      if (status.enrolled && status.schoolId) {
        await loadSchoolInfo(childId);
      } else {
        // If not enrolled, load enrollment requests
        await loadEnrollmentRequests(childId);
      }
    } catch (error) {
      console.error('Error loading school data:', error);
      // Set fallback data when API fails
      setEnrollmentStatus({
        childId: childId,
        childName: selectedChild?.name || 'Child',
        schoolId: null,
        enrolled: false
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadEnrollmentRequests = async (childId: number) => {
    try {
      setIsLoadingRequests(true);
      const requests = await enrollmentRequestService.getEnrollmentRequestsForChild(childId);
      setEnrollmentRequests(requests);
    } catch (error) {
      console.error('Error loading enrollment requests:', error);
      setEnrollmentRequests([]);
    } finally {
      setIsLoadingRequests(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
      {/* Professional Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left side - Title */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Academic Portal</h1>
                <p className="text-sm text-gray-500">{selectedChild?.name || 'Student Dashboard'}</p>
              </div>
            </div>

            {/* Right side - School info (if enrolled) */}
            {enrollmentStatus?.enrolled && schoolInfo && (
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{schoolInfo.school.name}</p>
                  <p className="text-xs text-gray-500">Grade: {schoolService.formatGrade(schoolInfo.grade)}</p>
                </div>
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-gray-600" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Tabs - Only show if enrolled */}
        {enrollmentStatus?.enrolled && (
          <div className="bg-gray-50 border-t border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <nav className="flex space-x-8" aria-label="Tabs">
                <button
                  onClick={() => setActiveSchoolTab('overview')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                    activeSchoolTab === 'overview'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <BookOpen className="w-4 h-4" />
                    <span>Overview</span>
                  </div>
                </button>

                
                <button
                  onClick={() => setActiveSchoolTab('tasks')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                    activeSchoolTab === 'tasks'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <ClipboardList className="w-4 h-4" />
                    <span>Tasks</span>
                  </div>
                </button>
                
                <button
                  onClick={() => setActiveSchoolTab('competition')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                    activeSchoolTab === 'competition'
                      ? 'border-amber-500 text-amber-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Trophy className="w-4 h-4" />
                    <span>Competitions</span>
                  </div>
                </button>
              </nav>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Content */}
        {enrollmentStatus?.enrolled && activeSchoolTab === 'tasks' ? (
          <ChildTaskPage 
            childId={selectedChild?.id?.toString() || ''} 
            childName={selectedChild?.name || ''} 
          />
        ) : enrollmentStatus?.enrolled && activeSchoolTab === 'competition' ? (
          <ChildCompetitionPage 
            childId={selectedChild?.id?.toString() || ''} 
            childName={selectedChild?.name || ''}
          />
        ) : (
          <div className="space-y-8">
            {/* Welcome Section - Only show if not enrolled or on overview tab */}
            {!enrollmentStatus?.enrolled && (
              <div className="text-center mb-12">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <GraduationCap className="w-10 h-10 text-blue-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Academic Portal</h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
                  Connect with your school to access academic resources, track progress, and participate in educational activities.
                </p>
                
                {/* Enrollment Requests Section - Only show if there are pending requests */}
                {!isLoadingRequests && enrollmentRequests.filter(r => r.status === 'PENDING').length > 0 && (
                  <div className="max-w-4xl mx-auto">
                    <EnrollmentRequests 
                      childId={selectedChild?.id || 0} 
                      childName={selectedChild?.name || ''} 
                    />
                  </div>
                )}
              </div>
            )}

            {/* School Information Card - For enrolled students on overview tab */}
            {enrollmentStatus?.enrolled && activeSchoolTab === 'overview' && schoolInfo && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* School Info */}
                <div className="lg:col-span-2">
                  <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                    <CardContent className="p-8">
                      <div className="flex items-start space-x-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                          <GraduationCap className="w-8 h-8 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-2xl font-bold text-gray-900 mb-2">{schoolInfo.school.name}</h3>
                          <div className="flex items-center text-gray-600 mb-4">
                            <MapPin className="w-4 h-4 mr-2" />
                            <span className="text-sm">{schoolInfo.school.address}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">Principal:</span>
                              <p className="font-medium text-gray-900">{schoolInfo.school.principalName}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Established:</span>
                              <p className="font-medium text-gray-900">{schoolInfo.school.establishedYear}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Contact:</span>
                              <p className="font-medium text-gray-900">{schoolInfo.school.phone}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Student Grade Card */}
                <div>
                  <Card className="bg-white border border-gray-200 shadow-sm">
                    <CardContent className="p-6">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <BookOpen className="w-6 h-6 text-green-600" />
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">Current Grade</h4>
                        <span className={`inline-block px-4 py-2 text-lg font-bold rounded-lg ${schoolService.getGradeColor(schoolInfo.grade)}`}>
                          {schoolService.formatGrade(schoolInfo.grade)}
                        </span>
                        <p className="text-sm text-gray-500 mt-3">Student ID: {schoolInfo.childId}</p>
                        <p className="text-xs text-gray-400 mt-1">Enrolled: {new Date(schoolInfo.enrollmentDate).toLocaleDateString()}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Enrollment Status */}
            {isLoading ? (
              <Card className="bg-white border border-gray-200 shadow-sm">
                <CardContent className="p-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                    <GraduationCap className="w-8 h-8 text-gray-400" />
                  </div>
                  <CardTitle className="text-xl font-semibold text-gray-900 mb-2">
                    Loading Academic Information...
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Please wait while we check your enrollment status
                  </CardDescription>
                </CardContent>
              </Card>
            ) : enrollmentStatus?.enrolled ? (
              // When enrolled, show the overview tab content (already handled above)
              null
            ) : (
              <Card className="bg-white border border-amber-200 shadow-sm">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <GraduationCap className="w-8 h-8 text-amber-600" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-gray-900 mb-3">
                    School Enrollment Required
                  </CardTitle>
                  <CardDescription className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
                    {selectedChild?.name} is not currently enrolled in a school using the NeuroNurture platform.
                  </CardDescription>
                  
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-8 max-w-md mx-auto">
                    <p className="text-amber-800 font-medium mb-2">
                      <strong>Student ID:</strong> {enrollmentStatus?.childId || selectedChild?.id}
                    </p>
                    <p className="text-amber-700 text-sm">
                      Share this ID with your school during the enrollment process.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Benefits Section - Only show if not enrolled */}
            {!enrollmentStatus?.enrolled && (
              <>
                <Card className="bg-white border border-gray-200 shadow-sm">
                  <CardContent className="p-8">
                    <div className="text-center mb-8">
                      <CardTitle className="text-2xl font-bold text-gray-900 mb-3">
                        Benefits of NeuroNurture Schools
                      </CardTitle>
                      <CardDescription className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Partner schools provide enhanced educational experiences through our platform
                      </CardDescription>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                          <BookOpen className="w-6 h-6 text-blue-600" />
                        </div>
                        <h4 className="font-semibold text-lg text-gray-900 mb-2">Personalized Learning</h4>
                        <p className="text-gray-600 text-sm">
                          AI-powered learning paths tailored to your child's unique needs and progress
                        </p>
                      </div>

                      <div className="text-center">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                          <Trophy className="w-6 h-6 text-green-600" />
                        </div>
                        <h4 className="font-semibold text-lg text-gray-900 mb-2">Progress Tracking</h4>
                        <p className="text-gray-600 text-sm">
                          Real-time monitoring of academic progress and skill development
                        </p>
                      </div>

                      <div className="text-center">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                          <ClipboardList className="w-6 h-6 text-purple-600" />
                        </div>
                        <h4 className="font-semibold text-lg text-gray-900 mb-2">Interactive Activities</h4>
                        <p className="text-gray-600 text-sm">
                          Educational games and activities that make learning engaging and fun
                        </p>
                      </div>

                      <div className="text-center">
                        <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                          <User className="w-6 h-6 text-indigo-600" />
                        </div>
                        <h4 className="font-semibold text-lg text-gray-900 mb-2">Teacher Support</h4>
                        <p className="text-gray-600 text-sm">
                          Teachers receive detailed insights to better support your child's learning
                        </p>
                      </div>

                      <div className="text-center">
                        <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                          <Trophy className="w-6 h-6 text-amber-600" />
                        </div>
                        <h4 className="font-semibold text-lg text-gray-900 mb-2">Achievement System</h4>
                        <p className="text-gray-600 text-sm">
                          Celebrate milestones and motivate continued learning progress
                        </p>
                      </div>

                      <div className="text-center">
                        <div className="w-12 h-12 bg-rose-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                          <MapPin className="w-6 h-6 text-rose-600" />
                        </div>
                        <h4 className="font-semibold text-lg text-gray-900 mb-2">Parent Dashboard</h4>
                        <p className="text-gray-600 text-sm">
                          Stay informed about your child's school activities and academic progress
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Getting Started Card */}
                <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 shadow-sm">
                  <CardContent className="p-8">
                    <h4 className="text-xl font-bold text-gray-900 mb-6 text-center">
                      How to Get Started
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex items-start space-x-4">
                        <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold flex-shrink-0">1</span>
                        <div>
                          <h5 className="font-semibold text-gray-900 mb-1">Find a Partner School</h5>
                          <p className="text-gray-600 text-sm">Look for schools in your area that use our educational platform</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-4">
                        <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold flex-shrink-0">2</span>
                        <div>
                          <h5 className="font-semibold text-gray-900 mb-1">Complete Enrollment</h5>
                          <p className="text-gray-600 text-sm">Follow the school's enrollment process and requirements</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-4">
                        <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold flex-shrink-0">3</span>
                        <div>
                          <h5 className="font-semibold text-gray-900 mb-1">Provide Student ID</h5>
                          <p className="text-gray-600 text-sm">Share your child's ID ({enrollmentStatus?.childId || selectedChild?.id}) with the school</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-4">
                        <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold flex-shrink-0">4</span>
                        <div>
                          <h5 className="font-semibold text-gray-900 mb-1">Begin Learning</h5>
                          <p className="text-gray-600 text-sm">Once connected, access all academic features and resources</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Quick Features Preview - Only show if enrolled */}
            {enrollmentStatus?.enrolled && activeSchoolTab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <BookOpen className="w-6 h-6 text-blue-600" />
                    </div>
                    <CardTitle className="font-semibold text-lg text-gray-900 mb-2">
                      Academic Progress
                    </CardTitle>
                    <CardDescription className="text-gray-600 text-sm">
                      Track learning milestones and academic achievements
                    </CardDescription>
                  </CardContent>
                </Card>

                <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <ClipboardList className="w-6 h-6 text-green-600" />
                    </div>
                    <CardTitle className="font-semibold text-lg text-gray-900 mb-2">
                      School Activities
                    </CardTitle>
                    <CardDescription className="text-gray-600 text-sm">
                      Participate in assignments and educational activities
                    </CardDescription>
                  </CardContent>
                </Card>

                <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Trophy className="w-6 h-6 text-purple-600" />
                    </div>
                    <CardTitle className="font-semibold text-lg text-gray-900 mb-2">
                      Competitions
                    </CardTitle>
                    <CardDescription className="text-gray-600 text-sm">
                      Join school competitions and showcase your skills
                    </CardDescription>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}