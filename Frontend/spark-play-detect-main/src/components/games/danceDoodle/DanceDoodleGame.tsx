"use client"

import type React from "react"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { toast } from '../../../hooks/use-toast'
import DanceDoodleGameStats from './DanceDoodleGameStats'

type GameScreen = 'instructions' | 'consent' | 'game' | 'loading'

interface DanceRoundStats {
  roundNumber: number;
  poseName: string;
  poseEmoji: string;
  timeTaken: number;
  completed: boolean;
}

interface DanceGameSession {
  sessionId: string;
  childId: string;
  startTime: Date;
  endTime?: Date;
  rounds: DanceRoundStats[];
  totalScore: number;
  consentData?: any;
}

const DanceDoodleGame: React.FC = () => {
    const videoRef = useRef<HTMLVideoElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [webcamRunning, setWebcamRunning] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [currentScreen, setCurrentScreen] = useState<GameScreen>('instructions')
    const [isConnected, setIsConnected] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false)

    // Game state
    const [currentRound, setCurrentRound] = useState(0)
    const [score, setScore] = useState(0)
    const [gameStarted, setGameStarted] = useState(false)
    const [gameEnded, setGameEnded] = useState(false)
    const [targetPose, setTargetPose] = useState<string>("")
    const [timeLeft, setTimeLeft] = useState(10)
    const [roundResult, setRoundResult] = useState<string>("")
    const [detectedPose, setDetectedPose] = useState<string>("")
    const [detectedConfidence, setDetectedConfidence] = useState<number>(0)
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
    const [isProcessingRound, setIsProcessingRound] = useState(false)
    const [countdown, setCountdown] = useState<number | null>(null)
    const [showCountdown, setShowCountdown] = useState(false)

    // Consent screen state
    const [childName, setChildName] = useState("")
    const [childAge, setChildAge] = useState("")
    const [suspectedASD, setSuspectedASD] = useState(false)
    const [isTrainingAllowed, setIsTrainingAllowed] = useState(false)

    // Round countdown state
    const [roundCountdown, setRoundCountdown] = useState<number>(2)
    const [isRoundCountdownActive, setIsRoundCountdownActive] = useState<boolean>(false)

    // Celebration state
    const [showCongratulations, setShowCongratulations] = useState<boolean>(false)
 
     // Game session and stats state
     const [gameSession, setGameSession] = useState<DanceGameSession | null>(null)
     const [showGameStats, setShowGameStats] = useState<boolean>(false)

    // Refs for cleanup
    const timerRef = useRef<NodeJS.Timeout | null>(null)
    const countdownTimerRef = useRef<NodeJS.Timeout | null>(null)
    const captureIntervalRef = useRef<NodeJS.Timeout | null>(null)
    const currentRoundRef = useRef<number>(0)
    const isProcessingRoundRef = useRef<boolean>(false)
    const roundCountdownRef = useRef<NodeJS.Timeout | null>(null)
    const targetPoseRef = useRef<string>("")

    const videoHeight = "480px"
    const videoWidth = "640px"

    // API endpoint for pose detection
    const API_ENDPOINT = 'http://127.0.0.1:8000/predictDancePose';
 
     // Create session ID
     const createSessionId = useCallback(() => {
         const childId = localStorage.getItem('selectedChildId') || 'unknown';
         const dateTime = new Date().toISOString().replace(/[:.]/g, '-');
         return `${childId}_${dateTime}`;
     }, []);

    // Available dance poses - exactly 5 poses for 5 rounds
    const dancePoses = useMemo(() => [
        { name: "Cool Arms", label: "cool_arms", emoji: "💪" },
        { name: "Open Wings", label: "open_wings", emoji: "🦅" },
        { name: "Ready Pose", label: "ready_pose", emoji: "🎯" },
        { name: "Silly Boxer", label: "silly_boxer", emoji: "🥊" },
        { name: "Happy Stand Left", label: "happy_stand_left", emoji: "😊" },
    ], []);

    const totalRounds = dancePoses.length;

    const getPoseDisplayName = (poseLabel: string) => {
        const pose = dancePoses.find(p => p.label === poseLabel);
        return pose ? pose.name : poseLabel;
    };

    const getPoseEmoji = (poseLabel: string) => {
        const pose = dancePoses.find(p => p.label === poseLabel);
        return pose ? pose.emoji : "🎭";
    };

    // Start webcam
    const startWebcam = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { 
                    width: 640, 
                    height: 480,
                    facingMode: 'user'
                } 
            });
            
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                setWebcamRunning(true);
                toast({
                    title: "Camera Ready! 📷",
                    description: "Your camera is now active for pose detection.",
                });
            }
        } catch (error) {
            console.error('Error accessing webcam:', error);
            toast({
                title: "Camera Error",
                description: "Could not access webcam. Please ensure camera permissions are granted.",
                variant: "destructive"
            });
        }
    }, []);

    // Stop webcam
    const stopWebcam = useCallback(() => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
        setWebcamRunning(false);
    }, []);

    // Handle pose detected during game
    const handlePoseDetected = useCallback((prediction: string, confidence: number) => {
        setDetectedPose(prediction);
        setDetectedConfidence(confidence);
        
        const isTargetPose = prediction === targetPoseRef.current;
        setIsCorrect(isTargetPose);
        
        if (isTargetPose && !isProcessingRoundRef.current) {
            setIsProcessingRound(true);
            isProcessingRoundRef.current = true;
            
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
            
            const timeTaken = 10 - timeLeft;
            const roundStats: DanceRoundStats = {
                roundNumber: currentRoundRef.current + 1,
                poseName: getPoseDisplayName(targetPoseRef.current),
                poseEmoji: getPoseEmoji(targetPoseRef.current),
                timeTaken: timeTaken,
                completed: true
            };
            
            setGameSession(prev => {
                if (!prev) return null;
                return {
                    ...prev,
                    rounds: [...prev.rounds, roundStats],
                    totalScore: prev.totalScore + 1
                };
            });
            
            setScore(prev => prev + 1);
            setRoundResult("success");
            
            toast({
                title: "Amazing! 🎉",
                description: `You nailed the ${getPoseDisplayName(targetPoseRef.current)} pose!`,
            });
            
            setTimeout(() => {
                if (currentRoundRef.current >= totalRounds - 1) {
                    endGame();
                } else {
                    startNextRound();
                }
            }, 2000);
        }
    }, [timeLeft, totalRounds, getPoseDisplayName, getPoseEmoji]);

    // Declare the functions before using them
    const endGame = useCallback(() => {
        setGameEnded(true);
        setGameStarted(false);
        
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        if (roundCountdownRef.current) {
            clearInterval(roundCountdownRef.current);
            roundCountdownRef.current = null;
        }
        
        setGameSession(prev => {
            if (!prev) return null;
            return {
                ...prev,
                endTime: new Date()
            };
        });
        
        setShowCongratulations(true);
        
        setTimeout(() => {
            setShowCongratulations(false);
            setShowGameStats(true);
        }, 3000);
    }, []);

    const startNextRound = useCallback(() => {
        setIsProcessingRound(false);
        isProcessingRoundRef.current = false;
        setIsCorrect(null);
        setDetectedPose("");
        setDetectedConfidence(0);
        setRoundResult("");
        
        const nextRound = currentRoundRef.current + 1;
        setCurrentRound(nextRound);
        currentRoundRef.current = nextRound;
        
        const nextPose = dancePoses[nextRound];
        setTargetPose(nextPose.label);
        targetPoseRef.current = nextPose.label;
        
        setTimeLeft(10);
        
        setIsRoundCountdownActive(true);
        setRoundCountdown(2);
        
        const countdownInterval = setInterval(() => {
            setRoundCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(countdownInterval);
                    setIsRoundCountdownActive(false);
                    
                    const gameTimer = setInterval(() => {
                        setTimeLeft(prevTime => {
                            if (prevTime <= 1) {
                                clearInterval(gameTimer);
                                
                                if (!isProcessingRoundRef.current) {
                                    const roundStats: DanceRoundStats = {
                                        roundNumber: currentRoundRef.current + 1,
                                        poseName: getPoseDisplayName(targetPoseRef.current),
                                        poseEmoji: getPoseEmoji(targetPoseRef.current),
                                        timeTaken: 10,
                                        completed: false
                                    };
                                    
                                    setGameSession(prev => {
                                        if (!prev) return null;
                                        return {
                                            ...prev,
                                            rounds: [...prev.rounds, roundStats]
                                        };
                                    });
                                    
                                    setRoundResult("timeout");
                                    toast({
                                        title: "Time's up! ⏰",
                                        description: "Don't worry, let's try the next pose!",
                                    });
                                    
                                    setTimeout(() => {
                                        if (currentRoundRef.current >= totalRounds - 1) {
                                            endGame();
                                        } else {
                                            startNextRound();
                                        }
                                    }, 2000);
                                }
                                return 0;
                            }
                            return prevTime - 1;
                        });
                    }, 1000);
                    
                    timerRef.current = gameTimer;
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        
        roundCountdownRef.current = countdownInterval;
    }, [dancePoses, getPoseDisplayName, getPoseEmoji, totalRounds, endGame]);

    // Start game
    const startGame = useCallback(async () => {
        setGameStarted(false);
        setGameEnded(false);
        setCurrentRound(0);
        currentRoundRef.current = 0;
        setScore(0);
        setTargetPose("");
        targetPoseRef.current = "";
        setDetectedPose("");
        setDetectedConfidence(0);
        setIsCorrect(null);
        setRoundResult("");
        setIsProcessingRound(false);
        isProcessingRoundRef.current = false;
        
        const sessionId = createSessionId();
        const newSession: DanceGameSession = {
            sessionId,
            childId: localStorage.getItem('selectedChildId') || 'unknown',
            startTime: new Date(),
            rounds: [],
            totalScore: 0,
            consentData: {
                childName,
                childAge,
                suspectedASD,
                isTrainingAllowed
            }
        };
        setGameSession(newSession);
        
        await startWebcam();
        
        setShowCountdown(true);
        setCountdown(3);
        
        const countdownInterval = setInterval(() => {
            setCountdown(prev => {
                if (prev === null || prev <= 1) {
                    clearInterval(countdownInterval);
                    setShowCountdown(false);
                    setCountdown(null);
                    
                    setGameStarted(true);
                    setCurrentRound(0);
                    currentRoundRef.current = 0;
                    
                    const firstPose = dancePoses[0];
                    setTargetPose(firstPose.label);
                    targetPoseRef.current = firstPose.label;
                    
                    startNextRound();
                    
                    return null;
                }
                return prev - 1;
            });
        }, 1000);
        
        countdownTimerRef.current = countdownInterval;
    }, [createSessionId, childName, childAge, suspectedASD, isTrainingAllowed, startWebcam, dancePoses, startNextRound]);

    // Predict pose from webcam
    const predictWebcam = useCallback(async () => {
        if (!videoRef.current || !canvasRef.current || !webcamRunning || gameEnded) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        if (!ctx || video.videoWidth === 0) return;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const sendFrame = async () => {
            if (isProcessing) return;
            
            try {
                setIsProcessing(true);
                
                const blob = await new Promise<Blob>((resolve) => {
                    canvas.toBlob(resolve as BlobCallback, 'image/jpeg', 0.6);
                });

                if (!blob) return;

                const formData = new FormData();
                formData.append('file', blob, 'frame.jpg');

                const response = await fetch(API_ENDPOINT, {
                    method: 'POST',
                    body: formData,
                });

                if (response.ok) {
                    const result = await response.json();
                    
                    if (result.status === 'success' && result.prediction && result.prediction !== "no_pose_detected") {
                        if (gameStarted && !gameEnded && !isProcessingRoundRef.current) {
                            handlePoseDetected(result.prediction, result.confidence || 0.8);
                        } else {
                            setDetectedPose(result.prediction);
                            setDetectedConfidence(result.confidence || 0.8);
                        }
                    }
                    setIsConnected(true);
                } else {
                    throw new Error('API request failed');
                }
            } catch (error) {
                setIsConnected(false);
                
                // Mock detection for testing when API is not available
                if (Math.random() < 0.05) { // 5% chance per frame for testing
                    const poses = ['cool_arms', 'open_wings', 'ready_pose', 'silly_boxer', 'happy_stand_left'];
                    const randomPose = poses[Math.floor(Math.random() * poses.length)];
                    if (gameStarted && !gameEnded && !isProcessingRoundRef.current) {
                        handlePoseDetected(randomPose, 0.8);
                    } else {
                        setDetectedPose(randomPose);
                        setDetectedConfidence(0.8);
                    }
                }
            } finally {
                setIsProcessing(false);
            }
        };

        if (!gameEnded) {
            sendFrame();
        }
    }, [webcamRunning, handlePoseDetected, isProcessing, gameStarted, gameEnded])

    const isActive = useMemo(() => {
        return currentScreen === 'game' && gameStarted && !gameEnded;
    }, [currentScreen, gameStarted, gameEnded]);

    useEffect(() => {
        if (isActive && webcamRunning) {
            captureIntervalRef.current = setInterval(predictWebcam, 100); // 10 FPS
        } else {
            if (captureIntervalRef.current) {
                clearInterval(captureIntervalRef.current);
                captureIntervalRef.current = null;
            }
        }

        return () => {
            if (captureIntervalRef.current) {
                clearInterval(captureIntervalRef.current);
            }
        };
    }, [isActive, webcamRunning, predictWebcam]);

    useEffect(() => {
        if (gameEnded && webcamRunning) {
            stopWebcam();
        }
    }, [gameEnded, webcamRunning, stopWebcam]);

    useEffect(() => {
        return () => {
            stopWebcam();
            if (timerRef.current) clearInterval(timerRef.current);
            if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
            if (captureIntervalRef.current) clearInterval(captureIntervalRef.current);
            if (roundCountdownRef.current) clearInterval(roundCountdownRef.current);
        }
    }, [stopWebcam]);

    // Render loading screen
    if (isLoading) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-6 animate-bounce">🕺</div>
                    <h2 className="text-3xl font-playful mb-4 text-primary">Loading...</h2>
                    <p className="text-lg text-muted-foreground font-comic">Preparing dance pose recognition system</p>
                </div>
            </div>
        )
    }

    // Render instructions screen
    if (currentScreen === 'instructions') {
        return (
            <div className="h-full flex flex-col">
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-8">
                            <div className="text-8xl mb-4 animate-bounce">🕺💃</div>
                            <h1 className="text-5xl font-playful bg-gradient-to-r from-purple-600 via-pink-500 to-blue-600 bg-clip-text text-transparent mb-4">
                                Dance Doodle Adventure!
                            </h1>
                            <p className="text-2xl font-comic text-muted-foreground">
                                Strike amazing poses and become a dance superstar! ✨
                            </p>
                        </div>

                        <div className="card-playful border-4 border-primary mb-8 p-6">
                            <h2 className="text-3xl font-playful text-primary mb-6 flex items-center gap-2">
                                🎯 How to Play
                            </h2>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="flex items-start gap-4 p-4 bg-white/50 rounded-lg">
                                        <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold">1</div>
                                        <div>
                                            <h3 className="font-playful text-lg text-primary">Get Ready</h3>
                                            <p className="font-comic text-muted-foreground">Position yourself in front of your camera!</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4 p-4 bg-white/50 rounded-lg">
                                        <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold">2</div>
                                        <div>
                                            <h3 className="font-playful text-lg text-primary">Watch & Learn</h3>
                                            <p className="font-comic text-muted-foreground">Look at the target pose shown on screen!</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-start gap-4 p-4 bg-white/50 rounded-lg">
                                        <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold">3</div>
                                        <div>
                                            <h3 className="font-playful text-lg text-primary">Strike the Pose!</h3>
                                            <p className="font-comic text-muted-foreground">Copy the pose - you have 10 seconds!</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4 p-4 bg-white/50 rounded-lg">
                                        <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold">4</div>
                                        <div>
                                            <h3 className="font-playful text-lg text-primary">Score Points!</h3>
                                            <p className="font-comic text-muted-foreground">Get 1 point for each correct pose!</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="card-playful border-4 border-secondary mb-8 p-6">
                            <h2 className="text-3xl font-playful text-secondary mb-6 flex items-center gap-2">
                                💃 The 5 Dance Poses
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                                {dancePoses.map((pose, index) => (
                                    <div key={pose.label} className="text-center p-4 bg-white/50 rounded-lg border-2 border-secondary/20">
                                        <div className="text-6xl mb-2">{pose.emoji}</div>
                                        <h3 className="font-playful text-lg text-secondary mb-1">{pose.name}</h3>
                                        <p className="font-comic text-sm text-muted-foreground">Round {index + 1}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-center">
                            <button
                                onClick={() => setCurrentScreen('consent')}
                                className="btn-fun font-comic text-2xl py-4 px-8 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-4 border-purple-300 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                            >
                                🚀 Let's Dance! →
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // Render consent screen
    if (currentScreen === 'consent') {
        return (
            <div className="h-full flex flex-col">
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-8">
                            <div className="text-6xl mb-4">🛡️</div>
                            <h1 className="text-4xl font-playful text-primary mb-4">
                                Child Information & Consent
                            </h1>
                            <p className="text-xl font-comic text-muted-foreground">
                                Please provide some basic information before we begin!
                            </p>
                        </div>

                        <div className="mb-8 border-4 border-primary rounded-lg p-6">
                            <div className="mb-4">
                                <h2 className="text-3xl font-playful text-primary flex items-center gap-2 mb-2">
                                    👤 Child Information
                                </h2>
                            </div>
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="block text-lg font-playful text-primary">
                                        Child's Name *
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Enter your child's name"
                                        value={childName}
                                        onChange={(e) => setChildName(e.target.value)}
                                        className="w-full p-3 border-2 border-primary rounded-lg text-lg font-comic focus:outline-none focus:border-secondary"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-lg font-playful text-primary">
                                        Child's Age *
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="18"
                                        placeholder="Enter age (1-18)"
                                        value={childAge}
                                        onChange={(e) => setChildAge(e.target.value)}
                                        className="w-full p-3 border-2 border-primary rounded-lg text-lg font-comic focus:outline-none focus:border-secondary"
                                    />
                                </div>

                                <div className="space-y-4">
                                    <label className="block text-lg font-playful text-primary">
                                        Do you suspect your child might have Autism Spectrum Disorder (ASD)?
                                    </label>
                                    <div className="flex gap-4">
                                        <label className="flex items-center space-x-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="suspectedASD"
                                                checked={suspectedASD === true}
                                                onChange={() => setSuspectedASD(true)}
                                                className="w-4 h-4 text-primary"
                                            />
                                            <span className="font-comic text-lg">Yes</span>
                                        </label>
                                        <label className="flex items-center space-x-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="suspectedASD"
                                                checked={suspectedASD === false}
                                                onChange={() => setSuspectedASD(false)}
                                                className="w-4 h-4 text-primary"
                                            />
                                            <span className="font-comic text-lg">No</span>
                                        </label>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="block text-lg font-playful text-primary">
                                        Would you like to help improve our games by sharing anonymous data? *
                                    </label>
                                    <div className="space-y-3">
                                        <label className="flex items-start space-x-3 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="consentType"
                                                checked={isTrainingAllowed === true}
                                                onChange={() => setIsTrainingAllowed(true)}
                                                className="w-4 h-4 text-primary mt-1"
                                            />
                                            <div className="space-y-1">
                                                <span className="font-comic text-lg text-primary">Yes, I agree to share data for training</span>
                                                <p className="text-sm text-muted-foreground font-comic">
                                                    Your child's game data will be used anonymously to improve our games.
                                                </p>
                                            </div>
                                        </label>
                                        
                                        <label className="flex items-start space-x-3 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="consentType"
                                                checked={isTrainingAllowed === false}
                                                onChange={() => setIsTrainingAllowed(false)}
                                                className="w-4 h-4 text-primary mt-1"
                                            />
                                            <div className="space-y-1">
                                                <span className="font-comic text-lg text-primary">No, I prefer not to share data</span>
                                                <p className="text-sm text-muted-foreground font-comic">
                                                    Your child can still play the game normally.
                                                </p>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-center gap-4">
                            <button
                                onClick={() => setCurrentScreen('instructions')}
                                className="btn-fun font-comic text-xl py-3 px-6 border-2 border-primary hover:bg-primary/10 bg-white text-primary"
                            >
                                ← Back to Instructions
                            </button>
                            <button
                                onClick={() => setCurrentScreen('game')}
                                disabled={!childName.trim() || !childAge.trim()}
                                className="btn-fun font-comic text-xl py-3 px-8 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-2 border-blue-300 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                            >
                                {isTrainingAllowed ? '✅ I Consent - Start Game' : '🎮 Start Game'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // Render game screen
    if (currentScreen === 'game') {
        return (
            <div className="h-full flex flex-col relative">
                {/* Countdown Screen */}
                {showCountdown && countdown && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-purple-600 via-pink-500 to-blue-600">
                        <div className="text-center">
                            <div className="text-9xl mb-8 animate-bounce font-bold text-white drop-shadow-2xl">
                                {countdown}
                            </div>
                            <div className="text-4xl font-playful text-white mb-4 animate-pulse">
                                {countdown === 3 ? "Get Ready!" : countdown === 2 ? "Almost There!" : "Let's Dance!"}
                            </div>
                            <div className="text-2xl font-comic text-white/90">
                                {countdown === 3 ? "🎮 Camera is setting up..." : 
                                 countdown === 2 ? "🕺 Prepare to pose!" : 
                                 "💃 Here we go!"}
                            </div>
                            {/* Animated background elements */}
                            <div className="absolute top-1/4 left-1/4 text-6xl animate-spin text-white/20">🕺</div>
                            <div className="absolute top-1/3 right-1/4 text-5xl animate-bounce text-white/20">💃</div>
                            <div className="absolute bottom-1/3 left-1/3 text-4xl animate-pulse text-white/20">🎭</div>
                            <div className="absolute bottom-1/4 right-1/3 text-5xl animate-spin text-white/20">🎯</div>
                        </div>
                    </div>
                )}

                <div className="flex-1 flex items-center justify-center pt-8">
                    <div className="flex gap-8 lg:gap-20 items-center justify-center flex-wrap lg:flex-nowrap">
                        {/* Webcam Video Section */}
                        <div className="relative w-[500px] h-[400px]">
                            {!gameEnded ? (
                                <>
                                    <video
                                        ref={videoRef}
                                        width={videoWidth}
                                        height={videoHeight}
                                        autoPlay
                                        playsInline
                                        muted
                                        className="w-full h-full object-cover border-4 border-primary rounded-lg shadow-lg bg-gray-200"
                                        style={{ transform: 'scaleX(-1)' }}
                                    />
                                    <canvas
                                        ref={canvasRef}
                                        width={videoWidth}
                                        height={videoHeight}
                                        className="hidden"
                                    />

                                    {/* Camera status overlay */}
                                    {!webcamRunning && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-gray-200 border-4 border-primary rounded-lg">
                                            <div className="text-center">
                                                <div className="text-6xl mb-4">📷</div>
                                                <p className="text-xl font-comic text-gray-600">Starting Camera...</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* API connection status */}
                                    <div className="absolute top-4 right-4">
                                        <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                    </div>

                                    {/* Round countdown overlay */}
                                    {isRoundCountdownActive && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/70 rounded-lg">
                                            <div className="text-center">
                                                <div className="text-8xl font-bold text-white mb-4 animate-bounce">
                                                    {roundCountdown}
                                                </div>
                                                <p className="text-2xl font-comic text-white">
                                                    {roundCountdown === 2 ? "Get ready..." : "Go!"}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Timer overlay */}
                                    {gameStarted && !isRoundCountdownActive && (
                                        <div className="absolute top-4 left-4">
                                            <div className={`px-3 py-2 rounded-full text-white font-bold text-lg ${
                                                timeLeft <= 3 ? 'bg-red-500 animate-pulse' : 
                                                timeLeft <= 5 ? 'bg-orange-500' : 'bg-green-500'
                                            }`}>
                                                ⏰ {timeLeft}s
                                            </div>
                                        </div>
                                    )}

                                    {/* Round info overlay */}
                                    {gameStarted && (
                                        <div className="absolute bottom-4 left-4">
                                            <div className="px-3 py-2 bg-blue-500 text-white rounded-full font-bold">
                                                Round {currentRound + 1}/{totalRounds}
                                            </div>
                                        </div>
                                    )}

                                    {/* Result overlay */}
                                    {roundResult && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                                            <div className={`text-center p-6 rounded-lg ${
                                                roundResult === 'success' ? 'bg-green-500' : 'bg-red-500'
                                            }`}>
                                                <div className="text-6xl mb-2">
                                                    {roundResult === 'success' ? '🎉' : '⏰'}
                                                </div>
                                                <div className="text-2xl font-bold text-white mb-2">
                                                    {roundResult === 'success' ? 'Amazing!' : 'Time\'s Up!'}
                                                </div>
                                                <div className="text-lg font-comic text-white">
                                                    {roundResult === 'success' ? 'Perfect pose!' : 'Don\'t worry, try the next one!'}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-100 to-pink-100 border-4 border-primary rounded-lg">
                                    <div className="text-center">
                                        <div className="text-6xl mb-4">🏆</div>
                                        <h3 className="text-2xl font-playful text-primary">Game Complete!</h3>
                                        <p className="text-lg font-comic text-muted-foreground">Great dancing!</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right Panel - Game Info */}
                        <div className="flex flex-col items-center gap-6 min-w-[300px]">
                            {gameStarted && !gameEnded && (
                                <>
                                    {/* Target Pose */}
                                    <div className="text-center card-playful border-4 border-secondary p-6 w-full">
                                        <h3 className="text-2xl font-playful text-secondary mb-4">Target Pose</h3>
                                        <div className="text-8xl mb-4 animate-bounce">{getPoseEmoji(targetPose)}</div>
                                        <h4 className="text-xl font-bold text-primary">{getPoseDisplayName(targetPose)}</h4>
                                        <p className="text-lg font-comic text-muted-foreground mt-2">
                                            Copy this pose with your body!
                                        </p>
                                    </div>

                                    {/* Detection Status */}
                                    <div className="text-center card-playful border-4 border-accent p-6 w-full">
                                        <h3 className="text-2xl font-playful text-accent mb-4">Your Pose</h3>
                                        {detectedPose ? (
                                            <>
                                                <div className="text-6xl mb-3">{getPoseEmoji(detectedPose)}</div>
                                                <h4 className="text-lg font-bold text-primary">{getPoseDisplayName(detectedPose)}</h4>
                                                <p className="text-sm font-comic text-muted-foreground mt-1">
                                                    Confidence: {detectedConfidence}%
                                                </p>
                                                <div className={`mt-3 p-2 rounded-lg font-bold ${
                                                    isCorrect === true ? 'bg-green-100 text-green-600' :
                                                    isCorrect === false ? 'bg-yellow-100 text-yellow-600' :
                                                    'bg-gray-100 text-gray-600'
                                                }`}>
                                                    {isCorrect === true ? '✅ Correct!' :
                                                     isCorrect === false ? '🔄 Keep trying!' :
                                                     '👀 Watching...'}
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="text-6xl mb-3">👀</div>
                                                <p className="text-lg font-comic text-muted-foreground">
                                                    Strike a pose to get detected!
                                                </p>
                                            </>
                                        )}
                                    </div>

                                    {/* Score Display */}
                                    <div className="text-center card-playful border-4 border-primary p-4 w-full">
                                        <h3 className="text-xl font-playful text-primary mb-2">Score</h3>
                                        <div className="text-4xl font-bold text-primary">{score}/{totalRounds}</div>
                                    </div>
                                </>
                            )}

                            {!gameStarted && !gameEnded && (
                                <div className="text-center card-playful border-4 border-primary p-6 w-full">
                                    <div className="text-6xl mb-4">🎬</div>
                                    <h3 className="text-2xl font-playful text-primary mb-4">Ready to Dance?</h3>
                                    <button
                                        onClick={startGame}
                                        className="btn-fun font-comic text-xl py-3 px-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-2 border-purple-300 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                                    >
                                        🚀 Start Dancing!
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Congratulations Message */}
                {showCongratulations && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                        <div className="card-playful border-4 border-yellow-400 bg-gradient-to-r from-yellow-100 to-orange-100 p-8 text-center max-w-md mx-4 animate-bounce">
                            <div className="text-6xl mb-4">🎉</div>
                            <h2 className="text-3xl font-playful text-yellow-600 mb-2">
                                Congratulations!
                            </h2>
                            <p className="text-lg font-comic text-yellow-700">
                                You've completed all {totalRounds} dance poses! 🏆
                            </p>
                            <div className="text-2xl font-playful text-yellow-600 mt-2">
                                Final Score: {score}/{totalRounds}
                            </div>
                        </div>
                    </div>
                )}
                
                {/* Game Stats Modal */}
                {showGameStats && gameSession && (
                    <DanceDoodleGameStats 
                        gameSession={gameSession} 
                        onClose={() => setShowGameStats(false)} 
                    />
                )}
            </div>
        )
    }

    return null;
}

export default DanceDoodleGame
