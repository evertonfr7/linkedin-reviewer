import { chromium, Browser, Page, BrowserContext } from 'playwright';
import { ProfileData } from '@/types/analysis';

const LINKEDIN_URL_REGEX = /^https?:\/\/(www\.)?linkedin\.com\/in\/[\w-]+\/?$/;

export function isValidLinkedInUrl(url: string): boolean {
  return LINKEDIN_URL_REGEX.test(url);
}

export interface ScrapeResult {
  success: boolean;
  data?: ProfileData;
  error?: string;
  blocked?: boolean;
  isPrivate?: boolean;
  debugInfo?: {
    bodyTextLength?: number;
    h1Text?: string;
    url?: string;
  };
}

const USER_AGENTS = [
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
];

const VIEWPORTS = [
  { width: 1920, height: 1080 },
  { width: 1366, height: 768 },
  { width: 1440, height: 900 },
  { width: 1536, height: 864 },
  { width: 1680, height: 1050 },
];

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function applyStealth(page: Page): Promise<void> {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', {
      get: () => false,
    });

    Object.defineProperty(navigator, 'plugins', {
      get: () => [1, 2, 3, 4, 5],
    });

    Object.defineProperty(navigator, 'languages', {
      get: () => ['en-US', 'en', 'pt-BR'],
    });

    (window as { chrome?: { runtime?: Record<string, unknown> } }).chrome = { runtime: {} };

    const getParameter = WebGLRenderingContext.prototype.getParameter;
    WebGLRenderingContext.prototype.getParameter = function(parameter: number) {
      if (parameter === 37445) {
        return 'Intel Inc.';
      }
      if (parameter === 37446) {
        return 'Intel Iris OpenGL Engine';
      }
      return getParameter.call(this, parameter);
    };
  });
}

async function humanDelay(min: number = 1000, max: number = 3000): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, randomBetween(min, max)));
}

async function humanScroll(page: Page, pixels: number = 300): Promise<void> {
  await page.evaluate((scrollAmount) => {
    window.scrollBy(0, scrollAmount);
  }, pixels);
  await humanDelay(300, 800);
}

async function humanMouseMove(page: Page): Promise<void> {
  const startX = randomBetween(100, 800);
  const startY = randomBetween(100, 600);
  const endX = startX + randomBetween(-100, 100);
  const endY = startY + randomBetween(-50, 50);
  
  await page.mouse.move(startX, startY);
  await page.waitForTimeout(100);
  await page.mouse.move(endX, endY);
}

async function getBrowser(): Promise<Browser> {
  return chromium.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--disable-web-security',
      '--disable-features=IsolateOrigins,site-per-process',
      '--allow-running-insecure-content',
      '--disable-blink-features=AutomationControlled',
      '--disable-extensions',
      '--no-first-run',
      '--no-default-browser-check',
      '--mute-audio',
      '--disable-speech-api',
      '--disable-background-networking',
      '--disable-background-timer-throttling',
      '--disable-backgrounding-occluded-windows',
      '--disable-breakpad',
      '--disable-component-extensions-with-background-pages',
      '--disable-default-apps',
      '--disable-hang-monitor',
      '--disable-ipc-flooding-protection',
      '--disable-renderer-backgrounding',
      '--disable-sync',
      '--enable-features=NetworkService,NetworkServiceInProcess',
      '--force-color-profile=srgb',
      '--metrics-recording-only',
      '--optimize-data-for-local-storage',
      '--no-zygote',
    ],
  });
}

async function createStealthContext(browser: Browser): Promise<BrowserContext> {
  const context = await browser.newContext({
    userAgent: getRandomItem(USER_AGENTS),
    viewport: getRandomItem(VIEWPORTS),
    locale: 'en-US,en;q=0.9',
    timezoneId: 'America/Sao_Paulo',
    geolocation: { latitude: -23.5505, longitude: -46.6333 },
    permissions: ['geolocation'],
    extraHTTPHeaders: {
      'Accept-Language': 'en-US,en;q=0.9,pt-BR;q=0.8,pt;q=0.7',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-User': '?1',
      'Cache-Control': 'max-age=0',
      'DNT': '1',
    },
  });

  return context;
}

interface BlockingDetection {
  isBlocked: boolean;
  isPrivate: boolean;
  reason: string;
  debugInfo: {
    bodyTextLength: number;
    h1Text: string;
    hasLoginForm: boolean;
  };
}

async function detectBlocking(page: Page): Promise<BlockingDetection> {
  const debugInfo = {
    bodyTextLength: 0,
    h1Text: '',
    hasLoginForm: false,
  };

  const pageContent = await page.content();
  const url = page.url();

  const blockingIndicators = [
    { pattern: /login|signin|sign-in/i, isPrivate: true, reason: 'Login required' },
    { pattern: /profile-private|private profile|sign up/i, isPrivate: true, reason: 'Private profile' },
    { pattern: /captcha|robot|unusual activity/i, isPrivate: false, reason: 'CAPTCHA or bot detection' },
    { pattern: /challenge|verification|verify your identity/i, isPrivate: false, reason: 'Verification required' },
    { pattern: /blocked|suspicious activity|restricted/i, isPrivate: false, reason: 'Access restricted' },
    { pattern: /403|forbidden|access denied/i, isPrivate: false, reason: 'Access denied' },
    { pattern: /rate.?limit|too.?many requests/i, isPrivate: false, reason: 'Rate limit exceeded' },
  ];

  for (const indicator of blockingIndicators) {
    if (indicator.pattern.test(pageContent) || indicator.pattern.test(url)) {
      console.log(`[DEBUG] Blocking detected: ${indicator.reason}`);
      return { 
        isBlocked: true, 
        isPrivate: indicator.isPrivate, 
        reason: indicator.reason,
        debugInfo 
      };
    }
  }

  const loginInput = await page.locator(
    'input[autocomplete="username"], input[name="session_key"], input#ap_email'
  ).count();
  debugInfo.hasLoginForm = loginInput > 0;
  
  if (loginInput > 0) {
    console.log('[DEBUG] Login form detected');
    return { 
      isBlocked: true, 
      isPrivate: true, 
      reason: 'Login form detected',
      debugInfo 
    };
  }

  const h1Text = await page.locator('h1').first().textContent().catch(() => '') || '';
  debugInfo.h1Text = h1Text;
  
  const bodyText = await page.locator('body').textContent().catch(() => '') || '';
  debugInfo.bodyTextLength = bodyText.length;

  console.log(`[DEBUG] H1: "${h1Text}" (length: ${h1Text.length})`);
  console.log(`[DEBUG] Body text length: ${bodyText.length}`);

  if (!h1Text || h1Text.length < 3) {
    console.log('[DEBUG] No H1 found or H1 too short');
    return { 
      isBlocked: true, 
      isPrivate: false, 
      reason: 'Profile content not found',
      debugInfo 
    };
  }

  console.log('[DEBUG] No blocking detected');
  return { 
    isBlocked: false, 
    isPrivate: false, 
    reason: '',
    debugInfo 
  };
}

async function waitForProfileContent(page: Page, timeout: number = 20000): Promise<boolean> {
  console.log('[DEBUG] Waiting for profile content to load...');
  
  const selectors = [
    '.pv-top-card',
    '.profile-top-card',
    '[data-section-name="about"]',
    'section.pv-about-section',
    '.pv-experience-section',
    '.pv-profile-section',
  ];

  const startTime = Date.now();
  
  for (const selector of selectors) {
    try {
      const count = await page.locator(selector).count();
      if (count > 0) {
        console.log(`[DEBUG] Found selector: ${selector}`);
        return true;
      }
    } catch {}
  }

  while (Date.now() - startTime < timeout) {
    for (const selector of selectors) {
      try {
        const count = await page.locator(selector).count();
        if (count > 0) {
          console.log(`[DEBUG] Found selector after wait: ${selector}`);
          return true;
        }
      } catch {}
    }
    await page.waitForTimeout(500);
  }

  console.log('[DEBUG] Timeout waiting for profile content');
  return false;
}

async function scrapeDesktopProfile(page: Page, url: string): Promise<ScrapeResult> {
  await humanDelay(500, 1500);
  
  console.log('[DEBUG] Navigating to:', url);
  
  try {
    await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });
    console.log('[DEBUG] Page loaded (domcontentloaded)');
  } catch (error) {
    console.log('[DEBUG] Navigation error:', error instanceof Error ? error.message : 'Unknown');
  }

  await humanDelay(1000, 2000);

  await waitForProfileContent(page, 15000);

  await humanDelay(500, 1000);

  if (Math.random() > 0.5) {
    await humanMouseMove(page);
  }

  const blocking = await detectBlocking(page);
  
  if (blocking.isBlocked) {
    console.log('[DEBUG] Blocking detected:', blocking.reason);
    return {
      success: false,
      blocked: true,
      isPrivate: blocking.isPrivate,
      error: blocking.isPrivate 
        ? 'Perfil privado detectado. Use a opção de colar o texto do perfil.'
        : `${blocking.reason}. Tente novamente em alguns minutos ou use o Self-Assessment.`,
      debugInfo: {
        bodyTextLength: blocking.debugInfo.bodyTextLength,
        h1Text: blocking.debugInfo.h1Text,
        url: url,
      },
    };
  }

  const data: Partial<ProfileData> = {
    url,
    name: null,
    headline: null,
    photoUrl: null,
    bannerUrl: null,
    about: null,
    experiences: [],
    education: [],
    skills: [],
    endorsementsCount: 0,
    recommendationsReceived: 0,
    recommendationsGiven: 0,
    certifications: [],
    customUrl: false,
    connectionsCount: null,
    recentActivity: { lastPostDaysAgo: null, postsThisMonth: 0 },
    featured: [],
    languages: [],
    volunteering: null,
    projects: [],
    location: null,
  };

  const nameSelectors = [
    '.pv-top-card .pv-top-card--list li:first-child',
    '.profile-info-card__name',
    '.profile-top-card__name',
    '.profile-top-card .pv-top-card-section__name',
    'section.artdeco-card h1',
    '.core-entity-lockup__title',
    '.display-name',
    '.pv-top-card-section__name',
    'h1',
  ];
  
  for (const selector of nameSelectors) {
    const el = page.locator(selector).first();
    if (await el.count() > 0) {
      data.name = (await el.textContent())?.trim() || null;
      if (data.name && data.name.length > 2) {
        console.log(`[DEBUG] Found name with selector ${selector}: "${data.name}"`);
        break;
      }
    }
  }

  const headlineSelectors = [
    '.pv-top-card .pv-top-card--list li:nth-child(2)',
    '.profile-top-card__headline',
    '.pv-top-card__headline',
    '.artdeco-card .t-18',
    '.core-entity-lockup__subtitle',
    '.pv-top-card-section__headline',
  ];
  
  for (const selector of headlineSelectors) {
    const el = page.locator(selector).first();
    if (await el.count() > 0) {
      data.headline = (await el.textContent())?.trim() || null;
      if (data.headline) {
        console.log(`[DEBUG] Found headline with selector ${selector}: "${data.headline}"`);
        break;
      }
    }
  }

  const photoSelectors = [
    '.pv-top-card-profile-picture img',
    '.profile-photo-edit img',
    '.pv-top-card .profile-photo-edit__preview img',
    '.presence-entity__image',
    '.profile-photo-edit__preview img',
    'img.profile-photo',
  ];
  
  for (const selector of photoSelectors) {
    const el = page.locator(selector).first();
    if (await el.count() > 0) {
      data.photoUrl = (await el.getAttribute('src')) || null;
      if (data.photoUrl && !data.photoUrl.includes('data:image')) {
        console.log(`[DEBUG] Found photo with selector ${selector}`);
        break;
      }
    }
  }

  const locationSelectors = [
    '.pv-top-card .pv-top-card--list li:nth-child(3)',
    '.profile-top-card__location',
    '.pv-top-card__location',
    '.pv-top-card-section__location',
  ];
  
  for (const selector of locationSelectors) {
    const el = page.locator(selector).first();
    if (await el.count() > 0) {
      data.location = (await el.textContent())?.trim() || null;
      if (data.location) break;
    }
  }

  await humanScroll(page, randomBetween(500, 1000));
  await humanDelay(500, 1000);
  
  const aboutSelectors = [
    '#about ~ div',
    '[data-section-name="about"]',
    '.pv-about-section',
    '.about-section',
    '.pv-shared-text-hero__summary',
    '.pv-about-section .pv-about__summary-text',
    'section.pv-about-section',
  ];
  
  for (const selector of aboutSelectors) {
    const el = page.locator(selector).first();
    if (await el.count() > 0) {
      const text = await el.textContent();
      if (text && text.length > 50) {
        data.about = text.trim();
        console.log(`[DEBUG] Found about with selector ${selector} (${text.length} chars)`);
        break;
      }
    }
  }

  const expSection = page.locator('[data-section-name="experience"], section.pv-experience-section, .pv-experience-section');
  const expItems = await expSection.locator('.pv-entity-list__item, .pv-position-entity, .profile-section-card').all();
  
  for (const item of expItems.slice(0, 10)) {
    const titleEl = item.locator('h3, .pv-entity__summary-title, .t-bold').first();
    const companyEl = item.locator('.pv-entity__secondary-title, .pv-entity__company-summary-info span:first-child, .pv-entity__sub-title').first();
    const periodEl = item.locator('.pv-entity__date-range span:last-child, .pv-position-group-header__duration span:last-child').first();
    const descEl = item.locator('.pv-entity__description, .pv-entity__bullet-item, .pv-entity__summary-text').first();
    
    const title = await titleEl.textContent().catch(() => '');
    const company = await companyEl.textContent().catch(() => '');
    const period = await periodEl.textContent().catch(() => '');
    const description = await descEl.textContent().catch(() => '');
    
    if (title && title.trim().length > 0) {
      data.experiences!.push({
        title: title.trim(),
        company: company?.trim() || '',
        period: period?.trim() || '',
        description: description?.trim() || null,
        logoUrl: null,
      });
    }
  }
  console.log(`[DEBUG] Found ${data.experiences!.length} experiences`);

  const eduSection = page.locator('[data-section-name="education"], section.pv-education-section, .pv-education-section');
  const eduItems = await eduSection.locator('.pv-entity-list__item, .pv-education-entity, .profile-section-card').all();
  
  for (const item of eduItems.slice(0, 5)) {
    const degreeEl = item.locator('.pv-entity__degree-name, .pv-education-entity__degree-name').first();
    const institutionEl = item.locator('.pv-entity__school-name, .pv-education-entity__school-name').first();
    const periodEl = item.locator('.pv-entity__date-range span:last-child').first();
    
    const degree = await degreeEl.textContent().catch(() => '');
    const institution = await institutionEl.textContent().catch(() => '');
    const period = await periodEl.textContent().catch(() => '');
    
    if (institution || degree) {
      data.education!.push({
        degree: degree?.trim() || '',
        institution: institution?.trim() || '',
        period: period?.trim() || '',
        description: null,
      });
    }
  }
  console.log(`[DEBUG] Found ${data.education!.length} education entries`);

  const skillsSection = page.locator('[data-section-name="skills"], section.pv-skills-section, .pv-skills-section');
  const skillItems = await skillsSection.locator('.pv-skill-entity__name-text, .pv-skill-category-entity__skill-name, .pv-skill-entity').all();
  data.skills = (await Promise.all(skillItems.map(async el => el.textContent()))).map(s => s?.trim()).filter(Boolean) as string[];
  console.log(`[DEBUG] Found ${data.skills.length} skills`);

  try {
    const profilePath = new URL(url).pathname;
    data.customUrl = !profilePath.match(/\/in\/[\w-]{20,}\/?$/);
  } catch {}

  console.log('[DEBUG] Scraping successful');
  return {
    success: true,
    data: data as ProfileData,
  };
}

export async function scrapeLinkedInProfile(url: string): Promise<ScrapeResult> {
  if (!isValidLinkedInUrl(url)) {
    return {
      success: false,
      error: 'URL inválida. Forneça uma URL válida de perfil LinkedIn (linkedin.com/in/usuario)',
    };
  }

  let browser: Browser | null = null;

  try {
    browser = await getBrowser();
    const context = await createStealthContext(browser);
    const page = await context.newPage();
    await applyStealth(page);

    console.log(`\n========== SCRAPING START ==========`);
    console.log(`URL: ${url}`);
    
    const desktopResult = await scrapeDesktopProfile(page, url);
    
    console.log(`Result: ${desktopResult.success ? 'SUCCESS' : 'FAILED'}`);
    console.log(`Name found: ${desktopResult.data?.name || 'none'}`);
    console.log(`Headline found: ${desktopResult.data?.headline || 'none'}`);
    console.log(`About length: ${desktopResult.data?.about?.length || 0}`);
    console.log(`Experiences: ${desktopResult.data?.experiences?.length || 0}`);
    console.log(`Education: ${desktopResult.data?.education?.length || 0}`);
    console.log(`Skills: ${desktopResult.data?.skills?.length || 0}`);
    console.log(`=====================================\n`);
    
    await context.close();
    return desktopResult;

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('[DEBUG] Scraping error:', errorMessage);
    
    return {
      success: false,
      error: `Erro ao conectar com LinkedIn: ${errorMessage}`,
    };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

export function parseManualProfileText(text: string): ProfileData {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  
  const data: ProfileData = {
    url: '',
    name: null,
    headline: null,
    photoUrl: null,
    bannerUrl: null,
    about: null,
    experiences: [],
    education: [],
    skills: [],
    endorsementsCount: 0,
    recommendationsReceived: 0,
    recommendationsGiven: 0,
    certifications: [],
    customUrl: false,
    connectionsCount: null,
    recentActivity: { lastPostDaysAgo: null, postsThisMonth: 0 },
    featured: [],
    languages: [],
    volunteering: null,
    projects: [],
    location: null,
  };

  let currentSection = '';
  let currentExperience: Partial<{ title: string; company: string; period: string; description: string }> = {};
  
  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    
    if (lowerLine.includes('sobre') || lowerLine.includes('about') || lowerLine.includes('resumo')) {
      currentSection = 'about';
      continue;
    }
    
    if (lowerLine.includes('experiência') || lowerLine.includes('experience') || lowerLine.includes('trabalho')) {
      if (currentExperience.title && data.experiences.length > 0) {
        data.experiences.push({
          title: currentExperience.title,
          company: currentExperience.company || '',
          period: currentExperience.period || '',
          description: currentExperience.description || null,
          logoUrl: null,
        });
      }
      currentSection = 'experience';
      continue;
    }
    
    if (lowerLine.includes('formação') || lowerLine.includes('education') || lowerLine.includes('acadêmic')) {
      currentSection = 'education';
      continue;
    }
    
    if (lowerLine.includes('skill') || lowerLine.includes('competência') || lowerLine.includes('habilidade')) {
      currentSection = 'skills';
      continue;
    }
    
    if (lowerLine.includes('certificação') || lowerLine.includes('certification') || lowerLine.includes('certificado')) {
      currentSection = 'certification';
      continue;
    }
    
    if (lowerLine.includes('recomendação') || lowerLine.includes('recommendation')) {
      currentSection = 'recommendation';
      continue;
    }

    switch (currentSection) {
      case 'about':
        data.about = data.about 
          ? `${data.about}\n${line}` 
          : line;
        break;
      case 'experience':
        if (!currentExperience.title) {
          currentExperience.title = line;
        } else if (!currentExperience.company) {
          currentExperience.company = line;
        } else if (!currentExperience.period) {
          currentExperience.period = line;
        } else {
          currentExperience.description = currentExperience.description
            ? `${currentExperience.description}\n${line}`
            : line;
        }
        break;
      case 'education':
        if (line.includes('@') || line.includes('Universidade') || line.includes('University') || line.includes('Faculdade') || line.includes('Instituto')) {
          data.education.push({
            degree: currentExperience.title || line,
            institution: line,
            period: currentExperience.period || '',
            description: null,
          });
          currentExperience = {};
        } else if (data.education.length > 0) {
          data.education[data.education.length - 1].degree = line;
        } else {
          currentExperience.title = line;
        }
        break;
      case 'skills':
        data.skills.push(line);
        break;
      case 'certification':
        data.certifications.push({
          name: line,
          issuer: '',
          dateObtained: null,
          hasVerificationLink: false,
        });
        break;
      default:
        if (!data.name && !data.headline) {
          data.name = line;
        } else if (!data.headline) {
          data.headline = line;
        }
    }
  }

  if (currentExperience.title) {
    data.experiences.push({
      title: currentExperience.title,
      company: currentExperience.company || '',
      period: currentExperience.period || '',
      description: currentExperience.description || null,
      logoUrl: null,
    });
  }

  return data;
}
