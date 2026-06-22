"use client";

import Link from 'next/link';
import { useState } from 'react';
import {
  Layers, Briefcase, Rocket, ArrowRight,
  Zap, Bot, FileText, Terminal, Globe, RefreshCw,
  ImageIcon, ChevronRight, Database, Cpu, Check, Users
} from 'lucide-react';



// A deterministic halftone/dither wave pattern
function WaveDither() {
  const dots = [];
  const rows = 24;
  const cols = 40;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = (c / (cols - 1)) * 600;
      const y = (r / (rows - 1)) * 300;

      // Mathematical wave shape
      const waveValue = Math.sin(x * 0.012) * Math.cos(y * 0.018) + Math.sin((x + y) * 0.006);
      const intensity = (waveValue + 2) / 4; // normalize to [0, 1]
      const size = intensity * 3.2;

      if (size > 0.4) {
        dots.push(
          <circle
            key={`${r}-${c}`}
            cx={x.toFixed(2)}
            cy={y.toFixed(2)}
            r={size.toFixed(2)}
            className="fill-brand-lime/10 dark:fill-brand-lime/15"
          />
        );
      }
    }
  }

  return (
    <svg viewBox="0 0 600 300" className="absolute inset-0 w-full h-full object-cover opacity-60 pointer-events-none z-0">
      {dots}
    </svg>
  );
}

// Deterministic mountain halftone skyline
function MountainDither() {
  const dots = [];
  const rows = 20;
  const cols = 45;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = (c / (cols - 1)) * 600;
      const y = (r / (rows - 1)) * 300;

      // Two layers of mountain heights
      const m1 = 160 + Math.sin(x * 0.012) * 35 + Math.cos(x * 0.006) * 15;
      const m2 = 210 + Math.sin(x * 0.018) * 25 + Math.cos(x * 0.009) * 12;

      let isMountain = false;
      let density = 0;

      if (y >= m2) {
        isMountain = true;
        density = (y - m2) / (300 - m2);
      } else if (y >= m1) {
        isMountain = true;
        density = ((y - m1) / (300 - m1)) * 0.55;
      }

      if (isMountain) {
        const size = 0.5 + density * 3.0;
        dots.push(
          <circle
            key={`${r}-${c}`}
            cx={x.toFixed(2)}
            cy={y.toFixed(2)}
            r={size.toFixed(2)}
            className="fill-orange-500/15 dark:fill-orange-400/20"
          />
        );
      }
    }
  }

  return (
    <svg viewBox="0 0 600 300" className="absolute inset-0 w-full h-full object-cover opacity-60 pointer-events-none z-0">
      {dots}
    </svg>
  );
}

// Simulated documentation interface viewport
function DocsMockup() {
  return (
    <div className="relative max-w-4xl mx-auto mt-16 rounded-xl border border-fd-border/30 bg-fd-card/75 backdrop-blur-md overflow-hidden shadow-2xl z-10 transition-transform duration-500 hover:scale-[1.01]">
      {/* Chrome header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-fd-border/20 bg-fd-muted/20">
        <div className="flex gap-1.5 shrink-0">
          <div className="w-3 h-3 rounded-full bg-red-500/60" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
          <div className="w-3 h-3 rounded-full bg-green-500/60" />
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-fd-background/50 border border-fd-border/15 text-[10px] text-fd-muted-foreground font-mono w-60 justify-center">
          <Globe className="size-3 shrink-0" />
          docs.linkedin-job.dev
        </div>
        <div className="w-12 shrink-0" />
      </div>

      {/* Docs layout wrapper */}
      <div className="grid grid-cols-1 md:grid-cols-4 min-h-[360px] text-left">
        {/* Sidebar */}
        <div className="md:col-span-1 border-r border-fd-border/20 p-4 bg-fd-muted/5 text-xs">
          <div className="text-[10px] font-semibold text-fd-muted-foreground tracking-wider uppercase mb-3">GETTING STARTED</div>
          <div className="space-y-1 mb-5">
            <div className="px-2.5 py-1.5 rounded-md bg-fd-primary/10 text-fd-primary font-medium border-l-2 border-fd-primary flex items-center gap-1.5">
              <Zap className="size-3" />
              Quick Start
            </div>
            <div className="px-2.5 py-1.5 text-fd-muted-foreground hover:text-fd-foreground hover:bg-fd-muted/20 rounded-md transition-all">Overview</div>
            <div className="px-2.5 py-1.5 text-fd-muted-foreground hover:text-fd-foreground hover:bg-fd-muted/20 rounded-md transition-all">Architecture</div>
          </div>

          <div className="text-[10px] font-semibold text-fd-muted-foreground tracking-wider uppercase mb-3">APIS & ROUTING</div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 px-2.5 py-1.5 text-fd-muted-foreground hover:text-fd-foreground hover:bg-fd-muted/20 rounded-md transition-all">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              Gateway API
            </div>
            <div className="flex items-center gap-2 px-2.5 py-1.5 text-fd-muted-foreground hover:text-fd-foreground hover:bg-fd-muted/20 rounded-md transition-all">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Job Backend
            </div>
            <div className="flex items-center gap-2 px-2.5 py-1.5 text-fd-muted-foreground hover:text-fd-foreground hover:bg-fd-muted/20 rounded-md transition-all">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />
              Publisher Backend
            </div>
          </div>
        </div>

        {/* Content viewport */}
        <div className="md:col-span-3 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-[10px] text-fd-muted-foreground mb-2">
              <span>Docs</span>
              <ChevronRight className="size-3" />
              <span className="text-fd-foreground">Quick Start</span>
            </div>
            <h4 className="text-2xl font-bold text-fd-foreground mb-4">Quick Start</h4>
            <p className="text-sm text-fd-muted-foreground mb-5 leading-relaxed">
              Get up and running with the LinkedIn automation monorepo. Learn to setup the API proxy gateway, configure the AI application tracking database, and run content jobs.
            </p>

            {/* Simulated terminal */}
            <div className="bg-fd-muted/40 border border-fd-border/30 rounded-lg p-4 font-mono text-[12px] text-fd-foreground space-y-1.5 shadow-inner">
              <div className="text-fd-muted-foreground"># Clone the toolchain repository</div>
              <div><span className="text-brand-lime">$</span> git clone https://github.com/juliolimacostavalladares/linkedin-job-applier.git</div>
              <div className="text-fd-muted-foreground mt-2"># Install workspace dependencies</div>
              <div><span className="text-brand-lime">$</span> pnpm install</div>
              <div className="text-fd-muted-foreground mt-2"># Run parallel development servers</div>
              <div><span className="text-brand-lime">$</span> pnpm dev</div>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-fd-border/20 pt-4 mt-6">
            <span className="text-xs text-fd-muted-foreground">Was this page helpful?</span>
            <div className="flex gap-2">
              <button className="px-3 py-1 text-xs rounded border border-fd-border bg-fd-muted/30 hover:bg-fd-muted text-fd-foreground transition-colors cursor-pointer">Yes</button>
              <button className="px-3 py-1 text-xs rounded border border-fd-border bg-fd-muted/30 hover:bg-fd-muted text-fd-foreground transition-colors cursor-pointer">No</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// State-driven Interactive Playground component showing API integration
function InteractiveIntegration() {
  const [tab, setTab] = useState<'graphql' | 'rest' | 'cli'>('graphql');

  const contentMap = {
    graphql: {
      code: `query SearchJobs {
  jobs(keywords: "TypeScript Developer", location: "Remote") {
    id
    title
    company
    location
    easyApply
  }
}`,
      title: "Query job lists via GraphQL Gateway",
      desc: "Use clean GraphQL queries to fetch structured data across all LinkedIn services. The gateway aggregates profiles, applications, and postings into a single schema.",
      bullets: [
        "Consolidated GraphQL schema for all backend APIs",
        "Strong typing and auto-generated TypeScript schema files",
        "Fetch nested relations (Job -> Company -> Apply URL) in one roundtrip"
      ]
    },
    rest: {
      code: `POST /api/jobs/apply
Content-Type: application/json
{
  "jobId": "38290123",
  "resumeId": "current-profile",
  "autoAnswer": true
}`,
      title: "REST endpoint for auto application submissions",
      desc: "Trigger AI form-filling jobs programmatically. Send a job ID, specify your profile parameters, and let the background queues handle form navigation and answers.",
      bullets: [
        "Queued application processing with SQLite persistence",
        "Gemini/Claude contextual question parsing engine",
        "Comprehensive REST responses for integration debugging"
      ]
    },
    cli: {
      code: `# Sync cookie session credentials from extension
pnpm --filter job-backend sync-profile --id user-123

# Launch the publisher generator
pnpm --filter publisher-backend make-carousel --topic "NextJS 15 Tips"`,
      title: "CLI Automation commands",
      desc: "Perform quick administrative tasks, update profile credentials, test prompts, and trigger manual content generations with ease.",
      bullets: [
        "Unified CLI syntax via pnpm scripts",
        "Easy developer tooling for database migrations and openapi sync",
        "Run individual microservice modules standalone or in combination"
      ]
    }
  };

  const active = contentMap[tab];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch mt-10">
      {/* Code Editor block */}
      <div className="lg:col-span-7 relative flex flex-col rounded-xl border border-fd-border/30 bg-fd-card/60 backdrop-blur-md overflow-hidden shadow-xl min-h-[320px]">
        {/* Editor bar */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-fd-border/20 bg-fd-muted/30">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
            <span className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
            <span className="text-xs text-fd-muted-foreground ml-2 font-mono">
              {tab === 'graphql' ? 'query.graphql' : tab === 'rest' ? 'request.http' : 'terminal.sh'}
            </span>
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(active.code);
            }}
            className="text-[10px] text-fd-foreground border border-fd-border px-2 py-0.5 rounded bg-fd-muted/30 hover:bg-fd-muted transition-all cursor-pointer"
          >
            Copy
          </button>
        </div>
        {/* Editor code area */}
        <div className="flex-1 p-5 font-mono text-[13px] text-fd-foreground bg-fd-muted/5 overflow-auto text-left leading-relaxed">
          <pre className="whitespace-pre">{active.code}</pre>
        </div>
      </div>

      {/* Selector and explanation */}
      <div className="lg:col-span-5 flex flex-col justify-between">
        <div>
          {/* Tab selectors */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setTab('graphql')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold border transition-all cursor-pointer ${
                tab === 'graphql'
                  ? 'bg-brand-lime text-black border-brand-lime shadow-md shadow-brand-lime/10'
                  : 'bg-fd-muted/40 border-fd-border text-fd-foreground hover:bg-fd-muted'
              }`}
            >
              GraphQL
            </button>
            <button
              onClick={() => setTab('rest')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold border transition-all cursor-pointer ${
                tab === 'rest'
                  ? 'bg-brand-lime text-black border-brand-lime shadow-md shadow-brand-lime/10'
                  : 'bg-fd-muted/40 border-fd-border text-fd-foreground hover:bg-fd-muted'
              }`}
            >
              REST API
            </button>
            <button
              onClick={() => setTab('cli')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold border transition-all cursor-pointer ${
                tab === 'cli'
                  ? 'bg-brand-lime text-black border-brand-lime shadow-md shadow-brand-lime/10'
                  : 'bg-fd-muted/40 border-fd-border text-fd-foreground hover:bg-fd-muted'
              }`}
            >
              CLI Automation
            </button>
          </div>

          <h4 className="text-xl font-bold text-fd-foreground mb-3">{active.title}</h4>
          <p className="text-sm text-fd-muted-foreground mb-6 leading-relaxed">{active.desc}</p>

          <ul className="space-y-2">
            {active.bullets.map((bullet, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs text-fd-muted-foreground">
                <span className="h-5 w-5 rounded-full bg-brand-lime/10 text-brand-lime flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="size-3" />
                </span>
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <main className="relative flex flex-col items-center overflow-hidden bg-fd-background grain-bg">
      {/* Background grain filter overlay */}
      <div className="absolute inset-0 z-0 pointer-events-none bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_30%,#000_70%,transparent_100%)]" />

      {/* Hero Section */}
      <section className="relative w-full px-6 pt-24 pb-20 overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none" />

        <div className="relative z-10 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Hero Column */}
          <div className="lg:col-span-7 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold rounded-full border border-brand-lime/20 bg-brand-lime/5 text-brand-lime mb-8">
              <span className="flex h-1.5 w-1.5 rounded-full bg-brand-lime animate-pulse" />
              the full-stack automation toolchain you love.
            </div>

            <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-fd-foreground mb-6 leading-[1.08]">
              Automate your
              <br />
              <span className="text-[#0077b5] dark:text-[#0077b5]">LinkedIn</span> job search, <span className="text-brand-lime">your style</span>.
            </h1>

            <p className="text-base sm:text-lg text-fd-muted-foreground mb-8 max-w-lg leading-relaxed">
              Explore developers' documentation for the LinkedIn Job Explorer. A modular, robust monorepo built to interact directly with the LinkedIn Voyager APIs via GraphQL proxies, auto-apply AI workers, and slide carousel generators.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/docs/quickstart"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-bold text-black bg-brand-lime rounded-full shadow-lg shadow-brand-lime/10 hover:bg-[#d5f002] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer"
              >
                Getting Started
              </Link>
              <Link
                href="https://github.com/juliolimacostavalladares/linkedin-job-applier"
                target="_blank"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold text-fd-foreground bg-fd-card/50 hover:bg-fd-muted border border-fd-border/30 rounded-full transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                Open GitHub
              </Link>
            </div>
          </div>

          {/* Right Hero Column: logo.svg */}
          <div className="lg:col-span-5 relative flex justify-center items-center h-[320px] sm:h-[400px]">
            <div className="w-[280px] sm:w-[360px] h-[280px] sm:h-[360px] relative">
              {/* Graphic background */}
              <div className="absolute inset-0 bg-radial from-blue-500/10 via-transparent to-transparent rounded-full scale-[1.3] blur-xl" />
              <img
                src="/logo.svg"
                alt="LinkedIn Job Explorer Logo"
                className="w-full h-full object-contain animate-[pulse_6s_ease-in-out_infinite] select-none"
              />
            </div>
          </div>
        </div>

        {/* Browser viewport mockup */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-0">
          <DocsMockup />
        </div>
      </section>

      {/* Quote / Narrative Section (Try It Out) */}
      <section className="w-full px-6 py-20 border-t border-fd-border/10 bg-fd-muted/5 relative">
        <div className="max-w-6xl mx-auto relative z-10 text-left">
          <div className="max-w-4xl">
            <p className="text-xl sm:text-3xl text-fd-foreground leading-snug font-medium mb-8">
              LinkedIn Job Explorer is a <span className="text-brand-lime">full-stack application</span> for <span className="text-brand-lime">Developers</span>, built to bypass browser overhead by speaking directly to <span className="text-[#0077b5]">LinkedIn Voyager APIs</span>. Sync credentials, execute parallel searches, and solve Easy Apply forms using advanced contextual LLM agents.
            </p>
          </div>

          {/* Integration selectors playground */}
          <InteractiveIntegration />
        </div>
      </section>

      {/* LinkedIn Automation Flow Diagram */}
      <section className="w-full px-6 py-12 border-t border-fd-border/10 bg-fd-background relative">
        <div className="max-w-6xl mx-auto relative z-10 text-left">
          <div className="text-left mb-10">
            <span className="text-xs text-brand-lime font-bold uppercase tracking-wider">Authentication &amp; Apply Flow</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-fd-foreground mt-2">
              LinkedIn &amp; AI Integration Pipeline
            </h2>
            <p className="text-sm text-fd-muted-foreground mt-2 max-w-xl">
              From cookie session extraction to background submission, here is how the monorepo syncs data.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
            {[
              {
                step: "01",
                title: "Session Sync",
                tech: "Chrome Extension",
                desc: "Captures active li_at and JSESSIONID cookies from your active browser tab with a single click, syncing them to the SQLite job-backend database."
              },
              {
                step: "02",
                title: "Job Fetching",
                tech: "Gateway API",
                desc: "Queries the LinkedIn search system via Voyager HTTP proxies using your session, returning raw structured job search JSON data."
              },
              {
                step: "03",
                title: "Form Parsing",
                tech: "Job Backend",
                desc: "Bypasses heavy browser automation to parse Easy Apply form structures and questionnaires directly from raw REST API responses."
              },
              {
                step: "04",
                title: "Contextual Solving",
                tech: "AI Engine (Gemini)",
                desc: "Feeds questionnaire structures and your resume history into Claude/Gemini, generating highly tailored answers."
              },
              {
                step: "05",
                title: "Auto-Submission",
                tech: "Voyager REST API",
                desc: "Submits answers and attaches your auto-generated PDF resume back to LinkedIn APIs in the background."
              }
            ].map((item, index) => (
              <div key={item.step} className="p-5 rounded-xl border border-fd-border/20 bg-fd-card/40 backdrop-blur-sm relative hover:border-brand-lime/30 transition-colors">
                <div className="text-[10px] font-mono text-brand-lime font-bold mb-2 flex justify-between items-center">
                  <span>STEP {item.step}</span>
                  <span className="px-1.5 py-0.5 rounded bg-fd-muted text-fd-foreground text-[8px] font-semibold">{item.tech}</span>
                </div>
                <h4 className="text-sm font-bold text-fd-foreground mb-2">{item.title}</h4>
                <p className="text-xs text-fd-muted-foreground leading-relaxed">{item.desc}</p>
                {index < 4 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 -translate-y-1/2 z-20 text-brand-lime text-lg font-bold">
                    →
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Bento Grid */}
      <section className="w-full px-6 py-20 relative">
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-left mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-fd-foreground mb-4">
              Monorepo Architecture
            </h2>
            <p className="text-sm sm:text-base text-fd-muted-foreground max-w-xl leading-relaxed">
              Every package is separated, decoupled, and self-contained. Read our microservices references below.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
            {/* Left Card: Gateway API (Takes 7 cols) */}
            <div className="md:col-span-7 group relative overflow-hidden rounded-2xl border border-fd-border/30 bg-fd-card/40 backdrop-blur-md p-8 flex flex-col justify-between hover:border-blue-500/30 transition-all duration-300 min-h-[380px]">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div>
                <div className="h-11 w-11 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-6">
                  <Globe className="h-5 w-5" />
                </div>
                <h3 className="text-2xl font-bold text-fd-foreground mb-3">LinkedIn API Gateway</h3>
                <p className="text-sm text-fd-muted-foreground leading-relaxed max-w-md">
                  Dual REST and GraphQL proxy wrappers interfacing the official LinkedIn Voyager endpoints. Fetch active job listings, parse profile connections, and share content directly using raw API nodes.
                </p>
              </div>

              {/* Grid indicator badges */}
              <div className="grid grid-cols-2 gap-3 mt-8">
                <div className="p-3 rounded-lg bg-fd-muted/20 border border-fd-border/10 text-xs">
                  <span className="font-semibold text-fd-foreground block">GraphQL Proxy</span>
                  <span className="text-fd-muted-foreground">Unified schema queries</span>
                </div>
                <div className="p-3 rounded-lg bg-fd-muted/20 border border-fd-border/10 text-xs">
                  <span className="font-semibold text-fd-foreground block">REST Endpoints</span>
                  <span className="text-fd-muted-foreground">Direct JSON payloads</span>
                </div>
              </div>
            </div>

            {/* Right Card: Job Backend (Takes 5 cols) */}
            <Link
              href="/docs/job-backend/overview"
              className="md:col-span-5 group relative overflow-hidden rounded-2xl border border-fd-border/30 bg-fd-card/40 backdrop-blur-md p-8 flex flex-col justify-between hover:border-emerald-500/30 transition-all duration-300 min-h-[380px] cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div>
                <div className="h-11 w-11 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                  <Bot className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-bold text-fd-foreground mb-3">AI Job Backend</h3>
                <p className="text-sm text-fd-muted-foreground leading-relaxed">
                  Contextual AI Easy Apply assistant. Evaluates form inputs and questionnaires directly, querying Gemini or Claude models to generate highly relevant application answers matching your experience.
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold mt-6">
                Read overview
                <ArrowRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Bottom Row - Publisher Card (Takes 5 cols) */}
            <Link
              href="/docs/publisher-backend/overview"
              className="md:col-span-5 group relative overflow-hidden rounded-2xl border border-fd-border/30 bg-fd-card/40 backdrop-blur-md p-8 flex flex-col justify-between hover:border-violet-500/30 transition-all duration-300 min-h-[340px] cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div>
                <div className="h-11 w-11 rounded-xl bg-violet-500/10 text-violet-400 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                  <ImageIcon className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-bold text-fd-foreground mb-3">Publisher Backend</h3>
                <p className="text-sm text-fd-muted-foreground leading-relaxed">
                  AI-powered LinkedIn Content generator. Compiles PDF slideshow carousels, formats LinkedIn articles, and schedules automatic publishing jobs via BullMQ worker queues.
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-violet-400 font-semibold mt-6">
                Read overview
                <ArrowRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Bottom Row - Browser Extension Card (Takes 7 cols) */}
            <Link
              href="/docs/extension"
              className="md:col-span-7 group relative overflow-hidden rounded-2xl border border-fd-border/30 bg-fd-card/40 backdrop-blur-md p-8 flex flex-col justify-between hover:border-brand-lime/30 transition-all duration-300 min-h-[340px] cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-brand-lime/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div>
                <div className="h-11 w-11 rounded-xl bg-brand-lime/10 text-brand-lime flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                  <Zap className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-bold text-fd-foreground mb-3">Browser Extension</h3>
                <p className="text-sm text-fd-muted-foreground leading-relaxed">
                  Seamless session credentials sync. Captures active LinkedIn authentication cookies (li_at and JSESSIONID) directly from your active browser tab, writing them to local SQLite database in one click.
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-brand-lime font-semibold mt-6">
                Read setup guides
                <ArrowRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Dither Graphic Card Section (A framework people love clone) */}
      <section className="w-full px-6 py-20 relative border-t border-fd-border/10 bg-fd-muted/5 overflow-hidden">
        {/* Custom Wavy background decoration */}
        <WaveDither />

        <div className="max-w-6xl mx-auto relative z-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
          {/* Left Info block (Takes 5 cols) */}
          <div className="md:col-span-5 rounded-2xl border border-fd-border/30 bg-fd-card/65 backdrop-blur-md p-8 flex flex-col justify-between min-h-[320px]">
            <div>
              <h3 className="text-3xl font-bold text-fd-foreground mb-4">A developer toolchain.</h3>
              <p className="text-sm text-fd-muted-foreground leading-relaxed">
                Automated schemas generator synchronizing TypeScript models directly with API references. Run a single command to sync routes and update Fumadocs schemas automatically.
              </p>
            </div>
            <div>
              <Link
                href="/docs/quickstart"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-black bg-brand-lime rounded-full shadow-lg shadow-brand-lime/10 hover:bg-[#d5f002] hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 cursor-pointer"
              >
                Read Docs
              </Link>
            </div>
          </div>

          {/* Right testimonials block (Takes 7 cols) */}
          <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-fd-border/30 bg-fd-card/50 backdrop-blur-sm p-6 flex flex-col justify-between">
              <p className="text-sm text-fd-muted-foreground italic mb-6">
                &ldquo;Setting up the Gateway API took less than 5 minutes. The GraphQL interface is smooth and saves dozen endpoints queries.&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
                  <Users className="size-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-fd-foreground">Alex S.</div>
                  <div className="text-[10px] text-fd-muted-foreground">Fullstack Lead</div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-fd-border/30 bg-fd-card/50 backdrop-blur-sm p-6 flex flex-col justify-between">
              <p className="text-sm text-fd-muted-foreground italic mb-6">
                &ldquo;Background queues coupled with Gemini models successfully answers over 90% of job description questionnaires correctly.&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                  <Bot className="size-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-fd-foreground">Jessica K.</div>
                  <div className="text-[10px] text-fd-muted-foreground">Machine Learning Engineer</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Build Your Docs Dither Crescent (Section 11/12 clone) */}
      <section className="w-full px-6 py-20 relative">
        <div className="max-w-6xl mx-auto relative z-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
          {/* Made Possible Card (Takes 6 cols) */}
          <div className="md:col-span-6 rounded-2xl border border-fd-border/30 bg-fd-card/40 backdrop-blur-md p-8 flex flex-col justify-between min-h-[350px]">
            <div>
              <div className="h-10 w-10 rounded-full bg-brand-lime/10 text-brand-lime flex items-center justify-center mb-6">
                <Users className="size-5" />
              </div>
              <h3 className="text-2xl font-bold text-fd-foreground mb-4">Open Source Monorepo</h3>
              <p className="text-sm text-fd-muted-foreground leading-relaxed">
                LinkedIn Job Explorer is open source and community powered. Pull requests, issue templates, and package enhancements are welcome.
              </p>
            </div>

            {/* Simulating active developers avatars list matching screenshot 11 */}
            <div className="mt-8">
              <div className="flex -space-x-2.5 overflow-hidden mb-3">
                {['JL', 'PV', 'AM', 'DR', 'SK', 'TR'].map((name, i) => (
                  <div
                    key={name}
                    className={`inline-flex items-center justify-center size-8 rounded-full border-2 border-fd-background text-[10px] font-bold text-white shrink-0 ${
                      i % 3 === 0 ? 'bg-indigo-600' : i % 3 === 1 ? 'bg-emerald-600' : 'bg-orange-600'
                    }`}
                  >
                    {name}
                  </div>
                ))}
                <div className="inline-flex items-center justify-center size-8 rounded-full border-2 border-fd-background bg-fd-muted text-[10px] font-bold text-fd-muted-foreground shrink-0">
                  +12
                </div>
              </div>
              <span className="text-[11px] text-fd-muted-foreground">Some of our best contributors.</span>
            </div>
          </div>

          {/* Build Your Docs visual gradient card (Takes 6 cols) */}
          <div className="md:col-span-6 rounded-2xl border border-fd-border/30 bg-[#030712] overflow-hidden relative p-8 flex flex-col justify-between min-h-[350px]">
            {/* Dither mountain silhouette */}
            <MountainDither />
            <div className="absolute inset-0 bg-gradient-to-t from-orange-500/10 via-transparent to-transparent pointer-events-none" />

            <div className="relative z-10 text-center mt-6">
              <h3 className="text-4xl font-extrabold text-white tracking-widest uppercase font-mono">
                RUN THE SUITE
              </h3>
              <span className="text-xs text-fd-muted-foreground tracking-wide block mt-2">
                light and gorgeous, just like the moon.
              </span>
            </div>

            <div className="relative z-10 text-center mb-6">
              <Link
                href="/docs/quickstart"
                className="inline-flex items-center gap-1.5 px-6 py-3 text-xs font-bold text-black bg-brand-lime rounded-full shadow-lg shadow-brand-lime/10 hover:bg-[#d5f002] transition-colors cursor-pointer"
              >
                Read documentation
              </Link>
            </div>
          </div>
        </div>

        {/* Battery guaranteed footer panels (screenshot 12) */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 text-left relative z-10">
          <div className="p-6 rounded-xl border border-fd-border/20 bg-fd-card/35 backdrop-blur-sm">
            <span className="font-semibold text-fd-foreground text-sm block mb-1">
              [⚡] Battery guaranteed.
            </span>
            <span className="text-xs text-fd-muted-foreground">
              Actively maintained, optimized for production tasks.
            </span>
          </div>

          <div className="p-6 rounded-xl border border-fd-border/20 bg-fd-card/35 backdrop-blur-sm">
            <span className="font-semibold text-fd-foreground text-sm block mb-1">
              [❖] Fully open-source.
            </span>
            <span className="text-xs text-fd-muted-foreground">
              MIT licensed. Host it yourself or deploy globally.
            </span>
          </div>

          <div className="p-6 rounded-xl border border-fd-border/20 bg-fd-card/35 backdrop-blur-sm">
            <span className="font-semibold text-fd-foreground text-sm block mb-1">
              [⏰] Up in seconds.
            </span>
            <span className="text-xs text-fd-muted-foreground">
              Quickstart blueprints cover all initial credentials sync.
            </span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full px-6 py-12 border-t border-fd-border/20 relative z-10 bg-fd-background/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5 text-xs text-fd-muted-foreground">
            <Layers className="h-4 w-4 text-brand-lime" />
            <span className="font-semibold text-fd-foreground">LinkedIn Job Explorer</span>
            <span className="text-fd-border/40">·</span>
            <span>Built with Fumadocs</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/docs/quickstart" className="text-xs text-fd-muted-foreground hover:text-fd-foreground transition-colors">
              Docs
            </Link>
            <Link href="/docs/gateway/overview" className="text-xs text-fd-muted-foreground hover:text-fd-foreground transition-colors">
              Gateway API
            </Link>
            <Link href="/docs/job-backend/overview" className="text-xs text-fd-muted-foreground hover:text-fd-foreground transition-colors">
              Job Backend
            </Link>
            <Link href="/docs/publisher-backend/overview" className="text-xs text-fd-muted-foreground hover:text-fd-foreground transition-colors">
              Publisher
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
