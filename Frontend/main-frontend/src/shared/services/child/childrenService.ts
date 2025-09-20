// Children Service for managing school children data
import { makeAuthenticatedSchoolRequest } from '../../utils/schoolApiUtils';

export interface SchoolChild {
  id: number;
  name: string;
  age: number;
  height: number;
  weight: number;
  grade: string;
  gender: string;
  dateOfBirth: string;
  parentName: string;
  parentEmail: string;
  parentAddress: string;
  enrollmentDate: string;
  lastActive: string;
  overallScore: number;
  gamesPlayed: number;
  tasksCompleted: number;
}

class ChildrenService {
  private baseUrl = 'http://localhost:8082/api/parents'; // Parent service URL

  // Get all children enrolled in a specific school
  async getChildrenBySchool(schoolId: number): Promise<SchoolChild[]> {
    try {
      const response = await makeAuthenticatedSchoolRequest(`${this.baseUrl}/schools/${schoolId}/children`);
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
      
      const children = await response.json();
      
      // Transform the data to match our frontend interface
      return children.map((child: any) => ({
        id: child.id,
        name: child.name,
        age: child.age || this.calculateAge(child.dateOfBirth),
        height: child.height || 0,
        weight: child.weight || 0,
        grade: child.grade || 'Not Assigned',
        gender: child.gender || 'Unknown',
        dateOfBirth: child.dateOfBirth,
        parentName: child.parentName || 'Unknown',
        parentEmail: child.parentEmail || 'Unknown',
        parentAddress: child.parentAddress || 'Unknown',
        enrollmentDate: this.formatDate(new Date()), // Since we don't have enrollment date in Child entity
        lastActive: this.formatDate(new Date()), // Since we don't have last active in Child entity
        overallScore: Math.floor(Math.random() * 30) + 70, // Mock score for now
        gamesPlayed: Math.floor(Math.random() * 20) + 10, // Mock games played
        tasksCompleted: Math.floor(Math.random() * 15) + 5 // Mock tasks completed
      }));
    } catch (error) {
      console.error('Error fetching children by school:', error);
      throw error;
    }
  }

  // Calculate age from date of birth
  private calculateAge(dateOfBirth: string): number {
    if (!dateOfBirth) return 0;
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  // Format date for display
  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}

export const childrenService = new ChildrenService();
