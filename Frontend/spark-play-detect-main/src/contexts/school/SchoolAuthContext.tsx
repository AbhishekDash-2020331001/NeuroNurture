import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface School {
  id: string;
  name: string;
  email: string;
  address: string;
  phone: string;
  subscriptionStatus: 'active' | 'expired' | 'pending';
  subscriptionPlan: 'free' | 'premium';
  subscriptionExpiry?: string;
  childrenLimit: number;
  currentChildren: number;
}

interface SchoolAuthContextType {
  school: School | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  clearAuthData: () => void;
  updateSchoolData: (data: Partial<School>) => void;
}

const SchoolAuthContext = createContext<SchoolAuthContextType | undefined>(undefined);

export const useSchoolAuth = () => {
  const context = useContext(SchoolAuthContext);
  if (context === undefined) {
    throw new Error('useSchoolAuth must be used within a SchoolAuthProvider');
  }
  return context;
};

interface SchoolAuthProviderProps {
  children: ReactNode;
}

export const SchoolAuthProvider: React.FC<SchoolAuthProviderProps> = ({ children }) => {
  const [school, setSchool] = useState<School | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing school session in localStorage
    const savedSchool = localStorage.getItem('schoolAuth');
    if (savedSchool) {
      try {
        const schoolData = JSON.parse(savedSchool);
        // Ensure new fields are present for backward compatibility
        const updatedSchoolData = {
          ...schoolData,
          subscriptionPlan: schoolData.subscriptionPlan || 'premium',
          subscriptionExpiry: schoolData.subscriptionExpiry || '2024-12-31'
        };
        setSchool(updatedSchoolData);
        // Update localStorage with the new fields
        localStorage.setItem('schoolAuth', JSON.stringify(updatedSchoolData));
      } catch (error) {
        console.error('Error parsing saved school data:', error);
        localStorage.removeItem('schoolAuth');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Mock authentication - replace with actual API call later
      if (email === 'school@demo.com' && password === 'school123') {
        const mockSchool: School = {
          id: 'school1',
          name: 'Demo Elementary School',
          email: 'school@demo.com',
          address: '123 Education Street, Learning City',
          phone: '+1-555-0123',
          subscriptionStatus: 'active',
          subscriptionPlan: 'premium',
          subscriptionExpiry: '2024-12-31',
          childrenLimit: 50,
          currentChildren: 25
        };
        
        setSchool(mockSchool);
        localStorage.setItem('schoolAuth', JSON.stringify(mockSchool));
        setIsLoading(false);
        return true;
      } else {
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
    setSchool(null);
    localStorage.removeItem('schoolAuth');
  };

  const clearAuthData = () => {
    setSchool(null);
    localStorage.removeItem('schoolAuth');
  };

  const updateSchoolData = (data: Partial<School>) => {
    if (school) {
      const updatedSchool = { ...school, ...data };
      setSchool(updatedSchool);
      localStorage.setItem('schoolAuth', JSON.stringify(updatedSchool));
    }
  };

  const value: SchoolAuthContextType = {
    school,
    isAuthenticated: !!school,
    isLoading,
    login,
    logout,
    clearAuthData,
    updateSchoolData
  };

  return (
    <SchoolAuthContext.Provider value={value}>
      {children}
    </SchoolAuthContext.Provider>
  );
};
