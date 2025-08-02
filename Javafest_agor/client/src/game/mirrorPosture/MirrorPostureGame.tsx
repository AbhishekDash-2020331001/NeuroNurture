import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Play, Camera, Trophy, HelpCircle, RotateCcw } from 'lucide-react';
import { toast } from './hooks/use-toast';
import './mirrorPosture.css';

// Import facial expression images
import mouthOpenImg from './assets/mouth_open.png';
import showingTeethImg from './assets/showing_teeth.png';
import kissImg from './assets/kiss.png';
import lookingLeftImg from './assets/looking_left.png';
import lookingRightImg from './assets/looking_right.png';

import InstructionsModal from './InstructionsModal';
import WebcamCapture from './WebcamCapture';

const FACIAL_EXPRESSIONS = [
  { id: 'mouth_open', name: 'Open Your Mouth!', image: mouthOpenImg, emoji: '😮' },
  { id: 'showing_teeth', name: 'Show Your Teeth!', image: showingTeethImg, emoji: '😁' },
  { id: 'kiss', name: 'Make a Kiss!', image: kissImg, emoji: '😘' },
  { id: 'looking_left', name: 'Look Left!', image: lookingLeftImg, emoji: '👈' },
  { id: 'looking_right', name: 'Look Right!', image: lookingRightImg, emoji: '👉' },
];

const ROUND_DURATION = 15; // seconds

type GameState = 'idle' | 'playing' | 'finished';

interface GameStats {
  currentRound: number;
  score: number;
  timeLeft: number;
  detectedExpression: string | null;
}

const MirrorPostureGame: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>('idle');
  const [gameStats, setGameStats] = useState<GameStats>({
    currentRound: 0,
    score: 0,
    timeLeft: ROUND_DURATION,
    detectedExpression: null,
  });
  const [showInstructions, setShowInstructions] = useState(false);
  const [isWebcamReady, setIsWebcamReady] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const gameRounds = useRef(FACIAL_EXPRESSIONS.slice());

  // Shuffle expressions for random order
  const shuffleExpressions = useCallback(() => {
    const shuffled = [...FACIAL_EXPRESSIONS].sort(() => Math.random() - 0.5);
    gameRounds.current = shuffled;
  }, []);

  // Start game
  const startGame = useCallback(() => {
    if (!isWebcamReady) {
      toast({
        title: "Camera needed! 📷",
        description: "Please allow camera access to play the game",
        variant: "destructive",
      });
      return;
    }

    shuffleExpressions();
    setGameState('playing');
    setGameStats({
      currentRound: 0,
      score: 0,
      timeLeft: ROUND_DURATION,
      detectedExpression: null,
    });
    startRoundTimer();
  }, [isWebcamReady, shuffleExpressions]);

  // Start round timer
  const startRoundTimer = useCallback(() => {
    timerRef.current = setInterval(() => {
      setGameStats(prev => {
        const newTimeLeft = prev.timeLeft - 1;
        
        if (newTimeLeft <= 0) {
          // Time's up for this round
          if (prev.currentRound + 1 >= FACIAL_EXPRESSIONS.length) {
            // Game finished
            setGameState('finished');
            if (timerRef.current) clearInterval(timerRef.current);
            return prev;
          } else {
            // Next round
            return {
              ...prev,
              currentRound: prev.currentRound + 1,
              timeLeft: ROUND_DURATION,
              detectedExpression: null,
            };
          }
        }
        
        return { ...prev, timeLeft: newTimeLeft };
      });
    }, 1000);
  }, []);

  // Handle expression detection from webcam
  const handleExpressionDetected = useCallback((expression: string) => {
    if (gameState !== 'playing') return;

    setGameStats(prev => ({ ...prev, detectedExpression: expression }));

    const currentExpression = gameRounds.current[gameStats.currentRound];
    if (expression === currentExpression.id) {
      // Correct match!
      toast({
        title: "🎉 Perfect! 🎉",
        description: `You nailed the ${currentExpression.name}!`,
      });

      setGameStats(prev => {
        const newScore = prev.score + 1;
        const newRound = prev.currentRound + 1;

        if (newRound >= FACIAL_EXPRESSIONS.length) {
          // Game finished
          setGameState('finished');
          if (timerRef.current) clearInterval(timerRef.current);
          return { ...prev, score: newScore };
        } else {
          // Next round
          return {
            ...prev,
            score: newScore,
            currentRound: newRound,
            timeLeft: ROUND_DURATION,
            detectedExpression: null,
          };
        }
      });
    } else if (expression && expression !== currentExpression.id) {
      // Wrong expression detected
      toast({
        title: "Keep trying! 💪",
        description: `That's not quite right. Try again!`,
        variant: "destructive",
      });
    }
  }, [gameState, gameStats.currentRound]);

  // Reset game
  const resetGame = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setGameState('idle');
    setGameStats({
      currentRound: 0,
      score: 0,
      timeLeft: ROUND_DURATION,
      detectedExpression: null,
    });
  }, []);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const currentExpression = gameRounds.current[gameStats.currentRound];
  const progressPercentage = ((gameStats.currentRound + 1) / FACIAL_EXPRESSIONS.length) * 100;

  return (
    <div className="mirror-posture-game">
      {/* Floating Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="floating-bubble"></div>
        <div className="floating-bubble"></div>
        <div className="floating-bubble"></div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Instructions Button - Top Right */}
        <div className="absolute top-4 right-4 z-10">
          <Button
            onClick={() => setShowInstructions(true)}
            variant="toy"
            size="lg"
          >
            <HelpCircle className="w-6 h-6" />
            How to Play
          </Button>
        </div>

        {/* Header */}
        <div className="text-center mb-8 animate-bounce-gentle">
          <h1 className="text-5xl font-bold bg-gradient-rainbow bg-clip-text text-transparent mb-4">
            Face Mimic Fun! 🎭
          </h1>
          <p className="text-xl text-muted-foreground">
            Copy the facial expressions and have fun learning!
          </p>
        </div>

        {/* Pre-Game State - Video Feed Center, Start Button Bottom */}
        {gameState === 'idle' && (
          <div className="flex flex-col items-center justify-between min-h-[70vh]">
            {/* Central Video Feed */}
            <div className="flex-1 flex items-center justify-center">
              <Card className="game-card camera-container">
                <div className="text-center mb-4">
                  <h3 className="text-2xl font-bold text-primary mb-2">
                    📷 Your Camera
                  </h3>
                  <p className="text-muted-foreground">
                    Make sure you're centered in the camera view
                  </p>
                </div>
                
                <WebcamCapture
                  onExpressionDetected={handleExpressionDetected}
                  onCameraReady={setIsWebcamReady}
                  isActive={false}
                  detectedExpression={null}
                />
              </Card>
            </div>

            {/* Bottom Start Button */}
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-4 text-primary">
                Ready to Play? 🎮
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Match 5 different facial expressions as quickly as you can!
              </p>
              
              <Button
                onClick={startGame}
                className="fun-button"
                disabled={!isWebcamReady}
              >
                <Play className="w-6 h-6" />
                Start Game!
              </Button>

              {!isWebcamReady && (
                <p className="text-sm text-destructive mt-4">
                  Please allow camera access to start the game
                </p>
              )}
            </div>
          </div>
        )}

        {/* Playing State - Two Sections Layout */}
        {gameState === 'playing' && (
          <>
            {/* Game Stats Bar */}
            <Card className="game-card timer-display">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <Badge className="fun-badge">
                    Round {gameStats.currentRound + 1} of {FACIAL_EXPRESSIONS.length}
                  </Badge>
                  <div className="score-display">
                    <Trophy className="w-6 h-6" />
                    <span className="text-2xl font-bold">
                      {gameStats.score}
                    </span>
                  </div>
                </div>
                                  <div className="text-right">
                    <div className="timer-value">
                      {gameStats.timeLeft}s
                    </div>
                    <div className="text-sm text-muted-foreground">Time left</div>
                  </div>
              </div>
              <div className="progress-container">
                <div className="progress-bar" style={{ width: `${progressPercentage}%` }}></div>
              </div>
            </Card>

            {/* Two Sections: Video Feed and Target Expression */}
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Video Feed Section */}
              <Card className="game-card camera-container">
                <div className="text-center mb-4">
                  <h3 className="text-2xl font-bold text-primary mb-2">
                    📷 Your Camera
                  </h3>
                  <p className="text-muted-foreground">
                    Make sure you're centered in the camera view
                  </p>
                </div>
                
                <WebcamCapture
                  onExpressionDetected={handleExpressionDetected}
                  onCameraReady={setIsWebcamReady}
                  isActive={gameState === 'playing'}
                  detectedExpression={gameStats.detectedExpression}
                />
              </Card>

              {/* Target Expression Section */}
              {currentExpression && (
                <Card className="game-card">
                  <div className="text-center">
                    <h2 className="text-3xl font-bold mb-4 text-primary">
                      {currentExpression.emoji} {currentExpression.name}
                    </h2>
                    <div className="relative mb-6">
                      <img
                        src={currentExpression.image}
                        alt={currentExpression.name}
                        className="expression-image"
                      />
                    </div>
                    <p className="text-lg text-muted-foreground">
                      Look at the image and copy this expression!
                    </p>
                  </div>
                </Card>
              )}
            </div>
          </>
        )}

        {/* Game Results - Full Screen */}
        {gameState === 'finished' && (
          <div className="fixed inset-0 modal-overlay flex items-center justify-center z-50">
            <Card className="modal-content text-center max-w-2xl mx-4">
              <h2 className="text-6xl font-bold mb-6 text-primary">
                🎉 Great Job! 🎉
              </h2>
              
              <div className="text-8xl font-bold text-accent mb-6">
                {gameStats.score}/{FACIAL_EXPRESSIONS.length}
              </div>
              
              <p className="text-2xl text-muted-foreground mb-8">
                {gameStats.score === FACIAL_EXPRESSIONS.length
                  ? "Perfect score! You're amazing! 🌟"
                  : `You got ${gameStats.score} expressions right! Keep practicing! 💪`
                }
              </p>
              
              <Button
                onClick={resetGame}
                className="fun-button"
              >
                <RotateCcw className="w-8 h-8" />
                Play Again!
              </Button>
            </Card>
          </div>
        )}
      </div>

      {/* Instructions Modal */}
      <InstructionsModal
        open={showInstructions}
        onOpenChange={setShowInstructions}
      />
    </div>
  );
};

export default MirrorPostureGame;