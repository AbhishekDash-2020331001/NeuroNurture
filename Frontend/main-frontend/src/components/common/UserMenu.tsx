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
    MessageSquare,
    Settings,
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

  const handleReportIssuesClick = () => {
    console.log('Report Issues clicked');
    navigate("/tickets");
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-12 w-auto px-3 bg-transparent hover:bg-white/10 border-none transition-all duration-200 group"
          style={{ pointerEvents: 'auto' }}
        >
          {/* Main content container */}
          <div className="relative z-10 flex items-center space-x-3">
            {/* User icon - separate and prominent */}
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-white/30 transition-colors duration-200">
              <User className="w-5 h-5 text-white" />
            </div>
            
            {/* Text content */}
            <div className="flex flex-col items-start text-left">
              <div className="flex items-center space-x-1">
                <span className="text-sm font-medium text-white">
                  {username || 'User'}
                </span>
                <Crown className="w-3 h-3 text-yellow-200" />
              </div>
              {selectedChild && (
                <div className="flex items-center space-x-1">
                  <span className="text-xs text-white/80">
                    {selectedChild.name}
                  </span>
                  <div className="w-1.5 h-1.5 rounded-full bg-green-300"></div>
                </div>
              )}
            </div>
            
            {/* Dropdown indicator */}
            <div className="flex flex-col items-center">
              <ChevronDown className={`w-4 h-4 text-white/80 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </div>
          </div>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align="end" 
        className="w-56 p-2 bg-white/95 backdrop-blur-md border border-gray-200 rounded-lg shadow-lg animate-in slide-in-from-top-2 duration-200"
      >
        {/* Menu items */}
        <div className="space-y-1">
          {/* Switch Child */}
          <DropdownMenuItem
            onClick={handleSwitchChildClick}
            className="flex items-center space-x-3 px-3 py-2.5 rounded-md hover:bg-gray-50 cursor-pointer group transition-all duration-200"
          >
            <div className="w-8 h-8 rounded-md bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors duration-200">
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
                Switch Child
              </p>
              <p className="text-xs text-gray-500">
                Choose different child profile
              </p>
            </div>
          </DropdownMenuItem>
          
          {/* Parent Info */}
          <DropdownMenuItem
            onClick={handleParentInfoClick}
            className="flex items-center space-x-3 px-3 py-2.5 rounded-md hover:bg-gray-50 cursor-pointer group transition-all duration-200"
          >
            <div className="w-8 h-8 rounded-md bg-red-100 flex items-center justify-center group-hover:bg-red-200 transition-colors duration-200">
              <Heart className="w-4 h-4 text-red-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
                Parent Info
              </p>
              <p className="text-xs text-gray-500">
                View or edit parent details
              </p>
            </div>
          </DropdownMenuItem>

          {/* Report Issues */}
          <DropdownMenuItem
            onClick={handleReportIssuesClick}
            className="flex items-center space-x-3 px-3 py-2.5 rounded-md hover:bg-gray-50 cursor-pointer group transition-all duration-200"
          >
            <div className="w-8 h-8 rounded-md bg-orange-100 flex items-center justify-center group-hover:bg-orange-200 transition-colors duration-200">
              <MessageSquare className="w-4 h-4 text-orange-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
                Report Issues
              </p>
              <p className="text-xs text-gray-500">
                Get help and support
              </p>
            </div>
          </DropdownMenuItem>
          
          {/* Settings (placeholder for future) */}
          <DropdownMenuItem
            className="flex items-center space-x-3 px-3 py-2.5 rounded-md hover:bg-gray-50 cursor-pointer group transition-all duration-200"
          >
            <div className="w-8 h-8 rounded-md bg-orange-100 flex items-center justify-center group-hover:bg-orange-200 transition-colors duration-200">
              <Settings className="w-4 h-4 text-orange-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
                Settings
              </p>
              <p className="text-xs text-gray-500">
                App preferences & options
              </p>
            </div>
          </DropdownMenuItem>
        </div>
        
        <DropdownMenuSeparator className="bg-gray-200 my-1" />
        
        {/* Logout */}
        {showLogout && onLogout && (
          <DropdownMenuItem
            onClick={handleLogoutClick}
            className="flex items-center space-x-3 px-3 py-2.5 rounded-md hover:bg-red-50 cursor-pointer group transition-all duration-200"
          >
            <div className="w-8 h-8 rounded-md bg-red-100 flex items-center justify-center group-hover:bg-red-200 transition-colors duration-200">
              <LogOut className="w-4 h-4 text-red-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-red-600 group-hover:text-red-700 transition-colors">
                Logout
              </p>
              <p className="text-xs text-gray-500">
                Sign out of your account
              </p>
            </div>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;
