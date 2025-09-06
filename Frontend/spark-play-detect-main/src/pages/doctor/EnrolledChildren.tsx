import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDoctorAuth } from '@/contexts/doctor/DoctorAuthContext';
import { mockPatients, getPatientsByStatus, type Patient } from '@/data/doctorMockData';
import { 
  Users, 
  Search, 
  Filter,
  Eye,
  BookOpen,
  BarChart3,
  MessageSquare,
  Stethoscope,
  Calendar,
  TrendingUp,
  Heart,
  Activity,
  Clock,
  CheckCircle
} from 'lucide-react';

const EnrolledChildren: React.FC = () => {
  const { doctor } = useDoctorAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  // Filter and sort patients
  const filteredPatients = mockPatients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.parentName.toLowerCase().includes(searchTerm.toLowerCase());
  
    let matchesStatus = true;
    if (selectedStatus !== 'all') {
      if (selectedStatus === 'active') {
        matchesStatus = patient.taskCompletionRate >= 80;
      } else if (selectedStatus === 'inactive') {
        matchesStatus = patient.taskCompletionRate < 60;
      } else if (selectedStatus === 'completed') {
        matchesStatus = patient.status === 'completed';
      }
    }
    
    const matchesPriority = selectedPriority === 'all' || patient.priority === selectedPriority;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const sortedPatients = [...filteredPatients].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'progress':
        return b.overallProgress - a.overallProgress;
      case 'priority':
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      case 'recent':
        return new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime();
      case 'appointment':
        if (!a.nextAppointment && !b.nextAppointment) return 0;
        if (!a.nextAppointment) return 1;
        if (!b.nextAppointment) return -1;
        return new Date(a.nextAppointment).getTime() - new Date(b.nextAppointment).getTime();
      default:
        return 0;
    }
  });

  const getStatusColor = (patient: Patient) => {
    // Status based on task completion regularity, not last activity
    if (patient.taskCompletionRate >= 80) {
      return 'text-green-600 bg-green-100';
    } else if (patient.taskCompletionRate >= 60) {
      return 'text-yellow-600 bg-yellow-100';
    } else {
      return 'text-red-600 bg-red-100';
    }
  };

  const getStatusText = (patient: Patient) => {
    // Status text based on task completion regularity
    if (patient.taskCompletionRate >= 80) {
      return 'Active';
    } else if (patient.taskCompletionRate >= 60) {
      return 'Irregular';
    } else {
      return 'Inactive';
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

  // Calculate stats based on task completion regularity
  const activePatients = mockPatients.filter(p => p.taskCompletionRate >= 80);
  const inactivePatients = mockPatients.filter(p => p.taskCompletionRate < 60);
  const completedPatients = mockPatients.filter(p => p.status === 'completed');
  const highPriorityPatients = mockPatients.filter(p => p.priority === 'high');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-4 lg:mb-0">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">My Patients</h1>
              <p className="text-gray-600 text-lg">
                Manage and monitor your enrolled patients' therapeutic progress
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center">
              <div className="p-3 rounded-xl bg-purple-100">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Patients</p>
                <p className="text-2xl font-bold text-gray-900">{mockPatients.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center">
              <div className="p-3 rounded-xl bg-green-100">
                <Activity className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-gray-900">{activePatients.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center">
              <div className="p-3 rounded-xl bg-yellow-100">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Inactive</p>
                <p className="text-2xl font-bold text-gray-900">{inactivePatients.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center">
              <div className="p-3 rounded-xl bg-red-100">
                <Heart className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">High Priority</p>
                <p className="text-2xl font-bold text-gray-900">{highPriorityPatients.length}</p>
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
                placeholder="Search patients, parents, or diagnosis..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <select 
              value={selectedStatus} 
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="completed">Completed</option>
            </select>
            <select 
              value={selectedPriority} 
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="all">All Priority</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="name">Sort by Name</option>
              <option value="progress">Sort by Progress</option>
              <option value="priority">Sort by Priority</option>
              <option value="recent">Sort by Recent Activity</option>
              <option value="appointment">Sort by Next Appointment</option>
            </select>
          </div>
        </div>
      </div>

      {/* Patients List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">
            Patients ({sortedPatients.length})
          </h2>
        </div>
        
        <div className="divide-y divide-gray-200">
          {sortedPatients.map((patient) => (
            <div key={patient.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-lg font-semibold text-purple-600">
                      {patient.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{patient.name}</h3>
                    <p className="text-sm text-gray-500">
                      Age {patient.age} • {patient.diagnosis}
                    </p>
                    <p className="text-xs text-gray-400">
                      Parent: {patient.parentName} • Enrolled: {formatDate(patient.enrollmentDate)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-sm font-medium text-gray-700">Progress</span>
                      <span className="text-sm font-bold text-gray-900">{patient.overallProgress}%</span>
                    </div>
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${patient.overallProgress}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end space-y-2">
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(patient)}`}>
                      {getStatusText(patient)}
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(patient.priority)}`}>
                      {patient.priority} priority
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Link
                      to={`/doctor/children/${patient.id}/progress`}
                      className="inline-flex items-center px-3 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Progress
                    </Link>
                    <Link
                      to={`/doctor/tasks?patient=${patient.id}`}
                      className="inline-flex items-center px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <BookOpen className="h-4 w-4 mr-2" />
                      Assign Task
                    </Link>
                    <Link
                      to={`/doctor/chat?patient=${patient.id}`}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Chat
                    </Link>
                  </div>
                </div>
              </div>
              
              {/* Additional Info */}
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  <span>Task Rate: {patient.taskCompletionRate}%</span>
                </div>
                <div className="flex items-center">
                  <BookOpen className="h-4 w-4 mr-2" />
                  <span>Tasks: {patient.tasksCompleted}/{patient.tasksAssigned}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  <span>Last Task: {patient.lastTaskCompletion}</span>
                </div>
                {patient.nextAppointment && (
                  <div className="flex items-center">
                    <Heart className="h-4 w-4 mr-2" />
                    <span>Next: {formatDate(patient.nextAppointment)}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {sortedPatients.length === 0 && (
          <div className="p-12 text-center">
            <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No patients found</h3>
            <p className="text-gray-500">
              Try adjusting your search criteria or filters
            </p>
          </div>
        )}
      </div>
      </div>
    </div>
  );
};

export default EnrolledChildren;