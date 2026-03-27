'use client';

import { useState, useEffect } from 'react';
import { AnalysisResult } from '@/types/analysis';
import { criteria } from '@/lib/criteria';
import Link from 'next/link';

function ScoreOverviewContent() {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<'no-data' | 'invalid' | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem('analysisResult');
    if (!stored) {
      setError('no-data');
      return;
    }
    try {
      setResult(JSON.parse(stored));
    } catch {
      setError('invalid');
    }
  }, []);

  if (error === 'no-data') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="font-headline text-3xl font-bold text-on-surface mb-4">
            Sem Dados de Análise
          </h1>
          <p className="text-on-surface-variant mb-6">
            Analise um perfil LinkedIn primeiro.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 signature-gradient text-on-primary px-6 py-3 rounded-full font-headline font-bold"
          >
            Voltar ao Início
          </Link>
        </div>
      </div>
    );
  }

  if (error === 'invalid') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="font-headline text-3xl font-bold text-on-surface mb-4">
            Dados de Análise Inválidos
          </h1>
          <p className="text-on-surface-variant mb-6">
            Os dados da análise estão corrompidos. Tente novamente.
          </p>
          <Link href="/" className="inline-flex items-center gap-2 signature-gradient text-on-primary px-6 py-3 rounded-full font-headline font-bold">
            Voltar ao Início
          </Link>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-primary mx-auto mb-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-on-surface-variant">Carregando detalhamento...</p>
        </div>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300' };
    if (score >= 60) return { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-300' };
    if (score >= 40) return { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300' };
    return { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300' };
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white border-b border-outline-variant sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-extrabold text-primary tracking-tighter font-headline">
              Insight Architect
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/analyze"
              className="px-4 py-2 rounded-full bg-surface-container-low hover:bg-surface-container-high transition-colors text-on-surface font-medium text-sm"
            >
              Voltar ao Resumo
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            {result.profilePhoto ? (
              <img 
                src={result.profilePhoto} 
                alt={result.profileData.name || 'Profile'}
                className="w-16 h-16 rounded-full object-cover border-2 border-primary"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center">
                <svg className="w-8 h-8 text-outline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            )}
            <div>
              <h1 className="font-headline text-4xl md:text-5xl font-extrabold text-primary">
                Detalhamento de Pontuação
              </h1>
              <p className="text-on-surface-variant text-lg">
                {result.profileData.name || 'Perfil'} — Análise completa em todas as 10 categorias de avaliação
              </p>
            </div>
          </div>
        </div>

        <div className="bg-surface-container-low rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-on-surface-variant uppercase tracking-wider mb-1">Pontuação Geral</p>
              <p className="text-4xl font-extrabold font-headline text-primary">{result.totalScore}/100</p>
            </div>
            <div className={`px-4 py-2 rounded-full font-bold ${getScoreColor(result.totalScore).bg} ${getScoreColor(result.totalScore).text}`}>
              {result.grade}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {criteria.map((criterion, criterionIndex) => {
            const categoryScore = result.categories.find(c => c.id === criterion.id);
            const score = categoryScore?.score ?? 0;
            const colors = getScoreColor(score);
            const progressPercent = (score / criterion.maxScore) * 100;

            return (
              <div key={criterion.id} className="bg-surface rounded-2xl overflow-hidden border border-outline-variant/50">
                <div className={`p-6 border-b border-outline-variant/50 ${colors.bg}/30`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colors.bg}`}>
                        <span className={`text-xl font-bold ${colors.text}`}>{criterionIndex + 1}</span>
                      </div>
                      <div>
                        <h2 className="font-headline text-xl font-bold text-on-surface">
                          {criterion.name}
                        </h2>
                        <p className="text-sm text-on-surface-variant">{criterion.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-extrabold font-headline ${colors.text}`}>
                        {score}
                      </div>
                      <div className="text-xs text-on-surface-variant">
                        / {criterion.maxScore} pts
                      </div>
                      <div className={`text-xs font-medium ${colors.text}`}>
                        Peso: {criterion.weight}%
                      </div>
                    </div>
                  </div>
                  
                  <div className="h-3 bg-surface-container-high rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${colors.bg.replace('100', '500')} transition-all duration-700 rounded-full`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                <div className="p-6">
                  <p className="text-sm text-on-surface-variant mb-4 italic">
                    {categoryScore?.feedback || 'Nenhum feedback disponível para esta categoria.'}
                  </p>
                  
                  <h3 className="font-headline font-bold text-sm uppercase tracking-wider text-outline mb-4">
                    Avaliação de Subcritérios
                  </h3>
                  
                  <div className="grid gap-3">
                    {criterion.subCriteria.map((subCriterion) => {
                      const subCriterionScore = (score / criterion.maxScore) * subCriterion.points;
                      const isAchieved = subCriterionScore >= subCriterion.points * 0.7;
                      
                      return (
                        <div 
                          key={subCriterion.id}
                          className="flex items-start gap-4 p-3 rounded-xl bg-surface-container-low hover:bg-surface-container-high transition-colors"
                        >
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                            isAchieved ? 'bg-green-100 text-green-600' : 'bg-surface-container-high text-outline'
                          }`}>
                            {isAchieved ? (
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                              </svg>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-4">
                              <p className="font-medium text-on-surface">{subCriterion.name}</p>
                              <span className={`text-sm font-medium ${isAchieved ? 'text-green-600' : 'text-outline'}`}>
                                {subCriterionScore.toFixed(1)}/{subCriterion.points} pts
                              </span>
                            </div>
                            <p className="text-sm text-on-surface-variant mt-1">
                              {subCriterion.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-12 bg-surface-container-low rounded-2xl p-8">
          <h3 className="font-headline text-xl font-bold text-on-surface mb-4 flex items-center gap-3">
            <svg className="w-6 h-6 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Recomendações Prioritárias
          </h3>
          <ol className="space-y-4">
            {result.topRecommendations.map((rec, index) => (
              <li key={index} className="flex items-start gap-4">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                  index === 0 ? 'bg-red-100 text-red-600' :
                  index === 1 ? 'bg-orange-100 text-orange-600' :
                  index === 2 ? 'bg-yellow-100 text-yellow-600' :
                  'bg-surface-container-high text-on-surface-variant'
                }`}>
                  {index + 1}
                </span>
                <p className="text-on-surface pt-1">{rec}</p>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 signature-gradient text-on-primary px-8 py-4 rounded-full font-headline font-bold text-lg shadow-lg hover:shadow-xl transition-all"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Analisar Outro Perfil
          </Link>
        </div>
      </main>

      <footer className="bg-primary-container border-t border-outline-variant py-8 mt-12">
        <div className="max-w-5xl mx-auto px-6 text-center text-sm text-on-surface-variant">
          <p>Insight Architect — Avaliador Profissional de Perfil LinkedIn</p>
        </div>
      </footer>
    </div>
  );
}

export default function ScoreOverviewPage() {
  return <ScoreOverviewContent />;
}
