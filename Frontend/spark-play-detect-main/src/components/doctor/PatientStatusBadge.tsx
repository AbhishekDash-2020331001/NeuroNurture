import React from 'react';
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Activity,
  Heart,
  Zap
} from 'lucide-react';

interface PatientStatusBadgeProps {
  status: 'active' | 'inactive' | 'completed' | 'high-risk' | 'recovering' | 'new';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  showText?: boolean;
  className?: string;
}

const PatientStatusBadge: React.FC<PatientStatusBadgeProps> = ({
  status,
  size = 'md',
  showIcon = true,
  showText = true,
  className = ''
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'active':
        return {
          color: 'text-green-600 bg-green-100',
          icon: CheckCircle,
          text: 'Active',
          description: 'Patient is actively participating in therapy'
        };
      case 'inactive':
        return {
          color: 'text-yellow-600 bg-yellow-100',
          icon: Clock,
          text: 'Inactive',
          description: 'Patient has not been active recently'
        };
      case 'completed':
        return {
          color: 'text-blue-600 bg-blue-100',
          icon: Activity,
          text: 'Completed',
          description: 'Patient has completed their therapy program'
        };
      case 'high-risk':
        return {
          color: 'text-red-600 bg-red-100',
          icon: AlertCircle,
          text: 'High Risk',
          description: 'Patient requires immediate attention'
        };
      case 'recovering':
        return {
          color: 'text-purple-600 bg-purple-100',
          icon: Heart,
          text: 'Recovering',
          description: 'Patient is showing positive progress'
        };
      case 'new':
        return {
          color: 'text-indigo-600 bg-indigo-100',
          icon: Zap,
          text: 'New',
          description: 'Recently enrolled patient'
        };
      default:
        return {
          color: 'text-gray-600 bg-gray-100',
          icon: AlertCircle,
          text: 'Unknown',
          description: 'Status unknown'
        };
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          container: 'px-2 py-1',
          text: 'text-xs',
          icon: 'h-3 w-3'
        };
      case 'lg':
        return {
          container: 'px-4 py-2',
          text: 'text-sm',
          icon: 'h-5 w-5'
        };
      default: // md
        return {
          container: 'px-3 py-1.5',
          text: 'text-sm',
          icon: 'h-4 w-4'
        };
    }
  };

  const config = getStatusConfig();
  const sizeClasses = getSizeClasses();
  const Icon = config.icon;

  return (
    <div 
      className={`inline-flex items-center space-x-1 rounded-full font-medium ${config.color} ${sizeClasses.container} ${className}`}
      title={config.description}
    >
      {showIcon && <Icon className={sizeClasses.icon} />}
      {showText && <span className={sizeClasses.text}>{config.text}</span>}
    </div>
  );
};

export default PatientStatusBadge;
