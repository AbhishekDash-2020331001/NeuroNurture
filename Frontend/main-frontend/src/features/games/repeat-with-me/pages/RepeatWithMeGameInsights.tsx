import Navbar from '@/components/common/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getCurrentChild } from '@/shared/utils/childUtils';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
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
  round1Score?: number;
  round2Score?: number;
  round3Score?: number;
  round4Score?: number;
  round5Score?: number;
  round6Score?: number;
  round7Score?: number;
  round8Score?: number;
  round9Score?: number;
  round10Score?: number;
  round11Score?: number;
  round12Score?: number;
  round1TargetText?: string;
  round1TranscribedText?: string;
  round2TargetText?: string;
  round2TranscribedText?: string;
  round3TargetText?: string;
  round3TranscribedText?: string;
  round4TargetText?: string;
  round4TranscribedText?: string;
  round5TargetText?: string;
  round5TranscribedText?: string;
  round6TargetText?: string;
  round6TranscribedText?: string;
  round7TargetText?: string;
  round7TranscribedText?: string;
  round8TargetText?: string;
  round8TranscribedText?: string;
  round9TargetText?: string;
  round9TranscribedText?: string;
  round10TargetText?: string;
  round10TranscribedText?: string;
  round11TargetText?: string;
  round11TranscribedText?: string;
  round12TargetText?: string;
  round12TranscribedText?: string;
  averageScore: number;
  completedRounds: number;
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
  'Round 1 🎤', 'Round 2 🎤', 'Round 3 🎤', 'Round 4 🎤', 'Round 5 🎤',
  'Round 6 🎤', 'Round 7 🎤', 'Round 8 🎤', 'Round 9 🎤', 'Round 10 🎤',
  'Round 11 🎤', 'Round 12 🎤'
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
    
    try {
      const response = await fetch(`http://localhost:8089/api/repeat-with-me-game/child/${childId}/statistics`);
      console.log('Statistics Response:', response.status, response.ok);

      if (response.ok) {
        const statsData = await response.json();
        console.log('Statistics Data:', statsData);
        setStatistics(statsData);
      } else {
        console.error('Statistics API failed:', response.status, response.statusText);
        // Set default data if no records exist
        setStatistics({
          totalGames: 0,
          averageScores: {},
          roundCompletionCounts: {},
          daysSinceLastGame: 0
        });
      }
    } catch (error) {
      console.error('Error loading statistics:', error);
      // Set default data on error
      setStatistics({
        totalGames: 0,
        averageScores: {},
        roundCompletionCounts: {},
        daysSinceLastGame: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const loadSessionData = async (childId: string) => {
    try {
      // Use the regular child endpoint instead of paginated history
      const response = await fetch(`http://localhost:8089/api/repeat-with-me-game/child/${childId}`);
      console.log('Session Data Response:', response.status, response.ok);

      if (response.ok) {
        const sessions = await response.json();
        console.log('Session Data:', sessions);
        
        if (Array.isArray(sessions) && sessions.length > 0) {
          // Process session data for the improvement curve
          const processedSessions = sessions.map((session: any) => {
            const totalScore = session.averageScore || 0;
            const completedRounds = session.completedRounds || 0;
            const accuracy = totalScore; // For speech game, accuracy is the average score
            
            return {
              sessionId: session.sessionId,
              dateTime: session.dateTime,
              totalScore: totalScore,
              completedRounds: completedRounds,
              accuracy: accuracy,
              // Store individual round scores for trends analysis
              roundScores: {
                'Round 1': session.round1Score,
                'Round 2': session.round2Score,
                'Round 3': session.round3Score,
                'Round 4': session.round4Score,
                'Round 5': session.round5Score,
                'Round 6': session.round6Score,
                'Round 7': session.round7Score,
                'Round 8': session.round8Score,
                'Round 9': session.round9Score,
                'Round 10': session.round10Score,
                'Round 11': session.round11Score,
                'Round 12': session.round12Score
              }
            };
          }).sort((a: any, b: any) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime())
          .map((session, index) => ({
            ...session,
            sessionNumber: index + 1
          }));
          
          console.log('Processed Sessions:', processedSessions);
          setSessionData(processedSessions);
        } else {
          console.log('No sessions found or invalid data format');
          setSessionData([]);
        }
      } else {
        console.error('Session API failed:', response.status, response.statusText);
        setSessionData([]);
      }
    } catch (error) {
      console.error('Error loading session data:', error);
      setSessionData([]);
    }
  };

  const loadGameHistory = async (childId: string, page: number = 0) => {
    try {
      const response = await fetch(`http://localhost:8089/api/repeat-with-me-game/child/${childId}/history?page=${page}&size=3`);
      console.log('Game History Response:', response.status, response.ok);

      if (response.ok) {
        const historyData = await response.json();
        console.log('Game History:', historyData);
        console.log('Current page requested:', page);
        
        if (historyData.content && Array.isArray(historyData.content)) {
          console.log('Setting game history with', historyData.content.length, 'items');
          setGameHistory(historyData.content);
          setTotalPages(historyData.totalPages || 0);
          setTotalElements(historyData.totalElements || 0);
          setCurrentPage(page);
        } else {
          console.log('No game history found');
          setGameHistory([]);
          setTotalPages(0);
          setTotalElements(0);
        }
      } else {
        console.error('Game History API failed:', response.status, response.statusText);
        setGameHistory([]);
        setTotalPages(0);
        setTotalElements(0);
      }
    } catch (error) {
      console.error('Error loading game history:', error);
      setGameHistory([]);
      setTotalPages(0);
      setTotalElements(0);
    }
  };

  const getRoundScore = (record: RepeatWithMeGameRecord, roundName: string): number | null => {
    switch (roundName) {
      case 'Round 1 🎤': return record.round1Score || null;
      case 'Round 2 🎤': return record.round2Score || null;
      case 'Round 3 🎤': return record.round3Score || null;
      case 'Round 4 🎤': return record.round4Score || null;
      case 'Round 5 🎤': return record.round5Score || null;
      case 'Round 6 🎤': return record.round6Score || null;
      case 'Round 7 🎤': return record.round7Score || null;
      case 'Round 8 🎤': return record.round8Score || null;
      case 'Round 9 🎤': return record.round9Score || null;
      case 'Round 10 🎤': return record.round10Score || null;
      case 'Round 11 🎤': return record.round11Score || null;
      case 'Round 12 🎤': return record.round12Score || null;
      default: return null;
    }
  };

  const getRoundTargetText = (record: RepeatWithMeGameRecord, roundName: string): string | null => {
    switch (roundName) {
      case 'Round 1 🎤': return record.round1TargetText || null;
      case 'Round 2 🎤': return record.round2TargetText || null;
      case 'Round 3 🎤': return record.round3TargetText || null;
      case 'Round 4 🎤': return record.round4TargetText || null;
      case 'Round 5 🎤': return record.round5TargetText || null;
      case 'Round 6 🎤': return record.round6TargetText || null;
      case 'Round 7 🎤': return record.round7TargetText || null;
      case 'Round 8 🎤': return record.round8TargetText || null;
      case 'Round 9 🎤': return record.round9TargetText || null;
      case 'Round 10 🎤': return record.round10TargetText || null;
      case 'Round 11 🎤': return record.round11TargetText || null;
      case 'Round 12 🎤': return record.round12TargetText || null;
      default: return null;
    }
  };

  const getRoundTranscribedText = (record: RepeatWithMeGameRecord, roundName: string): string | null => {
    switch (roundName) {
      case 'Round 1 🎤': return record.round1TranscribedText || null;
      case 'Round 2 🎤': return record.round2TranscribedText || null;
      case 'Round 3 🎤': return record.round3TranscribedText || null;
      case 'Round 4 🎤': return record.round4TranscribedText || null;
      case 'Round 5 🎤': return record.round5TranscribedText || null;
      case 'Round 6 🎤': return record.round6TranscribedText || null;
      case 'Round 7 🎤': return record.round7TranscribedText || null;
      case 'Round 8 🎤': return record.round8TranscribedText || null;
      case 'Round 9 🎤': return record.round9TranscribedText || null;
      case 'Round 10 🎤': return record.round10TranscribedText || null;
      case 'Round 11 🎤': return record.round11TranscribedText || null;
      case 'Round 12 🎤': return record.round12TranscribedText || null;
      default: return null;
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



              {/* Consistency Tab */}
              <TabsContent value="consistency" className="space-y-8">
                <div className="bg-gradient-to-br from-white/95 to-white/85 backdrop-blur-sm rounded-3xl border-2 border-pink-200/50 shadow-2xl p-8">
                  <h3 className="text-2xl font-playful text-primary text-center mb-4">
                    Round Performance Consistency 🎯
                  </h3>
                  <div className="text-center mb-6">
                    <p className="text-lg font-comic text-gray-600 mb-2">
                      This radar chart shows your average performance across all 12 rounds
                    </p>
                    <p className="text-sm text-gray-500">
                      Each point represents how consistently you perform on that specific round across all your sessions
                    </p>
                  </div>
                  <ResponsiveContainer width="100%" height={400}>
                    <RadarChart data={ROUND_NAMES.map((roundName, index) => {
                      const scores = gameHistory.map(record => getRoundScore(record, roundName)).filter(score => score !== null) as number[];
                      const avgScore = scores.length > 0 
                        ? scores.reduce((sum, score) => sum + score, 0) / scores.length
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
              <TabsContent value="history" className="space-y-6">
                <Card className="card-playful backdrop-blur-sm bg-white/90 border-2 border-pink-200 shadow-xl">
                  <CardHeader className="pb-3">
                    <CardTitle className="font-playful text-xl text-pink-600">Session History 📚</CardTitle>
                    <CardDescription className="font-comic text-base">
                      Detailed speech recognition results with target text, transcribed text, and similarity scores
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {gameHistory.map((record, index) => {
                        const totalScore = ROUND_NAMES.reduce((sum, roundName) => {
                          const score = getRoundScore(record, roundName);
                          return sum + (score !== null ? score : 0);
                        }, 0);
                        const completedRounds = ROUND_NAMES.filter(roundName => {
                          const score = getRoundScore(record, roundName);
                          return score !== null;
                        }).length;
                        const averageScore = completedRounds > 0 ? totalScore / completedRounds : 0;
                        const completionRate = (completedRounds / ROUND_NAMES.length) * 100;
                        const sessionNumber = totalElements - (currentPage * 3 + index);
                        
                        return (
                          <div key={record.id} className="border-2 border-pink-200 rounded-xl p-6 bg-gradient-to-br from-pink-50/50 to-white hover:shadow-lg transition-all duration-300">
                            {/* Session Header */}
                            <div className="flex items-center justify-between mb-4">
                              <div>
                                <div className="font-bold text-pink-700 text-lg">
                                  Session {sessionNumber}
                                </div>
                                <div className="text-sm text-gray-600">
                                  {new Date(record.dateTime).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-2xl font-bold text-pink-600">
                                  {averageScore.toFixed(1)}%
                                </div>
                                <div className="text-sm text-gray-600">
                                  Average Score
                                </div>
                              </div>
                            </div>
                            
                            {/* Session Summary */}
                            <div className="grid grid-cols-3 gap-3 mb-6">
                              <div className="text-center p-3 bg-pink-100 rounded-lg border border-pink-200">
                                <div className="text-lg font-bold text-pink-700">{completedRounds}</div>
                                <div className="text-sm text-pink-600">Rounds Completed</div>
                              </div>
                              <div className="text-center p-3 bg-green-100 rounded-lg border border-green-200">
                                <div className="text-lg font-bold text-green-700">{completionRate.toFixed(0)}%</div>
                                <div className="text-sm text-green-600">Completion Rate</div>
                              </div>
                              <div className="text-center p-3 bg-purple-100 rounded-lg border border-purple-200">
                                <div className="text-lg font-bold text-purple-700">{totalScore.toFixed(1)}%</div>
                                <div className="text-sm text-purple-600">Total Score</div>
                              </div>
                            </div>

                            {/* Detailed Round Breakdown */}
                            <div className="space-y-4">
                              <div className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                <span>🎤</span>
                                Round-by-Round Details
                              </div>
                              <div className="grid grid-cols-1 gap-4">
                                {ROUND_NAMES.map((roundName) => {
                                  const score = getRoundScore(record, roundName);
                                  const targetText = getRoundTargetText(record, roundName);
                                  const transcribedText = getRoundTranscribedText(record, roundName);
                                  const isCompleted = score !== null && targetText && transcribedText;
                                  
                                  if (!isCompleted) return null;
                                  
                                  // Extract round number
                                  const roundNumber = roundName.split(' ')[1];
                                  
                                  return (
                                    <div key={roundName} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
                                      <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                          <span className="text-lg">🎤</span>
                                          <span className="font-semibold text-gray-700">Round {roundNumber}</span>
                                        </div>
                                        <div className={`px-3 py-1 rounded-full text-sm font-bold ${
                                          score >= 80 ? 'bg-green-100 text-green-700 border border-green-300' :
                                          score >= 60 ? 'bg-yellow-100 text-yellow-700 border border-yellow-300' :
                                          'bg-red-100 text-red-700 border border-red-300'
                                        }`}>
                                          {score.toFixed(1)}% Similarity
                                        </div>
                                      </div>
                                      
                                      <div className="space-y-3">
                                        {/* Target Text */}
                                        <div>
                                          <div className="text-sm font-medium text-gray-600 mb-1 flex items-center gap-1">
                                            <span>🎯</span>
                                            Target Text (Bengali)
                                          </div>
                                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                            <div className="text-base font-medium text-blue-800" dir="rtl">
                                              {targetText}
                                            </div>
                                          </div>
                                        </div>
                                        
                                        {/* Transcribed Text */}
                                        <div>
                                          <div className="text-sm font-medium text-gray-600 mb-1 flex items-center gap-1">
                                            <span>🎙️</span>
                                            What You Said (Bengali)
                                          </div>
                                          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                            <div className="text-base font-medium text-green-800" dir="rtl">
                                              {transcribedText}
                                            </div>
                                          </div>
                                        </div>
                                        
                                        {/* Similarity Score Bar */}
                                        <div>
                                          <div className="text-sm font-medium text-gray-600 mb-2 flex items-center gap-1">
                                            <span>📊</span>
                                            Similarity Score
                                          </div>
                                          <div className="w-full bg-gray-200 rounded-full h-3">
                                            <div 
                                              className={`h-3 rounded-full transition-all duration-700 ${
                                                score >= 80 ? 'bg-gradient-to-r from-green-400 to-green-600' :
                                                score >= 60 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                                                'bg-gradient-to-r from-red-400 to-red-600'
                                              }`}
                                              style={{ width: `${Math.min(score, 100)}%` }}
                                            ></div>
                                          </div>
                                          <div className="text-xs text-gray-500 mt-1">
                                            {score >= 80 ? 'Excellent pronunciation! 🌟' :
                                             score >= 60 ? 'Good attempt! Keep practicing! 💪' :
                                             'Keep practicing to improve! 🎯'}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    
                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-center space-x-2 mt-8">
                        <Button
                          onClick={() => loadGameHistory(selectedChild.id, currentPage - 1)}
                          disabled={currentPage === 0}
                          variant="outline"
                          size="sm"
                          className="text-sm px-4 py-2"
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
                                className="text-sm w-10 h-10 p-0"
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
                          className="text-sm px-4 py-2"
                        >
                          Next →
                        </Button>
                      </div>
                    )}
                    
                    {/* Page Info */}
                    {totalPages > 1 && (
                      <div className="text-center mt-4 text-sm text-gray-600">
                        Page {currentPage + 1} of {totalPages} • Showing {gameHistory.length} of {totalElements} sessions
                      </div>
                    )}
                  </CardContent>
                </Card>
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