// Translation strings for home page
export const translations = {
  'pt-BR': {
    hero: {
      badge: 'a ferramenta completa de automação full-stack que você adora.',
      title1: 'Automatize sua',
      title2: 'busca de emprego',
      title3: 'no seu estilo',
      description: 'Explore a documentação de desenvolvedores do LinkedIn Job Explorer. Um monorepo modular e robusto construído para interagir diretamente com as APIs LinkedIn Voyager via proxies GraphQL, trabalhadores de auto-aplicação com IA, e geradores de carrossel de slides.',
      getStarted: 'Começar',
      openGithub: 'Abrir GitHub',
    },
    sections: {
      tryItOut: {
        description: 'LinkedIn Job Explorer é uma aplicação full-stack para Desenvolvedores, construída para eliminar a sobrecarga do navegador comunicando-se diretamente com as APIs LinkedIn Voyager. Sincronize credenciais, execute buscas paralelas e resolva formulários Easy Apply usando agentes LLM contextuais avançados.',
      },
      integration: {
        graphql: {
          title: 'Consultar listas de vagas via Gateway GraphQL',
          desc: 'Use consultas GraphQL limpas para buscar dados estruturados em todos os serviços LinkedIn. O gateway agrega perfis, candidaturas e postagens em um único schema.',
          bullets: [
            'Schema GraphQL consolidado para todas as APIs backend',
            'Tipagem forte e arquivos de schema TypeScript auto-gerados',
            'Busque relações aninhadas (Vaga -> Empresa -> URL de Candidatura) em uma única requisição'
          ],
        },
        rest: {
          title: 'Endpoint REST para envio automático de candidaturas',
          desc: 'Acione jobs de preenchimento automático de formulários programaticamente. Envie um ID de vaga, especifique seus parâmetros de perfil, e deixe as filas em background lidarem com navegação e respostas de formulários.',
          bullets: [
            'Processamento de candidaturas em fila com persistência SQLite',
            'Engine de parsing de questões contextuais com Gemini/Claude',
            'Respostas REST abrangentes para depuração de integração'
          ],
        },
        cli: {
          title: 'Comandos CLI de Automação',
          desc: 'Execute tarefas administrativas rápidas, atualize credenciais de perfil, teste prompts e acione gerações de conteúdo manuais com facilidade.',
          bullets: [
            'Sintaxe CLI unificada via scripts pnpm',
            'Ferramentas fáceis para desenvolvedores para migrações de banco de dados e sincronização openapi',
            'Execute módulos de microsserviços individuais sozinhos ou em combinação'
          ],
        },
      },
      flow: {
        badge: 'Fluxo de Autenticação & Candidatura',
        title: 'Pipeline de Integração LinkedIn & IA',
        description: 'Da extração de cookies de sessão ao envio em background, veja como o monorepo sincroniza dados.',
        steps: [
          {
            title: 'Sincronização de Sessão',
            tech: 'Extensão Chrome',
            desc: 'Captura cookies ativos li_at e JSESSIONID da sua aba do navegador com um único clique, sincronizando-os com o banco de dados SQLite do job-backend.',
          },
          {
            title: 'Busca de Vagas',
            tech: 'Gateway API',
            desc: 'Consulta o sistema de busca do LinkedIn via proxies HTTP Voyager usando sua sessão, retornando dados JSON estruturados de busca de vagas.',
          },
          {
            title: 'Parsing de Formulários',
            tech: 'Job Backend',
            desc: 'Elimina automação pesada de navegador para fazer parse de estruturas de formulários Easy Apply e questionários diretamente de respostas da API REST.',
          },
          {
            title: 'Resolução Contextual',
            tech: 'Engine IA (Gemini)',
            desc: 'Alimenta estruturas de questionários e seu histórico de currículo no Claude/Gemini, gerando respostas altamente personalizadas.',
          },
          {
            title: 'Auto-Envio',
            tech: 'Voyager REST API',
            desc: 'Envia respostas e anexa seu currículo PDF auto-gerado de volta às APIs do LinkedIn em background.',
          },
        ],
      },
      architecture: {
        title: 'Arquitetura Monorepo',
        description: 'Cada pacote é separado, desacoplado e auto-contido. Leia nossas referências de microsserviços abaixo.',
        gateway: {
          title: 'LinkedIn API Gateway',
          description: 'Wrappers proxy REST e GraphQL duplos interfaceando os endpoints oficiais LinkedIn Voyager. Busque listagens de vagas ativas, faça parse de conexões de perfil e compartilhe conteúdo diretamente usando nós de API brutos.',
          features: {
            graphql: { title: 'Proxy GraphQL', desc: 'Consultas de schema unificado' },
            rest: { title: 'Endpoints REST', desc: 'Payloads JSON diretos' },
          },
        },
        jobBackend: {
          title: 'IA Job Backend',
          description: 'Assistente contextual de IA para Easy Apply. Avalia entradas de formulários e questionários diretamente, consultando modelos Gemini ou Claude para gerar respostas de candidatura altamente relevantes correspondendo sua experiência.',
          cta: 'Ler visão geral',
        },
        publisher: {
          title: 'Publisher Backend',
          description: 'Gerador de Conteúdo LinkedIn com IA. Compila PDFs de apresentação de carrossel, formata artigos LinkedIn e agenda jobs de publicação automática via filas de workers BullMQ.',
          cta: 'Ler visão geral',
        },
        extension: {
          title: 'Extensão do Navegador',
          description: 'Sincronização perfeita de credenciais de sessão. Captura cookies de autenticação ativos do LinkedIn (li_at e JSESSIONID) diretamente da sua aba ativa do navegador, escrevendo-os no banco de dados SQLite local com um clique.',
          cta: 'Ler guias de configuração',
        },
      },
      testimonials: {
        title: 'Uma ferramenta para desenvolvedores.',
        description: 'Gerador automatizado de schemas sincronizando modelos TypeScript diretamente com referências de API. Execute um único comando para sincronizar rotas e atualizar schemas Fumadocs automaticamente.',
        cta: 'Ler Documentação',
        quote1: '"Configurar a Gateway API levou menos de 5 minutos. A interface GraphQL é suave e economiza dezenas de consultas de endpoints."',
        person1: { name: 'Alex S.', role: 'Líder Fullstack' },
        quote2: '"Filas em background acopladas com modelos Gemini respondem com sucesso mais de 90% dos questionários de descrição de vaga corretamente."',
        person2: { name: 'Jessica K.', role: 'Engenheira de Machine Learning' },
      },
      community: {
        title: 'Monorepo Open Source',
        description: 'LinkedIn Job Explorer é open source e impulsionado pela comunidade. Pull requests, templates de issues e melhorias de pacotes são bem-vindos.',
        contributors: 'Alguns de nossos melhores contribuidores.',
      },
      cta: {
        title: 'EXECUTE A SUÍTE',
        subtitle: 'leve e lindo, assim como a lua.',
        button: 'Ler documentação',
      },
      footer: {
        features: [
          {
            title: '[⚡] Bateria garantida.',
            desc: 'Ativamente mantido, otimizado para tarefas de produção.',
          },
          {
            title: '[❖] Totalmente open-source.',
            desc: 'Licença MIT. Hospede você mesmo ou faça deploy globalmente.',
          },
          {
            title: '[⏰] Pronto em segundos.',
            desc: 'Blueprints de início rápido cobrem toda sincronização inicial de credenciais.',
          },
        ],
        built: 'Construído com Fumadocs',
        links: {
          docs: 'Documentação',
          gateway: 'Gateway API',
          jobBackend: 'Job Backend',
          publisher: 'Publisher',
        },
      },
    },
  },
  en: {
    hero: {
      badge: 'the full-stack automation toolchain you love.',
      title1: 'Automate your',
      title2: 'LinkedIn job search',
      title3: 'your style',
      description: 'Explore developers\' documentation for the LinkedIn Job Explorer. A modular, robust monorepo built to interact directly with the LinkedIn Voyager APIs via GraphQL proxies, auto-apply AI workers, and slide carousel generators.',
      getStarted: 'Getting Started',
      openGithub: 'Open GitHub',
    },
    sections: {
      tryItOut: {
        description: 'LinkedIn Job Explorer is a full-stack application for Developers, built to bypass browser overhead by speaking directly to LinkedIn Voyager APIs. Sync credentials, execute parallel searches, and solve Easy Apply forms using advanced contextual LLM agents.',
      },
      integration: {
        graphql: {
          title: 'Query job lists via GraphQL Gateway',
          desc: 'Use clean GraphQL queries to fetch structured data across all LinkedIn services. The gateway aggregates profiles, applications, and postings into a single schema.',
          bullets: [
            'Consolidated GraphQL schema for all backend APIs',
            'Strong typing and auto-generated TypeScript schema files',
            'Fetch nested relations (Job -> Company -> Apply URL) in one roundtrip'
          ],
        },
        rest: {
          title: 'REST endpoint for auto application submissions',
          desc: 'Trigger AI form-filling jobs programmatically. Send a job ID, specify your profile parameters, and let the background queues handle form navigation and answers.',
          bullets: [
            'Queued application processing with SQLite persistence',
            'Gemini/Claude contextual question parsing engine',
            'Comprehensive REST responses for integration debugging'
          ],
        },
        cli: {
          title: 'CLI Automation commands',
          desc: 'Perform quick administrative tasks, update profile credentials, test prompts, and trigger manual content generations with ease.',
          bullets: [
            'Unified CLI syntax via pnpm scripts',
            'Easy developer tooling for database migrations and openapi sync',
            'Run individual microservice modules standalone or in combination'
          ],
        },
      },
      flow: {
        badge: 'Authentication & Apply Flow',
        title: 'LinkedIn & AI Integration Pipeline',
        description: 'From cookie session extraction to background submission, here is how the monorepo syncs data.',
        steps: [
          {
            title: 'Session Sync',
            tech: 'Chrome Extension',
            desc: 'Captures active li_at and JSESSIONID cookies from your active browser tab with a single click, syncing them to the SQLite job-backend database.',
          },
          {
            title: 'Job Fetching',
            tech: 'Gateway API',
            desc: 'Queries the LinkedIn search system via Voyager HTTP proxies using your session, returning raw structured job search JSON data.',
          },
          {
            title: 'Form Parsing',
            tech: 'Job Backend',
            desc: 'Bypasses heavy browser automation to parse Easy Apply form structures and questionnaires directly from raw REST API responses.',
          },
          {
            title: 'Contextual Solving',
            tech: 'AI Engine (Gemini)',
            desc: 'Feeds questionnaire structures and your resume history into Claude/Gemini, generating highly tailored answers.',
          },
          {
            title: 'Auto-Submission',
            tech: 'Voyager REST API',
            desc: 'Submits answers and attaches your auto-generated PDF resume back to LinkedIn APIs in the background.',
          },
        ],
      },
      architecture: {
        title: 'Monorepo Architecture',
        description: 'Every package is separated, decoupled, and self-contained. Read our microservices references below.',
        gateway: {
          title: 'LinkedIn API Gateway',
          description: 'Dual REST and GraphQL proxy wrappers interfacing the official LinkedIn Voyager endpoints. Fetch active job listings, parse profile connections, and share content directly using raw API nodes.',
          features: {
            graphql: { title: 'GraphQL Proxy', desc: 'Unified schema queries' },
            rest: { title: 'REST Endpoints', desc: 'Direct JSON payloads' },
          },
        },
        jobBackend: {
          title: 'AI Job Backend',
          description: 'Contextual AI Easy Apply assistant. Evaluates form inputs and questionnaires directly, querying Gemini or Claude models to generate highly relevant application answers matching your experience.',
          cta: 'Read overview',
        },
        publisher: {
          title: 'Publisher Backend',
          description: 'AI-powered LinkedIn Content generator. Compiles PDF slideshow carousels, formats LinkedIn articles, and schedules automatic publishing jobs via BullMQ worker queues.',
          cta: 'Read overview',
        },
        extension: {
          title: 'Browser Extension',
          description: 'Seamless session credentials sync. Captures active LinkedIn authentication cookies (li_at and JSESSIONID) directly from your active browser tab, writing them to local SQLite database in one click.',
          cta: 'Read setup guides',
        },
      },
      testimonials: {
        title: 'A developer toolchain.',
        description: 'Automated schemas generator synchronizing TypeScript models directly with API references. Run a single command to sync routes and update Fumadocs schemas automatically.',
        cta: 'Read Docs',
        quote1: '"Setting up the Gateway API took less than 5 minutes. The GraphQL interface is smooth and saves dozen endpoints queries."',
        person1: { name: 'Alex S.', role: 'Fullstack Lead' },
        quote2: '"Background queues coupled with Gemini models successfully answers over 90% of job description questionnaires correctly."',
        person2: { name: 'Jessica K.', role: 'Machine Learning Engineer' },
      },
      community: {
        title: 'Open Source Monorepo',
        description: 'LinkedIn Job Explorer is open source and community powered. Pull requests, issue templates, and package enhancements are welcome.',
        contributors: 'Some of our best contributors.',
      },
      cta: {
        title: 'RUN THE SUITE',
        subtitle: 'light and gorgeous, just like the moon.',
        button: 'Read documentation',
      },
      footer: {
        features: [
          {
            title: '[⚡] Battery guaranteed.',
            desc: 'Actively maintained, optimized for production tasks.',
          },
          {
            title: '[❖] Fully open-source.',
            desc: 'MIT licensed. Host it yourself or deploy globally.',
          },
          {
            title: '[⏰] Up in seconds.',
            desc: 'Quickstart blueprints cover all initial credentials sync.',
          },
        ],
        built: 'Built with Fumadocs',
        links: {
          docs: 'Docs',
          gateway: 'Gateway API',
          jobBackend: 'Job Backend',
          publisher: 'Publisher',
        },
      },
    },
  },
} as const;

export type Locale = keyof typeof translations;
export const defaultLocale: Locale = 'pt-BR';
