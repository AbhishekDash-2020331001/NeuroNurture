import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  BarChart3,
  Target,
  Calendar,
  Activity
} from 'lucide-react';

interface ProgressData {
  date: string;
  score: number;
  gameType: string;
}

interface ProgressChartProps {
  title?: string;
  data: ProgressData[];
  type?: 'line' | 'bar' | 'area';
  showTrend?: boolean;
  showTarget?: boolean;
  targetScore?: number;
  height?: number;
  color?: string;
}

const ProgressChart: React.FC<ProgressChartProps> = ({
  title = "Progress Chart",
  data,
  type = 'line',
  showTrend = true,
  showTarget = false,
  targetScore = 80,
  height = 200,
  color = 'purple'
}) => {
  // Calculate trend
  const calculateTrend = () => {
    if (data.length < 2) return { direction: 'stable', percentage: 0 };
    
    const firstScore = data[0].score;
    const lastScore = data[data.length - 1].score;
    const percentage = ((lastScore - firstScore) / firstScore) * 100;
    
    if (percentage > 5) return { direction: 'up', percentage: Math.abs(percentage) };
    if (percentage < -5) return { direction: 'down', percentage: Math.abs(percentage) };
    return { direction: 'stable', percentage: Math.abs(percentage) };
  };

  const trend = calculateTrend();
  const maxScore = Math.max(...data.map(d => d.score), targetScore);
  const minScore = Math.min(...data.map(d => d.score), 0);

  const getTrendIcon = () => {
    switch (trend.direction) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTrendColor = () => {
    switch (trend.direction) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getColorClasses = () => {
    switch (color) {
      case 'purple': return {
        bg: 'bg-purple-500',
        bgLight: 'bg-purple-100',
        text: 'text-purple-600',
        border: 'border-purple-200'
      };
      case 'blue': return {
        bg: 'bg-blue-500',
        bgLight: 'bg-blue-100',
        text: 'text-blue-600',
        border: 'border-blue-200'
      };
      case 'green': return {
        bg: 'bg-green-500',
        bgLight: 'bg-green-100',
        text: 'text-green-600',
        border: 'border-green-200'
      };
      default: return {
        bg: 'bg-purple-500',
        bgLight: 'bg-purple-100',
        text: 'text-purple-600',
        border: 'border-purple-200'
      };
    }
  };

  const colors = getColorClasses();

  // Simple chart rendering (in a real app, you'd use a charting library like Chart.js or Recharts)
  const renderSimpleChart = () => {
    if (data.length === 0) {
      return (
        <div className="flex items-center justify-center h-32 text-gray-500">
          <div className="text-center">
            <BarChart3 className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No data available</p>
          </div>
        </div>
      );
    }

    return (
      <div className="relative" style={{ height: `${height}px` }}>
        {/* Chart Area */}
        <div className="absolute inset-0 flex items-end justify-between px-4 pb-8">
          {data.map((point, index) => {
            const heightPercentage = ((point.score - minScore) / (maxScore - minScore)) * 100;
            return (
              <div key={index} className="flex flex-col items-center flex-1">
                <div className="relative">
                  <div
                    className={`w-8 ${colors.bg} rounded-t transition-all duration-300 hover:opacity-80`}
                    style={{ height: `${heightPercentage}%` }}
                    title={`${point.score}% on ${new Date(point.date).toLocaleDateString()}`}
                  ></div>
                  {type === 'line' && index < data.length - 1 && (
                    <div
                      className={`absolute top-0 left-4 w-8 h-0.5 ${colors.bg} transform rotate-12`}
                      style={{ 
                        height: '2px',
                        transform: `rotate(${Math.atan2(
                          ((data[index + 1].score - minScore) / (maxScore - minScore)) * height - heightPercentage * height / 100,
                          32
                        ) * 180 / Math.PI}deg)`
                      }}
                    ></div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Target Line */}
        {showTarget && (
          <div 
            className="absolute left-0 right-0 border-t-2 border-dashed border-gray-300"
            style={{ 
              bottom: `${((targetScore - minScore) / (maxScore - minScore)) * 100}%`,
              marginBottom: '32px'
            }}
          >
            <div className="absolute -top-2 -left-1 bg-white px-1">
              <span className="text-xs text-gray-500">Target: {targetScore}%</span>
            </div>
          </div>
        )}

        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between text-xs text-gray-500">
          <span>{maxScore}%</span>
          <span>{Math.round((maxScore + minScore) / 2)}%</span>
          <span>{minScore}%</span>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className={`p-2 ${colors.bgLight} rounded-lg`}>
            <BarChart3 className={`h-5 w-5 ${colors.text}`} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
        
        {showTrend && data.length > 0 && (
          <div className={`flex items-center space-x-1 ${getTrendColor()}`}>
            {getTrendIcon()}
            <span className="text-sm font-medium">
              {trend.percentage.toFixed(1)}%
            </span>
          </div>
        )}
      </div>

      {/* Chart */}
      <div className="mb-4">
        {renderSimpleChart()}
      </div>

      {/* Stats */}
      {data.length > 0 && (
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-1">Latest Score</p>
            <p className="text-lg font-bold text-gray-900">
              {data[data.length - 1].score}%
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-1">Average</p>
            <p className="text-lg font-bold text-gray-900">
              {Math.round(data.reduce((sum, d) => sum + d.score, 0) / data.length)}%
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-1">Best Score</p>
            <p className="text-lg font-bold text-gray-900">
              {Math.max(...data.map(d => d.score))}%
            </p>
          </div>
        </div>
      )}

      {/* Data Points */}
      {data.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Recent Activity</span>
            <span>{data.length} sessions</span>
          </div>
          <div className="space-y-2 max-h-24 overflow-y-auto">
            {data.slice(-3).reverse().map((point, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 ${colors.bg} rounded-full`}></div>
                  <span className="text-gray-600">
                    {new Date(point.date).toLocaleDateString()}
                  </span>
                </div>
                <span className="font-medium text-gray-900">{point.score}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressChart;
