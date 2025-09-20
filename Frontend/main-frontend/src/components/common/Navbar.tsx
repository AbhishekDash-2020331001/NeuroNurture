import { getCurrentChild } from "@/shared/utils/childUtils";
import { Brain } from "lucide-react";
import { useEffect, useState } from "react";
import UserMenu from "./UserMenu";

interface NavbarProps {
  onLogout?: () => void;
  showLogout?: boolean;
}

const Navbar = ({ onLogout, showLogout = true }: NavbarProps) => {
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

  return (
    <nav className="bg-gradient-to-r from-primary via-fun-purple to-fun-pink shadow-lg border-b-2 border-primary/20 relative z-[9999]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Tagline */}
          <button 
            className="flex items-center space-x-3 cursor-pointer group relative z-10 bg-transparent border-none outline-none"
            onClick={handleHomeClick}
            style={{ pointerEvents: 'auto' }}
          >
            <div className="flex items-center space-x-2">
              <Brain className="w-8 h-8 text-white group-hover:scale-110 transition-transform duration-300" />
              <div className="flex flex-col items-start text-left">
                <h1 className="text-xl font-comic font-bold text-white group-hover:text-yellow-200 transition-colors duration-300">
                  NeuroNurture
                </h1>
                <p className="text-xs text-white/80 font-nunito italic group-hover:text-white transition-colors duration-300">
                  Nurturing Brains, Brightening Futures
                </p>
              </div>
            </div>
          </button>

          {/* Right side - User Menu */}
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

export default Navbar; 