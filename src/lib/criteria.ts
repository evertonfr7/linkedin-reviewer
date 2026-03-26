export interface Criterion {
  id: string;
  name: string;
  nameEn: string;
  weight: number;
  maxScore: number;
  description: string;
  subCriteria: SubCriterion[];
}

export interface SubCriterion {
  id: string;
  name: string;
  points: number;
  description: string;
}

export const criteria: Criterion[] = [
  {
    id: 'photo-banner',
    name: 'Foto e Banner',
    nameEn: 'Photo & Banner',
    weight: 8,
    maxScore: 8,
    description: 'Primeira impressão visual; afeta taxa de cliques no perfil',
    subCriteria: [
      {
        id: 'profile-photo-presence',
        name: 'Presença da foto',
        points: 1,
        description: 'Perfis com foto recebem 21x mais visualizações',
      },
      {
        id: 'profile-photo-quality',
        name: 'Qualidade técnica',
        points: 1.5,
        description: 'Resolução mínima 400×400px, boa iluminação, sem ruído',
      },
      {
        id: 'profile-photo-framing',
        name: 'Enquadramento profissional',
        points: 1.5,
        description: 'Rosto ocupa 60-70% do frame, fundo limpo',
      },
      {
        id: 'profile-photo-expression',
        name: 'Expressão e acessibilidade',
        points: 1,
        description: 'Sorriso natural, contato visual, expressão acolhedora',
      },
      {
        id: 'banner-presence',
        name: 'Presença do banner',
        points: 0.5,
        description: 'Ter qualquer banner já demonstra cuidado mínimo',
      },
      {
        id: 'banner-relevance',
        name: 'Relevância contextual',
        points: 1,
        description: 'O banner reforça área de atuação ou marca pessoal',
      },
      {
        id: 'banner-quality',
        name: 'Qualidade visual',
        points: 1,
        description: 'Dimensões corretas (1584×396px), sem distorção',
      },
      {
        id: 'banner-branding',
        name: 'Branding e identidade',
        points: 0.5,
        description: 'Uso de cores e identidade visual alinhada',
      },
    ],
  },
  {
    id: 'headline',
    name: 'Headline/Título',
    nameEn: 'Headline',
    weight: 12,
    maxScore: 12,
    description: 'Elemento mais visível nas buscas; define posicionamento',
    subCriteria: [
      {
        id: 'headline-not-standard',
        name: 'Não usa formato padrão',
        points: 1,
        description: 'Penalidade se for apenas "Cargo at Empresa"',
      },
      {
        id: 'headline-value-proposition',
        name: 'Proposta de valor',
        points: 3,
        description: 'Comunica claramente o que faz e para quem',
      },
      {
        id: 'headline-seo',
        name: 'Palavras-chave estratégicas',
        points: 3,
        description: 'Termos que recrutadores e prospects buscam',
      },
      {
        id: 'headline-clarity',
        name: 'Clareza e legibilidade',
        points: 2,
        description: 'Linguagem direta, sem jargões excessivos',
      },
      {
        id: 'headline-differentiation',
        name: 'Diferenciação',
        points: 2,
        description: 'Se destaca de headlines genéricas do setor',
      },
      {
        id: 'headline-length',
        name: 'Extensão adequada',
        points: 1,
        description: 'Usa bem os 220 caracteres disponíveis',
      },
    ],
  },
  {
    id: 'about',
    name: 'Resumo/About',
    nameEn: 'About',
    weight: 14,
    maxScore: 14,
    description: 'Principal espaço de narrativa e conversão',
    subCriteria: [
      {
        id: 'about-presence',
        name: 'Presença e extensão',
        points: 1,
        description: 'Campo preenchido com mínimo de 300 caracteres',
      },
      {
        id: 'about-hook',
        name: 'Gancho nas 3 primeiras linhas',
        points: 2.5,
        description: 'Primeiras linhas geram curiosidade',
      },
      {
        id: 'about-storytelling',
        name: 'Narrativa e storytelling',
        points: 2.5,
        description: 'Conta história coerente sobre trajetória',
      },
      {
        id: 'about-value-proposition',
        name: 'Proposta de valor clara',
        points: 2,
        description: 'Explicita o que oferece e qual transformação entrega',
      },
      {
        id: 'about-metrics',
        name: 'Resultados e métricas',
        points: 2,
        description: 'Inclui números, conquistas mensuráveis',
      },
      {
        id: 'about-seo',
        name: 'Palavras-chave para SEO',
        points: 2,
        description: 'Termos relevantes distribuídos naturalmente',
      },
      {
        id: 'about-cta',
        name: 'Call-to-action',
        points: 1,
        description: 'Termina com convite para ação',
      },
      {
        id: 'about-tone',
        name: 'Tom e voz adequados',
        points: 1,
        description: 'Alinhado ao setor e uso de primeira pessoa',
      },
    ],
  },
  {
    id: 'experience',
    name: 'Experiência Profissional',
    nameEn: 'Work Experience',
    weight: 18,
    maxScore: 18,
    description: 'Maior peso — prova concreta de trajetória e resultados',
    subCriteria: [
      {
        id: 'exp-number',
        name: 'Número de experiências',
        points: 1,
        description: 'Mínimo 2 experiências relevantes',
      },
      {
        id: 'exp-current-filled',
        name: 'Cargo atual preenchido',
        points: 1,
        description: 'Ter posição atual é crítico para buscas',
      },
      {
        id: 'exp-dates-correct',
        name: 'Datas corretas',
        points: 1,
        description: 'Períodos sem gaps inexplicados',
      },
      {
        id: 'exp-logo-visible',
        name: 'Logo da empresa visível',
        points: 1,
        description: 'Empresa com Company Page vinculada',
      },
      {
        id: 'exp-location-filled',
        name: 'Localização preenchida',
        points: 0.5,
        description: 'Ajuda no filtro geográfico',
      },
      {
        id: 'exp-employment-type',
        name: 'Tipo de emprego especificado',
        points: 0.5,
        description: 'Full-time, freelance, contrato',
      },
      {
        id: 'exp-descriptions-present',
        name: 'Descrições presentes',
        points: 2,
        description: 'Cada experiência tem descrição',
      },
      {
        id: 'exp-achievements-focus',
        name: 'Foco em realizações',
        points: 3,
        description: 'Usa padrão "Realizei X que resultou em Y"',
      },
      {
        id: 'exp-metrics',
        name: 'Métricas e resultados',
        points: 3,
        description: 'Números concretos: redução X%, aumento Y%',
      },
      {
        id: 'exp-media',
        name: 'Uso de mídia',
        points: 1.5,
        description: 'Anexou materiais de suporte',
      },
      {
        id: 'exp-keywords',
        name: 'Palavras-chave da função',
        points: 1.5,
        description: 'Termos que recrutadores buscam',
      },
      {
        id: 'exp-progression',
        name: 'Progressão de carreira',
        points: 1,
        description: 'Demonstra crescimento e promoções',
      },
    ],
  },
  {
    id: 'education',
    name: 'Formação Acadêmica',
    nameEn: 'Education',
    weight: 6,
    maxScore: 6,
    description: 'Relevante, mas complementar à experiência',
    subCriteria: [
      {
        id: 'edu-main-present',
        name: 'Formação principal',
        points: 1.5,
        description: 'Graduação ou formação mais alta listada',
      },
      {
        id: 'edu-institution-logo',
        name: 'Instituição com logo',
        points: 0.5,
        description: 'Vinculada à página oficial',
      },
      {
        id: 'edu-period-correct',
        name: 'Período correto',
        points: 0.5,
        description: 'Ano de início e conclusão',
      },
      {
        id: 'edu-description',
        name: 'Descrição com atividades',
        points: 1.5,
        description: 'Projetos, TCC, atividades relevantes',
      },
      {
        id: 'edu-complementary',
        name: 'Formações complementares',
        points: 1,
        description: 'MBAs, pós-graduações',
      },
      {
        id: 'edu-alignment',
        name: 'Alinhamento com área',
        points: 1,
        description: 'Faz sentido com trajetória profissional',
      },
    ],
  },
  {
    id: 'skills',
    name: 'Competências e Endorsements',
    nameEn: 'Skills & Endorsements',
    weight: 8,
    maxScore: 8,
    description: 'Validação social + palavras-chave para SEO',
    subCriteria: [
      {
        id: 'skills-number',
        name: 'Número de competências',
        points: 1,
        description: 'Mínimo 5, ideal 15-25 skills relevantes',
      },
      {
        id: 'skills-pinned',
        name: 'Top 3 skills pinadas',
        points: 1.5,
        description: '3 competências fixadas refletem posicionamento',
      },
      {
        id: 'skills-relevance',
        name: 'Relevância das skills',
        points: 2,
        description: 'Skills de fato relevantes para a área',
      },
      {
        id: 'skills-endorsements-volume',
        name: 'Volume de endorsements',
        points: 1.5,
        description: 'Top 3 com 10+ endorsements cada',
      },
      {
        id: 'skills-endorsements-quality',
        name: 'Endorsements de pessoas relevantes',
        points: 1,
        description: 'Validações de colegas e gestores',
      },
      {
        id: 'skills-assessments',
        name: 'Skill Assessment Badges',
        points: 1,
        description: 'Testes de avaliação do LinkedIn',
      },
    ],
  },
  {
    id: 'recommendations',
    name: 'Recomendações',
    nameEn: 'Recommendations',
    weight: 10,
    maxScore: 10,
    description: 'Prova social de terceiros — alto valor de confiança',
    subCriteria: [
      {
        id: 'rec-number',
        name: 'Número de recomendações',
        points: 2,
        description: '0=0pts, 1-2=0.5, 3-4=1, 5+=2',
      },
      {
        id: 'rec-diversity',
        name: 'Diversidade de fontes',
        points: 2,
        description: 'De diferentes contextos: gestores, pares, clientes',
      },
      {
        id: 'rec-quality',
        name: 'Qualidade do conteúdo',
        points: 2.5,
        description: 'Detalhadas e específicas, não genéricas',
      },
      {
        id: 'rec-recency',
        name: 'Recência',
        points: 1.5,
        description: 'Pelo menos 1 nos últimos 12 meses',
      },
      {
        id: 'rec-relevance',
        name: 'Relevância dos recomendadores',
        points: 1,
        description: 'Profissionais reconhecidos no mercado',
      },
      {
        id: 'rec-given',
        name: 'Recomendações dadas',
        points: 1,
        description: 'Demonstra generosidade profissional',
      },
    ],
  },
  {
    id: 'certifications',
    name: 'Certificações e Cursos',
    nameEn: 'Certifications',
    weight: 6,
    maxScore: 6,
    description: 'Demonstra aprendizado contínuo',
    subCriteria: [
      {
        id: 'cert-presence',
        name: 'Presença de certificações',
        points: 1,
        description: 'Pelo menos 1 certificação listada',
      },
      {
        id: 'cert-relevance',
        name: 'Relevância para a área',
        points: 2,
        description: 'Certificações reconhecidas no mercado',
      },
      {
        id: 'cert-recency',
        name: 'Recência e atualização',
        points: 1.5,
        description: 'Obtidas nos últimos 2 anos',
      },
      {
        id: 'cert-verifiable',
        name: 'Credencial verificável',
        points: 1,
        description: 'Link de verificação ou credential ID',
      },
      {
        id: 'cert-volume',
        name: 'Volume adequado',
        points: 0.5,
        description: '3-8 certificações relevantes',
      },
    ],
  },
  {
    id: 'activity',
    name: 'Atividade e Engajamento',
    nameEn: 'Activity & Engagement',
    weight: 10,
    maxScore: 10,
    description: 'Sinal de presença ativa e autoridade',
    subCriteria: [
      {
        id: 'act-frequency',
        name: 'Frequência de publicações',
        points: 2,
        description: '0 posts=0pts, 1-2/mês=1, 1/semana=1.5, 2+/semana=2',
      },
      {
        id: 'act-quality',
        name: 'Qualidade do conteúdo',
        points: 2.5,
        description: 'Insights originais, dados, experiências reais',
      },
      {
        id: 'act-engagement',
        name: 'Engajamento recebido',
        points: 1.5,
        description: 'Média de curtidas e comentários',
      },
      {
        id: 'act-interaction',
        name: 'Interação com outros',
        points: 1.5,
        description: 'Comenta de forma substancial',
      },
      {
        id: 'act-consistency',
        name: 'Consistência temática',
        points: 1.5,
        description: 'Posts reforçam o posicionamento',
      },
      {
        id: 'act-formats',
        name: 'Uso de formatos diversos',
        points: 1,
        description: 'Alterna texto, carrossel, vídeo, artigos',
      },
    ],
  },
  {
    id: 'complementary',
    name: 'Elementos Complementares',
    nameEn: 'Additional Elements',
    weight: 8,
    maxScore: 8,
    description: 'URL, idiomas, projetos, voluntariado, Featured',
    subCriteria: [
      {
        id: 'comp-url-custom',
        name: 'URL customizada',
        points: 0.5,
        description: 'Mudou de linkedin.com/in/joao-silva-a1b2c3',
      },
      {
        id: 'comp-url-clean',
        name: 'URL clean e profissional',
        points: 0.5,
        description: 'Sem números aleatórios',
      },
      {
        id: 'comp-featured-present',
        name: 'Presença de destaques',
        points: 0.5,
        description: 'Pelo menos 1 item na seção Featured',
      },
      {
        id: 'comp-featured-relevance',
        name: 'Relevância e impacto',
        points: 1,
        description: 'Artigos, portfolios, cases',
      },
      {
        id: 'comp-featured-variety',
        name: 'Variedade e atualidade',
        points: 0.5,
        description: 'Mix de formatos e conteúdo recente',
      },
      {
        id: 'comp-languages',
        name: 'Idiomas listados',
        points: 0.5,
        description: 'Pelo menos 1 idioma além do nativo',
      },
      {
        id: 'comp-languages-level',
        name: 'Nível de proficiência',
        points: 0.5,
        description: 'Indica fluência de forma honesta',
      },
      {
        id: 'comp-volunteering',
        name: 'Trabalho voluntário',
        points: 0.5,
        description: 'Pelo menos 1 experiência listada',
      },
      {
        id: 'comp-volunteering-impact',
        name: 'Descrição com impacto',
        points: 0.5,
        description: 'Descreve contribuição e resultados',
      },
      {
        id: 'comp-projects',
        name: 'Projetos listados',
        points: 0.5,
        description: 'Projetos pessoais, open source',
      },
      {
        id: 'comp-publications',
        name: 'Publicações',
        points: 0.5,
        description: 'Artigos publicados',
      },
      {
        id: 'comp-links',
        name: 'Links e evidências',
        points: 0.5,
        description: 'Cada item tem link funcional',
      },
      {
        id: 'comp-connections-volume',
        name: 'Volume de rede',
        points: 0.5,
        description: 'Menos de 100=fraco, 100-500=básico, 500+=bom',
      },
      {
        id: 'comp-connections-badge',
        name: 'Exibe "500+"',
        points: 1,
        description: 'Marca de credibilidade social',
      },
    ],
  },
];

export const gradeThresholds = {
  'All-Star': { min: 90, max: 100 },
  Advanced: { min: 75, max: 89 },
  Intermediate: { min: 60, max: 74 },
  Basic: { min: 40, max: 59 },
  Beginner: { min: 0, max: 39 },
};

export function getGradeFromScore(score: number): string {
  if (score >= 90) return 'All-Star';
  if (score >= 75) return 'Advanced';
  if (score >= 60) return 'Intermediate';
  if (score >= 40) return 'Basic';
  return 'Beginner';
}

export function getGradeColor(grade: string): {
  bg: string;
  text: string;
  border: string;
} {
  switch (grade) {
    case 'All-Star':
      return { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-400' };
    case 'Advanced':
      return { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-400' };
    case 'Intermediate':
      return { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-400' };
    case 'Basic':
      return { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-400' };
    default:
      return { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-400' };
  }
}
