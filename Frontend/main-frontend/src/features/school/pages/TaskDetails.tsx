import { useSchoolAuth } from '@/features/school/contexts/SchoolAuthContext';
import {
    ArrowLeft,
    Calendar,
    CheckCircle,
    Clock,
    HelpCircle,
    Search,
    SortAsc,
    SortDesc,
    Users,
    X,
    XCircle
} from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

interface Child {
  id: string;
  name: string;
  grade: string;
  age: number;
  parentName: string;
  enrollmentDate: string;
}

interface TaskGame {
  gameId: string;
  gameName: string;
  completed: boolean;
  bestScore?: number;
  playCount: number;
  lastPlayed?: string;
  scoreHistory: Array<{ score: number; date: string; time: string }>;
}

interface TaskDetails {
  taskId: number;
  title: string;
  description: string;
  assignedDate: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'expired';
  totalAssigned: number;
  completedCount: number;
  selectedGames: string[];
}

interface TaskPerformanceDto {
  childId: string;
  childName: string;
  grade: string;
  parentName: string;
  games: TaskGame[];
}

interface Game {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
}

// Mock data - in real app this would come from API
const availableGames: Game[] = [
  { id: 'gaze-tracking', name: 'Gaze Tracking', description: 'Follow moving objects with your eyes', icon: '👁️', category: 'Cognitive' },
  { id: 'gesture-control', name: 'Gesture Control', description: 'Control games with hand movements', icon: '✋', category: 'Motor Skills' },
  { id: 'mirror-posture', name: 'Mirror Posture', description: 'Copy and maintain correct posture', icon: '🧍', category: 'Physical' },
  { id: 'repeat-with-me', name: 'Repeat With Me', description: 'Follow audio and visual patterns', icon: '🔄', category: 'Memory' },
  { id: 'dance-doodle', name: 'Dance Doodle', description: 'Create art through movement', icon: '💃', category: 'Creative' }
];

// Function to get score description for each game
const getScoreDescription = (gameId: string): string => {
  switch (gameId) {
    case 'gaze-tracking':
      return 'Balloons popped (higher is better)';
    case 'gesture-control':
      return 'Total completion time in seconds (lower is better)';
    case 'mirror-posture':
      return 'Total completion time in seconds (lower is better)';
    case 'repeat-with-me':
      return 'Average accuracy percentage (higher is better)';
    case 'dance-doodle':
      return 'Total completion time in seconds (lower is better)';
    default:
      return 'Performance score';
  }
};

const mockChildren: Child[] = [
  { id: '1', name: 'Emma Johnson', grade: 'Gentle Bloom', age: 6, parentName: 'Sarah Johnson', enrollmentDate: '2023-09-01' },
  { id: '2', name: 'Liam Smith', grade: 'Gentle Bloom', age: 6, parentName: 'Michael Smith', enrollmentDate: '2023-09-01' },
  { id: '3', name: 'Olivia Davis', grade: 'Gentle Bloom', age: 6, parentName: 'Jennifer Davis', enrollmentDate: '2023-09-01' },
  { id: '4', name: 'Noah Wilson', grade: 'Rising Star', age: 7, parentName: 'Robert Wilson', enrollmentDate: '2023-09-01' },
  { id: '5', name: 'Ava Brown', grade: 'Rising Star', age: 7, parentName: 'Lisa Brown', enrollmentDate: '2023-09-01' },
  { id: '6', name: 'William Taylor', grade: 'Rising Star', age: 7, parentName: 'David Taylor', enrollmentDate: '2023-09-01' },
  { id: '7', name: 'Sophia Anderson', grade: 'Rising Star', age: 7, parentName: 'Maria Anderson', enrollmentDate: '2023-09-01' },
  { id: '8', name: 'James Martinez', grade: 'Bright Light', age: 8, parentName: 'Carlos Martinez', enrollmentDate: '2023-09-01' },
  { id: '9', name: 'Isabella Garcia', grade: 'Bright Light', age: 8, parentName: 'Ana Garcia', enrollmentDate: '2023-09-01' },
  { id: '10', name: 'Benjamin Rodriguez', grade: 'Bright Light', age: 8, parentName: 'Jose Rodriguez', enrollmentDate: '2023-09-01' },
  { id: '11', name: 'Mia Lopez', grade: 'Bright Light', age: 9, parentName: 'Carmen Lopez', enrollmentDate: '2023-09-01' },
  { id: '12', name: 'Lucas Gonzalez', grade: 'Bright Light', age: 9, parentName: 'Manuel Gonzalez', enrollmentDate: '2023-09-01' },
  { id: '13', name: 'Charlotte Perez', grade: 'Bright Light', age: 9, parentName: 'Rosa Perez', enrollmentDate: '2023-09-01' },
  { id: '14', name: 'Mason Torres', grade: 'Bright Light', age: 9, parentName: 'Juan Torres', enrollmentDate: '2023-09-01' },
  { id: '15', name: 'Amelia Flores', grade: 'Bright Light', age: 9, parentName: 'Elena Flores', enrollmentDate: '2023-09-01' }
];

// Generate mock score history for games
const generateScoreHistory = (gameId: string, playCount: number, bestScore: number) => {
  if (playCount === 0) return [];
  
  const scores = [];
  for (let i = 0; i < playCount; i++) {
    const baseScore = bestScore - Math.floor(Math.random() * 20) - 5;
    const score = Math.max(0, Math.min(100, baseScore));
    const date = new Date();
    date.setDate(date.getDate() - (playCount - i - 1));
    
    scores.push({
      score,
      date: date.toISOString().split('T')[0],
      time: `${Math.floor(Math.random() * 24)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`
    });
  }
  
  // Sort by date (newest first)
  return scores.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};


// Mock child progress data for this task
const mockChildProgress = [
  {
    childId: '4',
    childName: 'Noah Wilson',
    grade: 'Rising Star',
    parentName: 'Robert Wilson',
    games: [
      { 
        gameId: 'gaze-tracking', 
        gameName: 'Gaze Tracking', 
        completed: true, 
        bestScore: 85, 
        playCount: 3, 
        lastPlayed: '2024-01-22',
        scoreHistory: generateScoreHistory('gaze-tracking', 3, 85)
      },
      { 
        gameId: 'gesture-control', 
        gameName: 'Gesture Control', 
        completed: true, 
        bestScore: 92, 
        playCount: 2, 
        lastPlayed: '2024-01-23',
        scoreHistory: generateScoreHistory('gesture-control', 2, 92)
      },
      { 
        gameId: 'mirror-posture', 
        gameName: 'Mirror Posture', 
        completed: false, 
        playCount: 0,
        scoreHistory: []
      }
    ]
  },
  {
    childId: '5',
    childName: 'Ava Brown',
    grade: 'Rising Star',
    parentName: 'Lisa Brown',
    games: [
      { 
        gameId: 'gaze-tracking', 
        gameName: 'Gaze Tracking', 
        completed: true, 
        bestScore: 78, 
        playCount: 2, 
        lastPlayed: '2024-01-21',
        scoreHistory: generateScoreHistory('gaze-tracking', 2, 78)
      },
      { 
        gameId: 'gesture-control', 
        gameName: 'Gesture Control', 
        completed: true, 
        bestScore: 88, 
        playCount: 3, 
        lastPlayed: '2024-01-24',
        scoreHistory: generateScoreHistory('gesture-control', 3, 88)
      },
      { 
        gameId: 'mirror-posture', 
        gameName: 'Mirror Posture', 
        completed: true, 
        bestScore: 95, 
        playCount: 1, 
        lastPlayed: '2024-01-25',
        scoreHistory: generateScoreHistory('mirror-posture', 1, 95)
      }
    ]
  },
  {
    childId: '6',
    childName: 'William Taylor',
    grade: 'Rising Star',
    parentName: 'David Taylor',
    games: [
      { 
        gameId: 'gaze-tracking', 
        gameName: 'Gaze Tracking', 
        completed: false, 
        playCount: 0,
        scoreHistory: []
      },
      { 
        gameId: 'gesture-control', 
        gameName: 'Gesture Control', 
        completed: true, 
        bestScore: 76, 
        playCount: 1, 
        lastPlayed: '2024-01-23',
        scoreHistory: generateScoreHistory('gesture-control', 1, 76)
      },
      { 
        gameId: 'mirror-posture', 
        gameName: 'Mirror Posture', 
        completed: false, 
        playCount: 0,
        scoreHistory: []
      }
    ]
  },
  {
    childId: '7',
    childName: 'Sophia Anderson',
    grade: 'Rising Star',
    parentName: 'Maria Anderson',
    games: [
      { 
        gameId: 'gaze-tracking', 
        gameName: 'Gaze Tracking', 
        completed: true, 
        bestScore: 92, 
        playCount: 4, 
        lastPlayed: '2024-01-24',
        scoreHistory: generateScoreHistory('gaze-tracking', 4, 92)
      },
      { 
        gameId: 'gesture-control', 
        gameName: 'Gesture Control', 
        completed: true, 
        bestScore: 89, 
        playCount: 2, 
        lastPlayed: '2024-01-25',
        scoreHistory: generateScoreHistory('gesture-control', 2, 89)
      },
      { 
        gameId: 'mirror-posture', 
        gameName: 'Mirror Posture', 
        completed: true, 
        bestScore: 87, 
        playCount: 3, 
        lastPlayed: '2024-01-26',
        scoreHistory: generateScoreHistory('mirror-posture', 3, 87)
      }
    ]
  }
];

const TaskDetails: React.FC = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const { school } = useSchoolAuth();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedGame, setSelectedGame] = useState<string>('all');
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [selectedScoreData, setSelectedScoreData] = useState<{
    childName: string;
    gameName: string;
    scores: Array<{ score: number; date: string; time: string }>;
  } | null>(null);
  
  const [childProgress, setChildProgress] = useState<TaskPerformanceDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [taskDetails, setTaskDetails] = useState<TaskDetails | null>(null);

  // Fetch task details
  useEffect(() => {
    const fetchTaskDetails = async () => {
      if (!taskId || !school?.id) return;
      
      try {
        const token = localStorage.getItem('schoolToken');
        console.log(`Fetching task details for task ID: ${taskId}, school ID: ${school.id}`);
        
        const response = await fetch(`http://localhost:8091/api/school/tasks/${taskId}/details?schoolId=${school.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Task details received:', data);
        setTaskDetails(data);
      } catch (error) {
        console.error('Error fetching task details:', error);
      }
    };

    fetchTaskDetails();
  }, [taskId, school?.id]);

  // Fetch task performance data
  useEffect(() => {
    const fetchTaskPerformance = async () => {
      if (!taskId || !school?.id) return;
      
      try {
        setIsLoading(true);
        const token = localStorage.getItem('schoolToken');
        console.log(`Fetching task performance for task ID: ${taskId}, school ID: ${school.id}`);
        console.log('JWT Token:', token ? token.substring(0, 20) + '...' : 'No token found');
        
        const response = await fetch(`http://localhost:8091/api/school/task-performance/${taskId}?schoolId=${school.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Task performance data received:', data);
        setChildProgress(data);
      } catch (error) {
        console.error('Error fetching task performance:', error);
        // Set empty array on error to see real issues
        setChildProgress([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTaskPerformance();
  }, [taskId, school?.id]);

  // Filter children based on search term
  const filteredChildren = useMemo(() => {
    return childProgress.filter(child => 
      child.childName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      child.parentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      child.grade.replace('grade_', 'Grade ').toLowerCase().includes(searchTerm.toLowerCase()) ||
      child.childId.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, childProgress]);

  // Sort children based on selected criteria
  const sortedChildren = useMemo(() => {
    return [...filteredChildren].sort((a, b) => {
      let aValue: any, bValue: any;

      if (sortBy === 'name') {
        aValue = a.childName;
        bValue = b.childName;
      } else if (sortBy === 'grade') {
        aValue = a.grade;
        bValue = b.grade;
      } else {
        // Sort by specific game score
        const aGame = a.games.find(g => g.gameId === sortBy);
        const bGame = b.games.find(g => g.gameId === sortBy);
        aValue = aGame?.bestScore || 0;
        bValue = bGame?.bestScore || 0;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [filteredChildren, sortBy, sortOrder]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getGameStats = (gameId: string) => {
    const totalChildren = childProgress.length;
    const completedChildren = childProgress.filter(child => {
      const game = child.games.find(g => g.gameId === gameId);
      return game?.completed;
    }).length;
    
    return { total: totalChildren, completed: completedChildren };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'active': return 'text-blue-600 bg-blue-100';
      case 'expired': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'active': return <Clock className="h-4 w-4" />;
      case 'expired': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const openScoreModal = (childName: string, gameName: string, scoreHistory: Array<{ score: number; date: string; time: string }>) => {
    setSelectedScoreData({ childName, gameName, scores: scoreHistory });
    setShowScoreModal(true);
  };

  const closeScoreModal = () => {
    setShowScoreModal(false);
    setSelectedScoreData(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/school/tasks')}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Loading Task Performance...</h1>
              <p className="text-gray-600">Please wait while we fetch the data</p>
            </div>
          </div>
        </div>
        
        {/* Loading Spinner */}
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="space-y-6 p-4">
        {/* Professional Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/school/tasks')}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-all duration-200"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {taskDetails?.title || 'Loading...'}
                </h1>
                <p className="text-gray-600 text-sm">Task Performance Dashboard</p>
              </div>
            </div>
            
            {taskDetails && (
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(taskDetails.status)}`}>
                <div className="flex items-center space-x-1">
                  {getStatusIcon(taskDetails.status)}
                  <span>{taskDetails.status.charAt(0).toUpperCase() + taskDetails.status.slice(1)}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Task Overview */}
        {taskDetails && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-white border-b border-gray-200 p-4">
              <h2 className="text-lg font-bold text-gray-900 mb-1">Task Overview</h2>
              <p className="text-gray-600 text-sm">{taskDetails.description}</p>
            </div>
            
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded border border-gray-200">
                  <div className="p-2 bg-gray-800 rounded">
                    <Users className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Assigned Children</p>
                    <p className="text-2xl font-bold text-gray-900">{taskDetails.totalAssigned}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded border border-gray-200">
                  <div className="p-2 bg-gray-800 rounded">
                    <Calendar className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Timeline</p>
                    <p className="text-sm font-bold text-gray-900">
                      {formatDate(taskDetails.startDate)} - {formatDate(taskDetails.endDate)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}


        {/* Children Progress */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-white border-b border-gray-200 px-4 py-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Student Performance</h2>
                <p className="text-gray-600 text-sm">Track individual progress and achievements</p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name, parent, grade, or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-3 py-2 w-64 border-0 rounded-lg bg-white/90 backdrop-blur-sm focus:ring-2 focus:ring-white/50 focus:bg-white transition-all duration-200 shadow-sm"
                  />
                </div>
                
                {/* Sort by */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border-0 rounded-lg bg-white/90 backdrop-blur-sm focus:ring-2 focus:ring-white/50 focus:bg-white transition-all duration-200 shadow-sm font-medium"
                >
                  <option value="name">Sort by Name</option>
                  <option value="grade">Sort by Grade</option>
                  {childProgress.length > 0 && childProgress[0].games.map(game => (
                    <option key={game.gameId} value={game.gameId}>
                      Sort by {game.gameName} Score
                    </option>
                  ))}
                </select>
                
                {/* Sort order */}
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="p-2 border-0 rounded-lg bg-white/90 backdrop-blur-sm hover:bg-white transition-all duration-200 shadow-sm"
                  title={sortOrder === 'asc' ? 'Sort Descending' : 'Sort Ascending'}
                >
                  {sortOrder === 'asc' ? <SortAsc className="h-4 w-4 text-gray-600" /> : <SortDesc className="h-4 w-4 text-gray-600" />}
                </button>
              </div>
            </div>
          </div>
        
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-white border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Student Information
                  </th>
                  {childProgress.length > 0 && childProgress[0].games.map((game) => (
                    <th key={game.gameId} className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                      <div className="flex items-center justify-center space-x-2">
                        <span className="text-lg">{availableGames.find(g => g.id === game.gameId)?.icon || '🎮'}</span>
                        <span className="font-bold">{game.gameName}</span>
                        <div className="group relative">
                          <HelpCircle className="h-4 w-4 text-gray-400 hover:text-indigo-600 cursor-help transition-colors" />
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 text-gray-600 text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 bg-white rounded-lg shadow-lg border">
                            {getScoreDescription(game.gameId)}
                          </div>
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {sortedChildren.map((child, index) => {
                  return (
                    <tr key={child.childId} className={`hover:bg-gray-50 transition-all duration-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            <div className="h-8 w-8 bg-gray-800 rounded-full flex items-center justify-center text-white font-bold text-sm">
                              {child.childName.charAt(0).toUpperCase()}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm font-bold text-gray-900">{child.childName}</div>
                            <div className="text-xs text-gray-600">
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                {child.grade.replace('grade_', 'Grade ')}
                              </span>
                              <span className="ml-2">• {child.parentName}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      {childProgress.length > 0 && childProgress[0].games.map((game) => {
                        const childGame = child.games.find(g => g.gameId === game.gameId);
                        return (
                          <td key={game.gameId} className="px-4 py-3 whitespace-nowrap">
                            {childGame?.completed ? (
                              <div className="text-center">
                                <button
                                  onClick={() => openScoreModal(child.childName, game.gameName, childGame.scoreHistory)}
                                  className="inline-flex items-center justify-center w-12 h-12 bg-green-600 text-white font-bold text-lg rounded hover:bg-green-700 transition-all duration-200"
                                  title="Click to view all scores"
                                >
                                  {childGame.bestScore}
                                </button>
                                <div className="text-xs text-gray-500 mt-1 font-medium">
                                  Played {childGame.playCount}x
                                </div>
                              </div>
                            ) : (
                              <div className="text-center">
                                <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-200 text-gray-400 font-bold text-lg rounded">
                                  —
                                </div>
                                <div className="text-xs text-gray-400 mt-1 font-medium">Not played</div>
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {sortedChildren.length === 0 && (
            <div className="text-center py-8">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-3">
                <Users className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No students found</h3>
              <p className="text-gray-500 text-sm">Try adjusting your search criteria</p>
            </div>
          )}
        </div>
      </div>

      {/* Score History Modal */}
      {showScoreModal && selectedScoreData && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[85vh] overflow-hidden border border-gray-200">
            {/* Modal Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Score History</h3>
                  <p className="text-gray-600 text-sm mt-1">
                    {selectedScoreData.childName} - {selectedScoreData.gameName}
                  </p>
                </div>
                <button
                  onClick={closeScoreModal}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-all duration-200"
                  title="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

              {/* Modal Content */}
              <div className="p-6 max-h-[calc(85vh-120px)] overflow-y-auto">
                {selectedScoreData.scores.length > 0 ? (
                  <div className="space-y-4">
                    {/* Summary Statistics */}
                    <div className="grid grid-cols-3 gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="text-center">
                        <p className="text-sm font-medium text-blue-900">Total Plays</p>
                        <p className="text-2xl font-bold text-blue-900">{selectedScoreData.scores.length}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-blue-900">Best Score</p>
                        <p className="text-2xl font-bold text-blue-900">
                          {Math.max(...selectedScoreData.scores.map(s => s.score))}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-blue-900">Average Score</p>
                        <p className="text-2xl font-bold text-blue-900">
                          {Math.round(selectedScoreData.scores.reduce((sum, s) => sum + s.score, 0) / selectedScoreData.scores.length)}
                        </p>
                      </div>
                    </div>

                    {/* Individual Scores */}
                    <div className="space-y-3">
                      <h4 className="text-lg font-semibold text-gray-900">All Scores</h4>
                      {selectedScoreData.scores.map((score, index) => (
                        <div key={index} className="group">
                          <button 
                            className="w-full text-left p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 hover:border-gray-300 transition-all duration-200 cursor-pointer"
                            onClick={() => {
                              console.log(`Score ${score.score} clicked`);
                              // Add any additional functionality here
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                                  <span className="text-sm font-semibold text-blue-600">{index + 1}</span>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-900">
                                    Score: <span className="text-lg font-bold text-green-600 group-hover:text-green-700 transition-colors">{score.score}</span>
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {new Date(score.date).toLocaleDateString('en-US', {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric'
                                    })} at {score.time}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                {index === 0 && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    Latest
                                  </span>
                                )}
                              </div>
                            </div>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <p>No score history available</p>
                  </div>
                )}
              </div>


            </div>
          </div>
        )}
      </div>
    );
  };

export default TaskDetails;
