// Game Data Service for fetching session data from all game services
export interface GameSession {
  id: number;
  sessionId: string;
  dateTime: string;
  childId: string;
  age: number;
  isTrainingAllowed: boolean;
  suspectedASD: boolean;
  isASD?: boolean;
  gameType?: string; // Added by gameDataService
  
  // Gesture Game fields
  thumbs_up?: number;
  thumbs_down?: number;
  victory?: number;
  butterfly?: number;
  spectacle?: number;
  heart?: number;
  pointing_up?: number;
  iloveyou?: number;
  dua?: number;
  closed_fist?: number;
  open_palm?: number;
  
  // Mirror Posture Game fields
  lookingSideways?: number;
  mouthOpen?: number;
  showingTeeth?: number;
  kiss?: number;
  
  // Dance Doodle Game fields
  cool_arms?: number;
  open_wings?: number;
  silly_boxer?: number;
  happy_stand?: number;
  crossy_play?: number;
  shh_fun?: number;
  stretch?: number;
  
  // Repeat with Me Game fields
  round1Score?: number;
  round2Score?: number;
  round3Score?: number;
  round4Score?: number;
  round5Score?: number;
  round6Score?: number;
  round7Score?: number;
  round8Score?: number;
  round9Score?: number;
  round10Score?: number;
  round11Score?: number;
  round12Score?: number;
  
  // Gaze Game fields
  round1Count?: number;
  round2Count?: number;
  round3Count?: number;
  
  // Common fields
  completionTime?: number;
}

export interface HeatmapData {
  date: string;
  intensity: number;
  totalMinutes: number;
  gameCount: number;
  games: string[];
}

export interface GameStats {
  totalDaysPracticed: number;
  currentStreak: number;
  totalTimeMinutes: number;
  averageSessionTime: number;
}

class GameDataService {
  private baseUrls = {
    gesture: 'http://localhost:8084/api/gesture-game',
    gaze: 'http://localhost:8086/api/gaze-game',
    danceDoodle: 'http://localhost:8087/api/dance-doodle',
    mirrorPosture: 'http://localhost:8083/api/mirror-posture-game',
    repeatWithMe: 'http://localhost:8089/api/repeat-with-me-game'
  };

  // Fetch all game sessions for a specific child
  async getAllGameSessions(childId: string): Promise<GameSession[]> {
    try {
      const [gestureSessions, gazeSessions, danceSessions, mirrorSessions, repeatSessions] = await Promise.all([
        this.fetchGameSessions(`${this.baseUrls.gesture}/child/${childId}`),
        this.fetchGameSessions(`${this.baseUrls.gaze}/child/${childId}`),
        this.fetchGameSessions(`${this.baseUrls.danceDoodle}/child/${childId}`),
        this.fetchGameSessions(`${this.baseUrls.mirrorPosture}/child/${childId}`),
        this.fetchGameSessions(`${this.baseUrls.repeatWithMe}/child/${childId}`)
      ]);

      // Combine all sessions and add game type
      const allSessions: GameSession[] = [
        ...gestureSessions.map(session => ({ ...session, gameType: 'gesture' })),
        ...gazeSessions.map(session => ({ ...session, gameType: 'gaze' })),
        ...danceSessions.map(session => ({ ...session, gameType: 'dance' })),
        ...mirrorSessions.map(session => ({ ...session, gameType: 'mirror' })),
        ...repeatSessions.map(session => ({ ...session, gameType: 'repeat' }))
      ];

      return allSessions;
    } catch (error) {
      console.error('Error fetching game sessions:', error);
      return [];
    }
  }

  // Fetch sessions from a specific service
  private async fetchGameSessions(url: string): Promise<GameSession[]> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching from ${url}:`, error);
      return [];
    }
  }

  // Process sessions into heatmap data
  processHeatmapData(sessions: GameSession[]): { heatmapData: HeatmapData[], stats: GameStats } {
    const now = new Date();
    const twelveWeeksAgo = new Date(now.getTime() - (12 * 7 * 24 * 60 * 60 * 1000));
    
    // Group sessions by date
    const sessionsByDate = new Map<string, GameSession[]>();
    
    sessions.forEach(session => {
      const sessionDate = new Date(session.dateTime);
      if (sessionDate >= twelveWeeksAgo) {
        const dateKey = sessionDate.toISOString().split('T')[0];
        if (!sessionsByDate.has(dateKey)) {
          sessionsByDate.set(dateKey, []);
        }
        sessionsByDate.get(dateKey)!.push(session);
      }
    });

    // Calculate heatmap data for each day
    const heatmapData: HeatmapData[] = [];
    const gameTypeNames = {
      gesture: 'Gesture Game',
      gaze: 'Gaze Game', 
      dance: 'Dance Doodle',
      mirror: 'Mirror Posture',
      repeat: 'Repeat With Me'
    };

    for (let i = 0; i < 84; i++) {
      const currentDate = new Date(twelveWeeksAgo.getTime() + (i * 24 * 60 * 60 * 1000));
      const dateKey = currentDate.toISOString().split('T')[0];
      const daySessions = sessionsByDate.get(dateKey) || [];

      // Calculate session duration (estimate 10-20 minutes per session)
      const totalMinutes = daySessions.length * 15; // Average 15 minutes per session
      const gameCount = daySessions.length;
      const uniqueGames = [...new Set(daySessions.map(s => s.gameType))];
      const gameNames = uniqueGames.map(gameType => gameTypeNames[gameType as keyof typeof gameTypeNames]);

      // Calculate intensity (0-1 scale based on session count and duration)
      let intensity = 0;
      if (gameCount > 0) {
        intensity = Math.min(1, (gameCount * 0.2) + (totalMinutes / 60) * 0.1);
      }

      heatmapData.push({
        date: dateKey,
        intensity,
        totalMinutes,
        gameCount,
        games: gameNames
      });
    }

    // Calculate statistics
    const activeDays = heatmapData.filter(day => day.gameCount > 0);
    const totalDaysPracticed = activeDays.length;
    const totalTimeMinutes = activeDays.reduce((sum, day) => sum + day.totalMinutes, 0);
    const averageSessionTime = totalDaysPracticed > 0 ? totalTimeMinutes / totalDaysPracticed : 0;

    // Calculate current streak
    let currentStreak = 0;
    for (let i = heatmapData.length - 1; i >= 0; i--) {
      if (heatmapData[i].gameCount > 0) {
        currentStreak++;
      } else {
        break;
      }
    }

    const stats: GameStats = {
      totalDaysPracticed,
      currentStreak,
      totalTimeMinutes,
      averageSessionTime
    };

    return { heatmapData, stats };
  }

  // Get heatmap data for a specific child
  async getHeatmapData(childId: string): Promise<{ heatmapData: HeatmapData[], stats: GameStats }> {
    const sessions = await this.getAllGameSessions(childId);
    return this.processHeatmapData(sessions);
  }
}

export const gameDataService = new GameDataService();
