import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { HelpCircle, Play } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import '../styles/mirrorPosture.css';

import ConsentScreen from './ConsentScreen';
import EnhancedGameStats from './EnhancedGameStats';
import InstructionsModal from './InstructionsModal';
import WebcamCapture from './WebcamCapture';

const FACIAL_EXPRESSIONS = [
  { id: 'mouth_open', name: 'Open Your Mouth!', image: '/mirror_posture_images/mouth_open.jpg', emoji: '😮', description: 'Open your mouth wide like you\'re surprised!' },
  { id: 'showing_teeth', name: 'Show Your Teeth!', image: '/mirror_posture_images/showing_teeth.jpg', emoji: '😁', description: 'Show your beautiful teeth with a big smile!' },
  { id: 'kiss', name: 'Make a Kiss!', image: '/mirror_posture_images/kiss.jpg', emoji: '😘', description: 'Pucker your lips like you\'re giving a kiss!' },
  { id: 'looking_sideways', name: 'Look Sideways!', image: '/mirror_posture_images/looking_left.jpg', emoji: '👀', description: 'Turn your head and look to either side!' },
];

const ROUND_DURATION = 15; // seconds

type GameState = 'idle' | 'playing' | 'finished';
type GameScreen = 'instructions' | 'consent' | 'game' | 'loading' | 'countdown';

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
  consentData?: ConsentData;
}

interface SimplifiedGameStats {
  sessionId: string;
  childId: string;
  expressions: {
    name: string;
    completionTime: number;
    status: 'completed' | 'incomplete';
  }[];
  consentData?: ConsentData;
}

interface ConsentData {
  childName: string;
  childAge: string;
  suspectedASD: boolean;
  dataConsent: boolean;
}



interface MirrorPostureGameProps {
  taskId?: string | null;
  tournamentId?: string | null;
}

const MirrorPostureGame: React.FC<MirrorPostureGameProps> = ({ taskId, tournamentId }) => {
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
  const [consentData, setConsentData] = useState<ConsentData | null>(null);
  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  const [showSuccessSticker, setShowSuccessSticker] = useState<boolean>(false);
  
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
  const startCountdown = useCallback((consentDataForGame?: ConsentData) => {
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
          // Call startGame with the consent data
          startGame(consentDataForGame);
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
      expressions,
      consentData: session.consentData
    };
  }, []);

  // Start game
  const startGame = useCallback((consentDataForGame?: ConsentData) => {
    console.log('Start game called, isWebcamReady:', isWebcamReady);
    console.log('FACIAL_EXPRESSIONS.length:', FACIAL_EXPRESSIONS.length);
    console.log('Current consentData state:', consentData);
    console.log('ConsentData type:', typeof consentData);
    console.log('ConsentData dataConsent value:', consentData?.dataConsent);
    console.log('ConsentData passed to startGame:', consentDataForGame);
    
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
      totalScore: 0,
      consentData: consentDataForGame || consentData || undefined
    };
    console.log('Creating game session with consentData:', consentData);
    console.log('ConsentData passed to startGame:', consentDataForGame);
    console.log('Game session consentData.dataConsent:', newSession.consentData?.dataConsent);
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
                   
                   // Save game data to backend
                   saveGameDataToBackend(sessionWithFinalRound);
                   
                   return sessionWithFinalRound;
                 }
                 return currentSession;
               });
             }
             setGameState('finished');
             // Trigger confetti
             setShowConfetti(true);
             setTimeout(() => {
               setShowConfetti(false);
             }, 3000);
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

    // Check if the detected expression matches the current expression
    // For looking_sideways, accept both looking_left and looking_right
    const isCorrectExpression = expression === currentExpression.id || 
      (currentExpression.id === 'looking_sideways' && (expression === 'looking_left' || expression === 'looking_right'));
    
    if (isCorrectExpression) {
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

      // Show success sticker
      setShowSuccessSticker(true);
      
      toast({
        title: "Correct! 🎉",
        description: "Great job! You got it right!",
      });

      // Hide success sticker after 2 seconds
      setTimeout(() => {
        setShowSuccessSticker(false);
      }, 2000);

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
                 
                 // Save game data to backend
                 saveGameDataToBackend(completedSession);
                 
                 return completedSession;
               }
               return currentSession;
             });
             setGameState('finished');
             setIsProcessingRound(false);
             // Trigger confetti
             setShowConfetti(true);
             setTimeout(() => {
               setShowConfetti(false);
             }, 3000);
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

  // Save game data to backend
  const saveGameDataToBackend = useCallback(async (gameSession: GameSession) => {
    try {
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
      
      // Calculate age from date of birth
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

      // Prepare posture completion times
      const postureTimes = {
        lookingSideways: null,
        mouthOpen: null,
        showingTeeth: null,
        kiss: null
      };

             // Map posture names to completion times
       gameSession.rounds.forEach(round => {
         const postureName = round.expressionName.toLowerCase().replace(/\s+/g, '');
         console.log('Mapping posture:', round.expressionName, 'to lowercase:', postureName);
         
         if (postureName.includes('looksideways')) {
           // For looking_sideways, map to the new lookingSideways field
           postureTimes.lookingSideways = round.completed ? round.timeTaken : null;
           console.log('Mapped to lookingSideways:', round.timeTaken);
         } else if (postureName.includes('openyourmouth')) {
           postureTimes.mouthOpen = round.completed ? round.timeTaken : null;
           console.log('Mapped to mouthOpen:', round.timeTaken);
         } else if (postureName.includes('showyourteeth')) {
           postureTimes.showingTeeth = round.completed ? round.timeTaken : null;
           console.log('Mapped to showingTeeth:', round.timeTaken);
         } else if (postureName.includes('makeakiss')) {
           postureTimes.kiss = round.completed ? round.timeTaken : null;
           console.log('Mapped to kiss:', round.timeTaken);
         } else {
           console.log('No mapping found for:', round.expressionName);
         }
       });

             const requestData = {
         sessionId: gameSession.sessionId,
         dateTime: gameSession.startTime,
         childId: childData?.id?.toString() || '1',
         age: gameSession.consentData?.childAge ? parseInt(gameSession.consentData.childAge) : (childData?.dateOfBirth ? calculateAge(childData.dateOfBirth) : 8),
         schoolTaskId: taskId, // Include school task ID if available
         tournamentId: tournamentId, // Include tournament ID if available
         ...postureTimes,
         videoURL: "https://example.com/dummy-video.mp4", // Dummy URL for now
         isTrainingAllowed: gameSession.consentData?.dataConsent === true,
         suspectedASD: gameSession.consentData?.suspectedASD || false,
         isASD: null // Will be populated by ML model later
       };

             console.log('Consent data:', gameSession.consentData);
       console.log('Data consent value:', gameSession.consentData?.dataConsent);
       console.log('Saving game data to backend:', requestData);

      const response = await fetch('http://localhost:8083/api/mirror-posture-game/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      if (response.ok) {
        const savedData = await response.json();
        console.log('Game data saved successfully:', savedData);
        toast({
          title: "Data Saved! 📊",
          description: "Game statistics have been saved to the database.",
        });
      } else {
        console.error('Failed to save game data:', response.statusText);
        toast({
          title: "Save Failed! ❌",
          description: "Failed to save game data to database.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error saving game data:', error);
      toast({
        title: "Save Error! ❌",
        description: "An error occurred while saving game data.",
        variant: "destructive",
      });
    }
  }, []);

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

  // Consent Screen
  if (currentScreen === 'consent') {
    return (
      <ConsentScreen
        onConsentSubmit={(data) => {
          console.log('Consent submitted with data:', data);
          setConsentData(data);
          setCurrentScreen('countdown');
          startCountdown(data);
        }}
        onBack={() => setCurrentScreen('instructions')}
      />
    );
  }

  // Instructions Screen
  if (currentScreen === 'instructions') {
            return (
            <div className="h-full flex flex-col">
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
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
                <h4 className="text-2xl font-playful text-primary mb-3">Play 4 Rounds</h4>
                <p className="text-lg text-muted-foreground font-comic">
                  Try to copy 4 different faces. You have 15 seconds for each one!
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
                  setCurrentScreen('consent');
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
          {/* Round Information - Top */}
          {gameState === 'playing' && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
              <div className="bg-white/90 backdrop-blur-sm rounded-full px-6 py-2 shadow-lg border-2 border-primary">
                <span className="text-lg font-playful text-primary">
                  Round {gameStats.currentRound + 1} of 4
                </span>
              </div>
            </div>
          )}

          {/* Timer - Top Right */}
          {gameState === 'playing' && (
            <div className="absolute top-4 right-4 z-10">
              <div className="bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg border-2 border-primary">
                <div className="text-center">
                  <div className={`text-lg font-bold ${gameStats.timeLeft <= 3 ? "text-red-500" : "text-primary"}`}>
                    {gameStats.timeLeft}s
                  </div>
                  <div className="text-xs text-muted-foreground font-comic">Time</div>
                </div>
              </div>
            </div>
          )}

          {/* Main Content - Centered */}
          <div className="flex-1 flex items-center justify-center">
            <div className="flex gap-8 items-center">
              {/* Camera */}
              <div className="relative w-[30rem] h-[26rem]">
                {gameState !== 'finished' ? (
                  <>
                    <div className="w-full h-[24rem] mb-2 relative">
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
                      
                      {/* Success Sticker Overlay */}
                      {showSuccessSticker && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                          <div className="animate-bounce">
                            <div className="bg-gradient-to-r from-green-400 to-emerald-500 rounded-full p-6 shadow-2xl border-4 border-white">
                              <div className="text-6xl animate-pulse">🎉</div>
                            </div>
                            <div className="text-center mt-4">
                              <div className="bg-white/90 backdrop-blur-sm rounded-full px-6 py-2 shadow-lg border-2 border-green-400">
                                <span className="text-2xl font-bold text-green-600 animate-pulse">
                                  SUCCESS! ✨
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  // Game completion screen
                  <div className="w-full h-full bg-gradient-to-br from-orange-600 via-pink-500 to-purple-600 rounded-2xl shadow-2xl border-4 border-primary relative overflow-hidden">
                    {/* Animated background elements */}
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute top-4 left-4 w-16 h-16 bg-yellow-300/30 rounded-full animate-pulse"></div>
                      <div className="absolute top-8 right-6 w-12 h-12 bg-blue-300/30 rounded-full animate-bounce" style={{animationDelay: '0.5s'}}></div>
                      <div className="absolute bottom-6 left-6 w-10 h-10 bg-green-300/30 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
                      <div className="absolute bottom-8 right-4 w-14 h-14 bg-pink-300/30 rounded-full animate-bounce" style={{animationDelay: '1.5s'}}></div>
                      <div className="absolute top-1/2 left-1/3 w-8 h-8 bg-orange-300/30 rounded-full animate-spin" style={{animationDuration: '3s'}}></div>
                      <div className="absolute top-1/4 right-1/4 w-6 h-6 bg-cyan-300/30 rounded-full animate-pulse" style={{animationDelay: '0.8s'}}></div>
                    </div>
                    
                    {/* Main content */}
                    <div className="relative z-10 w-full h-full flex flex-col items-center justify-center text-white p-4">
                      <h2 className="text-3xl font-playful mb-3 text-center drop-shadow-2xl">
                        🏆 Game Finished!
                      </h2>
                      
                      <div className="text-6xl mb-3 animate-bounce drop-shadow-2xl">🎉</div>
                      
                      <div className="text-2xl font-playful mb-2 text-center drop-shadow-lg">
                        Final Score: {gameStats.score}/4
                      </div>
                      
                      <div className="text-lg font-comic mb-2 text-center drop-shadow-md">
                        {gameStats.score === 4 ? "Perfect! You're an expression master! 🌟" : 
                         gameStats.score >= 3 ? "Great job! You're getting better! 👍" : 
                         "Keep practicing! You'll improve! 💪"}
                      </div>
                      
                      <div className="text-xs font-comic text-center opacity-90 drop-shadow-sm mb-3">
                        {gameStats.score === 4 ? "Incredible performance! You've mastered all expressions!" :
                         gameStats.score >= 3 ? "Excellent work! You're on your way to becoming an expression expert!" :
                         "Good effort! Every practice session makes you stronger!"}
                      </div>
                      
                      {/* Achievement badges */}
                      <div className="flex gap-2 flex-wrap justify-center">
                        {gameStats.score === 4 && (
                          <div className="bg-yellow-400/80 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold animate-pulse">
                            🏅 Perfect
                          </div>
                        )}
                        {gameStats.score >= 3 && (
                          <div className="bg-blue-400/80 text-blue-900 px-2 py-1 rounded-full text-xs font-bold">
                            ⭐ Great
                          </div>
                        )}
                        {gameStats.score >= 2 && (
                          <div className="bg-green-400/80 text-green-900 px-2 py-1 rounded-full text-xs font-bold">
                            🎯 Good
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Reference Image */}
              <div className="w-[30rem] h-[26rem]">
                {gameState === 'idle' && (
                  <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-8 text-center w-full h-full flex flex-col justify-center border-2 border-primary">
                    <h2 className="text-3xl font-playful text-primary mb-4">
                      🎯 Ready to Play?
                    </h2>
                    <p className="text-lg text-muted-foreground mb-6 leading-relaxed font-comic">
                      Copy the facial expressions shown on the screen! You'll have 4 rounds to make the correct face within 15 seconds each.
                    </p>

                    <div className="flex flex-col gap-4">
                      <Button 
                        onClick={() => startGame()} 
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
                  <div className="relative w-full h-full">
                    {isRoundCountdownActive ? (
                      <div className="bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl p-6 text-center w-full h-full flex flex-col justify-center border-2 border-primary">
                        <h3 className="text-2xl font-playful text-primary mb-4">Get Ready!</h3>
                        <div className="text-6xl mb-4 animate-bounce">🎯</div>
                        <p className="text-lg text-muted-foreground font-comic mb-6">
                          Next expression coming in {roundCountdown} seconds...
                        </p>
                        
                        {/* Countdown Circle */}
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
                      </div>
                    ) : (
                      <img 
                        src={currentExpression.image} 
                        alt={currentExpression.name}
                        className="w-full h-full object-contain rounded-2xl border-2 border-primary shadow-2xl"
                      />
                    )}
                  </div>
                )}

                {gameState === 'finished' && (
                  <div className="bg-gradient-to-br from-primary/5 via-secondary/10 to-purple-500/5 rounded-2xl p-8 text-center w-full h-full flex flex-col justify-center relative overflow-hidden border-2 border-primary">
                    {/* Animated background elements */}
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute top-4 left-4 w-16 h-16 bg-yellow-400/20 rounded-full animate-pulse"></div>
                      <div className="absolute top-8 right-8 w-12 h-12 bg-blue-400/20 rounded-full animate-bounce" style={{animationDelay: '0.5s'}}></div>
                      <div className="absolute bottom-6 left-8 w-10 h-10 bg-green-400/20 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
                      <div className="absolute bottom-8 right-4 w-14 h-14 bg-pink-400/20 rounded-full animate-bounce" style={{animationDelay: '1.5s'}}></div>
                    </div>
                    
                    {/* Main content - Buttons only */}
                    <div className="relative z-10">
                      <h2 className="text-4xl font-playful text-primary mb-8 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                        🎮 What's Next?
                      </h2>
                      
                      {/* Button container with improved layout */}
                      <div className="flex flex-col gap-4 max-w-sm mx-auto">
                        <Button 
                          onClick={() => setShowGameStats(true)} 
                          className="btn-fun font-comic text-lg py-4 bg-gradient-to-r from-purple-500 via-blue-500 to-purple-600 hover:from-purple-600 hover:via-blue-600 hover:to-purple-700 text-white border-2 border-purple-300 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 transform hover:-translate-y-1"
                        >
                          📊 View Detailed Stats
                        </Button>
                        
                        <Button 
                          onClick={resetGame} 
                          className="btn-fun font-comic text-lg py-4 bg-gradient-to-r from-orange-500 via-pink-500 to-orange-600 hover:from-orange-600 hover:via-pink-600 hover:to-orange-700 text-white border-2 border-orange-300 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 transform hover:-translate-y-1"
                        >
                          🔄 Play Again
                        </Button>
                        
                        <Button
                          onClick={() => {
                            resetGame();
                            setCurrentScreen('instructions');
                          }}
                          className="btn-fun font-comic text-base py-3 bg-gradient-to-r from-secondary to-secondary/80 hover:from-secondary/90 hover:to-secondary text-white border-2 border-secondary/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 transform hover:-translate-y-1"
                        >
                          📖 Back to Instructions
                        </Button>
                      </div>
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
         <EnhancedGameStats 
           gameSession={gameSession} 
           onClose={() => setShowGameStats(false)} 
         />
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
                 Score: {gameStats.score}/4
               </div>
               <div className="text-lg font-comic">
                 {gameStats.score === 4 ? "Perfect! 🌟" : 
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

       {/* Confetti Overlay */}
       {showConfetti && (
         <div className="fixed inset-0 z-50 pointer-events-none">
           {/* Confetti pieces */}
           {[...Array(50)].map((_, i) => (
             <div
               key={i}
               className={`absolute w-2 h-2 animate-bounce ${
                 ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500'][i % 6]
               }`}
               style={{
                 left: `${Math.random() * 100}%`,
                 top: `${Math.random() * 100}%`,
                 animationDelay: `${Math.random() * 2}s`,
                 animationDuration: `${1 + Math.random() * 2}s`
               }}
             />
           ))}
           {/* Sparkles */}
           {[...Array(30)].map((_, i) => (
             <div
               key={`sparkle-${i}`}
               className="absolute w-1 h-1 bg-yellow-300 animate-pulse"
               style={{
                 left: `${Math.random() * 100}%`,
                 top: `${Math.random() * 100}%`,
                 animationDelay: `${Math.random() * 1}s`,
                 animationDuration: `${0.5 + Math.random() * 1}s`
               }}
             />
           ))}
         </div>
       )}
     </div>
   );
 };

export default MirrorPostureGame; 