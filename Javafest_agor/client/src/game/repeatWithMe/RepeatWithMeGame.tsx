import React, { useEffect, useRef, useState } from "react";
import "./RepeatWithMeGame.css";

const TOTAL_ROUNDS = 5;

interface GameResult {
  target_text: string;
  transcribed_text: string;
  similarity_score: number;
  status: string;
}

type GameState = 'waiting' | 'loading' | 'playing' | 'countdown' | 'recording' | 'finished';

const RepeatWithMeGame: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>('waiting');
  const [round, setRound] = useState(0);
  const [audioFile, setAudioFile] = useState<string | null>(null);
  const [labelText, setLabelText] = useState<string>("");
  const [countdown, setCountdown] = useState<number>(0);
  const [recordingTime, setRecordingTime] = useState<number>(5);
  const [result, setResult] = useState<string>("");
  const [gameResults, setGameResults] = useState<{ [key: number]: GameResult }>({});
  const [isLoading, setIsLoading] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [totfiles, setTotfiles] = useState(0);
  const [fileDetectionError, setFileDetectionError] = useState(false);
  
  // Count total number of files in audio folder by checking each file
  const countFiles = async () => {
    let count = 0;
    let audioNumber = 1;
    const maxCheck = 20; // Maximum number of files to check
    
    console.log('Checking for available audio files...');
    
    try {
      // Try to fetch audio files until we find one that doesn't exist
      while (audioNumber <= maxCheck) {
        try {
          const response = await fetch(`/repeatGame/audio/audio${audioNumber}.mp3`, {
            method: 'HEAD', // Only check headers, don't download the file
            cache: 'no-cache' // Prevent caching issues
          });
          
          console.log(`Checking audio${audioNumber}.mp3 - Status: ${response.status}`);
          
          if (response.ok && response.status === 200) {
            // Check if it's actually an audio file by looking at content type or size
            const contentType = response.headers.get('content-type');
            const contentLength = response.headers.get('content-length');
            
            console.log(`audio${audioNumber}.mp3 headers:`, {
              contentType,
              contentLength,
              allHeaders: Object.fromEntries(response.headers.entries())
            });
            
            // Verify it's an audio file and has some content
            if (contentType && 
                (contentType.includes('audio') || contentType.includes('audio/mpeg') || contentType.includes('audio/mp3')) && 
                contentLength && parseInt(contentLength) > 1000) {
              count++;
              console.log(`✅ Valid audio${audioNumber}.mp3 found (${contentType}, ${contentLength} bytes)`);
              audioNumber++;
            } else {
              console.log(`❌ audio${audioNumber}.mp3 exists but is not a valid audio file (${contentType}, ${contentLength} bytes), stopping search`);
              break;
            }
          } else {
            console.log(`❌ No audio${audioNumber}.mp3 found (status: ${response.status}), stopping search`);
            break;
          }
        } catch (error) {
          console.log(`❌ Error checking audio${audioNumber}.mp3:`, error);
          break;
        }
      }
      
      console.log(`🎯 Total valid audio files found: ${count}`);
      setTotfiles(count);
      setFileDetectionError(false);
      
      if (count === 0) {
        setFileDetectionError(true);
      }
    } catch (error) {
      console.error('Error during file detection:', error);
      setFileDetectionError(true);
    }
  };
  
  // Manual override for file count
  const setManualFileCount = (count: number) => {
    setTotfiles(count);
    setFileDetectionError(false);
  };
  
  useEffect(() => {
    countFiles();
  }, []);

  // Pick random audio + matching label
  const loadRound = async () => {
    const randomIndex = Math.floor(Math.random() * totfiles) + 1; // 1 to 8
    const audioPath = `/repeatGame/audio/audio${randomIndex}.mp3`;
    const labelPath = `/repeatGame/label/label${randomIndex}.txt`;
    console.log("audioPath", audioPath);
    console.log("labelPath", labelPath);

    setAudioFile(audioPath);

    try {
      const res = await fetch(labelPath);
      const text = await res.text();
      setLabelText(text.trim());
    } catch (error) {
      console.error('Error loading label:', error);
      setLabelText(`Label ${randomIndex}`);
    }
  };

  // Start the automatic game flow
  const startGameFlow = async () => {
    setGameState('loading');
    await loadRound();
    setGameState('playing');
    
    // Auto-play audio after a brief moment
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.play();
      }
    }, 500);
  };

  // Handle audio ended - start countdown
  const handleAudioEnded = () => {
    console.log('Audio ended, starting countdown');
    setGameState('countdown');
    setCountdown(3);
    
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          setCountdown(0);
          startRecording();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Start recording automatically
  const startRecording = async () => {
    console.log('Starting recording for round', round);
    setGameState('recording');
    setRecordingTime(5);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      mediaRecorderRef.current = new MediaRecorder(stream);

      audioChunks.current = [];
      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        console.log('Recording stopped, sending audio to backend...');
        
        const audioBlob = new Blob(audioChunks.current, { type: "audio/mp3" });
        const formData = new FormData();
        formData.append("file", audioBlob, `round${round}.mp3`);
        formData.append("target_text", labelText);
        formData.append("round_number", round.toString());

        // Send audio to backend
        try {
          fetch("http://localhost:8000/transcribe", {
            method: "POST",
            body: formData,
          }).catch(error => {
            console.error("Error sending audio:", error);
          });
        } catch (err) {
          console.error("Error sending audio:", err);
        }
        
        // Cleanup
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
        mediaRecorderRef.current = null;
        
        // For final round, wait for transcription result before finishing
        if (round < TOTAL_ROUNDS) {
          continueToNextRound();
        } else {
          // This is the final round, wait for transcription result
          waitForFinalRoundResult();
        }
      };

      // Start recording
      mediaRecorderRef.current.start();
      console.log('Recording started for round', round);

      // Record for exactly 5 seconds with accurate countdown
      const recordingStartTime = Date.now();
      const recordingDuration = 5000; // 5 seconds in milliseconds
      
      const recordingTimer = setInterval(() => {
        const elapsed = Date.now() - recordingStartTime;
        const remaining = Math.ceil((recordingDuration - elapsed) / 1000);
        
        if (remaining <= 0) {
          clearInterval(recordingTimer);
          setRecordingTime(0);
          console.log('Recording time complete, stopping recorder');
          
          // Stop recording after exactly 5 seconds
          if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            console.log('Stopping recording after 5 seconds');
            mediaRecorderRef.current.stop();
          }
        } else {
          setRecordingTime(remaining);
        }
      }, 100); // Update every 100ms for smoother countdown
      
    } catch (error) {
      console.error('Error accessing microphone:', error);
      // Continue to next round even if recording fails
      if (round < TOTAL_ROUNDS) {
        continueToNextRound();
      } else {
        finishGame();
      }
    }
  };

  // Continue to next round
  const continueToNextRound = async () => {
    setRound(prev => prev + 1);
    setResult("");
    setCountdown(0);
    setRecordingTime(5);
    await loadRound();
    setGameState('playing');
    
    // Auto-play audio after a brief moment
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.play();
      }
    }, 500);
  };

  // Wait for final round transcription result before finishing
  const waitForFinalRoundResult = () => {
    console.log('Waiting for final round transcription result...');
    setGameState('loading');
    
    // Poll for the final round result every 2 seconds
    const pollInterval = setInterval(async () => {
      try {
        const resultResponse = await fetch(`http://localhost:8000/round-result/${round}`);
        if (resultResponse.ok) {
          const resultData = await resultResponse.json();
          if (resultData.status === "success") {
            clearInterval(pollInterval);
            console.log('Final round result received:', resultData.result);
            finishGame();
          }
        }
      } catch (err) {
        console.error("Error polling for final round result:", err);
      }
    }, 2000);
    
    // Stop polling after 30 seconds and finish anyway
    setTimeout(() => {
      clearInterval(pollInterval);
      console.log('Final round result timeout, finishing game anyway');
      finishGame();
    }, 30000);
  };

  // Finish the game
  const finishGame = async () => {
    setGameState('finished');
    // Wait a moment for all transcriptions to complete, then get results
    setTimeout(async () => {
      await getGameResults();
    }, 3000);
  };

  // Get all game results
  const getGameResults = async () => {
    try {
      const response = await fetch("http://localhost:8000/game-results");
      if (response.ok) {
        const data = await response.json();
        console.log("All game results:", data);
        if (data.status === "success") {
          setGameResults(data.results);
        }
      }
    } catch (err) {
      console.error("Error getting game results:", err);
    }
  };

  // Start game on button click
  const startGame = async () => {
    if (totfiles === 0) {
      alert('No audio files found! Please check the repeatGame/audio folder.');
      return;
    }
    
    setIsLoading(true);
    // Clear previous game results
    await clearGameResults();
    setRound(1);
    setGameResults({});
    setResult("");
    setCountdown(0);
    setRecordingTime(5);
    setIsLoading(false);
    
    // Start the automatic flow
    startGameFlow();
  };

  // Clear game results
  const clearGameResults = async () => {
    try {
      const response = await fetch("http://localhost:8000/clear-game-results", {
        method: "POST"
      });
      if (response.ok) {
        console.log("Game results cleared");
      }
    } catch (err) {
      console.error("Error clearing game results:", err);
    }
  };

  // Calculate average similarity score
  const getAverageScore = () => {
    const scores = Object.values(gameResults).map(r => r.similarity_score);
    if (scores.length === 0) return 0;
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  };

  // Reset game
  const resetGame = () => {
    window.location.reload();
  };

  return (
    <div className="repeat-game-container">
      <h2>🎤 Repeat With Me Game</h2>

      {gameState === 'waiting' && (
        <div className="game-start">
          <p>Listen carefully and repeat what you hear!</p>
          <p>The game will run automatically with 5 rounds.</p>
          
          {totfiles > 0 && (
            <div className="audio-info">
              <p><strong>Audio files detected: {totfiles}</strong></p>
              <p>Each round will randomly select from audio1.mp3 to audio{totfiles}.mp3</p>
            </div>
          )}
          
          {fileDetectionError && (
            <div className="file-detection-error">
              <p><strong>⚠️ Could not automatically detect audio files</strong></p>
              <p>Please manually set the number of audio files you have:</p>
              <div className="manual-input">
                <input 
                  type="number" 
                  min="1" 
                  max="20" 
                  placeholder="Enter number of audio files"
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (value > 0) {
                      setManualFileCount(value);
                    }
                  }}
                />
                <button 
                  onClick={() => countFiles()}
                  className="retry-button"
                >
                  🔄 Retry Detection
                </button>
              </div>
            </div>
          )}
          
          <button onClick={startGame} className="start-button" disabled={totfiles === 0}>
            {totfiles === 0 ? '⏳ No Audio Files' : '▶️ Start Game'}
          </button>
        </div>
      )}

      {gameState === 'loading' && (
        <div className="game-loading">
          <p>Preparing your game...</p>
          <div className="loading-spinner"></div>
        </div>
      )}

      {gameState === 'playing' && (
        <div className="game-playing">
          <h3>Round {round} / {TOTAL_ROUNDS}</h3>
          <p>Listen carefully to: <b>{labelText}</b></p>
          
          <div className="audio-player">
            <audio 
              ref={audioRef} 
              src={audioFile ?? ""} 
              preload="auto"
              onEnded={handleAudioEnded}
            />
            <p>Audio is playing...</p>
          </div>
        </div>
      )}

      {gameState === 'countdown' && (
        <div className="countdown">
          <h2>Get Ready!</h2>
          <div className="countdown-number">{countdown}</div>
          <p>Recording will start in {countdown} second{countdown !== 1 ? 's' : ''}</p>
        </div>
      )}

      {gameState === 'recording' && (
        <div className="recording">
          <h2>Recording...</h2>
          <div className="recording-timer">{recordingTime}s</div>
          <div className="recording-indicator">
            <div className="recording-dot"></div>
            <span>Speak now - repeat what you heard!</span>
          </div>
          <div className="recording-progress">
            <div className="progress-fill" style={{ width: `${((5 - recordingTime) / 5) * 100}%` }}></div>
          </div>
          <p className="recording-hint">You have {recordingTime} second{recordingTime !== 1 ? 's' : ''} left to speak</p>
        </div>
      )}

      {gameState === 'finished' && (
        <div className="game-finished">
          <h2>🎉 Game Finished!</h2>
          
          {Object.keys(gameResults).length === 0 ? (
            <div className="game-loading">
              <p>Collecting your results...</p>
              <div className="loading-spinner"></div>
            </div>
          ) : (
            <>
              <div className="results">
                <div className="result-item">
                  <span>Average Score:</span>
                  <span>{getAverageScore()}%</span>
                </div>
                {Object.entries(gameResults).map(([roundNum, result]) => (
                  <div key={roundNum} className="result-item">
                    <span>Round {roundNum}:</span>
                    <div className="round-details">
                      <div className="target-text">
                        <strong>Target:</strong> "{result.target_text}"
                      </div>
                      <div className="transcribed-text">
                        <strong>Spoken:</strong> "{result.transcribed_text}"
                      </div>
                      <div className="similarity-score">
                        <strong>Score:</strong> {result.similarity_score}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <button onClick={resetGame} className="reset-button">
                Play Again
              </button>
            </>
          )}
        </div>
      )}

      {/* Progress bar */}
      {round > 0 && gameState !== 'waiting' && (
        <div className="game-progress">
          <div className="progress-bar">
            {Array.from({ length: TOTAL_ROUNDS }, (_, index) => (
              <div
                key={index}
                className={`progress-dot ${
                  index + 1 < round ? 'completed' : 
                  index + 1 === round ? 'current' : ''
                }`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RepeatWithMeGame;
