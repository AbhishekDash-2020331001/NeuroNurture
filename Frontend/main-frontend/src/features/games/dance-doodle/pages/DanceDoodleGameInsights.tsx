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

interface DanceDoodleGameRecord {
  id: number;
  sessionId: string;
  dateTime: string;
  childId: string;
  age: number;
  cool_arms?: number;
  open_wings?: number;
  silly_boxer?: number;
  happy_stand?: number;
  crossy_play?: number;
  shh_fun?: number;
  stretch?: number;
  videoURL?: string;
  isTrainingAllowed: boolean;
  suspectedASD: boolean;
  isASD?: boolean;
}

interface ChildStatistics {
  totalGames: number;
  averageCompletionTimes: Record<string, number>;
  poseCompletionCounts: Record<string, number>;
  daysSinceLastGame?: number;
}

interface DanceAnalysis {
  bestPerformance: Record<string, number>;
  worstPerformance: Record<string, number>;
  consistencyScore: Record<string, number>;
}

interface ImprovementTrends {
  recentImprovement?: {
    latestGameDate: string;
    previousGameDate: string;
    poseImprovement: Record<string, string>;
  };
  overallTrend: Record<string, number>;
}

interface PerformanceSummary {
  bestPose?: string;
  bestTime?: number;
  worstPose?: string;
  worstTime?: number;
  totalCompletedPoses?: number;
}

const COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9', '#F8C471'
];

const DANCE_POSES = [
  'Cool Arms 💪', 'Open Wings 🦋', 'Silly Boxer 🥊', 'Happy Stand 😊',
  'Crossy Play ✌️', 'Shh Fun 🤫', 'Stretch 🤸'
];

export default function DanceDoodleGameInsights() {
  const navigate = useNavigate();
  const { childId } = useParams<{ childId: string }>();
  const [selectedChild, setSelectedChild] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState<ChildStatistics | null>(null);
  const [analysis, setAnalysis] = useState<DanceAnalysis | null>(null);
  const [trends, setTrends] = useState<ImprovementTrends | null>(null);
  const [summary, setSummary] = useState<PerformanceSummary | null>(null);
  const [gameHistory, setGameHistory] = useState<DanceDoodleGameRecord[]>([]);
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
        fetch(`http://localhost:8087/api/dance-doodle/child/${childId}/statistics`),
        fetch(`http://localhost:8087/api/dance-doodle/child/${childId}/pose-analysis`),
        fetch(`http://localhost:8087/api/dance-doodle/child/${childId}/improvement-trends`),
        fetch(`http://localhost:8087/api/dance-doodle/child/${childId}/performance-summary`),
        fetch(`http://localhost:8087/api/dance-doodle/child/${childId}/history?page=0&size=10`)
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
        poseCompletionCounts: {},
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
        bestPose: 'No data yet',
        bestTime: 0,
        worstPose: 'No data yet',
        worstTime: 0,
        totalCompletedPoses: 0
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
        poseCompletionCounts: {},
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
        bestPose: 'No data yet',
        bestTime: 0,
        worstPose: 'No data yet',
        worstTime: 0,
        totalCompletedPoses: 0
      });
      setGameHistory([]);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  const loadGameHistory = async (page: number) => {
    try {
      const response = await fetch(`http://localhost:8087/api/dance-doodle/child/${selectedChild.id}/history?page=${page}&size=10`);
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

  const getPoseTime = (record: DanceDoodleGameRecord, poseName: string): number | null => {
    const poseMap: Record<string, keyof DanceDoodleGameRecord> = {
      'Cool Arms 💪': 'cool_arms',
      'Open Wings 🦋': 'open_wings',
      'Silly Boxer 🥊': 'silly_boxer',
      'Happy Stand 😊': 'happy_stand',
      'Crossy Play ✌️': 'crossy_play',
      'Shh Fun 🤫': 'shh_fun',
      'Stretch 🤸': 'stretch'
    };
    
    const field = poseMap[poseName];
    if (!field) return null;
    
    const value = record[field] as number;
    // Return the value if it's a number AND not null/undefined, otherwise return null
    return (typeof value === 'number' && value !== null && value !== undefined) ? value : null;
  };

  const getAverageTime = (poseName: string): number => {
    if (!statistics?.averageCompletionTimes) return 0;
    
    // Map pose display names to field names
    const poseMap: Record<string, string> = {
      'Cool Arms 💪': 'cool_arms',
      'Open Wings 🦋': 'open_wings',
      'Silly Boxer 🥊': 'silly_boxer',
      'Happy Stand 😊': 'happy_stand',
      'Crossy Play ✌️': 'crossy_play',
      'Shh Fun 🤫': 'shh_fun',
      'Stretch 🤸': 'stretch'
    };
    
    const fieldName = poseMap[poseName];
    if (!fieldName) return 0;
    
    const value = statistics.averageCompletionTimes[fieldName];
    return (typeof value === 'number' && value !== null && value !== undefined) ? value : 0;
  };

  const getCompletionCount = (poseName: string): number => {
    if (!statistics?.poseCompletionCounts) return 0;
    
    // Map pose display names to field names
    const poseMap: Record<string, string> = {
      'Cool Arms 💪': 'cool_arms',
      'Open Wings 🦋': 'open_wings',
      'Silly Boxer 🥊': 'silly_boxer',
      'Happy Stand 😊': 'happy_stand',
      'Crossy Play ✌️': 'crossy_play',
      'Shh Fun 🤫': 'shh_fun',
      'Stretch 🤸': 'stretch'
    };
    
    const fieldName = poseMap[poseName];
    if (!fieldName) return 0;
    
    const value = statistics.poseCompletionCounts[fieldName];
    return (typeof value === 'number' && value !== null && value !== undefined) ? value : 0;
  };

  const getCompletionRatio = (poseName: string): number => {
    const totalGames = statistics?.totalGames || 0;
    if (totalGames === 0) return 0;
    return (getCompletionCount(poseName) / totalGames) * 100;
  };

  // Prepare chart data
  const averageTimesData = DANCE_POSES.map((name, index) => ({
    pose: name,
    averageTime: getAverageTime(name),
    completionRatio: getCompletionRatio(name),
    color: COLORS[index % COLORS.length]
  }));

  const performanceData = DANCE_POSES.map((name, index) => ({
    pose: name,
    average: getAverageTime(name),
    color: COLORS[index % COLORS.length]
  }));

  const consistencyData = DANCE_POSES.map((name, index) => {
    // Map pose display names to field names
    const poseMap: Record<string, string> = {
      'Cool Arms 💪': 'cool_arms',
      'Open Wings 🦋': 'open_wings',
      'Silly Boxer 🥊': 'silly_boxer',
      'Happy Stand 😊': 'happy_stand',
      'Crossy Play ✌️': 'crossy_play',
      'Shh Fun 🤫': 'shh_fun',
      'Stretch 🤸': 'stretch'
    };
    
    const fieldName = poseMap[name];
    const consistencyValue = fieldName ? (analysis?.consistencyScore?.[fieldName] || 0) : 0;
    
    return {
      pose: name,
      consistency: consistencyValue,
      color: COLORS[index % COLORS.length]
    };
  });

  const trendData = DANCE_POSES.map((name, index) => {
    // Map pose display names to field names
    const poseMap: Record<string, string> = {
      'Cool Arms 💪': 'cool_arms',
      'Open Wings 🦋': 'open_wings',
      'Silly Boxer 🥊': 'silly_boxer',
      'Happy Stand 😊': 'happy_stand',
      'Crossy Play ✌️': 'crossy_play',
      'Shh Fun 🤫': 'shh_fun',
      'Stretch 🤸': 'stretch'
    };
    
    const fieldName = poseMap[name];
    const trendValue = fieldName ? (trends?.overallTrend?.[fieldName] || 0) : 0;
    
    return {
      pose: name,
      trend: trendValue,
      color: COLORS[index % COLORS.length]
    };
  });

  // Session improvement curve data
  const sessionImprovementData = gameHistory.map((record, index) => {
    const completedTimes = DANCE_POSES.map(pose => getPoseTime(record, pose)).filter(time => time !== null) as number[];
    const totalTime = completedTimes.reduce((sum, time) => sum + time, 0);
    const completedPoses = completedTimes.length;
    const averageTime = completedPoses > 0 ? totalTime / completedPoses : 0;
    
    return {
      session: `Session ${gameHistory.length - index}`,
      averageTime: Math.round(averageTime * 100) / 100,
      completedPoses,
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

  // Prepare session data for performance curve - ONLY REAL DATA
  const sessionData = gameHistory.map((record, index) => {
    const completedTimes = DANCE_POSES.map(pose => getPoseTime(record, pose)).filter(time => time !== null) as number[];
    const totalTime = completedTimes.reduce((sum, time) => sum + time, 0);
    
    return {
      session: `Session ${gameHistory.length - index}`,
      totalTime: Math.round(totalTime * 100) / 100,
      date: formatDateTime(record.dateTime),
      sessionNumber: gameHistory.length - index
    };
  }).reverse();

  if (loading) {
    return (
      <div className="min-h-screen bg-soft font-nunito">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <div className="text-2xl font-playful text-primary">Loading insights... 🕺</div>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 font-nunito relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-20 left-10 text-4xl animate-bounce" style={{ animationDelay: '0s' }}>🕺</div>
        <div className="absolute top-40 right-20 text-3xl animate-float" style={{ animationDelay: '1s' }}>✨</div>
        <div className="absolute bottom-40 left-20 text-3xl animate-wiggle" style={{ animationDelay: '2s' }}>🎯</div>
        <div className="absolute bottom-20 right-10 text-4xl animate-pulse-fun" style={{ animationDelay: '0.5s' }}>🏆</div>
        <div className="absolute top-1/2 left-1/4 text-2xl animate-float" style={{ animationDelay: '1.5s' }}>🌟</div>
        <div className="absolute top-1/3 right-1/3 text-3xl animate-bounce" style={{ animationDelay: '0.8s' }}>💃</div>
        
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
              Dance Game Hub 🕺
            </h1>
            <p className="text-xl font-comic text-gray-600 max-w-2xl mx-auto">
              Master dance poses with fun challenges! Track your progress and see your improvements.
            </p>
          </div>
        </div>

        {/* No Data Message */}
        {!hasData && (
          <Card className="card-playful backdrop-blur-sm bg-white/90 border-2 border-yellow-200 shadow-xl">
            <CardContent className="p-12 text-center">
              <div className="text-8xl mb-6 animate-bounce">🕺</div>
              <h2 className="text-3xl font-playful text-primary mb-4">
                Ready to Start Your Journey?
              </h2>
              <p className="text-lg font-comic text-muted-foreground mb-8 max-w-md mx-auto">
                {selectedChild.name} hasn't played the Dance Game yet. 
                Start playing to unlock amazing insights and track your progress!
              </p>
              <Button 
                onClick={() => navigate('/games/dance-doodle')}
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
              <div className="text-2xl mb-2 animate-bounce">🕺</div>
              <h3 className="text-lg font-playful text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-1">
                Ready for Another Challenge?
              </h3>
              <p className="text-xs font-comic text-gray-600 mb-3 max-w-sm mx-auto">
                Keep improving your dance pose skills!
              </p>
              <Button 
                onClick={() => navigate('/games/dance-doodle')}
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
                  📊 Trends
                </TabsTrigger>
                <TabsTrigger value="consistency" className="flex-1 py-4 px-6 text-base font-semibold rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:scale-105 hover:bg-white/50 hover:scale-105 transition-all duration-300">
                  🎯 Consistency
                </TabsTrigger>
                <TabsTrigger value="history" className="flex-1 py-4 px-6 text-base font-semibold rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:scale-105 hover:bg-white/50 hover:scale-105 transition-all duration-300">
                  📋 History
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-8">
                {/* Hero Stats Section */}
                <div className="relative">
                  {/* Background decorative elements */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-100/30 via-purple-100/30 to-pink-100/30 rounded-3xl"></div>
                  <div className="absolute top-4 left-4 text-6xl animate-bounce opacity-20">🕺</div>
                  <div className="absolute top-8 right-8 text-4xl animate-float opacity-20">✨</div>
                  <div className="absolute bottom-4 left-1/2 text-5xl animate-pulse-fun opacity-20">🏆</div>
                  
                  <div className="relative bg-gradient-to-br from-white/95 to-white/85 backdrop-blur-sm rounded-3xl border-2 border-blue-200/50 shadow-2xl p-8">
                    <div className="text-center mb-8">
                      <h3 className="text-3xl font-playful text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 mb-2">
                        Your Amazing Progress! 🌟
                      </h3>
                      <p className="text-lg font-comic text-gray-600">
                        Let's see how {selectedChild.name} is doing with dance poses!
                      </p>
                    </div>
                    
                    {/* Main Stats Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                      {/* Total Sessions */}
                      <div className="group relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 to-emerald-400/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                        <div className="relative bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border-2 border-green-200 p-6 text-center hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl">
                          <div className="text-4xl mb-3 animate-bounce">🕺</div>
                          <div className="text-4xl font-bold text-green-600 mb-2">
                            {statistics?.totalGames || 0}
                          </div>
                          <div className="text-sm font-comic text-green-700 font-semibold">
                            Games Played
                          </div>
                          <div className="text-xs text-green-600 mt-1">
                            Keep dancing! 🚀
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
                            Per pose
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
                              const totalPoses = Object.values(statistics?.poseCompletionCounts || {}).reduce((sum, count) => sum + count, 0);
                              const totalPossible = (statistics?.totalGames || 0) * 9; // 9 dance poses
                              const accuracy = totalPossible > 0 ? (totalPoses / totalPossible) * 100 : 0;
                              return accuracy.toFixed(0);
                            })()}%
                          </div>
                          <div className="text-sm font-comic text-purple-700 font-semibold">
                            Accuracy
                          </div>
                          <div className="text-xs text-purple-600 mt-1">
                            Poses completed
                          </div>
                        </div>
                      </div>

                      {/* Best Pose */}
                      <div className="group relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/20 to-green-400/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                        <div className="relative bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl border-2 border-emerald-200 p-6 text-center hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl">
                          <div className="text-4xl mb-3 animate-bounce">🏆</div>
                          {(() => {
                            const avgTimes = Object.entries(statistics?.averageCompletionTimes || {});
                            if (avgTimes.length === 0) {
                              return (
                                <>
                                  <div className="text-3xl font-bold text-emerald-600 mb-2">--</div>
                                  <div className="text-sm font-comic text-emerald-700 font-semibold">
                                    Best Pose
                                  </div>
                                  <div className="text-xs text-emerald-600 mt-1">
                                    Coming soon!
                                  </div>
                                </>
                              );
                            }
                            
                            const validAvgTimes = avgTimes.filter(([_, time]) => time > 0);
                            if (validAvgTimes.length === 0) {
                              return (
                                <>
                                  <div className="text-3xl font-bold text-emerald-600 mb-2">--</div>
                                  <div className="text-sm font-comic text-emerald-700 font-semibold">
                                    Best Pose
                                  </div>
                                  <div className="text-xs text-emerald-600 mt-1">
                                    No completed poses yet
                                  </div>
                                </>
                              );
                            }
                            const bestPose = validAvgTimes.reduce((min, current) => current[1] < min[1] ? current : min);
                            return (
                              <>
                                <div className="text-3xl font-bold text-emerald-600 mb-2">
                                  {bestPose[1].toFixed(1)}s
                                </div>
                                <div className="text-sm font-comic text-emerald-700 font-semibold">
                                  Best Pose
                                </div>
                                <div className="text-xs text-emerald-600 mt-1">
                                  {bestPose[0]}
                                </div>
                              </>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Performance Highlights Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Fastest Pose */}
                  <div className="group relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-400/10 to-emerald-400/10 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                    <div className="relative bg-gradient-to-br from-green-50/90 to-emerald-50/90 backdrop-blur-sm rounded-3xl border-2 border-green-200/70 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
                      {/* Decorative elements */}
                      <div className="absolute top-4 right-4 text-6xl opacity-20 animate-float">⚡</div>
                      <div className="absolute bottom-4 left-4 text-4xl opacity-20 animate-bounce">🚀</div>
                      
                      <div className="p-8 relative z-10">
                        <div className="text-center">
                          <div className="text-5xl mb-4 animate-bounce">🏆</div>
                          <h3 className="text-2xl font-playful text-green-700 mb-6">Fastest Pose</h3>
                          
                          {(() => {
                            const avgTimes = Object.entries(statistics?.averageCompletionTimes || {});
                            if (avgTimes.length === 0) {
                              return (
                                <div className="space-y-4">
                                  <div className="bg-white/70 rounded-2xl p-6 border border-green-200/50">
                                    <div className="text-4xl mb-3">🤔</div>
                                    <div className="text-2xl font-bold text-green-600 mb-2">No data yet</div>
                                    <div className="text-lg font-comic text-green-700">
                                      Start dancing to see results!
                                    </div>
                                  </div>
                                  <div className="text-sm text-green-600 font-comic">
                                    Ready to set records! 🚀
                                  </div>
                                </div>
                              );
                            }
                            
                            const validAvgTimes = avgTimes.filter(([_, time]) => time > 0);
                            if (validAvgTimes.length === 0) {
                              return (
                                <div className="space-y-4">
                                  <div className="bg-white/70 rounded-2xl p-6 border border-green-200/50">
                                    <div className="text-4xl mb-3">🤔</div>
                                    <div className="text-2xl font-bold text-green-600 mb-2">No data yet</div>
                                    <div className="text-lg font-comic text-green-700">
                                      Start dancing to see results!
                                    </div>
                                  </div>
                                  <div className="text-sm text-green-600 font-comic">
                                    Ready to set records! 🚀
                                  </div>
                                </div>
                              );
                            }
                            const bestPose = validAvgTimes.reduce((min, current) => current[1] < min[1] ? current : min);
                            return (
                              <div className="space-y-4">
                                <div className="bg-white/70 rounded-2xl p-6 border border-green-200/50">
                                  <div className="text-3xl mb-3">{bestPose[0]}</div>
                                  <div className="text-5xl font-bold text-green-600 mb-2 animate-pulse">
                                    {bestPose[1].toFixed(1)}s
                                  </div>
                                  <div className="text-lg font-comic text-green-700">
                                    Average completion time
                                  </div>
                                </div>
                                <div className="text-sm text-green-600 font-comic">
                                  Amazing speed! Keep it up! 🎉
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Slowest Pose */}
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
                          
                          {(() => {
                            const avgTimes = Object.entries(statistics?.averageCompletionTimes || {});
                            if (avgTimes.length === 0) {
                              return (
                                <div className="space-y-4">
                                  <div className="bg-white/70 rounded-2xl p-6 border border-red-200/50">
                                    <div className="text-4xl mb-3">🤔</div>
                                    <div className="text-2xl font-bold text-red-600 mb-2">No data yet</div>
                                    <div className="text-lg font-comic text-red-700">
                                      Start dancing to see results!
                                    </div>
                                  </div>
                                  <div className="text-sm text-red-600 font-comic">
                                    Ready to improve! 💪
                                  </div>
                                </div>
                              );
                            }
                            
                            const validAvgTimes = avgTimes.filter(([_, time]) => time > 0);
                            if (validAvgTimes.length === 0) {
                              return (
                                <div className="space-y-4">
                                  <div className="bg-white/70 rounded-2xl p-6 border border-red-200/50">
                                    <div className="text-4xl mb-3">🤔</div>
                                    <div className="text-2xl font-bold text-red-600 mb-2">No data yet</div>
                                    <div className="text-lg font-comic text-red-700">
                                      Start dancing to see results!
                                    </div>
                                  </div>
                                  <div className="text-sm text-red-600 font-comic">
                                    Ready to improve! 💪
                                  </div>
                                </div>
                              );
                            }
                            const worstPose = validAvgTimes.reduce((max, current) => current[1] > max[1] ? current : max);
                            return (
                              <div className="space-y-4">
                                <div className="bg-white/70 rounded-2xl p-6 border border-red-200/50">
                                  <div className="text-3xl mb-3">{worstPose[0]}</div>
                                  <div className="text-5xl font-bold text-red-600 mb-2 animate-pulse">
                                    {worstPose[1].toFixed(1)}s
                                  </div>
                                  <div className="text-lg font-comic text-red-700">
                                    Average completion time
                                  </div>
                                </div>
                                <div className="text-sm text-red-600 font-comic">
                                  Practice makes perfect! 💪
                                </div>
                              </div>
                            );
                          })()}
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
                        Every practice session makes you better at dance poses. 
                        You're doing amazing, {selectedChild.name}! 🎉
                      </p>
                      <div className="flex justify-center space-x-4 text-2xl">
                        <span className="animate-float" style={{ animationDelay: '0s' }}>🕺</span>
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
                        Deep dive into {selectedChild.name}'s dance pose mastery!
                      </p>
                    </div>
                  </div>
                </div>

                {/* Performance Curve Section */}
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
                        <h3 className="text-2xl font-playful text-green-700 mb-2">Session Performance Curve</h3>
                        <p className="text-sm font-comic text-green-600">
                          Total time taken to complete each session (sum of all pose completion times)
                        </p>
                      </div>
                      
                      <div className="bg-white/70 rounded-2xl p-4 border border-green-200/50">
                        {sessionData.length > 0 ? (
                          <ResponsiveContainer width="100%" height={400}>
                            <LineChart data={sessionData}>
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
                                  `${value}s`, 
                                  'Total Time'
                                ]}
                                labelFormatter={(label) => `Session ${label}`}
                              />
                              <Line 
                                type="monotone" 
                                dataKey="totalTime" 
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
                            <div className="text-sm text-green-500">Start playing to see your performance curve!</div>
                          </div>
                        )}
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
                        {selectedChild.name} is showing amazing progress in dance poses! 
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
                        {statistics?.totalGames === 1 
                          ? "Your first game! This sets your baseline performance. Play more games to see improvement trends."
                          : "Visual comparison of average vs last session performance"
                        }
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {gameHistory.length > 0 ? (
                        <div className="space-y-4">
                          {DANCE_POSES.map((pose) => {
                            const lastSessionTime = getPoseTime(gameHistory[0], pose);
                            const averageTime = getAverageTime(pose);
                            
                            // Show all poses, even if not completed in last session
                            // Note: We include averageTime === 0 as it represents valid completion in 0 seconds
                            
                            const isCompleted = lastSessionTime !== null && lastSessionTime !== undefined;
                            const hasAverageData = averageTime >= 0 && statistics?.totalGames > 1;
                            const difference = isCompleted && hasAverageData ? (lastSessionTime - averageTime) : 0;
                            const differenceAbs = Math.abs(difference);
                            const isImproving = isCompleted && hasAverageData && difference < 0;
                            const percentageChange = isCompleted && hasAverageData && averageTime > 0 ? Math.abs((difference / averageTime) * 100) : 0;
                            
                            return (
                              <div key={pose} className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-200 hover:scale-105 transition-all">
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center gap-2">
                                    <span className="text-2xl">{pose.split(' ').pop()}</span>
                                    <span className="font-comic text-base font-medium">{pose.split(' ').slice(0, -1).join(' ')}</span>
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
                                    <div className="text-lg font-bold text-blue-700">
                                      {hasAverageData ? `${averageTime.toFixed(1)}s` : (statistics?.totalGames === 1 ? 'First game' : 'No data')}
                                    </div>
                                  </div>
                                  <div className="text-center p-3 bg-purple-100 rounded-lg border border-purple-200">
                                    <div className="text-xs text-purple-600 font-medium mb-1">Last Session</div>
                                    <div className={`text-lg font-bold ${isCompleted ? 'text-purple-700' : 'text-gray-500'}`}>
                                      {isCompleted ? `${lastSessionTime.toFixed(1)}s` : 'Not done'}
                                    </div>
                                  </div>
                                  <div className="text-center p-3 bg-gray-100 rounded-lg border border-gray-200">
                                    <div className="text-xs text-gray-600 font-medium mb-1">Difference</div>
                                    <div className={`text-lg font-bold ${!isCompleted ? 'text-gray-500' : (hasAverageData ? (isImproving ? 'text-green-600' : 'text-red-600') : 'text-blue-600')}`}>
                                      {!isCompleted ? 'N/A' : 
                                       !hasAverageData ? 'Baseline' : 
                                       (isImproving ? '-' : '+') + `${differenceAbs.toFixed(1)}s`}
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="mt-3">
                                  <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                                    <span>Performance</span>
                                    <span>{!isCompleted ? 'Not Attempted' : 
                                           !hasAverageData ? 'Baseline Set' : 
                                           (isImproving ? 'Better' : 'Needs Work')}</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                      className={`h-2 rounded-full transition-all duration-700 ${
                                        !isCompleted
                                          ? 'bg-gray-400'
                                          : !hasAverageData
                                            ? 'bg-gradient-to-r from-blue-400 to-blue-600'
                                            : isImproving 
                                              ? 'bg-gradient-to-r from-green-400 to-green-600' 
                                              : 'bg-gradient-to-r from-red-400 to-red-600'
                                      }`}
                                      style={{ 
                                        width: `${!isCompleted ? 0 : !hasAverageData ? 50 : Math.min(percentageChange * 2, 100)}%`,
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
                      How consistent the performance is for each pose
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <RadarChart data={consistencyData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="pose" tick={{ fontSize: 10 }} />
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
                       Your recent performance history with detailed pose breakdowns
                     </CardDescription>
                   </CardHeader>
                   <CardContent>
                     <div className="space-y-4">
                       {gameHistory.slice(currentPage * 5, (currentPage + 1) * 5).map((record, index) => {
                         const completedTimes = DANCE_POSES.map(pose => getPoseTime(record, pose)).filter(time => time !== null) as number[];
                         const totalTime = completedTimes.reduce((sum, time) => sum + time, 0);
                         const completedPoses = completedTimes.length;
                         const averageTime = completedPoses > 0 ? totalTime / completedPoses : 0;
                         const completionRate = (completedPoses / DANCE_POSES.length) * 100;
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
                                 <div className="text-sm font-bold text-blue-600">{completedPoses}</div>
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

                             {/* Pose-by-Pose Breakdown */}
                             <div className="border-t pt-3">
                               <div className="text-xs font-semibold text-gray-600 mb-2">Pose Performance:</div>
                               <div className="grid grid-cols-2 gap-2">
                                 {DANCE_POSES.map((pose) => {
                                   const time = getPoseTime(record, pose);
                                   const isCompleted = time !== null && time !== undefined;
                                   
                                   // Extract emoji and name properly
                                   const emoji = pose.split(' ').pop(); // Get the emoji
                                   const name = pose.split(' ').slice(0, -1).join(' '); // Get the name without emoji
                                   
                                   return (
                                     <div key={pose} className={`flex items-center justify-between p-2 rounded text-xs ${
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
                           disabled={currentPage >= totalPages - 1}
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

