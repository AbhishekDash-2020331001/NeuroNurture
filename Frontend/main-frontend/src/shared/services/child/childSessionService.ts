import { makeAuthenticatedSchoolRequest } from '../../utils/schoolApiUtils';

export interface GameSession {
  id: number;
  sessionId: string;
  dateTime: string;
  childId: string;
  age: number;
  schoolTaskId?: string;
  tournamentId?: number;
  gameType: string;
  isCompleted: boolean;
  [key: string]: any; // For game-specific fields
}

export interface ChildSessionStats {
  totalGameSessions: number;
  lastPlayedDaysAgo: number;
  sessionCompletionRate: number;
  mostPlayedGame: string;
  leastPlayedGame: string;
  gameSessionCounts: { [gameType: string]: number };
  completedSessionCounts: { [gameType: string]: number };
}

class ChildSessionService {
  private schoolServiceUrl = 'http://localhost:8091/api/school/tournaments';

  /**
   * Get all sessions for a specific child from all game services via school service
   */
  async getChildSessions(childId: string): Promise<GameSession[]> {
    try {
      const response = await makeAuthenticatedSchoolRequest(`${this.schoolServiceUrl}/child/${childId}/sessions`);
      if (response.ok) {
        const data = await response.json();
        console.log('School service response for child', childId, ':', data);
        // The school service returns sessions in the 'sessions' property
        return data.sessions || [];
      }
      return [];
    } catch (error) {
      console.error('Error fetching child sessions:', error);
      return [];
    }
  }


  /**
   * Calculate comprehensive session statistics for a child
   */
  async getChildSessionStats(childId: string): Promise<ChildSessionStats> {
    try {
      const response = await makeAuthenticatedSchoolRequest(`${this.schoolServiceUrl}/child/${childId}/sessions`);
      if (response.ok) {
        const data = await response.json();
        return {
          totalGameSessions: data.totalGameSessions || 0,
          lastPlayedDaysAgo: data.lastPlayedDaysAgo || 0,
          sessionCompletionRate: data.sessionCompletionRate || 0,
          mostPlayedGame: data.mostPlayedGame || 'None',
          leastPlayedGame: data.leastPlayedGame || 'None',
          gameSessionCounts: data.gameSessionCounts || {},
          completedSessionCounts: data.completedSessionCounts || {}
        };
      }
    } catch (error) {
      console.error('Error fetching child session stats:', error);
    }
    
    // Return default values if request fails
    return {
      totalGameSessions: 0,
      lastPlayedDaysAgo: 0,
      sessionCompletionRate: 0,
      mostPlayedGame: 'None',
      leastPlayedGame: 'None',
      gameSessionCounts: {},
      completedSessionCounts: {}
    };
  }

}

export const childSessionService = new ChildSessionService();
