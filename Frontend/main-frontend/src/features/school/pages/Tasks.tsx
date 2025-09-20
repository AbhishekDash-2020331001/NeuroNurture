import { useSchoolAuth } from '@/features/school/contexts/SchoolAuthContext';
import { childrenService, SchoolChild } from '@/shared/services/child/childrenService';
import { TaskCreateRequest, TaskResponse, taskService } from '@/shared/services/task/taskService';
import {
    AlertCircle,
    BookOpen,
    Calendar,
    CheckCircle,
    Clock,
    Eye,
    Loader2,
    Plus,
    Search,
    Trash2,
    Users,
    X
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Child {
  id: string;
  name: string;
  grade: string;
  age: number;
  parentName: string;
  enrollmentDate: string;
}

interface Game {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
}

interface TaskGame {
  gameId: string;
  gameName: string;
  isCompleted: boolean;
  bestScore?: number;
  playCount: number;
  lastPlayed?: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  assignedDate: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'expired';
  assignedTo: 'all' | 'Gentle Bloom' | 'Rising Star' | 'Bright Light' | string[];
  games: TaskGame[];
  totalAssigned: number;
  completedCount: number;
}

// Game mapping matching backend bit-mapping system
const availableGames: Game[] = [
  { id: 'Dance Doodle', name: 'Dance Doodle', description: 'Create art through movement', icon: '💃', category: 'Creative' },
  { id: 'Gaze Game', name: 'Gaze Game', description: 'Follow moving objects with your eyes', icon: '👁️', category: 'Cognitive' },
  { id: 'Gesture Game', name: 'Gesture Game', description: 'Control games with hand movements', icon: '✋', category: 'Motor Skills' },
  { id: 'Mirror Posture Game', name: 'Mirror Posture Game', description: 'Copy and maintain correct posture', icon: '🧍', category: 'Physical' },
  { id: 'Repeat With Me Game', name: 'Repeat With Me Game', description: 'Follow audio and visual patterns', icon: '🔄', category: 'Memory' }
];

const mockChildren: Child[] = [
  { id: '1', name: 'Emma Johnson', grade: 'Gentle Bloom', age: 6, parentName: 'Sarah Johnson', enrollmentDate: '2023-09-01' },
  { id: '2', name: 'Liam Smith', grade: 'Gentle Bloom', age: 6, parentName: 'Michael Smith', enrollmentDate: '2023-09-01' },
  { id: '3', name: 'Olivia Davis', grade: 'Gentle Bloom', age: 6, parentName: 'Jennifer Davis', enrollmentDate: '2023-09-01' },
  { id: '4', name: 'Noah Wilson', grade: 'Rising Star', age: 7, parentName: 'Robert Wilson', enrollmentDate: '2023-09-01' },
  { id: '5', name: 'Ava Brown', grade: 'Rising Star', age: 7, parentName: 'Lisa Brown', enrollmentDate: '2023-09-01' },
  { id: '6', name: 'William Taylor', grade: 'Rising Star', age: 7, parentName: 'David Taylor', enrollmentDate: '2023-09-01' },
  { id: '7', name: 'Sophia Anderson', grade: 'Rising Star', age: 7, parentName: 'Maria Anderson', enrollmentDate: '2023-09-01' },
  { id: '8', name: 'James Martinez', grade: 'Bright Light', age: 8, parentName: 'Carlos Martinez', enrollmentDate: '2023-09-01' },
  { id: '9', name: 'Isabella Garcia', grade: 'Bright Light', age: 8, parentName: 'Ana Garcia', enrollmentDate: '2023-09-01' },
  { id: '10', name: 'Benjamin Rodriguez', grade: 'Bright Light', age: 8, parentName: 'Jose Rodriguez', enrollmentDate: '2023-09-01' },
  { id: '11', name: 'Mia Lopez', grade: 'Bright Light', age: 9, parentName: 'Carmen Lopez', enrollmentDate: '2023-09-01' },
  { id: '12', name: 'Lucas Gonzalez', grade: 'Bright Light', age: 9, parentName: 'Manuel Gonzalez', enrollmentDate: '2023-09-01' },
  { id: '13', name: 'Charlotte Perez', grade: 'Bright Light', age: 9, parentName: 'Rosa Perez', enrollmentDate: '2023-09-01' },
  { id: '14', name: 'Mason Torres', grade: 'Bright Light', age: 9, parentName: 'Juan Torres', enrollmentDate: '2023-09-01' },
  { id: '15', name: 'Amelia Flores', grade: 'Bright Light', age: 9, parentName: 'Elena Flores', enrollmentDate: '2023-09-01' }
];

const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Cognitive Development Task',
    description: 'Complete cognitive and motor skills games to improve focus and coordination',
    assignedDate: '2024-01-20',
    startDate: '2024-01-20',
    endDate: '2024-01-27',
    status: 'active',
    assignedTo: 'Rising Star',
    games: [
      { gameId: 'gaze-tracking', gameName: 'Gaze Tracking', isCompleted: true, bestScore: 85, playCount: 3, lastPlayed: '2024-01-22' },
      { gameId: 'gesture-control', gameName: 'Gesture Control', isCompleted: true, bestScore: 92, playCount: 2, lastPlayed: '2024-01-23' },
      { gameId: 'mirror-posture', gameName: 'Mirror Posture', isCompleted: false, playCount: 0 }
    ],
    totalAssigned: 15,
    completedCount: 8
  },
  {
    id: '2',
    title: 'Memory and Creativity Task',
    description: 'Enhance memory skills and creative expression through interactive games',
    assignedDate: '2024-01-21',
    startDate: '2024-01-21',
    endDate: '2024-01-28',
    status: 'active',
    assignedTo: 'Bright Light',
    games: [
      { gameId: 'repeat-with-me', gameName: 'Repeat With Me', isCompleted: false, playCount: 0 },
      { gameId: 'dance-doodle', gameName: 'Dance Doodle', isCompleted: false, playCount: 0 }
    ],
    totalAssigned: 12,
    completedCount: 0
  },
  {
    id: '3',
    title: 'Physical Coordination Task',
    description: 'Improve physical coordination and posture through movement-based games',
    assignedDate: '2024-01-18',
    startDate: '2024-01-18',
    endDate: '2024-01-25',
    status: 'completed',
    assignedTo: 'Bright Light',
    games: [
      { gameId: 'mirror-posture', gameName: 'Mirror Posture', isCompleted: true, bestScore: 78, playCount: 4, lastPlayed: '2024-01-24' },
      { gameId: 'dance-doodle', gameName: 'Dance Doodle', isCompleted: true, bestScore: 88, playCount: 3, lastPlayed: '2024-01-24' },
      { gameId: 'gesture-control', gameName: 'Gesture Control', isCompleted: true, bestScore: 95, playCount: 2, lastPlayed: '2024-01-25' }
    ],
    totalAssigned: 18,
    completedCount: 18
  },
  {
    id: '4',
    title: 'Focus and Attention Task',
    description: 'Develop focus and attention through gaze tracking and pattern recognition',
    assignedDate: '2024-01-19',
    startDate: '2024-01-19',
    endDate: '2024-01-26',
    status: 'expired',
    assignedTo: 'Bright Light',
    games: [
      { gameId: 'gaze-tracking', gameName: 'Gaze Tracking', isCompleted: true, bestScore: 72, playCount: 2, lastPlayed: '2024-01-21' },
      { gameId: 'repeat-with-me', gameName: 'Repeat With Me', isCompleted: false, playCount: 1, lastPlayed: '2024-01-20' }
    ],
    totalAssigned: 12,
    completedCount: 5
  }
];

const Tasks: React.FC = () => {
  const { school } = useSchoolAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [childSearchTerm, setChildSearchTerm] = useState('');
  
  // Real data state
  const [tasks, setTasks] = useState<TaskResponse[]>([]);
  const [children, setChildren] = useState<SchoolChild[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [deletingTaskId, setDeletingTaskId] = useState<number | null>(null);
  
  // Task creation form state
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    assignmentType: 'grade',
    gradeLevel: '',
    selectedChildren: [] as number[],
    selectedGames: [] as string[],
    startDate: '',
    endDate: '',
    sendNotifications: true
  });
  
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      if (!school?.id) return;
      
      setIsLoading(true);
      try {
        console.log('Fetching data for school ID:', school.id);
        
        const [tasksData, childrenData] = await Promise.all([
          taskService.getTasksBySchool(parseInt(school.id)).catch(err => {
            console.error('Error fetching tasks:', err);
            return [];
          }),
          childrenService.getChildrenBySchool(parseInt(school.id)).catch(err => {
            console.error('Error fetching children:', err);
            // Return mock children for testing if API fails
            return [
              { id: 1, name: 'Emma Johnson', grade: 'Gentle Bloom', age: 6, parentName: 'Sarah Johnson', parentEmail: 'sarah@email.com', parentAddress: '123 Main St', enrollmentDate: '2023-09-01', lastActive: '2024-01-15', overallScore: 85, gamesPlayed: 15, tasksCompleted: 8, height: 120, weight: 25, gender: 'Female', dateOfBirth: '2018-03-15' },
              { id: 2, name: 'Liam Smith', grade: 'Rising Star', age: 7, parentName: 'Michael Smith', parentEmail: 'michael@email.com', parentAddress: '456 Oak Ave', enrollmentDate: '2023-09-01', lastActive: '2024-01-14', overallScore: 92, gamesPlayed: 18, tasksCompleted: 12, height: 125, weight: 28, gender: 'Male', dateOfBirth: '2017-05-20' },
              { id: 3, name: 'Olivia Davis', grade: 'Bright Light', age: 8, parentName: 'Jennifer Davis', parentEmail: 'jennifer@email.com', parentAddress: '789 Pine St', enrollmentDate: '2023-09-01', lastActive: '2024-01-16', overallScore: 78, gamesPlayed: 12, tasksCompleted: 6, height: 130, weight: 30, gender: 'Female', dateOfBirth: '2016-08-10' }
            ];
          })
        ]);
        
        console.log('Tasks data:', tasksData);
        console.log('Children data:', childrenData);
        
        setTasks(tasksData);
        setChildren(childrenData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [school?.id]);

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.taskTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.taskDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.taskId.toString().includes(searchTerm);
    
    let matchesStatus = true;
    if (statusFilter === 'active') {
      matchesStatus = new Date(task.startTime) <= new Date() && new Date(task.endTime) > new Date();
    } else if (statusFilter === 'upcoming') {
      matchesStatus = new Date(task.startTime) > new Date();
    } else if (statusFilter === 'ended') {
      matchesStatus = new Date(task.endTime) <= new Date();
    }
    
    return matchesSearch && matchesStatus;
  });

  const getTaskStatus = (endTime: string) => {
    return new Date(endTime) > new Date() ? 'active' : 'ended';
  };

  const getStatusColor = (endTime: string) => {
    const status = getTaskStatus(endTime);
    return status === 'active' 
      ? 'text-green-600 bg-green-100' 
      : 'text-gray-600 bg-gray-100';
  };

  const getStatusIcon = (endTime: string) => {
    const status = getTaskStatus(endTime);
    return status === 'active' 
      ? <Clock className="h-4 w-4" />
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
    setTaskForm(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!taskForm.title.trim()) errors.title = 'Task title is required';
    if (!taskForm.description.trim()) errors.description = 'Task description is required';
    if (taskForm.selectedGames.length === 0) errors.selectedGames = 'Please select at least one game';
    if (!taskForm.startDate) errors.startDate = 'Start date is required';
    if (!taskForm.endDate) errors.endDate = 'End date is required';
    
    // Validate that end date is after start date
    if (taskForm.startDate && taskForm.endDate && taskForm.startDate >= taskForm.endDate) {
      errors.endDate = 'End date must be after start date';
    }
    
    if (taskForm.assignmentType === 'grade' && !taskForm.gradeLevel) {
      errors.gradeLevel = 'Grade level is required for grade assignments';
    }
    
    if (taskForm.assignmentType === 'individual' && taskForm.selectedChildren.length === 0) {
      errors.selectedChildren = 'Please select at least one child for individual assignment';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !school?.id) return;
    
    setIsCreating(true);
    try {
      // Prepare child IDs based on assignment type
      let childIds: number[] = [];
      
      if (taskForm.assignmentType === 'grade') {
        // Get children by grade
        const gradeChildren = children.filter(child => {
          return child.grade === taskForm.gradeLevel;
        });
        childIds = gradeChildren.map(child => child.id);
      } else {
        childIds = taskForm.selectedChildren;
      }
      
      if (childIds.length === 0) {
        setFormErrors({ assignmentType: 'No children found for the selected criteria' });
        return;
      }
      
      // Create task request
      const taskRequest: TaskCreateRequest = {
        taskTitle: taskForm.title,
        taskDescription: taskForm.description,
        startTime: new Date(taskForm.startDate).toISOString(),
        endTime: new Date(taskForm.endDate).toISOString(),
        childIds: childIds,
        selectedGames: taskForm.selectedGames
      };
      
      // Create tasks via API
      const createdTasks = await taskService.createTasks(taskRequest, parseInt(school.id));
      
      // Update local state
      setTasks(prev => [...prev, ...createdTasks]);
      
             // Close modal and reset form
       setShowCreateModal(false);
       resetForm();
      setFormErrors({});
      
    } catch (error) {
      console.error('Error creating tasks:', error);
      setFormErrors({ submit: 'Failed to create tasks. Please try again.' });
    } finally {
      setIsCreating(false);
    }
  };

  const resetForm = () => {
    setTaskForm({
      title: '',
      description: '',
      assignmentType: 'grade',
      gradeLevel: '',
      selectedChildren: [],
      selectedGames: [],
      startDate: '',
      endDate: '',
      sendNotifications: true
    });
    setFormErrors({});
  };

  // Helper functions for assignment calculations
  const getChildrenByGrade = (grade: string) => {
    return children.filter(child => child.grade === grade);
  };

  const getAssignmentCount = () => {
    if (taskForm.assignmentType === 'grade' && taskForm.gradeLevel) {
      return getChildrenByGrade(taskForm.gradeLevel).length;
    } else if (taskForm.assignmentType === 'individual') {
      return taskForm.selectedChildren.length;
    }
    return 0;
  };

  const getAssignmentPreview = () => {
    if (taskForm.assignmentType === 'grade' && taskForm.gradeLevel) {
      const gradeChildren = getChildrenByGrade(taskForm.gradeLevel);
      return gradeChildren.map(child => ({
        id: child.id,
        name: child.name,
        grade: child.grade,
        parentName: child.parentName
      }));
    } else if (taskForm.assignmentType === 'individual') {
      return taskForm.selectedChildren.map(childId => {
        const child = children.find(c => c.id === childId);
        return child ? {
          id: child.id,
          name: child.name,
          grade: child.grade,
          parentName: child.parentName
        } : null;
      }).filter(Boolean);
    }
    return [];
  };

  // Filter children based on search term
  const getFilteredChildren = () => {
    console.log('Available children for filtering:', children);
    if (!childSearchTerm.trim()) return children;
    
    const searchTerm = childSearchTerm.toLowerCase().trim();
    
    return children.filter(child => 
      child.name.toLowerCase().includes(searchTerm) ||
      child.parentName.toLowerCase().includes(searchTerm) ||
      child.grade.toLowerCase().includes(searchTerm) ||
      child.id.toString().includes(searchTerm) // Search by child ID
    );
  };

  // Get minimum end date (next day after start date)
  const getMinEndDate = () => {
    if (!taskForm.startDate) return '';
    const startDate = new Date(taskForm.startDate);
    const nextDay = new Date(startDate);
    nextDay.setDate(startDate.getDate() + 1);
    return nextDay.toISOString().split('T')[0];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="space-y-6 p-4">
        {/* Professional Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
              <h1 className="text-xl font-bold text-gray-900">Task Management</h1>
              <p className="text-gray-600 text-sm mt-1">
            Create, assign, and track tasks for {school.currentChildren} children
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-4 py-2 bg-gray-800 text-white text-sm font-medium rounded-lg hover:bg-gray-900 transition-all duration-200"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create New Task
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
                                        <p className="text-lg font-bold text-green-800">{tasks.filter(t => new Date(t.startTime) <= new Date() && new Date(t.endTime) > new Date()).length}</p>
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
                                            {tasks.filter(t => new Date(t.startTime) > new Date()).length}
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
                                            {tasks.filter(t => new Date(t.endTime) <= new Date()).length}
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
                    placeholder="Search by task title or ID..."
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
                <option value="all">All Tasks</option>
                <option value="active">Active Tasks</option>
                <option value="upcoming">Upcoming Tasks</option>
                <option value="ended">Ended Tasks</option>
             </select>
          </div>
        </div>
      </div>


      {/* Tasks List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-white border-b border-gray-200 px-4 py-3">
            <h2 className="text-lg font-bold text-gray-900">
            Tasks ({filteredTasks.length})
          </h2>
        </div>
        
                    <div className="divide-y divide-gray-100 space-y-2">
            {isLoading ? (
              <div className="p-6 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                <p className="text-gray-500">Loading tasks...</p>
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="p-6 text-center">
                <div className="mx-auto w-16 h-16 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-3">
                  <BookOpen className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">No tasks found</h3>
                <p className="text-gray-500 text-sm">Create your first task to get started</p>
              </div>
            ) : (
              filteredTasks.map((task, index) => (
                <div key={task.taskId} className={`p-4 hover:bg-gray-50 transition-all duration-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-900">{task.taskTitle}</h3>
                        <div className={`px-3 py-1 rounded text-xs font-bold ${getStatusColor(task.endTime)}`}>
                       <div className="flex items-center space-x-1">
                            {getStatusIcon(task.endTime)}
                            <span>{getTaskStatus(task.endTime).charAt(0).toUpperCase() + getTaskStatus(task.endTime).slice(1)}</span>
                       </div>
                     </div>
                  </div>
                  
                      <p className="text-sm text-gray-600 mb-3">{task.taskDescription}</p>
                  
                                                         {/* Games List */}
                    <div className="mt-3">
                      <p className="text-sm font-bold text-gray-700 mb-2">Games in this task:</p>
                      <div className="flex flex-wrap gap-2">
                        {task.selectedGames.map((gameName) => {
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
                        <span className="font-medium">Period: {formatDate(task.startTime)} - {formatDate(task.endTime)}</span>
                     </span>
                      <span className="flex items-center px-3 py-1 bg-gray-100 rounded border border-gray-200">
                        <Users className="h-4 w-4 mr-2 text-gray-600" />
                        <span className="font-medium">
                          {task.assignedChildren ? (
                            `${task.completedCount || 0}/${task.totalAssigned || 0} children completed`
                          ) : (
                            `Assigned to: ${task.childName}`
                          )}
                        </span>
                     </span>
                   </div>
                   
                    {/* Assigned Children List for Grouped Tasks */}
                    {task.assignedChildren && task.assignedChildren.length > 0 && (
                      <div className="mt-4 p-4 bg-gray-50 rounded border border-gray-200">
                        <h5 className="text-sm font-bold text-gray-700 mb-3">Assigned Children:</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                          {task.assignedChildren.map((child) => (
                            <div key={child.childId} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                              <div className="flex items-center space-x-2">
                                <span className="text-sm font-bold text-gray-900">{child.childName}</span>
                                <span className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs font-bold rounded-full">
                                  ID: {child.childId}
                                </span>
                              </div>
                              <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                                child.status === 'COMPLETED' 
                                  ? 'bg-green-100 text-green-800' 
                                  : child.status === 'IN_PROGRESS'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {child.status.replace('_', ' ')}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
                
                  <div className="flex space-x-3 ml-4">
                   <button 
                      onClick={() => navigate(`/school/tasks/${task.taskId}`)}
                      className="px-4 py-2 bg-gray-800 text-white text-sm font-medium rounded hover:bg-gray-900 transition-all duration-200 flex items-center space-x-2" 
                     title="View Details"
                   >
                     <Eye className="h-4 w-4" />
                      <span>View</span>
                   </button>
                    <button 
                      onClick={async () => {
                        if (confirm('Are you sure you want to delete this task? This will remove all task assignments for this task ID.')) {
                          setDeletingTaskId(task.taskId);
                          try {
                            await taskService.deleteTask(task.taskId);
                            setTasks(prev => prev.filter(t => t.taskId !== task.taskId));
                          } catch (error) {
                            console.error('Error deleting task:', error);
                            alert('Failed to delete task. Please try again.');
                          } finally {
                            setDeletingTaskId(null);
                          }
                        }
                      }}
                      disabled={deletingTaskId === task.taskId}
                      className={`px-4 py-2 text-white text-sm font-medium rounded transition-all duration-200 flex items-center space-x-2 ${
                        deletingTaskId === task.taskId 
                          ? 'bg-gray-400 cursor-not-allowed' 
                          : 'bg-red-600 hover:bg-red-700'
                      }`}
                      title={deletingTaskId === task.taskId ? "Deleting task..." : "Delete Task"}
                    >
                      {deletingTaskId === task.taskId ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                    <Trash2 className="h-4 w-4" />
                      )}
                      <span>{deletingTaskId === task.taskId ? 'Deleting...' : 'Delete'}</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
        </div>
      </div>

             {/* Create Task Modal */}
       {showCreateModal && (
         <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden">
                           {/* Professional Header */}
              <div className="bg-white border-b border-gray-200 px-8 py-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <BookOpen className="h-6 w-6 text-gray-700" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-semibold text-gray-900">Create New Task</h3>
                      <p className="text-gray-600 text-sm">Design engaging game-based learning experiences</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200"
                  >
                    <X className="h-6 w-6 text-gray-500" />
                  </button>
                </div>
              </div>
             
             {/* Modal Content */}
             <div className="p-8 max-h-[calc(95vh-120px)] overflow-y-auto">
            
            <form onSubmit={handleSubmit} className="space-y-6">
                             {/* Basic Task Information */}
                               <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <div className="w-1 h-6 bg-gray-400 rounded-full mr-3"></div>
                    Basic Task Information
                  </h4>
                                   <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Task Title *
                      </label>
                      <input
                        type="text"
                        placeholder="Enter task title..."
                        value={taskForm.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 ${
                          formErrors.title ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                        }`}
                        required
                      />
                      {formErrors.title && (
                        <p className="mt-2 text-sm text-red-600 flex items-center">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {formErrors.title}
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Task Description *
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Describe what this task aims to achieve..."
                        value={taskForm.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 ${
                          formErrors.description ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                        }`}
                        required
                      />
                      {formErrors.description && (
                        <p className="mt-2 text-sm text-red-600 flex items-center">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {formErrors.description}
                        </p>
                      )}
                    </div>
                  </div>
               </div>
              
                             {/* Game Selection */}
                               <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <div className="w-1 h-6 bg-gray-400 rounded-full mr-3"></div>
                    Select Games for this Task *
                  </h4>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                   {availableGames.map((game) => (
                     <label key={game.id} className={`group relative flex items-start space-x-3 p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                       taskForm.selectedGames.includes(game.id) 
                         ? 'border-green-500 bg-green-50 shadow-md' 
                         : 'border-gray-200 hover:border-green-300 hover:bg-green-25'
                     }`}>
                       <input
                         type="checkbox"
                         checked={taskForm.selectedGames.includes(game.id)}
                         onChange={(e) => {
                           if (e.target.checked) {
                             handleInputChange('selectedGames', [...taskForm.selectedGames, game.id]);
                           } else {
                             handleInputChange('selectedGames', taskForm.selectedGames.filter(id => id !== game.id));
                           }
                         }}
                         className="h-5 w-5 text-green-600 focus:ring-green-500 border-gray-300 rounded mt-1"
                       />
                       <div className="flex-1">
                         <div className="flex items-center space-x-3 mb-2">
                           <span className="text-3xl group-hover:scale-110 transition-transform duration-200">{game.icon}</span>
                           <div>
                             <span className="text-sm font-semibold text-gray-900">{game.name}</span>
                             <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                               {game.category}
                             </span>
                           </div>
                         </div>
                         <p className="text-sm text-gray-600 leading-relaxed">{game.description}</p>
                       </div>
                       {taskForm.selectedGames.includes(game.id) && (
                         <div className="absolute top-2 right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                           <CheckCircle className="h-4 w-4 text-white" />
                         </div>
                       )}
                     </label>
                   ))}
                 </div>
                 {formErrors.selectedGames && (
                   <p className="mt-3 text-sm text-red-600 flex items-center bg-red-50 p-3 rounded-lg border border-red-200">
                     <AlertCircle className="h-4 w-4 mr-2" />
                     {formErrors.selectedGames}
                   </p>
                 )}
               </div>
              
                             {/* Assignment Options */}
               <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                 <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                   <div className="w-1 h-6 bg-gray-400 rounded-full mr-3"></div>
                   Assignment Options
                 </h4>
                 
                 <div className="space-y-6">
                   <div>
                     <label className="block text-sm font-semibold text-gray-700 mb-3">
                       Assignment Type *
                     </label>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <label className={`relative flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                         taskForm.assignmentType === 'grade' 
                           ? 'border-blue-500 bg-blue-50 shadow-md' 
                           : 'border-gray-200 hover:border-blue-300 hover:bg-blue-25'
                       }`}>
                         <input
                           type="radio"
                           name="assignmentType"
                           value="grade"
                           checked={taskForm.assignmentType === 'grade'}
                           onChange={(e) => handleInputChange('assignmentType', e.target.value)}
                           className="mr-3 text-blue-600 focus:ring-blue-500"
                         />
                         <div>
                           <span className="text-sm font-semibold text-gray-900">Assign to entire grade level</span>
                           <p className="text-xs text-gray-500 mt-1">All children in a specific grade will receive this task</p>
                         </div>
                       </label>
                                                <label className={`relative flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                           taskForm.assignmentType === 'individual' 
                             ? 'border-blue-500 bg-blue-50 shadow-md' 
                             : 'border-gray-200 hover:border-blue-300 hover:bg-blue-25'
                       }`}>
                         <input
                           type="radio"
                           name="assignmentType"
                           value="individual"
                           checked={taskForm.assignmentType === 'individual'}
                           onChange={(e) => handleInputChange('assignmentType', e.target.value)}
                           className="mr-3 text-blue-600 focus:ring-blue-500"
                         />
                         <div>
                           <span className="text-sm font-semibold text-gray-900">Assign to specific children</span>
                           <p className="text-xs text-gray-500 mt-1">Select individual children to receive this task</p>
                         </div>
                       </label>
                     </div>
                   </div>
                   
                                       {taskForm.assignmentType === 'grade' && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Grade Level *
                        </label>
                        <select 
                          value={taskForm.gradeLevel}
                          onChange={(e) => handleInputChange('gradeLevel', e.target.value)}
                          className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 ${
                            formErrors.gradeLevel ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <option value="">Select grade</option>
                          <option value="Gentle Bloom">Gentle Bloom 🌱</option>
                          <option value="Rising Star">Rising Star ⭐</option>
                          <option value="Bright Light">Bright Light ✨</option>
                        </select>
                        {formErrors.gradeLevel && (
                          <p className="mt-2 text-sm text-red-600 flex items-center">
                            <AlertCircle className="h-4 w-4 mr-1" />
                            {formErrors.gradeLevel}
                          </p>
                        )}
                      </div>
                    )}
                   
                   {/* Individual Child Selection with Search */}
                   {taskForm.assignmentType === 'individual' && (
                     <div>
                       <label className="block text-sm font-semibold text-gray-700 mb-3">
                         Select Children *
                       </label>
                       
                       {/* Search Bar */}
                       <div className="relative mb-4">
                         <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                         <input
                           type="text"
                           placeholder="Search children by name, parent, grade, or child ID..."
                           value={childSearchTerm}
                           onChange={(e) => setChildSearchTerm(e.target.value)}
                           className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200"
                         />
                       </div>
                       
                       {/* Search Hint */}
                       <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                         <p className="text-xs text-blue-700">
                           💡 <strong>Search tip:</strong> You can search by child name, parent name, grade, or child ID. 
                           For example, try typing "1" to find child with ID 1, or "Emma" to find by name.
                         </p>
                       </div>
                       
                       {/* Children List */}
                       <div className="border-2 border-gray-200 rounded-xl p-4 max-h-64 overflow-y-auto bg-white">
                         {isLoading ? (
                           <div className="text-center py-8 text-gray-500">
                             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                             <p>Loading children...</p>
                           </div>
                         ) : children.length === 0 ? (
                           <div className="text-center py-8 text-gray-500">
                             <Users className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                             <p>No children enrolled in this school</p>
                             <p className="text-xs text-gray-400 mt-1">Contact the school administrator to enroll children</p>
                           </div>
                         ) : (
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                           {getFilteredChildren().map((child) => (
                                                            <label key={child.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer">
                               <input
                                 type="checkbox"
                                 checked={taskForm.selectedChildren.includes(child.id)}
                                 onChange={(e) => {
                                   if (e.target.checked) {
                                     handleInputChange('selectedChildren', [...taskForm.selectedChildren, child.id]);
                                   } else {
                                     handleInputChange('selectedChildren', taskForm.selectedChildren.filter(id => id !== child.id));
                                   }
                                 }}
                                 className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                               />
                               <div className="flex-1">
                                   <div className="flex items-center space-x-2">
                                 <p className="text-sm font-semibold text-gray-900">{child.name}</p>
                                     <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                                       ID: {child.id}
                                     </span>
                                   </div>
                                   <p className="text-xs text-gray-500">{child.grade} • {child.parentName}</p>
                               </div>
                             </label>
                           ))}
                         </div>
                         )}
                         
                         {!isLoading && children.length > 0 && getFilteredChildren().length === 0 && (
                           <div className="text-center py-8 text-gray-500">
                             <Search className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                             <p>No children found matching your search</p>
                           </div>
                         )}
                       </div>
                       
                       {formErrors.selectedChildren && (
                         <p className="mt-2 text-sm text-red-600 flex items-center bg-red-50 p-3 rounded-lg border border-red-200">
                           <AlertCircle className="h-4 w-4 mr-2" />
                           {formErrors.selectedChildren}
                         </p>
                       )}
                     </div>
                   )}
                 </div>
               </div>
              
                             {/* Timeline */}
               <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                 <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                   <div className="w-1 h-6 bg-gray-400 rounded-full mr-3"></div>
                   Task Timeline
                 </h4>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div>
                     <label className="block text-sm font-semibold text-gray-700 mb-2">
                       Start Date *
                     </label>
                     <input
                       type="date"
                       value={taskForm.startDate}
                       onChange={(e) => handleInputChange('startDate', e.target.value)}
                       min={new Date().toISOString().split('T')[0]}
                                                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 ${
                           formErrors.startDate ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                         }`}
                       required
                     />
                     {formErrors.startDate && (
                       <p className="mt-2 text-sm text-red-600 flex items-center">
                         <AlertCircle className="h-4 w-4 mr-1" />
                         {formErrors.startDate}
                       </p>
                     )}
                   </div>
                   
                                       <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        End Date *
                      </label>
                      <input
                        type="date"
                        value={taskForm.endDate}
                        onChange={(e) => handleInputChange('endDate', e.target.value)}
                        min={getMinEndDate() || new Date().toISOString().split('T')[0]}
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 ${
                          formErrors.endDate ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                        }`}
                        required
                      />
                      {formErrors.endDate && (
                        <p className="mt-2 text-sm text-red-600 flex items-center">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {formErrors.endDate}
                        </p>
                      )}
                      {taskForm.startDate && (
                        <p className="mt-2 text-xs text-gray-500">
                          End date must be after {new Date(taskForm.startDate).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </p>
                      )}
                    </div>
                 </div>
               </div>
              
                             {/* Assignment Preview */}
               {(taskForm.assignmentType === 'grade' && taskForm.gradeLevel) || 
                (taskForm.assignmentType === 'individual' && taskForm.selectedChildren.length > 0) ? (
                 <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                   <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                     <div className="w-1 h-6 bg-gray-400 rounded-full mr-3"></div>
                     Assignment Preview
                   </h4>
                   <div className="bg-white border-2 border-gray-200 rounded-xl p-6 shadow-sm">
                     <div className="flex items-center justify-between mb-4">
                       <div className="flex items-center space-x-3">
                         <div className="p-2 bg-gray-100 rounded-lg">
                           <Users className="h-5 w-5 text-gray-600" />
                         </div>
                         <span className="text-lg font-semibold text-gray-900">
                           {getAssignmentCount()} children will receive this task
                         </span>
                       </div>
                                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                           taskForm.assignmentType === 'grade' 
                             ? 'bg-blue-100 text-blue-800' 
                             : 'bg-gray-100 text-gray-800'
                         }`}>
                         {taskForm.assignmentType === 'grade' ? 'Grade Assignment' : 'Individual Assignment'}
                       </span>
                     </div>
                     
                     <div className="mb-4">
                       <h5 className="text-sm font-semibold text-gray-700 mb-2">Assigned Children:</h5>
                       <div className="max-h-32 overflow-y-auto">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                           {getAssignmentPreview().map((child) => (
                             <div key={child?.id} className="flex items-center space-x-2 text-sm p-2 bg-gray-50 rounded-lg">
                               <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                               <span className="font-medium text-gray-900">{child?.name}</span>
                               <span className="text-gray-600">({child?.grade.replace('grade_', 'Grade ')})</span>
                             </div>
                           ))}
                         </div>
                       </div>
                     </div>
                     
                                            {/* Games Summary */}
                       {taskForm.selectedGames.length > 0 && (
                         <div className="pt-4 border-t border-gray-200">
                         <h5 className="text-sm font-semibold text-gray-700 mb-3">Games included: {taskForm.selectedGames.length}</h5>
                         <div className="flex flex-wrap gap-2">
                           {taskForm.selectedGames.map(gameId => {
                             const game = availableGames.find(g => g.id === gameId);
                             return (
                               <span key={gameId} className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-800 text-sm font-medium rounded-full border border-gray-200">
                                 <span className="mr-2">{game?.icon}</span>
                                 {game?.name}
                               </span>
                             );
                           })}
                         </div>
                       </div>
                     )}
                   </div>
                 </div>
               ) : null}

                              {/* Additional Settings */}
               <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                 <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                   <div className="w-1 h-6 bg-gray-400 rounded-full mr-3"></div>
                   Additional Settings
                 </h4>
                 
                 <div className="space-y-4">
                                        <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200">
                     <div>
                       <label className="text-sm font-semibold text-gray-700">Send Notifications</label>
                       <p className="text-xs text-gray-500 mt-1">Notify children and parents about new task</p>
                     </div>
                     <label className="relative inline-flex items-center cursor-pointer">
                       <input 
                         type="checkbox" 
                         className="sr-only peer"
                         checked={taskForm.sendNotifications}
                         onChange={(e) => handleInputChange('sendNotifications', e.target.checked)}
                       />
                                                <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                     </label>
                   </div>
                 </div>
               </div>
              
                             {/* Form Actions */}
               <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                 <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4">
                   <button
                     type="button"
                     onClick={resetForm}
                     className="px-8 py-3 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm"
                   >
                     Reset Form
                   </button>
                   <button
                     type="button"
                     onClick={() => setShowCreateModal(false)}
                     className="px-8 py-3 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm"
                   >
                     Cancel
                   </button>
                   <button
                     type="submit"
                     disabled={isCreating}
                     className="px-8 py-3 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                   >
                     {isCreating ? (
                       <>
                         <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline"></div>
                         Creating...
                       </>
                     ) : (
                       <>
                     <Plus className="h-4 w-4 mr-2 inline" />
                     Create Task
                       </>
                     )}
                   </button>
                 </div>
               </div>
                         </form>
           </div>
         </div>
       </div>
     )}

      {/* Global Loading Overlay for Task Deletion */}
      {deletingTaskId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md mx-4">
            <div className="flex flex-col items-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Deleting Task</h3>
                <p className="text-gray-600 text-sm">
                  Removing task and all associated game sessions...
                </p>
                <p className="text-gray-500 text-xs mt-2">
                  This may take a few moments
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default Tasks;
