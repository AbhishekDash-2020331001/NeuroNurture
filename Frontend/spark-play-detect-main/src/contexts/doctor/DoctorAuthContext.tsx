import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Doctor {
  id: string;
  name: string;
  email: string;
  specialization: string;
  licenseNumber: string;
  subscriptionStatus: 'free' | 'paid';
  maxChildren: number;
  currentChildrenCount: number;
  phone?: string;
  address?: string;
  experience?: number;
  rating?: number;
  joinDate?: string;
  avatar?: string;
  lastLogin?: string;
  preferences?: {
    theme?: 'light' | 'dark';
    notifications?: boolean;
    language?: string;
  };
}

interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

interface AuthError {
  message: string;
  code?: string;
  field?: string;
}

interface DoctorAuthContextType {
  doctor: Doctor | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: AuthError | null;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => void;
  updateDoctor: (updates: Partial<Doctor>) => void;
  refreshAuth: () => Promise<void>;
  clearError: () => void;
  hasPermission: (permission: string) => boolean;
  canAddPatient: () => boolean;
  getSubscriptionInfo: () => {
    status: 'free' | 'paid';
    maxPatients: number;
    currentPatients: number;
    remainingSlots: number;
    isAtLimit: boolean;
  };
}

const DoctorAuthContext = createContext<DoctorAuthContextType | undefined>(undefined);

export const useDoctorAuth = () => {
  const context = useContext(DoctorAuthContext);
  if (!context) {
    throw new Error('useDoctorAuth must be used within a DoctorAuthProvider');
  }
  return context;
};

interface DoctorAuthProviderProps {
  children: ReactNode;
}

// Mock authentication service (replace with real API calls)
const mockAuthService = {
  async login(credentials: LoginCredentials): Promise<Doctor> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock validation - accept multiple demo credentials
    const validCredentials = [
      { email: 'doctor@example.com', password: 'password' },
      { email: 'doctor@clinic.com', password: 'doctor123' },
      { email: 'dr.smith@hospital.com', password: 'medical123' },
      { email: 'test@doctor.com', password: 'test123' }
    ];
    
    const isValid = validCredentials.some(
      cred => cred.email === credentials.email && cred.password === credentials.password
    );
    
    if (isValid) {
      return {
        id: '1',
        name: 'Dr. Sarah Johnson',
        email: credentials.email,
        specialization: 'Pediatric Neurology',
        licenseNumber: 'MD123456',
        subscriptionStatus: 'free',
        maxChildren: 3,
        currentChildrenCount: 2,
        phone: '+1 (555) 123-4567',
        address: '123 Medical Center Dr, Health City, HC 12345',
        experience: 8,
        rating: 4.8,
        joinDate: '2023-01-15',
        lastLogin: new Date().toISOString(),
        preferences: {
          theme: 'light',
          notifications: true,
          language: 'en'
        }
      };
    } else {
      throw new Error('Invalid email or password');
    }
  },

  async refreshToken(): Promise<Doctor> {
    // Simulate token refresh
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const storedDoctor = localStorage.getItem('doctor');
    if (storedDoctor) {
      return JSON.parse(storedDoctor);
    }
    throw new Error('No valid session found');
  },

  async updateProfile(updates: Partial<Doctor>): Promise<Doctor> {
    // Simulate profile update
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const storedDoctor = localStorage.getItem('doctor');
    if (storedDoctor) {
      const currentDoctor = JSON.parse(storedDoctor);
      const updatedDoctor = { ...currentDoctor, ...updates };
      localStorage.setItem('doctor', JSON.stringify(updatedDoctor));
      return updatedDoctor;
    }
    throw new Error('No doctor session found');
  }
};

export const DoctorAuthProvider: React.FC<DoctorAuthProviderProps> = ({ children }) => {
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<AuthError | null>(null);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedDoctor = localStorage.getItem('doctor');
        const storedAuth = localStorage.getItem('doctor_auth');
        
        if (storedDoctor && storedAuth) {
          const doctorData = JSON.parse(storedDoctor);
          const authData = JSON.parse(storedAuth);
          
          // Check if session is still valid (not expired)
          if (authData.expiresAt && new Date(authData.expiresAt) > new Date()) {
            setDoctor(doctorData);
            setIsAuthenticated(true);
            
            // Try to refresh token in background
            try {
              const refreshedDoctor = await mockAuthService.refreshToken();
              setDoctor(refreshedDoctor);
              localStorage.setItem('doctor', JSON.stringify(refreshedDoctor));
            } catch (refreshError) {
              console.warn('Token refresh failed:', refreshError);
              // Continue with existing session
            }
          } else {
            // Session expired, clear storage
            localStorage.removeItem('doctor');
            localStorage.removeItem('doctor_auth');
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // Clear corrupted data
        localStorage.removeItem('doctor');
        localStorage.removeItem('doctor_auth');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const doctorData = await mockAuthService.login(credentials);
      
      // Set expiration time (24 hours from now)
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);
      
      // Store in localStorage
      localStorage.setItem('doctor', JSON.stringify(doctorData));
      localStorage.setItem('doctor_auth', JSON.stringify({
        isAuthenticated: true,
        expiresAt: expiresAt.toISOString(),
        rememberMe: credentials.rememberMe || false
      }));
      
      setDoctor(doctorData);
      setIsAuthenticated(true);
      
      return true; // Success
    } catch (error) {
      const authError: AuthError = {
        message: error instanceof Error ? error.message : 'Login failed',
        code: 'LOGIN_FAILED'
      };
      setError(authError);
      return false; // Failed
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    // Clear localStorage
    localStorage.removeItem('doctor');
    localStorage.removeItem('doctor_auth');
    
    // Clear state
    setDoctor(null);
    setIsAuthenticated(false);
    setError(null);
    
    // Navigation will be handled by the component using the context
  };

  const updateDoctor = async (updates: Partial<Doctor>) => {
    if (!doctor) return;

    try {
      const updatedDoctor = await mockAuthService.updateProfile(updates);
      setDoctor(updatedDoctor);
    } catch (error) {
      const authError: AuthError = {
        message: error instanceof Error ? error.message : 'Update failed',
        code: 'UPDATE_FAILED'
      };
      setError(authError);
      throw authError;
    }
  };

  const refreshAuth = async () => {
    if (!isAuthenticated) return;

    try {
      const refreshedDoctor = await mockAuthService.refreshToken();
      setDoctor(refreshedDoctor);
      localStorage.setItem('doctor', JSON.stringify(refreshedDoctor));
    } catch (error) {
      console.error('Auth refresh failed:', error);
      logout(); // Force logout if refresh fails
    }
  };

  const clearError = () => {
    setError(null);
  };

  const hasPermission = (permission: string): boolean => {
    if (!doctor) return false;
    
    // Define permission logic based on subscription and role
    const permissions = {
      'view_patients': true,
      'add_patients': doctor.subscriptionStatus === 'paid' || doctor.currentChildrenCount < doctor.maxChildren,
      'create_tasks': true,
      'view_analytics': doctor.subscriptionStatus === 'paid',
      'export_data': doctor.subscriptionStatus === 'paid',
      'manage_subscription': true
    };
    
    return permissions[permission as keyof typeof permissions] || false;
  };

  const canAddPatient = (): boolean => {
    if (!doctor) return false;
    return doctor.currentChildrenCount < doctor.maxChildren;
  };

  const getSubscriptionInfo = () => {
    if (!doctor) {
      return {
        status: 'free' as const,
        maxPatients: 0,
        currentPatients: 0,
        remainingSlots: 0,
        isAtLimit: true
      };
    }

    return {
      status: doctor.subscriptionStatus,
      maxPatients: doctor.maxChildren,
      currentPatients: doctor.currentChildrenCount,
      remainingSlots: doctor.maxChildren - doctor.currentChildrenCount,
      isAtLimit: doctor.currentChildrenCount >= doctor.maxChildren
    };
  };

  const value: DoctorAuthContextType = {
    doctor,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    updateDoctor,
    refreshAuth,
    clearError,
    hasPermission,
    canAddPatient,
    getSubscriptionInfo
  };

  return (
    <DoctorAuthContext.Provider value={value}>
      {children}
    </DoctorAuthContext.Provider>
  );
};
