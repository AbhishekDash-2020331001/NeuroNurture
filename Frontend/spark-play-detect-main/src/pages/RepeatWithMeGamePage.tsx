import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentChild } from "@/utils/childUtils";
import React, { useEffect, useRef, useState } from "react";

const TOTAL_ROUNDS = 5;

interface GameResult {
  target_text: string;
  transcribed_text: string;
  similarity_score: number;
  status: string;
}

type GameState = 'waiting' | 'loading' | 'playing' | 'countdown' | 'recording' | 'finished';

const RepeatWithMeGamePage: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>('waiting');
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
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

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
      console.error('Error during file detection:', error);
      setFileDetectionError(true);
    }
  };

  // Manual override for file count
  const setManualFileCount = (count: number) => {
    setTotfiles(count);
    setFileDetectionError(false);
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
        
        // Cleanup
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
        mediaRecorderRef.current = null;
        
        if (round < TOTAL_ROUNDS) {
          continueToNextRound();
        } else {
          waitForFinalRoundResult();
        }
      };

      // Start recording
      mediaRecorderRef.current.start();
      console.log('Recording started for round', round);

      // Record for exactly 5 seconds
      const recordingStartTime = Date.now();
      const recordingDuration = 5000;
      
      const recordingTimer = setInterval(() => {
        const elapsed = Date.now() - recordingStartTime;
        const remaining = Math.ceil((recordingDuration - elapsed) / 1000);
        
        if (remaining <= 0) {
          clearInterval(recordingTimer);
          setRecordingTime(0);
          
          if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
          }
        } else {
          setRecordingTime(remaining);
        }
      }, 100);
      
    } catch (error) {
      console.error('Error accessing microphone:', error);
      if (round < TOTAL_ROUNDS) {
        continueToNextRound();
      } else {
        finishGame();
      }
    }
  };

  // Continue to next round
  const continueToNextRound = async () => {
    setRound(prev => prev + 1);
    setResult("");
    setCountdown(0);
    setRecordingTime(5);
    await loadRound();
    setGameState('playing');
    
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.play();
      }
    }, 500);
  };

  // Wait for final round transcription result
  const waitForFinalRoundResult = () => {
    console.log('Waiting for final round transcription result...');
    setGameState('loading');
    
    const pollInterval = setInterval(async () => {
      try {
        const resultResponse = await fetch(`http://localhost:8000/round-result/${round}`);
        if (resultResponse.ok) {
          const resultData = await resultResponse.json();
          if (resultData.status === "success") {
            clearInterval(pollInterval);
            finishGame();
          }
        }
      } catch (err) {
        console.error("Error polling for final round result:", err);
      }
    }, 2000);
    
    setTimeout(() => {
      clearInterval(pollInterval);
      finishGame();
    }, 30000);
  };

  // Finish the game
  const finishGame = async () => {
    setGameState('finished');
    setTimeout(async () => {
      await getGameResults();
    }, 3000);
  };

  // Get all game results
  const getGameResults = async () => {
    try {
      const response = await fetch("http://localhost:8000/game-results");
      if (response.ok) {
        const data = await response.json();
        if (data.status === "success") {
          setGameResults(data.results);
        }
      }
    } catch (err) {
      console.error("Error getting game results:", err);
    }
  };

  // Start game on button click
  const startGame = async () => {
    if (totfiles === 0) {
      alert('No audio files found! Please check the repeatGame/audio folder.');
      return;
    }
    
    setIsLoading(true);
    await clearGameResults();
    setRound(1);
    setGameResults({});
    setResult("");
    setCountdown(0);
    setRecordingTime(5);
    setIsLoading(false);
    
    startGameFlow();
  };

  // Clear game results
  const clearGameResults = async () => {
    try {
      const response = await fetch("http://localhost:8000/clear-game-results", {
        method: "POST"
      });
      if (response.ok) {
        console.log("Game results cleared");
      }
    } catch (err) {
      console.error("Error clearing game results:", err);
    }
  };

  // Calculate average similarity score
  const getAverageScore = () => {
    const scores = Object.values(gameResults).map(r => r.similarity_score);
    if (scores.length === 0) return 0;
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  };

  // Reset game
  const resetGame = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-soft font-nunito">
      <Navbar />
      
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Game Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-playful text-primary">🎤 Repeat with Me</h1>
          <p className="text-lg text-muted-foreground">
            Listen carefully and repeat the Bengali sentences you hear!
          </p>
          {selectedChild && (
            <div className="inline-flex items-center space-x-2 bg-primary/10 px-4 py-2 rounded-full">
              <span className="text-primary font-medium">
                Playing as: {selectedChild.name}
              </span>
            </div>
          )}
        </div>

        {/* Game Container */}
        <Card className="card-playful border-2 border-primary/20 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-playful text-primary">
              🎯 Bengali Speech Recognition Game
            </CardTitle>
            <CardDescription className="text-lg">
              The game will run automatically with {TOTAL_ROUNDS} rounds using Bengali audio
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {gameState === 'waiting' && (
              <div className="text-center space-y-4">
                {totfiles > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-green-800 font-medium">
                      ✅ Audio files detected: {totfiles}
                    </p>
                    <p className="text-green-600 text-sm">
                      Each round will randomly select from audio1.mp3 to audio12.mp3
                    </p>
                  </div>
                )}
                
                {fileDetectionError && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-yellow-800 font-medium">
                      ⚠️ Could not automatically detect audio files
                    </p>
                    <p className="text-yellow-600 text-sm mb-3">
                      Please manually set the number of audio files (1-12):
                    </p>
                    <div className="flex items-center space-x-3 justify-center">
                      <input 
                        type="number" 
                        min="1" 
                        max="12" 
                        placeholder="Enter number of audio files"
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          if (value > 0 && value <= 12) {
                            setManualFileCount(value);
                          }
                        }}
                      />
                      <Button 
                        onClick={() => countFiles()}
                        variant="outline"
                        size="sm"
                      >
                        🔄 Retry Detection
                      </Button>
                    </div>
                  </div>
                )}
                
                <Button 
                  onClick={startGame} 
                  disabled={totfiles === 0 || isLoading}
                  className="btn-fun text-lg px-8 py-3"
                  size="lg"
                >
                  {isLoading ? '⏳ Loading...' : totfiles === 0 ? '⏳ No Audio Files' : '▶️ Start Game'}
                </Button>
              </div>
            )}

            {gameState === 'loading' && (
              <div className="text-center space-y-4">
                <div className="loading-spinner mx-auto"></div>
                <p className="text-lg text-muted-foreground">Preparing your game...</p>
              </div>
            )}

            {gameState === 'playing' && (
              <div className="text-center space-y-4">
                <h3 className="text-2xl font-playful text-primary">
                  Round {round} / {TOTAL_ROUNDS}
                </h3>
                <p className="text-lg">
                  Listen carefully to: <span className="font-bold text-primary">{labelText}</span>
                </p>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <audio 
                    ref={audioRef} 
                    src={audioFile ?? ""} 
                    preload="auto"
                    onEnded={handleAudioEnded}
                    className="w-full"
                  />
                  <p className="text-blue-800 font-medium">🎵 Audio is playing...</p>
                </div>
              </div>
            )}

            {gameState === 'countdown' && (
              <div className="text-center space-y-4">
                <h2 className="text-3xl font-playful text-primary">Get Ready!</h2>
                <div className="text-6xl font-bold text-primary animate-pulse">
                  {countdown}
                </div>
                <p className="text-lg text-muted-foreground">
                  Recording will start in {countdown} second{countdown !== 1 ? 's' : ''}
                </p>
              </div>
            )}

            {gameState === 'recording' && (
              <div className="text-center space-y-4">
                <h2 className="text-3xl font-playful text-primary">Recording...</h2>
                <div className="text-4xl font-bold text-red-500 animate-pulse">
                  {recordingTime}s
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center justify-center space-x-2 mb-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-red-800 font-medium">Speak now - repeat what you heard!</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-red-500 h-3 rounded-full transition-all duration-100"
                      style={{ width: `${((5 - recordingTime) / 5) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-red-600 text-sm mt-2">
                    You have {recordingTime} second{recordingTime !== 1 ? 's' : ''} left to speak
                  </p>
                </div>
              </div>
            )}

            {gameState === 'finished' && (
              <div className="text-center space-y-6">
                <h2 className="text-3xl font-playful text-primary">🎉 Game Finished!</h2>
                
                {Object.keys(gameResults).length === 0 ? (
                  <div className="space-y-4">
                    <div className="loading-spinner mx-auto"></div>
                    <p className="text-lg text-muted-foreground">Collecting your results...</p>
                  </div>
                ) : (
                  <>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                      <div className="text-center mb-4">
                        <h3 className="text-2xl font-playful text-green-800 mb-2">Final Score</h3>
                        <div className="text-4xl font-bold text-green-600">
                          {getAverageScore()}%
                        </div>
                        <p className="text-green-600">Average Similarity</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="text-xl font-playful text-primary">Round Results</h3>
                      {Object.entries(gameResults).map(([roundNum, result]) => (
                        <Card key={roundNum} className="border-2 border-primary/20">
                          <CardHeader>
                            <CardTitle className="text-lg text-primary">
                              Round {roundNum}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div className="bg-blue-50 p-3 rounded-lg">
                                <div className="font-medium text-blue-800 mb-1">Target:</div>
                                <div className="text-blue-600">"{result.target_text}"</div>
                              </div>
                              <div className="bg-green-50 p-3 rounded-lg">
                                <div className="font-medium text-green-800 mb-1">Spoken:</div>
                                <div className="text-green-600">"{result.transcribed_text}"</div>
                              </div>
                            </div>
                            <div className="bg-purple-50 p-3 rounded-lg text-center">
                              <div className="font-medium text-purple-800 mb-1">Similarity Score</div>
                              <div className="text-2xl font-bold text-purple-600">
                                {result.similarity_score}%
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                    
                    <Button 
                      onClick={resetGame} 
                      className="btn-fun text-lg px-8 py-3"
                      size="lg"
                    >
                      🎮 Play Again
                    </Button>
                  </>
                )}
              </div>
            )}

            {/* Progress bar */}
            {round > 0 && gameState !== 'waiting' && (
              <div className="mt-6">
                <div className="flex justify-center space-x-2">
                  {Array.from({ length: TOTAL_ROUNDS }, (_, index) => (
                    <div
                      key={index}
                      className={`w-4 h-4 rounded-full transition-all duration-300 ${
                        index + 1 < round ? 'bg-green-500' : 
                        index + 1 === round ? 'bg-primary animate-pulse' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-center text-sm text-muted-foreground mt-2">
                  Round {round} of {TOTAL_ROUNDS}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Loading Spinner Styles */}
      <style>{`
        .loading-spinner {
          width: 50px;
          height: 50px;
          border: 5px solid #f3f3f3;
          border-top: 5px solid #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default RepeatWithMeGamePage;