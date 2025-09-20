import { useSchoolAuth } from '@/features/school/contexts/SchoolAuthContext';
import { TournamentResponse, tournamentService } from '@/shared/services/tournament/tournamentService';
import {
    Calendar,
    CheckCircle,
    Clock,
    Edit,
    Eye,
    Loader2,
    Pause,
    Plus,
    Search,
    Trash2,
    Trophy,
    Users
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Tournament {
    id: string;
    name: string;
    description: string;
    status: string;
    startDate: string;
    endDate: string;
    games: string[];
    participants: number;
}

// Game mapping matching backend bit-mapping system
const availableGames = [
    { id: 'Dance Doodle', name: 'Dance Doodle', description: 'Create art through movement', icon: '💃', category: 'Creative' },
    { id: 'Gaze Game', name: 'Gaze Game', description: 'Follow moving objects with your eyes', icon: '👁️', category: 'Cognitive' },
    { id: 'Gesture Game', name: 'Gesture Game', description: 'Control games with hand movements', icon: '✋', category: 'Motor Skills' },
    { id: 'Mirror Posture Game', name: 'Mirror Posture Game', description: 'Copy and maintain correct posture', icon: '🧍', category: 'Physical' },
    { id: 'Repeat With Me Game', name: 'Repeat With Me Game', description: 'Follow audio and visual patterns', icon: '🔄', category: 'Memory' }
];

const availableGrades = ['Gentle Bloom', 'Rising Star', 'Bright Light'];

const Tournaments: React.FC = () => {
    const { school } = useSchoolAuth();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showCreateModal, setShowCreateModal] = useState(false);
    
    // Real data state
    const [tournaments, setTournaments] = useState<TournamentResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [deletingTournamentId, setDeletingTournamentId] = useState<number | null>(null);
    
    // Tournament creation form state
    const [tournamentForm, setTournamentForm] = useState({
        name: '',
        description: '',
        grade: '',
        games: [] as string[],
        startDate: '',
        endDate: '',
        prizes: ''
    });
    
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    // Fetch data on component mount
    useEffect(() => {
        const fetchData = async () => {
            if (!school?.id) return;
            
            setIsLoading(true);
            try {
                console.log('Fetching tournaments for school ID:', school.id);
                
                const tournamentsData = await tournamentService.getTournamentsBySchool(parseInt(school.id));
                console.log('Tournaments data:', tournamentsData);
                
                setTournaments(tournamentsData);
            } catch (error) {
                console.error('Error fetching tournaments:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [school?.id]);

    const filteredTournaments = tournaments.filter(tournament => {
        const matchesSearch = tournament.tournamentTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             tournament.tournamentDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             tournament.tournamentId.toString().includes(searchTerm);
        
        let matchesStatus = true;
        const tournamentStatus = tournamentService.getTournamentStatus(tournament.startTime, tournament.endTime, tournament.status);
        if (statusFilter === 'active') {
            matchesStatus = tournamentStatus === 'ACTIVE';
        } else if (statusFilter === 'ended') {
            matchesStatus = tournamentStatus === 'COMPLETED' || tournamentStatus === 'OVERDUE';
        }
        
        return matchesSearch && matchesStatus;
    }).sort((a, b) => {
        // Sort by status priority: Active -> Upcoming -> Ended (Completed/Overdue)
        const statusA = tournamentService.getTournamentStatus(a.startTime, a.endTime, a.status);
        const statusB = tournamentService.getTournamentStatus(b.startTime, b.endTime, b.status);
        
        const statusPriority = {
            'ACTIVE': 1,
            'UPCOMING': 2,
            'COMPLETED': 3,
            'OVERDUE': 3
        };
        
        const priorityA = statusPriority[statusA as keyof typeof statusPriority] || 4;
        const priorityB = statusPriority[statusB as keyof typeof statusPriority] || 4;
        
        if (priorityA !== priorityB) {
            return priorityA - priorityB;
        }
        
        // If same priority, sort by start date (newest first)
        return new Date(b.startTime).getTime() - new Date(a.startTime).getTime();
    });

    const getTournamentStatus = (startTime: string, endTime: string, status: string) => {
        return tournamentService.getTournamentStatus(startTime, endTime, status);
    };

    const getStatusColor = (status: string) => {
        return status === 'ACTIVE' 
            ? 'text-green-600 bg-green-100' 
            : status === 'UPCOMING'
            ? 'text-blue-600 bg-blue-100'
            : 'text-gray-600 bg-gray-100';
    };

    const getStatusIcon = (status: string) => {
        return status === 'ACTIVE' 
            ? <Clock className="h-4 w-4" />
            : status === 'UPCOMING'
            ? <Pause className="h-4 w-4" />
            : <CheckCircle className="h-4 w-4" />;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Form handling functions
    const handleInputChange = (field: string, value: any) => {
        setTournamentForm(prev => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (formErrors[field]) {
            setFormErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const validateForm = () => {
        const errors: Record<string, string> = {};
        
        if (!tournamentForm.name.trim()) errors.name = 'Tournament name is required';
        if (!tournamentForm.description.trim()) errors.description = 'Tournament description is required';
        if (tournamentForm.games.length === 0) errors.games = 'Please select at least one game';
        if (!tournamentForm.startDate) errors.startDate = 'Start date is required';
        if (!tournamentForm.endDate) errors.endDate = 'End date is required';
        if (!tournamentForm.grade) errors.grade = 'Grade level is required';
        
        // Validate that end date is after start date
        if (tournamentForm.startDate && tournamentForm.endDate && tournamentForm.startDate >= tournamentForm.endDate) {
            errors.endDate = 'End date must be after start date';
        }
        
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm() || !school?.id) return;
        
        setIsCreating(true);
        try {
            // Create tournament request
            const tournamentRequest = {
                tournamentTitle: tournamentForm.name,
                tournamentDescription: tournamentForm.description,
                startTime: new Date(tournamentForm.startDate).toISOString(),
                endTime: new Date(tournamentForm.endDate).toISOString(),
                gradeLevel: tournamentForm.grade,
                selectedGames: tournamentForm.games
            };
            
            // Create tournaments via API
            const createdTournaments = await tournamentService.createTournaments(tournamentRequest, parseInt(school.id));
            
            // Update local state
            setTournaments(prev => [...prev, ...createdTournaments]);
            
            // Close modal and reset form
            setShowCreateModal(false);
            resetForm();
            setFormErrors({});
            
        } catch (error) {
            console.error('Error creating tournament:', error);
            alert('Failed to create tournament. Please try again.');
        } finally {
            setIsCreating(false);
        }
    };

    const resetForm = () => {
        setTournamentForm({
            name: '',
            description: '',
            grade: '',
            games: [],
            startDate: '',
            endDate: '',
            prizes: ''
        });
    };

    const handleDeleteTournament = async (tournamentId: number) => {
        if (!confirm('Are you sure you want to delete this tournament? This will remove all tournament assignments for this tournament ID.')) {
            return;
        }
        
        setDeletingTournamentId(tournamentId);
        try {
            await tournamentService.deleteTournament(tournamentId);
            setTournaments(prev => prev.filter(t => t.tournamentId !== tournamentId));
        } catch (error) {
            console.error('Error deleting tournament:', error);
            alert('Failed to delete tournament. Please try again.');
        } finally {
            setDeletingTournamentId(null);
        }
    };

    const toggleGameSelection = (gameName: string) => {
        setTournamentForm(prev => ({
            ...prev,
            games: prev.games.includes(gameName)
                ? prev.games.filter(name => name !== gameName)
                : [...prev.games, gameName]
        }));
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="space-y-6 p-4">
                {/* Professional Header */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">Tournament Management</h1>
                            <p className="text-gray-600 text-sm mt-1">
                                Create, assign, and track tournaments for {school?.currentChildren || 0} children
                            </p>
                        </div>
                        <div className="mt-4 sm:mt-0">
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="inline-flex items-center px-4 py-2 bg-gray-800 text-white text-sm font-medium rounded-lg hover:bg-gray-900 transition-all duration-200"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Create New Tournament
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stats Cards and Search */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="flex flex-col lg:flex-row gap-4 items-center">
                        {/* Stats Cards */}
                        <div className="flex gap-4">
                            <div className="bg-green-100 border border-green-200 rounded-lg p-3 min-w-[140px]">
                                <div className="flex items-center">
                                    <div className="p-1.5 bg-green-200 rounded">
                                        <Clock className="h-4 w-4 text-green-700" />
                                    </div>
                                    <div className="ml-2">
                                        <p className="text-xs font-semibold text-green-700">Active</p>
                                        <p className="text-lg font-bold text-green-800">
                                            {tournaments.filter(t => getTournamentStatus(t.startTime, t.endTime, t.status) === 'ACTIVE').length}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-blue-100 border border-blue-200 rounded-lg p-3 min-w-[140px]">
                                <div className="flex items-center">
                                    <div className="p-1.5 bg-blue-200 rounded">
                                        <Calendar className="h-4 w-4 text-blue-700" />
                                    </div>
                                    <div className="ml-2">
                                        <p className="text-xs font-semibold text-blue-700">Upcoming</p>
                                        <p className="text-lg font-bold text-blue-800">
                                            {tournaments.filter(t => getTournamentStatus(t.startTime, t.endTime, t.status) === 'UPCOMING').length}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-gray-100 border border-gray-200 rounded-lg p-3 min-w-[140px]">
                                <div className="flex items-center">
                                    <div className="p-1.5 bg-gray-200 rounded">
                                        <CheckCircle className="h-4 w-4 text-gray-700" />
                                    </div>
                                    <div className="ml-2">
                                        <p className="text-xs font-semibold text-gray-700">Ended</p>
                                        <p className="text-lg font-bold text-gray-800">
                                            {tournaments.filter(t => {
                                                const status = getTournamentStatus(t.startTime, t.endTime, t.status);
                                                return status === 'COMPLETED' || status === 'OVERDUE';
                                            }).length}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Search and Filter */}
                        <div className="flex-1 flex gap-3">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search by tournament title or ID..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            </div>
                            
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="all">All Tournaments</option>
                                <option value="active">Active Tournaments</option>
                                <option value="ended">Ended Tournaments</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Tournaments List */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="bg-white border-b border-gray-200 px-4 py-3">
                        <h2 className="text-lg font-bold text-gray-900">
                            Tournaments ({filteredTournaments.length})
                        </h2>
                    </div>
                
                    <div className="divide-y divide-gray-100 space-y-2">
                        {isLoading ? (
                            <div className="p-6 text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                                <p className="text-gray-500">Loading tournaments...</p>
                            </div>
                        ) : filteredTournaments.length === 0 ? (
                            <div className="p-6 text-center">
                                <div className="mx-auto w-16 h-16 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-3">
                                    <Trophy className="h-8 w-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-1">No tournaments found</h3>
                                <p className="text-gray-500 text-sm">Create your first tournament to get started</p>
                            </div>
                        ) : (
                            filteredTournaments.map((tournament, index) => {
                                const tournamentStatus = getTournamentStatus(tournament.startTime, tournament.endTime, tournament.status);
                                return (
                                    <div key={tournament.tournamentId} className={`p-4 hover:bg-gray-50 transition-all duration-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-3 mb-2">
                                                    <h3 className="text-lg font-bold text-gray-900">{tournament.tournamentTitle}</h3>
                                                    <div className={`px-3 py-1 rounded text-xs font-bold ${getStatusColor(tournamentStatus)}`}>
                                                        <div className="flex items-center space-x-1">
                                                            {getStatusIcon(tournamentStatus)}
                                                            <span>{tournamentStatus === 'OVERDUE' ? 'Ended' : tournamentStatus.charAt(0).toUpperCase() + tournamentStatus.slice(1)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            
                                                <p className="text-sm text-gray-600 mb-3">{tournament.tournamentDescription}</p>
                                            
                                                {/* Games List */}
                                                <div className="mt-3">
                                                    <p className="text-sm font-bold text-gray-700 mb-2">Games in this tournament:</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {tournament.selectedGames.map((gameName) => {
                                                            const game = availableGames.find(g => g.name === gameName);
                                                            return (
                                                                <div key={gameName} className="flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded border border-gray-200">
                                                                    <span className="text-lg">{game?.icon || '🎮'}</span>
                                                                    <span className="text-sm font-bold text-gray-900">{gameName}</span>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                               
                                                <div className="flex items-center space-x-6 text-sm text-gray-600 mt-3">
                                                    <span className="flex items-center px-3 py-1 bg-gray-100 rounded border border-gray-200">
                                                        <Calendar className="h-4 w-4 mr-2 text-gray-600" />
                                                        <span className="font-medium">Period: {formatDate(tournament.startTime)} - {formatDate(tournament.endTime)}</span>
                                                    </span>
                                                    <span className="flex items-center px-3 py-1 bg-gray-100 rounded border border-gray-200">
                                                        <Users className="h-4 w-4 mr-2 text-gray-600" />
                                                        <span className="font-medium">
                                                            {tournament.totalAssigned || 0} students assigned
                                                        </span>
                                                    </span>
                                                    <span className="flex items-center px-3 py-1 bg-gray-100 rounded border border-gray-200">
                                                        <span className="font-medium">
                                                            Grade: {tournament.gradeLevel}
                                                        </span>
                                                    </span>
                                                </div>
                                            </div>
                                            
                                            <div className="flex space-x-3 ml-4">
                                                <button 
                                                    onClick={() => navigate(`/school/tournaments/${tournament.tournamentId}`)}
                                                    className="px-4 py-2 bg-gray-800 text-white text-sm font-medium rounded hover:bg-gray-900 transition-all duration-200 flex items-center space-x-2" 
                                                    title="View Details"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                    <span>View</span>
                                                </button>
                                                <button 
                                                    onClick={() => handleDeleteTournament(tournament.tournamentId)}
                                                    disabled={deletingTournamentId === tournament.tournamentId}
                                                    className={`px-4 py-2 text-white text-sm font-medium rounded transition-all duration-200 flex items-center space-x-2 ${
                                                        deletingTournamentId === tournament.tournamentId 
                                                            ? 'bg-gray-400 cursor-not-allowed' 
                                                            : 'bg-red-600 hover:bg-red-700'
                                                    }`}
                                                    title={deletingTournamentId === tournament.tournamentId ? "Deleting tournament..." : "Delete Tournament"}
                                                >
                                                    {deletingTournamentId === tournament.tournamentId ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <Trash2 className="h-4 w-4" />
                                                    )}
                                                    <span>{deletingTournamentId === tournament.tournamentId ? 'Deleting...' : 'Delete'}</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
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
                                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                        <div className="p-2 bg-blue-100 rounded-lg mr-3">
                                            <Edit className="h-4 w-4 text-blue-600" />
                                        </div>
                                        Basic Information
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Tournament Title
                                            </label>
                                            <input
                                                type="text"
                                                value={tournamentForm.name}
                                                onChange={(e) => handleInputChange('name', e.target.value)}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                                placeholder="Enter tournament title"
                                            />
                                            {formErrors.name && <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Grade Level
                                            </label>
                                            <select
                                                value={tournamentForm.grade}
                                                onChange={(e) => handleInputChange('grade', e.target.value)}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                            >
                                                <option value="">Select Grade</option>
                                                {availableGrades.map(grade => (
                                                    <option key={grade} value={grade}>{grade}</option>
                                                ))}
                                            </select>
                                            {formErrors.grade && <p className="text-red-500 text-sm mt-1">{formErrors.grade}</p>}
                                        </div>
                                    </div>
                                    <div className="mt-6">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Description
                                        </label>
                                        <textarea
                                            value={tournamentForm.description}
                                            onChange={(e) => handleInputChange('description', e.target.value)}
                                            rows={3}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                            placeholder="Enter tournament description"
                                        />
                                        {formErrors.description && <p className="text-red-500 text-sm mt-1">{formErrors.description}</p>}
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
                                                onChange={(e) => handleInputChange('startDate', e.target.value)}
                                                min={new Date().toISOString().split('T')[0]}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                            {formErrors.startDate && <p className="text-red-500 text-sm mt-1">{formErrors.startDate}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                End Date *
                                            </label>
                                            <input
                                                type="date"
                                                value={tournamentForm.endDate}
                                                onChange={(e) => handleInputChange('endDate', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                min={tournamentForm.startDate || new Date().toISOString().split('T')[0]}
                                            />
                                            {formErrors.endDate && <p className="text-red-500 text-sm mt-1">{formErrors.endDate}</p>}
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
                                                onClick={() => toggleGameSelection(game.name)}
                                                className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${tournamentForm.games.includes(game.name)
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
                                    {formErrors.games && <p className="text-red-500 text-sm mt-2">{formErrors.games}</p>}
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
                                            onChange={(e) => handleInputChange('prizes', e.target.value)}
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
                                    onClick={handleSubmit}
                                    disabled={isCreating}
                                    className="px-8 py-3 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isCreating ? 'Creating...' : 'Create Tournament'}
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