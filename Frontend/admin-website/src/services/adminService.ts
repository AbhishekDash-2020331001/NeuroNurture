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

export interface School {
  id: number;
  schoolName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  studentCount: number;
  emailVerified: boolean;
  isVerified: boolean;
  status: string;
  subscriptionStatus: string;
  childrenLimit: number;
  currentChildren: number;
  registrationDate: string;
  emailVerificationDate?: string;
}

export interface Doctor {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  specialization: string;
  licenseNumber: string;
  hospital: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  yearsOfExperience: number;
  emailVerified: boolean;
  isVerified: boolean;
  status: string;
  subscriptionStatus: string;
  patientLimit: number;
  currentPatients: number;
  registrationDate: string;
  emailVerificationDate?: string;
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
  },

  // School Management Methods
  async getAllSchools(): Promise<School[]> {
    try {
      const token = adminAuthService.getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${ADMIN_SERVICE_URL}/api/admin/schools`, {
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
      console.error('Error fetching schools:', error);
      return [];
    }
  },

  async getSchoolById(schoolId: number): Promise<School | null> {
    try {
      const token = adminAuthService.getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${ADMIN_SERVICE_URL}/api/admin/schools/${schoolId}`, {
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
      console.error('Error fetching school:', error);
      return null;
    }
  },

  async updateSchoolStatus(schoolId: number, status: 'active' | 'suspended'): Promise<School | null> {
    try {
      const token = adminAuthService.getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${ADMIN_SERVICE_URL}/api/admin/schools/${schoolId}/status`, {
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
      console.error('Error updating school status:', error);
      return null;
    }
  },

  // Doctor Management Methods
  async getAllDoctors(): Promise<Doctor[]> {
    try {
      const token = adminAuthService.getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${ADMIN_SERVICE_URL}/api/admin/doctors`, {
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
      console.error('Error fetching doctors:', error);
      return [];
    }
  },

  async getDoctorById(doctorId: number): Promise<Doctor | null> {
    try {
      const token = adminAuthService.getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${ADMIN_SERVICE_URL}/api/admin/doctors/${doctorId}`, {
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
      console.error('Error fetching doctor:', error);
      return null;
    }
  },

  async updateDoctorStatus(doctorId: number, status: 'active' | 'suspended'): Promise<Doctor | null> {
    try {
      const token = adminAuthService.getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${ADMIN_SERVICE_URL}/api/admin/doctors/${doctorId}/status`, {
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
      console.error('Error updating doctor status:', error);
      return null;
    }
  }
};
