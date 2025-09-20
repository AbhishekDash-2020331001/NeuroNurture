import { useDoctorAuth } from '@/features/doctor/contexts/DoctorAuthContext';
import {
    Calendar,
    CheckCircle,
    Search,
    Stethoscope,
    Target,
    Trophy,
    Users
} from 'lucide-react';
import React, { useState } from 'react';

const TaskHistory: React.FC = () => {
  const { doctor } = useDoctorAuth();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Therapeutic Task History</h1>
          <p className="text-gray-600">
            View completed therapeutic tasks and patient progress history
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-purple-500 text-white">
              <Stethoscope className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Tasks</p>
              <p className="text-2xl font-bold text-gray-900">3</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-500 text-white">
              <CheckCircle className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">3</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-500 text-white">
              <Users className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Patients Treated</p>
              <p className="text-2xl font-bold text-gray-900">5</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-orange-500 text-white">
              <Trophy className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Success Rate</p>
              <p className="text-2xl font-bold text-gray-900">100%</p>
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
                placeholder="Search tasks, therapy goals, or patients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
          </div>
          
          <div className="flex gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
            </select>
            
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="all">All Priority</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tasks History List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">
            Therapeutic Task History (3)
          </h2>
        </div>
        
        <div className="divide-y divide-gray-200">
          <div className="p-6 hover:bg-gray-50 transition-colors">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-medium text-gray-900">Focus Enhancement Program</h3>
                  <div className="px-2 py-1 rounded-full text-xs font-medium text-green-600 bg-green-100">
                    <div className="flex items-center space-x-1">
                      <CheckCircle className="h-4 w-4" />
                      <span>completed</span>
                    </div>
                  </div>
                  <div className="px-2 py-1 rounded-full text-xs font-medium text-red-600 bg-red-100">
                    high priority
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mb-2">Comprehensive attention and focus training through cognitive games</p>
                <p className="text-sm text-purple-600 font-medium mb-3">Therapy Goal: Improve sustained attention span and reduce distractibility</p>
                
                <div className="flex items-center space-x-6 text-sm text-gray-500">
                  <span className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Assigned: Jan 20, 2024
                  </span>
                  <span className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    2/2 patients completed
                  </span>
                  <span className="flex items-center">
                    <Target className="h-4 w-4 mr-1" />
                    3 therapeutic games
                  </span>
                </div>
              </div>
            </div>
            
            {/* Games Progress */}
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Therapeutic Games Progress:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">👁️</span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Gaze Tracking</p>
                      <p className="text-xs text-gray-500">Attention span</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <button className="text-sm font-semibold text-green-600 hover:text-green-700 hover:underline cursor-pointer transition-colors">
                      85%
                    </button>
                    <div className="text-xs text-gray-500">
                      3 sessions
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">🧍</span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Mirror Posture</p>
                      <p className="text-xs text-gray-500">Body awareness</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <button className="text-sm font-semibold text-green-600 hover:text-green-700 hover:underline cursor-pointer transition-colors">
                      78%
                    </button>
                    <div className="text-xs text-gray-500">
                      2 sessions
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">🔄</span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Repeat With Me</p>
                      <p className="text-xs text-gray-500">Memory retention</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <button className="text-sm font-semibold text-green-600 hover:text-green-700 hover:underline cursor-pointer transition-colors">
                      92%
                    </button>
                    <div className="text-xs text-gray-500">
                      4 sessions
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskHistory;
