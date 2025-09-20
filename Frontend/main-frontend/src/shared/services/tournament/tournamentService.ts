import { makeAuthenticatedSchoolRequest } from '../../utils/schoolApiUtils';

export interface TournamentCreateRequest {
  tournamentTitle: string;
  tournamentDescription: string;
  startTime: string; // ISO format string for LocalDateTime
  endTime: string; // ISO format string for LocalDateTime
  gradeLevel: string; // Gentle Bloom, Rising Star, Bright Light
  selectedGames: string[];
}

export interface ChildAssignment {
  childId: number;
  status: string;
  lastUpdated: string;
}

export interface TournamentResponse {
  tournamentId: number;
  schoolId: number;
  childId?: number; // Optional for grouped tournaments
  childName?: string; // Optional for grouped tournaments
  gameId: number;
  selectedGames: string[];
  tournamentTitle: string;
  tournamentDescription: string;
  gradeLevel: string;
  startTime: string;
  endTime: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  
  // For grouped tournaments
  assignedChildren?: ChildAssignment[];
  totalAssigned?: number;
  completedCount?: number;
}

export interface GameMapping {
  [key: string]: number;
}

class TournamentService {
  private baseUrl = 'http://localhost:8091/api/school/tournaments';

  // Create tournaments for a specific grade
  async createTournaments(request: TournamentCreateRequest, schoolId: number): Promise<TournamentResponse[]> {
    try {
      const response = await makeAuthenticatedSchoolRequest(`${this.baseUrl}/create?schoolId=${schoolId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating tournaments:', error);
      throw error;
    }
  }

  // Get all tournaments for a school
  async getTournamentsBySchool(schoolId: number): Promise<TournamentResponse[]> {
    try {
      const response = await makeAuthenticatedSchoolRequest(`${this.baseUrl}/school/${schoolId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching tournaments by school:', error);
      throw error;
    }
  }

  // Get tournaments for a specific child
  async getTournamentsByChild(childId: number): Promise<TournamentResponse[]> {
    try {
      const response = await makeAuthenticatedSchoolRequest(`${this.baseUrl}/child/${childId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching tournaments by child:', error);
      throw error;
    }
  }

  // Get tournaments by school and child
  async getTournamentsBySchoolAndChild(schoolId: number, childId: number): Promise<TournamentResponse[]> {
    try {
      const response = await makeAuthenticatedSchoolRequest(`${this.baseUrl}/school/${schoolId}/child/${childId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching tournaments by school and child:', error);
      throw error;
    }
  }

  // Get tournaments by grade level
  async getTournamentsByGrade(schoolId: number, gradeLevel: string): Promise<TournamentResponse[]> {
    try {
      const response = await makeAuthenticatedSchoolRequest(`${this.baseUrl}/school/${schoolId}/grade/${encodeURIComponent(gradeLevel)}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching tournaments by grade:', error);
      throw error;
    }
  }

  // Update tournament status
  async updateTournamentStatus(tournamentId: number, status: string): Promise<TournamentResponse> {
    try {
      const response = await makeAuthenticatedSchoolRequest(`${this.baseUrl}/${tournamentId}/status?status=${status}`, {
        method: 'PUT',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error updating tournament status:', error);
      throw error;
    }
  }

  // Delete a tournament
  async deleteTournament(tournamentId: number): Promise<void> {
    try {
      const response = await makeAuthenticatedSchoolRequest(`${this.baseUrl}/${tournamentId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error deleting tournament:', error);
      throw error;
    }
  }

  // Helper method to format date
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Helper method to check if tournament is overdue
  isTournamentOverdue(endTime: string): boolean {
    return new Date() > new Date(endTime);
  }

  // Helper method to get tournament status
  getTournamentStatus(startTime: string, endTime: string, status: string): string {
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (status === 'COMPLETED') {
      return 'COMPLETED';
    } else if (now < start) {
      return 'UPCOMING';
    } else if (now > end) {
      return 'OVERDUE';
    } else {
      return 'ACTIVE';
    }
  }
}

export const tournamentService = new TournamentService();

