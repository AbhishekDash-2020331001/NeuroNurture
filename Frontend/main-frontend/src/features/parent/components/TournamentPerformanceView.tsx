import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChildTournament } from '@/shared/services/child/childTournamentService';
import { TrendingUp, Trophy } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface TournamentPerformanceViewProps {
  tournament: ChildTournament;
  childId: string;
  childName: string;
}

interface GameSession {
  id: string;
  sessionId: string;
  dateTime: string;
  childId: string;
  childName: string;
  [key: string]: any;
}

const GAME_SERVICE_URLS = {
  'Dance Doodle': 'http://localhost:8087/api/dance-doodle',
  'Gaze Game': 'http://localhost:8086/api/gaze-game',
  'Gesture Game': 'http://localhost:8084/api/gesture-game',
  'Mirror Posture Game': 'http://localhost:8083/api/mirror-posture-game',
  'Repeat With Me Game': 'http://localhost:8089/api/repeat-with-me-game'
};

const GAME_ICONS = {
  'Dance Doodle': '💃',
  'Gaze Game': '👁️',
  'Gesture Game': '✋',
  'Mirror Posture Game': '🪞',
  'Repeat With Me Game': '🔄'
};

// Game-specific constants matching the insights pages
const DANCE_POSES = [
  'Cool Arms 💪', 'Open Wings 🦋', 'Silly Boxer 🥊', 'Happy Stand 😊',
  'Crossy Play ✌️', 'Shh Fun 🤫', 'Stretch 🤸'
];

const POSTURE_NAMES = [
  'Looking Sideways 👀', 'Mouth Open 😮', 'Showing Teeth 😬', 'Kiss 😘'
];

const GESTURE_NAMES = [
  'Thumbs Up 👍', 'Thumbs Down 👎', 'Victory ✌️', 'Butterfly 🦋', 'Spectacle 🤓',
  'Heart ❤️', 'Pointing Up ☝️', 'I Love You 🤟', 'Dua 🙏', 'Closed Fist ✊', 'Open Palm 🖐️'
];

const TournamentPerformanceView: React.FC<TournamentPerformanceViewProps> = ({ 
  tournament, 
  childId, 
  childName 
}) => {
  const [selectedGame, setSelectedGame] = useState<string>('');
  const [sessions, setSessions] = useState<GameSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load sessions when a game is selected
  useEffect(() => {
    if (selectedGame) {
      loadGameSessions(selectedGame);
    }
  }, [selectedGame, tournament.tournamentId]);

  const loadGameSessions = async (gameName: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const baseUrl = GAME_SERVICE_URLS[gameName as keyof typeof GAME_SERVICE_URLS];
      if (!baseUrl) {
        throw new Error(`Unknown game: ${gameName}`);
      }

      // Fetch sessions for this child in this tournament
      const response = await fetch(`${baseUrl}/sessions/tournament/${tournament.tournamentId}/child/${childId}`);
      
      if (response.ok) {
        const sessionData = await response.json();
        setSessions(sessionData);
      } else if (response.status === 404) {
        setSessions([]);
      } else {
        throw new Error(`Failed to load sessions: ${response.statusText}`);
      }
    } catch (err) {
      console.error('Error loading game sessions:', err);
      setError(err instanceof Error ? err.message : 'Failed to load sessions');
      setSessions([]);
    } finally {
      setIsLoading(false);
    }
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

  const getGameSpecificMetrics = (session: GameSession, gameName: string) => {
    switch (gameName) {
      case 'Dance Doodle':
        const dancePoses = ['cool_arms', 'open_wings', 'silly_boxer', 'happy_stand', 'crossy_play', 'shh_fun', 'stretch'];
        const completedDancePoses = dancePoses.filter(pose => session[pose] !== null && session[pose] !== undefined);
        const totalDanceTime = completedDancePoses.reduce((sum, pose) => sum + (session[pose] || 0), 0);
        return {
          completed: completedDancePoses.length,
          total: dancePoses.length,
          totalTime: totalDanceTime,
          averageTime: completedDancePoses.length > 0 ? totalDanceTime / completedDancePoses.length : 0,
          details: DANCE_POSES.map((pose, index) => {
            const fieldName = dancePoses[index];
            const time = session[fieldName];
            return {
              name: pose,
              time: time,
              completed: time !== null && time !== undefined
            };
          })
        };
      
      case 'Mirror Posture Game':
        const posturePoses = ['lookingSideways', 'mouthOpen', 'showingTeeth', 'kiss'];
        const completedPosturePoses = posturePoses.filter(pose => session[pose] !== null && session[pose] !== undefined);
        const totalPostureTime = completedPosturePoses.reduce((sum, pose) => sum + (session[pose] || 0), 0);
        return {
          completed: completedPosturePoses.length,
          total: posturePoses.length,
          totalTime: totalPostureTime,
          averageTime: completedPosturePoses.length > 0 ? totalPostureTime / completedPosturePoses.length : 0,
          details: POSTURE_NAMES.map((posture, index) => {
            const fieldName = posturePoses[index];
            const time = session[fieldName];
            return {
              name: posture,
              time: time,
              completed: time !== null && time !== undefined
            };
          })
        };
      
      case 'Gesture Game':
        const gesturePoses = ['thumbs_up', 'thumbs_down', 'victory', 'butterfly', 'spectacle', 'heart', 'pointing_up', 'iloveyou', 'dua', 'closed_fist', 'open_palm'];
        const completedGesturePoses = gesturePoses.filter(pose => session[pose] !== null && session[pose] !== undefined);
        const totalGestureTime = completedGesturePoses.reduce((sum, pose) => sum + (session[pose] || 0), 0);
        return {
          completed: completedGesturePoses.length,
          total: gesturePoses.length,
          totalTime: totalGestureTime,
          averageTime: completedGesturePoses.length > 0 ? totalGestureTime / completedGesturePoses.length : 0,
          details: GESTURE_NAMES.map((gesture, index) => {
            const fieldName = gesturePoses[index];
            const time = session[fieldName];
            return {
              name: gesture,
              time: time,
              completed: time !== null && time !== undefined
            };
          })
        };
      
      case 'Gaze Game':
        const totalBalloons = (session.round1Count || 0) + (session.round2Count || 0) + (session.round3Count || 0);
        const roundsPlayed = ['round1Count', 'round2Count', 'round3Count'].filter(round => session[round] !== null && session[round] !== undefined).length;
        return {
          completed: roundsPlayed,
          total: 3,
          totalTime: totalBalloons,
          averageTime: roundsPlayed > 0 ? totalBalloons / roundsPlayed : 0,
          details: [
            { name: 'Round 1 🎈', time: session.round1Count, completed: session.round1Count !== null && session.round1Count !== undefined },
            { name: 'Round 2 🎈', time: session.round2Count, completed: session.round2Count !== null && session.round2Count !== undefined },
            { name: 'Round 3 🎈', time: session.round3Count, completed: session.round3Count !== null && session.round3Count !== undefined }
          ]
        };
      
      case 'Repeat With Me Game':
        const repeatRounds = ['round1Score', 'round2Score', 'round3Score', 'round4Score', 'round5Score', 'round6Score', 'round7Score', 'round8Score', 'round9Score', 'round10Score', 'round11Score', 'round12Score'];
        const completedRepeatRounds = repeatRounds.filter(round => session[round] !== null && session[round] !== undefined);
        const totalRepeatScore = completedRepeatRounds.reduce((sum, round) => sum + (session[round] || 0), 0);
        return {
          completed: completedRepeatRounds.length,
          total: repeatRounds.length,
          totalTime: totalRepeatScore,
          averageTime: completedRepeatRounds.length > 0 ? totalRepeatScore / completedRepeatRounds.length : 0,
          details: repeatRounds.map((round, index) => ({
            name: `Round ${index + 1} 🔄`,
            time: session[round],
            completed: session[round] !== null && session[round] !== undefined
          }))
        };
      
      default:
        return {
          completed: 0,
          total: 0,
          totalTime: 0,
          averageTime: 0,
          details: []
        };
    }
  };

  const formatScore = (score: number, gameName: string) => {
    switch (gameName) {
      case 'Gaze Game':
        return `${score} balloons`;
      case 'Repeat With Me Game':
        return `${Math.round(score)}% avg`;
      default:
        return `${Math.round(score)}s total`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Game Selection Dropdown */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <TrendingUp className="h-6 w-6 text-purple-600" />
          <h2 className="text-xl font-bold text-gray-900">Session History</h2>
        </div>
        <div className="flex items-center space-x-4">
          <label className="text-base font-bold text-gray-800">Select Game:</label>
          <Select value={selectedGame} onValueChange={setSelectedGame}>
            <SelectTrigger className="w-72 h-12 border-2 border-gray-300 bg-white shadow-sm hover:border-purple-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-200">
              <SelectValue placeholder="Choose a game to view session history" />
            </SelectTrigger>
            <SelectContent>
              {tournament.selectedGames.map((gameName) => (
                <SelectItem key={gameName} value={gameName}>
                  <div className="flex items-center space-x-2">
                    <span>{GAME_ICONS[gameName as keyof typeof GAME_ICONS]}</span>
                    <span>{gameName}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Session History Data */}
      {selectedGame && (
        <div className="space-y-4">

          {isLoading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading session data...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <div className="text-red-500 mb-4">⚠️</div>
              <p className="text-red-600 mb-2">Error loading session data</p>
              <p className="text-sm text-gray-600">{error}</p>
            </div>
          )}

          {!isLoading && !error && sessions.length === 0 && (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-4">
                <Trophy className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                No Sessions Yet
              </h3>
              <p className="text-gray-500">
                You haven't played {selectedGame} in this tournament yet.
              </p>
            </div>
          )}

          {!isLoading && !error && sessions.length > 0 && (
            <Card className="card-playful backdrop-blur-sm bg-white/90 border-2 border-purple-200 shadow-xl">
              <CardHeader className="pb-3">
                <CardTitle className="font-playful text-xl text-purple-600">Session History 📚</CardTitle>
                <CardDescription className="font-comic text-base">
                  Your tournament session history with detailed breakdowns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sessions.map((session, index) => {
                    const metrics = getGameSpecificMetrics(session, selectedGame);
                    const sessionNumber = sessions.length - index;
                    
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
                              {selectedGame === 'Gaze Game' ? metrics.totalTime :
                               selectedGame === 'Repeat With Me Game' ? `${Math.round(metrics.averageTime)}%` :
                               `${metrics.averageTime.toFixed(1)}s`}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {selectedGame === 'Gaze Game' ? 'Total Balloons' :
                               selectedGame === 'Repeat With Me Game' ? 'Average Score' : 'Avg Time'}
                            </div>
                          </div>
                        </div>
                        
                        {/* Session Summary */}
                        <div className="grid grid-cols-3 gap-2 mb-3">
                          <div className="text-center p-2 bg-blue-50 rounded">
                            <div className="text-sm font-bold text-blue-600">{metrics.completed}</div>
                            <div className="text-xs text-muted-foreground">Completed</div>
                          </div>
                          <div className="text-center p-2 bg-green-50 rounded">
                            <div className="text-sm font-bold text-green-600">{Math.round((metrics.completed / metrics.total) * 100)}%</div>
                            <div className="text-xs text-muted-foreground">Success Rate</div>
                          </div>
                          <div className="text-center p-2 bg-purple-50 rounded">
                            <div className="text-sm font-bold text-purple-600">
                              {selectedGame === 'Gaze Game' ? metrics.totalTime :
                               selectedGame === 'Repeat With Me Game' ? `${Math.round(metrics.totalTime / metrics.completed)}%` :
                               `${metrics.totalTime.toFixed(1)}s`}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {selectedGame === 'Gaze Game' ? 'Total Balloons' :
                               selectedGame === 'Repeat With Me Game' ? 'Total Score' : 'Total Time'}
                            </div>
                          </div>
                        </div>

                        {/* Detailed Breakdown */}
                        <div className="border-t pt-3">
                          <div className="text-xs font-semibold text-gray-600 mb-2">
                            {selectedGame === 'Gaze Game' ? 'Round Details:' : 
                             selectedGame === 'Repeat With Me Game' ? 'Round Scores:' :
                             selectedGame === 'Dance Doodle' ? 'Pose Details:' :
                             selectedGame === 'Mirror Posture Game' ? 'Posture Details:' :
                             'Gesture Details:'}
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            {metrics.details.map((detail, detailIndex) => {
                              // Extract emoji and name properly
                              const emoji = detail.name.split(' ').pop(); // Get the emoji
                              const name = detail.name.split(' ').slice(0, -1).join(' '); // Get the name without emoji
                              
                              return (
                                <div key={detailIndex} className={`flex items-center justify-between p-2 rounded text-xs ${
                                  detail.completed ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                                }`}>
                                  <div className="flex items-center gap-1">
                                    <span className="text-sm">{emoji}</span>
                                    <span className="text-xs text-gray-500">{name}</span>
                                  </div>
                                  <div className={`font-bold ${detail.completed ? 'text-green-600' : 'text-red-500'}`}>
                                    {detail.completed ? (
                                      selectedGame === 'Gaze Game' ? `${detail.time} balloons` :
                                      selectedGame === 'Repeat With Me Game' ? `${detail.time}%` :
                                      `${detail.time.toFixed(1)}s`
                                    ) : 'Not done'}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {!selectedGame && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Trophy className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            Select a Game
          </h3>
          <p className="text-gray-500">
            Choose a game from the dropdown to view your session history.
          </p>
        </div>
      )}
    </div>
  );
};

export default TournamentPerformanceView;