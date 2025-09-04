import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSchoolAuth } from '@/contexts/school/SchoolAuthContext';
import { 
  ArrowLeft,
  Search,
  Trophy,
  Target,
  Users,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3,
  SortAsc,
  SortDesc,
  X
} from 'lucide-react';

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
  isCompleted: boolean;
  bestScore?: number;
  playCount: number;
  lastPlayed?: string;
  scoreHistory: Array<{ score: number; date: string; time: string }>;
}

interface Task {
  id: string;
  title: string;
  description: string;
  assignedDate: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'expired';
  assignedTo: 'all' | 'grade_1' | 'grade_2' | 'grade_3' | 'grade_4' | string[];
  games: TaskGame[];
  totalAssigned: number;
  completedCount: number;
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

const mockChildren: Child[] = [
  { id: '1', name: 'Emma Johnson', grade: 'grade_1', age: 6, parentName: 'Sarah Johnson', enrollmentDate: '2023-09-01' },
  { id: '2', name: 'Liam Smith', grade: 'grade_1', age: 6, parentName: 'Michael Smith', enrollmentDate: '2023-09-01' },
  { id: '3', name: 'Olivia Davis', grade: 'grade_1', age: 6, parentName: 'Jennifer Davis', enrollmentDate: '2023-09-01' },
  { id: '4', name: 'Noah Wilson', grade: 'grade_2', age: 7, parentName: 'Robert Wilson', enrollmentDate: '2023-09-01' },
  { id: '5', name: 'Ava Brown', grade: 'grade_2', age: 7, parentName: 'Lisa Brown', enrollmentDate: '2023-09-01' },
  { id: '6', name: 'William Taylor', grade: 'grade_2', age: 7, parentName: 'David Taylor', enrollmentDate: '2023-09-01' },
  { id: '7', name: 'Sophia Anderson', grade: 'grade_2', age: 7, parentName: 'Maria Anderson', enrollmentDate: '2023-09-01' },
  { id: '8', name: 'James Martinez', grade: 'grade_3', age: 8, parentName: 'Carlos Martinez', enrollmentDate: '2023-09-01' },
  { id: '9', name: 'Isabella Garcia', grade: 'grade_3', age: 8, parentName: 'Ana Garcia', enrollmentDate: '2023-09-01' },
  { id: '10', name: 'Benjamin Rodriguez', grade: 'grade_3', age: 8, parentName: 'Jose Rodriguez', enrollmentDate: '2023-09-01' },
  { id: '11', name: 'Mia Lopez', grade: 'grade_4', age: 9, parentName: 'Carmen Lopez', enrollmentDate: '2023-09-01' },
  { id: '12', name: 'Lucas Gonzalez', grade: 'grade_4', age: 9, parentName: 'Manuel Gonzalez', enrollmentDate: '2023-09-01' },
  { id: '13', name: 'Charlotte Perez', grade: 'grade_4', age: 9, parentName: 'Rosa Perez', enrollmentDate: '2023-09-01' },
  { id: '14', name: 'Mason Torres', grade: 'grade_4', age: 9, parentName: 'Juan Torres', enrollmentDate: '2023-09-01' },
  { id: '15', name: 'Amelia Flores', grade: 'grade_4', age: 9, parentName: 'Elena Flores', enrollmentDate: '2023-09-01' }
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

// Mock task with detailed child progress
const mockTask: Task = {
  id: '1',
  title: 'Cognitive Development Task',
  description: 'Complete cognitive and motor skills games to improve focus and coordination',
  assignedDate: '2024-01-20',
  startDate: '2024-01-20',
  endDate: '2024-01-27',
  status: 'active',
  assignedTo: 'grade_2',
  games: [
    { gameId: 'gaze-tracking', gameName: 'Gaze Tracking', isCompleted: true, bestScore: 85, playCount: 3, lastPlayed: '2024-01-22', scoreHistory: generateScoreHistory('gaze-tracking', 3, 85) },
    { gameId: 'gesture-control', gameName: 'Gesture Control', isCompleted: true, bestScore: 92, playCount: 2, lastPlayed: '2024-01-23', scoreHistory: generateScoreHistory('gesture-control', 2, 92) },
    { gameId: 'mirror-posture', gameName: 'Mirror Posture', isCompleted: false, playCount: 0, scoreHistory: [] }
  ],
  totalAssigned: 15,
  completedCount: 8
};

// Mock child progress data for this task
const mockChildProgress = [
  {
    childId: '4',
    childName: 'Noah Wilson',
    grade: 'grade_2',
    parentName: 'Robert Wilson',
    games: [
      { 
        gameId: 'gaze-tracking', 
        gameName: 'Gaze Tracking', 
        isCompleted: true, 
        bestScore: 85, 
        playCount: 3, 
        lastPlayed: '2024-01-22',
        scoreHistory: generateScoreHistory('gaze-tracking', 3, 85)
      },
      { 
        gameId: 'gesture-control', 
        gameName: 'Gesture Control', 
        isCompleted: true, 
        bestScore: 92, 
        playCount: 2, 
        lastPlayed: '2024-01-23',
        scoreHistory: generateScoreHistory('gesture-control', 2, 92)
      },
      { 
        gameId: 'mirror-posture', 
        gameName: 'Mirror Posture', 
        isCompleted: false, 
        playCount: 0,
        scoreHistory: []
      }
    ]
  },
  {
    childId: '5',
    childName: 'Ava Brown',
    grade: 'grade_2',
    parentName: 'Lisa Brown',
    games: [
      { 
        gameId: 'gaze-tracking', 
        gameName: 'Gaze Tracking', 
        isCompleted: true, 
        bestScore: 78, 
        playCount: 2, 
        lastPlayed: '2024-01-21',
        scoreHistory: generateScoreHistory('gaze-tracking', 2, 78)
      },
      { 
        gameId: 'gesture-control', 
        gameName: 'Gesture Control', 
        isCompleted: true, 
        bestScore: 88, 
        playCount: 3, 
        lastPlayed: '2024-01-24',
        scoreHistory: generateScoreHistory('gesture-control', 3, 88)
      },
      { 
        gameId: 'mirror-posture', 
        gameName: 'Mirror Posture', 
        isCompleted: true, 
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
    grade: 'grade_2',
    parentName: 'David Taylor',
    games: [
      { 
        gameId: 'gaze-tracking', 
        gameName: 'Gaze Tracking', 
        isCompleted: false, 
        playCount: 0,
        scoreHistory: []
      },
      { 
        gameId: 'gesture-control', 
        gameName: 'Gesture Control', 
        isCompleted: true, 
        bestScore: 76, 
        playCount: 1, 
        lastPlayed: '2024-01-23',
        scoreHistory: generateScoreHistory('gesture-control', 1, 76)
      },
      { 
        gameId: 'mirror-posture', 
        gameName: 'Mirror Posture', 
        isCompleted: false, 
        playCount: 0,
        scoreHistory: []
      }
    ]
  },
  {
    childId: '7',
    childName: 'Sophia Anderson',
    grade: 'grade_2',
    parentName: 'Maria Anderson',
    games: [
      { 
        gameId: 'gaze-tracking', 
        gameName: 'Gaze Tracking', 
        isCompleted: true, 
        bestScore: 92, 
        playCount: 4, 
        lastPlayed: '2024-01-24',
        scoreHistory: generateScoreHistory('gaze-tracking', 4, 92)
      },
      { 
        gameId: 'gesture-control', 
        gameName: 'Gesture Control', 
        isCompleted: true, 
        bestScore: 89, 
        playCount: 2, 
        lastPlayed: '2024-01-25',
        scoreHistory: generateScoreHistory('gesture-control', 2, 89)
      },
      { 
        gameId: 'mirror-posture', 
        gameName: 'Mirror Posture', 
        isCompleted: true, 
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

  // Filter children based on search term
  const filteredChildren = useMemo(() => {
    return mockChildProgress.filter(child => 
      child.childName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      child.parentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      child.grade.replace('grade_', 'Grade ').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

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
      } else if (sortBy === 'completion') {
        aValue = a.games.filter(g => g.isCompleted).length;
        bValue = b.games.filter(g => g.isCompleted).length;
      } else if (sortBy === 'averageScore') {
        const aCompletedGames = a.games.filter(g => g.isCompleted && g.bestScore);
        const bCompletedGames = b.games.filter(g => g.isCompleted && g.bestScore);
        aValue = aCompletedGames.length > 0 ? aCompletedGames.reduce((sum, g) => sum + (g.bestScore || 0), 0) / aCompletedGames.length : 0;
        bValue = bCompletedGames.length > 0 ? bCompletedGames.reduce((sum, g) => sum + (g.bestScore || 0), 0) / bCompletedGames.length : 0;
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
    const totalChildren = mockChildProgress.length;
    const completedChildren = mockChildProgress.filter(child => {
      const game = child.games.find(g => g.gameId === gameId);
      return game?.isCompleted;
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
            <h1 className="text-2xl font-bold text-gray-900">{mockTask.title}</h1>
            <p className="text-gray-600">Task Progress Overview</p>
          </div>
        </div>
        
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(mockTask.status)}`}>
          <div className="flex items-center space-x-1">
            {getStatusIcon(mockTask.status)}
            <span>{mockTask.status.charAt(0).toUpperCase() + mockTask.status.slice(1)}</span>
          </div>
        </div>
      </div>

      {/* Task Overview */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Assigned Children</p>
              <p className="text-2xl font-bold text-gray-900">{mockTask.totalAssigned}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{mockTask.completedCount}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Period</p>
              <p className="text-sm font-medium text-gray-900">
                {formatDate(mockTask.startDate)} - {formatDate(mockTask.endDate)}
              </p>
            </div>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-gray-700">{mockTask.description}</p>
        </div>
      </div>

      {/* Games Overview */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Games Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockTask.games.map((game) => {
            const stats = getGameStats(game.gameId);
            const gameInfo = availableGames.find(g => g.id === game.gameId);
            
            return (
              <div key={game.gameId} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <span className="text-2xl">{gameInfo?.icon || '🎮'}</span>
                  <div>
                    <h3 className="font-medium text-gray-900">{game.gameName}</h3>
                    <p className="text-xs text-gray-500">{gameInfo?.category}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Completion Rate:</span>
                    <span className="font-medium text-gray-900">
                      {stats.completed}/{stats.total} children
                    </span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(stats.completed / stats.total) * 100}%` }}
                    ></div>
                  </div>
                  
                  <div className="text-xs text-gray-500 text-center">
                    {Math.round((stats.completed / stats.total) * 100)}% completed
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Children Progress */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="text-lg font-semibold text-gray-900">Children Progress</h2>
            
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search children..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              {/* Sort by */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="name">Sort by Name</option>
                <option value="grade">Sort by Grade</option>
                <option value="completion">Sort by Completion</option>
                <option value="averageScore">Sort by Average Score</option>
                {mockTask.games.map(game => (
                  <option key={game.gameId} value={game.gameId}>
                    Sort by {game.gameName} Score
                  </option>
                ))}
              </select>
              
              {/* Sort order */}
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                title={sortOrder === 'asc' ? 'Sort Descending' : 'Sort Ascending'}
              >
                {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Child
                </th>
                {mockTask.games.map((game) => (
                  <th key={game.gameId} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{availableGames.find(g => g.id === game.gameId)?.icon || '🎮'}</span>
                      <span>{game.gameName}</span>
                    </div>
                  </th>
                ))}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Overall Progress
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedChildren.map((child) => {
                const completedGames = child.games.filter(g => g.isCompleted).length;
                const totalGames = child.games.length;
                const progressPercentage = (completedGames / totalGames) * 100;
                
                return (
                  <tr key={child.childId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{child.childName}</div>
                        <div className="text-sm text-gray-500">{child.grade.replace('grade_', 'Grade ')} • {child.parentName}</div>
                      </div>
                    </td>
                    
                                         {child.games.map((game) => (
                       <td key={game.gameId} className="px-6 py-4 whitespace-nowrap">
                         {game.isCompleted ? (
                           <div className="text-center">
                             <button
                               onClick={() => openScoreModal(child.childName, game.gameName, game.scoreHistory)}
                               className="text-sm font-semibold text-green-600 hover:text-green-700 hover:underline cursor-pointer transition-colors"
                               title="Click to view all scores"
                             >
                               {game.bestScore}
                             </button>
                             <div className="text-xs text-gray-500">Best Score</div>
                             <div className="text-xs text-gray-400">Played {game.playCount}x</div>
                           </div>
                         ) : (
                           <div className="text-center">
                             <div className="text-sm text-gray-400">Not played</div>
                             <div className="text-xs text-gray-400">0 plays</div>
                           </div>
                         )}
                       </td>
                     ))}
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">
                            {completedGames}/{totalGames} games
                          </div>
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${progressPercentage}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          {Math.round(progressPercentage)}%
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
                 {sortedChildren.length === 0 && (
           <div className="text-center py-12 text-gray-500">
             <Search className="h-12 w-12 mx-auto mb-2 text-gray-300" />
             <p>No children found matching your search</p>
           </div>
         )}
       </div>

                       {/* Score History Modal */}
        {showScoreModal && selectedScoreData && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden">
              {/* Modal Header */}
              <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">Score History</h3>
                    <p className="text-gray-600 text-sm">
                      {selectedScoreData.childName} - {selectedScoreData.gameName}
                    </p>
                  </div>
                  <button
                    onClick={closeScoreModal}
                    className="flex items-center space-x-2 px-3 py-2 hover:bg-gray-100 rounded-lg transition-all duration-200 border border-gray-200 hover:border-gray-300"
                    title="Close"
                  >
                    <X className="h-4 w-4 text-gray-500 hover:text-gray-700" />
                    <span className="text-sm font-medium text-gray-500 hover:text-gray-700">Close</span>
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
