import React from 'react';

interface FloatingGeminiButtonProps {
  onClick: () => void;
  isOpen: boolean;
}

const FloatingGeminiButton: React.FC<FloatingGeminiButtonProps> = ({ onClick, isOpen }) => {
        return (
     <div className="fixed bottom-6 right-6 z-[99999] pointer-events-auto">
       {/* Floating Button */}
                         <button
           onClick={onClick}
           className={`relative w-20 h-20 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 text-white rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-110 cursor-pointer z-10 ${
             isOpen ? 'rotate-180' : 'rotate-0'
           }`}
           style={{
             boxShadow: '0 10px 25px rgba(147, 51, 234, 0.4)',
             cursor: 'pointer',
           }}
         >
           {/* Main Icon */}
           <div className="flex flex-col items-center justify-center w-full h-full">
             <span className="text-2xl">👧</span>
             <span className="text-xs font-bold mt-1">ELLA</span>
           </div>
           
                    {/* Sparkle Effects */}
         <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full animate-ping opacity-75 pointer-events-none"></div>
         <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-pink-400 rounded-full animate-pulse pointer-events-none"></div>
         
         {/* Helper Badge */}
         <div className="absolute -top-2 -left-2 bg-gradient-to-r from-pink-400 to-purple-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md pointer-events-none">
           💫
         </div>
         </button>
       
                {/* Pulse Ring */}
         <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 animate-ping opacity-20 pointer-events-none"></div>
         
         {/* Tooltip */}
         <div className="absolute bottom-24 right-0 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none shadow-lg">
           <div className="flex items-center space-x-2">
             <span className="text-lg">👧</span>
             <div>
               <div className="font-bold">Ella - Your Friend</div>
               <div className="text-xs opacity-75">Click to chat!</div>
             </div>
           </div>
           <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-pink-500"></div>
         </div>
     </div>
  );
};

export default FloatingGeminiButton;
