import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSchoolAuth } from '@/contexts/school/SchoolAuthContext';
import {
    Plus,
    Search,
    Trophy,
    Users,
    Calendar,
    Clock,
    Edit,
    Trash2,
    Eye,
    Target,
    BarChart3,
    Play,
    Pause,
    CheckCircle
} from 'lucide-react';

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

// Available games for tournaments
const availableGames: Game[] = [
    { id: 'gaze-tracking', name: 'Gaze Tracking', icon: '👁️', category: 'Cognitive' },
    { id: 'gesture-control', name: 'Gesture Control', icon: '✋', category: 'Motor Skills' },
    { id: 'mirror-posture', name: 'Mirror Posture', icon: '🧍', category: 'Physical' },
    { id: 'repeat-with-me', name: 'Repeat With Me', icon: '🔄', category: 'Memory' },
    { id: 'dance-doodle', name: 'Dance Doodle', icon: '💃', category: 'Creative' }
];

// Available grades
const availableGrades = [
    'Pre-K', 'Kindergarten', '1st Grade', '2nd Grade', '3rd Grade', 
    '4th Grade', '5th Grade', '6th Grade', '7th Grade', '8th Grade'
];

// Mock tournaments data
const mockTournaments: Tournament[] = [
    {
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
    },
    {
        id: '2',
        name: 'Motor Skills Championship',
        description: 'Tournament focused on physical coordination and motor skill development',
        startDate: '2024-03-20',
        endDate: '2024-04-05',
        status: 'upcoming',
        games: ['gesture-control', 'mirror-posture'],
        grade: '2nd Grade',
        participants: 18,
        prizes: '1st Place: $75 Gift Card, 2nd Place: $40 Gift Card, 3rd Place: $20 Gift Card',
        createdAt: '2024-02-20'
    },
    {
        id: '3',
        name: 'Memory Masters',
        description: 'Challenge your memory and pattern recognition skills',
        startDate: '2024-02-01',
        endDate: '2024-02-14',
        status: 'completed',
        games: ['repeat-with-me', 'gaze-tracking'],
        grade: '4th Grade',
        participants: 22,
        prizes: '1st Place: $80 Gift Card, 2nd Place: $45 Gift Card, 3rd Place: $25 Gift Card',
        createdAt: '2024-01-15'
    }
];

const Tournaments: React.FC = () => {
    const { school } = useSchoolAuth();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [gradeFilter, setGradeFilter] = useState<string>('all');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // Tournament form state
    const [tournamentForm, setTournamentForm] = useState({
        name: '',
        description: '',
        startDate: '',
        endDate: '',
        games: [] as string[],
        grade: '',
        prizes: ''
    });

    // Filter tournaments based on search, status, and grade
    const filteredTournaments = useMemo(() => {
        return mockTournaments.filter(tournament => {
            const matchesSearch = tournament.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                tournament.description.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'all' || tournament.status === statusFilter;
            const matchesGrade = gradeFilter === 'all' || tournament.grade === gradeFilter;
            return matchesSearch && matchesStatus && matchesGrade;
        });
    }, [searchTerm, statusFilter, gradeFilter]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'upcoming': return 'text-blue-600 bg-blue-100';
            case 'active': return 'text-green-600 bg-green-100';
            case 'completed': return 'text-gray-600 bg-gray-100';
            case 'cancelled': return 'text-red-600 bg-red-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'upcoming': return <Clock className="h-4 w-4" />;
            case 'active': return <Play className="h-4 w-4" />;
            case 'completed': return <CheckCircle className="h-4 w-4" />;
            case 'cancelled': return <Pause className="h-4 w-4" />;
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

    const handleCreateTournament = () => {
        // In real app, this would make an API call
        console.log('Creating tournament:', tournamentForm);
        setShowCreateModal(false);
        // Reset form
        setTournamentForm({
            name: '',
            description: '',
            startDate: '',
            endDate: '',
            games: [],
            grade: '',
            prizes: ''
        });
    };

    const handleEditTournament = () => {
        // In real app, this would make an API call
        console.log('Editing tournament:', selectedTournament?.id, tournamentForm);
        setShowEditModal(false);
        setSelectedTournament(null);
    };

    const handleDeleteTournament = () => {
        // In real app, this would make an API call
        console.log('Deleting tournament:', selectedTournament?.id);
        setShowDeleteModal(false);
        setSelectedTournament(null);
    };

    const openEditModal = (tournament: Tournament) => {
        setSelectedTournament(tournament);
        setTournamentForm({
            name: tournament.name,
            description: tournament.description,
            startDate: tournament.startDate,
            endDate: tournament.endDate,
            games: tournament.games,
            grade: tournament.grade,
            prizes: tournament.prizes
        });
        setShowEditModal(true);
    };

    const openDeleteModal = (tournament: Tournament) => {
        setSelectedTournament(tournament);
        setShowDeleteModal(true);
    };

    const toggleGameSelection = (gameId: string) => {
        setTournamentForm(prev => ({
            ...prev,
            games: prev.games.includes(gameId)
                ? prev.games.filter(id => id !== gameId)
                : [...prev.games, gameId]
        }));
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Tournament Management</h1>
                    <p className="text-gray-600">Create and manage competitive tournaments for children</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus className="h-5 w-5" />
                    <span>Create Tournament</span>
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center space-x-3">
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <Trophy className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Tournaments</p>
                            <p className="text-2xl font-bold text-gray-900">{mockTournaments.length}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center space-x-3">
                        <div className="p-3 bg-green-100 rounded-lg">
                            <Play className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600">Active</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {mockTournaments.filter(t => t.status === 'active').length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center space-x-3">
                        <div className="p-3 bg-purple-100 rounded-lg">
                            <Users className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Participants</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {mockTournaments.reduce((sum, t) => sum + t.participants, 0)}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center space-x-3">
                        <div className="p-3 bg-orange-100 rounded-lg">
                            <Calendar className="h-6 w-6 text-orange-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600">Upcoming</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {mockTournaments.filter(t => t.status === 'upcoming').length}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search tournaments..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="all">All Status</option>
                            <option value="upcoming">Upcoming</option>
                            <option value="active">Active</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                        <select
                            value={gradeFilter}
                            onChange={(e) => setGradeFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="all">All Grades</option>
                            {availableGrades.map(grade => (
                                <option key={grade} value={grade}>{grade}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Tournaments List */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3">
                                    Tournament
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">
                                    Grade
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">
                                    Games
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                                    Participants
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-36">
                                    Duration
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredTournaments.map((tournament) => (
                                <tr key={tournament.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="space-y-2">
                                            <div className="text-sm font-medium text-gray-900">{tournament.name}</div>
                                            <div className="text-sm text-gray-500">{tournament.description}</div>
                                            <div className="text-xs text-green-600 font-medium">
                                                <span className="inline-flex items-center">
                                                    <Trophy className="h-3 w-3 mr-1" />
                                                    {tournament.prizes}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg mr-3">
                                                <span className="text-white text-xs font-bold">
                                                    {tournament.grade.split(' ')[0].charAt(0)}
                                                </span>
                                            </div>
                                            <div>
                                                <div className="text-sm font-semibold text-gray-900">
                                                    {tournament.grade}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    Level
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-1">
                                            {tournament.games.map((gameId) => {
                                                const game = availableGames.find(g => g.id === gameId);
                                                return game ? (
                                                    <div key={gameId} className="flex items-center text-xs font-medium bg-gray-100 text-gray-800 rounded-full px-2 py-1 whitespace-nowrap">
                                                        <span className="mr-1">{game.icon}</span>
                                                        <span>{game.name}</span>
                                                    </div>
                                                ) : null;
                                            })}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg mr-3">
                                                <Users className="h-4 w-4 text-white" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-semibold text-gray-900">
                                                    {tournament.participants}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    Children
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900">
                                        <div className="space-y-1">
                                            <div className="flex items-center text-xs text-gray-600">
                                                <Calendar className="h-3 w-3 mr-1" />
                                                <span className="font-medium">Start:</span>
                                            </div>
                                            <div className="text-xs text-gray-900 font-medium ml-4">
                                                {formatDate(tournament.startDate)}
                                            </div>
                                            <div className="flex items-center text-xs text-gray-600">
                                                <Calendar className="h-3 w-3 mr-1" />
                                                <span className="font-medium">End:</span>
                                            </div>
                                            <div className="text-xs text-gray-900 font-medium ml-4">
                                                {formatDate(tournament.endDate)}
                                            </div>
                                        </div>
                                    </td>

                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(tournament.status)}`}>
                                            {getStatusIcon(tournament.status)}
                                            <span className="ml-1">{tournament.status.charAt(0).toUpperCase() + tournament.status.slice(1)}</span>
                                        </span>
                                    </td>

                                    <td className="px-6 py-4">
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => navigate(`/school/tournaments/${tournament.id}`)}
                                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="View Leaderboard"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => openEditModal(tournament)}
                                                className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                title="Edit Tournament"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => openDeleteModal(tournament)}
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Delete Tournament"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredTournaments.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        <Trophy className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                        <p>No tournaments found matching your criteria</p>
                    </div>
                )}
            </div>

            {/* Create Tournament Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden border border-gray-100">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 px-8 py-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
                                        <Trophy className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-gray-900">Create New Tournament</h3>
                                        <p className="text-gray-600 text-sm mt-1">Set up a competitive tournament for children</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowCreateModal(false)}
                                    className="p-3 hover:bg-white hover:bg-opacity-50 rounded-xl transition-all duration-200 group"
                                >
                                    <span className="sr-only">Close</span>
                                    <span className="text-2xl text-gray-400 group-hover:text-gray-600 transition-colors">&times;</span>
                                </button>
                            </div>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
                            <div className="space-y-6">
                                {/* Basic Information */}
                                <div>
                                    <h4 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Tournament Name *
                                            </label>
                                            <input
                                                type="text"
                                                value={tournamentForm.name}
                                                onChange={(e) => setTournamentForm(prev => ({ ...prev, name: e.target.value }))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="Enter tournament name"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Grade *
                                            </label>
                                            <select
                                                value={tournamentForm.grade}
                                                onChange={(e) => setTournamentForm(prev => ({ ...prev, grade: e.target.value }))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            >
                                                <option value="">Select Grade</option>
                                                {availableGrades.map(grade => (
                                                    <option key={grade} value={grade}>{grade}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="mt-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Description *
                                        </label>
                                        <textarea
                                            value={tournamentForm.description}
                                            onChange={(e) => setTournamentForm(prev => ({ ...prev, description: e.target.value }))}
                                            rows={3}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="Describe the tournament purpose and goals"
                                        />
                                    </div>
                                </div>

                                {/* Tournament Timeline */}
                                <div>
                                    <h4 className="text-lg font-medium text-gray-900 mb-4">Tournament Timeline</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Start Date *
                                            </label>
                                            <input
                                                type="date"
                                                value={tournamentForm.startDate}
                                                onChange={(e) => setTournamentForm(prev => ({ ...prev, startDate: e.target.value }))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                End Date *
                                            </label>
                                            <input
                                                type="date"
                                                value={tournamentForm.endDate}
                                                onChange={(e) => setTournamentForm(prev => ({ ...prev, endDate: e.target.value }))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                min={tournamentForm.startDate}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Game Selection */}
                                <div>
                                    <h4 className="text-lg font-medium text-gray-900 mb-4">Select Games</h4>
                                    <p className="text-sm text-gray-600 mb-4">Choose which games will be included in this tournament</p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {availableGames.map((game) => (
                                            <div
                                                key={game.id}
                                                onClick={() => toggleGameSelection(game.id)}
                                                className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${tournamentForm.games.includes(game.id)
                                                        ? 'border-blue-500 bg-blue-50'
                                                        : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                            >
                                                <div className="flex items-center space-x-3">
                                                    <span className="text-2xl">{game.icon}</span>
                                                    <div>
                                                        <h5 className="font-medium text-gray-900">{game.name}</h5>
                                                        <p className="text-xs text-gray-500">{game.category}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Prizes */}
                                <div>
                                    <h4 className="text-lg font-medium text-gray-900 mb-4">Prizes</h4>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Prizes
                                        </label>
                                        <textarea
                                            value={tournamentForm.prizes}
                                            onChange={(e) => setTournamentForm(prev => ({ ...prev, prizes: e.target.value }))}
                                            rows={2}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="Describe the prizes for winners"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="bg-white border-t border-gray-200 px-8 py-6 flex-shrink-0">
                            <div className="flex justify-end space-x-4">
                                <button
                                    onClick={() => setShowCreateModal(false)}
                                    className="px-6 py-3 text-sm font-semibold text-gray-700 bg-gray-100 border border-gray-200 rounded-xl hover:bg-gray-200 transition-all duration-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCreateTournament}
                                    className="px-8 py-3 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                                >
                                    Create Tournament
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Tournament Modal */}
            {showEditModal && selectedTournament && (
                <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden border border-gray-100 flex flex-col">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-200 px-8 py-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl">
                                        <Edit className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-gray-900">Edit Tournament</h3>
                                        <p className="text-gray-600 text-sm mt-1">Update tournament details and settings</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowEditModal(false)}
                                    className="p-3 hover:bg-white hover:bg-opacity-50 rounded-xl transition-all duration-200 group"
                                >
                                    <span className="sr-only">Close</span>
                                    <span className="text-2xl text-gray-400 group-hover:text-gray-600 transition-colors">&times;</span>
                                </button>
                            </div>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
                            <div className="space-y-6">
                                {/* Basic Information */}
                                <div>
                                    <h4 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Tournament Name *
                                            </label>
                                            <input
                                                type="text"
                                                value={tournamentForm.name}
                                                onChange={(e) => setTournamentForm(prev => ({ ...prev, name: e.target.value }))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="Enter tournament name"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Grade *
                                            </label>
                                            <select
                                                value={tournamentForm.grade}
                                                onChange={(e) => setTournamentForm(prev => ({ ...prev, grade: e.target.value }))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            >
                                                <option value="">Select Grade</option>
                                                {availableGrades.map(grade => (
                                                    <option key={grade} value={grade}>{grade}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="mt-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Description *
                                        </label>
                                        <textarea
                                            value={tournamentForm.description}
                                            onChange={(e) => setTournamentForm(prev => ({ ...prev, description: e.target.value }))}
                                            rows={3}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="Describe the tournament purpose and goals"
                                        />
                                    </div>
                                </div>

                                {/* Tournament Timeline */}
                                <div>
                                    <h4 className="text-lg font-medium text-gray-900 mb-4">Tournament Timeline</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Start Date *
                                            </label>
                                            <input
                                                type="date"
                                                value={tournamentForm.startDate}
                                                onChange={(e) => setTournamentForm(prev => ({ ...prev, startDate: e.target.value }))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                End Date *
                                            </label>
                                            <input
                                                type="date"
                                                value={tournamentForm.endDate}
                                                onChange={(e) => setTournamentForm(prev => ({ ...prev, endDate: e.target.value }))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                min={tournamentForm.startDate}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Game Selection */}
                                <div>
                                    <h4 className="text-lg font-medium text-gray-900 mb-4">Select Games</h4>
                                    <p className="text-sm text-gray-600 mb-4">Choose which games will be included in this tournament</p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {availableGames.map((game) => (
                                            <div
                                                key={game.id}
                                                onClick={() => toggleGameSelection(game.id)}
                                                className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${tournamentForm.games.includes(game.id)
                                                        ? 'border-blue-500 bg-blue-50'
                                                        : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                            >
                                                <div className="flex items-center space-x-3">
                                                    <span className="text-2xl">{game.icon}</span>
                                                    <div>
                                                        <h5 className="font-medium text-gray-900">{game.name}</h5>
                                                        <p className="text-xs text-gray-500">{game.category}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Prizes */}
                                <div>
                                    <h4 className="text-lg font-medium text-gray-900 mb-4">Prizes</h4>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Prizes
                                        </label>
                                        <textarea
                                            value={tournamentForm.prizes}
                                            onChange={(e) => setTournamentForm(prev => ({ ...prev, prizes: e.target.value }))}
                                            rows={2}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="Describe the prizes for winners"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="bg-white border-t border-gray-200 px-8 py-6 flex-shrink-0">
                            <div className="flex justify-end space-x-4">
                                <button
                                    onClick={() => setShowEditModal(false)}
                                    className="px-6 py-3 text-sm font-semibold text-gray-700 bg-gray-100 border border-gray-200 rounded-xl hover:bg-gray-200 transition-all duration-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleEditTournament}
                                    className="px-8 py-3 text-sm font-semibold text-white bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                                >
                                    Update Tournament
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && selectedTournament && (
                <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md border border-gray-100">
                        <div className="p-8">
                            <div className="flex items-center space-x-4 mb-6">
                                <div className="p-4 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl">
                                    <Trash2 className="h-8 w-8 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900">Delete Tournament</h3>
                                    <p className="text-gray-500 text-sm mt-1">This action cannot be undone</p>
                                </div>
                            </div>

                            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                                <p className="text-gray-700 font-medium">
                                    Are you sure you want to delete <span className="text-red-600 font-semibold">"{selectedTournament.name}"</span>?
                                </p>
                                <p className="text-gray-600 text-sm mt-2">
                                    All tournament data, leaderboards, and participant records will be permanently removed.
                                </p>
                            </div>

                            <div className="flex justify-end space-x-4">
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="px-6 py-3 text-sm font-semibold text-gray-700 bg-gray-100 border border-gray-200 rounded-xl hover:bg-gray-200 transition-all duration-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteTournament}
                                    className="px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-red-600 to-red-700 rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-lg hover:shadow-xl"
                                >
                                    Delete Tournament
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Tournaments;

