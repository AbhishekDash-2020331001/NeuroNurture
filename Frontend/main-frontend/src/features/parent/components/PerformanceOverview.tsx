import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { performanceOverviewService, type PerformanceOverview } from '@/shared/services/game/performanceOverviewService';
import { Activity, BarChart3, Brain, RefreshCw, Sparkles, Star, Target, TrendingUp, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';

interface PerformanceOverviewProps {
  childId: string;
  childName: string;
}

export default function PerformanceOverview({ childId, childName }: PerformanceOverviewProps) {
  const [overview, setOverview] = useState<PerformanceOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPerformanceOverview = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await performanceOverviewService.getChildPerformanceOverview(childId);
      setOverview(data);
    } catch (err) {
      console.error('Error fetching performance overview:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      
      // Check if it's a connection error
      if (errorMessage.includes('Failed to fetch') || errorMessage.includes('Connection refused')) {
        setError('AI service is temporarily unavailable. Performance insights will be available once the service is restored.');
      } else {
        setError('Failed to load performance insights. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (childId) {
      fetchPerformanceOverview();
    }
  }, [childId]);

  const getPerformanceIcon = () => {
    if (!overview?.has_data) return <Activity className="w-6 h-6 text-white" />;
    
    const totalSessions = Object.values(overview.performance_summary || {}).reduce((total, game) => {
      if (typeof game === 'object' && 'sessions' in game) {
        return total + (game.sessions || 0);
      }
      return total;
    }, 0);

    if (totalSessions >= 20) return <Star className="w-6 h-6 text-white" />;
    if (totalSessions >= 10) return <TrendingUp className="w-6 h-6 text-white" />;
    return <Target className="w-6 h-6 text-white" />;
  };

  const getPerformanceColor = () => {
    if (!overview?.has_data) return 'border-gray-200 bg-gray-50';
    
    const totalSessions = Object.values(overview.performance_summary || {}).reduce((total, game) => {
      if (typeof game === 'object' && 'sessions' in game) {
        return total + (game.sessions || 0);
      }
      return total;
    }, 0);

    if (totalSessions >= 20) return 'border-yellow-200 bg-yellow-50';
    if (totalSessions >= 10) return 'border-green-200 bg-green-50';
    return 'border-blue-200 bg-blue-50';
  };

  if (isLoading) {
    return (
      <div className="relative">
        <Card className="p-8 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-0 shadow-xl backdrop-blur-sm">
          {/* Animated background gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-indigo-600/5 to-purple-600/5 rounded-lg animate-pulse"></div>
          
          <div className="relative z-10">
            <div className="flex items-center space-x-4 mb-6">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                  <Brain className="w-6 h-6 text-white animate-pulse" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full animate-bounce">
                  <Sparkles className="w-3 h-3 text-white p-0.5" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  AI Performance Insights
                </h3>
                <p className="text-sm text-gray-500 font-medium">Analyzing learning patterns...</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-lg animate-pulse"></div>
              <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-lg animate-pulse w-4/5"></div>
              <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-lg animate-pulse w-3/5"></div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative">
        <Card className="p-8 bg-gradient-to-br from-red-50 via-orange-50 to-red-50 border-0 shadow-xl backdrop-blur-sm">
          {/* Subtle animated background */}
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 via-orange-500/5 to-red-500/5 rounded-lg"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-600 rounded-full flex items-center justify-center shadow-lg">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full animate-pulse flex items-center justify-center">
                    <span className="text-white text-xs">!</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-red-700 to-orange-700 bg-clip-text text-transparent">
                    AI Performance Insights
                  </h3>
                  <p className="text-sm text-red-600 font-medium">Connection Issue</p>
                </div>
              </div>
              <Button
                onClick={fetchPerformanceOverview}
                size="sm"
                className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl border border-red-200 shadow-sm">
              <p className="text-red-700 leading-relaxed font-medium">{error}</p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative">
      <Card className="p-0 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 border-0 shadow-2xl backdrop-blur-sm overflow-hidden">
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-purple-600/10"></div>
          <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-transparent rounded-full blur-xl"></div>
          <div className="absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-tl from-purple-400/20 to-transparent rounded-full blur-xl"></div>
        </div>
        
        <div className="relative z-10 p-8">
          {/* Header Section */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-xl">
                  {getPerformanceIcon()}
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-3xl font-bold bg-gradient-to-r from-gray-800 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
                  AI Performance Insights
                </h3>
                <p className="text-base text-gray-600 font-medium flex items-center mt-1">
                  <BarChart3 className="w-4 h-4 mr-2 text-blue-500" />
                  Powered by Advanced Learning Analytics
                </p>
              </div>
            </div>
            <Button
              onClick={fetchPerformanceOverview}
              size="sm"
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
          
          {/* Main Content */}
          <div className="space-y-6">
            {/* AI Insights Text */}
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl border border-white/50 shadow-lg">
              <div className="flex items-start space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-md">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-gray-800 mb-1">Learning Analysis</h4>
                  <p className="text-sm text-gray-500">Generated by our AI learning engine</p>
                </div>
              </div>
              
              <div className="prose prose-base max-w-none">
                <p className="text-gray-700 leading-relaxed text-base font-medium whitespace-pre-line">
                  {overview?.overview || 'No performance data available yet. Encourage your child to play the educational games to start tracking their progress!'}
                </p>
              </div>
            </div>
            
            {/* Getting Started Section */}
            {!overview?.has_data && !error && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200/50 shadow-lg">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                    <Brain className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-blue-800">Getting Started</h4>
                    <p className="text-sm text-blue-600">Ready to begin the learning journey</p>
                  </div>
                </div>
                <p className="text-blue-700 font-medium leading-relaxed">
                  Once {childName} starts playing the educational games, our AI will analyze their learning patterns and provide personalized insights about their cognitive development and progress.
                </p>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
