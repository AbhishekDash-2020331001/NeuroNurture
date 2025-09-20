// Task Service for managing school tasks
import { makeAuthenticatedSchoolRequest } from '../../utils/schoolApiUtils';

export interface TaskCreateRequest {
  taskTitle: string;
  taskDescription: string;
  startTime: string; // ISO format string for LocalDateTime
  endTime: string; // ISO format string for LocalDateTime
  childIds: number[];
  selectedGames: string[];
}

export interface ChildAssignment {
  childId: number;
  childName: string;
  status: string;
  lastUpdated: string;
}

export interface TaskResponse {
  taskId: number;
  schoolId: number;
  childId?: number; // Optional for grouped tasks
  childName?: string; // Optional for grouped tasks
  gameId: number;
  selectedGames: string[];
  taskTitle: string;
  taskDescription: string;
  startTime: string;
  endTime: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  
  // For grouped tasks
  assignedChildren?: ChildAssignment[];
  totalAssigned?: number;
  completedCount?: number;
}

export interface GameMapping {
  [key: string]: number;
}

class TaskService {
  private baseUrl = 'http://localhost:8091/api/school/tasks';

  // Create new tasks for multiple children
  async createTasks(request: TaskCreateRequest, schoolId: number): Promise<TaskResponse[]> {
    try {
      const response = await makeAuthenticatedSchoolRequest(`${this.baseUrl}/create?schoolId=${schoolId}`, {
        method: 'POST',
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`HTTP error! status: ${response.status}, response: ${errorText}`);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const responseText = await response.text();
        console.error('Response is not JSON:', responseText);
        throw new Error('Response is not JSON');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating tasks:', error);
      throw error;
    }
  }

  // Get all tasks for a school
  async getTasksBySchool(schoolId: number): Promise<TaskResponse[]> {
    try {
      const response = await makeAuthenticatedSchoolRequest(`${this.baseUrl}/school/${schoolId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching tasks by school:', error);
      throw error;
    }
  }

  // Get tasks for a specific child
  async getTasksByChild(childId: number): Promise<TaskResponse[]> {
    try {
      const response = await makeAuthenticatedSchoolRequest(`${this.baseUrl}/child/${childId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching tasks by child:', error);
      throw error;
    }
  }

  // Get tasks by school and child
  async getTasksBySchoolAndChild(schoolId: number, childId: number): Promise<TaskResponse[]> {
    try {
      const response = await makeAuthenticatedSchoolRequest(`${this.baseUrl}/school/${schoolId}/child/${childId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching tasks by school and child:', error);
      throw error;
    }
  }

  // Update task status
  async updateTaskStatus(taskId: number, status: string): Promise<TaskResponse> {
    try {
      const response = await makeAuthenticatedSchoolRequest(`${this.baseUrl}/${taskId}/status?status=${status}`, {
        method: 'PUT',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error updating task status:', error);
      throw error;
    }
  }

  // Delete a task
  async deleteTask(taskId: number): Promise<void> {
    try {
      const response = await makeAuthenticatedSchoolRequest(`${this.baseUrl}/${taskId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  }

  // Get available games
  async getAvailableGames(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/games`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching available games:', error);
      throw error;
    }
  }

  // Get game bit mapping
  async getGameBitMapping(): Promise<GameMapping> {
    try {
      const response = await fetch(`${this.baseUrl}/games/mapping`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching game bit mapping:', error);
      throw error;
    }
  }

  // Check service health
  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      return response.ok;
    } catch (error) {
      console.error('Task service health check failed:', error);
      return false;
    }
  }
}

export const taskService = new TaskService();
