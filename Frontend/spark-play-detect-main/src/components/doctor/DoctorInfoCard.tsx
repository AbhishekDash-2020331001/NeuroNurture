import React from 'react';
import { 
  Stethoscope, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Award,
  Users,
  Clock,
  Star,
  Edit,
  Settings
} from 'lucide-react';

interface Doctor {
  id: string;
  name: string;
  email: string;
  specialization: string;
  licenseNumber: string;
  subscriptionStatus: 'free' | 'paid';
  maxChildren: number;
  currentChildrenCount: number;
  phone?: string;
  address?: string;
  experience?: number;
  rating?: number;
  joinDate?: string;
  avatar?: string;
}

interface DoctorInfoCardProps {
  doctor: Doctor;
  showActions?: boolean;
  compact?: boolean;
  onEdit?: () => void;
  onSettings?: () => void;
}

const DoctorInfoCard: React.FC<DoctorInfoCardProps> = ({
  doctor,
  showActions = true,
  compact = false,
  onEdit,
  onSettings
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  };

  const getSubscriptionColor = (status: string) => {
    switch (status) {
      case 'paid': return 'text-green-600 bg-green-100';
      case 'free': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSubscriptionText = (status: string) => {
    switch (status) {
      case 'paid': return 'Premium';
      case 'free': return 'Free Plan';
      default: return 'Unknown';
    }
  };

  if (compact) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
            <span className="text-lg font-semibold text-purple-600">
              {doctor.name.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-gray-900 truncate">
              Dr. {doctor.name}
            </h3>
            <p className="text-xs text-gray-500 truncate">
              {doctor.specialization}
            </p>
            <div className="flex items-center space-x-2 mt-1">
              <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${getSubscriptionColor(doctor.subscriptionStatus)}`}>
                {getSubscriptionText(doctor.subscriptionStatus)}
              </div>
              <span className="text-xs text-gray-400">
                {doctor.currentChildrenCount}/{doctor.maxChildren} patients
              </span>
            </div>
          </div>
          {showActions && (
            <div className="flex space-x-1">
              <button
                onClick={onEdit}
                className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                title="Edit Profile"
              >
                <Edit className="h-4 w-4" />
              </button>
              <button
                onClick={onSettings}
                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded transition-colors"
                title="Settings"
              >
                <Settings className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
            <span className="text-xl font-semibold text-purple-600">
              {doctor.name.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Dr. {doctor.name}
            </h2>
            <p className="text-sm text-gray-600">{doctor.specialization}</p>
            <div className="flex items-center space-x-2 mt-2">
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${getSubscriptionColor(doctor.subscriptionStatus)}`}>
                {getSubscriptionText(doctor.subscriptionStatus)}
              </div>
              {doctor.rating && (
                <div className="flex items-center space-x-1">
                  <Star className="h-3 w-3 text-yellow-400 fill-current" />
                  <span className="text-xs text-gray-600">{doctor.rating}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {showActions && (
          <div className="flex space-x-2">
            <button
              onClick={onEdit}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Edit Profile"
            >
              <Edit className="h-4 w-4" />
            </button>
            <button
              onClick={onSettings}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
              title="Settings"
            >
              <Settings className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Contact Information */}
      <div className="space-y-3 mb-6">
        <div className="flex items-center space-x-3">
          <Mail className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-600">{doctor.email}</span>
        </div>
        {doctor.phone && (
          <div className="flex items-center space-x-3">
            <Phone className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">{doctor.phone}</span>
          </div>
        )}
        {doctor.address && (
          <div className="flex items-center space-x-3">
            <MapPin className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">{doctor.address}</span>
          </div>
        )}
        <div className="flex items-center space-x-3">
          <Stethoscope className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-600">License: {doctor.licenseNumber}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-center mb-1">
            <Users className="h-4 w-4 text-purple-600 mr-1" />
            <span className="text-sm font-medium text-gray-700">Patients</span>
          </div>
          <p className="text-lg font-bold text-gray-900">
            {doctor.currentChildrenCount}/{doctor.maxChildren}
          </p>
        </div>
        {doctor.experience && (
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center mb-1">
              <Award className="h-4 w-4 text-purple-600 mr-1" />
              <span className="text-sm font-medium text-gray-700">Experience</span>
            </div>
            <p className="text-lg font-bold text-gray-900">
              {doctor.experience} years
            </p>
          </div>
        )}
      </div>

      {/* Additional Info */}
      {doctor.joinDate && (
        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Calendar className="h-4 w-4" />
            <span>Joined {formatDate(doctor.joinDate)}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorInfoCard;
