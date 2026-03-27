'use client';

import { useState } from 'react';

interface UrlInputProps {
  onAnalyze: (url: string) => void;
  isLoading: boolean;
  error?: string;
  onManualInput?: () => void;
  onMhtmlUpload?: () => void;
}

export default function UrlInput({ onAnalyze, isLoading, error, onManualInput, onMhtmlUpload }: UrlInputProps) {
  const [url, setUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onAnalyze(url.trim());
    }
  };

  const isValidUrl = (value: string) => {
    return /^https?:\/\/(www\.)?linkedin\.com\/in\/[\w-]+\/?$/.test(value);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="max-w-2xl bg-surface-container-low p-2 rounded-full shadow-sm flex flex-col sm:flex-row items-center gap-2 group focus-within:ring-2 ring-primary/20 transition-all">
        <div className="flex-1 w-full flex items-center px-6">
          <svg className="w-5 h-5 text-outline mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Insira a URL do LinkedIn para Analisar"
            className="w-full bg-transparent border-none focus:ring-0 text-on-surface font-medium placeholder:text-outline/60 py-4"
            disabled={isLoading}
          />
        </div>
        <button
          type="submit"
          disabled={isLoading || !url.trim() || !isValidUrl(url)}
          className="w-full sm:w-auto signature-gradient text-on-primary px-8 py-4 rounded-full font-headline font-bold text-lg shadow-lg hover:shadow-xl transition-all whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Analisando...
            </span>
          ) : (
            'Analisar Perfil'
          )}
        </button>
      </div>
      
      {error && (
        <div className="mt-4 p-4 bg-error-container rounded-xl border border-error/20">
          <p className="text-on-error-container text-sm">{error}</p>
        </div>
      )}
      
      {(onManualInput || onMhtmlUpload) && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
          {onManualInput && (
            <button
              type="button"
              onClick={onManualInput}
              className="flex items-center gap-2 text-primary font-bold hover:underline py-2 px-4 transition-all"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Autoavaliação
            </button>
          )}
          {onMhtmlUpload && (
            <>
              <span className="text-outline">|</span>
              <button
                type="button"
                onClick={onMhtmlUpload}
                className="flex items-center gap-2 text-secondary font-bold hover:underline py-2 px-4 transition-all"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                Upload de MHTML
              </button>
            </>
          )}
        </div>
      )}
    </form>
  );
}
