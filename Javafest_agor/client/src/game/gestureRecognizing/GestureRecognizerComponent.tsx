"use client"

import type React from "react"
import { useRef, useEffect, useState, useCallback, useMemo } from "react"

const GestureRecognizerComponent: React.FC = () => {
    const videoRef = useRef<HTMLVideoElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const gestureOutputRef = useRef<HTMLParagraphElement>(null)
    const [webcamRunning, setWebcamRunning] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isInitializing, setIsInitializing] = useState(false)
    const [isVisible, setIsVisible] = useState(true)

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
    const lastInferenceTimeRef = useRef<number>(0)
    const isProcessingRef = useRef<boolean>(false)

    const videoHeight = 450
    const videoWidth = 600

    // Memoized gestures array - matching API labels
    const gestures = useMemo(
        () => [
            { name: "Closed Fist", label: "closed_fist", emoji: "✊" },
            { name: "Open Palm", label: "open_palm", emoji: "🖐️" },
            { name: "Pointing Up", label: "pointing_up", emoji: "☝️" },
            { name: "Thumbs Down", label: "thumbs_down", emoji: "👎" },
            { name: "Thumbs Up", label: "thumbs_up", emoji: "👍" },
            { name: "Victory", label: "victory", emoji: "✌️" },
            { name: "ILoveYou", label: "iloveyou", emoji: "�" },
            { name: "Nice", label: "nice", emoji: "👌" },
            { name: "Heart", label: "heart", emoji: "🫶" },
            { name: "Dua", label: "dua", emoji: "🙏" },
            { name: "Spectacle", label: "spectacle", emoji: "🧿" },
            { name: "Butterfly", label: "butterfly", emoji: "🦋" },
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
                    // Use requestAnimationFrame to ensure smooth UI updates
                    requestAnimationFrame(() => {
                        setTimeLeft(time)
                    })
                    break
                case "TIMER_FINISHED":
                    // Use requestAnimationFrame to ensure smooth UI updates
                    requestAnimationFrame(() => {
                        handleRoundEnd()
                    })
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
        // Use setTimeout to prevent blocking
        setTimeout(() => {
            // Stop the timer
            if (timerWorkerRef.current) {
                timerWorkerRef.current.postMessage({ type: "STOP_TIMER" })
            }

            const isGestureCorrect = detectedGesture === targetGesture && detectedGesture !== ""
            
            // Update state in next frame for smooth UI
            requestAnimationFrame(() => {
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
                    requestAnimationFrame(() => {
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
                    });
                }, 3000);
            })
        }, 0)
    }, [detectedGesture, targetGesture, startNewRound])

    // Function to check for immediate round advancement (optimized for smooth UI)
    const checkForImmediateAdvancement = useCallback(() => {
        if (gameStarted && !gameEnded && !roundResult) {
            const isGestureCorrect = detectedGesture === targetGesture && detectedGesture !== ""
            const hasHighConfidence = detectedConfidence > 0.75

            if (isGestureCorrect && hasHighConfidence) {
                // Use setTimeout to prevent blocking the UI
                setTimeout(() => {
                    // Stop the timer immediately
                    if (timerWorkerRef.current) {
                        timerWorkerRef.current.postMessage({ type: "STOP_TIMER" })
                    }

                    // Update state in next frame
                    requestAnimationFrame(() => {
                        setIsCorrect(true)
                        setScore((prevScore) => prevScore + 1)
                        setRoundResult("Perfect! +1 point (Auto-advance)")

                        if (resultTimeoutRef.current) {
                            clearTimeout(resultTimeoutRef.current)
                        }

                        resultTimeoutRef.current = setTimeout(() => {
                            requestAnimationFrame(() => {
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
                            });
                        }, 3000);
                    })
                }, 0)
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

    // useEffect to check for immediate advancement when gesture or confidence changes (debounced)
    useEffect(() => {
        // Use requestAnimationFrame to prevent blocking UI updates
        const timeoutId = setTimeout(() => {
            requestAnimationFrame(() => {
                checkForImmediateAdvancement()
            })
        }, 100) // Small debounce to prevent too frequent checks

        return () => clearTimeout(timeoutId)
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

    // Add visibility change detection for performance
    useEffect(() => {
        const handleVisibilityChange = () => {
            setIsVisible(!document.hidden)
        }

        document.addEventListener('visibilitychange', handleVisibilityChange)
        
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange)
        }
    }, [])
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
            // Reset processing flag
            isProcessingRef.current = false
        }
    }, [])

    // Function to capture frame from video and call API (optimized for non-blocking)
    const captureFrameAndPredict = useCallback(async () => {
        if (!videoRef.current || !canvasRef.current || isProcessingRef.current) return null

        const video = videoRef.current
        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        
        if (!ctx) return null

        // Set processing flag to prevent multiple simultaneous calls
        isProcessingRef.current = true

        try {
            // Draw current video frame to canvas
            ctx.drawImage(video, 0, 0, videoWidth, videoHeight)
            
            // Convert canvas to blob asynchronously
            const blob = await new Promise<Blob | null>((resolve) => {
                canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.8)
            })

            if (!blob) return null

            // Create FormData to send to API
            const formData = new FormData()
            formData.append('file', blob, 'frame.jpg')

            // Call your API with timeout
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout

            const response = await fetch('http://localhost:8000/predictGesture', {
                method: 'POST',
                body: formData,
                signal: controller.signal
            })

            clearTimeout(timeoutId)

            if (response.ok) {
                const result = await response.text()
                return result.trim()
            } else {
                console.error('API Error:', response.statusText)
                return null
            }
        } catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
                console.log('API call aborted due to timeout')
            } else {
                console.error('Error calling gesture API:', error)
            }
            return null
        } finally {
            isProcessingRef.current = false
        }
    }, [videoWidth, videoHeight])

    // Parse API response to extract gesture name and confidence
    const parseGestureResponse = useCallback((response: string) => {
        // Your API now returns simple labels like "victory", "closed_fist", "none", etc.
        const cleanResponse = response.trim().toLowerCase()
        
        if (!cleanResponse || cleanResponse === "none" || cleanResponse === "no_hands_detected" || cleanResponse === "error") {
            return { gesture: "", confidence: 0 }
        }

        // The response is already the gesture label
        const confidence = 0.9 // Assume high confidence if gesture detected
        
        return { gesture: cleanResponse, confidence }
    }, [])

    const enableWebcam = useCallback(async () => {
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
    }, [webcamRunning, videoWidth, videoHeight])

    const minInterval = 1500 // Increase interval for API calls (1.5 seconds for better performance)

    const predictWebcam = useCallback(async () => {
        if (!videoRef.current || !canvasRef.current || !webcamRunning || !isVisible) return

        const loop = () => {
            if (!webcamRunning || !videoRef.current || !canvasRef.current || !isVisible) return

            const nowInMs = Date.now()

            // Only process if enough time has passed and not currently processing
            if (nowInMs - lastInferenceTimeRef.current > minInterval && !isProcessingRef.current) {
                lastInferenceTimeRef.current = nowInMs

                // Use setTimeout to make API call non-blocking
                setTimeout(async () => {
                    try {
                        const result = await captureFrameAndPredict()
                        
                        if (result && webcamRunning) {
                            const { gesture, confidence } = parseGestureResponse(result)
                            
                            // Update state in the next frame to prevent blocking
                            requestAnimationFrame(() => {
                                setDetectedGesture(gesture)
                                setDetectedConfidence(confidence)

                                if (gestureOutputRef.current) {
                                    if (gesture) {
                                        gestureOutputRef.current.innerText = `${getGestureName(gesture)} (${(confidence * 100).toFixed(1)}%)`
                                        gestureOutputRef.current.className = "p-4 bg-white/90 backdrop-blur-lg rounded-2xl font-semibold text-gray-700 shadow-gesture transition-all duration-300 text-center max-w-lg opacity-100 transform translate-y-0"
                                    } else {
                                        gestureOutputRef.current.className = "hidden p-4 bg-white/90 backdrop-blur-lg rounded-2xl font-semibold text-gray-700 shadow-gesture transition-all duration-300 text-center max-w-lg opacity-0 transform translate-y-2"
                                    }
                                }
                            })
                        } else if (webcamRunning) {
                            // No result from API - update UI in next frame
                            requestAnimationFrame(() => {
                                setDetectedGesture("")
                                setDetectedConfidence(0)
                                if (gestureOutputRef.current) {
                                    gestureOutputRef.current.className = "hidden p-4 bg-white/90 backdrop-blur-lg rounded-2xl font-semibold text-gray-700 shadow-gesture transition-all duration-300 text-center max-w-lg opacity-0 transform translate-y-2"
                                }
                            })
                        }
                    } catch (error) {
                        console.error("Error in API call:", error)
                    }
                }, 0)
            }

            // Continue the loop using requestAnimationFrame for smooth UI
            if (webcamRunning) {
                animationFrameRef.current = requestAnimationFrame(loop)
            }
        }

        loop()
    }, [webcamRunning, captureFrameAndPredict, parseGestureResponse, getGestureName, isVisible])

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
