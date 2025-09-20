import { useSchoolAuth } from '@/features/school/contexts/SchoolAuthContext';
import { LeaderboardEntry, tournamentDetailsService, type TournamentDetails as TournamentDetailsType } from '@/shared/services/tournament/tournamentDetailsService';
import {
    ArrowLeft,
    Award,
    Calendar,
    Crown,
    Filter,
    Gamepad2,
    Loader2,
    Medal,
    Target,
    TrendingUp,
    Trophy,
    Users
} from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

// Use the imported interfaces from the service

// Available games mapping
const availableGames = [
    { id: 'gaze-game', name: 'Gaze Tracking', icon: '👁️', category: 'Cognitive' },
    { id: 'gesture-game', name: 'Gesture Control', icon: '✋', category: 'Motor Skills' },
    { id: 'mirror-posture-game', name: 'Mirror Posture', icon: '🧍', category: 'Physical' },
    { id: 'repeat-with-me-game', name: 'Repeat With Me', icon: '🔄', category: 'Memory' },
    { id: 'dance-doodle', name: 'Dance Doodle', icon: '💃', category: 'Creative' }
];


const TournamentDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { school } = useSchoolAuth();
    const [selectedGame, setSelectedGame] = useState<string>('');
    const [showGameDetails, setShowGameDetails] = useState<{ child: LeaderboardEntry; gameId: string } | null>(null);
    const [tournamentDetails, setTournamentDetails] = useState<TournamentDetailsType | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Set first game as selected when tournament data loads
    useEffect(() => {
        if (tournamentDetails?.tournament?.selectedGames && tournamentDetails.tournament.selectedGames.length > 0 && !selectedGame) {
            setSelectedGame(tournamentDetails.tournament.selectedGames[0]);
        }
    }, [tournamentDetails, selectedGame]);

    // Fetch tournament details
    useEffect(() => {
        const fetchTournamentDetails = async () => {
            if (!id) return;
            
            try {
                setIsLoading(true);
                setError(null);
                
                const details = await tournamentDetailsService.getTournamentDetails(parseInt(id));
                setTournamentDetails(details);
            } catch (error) {
                console.error('Error fetching tournament details:', error);
                setError(`Failed to load tournament details: ${error instanceof Error ? error.message : 'Unknown error'}`);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTournamentDetails();
    }, [id]);

    // Filter leaderboard by selected game
    const filteredLeaderboard = useMemo(() => {
        if (!tournamentDetails?.leaderboard) return [];
        
        if (selectedGame === 'all') {
            return tournamentDetails.leaderboard;
        }
        return tournamentDetails.leaderboard.filter(child => 
            child.gameType === selectedGame
        );
    }, [tournamentDetails?.leaderboard, selectedGame]);

    const getRankIcon = (rank: number) => {
        switch (rank) {
            case 1: return <Crown className="h-6 w-6 text-yellow-500" />;
            case 2: return <Medal className="h-6 w-6 text-gray-400" />;
            case 3: return <Award className="h-6 w-6 text-amber-600" />;
            default: return <span className="text-lg font-bold text-gray-600">#{rank}</span>;
        }
    };

    const getRankColor = (rank: number) => {
        switch (rank) {
            case 1: return 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200';
            case 2: return 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200';
            case 3: return 'bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200';
            default: return 'bg-white border-gray-200';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'upcoming': return 'text-blue-600 bg-blue-100';
            case 'active': return 'text-green-600 bg-green-100';
            case 'completed': return 'text-gray-600 bg-gray-100';
            case 'cancelled': return 'text-red-600 bg-red-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const getGameIcon = (gameId: string) => {
        const game = availableGames.find(g => g.id === gameId);
        return game ? game.icon : '🎮';
    };

    const getGameName = (gameId: string) => {
        const game = availableGames.find(g => g.id === gameId);
        return game ? game.name : 'Unknown Game';
    };

    const getScoreIndicator = (gameType: string) => {
        switch (gameType) {
            case 'mirror-posture-game':
                return 'Total time (lower is better)';
            case 'gesture-game':
                return 'Total time (lower is better)';
            case 'dance-doodle':
                return 'Total time (lower is better)';
            case 'gaze-game':
                return 'Balloons popped (higher is better)';
            case 'repeat-with-me-game':
                return 'Similarity % (higher is better)';
            default:
                return 'Score';
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="flex items-center space-x-2">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                    <span className="text-gray-600">Loading tournament details...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="text-red-600 mb-2">⚠️</div>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (!tournamentDetails) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="text-gray-400 mb-2">📊</div>
                    <p className="text-gray-600">No tournament data available</p>
                </div>
            </div>
        );
    }

    const tournament = tournamentDetails.tournament;
    const statistics = tournamentDetails.statistics;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => navigate('/school/tournaments')}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5 text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Tournament Details</h1>
                    </div>
                </div>
            </div>

            {/* Tournament Overview */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl">
                            <Trophy className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">{tournament.tournamentTitle}</h2>
                            <p className="text-gray-600 mt-1">{tournament.tournamentDescription}</p>
                            <div className="flex items-center space-x-6 mt-3">
                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                    <Calendar className="h-4 w-4" />
                                    <span>{tournamentDetailsService.formatDate(tournament.startTime)} - {tournamentDetailsService.formatDate(tournament.endTime)}</span>
                                </div>
                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                    <Users className="h-4 w-4" />
                                    <span>{statistics.totalParticipants} Children</span>
                                </div>
                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                    <Target className="h-4 w-4" />
                                    <span>{tournament.gradeLevel}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center space-x-3">
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <Users className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Participants</p>
                            <p className="text-2xl font-bold text-gray-900">{statistics.totalParticipants}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center space-x-3">
                        <div className="p-3 bg-green-100 rounded-lg">
                            <Gamepad2 className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600">Games Available</p>
                            <p className="text-2xl font-bold text-gray-900">{tournament.selectedGames.length}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center space-x-3">
                        <div className="p-3 bg-orange-100 rounded-lg">
                            <TrendingUp className="h-6 w-6 text-orange-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600">Active Players</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {filteredLeaderboard.filter(child => child.sessionsPlayed > 0).length}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Game Filter */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Leaderboard</h3>
                    <div className="flex items-center space-x-2">
                        <Filter className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">Filter by game:</span>
                        <select
                            value={selectedGame}
                            onChange={(e) => setSelectedGame(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        >
                            {tournament.selectedGames.map(gameId => {
                                const game = availableGames.find(g => g.id === gameId);
                                return game ? (
                                    <option key={gameId} value={gameId}>
                                        {game.icon} {game.name}
                                    </option>
                                ) : null;
                            })}
                        </select>
                    </div>
                </div>

                {/* Leaderboard Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Rank
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Game
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Sessions
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Best Score
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredLeaderboard.map((child) => (
                                <tr key={`${child.childId}-${child.gameType || 'default'}`} className={`hover:bg-gray-50 transition-colors ${getRankColor(child.rank)}`}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center justify-center">
                                            {getRankIcon(child.rank)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center space-x-3">
                                            <div className="text-2xl">{child.avatar}</div>
                                            <div>
                                                <div className="text-sm font-semibold text-gray-900">{child.name}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center space-x-2">
                                            <span className="text-2xl">{getGameIcon(child.gameType || 'default')}</span>
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">{child.gameDisplayName || child.gameType}</div>
                                                <div className="text-xs text-gray-500">{child.performanceMetric}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm font-medium text-gray-900">{child.sessionsPlayed || 0}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-semibold text-gray-900">{child.bestScore.toFixed(1)}</span>
                                            <span className="text-xs text-gray-500">{getScoreIndicator(child.gameType || 'default')}</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredLeaderboard.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        <Trophy className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                        <p>No participants found for the selected game</p>
                    </div>
                )}
            </div>

            {/* Prizes Section */}
            <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl p-6 border border-yellow-200">
                <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-lg">
                        <Award className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Tournament Prizes</h3>
                </div>
                <p className="text-gray-700">Prizes will be announced soon!</p>
            </div>

            {/* Game Details Modal */}
            {showGameDetails && (
                <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[80vh] overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 px-6 py-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                                        <Gamepad2 className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">
                                            {showGameDetails.child.name}'s Game Performance
                                        </h3>
                                        <p className="text-gray-600 text-sm">Detailed scores and attempts</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowGameDetails(null)}
                                    className="p-2 hover:bg-white hover:bg-opacity-50 rounded-lg transition-colors"
                                >
                                    <span className="text-xl text-gray-400">&times;</span>
                                </button>
                            </div>
                        </div>

                        <div className="p-6 max-h-[60vh] overflow-y-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {Object.entries(showGameDetails.child.gameScores).map(([gameId, scores]) => (
                                    <div key={gameId} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                        <div className="flex items-center space-x-3 mb-3">
                                            <span className="text-2xl">{getGameIcon(gameId)}</span>
                                            <div>
                                                <h4 className="font-semibold text-gray-900">{getGameName(gameId)}</h4>
                                                <p className="text-sm text-gray-500">Score: {scores}</p>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">Score:</span>
                                                <span className="font-medium">{scores}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TournamentDetails;
