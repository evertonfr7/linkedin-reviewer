import { ParsePreview, ProfileData } from '@/types/analysis';

function extractHtmlFromMhtml(mhtmlContent: string): string {
  const trimmed = mhtmlContent.trimStart();

  // If the file starts with HTML directly (saved as .mhtml but is actually plain HTML)
  if (trimmed.startsWith('<!DOCTYPE') || trimmed.startsWith('<html')) {
    return trimmed;
  }

  // Standard MHTML with boundary (quoted or unquoted)
  const boundaryMatch = mhtmlContent.match(/boundary="([^"]+)"/) ||
    mhtmlContent.match(/boundary=([^\s;]+)/);

  if (!boundaryMatch) {
    // Last resort: try to find HTML content directly anywhere in the file
    const htmlStart = mhtmlContent.indexOf('<!DOCTYPE');
    if (htmlStart !== -1) {
      return mhtmlContent.slice(htmlStart);
    }
    throw new Error('Formato de arquivo não reconhecido. Salve a página do LinkedIn como "Página da Web completa" (.mhtml) ou "Arquivo HTML" (.html).');
  }

  const boundary = boundaryMatch[1];
  const parts = mhtmlContent.split(`--${boundary}`);

  for (const part of parts) {
    if (part.includes('text/html') && part.includes('Content-Location')) {
      const htmlStart = part.indexOf('<!DOCTYPE');
      if (htmlStart !== -1) {
        let html = part.slice(htmlStart);
        html = html
          .replace(/=\r?\n/g, '')
          .replace(/=([0-9A-F]{2})/gi, (_, hex) =>
            String.fromCharCode(parseInt(hex, 16))
          );

        const bytes: number[] = [];
        for (let i = 0; i < html.length; i++) {
          bytes.push(html.charCodeAt(i));
        }
        return Buffer.from(bytes).toString('utf8');
      }
    }
  }

  throw new Error('HTML não encontrado no arquivo. Tente salvar a página do LinkedIn novamente.');
}

function cleanText(text: string): string {
  return text
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#\d+;/g, '')
    .replace(/[\u00A0\u1680\u180E\u2000-\u200B\u202F\u205F\u3000]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const SKIP_PATTERNS = [
  /visualiza/i,
  /impress/i,
  /resultados de pesquisa/i,
  /seguidores/i,
  /conex/i,
  /vezes/i,
  /ocorrências/i,
  /Saiba quem/i,
  /confira quem/i,
  /Veja a/i,
  /^Editar$/i,
  /^Adicionar$/i,
  /^Aprimorar$/i,
  /^Disponível para$/i,
  /^\s*·\s*$/i,
  /^\s*•\s*$/i,
  /profile/i,
  /overlay/i,
  /linkedin\.com/i,
  /da empresa/i,
  /verificado/i,
];

function shouldSkip(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed || trimmed.length < 2) return true;
  return SKIP_PATTERNS.some(pattern => pattern.test(trimmed));
}

function extractName(html: string): string {
  // Try <title> tag first: "Name | LinkedIn"
  const titleMatch = html.match(/<title>([^|<]+)\|/);
  if (titleMatch) {
    const name = cleanText(titleMatch[1]);
    if (name && name.length > 1 && name.length < 60) return name;
  }

  // Try aria-label with exact name (LinkedIn nav button)
  const ariaNames = [...html.matchAll(/aria-label="([^"]+)"/g)];
  for (const m of ariaNames) {
    const val = cleanText(m[1]);
    // Skip UI labels — a name is typically 2-4 words, no special keywords
    if (val && val.length > 3 && val.length < 50 &&
        !shouldSkip(val) &&
        !/menu|pular|fechar|editar|mais|início|rede|vagas|mensag|notific|negócio|foto|fundo|idioma|perfil|anúncio/i.test(val) &&
        /^[A-ZÀ-Ú][a-zà-ú]+ [A-ZÀ-Ú]/.test(val)) {
      return val;
    }
  }

  // Try h2 that looks like a name
  const h2Matches = [...html.matchAll(/<h2[^>]*>([^<]+)<\/h2>/g)];
  for (const m of h2Matches) {
    const text = cleanText(m[1]);
    if (text && text.length > 3 && text.length < 50 &&
        !shouldSkip(text) &&
        /^[A-ZÀ-Ú][a-zà-ú]+ [A-ZÀ-Ú]/.test(text)) {
      return text;
    }
  }

  return '';
}

function extractHeadline(html: string, name: string): string {
  // The headline usually appears as a <p> right after the name, containing role keywords
  // Look for text that contains typical headline patterns (pipes, dots, keywords)
  const pMatches = [...html.matchAll(/<p[^>]*>([^<]+)<\/p>/g)];
  for (const m of pMatches) {
    const text = cleanText(m[1]);
    if (!text || text.length < 10 || text.length > 220) continue;
    if (shouldSkip(text)) continue;
    if (text === name) continue;
    // Headlines typically contain job-related terms or separators like | · &
    if (/engineer|developer|designer|manager|director|analyst|consultant|architect|founder|ceo|cto|product|marketing|sales|full.?stack|front.?end|back.?end|software|data|lead|head|senior|junior|specialist|focused|passionate/i.test(text) ||
        /[|·•]/.test(text)) {
      return text;
    }
  }
  return '';
}

function extractLocation(html: string): string {
  // Match text containing known location patterns (city, state, country)
  const pMatches = [...html.matchAll(/<p[^>]*>([^<]+)<\/p>/g)];
  for (const m of pMatches) {
    const text = cleanText(m[1]);
    if (!text || text.length < 3 || text.length > 80) continue;
    // Location pattern: "City, State, Country" or "City, Country" or "Greater X Area"
    if (/,\s*(Brasil|Brazil|Portugal|USA|UK|Canada|France|Germany|Spain|Argentina)/i.test(text) ||
        /,\s*(Ceará|São Paulo|Rio de Janeiro|Minas Gerais|Bahia|Paraná|Santa Catarina|Pernambuco|Rio Grande)/i.test(text) ||
        /\b(Greater|Area|Metropolitan|Região)\b/i.test(text)) {
      return text;
    }
  }
  return '';
}

function extractAbout(html: string): string {
  // Try expandable text box (standard LinkedIn about section)
  const aboutPattern = /data-testid="expandable-text-box"[^>]*>([\s\S]*?)<\/span>/;
  const match = html.match(aboutPattern);
  if (match) {
    const text = cleanText(match[1]);
    if (text && text.length > 20) return text;
  }

  // Try text after "Sobre" section marker
  const sobreIdx = html.indexOf('>Sobre</');
  if (sobreIdx !== -1) {
    const afterSobre = html.slice(sobreIdx, sobreIdx + 5000);
    const pMatches = [...afterSobre.matchAll(/<(?:p|span|div)[^>]*>([^<]{50,})<\/(?:p|span|div)>/g)];
    for (const m of pMatches) {
      const text = cleanText(m[1]);
      if (text && text.length > 30 && !shouldSkip(text)) {
        return text;
      }
    }
  }

  return '';
}

function extractConnectionsCount(html: string): string | null {
  const match = html.match(/Mais de (\d+) conex/i) || html.match(/(\d+)\+?\s*conex/i);
  if (match) return match[1];
  return null;
}

function extractCustomUrl(html: string): string | null {
  const match = html.match(/linkedin\.com\/in\/([a-zA-Z0-9_-]+)/);
  if (match) return match[1];
  return null;
}

function extractExperiences(html: string): { title: string; company: string; period: string; description: string | null }[] {
  const experiences: { title: string; company: string; period: string; description: string | null }[] = [];
  
  const expSectionMatch = html.match(/<h2[^>]*>Experi[^<]*<\/h2>([\s\S]*?)<h2[^>]*>/);
  if (!expSectionMatch) return experiences;

  const section = expSectionMatch[1];
  
  const jobMatches = section.matchAll(/<p[^>]*class="[^"]*_71722394[^"]*"[^>]*>([^<]+)<\/p>[\s\S]*?<p[^>]*class="[^"]*_56de91f4[^"]*"[^>]*>([^<]*)<\/p>/g);
  
  for (const match of jobMatches) {
    const title = cleanText(match[1]);
    const subtitle = cleanText(match[2]);
    
    if (title && !shouldSkip(title) && title.length > 3 && title.length < 100) {
      const companyParts = subtitle.split(/[·•]/);
      const company = cleanText(companyParts[0] || '');
      
      const periodMatch = section.match(/<p[^>]*class="[^"]*_93afae24[^"]*"[^>]*>([^<]+)<\/p>/);
      const period = periodMatch ? cleanText(periodMatch[1]) : '';
      
      if (!experiences.find(e => e.title === title)) {
        experiences.push({ title, company, period, description: null });
      }
    }
  }

  return experiences.slice(0, 10);
}

function extractEducation(html: string): ParsePreview['education'] {
  const education: ParsePreview['education'] = [];
  
  const eduSectionMatch = html.match(/<h2[^>]*>Forma[^<]*<\/h2>([\s\S]*?)<h2[^>]*>/);
  if (!eduSectionMatch) return education;

  const section = eduSectionMatch[1];
  
  const institutionMatch = section.match(/aria-label="Logo da empresa ([^"]+)"/);
  const degreeMatch = section.match(/<p[^>]*class="[^"]*_71722394[^"]*"[^>]*>([^<]+)<\/p>/);
  const periodMatch = section.match(/<p[^>]*class="[^"]*_56de91f4[^"]*"[^>]*>([^<]+)<\/p>/);
  
  if (institutionMatch || degreeMatch) {
    const institution = institutionMatch ? cleanText(institutionMatch[1]) : '';
    const degree = degreeMatch ? cleanText(degreeMatch[1]) : '';
    const period = periodMatch ? cleanText(periodMatch[1]) : '';
    
    if (institution && !shouldSkip(institution)) {
      education.push({ institution, degree, period });
    }
  }

  return education.slice(0, 5);
}

function extractSkills(html: string): string[] {
  const skills: string[] = [];
  
  const skillsSectionMatch = html.match(/<h2[^>]*>[^<]*(?:Skills|Compet)[^<]*<\/h2>([\s\S]*?)<h2[^>]*>/);
  if (!skillsSectionMatch) return skills;

  const section = skillsSectionMatch[1];
  
  const skillMatches = section.matchAll(/<p[^>]*class="[^"]*_71722394[^"]*"[^>]*>([^<]+)<\/p>/g);
  
  for (const match of skillMatches) {
    const skillName = cleanText(match[1]);
    if (skillName && !skills.includes(skillName) && skillName.length > 1 && skillName.length < 50 && !shouldSkip(skillName)) {
      skills.push(skillName);
    }
  }

  return skills.slice(0, 20);
}

function extractCertifications(html: string): ParsePreview['certifications'] {
  const certifications: ParsePreview['certifications'] = [];
  
  const certSectionMatch = html.match(/<h2[^>]*>Certifica[^<]*<\/h2>([\s\S]*?)<h2[^>]*>/);
  if (!certSectionMatch) return certifications;

  const section = certSectionMatch[1];
  const certMatches = section.matchAll(/<p[^>]*>([^<]+)<\/p>/g);
  
  for (const match of certMatches) {
    const certName = cleanText(match[1]);
    if (certName && certName.length > 3 && certName.length < 100 && !shouldSkip(certName)) {
      certifications.push({ name: certName, issuer: '', date: null });
    }
  }

  return certifications.slice(0, 10);
}

function extractRecommendations(html: string): { received: number; given: number } {
  let received = 0;
  let given = 0;

  const receivedMatch = html.match(/Recebidas \((\d+)\)/);
  if (receivedMatch) {
    received = parseInt(receivedMatch[1], 10);
  }

  const givenMatch = html.match(/Fornecidas \((\d+)\)/);
  if (givenMatch) {
    given = parseInt(givenMatch[1], 10);
  }

  return { received, given };
}

function extractLanguages(html: string): { name: string; proficiency: string }[] {
  const languages: { name: string; proficiency: string }[] = [];
  
  const langSectionMatch = html.match(/<h2[^>]*>Idiomas<\/h2>([\s\S]*?)<h2[^>]*>/);
  if (!langSectionMatch) return languages;

  const section = langSectionMatch[1];
  
  const langMatches = section.matchAll(/<p[^>]*class="[^"]*_71722394[^"]*"[^>]*>([^<]+)<\/p>[\s\S]*?<p[^>]*class="[^"]*_56de91f4[^"]*"[^>]*>([^<]+)<\/p>/g);
  
  for (const match of langMatches) {
    const langName = cleanText(match[1]);
    const proficiency = cleanText(match[2]);
    
    if (langName && !shouldSkip(langName) && langName.length > 1 && langName.length < 50) {
      languages.push({ name: langName, proficiency });
    }
  }

  return languages;
}

function extractLicensesAndCertifications(html: string): ParsePreview['certifications'] {
  const certs: ParsePreview['certifications'] = [];
  
  const certSectionMatch = html.match(/<h2[^>]*>Licen[ç|c]as e certificados<\/h2>([\s\S]*?)<h2[^>]*>/);
  if (!certSectionMatch) return certs;

  const section = certSectionMatch[1];
  
  const certMatches = section.matchAll(/<p[^>]*class="[^"]*_71722394[^"]*"[^>]*>([^<]+)<\/p>[\s\S]*?<p[^>]*class="[^"]*_56de91f4[^"]*"[^>]*>([^<]+)<\/p>/g);
  
  for (const match of certMatches) {
    const certName = cleanText(match[1]);
    const issuer = cleanText(match[2]);
    
    if (certName && !shouldSkip(certName) && certName.length > 2 && certName.length < 150) {
      const dateMatch = section.match(/Emitida em ([^<]+)/);
      const date = dateMatch ? cleanText(dateMatch[1]) : null;
      
      if (!certs.find(c => c.name === certName)) {
        certs.push({ name: certName, issuer, date });
      }
    }
  }

  return certs.slice(0, 10);
}

export function parseMhtml(mhtmlContent: string): ParsePreview {
  const html = extractHtmlFromMhtml(mhtmlContent);

  const name = extractName(html);
  const headline = extractHeadline(html, name);
  const location = extractLocation(html);
  const about = extractAbout(html);
  const experiences = extractExperiences(html);
  const education = extractEducation(html);
  const skills = extractSkills(html);
  const certifications = extractLicensesAndCertifications(html);
  const languages = extractLanguages(html);
  const { received: recommendationsReceived, given: recommendationsGiven } = extractRecommendations(html);

  const warnings: string[] = [];

  if (!name) warnings.push('Nome nao encontrado');
  if (!headline) warnings.push('Headline nao encontrada');
  if (!about) warnings.push('Secao "Sobre" nao encontrada — adicione manualmente nas informacoes adicionais');
  if (experiences.length === 0) warnings.push('Experiencias nao encontradas — o LinkedIn carrega essas secoes dinamicamente. Adicione manualmente nas informacoes adicionais');
  if (education.length === 0) warnings.push('Formacao nao encontrada — adicione manualmente nas informacoes adicionais');
  if (skills.length === 0) warnings.push('Skills nao encontradas — adicione manualmente nas informacoes adicionais');

  return {
    name,
    headline,
    about,
    location,
    experiences,
    education,
    skills,
    certifications,
    recommendationsReceived,
    recommendationsGiven,
    warnings,
    languages,
    volunteering: null,
    projects: [],
    stats: {
      nameFound: !!name,
      headlineFound: !!headline,
      aboutLength: about.length,
      experiencesCount: experiences.length,
      educationCount: education.length,
      skillsCount: skills.length,
      recommendationsCount: recommendationsReceived + recommendationsGiven,
    },
  };
}

export function parsePreviewToProfileData(
  preview: ParsePreview,
  options?: { photoUrl?: string }
): ProfileData {
  return {
    name: preview.name,
    headline: preview.headline,
    location: preview.location,
    url: '',
    photoUrl: options?.photoUrl || null,
    bannerUrl: null,
    about: preview.about,
    experiences: preview.experiences.map(exp => ({
      ...exp,
      logoUrl: null,
    })),
    education: preview.education.map(edu => ({
      ...edu,
      description: null,
    })),
    skills: preview.skills,
    endorsementsCount: 0,
    recommendationsReceived: preview.recommendationsReceived,
    recommendationsGiven: preview.recommendationsGiven,
    certifications: preview.certifications.map(cert => ({
      name: cert.name,
      issuer: cert.issuer,
      dateObtained: cert.date,
      hasVerificationLink: false,
    })),
    customUrl: false,
    connectionsCount: null,
    recentActivity: {
      lastPostDaysAgo: null,
      postsThisMonth: 0,
    },
    featured: [],
    languages: [],
    volunteering: null,
    projects: [],
  };
}
