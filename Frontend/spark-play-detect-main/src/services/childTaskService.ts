export interface ChildTask {
  taskId: number;
  schoolId: number;
  childId: number;
  childName: string;
  gameId: number;
  selectedGames: string[];
  taskTitle: string;
  taskDescription: string;
  startTime: string;
  endTime: string;
  status: 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE';
  createdAt: string;
  updatedAt: string;
}

export interface ChildTaskResponse {
  tasks: ChildTask[];
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
}

const API_BASE_URL = 'http://localhost:8091/api/school';

export const childTaskService = {
  // Fetch all tasks assigned to a specific child
  async getTasksByChild(childId: string): Promise<ChildTaskResponse> {
    try {
      console.log(`Fetching tasks for child ID: ${childId}`);
      const response = await fetch(`${API_BASE_URL}/tasks/child/${childId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`HTTP error! status: ${response.status}, response: ${errorText}`);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const tasks: ChildTask[] = await response.json();
      console.log(`Received ${tasks.length} tasks for child ${childId}:`, tasks);

      // Calculate stats
      const totalTasks = tasks.length;
      const completedTasks = tasks.filter(task => task.status === 'COMPLETED').length;
      const pendingTasks = tasks.filter(task => task.status === 'ASSIGNED').length;
      const overdueTasks = tasks.filter(task => this.isTaskOverdue(task.endTime)).length;

      return {
        tasks,
        totalTasks,
        completedTasks,
        pendingTasks,
        overdueTasks
      };
    } catch (error) {
      console.error('Error fetching child tasks:', error);
      throw error;
    }
  },

  // Update task status (for when child starts/completes a task)
  async updateTaskStatus(taskId: number, childId: string, status: string): Promise<void> {
    try {
      console.log(`Updating task ${taskId} status to ${status} for child ${childId}`);
      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/status?status=${status}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`HTTP error! status: ${response.status}, response: ${errorText}`);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      console.log(`Successfully updated task ${taskId} status to ${status}`);
    } catch (error) {
      console.error('Error updating task status:', error);
      throw error;
    }
  },

  // Get available games mapping (matches school service bit mapping)
  getGameMapping(): Record<number, string> {
    return {
      1: 'Dance Doodle',        // 0th bit (2^0 = 1)
      2: 'Gaze Game',           // 1st bit (2^1 = 2)
      4: 'Gesture Game',         // 2nd bit (2^2 = 4)
      8: 'Mirror Posture Game',  // 3rd bit (2^3 = 8)
      16: 'Repeat With Me Game' // 4th bit (2^4 = 16)
    };
  },

  // Parse game ID to get selected games
  parseSelectedGames(gameId: number): string[] {
    const gameMapping = this.getGameMapping();
    const selectedGames: string[] = [];
    
    Object.keys(gameMapping).forEach(bit => {
      const bitValue = parseInt(bit);
      if ((gameId & bitValue) > 0) {
        selectedGames.push(gameMapping[bitValue]);
      }
    });
    
    return selectedGames;
  },

  // Format date for display
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  // Check if task is overdue
  isTaskOverdue(endTime: string): boolean {
    const now = new Date();
    const end = new Date(endTime);
    return now > end;
  },

  // Get status color for UI
  getStatusColor(status: string): string {
    switch (status) {
      case 'COMPLETED':
        return 'text-green-600 bg-green-100';
      case 'IN_PROGRESS':
        return 'text-blue-600 bg-blue-100';
      case 'OVERDUE':
        return 'text-red-600 bg-red-100';
      case 'ASSIGNED':
      default:
        return 'text-yellow-600 bg-yellow-100';
    }
  },

  // Get status icon
  getStatusIcon(status: string): string {
    switch (status) {
      case 'COMPLETED':
        return '✅';
      case 'IN_PROGRESS':
        return '🔄';
      case 'OVERDUE':
        return '⚠️';
      case 'ASSIGNED':
      default:
        return '📋';
    }
  }
};
