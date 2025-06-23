import React from 'react';
import { LucideIcon } from 'lucide-react';

interface DashboardCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  gradient?: string;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  gradient = 'from-blue-500 to-purple-600'
}) => {
  const getChangeColor = () => {
    switch (changeType) {
      case 'positive': return 'text-green-600';
      case 'negative': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mb-2">{value}</p>
          {change && (
            <p className={`text-sm font-medium ${getChangeColor()}`}>
              {change}
            </p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${gradient} flex items-center justify-center`}>
          <Icon className="text-white" size={24} />
        </div>
      </div>
    </div>
  );
};