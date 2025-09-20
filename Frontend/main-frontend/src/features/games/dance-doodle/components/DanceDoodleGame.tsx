"use client"

import { toast } from '@/components/ui/use-toast'
import type React from "react"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import DanceDoodleGameStats from './DanceDoodleGameStats'

type GameScreen = 'instructions' | 'consent' | 'game' | 'loading'

interface DanceRoundStats {
  roundNumber: number;
  poseName: string;
  poseImage: string;
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

interface DanceDoodleGameProps {
  taskId?: string | null;
  tournamentId?: string | null;
}

const DanceDoodleGame: React.FC<DanceDoodleGameProps> = ({ taskId, tournamentId }) => {
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
    const [usedPoses, setUsedPoses] = useState<string[]>([])

    // Consent screen state
    const [childName, setChildName] = useState("")
    const [childAge, setChildAge] = useState("")
    const [suspectedASD, setSuspectedASD] = useState(false)
    const [isTrainingAllowed, setIsTrainingAllowed] = useState(false)

    // Round countdown state
    const [roundCountdown, setRoundCountdown] = useState<number>(2)
    const [isRoundCountdownActive, setIsRoundCountdownActive] = useState<boolean>(false)

    // Celebration state
    const [showConfetti, setShowConfetti] = useState<boolean>(false)
    const [showCongratulations, setShowCongratulations] = useState<boolean>(false)
 
    // Game session and stats state
    const [gameSession, setGameSession] = useState<DanceGameSession | null>(null)
    const [showGameStats, setShowGameStats] = useState<boolean>(false)
    const [roundStartTime, setRoundStartTime] = useState<number>(0)

    // Refs for cleanup
    const timerRef = useRef<NodeJS.Timeout | null>(null)
    const resultTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const countdownTimerRef = useRef<NodeJS.Timeout | null>(null)
    const captureIntervalRef = useRef<NodeJS.Timeout | null>(null)
    const currentRoundRef = useRef<number>(0)
    const isProcessingRoundRef = useRef<boolean>(false)
    const isCorrectRef = useRef<boolean | null>(null)
    const startNextRoundRef = useRef<(() => void) | null>(null)
    const roundCountdownRef = useRef<NodeJS.Timeout | null>(null)
    const usedPosesRef = useRef<string[]>([])
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

    // Available dance poses - 7 poses for 7 rounds (one pose each, no repetition)
    const dancePoses = useMemo(() => [
        { name: "Cool Arms", label: "cool_arms", image: "/dance_doodle_images/cool_arms.jpg", description: "Show your strong arms like a superhero!" },
        { name: "Open Wings", label: "open_wings", image: "/dance_doodle_images/open_wings.jpg", description: "Spread your arms like a bird flying!" },
        { name: "Silly Boxer", label: "silly_boxer", image: "/dance_doodle_images/silly_boxer.jpg", description: "Make boxing moves like a champion!" },
        { name: "Happy Stand", label: "happy_stand", image: "/dance_doodle_images/happy_stand_left.jpg", description: "Stand happily on either side!" },
        { name: "Crossy Play", label: "crossy_play", image: "/dance_doodle_images/crossy_play.jpg", description: "Cross your arms and legs like a gymnast!" },
        { name: "Shh Fun", label: "shh_fun", image: "/dance_doodle_images/shh_fun.jpg", description: "Put your finger on your lips like a secret keeper!" },
        { name: "Stretch", label: "stretch", image: "/dance_doodle_images/stretch_left.jpg", description: "Stretch your arm up high on either side!" },
    ], []);

    const totalRounds = 7; // 7 rounds with one pose each (no repetition)

    // Save game data to backend
    const saveGameDataToBackend = useCallback(async (gameSession: DanceGameSession) => {
        try {
            // Get child data from localStorage or fetch from API
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
                const today = new Date();
                const birthDate = new Date(dateOfBirth);
                let age = today.getFullYear() - birthDate.getFullYear();
                const monthDiff = today.getMonth() - birthDate.getMonth();
                if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                    age--;
                }
                return age;
            };

            // Prepare pose completion times
            const poseTimes = {
                cool_arms: null,
                open_wings: null,
                silly_boxer: null,
                happy_stand: null,
                crossy_play: null,
                shh_fun: null,
                stretch: null
            };

            // Map pose names to completion times
            console.log('=== DEBUGGING POSE MAPPING ===');
            console.log('Total rounds:', gameSession.rounds.length);
            gameSession.rounds.forEach((round, index) => {
                console.log(`Round ${index + 1}:`, {
                    poseName: round.poseName,
                    completed: round.completed,
                    timeTaken: round.timeTaken
                });
                
                const poseName = round.poseName.toLowerCase().replace(/\s+/g, '_');
                console.log('Mapping pose:', round.poseName, 'to lowercase:', poseName);
                
                if (poseName === 'cool_arms') {
                    poseTimes.cool_arms = round.completed ? round.timeTaken : null;
                } else if (poseName === 'open_wings') {
                    poseTimes.open_wings = round.completed ? round.timeTaken : null;
                } else if (poseName === 'silly_boxer') {
                    poseTimes.silly_boxer = round.completed ? round.timeTaken : null;
                } else if (poseName === 'happy_stand') {
                    poseTimes.happy_stand = round.completed ? round.timeTaken : null;
                } else if (poseName === 'crossy_play') {
                    poseTimes.crossy_play = round.completed ? round.timeTaken : null;
                } else if (poseName === 'shh_fun') {
                    poseTimes.shh_fun = round.completed ? round.timeTaken : null;
                } else if (poseName === 'stretch') {
                    poseTimes.stretch = round.completed ? round.timeTaken : null;
                } else {
                    console.log('No mapping found for:', round.poseName);
                }
            });
            console.log('Final poseTimes object:', poseTimes);
            console.log('=== END DEBUGGING ===');

            const requestData = {
                sessionId: gameSession.sessionId,
                dateTime: gameSession.startTime,
                childId: childData?.id?.toString() || '1',
                age: gameSession.consentData?.childAge ? parseInt(gameSession.consentData.childAge) : (childData?.dateOfBirth ? calculateAge(childData.dateOfBirth) : 8),
                schoolTaskId: taskId, // Include school task ID if available
                tournamentId: tournamentId, // Include tournament ID if available
                ...poseTimes,
                videoURL: "https://example.com/dummy-video.mp4", // Dummy URL for now
                isTrainingAllowed: gameSession.consentData?.dataConsent === true,
                suspectedASD: gameSession.consentData?.suspectedASD || false,
                isASD: null // Will be populated by ML model later
            };

            console.log('Consent data:', gameSession.consentData);
            console.log('Data consent value:', gameSession.consentData?.dataConsent);
            console.log('Saving game data to backend:', requestData);

            const response = await fetch('http://localhost:8087/api/dance-doodle/save', {
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

    // Test API connection on component mount
    useEffect(() => {
        const testConnection = async () => {
            try {
                const canvas = document.createElement('canvas');
                canvas.width = 100;
                canvas.height = 100;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.fillStyle = 'black';
                    ctx.fillRect(0, 0, 100, 100);
                }
                
                const blob = await new Promise<Blob>((resolve) => {
                    canvas.toBlob(resolve as BlobCallback, 'image/jpeg', 0.8);
                });

                if (!blob) return;

                const formData = new FormData();
                formData.append('file', blob, 'test.jpg');

                console.log('Testing dance pose API connection...');
                const response = await fetch(API_ENDPOINT, {
                    method: 'POST',
                    body: formData,
                });
                
                if (response.ok) {
                    const testResult = await response.json();
                    console.log('API test response:', testResult);
                    setIsConnected(true);
                    console.log('Dance pose API connection successful');
                } else {
                    console.log('API test failed with status:', response.status);
                    setIsConnected(false);
                }
            } catch (error) {
                console.log('Dance pose API not available, will use demo mode:', error);
                setIsConnected(false);
            }
        };
        
        testConnection();
    }, []);

    // Load child information from localStorage or fetch from API
    useEffect(() => {
        const loadChildData = async () => {
            let childData = null;
            const selectedChild = localStorage.getItem('selectedChild');
            
            if (selectedChild) {
                try {
                    childData = JSON.parse(selectedChild);
                } catch (error) {
                    console.error('Error parsing child data from localStorage:', error);
                }
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
            
            if (childData) {
                setChildName(childData.name || "");
                
                if (childData.dateOfBirth) {
                    const birthDate = new Date(childData.dateOfBirth);
                    const today = new Date();
                    const age = today.getFullYear() - birthDate.getFullYear();
                    const monthDiff = today.getMonth() - birthDate.getMonth();
                    const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate()) ? age - 1 : age;
                    setChildAge(actualAge.toString());
                }
            }
        };
        
        loadChildData();
    }, []);

    // Webcam setup
    const [isCameraOn, setIsCameraOn] = useState(false);
    const streamRef = useRef<MediaStream | null>(null);

    // Initialize webcam
    const initializeWebcam = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 640, max: 1280 },
                    height: { ideal: 480, max: 720 },
                    facingMode: 'user',
                    frameRate: { ideal: 30, max: 60 }
                }
            });

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                streamRef.current = stream;
                setIsCameraOn(true);
                setWebcamRunning(true);
                console.log('Webcam initialized successfully');
            }
        } catch (error) {
            console.error('Error accessing webcam:', error);
            setWebcamRunning(false);
        }
    }, []);

    // Stop webcam
    const stopWebcam = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        
        if (videoRef.current) {
            videoRef.current.pause();
            videoRef.current.srcObject = null;
        }
        
        setIsCameraOn(false);
        setWebcamRunning(false);
    }, []);

    // Direct function to handle round end
    const handleRoundEndDirect = useCallback(() => {
        if (isProcessingRoundRef.current) return;
        isProcessingRoundRef.current = true;
        setIsProcessingRound(true);
 
        // This function handles failed rounds (time's up)
        if (!targetPoseRef.current) {
            console.error('No target pose set for round', currentRoundRef.current);
            return;
        }
        
        const currentPose = dancePoses.find(p => p.label === targetPoseRef.current);
        if (currentPose && gameSession) {
            const roundStats: DanceRoundStats = {
                roundNumber: currentRoundRef.current,
                poseName: currentPose.name,
                poseImage: currentPose.image,
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
        }
        
        setRoundResult("Time's up! ⏰");
        setIsCorrect(false);
        isCorrectRef.current = false;
        
        // Show result for 2 seconds
        resultTimeoutRef.current = setTimeout(() => {
            setRoundResult("");
            setIsProcessingRound(false);
            isProcessingRoundRef.current = false;
            
            if (currentRoundRef.current >= totalRounds) {
                endGame();
            } else {
                startNextRound();
            }
        }, 2000);
    }, [dancePoses, gameSession, totalRounds]);

    // End game function
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
            const updatedSession = {
                ...prev,
                endTime: new Date()
            };
            
            // Save game data to backend
            saveGameDataToBackend(updatedSession);
            
            return updatedSession;
        });
        
        setShowCongratulations(true);
        
        setTimeout(() => {
            setShowCongratulations(false);
            setShowGameStats(true);
        }, 3000);
    }, [saveGameDataToBackend]);

    // Start next round
    const startNextRound = useCallback(() => {
        setIsProcessingRound(false);
        isProcessingRoundRef.current = false;
        setIsCorrect(null);
        isCorrectRef.current = null;
        setDetectedPose("");
        setDetectedConfidence(0);
        setRoundResult("");
        
        const nextRound = currentRoundRef.current + 1;
        
        // Check if game should end (after 9 rounds)
        if (nextRound > totalRounds) {
            endGame();
            return;
        }
        
        setCurrentRound(nextRound);
        currentRoundRef.current = nextRound;
        
        // Get available poses (not used yet) - no repetition allowed
        const availablePoses = dancePoses.filter(pose => !usedPosesRef.current.includes(pose.label));
        
        // If no poses available, end the game
        if (availablePoses.length === 0) {
            endGame();
            return;
        }
        
        const nextPose = availablePoses[Math.floor(Math.random() * availablePoses.length)];
        
        setTargetPose(nextPose.label);
        targetPoseRef.current = nextPose.label;
        setUsedPoses(prev => [...prev, nextPose.label]);
        usedPosesRef.current = [...usedPosesRef.current, nextPose.label];
        
        setTimeLeft(10);
        setRoundStartTime(Date.now());
        
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
                                handleRoundEndDirect();
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
    }, [dancePoses, handleRoundEndDirect, endGame]);

    // Handle pose detected
    const handlePoseDetected = useCallback((prediction: string, confidence: number) => {
        setDetectedPose(prediction);
        setDetectedConfidence(confidence);
        
        // Check if the detected pose matches the target pose
        // For happy_stand and stretch, accept both left and right variants
        const isTargetPose = prediction === targetPoseRef.current || 
            (targetPoseRef.current === 'happy_stand' && (prediction === 'happy_stand_left' || prediction === 'happy_stand_right')) ||
            (targetPoseRef.current === 'stretch' && (prediction === 'stretch_left' || prediction === 'stretch_right'));
        setIsCorrect(isTargetPose);
        isCorrectRef.current = isTargetPose;
        
        if (isTargetPose && !isProcessingRoundRef.current) {
            setIsProcessingRound(true);
            isProcessingRoundRef.current = true;
            
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
            
            setScore(prev => prev + 1);
            setRoundResult("Amazing! 🎉");
            
            // Save successful round data
            const currentPose = dancePoses.find(p => p.label === targetPoseRef.current);
            if (currentPose && gameSession) {
                const roundStats: DanceRoundStats = {
                    roundNumber: currentRoundRef.current,
                    poseName: currentPose.name,
                    poseImage: currentPose.image,
                    timeTaken: 10 - timeLeft,
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
            }
            
            toast({
                title: "Perfect! 🎉",
                description: `You nailed the ${currentPose?.name} pose!`,
            });
            
            // Wait 2 seconds then proceed to next round
            setTimeout(() => {
                if (currentRoundRef.current >= totalRounds) {
                    endGame();
                } else {
                    startNextRound();
                }
            }, 2000);
        }
    }, [timeLeft, dancePoses, gameSession, totalRounds, endGame, startNextRound]);

    // Predict pose from webcam
    const predictWebcam = useCallback(async () => {
        if (!videoRef.current || !canvasRef.current || !isCameraOn || gameEnded) return;

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
                
                // Mock detection for testing
                if (Math.random() < 0.05) {
                    const poses = ['cool_arms', 'open_wings', 'silly_boxer', 'happy_stand', 'crossy_play', 'shh_fun', 'stretch'];
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
    }, [isCameraOn, handlePoseDetected, isProcessing, gameStarted, gameEnded]);

    const isActive = useMemo(() => {
        return currentScreen === 'game' && gameStarted && !gameEnded;
    }, [currentScreen, gameStarted, gameEnded]);

    useEffect(() => {
        if (isActive && isCameraOn) {
            captureIntervalRef.current = setInterval(predictWebcam, 100);
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
    }, [isActive, isCameraOn, predictWebcam]);

    // Stop camera when game ends
    useEffect(() => {
        if (gameEnded && isCameraOn) {
            stopWebcam();
        }
    }, [gameEnded, isCameraOn, stopWebcam]);

    // Cleanup when game ends
    useEffect(() => {
        if (gameEnded) {
            if (captureIntervalRef.current) {
                clearInterval(captureIntervalRef.current);
                captureIntervalRef.current = null;
            }
            
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
            
            if (resultTimeoutRef.current) {
                clearTimeout(resultTimeoutRef.current);
                resultTimeoutRef.current = null;
            }
            
            if (countdownTimerRef.current) {
                clearInterval(countdownTimerRef.current);
                countdownTimerRef.current = null;
            }
            
            if (roundCountdownRef.current) {
                clearInterval(roundCountdownRef.current);
                roundCountdownRef.current = null;
            }
            
            if (isCameraOn) {
                stopWebcam();
            }
            
            setIsProcessing(false);
            setIsProcessingRound(false);
            isProcessingRoundRef.current = false;
        }
    }, [gameEnded, isCameraOn, stopWebcam]);

    // Cleanup on component unmount
    useEffect(() => {
        return () => {
            stopWebcam();
            
            if (timerRef.current) clearInterval(timerRef.current);
            if (resultTimeoutRef.current) clearTimeout(resultTimeoutRef.current);
            if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
            if (captureIntervalRef.current) clearInterval(captureIntervalRef.current);
            if (roundCountdownRef.current) clearInterval(roundCountdownRef.current);
        }
    }, [stopWebcam]);

    // Start game function
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
        isCorrectRef.current = null;
        setRoundResult("");
        setIsProcessingRound(false);
        isProcessingRoundRef.current = false;
        setUsedPoses([]);
        usedPosesRef.current = [];
        
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
                dataConsent: isTrainingAllowed
            }
        };
        setGameSession(newSession);
        
        await initializeWebcam();
        
        setShowCountdown(true);
        setCountdown(3);
        
        const countdownInterval = setInterval(() => {
            setCountdown(prev => {
                if (prev === null || prev <= 1) {
                    clearInterval(countdownInterval);
                    setShowCountdown(false);
                    setCountdown(null);
                    
                    setGameStarted(true);
                    setCurrentRound(1);
                    currentRoundRef.current = 1;
                    
                    const firstPose = dancePoses[0];
                    setTargetPose(firstPose.label);
                    targetPoseRef.current = firstPose.label;
                    setUsedPoses([firstPose.label]);
                    usedPosesRef.current = [firstPose.label];
                    
                    // Start the first round directly without calling startNextRound
                    setTimeLeft(10);
                    setRoundStartTime(Date.now());
                    
                    setIsRoundCountdownActive(true);
                    setRoundCountdown(2);
                    
                    const firstRoundCountdown = setInterval(() => {
                        setRoundCountdown(prev => {
                            if (prev <= 1) {
                                clearInterval(firstRoundCountdown);
                                setIsRoundCountdownActive(false);
                                
                                const gameTimer = setInterval(() => {
                                    setTimeLeft(prevTime => {
                                        if (prevTime <= 1) {
                                            clearInterval(gameTimer);
                                            handleRoundEndDirect();
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
                    
                    roundCountdownRef.current = firstRoundCountdown;
                    
                    return null;
                }
                return prev - 1;
            });
        }, 1000);
        
        countdownTimerRef.current = countdownInterval;
    }, [createSessionId, childName, childAge, suspectedASD, isTrainingAllowed, initializeWebcam, dancePoses, startNextRound]);

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

    if (currentScreen === 'instructions') {
        return (
            <div className="h-full flex flex-col">
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-8">
                            <div className="text-8xl mb-4 animate-bounce">🕺</div>
                            <h1 className="text-5xl font-playful bg-gradient-to-r from-purple-600 via-pink-500 to-blue-600 bg-clip-text text-transparent mb-4">
                                Dance Pose Adventure!
                            </h1>
                            <p className="text-2xl font-comic text-muted-foreground">
                                Show your amazing dance moves and become a pose superstar! 🌟
                            </p>
                        </div>
                        <div className="card-playful border-4 border-primary bg-gradient-to-r from-primary/10 to-secondary/10 p-8 mb-8">
                            <h2 className="text-4xl font-playful text-primary mb-6 text-center">
                                🎯 What's This Game About?
                            </h2>
                            <p className="text-xl text-muted-foreground leading-relaxed font-comic text-center">
                                Dance Pose Adventure helps you practice making different dance poses! 
                                You'll see a big picture showing how to make a pose, and then you copy it with your body. 
                                It's like playing copycat with your whole body! ✨
                            </p>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6 mb-8">
                            <div className="card-playful border-2 border-fun-purple/20 p-6 text-center hover:scale-105 transition-all duration-300">
                                <div className="text-6xl mb-4 animate-bounce">1️⃣</div>
                                <h4 className="text-2xl font-playful text-primary mb-3">Look at the Pose</h4>
                                <p className="text-lg text-muted-foreground font-comic">
                                    We'll show you a big, colorful picture of how to make a dance pose
                                </p>
                            </div>
                            <div className="card-playful border-2 border-fun-orange/20 p-6 text-center hover:scale-105 transition-all duration-300">
                                <div className="text-6xl mb-4 animate-bounce">2️⃣</div>
                                <h4 className="text-2xl font-playful text-primary mb-3">Copy the Pose</h4>
                                <p className="text-lg text-muted-foreground font-comic">
                                    Look in the camera and make the same dance pose!
                                </p>
                            </div>
                            <div className="card-playful border-2 border-fun-green/20 p-6 text-center hover:scale-105 transition-all duration-300">
                                <div className="text-6xl mb-4 animate-bounce">3️⃣</div>
                                <h4 className="text-2xl font-playful text-primary mb-3">Get Points!</h4>
                                <p className="text-lg text-muted-foreground font-comic">
                                    When you make the right pose, you get a point and hear a happy sound!
                                </p>
                            </div>
                            <div className="card-playful border-2 border-fun-yellow/20 p-6 text-center hover:scale-105 transition-all duration-300">
                                <div className="text-6xl mb-4 animate-bounce">4️⃣</div>
                                                                 <h4 className="text-2xl font-playful text-primary mb-3">Play 7 Rounds</h4>
                                <p className="text-lg text-muted-foreground font-comic">
                                    Try to copy 7 different poses. You have 10 seconds for each one!
                                </p>
                            </div>
                        </div>
                        <div className="card-playful border-4 border-primary bg-gradient-to-r from-primary/10 to-secondary/10 p-8 mb-8">
                            <h3 className="text-3xl font-playful text-primary mb-6 text-center">Available Poses:</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {dancePoses.map((pose, index) => (
                                    <div key={index} className="card-playful border-2 border-fun-purple/20 p-4 text-center hover:scale-105 transition-all duration-300 group">
                                        <img 
                                            src={pose.image} 
                                            alt={pose.name}
                                            className="w-16 h-16 mx-auto mb-3 rounded-lg border-2 border-primary shadow-lg group-hover:animate-bounce"
                                        />
                                        <div className="text-lg font-playful text-primary mb-2">{pose.name}</div>
                                        <div className="text-sm text-muted-foreground font-comic">{pose.description}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="text-center">
                            <button
                                onClick={() => setCurrentScreen('consent')}
                                className="btn-fun font-comic text-2xl py-4 px-8 bg-gradient-to-r from-purple-600 via-pink-500 to-blue-600 text-white border-4 border-purple-300 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110"
                            >
                                🚀 Start the Adventure! 🚀
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (currentScreen === 'consent') {
        return (
            <div className="h-full flex flex-col">
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    <div className="max-w-4xl mx-auto">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <div className="text-8xl mb-4 animate-bounce">🛡️</div>
                            <h1 className="text-5xl font-playful bg-gradient-to-r from-blue-600 via-purple-500 to-pink-600 bg-clip-text text-transparent mb-4">
                                Parental Consent
                            </h1>
                            <p className="text-2xl font-comic text-muted-foreground">
                                We need your permission to help improve our games! ✨
                            </p>
                        </div>

                        {/* Information Card */}
                        <div className="mb-8 border-4 border-primary bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
                            <div className="mb-4">
                                <h2 className="text-3xl font-playful text-primary flex items-center gap-2 mb-2">
                                    ℹ️ Why We Need Your Consent
                                </h2>
                                <p className="text-lg font-comic text-muted-foreground">
                                    We're working to make our games better for all children, including those with special needs.
                                </p>
                            </div>
                            <div className="space-y-4">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="flex items-start gap-3 p-4 bg-white/50 rounded-lg">
                                        <div className="w-6 h-6 text-blue-600 mt-1">🛡️</div>
                                        <div>
                                            <h4 className="font-playful text-lg text-primary mb-1">Data Protection</h4>
                                            <p className="text-sm text-muted-foreground font-comic">
                                                All data is anonymized and stored securely. We never share personal information.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3 p-4 bg-white/50 rounded-lg">
                                        <div className="w-6 h-6 text-purple-600 mt-1">👥</div>
                                        <div>
                                            <h4 className="font-playful text-lg text-primary mb-1">Research Purpose</h4>
                                            <p className="text-sm text-muted-foreground font-comic">
                                                Data helps us improve games for children with different abilities and needs.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Consent Form */}
                        <div className="mb-8 border-4 border-primary rounded-lg p-6">
                            <div className="mb-4">
                                <h2 className="text-3xl font-playful text-primary flex items-center gap-2 mb-2">
                                    👤 Child Information
                                </h2>
                                <p className="text-lg font-comic text-muted-foreground">
                                    Please provide some basic information about your child
                                </p>
                            </div>
                            <div className="space-y-6">
                                {/* Child Name */}
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

                                {/* Child Age */}
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

                                {/* ASD Question */}
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

                                {/* Data Consent Options */}
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
                                                    Your child's game data will be used anonymously to improve our games for all children, 
                                                    including those with special needs. No personal information will be shared.
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
                                                    Your child can still play the game, but no data will be collected for training purposes. 
                                                    The game experience remains the same.
                                                </p>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
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

                        {/* Privacy Notice */}
                        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-start gap-2">
                                <div className="w-4 h-4 text-blue-600 mt-0.5">🛡️</div>
                                <p className="font-comic text-sm text-blue-800">
                                    <strong>Privacy Notice:</strong> All data is anonymized and used only for improving our games. 
                                    We never share personal information with third parties. You can withdraw consent at any time.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

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
                                {countdown === 3 ? "Get Ready!" : countdown === 2 ? "Almost There!" : "Go!"}
                            </div>
                            <div className="text-2xl font-comic text-white/90">
                                {countdown === 3 ? "🕺 Camera is setting up..." : 
                                 countdown === 2 ? "💃 Prepare your body!" : 
                                 "🚀 Let's dance!"}
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
                        <div className="relative w-[500px] h-[400px]">
                            {!gameEnded ? (
                                <>
                                                                         <video 
                                         ref={videoRef}
                                         autoPlay
                                         playsInline
                                         muted
                                         className="w-full h-full object-cover rounded-2xl shadow-2xl border-4 border-primary transform -scale-x-100"
                                         style={{ 
                                             transform: 'scaleX(-1)',
                                             willChange: 'transform',
                                             backfaceVisibility: 'hidden'
                                         }}
                                     />
                                                                         <canvas 
                                         ref={canvasRef} 
                                         className="absolute top-0 left-0 w-full h-full rounded-2xl"
                                         style={{ 
                                             willChange: 'transform',
                                             backfaceVisibility: 'hidden'
                                         }}
                                     />

                                                                         {!isCameraOn && (
                                         <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl">
                                             <div className="text-center">
                                                 <div className="text-6xl mb-4 animate-bounce">📹</div>
                                                 <p className="text-2xl font-playful text-primary">Camera not active</p>
                                             </div>
                                         </div>
                                     )}

                                                                         {detectedPose && gameStarted && !gameEnded && (
                                         <div className="absolute bottom-2 left-1/2 -translate-x-1/2 card-playful border-2 border-secondary p-2 text-center bg-white/80 backdrop-blur-sm">
                                             <div className="text-sm font-playful text-primary">
                                                 {/* Detected: {detectedPose} ({(detectedConfidence * 100).toFixed(1)}%) */}
                                             </div>
                                         </div>
                                     )}

                                    {/* Round countdown overlay */}
                                    {isRoundCountdownActive && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/70 rounded-lg">
                                            <div className="text-center">
                                                <div className="relative w-32 h-32 mx-auto mb-4">
                                                    <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                                                        <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="8" fill="none" className="text-gray-200" />
                                                        <circle
                                                            cx="50"
                                                            cy="50"
                                                            r="40"
                                                            stroke="currentColor"
                                                            strokeWidth="8"
                                                            fill="none"
                                                            strokeLinecap="round"
                                                            className="text-blue-500 transition-all duration-1000 ease-linear"
                                                            style={{
                                                                strokeDasharray: `${2 * Math.PI * 40}`,
                                                                strokeDashoffset: `${2 * Math.PI * 40 * (1 - roundCountdown / 2)}`
                                                            }}
                                                        />
                                                    </svg>
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <div className="text-center">
                                                            <div className="text-3xl font-bold text-blue-600">
                                                                {roundCountdown}s
                                                            </div>
                                                            <div className="text-sm text-muted-foreground font-comic">Next Round</div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <p className="text-lg text-white font-comic">
                                                    Prepare for the next pose!
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Result overlay */}
                                    {roundResult && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                                            <div className={`text-center p-6 rounded-lg ${
                                                roundResult === 'Amazing! 🎉' ? 'bg-green-500' : 'bg-red-500'
                                            }`}>
                                                <div className="text-6xl mb-2">
                                                    {roundResult === 'Amazing! 🎉' ? '🎉' : '⏰'}
                                                </div>
                                                <div className="text-2xl font-bold text-white mb-2">
                                                    {roundResult === 'Amazing! 🎉' ? 'Amazing!' : 'Time\'s Up!'}
                                                </div>
                                                <div className="text-lg font-comic text-white">
                                                    {roundResult === 'Amazing! 🎉' ? 'Perfect pose!' : 'Don\'t worry, try the next one!'}
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

                        {gameStarted && !gameEnded && (
                            <div className="flex flex-col items-center justify-center order-first lg:order-none mb-4 lg:mb-0">
                                <div className="relative w-24 h-24">
                                    <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                                        <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="8" fill="none" className="text-gray-200" />
                                        <circle
                                            cx="50"
                                            cy="50"
                                            r="40"
                                            stroke="currentColor"
                                            strokeWidth="8"
                                            fill="none"
                                            strokeLinecap="round"
                                            className={`${timeLeft <= 3 ? "text-red-500" : "text-green-500"} transition-all duration-1000 ease-linear`}
                                            style={{
                                                strokeDasharray: `${2 * Math.PI * 40}`,
                                                strokeDashoffset: `${2 * Math.PI * 40 * (1 - timeLeft / 10)}`
                                            }}
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="text-center">
                                            <div className={`text-lg font-bold ${timeLeft <= 3 ? "text-red-500" : "text-primary"}`}>
                                                {timeLeft}s
                                            </div>
                                            <div className="text-xs text-muted-foreground font-comic">Time</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        <div className="w-[500px] h-[400px]">
                                                         {!gameStarted && !gameEnded && (
                                 <div className="card-playful border-4 border-primary bg-gradient-to-r from-primary/10 to-secondary/10 p-6 text-center w-full h-full flex flex-col justify-center">
                                     <h2 className="text-3xl font-playful text-primary mb-4">
                                         🎯 Ready to Play?
                                     </h2>
                                     <p className="text-lg text-muted-foreground mb-6 leading-relaxed font-comic">
                                         Test your reflexes! You'll have 9 rounds to perform the correct pose within 10 seconds each.
                                     </p>
                                     <div className="flex flex-col gap-4">
                                         <button
                                             onClick={startGame}
                                             className="btn-fun font-comic text-xl py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-2 border-purple-300 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                                         >
                                             🎮 Start Game
                                         </button>
                                         <button
                                             onClick={() => setCurrentScreen('instructions')}
                                             className="btn-fun font-comic text-lg py-2 bg-secondary hover:bg-secondary/80"
                                         >
                                             📖 Show Instructions Again
                                         </button>
                                     </div>
                                 </div>
                             )}

                                                         {gameStarted && !gameEnded && targetPose && (
                                 <div className="card-playful border-4 border-primary bg-gradient-to-r from-primary/20 to-secondary/20 p-2 text-center w-full h-full relative">
                                     {/* Top corners for round and score */}
                                     <div className="absolute top-2 left-2 z-10">
                                         <div className="card-playful border border-fun-purple/20 px-1 py-0.5 text-center bg-white/80 backdrop-blur-sm">
                                             <span className="text-xs text-muted-foreground font-comic block">Score</span>
                                             <span className="text-sm font-bold text-primary">{score}/{currentRound}</span>
                                         </div>
                                     </div>
                                     <div className="absolute top-2 right-2 z-10">
                                         <div className="card-playful border border-fun-orange/20 px-1 py-0.5 text-center bg-white/80 backdrop-blur-sm">
                                             <span className="text-xs text-muted-foreground font-comic block">Round</span>
                                             <span className="text-sm font-bold text-primary">{currentRound}/9</span>
                                         </div>
                                     </div>
                                     
                                     {/* Main content area */}
                                     <div className="w-full h-full flex flex-col justify-center">
                                         {isRoundCountdownActive ? (
                                             // Show round countdown
                                             <div className="text-center">
                                                 <h3 className="text-2xl font-playful text-primary mb-4">Get Ready!</h3>
                                                 <div className="relative w-32 h-32 mx-auto mb-4">
                                                     <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                                                         <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="8" fill="none" className="text-gray-200" />
                                                         <circle
                                                             cx="50"
                                                             cy="50"
                                                             r="40"
                                                             stroke="currentColor"
                                                             strokeWidth="8"
                                                             fill="none"
                                                             strokeLinecap="round"
                                                             className="text-blue-500 transition-all duration-1000 ease-linear"
                                                             style={{
                                                                 strokeDasharray: `${2 * Math.PI * 40}`,
                                                                 strokeDashoffset: `${2 * Math.PI * 40 * (1 - roundCountdown / 2)}`
                                                             }}
                                                         />
                                                     </svg>
                                                     <div className="absolute inset-0 flex items-center justify-center">
                                                         <div className="text-center">
                                                             <div className="text-3xl font-bold text-blue-600">
                                                                 {roundCountdown}s
                                                             </div>
                                                             <div className="text-sm text-muted-foreground font-comic">Next Round</div>
                                                         </div>
                                                     </div>
                                                 </div>
                                                 <p className="text-lg text-muted-foreground font-comic">
                                                     Prepare for the next pose!
                                                 </p>
                                             </div>
                                         ) : (
                                             // Show pose instruction - maximized image
                                             <>
                                                 <div className="flex justify-center items-center w-full h-full">
                                                     <img 
                                                         src={dancePoses.find(p => p.label === targetPose)?.image} 
                                                         alt={dancePoses.find(p => p.label === targetPose)?.name}
                                                         className="w-full h-full object-contain rounded-lg shadow-lg border-4 border-primary/20 animate-pulse"
                                                     />
                                                 </div>
                                             </>
                                         )}
                                     </div>
                                 </div>
                             )}

                             {gameEnded && (
                                 <div className="card-playful border-4 border-primary bg-gradient-to-br from-primary/5 via-secondary/10 to-purple-500/5 p-8 text-center w-full min-h-full flex flex-col justify-center relative overflow-hidden">
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
                                             <button
                                                 onClick={() => setShowGameStats(true)}
                                                 className="btn-fun font-comic text-lg py-4 bg-gradient-to-r from-purple-500 via-blue-500 to-purple-600 hover:from-purple-600 hover:via-blue-600 hover:to-purple-700 text-white border-2 border-purple-300 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 transform hover:-translate-y-1"
                                             >
                                                 📊 View Detailed Stats
                                             </button>
                                             <button
                                                 onClick={() => {
                                                     setGameEnded(false);
                                                     setGameStarted(false);
                                                     setCurrentRound(0);
                                                     setScore(0);
                                                     setShowGameStats(false);
                                                 }}
                                                 className="btn-fun font-comic text-lg py-4 bg-gradient-to-r from-orange-500 via-pink-500 to-orange-600 hover:from-orange-600 hover:via-pink-600 hover:to-orange-700 text-white border-2 border-orange-300 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 transform hover:-translate-y-1"
                                             >
                                                 🔄 Play Again
                                             </button>
                                             <button
                                                 onClick={() => {
                                                     setGameEnded(false);
                                                     setGameStarted(false);
                                                     setCurrentRound(0);
                                                     setScore(0);
                                                     setShowGameStats(false);
                                                     setCurrentScreen('instructions');
                                                 }}
                                                 className="btn-fun font-comic text-base py-3 bg-gradient-to-r from-secondary to-secondary/80 hover:from-secondary/90 hover:to-secondary text-white border-2 border-secondary/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 transform hover:-translate-y-1"
                                             >
                                                 📖 Back to Instructions
                                             </button>
                                         </div>
                                     </div>
                                 </div>
                             )}
                        </div>
                    </div>
                </div>

                {roundResult && (
                    <div className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 card-playful border-4 p-6 text-center ${
                        isCorrect ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50"
                    }`}>
                        <div className={`text-3xl font-playful ${isCorrect ? "text-green-600" : "text-red-600"}`}>
                            {roundResult}
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
                                    animationDelay: `${Math.random() * 2}s`,
                                    animationDuration: `${1 + Math.random() * 2}s`
                                }}
                            />
                        ))}
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

    return (
        <div className="h-full flex items-center justify-center">
            <div className="text-center">
                <div className="text-6xl mb-6 animate-bounce">🕺</div>
                <h2 className="text-3xl font-playful mb-4 text-primary">Dance Doodle Game</h2>
                <p className="text-lg text-muted-foreground font-comic">Implementation in progress...</p>
            </div>
        </div>
    );
}

export default DanceDoodleGame
