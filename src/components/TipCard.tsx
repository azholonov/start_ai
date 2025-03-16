'use client';

import { useState } from 'react';

interface TipCardProps {
  title: string;
  content: string;
}

export default function TipCard({ title, content }: TipCardProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="bg-blue-600/10 border border-blue-600/20 rounded-lg p-4 mb-4 fade-in">
      <div className="flex justify-between items-start">
        <div className="flex items-center">
          <svg className="w-5 h-5 text-blue-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="font-medium text-blue-500">{title}</h3>
        </div>
        <button 
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-gray-500 ml-2 flex-shrink-0"
          aria-label="Закрыть подсказку"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <p className="mt-2 text-sm text-gray-300">{content}</p>
    </div>
  );
} 