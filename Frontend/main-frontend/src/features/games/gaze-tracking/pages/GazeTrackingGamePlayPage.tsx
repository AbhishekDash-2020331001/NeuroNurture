"use client"

import balloonBurstSound from '@/assets/balloon_burst.mp3';
import gazeGameplayMusic from '@/assets/gaze_gameplay.wav';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface GazeData {
    x: number;
    y: number;
    confidence: string;
    smoothX?: number;
    smoothY?: number;
}

interface Balloon {
    id: number;
    x: number;
    y: number;
    size: number;
    color: string;
    createdAt: number;
    isPopping?: boolean;
    popStartTime?: number;
}

type GameScreen = 'instructions' | 'consent' | 'game' | 'loading' | 'countdown' | 'results';

interface GazeTrackingGamePlayPageProps {
    onScreenChange?: (screen: GameScreen) => void;
    taskId?: string | null;
}

class KalmanFilter {
    private A: number;
    private H: number;
    private Q: number;
    private R: number;
    private P: number;
    private x: number;
    private initialized: boolean;
    
    constructor(processNoise = 1e-4, measurementNoise = 1e-2, errorCovariance = 1) {
        this.A = 1;
        this.H = 1;
        this.Q = processNoise;
        this.R = measurementNoise;
        this.P = errorCovariance;
        this.x = 0;
        this.initialized = false;
    }
    
    reset(initialValue?: number) {
        this.x = initialValue || 0;
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
        
        const x_pred = this.A * this.x;
        const P_pred = this.A * this.P * this.A + this.Q;
        
        const K = P_pred * this.H / (this.H * P_pred * this.H + this.R);
        this.x = x_pred + K * (measurement - this.H * x_pred);
        this.P = (1 - K * this.H) * P_pred;
        
        return this.x;
    }
}

const balloonColors = [
    '#FF1744', '#00E676', '#FF6D00', '#D500F9', '#FFD600',
    '#00B0FF', '#FF4081', '#64FFDA', '#FF9100', '#E040FB',
    '#FFEB3B', '#4CAF50', '#9C27B0', '#FF5722', '#2196F3'
];

const GazeTrackingGamePlayPage: React.FC<GazeTrackingGamePlayPageProps> = ({ onScreenChange, taskId }) => {
    const navigate = useNavigate();
    const [currentScreen, setCurrentScreen] = useState<GameScreen>('instructions');
    const [gameState, setGameState] = useState<'loading' | 'countdown' | 'game' | 'results'>('loading');
    const [isTracking, setIsTracking] = useState(false);
    const [gazeData, setGazeData] = useState<GazeData | null>(null);
    const [balloons, setBalloons] = useState<Balloon[]>([]);
    const [score, setScore] = useState(0);
    const [balloonsPopped, setBalloonsPopped] = useState(0);
    const [gameTimeLeft, setGameTimeLeft] = useState(15);
    const [currentRound, setCurrentRound] = useState(1);
    const [totalRounds] = useState(3);
    const [roundResults, setRoundResults] = useState<any[]>([]);
    const [preGameCountdown, setPreGameCountdown] = useState(3);
    const [isRoundTransition, setIsRoundTransition] = useState(false);
    const [roundTransitionCountdown, setRoundTransitionCountdown] = useState(3);
    
    // Session management
    const [sessionId, setSessionId] = useState<string>('');
    const [childId, setChildId] = useState<string>('');
    const [dataSaved, setDataSaved] = useState<boolean>(false);
    const [gazeStatus, setGazeStatus] = useState<string>('Initializing...');
    const [isGazeAvailable, setIsGazeAvailable] = useState(false);
    const [progressValue, setProgressValue] = useState(0);
    const [gameStartTime, setGameStartTime] = useState<number | null>(null);
    const [connectionRetries, setConnectionRetries] = useState(0);

    // Notify parent component when screen changes
    useEffect(() => {
        if (onScreenChange) {
            onScreenChange(currentScreen);
        }
    }, [currentScreen, onScreenChange]);

    // Consent screen state
    const [childName, setChildName] = useState("");
    const [childAge, setChildAge] = useState("");
    const [suspectedASD, setSuspectedASD] = useState(false);
    const [isTrainingAllowed, setIsTrainingAllowed] = useState(false);

    // Load child information from localStorage and create session
    useEffect(() => {
        const selectedChild = localStorage.getItem('selectedChild');
        const selectedChildId = localStorage.getItem('selectedChildId');
        
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
        
        if (selectedChildId) {
            setChildId(selectedChildId);
            // Create session ID
            const dateTime = new Date().toISOString().replace(/[:.]/g, '-');
            const newSessionId = `${selectedChildId}_${dateTime}`;
            setSessionId(newSessionId);
        }
    }, []);

    // Save game data when game ends
    useEffect(() => {
        if (gameState === 'results' && roundResults.length === totalRounds) {
            const saveGameData = async () => {
                try {
                    console.log('Saving game data to backend...');
                    console.log('Session ID:', sessionId);
                    console.log('Child ID:', childId);
                    console.log('Round results:', roundResults);
                    
                    // Extract round counts
                    const round1Count = roundResults[0]?.balloonsPopped || 0;
                    const round2Count = roundResults[1]?.balloonsPopped || 0;
                    const round3Count = roundResults[2]?.balloonsPopped || 0;
                    
                    const requestData = {
                        sessionId: sessionId,
                        childId: childId,
                        age: parseInt(childAge) || 8,
                        schoolTaskId: taskId, // Include school task ID if available
                        round1Count: round1Count,
                        round2Count: round2Count,
                        round3Count: round3Count,
                        isTrainingAllowed: isTrainingAllowed,
                        suspectedASD: suspectedASD
                    };
                    
                    console.log('Saving game data:', requestData);
                    
                    const response = await fetch('http://localhost:8086/api/gaze-game/save', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(requestData)
                    });
                    
                    if (response.ok) {
                        const savedData = await response.json();
                        console.log('Game data saved successfully:', savedData);
                        setDataSaved(true);
                    } else {
                        console.error('Failed to save game data:', response.statusText);
                    }
                } catch (error) {
                    console.error('Error saving game data:', error);
                }
            };
            
            saveGameData();
        }
    }, [gameState, roundResults, sessionId, childId, childAge, isTrainingAllowed, suspectedASD, totalRounds]);

    // Refs
    const gameTimerRef = useRef<NodeJS.Timeout | null>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const kalmanXRef = useRef<KalmanFilter | null>(null);
    const kalmanYRef = useRef<KalmanFilter | null>(null);
    const scoreRef = useRef(0);
    const balloonsPoppedRef = useRef(0);
    
    // Smoothing refs for ultra-smooth movement
    const positionHistoryRef = useRef<{x: number, y: number, timestamp: number}[]>([]);
    const lastPositionRef = useRef<{x: number, y: number} | null>(null);
    
    // Audio refs
    const gameplayAudioRef = useRef<HTMLAudioElement | null>(null);
    const balloonBurstAudioRef = useRef<HTMLAudioElement | null>(null);

    // Initialize Kalman filters
    useEffect(() => {
        if (!kalmanXRef.current) {
            // Optimized settings for smooth movement without jitter
            kalmanXRef.current = new KalmanFilter(1e-4, 1e-2, 1);
        }
        if (!kalmanYRef.current) {
            // Optimized settings for smooth movement without jitter
            kalmanYRef.current = new KalmanFilter(1e-4, 1e-2, 1);
        }
    }, []);

    // Initialize audio elements
    useEffect(() => {
        // Initialize gameplay music
        gameplayAudioRef.current = new Audio(gazeGameplayMusic);
        gameplayAudioRef.current.loop = true;
        gameplayAudioRef.current.volume = 0.3;
        
        // Initialize balloon burst sound
        balloonBurstAudioRef.current = new Audio(balloonBurstSound);
        balloonBurstAudioRef.current.volume = 0.5;
        
        return () => {
            // Cleanup audio on unmount
            if (gameplayAudioRef.current) {
                gameplayAudioRef.current.pause();
                gameplayAudioRef.current = null;
            }
            if (balloonBurstAudioRef.current) {
                balloonBurstAudioRef.current.pause();
                balloonBurstAudioRef.current = null;
            }
        };
    }, []);

                 const startTracking = useCallback(async () => {
         console.log('Starting gaze tracking...');
         setIsTracking(true);
         setGazeStatus('Starting camera...');
         
         try {
             console.log('Making camera start request...');
             // Start the camera first with better error handling
             const cameraResponse = await fetch('http://localhost:8000/start-camera', {
                 method: 'POST',
                 headers: {
                     'Content-Type': 'application/json'
                 }
             });
             
             console.log('Camera response status:', cameraResponse.status);
             
             if (!cameraResponse.ok) {
                 throw new Error(`Camera start failed: ${cameraResponse.status}`);
             }
             
             const cameraData = await cameraResponse.json();
             console.log('Camera start response:', cameraData);
             
             // Wait for camera to initialize properly
             await new Promise(resolve => setTimeout(resolve, 1000));
             
             // Check camera status to ensure it's running
             try {
                 const statusResponse = await fetch('http://localhost:8000/camera-status');
                 const statusData = await statusResponse.json();
                 console.log('Camera status check:', statusData);
                 
                 if (!statusData.data || !statusData.data.active) {
                     throw new Error('Camera not active after start request');
                 }
             } catch (statusError) {
                 console.error('Camera status check failed:', statusError);
                 // Continue anyway, the camera might still work
             }
             
             if (kalmanXRef.current) kalmanXRef.current.reset();
             if (kalmanYRef.current) kalmanYRef.current.reset();
             
             // Start gaze tracking with slower interval to prevent resource exhaustion
             intervalRef.current = setInterval(async () => {
                 try {
                     const controller = new AbortController();
                     const timeoutId = setTimeout(() => controller.abort(), 1000); // Increased timeout
                     
                     const response = await fetch('http://localhost:8000/current-gaze', {
                         signal: controller.signal,
                         headers: {
                             'Content-Type': 'application/json'
                         }
                     });
                     clearTimeout(timeoutId);
                     
                     if (!response.ok) {
                         throw new Error(`HTTP ${response.status}`);
                     }
                     
                     const data = await response.json();
                     
                     if (data.status === 'success' && data.data) {
                         let rawX = data.data.x;
                         let rawY = data.data.y;
                         
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
                              
                              // Simplified smoothing for stable movement
                              const alpha = 0.6; // Balanced responsiveness
                              smoothX = smoothX * alpha + browserX * (1 - alpha);
                              smoothY = smoothY * alpha + browserY * (1 - alpha);
                              
                              // Simple position history for stability
                              const now = Date.now();
                              positionHistoryRef.current.push({x: browserX, y: browserY, timestamp: now});
                              
                              // Keep only recent positions (last 200ms for more stability)
                              positionHistoryRef.current = positionHistoryRef.current.filter(
                                  pos => now - pos.timestamp < 200
                              );
                              
                              if (positionHistoryRef.current.length > 2) {
                                  // Simple moving average for stability
                                  const recentX = positionHistoryRef.current.slice(-3).reduce((sum, pos) => sum + pos.x, 0) / 3;
                                  const recentY = positionHistoryRef.current.slice(-3).reduce((sum, pos) => sum + pos.y, 0) / 3;
                                  
                                  // Blend with Kalman filter output (more Kalman, less history)
                                  smoothX = smoothX * 0.7 + recentX * 0.3;
                                  smoothY = smoothY * 0.7 + recentY * 0.3;
                              }
                              
                              // Gentle velocity-based smoothing
                              if (lastPositionRef.current) {
                                  const dx = browserX - lastPositionRef.current.x;
                                  const dy = browserY - lastPositionRef.current.y;
                                  const velocity = Math.sqrt(dx * dx + dy * dy);
                                  
                                  // Only apply velocity smoothing for very fast movements
                                  if (velocity > 100) {
                                      const velocityFactor = Math.min(velocity / 200, 0.3);
                                      smoothX = smoothX * (1 - velocityFactor) + browserX * velocityFactor;
                                      smoothY = smoothY * (1 - velocityFactor) + browserY * velocityFactor;
                                  }
                              }
                              
                              lastPositionRef.current = {x: browserX, y: browserY};
                          }
                         
                                                   // Use requestAnimationFrame for ultra-smooth visual updates
                          requestAnimationFrame(() => {
                              setGazeData({
                                  x: browserX,
                                  y: browserY,
                                  confidence: data.data.confidence,
                                  smoothX: smoothX,
                                  smoothY: smoothY
                              });
                          });
                         
                         // Only update status if it changed to prevent shaking
                         if (!isGazeAvailable) {
                             setIsGazeAvailable(true);
                         }
                         
                         // Reset retry counter on successful connection
                         if (connectionRetries > 0) {
                             setConnectionRetries(0);
                         }
                         
                         // Update status less frequently to prevent shaking
                         const newStatus = `Tracking: ${data.data.confidence}`;
                         if (gazeStatus !== newStatus) {
                             setGazeStatus(newStatus);
                         }
                     } else {
                         // Handle unsuccessful response
                         if (isGazeAvailable) {
                             setIsGazeAvailable(false);
                         }
                         
                         // Check if it's a calibration issue
                         if (data.message && data.message.includes('calibration')) {
                             setGazeStatus('Needs calibration');
                         } else if (data.message && data.message.includes('confidence')) {
                             setGazeStatus('Low confidence');
                         } else {
                             setGazeStatus('No gaze data');
                         }
                     }
                 } catch (error) {
                     console.error('Failed to get gaze data:', error);
                     
                     // Only update status if it changed to prevent shaking
                     if (isGazeAvailable) {
                         setIsGazeAvailable(false);
                     }
                     
                     // Increment retry counter
                     setConnectionRetries(prev => prev + 1);
                     
                                           // If too many retries, stop trying and show error
                      if (connectionRetries > 3) { // Reduced retry limit
                         if (gazeStatus !== 'Connection failed - please restart') {
                             setGazeStatus('Connection failed - please restart');
                         }
                         // Stop the interval to prevent further resource exhaustion
                         if (intervalRef.current) {
                             clearInterval(intervalRef.current);
                             intervalRef.current = null;
                         }
                     } else {
                         if (gazeStatus !== 'Connection failed') {
                             setGazeStatus('Connection failed');
                         }
                     }
                 }
                                                       }, 4); // 240 FPS for maximum smoothness
             
             setGazeStatus('Camera started - tracking gaze');
         } catch (error) {
             console.error('Failed to start camera:', error);
             setGazeStatus('Failed to start camera');
             setIsTracking(false);
         }
     }, []);

    const stopTracking = useCallback(async () => {
        console.log('Stopping tracking...');
        setIsTracking(false);
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        setGazeData(null);
        setIsGazeAvailable(false);
        setConnectionRetries(0);
        
        try {
            await fetch('http://localhost:8000/stop-camera', {
                method: 'POST'
            });
            setGazeStatus('Camera stopped');
        } catch (error) {
            console.error('Failed to stop camera:', error);
            setGazeStatus('Failed to stop camera');
        }
    }, []);

    // Audio control functions
    const startGameplayMusic = useCallback(() => {
        if (gameplayAudioRef.current) {
            gameplayAudioRef.current.play().catch(error => {
                console.log('Could not play gameplay music:', error);
            });
        }
    }, []);

    const stopGameplayMusic = useCallback(() => {
        if (gameplayAudioRef.current) {
            gameplayAudioRef.current.pause();
            gameplayAudioRef.current.currentTime = 0;
        }
    }, []);

    const playBalloonBurstSound = useCallback(() => {
        if (balloonBurstAudioRef.current) {
            // Reset the audio to start for overlapping sounds
            balloonBurstAudioRef.current.currentTime = 0;
            balloonBurstAudioRef.current.play().catch(error => {
                console.log('Could not play balloon burst sound:', error);
            });
        }
    }, []);

    const createBalloon = useCallback(() => {
        setBalloons(prev => {
            if (prev.some(balloon => !balloon.isPopping)) {
                return prev;
            }
            
            const containerWidth = window.innerWidth;
            const containerHeight = window.innerHeight;
            const balloonRadius = 50;
            const margin = 25;
            
            const minX = margin + balloonRadius;
            const maxX = containerWidth - margin - balloonRadius;
            const minY = margin + balloonRadius;
            const maxY = containerHeight - margin - balloonRadius;
            
            const newX = Math.random() * (maxX - minX) + minX;
            const newY = Math.random() * (maxY - minY) + minY;
            
            const newBalloon: Balloon = {
                id: Date.now() + Math.random(),
                x: newX,
                y: newY,
                size: 140, // Bigger balloons to be larger than weapon
                color: balloonColors[Math.floor(Math.random() * balloonColors.length)],
                createdAt: Date.now()
            };
            
            return [...prev, newBalloon];
        });
    }, []);

    const checkBalloonCollision = useCallback((gazeX: number, gazeY: number) => {
        if (!gazeX || !gazeY || isNaN(gazeX) || isNaN(gazeY)) {
            return;
        }

        const collisionRadius = 200; // Adjusted for bigger balloons
        
        setBalloons(prev => {
            if (prev.length === 0) return prev;
            
            let poppedCount = 0;
            
            const remaining = prev.map(balloon => {
                if (balloon.isPopping) {
                    return balloon;
                }
                
                // Use the center of the balloon for collision detection
                const balloonCenterX = balloon.x;
                const balloonCenterY = balloon.y;
                
                const distance = Math.sqrt(
                    Math.pow(gazeX - balloonCenterX, 2) + Math.pow(gazeY - balloonCenterY, 2)
                );
                
                // Debug logging for collision detection
                console.log(`Balloon ${balloon.id}: gaze(${gazeX}, ${gazeY}), balloon(${balloonCenterX}, ${balloonCenterY}), distance: ${distance}, collisionRadius: ${collisionRadius}`);
                
                if (distance <= collisionRadius) {
                    console.log(`Popping balloon ${balloon.id} at distance ${distance}`);
                    poppedCount++;
                    
                    const poppingBalloon = {
                        ...balloon,
                        isPopping: true,
                        popStartTime: Date.now()
                    };
                    
                    return poppingBalloon;
                }
                return balloon;
            });
            
            if (poppedCount > 0) {
                // Play balloon burst sound for each popped balloon
                for (let i = 0; i < poppedCount; i++) {
                    setTimeout(() => playBalloonBurstSound(), i * 50); // Stagger sounds slightly
                }
                
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
                
                createBalloon();
            }
            
            return remaining;
        });
    }, [createBalloon, playBalloonBurstSound]);

         // Continuous collision detection
     useEffect(() => {
         if (gazeData && gameState === 'game') {
             const gazeX = gazeData.smoothX || gazeData.x;
             const gazeY = gazeData.smoothY || gazeData.y;
             
             if (gazeX && gazeY && !isNaN(gazeX) && !isNaN(gazeY)) {
                 checkBalloonCollision(gazeX, gazeY);
             }
         }
     }, [gazeData, gameState, checkBalloonCollision]);

         const startRound = useCallback(async (roundNumber: number) => {
         console.log(`Starting round ${roundNumber}`);
         
         // Reset all state for fresh start
         if (gameTimerRef.current) {
             clearTimeout(gameTimerRef.current);
             gameTimerRef.current = null;
         }
         
         if (intervalRef.current) {
             clearInterval(intervalRef.current);
             intervalRef.current = null;
         }
         
         setCurrentRound(roundNumber);
         setScore(0);
         setBalloons([]);
         setBalloonsPopped(0);
         setGameTimeLeft(15);
         setGazeData(null);
         setIsGazeAvailable(false);
         setConnectionRetries(0);
         setGazeStatus('Initializing...');
         
         scoreRef.current = 0;
         balloonsPoppedRef.current = 0;
         
         // Always start camera and tracking for first round
         if (roundNumber === 1) {
             console.log('Starting camera for first round...');
             try {
                 await startTracking();
                 console.log('Camera started successfully');
             } catch (error) {
                 console.error('Failed to start camera:', error);
             }
             
             // Show countdown for the first round
             setGameState('countdown');
             setPreGameCountdown(3);
             
             let countdown = 3;
             const preGameCountdownInterval = setInterval(() => {
                 countdown--;
                 setPreGameCountdown(countdown);
                 
                 if (countdown <= 0) {
                     clearInterval(preGameCountdownInterval);
                     // Start gameplay directly here instead of calling startGameplay
                     setGameState('game');
                     setGameStartTime(Date.now());
                     
                     setTimeout(() => createBalloon(), 500);
                     
                     let timeLeft = 15;
                     setGameTimeLeft(timeLeft);
                     
                     gameTimerRef.current = setInterval(() => {
                         timeLeft--;
                         setGameTimeLeft(timeLeft);
                         
                         if (timeLeft <= 0) {
                             if (gameTimerRef.current) {
                                 clearInterval(gameTimerRef.current);
                                 gameTimerRef.current = null;
                             }
                             
                             const finalScore = scoreRef.current;
                             const finalBalloons = balloonsPoppedRef.current;
                             
                             const roundResult = {
                                 roundNumber,
                                 score: finalScore,
                                 balloonsPopped: finalBalloons,
                                 accuracy: finalBalloons > 0 ? 100 : 0,
                                 gameTime: 15
                             };
                             
                             setRoundResults(prev => [...prev, roundResult]);
                             
                             if (roundNumber >= totalRounds) {
                                 setGameState('results');
                                 stopTracking();
                             } else {
                                 // Start round transition countdown
                                 setIsRoundTransition(true);
                                 setRoundTransitionCountdown(3);
                                 
                                 let countdown = 3;
                                 const roundTransitionInterval = setInterval(() => {
                                     countdown--;
                                     setRoundTransitionCountdown(countdown);
                                     
                                     if (countdown <= 0) {
                                         clearInterval(roundTransitionInterval);
                                         setIsRoundTransition(false);
                                         startNextRound(roundNumber + 1);
                                     }
                                 }, 1000);
                             }
                         }
                     }, 1000);
                 }
             }, 1000);
         } else {
             // For subsequent rounds, start immediately
             setGameState('game');
             setGameStartTime(Date.now());
             
             setTimeout(() => createBalloon(), 500);
             
             let timeLeft = 15;
             setGameTimeLeft(timeLeft);
             
             gameTimerRef.current = setInterval(() => {
                 timeLeft--;
                 setGameTimeLeft(timeLeft);
                 
                 if (timeLeft <= 0) {
                     if (gameTimerRef.current) {
                         clearInterval(gameTimerRef.current);
                         gameTimerRef.current = null;
                     }
                     
                     const finalScore = scoreRef.current;
                     const finalBalloons = balloonsPoppedRef.current;
                     
                     const roundResult = {
                         roundNumber,
                         score: finalScore,
                         balloonsPopped: finalBalloons,
                         accuracy: finalBalloons > 0 ? 100 : 0,
                         gameTime: 15
                     };
                     
                     setRoundResults(prev => [...prev, roundResult]);
                     
                     if (roundNumber >= totalRounds) {
                         setGameState('results');
                         stopTracking();
                     } else {
                         // Start round transition countdown
                         setIsRoundTransition(true);
                         setRoundTransitionCountdown(3);
                         
                         let countdown = 3;
                         const roundTransitionInterval = setInterval(() => {
                             countdown--;
                             setRoundTransitionCountdown(countdown);
                             
                             if (countdown <= 0) {
                                 clearInterval(roundTransitionInterval);
                                 setIsRoundTransition(false);
                                 startNextRound(roundNumber + 1);
                             }
                         }, 1000);
                     }
                 }
             }, 1000);
         }
     }, [startTracking, totalRounds, createBalloon, stopTracking]);

     // Function to start next round without recursion
     const startNextRound = useCallback((nextRoundNumber: number) => {
         setCurrentRound(nextRoundNumber);
         setScore(0);
         setBalloons([]);
         setBalloonsPopped(0);
         setGameTimeLeft(15);
         
         scoreRef.current = 0;
         balloonsPoppedRef.current = 0;
         
         setGameState('game');
         setGameStartTime(Date.now());
         
         setTimeout(() => createBalloon(), 500);
         
         let timeLeft = 15;
         setGameTimeLeft(timeLeft);
         
         gameTimerRef.current = setInterval(() => {
             timeLeft--;
             setGameTimeLeft(timeLeft);
             
             if (timeLeft <= 0) {
                 if (gameTimerRef.current) {
                     clearInterval(gameTimerRef.current);
                     gameTimerRef.current = null;
                 }
                 
                 const finalScore = scoreRef.current;
                 const finalBalloons = balloonsPoppedRef.current;
                 
                 const roundResult = {
                     roundNumber: nextRoundNumber,
                     score: finalScore,
                     balloonsPopped: finalBalloons,
                     accuracy: finalBalloons > 0 ? 100 : 0,
                     gameTime: 15
                 };
                 
                 setRoundResults(prev => [...prev, roundResult]);
                 
                 if (nextRoundNumber >= totalRounds) {
                     setGameState('results');
                     stopTracking();
                 } else {
                     // Start round transition countdown
                     setIsRoundTransition(true);
                     setRoundTransitionCountdown(3);
                     
                     let countdown = 3;
                     const roundTransitionInterval = setInterval(() => {
                         countdown--;
                         setRoundTransitionCountdown(countdown);
                         
                         if (countdown <= 0) {
                             clearInterval(roundTransitionInterval);
                             setIsRoundTransition(false);
                             startNextRound(nextRoundNumber + 1);
                         }
                     }, 1000);
                 }
             }
         }, 1000);
     }, [totalRounds, createBalloon, stopTracking]);
    
    

    // Progress bar animation
    useEffect(() => {
        if (gameState === 'game' && gameStartTime) {
            const totalTime = 15000;
            
            const progressInterval = setInterval(() => {
                const elapsed = Date.now() - gameStartTime;
                const progress = Math.min((elapsed / totalTime) * 100, 100);
                setProgressValue(progress);
                
                if (progress >= 100) {
                    clearInterval(progressInterval);
                }
            }, 50);
            
            return () => clearInterval(progressInterval);
        } else {
            setProgressValue(0);
        }
    }, [gameState, gameStartTime]);

         // Cleanup on unmount
     useEffect(() => {
         return () => {
             console.log('Component unmounting, cleaning up...');
             if (gameTimerRef.current) {
                 clearInterval(gameTimerRef.current);
             }
             if (intervalRef.current) {
                 clearInterval(intervalRef.current);
             }
             stopTracking();
         };
     }, [stopTracking]);

             // Stop camera when game state changes to results only
    useEffect(() => {
        if (gameState === 'results') {
            console.log('Game ended, stopping camera...');
            if (isTracking) {
                stopTracking();
            }
        }
    }, [gameState, isTracking, stopTracking]);

    // Audio management based on game state
    useEffect(() => {
        if (gameState === 'game') {
            // Start gameplay music when game starts
            startGameplayMusic();
        } else {
            // Stop gameplay music for all other states
            stopGameplayMusic();
        }
    }, [gameState, startGameplayMusic, stopGameplayMusic]);
     
     // Cleanup on unmount
     useEffect(() => {
         return () => {
             console.log('Final cleanup on unmount...');
             if (intervalRef.current) {
                 clearInterval(intervalRef.current);
                 intervalRef.current = null;
             }
             if (gameTimerRef.current) {
                 clearTimeout(gameTimerRef.current);
                 gameTimerRef.current = null;
             }
             
             // Stop camera when component unmounts
             if (isTracking) {
                 fetch('http://localhost:8000/stop-camera', { method: 'POST' })
                     .catch(error => console.error('Failed to stop camera on unmount:', error));
             }
         };
     }, [isTracking]);

    // Instructions Screen
    if (currentScreen === 'instructions') {
        return (
            <div className="h-full flex flex-col">
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-8">
                            <div className="text-8xl mb-4 animate-bounce">🎯</div>
                            <h1 className="text-5xl font-playful bg-gradient-to-r from-purple-600 via-pink-500 to-blue-600 bg-clip-text text-transparent mb-4">
                                Eye Gaze Balloon Pop!
                            </h1>
                            <p className="text-2xl font-comic text-muted-foreground">
                                Use your eyes to pop colorful balloons and become a <span className="font-playful text-primary animate-pulse">Gaze Master</span>! 🌟
                            </p>
                        </div>
                        <div className="card-playful border-4 border-primary bg-gradient-to-r from-primary/10 to-secondary/10 p-8 mb-8">
                            <h2 className="text-4xl font-playful text-primary mb-6 text-center">
                                🎯 What's This Game About?
                            </h2>
                            <p className="text-xl text-muted-foreground leading-relaxed font-comic text-center">
                                Eye Gaze Balloon Pop helps you practice controlling your eye movements! 
                                You'll see colorful balloons appear on the screen, and you need to look at them to pop them. 
                                It's like playing a magical eye game! ✨
                            </p>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6 mb-8">
                            <div className="card-playful border-2 border-fun-purple/20 p-6 text-center hover:scale-105 transition-all duration-300">
                                <div className="text-6xl mb-4 animate-bounce">1️⃣</div>
                                <h4 className="text-2xl font-playful text-primary mb-3">Look at Balloons</h4>
                                <p className="text-lg text-muted-foreground font-comic">
                                    Colorful balloons will appear on your screen
                                </p>
                            </div>
                            <div className="card-playful border-2 border-fun-orange/20 p-6 text-center hover:scale-105 transition-all duration-300">
                                <div className="text-6xl mb-4 animate-bounce">2️⃣</div>
                                <h4 className="text-2xl font-playful text-primary mb-3">Pop with Your Eyes</h4>
                                <p className="text-lg text-muted-foreground font-comic">
                                    Look directly at the balloons to make them pop!
                                </p>
                            </div>
                            <div className="card-playful border-2 border-fun-green/20 p-6 text-center hover:scale-105 transition-all duration-300">
                                <div className="text-6xl mb-4 animate-bounce">3️⃣</div>
                                <h4 className="text-2xl font-playful text-primary mb-3">Get Points!</h4>
                                <p className="text-lg text-muted-foreground font-comic">
                                    Each popped balloon gives you points and makes a fun sound!
                                </p>
                            </div>
                            <div className="card-playful border-2 border-fun-yellow/20 p-6 text-center hover:scale-105 transition-all duration-300">
                                <div className="text-6xl mb-4 animate-bounce">4️⃣</div>
                                <h4 className="text-2xl font-playful text-primary mb-3">Play 3 Rounds</h4>
                                <p className="text-lg text-muted-foreground font-comic">
                                    Try to pop as many balloons as you can in 15 seconds per round!
                                </p>
                            </div>
                        </div>
                        <div className="card-playful border-4 border-primary bg-gradient-to-r from-primary/10 to-secondary/10 p-8 mb-8">
                            <h3 className="text-3xl font-playful text-primary mb-6 text-center">Game Features:</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <div className="card-playful border-2 border-fun-purple/20 p-4 text-center hover:scale-105 transition-all duration-300 group">
                                    <div className="text-4xl mb-3 group-hover:animate-bounce">🎈</div>
                                    <div className="text-lg font-playful text-primary mb-2">Colorful Balloons</div>
                                    <div className="text-sm text-muted-foreground font-comic">Beautiful balloons in many colors</div>
                                </div>
                                <div className="card-playful border-2 border-fun-purple/20 p-4 text-center hover:scale-105 transition-all duration-300 group">
                                    <div className="text-4xl mb-3 group-hover:animate-bounce">🎯</div>
                                    <div className="text-lg font-playful text-primary mb-2">Eye Tracking</div>
                                    <div className="text-sm text-muted-foreground font-comic">Advanced camera technology</div>
                                </div>
                                <div className="card-playful border-2 border-fun-purple/20 p-4 text-center hover:scale-105 transition-all duration-300 group">
                                    <div className="text-4xl mb-3 group-hover:animate-bounce">✨</div>
                                    <div className="text-lg font-playful text-primary mb-2">Pop Effects</div>
                                    <div className="text-sm text-muted-foreground font-comic">Amazing visual effects</div>
                                </div>
                                <div className="card-playful border-2 border-fun-purple/20 p-4 text-center hover:scale-105 transition-all duration-300 group">
                                    <div className="text-4xl mb-3 group-hover:animate-bounce">🏆</div>
                                    <div className="text-lg font-playful text-primary mb-2">Score Tracking</div>
                                    <div className="text-sm text-muted-foreground font-comic">See your progress</div>
                                </div>
                                <div className="card-playful border-2 border-fun-purple/20 p-4 text-center hover:scale-105 transition-all duration-300 group">
                                    <div className="text-4xl mb-3 group-hover:animate-bounce">⚡</div>
                                    <div className="text-lg font-playful text-primary mb-2">Fast Response</div>
                                    <div className="text-sm text-muted-foreground font-comic">Instant balloon popping</div>
                                </div>
                                <div className="card-playful border-2 border-fun-purple/20 p-4 text-center hover:scale-105 transition-all duration-300 group">
                                    <div className="text-4xl mb-3 group-hover:animate-bounce">🎮</div>
                                    <div className="text-lg font-playful text-primary mb-2">Fun Gameplay</div>
                                    <div className="text-sm text-muted-foreground font-comic">Engaging and exciting</div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Achievement Preview */}
                        <div className="card-playful border-4 border-fun-yellow bg-gradient-to-r from-fun-yellow/10 to-fun-orange/10 p-8 mb-8">
                            <h3 className="text-3xl font-playful text-primary mb-6 text-center">🎖️ Achievements You Can Earn:</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="text-center p-4 bg-white/50 rounded-lg border-2 border-fun-yellow/30">
                                    <div className="text-4xl mb-2">👁️</div>
                                    <div className="font-playful text-lg text-primary mb-1">Eye Master</div>
                                    <div className="text-sm text-muted-foreground font-comic">Perfect eye control</div>
                                </div>
                                <div className="text-center p-4 bg-white/50 rounded-lg border-2 border-fun-purple/30">
                                    <div className="text-4xl mb-2">🎯</div>
                                    <div className="font-playful text-lg text-primary mb-1">Target Master</div>
                                    <div className="text-sm text-muted-foreground font-comic">Hit every balloon</div>
                                </div>
                                <div className="text-center p-4 bg-white/50 rounded-lg border-2 border-fun-green/30">
                                    <div className="text-4xl mb-2">⚡</div>
                                    <div className="font-playful text-lg text-primary mb-1">Speed Master</div>
                                    <div className="text-sm text-muted-foreground font-comic">Lightning fast reactions</div>
                                </div>
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
                        
                        {/* Fun Quote */}
                        <div className="mt-8 text-center">
                            <div className="inline-block p-4 bg-gradient-to-r from-fun-purple/20 to-fun-pink/20 rounded-2xl border-2 border-fun-purple/30">
                                <p className="font-comic text-lg text-primary italic">
                                    "You're incredible! Your eyes are like magic wands that make balloons disappear! ✨"
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Consent Screen
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
                                onClick={() => {
                                    setCurrentScreen('game');
                                    startRound(1);
                                }}
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
        );
    }

    if (gameState === 'loading') {
        return (
            <div className="fixed inset-0 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center z-50">
                <div className="text-center">
                    <div className="text-6xl mb-6 animate-bounce">🎈</div>
                    <h1 className="text-3xl font-playful text-blue-600 mb-4">Starting Game...</h1>
                    <p className="text-lg font-comic text-muted-foreground mb-8 max-w-md">
                        Initializing camera and gaze tracking... Get ready to become a <span className="font-playful text-primary animate-pulse">Gaze Master</span>! ✨
                    </p>
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                    <div className="text-sm font-comic text-muted-foreground">
                        🎯 Your eyes are about to become magic wands!
                    </div>
                </div>
            </div>
        );
    }

                           if (gameState === 'results') {
          const totalScore = roundResults.reduce((sum, round) => sum + round.score, 0);
          const totalBalloons = roundResults.reduce((sum, round) => sum + round.balloonsPopped, 0);
          const averageScore = Math.round(totalScore / roundResults.length);
          
          // Determine achievement based on performance
          let achievement = "Eye Explorer";
          let achievementEmoji = "👁️";
          let achievementColor = "text-blue-600";
          let achievementGradient = "from-blue-500 to-cyan-500";
          
          if (totalBalloons >= 15) {
              achievement = "Gaze Master";
              achievementEmoji = "👁️✨";
              achievementColor = "text-purple-600";
              achievementGradient = "from-purple-500 via-pink-500 to-indigo-500";
          } else if (totalBalloons >= 10) {
              achievement = "Eye Champion";
              achievementEmoji = "🎯";
              achievementColor = "text-green-600";
              achievementGradient = "from-green-500 to-emerald-500";
          } else if (totalBalloons >= 5) {
              achievement = "Balloon Popper";
              achievementEmoji = "🎈";
              achievementColor = "text-orange-600";
              achievementGradient = "from-orange-500 to-red-500";
          }
          
          return (
              <div className="h-full bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 flex items-center justify-center p-4 relative overflow-hidden">
                  {/* Animated Background */}
                  <div className="absolute inset-0">
                      {/* Floating Particles */}
                      {[...Array(30)].map((_, i) => (
                          <div
                              key={i}
                              className="absolute w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-float opacity-60"
                              style={{
                                  left: `${Math.random() * 100}%`,
                                  top: `${Math.random() * 100}%`,
                                  animationDelay: `${Math.random() * 10}s`,
                                  animationDuration: `${15 + Math.random() * 20}s`
                              }}
                          />
                      ))}
                      
                      {/* Sparkles */}
                      {[...Array(20)].map((_, i) => (
                          <div
                              key={`sparkle-${i}`}
                              className="absolute w-2 h-2 bg-white rounded-full animate-ping"
                              style={{
                                  left: `${Math.random() * 100}%`,
                                  top: `${Math.random() * 100}%`,
                                  animationDelay: `${Math.random() * 5}s`,
                                  animationDuration: `${2 + Math.random() * 3}s`
                              }}
                          />
                      ))}
                  </div>
                  
                  <div className="bg-white/95 backdrop-blur-md shadow-2xl border-4 border-yellow-300 rounded-3xl p-6 max-w-lg w-full relative z-10">
                      <div className="text-center">
                          {/* Celebration Animation */}
                          <div className="relative mb-4">
                              <div className="text-6xl mb-2 animate-bounce">🎉</div>
                              <div className="absolute -top-1 -right-1 text-2xl animate-bounce" style={{animationDelay: '0.5s'}}>✨</div>
                              <div className="absolute -top-1 -left-1 text-2xl animate-bounce" style={{animationDelay: '1s'}}>🌟</div>
                          </div>
                          
                          <h1 className="text-3xl font-playful bg-gradient-to-r from-yellow-600 via-orange-500 to-red-500 bg-clip-text text-transparent mb-2 animate-pulse">
                              Game Complete!
                          </h1>
                          <p className="text-lg font-comic text-muted-foreground mb-4">
                              You're incredible! Your eye control is amazing! ✨
                          </p>
                          
                          {/* Data Saved Notification */}
                          {dataSaved && (
                              <div className="mb-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl">
                                  <div className="flex items-center justify-center gap-2">
                                      <div className="text-green-600">✅</div>
                                      <span className="text-sm font-comic text-green-700">
                                          Game data saved successfully!
                                      </span>
                                  </div>
                              </div>
                          )}
                          
                          {/* Achievement Display */}
                          <div className="mb-4 p-4 bg-gradient-to-r from-fun-yellow/20 via-fun-orange/20 to-fun-red/20 rounded-2xl border-4 border-yellow-300 relative overflow-hidden">
                              <div className="text-5xl mb-2 animate-bounce">{achievementEmoji}</div>
                              <div className={`text-xl font-playful bg-gradient-to-r ${achievementGradient} bg-clip-text text-transparent font-bold`}>
                                  {achievement}
                              </div>
                              <div className="text-sm font-comic text-muted-foreground mt-1">
                                  {totalBalloons >= 15 ? "🌟 You're absolutely incredible! Your eye control is like magic!" :
                                   totalBalloons >= 10 ? "🎯 Amazing work! You're becoming an eye control expert!" :
                                   totalBalloons >= 5 ? "🎈 Fantastic! You're getting better with every game!" :
                                   "✨ Great effort! Keep practicing and you'll be popping balloons like a pro!"}
                              </div>
                          </div>
                          
                          {/* Stats Grid */}
                          <div className="grid grid-cols-2 gap-4 mb-4">
                              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-3 rounded-2xl border-3 border-green-300 text-center shadow-lg hover:scale-105 transition-transform duration-300">
                                  <div className="text-3xl font-playful bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent font-bold">
                                      {totalScore}
                                  </div>
                                  <div className="text-sm font-comic text-green-700 font-semibold">Total Score</div>
                              </div>
                              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-3 rounded-2xl border-3 border-blue-300 text-center shadow-lg hover:scale-105 transition-transform duration-300">
                                  <div className="text-3xl font-playful bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent font-bold">
                                      {totalBalloons}
                                  </div>
                                  <div className="text-sm font-comic text-blue-700 font-semibold">Balloons Popped</div>
                              </div>
                          </div>
                          
                          {/* Round Summary */}
                          <div className="mb-4 p-3 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 rounded-2xl border-3 border-primary/40">
                              <h3 className="text-sm font-playful text-primary mb-2 font-bold">Round Summary:</h3>
                              <div className="grid grid-cols-3 gap-2">
                                  {roundResults.map((round, index) => (
                                      <div key={index} className="text-center p-2 bg-white/70 rounded-xl border-2 border-primary/30 hover:scale-110 transition-transform duration-300 shadow-md">
                                          <div className="text-xs font-comic text-gray-600 mb-1">Round {round.roundNumber}</div>
                                          <div className="text-sm font-playful text-primary font-bold">
                                              {round.balloonsPopped}
                                          </div>
                                          <div className="text-xs font-comic text-gray-500">balloons</div>
                                      </div>
                                  ))}
                              </div>
                          </div>
                          
                          <button
                              onClick={() => setCurrentScreen('instructions')}
                              className="btn-fun font-comic text-lg py-3 px-6 bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 hover:from-green-600 hover:via-blue-600 hover:to-purple-600 text-white border-3 border-green-300 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 font-bold"
                          >
                              🎮 Play Again! 🎮
                          </button>
                      </div>
                  </div>
              </div>
          );
      }

         return (
         <div className="fixed inset-0 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 z-50 overflow-hidden">
             {/* Enhanced Animated Background */}
             <div className="absolute inset-0 overflow-hidden">
                 {/* Floating Particles */}
                 {[...Array(60)].map((_, i) => (
                     <div
                         key={i}
                         className="absolute w-2 h-2 bg-gradient-to-r from-white/30 to-yellow-300/40 rounded-full animate-float"
                         style={{
                             left: `${Math.random() * 100}%`,
                             top: `${Math.random() * 100}%`,
                             animationDelay: `${Math.random() * 10}s`,
                             animationDuration: `${10 + Math.random() * 20}s`
                         }}
                     />
                 ))}
                 
                 {/* Sparkling Stars */}
                 {[...Array(30)].map((_, i) => (
                     <div
                         key={`sparkle-${i}`}
                         className="absolute w-1 h-1 bg-yellow-300 rounded-full animate-ping"
                         style={{
                             left: `${Math.random() * 100}%`,
                             top: `${Math.random() * 100}%`,
                             animationDelay: `${Math.random() * 5}s`,
                             animationDuration: `${2 + Math.random() * 3}s`
                         }}
                     />
                 ))}
                 
                 {/* Floating Balloon Decorations */}
                 {[...Array(12)].map((_, i) => (
                     <div
                         key={`deco-${i}`}
                         className="absolute w-6 h-6 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full animate-bounce opacity-40"
                         style={{
                             left: `${5 + (i * 8)}%`,
                             top: `${15 + (i * 6)}%`,
                             animationDelay: `${i * 0.3}s`,
                             animationDuration: '3s'
                         }}
                     />
                 ))}
                 
                 {/* Rainbow Orbs */}
                 {[...Array(6)].map((_, i) => (
                     <div
                         key={`orb-${i}`}
                         className="absolute w-4 h-4 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full animate-pulse opacity-30"
                         style={{
                             left: `${20 + (i * 15)}%`,
                             top: `${30 + (i * 10)}%`,
                             animationDelay: `${i * 0.5}s`,
                             animationDuration: '4s'
                         }}
                     />
                 ))}
             </div>
            {/* Exit Button */}
            <button
                onClick={() => navigate('/games/gaze-tracking')}
                className="absolute top-4 right-4 z-60 bg-red-500 hover:bg-red-600 text-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110"
                title="Exit Game"
            >
                ✕
            </button>

            {/* Game UI Overlay */}
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
                                                 <div className={`flex items-center space-x-2 px-3 py-1 rounded-full min-w-[140px] ${
                             isGazeAvailable 
                                 ? 'bg-gradient-to-r from-green-100 to-emerald-100 border border-green-300' 
                                 : 'bg-gradient-to-r from-red-100 to-pink-100 border border-red-300'
                         }`}>
                             <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                                 isGazeAvailable ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                             }`}></div>
                             <div className={`text-sm font-semibold truncate ${
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
                                        progressValue < 33 ? 'bg-gradient-to-r from-emerald-400 to-green-500' :
                                        progressValue < 66 ? 'bg-gradient-to-r from-amber-400 to-orange-500' :
                                        'bg-gradient-to-r from-rose-400 to-red-500'
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

                                                   {/* Pre-Game Countdown */}
              {gameState === 'countdown' && (
                  <div className="absolute inset-0 flex items-center justify-center z-50">
                      {/* Clean Background */}
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600">
                          <div className="absolute inset-0 bg-black/10"></div>
                      </div>
                      
                      {/* Main Countdown Container */}
                      <div className="relative z-10 flex flex-col items-center">
                          {/* Simple Countdown Circle */}
                          <div className="relative mb-8">
                              <div className="w-40 h-40 bg-white rounded-full flex items-center justify-center shadow-2xl border-4 border-blue-300">
                                  <div className="text-8xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                      {preGameCountdown}
                                  </div>
                              </div>
                              
                              {/* Simple Ring Animation */}
                              <div className="absolute inset-0 w-40 h-40 border-4 border-white/30 rounded-full animate-ping"></div>
                          </div>
                          
                          {/* Clean Text Content */}
                          <div className="text-center space-y-4 max-w-md">
                              <div className="text-3xl font-bold text-white">
                                  Get Ready!
                              </div>
                              
                              <div className="space-y-2">
                                  <div className="text-lg text-white/90 font-medium">
                                      🎯 Look at the screen
                                  </div>
                                  <div className="text-base text-white/70">
                                      Camera is warming up...
                                  </div>
                              </div>
                              
                              {/* Simple Progress Bar */}
                              <div className="w-64 bg-white/20 rounded-full h-2 overflow-hidden">
                                  <div 
                                      className="h-2 bg-white rounded-full transition-all duration-1000 ease-out"
                                      style={{ width: `${((3 - preGameCountdown) / 3) * 100}%` }}
                                  />
                              </div>
                          </div>
                      </div>
                  </div>
                           )}

                                                                                                               {/* Round Transition Countdown */}
                {isRoundTransition && (
                    <>
                        {/* Blurred Gameplay Background */}
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-purple-100 blur-sm z-40"></div>
                        
                        {/* Overlay */}
                        <div className="absolute inset-0 bg-black/20 z-50"></div>
                        
                        {/* Countdown Content */}
                        <div className="absolute inset-0 flex items-center justify-center z-50">
                            <div className="relative">
                                {/* Minimal Countdown Container */}
                                <div className="relative">
                                    {/* Simple Countdown Circle */}
                                    <div className="w-36 h-36 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-2xl">
                                        <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-lg border-4 border-blue-300">
                                            {/* Countdown Number */}
                                            <div className="text-7xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                                {roundTransitionCountdown}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Simple Ring Animation */}
                                    <div className="absolute inset-0 w-36 h-36 border-4 border-white/40 rounded-full animate-ping"></div>
                                </div>
                                
                                {/* Simple Text */}
                                <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 text-center">
                                    <div className="text-2xl font-bold text-white">
                                        Round {currentRound + 1} Starting!
                                    </div>
                                    <div className="text-base text-white/80 mt-1">
                                        Get ready! 🎯
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}

             {/* Game Elements */}
            {gameState === 'game' && (
                <>
                                                              {/* Sharp Laser Weapon */}
                      <div 
                          className="absolute pointer-events-none z-40 transition-all duration-75 ease-out"
                          style={{
                              left: `${gazeData ? (gazeData.smoothX || gazeData.x) : window.innerWidth / 2}px`,
                              top: `${gazeData ? (gazeData.smoothY || gazeData.y) : window.innerHeight / 2}px`,
                              transform: 'translate(-50%, -50%)',
                              willChange: 'transform, left, top',
                              backfaceVisibility: 'hidden',
                              perspective: '1000px',
                          }}
                      >

                          

                                                     {/* Red Crosshair Target */}
                           <div className="relative">
                               {/* Outer Ring */}
                               <div className="w-24 h-24 border-4 border-red-500 rounded-full shadow-lg animate-pulse" />
                               
                               {/* Inner Ring */}
                               <div className="absolute top-3 left-3 w-18 h-18 border-2 border-red-400 rounded-full" />
                               
                               {/* Center Dot */}
                               <div className="absolute top-9 left-9 w-6 h-6 bg-red-600 rounded-full border-2 border-white shadow-lg animate-ping" />
                               
                               {/* Crosshair Lines */}
                               <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1 h-24 bg-red-500 rounded-full" />
                               <div className="absolute top-1/2 left-0 transform -translate-y-1/2 w-24 h-1 bg-red-500 rounded-full" />
                               
                               {/* Corner Notches */}
                               <div className="absolute -top-1 -left-1 w-4 h-4 border-l-2 border-t-2 border-red-500 rounded-tl-lg" />
                               <div className="absolute -top-1 -right-1 w-4 h-4 border-r-2 border-t-2 border-red-500 rounded-tr-lg" />
                               <div className="absolute -bottom-1 -left-1 w-4 h-4 border-l-2 border-b-2 border-red-500 rounded-bl-lg" />
                               <div className="absolute -bottom-1 -right-1 w-4 h-4 border-r-2 border-b-2 border-red-500 rounded-br-lg" />
                           </div>
                          
                                                     {/* Glowing Effect */}
                           <div className="absolute inset-0 w-32 h-32 bg-gradient-to-r from-red-600/30 to-red-500/30 rounded-full animate-pulse blur-sm" />
                           
                           {/* Targeting Dots */}
                           {[...Array(4)].map((_, i) => (
                               <div
                                   key={i}
                                   className="absolute w-3 h-3 bg-red-400 rounded-full animate-ping"
                                   style={{
                                       left: '50%',
                                       top: '50%',
                                       transform: `translate(-50%, -50%) translate(${Math.cos(i * Math.PI / 2) * 50}px, ${Math.sin(i * Math.PI / 2) * 50}px)`,
                                       animationDelay: `${i * 0.15}s`,
                                   }}
                               />
                           ))}
                          
                                                     {/* Aiming Lines */}
                           <div className="absolute top-12 left-1/2 transform -translate-x-1/2 w-0.5 h-8 bg-gradient-to-b from-red-500 to-transparent" />
                           <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 w-0.5 h-8 bg-gradient-to-t from-red-500 to-transparent" />
                           <div className="absolute left-12 top-1/2 transform -translate-y-1/2 w-8 h-0.5 bg-gradient-to-r from-red-500 to-transparent" />
                           <div className="absolute right-12 top-1/2 transform -translate-y-1/2 w-8 h-0.5 bg-gradient-to-l from-red-500 to-transparent" />
                      </div>
                    
                                                              {/* Realistic Balloons */}
                      {balloons.map(balloon => {
                          const isPopping = balloon.isPopping;
                          const popProgress = isPopping && balloon.popStartTime 
                              ? Math.min(1, (Date.now() - balloon.popStartTime) / 1000) 
                              : 0;
                          
                          return (
                              <div
                                  key={balloon.id}
                                  className={`absolute pointer-events-none z-30 ${isPopping ? '' : 'animate-float'}`}
                                  style={{
                                      left: `${balloon.x}px`,
                                      top: `${balloon.y}px`,
                                      transform: `translate(-50%, -50%) scale(${isPopping ? 1 + popProgress * 0.3 : 1})`,
                                      opacity: isPopping ? 1 - popProgress : 1,
                                      transition: isPopping ? 'all 0.2s ease-out' : 'none',
                                      animationDelay: `${balloon.id % 1000}ms`,
                                  }}
                              >

                                  

                                  {/* Balloon Body - Simple Circular Shape */}
                                  <div
                                      className="relative"
                                      style={{
                                          width: `${balloon.size}px`,
                                          height: `${balloon.size}px`,
                                      }}
                                  >
                                      {/* Balloon Glow Effect */}
                                      <div
                                          className="absolute inset-0 rounded-full animate-pulse"
                                          style={{
                                              background: `radial-gradient(ellipse at 25% 25%, ${balloon.color}40, transparent 70%)`,
                                              filter: 'blur(8px)',
                                              transform: 'scale(1.1)',
                                          }}
                                      />
                                      {/* Main Balloon */}
                                      <div
                                          className="absolute inset-0 rounded-full"
                                          style={{
                                              background: `radial-gradient(ellipse at 25% 25%, ${balloon.color}ff, ${balloon.color}dd 40%, ${balloon.color}88 70%, ${balloon.color}66)`,
                                              boxShadow: `
                                                  inset -6px -6px 12px rgba(0,0,0,0.4),
                                                  inset 6px 6px 12px rgba(255,255,255,0.5),
                                                  0 8px 20px rgba(0,0,0,0.3),
                                                  0 0 0 2px ${balloon.color}88,
                                                  0 0 20px ${balloon.color}66
                                              `,
                                              borderRadius: '50%',
                                          }}
                                      />
                                      

                                      
                                      {/* Enhanced Shimmer Highlight */}
                                      <div
                                          className="absolute rounded-full bg-gradient-to-br from-white/90 via-white/40 to-transparent"
                                          style={{
                                              width: `${balloon.size * 0.35}px`,
                                              height: `${balloon.size * 0.35}px`,
                                              top: `${balloon.size * 0.15}px`,
                                              left: `${balloon.size * 0.15}px`,
                                              borderRadius: '50%',
                                              filter: 'blur(0.5px)',
                                          }}
                                      />
                                      
                                      {/* Secondary Shimmer */}
                                      <div
                                          className="absolute rounded-full bg-gradient-to-br from-white/60 via-white/20 to-transparent"
                                          style={{
                                              width: `${balloon.size * 0.2}px`,
                                              height: `${balloon.size * 0.2}px`,
                                              top: `${balloon.size * 0.25}px`,
                                              left: `${balloon.size * 0.3}px`,
                                              borderRadius: '50%',
                                              filter: 'blur(0.3px)',
                                          }}
                                      />
                                      
                                      {/* Balloon String */}
                                      <div
                                          className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-16 bg-gradient-to-b from-gray-400 to-gray-600"
                                          style={{
                                              background: `linear-gradient(to bottom, ${balloon.color}88, ${balloon.color}66, #666)`,
                                              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                          }}
                                      />
                                      
                                      {/* String Loop */}
                                      <div
                                          className="absolute bottom-16 left-1/2 transform -translate-x-1/2 w-2 h-2 border-2 border-gray-500 rounded-full"
                                          style={{
                                              borderColor: `${balloon.color}88`,
                                              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                          }}
                                      />
                                      
                                      {/* String Decoration */}
                                      <div
                                          className="absolute bottom-20 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full animate-pulse"
                                          style={{
                                              boxShadow: '0 0 8px rgba(255,193,7,0.6)',
                                          }}
                                      />
                                      
                                      {/* Additional Balloon Decorations */}
                                      <div
                                          className="absolute top-2 right-2 w-3 h-3 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full animate-bounce"
                                          style={{
                                              animationDelay: '0.5s',
                                              boxShadow: '0 0 6px rgba(236,72,153,0.6)',
                                          }}
                                      />
                                      
                                      <div
                                          className="absolute top-8 left-4 w-2 h-2 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full animate-ping"
                                          style={{
                                              animationDelay: '1s',
                                              boxShadow: '0 0 4px rgba(34,211,238,0.6)',
                                          }}
                                      />
                                  </div>
                                  
                                  {/* Enhanced Pop Animation */}
                                  
                                  {/* Floating Particles around balloon */}
                                  {[...Array(6)].map((_, i) => (
                                      <div
                                          key={`particle-${i}`}
                                          className="absolute w-2 h-2 bg-gradient-to-r from-yellow-300 to-orange-400 rounded-full animate-ping"
                                          style={{
                                              left: '50%',
                                              top: '50%',
                                              transform: `translate(-50%, -50%) translate(${Math.cos(i * Math.PI / 3) * (balloon.size * 0.8)}px, ${Math.sin(i * Math.PI / 3) * (balloon.size * 0.8)}px)`,
                                              animationDelay: `${i * 0.1}s`,
                                              opacity: 0.7,
                                          }}
                                      />
                                  ))}
                                  
                                  {/* Pop Animation */}
                                  {isPopping && (
                                      <>
                                          {/* Pop Sound Wave */}
                                          <div
                                              className="absolute rounded-full animate-ping"
                                              style={{
                                                  left: `${balloon.size * 0.5}px`,
                                                  top: `${balloon.size * 0.5}px`,
                                                  width: `${balloon.size * 2 * popProgress}px`,
                                                  height: `${balloon.size * 2 * popProgress}px`,
                                                  transform: 'translate(-50%, -50%)',
                                                  background: `radial-gradient(circle, ${balloon.color}40, transparent)`,
                                                  opacity: 1 - popProgress * 0.8,
                                              }}
                                          />
                                          
                                          {/* Balloon Pieces */}
                                          {[...Array(8)].map((_, i) => (
                                              <div
                                                  key={i}
                                                  className="absolute w-3 h-3 rounded-full animate-ping"
                                                  style={{
                                                      left: `${balloon.size * 0.5}px`,
                                                      top: `${balloon.size * 0.5}px`,
                                                      transform: `translate(-50%, -50%) translate(${Math.cos(i * Math.PI / 4) * 80 * popProgress}px, ${Math.sin(i * Math.PI / 4) * 80 * popProgress}px)`,
                                                      background: `radial-gradient(circle, ${balloon.color}, ${balloon.color}dd)`,
                                                      opacity: 1 - popProgress,
                                                      animationDelay: `${i * 0.1}s`,
                                                  }}
                                              />
                                          ))}
                                          
                                          {/* Confetti */}
                                          {[...Array(12)].map((_, i) => (
                                              <div
                                                  key={`confetti-${i}`}
                                                  className="absolute w-2 h-2 animate-ping"
                                                  style={{
                                                      left: `${balloon.size * 0.5}px`,
                                                      top: `${balloon.size * 0.5}px`,
                                                      transform: `translate(-50%, -50%) translate(${Math.cos(i * Math.PI / 6) * 60 * popProgress}px, ${Math.sin(i * Math.PI / 6) * 60 * popProgress}px)`,
                                                      background: `linear-gradient(45deg, ${balloon.color}, ${balloon.color}dd)`,
                                                      opacity: 1 - popProgress,
                                                      animationDelay: `${i * 0.05}s`,
                                                      borderRadius: '2px',
                                                  }}
                                              />
                                          ))}
                                      </>
                                  )}
                              </div>
                          );
                      })}
                </>
            )}
        </div>
    );
};

export default GazeTrackingGamePlayPage;
