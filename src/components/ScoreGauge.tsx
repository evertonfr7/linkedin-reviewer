'use client';

import { ProfileGrade } from '@/types/analysis';
import { getGradeColor } from '@/lib/criteria';

interface ScoreGaugeProps {
  score: number;
  grade: ProfileGrade;
}

export default function ScoreGauge({ score, grade }: ScoreGaugeProps) {
  const colors = getGradeColor(grade);
  const gradeLetter = grade === 'All-Star' ? 'A+' : 
                     grade === 'Advanced' ? 'A' :
                     grade === 'Intermediate' ? 'B' :
                     grade === 'Basic' ? 'C' : 'D';

  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-48 h-48">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-surface-container-high"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className={`transition-all duration-1000 ease-out ${colors.text.replace('text-', 'text-')}`}
            style={{ transformOrigin: '50% 50%' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-5xl font-extrabold text-on-surface font-headline">
            {score}
          </span>
          <span className="text-sm text-on-surface-variant mt-1">/ 100</span>
        </div>
      </div>
      
      <div className={`mt-6 px-6 py-3 rounded-full ${colors.bg} border-2 ${colors.border}`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full border-4 ${colors.border} flex items-center justify-center bg-white`}>
            <span className={`text-sm font-bold ${colors.text}`}>{gradeLetter}</span>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-outline font-medium">Profile Grade</p>
            <p className={`font-headline font-bold text-lg ${colors.text}`}>{grade}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
