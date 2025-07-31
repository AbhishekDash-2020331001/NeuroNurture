"use client"

import { stopAllCameraStreams } from "@/utils/cameraUtils"
import { FilesetResolver, GestureRecognizer } from "@mediapipe/tasks-vision"
import type React from "react"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

// RunningMode type is not exported from @mediapipe/tasks-vision, so we define it here.
type RunningMode = "IMAGE" | "VIDEO"

type GameScreen = 'instructions' | 'game' | 'loading'

const GestureRecognizerComponent: React.FC = () => {
    const videoRef = useRef<HTMLVideoElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [gestureRecognizer, setGestureRecognizer] = useState<GestureRecognizer | null>(null)
    const [webcamRunning, setWebcamRunning] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [currentScreen, setCurrentScreen] = useState<GameScreen>('instructions')

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

    // Refs for cleanup and avoiding stale closures
    const animationFrameRef = useRef<number | null>(null)
    const timerRef = useRef<NodeJS.Timeout | null>(null)
    const resultTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const countdownTimerRef = useRef<NodeJS.Timeout | null>(null)
    const lastGestureTimeRef = useRef<number>(0)
    const lastGestureRef = useRef<string>("")
    const currentRoundRef = useRef<number>(0)
    const isProcessingRoundRef = useRef<boolean>(false)
    const isCorrectRef = useRef<boolean | null>(null)

    const videoHeight = "480px"
    const videoWidth = "640px"

    // Memoized gestures array
    const gestures = useMemo(
        () => [
            { name: "Closed Fist", label: "Closed_Fist", emoji: "✊", description: "Make a strong fist like a superhero!" },
            { name: "Open Palm", label: "Open_Palm", emoji: "✋", description: "Show your palm like saying hello!" },
            { name: "Pointing Up", label: "Pointing_Up", emoji: "☝️", description: "Point your finger up to the sky!" },
            { name: "Thumbs Down", label: "Thumb_Down", emoji: "👎", description: "Show thumbs down like a judge!" },
            { name: "Thumbs Up", label: "Thumb_Up", emoji: "👍", description: "Give a thumbs up for good job!" },
            { name: "Victory", label: "Victory", emoji: "✌️", description: "Make a peace sign with your fingers!" },
            { name: "I Love You", label: "ILoveYou", emoji: "🤟", description: "Show the love sign with your hand!" },
        ],
        [],
    )

    // Centralized function to start the next round or end the game
    const startNextRound = useCallback(() => {
        setRoundResult("")
        setIsCorrect(null)
        isCorrectRef.current = null
        setIsProcessingRound(false)
        isProcessingRoundRef.current = false

        if (currentRoundRef.current < 7) {
            const nextRound = currentRoundRef.current + 1
            setCurrentRound(nextRound)
            currentRoundRef.current = nextRound

            // Get available gestures (not used yet)
            const availableGestures = gestures.filter(g => !usedGestures.includes(g.label))
            
            // Only select from available gestures - never repeat
            const randomGesture = availableGestures[Math.floor(Math.random() * availableGestures.length)]
            
            setTargetGesture(randomGesture.label)
            setUsedGestures(prev => [...prev, randomGesture.label])
            setDetectedGesture("")
            setDetectedConfidence(0)
            setTimeLeft(10)

            timerRef.current = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(timerRef.current!)
                        // Call handleRoundEnd directly instead of through dependency
                        handleRoundEndDirect()
                        return 0
                    }
                    return prev - 1
                })
            }, 1000)
        } else {
            setGameEnded(true)
            setGameStarted(false)
        }
    }, [gestures, usedGestures])

    // Direct function to handle round end without circular dependency
    const handleRoundEndDirect = useCallback(() => {
        if (isProcessingRoundRef.current) return
        isProcessingRoundRef.current = true
        setIsProcessingRound(true)

        if (isCorrectRef.current === null) {
            setRoundResult("Time's up! ⏰")
            setIsCorrect(false)
            isCorrectRef.current = false
        }

        resultTimeoutRef.current = setTimeout(startNextRound, 2000)
    }, [startNextRound])

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
        
        if (!gameStarted || gameEnded || isProcessingRoundRef.current) {
            console.log('Gesture detection blocked:', { 
                gameStarted, 
                gameEnded, 
                isProcessingRound: isProcessingRoundRef.current,
                reason: !gameStarted ? 'Game not started' : gameEnded ? 'Game ended' : 'Processing round'
            })
            return
        }

        setDetectedGesture(gesture)
        setDetectedConfidence(confidence)

        if (gesture === targetGesture && confidence > 0.6) {
            console.log('Correct gesture detected! Moving to next round...', {
                gesture,
                targetGesture,
                confidence,
                currentRound: currentRoundRef.current
            })
            
            isProcessingRoundRef.current = true
            setIsProcessingRound(true)
            
            setScore(prev => prev + 1)
            setRoundResult("Correct! 🎉")
            setIsCorrect(true)
            isCorrectRef.current = true

            if (timerRef.current) {
                clearInterval(timerRef.current)
                timerRef.current = null
            }

            resultTimeoutRef.current = setTimeout(() => {
                console.log('Starting next round after correct gesture...')
                startNextRound()
            }, 2000)
        } else {
            console.log('Gesture detected but not correct:', {
                detected: gesture,
                target: targetGesture,
                confidence,
                threshold: 0.6
            })
        }
    }, [gameStarted, gameEnded, targetGesture, startNextRound])

    // Main game start function
    const startGame = useCallback(() => {
        setGameStarted(true)
        setGameEnded(false)
        setCurrentRound(0) // Will be incremented to 1 by startNextRound
        currentRoundRef.current = 0
        setScore(0)
        setTargetGesture("")
        setDetectedGesture("")
        setDetectedConfidence(0)
        setRoundResult("")
        setIsCorrect(null)
        isCorrectRef.current = null
        setIsProcessingRound(false)
        isProcessingRoundRef.current = false
        lastGestureTimeRef.current = 0
        lastGestureRef.current = ""
        setUsedGestures([]) // Reset used gestures for new game
        
        // Start countdown before the game
        setShowCountdown(true)
        setCountdown(3)
        
        countdownTimerRef.current = setInterval(() => {
            setCountdown(prev => {
                if (prev && prev > 1) {
                    return prev - 1
                } else {
                    // Countdown finished, start the actual game
                    clearInterval(countdownTimerRef.current!)
                    countdownTimerRef.current = null
                    setShowCountdown(false)
                    setCountdown(null)
                    
                    // Start the first round
                    setTimeout(startNextRound, 100)
                    return null
                }
            })
        }, 1000)
    }, [startNextRound])
    
    // Function to reset the game state
    const resetGame = useCallback(() => {
        setGameStarted(false)
        setGameEnded(false)
        setCurrentRound(0)
        currentRoundRef.current = 0
        setScore(0)
        setTargetGesture("")
        setDetectedGesture("")
        setDetectedConfidence(0)
        setRoundResult("")
        setIsCorrect(null)
        isCorrectRef.current = null
        setTimeLeft(10)
        setIsProcessingRound(false)
        isProcessingRoundRef.current = false
        lastGestureTimeRef.current = 0
        lastGestureRef.current = ""
        setShowCountdown(false)
        setCountdown(null)
        setUsedGestures([]) // Reset used gestures

        if (timerRef.current) clearInterval(timerRef.current)
        if (resultTimeoutRef.current) clearTimeout(resultTimeoutRef.current)
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
        if (countdownTimerRef.current) clearInterval(countdownTimerRef.current)
    }, [])

    // Initialize gesture recognizer
    useEffect(() => {
        const createGestureRecognizer = async () => {
            setIsLoading(true)
            try {
                const vision = await FilesetResolver.forVisionTasks(
                    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
                )
                const recognizer = await GestureRecognizer.createFromOptions(vision, {
                    baseOptions: {
                        modelAssetPath: "https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task",
                        delegate: "GPU"
                    },
                    runningMode: "VIDEO", // Use the more efficient VIDEO mode
                    numHands: 1
                })
                setGestureRecognizer(recognizer)
            } catch (error) {
                console.error("Error creating gesture recognizer:", error)
            }
            setIsLoading(false)
        }
        createGestureRecognizer()
    }, [])

    // Webcam setup - only when game is active
    useEffect(() => {
        let stream: MediaStream | null = null;
        
        const setupWebcam = async () => {
            try {
                stream = await navigator.mediaDevices.getUserMedia({ video: true })
                if (videoRef.current) {
                    videoRef.current.srcObject = stream
                    
                    // Wait for video to be ready before setting webcamRunning
                    videoRef.current.onloadedmetadata = () => {
                        setWebcamRunning(true)
                    }
                    
                    // Fallback in case onloadedmetadata doesn't fire
                    setTimeout(() => {
                        if (videoRef.current && videoRef.current.readyState >= 2) {
                            setWebcamRunning(true)
                        }
                    }, 1000)
                }
            } catch (error) {
                console.error("Error accessing webcam:", error)
            }
        }

        const stopWebcam = () => {
            if (videoRef.current && videoRef.current.srcObject) {
                const mediaStream = videoRef.current.srcObject as MediaStream;
                mediaStream.getTracks().forEach(track => track.stop())
                videoRef.current.srcObject = null
                setWebcamRunning(false)
            }
        }

        // Only start webcam when game screen is active AND game is started
        if (currentScreen === 'game' && gameStarted) {
            setupWebcam()
        } else {
            // Stop webcam when not in game or game not started
            stopWebcam()
        }

        return () => {
            stopWebcam()
        }
    }, [currentScreen, gameStarted])

    // Prediction loop using requestAnimationFrame
    const predictWebcam = useCallback(() => {
        if (!gestureRecognizer || !webcamRunning || !videoRef.current || videoRef.current.paused || videoRef.current.readyState < 3) {
            return;
        }

        const video = videoRef.current;
        const nowInMs = Date.now();
        const results = gestureRecognizer.recognizeForVideo(video, nowInMs);

        if (results.gestures.length > 0) {
            const gesture = results.gestures[0][0];
            // Lower confidence threshold from 0.7 to 0.6 for more reliable detection
            if (gesture && gesture.score > 0.6) {
                const now = Date.now();
                const isNewGesture = gesture.categoryName !== lastGestureRef.current;
                const timeSinceLastGesture = now - lastGestureTimeRef.current;
                
                // Debug: Log all detected gestures
                console.log('All detected gestures:', results.gestures.map(g => ({
                    categoryName: g[0].categoryName,
                    score: g[0].score
                })));
                
                // Reduce debouncing time from 500ms to 200ms for more responsive detection
                if (!isProcessingRoundRef.current && isNewGesture && timeSinceLastGesture > 200) {
                    console.log('Processing new gesture:', { 
                        gesture: gesture.categoryName, 
                        confidence: gesture.score, 
                        target: targetGesture,
                        isProcessing: isProcessingRoundRef.current,
                        timeSinceLast: timeSinceLastGesture
                    })
                    lastGestureTimeRef.current = now;
                    lastGestureRef.current = gesture.categoryName;
                    handleGestureDetected(gesture.categoryName, gesture.score);
                }
            }
        }
        
        animationFrameRef.current = requestAnimationFrame(predictWebcam);
    }, [gestureRecognizer, webcamRunning, handleGestureDetected, targetGesture]);

    useEffect(() => {
        if (webcamRunning && gestureRecognizer) {
            // Add a small delay to ensure camera is fully ready
            const timer = setTimeout(() => {
                console.log('Starting prediction loop...')
                animationFrameRef.current = requestAnimationFrame(predictWebcam);
            }, 500);
            
            return () => {
                clearTimeout(timer);
                if (animationFrameRef.current) {
                    cancelAnimationFrame(animationFrameRef.current);
                    console.log('Stopping prediction loop...')
                }
            }
        } else {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
                console.log('Stopping prediction loop (webcam not running)...')
            }
        }
        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        }
    }, [webcamRunning, predictWebcam, gestureRecognizer]);

    // Cleanup camera when screen changes (navigating away from game)
    useEffect(() => {
        if (currentScreen !== 'game') {
            // Stop camera when not on game screen
            if (videoRef.current && videoRef.current.srcObject) {
                const mediaStream = videoRef.current.srcObject as MediaStream;
                mediaStream.getTracks().forEach(track => track.stop())
                videoRef.current.srcObject = null
                setWebcamRunning(false)
            }
        }
    }, [currentScreen])

    // Cleanup all timers and animations on component unmount
    useEffect(() => {
        return () => {
            // Stop camera immediately when component unmounts
            if (videoRef.current && videoRef.current.srcObject) {
                const mediaStream = videoRef.current.srcObject as MediaStream;
                mediaStream.getTracks().forEach(track => track.stop())
                videoRef.current.srcObject = null
                setWebcamRunning(false)
            }
            
            // Clear timers
            if (timerRef.current) clearInterval(timerRef.current);
            if (resultTimeoutRef.current) clearTimeout(resultTimeoutRef.current);
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
            if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
        }
    }, [])

    // Additional cleanup when component unmounts or when navigating away
    useEffect(() => {
        return () => {
            // Stop camera immediately when component unmounts
            if (videoRef.current && videoRef.current.srcObject) {
                const mediaStream = videoRef.current.srcObject as MediaStream;
                mediaStream.getTracks().forEach(track => track.stop())
                videoRef.current.srcObject = null
                setWebcamRunning(false)
            }
            
            // Use global camera cleanup utility
            stopAllCameraStreams();
        }
    }, [])
    
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
                <div className="flex-1 overflow-y-auto p-6">
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
                                <h4 className="text-2xl font-playful text-primary mb-3">Play 5 Rounds</h4>
                                <p className="text-lg text-muted-foreground font-comic">
                                    Try to copy 7 different gestures. You have 10 seconds for each one!
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
                                onClick={() => setCurrentScreen('game')}
                                className="btn-fun font-comic text-2xl py-4 px-8 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-4 border-purple-300 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110"
                            >
                                🚀 Start the Adventure! 🚀
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

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
                        <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full rounded-2xl hidden" />
                        {!webcamRunning && (
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
                                    Test your reflexes! You'll have 7 rounds to perform the correct gesture within 10 seconds each.
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
                                <div className="mt-6 flex justify-center gap-4">
                                    <div className="card-playful border-2 border-fun-orange/20 p-3 text-center">
                                        <span className="text-sm text-muted-foreground font-comic mb-1 block">Round</span>
                                        <span className="text-xl font-bold text-primary">{currentRound}/7</span>
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
                                    <div className="text-2xl font-playful text-primary mb-3">Final Score: {score}/7</div>
                                    <div className="text-lg text-muted-foreground font-comic">
                                        {score === 7 ? "Perfect! You're a gesture master! 🌟" : 
                                         score >= 5 ? "Great job! You're getting better! 👍" : 
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

export default GestureRecognizerComponent