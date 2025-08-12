import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
    ChevronDown,
    Crown,
    Heart,
    LogOut,
    Settings,
    Sparkles,
    User,
    Users
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface UserMenuProps {
  onLogout?: () => void;
  showLogout?: boolean;
  username?: string | null;
  selectedChild?: any;
}

const UserMenu = ({ onLogout, showLogout = true, username, selectedChild }: UserMenuProps) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogoutClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('UserMenu logout clicked');
    if (onLogout) {
      onLogout();
    }
  };

  const handleSwitchChildClick = () => {
    console.log('Switch Child clicked');
    localStorage.removeItem("selectedChild");
    localStorage.removeItem("selectedChildId");
    navigate("/children");
  };

  const handleParentInfoClick = () => {
    console.log('Parent Info clicked');
    // Check if parent exists and navigate accordingly
    fetch('http://localhost:8080/auth/me', { credentials: 'include' })
      .then(res => res.text())
      .then(email => {
        return fetch(`http://localhost:8082/api/parents/by-email/${email}`, {
          credentials: 'include'
        });
      })
      .then(res => {
        if (res.ok) {
          navigate("/view-parent-info");
        } else {
          navigate("/parent-info");
        }
      })
      .catch(() => {
        navigate("/parent-info");
      });
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-12 w-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 hover:from-yellow-300 hover:to-orange-400 border-3 border-yellow-300 hover:border-yellow-200 transition-all duration-300 hover:scale-110 hover:shadow-xl group shadow-lg"
          style={{ pointerEvents: 'auto' }}
        >
          {/* Enhanced animated background elements */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-300/50 via-orange-400/50 to-red-500/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse"></div>
          
          {/* Enhanced floating sparkles */}
          <div className="absolute -top-2 -right-2 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 animate-ping text-sm">✨</div>
          <div className="absolute -bottom-2 -left-2 text-white opacity-0 group-hover:opacity-100 transition-all duration-500 animate-bounce text-sm">🌟</div>
          <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 text-white opacity-0 group-hover:opacity-100 transition-all duration-700 animate-spin text-xs">💫</div>
          
          {/* Enhanced user icon */}
          <div className="relative z-10 flex items-center justify-center">
            <User className="w-6 h-6 text-white group-hover:scale-125 transition-transform duration-300 drop-shadow-lg" />
          </div>
          
          {/* Enhanced dropdown indicator */}
          <div className="absolute -bottom-2 right-1 text-white group-hover:text-yellow-100 transition-colors duration-300">
            <ChevronDown className={`w-4 h-4 transition-transform duration-300 drop-shadow-lg ${isOpen ? 'rotate-180' : ''}`} />
          </div>
          
          {/* Pulsing ring effect */}
          <div className="absolute inset-0 rounded-full border-2 border-yellow-200 group-hover:border-yellow-100 animate-ping opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align="end" 
        className="w-64 p-2 bg-white/95 backdrop-blur-md border-2 border-primary/20 rounded-2xl shadow-2xl animate-in slide-in-from-top-2 duration-300"
      >
        {/* Header with user info */}
        <div className="px-3 py-2 mb-2">
          <div className="flex items-center space-x-3">
                         <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-fun-purple flex items-center justify-center">
               <User className="w-5 h-5 text-purple-800 drop-shadow-sm" />
             </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-comic font-bold text-primary truncate">
                {username || 'User'}
              </p>
              {selectedChild && (
                <p className="text-xs text-muted-foreground font-comic truncate">
                  Playing as: {selectedChild.name}
                </p>
              )}
            </div>
          </div>
        </div>
        
        <DropdownMenuSeparator className="bg-primary/20" />
        
        {/* Menu items */}
        <div className="space-y-1">
          {/* Switch Child */}
          <DropdownMenuItem
            onClick={handleSwitchChildClick}
            className="flex items-center space-x-3 px-3 py-3 rounded-xl hover:bg-gradient-to-r hover:from-fun-blue/10 hover:to-fun-purple/10 cursor-pointer group transition-all duration-300 hover:scale-105"
          >
                         <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md">
               <Users className="w-5 h-5 text-white drop-shadow-sm" />
             </div>
            <div className="flex-1">
              <p className="text-sm font-comic font-semibold text-primary group-hover:text-primary-dark transition-colors">
                Switch Child
              </p>
              <p className="text-xs text-muted-foreground font-comic">
                Choose different child profile
              </p>
            </div>
            <div className="text-fun-blue opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Sparkles className="w-4 h-4" />
            </div>
          </DropdownMenuItem>
          
          {/* Parent Info */}
          <DropdownMenuItem
            onClick={handleParentInfoClick}
            className="flex items-center space-x-3 px-3 py-3 rounded-xl hover:bg-gradient-to-r hover:from-fun-green/10 hover:to-fun-blue/10 cursor-pointer group transition-all duration-300 hover:scale-105"
          >
                         <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md">
               <Heart className="w-5 h-5 text-white drop-shadow-sm" />
             </div>
            <div className="flex-1">
              <p className="text-sm font-comic font-semibold text-primary group-hover:text-primary-dark transition-colors">
                Parent Info
              </p>
              <p className="text-xs text-muted-foreground font-comic">
                View or edit parent details
              </p>
            </div>
            <div className="text-fun-green opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Crown className="w-4 h-4" />
            </div>
          </DropdownMenuItem>
          
          {/* Settings (placeholder for future) */}
          <DropdownMenuItem
            className="flex items-center space-x-3 px-3 py-3 rounded-xl hover:bg-gradient-to-r hover:from-fun-orange/10 hover:to-fun-yellow/10 cursor-pointer group transition-all duration-300 hover:scale-105"
          >
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-fun-orange to-fun-yellow flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md">
              <Settings className="w-5 h-5 text-orange-800 drop-shadow-sm" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-comic font-semibold text-primary group-hover:text-primary-dark transition-colors">
                Settings
              </p>
              <p className="text-xs text-muted-foreground font-comic">
                App preferences & options
              </p>
            </div>
            <div className="text-fun-orange opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Sparkles className="w-4 h-4" />
            </div>
          </DropdownMenuItem>
        </div>
        
        <DropdownMenuSeparator className="bg-primary/20" />
        
        {/* Logout */}
        {showLogout && onLogout && (
          <DropdownMenuItem
            onClick={handleLogoutClick}
            className="flex items-center space-x-3 px-3 py-3 rounded-xl hover:bg-gradient-to-r hover:from-red-500/10 hover:to-pink-500/10 cursor-pointer group transition-all duration-300 hover:scale-105"
          >
                         <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md">
               <LogOut className="w-5 h-5 text-red-800 drop-shadow-sm" />
             </div>
            <div className="flex-1">
              <p className="text-sm font-comic font-semibold text-red-600 group-hover:text-red-700 transition-colors">
                Logout
              </p>
              <p className="text-xs text-muted-foreground font-comic">
                Sign out of your account
              </p>
            </div>
            <div className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Sparkles className="w-4 h-4" />
            </div>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;
