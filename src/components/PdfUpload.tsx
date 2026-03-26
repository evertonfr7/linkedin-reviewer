'use client';

import { useState, useCallback } from 'react';
import { ParsePreview } from '@/types/analysis';
import { extractTextFromPdf, validatePdfFile } from '@/lib/pdfExtractor';

interface PdfUploadProps {
  onSubmit: (parsedProfile: unknown) => void;
  onCancel: () => void;
  isLoading: boolean;
}

interface ProfilePhoto {
  name: string;
  size: number;
  base64: string;
}

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export default function PdfUpload({ onSubmit, onCancel, isLoading }: PdfUploadProps) {
  const [pdfFile, setPdfFile] = useState<{ name: string; size: number; file: File } | null>(null);
  const [pdfText, setPdfText] = useState<string | null>(null);
  const [pdfPages, setPdfPages] = useState<number>(0);
  const [profilePhoto, setProfilePhoto] = useState<ProfilePhoto | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [preview, setPreview] = useState<ParsePreview | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setUploadError(null);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    const pdf = droppedFiles.find(file => file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf'));
    
    if (!pdf) {
      setUploadError('Por favor, envie um arquivo PDF.');
      return;
    }
    
    setPdfFile({
      name: pdf.name,
      size: pdf.size,
      file: pdf,
    });
    setPdfText(null);
    setPreview(null);
    setPreviewError(null);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = e.target.files?.[0];
    
    if (!file) return;
    
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setUploadError('Por favor, selecione um arquivo PDF.');
      return;
    }
    
    setPdfFile({
      name: file.name,
      size: file.size,
      file,
    });
    setPdfText(null);
    setPreview(null);
    setPreviewError(null);
    e.target.value = '';
  }, []);

  const handlePhotoSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setPhotoError(null);
    const file = e.target.files?.[0];
    
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setPhotoError('Formato não suportado. Use JPG, PNG ou WebP.');
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setPhotoError('Imagem muito grande. Máximo 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setProfilePhoto({
        name: file.name,
        size: file.size,
        base64,
      });
    };
    reader.onerror = () => {
      setPhotoError('Erro ao processar imagem.');
    };
    reader.readAsDataURL(file);
    
    e.target.value = '';
  }, []);

  const handleExtract = async () => {
    if (!pdfFile) return;

    setIsExtracting(true);
    setUploadError(null);

    try {
      const result = await extractTextFromPdf(pdfFile.file);
      setPdfText(result.text);
      setPdfPages(result.pages);
    } catch (error) {
      console.error('PDF extraction error:', error);
      setUploadError('Erro ao extrair texto do PDF. Verifique se o arquivo não está corrompido.');
    } finally {
      setIsExtracting(false);
    }
  };

  const handlePreview = async () => {
    if (!pdfText) return;

    setIsLoadingPreview(true);
    setPreviewError(null);

    try {
      const response = await fetch('/api/pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          text: pdfText,
          photo: profilePhoto?.base64 || null,
        }),
      });

      const data = await response.json();

      if (data.success && data.preview) {
        setPreview(data.preview);
      } else {
        setPreviewError(data.error || 'Erro ao processar PDF');
      }
    } catch {
      setPreviewError('Erro ao conectar com o servidor');
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const handleConfirm = () => {
    if (preview) {
      const dataToSubmit = {
        parsedProfile: preview,
        profilePhoto: profilePhoto?.base64 || null,
      };
      onSubmit(dataToSubmit);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-surface-container-lowest rounded-2xl p-8 shadow-lg">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h2 className="font-headline font-bold text-xl text-on-surface">
              Upload de PDF do LinkedIn
            </h2>
            <p className="text-sm text-on-surface-variant">
              Exporte seu perfil como PDF e faça upload aqui
            </p>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-on-surface mb-2">
            Foto do Perfil (opcional)
          </label>
          <div className="flex items-center gap-4">
            <div className="relative">
              {profilePhoto ? (
                <div className="relative">
                  <img 
                    src={profilePhoto.base64} 
                    alt="Foto do perfil" 
                    className="w-24 h-24 rounded-full object-cover border-2 border-primary"
                  />
                  <button
                    onClick={() => setProfilePhoto(null)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-error text-white rounded-full flex items-center justify-center hover:bg-error/80 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <div className="w-24 h-24 rounded-full bg-surface-container-high border-2 border-dashed border-outline flex items-center justify-center">
                  <svg className="w-8 h-8 text-on-surface-variant" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )}
            </div>
            <div className="flex-1">
              <input
                type="file"
                id="photo-upload"
                accept="image/jpeg,image/png,image/webp"
                onChange={handlePhotoSelect}
                className="hidden"
              />
              <label 
                htmlFor="photo-upload"
                className="inline-flex items-center gap-2 px-4 py-2 bg-surface-container-high text-on-surface rounded-full cursor-pointer hover:bg-surface-container-high/80 transition-colors text-sm font-medium"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {profilePhoto ? 'Trocar foto' : 'Adicionar foto'}
              </label>
              <p className="text-xs text-on-surface-variant mt-1">JPG, PNG ou WebP. Máximo 5MB.</p>
            </div>
          </div>
          {photoError && (
            <p className="text-sm text-error mt-2">{photoError}</p>
          )}
        </div>

        <div 
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
            isDragging 
              ? 'border-primary bg-primary/5' 
              : 'border-outline-variant hover:border-primary/50'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="file"
            id="pdf-upload"
            accept=".pdf,application/pdf"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          <label 
            htmlFor="pdf-upload" 
            className="cursor-pointer"
          >
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center">
                <svg className="w-8 h-8 text-on-surface-variant" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-on-surface">
                  {pdfFile ? pdfFile.name : 'Arraste o PDF do LinkedIn aqui'}
                </p>
                <p className="text-sm text-on-surface-variant mt-1">
                  {pdfFile ? formatFileSize(pdfFile.size) : 'ou clique para selecionar'}
                </p>
              </div>
            </div>
          </label>
        </div>

        {uploadError && (
          <div className="mt-4 p-4 bg-error-container rounded-xl border border-error/20">
            <p className="text-on-error-container text-sm flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {uploadError}
            </p>
          </div>
        )}

        {pdfText && (
          <div className="mt-4 p-4 bg-green-50 rounded-xl border border-green-200">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-green-800 font-medium">
                PDF extraído com sucesso! ({pdfPages} páginas, {pdfText.length} caracteres)
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-6 pt-6 border-t border-outline-variant">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 rounded-full font-headline font-bold text-on-surface-variant hover:bg-surface-container-high transition-all"
            disabled={isLoading}
          >
            Cancelar
          </button>
          
          <div className="flex items-center gap-3">
            {!pdfText && (
              <button
                type="button"
                onClick={handleExtract}
                disabled={!pdfFile || isExtracting}
                className="px-6 py-3 rounded-full font-headline font-bold border-2 border-secondary text-secondary hover:bg-secondary/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isExtracting ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Extraindo...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    Extrair Texto
                  </>
                )}
              </button>
            )}
            
            <button
              type="button"
              onClick={handlePreview}
              disabled={!pdfText || isLoadingPreview}
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

        {previewError && (
          <div className="mt-4 p-4 bg-error-container rounded-xl border border-error/20">
            <p className="text-on-error-container text-sm flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {previewError}
            </p>
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
                  Certificações ({preview.stats.certificationsCount})
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
            <p className="font-medium text-on-surface">Como exportar seu perfil do LinkedIn:</p>
            <ol className="mt-2 space-y-1 list-decimal list-inside">
              <li>Acesse seu perfil no LinkedIn</li>
              <li>Clique em &quot;More&quot; (três pontinhos) no topo do perfil</li>
              <li>Selecione &quot;Save to PDF&quot;</li>
              <li>Salve o arquivo e faça upload aqui</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
