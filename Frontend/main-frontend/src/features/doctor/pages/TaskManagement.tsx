import { mockGames, mockPatients, mockTasks, type Patient, type TherapeuticTask } from '@/data/doctorMockData';
import { useDoctorAuth } from '@/features/doctor/contexts/DoctorAuthContext';
import {
    Activity,
    BookOpen,
    Brain,
    CheckCircle,
    ChevronDown,
    Edit3,
    Eye,
    Hand,
    Play,
    Plus,
    Repeat,
    Search,
    User,
    Users,
    X
} from 'lucide-react';
import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

const TaskManagement: React.FC = () => {
  const { doctor } = useDoctorAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const patientIdFromUrl = searchParams.get('patient');
  
  // Get patient info if specified in URL
  const selectedPatient = patientIdFromUrl 
    ? mockPatients.find(p => p.id === patientIdFromUrl) || null
    : null;
    
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [gameFilter, setGameFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<(TherapeuticTask & {
    selectedPatient?: Patient;
    selectedGame?: any;
    gameSessions?: any[];
  }) | null>(null);
  const [expandedPatients, setExpandedPatients] = useState<Set<string>>(new Set());
  const [showEditNotesModal, setShowEditNotesModal] = useState(false);
  const [editingTask, setEditingTask] = useState<TherapeuticTask | null>(null);
  const [editedNotes, setEditedNotes] = useState('');

  const filteredTasks = mockTasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.therapyGoal.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.createdBy.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    const matchesGame = gameFilter === 'all' || task.games.some(game => game.gameId === gameFilter);
    
    // If a specific patient is selected, only show tasks assigned to that patient
    const matchesPatient = selectedPatient ? task.assignedTo.includes(selectedPatient.id) : true;
    
    return matchesSearch && matchesStatus && matchesPriority && matchesGame && matchesPatient;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'active': return 'text-blue-600 bg-blue-100';
      case 'expired': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTaskProgress = (task: TherapeuticTask) => {
    const totalGames = task.games.length;
    const completedGames = task.games.filter(game => game.isCompleted).length;
    return totalGames > 0 ? Math.round((completedGames / totalGames) * 100) : 0;
  };

  const getGameIcon = (gameId: string) => {
    const game = mockGames.find(g => g.id === gameId);
    switch (gameId) {
      case 'gesture': return <Hand className="h-4 w-4" />;
      case 'gaze-tracking': return <Eye className="h-4 w-4" />;
      case 'repeat-with-me': return <Repeat className="h-4 w-4" />;
      case 'mirror-posture': return <Activity className="h-4 w-4" />;
      case 'dance-doodle': return <Play className="h-4 w-4" />;
      default: return <Brain className="h-4 w-4" />;
    }
  };

  const getGameName = (gameId: string) => {
    const game = mockGames.find(g => g.id === gameId);
    return game ? game.name : gameId;
  };

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const togglePatientExpansion = (patientId: string) => {
    const newExpanded = new Set(expandedPatients);
    if (newExpanded.has(patientId)) {
      newExpanded.delete(patientId);
    } else {
      newExpanded.add(patientId);
    }
    setExpandedPatients(newExpanded);
  };

  const handleEditNotes = (task: TherapeuticTask) => {
    setEditingTask(task);
    setEditedNotes(task.notes || '');
    setShowEditNotesModal(true);
  };

  const handleSaveNotes = () => {
    if (editingTask) {
      // In a real app, this would make an API call to update the task notes
      console.log('Saving notes for task:', editingTask.id, editedNotes);
      // For now, we'll just close the modal
      setShowEditNotesModal(false);
      setEditingTask(null);
      setEditedNotes('');
    }
  };

  const handleCancelEdit = () => {
    setShowEditNotesModal(false);
    setEditingTask(null);
    setEditedNotes('');
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {selectedPatient ? `Tasks for ${selectedPatient.name}` : 'Therapeutic Task Management'}
          </h1>
          <p className="text-gray-600">
            {selectedPatient 
              ? `Manage therapeutic tasks for ${selectedPatient.name} (Age ${selectedPatient.age})`
              : `Create, assign, and track therapeutic tasks for ${doctor?.currentChildrenCount || 0} patients`
            }
          </p>
          {selectedPatient && (
            <div className="mt-2">
              <Link
                to="/doctor/tasks"
                className="inline-flex items-center text-sm text-purple-600 hover:text-purple-700"
              >
                ← Back to all tasks
              </Link>
            </div>
          )}
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create New Task
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 text-white">
              <BookOpen className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Tasks</p>
              <p className="text-2xl font-bold text-gray-900">{mockTasks.length}</p>
              <p className="text-xs text-gray-500">Across all patients</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <Activity className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Tasks</p>
              <p className="text-2xl font-bold text-gray-900">
                {mockTasks.filter(task => task.status === 'active').length}
              </p>
              <p className="text-xs text-gray-500">Currently running</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-gradient-to-r from-green-500 to-green-600 text-white">
              <CheckCircle className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">
                {mockTasks.filter(task => task.status === 'completed').length}
              </p>
              <p className="text-xs text-gray-500">Successfully finished</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 text-white">
              <Users className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Patients Assigned</p>
              <p className="text-2xl font-bold text-gray-900">
                {new Set(mockTasks.flatMap(task => task.assignedTo)).size}
              </p>
              <p className="text-xs text-gray-500">Active participants</p>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Filters and Search */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1">
            <label htmlFor="task-search" className="block text-sm font-medium text-gray-700 mb-2">
              Search Tasks
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                id="task-search"
                type="text"
                placeholder="Search by task name, description, therapy goal, or doctor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            </div>
            
          {/* Status Filter */}
          <div className="lg:w-48">
            <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="expired">Expired</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div className="lg:w-48">
            <label htmlFor="priority-filter" className="block text-sm font-medium text-gray-700 mb-2">
              Priority
            </label>
            <select
              id="priority-filter"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Priority</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* Game Filter */}
          <div className="lg:w-48">
            <label htmlFor="game-filter" className="block text-sm font-medium text-gray-700 mb-2">
              Game Type
            </label>
            <select
              id="game-filter"
              value={gameFilter}
              onChange={(e) => setGameFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Games</option>
              {mockGames.map((game) => (
                <option key={game.id} value={game.id}>
                  {game.name}
                </option>
              ))}
            </select>
          </div>

          {/* Clear Filters Button */}
          <div className="lg:w-auto flex items-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setPriorityFilter('all');
                setGameFilter('all');
              }}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Results Count */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Showing {filteredTasks.length} of {mockTasks.length} tasks
          </p>
        </div>
      </div>

      {/* Professional Tasks List */}
      <div className="space-y-6">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <BookOpen className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all' || gameFilter !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'No therapeutic tasks have been created yet.'
              }
            </p>
            {(searchTerm || statusFilter !== 'all' || priorityFilter !== 'all' || gameFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setPriorityFilter('all');
                  setGameFilter('all');
                }}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          filteredTasks.flatMap((task) => 
            task.assignedTo.map((patientId) => {
              const patient = mockPatients.find(p => p.id === patientId);
              if (!patient) return null;
              
              return (
                <div key={`${task.id}-${patientId}`} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">


                  {/* Patient Information */}
        <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="p-3 bg-white rounded-lg mr-4 border border-gray-200">
                          <User className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">{patient.name}</h4>
                          <p className="text-sm text-gray-500">Age {patient.age} • {patient.diagnosis}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          patient.status === 'active' 
                            ? 'text-green-600 bg-green-100' 
                            : patient.status === 'inactive'
                            ? 'text-red-600 bg-red-100'
                            : 'text-blue-600 bg-blue-100'
                        }`}>
                          {patient.status.charAt(0).toUpperCase() + patient.status.slice(1)}
                        </span>
                        <button
                          onClick={() => togglePatientExpansion(`${task.id}-${patientId}`)}
                          className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <ChevronDown className={`h-4 w-4 mr-2 transition-transform ${expandedPatients.has(`${task.id}-${patientId}`) ? 'rotate-180' : ''}`} />
                          Show Details
                        </button>
                        <Link
                          to={`/doctor/children/${patientId}/progress`}
                          className="inline-flex items-center px-3 py-2 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Progress
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Assigned Games - Conditionally Shown */}
                  {expandedPatients.has(`${task.id}-${patientId}`) && (
                    <div className="p-6 border-b border-gray-200">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold text-gray-900">Assigned Games ({task.games.length})</h4>
        </div>
        
                      {/* Task Timeline */}
                      <div className="mb-6">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-sm font-medium text-gray-700">Task Timeline</span>
                          {new Date(task.endDate) < new Date() && (
                            <span className="px-2 py-1 text-xs font-medium text-red-600 bg-red-100 rounded-full">
                              Expired
                    </span>
                          )}
                        </div>
                        
                        {/* Horizontal Timeline */}
                        <div className="relative w-full py-4">
                          {/* Timeline Line */}
                          <div className="absolute top-8 left-0 right-0 h-0.5 bg-gray-300"></div>
                          
                          {/* Timeline Points Container */}
                          <div className="flex items-start w-full">
                            {/* Start Date */}
                            <div className="flex flex-col items-center relative group">
                              <div className="w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-sm relative z-10 mb-2 cursor-pointer hover:scale-110 transition-transform"></div>
                              <div className="text-center">
                                <p className="text-xs font-medium text-gray-900">Start</p>
                                <p className="text-xs text-gray-500">{formatDate(task.startDate)}</p>
                              </div>
                              {/* Hover Tooltip */}
                              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-50 shadow-lg">
                                Task started on {formatDate(task.startDate)}
                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                              </div>
                            </div>
                            
                            {/* Spacer */}
                            <div className="flex-1"></div>
                            
                            {/* Current Date */}
                            <div className="flex flex-col items-center relative group">
                              <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-sm relative z-10 mb-2 cursor-pointer hover:scale-110 transition-transform"></div>
                              <div className="text-center">
                                <p className="text-xs font-medium text-gray-900">Current</p>
                                <p className="text-xs text-gray-500">{formatDate(new Date().toISOString().split('T')[0])}</p>
                              </div>
                              {/* Hover Tooltip */}
                              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-50 shadow-lg">
                                Today is {formatDate(new Date().toISOString().split('T')[0])}
                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                              </div>
                            </div>
                            
                            {/* Spacer */}
                            <div className="flex-1"></div>
                            
                            {/* End Date */}
                            <div className="flex flex-col items-center relative group">
                              <div className={`w-4 h-4 rounded-full border-2 border-white shadow-sm relative z-10 mb-2 cursor-pointer hover:scale-110 transition-transform ${
                                new Date(task.endDate) < new Date() 
                                  ? 'bg-red-500' 
                                  : 'bg-orange-500'
                              }`}></div>
                              <div className="text-center">
                                <p className="text-xs font-medium text-gray-900">End</p>
                                <p className="text-xs text-gray-500">{formatDate(task.endDate)}</p>
                              </div>
                              {/* Hover Tooltip */}
                              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-50 shadow-lg">
                                {new Date(task.endDate) < new Date() 
                                  ? `Task expired on ${formatDate(task.endDate)}` 
                                  : `Task ends on ${formatDate(task.endDate)}`
                                }
                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
        
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {task.games.map((game, gameIndex) => {
                          // Mock game performance data for this patient
                          const gameSessions = [
                            { session: 1, score: 45, date: '2024-01-15', duration: 12, notes: 'First attempt' },
                            { session: 2, score: 52, date: '2024-01-16', duration: 15, notes: 'Improving focus' },
                            { session: 3, score: 48, date: '2024-01-17', duration: 18, notes: 'Some difficulty' },
                            { session: 4, score: 58, date: '2024-01-18', duration: 14, notes: 'Better performance' },
                            { session: 5, score: 62, date: '2024-01-19', duration: 16, notes: 'Good progress' },
                            { session: 6, score: 65, date: '2024-01-20', duration: 13, notes: 'Latest session' }
                          ];
                          
                          const currentScore = gameSessions[gameSessions.length - 1]?.score || 0;
                          const avgScore = Math.round(gameSessions.reduce((acc, s) => acc + s.score, 0) / gameSessions.length);
                          const improvement = currentScore - gameSessions[0]?.score || 0;
                          const aliScore = Math.min(100, Math.max(0, 100 - avgScore + Math.random() * 20));
                          
                          return (
                            <div key={gameIndex} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center">
                                  <div className="p-2 bg-white rounded-lg mr-3 border border-gray-200">
                                    {getGameIcon(game.gameId)}
                                  </div>
                                  <div>
                                    <h5 className="font-medium text-gray-900">{getGameName(game.gameId)}</h5>
                                  </div>
                                </div>
                                <span className="text-sm text-blue-600 font-medium">
                                  {gameSessions.length} sessions played
                    </span>
                  </div>
                  
                              {/* Game Metrics */}
                              <div className="grid grid-cols-2 gap-3 mb-3">
                                <div>
                                  <p className="text-xs text-gray-500">Current Score</p>
                                  <p className="text-lg font-bold text-gray-900">{currentScore}%</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500">Average Score</p>
                                  <p className="text-lg font-bold text-gray-900">{avgScore}%</p>
                    </div>
                                <div>
                                  <p className="text-xs text-gray-500">Improvement</p>
                                  <p className="text-lg font-bold text-green-600">+{improvement}%</p>
                    </div>
                                <div>
                                  <p className="text-xs text-gray-500">ALI Score</p>
                                  <p className="text-lg font-bold text-gray-900">{Math.round(aliScore)}%</p>
                    </div>
                  </div>
                  
                              {/* ALI Spectrum */}
                              <div className="mb-3">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs text-gray-500">Autism Likelihood Index (ALI)</span>
                                  <span className="text-xs font-medium text-gray-700">{Math.round(aliScore)}% (ALI)</span>
                    </div>
                                <div className="relative w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                                  <div className="absolute inset-0 bg-gradient-to-r from-green-500 via-yellow-500 to-orange-500 to-red-500"></div>
                                  <div 
                                    className="absolute top-0 w-1 h-full bg-gray-800 rounded-full"
                                    style={{ left: `${aliScore}%` }}
                                  ></div>
                                  <div 
                                    className="absolute top-0 w-1 h-full bg-gray-400 rounded-full"
                                    style={{ left: '70%' }}
                                  ></div>
                    </div>
                                <div className="flex justify-between text-xs text-gray-500 mt-1">
                                  <span>Low Risk</span>
                                  <span>Moderate</span>
                                  <span>High Risk</span>
                    </div>
                </div>
                
                              {/* Session Details Button */}
                  <button
                                onClick={() => setSelectedTask({...task, selectedPatient: patient, selectedGame: game, gameSessions})}
                                className="w-full text-center px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                                {gameSessions.length} sessions played - Click for details
                  </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  
                  {/* Clinical Notes - Conditionally Shown */}
                  {expandedPatients.has(`${task.id}-${patientId}`) && (
                    <div className="p-6 border-b border-gray-200">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold text-gray-900">Clinical Notes</h4>
                  <button
                          onClick={() => handleEditNotes(task)}
                          className="inline-flex items-center px-3 py-1 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                          <Edit3 className="h-4 w-4 mr-1" />
                          Edit Notes
                  </button>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                        {task.notes ? (
                          <p className="text-blue-800">{task.notes}</p>
                        ) : (
                          <p className="text-blue-600 italic">No clinical notes added yet. Click "Edit Notes" to add notes.</p>
                        )}
                      </div>
                    </div>
                  )}
                  
                </div>
              );
            }).filter(Boolean)
          )
                  )}
                </div>
                
      {/* Task Details Modal */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">
                    {selectedTask.selectedPatient && selectedTask.selectedGame 
                      ? `${selectedTask.selectedPatient.name} - ${getGameName(selectedTask.selectedGame.gameId)} Sessions`
                      : selectedTask.title
                    }
                  </h2>
                  <p className="text-gray-600 mt-1">
                    {selectedTask.selectedPatient && selectedTask.selectedGame 
                      ? 'Game Session Details'
                      : 'Therapeutic Task Details'
                    }
                  </p>
                </div>
                  <button
                  onClick={() => setSelectedTask(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                  <X className="h-6 w-6" />
                  </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {selectedTask.selectedPatient && selectedTask.selectedGame && selectedTask.gameSessions ? (
                // Game Session Details View
                <div className="space-y-6">
                  {/* Patient and Game Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-3">Patient Information</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Name:</span>
                          <span className="font-medium">{selectedTask.selectedPatient.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Age:</span>
                          <span className="font-medium">{selectedTask.selectedPatient.age} years</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Diagnosis:</span>
                          <span className="font-medium">{selectedTask.selectedPatient.diagnosis}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">ALI Score:</span>
                          <span className="font-medium">{(selectedTask.selectedPatient as any).autismLikelihoodIndex || 0}%</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-3">Game Information</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Game:</span>
                          <span className="font-medium">{getGameName(selectedTask.selectedGame.gameId)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Target Score:</span>
                          <span className="font-medium">{selectedTask.selectedGame.targetScore}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Required Sessions:</span>
                          <span className="font-medium">{selectedTask.selectedGame.requiredSessions}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Sessions Completed:</span>
                          <span className="font-medium">{selectedTask.gameSessions.length}</span>
                        </div>
                </div>
              </div>
            </div>

                  {/* Performance Line Graph */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4">Performance Trend</h3>
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <div className="h-64">
                        <svg className="w-full h-full" viewBox="0 0 800 240">
                          {/* Grid lines */}
                          {[0, 1, 2, 3, 4, 5].map(i => (
                            <line
                              key={i}
                              x1="50"
                              y1={50 + i * 30}
                              x2="750"
                              y2={50 + i * 30}
                              stroke="#E5E7EB"
                              strokeWidth="1"
                            />
                          ))}
                          
                          {/* Y-axis labels */}
                          {[100, 80, 60, 40, 20, 0].map((score, i) => (
                            <text
                              key={i}
                              x="40"
                              y={55 + i * 30}
                              textAnchor="end"
                              className="text-xs fill-gray-500"
                            >
                              {score}%
                            </text>
                          ))}
                          
                          {/* Data points and lines */}
                          {selectedTask.gameSessions.map((session, idx) => {
                            const x = 50 + (idx / (selectedTask.gameSessions.length - 1)) * 700;
                            const y = 50 + ((100 - session.score) / 100) * 150;
                            return (
                              <g key={idx}>
                                <circle
                                  cx={x}
                                  cy={y}
                                  r="4"
                                  fill="#3B82F6"
                                  className="hover:r-6 transition-all cursor-pointer"
                                />
                                <text
                                  x={x}
                                  y={y - 10}
                                  textAnchor="middle"
                                  className="text-xs fill-gray-700 font-medium"
                                >
                                  {session.score}%
                                </text>
                                {idx > 0 && (
                                  <line
                                    x1={50 + ((idx - 1) / (selectedTask.gameSessions.length - 1)) * 700}
                                    y1={50 + ((100 - selectedTask.gameSessions[idx - 1].score) / 100) * 150}
                                    x2={x}
                                    y2={y}
                                    stroke="#3B82F6"
                                    strokeWidth="3"
                                  />
                                )}
                              </g>
                            );
                          })}
                          
                          {/* X-axis labels */}
                          {selectedTask.gameSessions.map((session, idx) => {
                            const x = 50 + (idx / (selectedTask.gameSessions.length - 1)) * 700;
                            return (
                              <text
                                key={idx}
                                x={x}
                                y="220"
                                textAnchor="middle"
                                className="text-xs fill-gray-500"
                              >
                                S{session.session}
                              </text>
                            );
                          })}
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Session Statistics */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <div className="text-center">
                        <p className="text-sm text-blue-600 font-medium">Average Score</p>
                        <p className="text-2xl font-bold text-blue-700">
                          {Math.round(selectedTask.gameSessions.reduce((acc, s) => acc + s.score, 0) / selectedTask.gameSessions.length)}%
                        </p>
                      </div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                      <div className="text-center">
                        <p className="text-sm text-green-600 font-medium">Total Sessions</p>
                        <p className="text-2xl font-bold text-green-700">{selectedTask.gameSessions.length}</p>
                      </div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                      <div className="text-center">
                        <p className="text-sm text-purple-600 font-medium">Total Time</p>
                        <p className="text-2xl font-bold text-purple-700">
                          {selectedTask.gameSessions.reduce((acc, s) => acc + s.duration, 0)}m
                        </p>
                      </div>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                      <div className="text-center">
                        <p className="text-sm text-orange-600 font-medium">Best Score</p>
                        <p className="text-2xl font-bold text-orange-700">
                          {Math.max(...selectedTask.gameSessions.map(s => s.score))}%
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // Regular Task Details View
                <div className="space-y-6">
                  {/* Task Overview */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">Task Information</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Status:</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedTask.status)}`}>
                            {selectedTask.status.charAt(0).toUpperCase() + selectedTask.status.slice(1)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Priority:</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(selectedTask.priority)}`}>
                            {selectedTask.priority.charAt(0).toUpperCase() + selectedTask.priority.slice(1)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Created by:</span>
                          <span className="font-medium">{selectedTask.createdBy}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Duration:</span>
                          <span className="font-medium">{selectedTask.estimatedDuration} days</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">Timeline</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Assigned:</span>
                          <span className="font-medium">{formatDate(selectedTask.assignedDate)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Start Date:</span>
                          <span className="font-medium">{formatDate(selectedTask.startDate)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">End Date:</span>
                          <span className="font-medium">{formatDate(selectedTask.endDate)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Days Remaining:</span>
                          <span className={`font-medium ${getDaysRemaining(selectedTask.endDate) < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                            {getDaysRemaining(selectedTask.endDate) > 0 
                              ? `${getDaysRemaining(selectedTask.endDate)} days`
                              : getDaysRemaining(selectedTask.endDate) === 0 
                              ? 'Due today'
                              : `${Math.abs(getDaysRemaining(selectedTask.endDate))} days overdue`
                            }
                          </span>
                        </div>
                      </div>
                    </div>
        </div>
        
                  {/* Therapy Goal */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Therapy Goal</h3>
                    <p className="text-gray-700 bg-purple-50 rounded-lg p-4 border border-purple-100">
                      {selectedTask.therapyGoal}
                    </p>
                  </div>

                  {/* Description */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Description</h3>
                    <p className="text-gray-700">{selectedTask.description}</p>
                  </div>

          </div>
        )}
      </div>
            
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setSelectedTask(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {/* Edit task */}}
                className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Edit Task
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Task Modal - Placeholder */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Create New Therapeutic Task</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="text-center py-12">
                <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Task Creation Form</h3>
                <p className="text-gray-500 mb-4">
                  This feature will be implemented in the next phase with full backend integration.
                </p>
                <p className="text-sm text-gray-400">
                  For now, you can view and manage existing therapeutic tasks.
                </p>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Notes Modal */}
      {showEditNotesModal && editingTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Edit Clinical Notes</h2>
                <button
                  onClick={handleCancelEdit}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Task: <span className="font-medium">{editingTask.title}</span>
              </p>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="clinical-notes" className="block text-sm font-medium text-gray-700 mb-2">
                    Clinical Notes
                  </label>
                  <textarea
                    id="clinical-notes"
                    value={editedNotes}
                    onChange={(e) => setEditedNotes(e.target.value)}
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    placeholder="Enter clinical notes, observations, recommendations, or any other relevant information about this therapeutic task..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {editedNotes.length} characters
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNotes}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save Notes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskManagement;