import React, { useState } from 'react';
import { X, Star, Trophy, Brain, Target, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

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

  const games: Game[] = [
    {
      id: 'gesture',
      title: 'Gesture Game',
      description: 'Learn hand gestures!',
      icon: '👋',
      color: 'from-blue-400 to-purple-500'
    },
    {
      id: 'posture',
      title: 'Mirror Posture',
      description: 'Mimic expressions!',
      icon: '😎',
      color: 'from-orange-400 to-pink-500'
    },
    {
      id: 'gaze',
      title: 'Eye Gaze Tracking',
      description: 'Pop balloons with your eyes!',
      icon: '👁️',
      color: 'from-purple-400 to-blue-500'
    },
    {
      id: 'repeat',
      title: 'Repeat with Me',
      description: 'Listen and repeat Bengali sentences!',
      icon: '🎤',
      color: 'from-pink-400 to-red-500'
    },
    {
      id: 'dance',
      title: 'Dance Doodle',
      description: 'Strike amazing poses!',
      icon: '🕺',
      color: 'from-purple-400 to-pink-500'
    }
  ];

  const handleGameToggle = (gameId: string) => {
    setSelectedGames(prev => 
      prev.includes(gameId) 
        ? prev.filter(id => id !== gameId)
        : [...prev, gameId]
    );
  };

  const handleGetResult = async () => {
    if (selectedGames.length === 0) return;
    
    setIsCalculating(true);
    
    // Simulate API call to calculate ALI score
    setTimeout(() => {
      // Mock calculation based on selected games (lower scores are better)
      const baseScore = 25; // Lower base score
      const gamePenalty = selectedGames.length * 3; // More games = slightly higher score
      const randomVariation = Math.floor(Math.random() * 15) - 5;
      const calculatedScore = Math.max(0, Math.min(50, baseScore + gamePenalty + randomVariation));
      
      setAliScore(calculatedScore);
      setShowResult(true);
      setIsCalculating(false);
    }, 2000);
  };

  const handleClose = () => {
    setSelectedGames([]);
    setShowResult(false);
    setAliScore(null);
    setIsCalculating(false);
    onClose();
  };

  const getScoreColor = (score: number) => {
    if (score <= 15) return 'text-green-600';
    if (score <= 25) return 'text-yellow-600';
    if (score <= 35) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreMessage = (score: number) => {
    if (score <= 15) return "Excellent! Very low likelihood! 🌟";
    if (score <= 25) return "Great! Low likelihood indicators! 🎉";
    if (score <= 35) return "Good! Moderate likelihood indicators! 💪";
    return "Continue monitoring! Higher likelihood indicators! 🌱";
  };

  const getScoreIcon = (score: number) => {
    if (score <= 15) return "🏆";
    if (score <= 25) return "⭐";
    if (score <= 35) return "🎯";
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
                  {aliScore}
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
                      {aliScore! <= 15 ? 'Very Low' : aliScore! <= 25 ? 'Low' : aliScore! <= 35 ? 'Moderate' : 'Higher'}
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
                    return (
                      <span
                        key={gameId}
                        className="px-2 py-1 bg-white rounded text-xs font-medium text-gray-700 border border-blue-300"
                      >
                        {game?.icon} {game?.title}
                      </span>
                    );
                  })}
                </div>
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
