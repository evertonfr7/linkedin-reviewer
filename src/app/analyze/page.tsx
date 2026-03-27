'use client';

import { useState, useEffect } from 'react';
import ScoreGauge from '@/components/ScoreGauge';
import CategoryCard from '@/components/CategoryCard';
import RecommendationsList from '@/components/RecommendationsList';
import ProfileSnapshot from '@/components/ProfileSnapshot';
import { AnalysisResult } from '@/types/analysis';
import Link from 'next/link';

function ResultsContent() {
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
      <div className="min-h-screen flex items-center justify-center">
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
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Voltar ao Início
          </Link>
        </div>
      </div>
    );
  }

  if (error === 'invalid') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-headline text-3xl font-bold text-on-surface mb-4">
            Dados de Análise Inválidos
          </h1>
          <p className="text-on-surface-variant mb-6">
            Os dados da análise estão corrompidos. Tente novamente.
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

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-primary mx-auto mb-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-on-surface-variant">Carregando análise...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white border-b border-outline-variant sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-extrabold text-primary tracking-tighter font-headline">
              Insight Architect
            </span>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface-container-low hover:bg-surface-container-high transition-colors text-on-surface font-medium"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Analisar Outro Perfil
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="font-headline text-4xl md:text-5xl font-extrabold text-primary mb-4">
            Análise do Seu Perfil
          </h1>
          <p className="text-on-surface-variant text-lg">
            Analisado em {new Date(result.analyzedAt).toLocaleDateString('pt-BR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-1">
            <div className="sticky top-28">
              <ScoreGauge score={result.totalScore} grade={result.grade} />
            </div>
          </div>

          <div className="lg:col-span-2">
            <ProfileSnapshot profile={result.profileData} profilePhoto={result.profilePhoto} />
          </div>
        </div>

        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-headline text-3xl font-bold text-on-surface">
              Detalhamento em 10 Categorias
            </h2>
            <Link
              href="/score-overview"
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface-container-low hover:bg-surface-container-high transition-colors text-on-surface font-medium text-sm"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Ver Detalhamento Completo
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {result.categories.map((category, index) => (
              <CategoryCard key={category.id} category={category} index={index} />
            ))}
          </div>
        </section>

        <section className="mb-12">
          <RecommendationsList recommendations={result.topRecommendations} />
        </section>

        <div className="text-center py-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 signature-gradient text-on-primary px-8 py-4 rounded-full font-headline font-bold text-lg shadow-lg hover:shadow-xl transition-all"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Analisar Outro Perfil
          </Link>
        </div>
      </main>

      <footer className="bg-primary-container border-t border-outline-variant py-8">
        <div className="max-w-7xl mx-auto px-6 text-center text-sm text-on-surface-variant">
          <p>Insight Architect — Avaliador Profissional de Perfil LinkedIn</p>
        </div>
      </footer>
    </div>
  );
}

export default function AnalyzePage() {
  return <ResultsContent />;
}
