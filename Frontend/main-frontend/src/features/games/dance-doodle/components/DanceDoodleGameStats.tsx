import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Award, Clock, Star, Target, TrendingDown, TrendingUp, Trophy } from 'lucide-react';
import React from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface DanceRoundStats {
  roundNumber: number;
  poseName: string;
  poseImage: string;
  poseEmoji?: string;
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
  // Safety check for gameSession
  if (!gameSession || !gameSession.rounds) {
    console.error('Invalid game session data:', gameSession);
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
        <div className="bg-white rounded-2xl p-6 max-w-md w-full text-center">
          <h2 className="text-2xl font-playful text-red-600 mb-4">⚠️ Error</h2>
          <p className="text-gray-600 mb-4">Invalid game session data</p>
          <Button onClick={onClose} className="btn-fun font-comic">
            Close
          </Button>
        </div>
      </div>
    );
  }

  // Validate and clean game session data
  const validateAndCleanRounds = (rounds: DanceRoundStats[]): DanceRoundStats[] => {
    const cleanedRounds: DanceRoundStats[] = [];
    const seenRoundNumbers = new Set<number>();
    
    if (!Array.isArray(rounds)) {
      console.warn('Invalid rounds data:', rounds);
      return [];
    }
    
    rounds.forEach(round => {
      // Skip rounds with missing data (but allow failed rounds)
      if (!round || !round.poseName || !round.poseImage) {
        console.warn('Skipping invalid round:', round);
        return;
      }

            
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
  const timePercentageData = gameSessionWithCleanedData.rounds.map((round, index) => {
    const timeTaken = round.completed ? round.timeTaken : ROUND_DURATION;
    const percentage = (timeTaken / ROUND_DURATION) * 100;
    return {
      name: round.poseName,
      percentage: Math.round(percentage),
      timeTaken: timeTaken,
      completed: round.completed,
      color: round.completed ? '#82ca9d' : '#ff6b6b'
    };
  });

  // Calculate performance insights
  const getPerformanceInsight = () => {
    if (completionRate === 100) return { text: "Perfect performance! 🌟", icon: <Star className="text-yellow-500" /> };
    if (completionRate >= 80) return { text: "Excellent work! 🎉", icon: <Trophy className="text-yellow-500" /> };
    if (completionRate >= 60) return { text: "Good job! 👍", icon: <Award className="text-blue-500" /> };
    return { text: "Keep practicing! 💪", icon: <Target className="text-orange-500" /> };
  };

  const performanceInsight = getPerformanceInsight();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-2xl p-6 max-w-6xl w-full max-h-[90vh] overflow-y-auto relative custom-scrollbar">
        {/* Header */}
        <div className="text-center mb-6 pb-4 border-b border-gray-200">
          <h2 className="text-4xl font-playful text-primary mb-2">📊 Dance Pose Performance Report</h2>
          <p className="text-muted-foreground font-comic">Session ID: {gameSession.sessionId}</p>
          <div className="flex justify-center items-center gap-4 mt-2">
            <Badge variant="secondary" className="font-comic">
              <Clock className="w-4 h-4 mr-1" />
              {gameSession.endTime ? Math.round((gameSession.endTime.getTime() - gameSession.startTime.getTime()) / 1000) : 0}s
            </Badge>
            <Badge variant="secondary" className="font-comic">
              <Target className="w-4 h-4 mr-1" />
              Score: {completedRounds.length}/{totalRounds}
            </Badge>
            <Badge variant="secondary" className="font-comic">
              <TrendingUp className="w-4 h-4 mr-1" />
              {completionRate.toFixed(0)}% Success
            </Badge>
          </div>
        </div>

        {/* Performance Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-playful text-green-700 flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                Overall Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-700 mb-1">{completionRate.toFixed(0)}%</div>
                <div className="text-sm text-green-600 font-comic">
                  {completedRounds.length} of {totalRounds} poses completed
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-playful text-blue-700 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Average Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-700 mb-1">{avgCompletionTime.toFixed(1)}s</div>
                <div className="text-sm text-blue-600 font-comic">
                  per completed pose
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-playful text-purple-700 flex items-center gap-2">
                {performanceInsight.icon}
                Performance Insight
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-lg font-bold text-purple-700 mb-1">{performanceInsight.text}</div>
                <div className="text-sm text-purple-600 font-comic">
                  Keep up the great work!
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Bar Chart - Time taken per pose */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-playful text-primary">⏱️ Time Analysis</CardTitle>
              <CardDescription className="font-comic">
                Time taken for each pose (green = completed, red = incomplete)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [name === 'time' ? `${value}s` : value, name === 'time' ? 'Time Taken' : 'Status']}
                    labelFormatter={(label) => `Pose: ${label}`}
                  />
                  <Bar 
                    dataKey="time" 
                    fill="#8884d8"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Pie Chart - Completion rate */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-playful text-primary">🎯 Completion Rate</CardTitle>
              <CardDescription className="font-comic">
                Overall success rate breakdown
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [value, name]} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Time Percentage Pie Chart */}
        <div className="mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-playful text-primary">⏰ Time Percentage Analysis</CardTitle>
              <CardDescription className="font-comic">
                How much time each pose took relative to the full round duration (10 seconds = 100%)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={timePercentageData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage, completed }) => 
                      `${name}\n${percentage}% ${completed ? '✅' : '❌'}`
                    }
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="percentage"
                  >
                    {timePercentageData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value, name) => [`${value}%`, name === 'percentage' ? 'Time Percentage' : name]}
                    labelFormatter={(label) => `Pose: ${label}`}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 text-center">
                <div className="text-sm text-gray-600 font-comic">
                  <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                  Green: Completed poses
                  <span className="inline-block w-3 h-3 bg-red-500 rounded-full ml-4 mr-2"></span>
                  Red: Incomplete poses
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Fastest Pose */}
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardHeader>
              <CardTitle className="text-lg font-playful text-green-700 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Fastest Pose
              </CardTitle>
            </CardHeader>
            <CardContent>
              {fastestPose ? (
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-700 mb-2">{fastestPose.poseName}</div>
                  <div className="text-4xl font-bold text-green-600 mb-2">{fastestPose.timeTaken}s</div>
                  <div className="text-6xl mb-2">{fastestPose.poseEmoji || '💃'}</div>
                  <div className="text-sm text-green-600 font-comic mt-2">Lightning fast! ⚡</div>
                </div>
              ) : (
                <div className="text-center text-gray-500 font-comic">No completed poses</div>
              )}
            </CardContent>
          </Card>

          {/* Slowest Pose */}
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardHeader>
              <CardTitle className="text-lg font-playful text-orange-700 flex items-center gap-2">
                <TrendingDown className="w-5 h-5" />
                Most Challenging
              </CardTitle>
            </CardHeader>
            <CardContent>
              {slowestPose ? (
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-700 mb-2">{slowestPose.poseName}</div>
                  <div className="text-4xl font-bold text-orange-600 mb-2">{slowestPose.timeTaken}s</div>
                  <div className="text-6xl mb-2">{slowestPose.poseEmoji || '💃'}</div>
                  <div className="text-sm text-orange-600 font-comic mt-2">Needs more practice 💪</div>
                </div>
              ) : (
                <div className="text-center text-gray-500 font-comic">No completed poses</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Detailed Round Table */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl font-playful text-primary">📋 Round-by-Round Details</CardTitle>
            <CardDescription className="font-comic">
              Detailed breakdown of each pose attempt
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gradient-to-r from-primary/10 to-secondary/10">
                    <th className="border border-primary p-3 text-left font-playful text-primary">Round</th>
                    <th className="border border-primary p-3 text-left font-playful text-primary">Pose</th>
                    <th className="border border-primary p-3 text-left font-playful text-primary">Emoji</th>
                    <th className="border border-primary p-3 text-left font-playful text-primary">Time Taken</th>
                    <th className="border border-primary p-3 text-left font-playful text-primary">Performance</th>
                    <th className="border border-primary p-3 text-left font-playful text-primary">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {gameSessionWithCleanedData.rounds.map((round, index) => {
                    const isFastest = fastestPose && round.completed && round.timeTaken === fastestPose.timeTaken;
                    const isSlowest = slowestPose && round.completed && round.timeTaken === slowestPose.timeTaken;
                    
                    return (
                      <tr key={index} className="hover:bg-gray-50 transition-colors">
                        <td className="border border-primary p-3 font-bold text-primary">{round.roundNumber}</td>
                        <td className="border border-primary p-3 font-comic">{round.poseName}</td>
                        <td className="border border-primary p-3 text-center">
                          <div className="text-3xl">{round.poseEmoji || '💃'}</div>
                        </td>
                        <td className="border border-primary p-3 font-comic">
                          {round.completed ? `${round.timeTaken}s` : 'Not completed'}
                        </td>
                        <td className="border border-primary p-3">
                          {round.completed && (
                            <div className="flex items-center gap-1">
                              {isFastest && <Badge className="bg-green-100 text-green-800 text-xs">Fastest</Badge>}
                              {isSlowest && <Badge className="bg-orange-100 text-orange-800 text-xs">Slowest</Badge>}
                              {!isFastest && !isSlowest && (
                                <Badge className="bg-blue-100 text-blue-800 text-xs">Average</Badge>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="border border-primary p-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                            round.completed 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {round.completed ? '✅ Completed' : '❌ Failed'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="flex justify-center gap-4 sticky bottom-0 bg-white pt-4 border-t border-gray-200">
          <Button 
            onClick={onClose}
            className="btn-fun font-comic text-lg py-2 bg-secondary hover:bg-secondary/80"
          >
            Close Report
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DanceDoodleGameStats;
