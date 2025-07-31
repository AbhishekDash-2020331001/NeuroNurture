import { HelpCircle, Play, RotateCcw } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from './hooks/use-toast';
import './mirrorPosture.css';
import { Button } from './ui/button';

// Import facial expression images
import kissImg from './assets/kiss.png';
import lookingLeftImg from './assets/looking_left.png';
import lookingRightImg from './assets/looking_right.png';
import mouthOpenImg from './assets/mouth_open.png';
import showingTeethImg from './assets/showing_teeth.png';

import InstructionsModal from './InstructionsModal';
import WebcamCapture from './WebcamCapture';

const FACIAL_EXPRESSIONS = [
  { id: 'mouth_open', name: 'Open Your Mouth!', image: mouthOpenImg, emoji: '😮', description: 'Open your mouth wide like you\'re surprised!' },
  { id: 'showing_teeth', name: 'Show Your Teeth!', image: showingTeethImg, emoji: '😁', description: 'Show your beautiful teeth with a big smile!' },
  { id: 'kiss', name: 'Make a Kiss!', image: kissImg, emoji: '😘', description: 'Pucker your lips like you\'re giving a kiss!' },
  { id: 'looking_left', name: 'Look Left!', image: lookingLeftImg, emoji: '👈', description: 'Turn your head and look to the left!' },
  { id: 'looking_right', name: 'Look Right!', image: lookingRightImg, emoji: '👉', description: 'Turn your head and look to the right!' },
];

const ROUND_DURATION = 15; // seconds

type GameState = 'idle' | 'playing' | 'finished';
type GameScreen = 'instructions' | 'game' | 'loading' | 'countdown';

interface GameStats {
  currentRound: number;
  score: number;
  timeLeft: number;
  detectedExpression: string | null;
}

interface RoundStats {
  roundNumber: number;
  expressionName: string;
  expressionImage: string;
  timeTaken: number;
  completed: boolean;
}

interface GameSession {
  sessionId: string;
  childId: string;
  startTime: Date;
  endTime?: Date;
  rounds: RoundStats[];
  totalScore: number;
}

interface SimplifiedGameStats {
  sessionId: string;
  childId: string;
  expressions: {
    name: string;
    completionTime: number;
    status: 'completed' | 'incomplete';
  }[];
}



const MirrorPostureGame: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>('idle');
  const [currentScreen, setCurrentScreen] = useState<GameScreen>('instructions');
  const [countdown, setCountdown] = useState<number>(5);
  const [isCountdownActive, setIsCountdownActive] = useState<boolean>(false);
  const [gameStats, setGameStats] = useState<GameStats>({
    currentRound: 0,
    score: 0,
    timeLeft: ROUND_DURATION,
    detectedExpression: null,
  });
  const [showInstructions, setShowInstructions] = useState(false);
  const [isWebcamReady, setIsWebcamReady] = useState(false);
  const [isProcessingRound, setIsProcessingRound] = useState(false);
  const [showGameStats, setShowGameStats] = useState(false);
  const [gameSession, setGameSession] = useState<GameSession | null>(null);
  const [roundStartTime, setRoundStartTime] = useState<number>(0);
  const [showCompletionAnimation, setShowCompletionAnimation] = useState(false);
  const [simplifiedStats, setSimplifiedStats] = useState<SimplifiedGameStats | null>(null);
  const [roundCountdown, setRoundCountdown] = useState<number>(2);
  const [isRoundCountdownActive, setIsRoundCountdownActive] = useState<boolean>(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const roundCountdownRef = useRef<NodeJS.Timeout | null>(null);
  const gameRounds = useRef(FACIAL_EXPRESSIONS.slice());

  // Cleanup effect to ensure camera is stopped when component unmounts or screen changes
  useEffect(() => {
    return () => {
      // Ensure timer is cleared
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      // Clear countdown timer
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
      // Clear round countdown timer
      if (roundCountdownRef.current) {
        clearInterval(roundCountdownRef.current);
      }
      // Camera will be stopped by WebcamCapture component when isActive becomes false
    };
  }, []);

  // Start countdown
  const startCountdown = useCallback(() => {
    setIsCountdownActive(true);
    setCountdown(3);
    setCurrentScreen('countdown');
    
    // Initialize camera during countdown
    setIsWebcamReady(false);
    
    countdownRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          // Countdown finished, start the game
          if (countdownRef.current) {
            clearInterval(countdownRef.current);
            countdownRef.current = null;
          }
          setIsCountdownActive(false);
          setCurrentScreen('game');
          // Call startGame directly here
          startGame();
          return 3; // Reset for next time
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  // Start round countdown
  const startRoundCountdown = useCallback(() => {
    setIsRoundCountdownActive(true);
    setRoundCountdown(2);
    
    roundCountdownRef.current = setInterval(() => {
      setRoundCountdown(prev => {
        if (prev <= 1) {
          // Round countdown finished, start the next round
          if (roundCountdownRef.current) {
            clearInterval(roundCountdownRef.current);
            roundCountdownRef.current = null;
          }
          setIsRoundCountdownActive(false);
          startRoundTimer();
          return 2; // Reset for next time
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  // Shuffle expressions for random order
  const shuffleExpressions = useCallback(() => {
    const shuffled = [...FACIAL_EXPRESSIONS].sort(() => Math.random() - 0.5);
    gameRounds.current = shuffled;
  }, []);

  // Create session ID
  const createSessionId = useCallback(() => {
    const childId = localStorage.getItem('selectedChildId') || 'unknown';
    const dateTime = new Date().toISOString().replace(/[:.]/g, '-');
    return `${childId}_${dateTime}`;
  }, []);

  // Create simplified stats object
  const createSimplifiedStats = useCallback((session: GameSession) => {
    const expressions = session.rounds.map(round => ({
      name: round.expressionName,
      completionTime: round.completed ? round.timeTaken : 100,
      status: round.completed ? 'completed' as const : 'incomplete' as const
    }));
    
    return {
      sessionId: session.sessionId,
      childId: session.childId,
      expressions
    };
  }, []);

  // Start game
  const startGame = useCallback(() => {
    console.log('Start game called, isWebcamReady:', isWebcamReady);
    console.log('FACIAL_EXPRESSIONS.length:', FACIAL_EXPRESSIONS.length);
    
    // Clear any existing timers first
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (roundCountdownRef.current) {
      clearInterval(roundCountdownRef.current);
      roundCountdownRef.current = null;
    }
    
    // Reset camera state to allow fresh initialization
    setIsWebcamReady(false);
    setIsProcessingRound(false);
    
    // Shuffle expressions for fresh game
    shuffleExpressions();
    
    // Reset game state
    setGameState('playing');
    setGameStats({
      currentRound: 0,
      score: 0,
      timeLeft: ROUND_DURATION,
      detectedExpression: null,
    });
    
    // Initialize game session
    const sessionId = createSessionId();
    const childId = localStorage.getItem('selectedChildId') || 'unknown';
    const newSession: GameSession = {
      sessionId,
      childId,
      startTime: new Date(),
      rounds: [],
      totalScore: 0
    };
    setGameSession(newSession);
    setRoundStartTime(Date.now());
    
    // Start the first round timer after 1 second delay
    setTimeout(() => {
      startRoundTimer();
    }, 1000);
  }, [shuffleExpressions, createSessionId, createSimplifiedStats]);

  // Start round timer
  const startRoundTimer = useCallback(() => {
    // Clear any existing timer first
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    timerRef.current = setInterval(() => {
      setGameStats(prev => {
        // Don't continue if game is already finished
        if (gameState === 'finished') {
          return prev;
        }
        
        const newTimeLeft = prev.timeLeft - 1;
        
        if (newTimeLeft <= 0) {
          // Time's up for this round
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          
          console.log('Timer check - currentRound:', prev.currentRound, 'FACIAL_EXPRESSIONS.length:', FACIAL_EXPRESSIONS.length);
          console.log('Will end game?', (prev.currentRound + 1 >= FACIAL_EXPRESSIONS.length));
          
          if (prev.currentRound + 1 >= FACIAL_EXPRESSIONS.length) {
            // Game finished - complete session
            // First add the incomplete final round to session
            const currentExpression = gameRounds.current[prev.currentRound];
            if (currentExpression) {
              const roundStats: RoundStats = {
                roundNumber: prev.currentRound + 1,
                expressionName: currentExpression.name,
                expressionImage: currentExpression.image,
                timeTaken: ROUND_DURATION,
                completed: false
              };
              
              console.log('Adding incomplete final round:', roundStats);
              
              setGameSession(currentSession => {
                if (currentSession) {
                  const sessionWithFinalRound = {
                    ...currentSession,
                    rounds: [...currentSession.rounds, roundStats],
                    endTime: new Date()
                  };
                  const stats = createSimplifiedStats(sessionWithFinalRound);
                  setSimplifiedStats(stats);
                  console.log('Simplified Game Stats:', stats);
                  console.log('Final Game Session Rounds:', sessionWithFinalRound.rounds);
                  return sessionWithFinalRound;
                }
                return currentSession;
              });
            }
            setGameState('finished');
            // Show animation after a short delay to avoid lag
            setTimeout(() => {
              setShowCompletionAnimation(true);
            }, 500);
            return prev;
          } else {
            // Add incomplete round to session
            const currentExpression = gameRounds.current[prev.currentRound];
            if (currentExpression) {
              const roundStats: RoundStats = {
                roundNumber: prev.currentRound + 1,
                expressionName: currentExpression.name,
                expressionImage: currentExpression.image,
                timeTaken: ROUND_DURATION,
                completed: false
              };
              
              console.log('Adding incomplete round:', roundStats);
              console.log('Current round index:', prev.currentRound);
              
              setGameSession(currentSession => {
                if (currentSession) {
                  const updatedSession = {
                    ...currentSession,
                    rounds: [...currentSession.rounds, roundStats]
                  };
                  console.log('Updated session rounds count after incomplete:', updatedSession.rounds.length);
                  return updatedSession;
                }
                return currentSession;
              });
            }
            
            // Next round - restart timer after a short delay
            setTimeout(() => {
              startRoundCountdown();
            }, 1000);
            
            return {
              ...prev,
              currentRound: prev.currentRound + 1,
              timeLeft: ROUND_DURATION,
              detectedExpression: null,
            };
          }
        }
        
        return {
          ...prev,
          timeLeft: newTimeLeft,
        };
      });
    }, 1000);
  }, [gameState, createSimplifiedStats]);



  // Handle expression detection
  const handleExpressionDetected = useCallback((expression: string) => {
    if (gameState !== 'playing' || isProcessingRound) return;

    const currentExpression = getCurrentExpression();
    if (!currentExpression) return;

    setGameStats(prev => ({
      ...prev,
      detectedExpression: expression,
    }));

    if (expression === currentExpression.id) {
      // Prevent multiple detections
      setIsProcessingRound(true);
      
      // Calculate time taken for this round
      const timeTaken = ROUND_DURATION - gameStats.timeLeft;
      
      // Update session with round stats
      const roundStats: RoundStats = {
        roundNumber: gameStats.currentRound + 1,
        expressionName: currentExpression.name,
        expressionImage: currentExpression.image,
        timeTaken,
        completed: true
      };
      
      console.log('Adding completed round:', roundStats);
      console.log('Current gameStats.currentRound:', gameStats.currentRound);
      
      setGameSession(prev => {
        if (prev) {
          const updatedSession = {
            ...prev,
            rounds: [...prev.rounds, roundStats],
            totalScore: prev.totalScore + 1
          };
          console.log('Updated session rounds count:', updatedSession.rounds.length);
          return updatedSession;
        }
        return prev;
      });
      
      // Correct expression - stop the timer immediately
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      setGameStats(prev => ({
        ...prev,
        score: prev.score + 1,
      }));

      toast({
        title: "Correct! 🎉",
        description: "Great job! You got it right!",
      });

      // Move to next round after delay
      setTimeout(() => {
        setGameStats(prev => {
          const nextRound = prev.currentRound + 1;
          
                     console.log('Expression detection check - nextRound:', nextRound, 'FACIAL_EXPRESSIONS.length:', FACIAL_EXPRESSIONS.length);
                     if (nextRound >= FACIAL_EXPRESSIONS.length) {
             // Game finished - complete session
             // Use a callback to ensure we have the latest gameSession state
             setGameSession(currentSession => {
               if (currentSession) {
                 const completedSession = {
                   ...currentSession,
                   endTime: new Date()
                 };
                 const stats = createSimplifiedStats(completedSession);
                 setSimplifiedStats(stats);
                 console.log('Simplified Game Stats:', stats);
                 console.log('Final Game Session Rounds:', completedSession.rounds);
                 return completedSession;
               }
               return currentSession;
             });
             setGameState('finished');
             setIsProcessingRound(false);
             // Show animation after a short delay to avoid lag
             setTimeout(() => {
               setShowCompletionAnimation(true);
             }, 500);
             return prev;
           } else {
            // Next round
            setIsProcessingRound(false);
            setRoundStartTime(Date.now());
            return {
              ...prev,
              currentRound: nextRound,
              timeLeft: ROUND_DURATION,
              detectedExpression: null,
            };
          }
        });
        
        // Start timer for next round
        startRoundCountdown();
      }, 2000);
    } else if (expression && expression !== currentExpression.id) {
      // Wrong expression
      toast({
        title: "Try again! 🤔",
        description: "That's not quite right. Keep trying!",
        variant: "destructive",
      });
    }
  }, [gameState, startRoundTimer, isProcessingRound, gameStats.timeLeft, gameStats.currentRound, createSimplifiedStats]);

  // Get current expression
  const getCurrentExpression = () => {
    return gameRounds.current[gameStats.currentRound];
  };

  // Reset game
  const resetGame = useCallback(() => {
    // Clear all timers
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
    if (roundCountdownRef.current) {
      clearInterval(roundCountdownRef.current);
      roundCountdownRef.current = null;
    }
    
    // Reset all state
    setGameState('idle');
    setCurrentScreen('game');
    setCountdown(3);
    setIsCountdownActive(false);
    setRoundCountdown(2);
    setIsRoundCountdownActive(false);
    setGameStats({
      currentRound: 0,
      score: 0,
      timeLeft: ROUND_DURATION,
      detectedExpression: null,
    });
    setShowCompletionAnimation(false);
    setShowGameStats(false);
    setSimplifiedStats(null);
    setIsWebcamReady(false);
    setIsProcessingRound(false);
    setGameSession(null);
    setRoundStartTime(0);
    
    // Reset game rounds
    gameRounds.current = FACIAL_EXPRESSIONS.slice();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Clear timer when game is finished
  useEffect(() => {
    if (gameState === 'finished') {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (roundCountdownRef.current) {
        clearInterval(roundCountdownRef.current);
        roundCountdownRef.current = null;
      }
    }
  }, [gameState]);

  // Auto-hide completion animation after 2 seconds
  useEffect(() => {
    if (showCompletionAnimation) {
      const timer = setTimeout(() => {
        setShowCompletionAnimation(false);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [showCompletionAnimation]);

  const currentExpression = getCurrentExpression();

  // Debug logging
  console.log('MirrorPostureGame state:', {
    currentScreen,
    gameState,
    isWebcamReady,
    currentRound: gameStats.currentRound,
    score: gameStats.score
  });

  // Instructions Screen
  if (currentScreen === 'instructions') {
            return (
            <div className="h-full flex flex-col">
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="text-8xl mb-4 animate-bounce">🎭</div>
              <h1 className="text-5xl font-playful bg-gradient-to-r from-orange-600 via-pink-500 to-purple-600 bg-clip-text text-transparent mb-4">
                Mirror Expression Magic!
              </h1>
              <p className="text-2xl font-comic text-muted-foreground">
                Copy the expressions and become a facial expression wizard! ✨
            </p>
            </div>

            {/* Game Overview */}
            <div className="card-playful border-4 border-primary bg-gradient-to-r from-primary/10 to-secondary/10 p-8 mb-8">
              <h2 className="text-4xl font-playful text-primary mb-6 text-center">
                🎯 What's This Game About?
              </h2>
              <p className="text-xl text-muted-foreground leading-relaxed font-comic text-center">
                Mirror Expression Magic helps you practice making different facial expressions! 
                You'll see a big picture showing how to make a face expression, and then you copy it. 
                It's like playing copycat with your face! 😄
              </p>
            </div>

            {/* How to Play Steps */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="card-playful border-2 border-fun-purple/20 p-6 text-center hover:scale-105 transition-all duration-300">
                <div className="text-6xl mb-4 animate-bounce">1️⃣</div>
                <h4 className="text-2xl font-playful text-primary mb-3">Look at the Picture</h4>
                <p className="text-lg text-muted-foreground font-comic">
                  We'll show you a big, colorful picture of how to make a face expression
                </p>
              </div>

              <div className="card-playful border-2 border-fun-orange/20 p-6 text-center hover:scale-105 transition-all duration-300">
                <div className="text-6xl mb-4 animate-bounce">2️⃣</div>
                <h4 className="text-2xl font-playful text-primary mb-3">Copy the Face</h4>
                <p className="text-lg text-muted-foreground font-comic">
                  Look in the camera and make the same face as the picture!
                </p>
              </div>

              <div className="card-playful border-2 border-fun-green/20 p-6 text-center hover:scale-105 transition-all duration-300">
                <div className="text-6xl mb-4 animate-bounce">3️⃣</div>
                <h4 className="text-2xl font-playful text-primary mb-3">Get Points!</h4>
                <p className="text-lg text-muted-foreground font-comic">
                  When you make the right face, you get a point and hear a happy sound!
                </p>
              </div>

              <div className="card-playful border-2 border-fun-yellow/20 p-6 text-center hover:scale-105 transition-all duration-300">
                <div className="text-6xl mb-4 animate-bounce">4️⃣</div>
                <h4 className="text-2xl font-playful text-primary mb-3">Play 5 Rounds</h4>
                <p className="text-lg text-muted-foreground font-comic">
                  Try to copy 5 different faces. You have 15 seconds for each one!
                </p>
              </div>
            </div>

            {/* Available Expressions */}
            <div className="card-playful border-4 border-primary bg-gradient-to-r from-primary/10 to-secondary/10 p-8 mb-8">
              <h3 className="text-3xl font-playful text-primary mb-6 text-center">Available Expressions:</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {FACIAL_EXPRESSIONS.map((expression, index) => (
                  <div key={index} className="card-playful border-2 border-fun-purple/20 p-4 text-center hover:scale-105 transition-all duration-300 group">
                    <div className="text-4xl mb-3 group-hover:animate-bounce">{expression.emoji}</div>
                    <img 
                      src={expression.image} 
                      alt={expression.name}
                      className="w-16 h-16 mx-auto mb-3 rounded-lg border-2 border-primary shadow-lg"
                    />
                    <div className="text-lg font-playful text-primary mb-2">{expression.name}</div>
                    <div className="text-sm text-muted-foreground font-comic">{expression.description}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Start Button */}
            <div className="text-center">
              <button
                onClick={() => {
                  setCurrentScreen('countdown');
                  // Start countdown instead of directly starting game
                  startCountdown();
                }}
                className="btn-fun font-comic text-2xl py-4 px-8 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white border-4 border-orange-300 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110"
              >
                🚀 Start the Magic! 🚀
              </button>
              {!isWebcamReady && (
                <p className="text-sm text-muted-foreground mt-2 font-comic">
                  Camera will be activated when you start the game 📹
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Countdown Screen
  if (currentScreen === 'countdown') {
    return (
      <div className="h-full flex flex-col relative overflow-hidden">
        {/* Animated background */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-yellow-300 rounded-full animate-ping opacity-60"></div>
          <div className="absolute top-3/4 right-1/4 w-2 h-2 bg-pink-300 rounded-full animate-ping opacity-60" style={{animationDelay: '0.5s'}}></div>
          <div className="absolute bottom-1/4 left-1/3 w-2 h-2 bg-blue-300 rounded-full animate-ping opacity-60" style={{animationDelay: '1s'}}></div>
          <div className="absolute top-1/2 right-1/3 w-2 h-2 bg-green-300 rounded-full animate-ping opacity-60" style={{animationDelay: '1.5s'}}></div>
        </div>

        {/* Hidden camera component for initialization */}
        <div className="absolute top-0 left-0 w-1 h-1 overflow-hidden opacity-0">
          <WebcamCapture 
            onCameraReady={setIsWebcamReady}
            onExpressionDetected={() => {}} // No detection during countdown
            isActive={true}
            detectedExpression={null}
          />
        </div>

        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            {/* Main Countdown Display */}
            <div className="mb-8">
              <div className="text-8xl mb-6 animate-bounce">🎭</div>
              <h1 className="text-6xl font-playful bg-gradient-to-r from-orange-600 via-pink-500 to-purple-600 bg-clip-text text-transparent mb-4">
                Get Ready!
              </h1>
              <p className="text-2xl font-comic text-muted-foreground mb-8">
                Camera is setting up... 📹
              </p>
            </div>

            {/* Fascinating Countdown Number */}
            <div className="relative">
              {/* Background Circle */}
              <div className="w-48 h-48 mx-auto mb-8 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-pink-500 rounded-full animate-pulse"></div>
                <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
                  <div className="text-center">
                    <div className={`text-8xl font-bold ${countdown <= 3 ? 'text-red-500 animate-pulse' : 'text-primary'}`}>
                      {countdown}
                    </div>
                    <div className="text-xl font-comic text-muted-foreground">
                      {countdown === 3 && 'Starting...'}
                      {countdown === 2 && 'Almost ready...'}
                      {countdown === 1 && 'Go!'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute top-0 left-1/4 text-4xl animate-bounce">✨</div>
              <div className="absolute top-0 right-1/4 text-4xl animate-bounce" style={{animationDelay: '0.5s'}}>🌟</div>
              <div className="absolute bottom-0 left-1/3 text-4xl animate-bounce" style={{animationDelay: '1s'}}>💫</div>
              <div className="absolute bottom-0 right-1/3 text-4xl animate-bounce" style={{animationDelay: '1.5s'}}>🎪</div>
            </div>

            {/* Progress Bar */}
            <div className="w-64 h-4 bg-gray-200 rounded-full mx-auto mb-8 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-orange-500 to-pink-500 rounded-full transition-all duration-1000 ease-linear"
                style={{ width: `${((3 - countdown) / 3) * 100}%` }}
              ></div>
            </div>

            {/* Encouraging Messages */}
            <div className="text-lg font-comic text-muted-foreground">
              {countdown === 3 && '🎯 Camera is warming up...'}
              {countdown === 2 && '📹 Getting your camera ready...'}
              {countdown === 1 && '🚀 Let the magic begin!'}
            </div>
          </div>
        </div>
      </div>
    )
  }

                       // Game Screen
     return (
       <div className="h-full flex flex-col relative">
                                       {/* Main Content - Centered with Top Padding */}
          <div className="flex-1 flex items-center justify-center pt-8">
            <div className="flex gap-20 items-start">
              {/* Camera Box */}
              <div className="relative w-[30rem] h-[26rem]">
                <div className="w-full h-[24rem] mb-2">
                  <WebcamCapture 
                    onCameraReady={setIsWebcamReady}
                    onExpressionDetected={handleExpressionDetected}
                    isActive={gameState === 'playing' || isCountdownActive}
                    detectedExpression={gameStats.detectedExpression}
                  />
                  {!isWebcamReady && (
                    <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl">
                      <div className="text-center">
                        <div className="text-6xl mb-4 animate-bounce">📹</div>
                        <p className="text-2xl font-playful text-primary">Camera not active</p>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Detected Expression Display - Single Row */}
                {gameStats.detectedExpression && gameState === 'playing' && (
                  <div className="card-playful border-2 border-secondary p-2 text-center">
                    <div className="text-sm font-playful text-primary">
                      Detected: {gameStats.detectedExpression === 'looking_left' && 'Looking Left 👈'}
                      {gameStats.detectedExpression === 'looking_right' && 'Looking Right 👉'}
                      {gameStats.detectedExpression === 'mouth_open' && 'Mouth Open 😮'}
                      {gameStats.detectedExpression === 'showing_teeth' && 'Showing Teeth 😁'}
                      {gameStats.detectedExpression === 'kiss' && 'Kiss 😘'}
                    </div>
                  </div>
                )}
              </div>

              {/* Circular Timer - Between Boxes */}
              {gameState === 'playing' && (
                <div className="flex flex-col items-center justify-center">
                  <div className="relative w-24 h-24">
                    {/* Background Circle */}
                    <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        className="text-gray-200"
                      />
                      {/* Progress Circle */}
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        strokeLinecap="round"
                        className={`${gameStats.timeLeft <= 3 ? "text-red-500" : "text-green-500"} transition-all duration-1000 ease-linear`}
                        style={{
                          strokeDasharray: `${2 * Math.PI * 40}`,
                          strokeDashoffset: `${2 * Math.PI * 40 * (1 - gameStats.timeLeft / ROUND_DURATION)}`
                        }}
                      />
                    </svg>
                    {/* Timer Text */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className={`text-lg font-bold ${gameStats.timeLeft <= 3 ? "text-red-500" : "text-primary"}`}>
                          {gameStats.timeLeft}s
                        </div>
                        <div className="text-xs text-muted-foreground font-comic">Time</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Reference Image Box */}
              <div className="w-[30rem] h-[26rem]">
               {gameState === 'idle' && (
                 <div className="card-playful border-4 border-primary bg-gradient-to-r from-primary/10 to-secondary/10 p-6 text-center w-full h-full flex flex-col justify-center">
                   <h2 className="text-3xl font-playful text-primary mb-4">
                     🎯 Ready to Play?
                   </h2>
                   <p className="text-lg text-muted-foreground mb-6 leading-relaxed font-comic">
                     Copy the facial expressions shown on the screen! You'll have 5 rounds to make the correct face within 15 seconds each.
                   </p>

                   <div className="flex flex-col gap-4">
                                           <Button 
                        onClick={startGame} 
                        className="btn-fun font-comic text-xl py-3 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white border-2 border-orange-300 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                      >
                        <Play className="w-6 h-6 mr-2" />
                        Start Game
                      </Button>
                    
                     <Button
                       onClick={() => setCurrentScreen('instructions')}
                       className="btn-fun font-comic text-lg py-2 bg-secondary hover:bg-secondary/80"
                     >
                       <HelpCircle className="w-5 h-5 mr-2" />
                       Show Instructions Again
                     </Button>
                   </div>
                 </div>
               )}

                               {gameState === 'playing' && currentExpression && (
                   <div className="card-playful border-4 border-primary bg-gradient-to-r from-primary/20 to-secondary/20 p-6 text-center w-full h-full flex flex-col justify-center">
                     {isRoundCountdownActive ? (
                       <>
                         <h3 className="text-2xl font-playful text-primary mb-4">Get Ready!</h3>
                         <div className="text-6xl mb-4 animate-bounce">🎯</div>
                         <p className="text-lg text-muted-foreground font-comic mb-6">
                           Next expression coming in {roundCountdown} seconds...
                         </p>
                         
                         {/* Countdown Circle inside the reference box */}
                         <div className="flex justify-center">
                           <div className="relative w-32 h-32">
                             {/* Background Circle */}
                             <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                               <circle
                                 cx="50"
                                 cy="50"
                                 r="40"
                                 stroke="currentColor"
                                 strokeWidth="8"
                                 fill="none"
                                 className="text-gray-200"
                               />
                               {/* Progress Circle */}
                               <circle
                                 cx="50"
                                 cy="50"
                                 r="40"
                                 stroke="currentColor"
                                 strokeWidth="8"
                                 fill="none"
                                 strokeLinecap="round"
                                 className="text-orange-500 transition-all duration-1000 ease-linear"
                                 style={{
                                   strokeDasharray: `${2 * Math.PI * 40}`,
                                   strokeDashoffset: `${2 * Math.PI * 40 * (1 - roundCountdown / 2)}`
                                 }}
                               />
                             </svg>
                             {/* Countdown Text */}
                             <div className="absolute inset-0 flex items-center justify-center">
                               <div className="text-center">
                                 <div className="text-2xl font-bold text-orange-500">
                                   {roundCountdown}s
                                 </div>
                                 <div className="text-xs text-muted-foreground font-comic">Next Round</div>
                               </div>
                             </div>
                           </div>
                         </div>
                       </>
                     ) : (
                       <>
                         <h3 className="text-2xl font-playful text-primary mb-4">Make this expression:</h3>
                         <div className="text-2xl font-playful text-primary mb-3">{currentExpression.name}</div>
                         <img 
                           src={currentExpression.image} 
                           alt={currentExpression.name}
                           className="w-52 h-52 mx-auto rounded-xl border-4 border-primary shadow-2xl mb-4"
                         />
                         <div className="text-lg text-muted-foreground font-comic">
                           {currentExpression.description}
                         </div>
                       </>
                     )}
                   </div>
                 )}

                               {gameState === 'finished' && (
                  <div className="card-playful border-4 border-primary bg-gradient-to-r from-primary/10 to-secondary/10 p-6 text-center w-full h-full flex flex-col justify-center">
                    <h2 className="text-3xl font-playful text-primary mb-4">
                      🏆 Game Finished!
                    </h2>
                    <div className="mb-6">
                      <div className="text-6xl mb-4 animate-bounce">🎉</div>
                      <div className="text-2xl font-playful text-primary mb-3">Final Score: {gameStats.score}/5</div>
                      <div className="text-lg text-muted-foreground font-comic">
                        {gameStats.score === 5 ? "Perfect! You're an expression master! 🌟" : 
                         gameStats.score >= 3 ? "Great job! You're getting better! 👍" : 
                         "Keep practicing! You'll improve! 💪"}
                      </div>
                    </div>

                                         <div className="flex flex-col gap-3">
                       <Button 
                         onClick={() => setShowGameStats(true)} 
                         className="btn-fun font-comic text-xl py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white border-2 border-purple-300 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                       >
                         📊 View Detailed Stats
                       </Button>
                       
                       <Button onClick={resetGame} className="btn-fun font-comic text-xl py-3 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white border-2 border-orange-300 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                         <RotateCcw className="w-6 h-6 mr-2" />
                         Play Again
                       </Button>
                       
                       <Button
                         onClick={() => setCurrentScreen('instructions')}
                         className="btn-fun font-comic text-lg py-2 bg-secondary hover:bg-secondary/80"
                       >
                         <HelpCircle className="w-5 h-5 mr-2" />
                         Back to Instructions
                       </Button>
                     </div>
                  </div>
                )}
             </div>
           </div>
         </div>

             <InstructionsModal 
         open={showInstructions} 
         onOpenChange={setShowInstructions} 
       />

       {/* Game Stats Modal */}
       {showGameStats && gameSession && (
         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
           <div className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[85vh] overflow-y-auto relative">
             <div className="text-center mb-6 sticky top-0 bg-white pb-4 border-b border-gray-200">
               <h2 className="text-3xl font-playful text-primary mb-2">📊 Game Statistics</h2>
               <p className="text-muted-foreground font-comic">Session ID: {gameSession.sessionId}</p>
               <p className="text-muted-foreground font-comic">
                 Total Score: {gameSession.totalScore}/5 | 
                 Duration: {gameSession.endTime ? Math.round((gameSession.endTime.getTime() - gameSession.startTime.getTime()) / 1000) : 0}s
               </p>
             </div>

             <div className="overflow-x-auto">
               <table className="w-full border-collapse">
                 <thead className="sticky top-0 bg-white">
                   <tr className="bg-gradient-to-r from-primary/10 to-secondary/10">
                     <th className="border border-primary p-3 text-left font-playful text-primary">Round</th>
                     <th className="border border-primary p-3 text-left font-playful text-primary">Expression</th>
                     <th className="border border-primary p-3 text-left font-playful text-primary">Reference</th>
                     <th className="border border-primary p-3 text-left font-playful text-primary">Time Taken</th>
                     <th className="border border-primary p-3 text-left font-playful text-primary">Status</th>
                   </tr>
                 </thead>
                 <tbody>
                   {gameSession.rounds.map((round, index) => (
                     <tr key={index} className="hover:bg-gray-50 transition-colors">
                       <td className="border border-primary p-3 font-bold text-primary">{round.roundNumber}</td>
                       <td className="border border-primary p-3 font-comic">{round.expressionName}</td>
                       <td className="border border-primary p-3">
                         <img 
                           src={round.expressionImage} 
                           alt={round.expressionName}
                           className="w-12 h-12 rounded-lg border-2 border-primary"
                         />
                       </td>
                       <td className="border border-primary p-3 font-comic">
                         {round.completed ? `${round.timeTaken}s` : 'Not completed'}
                       </td>
                       <td className="border border-primary p-3">
                         <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                           round.completed 
                             ? 'bg-green-100 text-green-800' 
                             : 'bg-red-100 text-red-800'
                         }`}>
                           {round.completed ? '✅ Completed' : '❌ Failed'}
                         </span>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>

             <div className="flex justify-center gap-4 mt-6 sticky bottom-0 bg-white pt-4 border-t border-gray-200">
               <Button 
                 onClick={() => setShowGameStats(false)}
                 className="btn-fun font-comic text-lg py-2 bg-secondary hover:bg-secondary/80"
               >
                 Close Stats
               </Button>
             </div>
           </div>
         </div>
       )}

       {/* Game Completion Animation */}
       {showCompletionAnimation && (
         <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] overflow-hidden">
           {/* Quick Celebration Burst */}
           <div className="text-center text-white relative z-10">
             {/* Main Celebration Element */}
             <div className="mb-4 animate-bounce">
               <div className="text-8xl mb-2 animate-pulse">🎉</div>
               <div className="text-6xl mb-2 animate-spin" style={{animationDuration: '1s'}}>🏆</div>
               <div className="text-5xl animate-bounce" style={{animationDelay: '0.3s'}}>🌟</div>
             </div>
             
             {/* Quick Score Display */}
             <div className="mb-4">
               <h2 className="text-3xl font-playful mb-2 bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                 Game Complete!
               </h2>
               <div className="text-2xl font-playful mb-1">
                 Score: {gameStats.score}/5
               </div>
               <div className="text-lg font-comic">
                 {gameStats.score === 5 ? "Perfect! 🌟" : 
                  gameStats.score >= 3 ? "Great job! 👍" : 
                  "Keep practicing! 💪"}
               </div>
             </div>
             
             {/* Quick Confetti Burst */}
             <div className="absolute inset-0 pointer-events-none">
               {[...Array(20)].map((_, i) => (
                 <div
                   key={`confetti-${i}`}
                   className="absolute animate-bounce"
                   style={{
                     left: `${Math.random() * 100}%`,
                     top: `${Math.random() * 100}%`,
                     animationDelay: `${Math.random() * 0.5}s`,
                     animationDuration: `${0.8 + Math.random() * 0.4}s`,
                     fontSize: `${12 + Math.random() * 16}px`
                   }}
                 >
                   {['🎊', '🎈', '🎉', '⭐', '✨'][Math.floor(Math.random() * 5)]}
                 </div>
               ))}
             </div>
           </div>
         </div>
       )}
     </div>
   );
 };

export default MirrorPostureGame; 