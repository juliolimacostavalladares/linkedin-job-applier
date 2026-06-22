"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import {
  Layers, Briefcase, Rocket, ArrowRight,
  Zap, Bot, FileText, Terminal, Globe, RefreshCw,
  ImageIcon, ChevronLeft, ChevronRight, Database, Cpu, Check, Users,
  Search, Play, AlertCircle, ShieldAlert, Award,
  ThumbsUp, MessageSquare, Share2, Send, Bookmark, MoreHorizontal, Sparkles,
  PenTool, BookOpen, FileCheck2, Rss, Network, UserSearch, Code2, CheckCircle2,
  Code
} from 'lucide-react';
import { translations, type Locale } from './translations';

// A professional network node graph visualization (Rebranding instead of generic waves)
function NetworkNodesDither() {
  const points = [
    { x: 40, y: 70, r: 4 },
    { x: 130, y: 140, r: 3 },
    { x: 210, y: 60, r: 5 },
    { x: 290, y: 190, r: 3.5 },
    { x: 370, y: 80, r: 4 },
    { x: 440, y: 150, r: 3 },
    { x: 520, y: 90, r: 5 },
    { x: 570, y: 210, r: 4 },
    { x: 90, y: 210, r: 3 },
    { x: 190, y: 250, r: 4 },
    { x: 410, y: 240, r: 3.5 },
  ];

  const connections = [
    [0, 1], [0, 2], [1, 2], [1, 3], [2, 4], [3, 4], [3, 5], [4, 6], [5, 6], [5, 7], [6, 7],
    [1, 8], [8, 9], [3, 9], [5, 10], [7, 10]
  ];

  return (
    <svg viewBox="0 0 600 300" className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none z-0">
      {connections.map(([i, j], idx) => (
        <line
          key={`line-${idx}`}
          x1={points[i].x}
          y1={points[i].y}
          x2={points[j].x}
          y2={points[j].y}
          className="stroke-[#70b5f9]/20"
          strokeWidth="1.2"
        />
      ))}
      {points.map((pt, idx) => (
        <circle
          key={`pt-${idx}`}
          cx={pt.x}
          cy={pt.y}
          r={pt.r}
          className="fill-[#70b5f9]/50 animate-[pulse_4s_ease-in-out_infinite]"
        />
      ))}
    </svg>
  );
}

// A beautiful, interactive bento grid showing the 4 features matching LinkedIn styling
function BentoGridFeatures({ lang }: { lang: Locale }) {
  // 1. Resume Match View State
  const [resumeView, setResumeView] = useState<'original' | 'optimized'>('optimized');
  
  // 2. Job Auto-Apply Simulator State
  const [applyState, setApplyState] = useState<'idle' | 'scraping' | 'solving' | 'submitting' | 'success'>('idle');
  const [selectedMockJob, setSelectedMockJob] = useState(0);
  const [typedAnswers, setTypedAnswers] = useState<{ q1: string; q2: string }>({ q1: '', q2: '' });

  // 3. Post Creator State
  const [showAiAssistant, setShowAiAssistant] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [postDraft, setPostDraft] = useState(
    lang === 'pt-BR' 
      ? 'Construindo microsserviços resilientes com Next.js App Router, Redis e workers em BullMQ para processamento paralelo.'
      : 'Building resilient microservices using Next.js App Router, Redis, and BullMQ background workers for parallel scaling.'
  );
  const [carouselPdfAdded, setCarouselPdfAdded] = useState(false);

  // 4. Slide Feed Carousel Preview State
  const [currentSlide, setCurrentSlide] = useState(0);

  const mockJobs = [
    {
      title: "Senior Next.js Developer",
      company: "Vercel Inc.",
      location: "Remote",
      match: "95%",
      q1: lang === 'pt-BR' ? "Anos de experiência com React/Next.js?" : "Years of Next.js experience?",
      a1: lang === 'pt-BR' ? "5 anos liderando projetos e migrando arquiteturas SPA para Server Components." : "5 years leading projects and migrating legacy architectures to Server Components.",
      q2: lang === 'pt-BR' ? "Descreva experiência com RSCs." : "Describe experience with RSCs.",
      a2: lang === 'pt-BR' ? "Reduzi o TTFB em 40% aplicando Server Components e rotas dinâmicas." : "Reduced TTFB by 40% utilizing Server Components and dynamic route parameters."
    },
    {
      title: "TypeScript Compiler Architect",
      company: "OpenAI",
      location: "San Francisco",
      match: "89%",
      q1: lang === 'pt-BR' ? "Experiência com compiladores ou AST?" : "AST or compiler experience?",
      a1: lang === 'pt-BR' ? "Desenvolvi plugins de lint internos e analisadores estáticos baseados em TypeScript AST." : "Created internal lint plugins and static analyzers based on TypeScript AST structures.",
      q2: lang === 'pt-BR' ? "Por que strict typing em pipelines?" : "Why strict typing in pipelines?",
      a2: lang === 'pt-BR' ? "Para garantir validação de dados em runtime de payloads de modelos com zero drift." : "To guarantee runtime validation of model payload outputs with zero type drift."
    },
    {
      title: "Full Stack Engineer (Node & Redis)",
      company: "Stripe",
      location: "Remote (USA)",
      match: "92%",
      q1: lang === 'pt-BR' ? "Experiência com BullMQ e Redis?" : "BullMQ and Redis experience?",
      a1: lang === 'pt-BR' ? "Gerenciei filas distribuidas para concorrência de 10k RPS em transações financeiras." : "Managed distributed queues processing 10k RPS concurrency for transaction pipelines.",
      q2: lang === 'pt-BR' ? "Descreva manipulação de webhooks." : "Describe webhooks handling.",
      a2: lang === 'pt-BR' ? "Implementei regras de idempotência em Redis para evitar duplicidade de pagamentos." : "Implemented strict idempotency checks in Redis to prevent double charge submissions."
    }
  ];

  // Auto-Apply Simulator Function
  const runApplySimulation = () => {
    if (applyState !== 'idle') return;
    
    setApplyState('scraping');
    setTypedAnswers({ q1: '', q2: '' });

    setTimeout(() => {
      setApplyState('solving');
      
      // Simulate typing answers
      let index1 = 0;
      const targetA1 = mockJobs[selectedMockJob].a1;
      const typeQ1 = () => {
        if (index1 <= targetA1.length) {
          setTypedAnswers(prev => ({ ...prev, q1: targetA1.slice(0, index1) }));
          index1++;
          setTimeout(typeQ1, 15);
        } else {
          // Start typing Q2 after Q1 is done
          setTimeout(() => {
            let index2 = 0;
            const targetA2 = mockJobs[selectedMockJob].a2;
            const typeQ2 = () => {
              if (index2 <= targetA2.length) {
                setTypedAnswers(prev => ({ ...prev, q2: targetA2.slice(0, index2) }));
                index2++;
                setTimeout(typeQ2, 15);
              } else {
                // Done answering, proceed to submitting
                setTimeout(() => {
                  setApplyState('submitting');
                  setTimeout(() => {
                    setApplyState('success');
                  }, 1200);
                }, 800);
              }
            };
            typeQ2();
          }, 400);
        }
      };
      typeQ1();

    }, 1200);
  };

  const resetApplySimulation = () => {
    setApplyState('idle');
    setTypedAnswers({ q1: '', q2: '' });
  };

  // AI Content Generator Simulator
  const runAiGeneration = () => {
    if (aiGenerating) return;
    setAiGenerating(true);
    setTimeout(() => {
      setAiGenerating(false);
      setPostDraft(
        lang === 'pt-BR'
          ? "Next.js App Router + Redis + BullMQ = 🚀\n\nConstruir sistemas resilientes exige processamento em segundo plano. Com workers BullMQ, processamos renders assíncronos de PDFs no backend sem congelar o cliente. \n\nConfira o guia completo que acabo de gerar no docs! 👇"
          : "Next.js App Router + Redis + BullMQ = 🚀\n\nBuilding resilient systems requires background processing. With BullMQ workers, we process async PDF rendering on the backend without locking the client thread. \n\nCheck out the full guide I just generated in the docs! 👇"
      );
      setShowAiAssistant(false);
      setCarouselPdfAdded(true); // Automatically attach the carousel
    }, 1500);
  };

  // Carousel slide definitions for Card 4 (LinkedIn Feed Post Carousel Preview)
  const slides = lang === 'pt-BR' ? [
    {
      title: "Como Criar Carrosséis que Convertem no LinkedIn",
      bullets: [
        "● Chame atenção nos primeiros 3 segundos da timeline",
        "● Divida conceitos de engenharia em passos simples",
        "● Use gradientes limpos e fontes de fácil leitura"
      ],
      footer: "Arrastar para o lado para ver o fluxo ➔"
    },
    {
      title: "Workers em Background com BullMQ & Redis",
      bullets: [
        "● PDF Compiler renderiza o carrossel no backend",
        "● Filas garantem retries automáticos em falhas",
        "--- Processamento distribuído não sobrecarrega a API"
      ],
      footer: "Próximo slide: Métricas e Resultados obtidos ➔"
    },
    {
      title: "Resultados com o LinkedIn Job Explorer",
      bullets: [
        "● Candidaturas Easy Apply com 100% de automação",
        "● IA Gemini preenche questionários contextualmente",
        "● Otimização ATS aumenta taxa de resposta de vagas"
      ],
      footer: "Siga o projeto no GitHub para novidades!"
    }
  ] : [
    {
      title: "How to Build High-Converting LinkedIn Carousels",
      bullets: [
        "● Capture feed attention in the first 3 seconds",
        "● Break complex engineering topics into quick slides",
        "● Use polished gradients and clear typography"
      ],
      footer: "Swipe left to see the technical architecture ➔"
    },
    {
      title: "Background Processing with BullMQ & Redis",
      bullets: [
        "● PDF Compiler renders carousels in worker threads",
        "● Persistent queues handle API rate limits gracefully",
        "● Distributed processing scales independently from web servers"
      ],
      footer: "Next slide: Metrics and Results achieved ➔"
    },
    {
      title: "Achieved Metrics & Benefits",
      bullets: [
        "● 100% automated Easy Apply form completions",
        "● Gemini AI models resolve questions contextually",
        "● ATS Keyword matching increases response rates"
      ],
      footer: "Follow the GitHub repository for updates!"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch w-full mt-12 relative z-10 text-left">
      
      {/* 1. Real Job Applier UI Mockup (Colspan 7) */}
      <div className="md:col-span-7 group flex flex-col rounded-3xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] p-8 hover:border-[#70b5f9]/30 transition-all duration-300 shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <div className="mb-6 text-left relative z-10">
          <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-blue-400 shrink-0">
            <Briefcase className="h-5 w-5 text-blue-400" />
          </div>
          <h3 className="font-display text-xl font-bold text-white mb-3">
            {lang === 'pt-BR' ? 'Interface de Candidatura Automatizada' : 'Real Job Application Dashboard'}
          </h3>
          <p className="text-slate-400 mb-6 text-sm leading-relaxed">
            {lang === 'pt-BR'
              ? 'Interface real de busca integrada. Analise scores de match e preencha formulários Easy Apply automaticamente através do assistente de IA.'
              : 'Interactive view of our application dashboard. Evaluate match scores and trigger AI autofill scripts directly inside candidate streams.'}
          </p>
          <div className="flex flex-wrap gap-2 mb-2">
            {(lang === 'pt-BR' 
              ? ['Candidatura Automática', 'Filtro por Match', 'Questões Resolvidas por IA', 'Dashboard Integrado'] 
              : ['Automated Apply', 'Match Filtering', 'AI Questionnaire Solver', 'Integrated Dashboard']
            ).map((tag, tIdx) => (
              <span key={tIdx} className="inline-flex rounded-md bg-white/5 px-2 py-1 text-xs text-slate-300 border border-white/5 font-medium">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Dashboard UI Simulation viewport */}
        <div className="border border-white/10 rounded-xl bg-black/40 overflow-hidden flex flex-row min-h-[300px] shadow-inner text-slate-300 font-sans relative z-10 w-full">
          
          {/* Narrow left sidebar representing JobsPage.tsx Sidebar */}
          <div className="w-12 bg-black/40 border-r border-white/10 flex flex-col items-center py-4 gap-4 shrink-0">
            <div className="size-6 bg-[#0a66c2] text-white flex items-center justify-center font-bold text-xs rounded select-none shadow">in</div>
            <div className="flex flex-col gap-3.5 mt-2 flex-1">
              <Briefcase className="size-4 text-[#70b5f9]" />
              <FileCheck2 className="size-4 text-[#8f969b] hover:text-white cursor-pointer" />
              <UserSearch className="size-4 text-[#8f969b] hover:text-white cursor-pointer" />
            </div>
            <Globe className="size-4 text-[#8f969b]" />
          </div>

          {/* Job List Panel (w-[180px]) */}
          <div className="w-[180px] border-r border-white/10 flex flex-col bg-black/20 shrink-0">
            <div className="p-2 border-b border-white/10">
              <input 
                type="text" 
                readOnly 
                placeholder={lang === 'pt-BR' ? 'Pesquisar vagas...' : 'Search jobs...'} 
                className="w-full bg-black/40 border border-white/10 rounded px-2 py-0.5 text-[9px] outline-none text-slate-300 placeholder-slate-500"
              />
            </div>
            <div className="flex-1 overflow-y-auto p-1.5 space-y-1">
              {mockJobs.map((job, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    if (applyState === 'idle') {
                      setSelectedMockJob(idx);
                    }
                  }}
                  className={`p-2 rounded transition-all text-[10px] ${
                    applyState !== 'idle' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                  } ${
                    selectedMockJob === idx 
                      ? 'bg-white/10 border border-white/10 text-white' 
                      : 'hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <div className="font-semibold truncate">{job.title}</div>
                  <div className="text-[8px] text-[#8f969b] truncate">{job.company}</div>
                  <div className="flex items-center justify-between mt-1 text-[8px] font-mono">
                    <span className="text-[#70b5f9]">{job.match} match</span>
                    <span className="text-[#8f969b]">Idle</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Job Details & Easy Apply Simulator (flex-1) */}
          <div className="flex-1 flex flex-col p-4 bg-black/20 relative overflow-hidden">
            {applyState === 'idle' ? (
              <div className="flex-grow flex flex-col justify-between text-left">
                <div>
                  <div className="flex justify-between items-start gap-1">
                    <h4 className="text-xs font-bold text-white leading-tight">{mockJobs[selectedMockJob].title}</h4>
                    <span className="text-[9px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-1.5 py-0.5 rounded font-mono font-semibold shrink-0">
                      {mockJobs[selectedMockJob].match} Match
                    </span>
                  </div>
                  <div className="text-[9px] text-[#8f969b] mt-0.5">{mockJobs[selectedMockJob].company} · {mockJobs[selectedMockJob].location}</div>
                  
                  <div className="mt-3 border-t border-white/10 pt-3 space-y-1.5">
                    <div className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">{lang === 'pt-BR' ? 'Requisitos da Vaga' : 'Requirements'}</div>
                    <p className="text-[9px] text-[#8f969b] leading-relaxed">
                      {selectedMockJob === 0 
                        ? (lang === 'pt-BR' ? 'Necessário domínio de React, Next.js App Router, TypeScript e Server Components para refatorar fluxos existentes.' : 'Requires solid React, Next.js App Router, TypeScript, and Server Components to refactor core layout modules.')
                        : selectedMockJob === 1
                        ? (lang === 'pt-BR' ? 'Profundo entendimento de compiladores, AST parsing e strict types para integration com pipelines de LLM.' : 'Deep understanding of AST compiling rules, TypeScript typings, and strict payload structural verification.')
                        : (lang === 'pt-BR' ? 'Lidar com workers assíncronos no backend com BullMQ e Redis para processamento de filas financeiras.' : 'Experience building high concurrency workers with Redis and BullMQ to decouple heavy client requests.')}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/10">
                  <button
                    onClick={runApplySimulation}
                    className="w-full py-1.5 rounded-lg bg-[#0a66c2] text-white font-bold text-[10px] hover:bg-[#004182] transition-colors active:scale-95 cursor-pointer flex items-center justify-center gap-1 shadow"
                  >
                    <Sparkles className="size-3 fill-white/10" />
                    {lang === 'pt-BR' ? 'Candidatura Rápida com IA' : 'Easy Apply with AI'}
                  </button>
                </div>
              </div>
            ) : (
              /* Simulated ApplyModal overlay UI */
              <div className="flex-grow flex flex-col justify-between text-left animate-fadeIn">
                <div className="border-b border-white/10 pb-2 flex justify-between items-center">
                  <span className="text-[9px] font-bold text-white font-mono flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                    {lang === 'pt-BR' ? 'Candidatura Fácil LinkedIn' : 'LinkedIn Easy Apply Dialog'}
                  </span>
                  <button 
                    onClick={resetApplySimulation}
                    className="text-slate-400 hover:text-white text-xs cursor-pointer font-bold px-1"
                  >
                    ×
                  </button>
                </div>

                <div className="flex-1 py-3 overflow-y-auto space-y-3 font-mono text-[9px]">
                  {/* Field 1 */}
                  <div className="space-y-1">
                    <div className="text-[#8f969b]">{mockJobs[selectedMockJob].q1}</div>
                    <div className="bg-black/40 border border-white/10 rounded-lg p-1.5 text-white min-h-[22px] flex items-center">
                      {applyState === 'scraping' ? (
                        <span className="text-[#70b5f9] animate-pulse">● {lang === 'pt-BR' ? 'Mapeando campo...' : 'Parsing field...'}</span>
                      ) : (
                        <span>{typedAnswers.q1}</span>
                      )}
                    </div>
                  </div>

                  {/* Field 2 */}
                  {(applyState === 'solving' || applyState === 'submitting' || applyState === 'success') && (
                    <div className="space-y-1 animate-fadeIn">
                      <div className="text-[#8f969b]">{mockJobs[selectedMockJob].q2}</div>
                      <div className="bg-black/40 border border-white/10 rounded-lg p-1.5 text-white min-h-[22px] flex items-center">
                        {typedAnswers.q1.length < mockJobs[selectedMockJob].a1.length ? (
                          <span className="text-[#8f969b] animate-pulse">...</span>
                        ) : (
                          <span>{typedAnswers.q2}</span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Status Overlay messages */}
                  {applyState === 'submitting' && (
                    <div className="text-[#70b5f9] font-bold animate-pulse py-1.5 text-center border border-white/10 bg-[#0a66c2]/10 rounded-lg">
                      {lang === 'pt-BR' ? '✓ Respostas geradas. Enviando via API...' : '✓ AI Form filled. Submitting payload...'}
                    </div>
                  )}

                  {applyState === 'success' && (
                    <div className="text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 py-2 px-3 rounded text-center space-y-1 animate-fadeIn">
                      <div className="flex items-center justify-center gap-1.5">
                        <Check className="size-3.5 text-emerald-400" />
                        <span>{lang === 'pt-BR' ? 'Candidatura Enviada!' : 'Application Sent Successfully!'}</span>
                      </div>
                      <div className="text-[7px] text-[#8f969b] font-mono">voyager-apply-ok · ID #{99182 + selectedMockJob}</div>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-white/10">
                  <button
                    onClick={resetApplySimulation}
                    className="w-full py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-white font-semibold text-[10px] active:scale-[0.98] cursor-pointer transition-all"
                  >
                    {applyState === 'success' ? (lang === 'pt-BR' ? 'Voltar para Vagas' : 'Back to Listings') : (lang === 'pt-BR' ? 'Cancelar' : 'Cancel')}
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* 2. AI Resume Optimizer & Match Analysis (Colspan 5) */}
      <div className="md:col-span-5 group flex flex-col rounded-3xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] p-8 hover:border-[#70b5f9]/30 transition-all duration-300 shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <div className="mb-6 text-left relative z-10">
          <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-emerald-400 shrink-0">
            <FileCheck2 className="h-5 w-5 text-emerald-400" />
          </div>
          <h3 className="font-display text-xl font-bold text-white mb-3">
            {lang === 'pt-BR' ? 'Otimizador de Currículos com IA' : 'AI Resume Optimizer'}
          </h3>
          <p className="text-slate-400 mb-6 text-sm leading-relaxed">
            {lang === 'pt-BR'
              ? 'Compare currículos e injete de forma cirúrgica palavras-chave e descrições para atingir compatibilidade máxima de ATS.'
              : 'Analyze candidate profiles against requirements to dynamically inject structural keywords and summaries.'}
          </p>
          <div className="flex flex-wrap gap-2 mb-2">
            {(lang === 'pt-BR' 
              ? ['Otimização ATS', 'Palavras-chave', 'Score de Match', 'Geração Baseada em Vagas'] 
              : ['ATS Optimization', 'Keywords Injection', 'Match Scoring', 'Contextual Rephrasing']
            ).map((tag, tIdx) => (
              <span key={tIdx} className="inline-flex rounded-md bg-white/5 px-2 py-1 text-xs text-slate-300 border border-white/5 font-medium">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Tailor UI card */}
        <div className="border border-white/10 rounded-xl bg-black/40 p-4 flex flex-col gap-3.5 min-h-[300px] justify-between shadow-inner font-sans relative z-10 w-full">
          <div className="flex justify-between items-center pb-2 border-b border-white/10">
            <span className="text-[11px] font-bold text-[#e9ecef] uppercase font-mono tracking-wide">
              {lang === 'pt-BR' ? 'Análise de ATS' : 'ATS Analysis'}
            </span>
            <div className="flex gap-1.5">
              <button
                onClick={() => setResumeView('original')}
                className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors cursor-pointer ${
                  resumeView === 'original'
                    ? 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                    : 'bg-white/5 border border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                Original
              </button>
              <button
                onClick={() => setResumeView('optimized')}
                className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors cursor-pointer ${
                  resumeView === 'optimized'
                    ? 'bg-[#0a66c2]/10 text-[#70b5f9] border-[#0a66c2]/20'
                    : 'bg-white/5 border border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                Optimized
              </button>
            </div>
          </div>

          <div className="space-y-3 text-left">
            <div className="flex justify-between items-center text-xs">
              <span className="text-[#8f969b] font-mono">{lang === 'pt-BR' ? 'Taxa de Match:' : 'Match Rate:'}</span>
              <span className={`font-mono font-bold ${resumeView === 'original' ? 'text-orange-400' : 'text-emerald-400'}`}>
                {resumeView === 'original' ? '58%' : '94%'}
              </span>
            </div>
            {/* Progress line */}
            <div className="w-full bg-black/40 border border-white/10 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${resumeView === 'original' ? 'bg-orange-400' : 'bg-[#0a66c2]'}`}
                style={{ width: resumeView === 'original' ? '58%' : '94%' }}
              />
            </div>

            {/* Keyword badges status */}
            <div className="space-y-2 pt-1 text-xs">
              <div className="flex justify-between items-center p-2 rounded-lg bg-black/20 border border-white/10">
                <span className="text-[#8f969b]">TypeScript Core</span>
                <span className="text-[10px] font-bold text-emerald-400 font-mono">Matched ✓</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg bg-black/20 border border-white/10 font-sans">
                <div className="flex flex-col text-left">
                  <span className="text-[#e9ecef] font-semibold">Redis & BullMQ</span>
                  {resumeView === 'optimized' && (
                    <span className="text-[8px] text-emerald-400 leading-tight mt-0.5">+ {lang === 'pt-BR' ? 'Adicionado resumo de microsserviços' : 'Added background processing'}</span>
                  )}
                </div>
                {resumeView === 'original' ? (
                  <span className="text-[10px] font-bold text-orange-400 font-mono shrink-0">Missing ✗</span>
                ) : (
                  <span className="text-[10px] font-bold text-[#70b5f9] font-mono animate-pulse shrink-0">[+] Inserted</span>
                )}
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg bg-black/20 border border-white/10 font-sans">
                <div className="flex flex-col text-left">
                  <span className="text-[#e9ecef] font-semibold">Next.js App Router</span>
                  {resumeView === 'optimized' && (
                    <span className="text-[8px] text-emerald-400 leading-tight mt-0.5">+ {lang === 'pt-BR' ? 'Injetado Server Components' : 'Injected Server Actions'}</span>
                  )}
                </div>
                {resumeView === 'original' ? (
                  <span className="text-[10px] font-bold text-orange-400 font-mono shrink-0">Missing ✗</span>
                ) : (
                  <span className="text-[10px] font-bold text-[#70b5f9] font-mono animate-pulse shrink-0">[+] Inserted</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Real Post Creator UI (Colspan 5) */}
      <div className="md:col-span-5 group flex flex-col rounded-3xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] p-8 hover:border-[#70b5f9]/30 transition-all duration-300 shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <div className="mb-6 text-left relative z-10">
          <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-purple-400 shrink-0">
            <PenTool className="h-5 w-5 text-purple-400" />
          </div>
          <h3 className="font-display text-xl font-bold text-white mb-3">
            {lang === 'pt-BR' ? 'Criador de Posts & Carrosséis' : 'Post Creation Workspace'}
          </h3>
          <p className="text-slate-400 mb-6 text-sm leading-relaxed">
            {lang === 'pt-BR'
              ? 'Interface real do nosso editor de publicações. Acesse o assistente inteligente de IA e anexe slides carrosséis dinâmicos.'
              : 'Fidelity mockup of our post creator modal. Toggle AI assistance filters, draft posts, and compile PDF slides.'}
          </p>
          <div className="flex flex-wrap gap-2 mb-2">
            {(lang === 'pt-BR' 
              ? ['Geração por IA', 'PDF Slides Compiler', 'Anexos de Mídia', 'Publicação Automática'] 
              : ['AI Writing Assistant', 'PDF Slides Compiler', 'Media Attachments', 'Automated Publishing']
            ).map((tag, tIdx) => (
              <span key={tIdx} className="inline-flex rounded-md bg-white/5 px-2 py-1 text-xs text-slate-300 border border-white/5 font-medium">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Post Creation Modal UI Mockup */}
        <div className="border border-white/10 rounded-xl bg-black/40 p-4 flex flex-col gap-3 min-h-[300px] justify-between shadow-inner font-sans text-slate-300 relative text-left z-10 w-full">
          <div className="flex justify-between items-center pb-2 border-b border-white/10">
            <span className="text-[10px] font-bold text-white font-mono uppercase tracking-wide">
              {lang === 'pt-BR' ? 'Criar uma publicação' : 'Create a post'}
            </span>
            <span className="text-[9px] font-bold text-purple-400 uppercase font-mono bg-purple-500/10 border border-purple-500/20 px-1.5 py-0.5 rounded">
              Publisher UI
            </span>
          </div>

          <div className="flex-1 flex flex-col gap-2.5 py-1">
            {/* Profile Row */}
            <div className="flex items-center gap-2">
              <div className="size-7 rounded-full bg-[#0a66c2] text-white flex items-center justify-center font-bold text-[10px]">JL</div>
              <div>
                <div className="text-[10px] font-semibold text-white">Julio Lima</div>
                <div className="flex items-center gap-1 text-[8px] text-slate-400 border border-white/10 rounded-full px-1.5 py-0.5 bg-black/40 mt-0.5">
                  <Globe className="size-2.5 text-slate-400" />
                  <span>{lang === 'pt-BR' ? 'Qualquer pessoa' : 'Anyone'}</span>
                </div>
              </div>
            </div>

            {/* AI Assistant Section (If visible) */}
            {showAiAssistant ? (
              <div className="p-2.5 bg-[#0a66c2]/10 border border-[#0a66c2]/20 rounded-lg space-y-2 animate-fadeIn">
                <div className="flex justify-between items-center text-[9px] font-bold text-[#70b5f9]">
                  <span className="flex items-center gap-1">
                    <Sparkles className="size-3 fill-[#70b5f9]/10" />
                    {lang === 'pt-BR' ? 'Assistente de Escrita IA' : 'AI Assistant Prompt'}
                  </span>
                  <button 
                    onClick={() => setShowAiAssistant(false)} 
                    className="text-red-400 hover:underline cursor-pointer"
                  >
                    {lang === 'pt-BR' ? 'Fechar' : 'Close'}
                  </button>
                </div>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder={lang === 'pt-BR' ? 'Ex: Dicas de BullMQ...' : 'Ex: BullMQ queue tips...'}
                    className="flex-1 bg-black/40 border border-white/10 rounded px-2 py-1 text-[9px] outline-none text-white placeholder-slate-500"
                  />
                  <button
                    onClick={runAiGeneration}
                    disabled={aiGenerating}
                    className="px-2.5 py-1 bg-[#0a66c2] hover:bg-[#004182] text-white font-bold rounded text-[9px] transition-colors cursor-pointer shrink-0"
                  >
                    {aiGenerating ? (
                      <span className="inline-block animate-spin">●</span>
                    ) : (
                      (lang === 'pt-BR' ? 'Gerar' : 'Write')
                    )}
                  </button>
                </div>
              </div>
            ) : null}

            {/* Post Content Textarea */}
            <textarea
              value={postDraft}
              onChange={(e) => setPostDraft(e.target.value)}
              className="w-full flex-1 bg-black/20 border border-white/10 p-2.5 rounded-lg text-[10.5px] text-slate-300 resize-none font-sans focus:outline-none focus:border-[#70b5f9]/40 min-h-[90px]"
            />

            {/* Carousel PDF Preview attachment (If added) */}
            {carouselPdfAdded && (
              <div className="flex items-center justify-between p-2 bg-[#0a66c2]/10 border border-[#0a66c2]/20 rounded-lg animate-fadeIn text-[9px]">
                <div className="flex items-center gap-2">
                  <div className="size-6 bg-red-500/10 rounded flex items-center justify-center text-red-500 font-bold font-mono text-[9px]">PDF</div>
                  <div>
                    <div className="font-semibold text-white truncate max-w-[120px] sm:max-w-[150px]">carrossel-rsc-bullmq.pdf</div>
                    <div className="text-[8px] text-[#8f969b]">1.4 MB · {lang === 'pt-BR' ? '3 slides prontos' : '3 generated slides'}</div>
                  </div>
                </div>
                <button 
                  onClick={() => setCarouselPdfAdded(false)}
                  className="text-red-400 hover:text-red-300 font-bold px-1.5 cursor-pointer text-xs"
                  title={lang === 'pt-BR' ? 'Remover' : 'Remove'}
                >
                  ×
                </button>
              </div>
            )}
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center justify-between border-t border-white/10 pt-2 text-[9px] text-[#8f969b]">
            <div className="flex gap-2">
              <button
                onClick={() => setShowAiAssistant(!showAiAssistant)}
                className={`p-1.5 rounded hover:bg-white/5 hover:text-white cursor-pointer transition-colors ${showAiAssistant ? 'text-[#70b5f9] bg-[#0a66c2]/10' : ''}`}
                title={lang === 'pt-BR' ? 'Perguntar para IA' : 'Ask AI'}
              >
                <Sparkles className="size-3.5" />
              </button>
              <button
                onClick={() => setCarouselPdfAdded(!carouselPdfAdded)}
                className={`p-1.5 rounded hover:bg-white/5 hover:text-white cursor-pointer transition-colors ${carouselPdfAdded ? 'text-purple-400 bg-purple-500/10' : ''}`}
                title={lang === 'pt-BR' ? 'Compilar Slides Carrossel' : 'Attach Carousel PDF'}
              >
                <Layers className="size-3.5" />
              </button>
            </div>
            
            <button
              onClick={() => {
                alert(lang === 'pt-BR' ? 'Post publicado com sucesso!' : 'Post successfully published!');
                setPostDraft('');
                setCarouselPdfAdded(false);
              }}
              className="px-3 py-1 rounded bg-[#0a66c2] text-white font-bold hover:bg-[#004182] transition-colors cursor-pointer"
            >
              {lang === 'pt-BR' ? 'Publicar' : 'Publish'}
            </button>
          </div>
        </div>
      </div>

      {/* 4. LinkedIn Feed Post Carousel Preview (Colspan 7) */}
      <div className="md:col-span-7 group flex flex-col rounded-3xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] p-8 hover:border-[#70b5f9]/30 transition-all duration-300 shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <div className="mb-6 text-left relative z-10">
          <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-blue-400 shrink-0">
            <Rss className="h-5 w-5 text-blue-400" />
          </div>
          <h3 className="font-display text-xl font-bold text-white mb-3">
            {lang === 'pt-BR' ? 'Simulação de Post com Slides Carrossel' : 'LinkedIn Feed Carousel Post Preview'}
          </h3>
          <p className="text-slate-400 mb-6 text-sm leading-relaxed">
            {lang === 'pt-BR'
              ? 'Como o post com os slides estruturados com IA é visualizado diretamente na timeline do LinkedIn pelos usuários.'
              : 'Simulates how AI-tailored content and slide carousels render inside the standard LinkedIn timeline view.'}
          </p>
          <div className="flex flex-wrap gap-2 mb-2">
            {(lang === 'pt-BR' 
              ? ['Visualizador PDF', 'Navegação Linear', 'Feed de Posts', 'Engajamento'] 
              : ['PDF Viewer', 'Swipe Navigation', 'Timeline Post', 'Engagement']
            ).map((tag, tIdx) => (
              <span key={tIdx} className="inline-flex rounded-md bg-white/5 px-2 py-1 text-xs text-slate-300 border border-white/5 font-medium">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Simulated LinkedIn Timeline Post Card */}
        <div className="border border-white/10 rounded-xl bg-black/40 p-4 flex flex-col gap-3 min-h-[300px] justify-between shadow-inner font-sans text-slate-300 text-left relative z-10">
          
          {/* Post Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="size-9 rounded-full bg-[#deebf7] flex items-center justify-center shrink-0 overflow-hidden border border-[#c9daf8]/50">
                <svg viewBox="0 0 24 24" className="w-7 h-7 fill-[#9ec0e6]">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </div>
              <div>
                <div className="text-xs font-bold text-white hover:text-[#70b5f9] hover:underline cursor-pointer flex items-center gap-1">
                  <span>Júlio V.</span>
                  <span className="text-[10px] font-normal text-slate-400">· {lang === 'pt-BR' ? 'Você' : 'You'}</span>
                </div>
                <div className="text-[9px] text-[#8f969b] leading-none mt-0.5">--</div>
                <div className="text-[8px] text-[#8f969b] flex items-center gap-1 mt-0.5">
                  <span>1 d ·</span>
                  <Globe className="size-2 text-[#8f969b]" />
                </div>
              </div>
            </div>
            <MoreHorizontal className="size-4 text-[#8f969b] hover:text-white cursor-pointer" />
          </div>

          {/* Post Body text */}
          <div className="text-[10.5px] text-slate-200 leading-relaxed space-y-1">
            <p className="whitespace-pre-wrap">
              {lang === 'pt-BR' 
                ? 'Acabei de criar esse carrossel sobre **Como usar BullMQ e Redis no Next.js** utilizando nosso assistente com Inteligência Artificial! 🚀\n\nConfira o arquivo PDF em anexo abaixo e arraste para o lado para ler os slides.'
                : 'I just created this carousel about **How to use BullMQ and Redis in Next.js** using our AI assistant! 🚀\n\nCheck the attached PDF file below and swipe to read the slides.'}
            </p>
          </div>

          {/* PDF Slides Carousel Widget Container */}
          <div className="relative overflow-hidden w-full bg-black/30 rounded-xl border border-white/5 p-3 h-[340px] flex items-center shadow-inner group/carousel">
            
            {/* Slide translator wrapper */}
            <div 
              className="flex gap-3 transition-transform duration-300 ease-out" 
              style={{ transform: `translateX(-${currentSlide * 257}px)` }}
            >
              {/* Slide 1 Card (Cover) */}
              <div className="w-[245px] h-[310px] bg-[#faf6f0] border border-[#e6ded5] rounded-xl p-4 flex flex-col justify-between shrink-0 transition-all select-none relative shadow-md">
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <span className="bg-[#1d2226] text-white font-mono text-[7.5px] px-2 py-0.5 rounded-full inline-block">
                      {lang === 'pt-BR' ? 'carrossel-bullmq.pdf · 8 páginas' : 'carousel-bullmq.pdf · 8 pages'}
                    </span>
                    
                    <h4 className="font-serif text-base font-bold text-[#3d2314] leading-snug mt-4 px-1">
                      {lang === 'pt-BR' ? 'Guia Completo de Filas e Background Jobs' : 'Complete Guide to Background Queues'}
                    </h4>
                    
                    <p className="font-sans text-[10px] text-[#4a3f35] leading-relaxed mt-2 px-1">
                      {lang === 'pt-BR' 
                        ? 'Aprenda a orquestrar workers BullMQ e Redis de forma escalável no Next.js App Router.' 
                        : 'Master scales and asynchronous queues utilizing BullMQ and Redis.'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 mt-4 px-1">
                    <div className="size-6 rounded-full bg-[#ea580c] text-white flex items-center justify-center font-bold text-[8px] shrink-0">
                      JL
                    </div>
                    <span className="text-[9.5px] text-[#4a3f35] font-semibold truncate">Júlio Lima Costa Valladares</span>
                  </div>
                </div>

                <div className="border-t border-[#e6ded5] pt-2 flex justify-between items-center text-[7.5px] text-[#8c7e6f] font-sans">
                  <span className="truncate max-w-[90px]">Júlio Lima</span>
                  <span className="text-[#ea580c] font-bold tracking-wider">{lang === 'pt-BR' ? 'DESLIZE ➔' : 'SWIPE ➔'}</span>
                  <span>1 / 8</span>
                </div>
              </div>

              {/* Slide 2 Card */}
              <div className="w-[245px] h-[310px] bg-[#faf6f0] border border-[#e6ded5] rounded-xl p-4 flex flex-col justify-between shrink-0 transition-all select-none relative shadow-md">
                <div>
                  <h4 className="font-serif text-[14px] font-bold text-[#3d2314] leading-snug px-1">
                    {lang === 'pt-BR' ? 'Por que BullMQ & Redis?' : 'Why BullMQ & Redis?'}
                  </h4>
                  
                  <div className="text-[9.5px] text-[#4a3f35] space-y-2 mt-3 leading-tight px-1 font-sans">
                    <div>
                      <div className="text-[#2b1a0e] font-bold">● {lang === 'pt-BR' ? 'Threads em Background:' : 'Background Threads:'}</div>
                      <div className="pl-3.5 text-[8.5px] text-[#5c5043]">
                        {lang === 'pt-BR' ? 'Processamento assíncrono que evita o congelamento das rotas da API.' : 'Async processing that avoids blocking API route execution.'}
                      </div>
                    </div>
                    <div>
                      <div className="text-[#2b1a0e] font-bold">● {lang === 'pt-BR' ? 'Concorrência & Filas:' : 'Queue Concurrency:'}</div>
                      <div className="pl-3.5 text-[8.5px] text-[#5c5043]">
                        {lang === 'pt-BR' ? 'Orquestração de tarefas paralelas distribuídas e rate limit control.' : 'Orchestration of distributed parallel jobs and rate limit control.'}
                      </div>
                    </div>
                    <div>
                      <div className="text-[#2b1a0e] font-bold">● {lang === 'pt-BR' ? 'Retries Automáticos:' : 'Automatic Retries:'}</div>
                      <div className="pl-3.5 text-[8.5px] text-[#5c5043]">
                        {lang === 'pt-BR' ? 'Resiliência a limites de requisição com políticas de backoff exponencial.' : 'Resiliency to API limits using exponential backoff policies.'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-[#e6ded5] pt-2 flex justify-between items-center text-[7.5px] text-[#8c7e6f] font-sans">
                  <span className="truncate max-w-[90px]">Júlio Lima</span>
                  <span className="text-[#ea580c] font-bold tracking-wider">{lang === 'pt-BR' ? 'DESLIZE ➔' : 'SWIPE ➔'}</span>
                  <span>2 / 8</span>
                </div>
              </div>

              {/* Slide 3 Card */}
              <div className="w-[245px] h-[310px] bg-[#faf6f0] border border-[#e6ded5] rounded-xl p-4 flex flex-col justify-between shrink-0 transition-all select-none relative shadow-md">
                <div>
                  <h4 className="font-serif text-[14px] font-bold text-[#3d2314] leading-snug px-1">
                    {lang === 'pt-BR' ? 'Benefícios e Resultados' : 'Achieved Results'}
                  </h4>
                  
                  <div className="text-[9.5px] text-[#4a3f35] space-y-2 mt-3 leading-tight px-1 font-sans">
                    <div>
                      <div className="text-[#2b1a0e] font-bold">● {lang === 'pt-BR' ? 'Automação sem Bloqueios:' : 'Block-free Automation:'}</div>
                      <div className="pl-3.5 text-[8.5px] text-[#5c5043]">
                        {lang === 'pt-BR' ? 'Execução em paralelo permite aplicar para mais de 100 vagas/hora.' : 'Parallel execution allows applying for 100+ jobs/hour.'}
                      </div>
                    </div>
                    <div>
                      <div className="text-[#2b1a0e] font-bold">● {lang === 'pt-BR' ? 'Orquestrador Inteligente:' : 'Intelligent Orchestrator:'}</div>
                      <div className="pl-3.5 text-[8.5px] text-[#5c5043]">
                        {lang === 'pt-BR' ? 'Modelos Gemini geram respostas contextuais customizadas com IA.' : 'Gemini models resolve complex questionnaire answers automatically.'}
                      </div>
                    </div>
                    <div>
                      <div className="text-[#2b1a0e] font-bold">● {lang === 'pt-BR' ? 'Alta Disponibilidade:' : 'High Availability:'}</div>
                      <div className="pl-3.5 text-[8.5px] text-[#5c5043]">
                        {lang === 'pt-BR' ? 'Persistência no Redis previne perda de dados em quedas de rede.' : 'Redis caching guarantees queue state persistence across crashes.'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-[#e6ded5] pt-2 flex justify-between items-center text-[7.5px] text-[#8c7e6f] font-sans">
                  <span className="truncate max-w-[90px]">Júlio Lima</span>
                  <span className="text-[#ea580c] font-bold tracking-wider">{lang === 'pt-BR' ? 'FIM ➔' : 'END ➔'}</span>
                  <span>3 / 8</span>
                </div>
              </div>
            </div>

            {/* Navigation arrows overlay */}
            <button
              onClick={() => setCurrentSlide(prev => Math.max(0, prev - 1))}
              disabled={currentSlide === 0}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold w-9 h-9 rounded-full flex items-center justify-center bg-black/80 hover:bg-zinc-800 border border-white/10 text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer p-0 select-none shadow transition-opacity duration-200 z-20"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              onClick={() => setCurrentSlide(prev => Math.min(1, prev + 1))}
              disabled={currentSlide === 1}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold w-9 h-9 rounded-full flex items-center justify-center bg-black/80 hover:bg-zinc-800 border border-white/10 text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer p-0 select-none shadow transition-opacity duration-200 z-20"
            >
              <ChevronRight className="size-4" />
            </button>

            {/* Fullscreen Button Mock */}
            <div className="absolute bottom-2.5 right-2.5 z-20 bg-black/80 border border-white/10 hover:bg-zinc-800 rounded-full w-9 h-9 flex items-center justify-center cursor-pointer transition-all shadow text-white">
              <svg viewBox="0 0 24 24" className="size-4 fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
              </svg>
            </div>
          </div>

          {/* Social Stats indicators line */}
          <div className="flex justify-between items-center text-[9px] text-[#8f969b] border-b border-white/5 pb-2">
            <span className="flex items-center gap-1.5 hover:text-[#70b5f9] hover:underline cursor-pointer">
              <span>👍 2</span>
            </span>
            <span className="hover:text-[#70b5f9] hover:underline cursor-pointer">0 {lang === 'pt-BR' ? 'comentários' : 'comments'}</span>
          </div>

          {/* Feed Post Interactive Action buttons footer */}
          <div className="flex justify-between items-center px-1 text-[10px] text-[#8f969b] font-semibold select-none">
            <button className="flex items-center gap-1.5 py-1 px-2 rounded hover:bg-white/5 hover:text-[#70b5f9] cursor-pointer transition-colors">
              <ThumbsUp className="size-3.5" />
              <span>{lang === 'pt-BR' ? 'Gostei' : 'Like'}</span>
            </button>
            <button className="flex items-center gap-1.5 py-1 px-2 rounded hover:bg-white/5 hover:text-[#70b5f9] cursor-pointer transition-colors">
              <MessageSquare className="size-3.5" />
              <span>{lang === 'pt-BR' ? 'Comentar' : 'Comment'}</span>
            </button>
            <button className="flex items-center gap-1.5 py-1 px-2 rounded hover:bg-white/5 hover:text-[#70b5f9] cursor-pointer transition-colors">
              <Share2 className="size-3.5" />
              <span>{lang === 'pt-BR' ? 'Compartilhar' : 'Repost'}</span>
            </button>
            <button className="flex items-center gap-1.5 py-1 px-2 rounded hover:bg-white/5 hover:text-[#70b5f9] cursor-pointer transition-colors">
              <Send className="size-3.5" />
              <span>{lang === 'pt-BR' ? 'Enviar' : 'Send'}</span>
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
      <div className="lg:col-span-7 relative flex flex-col rounded-xl border border-[#2f3539] bg-[#1d2226] overflow-hidden shadow-xl min-h-[320px]">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#2f3539] bg-[#12161a]/30">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
            <span className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
            <span className="text-xs text-[#8f969b] ml-2 font-mono">
              {tab === 'graphql' ? 'query.graphql' : tab === 'rest' ? 'request.http' : 'terminal.sh'}
            </span>
          </div>
          <button
            onClick={() => navigator.clipboard.writeText(active.code)}
            className="text-[10px] text-[#e9ecef] border border-[#2f3539] px-2 py-0.5 rounded bg-[#12161a] hover:bg-[#2f3539] transition-all cursor-pointer"
          >
            Copy
          </button>
        </div>
        <div className="flex-1 p-5 font-mono text-[13px] text-[#e9ecef] bg-[#12161a]/10 overflow-auto text-left leading-relaxed">
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
                  ? 'bg-[#0a66c2] text-white border-[#0a66c2] shadow-md shadow-[#0a66c2]/10'
                  : 'bg-[#1d2226] border-[#2f3539] text-[#8f969b] hover:text-[#e9ecef]'
              }`}
            >
              GraphQL
            </button>
            <button
              onClick={() => setTab('rest')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold border transition-all cursor-pointer ${
                tab === 'rest'
                  ? 'bg-[#0a66c2] text-white border-[#0a66c2] shadow-md shadow-[#0a66c2]/10'
                  : 'bg-[#1d2226] border-[#2f3539] text-[#8f969b] hover:text-[#e9ecef]'
              }`}
            >
              REST API
            </button>
            <button
              onClick={() => setTab('cli')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold border transition-all cursor-pointer ${
                tab === 'cli'
                  ? 'bg-[#0a66c2] text-white border-[#0a66c2] shadow-md shadow-[#0a66c2]/10'
                  : 'bg-[#1d2226] border-[#2f3539] text-[#8f969b] hover:text-[#e9ecef]'
              }`}
            >
              CLI Automation
            </button>
          </div>
          <h4 className="text-xl font-bold text-[#e9ecef] mb-3 text-left">{active.title}</h4>
          <p className="text-sm text-[#8f969b] mb-6 leading-relaxed text-left">{active.desc}</p>
          <ul className="space-y-2 text-left">
            {active.bullets.map((bullet, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs text-[#8f969b]">
                <span className="h-5 w-5 rounded-full bg-[#0a66c2]/10 text-[#70b5f9] flex items-center justify-center shrink-0 mt-0.5 border border-[#0a66c2]/20">
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
      icon: <Network className="h-5 w-5 text-indigo-400" />,
      title: text.workflow.steps.sync.title,
      description: text.workflow.steps.sync.desc
    },
    {
      icon: <Search className="h-5 w-5 text-blue-400" />,
      title: text.workflow.steps.search.title,
      description: text.workflow.steps.search.desc
    },
    {
      icon: <PenTool className="h-5 w-5 text-purple-400" />,
      title: text.workflow.steps.match.title,
      description: text.workflow.steps.match.desc
    },
    {
      icon: <Send className="h-5 w-5 text-emerald-400" />,
      title: text.workflow.steps.submit.title,
      description: text.workflow.steps.submit.desc
    },
    {
      icon: <Layers className="h-5 w-5 text-orange-400" />,
      title: text.workflow.steps.track.title,
      description: text.workflow.steps.track.desc
    }
  ];

  const packages = [
    {
      title: text.audiences.jobSeekers.title,
      icon: <UserSearch className="h-6 w-6 text-blue-400" />,
      color: "blue",
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
    <main className="relative flex flex-col items-center overflow-hidden bg-[#090e11] text-[#e9ecef] min-h-screen w-full pt-16">
      {/* Background radial glow */}
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none z-0 blur-3xl opacity-90" 
        style={{ background: 'radial-gradient(circle at 50% 30%, rgba(10, 102, 194, 0.38) 0%, rgba(10, 102, 194, 0.08) 50%, transparent 80%)' }}
      />

      {/* Hero Section */}
      <section className="relative w-full px-6 pt-20 pb-16 overflow-hidden z-10">
        <div className="max-w-6xl mx-auto flex flex-col items-center text-center">
          {/* Announcement Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-sm text-blue-300 mb-8 transition-transform hover:scale-[1.02] cursor-pointer">
            <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
            <span className="text-xs font-semibold">{text.hero.badge}</span>
          </div>

          {/* Title */}
          <h1 className="mx-auto max-w-4xl font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.05] mb-8">
            {text.hero.titleNormal}{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">
              {text.hero.titleHighlight}
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mx-auto max-w-2xl text-sm sm:text-base md:text-lg text-slate-400 leading-relaxed mb-10">
            {text.hero.subtitle}
          </p>

          {/* CTA Actions */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 w-full sm:w-auto">
            <Link
              href={`/docs/${lang}/quickstart`}
              className="w-full sm:w-auto group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-white px-8 py-3.5 font-bold text-zinc-950 transition-transform active:scale-95 hover:scale-[1.02]"
            >
              <span className="flex items-center gap-2">
                {text.hero.ctaPrimary}
                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
            <Link
              href={`/docs/${lang}/quickstart`}
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-8 py-3.5 font-semibold text-white transition-colors hover:bg-white/10 hover:scale-[1.02] active:scale-95"
            >
              {text.hero.ctaSecondary}
            </Link>
          </div>
        </div>

        {/* Feature Bento Grid replacing original mockup dashboard */}
        <div className="max-w-5xl mx-auto px-4 sm:px-0">
          <BentoGridFeatures lang={lang} />
        </div>
      </section>

      {/* EcosystemFeatures Section */}
      <section id="features" className="w-full px-6 py-24 border-t border-[#2f3539] bg-[#12161a]/15 z-10 relative">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16 text-left">
            <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl mb-4">
              {text.features.title}
            </h2>
            <p className="max-w-2xl text-sm sm:text-base text-slate-400 leading-relaxed">
              {text.features.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Job Applier */}
            <div className="group flex flex-col rounded-3xl border border-white/10 bg-white/[0.02] p-8 hover:bg-white/[0.04] transition-all duration-300 relative overflow-hidden col-span-1 md:col-span-2 shadow-sm hover:border-[#70b5f9]/30">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-transparent to-purple-500/0 group-hover:from-blue-500/5 group-hover:to-purple-500/5 transition-all duration-500" />
              <div className="relative z-10 text-left">
                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 border border-white/10">
                  <Bot className="h-6 w-6 text-blue-400" />
                </div>
                <h3 className="font-display text-xl font-bold text-white mb-3">
                  {text.features.jobApplier.title}
                </h3>
                <p className="text-slate-400 mb-6 flex-1 text-sm leading-relaxed">
                  {text.features.jobApplier.desc}
                </p>
                <div className="flex flex-wrap gap-2 mb-2">
                  {text.features.jobApplier.tags.map((tag, tIdx) => (
                    <span key={tIdx} className="inline-flex rounded-md bg-white/5 px-2 py-1 text-xs text-slate-300 border border-white/5 font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Visual for Job Applier */}
              <div className="mt-6 flex flex-col gap-3 h-full justify-end border-t border-white/5 pt-6 text-left">
                <div className="flex items-center justify-between rounded-lg bg-zinc-900 border border-white/5 p-3">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded bg-blue-500/20 flex items-center justify-center shrink-0 border border-blue-500/30">
                      <FileCheck2 className="h-4 w-4 text-blue-400" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-white truncate">
                        {text.features.jobApplier.visual.jobTitle}
                      </div>
                      <div className="text-xs text-slate-500 truncate">
                        {text.features.jobApplier.visual.company}
                      </div>
                    </div>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-green-500/10 px-2 py-1 text-xs font-medium text-green-400 border border-green-500/20 shrink-0">
                    {text.features.jobApplier.visual.applied}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-zinc-900 border border-white/5 p-3">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded bg-purple-500/20 flex items-center justify-center shrink-0 border border-purple-500/30">
                      <Sparkles className="h-4 w-4 text-purple-400" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-white truncate">
                        {text.features.jobApplier.visual.adjusting}
                      </div>
                      <div className="text-xs text-slate-500 truncate">
                        {text.features.jobApplier.visual.prompting}
                      </div>
                    </div>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-blue-500/10 px-2 py-1 text-xs font-medium text-blue-400 border border-blue-500/20 animate-pulse shrink-0">
                    {text.features.jobApplier.visual.processing}
                  </span>
                </div>
              </div>
            </div>

            {/* Card 2: Publisher */}
            <div className="group flex flex-col rounded-3xl border border-white/10 bg-white/[0.02] p-8 hover:bg-white/[0.04] transition-all duration-300 relative overflow-hidden col-span-1 shadow-sm hover:border-[#70b5f9]/30">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-transparent to-purple-500/0 group-hover:from-blue-500/5 group-hover:to-purple-500/5 transition-all duration-500" />
              <div className="relative z-10 text-left">
                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 border border-white/10">
                  <PenTool className="h-6 w-6 text-purple-400" />
                </div>
                <h3 className="font-display text-xl font-bold text-white mb-3">
                  {text.features.publisher.title}
                </h3>
                <p className="text-slate-400 mb-6 flex-1 text-sm leading-relaxed">
                  {text.features.publisher.desc}
                </p>
                <div className="flex flex-wrap gap-2 mb-2">
                  {text.features.publisher.tags.map((tag, tIdx) => (
                    <span key={tIdx} className="inline-flex rounded-md bg-white/5 px-2 py-1 text-xs text-slate-300 border border-white/5 font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Visual for Publisher */}
              <div className="mt-6 h-full flex flex-col gap-2 rounded-lg border border-white/5 bg-zinc-900 overflow-hidden text-sm text-left">
                <div className="flex items-center gap-2 border-b border-white/5 bg-black/40 px-3 py-2">
                  <Rss className="h-3 w-3 text-slate-400 shrink-0" />
                  <span className="text-xs text-slate-400 truncate">
                    {text.features.publisher.visual.scheduled}
                  </span>
                </div>
                <div className="p-3">
                  <div className="h-2 w-3/4 rounded-full bg-white/20 mb-2" />
                  <div className="h-2 w-full rounded-full bg-white/10 mb-2" />
                  <div className="h-2 w-5/6 rounded-full bg-white/10 mb-4" />
                  <div className="rounded bg-black p-2 font-mono text-[10px] text-zinc-400 border border-white/5">
                    <span className="text-pink-400">const</span> optimize = () {'=>'} {'{'} ... {'}'}
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3: Documentation Hub */}
            <div className="group flex flex-col rounded-3xl border border-white/10 bg-white/[0.02] p-8 hover:bg-white/[0.04] transition-all duration-300 relative overflow-hidden col-span-1 md:col-span-3 shadow-sm hover:border-[#70b5f9]/30">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-transparent to-purple-500/0 group-hover:from-blue-500/5 group-hover:to-purple-500/5 transition-all duration-500" />
              <div className="relative z-10 text-left">
                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 border border-white/10">
                  <BookOpen className="h-6 w-6 text-emerald-400" />
                </div>
                <h3 className="font-display text-xl font-bold text-white mb-3">
                  {text.features.docsHub.title}
                </h3>
                <p className="text-slate-400 mb-6 flex-1 text-sm leading-relaxed">
                  {text.features.docsHub.desc}
                </p>
                <div className="flex flex-wrap gap-2 mb-2">
                  {text.features.docsHub.tags.map((tag, tIdx) => (
                    <span key={tIdx} className="inline-flex rounded-md bg-white/5 px-2 py-1 text-xs text-slate-300 border border-white/5 font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Visual for Documentation Hub */}
              <div className="mt-6 flex flex-col sm:flex-row gap-4 flex-1 w-full border-t border-white/5 pt-6 text-left">
                <div className="w-full sm:w-64 flex flex-col gap-2">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    {text.features.docsHub.visual.ref}
                  </div>
                  <div className="flex items-center gap-2 rounded bg-white/5 px-2 py-1.5 text-xs font-semibold text-slate-300 hover:bg-white/10 transition-colors border border-white/5">
                    <span className="text-[10px] font-bold text-[#70b5f9] shrink-0">POST</span> /apply
                  </div>
                  <div className="flex items-center gap-2 rounded bg-white/5 px-2 py-1.5 text-xs font-semibold text-slate-300 hover:bg-white/10 transition-colors border border-white/5">
                    <span className="text-[10px] font-bold text-green-400 shrink-0">GET</span> /jobs
                  </div>
                  <div className="flex items-center gap-2 rounded bg-white/5 px-2 py-1.5 text-xs font-semibold text-slate-300 hover:bg-white/10 transition-colors border border-white/5">
                    <span className="text-[10px] font-bold text-[#70b5f9] shrink-0">POST</span> /publish
                  </div>
                </div>
                <div className="flex-1 rounded-lg border border-white/5 bg-zinc-900 p-4 font-mono text-xs shadow-inner overflow-hidden">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Terminal className="h-4 w-4 text-[#70b5f9]" />
                      <span className="text-slate-300 text-xs font-bold">
                        {text.features.docsHub.visual.reqExample}
                      </span>
                    </div>
                    <button className="text-[10px] font-semibold text-slate-500 hover:text-white hover:bg-white/5 px-2 py-0.5 rounded border border-white/5 transition-colors cursor-pointer">
                      {text.features.docsHub.visual.copy}
                    </button>
                  </div>
                  <div className="text-slate-400 leading-relaxed overflow-x-auto whitespace-pre">
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
      <section className="w-full px-6 py-20 border-t border-[#2f3539] bg-[#12161a]/5 relative">
        <div className="max-w-6xl mx-auto relative z-10 text-left">
          <InteractiveIntegration lang={lang} />
        </div>
      </section>

      {/* DeepBrief Workflow Section */}
      <section id="workflow" className="w-full py-24 border-t border-[#2f3539] bg-zinc-950/40 relative overflow-hidden z-10">
        <div className="mx-auto max-w-6xl px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="text-left">
              <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl mb-6">
                {text.workflow.title}
              </h2>
              <p className="text-sm sm:text-base text-slate-400 mb-10 leading-relaxed">
                {text.workflow.subtitle}
              </p>

              <div className="space-y-8">
                {workflowSteps.map((step, idx) => (
                  <div key={idx} className="flex gap-4 relative transition-all duration-300 hover:translate-x-0.5">
                    {/* Connection Line */}
                    {idx !== workflowSteps.length - 1 && (
                      <div className="absolute left-6 top-10 bottom-[-2rem] w-px bg-white/10" />
                    )}

                    <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-zinc-900 shadow-sm">
                      {step.icon}
                    </div>
                    <div className="pt-1 text-left">
                      <h4 className="text-base font-semibold text-white mb-1">{step.title}</h4>
                      <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Simulated Live Logs terminal panel */}
            <div className="flex flex-col rounded-2xl border border-white/10 bg-[#12161a]/60 overflow-hidden shadow-2xl h-[420px] text-left">
              <div className="flex items-center justify-between border-b border-white/5 bg-zinc-900/50 px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
                </div>
                <span className="text-[10px] text-[#8f969b] font-mono">
                  {text.workflow.log.title}
                </span>
              </div>
              <div className="flex-1 p-5 font-mono text-[11px] text-[#e9ecef] bg-black/20 space-y-2 overflow-y-auto leading-relaxed shadow-inner">
                <div className="text-[#8f969b]">{text.workflow.log.l1}</div>
                <div className="text-emerald-400 font-medium">{text.workflow.log.l2}</div>
                <div className="text-[#8f969b] pl-3">{text.workflow.log.l2_sub}</div>
                <div className="text-[#70b5f9] animate-pulse">{text.workflow.log.l3}</div>
                <div className="text-[#8f969b] pl-3">{text.workflow.log.l3_sub1}</div>
                <div className="text-[#8f969b] pl-3">{text.workflow.log.l3_sub2}</div>
                <div className="text-emerald-400 font-semibold">{text.workflow.log.l4}</div>
                <div className="text-emerald-400/80 font-bold bg-emerald-500/5 py-0.5 px-2 rounded-md max-w-fit">{text.workflow.log.l4_sub}</div>
                <div className="text-[#70b5f9] animate-pulse">{text.workflow.log.l5}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Audiences Section */}
      <section id="audiences" className="w-full px-6 py-24 relative border-t border-[#2f3539] bg-[#090e11]/30 z-10">
        <div className="mx-auto max-w-6xl relative z-10">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl mb-4">
              {text.audiences.title}
            </h2>
            <p className="mx-auto max-w-2xl text-sm sm:text-base text-[#8f969b] leading-relaxed">
              {text.audiences.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            {packages.map((pkg, idx) => (
              <div
                key={idx}
                className={`relative rounded-3xl border transition-all duration-300 hover:scale-[1.01] ${
                  pkg.popular
                    ? 'border-purple-500/50 bg-purple-500/5 shadow-purple-500/5 shadow-lg'
                    : 'border-white/10 bg-zinc-900/50'
                } p-8 backdrop-blur-sm flex flex-col justify-between`}
              >
                {pkg.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 px-3.5 py-1 text-[10px] font-bold text-white uppercase tracking-wider shadow-md">
                    {text.audiences.popularBadge}
                  </div>
                )}

                <div>
                  <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 border border-white/10 shadow-sm">
                    {pkg.icon}
                  </div>

                  <h3 className="font-display text-lg font-bold text-white mb-6">
                    {pkg.title}
                  </h3>

                  <ul className="space-y-4 mb-8 text-left">
                    {pkg.features.map((feature, fIdx) => (
                      <li key={fIdx} className="flex gap-3 items-start text-xs sm:text-sm text-slate-300">
                        <CheckCircle2 className="h-4.5 w-4.5 shrink-0 text-emerald-400" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  href={`/docs/${lang}/quickstart`}
                  className={`w-full rounded-full py-2.5 text-center text-xs font-semibold tracking-wide transition-all border ${
                    pkg.popular
                      ? 'bg-purple-600 text-white hover:bg-purple-700 active:bg-purple-800'
                      : 'bg-white/15 text-white hover:bg-white/20 active:bg-white/25 border border-white/10'
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
      <footer className="w-full px-6 py-16 border-t border-[#2f3539] relative z-10 bg-[#12161a] text-left">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2.5 text-xs text-[#8f969b]">
              <Layers className="h-5 w-5 text-[#70b5f9]" />
              <span className="font-bold text-white text-sm">LinkedIn Job Explorer</span>
            </div>
            <p className="text-xs text-[#8f969b] max-w-sm leading-relaxed">
              {text.footer.desc}
            </p>
          </div>
          <div className="flex flex-wrap gap-x-8 gap-y-4 justify-center md:justify-end text-xs text-[#8f969b] font-medium">
            <Link href={`/docs/${lang}/quickstart`} className="hover:text-white transition-colors">
              {text.footer.links.docs}
            </Link>
            <Link href={`/docs/${lang}/job-backend/overview`} className="hover:text-white transition-colors">
              {text.footer.links.gateway}
            </Link>
            <Link href={`/docs/${lang}/job-backend/overview`} className="hover:text-white transition-colors">
              {text.footer.links.jobBackend}
            </Link>
            <Link href={`/docs/${lang}/publisher-backend/overview`} className="hover:text-white transition-colors">
              {text.footer.links.publisher}
            </Link>
          </div>
        </div>

        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between pt-8 mt-8 border-t border-white/5 text-[11px] text-[#8f969b] gap-4">
          <p>{text.footer.rights}</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-white transition-colors">
              {text.footer.privacy}
            </a>
            <a href="#" className="hover:text-white transition-colors">
              {text.footer.terms}
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
