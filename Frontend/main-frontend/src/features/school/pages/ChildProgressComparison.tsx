import { childrenService, SchoolChild } from '@/shared/services/child/childrenService';
import { childSessionService, ChildSessionStats, GameSession } from '@/shared/services/child/childSessionService';
import {
  BarChart3,
  CheckCircle,
  Download, Filter,
  Gamepad2,
  Lightbulb,
  Search,
  Star,
  Target,
  TrendingUp,
  Users,
  XCircle,
  Zap
} from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { useSchoolAuth } from '../contexts/SchoolAuthContext';

interface Child {
  id: string;
  name: string;
  grade: string;
  avatar?: string;
  age: number;
  enrollmentDate: string;
  performance: {
    [gameId: string]: {
      bestScore: number;
      averageScore: number;
      gamesPlayed: number;
      lastPlayed: string;
      improvement: number; // percentage improvement over time
      scoreHistory: number[]; // last 10 scores for trend analysis
      timeSpent: number; // total time spent in minutes
      accuracy: number; // accuracy percentage
      consistency: number; // consistency score (0-100)
      difficulty: 'beginner' | 'intermediate' | 'advanced';
    };
  };
  overallStats: {
    totalGamesPlayed: number;
    averageScore: number;
    completionRate: number;
    streak: number;
    totalTimeSpent: number;
    learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'mixed';
    cognitiveLevel: 'developing' | 'proficient' | 'advanced';
    engagement: number; // 0-100
    focus: number; // 0-100
    autismLikelihoodIndex: number; // 0-100, probability of autism
  };
  achievements: {
    id: string;
    name: string;
    description: string;
    icon: string;
    unlockedAt: string;
    category: 'performance' | 'consistency' | 'improvement' | 'special';
  }[];
  goals: {
    id: string;
    description: string;
    target: number;
    current: number;
    deadline: string;
    status: 'active' | 'completed' | 'overdue';
  }[];
}

// Mock data for children with comprehensive information
const mockChildren: Child[] = [
  {
    id: '1',
    name: 'Emma Johnson',
    grade: 'Grade 3',
    avatar: '👧',
    age: 8,
    enrollmentDate: '2023-09-01',
    performance: {
      'gaze-tracking': { 
        bestScore: 95, averageScore: 87, gamesPlayed: 15, lastPlayed: '2024-01-15', improvement: 12,
        scoreHistory: [78, 82, 85, 88, 90, 87, 92, 89, 94, 95],
        timeSpent: 45, accuracy: 89, consistency: 85, difficulty: 'intermediate'
      },
      'gesture-control': { 
        bestScore: 88, averageScore: 82, gamesPlayed: 12, lastPlayed: '2024-01-14', improvement: 8,
        scoreHistory: [75, 78, 80, 82, 85, 83, 86, 84, 87, 88],
        timeSpent: 38, accuracy: 84, consistency: 78, difficulty: 'beginner'
      },
      'mirror-posture': { 
        bestScore: 92, averageScore: 85, gamesPlayed: 18, lastPlayed: '2024-01-15', improvement: 15,
        scoreHistory: [70, 75, 78, 82, 85, 88, 90, 87, 91, 92],
        timeSpent: 52, accuracy: 87, consistency: 82, difficulty: 'intermediate'
      },
      'repeat-with-me': { 
        bestScore: 85, averageScore: 78, gamesPlayed: 10, lastPlayed: '2024-01-13', improvement: 5,
        scoreHistory: [72, 75, 78, 80, 82, 79, 83, 81, 84, 85],
        timeSpent: 28, accuracy: 79, consistency: 75, difficulty: 'beginner'
      },
      'dance-doodle': { 
        bestScore: 90, averageScore: 83, gamesPlayed: 14, lastPlayed: '2024-01-15', improvement: 10,
        scoreHistory: [75, 78, 80, 82, 85, 83, 87, 85, 88, 90],
        timeSpent: 42, accuracy: 85, consistency: 80, difficulty: 'intermediate'
      }
    },
    overallStats: { 
      totalGamesPlayed: 69, averageScore: 83, completionRate: 92, streak: 5,
      totalTimeSpent: 205, learningStyle: 'visual', cognitiveLevel: 'proficient',
      engagement: 88, focus: 85, autismLikelihoodIndex: 12
    },
    achievements: [
      { id: '1', name: 'Eye Master', description: 'Achieved 90+ in Gaze Tracking', icon: '👁️', unlockedAt: '2024-01-10', category: 'performance' },
      { id: '2', name: 'Consistent Player', description: '5 day streak', icon: '🔥', unlockedAt: '2024-01-15', category: 'consistency' }
    ],
    goals: [
      { id: '1', description: 'Reach 90 average in all games', target: 90, current: 83, deadline: '2024-03-01', status: 'active' },
      { id: '2', description: 'Complete 100 games', target: 100, current: 69, deadline: '2024-04-01', status: 'active' }
    ]
  },
  {
    id: '2',
    name: 'Liam Chen',
    grade: 'Grade 3',
    avatar: '👦',
    age: 8,
    enrollmentDate: '2023-09-01',
    performance: {
      'gaze-tracking': { 
        bestScore: 92, averageScore: 85, gamesPlayed: 13, lastPlayed: '2024-01-14', improvement: 8,
        scoreHistory: [78, 80, 82, 84, 86, 85, 88, 87, 90, 92],
        timeSpent: 39, accuracy: 86, consistency: 82, difficulty: 'intermediate'
      },
      'gesture-control': { 
        bestScore: 95, averageScore: 88, gamesPlayed: 16, lastPlayed: '2024-01-15', improvement: 12,
        scoreHistory: [80, 83, 85, 87, 89, 88, 91, 90, 93, 95],
        timeSpent: 48, accuracy: 90, consistency: 87, difficulty: 'advanced'
      },
      'mirror-posture': { 
        bestScore: 88, averageScore: 81, gamesPlayed: 11, lastPlayed: '2024-01-13', improvement: 6,
        scoreHistory: [75, 77, 79, 81, 83, 82, 85, 84, 86, 88],
        timeSpent: 33, accuracy: 82, consistency: 79, difficulty: 'beginner'
      },
      'repeat-with-me': { 
        bestScore: 90, averageScore: 84, gamesPlayed: 15, lastPlayed: '2024-01-15', improvement: 9,
        scoreHistory: [76, 78, 80, 82, 84, 83, 86, 85, 88, 90],
        timeSpent: 45, accuracy: 85, consistency: 81, difficulty: 'intermediate'
      },
      'dance-doodle': { 
        bestScore: 87, averageScore: 80, gamesPlayed: 12, lastPlayed: '2024-01-14', improvement: 7,
        scoreHistory: [73, 75, 77, 79, 81, 80, 83, 82, 85, 87],
        timeSpent: 36, accuracy: 81, consistency: 77, difficulty: 'beginner'
      }
    },
    overallStats: { 
      totalGamesPlayed: 67, averageScore: 83.6, completionRate: 89, streak: 3,
      totalTimeSpent: 201, learningStyle: 'kinesthetic', cognitiveLevel: 'proficient',
      engagement: 85, focus: 88, autismLikelihoodIndex: 28
    },
    achievements: [
      { id: '1', name: 'Gesture Master', description: 'Achieved 95+ in Gesture Control', icon: '✋', unlockedAt: '2024-01-12', category: 'performance' },
      { id: '2', name: 'Quick Learner', description: '10% improvement in a week', icon: '⚡', unlockedAt: '2024-01-08', category: 'improvement' }
    ],
    goals: [
      { id: '1', description: 'Master all games at advanced level', target: 95, current: 83.6, deadline: '2024-03-15', status: 'active' },
      { id: '2', description: 'Increase engagement to 90%', target: 90, current: 85, deadline: '2024-02-28', status: 'active' }
    ]
  },
  {
    id: '3',
    name: 'Sophia Rodriguez',
    grade: 'Grade 4',
    avatar: '👧',
    age: 9,
    enrollmentDate: '2023-09-01',
    performance: {
      'gaze-tracking': { 
        bestScore: 98, averageScore: 91, gamesPlayed: 20, lastPlayed: '2024-01-15', improvement: 18,
        scoreHistory: [85, 87, 89, 91, 93, 92, 95, 94, 96, 98],
        timeSpent: 60, accuracy: 93, consistency: 90, difficulty: 'advanced'
      },
      'gesture-control': { 
        bestScore: 94, averageScore: 87, gamesPlayed: 18, lastPlayed: '2024-01-15', improvement: 14,
        scoreHistory: [80, 83, 85, 87, 89, 88, 91, 90, 92, 94],
        timeSpent: 54, accuracy: 88, consistency: 85, difficulty: 'advanced'
      },
      'mirror-posture': { 
        bestScore: 96, averageScore: 89, gamesPlayed: 22, lastPlayed: '2024-01-15', improvement: 16,
        scoreHistory: [82, 85, 87, 89, 91, 90, 93, 92, 94, 96],
        timeSpent: 66, accuracy: 90, consistency: 87, difficulty: 'advanced'
      },
      'repeat-with-me': { 
        bestScore: 92, averageScore: 86, gamesPlayed: 16, lastPlayed: '2024-01-14', improvement: 11,
        scoreHistory: [78, 80, 82, 84, 86, 85, 88, 87, 90, 92],
        timeSpent: 48, accuracy: 87, consistency: 83, difficulty: 'intermediate'
      },
      'dance-doodle': { 
        bestScore: 95, averageScore: 88, gamesPlayed: 19, lastPlayed: '2024-01-15', improvement: 13,
        scoreHistory: [80, 82, 84, 86, 88, 87, 90, 89, 92, 95],
        timeSpent: 57, accuracy: 89, consistency: 86, difficulty: 'advanced'
      }
    },
    overallStats: { 
      totalGamesPlayed: 95, averageScore: 88.2, completionRate: 96, streak: 8,
      totalTimeSpent: 285, learningStyle: 'mixed', cognitiveLevel: 'advanced',
      engagement: 94, focus: 92, autismLikelihoodIndex: 7
    },
    achievements: [
      { id: '1', name: 'All-Star Player', description: '90+ average in all games', icon: '⭐', unlockedAt: '2024-01-05', category: 'performance' },
      { id: '2', name: 'Streak Master', description: '8 day streak', icon: '🔥', unlockedAt: '2024-01-15', category: 'consistency' },
      { id: '3', name: 'Rapid Improver', description: '15%+ improvement', icon: '📈', unlockedAt: '2024-01-10', category: 'improvement' }
    ],
    goals: [
      { id: '1', description: 'Maintain 90+ average', target: 90, current: 88.2, deadline: '2024-03-01', status: 'active' },
      { id: '2', description: 'Reach 100 games played', target: 100, current: 95, deadline: '2024-02-15', status: 'active' }
    ]
  },
  {
    id: '4',
    name: 'Noah Williams',
    grade: 'Grade 4',
    avatar: '👦',
    age: 9,
    enrollmentDate: '2023-09-01',
    performance: {
      'gaze-tracking': { 
        bestScore: 85, averageScore: 78, gamesPlayed: 8, lastPlayed: '2024-01-12', improvement: 3,
        scoreHistory: [70, 72, 74, 76, 78, 77, 80, 79, 82, 85],
        timeSpent: 24, accuracy: 79, consistency: 72, difficulty: 'beginner'
      },
      'gesture-control': { 
        bestScore: 82, averageScore: 75, gamesPlayed: 7, lastPlayed: '2024-01-11', improvement: 2,
        scoreHistory: [68, 70, 72, 74, 76, 75, 78, 77, 80, 82],
        timeSpent: 21, accuracy: 76, consistency: 70, difficulty: 'beginner'
      },
      'mirror-posture': { 
        bestScore: 88, averageScore: 80, gamesPlayed: 9, lastPlayed: '2024-01-13', improvement: 4,
        scoreHistory: [72, 74, 76, 78, 80, 79, 82, 81, 85, 88],
        timeSpent: 27, accuracy: 81, consistency: 75, difficulty: 'beginner'
      },
      'repeat-with-me': { 
        bestScore: 80, averageScore: 73, gamesPlayed: 6, lastPlayed: '2024-01-10', improvement: 1,
        scoreHistory: [68, 70, 72, 74, 76, 75, 78, 77, 79, 80],
        timeSpent: 18, accuracy: 74, consistency: 68, difficulty: 'beginner'
      },
      'dance-doodle': { 
        bestScore: 83, averageScore: 76, gamesPlayed: 8, lastPlayed: '2024-01-12', improvement: 2,
        scoreHistory: [70, 72, 74, 76, 78, 77, 80, 79, 81, 83],
        timeSpent: 24, accuracy: 77, consistency: 71, difficulty: 'beginner'
      }
    },
    overallStats: { 
      totalGamesPlayed: 38, averageScore: 76.4, completionRate: 76, streak: 1,
      totalTimeSpent: 114, learningStyle: 'auditory', cognitiveLevel: 'developing',
      engagement: 72, focus: 68, autismLikelihoodIndex: 42
    },
    achievements: [
      { id: '1', name: 'Getting Started', description: 'First game completed', icon: '🎮', unlockedAt: '2024-01-05', category: 'special' }
    ],
    goals: [
      { id: '1', description: 'Reach 80 average score', target: 80, current: 76.4, deadline: '2024-03-01', status: 'active' },
      { id: '2', description: 'Complete 50 games', target: 50, current: 38, deadline: '2024-04-01', status: 'active' }
    ]
  }
];

const gameNames: { [key: string]: string } = {
  'gaze-tracking': 'Gaze Tracking',
  'gesture-control': 'Gesture Control',
  'mirror-posture': 'Mirror Posture',
  'repeat-with-me': 'Repeat With Me',
  'dance-doodle': 'Dance Doodle'
};

const gameIcons: { [key: string]: string } = {
  'gaze-tracking': '👁️',
  'gesture-control': '✋',
  'mirror-posture': '🧍',
  'repeat-with-me': '🔄',
  'dance-doodle': '💃'
};

const gameCategories: { [key: string]: string } = {
  'gaze-tracking': 'Cognitive',
  'gesture-control': 'Motor Skills',
  'mirror-posture': 'Physical',
  'repeat-with-me': 'Memory',
  'dance-doodle': 'Creative'
};

const ChildProgressComparison: React.FC = () => {
  const { school } = useSchoolAuth();
  const [selectedChild1, setSelectedChild1] = useState<Child | null>(null);
  const [selectedChild2, setSelectedChild2] = useState<Child | null>(null);
  const [searchTerm1, setSearchTerm1] = useState('');
  const [searchTerm2, setSearchTerm2] = useState('');
  const [showComparison, setShowComparison] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'detailed' | 'trends' | 'insights' | 'goals'>('overview');
  const [selectedMetric, setSelectedMetric] = useState<'scores' | 'time' | 'consistency' | 'improvement'>('scores');
  const [selectedGames, setSelectedGames] = useState<string[]>(Object.keys(gameNames));
  
  // New state for real data
  const [realChildren, setRealChildren] = useState<SchoolChild[]>([]);
  const [childrenStats, setChildrenStats] = useState({ totalChildren: 0, totalGrades: 0 });
  const [isLoadingChildren, setIsLoadingChildren] = useState(true);
  
  // Session statistics state
  const [child1SessionStats, setChild1SessionStats] = useState<ChildSessionStats | null>(null);
  const [child2SessionStats, setChild2SessionStats] = useState<ChildSessionStats | null>(null);
  const [isLoadingSessionStats, setIsLoadingSessionStats] = useState(false);
  
  // Game data state for detailed analysis
  const [child1GameData, setChild1GameData] = useState<GameSession[]>([]);
  const [child2GameData, setChild2GameData] = useState<GameSession[]>([]);
  const [isLoadingGameData, setIsLoadingGameData] = useState(false);
  
  // Trends chart data state
  const [trendsData, setTrendsData] = useState<any[]>([]);
  const [isLoadingTrends, setIsLoadingTrends] = useState(false);

  // Convert SchoolChild to Child format for comparison
  const convertToChild = (schoolChild: SchoolChild): Child => {
    return {
      id: schoolChild.id.toString(),
      name: schoolChild.name,
      grade: schoolChild.grade,
      avatar: '👤',
      age: schoolChild.age,
      enrollmentDate: schoolChild.enrollmentDate,
      performance: {
        'gaze-tracking': { 
          bestScore: Math.floor(Math.random() * 30) + 70, 
          averageScore: Math.floor(Math.random() * 20) + 70, 
          gamesPlayed: Math.floor(Math.random() * 15) + 5, 
          lastPlayed: new Date().toISOString().split('T')[0], 
          improvement: Math.floor(Math.random() * 20) + 5,
          scoreHistory: Array.from({ length: 10 }, () => Math.floor(Math.random() * 30) + 70),
          timeSpent: Math.floor(Math.random() * 60) + 30, 
          accuracy: Math.floor(Math.random() * 20) + 70, 
          consistency: Math.floor(Math.random() * 20) + 70, 
          difficulty: 'intermediate' as const
        },
        'gesture-control': { 
          bestScore: Math.floor(Math.random() * 30) + 70, 
          averageScore: Math.floor(Math.random() * 20) + 70, 
          gamesPlayed: Math.floor(Math.random() * 15) + 5, 
          lastPlayed: new Date().toISOString().split('T')[0], 
          improvement: Math.floor(Math.random() * 20) + 5,
          scoreHistory: Array.from({ length: 10 }, () => Math.floor(Math.random() * 30) + 70),
          timeSpent: Math.floor(Math.random() * 60) + 30, 
          accuracy: Math.floor(Math.random() * 20) + 70, 
          consistency: Math.floor(Math.random() * 20) + 70, 
          difficulty: 'beginner' as const
        },
        'mirror-posture': { 
          bestScore: Math.floor(Math.random() * 30) + 70, 
          averageScore: Math.floor(Math.random() * 20) + 70, 
          gamesPlayed: Math.floor(Math.random() * 15) + 5, 
          lastPlayed: new Date().toISOString().split('T')[0], 
          improvement: Math.floor(Math.random() * 20) + 5,
          scoreHistory: Array.from({ length: 10 }, () => Math.floor(Math.random() * 30) + 70),
          timeSpent: Math.floor(Math.random() * 60) + 30, 
          accuracy: Math.floor(Math.random() * 20) + 70, 
          consistency: Math.floor(Math.random() * 20) + 70, 
          difficulty: 'intermediate' as const
        },
        'repeat-with-me': { 
          bestScore: Math.floor(Math.random() * 30) + 70, 
          averageScore: Math.floor(Math.random() * 20) + 70, 
          gamesPlayed: Math.floor(Math.random() * 15) + 5, 
          lastPlayed: new Date().toISOString().split('T')[0], 
          improvement: Math.floor(Math.random() * 20) + 5,
          scoreHistory: Array.from({ length: 10 }, () => Math.floor(Math.random() * 30) + 70),
          timeSpent: Math.floor(Math.random() * 60) + 30, 
          accuracy: Math.floor(Math.random() * 20) + 70, 
          consistency: Math.floor(Math.random() * 20) + 70, 
          difficulty: 'beginner' as const
        },
        'dance-doodle': { 
          bestScore: Math.floor(Math.random() * 30) + 70, 
          averageScore: Math.floor(Math.random() * 20) + 70, 
          gamesPlayed: Math.floor(Math.random() * 15) + 5, 
          lastPlayed: new Date().toISOString().split('T')[0], 
          improvement: Math.floor(Math.random() * 20) + 5,
          scoreHistory: Array.from({ length: 10 }, () => Math.floor(Math.random() * 30) + 70),
          timeSpent: Math.floor(Math.random() * 60) + 30, 
          accuracy: Math.floor(Math.random() * 20) + 70, 
          consistency: Math.floor(Math.random() * 20) + 70, 
          difficulty: 'intermediate' as const
        }
      },
      overallStats: {
        totalGamesPlayed: schoolChild.gamesPlayed,
        averageScore: schoolChild.overallScore,
        completionRate: Math.floor(Math.random() * 30) + 70,
        streak: Math.floor(Math.random() * 10) + 1,
        totalTimeSpent: Math.floor(Math.random() * 200) + 100,
        learningStyle: 'visual' as const,
        cognitiveLevel: 'proficient' as const,
        engagement: Math.floor(Math.random() * 30) + 70,
        focus: Math.floor(Math.random() * 30) + 70,
        autismLikelihoodIndex: Math.floor(Math.random() * 30) + 10
      },
      achievements: [],
      goals: []
    };
  };

  // Fetch real children data
  useEffect(() => {
    const fetchChildrenData = async () => {
      if (!school?.id) return;
      
      try {
        setIsLoadingChildren(true);
        const children = await childrenService.getChildrenBySchool(Number(school.id));
        setRealChildren(children);
        
        // Calculate stats
        const totalChildren = children.length;
        const uniqueGrades = new Set(children.map(child => child.grade));
        const totalGrades = uniqueGrades.size;
        
        setChildrenStats({ totalChildren, totalGrades });
      } catch (error) {
        console.error('Error fetching children data:', error);
      } finally {
        setIsLoadingChildren(false);
      }
    };

    fetchChildrenData();
  }, [school?.id]);

  // Fetch session statistics when children are selected
  useEffect(() => {
    const fetchSessionStats = async () => {
      if (!selectedChild1 && !selectedChild2) return;
      
      setIsLoadingSessionStats(true);
      try {
        if (selectedChild1) {
          const stats1 = await childSessionService.getChildSessionStats(selectedChild1.id);
          setChild1SessionStats(stats1);
        }
        if (selectedChild2) {
          const stats2 = await childSessionService.getChildSessionStats(selectedChild2.id);
          setChild2SessionStats(stats2);
        }
      } catch (error) {
        console.error('Error fetching session stats:', error);
      } finally {
        setIsLoadingSessionStats(false);
      }
    };

    fetchSessionStats();
  }, [selectedChild1, selectedChild2]);

  // Fetch game data when children are selected - NEW APPROACH: Fetch each game type separately
  useEffect(() => {
    const fetchGameDataForEachType = async () => {
      if (!selectedChild1 && !selectedChild2) return;
      
      setIsLoadingGameData(true);
      try {
        // Fetch data for each game type separately for both children
        const gameTypes = ['gesture', 'mirror', 'dance', 'repeat', 'gaze'];
        const child1Scores: {[key: string]: {score: number, sessions: number}} = {};
        const child2Scores: {[key: string]: {score: number, sessions: number}} = {};
        
        for (const gameType of gameTypes) {
          if (selectedChild1) {
            let result = {score: 0, sessions: 0};
            switch (gameType) {
              case 'gesture':
                result = await fetchAndCalculateGestureGameScore(selectedChild1.id);
                break;
              case 'mirror':
                result = await fetchAndCalculateMirrorPostureGameScore(selectedChild1.id);
                break;
              case 'dance':
                result = await fetchAndCalculateDanceDoodleGameScore(selectedChild1.id);
                break;
              case 'repeat':
                result = await fetchAndCalculateRepeatWithMeGameScore(selectedChild1.id);
                break;
              case 'gaze':
                result = await fetchAndCalculateGazeGameScore(selectedChild1.id);
                break;
            }
            child1Scores[gameType] = result;
          }
          
          if (selectedChild2) {
            let result = {score: 0, sessions: 0};
            switch (gameType) {
              case 'gesture':
                result = await fetchAndCalculateGestureGameScore(selectedChild2.id);
                break;
              case 'mirror':
                result = await fetchAndCalculateMirrorPostureGameScore(selectedChild2.id);
                break;
              case 'dance':
                result = await fetchAndCalculateDanceDoodleGameScore(selectedChild2.id);
                break;
              case 'repeat':
                result = await fetchAndCalculateRepeatWithMeGameScore(selectedChild2.id);
                break;
              case 'gaze':
                result = await fetchAndCalculateGazeGameScore(selectedChild2.id);
                break;
            }
            child2Scores[gameType] = result;
          }
        }
        
        // Store the calculated scores
        setChild1GameData(child1Scores as any);
        setChild2GameData(child2Scores as any);
        
        console.log('Child 1 calculated scores:', child1Scores);
        console.log('Child 2 calculated scores:', child2Scores);
        
      } catch (error) {
        console.error('Error fetching game data:', error);
      } finally {
        setIsLoadingGameData(false);
      }
    };

    fetchGameDataForEachType();
  }, [selectedChild1, selectedChild2]);

  // Fetch trends data when trends tab is active and children are selected
  useEffect(() => {
    const fetchTrendsData = async () => {
      if (activeTab === 'trends' && selectedChild1 && selectedChild2 && selectedGames.length > 0) {
        setIsLoadingTrends(true);
        try {
          const data = await getGraphData();
          setTrendsData(data);
        } catch (error) {
          console.error('Error fetching trends data:', error);
        } finally {
          setIsLoadingTrends(false);
        }
      }
    };

    fetchTrendsData();
  }, [activeTab, selectedChild1, selectedChild2, selectedGames]);

  // Handle game selection
  const handleGameSelection = (gameId: string) => {
    setSelectedGames(prev => 
      prev.includes(gameId) 
        ? prev.filter(id => id !== gameId)
        : [...prev, gameId]
    );
  };

  // Fetch last 10 sessions with individual scores for trends chart
  const fetchLast10SessionsForTrends = async (childId: string, gameType: string): Promise<{session: number, score: number}[]> => {
    try {
      let response;
      let sessions;
      
      // Fetch sessions based on game type
      switch (gameType) {
        case 'gesture-control':
          response = await fetch(`http://localhost:8084/api/gesture-game/child/${childId}`);
          if (response.ok) {
            sessions = await response.json();
            return calculateGestureSessionScores(sessions);
          }
          break;
        case 'mirror-posture':
          response = await fetch(`http://localhost:8083/api/mirror-posture-game/child/${childId}`);
          if (response.ok) {
            sessions = await response.json();
            return calculateMirrorSessionScores(sessions);
          }
          break;
        case 'dance-doodle':
          response = await fetch(`http://localhost:8087/api/dance-doodle/child/${childId}`);
          if (response.ok) {
            sessions = await response.json();
            return calculateDanceSessionScores(sessions);
          }
          break;
        case 'repeat-with-me':
          response = await fetch(`http://localhost:8089/api/repeat-with-me-game/child/${childId}`);
          if (response.ok) {
            sessions = await response.json();
            return calculateRepeatSessionScores(sessions);
          }
          break;
        case 'gaze-tracking':
          response = await fetch(`http://localhost:8086/api/gaze-game/child/${childId}`);
          if (response.ok) {
            sessions = await response.json();
            return calculateGazeSessionScores(sessions);
          }
          break;
      }
    } catch (error) {
      console.error(`Error fetching sessions for trends: ${gameType}`, error);
    }
    return [];
  };

  // Calculate individual session scores for gesture game
  const calculateGestureSessionScores = (sessions: any[]): {session: number, score: number}[] => {
    return sessions.slice(-10).map((session, index) => {
      const gestureFields = [
        session.thumbs_up, session.thumbs_down, session.victory, session.butterfly,
        session.spectacle, session.heart, session.pointing_up, session.iloveyou,
        session.dua, session.closed_fist, session.open_palm
      ];
      
      const validFields = gestureFields.filter(time => time !== null && time !== undefined);
      const sessionScore = validFields.length > 0 ? validFields.reduce((sum, time) => sum + time, 0) : 0;
      
      return {
        session: index + 1,
        score: sessionScore
      };
    });
  };

  // Calculate individual session scores for mirror posture game
  const calculateMirrorSessionScores = (sessions: any[]): {session: number, score: number}[] => {
    return sessions.slice(-10).map((session, index) => {
      const postureFields = [
        session.lookingSideways, session.mouthOpen, session.showingTeeth, session.kiss
      ];
      
      const validFields = postureFields.filter(time => time !== null && time !== undefined);
      const sessionScore = validFields.length > 0 ? validFields.reduce((sum, time) => sum + time, 0) : 0;
      
      return {
        session: index + 1,
        score: sessionScore
      };
    });
  };

  // Calculate individual session scores for dance doodle game
  const calculateDanceSessionScores = (sessions: any[]): {session: number, score: number}[] => {
    return sessions.slice(-10).map((session, index) => {
      const danceFields = [
        session.cool_arms, session.open_wings, session.silly_boxer, session.happy_stand,
        session.crossy_play, session.shh_fun, session.stretch
      ];
      
      const validFields = danceFields.filter(time => time !== null && time !== undefined);
      const sessionScore = validFields.length > 0 ? validFields.reduce((sum, time) => sum + time, 0) : 0;
      
      return {
        session: index + 1,
        score: sessionScore
      };
    });
  };

  // Calculate individual session scores for repeat with me game
  const calculateRepeatSessionScores = (sessions: any[]): {session: number, score: number}[] => {
    return sessions.slice(-10).map((session, index) => {
      const roundFields = [
        session.round1Score, session.round2Score, session.round3Score, session.round4Score,
        session.round5Score, session.round6Score, session.round7Score, session.round8Score,
        session.round9Score, session.round10Score, session.round11Score, session.round12Score
      ];
      
      const validFields = roundFields.filter(score => score !== null && score !== undefined);
      const sessionScore = validFields.length > 0 ? validFields.reduce((sum, score) => sum + score, 0) / validFields.length : 0;
      
      return {
        session: index + 1,
        score: sessionScore
      };
    });
  };

  // Calculate individual session scores for gaze game
  const calculateGazeSessionScores = (sessions: any[]): {session: number, score: number}[] => {
    return sessions.slice(-10).map((session, index) => {
      const roundFields = [session.round1Count, session.round2Count, session.round3Count];
      
      const validFields = roundFields.filter(count => count !== null && count !== undefined);
      const sessionScore = validFields.length > 0 ? validFields.reduce((sum, count) => sum + count, 0) : 0;
      
      return {
        session: index + 1,
        score: sessionScore
      };
    });
  };

  // Get all session data for selected games - NEW APPROACH: Use real data
  const getGraphData = async () => {
    if (!selectedChild1 || !selectedChild2) return [];
    
    const data = [];
    for (const gameId of selectedGames) {
      try {
        const child1Data = await fetchLast10SessionsForTrends(selectedChild1.id, gameId);
        const child2Data = await fetchLast10SessionsForTrends(selectedChild2.id, gameId);
        
        data.push({
          gameId,
          gameName: gameNames[gameId],
          child1: child1Data,
          child2: child2Data
        });
      } catch (error) {
        console.error(`Error fetching graph data for ${gameId}:`, error);
        // Add empty data for failed requests
        data.push({
          gameId,
          gameName: gameNames[gameId],
          child1: [],
          child2: []
        });
      }
    }
    
    return data;
  };


  // Fetch and calculate scores for each game type separately
  const fetchAndCalculateGestureGameScore = async (childId: string): Promise<{score: number, sessions: number}> => {
    try {
      // Fetch gesture game sessions directly from gesture game service
      const response = await fetch(`http://localhost:8084/api/gesture-game/child/${childId}`);
      if (response.ok) {
        const sessions = await response.json();
        console.log(`Gesture sessions for child ${childId}:`, sessions);
        
        if (!sessions || sessions.length === 0) return {score: 0, sessions: 0};
        
        let totalTime = 0;
        let validSessions = 0;
        
        sessions.forEach((session: any) => {
          const gestureFields = [
            session.thumbs_up, session.thumbs_down, session.victory, session.butterfly,
            session.spectacle, session.heart, session.pointing_up, session.iloveyou,
            session.dua, session.closed_fist, session.open_palm
          ];
          
          const hasAllPosesCompleted = gestureFields.every(time => time !== null && time !== undefined);
          
          if (hasAllPosesCompleted) {
            const sessionTotalTime = gestureFields.reduce((sum, time) => sum + time, 0);
            totalTime += sessionTotalTime;
            validSessions++;
          }
        });
        
        return {
          score: validSessions > 0 ? totalTime / validSessions : 0,
          sessions: validSessions
        };
      }
    } catch (error) {
      console.error(`Error fetching gesture data for child ${childId}:`, error);
    }
    return {score: 0, sessions: 0};
  };

  const fetchAndCalculateMirrorPostureGameScore = async (childId: string): Promise<{score: number, sessions: number}> => {
    try {
      const response = await fetch(`http://localhost:8083/api/mirror-posture-game/child/${childId}`);
      if (response.ok) {
        const sessions = await response.json();
        console.log(`Mirror posture sessions for child ${childId}:`, sessions);
        
        if (!sessions || sessions.length === 0) return {score: 0, sessions: 0};
        
        let totalTime = 0;
        let validSessions = 0;
        
        sessions.forEach((session: any) => {
          const postureFields = [
            session.lookingSideways, session.mouthOpen, session.showingTeeth, session.kiss
          ];
          
          const hasAllPosturesCompleted = postureFields.every(time => time !== null && time !== undefined);
          
          if (hasAllPosturesCompleted) {
            const sessionTotalTime = postureFields.reduce((sum, time) => sum + time, 0);
            totalTime += sessionTotalTime;
            validSessions++;
          }
        });
        
        return {
          score: validSessions > 0 ? totalTime / validSessions : 0,
          sessions: validSessions
        };
      }
    } catch (error) {
      console.error(`Error fetching mirror posture data for child ${childId}:`, error);
    }
    return {score: 0, sessions: 0};
  };

  const fetchAndCalculateDanceDoodleGameScore = async (childId: string): Promise<{score: number, sessions: number}> => {
    try {
      const response = await fetch(`http://localhost:8087/api/dance-doodle/child/${childId}`);
      if (response.ok) {
        const sessions = await response.json();
        console.log(`Dance doodle sessions for child ${childId}:`, sessions);
        
        if (!sessions || sessions.length === 0) return {score: 0, sessions: 0};
        
        let totalTime = 0;
        let validSessions = 0;
        
        sessions.forEach((session: any) => {
          const danceFields = [
            session.cool_arms, session.open_wings, session.silly_boxer, session.happy_stand,
            session.crossy_play, session.shh_fun, session.stretch
          ];
          
          const hasAllPosesCompleted = danceFields.every(time => time !== null && time !== undefined);
          
          if (hasAllPosesCompleted) {
            const sessionTotalTime = danceFields.reduce((sum, time) => sum + time, 0);
            totalTime += sessionTotalTime;
            validSessions++;
          }
        });
        
        return {
          score: validSessions > 0 ? totalTime / validSessions : 0,
          sessions: validSessions
        };
      }
    } catch (error) {
      console.error(`Error fetching dance doodle data for child ${childId}:`, error);
    }
    return {score: 0, sessions: 0};
  };

  const fetchAndCalculateRepeatWithMeGameScore = async (childId: string): Promise<{score: number, sessions: number}> => {
    try {
      const response = await fetch(`http://localhost:8089/api/repeat-with-me-game/child/${childId}`);
      if (response.ok) {
        const sessions = await response.json();
        console.log(`Repeat with me sessions for child ${childId}:`, sessions);
        
        if (!sessions || sessions.length === 0) return {score: 0, sessions: 0};
        
        let totalSimilarity = 0;
        let validSessions = 0;
        
        sessions.forEach((session: any) => {
          const roundFields = [
            session.round1Score, session.round2Score, session.round3Score, session.round4Score,
            session.round5Score, session.round6Score, session.round7Score, session.round8Score,
            session.round9Score, session.round10Score, session.round11Score, session.round12Score
          ];
          
          const hasAllRoundsCompleted = roundFields.every(score => score !== null && score !== undefined);
          
          if (hasAllRoundsCompleted) {
            const sessionAverageSimilarity = roundFields.reduce((sum, score) => sum + score, 0) / roundFields.length;
            totalSimilarity += sessionAverageSimilarity;
            validSessions++;
          }
        });
        
        return {
          score: validSessions > 0 ? totalSimilarity / validSessions : 0,
          sessions: validSessions
        };
      }
    } catch (error) {
      console.error(`Error fetching repeat with me data for child ${childId}:`, error);
    }
    return {score: 0, sessions: 0};
  };

  const fetchAndCalculateGazeGameScore = async (childId: string): Promise<{score: number, sessions: number}> => {
    try {
      const response = await fetch(`http://localhost:8086/api/gaze-game/child/${childId}`);
      if (response.ok) {
        const sessions = await response.json();
        console.log(`Gaze game sessions for child ${childId}:`, sessions);
        
        if (!sessions || sessions.length === 0) return {score: 0, sessions: 0};
        
        let totalBalloonPops = 0;
        let validSessions = 0;
        
        sessions.forEach((session: any) => {
          const roundFields = [session.round1Count, session.round2Count, session.round3Count];
          
          const hasAllRoundsCompleted = roundFields.every(count => count !== null && count !== undefined);
          
          if (hasAllRoundsCompleted) {
            const sessionTotalPops = roundFields.reduce((sum, count) => sum + count, 0);
            totalBalloonPops += sessionTotalPops;
            validSessions++;
          }
        });
        
        return {
          score: validSessions > 0 ? totalBalloonPops / validSessions : 0,
          sessions: validSessions
        };
      }
    } catch (error) {
      console.error(`Error fetching gaze game data for child ${childId}:`, error);
    }
    return {score: 0, sessions: 0};
  };

  // Get calculated score for a specific game type - NEW APPROACH: Use pre-calculated scores
  const getCalculatedGameScore = (gameData: any, gameType: string): number => {
    // Map gameNames keys to our internal keys
    const gameTypeMap: { [key: string]: string } = {
      'gesture-control': 'gesture',
      'mirror-posture': 'mirror',
      'dance-doodle': 'dance',
      'repeat-with-me': 'repeat',
      'gaze-tracking': 'gaze'
    };
    
    const internalKey = gameTypeMap[gameType];
    if (internalKey && gameData && gameData[internalKey]) {
      return gameData[internalKey].score || 0;
    }
    return 0;
  };

  // Get session count for a specific game type
  const getSessionCount = (gameData: any, gameType: string): number => {
    const gameTypeMap: { [key: string]: string } = {
      'gesture-control': 'gesture',
      'mirror-posture': 'mirror',
      'dance-doodle': 'dance',
      'repeat-with-me': 'repeat',
      'gaze-tracking': 'gaze'
    };
    
    const internalKey = gameTypeMap[gameType];
    if (internalKey && gameData && gameData[internalKey]) {
      return gameData[internalKey].sessions || 0;
    }
    return 0;
  };

  // Get maximum sessions across all selected games
  const getMaxSessions = () => {
    if (!selectedChild1 || !selectedChild2) return 10;
    
    let maxSessions = 0;
    selectedGames.forEach(gameId => {
      const child1Sessions = selectedChild1.performance[gameId].scoreHistory.length;
      const child2Sessions = selectedChild2.performance[gameId].scoreHistory.length;
      maxSessions = Math.max(maxSessions, child1Sessions, child2Sessions);
    });
    
    return maxSessions;
  };

  // Define distinct colors for each game
  const gameColors = {
    'gaze-tracking': '#3B82F6',    // Blue
    'gesture-control': '#10B981',   // Green
    'mirror-posture': '#8B5CF6',    // Purple
    'repeat-with-me': '#F59E0B',    // Orange
    'dance-doodle': '#EF4444'       // Red
  };

  // Filter children based on search terms
  const filteredChildren1 = useMemo(() => {
    if (isLoadingChildren) return [];
    return realChildren.filter(child =>
      child.name.toLowerCase().includes(searchTerm1.toLowerCase()) ||
      child.grade.toLowerCase().includes(searchTerm1.toLowerCase()) ||
      child.id.toString().includes(searchTerm1)
    );
  }, [searchTerm1, realChildren, isLoadingChildren]);

  const filteredChildren2 = useMemo(() => {
    if (isLoadingChildren) return [];
    return realChildren.filter(child =>
      child.name.toLowerCase().includes(searchTerm2.toLowerCase()) ||
      child.grade.toLowerCase().includes(searchTerm2.toLowerCase()) ||
      child.id.toString().includes(searchTerm2)
    );
  }, [searchTerm2, realChildren, isLoadingChildren]);

  const handleCompare = () => {
    if (selectedChild1 && selectedChild2) {
      setShowComparison(true);
    }
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50';
    if (score >= 80) return 'text-blue-600 bg-blue-50';
    if (score >= 70) return 'text-yellow-600 bg-yellow-50';
    return 'text-gray-600 bg-gray-50';
  };

  const getImprovementColor = (improvement: number) => {
    if (improvement > 10) return 'text-green-600';
    if (improvement > 5) return 'text-blue-600';
    if (improvement > 0) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const getALIColor = (ali: number) => {
    if (ali <= 10) return 'text-green-600 bg-green-50';
    if (ali <= 25) return 'text-yellow-600 bg-yellow-50';
    if (ali <= 50) return 'text-orange-600 bg-orange-50';
    return 'text-gray-600 bg-gray-50';
  };

  // Advanced comparison functions
  const getComparisonInsights = () => {
    if (!selectedChild1 || !selectedChild2) return [];
    
    const insights = [];
    const child1 = selectedChild1;
    const child2 = selectedChild2;
    
    // Performance insights
    if (child1.overallStats.averageScore > child2.overallStats.averageScore) {
      insights.push({
        type: 'performance',
        title: 'Overall Performance',
        description: `${child1.name} has a ${(child1.overallStats.averageScore - child2.overallStats.averageScore).toFixed(1)} point higher average score`,
        icon: '📊',
        color: 'blue'
      });
    }
    
    // Engagement insights
    if (child1.overallStats.engagement > child2.overallStats.engagement) {
      insights.push({
        type: 'engagement',
        title: 'Engagement Level',
        description: `${child1.name} shows higher engagement (${child1.overallStats.engagement}% vs ${child2.overallStats.engagement}%)`,
        icon: '🎯',
        color: 'green'
      });
    }
    
    // Learning style insights
    if (child1.overallStats.learningStyle !== child2.overallStats.learningStyle) {
      insights.push({
        type: 'learning',
        title: 'Learning Styles',
        description: `${child1.name} is ${child1.overallStats.learningStyle} learner, ${child2.name} is ${child2.overallStats.learningStyle}`,
        icon: '🧠',
        color: 'purple'
      });
    }
    
    return insights;
  };

  // Generate individual insights for each child
  const getChildInsights = (child) => {
    if (!child) return [];
    
    const insights = [];
    
    // ALI insights
    if (child.autismLikelihoodIndex > 70) {
      insights.push({
        type: 'ali',
        title: 'Autism Likelihood Index',
        description: `ALI score of ${child.autismLikelihoodIndex}% indicates higher likelihood. Consider specialized support.`,
        icon: '🧠',
        color: 'red',
        priority: 'high'
      });
    } else if (child.autismLikelihoodIndex > 50) {
      insights.push({
        type: 'ali',
        title: 'Autism Likelihood Index',
        description: `ALI score of ${child.autismLikelihoodIndex}% suggests moderate likelihood. Monitor progress closely.`,
        icon: '🧠',
        color: 'orange',
        priority: 'medium'
      });
    } else {
      insights.push({
        type: 'ali',
        title: 'Autism Likelihood Index',
        description: `ALI score of ${child.autismLikelihoodIndex}% indicates lower likelihood. Continue current approach.`,
        icon: '🧠',
        color: 'green',
        priority: 'low'
      });
    }
    
    // Performance insights
    const bestGame = Object.keys(child.performance).reduce((a, b) => 
      child.performance[a].bestScore > child.performance[b].bestScore ? a : b
    );
    const worstGame = Object.keys(child.performance).reduce((a, b) => 
      child.performance[a].bestScore < child.performance[b].bestScore ? a : b
    );
    
    insights.push({
      type: 'strength',
      title: 'Strongest Area',
      description: `Excels in ${gameNames[bestGame]} with a best score of ${child.performance[bestGame].bestScore}%`,
      icon: '⭐',
      color: 'green',
      priority: 'low'
    });
    
    insights.push({
      type: 'improvement',
      title: 'Area for Growth',
      description: `Could improve in ${gameNames[worstGame]} (best score: ${child.performance[worstGame].bestScore}%)`,
      icon: '📈',
      color: 'yellow',
      priority: 'medium'
    });
    
    // Engagement insights
    if (child.overallStats.engagement > 80) {
      insights.push({
        type: 'engagement',
        title: 'High Engagement',
        description: `Shows excellent engagement (${child.overallStats.engagement}%). Maintain current motivation strategies.`,
        icon: '🎯',
        color: 'green',
        priority: 'low'
      });
    } else if (child.overallStats.engagement < 60) {
      insights.push({
        type: 'engagement',
        title: 'Low Engagement',
        description: `Engagement level is ${child.overallStats.engagement}%. Consider new motivation techniques.`,
        icon: '⚠️',
        color: 'red',
        priority: 'high'
      });
    }
    
    // Consistency insights
    if (child.overallStats.consistency > 85) {
      insights.push({
        type: 'consistency',
        title: 'Very Consistent',
        description: `Shows excellent consistency (${child.overallStats.consistency}%). Ready for advanced challenges.`,
        icon: '📊',
        color: 'green',
        priority: 'low'
      });
    } else if (child.overallStats.consistency < 70) {
      insights.push({
        type: 'consistency',
        title: 'Inconsistent Performance',
        description: `Consistency is ${child.overallStats.consistency}%. Focus on building routine and practice.`,
        icon: '📉',
        color: 'orange',
        priority: 'medium'
      });
    }
    
    return insights;
  };

  const getStrengthsAndWeaknesses = (child: Child) => {
    const strengths = [];
    const weaknesses = [];
    
    Object.entries(child.performance).forEach(([gameId, perf]) => {
      if (perf.bestScore >= 85) {
        strengths.push({ game: gameNames[gameId], score: perf.bestScore });
      } else if (perf.bestScore < 75) {
        weaknesses.push({ game: gameNames[gameId], score: perf.bestScore });
      }
    });
    
    return { strengths, weaknesses };
  };

  // Helper function to find most liked game (highest average score)
  const getMostLikedGame = (child: Child) => {
    let bestGame = '';
    let bestScore = 0;
    
    Object.entries(child.performance).forEach(([gameId, perf]) => {
      if (perf.averageScore > bestScore) {
        bestScore = perf.averageScore;
        bestGame = gameNames[gameId];
      }
    });
    
    return { game: bestGame, score: bestScore };
  };

  // Helper function to find least liked game (lowest average score)
  const getLeastLikedGame = (child: Child) => {
    let worstGame = '';
    let worstScore = 100;
    
    Object.entries(child.performance).forEach(([gameId, perf]) => {
      if (perf.averageScore < worstScore) {
        worstScore = perf.averageScore;
        worstGame = gameNames[gameId];
      }
    });
    
    return { game: worstGame, score: worstScore };
  };

  const generateRecommendations = () => {
    if (!selectedChild1 || !selectedChild2) return [];
    
    const recommendations = [];
    const child1 = selectedChild1;
    const child2 = selectedChild2;
    
    // Find games where one child significantly outperforms the other
    Object.keys(gameNames).forEach(gameId => {
      const child1Perf = child1.performance[gameId];
      const child2Perf = child2.performance[gameId];
      const diff = Math.abs(child1Perf.averageScore - child2Perf.averageScore);
      
      if (diff > 10) {
        const betterChild = child1Perf.averageScore > child2Perf.averageScore ? child1 : child2;
        const weakerChild = child1Perf.averageScore > child2Perf.averageScore ? child2 : child1;
        
        recommendations.push({
          type: 'improvement',
          title: `${gameNames[gameId]} Performance Gap`,
          description: `${weakerChild.name} could benefit from additional practice in ${gameNames[gameId]}. Consider peer learning with ${betterChild.name}`,
          priority: diff > 15 ? 'high' : 'medium',
          icon: '💡'
        });
      }
    });
    
    return recommendations;
  };

  // Chart data generation
  const getChartData = (metric: 'scores' | 'time' | 'consistency' | 'improvement') => {
    if (!selectedChild1 || !selectedChild2) return { labels: [], datasets: [] };
    
    const labels = Object.keys(gameNames).map(gameId => gameNames[gameId]);
    const child1Data = Object.keys(gameNames).map(gameId => {
      const perf = selectedChild1.performance[gameId];
      switch (metric) {
        case 'scores': return perf.averageScore;
        case 'time': return perf.timeSpent;
        case 'consistency': return perf.consistency;
        case 'improvement': return perf.improvement;
        default: return 0;
      }
    });
    
    const child2Data = Object.keys(gameNames).map(gameId => {
      const perf = selectedChild2.performance[gameId];
      switch (metric) {
        case 'scores': return perf.averageScore;
        case 'time': return perf.timeSpent;
        case 'consistency': return perf.consistency;
        case 'improvement': return perf.improvement;
        default: return 0;
      }
    });
    
    return {
      labels,
      datasets: [
        {
          label: selectedChild1.name,
          data: child1Data,
          backgroundColor: 'rgba(59, 130, 246, 0.5)',
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 2
        },
        {
          label: selectedChild2.name,
          data: child2Data,
          backgroundColor: 'rgba(16, 185, 129, 0.5)',
          borderColor: 'rgba(16, 185, 129, 1)',
          borderWidth: 2
        }
      ]
    };
  };

  const exportComparison = () => {
    if (!selectedChild1 || !selectedChild2) return;
    
    const data = {
      comparisonDate: new Date().toISOString(),
      children: [selectedChild1, selectedChild2],
      insights: getComparisonInsights(),
      recommendations: generateRecommendations()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `comparison-${selectedChild1.name}-${selectedChild2.name}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BarChart3 className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Advanced Child Progress Comparison</h1>
                <p className="text-gray-600">Comprehensive analysis and insights for educational planning</p>
              </div>
            </div>
            {showComparison && (
              <div className="flex items-center gap-3">
                <button
                  onClick={exportComparison}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  Export Report
                </button>
              </div>
            )}
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {isLoadingChildren ? '...' : childrenStats.totalChildren}
                  </div>
                  <div className="text-sm text-gray-600">Total Children</div>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Target className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {isLoadingChildren ? '...' : childrenStats.totalGrades}
                  </div>
                  <div className="text-sm text-gray-600">Total Grades</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Child Selection */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Select Children to Compare
            </h2>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-500">Advanced Comparison Tool</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Child 1 Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                First Child
              </label>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, grade, or child ID..."
                  value={searchTerm1}
                  onChange={(e) => setSearchTerm1(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {isLoadingChildren ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-gray-500">Loading children...</div>
                  </div>
                ) : filteredChildren1.length === 0 ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-gray-500">No children found</div>
                  </div>
                ) : (
                  filteredChildren1.map((child) => (
                    <div
                      key={child.id}
                      onClick={() => setSelectedChild1(convertToChild(child))}
                      className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                        selectedChild1?.id === child.id.toString()
                          ? 'border-blue-500 bg-blue-50 shadow-md'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">👤</span>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{child.name}</div>
                          <div className="text-sm text-gray-500">
                            ID: {child.id} • {child.grade} • Age {child.age}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Child 2 Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Second Child
              </label>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, grade, or child ID..."
                  value={searchTerm2}
                  onChange={(e) => setSearchTerm2(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {isLoadingChildren ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-gray-500">Loading children...</div>
                  </div>
                ) : filteredChildren2.length === 0 ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-gray-500">No children found</div>
                  </div>
                ) : (
                  filteredChildren2.map((child) => (
                    <div
                      key={child.id}
                      onClick={() => setSelectedChild2(convertToChild(child))}
                      className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                        selectedChild2?.id === child.id.toString()
                          ? 'border-blue-500 bg-blue-50 shadow-md'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">👤</span>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{child.name}</div>
                          <div className="text-sm text-gray-500">
                            ID: {child.id} • {child.grade} • Age {child.age}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Enhanced Compare Button */}
          <div className="mt-8 flex justify-center">
            <button
              onClick={handleCompare}
              disabled={!selectedChild1 || !selectedChild2}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-3 shadow-lg hover:shadow-xl"
            >
              <BarChart3 className="h-5 w-5" />
              Start Advanced Comparison
              <Zap className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Advanced Comparison Results */}
        {showComparison && selectedChild1 && selectedChild2 && (
          <div className="space-y-8">
            {/* Tab Navigation */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Comparison Analysis</h2>
              </div>
              
              <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                {[
                  { id: 'overview', label: 'Overview', icon: BarChart3 },
                  { id: 'detailed', label: 'Detailed Analysis', icon: Target },
                  { id: 'trends', label: 'Trends & Charts', icon: TrendingUp },
                  { id: 'insights', label: 'AI Insights', icon: Lightbulb }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <tab.icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Enhanced Overview Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Child 1 Overview */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <span className="text-4xl">{selectedChild1.avatar}</span>
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900">{selectedChild1.name}</h3>
                          <p className="text-gray-500">{selectedChild1.grade} • Age {selectedChild1.age}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                              selectedChild1.overallStats.cognitiveLevel === 'advanced' ? 'bg-green-100 text-green-800' :
                              selectedChild1.overallStats.cognitiveLevel === 'proficient' ? 'bg-blue-100 text-blue-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {selectedChild1.overallStats.cognitiveLevel}
                            </div>
                            <div className="text-xs text-gray-500">
                              {selectedChild1.overallStats.learningStyle} learner
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">{selectedChild1.overallStats.averageScore}</div>
                        <div className="text-sm text-gray-600">Overall Score</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="group relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl border border-blue-200/50 p-4 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1 h-24 flex items-center justify-center">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative text-center">
                          <div className="text-2xl font-bold text-gray-800 mb-1">
                            {isLoadingSessionStats ? '...' : (child1SessionStats?.totalGameSessions || 0)}
                          </div>
                          <div className="text-xs font-medium text-gray-600">Total Game Sessions</div>
                        </div>
                      </div>
                      
                      <div className="group relative overflow-hidden bg-gradient-to-br from-orange-50 to-amber-100 rounded-xl border border-orange-200/50 p-4 transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/10 hover:-translate-y-1 h-24 flex items-center justify-center">
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative text-center">
                          <div className="text-2xl font-bold text-gray-800 mb-1">
                            {isLoadingSessionStats ? '...' : '2'}
                          </div>
                          <div className="text-xs font-medium text-gray-600">Last Played (days ago)</div>
                        </div>
                      </div>
                      
                      <div className="group relative overflow-hidden bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl border border-green-200/50 p-4 transition-all duration-300 hover:shadow-xl hover:shadow-green-500/10 hover:-translate-y-1 h-24 flex items-center justify-center">
                        <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative text-center">
                          <div className="text-2xl font-bold text-gray-800 mb-1">
                            {isLoadingSessionStats ? '...' : (child1SessionStats?.sessionCompletionRate || 0)}%
                          </div>
                          <div className="text-xs font-medium text-gray-600">Session Completion Rate</div>
                        </div>
                      </div>
                      
                      <div className="group relative overflow-hidden bg-gradient-to-br from-purple-50 to-violet-100 rounded-xl border border-purple-200/50 p-4 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10 hover:-translate-y-1 h-32">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-violet-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative text-center h-full flex flex-col justify-center">
                          <div className="text-2xl font-bold text-gray-800 mb-1">{selectedChild1.overallStats.autismLikelihoodIndex}%</div>
                          <div className="text-xs font-medium text-gray-600 mb-2">Autism Likelihood Index</div>
                          <div className="relative">
                            <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-amber-500 via-orange-500 to-red-500 rounded-full animate-pulse"></div>
                              {/* Threshold marker at 70% */}
                              <div 
                                className="absolute top-0 w-0.5 h-4 bg-gray-800 transform -translate-x-1/2 -translate-y-1 shadow-sm"
                                style={{ left: '70%' }}
                              ></div>
                              <div 
                                className="absolute top-0 w-3 h-3 bg-white border-2 border-gray-700 rounded-full transform -translate-x-1/2 -translate-y-0.5 shadow-lg transition-all duration-500 group-hover:scale-110"
                                style={{ left: `${selectedChild1.overallStats.autismLikelihoodIndex}%` }}
                              ></div>
                            </div>
                            <div className="text-xs text-gray-500 mt-1 text-center font-medium">
                              Threshold: 70%
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Game Preferences */}
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="group relative overflow-hidden bg-gradient-to-br from-emerald-50 to-green-100 rounded-xl border border-emerald-200/50 p-4 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-1 h-20 flex items-center justify-center">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative text-center">
                          <div className="text-lg font-bold text-gray-800 mb-1">
                            {isLoadingSessionStats ? '...' : (child1SessionStats?.mostPlayedGame || 'None')}
                          </div>
                          <div className="text-xs font-medium text-gray-600 mb-1">Most Played Game</div>
                          <div className="inline-flex items-center px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold">
                            {isLoadingSessionStats ? '...' : (child1SessionStats?.gameSessionCounts[Object.keys(child1SessionStats?.gameSessionCounts || {}).reduce((a, b) => (child1SessionStats?.gameSessionCounts[a] || 0) > (child1SessionStats?.gameSessionCounts[b] || 0) ? a : b, '')] || 0)} sessions
                          </div>
                        </div>
                      </div>
                      
                      <div className="group relative overflow-hidden bg-gradient-to-br from-rose-50 to-red-100 rounded-xl border border-rose-200/50 p-4 transition-all duration-300 hover:shadow-xl hover:shadow-rose-500/10 hover:-translate-y-1 h-20 flex items-center justify-center">
                        <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative text-center">
                          <div className="text-lg font-bold text-gray-800 mb-1">
                            {isLoadingSessionStats ? '...' : (child1SessionStats?.leastPlayedGame || 'None')}
                          </div>
                          <div className="text-xs font-medium text-gray-600 mb-1">Least Played Game</div>
                          <div className="inline-flex items-center px-2 py-1 bg-rose-100 text-rose-700 rounded-full text-xs font-semibold">
                            {isLoadingSessionStats ? '...' : (child1SessionStats?.gameSessionCounts[Object.keys(child1SessionStats?.gameSessionCounts || {}).reduce((a, b) => (child1SessionStats?.gameSessionCounts[a] || 0) < (child1SessionStats?.gameSessionCounts[b] || 0) ? a : b, '')] || 0)} sessions
                          </div>
                        </div>
                      </div>
                    </div>
                    
                  </div>

                  {/* Child 2 Overview */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <span className="text-4xl">{selectedChild2.avatar}</span>
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900">{selectedChild2.name}</h3>
                          <p className="text-gray-500">{selectedChild2.grade} • Age {selectedChild2.age}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                              selectedChild2.overallStats.cognitiveLevel === 'advanced' ? 'bg-green-100 text-green-800' :
                              selectedChild2.overallStats.cognitiveLevel === 'proficient' ? 'bg-blue-100 text-blue-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {selectedChild2.overallStats.cognitiveLevel}
                            </div>
                            <div className="text-xs text-gray-500">
                              {selectedChild2.overallStats.learningStyle} learner
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">{selectedChild2.overallStats.averageScore}</div>
                        <div className="text-sm text-gray-600">Overall Score</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="group relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl border border-blue-200/50 p-4 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1 h-24 flex items-center justify-center">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative text-center">
                          <div className="text-2xl font-bold text-gray-800 mb-1">
                            {isLoadingSessionStats ? '...' : (child2SessionStats?.totalGameSessions || 0)}
                          </div>
                          <div className="text-xs font-medium text-gray-600">Total Game Sessions</div>
                        </div>
                      </div>
                      
                      <div className="group relative overflow-hidden bg-gradient-to-br from-orange-50 to-amber-100 rounded-xl border border-orange-200/50 p-4 transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/10 hover:-translate-y-1 h-24 flex items-center justify-center">
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative text-center">
                          <div className="text-2xl font-bold text-gray-800 mb-1">
                            {isLoadingSessionStats ? '...' : '2'}
                          </div>
                          <div className="text-xs font-medium text-gray-600">Last Played (days ago)</div>
                        </div>
                      </div>
                      
                      <div className="group relative overflow-hidden bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl border border-green-200/50 p-4 transition-all duration-300 hover:shadow-xl hover:shadow-green-500/10 hover:-translate-y-1 h-24 flex items-center justify-center">
                        <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative text-center">
                          <div className="text-2xl font-bold text-gray-800 mb-1">
                            {isLoadingSessionStats ? '...' : (child2SessionStats?.sessionCompletionRate || 0)}%
                          </div>
                          <div className="text-xs font-medium text-gray-600">Session Completion Rate</div>
                        </div>
                      </div>
                      
                      <div className="group relative overflow-hidden bg-gradient-to-br from-purple-50 to-violet-100 rounded-xl border border-purple-200/50 p-4 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10 hover:-translate-y-1 h-32">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-violet-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative text-center h-full flex flex-col justify-center">
                          <div className="text-2xl font-bold text-gray-800 mb-1">{selectedChild2.overallStats.autismLikelihoodIndex}%</div>
                          <div className="text-xs font-medium text-gray-600 mb-2">Autism Likelihood Index</div>
                          <div className="relative">
                            <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-amber-500 via-orange-500 to-red-500 rounded-full animate-pulse"></div>
                              {/* Threshold marker at 70% */}
                              <div 
                                className="absolute top-0 w-0.5 h-4 bg-gray-800 transform -translate-x-1/2 -translate-y-1 shadow-sm"
                                style={{ left: '70%' }}
                              ></div>
                              <div 
                                className="absolute top-0 w-3 h-3 bg-white border-2 border-gray-700 rounded-full transform -translate-x-1/2 -translate-y-0.5 shadow-lg transition-all duration-500 group-hover:scale-110"
                                style={{ left: `${selectedChild2.overallStats.autismLikelihoodIndex}%` }}
                              ></div>
                            </div>
                            <div className="text-xs text-gray-500 mt-1 text-center font-medium">
                              Threshold: 70%
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Game Preferences */}
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="group relative overflow-hidden bg-gradient-to-br from-emerald-50 to-green-100 rounded-xl border border-emerald-200/50 p-4 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-1 h-20 flex items-center justify-center">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative text-center">
                          <div className="text-lg font-bold text-gray-800 mb-1">
                            {isLoadingSessionStats ? '...' : (child2SessionStats?.mostPlayedGame || 'None')}
                          </div>
                          <div className="text-xs font-medium text-gray-600 mb-1">Most Played Game</div>
                          <div className="inline-flex items-center px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold">
                            {isLoadingSessionStats ? '...' : (child2SessionStats?.gameSessionCounts[Object.keys(child2SessionStats?.gameSessionCounts || {}).reduce((a, b) => (child2SessionStats?.gameSessionCounts[a] || 0) > (child2SessionStats?.gameSessionCounts[b] || 0) ? a : b, '')] || 0)} sessions
                          </div>
                        </div>
                      </div>
                      
                      <div className="group relative overflow-hidden bg-gradient-to-br from-rose-50 to-red-100 rounded-xl border border-rose-200/50 p-4 transition-all duration-300 hover:shadow-xl hover:shadow-rose-500/10 hover:-translate-y-1 h-20 flex items-center justify-center">
                        <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative text-center">
                          <div className="text-lg font-bold text-gray-800 mb-1">
                            {isLoadingSessionStats ? '...' : (child2SessionStats?.leastPlayedGame || 'None')}
                          </div>
                          <div className="text-xs font-medium text-gray-600 mb-1">Least Played Game</div>
                          <div className="inline-flex items-center px-2 py-1 bg-rose-100 text-rose-700 rounded-full text-xs font-semibold">
                            {isLoadingSessionStats ? '...' : (child2SessionStats?.gameSessionCounts[Object.keys(child2SessionStats?.gameSessionCounts || {}).reduce((a, b) => (child2SessionStats?.gameSessionCounts[a] || 0) < (child2SessionStats?.gameSessionCounts[b] || 0) ? a : b, '')] || 0)} sessions
                          </div>
                        </div>
                      </div>
                    </div>
                    
                  </div>
                </div>

                {/* Quick Comparison Metrics */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Comparison</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-3xl font-bold text-blue-600">
                        {Math.abs(selectedChild1.overallStats.averageScore - selectedChild2.overallStats.averageScore).toFixed(1)}
                      </div>
                      <div className="text-sm text-gray-600">Score Difference</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {selectedChild1.overallStats.averageScore > selectedChild2.overallStats.averageScore 
                          ? `${selectedChild1.name} leads` 
                          : `${selectedChild2.name} leads`}
                      </div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-3xl font-bold text-green-600">
                        {Math.abs(selectedChild1.overallStats.totalGamesPlayed - selectedChild2.overallStats.totalGamesPlayed)}
                      </div>
                      <div className="text-sm text-gray-600">Games Difference</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {selectedChild1.overallStats.totalGamesPlayed > selectedChild2.overallStats.totalGamesPlayed 
                          ? `${selectedChild1.name} more active` 
                          : `${selectedChild2.name} more active`}
                      </div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-3xl font-bold text-purple-600">
                        {Math.abs(selectedChild1.overallStats.autismLikelihoodIndex - selectedChild2.overallStats.autismLikelihoodIndex)}%
                      </div>
                      <div className="text-sm text-gray-600">ALI Difference</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {selectedChild1.overallStats.autismLikelihoodIndex < selectedChild2.overallStats.autismLikelihoodIndex 
                          ? `${selectedChild1.name} lower risk` 
                          : `${selectedChild2.name} lower risk`}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Detailed Analysis Tab */}
            {activeTab === 'detailed' && (
              <div className="space-y-6">
                {/* Game-by-Game Comparison */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                      <Gamepad2 className="h-5 w-5 text-blue-600" />
                      Game-by-Game Performance Analysis
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">Metric:</span>
                      <select
                        value={selectedMetric}
                        onChange={(e) => setSelectedMetric(e.target.value as any)}
                        className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                      >
                        <option value="scores">Best Scores</option>
                        <option value="time">Time Spent</option>
                        <option value="consistency">Consistency</option>
                        <option value="improvement">Improvement</option>
                      </select>
                    </div>
                  </div>
                  
                  {isLoadingGameData ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading game performance data...</p>
                      </div>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Game</th>
                          <th className="text-center py-3 px-4 font-medium text-gray-700">{selectedChild1.name}</th>
                          <th className="text-center py-3 px-4 font-medium text-gray-700">{selectedChild2.name}</th>
                          <th className="text-center py-3 px-4 font-medium text-gray-700">Winner</th>
                          <th className="text-center py-3 px-4 font-medium text-gray-700">Gap</th>
                        </tr>
                      </thead>
                        <tbody>
                          {Object.keys(gameNames).map((gameId) => {
                            // Get real calculated scores from game data
                            const child1CalculatedScore = getCalculatedGameScore(child1GameData, gameId);
                            const child2CalculatedScore = getCalculatedGameScore(child2GameData, gameId);
                            
                            // Get session counts for additional info
                            const child1Sessions = getSessionCount(child1GameData, gameId);
                            const child2Sessions = getSessionCount(child2GameData, gameId);
                            
                            let child1Value, child2Value, winner, displayValue1, displayValue2;
                            
                            switch (selectedMetric) {
                              case 'scores':
                                child1Value = child1CalculatedScore;
                                child2Value = child2CalculatedScore;
                                winner = child1Value > child2Value ? selectedChild1.name : 
                                         child2Value > child1Value ? selectedChild2.name : 'Tie';
                                
                                // Format display values based on game type
                                if (gameId === 'gesture-game' || gameId === 'mirror-posture-game' || gameId === 'dance-doodle') {
                                  displayValue1 = child1Value >= 0 ? `${(child1Value / 1000).toFixed(1)}s` : 'N/A';
                                  displayValue2 = child2Value >= 0 ? `${(child2Value / 1000).toFixed(1)}s` : 'N/A';
                                } else if (gameId === 'repeat-with-me-game') {
                                  displayValue1 = child1Value >= 0 ? `${child1Value.toFixed(1)}%` : 'N/A';
                                  displayValue2 = child2Value >= 0 ? `${child2Value.toFixed(1)}%` : 'N/A';
                                } else if (gameId === 'gaze-game') {
                                  displayValue1 = child1Value >= 0 ? `${child1Value.toFixed(1)}` : 'N/A';
                                  displayValue2 = child2Value >= 0 ? `${child2Value.toFixed(1)}` : 'N/A';
                                } else {
                                  displayValue1 = child1Value >= 0 ? child1Value.toFixed(1) : 'N/A';
                                  displayValue2 = child2Value >= 0 ? child2Value.toFixed(1) : 'N/A';
                                }
                                break;
                              case 'time':
                                // For time metric, show total time spent
                                const child1TotalTime = child1GameData
                                  .filter(session => {
                                    const gameTypeMap: { [key: string]: string } = {
                                      'gesture-game': 'gesture',
                                      'mirror-posture-game': 'mirror',
                                      'dance-doodle': 'dance',
                                      'repeat-with-me-game': 'repeat',
                                      'gaze-game': 'gaze'
                                    };
                                    return session.gameType === gameTypeMap[gameId];
                                  })
                                  .reduce((total, session) => total + (session.completionTime || 0), 0);
                                
                                const child2TotalTime = child2GameData
                                  .filter(session => {
                                    const gameTypeMap: { [key: string]: string } = {
                                      'gesture-game': 'gesture',
                                      'mirror-posture-game': 'mirror',
                                      'dance-doodle': 'dance',
                                      'repeat-with-me-game': 'repeat',
                                      'gaze-game': 'gaze'
                                    };
                                    return session.gameType === gameTypeMap[gameId];
                                  })
                                  .reduce((total, session) => total + (session.completionTime || 0), 0);
                                
                                child1Value = child1TotalTime;
                                child2Value = child2TotalTime;
                                winner = child1Value > child2Value ? selectedChild1.name : 
                                         child2Value > child1Value ? selectedChild2.name : 'Tie';
                                displayValue1 = `${(child1Value / 60000).toFixed(1)}m`;
                                displayValue2 = `${(child2Value / 60000).toFixed(1)}m`;
                                break;
                              case 'consistency':
                                // For consistency, we'll use the calculated score as a proxy
                                child1Value = child1CalculatedScore;
                                child2Value = child2CalculatedScore;
                                winner = child1Value > child2Value ? selectedChild1.name : 
                                         child2Value > child1Value ? selectedChild2.name : 'Tie';
                                displayValue1 = child1Value >= 0 ? `${child1Value.toFixed(1)}%` : 'N/A';
                                displayValue2 = child2Value >= 0 ? `${child2Value.toFixed(1)}%` : 'N/A';
                                break;
                              case 'improvement':
                                // For improvement, we'll calculate based on first vs last sessions
                                child1Value = 0; // TODO: Implement improvement calculation
                                child2Value = 0; // TODO: Implement improvement calculation
                                winner = 'Tie';
                                displayValue1 = 'N/A';
                                displayValue2 = 'N/A';
                                break;
                            }
                          
                          const gap = Math.abs(child1Value - child2Value);
                          
                          return (
                            <tr key={gameId} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="py-4 px-4">
                                <div className="flex items-center gap-2">
                                  <span className="text-lg">{gameIcons[gameId]}</span>
                                  <div>
                                    <div className="font-medium text-gray-900">{gameNames[gameId]}</div>
                                    <div className="text-xs text-gray-500">{gameCategories[gameId]}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 px-4 text-center">
                                <div className="space-y-1">
                                  <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                                    selectedMetric === 'scores' ? getPerformanceColor(child1Value) :
                                    selectedMetric === 'time' ? 'text-blue-600 bg-blue-50' :
                                    selectedMetric === 'consistency' ? 'text-purple-600 bg-purple-50' :
                                    getImprovementColor(child1Value)
                                  }`}>
                                    {isLoadingGameData ? '...' : displayValue1}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {selectedMetric === 'scores' && `Sessions: ${child1Sessions}`}
                                    {selectedMetric === 'time' && `Sessions: ${child1Sessions}`}
                                    {selectedMetric === 'consistency' && `Sessions: ${child1Sessions}`}
                                    {selectedMetric === 'improvement' && `Sessions: ${child1Sessions}`}
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 px-4 text-center">
                                <div className="space-y-1">
                                  <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                                    selectedMetric === 'scores' ? getPerformanceColor(child2Value) :
                                    selectedMetric === 'time' ? 'text-green-600 bg-green-50' :
                                    selectedMetric === 'consistency' ? 'text-purple-600 bg-purple-50' :
                                    getImprovementColor(child2Value)
                                  }`}>
                                    {isLoadingGameData ? '...' : displayValue2}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {selectedMetric === 'scores' && `Sessions: ${child2Sessions}`}
                                    {selectedMetric === 'time' && `Sessions: ${child2Sessions}`}
                                    {selectedMetric === 'consistency' && `Sessions: ${child2Sessions}`}
                                    {selectedMetric === 'improvement' && `Sessions: ${child2Sessions}`}
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 px-4 text-center">
                                <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                                  winner === selectedChild1.name ? 'bg-blue-100 text-blue-800' :
                                  winner === selectedChild2.name ? 'bg-green-100 text-green-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {winner}
                                </div>
                              </td>
                              <td className="py-4 px-4 text-center">
                                <div className="text-sm font-medium text-gray-600">
                                  {isLoadingGameData ? '...' : (
                                    selectedMetric === 'time' ? `${(gap / 60000).toFixed(1)}m` : 
                                    selectedMetric === 'improvement' ? `${gap}%` :
                                    selectedMetric === 'consistency' ? `${gap}%` :
                                    (gameId === 'gesture-game' || gameId === 'mirror-posture-game' || gameId === 'dance-doodle') ? `${(gap / 1000).toFixed(1)}s` :
                                    gameId === 'repeat-with-me-game' ? `${gap.toFixed(1)}%` :
                                    gameId === 'gaze-game' ? `${gap.toFixed(1)}` :
                                    gap.toFixed(1)
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Strengths & Weaknesses Analysis */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Child 1 Side - Strengths then Weaknesses */}
                  <div className="space-y-6">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        {selectedChild1.name}'s Strengths
                      </h3>
                      <div className="space-y-3">
                        {getStrengthsAndWeaknesses(selectedChild1).strengths.map((strength, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                            <div className="flex items-center gap-2">
                              <Star className="h-4 w-4 text-green-600" />
                              <span className="font-medium text-gray-900">{strength.game}</span>
                            </div>
                            <span className="text-sm font-medium text-green-600">{strength.score}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <XCircle className="h-5 w-5 text-gray-600" />
                        {selectedChild1.name}'s Areas for Improvement
                      </h3>
                      <div className="space-y-3">
                        {getStrengthsAndWeaknesses(selectedChild1).weaknesses.map((weakness, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-2">
                              <Target className="h-4 w-4 text-gray-600" />
                              <span className="font-medium text-gray-900">{weakness.game}</span>
                            </div>
                            <span className="text-sm font-medium text-gray-600">{weakness.score}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Child 2 Side - Strengths then Weaknesses */}
                  <div className="space-y-6">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        {selectedChild2.name}'s Strengths
                      </h3>
                      <div className="space-y-3">
                        {getStrengthsAndWeaknesses(selectedChild2).strengths.map((strength, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                            <div className="flex items-center gap-2">
                              <Star className="h-4 w-4 text-green-600" />
                              <span className="font-medium text-gray-900">{strength.game}</span>
                            </div>
                            <span className="text-sm font-medium text-green-600">{strength.score}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <XCircle className="h-5 w-5 text-gray-600" />
                        {selectedChild2.name}'s Areas for Improvement
                      </h3>
                      <div className="space-y-3">
                        {getStrengthsAndWeaknesses(selectedChild2).weaknesses.map((weakness, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-2">
                              <Target className="h-4 w-4 text-gray-600" />
                              <span className="font-medium text-gray-900">{weakness.game}</span>
                            </div>
                            <span className="text-sm font-medium text-gray-600">{weakness.score}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Trends & Charts Tab */}
            {activeTab === 'trends' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-blue-600" />
                      Performance Trends & Visualizations
                    </h3>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">Metric:</span>
                        <select
                          value={selectedMetric}
                          onChange={(e) => setSelectedMetric(e.target.value as any)}
                          className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                        >
                          <option value="scores">Best Scores</option>
                          <option value="time">Time Spent</option>
                          <option value="consistency">Consistency</option>
                          <option value="improvement">Improvement</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Game Selection */}
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Select Games to Compare:</h4>
                    <div className="flex flex-wrap gap-2">
                      {Object.keys(gameNames).map((gameId) => (
                        <button
                          key={gameId}
                          onClick={() => handleGameSelection(gameId)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            selectedGames.includes(gameId)
                              ? 'bg-blue-100 text-blue-700 border border-blue-200'
                              : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
                          }`}
                        >
                          <span>{gameIcons[gameId]}</span>
                          {gameNames[gameId]}
                        </button>
                      ))}
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      Selected: {selectedGames.length} game{selectedGames.length !== 1 ? 's' : ''}
                    </div>
                  </div>

                  {/* Line Graph */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="text-lg font-medium text-gray-900 mb-4 text-center">
                      Performance Trends Over Sessions
                    </h4>
                    
                    {selectedGames.length > 0 ? (
                      <div>
                        {/* Legend */}
                        <div className="mb-6">
                          {isLoadingTrends ? (
                            <div className="text-gray-500 text-center">Loading trends data...</div>
                          ) : (
                            <div className="space-y-4">
                              {/* Line Style Legend */}
                              <div className="flex items-center justify-center gap-6">
                                <div className="flex items-center gap-2">
                                  <div className="w-4 h-0.5 bg-gray-600"></div>
                                  <span className="text-sm text-gray-700">{selectedChild1.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="w-4 h-0.5 border-dashed border-t-2 border-gray-600"></div>
                                  <span className="text-sm text-gray-700">{selectedChild2.name}</span>
                                </div>
                              </div>
                              
                              {/* Game Colors */}
                              <div className="flex flex-wrap gap-4 justify-center">
                                {trendsData.map((gameData) => (
                                  <div key={gameData.gameId} className="flex items-center gap-2">
                                    <span className="text-lg">{gameIcons[gameData.gameId]}</span>
                                    <span className="text-sm font-medium text-gray-700">{gameData.gameName}</span>
                                    <div 
                                      className="w-3 h-3 rounded-full" 
                                      style={{ backgroundColor: gameColors[gameData.gameId] }}
                                    ></div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Graph Container */}
                        <div className="bg-white rounded-lg border border-gray-200 p-4">
                          <div className="w-full h-80">
                            <svg width="100%" height="100%" className="overflow-visible" viewBox="0 0 800 320" preserveAspectRatio="none">
                              {/* Grid Lines */}
                              <defs>
                                <pattern 
                                  id="grid" 
                                  width="40" 
                                  height="40" 
                                  patternUnits="userSpaceOnUse"
                                >
                                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#f3f4f6" strokeWidth="1"/>
                                </pattern>
                              </defs>
                              <rect x="0" y="0" width="100%" height="100%" fill="url(#grid)" />
                              
                              {/* Y-axis line */}
                              <line x1="50" y1="30" x2="50" y2="270" stroke="#374151" strokeWidth="2"/>
                              
                              {/* X-axis line - Always full width */}
                              <line x1="50" y1="270" x2="750" y2="270" stroke="#374151" strokeWidth="2"/>
                              
                              {/* Y-axis tick marks and labels */}
                              {[0, 20, 40, 60, 80, 100].map((value) => {
                                const y = 270 - (value * 2.4);
                                return (
                                  <g key={value}>
                                    {/* Tick mark */}
                                    <line x1="45" y1={y} x2="50" y2={y} stroke="#374151" strokeWidth="1"/>
                                    {/* Label */}
                                    <text
                                      x="40"
                                      y={y + 4}
                                      textAnchor="end"
                                      className="text-xs fill-gray-500"
                                    >
                                      {value}
                                    </text>
                                  </g>
                                );
                              })}
                              
                              {/* X-axis tick marks and labels - Equal spacing across full width */}
                              {Array.from({ length: getMaxSessions() }, (_, i) => i + 1).map((session) => {
                                // Always use full width with equal spacing
                                const x = 50 + (session - 1) * (700 / (getMaxSessions() - 1));
                                return (
                                  <g key={session}>
                                    {/* Tick mark */}
                                    <line x1={x} y1="270" x2={x} y2="275" stroke="#374151" strokeWidth="1"/>
                                    {/* Label */}
                                    <text
                                      x={x}
                                      y="290"
                                      textAnchor="middle"
                                      className="text-xs fill-gray-500"
                                    >
                                      {session}
                                    </text>
                                  </g>
                                );
                              })}
                              
                              {/* Y-axis title */}
                              <text
                                x="20"
                                y="150"
                                textAnchor="middle"
                                transform="rotate(-90, 20, 150)"
                                className="text-sm font-medium fill-gray-700"
                              >
                                Score (%)
                              </text>
                              
                              {/* X-axis title */}
                              <text
                                x="400"
                                y="310"
                                textAnchor="middle"
                                className="text-sm font-medium fill-gray-700"
                              >
                                Session Number
                              </text>
                              
                              {/* Plot lines for each game */}
                              {trendsData.map((gameData) => {
                                const gameColor = gameColors[gameData.gameId];
                                
                                // Calculate points for Child 1 (using absolute coordinates)
                                const child1Points = gameData.child1.map((point, index) => {
                                  // Always use full width with equal spacing between sessions
                                  const x = 50 + (index * (700 / (getMaxSessions() - 1)));
                                  const y = 270 - (point.score * 2.4);
                                  return { x, y };
                                });
                                
                                // Calculate points for Child 2 (using absolute coordinates)
                                const child2Points = gameData.child2.map((point, index) => {
                                  // Always use full width with equal spacing between sessions
                                  const x = 50 + (index * (700 / (getMaxSessions() - 1)));
                                  const y = 270 - (point.score * 2.4);
                                  return { x, y };
                                });
                                
                                // Create path string for Child 1
                                const child1Path = child1Points.reduce((path, point, index) => {
                                  if (index === 0) {
                                    return `M ${point.x} ${point.y}`;
                                  } else {
                                    return `${path} L ${point.x} ${point.y}`;
                                  }
                                }, '');
                                
                                // Create path string for Child 2
                                const child2Path = child2Points.reduce((path, point, index) => {
                                  if (index === 0) {
                                    return `M ${point.x} ${point.y}`;
                                  } else {
                                    return `${path} L ${point.x} ${point.y}`;
                                  }
                                }, '');
                                
                                return (
                                  <g key={gameData.gameId}>
                                    {/* Child 1 line */}
                                    <path
                                      d={child1Path}
                                      fill="none"
                                      stroke={gameColor}
                                      strokeWidth="2"
                                    />
                                    
                                    {/* Child 1 dots */}
                                    {child1Points.map((point, index) => (
                                      <circle
                                        key={`child1-${index}`}
                                        cx={point.x}
                                        cy={point.y}
                                        r="3"
                                        fill={gameColor}
                                      />
                                    ))}
                                    
                                    {/* Child 2 line */}
                                    <path
                                      d={child2Path}
                                      fill="none"
                                      stroke={gameColor}
                                      strokeWidth="2"
                                      strokeDasharray="5,5"
                                    />
                                    
                                    {/* Child 2 dots */}
                                    {child2Points.map((point, index) => (
                                      <circle
                                        key={`child2-${index}`}
                                        cx={point.x}
                                        cy={point.y}
                                        r="3"
                                        fill={gameColor}
                                      />
                                    ))}
                                  </g>
                                );
                              })}
                            </svg>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-500">Select at least one game to view the line graph</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* AI Insights Tab */}
            {activeTab === 'insights' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-yellow-600" />
                    AI-Powered Insights & Analysis
                  </h3>
                  
                  <div className="space-y-4">
                    {/* Child 1 Key Insights */}
                    <div className="w-full">
                      <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <span className="text-blue-600">👤</span>
                        {selectedChild1.name}'s Key Insights
                      </h4>
                      <div className="grid grid-cols-1 gap-3">
                        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">ALI Analysis:</span> {selectedChild1.overallStats.autismLikelihoodIndex}% - {
                              selectedChild1.overallStats.autismLikelihoodIndex > 70 ? 'Higher likelihood indicators suggest specialized support strategies may be beneficial' :
                              selectedChild1.overallStats.autismLikelihoodIndex > 50 ? 'Moderate likelihood suggests close monitoring and adaptive learning approaches' :
                              'Lower likelihood indicates current educational approaches are well-suited for continued development'
                            }
                          </p>
                        </div>
                        
                        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">Strongest Area:</span> {Object.keys(selectedChild1.performance).reduce((a, b) => 
                              selectedChild1.performance[a].bestScore > selectedChild1.performance[b].bestScore ? a : b
                            )} with {Math.max(...Object.values(selectedChild1.performance).map(p => p.bestScore))}% best score - indicating strong engagement and skill development
                          </p>
                        </div>
                        
                        <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-r-lg">
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">Growth Area:</span> {Object.keys(selectedChild1.performance).reduce((a, b) => 
                              selectedChild1.performance[a].bestScore < selectedChild1.performance[b].bestScore ? a : b
                            )} with {Math.min(...Object.values(selectedChild1.performance).map(p => p.bestScore))}% best score - room for improvement and targeted intervention
                          </p>
                        </div>
                        
                        <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded-r-lg">
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">Engagement Level:</span> {selectedChild1.overallStats.engagement}% - {
                              selectedChild1.overallStats.engagement > 80 ? 'Excellent motivation, maintain through positive reinforcement and challenging goals' :
                              selectedChild1.overallStats.engagement < 60 ? 'Motivation strategies need adjustment, consider new interactive elements and personalized rewards' :
                              'Solid engagement that can be enhanced through targeted motivation techniques'
                            }
                          </p>
                        </div>
                        
                        <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 rounded-r-lg">
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">Performance Consistency:</span> {selectedChild1.overallStats.focus}% - {
                              selectedChild1.overallStats.focus > 85 ? 'Excellent reliability, ready for advanced challenges and complex learning objectives' :
                              selectedChild1.overallStats.focus < 70 ? 'Some variability, benefit from structured practice routines and consistent schedules' :
                              'Good consistency that can be further developed through regular practice'
                            }
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Child 2 Key Insights */}
                    <div className="w-full">
                      <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <span className="text-green-600">👤</span>
                        {selectedChild2.name}'s Key Insights
                      </h4>
                      <div className="grid grid-cols-1 gap-3">
                        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">ALI Analysis:</span> {selectedChild2.overallStats.autismLikelihoodIndex}% - {
                              selectedChild2.overallStats.autismLikelihoodIndex > 70 ? 'Higher likelihood indicators recommend specialized intervention strategies and tailored support' :
                              selectedChild2.overallStats.autismLikelihoodIndex > 50 ? 'Moderate likelihood indicates need for careful monitoring and adaptive teaching approaches' :
                              'Lower likelihood confirms standard educational methods are appropriate for continued growth'
                            }
                          </p>
                        </div>
                        
                        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">Strongest Area:</span> {Object.keys(selectedChild2.performance).reduce((a, b) => 
                              selectedChild2.performance[a].bestScore > selectedChild2.performance[b].bestScore ? a : b
                            )} with {Math.max(...Object.values(selectedChild2.performance).map(p => p.bestScore))}% best score - showcasing excellent capability in this domain
                          </p>
                        </div>
                        
                        <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-r-lg">
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">Growth Area:</span> {Object.keys(selectedChild2.performance).reduce((a, b) => 
                              selectedChild2.performance[a].bestScore < selectedChild2.performance[b].bestScore ? a : b
                            )} with {Math.min(...Object.values(selectedChild2.performance).map(p => p.bestScore))}% best score - requires targeted intervention and additional practice
                          </p>
                        </div>
                        
                        <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded-r-lg">
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">Engagement Level:</span> {selectedChild2.overallStats.engagement}% - {
                              selectedChild2.overallStats.engagement > 80 ? 'Outstanding motivation, leverage to introduce complex challenges and advanced learning objectives' :
                              selectedChild2.overallStats.engagement < 60 ? 'Potential motivation challenges, require innovative strategies like gamification and peer collaboration' :
                              'Solid engagement that can be enhanced through personalized learning experiences'
                            }
                          </p>
                        </div>
                        
                        <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 rounded-r-lg">
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">Performance Consistency:</span> {selectedChild2.overallStats.focus}% - {
                              selectedChild2.overallStats.focus > 85 ? 'Exceptional stability, ready for advanced learning challenges and independent study' :
                              selectedChild2.overallStats.focus < 70 ? 'Performance variability, benefit from structured routines and consistent practice schedules' :
                              'Good consistency that can be strengthened through regular practice'
                            }
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Comparative Insights */}
                    <div className="w-full">
                      <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <span className="text-purple-600">🔄</span>
                        Comparative Analysis & Recommendations
                      </h4>
                      <div className="grid grid-cols-1 gap-3">
                        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-lg">
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">Performance Comparison:</span> {
                              selectedChild1.overallStats.averageScore > selectedChild2.overallStats.averageScore ? 
                                `${selectedChild1.name} leads by ${(selectedChild1.overallStats.averageScore - selectedChild2.overallStats.averageScore).toFixed(1)} points, suggesting stronger foundational skills` :
                                selectedChild2.overallStats.averageScore > selectedChild1.overallStats.averageScore ?
                                `${selectedChild2.name} leads by ${(selectedChild2.overallStats.averageScore - selectedChild1.overallStats.averageScore).toFixed(1)} points, indicating more developed capabilities` :
                                'Both children show remarkably similar performance levels, suggesting comparable learning trajectories'
                            }
                          </p>
                        </div>
                        
                        <div className="bg-pink-50 border-l-4 border-pink-500 p-4 rounded-r-lg">
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">Engagement Comparison:</span> {
                              selectedChild1.overallStats.engagement > selectedChild2.overallStats.engagement ?
                              `${selectedChild1.name} maintains higher engagement (${selectedChild1.overallStats.engagement}% vs ${selectedChild2.overallStats.engagement}%), leverage for peer learning opportunities` :
                              selectedChild2.overallStats.engagement > selectedChild1.overallStats.engagement ?
                              `${selectedChild2.name} shows superior engagement (${selectedChild2.overallStats.engagement}% vs ${selectedChild1.overallStats.engagement}%), share effective motivation strategies` :
                              'Comparable engagement levels indicate similar motivational needs and learning preferences'
                            }
                          </p>
                        </div>
                        
                        <div className="bg-teal-50 border-l-4 border-teal-500 p-4 rounded-r-lg">
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">Recommended Approach:</span> {
                              selectedChild1.overallStats.autismLikelihoodIndex > 70 || selectedChild2.overallStats.autismLikelihoodIndex > 70 ? 
                              'Specialized support strategies for higher ALI scores, combined with personalized learning plans and targeted interventions' :
                              'Personalized learning plans leveraging each child\'s strengths while addressing growth areas, with targeted interventions and engagement enhancement'
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
};

export default ChildProgressComparison;
