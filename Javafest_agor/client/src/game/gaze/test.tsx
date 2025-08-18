import React, { useEffect, useState, useRef, useCallback } from 'react';

interface GazeData {
    x: number;
    y: number;
    confidence: string;
    originalX?: number;
    originalY?: number;
    smoothX?: number;
    smoothY?: number;
    rawBrowserX?: number;
    rawBrowserY?: number;
}

interface CalibrationPoint {
    id: number;
    x: number;
    y: number;
    label: string;
}

interface CalibrationResult {
    pointId: number;
    targetX: number;
    targetY: number;
    gazeX: number;
    gazeY: number;
    clickX: number;
    clickY: number;
    accuracy: number;
}

interface Balloon {
    id: number;
    x: number;
    y: number;
    size: number;
    color: string;
    speedX: number;
    speedY: number;
    createdAt: number;
}

interface GameResult {
    score: number;
    balloonsPopped: number;
    accuracy: number;
    gameTime: number;
}

interface BalloonStats {
    id: number;
    spawnTime: number;
    popTime: number;
    timeToPop: number;
    distance: number;
    x: number;
    y: number;
    color: string;
}

interface GameStatistics {
    totalScore: number;
    totalBalloons: number;
    averageTimeToPop: number;
    varianceTimeToPop: number;
    maxTimeToPop: number;
    minTimeToPop: number;
    totalGameTime: number;
    balloonsPerSecond: number;
    accuracy: number;
    balloonDetails: BalloonStats[];
}

class KalmanFilter {
    private A: number; // State transition model
    private H: number; // Observation model
    private Q: number; // Process noise covariance
    private R: number; // Observation noise covariance
    private P: number; // Error covariance
    private x: number; // State estimate
    
    constructor(processNoise = 1e-3, measurementNoise = 1e-1, errorCovariance = 1) {
        this.A = 1; // State transition (position)
        this.H = 1; // Observation model
        this.Q = processNoise; // Process noise
        this.R = measurementNoise; // Measurement noise
        this.P = errorCovariance; // Initial error covariance
        this.x = 0; // Initial state
    }
    
    filter(measurement: number): number {
        // Prediction step
        const x_pred = this.A * this.x;
        const P_pred = this.A * this.P * this.A + this.Q;
        
        // Update step
        const K = P_pred * this.H / (this.H * P_pred * this.H + this.R); // Kalman gain
        this.x = x_pred + K * (measurement - this.H * x_pred);
        this.P = (1 - K * this.H) * P_pred;
        
        return this.x;
    }
    
    reset(initialValue: number = 0) {
        this.x = initialValue;
        this.P = 1;
    }
    
    isInitialized(): boolean {
        return this.x !== 0;
    }
}

export default function GazeTracker() {
    const [gazeData, setGazeData] = useState<GazeData | null>(null);
    const [isTracking, setIsTracking] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [isCalibrating, setIsCalibrating] = useState(false);
    
    // Calibration state
    const [calibrationStep, setCalibrationStep] = useState(0); // 0 = not started, 1-4 = points, 5 = results
    const [calibrationResults, setCalibrationResults] = useState<CalibrationResult[]>([]);
    const [currentPointGaze, setCurrentPointGaze] = useState<{x: number, y: number} | null>(null);
    
    // Game state
    const [gameState, setGameState] = useState<'menu' | 'calibration' | 'game' | 'results'>('menu');
    const [balloons, setBalloons] = useState<Balloon[]>([]);
    const [score, setScore] = useState(0);
    const [gameTimeLeft, setGameTimeLeft] = useState(30);
    const [balloonsPopped, setBalloonesPopped] = useState(0);
    const [gameResult, setGameResult] = useState<GameResult | null>(null);
    const [gameStats, setGameStats] = useState<GameStatistics | null>(null);
    const [balloonStats, setBalloonStats] = useState<BalloonStats[]>([]);
    const [isBlinking, setIsBlinking] = useState(false);
    const [lastBlinkTime, setLastBlinkTime] = useState(0);
    const [lastCollisionTime, setLastCollisionTime] = useState(0);
    const [poppedBalloonIds, setPoppedBalloonIds] = useState<Set<number>>(new Set());
    const gameTimerRef = useRef<NodeJS.Timeout | null>(null);
    const balloonSpawnerRef = useRef<NodeJS.Timeout | null>(null);
    const balloonAnimationRef = useRef<NodeJS.Timeout | null>(null);
    
    // Kalman filters for smooth gaze tracking
    const kalmanXRef = useRef<KalmanFilter | null>(null);
    const kalmanYRef = useRef<KalmanFilter | null>(null);
    const [smoothGazePos, setSmoothGazePos] = useState<{x: number, y: number}>({x: 0, y: 0});
    
    // Calibration points (corners and center)
    const calibrationPoints: CalibrationPoint[] = [
        { id: 1, x: 15, y: 15, label: "Top Left" },
        { id: 2, x: 85, y: 15, label: "Top Right" },
        { id: 3, x: 15, y: 85, label: "Bottom Left" },
        { id: 4, x: 85, y: 85, label: "Bottom Right" }
    ];

    const balloonColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', '#FF9FF3', '#54A0FF', '#5F27CD'];

    // Calculate game statistics
    const calculateGameStats = useCallback((stats: BalloonStats[], gameTime: number): GameStatistics => {
        if (stats.length === 0) {
            return {
                totalScore: 0,
                totalBalloons: 0,
                averageTimeToPop: 0,
                varianceTimeToPop: 0,
                maxTimeToPop: 0,
                minTimeToPop: 0,
                totalGameTime: gameTime,
                balloonsPerSecond: 0,
                accuracy: 0,
                balloonDetails: stats
            };
        }

        const timesToPop = stats.map(s => s.timeToPop);
        const totalScore = stats.length * 10;
        const averageTimeToPop = timesToPop.reduce((sum, time) => sum + time, 0) / stats.length;
        
        // Calculate variance
        const varianceTimeToPop = timesToPop.reduce((sum, time) => {
            return sum + Math.pow(time - averageTimeToPop, 2);
        }, 0) / stats.length;
        
        const maxTimeToPop = Math.max(...timesToPop);
        const minTimeToPop = Math.min(...timesToPop);
        const balloonsPerSecond = stats.length / (gameTime / 1000);
        const accuracy = (stats.length / (totalScore / 10)) * 100;

        return {
            totalScore,
            totalBalloons: stats.length,
            averageTimeToPop,
            varianceTimeToPop,
            maxTimeToPop,
            minTimeToPop,
            totalGameTime: gameTime,
            balloonsPerSecond,
            accuracy,
            balloonDetails: stats
        };
    }, []);

    // Export statistics for backend
    const exportStatsForBackend = useCallback(() => {
        if (!gameStats) return null;
        
        const exportData = {
            timestamp: new Date().toISOString(),
            gameSession: {
                totalScore: gameStats.totalScore,
                totalBalloons: gameStats.totalBalloons,
                gameTime: gameStats.totalGameTime,
                accuracy: gameStats.accuracy
            },
            performance: {
                averageTimeToPop: gameStats.averageTimeToPop,
                varianceTimeToPop: gameStats.varianceTimeToPop,
                maxTimeToPop: gameStats.maxTimeToPop,
                minTimeToPop: gameStats.minTimeToPop,
                balloonsPerSecond: gameStats.balloonsPerSecond
            },
            balloonDetails: gameStats.balloonDetails.map(balloon => ({
                id: balloon.id,
                spawnTime: balloon.spawnTime,
                popTime: balloon.popTime,
                timeToPop: balloon.timeToPop,
                distance: balloon.distance,
                position: { x: balloon.x, y: balloon.y },
                color: balloon.color
            }))
        };
        
        return exportData;
    }, [gameStats]);

    // Send statistics to backend server
    const sendStatsToBackend = useCallback(async () => {
        if (!gameStats) return;
        
        const exportData = exportStatsForBackend();
        if (!exportData) return;
        
        try {
            // Example backend endpoint - replace with your actual backend URL
            const response = await fetch('http://localhost:3001/api/game-stats', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(exportData)
            });
            
            if (response.ok) {
                alert('Statistics successfully sent to backend server!');
            } else {
                alert('Failed to send statistics to backend server.');
            }
        } catch (error) {
            console.error('Error sending statistics to backend:', error);
            alert('Error sending statistics to backend server.');
        }
    }, [gameStats, exportStatsForBackend]);

    // Initialize Kalman filters
    useEffect(() => {
        if (!kalmanXRef.current) {
            kalmanXRef.current = new KalmanFilter(1e-3, 1e-1, 1);
        }
        if (!kalmanYRef.current) {
            kalmanYRef.current = new KalmanFilter(1e-3, 1e-1, 1);
        }
    }, []);

    const startTracking = useCallback(() => {
        setIsTracking(true);
        
        if (kalmanXRef.current) kalmanXRef.current.reset();
        if (kalmanYRef.current) kalmanYRef.current.reset();
        
        intervalRef.current = setInterval(async () => {
            try {
                const response = await fetch('http://localhost:8000/current-gaze');
                const data = await response.json();
                console.log(data);
                if (data.status === 'success' && data.data) {
                    let rawX = data.data.x;
                    let rawY = data.data.y;
                    
                    const browserX = (rawX / 1920) * window.innerWidth;
                    const browserY = (rawY / 1080) * window.innerHeight;
                    
                    let smoothX = browserX;
                    let smoothY = browserY;
                    
                    if (kalmanXRef.current && kalmanYRef.current && !isNaN(browserX) && !isNaN(browserY)) {
                        if (!kalmanXRef.current.isInitialized() && !kalmanYRef.current.isInitialized()) {
                            kalmanXRef.current.reset(browserX);
                            kalmanYRef.current.reset(browserY);
                        }
                        
                        smoothX = kalmanXRef.current.filter(browserX);
                        smoothY = kalmanYRef.current.filter(browserY);
                    }
                    
                    setSmoothGazePos({ x: smoothX, y: smoothY });
                    
                    setGazeData({
                        x: browserX,
                        y: browserY,
                        confidence: data.data.confidence,
                        originalX: data.data.x,
                        originalY: data.data.y,
                        smoothX: smoothX,
                        smoothY: smoothY,
                        rawBrowserX: browserX,
                        rawBrowserY: browserY
                    });
                }
            } catch (error) {
                console.error('Failed to get gaze data:', error);
            }
        }, 10);
    }, []);

    // Stop gaze tracking
    const stopTracking = useCallback(() => {
        setIsTracking(false);
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        setGazeData(null);
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
            if (gameTimerRef.current) clearInterval(gameTimerRef.current);
            if (balloonSpawnerRef.current) clearInterval(balloonSpawnerRef.current);
            if (balloonAnimationRef.current) clearInterval(balloonAnimationRef.current);
        };
    }, []);

    // Start calibration process
    const startCalibration = useCallback(() => {
        setGameState('calibration');
        setCalibrationStep(1);
        setCalibrationResults([]);
        setCurrentPointGaze(null);
        if (!isTracking) {
            startTracking();
        }
    }, [isTracking]);

    const createBalloon = useCallback(() => {
        setBalloons(prev => {
            if (prev.length > 0) {
                return prev;
            }
            
            const newBalloon: Balloon = {
                id: Date.now() + Math.random(),
                x: Math.random() * (window.innerWidth - 200) + 100,
                y: Math.random() * (window.innerHeight - 200) + 100,
                size: 150,
                color: balloonColors[Math.floor(Math.random() * balloonColors.length)],
                speedX: 0,
                speedY: 0,
                createdAt: Date.now()
            };

            // Track balloon spawn for statistics
            setBalloonStats(prev => [...prev, {
                id: newBalloon.id,
                spawnTime: Date.now(),
                popTime: 0,
                timeToPop: 0,
                distance: 0,
                x: newBalloon.x,
                y: newBalloon.y,
                color: newBalloon.color
            }]);

            return [newBalloon];
        });
    }, [balloonColors]);

    const updateBalloons = useCallback(() => {
        setBalloons(prev => prev.filter(balloon => Date.now() - balloon.createdAt < 15000));
    }, []);

    const checkBalloonCollision = useCallback((gazeX: number, gazeY: number) => {
        if (!gazeX || !gazeY || isNaN(gazeX) || isNaN(gazeY)) {
            return; // Skip if invalid coordinates
        }

        const currentTime = Date.now(); 
        
        // Prevent multiple collisions within 500ms (debounce)  
        if (currentTime - lastCollisionTime < 500) {
            return;
        }

        const cutterRadius = 72;
        
        setBalloons(prev => {
            if (prev.length === 0) return prev;
            
            let poppedCount = 0;
            const newlyPoppedIds = new Set<number>();
            
            const remaining = prev.filter(balloon => {
                if (poppedBalloonIds.has(balloon.id)) {
                    return true;
                }
                
                const distance = Math.sqrt(
                    Math.pow(gazeX - balloon.x, 2) + Math.pow(gazeY - balloon.y, 2)
                );
                const balloonRadius = balloon.size / 2;
                const collisionDistance = balloonRadius + cutterRadius;
                
                if (distance <= collisionDistance) {
                    poppedCount++;
                    newlyPoppedIds.add(balloon.id);
                    
                    // Update balloon statistics with pop data
                    setBalloonStats(prev => prev.map(stat => {
                        if (stat.id === balloon.id) {
                            const popTime = Date.now();
                            return {
                                ...stat,
                                popTime,
                                timeToPop: popTime - stat.spawnTime,
                                distance: distance
                            };
                        }
                        return stat;
                    }));
                    
                    return false;
                }
                return true;
            });
            
            if (poppedCount > 0) {
                setLastCollisionTime(currentTime);
                
                setPoppedBalloonIds(prev => {
                    const updated = new Set(prev);
                    newlyPoppedIds.forEach(id => updated.add(id));
                    return updated;
                });
                
                setScore(prev => prev + poppedCount);
                setBalloonesPopped(prev => prev + poppedCount);
                
                setTimeout(() => createBalloon(), 1000);
            }
            
            return remaining;
        });
    }, [createBalloon, lastCollisionTime, poppedBalloonIds]);

    // Continuous collision detection
    useEffect(() => {
        if (gazeData && gameState === 'game') {
            // Use smooth coordinates for collision detection
            const gazeX = (gazeData as any).smoothX;
            const gazeY = (gazeData as any).smoothY;
            
            // Only check collision if we have valid smooth coordinates
            if (gazeX && gazeY && !isNaN(gazeX) && !isNaN(gazeY)) {
                checkBalloonCollision(gazeX, gazeY);
            }
        }
    }, [gazeData, gameState, checkBalloonCollision]);

    const startGame = useCallback(() => {
        setGameState('game');
        setScore(0);
        setBalloons([]);
        setBalloonesPopped(0);
        setBalloonStats([]); // Reset balloon statistics
        setGameTimeLeft(30);
        setGameResult(null);
        setPoppedBalloonIds(new Set()); // Reset popped balloon tracking
        setLastCollisionTime(0); // Reset collision debounce
        
        if (!isTracking) {
            startTracking();
        }

        // Create first balloon immediately
        setTimeout(() => createBalloon(), 500);

        // Game timer
        gameTimerRef.current = setInterval(() => {
            setGameTimeLeft(prev => {
                if (prev <= 1) {
                            setGameState('results');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        // Balloon animation
        balloonAnimationRef.current = setInterval(() => {
            updateBalloons();
        }, 50);
        
        // Auto-spawn backup balloon
        balloonSpawnerRef.current = setInterval(() => {
            setBalloons(prev => {
                if (prev.length === 0) {
                    createBalloon();
                }
                return prev;
            });
        }, 8000);
    }, [isTracking, startTracking, createBalloon, updateBalloons]);

    // Handle calibration point click
    const handleCalibrationClick = useCallback((event: React.MouseEvent, pointId: number) => {
        if (!gazeData || calibrationStep === 0 || calibrationStep > 4) return;
        
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;
        
        const currentPoint = calibrationPoints[pointId - 1];
        
        // Where user clicked (browser coordinates)
        const clickX = event.clientX - rect.left;
        const clickY = event.clientY - rect.top;
        
        // Target point coordinates (convert from percentage to pixels)
        const targetX = (currentPoint.x / 100) * window.innerWidth;
        const targetY = (currentPoint.y / 100) * window.innerHeight;
        
        // Current gaze position (using smooth coordinates)
        const gazeX = (gazeData as any).smoothX;
        const gazeY = (gazeData as any).smoothY;
        
        // Calculate accuracy (distance between gaze and target)
        const distance = Math.sqrt(
            Math.pow(gazeX - targetX, 2) + Math.pow(gazeY - targetY, 2)
        );
        
        // Convert distance to accuracy percentage (closer = higher accuracy)
        // Using screen diagonal as reference for normalization
        const screenDiagonal = Math.sqrt(
            Math.pow(window.innerWidth, 2) + Math.pow(window.innerHeight, 2)
        );
        const accuracy = Math.max(0, 100 - (distance / screenDiagonal) * 100);
        
        const result: CalibrationResult = {
            pointId,
            targetX,
            targetY,
            gazeX,
            gazeY,
            clickX,
            clickY,
            accuracy
        };
        
        setCalibrationResults(prev => [...prev, result]);
        
        if (calibrationStep < 4) {
            setCalibrationStep(prev => prev + 1);
        } else {
            setCalibrationStep(5); // Show results
            setGameState('calibration');
        }
        
    }, [gazeData, calibrationStep, calibrationPoints]);

    // Calculate overall accuracy
    const getOverallAccuracy = () => {
        if (calibrationResults.length === 0) return 0;
        const total = calibrationResults.reduce((sum, result) => sum + result.accuracy, 0);
        return total / calibrationResults.length;
    };

    // Reset calibration
    const resetCalibration = () => {
        setCalibrationStep(0);
        setCalibrationResults([]);
        setCurrentPointGaze(null);
        setGameState('menu');
    };

    const endGame = useCallback(() => {
        const finalResult: GameResult = {
            score,
            balloonsPopped,
            accuracy: balloonsPopped > 0 ? (balloonsPopped / (score / 10)) * 100 : 0,
            gameTime: 30 - gameTimeLeft
        };
        
        setGameResult(finalResult);
        
        // Calculate and set game statistics
        const gameTime = 30 - gameTimeLeft;
        const stats = calculateGameStats(balloonStats, gameTime);
        setGameStats(stats);
        
        // Clear timers
        if (gameTimerRef.current) clearInterval(gameTimerRef.current);
        if (balloonSpawnerRef.current) clearInterval(balloonSpawnerRef.current);
        if (balloonAnimationRef.current) clearInterval(balloonAnimationRef.current);
        
        setBalloons([]);
    }, [score, balloonsPopped, gameTimeLeft, balloonStats, calculateGameStats]);

    // Handle game end when state changes to results
    useEffect(() => {
        if (gameState === 'results' && !gameResult) {
            const finalResult: GameResult = {
                score,
                balloonsPopped,
                accuracy: balloonsPopped > 0 ? (balloonsPopped / (score / 10)) * 100 : 0,
                gameTime: 30 - gameTimeLeft
            };
            setGameResult(finalResult);
            
            // Clear timers
            if (gameTimerRef.current) clearInterval(gameTimerRef.current);
            if (balloonSpawnerRef.current) clearInterval(balloonSpawnerRef.current);
            if (balloonAnimationRef.current) clearInterval(balloonAnimationRef.current);
            
            setBalloons([]);
        }
    }, [gameState, gameResult, score, balloonsPopped, gameTimeLeft]);

    const handleManualCalibration = useCallback((event: React.MouseEvent) => {
        if (calibrationStep > 0) return;
        
        if (!isCalibrating || !gazeData) return;
        
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;
        
        const clickX = event.clientX - rect.left;
        const clickY = event.clientY - rect.top;
        
        const gazeX = (gazeData as any).originalX + offset.x;
        const gazeY = (gazeData as any).originalY + offset.y;
        
        const correction = {
            x: clickX - gazeX,
            y: clickY - gazeY
        };
        
        const newOffset = {
            x: offset.x + correction.x,
            y: offset.y + correction.y
        };
        
        setOffset(newOffset);
        setIsCalibrating(false);
    }, [isCalibrating, gazeData, offset, calibrationStep]);

    return (
        <div 
            ref={containerRef} 
            className={`fixed inset-0 bg-black ${isCalibrating ? 'cursor-crosshair' : ''}`}
            onClick={handleManualCalibration}
        >
            {/* Control Buttons */}
            <div className="absolute top-4 left-4 z-50 flex gap-2 flex-wrap">
                {gameState === 'menu' && (
                    <>
                        <button
                            onClick={startCalibration}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
                        >
                            🎯 Calibrate
                        </button>
                        <button
                            onClick={startGame}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium"
                        >
                            🎈 Start Game
                        </button>
                    </>
                )}

                {gameState === 'calibration' && calibrationStep > 0 && calibrationStep <= 4 && (
                    <div className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium">
                        Calibration: Point {calibrationStep}/4
                    </div>
                )}

                {gameState === 'calibration' && calibrationStep === 5 && (
                    <>
                        <button
                            onClick={resetCalibration}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
                        >
                            Recalibrate
                        </button>
                        <button
                            onClick={startGame}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium"
                        >
                            🎈 Start Game
                        </button>
                    </>
                )}

                {gameState === 'game' && (
                    <div className="flex gap-4 items-center">
                        <div className="px-4 py-2 bg-green-600 text-white rounded-lg font-mono text-lg">
                            Score: {score}
                        </div>
                        <div className="px-4 py-2 bg-red-600 text-white rounded-lg font-mono text-lg">
                            Time: {gameTimeLeft}s
                        </div>
                        <div className="px-4 py-2 bg-blue-600 text-white rounded-lg font-mono">
                            Balloons: {balloonsPopped}
                        </div>
                    </div>
                )}

                {gameState === 'results' && (
                    <button
                        onClick={() => setGameState('menu')}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
                    >
                        Back to Menu
                    </button>
                )}
            </div>





            {/* Calibration Interface */}
            {calibrationStep > 0 && calibrationStep <= 4 && (
                <>
                    {/* Instructions */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-blue-800 text-white p-6 rounded-lg text-center z-40">
                        <h3 className="text-xl font-bold mb-2">Calibration Point {calibrationStep}/4</h3>
                        <p className="mb-2">Look at the {calibrationPoints[calibrationStep - 1].label} circle</p>
                        <p className="text-sm">Click when you're looking at it</p>
                    </div>

                    {/* Calibration Point */}
                    <div 
                        className="absolute w-12 h-12 bg-red-500 border-4 border-white rounded-full cursor-pointer z-50 transform -translate-x-6 -translate-y-6 hover:bg-red-600 animate-pulse"
                        style={{
                            left: `${calibrationPoints[calibrationStep - 1].x}%`,
                            top: `${calibrationPoints[calibrationStep - 1].y}%`,
                        }}
                        onClick={(e) => handleCalibrationClick(e, calibrationStep)}
                    />
                </>
            )}

            {/* Calibration Results */}
            {calibrationStep === 5 && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white text-black p-8 rounded-lg text-center z-50 max-w-2xl">
                    <h3 className="text-2xl font-bold mb-4">Calibration Complete!</h3>
                    
                    <div className="mb-6">
                        <div className="text-4xl font-bold text-green-600 mb-2">
                            {getOverallAccuracy().toFixed(1)}%
                        </div>
                        <div className="text-lg text-gray-600">Overall Accuracy</div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                        {calibrationResults.map((result, index) => (
                            <div key={result.pointId} className="bg-gray-100 p-4 rounded-lg">
                                <div className="font-bold mb-2">{calibrationPoints[index].label}</div>
                                <div className="text-sm text-gray-600">
                                    Accuracy: {result.accuracy.toFixed(1)}%
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                    Target: ({result.targetX.toFixed(0)}, {result.targetY.toFixed(0)})
                                </div>
                                <div className="text-xs text-gray-500">
                                    Gaze: ({result.gazeX.toFixed(0)}, {result.gazeY.toFixed(0)})
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex gap-4 justify-center">
                        <button
                            onClick={resetCalibration}
                            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
                        >
                            Calibrate Again
                        </button>
                        <button
                            onClick={() => {
                                resetCalibration();
                                if (!isTracking) startTracking();
                            }}
                            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium"
                        >
                            Start Game
                        </button>
                    </div>
                </div>
            )}

            {/* Game Results */}
            {gameState === 'results' && gameResult && !gameStats && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gradient-to-br from-purple-800 to-blue-800 text-white p-8 rounded-xl text-center z-50 max-w-2xl border-4 border-yellow-400">
                    <h2 className="text-4xl font-bold mb-6 text-yellow-400">🎈 Game Over! 🎈</h2>
                    
                    <div className="grid grid-cols-2 gap-6 mb-8">
                        <div className="bg-black bg-opacity-30 p-6 rounded-lg">
                            <div className="text-3xl font-bold text-green-400 mb-2">
                                {gameResult.score}
                            </div>
                            <div className="text-lg">Final Score</div>
                        </div>
                        
                        <div className="bg-black bg-opacity-30 p-6 rounded-lg">
                            <div className="text-3xl font-bold text-blue-400 mb-2">
                                {gameResult.balloonsPopped}
                            </div>
                            <div className="text-lg">Balloons Popped</div>
                        </div>
                    </div>

                    <div className="mb-8">
                        <div className="text-6xl mb-4">
                            {gameResult.score >= 200 ? '🏆' : gameResult.score >= 100 ? '🥈' : gameResult.score >= 50 ? '🥉' : '💪'}
                        </div>
                        <div className="text-2xl font-bold mb-2">
                            {gameResult.score >= 200 ? 'Excellent!' : 
                             gameResult.score >= 100 ? 'Great Job!' : 
                             gameResult.score >= 50 ? 'Good Work!' : 'Keep Practicing!'}
                        </div>
                        <div className="text-lg text-gray-300">
                            You scored {(gameResult.score / 30).toFixed(1)} points per second!
                        </div>
                    </div>

                    <div className="flex gap-4 justify-center">
                        <button
                            onClick={() => {
                                const gameTime = 30 - gameTimeLeft;
                                const stats = calculateGameStats(balloonStats, gameTime);
                                setGameStats(stats);
                            }}
                            className="px-8 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-bold text-lg"
                        >
                            📊 View Statistics
                        </button>
                        <button
                            onClick={startGame}
                            className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold text-lg"
                        >
                            🎈 Play Again
                        </button>
                        <button
                            onClick={startCalibration}
                            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-lg"
                        >
                            🎯 Recalibrate
                        </button>
                        <button
                            onClick={() => setGameState('menu')}
                            className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold text-lg"
                        >
                            📋 Menu
                        </button>
                    </div>
                </div>
            )}

            {/* Gaze Dot - Show only when appropriate */}
            {gazeData && (gameState === 'menu' || (gameState === 'calibration' && calibrationStep === 0)) && (
                <div 
                    className="absolute w-4 h-4 bg-red-500 rounded-full pointer-events-none z-40 border-2 border-white"
                    style={{
                        left: `${(gazeData as any).smoothX}px`,
                        top: `${(gazeData as any).smoothY}px`,
                        transform: 'translate(-50%, -50%)', // FIXED: Center the gaze dot properly
                    }}
                />
            )}

            {/* Game Gaze Crosshair */}
            {gazeData && gameState === 'game' && (
                <div 
                    className="absolute pointer-events-none z-40"
                    style={{
                        left: `${(gazeData as any).smoothX}px`,
                        top: `${(gazeData as any).smoothY}px`,
                        width: '144px',
                        height: '144px',
                        transform: 'translate(-50%, -50%)', // FIXED: Center the cutter properly
                    }}
                >
                    {/* Outer circle - 1.5 inch diameter (144px) - collision detection area */}
                    <div className="w-36 h-36 rounded-full border-4 border-red-500 bg-red-200 opacity-40" />
                    {/* Inner crosshair - exact center point used for collision detection */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-red-800 rounded-full border-2 border-white" />
                    {/* Cross lines for better targeting */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-1 bg-red-600" />
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-20 bg-red-600" />
                    

                </div>
            )}

            

            {/* Balloons */}
            {gameState === 'game' && balloons.map(balloon => (
                <div
                    key={balloon.id}
                    className="absolute pointer-events-none z-30 animate-bounce"
                    style={{
                        left: `${balloon.x-75}px`,
                        top: `${balloon.y-75}px`,
                        width: `${balloon.size}px`,
                        height: `${balloon.size}px`,
                        backgroundColor: balloon.color,
                        borderRadius: '50%',
                        boxShadow: '0 4px 8px rgba(0,0,0,0.3), inset -10px -10px 20px rgba(0,0,0,0.2), inset 10px 10px 20px rgba(255,255,255,0.3)',
                        background: `radial-gradient(circle at 30% 30%, ${balloon.color}dd, ${balloon.color}88, ${balloon.color}44)`,
                        transform: 'translate(-50%, -50%)', // FIXED: Center the balloon properly
                    }}
                >
                    {/* Balloon highlight */}
                    <div
                        className="absolute rounded-full bg-white opacity-40"
                        style={{
                            width: `${balloon.size * 0.3}px`,
                            height: `${balloon.size * 0.3}px`,
                            top: `${balloon.size * 0.1}px`,
                            left: `${balloon.size * 0.2}px`,
                        }}
                    />
                </div>
            )            )}

            {/* Comprehensive Statistics Report */}
            {gameState === 'results' && gameStats && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gradient-to-br from-gray-900 to-black text-white p-8 rounded-xl text-center z-50 max-w-4xl max-h-[90vh] overflow-y-auto border-4 border-blue-400">
                    <h2 className="text-4xl font-bold mb-6 text-blue-400">📊 Game Statistics Report 📊</h2>
                    
                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <div className="bg-blue-800 bg-opacity-50 p-4 rounded-lg">
                            <div className="text-2xl font-bold text-blue-400 mb-2">
                                {gameStats.totalScore}
                            </div>
                            <div className="text-sm">Total Score</div>
                        </div>
                        
                        <div className="bg-green-800 bg-opacity-50 p-4 rounded-lg">
                            <div className="text-2xl font-bold text-green-400 mb-2">
                                {gameStats.totalBalloons}
                            </div>
                            <div className="text-sm">Balloons Popped</div>
                        </div>

                        <div className="bg-purple-800 bg-opacity-50 p-4 rounded-lg">
                            <div className="text-2xl font-bold text-purple-400 mb-2">
                                {gameStats.balloonsPerSecond.toFixed(2)}
                            </div>
                            <div className="text-sm">Per Second</div>
                        </div>

                        <div className="bg-yellow-800 bg-opacity-50 p-4 rounded-lg">
                            <div className="text-2xl font-bold text-yellow-400 mb-2">
                                {gameStats.accuracy.toFixed(1)}%
                            </div>
                            <div className="text-sm">Accuracy</div>
                        </div>
                    </div>

                    {/* Time Statistics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <div className="bg-red-800 bg-opacity-50 p-4 rounded-lg">
                            <div className="text-xl font-bold text-red-400 mb-2">
                                {(gameStats.averageTimeToPop / 1000).toFixed(2)}s
                            </div>
                            <div className="text-sm">Avg Time to Pop</div>
                        </div>
                        
                        <div className="bg-orange-800 bg-opacity-50 p-4 rounded-lg">
                            <div className="text-xl font-bold text-orange-400 mb-2">
                                {(gameStats.minTimeToPop / 1000).toFixed(2)}s
                            </div>
                            <div className="text-sm">Fastest Pop</div>
                        </div>

                        <div className="bg-pink-800 bg-opacity-50 p-4 rounded-lg">
                            <div className="text-xl font-bold text-pink-400 mb-2">
                                {(gameStats.maxTimeToPop / 1000).toFixed(2)}s
                            </div>
                            <div className="text-sm">Slowest Pop</div>
                        </div>

                        <div className="bg-indigo-800 bg-opacity-50 p-4 rounded-lg">
                            <div className="text-xl font-bold text-indigo-400 mb-2">
                                {(gameStats.varianceTimeToPop / 1000000).toFixed(2)}s²
                            </div>
                            <div className="text-sm">Time Variance</div>
                        </div>
                    </div>

                    {/* Detailed Balloon Data */}
                    <div className="mb-8">
                        <h3 className="text-2xl font-bold mb-4 text-green-400">🎈 Individual Balloon Performance</h3>
                        <div className="max-h-64 overflow-y-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-800 sticky top-0">
                                    <tr>
                                        <th className="p-2 text-left">ID</th>
                                        <th className="p-2 text-left">Color</th>
                                        <th className="p-2 text-left">Position</th>
                                        <th className="p-2 text-left">Time to Pop</th>
                                        <th className="p-2 text-left">Distance</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {gameStats.balloonDetails.map((balloon, index) => (
                                        <tr key={balloon.id} className="border-b border-gray-700 hover:bg-gray-800">
                                            <td className="p-2">{index + 1}</td>
                                            <td className="p-2">
                                                <div 
                                                    className="w-4 h-4 rounded-full inline-block mr-2"
                                                    style={{ backgroundColor: balloon.color }}
                                                />
                                                {balloon.color}
                                            </td>
                                            <td className="p-2">({balloon.x.toFixed(0)}, {balloon.y.toFixed(0)})</td>
                                            <td className="p-2">{(balloon.timeToPop / 1000).toFixed(2)}s</td>
                                            <td className="p-2">{balloon.distance.toFixed(1)}px</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Performance Analysis */}
                    <div className="mb-8">
                        <h3 className="text-2xl font-bold mb-4 text-yellow-400">📈 Performance Analysis</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-gray-800 bg-opacity-50 p-4 rounded-lg">
                                <h4 className="text-lg font-bold mb-2 text-blue-400">Speed Analysis</h4>
                                <div className="text-sm space-y-1">
                                    <div>Fastest: {(gameStats.minTimeToPop / 1000).toFixed(2)}s</div>
                                    <div>Slowest: {(gameStats.maxTimeToPop / 1000).toFixed(2)}s</div>
                                    <div>Average: {(gameStats.averageTimeToPop / 1000).toFixed(2)}s</div>
                                    <div>Consistency: {(gameStats.varianceTimeToPop / 1000000).toFixed(2)}s²</div>
                                </div>
                            </div>
                            
                            <div className="bg-gray-800 bg-opacity-50 p-4 rounded-lg">
                                <h4 className="text-lg font-bold mb-2 text-green-400">Efficiency Metrics</h4>
                                <div className="text-sm space-y-1">
                                    <div>Balloons per second: {gameStats.balloonsPerSecond.toFixed(2)}</div>
                                    <div>Total game time: {(gameStats.totalGameTime / 1000).toFixed(1)}s</div>
                                    <div>Points per second: {(gameStats.totalScore / (gameStats.totalGameTime / 1000)).toFixed(1)}</div>
                                    <div>Accuracy: {gameStats.accuracy.toFixed(1)}%</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Export Data for Backend */}
                    <div className="mb-6 p-4 bg-blue-900 bg-opacity-30 rounded-lg border border-blue-400">
                        <h4 className="text-lg font-bold mb-2 text-blue-400">💾 Data Ready for Backend</h4>
                        <div className="text-xs text-gray-300 mb-2">
                            All statistics are stored and ready to be sent to your backend server
                        </div>
                        <button
                            onClick={() => {
                                const exportData = exportStatsForBackend();
                                console.log('Game Statistics for Backend:', exportData);
                                alert('Statistics exported and logged to console. Ready for backend transmission!');
                            }}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm mr-2"
                        >
                            📊 Export for Backend
                        </button>
                        <button
                            onClick={sendStatsToBackend}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm"
                        >
                            🚀 Send to Backend
                        </button>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4 justify-center">
                        <button
                            onClick={startGame}
                            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold"
                        >
                            🎈 Play Again
                        </button>
                        <button
                            onClick={() => setGameState('menu')}
                            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold"
                        >
                            📋 Back to Menu
                        </button>
                    </div>
                </div>
            )}

            {/* Comprehensive Statistics Report */}
            {gameState === 'results' && gameStats && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gradient-to-br from-gray-900 to-black text-white p-8 rounded-xl text-center z-50 max-w-4xl max-h-[90vh] overflow-y-auto border-4 border-blue-400">
                    <h2 className="text-4xl font-bold mb-6 text-blue-400">📊 Game Statistics Report 📊</h2>
                    
                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <div className="bg-blue-800 bg-opacity-50 p-4 rounded-lg">
                            <div className="text-2xl font-bold text-blue-400 mb-2">
                                {gameStats.totalScore}
                            </div>
                            <div className="text-sm">Total Score</div>
                        </div>
                        
                        <div className="bg-green-800 bg-opacity-50 p-4 rounded-lg">
                            <div className="text-2xl font-bold text-green-400 mb-2">
                                {gameStats.totalBalloons}
                            </div>
                            <div className="text-sm">Balloons Popped</div>
                        </div>

                        <div className="bg-purple-800 bg-opacity-50 p-4 rounded-lg">
                            <div className="text-2xl font-bold text-purple-400 mb-2">
                                {gameStats.balloonsPerSecond.toFixed(2)}
                            </div>
                            <div className="text-sm">Per Second</div>
                        </div>

                        <div className="bg-yellow-800 bg-opacity-50 p-4 rounded-lg">
                            <div className="text-2xl font-bold text-yellow-400 mb-2">
                                {gameStats.accuracy.toFixed(1)}%
                            </div>
                            <div className="text-sm">Accuracy</div>
                        </div>
                    </div>

                    {/* Time Statistics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <div className="bg-red-800 bg-opacity-50 p-4 rounded-lg">
                            <div className="text-xl font-bold text-red-400 mb-2">
                                {(gameStats.averageTimeToPop / 1000).toFixed(2)}s
                            </div>
                            <div className="text-sm">Avg Time to Pop</div>
                        </div>
                        
                        <div className="bg-orange-800 bg-opacity-50 p-4 rounded-lg">
                            <div className="text-xl font-bold text-orange-400 mb-2">
                                {(gameStats.minTimeToPop / 1000).toFixed(2)}s
                            </div>
                            <div className="text-sm">Fastest Pop</div>
                        </div>

                        <div className="bg-pink-800 bg-opacity-50 p-4 rounded-lg">
                            <div className="text-xl font-bold text-pink-400 mb-2">
                                {(gameStats.maxTimeToPop / 1000).toFixed(2)}s
                            </div>
                            <div className="text-sm">Slowest Pop</div>
                        </div>

                        <div className="bg-indigo-800 bg-opacity-50 p-4 rounded-lg">
                            <div className="text-xl font-bold text-indigo-400 mb-2">
                                {(gameStats.varianceTimeToPop / 1000000).toFixed(2)}s²
                            </div>
                            <div className="text-sm">Time Variance</div>
                        </div>
                    </div>

                    {/* Detailed Balloon Data */}
                    <div className="mb-8">
                        <h3 className="text-2xl font-bold mb-4 text-green-400">🎈 Individual Balloon Performance</h3>
                        <div className="max-h-64 overflow-y-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-800 sticky top-0">
                                    <tr>
                                        <th className="p-2 text-left">ID</th>
                                        <th className="p-2 text-left">Color</th>
                                        <th className="p-2 text-left">Position</th>
                                        <th className="p-2 text-left">Time to Pop</th>
                                        <th className="p-2 text-left">Distance</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {gameStats.balloonDetails.map((balloon, index) => (
                                        <tr key={balloon.id} className="border-b border-gray-700 hover:bg-gray-800">
                                            <td className="p-2">{index + 1}</td>
                                            <td className="p-2">
                                                <div 
                                                    className="w-4 h-4 rounded-full inline-block mr-2"
                                                    style={{ backgroundColor: balloon.color }}
                                                />
                                                {balloon.color}
                                            </td>
                                            <td className="p-2">({balloon.x.toFixed(0)}, {balloon.y.toFixed(0)})</td>
                                            <td className="p-2">{(balloon.timeToPop / 1000).toFixed(2)}s</td>
                                            <td className="p-2">{balloon.distance.toFixed(1)}px</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Performance Analysis */}
                    <div className="mb-8">
                        <h3 className="text-2xl font-bold mb-4 text-yellow-400">📈 Performance Analysis</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-gray-800 bg-opacity-50 p-4 rounded-lg">
                                <h4 className="text-lg font-bold mb-2 text-blue-400">Speed Analysis</h4>
                                <div className="text-sm space-y-1">
                                    <div>Fastest: {(gameStats.minTimeToPop / 1000).toFixed(2)}s</div>
                                    <div>Slowest: {(gameStats.maxTimeToPop / 1000).toFixed(2)}s</div>
                                    <div>Average: {(gameStats.averageTimeToPop / 1000).toFixed(2)}s</div>
                                    <div>Consistency: {(gameStats.varianceTimeToPop / 1000000).toFixed(2)}s²</div>
                                </div>
                            </div>
                            
                            <div className="bg-gray-800 bg-opacity-50 p-4 rounded-lg">
                                <h4 className="text-lg font-bold mb-2 text-green-400">Efficiency Metrics</h4>
                                <div className="text-sm space-y-1">
                                    <div>Balloons per second: {gameStats.balloonsPerSecond.toFixed(2)}</div>
                                    <div>Total game time: {(gameStats.totalGameTime / 1000).toFixed(1)}s</div>
                                    <div>Points per second: {(gameStats.totalScore / (gameStats.totalGameTime / 1000)).toFixed(1)}</div>
                                    <div>Accuracy: {gameStats.accuracy.toFixed(1)}%</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Export Data for Backend */}
                    <div className="mb-6 p-4 bg-blue-900 bg-opacity-30 rounded-lg border border-blue-400">
                        <h4 className="text-lg font-bold mb-2 text-blue-400">💾 Data Ready for Backend</h4>
                        <div className="text-xs text-gray-300 mb-2">
                            All statistics are stored and ready to be sent to your backend server
                        </div>
                        <button
                            onClick={() => {
                                console.log('Game Statistics for Backend:', gameStats);
                                alert('Statistics logged to console. Ready for backend transmission!');
                            }}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
                        >
                            📊 View Raw Data
                        </button>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4 justify-center">
                        <button
                            onClick={startGame}
                            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold"
                        >
                            🎈 Play Again
                        </button>
                        <button
                            onClick={() => setGameState('menu')}
                            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold"
                        >
                            📋 Back to Menu
                        </button>
                    </div>
                </div>
            )}

            {/* Game Instructions */}
            {gameState === 'menu' && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-center">
                    <h1 className="text-5xl font-bold mb-6">🎈 Balloon Pop Game 🎈</h1>
                    <div className="text-xl mb-8 max-w-2xl">
                        <p className="mb-4">Look at balloons to pop them!</p>
                        <p className="mb-4">Each balloon gives you <strong className="text-green-400">10 points</strong></p>
                        <p>You have <strong className="text-red-400">30 seconds</strong></p>
                    </div>
                    <div className="space-y-4 text-lg">
                        <div className="bg-blue-800 bg-opacity-50 p-4 rounded-lg">
                            <p className="text-blue-300">🎯 <strong>Calibrate First</strong> (Recommended)</p>
                        </div>
                        <div className="bg-green-800 bg-opacity-50 p-4 rounded-lg">
                            <p className="text-green-300">🎈 <strong>Start Game</strong></p>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
