export interface ProfileData {
  url: string;
  name: string | null;
  headline: string | null;
  photoUrl: string | null;
  bannerUrl: string | null;
  about: string | null;
  experiences: Experience[];
  education: Education[];
  skills: string[];
  endorsementsCount: number;
  recommendationsReceived: number;
  recommendationsGiven: number;
  certifications: Certification[];
  customUrl: boolean;
  connectionsCount: string | null;
  recentActivity: {
    lastPostDaysAgo: number | null;
    postsThisMonth: number;
  };
  featured: FeaturedItem[];
  languages: Language[];
  volunteering: string | null;
  projects: string[];
  location: string | null;
}

export interface Experience {
  title: string;
  company: string;
  period: string;
  description: string | null;
  logoUrl: string | null;
}

export interface Education {
  degree: string;
  institution: string;
  period: string;
  description: string | null;
}

export interface Certification {
  name: string;
  issuer: string;
  dateObtained: string | null;
  hasVerificationLink: boolean;
}

export interface FeaturedItem {
  type: 'post' | 'article' | 'media' | 'link';
  title: string;
  date: string | null;
}

export interface Language {
  name: string;
  proficiency: string;
}

export interface CategoryScore {
  name: string;
  id: string;
  score: number;
  maxScore: number;
  weight: number;
  feedback: string;
}

export interface AnalysisResult {
  profileData: ProfileData;
  profilePhoto: string | null;
  totalScore: number;
  grade: ProfileGrade;
  categories: CategoryScore[];
  topRecommendations: string[];
  analyzedAt: string;
}

export type ProfileGrade =
  | 'All-Star'
  | 'Advanced'
  | 'Intermediate'
  | 'Basic'
  | 'Beginner';

export interface AnalyzeRequest {
  url?: string;
  profileText?: string;
  parsedProfile?: ProfileData;
  profilePhoto?: string;
  photoDescription?: string;
  manualInfo?: string;
}

export interface AnalyzeResponse {
  success: boolean;
  result?: AnalysisResult;
  error?: string;
  requiresManualInput?: boolean;
}

export interface ParsedExperience {
  title: string;
  company: string;
  period: string;
  description: string | null;
}

export interface ParsedEducation {
  institution: string;
  degree: string;
  period: string;
}

export interface ParsedCertification {
  name: string;
  issuer: string;
  date: string | null;
}

export interface ParsePreview {
  name: string | null;
  headline: string | null;
  location: string | null;
  about: string | null;
  experiences: ParsedExperience[];
  education: ParsedEducation[];
  skills: string[];
  certifications: ParsedCertification[];
  languages: { name: string; proficiency: string }[];
  volunteering: string | null;
  projects: string[];
  warnings: string[];
  recommendationsReceived: number;
  recommendationsGiven: number;
  stats: {
    nameFound: boolean;
    headlineFound: boolean;
    aboutLength: number;
    experiencesCount: number;
    educationCount: number;
    skillsCount: number;
    recommendationsCount: number;
  };
}

export interface AnalyzePreviewRequest {
  profileText: string;
}

export interface AnalyzePreviewResponse {
  success: boolean;
  preview?: ParsePreview;
  error?: string;
}
