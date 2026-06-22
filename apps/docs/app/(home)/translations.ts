// Translation strings for home page
export const translations = {
  'pt-BR': {
    navbar: {
      products: "Módulos",
      resources: "Recursos",
      docs: "Documentação",
      pricing: "Preços",
      login: "Entrar",
      getStarted: "Começar",
      searchPlaceholder: "Buscar módulos ou documentação...",
    },
    announcement: {
      badge: "Lançamento v2.0",
      text: "LinkedIn Job Explorer agora com suporte nativo ao Gemini 1.5 Pro e BullMQ.",
    },
    hero: {
      title: "LinkedIn Job Explorer — Uma única suíte para buscar vagas, auto-candidatura e gerar carrosséis",
      subtitle: "Chega de rolar a tela e preencher formulários repetitivos. Consulte vagas via GraphQL, automatize candidaturas Easy Apply com IA Gemini de forma contextual e publique carrosséis em PDF direto do código.",
      ctaPrimary: "Começar Grátis",
      ctaSecondary: "Ver documentação",
      bullets: {
        free: "100% Código Aberto",
        local: "Banco SQLite Local",
        setup: "Pronto em 60 segundos",
      }
    },
    submodules: {
      title: "Módulos Integrados do Monorepo",
      description: "Subprojetos desacoplados que operam juntos em harmonia no monorepo.",
      list: {
        extension: {
          title: "Chrome Extension",
          desc: "Captura credenciais da sessão ativa (li_at e JSESSIONID) com um clique e sincroniza.",
        },
        graphql: {
          title: "GraphQL Gateway",
          desc: "Busca estruturada de vagas agregada em um único schema flexível e fortemente tipado.",
        },
        jobBackend: {
          title: "AI Job Solver",
          desc: "Resolução inteligente de formulários de candidatura com IA contextual local.",
        },
        publisher: {
          title: "BullMQ Publisher",
          desc: "Filas de workers para geração de carrosséis e agendamento automático de posts.",
        }
      }
    },
    showcase: {
      title: "Experimente em tempo real",
      subtitle: "Clique nas abas abaixo para interagir com os componentes reais do nosso ecossistema.",
      tabs: {
        dashboard: "Painel Principal",
        graphql: "GraphQL Gateway",
        resume: "Otimizador de Currículo",
        carousel: "Compilador de Carrossel",
      }
    },
    features: {
      title: "Arquitetura robusta construída para desenvolvedores",
      subtitle: "Segurança, velocidade e flexibilidade. O monorepo oferece componentes de nível empresarial prontos para rodar localmente ou em nuvem.",
      list: {
        routing: {
          title: "Roteador Inteligente de IA",
          desc: "Alterne dinamicamente entre Gemini, Claude ou modelos locais (Ollama) para responder questionários complexos.",
        },
        observability: {
          title: "Métricas & Custos em Tempo Real",
          desc: "Acompanhe cada token consumido, taxa de sucesso de candidaturas e tempo de resposta da API LinkedIn Voyager.",
        },
        security: {
          title: "Credenciais Seguras",
          desc: "Seus cookies e dados pessoais nunca saem do seu banco de dados SQLite local. Segurança em primeiro lugar.",
        },
        caching: {
          title: "Cache de Respostas",
          desc: "Evite requisições duplicadas para as mesmas perguntas de candidatura com cache de contexto local inteligente.",
        },
        playground: {
          title: "Geração de Conteúdo",
          desc: "Desenvolva apresentações em PDF formatadas e posts LinkedIn completos a partir de templates de markdown.",
        },
        queue: {
          title: "Filas com BullMQ & Redis",
          desc: "Workers em segundo plano processam agendamentos de posts e submissões paralelas sem bloquear o sistema.",
        }
      }
    },
    faq: {
      title: "Perguntas Frequentes",
      subtitle: "Tudo o que você precisa saber sobre o LinkedIn Job Explorer.",
      questions: [
        {
          q: "Esta ferramenta é oficial ou segura para a minha conta do LinkedIn?",
          a: "Não é oficial. Ela usa APIs Voyager por trás do aplicativo do LinkedIn através dos seus cookies de sessão ativos. Como a comunicação simula o tráfego legítimo do navegador sem a sobrecarga do Selenium/Playwright e inclui rate limiting automático, o risco é minimizado. No entanto, recomendamos cautela no uso excessivo."
        },
        {
          q: "Preciso de chaves de API pagas da OpenAI ou Google?",
          a: "Não necessariamente. Você pode usar a API gratuita do Gemini com seus limites padrão ou configurar modelos locais rodando no Ollama sem gastar nada."
        },
        {
          q: "Como a extensão do Chrome funciona?",
          a: "Ela lê os cookies de autenticação (li_at e JSESSIONID) da aba ativa do LinkedIn.com no seu navegador e os envia via requisição POST segura e local para o seu job-backend rodando na porta 3000."
        },
        {
          q: "Posso fazer deploy em nuvem ou apenas rodar localmente?",
          a: "Você pode rodar localmente com um simples comando Docker Compose ou fazer deploy em servidores de nuvem de sua preferência, já que o banco de dados é configurável para SQLite ou Postgres."
        }
      ]
    },
    cta: {
      title: "ACELERE SUA CARREIRA",
      subtitle: "Automação limpa, robusta e modular para profissionais de tecnologia.",
      button: "Instalar via pnpm",
    },
    footer: {
      built: "Construído de forma independente sob licença MIT",
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
      },
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
    },
  },
  en: {
    navbar: {
      products: "Modules",
      resources: "Resources",
      docs: "Docs",
      pricing: "Pricing",
      login: "Log In",
      getStarted: "Get Started",
      searchPlaceholder: "Search modules or docs...",
    },
    announcement: {
      badge: "Release v2.0",
      text: "LinkedIn Job Explorer now features Gemini 1.5 Pro and BullMQ background workers.",
    },
    hero: {
      title: "LinkedIn Job Explorer — One toolchain to search jobs, auto-apply, and schedule carousels",
      subtitle: "Stop manual scrolling and repetitive form answering. Query jobs via GraphQL, automate Easy Apply responses with context-aware Gemini, and build PDF slideshows directly from code.",
      ctaPrimary: "Get Started For Free",
      ctaSecondary: "View documentation",
      bullets: {
        free: "100% Open Source",
        local: "Local SQLite DB",
        setup: "Setup in 60 seconds",
      }
    },
    submodules: {
      title: "Integrated Monorepo Modules",
      description: "Decoupled subprojects operating together in harmony within the monorepo.",
      list: {
        extension: {
          title: "Chrome Extension",
          desc: "Captures active session credentials (li_at and JSESSIONID) with one click and synchronizes.",
        },
        graphql: {
          title: "GraphQL Gateway",
          desc: "Structured job fetching aggregated into a single, strongly-typed flexible schema.",
        },
        jobBackend: {
          title: "AI Job Solver",
          desc: "Intelligent application form resolution powered by local contextual AI.",
        },
        publisher: {
          title: "BullMQ Publisher",
          desc: "Worker queues for automated PDF carousel compilation and post scheduling.",
        }
      }
    },
    showcase: {
      title: "Experience it live",
      subtitle: "Click the tabs below to interact with the actual components of our ecosystem.",
      tabs: {
        dashboard: "Live Dashboard",
        graphql: "GraphQL Gateway",
        resume: "Resume Optimizer",
        carousel: "Carousel Compiler",
      }
    },
    features: {
      title: "Robust architecture built for developers",
      subtitle: "Security, speed, and flexibility. The monorepo offers enterprise-grade submodules ready to run locally or in the cloud.",
      list: {
        routing: {
          title: "Intelligent LLM Router",
          desc: "Dynamically switch between Gemini, Claude, or local models (Ollama) to answer complex job questionnaires.",
        },
        observability: {
          title: "Real-time Metrics & Costs",
          desc: "Track every token consumed, application success rates, and response times of the LinkedIn Voyager API.",
        },
        security: {
          title: "Secure Local Credentials",
          desc: "Your cookies and personal data never leave your local SQLite database. Privacy-first architecture.",
        },
        caching: {
          title: "Response Caching",
          desc: "Prevent duplicate requests for the same questionnaire queries with smart local context caching.",
        },
        playground: {
          title: "Content Generation",
          desc: "Design well-formatted PDF presentations and complete LinkedIn posts from simple markdown files.",
        },
        queue: {
          title: "BullMQ & Redis Queues",
          desc: "Background workers process scheduled posts and parallel application submissions without locking the client.",
        }
      }
    },
    faq: {
      title: "Frequently Asked Questions",
      subtitle: "Everything you need to know about LinkedIn Job Explorer.",
      questions: [
        {
          q: "Is this tool official or safe for my LinkedIn account?",
          a: "It is not official. It interfaces with LinkedIn's internal Voyager APIs using your active browser session cookies. Because it simulates natural browser API requests without Selenium/Playwright overhead and includes built-in rate limiters, risk is minimal. However, caution is advised when doing high volumes."
        },
        {
          q: "Do I need paid OpenAI or Google API keys?",
          a: "Not necessarily. You can use Gemini's free tier with its standard rate limits, or hook it up to local models running on Ollama for a completely free experience."
        },
        {
          q: "How does the Chrome extension work?",
          a: "It reads the authentication cookies (li_at and JSESSIONID) from your active LinkedIn.com tab and sends them via secure local POST request to your local job-backend server on port 3000."
        },
        {
          q: "Can I deploy it to the cloud or only run it locally?",
          a: "You can run it locally with a single Docker Compose command, or deploy it to cloud servers since the database is configurable for both SQLite and Postgres."
        }
      ]
    },
    cta: {
      title: "ACCELERATE YOUR CAREER",
      subtitle: "Clean, robust, and modular automation for tech professionals.",
      button: "Install via pnpm",
    },
    footer: {
      built: "Independently built under the MIT license",
      links: {
        docs: "Documentation",
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
      },
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
    },
  }
} as const;

export type Locale = keyof typeof translations;
export const defaultLocale: Locale = 'pt-BR';
