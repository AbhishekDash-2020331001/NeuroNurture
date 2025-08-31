import { Award, Clock, Star, Target, TrendingDown, TrendingUp, Trophy } from 'lucide-react';
import React from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';

interface DanceRoundStats {
  roundNumber: number;
  poseName: string;
  poseEmoji: string;
  timeTaken: number;
  completed: boolean;
}

interface DanceGameSession {
  sessionId: string;
  childId: string;
  startTime: Date;
  endTime?: Date;
  rounds: DanceRoundStats[];
  totalScore: number;
  consentData?: any;
}

interface DanceDoodleGameStatsProps {
  gameSession: DanceGameSession;
  onClose: () => void;
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#ff0000'];

const DanceDoodleGameStats: React.FC<DanceDoodleGameStatsProps> = ({ gameSession, onClose }) => {
  // Validate and clean game session data
  const validateAndCleanRounds = (rounds: DanceRoundStats[]): DanceRoundStats[] => {
    const cleanedRounds: DanceRoundStats[] = [];
    const seenRoundNumbers = new Set<number>();
    
    rounds.forEach(round => {
      // Skip rounds with missing data
      if (!round.poseName || !round.poseEmoji || round.roundNumber <= 0) {
        console.warn('Skipping invalid round:', round);
        return;
      }
      
      // Skip duplicate round numbers
      if (seenRoundNumbers.has(round.roundNumber)) {
        console.warn('Skipping duplicate round number:', round.roundNumber);
        return;
      }
      
      seenRoundNumbers.add(round.roundNumber);
      cleanedRounds.push(round);
    });
    
    // Sort by round number to ensure proper order
    return cleanedRounds.sort((a, b) => a.roundNumber - b.roundNumber);
  };
  
  const cleanedRounds = validateAndCleanRounds(gameSession.rounds);
  const gameSessionWithCleanedData = { ...gameSession, rounds: cleanedRounds };
  
  // Calculate statistics
  const completedRounds = gameSessionWithCleanedData.rounds.filter(round => round.completed);
  const totalRounds = gameSessionWithCleanedData.rounds.length;
  const completionRate = (completedRounds.length / totalRounds) * 100;
  
  // Calculate average completion time
  const avgCompletionTime = completedRounds.length > 0 
    ? completedRounds.reduce((sum, round) => sum + round.timeTaken, 0) / completedRounds.length 
    : 0;

  // Find fastest and slowest poses
  const fastestPose = completedRounds.length > 0 
    ? completedRounds.reduce((fastest, current) => 
        current.timeTaken < fastest.timeTaken ? current : fastest
      )
    : null;

  const slowestPose = completedRounds.length > 0 
    ? completedRounds.reduce((slowest, current) => 
        current.timeTaken > slowest.timeTaken ? current : slowest
      )
    : null;

  // Prepare data for charts
  const barChartData = gameSessionWithCleanedData.rounds.map((round, index) => ({
    name: round.poseName,
    time: round.completed ? round.timeTaken : 10, // 10 seconds for incomplete
    completed: round.completed ? 1 : 0,
    round: round.roundNumber
  }));

  const pieChartData = [
    { name: 'Completed', value: completedRounds.length, color: '#82ca9d' },
    { name: 'Incomplete', value: totalRounds - completedRounds.length, color: '#ff6b6b' }
  ];

  // Calculate time percentage data for pie chart
  const ROUND_DURATION = 10; // seconds
  const totalTime = gameSessionWithCleanedData.rounds.reduce((sum, round) => sum + round.timeTaken, 0);
  const maxPossibleTime = totalRounds * ROUND_DURATION;
  const timeEfficiency = (totalTime / maxPossibleTime) * 100;

  const timeDistributionData = gameSessionWithCleanedData.rounds.map((round, index) => ({
    name: `Round ${round.roundNumber}`,
    value: round.timeTaken,
    color: COLORS[index % COLORS.length]
  }));

  // Performance summary
  const getPerformanceLevel = (completionRate: number) => {
    if (completionRate >= 80) return { level: 'Excellent', color: 'text-green-600', icon: '🌟' };
    if (completionRate >= 60) return { level: 'Good', color: 'text-blue-600', icon: '👍' };
    if (completionRate >= 40) return { level: 'Fair', color: 'text-yellow-600', icon: '👌' };
    return { level: 'Keep Practicing', color: 'text-orange-600', icon: '💪' };
  };

  const performance = getPerformanceLevel(completionRate);

  // Calculate game duration
  const gameDuration = gameSessionWithCleanedData.endTime && gameSessionWithCleanedData.startTime
    ? Math.round((gameSessionWithCleanedData.endTime.getTime() - gameSessionWithCleanedData.startTime.getTime()) / 1000)
    : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-playful mb-2 flex items-center gap-2">
                🕺 Dance Performance Report 💃
              </h1>
              <p className="text-lg font-comic opacity-90">
                {gameSessionWithCleanedData.consentData?.childName}'s Amazing Dance Journey!
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 text-2xl font-bold"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Performance Overview */}
          <Card className="card-playful border-2 border-purple-200">
            <CardHeader>
              <CardTitle className="text-2xl font-playful text-purple-600 flex items-center gap-2">
                <Trophy className="w-8 h-8" />
                Performance Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600">{completedRounds.length}/{totalRounds}</div>
                  <div className="text-sm font-comic text-gray-600">Poses Completed</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-green-100 to-blue-100 rounded-lg">
                  <div className="text-3xl font-bold text-green-600">{Math.round(completionRate)}%</div>
                  <div className="text-sm font-comic text-gray-600">Success Rate</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-lg">
                  <div className="text-3xl font-bold text-orange-600">{avgCompletionTime.toFixed(1)}s</div>
                  <div className="text-sm font-comic text-gray-600">Avg Time</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-pink-100 to-red-100 rounded-lg">
                  <div className="text-3xl font-bold text-pink-600">{gameDuration}s</div>
                  <div className="text-sm font-comic text-gray-600">Total Time</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance Level */}
          <Card className="card-playful border-2 border-green-200">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-6xl mb-4">{performance.icon}</div>
                <h3 className={`text-2xl font-playful mb-2 ${performance.color}`}>
                  Performance Level: {performance.level}
                </h3>
                <p className="font-comic text-gray-600">
                  {completionRate >= 80 ? "Outstanding work! You're a natural dancer!" :
                   completionRate >= 60 ? "Great job! Keep up the excellent dancing!" :
                   completionRate >= 40 ? "Good effort! Practice makes perfect!" :
                   "Keep dancing and you'll improve every time!"}
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Round-by-Round Performance */}
            <Card className="card-playful border-2 border-blue-200">
              <CardHeader>
                <CardTitle className="text-xl font-playful text-blue-600 flex items-center gap-2">
                  <Target className="w-6 h-6" />
                  Round Performance
                </CardTitle>
                <CardDescription className="font-comic">
                  How you did in each dance round
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {gameSessionWithCleanedData.rounds.map((round, index) => (
                    <div key={index} className={`flex items-center justify-between p-3 rounded-lg ${
                      round.completed ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{round.poseEmoji}</span>
                        <div>
                          <div className="font-playful font-bold">{round.poseName}</div>
                          <div className="text-sm font-comic text-gray-600">Round {round.roundNumber}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-bold ${round.completed ? 'text-green-600' : 'text-red-600'}`}>
                          {round.completed ? '✅ Success' : '❌ Timeout'}
                        </div>
                        <div className="text-sm font-comic text-gray-600">
                          {round.timeTaken.toFixed(1)}s
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Time Analysis */}
            <Card className="card-playful border-2 border-orange-200">
              <CardHeader>
                <CardTitle className="text-xl font-playful text-orange-600 flex items-center gap-2">
                  <Clock className="w-6 h-6" />
                  Time Analysis
                </CardTitle>
                <CardDescription className="font-comic">
                  Time taken for each pose
                </CardDescription>
              </CardHeader>
              <CardContent>
                {barChartData.length > 0 && (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={barChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" fontSize={12} />
                      <YAxis fontSize={12} />
                      <Tooltip 
                        formatter={(value, name) => [`${value}s`, name === 'time' ? 'Time Taken' : name]}
                        labelFormatter={(label) => `Pose: ${label}`}
                      />
                      <Bar dataKey="time" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                )}

                {/* Performance Insights */}
                <div className="mt-4 space-y-2">
                  {fastestPose && (
                    <div className="flex items-center gap-2 p-2 bg-green-100 rounded">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-comic">
                        <strong>Fastest:</strong> {fastestPose.poseName} ({fastestPose.timeTaken.toFixed(1)}s)
                      </span>
                    </div>
                  )}
                  {slowestPose && (
                    <div className="flex items-center gap-2 p-2 bg-blue-100 rounded">
                      <TrendingDown className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-comic">
                        <strong>Slowest:</strong> {slowestPose.poseName} ({slowestPose.timeTaken.toFixed(1)}s)
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Completion Rate Chart */}
          <Card className="card-playful border-2 border-green-200">
            <CardHeader>
              <CardTitle className="text-xl font-playful text-green-600 flex items-center gap-2">
                <Award className="w-6 h-6" />
                Success Distribution
              </CardTitle>
              <CardDescription className="font-comic">
                Overall completion rate visualization
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pieChartData.length > 0 && (
                <div className="flex items-center justify-center">
                  <ResponsiveContainer width={300} height={300}>
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={120}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value, name) => [`${value} poses`, name]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Encouragement and Next Steps */}
          <Card className="card-playful border-2 border-pink-200 bg-gradient-to-br from-pink-50 to-purple-50">
            <CardContent className="p-6 text-center">
              <div className="text-4xl mb-4">🎉</div>
              <h3 className="text-2xl font-playful text-pink-600 mb-4">
                Great Dancing, {gameSessionWithCleanedData.consentData?.childName}!
              </h3>
              <p className="font-comic text-gray-700 mb-6">
                {completionRate === 100 ? 
                  "Perfect score! You're an amazing dancer! Every pose was spot on!" :
                  completionRate >= 80 ? 
                  "Fantastic dancing! You nailed most of the poses with style!" :
                  completionRate >= 60 ?
                  "Great job dancing! Keep practicing those poses - you're getting better!" :
                  "Nice effort! Dancing takes practice, and you're on the right track!"
                }
              </p>
              
              <div className="flex justify-center gap-4">
                <Button
                  onClick={onClose}
                  className="btn-fun bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-comic text-lg py-2 px-6"
                >
                  🎮 Play Again
                </Button>
                <Button
                  onClick={() => window.location.href = '/dashboard'}
                  className="btn-fun bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-comic text-lg py-2 px-6"
                >
                  🏠 Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DanceDoodleGameStats;
