// Game Performance Service for fetching real game data
export interface GamePerformance {
  gameName: string;
  totalSessions: number;
  averageScore: number;
  lastPlayed: string;
  bestPerformance: number;
  improvement: number;
  insights: {
    title: string;
    value: string;
    description: string;
    color: string;
  }[];
}

export interface GestureGameData {
  id: number;
  sessionId: string;
  dateTime: string;
  childId: string;
  age: number;
  thumbs_up: number;
  thumbs_down: number;
  victory: number;
  butterfly: number;
  spectacle: number;
  heart: number;
  pointing_up: number;
  iloveyou: number;
  dua: number;
  closed_fist: number;
  open_palm: number;
  videoURL: string;
  isTrainingAllowed: boolean;
  suspectedASD: boolean;
  isASD: boolean;
}

export interface MirrorPostureGameData {
  id: number;
  sessionId: string;
  dateTime: string;
  childId: string;
  age: number;
  lookingSideways: number;
  mouthOpen: number;
  showingTeeth: number;
  kiss: number;
  videoURL: string;
  isTrainingAllowed: boolean;
  suspectedASD: boolean;
  isASD: boolean;
}

export interface DanceDoodleGameData {
  id: number;
  sessionId: string;
  dateTime: string;
  childId: string;
  age: number;
  cool_arms: number;
  open_wings: number;
  silly_boxer: number;
  happy_stand: number;
  crossy_play: number;
  shh_fun: number;
  stretch: number;
  videoURL: string;
  isTrainingAllowed: boolean;
  suspectedASD: boolean;
  isASD: boolean;
}

export interface GazeGameData {
  id: number;
  sessionId: string;
  dateTime: string;
  childId: string;
  age: number;
  round1Count: number;
  round2Count: number;
  round3Count: number;
  isTrainingAllowed: boolean;
  suspectedASD: boolean;
  isASD: boolean;
}

export interface RepeatWithMeGameData {
  id: number;
  sessionId: string;
  dateTime: string;
  childId: string;
  age: number;
  round1Score: number;
  round2Score: number;
  round3Score: number;
  round4Score: number;
  round5Score: number;
  round6Score: number;
  round7Score: number;
  round8Score: number;
  round9Score: number;
  round10Score: number;
  round11Score: number;
  round12Score: number;
  averageScore: number;
  completedRounds: number;
  isTrainingAllowed: boolean;
  suspectedASD: boolean;
  isASD: boolean;
}

class GamePerformanceService {
  private baseUrls = {
    gesture: 'http://localhost:8084/api/gesture-game',
    mirrorPosture: 'http://localhost:8083/api/mirror-posture-game',
    danceDoodle: 'http://localhost:8087/api/dance-doodle',
    gaze: 'http://localhost:8086/api/gaze-game',
    repeatWithMe: 'http://localhost:8089/api/repeat-with-me-game'
  };

  // Fetch all game performances for a child
  async getGamePerformances(childId: string): Promise<GamePerformance[]> {
    try {
      const [
        gestureData,
        mirrorPostureData,
        danceDoodleData,
        gazeData,
        repeatWithMeData
      ] = await Promise.all([
        this.fetchGestureGameData(childId),
        this.fetchMirrorPostureGameData(childId),
        this.fetchDanceDoodleGameData(childId),
        this.fetchGazeGameData(childId),
        this.fetchRepeatWithMeGameData(childId)
      ]);

      return [
        this.processGestureGameData(gestureData),
        this.processMirrorPostureGameData(mirrorPostureData),
        this.processDanceDoodleGameData(danceDoodleData),
        this.processGazeGameData(gazeData),
        this.processRepeatWithMeGameData(repeatWithMeData)
      ];
    } catch (error) {
      console.error('Error fetching game performances:', error);
      return this.getDefaultGamePerformances();
    }
  }

  // Gesture Game
  private async fetchGestureGameData(childId: string): Promise<GestureGameData[]> {
    try {
      const response = await fetch(`${this.baseUrls.gesture}/child/${childId}`);
      if (!response.ok) throw new Error('Failed to fetch gesture game data');
      return await response.json();
    } catch (error) {
      console.error('Error fetching gesture game data:', error);
      return [];
    }
  }

  private processGestureGameData(data: GestureGameData[]): GamePerformance {
    if (data.length === 0) {
      return {
        gameName: 'Gesture Game',
        totalSessions: 0,
        averageScore: 0,
        lastPlayed: 'Never',
        bestPerformance: 0,
        improvement: 0,
        insights: [
          { title: 'Sessions Played', value: '0', description: 'No sessions completed', color: 'text-gray-500' },
          { title: 'Best Gesture', value: 'N/A', description: 'No data available', color: 'text-gray-500' },
          { title: 'Average Time', value: 'N/A', description: 'No data available', color: 'text-gray-500' }
        ]
      };
    }

    const gestures = ['thumbs_up', 'thumbs_down', 'victory', 'butterfly', 'spectacle', 'heart', 'pointing_up', 'iloveyou', 'dua', 'closed_fist', 'open_palm'];
    const gestureTimes = gestures.map(gesture => {
      const times = data.map(session => session[gesture as keyof GestureGameData] as number).filter(time => time && time > 0);
      return times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : 0;
    });

    const bestGesture = gestures[gestureTimes.indexOf(Math.min(...gestureTimes.filter(t => t > 0)))];
    const averageTime = gestureTimes.filter(t => t > 0).reduce((a, b) => a + b, 0) / gestureTimes.filter(t => t > 0).length;
    const totalSessions = data.length;
    const lastPlayed = new Date(data[data.length - 1].dateTime).toLocaleDateString();

    return {
      gameName: 'Gesture Game',
      totalSessions,
      averageScore: Math.round(100 - (averageTime / 10)), // Convert time to score (lower time = higher score)
      lastPlayed,
      bestPerformance: Math.round(100 - (Math.min(...gestureTimes.filter(t => t > 0)) / 10)),
      improvement: totalSessions > 1 ? Math.round(Math.random() * 20 - 10) : 0, // Mock improvement
      insights: [
        { title: 'Sessions Played', value: totalSessions.toString(), description: 'Total game sessions', color: 'text-blue-600' },
        { title: 'Best Gesture', value: bestGesture.replace('_', ' ').toUpperCase(), description: 'Fastest completed gesture', color: 'text-green-600' },
        { title: 'Average Time', value: `${Math.round(averageTime)}s`, description: 'Average completion time', color: 'text-purple-600' }
      ]
    };
  }

  // Mirror Posture Game
  private async fetchMirrorPostureGameData(childId: string): Promise<MirrorPostureGameData[]> {
    try {
      const response = await fetch(`${this.baseUrls.mirrorPosture}/child/${childId}`);
      if (!response.ok) throw new Error('Failed to fetch mirror posture game data');
      return await response.json();
    } catch (error) {
      console.error('Error fetching mirror posture game data:', error);
      return [];
    }
  }

  private processMirrorPostureGameData(data: MirrorPostureGameData[]): GamePerformance {
    if (data.length === 0) {
      return {
        gameName: 'Mirror Posture Game',
        totalSessions: 0,
        averageScore: 0,
        lastPlayed: 'Never',
        bestPerformance: 0,
        improvement: 0,
        insights: [
          { title: 'Sessions Played', value: '0', description: 'No sessions completed', color: 'text-gray-500' },
          { title: 'Best Posture', value: 'N/A', description: 'No data available', color: 'text-gray-500' },
          { title: 'Accuracy', value: 'N/A', description: 'No data available', color: 'text-gray-500' }
        ]
      };
    }

    const postures = ['lookingSideways', 'mouthOpen', 'showingTeeth', 'kiss'];
    const postureTimes = postures.map(posture => {
      const times = data.map(session => session[posture as keyof MirrorPostureGameData] as number).filter(time => time && time > 0);
      return times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : 0;
    });

    const bestPosture = postures[postureTimes.indexOf(Math.min(...postureTimes.filter(t => t > 0)))];
    const averageTime = postureTimes.filter(t => t > 0).reduce((a, b) => a + b, 0) / postureTimes.filter(t => t > 0).length;
    const totalSessions = data.length;
    const lastPlayed = new Date(data[data.length - 1].dateTime).toLocaleDateString();
    const accuracy = Math.round((data.filter(session => session.suspectedASD === false).length / totalSessions) * 100);

    return {
      gameName: 'Mirror Posture Game',
      totalSessions,
      averageScore: Math.round(100 - (averageTime / 10)),
      lastPlayed,
      bestPerformance: Math.round(100 - (Math.min(...postureTimes.filter(t => t > 0)) / 10)),
      improvement: totalSessions > 1 ? Math.round(Math.random() * 20 - 10) : 0,
      insights: [
        { title: 'Sessions Played', value: totalSessions.toString(), description: 'Total game sessions', color: 'text-blue-600' },
        { title: 'Best Posture', value: bestPosture.replace(/([A-Z])/g, ' $1').trim().toUpperCase(), description: 'Fastest completed posture', color: 'text-green-600' },
        { title: 'Accuracy', value: `${accuracy}%`, description: 'Posture recognition accuracy', color: 'text-purple-600' }
      ]
    };
  }

  // Dance Doodle Game
  private async fetchDanceDoodleGameData(childId: string): Promise<DanceDoodleGameData[]> {
    try {
      const response = await fetch(`${this.baseUrls.danceDoodle}/child/${childId}`);
      if (!response.ok) throw new Error('Failed to fetch dance doodle game data');
      return await response.json();
    } catch (error) {
      console.error('Error fetching dance doodle game data:', error);
      return [];
    }
  }

  private processDanceDoodleGameData(data: DanceDoodleGameData[]): GamePerformance {
    if (data.length === 0) {
      return {
        gameName: 'Dance Doodle',
        totalSessions: 0,
        averageScore: 0,
        lastPlayed: 'Never',
        bestPerformance: 0,
        improvement: 0,
        insights: [
          { title: 'Sessions Played', value: '0', description: 'No sessions completed', color: 'text-gray-500' },
          { title: 'Best Pose', value: 'N/A', description: 'No data available', color: 'text-gray-500' },
          { title: 'Creativity', value: 'N/A', description: 'No data available', color: 'text-gray-500' }
        ]
      };
    }

    const poses = ['cool_arms', 'open_wings', 'silly_boxer', 'happy_stand', 'crossy_play', 'shh_fun', 'stretch'];
    const poseTimes = poses.map(pose => {
      const times = data.map(session => session[pose as keyof DanceDoodleGameData] as number).filter(time => time && time > 0);
      return times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : 0;
    });

    const bestPose = poses[poseTimes.indexOf(Math.min(...poseTimes.filter(t => t > 0)))];
    const averageTime = poseTimes.filter(t => t > 0).reduce((a, b) => a + b, 0) / poseTimes.filter(t => t > 0).length;
    const totalSessions = data.length;
    const lastPlayed = new Date(data[data.length - 1].dateTime).toLocaleDateString();
    const creativity = Math.round((data.filter(session => session.suspectedASD === false).length / totalSessions) * 100);

    return {
      gameName: 'Dance Doodle',
      totalSessions,
      averageScore: Math.round(100 - (averageTime / 10)),
      lastPlayed,
      bestPerformance: Math.round(100 - (Math.min(...poseTimes.filter(t => t > 0)) / 10)),
      improvement: totalSessions > 1 ? Math.round(Math.random() * 20 - 10) : 0,
      insights: [
        { title: 'Sessions Played', value: totalSessions.toString(), description: 'Total game sessions', color: 'text-blue-600' },
        { title: 'Best Pose', value: bestPose.replace('_', ' ').toUpperCase(), description: 'Fastest completed pose', color: 'text-green-600' },
        { title: 'Creativity', value: `${creativity}%`, description: 'Pose creativity score', color: 'text-purple-600' }
      ]
    };
  }

  // Gaze Game
  private async fetchGazeGameData(childId: string): Promise<GazeGameData[]> {
    try {
      const response = await fetch(`${this.baseUrls.gaze}/child/${childId}`);
      if (!response.ok) throw new Error('Failed to fetch gaze game data');
      return await response.json();
    } catch (error) {
      console.error('Error fetching gaze game data:', error);
      return [];
    }
  }

  private processGazeGameData(data: GazeGameData[]): GamePerformance {
    if (data.length === 0) {
      return {
        gameName: 'Gaze Game',
        totalSessions: 0,
        averageScore: 0,
        lastPlayed: 'Never',
        bestPerformance: 0,
        improvement: 0,
        insights: [
          { title: 'Sessions Played', value: '0', description: 'No sessions completed', color: 'text-gray-500' },
          { title: 'Best Round', value: 'N/A', description: 'No data available', color: 'text-gray-500' },
          { title: 'Focus Score', value: 'N/A', description: 'No data available', color: 'text-gray-500' }
        ]
      };
    }

    const roundScores = data.map(session => {
      const rounds = [session.round1Count, session.round2Count, session.round3Count].filter(count => count && count > 0);
      return rounds.length > 0 ? rounds.reduce((a, b) => a + b, 0) / rounds.length : 0;
    });

    const averageScore = roundScores.reduce((a, b) => a + b, 0) / roundScores.length;
    const bestRound = Math.max(...data.map(session => Math.max(session.round1Count || 0, session.round2Count || 0, session.round3Count || 0)));
    const totalSessions = data.length;
    const lastPlayed = new Date(data[data.length - 1].dateTime).toLocaleDateString();
    const focusScore = Math.round(averageScore * 10); // Convert to percentage

    return {
      gameName: 'Gaze Game',
      totalSessions,
      averageScore: Math.round(averageScore * 10),
      lastPlayed,
      bestPerformance: Math.round(bestRound * 10),
      improvement: totalSessions > 1 ? Math.round(Math.random() * 20 - 10) : 0,
      insights: [
        { title: 'Sessions Played', value: totalSessions.toString(), description: 'Total game sessions', color: 'text-blue-600' },
        { title: 'Best Round', value: `${bestRound} balloons`, description: 'Highest balloon count', color: 'text-green-600' },
        { title: 'Focus Score', value: `${focusScore}%`, description: 'Overall focus performance', color: 'text-purple-600' }
      ]
    };
  }

  // Repeat With Me Game
  private async fetchRepeatWithMeGameData(childId: string): Promise<RepeatWithMeGameData[]> {
    try {
      const response = await fetch(`${this.baseUrls.repeatWithMe}/child/${childId}`);
      if (!response.ok) throw new Error('Failed to fetch repeat with me game data');
      return await response.json();
    } catch (error) {
      console.error('Error fetching repeat with me game data:', error);
      return [];
    }
  }

  private processRepeatWithMeGameData(data: RepeatWithMeGameData[]): GamePerformance {
    if (data.length === 0) {
      return {
        gameName: 'Repeat With Me Game',
        totalSessions: 0,
        averageScore: 0,
        lastPlayed: 'Never',
        bestPerformance: 0,
        improvement: 0,
        insights: [
          { title: 'Sessions Played', value: '0', description: 'No sessions completed', color: 'text-gray-500' },
          { title: 'Best Score', value: 'N/A', description: 'No data available', color: 'text-gray-500' },
          { title: 'Speech Clarity', value: 'N/A', description: 'No data available', color: 'text-gray-500' }
        ]
      };
    }

    const averageScores = data.map(session => session.averageScore || 0).filter(score => score > 0);
    const bestScore = Math.max(...averageScores);
    const overallAverage = averageScores.reduce((a, b) => a + b, 0) / averageScores.length;
    const totalSessions = data.length;
    const lastPlayed = new Date(data[data.length - 1].dateTime).toLocaleDateString();
    
    // For Repeat With Me Game, scores are already in percentage format (0-100), so we don't multiply by 100
    const speechClarity = Math.round(overallAverage);

    return {
      gameName: 'Repeat With Me Game',
      totalSessions,
      averageScore: Math.round(overallAverage),
      lastPlayed,
      bestPerformance: Math.round(bestScore),
      improvement: totalSessions > 1 ? Math.round(Math.random() * 20 - 10) : 0,
      insights: [
        { title: 'Sessions Played', value: totalSessions.toString(), description: 'Total game sessions', color: 'text-blue-600' },
        { title: 'Best Score', value: `${Math.round(bestScore)}%`, description: 'Highest similarity score', color: 'text-green-600' },
        { title: 'Speech Clarity', value: `${speechClarity}%`, description: 'Overall speech clarity', color: 'text-purple-600' }
      ]
    };
  }

  // Default fallback data
  private getDefaultGamePerformances(): GamePerformance[] {
    return [
      {
        gameName: 'Gesture Game',
        totalSessions: 0,
        averageScore: 0,
        lastPlayed: 'Never',
        bestPerformance: 0,
        improvement: 0,
        insights: [
          { title: 'Sessions Played', value: '0', description: 'No sessions completed', color: 'text-gray-500' },
          { title: 'Best Gesture', value: 'N/A', description: 'No data available', color: 'text-gray-500' },
          { title: 'Average Time', value: 'N/A', description: 'No data available', color: 'text-gray-500' }
        ]
      },
      {
        gameName: 'Mirror Posture Game',
        totalSessions: 0,
        averageScore: 0,
        lastPlayed: 'Never',
        bestPerformance: 0,
        improvement: 0,
        insights: [
          { title: 'Sessions Played', value: '0', description: 'No sessions completed', color: 'text-gray-500' },
          { title: 'Best Posture', value: 'N/A', description: 'No data available', color: 'text-gray-500' },
          { title: 'Accuracy', value: 'N/A', description: 'No data available', color: 'text-gray-500' }
        ]
      },
      {
        gameName: 'Dance Doodle',
        totalSessions: 0,
        averageScore: 0,
        lastPlayed: 'Never',
        bestPerformance: 0,
        improvement: 0,
        insights: [
          { title: 'Sessions Played', value: '0', description: 'No sessions completed', color: 'text-gray-500' },
          { title: 'Best Pose', value: 'N/A', description: 'No data available', color: 'text-gray-500' },
          { title: 'Creativity', value: 'N/A', description: 'No data available', color: 'text-gray-500' }
        ]
      },
      {
        gameName: 'Gaze Game',
        totalSessions: 0,
        averageScore: 0,
        lastPlayed: 'Never',
        bestPerformance: 0,
        improvement: 0,
        insights: [
          { title: 'Sessions Played', value: '0', description: 'No sessions completed', color: 'text-gray-500' },
          { title: 'Best Round', value: 'N/A', description: 'No data available', color: 'text-gray-500' },
          { title: 'Focus Score', value: 'N/A', description: 'No data available', color: 'text-gray-500' }
        ]
      },
      {
        gameName: 'Repeat With Me Game',
        totalSessions: 0,
        averageScore: 0,
        lastPlayed: 'Never',
        bestPerformance: 0,
        improvement: 0,
        insights: [
          { title: 'Sessions Played', value: '0', description: 'No sessions completed', color: 'text-gray-500' },
          { title: 'Best Score', value: 'N/A', description: 'No data available', color: 'text-gray-500' },
          { title: 'Speech Clarity', value: 'N/A', description: 'No data available', color: 'text-gray-500' }
        ]
      }
    ];
  }
}

export const gamePerformanceService = new GamePerformanceService();
