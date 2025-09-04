import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSchoolAuth } from '@/contexts/school/SchoolAuthContext';
import { 
  ArrowLeft,
  Users,
  BookOpen,
  Trophy,
  BarChart3,
  Calendar,
  TrendingUp,
  Target,
  Award,
  Clock,
  CheckCircle,
  XCircle,
  Play
} from 'lucide-react';

interface Child {
  id: string;
  name: string;
  grade: string;
  age: number;
  parentName: string;
  parentEmail: string;
  enrollmentDate: string;
  lastActive: string;
  overallScore: number;
  gamesPlayed: number;
  tasksCompleted: number;
  avatar?: string;
}

interface GamePerformance {
  gameName: string;
  score: number;
  gamesPlayed: number;
  lastPlayed: string;
  improvement: number;
}

interface Task {
  id: string;
  title: string;
  description: string;
  assignedDate: string;
  dueDate: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  score?: number;
  maxScore: number;
}

const mockChild: Child = {
  id: '1',
  name: 'Sarah Johnson',
  grade: 'Grade 3',
  age: 8,
  parentName: 'Michael Johnson',
  parentEmail: 'michael.johnson@email.com',
  enrollmentDate: '2024-01-15',
  lastActive: '2024-01-20',
  overallScore: 87,
  gamesPlayed: 24,
  tasksCompleted: 18
};

const mockGamePerformance: GamePerformance[] = [
  {
    gameName: 'Gesture Recognition',
    score: 92,
    gamesPlayed: 8,
    lastPlayed: '2024-01-20',
    improvement: 15
  },
  {
    gameName: 'Mirror Posture',
    score: 85,
    gamesPlayed: 6,
    lastPlayed: '2024-01-19',
    improvement: 8
  },
  {
    gameName: 'Gaze Tracking',
    score: 78,
    gamesPlayed: 5,
    lastPlayed: '2024-01-18',
    improvement: 12
  },
  {
    gameName: 'Repeat With Me',
    score: 90,
    gamesPlayed: 3,
    lastPlayed: '2024-01-17',
    improvement: 20
  },
  {
    gameName: 'Dance Doodle',
    score: 88,
    gamesPlayed: 2,
    lastPlayed: '2024-01-16',
    improvement: 5
  }
];

const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Math Quiz - Addition',
    description: 'Complete 20 addition problems within 10 minutes',
    assignedDate: '2024-01-18',
    dueDate: '2024-01-25',
    status: 'completed',
    score: 18,
    maxScore: 20
  },
  {
    id: '2',
    title: 'Reading Comprehension',
    description: 'Read the story and answer 5 questions',
    assignedDate: '2024-01-19',
    dueDate: '2024-01-26',
    status: 'in_progress',
    maxScore: 5
  },
  {
    id: '3',
    title: 'Science Project',
    description: 'Create a simple experiment and document results',
    assignedDate: '2024-01-15',
    dueDate: '2024-01-22',
    status: 'overdue',
    maxScore: 10
  }
];

const ChildProfile: React.FC = () => {
  const { childId } = useParams<{ childId: string }>();
  const { school } = useSchoolAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'games' | 'tasks'>('overview');

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

  const getImprovementColor = (improvement: number) => {
    if (improvement > 0) return 'text-green-600';
    if (improvement < 0) return 'text-red-600';
    return 'text-gray-600';
  };

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
            <h1 className="text-2xl font-bold text-gray-900">{mockChild.name}</h1>
            <p className="text-gray-600">
              {mockChild.grade} • {mockChild.age} years old • Child ID: {mockChild.id}
            </p>
          </div>
        </div>
        
        <div className="flex space-x-3">
          <Link
            to={`/school/children/${childId}/progress`}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            View Progress
          </Link>
          <Link
            to={`/school/children/${childId}/tasks`}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <BookOpen className="h-4 w-4 mr-2" />
            Manage Tasks
          </Link>
        </div>
      </div>

      {/* Child Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-500 text-white">
              <Target className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Overall Score</p>
              <p className="text-2xl font-bold text-gray-900">{mockChild.overallScore}%</p>
              <p className={`text-sm font-medium ${getScoreColor(mockChild.overallScore)}`}>
                {getScoreLabel(mockChild.overallScore)}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-500 text-white">
              <Play className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Games Played</p>
              <p className="text-2xl font-bold text-gray-900">{mockChild.gamesPlayed}</p>
              <p className="text-sm text-gray-500">Total sessions</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-yellow-500 text-white">
              <BookOpen className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tasks Completed</p>
              <p className="text-2xl font-bold text-gray-900">{mockChild.tasksCompleted}</p>
              <p className="text-sm text-gray-500">Out of assigned</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-purple-500 text-white">
              <Clock className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Last Active</p>
              <p className="text-2xl font-bold text-gray-900">
                {getDaysSinceLastActive(mockChild.lastActive)}d
              </p>
              <p className="text-sm text-gray-500">ago</p>
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
                    ? 'border-blue-500 text-blue-600'
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
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Full Name:</span>
                      <span className="font-medium">{mockChild.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Grade:</span>
                      <span className="font-medium">{mockChild.grade}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Age:</span>
                      <span className="font-medium">{mockChild.age} years</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Enrollment Date:</span>
                      <span className="font-medium">{formatDate(mockChild.enrollmentDate)}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Parent Information</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Parent Name:</span>
                      <span className="font-medium">{mockChild.parentName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Parent Email:</span>
                      <span className="font-medium">{mockChild.parentEmail}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm font-medium">Completed Math Quiz</p>
                      <p className="text-xs text-gray-500">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Play className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium">Played Gesture Recognition Game</p>
                      <p className="text-xs text-gray-500">1 day ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <BookOpen className="h-5 w-5 text-yellow-600" />
                    <div>
                      <p className="text-sm font-medium">Started Reading Comprehension Task</p>
                      <p className="text-xs text-gray-500">2 days ago</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Games Tab */}
          {activeTab === 'games' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Game Performance Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockGamePerformance.map((game) => (
                  <div key={game.gameName} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">{game.gameName}</h4>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(game.score)}`}>
                        {game.score}%
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Games Played:</span>
                        <span className="font-medium">{game.gamesPlayed}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Last Played:</span>
                        <span className="font-medium">{formatDate(game.lastPlayed)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Improvement:</span>
                        <span className={`font-medium ${getImprovementColor(game.improvement)}`}>
                          {game.improvement > 0 ? '+' : ''}{game.improvement}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tasks Tab */}
          {activeTab === 'tasks' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Assigned Tasks</h3>
                <Link
                  to={`/school/children/${childId}/tasks/assign`}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Assign New Task
                </Link>
              </div>
              
              <div className="space-y-4">
                {mockTasks.map((task) => (
                  <div key={task.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">{task.title}</h4>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                        {task.status.replace('_', ' ')}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex space-x-4">
                        <span className="text-gray-600">
                          Assigned: {formatDate(task.assignedDate)}
                        </span>
                        <span className="text-gray-600">
                          Due: {formatDate(task.dueDate)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {task.status === 'completed' && task.score && (
                          <span className="font-medium">
                            Score: {task.score}/{task.maxScore}
                          </span>
                        )}
                        <span className="text-gray-600">
                          Max Score: {task.maxScore}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChildProfile;
