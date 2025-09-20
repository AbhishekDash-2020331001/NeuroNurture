// API Configuration
export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

// User Status
export const USER_STATUS = {
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  PENDING: 'pending',
} as const;

// Ticket Status
export const TICKET_STATUS = {
  OPEN: 'OPEN',
  IN_PROGRESS: 'IN_PROGRESS',
  RESOLVED: 'RESOLVED',
  CLOSED: 'CLOSED',
} as const;

// Ticket Priority
export const TICKET_PRIORITY = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  URGENT: 'URGENT',
} as const;

// Subscription Status
export const SUBSCRIPTION_STATUS = {
  ACTIVE: 'active',
  EXPIRED: 'expired',
  CANCELLED: 'cancelled',
  PENDING: 'pending',
} as const;

// Subscription Plans
export const SUBSCRIPTION_PLANS = {
  BASIC: 'basic',
  PREMIUM: 'premium',
  ENTERPRISE: 'enterprise',
} as const;

// User Types
export const USER_TYPES = {
  PARENT: 'parent',
  SCHOOL: 'school',
  DOCTOR: 'doctor',
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [5, 10, 20, 50],
} as const;

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM dd, yyyy',
  API: 'yyyy-MM-dd',
  DATETIME: 'MMM dd, yyyy HH:mm',
} as const;

// Colors for different user types
export const USER_TYPE_COLORS = {
  parent: 'bg-gradient-to-br from-blue-500 to-blue-600',
  school: 'bg-gradient-to-br from-green-500 to-green-600',
  doctor: 'bg-gradient-to-br from-purple-500 to-purple-600',
} as const;

// Status colors
export const STATUS_COLORS = {
  active: 'text-green-700 bg-green-100 border border-green-200',
  suspended: 'text-red-700 bg-red-100 border border-red-200',
  pending: 'text-amber-700 bg-amber-100 border border-amber-200',
} as const;
