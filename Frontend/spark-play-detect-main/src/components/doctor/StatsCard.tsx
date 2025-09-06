import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color?: 'purple' | 'blue' | 'green' | 'orange' | 'red' | 'yellow';
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'stable';
  };
  subtitle?: string;
  onClick?: () => void;
  className?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon: Icon,
  color = 'purple',
  trend,
  subtitle,
  onClick,
  className = ''
}) => {
  const getColorClasses = () => {
    switch (color) {
      case 'purple': return {
        bg: 'bg-purple-500',
        bgLight: 'bg-purple-100',
        text: 'text-purple-600',
        hover: 'hover:bg-purple-50'
      };
      case 'blue': return {
        bg: 'bg-blue-500',
        bgLight: 'bg-blue-100',
        text: 'text-blue-600',
        hover: 'hover:bg-blue-50'
      };
      case 'green': return {
        bg: 'bg-green-500',
        bgLight: 'bg-green-100',
        text: 'text-green-600',
        hover: 'hover:bg-green-50'
      };
      case 'orange': return {
        bg: 'bg-orange-500',
        bgLight: 'bg-orange-100',
        text: 'text-orange-600',
        hover: 'hover:bg-orange-50'
      };
      case 'red': return {
        bg: 'bg-red-500',
        bgLight: 'bg-red-100',
        text: 'text-red-600',
        hover: 'hover:bg-red-50'
      };
      case 'yellow': return {
        bg: 'bg-yellow-500',
        bgLight: 'bg-yellow-100',
        text: 'text-yellow-600',
        hover: 'hover:bg-yellow-50'
      };
      default: return {
        bg: 'bg-purple-500',
        bgLight: 'bg-purple-100',
        text: 'text-purple-600',
        hover: 'hover:bg-purple-50'
      };
    }
  };

  const getTrendColor = () => {
    if (!trend) return 'text-gray-500';
    switch (trend.direction) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-500';
    }
  };

  const getTrendIcon = () => {
    if (!trend) return null;
    switch (trend.direction) {
      case 'up': return '↗';
      case 'down': return '↘';
      default: return '→';
    }
  };

  const colors = getColorClasses();

  return (
    <div 
      className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 transition-all duration-200 ${
        onClick ? `cursor-pointer hover:shadow-md ${colors.hover}` : ''
      } ${className}`}
      onClick={onClick}
    >
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${colors.bg} text-white`}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="ml-4 flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <div className="flex items-baseline">
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {trend && (
              <span className={`ml-2 text-sm font-medium ${getTrendColor()}`}>
                {getTrendIcon()} {Math.abs(trend.value)}%
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
