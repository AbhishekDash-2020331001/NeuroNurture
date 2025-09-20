// Admin types
export interface Admin {
  id: string;
  email: string;
  name: string;
  role: 'admin';
}

// User types
export interface User {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'suspended' | 'pending';
  children?: Child[];
  type: 'parent' | 'school' | 'doctor';
  // Additional parent details
  address?: string;
  numberOfChildren?: number;
  suspectedAutisticChildCount?: number;
  // School specific fields
  schoolName?: string;
  contactPerson?: string;
  phone?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  studentCount?: number;
  childrenLimit?: number;
  currentChildren?: number;
  // Doctor specific fields
  firstName?: string;
  lastName?: string;
  specialization?: string;
  licenseNumber?: string;
  hospital?: string;
  yearsOfExperience?: number;
  patientLimit?: number;
  currentPatients?: number;
}

export interface Child {
  id: string;
  name: string;
  dateOfBirth?: string;
  age?: number;
  gender: string;
  height: number;
  weight: number;
}

// Ticket types
export interface Ticket {
  id: string;
  parentId: number;
  adminId?: number;
  subject: string;
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  messages: Message[];
}

export interface Message {
  id: string;
  ticketId: string;
  senderId: number;
  senderType: 'parent' | 'admin';
  content: string;
  timestamp: string;
  isRead: boolean;
}

// Subscription types
export interface Subscription {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  type: 'school' | 'doctor';
  plan: 'basic' | 'premium' | 'enterprise';
  status: 'active' | 'expired' | 'cancelled' | 'pending';
  startDate: string;
  endDate: string;
  amount: number;
  currency: string;
  childrenLimit: number;
  currentChildren: number;
  features: string[];
  paymentMethod: string;
  nextBillingDate?: string;
  autoRenew: boolean;
  createdAt: string;
  updatedAt: string;
}

// Pending Request types
export interface PendingRequest {
  id: number;
  schoolName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  studentCount: number;
  emailVerified: boolean;
  isVerified: boolean;
  assignedAdminId: number | null;
  subscriptionStatus: string;
  childrenLimit: number;
  currentChildren: number;
  createdAt: string;
  updatedAt: string;
}

// Assistant types
export interface Chat {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  unreadCount: number;
  isActive: boolean;
}

export interface AssistantMessage {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  isTyping?: boolean;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}
