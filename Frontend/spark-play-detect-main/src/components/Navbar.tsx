import { getCurrentChild } from "@/utils/childUtils";
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
    if (childData) {
      setSelectedChild(childData);
    }
  }, []);

  const handleHomeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Navbar home clicked');
    window.location.href = 'http://localhost:8081';
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