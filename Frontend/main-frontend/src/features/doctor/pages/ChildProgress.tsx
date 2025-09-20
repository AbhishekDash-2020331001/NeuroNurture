import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDoctorAuth } from '@/features/doctor/contexts/DoctorAuthContext';
import { 
  ArrowLeft,
  Users,
  BookOpen,
  BarChart3,
  Calendar,
  TrendingUp,
  Target,
  Award,
  Clock,
  CheckCircle,
  XCircle,
  Play,
  Stethoscope,
  Heart,
  Activity,
  MessageSquare,
  Search,
  Brain,
  Eye,
  Hand,
  Repeat,
  Music,
  ChevronDown,
  User,
  AlertCircle
} from 'lucide-react';

// Therapeutic tasks interface and data
interface Patient {
  id: string;
  name: string;
  age: number;
  diagnosis: string;
  parentName: string;
  parentEmail: string;
  enrollmentDate: string;
  lastActive: string;
  lastSession: string;
  overallProgress: number;
  gamesPlayed: number;
  tasksCompleted: number;
  tasksAssigned: number;
  therapyHours: number;
  status: 'active' | 'inactive' | 'completed';
  priority: 'high' | 'medium' | 'low';
  nextAppointment?: string;
  avatar?: string;
  autismLikelihoodIndex: number; // ALI score as percentage
}

interface GameSession {
  sessionNumber: number;
  score: number;
  date: string;
  duration: number; // in minutes
}

interface GamePerformance {
  gameId: string;
  gameName: string;
  icon: React.ReactNode;
  color: string;
  sessions: GameSession[];
  aiInsight: string;
}

interface GamePerformanceData {
  [gameId: string]: GamePerformance;
}

interface TherapeuticTask {
  id: string;
  name: string;
  description: string;
  assignedDate: string;
  dueDate: string;
  startDate: string;
  endDate: string;
  status: 'running' | 'completed' | 'paused';
  games: {
    gameId: string;
    gameName: string;
    currentScore: number;
    averageScore: number;
    sessionsCompleted: number;
    totalSessions: number;
    improvement: number; // percentage improvement
    frequency: string; // e.g., "3 times per week"
    conditions: string[]; // specific conditions for this game
    autismLikelihoodIndex: number; // ALI score as percentage
    sessions: {
      sessionNumber: number;
      date: string;
      score: number;
      duration: number; // minutes
      notes?: string;
      completed: boolean;
    }[];
  }[];
  overallProgress: number;
  doctorNotes?: string;
  priority: 'high' | 'medium' | 'low';
  conditions: {
    frequency: string; // overall task frequency
    duration: string; // total expected duration
    requirements: string[]; // general requirements
    milestones: string[]; // key milestones to achieve
  };
  assignedBy: string; // doctor name
  lastUpdated: string;
}

const mockPatient: Patient = {
  id: '1',
  name: 'Emma Johnson',
  age: 7,
  diagnosis: 'ADHD with Focus Issues',
  parentName: 'Michael Johnson',
  parentEmail: 'michael.johnson@email.com',
  enrollmentDate: '2024-01-15',
  lastActive: '2024-01-20',
  lastSession: '2024-01-19',
  overallProgress: 78,
  gamesPlayed: 24,
  tasksCompleted: 18,
  tasksAssigned: 22,
  therapyHours: 12.5,
  status: 'active',
  priority: 'high',
  nextAppointment: '2024-01-25',
  autismLikelihoodIndex: 45 // ALI score as percentage
};

const mockGamePerformanceData: GamePerformanceData = {
  'gesture': {
    gameId: 'gesture',
    gameName: 'Gesture Recognition',
    icon: <Hand className="h-5 w-5" />,
    color: 'bg-blue-500',
    sessions: [
      { sessionNumber: 1, score: 65, date: '2024-01-15', duration: 12 },
      { sessionNumber: 2, score: 72, date: '2024-01-16', duration: 15 },
      { sessionNumber: 3, score: 68, date: '2024-01-17', duration: 14 },
      { sessionNumber: 4, score: 78, date: '2024-01-18', duration: 16 },
      { sessionNumber: 5, score: 82, date: '2024-01-19', duration: 18 },
      { sessionNumber: 6, score: 85, date: '2024-01-20', duration: 17 }
    ],
    aiInsight: "Emma shows consistent improvement in gesture recognition with a 20-point increase over 6 sessions. Her accuracy improved from 65% to 85%, indicating strong motor learning. The upward trend suggests effective therapeutic intervention."
  },
  'gaze': {
    gameId: 'gaze',
    gameName: 'Gaze Tracking',
    icon: <Eye className="h-5 w-5" />,
    color: 'bg-green-500',
    sessions: [
      { sessionNumber: 1, score: 58, date: '2024-01-15', duration: 10 },
      { sessionNumber: 2, score: 62, date: '2024-01-16', duration: 12 },
      { sessionNumber: 3, score: 71, date: '2024-01-17', duration: 13 },
      { sessionNumber: 4, score: 69, date: '2024-01-18', duration: 11 },
      { sessionNumber: 5, score: 75, date: '2024-01-19', duration: 14 },
      { sessionNumber: 6, score: 79, date: '2024-01-20', duration: 15 }
    ],
    aiInsight: "Gaze tracking performance shows steady improvement with some variability. Emma's attention span and focus have increased, with the most recent session reaching 79% accuracy. The pattern suggests developing visual attention skills."
  },
  'repeat': {
    gameId: 'repeat',
    gameName: 'Repeat With Me',
    icon: <Repeat className="h-5 w-5" />,
    color: 'bg-purple-500',
    sessions: [
      { sessionNumber: 1, score: 70, date: '2024-01-15', duration: 8 },
      { sessionNumber: 2, score: 73, date: '2024-01-16', duration: 9 },
      { sessionNumber: 3, score: 76, date: '2024-01-17', duration: 10 },
      { sessionNumber: 4, score: 80, date: '2024-01-18', duration: 11 },
      { sessionNumber: 5, score: 83, date: '2024-01-19', duration: 12 },
      { sessionNumber: 6, score: 87, date: '2024-01-20', duration: 13 }
    ],
    aiInsight: "Excellent progress in auditory processing and memory. Emma demonstrates strong sequential learning with consistent 3-4 point improvements per session. Her ability to follow and repeat patterns has significantly enhanced."
  },
  'dance': {
    gameId: 'dance',
    gameName: 'Dance Doodle',
    icon: <Music className="h-5 w-5" />,
    color: 'bg-pink-500',
    sessions: [
      { sessionNumber: 1, score: 60, date: '2024-01-15', duration: 15 },
      { sessionNumber: 2, score: 65, date: '2024-01-16', duration: 16 },
      { sessionNumber: 3, score: 70, date: '2024-01-17', duration: 17 },
      { sessionNumber: 4, score: 68, date: '2024-01-18', duration: 15 },
      { sessionNumber: 5, score: 74, date: '2024-01-19', duration: 18 },
      { sessionNumber: 6, score: 78, date: '2024-01-20', duration: 19 }
    ],
    aiInsight: "Creative expression and rhythm coordination show positive development. Emma's engagement time has increased, and her scores reflect growing confidence in movement-based activities. The upward trend indicates improved motor coordination."
  },
  'mirror': {
    gameId: 'mirror',
    gameName: 'Mirror Posture',
    icon: <Activity className="h-5 w-5" />,
    color: 'bg-orange-500',
    sessions: [
      { sessionNumber: 1, score: 55, date: '2024-01-15', duration: 10 },
      { sessionNumber: 2, score: 62, date: '2024-01-16', duration: 12 },
      { sessionNumber: 3, score: 58, date: '2024-01-17', duration: 11 },
      { sessionNumber: 4, score: 67, date: '2024-01-18', duration: 13 },
      { sessionNumber: 5, score: 71, date: '2024-01-19', duration: 14 },
      { sessionNumber: 6, score: 76, date: '2024-01-20', duration: 15 }
    ],
    aiInsight: "Body awareness and posture control are developing steadily. Emma shows improvement in maintaining correct posture positions, with a 21-point increase over 6 sessions. The progression indicates enhanced motor planning and body coordination skills."
  }
};

const mockTherapeuticTasks: TherapeuticTask[] = [
  {
    id: 'task-1',
    name: 'Focus & Attention Enhancement',
    description: 'Comprehensive program to improve attention span and focus through targeted games',
    assignedDate: '2024-01-10',
    dueDate: '2024-02-10',
    startDate: '2024-01-15',
    endDate: '2024-02-15',
    status: 'running',
    games: [
      {
        gameId: 'gaze',
        gameName: 'Gaze Tracking',
        currentScore: 79,
        averageScore: 72,
        sessionsCompleted: 6,
        totalSessions: 10,
        improvement: 36,
        frequency: '3 times per week',
        conditions: ['Maintain focus for 10+ minutes', 'Complete without breaks', 'Achieve 80% accuracy'],
        autismLikelihoodIndex: 42,
        sessions: [
          { sessionNumber: 1, date: '2024-01-15', score: 58, duration: 10, notes: 'Initial session, establishing baseline', completed: true },
          { sessionNumber: 2, date: '2024-01-16', score: 62, duration: 12, notes: 'Showed improvement in focus', completed: true },
          { sessionNumber: 3, date: '2024-01-17', score: 71, duration: 13, notes: 'Excellent progress in attention span', completed: true },
          { sessionNumber: 4, date: '2024-01-18', score: 69, duration: 11, notes: 'Slight regression, but maintained engagement', completed: true },
          { sessionNumber: 5, date: '2024-01-19', score: 75, duration: 14, notes: 'Strong performance, exceeded expectations', completed: true },
          { sessionNumber: 6, date: '2024-01-20', score: 79, duration: 15, notes: 'Best session yet, consistent focus throughout', completed: true }
        ]
      },
      {
        gameId: 'repeat',
        gameName: 'Repeat With Me',
        currentScore: 87,
        averageScore: 81,
        sessionsCompleted: 6,
        totalSessions: 8,
        improvement: 24,
        frequency: '2 times per week',
        conditions: ['Follow audio instructions', 'Repeat patterns correctly', 'Maintain attention throughout'],
        autismLikelihoodIndex: 38,
        sessions: [
          { sessionNumber: 1, date: '2024-01-15', score: 70, duration: 8, notes: 'Good initial performance', completed: true },
          { sessionNumber: 2, date: '2024-01-17', score: 73, duration: 9, notes: 'Improved pattern recognition', completed: true },
          { sessionNumber: 3, date: '2024-01-19', score: 76, duration: 10, notes: 'Consistent improvement in memory', completed: true },
          { sessionNumber: 4, date: '2024-01-21', score: 80, duration: 11, notes: 'Excellent auditory processing', completed: true },
          { sessionNumber: 5, date: '2024-01-23', score: 83, duration: 12, notes: 'Strong sequential learning', completed: true },
          { sessionNumber: 6, date: '2024-01-25', score: 87, duration: 13, notes: 'Outstanding performance, exceeded targets', completed: true }
        ]
      }
    ],
    overallProgress: 75,
    doctorNotes: 'Emma shows excellent progress in attention tasks. Continue current approach.',
    priority: 'high',
    conditions: {
      frequency: '5 sessions per week',
      duration: '4 weeks',
      requirements: ['Parent supervision required', 'Quiet environment', 'Consistent schedule'],
      milestones: ['Week 1: Establish baseline', 'Week 2: 10% improvement', 'Week 3: 20% improvement', 'Week 4: Target achievement']
    },
    assignedBy: 'Dr. Sarah Wilson',
    lastUpdated: '2024-01-20'
  },
  {
    id: 'task-2',
    name: 'Motor Skills Development',
    description: 'Targeted exercises to enhance fine and gross motor coordination',
    assignedDate: '2024-01-05',
    dueDate: '2024-01-25',
    startDate: '2024-01-08',
    endDate: '2024-01-25',
    status: 'completed',
    games: [
      {
        gameId: 'gesture',
        gameName: 'Gesture Recognition',
        currentScore: 85,
        averageScore: 78,
        sessionsCompleted: 8,
        totalSessions: 8,
        improvement: 31,
        frequency: '4 times per week',
        conditions: ['Precise hand movements', 'Maintain posture', 'Complete all gestures'],
        autismLikelihoodIndex: 35,
        sessions: [
          { sessionNumber: 1, date: '2024-01-08', score: 65, duration: 12, notes: 'Initial assessment', completed: true },
          { sessionNumber: 2, date: '2024-01-10', score: 72, duration: 14, notes: 'Improving accuracy', completed: true },
          { sessionNumber: 3, date: '2024-01-12', score: 78, duration: 15, notes: 'Good progress', completed: true },
          { sessionNumber: 4, date: '2024-01-15', score: 82, duration: 16, notes: 'Excellent improvement', completed: true },
          { sessionNumber: 5, date: '2024-01-17', score: 85, duration: 17, notes: 'Target achieved', completed: true },
          { sessionNumber: 6, date: '2024-01-19', score: 88, duration: 18, notes: 'Exceeded expectations', completed: true },
          { sessionNumber: 7, date: '2024-01-22', score: 90, duration: 19, notes: 'Outstanding performance', completed: true },
          { sessionNumber: 8, date: '2024-01-24', score: 92, duration: 20, notes: 'Final session - excellent', completed: true }
        ]
      },
      {
        gameId: 'mirror',
        gameName: 'Mirror Posture',
        currentScore: 76,
        averageScore: 69,
        sessionsCompleted: 6,
        totalSessions: 6,
        improvement: 38,
        frequency: '3 times per week',
        conditions: ['Mirror instructor exactly', 'Hold positions for 5+ seconds', 'Maintain balance'],
        autismLikelihoodIndex: 48,
        sessions: [
          { sessionNumber: 1, date: '2024-01-08', score: 55, duration: 10, notes: 'Baseline assessment', completed: true },
          { sessionNumber: 2, date: '2024-01-11', score: 62, duration: 12, notes: 'Improving balance', completed: true },
          { sessionNumber: 3, date: '2024-01-14', score: 68, duration: 13, notes: 'Better posture control', completed: true },
          { sessionNumber: 4, date: '2024-01-17', score: 72, duration: 14, notes: 'Good mirroring skills', completed: true },
          { sessionNumber: 5, date: '2024-01-20', score: 74, duration: 15, notes: 'Consistent performance', completed: true },
          { sessionNumber: 6, date: '2024-01-23', score: 76, duration: 16, notes: 'Target achieved', completed: true }
        ]
      }
    ],
    overallProgress: 100,
    doctorNotes: 'Task completed successfully. Emma exceeded targets in gesture recognition.',
    priority: 'medium',
    conditions: {
      frequency: '7 sessions per week',
      duration: '3 weeks',
      requirements: ['Physical space for movement', 'Mirror for posture exercises', 'Parent encouragement'],
      milestones: ['Week 1: Basic coordination', 'Week 2: Improved accuracy', 'Week 3: Target achievement']
    },
    assignedBy: 'Dr. Sarah Wilson',
    lastUpdated: '2024-01-25'
  },
  {
    id: 'task-3',
    name: 'Creative Expression & Coordination',
    description: 'Combining creativity with physical coordination through dance and movement',
    assignedDate: '2024-01-15',
    dueDate: '2024-02-15',
    startDate: '2024-01-18',
    endDate: '2024-02-15',
    status: 'running',
    games: [
      {
        gameId: 'dance',
        gameName: 'Dance Doodle',
        currentScore: 78,
        averageScore: 71,
        sessionsCompleted: 6,
        totalSessions: 12,
        improvement: 30,
        frequency: '2 times per week',
        conditions: ['Express creativity freely', 'Follow rhythm patterns', 'Complete full dance sequences'],
        autismLikelihoodIndex: 52,
        sessions: [
          { sessionNumber: 1, date: '2024-01-18', score: 60, duration: 15, notes: 'Initial creative exploration', completed: true },
          { sessionNumber: 2, date: '2024-01-21', score: 65, duration: 16, notes: 'Improving rhythm sense', completed: true },
          { sessionNumber: 3, date: '2024-01-25', score: 70, duration: 17, notes: 'Better coordination', completed: true },
          { sessionNumber: 4, date: '2024-01-28', score: 72, duration: 18, notes: 'Creative expression growing', completed: true },
          { sessionNumber: 5, date: '2024-02-01', score: 75, duration: 19, notes: 'Good sequence completion', completed: true },
          { sessionNumber: 6, date: '2024-02-04', score: 78, duration: 20, notes: 'Excellent progress', completed: true }
        ]
      }
    ],
    overallProgress: 50,
    doctorNotes: 'Good progress in creative expression. Emma enjoys this activity.',
    priority: 'low',
    conditions: {
      frequency: '2 sessions per week',
      duration: '4 weeks',
      requirements: ['Open space for movement', 'Music/audio system', 'Encourage creativity'],
      milestones: ['Week 1: Basic movements', 'Week 2: Rhythm coordination', 'Week 3: Creative expression', 'Week 4: Full sequences']
    },
    assignedBy: 'Dr. Sarah Wilson',
    lastUpdated: '2024-01-20'
  },
  {
    id: 'task-4',
    name: 'Memory & Pattern Recognition',
    description: 'Early intervention program for memory enhancement and pattern recognition',
    assignedDate: '2023-12-20',
    dueDate: '2024-01-20',
    startDate: '2023-12-23',
    endDate: '2024-01-20',
    status: 'completed',
    games: [
      {
        gameId: 'repeat',
        gameName: 'Repeat With Me',
        currentScore: 75,
        averageScore: 68,
        sessionsCompleted: 10,
        totalSessions: 10,
        improvement: 25,
        frequency: '3 times per week',
        conditions: ['Listen carefully', 'Repeat accurately', 'Maintain concentration'],
        autismLikelihoodIndex: 41,
        sessions: [
          { sessionNumber: 1, date: '2023-12-23', score: 60, duration: 8, notes: 'Baseline assessment', completed: true },
          { sessionNumber: 2, date: '2023-12-26', score: 63, duration: 9, notes: 'Improving attention', completed: true },
          { sessionNumber: 3, date: '2023-12-29', score: 66, duration: 10, notes: 'Better pattern recognition', completed: true },
          { sessionNumber: 4, date: '2024-01-02', score: 68, duration: 11, notes: 'Good memory retention', completed: true },
          { sessionNumber: 5, date: '2024-01-05', score: 70, duration: 12, notes: 'Consistent improvement', completed: true },
          { sessionNumber: 6, date: '2024-01-08', score: 72, duration: 13, notes: 'Strong performance', completed: true },
          { sessionNumber: 7, date: '2024-01-11', score: 73, duration: 14, notes: 'Excellent concentration', completed: true },
          { sessionNumber: 8, date: '2024-01-14', score: 74, duration: 15, notes: 'Near target achievement', completed: true },
          { sessionNumber: 9, date: '2024-01-17', score: 75, duration: 16, notes: 'Target achieved', completed: true },
          { sessionNumber: 10, date: '2024-01-20', score: 76, duration: 17, notes: 'Final session - exceeded target', completed: true }
        ]
      }
    ],
    overallProgress: 100,
    doctorNotes: 'Baseline memory task completed. Good foundation for future interventions.',
    priority: 'medium',
    conditions: {
      frequency: '3 sessions per week',
      duration: '4 weeks',
      requirements: ['Quiet environment', 'Clear audio', 'Minimal distractions'],
      milestones: ['Week 1: Simple patterns', 'Week 2: Complex sequences', 'Week 3: Memory retention', 'Week 4: Target achievement']
    },
    assignedBy: 'Dr. Sarah Wilson',
    lastUpdated: '2024-01-20'
  },
  {
    id: 'task-5',
    name: 'Comprehensive Development Program',
    description: 'Multi-faceted therapeutic intervention targeting all key developmental areas through comprehensive game-based therapy',
    assignedDate: '2024-01-22',
    dueDate: '2024-03-22',
    startDate: '2024-01-25',
    endDate: '2024-03-25',
    status: 'running',
    games: [
      {
        gameId: 'gesture',
        gameName: 'Gesture Recognition',
        currentScore: 82,
        averageScore: 75,
        sessionsCompleted: 8,
        totalSessions: 15,
        improvement: 28,
        frequency: '3 times per week',
        conditions: ['Precise hand movements', 'Maintain posture', 'Complete all gestures'],
        autismLikelihoodIndex: 33,
        sessions: [
          { sessionNumber: 1, date: '2024-01-25', score: 65, duration: 12, notes: 'Program start - baseline', completed: true },
          { sessionNumber: 2, date: '2024-01-27', score: 68, duration: 13, notes: 'Early improvement', completed: true },
          { sessionNumber: 3, date: '2024-01-29', score: 72, duration: 14, notes: 'Good progress', completed: true },
          { sessionNumber: 4, date: '2024-01-31', score: 75, duration: 15, notes: 'Consistent improvement', completed: true },
          { sessionNumber: 5, date: '2024-02-02', score: 78, duration: 16, notes: 'Strong performance', completed: true },
          { sessionNumber: 6, date: '2024-02-04', score: 80, duration: 17, notes: 'Excellent accuracy', completed: true },
          { sessionNumber: 7, date: '2024-02-06', score: 81, duration: 18, notes: 'Near target', completed: true },
          { sessionNumber: 8, date: '2024-02-08', score: 82, duration: 19, notes: 'Target achieved', completed: true }
        ]
      },
      {
        gameId: 'gaze',
        gameName: 'Gaze Tracking',
        currentScore: 76,
        averageScore: 68,
        sessionsCompleted: 7,
        totalSessions: 15,
        improvement: 32,
        frequency: '3 times per week',
        conditions: ['Maintain focus for 10+ minutes', 'Complete without breaks', 'Achieve 80% accuracy'],
        autismLikelihoodIndex: 45,
        sessions: [
          { sessionNumber: 1, date: '2024-01-26', score: 55, duration: 10, notes: 'Initial focus assessment', completed: true },
          { sessionNumber: 2, date: '2024-01-28', score: 60, duration: 11, notes: 'Improving attention span', completed: true },
          { sessionNumber: 3, date: '2024-01-30', score: 65, duration: 12, notes: 'Better concentration', completed: true },
          { sessionNumber: 4, date: '2024-02-01', score: 68, duration: 13, notes: 'Good focus maintenance', completed: true },
          { sessionNumber: 5, date: '2024-02-03', score: 72, duration: 14, notes: 'Strong attention control', completed: true },
          { sessionNumber: 6, date: '2024-02-05', score: 74, duration: 15, notes: 'Excellent focus', completed: true },
          { sessionNumber: 7, date: '2024-02-07', score: 76, duration: 16, notes: 'Target achieved', completed: true }
        ]
      },
      {
        gameId: 'repeat',
        gameName: 'Repeat With Me',
        currentScore: 89,
        averageScore: 82,
        sessionsCompleted: 6,
        totalSessions: 15,
        improvement: 26,
        frequency: '2 times per week',
        conditions: ['Follow audio instructions', 'Repeat patterns correctly', 'Maintain attention throughout'],
        autismLikelihoodIndex: 29,
        sessions: [
          { sessionNumber: 1, date: '2024-01-27', score: 75, duration: 8, notes: 'Strong baseline', completed: true },
          { sessionNumber: 2, date: '2024-01-30', score: 78, duration: 9, notes: 'Good pattern recognition', completed: true },
          { sessionNumber: 3, date: '2024-02-02', score: 82, duration: 10, notes: 'Excellent memory', completed: true },
          { sessionNumber: 4, date: '2024-02-05', score: 85, duration: 11, notes: 'Outstanding performance', completed: true },
          { sessionNumber: 5, date: '2024-02-08', score: 87, duration: 12, notes: 'Exceptional accuracy', completed: true },
          { sessionNumber: 6, date: '2024-02-11', score: 89, duration: 13, notes: 'Target exceeded', completed: true }
        ]
      },
      {
        gameId: 'mirror',
        gameName: 'Mirror Posture',
        currentScore: 71,
        averageScore: 64,
        sessionsCompleted: 5,
        totalSessions: 15,
        improvement: 35,
        frequency: '2 times per week',
        conditions: ['Mirror instructor exactly', 'Hold positions for 5+ seconds', 'Maintain balance'],
        autismLikelihoodIndex: 51,
        sessions: [
          { sessionNumber: 1, date: '2024-01-28', score: 55, duration: 10, notes: 'Initial posture assessment', completed: true },
          { sessionNumber: 2, date: '2024-01-31', score: 60, duration: 11, notes: 'Improving balance', completed: true },
          { sessionNumber: 3, date: '2024-02-03', score: 65, duration: 12, notes: 'Better mirroring', completed: true },
          { sessionNumber: 4, date: '2024-02-06', score: 68, duration: 13, notes: 'Good position holding', completed: true },
          { sessionNumber: 5, date: '2024-02-09', score: 71, duration: 14, notes: 'Target achieved', completed: true }
        ]
      },
      {
        gameId: 'dance',
        gameName: 'Dance Doodle',
        currentScore: 74,
        averageScore: 67,
        sessionsCompleted: 4,
        totalSessions: 15,
        improvement: 31,
        frequency: '2 times per week',
        conditions: ['Express creativity freely', 'Follow rhythm patterns', 'Complete full dance sequences'],
        autismLikelihoodIndex: 47,
        sessions: [
          { sessionNumber: 1, date: '2024-01-29', score: 60, duration: 15, notes: 'Creative exploration', completed: true },
          { sessionNumber: 2, date: '2024-02-01', score: 65, duration: 16, notes: 'Improving rhythm', completed: true },
          { sessionNumber: 3, date: '2024-02-04', score: 70, duration: 17, notes: 'Better coordination', completed: true },
          { sessionNumber: 4, date: '2024-02-07', score: 74, duration: 18, notes: 'Good sequence completion', completed: true }
        ]
      }
    ],
    overallProgress: 33,
    doctorNotes: 'Comprehensive program showing promising early results. Emma demonstrates strong engagement across all game types. Focus on maintaining consistency in session frequency.',
    priority: 'high',
    conditions: {
      frequency: '12 sessions per week',
      duration: '8 weeks',
      requirements: ['Dedicated therapy space', 'Parent supervision', 'Consistent daily schedule', 'Progress monitoring'],
      milestones: ['Week 2: Baseline establishment', 'Week 4: 15% improvement', 'Week 6: 30% improvement', 'Week 8: Target achievement']
    },
    assignedBy: 'Dr. Sarah Wilson',
    lastUpdated: '2024-01-25'
  }
];

const ChildProgress: React.FC = () => {
  const { childId } = useParams<{ childId: string }>();
  const { doctor } = useDoctorAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'games' | 'tasks'>('overview');
  const [selectedGame, setSelectedGame] = useState<string>('gesture');
  const [selectedSessions, setSelectedSessions] = useState<{
    taskName: string;
    gameName: string;
    sessions: any[];
  } | null>(null);
  
  // Search and filter states for therapeutic tasks
  const [taskSearchTerm, setTaskSearchTerm] = useState('');
  const [taskStatusFilter, setTaskStatusFilter] = useState<string>('all');
  const [taskPriorityFilter, setTaskPriorityFilter] = useState<string>('all');

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'text-green-600 bg-green-100';
    if (progress >= 70) return 'text-blue-600 bg-blue-100';
    if (progress >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  // Helper function for therapeutic task progress colors (text only)
  const getTaskProgressColor = (progress: number) => {
    if (progress >= 80) return 'text-green-600';
    if (progress >= 60) return 'text-blue-600';
    if (progress >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressLabel = (progress: number) => {
    if (progress >= 80) return 'Excellent';
    if (progress >= 70) return 'Good';
    if (progress >= 60) return 'Improving';
    return 'Needs Attention';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'in_progress': return 'text-blue-600 bg-blue-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'overdue': return 'text-red-600 bg-red-100';
      case 'running': return 'text-blue-600 bg-blue-100';
      case 'paused': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysSinceLastActive = (lastActive: string) => {
    const lastActiveDate = new Date(lastActive);
    const now = new Date();
    const diffTime = now.getTime() - lastActiveDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getCompletionRate = (completed: number, assigned: number) => {
    return assigned > 0 ? Math.round((completed / assigned) * 100) : 0;
  };

  // Filter therapeutic tasks based on search and filter criteria
  const filteredTherapeuticTasks = mockTherapeuticTasks.filter(task => {
    const matchesSearch = task.name.toLowerCase().includes(taskSearchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(taskSearchTerm.toLowerCase()) ||
                         task.assignedBy.toLowerCase().includes(taskSearchTerm.toLowerCase());
    
    const matchesStatus = taskStatusFilter === 'all' || task.status === taskStatusFilter;
    const matchesPriority = taskPriorityFilter === 'all' || task.priority === taskPriorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Helper function to get max score for scaling
  const getMaxScore = (sessions: GameSession[]) => {
    return Math.max(...sessions.map(s => s.score), 100);
  };

  // Helper function to get min score for scaling
  const getMinScore = (sessions: GameSession[]) => {
    return Math.min(...sessions.map(s => s.score), 0);
  };


  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to="/doctor/children"
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{mockPatient.name}</h1>
            <p className="text-gray-600">
              {mockPatient.diagnosis} • {mockPatient.age} years old • Patient ID: {mockPatient.id}
            </p>
          </div>
        </div>
        
        <div className="flex space-x-3">
          <Link
            to={`/doctor/children/${childId}/tasks`}
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
          >
            <BookOpen className="h-4 w-4 mr-2" />
            Assign Task
          </Link>
          <Link
            to={`/doctor/chat?patient=${childId}`}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Start Chat
          </Link>
        </div>
      </div>

      {/* Patient Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-purple-500 text-white">
              <Target className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Overall Progress</p>
              <p className="text-2xl font-bold text-gray-900">{mockPatient.overallProgress}%</p>
              <p className={`text-sm font-medium ${getProgressColor(mockPatient.overallProgress)}`}>
                {getProgressLabel(mockPatient.overallProgress)}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-500 text-white">
              <BookOpen className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tasks Completed</p>
              <p className="text-2xl font-bold text-gray-900">{mockPatient.tasksCompleted}/{mockPatient.tasksAssigned}</p>
              <p className="text-sm text-gray-500">{getCompletionRate(mockPatient.tasksCompleted, mockPatient.tasksAssigned)}% completion</p>
            </div>
          </div>
        </div>
        
        {/* ALI Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <div className="p-3 rounded-lg bg-gradient-to-r from-green-500 to-red-500 text-white">
              <Brain className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Autism Likelihood Index</p>
              <p className="text-2xl font-bold text-gray-900">{mockPatient.autismLikelihoodIndex}%</p>
            </div>
          </div>
          
          {/* ALI Spectrum */}
          <div className="relative">
            <div className="h-3 bg-gradient-to-r from-green-400 via-yellow-400 to-red-500 rounded-full relative">
              {/* Current ALI Position */}
              <div 
                className="absolute top-0 w-1 h-3 bg-gray-800 rounded-full transform -translate-x-1/2 shadow-lg"
                style={{ left: `${mockPatient.autismLikelihoodIndex}%` }}
              >
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-semibold text-gray-800">
                  {mockPatient.autismLikelihoodIndex}%
                </div>
              </div>
              
              {/* Threshold Marker */}
              <div 
                className="absolute top-0 w-1 h-3 bg-gray-600 rounded-full transform -translate-x-1/2 border-2 border-white shadow-md cursor-pointer group"
                style={{ left: '70%' }}
                title="Clinical Threshold: 70% - Scores above this level indicate higher likelihood of autism spectrum characteristics"
              >
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs font-semibold text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  Threshold: 70%
                </div>
                <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                  Clinical Assessment Point
                </div>
              </div>
            </div>
            
            {/* Spectrum Labels */}
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span>Low Risk</span>
              <span>Moderate</span>
              <span>High Risk</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', name: 'Overview', icon: BarChart3 },
              { id: 'games', name: 'Game Performance', icon: Brain },
              { id: 'tasks', name: 'Therapeutic Tasks', icon: BookOpen }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'overview' | 'games' | 'tasks')}
                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Patient Information Card */}
                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-100">
                  <div className="flex items-center mb-6">
                    <div className="p-3 bg-purple-100 rounded-lg mr-4">
                      <Stethoscope className="h-6 w-6 text-purple-600" />
                    </div>
                <div>
                      <h3 className="text-xl font-semibold text-gray-900">Patient Information</h3>
                      <p className="text-sm text-gray-600">Medical and therapeutic details</p>
                    </div>
                    </div>
                  
                  <div className="space-y-4">
                    <div className="bg-white rounded-lg p-4 border border-purple-100">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">Full Name</span>
                        <Users className="h-4 w-4 text-gray-400" />
                    </div>
                      <p className="text-lg font-semibold text-gray-900">{mockPatient.name}</p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-4 border border-purple-100">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">Diagnosis</span>
                        <Heart className="h-4 w-4 text-gray-400" />
                      </div>
                      <p className="text-lg font-semibold text-gray-900">{mockPatient.diagnosis}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white rounded-lg p-4 border border-purple-100">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">Age</span>
                          <Calendar className="h-4 w-4 text-gray-400" />
                        </div>
                        <p className="text-lg font-semibold text-gray-900">{mockPatient.age} years</p>
                      </div>
                      
                      <div className="bg-white rounded-lg p-4 border border-purple-100">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">Patient ID</span>
                          <Target className="h-4 w-4 text-gray-400" />
                        </div>
                        <p className="text-lg font-semibold text-gray-900">#{mockPatient.id}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white rounded-lg p-4 border border-purple-100">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">Status</span>
                          <Activity className="h-4 w-4 text-gray-400" />
                        </div>
                        <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(mockPatient.status)}`}>
                          {mockPatient.status.charAt(0).toUpperCase() + mockPatient.status.slice(1)}
                      </span>
                    </div>
                      
                      <div className="bg-white rounded-lg p-4 border border-purple-100">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">Priority</span>
                          <Award className="h-4 w-4 text-gray-400" />
                        </div>
                        <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(mockPatient.priority)}`}>
                          {mockPatient.priority.charAt(0).toUpperCase() + mockPatient.priority.slice(1)}
                      </span>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-lg p-4 border border-purple-100">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">Enrollment Date</span>
                        <Calendar className="h-4 w-4 text-gray-400" />
                      </div>
                      <p className="text-lg font-semibold text-gray-900">{formatDate(mockPatient.enrollmentDate)}</p>
                    </div>
                  </div>
                </div>
                
                {/* Parent Information Card */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
                  <div className="flex items-center mb-6">
                    <div className="p-3 bg-green-100 rounded-lg mr-4">
                      <Users className="h-6 w-6 text-green-600" />
                    </div>
                <div>
                      <h3 className="text-xl font-semibold text-gray-900">Parent Information</h3>
                      <p className="text-sm text-gray-600">Guardian and contact details</p>
                    </div>
                    </div>
                  
                  <div className="space-y-4">
                    <div className="bg-white rounded-lg p-4 border border-green-100">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">Guardian Name</span>
                        <Users className="h-4 w-4 text-gray-400" />
                      </div>
                      <p className="text-lg font-semibold text-gray-900">{mockPatient.parentName}</p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-4 border border-green-100">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">Email Address</span>
                        <MessageSquare className="h-4 w-4 text-gray-400" />
                      </div>
                      <p className="text-lg font-semibold text-gray-900">{mockPatient.parentEmail}</p>
                    </div>
                    
                    {mockPatient.nextAppointment && (
                      <div className="bg-white rounded-lg p-4 border border-green-100">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">Next Appointment</span>
                          <Calendar className="h-4 w-4 text-gray-400" />
                        </div>
                        <p className="text-lg font-semibold text-purple-600">{formatDate(mockPatient.nextAppointment)}</p>
                      </div>
                    )}
                    
                    <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg p-4 border border-green-200">
                      <div className="flex items-center">
                        <div className="p-2 bg-green-200 rounded-lg mr-3">
                          <MessageSquare className="h-5 w-5 text-green-700" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-green-800">Communication</p>
                          <p className="text-xs text-green-600">Click "Start Chat" to communicate with parent</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100">
                    <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">Completed Focus Enhancement Task</p>
                      <p className="text-xs text-gray-600">Task • 2 hours ago • Score: 18/20</p>
                  </div>
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">Completed</span>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-100">
                    <div className="p-2 bg-blue-100 rounded-lg">
                    <Play className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">Played Gesture Recognition Game</p>
                      <p className="text-xs text-gray-600">Game • 1 day ago • Score: 92%</p>
                  </div>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">Game</span>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg border border-yellow-100">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                    <BookOpen className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">Started Motor Skills Development Task</p>
                      <p className="text-xs text-gray-600">Task • 2 days ago • In Progress</p>
                    </div>
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">In Progress</span>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg border border-purple-100">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Brain className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">Completed Memory Training Game</p>
                      <p className="text-xs text-gray-600">Game • 3 days ago • Score: 85%</p>
                    </div>
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">Game</span>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-100">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Target className="h-5 w-5 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">Assigned Attention Building Task</p>
                      <p className="text-xs text-gray-600">Task • 4 days ago • Pending</p>
                    </div>
                    <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded-full">Pending</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Games Performance Tab */}
          {activeTab === 'games' && (
            <div className="space-y-6">
              {/* Game Selection */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Game Performance Analysis</h3>
                  <div className="flex items-center space-x-3">
                    <label className="text-sm font-medium text-gray-700">Select Game:</label>
                    <div className="relative">
                      <select
                        value={selectedGame}
                        onChange={(e) => setSelectedGame(e.target.value)}
                        className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        {Object.values(mockGamePerformanceData).map((game) => (
                          <option key={game.gameId} value={game.gameId}>
                            {game.gameName}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Selected Game Info */}
                {(() => {
                  const gameData = mockGamePerformanceData[selectedGame];
                  if (!gameData) return null;

                  return (
                    <div className="space-y-6">
                      {/* Game Header */}
                      <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                        <div className={`p-3 rounded-lg ${gameData.color} text-white`}>
                          {gameData.icon}
                        </div>
                    <div>
                          <h4 className="text-xl font-semibold text-gray-900">{gameData.gameName}</h4>
                          <p className="text-sm text-gray-600">
                            {gameData.sessions.length} sessions completed • 
                            Latest score: {gameData.sessions[gameData.sessions.length - 1]?.score}%
                          </p>
                    </div>
                  </div>

                      {/* Line Graph */}
                      <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <h5 className="text-lg font-semibold text-gray-900 mb-4">Performance Trend</h5>
                        <div className="relative h-64 bg-gray-50 rounded-lg p-4">
                          <svg className="w-full h-full" viewBox="0 0 400 200">
                            {/* Grid lines */}
                            <defs>
                              <pattern id="grid" width="40" height="20" patternUnits="userSpaceOnUse">
                                <path d="M 40 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" strokeWidth="1"/>
                              </pattern>
                            </defs>
                            <rect width="100%" height="100%" fill="url(#grid)" />
                            
                            {/* Y-axis labels */}
                            {(() => {
                              const maxScore = getMaxScore(gameData.sessions);
                              const minScore = getMinScore(gameData.sessions);
                              const range = maxScore - minScore;
                              const step = range / 4;
                              
                              return Array.from({ length: 5 }, (_, i) => {
                                const value = Math.round(maxScore - (i * step));
                                const y = 20 + (i * 40);
                                return (
                                  <g key={i}>
                                    <text x="10" y={y + 5} className="text-xs fill-gray-500" textAnchor="end">
                                      {value}%
                                    </text>
                                    <line x1="30" y1={y} x2="380" y2={y} stroke="#e5e7eb" strokeWidth="1" />
                                  </g>
                                );
                              });
                            })()}

                            {/* X-axis labels */}
                            {gameData.sessions.map((session, index) => {
                              const x = 50 + (index * 55);
                              return (
                                <text key={index} x={x} y="190" className="text-xs fill-gray-500" textAnchor="middle">
                                  S{session.sessionNumber}
                                </text>
                              );
                            })}

                            {/* Line and points */}
                            {(() => {
                              const maxScore = getMaxScore(gameData.sessions);
                              const minScore = getMinScore(gameData.sessions);
                              const range = maxScore - minScore;
                              
                              const points = gameData.sessions.map((session, index) => {
                                const x = 50 + (index * 55);
                                const y = 20 + ((maxScore - session.score) / range) * 160;
                                return `${x},${y}`;
                              }).join(' ');

                              return (
                                <>
                                  {/* Line */}
                                  <polyline
                                    points={points}
                                    fill="none"
                                    stroke="#3b82f6"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                  
                                  {/* Points with hover details */}
                                  {gameData.sessions.map((session, index) => {
                                    const x = 50 + (index * 55);
                                    const y = 20 + ((maxScore - session.score) / range) * 160;
                                    
                                    return (
                                      <g key={index}>
                                        <circle
                                          cx={x}
                                          cy={y}
                                          r="6"
                                          fill="#3b82f6"
                                          stroke="white"
                                          strokeWidth="2"
                                          className="cursor-pointer hover:r-8 transition-all duration-200"
                                        />
                                        <circle
                                          cx={x}
                                          cy={y}
                                          r="12"
                                          fill="transparent"
                                          className="cursor-pointer"
                                        >
                                          <title>
                                            Session {session.sessionNumber}: {session.score}%{'\n'}
                                            Date: {formatDate(session.date)}{'\n'}
                                            Duration: {session.duration} minutes
                                          </title>
                                        </circle>
                                      </g>
                                    );
                                  })}
                                </>
                              );
                            })()}
                          </svg>
                </div>
                      </div>

                      {/* AI Insights */}
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
                        <div className="flex items-start space-x-3">
                          <div className="p-2 bg-blue-500 rounded-lg">
                            <Brain className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <h6 className="text-lg font-semibold text-gray-900 mb-2">AI Performance Insights</h6>
                            <p className="text-gray-700 leading-relaxed">{gameData.aiInsight}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {/* Therapeutic Tasks Tab */}
          {activeTab === 'tasks' && (
            <div className="space-y-6">
              {/* Tasks Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center">
                    <div className="p-3 rounded-lg bg-blue-500 text-white">
                      <Activity className="h-6 w-6" />
                    </div>
                    <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Running Tasks</p>
                        <p className="text-2xl font-bold text-gray-900">
                         {filteredTherapeuticTasks.filter(task => task.status === 'running').length}
                        </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center">
                    <div className="p-3 rounded-lg bg-green-500 text-white">
                      <CheckCircle className="h-6 w-6" />
                    </div>
                    <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Completed Tasks</p>
                        <p className="text-2xl font-bold text-gray-900">
                         {filteredTherapeuticTasks.filter(task => task.status === 'completed').length}
                        </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center">
                    <div className="p-3 rounded-lg bg-purple-500 text-white">
                      <TrendingUp className="h-6 w-6" />
                    </div>
                    <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Avg. Progress</p>
                        <p className="text-2xl font-bold text-gray-900">
                         {filteredTherapeuticTasks.length > 0 ? Math.round(filteredTherapeuticTasks.reduce((acc, task) => acc + task.overallProgress, 0) / filteredTherapeuticTasks.length) : 0}%
                        </p>
                    </div>
                  </div>
                </div>
              </div>

               {/* Search and Filter Controls */}
               <div className="bg-white rounded-lg border border-gray-200 p-6">
                 <div className="flex flex-col lg:flex-row gap-4">
                   {/* Search Input */}
                   <div className="flex-1">
                     <label htmlFor="task-search" className="block text-sm font-medium text-gray-700 mb-2">
                       Search Tasks
                     </label>
                     <div className="relative">
                       <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                       <input
                         id="task-search"
                         type="text"
                         placeholder="Search by task name, description, or assigned by..."
                         value={taskSearchTerm}
                         onChange={(e) => setTaskSearchTerm(e.target.value)}
                         className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                       />
                     </div>
                   </div>

                   {/* Status Filter */}
                   <div className="lg:w-48">
                     <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-2">
                       Status
                     </label>
                     <select
                       id="status-filter"
                       value={taskStatusFilter}
                       onChange={(e) => setTaskStatusFilter(e.target.value)}
                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                     >
                       <option value="all">All Status</option>
                       <option value="running">Running</option>
                       <option value="completed">Completed</option>
                       <option value="paused">Paused</option>
                     </select>
                   </div>

                   {/* Priority Filter */}
                   <div className="lg:w-48">
                     <label htmlFor="priority-filter" className="block text-sm font-medium text-gray-700 mb-2">
                       Priority
                     </label>
                     <select
                       id="priority-filter"
                       value={taskPriorityFilter}
                       onChange={(e) => setTaskPriorityFilter(e.target.value)}
                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                     >
                       <option value="all">All Priority</option>
                       <option value="high">High</option>
                       <option value="medium">Medium</option>
                       <option value="low">Low</option>
                     </select>
                   </div>

                   {/* Clear Filters Button */}
                   <div className="lg:w-auto flex items-end">
                     <button
                       onClick={() => {
                         setTaskSearchTerm('');
                         setTaskStatusFilter('all');
                         setTaskPriorityFilter('all');
                       }}
                       className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                     >
                       Clear Filters
                     </button>
                   </div>
                 </div>

                 {/* Results Count */}
                 <div className="mt-4 pt-4 border-t border-gray-200">
                   <p className="text-sm text-gray-600">
                     Showing {filteredTherapeuticTasks.length} of {mockTherapeuticTasks.length} tasks
                   </p>
                 </div>
               </div>

               {/* Tasks List */}
               <div className="space-y-6">
                 {filteredTherapeuticTasks.length === 0 ? (
                   <div className="text-center py-12">
                     <div className="text-gray-400 mb-4">
                       <BookOpen className="h-16 w-16 mx-auto" />
                     </div>
                     <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
                     <p className="text-gray-600 mb-4">
                       {taskSearchTerm || taskStatusFilter !== 'all' || taskPriorityFilter !== 'all' 
                         ? 'Try adjusting your search or filter criteria.'
                         : 'No therapeutic tasks have been assigned yet.'
                       }
                     </p>
                     {(taskSearchTerm || taskStatusFilter !== 'all' || taskPriorityFilter !== 'all') && (
                       <button
                         onClick={() => {
                           setTaskSearchTerm('');
                           setTaskStatusFilter('all');
                           setTaskPriorityFilter('all');
                         }}
                         className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                       >
                         Clear Filters
                       </button>
                     )}
                   </div>
                 ) : (
                   filteredTherapeuticTasks.map((task) => (
                  <div key={task.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {/* Task Header */}
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-xl font-bold text-gray-900">{task.name}</h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(task.status)}`}>
                              {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor(task.priority)}`}>
                              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
                            </span>
                          </div>
                          <p className="text-gray-700 mb-3">{task.description}</p>
                          
                          {/* Task Meta Information */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4 text-gray-500" />
                              <div>
                                <p className="text-gray-500">Assigned</p>
                                <p className="font-medium text-gray-900">{formatDate(task.assignedDate)}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <User className="h-4 w-4 text-gray-500" />
                              <div>
                                <p className="text-gray-500">Assigned By</p>
                                <p className="font-medium text-gray-900">{task.assignedBy}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-6">

                      {/* Task Timeline */}
                      <div className="mb-6">
                        <h4 className="text-lg font-semibold text-gray-900 mb-3">Task Timeline</h4>
                        <div className="flex items-center space-x-4 text-sm">
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                            <span className="text-gray-600">Start: {formatDate(task.startDate)}</span>
                          </div>
                          <div className="flex-1 h-px bg-gray-300"></div>
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <span className="text-gray-600">End: {formatDate(task.endDate)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Games in Task */}
                      <div className="mb-6">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">Assigned Games ({task.games.length})</h4>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          {task.games.map((game, index) => (
                            <div key={index} className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-5 border border-blue-200">
                              <div className="mb-3">
                                <div className="flex items-center justify-between">
                                  <h5 className="text-lg font-semibold text-gray-900">{game.gameName}</h5>
                                  <button
                                    onClick={() => setSelectedSessions({
                                      taskName: task.name,
                                      gameName: game.gameName,
                                      sessions: game.sessions
                                    })}
                                    className="text-sm text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
                                  >
                                    {game.sessionsCompleted} sessions played
                                  </button>
                                </div>
                              </div>
                              
                              {/* Game Performance Metrics */}
                              <div className="grid grid-cols-2 gap-3 mb-4">
                                <div className="bg-white rounded-lg p-3">
                                  <p className="text-xs text-gray-500 mb-1">Current Score</p>
                                  <p className="text-lg font-bold text-gray-900">{game.currentScore}%</p>
                                </div>
                                <div className="bg-white rounded-lg p-3">
                                  <p className="text-xs text-gray-500 mb-1">Average Score</p>
                                  <p className="text-lg font-bold text-gray-900">{game.averageScore}%</p>
                                </div>
                                <div className="bg-white rounded-lg p-3">
                                  <p className="text-xs text-gray-500 mb-1">Improvement</p>
                                  <p className="text-lg font-bold text-green-600">+{game.improvement}%</p>
                                </div>
                                <div className="bg-white rounded-lg p-3">
                                  <p className="text-xs text-gray-500 mb-1">ALI Score</p>
                                  <p className="text-lg font-bold text-gray-900">{game.autismLikelihoodIndex}%</p>
                                </div>
                              </div>

                              {/* ALI Spectrum */}
                              <div className="mb-3">
                                <div className="mb-2">
                                  <p className="text-sm font-medium text-gray-700">Autism Likelihood Index</p>
                                  <div className="flex items-center space-x-2 mt-1">
                                    <span className="text-sm font-semibold text-gray-800">{game.autismLikelihoodIndex}%</span>
                                    <span className="text-xs text-gray-500">(ALI)</span>
                                  </div>
                                </div>
                                <div className="relative">
                                  <div className="h-3 bg-gradient-to-r from-green-400 via-yellow-400 to-orange-400 rounded-full relative">
                                    {/* Current ALI Position */}
                                    <div 
                                      className="absolute top-0 w-0.5 h-3 bg-gray-800 rounded-full transform -translate-x-1/2"
                                      style={{ left: `${game.autismLikelihoodIndex}%` }}
                                    ></div>
                                    
                                    {/* Threshold Marker */}
                                    <div 
                                      className="absolute top-0 w-0.5 h-3 bg-gray-600 rounded-full transform -translate-x-1/2 border border-white cursor-pointer group"
                                      style={{ left: '70%' }}
                                      title="Clinical Threshold: 70% - Scores above this level indicate higher likelihood of autism spectrum characteristics"
                                    >
                                      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                                        Threshold: 70%
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {/* Spectrum Labels */}
                                  <div className="flex justify-between mt-2 text-xs text-gray-500">
                                    <span>Low Risk</span>
                                    <span>Moderate</span>
                                    <span>High Risk</span>
                                  </div>
                                </div>
                              </div>

                            </div>
                          ))}
                        </div>
                      </div>


                      {/* Doctor Notes */}
                      {task.doctorNotes && (
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                          <div className="flex items-start space-x-3">
                            <div className="p-2 bg-blue-500 rounded-lg">
                              <Stethoscope className="h-4 w-4 text-white" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-blue-900 mb-2">Doctor's Clinical Notes</p>
                              <p className="text-sm text-blue-800 leading-relaxed">{task.doctorNotes}</p>
                              <p className="text-xs text-blue-600 mt-2">Last updated: {formatDate(task.lastUpdated)}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))
                 )}
              </div>
            </div>
          )}

          {/* Other tabs will be implemented in the next edit */}
          {activeTab !== 'overview' && activeTab !== 'games' && activeTab !== 'tasks' && (
            <div className="text-center py-12">
              <p className="text-gray-500">This tab will be implemented in the next update.</p>
            </div>
          )}
        </div>
      </div>

      {/* Session Details Modal */}
      {selectedSessions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedSessions.gameName} Sessions</h3>
                  <p className="text-sm text-gray-600 mt-1">Task: {selectedSessions.taskName}</p>
                </div>
                <button
                  onClick={() => setSelectedSessions(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {selectedSessions.sessions && selectedSessions.sessions.length > 0 ? (
                <div className="space-y-6">
                  {/* Session Performance Graph */}
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Session Performance Trend</h4>
                    <div className="h-64 relative">
                      <svg width="100%" height="100%" className="overflow-visible">
                        {/* Grid lines */}
                        <defs>
                          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#f3f4f6" strokeWidth="1"/>
                          </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#grid)" />
                        
                        {/* Y-axis labels */}
                        {(() => {
                          const maxScore = Math.max(...selectedSessions.sessions.map(s => s.score));
                          const minScore = Math.min(...selectedSessions.sessions.map(s => s.score));
                          const range = maxScore - minScore;
                          const padding = range * 0.1;
                          const yMin = Math.max(0, minScore - padding);
                          const yMax = Math.min(100, maxScore + padding);
                          const yRange = yMax - yMin;
                          
                          return Array.from({ length: 6 }, (_, i) => {
                            const value = yMin + (yRange * i / 5);
                            const y = 240 - (240 * (value - yMin) / yRange);
                            return (
                              <g key={i}>
                                <line x1="40" y1={y} x2="100%" y2={y} stroke="#e5e7eb" strokeWidth="1" />
                                <text x="35" y={y + 4} textAnchor="end" className="text-xs fill-gray-500">
                                  {Math.round(value)}%
                                </text>
                              </g>
                            );
                          });
                        })()}
                        
                        {/* X-axis labels */}
                        {selectedSessions.sessions.map((session, index) => {
                          const x = 40 + (index * (100 - 40) / (selectedSessions.sessions.length - 1));
                          return (
                            <g key={index}>
                              <line x1={x} y1="240" x2={x} y2="0" stroke="#e5e7eb" strokeWidth="1" />
                              <text x={x} y="255" textAnchor="middle" className="text-xs fill-gray-500">
                                S{session.sessionNumber}
                              </text>
                            </g>
                          );
                        })}
                        
                        {/* Performance line */}
                        <polyline
                          points={selectedSessions.sessions.map((session, index) => {
                            const maxScore = Math.max(...selectedSessions.sessions.map(s => s.score));
                            const minScore = Math.min(...selectedSessions.sessions.map(s => s.score));
                            const range = maxScore - minScore;
                            const padding = range * 0.1;
                            const yMin = Math.max(0, minScore - padding);
                            const yMax = Math.min(100, maxScore + padding);
                            const yRange = yMax - yMin;
                            
                            const x = 40 + (index * (100 - 40) / (selectedSessions.sessions.length - 1));
                            const y = 240 - (240 * (session.score - yMin) / yRange);
                            return `${x},${y}`;
                          }).join(' ')}
                          fill="none"
                          stroke="#10b981"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        
                        {/* Data points */}
                        {selectedSessions.sessions.map((session, index) => {
                          const maxScore = Math.max(...selectedSessions.sessions.map(s => s.score));
                          const minScore = Math.min(...selectedSessions.sessions.map(s => s.score));
                          const range = maxScore - minScore;
                          const padding = range * 0.1;
                          const yMin = Math.max(0, minScore - padding);
                          const yMax = Math.min(100, maxScore + padding);
                          const yRange = yMax - yMin;
                          
                          const x = 40 + (index * (100 - 40) / (selectedSessions.sessions.length - 1));
                          const y = 240 - (240 * (session.score - yMin) / yRange);
                          
                          return (
                            <g key={index}>
                              <circle
                                cx={x}
                                cy={y}
                                r="6"
                                fill="#10b981"
                                stroke="white"
                                strokeWidth="2"
                                className="cursor-pointer hover:r-8 transition-all duration-200"
                              >
                                <title>
                                  Session {session.sessionNumber}: {session.score}%{'\n'}
                                  Date: {formatDate(session.date)}{'\n'}
                                  Duration: {session.duration} minutes{'\n'}
                                  {session.notes ? `Notes: ${session.notes}` : ''}
                                </title>
                              </circle>
                            </g>
                          );
                        })}
                      </svg>
                    </div>
                  </div>
                  
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-500 mb-2">
                    <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  </div>
                  <p className="text-gray-600">No completed sessions found for this game.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChildProgress;
