'use client';

import { SpendingFilter as SpendingFilterType } from '@/types/budget';

interface SpendingFilterProps {
  value: SpendingFilterType;
  onChange: (value: SpendingFilterType) => void;
}

export default function SpendingFilter({ value, onChange }: SpendingFilterProps) {
  return (
    <div className="flex items-center space-x-4 mb-4">
      <span className="text-gray-700 font-medium">Show:</span>
      <div className="flex space-x-2">
        <button
          onClick={() => onChange('all')}
          className={`px-4 py-2 rounded-md ${
            value === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All Spending
        </button>
        <button
          onClick={() => onChange('capital')}
          className={`px-4 py-2 rounded-md ${
            value === 'capital'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Capital Only
        </button>
        <button
          onClick={() => onChange('operating')}
          className={`px-4 py-2 rounded-md ${
            value === 'operating'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Operating Only
        </button>
        <button
          onClick={() => onChange('debt')}
          className={`px-4 py-2 rounded-md ${
            value === 'debt'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Debt Service
        </button>
      </div>
    </div>
  );
} 
