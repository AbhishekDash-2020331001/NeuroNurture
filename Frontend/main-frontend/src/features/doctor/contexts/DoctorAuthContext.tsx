import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface Doctor {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  specialization: string;
  licenseNumber: string;
  hospital: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  yearsOfExperience: number;
  subscriptionStatus: 'pending' | 'active' | 'expired';
  subscriptionExpiry?: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  patientLimit: number;
  currentPatients: number;
  // Computed properties
  name?: string;
  maxChildren?: number;
  currentChildrenCount?: number;
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


export const DoctorAuthProvider: React.FC<DoctorAuthProviderProps> = ({ children }) => {
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<AuthError | null>(null);

  // Initialize auth state from localStorage
  useEffect(() => {
    // Check for existing doctor session in localStorage
    const savedDoctor = localStorage.getItem('doctorAuth');
    const savedToken = localStorage.getItem('doctorToken');
    console.log('DoctorAuthContext: Checking saved data...');
    console.log('Saved doctor:', savedDoctor);
    console.log('Saved token:', savedToken);

    if (savedDoctor) {
      try {
        const doctorData = JSON.parse(savedDoctor);
        setDoctor(doctorData);
        console.log('DoctorAuthContext: Doctor data loaded successfully');
      } catch (error) {
        console.error('Error parsing saved doctor data:', error);
        localStorage.removeItem('doctorAuth');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:8093/api/doctor/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('DoctorAuthContext login response:', data);
        console.log('JWT Token received:', data.token);

        // Store token and doctor data
        localStorage.setItem('doctorToken', data.token);
        localStorage.setItem('doctorEmail', credentials.email);

        const doctorData: Doctor = {
          id: data.doctor.id.toString(),
          username: data.doctor.username,
          email: data.doctor.email,
          firstName: data.doctor.firstName,
          lastName: data.doctor.lastName,
          phone: data.doctor.phone,
          specialization: data.doctor.specialization,
          licenseNumber: data.doctor.licenseNumber,
          hospital: data.doctor.hospital,
          address: data.doctor.address,
          city: data.doctor.city,
          state: data.doctor.state,
          zipCode: data.doctor.zipCode,
          yearsOfExperience: data.doctor.yearsOfExperience,
          subscriptionStatus: data.doctor.subscriptionStatus,
          subscriptionExpiry: data.doctor.subscriptionExpiry,
          stripeCustomerId: data.doctor.stripeCustomerId,
          stripeSubscriptionId: data.doctor.stripeSubscriptionId,
          patientLimit: data.doctor.patientLimit,
          currentPatients: data.doctor.currentPatients,
          // Computed properties
          name: `Dr. ${data.doctor.firstName} ${data.doctor.lastName}`,
          maxChildren: data.doctor.patientLimit,
          currentChildrenCount: data.doctor.currentPatients,
          rating: 4.8, // Default rating
          joinDate: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.doctor.firstName + ' ' + data.doctor.lastName)}&background=random`,
          preferences: {
            theme: 'light',
            notifications: true,
            language: 'en'
          }
        };

        setDoctor(doctorData);
        localStorage.setItem('doctorAuth', JSON.stringify(doctorData));
        setIsLoading(false);
        return true;
      } else {
        const errorText = await response.text();
        console.error('Login failed:', errorText);
        setIsLoading(false);
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    setDoctor(null);
    localStorage.removeItem('doctorAuth');
    localStorage.removeItem('doctorToken');
    localStorage.removeItem('doctorEmail');
  };

  const updateDoctor = (updates: Partial<Doctor>) => {
    if (doctor) {
      const updatedDoctor = { ...doctor, ...updates };
      setDoctor(updatedDoctor);
      localStorage.setItem('doctorAuth', JSON.stringify(updatedDoctor));
    }
  };


  const clearError = () => {
    setError(null);
  };

  const hasPermission = (permission: string): boolean => {
    if (!doctor) return false;

    // Check if subscription is active based on expiry date
    const isSubscriptionActive = () => {
      if (!doctor.subscriptionExpiry) return false;
      return new Date(doctor.subscriptionExpiry) > new Date();
    };

    // Define permission logic based on subscription and role
    const permissions = {
      'view_patients': true,
      'add_patients': isSubscriptionActive() || doctor.currentChildrenCount < doctor.maxChildren,
      'create_tasks': true,
      'view_analytics': isSubscriptionActive(),
      'export_data': isSubscriptionActive(),
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

    // Check if subscription is active based on expiry date
    const isSubscriptionActive = () => {
      if (!doctor.subscriptionExpiry) return false;
      return new Date(doctor.subscriptionExpiry) > new Date();
    };

    return {
      status: isSubscriptionActive() ? 'paid' as const : 'free' as const,
      maxPatients: doctor.maxChildren,
      currentPatients: doctor.currentChildrenCount,
      remainingSlots: doctor.maxChildren - doctor.currentChildrenCount,
      isAtLimit: doctor.currentChildrenCount >= doctor.maxChildren
    };
  };

  const value: DoctorAuthContextType = {
    doctor,
    isAuthenticated: !!doctor,
    isLoading,
    error,
    login,
    logout,
    updateDoctor,
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