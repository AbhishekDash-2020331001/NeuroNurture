import Navbar from '@/components/common/Navbar';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { getCurrentChildId } from '@/shared/utils/childUtils';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

interface GameResult {
  target_text: string;
  transcribed_text: string;
  similarity_score: number;
  status: string;
}

type GameState = 'idle' | 'listening' | 'speaking' | 'processing' | 'finished';

const RepeatWithMeGameplay: React.FC = () => {
  const [searchParams] = useSearchParams();
  const taskId = searchParams.get('taskId');
  const tournamentId = searchParams.get('tournamentId');
  
  const [gameState, setGameState] = useState<GameState>('idle');
  const [roundCountdown, setRoundCountdown] = useState<number>(2);
  const [isRoundCountdownActive, setIsRoundCountdownActive] = useState<boolean>(false);
  const [showCompletionAnimation, setShowCompletionAnimation] = useState(false);
  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [currentSentence, setCurrentSentence] = useState<string>("");
  const [currentAudioFile, setCurrentAudioFile] = useState<string>("");
  const [round, setRound] = useState(0);
  const [gameResults, setGameResults] = useState<{ [key: number]: GameResult }>({});
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingTimer, setRecordingTimer] = useState<number>(10);
  const [totfiles, setTotfiles] = useState<number>(12); // We have 12 audio files
  const [usedAudioIndices, setUsedAudioIndices] = useState<Set<number>>(new Set()); // Track used audio files

  useEffect(() => {
    // Initialize the game when component mounts
    startGame();
  }, []);

  // Count total number of files in audio folder (like Javafest_agor)
  const countFiles = useCallback(async () => {
    let count = 0;
    let audioNumber = 1;
    const maxCheck = 20; // Maximum number of files to check
    
    console.log('Checking for available audio files...');
    
    try {
      // Try to fetch audio files until we find one that doesn't exist
      while (audioNumber <= maxCheck) {
        try {
          const response = await fetch(`/repeatGame/audio/audio${audioNumber}.mp3`, {
            method: 'HEAD', // Only check headers, don't download the file
            cache: 'no-cache' // Prevent caching issues
          });
          
          if (response.ok && response.status === 200) {
            // Check if it's actually an audio file by looking at content type or size
            const contentType = response.headers.get('content-type');
            const contentLength = response.headers.get('content-length');
            
            // Verify it's an audio file and has some content
            if (contentType && 
                (contentType.includes('audio') || contentType.includes('audio/mpeg') || contentType.includes('audio/mp3')) && 
                contentLength && parseInt(contentLength) > 1000) {
              count++;
              audioNumber++;
            } else {
              break;
            }
          } else {
            break;
          }
        } catch (error) {
          break;
        }
      }
      
      console.log(`🎯 Total valid audio files found: ${count}`);
      setTotfiles(count);
      
      if (count === 0) {
        console.error('No audio files found!');
      }
    } catch (error) {
      console.error('Error during file detection:', error);
    }
  }, []);

  useEffect(() => {
    countFiles();
  }, [countFiles]);

  const startGame = useCallback(async () => {
    setGameState('idle');
    setRound(0);
    setGameResults({});
    setUsedAudioIndices(new Set()); // Reset used audio indices
    
    // Clear previous game results from backend (like Javafest_agor)
    await clearGameResults();
    
    // Start first round
    startRound();
  }, []);

  // Pick random audio + matching label (like Javafest_agor) - ensure no repeats
  const loadRound = useCallback(async () => {
    // Get available audio indices (not used yet)
    const availableIndices = [];
    for (let i = 1; i <= totfiles; i++) {
      if (!usedAudioIndices.has(i)) {
        availableIndices.push(i);
      }
    }
    
    // If all audio files have been used, reset the used indices
    if (availableIndices.length === 0) {
      setUsedAudioIndices(new Set());
      for (let i = 1; i <= totfiles; i++) {
        availableIndices.push(i);
      }
    }
    
    // Pick a random available audio file
    const randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
    const audioPath = `/repeatGame/audio/audio${randomIndex}.mp3`;
    const labelPath = `/repeatGame/label/label${randomIndex}.txt`;
    
    // Mark this audio file as used
    setUsedAudioIndices(prev => new Set([...prev, randomIndex]));
    
    console.log(`🎵 Loading audio file ${randomIndex} (Round ${round + 1})`);
    setCurrentAudioFile(audioPath);

    try {
      const res = await fetch(labelPath);
      const text = await res.text();
      setCurrentSentence(text.trim());
    } catch (error) {
      console.error('Error loading label:', error);
      // Fallback text if label file not found
      setCurrentSentence(`Bengali Sentence ${randomIndex}`);
    }
  }, [totfiles, usedAudioIndices, round]);

  const startRound = useCallback(async () => {
    // Check if we've completed all rounds (equal to total audio files)
    if (round >= totfiles) {
      finishGame();
      return;
    }

    // Load random audio and label for this round
    await loadRound();
    
    // Start countdown
    setIsRoundCountdownActive(true);
    setRoundCountdown(3);
    
    const countdownInterval = setInterval(() => {
      setRoundCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          setIsRoundCountdownActive(false);
          startListeningPhase();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [round, loadRound, totfiles]);

  const startListeningPhase = useCallback(() => {
    setGameState('listening');
    setIsAudioPlaying(true);
    
    console.log('Starting listening phase with audio file:', currentAudioFile);
    
    // Auto-play audio after a brief moment (like Javafest_agor)
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.play()
          .then(() => {
            console.log('Audio playing successfully');
          })
          .catch(error => {
            console.error('Error playing audio:', error);
            toast({
              title: "Audio Error",
              description: "Could not play the audio. Please try again.",
              variant: "destructive",
            });
            // Fallback: move to speaking phase after a delay
            setTimeout(() => {
              setIsAudioPlaying(false);
              startSpeakingPhase();
            }, 3000);
          });
      }
    }, 500);
    
    // Fallback timer in case audio doesn't play
    setTimeout(() => {
      if (isAudioPlaying) {
        console.log('Fallback: Moving to speaking phase');
        setIsAudioPlaying(false);
        startSpeakingPhase();
      }
    }, 4000);
  }, [currentAudioFile, isAudioPlaying]);

  const startSpeakingPhase = useCallback(async () => {
    setGameState('speaking');
    setIsRecording(true);
          setRecordingTimer(10);
    
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
        setGameState('processing');
        
        // Create audio blob and send to backend (like Javafest_agor)
        const audioBlob = new Blob(audioChunks.current, { type: "audio/mp3" });
        const formData = new FormData();
        formData.append("file", audioBlob, `round${round}.mp3`);
        formData.append("target_text", currentSentence);
        formData.append("round_number", round.toString());

        // Send audio to backend for transcription
        try {
          const response = await fetch("http://localhost:8000/transcribe", {
            method: "POST",
            body: formData,
          });
          
          if (response.ok) {
            console.log('Audio sent to backend for transcription');
            
            // For final round, wait for transcription result before finishing
            if (round < totfiles - 1) {
              // Continue to next round after a short delay
              setTimeout(() => {
                setRound(prev => prev + 1);
                startRound();
              }, 2000);
            } else {
              // This is the final round, wait for transcription result
              waitForFinalRoundResult();
            }
          } else {
            console.error('Error sending audio to backend');
            // Continue anyway
            if (round < totfiles - 1) {
              setRound(prev => prev + 1);
              startRound();
            } else {
              finishGame();
            }
          }
        } catch (err) {
          console.error("Error sending audio:", err);
          // Continue anyway
          if (round < totfiles - 1) {
            setRound(prev => prev + 1);
            startRound();
          } else {
            finishGame();
          }
        }
        
        // Cleanup
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
        mediaRecorderRef.current = null;
      };

      mediaRecorderRef.current.start();
      
      // Countdown timer for recording (exactly 10 seconds)
      const recordingStartTime = Date.now();
      const recordingDuration = 10000; // 10 seconds in milliseconds
      
      const recordingTimer = setInterval(() => {
        const elapsed = Date.now() - recordingStartTime;
        const remaining = Math.ceil((recordingDuration - elapsed) / 1000);
        
        if (remaining <= 0) {
          clearInterval(recordingTimer);
          setRecordingTimer(0);
          console.log('Recording time complete, stopping recorder');
          
          // Stop recording after exactly 10 seconds
          if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            console.log('Stopping recording after 10 seconds');
            mediaRecorderRef.current.stop();
          }
          setIsRecording(false);
        } else {
          setRecordingTimer(remaining);
        }
      }, 100); // Update every 100ms for smoother countdown
      
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Microphone Error",
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive",
      });
    }
  }, [currentSentence, round, totfiles]);

  // Function to handle early recording completion
  const handleEarlyRecordingComplete = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      console.log('User completed recording early');
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setRecordingTimer(0);
    }
  }, []);

  // Wait for final round transcription result before finishing (like Javafest_agor)
  const waitForFinalRoundResult = useCallback(() => {
    console.log('Waiting for final round transcription result...');
    setGameState('processing');
    
    // Poll for the final round result every 2 seconds
    const pollInterval = setInterval(async () => {
      try {
        const resultResponse = await fetch(`http://localhost:8000/round-result/${round}`);
        if (resultResponse.ok) {
          const resultData = await resultResponse.json();
          if (resultData.status === "success") {
            clearInterval(pollInterval);
            console.log('Final round result received:', resultData.result);
            finishGame();
          }
        }
      } catch (err) {
        console.error("Error polling for final round result:", err);
      }
    }, 2000);
    
    // Stop polling after 30 seconds and finish anyway
    setTimeout(() => {
      clearInterval(pollInterval);
      console.log('Final round result timeout, finishing game anyway');
      finishGame();
    }, 30000);
  }, [round]);

  // Get all game results from backend (like Javafest_agor)
  const getGameResults = useCallback(async () => {
    try {
      const response = await fetch("http://localhost:8000/game-results");
      if (response.ok) {
        const data = await response.json();
        console.log("All game results:", data);
        if (data.status === "success") {
          setGameResults(data.results);
          return data.results; // Return the results
        }
      }
    } catch (err) {
      console.error("Error getting game results:", err);
    }
    return null;
  }, []);

  // Clear game results from backend (like Javafest_agor)
  const clearGameResults = useCallback(async () => {
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
  }, []);

  // Calculate average similarity score (like Javafest_agor)
  const getAverageScore = useCallback(() => {
    const scores = Object.values(gameResults).map(r => r.similarity_score);
    if (scores.length === 0) return 0;
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  }, [gameResults]);

  // Create session ID (like gesture game)
  const createSessionId = useCallback(() => {
    const childId = getCurrentChildId()?.toString() || 'unknown';
    const dateTime = new Date().toISOString().replace(/[:.]/g, '-');
    return `${childId}_${dateTime}`;
  }, []);

  // Save game results to backend
  const saveGameResults = useCallback(async (results?: { [key: number]: GameResult }) => {
    try {
      const sessionId = createSessionId();
      const resultsToUse = results || gameResults;
      const averageScore = resultsToUse ? Math.round(Object.values(resultsToUse).map(r => r.similarity_score).reduce((a, b) => a + b, 0) / Object.values(resultsToUse).length) : 0;
      const completedRounds = resultsToUse ? Object.keys(resultsToUse).length : 0;
      
      // Extract child data from localStorage or fetch from API
      let childData = null;
      const selectedChild = localStorage.getItem('selectedChild');
      
      if (selectedChild) {
        childData = JSON.parse(selectedChild);
      } else {
        // If no child data in localStorage, try to fetch from API using childId from URL
        const urlParams = new URLSearchParams(window.location.search);
        const childId = urlParams.get('childId');
        if (childId) {
          try {
            const response = await fetch(`http://localhost:8082/api/parents/children/${childId}/details`);
            if (response.ok) {
              childData = await response.json();
            }
          } catch (error) {
            console.error('Error fetching child data:', error);
          }
        }
      }
      
      // Calculate age from date of birth (like gesture game)
      const calculateAge = (dateOfBirth: string) => {
        const birthDate = new Date(dateOfBirth);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        return age;
      };

      // Get consent data from localStorage (like gesture game)
      const consentDataStr = localStorage.getItem('repeatWithMeConsentData');
      const consentData = consentDataStr ? JSON.parse(consentDataStr) : null;
      
             const gameData = {
         sessionId: sessionId,
         childId: childData?.id?.toString() || 'unknown',
         age: consentData?.childAge ? parseInt(consentData.childAge) : (childData?.dateOfBirth ? calculateAge(childData.dateOfBirth) : 8),
         schoolTaskId: taskId, // Include school task ID if available
         tournamentId: tournamentId, // Include tournament ID if available
         // All 12 rounds
         round1Score: resultsToUse[0]?.similarity_score || null,
         round2Score: resultsToUse[1]?.similarity_score || null,
         round3Score: resultsToUse[2]?.similarity_score || null,
         round4Score: resultsToUse[3]?.similarity_score || null,
         round5Score: resultsToUse[4]?.similarity_score || null,
         round6Score: resultsToUse[5]?.similarity_score || null,
         round7Score: resultsToUse[6]?.similarity_score || null,
         round8Score: resultsToUse[7]?.similarity_score || null,
         round9Score: resultsToUse[8]?.similarity_score || null,
         round10Score: resultsToUse[9]?.similarity_score || null,
         round11Score: resultsToUse[10]?.similarity_score || null,
         round12Score: resultsToUse[11]?.similarity_score || null,
         round1TargetText: resultsToUse[0]?.target_text || null,
         round1TranscribedText: resultsToUse[0]?.transcribed_text || null,
         round2TargetText: resultsToUse[1]?.target_text || null,
         round2TranscribedText: resultsToUse[1]?.transcribed_text || null,
         round3TargetText: resultsToUse[2]?.target_text || null,
         round3TranscribedText: resultsToUse[2]?.transcribed_text || null,
         round4TargetText: resultsToUse[3]?.target_text || null,
         round4TranscribedText: resultsToUse[3]?.transcribed_text || null,
         round5TargetText: resultsToUse[4]?.target_text || null,
         round5TranscribedText: resultsToUse[4]?.transcribed_text || null,
         round6TargetText: resultsToUse[5]?.target_text || null,
         round6TranscribedText: resultsToUse[5]?.transcribed_text || null,
         round7TargetText: resultsToUse[6]?.target_text || null,
         round7TranscribedText: resultsToUse[6]?.transcribed_text || null,
         round8TargetText: resultsToUse[7]?.target_text || null,
         round8TranscribedText: resultsToUse[7]?.transcribed_text || null,
         round9TargetText: resultsToUse[8]?.target_text || null,
         round9TranscribedText: resultsToUse[8]?.transcribed_text || null,
         round10TargetText: resultsToUse[9]?.target_text || null,
         round10TranscribedText: resultsToUse[9]?.transcribed_text || null,
         round11TargetText: resultsToUse[10]?.target_text || null,
         round11TranscribedText: resultsToUse[10]?.transcribed_text || null,
         round12TargetText: resultsToUse[11]?.target_text || null,
         round12TranscribedText: resultsToUse[11]?.transcribed_text || null,
         averageScore: averageScore,
         completedRounds: completedRounds,
         isTrainingAllowed: consentData?.dataConsent === true,
         suspectedASD: consentData?.suspectedASD || false
       };

      console.log('Saving game data to backend:', gameData);

      const response = await fetch('http://localhost:8089/api/repeat-with-me-game/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(gameData)
      });

      if (response.ok) {
        const savedData = await response.json();
        console.log('Game results saved successfully:', savedData);
      } else {
        console.error('Failed to save game results:', response.statusText);
      }
    } catch (error) {
      console.error('Error saving game results:', error);
    }
  }, [gameResults, createSessionId]);

  const finishGame = useCallback(async () => {
    setGameState('finished');
    setShowCompletionAnimation(true);
    
    // Wait a moment for all transcriptions to complete, then get results (like Javafest_agor)
    setTimeout(async () => {
      const results = await getGameResults();
      // Save results to backend immediately with the retrieved results
      if (results) {
        await saveGameResults(results);
      }
    }, 3000);
    
    setTimeout(() => {
      setShowConfetti(true);
    }, 1000);
  }, [getGameResults, saveGameResults]);

  const resetGame = () => {
    setGameState('idle');
    setRound(0);
    setGameResults({});
    setShowCompletionAnimation(false);
    setShowConfetti(false);
    setUsedAudioIndices(new Set()); // Reset used audio indices
    startGame();
  };

  const goToInstructions = () => {
    window.location.href = '/games/repeat-with-me';
  };

  const handleLogout = async () => {
    console.log('Logout button clicked');
    await fetch('http://localhost:8080/auth/logout', { method: 'POST', credentials: 'include' });
    window.location.href = '/';
  };

  return (
    <div className="h-screen bg-gradient-to-br from-pink-100 via-red-50 to-orange-100 font-nunito overflow-hidden flex flex-col">
      {/* Beautiful Navbar */}
      <Navbar onLogout={handleLogout} />
      
      {/* Game Header - Compact */}
      <div className="px-3 py-1">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <button
            onClick={goToInstructions}
            className="btn-fun font-comic text-xs py-1 px-3 bg-gradient-to-r from-pink-400 to-red-400 hover:from-pink-500 hover:to-red-500 text-white border-2 border-pink-300 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            ← Back to Instructions
          </button>
          
          <div className="flex items-center space-x-1">
            <div className="flex items-center space-x-1 bg-gradient-to-r from-pink-400 to-red-400 px-2 py-1 rounded-full shadow-lg">
              <span className="text-white font-comic font-bold text-xs">🎤 Round {round + 1} of {totfiles}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Game Content */}
      <div className={`flex-1 flex flex-col items-center p-4 overflow-y-auto ${gameState === 'finished' ? 'justify-start' : 'justify-center'}`}>
        {/* Idle State - Show start button */}
        {gameState === 'idle' && (
          <div className="text-center max-w-2xl">
            <div className="text-8xl mb-6 animate-bounce">🎤</div>
            <h2 className="text-4xl font-playful text-primary mb-6 bg-gradient-to-r from-pink-600 to-red-600 bg-clip-text text-transparent">
              Ready to Play?
            </h2>
            <p className="text-xl text-muted-foreground font-comic mb-8 leading-relaxed">
              Listen to Bengali sentences and repeat them back! You'll have {totfiles} rounds to practice your pronunciation.
            </p>
            {/* <Button
              onClick={startGame}
              className="btn-fun font-comic text-2xl py-4 px-8 bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white border-4 border-pink-300 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110"
            >
              🚀 Start Game
            </Button> */}
          </div>
        )}

        {/* Round Countdown - Minimal and Beautiful */}
        {isRoundCountdownActive && (
          <div className="text-center max-w-2xl">
            <div className="relative mb-8">
              {/* Animated background circles */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-40 h-40 bg-gradient-to-r from-yellow-200 to-orange-200 rounded-full animate-pulse opacity-50"></div>
                <div className="absolute w-32 h-32 bg-gradient-to-r from-pink-200 to-red-200 rounded-full animate-ping"></div>
              </div>
              
              {/* Countdown number */}
              <div className="relative z-10">
                <div className="text-8xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent animate-bounce">
                  {roundCountdown}
                </div>
              </div>
            </div>
            <p className="text-2xl text-muted-foreground font-comic animate-pulse">
              🚀 Round {round + 1} starting... 🚀
            </p>
          </div>
        )}

        {/* Listening Phase */}
        {gameState === 'listening' && (
          <div className="text-center max-w-3xl">
            {/* Animated listening icon */}
            <div className="relative mb-8">
              <div className="text-7xl mb-6 animate-bounce text-blue-500">🔊</div>
              {/* Sound waves animation */}
              <div className="flex justify-center space-x-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="w-3 bg-gradient-to-t from-blue-400 to-blue-600 rounded-full animate-pulse"
                    style={{
                      height: `${i * 10}px`,
                      animationDelay: `${i * 0.1}s`
                    }}
                  ></div>
                ))}
              </div>
            </div>
            
            <h3 className="text-4xl font-playful text-primary mb-8 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              🎧 Listen Carefully!
            </h3>
            
            <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8 rounded-3xl border-4 border-blue-200 shadow-2xl mb-6 transform hover:scale-105 transition-all duration-300">
              <div className="bg-white p-6 rounded-2xl border-2 border-blue-100 shadow-lg">
                <p className="text-2xl font-comic text-primary mb-6 leading-relaxed">
                  {currentSentence}
                </p>
                <div className="flex items-center justify-center space-x-3 text-lg text-muted-foreground font-comic">
                  <span>🎵</span>
                  <span className="animate-pulse">Audio is playing...</span>
                  <span>🎵</span>
                </div>
                {isAudioPlaying && (
                  <div className="mt-4 flex items-center justify-center space-x-3">
                    <div className="w-4 h-4 bg-green-500 rounded-full animate-bounce"></div>
                    <span className="text-green-600 font-bold text-lg">🔊 Playing Audio...</span>
                    <div className="w-4 h-4 bg-green-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Audio element - like Javafest_agor */}
            <audio
              ref={audioRef}
              src={currentAudioFile}
              preload="auto"
              onEnded={() => {
                console.log('Audio ended');
                setIsAudioPlaying(false);
                startSpeakingPhase();
              }}
              style={{ display: 'none' }}
            />
          </div>
        )}

        {/* Speaking Phase */}
        {gameState === 'speaking' && (
          <div className="text-center max-w-3xl">
            {/* Animated microphone icon */}
            <div className="relative mb-8">
              <div className="text-7xl mb-6 animate-pulse text-red-500">🎙️</div>
              {/* Recording indicator */}
              <div className="absolute -top-2 -right-2 w-10 h-10 bg-red-500 rounded-full animate-ping"></div>
            </div>
            
            <h3 className="text-4xl font-playful text-primary mb-8 bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
              🗣️ Now Speak!
            </h3>
            
            <div className="bg-gradient-to-br from-red-50 via-pink-50 to-purple-50 p-8 rounded-3xl border-4 border-red-200 shadow-2xl mb-8 transform hover:scale-105 transition-all duration-300">
              <div className="bg-white p-6 rounded-2xl border-2 border-red-100 shadow-lg">
                <p className="text-xl text-muted-foreground font-comic mb-4">
                  🎯 Repeat this sentence:
                </p>
                <p className="text-2xl font-comic text-primary mb-6 leading-relaxed">
                  {currentSentence}
                </p>
              </div>
            </div>
            
            {/* Enhanced countdown timer */}
            <div className="relative mb-8">
              <div className="text-7xl font-bold bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent animate-bounce">
                {recordingTimer}
              </div>
              {/* Timer background */}
              <div className="absolute inset-0 -z-10">
                <div className="w-36 h-36 bg-gradient-to-r from-red-200 to-pink-200 rounded-full animate-pulse opacity-30"></div>
              </div>
            </div>
            
            {/* Recording progress bar */}
            <div className="w-80 mx-auto bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner mb-6">
              <div 
                className="h-full bg-gradient-to-r from-red-500 to-pink-500 rounded-full transition-all duration-1000 ease-out shadow-lg"
                style={{ width: `${((10 - recordingTimer) / 10) * 100}%` }}
              ></div>
            </div>

            {/* Done Button - Allow early completion */}
            <Button
              onClick={handleEarlyRecordingComplete}
              className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-bold py-3 px-8 rounded-full text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 border-green-400"
            >
              ✅ Done Recording
            </Button>
          </div>
        )}

        {/* Processing Phase - Minimal Circular Countdown */}
        {gameState === 'processing' && (
          <div className="text-center max-w-2xl">
            {/* Minimal circular countdown timer */}
            <div className="relative mb-8">
              <div className="w-32 h-32 mx-auto relative">
                {/* Outer circle */}
                <div className="w-full h-full border-8 border-gray-200 rounded-full"></div>
                
                {/* Progress circle */}
                <div className="absolute inset-0 w-full h-full border-8 border-transparent border-t-purple-500 rounded-full animate-spin"></div>
                
                {/* Center content */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-2xl font-bold text-purple-600">⟳</div>
                </div>
              </div>
            </div>
            
            <h2 className="text-3xl font-playful text-primary mb-4 bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Processing...
            </h2>
          </div>
        )}

        {/* Game Finished - Enhanced Visual Design */}
        {gameState === 'finished' && (
          <div className="text-center max-w-5xl w-full">
            
            
            <h2 className="text-4xl font-playful text-primary mb-6 bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600 bg-clip-text text-transparent">
              🏆 Game Complete! 🏆
            </h2>
            
            {Object.keys(gameResults).length === 0 ? (
              <div className="text-center">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-3xl border-4 border-blue-200 shadow-2xl max-w-md mx-auto">
                  <p className="text-lg text-muted-foreground font-comic mb-4">🎯 Collecting your results...</p>
                  <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="text-sm text-muted-foreground font-comic mt-3">Please wait while we process your speech...</p>
                </div>
              </div>
            ) : (
              <>
                <div className="w-full space-y-4 mb-6">
                  {/* Enhanced Average Score - Compact */}
                  <div className="bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 p-6 rounded-3xl border-4 border-yellow-200 shadow-2xl transform hover:scale-105 transition-all duration-300">
                    <div className="text-center">
                      <div className="text-xl font-comic text-muted-foreground mb-2">🎯 Your Average Score</div>
                      <div className="text-5xl font-bold bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600 bg-clip-text text-transparent mb-2">
                        {getAverageScore()}%
                      </div>
                      <div className="text-base text-muted-foreground font-comic">
                        {getAverageScore() >= 80 ? '🌟 Excellent! You\'re a Bengali master!' :
                         getAverageScore() >= 60 ? '🎉 Great job! Keep practicing!' :
                         getAverageScore() >= 40 ? '👍 Good effort! You\'re improving!' :
                         '💪 Keep practicing! Every attempt makes you better!'}
                      </div>
                    </div>
                  </div>
                  
                  {/* Enhanced Round Results - Compact with proper scrolling */}
                  <div className="relative">
                    <div className="grid gap-3 max-h-96 overflow-y-auto custom-scrollbar pr-2">
                      {Object.entries(gameResults)
                        .sort(([a], [b]) => parseInt(a) - parseInt(b)) // Ensure rounds are in order
                        .map(([roundNum, result]) => (
                      <div key={roundNum} className="bg-gradient-to-br from-white to-gray-50 p-4 rounded-2xl border-2 border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                        <div className="text-center mb-3">
                          <span className="text-xl font-playful text-primary bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                            🎮 Round {parseInt(roundNum) + 1}
                          </span>
                        </div>
                        
                        <div className="grid md:grid-cols-3 gap-3 text-center">
                          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-3 rounded-xl border border-blue-200">
                            <div className="text-xs font-bold text-blue-600 mb-1">🎯 Target</div>
                            <div className="text-xs text-gray-700 font-comic leading-relaxed">
                              "{result.target_text}"
                            </div>
                          </div>
                          
                          <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-3 rounded-xl border border-green-200">
                            <div className="text-xs font-bold text-green-600 mb-1">🗣️ Spoken</div>
                            <div className="text-xs text-gray-700 font-comic leading-relaxed">
                              "{result.transcribed_text}"
                            </div>
                          </div>
                          
                          <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-3 rounded-xl border border-purple-200">
                            <div className="text-xs font-bold text-purple-600 mb-1">⭐ Score</div>
                            <div className="text-xl font-bold text-primary">
                              {result.similarity_score.toFixed(1)}%
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    </div>
                    
                    {/* Scroll indicator when there are many rounds */}
                    {Object.keys(gameResults).length > 6 && (
                      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent pointer-events-none flex items-end justify-center">
                        <div className="text-xs text-gray-500 font-comic mb-1 animate-bounce">
                          📜 Scroll to see all rounds
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Enhanced Action Button - Compact */}
                <div className="flex flex-col sm:flex-row justify-center gap-3">
                  <Button
                    onClick={resetGame}
                    className="btn-fun font-comic text-lg py-3 px-6 bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white border-4 border-pink-300 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 transform"
                  >
                    🎮 Play Again
                  </Button>
                  
                  <Button
                    onClick={goToInstructions}
                    className="btn-fun font-comic text-lg py-3 px-6 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white border-4 border-blue-300 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 transform"
                  >
                    📚 Back to Instructions
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Confetti Effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
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

export default RepeatWithMeGameplay;
