import OpenAI from 'openai';
import { ProfileData, AnalysisResult, CategoryScore } from '@/types/analysis';
import { criteria, getGradeFromScore } from './criteria';

const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    'X-Title': 'Insight Architect - LinkedIn Profile Evaluator',
  },
});

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000;

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchWithRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = MAX_RETRIES
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      const errorMessage = lastError.message.toLowerCase();
      
      const isRetryable = 
        errorMessage.includes('429') ||
        errorMessage.includes('rate_limit') ||
        errorMessage.includes('503') ||
        errorMessage.includes('502') ||
        errorMessage.includes('504') ||
        errorMessage.includes('timeout') ||
        errorMessage.includes('network') ||
        errorMessage.includes('ECONNREFUSED');
      
      if (!isRetryable || attempt === maxRetries) {
        throw lastError;
      }
      
      const delay = BASE_DELAY_MS * Math.pow(2, attempt);
      console.log(`Attempt ${attempt + 1} failed. Retrying in ${delay}ms...`);
      await sleep(delay);
    }
  }
  
  throw lastError || new Error('Max retries exceeded');
}

interface LLMAnalysisResponse {
  totalScore: number;
  grade: 'All-Star' | 'Advanced' | 'Intermediate' | 'Basic' | 'Beginner';
  categories: {
    id: string;
    score: number;
    feedback: string;
  }[];
  topRecommendations: string[];
}

function buildAnalysisPrompt(profileData: ProfileData): string {
  const categoriesContext = criteria.map(c => `
${c.nameEn} (${c.weight}%):
- Description: ${c.description}
`).join('\n');

  const experiences = profileData.experiences || [];
  const education = profileData.education || [];
  const skills = profileData.skills || [];
  const certifications = profileData.certifications || [];
  const featured = profileData.featured || [];
  const languages = profileData.languages || [];
  const projects = profileData.projects || [];
  const recentActivity = profileData.recentActivity || { lastPostDaysAgo: null, postsThisMonth: 0 };

  const profileSummary = `
Profile Data:
- Name: ${profileData.name || 'N/A'}
- Headline: ${profileData.headline || 'N/A'}
- Location: ${profileData.location || 'N/A'}
- About: ${profileData.about || 'Not provided'}
- Has Photo: ${profileData.photoUrl ? 'Yes' : 'No'}
- Has Banner: ${profileData.bannerUrl ? 'Yes' : 'No'}
- Custom URL: ${profileData.customUrl ? 'Yes' : 'No'}

Experiences (${experiences.length}):
${experiences.length > 0 ? experiences.map(e => `- ${e.title} at ${e.company} (${e.period})
  ${e.description || 'No description'}`).join('\n') : 'None'}

Education (${education.length}):
${education.length > 0 ? education.map(e => `- ${e.degree} at ${e.institution} (${e.period})`).join('\n') : 'None'}

Skills (${skills.length}):
${skills.length > 0 ? skills.join(', ') : 'None listed'}

Recommendations: ${profileData.recommendationsReceived || 0} received, ${profileData.recommendationsGiven || 0} given

Certifications (${certifications.length}):
${certifications.length > 0 ? certifications.map(c => `- ${c.name} (${c.issuer})`).join('\n') : 'None'}

Featured Items: ${featured.length}
Languages: ${languages.length > 0 ? languages.map(l => `${l.name} (${l.proficiency})`).join(', ') : 'Not specified'}
Volunteering: ${profileData.volunteering || 'Not specified'}
Projects: ${projects.length > 0 ? projects.join(', ') : 'None'}

Recent Activity:
- Last post: ${recentActivity.lastPostDaysAgo ? `${recentActivity.lastPostDaysAgo} days ago` : 'Unknown'}
- Posts this month: ${recentActivity.postsThisMonth}
`;

  return `You are an expert LinkedIn profile evaluator. Analyze the following profile and provide a detailed evaluation.

Evaluation Categories (with weights):
${categoriesContext}

${profileSummary}

Analyze the profile following these rules:
1. Score each category 0-100 based on how well the profile meets the criteria
2. The final score is the weighted average of all categories
3. Provide specific, actionable feedback for each category
4. Generate 3-5 prioritized recommendations based on the biggest gaps

Return a JSON object with this exact structure:
{
  "totalScore": number (0-100),
  "grade": "All-Star" | "Advanced" | "Intermediate" | "Basic" | "Beginner",
  "categories": [
    {
      "id": "photo-banner" | "headline" | "about" | "experience" | "education" | "skills" | "recommendations" | "certifications" | "activity" | "complementary",
      "score": number (0-100),
      "feedback": "specific feedback in Portuguese (Brazil)"
    }
  ],
  "topRecommendations": ["recommendation 1 in Portuguese", "recommendation 2", ...] (3-5 items, most impactful first)
}

Grade thresholds:
- All-Star: 90-100
- Advanced: 75-89
- Intermediate: 60-74
- Basic: 40-59
- Beginner: 0-39

Important:
- Scores must be realistic and based on actual content quality
- Feedback should be constructive and specific
- Recommendations should address the biggest gaps with highest impact`;
}

function parseLLMResponse(content: string): LLMAnalysisResponse | null {
  try {
    let jsonStr = content.trim();
    
    const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1];
    }
    
    jsonStr = jsonStr.replace(/^[^{]*/, '').replace(/[^}]*$/, '');
    
    const parsed = JSON.parse(jsonStr);
    
    if (typeof parsed.totalScore !== 'number' || 
        !Array.isArray(parsed.categories) || 
        !Array.isArray(parsed.topRecommendations)) {
      return null;
    }

    return {
      totalScore: Math.round(parsed.totalScore),
      grade: ['All-Star', 'Advanced', 'Intermediate', 'Basic', 'Beginner'].includes(parsed.grade) 
        ? parsed.grade 
        : getGradeFromScore(parsed.totalScore),
      categories: parsed.categories.filter((c: { id: string; score: number; feedback: string }) => 
        criteria.some(cr => cr.id === c.id)
      ),
      topRecommendations: parsed.topRecommendations.slice(0, 5),
    };
  } catch (error) {
    console.error('Error parsing LLM response:', error);
    return null;
  }
}

export async function analyzeProfile(profileData: ProfileData): Promise<AnalysisResult> {
  const prompt = buildAnalysisPrompt(profileData);

  const callLLM = async () => {
    const completion = await openai.chat.completions.create({
      model: 'openai/gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert LinkedIn profile evaluator with deep knowledge of professional branding, SEO, and career development.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0,
      max_tokens: 2000,
    });

    const responseContent = completion.choices[0]?.message?.content || '';
    
    if (!responseContent) {
      throw new Error('Empty response from OpenRouter');
    }

    const analysis = parseLLMResponse(responseContent);
    
    if (!analysis) {
      throw new Error('Falha ao processar resposta da análise. Tente novamente.');
    }

    return analysis;
  };

  const analysis = await fetchWithRetry(callLLM);

  const categories: CategoryScore[] = criteria.map(criterion => {
    const llmCategory = analysis.categories.find(c => c.id === criterion.id);
    
    return {
      name: criterion.name,
      id: criterion.id,
      score: llmCategory?.score ?? 0,
      maxScore: criterion.maxScore,
      weight: criterion.weight,
      feedback: llmCategory?.feedback || 'Não foi possível avaliar esta categoria.',
    };
  });

  return {
    profileData,
    profilePhoto: null,
    totalScore: analysis.totalScore,
    grade: analysis.grade,
    categories,
    topRecommendations: analysis.topRecommendations,
    analyzedAt: new Date().toISOString(),
  };
}
