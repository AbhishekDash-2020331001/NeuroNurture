import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSchoolAuth } from '@/contexts/school/SchoolAuthContext';
import { 
  Users, 
  Search, 
  Filter,
  Eye,
  BookOpen,
  BarChart3,
  Plus,
  GraduationCap,
  Calendar,
  TrendingUp
} from 'lucide-react';

interface Child {
  id: string;
  name: string;
  grade: string;
  age: number;
  parentName: string;
  parentEmail: string;
  enrollmentDate: string;
  lastActive: string;
  overallScore: number;
  gamesPlayed: number;
  tasksCompleted: number;
  avatar?: string;
}

const mockChildren: Child[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    grade: 'Grade 3',
    age: 8,
    parentName: 'Michael Johnson',
    parentEmail: 'michael.johnson@email.com',
    enrollmentDate: '2024-01-15',
    lastActive: '2024-01-20',
    overallScore: 87,
    gamesPlayed: 24,
    tasksCompleted: 18
  },
  {
    id: '2',
    name: 'Alex Chen',
    grade: 'Grade 2',
    age: 7,
    parentName: 'Lisa Chen',
    parentEmail: 'lisa.chen@email.com',
    enrollmentDate: '2024-01-10',
    lastActive: '2024-01-19',
    overallScore: 92,
    gamesPlayed: 31,
    tasksCompleted: 22
  },
  {
    id: '3',
    name: 'Emma Rodriguez',
    grade: 'Grade 4',
    age: 9,
    parentName: 'Carlos Rodriguez',
    parentEmail: 'carlos.rodriguez@email.com',
    enrollmentDate: '2024-01-05',
    lastActive: '2024-01-20',
    overallScore: 78,
    gamesPlayed: 19,
    tasksCompleted: 15
  },
  {
    id: '4',
    name: 'James Wilson',
    grade: 'Grade 3',
    age: 8,
    parentName: 'Jennifer Wilson',
    parentEmail: 'jennifer.wilson@email.com',
    enrollmentDate: '2024-01-12',
    lastActive: '2024-01-18',
    overallScore: 85,
    gamesPlayed: 28,
    tasksCompleted: 20
  },
  {
    id: '5',
    name: 'Maya Patel',
    grade: 'Grade 2',
    age: 7,
    parentName: 'Raj Patel',
    parentEmail: 'raj.patel@email.com',
    enrollmentDate: '2024-01-08',
    lastActive: '2024-01-20',
    overallScore: 90,
    gamesPlayed: 35,
    tasksCompleted: 25
  }
];

const Children: React.FC = () => {
  const { school } = useSchoolAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  // SchoolAuthGuard handles authentication, so we can assume school exists here

  const filteredChildren = mockChildren.filter(child => {
    const matchesSearch = child.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         child.parentName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGrade = selectedGrade === 'all' || child.grade === selectedGrade;
    return matchesSearch && matchesGrade;
  });

  const sortedChildren = [...filteredChildren].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'grade':
        return a.grade.localeCompare(b.grade);
      case 'score':
        return b.overallScore - a.overallScore;
      case 'recent':
        return new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime();
      default:
        return 0;
    }
  });

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 80) return 'text-blue-600 bg-blue-100';
    if (score >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Good';
    if (score >= 70) return 'Average';
    return 'Needs Improvement';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysSinceLastActive = (lastActive: string) => {
    const lastActiveDate = new Date(lastActive);
    const now = new Date();
    const diffTime = now.getTime() - lastActiveDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Children Management</h1>
          <p className="text-gray-600">
            Manage {school.currentChildren} enrolled children and track their progress
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            to="/school/children/add"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Child
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-500 text-white">
              <Users className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Children</p>
              <p className="text-2xl font-bold text-gray-900">{school.currentChildren}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-500 text-white">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg. Score</p>
              <p className="text-2xl font-bold text-gray-900">
                {Math.round(mockChildren.reduce((acc, child) => acc + child.overallScore, 0) / mockChildren.length)}%
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-yellow-500 text-white">
              <BookOpen className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Tasks</p>
              <p className="text-2xl font-bold text-gray-900">12</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-purple-500 text-white">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Grades</p>
              <p className="text-2xl font-bold text-gray-900">4</p>
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
                placeholder="Search children or parents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div className="flex gap-3">
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Grades</option>
              <option value="Grade 1">Grade 1</option>
              <option value="Grade 2">Grade 2</option>
              <option value="Grade 3">Grade 3</option>
              <option value="Grade 4">Grade 4</option>
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="name">Sort by Name</option>
              <option value="grade">Sort by Grade</option>
              <option value="score">Sort by Score</option>
              <option value="recent">Sort by Recent Activity</option>
            </select>
          </div>
        </div>
      </div>

      {/* Children List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">
            Children ({filteredChildren.length})
          </h2>
        </div>
        
        <div className="divide-y divide-gray-200">
          {sortedChildren.map((child) => (
            <div key={child.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {child.name.charAt(0)}
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{child.name}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <GraduationCap className="h-4 w-4 mr-1" />
                        {child.grade}
                      </span>
                      <span>{child.age} years old</span>
                      <span className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        Enrolled {formatDate(child.enrollmentDate)}
                      </span>
                    </div>
                    <div className="mt-1 text-sm text-gray-600">
                      Parent: {child.parentName} ({child.parentEmail})
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(child.overallScore)}`}>
                      {child.overallScore}% - {getScoreLabel(child.overallScore)}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Overall Score</p>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-900">{child.gamesPlayed}</p>
                    <p className="text-xs text-gray-500">Games Played</p>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-900">{child.tasksCompleted}</p>
                    <p className="text-xs text-gray-500">Tasks Completed</p>
                  </div>
                  
                  <div className="text-center">
                    <p className={`text-sm font-medium ${
                      getDaysSinceLastActive(child.lastActive) <= 1 ? 'text-green-600' : 'text-yellow-600'
                    }`}>
                      {getDaysSinceLastActive(child.lastActive)} day{getDaysSinceLastActive(child.lastActive) !== 1 ? 's' : ''} ago
                    </p>
                    <p className="text-xs text-gray-500">Last Active</p>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Link
                      to={`/school/children/${child.id}`}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View Profile"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                    <Link
                      to={`/school/children/${child.id}/progress`}
                      className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="View Progress"
                    >
                      <BarChart3 className="h-4 w-4" />
                    </Link>
                    <Link
                      to={`/school/children/${child.id}/tasks`}
                      className="p-2 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                      title="View Tasks"
                    >
                      <BookOpen className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Children;
