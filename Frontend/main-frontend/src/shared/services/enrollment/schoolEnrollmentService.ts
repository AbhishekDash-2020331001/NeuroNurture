// School Enrollment Service for checking child-school connections
// Note: Enrollment is handled by schools, not parents

export interface SchoolEnrollmentStatus {
  childId: number;
  childName: string;
  schoolId: number | null;
  enrolled: boolean;
}

class SchoolEnrollmentService {
  private baseUrl = 'http://localhost:8082/api/parents'; // Parent service URL

  // Check if parent service is available
  private async checkServiceHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}`, { method: 'GET' });
      return response.ok;
    } catch (error) {
      console.error('Parent service is not available:', error);
      return false;
    }
  }

  // Get child's school enrollment status
  async getChildSchoolStatus(childId: number): Promise<SchoolEnrollmentStatus> {
    try {
      const response = await fetch(`${this.baseUrl}/children/${childId}/school-status`);
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
      console.error('Error fetching child school status:', error);
      throw error;
    }
  }
}

export const schoolEnrollmentService = new SchoolEnrollmentService();