import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface Child {
  id: number;
  name: string;
  gender: "boy" | "girl" | "other";
  dateOfBirth: string;
  height: number;
  weight: number;
  parentId: number;
}

interface Parent {
  id: number;
  name: string;
  email: string;
  address: string;
  numberOfChildren: number;
  suspectedAutisticChildCount: number;
}

interface ChildContextType {
  currentChild: Child | null;
  currentParent: Parent | null;
  setCurrentChild: (child: Child | null) => void;
  setCurrentParent: (parent: Parent | null) => void;
  clearCurrentChild: () => void;
  clearCurrentParent: () => void;
  isChildSelected: boolean;
}

const ChildContext = createContext<ChildContextType | undefined>(undefined);

export const useChildContext = () => {
  const context = useContext(ChildContext);
  if (context === undefined) {
    throw new Error('useChildContext must be used within a ChildProvider');
  }
  return context;
};

interface ChildProviderProps {
  children: ReactNode;
}

export const ChildProvider: React.FC<ChildProviderProps> = ({ children }) => {
  const [currentChild, setCurrentChild] = useState<Child | null>(null);
  const [currentParent, setCurrentParent] = useState<Parent | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const storedChild = localStorage.getItem("selectedChild");
    const storedParentId = localStorage.getItem("currentParentId");
    
    if (storedChild) {
      try {
        const childData = JSON.parse(storedChild);
        setCurrentChild(childData);
      } catch (error) {
        console.error('Error parsing stored child data:', error);
        localStorage.removeItem("selectedChild");
      }
    }

    if (storedParentId) {
      // Load parent data from API
      loadParentData(parseInt(storedParentId));
    }
  }, []);

  const loadParentData = async (parentId: number) => {
    try {
      const response = await fetch(`http://localhost:8082/api/parents/${parentId}`, {
        credentials: 'include'
      });
      if (response.ok) {
        const parentData = await response.json();
        setCurrentParent(parentData);
      }
    } catch (error) {
      console.error('Error loading parent data:', error);
    }
  };

  const clearCurrentChild = () => {
    setCurrentChild(null);
    localStorage.removeItem("selectedChild");
  };

  const clearCurrentParent = () => {
    setCurrentParent(null);
    localStorage.removeItem("currentParentId");
  };

  const value: ChildContextType = {
    currentChild,
    currentParent,
    setCurrentChild,
    setCurrentParent,
    clearCurrentChild,
    clearCurrentParent,
    isChildSelected: currentChild !== null
  };

  return (
    <ChildContext.Provider value={value}>
      {children}
    </ChildContext.Provider>
  );
}; 