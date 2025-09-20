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
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';

interface GazeGameRecord {
  id: number;
  sessionId: string;
  dateTime: string;
  childId: string;
  age: number;
  round1Count: number;
  round2Count: number;
  round3Count: number;
  isTrainingAllowed: boolean;
  suspectedASD: boolean;
  isASD?: boolean;
}

interface ChildStatistics {
  totalGames: number;
  averageBalloonsPerRound: Record<string, number>;
  totalBalloonsPopped: number;
  daysSinceLastGame?: number;
}

interface PerformanceAnalysis {
  bestRound: string;
  worstRound: string;
  consistencyScore: number;
  improvementTrend: number;
}



interface PerformanceSummary {
  bestSession?: number;
  totalBalloons?: number;
  averagePerGame?: number;
}

const COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9', '#F8C471'
];

const ROUND_NAMES = [
  'Round 1 🎈', 'Round 2 🎈', 'Round 3 🎈'
];

export default function GazeGameInsights() {
  const navigate = useNavigate();
  const { childId } = useParams<{ childId: string }>();
  const [selectedChild, setSelectedChild] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState<ChildStatistics | null>(null);
  const [analysis, setAnalysis] = useState<PerformanceAnalysis | null>(null);

  const [summary, setSummary] = useState<PerformanceSummary | null>(null);
  const [gameHistory, setGameHistory] = useState<GazeGameRecord[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    const childData = getCurrentChild();
    console.log('Child data from localStorage:', childData);
    if (childData && childData.id) {
      setSelectedChild(childData);
      loadAllData(childData.id);
    } else {
      console.error('No valid child data found in localStorage');
      setLoading(false);
    }
  }, []);

  const loadAllData = async (childId: string) => {
    setLoading(true);
    console.log('Loading gaze game data for childId:', childId);
    
    // Validate childId
    if (!childId || childId === 'undefined' || childId === 'null') {
      console.error('Invalid childId:', childId);
      setLoading(false);
      return;
    }
    
    try {
      // Fetch data from actual backend endpoints
      const [statsRes, analysisRes, summaryRes, historyRes] = await Promise.all([
        fetch(`http://localhost:8086/api/gaze-game/child/${childId}/statistics`),
        fetch(`http://localhost:8086/api/gaze-game/child/${childId}/performance-analysis`),
        fetch(`http://localhost:8086/api/gaze-game/child/${childId}/performance-summary`),
        fetch(`http://localhost:8086/api/gaze-game/child/${childId}/history?page=0&size=10`)
      ]);

             // We'll calculate trends from actual game history data
       // No mock data - everything comes from the database

      console.log('API Responses:');
      console.log('Stats Response:', statsRes.status, statsRes.ok);
      console.log('Analysis Response:', analysisRes.status, analysisRes.ok);
      console.log('Summary Response:', summaryRes.status, summaryRes.ok);
      console.log('History Response:', historyRes.status, historyRes.ok);

             // Initialize with default data if no records exist
               const defaultStats = {
          totalGames: 0,
          averageBalloonsPerRound: { 'Round 1': 0, 'Round 2': 0, 'Round 3': 0 },
          totalBalloonsPopped: 0,
          daysSinceLastGame: 0
        };

      const defaultAnalysis = {
        bestRound: 'Round 1',
        worstRound: 'Round 1',
        consistencyScore: 0,
        improvementTrend: 0
      };

      const defaultSummary = {
        bestSession: 0,
        totalBalloons: 0,
        averagePerGame: 0
      };

             if (statsRes.ok) {
         const statsData = await statsRes.json();
         console.log('Statistics Data:', statsData);
         console.log('Average Balloons Per Round:', statsData.averageBalloonsPerRound);
         setStatistics(statsData);
       } else {
         console.error('Stats API failed:', statsRes.status, statsRes.statusText);
         setStatistics(defaultStats);
       }
      
      if (analysisRes.ok) {
        const analysisData = await analysisRes.json();
        console.log('Analysis Data:', analysisData);
        setAnalysis(analysisData);
      } else {
        console.error('Analysis API failed:', analysisRes.status, analysisRes.statusText);
        setAnalysis(defaultAnalysis);
      }
      
             if (summaryRes.ok) {
         const summaryData = await summaryRes.json();
         console.log('Summary Data:', summaryData);
         setSummary(summaryData);
       } else {
         console.error('Summary API failed:', summaryRes.status, summaryRes.statusText);
         setSummary(defaultSummary);
       }
       
               // We'll calculate trends from actual data later
        // No mock data needed
      
      if (historyRes.ok) {
        const historyData = await historyRes.json();
        console.log('History Data:', historyData);
        setGameHistory(historyData.content || []);
        setTotalPages(historyData.totalPages || 0);
        setTotalElements(historyData.totalElements || 0);
      } else {
        console.error('History API failed:', historyRes.status, historyRes.statusText);
        setGameHistory([]);
        setTotalPages(0);
        setTotalElements(0);
      }
    } catch (error) {
      console.error('Error loading gaze game data:', error);
             // Set default data on error
               setStatistics({
          totalGames: 0,
          averageBalloonsPerRound: { 'Round 1': 0, 'Round 2': 0, 'Round 3': 0 },
          totalBalloonsPopped: 0,
          daysSinceLastGame: 0
        });
              setAnalysis({
          bestRound: 'Round 1',
          worstRound: 'Round 1',
          consistencyScore: 0,
          improvementTrend: 0
        });
        // Don't set mock trends data - we'll calculate from real data
       setSummary({
         bestSession: 0,
         totalBalloons: 0,
         averagePerGame: 0
       });
      setGameHistory([]);
      setTotalPages(0);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoundCount = (record: GazeGameRecord, roundNumber: number): number => {
    switch (roundNumber) {
      case 0: return record.round1Count;
      case 1: return record.round2Count;
      case 2: return record.round3Count;
      default: return 0;
    }
  };

  const getAverageCount = (roundName: string): number => {
    if (!statistics?.averageBalloonsPerRound) return 0;
    // Extract the round number from the name (e.g., "Round 1 🎈" -> "Round 1")
    const roundKey = roundName.replace(' 🎈', '');
    return statistics.averageBalloonsPerRound[roundKey] || 0;
  };

  // Prepare chart data for session-by-session performance
  const performanceData = gameHistory.map((record, index) => {
    const totalBalloons = record.round1Count + record.round2Count + record.round3Count;
    const sessionNumber = totalElements - index;
    return {
      session: `Session ${sessionNumber}`,
      balloons: totalBalloons,
      color: COLORS[index % COLORS.length]
    };
  }).reverse(); // Show oldest to newest sessions

  // Calculate session-by-session improvement trends
  const calculateTrendsData = () => {
    if (!gameHistory || gameHistory.length === 0) {
      return [];
    }

    // Sort games by date (newest first for proper reverse chronological order)
    const sortedGames = [...gameHistory].sort((a, b) => 
      new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()
    );

    const trends = [];
    
    if (sortedGames.length > 0) {
      // Compare each session with the previous one (newest to oldest)
      for (let i = 0; i < sortedGames.length - 1; i++) {
        const currentSession = sortedGames[i];
        const previousSession = sortedGames[i + 1];
        
        const currentTotal = currentSession.round1Count + currentSession.round2Count + currentSession.round3Count;
        const previousTotal = previousSession.round1Count + previousSession.round2Count + previousSession.round3Count;
        
        // Calculate improvement percentage
        let improvement = '0%';
        if (previousTotal > 0) {
          const improvementValue = ((currentTotal - previousTotal) / previousTotal) * 100;
          improvement = `${improvementValue >= 0 ? '+' : ''}${improvementValue.toFixed(1)}%`;
        } else if (currentTotal > 0) {
          improvement = '+100%'; // First time achieving this score
        }
        
        // Simple session numbering: newest = highest number
        const sessionNumber = sortedGames.length - i;
        
        trends.push({
          session: `Session ${sessionNumber}`,
          currentPerformance: currentTotal,
          previousPerformance: previousTotal,
          improvement: improvement,
          color: COLORS[i % COLORS.length],
          date: formatDateTime(currentSession.dateTime),
          isBaseline: false
        });
      }
      
      // Add baseline session (oldest) at the end
      const baselineSession = sortedGames[sortedGames.length - 1];
      const baselineTotal = baselineSession.round1Count + baselineSession.round2Count + baselineSession.round3Count;
      
      trends.push({
        session: `Session 1`,
        currentPerformance: baselineTotal,
        previousPerformance: 0,
        improvement: 'Baseline',
        color: COLORS[sortedGames.length - 1 % COLORS.length],
        date: formatDateTime(baselineSession.dateTime),
        isBaseline: true
      });
    }

    return trends;
  };

  const trendTableData = calculateTrendsData();



  const loadGameHistory = async (page: number) => {
    try {
      const response = await fetch(`http://localhost:8086/api/gaze-game/child/${selectedChild.id}/history?page=${page}&size=10`);
      if (response.ok) {
        const data = await response.json();
        setGameHistory(data.content || []);
        setTotalPages(data.totalPages || 0);
        setTotalElements(data.totalElements || 0);
        setCurrentPage(page);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-soft font-nunito">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <div className="text-2xl font-playful text-primary">Loading gaze insights... 👁️</div>
        </div>
      </div>
    );
  }

  if (!selectedChild) {
    return (
      <div className="min-h-screen bg-soft font-nunito">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-6xl mb-4 animate-bounce">👶</div>
            <div className="text-2xl font-playful text-primary mb-4">No Child Selected</div>
            <div className="text-lg font-comic text-gray-600 mb-6">
              Please select a child from the dashboard to view their gaze game insights.
            </div>
            <button 
              onClick={() => navigate('/dashboard')}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-comic text-lg px-8 py-3 hover:scale-105 transition-all shadow-xl rounded-full"
            >
              🏠 Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Check if there's any real data
  const hasData = statistics && statistics.totalGames > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 font-nunito relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-20 left-10 text-4xl animate-bounce" style={{ animationDelay: '0s' }}>👁️</div>
        <div className="absolute top-40 right-20 text-3xl animate-float" style={{ animationDelay: '1s' }}>✨</div>
        <div className="absolute bottom-40 left-20 text-3xl animate-wiggle" style={{ animationDelay: '2s' }}>🎯</div>
        <div className="absolute bottom-20 right-10 text-4xl animate-pulse-fun" style={{ animationDelay: '0.5s' }}>🏆</div>
        <div className="absolute top-1/2 left-1/4 text-2xl animate-float" style={{ animationDelay: '1.5s' }}>🌟</div>
        <div className="absolute top-1/3 right-1/3 text-3xl animate-bounce" style={{ animationDelay: '0.8s' }}>🎈</div>
        
        {/* Floating bubbles */}
        <div className="absolute top-1/4 left-1/3 w-4 h-4 bg-blue-200 rounded-full animate-float opacity-60"></div>
        <div className="absolute top-3/4 right-1/4 w-6 h-6 bg-purple-200 rounded-full animate-float opacity-60" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-1/3 left-1/2 w-3 h-3 bg-pink-200 rounded-full animate-float opacity-60" style={{ animationDelay: '2s' }}></div>
      </div>

      <Navbar />
      
      <div className="relative z-10 max-w-7xl mx-auto p-6 space-y-8">
        {/* Hero Section */}
        <div className="text-center py-12">
          <div className="mb-8">
            <h1 className="text-5xl font-playful text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 mb-4">
              Eye Gaze Game Hub 👁️
            </h1>
            <p className="text-xl font-comic text-gray-600 max-w-2xl mx-auto">
              Master eye control with balloon popping fun! Play new games and track your progress.
            </p>
          </div>
        </div>

        {/* No Data Message */}
        {!hasData && (
          <Card className="card-playful backdrop-blur-sm bg-white/90 border-2 border-yellow-200 shadow-xl">
            <CardContent className="p-12 text-center">
              <div className="text-8xl mb-6 animate-bounce">👁️</div>
              <h2 className="text-3xl font-playful text-primary mb-4">
                Ready to Start Your Eye Journey?
              </h2>
              <p className="text-lg font-comic text-muted-foreground mb-8 max-w-md mx-auto">
                {selectedChild.name} hasn't played the Eye Gaze Game yet. 
                Start playing to unlock amazing insights and track your eye control progress!
              </p>
              <Button 
                onClick={() => navigate('/games/gaze-tracking')}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-comic text-xl px-12 py-4 hover:scale-105 transition-all shadow-xl rounded-full"
              >
                🚀 Begin Your Eye Adventure!
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Call to Action Section - Right below Hero */}
        {hasData && (
          <Card className="card-playful backdrop-blur-sm bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 shadow-2xl max-w-md mx-auto">
            <CardContent className="p-4 text-center">
              <div className="text-2xl mb-2 animate-bounce">👁️</div>
              <h3 className="text-lg font-playful text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-1">
                Ready for Another Eye Challenge?
              </h3>
              <p className="text-xs font-comic text-gray-600 mb-3 max-w-sm mx-auto">
                Keep improving your eye control skills!
              </p>
              <Button 
                onClick={() => navigate('/games/gaze-tracking')}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-comic text-sm px-6 py-2 hover:scale-105 transition-all shadow-xl rounded-full border-2 border-white/20"
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
              <h2 className="text-4xl font-playful text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-3">
                Your Eye Control Insights 📊
              </h2>
              <p className="text-xl font-comic text-gray-600">
                Discover your progress and areas for improvement
              </p>
            </div>

            {/* Detailed Insights Tabs */}
            <Tabs defaultValue="overview" className="space-y-8">
                             <TabsList className="flex w-full bg-gradient-to-r from-blue-50 to-purple-50 backdrop-blur-sm rounded-2xl p-3 shadow-xl border border-blue-200">
                 <TabsTrigger value="overview" className="flex-1 py-4 px-6 text-base font-semibold rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:scale-105 hover:bg-white/50 hover:scale-105 transition-all duration-300">
                   📊 Overview
                 </TabsTrigger>
                 <TabsTrigger value="performance" className="flex-1 py-4 px-6 text-base font-semibold rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:scale-105 hover:bg-white/50 hover:scale-105 transition-all duration-300">
                   📈 Performance
                 </TabsTrigger>
                                   <TabsTrigger value="trends" className="flex-1 py-4 px-6 text-base font-semibold rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:scale-105 hover:bg-white/50 hover:scale-105 transition-all duration-300">
                    📈 Improvement
                  </TabsTrigger>
                 
                 <TabsTrigger value="history" className="flex-1 py-4 px-6 text-base font-semibold rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:scale-105 hover:bg-white/50 hover:scale-105 transition-all duration-300">
                   📚 Session History
                 </TabsTrigger>
               </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-8">
                {/* Hero Stats Section */}
                <div className="relative">
                  {/* Background decorative elements */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-100/30 via-purple-100/30 to-pink-100/30 rounded-3xl"></div>
                  <div className="absolute top-4 left-4 text-6xl animate-bounce opacity-20">👁️</div>
                  <div className="absolute top-8 right-8 text-4xl animate-float opacity-20">✨</div>
                  <div className="absolute bottom-4 left-1/2 text-5xl animate-pulse-fun opacity-20">🏆</div>
                  
                  <div className="relative bg-gradient-to-br from-white/95 to-white/85 backdrop-blur-sm rounded-3xl border-2 border-blue-200/50 shadow-2xl p-8">
                    <div className="text-center mb-8">
                      <h3 className="text-3xl font-playful text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 mb-2">
                        Your Amazing Eye Progress! 🌟
                      </h3>
                      <p className="text-lg font-comic text-gray-600">
                        Let's see how {selectedChild.name} is doing with eye control!
                      </p>
                    </div>
                    
                    {/* Main Stats Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                      {/* Total Sessions */}
                      <div className="group relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 to-emerald-400/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                        <div className="relative bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border-2 border-green-200 p-6 text-center hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl">
                          <div className="text-4xl mb-3 animate-bounce">👁️</div>
                          <div className="text-4xl font-bold text-green-600 mb-2">
                            {statistics?.totalGames || 0}
                          </div>
                          <div className="text-sm font-comic text-green-700 font-semibold">
                            Games Played
                          </div>
                          <div className="text-xs text-green-600 mt-1">
                            Keep going! 🚀
                          </div>
                        </div>
                      </div>

                      {/* Total Balloons Popped */}
                      <div className="group relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                        <div className="relative bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-200 p-6 text-center hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl">
                          <div className="text-4xl mb-3 animate-pulse">🎈</div>
                          <div className="text-4xl font-bold text-blue-600 mb-2">
                            {statistics?.totalBalloonsPopped || 0}
                          </div>
                          <div className="text-sm font-comic text-blue-700 font-semibold">
                            Balloons Popped
                          </div>
                          <div className="text-xs text-blue-600 mt-1">
                            Total count
                          </div>
                        </div>
                      </div>

                      {/* Average Per Game */}
                      <div className="group relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                        <div className="relative bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border-2 border-purple-200 p-6 text-center hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl">
                          <div className="text-4xl mb-3 animate-wiggle">🎯</div>
                          <div className="text-4xl font-bold text-purple-600 mb-2">
                            {summary?.averagePerGame?.toFixed(1) || '0.0'}
                          </div>
                          <div className="text-sm font-comic text-purple-700 font-semibold">
                            Avg Per Game
                          </div>
                          <div className="text-xs text-purple-600 mt-1">
                            Balloons per session
                          </div>
                        </div>
                      </div>

                      {/* Best Session */}
                      <div className="group relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/20 to-green-400/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                        <div className="relative bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl border-2 border-emerald-200 p-6 text-center hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl">
                          <div className="text-4xl mb-3 animate-bounce">🏆</div>
                          <div className="text-4xl font-bold text-emerald-600 mb-2">
                            {summary?.bestSession || 0}
                          </div>
                          <div className="text-sm font-comic text-emerald-700 font-semibold">
                            Best Session
                          </div>
                          <div className="text-xs text-emerald-600 mt-1">
                            Balloons in one game
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Motivation Section */}
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-100/30 via-orange-100/30 to-red-100/30 rounded-3xl"></div>
                  <div className="relative bg-gradient-to-br from-yellow-50/90 to-orange-50/90 backdrop-blur-sm rounded-3xl border-2 border-yellow-200/70 shadow-xl p-8">
                    <div className="text-center">
                      <div className="text-6xl mb-4 animate-bounce">🌟</div>
                      <h3 className="text-2xl font-playful text-orange-700 mb-4">
                        Keep Up the Great Eye Work!
                      </h3>
                      <p className="text-lg font-comic text-orange-600 mb-6 max-w-2xl mx-auto">
                        Every practice session makes your eye control better. 
                        You're doing amazing, {selectedChild.name}! 🎉
                      </p>
                      <div className="flex justify-center space-x-4 text-2xl">
                        <span className="animate-float" style={{ animationDelay: '0s' }}>👁️</span>
                        <span className="animate-float" style={{ animationDelay: '0.5s' }}>✨</span>
                        <span className="animate-float" style={{ animationDelay: '1s' }}>🏆</span>
                        <span className="animate-float" style={{ animationDelay: '1.5s' }}>🎯</span>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Performance Tab */}
              <TabsContent value="performance" className="space-y-8">
                {/* Hero Performance Section */}
                <div className="relative">
                  {/* Background decorative elements */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-100/30 via-indigo-100/30 to-purple-100/30 rounded-3xl"></div>
                  <div className="absolute top-4 left-4 text-6xl animate-bounce opacity-20">📊</div>
                  <div className="absolute top-8 right-8 text-4xl animate-float opacity-20">⚡</div>
                  <div className="absolute bottom-4 left-1/2 text-5xl animate-pulse-fun opacity-20">🎯</div>
                  
                  <div className="relative bg-gradient-to-br from-white/95 to-white/85 backdrop-blur-sm rounded-3xl border-2 border-blue-200/50 shadow-2xl p-8">
                    <div className="text-center mb-8">
                      <h3 className="text-3xl font-playful text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 mb-2">
                        Performance Analytics! 📈
                      </h3>
                      <p className="text-lg font-comic text-gray-600">
                        Deep dive into {selectedChild.name}'s eye control mastery!
                      </p>
                    </div>
                  </div>
                </div>

                {/* Round Performance Chart */}
                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                  <div className="relative bg-gradient-to-br from-blue-50/90 to-indigo-50/90 backdrop-blur-sm rounded-3xl border-2 border-blue-200/70 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
                    {/* Decorative elements */}
                    <div className="absolute top-4 right-4 text-6xl opacity-20 animate-float">🎈</div>
                    <div className="absolute bottom-4 left-4 text-4xl opacity-20 animate-pulse">📊</div>
                    
                    <div className="p-8 relative z-10">
                                               <div className="text-center mb-6">
                           <div className="text-5xl mb-4 animate-bounce">📊</div>
                           <h3 className="text-2xl font-playful text-blue-700 mb-2">Session Performance</h3>
                           <p className="text-sm font-comic text-blue-600">
                             Balloons popped per session over time
                           </p>
                         </div>
                      
                                             <div className="bg-white/70 rounded-2xl p-4 border border-blue-200/50">
                         <ResponsiveContainer width="100%" height={300}>
                           <LineChart data={performanceData}>
                             <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                             <XAxis dataKey="session" tick={{ fontSize: 12 }} />
                             <YAxis tick={{ fontSize: 12 }} />
                             <Tooltip 
                               contentStyle={{ 
                                 backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                                 border: '2px solid #3b82f6',
                                 borderRadius: '12px',
                                 boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                               }}
                             />
                             <Line 
                               type="monotone" 
                               dataKey="balloons" 
                               stroke="url(#blueGradient)" 
                               strokeWidth={3}
                               dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6 }}
                               activeDot={{ r: 8, stroke: '#3b82f6', strokeWidth: 2 }}
                             />
                             <defs>
                               <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                                 <stop offset="0%" stopColor="#3b82f6" />
                                 <stop offset="100%" stopColor="#8b5cf6" />
                               </linearGradient>
                             </defs>
                           </LineChart>
                         </ResponsiveContainer>
                       </div>
                    </div>
                  </div>
                                 </div>
               </TabsContent>

               {/* Trends Tab */}
               <TabsContent value="trends" className="space-y-8">
                 {/* Hero Trends Section */}
                 <div className="relative">
                   {/* Background decorative elements */}
                   <div className="absolute inset-0 bg-gradient-to-r from-green-100/30 via-blue-100/30 to-purple-100/30 rounded-3xl"></div>
                   <div className="absolute top-4 left-4 text-6xl animate-bounce opacity-20">📈</div>
                   <div className="absolute top-8 right-8 text-4xl animate-float opacity-20">📊</div>
                   <div className="absolute bottom-4 left-1/2 text-5xl animate-pulse-fun opacity-20">🎯</div>
                   
                   <div className="relative bg-gradient-to-br from-white/95 to-white/85 backdrop-blur-sm rounded-3xl border-2 border-green-200/50 shadow-2xl p-8">
                     <div className="text-center mb-8">
                       <h3 className="text-3xl font-playful text-transparent bg-clip-text bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 mb-2">
                         Performance Trends! 📈
                       </h3>
                       <p className="text-lg font-comic text-gray-600">
                         Track {selectedChild.name}'s improvement over time!
                       </p>
                     </div>
                   </div>
                 </div>

                                   {/* Trends Table */}
                  <div className="group relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-400/10 to-blue-400/10 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                    <div className="relative bg-gradient-to-br from-green-50/90 to-blue-50/90 backdrop-blur-sm rounded-3xl border-2 border-green-200/70 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
                      {/* Decorative elements */}
                      <div className="absolute top-4 right-4 text-6xl opacity-20 animate-float">📈</div>
                      <div className="absolute bottom-4 left-4 text-4xl opacity-20 animate-pulse">📊</div>
                      
                      <div className="p-8 relative z-10">
                                                 <div className="text-center mb-6">
                           <div className="text-5xl mb-4 animate-bounce">📈</div>
                           <h3 className="text-2xl font-playful text-green-700 mb-2">Session Improvement Trends</h3>
                           <p className="text-sm font-comic text-green-600">
                             Session-by-session performance improvement analysis
                           </p>
                         </div>
                        
                                                                   <div className="bg-white/70 rounded-2xl p-4 border border-green-200/50">
                            <div className="space-y-4">
                              {trendTableData.map((item, index) => (
                                <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                                                     {/* Session Header */}
                                   <div className="flex items-center justify-between mb-3">
                                     <div>
                                       <div className="font-bold text-primary text-sm">
                                         {item.session}
                                       </div>
                                       <div className="text-xs text-muted-foreground">
                                         {item.date}
                                       </div>
                                     </div>
                                   </div>
                                  
                                                                                                         {/* Session Summary */}
                                    {item.isBaseline ? (
                                      <div className="text-center p-3 bg-blue-50 rounded border border-blue-200">
                                        <div className="text-sm text-blue-600 mb-1">🎯 Baseline Session</div>
                                        <div className="text-lg font-bold text-blue-700">{item.currentPerformance}</div>
                                        <div className="text-xs text-blue-500">balloons (starting point)</div>
                                      </div>
                                    ) : (
                                      <div className="grid grid-cols-2 gap-2">
                                        <div className="text-center p-2 bg-gray-50 rounded border border-gray-200">
                                          <div className="text-sm font-bold text-gray-600">{item.currentPerformance}</div>
                                          <div className="text-xs text-gray-500">balloons</div>
                                        </div>
                                        <div className={`text-center p-2 rounded border ${
                                          item.improvement.startsWith('+') 
                                            ? 'bg-green-100 border-green-300' 
                                            : item.improvement.startsWith('-')
                                            ? 'bg-red-100 border-red-300'
                                            : 'bg-gray-100 border-gray-300'
                                        }`}>
                                          <div className={`text-sm font-bold ${
                                            item.improvement.startsWith('+') ? 'text-green-700' : 
                                            item.improvement.startsWith('-') ? 'text-red-700' : 'text-gray-700'
                                          }`}>
                                            {item.improvement}
                                          </div>
                                          <div className="text-xs text-gray-500">improvement</div>
                                        </div>
                                      </div>
                                    )}
                                </div>
                              ))}
                            </div>
                            
                            {/* Empty state */}
                            {trendTableData.length === 0 && (
                              <div className="text-center py-12">
                                <div className="text-6xl mb-4 animate-bounce">📊</div>
                                <h3 className="text-xl font-semibold text-gray-600 mb-2">No Trend Data Available</h3>
                                <p className="text-gray-500">Play more sessions to see your improvement trends!</p>
                              </div>
                            )}
                          </div>
                      </div>
                    </div>
                  </div>

                                   
               </TabsContent>

               

                              {/* History Tab */}
               <TabsContent value="history" className="space-y-6">
                 <Card className="card-playful backdrop-blur-sm bg-white/90 border-2 border-purple-200 shadow-xl">
                   <CardHeader className="pb-3">
                     <CardTitle className="font-playful text-xl text-purple-600">Session History 📚</CardTitle>
                     <CardDescription className="font-comic text-base">
                       Your recent eye control performance history
                     </CardDescription>
                   </CardHeader>
                   <CardContent>
                                           <div className="space-y-4">
                                                {gameHistory.slice(currentPage * 5, (currentPage + 1) * 5).map((record, index) => {
                           const totalBalloons = record.round1Count + record.round2Count + record.round3Count;
                           const sessionNumber = totalElements - (currentPage * 5 + index);
                           
                           // Calculate improvement compared to previous session
                           const currentIndex = currentPage * 5 + index;
                           let improvement = 0;
                           let cardColor = 'bg-gray-50 border-gray-200';
                           
                           if (currentIndex < gameHistory.length - 1) {
                             const previousRecord = gameHistory[currentIndex + 1];
                             const previousTotal = previousRecord.round1Count + previousRecord.round2Count + previousRecord.round3Count;
                             if (previousTotal > 0) {
                               improvement = ((totalBalloons - previousTotal) / previousTotal) * 100;
                             }
                           }
                           
                           // Set card color based on improvement
                           if (improvement > 0) {
                             cardColor = 'bg-green-50 border-green-200';
                           } else if (improvement < 0) {
                             cardColor = 'bg-red-50 border-red-200';
                           } else {
                             cardColor = 'bg-gray-50 border-gray-200';
                           }
                           
                           return (
                            <div key={record.id} className={`border rounded-lg p-4 hover:bg-gray-50 transition-colors ${cardColor}`}>
                             {/* Session Header */}
                             <div className="flex items-center justify-between mb-3">
                               <div>
                                 <div className="font-bold text-primary text-sm">
                                   Session {sessionNumber}
                                 </div>
                                 <div className="text-xs text-muted-foreground">
                                   {formatDateTime(record.dateTime)}
                                 </div>
                               </div>
                                                               <div className="text-right">
                                  <div className="text-lg font-bold text-blue-600">
                                    {totalBalloons}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    Total Balloons
                                  </div>
                                  {currentIndex < gameHistory.length - 1 && (
                                    <div className={`text-xs font-semibold mt-1 px-2 py-1 rounded-full ${
                                      improvement > 0 
                                        ? 'bg-green-100 text-green-700 border border-green-300'
                                        : improvement < 0
                                        ? 'bg-red-100 text-red-700 border border-red-300'
                                        : 'bg-gray-100 text-gray-700 border border-gray-300'
                                    }`}>
                                      {improvement > 0 ? '+' : ''}{improvement.toFixed(1)}%
                                    </div>
                                  )}
                                </div>
                             </div>
                             
                                                                                          {/* Session Summary */}
                               <div className="grid grid-cols-3 gap-2 mb-3">
                                 <div className="text-center p-2 bg-blue-50 rounded">
                                   <div className="text-sm font-bold text-blue-600">{record.round1Count}</div>
                                   <div className="text-xs text-muted-foreground">Round 1</div>
                                 </div>
                                 <div className="text-center p-2 bg-green-50 rounded">
                                   <div className="text-sm font-bold text-green-600">{record.round2Count}</div>
                                   <div className="text-xs text-muted-foreground">Round 2</div>
                                 </div>
                                 <div className="text-center p-2 bg-purple-50 rounded">
                                   <div className="text-sm font-bold text-purple-600">{record.round3Count}</div>
                                   <div className="text-xs text-muted-foreground">Round 3</div>
                                 </div>
                               </div>


                           </div>
                         );
                       })}
                     </div>
                     
                     {/* Pagination Controls */}
                     {totalPages > 1 && (
                       <div className="flex items-center justify-center space-x-2 mt-6">
                         <Button
                           onClick={() => loadGameHistory(currentPage - 1)}
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
                                 onClick={() => loadGameHistory(pageNum)}
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
                           onClick={() => loadGameHistory(currentPage + 1)}
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
                         Page {currentPage + 1} of {totalPages} • Showing {Math.min(5, gameHistory.slice(currentPage * 5, (currentPage + 1) * 5).length)} of {totalElements} sessions
                       </div>
                     )}
                   </CardContent>
                 </Card>
               </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
}
