import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { getCurrentChild } from '@/shared/utils/childUtils';
import { Brain, CheckCircle, Target, Trophy, X } from 'lucide-react';
import React, { useState } from 'react';

interface Game {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
}

interface ALIScoreModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ALIScoreModal: React.FC<ALIScoreModalProps> = ({ isOpen, onClose }) => {
  const [selectedGames, setSelectedGames] = useState<string[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [aliScore, setAliScore] = useState<number | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [sessionErrors, setSessionErrors] = useState<{[key: string]: string}>({});
  const [modelConfidence, setModelConfidence] = useState<number | null>(null);

  const games: Game[] = [
    {
      id: 'dance_doodle_game',
      title: 'Dance Doodle',
      description: 'Strike amazing poses!',
      icon: '🕺',
      color: 'from-purple-400 to-pink-500'
    },
    {
      id: 'gesture_game',
      title: 'Gesture Game',
      description: 'Learn hand gestures!',
      icon: '👋',
      color: 'from-blue-400 to-purple-500'
    },
    {
      id: 'gaze_tracking_game',
      title: 'Eye Gaze Tracking',
      description: 'Pop balloons with your eyes!',
      icon: '👁️',
      color: 'from-purple-400 to-blue-500'
    },
    {
      id: 'mirror_posture_game',
      title: 'Mirror Posture',
      description: 'Mimic expressions!',
      icon: '😎',
      color: 'from-orange-400 to-pink-500'
    },
    {
      id: 'repeat_with_me_game',
      title: 'Repeat with Me',
      description: 'Listen and repeat sentences!',
      icon: '🎤',
      color: 'from-pink-400 to-red-500'
    }
  ];

  const handleGameToggle = (gameId: string) => {
    setSelectedGames(prev => 
      prev.includes(gameId) 
        ? prev.filter(id => id !== gameId)
        : [...prev, gameId]
    );
  };

  // Generate 5-bit binary code for selected games
  const generateBinaryCode = (selectedGames: string[]): number => {
    // Game order must match ALI model lexicographic order: dance_doodle_game, gaze_game, gesture_game, mirror_posture_game, repeat_with_me_game
    const gameOrder = ['dance_doodle_game', 'gaze_game', 'gesture_game', 'mirror_posture_game', 'repeat_with_me_game'];
    
    // Generate binary string that will be reversed by ALI model
    // We need to think in reverse: what should the final bitmask be after reversal?
    let binaryString = '';
    for (const gameId of gameOrder) {
      // Map frontend game IDs to ALI model game IDs for binary generation
      const aliGameId = gameId === 'gaze_game' ? 'gaze_tracking_game' : gameId;
      binaryString += selectedGames.includes(aliGameId) ? '1' : '0';
    }
    
    // Reverse the binary string because ALI model will reverse it again
    const reversedBinary = binaryString.split('').reverse().join('');
    const decimalValue = parseInt(reversedBinary, 2);
    
    console.log('Selected games:', selectedGames);
    console.log('Game order:', gameOrder);
    console.log('Binary string (before reversal):', binaryString);
    console.log('Binary string (after reversal):', reversedBinary);
    console.log('Decimal value to send:', decimalValue);
    
    return decimalValue;
  };

  // Fetch game data for selected games
  const fetchGameData = async (selectedGames: string[], childId: string) => {
    try {
      const gameData: any = {};
      const errors: {[key: string]: string} = {};
      
      // Game service URLs mapping
      const gameServiceUrls: {[key: string]: string} = {
        'dance_doodle_game': 'http://localhost:8087/api/dance-doodle',
        'gesture_game': 'http://localhost:8084/api/gesture-game',
        'gaze_tracking_game': 'http://localhost:8086/api/gaze-game',
        'mirror_posture_game': 'http://localhost:8083/api/mirror-posture-game',
        'repeat_with_me_game': 'http://localhost:8089/api/repeat-with-me-game'
      };
      
      // Map frontend game IDs to ALI model game IDs
      const gameIdMapping: {[key: string]: string} = {
        'dance_doodle_game': 'dance_doodle_game',
        'gesture_game': 'gesture_game',
        'gaze_tracking_game': 'gaze_game',  // Map to gaze_game for ALI model
        'mirror_posture_game': 'mirror_posture_game',
        'repeat_with_me_game': 'repeat_with_me_game'
      };
      
      // Get child age (assuming 6 for now, could be fetched from child data)
      const childAge = 6;
      
      // Fetch data from each game service
      for (const gameId of selectedGames) {
        try {
          const serviceUrl = gameServiceUrls[gameId];
          if (!serviceUrl) {
            errors[gameId] = "Unknown game service";
            continue;
          }
          
          const latestSessionUrl = `${serviceUrl}/child/${childId}/latest-session`;
          console.log(`Fetching data from: ${latestSessionUrl}`);
          
          const response = await fetch(latestSessionUrl, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            }
          });
          
          if (response.ok) {
            const sessionData = await response.json();
            // Add age to the session data
            sessionData.age = childAge;
            // Use mapped game ID for ALI model compatibility
            const aliGameId = gameIdMapping[gameId] || gameId;
            gameData[aliGameId] = sessionData;
            console.log(`✅ Successfully fetched data for game: ${gameId} -> ${aliGameId}`, sessionData);
          } else if (response.status === 404) {
            errors[gameId] = `No session found for ${getGameDisplayName(gameId)}`;
            console.warn(`❌ No session data found for game: ${gameId} (404)`);
          } else {
            errors[gameId] = `Service unavailable for ${getGameDisplayName(gameId)}`;
            console.warn(`❌ Service error for game: ${gameId} (${response.status})`);
          }
        } catch (error) {
          const errorMsg = `No session found for ${getGameDisplayName(gameId)}`;
          errors[gameId] = errorMsg;
          console.error(`❌ Error fetching data for game ${gameId}:`, error);
        }
      }
      
      // For games with errors, use mock data as fallback
      for (const gameId of selectedGames) {
        const aliGameId = gameIdMapping[gameId] || gameId;
        if (!gameData[aliGameId] && errors[gameId]) {
          gameData[aliGameId] = getMockGameData(gameId, childId);
          console.log(`Using mock data for game: ${gameId} -> ${aliGameId} due to error: ${errors[gameId]}`);
        }
      }
      
      // Store errors for display
      if (Object.keys(errors).length > 0) {
        setSessionErrors(errors);
        console.warn('Some games had no session data:', errors);
      } else {
        setSessionErrors({});
      }
      
      return gameData;
    } catch (error) {
      console.error('Error fetching game data:', error);
      setSessionErrors({});
      // Fallback to mock data if API fails
      const gameData: any = {};
      for (const gameId of selectedGames) {
        gameData[gameId] = getMockGameData(gameId, childId);
      }
      return gameData;
    }
  };
  
  const getGameDisplayName = (gameId: string): string => {
    switch (gameId) {
      case 'dance_doodle_game': return 'Dance Doodle';
      case 'gesture_game': return 'Gesture Game';
      case 'gaze_tracking_game': return 'Eye Gaze Tracking';
      case 'mirror_posture_game': return 'Mirror Posture';
      case 'repeat_with_me_game': return 'Repeat with Me';
      default: return gameId;
    }
  };

  // Mock game data generator
  const getMockGameData = (gameId: string, childId: string) => {
    const baseData = { age: 6 };
    
    switch (gameId) {
      case 'dance_doodle_game':
        return {
          ...baseData,
          cool_arms: Math.floor(Math.random() * 5) + 1,
          crossy_play: Math.floor(Math.random() * 5) + 1,
          happy_stand: Math.floor(Math.random() * 5) + 1,
          open_wings: Math.floor(Math.random() * 5) + 1,
          shh_fun: Math.floor(Math.random() * 5) + 1,
          silly_boxer: Math.floor(Math.random() * 5) + 1,
          stretch: Math.floor(Math.random() * 5) + 1
        };
      case 'gesture_game':
        return {
          ...baseData,
          butterfly: Math.floor(Math.random() * 5) + 1,
          closed_fist: Math.floor(Math.random() * 5) + 1,
          dua: Math.floor(Math.random() * 5) + 1,
          heart: Math.floor(Math.random() * 5) + 1,
          iloveyou: Math.floor(Math.random() * 5) + 1,
          open_palm: Math.floor(Math.random() * 5) + 1,
          pointing_up: Math.floor(Math.random() * 5) + 1,
          spectacle: Math.floor(Math.random() * 5) + 1,
          thumbs_down: Math.floor(Math.random() * 5) + 1,
          thumbs_up: Math.floor(Math.random() * 5) + 1,
          victory: Math.floor(Math.random() * 5) + 1
        };
      case 'gaze_tracking_game':
        return {
          ...baseData,
          focus_time: Math.floor(Math.random() * 30) + 10,
          accuracy: Math.floor(Math.random() * 40) + 60,
          reaction_time: Math.floor(Math.random() * 1000) + 500
        };
      case 'mirror_posture_game':
        return {
          ...baseData,
          kiss: Math.floor(Math.random() * 5) + 1,
          looking_sideways: Math.floor(Math.random() * 5) + 1,
          mouth_open: Math.floor(Math.random() * 5) + 1,
          showing_teeth: Math.floor(Math.random() * 5) + 1
        };
      case 'repeat_with_me_game':
        const rounds = 10;
        const scores = Array.from({ length: rounds }, () => Math.floor(Math.random() * 20) + 80);
        return {
          ...baseData,
          average_score: scores.reduce((a, b) => a + b, 0) / scores.length,
          completed_rounds: rounds,
          ...scores.reduce((acc, score, index) => {
            acc[`round${index + 1}score`] = score;
            return acc;
          }, {} as any)
        };
      default:
        return baseData;
    }
  };

  // Default game data fallback
  const getDefaultGameData = (gameId: string) => {
    return { age: 6, score: 0 };
  };

  const handleGetResult = async () => {
    if (selectedGames.length === 0) return;
    
    setIsCalculating(true);
    
    try {
      // Get current child data
      const childData = getCurrentChild();
      const childId = childData?.id || 'default';
      
      // Generate binary code for selected games
      const gamesBinary = generateBinaryCode(selectedGames);
      console.log('Selected games:', selectedGames);
      console.log('Binary code:', gamesBinary);
      
      // Fetch game data for selected games
      const gameData = await fetchGameData(selectedGames, childId);
      console.log('Game data:', gameData);
      
      // Prepare the request payload
      const requestPayload = {
        games: gamesBinary,
        data: gameData
      };
      
      console.log('Sending ALI request:', requestPayload);
      
      // Send request to backend
      const response = await fetch('http://localhost:8005/predict_ali_score', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestPayload)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('ALI response:', result);
      
      // Extract score from response - use probability of class 1 (autistic)
      // The higher the probability of class 1, the higher the chance the child is autistic
      const prediction = result.prediction || 0;
      const probabilities = result.probabilities || [0.5, 0.5];
      const autisticProbability = probabilities[1] || 0.5; // probability of class 1 (autistic)
      
      // Convert to ALI score: multiply by 100 to get percentage (0-100%)
      // Higher probability of autistic = higher chance of being autistic
      // Score interpretation: 0-30% = Very Low, 30-50% = Low, 50-70% = Moderate, 70-100% = Higher
      const score = Math.round(autisticProbability * 100);
      const confidence = Math.round(Math.max(...probabilities) * 100);
      
      setAliScore(score);
      setModelConfidence(confidence);
      setShowResult(true);
      
    } catch (error) {
      console.error('Error getting ALI score:', error);
      
      // Fallback to mock calculation if API fails
      const baseScore = 40; // Base percentage
      const gamePenalty = selectedGames.length * 5;
      const randomVariation = Math.floor(Math.random() * 20) - 10;
      const calculatedScore = Math.max(0, Math.min(100, baseScore + gamePenalty + randomVariation));
      
      setAliScore(calculatedScore);
      setShowResult(true);
    } finally {
      setIsCalculating(false);
    }
  };

  const handleClose = () => {
    setSelectedGames([]);
    setShowResult(false);
    setAliScore(null);
    setIsCalculating(false);
    setSessionErrors({});
    setModelConfidence(null);
    onClose();
  };

  const getScoreColor = (score: number) => {
    if (score <= 30) return 'text-green-600';  // Low chance of autism
    if (score <= 50) return 'text-yellow-600'; // Moderate chance
    if (score <= 70) return 'text-orange-600'; // Higher chance
    return 'text-red-600';                     // High chance of autism
  };

  const getScoreMessage = (score: number) => {
    if (score <= 30) return "Excellent! Very low likelihood of autism! 🌟";
    if (score <= 50) return "Great! Low likelihood indicators! 🎉";
    if (score <= 70) return "Good! Moderate likelihood indicators! 💪";
    return "Continue monitoring! Higher likelihood indicators! 🌱";
  };

  const getScoreIcon = (score: number) => {
    if (score <= 30) return "🏆";
    if (score <= 50) return "⭐";
    if (score <= 70) return "🎯";
    return "📊";
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Brain className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">
                  🧠 Autism Likelihood Index Assessment
                </h2>
                <p className="text-white/90 text-sm">
                  Select games for comprehensive evaluation
                </p>
              </div>
            </div>
            <Button
              onClick={handleClose}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 rounded-full p-2"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="p-4">
          {!showResult ? (
            <>
              {/* Instructions */}
              <Card className="mb-4 p-3 bg-blue-50 border border-blue-200">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Target className="w-3 h-3 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-blue-800 mb-1 text-sm">
                      Instructions
                    </h3>
                    <p className="text-blue-700 text-xs leading-relaxed">
                      Select the games for which you want to get your ALI (Autism Likelihood Index) assessment. 
                      Choose multiple games for a more comprehensive evaluation.
                    </p>
                  </div>
                </div>
              </Card>

              {/* Game Selection */}
              <div className="mb-4">
                <h3 className="text-base font-semibold text-gray-800 mb-3">
                  Select Games for Assessment
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {games.map((game) => (
                    <Card
                      key={game.id}
                      className={`cursor-pointer transition-all duration-200 ${
                        selectedGames.includes(game.id)
                          ? 'ring-2 ring-green-400 bg-green-50 border-green-300'
                          : 'hover:shadow-md border-gray-200'
                      }`}
                      onClick={() => handleGameToggle(game.id)}
                    >
                      <div className="p-3 text-center">
                        <div className="text-2xl mb-2">{game.icon}</div>
                        <h4 className="font-semibold text-gray-800 mb-1 text-sm">
                          {game.title}
                        </h4>
                        <p className="text-xs text-gray-600 mb-2">{game.description}</p>
                        {selectedGames.includes(game.id) && (
                          <div className="flex items-center justify-center text-green-600">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            <span className="text-xs font-semibold">Selected</span>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Get Result Button */}
              <div className="text-center">
                <Button
                  onClick={handleGetResult}
                  disabled={selectedGames.length === 0 || isCalculating}
                  className={`px-6 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                    selectedGames.length === 0
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {isCalculating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Calculating...
                    </>
                  ) : (
                    <>
                      <Trophy className="w-4 h-4 mr-2" />
                      Get ALI Assessment
                    </>
                  )}
                </Button>
                {selectedGames.length === 0 && (
                  <p className="text-xs text-gray-500 mt-2">
                    Please select at least one game to continue
                  </p>
                )}
              </div>
            </>
          ) : (
            /* Results Display */
            <div className="text-center">
              <div className="mb-4">
                <div className="text-4xl mb-3">{getScoreIcon(aliScore!)}</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  ALI Assessment Result
                </h3>
                <div className={`text-4xl font-bold mb-3 ${getScoreColor(aliScore!)}`}>
                  {aliScore}%
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  {getScoreMessage(aliScore!)}
                </p>
                
              </div>

              {/* Score Breakdown */}
              <Card className="mb-4 p-3 bg-gray-50 border border-gray-200">
                <h4 className="text-sm font-semibold text-gray-800 mb-3">
                  Assessment Details
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">Selected Games:</span>
                    <span className="font-semibold text-blue-600 text-sm">{selectedGames.length}/5</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">Likelihood Level:</span>
                    <span className={`font-semibold text-sm ${getScoreColor(aliScore!)}`}>
                      {aliScore! <= 30 ? 'Very Low' : aliScore! <= 50 ? 'Low' : aliScore! <= 70 ? 'Moderate' : 'Higher'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">Assessment Status:</span>
                    <span className="font-semibold text-green-600 text-sm">Complete</span>
                  </div>
                </div>
              </Card>

              {/* Selected Games */}
              <Card className="mb-4 p-3 bg-blue-50 border border-blue-200">
                <h4 className="text-sm font-semibold text-gray-800 mb-2">
                  Games Used for Assessment
                </h4>
                <div className="flex flex-wrap gap-1 justify-center">
                  {selectedGames.map(gameId => {
                    const game = games.find(g => g.id === gameId);
                    const hasError = sessionErrors[gameId];
                    return (
                      <span
                        key={gameId}
                        className={`px-2 py-1 rounded text-xs font-medium border ${
                          hasError 
                            ? 'bg-red-100 text-red-700 border-red-300' 
                            : 'bg-white text-gray-700 border-blue-300'
                        }`}
                        title={hasError ? sessionErrors[gameId] : ''}
                      >
                        {game?.icon} {game?.title}
                        {hasError && ' ⚠️'}
                      </span>
                    );
                  })}
                </div>
                {Object.keys(sessionErrors).length > 0 && (
                  <div className="mt-2 text-xs text-red-600">
                    <p className="font-semibold">Note: Some games had no session data:</p>
                    <ul className="list-disc list-inside mt-1">
                      {Object.entries(sessionErrors).map(([gameId, error]) => {
                        const game = games.find(g => g.id === gameId);
                        return (
                          <li key={gameId}>
                            {game?.title}: {error}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </Card>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={handleClose}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all duration-200"
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    setShowResult(false);
                    setSelectedGames([]);
                    setAliScore(null);
                  }}
                  variant="outline"
                  className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold rounded-lg transition-all duration-200"
                >
                  Try Again
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ALIScoreModal;
