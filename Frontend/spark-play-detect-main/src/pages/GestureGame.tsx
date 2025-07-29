import GestureRecognizerComponent from '@/components/games/gestureRecognizing/GestureRecognizerComponent';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { stopAllCameraStreams } from '@/utils/cameraUtils';
import { ArrowLeft, Star, Trophy, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const GestureGame = () => {
  const navigate = useNavigate();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    fetch('http://localhost:8080/auth/session', { credentials: 'include' })
      .then(res => res.json())
      .then(authenticated => {
        if (!authenticated) {
          navigate('/auth');
        } else {
          setAuthChecked(true);
        }
      });
  }, [navigate]);

  // Cleanup effect to ensure camera is stopped when page unmounts
  useEffect(() => {
    return () => {
      // Use the utility function to stop all camera streams
      stopAllCameraStreams();
    };
  }, []);

  const handleLogout = async () => {
    console.log('Logout button clicked');
    await fetch('http://localhost:8080/auth/logout', { method: 'POST', credentials: 'include' });
    window.location.href = '/auth';
  };

  if (!authChecked) {
    return <div>Loading...</div>;
  }

  return (
    <div className="h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 font-nunito overflow-hidden flex flex-col">
      {/* Beautiful Navbar */}
      <Navbar onLogout={handleLogout} />
      
      {/* Game Header - Compact */}
      <div className="px-3 py-1">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <Button
            onClick={() => navigate('/dashboard')}
            className="btn-fun font-comic text-xs py-1 px-3 bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500 text-white border-2 border-purple-300 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <ArrowLeft className="w-3 h-3 mr-1" />
            Back 🏠
          </Button>
          
          <div className="flex items-center space-x-1">
            <div className="flex items-center space-x-1 bg-gradient-to-r from-yellow-400 to-orange-400 px-2 py-1 rounded-full shadow-lg">
              <Trophy className="w-3 h-3 text-white" />
              <span className="text-white font-comic font-bold text-xs">Gesture Master</span>
            </div>
            <div className="flex items-center space-x-1 bg-gradient-to-r from-blue-400 to-purple-400 px-2 py-1 rounded-full shadow-lg">
              <Star className="w-3 h-3 text-white" />
              <span className="text-white font-comic font-bold text-xs">Learning Fun</span>
            </div>
          </div>
        </div>
      </div>

      {/* Game Title - Compact */}
      <div className="text-center mb-2">
        <h1 className="text-xl font-playful bg-gradient-to-r from-purple-600 via-pink-500 to-blue-600 bg-clip-text text-transparent">
          ✨ Hand Gesture Adventure! ✨
        </h1>
        <p className="text-xs font-comic text-gray-600">
          Show your amazing hand moves! 🌟
        </p>
      </div>

      {/* Game Component - Standard Size */}
      <div className="flex-1 flex items-center justify-center px-4 overflow-hidden">
        <div className="w-full max-w-4xl h-full">
          <GestureRecognizerComponent />
        </div>
      </div>

      {/* Bottom Encouragement - Compact */}
      <div className="text-center mb-2">
        <div className="flex items-center justify-center space-x-2">
          <div className="flex items-center space-x-1 bg-gradient-to-r from-green-400 to-blue-400 px-2 py-1 rounded-full shadow-lg">
            <Zap className="w-3 h-3 text-white" />
            <span className="text-white font-comic font-bold text-xs">You're Amazing! 🎉</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GestureGame; 