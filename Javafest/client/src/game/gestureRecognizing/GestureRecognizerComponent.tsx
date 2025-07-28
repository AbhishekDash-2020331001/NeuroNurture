"use client"

import type React from "react"
import { useRef, useEffect, useState, useCallback, useMemo } from "react"
import { GestureRecognizer, FilesetResolver, DrawingUtils } from "@mediapipe/tasks-vision"

// RunningMode type is not exported from @mediapipe/tasks-vision, so we define it here.
type RunningMode = "IMAGE" | "VIDEO"

const GestureRecognizerComponent: React.FC = () => {
    const videoRef = useRef<HTMLVideoElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const gestureOutputRef = useRef<HTMLParagraphElement>(null)
    const [gestureRecognizer, setGestureRecognizer] = useState<GestureRecognizer | null>(null)
    const [runningMode, setRunningMode] = useState<RunningMode>("IMAGE")
    const [webcamRunning, setWebcamRunning] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [isInitializing, setIsInitializing] = useState(false)

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

    const videoHeight = 450
    const videoWidth = 600

    // Memoized gestures array
    const gestures = useMemo(
        () => [
            { name: "Closed Fist", label: "Closed_Fist", emoji: "✊" },
            { name: "Open Palm", label: "Open_Palm", emoji: "✋" },
            { name: "Pointing Up", label: "Pointing_Up", emoji: "☝️" },
            { name: "Thumbs Down", label: "Thumb_Down", emoji: "👎" },
            { name: "Thumbs Up", label: "Thumb_Up", emoji: "👍" },
            { name: "Victory", label: "Victory", emoji: "✌️" },
            { name: "Love", label: "ILoveYou", emoji: "🤟" },
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
            setIsCorrect(null)
        }, 50)
    }, [gestures])

    const startNewRound = useCallback(() => {
        const randomGesture = gestures[Math.floor(Math.random() * gestures.length)]
        setTargetGesture(randomGesture.label)
        setDetectedGesture("")
        setDetectedConfidence(0)
        setRoundResult("")
        setIsCorrect(null)
    }, [gestures])

    const handleRoundEnd = useCallback(() => {
        // Stop the timer
        if (timerWorkerRef.current) {
            timerWorkerRef.current.postMessage({ type: "STOP_TIMER" })
        }

        const isGestureCorrect = detectedGesture === targetGesture && detectedGesture !== ""
        setIsCorrect(isGestureCorrect)

        if (isGestureCorrect) {
            setScore((prevScore) => prevScore + 1)
            setRoundResult("Correct! +1 point")
        } else {
            setRoundResult("Wrong! No points shot khaw")
        }

        if (resultTimeoutRef.current) {
            clearTimeout(resultTimeoutRef.current)
        }

        resultTimeoutRef.current = setTimeout(() => {
            setCurrentRound((prevRound) => {
                const newRound = prevRound + 1;

                if (newRound > 5) {
                    setGameEnded(true);
                    setGameStarted(false);
                } else {
                    startNewRound();
                }

                return newRound;
            });
        }, 3000);

    }, [detectedGesture, targetGesture, currentRound, startNewRound])

    // Function to check for immediate round advancement
    const checkForImmediateAdvancement = useCallback(() => {
        if (gameStarted && !gameEnded && !roundResult) {
            const isGestureCorrect = detectedGesture === targetGesture && detectedGesture !== ""
            const hasHighConfidence = detectedConfidence > 0.75

            if (isGestureCorrect && hasHighConfidence) {
                // Stop the timer immediately
                if (timerWorkerRef.current) {
                    timerWorkerRef.current.postMessage({ type: "STOP_TIMER" })
                }

                setIsCorrect(true)
                setScore((prevScore) => prevScore + 1)
                setRoundResult("Perfect! +1 point (Auto-advance)")

                if (resultTimeoutRef.current) {
                    clearTimeout(resultTimeoutRef.current)
                }

                resultTimeoutRef.current = setTimeout(() => {
                    setCurrentRound((prevRound) => {
                        const newRound = prevRound + 1;

                        if (newRound > 5) {
                            setGameEnded(true);
                            setGameStarted(false);
                        } else {
                            startNewRound();
                        }

                        return newRound;
                    });
                }, 3000);

            }
        }
    }, [
        gameStarted,
        gameEnded,
        roundResult,
        detectedGesture,
        targetGesture,
        detectedConfidence,
        currentRound,
        startNewRound,
    ])

    // useEffect to check for immediate advancement when gesture or confidence changes
    useEffect(() => {
        checkForImmediateAdvancement()
    }, [detectedGesture, detectedConfidence, checkForImmediateAdvancement])

    // Timer function using Web Worker
    const startTimer = useCallback(() => {
        if (timerWorkerRef.current) {
            timerWorkerRef.current.postMessage({ type: "START_TIMER", data: { duration: 10 } })
        }
    }, [])

    const stopTimer = useCallback(() => {
        if (timerWorkerRef.current) {
            timerWorkerRef.current.postMessage({ type: "STOP_TIMER" })
        }
    }, [])

    // useEffect to start timer when game starts or new round begins
    useEffect(() => {
        if (gameStarted && !gameEnded && !roundResult) {
            startTimer()
        }
    }, [gameStarted, gameEnded, roundResult, currentRound, startTimer])

    const getGestureName = useCallback(
        (label: string) => {
            const gesture = gestures.find((g) => g.label === label)
            return gesture ? gesture.name : label
        },
        [gestures],
    )

    const getGestureEmoji = useCallback(
        (label: string) => {
            const gesture = gestures.find((g) => g.label === label)
            return gesture ? gesture.emoji : "👋"
        },
        [gestures],
    )

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current)
                animationFrameRef.current = null
            }
            if (timerRef.current) {
                clearTimeout(timerRef.current)
                timerRef.current = null
            }
            if (resultTimeoutRef.current) {
                clearTimeout(resultTimeoutRef.current)
                resultTimeoutRef.current = null
            }
            if (timerWorkerRef.current) {
                timerWorkerRef.current.terminate()
                timerWorkerRef.current = null
            }
        }
    }, [])

    // Initialize gesture recognizer
    useEffect(() => {
        const createGestureRecognizer = async () => {
            try {
                const vision = await FilesetResolver.forVisionTasks(
                    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm",
                )
                const recognizer = await GestureRecognizer.createFromOptions(vision, {
                    baseOptions: {
                        modelAssetPath:
                            "https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task",
                        delegate: "CPU",
                    },
                    runningMode: "IMAGE",
                })
                setGestureRecognizer(recognizer)
                setIsLoading(false)
            } catch (error) {
                console.error("Error initializing gesture recognizer:", error)
                setIsLoading(false)
            }
        }

        createGestureRecognizer()
    }, [])

    const enableWebcam = useCallback(async () => {
        if (!gestureRecognizer) {
            alert("GestureRecognizer not loaded yet.")
            return
        }

        if (!webcamRunning) {
            try {
                setIsInitializing(true)
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { width: videoWidth, height: videoHeight },
                })

                if (videoRef.current && canvasRef.current) {
                    videoRef.current.srcObject = stream

                    // Set canvas dimensions
                    canvasRef.current.width = videoWidth
                    canvasRef.current.height = videoHeight

                    videoRef.current.addEventListener("loadeddata", () => {
                        console.log("Video loaded, starting prediction...")
                        setWebcamRunning(true)
                        setIsInitializing(false)
                    })
                }
            } catch (error) {
                console.error("Error accessing webcam:", error)
                alert("Could not access webcam. Please ensure permissions are granted.")
                setIsInitializing(false)
            }
        } else {
            // Stop webcam
            if (videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream
                stream.getTracks().forEach((track) => track.stop())
                videoRef.current.srcObject = null
            }

            // Cancel any running animation frame
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current)
                animationFrameRef.current = null
            }

            setWebcamRunning(false)

            // Stop timer if running
            if (timerWorkerRef.current) {
                timerWorkerRef.current.postMessage({ type: "STOP_TIMER" })
            }
        }
    }, [gestureRecognizer, webcamRunning, videoWidth, videoHeight])

    let lastInferenceTime = 0
    const minInterval = 250

    const predictWebcam = useCallback(async () => {
        if (!gestureRecognizer || !videoRef.current || !canvasRef.current || !webcamRunning) return

        const ctx = canvasRef.current.getContext("2d")
        if (!ctx) return

        const drawingUtils = new DrawingUtils(ctx)
        let lastVideoTime = -1

        const loop = async () => {
            if (!webcamRunning || !videoRef.current || !canvasRef.current) return

            try {
                // Change to VIDEO mode if needed
                if (runningMode === "IMAGE") {
                    setRunningMode("VIDEO")
                    await gestureRecognizer.setOptions({ runningMode: "VIDEO" })
                }

                const nowInMs = Date.now()

                // Only process if video time has changed and enough time has passed
                if (videoRef.current.currentTime !== lastVideoTime && nowInMs - lastInferenceTime > minInterval) {
                    lastVideoTime = videoRef.current.currentTime
                    lastInferenceTime = nowInMs

                    const results = gestureRecognizer.recognizeForVideo(videoRef.current, nowInMs)

                    if (results) {
                        // Clear canvas
                        ctx.clearRect(0, 0, videoWidth, videoHeight)

                        // Draw landmarks
                        if (results.landmarks) {
                            for (const landmarks of results.landmarks) {
                                drawingUtils.drawConnectors(landmarks, GestureRecognizer.HAND_CONNECTIONS, {
                                    color: "#00FF00",
                                    lineWidth: 3,
                                })
                                drawingUtils.drawLandmarks(landmarks, {
                                    color: "#FF0000",
                                    lineWidth: 2,
                                })
                            }
                        }

                        // Display gesture and update detected gesture for game
                        if (results.gestures.length > 0) {
                            const gesture = results.gestures[0][0]
                            const handedness = results.handednesses[0][0].displayName

                            // Update detected gesture and confidence for game logic
                            setDetectedGesture(gesture.categoryName)
                            setDetectedConfidence(gesture.score)

                            if (gestureOutputRef.current) {
                                gestureOutputRef.current.innerText = `${gesture.categoryName} (${(gesture.score * 100).toFixed(1)}%) - ${handedness}`
                                gestureOutputRef.current.className = "p-4 bg-white/90 backdrop-blur-lg rounded-2xl font-semibold text-gray-700 shadow-gesture transition-all duration-300 text-center max-w-lg opacity-100 transform translate-y-0"
                            }
                        } else {
                            setDetectedGesture("")
                            setDetectedConfidence(0)
                            if (gestureOutputRef.current) {
                                gestureOutputRef.current.className = "hidden p-4 bg-white/90 backdrop-blur-lg rounded-2xl font-semibold text-gray-700 shadow-gesture transition-all duration-300 text-center max-w-lg opacity-0 transform translate-y-2"
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
            <div className="gesture-container">
                <div className="loading-container">
                    <div className="loading-spinner">
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-4xl animate-pulse">
                            🎯
                        </div>
                    </div>
                    <h2 className="text-4xl font-fredoka mb-4 text-gradient">Loading AI Model...</h2>
                    <p className="text-gray-600 text-xl font-semibold">Preparing gesture recognition system</p>
                </div>
            </div>
        )
    }

    return (
        <div className="gesture-container">
            <main className="w-full max-w-7xl flex flex-col items-center">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 w-full min-h-screen items-start">
                    {/* Left Column - Camera */}
                    <div className="flex flex-col items-center gap-6 lg:sticky lg:top-8">
                        <div className="video-container">
                            <video ref={videoRef} autoPlay playsInline muted className="video-element" />
                            <canvas ref={canvasRef} className="canvas-overlay" />
                            {!webcamRunning && (
                                <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-primary-gradient text-white">
                                    <div className="text-center animate-float">
                                        <span className="block text-6xl mb-4 animate-bounce">📹</span>
                                        <p className="text-xl font-semibold opacity-90">Camera not active</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div ref={gestureOutputRef} className="hidden p-4 bg-white/90 backdrop-blur-lg rounded-2xl font-semibold text-gray-700 shadow-gesture transition-all duration-300 text-center max-w-lg opacity-0 transform translate-y-2">
                            Gesture output will appear here
                        </div>
                    </div>

                    {/* Right Column - Game Controls */}
                    <div className="flex flex-col gap-4">
                        {!gameStarted && !gameEnded && (
                            <div className="game-panel">
                                <h2 className="panel-title">
                                    <span className="text-4xl">🎯</span>
                                    Ready to Play?
                                </h2>
                                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                                    Test your reflexes! You'll have 5 rounds to perform the correct gesture within 10 seconds each.
                                </p>

                                <div className="mb-6">
                                    <h3 className="text-xl font-semibold mb-4 text-gray-700">Available Gestures:</h3>
                                    <div className="grid grid-cols-2 gap-3 mb-6">
                                        {gestures.map((gesture, index) => (
                                            <div key={index} className="gesture-card group">
                                                <span className="gesture-emoji group-hover:animate-wiggle">{gesture.emoji}</span>
                                                <span className="gesture-name">{gesture.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex flex-col gap-4">
                                    <button
                                        onClick={enableWebcam}
                                        className={`${webcamRunning ? "btn-danger" : "btn-secondary"}`}
                                        disabled={isInitializing}
                                    >
                                        <span className={`w-2 h-2 rounded-full ${webcamRunning ? "bg-green-400 animate-pulse" : "bg-gray-400"}`}></span>
                                        {isInitializing ? "Initializing..." : webcamRunning ? "Stop Camera" : "Start Camera"}
                                    </button>

                                    {webcamRunning && (
                                        <button onClick={startGame} className="btn-primary">
                                            <span className="text-xl">🚀</span>
                                            Start Game
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        {gameStarted && !gameEnded && (
                            <div className="game-panel">
                                <div className="mb-6">
                                    <h2 className="panel-title">
                                        <span className="text-4xl">🎮</span>
                                        Game Active
                                    </h2>
                                </div>

                                <div className="flex justify-center gap-8 mb-6 flex-wrap">
                                    <div className="flex flex-row gap-4">
                                        <div className="flex flex-col items-center p-4 bg-gray-50 rounded-2xl border-2 border-gray-200 min-w-[120px]">
                                            <span className="text-sm text-gray-500 font-medium mb-1">Round</span>
                                            <span className="text-2xl font-extrabold text-gray-700">{currentRound}/5</span>
                                        </div>
                                        <div className="flex flex-col items-center p-4 bg-gray-50 rounded-2xl border-2 border-gray-200 min-w-[120px]">
                                            <span className="text-sm text-gray-500 font-medium mb-1">Score</span>
                                            <span className="text-2xl font-extrabold text-gray-700">{score}</span>
                                        </div>
                                    </div>
                                    <div className={`timer-display ${timeLeft <= 3 ? "warning" : ""}`}>
                                        <span className="text-sm text-gray-500 font-bold mb-2 uppercase tracking-wide font-nunito">Time Remaining</span>
                                        <span className="timer-value">{timeLeft}s</span>
                                        <div className="absolute top-3 right-4 text-2xl opacity-30">
                                            {timeLeft <= 3 ? "🚨" : "⏰"}
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <h3 className="text-xl text-gray-700 mb-4 text-center font-semibold">Show this gesture:</h3>
                                    <div className="target-gesture">
                                        <span className="target-emoji">{getGestureEmoji(targetGesture)}</span>
                                        <span className="target-name">{getGestureName(targetGesture)}</span>
                                        <div className="absolute top-0 left-0 w-full h-full opacity-10">
                                            <div className="w-full h-full bg-gradient-to-r from-transparent via-white to-transparent animate-pulse"></div>
                                        </div>
                                    </div>
                                </div>

                                {detectedGesture && (
                                    <div className="mb-4">
                                        <h4 className="text-lg text-gray-600 mb-3 text-center font-medium">Currently Detected:</h4>
                                        <div className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-2xl border-2 border-gray-200">
                                            <span className="text-xl font-semibold text-gray-700">{getGestureName(detectedGesture)}</span>
                                            <span
                                                className={`px-4 py-2 rounded-full text-sm font-semibold ${
                                                    detectedConfidence > 0.75 
                                                        ? "bg-green-100 text-green-800" 
                                                        : detectedConfidence > 0.5 
                                                        ? "bg-yellow-100 text-yellow-800" 
                                                        : "bg-red-100 text-red-800"
                                                }`}
                                            >
                                                {(detectedConfidence * 100).toFixed(1)}%
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {roundResult && (
                                    <div className={`${isCorrect ? "result-correct" : "result-incorrect"} mt-4`}>
                                        <span className="text-3xl">{isCorrect ? "✅" : "❌"}</span>
                                        <span>{roundResult}</span>
                                        {isCorrect && (
                                            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-2xl opacity-0 animate-confetti pointer-events-none">
                                                🎉 ✨ 🎊 ⭐ 🌟 🎈
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {gameEnded && (
                            <div className="game-panel text-center">
                                <h2 className="panel-title justify-center">
                                    <span className="text-5xl animate-bounce">🏆</span>
                                    Game Complete!
                                </h2>

                                <div className="flex flex-col items-center gap-4 mb-8 p-8 bg-primary-gradient rounded-3xl text-white">
                                    <span className="text-xl opacity-90">Final Score</span>
                                    <span className="text-6xl font-extrabold">{score}/5</span>
                                </div>

                                <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                                    {score === 5
                                        ? "🌟 Perfect! You're a gesture master!"
                                        : score >= 3
                                            ? "👏 Great job! Keep practicing!"
                                            : "💪 Keep practicing! You'll get better!"}
                                </p>

                                <button onClick={startGame} className="btn-primary">
                                    <span className="text-xl">🔄</span>
                                    Play Again
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    )
}

export default GestureRecognizerComponent
