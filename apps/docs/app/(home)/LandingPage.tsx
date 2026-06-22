"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import {
  Layers, Briefcase, Rocket, ArrowRight,
  Zap, Bot, FileText, Terminal, Globe, RefreshCw,
  ImageIcon, ChevronRight, Database, Cpu, Check, Users,
  Sparkles, AlertCircle, Send, Network, UserSearch, Code2, CheckCircle2,
  ThumbsUp, MessageSquare, Share2, MoreHorizontal, Rss, Code
} from 'lucide-react';
import { translations, type Locale } from './translations';

// A deterministic halftone/dither wave pattern
function WaveDither() {
  const dots = [];
  const rows = 24;
  const cols = 40;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = (c / (cols - 1)) * 600;
      const y = (r / (rows - 1)) * 300;

      const waveValue = Math.sin(x * 0.012) * Math.cos(y * 0.018) + Math.sin((x + y) * 0.006);
      const intensity = (waveValue + 2) / 4;
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

function MountainDither() {
  const dots = [];
  const rows = 20;
  const cols = 45;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = (c / (cols - 1)) * 600;
      const y = (r / (rows - 1)) * 300;

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

function BentoGridFeatures({ lang }: { lang: Locale }) {
  // 1. Resume Match View State
  const [resumeView, setResumeView] = useState<'original' | 'optimized'>('optimized');
  
  // 2. Job Auto-Apply Simulator State
  const [applyState, setApplyState] = useState<'idle' | 'scraping' | 'solving' | 'submitting' | 'success'>('idle');
  const [applyLog, setApplyLog] = useState<string[]>([]);

  // 3. Slide Carousel Compiler State
  const [carouselTheme, setCarouselTheme] = useState<'premium' | 'yellow' | 'purple'>('premium');
  const [currentSlide, setCurrentSlide] = useState(0);

  // 4. Publisher Draft State
  const [postDraft, setPostDraft] = useState(
    lang === 'pt-BR' 
      ? 'Construindo microsserviços resilientes com Next.js App Router, Redis e workers em BullMQ para processamento paralelo.'
      : 'Building resilient microservices using Next.js App Router, Redis, and BullMQ background workers for parallel scaling.'
  );

  // Auto-Apply Simulator Function
  const runApplySimulation = () => {
    if (applyState !== 'idle') return;
    
    setApplyState('scraping');
    setApplyLog(
      lang === 'pt-BR'
        ? ["[14:42:01] Buscando vagas para 'Senior Next.js Developer'...", "↳ Encontrada vaga Easy Apply em Vercel Inc."]
        : ["[14:42:01] Fetching jobs for 'Senior Next.js Developer'...", "↳ Found active Easy Apply listing at Vercel Inc."]
    );

    setTimeout(() => {
      setApplyState('solving');
      setApplyLog(prev => [
        ...prev,
        ...(lang === 'pt-BR'
          ? ["[14:42:03] Fazendo parse do questionário de candidatura...", "↳ Pergunta: 'Quantos anos de Next.js?' -> IA: '5 anos'", "↳ Pergunta: 'Resuma experiência com RSC?' -> IA: 'Migrei arquiteturas legadas...'"]
          : ["[14:42:03] Parsing application form questionnaire...", "↳ Question: 'Years of Next.js exp?' -> AI: '5 years'", "↳ Question: 'Describe RSC exp?' -> AI: 'Migrated legacy architectures...'"])
      ]);

      setTimeout(() => {
        setApplyState('submitting');
        setApplyLog(prev => [
          ...prev,
          ...(lang === 'pt-BR'
            ? ["[14:42:05] Otimizando currículo com Gemini...", "↳ Inserindo palavras-chave: Next.js App Router, BullMQ, Redis", "[14:42:06] Enviando formulário via Voyager API..."]
            : ["[14:42:05] Optimizing CV with Gemini...", "↳ Inserting key phrases: Next.js App Router, BullMQ, Redis", "[14:42:06] Submitting form via Voyager API..."])
        ]);

        setTimeout(() => {
          setApplyState('success');
          setApplyLog(prev => [
            ...prev,
            ...(lang === 'pt-BR'
              ? ["✓ [14:42:07] Candidatura enviada com sucesso!"]
              : ["✓ [14:42:07] Application submitted successfully!"])
          ]);
        }, 1200);
      }, 1500);
    }, 1500);
  };

  const resetApplySimulation = () => {
    setApplyState('idle');
    setApplyLog([]);
  };

  // Carousel slide definitions
  const slides = lang === 'pt-BR' ? [
    {
      title: "Como Criar Carrosséis que Convertem",
      desc: "Use slides dinâmicos e limpos para atrair cliques na timeline do LinkedIn."
    },
    {
      title: "BullMQ & Redis Workers",
      desc: "Processe renders assíncronos de PDFs no backend sem congelar o cliente."
    },
    {
      title: "Resultados com IA",
      desc: "Agregue relevância técnica automática baseada nos seus dados de código."
    }
  ] : [
    {
      title: "How to Build Carousels that Convert",
      desc: "Use clean templates to increase dwell time on the LinkedIn feed."
    },
    {
      title: "BullMQ & Redis Workers",
      desc: "Process async PDF renders on the backend without locking the client thread."
    },
    {
      title: "AI-Generated Relevance",
      desc: "Aggregate direct technical details matching your repository updates."
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch w-full mt-12 relative z-10 text-left">
      
      {/* 1. Job Applier & Loop Simulator (Colspan 7) */}
      <div className="md:col-span-7 group relative overflow-hidden rounded-2xl border border-fd-border/30 bg-fd-card/45 backdrop-blur-md p-6 flex flex-col justify-between hover:border-brand-lime/30 transition-all duration-300 shadow-lg">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-lime/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="h-2 w-2 rounded-full bg-brand-lime animate-pulse" />
            <span className="text-[10px] font-mono font-bold text-brand-lime uppercase tracking-wider">
              {lang === 'pt-BR' ? 'Módulo Applier' : 'Applier Module'}
            </span>
          </div>
          <h3 className="text-xl font-bold text-fd-foreground">
            {lang === 'pt-BR' ? 'Busca e Auto-Candidatura de Vagas' : 'Job Search & Auto-Apply'}
          </h3>
          <p className="text-xs text-fd-muted-foreground mt-1 leading-relaxed">
            {lang === 'pt-BR'
              ? 'Consulte listagens ativas e preencha formulários Easy Apply sem sobrecarga de navegador, rodando workers assíncronos diretamente nas APIs do LinkedIn.'
              : 'Query listings and submit Easy Apply packages without heavy browser processes, running async tasks directly against LinkedIn APIs.'}
          </p>
        </div>

        {/* Live Simulator Viewport */}
        <div className="border border-fd-border/20 rounded-xl bg-fd-background/60 p-4 font-mono text-xs flex flex-col gap-3 min-h-[250px] relative overflow-hidden shadow-inner">
          <div className="flex justify-between items-center pb-2 border-b border-fd-border/15">
            <span className="text-[10px] font-semibold text-fd-muted-foreground flex items-center gap-1.5">
              <Terminal className="size-3.5 text-brand-lime" />
              voyager-apply-worker.log
            </span>
            {applyState === 'idle' ? (
              <button
                onClick={runApplySimulation}
                className="px-2.5 py-1 rounded bg-brand-lime text-black font-sans font-bold text-[10px] transition-transform active:scale-95 cursor-pointer shadow hover:bg-[#d5f002]"
              >
                {lang === 'pt-BR' ? 'Executar Teste' : 'Run Simulator'}
              </button>
            ) : (
              <button
                onClick={resetApplySimulation}
                className="px-2.5 py-1 rounded border border-fd-border bg-fd-muted/30 text-fd-foreground font-sans font-semibold text-[10px] transition-transform active:scale-95 cursor-pointer hover:bg-fd-muted"
              >
                {lang === 'pt-BR' ? 'Resetar' : 'Reset'}
              </button>
            )}
          </div>

          {/* Jobs Feed List */}
          {applyState === 'idle' && (
            <div className="space-y-2 py-1 font-sans">
              <div className="flex justify-between items-center p-2 rounded-lg bg-fd-muted/10 border border-fd-border/10">
                <div>
                  <div className="text-xs font-bold text-fd-foreground">Senior React Developer</div>
                  <div className="text-[10px] text-fd-muted-foreground">Vercel Inc. · Remote</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] bg-brand-lime/10 text-brand-lime border border-brand-lime/20 px-1.5 py-0.5 rounded font-mono">95% match</span>
                  <span className="text-[9px] font-bold uppercase text-fd-muted-foreground font-mono">Idle</span>
                </div>
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg bg-fd-muted/10 border border-fd-border/10">
                <div>
                  <div className="text-xs font-bold text-fd-foreground">TypeScript Compiler Architect</div>
                  <div className="text-[10px] text-fd-muted-foreground">OpenAI · San Francisco</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] bg-brand-lime/10 text-brand-lime border border-brand-lime/20 px-1.5 py-0.5 rounded font-mono">89% match</span>
                  <span className="text-[9px] font-bold uppercase text-fd-muted-foreground font-mono">Idle</span>
                </div>
              </div>
            </div>
          )}

          {/* Simulator Logs Display */}
          {applyState !== 'idle' && (
            <div className="flex-1 overflow-y-auto space-y-1.5 text-[11px] leading-relaxed max-h-[170px] pr-2">
              {applyLog.map((log, index) => (
                <div
                  key={index}
                  className={`pl-3 border-l ${
                    log.startsWith('✓')
                      ? 'border-emerald-500 text-emerald-400 font-bold bg-emerald-500/5 py-1 px-1.5 rounded-r'
                      : log.startsWith('↳')
                      ? 'border-fd-border/20 text-fd-muted-foreground ml-3'
                      : 'border-brand-lime text-slate-300'
                  }`}
                >
                  {log}
                </div>
              ))}
              {applyState !== 'success' && (
                <div className="text-brand-lime text-[11px] pl-3 animate-pulse border-l border-brand-lime">
                  ● {lang === 'pt-BR' ? 'Processando...' : 'Processing...'}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 2. AI Resume Optimizer (Colspan 5) */}
      <div className="md:col-span-5 group relative overflow-hidden rounded-2xl border border-fd-border/30 bg-fd-card/45 backdrop-blur-md p-6 flex flex-col justify-between hover:border-brand-lime/30 transition-all duration-300 shadow-lg">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-lime/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider">
              {lang === 'pt-BR' ? 'Otimização ATS' : 'ATS Optimization'}
            </span>
          </div>
          <h3 className="text-xl font-bold text-fd-foreground">
            {lang === 'pt-BR' ? 'Otimizador de Currículos' : 'AI Resume Optimizer'}
          </h3>
          <p className="text-xs text-fd-muted-foreground mt-1 leading-relaxed">
            {lang === 'pt-BR'
              ? 'Escaneie a descrição de cargos no LinkedIn e reescreva seções ou summaries para atingir compatibilidade máxima de palavras-chave.'
              : 'Scan LinkedIn description requirements to dynamically inject missing technical skills and tailor summary sentences.'}
          </p>
        </div>

        {/* Tailor UI card */}
        <div className="border border-fd-border/20 rounded-xl bg-fd-background/60 p-4 flex flex-col gap-3.5 min-h-[250px] shadow-inner font-sans">
          <div className="flex justify-between items-center pb-2 border-b border-fd-border/15">
            <span className="text-[11px] font-bold text-fd-foreground uppercase font-mono tracking-wide">
              {lang === 'pt-BR' ? 'Análise de ATS' : 'ATS Analysis'}
            </span>
            <div className="flex gap-1.5">
              <button
                onClick={() => setResumeView('original')}
                className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors cursor-pointer ${
                  resumeView === 'original'
                    ? 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                    : 'bg-fd-muted/30 border-fd-border text-fd-muted-foreground hover:text-fd-foreground'
                }`}
              >
                {lang === 'pt-BR' ? 'Original' : 'Original'}
              </button>
              <button
                onClick={() => setResumeView('optimized')}
                className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors cursor-pointer ${
                  resumeView === 'optimized'
                    ? 'bg-brand-lime/10 text-brand-lime border-brand-lime/20'
                    : 'bg-fd-muted/30 border-fd-border text-fd-muted-foreground hover:text-fd-foreground'
                }`}
              >
                {lang === 'pt-BR' ? 'Otimizado' : 'Optimized'}
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-fd-muted-foreground font-mono">{lang === 'pt-BR' ? 'Taxa de Match:' : 'Match Rate:'}</span>
              <span className={`font-mono font-bold ${resumeView === 'original' ? 'text-orange-400' : 'text-emerald-400'}`}>
                {resumeView === 'original' ? '58%' : '94%'}
              </span>
            </div>
            {/* Progress line */}
            <div className="w-full bg-fd-muted/20 border border-fd-border/15 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${resumeView === 'original' ? 'bg-orange-400' : 'bg-brand-lime'}`}
                style={{ width: resumeView === 'original' ? '58%' : '94%' }}
              />
            </div>

            {/* Keyword badges status */}
            <div className="space-y-2 pt-1.5 text-xs text-left">
              <div className="flex justify-between items-center p-2 rounded bg-fd-muted/10 border border-fd-border/5">
                <span className="text-fd-muted-foreground">TypeScript Core</span>
                <span className="text-[10px] font-bold text-emerald-400 font-mono">Matched ✓</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-fd-muted/10 border border-fd-border/5">
                <span className="text-fd-muted-foreground">Redis & BullMQ</span>
                {resumeView === 'original' ? (
                  <span className="text-[10px] font-bold text-orange-400 font-mono">Missing ✗</span>
                ) : (
                  <span className="text-[10px] font-bold text-brand-lime font-mono animate-pulse">[+] Inserted</span>
                )}
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-fd-muted/10 border border-fd-border/5">
                <span className="text-fd-muted-foreground">Next.js Server Actions</span>
                {resumeView === 'original' ? (
                  <span className="text-[10px] font-bold text-orange-400 font-mono">Missing ✗</span>
                ) : (
                  <span className="text-[10px] font-bold text-brand-lime font-mono animate-pulse">[+] Inserted</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. AI Content Publisher (Colspan 5) */}
      <div className="md:col-span-5 group relative overflow-hidden rounded-2xl border border-fd-border/30 bg-fd-card/45 backdrop-blur-md p-6 flex flex-col justify-between hover:border-brand-lime/30 transition-all duration-300 shadow-lg">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-lime/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="h-2 w-2 rounded-full bg-purple-400 animate-pulse" />
            <span className="text-[10px] font-mono font-bold text-purple-400 uppercase tracking-wider">
              {lang === 'pt-BR' ? 'Módulo Publisher' : 'Publisher Module'}
            </span>
          </div>
          <h3 className="text-xl font-bold text-fd-foreground">
            {lang === 'pt-BR' ? 'Criação e Agendamento' : 'AI Post Creator & Scheduler'}
          </h3>
          <p className="text-xs text-fd-muted-foreground mt-1 leading-relaxed">
            {lang === 'pt-BR'
              ? 'Gere posts corporativos elegantes utilizando inteligência contextual e gerencie agendamentos automáticos através de filas Redis robustas.'
              : 'Write tech articles utilizing model prompts and queue auto-scheduling using microservice Redis channels.'}
          </p>
        </div>

        {/* Post editor mockup */}
        <div className="border border-fd-border/20 rounded-xl bg-fd-background/60 p-4 flex flex-col gap-3 min-h-[250px] shadow-inner font-sans">
          <div className="flex justify-between items-center pb-1.5 border-b border-fd-border/15">
            <span className="text-[10px] font-bold text-fd-foreground font-mono flex items-center gap-1">
              <Rss className="size-3 text-purple-400" />
              {lang === 'pt-BR' ? 'agendador-posts.json' : 'scheduler.json'}
            </span>
            <span className="text-[9px] font-bold text-purple-400 uppercase font-mono tracking-wider bg-purple-500/10 border border-purple-500/20 px-1.5 py-0.5 rounded">
              BullMQ Queue
            </span>
          </div>
          <div className="flex-1 flex flex-col gap-2">
            <textarea
              value={postDraft}
              onChange={(e) => setPostDraft(e.target.value)}
              className="w-full flex-1 bg-fd-muted/10 border border-fd-border/15 p-2 rounded-lg text-xs text-slate-300 resize-none font-mono focus:outline-none focus:border-purple-500/40"
            />
            <div className="flex items-center justify-between text-[10px] text-fd-muted-foreground mt-1">
              <span>{postDraft.length} chars</span>
              <span className="text-purple-400 font-semibold font-mono">
                {lang === 'pt-BR' ? '↳ Fila: 1 pendente' : '↳ Queue: 1 pending'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Slide Carousel Creator (Colspan 7) */}
      <div className="md:col-span-7 group relative overflow-hidden rounded-2xl border border-fd-border/30 bg-fd-card/45 backdrop-blur-md p-6 flex flex-col justify-between hover:border-brand-lime/30 transition-all duration-300 shadow-lg">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-lime/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
            <span className="text-[10px] font-mono font-bold text-blue-400 uppercase tracking-wider">
              {lang === 'pt-BR' ? 'Carrossel PDF' : 'Slide Compiler'}
            </span>
          </div>
          <h3 className="text-xl font-bold text-fd-foreground">
            {lang === 'pt-BR' ? 'Compilador de Slides no Grid' : 'Slide PDF Carousel Generator'}
          </h3>
          <p className="text-xs text-fd-muted-foreground mt-1 leading-relaxed">
            {lang === 'pt-BR'
              ? 'Estruture slides de alta conversão diretamente do markdown. Compile e exporte PDFs prontos para a timeline do LinkedIn.'
              : 'Compile highly interactive slideshow carousels from raw configurations. Clean layout matching the monorepos CSS.'}
          </p>
        </div>

        {/* Carousel UI Mockup */}
        <div className="border border-fd-border/20 rounded-xl bg-fd-background/60 p-4 flex flex-col gap-3 min-h-[250px] shadow-inner font-sans">
          <div className="flex justify-between items-center pb-2 border-b border-fd-border/15">
            <span className="text-[10px] font-bold text-fd-foreground font-mono">
              {lang === 'pt-BR' ? 'compilador-slides.pdf' : 'carousel-compiler.pdf'}
            </span>
            <div className="flex gap-1.5">
              {(['premium', 'yellow', 'purple'] as const).map(theme => (
                <button
                  key={theme}
                  onClick={() => setCarouselTheme(theme)}
                  className={`px-1.5 py-0.5 rounded text-[9px] font-bold capitalize border transition-colors cursor-pointer ${
                    carouselTheme === theme
                      ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                      : 'bg-fd-muted/30 border-fd-border text-fd-muted-foreground hover:text-fd-foreground'
                  }`}
                >
                  {theme}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 flex gap-3 items-center justify-between">
            <button
              onClick={() => setCurrentSlide(prev => Math.max(0, prev - 1))}
              disabled={currentSlide === 0}
              className="text-xs text-fd-muted-foreground hover:text-fd-foreground disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer p-1"
            >
              ◀
            </button>

            {/* Slide body card */}
            <div
              className={`flex-1 rounded-lg border p-5 flex flex-col justify-between h-[130px] transition-all duration-300 relative overflow-hidden ${
                carouselTheme === 'premium'
                  ? 'bg-zinc-950 border-white/10 text-white'
                  : carouselTheme === 'yellow'
                  ? 'bg-yellow-400 border-yellow-500 text-black'
                  : 'bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-950 border-purple-500/20 text-white'
              }`}
            >
              <div>
                <div className={`text-[10px] font-bold font-mono tracking-wider uppercase mb-1 ${
                  carouselTheme === 'yellow' ? 'text-black/60' : 'text-brand-lime'
                }`}>
                  SLIDE {currentSlide + 1} / {slides.length}
                </div>
                <h4 className="text-xs font-bold leading-tight">{slides[currentSlide].title}</h4>
              </div>
              <p className={`text-[10px] leading-relaxed ${
                carouselTheme === 'yellow' ? 'text-black/80' : 'text-slate-400'
              }`}>
                {slides[currentSlide].desc}
              </p>
            </div>

            <button
              onClick={() => setCurrentSlide(prev => Math.min(slides.length - 1, prev + 1))}
              disabled={currentSlide === slides.length - 1}
              className="text-xs text-fd-muted-foreground hover:text-fd-foreground disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer p-1"
            >
              ▶
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}

function InteractiveIntegration({ lang }: { lang: Locale }) {
  const [tab, setTab] = useState<'graphql' | 'rest' | 'cli'>('graphql');
  const t = translations[lang].sections.integration;

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
      title: t.graphql.title,
      desc: t.graphql.desc,
      bullets: t.graphql.bullets
    },
    rest: {
      code: `POST /api/jobs/apply
Content-Type: application/json
{
  "jobId": "38290123",
  "resumeId": "current-profile",
  "autoAnswer": true
}`,
      title: t.rest.title,
      desc: t.rest.desc,
      bullets: t.rest.bullets
    },
    cli: {
      code: `# Sync cookie session credentials from extension
pnpm --filter job-backend sync-profile --id user-123

# Launch the publisher generator
pnpm --filter publisher-backend make-carousel --topic "NextJS 15 Tips"`,
      title: t.cli.title,
      desc: t.cli.desc,
      bullets: t.cli.bullets
    }
  };

  const active = contentMap[tab];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch mt-10">
      <div className="lg:col-span-7 relative flex flex-col rounded-xl border border-fd-border/30 bg-fd-card/60 backdrop-blur-md overflow-hidden shadow-xl min-h-[320px]">
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
            onClick={() => navigator.clipboard.writeText(active.code)}
            className="text-[10px] text-fd-foreground border border-fd-border px-2 py-0.5 rounded bg-fd-muted/30 hover:bg-fd-muted transition-all cursor-pointer animate-[pulse_4s_ease-in-out_infinite]"
          >
            Copy
          </button>
        </div>
        <div className="flex-1 p-5 font-mono text-[13px] text-fd-foreground bg-fd-muted/5 overflow-auto text-left leading-relaxed">
          <pre className="whitespace-pre">{active.code}</pre>
        </div>
      </div>
      <div className="lg:col-span-5 flex flex-col justify-between">
        <div>
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
              <li key={idx} className="flex items-start gap-2.5 text-xs text-fd-muted-foreground animate-[fadeIn_0.5s_ease-out]">
                <span className="h-5 w-5 rounded-full bg-brand-lime/10 text-brand-lime flex items-center justify-center shrink-0 mt-0.5 border border-brand-lime/20">
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

export default function LandingPage({ lang }: { lang: 'pt-BR' | 'en' }) {
  const t = translations[lang];

  return (
    <main className="relative flex flex-col items-center overflow-hidden bg-fd-background grain-bg min-h-screen">
      <div className="absolute inset-0 z-0 pointer-events-none bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_30%,#000_70%,transparent_100%)]" />

      <section className="relative w-full px-6 pt-24 pb-20 overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-[-10%] right-[-5%] w-[550px] h-[550px] bg-emerald-500/10 rounded-full blur-[100px]" />
          <div className="absolute top-[20%] right-[10%] w-[450px] h-[450px] bg-orange-500/12 rounded-full blur-[110px]" />
          <div className="absolute top-[5%] left-[5%] w-[350px] h-[350px] bg-brand-lime/5 rounded-full blur-[90px]" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold rounded-full border border-brand-lime/20 bg-brand-lime/5 text-brand-lime mb-8 hover:bg-brand-lime/10 transition-colors cursor-pointer">
              <span className="flex h-1.5 w-1.5 rounded-full bg-brand-lime animate-pulse" />
              {t.hero.badge}
            </div>

            <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-fd-foreground mb-6 leading-[1.08]">
              {t.hero.title1}
              <br />
              <span className="text-[#0077b5] dark:text-[#0077b5]">LinkedIn</span> {t.hero.title2}, <span className="text-brand-lime">{t.hero.title3}</span>.
            </h1>

            <p className="text-base sm:text-lg text-fd-muted-foreground mb-8 max-w-lg leading-relaxed">
              {t.hero.description}
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href={`/docs/${lang}/quickstart`}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-bold text-black bg-brand-lime rounded-full shadow-lg shadow-brand-lime/10 hover:bg-[#d5f002] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer"
              >
                {t.hero.getStarted}
              </Link>
              <Link
                href="https://github.com/juliolimacostavalladares/linkedin-job-applier"
                target="_blank"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold text-fd-foreground bg-fd-card/50 hover:bg-fd-muted border border-fd-border/30 rounded-full transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                {t.hero.openGithub}
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5 relative flex justify-center items-center h-[320px] sm:h-[400px]">
            <div className="w-[280px] sm:w-[360px] h-[280px] sm:h-[360px] relative">
              <div className="absolute inset-0 bg-radial from-blue-500/10 via-transparent to-transparent rounded-full scale-[1.3] blur-xl" />
              <img
                src="/logo.svg"
                alt="LinkedIn Job Explorer Logo"
                className="w-full h-full object-contain animate-[pulse_6s_ease-in-out_infinite] select-none"
              />
            </div>
          </div>
        </div>

        {/* Feature Bento Grid replacing DocsMockup */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-0">
          <BentoGridFeatures lang={lang} />
        </div>
      </section>

      {/* Code Playground Section */}
      <section className="w-full px-6 py-20 border-t border-fd-border/10 bg-fd-muted/5 relative">
        <div className="max-w-6xl mx-auto relative z-10 text-left animate-[fadeIn_0.8s_ease-out]">
          <div className="max-w-4xl">
            <p className="text-xl sm:text-3xl text-fd-foreground leading-snug font-medium mb-8">
              {t.sections.tryItOut.description.split('Developers').map((part, i) => 
                i === 0 ? <span key={i}>{part}<span className="text-brand-lime font-bold">Developers</span></span> : 
                part.split('LinkedIn Voyager APIs').map((p, j) => 
                  j === 0 ? <span key={`${i}-${j}`}>{p}<span className="text-[#0077b5] font-semibold">LinkedIn Voyager APIs</span></span> : p
                )
              )}
            </p>
          </div>
          <InteractiveIntegration lang={lang} />
        </div>
      </section>

      {/* Pipeline steps Section */}
      <section className="w-full px-6 py-12 border-t border-fd-border/10 bg-fd-background relative">
        <div className="max-w-6xl mx-auto relative z-10 text-left">
          <div className="text-left mb-10">
            <span className="text-xs text-brand-lime font-bold uppercase tracking-wider">{t.sections.flow.badge}</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-fd-foreground mt-2">
              {t.sections.flow.title}
            </h2>
            <p className="text-sm text-fd-muted-foreground mt-2 max-w-xl">
              {t.sections.flow.description}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
            {t.sections.flow.steps.map((item, index) => (
              <div key={index} className="p-5 rounded-xl border border-fd-border/20 bg-fd-card/45 backdrop-blur-sm relative hover:border-brand-lime/30 transition-all duration-300">
                <div className="text-[10px] font-mono text-brand-lime font-bold mb-2 flex justify-between items-center">
                  <span>STEP {String(index + 1).padStart(2, '0')}</span>
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

      {/* Architecture Blueprints Section */}
      <section className="w-full px-6 py-20 relative border-t border-fd-border/10">
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-left mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-fd-foreground mb-4">
              {t.sections.architecture.title}
            </h2>
            <p className="text-sm sm:text-base text-fd-muted-foreground max-w-xl leading-relaxed">
              {t.sections.architecture.description}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
            {/* Gateway Card */}
            <div className="md:col-span-7 group relative overflow-hidden rounded-2xl border border-fd-border/30 bg-fd-card/45 backdrop-blur-md p-8 flex flex-col justify-between hover:border-blue-500/30 transition-all duration-300 min-h-[380px]">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div>
                <div className="h-11 w-11 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-6 border border-blue-500/20">
                  <Globe className="h-5 w-5" />
                </div>
                <h3 className="text-2xl font-bold text-fd-foreground mb-3">{t.sections.architecture.gateway.title}</h3>
                <p className="text-sm text-fd-muted-foreground leading-relaxed max-w-md">
                  {t.sections.architecture.gateway.description}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-8">
                <div className="p-3 rounded-lg bg-fd-muted/20 border border-fd-border/10 text-xs">
                  <span className="font-semibold text-fd-foreground block">{t.sections.architecture.gateway.features.graphql.title}</span>
                  <span className="text-fd-muted-foreground">{t.sections.architecture.gateway.features.graphql.desc}</span>
                </div>
                <div className="p-3 rounded-lg bg-fd-muted/20 border border-fd-border/10 text-xs">
                  <span className="font-semibold text-fd-foreground block">{t.sections.architecture.gateway.features.rest.title}</span>
                  <span className="text-fd-muted-foreground">{t.sections.architecture.gateway.features.rest.desc}</span>
                </div>
              </div>
            </div>

            {/* Job Backend Card */}
            <Link
              href={`/docs/${lang}/job-backend/overview`}
              className="md:col-span-5 group relative overflow-hidden rounded-2xl border border-fd-border/30 bg-fd-card/45 backdrop-blur-md p-8 flex flex-col justify-between hover:border-emerald-500/30 transition-all duration-300 min-h-[380px] cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div>
                <div className="h-11 w-11 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-6 border border-emerald-500/20 group-hover:scale-105 transition-transform">
                  <Bot className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-bold text-fd-foreground mb-3">{t.sections.architecture.jobBackend.title}</h3>
                <p className="text-sm text-fd-muted-foreground leading-relaxed">
                  {t.sections.architecture.jobBackend.description}
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold mt-6">
                {t.sections.architecture.jobBackend.cta}
                <ArrowRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Publisher Card */}
            <Link
              href={`/docs/${lang}/publisher-backend/overview`}
              className="md:col-span-5 group relative overflow-hidden rounded-2xl border border-fd-border/30 bg-fd-card/45 backdrop-blur-md p-8 flex flex-col justify-between hover:border-violet-500/30 transition-all duration-300 min-h-[340px] cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div>
                <div className="h-11 w-11 rounded-xl bg-violet-500/10 text-violet-400 flex items-center justify-center mb-6 border border-violet-500/20 group-hover:scale-105 transition-transform">
                  <ImageIcon className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-bold text-fd-foreground mb-3">{t.sections.architecture.publisher.title}</h3>
                <p className="text-sm text-fd-muted-foreground leading-relaxed">
                  {t.sections.architecture.publisher.description}
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-violet-400 font-semibold mt-6">
                {t.sections.architecture.publisher.cta}
                <ArrowRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Extension Card */}
            <Link
              href={`/docs/${lang}/extension`}
              className="md:col-span-7 group relative overflow-hidden rounded-2xl border border-fd-border/30 bg-fd-card/45 backdrop-blur-md p-8 flex flex-col justify-between hover:border-brand-lime/30 transition-all duration-300 min-h-[340px] cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-brand-lime/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div>
                <div className="h-11 w-11 rounded-xl bg-brand-lime/10 text-brand-lime flex items-center justify-center mb-6 border border-brand-lime/20 group-hover:scale-105 transition-transform">
                  <Zap className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-bold text-fd-foreground mb-3">{t.sections.architecture.extension.title}</h3>
                <p className="text-sm text-fd-muted-foreground leading-relaxed">
                  {t.sections.architecture.extension.description}
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-brand-lime font-semibold mt-6">
                {t.sections.architecture.extension.cta}
                <ArrowRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="w-full px-6 py-12 border-t border-fd-border/10 bg-fd-background relative z-10 text-left">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5 text-xs text-fd-muted-foreground">
            <Layers className="h-4 w-4 text-brand-lime" />
            <span className="font-bold text-fd-foreground">LinkedIn Job Explorer</span>
            <span className="text-fd-border/30">·</span>
            <span>{t.sections.footer.built}</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href={`/docs/${lang}/quickstart`} className="text-xs text-fd-muted-foreground hover:text-brand-lime transition-colors">
              {t.sections.footer.links.docs}
            </Link>
            <Link href={`/docs/${lang}/job-backend/overview`} className="text-xs text-fd-muted-foreground hover:text-brand-lime transition-colors">
              {t.sections.footer.links.gateway}
            </Link>
            <Link href={`/docs/${lang}/job-backend/overview`} className="text-xs text-fd-muted-foreground hover:text-brand-lime transition-colors">
              {t.sections.footer.links.jobBackend}
            </Link>
            <Link href={`/docs/${lang}/publisher-backend/overview`} className="text-xs text-fd-muted-foreground hover:text-brand-lime transition-colors">
              {t.sections.footer.links.publisher}
            </Link>
          </div>
        </div>
      </footer>

    </main>
  );
}
