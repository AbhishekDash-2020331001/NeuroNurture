import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSchoolAuth } from '@/contexts/school/SchoolAuthContext';
import {
    ArrowLeft,
    Trophy,
    Medal,
    Award,
    Users,
    Calendar,
    Target,
    BarChart3,
    TrendingUp,
    Star,
    Crown,
    Gamepad2,
    Clock,
    CheckCircle,
    Eye,
    Filter
} from 'lucide-react';

interface Child {
    id: string;
    name: string;
    avatar: string;
    grade: string;
    gamesPlayed: number;
    averageScore: number;
    totalScore: number;
    rank: number;
    gameScores: {
        [gameId: string]: {
            score: number;
            attempts: number;
            bestScore: number;
            lastPlayed: string;
        };
    };
}

interface Tournament {
    id: string;
    name: string;
    description: string;
    startDate: string;
    endDate: string;
    status: 'upcoming' | 'active' | 'completed' | 'cancelled';
    games: string[];
    grade: string;
    participants: number;
    prizes: string;
    createdAt: string;
}

interface Game {
    id: string;
    name: string;
    icon: string;
    category: string;
}

// Available games
const availableGames: Game[] = [
    { id: 'gaze-tracking', name: 'Gaze Tracking', icon: '👁️', category: 'Cognitive' },
    { id: 'gesture-control', name: 'Gesture Control', icon: '✋', category: 'Motor Skills' },
    { id: 'mirror-posture', name: 'Mirror Posture', icon: '🧍', category: 'Physical' },
    { id: 'repeat-with-me', name: 'Repeat With Me', icon: '🔄', category: 'Memory' },
    { id: 'dance-doodle', name: 'Dance Doodle', icon: '💃', category: 'Creative' }
];

// Mock tournament data
const mockTournament: Tournament = {
    id: '1',
    name: 'Spring Cognitive Challenge',
    description: 'A comprehensive tournament focusing on cognitive development and memory skills',
    startDate: '2024-03-01',
    endDate: '2024-03-15',
    status: 'active',
    games: ['gaze-tracking', 'repeat-with-me', 'dance-doodle'],
    grade: '3rd Grade',
    participants: 24,
    prizes: '1st Place: $100 Gift Card, 2nd Place: $50 Gift Card, 3rd Place: $25 Gift Card',
    createdAt: '2024-02-15'
};

// Mock leaderboard data with realistic scores
const mockLeaderboard: Child[] = [
    {
        id: '1',
        name: 'Emma Johnson',
        avatar: '👧',
        grade: '3rd Grade',
        gamesPlayed: 3,
        averageScore: 92.5,
        totalScore: 277.5,
        rank: 1,
        gameScores: {
            'gaze-tracking': { score: 95, attempts: 3, bestScore: 95, lastPlayed: '2024-03-10' },
            'repeat-with-me': { score: 90, attempts: 2, bestScore: 90, lastPlayed: '2024-03-12' },
            'dance-doodle': { score: 92.5, attempts: 4, bestScore: 92.5, lastPlayed: '2024-03-14' }
        }
    },
    {
        id: '2',
        name: 'Liam Chen',
        avatar: '👦',
        grade: '3rd Grade',
        gamesPlayed: 3,
        averageScore: 88.3,
        totalScore: 265,
        rank: 2,
        gameScores: {
            'gaze-tracking': { score: 85, attempts: 2, bestScore: 85, lastPlayed: '2024-03-09' },
            'repeat-with-me': { score: 92, attempts: 3, bestScore: 92, lastPlayed: '2024-03-11' },
            'dance-doodle': { score: 88, attempts: 2, bestScore: 88, lastPlayed: '2024-03-13' }
        }
    },
    {
        id: '3',
        name: 'Sophia Rodriguez',
        avatar: '👧',
        grade: '3rd Grade',
        gamesPlayed: 2,
        averageScore: 91.0,
        totalScore: 182,
        rank: 3,
        gameScores: {
            'gaze-tracking': { score: 89, attempts: 2, bestScore: 89, lastPlayed: '2024-03-08' },
            'repeat-with-me': { score: 93, attempts: 1, bestScore: 93, lastPlayed: '2024-03-10' }
        }
    },
    {
        id: '4',
        name: 'Noah Williams',
        avatar: '👦',
        grade: '3rd Grade',
        gamesPlayed: 2,
        averageScore: 91.0,
        totalScore: 182,
        rank: 3,
        gameScores: {
            'gaze-tracking': { score: 88, attempts: 3, bestScore: 88, lastPlayed: '2024-03-09' },
            'dance-doodle': { score: 94, attempts: 2, bestScore: 94, lastPlayed: '2024-03-12' }
        }
    },
    {
        id: '5',
        name: 'Ava Thompson',
        avatar: '👧',
        grade: '3rd Grade',
        gamesPlayed: 1,
        averageScore: 87.0,
        totalScore: 87,
        rank: 5,
        gameScores: {
            'repeat-with-me': { score: 87, attempts: 1, bestScore: 87, lastPlayed: '2024-03-11' }
        }
    },
    {
        id: '6',
        name: 'Mason Davis',
        avatar: '👦',
        grade: '3rd Grade',
        gamesPlayed: 1,
        averageScore: 85.0,
        totalScore: 85,
        rank: 6,
        gameScores: {
            'gaze-tracking': { score: 85, attempts: 1, bestScore: 85, lastPlayed: '2024-03-13' }
        }
    },
    {
        id: '7',
        name: 'Isabella Martinez',
        avatar: '👧',
        grade: '3rd Grade',
        gamesPlayed: 1,
        averageScore: 85.0,
        totalScore: 85,
        rank: 6,
        gameScores: {
            'dance-doodle': { score: 85, attempts: 1, bestScore: 85, lastPlayed: '2024-03-12' }
        }
    }
];

const TournamentDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { school } = useSchoolAuth();
    const [selectedGame, setSelectedGame] = useState<string>('all');
    const [showGameDetails, setShowGameDetails] = useState<{ child: Child; gameId: string } | null>(null);

    // Sort leaderboard based on the specified criteria
    const sortedLeaderboard = useMemo(() => {
        const sorted = [...mockLeaderboard].sort((a, b) => {
            // First priority: Number of games played (descending)
            if (a.gamesPlayed !== b.gamesPlayed) {
                return b.gamesPlayed - a.gamesPlayed;
            }
            
            // Second priority: Average score (descending)
            if (a.averageScore !== b.averageScore) {
                return b.averageScore - a.averageScore;
            }
            
            // If tied, maintain original order (same rank)
            return 0;
        });

        // Calculate ranks with proper tie handling
        return sorted.map((child, index) => {
            let rank = index + 1;
            if (index > 0) {
                const prevChild = sorted[index - 1];
                if (prevChild.gamesPlayed === child.gamesPlayed && 
                    prevChild.averageScore === child.averageScore) {
                    rank = sorted[index - 1].rank || (index);
                }
            }
            return { ...child, rank };
        });
    }, []);

    // Filter leaderboard by selected game
    const filteredLeaderboard = useMemo(() => {
        if (selectedGame === 'all') {
            return sortedLeaderboard;
        }
        return sortedLeaderboard.filter(child => 
            child.gameScores[selectedGame] && child.gameScores[selectedGame].score > 0
        );
    }, [sortedLeaderboard, selectedGame]);

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
                        <h1 className="text-3xl font-bold text-gray-900">Tournament Leaderboard</h1>
                        <p className="text-gray-600 mt-1">Track performance and rankings</p>
                    </div>
                </div>
                <div className="flex items-center space-x-3">
                    <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(mockTournament.status)}`}>
                        <span className="capitalize">{mockTournament.status}</span>
                    </span>
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
                            <h2 className="text-2xl font-bold text-gray-900">{mockTournament.name}</h2>
                            <p className="text-gray-600 mt-1">{mockTournament.description}</p>
                            <div className="flex items-center space-x-6 mt-3">
                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                    <Calendar className="h-4 w-4" />
                                    <span>{formatDate(mockTournament.startDate)} - {formatDate(mockTournament.endDate)}</span>
                                </div>
                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                    <Users className="h-4 w-4" />
                                    <span>{mockTournament.participants} Children</span>
                                </div>
                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                    <Target className="h-4 w-4" />
                                    <span>{mockTournament.grade}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center space-x-3">
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <Users className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Participants</p>
                            <p className="text-2xl font-bold text-gray-900">{mockTournament.participants}</p>
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
                            <p className="text-2xl font-bold text-gray-900">{mockTournament.games.length}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center space-x-3">
                        <div className="p-3 bg-purple-100 rounded-lg">
                            <BarChart3 className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600">Avg. Score</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {Math.round(mockLeaderboard.reduce((sum, child) => sum + child.averageScore, 0) / mockLeaderboard.length)}
                            </p>
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
                                {mockLeaderboard.filter(child => child.gamesPlayed > 0).length}
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
                            <option value="all">All Games</option>
                            {mockTournament.games.map(gameId => {
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
                                    Child
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Games Played
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Average Score
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Total Score
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Performance
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredLeaderboard.map((child) => (
                                <tr key={child.id} className={`hover:bg-gray-50 transition-colors ${getRankColor(child.rank)}`}>
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
                                                <div className="text-sm text-gray-500">{child.grade}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center space-x-2">
                                            <span className="text-sm font-medium text-gray-900">{child.gamesPlayed}</span>
                                            <span className="text-xs text-gray-500">/ {mockTournament.games.length}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center space-x-2">
                                            <span className="text-sm font-semibold text-gray-900">{child.averageScore.toFixed(1)}</span>
                                            <div className="flex">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        className={`h-3 w-3 ${
                                                            i < Math.floor(child.averageScore / 20)
                                                                ? 'text-yellow-400 fill-current'
                                                                : 'text-gray-300'
                                                        }`}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm font-medium text-gray-900">{child.totalScore.toFixed(1)}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center space-x-2">
                                            <div className="w-16 bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-300"
                                                    style={{ width: `${(child.averageScore / 100) * 100}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-xs text-gray-500">
                                                {Math.round((child.averageScore / 100) * 100)}%
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <button
                                            onClick={() => setShowGameDetails({ child, gameId: 'all' })}
                                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="View Game Details"
                                        >
                                            <Eye className="h-4 w-4" />
                                        </button>
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
                <p className="text-gray-700">{mockTournament.prizes}</p>
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
                                                <p className="text-sm text-gray-500">Best Score: {scores.bestScore}</p>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">Average Score:</span>
                                                <span className="font-medium">{scores.score}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">Attempts:</span>
                                                <span className="font-medium">{scores.attempts}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">Last Played:</span>
                                                <span className="font-medium">{formatDate(scores.lastPlayed)}</span>
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
