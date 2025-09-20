"use client"

import { toast } from '@/components/ui/use-toast'
import type React from "react"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import GestureGameStats from './GestureGameStats'

// RunningMode type is not exported from @mediapipe/tasks-vision, so we define it here.
type RunningMode = "IMAGE" | "VIDEO"

type GameScreen = 'instructions' | 'consent' | 'game' | 'loading'

interface GestureRoundStats {
  roundNumber: number;
  gestureName: string;
  gestureEmoji: string;
  timeTaken: number;
  completed: boolean;
}

interface GestureGameSession {
  sessionId: string;
  childId: string;
  startTime: Date;
  endTime?: Date;
  rounds: GestureRoundStats[];
  totalScore: number;
  consentData?: any;
}

interface GestureRecognizerComponentProps {
  taskId?: string | null;
  tournamentId?: string | null;
}

const GestureRecognizerComponent: React.FC<GestureRecognizerComponentProps> = ({ taskId, tournamentId }) => {
    const videoRef = useRef<HTMLVideoElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [webcamRunning, setWebcamRunning] = useState(false)
    const [isLoading, setIsLoading] = useState(false) // Changed to false since we don't need to load MediaPipe
    const [currentScreen, setCurrentScreen] = useState<GameScreen>('instructions')
    const [isConnected, setIsConnected] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false)

    // Game state
    const [currentRound, setCurrentRound] = useState(0)
    const [score, setScore] = useState(0)
    const [gameStarted, setGameStarted] = useState(false)
    const [gameEnded, setGameEnded] = useState(false)
    const [targetGesture, setTargetGesture] = useState<string>("")
    const [timeLeft, setTimeLeft] = useState(10)
    const [roundResult, setRoundResult] = useState<string>("")
    const [detectedGesture, setDetectedGesture] = useState<string>("")
    const [detectedConfidence, setDetectedConfidence] = useState<number>(0)
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
    const [isProcessingRound, setIsProcessingRound] = useState(false)
    const [countdown, setCountdown] = useState<number | null>(null)
    const [showCountdown, setShowCountdown] = useState(false)
    const [usedGestures, setUsedGestures] = useState<string[]>([])

    // Consent screen state
    const [childName, setChildName] = useState("")
    const [childAge, setChildAge] = useState("")
    const [suspectedASD, setSuspectedASD] = useState(false)
    const [isTrainingAllowed, setIsTrainingAllowed] = useState(false)

    // Round countdown state for 2-second gap between rounds
    const [roundCountdown, setRoundCountdown] = useState<number>(2)
    const [isRoundCountdownActive, setIsRoundCountdownActive] = useState<boolean>(false)

    // Confetti and celebration state
    const [showConfetti, setShowConfetti] = useState<boolean>(false)
    const [showCongratulations, setShowCongratulations] = useState<boolean>(false)
 
     // Game session and stats state
     const [gameSession, setGameSession] = useState<GestureGameSession | null>(null)
     const [showGameStats, setShowGameStats] = useState<boolean>(false)
     const [roundStartTime, setRoundStartTime] = useState<number>(0)

    // Refs for cleanup and avoiding stale closures
    const timerRef = useRef<NodeJS.Timeout | null>(null)
    const resultTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const countdownTimerRef = useRef<NodeJS.Timeout | null>(null)
    const captureIntervalRef = useRef<NodeJS.Timeout | null>(null)
    const currentRoundRef = useRef<number>(0)
    const isProcessingRoundRef = useRef<boolean>(false)
    const isCorrectRef = useRef<boolean | null>(null)
    const startNextRoundRef = useRef<(() => void) | null>(null)
    const roundCountdownRef = useRef<NodeJS.Timeout | null>(null)
    const usedGesturesRef = useRef<string[]>([])
    const targetGestureRef = useRef<string>("")

    const videoHeight = "480px"
    const videoWidth = "640px"

    // API endpoint for gesture detection
    const API_ENDPOINT = 'http://localhost:8000/predictGesture';
 
     // Create session ID
     const createSessionId = useCallback(() => {
         const childId = localStorage.getItem('selectedChildId') || 'unknown';
         const dateTime = new Date().toISOString().replace(/[:.]/g, '-');
         return `${childId}_${dateTime}`;
     }, []);

     // Save game data to backend
     const saveGameDataToBackend = useCallback(async (gameSession: GestureGameSession) => {
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

             // Prepare gesture completion times
             const gestureTimes = {
                 thumbs_up: null,
                 thumbs_down: null,
                 victory: null,
                 butterfly: null,
                 spectacle: null,
                 heart: null,
                 pointing_up: null,
                 iloveyou: null,
                 dua: null,
                 closed_fist: null,
                 open_palm: null
             };

             // Map gesture names to completion times
             console.log('=== DEBUGGING GESTURE MAPPING ===');
             console.log('Total rounds:', gameSession.rounds.length);
             gameSession.rounds.forEach((round, index) => {
                 console.log(`Round ${index + 1}:`, {
                     gestureName: round.gestureName,
                     completed: round.completed,
                     timeTaken: round.timeTaken
                 });
                 
                 const gestureName = round.gestureName.toLowerCase().replace(/\s+/g, '');
                 console.log('Mapping gesture:', round.gestureName, 'to lowercase:', gestureName);
                 
                 if (gestureName === 'thumbsup' || gestureName === 'thumbs_up') {
                     gestureTimes.thumbs_up = round.completed ? round.timeTaken : null;
                     console.log('Mapped to thumbs_up:', round.timeTaken);
                 } else if (gestureName === 'thumbsdown' || gestureName === 'thumbs_down') {
                     gestureTimes.thumbs_down = round.completed ? round.timeTaken : null;
                     console.log('Mapped to thumbs_down:', round.timeTaken);
                 } else if (gestureName === 'victory') {
                     gestureTimes.victory = round.completed ? round.timeTaken : null;
                     console.log('Mapped to victory:', round.timeTaken);
                 } else if (gestureName === 'butterfly') {
                     gestureTimes.butterfly = round.completed ? round.timeTaken : null;
                     console.log('Mapped to butterfly:', round.timeTaken);
                 } else if (gestureName === 'spectacle') {
                     gestureTimes.spectacle = round.completed ? round.timeTaken : null;
                     console.log('Mapped to spectacle:', round.timeTaken);
                 } else if (gestureName === 'heart') {
                     gestureTimes.heart = round.completed ? round.timeTaken : null;
                     console.log('Mapped to heart:', round.timeTaken);
                 } else if (gestureName === 'pointingup' || gestureName === 'pointing_up') {
                     gestureTimes.pointing_up = round.completed ? round.timeTaken : null;
                     console.log('Mapped to pointing_up:', round.timeTaken);
                 } else if (gestureName === 'iloveyou' || gestureName === 'i_love_you') {
                     gestureTimes.iloveyou = round.completed ? round.timeTaken : null;
                     console.log('Mapped to iloveyou:', round.timeTaken);
                 } else if (gestureName === 'dua') {
                     gestureTimes.dua = round.completed ? round.timeTaken : null;
                     console.log('Mapped to dua:', round.timeTaken);
                 } else if (gestureName === 'closedfist' || gestureName === 'closed_fist') {
                     gestureTimes.closed_fist = round.completed ? round.timeTaken : null;
                     console.log('Mapped to closed_fist:', round.timeTaken);
                 } else if (gestureName === 'openpalm' || gestureName === 'open_palm') {
                     gestureTimes.open_palm = round.completed ? round.timeTaken : null;
                     console.log('Mapped to open_palm:', round.timeTaken);
                 } else {
                     console.log('No mapping found for:', round.gestureName);
                 }
             });
             console.log('Final gestureTimes object:', gestureTimes);
             console.log('=== END DEBUGGING ===');

             const requestData = {
                 sessionId: gameSession.sessionId,
                 dateTime: gameSession.startTime,
                 childId: childData?.id?.toString() || '1',
                 age: gameSession.consentData?.childAge ? parseInt(gameSession.consentData.childAge) : (childData?.dateOfBirth ? calculateAge(childData.dateOfBirth) : 8),
                 schoolTaskId: taskId, // Include school task ID if available
                 tournamentId: tournamentId, // Include tournament ID if available
                 ...gestureTimes,
                 videoURL: "https://example.com/dummy-video.mp4", // Dummy URL for now
                 isTrainingAllowed: gameSession.consentData?.dataConsent === true,
                 suspectedASD: gameSession.consentData?.suspectedASD || false,
                 isASD: null // Will be populated by ML model later
             };

             console.log('Consent data:', gameSession.consentData);
             console.log('Data consent value:', gameSession.consentData?.dataConsent);
             console.log('Saving game data to backend:', requestData);

             const response = await fetch('http://localhost:8084/api/gesture-game/save', {
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
                // Create a dummy image for testing
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

                console.log('Testing gesture API connection...');
                const response = await fetch(API_ENDPOINT, {
                    method: 'POST',
                    body: formData,
                });
                
                console.log('API test response status:', response.status);
                
                if (response.ok) {
                    const testResult = await response.json();
                    console.log('API test response:', testResult);
                    setIsConnected(true);
                    console.log('Gesture API connection successful');
                } else {
                    console.log('API test failed with status:', response.status);
                    setIsConnected(false);
                }
            } catch (error) {
                console.log('Gesture API not available, will use demo mode:', error);
                setIsConnected(false);
            }
        };
        
        testConnection();
    }, []);

    // Load child information from localStorage
    useEffect(() => {
        const selectedChild = localStorage.getItem('selectedChild');
        if (selectedChild) {
            try {
                const childData = JSON.parse(selectedChild);
                setChildName(childData.name || "");
                
                // Calculate age from date of birth
                if (childData.dateOfBirth) {
                    const birthDate = new Date(childData.dateOfBirth);
                    const today = new Date();
                    const age = today.getFullYear() - birthDate.getFullYear();
                    const monthDiff = today.getMonth() - birthDate.getMonth();
                    const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate()) ? age - 1 : age;
                    setChildAge(actualAge.toString());
                }
            } catch (error) {
                console.error('Error parsing child data:', error);
            }
        }
    }, []);

    // Memoized gestures array
    const gestures = useMemo(
        () => [
            { name: "Closed Fist", label: "closed_fist", emoji: "✊", image: "/gesture_images/closed_fist.jpg", description: "Make a strong fist like a superhero!" },
            { name: "Open Palm", label: "open_palm", emoji: "✋", image: "/gesture_images/open_palm.jpg", description: "Show your palm like saying hello!" },
            { name: "Pointing Up", label: "pointing_up", emoji: "☝️", image: "/gesture_images/pointing_up.jpg", description: "Point your finger up to the sky!" },
            { name: "Thumbs Down", label: "thumbs_down", emoji: "👎", image: "/gesture_images/thumbs_down.jpg", description: "Show thumbs down like a judge!" },
            { name: "Thumbs Up", label: "thumbs_up", emoji: "👍", image: "/gesture_images/thumbs_up.jpg", description: "Give a thumbs up for good job!" },
            { name: "Victory", label: "victory", emoji: "✌️", image: "/gesture_images/victory.jpg", description: "Make a peace sign with your fingers!" },
            { name: "I Love You", label: "iloveyou", emoji: "🤟", image: "/gesture_images/iloveyou.jpg", description: "Show the love sign with your hand!" },
            { name: "Butterfly", label: "butterfly", emoji: "🦋", image: "/gesture_images/butterfly.jpg", description: "Flap your hands like a beautiful butterfly!" },
            { name: "Dua", label: "dua", emoji: "🤲", image: "/gesture_images/dua.jpg", description: "Hold your hands together in prayer position!" },
            { name: "Heart", label: "heart", emoji: "❤️", image: "/gesture_images/heart.jpg", description: "Make a heart shape with your hands!" },
            { name: "Spectacle", label: "spectacle", emoji: "🕶️", image: "/gesture_images/spectacle.jpg", description: "Make circles with your fingers like glasses!" },
        ],
        [],
    )

    // Webcam setup - simplified like mirror posture game
    const [isCameraOn, setIsCameraOn] = useState(false);
    const streamRef = useRef<MediaStream | null>(null);

    // Initialize webcam - optimized for performance
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

    // Stop webcam - same as mirror posture game
    const stopWebcam = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        
        // Also pause the video element to ensure it stops
        if (videoRef.current) {
            videoRef.current.pause();
            videoRef.current.srcObject = null;
        }
        
        setIsCameraOn(false);
        setWebcamRunning(false);
    }, []);

    // Direct function to handle round end without circular dependency
    const handleRoundEndDirect = useCallback(() => {
        if (isProcessingRoundRef.current) return;
        isProcessingRoundRef.current = true;
        setIsProcessingRound(true);
 
         if (isCorrectRef.current === null) {
             setRoundResult("Time's up! ⏰");
             setIsCorrect(false);
             isCorrectRef.current = false;
             
             // Add incomplete round data to game session (prevent duplicates)
             // Always use the target gesture, not the detected gesture
             if (!targetGestureRef.current) {
                 console.error('No target gesture set for failed round', currentRoundRef.current);
                 return;
             }
             
             const currentGesture = gestures.find(g => g.label === targetGestureRef.current);
             if (currentGesture && gameSession) {
                 console.log('Recording failed round:', {
                     roundNumber: currentRoundRef.current,
                     targetGesture: targetGestureRef.current,
                     gestureName: currentGesture.name,
                     gestureEmoji: currentGesture.emoji
                 });
                 
                 const roundStats: GestureRoundStats = {
                     roundNumber: currentRoundRef.current,
                     gestureName: currentGesture.name,
                     gestureEmoji: currentGesture.emoji,
                     timeTaken: 10, // Full 10 seconds for incomplete
                     completed: false
                 };
                 
                 setGameSession(prev => {
                     if (prev) {
                         // Check if this round number already exists to prevent duplicates
                         const roundExists = prev.rounds.some(round => round.roundNumber === currentRoundRef.current);
                         if (roundExists) {
                             console.log(`Round ${currentRoundRef.current} already exists, skipping duplicate entry`);
                             return prev;
                         }
                         
                         console.log('Adding failed round to game session:', roundStats);
                         return {
                             ...prev,
                             rounds: [...prev.rounds, roundStats]
                         };
                     }
                     return prev;
                 });
             } else {
                 console.error('Failed to record round: missing gesture or game session', {
                     targetGesture: targetGestureRef.current,
                     currentGesture,
                     gameSession: !!gameSession
                 });
             }
         }
 
         // Use setTimeout with a ref to avoid circular dependency
         resultTimeoutRef.current = setTimeout(() => {
             // Call startNextRound through a ref to avoid circular dependency
             if (startNextRoundRef.current) {
                 startNextRoundRef.current();
             }
         }, 2000);
     }, [gestures, gameSession, saveGameDataToBackend]);

    // Start round timer after countdown
    const startRoundTimer = useCallback(() => {
        // Reset time to 10 seconds
        setTimeLeft(10);
        
        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timerRef.current!);
                    timerRef.current = null;
                    console.log('⏰ Time up for round', currentRoundRef.current);
                    handleRoundEndDirect();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }, [handleRoundEndDirect]);

    // Start round countdown for 2-second gap
    const startRoundCountdown = useCallback(() => {
        // Stop any existing timers first
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        if (roundCountdownRef.current) {
            clearInterval(roundCountdownRef.current);
            roundCountdownRef.current = null;
        }
        
        setIsRoundCountdownActive(true);
        setRoundCountdown(2);
        
        roundCountdownRef.current = setInterval(() => {
            setRoundCountdown(prev => {
                if (prev <= 1) {
                    // Round countdown finished, start the timer
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
    }, [startRoundTimer]);

    // Centralized function to start the next round or end the game
    const startNextRound = useCallback(() => {
        console.log('🔄 Starting next round...', {
            currentRound: currentRoundRef.current,
            usedGestures: usedGestures.length,
            gameStarted,
            gameEnded
        });
        
        // Stop any existing timers and clear all timer refs
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        if (roundCountdownRef.current) {
            clearInterval(roundCountdownRef.current);
            roundCountdownRef.current = null;
        }
        if (resultTimeoutRef.current) {
            clearTimeout(resultTimeoutRef.current);
            resultTimeoutRef.current = null;
        }
        
        // Reset all timer-related state
        setRoundResult("");
        setIsCorrect(null);
        isCorrectRef.current = null;
        setIsProcessingRound(false);
        isProcessingRoundRef.current = false;
        setTimeLeft(10); // Reset timer to 10 seconds
        setIsRoundCountdownActive(false);
        setRoundCountdown(2);

        if (currentRoundRef.current < 11) { // Changed from 7 to 11
            const nextRound = currentRoundRef.current + 1;
            setCurrentRound(nextRound);
            currentRoundRef.current = nextRound;

            // Get available gestures (not used yet) - use ref for synchronous access
            const availableGestures = gestures.filter(g => !usedGesturesRef.current.includes(g.label));
            console.log('Available gestures for next round:', availableGestures.map(g => g.label));
            console.log('Used gestures so far:', usedGesturesRef.current);
            
            // Only select from available gestures - never repeat
            const randomGesture = availableGestures[Math.floor(Math.random() * availableGestures.length)];
            
            // Update both state and ref synchronously
            targetGestureRef.current = randomGesture.label;
            setTargetGesture(randomGesture.label);
            usedGesturesRef.current = [...usedGesturesRef.current, randomGesture.label];
            setUsedGestures(usedGesturesRef.current);
            setDetectedGesture("");
            setDetectedConfidence(0);

            console.log(`🎯 Round ${nextRound}: Target gesture set to ${randomGesture.label}`);
  
             // Start round countdown for 2-second gap (like mirror posture game)
             startRoundCountdown();
         } else {
             console.log('🏁 Game finished! All 11 rounds completed'); // Changed from 7 to 11
             
             // Stop all timers when game ends
             if (timerRef.current) {
                 clearInterval(timerRef.current);
                 timerRef.current = null;
             }
             if (roundCountdownRef.current) {
                 clearInterval(roundCountdownRef.current);
                 roundCountdownRef.current = null;
             }
             if (resultTimeoutRef.current) {
                 clearTimeout(resultTimeoutRef.current);
                 resultTimeoutRef.current = null;
             }
             
             // Stop camera when game ends
             stopWebcam();
             
             // Finalize game session
             setGameSession(prev => {
                 if (prev) {
                     const completedSession = {
                         ...prev,
                         endTime: new Date()
                     };
                     
                     // Save game data to backend
                     saveGameDataToBackend(completedSession);
                     
                     return completedSession;
                 }
                 return prev;
             });
             
             setGameEnded(true);
             setGameStarted(false);
             setIsRoundCountdownActive(false);
             
             // Trigger confetti and congratulations
             setShowConfetti(true);
             setShowCongratulations(true);
             
             // Hide confetti and congratulations after 2 seconds
             setTimeout(() => {
                 setShowConfetti(false);
                 setShowCongratulations(false);
             }, 2000);
         }
     }, [gestures, startRoundCountdown, stopWebcam, saveGameDataToBackend])

    // Assign function to ref to avoid circular dependency
    useEffect(() => {
        startNextRoundRef.current = startNextRound;
    }, [startNextRound]);

    // Function to handle the end of a round (timer runs out) - kept for compatibility
    const handleRoundEnd = useCallback(() => {
        handleRoundEndDirect()
    }, [handleRoundEndDirect])

    // Function to handle a correct gesture detection
    const handleGestureDetected = useCallback((gesture: string, confidence: number) => {
        console.log('Gesture detected:', { 
            gesture, 
            confidence, 
            targetGesture, 
            gameStarted, 
            gameEnded, 
            isProcessingRound: isProcessingRoundRef.current,
            currentRound: currentRoundRef.current
        })
        
        // Simplified validation - only check if game is active
        if (!gameStarted || gameEnded) {
            console.log('Gesture detection blocked: Game not active');
            return;
        }
        
        // Always update the detected gesture display
        setDetectedGesture(gesture);
        setDetectedConfidence(confidence);

        // Check if this is the correct gesture with sufficient confidence
        if (gesture === targetGestureRef.current && confidence >= 0.65) { // Changed threshold from 0.8 to 0.65 (65%)
                         console.log('✅ Correct gesture detected! Moving to next round...', {
                 gesture,
                 targetGesture: targetGestureRef.current,
                 confidence,
                 currentRound: currentRoundRef.current
             });
            
            // Immediately mark as processing to prevent multiple detections
            isProcessingRoundRef.current = true;
            setIsProcessingRound(true);
            
            // Update score and show success
            setScore(prev => prev + 1);
            setRoundResult("Correct! 🎉");
            setIsCorrect(true);
            isCorrectRef.current = true;
 
             // Calculate time taken for this round
             const timeTaken = 10 - timeLeft; // 10 seconds minus time left
             
             // Add round data to game session (prevent duplicates)
             // Always use the target gesture, not the detected gesture
             if (!targetGestureRef.current) {
                 console.error('No target gesture set for round', currentRoundRef.current);
                 return;
             }
             
             const currentGesture = gestures.find(g => g.label === targetGestureRef.current);
             if (currentGesture && gameSession) {
                 console.log('Recording successful round:', {
                     roundNumber: currentRoundRef.current,
                     targetGesture: targetGestureRef.current,
                     gestureName: currentGesture.name,
                     gestureEmoji: currentGesture.emoji,
                     timeTaken: timeTaken
                 });
                 
                 const roundStats: GestureRoundStats = {
                     roundNumber: currentRoundRef.current,
                     gestureName: currentGesture.name,
                     gestureEmoji: currentGesture.emoji,
                     timeTaken: timeTaken,
                     completed: true
                 };
                 
                 setGameSession(prev => {
                     if (prev) {
                         // Check if this round number already exists to prevent duplicates
                         const roundExists = prev.rounds.some(round => round.roundNumber === currentRoundRef.current);
                         if (roundExists) {
                             console.log(`Round ${currentRoundRef.current} already exists, skipping duplicate entry`);
                             return prev;
                         }
                         
                         console.log('Adding successful round to game session:', roundStats);
                         return {
                             ...prev,
                             rounds: [...prev.rounds, roundStats],
                             totalScore: prev.totalScore + 1
                         };
                     }
                     return prev;
                 });
             } else {
                 console.error('Failed to record round: missing gesture or game session', {
                     targetGesture: targetGestureRef.current,
                     currentGesture,
                     gameSession: !!gameSession
                 });
             }
 
             // Stop all timers immediately and clear the refs
             if (timerRef.current) {
                 clearInterval(timerRef.current);
                 timerRef.current = null;
             }
             if (roundCountdownRef.current) {
                 clearInterval(roundCountdownRef.current);
                 roundCountdownRef.current = null;
             }
 
             // Move to next round after a short delay
             resultTimeoutRef.current = setTimeout(() => {
                 console.log('🚀 Starting next round after correct gesture...');
                 startNextRound();
             }, 1500); // Reduced delay for faster progression
         } else {
             console.log('Gesture detected but not correct:', {
                 detected: gesture,
                 target: targetGestureRef.current,
                 confidence,
                 threshold: 0.65 // Changed threshold to 0.65
             });
         }
    }, [gameStarted, gameEnded, startNextRound, timeLeft, gestures, gameSession])

    // Main game start function
    const startGame = useCallback(() => {
        // Stop any existing timers first
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        if (roundCountdownRef.current) {
            clearInterval(roundCountdownRef.current);
            roundCountdownRef.current = null;
        }
        if (resultTimeoutRef.current) {
            clearTimeout(resultTimeoutRef.current);
            resultTimeoutRef.current = null;
        }
        
        setGameStarted(true);
        setGameEnded(false);
        setCurrentRound(0); // Will be incremented to 1 by startNextRound
        currentRoundRef.current = 0;
        setScore(0);
        targetGestureRef.current = ""; // Reset target gesture ref
        setTargetGesture("");
        setDetectedGesture("");
        setDetectedConfidence(0);
        setRoundResult("");
        setIsCorrect(null);
        isCorrectRef.current = null;
        setIsProcessingRound(false);
        isProcessingRoundRef.current = false;
        usedGesturesRef.current = []; // Reset used gestures ref for new game
        setUsedGestures([]); // Reset used gestures for new game
        setTimeLeft(10); // Reset timer
        setIsRoundCountdownActive(false);
        setRoundCountdown(2);
        
        // Initialize game session
        const sessionId = createSessionId();
        const childId = localStorage.getItem('selectedChildId') || 'unknown';
        const newSession: GestureGameSession = {
            sessionId,
            childId,
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
        setRoundStartTime(Date.now());
        
        // Start countdown before the game
        setShowCountdown(true);
        setCountdown(3);
        
        countdownTimerRef.current = setInterval(() => {
            setCountdown(prev => {
                if (prev && prev > 1) {
                    return prev - 1;
                } else {
                    // Countdown finished, start the actual game
                    clearInterval(countdownTimerRef.current!);
                    countdownTimerRef.current = null;
                    setShowCountdown(false);
                    setCountdown(null);
                    
                    // Start the first round immediately after countdown
                    startNextRound();
                    return null;
                }
            });
        }, 1000);
    }, [startNextRound, createSessionId, childName, childAge, suspectedASD, isTrainingAllowed]);
    
    // Function to reset the game state
    const resetGame = useCallback(() => {
        // Stop all timers first
        if (timerRef.current) clearInterval(timerRef.current);
        if (resultTimeoutRef.current) clearTimeout(resultTimeoutRef.current);
        if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
        if (roundCountdownRef.current) clearInterval(roundCountdownRef.current);
        
        // Stop camera
        stopWebcam();
        
        setGameStarted(false);
        setGameEnded(false);
        setCurrentRound(0);
        currentRoundRef.current = 0;
        setScore(0);
        targetGestureRef.current = ""; // Reset target gesture ref
        setTargetGesture("");
        setDetectedGesture("");
        setDetectedConfidence(0);
        setRoundResult("");
        setIsCorrect(null);
        isCorrectRef.current = null;
        setTimeLeft(10);
        setIsProcessingRound(false);
        isProcessingRoundRef.current = false;
        usedGesturesRef.current = []; // Reset used gestures ref
        setUsedGestures([]); // Reset used gestures
        
        // Reset countdown state
        setShowCountdown(false);
        setCountdown(null);
        
        // Reset round countdown state
        setRoundCountdown(2);
        setIsRoundCountdownActive(false);
   
        // Reset consent screen state
        setChildName("");
        setChildAge("");
        setSuspectedASD(false);
        setIsTrainingAllowed(false);
        
        // Reset confetti and congratulations state
        setShowConfetti(false);
        setShowCongratulations(false);
        
        // Reset game session and stats
        setGameSession(null);
        setShowGameStats(false);
        setRoundStartTime(0);
        
        // Restart camera if we're on the game screen
        if (currentScreen === 'game') {
            console.log('Restarting camera after game reset...');
            // Use setTimeout to ensure state updates are processed first
            setTimeout(() => {
                initializeWebcam();
            }, 200); // Increased delay to ensure all state updates are processed
        }
    }, [stopWebcam, currentScreen, initializeWebcam])

    // Initialize webcam when game screen is active
    useEffect(() => {
        if (currentScreen === 'game' && !gameEnded) {
            console.log('Initializing webcam...');
            initializeWebcam();
        } else {
            console.log('Stopping webcam - leaving game screen or game ended');
            stopWebcam();
        }

        return () => {
            console.log('Cleanup: stopping webcam');
            stopWebcam();
        }
    }, [currentScreen, gameEnded, initializeWebcam, stopWebcam]);

    // Prediction loop using frame capture and API calls - optimized like mirror posture game
    const predictWebcam = useCallback(() => {
        if (!isConnected || !isCameraOn || !videoRef.current || !canvasRef.current || isProcessing || gameEnded) {
            return;
        }

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        if (!ctx || video.videoWidth === 0) return;

        // Set canvas dimensions to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Draw current video frame to canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Send frame to API for prediction
        const sendFrame = async () => {
            if (isProcessing) return;
            
            try {
                setIsProcessing(true);
                
                // Convert canvas to blob - optimized quality for performance
                const blob = await new Promise<Blob>((resolve) => {
                    canvas.toBlob(resolve as BlobCallback, 'image/jpeg', 0.6);
                });

                if (!blob) return;

                // Create FormData for API request
                const formData = new FormData();
                formData.append('file', blob, 'frame.jpg');

                // Send to API backend
                const response = await fetch(API_ENDPOINT, {
                    method: 'POST',
                    body: formData,
                });

                if (response.ok) {
                    const result = await response.json();
                    
                    // Handle different response formats from the API
                    let prediction = null;
                    let confidence = 0;
                    
                    if (result.prediction && result.confidence) {
                        // New format: {prediction: "...", confidence: 0.0}
                        prediction = result.prediction;
                        confidence = result.confidence;
                    } else if (typeof result === 'string') {
                        // Old format: just the prediction string
                        prediction = result;
                        confidence = 0.8; // Default confidence for old format
                    }
                    
                    // Check if prediction exists and is valid - simplified like mirror posture game
                    if (prediction && prediction !== "none" && prediction !== "no_hands_detected" && prediction !== "error") {
                        // Always update the detected gesture display
                        setDetectedGesture(prediction);
                        setDetectedConfidence(confidence);
                        
                        // Process for game logic if game is active - simplified logic
                        if (gameStarted && !gameEnded && !isProcessingRoundRef.current) {
                            handleGestureDetected(prediction, confidence);
                        }
                    }
                    setIsConnected(true);
                } else {
                    throw new Error('API request failed');
                }
            } catch (error) {
                // Mock detection for development (remove in production)
                console.log('API not available, using mock detection');
                setIsConnected(false);
                
                // Simulate random detection for testing (fallback when API is not available)
                if (Math.random() < 0.05) { // 5% chance per frame for testing
                    const gestures = ['closed_fist', 'open_palm', 'pointing_up', 'thumbs_down', 'thumbs_up', 'victory', 'iloveyou', 'butterfly', 'dua', 'heart', 'spectacle'];
                    const randomGesture = gestures[Math.floor(Math.random() * gestures.length)];
                    setDetectedGesture(randomGesture);
                    setDetectedConfidence(0.8);
                }
            } finally {
                setIsProcessing(false);
            }
        };

        // Send frame immediately only if game hasn't ended
        if (!gameEnded) {
            sendFrame();
        }
    }, [isConnected, isCameraOn, handleGestureDetected, isProcessing, gameStarted, gameEnded])

    // Determine if game is active (optimized with useMemo)
    const isActive = useMemo(() => {
        return currentScreen === 'game' && gameStarted && !gameEnded;
    }, [currentScreen, gameStarted, gameEnded]);

    // Start/stop frame capture based on game state - optimized for performance
    useEffect(() => {
        if (isActive && isCameraOn) {
            captureIntervalRef.current = setInterval(predictWebcam, 50); // Increased to 50ms (20 FPS) for smoother performance
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
            console.log('Game ended, stopping camera...');
            stopWebcam();
        }
    }, [gameEnded, isCameraOn, stopWebcam]);

    // Additional cleanup when game ends to ensure camera stops
    useEffect(() => {
        if (gameEnded) {
            console.log('Game ended, performing comprehensive cleanup...');
            
            // Clear any ongoing prediction intervals
            if (captureIntervalRef.current) {
                clearInterval(captureIntervalRef.current);
                captureIntervalRef.current = null;
            }
            
            // Clear any ongoing timers
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
            
            // Ensure camera is stopped
            if (isCameraOn) {
                console.log('Force stopping camera after game end...');
                stopWebcam();
            }
            
            // Reset processing states
            setIsProcessing(false);
            setIsProcessingRound(false);
            isProcessingRoundRef.current = false;
        }
    }, [gameEnded, isCameraOn, stopWebcam]);

    // Cleanup all timers and animations on component unmount
    useEffect(() => {
        return () => {
            console.log('Component unmounting, cleaning up...');
            stopWebcam();
            
            // Clear timers
            if (timerRef.current) clearInterval(timerRef.current);
            if (resultTimeoutRef.current) clearTimeout(resultTimeoutRef.current);
            if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
            if (captureIntervalRef.current) clearInterval(captureIntervalRef.current);
            if (roundCountdownRef.current) clearInterval(roundCountdownRef.current);
        }
    }, [stopWebcam]);
    
    if (isLoading) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-6 animate-bounce">🎯</div>
                    <h2 className="text-3xl font-playful mb-4 text-primary">Loading...</h2>
                    <p className="text-lg text-muted-foreground font-comic">Preparing gesture recognition system</p>
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
                            <div className="text-8xl mb-4 animate-bounce">🎮</div>
                            <h1 className="text-5xl font-playful bg-gradient-to-r from-purple-600 via-pink-500 to-blue-600 bg-clip-text text-transparent mb-4">
                                Hand Gesture Adventure!
                            </h1>
                            <p className="text-2xl font-comic text-muted-foreground">
                                Show your amazing hand moves and become a gesture superstar! 🌟
                            </p>
                        </div>
                        <div className="card-playful border-4 border-primary bg-gradient-to-r from-primary/10 to-secondary/10 p-8 mb-8">
                            <h2 className="text-4xl font-playful text-primary mb-6 text-center">
                                🎯 What's This Game About?
                            </h2>
                            <p className="text-xl text-muted-foreground leading-relaxed font-comic text-center">
                                Hand Gesture Adventure helps you practice making different hand gestures! 
                                You'll see a big picture showing how to make a gesture, and then you copy it with your hand. 
                                It's like playing copycat with your hands! ✨
                            </p>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6 mb-8">
                            <div className="card-playful border-2 border-fun-purple/20 p-6 text-center hover:scale-105 transition-all duration-300">
                                <div className="text-6xl mb-4 animate-bounce">1️⃣</div>
                                <h4 className="text-2xl font-playful text-primary mb-3">Look at the Gesture</h4>
                                <p className="text-lg text-muted-foreground font-comic">
                                    We'll show you a big, colorful picture of how to make a hand gesture
                                </p>
                            </div>
                            <div className="card-playful border-2 border-fun-orange/20 p-6 text-center hover:scale-105 transition-all duration-300">
                                <div className="text-6xl mb-4 animate-bounce">2️⃣</div>
                                <h4 className="text-2xl font-playful text-primary mb-3">Copy the Gesture</h4>
                                <p className="text-lg text-muted-foreground font-comic">
                                    Look in the camera and make the same hand gesture!
                                </p>
                            </div>
                            <div className="card-playful border-2 border-fun-green/20 p-6 text-center hover:scale-105 transition-all duration-300">
                                <div className="text-6xl mb-4 animate-bounce">3️⃣</div>
                                <h4 className="text-2xl font-playful text-primary mb-3">Get Points!</h4>
                                <p className="text-lg text-muted-foreground font-comic">
                                    When you make the right gesture, you get a point and hear a happy sound!
                                </p>
                            </div>
                            <div className="card-playful border-2 border-fun-yellow/20 p-6 text-center hover:scale-105 transition-all duration-300">
                                <div className="text-6xl mb-4 animate-bounce">4️⃣</div>
                                <h4 className="text-2xl font-playful text-primary mb-3">Play 11 Rounds</h4>
                                <p className="text-lg text-muted-foreground font-comic">
                                    Try to copy 11 different gestures. You have 10 seconds for each one!
                                </p>
                            </div>
                        </div>
                        <div className="card-playful border-4 border-primary bg-gradient-to-r from-primary/10 to-secondary/10 p-8 mb-8">
                            <h3 className="text-3xl font-playful text-primary mb-6 text-center">Available Gestures:</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {gestures.map((gesture, index) => (
                                    <div key={index} className="card-playful border-2 border-fun-purple/20 p-4 text-center hover:scale-105 transition-all duration-300 group">
                                        <div className="text-4xl mb-3 group-hover:animate-bounce">{gesture.emoji}</div>
                                        <div className="text-lg font-playful text-primary mb-2">{gesture.name}</div>
                                        <div className="text-sm text-muted-foreground font-comic">{gesture.description}</div>
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
                                {countdown === 3 ? "🎮 Camera is setting up..." : 
                                 countdown === 2 ? "🎯 Prepare your hands!" : 
                                 "🚀 Let's play!"}
                            </div>
                            {/* Animated background elements */}
                            <div className="absolute top-1/4 left-1/4 text-6xl animate-spin text-white/20">🎮</div>
                            <div className="absolute top-1/3 right-1/4 text-5xl animate-bounce text-white/20">✋</div>
                            <div className="absolute bottom-1/3 left-1/3 text-4xl animate-pulse text-white/20">👋</div>
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
                                     {detectedGesture && gameStarted && !gameEnded && (
                                         <div className="absolute bottom-2 left-1/2 -translate-x-1/2 card-playful border-2 border-secondary p-2 text-center bg-white/80 backdrop-blur-sm">
                                             <div className="text-sm font-playful text-primary">
                                                 {/* Detected: {detectedGesture} ({(detectedConfidence * 100).toFixed(1)}%) */}
                                             </div>
                                         </div>
                                     )}
                                 </>
                             ) : (
                                 // Game completion screen in camera box
                                 <div className="w-full h-full bg-gradient-to-br from-purple-600 via-pink-500 to-blue-600 rounded-2xl shadow-2xl border-4 border-primary relative overflow-hidden">
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
                                             Final Score: {score}/11
                                         </div>
                                         
                                         <div className="text-lg font-comic mb-2 text-center drop-shadow-md">
                                             {score === 11 ? "Perfect! You're a gesture master! 🌟" : 
                                              score >= 8 ? "Great job! You're getting better! 👍" : 
                                              "Keep practicing! You'll improve! 💪"}
                                         </div>
                                         
                                         <div className="text-xs font-comic text-center opacity-90 drop-shadow-sm mb-3">
                                             {score === 11 ? "Incredible performance! You've mastered all gestures!" :
                                              score >= 8 ? "Excellent work! You're on your way to becoming a gesture expert!" :
                                              "Good effort! Every practice session makes you stronger!"}
                                         </div>
                                         
                                         {/* Achievement badges */}
                                         <div className="flex gap-2 flex-wrap justify-center">
                                             {score === 11 && (
                                                 <div className="bg-yellow-400/80 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold animate-pulse">
                                                     🏅 Perfect
                                                 </div>
                                             )}
                                             {score >= 8 && (
                                                 <div className="bg-blue-400/80 text-blue-900 px-2 py-1 rounded-full text-xs font-bold">
                                                     ⭐ Great
                                                 </div>
                                             )}
                                             {score >= 5 && (
                                                 <div className="bg-green-400/80 text-green-900 px-2 py-1 rounded-full text-xs font-bold">
                                                     🎯 Good
                                                 </div>
                                             )}
                                         </div>
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
                                        Test your reflexes! You'll have 11 rounds to perform the correct gesture within 10 seconds each.
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

                            {gameStarted && !gameEnded && targetGesture && (
                                <div className="card-playful border-4 border-primary bg-gradient-to-r from-primary/20 to-secondary/20 p-2 text-center w-full h-full relative">
                                    {/* Top corners for round and score */}
                                    <div className="absolute top-2 left-2 z-10">
                                        <div className="card-playful border border-fun-purple/20 px-1 py-0.5 text-center bg-white/80 backdrop-blur-sm">
                                            <span className="text-xs text-muted-foreground font-comic block">Score</span>
                                            <span className="text-sm font-bold text-primary">{score}</span>
                                        </div>
                                    </div>
                                    <div className="absolute top-2 right-2 z-10">
                                        <div className="card-playful border border-fun-orange/20 px-1 py-0.5 text-center bg-white/80 backdrop-blur-sm">
                                            <span className="text-xs text-muted-foreground font-comic block">Round</span>
                                            <span className="text-sm font-bold text-primary">{currentRound}/11</span>
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
                                                    Prepare for the next gesture!
                                                </p>
                                            </div>
                                        ) : (
                                            // Show gesture instruction - maximized image
                                            <>
                                                <div className="flex justify-center items-center w-full h-full">
                                                    <img 
                                                        src={gestures.find(g => g.label === targetGesture)?.image} 
                                                        alt={gestures.find(g => g.label === targetGesture)?.name}
                                                        className="w-full h-full object-contain rounded-lg shadow-lg border-4 border-primary/20 animate-pulse"
                                                        onError={(e) => {
                                                            // Fallback to emoji if image fails to load
                                                            const target = e.target as HTMLImageElement;
                                                            target.style.display = 'none';
                                                            const emojiDiv = document.createElement('div');
                                                            emojiDiv.className = 'text-9xl animate-pulse';
                                                            emojiDiv.textContent = gestures.find(g => g.label === targetGesture)?.emoji || '';
                                                            target.parentNode?.appendChild(emojiDiv);
                                                        }}
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
                                                onClick={resetGame}
                                                className="btn-fun font-comic text-lg py-4 bg-gradient-to-r from-orange-500 via-pink-500 to-orange-600 hover:from-orange-600 hover:via-pink-600 hover:to-orange-700 text-white border-2 border-orange-300 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 transform hover:-translate-y-1"
                                            >
                                                🔄 Play Again
                                            </button>
                                            <button
                                                onClick={() => {
                                                    resetGame();
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
                                    animationDelay: `${Math.random() * 1}s`,
                                    animationDuration: `${0.5 + Math.random() * 1}s`
                                }}
                            />
                        ))}
                    </div>
                )}
                
                {/* Congratulations Message */}
                {showCongratulations && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                        <div className="card-playful border-4 border-yellow-400 bg-gradient-to-r from-yellow-100 to-orange-100 p-8 text-center max-w-md mx-4 animate-bounce">
                            <div className="text-6xl mb-4">🎉</div>
                            <h2 className="text-3xl font-playful text-yellow-600 mb-2">
                                Congratulations!
                            </h2>
                            <p className="text-lg font-comic text-yellow-700">
                                You've completed all 11 rounds! 🏆
                            </p>
                            <div className="text-2xl font-playful text-yellow-600 mt-2">
                                Final Score: {score}/11
                            </div>
                        </div>
                    </div>
                )}
                
                {/* Game Stats Modal */}
                {showGameStats && gameSession && (
                    <GestureGameStats 
                        gameSession={gameSession} 
                        onClose={() => setShowGameStats(false)} 
                    />
                )}
            </div>
        )
    }
}

export default GestureRecognizerComponent