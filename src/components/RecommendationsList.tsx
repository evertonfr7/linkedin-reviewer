'use client';

interface RecommendationsListProps {
  recommendations: string[];
}

const priorityColors = [
  'bg-red-100 text-red-700 border-red-200',
  'bg-orange-100 text-orange-700 border-orange-200',
  'bg-yellow-100 text-yellow-700 border-yellow-200',
  'bg-green-100 text-green-700 border-green-200',
  'bg-blue-100 text-blue-700 border-blue-200',
];

export default function RecommendationsList({ recommendations }: RecommendationsListProps) {
  return (
    <div className="bg-surface-container-lowest rounded-2xl p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        </div>
        <div>
          <h3 className="font-headline font-bold text-xl text-on-surface">
            Ações Prioritárias
          </h3>
          <p className="text-sm text-on-surface-variant">
            Foque nessas melhorias para máximo impacto
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {recommendations.map((recommendation, index) => (
          <div 
            key={index}
            className={`flex items-start gap-4 p-4 rounded-xl border ${
              priorityColors[index] || priorityColors[priorityColors.length - 1]
            } transition-all hover:scale-[1.02]`}
          >
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/50 flex items-center justify-center font-bold text-sm">
              {index + 1}
            </div>
            <p className="text-sm font-medium leading-relaxed pt-1">
              {recommendation}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8 pt-6 border-t border-outline-variant">
        <div className="flex items-center gap-2 text-sm text-on-surface-variant">
          <svg className="w-4 h-4 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Implemente essas mudanças na ordem indicada para melhores resultados</span>
        </div>
      </div>
    </div>
  );
}
