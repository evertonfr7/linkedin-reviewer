'use client';

import { useState } from 'react';
import { ParsePreview } from '@/types/analysis';

interface ManualInputProps {
  onSubmit: (parsedProfile: unknown) => void;
  onCancel: () => void;
  isLoading: boolean;
}

export default function ManualInput({ onSubmit, onCancel, isLoading }: ManualInputProps) {
  const [profileText, setProfileText] = useState('');
  const [preview, setPreview] = useState<ParsePreview | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const handlePreview = async () => {
    if (!profileText.trim()) return;

    setIsLoadingPreview(true);
    setPreviewError(null);

    try {
      const response = await fetch('/api/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileText }),
      });

      const data = await response.json();

      if (data.success && data.preview) {
        setPreview(data.preview);
      } else {
        setPreviewError(data.error || 'Erro ao processar texto');
      }
    } catch {
      setPreviewError('Erro ao conectar com o servidor');
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const handleConfirm = () => {
    if (preview) {
      onSubmit({ parsedProfile: preview });
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-surface-container-lowest rounded-2xl p-8 shadow-lg">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h2 className="font-headline font-bold text-xl text-on-surface">
              Self-Assessment Mode
            </h2>
            <p className="text-sm text-on-surface-variant">
              Cole o texto exportado do seu LinkedIn e visualize o que foi extraído
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <textarea
            value={profileText}
            onChange={(e) => {
              setProfileText(e.target.value);
              setPreview(null);
              setPreviewError(null);
            }}
            placeholder={`Cole aqui o texto exportado do seu perfil LinkedIn. 

Exemplo de formato esperado:

João Silva
Senior Software Engineer at Tech Company | São Paulo

SOBRE
Apaixonado por tecnologia com mais de 5 anos de experiência em desenvolvimento de software...

EXPERIÊNCIA
Tech Company | Jan 2021 - Present
Senior Software Engineer
- Liderança de equipe de 5 desenvolvedores
- Arquitetura de microsserviços com Node.js

FORMAÇÃO ACADÊMICA
USP - Universidade de São Paulo
Bacharel em Ciência da Computação | 2013-2017

COMPETÊNCIAS
JavaScript • TypeScript • Node.js • React • PostgreSQL

CERTIFICAÇÕES
AWS Solutions Architect - Amazon - 2022`}
            className="w-full h-64 p-4 rounded-xl border border-outline-variant bg-surface text-on-surface placeholder:text-outline/60 resize-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-mono text-sm"
            disabled={isLoading}
          />

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 rounded-full font-headline font-bold text-on-surface-variant hover:bg-surface-container-high transition-all"
              disabled={isLoading}
            >
              Cancelar
            </button>
            
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handlePreview}
                disabled={!profileText.trim() || isLoadingPreview}
                className="px-6 py-3 rounded-full font-headline font-bold border-2 border-primary text-primary hover:bg-primary/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLoadingPreview ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Processando...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Visualizar Preview
                  </>
                )}
              </button>
              
              <button
                onClick={handleConfirm}
                disabled={!preview || isLoading}
                className="signature-gradient text-on-primary px-8 py-3 rounded-full font-headline font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Analisando...
                  </>
                ) : (
                  <>
                    Analisar Perfil
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {previewError && (
          <div className="mt-4 p-4 bg-error-container rounded-xl border border-error/20">
            <p className="text-on-error-container text-sm">{previewError}</p>
          </div>
        )}
      </div>

      {preview && (
        <div className="mt-6 bg-surface-container-lowest rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-outline-variant">
            <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <h3 className="font-headline font-bold text-lg text-on-surface">
                Preview da Análise
              </h3>
              <p className="text-sm text-on-surface-variant">
                Confirme os dados extraídos antes de analisar
              </p>
            </div>
          </div>

          {preview.warnings.length > 0 && (
            <div className="mb-6 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <p className="font-medium text-yellow-800 text-sm">Atenção</p>
                  <ul className="mt-1 text-sm text-yellow-700 space-y-1">
                    {preview.warnings.map((warning, i) => (
                      <li key={i}>• {warning}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="p-3 bg-surface rounded-xl">
                <p className="text-xs uppercase tracking-wider text-outline font-medium mb-1">Nome</p>
                <p className="font-medium text-on-surface">
                  {preview.name || <span className="text-error">Não encontrado</span>}
                </p>
              </div>

              <div className="p-3 bg-surface rounded-xl">
                <p className="text-xs uppercase tracking-wider text-outline font-medium mb-1">Headline</p>
                <p className="font-medium text-on-surface">
                  {preview.headline || <span className="text-error">Não encontrada</span>}
                </p>
              </div>

              <div className="p-3 bg-surface rounded-xl">
                <p className="text-xs uppercase tracking-wider text-outline font-medium mb-1">Localização</p>
                <p className="font-medium text-on-surface">
                  {preview.location || <span className="text-on-surface-variant">Não especificada</span>}
                </p>
              </div>

              <div className="p-3 bg-surface rounded-xl">
                <p className="text-xs uppercase tracking-wider text-outline font-medium mb-1">Sobre</p>
                <p className="text-sm text-on-surface">
                  {preview.about ? (
                    preview.about.length > 150 
                      ? `${preview.about.slice(0, 150)}...` 
                      : preview.about
                  ) : (
                    <span className="text-error">Não encontrado</span>
                  )}
                </p>
                {preview.stats.aboutLength > 0 && (
                  <p className="text-xs text-outline mt-1">{preview.stats.aboutLength} caracteres</p>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-surface rounded-xl">
                <p className="text-xs uppercase tracking-wider text-outline font-medium mb-1">
                  Experiências ({preview.stats.experiencesCount})
                </p>
                {preview.experiences.length > 0 ? (
                  <ul className="space-y-2">
                    {preview.experiences.slice(0, 3).map((exp, i) => (
                      <li key={i} className="text-sm">
                        <span className="font-medium">{exp.title}</span>
                        <span className="text-on-surface-variant"> @ {exp.company}</span>
                        {exp.period && <span className="text-xs text-outline"> ({exp.period})</span>}
                      </li>
                    ))}
                    {preview.experiences.length > 3 && (
                      <li className="text-xs text-outline">+ {preview.experiences.length - 3} mais...</li>
                    )}
                  </ul>
                ) : (
                  <span className="text-error text-sm">Nenhuma encontrada</span>
                )}
              </div>

              <div className="p-3 bg-surface rounded-xl">
                <p className="text-xs uppercase tracking-wider text-outline font-medium mb-1">
                  Formação ({preview.stats.educationCount})
                </p>
                {preview.education.length > 0 ? (
                  <ul className="space-y-1">
                    {preview.education.slice(0, 2).map((edu, i) => (
                      <li key={i} className="text-sm">
                        <span className="font-medium">{edu.degree || 'Curso'}</span>
                        <span className="text-on-surface-variant"> @ {edu.institution}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-error text-sm">Nenhuma encontrada</span>
                )}
              </div>

              <div className="p-3 bg-surface rounded-xl">
                <p className="text-xs uppercase tracking-wider text-outline font-medium mb-1">
                  Skills ({preview.stats.skillsCount})
                </p>
                {preview.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {preview.skills.slice(0, 8).map((skill, i) => (
                      <span key={i} className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">
                        {skill}
                      </span>
                    ))}
                    {preview.skills.length > 8 && (
                      <span className="px-2 py-0.5 bg-surface-container-high text-outline text-xs rounded-full">
                        + {preview.skills.length - 8}
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-error text-sm">Nenhuma encontrada</span>
                )}
              </div>

              <div className="p-3 bg-surface rounded-xl">
                <p className="text-xs uppercase tracking-wider text-outline font-medium mb-1">
                  Certificações ({preview.certifications.length})
                </p>
                {preview.certifications.length > 0 ? (
                  <ul className="space-y-1">
                    {preview.certifications.slice(0, 2).map((cert, i) => (
                      <li key={i} className="text-sm">
                        <span className="font-medium">{cert.name}</span>
                        {cert.issuer && <span className="text-on-surface-variant"> - {cert.issuer}</span>}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-error text-sm">Nenhuma encontrada</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 p-4 bg-surface-container-low rounded-xl">
        <div className="flex items-start gap-3 text-sm text-on-surface-variant">
          <svg className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="font-medium text-on-surface">Como obter o texto do seu LinkedIn:</p>
            <ol className="mt-2 space-y-1 list-decimal list-inside">
              <li>Acesse seu perfil no LinkedIn</li>
              <li>Clique em &quot;More&quot; (três pontinhos) e selecione &quot;Save to PDF&quot;</li>
              <li>Abra o PDF e copie todo o texto</li>
              <li>Cole aqui e clique em &quot;Visualizar Preview&quot;</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
