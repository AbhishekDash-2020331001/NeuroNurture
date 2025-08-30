"use client"

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface RoundResult {
    round: number;
    targetPose: string;
    detectedPose: string;
    correct: boolean;
    confidence: number;
    timeUsed: number;
}

const DanceDoodleGame: React.FC = () => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentScore, setCurrentScore] = useState(0);
    const [gameStarted, setGameStarted] = useState(false);
    const [currentPose, setCurrentPose] = useState<string>("");
    const [detectedPose, setDetectedPose] = useState<string>("");
    const [confidence, setConfidence] = useState<number>(0);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [timeLeft, setTimeLeft] = useState(10); // 10 seconds per round
    const [round, setRound] = useState(1);
    const [gamePhase, setGamePhase] = useState<'start' | 'playing' | 'result' | 'statistics'>('start');
    const [webcamActive, setWebcamActive] = useState(false);
    const [gameResults, setGameResults] = useState<RoundResult[]>([]);
    const [roundStartTime, setRoundStartTime] = useState<number>(0);
    const [isDetecting, setIsDetecting] = useState(false);
    
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Available dance poses - exactly 5 poses for 5 rounds
    const gamePoses = React.useMemo(() => [
        { name: "Cool Arms", label: "cool_arms", emoji: "💪" },
        { name: "Open Wings", label: "open_wings", emoji: "🦅" },
        { name: "Ready Pose", label: "ready_pose", emoji: "🎯" },
        { name: "Silly Boxer", label: "silly_boxer", emoji: "🥊" },
        { name: "Happy Stand Left", label: "happy_stand_left", emoji: "😊" },
    ], []);

    const MAX_ROUNDS = 5;

    // Webcam functions
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
                streamRef.current = stream;
                setWebcamActive(true);
            }
        } catch (error) {
            console.error('Error accessing webcam:', error);
            alert('Could not access webcam. Please ensure camera permissions are granted.');
        }
    }, []);

    const stopWebcam = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        setWebcamActive(false);
    }, []);

    const captureFrame = useCallback((): string | null => {
        if (!videoRef.current || !canvasRef.current) return null;
        
        const canvas = canvasRef.current;
        const video = videoRef.current;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) return null;
        
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0);
        
        return canvas.toDataURL('image/jpeg', 0.8);
    }, []);

    const detectPoseFromWebcam = useCallback(async () => {
        if (isDetecting) return;
        
        const frameData = captureFrame();
        if (!frameData) return;
        
        setIsDetecting(true);
        
        try {
            // Convert base64 to blob
            const response = await fetch(frameData);
            const blob = await response.blob();
            
            const formData = new FormData();
            formData.append('file', blob, 'webcam_frame.jpg');

            const apiResponse = await fetch('http://127.0.0.1:8000/predictDancePose', {
                method: 'POST',
                body: formData,
            });

            const result = await apiResponse.json();
            
            if (result.status === 'success') {
                setDetectedPose(result.prediction);
                setConfidence(result.confidence);
                
                // Check if the detected pose matches the target pose
                const correct = result.prediction === currentPose;
                setIsCorrect(correct);
                
                if (correct && round <= MAX_ROUNDS) {
                    // Pose detected correctly - record result and move to next round
                    const timeUsed = 10 - timeLeft;
                    const roundResult: RoundResult = {
                        round,
                        targetPose: currentPose,
                        detectedPose: result.prediction,
                        correct: true,
                        confidence: result.confidence,
                        timeUsed
                    };
                    
                    setGameResults(prev => [...prev, roundResult]);
                    setCurrentScore(prev => prev + 1);
                    
                    // Stop detection for this round
                    if (detectionIntervalRef.current) {
                        clearInterval(detectionIntervalRef.current);
                        detectionIntervalRef.current = null;
                    }
                    
                    // Show result briefly then move to next round
                    setGamePhase('result');
                    setTimeout(() => {
                        if (round < MAX_ROUNDS) {
                            startNextRound();
                        } else {
                            endGame();
                        }
                    }, 2000);
                }
            }
        } catch (error) {
            console.error('Error detecting pose:', error);
        } finally {
            setIsDetecting(false);
        }
    }, [captureFrame, currentPose, round, timeLeft, isDetecting]);

    const startNextRound = useCallback(() => {
        const nextRound = round + 1;
        setRound(nextRound);
        setTimeLeft(10);
        setCurrentPose(gamePoses[nextRound - 1].label);
        setDetectedPose("");
        setConfidence(0);
        setIsCorrect(null);
        setGamePhase('playing');
        setRoundStartTime(Date.now());
        
        // Start continuous pose detection
        detectionIntervalRef.current = setInterval(detectPoseFromWebcam, 1000); // Check every second
    }, [round, gamePoses, detectPoseFromWebcam]);

    const endGame = useCallback(() => {
        setIsPlaying(false);
        setGamePhase('statistics');
        
        // Stop detection
        if (detectionIntervalRef.current) {
            clearInterval(detectionIntervalRef.current);
            detectionIntervalRef.current = null;
        }
        
        stopWebcam();
    }, [stopWebcam]);

    const startGame = useCallback(async () => {
        setGameStarted(true);
        setIsPlaying(true);
        setCurrentScore(0);
        setRound(1);
        setTimeLeft(10);
        setGameResults([]);
        setDetectedPose("");
        setConfidence(0);
        setIsCorrect(null);
        setGamePhase('playing');
        
        // Start webcam
        await startWebcam();
        
        // Set first pose
        setCurrentPose(gamePoses[0].label);
        setRoundStartTime(Date.now());
        
        // Start continuous pose detection
        setTimeout(() => {
            detectionIntervalRef.current = setInterval(detectPoseFromWebcam, 1000);
        }, 1000); // Give webcam time to initialize
    }, [gamePoses, startWebcam, detectPoseFromWebcam]);

    const resetGame = useCallback(() => {
        // Stop detection
        if (detectionIntervalRef.current) {
            clearInterval(detectionIntervalRef.current);
            detectionIntervalRef.current = null;
        }
        
        stopWebcam();
        
        setGameStarted(false);
        setIsPlaying(false);
        setCurrentScore(0);
        setRound(1);
        setTimeLeft(10);
        setCurrentPose("");
        setDetectedPose("");
        setConfidence(0);
        setIsCorrect(null);
        setGamePhase('start');
        setGameResults([]);
        setRoundStartTime(0);
    }, [stopWebcam]);

    // Timer effect - handle round timeout
    useEffect(() => {
        let interval: NodeJS.Timeout;
        
        if (isPlaying && timeLeft > 0 && gamePhase === 'playing') {
            interval = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        // Time's up for this round - record failed attempt
                        const roundResult: RoundResult = {
                            round,
                            targetPose: currentPose,
                            detectedPose: detectedPose || "No pose detected",
                            correct: false,
                            confidence: confidence,
                            timeUsed: 10
                        };
                        
                        setGameResults(prev => [...prev, roundResult]);
                        
                        // Stop detection for this round
                        if (detectionIntervalRef.current) {
                            clearInterval(detectionIntervalRef.current);
                            detectionIntervalRef.current = null;
                        }
                        
                        setGamePhase('result');
                        setTimeout(() => {
                            if (round < MAX_ROUNDS) {
                                startNextRound();
                            } else {
                                endGame();
                            }
                        }, 2000);
                        
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isPlaying, timeLeft, gamePhase, round, currentPose, detectedPose, confidence, startNextRound, endGame]);

    // Cleanup effect
    useEffect(() => {
        return () => {
            if (detectionIntervalRef.current) {
                clearInterval(detectionIntervalRef.current);
            }
            stopWebcam();
        };
    }, [stopWebcam]);

    const getPoseDisplayName = (poseLabel: string) => {
        const pose = gamePoses.find(p => p.label === poseLabel);
        return pose ? pose.name : poseLabel;
    };

    const getPoseEmoji = (poseLabel: string) => {
        const pose = gamePoses.find(p => p.label === poseLabel);
        return pose ? pose.emoji : "🎭";
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 p-6">
            {/* Header */}
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <Link 
                        to="/" 
                        className="text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-2"
                    >
                        ← Back to Dashboard
                    </Link>
                    <h1 className="text-4xl font-bold text-gray-800 text-center flex-1">
                        🕺 Dance Doodle Game 💃
                    </h1>
                </div>

                {/* Game Stats */}
                {gamePhase !== 'start' && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                        <div className="bg-white rounded-lg p-4 shadow-md text-center">
                            <div className="text-2xl font-bold text-blue-600">{currentScore}</div>
                            <div className="text-sm text-gray-600">Score</div>
                        </div>
                        <div className="bg-white rounded-lg p-4 shadow-md text-center">
                            <div className="text-2xl font-bold text-green-600">{round}/{MAX_ROUNDS}</div>
                            <div className="text-sm text-gray-600">Round</div>
                        </div>
                        <div className="bg-white rounded-lg p-4 shadow-md text-center">
                            <div className={`text-2xl font-bold ${timeLeft <= 3 ? 'text-red-600' : 'text-orange-600'}`}>
                                {timeLeft}s
                            </div>
                            <div className="text-sm text-gray-600">Time Left</div>
                        </div>
                        <div className="bg-white rounded-lg p-4 shadow-md text-center">
                            <div className="text-2xl font-bold text-purple-600">
                                {webcamActive ? '📹' : '📷'}
                            </div>
                            <div className="text-sm text-gray-600">Camera</div>
                        </div>
                    </div>
                )}

                {/* Game Area */}
                <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
                    {gamePhase === 'start' && (
                        <div className="text-center">
                            <div className="text-6xl mb-6">🎭</div>
                            <h2 className="text-3xl font-bold text-gray-800 mb-4">
                                Welcome to Dance Doodle!
                            </h2>
                            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                                Strike a pose using your webcam! Complete 5 rounds of pose challenges. 
                                You have 10 seconds per round to match the target pose and score 1 point per correct pose.
                            </p>
                            <button
                                onClick={startGame}
                                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-full text-xl font-bold hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105 shadow-lg"
                            >
                                Start Game 🚀
                            </button>
                        </div>
                    )}

                    {gamePhase === 'playing' && (
                        <div className="space-y-6">
                            {/* Large Timer Display */}
                            <div className="text-center">
                                <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full text-4xl font-bold ${
                                    timeLeft <= 3 ? 'bg-red-500 text-white animate-pulse' : 
                                    timeLeft <= 5 ? 'bg-orange-500 text-white' : 
                                    'bg-green-500 text-white'
                                }`}>
                                    {timeLeft}
                                </div>
                                <div className="text-lg text-gray-600 mt-2">
                                    seconds remaining
                                </div>
                                {/* Progress Bar */}
                                <div className="w-full max-w-md mx-auto mt-4 bg-gray-200 rounded-full h-3">
                                    <div 
                                        className={`h-3 rounded-full transition-all duration-1000 ${
                                            timeLeft <= 3 ? 'bg-red-500' : 
                                            timeLeft <= 5 ? 'bg-orange-500' : 
                                            'bg-green-500'
                                        }`}
                                        style={{ width: `${(timeLeft / 10) * 100}%` }}
                                    ></div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Webcam Feed */}
                                <div className="text-center">
                                    <h3 className="text-xl font-bold text-gray-800 mb-4">
                                        Your Performance 📹
                                    </h3>
                                    <div className="relative bg-gray-100 rounded-xl overflow-hidden">
                                        <video
                                            ref={videoRef}
                                            autoPlay
                                            playsInline
                                            muted
                                            className="w-full h-64 object-cover"
                                        />
                                        <canvas
                                            ref={canvasRef}
                                            className="hidden"
                                        />
                                        {!webcamActive && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                                                <div className="text-gray-500">Loading camera...</div>
                                            </div>
                                        )}
                                        {/* Timer Overlay on Video */}
                                        <div className="absolute top-4 right-4">
                                            <div className={`px-3 py-2 rounded-full text-sm font-bold ${
                                                timeLeft <= 3 ? 'bg-red-500 text-white' : 
                                                timeLeft <= 5 ? 'bg-orange-500 text-white' : 
                                                'bg-green-500 text-white'
                                            }`}>
                                                {timeLeft}s
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Target Pose Display */}
                                <div className="text-center">
                                    <h3 className="text-xl font-bold text-gray-800 mb-4">
                                        Target Pose 🎯
                                    </h3>
                                    <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl p-8">
                                        <div className="text-8xl mb-4">{getPoseEmoji(currentPose)}</div>
                                        <div className="text-2xl font-semibold text-gray-800">
                                            {getPoseDisplayName(currentPose)}
                                        </div>
                                        <div className="text-lg text-gray-600 mt-2">
                                            Round {round} of {MAX_ROUNDS}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Live Detection Results */}
                            {detectedPose && (
                                <div className="text-center">
                                    <div className={`inline-block p-6 rounded-xl ${
                                        isCorrect === null ? 'bg-gray-100' :
                                        isCorrect ? 'bg-green-100 border-4 border-green-300' :
                                        'bg-yellow-100 border-4 border-yellow-300'
                                    }`}>
                                        <div className="text-4xl mb-2">
                                            {isCorrect === null ? '🤔' : 
                                             isCorrect ? '✅ Correct!' : '🔄 Keep trying...'}
                                        </div>
                                        <div className="text-lg font-semibold text-gray-800">
                                            Detected: {getPoseDisplayName(detectedPose)}
                                        </div>
                                        {confidence > 0 && (
                                            <div className="text-sm text-gray-600 mt-1">
                                                Confidence: {confidence}%
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {gamePhase === 'result' && (
                        <div className="text-center">
                            <div className="text-6xl mb-4">
                                {isCorrect ? '🎉' : '⏰'}
                            </div>
                            <h2 className="text-3xl font-bold text-gray-800 mb-4">
                                {isCorrect ? 'Great Job!' : 'Time\'s Up!'}
                            </h2>
                            <p className="text-xl text-gray-600 mb-6">
                                {isCorrect 
                                    ? `You scored 1 point! Moving to round ${round + 1}...`
                                    : 'Moving to the next round...'
                                }
                            </p>
                        </div>
                    )}

                    {gamePhase === 'statistics' && (
                        <div className="space-y-6">
                            <div className="text-center">
                                <div className="text-6xl mb-4">📊</div>
                                <h2 className="text-3xl font-bold text-gray-800 mb-4">
                                    Game Statistics
                                </h2>
                                <div className="text-2xl text-blue-600 font-bold mb-6">
                                    Final Score: {currentScore} / {MAX_ROUNDS}
                                </div>
                            </div>

                            {/* Detailed Round Results */}
                            <div className="bg-gray-50 rounded-xl p-6">
                                <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
                                    Round by Round Results
                                </h3>
                                <div className="space-y-3">
                                    {gameResults.map((result, index) => (
                                        <div key={index} className={`flex items-center justify-between p-4 rounded-lg ${
                                            result.correct ? 'bg-green-100' : 'bg-red-100'
                                        }`}>
                                            <div className="flex items-center gap-3">
                                                <span className="text-lg font-bold">Round {result.round}</span>
                                                <span className="text-2xl">{getPoseEmoji(result.targetPose)}</span>
                                                <span>{getPoseDisplayName(result.targetPose)}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className={`text-lg font-bold ${
                                                    result.correct ? 'text-green-600' : 'text-red-600'
                                                }`}>
                                                    {result.correct ? '✅ Correct' : '❌ Failed'}
                                                </span>
                                                <span className="text-sm text-gray-600">
                                                    {result.timeUsed}s
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Performance Summary */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-blue-100 rounded-lg p-4 text-center">
                                    <div className="text-2xl font-bold text-blue-600">
                                        {((currentScore / MAX_ROUNDS) * 100).toFixed(0)}%
                                    </div>
                                    <div className="text-sm text-gray-600">Success Rate</div>
                                </div>
                                <div className="bg-green-100 rounded-lg p-4 text-center">
                                    <div className="text-2xl font-bold text-green-600">
                                        {gameResults.filter(r => r.correct).length}
                                    </div>
                                    <div className="text-sm text-gray-600">Correct Poses</div>
                                </div>
                                <div className="bg-orange-100 rounded-lg p-4 text-center">
                                    <div className="text-2xl font-bold text-orange-600">
                                        {gameResults.reduce((acc, r) => acc + r.timeUsed, 0)}s
                                    </div>
                                    <div className="text-sm text-gray-600">Total Time</div>
                                </div>
                            </div>

                            <div className="text-center">
                                <button
                                    onClick={resetGame}
                                    className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-3 rounded-full text-lg font-bold hover:from-green-600 hover:to-blue-600 transition-all transform hover:scale-105 shadow-lg mr-4"
                                >
                                    Play Again 🔄
                                </button>
                                <Link
                                    to="/"
                                    className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-full text-lg font-bold transition-all transform hover:scale-105 shadow-lg"
                                >
                                    Back to Dashboard 🏠
                                </Link>
                            </div>
                        </div>
                    )}
                </div>

                {/* Instructions */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                    <h3 className="text-2xl font-bold text-gray-800 mb-4">🎯 How to Play</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div className="flex items-start gap-3">
                            <div className="text-2xl">1️⃣</div>
                            <div>Allow camera access when prompted</div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="text-2xl">2️⃣</div>
                            <div>Look at the target pose and copy it</div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="text-2xl">3️⃣</div>
                            <div>AI automatically detects your pose</div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="text-2xl">4️⃣</div>
                            <div>Complete 5 rounds to see your final score!</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DanceDoodleGame;
