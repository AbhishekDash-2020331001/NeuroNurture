/**
 * Service for fetching child performance overview from NuruAgent
 */

export interface PerformanceOverview {
  overview: string;
  has_data: boolean;
  child_info?: {
    name: string;
    date_of_birth: string;
    gender: string;
    parent_id: number;
    parent_name?: string;
  };
  performance_summary?: {
    child_info: {
      name: string;
      date_of_birth: string;
      gender: string;
      parent_id: number;
    };
    dance_doodle: {
      sessions: number;
      recent_scores: number[];
      average_score: number;
      latest_session: any;
    };
    gesture_game: {
      sessions: number;
      recent_scores: number[];
      average_score: number;
      latest_session: any;
    };
    gaze_game: {
      sessions: number;
      recent_rounds: any[];
      latest_session: any;
    };
    mirror_posture: {
      sessions: number;
      recent_sessions: any[];
      latest_session: any;
    };
    repeat_with_me: {
      sessions: number;
      recent_scores: number[];
      average_score: number;
      latest_session: any;
    };
  };
  error?: string;
}

class PerformanceOverviewService {
  private baseUrl = 'http://localhost:8005';

  /**
   * Get performance overview for a specific child
   */
  async getChildPerformanceOverview(childId: string): Promise<PerformanceOverview> {
    try {
      const response = await fetch(`${this.baseUrl}/child/${childId}/performance-overview`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching performance overview:', error);
      throw error;
    }
  }
}

export const performanceOverviewService = new PerformanceOverviewService();

