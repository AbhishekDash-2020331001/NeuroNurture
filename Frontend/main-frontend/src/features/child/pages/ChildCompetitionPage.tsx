import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import TournamentLeaderboard from '@/features/parent/components/TournamentLeaderboard';
import TournamentPerformanceView from '@/features/parent/components/TournamentPerformanceView';
import { ChildTournament, childTournamentService } from '@/shared/services/child/childTournamentService';
import { Calendar, Clock, Crown, Gamepad2, Loader2, Medal, Play, Trophy, Users } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface ChildCompetitionPageProps {
  childId: string;
  childName: string;
}

interface LeaderboardEntry {
  rank: number;
  childName: string;
  score: number;
  gamesCompleted: number;
  isCurrentChild: boolean;
}

const ChildCompetitionPage: React.FC<ChildCompetitionPageProps> = ({ childId, childName }) => {
  const [tournaments, setTournaments] = useState<ChildTournament[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'upcoming' | 'completed'>('all');
  const [selectedTournament, setSelectedTournament] = useState<ChildTournament | null>(null);
  const [tournamentTab, setTournamentTab] = useState<'arena' | 'leaderboard' | 'performance'>('arena');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await childTournamentService.getTournamentsByChild(childId);
        setTournaments(response.tournaments);
      } catch (err) {
        console.error('Error fetching tournaments:', err);
        setError('Failed to load tournaments. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    if (childId) {
      fetchTournaments();
    }
  }, [childId]);


  const getTournamentStatus = (tournament: ChildTournament) => {
    return childTournamentService.getTournamentStatus(tournament.startTime, tournament.endTime, tournament.status);
  };

  const getStatusColor = (status: string) => {
    return childTournamentService.getStatusColor(status);
  };

  const getStatusIcon = (status: string) => {
    return childTournamentService.getStatusIcon(status);
  };


  const formatDate = (dateString: string) => {
    return childTournamentService.formatDate(dateString);
  };

  const handleEnterArena = (tournament: ChildTournament) => {
    setSelectedTournament(tournament);
    setTournamentTab('arena');
  };

  const handleBackToTournaments = () => {
    setSelectedTournament(null);
  };

  // Mock leaderboard data - in real implementation, this would come from the backend
  const getLeaderboardData = (): LeaderboardEntry[] => {
    return [
      { rank: 1, childName: "Alex Johnson", score: 2850, gamesCompleted: 5, isCurrentChild: childName === "Alex Johnson" },
      { rank: 2, childName: "Sarah Wilson", score: 2720, gamesCompleted: 5, isCurrentChild: childName === "Sarah Wilson" },
      { rank: 3, childName: childName, score: 2650, gamesCompleted: 4, isCurrentChild: true },
      { rank: 4, childName: "Mike Chen", score: 2480, gamesCompleted: 4, isCurrentChild: childName === "Mike Chen" },
      { rank: 5, childName: "Emma Davis", score: 2310, gamesCompleted: 3, isCurrentChild: childName === "Emma Davis" },
    ];
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Medal className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="text-sm font-bold text-gray-600">#{rank}</span>;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-100 to-amber-100 border-yellow-300';
      case 2:
        return 'bg-gradient-to-r from-gray-100 to-gray-200 border-gray-300';
      case 3:
        return 'bg-gradient-to-r from-amber-100 to-orange-100 border-amber-300';
      default:
        return 'bg-white border-gray-200';
    }
  };

  const handleGameClick = (gameName: string) => {
    // Map game names to their respective routes
    const gameRoutes: { [key: string]: string } = {
      'Dance Doodle': '/games/dance-doodle',
      'Gaze Game': '/games/gaze-tracking',
      'Gesture Game': '/games/gesture',
      'Mirror Posture Game': '/games/mirror-posture',
      'Repeat With Me Game': '/games/repeat-with-me'
    };

    const gameRoute = gameRoutes[gameName];
    if (gameRoute && selectedTournament) {
      navigate(`${gameRoute}?tournamentId=${selectedTournament.tournamentId}&childId=${childId}`);
    } else {
      console.error(`Unknown game: ${gameName}`);
    }
  };

  const getFilteredTournaments = () => {
    if (!tournaments) return [];
    if (filter === 'all') return tournaments;
    return tournaments.filter(tournament => {
      const status = getTournamentStatus(tournament);
      return status === filter.toUpperCase();
    });
  };

  const getTournamentStats = () => {
    if (!tournaments) return { total: 0, active: 0, upcoming: 0, completed: 0 };
    
    const total = tournaments.length;
    const active = tournaments.filter(t => getTournamentStatus(t) === 'ACTIVE').length;
    const upcoming = tournaments.filter(t => getTournamentStatus(t) === 'UPCOMING').length;
    const completed = tournaments.filter(t => getTournamentStatus(t) === 'COMPLETED').length;
    
    return { total, active, upcoming, completed };
  };

  const stats = getTournamentStats();
  const filteredTournaments = getFilteredTournaments();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading your tournaments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-red-500 mb-4">⚠️</div>
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // If a tournament is selected, show tournament details
  if (selectedTournament) {
    const status = getTournamentStatus(selectedTournament);
    const isActive = status === 'ACTIVE';
    const leaderboardData = getLeaderboardData();

    return (
      <div className="h-full flex flex-col">
        {/* Tournament Tab Selection */}
        <div className="flex-shrink-0 pb-6 ml-4">
          <div className="border-b-2 border-amber-200 mb-6">
            <div className="flex space-x-12">
              {[
                { key: 'arena', label: 'Arena' },
                { key: 'leaderboard', label: 'Leaderboard' },
                { key: 'performance', label: 'My Performance' }
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setTournamentTab(key as any)}
                  className={`pb-4 text-lg font-semibold border-b-3 transition-all duration-300 ${
                    tournamentTab === key
                      ? 'border-amber-500 text-amber-700 bg-gradient-to-b from-amber-50 to-yellow-50 px-4 py-2 rounded-t-lg shadow-sm'
                      : 'border-transparent text-gray-600 hover:text-amber-600 hover:border-amber-300 hover:bg-gradient-to-b hover:from-amber-25 hover:to-yellow-25 px-4 py-2 rounded-t-lg hover:shadow-sm'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tournament Content */}
        <div className="flex-1 overflow-y-auto space-y-4">
          {tournamentTab === 'arena' && (
            <div className="px-6 py-4">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-4">
                  <Trophy className="h-8 w-8 text-yellow-600" />
                  <h1 className="text-3xl font-bold text-gray-900">{selectedTournament.tournamentTitle}</h1>
                </div>
                <div className={`text-lg font-bold px-4 py-2 rounded-lg ${
                  isActive ? 'text-green-800 bg-green-200' : 'text-gray-800 bg-gray-200'
                }`}>
                  {isActive ? '🔄 Active' : '🏁 Ended'}
                </div>
              </div>

              {/* Tournament Description */}
              <p className="text-gray-800 text-xl mb-8 leading-relaxed font-medium">{selectedTournament.tournamentDescription}</p>

              {/* Tournament Info Grid */}
              <div className="grid grid-cols-2 gap-8 mb-8">
                <div className="flex items-center space-x-4">
                  <Calendar className="h-6 w-6 text-yellow-600" />
                  <div>
                    <div className="text-lg font-bold text-gray-700">Start Date</div>
                    <div className="text-xl text-gray-900 font-semibold">{formatDate(selectedTournament.startTime)}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Clock className="h-6 w-6 text-yellow-600" />
                  <div>
                    <div className="text-lg font-bold text-gray-700">End Date</div>
                    <div className="text-xl text-gray-900 font-semibold">{formatDate(selectedTournament.endTime)}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Users className="h-6 w-6 text-yellow-600" />
                  <div>
                    <div className="text-lg font-bold text-gray-700">Grade Level</div>
                    <div className="text-xl text-gray-900 font-semibold">{selectedTournament.gradeLevel}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Gamepad2 className="h-6 w-6 text-yellow-600" />
                  <div>
                    <div className="text-lg font-bold text-gray-700">Available Games</div>
                    <div className="text-xl text-gray-900 font-semibold">{selectedTournament.selectedGames.length} games</div>
                  </div>
                </div>
              </div>

              {/* Games Section */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Games</h2>
                <div className="flex flex-wrap gap-2">
                  {selectedTournament.selectedGames.map((gameName, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className={`group relative overflow-hidden transition-all duration-300 transform hover:scale-105 ${
                        !isActive 
                          ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' 
                          : 'bg-gradient-to-r from-yellow-500 to-amber-600 text-white border-yellow-500 hover:from-yellow-600 hover:to-amber-700 hover:shadow-lg'
                      }`}
                      onClick={() => isActive && handleGameClick(gameName)}
                      disabled={!isActive}
                    >
                      <div className="flex items-center space-x-1">
                        <span className="text-sm">{childTournamentService.getGameIcon(gameName)}</span>
                        <span className="text-xs font-bold">
                          {gameName.split(' ')[0]}
                        </span>
                        {isActive && (
                          <Play className="h-3 w-3 opacity-80" />
                        )}
                      </div>
                      <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                    </Button>
                  ))}
                </div>
              </div>
              
              {!isActive && (
                <div className="p-6 bg-gray-100 rounded-lg text-center">
                  <p className="text-lg text-gray-700 font-medium">
                    This tournament has ended. Check the leaderboard to see final results!
                  </p>
                </div>
              )}
            </div>
          )}

          {tournamentTab === 'leaderboard' && (
            <div className="space-y-4">
              {/* Compact Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Trophy className="h-5 w-5 text-yellow-600" />
                  <h3 className="text-lg font-semibold text-gray-800">Leaderboard</h3>
                </div>
                <div className="text-sm text-gray-600">
                  Current standings
                </div>
              </div>

              {/* Leaderboard Content */}
              <TournamentLeaderboard 
                tournament={selectedTournament} 
                childId={childId} 
                childName={childName}
              />
            </div>
          )}

          {tournamentTab === 'performance' && (
            <div className="space-y-4">
              {/* Compact Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Medal className="h-5 w-5 text-yellow-600" />
                  <h3 className="text-lg font-semibold text-gray-800">My Performance</h3>
                </div>
                <div className="text-sm text-gray-600">
                  Your progress
                </div>
              </div>

              {/* Performance Content */}
              <TournamentPerformanceView 
                tournament={selectedTournament} 
                childId={childId} 
                childName={childName}
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  // Default tournaments list view
  return (
    <div className="h-full flex flex-col">
      {/* Fixed Header Section */}
      <div className="flex-shrink-0 space-y-6 pb-6">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Trophy className="h-10 w-10 text-yellow-500 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">
              Competition Arena
            </h1>
            <Trophy className="h-10 w-10 text-yellow-500 ml-3" />
          </div>
          <p className="text-gray-600">
            Compete with your classmates and show off your skills!
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-3 justify-center">
          {[
            { key: 'all', label: 'All Tournaments', count: stats.total },
            { key: 'active', label: 'Active', count: stats.active },
            { key: 'upcoming', label: 'Upcoming', count: stats.upcoming },
            { key: 'completed', label: 'Completed', count: stats.completed }
          ].map(({ key, label, count }) => (
            <Button
              key={key}
              variant={filter === key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(key as any)}
              className={`relative ${
                filter === key 
                  ? 'bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white border-0 shadow-md' 
                  : 'border-yellow-200 text-yellow-700 hover:bg-yellow-50 hover:text-yellow-800 hover:border-yellow-300'
              }`}
            >
              {label}
              {count > 0 && (
                <Badge variant="secondary" className={`ml-2 ${
                  filter === key 
                    ? 'bg-white/20 text-white' 
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {count}
                </Badge>
              )}
            </Button>
          ))}
        </div>
      </div>

      {/* Scrollable Tournaments List */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredTournaments.length === 0 ? (
          <div className="col-span-full">
            <Card className="text-center py-12">
              <CardContent>
                <div className="text-gray-400 mb-4">
                  <Trophy className="h-16 w-16 mx-auto" />
                </div>
                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                  {filter === 'all' ? 'No tournaments available yet' : `No ${filter} tournaments`}
                </h3>
                <p className="text-gray-500">
                  {filter === 'all' 
                    ? 'Your teacher will create exciting tournaments for you to compete in.' 
                    : `No tournaments found in the ${filter} category.`
                  }
                </p>
              </CardContent>
            </Card>
          </div>
        ) : (
          filteredTournaments.map((tournament) => {
            const status = getTournamentStatus(tournament);
            const isActive = status === 'ACTIVE';
            const isUpcoming = status === 'UPCOMING';
            const isCompleted = status === 'COMPLETED';
            const statusColor = isActive ? 'text-green-600 bg-green-100' : 
                              isUpcoming ? 'text-blue-600 bg-blue-100' : 
                              'text-gray-600 bg-gray-100';
            const statusIcon = isActive ? '🔄' : isUpcoming ? '⏰' : '🏁';

            return (
              <Card key={tournament.tournamentId} className="hover:shadow-lg transition-shadow border-l-4 border-l-yellow-200 relative overflow-hidden h-full flex flex-col">
                <CardHeader className="bg-gradient-to-r from-yellow-50 to-amber-50 relative p-4 flex-shrink-0">
                  {/* Trophy background pattern */}
                  <div className="absolute top-1 right-1 opacity-10">
                    <Trophy className="h-8 w-8 text-yellow-400" />
                  </div>
                  <div className="flex items-start justify-between relative z-10">
                    <div className="flex-1">
                      <CardTitle className="text-lg text-gray-900 mb-1 font-bold line-clamp-2">
                        {tournament.tournamentTitle}
                      </CardTitle>
                      <CardDescription className="text-gray-700 text-sm line-clamp-2">
                        {tournament.tournamentDescription}
                      </CardDescription>
                    </div>
                    <Badge className={`${statusColor} border-0 shadow-sm text-xs`}>
                      <span className="mr-1">{statusIcon}</span>
                      {status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-4 flex-1 flex flex-col">
                  <div className="space-y-3 flex-1">
                    {/* Games - Compact */}
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2 flex items-center text-sm">
                        <Gamepad2 className="h-4 w-4 mr-1 text-yellow-600" />
                        Games:
                      </h4>
                      <div className="flex flex-wrap gap-2 min-h-[2.5rem]">
                        {tournament.selectedGames.slice(0, 3).map((gameName, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            className={`group relative overflow-hidden transition-all duration-300 transform hover:scale-105 ${
                              isCompleted 
                                ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' 
                                : 'bg-gradient-to-r from-yellow-500 to-amber-600 text-white border-yellow-500 hover:from-yellow-600 hover:to-amber-700 hover:shadow-lg'
                            }`}
                            onClick={() => !isCompleted && handleEnterArena(tournament)}
                            disabled={isCompleted}
                          >
                            <div className="flex items-center space-x-1">
                              <span className="text-sm">{childTournamentService.getGameIcon(gameName)}</span>
                              <span className="text-xs font-bold">
                                {gameName.split(' ')[0]}
                              </span>
                              {!isCompleted && (
                                <Play className="h-3 w-3 opacity-80" />
                              )}
                            </div>
                            <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Time Information - Compact */}
                    <div className="bg-gray-50 rounded p-2">
                      <div className="space-y-1">
                        <div className="flex items-center text-xs text-gray-700">
                          <Calendar className="h-3 w-3 mr-1 text-yellow-600" />
                          <span>Start: {formatDate(tournament.startTime)}</span>
                        </div>
                        <div className="flex items-center text-xs text-gray-700">
                          <Clock className="h-3 w-3 mr-1 text-yellow-600" />
                          <span>End: {formatDate(tournament.endTime)}</span>
                        </div>
                        <div className="flex items-center text-xs text-gray-700">
                          <Users className="h-3 w-3 mr-1 text-yellow-600" />
                          <span>Grade: {tournament.gradeLevel}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons - Always at bottom */}
                  <div className="pt-3 mt-auto">
                    {isActive && (
                      <Button 
                        onClick={() => handleEnterArena(tournament)}
                        className="bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white shadow-md w-full text-sm py-2"
                      >
                        Enter Arena
                      </Button>
                    )}
                    {isUpcoming && (
                      <Button variant="outline" disabled className="border-yellow-300 text-yellow-600 bg-yellow-50 w-full text-sm py-2">
                        Not Started
                      </Button>
                    )}
                    {isCompleted && (
                      <Button variant="outline" className="border-gray-300 text-gray-600 bg-gray-50 w-full text-sm py-2">
                        View Results
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
        </div>
      </div>
    </div>
  );
};

export default ChildCompetitionPage;
