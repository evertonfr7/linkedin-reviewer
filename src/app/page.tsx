'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import UrlInput from '@/components/UrlInput';
import ManualInput from '@/components/ManualInput';
import PdfUpload from '@/components/PdfUpload';
import { AnalyzeResponse, ParsePreview } from '@/types/analysis';

type InputMode = 'url' | 'manual' | 'pdf';

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [inputMode, setInputMode] = useState<InputMode>('url');

  const handleAnalyze = async (url: string) => {
    setIsLoading(true);
    setError(undefined);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      const data: AnalyzeResponse = await response.json();

      if (!data.success) {
        if (data.requiresManualInput) {
          setInputMode('manual');
        }
        setError(data.error);
        setIsLoading(false);
        return;
      }

      const encodedData = encodeURIComponent(JSON.stringify(data.result));
      router.push(`/analyze?data=${encodedData}`);
    } catch (err) {
      setError('Erro ao conectar com o servidor. Tente novamente.');
      setIsLoading(false);
    }
  };

  const handleManualSubmit = async (parsedData: unknown) => {
    setIsLoading(true);
    setError(undefined);

    try {
      const { parsedProfile, profilePhoto } = parsedData as { parsedProfile: ParsePreview; profilePhoto?: string };
      
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ parsedProfile, profilePhoto }),
      });

      const data: AnalyzeResponse = await response.json();

      if (!data.success) {
        setError(data.error);
        setIsLoading(false);
        return;
      }

      const encodedData = encodeURIComponent(JSON.stringify(data.result));
      router.push(`/analyze?data=${encodedData}`);
    } catch (err) {
      setError('Erro ao conectar com o servidor. Tente novamente.');
      setIsLoading(false);
    }
  };

  if (inputMode !== 'url') {
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-surface border-b border-outline-variant">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <span className="text-2xl font-extrabold text-primary tracking-tighter font-headline">
              Insight Architect
            </span>
            <nav className="hidden md:flex gap-6 items-center">
              <a className="font-headline font-bold tracking-tight text-primary border-b-2 border-primary pb-1" href="#">
                Dashboard
              </a>
              <a className="font-headline font-bold tracking-tight text-on-surface-variant hover:text-primary transition-colors" href="#">
                Analyses
              </a>
              <a className="font-headline font-bold tracking-tight text-on-surface-variant hover:text-primary transition-colors" href="#">
                Benchmarks
              </a>
            </nav>
            <div className="flex items-center gap-4">
              <button className="p-2 rounded-full hover:bg-surface-container-high transition-colors text-primary">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>
              <button className="p-2 rounded-full hover:bg-surface-container-high transition-colors text-primary">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center mb-8">
            <h1 className="font-headline text-4xl md:text-5xl font-extrabold text-primary mb-4">
              {inputMode === 'manual' ? 'Self-Assessment Mode' : 'PDF Upload Mode'}
            </h1>
            <p className="text-on-surface-variant text-lg max-w-2xl mx-auto">
              {inputMode === 'manual' 
                ? 'Copy and paste your LinkedIn profile information for analysis when automatic scraping is blocked.'
                : 'Upload exported HTML files from your LinkedIn profile for detailed analysis.'}
            </p>
          </div>

          {inputMode === 'manual' && (
            <ManualInput
              onSubmit={handleManualSubmit}
              onCancel={() => {
                setInputMode('url');
                setError(undefined);
              }}
              isLoading={isLoading}
            />
          )}

          {inputMode === 'pdf' && (
            <PdfUpload
              onSubmit={handleManualSubmit}
              onCancel={() => {
                setInputMode('url');
                setError(undefined);
              }}
              isLoading={isLoading}
            />
          )}
        </main>

        <footer className="bg-surface border-t border-outline-variant py-6">
          <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
            <span className="font-headline font-bold text-primary">Insight Architect</span>
            <div className="flex gap-6 text-xs uppercase tracking-widest text-on-surface-variant">
              <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-primary transition-colors">Methodology</a>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-surface border-b border-outline-variant sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="text-2xl font-extrabold text-primary tracking-tighter font-headline">
            Insight Architect
          </span>
          <nav className="hidden md:flex gap-6 items-center">
            <a className="font-headline font-bold tracking-tight text-primary border-b-2 border-primary pb-1" href="#">
              Dashboard
            </a>
            <a className="font-headline font-bold tracking-tight text-on-surface-variant hover:text-primary transition-colors" href="#">
              Analyses
            </a>
            <a className="font-headline font-bold tracking-tight text-on-surface-variant hover:text-primary transition-colors" href="#">
              Benchmarks
            </a>
          </nav>
          <div className="flex items-center gap-4">
            <button className="p-2 rounded-full hover:bg-surface-container-high transition-colors text-primary">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
            <button className="p-2 rounded-full hover:bg-surface-container-high transition-colors text-primary">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <main>
        <section className="relative pt-20 pb-24 md:pt-32 md:pb-40 overflow-hidden px-6 lg:px-24">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16">
            <div className="flex-1 z-10 text-center md:text-left">
              <span className="inline-block px-4 py-1.5 mb-6 text-sm font-semibold tracking-wider text-secondary bg-secondary-container rounded-full uppercase font-label">
                Executive Precision
              </span>
              <h1 className="font-headline text-5xl md:text-7xl font-extrabold text-primary leading-[1.1] tracking-tighter mb-8">
                Architect Your <br /> Professional <span className="text-secondary">Narrative.</span>
              </h1>
              <p className="text-on-surface-variant text-lg md:text-xl max-w-xl mb-12 leading-relaxed">
                Beyond keywords. Beyond clicks. We deploy institutional-grade analysis to audit your LinkedIn presence against the benchmarks of the world&apos;s elite leadership.
              </p>
              
              <UrlInput
                onAnalyze={handleAnalyze}
                isLoading={isLoading}
                error={error}
                onManualInput={() => setInputMode('manual')}
                onPdfUpload={() => setInputMode('pdf')}
              />

              <div className="mt-8 flex flex-wrap justify-center md:justify-start gap-4 items-center">
                <div className="flex -space-x-3">
                  <div className="w-10 h-10 rounded-full border-2 border-surface bg-surface-container-high overflow-hidden flex items-center justify-center bg-primary text-on-primary text-xs font-bold">
                    +2k
                  </div>
                </div>
                <span className="text-sm text-on-surface-variant font-medium">Profiles analyzed this month</span>
              </div>
            </div>

            <div className="flex-1 relative w-full max-w-lg md:max-w-none">
              <div className="absolute -top-12 -right-12 w-64 h-64 bg-secondary-container rounded-full blur-3xl opacity-30"></div>
              <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-primary-fixed-dim rounded-full blur-3xl opacity-20"></div>
              
              <div className="relative z-10 bg-surface-container-lowest p-6 rounded-xl shadow-2xl overflow-hidden transform rotate-2 hover:rotate-0 transition-transform duration-500">
                <div className="aspect-[4/5] rounded-lg overflow-hidden relative bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                  <div className="glass-effect p-6 rounded-xl border border-white/20 w-full max-w-xs">
                    <div className="flex justify-between items-end mb-4">
                      <div>
                        <p className="text-xs uppercase tracking-widest text-primary font-bold mb-1">Current Standing</p>
                        <h3 className="font-headline text-3xl font-extrabold text-on-surface">Elite 89</h3>
                      </div>
                      <div className="w-12 h-12 rounded-full border-4 border-secondary flex items-center justify-center">
                        <span className="text-xs font-bold text-secondary">A+</span>
                      </div>
                    </div>
                    <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
                      <div className="h-full bg-secondary w-[89%]"></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-6 -right-6 md:right-12 z-20 glass-effect p-4 rounded-xl shadow-lg flex items-center gap-4 border border-outline-variant/20">
                <div className="p-3 bg-secondary-container rounded-lg">
                  <svg className="w-6 h-6 text-on-secondary-container" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-tighter text-outline">Audit Status</p>
                  <p className="text-sm font-headline font-extrabold text-on-surface">Verified Excellence</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-surface-container-low py-24 px-6 lg:px-24">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="font-headline text-4xl md:text-5xl font-extrabold text-on-surface mb-6 tracking-tight">
                The 10-Category Audit
              </h2>
              <p className="text-on-surface-variant max-w-2xl mx-auto text-lg">
                Our proprietary engine evaluates your profile across ten clinical dimensions, producing a definitive score out of 100.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-6">
              <div className="md:col-span-2 lg:col-span-3 bg-surface-container-lowest p-8 rounded-xl flex flex-col justify-between group hover:-translate-y-1 transition-all">
                <div>
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-6">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <h3 className="font-headline text-2xl font-bold mb-4">Strategic Positioning</h3>
                  <p className="text-on-surface-variant leading-relaxed">
                    How your profile communicates value to decision-makers. We measure narrative consistency and executive presence.
                  </p>
                </div>
                <div className="mt-8 flex items-center justify-between">
                  <span className="text-primary font-bold text-sm tracking-widest uppercase">Weight: 20%</span>
                  <svg className="w-6 h-6 text-outline group-hover:text-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>

              <div className="md:col-span-2 lg:col-span-3 bg-surface-container-lowest p-8 rounded-xl flex flex-col justify-between group hover:-translate-y-1 transition-all">
                <div>
                  <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center text-secondary mb-6">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="font-headline text-2xl font-bold mb-4">Network Velocity</h3>
                  <p className="text-on-surface-variant leading-relaxed">
                    Analyzing the quality and growth patterns of your professional circle relative to your industry benchmarks.
                  </p>
                </div>
                <div className="mt-8 flex items-center justify-between">
                  <span className="text-secondary font-bold text-sm tracking-widest uppercase">Weight: 15%</span>
                  <svg className="w-6 h-6 text-outline group-hover:text-secondary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>

              <div className="lg:col-span-2 bg-surface p-6 rounded-xl border border-outline-variant/10">
                <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant mb-4">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <h4 className="font-headline font-bold text-lg mb-2">Copy Density</h4>
                <p className="text-sm text-on-surface-variant">Readability and impact of your headline and summary.</p>
              </div>

              <div className="lg:col-span-2 bg-surface p-6 rounded-xl border border-outline-variant/10">
                <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant mb-4">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
                <h4 className="font-headline font-bold text-lg mb-2">Social Proof</h4>
                <p className="text-sm text-on-surface-variant">Validation of skills and institutional credibility.</p>
              </div>

              <div className="lg:col-span-2 bg-surface p-6 rounded-xl border border-outline-variant/10">
                <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant mb-4">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <h4 className="font-headline font-bold text-lg mb-2">Keyword Logic</h4>
                <p className="text-sm text-on-surface-variant">Algorithmic discoverability for targeted executive roles.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-24 px-6 lg:px-24 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row gap-12 items-center">
            <div className="w-full md:w-1/2">
              <h2 className="font-headline text-3xl md:text-4xl font-extrabold text-primary mb-6 tracking-tight">
                Beyond &quot;Optimization&quot;
              </h2>
              <div className="space-y-6">
                <div className="p-6 rounded-xl bg-surface-container-low border-l-4 border-secondary transition-all">
                  <h4 className="font-headline font-bold text-on-surface mb-2">The Insight Architect Protocol</h4>
                  <p className="text-on-surface-variant">
                    We don&apos;t just fix your profile; we architect your career narrative. Every suggestion is backed by competitive data from the top 1% of your field.
                  </p>
                </div>
                <div className="p-6 rounded-xl bg-surface hover:bg-surface-container-low transition-all group">
                  <h4 className="font-headline font-bold text-on-surface mb-2">Actionable Intelligence</h4>
                  <p className="text-on-surface-variant">
                    Get step-by-step guidance on changing your profile from a resume to a reputation engine.
                  </p>
                </div>
              </div>
            </div>

            <div className="w-full md:w-1/2 bg-surface-container rounded-3xl p-12 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8">
                <svg className="w-24 h-24 text-primary/10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="relative z-10">
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-2">
                    <svg className="w-6 h-6 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-bold text-on-surface">Data-Driven Precision</span>
                  </div>
                  <div className="flex items-center gap-3 mb-2">
                    <svg className="w-6 h-6 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-bold text-on-surface">Elite Benchmark Comparison</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <svg className="w-6 h-6 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-bold text-on-surface">Immediate Transformation ROI</span>
                  </div>
                </div>
                <button 
                  onClick={() => setInputMode('manual')}
                  className="bg-primary text-on-primary px-8 py-4 rounded-full font-headline font-bold hover:bg-primary-container transition-all flex items-center gap-3"
                >
                  Start Free Evaluation
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-surface border-t border-outline-variant py-8">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <span className="font-headline font-bold text-primary">Insight Architect</span>
          <div className="flex gap-6 text-xs uppercase tracking-widest text-on-surface-variant">
            <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-primary transition-colors">Methodology</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
