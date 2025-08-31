import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getCurrentChild } from '@/utils/childUtils';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Line,
    LineChart,
    PolarAngleAxis,
    PolarGrid,
    PolarRadiusAxis,
    Radar,
    RadarChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';

interface RepeatWithMeGameRecord {
  id: number;
  sessionId: string;
  dateTime: string;
  childId: string;
  age: number;
  round1Count: number;
  round2Count: number;
  round3Count: number;
  round4Count: number;
  round5Count: number;
  averageScore: number;
  isTrainingAllowed: boolean;
  suspectedASD: boolean;
  isASD?: boolean;
}

interface ChildStatistics {
  totalGames: number;
  averageScores: Record<string, number>;
  roundCompletionCounts: Record<string, number>;
  daysSinceLastGame?: number;
}

interface SessionData {
  sessionId: string;
  dateTime: string;
  totalScore: number;
  completedRounds: number;
  accuracy: number;
  sessionNumber: number;
  roundScores?: Record<string, number | null>;
}

const COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9', '#F8C471'
];

const ROUND_NAMES = [
  'Round 1 🎤', 'Round 2 🎤', 'Round 3 🎤', 'Round 4 🎤', 'Round 5 🎤'
];

export default function RepeatWithMeGameInsights() {
  const navigate = useNavigate();
  const { childId } = useParams<{ childId: string }>();
  const [selectedChild, setSelectedChild] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState<ChildStatistics | null>(null);
  const [sessionData, setSessionData] = useState<SessionData[]>([]);
  const [gameHistory, setGameHistory] = useState<RepeatWithMeGameRecord[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    const childData = getCurrentChild();
    if (childData) {
      setSelectedChild(childData);
      loadStatistics(childData.id);
      loadSessionData(childData.id);
      loadGameHistory(childData.id);
    }
  }, []);

  const loadStatistics = async (childId: string) => {
    setLoading(true);
    console.log('Loading statistics for childId:', childId);
    
    // Mock data for demo - will be replaced with real backend integration
    setTimeout(() => {
      setStatistics({
        totalGames: 3,
        averageScores: { 'Round 1': 85, 'Round 2': 92, 'Round 3': 78, 'Round 4': 88, 'Round 5': 95 },
        roundCompletionCounts: { 'Round 1': 1, 'Round 2': 1, 'Round 3': 1, 'Round 4': 1, 'Round 5': 1 },
        daysSinceLastGame: 2
      });
      setLoading(false);
    }, 1000);
  };

  const loadSessionData = async (childId: string) => {
    // Mock data for demo - will be replaced with real backend integration
    setTimeout(() => {
      const mockData: SessionData[] = [
        {
          sessionId: 'session-1',
          dateTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          totalScore: 87.6,
          completedRounds: 5,
          accuracy: 87.6,
          sessionNumber: 1,
          roundScores: {
            'Round 1': 85,
            'Round 2': 92,
            'Round 3': 78,
            'Round 4': 88,
            'Round 5': 95
          }
        },
        {
          sessionId: 'session-2',
          dateTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          totalScore: 82.4,
          completedRounds: 5,
          accuracy: 82.4,
          sessionNumber: 2,
          roundScores: {
            'Round 1': 80,
            'Round 2': 85,
            'Round 3': 75,
            'Round 4': 82,
            'Round 5': 90
          }
        },
        {
          sessionId: 'session-3',
          dateTime: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
          totalScore: 78.2,
          completedRounds: 5,
          accuracy: 78.2,
          sessionNumber: 3,
          roundScores: {
            'Round 1': 75,
            'Round 2': 80,
            'Round 3': 70,
            'Round 4': 78,
            'Round 5': 86
          }
        }
      ];
      
      setSessionData(mockData);
    }, 1000);
  };

  const loadGameHistory = async (childId: string, page: number = 0) => {
    // Mock data for demo - will be replaced with real backend integration
    setTimeout(() => {
      const mockHistory: RepeatWithMeGameRecord[] = [
        {
          id: 1,
          sessionId: 'session-1',
          dateTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          childId: childId,
          age: 8,
          round1Count: 85,
          round2Count: 92,
          round3Count: 78,
          round4Count: 88,
          round5Count: 95,
          averageScore: 87.6,
          isTrainingAllowed: true,
          suspectedASD: false,
          isASD: false
        },
        {
          id: 2,
          sessionId: 'session-2',
          dateTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          childId: childId,
          age: 8,
          round1Count: 80,
          round2Count: 85,
          round3Count: 75,
          round4Count: 82,
          round5Count: 90,
          averageScore: 82.4,
          isTrainingAllowed: true,
          suspectedASD: false,
          isASD: false
        },
        {
          id: 3,
          sessionId: 'session-3',
          dateTime: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
          childId: childId,
          age: 8,
          round1Count: 75,
          round2Count: 80,
          round3Count: 70,
          round4Count: 78,
          round5Count: 86,
          averageScore: 78.2,
          isTrainingAllowed: true,
          suspectedASD: false,
          isASD: false
        }
      ];
      
      setGameHistory(mockHistory);
      setTotalPages(1);
      setTotalElements(3);
      setCurrentPage(page);
    }, 1000);
  };

  const getRoundScore = (record: RepeatWithMeGameRecord, roundName: string) => {
    switch (roundName) {
      case 'Round 1 🎤': return record.round1Count;
      case 'Round 2 🎤': return record.round2Count;
      case 'Round 3 🎤': return record.round3Count;
      case 'Round 4 🎤': return record.round4Count;
      case 'Round 5 🎤': return record.round5Count;
      default: return 0;
    }
  };

  const hasData = gameHistory.length > 0;
  const performanceData = sessionData.map((session, index) => ({
    session: `Session ${session.sessionNumber}`,
    averageScore: session.accuracy
  }));

  if (loading) {
    return (
      <div className="min-h-screen bg-soft font-nunito">
        <Navbar />
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex items-center justify-center h-64">
            <div className="loading-spinner"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-soft font-nunito">
      <Navbar />
      
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-playful text-transparent bg-clip-text bg-gradient-to-r from-pink-600 via-red-500 to-orange-600 mb-4">
            🎤 Repeat with Me - Performance Insights
          </h1>
          <p className="text-xl font-comic text-gray-600">
            Track your Bengali speech recognition progress and improvement
          </p>
          
          {selectedChild && (
            <div className="mt-4">
              <span className="inline-block bg-gradient-to-r from-pink-100 to-red-100 text-pink-800 px-4 py-2 rounded-full font-comic">
                Viewing insights for: {selectedChild.name}
              </span>
            </div>
          )}
        </div>

        {/* No Data State */}
        {!hasData && (
          <Card className="card-playful backdrop-blur-sm bg-white/90 border-2 border-pink-200 shadow-xl">
            <CardContent className="p-12 text-center">
              <div className="text-8xl mb-6 animate-bounce">🎤</div>
              <h2 className="text-3xl font-playful text-primary mb-4">
                Ready to Start Your Journey?
              </h2>
              <p className="text-lg font-comic text-muted-foreground mb-8 max-w-md mx-auto">
                {selectedChild?.name || 'You'} haven't played the Repeat with Me Game yet. 
                Start playing to unlock amazing insights and track your progress!
              </p>
              <Button 
                onClick={() => navigate('/games/repeat-with-me')}
                className="bg-gradient-to-r from-pink-500 to-red-600 text-white font-comic text-xl px-12 py-4 hover:scale-105 transition-all shadow-xl rounded-full"
              >
                🚀 Begin Your Adventure!
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Call to Action Section - Right below Hero */}
        {hasData && (
          <Card className="card-playful backdrop-blur-sm bg-gradient-to-br from-pink-50 to-red-50 border-2 border-pink-200 shadow-2xl max-w-md mx-auto">
            <CardContent className="p-4 text-center">
              <div className="text-2xl mb-2 animate-bounce">🎤</div>
              <h3 className="text-lg font-playful text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-red-600 mb-1">
                Ready for Another Challenge?
              </h3>
              <p className="text-xs font-comic text-gray-600 mb-3 max-w-sm mx-auto">
                Keep improving your Bengali speech skills!
              </p>
              <Button 
                onClick={() => navigate('/games/repeat-with-me')}
                className="bg-gradient-to-r from-pink-500 to-red-600 text-white font-comic text-sm px-6 py-2 hover:scale-105 transition-all shadow-xl rounded-full border-2 border-white/20"
              >
                🚀 Play Again!
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Insights Section - Show directly if there's data */}
        {hasData && (
          <div className="space-y-8 mt-16">
            {/* Section Header */}
            <div className="text-center">
              <h2 className="text-4xl font-playful text-transparent bg-clip-text bg-gradient-to-r from-pink-600 via-red-500 to-orange-600 mb-3">
                Your Performance Insights 📊
              </h2>
              <p className="text-xl font-comic text-gray-600">
                Discover your progress and areas for improvement
              </p>
            </div>

            {/* Detailed Insights Tabs */}
            <Tabs defaultValue="overview" className="space-y-8">
              <TabsList className="flex w-full bg-gradient-to-r from-pink-50 to-red-50 backdrop-blur-sm rounded-2xl p-3 shadow-xl border border-pink-200">
                <TabsTrigger value="overview" className="flex-1 py-4 px-6 text-base font-semibold rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-red-600 data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:scale-105 hover:bg-white/50 hover:scale-105 transition-all duration-300">
                  📊 Overview
                </TabsTrigger>
                <TabsTrigger value="performance" className="flex-1 py-4 px-6 text-base font-semibold rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-red-600 data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:scale-105 hover:bg-white/50 hover:scale-105 transition-all duration-300">
                  📈 Performance
                </TabsTrigger>
                <TabsTrigger value="trends" className="flex-1 py-4 px-6 text-base font-semibold rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-red-600 data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:scale-105 hover:bg-white/50 hover:scale-105 transition-all duration-300">
                  📉 Trends
                </TabsTrigger>
                <TabsTrigger value="consistency" className="flex-1 py-4 px-6 text-base font-semibold rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-red-600 data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:scale-105 hover:bg-white/50 hover:scale-105 transition-all duration-300">
                  🎯 Consistency
                </TabsTrigger>
                <TabsTrigger value="history" className="flex-1 py-4 px-6 text-base font-semibold rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-red-600 data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:scale-105 hover:bg-white/50 hover:scale-105 transition-all duration-300">
                  📚 Session History
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-8">
                {/* Hero Stats Section */}
                <div className="relative">
                  {/* Background decorative elements */}
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-100/30 via-red-100/30 to-orange-100/30 rounded-3xl"></div>
                  <div className="absolute top-4 left-4 text-6xl animate-bounce opacity-20">🎤</div>
                  <div className="absolute top-8 right-8 text-4xl animate-float opacity-20">✨</div>
                  <div className="absolute bottom-4 left-1/2 text-5xl animate-pulse-fun opacity-20">🏆</div>
                  
                  <div className="relative bg-gradient-to-br from-white/95 to-white/85 backdrop-blur-sm rounded-3xl border-2 border-pink-200/50 shadow-2xl p-8">
                    <div className="text-center mb-8">
                      <h3 className="text-3xl font-playful text-transparent bg-clip-text bg-gradient-to-r from-pink-600 via-red-600 to-orange-600 mb-2">
                        Your Amazing Progress! 🌟
                      </h3>
                      <p className="text-lg font-comic text-gray-600">
                        Let's see how {selectedChild?.name || 'you'} are doing with Bengali speech recognition!
                      </p>
                    </div>
                    
                    {/* Main Stats Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                      {/* Total Sessions */}
                      <div className="group relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 to-emerald-400/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                        <div className="relative bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border-2 border-green-200 p-6 text-center hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl">
                          <div className="text-4xl mb-3">🎮</div>
                          <div className="text-3xl font-bold text-green-600 mb-2">{statistics?.totalGames || 0}</div>
                          <div className="text-sm text-green-600 font-comic">Total Sessions</div>
                        </div>
                      </div>

                      {/* Average Score */}
                      <div className="group relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                        <div className="relative bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-200 p-6 text-center hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl">
                          <div className="text-4xl mb-3">⭐</div>
                          <div className="text-3xl font-bold text-blue-600 mb-2">
                            {statistics?.averageScores && Object.values(statistics.averageScores).length > 0 
                              ? Math.round(Object.values(statistics.averageScores).reduce((a, b) => a + b, 0) / Object.values(statistics.averageScores).length)
                              : 0}%
                          </div>
                          <div className="text-sm text-blue-600 font-comic">Average Score</div>
                        </div>
                      </div>

                      {/* Best Score */}
                      <div className="group relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                        <div className="relative bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border-2 border-purple-200 p-6 text-center hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl">
                          <div className="text-4xl mb-3">🏆</div>
                          <div className="text-3xl font-bold text-purple-600 mb-2">
                            {gameHistory.length > 0 ? Math.max(...gameHistory.map(g => g.averageScore)) : 0}%
                          </div>
                          <div className="text-sm text-purple-600 font-comic">Best Score</div>
                        </div>
                      </div>

                      {/* Days Since Last Game */}
                      <div className="group relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-400/20 to-red-400/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                        <div className="relative bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl border-2 border-orange-200 p-6 text-center hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl">
                          <div className="text-4xl mb-3">📅</div>
                          <div className="text-3xl font-bold text-orange-600 mb-2">
                            {statistics?.daysSinceLastGame || 0}
                          </div>
                          <div className="text-sm text-orange-600 font-comic">Days Since Last Game</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Performance Tab */}
              <TabsContent value="performance" className="space-y-8">
                <div className="bg-gradient-to-br from-white/95 to-white/85 backdrop-blur-sm rounded-3xl border-2 border-pink-200/50 shadow-2xl p-8">
                  <h3 className="text-2xl font-playful text-primary text-center mb-6">
                    Session-by-Session Performance 📈
                  </h3>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="session" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: '2px solid #ec4899',
                          borderRadius: '12px',
                          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="averageScore"
                        stroke="url(#pinkGradient)"
                        strokeWidth={3}
                        dot={{ fill: '#ec4899', strokeWidth: 2, r: 6 }}
                        activeDot={{ r: 8, stroke: '#ec4899', strokeWidth: 2 }}
                      />
                      <defs>
                        <linearGradient id="pinkGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#ec4899" />
                          <stop offset="100%" stopColor="#dc2626" />
                        </linearGradient>
                      </defs>
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>

              {/* Trends Tab */}
              <TabsContent value="trends" className="space-y-8">
                <div className="bg-gradient-to-br from-white/95 to-white/85 backdrop-blur-sm rounded-3xl border-2 border-pink-200/50 shadow-2xl p-8">
                  <h3 className="text-2xl font-playful text-primary text-center mb-6">
                    Round-by-Round Performance Trends 📊
                  </h3>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={gameHistory.slice().reverse()}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="sessionId" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: '2px solid #ec4899',
                          borderRadius: '12px',
                          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Bar dataKey="round1Count" fill="#FF6B6B" name="Round 1" />
                      <Bar dataKey="round2Count" fill="#4ECDC4" name="Round 2" />
                      <Bar dataKey="round3Count" fill="#45B7D1" name="Round 3" />
                      <Bar dataKey="round4Count" fill="#96CEB4" name="Round 4" />
                      <Bar dataKey="round5Count" fill="#FFEAA7" name="Round 5" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>

              {/* Consistency Tab */}
              <TabsContent value="consistency" className="space-y-8">
                <div className="bg-gradient-to-br from-white/95 to-white/85 backdrop-blur-sm rounded-3xl border-2 border-pink-200/50 shadow-2xl p-8">
                  <h3 className="text-2xl font-playful text-primary text-center mb-6">
                    Round Performance Consistency 🎯
                  </h3>
                  <ResponsiveContainer width="100%" height={400}>
                    <RadarChart data={ROUND_NAMES.map((roundName, index) => {
                      const avgScore = gameHistory.length > 0 
                        ? gameHistory.reduce((sum, record) => sum + getRoundScore(record, roundName), 0) / gameHistory.length
                        : 0;
                      return {
                        round: roundName,
                        score: avgScore,
                        fullMark: 100
                      };
                    })}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="round" tick={{ fontSize: 10 }} />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 12 }} />
                      <Radar
                        name="Average Score"
                        dataKey="score"
                        stroke="#ec4899"
                        fill="#ec4899"
                        fillOpacity={0.3}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: '2px solid #ec4899',
                          borderRadius: '12px',
                          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>

              {/* Session History Tab */}
              <TabsContent value="history" className="space-y-8">
                <div className="bg-gradient-to-br from-white/95 to-white/85 backdrop-blur-sm rounded-3xl border-2 border-pink-200/50 shadow-2xl p-8">
                  <h3 className="text-2xl font-playful text-primary text-center mb-6">
                    Detailed Session History 📚
                  </h3>
                  
                  <div className="space-y-4">
                    {gameHistory.slice().reverse().map((record, index) => {
                      const improvement = index < gameHistory.length - 1 
                        ? record.averageScore - gameHistory[gameHistory.length - 2 - index].averageScore
                        : 0;
                      
                      const cardColor = improvement > 0 
                        ? 'border-green-200 bg-green-50/50' 
                        : improvement < 0 
                        ? 'border-red-200 bg-red-50/50' 
                        : 'border-gray-200 bg-gray-50/50';
                      
                      const improvementText = improvement > 0 
                        ? `+${improvement.toFixed(1)}% improvement` 
                        : improvement < 0 
                        ? `${improvement.toFixed(1)}% decrease` 
                        : 'No change';
                      
                      const improvementColor = improvement > 0 
                        ? 'text-green-600 bg-green-100' 
                        : improvement < 0 
                        ? 'text-red-600 bg-red-100' 
                        : 'text-gray-600 bg-gray-100';
                      
                      return (
                        <Card key={record.id} className={`card-playful border-2 ${cardColor} hover:shadow-lg transition-all duration-300`}>
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-lg text-primary">
                                Session {gameHistory.length - index}
                              </CardTitle>
                              <div className="text-sm text-muted-foreground">
                                {new Date(record.dateTime).toLocaleDateString()}
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {/* Score Overview */}
                            <div className="text-center">
                              <div className="text-3xl font-bold text-primary mb-2">
                                {record.averageScore}%
                              </div>
                              <div className="text-sm text-muted-foreground">Average Score</div>
                            </div>
                            
                            {/* Round Breakdown */}
                            <div className="grid grid-cols-5 gap-2">
                              {[record.round1Count, record.round2Count, record.round3Count, record.round4Count, record.round5Count].map((score, roundIndex) => (
                                <div key={roundIndex} className="text-center">
                                  <div className="text-sm font-medium text-muted-foreground mb-1">
                                    R{roundIndex + 1}
                                  </div>
                                  <div className="text-lg font-bold text-primary">
                                    {score}%
                                  </div>
                                </div>
                              ))}
                            </div>
                            
                            {/* Improvement Badge */}
                            <div className="text-center">
                              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${improvementColor} bg-white/80 border`}>
                                {improvementText}
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                  
                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center space-x-2 mt-6">
                      <Button
                        onClick={() => loadGameHistory(selectedChild.id, currentPage - 1)}
                        disabled={currentPage === 0}
                        variant="outline"
                        size="sm"
                        className="text-xs"
                      >
                        ← Previous
                      </Button>
                      
                      <div className="flex items-center space-x-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i;
                          } else if (currentPage < 3) {
                            pageNum = i;
                          } else if (currentPage >= totalPages - 3) {
                            pageNum = totalPages - 5 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }
                          
                          return (
                            <Button
                              key={pageNum}
                              onClick={() => loadGameHistory(selectedChild.id, pageNum)}
                              variant={currentPage === pageNum ? "default" : "outline"}
                              size="sm"
                              className="text-xs w-8 h-8 p-0"
                            >
                              {pageNum + 1}
                            </Button>
                          );
                        })}
                      </div>
                      
                      <Button
                        onClick={() => loadGameHistory(selectedChild.id, currentPage + 1)}
                        disabled={currentPage === totalPages - 1}
                        variant="outline"
                        size="sm"
                        className="text-xs"
                      >
                        Next →
                      </Button>
                    </div>
                  )}
                  
                  {/* Page Info */}
                  {totalPages > 1 && (
                    <div className="text-center mt-4 text-sm text-gray-600">
                      Page {currentPage + 1} of {totalPages} • Showing {Math.min(5, gameHistory.length)} of {gameHistory.length} sessions
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>

      {/* Loading Spinner Styles */}
      <style>{`
        .loading-spinner {
          width: 50px;
          height: 50px;
          border: 5px solid #f3f3f3;
          border-top: 5px solid #ec4899;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes animate-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes animate-pulse-fun {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.4; }
        }
        
        .animate-float {
          animation: animate-float 3s ease-in-out infinite;
        }
        
        .animate-pulse-fun {
          animation: animate-pulse-fun 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}