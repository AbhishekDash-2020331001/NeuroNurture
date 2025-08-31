import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getCurrentChild } from '@/utils/childUtils';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import { ResponsiveContainer } from 'recharts';

interface DanceDoodleGameRecord {
  id: number;
  sessionId: string;
  dateTime: string;
  childId: string;
  age: number;
  cool_arms?: number;
  open_wings?: number;
  silly_boxer?: number;
  happy_stand_left?: number;
  happy_stand_right?: number;
  crossy_play?: number;
  shh_fun?: number;
  stretch_left?: number;
  stretch_right?: number;
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

const DANCE_POSES = [
  'Cool Arms 💪', 'Open Wings 🦋', 'Silly Boxer 🥊', 'Happy Stand Left 😊', 'Happy Stand Right 😊',
  'Crossy Play ✌️', 'Shh Fun 🤫', 'Stretch Left 🤸', 'Stretch Right 🤸'
];

export default function DanceDoodleGameInsights() {
  const navigate = useNavigate();
  const [selectedChild, setSelectedChild] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [hasData, setHasData] = useState(false);
  const [statistics, setStatistics] = useState<ChildStatistics | null>(null);
  const [gameHistory, setGameHistory] = useState<DanceDoodleGameRecord[]>([]);

  useEffect(() => {
    const childData = getCurrentChild();
    if (childData) {
      setSelectedChild(childData);
      loadAllData(childData.id);
    }
  }, []);

  const loadAllData = async (childId: string) => {
    setLoading(true);
    try {
      const [statsRes, historyRes] = await Promise.all([
        fetch(`http://localhost:8087/api/dance-doodle/child/${childId}/statistics`),
        fetch(`http://localhost:8087/api/dance-doodle/child/${childId}/history?page=0&size=50`)
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStatistics(statsData);
        setHasData(statsData.totalGames > 0);
      } else {
        setHasData(false);
      }

      if (historyRes.ok) {
        const historyData = await historyRes.json();
        setGameHistory(historyData.content || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setHasData(false);
    } finally {
      setLoading(false);
    }
  };

  const getPoseTime = (record: DanceDoodleGameRecord, poseName: string): number | null => {
    const poseMap: Record<string, keyof DanceDoodleGameRecord> = {
      'Cool Arms 💪': 'cool_arms',
      'Open Wings 🦋': 'open_wings',
      'Silly Boxer 🥊': 'silly_boxer',
      'Happy Stand Left 😊': 'happy_stand_left',
      'Happy Stand Right 😊': 'happy_stand_right',
      'Crossy Play ✌️': 'crossy_play',
      'Shh Fun 🤫': 'shh_fun',
      'Stretch Left 🤸': 'stretch_left',
      'Stretch Right 🤸': 'stretch_right'
    };
    
    const field = poseMap[poseName];
    return field ? (record[field] as number) || null : null;
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

  // Prepare session data for performance curve - ONLY REAL DATA
  const sessionData = gameHistory.map((record, index) => {
    const totalTime = DANCE_POSES.reduce((sum, pose) => {
      const time = getPoseTime(record, pose);
      return sum + (time || 0);
    }, 0);
    
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

        {/* Data Available Message */}
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
                            
                            const bestPose = avgTimes.reduce((min, current) => current[1] < min[1] ? current : min);
                            return (
                              <>
                                <div className="text-3xl font-bold text-emerald-600 mb-2">
                                  {(Number(bestPose[1]) || 0).toFixed(1)}s
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
                            
                            const bestPose = avgTimes.reduce((min, current) => (Number(current[1]) || 0) < (Number(min[1]) || 0) ? current : min);
                            return (
                              <div className="space-y-4">
                                <div className="bg-white/70 rounded-2xl p-6 border border-green-200/50">
                                  <div className="text-3xl mb-3">{bestPose[0]}</div>
                                  <div className="text-5xl font-bold text-green-600 mb-2 animate-pulse">
                                    {(Number(bestPose[1]) || 0).toFixed(1)}s
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
                            
                            const worstPose = avgTimes.reduce((max, current) => (Number(current[1]) || 0) > (Number(max[1]) || 0) ? current : max);
                            return (
                              <div className="space-y-4">
                                <div className="bg-white/70 rounded-2xl p-6 border border-red-200/50">
                                  <div className="text-3xl mb-3">{worstPose[0]}</div>
                                  <div className="text-5xl font-bold text-red-600 mb-2 animate-pulse">
                                    {(Number(worstPose[1]) || 0).toFixed(1)}s
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
            </Tabs>
          </div>
        )}

        {/* Play Again Button */}
        <div className="text-center">
          <Button 
            onClick={() => navigate('/games/dance-doodle')}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-comic text-xl px-12 py-4 hover:scale-105 transition-all shadow-xl rounded-full"
          >
            🎮 Play Again!
          </Button>
        </div>
      </div>
    </div>
  );
}

