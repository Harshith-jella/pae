import React from 'react';

interface ChartProps {
  data: { label: string; value: number }[];
  type: 'bar' | 'line';
  title: string;
  color?: string;
}

export const Chart: React.FC<ChartProps> = ({ 
  data, 
  type, 
  title, 
  color = 'bg-blue-500' 
}) => {
  const maxValue = Math.max(...data.map(d => d.value));

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">{title}</h3>
      
      {type === 'bar' ? (
        <div className="space-y-4">
          {data.map((item, index) => (
            <div key={index} className="flex items-center space-x-3">
              <div className="w-16 text-sm text-gray-600 font-medium">
                {item.label}
              </div>
              <div className="flex-1 bg-gray-200 rounded-full h-3 relative overflow-hidden">
                <div 
                  className={`h-full ${color} rounded-full transition-all duration-1000 ease-out`}
                  style={{ width: `${(item.value / maxValue) * 100}%` }}
                />
              </div>
              <div className="w-12 text-sm text-gray-900 font-semibold text-right">
                {item.value}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="h-64 flex items-end space-x-2">
          {data.map((item, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div 
                className={`w-full ${color} rounded-t transition-all duration-1000 ease-out`}
                style={{ height: `${(item.value / maxValue) * 200}px` }}
              />
              <div className="text-xs text-gray-600 mt-2 text-center">
                {item.label}
              </div>
              <div className="text-xs font-semibold text-gray-900">
                {item.value}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};