import { Button } from "@/components/ui/button";
import { Brain, LogOut } from "lucide-react";

interface NavbarProps {
  onLogout?: () => void;
  showLogout?: boolean;
}

const Navbar = ({ onLogout, showLogout = true }: NavbarProps) => {
  const handleHomeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Navbar home clicked');
    window.location.href = 'http://localhost:8081';
  };

  const handleLogoutClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Navbar logout clicked');
    if (onLogout) {
      onLogout();
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

          {/* Right side - Logout button */}
          {showLogout && onLogout && (
            <Button
              onClick={handleLogoutClick}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 font-comic font-semibold px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg flex items-center gap-2 relative z-10"
              style={{ pointerEvents: 'auto' }}
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 