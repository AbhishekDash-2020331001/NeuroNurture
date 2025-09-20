import { taskService } from '@/shared/services/task/taskService';
import { AlertCircle, BookOpen, CheckCircle, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface Game {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
}

interface TaskForm {
  title: string;
  description: string;
  selectedGames: string[];
  startDate: string;
  endDate: string;
  sendNotifications: boolean;
}

interface ChildTaskAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  schoolId: number;
  childId: number;
  childName: string;
}

// Game mapping matching backend bit-mapping system
const availableGames: Game[] = [
  { id: 'Dance Doodle', name: 'Dance Doodle', description: 'Create art through movement', icon: '💃', category: 'Creative' },
  { id: 'Gaze Game', name: 'Gaze Game', description: 'Follow moving objects with your eyes', icon: '👁️', category: 'Cognitive' },
  { id: 'Gesture Game', name: 'Gesture Game', description: 'Control games with hand movements', icon: '✋', category: 'Motor Skills' },
  { id: 'Mirror Posture Game', name: 'Mirror Posture Game', description: 'Copy and maintain correct posture', icon: '🧍', category: 'Physical' },
  { id: 'Repeat With Me Game', name: 'Repeat With Me Game', description: 'Follow audio and visual patterns', icon: '🔄', category: 'Memory' }
];

const ChildTaskAssignmentModal: React.FC<ChildTaskAssignmentModalProps> = ({
  isOpen,
  onClose,
  schoolId,
  childId,
  childName
}) => {
  const [isCreating, setIsCreating] = useState(false);
  
  // Task creation form state
  const [taskForm, setTaskForm] = useState<TaskForm>({
    title: '',
    description: '',
    selectedGames: [],
    startDate: '',
    endDate: '',
    sendNotifications: true
  });
  
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setTaskForm({
        title: '',
        description: '',
        selectedGames: [],
        startDate: '',
        endDate: '',
        sendNotifications: true
      });
      setFormErrors({});
    }
  }, [isOpen]);

  const handleInputChange = (field: keyof TaskForm, value: any) => {
    setTaskForm(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!taskForm.title.trim()) {
      errors.title = 'Task title is required';
    }

    if (!taskForm.description.trim()) {
      errors.description = 'Task description is required';
    }

    if (taskForm.selectedGames.length === 0) {
      errors.selectedGames = 'Please select at least one game';
    }

    if (!taskForm.startDate) {
      errors.startDate = 'Start date is required';
    }

    if (!taskForm.endDate) {
      errors.endDate = 'End date is required';
    }

    if (taskForm.startDate && taskForm.endDate && new Date(taskForm.startDate) >= new Date(taskForm.endDate)) {
      errors.endDate = 'End date must be after start date';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsCreating(true);
    try {
      const request = {
        taskTitle: taskForm.title,
        taskDescription: taskForm.description,
        selectedGames: taskForm.selectedGames,
        childIds: [childId],
        startTime: taskForm.startDate + 'T00:00:00', // Convert to ISO format for LocalDateTime
        endTime: taskForm.endDate + 'T23:59:59' // Convert to ISO format for LocalDateTime
      };

      await taskService.createTasks(request, schoolId);
      onClose();
      
      // Show success message or refresh parent component
      alert('Task created successfully!');
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Failed to create task. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden">
        {/* Professional Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BookOpen className="h-6 w-6 text-blue-700" />
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-gray-900">Assign Task to {childName}</h3>
                <p className="text-gray-600 text-sm">Create a personalized learning experience for this child</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200"
            >
              <X className="h-6 w-6 text-gray-500" />
            </button>
          </div>
        </div>
        
        {/* Modal Content */}
        <div className="p-8 max-h-[calc(95vh-120px)] overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Child Information */}
            <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <div className="w-1 h-6 bg-blue-400 rounded-full mr-3"></div>
                Assignment Details
              </h4>
              <div className="flex items-center space-x-3 p-4 bg-white rounded-lg border border-blue-200">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <p className="text-lg font-semibold text-gray-900">{childName}</p>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                      ID: {childId}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">This task will be assigned specifically to {childName}</p>
                </div>
                <div className="flex items-center space-x-1 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  <span className="text-sm font-medium">Selected</span>
                </div>
              </div>
            </div>

            {/* Basic Task Information */}
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <div className="w-1 h-6 bg-gray-400 rounded-full mr-3"></div>
                Task Information
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
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-all duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isCreating}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2 ${
                  isCreating 
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
                }`}
              >
                {isCreating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Creating Task...</span>
                  </>
                ) : (
                  <span>Assign Task to {childName}</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChildTaskAssignmentModal;
