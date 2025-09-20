import Navbar from '@/components/common/Navbar';
import { Button } from '@/components/ui/button';
import { stopAllCameraStreams } from '@/shared/utils/cameraUtils';
import { ArrowLeft, Star, Trophy, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import GazeTrackingGamePlayPage from './GazeTrackingGamePlayPage';

type GameScreen = 'instructions' | 'consent' | 'game' | 'loading' | 'countdown' | 'results';

const GazeTrackingGame = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [authChecked, setAuthChecked] = useState(false);
  const [currentGameScreen, setCurrentGameScreen] = useState<GameScreen>('instructions');
  
  // Extract taskId and tournamentId from URL query parameters
  const taskId = searchParams.get('taskId');
  const tournamentId = searchParams.get('tournamentId');

  useEffect(() => {
    fetch('http://localhost:8080/auth/session', { credentials: 'include' })
      .then(res => res.json())
      .then(authenticated => {
        if (!authenticated) {
          navigate('/');
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
    window.location.href = '/';
  };

  // Determine if navbar should be shown (hide during gameplay)
  const shouldShowNavbar = currentGameScreen === 'instructions' || currentGameScreen === 'consent' || currentGameScreen === 'results';

  if (!authChecked) {
    return <div>Loading...</div>;
  }

  return (
    <div className="h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 font-nunito overflow-hidden flex flex-col">
      {/* Beautiful Navbar - Only show on non-gameplay screens */}
      {shouldShowNavbar && <Navbar onLogout={handleLogout} />}
      
      {/* Game Header - Only show on non-gameplay screens */}
      {shouldShowNavbar && (
        <>
          <div className="px-3 py-1">
            <div className="flex items-center justify-between max-w-7xl mx-auto">
              <Button
                onClick={() => navigate('/dashboard')}
                className="btn-fun font-comic text-xs py-1 px-3 bg-gradient-to-r from-blue-400 to-purple-400 hover:from-blue-500 hover:to-purple-500 text-white border-2 border-blue-300 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <ArrowLeft className="w-3 h-3 mr-1" />
                Back 🏠
              </Button>
              
              <div className="flex items-center space-x-1">
                <div className="flex items-center space-x-1 bg-gradient-to-r from-yellow-400 to-orange-400 px-2 py-1 rounded-full shadow-lg">
                  <Trophy className="w-3 h-3 text-white" />
                  <span className="text-white font-comic font-bold text-xs">Gaze Master</span>
                </div>
                <div className="flex items-center space-x-1 bg-gradient-to-r from-blue-400 to-purple-400 px-2 py-1 rounded-full shadow-lg">
                  <Star className="w-3 h-3 text-white" />
                  <span className="text-white font-comic font-bold text-xs">Learning Fun</span>
                </div>
              </div>
            </div>
          </div>

          {/* Game Title - Only show on non-gameplay screens */}
          <div className="text-center mb-2">
            <h1 className="text-xl font-playful bg-gradient-to-r from-blue-600 via-purple-500 to-pink-600 bg-clip-text text-transparent">
              ✨ Eye Gaze Balloon Pop! ✨
            </h1>
            <p className="text-xs font-comic text-gray-600">
              Your eyes are magic wands! 🌟
            </p>
          </div>
        </>
      )}

      {/* Game Component - Full screen during gameplay */}
      <div className={`${shouldShowNavbar ? 'flex-1 flex items-center justify-center px-4 overflow-hidden' : 'h-full'} w-full max-w-4xl mx-auto`}>
        <GazeTrackingGamePlayPage onScreenChange={setCurrentGameScreen} taskId={taskId} />
      </div>

      {/* Bottom Encouragement - Only show on non-gameplay screens */}
      {shouldShowNavbar && (
        <div className="text-center mb-2">
          <div className="flex items-center justify-center space-x-2">
            <div className="flex items-center space-x-1 bg-gradient-to-r from-green-400 to-blue-400 px-2 py-1 rounded-full shadow-lg">
              <Zap className="w-3 h-3 text-white" />
              <span className="text-white font-comic font-bold text-xs">You're Amazing! 🎉</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GazeTrackingGame; 