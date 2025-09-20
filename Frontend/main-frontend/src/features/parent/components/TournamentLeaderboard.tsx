import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChildTournament } from '@/shared/services/child/childTournamentService';
import { Award, Crown, Medal, Trophy, Users } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface TournamentLeaderboardProps {
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

interface LeaderboardEntry {
  rank: number;
  childId: string;
  childName: string;
  bestScore: number;
  totalAttempts: number;
  completionRate: number;
  isCurrentChild: boolean;
  gameSpecificData: any;
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

const TournamentLeaderboard: React.FC<TournamentLeaderboardProps> = ({ 
  tournament, 
  childId, 
  childName 
}) => {
  const [selectedGame, setSelectedGame] = useState<string>('');
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load leaderboard when a game is selected
  useEffect(() => {
    if (selectedGame) {
      loadGameLeaderboard(selectedGame);
    }
  }, [selectedGame, tournament.tournamentId]);

  const loadGameLeaderboard = async (gameName: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const baseUrl = GAME_SERVICE_URLS[gameName as keyof typeof GAME_SERVICE_URLS];
      if (!baseUrl) {
        throw new Error(`Unknown game: ${gameName}`);
      }

      console.log(`🔍 [LEADERBOARD DEBUG] Fetching leaderboard for:`, {
        gameName,
        tournamentId: tournament.tournamentId,
        url: `${baseUrl}/sessions/tournament/${tournament.tournamentId}`
      });

      // Fetch all sessions for this tournament and game
      const response = await fetch(`${baseUrl}/sessions/tournament/${tournament.tournamentId}`);
      
      console.log(`🔍 [LEADERBOARD DEBUG] Response status:`, response.status);
      
      if (response.ok) {
        const sessions = await response.json();
        console.log(`🔍 [LEADERBOARD DEBUG] Raw sessions data:`, sessions);
        console.log(`🔍 [LEADERBOARD DEBUG] Number of sessions:`, sessions.length);
        
        const leaderboard = await calculateLeaderboard(sessions, gameName);
        console.log(`🔍 [LEADERBOARD DEBUG] Calculated leaderboard:`, leaderboard);
        setLeaderboardData(leaderboard);
      } else if (response.status === 404) {
        console.log(`🔍 [LEADERBOARD DEBUG] No sessions found (404)`);
        setLeaderboardData([]);
      } else {
        throw new Error(`Failed to load leaderboard: ${response.statusText}`);
      }
    } catch (err) {
      console.error('Error loading game leaderboard:', err);
      setError(err instanceof Error ? err.message : 'Failed to load leaderboard');
      setLeaderboardData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateLeaderboard = async (sessions: GameSession[], gameName: string): Promise<LeaderboardEntry[]> => {
    console.log(`🔍 [LEADERBOARD DEBUG] Calculating leaderboard for ${sessions.length} sessions`);
    
    // Group sessions by child
    const childSessions = new Map<string, GameSession[]>();
    
    sessions.forEach(session => {
      console.log(`🔍 [LEADERBOARD DEBUG] Processing session:`, {
        sessionId: session.sessionId,
        childId: session.childId,
        childName: session.childName,
        hasChildName: !!session.childName
      });
      
      if (!childSessions.has(session.childId)) {
        childSessions.set(session.childId, []);
      }
      childSessions.get(session.childId)!.push(session);
    });

    console.log(`🔍 [LEADERBOARD DEBUG] Grouped sessions by child:`, Array.from(childSessions.keys()));

    const leaderboard: LeaderboardEntry[] = [];

    // Fetch child names for all unique child IDs
    const childIds = Array.from(childSessions.keys());
    const childNames = await fetchChildNames(childIds);
    console.log(`🔍 [LEADERBOARD DEBUG] Fetched child names:`, childNames);

    childSessions.forEach((childSessionList, sessionChildId) => {
      const bestSession = findBestSession(childSessionList, gameName);
      const totalAttempts = childSessionList.length;
      const completionRate = calculateCompletionRate(bestSession, gameName);
      const bestScore = calculateScore(bestSession, gameName);

      const actualChildName = childNames[sessionChildId] || bestSession.childName || `Child ${sessionChildId}`;
      console.log(`🔍 [LEADERBOARD DEBUG] Child ${sessionChildId} name:`, actualChildName);
      console.log(`🔍 [LEADERBOARD DEBUG] Best session for ${actualChildName}:`, {
        sessionId: bestSession.sessionId,
        completionRate: Math.round(completionRate),
        bestScore: Math.round(bestScore),
        totalAttempts,
        gameSpecificData: getGameSpecificData(bestSession, gameName)
      });

      leaderboard.push({
        rank: 0, // Will be calculated after sorting
        childId: sessionChildId,
        childName: actualChildName,
        bestScore,
        totalAttempts,
        completionRate,
        isCurrentChild: sessionChildId === childId,
        gameSpecificData: getGameSpecificData(bestSession, gameName)
      });
    });

    // Sort according to ranking criteria
    leaderboard.sort((a, b) => {
      // 1. Higher completion rate = higher rank
      if (a.completionRate !== b.completionRate) {
        return b.completionRate - a.completionRate;
      }
      
      // 2. If completion rates are equal, better score = higher rank
      if (a.bestScore !== b.bestScore) {
        // For time-based games (Dance, Mirror, Gesture), lower time is better
        // For score-based games (Gaze, Repeat), higher score is better
        if (selectedGame === 'Dance Doodle' || selectedGame === 'Mirror Posture Game' || selectedGame === 'Gesture Game') {
          return a.bestScore - b.bestScore; // Lower time = better rank
        } else {
          return b.bestScore - a.bestScore; // Higher score = better rank
        }
      }
      
      // 3. If scores are equal, more attempts = higher rank (shows more engagement)
      return b.totalAttempts - a.totalAttempts;
    });

    // Assign ranks
    leaderboard.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    return leaderboard;
  };

  const fetchChildNames = async (childIds: string[]): Promise<Record<string, string>> => {
    const childNames: Record<string, string> = {};
    
    try {
      // Fetch child details for each unique child ID
      const promises = childIds.map(async (childId) => {
        try {
          const response = await fetch(`http://localhost:8082/api/parents/children/${childId}/details`);
          if (response.ok) {
            const childData = await response.json();
            childNames[childId] = childData.name || `Child ${childId}`;
            console.log(`🔍 [LEADERBOARD DEBUG] Fetched name for child ${childId}:`, childData.name);
          } else {
            console.warn(`🔍 [LEADERBOARD DEBUG] Failed to fetch child ${childId}:`, response.status);
            childNames[childId] = `Child ${childId}`;
          }
        } catch (error) {
          console.error(`🔍 [LEADERBOARD DEBUG] Error fetching child ${childId}:`, error);
          childNames[childId] = `Child ${childId}`;
        }
      });
      
      await Promise.all(promises);
    } catch (error) {
      console.error('🔍 [LEADERBOARD DEBUG] Error fetching child names:', error);
    }
    
    return childNames;
  };

  const findBestSession = (sessions: GameSession[], gameName: string): GameSession => {
    return sessions.reduce((best, current) => {
      const bestCompletion = calculateCompletionRate(best, gameName);
      const currentCompletion = calculateCompletionRate(current, gameName);
      
      // If completion rates are different, choose the one with higher completion
      if (bestCompletion !== currentCompletion) {
        return currentCompletion > bestCompletion ? current : best;
      }
      
      // If completion rates are equal, choose the one with better score
      const bestScore = calculateScore(best, gameName);
      const currentScore = calculateScore(current, gameName);
      
      // For time-based games (Dance, Mirror, Gesture), lower time is better
      // For score-based games (Gaze, Repeat), higher score is better
      if (gameName === 'Dance Doodle' || gameName === 'Mirror Posture Game' || gameName === 'Gesture Game') {
        return currentScore < bestScore ? current : best; // Lower time = better
      } else {
        return currentScore > bestScore ? current : best; // Higher score = better
      }
    });
  };

  const calculateCompletionRate = (session: GameSession, gameName: string): number => {
    switch (gameName) {
      case 'Dance Doodle':
        const dancePoses = ['cool_arms', 'open_wings', 'silly_boxer', 'happy_stand', 'crossy_play', 'shh_fun', 'stretch'];
        const completedDancePoses = dancePoses.filter(pose => session[pose] !== null && session[pose] !== undefined).length;
        return (completedDancePoses / dancePoses.length) * 100;
      
      case 'Mirror Posture Game':
        const posturePoses = ['lookingSideways', 'mouthOpen', 'showingTeeth', 'kiss'];
        const completedPosturePoses = posturePoses.filter(pose => session[pose] !== null && session[pose] !== undefined).length;
        return (completedPosturePoses / posturePoses.length) * 100;
      
      case 'Gesture Game':
        const gesturePoses = ['thumbs_up', 'thumbs_down', 'victory', 'butterfly', 'spectacle', 'heart', 'pointing_up', 'iloveyou', 'dua', 'closed_fist', 'open_palm'];
        const completedGesturePoses = gesturePoses.filter(pose => session[pose] !== null && session[pose] !== undefined).length;
        return (completedGesturePoses / gesturePoses.length) * 100;
      
      case 'Gaze Game':
        // For gaze game, completion is based on having played all 3 rounds
        const rounds = ['round1Count', 'round2Count', 'round3Count'];
        const completedRounds = rounds.filter(round => session[round] !== null && session[round] !== undefined).length;
        return (completedRounds / rounds.length) * 100;
      
      case 'Repeat With Me Game':
        const repeatRounds = ['round1Score', 'round2Score', 'round3Score', 'round4Score', 'round5Score', 'round6Score', 'round7Score', 'round8Score', 'round9Score', 'round10Score', 'round11Score', 'round12Score'];
        const completedRepeatRounds = repeatRounds.filter(round => session[round] !== null && session[round] !== undefined).length;
        return (completedRepeatRounds / repeatRounds.length) * 100;
      
      default:
        return 0;
    }
  };

  const calculateScore = (session: GameSession, gameName: string): number => {
    switch (gameName) {
      case 'Dance Doodle':
        // Total completion time summing all rounds
        const dancePoses = ['cool_arms', 'open_wings', 'silly_boxer', 'happy_stand', 'crossy_play', 'shh_fun', 'stretch'];
        return dancePoses.reduce((sum, pose) => {
          const time = session[pose];
          return sum + (time !== null && time !== undefined ? time : 0);
        }, 0);
      
      case 'Mirror Posture Game':
        // Total completion time summing all rounds
        const posturePoses = ['lookingSideways', 'mouthOpen', 'showingTeeth', 'kiss'];
        return posturePoses.reduce((sum, pose) => {
          const time = session[pose];
          return sum + (time !== null && time !== undefined ? time : 0);
        }, 0);
      
      case 'Gesture Game':
        // Total completion time summing all rounds
        const gesturePoses = ['thumbs_up', 'thumbs_down', 'victory', 'butterfly', 'spectacle', 'heart', 'pointing_up', 'iloveyou', 'dua', 'closed_fist', 'open_palm'];
        return gesturePoses.reduce((sum, pose) => {
          const time = session[pose];
          return sum + (time !== null && time !== undefined ? time : 0);
        }, 0);
      
      case 'Gaze Game':
        // Total balloon popped summing all three rounds
        return (session.round1Count || 0) + (session.round2Count || 0) + (session.round3Count || 0);
      
      case 'Repeat With Me Game':
        // Average similarity score across all rounds
        const repeatRounds = ['round1Score', 'round2Score', 'round3Score', 'round4Score', 'round5Score', 'round6Score', 'round7Score', 'round8Score', 'round9Score', 'round10Score', 'round11Score', 'round12Score'];
        const completedRounds = repeatRounds.filter(round => session[round] !== null && session[round] !== undefined);
        if (completedRounds.length === 0) return 0;
        const totalScore = completedRounds.reduce((sum, round) => sum + (session[round] || 0), 0);
        return totalScore / completedRounds.length; // Average score
      
      default:
        return 0;
    }
  };

  const getGameSpecificData = (session: GameSession, gameName: string) => {
    switch (gameName) {
      case 'Dance Doodle':
        return {
          completedPoses: ['cool_arms', 'open_wings', 'silly_boxer', 'happy_stand', 'crossy_play', 'shh_fun', 'stretch']
            .filter(pose => session[pose] !== null && session[pose] !== undefined).length,
          totalPoses: 7
        };
      
      case 'Mirror Posture Game':
        return {
          completedPostures: ['lookingSideways', 'mouthOpen', 'showingTeeth', 'kiss']
            .filter(pose => session[pose] !== null && session[pose] !== undefined).length,
          totalPostures: 4
        };
      
      case 'Gesture Game':
        return {
          completedGestures: ['thumbs_up', 'thumbs_down', 'victory', 'butterfly', 'spectacle', 'heart', 'pointing_up', 'iloveyou', 'dua', 'closed_fist', 'open_palm']
            .filter(pose => session[pose] !== null && session[pose] !== undefined).length,
          totalGestures: 11
        };
      
      case 'Gaze Game':
        return {
          totalBalloons: (session.round1Count || 0) + (session.round2Count || 0) + (session.round3Count || 0),
          roundsPlayed: ['round1Count', 'round2Count', 'round3Count']
            .filter(round => session[round] !== null && session[round] !== undefined).length
        };
      
      case 'Repeat With Me Game':
        return {
          completedRounds: ['round1Score', 'round2Score', 'round3Score', 'round4Score', 'round5Score', 'round6Score', 'round7Score', 'round8Score', 'round9Score', 'round10Score', 'round11Score', 'round12Score']
            .filter(round => session[round] !== null && session[round] !== undefined).length,
          totalRounds: 12
        };
      
      default:
        return {};
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-gray-600">#{rank}</span>;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200';
      case 2:
        return 'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200';
      case 3:
        return 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200';
      default:
        return 'bg-white border-gray-100';
    }
  };

  const formatScore = (score: number, gameName: string, gameSpecificData?: any) => {
    switch (gameName) {
      case 'Dance Doodle':
        return `${Math.round(score)}s total`;
      case 'Mirror Posture Game':
        return `${Math.round(score)}s total`;
      case 'Gesture Game':
        return `${Math.round(score)}s total`;
      case 'Gaze Game':
        return `${score} balloons`;
      case 'Repeat With Me Game':
        return `${Math.round(score)}% avg`;
      default:
        return `${Math.round(score)} pts`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Game Selection Dropdown */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <Trophy className="h-6 w-6 text-yellow-600" />
          <h2 className="text-xl font-bold text-gray-900">Rankings</h2>
        </div>
        <div className="flex items-center space-x-4">
          <label className="text-base font-bold text-gray-800">Select Game:</label>
          <Select value={selectedGame} onValueChange={setSelectedGame}>
            <SelectTrigger className="w-72 h-12 border-2 border-gray-300 bg-white shadow-sm hover:border-yellow-400 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200">
              <SelectValue placeholder="Choose a game to view rankings" />
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

      {/* Rankings Table */}
      {selectedGame && (
        <div className="space-y-4">
          {isLoading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading rankings...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <div className="text-red-500 mb-4">⚠️</div>
              <p className="text-red-600 mb-2">Error loading rankings</p>
              <p className="text-sm text-gray-600">{error}</p>
            </div>
          )}

          {!isLoading && !error && leaderboardData.length === 0 && (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-4">
                <Users className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                No Data Available
              </h3>
              <p className="text-gray-500">
                No participants have played this game in the tournament yet.
              </p>
            </div>
          )}

          {!isLoading && !error && leaderboardData.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Rank</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Player</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Score</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Attempts</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Completion</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Details</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {leaderboardData.map((entry) => (
                      <tr
                        key={entry.childId}
                        className={`${
                          entry.isCurrentChild ? 'bg-blue-50' : 'hover:bg-gray-50'
                        } transition-colors`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 w-8">
                              {getRankIcon(entry.rank)}
                            </div>
                            <span className="ml-2 text-sm font-bold text-gray-900">
                              #{entry.rank}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <span className={`text-sm font-semibold ${
                              entry.isCurrentChild ? 'text-blue-700' : 'text-gray-900'
                            }`}>
                              {entry.childName}
                            </span>
                            {entry.isCurrentChild && (
                              <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-xs">
                                You
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-gray-900">
                            {formatScore(entry.bestScore, selectedGame, entry.gameSpecificData)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {entry.totalAttempts}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {Math.round(entry.completionRate)}%
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">
                            {selectedGame === 'Dance Doodle' && `${entry.gameSpecificData.completedPoses}/${entry.gameSpecificData.totalPoses} poses`}
                            {selectedGame === 'Mirror Posture Game' && `${entry.gameSpecificData.completedPostures}/${entry.gameSpecificData.totalPostures} postures`}
                            {selectedGame === 'Gesture Game' && `${entry.gameSpecificData.completedGestures}/${entry.gameSpecificData.totalGestures} gestures`}
                            {selectedGame === 'Gaze Game' && `${entry.gameSpecificData.roundsPlayed}/3 rounds • ${entry.gameSpecificData.totalBalloons} balloons`}
                            {selectedGame === 'Repeat With Me Game' && `${entry.gameSpecificData.completedRounds}/${entry.gameSpecificData.totalRounds} rounds • ${Math.round(entry.bestScore / entry.gameSpecificData.completedRounds)}% avg`}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {!selectedGame && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Crown className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            Select a Game
          </h3>
          <p className="text-gray-500">
            Choose a game from the dropdown to view the rankings.
          </p>
        </div>
      )}
    </div>
  );
};

export default TournamentLeaderboard;
