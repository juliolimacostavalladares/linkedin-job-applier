// Translation strings for home page
export const translations = {
  'pt-BR': {
    navbar: {
      tools: "Ferramentas",
      howItWorks: "Como Funciona",
      forWho: "Para Quem",
      docs: "Documentação",
      login: "Fazer Login",
      earlyAccess: "Acesso Antecipado",
    },
    hero: {
      badge: "O ecossistema definitivo para o LinkedIn",
      titleNormal: "Automatize, crie e turbine seu ",
      titleHighlight: "LinkedIn",
      subtitle: "Três ferramentas integradas em um único ecossistema. Aplique para vagas automaticamente com IA, publique conteúdo profissional e integre via GraphQL.",
      ctaPrimary: "Começar Gratuitamente",
      ctaSecondary: "Ver Documentação",
    },
    features: {
      title: "Uma plataforma, três soluções robustas.",
      subtitle: "Combinamos raspagem inteligente, integração via Apollo GraphQL e modelos multimodais de IA (Gemini) para transformar sua rotina com o LinkedIn.",
      jobApplier: {
        title: "Job Applier",
        desc: "Automação total para busca e candidatura de vagas ('Easy Apply'). IA gera respostas e otimiza o currículo.",
        tags: ["Easy Apply", "Gemini IA", "Automação", "Chrome Extension"],
        visual: {
          jobTitle: "Engenheiro de Software Sênior",
          company: "Google • Easy Apply",
          applied: "Aplicado",
          adjusting: "Ajustando Currículo",
          prompting: "Prompt IA rodando...",
          processing: "Processando",
        }
      },
      publisher: {
        title: "Publisher",
        desc: "Criação de posts profissionais no LinkedIn com IA. Geração de carrosséis em PDF e agendamento inteligente.",
        tags: ["Syntax Highlighting", "Agendamento", "IA"],
        visual: {
          scheduled: "Post agendado para amanhã 09:00",
        }
      },
      docsHub: {
        title: "Documentation Hub",
        desc: "Portal técnico interativo com guias, API Explorer e documentação multilíngue para todas as ferramentas do ecossistema.",
        tags: ["OpenAPI", "GraphQL Docs", "Guias de Onboarding"],
        visual: {
          ref: "API Reference",
          reqExample: "Exemplo de Requisição (GraphQL)",
          copy: "Copiar",
        }
      }
    },
    workflow: {
      title: "O Motor por trás do Job Applier",
      subtitle: "Desenhamos o fluxo perfeito para você nunca mais perder tempo preenchendo formulários repetitivos. Deixe a busca e aplicação no piloto automático.",
      steps: {
        sync: {
          title: "Sincronização Segura",
          desc: "Extensão captura e roteia as credenciais do LinkedIn de ponta a ponta sem armazenar em texto plano."
        },
        search: {
          title: "Busca Inteligente",
          desc: "Backend lista milhares de vagas 'Easy Apply' baseadas no seu perfil e filtros avançados (remoto, sênior, stacks)."
        },
        match: {
          title: "Match & Otimização com IA",
          desc: "Gemini analisa a descrição da vaga e reescreve summaries e respostas customizadas para as perguntas do formulário."
        },
        submit: {
          title: "Automação de Submissão",
          desc: "Preenchimento de campos e envio automático, lidando com paginadores de formulário e validações."
        },
        track: {
          title: "Acompanhamento Dashboard",
          desc: "Visualize todas as candidaturas, status, e métricas de conversão em uma interface unificada."
        }
      },
      log: {
        title: "Live Execution Log",
        l1: "Extensão conectada. Auth token válido.",
        l2: "Fetching vagas: \"React Developer\" (Remote)",
        l2_sub: "↳ Encontradas 142 vagas 'Easy Apply'",
        l3: "Processando Job ID #99281...",
        l3_sub1: "↳ Analisando requisitos com Gemini 3.1 Pro...",
        l3_sub2: "↳ Match Score: 94%. Gerando respostas customizadas.",
        l4: "Submetendo aplicação...",
        l4_sub: "✓ SUCCESS: Aplicação enviada para Google!",
        l5: "Processando Job ID #88432...",
      }
    },
    audiences: {
      title: "O Pacote Completo",
      subtitle: "Nós construímos o LinkedIn Job Explorer pensando em toda a sua jornada profissional na rede.",
      popularBadge: "Mais Popular",
      exploreBtn: "Explorar Solução",
      jobSeekers: {
        title: "Para Quem Procura Emprego",
        f1: "Job Applier automatiza 100% das candidaturas",
        f2: "IA personaliza respostas para cada vaga",
        f3: "Dashboard centralizado do histórico"
      },
      creators: {
        title: "Para Criadores de Conteúdo",
        f1: "Publisher cria posts profissionais com IA",
        f2: "Syntax highlighting nativo para devs",
        f3: "Agendamento inteligente via cloud"
      },
      developers: {
        title: "Para Desenvolvedores",
        f1: "APIs GraphQL totalmente documentadas",
        f2: "Extensibilidade via shared packages",
        f3: "Portal Hub com guias interativos"
      }
    },
    footer: {
      desc: "O ecossistema definitivo para alavancar sua carreira e presença no LinkedIn construído para profissionais que valorizam o tempo.",
      rights: "© 2026 LinkedIn Job Explorer. Todos os direitos reservados.",
      privacy: "Privacidade",
      terms: "Termos",
      links: {
        docs: "Documentação",
        gateway: "Gateway API",
        jobBackend: "Job Backend",
        publisher: "Publicador",
      }
    },
    dashboard: {
      nav: {
        searchPlaceholder: "Pesquisar vagas, credenciais, logs...",
        devMode: "Modo Dev: ATIVO",
        jobs: "Vagas",
        logs: "Logs de Fila",
        publisher: "Publicador"
      },
      syncCenter: {
        title: "Central de Sincronização",
        subtitle: "Status de Autenticação",
        cookieStatus: "Cookie li_at: Sincronizado",
        apiStatus: "API Voyager: Conectado",
        dbStatus: "SQLite DB: Pronto",
        metricsTitle: "Métricas da Sessão",
        appliedCount: "Candidaturas Executadas",
        successRate: "Taxa de Sucesso",
        tokensSaved: "Tokens de IA Economizados",
        searchParams: "Parâmetros de Busca",
        keywords: "Palavras-chave",
        location: "Localização",
        applyMode: "Modo IA"
      },
      feed: {
        title: "Feed de Automação de Vagas",
        runBtn: "Testar Loop de Candidatura",
        solving: "IA Respondendo Questionário...",
        tailoring: "Personalizando Currículo com IA...",
        submitted: "Candidatura Enviada!",
        match: "Match por IA",
        searchBoxText: "Digite uma vaga para buscar...",
        mockJobs: {
          job1: {
            title: "Engenheiro de Software Senior (Next.js)",
            company: "Vercel Inc.",
            q1: "Quantos anos de experiência você tem com React/Next.js?",
            a1: "5 anos de experiência comprovada liderando projetos.",
            q2: "Descreva sua experiência com React Server Components.",
            a2: "Migrei com sucesso sistemas legados para RSCs, reduzindo TTFB em 40%."
          },
          job2: {
            title: "Desenvolvedor Core TypeScript",
            company: "OpenAI",
            q1: "Você tem experiência trabalhando com APIs de LLM?",
            a1: "Sim, implementei integrações com modelos GPT-4 e Gemini."
          },
          job3: {
            title: "Engenheiro Full Stack React & Node",
            company: "Stripe",
            q1: "Qual sua experiência com processamento de filas e BullMQ?",
            a1: "Trabalhei extensivamente com Redis e BullMQ para jobs assíncronos."
          }
        }
      },
      publisher: {
        title: "Engine de Publicações",
        activeQueue: "Fila Ativa: BullMQ",
        btnText: "Gerar Carrossel PDF",
        generating: "Compilando PDF...",
        ready: "Pronto para Agendamento",
        published: "Publicado na Fila",
        carousels: {
          c1: "Guia de Sobrevivência RSC.pdf",
          c2: "Dicas de Tailwind v4.pdf"
        },
        microservices: "Rede de Microsserviços"
      }
    },
    landingPlayground: {
      carousel: {
        title: "Compilador de Carrossel para LinkedIn",
        subtitle: "Gere apresentações PDF prontas para postar. Teste o componente do publicador abaixo:",
        themes: {
          premium: "Dark Premium",
          purple: "Gradiente Roxo",
          yellow: "Amarelo Bold",
          clean: "Clean Startup"
        },
        slides: [
          {
            title: "Como Criar Carrosséis que Convertem no LinkedIn",
            subtitle: "Arraste para o lado para aprender o passo a passo ➔"
          },
          {
            title: "Por que o formato de Carrossel?",
            content: "● Geram 3x mais engajamento que posts comuns\n● Aumentam o tempo de permanência no seu post\n● Facilitam a explicação de conceitos complexos"
          },
          {
            title: "Curtiu o Conteúdo?",
            subtitle: "Siga meu perfil para dicas diárias de tecnologia e liderança!"
          }
        ]
      },
      resume: {
        title: "Otimizador Easy Apply & Currículos por IA",
        subtitle: "Modifique seu currículo sob demanda e responda formulários complexos automaticamente.",
        original: "Currículo Original",
        optimized: "Currículo Otimizado",
        analysis: "Análise de Habilidades",
        skills: {
          s1: "TypeScript (Requisito Chave)",
          s2: "Redis & BullMQ (Fila de Tarefas)",
          s3: "Next.js App Router (Arquitetura)"
        },
        match: "Taxa de Compatibilidade"
      }
    }
  },
  en: {
    navbar: {
      tools: "Tools",
      howItWorks: "How It Works",
      forWho: "For Whom",
      docs: "Documentation",
      login: "Log In",
      earlyAccess: "Early Access",
    },
    hero: {
      badge: "The ultimate ecosystem for LinkedIn",
      titleNormal: "Automate, create, and boost your ",
      titleHighlight: "LinkedIn",
      subtitle: "Three integrated tools in a single ecosystem. Apply for jobs automatically with AI, publish professional content, and integrate via GraphQL.",
      ctaPrimary: "Start Free",
      ctaSecondary: "View Documentation",
    },
    features: {
      title: "One platform, three robust solutions.",
      subtitle: "We combine intelligent scraping, Apollo GraphQL integration, and Gemini multimodal AI models to transform your LinkedIn routine.",
      jobApplier: {
        title: "Job Applier",
        desc: "Total automation for job search and application ('Easy Apply'). AI generates responses and optimizes your resume.",
        tags: ["Easy Apply", "Gemini AI", "Automation", "Chrome Extension"],
        visual: {
          jobTitle: "Senior Software Engineer",
          company: "Google • Easy Apply",
          applied: "Applied",
          adjusting: "Adjusting Resume",
          prompting: "AI prompt running...",
          processing: "Processing",
        }
      },
      publisher: {
        title: "Publisher",
        desc: "AI-powered professional content creation. Build PDF slideshow carousels and schedule posts seamlessly.",
        tags: ["Syntax Highlighting", "Scheduling", "AI"],
        visual: {
          scheduled: "Post scheduled for tomorrow 09:00",
        }
      },
      docsHub: {
        title: "Documentation Hub",
        desc: "Interactive technical portal featuring guides, API Explorer, and multilingual documentation for all submodules.",
        tags: ["OpenAPI", "GraphQL Docs", "Onboarding Guides"],
        visual: {
          ref: "API Reference",
          reqExample: "Request Example (GraphQL)",
          copy: "Copy",
        }
      }
    },
    workflow: {
      title: "The Engine behind Job Applier",
      subtitle: "We designed the perfect flow so you never waste time filling repetitive forms again. Leave job searching and applying on autopilot.",
      steps: {
        sync: {
          title: "Secure Sync",
          desc: "Browser extension captures and routes LinkedIn credentials end-to-end without plaintext storage."
        },
        search: {
          title: "Intelligent Search",
          desc: "Backend queries thousands of active 'Easy Apply' listings matching your target profile, location, and parameters."
        },
        match: {
          title: "AI Tailoring & Optimization",
          desc: "Gemini parses the job description requirements to refine resume summaries and resolve custom form questionnaire inputs."
        },
        submit: {
          title: "Automated Submission",
          desc: "Autofills questionnaires and submits resume packages, managing forms paginations and input rules."
        },
        track: {
          title: "Dashboard Tracking",
          desc: "Track active candidate workflows, status feeds, and automation performance counters in a single interface."
        }
      },
      log: {
        title: "Live Execution Log",
        l1: "Extension connected. Active credentials loaded.",
        l2: "Fetching jobs matching \"React Developer\" (Remote)",
        l2_sub: "↳ Found 142 'Easy Apply' job postings",
        l3: "Processing Job ID #99281...",
        l3_sub1: "↳ Evaluating requirements via Gemini 3.1 Pro...",
        l3_sub2: "↳ Match Score: 94%. Context answers compiled.",
        l4: "Submitting application packet...",
        l4_sub: "✓ SUCCESS: Easy Apply package sent to Google!",
        l5: "Processing Job ID #88432...",
      }
    },
    audiences: {
      title: "The Complete Package",
      subtitle: "We built LinkedIn Job Explorer to support your entire professional networking lifecycle.",
      popularBadge: "Most Popular",
      exploreBtn: "Explore Solution",
      jobSeekers: {
        title: "For Job Seekers",
        f1: "Job Applier automates 100% of Easy Apply forms",
        f2: "AI contextually optimizes answers and resumes",
        f3: "Centralized database tracking candidate history"
      },
      creators: {
        title: "For Content Creators",
        f1: "Publisher builds engaging text & carousels with AI",
        f2: "Native syntax highlighting blocks for tech writers",
        f3: "Smart publishing queue scheduling on the cloud"
      },
      developers: {
        title: "For Developers",
        f1: "Consolidated, fully-documented GraphQL gateway",
        f2: "Modular package sharing and extensible blueprints",
        f3: "Fumadocs onboarding guides and schema files"
      }
    },
    footer: {
      desc: "The ultimate ecosystem to boost your career and LinkedIn presence built for professionals who value their time.",
      rights: "© 2026 LinkedIn Job Explorer. All rights reserved.",
      privacy: "Privacy",
      terms: "Terms",
      links: {
        docs: "Docs",
        gateway: "Gateway API",
        jobBackend: "Job Backend",
        publisher: "Publisher",
      }
    },
    dashboard: {
      nav: {
        searchPlaceholder: "Search jobs, credentials, logs...",
        devMode: "Dev Mode: ACTIVE",
        jobs: "Jobs",
        logs: "Queue Logs",
        publisher: "Publisher"
      },
      syncCenter: {
        title: "Sync Center",
        subtitle: "Authentication Status",
        cookieStatus: "li_at Cookie: Synced",
        apiStatus: "Voyager API: Connected",
        dbStatus: "SQLite DB: Ready",
        metricsTitle: "Session Metrics",
        appliedCount: "Easy Apply Submissions",
        successRate: "Success Rate",
        tokensSaved: "AI Tokens Saved",
        searchParams: "Search Parameters",
        keywords: "Keywords",
        location: "Location",
        applyMode: "AI Mode"
      },
      feed: {
        title: "Job Automation Feed",
        runBtn: "Test Auto-Apply Loop",
        solving: "AI Answering Questionnaire...",
        tailoring: "Tailoring Resume with AI...",
        submitted: "Application Submitted!",
        match: "AI Match Score",
        searchBoxText: "Search for a job to simulate...",
        mockJobs: {
          job1: {
            title: "Senior Software Engineer (Next.js)",
            company: "Vercel Inc.",
            q1: "How many years of experience do you have with React/Next.js?",
            a1: "5 years of proven experience leading frontend projects.",
            q2: "Describe your experience with React Server Components.",
            a2: "Successfully migrated legacy systems to RSCs, improving page load by 40%."
          },
          job2: {
            title: "TypeScript Core Developer",
            company: "OpenAI",
            q1: "Do you have experience working with LLM APIs?",
            a1: "Yes, integrated GPT-4 and Gemini models into production queues."
          },
          job3: {
            title: "Full Stack Engineer (React & Node)",
            company: "Stripe",
            q1: "What is your experience with background workers & BullMQ?",
            a1: "Extensively worked with Redis and BullMQ queues to process async jobs."
          }
        }
      },
      publisher: {
        title: "Publisher Engine",
        activeQueue: "Active Queue: BullMQ",
        btnText: "Generate PDF Carousel",
        generating: "Compiling PDF...",
        ready: "Ready for Queue",
        published: "Published to Queue",
        carousels: {
          c1: "RSC Survival Guide.pdf",
          c2: "Tailwind v4 Tips.pdf"
        },
        microservices: "Microservices Network"
      }
    },
    landingPlayground: {
      carousel: {
        title: "LinkedIn Slide Carousel Compiler",
        subtitle: "Generate print-ready PDF slideshows. Test the publisher component below:",
        themes: {
          premium: "Dark Premium",
          purple: "Gradient Purple",
          yellow: "Bold Yellow",
          clean: "Clean Startup"
        },
        slides: [
          {
            title: "How to Create LinkedIn Carousels that Convert",
            subtitle: "Swipe to learn the step-by-step process ➔"
          },
          {
            title: "Why the Carousel Format?",
            content: "● Generate 3x more engagement than standard posts\n● Increase dwell time on your updates\n● Easily explain complex engineering concepts"
          },
          {
            title: "Enjoyed the Content?",
            subtitle: "Follow my profile for daily tech and leadership tips!"
          }
        ]
      },
      resume: {
        title: "AI Easy Apply & Resume Optimizer",
        subtitle: "Optimize your resume on-demand and auto-answer complex questionnaires.",
        original: "Original Resume",
        optimized: "Optimized Resume",
        analysis: "Skills Match Analysis",
        skills: {
          s1: "TypeScript (Key Requirement)",
          s2: "Redis & BullMQ (Queue System)",
          s3: "Next.js App Router (Architecture)"
        },
        match: "Compatibility Rate"
      }
    }
  }
} as const;

export type Locale = keyof typeof translations;
export const defaultLocale: Locale = 'pt-BR';
