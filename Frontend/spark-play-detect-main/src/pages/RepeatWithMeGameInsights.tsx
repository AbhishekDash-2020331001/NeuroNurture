import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getCurrentChild } from '@/utils/childUtils';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface RepeatGameRecord {
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
  isASD: boolean;
}

const ROUND_NAMES = ['Round 1', 'Round 2', 'Round 3', 'Round 4', 'Round 5'];

const RepeatWithMeGameInsights: React.FC = () => {
  const [gameData, setGameData] = useState<RepeatGameRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedChild, setSelectedChild] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const childData = getCurrentChild();
    if (childData) {
      setSelectedChild(childData);
      loadAllData(childData.id);
    } else {
      setError('No Child Selected');
      setLoading(false);
    }
  }, []);

  const loadAllData = async (childId: string) => {
    try {
      setLoading(true);
      setError(null);

      // Load all data in parallel
      const [statisticsResponse, performanceResponse, historyResponse] = await Promise.all([
        fetch(`http://localhost:8000/repeat-game/child/${childId}/statistics`),
        fetch(`http://localhost:8000/repeat-game/child/${childId}/performance-analysis`),
        fetch(`http://localhost:8000/repeat-game/child/${childId}/history?page=${currentPage}&size=5`)
      ]);

      if (!statisticsResponse.ok || !performanceResponse.ok || !historyResponse.ok) {
        throw new Error('Failed to fetch data from backend');
      }

      const [statistics, performance, history] = await Promise.all([
        statisticsResponse.json(),
        performanceResponse.json(),
        historyResponse.json()
      ]);

      setGameData(history.content || []);
      setTotalPages(history.totalPages || 0);
      setLoading(false);
    } catch (err) {
      console.error('Error loading repeat game data:', err);
      setError('Failed to load game data');
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    if (selectedChild) {
      loadAllData(selectedChild.id);
    }
  };

  if (error === 'No Child Selected') {
    return (
      <div className="min-h-screen bg-soft font-nunito">
        <Navbar />
        <div className="max-w-4xl mx-auto p-6">
          <Card className="card-playful border-2 border-primary/20 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-playful text-primary">
                🎤 Repeat with Me - Insights
              </CardTitle>
              <CardDescription className="text-lg">
                No child profile selected
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                Please select a child profile to view game insights.
              </p>
              <Button 
                onClick={() => navigate('/dashboard')}
                className="btn-fun"
              >
                Go to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-soft font-nunito">
        <Navbar />
        <div className="max-w-4xl mx-auto p-6">
          <Card className="card-playful border-2 border-primary/20 bg-white/80 backdrop-blur-sm">
            <CardContent className="text-center py-12">
              <div className="loading-spinner mx-auto mb-4"></div>
              <p className="text-lg text-muted-foreground">Loading game insights...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-soft font-nunito">
        <Navbar />
        <div className="max-w-4xl mx-auto p-6">
          <Card className="card-playful border-2 border-primary/20 bg-white/80 backdrop-blur-sm">
            <CardContent className="text-center py-12">
              <p className="text-lg text-red-600 mb-4">Error: {error}</p>
              <Button 
                onClick={() => selectedChild && loadAllData(selectedChild.id)}
                className="btn-fun"
              >
                Retry
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Prepare data for charts
  const performanceData = gameData.map((session, index) => ({
    session: `Session ${index + 1}`,
    averageScore: session.averageScore,
    round1: session.round1Count,
    round2: session.round2Count,
    round3: session.round3Count,
    round4: session.round4Count,
    round5: session.round5Count
  }));

  const trendsData = gameData.map((session, index) => {
    if (index === 0) return null;
    const previousSession = gameData[index - 1];
    const improvement = session.averageScore - previousSession.averageScore;
    const improvementPercent = previousSession.averageScore > 0 
      ? ((improvement / previousSession.averageScore) * 100).toFixed(1)
      : 0;
    
    return {
      session: `Session ${index + 1}`,
      currentScore: session.averageScore,
      previousScore: previousSession.averageScore,
      improvement: improvement > 0 ? `+${improvementPercent}%` : `${improvementPercent}%`,
      isImprovement: improvement > 0,
      isDecline: improvement < 0,
      isStable: improvement === 0
    };
  }).filter(Boolean);

  return (
    <div className="min-h-screen bg-soft font-nunito">
      <Navbar />
      
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-playful text-primary">🎤 Repeat with Me - Insights</h1>
          <p className="text-lg text-muted-foreground">
            Track your Bengali speech recognition progress and performance
          </p>
          {selectedChild && (
            <div className="inline-flex items-center space-x-2 bg-primary/10 px-4 py-2 rounded-full">
              <span className="text-primary font-medium">
                Viewing insights for: {selectedChild.name}
              </span>
            </div>
          )}
        </div>

        {/* Game Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="card-playful border-2 border-blue-200 bg-blue-50/50">
            <CardContent className="text-center p-4">
              <div className="text-2xl mb-2">🎯</div>
              <div className="text-2xl font-bold text-blue-600">{gameData.length}</div>
              <div className="text-sm text-blue-600">Total Sessions</div>
            </CardContent>
          </Card>
          
          <Card className="card-playful border-2 border-green-200 bg-green-50/50">
            <CardContent className="text-center p-4">
              <div className="text-2xl mb-2">⭐</div>
              <div className="text-2xl font-bold text-green-600">
                {gameData.length > 0 ? Math.round(gameData.reduce((sum, session) => sum + session.averageScore, 0) / gameData.length) : 0}%
              </div>
              <div className="text-sm text-green-600">Average Score</div>
            </CardContent>
          </Card>
          
          <Card className="card-playful border-2 border-purple-200 bg-purple-50/50">
            <CardContent className="text-center p-4">
              <div className="text-2xl mb-2">📈</div>
              <div className="text-2xl font-bold text-purple-600">
                {gameData.length > 0 ? Math.max(...gameData.map(s => s.averageScore)) : 0}%
              </div>
              <div className="text-sm text-purple-600">Best Score</div>
            </CardContent>
          </Card>
          
          <Card className="card-playful border-2 border-orange-200 bg-orange-50/50">
            <CardContent className="text-center p-4">
              <div className="text-2xl mb-2">🎮</div>
              <div className="text-2xl font-bold text-orange-600">
                {gameData.length > 0 ? gameData.reduce((sum, session) => sum + session.round1Count + session.round2Count + session.round3Count + session.round4Count + session.round5Count, 0) : 0}
              </div>
              <div className="text-sm text-orange-600">Total Rounds</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Card className="card-playful border-2 border-primary/20 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl font-playful text-primary text-center">
              📊 Bengali Speech Performance Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="performance" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="performance">Performance</TabsTrigger>
                <TabsTrigger value="improvement">Improvement</TabsTrigger>
                <TabsTrigger value="history">Session History</TabsTrigger>
              </TabsList>

              {/* Performance Tab */}
              <TabsContent value="performance" className="space-y-4">
                <h3 className="text-xl font-playful text-primary text-center mb-6">
                  Session-by-Session Performance
                </h3>
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
                      dataKey="averageScore"
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
              </TabsContent>

              {/* Improvement Tab */}
              <TabsContent value="improvement" className="space-y-4">
                <h3 className="text-xl font-playful text-primary text-center mb-6">
                  Session-by-Session Improvement
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {trendsData.map((item, index) => (
                    <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      {/* Session Header */}
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <div className="font-bold text-primary text-sm">
                            {item?.session}
                          </div>
                        </div>
                      </div>
                      {/* Session Summary */}
                      <div className="grid grid-cols-2 gap-2">
                        <div className="text-center p-2 bg-gray-50 rounded border border-gray-200">
                          <div className="text-sm font-bold text-gray-600">{item?.currentScore}%</div>
                          <div className="text-xs text-gray-500">current</div>
                        </div>
                        <div className={`text-center p-2 rounded border ${
                          item?.isImprovement
                            ? 'bg-green-100 border-green-300'
                            : item?.isDecline
                            ? 'bg-red-100 border-red-300'
                            : 'bg-gray-100 border-gray-300'
                        }`}>
                          <div className={`text-sm font-bold ${
                            item?.isImprovement ? 'text-green-700' :
                            item?.isDecline ? 'text-red-700' : 'text-gray-700'
                          }`}>
                            {item?.improvement}
                          </div>
                          <div className="text-xs text-gray-500">improvement</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              {/* Session History Tab */}
              <TabsContent value="history" className="space-y-4">
                <h3 className="text-xl font-playful text-primary text-center mb-6">
                  Game Session History
                </h3>
                <div className="space-y-4">
                  {gameData.map((session, index) => {
                    const previousSession = index > 0 ? gameData[index - 1] : null;
                    const improvement = previousSession ? session.averageScore - previousSession.averageScore : 0;
                    const improvementPercent = previousSession && previousSession.averageScore > 0 
                      ? ((improvement / previousSession.averageScore) * 100).toFixed(1)
                      : 0;
                    
                    let cardColor = 'border-gray-200 bg-gray-50/50';
                    let improvementColor = 'text-gray-600';
                    let improvementText = 'Baseline';
                    
                    if (previousSession) {
                      if (improvement > 0) {
                        cardColor = 'border-green-200 bg-green-50/50';
                        improvementColor = 'text-green-600';
                        improvementText = `+${improvementPercent}%`;
                      } else if (improvement < 0) {
                        cardColor = 'border-red-200 bg-red-50/50';
                        improvementColor = 'text-red-600';
                        improvementText = `${improvementPercent}%`;
                      } else {
                        cardColor = 'border-gray-200 bg-gray-50/50';
                        improvementColor = 'text-gray-600';
                        improvementText = '0%';
                      }
                    }
                    
                    return (
                      <Card key={session.id} className={`card-playful border-2 ${cardColor} hover:shadow-lg transition-all duration-300`}>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg text-primary">
                              Session {index + 1}
                            </CardTitle>
                            <div className="text-sm text-muted-foreground">
                              {new Date(session.dateTime).toLocaleDateString()}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {/* Score Overview */}
                          <div className="text-center">
                            <div className="text-3xl font-bold text-primary mb-2">
                              {session.averageScore}%
                            </div>
                            <div className="text-sm text-muted-foreground">Average Score</div>
                          </div>
                          
                          {/* Round Breakdown */}
                          <div className="grid grid-cols-5 gap-2">
                            {[session.round1Count, session.round2Count, session.round3Count, session.round4Count, session.round5Count].map((score, roundIndex) => (
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
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center space-x-2 mt-6">
                    <Button
                      variant="outline"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 0}
                      className="btn-fun"
                    >
                      Previous
                    </Button>
                    
                    <span className="text-sm text-muted-foreground">
                      Page {currentPage + 1} of {totalPages}
                    </span>
                    
                    <Button
                      variant="outline"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage >= totalPages - 1}
                      className="btn-fun"
                    >
                      Next
                    </Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Loading Spinner Styles */}
      <style>{`
        .loading-spinner {
          width: 50px;
          height: 50px;
          border: 5px solid #f3f3f3;
          border-top: 5px solid #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default RepeatWithMeGameInsights;