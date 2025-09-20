import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Eye, 
  MessageSquare, 
  BarChart3, 
  Calendar,
  Heart,
  Activity,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface Patient {
  id: string;
  name: string;
  age: number;
  diagnosis: string;
  parentName: string;
  parentEmail: string;
  enrollmentDate: string;
  lastActive: string;
  lastSession: string;
  overallProgress: number;
  gamesPlayed: number;
  tasksCompleted: number;
  tasksAssigned: number;
  therapyHours: number;
  status: 'active' | 'inactive' | 'completed';
  priority: 'high' | 'medium' | 'low';
  nextAppointment?: string;
  avatar?: string;
}

interface ChildCardProps {
  patient: Patient;
  showActions?: boolean;
  compact?: boolean;
}

const ChildCard: React.FC<ChildCardProps> = ({ 
  patient, 
  showActions = true, 
  compact = false 
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'inactive': return 'text-yellow-600 bg-yellow-100';
      case 'completed': return 'text-blue-600 bg-blue-100';
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4" />;
      case 'inactive': return <Clock className="h-4 w-4" />;
      case 'completed': return <Activity className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (compact) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
            <span className="text-sm font-semibold text-purple-600">
              {patient.name.charAt(0)}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-gray-900 truncate">
              {patient.name}
            </h3>
            <p className="text-xs text-gray-500 truncate">
              {patient.diagnosis}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(patient.status)}`}>
              <div className="flex items-center space-x-1">
                {getStatusIcon(patient.status)}
                <span>{patient.status}</span>
              </div>
            </div>
            {showActions && (
              <Link
                to={`/doctor/children/${patient.id}/progress`}
                className="p-1 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors"
                title="View Progress"
              >
                <Eye className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
            <span className="text-lg font-semibold text-purple-600">
              {patient.name.charAt(0)}
            </span>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">{patient.name}</h3>
            <p className="text-sm text-gray-500">Age {patient.age} • {patient.diagnosis}</p>
            <p className="text-xs text-gray-400">Parent: {patient.parentName}</p>
          </div>
        </div>
        
        <div className="flex flex-col items-end space-y-2">
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(patient.status)}`}>
            <div className="flex items-center space-x-1">
              {getStatusIcon(patient.status)}
              <span>{patient.status}</span>
            </div>
          </div>
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(patient.priority)}`}>
            {patient.priority} priority
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Overall Progress</span>
          <span className="text-sm font-medium text-gray-900">{patient.overallProgress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-purple-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${patient.overallProgress}%` }}
          ></div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <BarChart3 className="h-4 w-4 text-purple-600 mr-1" />
            <span className="text-sm font-medium text-gray-700">Games</span>
          </div>
          <p className="text-lg font-bold text-gray-900">{patient.gamesPlayed}</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
            <span className="text-sm font-medium text-gray-700">Tasks</span>
          </div>
          <p className="text-lg font-bold text-gray-900">{patient.tasksCompleted}/{patient.tasksAssigned}</p>
        </div>
      </div>

      {/* Additional Info */}
      <div className="space-y-2 text-sm text-gray-500 mb-4">
        <div className="flex items-center">
          <Calendar className="h-4 w-4 mr-2" />
          <span>Enrolled: {formatDate(patient.enrollmentDate)}</span>
        </div>
        <div className="flex items-center">
          <Clock className="h-4 w-4 mr-2" />
          <span>Last Active: {patient.lastActive}</span>
        </div>
        {patient.nextAppointment && (
          <div className="flex items-center">
            <Heart className="h-4 w-4 mr-2" />
            <span>Next Appointment: {formatDate(patient.nextAppointment)}</span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {showActions && (
        <div className="flex space-x-2">
          <Link
            to={`/doctor/children/${patient.id}/progress`}
            className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            View Progress
          </Link>
          <Link
            to="/doctor/chat"
            className="inline-flex items-center justify-center px-3 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            <MessageSquare className="h-4 w-4" />
          </Link>
        </div>
      )}
    </div>
  );
};

export default ChildCard;
