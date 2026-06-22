"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import {
  Layers, Briefcase, Rocket, ArrowRight,
  Zap, Bot, FileText, Terminal, Globe, RefreshCw,
  ImageIcon, ChevronRight, Database, Cpu, Check, Users,
  Search, Play, AlertCircle, ShieldAlert, Award,
  ThumbsUp, MessageSquare, Share2, Send, Bookmark, MoreHorizontal, Sparkles,
  PenTool, BookOpen, FileCheck2, Rss, Network, UserSearch, Code2, CheckCircle2,
  Code
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

// A beautiful, interactive bento grid showing the 4 features
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

// State-driven Interactive Playground component showing API integration
function InteractiveIntegration({ lang }: { lang: Locale }) {
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
      title: lang === 'pt-BR' 
        ? "Consultar listas de vagas via Gateway GraphQL" 
        : "Query job lists via GraphQL Gateway",
      desc: lang === 'pt-BR'
        ? "Use consultas GraphQL limpas para buscar dados estruturados em todos os serviços LinkedIn. O gateway agrega perfis, candidaturas e postagens em um único schema."
        : "Use clean GraphQL queries to fetch structured data across all LinkedIn services. The gateway aggregates profiles, applications, and postings into a single schema.",
      bullets: lang === 'pt-BR' ? [
        "Schema GraphQL consolidado para todas as APIs backend",
        "Tipagem forte e arquivos de schema TypeScript auto-gerados",
        "Busque relações aninhadas (Vaga -> Empresa -> URL de Candidatura) em uma única requisição"
      ] : [
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
      title: lang === 'pt-BR'
        ? "Endpoint REST para envio automático de candidaturas"
        : "REST endpoint for auto application submissions",
      desc: lang === 'pt-BR'
        ? "Acione jobs de preenchimento automático de formulários programaticamente. Envie um ID de vaga, especifique seus parâmetros de perfil, e deixe as filas em background lidarem com navegação e respostas de formulários."
        : "Trigger AI form-filling jobs programmatically. Send a job ID, specify your profile parameters, and let the background queues handle form navigation and answers.",
      bullets: lang === 'pt-BR' ? [
        "Processamento de candidaturas em fila com persistência SQLite",
        "Engine de parsing de questões contextuais com Gemini/Claude",
        "Respostas REST abrangentes para depuração de integração"
      ] : [
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
      title: lang === 'pt-BR'
        ? "Comandos CLI de Automação"
        : "CLI Automation commands",
      desc: lang === 'pt-BR'
        ? "Execute tarefas administrativas rápidas, atualize credenciais de perfil, teste prompts e acione gerações de conteúdo manuais com facilidade."
        : "Perform quick administrative tasks, update profile credentials, test prompts, and trigger manual content generations with ease.",
      bullets: lang === 'pt-BR' ? [
        "Sintaxe CLI unificada via scripts pnpm",
        "Ferramentas fáceis para desenvolvedores para migrações de banco de dados e sincronização openapi",
        "Execute módulos de microsserviços individuais sozinhos ou em combinação"
      ] : [
        "Unified CLI syntax via pnpm scripts",
        "Easy developer tooling for database migrations and openapi sync",
        "Run individual microservice modules standalone or in combination"
      ]
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
              <li key={idx} className="flex items-start gap-2.5 text-xs text-fd-muted-foreground">
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
  const text = translations[lang];

  const workflowSteps = [
    {
      icon: <Network className="h-5 w-5 text-brand-lime" />,
      title: text.workflow.steps.sync.title,
      description: text.workflow.steps.sync.desc
    },
    {
      icon: <Search className="h-5 w-5 text-brand-lime" />,
      title: text.workflow.steps.search.title,
      description: text.workflow.steps.search.desc
    },
    {
      icon: <PenTool className="h-5 w-5 text-brand-lime" />,
      title: text.workflow.steps.match.title,
      description: text.workflow.steps.match.desc
    },
    {
      icon: <Send className="h-5 w-5 text-brand-lime" />,
      title: text.workflow.steps.submit.title,
      description: text.workflow.steps.submit.desc
    },
    {
      icon: <Layers className="h-5 w-5 text-brand-lime" />,
      title: text.workflow.steps.track.title,
      description: text.workflow.steps.track.desc
    }
  ];

  const packages = [
    {
      title: text.audiences.jobSeekers.title,
      icon: <UserSearch className="h-6 w-6 text-brand-lime" />,
      color: "brand-lime",
      features: [
        text.audiences.jobSeekers.f1,
        text.audiences.jobSeekers.f2,
        text.audiences.jobSeekers.f3
      ]
    },
    {
      title: text.audiences.creators.title,
      icon: <PenTool className="h-6 w-6 text-purple-400" />,
      color: "purple",
      popular: true,
      features: [
        text.audiences.creators.f1,
        text.audiences.creators.f2,
        text.audiences.creators.f3
      ]
    },
    {
      title: text.audiences.developers.title,
      icon: <Code2 className="h-6 w-6 text-emerald-400" />,
      color: "emerald",
      features: [
        text.audiences.developers.f1,
        text.audiences.developers.f2,
        text.audiences.developers.f3
      ]
    }
  ];

  return (
    <main className="relative flex flex-col items-center overflow-hidden bg-fd-background grain-bg min-h-screen w-full pt-16">
      {/* Grid mask overlay */}
      <div className="absolute inset-0 z-0 pointer-events-none bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_30%,#000_70%,transparent_100%)]" />

      {/* Background glowing blobs */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-5%] right-[-5%] w-[550px] h-[550px] bg-emerald-500/10 rounded-full blur-[100px]" />
        <div className="absolute top-[15%] right-[10%] w-[450px] h-[450px] bg-orange-500/12 rounded-full blur-[110px]" />
        <div className="absolute top-[5%] left-[5%] w-[350px] h-[350px] bg-brand-lime/5 rounded-full blur-[90px]" />
      </div>

      {/* Hero Section */}
      <section className="relative w-full px-6 pt-20 pb-16 overflow-hidden z-10">
        <div className="max-w-6xl mx-auto flex flex-col items-center text-center">
          {/* Announcement Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-lime/20 bg-brand-lime/5 px-3.5 py-1.5 text-xs text-brand-lime mb-8 hover:bg-brand-lime/10 transition-colors cursor-pointer">
            <span className="flex h-1.5 w-1.5 rounded-full bg-brand-lime animate-pulse"></span>
            <span className="font-semibold text-brand-lime">{text.hero.badge}</span>
          </div>

          {/* Title */}
          <h1 className="mx-auto max-w-4xl font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-fd-foreground leading-[1.05] mb-8">
            {text.hero.titleNormal}{' '}
            <span className="text-brand-lime">
              {text.hero.titleHighlight}
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mx-auto max-w-2xl text-sm sm:text-base md:text-lg text-fd-muted-foreground leading-relaxed mb-10">
            {text.hero.subtitle}
          </p>

          {/* CTA Actions */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 w-full sm:w-auto">
            <Link
              href={`/docs/${lang}/quickstart`}
              className="w-full sm:w-auto group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-brand-lime px-8 py-3.5 font-bold text-black shadow-lg shadow-brand-lime/15 transition-transform active:scale-95 hover:bg-[#d5f002] hover:scale-[1.02]"
            >
              <span className="flex items-center gap-2">
                {text.hero.ctaPrimary}
                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
            <Link
              href={`/docs/${lang}/quickstart`}
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-full border border-fd-border bg-fd-card/50 px-8 py-3.5 font-semibold text-fd-foreground transition-colors hover:bg-fd-muted hover:scale-[1.02] active:scale-95"
            >
              {text.hero.ctaSecondary}
            </Link>
          </div>
        </div>

        {/* Feature Bento Grid replacing original mockup dashboard */}
        <div className="max-w-6xl mx-auto px-4 sm:px-0">
          <BentoGridFeatures lang={lang} />
        </div>
      </section>

      {/* EcosystemFeatures Section */}
      <section id="features" className="w-full px-6 py-24 border-t border-fd-border/10 bg-fd-muted/5 z-10 relative">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16 text-left">
            <h2 className="font-display text-3xl font-bold tracking-tight text-fd-foreground sm:text-4xl mb-4">
              {text.features.title}
            </h2>
            <p className="max-w-2xl text-sm sm:text-base text-fd-muted-foreground leading-relaxed">
              {text.features.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Job Applier */}
            <div className="group flex flex-col rounded-3xl border border-fd-border/30 bg-fd-card/45 backdrop-blur-md p-8 hover:bg-fd-card/60 transition-all duration-300 relative overflow-hidden col-span-1 md:col-span-2 shadow-sm hover:border-brand-lime/30">
              <div className="absolute inset-0 bg-gradient-to-br from-brand-lime/0 via-transparent to-emerald-500/0 group-hover:from-brand-lime/5 group-hover:to-emerald-500/5 transition-all duration-500" />
              <div className="relative z-10 text-left">
                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-lime/10 border border-brand-lime/20">
                  <Bot className="h-6 w-6 text-brand-lime" />
                </div>
                <h3 className="font-display text-xl font-bold text-fd-foreground mb-3">
                  {text.features.jobApplier.title}
                </h3>
                <p className="text-fd-muted-foreground mb-6 flex-1 text-sm leading-relaxed">
                  {text.features.jobApplier.desc}
                </p>
                <div className="flex flex-wrap gap-2 mb-2">
                  {text.features.jobApplier.tags.map((tag, tIdx) => (
                    <span key={tIdx} className="inline-flex rounded-md bg-fd-muted px-2 py-1 text-xs text-fd-foreground border border-fd-border/10 font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Visual for Job Applier */}
              <div className="mt-6 flex flex-col gap-3 h-full justify-end border-t border-fd-border/15 pt-6 text-left">
                <div className="flex items-center justify-between rounded-lg bg-fd-background/80 border border-fd-border/10 p-3">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded bg-brand-lime/10 flex items-center justify-center shrink-0 border border-brand-lime/25">
                      <FileCheck2 className="h-4 w-4 text-brand-lime" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-fd-foreground truncate">
                        {text.features.jobApplier.visual.jobTitle}
                      </div>
                      <div className="text-xs text-fd-muted-foreground truncate">
                        {text.features.jobApplier.visual.company}
                      </div>
                    </div>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-400 border border-emerald-500/20 shrink-0">
                    {text.features.jobApplier.visual.applied}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-fd-background/80 border border-fd-border/10 p-3">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded bg-purple-500/10 flex items-center justify-center shrink-0 border border-purple-500/25">
                      <Sparkles className="h-4 w-4 text-purple-400" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-fd-foreground truncate">
                        {text.features.jobApplier.visual.adjusting}
                      </div>
                      <div className="text-xs text-fd-muted-foreground truncate">
                        {text.features.jobApplier.visual.prompting}
                      </div>
                    </div>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-semibold text-blue-400 border border-blue-500/20 animate-pulse shrink-0">
                    {text.features.jobApplier.visual.processing}
                  </span>
                </div>
              </div>
            </div>

            {/* Card 2: Publisher */}
            <div className="group flex flex-col rounded-3xl border border-fd-border/30 bg-fd-card/45 backdrop-blur-md p-8 hover:bg-fd-card/60 transition-all duration-300 relative overflow-hidden col-span-1 shadow-sm hover:border-brand-lime/30">
              <div className="absolute inset-0 bg-gradient-to-br from-brand-lime/0 via-transparent to-purple-500/0 group-hover:from-brand-lime/5 group-hover:to-purple-500/5 transition-all duration-500" />
              <div className="relative z-10 text-left">
                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 border border-purple-500/20">
                  <PenTool className="h-6 w-6 text-purple-400" />
                </div>
                <h3 className="font-display text-xl font-bold text-fd-foreground mb-3">
                  {text.features.publisher.title}
                </h3>
                <p className="text-fd-muted-foreground mb-6 flex-1 text-sm leading-relaxed">
                  {text.features.publisher.desc}
                </p>
                <div className="flex flex-wrap gap-2 mb-2">
                  {text.features.publisher.tags.map((tag, tIdx) => (
                    <span key={tIdx} className="inline-flex rounded-md bg-fd-muted px-2 py-1 text-xs text-fd-foreground border border-fd-border/10 font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Visual for Publisher */}
              <div className="mt-6 h-full flex flex-col gap-2 rounded-lg border border-fd-border/15 bg-fd-background/80 overflow-hidden text-sm text-left">
                <div className="flex items-center gap-2 border-b border-fd-border/15 bg-fd-muted/30 px-3 py-2">
                  <Rss className="h-3.5 w-3.5 text-fd-muted-foreground shrink-0" />
                  <span className="text-xs text-fd-muted-foreground truncate">
                    {text.features.publisher.visual.scheduled}
                  </span>
                </div>
                <div className="p-3">
                  <div className="h-2 w-3/4 rounded-full bg-fd-muted-foreground/20 mb-2" />
                  <div className="h-2 w-full rounded-full bg-fd-muted-foreground/10 mb-2" />
                  <div className="h-2 w-5/6 rounded-full bg-fd-muted-foreground/10 mb-4" />
                  <div className="rounded bg-fd-background p-2 font-mono text-[10px] text-fd-muted-foreground border border-fd-border/10">
                    <span className="text-purple-400">const</span> optimize = () {'=>'} {'{'} ... {'}'}
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3: Documentation Hub */}
            <div className="group flex flex-col rounded-3xl border border-fd-border/30 bg-fd-card/45 backdrop-blur-md p-8 hover:bg-fd-card/60 transition-all duration-300 relative overflow-hidden col-span-1 md:col-span-3 shadow-sm hover:border-brand-lime/30">
              <div className="absolute inset-0 bg-gradient-to-br from-brand-lime/0 via-transparent to-indigo-500/0 group-hover:from-brand-lime/5 group-hover:to-indigo-500/5 transition-all duration-500" />
              <div className="relative z-10 text-left">
                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <BookOpen className="h-6 w-6 text-emerald-400" />
                </div>
                <h3 className="font-display text-xl font-bold text-fd-foreground mb-3">
                  {text.features.docsHub.title}
                </h3>
                <p className="text-fd-muted-foreground mb-6 flex-1 text-sm leading-relaxed">
                  {text.features.docsHub.desc}
                </p>
                <div className="flex flex-wrap gap-2 mb-2">
                  {text.features.docsHub.tags.map((tag, tIdx) => (
                    <span key={tIdx} className="inline-flex rounded-md bg-fd-muted px-2 py-1 text-xs text-fd-foreground border border-fd-border/10 font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Visual for Documentation Hub */}
              <div className="mt-6 flex flex-col sm:flex-row gap-4 flex-1 w-full border-t border-fd-border/15 pt-6 text-left">
                <div className="w-full sm:w-64 flex flex-col gap-2">
                  <div className="text-xs font-semibold text-fd-muted-foreground uppercase tracking-wider mb-1">
                    {text.features.docsHub.visual.ref}
                  </div>
                  <div className="flex items-center gap-2 rounded bg-fd-muted/20 px-2 py-1.5 text-xs font-semibold text-fd-foreground border border-fd-border/10 hover:bg-fd-muted transition-colors">
                    <span className="text-[10px] font-bold text-blue-400 shrink-0">POST</span> /apply
                  </div>
                  <div className="flex items-center gap-2 rounded bg-fd-muted/20 px-2 py-1.5 text-xs font-semibold text-fd-foreground border border-fd-border/10 hover:bg-fd-muted transition-colors">
                    <span className="text-[10px] font-bold text-green-400 shrink-0">GET</span> /jobs
                  </div>
                  <div className="flex items-center gap-2 rounded bg-fd-muted/20 px-2 py-1.5 text-xs font-semibold text-fd-foreground border border-fd-border/10 hover:bg-fd-muted transition-colors">
                    <span className="text-[10px] font-bold text-blue-400 shrink-0">POST</span> /publish
                  </div>
                </div>
                <div className="flex-1 rounded-lg border border-fd-border/15 bg-fd-background/80 p-4 font-mono text-xs shadow-inner overflow-hidden">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Terminal className="h-4 w-4 text-brand-lime" />
                      <span className="text-fd-foreground text-xs font-bold">
                        {text.features.docsHub.visual.reqExample}
                      </span>
                    </div>
                    <button className="text-[10px] font-semibold text-fd-muted-foreground hover:text-fd-foreground hover:bg-fd-muted px-2.5 py-0.5 rounded border border-fd-border/10 transition-colors cursor-pointer">
                      {text.features.docsHub.visual.copy}
                    </button>
                  </div>
                  <div className="text-fd-muted-foreground leading-relaxed overflow-x-auto whitespace-pre">
                    <span className="text-purple-400 font-semibold">mutation</span> {'{'} <br />
                    &nbsp;&nbsp;applyToJob( <br />
                    &nbsp;&nbsp;&nbsp;&nbsp;jobUrl: <span className="text-orange-300">"https://linkedin.com/..."</span><br />
                    &nbsp;&nbsp;&nbsp;&nbsp;useAI: <span className="text-blue-300">true</span><br />
                    &nbsp;&nbsp;) {'{'} <br />
                    &nbsp;&nbsp;&nbsp;&nbsp;status <br />
                    &nbsp;&nbsp;&nbsp;&nbsp;applicationId <br />
                    &nbsp;&nbsp;{'}'} <br />
                    {'}'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Code Playground Section (InteractiveIntegration) */}
      <section className="w-full px-6 py-20 border-t border-fd-border/10 bg-fd-muted/5 relative">
        <div className="max-w-6xl mx-auto relative z-10 text-left">
          <InteractiveIntegration lang={lang} />
        </div>
      </section>

      {/* DeepBrief Workflow Section */}
      <section id="workflow" className="w-full py-24 border-t border-fd-border/10 bg-fd-background relative overflow-hidden z-10">
        <div className="mx-auto max-w-6xl px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="text-left">
              <h2 className="font-display text-3xl font-bold tracking-tight text-fd-foreground sm:text-4xl mb-6">
                {text.workflow.title}
              </h2>
              <p className="text-sm sm:text-base text-fd-muted-foreground mb-10 leading-relaxed">
                {text.workflow.subtitle}
              </p>

              <div className="space-y-8">
                {workflowSteps.map((step, idx) => (
                  <div key={idx} className="flex gap-4 relative transition-all duration-300 hover:translate-x-0.5">
                    {/* Connection Line */}
                    {idx !== workflowSteps.length - 1 && (
                      <div className="absolute left-6 top-10 bottom-[-2rem] w-px bg-fd-border/20" />
                    )}

                    <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-brand-lime/25 bg-brand-lime/5 text-brand-lime shadow-sm">
                      {step.icon}
                    </div>
                    <div className="pt-1 text-left">
                      <h4 className="text-base font-semibold text-fd-foreground mb-1">{step.title}</h4>
                      <p className="text-xs sm:text-sm text-fd-muted-foreground leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Simulated Live Logs terminal panel */}
            <div className="flex flex-col rounded-2xl border border-fd-border/30 bg-fd-card/45 backdrop-blur-md overflow-hidden shadow-2xl h-[420px] text-left">
              <div className="flex items-center justify-between border-b border-fd-border/20 bg-fd-muted/30 px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
                </div>
                <span className="text-[10px] text-fd-muted-foreground font-mono">
                  {text.workflow.log.title}
                </span>
              </div>
              <div className="flex-1 p-5 font-mono text-[11px] text-fd-foreground bg-fd-muted/5 space-y-2 overflow-y-auto leading-relaxed shadow-inner">
                <div className="text-fd-muted-foreground">{text.workflow.log.l1}</div>
                <div className="text-emerald-400 font-medium">{text.workflow.log.l2}</div>
                <div className="text-fd-muted-foreground pl-3">{text.workflow.log.l2_sub}</div>
                <div className="text-brand-lime animate-pulse">{text.workflow.log.l3}</div>
                <div className="text-fd-muted-foreground pl-3">{text.workflow.log.l3_sub1}</div>
                <div className="text-fd-muted-foreground pl-3">{text.workflow.log.l3_sub2}</div>
                <div className="text-emerald-400 font-semibold">{text.workflow.log.l4}</div>
                <div className="text-emerald-400/80 font-bold bg-emerald-500/5 py-0.5 px-2 rounded-md max-w-fit">{text.workflow.log.l4_sub}</div>
                <div className="text-brand-lime animate-pulse">{text.workflow.log.l5}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Audiences Section */}
      <section id="audiences" className="w-full px-6 py-24 relative border-t border-fd-border/10 bg-fd-muted/5 z-10">
        <div className="mx-auto max-w-6xl relative z-10">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl font-bold tracking-tight text-fd-foreground sm:text-4xl mb-4">
              {text.audiences.title}
            </h2>
            <p className="mx-auto max-w-2xl text-sm sm:text-base text-fd-muted-foreground leading-relaxed">
              {text.audiences.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            {packages.map((pkg, idx) => (
              <div
                key={idx}
                className={`relative rounded-3xl border transition-all duration-300 hover:scale-[1.01] ${
                  pkg.popular
                    ? 'border-brand-lime bg-brand-lime/[0.03] shadow-brand-lime/5 shadow-lg'
                    : 'border-fd-border/20 bg-fd-card/45 backdrop-blur-sm'
                } p-8 flex flex-col justify-between`}
              >
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-lime px-3.5 py-1 text-[10px] font-bold text-black uppercase tracking-wider shadow-md">
                    {text.audiences.popularBadge}
                  </div>
                )}

                <div>
                  <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-fd-muted border border-fd-border/10 shadow-sm">
                    {pkg.icon}
                  </div>

                  <h3 className="font-display text-lg font-bold text-fd-foreground mb-6">
                    {pkg.title}
                  </h3>

                  <ul className="space-y-4 mb-8">
                    {pkg.features.map((feature, fIdx) => (
                      <li key={fIdx} className="flex gap-3 items-start text-xs sm:text-sm text-fd-muted-foreground">
                        <CheckCircle2 className="h-4.5 w-4.5 shrink-0 text-brand-lime" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  href={`/docs/${lang}/quickstart`}
                  className={`w-full rounded-full py-2.5 text-center text-xs font-bold tracking-wide transition-all border ${
                    pkg.popular
                      ? 'bg-brand-lime text-black border-brand-lime hover:bg-[#d5f002]'
                      : 'bg-fd-muted/30 border-fd-border text-fd-foreground hover:bg-fd-muted'
                  }`}
                >
                  {text.audiences.exploreBtn}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="w-full px-6 py-16 border-t border-fd-border/10 relative z-10 bg-fd-background text-left">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2.5 text-xs text-fd-muted-foreground">
              <Layers className="h-5 w-5 text-brand-lime" />
              <span className="font-bold text-fd-foreground text-sm">LinkedIn Job Explorer</span>
            </div>
            <p className="text-xs text-fd-muted-foreground max-w-sm leading-relaxed">
              {text.footer.desc}
            </p>
          </div>
          <div className="flex flex-wrap gap-x-8 gap-y-4 justify-center md:justify-end text-xs text-fd-muted-foreground font-medium">
            <Link href={`/docs/${lang}/quickstart`} className="hover:text-brand-lime transition-colors">
              {text.footer.links.docs}
            </Link>
            <Link href={`/docs/${lang}/job-backend/overview`} className="hover:text-brand-lime transition-colors">
              {text.footer.links.gateway}
            </Link>
            <Link href={`/docs/${lang}/job-backend/overview`} className="hover:text-brand-lime transition-colors">
              {text.footer.links.jobBackend}
            </Link>
            <Link href={`/docs/${lang}/publisher-backend/overview`} className="hover:text-brand-lime transition-colors">
              {text.footer.links.publisher}
            </Link>
          </div>
        </div>

        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between pt-8 mt-8 border-t border-fd-border/10 text-[11px] text-fd-muted-foreground gap-4">
          <p>{text.footer.rights}</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-fd-foreground transition-colors">
              {text.footer.privacy}
            </a>
            <a href="#" className="hover:text-fd-foreground transition-colors">
              {text.footer.terms}
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
