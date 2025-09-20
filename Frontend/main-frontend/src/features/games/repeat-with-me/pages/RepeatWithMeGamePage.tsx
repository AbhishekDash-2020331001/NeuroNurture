import Navbar from "@/components/common/Navbar";
import { Button } from "@/components/ui/button";
import { stopAllCameraStreams } from "@/shared/utils/cameraUtils";
import { ArrowLeft, Headphones, Mic, Repeat } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import RepeatWithMeGame from "../components/RepeatWithMeGame";

const RepeatWithMeGamePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [authChecked, setAuthChecked] = useState(false);
  
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

  if (!authChecked) {
    return <div>Loading...</div>;
  }

  return (
    <div className="h-screen bg-gradient-to-br from-pink-100 via-red-50 to-orange-100 font-nunito overflow-hidden flex flex-col">
      {/* Beautiful Navbar */}
      <Navbar onLogout={handleLogout} />
      
      {/* Game Header - Compact */}
      <div className="px-3 py-1">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <Button
            onClick={() => navigate('/games/repeat-with-me/insights')}
            className="btn-fun font-comic text-xs py-1 px-3 bg-gradient-to-r from-pink-400 to-red-400 hover:from-pink-500 hover:to-red-500 text-white border-2 border-pink-300 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <ArrowLeft className="w-3 h-3 mr-1" />
            Back 📊
          </Button>
          
          <div className="flex items-center space-x-1">
            <div className="flex items-center space-x-1 bg-gradient-to-r from-pink-400 to-red-400 px-2 py-1 rounded-full shadow-lg">
              <Mic className="w-3 h-3 text-white" />
              <span className="text-white font-comic font-bold text-xs">Speech Master</span>
            </div>
            <div className="flex items-center space-x-1 bg-gradient-to-r from-red-400 to-orange-400 px-2 py-1 rounded-full shadow-lg">
              <Headphones className="w-3 h-3 text-white" />
              <span className="text-white font-comic font-bold text-xs">Listening Expert</span>
            </div>
          </div>
        </div>
      </div>

      {/* Game Title - Compact */}
      <div className="text-center mb-2">
        <h1 className="text-xl font-playful bg-gradient-to-r from-pink-600 via-red-500 to-orange-600 bg-clip-text text-transparent">
          🎤 Repeat with Me! 🎤
        </h1>
        <p className="text-xs font-comic text-gray-600">
          Listen carefully and repeat the Bengali sentences! ✨
        </p>
      </div>

      {/* Game Component - Standard Size */}
      <div className="flex-1 flex items-center justify-center px-4 overflow-hidden">
        <div className="w-full max-w-4xl h-full">
          <RepeatWithMeGame taskId={taskId} tournamentId={tournamentId} />
        </div>
      </div>

      {/* Bottom Encouragement - Compact */}
      <div className="text-center mb-2">
        <div className="flex items-center justify-center space-x-2">
          <div className="flex items-center space-x-1 bg-gradient-to-r from-green-400 to-blue-400 px-2 py-1 rounded-full shadow-lg">
            <Repeat className="w-3 h-3 text-white" />
            <span className="text-white font-comic font-bold text-xs">Practice Makes Perfect! 🎯</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RepeatWithMeGamePage;