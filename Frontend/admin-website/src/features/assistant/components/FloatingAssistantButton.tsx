import React from 'react';
import { ChevronLeft, X } from 'lucide-react';

interface FloatingAssistantButtonProps {
  isOpen: boolean;
  onClick: () => void;
  unreadCount?: number;
}

const FloatingAssistantButton: React.FC<FloatingAssistantButtonProps> = ({ 
  isOpen, 
  onClick, 
  unreadCount = 0 
}) => {
  return (
    <div className="fixed right-0 top-1/2 transform -translate-y-1/2 z-[60]">
      <button
        type="button"
        onClick={onClick}
        className={`group relative transition-all duration-500 ease-in-out transform cursor-pointer ${
          isOpen 
            ? 'translate-x-0 scale-100' 
            : 'translate-x-4 hover:translate-x-1 scale-100 hover:scale-105'
        }`}
      >
        {/* Main Button */}
        <div className={`w-14 h-14 rounded-l-2xl shadow-xl flex items-center justify-center transition-all duration-300 ${
          isOpen
            ? 'bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
            : 'bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600'
        }`}>
          {isOpen ? (
            <X className="w-5 h-5 text-white" />
          ) : (
            <ChevronLeft className="w-7 h-7 text-white group-hover:translate-x-1 transition-transform duration-200 drop-shadow-sm" />
          )}
        </div>

        {/* Unread Count Badge */}
        {unreadCount > 0 && !isOpen && (
          <div className="absolute -top-2 -left-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </div>
        )}

        {/* Pulse Animation */}
        {!isOpen && (
          <div className="absolute inset-0 rounded-l-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 animate-ping opacity-30"></div>
        )}

        {/* Pull Indicator Line */}
        {!isOpen && (
          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-2 w-2 h-0.5 bg-white/60 rounded-full group-hover:bg-white/80 transition-colors duration-200"></div>
        )}

      </button>
    </div>
  );
};

export default FloatingAssistantButton;
