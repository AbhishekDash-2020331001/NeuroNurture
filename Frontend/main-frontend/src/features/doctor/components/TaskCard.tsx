import React from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen,
  Calendar,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Target,
  Eye,
  Edit,
  Trash2,
  Stethoscope
} from 'lucide-react';

interface TherapeuticTask {
  id: string;
  title: string;
  description: string;
  therapyGoal: string;
  assignedDate: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'expired';
  assignedTo: string[];
  games: any[];
  totalAssigned: number;
  completedCount: number;
  priority: 'high' | 'medium' | 'low';
  notes?: string;
}

interface TaskCardProps {
  task: TherapeuticTask;
  showActions?: boolean;
  compact?: boolean;
  onEdit?: (task: TherapeuticTask) => void;
  onDelete?: (task: TherapeuticTask) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ 
  task, 
  showActions = true, 
  compact = false,
  onEdit,
  onDelete
}) => {
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'active': return <Clock className="h-4 w-4" />;
      case 'expired': return <XCircle className="h-4 w-4" />;
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

  const getCompletionPercentage = () => {
    return Math.round((task.completedCount / task.totalAssigned) * 100);
  };

  const isExpired = () => {
    return new Date(task.endDate) < new Date() && task.status !== 'completed';
  };

  if (compact) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="text-sm font-medium text-gray-900 truncate">
                {task.title}
              </h3>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                <div className="flex items-center space-x-1">
                  {getStatusIcon(task.status)}
                  <span>{task.status}</span>
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-500 truncate mb-2">
              {task.therapyGoal}
            </p>
            <div className="flex items-center space-x-4 text-xs text-gray-400">
              <span className="flex items-center">
                <Users className="h-3 w-3 mr-1" />
                {task.completedCount}/{task.totalAssigned}
              </span>
              <span className="flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                {formatDate(task.endDate)}
              </span>
            </div>
          </div>
          {showActions && (
            <div className="flex space-x-1 ml-2">
              <button
                onClick={() => onEdit?.(task)}
                className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                title="Edit Task"
              >
                <Edit className="h-3 w-3" />
              </button>
              <button
                onClick={() => onDelete?.(task)}
                className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                title="Delete Task"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="text-lg font-medium text-gray-900">{task.title}</h3>
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
              <div className="flex items-center space-x-1">
                {getStatusIcon(task.status)}
                <span>{task.status}</span>
              </div>
            </div>
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
              {task.priority} priority
            </div>
            {isExpired() && (
              <div className="px-2 py-1 rounded-full text-xs font-medium text-red-600 bg-red-100">
                Expired
              </div>
            )}
          </div>
          
          <p className="text-sm text-gray-600 mb-2">{task.description}</p>
          <p className="text-sm text-purple-600 font-medium mb-3">
            <Target className="h-4 w-4 inline mr-1" />
            Therapy Goal: {task.therapyGoal}
          </p>
        </div>
        
        {showActions && (
          <div className="flex space-x-2">
            <button
              onClick={() => onEdit?.(task)}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Edit Task"
            >
              <Edit className="h-4 w-4" />
            </button>
            <button
              onClick={() => onDelete?.(task)}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete Task"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Patient Progress</span>
          <span className="text-sm font-medium text-gray-900">
            {task.completedCount}/{task.totalAssigned} ({getCompletionPercentage()}%)
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-purple-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${getCompletionPercentage()}%` }}
          ></div>
        </div>
      </div>

      {/* Task Details */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-gray-400" />
          <div>
            <p className="text-xs text-gray-500">Period</p>
            <p className="text-sm font-medium text-gray-900">
              {formatDate(task.startDate)} - {formatDate(task.endDate)}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <BookOpen className="h-4 w-4 text-gray-400" />
          <div>
            <p className="text-xs text-gray-500">Games</p>
            <p className="text-sm font-medium text-gray-900">
              {task.games.length} therapeutic games
            </p>
          </div>
        </div>
      </div>

      {/* Notes */}
      {task.notes && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-start space-x-2">
            <Stethoscope className="h-4 w-4 text-gray-400 mt-0.5" />
            <div>
              <p className="text-xs text-gray-500 mb-1">Doctor Notes</p>
              <p className="text-sm text-gray-700">{task.notes}</p>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {showActions && (
        <div className="flex space-x-2">
          <Link
            to={`/doctor/tasks/${task.id}`}
            className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </Link>
          <button
            onClick={() => onEdit?.(task)}
            className="inline-flex items-center justify-center px-3 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </button>
        </div>
      )}
    </div>
  );
};

export default TaskCard;
