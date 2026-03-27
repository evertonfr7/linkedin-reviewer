import { ProfileData, ParsePreview, ParsedExperience, ParsedEducation, ParsedCertification } from '@/types/analysis';

const SECTION_HEADERS = {
  about: /^(SOBRE|ABOUT|RESUMO|SUMMARY|ABOUT\s*ME|PROFILE|SUMMARY\s*TEXT)$/im,
  experience: /^(EXPERI[EÊ]NCIA|EXPERIENCE|EXPERIENCES|WORK\s*EXPERIENCE|PROFESSIONAL\s*EXPERIENCE)$/im,
  education: /^(FORMA[CÇ][ÃA]O|EDUCATION|ACADEMIC\s*BACKGROUND|FORMA[CÇ][ÃA]O\s*ACAD[EÊ]MICA)$/im,
  skills: /^(COMPET[EÊ]NCIAS?|SKILLS|EXPERTISE|HABILIDADES?)$/im,
  certifications: /^(CERTIFICA[CÇ][OÕ]ES?|CERTIFICATIONS|LICENSES|CERTIFICATES)$/im,
  recommendations: /^(RECOMENDA[CÇ][OÕ]ES?|RECOMMENDATIONS|REFS|REFERENCES)$/im,
  projects: /^(PROJETOS?|PROJECTS|PORTFOLIO)$/im,
  languages: /^(IDIOMAS?|LANGUAGES|LANGUAGUE\s*SKILLS)$/im,
  volunteering: /^(VOLUNTARIADO|VOLUNTEERING|Causes|Causas)$/im,
};

const PERIOD_PATTERNS = [
  /([A-Za-z]{3,4}\.?\s*\d{4})\s*[-–—]\s*(Present|Current|Agora|Atualmente|\d{4})/gi,
  /(\d{4})\s*[-–—]\s*(\d{4}|Present|Current|Agora|Atualmente)/gi,
  /([A-Za-z]{3}\s*\d{4})\s*[-–—]\s*([A-Za-z]{3}\s*\d{4})/gi,
];

const SKILL_SEPARATORS = /[•|,|│|\t|\n]/;

const INSTITUTION_KEYWORDS = [
  'universidade', 'university', 'instituto', 'institute', 'faculdade', 'college',
  'school', 'academy', 'escola', 'centro', 'center', 'puc', 'usp', 'ufmg', 'unicamp',
  'unesp', 'uerj', 'ufpr', 'ufsc', 'ufrj', 'ibmec', 'insper', 'fgv', 'faap',
];

const MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez',
  'jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

function normalizeText(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\t/g, ' ')
    .replace(/\u00A0/g, ' ')
    .replace(/\u200B/g, '')
    .replace(/\u2018|\u2019/g, "'")
    .replace(/\u201C|\u201D/g, '"')
    .replace(/\u2022/g, '•')
    .replace(/•\s*/g, '•')
    .replace(/\s*•\s*/g, '•')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n[ \t]+/g, '\n')
    .trim();
}

function splitIntoLines(text: string): string[] {
  return text
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);
}

function detectSection(line: string): string | null {
  const cleanLine = line.replace(/^[\s•\-\*\d\.]+\s*/, '').trim();
  
  for (const [section, pattern] of Object.entries(SECTION_HEADERS)) {
    if (pattern.test(cleanLine)) {
      return section;
    }
  }
  
  const upperLine = cleanLine.toUpperCase();
  if (upperLine === 'SOBRE' || upperLine === 'ABOUT') return 'about';
  if (upperLine.includes('EXPERI') || upperLine.includes('WORK')) return 'experience';
  if (upperLine.includes('FORMA') || upperLine.includes('EDUC')) return 'education';
  if (upperLine.includes('COMPET') || upperLine.includes('SKILL')) return 'skills';
  if (upperLine.includes('CERTIF')) return 'certifications';
  if (upperLine.includes('RECOMEND')) return 'recommendations';
  if (upperLine.includes('PROJET')) return 'projects';
  if (upperLine.includes('IDIOMA') || upperLine.includes('LANGUA')) return 'languages';
  if (upperLine.includes('VOLUNTAR')) return 'volunteering';
  
  return null;
}

function isSeparatorLine(line: string): boolean {
  const cleaned = line.replace(/[\s\-–—=*_.]/g, '');
  return cleaned.length === 0 || /^[\s\-\–\—\*\.\:]+$/.test(line);
}

function parsePeriod(line: string): { start: string; end: string } | null {
  for (const pattern of PERIOD_PATTERNS) {
    pattern.lastIndex = 0;
    const match = pattern.exec(line);
    if (match) {
      return {
        start: match[1].trim(),
        end: match[2].trim(),
      };
    }
  }
  return null;
}

function parseSkills(line: string): string[] {
  const skills = line
    .split(SKILL_SEPARATORS)
    .map(s => s.trim())
    .filter(s => s.length > 0 && s.length < 50)
    .filter((s, i, arr) => arr.indexOf(s) === i);
  
  return skills.filter(skill => {
    const lower = skill.toLowerCase();
    return !Object.values(SECTION_HEADERS).some(p => p.test(skill)) &&
           !lower.includes('sobre') &&
           !lower.includes('about') &&
           !lower.includes('experi') &&
           !lower.includes('forma') &&
           skill.length > 1;
  });
}

function isInstitution(line: string): boolean {
  const lower = line.toLowerCase();
  return INSTITUTION_KEYWORDS.some(kw => lower.includes(kw)) ||
         /\b[A-Z][a-z]+\s+(University|Institute|College|School|Academy)\b/i.test(line) ||
         /^(USP|UNICAMP|UFMG|UFPR|UFSC|UFRJ|UERJ|UNESP|PUC|FGV|IBMEC|INSPE)/i.test(line);
}

function isLikelyCompany(line: string): boolean {
  const indicators = [
    /Ltd\.?|LLC|Inc\.?|Corp\.?|S\.?A\.?|ME|EIRELI|EPP/i,
    /\b(Company|Technologies|Tech|Solutions|Services|Consulting|Group|Partners|Digital|Media)\b/i,
    /^(Google|Microsoft|Amazon|Meta|Apple|Netflix|Uber|Airbnb|Shopify|Stripe|PayPal|Adobe|IBM|Oracle|SAP|Salesforce|Twitter|LinkedIn|TikTok|Spotify)/i,
    /\b(Developer|Engineer|Designer|Consultant|Manager|Director|Analyst|Designer)\b/i,
  ];
  return indicators.some(p => p.test(line));
}

function isLikelyJobTitle(line: string): boolean {
  const titles = [
    'developer', 'engineer', 'designer', 'manager', 'director', 'analyst',
    'consultant', 'architect', 'lead', 'senior', 'junior', 'intern', 'trainee',
    'ceo', 'cto', 'cfo', 'coo', 'vp', 'head', 'chief', 'president',
    'specialist', 'coordinator', 'supervisor', 'associate', 'assistant',
    'software', 'frontend', 'backend', 'fullstack', 'full-stack', 'data',
    'product', 'project', 'business', 'marketing', 'sales', 'hr', 'rh',
    'devops', 'cloud', 'security', 'ux', 'ui', 'qa', 'quality',
  ];
  const lower = line.toLowerCase();
  return titles.some(t => lower.includes(t)) && line.length < 80;
}

function isLikelyDescription(line: string): boolean {
  const lower = line.toLowerCase();
  const startsWithBullet = /^[\s\-\•\*\→\▶\d\.]/.test(line);
  const isAction = /^(realizei?|desenvolvi?|liderei?|criei?|implementei?|coordenei?|otimizei?|aumentei?|reduzi?|gerenciei?|participei?|colaborrei?)/i.test(lower);
  const hasMetric = /\d+%|R\$\s*\d+|\d+\s*(mil|milhoes?|milh천es?)|\$\s*\d+/i.test(line);
  const hasActionVerb = /^(lider|lid|desenv|implement|cri|ger|coord|otimiz|aument|reduz|gerenc|partic|colab|gerenci|deliv|build|develop|lead|manage|create|implement|design|analyze|plan|execute|improv|increas|decreas)/i.test(lower);
  
  return (startsWithBullet || isAction || hasActionVerb) && line.length > 10;
}

export function parseLinkedInText(text: string): ParsePreview {
  const warnings: string[] = [];
  const normalizedText = normalizeText(text);
  const lines = splitIntoLines(normalizedText);
  
  const result: ParsePreview = {
    name: null,
    headline: null,
    location: null,
    about: null,
    experiences: [],
    education: [],
    skills: [],
    certifications: [],
    languages: [],
    volunteering: null,
    projects: [],
    warnings: [],
    recommendationsReceived: 0,
    recommendationsGiven: 0,
    stats: {
      nameFound: false,
      headlineFound: false,
      aboutLength: 0,
      experiencesCount: 0,
      educationCount: 0,
      skillsCount: 0,
      recommendationsCount: 0,
    },
  };
  
  let currentSection: string | null = null;
  let currentExperience: Partial<ParsedExperience> = {};
  let currentEducation: Partial<ParsedEducation> = {};
  let currentCertification: Partial<ParsedCertification> = {};
  let aboutBuffer: string[] = [];
  let descriptionBuffer: string[] = [];
  let skillsBuffer: string[] = [];
  let lineIndex = 0;
  
  function finalizeExperience() {
    if (currentExperience.title || currentExperience.company) {
      result.experiences.push({
        title: currentExperience.title || currentExperience.company || '',
        company: currentExperience.company || '',
        period: currentExperience.period || '',
        description: currentExperience.description || null,
      });
      descriptionBuffer = [];
    }
    currentExperience = {};
  }
  
  function finalizeEducation() {
    if (currentEducation.institution || currentEducation.degree) {
      result.education.push({
        institution: currentEducation.institution || '',
        degree: currentEducation.degree || '',
        period: currentEducation.period || '',
      });
    }
    currentEducation = {};
  }
  
  function finalizeCertification() {
    if (currentCertification.name) {
      result.certifications.push({
        name: currentCertification.name,
        issuer: currentCertification.issuer || '',
        date: currentCertification.date || null,
      });
    }
    currentCertification = {};
  }
  
  function finalizeAbout() {
    if (aboutBuffer.length > 0) {
      result.about = aboutBuffer.join('\n').trim();
    }
    aboutBuffer = [];
  }
  
  function finalizeSkills() {
    if (skillsBuffer.length > 0) {
      for (const skill of skillsBuffer) {
        const parsed = parseSkills(skill);
        result.skills.push(...parsed);
      }
      skillsBuffer = [];
    }
    result.skills = [...new Set(result.skills.map(s => s.toLowerCase()))].map(s => 
      result.skills.find(sk => sk.toLowerCase() === s) || s
    );
  }
  
  while (lineIndex < lines.length) {
    const line = lines[lineIndex];
    const nextLine = lines[lineIndex + 1] || '';
    
    const detectedSection = detectSection(line);
    if (detectedSection && (line.length < 30 || isSeparatorLine(line) || detectedSection !== currentSection)) {
      if (currentSection === 'experience') finalizeExperience();
      if (currentSection === 'about') finalizeAbout();
      if (currentSection === 'skills') finalizeSkills();
      if (currentSection === 'education') finalizeEducation();
      if (currentSection === 'certifications') finalizeCertification();
      
      currentSection = detectedSection;
      lineIndex++;
      continue;
    }
    
    if (isSeparatorLine(line)) {
      lineIndex++;
      continue;
    }
    
    switch (currentSection) {
      case 'about':
        if (line.length > 20) {
          aboutBuffer.push(line);
        }
        break;
        
      case 'experience':
        const period = parsePeriod(line);
        
        if (period) {
          finalizeExperience();
          currentExperience.period = `${period.start} - ${period.end}`;
          
          if (nextLine && !detectSection(nextLine) && !isSeparatorLine(nextLine) && isLikelyJobTitle(nextLine)) {
            currentExperience.title = nextLine;
            lineIndex++;
          }
        } else if (isLikelyJobTitle(line) && !currentExperience.title) {
          currentExperience.title = line;
        } else if (isLikelyCompany(line) && !currentExperience.company) {
          currentExperience.company = line;
        } else if (isLikelyDescription(line)) {
          descriptionBuffer.push(line.replace(/^[\s\-\•\*\→\▶\d\.]+\s*/, ''));
          currentExperience.description = descriptionBuffer.join(' ');
        } else if (line.length > 30 && !currentExperience.description) {
          descriptionBuffer.push(line);
          currentExperience.description = descriptionBuffer.join(' ');
        }
        break;
        
      case 'education':
        if (isInstitution(line)) {
          finalizeEducation();
          currentEducation.institution = line;
          
          if (nextLine && !detectSection(nextLine) && !isSeparatorLine(nextLine) && nextLine.length < 100) {
            currentEducation.degree = nextLine;
            lineIndex++;
          }
        } else if (line.length < 100 && !currentEducation.degree) {
          const periodMatch = parsePeriod(line);
          if (periodMatch) {
            currentEducation.period = `${periodMatch.start} - ${periodMatch.end}`;
          } else {
            currentEducation.degree = line;
          }
        }
        break;
        
      case 'skills':
        const parsedLineSkills = parseSkills(line);
        if (parsedLineSkills.length > 0) {
          skillsBuffer.push(line);
        }
        break;
        
      case 'certifications':
        if (line.length > 3) {
          if (line.includes(' - ') || line.includes(' – ')) {
            finalizeCertification();
            const parts = line.split(/\s*[-–]\s*/);
            currentCertification.name = parts[0].trim();
            currentCertification.issuer = parts[1]?.trim() || '';
            currentCertification.date = parts[2]?.trim() || null;
          } else if (!currentCertification.name) {
            currentCertification.name = line;
          } else if (!currentCertification.issuer) {
            currentCertification.issuer = line;
          }
        }
        break;
        
      case 'languages':
        if (line.includes('(') || line.includes('-') || line.includes(':')) {
          const langMatch = line.match(/([A-Za-zÀ-ÿ\s]+)[\s]*[\(\-:](.*?)[\)\-:]?$/);
          if (langMatch) {
            result.languages.push({
              name: langMatch[1].trim(),
              proficiency: langMatch[2].trim(),
            });
          }
        } else if (line.length > 2 && line.length < 50) {
          result.languages.push({
            name: line,
            proficiency: 'Not specified',
          });
        }
        break;
        
      case 'projects':
        if (line.length > 3) {
          result.projects.push(line);
        }
        break;
        
      default:
        if (!result.name && line.length > 2 && line.length < 60 && !detectSection(line)) {
          const isEmail = /^[^\s]+@[^\s]+\.[^\s]+$/.test(line);
          const isUrl = /^https?:\/\//.test(line);
          const isPhone = /^[\+\d\s\-\(\)]{7,}$/.test(line);
          
          if (!isEmail && !isUrl && !isPhone) {
            result.name = line;
            result.stats.nameFound = true;
            
            if (nextLine && !detectSection(nextLine) && nextLine.length < 120) {
              result.headline = nextLine;
              result.stats.headlineFound = true;
              lineIndex++;
            }
          }
        } else if (result.name && !result.headline && line.length < 150) {
          result.headline = line;
          result.stats.headlineFound = true;
        } else if (result.name && result.headline && !result.location && line.length < 80) {
          const locationIndicators = [',', '-', 'São Paulo', 'Rio de Janeiro', 'Brazil', 'Brasil', 'Remote', 'Remoto'];
          if (locationIndicators.some(ind => line.includes(ind))) {
            result.location = line;
          }
        }
    }
    
    lineIndex++;
  }
  
  finalizeExperience();
  finalizeEducation();
  finalizeCertification();
  finalizeAbout();
  finalizeSkills();
  
  if (result.about && result.about.length > 0) {
    result.stats.aboutLength = result.about.length;
  }
  result.stats.experiencesCount = result.experiences.length;
  result.stats.educationCount = result.education.length;
  result.stats.skillsCount = result.skills.length;
  result.stats.recommendationsCount = 0;
  
  if (!result.stats.nameFound) {
    warnings.push('Nome não encontrado. Adicione seu nome no início do texto.');
  }
  if (!result.stats.headlineFound) {
    warnings.push('Headline não encontrada. Adicione seu título profissional após o nome.');
  }
  if (result.stats.aboutLength === 0) {
    warnings.push('Seção "Sobre" não encontrada. A análise será limitada.');
  } else if (result.stats.aboutLength < 100) {
    warnings.push('Seção "Sobre" está muito curta (< 100 caracteres). Recomenda-se pelo menos 300 caracteres.');
  }
  if (result.stats.experiencesCount === 0) {
    warnings.push('Nenhuma experiência encontrada. Adicione suas experiências profissionais.');
  } else {
    const withoutDescription = result.experiences.filter(e => !e.description || e.description.length < 20);
    if (withoutDescription.length > 0) {
      warnings.push(`${withoutDescription.length} experiência(s) sem descrição. Adicione detalhes sobre suas conquistas.`);
    }
  }
  if (result.stats.educationCount === 0) {
    warnings.push('Formação acadêmica não encontrada.');
  }
  if (result.stats.skillsCount === 0) {
    warnings.push('Nenhuma skill encontrada. Adicione suas competências técnicas e interpessoais.');
  } else if (result.stats.skillsCount < 5) {
    warnings.push('Poucas skills listadas (< 5). LinkedIn permite até 50 competências.');
  }
  if (result.certifications.length === 0) {
    warnings.push('Nenhuma certificação encontrada.');
  }
  
  result.warnings = warnings;
  
  return result;
}

export interface VisionMetadata {
  hasProfilePhoto?: boolean;
  hasBannerImage?: boolean;
  recommendationsCount?: number;
}

export function parsePreviewToProfileData(preview: ParsePreview, visionMeta?: VisionMetadata): ProfileData {
  return {
    url: '',
    name: preview.name,
    headline: preview.headline,
    photoUrl: visionMeta?.hasProfilePhoto ? 'detected' : null,
    bannerUrl: visionMeta?.hasBannerImage ? 'detected' : null,
    about: preview.about,
    experiences: preview.experiences.map(e => ({
      ...e,
      logoUrl: null,
    })),
    education: preview.education.map(e => ({
      ...e,
      description: null,
    })),
    skills: preview.skills,
    endorsementsCount: 0,
    recommendationsReceived: visionMeta?.recommendationsCount ?? 0,
    recommendationsGiven: 0,
    certifications: preview.certifications.map(c => ({
      name: c.name,
      issuer: c.issuer,
      dateObtained: c.date,
      hasVerificationLink: false,
    })),
    customUrl: false,
    connectionsCount: null,
    recentActivity: { lastPostDaysAgo: null, postsThisMonth: 0 },
    featured: [],
    languages: preview.languages,
    volunteering: preview.volunteering,
    projects: preview.projects,
    location: preview.location,
  };
}

export function parseManualProfileText(text: string): ProfileData {
  const preview = parseLinkedInText(text);
  return parsePreviewToProfileData(preview);
}
