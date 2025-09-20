// Mock data for Doctor Dashboard
// This file contains all the mock data needed for the doctor dashboard functionality

export interface Patient {
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
  phone?: string;
  address?: string;
  notes?: string;
  therapyGoals?: string[];
  medicalHistory?: string[];
  currentMedications?: string[];
  // Task completion regularity
  taskCompletionRate: number; // percentage of tasks completed on time
  lastTaskCompletion: string; // when they last completed a task
  averageTaskDelay: number; // average days delay in task completion
  // Autism Likelihood Index
  autismLikelihoodIndex: number; // ALI score as percentage
}

export interface Game {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'cognitive' | 'motor' | 'social' | 'attention' | 'memory';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedDuration: number; // in minutes
  therapeuticBenefits: string[];
}

export interface TaskGame {
  gameId: string;
  gameName: string;
  targetScore: number;
  requiredSessions: number;
  isCompleted: boolean;
  currentScore?: number;
  sessionsCompleted?: number;
  lastPlayed?: string;
}

export interface TherapeuticTask {
  id: string;
  title: string;
  description: string;
  therapyGoal: string;
  assignedDate: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'expired';
  assignedTo: string[];
  games: TaskGame[];
  totalAssigned: number;
  completedCount: number;
  priority: 'high' | 'medium' | 'low';
  notes?: string;
  createdBy: string;
  estimatedDuration: number; // in days
}

export interface ProgressData {
  date: string;
  score: number;
  gameType: string;
  gameId: string;
  sessionDuration: number;
  notes?: string;
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'doctor' | 'patient' | 'parent';
  timestamp: Date;
  type: 'text' | 'image' | 'file' | 'voice';
  isRead: boolean;
  patientId?: string;
  parentId?: string;
}

export interface ChatSession {
  patientId: string;
  patientName: string;
  parentName: string;
  lastMessage?: string;
  lastMessageTime?: Date;
  unreadCount: number;
  status: 'active' | 'archived';
  lastSeen?: Date;
}

export interface GameSession {
  id: string;
  patientId: string;
  gameId: string;
  gameName: string;
  score: number;
  duration: number; // in minutes
  date: string;
  notes?: string;
  difficulty: string;
  completed: boolean;
}

export interface TherapyPlan {
  id: string;
  patientId: string;
  title: string;
  description: string;
  goals: string[];
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'paused';
  sessionsPerWeek: number;
  totalSessions: number;
  completedSessions: number;
  progress: number;
  notes?: string;
}

// Mock Patients Data
export const mockPatients: Patient[] = [
  {
    id: '1',
    name: 'Ariyana Khatun',
    age: 7,
    diagnosis: 'Speech and Language Delay',
    parentName: 'Tajul Islam Tarek',
    parentEmail: 'tajul.islam@email.com',
    enrollmentDate: '2024-01-15',
    lastActive: '2 hours ago',
    lastSession: '2024-01-20',
    overallProgress: 75,
    gamesPlayed: 45,
    tasksCompleted: 8,
    tasksAssigned: 10,
    therapyHours: 12.5,
    status: 'active',
    priority: 'high',
    nextAppointment: '2024-01-25',
    phone: '+880 1712-345678',
    address: 'Dhaka, Bangladesh',
    taskCompletionRate: 85, // 85% of tasks completed on time
    lastTaskCompletion: '1 day ago',
    averageTaskDelay: 0.5, // 0.5 days average delay
    autismLikelihoodIndex: 25, // Low risk
    notes: 'Responds well to visual cues and positive reinforcement. Shows improvement in speech clarity.',
    therapyGoals: ['Improve speech clarity', 'Expand vocabulary', 'Enhance communication skills'],
    medicalHistory: ['Speech delay identified at age 4', 'Previous speech therapy'],
    currentMedications: []
  },
  {
    id: '2',
    name: 'Ihan Ahmad',
    age: 9,
    diagnosis: 'Behavioral Issues',
    parentName: 'Tajul Islam Tarek',
    parentEmail: 'tajul.islam@email.com',
    enrollmentDate: '2024-01-10',
    lastActive: '1 day ago',
    lastSession: '2024-01-19',
    overallProgress: 60,
    gamesPlayed: 32,
    tasksCompleted: 6,
    tasksAssigned: 8,
    therapyHours: 8.0,
    status: 'active',
    priority: 'medium',
    taskCompletionRate: 75, // 75% of tasks completed on time
    lastTaskCompletion: '2 days ago',
    averageTaskDelay: 1.2, // 1.2 days average delay
    autismLikelihoodIndex: 45, // Moderate risk
    nextAppointment: '2024-01-26',
    phone: '+880 1712-345678',
    address: 'Dhaka, Bangladesh',
    notes: 'Shows improvement in behavioral control games. Needs consistent positive reinforcement.',
    therapyGoals: ['Improve behavioral control', 'Enhance emotional regulation', 'Develop social skills'],
    medicalHistory: ['Behavioral issues identified at age 6'],
    currentMedications: []
  },
  {
    id: '3',
    name: 'Manjana Begum',
    age: 7,
    diagnosis: 'Cognitive Impairment',
    parentName: 'Tajul Islam Tarek',
    parentEmail: 'tajul.islam@email.com',
    enrollmentDate: '2024-01-05',
    lastActive: '3 hours ago',
    lastSession: '2024-01-20',
    overallProgress: 55,
    gamesPlayed: 28,
    tasksCompleted: 5,
    tasksAssigned: 8,
    therapyHours: 6.5,
    status: 'active',
    priority: 'high',
    taskCompletionRate: 65, // 65% of tasks completed on time
    lastTaskCompletion: '3 hours ago',
    averageTaskDelay: 1.5, // 1.5 days average delay
    autismLikelihoodIndex: 60, // Moderate-high risk
    nextAppointment: '2024-01-24',
    phone: '+880 1712-345678',
    address: 'Dhaka, Bangladesh',
    notes: 'Requires additional support in cognitive games. Making steady progress with patience.',
    therapyGoals: ['Improve cognitive processing', 'Enhance memory skills', 'Develop problem-solving abilities'],
    medicalHistory: ['Cognitive impairment identified at age 5'],
    currentMedications: []
  },
  {
    id: '4',
    name: 'Mehraz Hossain',
    age: 4,
    diagnosis: 'Learning Disability',
    parentName: 'Tajul Islam Tarek',
    parentEmail: 'tajul.islam@email.com',
    enrollmentDate: '2023-12-20',
    lastActive: '1 day ago',
    lastSession: '2024-01-19',
    overallProgress: 40,
    gamesPlayed: 22,
    tasksCompleted: 3,
    tasksAssigned: 6,
    therapyHours: 4.5,
    status: 'active',
    priority: 'high',
    taskCompletionRate: 50, // 50% of tasks completed on time
    lastTaskCompletion: '1 day ago',
    averageTaskDelay: 2.0, // 2.0 days average delay
    autismLikelihoodIndex: 35, // Low-moderate risk
    nextAppointment: '2024-01-28',
    phone: '+880 1712-345678',
    address: 'Dhaka, Bangladesh',
    notes: 'Young patient requiring age-appropriate learning games. Shows enthusiasm for interactive activities.',
    therapyGoals: ['Develop basic learning skills', 'Improve attention span', 'Build foundational knowledge'],
    medicalHistory: ['Learning disability identified at age 3'],
    currentMedications: []
  },
  {
    id: '5',
    name: 'Saeed Ahmed Mridha',
    age: 6,
    diagnosis: 'ADHD (Attention Deficit Hyperactivity Disorder)',
    parentName: 'Tajul Islam Tarek',
    parentEmail: 'tajul.islam@email.com',
    enrollmentDate: '2024-01-12',
    lastActive: '2 hours ago',
    lastSession: '2024-01-20',
    overallProgress: 70,
    gamesPlayed: 35,
    tasksCompleted: 7,
    tasksAssigned: 9,
    therapyHours: 8.5,
    status: 'active',
    priority: 'high',
    taskCompletionRate: 78, // 78% of tasks completed on time
    lastTaskCompletion: '2 hours ago',
    averageTaskDelay: 0.8, // 0.8 days average delay
    autismLikelihoodIndex: 30, // Low risk
    nextAppointment: '2024-01-23',
    phone: '+880 1712-345678',
    address: 'Dhaka, Bangladesh',
    notes: 'Responds well to movement-based games. Shows improvement in attention span with structured activities.',
    therapyGoals: ['Improve attention span', 'Enhance focus during tasks', 'Reduce hyperactivity'],
    medicalHistory: ['ADHD diagnosis at age 5'],
    currentMedications: []
  },
  {
    id: '6',
    name: 'Shahir Ahmad',
    age: 8,
    diagnosis: 'ADHD (Attention Deficit Hyperactivity Disorder)',
    parentName: 'Tajul Islam Tarek',
    parentEmail: 'tajul.islam@email.com',
    enrollmentDate: '2024-01-08',
    lastActive: '4 hours ago',
    lastSession: '2024-01-20',
    overallProgress: 65,
    gamesPlayed: 30,
    tasksCompleted: 6,
    tasksAssigned: 8,
    therapyHours: 7.0,
    status: 'active',
    priority: 'medium',
    taskCompletionRate: 72, // 72% of tasks completed on time
    lastTaskCompletion: '4 hours ago',
    averageTaskDelay: 1.0, // 1.0 days average delay
    autismLikelihoodIndex: 25, // Low risk
    nextAppointment: '2024-01-27',
    phone: '+880 1712-345678',
    address: 'Dhaka, Bangladesh',
    notes: 'Shows good progress in attention-based games. Benefits from regular breaks and positive reinforcement.',
    therapyGoals: ['Improve sustained attention', 'Enhance impulse control', 'Develop self-regulation skills'],
    medicalHistory: ['ADHD diagnosis at age 6'],
    currentMedications: []
  }
];

// Mock Games Data
export const mockGames: Game[] = [
  {
    id: 'gaze-tracking',
    name: 'Eye Tracking Focus',
    description: 'Improves attention and focus through eye movement exercises',
    icon: '👁️',
    category: 'attention',
    difficulty: 'beginner',
    estimatedDuration: 10,
    therapeuticBenefits: ['Attention span', 'Focus improvement', 'Visual tracking']
  },
  {
    id: 'gesture-control',
    name: 'Hand Gesture Recognition',
    description: 'Develops fine motor skills and hand-eye coordination',
    icon: '✋',
    category: 'motor',
    difficulty: 'intermediate',
    estimatedDuration: 15,
    therapeuticBenefits: ['Fine motor skills', 'Hand-eye coordination', 'Spatial awareness']
  },
  {
    id: 'mirror-posture',
    name: 'Mirror Posture Game',
    description: 'Enhances body awareness and motor planning',
    icon: '🪞',
    category: 'motor',
    difficulty: 'beginner',
    estimatedDuration: 12,
    therapeuticBenefits: ['Body awareness', 'Motor planning', 'Coordination']
  },
  {
    id: 'repeat-with-me',
    name: 'Repeat with Me',
    description: 'Improves memory, attention, and following instructions',
    icon: '🔄',
    category: 'memory',
    difficulty: 'intermediate',
    estimatedDuration: 8,
    therapeuticBenefits: ['Memory improvement', 'Attention to detail', 'Following instructions']
  },
  {
    id: 'dance-doodle',
    name: 'Dance Doodle',
    description: 'Combines movement with creativity for motor and cognitive development',
    icon: '💃',
    category: 'motor',
    difficulty: 'advanced',
    estimatedDuration: 20,
    therapeuticBenefits: ['Gross motor skills', 'Creativity', 'Rhythm and timing']
  }
];

// Mock Therapeutic Tasks
export const mockTasks: TherapeuticTask[] = [
  {
    id: '1',
    title: 'Speech & Language Enhancement',
    description: 'Comprehensive speech therapy program for language delay patients',
    therapyGoal: 'Improve speech clarity and expand vocabulary',
    assignedDate: '2024-01-15',
    startDate: '2024-01-16',
    endDate: '2024-02-15',
    status: 'active',
    assignedTo: ['1', '4'],
    games: [
      {
        gameId: 'repeat-with-me',
        gameName: 'Repeat with Me',
        targetScore: 85,
        requiredSessions: 15,
        isCompleted: false,
        currentScore: 72,
        sessionsCompleted: 11,
        lastPlayed: '2024-01-20'
      },
      {
        gameId: 'mirror-posture',
        gameName: 'Mirror Posture Game',
        targetScore: 75,
        requiredSessions: 12,
        isCompleted: false,
        currentScore: 68,
        sessionsCompleted: 9,
        lastPlayed: '2024-01-19'
      },
      {
        gameId: 'dance-doodle',
        gameName: 'Dance Doodle',
        targetScore: 70,
        requiredSessions: 10,
        isCompleted: false,
        currentScore: 58,
        sessionsCompleted: 7,
        lastPlayed: '2024-01-18'
      }
    ],
    totalAssigned: 3,
    completedCount: 0,
    priority: 'high',
    notes: 'Focus on pronunciation and vocabulary building. Patient shows good engagement with audio-based games.',
    createdBy: 'Dr. Ahmed Rahman',
    estimatedDuration: 30
  },
  {
    id: '2',
    title: 'Behavioral Regulation Program',
    description: 'Structured behavioral intervention for emotional regulation',
    therapyGoal: 'Develop self-control and emotional management skills',
    assignedDate: '2024-01-12',
    startDate: '2024-01-13',
    endDate: '2024-02-12',
    status: 'active',
    assignedTo: ['2'],
    games: [
      {
        gameId: 'gaze-tracking',
        gameName: 'Eye Tracking Focus',
        targetScore: 80,
        requiredSessions: 14,
        isCompleted: true,
        currentScore: 82,
        sessionsCompleted: 14,
        lastPlayed: '2024-01-20'
      },
      {
        gameId: 'gesture-control',
        gameName: 'Hand Gesture Recognition',
        targetScore: 75,
        requiredSessions: 12,
        isCompleted: false,
        currentScore: 68,
        sessionsCompleted: 9,
        lastPlayed: '2024-01-19'
      },
      {
        gameId: 'mirror-posture',
        gameName: 'Mirror Posture Game',
        targetScore: 70,
        requiredSessions: 10,
        isCompleted: false,
        currentScore: 55,
        sessionsCompleted: 6,
        lastPlayed: '2024-01-18'
      }
    ],
    totalAssigned: 3,
    completedCount: 1,
    priority: 'high',
    notes: 'Excellent progress in attention control. Continue with impulse control exercises.',
    createdBy: 'Dr. Fatima Begum',
    estimatedDuration: 30
  },
  {
    id: '3',
    title: 'Cognitive Development Training',
    description: 'Memory and problem-solving enhancement program',
    therapyGoal: 'Improve cognitive processing and memory retention',
    assignedDate: '2024-01-08',
    startDate: '2024-01-09',
    endDate: '2024-02-08',
    status: 'active',
    assignedTo: ['3'],
    games: [
      {
        gameId: 'gaze-tracking',
        gameName: 'Eye Tracking Focus',
        targetScore: 75,
        requiredSessions: 16,
        isCompleted: false,
        currentScore: 58,
        sessionsCompleted: 12,
        lastPlayed: '2024-01-20'
      },
      {
        gameId: 'repeat-with-me',
        gameName: 'Repeat with Me',
        targetScore: 70,
        requiredSessions: 12,
        isCompleted: false,
        currentScore: 52,
        sessionsCompleted: 8,
        lastPlayed: '2024-01-19'
      },
      {
        gameId: 'gesture-control',
        gameName: 'Hand Gesture Recognition',
        targetScore: 65,
        requiredSessions: 14,
        isCompleted: false,
        currentScore: 48,
        sessionsCompleted: 7,
        lastPlayed: '2024-01-18'
      },
      {
        gameId: 'dance-doodle',
        gameName: 'Dance Doodle',
        targetScore: 60,
        requiredSessions: 10,
        isCompleted: false,
        currentScore: 42,
        sessionsCompleted: 4,
        lastPlayed: '2024-01-17'
      }
    ],
    totalAssigned: 4,
    completedCount: 0,
    priority: 'high',
    notes: 'Patient requires additional support and patience. Progress is steady but slow.',
    createdBy: 'Dr. Ahmed Rahman',
    estimatedDuration: 30
  },
  {
    id: '4',
    title: 'Learning Foundation Program',
    description: 'Basic learning skills development for young children',
    therapyGoal: 'Build foundational learning and attention skills',
    assignedDate: '2024-01-05',
    startDate: '2024-01-06',
    endDate: '2024-02-05',
    status: 'active',
    assignedTo: ['4'],
    games: [
      {
        gameId: 'dance-doodle',
        gameName: 'Dance Doodle',
        targetScore: 60,
        requiredSessions: 8,
        isCompleted: false,
        currentScore: 45,
        sessionsCompleted: 5,
        lastPlayed: '2024-01-19'
      },
      {
        gameId: 'gaze-tracking',
        gameName: 'Eye Tracking Focus',
        targetScore: 55,
        requiredSessions: 10,
        isCompleted: false,
        currentScore: 38,
        sessionsCompleted: 6,
        lastPlayed: '2024-01-18'
      }
    ],
    totalAssigned: 2,
    completedCount: 0,
    priority: 'high',
    notes: 'Age-appropriate activities showing good engagement. Focus on basic attention skills.',
    createdBy: 'Dr. Fatima Begum',
    estimatedDuration: 20
  },
  {
    id: '5',
    title: 'ADHD Focus Training',
    description: 'Attention and hyperactivity management program',
    therapyGoal: 'Improve sustained attention and reduce impulsivity',
    assignedDate: '2024-01-10',
    startDate: '2024-01-11',
    endDate: '2024-02-10',
    status: 'active',
    assignedTo: ['5', '6'],
    games: [
      {
        gameId: 'gaze-tracking',
        gameName: 'Eye Tracking Focus',
        targetScore: 85,
        requiredSessions: 18,
        isCompleted: false,
        currentScore: 72,
        sessionsCompleted: 13,
        lastPlayed: '2024-01-20'
      },
      {
        gameId: 'gesture-control',
        gameName: 'Hand Gesture Recognition',
        targetScore: 80,
        requiredSessions: 15,
        isCompleted: false,
        currentScore: 68,
        sessionsCompleted: 11,
        lastPlayed: '2024-01-19'
      },
      {
        gameId: 'mirror-posture',
        gameName: 'Mirror Posture Game',
        targetScore: 75,
        requiredSessions: 12,
        isCompleted: false,
        currentScore: 62,
        sessionsCompleted: 8,
        lastPlayed: '2024-01-18'
      },
      {
        gameId: 'repeat-with-me',
        gameName: 'Repeat with Me',
        targetScore: 70,
        requiredSessions: 10,
        isCompleted: false,
        currentScore: 58,
        sessionsCompleted: 7,
        lastPlayed: '2024-01-17'
      }
    ],
    totalAssigned: 4,
    completedCount: 0,
    priority: 'high',
    notes: 'Both patients show improvement in attention span. Continue with structured activities.',
    createdBy: 'Dr. Ahmed Rahman',
    estimatedDuration: 30
  },
  {
    id: '6',
    title: 'Social Skills Development',
    description: 'Interactive social communication training',
    therapyGoal: 'Enhance social interaction and communication skills',
    assignedDate: '2023-12-20',
    startDate: '2023-12-21',
    endDate: '2024-01-20',
    status: 'completed',
    assignedTo: ['2'],
    games: [
      {
        gameId: 'dance-doodle',
        gameName: 'Dance Doodle',
        targetScore: 75,
        requiredSessions: 12,
        isCompleted: true,
        currentScore: 78,
        sessionsCompleted: 12,
        lastPlayed: '2024-01-15'
      },
      {
        gameId: 'mirror-posture',
        gameName: 'Mirror Posture Game',
        targetScore: 70,
        requiredSessions: 10,
        isCompleted: true,
        currentScore: 72,
        sessionsCompleted: 10,
        lastPlayed: '2024-01-14'
      },
      {
        gameId: 'gaze-tracking',
        gameName: 'Eye Tracking Focus',
        targetScore: 80,
        requiredSessions: 14,
        isCompleted: true,
        currentScore: 82,
        sessionsCompleted: 14,
        lastPlayed: '2024-01-13'
      }
    ],
    totalAssigned: 3,
    completedCount: 3,
    priority: 'medium',
    notes: 'Excellent progress in social engagement. Patient ready for advanced social activities.',
    createdBy: 'Dr. Fatima Begum',
    estimatedDuration: 30
  },
  {
    id: '7',
    title: 'Motor Coordination Enhancement',
    description: 'Fine and gross motor skills development program',
    therapyGoal: 'Improve hand-eye coordination and motor control',
    assignedDate: '2024-01-03',
    startDate: '2024-01-04',
    endDate: '2024-02-03',
    status: 'active',
    assignedTo: ['1', '3'],
    games: [
      {
        gameId: 'gesture-control',
        gameName: 'Hand Gesture Recognition',
        targetScore: 90,
        requiredSessions: 20,
        isCompleted: true,
        currentScore: 92,
        sessionsCompleted: 20,
        lastPlayed: '2024-01-20'
      },
      {
        gameId: 'mirror-posture',
        gameName: 'Mirror Posture Game',
        targetScore: 85,
        requiredSessions: 16,
        isCompleted: false,
        currentScore: 78,
        sessionsCompleted: 14,
        lastPlayed: '2024-01-19'
      },
      {
        gameId: 'dance-doodle',
        gameName: 'Dance Doodle',
        targetScore: 80,
        requiredSessions: 14,
        isCompleted: false,
        currentScore: 72,
        sessionsCompleted: 10,
        lastPlayed: '2024-01-18'
      }
    ],
    totalAssigned: 3,
    completedCount: 1,
    priority: 'medium',
    notes: 'Outstanding progress in fine motor skills. Continue with gross motor development.',
    createdBy: 'Dr. Ahmed Rahman',
    estimatedDuration: 30
  }
];

// Mock Progress Data
export const mockProgressData: { [patientId: string]: ProgressData[] } = {
  '1': [
    { date: '2024-01-20', score: 75, gameType: 'Eye Tracking Focus', gameId: 'gaze-tracking', sessionDuration: 12, notes: 'Good focus today' },
    { date: '2024-01-19', score: 70, gameType: 'Repeat with Me', gameId: 'repeat-with-me', sessionDuration: 8, notes: 'Improved attention' },
    { date: '2024-01-18', score: 68, gameType: 'Eye Tracking Focus', gameId: 'gaze-tracking', sessionDuration: 10, notes: 'Some distractions' },
    { date: '2024-01-17', score: 72, gameType: 'Repeat with Me', gameId: 'repeat-with-me', sessionDuration: 9, notes: 'Better performance' },
    { date: '2024-01-16', score: 65, gameType: 'Eye Tracking Focus', gameId: 'gaze-tracking', sessionDuration: 11, notes: 'First session' }
  ],
  '2': [
    { date: '2024-01-19', score: 60, gameType: 'Dance Doodle', gameId: 'dance-doodle', sessionDuration: 18, notes: 'Great social interaction' },
    { date: '2024-01-18', score: 58, gameType: 'Eye Tracking Focus', gameId: 'gaze-tracking', sessionDuration: 9, notes: 'Improved eye contact' },
    { date: '2024-01-17', score: 55, gameType: 'Dance Doodle', gameId: 'dance-doodle', sessionDuration: 16, notes: 'More engaged today' },
    { date: '2024-01-16', score: 52, gameType: 'Eye Tracking Focus', gameId: 'gaze-tracking', sessionDuration: 8, notes: 'Initial assessment' }
  ],
  '3': [
    { date: '2024-01-20', score: 88, gameType: 'Hand Gesture Recognition', gameId: 'gesture-control', sessionDuration: 14, notes: 'Excellent coordination' },
    { date: '2024-01-19', score: 85, gameType: 'Mirror Posture Game', gameId: 'mirror-posture', sessionDuration: 11, notes: 'Great improvement' },
    { date: '2024-01-18', score: 82, gameType: 'Hand Gesture Recognition', gameId: 'gesture-control', sessionDuration: 13, notes: 'Steady progress' },
    { date: '2024-01-17', score: 80, gameType: 'Mirror Posture Game', gameId: 'mirror-posture', sessionDuration: 10, notes: 'Good form' }
  ],
  '4': [
    { date: '2024-01-15', score: 45, gameType: 'Repeat with Me', gameId: 'repeat-with-me', sessionDuration: 7, notes: 'Struggling with focus' },
    { date: '2024-01-14', score: 42, gameType: 'Eye Tracking Focus', gameId: 'gaze-tracking', sessionDuration: 8, notes: 'Needs more practice' },
    { date: '2024-01-13', score: 48, gameType: 'Repeat with Me', gameId: 'repeat-with-me', sessionDuration: 6, notes: 'Slightly better' }
  ],
  '5': [
    { date: '2024-01-20', score: 70, gameType: 'Mirror Posture Game', gameId: 'mirror-posture', sessionDuration: 10, notes: 'Great pronunciation' },
    { date: '2024-01-19', score: 68, gameType: 'Hand Gesture Recognition', gameId: 'gesture-control', sessionDuration: 12, notes: 'Improved clarity' },
    { date: '2024-01-18', score: 65, gameType: 'Mirror Posture Game', gameId: 'mirror-posture', sessionDuration: 9, notes: 'Good effort' }
  ]
};

// Mock Chat Sessions
export const mockChatSessions: ChatSession[] = [
  {
    patientId: '1',
    patientName: 'Emma Thompson',
    parentName: 'Sarah Thompson',
    lastMessage: 'Emma had a great session today!',
    lastMessageTime: new Date('2024-01-20T14:30:00'),
    unreadCount: 2,
    status: 'active',
    lastSeen: new Date('2024-01-20T16:45:00')
  },
  {
    patientId: '2',
    patientName: 'Liam Rodriguez',
    parentName: 'Maria Rodriguez',
    lastMessage: 'Thank you for the progress update',
    lastMessageTime: new Date('2024-01-19T10:15:00'),
    unreadCount: 0,
    status: 'active',
    lastSeen: new Date('2024-01-20T09:30:00')
  },
  {
    patientId: '3',
    patientName: 'Sophia Chen',
    parentName: 'David Chen',
    lastMessage: 'Sophia is excited about the new games',
    lastMessageTime: new Date('2024-01-20T11:20:00'),
    unreadCount: 1,
    status: 'active',
    lastSeen: new Date('2024-01-20T15:20:00')
  },
  {
    patientId: '4',
    patientName: 'Noah Johnson',
    parentName: 'Jennifer Johnson',
    lastMessage: 'We need to reschedule the next session',
    lastMessageTime: new Date('2024-01-15T16:00:00'),
    unreadCount: 0,
    status: 'active',
    lastSeen: new Date('2024-01-16T08:00:00')
  },
  {
    patientId: '5',
    patientName: 'Ava Williams',
    parentName: 'Michael Williams',
    lastMessage: 'Ava practiced her exercises at home',
    lastMessageTime: new Date('2024-01-20T13:45:00'),
    unreadCount: 0,
    status: 'active',
    lastSeen: new Date('2024-01-20T17:00:00')
  }
];

// Mock Chat Messages
export const mockMessages: { [patientId: string]: ChatMessage[] } = {
  '1': [
    {
      id: '1',
      text: 'Hello Dr. Johnson, Emma had a great session today!',
      sender: 'parent',
      timestamp: new Date('2024-01-20T14:30:00'),
      type: 'text',
      isRead: false,
      parentId: '1'
    },
    {
      id: '2',
      text: 'That\'s wonderful to hear! I noticed her attention span has improved significantly.',
      sender: 'doctor',
      timestamp: new Date('2024-01-20T14:35:00'),
      type: 'text',
      isRead: true
    },
    {
      id: '3',
      text: 'She\'s been practicing the breathing exercises you taught her.',
      sender: 'parent',
      timestamp: new Date('2024-01-20T14:40:00'),
      type: 'text',
      isRead: false,
      parentId: '1'
    }
  ],
  '2': [
    {
      id: '4',
      text: 'Thank you for the progress update on Liam',
      sender: 'parent',
      timestamp: new Date('2024-01-19T10:15:00'),
      type: 'text',
      isRead: true,
      parentId: '2'
    },
    {
      id: '5',
      text: 'You\'re welcome! He\'s making excellent progress in social interaction.',
      sender: 'doctor',
      timestamp: new Date('2024-01-19T10:20:00'),
      type: 'text',
      isRead: true
    }
  ],
  '3': [
    {
      id: '6',
      text: 'Sophia is excited about the new games you assigned',
      sender: 'parent',
      timestamp: new Date('2024-01-20T11:20:00'),
      type: 'text',
      isRead: false,
      parentId: '3'
    }
  ],
  '4': [
    {
      id: '7',
      text: 'We need to reschedule the next session. Noah has been feeling unwell.',
      sender: 'parent',
      timestamp: new Date('2024-01-15T16:00:00'),
      type: 'text',
      isRead: true,
      parentId: '4'
    },
    {
      id: '8',
      text: 'No problem, let me know when he\'s feeling better.',
      sender: 'doctor',
      timestamp: new Date('2024-01-15T16:05:00'),
      type: 'text',
      isRead: true
    }
  ],
  '5': [
    {
      id: '9',
      text: 'Ava practiced her exercises at home today',
      sender: 'parent',
      timestamp: new Date('2024-01-20T13:45:00'),
      type: 'text',
      isRead: true,
      parentId: '5'
    },
    {
      id: '10',
      text: 'Excellent! Home practice is so important for her progress.',
      sender: 'doctor',
      timestamp: new Date('2024-01-20T13:50:00'),
      type: 'text',
      isRead: true
    }
  ]
};

// Mock Game Sessions
export const mockGameSessions: GameSession[] = [
  {
    id: '1',
    patientId: '1',
    gameId: 'gaze-tracking',
    gameName: 'Eye Tracking Focus',
    score: 75,
    duration: 12,
    date: '2024-01-20',
    notes: 'Good focus today, minimal distractions',
    difficulty: 'intermediate',
    completed: true
  },
  {
    id: '2',
    patientId: '1',
    gameId: 'repeat-with-me',
    gameName: 'Repeat with Me',
    score: 70,
    duration: 8,
    date: '2024-01-19',
    notes: 'Improved attention to detail',
    difficulty: 'beginner',
    completed: true
  },
  {
    id: '3',
    patientId: '2',
    gameId: 'dance-doodle',
    gameName: 'Dance Doodle',
    score: 60,
    duration: 18,
    date: '2024-01-19',
    notes: 'Great social interaction, more engaged',
    difficulty: 'advanced',
    completed: true
  },
  {
    id: '4',
    patientId: '3',
    gameId: 'gesture-control',
    gameName: 'Hand Gesture Recognition',
    score: 88,
    duration: 14,
    date: '2024-01-20',
    notes: 'Excellent coordination and precision',
    difficulty: 'intermediate',
    completed: true
  },
  {
    id: '5',
    patientId: '5',
    gameId: 'mirror-posture',
    gameName: 'Mirror Posture Game',
    score: 70,
    duration: 10,
    date: '2024-01-20',
    notes: 'Great pronunciation and clarity',
    difficulty: 'beginner',
    completed: true
  }
];

// Mock Therapy Plans
export const mockTherapyPlans: TherapyPlan[] = [
  {
    id: '1',
    patientId: '1',
    title: 'ADHD Attention Training',
    description: 'Comprehensive attention and focus training program',
    goals: ['Improve sustained attention', 'Reduce distractibility', 'Enhance task completion'],
    startDate: '2024-01-15',
    endDate: '2024-04-15',
    status: 'active',
    sessionsPerWeek: 3,
    totalSessions: 36,
    completedSessions: 12,
    progress: 33,
    notes: 'Patient responding well to visual cues and positive reinforcement'
  },
  {
    id: '2',
    patientId: '2',
    title: 'ASD Social Skills Development',
    description: 'Structured social interaction and communication training',
    goals: ['Improve social interaction', 'Enhance communication', 'Develop eye contact'],
    startDate: '2024-01-10',
    endDate: '2024-04-10',
    status: 'active',
    sessionsPerWeek: 2,
    totalSessions: 24,
    completedSessions: 8,
    progress: 33,
    notes: 'Excellent progress in social engagement activities'
  },
  {
    id: '3',
    patientId: '3',
    title: 'Motor Coordination Enhancement',
    description: 'Progressive motor skill development program',
    goals: ['Improve fine motor skills', 'Enhance gross motor coordination', 'Build confidence'],
    startDate: '2024-01-05',
    endDate: '2024-04-05',
    status: 'active',
    sessionsPerWeek: 2,
    totalSessions: 24,
    completedSessions: 10,
    progress: 42,
    notes: 'Outstanding progress, ready for advanced challenges'
  }
];

// Utility functions for mock data
export const getPatientById = (id: string): Patient | undefined => {
  return mockPatients.find(patient => patient.id === id);
};

export const getPatientsByStatus = (status: Patient['status']): Patient[] => {
  return mockPatients.filter(patient => patient.status === status);
};

export const getTasksByStatus = (status: TherapeuticTask['status']): TherapeuticTask[] => {
  return mockTasks.filter(task => task.status === status);
};

export const getTasksByPatient = (patientId: string): TherapeuticTask[] => {
  return mockTasks.filter(task => task.assignedTo.includes(patientId));
};

export const getProgressByPatient = (patientId: string): ProgressData[] => {
  return mockProgressData[patientId] || [];
};

export const getChatSessionByPatient = (patientId: string): ChatSession | undefined => {
  return mockChatSessions.find(session => session.patientId === patientId);
};

export const getMessagesByPatient = (patientId: string): ChatMessage[] => {
  return mockMessages[patientId] || [];
};

export const getGameSessionsByPatient = (patientId: string): GameSession[] => {
  return mockGameSessions.filter(session => session.patientId === patientId);
};

export const getTherapyPlanByPatient = (patientId: string): TherapyPlan | undefined => {
  return mockTherapyPlans.find(plan => plan.patientId === patientId);
};

// Statistics calculations
export const getDashboardStats = () => {
  const activePatients = getPatientsByStatus('active').length;
  const totalTasks = mockTasks.length;
  const activeTasks = getTasksByStatus('active').length;
  const completedTasks = getTasksByStatus('completed').length;
  const totalSessions = mockGameSessions.length;
  const averageProgress = mockPatients.reduce((sum, patient) => sum + patient.overallProgress, 0) / mockPatients.length;

  return {
    totalPatients: mockPatients.length,
    activePatients,
    totalTasks,
    activeTasks,
    completedTasks,
    totalSessions,
    averageProgress: Math.round(averageProgress)
  };
};
