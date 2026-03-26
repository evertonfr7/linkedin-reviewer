'use client';

import { CategoryScore } from '@/types/analysis';
import { ReactNode } from 'react';

interface CategoryCardProps {
  category: CategoryScore;
  index: number;
}

const categoryIcons: Record<string, ReactNode> = {
  'photo-banner': (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  'headline': (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
    </svg>
  ),
  'about': (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  'experience': (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  'education': (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
    </svg>
  ),
  'skills': (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  ),
  'recommendations': (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  ),
  'certifications': (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
    </svg>
  ),
  'activity': (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  ),
  'complementary': (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  ),
};

const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
  'photo-banner': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  'headline': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  'about': { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  'experience': { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  'education': { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  'skills': { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200' },
  'recommendations': { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' },
  'certifications': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  'activity': { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200' },
  'complementary': { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
};

export default function CategoryCard({ category, index }: CategoryCardProps) {
  const colors = categoryColors[category.id] || { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' };
  const icon = categoryIcons[category.id] || categoryIcons['complementary'];
  const percentage = (category.score / category.maxScore) * 100;
  const weightedScore = (category.score / 100) * category.weight;

  return (
    <div 
      className={`p-6 rounded-xl border ${colors.border} bg-white hover:shadow-md transition-all hover:-translate-y-1`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-lg ${colors.bg} flex items-center justify-center ${colors.text}`}>
          {icon}
        </div>
        <span className={`text-xs font-bold uppercase tracking-wider ${colors.text}`}>
          {category.weight}%
        </span>
      </div>
      
      <h3 className="font-headline font-bold text-lg text-on-surface mb-2">
        {category.name}
      </h3>
      
      <p className="text-sm text-on-surface-variant mb-4 line-clamp-2">
        {category.feedback}
      </p>
      
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs text-outline">Score</span>
          <span className={`text-sm font-bold ${colors.text}`}>
            {category.score}/{category.maxScore}
          </span>
        </div>
        <div className="h-2 bg-surface-container-high rounded-full overflow-hidden">
          <div 
            className={`h-full ${colors.text.replace('text-', 'bg-')} transition-all duration-1000 rounded-full`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div className="flex justify-between items-center text-xs text-outline">
          <span>Ponderado</span>
          <span className="font-medium">+{weightedScore.toFixed(1)}%</span>
        </div>
      </div>
    </div>
  );
}
