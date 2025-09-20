import { useDoctorAuth } from '@/features/doctor/contexts/DoctorAuthContext';
import { patientService, type Patient } from '@/shared/services/doctor/patientService';
import {
    Activity,
    BarChart3,
    BookOpen,
    CheckCircle,
    Clock,
    Heart,
    MessageSquare,
    Plus,
    Search,
    Stethoscope,
    Users,
    X
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const EnrolledChildren: React.FC = () => {
  const { doctor } = useDoctorAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  
  // Real patients data state
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoadingPatients, setIsLoadingPatients] = useState(true);
  const [patientsError, setPatientsError] = useState('');
  
  // Add Patient Modal State
  const [showAddPatientModal, setShowAddPatientModal] = useState(false);
  const [childIdInput, setChildIdInput] = useState('');
  const [childDetails, setChildDetails] = useState<any>(null);
  const [selectedProblem, setSelectedProblem] = useState('');
  const [isLoadingChild, setIsLoadingChild] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [error, setError] = useState('');

  // Problem options for medical conditions
  const problemOptions = [
    'Autism Spectrum Disorder',
    'ADHD (Attention Deficit Hyperactivity Disorder)',
    'Learning Disability',
    'Speech and Language Delay',
    'Developmental Delay',
    'Sensory Processing Disorder',
    'Anxiety Disorder',
    'Depression',
    'Behavioral Issues',
    'Social Skills Deficit',
    'Motor Skills Delay',
    'Cognitive Impairment',
    'Other'
  ];

  // Load patients when component mounts
  useEffect(() => {
    loadPatients();
  }, [doctor]);

  const loadPatients = async () => {
    if (!doctor?.id) return;
    
    try {
      setIsLoadingPatients(true);
      setPatientsError('');
      const patientsData = await patientService.getPatientsByDoctor(parseInt(doctor.id));
      setPatients(patientsData);
    } catch (error) {
      console.error('Error loading patients:', error);
      setPatientsError('Failed to load patients. Please try again.');
      setPatients([]);
    } finally {
      setIsLoadingPatients(false);
    }
  };

  // Filter and sort patients
  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.problem.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.parentName.toLowerCase().includes(searchTerm.toLowerCase());
    
    // For now, we'll show all patients since we don't have task completion data
    // In the future, this can be enhanced with real task completion data
    return matchesSearch;
  });

  const sortedPatients = [...filteredPatients].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'age':
        return b.age - a.age;
      case 'problem':
        return a.problem.localeCompare(b.problem);
      case 'parent':
        return a.parentName.localeCompare(b.parentName);
      default:
        return 0;
    }
  });

  const getStatusColor = (patient: Patient) => {
    // For now, show all patients as active since we don't have task completion data
    return 'text-green-600 bg-green-100';
  };

  const getStatusText = (patient: Patient) => {
    // For now, show all patients as active since we don't have task completion data
    return 'Active';
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

  // Handle child lookup
  const handleLookupChild = async () => {
    if (!childIdInput.trim()) {
      setError('Please enter a child ID');
      return;
    }

    setIsLoadingChild(true);
    setError('');

    try {
      const response = await fetch(`http://localhost:8082/api/parents/children/${childIdInput}/details`);
      
      if (response.ok) {
        const childData = await response.json();
        setChildDetails(childData);
      } else {
        setError('Child not found. Please check the ID and try again.');
        setChildDetails(null);
      }
    } catch (error) {
      console.error('Error looking up child:', error);
      setError('Network error. Please try again.');
      setChildDetails(null);
    } finally {
      setIsLoadingChild(false);
    }
  };

  // Handle patient enrollment
  const handleEnrollPatient = async () => {
    if (!childDetails || !doctor) {
      setError('Missing child or doctor information');
      return;
    }

    if (!selectedProblem) {
      setError('Please select the medical condition/problem');
      return;
    }

    setIsEnrolling(true);
    setError('');

    try {
      const response = await fetch(`http://localhost:8082/api/parents/children/${childDetails.id}/enroll-doctor`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          doctorId: parseInt(doctor.id),
          problem: selectedProblem,
          notes: 'Enrolled by doctor'
        }),
      });

      if (response.ok) {
        // Success - close modal and refresh data
        setShowAddPatientModal(false);
        setChildIdInput('');
        setChildDetails(null);
        setSelectedProblem('');
        setError('');
        
        alert(`Patient enrolled successfully with condition: ${selectedProblem}`);
        
        // Refresh the patients list
        await loadPatients();
      } else {
        const errorText = await response.text();
        setError(`Enrollment failed: ${errorText}`);
      }
    } catch (error) {
      console.error('Error enrolling patient:', error);
      setError('Network error during enrollment. Please try again.');
    } finally {
      setIsEnrolling(false);
    }
  };

  // Reset modal state
  const resetModal = () => {
    setShowAddPatientModal(false);
    setChildIdInput('');
    setChildDetails(null);
    setSelectedProblem('');
    setError('');
    setIsLoadingChild(false);
    setIsEnrolling(false);
  };

  // Calculate stats based on real patient data
  const totalPatients = patients.length;
  const activePatients = patients; // All patients are considered active for now
  const patientsByProblem = patients.reduce((acc, patient) => {
    acc[patient.problem] = (acc[patient.problem] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const mostCommonProblem = Object.keys(patientsByProblem).reduce((a, b) => 
    patientsByProblem[a] > patientsByProblem[b] ? a : b, 'None'
  );

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
            <div className="flex gap-3">
              <button
                onClick={() => setShowAddPatientModal(true)}
                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Patient
              </button>
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
                <p className="text-2xl font-bold text-gray-900">{totalPatients}</p>
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
              <div className="p-3 rounded-xl bg-blue-100">
                <Stethoscope className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Conditions</p>
                <p className="text-2xl font-bold text-gray-900">{Object.keys(patientsByProblem).length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center">
              <div className="p-3 rounded-xl bg-green-100">
                <Heart className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Most Common</p>
                <p className="text-sm font-bold text-gray-900 truncate" title={mostCommonProblem}>
                  {mostCommonProblem.length > 15 ? mostCommonProblem.substring(0, 15) + '...' : mostCommonProblem}
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
                placeholder="Search patients, parents, or conditions..."
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
              <option value="age">Sort by Age</option>
              <option value="problem">Sort by Condition</option>
              <option value="parent">Sort by Parent</option>
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

        {/* Loading State */}
        {isLoadingPatients && (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Loading Patients...</h3>
            <p className="text-gray-500">Please wait while we fetch your patients</p>
          </div>
        )}

        {/* Error State */}
        {patientsError && !isLoadingPatients && (
          <div className="p-12 text-center">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Patients</h3>
            <p className="text-gray-500 mb-4">{patientsError}</p>
            <button
              onClick={loadPatients}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}
        
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
                      Age {patient.age} • {patient.problem || 'Condition not specified'}
                    </p>
                    <p className="text-xs text-gray-400">
                      Parent: {patient.parentName} • Grade: {patient.grade}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-sm font-medium text-gray-700">Details</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {patient.height}cm • {patient.weight}kg
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end space-y-2">
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(patient)}`}>
                      {getStatusText(patient)}
                    </div>
                    <div className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {patient.gender}
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
                  <span>School: {patient.enrolledInSchool ? 'Enrolled' : 'Not Enrolled'}</span>
                </div>
                <div className="flex items-center">
                  <BookOpen className="h-4 w-4 mr-2" />
                  <span>Grade: {patient.grade}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  <span>Age: {patient.age} years</span>
                </div>
                  <div className="flex items-center">
                    <Heart className="h-4 w-4 mr-2" />
                  <span>Condition: {patient.problem}</span>
                  </div>
              </div>
            </div>
          ))}
        </div>
        
        {!isLoadingPatients && !patientsError && sortedPatients.length === 0 && (
          <div className="p-12 text-center">
            <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No patients found</h3>
            <p className="text-gray-500 mb-4">
              {patients.length === 0 
                ? "You don't have any patients yet. Add your first patient to get started."
                : "Try adjusting your search criteria or filters"
              }
            </p>
            {patients.length === 0 && (
              <button
                onClick={() => setShowAddPatientModal(true)}
                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Patient
              </button>
            )}
          </div>
        )}
      </div>

      {/* Add Patient Modal */}
      {showAddPatientModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Add New Patient</h3>
              <button
                onClick={resetModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Child ID
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={childIdInput}
                    onChange={(e) => setChildIdInput(e.target.value)}
                    placeholder="Enter child ID"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                  <button
                    onClick={handleLookupChild}
                    disabled={isLoadingChild || !childIdInput.trim()}
                    className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoadingChild ? 'Looking...' : 'Lookup'}
                  </button>
                </div>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {childDetails && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Child Details</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p><strong>Name:</strong> {childDetails.name}</p>
                    <p><strong>Age:</strong> {childDetails.age} years</p>
                    <p><strong>Gender:</strong> {childDetails.gender}</p>
                    <p><strong>Grade:</strong> {childDetails.grade}</p>
                    <p><strong>Parent:</strong> {childDetails.parentName}</p>
                    <p><strong>Parent Email:</strong> {childDetails.parentEmail}</p>
                  </div>
                </div>
              )}

              {childDetails && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Medical Condition/Problem *
                  </label>
                  <select
                    value={selectedProblem}
                    onChange={(e) => setSelectedProblem(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="">Select a condition...</option>
                    {problemOptions.map((problem) => (
                      <option key={problem} value={problem}>
                        {problem}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={resetModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEnrollPatient}
                  disabled={!childDetails || isEnrolling}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isEnrolling ? 'Enrolling...' : 'Enroll Patient'}
                </button>
              </div>
            </div>
          </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnrolledChildren;