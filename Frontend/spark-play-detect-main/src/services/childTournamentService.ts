export interface ChildTournament {
  tournamentId: number;
  schoolId: number;
  childId: number;
  childName: string;
  gameId: number;
  selectedGames: string[];
  tournamentTitle: string;
  tournamentDescription: string;
  gradeLevel: string;
  startTime: string;
  endTime: string;
  status: 'ASSIGNED' | 'ACTIVE' | 'COMPLETED' | 'OVERDUE';
  createdAt: string;
  updatedAt: string;
}

export interface ChildTournamentResponse {
  tournaments: ChildTournament[];
  totalTournaments: number;
  activeTournaments: number;
  upcomingTournaments: number;
  completedTournaments: number;
}

const API_BASE_URL = 'http://localhost:8091/api/school';

export const childTournamentService = {
  // Fetch all tournaments assigned to a specific child
  async getTournamentsByChild(childId: string): Promise<ChildTournamentResponse> {
    try {
      console.log(`Fetching tournaments for child ID: ${childId}`);
      const response = await fetch(`${API_BASE_URL}/tournaments/child/${childId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`HTTP error! status: ${response.status}, response: ${errorText}`);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const tournaments: ChildTournament[] = await response.json();
      console.log(`Received ${tournaments.length} tournaments for child ${childId}:`, tournaments);

      // Calculate stats
      const totalTournaments = tournaments.length;
      const activeTournaments = tournaments.filter(tournament => this.getTournamentStatus(tournament.startTime, tournament.endTime, tournament.status) === 'ACTIVE').length;
      const upcomingTournaments = tournaments.filter(tournament => this.getTournamentStatus(tournament.startTime, tournament.endTime, tournament.status) === 'UPCOMING').length;
      const completedTournaments = tournaments.filter(tournament => this.getTournamentStatus(tournament.startTime, tournament.endTime, tournament.status) === 'COMPLETED').length;

      return {
        tournaments,
        totalTournaments,
        activeTournaments,
        upcomingTournaments,
        completedTournaments
      };
    } catch (error) {
      console.error('Error fetching child tournaments:', error);
      throw error;
    }
  },

  // Get available games mapping (matches school service bit mapping)
  getGameMapping(): Record<number, string> {
    return {
      1: 'Dance Doodle',        // 0th bit (2^0 = 1)
      2: 'Gaze Game',           // 1st bit (2^1 = 2)
      4: 'Gesture Game',         // 2nd bit (2^2 = 4)
      8: 'Mirror Posture Game',  // 3rd bit (2^3 = 8)
      16: 'Repeat With Me Game' // 4th bit (2^4 = 16)
    };
  },

  // Parse game ID to get selected games
  parseSelectedGames(gameId: number): string[] {
    const gameMapping = this.getGameMapping();
    const selectedGames: string[] = [];
    
    Object.keys(gameMapping).forEach(bit => {
      const bitValue = parseInt(bit);
      if ((gameId & bitValue) > 0) {
        selectedGames.push(gameMapping[bitValue]);
      }
    });
    
    return selectedGames;
  },

  // Format date for display
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  // Check if tournament is overdue
  isTournamentOverdue(endTime: string): boolean {
    const now = new Date();
    const end = new Date(endTime);
    return now > end;
  },

  // Get tournament status based on time and current status
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
  },

  // Get status color for UI
  getStatusColor(status: string): string {
    switch (status) {
      case 'COMPLETED':
        return 'text-green-600 bg-green-100';
      case 'ACTIVE':
        return 'text-blue-600 bg-blue-100';
      case 'UPCOMING':
        return 'text-yellow-600 bg-yellow-100';
      case 'OVERDUE':
        return 'text-red-600 bg-red-100';
      case 'ASSIGNED':
      default:
        return 'text-gray-600 bg-gray-100';
    }
  },

  // Get status icon
  getStatusIcon(status: string): string {
    switch (status) {
      case 'COMPLETED':
        return '✅';
      case 'ACTIVE':
        return '🔥';
      case 'UPCOMING':
        return '⏰';
      case 'OVERDUE':
        return '⚠️';
      case 'ASSIGNED':
      default:
        return '📋';
    }
  },

  // Get game icon
  getGameIcon(gameName: string): string {
    switch (gameName) {
      case 'Dance Doodle':
        return '💃';
      case 'Gaze Game':
        return '👁️';
      case 'Gesture Game':
        return '✋';
      case 'Mirror Posture Game':
        return '🧍';
      case 'Repeat With Me Game':
        return '🔄';
      default:
        return '🎮';
    }
  }
};

