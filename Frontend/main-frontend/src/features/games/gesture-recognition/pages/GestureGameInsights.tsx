import Navbar from '@/components/common/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getCurrentChild } from '@/shared/utils/childUtils';
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

interface GestureGameRecord {
  id: number;
  sessionId: string;
  dateTime: string;
  childId: string;
  age: number;
  thumbs_up?: number;
  thumbs_down?: number;
  victory?: number;
  butterfly?: number;
  spectacle?: number;
  heart?: number;
  pointing_up?: number;
  iloveyou?: number;
  dua?: number;
  closed_fist?: number;
  open_palm?: number;
  videoURL?: string;
  isTrainingAllowed: boolean;
  suspectedASD: boolean;
  isASD?: boolean;
}

interface ChildStatistics {
  totalGames: number;
  averageCompletionTimes: Record<string, number>;
  gestureCompletionCounts: Record<string, number>;
  daysSinceLastGame?: number;
}

interface GestureAnalysis {
  bestPerformance: Record<string, number>;
  worstPerformance: Record<string, number>;
  consistencyScore: Record<string, number>;
}

interface ImprovementTrends {
  recentImprovement?: {
    latestGameDate: string;
    previousGameDate: string;
    gestureImprovement: Record<string, string>;
  };
  overallTrend: Record<string, number>;
}

interface PerformanceSummary {
  bestGesture?: string;
  bestTime?: number;
  worstGesture?: string;
  worstTime?: number;
  totalCompletedGestures?: number;
}

const COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9', '#F8C471'
];

const GESTURE_NAMES = [
  'Thumbs Up 👍', 'Thumbs Down 👎', 'Victory ✌️', 'Butterfly 🦋', 'Spectacle 👓',
  'Heart ❤️', 'Pointing Up ☝️', 'I Love You 🤟', 'Dua 🙏', 'Closed Fist ✊', 'Open Palm 🖐️'
];

export default function GestureGameInsights() {
  const navigate = useNavigate();
  const { childId } = useParams<{ childId: string }>();
  const [selectedChild, setSelectedChild] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState<ChildStatistics | null>(null);
  const [analysis, setAnalysis] = useState<GestureAnalysis | null>(null);
  const [trends, setTrends] = useState<ImprovementTrends | null>(null);
  const [summary, setSummary] = useState<PerformanceSummary | null>(null);
  const [gameHistory, setGameHistory] = useState<GestureGameRecord[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    const childData = getCurrentChild();
    if (childData) {
      setSelectedChild(childData);
      loadAllData(childData.id);
    }
  }, []);

  const loadAllData = async (childId: string) => {
    setLoading(true);
    console.log('Loading data for childId:', childId);
    
    try {
      const [statsRes, analysisRes, trendsRes, summaryRes, historyRes] = await Promise.all([
        fetch(`http://localhost:8084/api/gesture-game/child/${childId}/statistics`),
        fetch(`http://localhost:8084/api/gesture-game/child/${childId}/gesture-analysis`),
        fetch(`http://localhost:8084/api/gesture-game/child/${childId}/improvement-trends`),
        fetch(`http://localhost:8084/api/gesture-game/child/${childId}/performance-summary`),
        fetch(`http://localhost:8084/api/gesture-game/child/${childId}/history?page=0&size=10`)
      ]);

      console.log('API Responses:');
      console.log('Stats Response:', statsRes.status, statsRes.ok);
      console.log('Analysis Response:', analysisRes.status, analysisRes.ok);
      console.log('Trends Response:', trendsRes.status, trendsRes.ok);
      console.log('Summary Response:', summaryRes.status, summaryRes.ok);
      console.log('History Response:', historyRes.status, historyRes.ok);

      // Initialize with default data if no records exist
      const defaultStats = {
        totalGames: 0,
        averageCompletionTimes: {},
        gestureCompletionCounts: {},
        daysSinceLastGame: 0
      };

      const defaultAnalysis = {
        bestPerformance: {},
        worstPerformance: {},
        consistencyScore: {}
      };

      const defaultTrends = {
        overallTrend: {}
      };

      const defaultSummary = {
        bestGesture: 'No data yet',
        bestTime: 0,
        worstGesture: 'No data yet',
        worstTime: 0,
        totalCompletedGestures: 0
      };

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        console.log('Statistics Data:', statsData);
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
      
      if (trendsRes.ok) {
        const trendsData = await trendsRes.json();
        console.log('Trends Data:', trendsData);
        setTrends(trendsData);
      } else {
        console.error('Trends API failed:', trendsRes.status, trendsRes.statusText);
        setTrends(defaultTrends);
      }
      
      if (summaryRes.ok) {
        const summaryData = await summaryRes.json();
        console.log('Summary Data:', summaryData);
        setSummary(summaryData);
      } else {
        console.error('Summary API failed:', summaryRes.status, summaryRes.statusText);
        setSummary(defaultSummary);
      }
      
      if (historyRes.ok) {
        const historyData = await historyRes.json();
        console.log('History Data:', historyData);
        setGameHistory(historyData.content || []);
        setTotalPages(historyData.totalPages || 0);
      } else {
        console.error('History API failed:', historyRes.status, historyRes.statusText);
        setGameHistory([]);
        setTotalPages(0);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      // Set default data on error
      setStatistics({
        totalGames: 0,
        averageCompletionTimes: {},
        gestureCompletionCounts: {},
        daysSinceLastGame: 0
      });
      setAnalysis({
        bestPerformance: {},
        worstPerformance: {},
        consistencyScore: {}
      });
      setTrends({
        overallTrend: {}
      });
      setSummary({
        bestGesture: 'No data yet',
        bestTime: 0,
        worstGesture: 'No data yet',
        worstTime: 0,
        totalCompletedGestures: 0
      });
      setGameHistory([]);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  const loadGameHistory = async (page: number) => {
    try {
      const response = await fetch(`http://localhost:8084/api/gesture-game/child/${selectedChild.id}/history?page=${page}&size=10`);
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

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getGestureTime = (record: GestureGameRecord, gestureName: string): number | null => {
    const gestureMap: Record<string, keyof GestureGameRecord> = {
      'Thumbs Up 👍': 'thumbs_up',
      'Thumbs Down 👎': 'thumbs_down',
      'Victory ✌️': 'victory',
      'Butterfly 🦋': 'butterfly',
      'Spectacle 👓': 'spectacle',
      'Heart ❤️': 'heart',
      'Pointing Up ☝️': 'pointing_up',
      'I Love You 🤟': 'iloveyou',
      'Dua 🙏': 'dua',
      'Closed Fist ✊': 'closed_fist',
      'Open Palm 🖐️': 'open_palm'
    };
    
    const field = gestureMap[gestureName];
    if (!field) return null;
    
    const value = record[field] as number;
    // Return the value if it's a number (including 0), otherwise return null
    return typeof value === 'number' ? value : null;
  };

  const getAverageTime = (gestureName: string): number => {
    if (!statistics?.averageCompletionTimes) return 0;
    return statistics.averageCompletionTimes[gestureName] || 0;
  };

  const getCompletionCount = (gestureName: string): number => {
    if (!statistics?.gestureCompletionCounts) return 0;
    return statistics.gestureCompletionCounts[gestureName] || 0;
  };

  const getCompletionRatio = (gestureName: string): number => {
    const totalGames = statistics?.totalGames || 0;
    if (totalGames === 0) return 0;
    return (getCompletionCount(gestureName) / totalGames) * 100;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-soft font-nunito">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <div className="text-2xl font-playful text-primary">Loading insights... 🎯</div>
        </div>
      </div>
    );
  }

  if (!selectedChild) {
    return (
      <div className="min-h-screen bg-soft font-nunito">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <div className="text-2xl font-playful text-primary">No child selected</div>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const averageTimesData = GESTURE_NAMES.map((name, index) => ({
    gesture: name,
    averageTime: getAverageTime(name),
    completionRatio: getCompletionRatio(name),
    color: COLORS[index % COLORS.length]
  }));

  const performanceData = GESTURE_NAMES.map((name, index) => ({
    gesture: name,
    average: getAverageTime(name),
    color: COLORS[index % COLORS.length]
  }));

  const consistencyData = GESTURE_NAMES.map((name, index) => ({
    gesture: name,
    consistency: analysis?.consistencyScore?.[name] || 0,
    color: COLORS[index % COLORS.length]
  }));

  const trendData = GESTURE_NAMES.map((name, index) => ({
    gesture: name,
    trend: trends?.overallTrend?.[name] || 0,
    color: COLORS[index % COLORS.length]
  }));

  // Session improvement curve data
  const sessionImprovementData = gameHistory.map((record, index) => {
    const totalTime = GESTURE_NAMES.reduce((sum, gesture) => {
      const time = getGestureTime(record, gesture);
      return sum + (time !== null && time !== undefined ? time : 0);
    }, 0);
    const completedGestures = GESTURE_NAMES.filter(gesture => {
      const time = getGestureTime(record, gesture);
      return time !== null && time !== undefined;
    }).length;
    const averageTime = completedGestures > 0 ? totalTime / completedGestures : 0;
    
    return {
      session: `Session ${gameHistory.length - index}`,
      averageTime: Math.round(averageTime * 100) / 100,
      completedGestures,
      date: formatDateTime(record.dateTime)
    };
  }).reverse();

  // Find smallest and highest average times
  const validAverageTimes = averageTimesData.filter(d => d.averageTime >= 0);
  const smallestAvgTime = validAverageTimes.length > 0 ? 
    validAverageTimes.reduce((min, current) => current.averageTime < min.averageTime ? current : min) : null;
  const highestAvgTime = validAverageTimes.length > 0 ? 
    validAverageTimes.reduce((max, current) => current.averageTime > max.averageTime ? current : max) : null;

  // Check if there's any real data
  const hasData = statistics && statistics.totalGames > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 font-nunito relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-20 left-10 text-4xl animate-bounce" style={{ animationDelay: '0s' }}>🎮</div>
        <div className="absolute top-40 right-20 text-3xl animate-float" style={{ animationDelay: '1s' }}>✨</div>
        <div className="absolute bottom-40 left-20 text-3xl animate-wiggle" style={{ animationDelay: '2s' }}>🎯</div>
        <div className="absolute bottom-20 right-10 text-4xl animate-pulse-fun" style={{ animationDelay: '0.5s' }}>🏆</div>
        <div className="absolute top-1/2 left-1/4 text-2xl animate-float" style={{ animationDelay: '1.5s' }}>🌟</div>
        <div className="absolute top-1/3 right-1/3 text-3xl animate-bounce" style={{ animationDelay: '0.8s' }}>🎪</div>
        
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
              Gesture Game Hub 🎮
            </h1>
            <p className="text-xl font-comic text-gray-600 max-w-2xl mx-auto">
              Master hand gestures with fun challenges! Play new games and track your progress.
            </p>
          </div>
        </div>

        {/* No Data Message */}
        {!hasData && (
          <Card className="card-playful backdrop-blur-sm bg-white/90 border-2 border-yellow-200 shadow-xl">
            <CardContent className="p-12 text-center">
              <div className="text-8xl mb-6 animate-bounce">🎯</div>
              <h2 className="text-3xl font-playful text-primary mb-4">
                Ready to Start Your Journey?
              </h2>
              <p className="text-lg font-comic text-muted-foreground mb-8 max-w-md mx-auto">
                {selectedChild.name} hasn't played the Gesture Game yet. 
                Start playing to unlock amazing insights and track your progress!
              </p>
              <Button 
                onClick={() => navigate('/games/gesture')}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-comic text-xl px-12 py-4 hover:scale-105 transition-all shadow-xl rounded-full"
              >
                🚀 Begin Your Adventure!
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Call to Action Section - Right below Hero */}
        {hasData && (
          <Card className="card-playful backdrop-blur-sm bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 shadow-2xl max-w-md mx-auto">
            <CardContent className="p-4 text-center">
              <div className="text-2xl mb-2 animate-bounce">🎮</div>
              <h3 className="text-lg font-playful text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-1">
                Ready for Another Challenge?
              </h3>
              <p className="text-xs font-comic text-gray-600 mb-3 max-w-sm mx-auto">
                Keep improving your gesture skills!
              </p>
              <Button 
                onClick={() => navigate('/games/gesture')}
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
                Your Performance Insights 📊
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
                  📉 Trends
                </TabsTrigger>
                <TabsTrigger value="consistency" className="flex-1 py-4 px-6 text-base font-semibold rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:scale-105 hover:bg-white/50 hover:scale-105 transition-all duration-300">
                  🎯 Consistency
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
                  <div className="absolute top-4 left-4 text-6xl animate-bounce opacity-20">🎮</div>
                  <div className="absolute top-8 right-8 text-4xl animate-float opacity-20">✨</div>
                  <div className="absolute bottom-4 left-1/2 text-5xl animate-pulse-fun opacity-20">🏆</div>
                  
                  <div className="relative bg-gradient-to-br from-white/95 to-white/85 backdrop-blur-sm rounded-3xl border-2 border-blue-200/50 shadow-2xl p-8">
                    <div className="text-center mb-8">
                      <h3 className="text-3xl font-playful text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 mb-2">
                        Your Amazing Progress! 🌟
                      </h3>
                      <p className="text-lg font-comic text-gray-600">
                        Let's see how {selectedChild.name} is doing with hand gestures!
                      </p>
                    </div>
                    
                    {/* Main Stats Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                      {/* Total Sessions */}
                      <div className="group relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 to-emerald-400/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                        <div className="relative bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border-2 border-green-200 p-6 text-center hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl">
                          <div className="text-4xl mb-3 animate-bounce">🎮</div>
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

                      {/* Average Session Time */}
                      <div className="group relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                        <div className="relative bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-200 p-6 text-center hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl">
                          <div className="text-4xl mb-3 animate-pulse">⏱️</div>
                          <div className="text-4xl font-bold text-blue-600 mb-2">
                            {(() => {
                              const avgTime = Object.values(statistics?.averageCompletionTimes || {}).reduce((sum, time) => sum + time, 0) / Math.max(Object.keys(statistics?.averageCompletionTimes || {}).length, 1);
                              return avgTime.toFixed(1);
                            })()}s
                          </div>
                          <div className="text-sm font-comic text-blue-700 font-semibold">
                            Avg Time
                          </div>
                          <div className="text-xs text-blue-600 mt-1">
                            Per gesture
                          </div>
                        </div>
                      </div>

                      {/* Average Accuracy */}
                      <div className="group relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                        <div className="relative bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border-2 border-purple-200 p-6 text-center hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl">
                          <div className="text-4xl mb-3 animate-wiggle">🎯</div>
                          <div className="text-4xl font-bold text-purple-600 mb-2">
                            {(() => {
                              const totalGestures = Object.values(statistics?.gestureCompletionCounts || {}).reduce((sum, count) => sum + count, 0);
                              const totalPossible = (statistics?.totalGames || 0) * GESTURE_NAMES.length;
                              const accuracy = totalPossible > 0 ? (totalGestures / totalPossible) * 100 : 0;
                              return accuracy.toFixed(0);
                            })()}%
                          </div>
                          <div className="text-sm font-comic text-purple-700 font-semibold">
                            Accuracy
                          </div>
                          <div className="text-xs text-purple-600 mt-1">
                            Gestures completed
                          </div>
                        </div>
                      </div>

                      {/* Best Gesture */}
                      <div className="group relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/20 to-green-400/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                        <div className="relative bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl border-2 border-emerald-200 p-6 text-center hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl">
                          <div className="text-4xl mb-3 animate-bounce">🏆</div>
                          {smallestAvgTime ? (
                            <>
                              <div className="text-3xl font-bold text-emerald-600 mb-2">
                                {smallestAvgTime.averageTime.toFixed(1)}s
                              </div>
                              <div className="text-sm font-comic text-emerald-700 font-semibold">
                                Best Gesture
                              </div>
                              <div className="text-xs text-emerald-600 mt-1">
                                {smallestAvgTime.gesture}
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="text-3xl font-bold text-emerald-600 mb-2">--</div>
                              <div className="text-sm font-comic text-emerald-700 font-semibold">
                                Best Gesture
                              </div>
                              <div className="text-xs text-emerald-600 mt-1">
                                Coming soon!
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Performance Highlights Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Fastest Gesture */}
                  <div className="group relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-400/10 to-emerald-400/10 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                    <div className="relative bg-gradient-to-br from-green-50/90 to-emerald-50/90 backdrop-blur-sm rounded-3xl border-2 border-green-200/70 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
                      {/* Decorative elements */}
                      <div className="absolute top-4 right-4 text-6xl opacity-20 animate-float">⚡</div>
                      <div className="absolute bottom-4 left-4 text-4xl opacity-20 animate-bounce">🚀</div>
                      
                      <div className="p-8 relative z-10">
                        <div className="text-center">
                          <div className="text-5xl mb-4 animate-bounce">🏆</div>
                          <h3 className="text-2xl font-playful text-green-700 mb-6">Fastest Gesture</h3>
                          
                          {smallestAvgTime ? (
                            <div className="space-y-4">
                              <div className="bg-white/70 rounded-2xl p-6 border border-green-200/50">
                                <div className="text-3xl mb-3">{smallestAvgTime.gesture}</div>
                                <div className="text-5xl font-bold text-green-600 mb-2 animate-pulse">
                                  {smallestAvgTime.averageTime.toFixed(1)}s
                                </div>
                                <div className="text-lg font-comic text-green-700">
                                  Average completion time
                                </div>
                              </div>
                              <div className="text-sm text-green-600 font-comic">
                                Amazing speed! Keep it up! 🎉
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              <div className="bg-white/70 rounded-2xl p-6 border border-green-200/50">
                                <div className="text-4xl mb-3">🤔</div>
                                <div className="text-2xl font-bold text-green-600 mb-2">No data yet</div>
                                <div className="text-lg font-comic text-green-700">
                                  Start playing to see results!
                                </div>
                              </div>
                              <div className="text-sm text-green-600 font-comic">
                                Ready to set records! 🚀
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Slowest Gesture */}
                  <div className="group relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-red-400/10 to-pink-400/10 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                    <div className="relative bg-gradient-to-br from-red-50/90 to-pink-50/90 backdrop-blur-sm rounded-3xl border-2 border-red-200/70 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
                      {/* Decorative elements */}
                      <div className="absolute top-4 right-4 text-6xl opacity-20 animate-wiggle">📈</div>
                      <div className="absolute bottom-4 left-4 text-4xl opacity-20 animate-pulse">💪</div>
                      
                      <div className="p-8 relative z-10">
                        <div className="text-center">
                          <div className="text-5xl mb-4 animate-pulse">📉</div>
                          <h3 className="text-2xl font-playful text-red-700 mb-6">Needs Practice</h3>
                          
                          {highestAvgTime ? (
                            <div className="space-y-4">
                              <div className="bg-white/70 rounded-2xl p-6 border border-red-200/50">
                                <div className="text-3xl mb-3">{highestAvgTime.gesture}</div>
                                <div className="text-5xl font-bold text-red-600 mb-2 animate-pulse">
                                  {highestAvgTime.averageTime.toFixed(1)}s
                                </div>
                                <div className="text-lg font-comic text-red-700">
                                  Average completion time
                                </div>
                              </div>
                              <div className="text-sm text-red-600 font-comic">
                                Practice makes perfect! 💪
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              <div className="bg-white/70 rounded-2xl p-6 border border-red-200/50">
                                <div className="text-4xl mb-3">🤔</div>
                                <div className="text-2xl font-bold text-red-600 mb-2">No data yet</div>
                                <div className="text-lg font-comic text-red-700">
                                  Start playing to see results!
                                </div>
                              </div>
                              <div className="text-sm text-red-600 font-comic">
                                Ready to improve! 💪
                              </div>
                            </div>
                          )}
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
                        Keep Up the Great Work!
                      </h3>
                      <p className="text-lg font-comic text-orange-600 mb-6 max-w-2xl mx-auto">
                        Every practice session makes you better at hand gestures. 
                        You're doing amazing, {selectedChild.name}! 🎉
                      </p>
                      <div className="flex justify-center space-x-4 text-2xl">
                        <span className="animate-float" style={{ animationDelay: '0s' }}>🎮</span>
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
                        Deep dive into {selectedChild.name}'s hand gesture mastery!
                      </p>
                    </div>
                  </div>
                </div>

                {/* Main Performance Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Average Completion Times Chart */}
                  <div className="group relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                    <div className="relative bg-gradient-to-br from-blue-50/90 to-indigo-50/90 backdrop-blur-sm rounded-3xl border-2 border-blue-200/70 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
                      {/* Decorative elements */}
                      <div className="absolute top-4 right-4 text-6xl opacity-20 animate-float">⏱️</div>
                      <div className="absolute bottom-4 left-4 text-4xl opacity-20 animate-pulse">📊</div>
                      
                      <div className="p-8 relative z-10">
                        <div className="text-center mb-6">
                          <div className="text-5xl mb-4 animate-bounce">⏱️</div>
                          <h3 className="text-2xl font-playful text-blue-700 mb-2">Average Completion Times</h3>
                          <p className="text-sm font-comic text-blue-600">
                            How long it takes to complete each gesture on average
                          </p>
                        </div>
                        
                        <div className="bg-white/70 rounded-2xl p-4 border border-blue-200/50">
                          <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={averageTimesData}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                              <XAxis dataKey="gesture" angle={-45} textAnchor="end" height={80} tick={{ fontSize: 10 }} />
                              <YAxis tick={{ fontSize: 10 }} />
                              <Tooltip 
                                contentStyle={{ 
                                  backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                                  border: '2px solid #3b82f6',
                                  borderRadius: '12px',
                                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                                }}
                              />
                              <Bar dataKey="averageTime" fill="url(#blueGradient)" radius={[4, 4, 0, 0]} />
                              <defs>
                                <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor="#3b82f6" />
                                  <stop offset="100%" stopColor="#8b5cf6" />
                                </linearGradient>
                              </defs>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Gesture Completion Ratios */}
                  <div className="group relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                    <div className="relative bg-gradient-to-br from-purple-50/90 to-pink-50/90 backdrop-blur-sm rounded-3xl border-2 border-purple-200/70 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
                      {/* Decorative elements */}
                      <div className="absolute top-4 right-4 text-6xl opacity-20 animate-wiggle">🎯</div>
                      <div className="absolute bottom-4 left-4 text-4xl opacity-20 animate-bounce">✨</div>
                      
                      <div className="p-8 relative z-10">
                        <div className="text-center mb-6">
                          <div className="text-5xl mb-4 animate-wiggle">🎯</div>
                          <h3 className="text-2xl font-playful text-purple-700 mb-2">Completion Ratios</h3>
                          <p className="text-sm font-comic text-purple-600">
                            Percentage of games where each gesture was completed
                          </p>
                        </div>
                        
                        <div className="space-y-4">
                          {averageTimesData
                            .filter(d => d.completionRatio > 0)
                            .sort((a, b) => b.completionRatio - a.completionRatio)
                            .map((item, index) => (
                              <div key={item.gesture} className="group/item bg-white/70 rounded-xl border border-purple-200/50 p-4 hover:scale-105 transition-all duration-300 hover:shadow-lg">
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center gap-2">
                                    <span className="text-2xl">{item.gesture.split(' ').pop()}</span>
                                    <span className="font-comic text-sm font-medium text-purple-700">
                                      {item.gesture.split(' ').slice(0, -1).join(' ')}
                                    </span>
                                  </div>
                                  <div className="bg-gradient-to-r from-purple-100 to-pink-100 px-3 py-1 rounded-full border border-purple-200">
                                    <span className="font-bold text-purple-600 text-sm">
                                      {item.completionRatio.toFixed(0)}%
                                    </span>
                                  </div>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-gradient-to-r from-purple-500 to-pink-600 h-2 rounded-full transition-all duration-700 shadow-sm"
                                    style={{ width: `${item.completionRatio}%` }}
                                  ></div>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Improvement Curve Section */}
                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-400/10 to-emerald-400/10 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                  <div className="relative bg-gradient-to-br from-green-50/90 to-emerald-50/90 backdrop-blur-sm rounded-3xl border-2 border-green-200/70 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
                    {/* Decorative elements */}
                    <div className="absolute top-4 right-4 text-6xl opacity-20 animate-float">📈</div>
                    <div className="absolute bottom-4 left-4 text-4xl opacity-20 animate-bounce">🚀</div>
                    <div className="absolute top-1/2 left-4 text-3xl opacity-20 animate-pulse">💪</div>
                    
                    <div className="p-8 relative z-10">
                      <div className="text-center mb-6">
                        <div className="text-5xl mb-4 animate-bounce">📈</div>
                        <h3 className="text-2xl font-playful text-green-700 mb-2">Progress Journey</h3>
                        <p className="text-sm font-comic text-green-600">
                          Track your improvement over time - lower times mean better performance!
                        </p>
                      </div>
                      
                      <div className="bg-white/70 rounded-2xl p-4 border border-green-200/50">
                        {sessionImprovementData.length > 0 ? (
                          <ResponsiveContainer width="100%" height={400}>
                            <LineChart data={sessionImprovementData}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                              <XAxis 
                                dataKey="session" 
                                tick={{ fontSize: 12 }}
                                label={{ value: 'Session Number', position: 'insideBottom', offset: -10 }}
                              />
                              <YAxis 
                                tick={{ fontSize: 12 }}
                                label={{ value: 'Total Time (seconds)', angle: -90, position: 'insideLeft' }}
                              />
                              <Tooltip 
                                contentStyle={{ 
                                  backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                                  border: '2px solid #10b981',
                                  borderRadius: '12px',
                                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                                }}
                                formatter={(value: any, name: any) => [
                                  `${value.toFixed(1)}s`, 
                                  'Total Time'
                                ]}
                                labelFormatter={(label) => `Session ${label}`}
                              />
                              <Line 
                                type="monotone" 
                                dataKey="averageTime" 
                                stroke="url(#lineGradientGreen)" 
                                strokeWidth={3}
                                dot={{ fill: '#10b981', strokeWidth: 2, r: 6 }}
                                activeDot={{ r: 8, stroke: '#10b981', strokeWidth: 2 }}
                              />
                              <defs>
                                <linearGradient id="lineGradientGreen" x1="0" y1="0" x2="1" y2="0">
                                  <stop offset="0%" stopColor="#10b981" />
                                  <stop offset="100%" stopColor="#059669" />
                                </linearGradient>
                              </defs>
                            </LineChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="text-center text-muted-foreground p-8">
                            <div className="text-6xl mb-4 animate-bounce">📈</div>
                            <div className="text-xl font-comic text-green-600 mb-2">No session data available yet</div>
                            <div className="text-sm text-green-500">Start playing to see your progress!</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Performance Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Improvement Trend */}
                  <div className="group relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-400/10 to-yellow-400/10 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                    <div className="relative bg-gradient-to-br from-orange-50/90 to-yellow-50/90 backdrop-blur-sm rounded-3xl border-2 border-orange-200/70 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
                      {/* Decorative elements */}
                      <div className="absolute top-4 right-4 text-6xl opacity-20 animate-float">📈</div>
                      <div className="absolute bottom-4 left-4 text-4xl opacity-20 animate-pulse">🎯</div>
                      
                      <div className="p-8 relative z-10">
                        <div className="text-center">
                          <div className="text-5xl mb-4 animate-bounce">📈</div>
                          <h3 className="text-2xl font-playful text-orange-700 mb-6">Improvement Trend</h3>
                          
                          <div className="bg-white/70 rounded-2xl p-6 border border-orange-200/50">
                            <div className="text-5xl font-bold text-orange-600 mb-2 animate-pulse">
                              {(() => {
                                if (sessionImprovementData.length < 2) return '0';
                                const firstSession = sessionImprovementData[0];
                                const lastSession = sessionImprovementData[sessionImprovementData.length - 1];
                                const improvement = ((firstSession.averageTime - lastSession.averageTime) / firstSession.averageTime) * 100;
                                return improvement.toFixed(1);
                              })()}%
                            </div>
                            <div className="text-lg font-comic text-orange-700 font-semibold mb-2">
                              Recent Performance
                            </div>
                            <div className="text-sm text-orange-600">
                              {(() => {
                                if (sessionImprovementData.length < 2) return "Starting your journey! 🌟";
                                const firstSession = sessionImprovementData[0];
                                const lastSession = sessionImprovementData[sessionImprovementData.length - 1];
                                const improvement = ((firstSession.averageTime - lastSession.averageTime) / firstSession.averageTime) * 100;
                                return improvement > 0 
                                  ? "You're getting better! 🚀" 
                                  : improvement < 0
                                    ? "Keep practicing! 💪"
                                    : "Starting your journey! 🌟";
                              })()}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Gesture Distribution */}
                  <div className="group relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-pink-400/10 to-rose-400/10 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                    <div className="relative bg-gradient-to-br from-pink-50/90 to-rose-50/90 backdrop-blur-sm rounded-3xl border-2 border-pink-200/70 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
                      {/* Decorative elements */}
                      <div className="absolute top-4 right-4 text-6xl opacity-20 animate-wiggle">🥧</div>
                      <div className="absolute bottom-4 left-4 text-4xl opacity-20 animate-bounce">🎨</div>
                      
                      <div className="p-8 relative z-10">
                        <div className="text-center">
                          <div className="text-5xl mb-4 animate-wiggle">🥧</div>
                          <h3 className="text-2xl font-playful text-pink-700 mb-6">Gesture Distribution</h3>
                          
                          <div className="bg-white/70 rounded-2xl p-4 border border-pink-200/50">
                            <div className="space-y-3">
                              {averageTimesData
                                .filter(d => d.completionRatio > 0)
                                .sort((a, b) => b.completionRatio - a.completionRatio)
                                .slice(0, 5)
                                .map((item, index) => (
                                  <div key={item.gesture} className="flex items-center justify-between p-2 bg-gradient-to-r from-pink-50 to-rose-50 rounded-lg border border-pink-200/50">
                                    <div className="flex items-center gap-2">
                                      <span className="text-lg">{item.gesture.split(' ').pop()}</span>
                                      <span className="text-sm font-comic text-pink-700">
                                        {item.gesture.split(' ').slice(0, -1).join(' ')}
                                      </span>
                                    </div>
                                    <div className="bg-gradient-to-r from-pink-100 to-rose-100 px-2 py-1 rounded-full border border-pink-200">
                                      <span className="font-bold text-pink-600 text-xs">
                                        {item.completionRatio.toFixed(0)}%
                                      </span>
                                    </div>
                                  </div>
                                ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Performance Summary Section */}
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-100/30 via-purple-100/30 to-pink-100/30 rounded-3xl"></div>
                  <div className="relative bg-gradient-to-br from-indigo-50/90 to-purple-50/90 backdrop-blur-sm rounded-3xl border-2 border-indigo-200/70 shadow-xl p-8">
                    <div className="text-center">
                      <div className="text-6xl mb-4 animate-bounce">🎯</div>
                      <h3 className="text-2xl font-playful text-indigo-700 mb-4">
                        Performance Summary
                      </h3>
                      <p className="text-lg font-comic text-indigo-600 mb-6 max-w-2xl mx-auto">
                        {selectedChild.name} is showing amazing progress in hand gestures! 
                        Keep practicing to improve even more! 🌟
                      </p>
                      <div className="flex justify-center space-x-4 text-2xl">
                        <span className="animate-float" style={{ animationDelay: '0s' }}>📊</span>
                        <span className="animate-float" style={{ animationDelay: '0.5s' }}>⚡</span>
                        <span className="animate-float" style={{ animationDelay: '1s' }}>🎯</span>
                        <span className="animate-float" style={{ animationDelay: '1.5s' }}>🏆</span>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

                             {/* Trends Tab */}
               <TabsContent value="trends" className="space-y-6">
                 <div className="grid grid-cols-1 gap-6">
                   <Card className="card-playful backdrop-blur-sm bg-white/90 border-2 border-purple-200 shadow-xl">
                     <CardHeader className="pb-3">
                       <CardTitle className="font-playful text-xl text-purple-600">Performance Comparison 📊</CardTitle>
                       <CardDescription className="font-comic text-base">
                         Visual comparison of average vs last session performance
                       </CardDescription>
                     </CardHeader>
                     <CardContent>
                       {gameHistory.length > 0 ? (
                         <div className="space-y-4">
                                                       {GESTURE_NAMES.map((gesture) => {
                              const lastSessionTime = getGestureTime(gameHistory[0], gesture);
                              const averageTime = getAverageTime(gesture);
                              
                              // Show all gestures, even if not completed in last session
                              // Note: We include averageTime === 0 as it represents valid completion in 0 seconds
                             
                                                           const isCompleted = lastSessionTime !== null && lastSessionTime !== undefined;
                              const difference = isCompleted ? (lastSessionTime - averageTime) : 0;
                              const differenceAbs = Math.abs(difference);
                              const isImproving = isCompleted && difference < 0;
                              const percentageChange = isCompleted ? Math.abs((difference / averageTime) * 100) : 0;
                             
                             return (
                               <div key={gesture} className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-200 hover:scale-105 transition-all">
                                 <div className="flex items-center justify-between mb-3">
                                   <div className="flex items-center gap-2">
                                     <span className="text-2xl">{gesture.split(' ').pop()}</span>
                                     <span className="font-comic text-base font-medium">{gesture.split(' ').slice(0, -1).join(' ')}</span>
                                   </div>
                                                                       <div className={`px-3 py-1 rounded-full text-sm font-bold ${
                                      !isCompleted
                                        ? 'bg-gray-100 text-gray-700 border border-gray-300'
                                        : isImproving 
                                          ? 'bg-green-100 text-green-700 border border-green-300' 
                                          : 'bg-red-100 text-red-700 border border-red-300'
                                    }`}>
                                      {!isCompleted ? '❌' : (isImproving ? '↗️' : '↘️')} {!isCompleted ? 'Not done' : `${percentageChange.toFixed(0)}%`}
                                    </div>
                                 </div>
                                 
                                                                   <div className="grid grid-cols-3 gap-4">
                                    <div className="text-center p-3 bg-blue-100 rounded-lg border border-blue-200">
                                      <div className="text-xs text-blue-600 font-medium mb-1">Average Time</div>
                                      <div className="text-lg font-bold text-blue-700">{averageTime.toFixed(1)}s</div>
                                    </div>
                                    <div className="text-center p-3 bg-purple-100 rounded-lg border border-purple-200">
                                      <div className="text-xs text-purple-600 font-medium mb-1">Last Session</div>
                                      <div className={`text-lg font-bold ${isCompleted ? 'text-purple-700' : 'text-gray-500'}`}>
                                        {isCompleted ? `${lastSessionTime.toFixed(1)}s` : 'Not done'}
                                      </div>
                                    </div>
                                    <div className="text-center p-3 bg-gray-100 rounded-lg border border-gray-200">
                                      <div className="text-xs text-gray-600 font-medium mb-1">Difference</div>
                                      <div className={`text-lg font-bold ${!isCompleted ? 'text-gray-500' : (isImproving ? 'text-green-600' : 'text-red-600')}`}>
                                        {!isCompleted ? 'N/A' : (isImproving ? '-' : '+') + `${differenceAbs.toFixed(1)}s`}
                                      </div>
                                    </div>
                                  </div>
                                 
                                                                   <div className="mt-3">
                                    <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                                      <span>Performance</span>
                                      <span>{!isCompleted ? 'Not Attempted' : (isImproving ? 'Better' : 'Needs Work')}</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                      <div 
                                        className={`h-2 rounded-full transition-all duration-700 ${
                                          !isCompleted
                                            ? 'bg-gray-400'
                                            : isImproving 
                                              ? 'bg-gradient-to-r from-green-400 to-green-600' 
                                              : 'bg-gradient-to-r from-red-400 to-red-600'
                                        }`}
                                        style={{ 
                                          width: `${!isCompleted ? 0 : Math.min(percentageChange * 2, 100)}%`,
                                          transform: isImproving ? 'scaleX(-1)' : 'scaleX(1)'
                                        }}
                                      ></div>
                                    </div>
                                  </div>
                               </div>
                             );
                           })}
                         </div>
                       ) : (
                         <div className="text-center text-muted-foreground p-6">
                           <div className="text-base">No data available for comparison</div>
                         </div>
                       )}
                     </CardContent>
                   </Card>
                 </div>
               </TabsContent>

              {/* Consistency Tab */}
              <TabsContent value="consistency" className="space-y-6">
                                 <Card className="card-playful backdrop-blur-sm bg-white/90 border-2 border-blue-200 shadow-xl">
                   <CardHeader className="pb-3">
                     <CardTitle className="font-playful text-xl text-blue-600">Performance Consistency 🎯</CardTitle>
                     <CardDescription className="font-comic text-base">
                       How consistent the performance is for each gesture
                     </CardDescription>
                   </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <RadarChart data={consistencyData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="gesture" tick={{ fontSize: 10 }} />
                        <PolarRadiusAxis tick={{ fontSize: 10 }} />
                        <Radar
                          name="Consistency Score"
                          dataKey="consistency"
                          stroke="#8884d8"
                          fill="#8884d8"
                          fillOpacity={0.6}
                        />
                        <Tooltip />
                      </RadarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </TabsContent>

                             {/* History Tab */}
               <TabsContent value="history" className="space-y-6">
                 <Card className="card-playful backdrop-blur-sm bg-white/90 border-2 border-purple-200 shadow-xl">
                   <CardHeader className="pb-3">
                     <CardTitle className="font-playful text-xl text-purple-600">Session History 📚</CardTitle>
                     <CardDescription className="font-comic text-base">
                       Your recent performance history with detailed gesture breakdowns
                     </CardDescription>
                   </CardHeader>
                   <CardContent>
                     <div className="space-y-4">
                       {gameHistory.slice(currentPage * 5, (currentPage + 1) * 5).map((record, index) => {
                         const totalTime = GESTURE_NAMES.reduce((sum, gesture) => {
                           const time = getGestureTime(record, gesture);
                           return sum + (time !== null && time !== undefined ? time : 0);
                         }, 0);
                         const completedGestures = GESTURE_NAMES.filter(gesture => {
                           const time = getGestureTime(record, gesture);
                           return time !== null && time !== undefined;
                         }).length;
                         const averageTime = completedGestures > 0 ? totalTime / completedGestures : 0;
                         const completionRate = (completedGestures / GESTURE_NAMES.length) * 100;
                         const sessionNumber = gameHistory.length - (currentPage * 5 + index);
                         
                         return (
                           <div key={record.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
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
                                   {averageTime.toFixed(1)}s
                                 </div>
                                 <div className="text-xs text-muted-foreground">
                                   Avg Time
                                 </div>
                               </div>
                             </div>
                             
                             {/* Session Summary */}
                             <div className="grid grid-cols-3 gap-2 mb-3">
                               <div className="text-center p-2 bg-blue-50 rounded">
                                 <div className="text-sm font-bold text-blue-600">{completedGestures}</div>
                                 <div className="text-xs text-muted-foreground">Completed</div>
                               </div>
                               <div className="text-center p-2 bg-green-50 rounded">
                                 <div className="text-sm font-bold text-green-600">{completionRate.toFixed(0)}%</div>
                                 <div className="text-xs text-muted-foreground">Success Rate</div>
                               </div>
                               <div className="text-center p-2 bg-purple-50 rounded">
                                 <div className="text-sm font-bold text-purple-600">{totalTime.toFixed(1)}s</div>
                                 <div className="text-xs text-muted-foreground">Total Time</div>
                               </div>
                             </div>

                             {/* Emoji-by-Emoji Breakdown */}
                             <div className="border-t pt-3">
                               <div className="text-xs font-semibold text-gray-600 mb-2">Gesture Performance:</div>
                               <div className="grid grid-cols-2 gap-2">
                                 {GESTURE_NAMES.map((gesture) => {
                                   const time = getGestureTime(record, gesture);
                                   const isCompleted = time !== null && time !== undefined;
                                   
                                   // Extract emoji and name properly
                                   const emoji = gesture.split(' ').pop(); // Get the emoji
                                   const name = gesture.split(' ').slice(0, -1).join(' '); // Get the name without emoji
                                   
                                   return (
                                     <div key={gesture} className={`flex items-center justify-between p-2 rounded text-xs ${
                                       isCompleted ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                                     }`}>
                                       <div className="flex items-center gap-1">
                                         <span className="text-sm">{emoji}</span>
                                         <span className="text-xs text-gray-500">{name}</span>
                                       </div>
                                       <div className={`font-bold ${isCompleted ? 'text-green-600' : 'text-red-500'}`}>
                                         {isCompleted ? `${time.toFixed(1)}s` : 'Not done'}
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
                         Page {currentPage + 1} of {totalPages} • Showing {Math.min(5, gameHistory.length)} of {gameHistory.length} sessions
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
