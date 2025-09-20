import ChildTaskAssignmentModal from '@/features/school/components/ChildTaskAssignmentModal';
import { useSchoolAuth } from '@/features/school/contexts/SchoolAuthContext';
import { childrenService, SchoolChild } from '@/shared/services/child/childrenService';
import { GamePerformance, gamePerformanceService } from '@/shared/services/game/gamePerformanceService';
import {
    ArrowLeft,
    BarChart3,
    BookOpen,
    Calendar,
    Clock,
    Edit3,
    GraduationCap,
    Mail,
    MapPin,
    Play,
    Save,
    Trophy,
    User,
    Users,
    X,
    XCircle
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

interface Child extends SchoolChild {
  avatar?: string;
}


interface Task {
  taskId: number;
  schoolId: number;
  childId: number;
  childName: string;
  gameId: number;
  selectedGames: string[];
  taskTitle: string;
  taskDescription: string;
  startTime: string;
  endTime: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface RecentActivity {
  gameName: string;
  sessionId: string;
  timestamp: string;
  score: string;
  status: string;
  gameServiceUrl: string;
}

const ChildProfile: React.FC = () => {
  const { childId } = useParams<{ childId: string }>();
  const { school } = useSchoolAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'games' | 'tasks'>('overview');
  const [child, setChild] = useState<Child | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditingGrade, setIsEditingGrade] = useState(false);
  const [realStats, setRealStats] = useState({
    totalGameSessions: 0,
    uniqueTasksParticipated: 0,
    lastActiveDate: null as Date | null
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isLoadingActivity, setIsLoadingActivity] = useState(false);
  const [editingGrade, setEditingGrade] = useState('');
  const [isUpdatingGrade, setIsUpdatingGrade] = useState(false);
  const [gamePerformances, setGamePerformances] = useState<GamePerformance[]>([]);
  const [isLoadingGames, setIsLoadingGames] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);

  // Grade options with beautiful names and descriptions
  const gradeOptions = [
    {
      value: 'Gentle Bloom',
      label: 'Gentle Bloom',
      description: 'Mild autism - Needs gentle guidance and support',
      color: 'text-green-600 bg-green-100',
      icon: '🌱'
    },
    {
      value: 'Rising Star',
      label: 'Rising Star',
      description: 'Moderate autism - Shows great potential with structured learning',
      color: 'text-blue-600 bg-blue-100',
      icon: '⭐'
    },
    {
      value: 'Bright Light',
      label: 'Bright Light',
      description: 'Severe autism - Needs intensive support and specialized care',
      color: 'text-purple-600 bg-purple-100',
      icon: '✨'
    }
  ];



  // Fetch child data
  useEffect(() => {
    const fetchChildData = async () => {
      if (!childId || !school?.id) return;

      setIsLoading(true);
      setError('');

      try {
        const children = await childrenService.getChildrenBySchool(parseInt(school.id));
        const childData = children.find(c => c.id.toString() === childId);

        if (!childData) {
          setError('Child not found');
          return;
        }

        setChild(childData);
        
        // Fetch real game stats and recent activity
        if (childId) {
          await fetchRealGameStats(childId);
          await fetchRecentActivity(childId);
        }
      } catch (error) {
        console.error('Error fetching child data:', error);
        setError('Failed to load child data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchChildData();
  }, [childId, school?.id]);

  // Fetch game performances when games tab is active
  useEffect(() => {
    const fetchGamePerformances = async () => {
      if (!childId || activeTab !== 'games') return;

      setIsLoadingGames(true);
      try {
        const performances = await gamePerformanceService.getGamePerformances(childId);
        setGamePerformances(performances);
      } catch (error) {
        console.error('Error fetching game performances:', error);
      } finally {
        setIsLoadingGames(false);
      }
    };

    fetchGamePerformances();
  }, [childId, activeTab]);

  // Fetch tasks when tasks tab is active
  useEffect(() => {
    const fetchTasks = async () => {
      if (!childId || activeTab !== 'tasks') return;

      setIsLoadingTasks(true);
      try {
        const response = await fetch(`http://localhost:8091/api/school/tasks/child/${childId}`);
        if (response.ok) {
          const tasksData = await response.json();
          setTasks(tasksData || []);
        } else {
          console.error('Failed to fetch tasks:', response.status);
          setTasks([]);
        }
      } catch (error) {
        console.error('Error fetching tasks:', error);
        setTasks([]);
      } finally {
        setIsLoadingTasks(false);
      }
    };

    fetchTasks();
  }, [childId, activeTab]);

  // SchoolAuthGuard handles authentication, so we can assume school exists here

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 80) return 'text-blue-600 bg-blue-100';
    if (score >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Good';
    if (score >= 70) return 'Average';
    return 'Needs Improvement';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'in_progress': return 'text-blue-600 bg-blue-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'overdue': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTaskStatus = (task: Task) => {
    const now = new Date();
    const endTime = new Date(task.endTime);
    return endTime > now ? 'active' : 'ended';
  };

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'ended': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTaskStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Clock className="h-4 w-4" />;
      case 'ended': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysSinceLastActive = (lastActive: string) => {
    const lastActiveDate = new Date(lastActive);
    const now = new Date();
    const diffTime = now.getTime() - lastActiveDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const fetchRealGameStats = async (childId: string) => {
    try {
      const response = await fetch(`http://localhost:8091/api/school/tasks/child/${childId}/stats`);
      if (response.ok) {
        const stats = await response.json();
        setRealStats({
          totalGameSessions: stats.totalGameSessions || 0,
          uniqueTasksParticipated: stats.uniqueTasksParticipated || 0,
          lastActiveDate: stats.lastActiveDate ? new Date(stats.lastActiveDate) : null
        });
      } else {
        console.error('Failed to fetch child game stats:', response.status);
        setRealStats({
          totalGameSessions: 0,
          uniqueTasksParticipated: 0,
          lastActiveDate: null
        });
      }
    } catch (error) {
      console.error('Error fetching real game stats:', error);
      setRealStats({
        totalGameSessions: 0,
        uniqueTasksParticipated: 0,
        lastActiveDate: null
      });
    }
  };

  const fetchRecentActivity = async (childId: string) => {
    setIsLoadingActivity(true);
    try {
      const response = await fetch(`http://localhost:8091/api/school/tasks/child/${childId}/recent-activity`);
      if (response.ok) {
        const activities = await response.json();
        setRecentActivity(activities || []);
      } else {
        console.error('Failed to fetch recent activity:', response.status);
        setRecentActivity([]);
      }
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      setRecentActivity([]);
    } finally {
      setIsLoadingActivity(false);
    }
  };

  const getImprovementColor = (improvement: number) => {
    if (improvement > 0) return 'text-green-600';
    if (improvement < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const handleGradeEdit = () => {
    setIsEditingGrade(true);
    setEditingGrade(child?.grade || '');
  };

  const handleGradeSave = async () => {
    if (!child || !school?.id) return;

    setIsUpdatingGrade(true);
    try {
      const response = await fetch(`http://localhost:8082/api/parents/children/${child.id}/enroll-school`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          schoolId: parseInt(school.id),
          grade: editingGrade
        }),
      });

      if (response.ok) {
        // Update local state
        setChild(prev => prev ? { ...prev, grade: editingGrade } : null);
        setIsEditingGrade(false);
        alert('Grade updated successfully!');
      } else {
        const errorText = await response.text();
        alert(`Failed to update grade: ${errorText}`);
      }
    } catch (error) {
      console.error('Error updating grade:', error);
      alert('Failed to update grade. Please try again.');
    } finally {
      setIsUpdatingGrade(false);
    }
  };

  const handleGradeCancel = () => {
    setIsEditingGrade(false);
    setEditingGrade('');
  };

  const getGradeInfo = (grade: string) => {
    return gradeOptions.find(option => option.value === grade) || gradeOptions[0];
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading child data...</span>
        </div>
      </div>
    );
  }

  if (error || !child) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error || 'Child not found'}</p>
          <Link
            to="/school/children"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Children
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to="/school/children"
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{child.name}</h1>
          </div>
        </div>
        
        <div className="flex space-x-3">
          <Link
            to={`/school/children/${childId}/progress`}
            className="inline-flex items-center px-4 py-2 bg-gray-800 text-white text-sm font-medium rounded hover:bg-gray-900 transition-colors"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            View Progress
          </Link>
        </div>
      </div>

      {/* Child Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded bg-green-100 text-green-700">
              <Play className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Game Sessions</p>
              <p className="text-2xl font-bold text-gray-900">{realStats.totalGameSessions}</p>
              <p className="text-sm text-gray-500">Across all games</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded bg-yellow-100 text-yellow-700">
              <BookOpen className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tasks Participated</p>
              <p className="text-2xl font-bold text-gray-900">{realStats.uniqueTasksParticipated}</p>
              <p className="text-sm text-gray-500">Unique task IDs</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded bg-gray-100 text-gray-700">
              <Clock className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Last Active</p>
              <p className="text-2xl font-bold text-gray-900">
                {realStats.lastActiveDate ? '2' : 'N/A'}
              </p>
              <p className="text-sm text-gray-500">days ago</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', name: 'Overview', icon: BarChart3 },
              { id: 'games', name: 'Game Performance', icon: Trophy },
              { id: 'tasks', name: 'Tasks', icon: BookOpen }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-gray-800 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Information Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Personal Information */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center space-x-2 mb-6">
                    <div className="p-2 bg-gray-100 rounded">
                      <User className="h-5 w-5 text-gray-700" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">Personal Information</h3>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded border border-gray-200">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-gray-700" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Full Name</p>
                        <p className="font-semibold text-gray-900">{child.name}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded border border-gray-200">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-gray-700" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Age</p>
                        <p className="font-semibold text-gray-900">{child.age} years old</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded border border-gray-200">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5 text-gray-700" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Gender</p>
                        <p className="font-semibold text-gray-900">{child.gender}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 rounded border border-gray-200 text-center">
                        <p className="text-sm text-gray-600">Height</p>
                        <p className="text-2xl font-bold text-gray-900">{child.height}</p>
                        <p className="text-xs text-gray-500">cm</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded border border-gray-200 text-center">
                        <p className="text-sm text-gray-600">Weight</p>
                        <p className="text-2xl font-bold text-gray-900">{child.weight}</p>
                        <p className="text-xs text-gray-500">kg</p>
                      </div>
                    </div>
                    
                    {/* Grade Information */}
                    <div className="p-6 bg-gray-50 rounded border border-gray-200">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          <div className="p-2 bg-gray-100 rounded">
                            <GraduationCap className="h-5 w-5 text-gray-700" />
                          </div>
                          <h4 className="text-lg font-semibold text-gray-900">Current Grade</h4>
                        </div>
                        {isEditingGrade ? (
                          <div className="flex items-center space-x-3">
                            <select
                              value={editingGrade}
                              onChange={(e) => setEditingGrade(e.target.value)}
                              className="px-4 py-2 border-2 border-blue-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                            >
                              {gradeOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                            <button
                              onClick={handleGradeSave}
                              disabled={isUpdatingGrade}
                              className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2 shadow-md"
                            >
                              <Save className="h-4 w-4" />
                              <span>{isUpdatingGrade ? 'Saving...' : 'Save Changes'}</span>
                            </button>
                            <button
                              onClick={handleGradeCancel}
                              className="px-4 py-2 bg-gray-500 text-white text-sm font-medium rounded-lg hover:bg-gray-600 flex items-center space-x-2 shadow-md"
                            >
                              <X className="h-4 w-4" />
                              <span>Cancel</span>
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={handleGradeEdit}
                            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 flex items-center space-x-2 shadow-md transition-all duration-200 hover:shadow-lg"
                            title="Edit Grade"
                          >
                            <Edit3 className="h-4 w-4" />
                            <span>Edit Grade</span>
                          </button>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <div className={`inline-flex items-center space-x-3 px-4 py-3 rounded-full text-base font-semibold ${getGradeInfo(child.grade).color} shadow-sm`}>
                            <span className="text-xl">{getGradeInfo(child.grade).icon}</span>
                            <span>{child.grade}</span>
                          </div>
                          <p className="text-sm text-gray-600 mt-3 font-medium">
                            {getGradeInfo(child.grade).description}
                          </p>
                        </div>
                        
                        {!isEditingGrade && (
                          <div className="text-right">
                            <p className="text-xs text-gray-500 mb-1">Click to promote/demote</p>
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Parent Information */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center space-x-2 mb-6">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Users className="h-5 w-5 text-green-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">Parent Information</h3>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Parent Name</p>
                        <p className="font-semibold text-gray-900">{child.parentName}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Mail className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="font-semibold text-gray-900">{child.parentEmail}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mt-1">
                        <MapPin className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Address</p>
                        <p className="font-semibold text-gray-900">{child.parentAddress}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity Section */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center space-x-2 mb-6">
                  <div className="p-2 bg-blue-100 rounded">
                    <Clock className="h-5 w-5 text-blue-700" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">Recent Activity</h3>
                </div>
                
                {isLoadingActivity ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-gray-600">Loading recent activity...</span>
                  </div>
                ) : recentActivity.length > 0 ? (
                  <div className="space-y-4">
                    {recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded border border-gray-200 hover:bg-gray-100 transition-colors">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <Play className="h-5 w-5 text-blue-700" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{activity.gameName}</p>
                            <p className="text-sm text-gray-600">Session: {activity.sessionId}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">{activity.score}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(activity.timestamp).toLocaleDateString()} at {new Date(activity.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No recent activity found</p>
                    <p className="text-sm text-gray-500">This child hasn't played any games recently</p>
                  </div>
                )}
              </div>
            </div>
          )}

                {/* Games Tab */}
                {activeTab === 'games' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-900">Game Performance Overview</h3>
                      {isLoadingGames && (
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                          <span>Loading game data...</span>
                        </div>
                      )}
                    </div>
                    
                    {isLoadingGames ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div key={i} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200 p-4 animate-pulse">
                            <div className="flex items-center justify-between mb-3">
                              <div className="h-4 bg-gray-300 rounded w-24"></div>
                              <div className="h-6 bg-gray-300 rounded-full w-12"></div>
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <div className="h-3 bg-gray-300 rounded w-16"></div>
                                <div className="h-3 bg-gray-300 rounded w-8"></div>
                              </div>
                              <div className="flex justify-between items-center">
                                <div className="h-3 bg-gray-300 rounded w-20"></div>
                                <div className="h-3 bg-gray-300 rounded w-10"></div>
                              </div>
                              <div className="flex justify-between items-center">
                                <div className="h-3 bg-gray-300 rounded w-18"></div>
                                <div className="h-3 bg-gray-300 rounded w-6"></div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {gamePerformances.map((game) => (
                          <div key={game.gameName} className="bg-gradient-to-br from-white to-gray-50 rounded-lg border border-gray-200 p-4 hover:shadow-lg hover:border-blue-300 transition-all duration-200">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-base font-semibold text-gray-900">{game.gameName}</h4>
                              <div className={`px-2 py-1 rounded-full text-xs font-bold ${getScoreColor(game.averageScore)}`}>
                                {game.averageScore}%
                              </div>
                            </div>
                            
                            {/* 3 Key Insights */}
                            <div className="space-y-2">
                              {game.insights.map((insight, index) => (
                                <div key={index} className="flex items-center justify-between py-1">
                                  <div className="flex-1">
                                    <p className="text-xs text-gray-500 font-medium">{insight.title}</p>
                                  </div>
                                  <div className={`text-sm font-bold ${insight.color}`}>
                                    {insight.value}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

          {/* Tasks Tab */}
          {activeTab === 'tasks' && (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Assigned Tasks</h3>
                  <button
                    onClick={() => setShowTaskModal(true)}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    Assign New Task
                  </button>
                </div>
              
              {isLoadingTasks ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-gray-600">Loading tasks...</span>
                </div>
              ) : tasks.length > 0 ? (
                <div className="space-y-4">
                  {tasks.map((task) => {
                    const taskStatus = getTaskStatus(task);
                    return (
                      <div 
                        key={task.taskId} 
                        className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md hover:border-gray-300 transition-all duration-200 cursor-pointer"
                        onClick={() => window.location.href = `/school/tasks/${task.taskId}`}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-lg font-semibold text-gray-900">{task.taskTitle}</h4>
                          <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 ${getTaskStatusColor(taskStatus)}`}>
                            {getTaskStatusIcon(taskStatus)}
                            <span className="capitalize">{taskStatus}</span>
                          </div>
                        </div>
                        
                        <p className="text-gray-600 mb-4">{task.taskDescription}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-sm text-gray-600 mb-1">Start Time</p>
                            <p className="font-medium text-gray-900">{formatDate(task.startTime)}</p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-sm text-gray-600 mb-1">End Time</p>
                            <p className="font-medium text-gray-900">{formatDate(task.endTime)}</p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-sm text-gray-600 mb-1">Games</p>
                            <p className="font-medium text-gray-900">{task.selectedGames.join(', ')}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span>Task ID: {task.taskId}</span>
                          <span>Click to view details →</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Tasks Assigned</h3>
                  <p className="text-gray-600 mb-4">This child doesn't have any tasks assigned yet.</p>
                  <button
                    onClick={() => setShowTaskModal(true)}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    Assign First Task
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Child Task Assignment Modal */}
      {school && child && (
        <ChildTaskAssignmentModal
          isOpen={showTaskModal}
          onClose={() => setShowTaskModal(false)}
          schoolId={parseInt(school.id)}
          childId={child.id}
          childName={child.name}
        />
      )}
    </div>
  );
};

export default ChildProfile;
