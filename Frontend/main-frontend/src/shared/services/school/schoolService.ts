export interface SchoolInfo {
  id: number;
  name: string;
  email: string;
  address: string;
  phone: string;
  website?: string;
  description?: string;
  establishedYear?: number;
  totalStudents?: number;
  principalName?: string;
}

export interface ChildSchoolInfo {
  childId: number;
  childName: string;
  grade: string;
  schoolId: number;
  school: SchoolInfo;
  enrollmentDate: string;
  status: 'active' | 'inactive';
}

const API_BASE_URL = 'http://localhost:8082/api/parents';

export const schoolService = {
  // Get school information by school ID
  async getSchoolInfo(schoolId: number): Promise<SchoolInfo> {
    console.log('=== FRONTEND: GET SCHOOL INFO DEBUG ===');
    console.log('Requesting school info for school ID:', schoolId);
    console.log('API URL:', `${API_BASE_URL}/schools/${schoolId}`);
    
    try {
      console.log('Making fetch request...');
      const response = await fetch(`${API_BASE_URL}/schools/${schoolId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        console.error('❌ HTTP error! status:', response.status);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Successfully fetched school info:', data);
      return data;
    } catch (error) {
      console.error('❌ Error fetching school info:', error);
      console.error('Error type:', error instanceof Error ? error.constructor.name : typeof error);
      throw error;
    }
  },

  // Get child's school information including grade
  async getChildSchoolInfo(childId: number): Promise<ChildSchoolInfo> {
    console.log('=== FRONTEND: GET CHILD SCHOOL INFO DEBUG ===');
    console.log('Requesting child school info for child ID:', childId);
    console.log('API URL:', `${API_BASE_URL}/children/${childId}/school-info`);
    
    try {
      console.log('Making fetch request...');
      const response = await fetch(`${API_BASE_URL}/children/${childId}/school-info`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        console.error('❌ HTTP error! status:', response.status);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Successfully fetched child school info:', data);
      return data;
    } catch (error) {
      console.error('❌ Error fetching child school info:', error);
      console.error('Error type:', error instanceof Error ? error.constructor.name : typeof error);
      throw error;
    }
  },

  // Format grade display
  formatGrade(grade: string): string {
    const gradeMap: Record<string, string> = {
      'MILD': '🌱 Gentle Learner',
      'MODERATE': '🌿 Growing Explorer', 
      'SEVERE': '🌳 Strong Achiever'
    };
    return gradeMap[grade] || grade;
  },

  // Get grade color
  getGradeColor(grade: string): string {
    const colorMap: Record<string, string> = {
      'MILD': 'text-green-600 bg-green-100',
      'MODERATE': 'text-blue-600 bg-blue-100',
      'SEVERE': 'text-purple-600 bg-purple-100'
    };
    return colorMap[grade] || 'text-gray-600 bg-gray-100';
  }
};
