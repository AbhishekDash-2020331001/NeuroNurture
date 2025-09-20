import { makeAuthenticatedSchoolRequest } from '../../utils/schoolApiUtils';

export interface TournamentDetails {
  tournament: TournamentInfo;
  leaderboard: LeaderboardEntry[];
  statistics: TournamentStatistics;
}

export interface TournamentInfo {
  tournamentId: number;
  schoolId: number;
  childId?: number;
  childName?: string;
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
  assignedChildren?: ChildAssignment[];
  totalAssigned?: number;
  completedCount?: number;
}

export interface ChildAssignment {
  childId: number;
  childName: string;
  status: string;
  lastUpdated: string;
}

export interface LeaderboardEntry {
  childId: string;
  name: string;
  avatar: string;
  rank: number;
  gameType: string;
  gameDisplayName: string;
  performanceMetric: string;
  sessionsPlayed: number;
  bestScore: number;
  averageScore: number;
  totalScore: number;
  gameScores?: {
    [gameType: string]: number;
  };
}

export interface TournamentStatistics {
  totalParticipants: number;
  completedParticipants: number;
  completionRate: number;
  games: string[];
  gradeLevel: string;
  startTime: string;
  endTime: string;
  status: string;
}

class TournamentDetailsService {
  private baseUrl = 'http://localhost:8091/api/school/tournaments';

  /**
   * Get tournament details with leaderboard and statistics
   */
  async getTournamentDetails(tournamentId: number): Promise<TournamentDetails> {
    try {
      const response = await makeAuthenticatedSchoolRequest(`${this.baseUrl}/${tournamentId}/details`);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching tournament details:', error);
      throw error;
    }
  }

  /**
   * Get tournament basic info
   */
  async getTournamentById(tournamentId: number): Promise<TournamentInfo> {
    try {
      console.log(`Fetching tournament info for tournament ID: ${tournamentId}`);
      
      const response = await makeAuthenticatedSchoolRequest(`${this.baseUrl}/${tournamentId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Tournament info received:', data);
      
      return data;
    } catch (error) {
      console.error('Error fetching tournament info:', error);
      throw error;
    }
  }

  /**
   * Get game icon for display
   */
  getGameIcon(gameName: string): string {
    const gameIcons: { [key: string]: string } = {
      'Gaze Tracking': '👁️',
      'Gesture Control': '✋',
      'Mirror Posture': '🧍',
      'Repeat With Me': '🔄',
      'Dance Doodle': '💃',
      'gaze-game': '👁️',
      'gesture-game': '✋',
      'mirror-posture-game': '🧍',
      'repeat-with-me-game': '🔄',
      'dance-doodle': '💃'
    };
    return gameIcons[gameName] || '🎮';
  }

  /**
   * Format date for display
   */
  formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  }

  /**
   * Format date and time for display
   */
  formatDateTime(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date time:', error);
      return dateString;
    }
  }

  /**
   * Get tournament status with color
   */
  getTournamentStatus(startTime: string, endTime: string, status: string): { status: string; color: string } {
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (status === 'CANCELLED') {
      return { status: 'Cancelled', color: 'text-red-600 bg-red-100' };
    }

    if (now < start) {
      return { status: 'Upcoming', color: 'text-blue-600 bg-blue-100' };
    } else if (now >= start && now <= end) {
      return { status: 'Active', color: 'text-green-600 bg-green-100' };
    } else {
      return { status: 'Completed', color: 'text-gray-600 bg-gray-100' };
    }
  }
}

export const tournamentDetailsService = new TournamentDetailsService();
