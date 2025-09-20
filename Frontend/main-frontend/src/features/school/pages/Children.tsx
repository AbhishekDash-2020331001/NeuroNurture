import { useSchoolAuth } from '@/features/school/contexts/SchoolAuthContext';
import { childrenService, SchoolChild } from '@/shared/services/child/childrenService';
import {
  AlertCircle,
  Brain,
  Calendar,
  CheckCircle,
  Clock,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  Plus,
  Search,
  User,
  Users,
  X
} from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

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

interface ChildDetails {
  id: number;
  name: string;
  age: number;
  height: number;
  weight: number;
  grade: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  parentAddress: string;
  schoolId: number | null;
  enrolled: boolean;
}

// Mock data removed - now using real data from API

const Children: React.FC = () => {
  const { school } = useSchoolAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // Real children data state
  const [children, setChildren] = useState<SchoolChild[]>([]);
  const [isLoadingChildren, setIsLoadingChildren] = useState(true);
  const [childrenError, setChildrenError] = useState('');
  
  // Add Child Modal State
  const [showAddChildModal, setShowAddChildModal] = useState(false);
  const [childIdInput, setChildIdInput] = useState('');
  const [childDetails, setChildDetails] = useState<ChildDetails | null>(null);
  const [selectedEnrollmentGrade, setSelectedEnrollmentGrade] = useState('');
  const [isLoadingChild, setIsLoadingChild] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [error, setError] = useState('');

  // Debounce search term
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

  // Grade options with beautiful names and descriptions
  const gradeOptions = [
    {
      value: 'Gentle Bloom',
      label: 'Gentle Bloom',
      description: 'Mild autism - Needs gentle support and encouragement',
      color: 'text-green-600 bg-green-100',
      icon: '🌱'
    },
    {
      value: 'Rising Star',
      label: 'Rising Star', 
      description: 'Moderate autism - Requires structured guidance and patience',
      color: 'text-blue-600 bg-blue-100',
      icon: '⭐'
    },
    {
      value: 'Bright Light',
      label: 'Bright Light',
      description: 'Severe autism - Needs intensive support and specialized care',
      color: 'text-purple-600 bg-purple-100',
      icon: '✨'
    }
  ];

  // Fetch children data when component mounts
  useEffect(() => {
    const fetchChildren = async () => {
      if (!school?.id) return;
      
      setIsLoadingChildren(true);
      setChildrenError('');
      
      try {
        const childrenData = await childrenService.getChildrenBySchool(parseInt(school.id));
        setChildren(childrenData);
      } catch (error) {
        console.error('Error fetching children:', error);
        setChildrenError('Failed to load children data. Please try again.');
      } finally {
        setIsLoadingChildren(false);
      }
    };

    fetchChildren();
  }, [school?.id]);

  // SchoolAuthGuard handles authentication, so we can assume school exists here

  const filteredChildren = useMemo(() => {
    const searchTermLower = debouncedSearch.toLowerCase();
    return children.filter(child => {
      const matchesSearch = (child.name || '').toLowerCase().includes(searchTermLower) ||
                           (child.parentName || '').toLowerCase().includes(searchTermLower) ||
                           child.id.toString().toLowerCase().includes(searchTermLower);
      const matchesGrade = selectedGrade === 'all' || child.grade === selectedGrade;
      return matchesSearch && matchesGrade;
    });
  }, [children, debouncedSearch, selectedGrade]);

  const sortedChildren = useMemo(() => {
    const arr = [...filteredChildren];
    switch (sortBy) {
      case 'name':
        arr.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        break;
      case 'grade':
        arr.sort((a, b) => (a.grade || '').localeCompare(b.grade || ''));
        break;
      case 'score':
        arr.sort((a, b) => (b.overallScore || 0) - (a.overallScore || 0));
        break;
      case 'recent':
        arr.sort((a, b) => new Date(b.lastActive || 0).getTime() - new Date(a.lastActive || 0).getTime());
        break;
      default:
        break;
    }
    return arr;
  }, [filteredChildren, sortBy]);

  // Pagination
  const totalResults = sortedChildren.length;
  const totalPages = Math.max(1, Math.ceil(totalResults / pageSize));
  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [totalPages, page]);
  const paginatedChildren = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sortedChildren.slice(start, start + pageSize);
  }, [sortedChildren, page, pageSize]);

  // Determine if score/ALI column is available from API
  const showAliColumn = useMemo(() => children.some(c => typeof c.overallScore === 'number'), [children]);

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

  // Handle child lookup by ID
  const handleLookupChild = async () => {
    if (!childIdInput.trim()) {
      setError('Please enter a child ID');
      return;
    }

    setIsLoadingChild(true);
    setError('');
    setChildDetails(null);

    try {
      const response = await fetch(`http://localhost:8082/api/parents/children/${childIdInput}/details`);
      if (response.ok) {
        const childData = await response.json();
        setChildDetails(childData);
      } else if (response.status === 404) {
        setError('Child not found. Please check the child ID.');
      } else {
        setError('Failed to fetch child details. Please try again.');
      }
    } catch (error) {
      console.error('Error fetching child details:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoadingChild(false);
    }
  };

  // Handle child enrollment request
  const handleEnrollChild = async () => {
    if (!childDetails || !school || !selectedEnrollmentGrade) {
      setError('Please select a grade for the child');
      return;
    }

    setIsEnrolling(true);
    setError('');

    try {
      const response = await fetch(`http://localhost:8082/api/parents/enrollment-requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          childId: childDetails.id,
          schoolId: parseInt(school.id),
          schoolName: school.name,
          grade: selectedEnrollmentGrade,
          message: `Enrollment request for ${childDetails.name} to join ${school.name} as ${selectedEnrollmentGrade}`
        }),
      });

      if (response.ok) {
        // Success - close modal and refresh data
        setShowAddChildModal(false);
        setChildIdInput('');
        setChildDetails(null);
        setSelectedEnrollmentGrade('');
        setError('');
        
        alert(`Enrollment request sent successfully! ${childDetails.name} will need to accept the request from their dashboard.`);
      } else {
        const errorText = await response.text();
        setError(`Enrollment request failed: ${errorText}`);
      }
    } catch (error) {
      console.error('Error sending enrollment request:', error);
      setError('Network error during enrollment request. Please try again.');
    } finally {
      setIsEnrolling(false);
    }
  };

  // Reset modal state
  const resetModal = () => {
    setShowAddChildModal(false);
    setChildIdInput('');
    setChildDetails(null);
    setSelectedEnrollmentGrade('');
    setError('');
    setIsLoadingChild(false);
    setIsEnrolling(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="space-y-6 p-6">
        {/* Professional Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gray-800 rounded-lg">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Children Management
              </h1>
              <p className="text-gray-600 mt-1">
                Manage {school.currentChildren} enrolled children and track their progress
              </p>
            </div>
          </div>
        </div>
        

        {/* Children List with Integrated Controls */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              {/* Left side - Title and description */}
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Children ({filteredChildren.length})
                </h2>
                <p className="text-gray-600 text-sm">Manage and track student progress</p>
              </div>

              {/* Right side - Controls */}
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name, ID, or parent..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 w-full sm:w-64"
                  />
          </div>
          
                {/* Grade Filter */}
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 min-w-[140px]"
            >
              <option value="all">All Grades</option>
                  <option value="Gentle Bloom">Gentle Bloom</option>
                  <option value="Rising Star">Rising Star</option>
                  <option value="Bright Light">Bright Light</option>
            </select>
            
                {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 min-w-[160px]"
            >
              <option value="name">Sort by Name</option>
              <option value="grade">Sort by Grade</option>
              <option value="score">Sort by Score</option>
              <option value="recent">Sort by Recent Activity</option>
            </select>
                
                {/* Add New Child Button */}
                <button
                  onClick={() => setShowAddChildModal(true)}
                  className="inline-flex items-center px-4 py-2 bg-gray-800 text-white text-sm font-semibold rounded-lg hover:bg-gray-900 transition-all duration-200"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Child
                </button>
                
                {/* Page size */}
                <select
                  value={pageSize}
                  onChange={(e) => { setPageSize(parseInt(e.target.value)); setPage(1); }}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                >
                  <option value={10}>10 / page</option>
                  <option value={20}>20 / page</option>
                  <option value={50}>50 / page</option>
                </select>
              </div>
            </div>
          </div>
        
        {isLoadingChildren ? (
          <div className="divide-y divide-gray-100">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div key={idx} className="px-6 py-4 animate-pulse">
                <div className="flex items-center">
                  <div className="flex items-center space-x-4 flex-1 min-w-0">
                    <div className="w-10 h-10 bg-gray-200 rounded-lg" />
                    <div className="space-y-2 w-48">
                      <div className="h-3 bg-gray-200 rounded w-40" />
                      <div className="h-3 bg-gray-200 rounded w-28" />
                    </div>
                  </div>
                  <div className="flex items-center space-x-6">
                    {showAliColumn && <div className="w-20 h-6 bg-gray-200 rounded" />}
                    <div className="w-16 h-6 bg-gray-200 rounded" />
                    <div className="w-32 h-6 bg-gray-200 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : childrenError ? (
          <div className="p-8 text-center">
            <div className="text-red-600 mb-4">
              <AlertCircle className="h-12 w-12 mx-auto mb-2" />
              <p className="text-lg font-medium">Error Loading Children</p>
              <p className="text-sm">{childrenError}</p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : children.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-gray-400 mb-4">
              <Users className="h-12 w-12 mx-auto mb-2" />
              <p className="text-lg font-medium">No Children Enrolled</p>
              <p className="text-sm">No children have been enrolled in this school yet.</p>
            </div>
            <button
              onClick={() => setShowAddChildModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add First Child
            </button>
          </div>
        ) : (
          <div>
            {/* Column Headers */}
            <div className="bg-white px-6 py-3 border-b border-gray-200 sticky top-[64px] z-10">
              <div className="flex items-center">
                {/* Student Column - Flexible width */}
                <div className="flex items-center space-x-4 flex-1 min-w-0">
                  <div className="w-10"></div> {/* Spacer for avatar */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Student</h3>
                  </div>
                </div>
                
                {/* Fixed width columns for proper alignment */}
                <div className="flex items-center">
                  {showAliColumn && (
                    <div className="w-20 text-center">
                      <div className="flex items-center justify-center space-x-1 mb-1">
                        <Brain className="h-4 w-4 text-gray-600" />
                        <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide">ALI</span>
                      </div>
                    </div>
                  )}
                  
                  <div className="w-16 text-center">
                    <div className="flex items-center justify-center space-x-1 mb-1">
                      <Clock className="h-4 w-4 text-gray-600" />
                      <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Age</span>
                    </div>
                  </div>
                  
                  <div className="w-32 text-center">
                    <div className="flex items-center justify-center space-x-1 mb-1">
                      <GraduationCap className="h-4 w-4 text-gray-600" />
                      <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Grade</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

      {/* Children List */}
            <div className="divide-y divide-gray-100">
              {paginatedChildren.map((child) => {
                return (
                  <div 
                    key={child.id} 
                    className="px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer group"
                    onClick={() => navigate(`/school/children/${child.id}`)}
                  >
                    <div className="flex items-center">
                      {/* Student Column - Flexible width */}
                      <div className="flex items-center space-x-4 flex-1 min-w-0">
                        <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-white font-semibold text-sm shadow-sm group-hover:shadow-md transition-all duration-200">
                          {child.name.charAt(0)}
                        </div>
                  
                        <div className="min-w-0 flex-1">
                    <Link
                      to={`/school/children/${child.id}`}
                            className="text-lg font-semibold text-gray-900 hover:text-indigo-600 transition-colors cursor-pointer group-hover:text-indigo-600 block truncate"
                    >
                      {child.name}
                    </Link>
                          <div className="flex items-center text-xs text-gray-500 mt-1">
                            <Calendar className="h-3 w-3 mr-1" />
                            {child.enrollmentDate ? `Enrolled ${formatDate(child.enrollmentDate)}` : 'Enrollment date unavailable'}
                          </div>
                        </div>
                      </div>
                      
                      {/* Fixed width columns for proper alignment */}
                      <div className="flex items-center">
                        {/* ALI (Autism Likelihood Index) */}
                        {showAliColumn && (
                          <div className="w-20 text-center">
                            <div className={`px-2 py-1 rounded text-sm font-bold mx-auto inline-block ${
                              (child.overallScore ?? 0) >= 85 ? 'text-red-700 bg-red-100' :
                              (child.overallScore ?? 0) >= 75 ? 'text-yellow-700 bg-yellow-100' :
                              (child.overallScore ?? 0) >= 65 ? 'text-yellow-600 bg-yellow-50' :
                              'text-green-700 bg-green-100'
                            }`}>
                              {typeof child.overallScore === 'number' ? `${child.overallScore}%` : '—'}
                            </div>
                          </div>
                        )}
                        
                        {/* Age */}
                        <div className="w-16 text-center">
                          <div className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-sm font-bold mx-auto inline-block">
                            {child.age ?? '—'}
                          </div>
                        </div>
                        
                        {/* Grade */}
                        <div className="w-32 text-center">
                          <div className={`px-2 py-1 rounded text-sm font-bold mx-auto inline-block ${
                            child.grade === 'Gentle Bloom' ? 'text-green-700 bg-green-100' :
                            child.grade === 'Rising Star' ? 'text-blue-700 bg-blue-100' :
                            child.grade === 'Bright Light' ? 'text-purple-700 bg-purple-100' :
                            'text-gray-700 bg-gray-100'
                          }`}>
                            {child.grade ?? '—'}
                          </div>
                        </div>
                    </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Pagination controls */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-white">
              <div className="text-sm text-gray-600">Showing {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, totalResults)} of {totalResults}</div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 rounded border text-sm disabled:opacity-50 hover:bg-gray-50 transition-colors"
                >
                  Previous
                </button>
                <span className="text-sm">Page {page} of {totalPages}</span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1 rounded border text-sm disabled:opacity-50 hover:bg-gray-50 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
        </div>

        {/* Add Child Modal */}
      {showAddChildModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Send Enrollment Request</h2>
                <button
                  onClick={resetModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Description */}
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>How it works:</strong> Search for a child by their ID to send them an enrollment request. 
                  The child will receive a notification and can accept or decline the request from their dashboard.
                </p>
              </div>

              {/* Child ID Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Child ID
                </label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={childIdInput}
                    onChange={(e) => setChildIdInput(e.target.value)}
                    placeholder="Enter child ID..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={isLoadingChild}
                  />
                  <button
                    onClick={handleLookupChild}
                    disabled={isLoadingChild || !childIdInput.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoadingChild ? 'Looking up...' : 'Lookup'}
                  </button>
                </div>
                {error && (
                  <div className="mt-2 flex items-center text-red-600 text-sm">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    {error}
                  </div>
                )}
              </div>

              {/* Child Details */}
              {childDetails && (
                <div className="border border-gray-200 rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Child Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Name</label>
                      <p className="text-gray-900">{childDetails.name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Age</label>
                      <p className="text-gray-900">{childDetails.age} years old</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Height</label>
                      <p className="text-gray-900">{childDetails.height} cm</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Weight</label>
                      <p className="text-gray-900">{childDetails.weight} kg</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      Parent Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-600 flex items-center">
                          <User className="h-4 w-4 mr-1" />
                          Parent Name
                        </label>
                        <p className="text-gray-900">{childDetails.parentName}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 flex items-center">
                          <Mail className="h-4 w-4 mr-1" />
                          Email
                        </label>
                        <p className="text-gray-900">{childDetails.parentEmail}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 flex items-center">
                          <Phone className="h-4 w-4 mr-1" />
                          Phone
                        </label>
                        <p className="text-gray-900">{childDetails.parentPhone}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          Address
                        </label>
                        <p className="text-gray-900">{childDetails.parentAddress}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Enrollment Status */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="block text-sm font-medium text-gray-600">Enrollment Status</label>
                        <div className="flex items-center mt-1">
                          {childDetails.enrolled ? (
                            <>
                              <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                              <span className="text-green-600 font-medium">Already enrolled in a school</span>
                            </>
                          ) : (
                            <>
                              <AlertCircle className="h-4 w-4 text-yellow-600 mr-2" />
                              <span className="text-yellow-600 font-medium">Not enrolled in any school</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Grade Selection - Only show if child is not enrolled */}
              {childDetails && !childDetails.enrolled && (
                <div className="border border-gray-200 rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <GraduationCap className="h-5 w-5 mr-2" />
                    Assign Grade Level
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Please select the appropriate grade level for {childDetails.name} based on their autism severity:
                  </p>
                  
                  <div className="space-y-3">
                    {gradeOptions.map((option) => (
                      <div
                        key={option.value}
                        className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                          selectedEnrollmentGrade === option.value
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedEnrollmentGrade(option.value)}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            selectedEnrollmentGrade === option.value
                              ? 'border-blue-500 bg-blue-500'
                              : 'border-gray-300'
                          }`}>
                            {selectedEnrollmentGrade === option.value && (
                              <CheckCircle className="h-4 w-4 text-white" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <span className="text-2xl">{option.icon}</span>
                              <h4 className="font-semibold text-gray-900">{option.label}</h4>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {!selectedEnrollmentGrade && (
                    <div className="mt-3 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      Please select a grade level to continue
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3">
                <button
                  onClick={resetModal}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                {childDetails && !childDetails.enrolled && (
                  <button
                    onClick={handleEnrollChild}
                    disabled={isEnrolling || !selectedEnrollmentGrade}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                  >
                    {isEnrolling ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Sending Request...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Send Enrollment Request
                      </>
                    )}
                  </button>
                )}
                {childDetails && childDetails.enrolled && (
                  <button
                    disabled
                    className="px-4 py-2 bg-gray-400 text-white rounded-lg cursor-not-allowed flex items-center"
                  >
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Already Enrolled
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default Children;
