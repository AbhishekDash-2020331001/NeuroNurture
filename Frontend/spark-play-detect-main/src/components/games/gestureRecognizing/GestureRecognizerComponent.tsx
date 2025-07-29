"use client"

import { FilesetResolver, GestureRecognizer } from "@mediapipe/tasks-vision"
import type React from "react"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

// RunningMode type is not exported from @mediapipe/tasks-vision, so we define it here.
type RunningMode = "IMAGE" | "VIDEO"

type GameScreen = 'instructions' | 'game' | 'loading'

const GestureRecognizerComponent: React.FC = () => {
    const videoRef = useRef<HTMLVideoElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const gestureOutputRef = useRef<HTMLParagraphElement>(null)
    const [gestureRecognizer, setGestureRecognizer] = useState<GestureRecognizer | null>(null)
    const [runningMode, setRunningMode] = useState<RunningMode>("IMAGE")
    const [webcamRunning, setWebcamRunning] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [isInitializing, setIsInitializing] = useState(false)
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

    // Refs for cleanup
    const animationFrameRef = useRef<number | null>(null)
    const timerRef = useRef<NodeJS.Timeout | null>(null)
    const resultTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const timerWorkerRef = useRef<Worker | null>(null)

    // Cleanup effect to ensure camera is stopped when component unmounts or screen changes
    useEffect(() => {
        return () => {
            // Ensure timer is cleared
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
            if (resultTimeoutRef.current) {
                clearTimeout(resultTimeoutRef.current);
            }
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            // Camera will be stopped by the webcam setup effect when currentScreen changes
        };
    }, []);

    const videoHeight = 400
    const videoWidth = 500

    // Memoized gestures array with bigger emojis
    const gestures = useMemo(
        () => [
            { name: "Closed Fist", label: "Closed_Fist", emoji: "✊", description: "Make a strong fist like a superhero!" },
            { name: "Open Palm", label: "Open_Palm", emoji: "✋", description: "Show your palm like saying hello!" },
            { name: "Pointing Up", label: "Pointing_Up", emoji: "☝️", description: "Point your finger up to the sky!" },
            { name: "Thumbs Down", label: "Thumb_Down", emoji: "👎", description: "Show thumbs down like a judge!" },
            { name: "Thumbs Up", label: "Thumb_Up", emoji: "👍", description: "Give a thumbs up for good job!" },
            { name: "Victory", label: "Victory", emoji: "✌️", description: "Make a peace sign with your fingers!" },
            { name: "Love", label: "ILoveYou", emoji: "🤟", description: "Show the love sign with your hand!" },
        ],
        [],
    )

    // Initialize timer worker
    useEffect(() => {
        // Create timer worker
        timerWorkerRef.current = new Worker("/timer-worker.js")

        // Handle messages from worker
        timerWorkerRef.current.onmessage = (e) => {
            const { type, time } = e.data

            switch (type) {
                case "TIMER_TICK":
                    setTimeLeft(time)
                    break
                case "TIMER_FINISHED":
                    handleRoundEnd()
                    break
            }
        }

        // Handle worker errors
        timerWorkerRef.current.onerror = (error) => {
            console.error("Timer worker error:", error)
        }

        return () => {
            if (timerWorkerRef.current) {
                timerWorkerRef.current.terminate()
            }
        }
    }, [])

    const startGame = useCallback(() => {
        setGameStarted(true)
        setGameEnded(false)
        setCurrentRound(1)
        setScore(0)
        setRoundResult("")
        setIsCorrect(null)

        // Start new round after brief delay to ensure state is set
        setTimeout(() => {
            const randomGesture = gestures[Math.floor(Math.random() * gestures.length)]
            setTargetGesture(randomGesture.label)
            setDetectedGesture("")
            setDetectedConfidence(0)
            setRoundResult("")
            setTimeLeft(10)
            setIsCorrect(null)

            // Start timer
            if (timerWorkerRef.current) {
                timerWorkerRef.current.postMessage({ type: "START_TIMER", duration: 10 })
            }
        }, 100)
    }, [gestures])

    const handleRoundEnd = useCallback(() => {
        if (isCorrect === null) {
            // Time's up without correct gesture
            setRoundResult("Time's up! ⏰")
            setIsCorrect(false)
        }

        // Clear result after 2 seconds
        resultTimeoutRef.current = setTimeout(() => {
            setRoundResult("")
            setIsCorrect(null)

            if (currentRound < 5) {
                // Next round
                const nextRound = currentRound + 1
                setCurrentRound(nextRound)
                const randomGesture = gestures[Math.floor(Math.random() * gestures.length)]
                setTargetGesture(randomGesture.label)
                setDetectedGesture("")
                setDetectedConfidence(0)
                setTimeLeft(10)

                // Start timer for next round
                if (timerWorkerRef.current) {
                    timerWorkerRef.current.postMessage({ type: "START_TIMER", duration: 10 })
                }
            } else {
                // Game finished
                setGameEnded(true)
                setGameStarted(false)
            }
        }, 2000)
    }, [currentRound, gestures, isCorrect])

    const handleGestureDetected = useCallback((gesture: string, confidence: number) => {
        if (!gameStarted || gameEnded) return

        setDetectedGesture(gesture)
        setDetectedConfidence(confidence)

        if (gesture === targetGesture && confidence > 0.7) {
            setScore(prev => prev + 1)
            setRoundResult("Correct! 🎉")
            setIsCorrect(true)

            // Stop timer
            if (timerWorkerRef.current) {
                timerWorkerRef.current.postMessage({ type: "STOP_TIMER" })
            }

            // Clear result after 2 seconds
            resultTimeoutRef.current = setTimeout(() => {
                setRoundResult("")
                setIsCorrect(null)

                if (currentRound < 5) {
                    // Next round
                    const nextRound = currentRound + 1
                    setCurrentRound(nextRound)
                    const randomGesture = gestures[Math.floor(Math.random() * gestures.length)]
                    setTargetGesture(randomGesture.label)
                    setDetectedGesture("")
                    setDetectedConfidence(0)
                    setTimeLeft(10)

                    // Start timer for next round
                    if (timerWorkerRef.current) {
                        timerWorkerRef.current.postMessage({ type: "START_TIMER", duration: 10 })
                    }
                } else {
                    // Game finished
                    setGameEnded(true)
                    setGameStarted(false)
                }
            }, 2000)
        }
    }, [gameStarted, gameEnded, targetGesture, currentRound, gestures])

    const resetGame = useCallback(() => {
        setGameStarted(false)
        setGameEnded(false)
        setCurrentRound(0)
        setScore(0)
        setTargetGesture("")
        setDetectedGesture("")
        setDetectedConfidence(0)
        setRoundResult("")
        setIsCorrect(null)
        setTimeLeft(10)

        // Stop timer
        if (timerWorkerRef.current) {
            timerWorkerRef.current.postMessage({ type: "STOP_TIMER" })
        }

        // Clear timeouts
        if (resultTimeoutRef.current) {
            clearTimeout(resultTimeoutRef.current)
        }
    }, [])

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (resultTimeoutRef.current) {
                clearTimeout(resultTimeoutRef.current)
            }
            if (timerRef.current) {
                clearInterval(timerRef.current)
            }
        }
    }, [])

    // Initialize gesture recognizer
    useEffect(() => {
        const createGestureRecognizer = async () => {
            setIsInitializing(true)
            try {
                const vision = await FilesetResolver.forVisionTasks(
                    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
                )

                const gestureRecognizer = await GestureRecognizer.createFromOptions(vision, {
                    baseOptions: {
                        modelAssetPath: "https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task",
                        delegate: "GPU"
                    },
                    runningMode: runningMode
                })

                setGestureRecognizer(gestureRecognizer)
                setIsLoading(false)
            } catch (error) {
                console.error("Error creating gesture recognizer:", error)
                setIsLoading(false)
            }
            setIsInitializing(false)
        }

        createGestureRecognizer()
    }, [runningMode])

    // Webcam setup - only when game is active
    useEffect(() => {
        const setupWebcam = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true })
                if (videoRef.current) {
                    videoRef.current.srcObject = stream
                    setWebcamRunning(true)
                }
            } catch (error) {
                console.error("Error accessing webcam:", error)
            }
        }

        const stopWebcam = () => {
            if (videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream
                stream.getTracks().forEach(track => track.stop())
                videoRef.current.srcObject = null
                setWebcamRunning(false)
            }
        }

        // Only start webcam when game screen is active
        if (currentScreen === 'game' && gameStarted) {
            setupWebcam()
        } else {
            // Stop webcam when not in game
            stopWebcam()
        }

        return () => {
            stopWebcam()
        }
    }, [currentScreen, gameStarted])

    // Prediction loop
    const predictWebcam = useCallback(() => {
        const loop = async () => {
            try {
                if (videoRef.current && gestureRecognizer && webcamRunning) {
                    const video = videoRef.current
                    const canvas = canvasRef.current

                    if (video.readyState === 4 && canvas) {
                        const ctx = canvas.getContext('2d')
                        if (ctx) {
                            canvas.width = videoWidth
                            canvas.height = videoHeight

                            ctx.drawImage(video, 0, 0, videoWidth, videoHeight)

                            const results = gestureRecognizer.recognize(video)

                            if (results.gestures.length > 0) {
                                const gesture = results.gestures[0][0]
                                const handedness = results.handedness[0][0].categoryName

                                if (gesture && gesture.score > 0.7) {
                                    handleGestureDetected(gesture.categoryName, gesture.score)
                                    setDetectedGesture(gesture.categoryName)
                                    setDetectedConfidence(gesture.score)

                                    if (gestureOutputRef.current) {
                                        gestureOutputRef.current.innerText = `${gesture.categoryName} (${(gesture.score * 100).toFixed(1)}%) - ${handedness}`
                                        gestureOutputRef.current.className = "p-3 bg-white/95 backdrop-blur-lg rounded-xl font-bold text-lg text-gray-700 shadow-lg transition-all duration-300 text-center max-w-md opacity-100 transform translate-y-0"
                                    }
                                } else {
                                    setDetectedGesture("")
                                    setDetectedConfidence(0)
                                    if (gestureOutputRef.current) {
                                        gestureOutputRef.current.className = "hidden p-3 bg-white/95 backdrop-blur-lg rounded-xl font-bold text-lg text-gray-700 shadow-lg transition-all duration-300 text-center max-w-md opacity-0 transform translate-y-2"
                                    }
                                }
                            }
                        }
                    }
                }

                // Use requestAnimationFrame for smooth animation
                if (webcamRunning) {
                    animationFrameRef.current = requestAnimationFrame(loop)
                }
            } catch (error) {
                console.error("Error in prediction loop:", error)
                if (webcamRunning) {
                    animationFrameRef.current = requestAnimationFrame(loop)
                }
            }
        }

        loop()
    }, [gestureRecognizer, webcamRunning, runningMode, videoWidth, videoHeight])

    // useEffect to start/stop continuous prediction based on webcam state
    useEffect(() => {
        if (webcamRunning) {
            predictWebcam()
        } else {
            // Cancel any running animation frame when webcam stops
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current)
                animationFrameRef.current = null
            }
        }
    }, [webcamRunning, predictWebcam])

    if (isLoading) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-6 animate-bounce">🎯</div>
                    <h2 className="text-3xl font-playful mb-4 text-primary">Loading AI Model...</h2>
                    <p className="text-lg text-muted-foreground font-comic">Preparing gesture recognition system</p>
                </div>
            </div>
        )
    }

    // Instructions Screen
    if (currentScreen === 'instructions') {
        return (
            <div className="h-full flex flex-col">
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-4xl mx-auto">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <div className="text-8xl mb-4 animate-bounce">🎮</div>
                            <h1 className="text-5xl font-playful bg-gradient-to-r from-purple-600 via-pink-500 to-blue-600 bg-clip-text text-transparent mb-4">
                                Hand Gesture Adventure!
                            </h1>
                            <p className="text-2xl font-comic text-muted-foreground">
                                Show your amazing hand moves and become a gesture superstar! 🌟
                            </p>
                        </div>

                        {/* Game Overview */}
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

                        {/* How to Play Steps */}
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
                                    Try to copy 5 different gestures. You have 10 seconds for each one!
                                </p>
                            </div>
                        </div>

                        {/* Available Gestures */}
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

                        {/* Start Button */}
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

    // Game Screen
    return (
        <div className="h-full flex flex-col">
            <div className="flex-1 flex flex-col lg:flex-row gap-6 p-4">
                {/* Left Column - Camera */}
                <div className="flex-1 flex flex-col items-center gap-4">
                    <div className="relative">
                        <video ref={videoRef} autoPlay playsInline muted className="w-full rounded-2xl shadow-2xl border-4 border-primary" />
                        <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full rounded-2xl" />
                        {!webcamRunning && (
                            <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl">
                                <div className="text-center">
                                    <div className="text-6xl mb-4 animate-bounce">📹</div>
                                    <p className="text-2xl font-playful text-primary">Camera not active</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div ref={gestureOutputRef} className="hidden p-4 bg-white/95 backdrop-blur-lg rounded-xl font-bold text-lg text-gray-700 shadow-lg transition-all duration-300 text-center max-w-md opacity-0 transform translate-y-2">
                        Gesture output will appear here
                    </div>
                </div>

                {/* Right Column - Game Controls */}
                <div className="flex-1 flex flex-col gap-6">
                    {!gameStarted && !gameEnded && (
                        <div className="card-playful border-4 border-primary bg-gradient-to-r from-primary/10 to-secondary/10 p-6">
                            <h2 className="text-3xl font-playful text-primary mb-4 text-center">
                                🎯 Ready to Play?
                            </h2>
                            <p className="text-lg text-muted-foreground mb-6 leading-relaxed font-comic text-center">
                                Test your reflexes! You'll have 5 rounds to perform the correct gesture within 10 seconds each.
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

                    {gameStarted && !gameEnded && (
                        <div className="card-playful border-4 border-primary bg-gradient-to-r from-primary/10 to-secondary/10 p-6">
                            <div className="mb-6">
                                <h2 className="text-3xl font-playful text-primary text-center mb-4">
                                    🎮 Game Active
                                </h2>
                            </div>

                            <div className="flex justify-center gap-6 mb-6 flex-wrap">
                                <div className="flex flex-row gap-4">
                                    <div className="card-playful border-2 border-fun-orange/20 p-4 text-center">
                                        <span className="text-sm text-muted-foreground font-comic mb-2 block">Round</span>
                                        <span className="text-2xl font-bold text-primary">{currentRound}/5</span>
                                    </div>
                                    <div className="card-playful border-2 border-fun-purple/20 p-4 text-center">
                                        <span className="text-sm text-muted-foreground font-comic mb-2 block">Score</span>
                                        <span className="text-2xl font-bold text-primary">{score}</span>
                                    </div>
                                </div>
                                <div className={`card-playful border-2 ${timeLeft <= 3 ? "border-red-500/50 bg-red-50" : "border-fun-green/20"} p-4 text-center`}>
                                    <span className="text-sm text-muted-foreground font-comic mb-2 block">Time Left</span>
                                    <span className={`text-3xl font-bold ${timeLeft <= 3 ? "text-red-500" : "text-primary"}`}>{timeLeft}s</span>
                                </div>
                            </div>

                            {targetGesture && (
                                <div className="mb-6">
                                    <h3 className="text-2xl font-playful text-primary mb-4 text-center">Make this gesture:</h3>
                                    <div className="card-playful border-4 border-primary bg-gradient-to-r from-primary/20 to-secondary/20 p-6 text-center">
                                        <div className="text-6xl mb-4 animate-pulse">
                                            {gestures.find(g => g.label === targetGesture)?.emoji}
                                        </div>
                                        <div className="text-2xl font-playful text-primary mb-3">
                                            {gestures.find(g => g.label === targetGesture)?.name}
                                        </div>
                                        <div className="text-lg text-muted-foreground font-comic">
                                            {gestures.find(g => g.label === targetGesture)?.description}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {roundResult && (
                                <div className={`card-playful border-4 p-4 text-center ${
                                    isCorrect ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50"
                                }`}>
                                    <div className={`text-2xl font-playful ${isCorrect ? "text-green-600" : "text-red-600"}`}>
                                        {roundResult}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {gameEnded && (
                        <div className="card-playful border-4 border-primary bg-gradient-to-r from-primary/10 to-secondary/10 p-6">
                            <h2 className="text-3xl font-playful text-primary mb-4 text-center">
                                🏆 Game Finished!
                            </h2>
                            <div className="text-center mb-6">
                                <div className="text-6xl mb-4">🎉</div>
                                <div className="text-2xl font-playful text-primary mb-3">Final Score: {score}/5</div>
                                <div className="text-lg text-muted-foreground font-comic">
                                    {score === 5 ? "Perfect! You're a gesture master! 🌟" : 
                                     score >= 3 ? "Great job! You're getting better! 👍" : 
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
                                    onClick={() => setCurrentScreen('instructions')}
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
    )
}

export default GestureRecognizerComponent