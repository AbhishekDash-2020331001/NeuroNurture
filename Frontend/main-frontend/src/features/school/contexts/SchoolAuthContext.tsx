import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

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
  testJwtAuth: () => Promise<boolean>;
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
    const savedToken = localStorage.getItem('schoolToken');
    console.log('SchoolAuthContext: Checking saved data...');
    console.log('Saved school:', savedSchool);
    console.log('Saved token:', savedToken);
    
    if (savedSchool) {
      try {
        const schoolData = JSON.parse(savedSchool);
        // Ensure new fields are present for backward compatibility
        const updatedSchoolData = {
          ...schoolData,
          subscriptionPlan: schoolData.subscriptionPlan || 'free',
          subscriptionExpiry: schoolData.subscriptionExpiry
        };
        setSchool(updatedSchoolData);
        // Update localStorage with the new fields
        localStorage.setItem('schoolAuth', JSON.stringify(updatedSchoolData));
        console.log('SchoolAuthContext: School data loaded successfully');
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
      const response = await fetch('http://localhost:8091/api/school/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('SchoolAuthContext login response:', data);
        console.log('JWT Token received:', data.token);
        
        // Store token and school data
        localStorage.setItem('schoolToken', data.token);
        localStorage.setItem('schoolEmail', email);
        
        const schoolData: School = {
          id: data.school.id.toString(),
          name: data.school.schoolName,
          email: data.school.email,
          address: `${data.school.address}, ${data.school.city}, ${data.school.state} ${data.school.zipCode}`,
          phone: data.school.phone,
          subscriptionStatus: data.school.subscriptionStatus,
          subscriptionPlan: data.school.subscriptionPlan || 'free',
          subscriptionExpiry: data.school.subscriptionExpiry,
          childrenLimit: data.school.childrenLimit,
          currentChildren: data.school.currentChildren
        };
        
        console.log('SchoolAuthContext: Full login response:', data);
        console.log('SchoolAuthContext: School object from backend:', data.school);
        console.log('SchoolAuthContext: Backend subscriptionStatus:', data.school.subscriptionStatus);
        console.log('SchoolAuthContext: Backend subscriptionPlan:', data.school.subscriptionPlan);
        console.log('SchoolAuthContext: Backend subscriptionExpiry:', data.school.subscriptionExpiry);
        console.log('SchoolAuthContext: Parsed school data:', schoolData);
        console.log('SchoolAuthContext: Parsed subscriptionExpiry:', schoolData.subscriptionExpiry);
        console.log('SchoolAuthContext: Parsed subscriptionPlan:', schoolData.subscriptionPlan);
        
        setSchool(schoolData);
        localStorage.setItem('schoolAuth', JSON.stringify(schoolData));
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
    setSchool(null);
    localStorage.removeItem('schoolAuth');
    localStorage.removeItem('schoolToken');
    localStorage.removeItem('schoolEmail');
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

  // Test JWT authentication
  const testJwtAuth = async (): Promise<boolean> => {
    const token = localStorage.getItem('schoolToken');
    if (!token) {
      console.log('No JWT token found');
      return false;
    }

    try {
      const response = await fetch('http://localhost:8091/api/school/tasks/school/1', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      console.log('JWT test response status:', response.status);
      return response.ok;
    } catch (error) {
      console.error('JWT test error:', error);
      return false;
    }
  };

  const value: SchoolAuthContextType = {
    school,
    isAuthenticated: !!school,
    isLoading,
    login,
    logout,
    clearAuthData,
    updateSchoolData,
    testJwtAuth
  };

  return (
    <SchoolAuthContext.Provider value={value}>
      {children}
    </SchoolAuthContext.Provider>
  );
};
