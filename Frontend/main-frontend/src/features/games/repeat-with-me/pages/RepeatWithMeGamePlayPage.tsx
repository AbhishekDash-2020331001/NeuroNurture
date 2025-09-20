import ConsentScreen from "@/features/games/repeat-with-me/components/ConsentScreen";
import Navbar from "@/components/common/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getCurrentChild } from "@/shared/utils/childUtils";
import { ArrowLeft, Headphones, Mic, Repeat } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const TOTAL_ROUNDS = 5;

interface GameResult {
  target_text: string;
  transcribed_text: string;
  similarity_score: number;
  status: string;
}

interface ConsentData {
  childName: string;
  childAge: string;
  suspectedASD: boolean;
  dataConsent: boolean;
  consentType: 'yes' | 'no' | null;
}

type GameState = 'consent' | 'loading' | 'playing' | 'countdown' | 'recording' | 'finished';
type GameScreen = 'consent' | 'game' | 'loading' | 'countdown';

const RepeatWithMeGamePlayPage: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>('consent');
  const [currentScreen, setCurrentScreen] = useState<GameScreen>('consent');
  const [round, setRound] = useState(0);
  const [audioFile, setAudioFile] = useState<string | null>(null);
  const [labelText, setLabelText] = useState<string>("");
  const [countdown, setCountdown] = useState<number>(0);
  const [recordingTime, setRecordingTime] = useState<number>(5);
  const [result, setResult] = useState<string>("");
  const [gameResults, setGameResults] = useState<{ [key: number]: GameResult }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [totfiles, setTotfiles] = useState(0);
  const [fileDetectionError, setFileDetectionError] = useState(false);
  const [selectedChild, setSelectedChild] = useState<any>(null);
  const [consentData, setConsentData] = useState<ConsentData | null>(null);
  const [showCompletionAnimation, setShowCompletionAnimation] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    // Get selected child data
    const childData = getCurrentChild();
    if (childData) {
      setSelectedChild(childData);
    }
    
    countFiles();
  }, []);

  // Count total number of files in audio folder
  const countFiles = async () => {
    let count = 0;
    let audioNumber = 1;
    const maxCheck = 12; // We have 12 audio files (audio1.mp3 to audio12.mp3)
    
    console.log('Checking for available audio files...');
    
    try {
      while (audioNumber <= maxCheck) {
        try {
          const response = await fetch(`/repeatGame/audio/audio${audioNumber}.mp3`, {
            method: 'HEAD',
            cache: 'no-cache'
          });
          
          if (response.ok && response.status === 200) {
            const contentType = response.headers.get('content-type');
            const contentLength = response.headers.get('content-length');
            
            if (contentType && 
                (contentType.includes('audio') || contentType.includes('audio/mpeg') || contentType.includes('audio/mp3')) && 
                contentLength && parseInt(contentLength) > 1000) {
              count++;
              console.log(`✅ Valid audio${audioNumber}.mp3 found (${contentType}, ${contentLength} bytes)`);
              audioNumber++;
            } else {
              console.log(`❌ audio${audioNumber}.mp3 exists but is not a valid audio file (${contentType}, ${contentLength} bytes), stopping search`);
              break;
            }
          } else {
            console.log(`❌ No audio${audioNumber}.mp3 found (status: ${response.status}), stopping search`);
            break;
          }
        } catch (error) {
          console.log(`❌ Error checking audio${audioNumber}.mp3:`, error);
          break;
        }
      }
      
      console.log(`🎯 Total valid audio files found: ${count}`);
      setTotfiles(count);
      setFileDetectionError(false);
      
      if (count === 0) {
        setFileDetectionError(true);
      }
    } catch (error) {
      console.error('Error during file detection:', error);
      setFileDetectionError(true);
    }
  };

  // Handle consent submission
  const handleConsentSubmit = (data: ConsentData) => {
    console.log('Consent submitted with data:', data);
    setConsentData(data);
    setCurrentScreen('game');
    setGameState('loading');
    startGameFlow();
  };

  // Handle back from consent
  const handleConsentBack = () => {
    navigate('/games/repeat-with-me/instructions');
  };

  // Pick random audio + matching label
  const loadRound = async () => {
    const randomIndex = Math.floor(Math.random() * totfiles) + 1;
    const audioPath = `/repeatGame/audio/audio${randomIndex}.mp3`;
    const labelPath = `/repeatGame/label/label${randomIndex}.txt`;
    
    setAudioFile(audioPath);

    try {
      const res = await fetch(labelPath);
      const text = await res.text();
      setLabelText(text.trim());
    } catch (error) {
      console.error('Error loading label:', error);
      setLabelText(`Label ${randomIndex}`);
    }
  };

  // Start the automatic game flow
  const startGameFlow = async () => {
    setGameState('loading');
    await loadRound();
    setGameState('playing');
    
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.play();
      }
    }, 500);
  };

  // Handle audio ended - start countdown
  const handleAudioEnded = () => {
    console.log('Audio ended, starting countdown');
    setGameState('countdown');
    setCountdown(3);
    
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          setCountdown(0);
          startRecording();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Start recording automatically
  const startRecording = async () => {
    console.log('Starting recording for round', round);
    setGameState('recording');
    setRecordingTime(5);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      mediaRecorderRef.current = new MediaRecorder(stream);

      audioChunks.current = [];
      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        console.log('Recording stopped, sending audio to backend...');
        
        const audioBlob = new Blob(audioChunks.current, { type: "audio/mp3" });
        const formData = new FormData();
        formData.append("file", audioBlob, `round${round}.mp3`);
        formData.append("target_text", labelText);
        formData.append("round_number", round.toString());

        try {
          fetch("http://localhost:8000/transcribe", {
            method: "POST",
            body: formData,
          }).catch(error => {
            console.error("Error sending audio:", error);
          });
        } catch (err) {
          console.error("Error sending audio:", err);
        }

        // Process the result
        const result = await processResult(audioBlob);
        setGameResults(prev => ({
          ...prev,
          [round]: result
        }));

        // Move to next round or finish
        if (round < TOTAL_ROUNDS - 1) {
          setRound(prev => prev + 1);
          setTimeout(() => {
            startGameFlow();
          }, 2000);
        } else {
          setGameState('finished');
          setShowCompletionAnimation(true);
          setTimeout(() => {
            setShowConfetti(true);
          }, 1000);
        }
      };

      mediaRecorderRef.current.start();
      
      // Stop recording after 10 seconds
      setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.stop();
        }
      }, 10000);
    } catch (error) {
      console.error('Error starting recording:', error);
      setGameState('playing');
    }
  };

  // Process the result from backend
  const processResult = async (audioBlob: Blob): Promise<GameResult> => {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // For now, return a mock result
    return {
      target_text: labelText,
      transcribed_text: "Sample transcription",
      similarity_score: Math.random() * 100,
      status: "completed"
    };
  };

  const handleLogout = async () => {
    console.log('Logout button clicked');
    await fetch('http://localhost:8080/auth/logout', { method: 'POST', credentials: 'include' });
    window.location.href = '/';
  };

  // Consent Screen
  if (currentScreen === 'consent') {
    return (
      <div className="h-screen bg-gradient-to-br from-pink-100 via-red-50 to-orange-100 font-nunito overflow-hidden flex flex-col">
        <Navbar onLogout={handleLogout} />
        <ConsentScreen
          onConsentSubmit={handleConsentSubmit}
          onBack={handleConsentBack}
        />
      </div>
    );
  }

  // Main Game Container
  return (
    <div className="h-screen bg-gradient-to-br from-pink-100 via-red-50 to-orange-100 font-nunito overflow-hidden flex flex-col">
      <Navbar onLogout={handleLogout} />
      
      {/* Game Header - Compact */}
      <div className="px-3 py-1">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <Button
            onClick={() => navigate('/games/repeat-with-me/instructions')}
            className="btn-fun font-comic text-xs py-1 px-3 bg-gradient-to-r from-pink-400 to-red-400 hover:from-pink-500 hover:to-red-500 text-white border-2 border-pink-300 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <ArrowLeft className="w-3 h-3 mr-1" />
            Back 📋
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
          Round {round + 1} of {TOTAL_ROUNDS} ✨
        </p>
      </div>

      {/* Game Component - Standard Size */}
      <div className="flex-1 flex items-center justify-center px-4 overflow-hidden">
        <div className="w-full max-w-4xl h-full">
          <Card className="card-playful border-2 border-primary/20 bg-white/80 backdrop-blur-sm h-full">
            <CardContent className="p-6 h-full flex flex-col">
              {/* Loading State */}
              {gameState === 'loading' && (
                <div className="flex-1 flex flex-col items-center justify-center">
                  <div className="text-6xl mb-4 animate-spin">🎵</div>
                  <h2 className="text-2xl font-playful text-primary mb-2">Loading Round...</h2>
                  <p className="text-muted-foreground font-comic">Preparing your Bengali sentence</p>
                </div>
              )}

              {/* Playing State - Audio Playing */}
              {gameState === 'playing' && (
                <div className="flex-1 flex flex-col items-center justify-center">
                  <div className="text-8xl mb-6 animate-bounce">🎤</div>
                  <h2 className="text-3xl font-playful text-primary mb-4">Listen Carefully!</h2>
                  <p className="text-xl text-muted-foreground font-comic mb-6 text-center">
                    {labelText}
                  </p>
                  <div className="text-4xl mb-4 animate-pulse">🎵</div>
                  <p className="text-lg text-muted-foreground font-comic">
                    Audio is playing... Listen and get ready to repeat!
                  </p>
                  
                  {/* Hidden audio element */}
                  <audio
                    ref={audioRef}
                    src={audioFile || ''}
                    onEnded={handleAudioEnded}
                    style={{ display: 'none' }}
                  />
                </div>
              )}

              {/* Countdown State */}
              {gameState === 'countdown' && (
                <div className="flex-1 flex flex-col items-center justify-center">
                  <div className="text-8xl mb-6 animate-bounce">🎯</div>
                  <h2 className="text-4xl font-playful text-primary mb-4">Get Ready!</h2>
                  <div className="text-8xl font-bold text-primary mb-4 animate-pulse">
                    {countdown}
                  </div>
                  <p className="text-xl text-muted-foreground font-comic">
                    Start speaking in {countdown} second{countdown !== 1 ? 's' : ''}!
                  </p>
                </div>
              )}

              {/* Recording State */}
              {gameState === 'recording' && (
                <div className="flex-1 flex flex-col items-center justify-center">
                  <div className="text-8xl mb-6 animate-pulse text-red-500">🎙️</div>
                  <h2 className="text-3xl font-playful text-primary mb-4">Recording!</h2>
                  <p className="text-xl text-muted-foreground font-comic mb-6 text-center">
                    {labelText}
                  </p>
                  <div className="text-6xl mb-4 animate-bounce text-red-500">
                    {recordingTime}
                  </div>
                  <p className="text-lg text-muted-foreground font-comic">
                    Speak now! Recording will stop automatically.
                  </p>
                </div>
              )}

              {/* Finished State */}
              {gameState === 'finished' && (
                <div className="flex-1 flex flex-col items-center justify-center">
                  {showCompletionAnimation && (
                    <div className="text-8xl mb-6 animate-bounce">🎉</div>
                  )}
                  <h2 className="text-3xl font-playful text-primary mb-4">Game Complete!</h2>
                  <p className="text-xl text-muted-foreground font-comic mb-6">
                    You've completed all {TOTAL_ROUNDS} rounds!
                  </p>
                  
                  {/* Results Summary */}
                  <div className="w-full max-w-md space-y-3 mb-6">
                    {Object.entries(gameResults).map(([roundNum, result]) => (
                      <div key={roundNum} className="flex items-center justify-between p-3 bg-gradient-to-r from-pink-50 to-red-50 rounded-lg border border-pink-200">
                        <span className="font-comic">Round {parseInt(roundNum) + 1}</span>
                        <span className="font-bold text-primary">{result.similarity_score.toFixed(1)}%</span>
                      </div>
                    ))}
                  </div>

                  {/* Average Score */}
                  <div className="text-center mb-6">
                    <div className="text-4xl font-bold text-primary mb-2">
                      {Object.values(gameResults).reduce((sum, result) => sum + result.similarity_score, 0) / Object.keys(gameResults).length}%
                    </div>
                    <div className="text-lg text-muted-foreground font-comic">Average Score</div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-4">
                    <Button
                      onClick={() => {
                        setRound(0);
                        setGameResults({});
                        setGameState('consent');
                        setCurrentScreen('consent');
                      }}
                      className="btn-fun font-comic text-lg py-3 px-6 bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white border-4 border-pink-300 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110"
                    >
                      🎮 Play Again
                    </Button>
                    <Button
                      onClick={() => navigate('/games/repeat-with-me/insights')}
                      className="btn-fun font-comic text-lg py-3 px-6 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-4 border-blue-300 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110"
                    >
                      📊 View Insights
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom Encouragement - Compact */}
      <div className="text-center mb-2">
        <div className="flex items-center justify-center space-x-2">
          <div className="flex items-center space-x-1 bg-gradient-to-r from-green-400 to-blue-400 px-2 py-1 rounded-full shadow-lg">
            <Repeat className="w-3 h-3 text-white" />
            <span className="text-white font-comic font-bold text-xs">You're Doing Great! 🎯</span>
          </div>
        </div>
      </div>

      {/* Confetti Effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-yellow-400 animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default RepeatWithMeGamePlayPage;
