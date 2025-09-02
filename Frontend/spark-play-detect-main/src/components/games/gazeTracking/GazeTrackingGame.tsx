"use client"

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Play, Settings } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

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

interface Balloon {
    id: number;
    x: number;
    y: number;
    size: number;
    color: string;
    speedX: number;
    speedY: number;
    createdAt: number;
    isPopping?: boolean;
    popStartTime?: number;
}

interface GameResult {
    score: number;
    balloonsPopped: number;
    accuracy: number;
    gameTime: number;
}

interface RoundResult {
    roundNumber: number;
    score: number;
    balloonsPopped: number;
    accuracy: number;
    gameTime: number;
    balloonStats: BalloonStats[];
}

interface GameSession {
    totalScore: number;
    totalBalloons: number;
    averageAccuracy: number;
    totalGameTime: number;
    rounds: RoundResult[];
    averageScorePerRound: number;
    bestRound: number;
    worstRound: number;
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

interface CalibrationPoint {
    id: number;
    x: number;
    y: number;
    label: string;
}

class KalmanFilter {
    private A: number;
    private H: number;
    private Q: number;
    private R: number;
    private P: number;
    private x: number;
    private v: number; // Velocity
    private initialized: boolean;
    
    constructor(processNoise = 1e-4, measurementNoise = 1e-2, errorCovariance = 1) {
        this.A = 1;
        this.H = 1;
        this.Q = processNoise;
        this.R = measurementNoise;
        this.P = errorCovariance;
        this.x = 0;
        this.v = 0; // Initialize velocity
        this.initialized = false;
    }
    
    reset(initialValue?: number) {
        this.x = initialValue || 0;
        this.v = 0; // Reset velocity
        this.P = 1;
        this.initialized = !!initialValue;
    }
    
    isInitialized() {
        return this.initialized;
    }
    
    filter(measurement: number): number {
        if (!this.initialized) {
            this.reset(measurement);
            return measurement;
        }
        
        // Predict position and velocity
        const x_pred = this.x + this.v;
        const v_pred = this.v;
        
        // Update error covariance
        const P_pred = this.P + this.Q;
        
        // Calculate Kalman gain
        const K = P_pred / (P_pred + this.R);
        
        // Update position and velocity
        this.x = x_pred + K * (measurement - x_pred);
        this.v = v_pred + K * (measurement - x_pred) * 0.1; // Update velocity with smaller gain
        
        // Update error covariance
        this.P = (1 - K) * P_pred;
        
        return this.x;
    }
    
    // Get current velocity for prediction
    getVelocity(): number {
        return this.v;
    }
}

// Smooth interpolation function for weapon movement
const smoothInterpolate = (current: number, target: number, velocity: number, deltaTime: number): { position: number, velocity: number } => {
    const springStrength = 0.25; // Increased for faster response
    const damping = 0.85; // Slightly reduced for less lag
    
    const displacement = target - current;
    const springForce = displacement * springStrength;
    
    velocity = velocity * damping + springForce * deltaTime;
    const position = current + velocity * deltaTime;
    
    return { position, velocity };
};

// Predict future gaze position based on velocity
const predictGazePosition = (currentX: number, currentY: number, velocityX: number, velocityY: number, predictionTime: number = 0.05): { x: number, y: number } => {
    const predictedX = currentX + velocityX * predictionTime * 1000; // Convert to milliseconds
    const predictedY = currentY + velocityY * predictionTime * 1000;
    
    return { x: predictedX, y: predictedY };
};

const balloonColors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
];

const calibrationPoints: CalibrationPoint[] = [
    { id: 1, x: 10, y: 10, label: 'Top Left' },
    { id: 2, x: 90, y: 10, label: 'Top Right' },
    { id: 3, x: 10, y: 90, label: 'Bottom Left' },
    { id: 4, x: 90, y: 90, label: 'Bottom Right' }
];

const GazeTrackingGame: React.FC = () => {
    const navigate = useNavigate();
    const [gameState, setGameState] = useState<'menu' | 'calibration' | 'game' | 'results'>('menu');
    const [isTracking, setIsTracking] = useState(false);
    const [gazeData, setGazeData] = useState<GazeData | null>(null);
    const [smoothGazePos, setSmoothGazePos] = useState({ x: 0, y: 0 });
    const [interpolatedGazePos, setInterpolatedGazePos] = useState({ x: 0, y: 0 });
    const [gazeVelocity, setGazeVelocity] = useState({ x: 0, y: 0 });
    const [balloons, setBalloons] = useState<Balloon[]>([]);
    const [score, setScore] = useState(0);
    const [balloonsPopped, setBalloonsPopped] = useState(0);
    const [gameTimeLeft, setGameTimeLeft] = useState(15);
    const [gameResult, setGameResult] = useState<GameResult | null>(null);
    const [gameStats, setGameStats] = useState<GameStatistics | null>(null);
    const [balloonStats, setBalloonStats] = useState<BalloonStats[]>([]);
    const [poppedBalloonIds, setPoppedBalloonIds] = useState<Set<number>>(new Set());
    const [lastCollisionTime, setLastCollisionTime] = useState(0);
    const [calibrationStep, setCalibrationStep] = useState(0);
    const [calibrationResults, setCalibrationResults] = useState<CalibrationResult[]>([]);
    const [currentPointGaze, setCurrentPointGaze] = useState<{x: number, y: number} | null>(null);
    const [gazeStatus, setGazeStatus] = useState<string>('Initializing...');
    const [isGazeAvailable, setIsGazeAvailable] = useState(false);
    
    // Multi-round game state
    const [currentRound, setCurrentRound] = useState(1);
    const [totalRounds, setTotalRounds] = useState(3);
    const [roundResults, setRoundResults] = useState<RoundResult[]>([]);
    const [gameSession, setGameSession] = useState<GameSession | null>(null);
    const [showRoundResults, setShowRoundResults] = useState(false);
    const [isRoundTransition, setIsRoundTransition] = useState(false);
    const [countdownTime, setCountdownTime] = useState(3);

    // Refs
    const gameTimerRef = useRef<NodeJS.Timeout | null>(null);
    const balloonSpawnerRef = useRef<NodeJS.Timeout | null>(null);
    const balloonAnimationRef = useRef<NodeJS.Timeout | null>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const kalmanXRef = useRef<KalmanFilter | null>(null);
    const kalmanYRef = useRef<KalmanFilter | null>(null);
    const popSoundRef = useRef<HTMLAudioElement | null>(null);
    const gameContainerRef = useRef<HTMLDivElement | null>(null);
    const animationFrameRef = useRef<number | null>(null);
    const lastGazeUpdateRef = useRef<number>(0);
    const [showPopEffect, setShowPopEffect] = useState(false);
    
    // Refs to track current state values for timer
    const scoreRef = useRef(0);
    const balloonsPoppedRef = useRef(0);
    const balloonStatsRef = useRef<BalloonStats[]>([]);

    // Initialize Kalman filters and pop sound
    useEffect(() => {
        if (!kalmanXRef.current) {
            kalmanXRef.current = new KalmanFilter(1e-4, 1e-2, 1);
        }
        if (!kalmanYRef.current) {
            kalmanYRef.current = new KalmanFilter(1e-4, 1e-2, 1);
        }
        
        // Audio removed to prevent system audio issues
    }, []);

    // Smooth interpolation animation loop for weapon movement
    useEffect(() => {
        let lastTime = performance.now();
        
        const animate = (currentTime: number) => {
            const deltaTime = (currentTime - lastTime) / 1000; // Convert to seconds
            lastTime = currentTime;
            
            if (gazeData && gameState === 'game') {
                setInterpolatedGazePos(prev => {
                    const currentX = gazeData.smoothX || gazeData.x;
                    const currentY = gazeData.smoothY || gazeData.y;
                    
                    // Predict where the gaze will be in the next frame
                    const predicted = predictGazePosition(currentX, currentY, gazeVelocity.x, gazeVelocity.y, deltaTime);
                    
                    const resultX = smoothInterpolate(prev.x, predicted.x, gazeVelocity.x, deltaTime);
                    const resultY = smoothInterpolate(prev.y, predicted.y, gazeVelocity.y, deltaTime);
                    
                    return { x: resultX.position, y: resultY.position };
                });
            }
            
            animationFrameRef.current = requestAnimationFrame(animate);
        };
        
        animationFrameRef.current = requestAnimationFrame(animate);
        
        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [gazeData, gameState, gazeVelocity]);

    const playPopSound = useCallback(() => {
        // Visual feedback instead of audio to prevent system audio issues
        setShowPopEffect(true);
        setTimeout(() => setShowPopEffect(false), 200);
    }, []);

    const startTracking = useCallback(async () => {
        console.log('startTracking called - current isTracking state:', isTracking);
        setIsTracking(true);
        setGazeStatus('Starting camera...');
        
        // Start the camera first
        try {
            console.log('Sending camera start request...');
            const cameraResponse = await fetch('http://localhost:8000/start-camera', {
                method: 'POST'
            });
            const cameraData = await cameraResponse.json();
            console.log('Camera start response:', cameraData);
            
            if (cameraData.status !== 'success') {
                console.warn('Camera start returned non-success status:', cameraData);
            }
        } catch (error) {
            console.error('Failed to start camera:', error);
            setGazeStatus('Failed to start camera - continuing without gaze tracking');
            // Don't return - continue with the game even if camera fails
        }
        
        setGazeStatus('Connecting to gaze tracker...');
        
        // Wait a moment for camera to initialize
        await new Promise(resolve => setTimeout(resolve, 2000)); // Increased wait time
        
        // Check camera status
        try {
            const statusResponse = await fetch('http://localhost:8000/camera-status');
            const statusData = await statusResponse.json();
            console.log('Camera status check:', statusData);
        } catch (error) {
            console.warn('Could not check camera status:', error);
        }
        
        if (kalmanXRef.current) kalmanXRef.current.reset();
        if (kalmanYRef.current) kalmanYRef.current.reset();
        
        // Start the gaze tracking interval with error handling
        intervalRef.current = setInterval(async () => {
            try {
                const response = await fetch('http://localhost:8000/current-gaze');
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                const data = await response.json();
                
                if (data.status === 'success' && data.data) {
                    let rawX = data.data.x;
                    let rawY = data.data.y;
                    
                    // Use actual screen dimensions from backend or fallback to 1920x1080
                    const screenWidth = data.data.screen_width || 1920;
                    const screenHeight = data.data.screen_height || 1080;
                    
                    const browserX = (rawX / screenWidth) * window.innerWidth;
                    const browserY = (rawY / screenHeight) * window.innerHeight;
                    
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
                    
                    // Update velocity for smooth interpolation
                    const now = Date.now();
                    const deltaTime = now - lastGazeUpdateRef.current;
                    if (deltaTime > 0) {
                        const velocityX = (smoothX - (gazeData?.smoothX || smoothX)) / deltaTime;
                        const velocityY = (smoothY - (gazeData?.smoothY || smoothY)) / deltaTime;
                        setGazeVelocity({ x: velocityX, y: velocityY });
                    }
                    lastGazeUpdateRef.current = now;
                    
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
                    
                    setIsGazeAvailable(true);
                    setGazeStatus(`Tracking: ${data.data.confidence}`);
                } else if (data.error) {
                    console.warn('Gaze tracking error:', data.error);
                    setGazeStatus(`Error: ${data.error}`);
                    setIsGazeAvailable(false);
                }
            } catch (error) {
                console.error('Failed to get gaze data:', error);
                setGazeStatus('Connection failed - continuing without gaze tracking');
                setIsGazeAvailable(false);
                // Don't clear the interval - keep trying
            }
        }, 33); // 30 FPS for smooth weapon movement
    }, [isTracking]);

    const stopTracking = useCallback(async () => {
        setIsTracking(false);
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        
        // Stop the smooth animation
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }
        
        setGazeData(null);
        
        // Stop the camera
        try {
            const cameraResponse = await fetch('http://localhost:8000/stop-camera', {
                method: 'POST'
            });
            const cameraData = await cameraResponse.json();
            console.log('Camera stop response:', cameraData);
        } catch (error) {
            console.error('Failed to stop camera:', error);
        }
    }, []);

    const createBalloon = useCallback(() => {
        setBalloons(prev => {
            // Don't create if there's already a non-popping balloon
            if (prev.some(balloon => !balloon.isPopping)) {
                return prev;
            }
            
                         // Use full window dimensions for better gaze evaluation
             const containerWidth = window.innerWidth;
             const containerHeight = window.innerHeight;
            
                         // Use the full game area for balloon spawning
             const balloonRadius = 50; // Smaller balloon size (was 75)
             const margin = 25; // Very small margin to keep balloons fully visible
             
             const minX = margin + balloonRadius;
             const maxX = containerWidth - margin - balloonRadius;
             const minY = margin + balloonRadius;
             const maxY = containerHeight - margin - balloonRadius;
             
             // Find the last popped balloon position to avoid spawning too close
             const lastPoppedBalloon = prev.find(balloon => balloon.isPopping);
             const minDistance = 300; // Much larger minimum distance between balloons (was 200)
            
            let attempts = 0;
            let newX, newY;
            
            do {
                newX = Math.random() * (maxX - minX) + minX;
                newY = Math.random() * (maxY - minY) + minY;
                attempts++;
                
                // If we have a last popped balloon, check distance
                if (lastPoppedBalloon) {
                    const distance = Math.sqrt(
                        Math.pow(newX - lastPoppedBalloon.x, 2) + Math.pow(newY - lastPoppedBalloon.y, 2)
                    );
                    if (distance >= minDistance) {
                        break; // Good position found
                    }
                } else {
                    break; // No previous balloon, any position is fine
                }
            } while (attempts < 50); // Limit attempts to prevent infinite loop
            
                         const newBalloon: Balloon = {
                 id: Date.now() + Math.random(),
                 x: newX,
                 y: newY,
                 size: 100, // Smaller balloon size (was 150)
                 color: balloonColors[Math.floor(Math.random() * balloonColors.length)],
                 speedX: 0,
                 speedY: 0,
                 createdAt: Date.now()
             };

                         // Track balloon spawn for statistics
             setBalloonStats(prev => {
                 const newStats = [...prev, {
                     id: newBalloon.id,
                     spawnTime: Date.now(),
                     popTime: 0,
                     timeToPop: 0,
                     distance: 0,
                     x: newBalloon.x,
                     y: newBalloon.y,
                     color: newBalloon.color
                 }];
                 balloonStatsRef.current = newStats;
                 return newStats;
             });

            return [...prev, newBalloon];
        });
    }, [balloonColors]);

    const updateBalloons = useCallback(() => {
        setBalloons(prev => {
            const currentTime = Date.now();
            return prev.filter(balloon => {
                // Remove balloons that are too old (15 seconds)
                if (currentTime - balloon.createdAt > 15000) {
                    return false;
                }
                
                                                 // Remove balloons that have finished popping animation (1 second for faster gameplay)
                if (balloon.isPopping && balloon.popStartTime && currentTime - balloon.popStartTime > 1000) {
                    return false;
                }
                
                return true;
            });
        });
    }, []);

    const checkBalloonCollision = useCallback((gazeX: number, gazeY: number) => {
        if (!gazeX || !gazeY || isNaN(gazeX) || isNaN(gazeY)) {
            return; // Skip if invalid coordinates
        }

        const currentTime = Date.now(); 
        
        // Prevent multiple collisions within 50ms (very fast response)  
        if (currentTime - lastCollisionTime < 50) {
            return;
        }

        // Simplified collision detection - much more generous
        const collisionRadius = 150; // Very large collision area
        
        setBalloons(prev => {
            if (prev.length === 0) return prev;
            
            let poppedCount = 0;
            const newlyPoppedIds = new Set<number>();
            
            const remaining = prev.map(balloon => {
                if (poppedBalloonIds.has(balloon.id) || balloon.isPopping) {
                    return balloon;
                }
                
                // Simple distance calculation
                const distance = Math.sqrt(
                    Math.pow(gazeX - balloon.x, 2) + Math.pow(gazeY - balloon.y, 2)
                );
                
                // Debug collision detection
                if (process.env.NODE_ENV === 'development') {
                    console.log(`Balloon ${balloon.id}: distance=${distance.toFixed(1)}, collisionRadius=${collisionRadius}, gaze=(${gazeX.toFixed(1)},${gazeY.toFixed(1)}), balloon=(${balloon.x.toFixed(1)},${balloon.y.toFixed(1)})`);
                    if (distance <= collisionRadius) {
                        console.log(`🎈 COLLISION DETECTED! Balloon ${balloon.id} should pop!`);
                    }
                }
                
                // Much simpler collision check
                if (distance <= collisionRadius) {
                    poppedCount++;
                    newlyPoppedIds.add(balloon.id);
                    
                    // Play pop sound
                    playPopSound();
                    
                    // Start popping animation immediately
                    const poppingBalloon = {
                        ...balloon,
                        isPopping: true,
                        popStartTime: currentTime
                    };
                    
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
                    
                    return poppingBalloon;
                }
                return balloon;
            });
            
            if (poppedCount > 0) {
                setLastCollisionTime(currentTime);
                
                setPoppedBalloonIds(prev => {
                    const updated = new Set(prev);
                    newlyPoppedIds.forEach(id => updated.add(id));
                    return updated;
                });
                
                                 setScore(prev => {
                     const newScore = prev + poppedCount;
                     scoreRef.current = newScore;
                     return newScore;
                 });
                 setBalloonsPopped(prev => {
                     const newBalloonsPopped = prev + poppedCount;
                     balloonsPoppedRef.current = newBalloonsPopped;
                     return newBalloonsPopped;
                 });
                
                // Create new balloon immediately (no delay)
                createBalloon();
            }
            
            return remaining;
        });
    }, [createBalloon, lastCollisionTime, poppedBalloonIds, playPopSound]);

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



    const startRound = useCallback(async (roundNumber: number) => {
        console.log(`=== STARTING ROUND ${roundNumber} ===`);
        
        // Clear any existing timers first
        if (gameTimerRef.current) {
            clearTimeout(gameTimerRef.current);
            gameTimerRef.current = null;
        }
        if (balloonSpawnerRef.current) {
            clearInterval(balloonSpawnerRef.current);
            balloonSpawnerRef.current = null;
        }
        if (balloonAnimationRef.current) {
            clearInterval(balloonAnimationRef.current);
            balloonAnimationRef.current = null;
        }
        
        console.log('Setting game state to "game"');
        setGameState('game');
        setCurrentRound(roundNumber);
        setScore(0);
        setBalloons([]);
        setBalloonsPopped(0);
        setBalloonStats([]); // Reset balloon statistics
        setGameTimeLeft(15);
        setGameResult(null);
        setPoppedBalloonIds(new Set()); // Reset popped balloon tracking
        setLastCollisionTime(0); // Reset collision debounce
        setGameStartTime(null); // Reset game start time
        setIsRoundTransition(false); // Ensure round transition is off
        
        // Reset refs
        scoreRef.current = 0;
        balloonsPoppedRef.current = 0;
        balloonStatsRef.current = [];
        
        // Always ensure tracking is started, even if already tracking
        if (!isTracking) {
            await startTracking();
        }
        
        // Force game state to 'game' even if tracking fails
        console.log('Forcing game state to "game" for fullscreen mode');
        setGameState('game');

        // Create first balloon immediately
        setTimeout(() => createBalloon(), 500);
        
        // Also create a test balloon in the center to ensure game elements are visible
        setTimeout(() => {
            setBalloons(prev => [...prev, {
                id: Date.now() + Math.random(),
                x: window.innerWidth / 2,
                y: window.innerHeight / 2,
                size: 100,
                color: '#FF6B6B',
                speedX: 0,
                speedY: 0,
                createdAt: Date.now()
            }]);
        }, 1000);

        // Set the game start time for progress bar
        setGameStartTime(Date.now());

        // Game timer - Simple setInterval approach
        console.log(`Starting round ${roundNumber} timer with setInterval...`);
        
        let timeLeft = 15;
        setGameTimeLeft(timeLeft);
        
        gameTimerRef.current = setInterval(() => {
            timeLeft--;
            console.log(`Round ${roundNumber} timer tick - timeLeft:`, timeLeft);
            setGameTimeLeft(timeLeft);
            
            if (timeLeft <= 0) {
                console.log(`Round ${roundNumber} over - ending timer`);
                // Round over
                if (gameTimerRef.current) {
                    clearInterval(gameTimerRef.current);
                    gameTimerRef.current = null;
                }
                if (balloonSpawnerRef.current) {
                    clearInterval(balloonSpawnerRef.current);
                    balloonSpawnerRef.current = null;
                }
                if (balloonAnimationRef.current) {
                    clearInterval(balloonAnimationRef.current);
                    balloonAnimationRef.current = null;
                }
                
                // Get final values from refs (current values)
                const finalScore = scoreRef.current;
                const finalBalloons = balloonsPoppedRef.current;
                const accuracy = finalBalloons > 0 ? (finalBalloons / balloonStatsRef.current.length) * 100 : 0;
                
                console.log(`Round ${roundNumber} final results:`, { finalScore, finalBalloons, accuracy });
                
                // Save round result
                const roundResult: RoundResult = {
                    roundNumber,
                    score: finalScore,
                    balloonsPopped: finalBalloons,
                    accuracy,
                    gameTime: 15,
                    balloonStats: [...balloonStatsRef.current]
                };
                
                setRoundResults(prev => [...prev, roundResult]);
                
                                 // Check if this was the last round
                 if (roundNumber >= totalRounds) {
                     // Game session complete
                     const session = calculateGameSession([...roundResults, roundResult]);
                     setGameSession(session);
                     setGameState('results');
                     stopTracking();
                 } else {
                     // Start round transition with countdown
                     setIsRoundTransition(true);
                     setCountdownTime(3);
                     
                     // Start countdown timer
                     let countdown = 3;
                     const countdownInterval = setInterval(() => {
                         countdown--;
                         setCountdownTime(countdown);
                         
                         if (countdown <= 0) {
                             clearInterval(countdownInterval);
                             setIsRoundTransition(false);
                             // Automatically start next round
                             startRound(roundNumber + 1);
                         }
                     }, 1000);
                 }
            }
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
    }, [isTracking, startTracking, createBalloon, updateBalloons, stopTracking, totalRounds]);

    const continueToNextRound = useCallback(async () => {
        const nextRound = currentRound + 1;
        setShowRoundResults(false);
        setGameResult(null);
        setIsRoundTransition(true);
        setCountdownTime(3);
        
        // Start countdown timer
        let countdown = 3;
        const countdownInterval = setInterval(() => {
            countdown--;
            setCountdownTime(countdown);
            
            if (countdown <= 0) {
                clearInterval(countdownInterval);
                setIsRoundTransition(false);
                // Automatically start next round
                startRound(nextRound);
            }
        }, 1000);
    }, [currentRound, startRound]);

    const startGame = useCallback(async () => {
        console.log('=== STARTING GAME SESSION ===');
        
        // Reset multi-round state
        setCurrentRound(1);
        setRoundResults([]);
        setGameSession(null);
        setShowRoundResults(false);
        
        // Start first round
        await startRound(1);
    }, [startRound]);

    const calculateGameSession = useCallback((rounds: RoundResult[]): GameSession => {
        const totalScore = rounds.reduce((sum, round) => sum + round.score, 0);
        const totalBalloons = rounds.reduce((sum, round) => sum + round.balloonsPopped, 0);
        const totalGameTime = rounds.reduce((sum, round) => sum + round.gameTime, 0);
        const averageAccuracy = rounds.reduce((sum, round) => sum + round.accuracy, 0) / rounds.length;
        const averageScorePerRound = totalScore / rounds.length;
        
        // Find best and worst rounds
        const bestRound = rounds.reduce((best, round, index) => 
            round.score > rounds[best].score ? index + 1 : best, 1);
        const worstRound = rounds.reduce((worst, round, index) => 
            round.score < rounds[worst].score ? index + 1 : worst, 1);
        
        return {
            totalScore,
            totalBalloons,
            averageAccuracy,
            totalGameTime,
            rounds,
            averageScorePerRound,
            bestRound,
            worstRound
        };
    }, []);

    const calculateGameStats = useCallback((stats: BalloonStats[], gameTime: number) => {
        const poppedBalloons = stats.filter(b => b.popTime > 0);
        const totalBalloons = stats.length;
        
        if (poppedBalloons.length === 0) {
            return {
                totalScore: 0,
                totalBalloons: 0,
                averageTimeToPop: 0,
                varianceTimeToPop: 0,
                maxTimeToPop: 0,
                minTimeToPop: 0,
                totalGameTime: gameTime * 1000,
                balloonsPerSecond: 0,
                accuracy: 0,
                balloonDetails: []
            };
        }

        const timesToPop = poppedBalloons.map(b => b.timeToPop);
        const averageTimeToPop = timesToPop.reduce((a, b) => a + b, 0) / timesToPop.length;
        const varianceTimeToPop = timesToPop.reduce((sum, time) => sum + Math.pow(time - averageTimeToPop, 2), 0) / timesToPop.length;
        const maxTimeToPop = Math.max(...timesToPop);
        const minTimeToPop = Math.min(...timesToPop);
        const balloonsPerSecond = totalBalloons / (gameTime);
        const accuracy = (poppedBalloons.length / totalBalloons) * 100;

        return {
            totalScore: poppedBalloons.length * 10,
            totalBalloons: poppedBalloons.length,
            averageTimeToPop,
            varianceTimeToPop,
            maxTimeToPop,
            minTimeToPop,
            totalGameTime: gameTime * 1000,
            balloonsPerSecond,
            accuracy,
            balloonDetails: stats
        };
    }, []);

    const startCalibration = useCallback(async () => {
        setGameState('calibration');
        setCalibrationStep(1);
        setCalibrationResults([]);
        setCurrentPointGaze(null);
        
        // Always start tracking for calibration, even if already tracking
        console.log('Starting calibration - initiating tracking...');
        await startTracking();
    }, [startTracking]);

    // Handle calibration point click
    const handleCalibrationClick = useCallback((event: React.MouseEvent, pointId: number) => {
        if (!gazeData || calibrationStep === 0 || calibrationStep > 4) return;
        
        const currentPoint = calibrationPoints[pointId - 1];
        
        // Where user clicked (browser coordinates)
        const clickX = event.clientX;
        const clickY = event.clientY;
        
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
        }
    }, [gazeData, calibrationStep, calibrationPoints]);

    // Calculate overall accuracy
    const getOverallAccuracy = useCallback(() => {
        if (calibrationResults.length === 0) return 0;
        const total = calibrationResults.reduce((sum, result) => sum + result.accuracy, 0);
        return total / calibrationResults.length;
    }, [calibrationResults]);

    const resetCalibration = useCallback(() => {
        setCalibrationStep(0);
        setCalibrationResults([]);
        setCurrentPointGaze(null);
    }, []);

         // Monitor timer state changes
     useEffect(() => {
         console.log('gameTimeLeft changed to:', gameTimeLeft);
         if (gameTimeLeft === 0) {
             console.log('Timer reached zero!');
         }
     }, [gameTimeLeft]);

     // Monitor game state changes
     useEffect(() => {
         console.log('Game state changed to:', gameState);
         
         // Force fullscreen mode when game state is 'game'
         if (gameState === 'game') {
             console.log('Game state is "game" - should enter fullscreen mode');
             // Force a re-render to ensure fullscreen classes are applied
             setTimeout(() => {
                 console.log('Forcing re-render for fullscreen mode');
                 setGameState(prev => prev); // This will trigger a re-render
             }, 100);
         }
     }, [gameState]);

    // Continuous progress bar animation
    const [progressValue, setProgressValue] = useState(0);
    const [gameStartTime, setGameStartTime] = useState<number | null>(null);
    
    useEffect(() => {
        if (gameState === 'game' && gameStartTime) {
            const totalTime = 15000; // 15 seconds in milliseconds
            
            const progressInterval = setInterval(() => {
                const elapsed = Date.now() - gameStartTime;
                const progress = Math.min((elapsed / totalTime) * 100, 100);
                setProgressValue(progress);
                
                if (progress >= 100) {
                    clearInterval(progressInterval);
                }
            }, 50); // Update every 50ms for smooth animation
            
            return () => clearInterval(progressInterval);
        } else {
            setProgressValue(0);
        }
    }, [gameState, gameStartTime]);

    // Test timer function
    const testTimer = useCallback(() => {
        console.log('Testing timer...');
        let testTime = 5;
        alert(`Test timer starting: ${testTime} seconds`);
        
        const testInterval = setInterval(() => {
            testTime--;
            console.log('Test timer:', testTime);
            if (testTime <= 0) {
                clearInterval(testInterval);
                console.log('Test timer finished');
                alert('Test timer finished!');
            } else {
                alert(`Test timer: ${testTime} seconds left`);
            }
        }, 1000);
    }, []);

         // Cleanup interval when game state changes
     useEffect(() => {
         // Clear interval if we're not in a state that needs gaze tracking
         if (gameState !== 'calibration' && gameState !== 'game') {
             if (intervalRef.current) {
                 clearInterval(intervalRef.current);
                 intervalRef.current = null;
             }
         } else {
             // If we're in a state that needs gaze tracking but no interval is running, start it
             if (!intervalRef.current && isTracking) {
                 console.log('Restarting gaze tracking interval for state:', gameState);
                 intervalRef.current = setInterval(async () => {
                     try {
                         const response = await fetch('http://localhost:8000/current-gaze');
                         if (!response.ok) {
                             throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                         }
                         const data = await response.json();
                         
                         if (data.status === 'success' && data.data) {
                             let rawX = data.data.x;
                             let rawY = data.data.y;
                             
                             // Use actual screen dimensions from backend or fallback to 1920x1080
                             const screenWidth = data.data.screen_width || 1920;
                             const screenHeight = data.data.screen_height || 1080;
                             
                             const browserX = (rawX / screenWidth) * window.innerWidth;
                             const browserY = (rawY / screenHeight) * window.innerHeight;
                             
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
                             
                             setIsGazeAvailable(true);
                             setGazeStatus(`Tracking: ${data.data.confidence}`);
                         } else if (data.error) {
                             console.warn('Gaze tracking error:', data.error);
                             setGazeStatus(`Error: ${data.error}`);
                             setIsGazeAvailable(false);
                         }
                     } catch (error) {
                         console.error('Failed to get gaze data:', error);
                         setGazeStatus('Connection failed - continuing without gaze tracking');
                         setIsGazeAvailable(false);
                         // Don't clear the interval - keep trying
                     }
                 }, 100); // Increased interval to reduce network load
             }
         }
     }, [gameState, isTracking]);

     // Cleanup on unmount
     useEffect(() => {
         return () => {
             if (intervalRef.current) clearInterval(intervalRef.current);
             if (gameTimerRef.current) clearTimeout(gameTimerRef.current);
             if (balloonSpawnerRef.current) clearInterval(balloonSpawnerRef.current);
             if (balloonAnimationRef.current) clearInterval(balloonAnimationRef.current);
             
             // Stop camera when component unmounts
             if (isTracking) {
                 fetch('http://localhost:8000/stop-camera', { method: 'POST' })
                     .catch(error => console.error('Failed to stop camera on unmount:', error));
             }
         };
     }, [isTracking]);

    return (
        <div 
            ref={gameContainerRef} 
            className={`relative overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100 ${
                gameState === 'game' || gameState === 'calibration' 
                    ? 'fixed inset-0 z-50' 
                    : 'h-full w-full'
            }`}
        >
                         {/* Debug Overlay - Only show in development */}
             {process.env.NODE_ENV === 'development' && (
                 <div className="absolute top-0 left-0 bg-black/80 text-white p-2 text-xs z-[100]">
                     <div>Game State: {gameState}</div>
                     <div>Is Tracking: {isTracking ? 'Yes' : 'No'}</div>
                     <div>Gaze Available: {isGazeAvailable ? 'Yes' : 'No'}</div>
                     <div>Balloons: {balloons.length}</div>
                     <div>Score: {score}</div>
                     <div>Time Left: {gameTimeLeft}s</div>
                     <div>Fullscreen: {gameState === 'game' || gameState === 'calibration' ? 'Yes' : 'No'}</div>
                     <div>Is Round Transition: {isRoundTransition ? 'Yes' : 'No'}</div>
                     <div>Current Round: {currentRound}</div>
                 </div>
             )}
             
             {/* Force show test balloon for debugging */}
             {process.env.NODE_ENV === 'development' && balloons.length > 0 && (
                 <div className="absolute top-40 left-0 bg-yellow-500/80 text-black p-2 text-xs z-[100]">
                     <div>🔍 FORCE SHOWING BALLOONS:</div>
                     {balloons.map((balloon, index) => (
                         <div key={balloon.id}>
                             Balloon {index + 1}: ({balloon.x}, {balloon.y}) - {balloon.color}
                         </div>
                     ))}
                 </div>
             )}
                                                                               {/* Exit Button for Fullscreen Mode */}
               {(gameState === 'game' || gameState === 'calibration') && (
                   <button
                       onClick={() => {
                           setGameState('menu');
                           stopTracking();
                       }}
                       className="absolute top-4 right-4 z-60 bg-red-500 hover:bg-red-600 text-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110"
                       title="Exit Game"
                   >
                       ✕
                   </button>
               )}

                                        {/* Game UI Overlay - Only show during game */}
               {gameState === 'game' && (
                   <div className="absolute top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm">
                                             <div className="flex justify-between items-center px-4 py-3">
                           <div className="flex items-center space-x-2">
                               <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                                   {currentRound}
                               </div>
                               <div className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                   Round {currentRound}/{totalRounds}
                               </div>
                           </div>
                           <div className="flex items-center space-x-2">
                               <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md">
                                   🎯
                               </div>
                               <div className="text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                                   {score}
                               </div>
                           </div>
                           <div className="flex items-center space-x-2">
                               <div className="w-6 h-6 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md animate-pulse">
                                   ⏱️
                               </div>
                               <div className="text-lg font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                                   {gameTimeLeft}s
                               </div>
                           </div>
                           <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${
                               isGazeAvailable 
                                   ? 'bg-gradient-to-r from-green-100 to-emerald-100 border border-green-300' 
                                   : 'bg-gradient-to-r from-red-100 to-pink-100 border border-red-300'
                           }`}>
                               <div className={`w-2 h-2 rounded-full ${
                                   isGazeAvailable ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                               }`}></div>
                               <div className={`text-sm font-semibold ${
                                   isGazeAvailable ? 'text-green-700' : 'text-red-700'
                               }`}>
                                   {gazeStatus}
                               </div>
                           </div>
                       </div>
                                                                      <div className="px-4 pb-3">
                            <div className="relative">
                                <div className="w-full bg-gradient-to-r from-gray-100 to-gray-200 rounded-full h-3 shadow-inner border border-gray-300">
                                    <div 
                                        className={`h-3 rounded-full transition-all duration-300 shadow-lg ${
                                            progressValue < 33 ? 'bg-gradient-to-r from-emerald-400 to-green-500' : // soothing green
                                            progressValue < 66 ? 'bg-gradient-to-r from-amber-400 to-orange-500' : // soothing amber
                                            'bg-gradient-to-r from-rose-400 to-red-500' // soothing red
                                        }`}
                                        style={{ width: `${progressValue}%` }}
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="text-xs font-bold text-gray-600 bg-white/80 px-2 py-1 rounded-full shadow-sm">
                                            {Math.round(progressValue)}%
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                  </div>
              )}

                         {/* Round Transition Countdown */}
             {isRoundTransition && (
                 <div className="absolute inset-0 flex items-center justify-center z-50">
                     <div className="relative">
                         {/* Circular Timer Background */}
                         <div className="w-32 h-32 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-2xl">
                             <div className="w-28 h-28 bg-white rounded-full flex items-center justify-center">
                                 <div className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                     {countdownTime}
                                 </div>
                             </div>
                         </div>
                         
                         {/* Circular Progress Ring */}
                         <svg className="absolute inset-0 w-32 h-32 transform -rotate-90" viewBox="0 0 128 128">
                             <circle
                                 cx="64"
                                 cy="64"
                                 r="60"
                                 stroke="rgba(255, 255, 255, 0.3)"
                                 strokeWidth="4"
                                 fill="none"
                             />
                             <circle
                                 cx="64"
                                 cy="64"
                                 r="60"
                                 stroke="white"
                                 strokeWidth="4"
                                 fill="none"
                                 strokeDasharray={`${2 * Math.PI * 60}`}
                                 strokeDashoffset={`${2 * Math.PI * 60 * (1 - countdownTime / 3)}`}
                                 strokeLinecap="round"
                                 className="transition-all duration-1000 ease-linear"
                             />
                         </svg>
                         
                         {/* Round Info */}
                         <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 text-center">
                             <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                 Round {currentRound + 1} Starting...
                             </div>
                         </div>
                     </div>
                 </div>
             )}

                                                                                                              {/* Game Elements - Only show during game */}
               {gameState === 'game' && (
                  <>
                      {/* Debug info */}
                      {process.env.NODE_ENV === 'development' && (
                          <div className="absolute top-20 left-0 bg-red-500/80 text-white p-2 text-xs z-[100]">
                              <div>🎮 GAME ACTIVE - Fullscreen Mode</div>
                              <div>Balloons: {balloons.length}</div>
                              <div>Gaze Data: {gazeData ? 'Available' : 'None'}</div>
                              <div>Game State: {gameState}</div>
                              <div>Is Round Transition: {isRoundTransition ? 'Yes' : 'No'}</div>
                              <div>Window Size: {window.innerWidth}x{window.innerHeight}</div>
                              <div>Balloon Positions: {balloons.map(b => `(${b.x},${b.y})`).join(', ')}</div>
                          </div>
                      )}
                    {/* Visual Pop Effect */}
                    {showPopEffect && (
                        <div className="absolute inset-0 pointer-events-none z-50">
                            <div className="absolute inset-0 bg-yellow-400 opacity-20 animate-ping" />
                        </div>
                    )}
                    
                                         
                                                               {/* Balloon Popping Weapon */}
                      {gazeData && (
                          <div 
                              className="absolute pointer-events-none z-40"
                              style={{
                                  left: `${interpolatedGazePos.x}px`,
                                  top: `${interpolatedGazePos.y}px`,
                                  transform: 'translate(-50%, -50%) rotate(45deg)',
                                  transition: 'none', // Disable CSS transitions for smooth movement
                                  willChange: 'transform, left, top', // Optimize for hardware acceleration
                                  backfaceVisibility: 'hidden', // Prevent flickering
                              }}
                          >
                                                                                            
                             {/* Weapon Blade - Sharp and deadly */}
                             <div className="w-20 h-1 bg-gradient-to-r from-slate-800 via-slate-600 to-slate-400 rounded-sm shadow-lg" />
                             
                             {/* Weapon Handle - Grip style */}
                             <div className="w-12 h-2 bg-gradient-to-r from-amber-800 to-amber-600 rounded-sm mt-1 shadow-md" />
                             
                             {/* Sharp Tip - Deadly point */}
                             <div className="w-0 h-0 border-l-6 border-r-6 border-b-12 border-l-transparent border-r-transparent border-b-slate-800 ml-7" />
                             
                             {/* Weapon Glow - Menacing effect */}
                             <div className="absolute inset-0 w-20 h-12 bg-red-600 opacity-30 blur-md rounded-full animate-pulse" />
                             
                             {/* Energy Trails */}
                             <div className="absolute -top-2 -left-2 w-4 h-4 bg-red-500 opacity-60 rounded-full animate-ping" />
                             <div className="absolute -bottom-2 -right-2 w-3 h-3 bg-orange-500 opacity-50 rounded-full animate-ping" style={{animationDelay: '0.5s'}} />
                         </div>
                     )}

                                         {/* Test Balloon - Always visible for debugging */}
                     {process.env.NODE_ENV === 'development' && (
                         <div
                             className="absolute pointer-events-none z-30 animate-bounce"
                             style={{
                                 left: '100px',
                                 top: '100px',
                                 width: '100px',
                                 height: '100px',
                                 backgroundColor: '#FF0000',
                                 borderRadius: '50%',
                                 boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
                                 transform: 'translate(-50%, -50%)',
                             }}
                         >
                             <div className="absolute inset-0 flex items-center justify-center text-white font-bold">
                                 TEST
                             </div>
                         </div>
                     )}
                     
                     {/* Balloons */}
                     {balloons.map(balloon => {
                         const isPopping = balloon.isPopping;
                                                                          const popProgress = isPopping && balloon.popStartTime 
                             ? Math.min(1, (Date.now() - balloon.popStartTime) / 1000) 
                             : 0;
                        
                        return (
                                                         <div
                                 key={balloon.id}
                                 className={`absolute pointer-events-none z-30 ${isPopping ? '' : 'animate-bounce'}`}
                                 style={{
                                     left: `${balloon.x}px`,
                                     top: `${balloon.y}px`,
                                     width: `${balloon.size}px`,
                                     height: `${balloon.size}px`,
                                    backgroundColor: balloon.color,
                                    borderRadius: '50%',
                                    boxShadow: '0 4px 8px rgba(0,0,0,0.3), inset -10px -10px 20px rgba(0,0,0,0.2), inset 10px 10px 20px rgba(255,255,255,0.3)',
                                    background: `radial-gradient(circle at 30% 30%, ${balloon.color}dd, ${balloon.color}88, ${balloon.color}44)`,
                                    transform: `translate(-50%, -50%) scale(${isPopping ? 1 + popProgress * 0.5 : 1})`,
                                    opacity: isPopping ? 1 - popProgress : 1,
                                    transition: isPopping ? 'all 0.1s ease-out' : 'none',
                                }}
                            >
                                                                 {/* Balloon Highlight */}
                                 <div
                                     className="absolute rounded-full bg-white opacity-40"
                                     style={{
                                         width: `${balloon.size * 0.3}px`,
                                         height: `${balloon.size * 0.3}px`,
                                         top: `${balloon.size * 0.1}px`,
                                         left: `${balloon.size * 0.2}px`,
                                     }}
                                 />
                                 
                                                                    
                                 
                                                                 {/* SPECTACULAR POP ANIMATION */}
                                 {isPopping && (
                                     <>
                                         {/* Explosion Core */}
                                         <div
                                             className="absolute rounded-full bg-yellow-300 animate-ping"
                                             style={{
                                                 left: `${balloon.size * 0.5}px`,
                                                 top: `${balloon.size * 0.5}px`,
                                                 width: `${balloon.size * 0.8 * popProgress}px`,
                                                 height: `${balloon.size * 0.8 * popProgress}px`,
                                                 transform: 'translate(-50%, -50%)',
                                                 opacity: 1 - popProgress * 0.5,
                                             }}
                                         />
                                         
                                         {/* Shrapnel Explosion - Multiple directions */}
                                         {[...Array(12)].map((_, i) => (
                                             <div
                                                 key={i}
                                                 className="absolute w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-ping"
                                                 style={{
                                                     left: `${balloon.size * 0.5}px`,
                                                     top: `${balloon.size * 0.5}px`,
                                                     transform: `translate(-50%, -50%) translate(${Math.cos(i * Math.PI / 6) * 80 * popProgress}px, ${Math.sin(i * Math.PI / 6) * 80 * popProgress}px)`,
                                                     opacity: 1 - popProgress,
                                                     animationDelay: `${i * 0.1}s`,
                                                 }}
                                             />
                                         ))}
                                         
                                         {/* Spark Burst */}
                                         {[...Array(8)].map((_, i) => (
                                             <div
                                                 key={`spark-${i}`}
                                                 className="absolute w-1 h-6 bg-gradient-to-b from-yellow-300 to-transparent rounded-full"
                                                 style={{
                                                     left: `${balloon.size * 0.5}px`,
                                                     top: `${balloon.size * 0.5}px`,
                                                     transform: `translate(-50%, -50%) rotate(${i * 45}deg) translateY(-${60 * popProgress}px)`,
                                                     opacity: 1 - popProgress,
                                                 }}
                                             />
                                         ))}
                                         
                                         {/* Shockwave Ring */}
                                         <div
                                             className="absolute rounded-full border-2 border-yellow-400 animate-ping"
                                             style={{
                                                 left: `${balloon.size * 0.5}px`,
                                                 top: `${balloon.size * 0.5}px`,
                                                 width: `${balloon.size * 1.5 * popProgress}px`,
                                                 height: `${balloon.size * 1.5 * popProgress}px`,
                                                 transform: 'translate(-50%, -50%)',
                                                 opacity: 1 - popProgress,
                                             }}
                                         />
                                         
                                         {/* Debris Pieces */}
                                         {[...Array(6)].map((_, i) => (
                                             <div
                                                 key={`debris-${i}`}
                                                 className="absolute w-2 h-2 bg-gradient-to-r from-red-400 to-pink-500 rounded-sm"
                                                 style={{
                                                     left: `${balloon.size * 0.5}px`,
                                                     top: `${balloon.size * 0.5}px`,
                                                     transform: `translate(-50%, -50%) translate(${Math.cos(i * Math.PI / 3) * 100 * popProgress}px, ${Math.sin(i * Math.PI / 3) * 100 * popProgress}px) rotate(${i * 60}deg)`,
                                                     opacity: 1 - popProgress,
                                                 }}
                                             />
                                         ))}
                                         
                                         {/* Flash Effect */}
                                         <div
                                             className="absolute rounded-full bg-white animate-ping"
                                             style={{
                                                 left: `${balloon.size * 0.5}px`,
                                                 top: `${balloon.size * 0.5}px`,
                                                 width: `${balloon.size * 0.3 * (1 - popProgress)}px`,
                                                 height: `${balloon.size * 0.3 * (1 - popProgress)}px`,
                                                 transform: 'translate(-50%, -50%)',
                                                 opacity: 0.8 * (1 - popProgress),
                                             }}
                                         />
                                     </>
                                 )}
                            </div>
                        );
                    })}
                </>
            )}

                                                 {/* Calibration Weapon Pointer - Only show during calibration */}
                        {gameState === 'calibration' && gazeData && (
                            <div 
                                className="absolute pointer-events-none z-40"
                                style={{
                                    left: `${interpolatedGazePos.x}px`,
                                    top: `${interpolatedGazePos.y}px`,
                                    transform: 'translate(-50%, -50%) rotate(45deg)',
                                    transition: 'none', // Disable CSS transitions for smooth movement
                                    willChange: 'transform, left, top', // Optimize for hardware acceleration
                                    backfaceVisibility: 'hidden', // Prevent flickering
                                }}
                            >
                     {/* Weapon Blade - Sharp and deadly */}
                     <div className="w-20 h-1 bg-gradient-to-r from-slate-800 via-slate-600 to-slate-400 rounded-sm shadow-lg" />
                     
                     {/* Weapon Handle - Grip style */}
                     <div className="w-12 h-2 bg-gradient-to-r from-amber-800 to-amber-600 rounded-sm mt-1 shadow-md" />
                     
                     {/* Sharp Tip - Deadly point */}
                     <div className="w-0 h-0 border-l-6 border-r-6 border-b-12 border-l-transparent border-r-transparent border-b-slate-800 ml-7" />
                     
                     {/* Weapon Glow - Menacing effect */}
                     <div className="absolute inset-0 w-20 h-12 bg-red-600 opacity-30 blur-md rounded-full animate-pulse" />
                     
                     {/* Energy Trails */}
                     <div className="absolute -top-2 -left-2 w-4 h-4 bg-red-500 opacity-60 rounded-full animate-ping" />
                     <div className="absolute -bottom-2 -right-2 w-3 h-3 bg-orange-500 opacity-50 rounded-full animate-ping" style={{animationDelay: '0.5s'}} />
                 </div>
             )}

                         {/* Menu Screen */}
             {gameState === 'menu' && (
                 <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100">
                     <Card className="w-96 bg-gradient-to-br from-white/95 to-blue-50/95 backdrop-blur-sm shadow-2xl border-4 border-purple-300">
                         <CardHeader className="text-center">
                             <div className="w-20 h-20 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg animate-pulse">
                                 <div className="text-3xl">🎈</div>
                             </div>
                             <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                                 Balloon Pop Game
                             </CardTitle>
                             <CardDescription className="text-gray-600 font-medium">
                                 Look at balloons to pop them with your eyes!
                             </CardDescription>
                         </CardHeader>
                         <CardContent className="space-y-6">
                             <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-xl border-2 border-blue-200 shadow-lg">
                                 <h3 className="font-bold text-blue-800 mb-3 text-lg flex items-center">
                                     <span className="mr-2">🎯</span>
                                     How to Play:
                                 </h3>
                                 <ul className="text-sm text-blue-700 space-y-2">
                                     <li className="flex items-center">
                                         <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                                         Look at balloons to pop them
                                     </li>
                                     <li className="flex items-center">
                                         <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                                         Each balloon = 10 points
                                     </li>
                                     <li className="flex items-center">
                                         <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                                         3 rounds of 15 seconds each
                                     </li>
                                     <li className="flex items-center">
                                         <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                                         Real eye gaze tracking!
                                     </li>
                                     <li className="flex items-center">
                                         <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                                         Calibration improves accuracy
                                     </li>
                                     <li className="flex items-center">
                                         <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                                         Requires Python backend running
                                     </li>
                                 </ul>
                             </div>
                             
                             <div className="flex flex-col space-y-4">
                                 <Button
                                     onClick={startCalibration}
                                     className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold py-4 shadow-lg transform hover:scale-105 transition-all duration-200"
                                 >
                                     <Settings className="w-5 h-5 mr-3" />
                                     Calibrate First
                                 </Button>
                                 
                                 <Button
                                     onClick={startGame}
                                     className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-bold py-4 shadow-lg transform hover:scale-105 transition-all duration-200"
                                 >
                                     <Play className="w-5 h-5 mr-3" />
                                     Start Game
                                 </Button>
                                 
                                                                   <Button
                                      onClick={testTimer}
                                      className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-bold py-3 shadow-lg transform hover:scale-105 transition-all duration-200"
                                  >
                                      Test Timer (5s)
                                  </Button>
                                  
                                  <Button
                                      onClick={() => {
                                          console.log('Testing fullscreen mode...');
                                          setGameState('game');
                                          setScore(10);
                                          setBalloons([{
                                              id: 1,
                                              x: window.innerWidth / 2,
                                              y: window.innerHeight / 2,
                                              size: 100,
                                              color: '#FF6B6B',
                                              speedX: 0,
                                              speedY: 0,
                                              createdAt: Date.now()
                                          }]);
                                      }}
                                      className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold py-3 shadow-lg transform hover:scale-105 transition-all duration-200"
                                  >
                                      Test Fullscreen
                                  </Button>
                             </div>
                         </CardContent>
                     </Card>
                 </div>
             )}

            {/* Calibration Interface */}
            {gameState === 'calibration' && calibrationStep > 0 && calibrationStep <= 4 && (
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
            {gameState === 'calibration' && calibrationStep === 5 && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <Card className="w-full max-w-2xl bg-white/95 backdrop-blur-sm shadow-2xl border-4 border-green-300 max-h-[90vh] overflow-y-auto">
                        <CardHeader className="text-center">
                            <CardTitle className="text-2xl font-playful text-green-800">
                                🎯 Calibration Complete!
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="text-center mb-6">
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

                            <div className="flex justify-center space-x-3">
                                <Button
                                    onClick={resetCalibration}
                                    className="bg-blue-500 hover:bg-blue-600 text-white"
                                >
                                    Calibrate Again
                                </Button>
                                <Button
                                    onClick={startGame}
                                    className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white"
                                >
                                    Start Game
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

                         {/* Round Results Screen - Only show if manually triggered */}
             {gameState === 'results' && showRoundResults && gameResult && !isRoundTransition && (
                 <div className="absolute inset-0 flex items-center justify-center">
                     <Card className="w-96 bg-gradient-to-br from-blue-50 to-purple-50 backdrop-blur-sm shadow-2xl border-4 border-blue-300">
                         <CardHeader className="text-center">
                             <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                                 <div className="text-2xl">🎯</div>
                             </div>
                             <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                 Round {currentRound} Complete!
                             </CardTitle>
                         </CardHeader>
                         <CardContent className="space-y-6">
                             <div className="grid grid-cols-2 gap-4">
                                 <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border-2 border-green-200 text-center shadow-lg">
                                     <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">{gameResult.score}</div>
                                     <div className="text-sm font-semibold text-green-700">Score</div>
                                 </div>
                                 <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-xl border-2 border-blue-200 text-center shadow-lg">
                                     <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">{gameResult.balloonsPopped}</div>
                                     <div className="text-sm font-semibold text-blue-700">Balloons</div>
                                 </div>
                             </div>
                             
                             <div className="text-center">
                                 <div className="text-5xl mb-3 animate-bounce">
                                     {gameResult.score >= 200 ? '🏆' : gameResult.score >= 100 ? '🥈' : gameResult.score >= 50 ? '🥉' : '💪'}
                                 </div>
                                 <div className="font-bold text-xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                     {gameResult.score >= 200 ? 'Excellent!' : 
                                      gameResult.score >= 100 ? 'Great Job!' : 
                                      gameResult.score >= 50 ? 'Good Work!' : 'Keep Practicing!'}
                                 </div>
                             </div>
                             
                                                           <div className="flex flex-col space-y-3">
                                  {currentRound < totalRounds ? (
                                      <Button
                                          onClick={continueToNextRound}
                                          className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-bold py-3 shadow-lg transform hover:scale-105 transition-all duration-200"
                                      >
                                          <Play className="w-5 h-5 mr-2" />
                                          Continue to Round {currentRound + 1}
                                      </Button>
                                  ) : (
                                      <Button
                                          onClick={() => setShowRoundResults(false)}
                                          className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-bold py-3 shadow-lg transform hover:scale-105 transition-all duration-200"
                                      >
                                          <BarChart3 className="w-5 h-5 mr-2" />
                                          View Final Results
                                      </Button>
                                  )}
                                  <Button
                                      onClick={() => setGameState('menu')}
                                      className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-bold py-3 shadow-lg transform hover:scale-105 transition-all duration-200"
                                  >
                                      Back to Menu
                                  </Button>
                              </div>
                         </CardContent>
                     </Card>
                 </div>
             )}

             {/* Final Game Session Results Screen */}
             {gameState === 'results' && !showRoundResults && gameSession && (
                 <div className="absolute inset-0 flex items-center justify-center p-4">
                     <Card className="w-full max-w-4xl bg-white/95 backdrop-blur-sm shadow-2xl border-4 border-yellow-300 max-h-[90vh] overflow-y-auto">
                         <CardHeader className="text-center">
                             <CardTitle className="text-2xl font-playful text-yellow-800">
                                 🎉 Game Session Complete! 🎉
                             </CardTitle>
                         </CardHeader>
                         <CardContent className="space-y-6">
                             {/* Overall Statistics */}
                             <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border-2 border-blue-200">
                                 <h3 className="text-xl font-bold text-blue-800 mb-4 text-center">Overall Performance</h3>
                                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                     <div className="bg-white p-3 rounded-lg border-2 border-green-200 text-center">
                                         <div className="text-2xl font-bold text-green-600">{gameSession.totalScore}</div>
                                         <div className="text-sm text-green-700">Total Score</div>
                                     </div>
                                     <div className="bg-white p-3 rounded-lg border-2 border-blue-200 text-center">
                                         <div className="text-2xl font-bold text-blue-600">{gameSession.totalBalloons}</div>
                                         <div className="text-sm text-blue-700">Total Balloons</div>
                                     </div>
                                     <div className="bg-white p-3 rounded-lg border-2 border-purple-200 text-center">
                                         <div className="text-2xl font-bold text-purple-600">{gameSession.averageScorePerRound.toFixed(0)}</div>
                                         <div className="text-sm text-purple-700">Avg/Round</div>
                                     </div>
                                     <div className="bg-white p-3 rounded-lg border-2 border-yellow-200 text-center">
                                         <div className="text-2xl font-bold text-yellow-600">{gameSession.averageAccuracy.toFixed(1)}%</div>
                                         <div className="text-sm text-yellow-700">Avg Accuracy</div>
                                     </div>
                                 </div>
                                 <div className="mt-4 text-center">
                                     <div className="text-lg font-semibold text-gray-700">
                                         Best Round: {gameSession.bestRound} | Worst Round: {gameSession.worstRound}
                                     </div>
                                 </div>
                             </div>

                             {/* Round-by-Round Statistics */}
                             <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg border-2 border-green-200">
                                 <h3 className="text-xl font-bold text-green-800 mb-4 text-center">Round-by-Round Results</h3>
                                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                     {gameSession.rounds.map((round, index) => (
                                         <div key={round.roundNumber} className="bg-white p-4 rounded-lg border-2 border-gray-200">
                                             <div className="text-center mb-3">
                                                 <div className="text-lg font-bold text-gray-800">Round {round.roundNumber}</div>
                                                 {round.roundNumber === gameSession.bestRound && (
                                                     <div className="text-sm text-green-600 font-semibold">🏆 Best Round</div>
                                                 )}
                                                 {round.roundNumber === gameSession.worstRound && (
                                                     <div className="text-sm text-red-600 font-semibold">📉 Worst Round</div>
                                                 )}
                                             </div>
                                             <div className="grid grid-cols-2 gap-2 text-sm">
                                                 <div className="text-center">
                                                     <div className="font-bold text-green-600">{round.score}</div>
                                                     <div className="text-gray-600">Score</div>
                                                 </div>
                                                 <div className="text-center">
                                                     <div className="font-bold text-blue-600">{round.balloonsPopped}</div>
                                                     <div className="text-gray-600">Balloons</div>
                                                 </div>
                                                 <div className="text-center">
                                                     <div className="font-bold text-purple-600">{round.accuracy.toFixed(1)}%</div>
                                                     <div className="text-gray-600">Accuracy</div>
                                                 </div>
                                                 <div className="text-center">
                                                     <div className="font-bold text-yellow-600">{round.gameTime}s</div>
                                                     <div className="text-gray-600">Time</div>
                                                 </div>
                                             </div>
                                         </div>
                                     ))}
                                 </div>
                             </div>

                             {/* Action Buttons */}
                             <div className="flex justify-center space-x-3">
                                 <Button
                                     onClick={startGame}
                                     className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white"
                                 >
                                     <Play className="w-4 h-4 mr-2" />
                                     Play Again
                                 </Button>
                                 <Button
                                     onClick={() => setGameState('menu')}
                                     className="bg-gray-500 hover:bg-gray-600 text-white"
                                 >
                                     Back to Menu
                                 </Button>
                             </div>
                         </CardContent>
                     </Card>
                 </div>
             )}

            {/* Statistics Screen */}
            {gameState === 'results' && gameStats && (
                <div className="absolute inset-0 flex items-center justify-center p-4">
                    <Card className="w-full max-w-2xl bg-white/95 backdrop-blur-sm shadow-2xl border-4 border-purple-300 max-h-[90vh] overflow-y-auto">
                        <CardHeader className="text-center">
                            <CardTitle className="text-xl font-playful text-purple-800">
                                📊 Game Statistics 📊
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <div className="bg-blue-50 p-3 rounded-lg border-2 border-blue-200 text-center">
                                    <div className="text-lg font-bold text-blue-600">{gameStats.totalScore}</div>
                                    <div className="text-xs text-blue-700">Score</div>
                                </div>
                                <div className="bg-green-50 p-3 rounded-lg border-2 border-green-200 text-center">
                                    <div className="text-lg font-bold text-green-600">{gameStats.totalBalloons}</div>
                                    <div className="text-xs text-green-700">Popped</div>
                                </div>
                                <div className="bg-purple-50 p-3 rounded-lg border-2 border-purple-200 text-center">
                                    <div className="text-lg font-bold text-purple-600">{gameStats.balloonsPerSecond.toFixed(2)}</div>
                                    <div className="text-xs text-purple-700">Per Second</div>
                                </div>
                                <div className="bg-yellow-50 p-3 rounded-lg border-2 border-yellow-200 text-center">
                                    <div className="text-lg font-bold text-yellow-600">{gameStats.accuracy.toFixed(1)}%</div>
                                    <div className="text-xs text-yellow-700">Accuracy</div>
                                </div>
                            </div>
                            
                            <div className="flex justify-center space-x-3">
                                <Button
                                    onClick={startGame}
                                    className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white"
                                >
                                    <Play className="w-4 h-4 mr-2" />
                                    Play Again
                                </Button>
                                <Button
                                    onClick={() => setGameState('menu')}
                                    className="bg-gray-500 hover:bg-gray-600 text-white"
                                >
                                    Back to Menu
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}


        </div>
    );
};

export default GazeTrackingGame;
