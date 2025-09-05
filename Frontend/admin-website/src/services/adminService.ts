// Admin service for fetching data from the admin backend
import { adminAuthService } from './adminAuthService';

const ADMIN_SERVICE_URL = 'http://localhost:8090';

export interface Child {
  id: number;
  name: string;
  gender: string;
  dateOfBirth?: string;
  age?: number; // Fallback for backward compatibility
  height: number;
  weight: number;
}

export interface Parent {
  id: number;
  name: string;
  email: string;
  address: string;
  numberOfChildren: number;
  suspectedAutisticChildCount: number;
  status: 'active' | 'suspended';
  children: Child[];
}

export const adminService = {
  // Fetch all parents with their children
  async getAllParents(): Promise<Parent[]> {
    try {
      const token = adminAuthService.getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${ADMIN_SERVICE_URL}/api/admin/parents`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching parents:', error);
      return [];
    }
  },

  // Fetch a specific parent by ID
  async getParentById(parentId: number): Promise<Parent | null> {
    try {
      const token = adminAuthService.getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${ADMIN_SERVICE_URL}/api/admin/parents/${parentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching parent:', error);
      return null;
    }
  },

  // Update parent status
  async updateParentStatus(parentId: number, status: 'active' | 'suspended'): Promise<Parent | null> {
    try {
      const token = adminAuthService.getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${ADMIN_SERVICE_URL}/api/admin/parents/${parentId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'text/plain',
        },
        body: status
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating parent status:', error);
      return null;
    }
  }
};
