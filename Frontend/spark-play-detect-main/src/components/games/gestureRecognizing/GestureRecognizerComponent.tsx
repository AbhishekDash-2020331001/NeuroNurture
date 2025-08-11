"use client"

import type React from "react"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

// RunningMode type is not exported from @mediapipe/tasks-vision, so we define it here.
type RunningMode = "IMAGE" | "VIDEO"

type GameScreen = 'instructions' | 'consent' | 'game' | 'loading'

const GestureRecognizerComponent: React.FC = () => {
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

    const videoHeight = "480px"
    const videoWidth = "640px"

    // API endpoint for gesture detection
    const API_ENDPOINT = 'http://localhost:8000/predictGesture';

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
            { name: "Closed Fist", label: "closed_fist", emoji: "✊", description: "Make a strong fist like a superhero!" },
            { name: "Open Palm", label: "open_palm", emoji: "✋", description: "Show your palm like saying hello!" },
            { name: "Pointing Up", label: "pointing_up", emoji: "☝️", description: "Point your finger up to the sky!" },
            { name: "Thumbs Down", label: "thumbs_down", emoji: "👎", description: "Show thumbs down like a judge!" },
            { name: "Thumbs Up", label: "thumbs_up", emoji: "👍", description: "Give a thumbs up for good job!" },
            { name: "Victory", label: "victory", emoji: "✌️", description: "Make a peace sign with your fingers!" },
            { name: "I Love You", label: "iloveyou", emoji: "🤟", description: "Show the love sign with your hand!" },
            { name: "Butterfly", label: "butterfly", emoji: "🦋", description: "Flap your hands like a beautiful butterfly!" },
            { name: "Dua", label: "dua", emoji: "🤲", description: "Hold your hands together in prayer position!" },
            { name: "Heart", label: "heart", emoji: "❤️", description: "Make a heart shape with your hands!" },
            { name: "Spectacle", label: "spectacle", emoji: "🕶️", description: "Make circles with your fingers like glasses!" },
        ],
        [],
    )

    // Webcam setup - simplified like mirror posture game
    const [isCameraOn, setIsCameraOn] = useState(false);
    const streamRef = useRef<MediaStream | null>(null);

    // Initialize webcam - same as mirror posture game
    const initializeWebcam = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                    facingMode: 'user'
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
        }

        // Use setTimeout with a ref to avoid circular dependency
        resultTimeoutRef.current = setTimeout(() => {
            // Call startNextRound through a ref to avoid circular dependency
            if (startNextRoundRef.current) {
                startNextRoundRef.current();
            }
        }, 2000);
    }, []);

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

            // Get available gestures (not used yet)
            const availableGestures = gestures.filter(g => !usedGestures.includes(g.label));
            console.log('Available gestures for next round:', availableGestures.map(g => g.label));
            
            // Only select from available gestures - never repeat
            const randomGesture = availableGestures[Math.floor(Math.random() * availableGestures.length)];
            
            setTargetGesture(randomGesture.label);
            setUsedGestures(prev => [...prev, randomGesture.label]);
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
             
             setGameEnded(true);
             setGameStarted(false);
             setIsRoundCountdownActive(false);
         }
     }, [gestures, usedGestures, startRoundCountdown, stopWebcam])

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
        if (gesture === targetGesture && confidence >= 0.65) { // Changed threshold from 0.8 to 0.65 (65%)
            console.log('✅ Correct gesture detected! Moving to next round...', {
                gesture,
                targetGesture,
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
                target: targetGesture,
                confidence,
                threshold: 0.65 // Changed threshold to 0.65
            });
        }
    }, [gameStarted, gameEnded, targetGesture, startNextRound])

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
        setTargetGesture("");
        setDetectedGesture("");
        setDetectedConfidence(0);
        setRoundResult("");
        setIsCorrect(null);
        isCorrectRef.current = null;
        setIsProcessingRound(false);
        isProcessingRoundRef.current = false;
        setUsedGestures([]); // Reset used gestures for new game
        setTimeLeft(10); // Reset timer
        setIsRoundCountdownActive(false);
        setRoundCountdown(2);
        
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
    }, [startNextRound]);
    
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
        setTargetGesture("");
        setDetectedGesture("");
        setDetectedConfidence(0);
        setRoundResult("");
        setIsCorrect(null);
        isCorrectRef.current = null;
        setTimeLeft(10);
        setIsProcessingRound(false);
        isProcessingRoundRef.current = false;
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
    }, [stopWebcam])

    // Initialize webcam when game screen is active
    useEffect(() => {
        if (currentScreen === 'game') {
            console.log('Initializing webcam...');
            initializeWebcam();
        } else {
            console.log('Stopping webcam - leaving game screen');
            stopWebcam();
        }

        return () => {
            console.log('Cleanup: stopping webcam');
            stopWebcam();
        }
    }, [currentScreen, initializeWebcam, stopWebcam]);

    // Prediction loop using frame capture and API calls - optimized like mirror posture game
    const predictWebcam = useCallback(() => {
        if (!isConnected || !isCameraOn || !videoRef.current || !canvasRef.current || isProcessing) {
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
                
                // Convert canvas to blob
                const blob = await new Promise<Blob>((resolve) => {
                    canvas.toBlob(resolve as BlobCallback, 'image/jpeg', 0.8);
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
                    console.log('Gesture API Response:', result);
                    
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
                        console.log(`Detected: ${prediction} (confidence: ${confidence})`);
                        
                        // Always update the detected gesture display
                        setDetectedGesture(prediction);
                        setDetectedConfidence(confidence);
                        
                        // Process for game logic if game is active - simplified logic
                        if (gameStarted && !gameEnded && !isProcessingRoundRef.current) {
                            console.log(`🎮 Sending gesture to game logic: ${prediction}`);
                            handleGestureDetected(prediction, confidence);
                        }
                    }
                    setIsConnected(true);
                } else {
                    throw new Error('API request failed');
                }
            } catch (error) {
                console.log('Gesture API not available, using demo mode:', error);
                setIsConnected(false);
                
                // Simulate random detection for testing (fallback when API is not available)
                if (Math.random() < 0.05) { // 5% chance for demo mode
                    const gestures = ['closed_fist', 'open_palm', 'pointing_up', 'thumbs_down', 'thumbs_up', 'victory', 'iloveyou', 'butterfly', 'dua', 'heart', 'spectacle'];
                    const randomGesture = gestures[Math.floor(Math.random() * gestures.length)];
                    setDetectedGesture(randomGesture);
                    setDetectedConfidence(0.8);
                }
            } finally {
                setIsProcessing(false);
            }
        };

        // Send frame immediately
        sendFrame();
    }, [isConnected, isCameraOn, handleGestureDetected, isProcessing, gameStarted, gameEnded])

    // Determine if game is active (same logic as mirror posture game)
    const isActive = currentScreen === 'game' && gameStarted && !gameEnded;

    // Start/stop frame capture based on game state - same as mirror posture game
    useEffect(() => {
        if (isActive && isCameraOn) {
            captureIntervalRef.current = setInterval(predictWebcam, 100); // Same 100ms (10 FPS) as mirror posture game
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

    // Cleanup all timers and animations on component unmount
    useEffect(() => {
        return () => {
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
                            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover rounded-2xl shadow-2xl border-4 border-primary transform -scale-x-100" />
                            <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full rounded-2xl" />
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
                                        Detected: {detectedGesture} ({(detectedConfidence * 100).toFixed(1)}%)
                                    </div>
                                </div>
                            )}
                            {/* Removed all debug displays to keep camera screen clean */}
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
                                <div className="card-playful border-4 border-primary bg-gradient-to-r from-primary/20 to-secondary/20 p-6 text-center w-full h-full flex flex-col justify-center">
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
                                        // Show gesture instruction
                                        <>
                                            <h3 className="text-2xl font-playful text-primary mb-4">Make this gesture:</h3>
                                            <div className="text-6xl mb-4 animate-pulse">
                                                {gestures.find(g => g.label === targetGesture)?.emoji}
                                            </div>
                                            <div className="text-2xl font-playful text-primary mb-3">
                                                {gestures.find(g => g.label === targetGesture)?.name}
                                            </div>
                                            <div className="text-lg text-muted-foreground font-comic">
                                                {gestures.find(g => g.label === targetGesture)?.description}
                                            </div>
                                        </>
                                    )}
                                    <div className="mt-6 flex justify-center gap-4">
                                        <div className="card-playful border-2 border-fun-orange/20 p-3 text-center">
                                            <span className="text-sm text-muted-foreground font-comic mb-1 block">Round</span>
                                            <span className="text-xl font-bold text-primary">{currentRound}/11</span>
                                        </div>
                                        <div className="card-playful border-2 border-fun-purple/20 p-3 text-center">
                                            <span className="text-sm text-muted-foreground font-comic mb-1 block">Score</span>
                                            <span className="text-xl font-bold text-primary">{score}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {gameEnded && (
                                <div className="card-playful border-4 border-primary bg-gradient-to-r from-primary/10 to-secondary/10 p-6 text-center w-full h-full flex flex-col justify-center">
                                    <h2 className="text-3xl font-playful text-primary mb-4">
                                        🏆 Game Finished!
                                    </h2>
                                    <div className="mb-6">
                                        <div className="text-6xl mb-4 animate-bounce">🎉</div>
                                        <div className="text-2xl font-playful text-primary mb-3">Final Score: {score}/11</div>
                                        <div className="text-lg text-muted-foreground font-comic">
                                            {score === 11 ? "Perfect! You're a gesture master! 🌟" : 
                                             score >= 8 ? "Great job! You're getting better! 👍" : 
                                             "Keep practicing! You'll improve! 💪"}
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-3">
                                        <button
                                            onClick={resetGame}
                                            className="btn-fun font-comic text-xl py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-2 border-purple-300 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                                        >
                                            🔄 Play Again
                                        </button>
                                        <button
                                            onClick={() => {
                                                resetGame();
                                                setCurrentScreen('instructions');
                                            }}
                                            className="btn-fun font-comic text-lg py-2 bg-secondary hover:bg-secondary/80"
                                        >
                                            📖 Back to Instructions
                                        </button>
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
            </div>
        )
    }
}

export default GestureRecognizerComponent