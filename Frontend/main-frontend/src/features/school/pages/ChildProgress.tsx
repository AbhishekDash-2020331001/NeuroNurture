import {
    ArrowLeft,
    ChevronLeft,
    ChevronRight,
    Filter,
    Play,
    RefreshCw,
    Target
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSchoolAuth } from '../contexts/SchoolAuthContext';

interface Child {
  id: string;
  name: string;
  age: number;
  grade: string;
  gender: string;
  height: string;
  weight: string;
  schoolId: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  parentAddress: string;
}

interface GameSession {
  id: string;
  sessionId: string;
  dateTime: string;
  [key: string]: any; // For game-specific fields
}

const GAME_OPTIONS = [
  { id: 'dance-doodle', name: 'Dance Doodle', icon: '💃', color: 'purple' },
  { id: 'gaze-game', name: 'Gaze Game', icon: '👁️', color: 'blue' },
  { id: 'gesture-game', name: 'Gesture Game', icon: '✋', color: 'green' },
  { id: 'mirror-posture-game', name: 'Mirror Posture Game', icon: '🪞', color: 'yellow' },
  { id: 'repeat-with-me-game', name: 'Repeat With Me Game', icon: '🎤', color: 'pink' }
];

const GAME_SERVICE_URLS = {
  'dance-doodle': 'http://localhost:8087/api/dance-doodle',
  'gaze-game': 'http://localhost:8086/api/gaze-game',
  'gesture-game': 'http://localhost:8084/api/gesture-game',
  'mirror-posture-game': 'http://localhost:8083/api/mirror-posture-game',
  'repeat-with-me-game': 'http://localhost:8089/api/repeat-with-me-game'
};

const ChildProgress: React.FC = () => {
  const { childId } = useParams<{ childId: string }>();
  const { school } = useSchoolAuth();
  const navigate = useNavigate();
  
  const [child, setChild] = useState<Child | null>(null);
  const [selectedGame, setSelectedGame] = useState<string>('');
  const [sessions, setSessions] = useState<GameSession[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [error, setError] = useState('');

  const pageSize = 5;

  useEffect(() => {
    if (childId) {
      fetchChildData();
    }
  }, [childId]);

  useEffect(() => {
    if (selectedGame && childId) {
      fetchGameSessions();
    }
  }, [selectedGame, childId]);

  const fetchChildData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`http://localhost:8082/api/parents/children/${childId}/details`);

      if (response.ok) {
        const childData = await response.json();
        setChild(childData);
      } else {
        setError('Failed to load child data');
      }
    } catch (error) {
      console.error('Error fetching child data:', error);
      setError('Failed to load child data');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchGameSessions = async (page: number = 0) => {
    if (!selectedGame || !childId) return;

    try {
      setIsLoadingSessions(true);
      const gameUrl = GAME_SERVICE_URLS[selectedGame as keyof typeof GAME_SERVICE_URLS];
      const response = await fetch(`${gameUrl}/child/${childId}/history?page=${page}&size=${pageSize}`);

      if (response.ok) {
        const data = await response.json();
        setSessions(data.content || []);
        setTotalPages(data.totalPages || 0);
        setTotalElements(data.totalElements || 0);
        setCurrentPage(page);
      } else {
        console.error('Failed to fetch game sessions:', response.status);
        setSessions([]);
        setTotalPages(0);
        setTotalElements(0);
      }
    } catch (error) {
      console.error('Error fetching game sessions:', error);
      setSessions([]);
      setTotalPages(0);
      setTotalElements(0);
    } finally {
      setIsLoadingSessions(false);
    }
  };

  const handlePageChange = (page: number) => {
    fetchGameSessions(page);
  };

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Game-specific constants
  const DANCE_POSES = ['Cool Arms 💪', 'Open Wings 🦋', 'Silly Boxer 🥊', 'Happy Stand 😊', 'Crossy Play ✌️', 'Shh Fun 🤫', 'Stretch 🤸'];
  const GESTURE_NAMES = ['Thumbs Up 👍', 'Thumbs Down 👎', 'Victory ✌️', 'Butterfly 🦋', 'Spectacle 🤓', 'Heart ❤️', 'Pointing Up ☝️', 'I Love You 🤟', 'Dua 🙏', 'Closed Fist ✊', 'Open Palm 🖐️'];
  const POSTURE_NAMES = ['Looking Sideways 👀', 'Mouth Open 😮', 'Showing Teeth 😁', 'Kiss 💋'];
  const ROUND_NAMES = ['Round 1 🎤', 'Round 2 🎤', 'Round 3 🎤', 'Round 4 🎤', 'Round 5 🎤', 'Round 6 🎤', 'Round 7 🎤', 'Round 8 🎤', 'Round 9 🎤', 'Round 10 🎤', 'Round 11 🎤', 'Round 12 🎤'];

  const getPoseTime = (session: GameSession, poseName: string) => {
    const poseMap: Record<string, string> = {
      'Cool Arms 💪': 'cool_arms',
      'Open Wings 🦋': 'open_wings',
      'Silly Boxer 🥊': 'silly_boxer',
      'Happy Stand 😊': 'happy_stand',
      'Crossy Play ✌️': 'crossy_play',
      'Shh Fun 🤫': 'shh_fun',
      'Stretch 🤸': 'stretch'
    };
    
    const field = poseMap[poseName];
    if (!field) return null;
    
    const value = session[field] as number;
    return (typeof value === 'number' && value !== null && value !== undefined) ? value : null;
  };

  const getGestureTime = (session: GameSession, gestureName: string) => {
    const gestureMap: Record<string, string> = {
      'Thumbs Up 👍': 'thumbs_up',
      'Thumbs Down 👎': 'thumbs_down',
      'Victory ✌️': 'victory',
      'Butterfly 🦋': 'butterfly',
      'Spectacle 🤓': 'spectacle',
      'Heart ❤️': 'heart',
      'Pointing Up ☝️': 'pointing_up',
      'I Love You 🤟': 'iloveyou',
      'Dua 🙏': 'dua',
      'Closed Fist ✊': 'closed_fist',
      'Open Palm 🖐️': 'open_palm'
    };
    
    const field = gestureMap[gestureName];
    if (!field) return null;
    
    const value = session[field] as number;
    return (typeof value === 'number' && value !== null && value !== undefined) ? value : null;
  };

  const getPostureTime = (session: GameSession, postureName: string) => {
    const postureMap: Record<string, string> = {
      'Looking Sideways 👀': 'lookingSideways',
      'Mouth Open 😮': 'mouthOpen',
      'Showing Teeth 😁': 'showingTeeth',
      'Kiss 💋': 'kiss'
    };
    
    const field = postureMap[postureName];
    if (!field) return null;
    
    const value = session[field] as number;
    return (typeof value === 'number' && value !== null && value !== undefined) ? value : null;
  };

  const getRoundScore = (session: GameSession, roundName: string) => {
    const roundKey = roundName.split(' ')[1].toLowerCase();
    return session[`round${roundKey}Score`] !== undefined ? session[`round${roundKey}Score`] : null;
  };

  const getRoundTargetText = (session: GameSession, roundName: string) => {
    const roundKey = roundName.split(' ')[1].toLowerCase();
    return session[`round${roundKey}TargetText`] || null;
  };

  const getRoundTranscribedText = (session: GameSession, roundName: string) => {
    const roundKey = roundName.split(' ')[1].toLowerCase();
    return session[`round${roundKey}TranscribedText`] || null;
  };

  const getGameColor = (gameId: string) => {
    const game = GAME_OPTIONS.find(g => g.id === gameId);
    return game?.color || 'gray';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center h-64">
          <div className="text-2xl font-semibold text-gray-600">Loading child progress...</div>
        </div>
      </div>
    );
  }

  if (error || !child) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center h-64">
          <div className="text-2xl font-semibold text-red-600">{error || 'Child not found'}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Child Progress</h1>
                <p className="text-sm text-gray-600">{child.name} • Grade {child.grade}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Game Selection */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <Filter className="h-5 w-5 text-gray-700" />
            <h2 className="text-lg font-semibold text-gray-900">Select Game</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {GAME_OPTIONS.map((game) => (
              <button
                key={game.id}
                onClick={() => setSelectedGame(game.id)}
                className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                  selectedGame === game.id
                    ? `border-${game.color}-500 bg-${game.color}-50`
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{game.icon}</span>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">{game.name}</p>
                    <p className="text-sm text-gray-600">View session history</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Session History */}
        {selectedGame && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{GAME_OPTIONS.find(g => g.id === selectedGame)?.icon}</span>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {GAME_OPTIONS.find(g => g.id === selectedGame)?.name} Sessions
                    </h3>
                    <p className="text-sm text-gray-600">
                      {totalElements} total sessions • Page {currentPage + 1} of {totalPages}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => fetchGameSessions(currentPage)}
                  disabled={isLoadingSessions}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`h-5 w-5 text-gray-600 ${isLoadingSessions ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            <div className="p-6">
              {isLoadingSessions ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-gray-600">Loading sessions...</span>
                </div>
               ) : sessions.length > 0 ? (
                 <div className="space-y-4">
                   {sessions.map((session, index) => {
                     const sessionNumber = totalElements - (currentPage * pageSize + index);
                     
                     // Render based on selected game
                     if (selectedGame === 'dance-doodle') {
                       const completedTimes = DANCE_POSES.map(pose => getPoseTime(session, pose)).filter(time => time !== null) as number[];
                       const totalTime = completedTimes.reduce((sum, time) => sum + time, 0);
                       const completedPoses = completedTimes.length;
                       const averageTime = completedPoses > 0 ? totalTime / completedPoses : 0;
                       const completionRate = (completedPoses / DANCE_POSES.length) * 100;
                       
                       return (
                         <div key={session.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                           {/* Session Header */}
                           <div className="flex items-center justify-between mb-3">
                             <div>
                               <div className="font-bold text-primary text-sm">
                                 Session {sessionNumber}
                               </div>
                               <div className="text-xs text-muted-foreground">
                                 {formatDateTime(session.dateTime)}
                               </div>
                             </div>
                             <div className="text-right">
                               <div className="text-lg font-bold text-blue-600">
                                 {averageTime.toFixed(1)}s
                               </div>
                               <div className="text-xs text-muted-foreground">
                                 Avg Time
                               </div>
                             </div>
                           </div>
                           
                           {/* Session Summary */}
                           <div className="grid grid-cols-3 gap-2 mb-3">
                             <div className="text-center p-2 bg-blue-50 rounded">
                               <div className="text-sm font-bold text-blue-600">{completedPoses}</div>
                               <div className="text-xs text-muted-foreground">Completed</div>
                             </div>
                             <div className="text-center p-2 bg-green-50 rounded">
                               <div className="text-sm font-bold text-green-600">{completionRate.toFixed(0)}%</div>
                               <div className="text-xs text-muted-foreground">Success Rate</div>
                             </div>
                             <div className="text-center p-2 bg-purple-50 rounded">
                               <div className="text-sm font-bold text-purple-600">{totalTime.toFixed(1)}s</div>
                               <div className="text-xs text-muted-foreground">Total Time</div>
                             </div>
                           </div>

                           {/* Pose-by-Pose Breakdown */}
                           <div className="border-t pt-3">
                             <div className="text-xs font-semibold text-gray-600 mb-2">Pose Performance:</div>
                             <div className="grid grid-cols-2 gap-2">
                               {DANCE_POSES.map((pose) => {
                                 const time = getPoseTime(session, pose);
                                 const isCompleted = time !== null;
                                 
                                 const emoji = pose.split(' ').pop();
                                 const name = pose.split(' ').slice(0, -1).join(' ');
                                 
                                 return (
                                   <div key={pose} className={`flex items-center justify-between p-2 rounded text-xs ${
                                     isCompleted ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                                   }`}>
                                     <div className="flex items-center gap-1">
                                       <span className="text-sm">{emoji}</span>
                                       <span className="text-xs text-gray-500">{name}</span>
                                     </div>
                                     <div className={`font-bold ${isCompleted ? 'text-green-600' : 'text-red-500'}`}>
                                       {isCompleted ? `${time.toFixed(1)}s` : 'Not done'}
                                     </div>
                                   </div>
                                 );
                               })}
                             </div>
                           </div>
                         </div>
                       );
                     }
                     
                     else if (selectedGame === 'gesture-game') {
                       const totalTime = GESTURE_NAMES.reduce((sum, gesture) => {
                         const time = getGestureTime(session, gesture);
                         return sum + (time !== null ? time : 0);
                       }, 0);
                       const completedGestures = GESTURE_NAMES.filter(gesture => {
                         const time = getGestureTime(session, gesture);
                         return time !== null;
                       }).length;
                       const averageTime = completedGestures > 0 ? totalTime / completedGestures : 0;
                       const completionRate = (completedGestures / GESTURE_NAMES.length) * 100;
                       
                       return (
                         <div key={session.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                           {/* Session Header */}
                           <div className="flex items-center justify-between mb-3">
                             <div>
                               <div className="font-bold text-primary text-sm">
                                 Session {sessionNumber}
                               </div>
                               <div className="text-xs text-muted-foreground">
                                 {formatDateTime(session.dateTime)}
                               </div>
                             </div>
                             <div className="text-right">
                               <div className="text-lg font-bold text-blue-600">
                                 {averageTime.toFixed(1)}s
                               </div>
                               <div className="text-xs text-muted-foreground">
                                 Avg Time
                               </div>
                             </div>
                           </div>
                           
                           {/* Session Summary */}
                           <div className="grid grid-cols-3 gap-2 mb-3">
                             <div className="text-center p-2 bg-blue-50 rounded">
                               <div className="text-sm font-bold text-blue-600">{completedGestures}</div>
                               <div className="text-xs text-muted-foreground">Completed</div>
                             </div>
                             <div className="text-center p-2 bg-green-50 rounded">
                               <div className="text-sm font-bold text-green-600">{completionRate.toFixed(0)}%</div>
                               <div className="text-xs text-muted-foreground">Success Rate</div>
                             </div>
                             <div className="text-center p-2 bg-purple-50 rounded">
                               <div className="text-sm font-bold text-purple-600">{totalTime.toFixed(1)}s</div>
                               <div className="text-xs text-muted-foreground">Total Time</div>
                             </div>
                           </div>

                           {/* Gesture-by-Gesture Breakdown */}
                           <div className="border-t pt-3">
                             <div className="text-xs font-semibold text-gray-600 mb-2">Gesture Performance:</div>
                             <div className="grid grid-cols-2 gap-2">
                               {GESTURE_NAMES.map((gesture) => {
                                 const time = getGestureTime(session, gesture);
                                 const isCompleted = time !== null;
                                 
                                 const emoji = gesture.split(' ').pop();
                                 const name = gesture.split(' ').slice(0, -1).join(' ');
                                 
                                 return (
                                   <div key={gesture} className={`flex items-center justify-between p-2 rounded text-xs ${
                                     isCompleted ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                                   }`}>
                                     <div className="flex items-center gap-1">
                                       <span className="text-sm">{emoji}</span>
                                       <span className="text-xs text-gray-500">{name}</span>
                                     </div>
                                     <div className={`font-bold ${isCompleted ? 'text-green-600' : 'text-red-500'}`}>
                                       {isCompleted ? `${time.toFixed(1)}s` : 'Not done'}
                                     </div>
                                   </div>
                                 );
                               })}
                             </div>
                           </div>
                         </div>
                       );
                     }
                     
                     else if (selectedGame === 'gaze-game') {
                       const totalBalloons = (session.round1Count || 0) + (session.round2Count || 0) + (session.round3Count || 0);
                       
                       return (
                         <div key={session.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                           {/* Session Header */}
                           <div className="flex items-center justify-between mb-3">
                             <div>
                               <div className="font-bold text-primary text-sm">
                                 Session {sessionNumber}
                               </div>
                               <div className="text-xs text-muted-foreground">
                                 {formatDateTime(session.dateTime)}
                               </div>
                             </div>
                             <div className="text-right">
                               <div className="text-lg font-bold text-blue-600">
                                 {totalBalloons}
                               </div>
                               <div className="text-xs text-muted-foreground">
                                 Total Balloons
                               </div>
                             </div>
                           </div>
                           
                           {/* Session Summary */}
                           <div className="grid grid-cols-3 gap-2 mb-3">
                             <div className="text-center p-2 bg-blue-50 rounded">
                               <div className="text-sm font-bold text-blue-600">{session.round1Count || 0}</div>
                               <div className="text-xs text-muted-foreground">Round 1</div>
                             </div>
                             <div className="text-center p-2 bg-green-50 rounded">
                               <div className="text-sm font-bold text-green-600">{session.round2Count || 0}</div>
                               <div className="text-xs text-muted-foreground">Round 2</div>
                             </div>
                             <div className="text-center p-2 bg-purple-50 rounded">
                               <div className="text-sm font-bold text-purple-600">{session.round3Count || 0}</div>
                               <div className="text-xs text-muted-foreground">Round 3</div>
                             </div>
                           </div>
                         </div>
                       );
                     }
                     
                     else if (selectedGame === 'mirror-posture-game') {
                       const totalTime = POSTURE_NAMES.reduce((sum, posture) => {
                         const time = getPostureTime(session, posture);
                         return sum + (time !== null ? time : 0);
                       }, 0);
                       const completedPostures = POSTURE_NAMES.filter(posture => {
                         const time = getPostureTime(session, posture);
                         return time !== null;
                       }).length;
                       const averageTime = completedPostures > 0 ? totalTime / completedPostures : 0;
                       const completionRate = (completedPostures / POSTURE_NAMES.length) * 100;
                       
                       return (
                         <div key={session.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                           {/* Session Header */}
                           <div className="flex items-center justify-between mb-3">
                             <div>
                               <div className="font-bold text-primary text-sm">
                                 Session {sessionNumber}
                               </div>
                               <div className="text-xs text-muted-foreground">
                                 {formatDateTime(session.dateTime)}
                               </div>
                             </div>
                             <div className="text-right">
                               <div className="text-lg font-bold text-blue-600">
                                 {averageTime.toFixed(1)}s
                               </div>
                               <div className="text-xs text-muted-foreground">
                                 Avg Time
                               </div>
                             </div>
                           </div>
                           
                           {/* Session Summary */}
                           <div className="grid grid-cols-3 gap-2 mb-3">
                             <div className="text-center p-2 bg-blue-50 rounded">
                               <div className="text-sm font-bold text-blue-600">{completedPostures}</div>
                               <div className="text-xs text-muted-foreground">Completed</div>
                             </div>
                             <div className="text-center p-2 bg-green-50 rounded">
                               <div className="text-sm font-bold text-green-600">{completionRate.toFixed(0)}%</div>
                               <div className="text-xs text-muted-foreground">Success Rate</div>
                             </div>
                             <div className="text-center p-2 bg-purple-50 rounded">
                               <div className="text-sm font-bold text-purple-600">{totalTime.toFixed(1)}s</div>
                               <div className="text-xs text-muted-foreground">Total Time</div>
                             </div>
                           </div>

                           {/* Posture-by-Posture Breakdown */}
                           <div className="border-t pt-3">
                             <div className="text-xs font-semibold text-gray-600 mb-2">Posture Performance:</div>
                             <div className="grid grid-cols-2 gap-2">
                               {POSTURE_NAMES.map((posture) => {
                                 const time = getPostureTime(session, posture);
                                 const isCompleted = time !== null;
                                 
                                 const emoji = posture.split(' ').pop();
                                 const name = posture.split(' ').slice(0, -1).join(' ');
                                 
                                 return (
                                   <div key={posture} className={`flex items-center justify-between p-2 rounded text-xs ${
                                     isCompleted ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                                   }`}>
                                     <div className="flex items-center gap-1">
                                       <span className="text-sm">{emoji}</span>
                                       <span className="text-xs text-gray-500">{name}</span>
                                     </div>
                                     <div className={`font-bold ${isCompleted ? 'text-green-600' : 'text-red-500'}`}>
                                       {isCompleted ? `${time.toFixed(1)}s` : 'Not done'}
                                     </div>
                                   </div>
                                 );
                               })}
                             </div>
                           </div>
                         </div>
                       );
                     }
                     
                     else if (selectedGame === 'repeat-with-me-game') {
                       const totalScore = ROUND_NAMES.reduce((sum, roundName) => {
                         const score = getRoundScore(session, roundName);
                         return sum + (score !== null ? score : 0);
                       }, 0);
                       const completedRounds = ROUND_NAMES.filter(roundName => {
                         const score = getRoundScore(session, roundName);
                         return score !== null;
                       }).length;
                       const averageScore = completedRounds > 0 ? totalScore / completedRounds : 0;
                       const completionRate = (completedRounds / ROUND_NAMES.length) * 100;
                       
                       return (
                         <div key={session.id} className="border-2 border-pink-200 rounded-xl p-6 bg-gradient-to-br from-pink-50/50 to-white hover:shadow-lg transition-all duration-300">
                           {/* Session Header */}
                           <div className="flex items-center justify-between mb-4">
                             <div>
                               <div className="font-bold text-pink-700 text-lg">
                                 Session {sessionNumber}
                               </div>
                               <div className="text-sm text-gray-600">
                                 {formatDateTime(session.dateTime)}
                               </div>
                             </div>
                             <div className="text-right">
                               <div className="text-2xl font-bold text-pink-600">
                                 {averageScore.toFixed(1)}%
                               </div>
                               <div className="text-sm text-gray-600">
                                 Average Score
                               </div>
                             </div>
                           </div>
                           
                           {/* Session Summary */}
                           <div className="grid grid-cols-3 gap-3 mb-6">
                             <div className="text-center p-3 bg-pink-100 rounded-lg border border-pink-200">
                               <div className="text-lg font-bold text-pink-700">{completedRounds}</div>
                               <div className="text-sm text-pink-600">Rounds Completed</div>
                             </div>
                             <div className="text-center p-3 bg-green-100 rounded-lg border border-green-200">
                               <div className="text-lg font-bold text-green-700">{completionRate.toFixed(0)}%</div>
                               <div className="text-sm text-green-600">Completion Rate</div>
                             </div>
                             <div className="text-center p-3 bg-purple-100 rounded-lg border border-purple-200">
                               <div className="text-lg font-bold text-purple-700">{totalScore.toFixed(1)}%</div>
                               <div className="text-sm text-purple-600">Total Score</div>
                             </div>
                           </div>

                           {/* Detailed Round Breakdown */}
                           <div className="space-y-4">
                             <div className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
                               <span>🎤</span>
                               Round-by-Round Details
                             </div>
                             <div className="grid grid-cols-1 gap-4">
                               {ROUND_NAMES.map((roundName) => {
                                 const score = getRoundScore(session, roundName);
                                 const targetText = getRoundTargetText(session, roundName);
                                 const transcribedText = getRoundTranscribedText(session, roundName);
                                 const isCompleted = score !== null && targetText && transcribedText;
                                 
                                 if (!isCompleted) return null;
                                 
                                 // Extract round number
                                 const roundNumber = roundName.split(' ')[1];
                                 
                                 return (
                                   <div key={roundName} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
                                     <div className="flex items-center justify-between mb-3">
                                       <div className="flex items-center gap-2">
                                         <span className="text-lg">🎤</span>
                                         <span className="font-semibold text-gray-700">Round {roundNumber}</span>
                                       </div>
                                       <div className={`px-3 py-1 rounded-full text-sm font-bold ${
                                         score >= 80 ? 'bg-green-100 text-green-700 border border-green-300' :
                                         score >= 60 ? 'bg-yellow-100 text-yellow-700 border border-yellow-300' :
                                         'bg-red-100 text-red-700 border border-red-300'
                                       }`}>
                                         {score.toFixed(1)}% Similarity
                                       </div>
                                     </div>
                                     
                                     <div className="space-y-3">
                                       {/* Target Text */}
                                       <div>
                                         <div className="text-sm font-medium text-gray-600 mb-1 flex items-center gap-1">
                                           <span>🎯</span>
                                           Target Text (Bengali)
                                         </div>
                                         <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                           <div className="text-base font-medium text-blue-800" dir="rtl">
                                             {targetText}
                                           </div>
                                         </div>
                                       </div>
                                       
                                       {/* Transcribed Text */}
                                       <div>
                                         <div className="text-sm font-medium text-gray-600 mb-1 flex items-center gap-1">
                                           <span>🎙️</span>
                                           What You Said (Bengali)
                                         </div>
                                         <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                           <div className="text-base font-medium text-green-800" dir="rtl">
                                             {transcribedText}
                                           </div>
                                         </div>
                                       </div>
                                       
                                       {/* Similarity Score Bar */}
                                       <div>
                                         <div className="text-sm font-medium text-gray-600 mb-2 flex items-center gap-1">
                                           <span>📊</span>
                                           Similarity Score
                                         </div>
                                         <div className="w-full bg-gray-200 rounded-full h-3">
                                           <div 
                                             className={`h-3 rounded-full transition-all duration-700 ${
                                               score >= 80 ? 'bg-gradient-to-r from-green-400 to-green-600' :
                                               score >= 60 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                                               'bg-gradient-to-r from-red-400 to-red-600'
                                             }`}
                                             style={{ width: `${Math.min(score, 100)}%` }}
                                           ></div>
                                         </div>
                                         <div className="text-xs text-gray-500 mt-1">
                                           {score >= 80 ? 'Excellent pronunciation! 🌟' :
                                            score >= 60 ? 'Good attempt! Keep practicing! 💪' :
                                            'Keep practicing to improve! 🎯'}
                                         </div>
                                       </div>
                                     </div>
                                   </div>
                                 );
                               })}
                             </div>
                           </div>
                         </div>
                       );
                     }
                     
                     return null;
                   })}
                 </div>
              ) : (
                <div className="text-center py-12">
                  <Play className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No sessions found for this game</p>
                  <p className="text-sm text-gray-500">This child hasn't played {GAME_OPTIONS.find(g => g.id === selectedGame)?.name} yet</p>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8">
                  <div className="flex items-center justify-center space-x-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 0}
                      className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i;
                        } else if (currentPage < 3) {
                          pageNum = i;
                        } else if (currentPage >= totalPages - 3) {
                          pageNum = totalPages - 5 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`px-3 py-2 text-sm font-medium rounded-lg ${
                              currentPage === pageNum
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {pageNum + 1}
                          </button>
                        );
                      })}
                    </div>
                    
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages - 1}
                      className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div className="text-center mt-4 text-sm text-gray-600">
                    Page {currentPage + 1} of {totalPages} • Showing {sessions.length} of {totalElements} sessions
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* No Game Selected */}
        {!selectedGame && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a Game</h3>
            <p className="text-gray-600">Choose a game from above to view {child.name}'s session history</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChildProgress;
