import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SchoolEnrollmentStatus, schoolEnrollmentService } from '@/services/schoolEnrollmentService';
import { ChildSchoolInfo, schoolService } from '@/services/schoolService';
import { getCurrentChild } from '@/utils/childUtils';
import { GraduationCap, MapPin } from 'lucide-react';
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

  return (
    <div className="flex h-full">
      {/* Left Sidebar Navigation - Only show if enrolled */}
      {enrollmentStatus?.enrolled && (
        <div className="w-64 border-r border-gray-200">
          <div className="p-4 space-y-1">
            <Button
              variant={activeSchoolTab === 'overview' ? 'default' : 'ghost'}
              onClick={() => setActiveSchoolTab('overview')}
              className="w-full justify-start font-medium"
            >
              📊 Overview
            </Button>
            
            <Button
              variant={activeSchoolTab === 'tasks' ? 'default' : 'ghost'}
              onClick={() => setActiveSchoolTab('tasks')}
              className="w-full justify-start font-medium"
            >
              📝 Tasks
            </Button>
            
            <Button
              variant={activeSchoolTab === 'competition' ? 'default' : 'ghost'}
              onClick={() => setActiveSchoolTab('competition')}
              className="w-full justify-start font-medium"
            >
              🏆 Competition
            </Button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 space-y-6 px-1 py-2">
        {/* Header - Only show if not enrolled or on overview tab */}
        {(!enrollmentStatus?.enrolled || activeSchoolTab === 'overview') && (
          <div className="text-center">
            <h2 className="text-3xl font-playful text-primary mb-2 flex items-center justify-center">
              <span className="mr-2">🏫</span>
              School Connection
            </h2>
            <p className="text-lg font-comic text-muted-foreground">
              {selectedChild ? `${selectedChild.name}'s school enrollment status` : 'Check school enrollment status'}
            </p>
          </div>
        )}

        {/* Overview Tab Content - School Information */}
        {enrollmentStatus?.enrolled && activeSchoolTab === 'overview' && schoolInfo && (
          <div className="flex justify-center">
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-lg max-w-2xl w-full">
              <CardHeader className="text-center pb-6">
                <div className="flex items-center justify-center mb-4">
                  <div className="bg-blue-100 p-4 rounded-full">
                    <span className="text-3xl">🏫</span>
                  </div>
                </div>
                <CardTitle className="text-3xl font-bold text-blue-800 mb-3">
                  {schoolInfo.school.schoolName}
                </CardTitle>
                <div className="flex items-center justify-center space-x-2 text-gray-600 mb-6">
                  <MapPin className="h-5 w-5" />
                  <span className="text-base">{schoolInfo.school.address}</span>
                </div>
                
                {/* Student Grade Section */}
                <div className="bg-white/70 rounded-xl p-6 border border-blue-100">
                  <div className="flex items-center justify-center mb-3">
                    <div className="bg-emerald-100 p-2 rounded-full">
                      <GraduationCap className="h-6 w-6 text-emerald-600" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Current Grade</h3>
                  <Badge className={`px-8 py-4 text-lg font-bold ${schoolService.getGradeColor(schoolInfo.grade)} shadow-md`}>
                    {schoolService.formatGrade(schoolInfo.grade)}
                  </Badge>
                  <p className="text-sm text-gray-500 mt-3">Student ID: {schoolInfo.childId}</p>
                </div>
              </CardHeader>
            </Card>
          </div>
        )}

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
        <>

      {/* School Enrollment Status */}
      {isLoading ? (
        <Card className="card-playful border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5 p-8 backdrop-blur-sm bg-white/80">
          <div className="text-center">
            <div className="text-4xl mb-4 animate-pulse">🏫</div>
            <CardTitle className="text-xl font-playful text-primary mb-2">
              Loading School Information...
            </CardTitle>
            <CardDescription className="text-base font-comic text-muted-foreground">
              Please wait while we check the enrollment status
            </CardDescription>
          </div>
        </Card>
      ) : enrollmentStatus?.enrolled ? (
        // When enrolled, show the overview tab content (already handled above)
        null
      ) : (
        <Card className="card-playful border-2 border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50 p-8 backdrop-blur-sm bg-white/80">
          <div className="text-center">
            <div className="text-4xl mb-4">🏫</div>
            <CardTitle className="text-2xl font-playful text-orange-600 mb-3">
              Not Enrolled in School Yet
            </CardTitle>
            <CardDescription className="text-lg font-comic text-muted-foreground mb-6">
              {selectedChild?.name} is not currently enrolled in a school that uses NeuroNurture.
            </CardDescription>
            
            <div className="bg-orange-100 border border-orange-300 rounded-lg p-4 mb-6">
              <p className="font-comic text-orange-800 text-base mb-2">
                <strong>Child ID:</strong> {enrollmentStatus?.childId || selectedChild?.id}
              </p>
              <p className="font-comic text-orange-800 text-sm">
                Share this ID with your school when enrolling your child.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Benefits Section - Only show if not enrolled */}
      {!enrollmentStatus?.enrolled && (
        <Card className="card-playful border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-8 backdrop-blur-sm bg-white/80">
          <div className="text-center mb-6">
            <CardTitle className="text-2xl font-playful text-blue-600 mb-3">
              Why Choose a NeuroNurture School? 🌟
            </CardTitle>
            <CardDescription className="text-lg font-comic text-muted-foreground">
              Schools using NeuroNurture provide enhanced learning experiences for your child
            </CardDescription>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="text-center space-y-3">
              <div className="text-4xl bounce-gentle">🧠</div>
              <h4 className="font-playful text-lg text-blue-600">Personalized Learning</h4>
              <p className="font-comic text-sm text-muted-foreground">
                AI-powered learning paths tailored to your child's unique needs and pace
              </p>
            </div>

            <div className="text-center space-y-3">
              <div className="text-4xl float">📊</div>
              <h4 className="font-playful text-lg text-blue-600">Progress Tracking</h4>
              <p className="font-comic text-sm text-muted-foreground">
                Real-time monitoring of academic progress and skill development
              </p>
            </div>

            <div className="text-center space-y-3">
              <div className="text-4xl wiggle">🎮</div>
              <h4 className="font-playful text-lg text-blue-600">Interactive Games</h4>
              <p className="font-comic text-sm text-muted-foreground">
                Educational games that make learning fun and engaging
              </p>
            </div>

            <div className="text-center space-y-3">
              <div className="text-4xl bounce-gentle">👨‍🏫</div>
              <h4 className="font-playful text-lg text-blue-600">Teacher Support</h4>
              <p className="font-comic text-sm text-muted-foreground">
                Teachers get detailed insights to better support your child
              </p>
            </div>

            <div className="text-center space-y-3">
              <div className="text-4xl float">🏆</div>
              <h4 className="font-playful text-lg text-blue-600">Achievement System</h4>
              <p className="font-comic text-sm text-muted-foreground">
                Celebrate milestones and motivate continued learning
              </p>
            </div>

            <div className="text-center space-y-3">
              <div className="text-4xl wiggle">📱</div>
              <h4 className="font-playful text-lg text-blue-600">Parent Dashboard</h4>
              <p className="font-comic text-sm text-muted-foreground">
                Stay informed about your child's school activities and progress
              </p>
            </div>
          </div>

          <div className="mt-8 p-6 bg-blue-100 border border-blue-300 rounded-lg">
            <h4 className="font-playful text-lg text-blue-800 mb-3 text-center">
              How to Get Started 🚀
            </h4>
            <div className="space-y-3 text-left">
              <div className="flex items-start space-x-3">
                <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">1</span>
                <p className="font-comic text-blue-800">
                  <strong>Find a NeuroNurture School:</strong> Look for schools in your area that use our platform
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">2</span>
                <p className="font-comic text-blue-800">
                  <strong>Enroll Your Child:</strong> Complete the school's enrollment process
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">3</span>
                <p className="font-comic text-blue-800">
                  <strong>Provide Child ID:</strong> Give your child's ID ({enrollmentStatus?.childId || selectedChild?.id}) to the school
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">4</span>
                <p className="font-comic text-blue-800">
                  <strong>Start Learning:</strong> Once added by the school, you'll see the connection here!
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* School Features Preview - Only show if enrolled */}
      {enrollmentStatus?.enrolled && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="card-playful hover:scale-105 hover:shadow-lg transition-all duration-300 group p-6 backdrop-blur-sm bg-white/80">
            <div className="text-center space-y-3">
              <div className="text-3xl bounce-gentle">📚</div>
              <CardTitle className="font-playful text-lg group-hover:text-primary transition-colors">
                Academic Progress
              </CardTitle>
              <CardDescription className="font-comic text-sm">
                Track learning milestones and academic achievements
              </CardDescription>
            </div>
          </Card>

          <Card className="card-playful hover:scale-105 hover:shadow-lg transition-all duration-300 group p-6 backdrop-blur-sm bg-white/80">
            <div className="text-center space-y-3">
              <div className="text-3xl float">🎯</div>
              <CardTitle className="font-playful text-lg group-hover:text-primary transition-colors">
                School Activities
              </CardTitle>
              <CardDescription className="font-comic text-sm">
                Participate in school events and competitions
              </CardDescription>
            </div>
          </Card>

          <Card className="card-playful hover:scale-105 hover:shadow-lg transition-all duration-300 group p-6 backdrop-blur-sm bg-white/80">
            <div className="text-center space-y-3">
              <div className="text-3xl wiggle">👥</div>
              <CardTitle className="font-playful text-lg group-hover:text-primary transition-colors">
                Teacher Communication
              </CardTitle>
              <CardDescription className="font-comic text-sm">
                Stay connected with teachers and school staff
              </CardDescription>
            </div>
          </Card>
        </div>
      )}

      {/* Coming Soon Features */}
      <Card className="card-playful p-6 backdrop-blur-sm bg-white/80">
        <div className="text-center">
          <h3 className="font-playful text-xl text-primary mb-3">
            Coming Soon! 🌟
          </h3>
          <p className="font-comic text-lg text-muted-foreground mb-4">
            We're working on amazing school integration features:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-left">
            <div className="flex items-center space-x-2">
              <span className="text-lg">📊</span>
              <span className="font-comic">Detailed Progress Reports</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-lg">🏆</span>
              <span className="font-comic">School Competitions</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-lg">📝</span>
              <span className="font-comic">Assignment Tracking</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-lg">📅</span>
              <span className="font-comic">School Calendar</span>
            </div>
          </div>
        </div>
      </Card>
        </>
      )}
      </div>
    </div>
  );
}