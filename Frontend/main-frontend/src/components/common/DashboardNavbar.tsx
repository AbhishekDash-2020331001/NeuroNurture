import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getCurrentChild } from "@/shared/utils/childUtils";
import { Brain } from "lucide-react";
import { useEffect, useState } from "react";
import UserMenu from "./UserMenu";

interface DashboardNavbarProps {
  onLogout?: () => void;
  showLogout?: boolean;
  activeTab: 'playground' | 'school' | 'doctor';
  onTabChange: (tab: 'playground' | 'school' | 'doctor') => void;
}

const DashboardNavbar = ({ onLogout, showLogout = true, activeTab, onTabChange }: DashboardNavbarProps) => {
  const [username, setUsername] = useState<string | null>(null);
  const [selectedChild, setSelectedChild] = useState<any>(null);

  useEffect(() => {
    // Get username
    fetch('http://localhost:8080/auth/me', { credentials: 'include' })
      .then(res => res.text())
      .then(name => setUsername(name))
      .catch(err => console.error('Failed to get username:', err));
    
    // Get selected child data
    const childData = getCurrentChild();
    setSelectedChild(childData);
  }, []);

  // Listen for localStorage changes to update selected child
  useEffect(() => {
    const handleStorageChange = () => {
      const childData = getCurrentChild();
      setSelectedChild(childData);
    };

    // Listen for storage events (when localStorage changes in other tabs)
    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom events (when localStorage changes in same tab)
    window.addEventListener('childSelectionChanged', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('childSelectionChanged', handleStorageChange);
    };
  }, []);

  const handleHomeClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Navbar home clicked');
    
    try {
      // Check if user is authenticated
      const sessionResponse = await fetch('http://localhost:8080/auth/session', { 
        credentials: 'include' 
      });
      const isAuthenticated = await sessionResponse.json();
      
      if (!isAuthenticated) {
        // Not authenticated - redirect to landing page
        console.log('User not authenticated, redirecting to landing page');
        window.location.href = '/';
        return;
      }
      
      // User is authenticated - check if child is selected
      if (selectedChild) {
        // Child is selected - redirect to dashboard
        console.log('Child selected, redirecting to dashboard');
        window.location.href = '/dashboard';
      } else {
        // No child selected - redirect to children profile selection
        console.log('No child selected, redirecting to children profiles');
        window.location.href = '/children';
      }
    } catch (error) {
      console.error('Error checking authentication status:', error);
      // On error, redirect to landing page as fallback
      window.location.href = '/';
    }
  };

  const tabs = [
    {
      id: 'playground' as const,
      label: 'Playground',
      icon: '🎮',
      description: 'Games & Learning'
    },
    {
      id: 'school' as const,
      label: 'School',
      icon: '🏫',
      description: 'Academic'
    },
    {
      id: 'doctor' as const,
      label: 'Doctor',
      icon: '👩‍⚕️',
      description: 'Health'
    }
  ];

  return (
    <nav className="bg-gradient-to-r from-primary via-fun-purple to-fun-pink shadow-lg border-b border-primary/20 fixed top-0 left-0 right-0 z-[9999]">
      <div className="max-w-7xl mx-auto px-1 sm:px-2 lg:px-3">
        {/* Single Row Layout */}
        <div className="flex items-center justify-between h-16">
          {/* Left - Logo and Tagline */}
          <button 
            className="flex items-center space-x-3 cursor-pointer group bg-transparent border-none outline-none"
            onClick={handleHomeClick}
          >
            <div className="flex items-center space-x-2">
              <Brain className="w-8 h-8 text-white group-hover:scale-105 transition-transform duration-200" />
              <div className="flex flex-col items-start text-left">
                <h1 className="text-xl font-bold text-white group-hover:text-yellow-200 transition-colors duration-200">
                  NeuroNurture
                </h1>
                <p className="text-xs text-white/80 italic group-hover:text-white transition-colors duration-200 hidden lg:block">
                  Nurturing Brains, Brightening Futures
                </p>
              </div>
            </div>
          </button>

          {/* Center - Tab Navigation */}
          <div className="flex-1 flex justify-center px-1 sm:px-2">
            <div className="flex space-x-1 max-w-md w-full">
              {tabs.map((tab) => (
                <Button
                  key={tab.id}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "flex-1 h-10 px-3 sm:px-4 flex items-center justify-center space-x-2 text-white transition-all duration-300 rounded-lg relative group",
                    activeTab === tab.id
                      ? "bg-white/20 font-semibold shadow-md"
                      : "hover:bg-white/10"
                  )}
                  onClick={() => onTabChange(tab.id)}
                >
                  <span className="text-base sm:text-lg group-hover:scale-110 transition-transform duration-300">
                    {tab.icon}
                  </span>
                  <div className="flex flex-col items-center min-w-0">
                    <span className="text-xs sm:text-sm font-comic leading-none truncate">{tab.label}</span>
                    {/* <span className="text-xs opacity-80 leading-none hidden sm:block truncate">{tab.description}</span> */}
                  </div>
                </Button>
              ))}
            </div>
          </div>

          {/* Right - User Menu */}
          <UserMenu 
            onLogout={onLogout} 
            showLogout={showLogout}
            username={username}
            selectedChild={selectedChild}
          />
        </div>
      </div>
    </nav>
  );
};

export default DashboardNavbar;
