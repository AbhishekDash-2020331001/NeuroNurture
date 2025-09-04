// Admin service for fetching data from the admin backend
const ADMIN_SERVICE_URL = 'http://localhost:8090';

export interface Child {
  id: number;
  name: string;
  gender: string;
  age: number;
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
      const response = await fetch(`${ADMIN_SERVICE_URL}/api/admin/parents`, {
        credentials: 'include'
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
      const response = await fetch(`${ADMIN_SERVICE_URL}/api/admin/parents/${parentId}`, {
        credentials: 'include'
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
      const response = await fetch(`${ADMIN_SERVICE_URL}/api/admin/parents/${parentId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'text/plain',
        },
        credentials: 'include',
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
