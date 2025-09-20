export interface EnrollmentRequest {
  id: number;
  childId: number;
  childName: string;
  schoolId: number;
  schoolName: string;
  grade: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';
  message: string;
  createdAt: string;
  updatedAt: string;
  respondedAt?: string;
}

export interface CreateEnrollmentRequestDto {
  childId: number;
  schoolId: number;
  schoolName: string;
  grade: string;
  message: string;
}

export interface RespondToEnrollmentRequestDto {
  requestId: number;
  status: 'ACCEPTED' | 'REJECTED';
  responseMessage: string;
}

class EnrollmentRequestService {
  private baseUrl = 'http://localhost:8082/api/parents';

  // Get enrollment requests for a child
  async getEnrollmentRequestsForChild(childId: number): Promise<EnrollmentRequest[]> {
    try {
      const response = await fetch(`${this.baseUrl}/children/${childId}/enrollment-requests`);
      if (!response.ok) {
        throw new Error('Failed to fetch enrollment requests');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching enrollment requests:', error);
      throw error;
    }
  }

  // Get enrollment requests for a school
  async getEnrollmentRequestsForSchool(schoolId: number): Promise<EnrollmentRequest[]> {
    try {
      const response = await fetch(`${this.baseUrl}/schools/${schoolId}/enrollment-requests`);
      if (!response.ok) {
        throw new Error('Failed to fetch enrollment requests');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching enrollment requests:', error);
      throw error;
    }
  }

  // Create enrollment request
  async createEnrollmentRequest(request: CreateEnrollmentRequestDto): Promise<EnrollmentRequest> {
    try {
      const response = await fetch(`${this.baseUrl}/enrollment-requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });
      if (!response.ok) {
        throw new Error('Failed to create enrollment request');
      }
      return await response.json();
    } catch (error) {
      console.error('Error creating enrollment request:', error);
      throw error;
    }
  }

  // Respond to enrollment request
  async respondToEnrollmentRequest(response: RespondToEnrollmentRequestDto): Promise<EnrollmentRequest> {
    try {
      const res = await fetch(`${this.baseUrl}/enrollment-requests/respond`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(response),
      });
      if (!res.ok) {
        throw new Error('Failed to respond to enrollment request');
      }
      return await res.json();
    } catch (error) {
      console.error('Error responding to enrollment request:', error);
      throw error;
    }
  }

  // Delete enrollment request
  async deleteEnrollmentRequest(requestId: number): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/enrollment-requests/${requestId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete enrollment request');
      }
    } catch (error) {
      console.error('Error deleting enrollment request:', error);
      throw error;
    }
  }
}

export const enrollmentRequestService = new EnrollmentRequestService();
