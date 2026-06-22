"use client";

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import {
  Layers, Briefcase, Rocket, ArrowRight,
  Zap, Bot, FileText, Terminal, Globe, RefreshCw,
  ImageIcon, ChevronRight, Database, Cpu, Check, Users,
  Search, Play, AlertCircle, ShieldAlert, Award
} from 'lucide-react';
import { translations } from './translations';

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

interface LinkedInDashboardMockupProps {
  lang: 'pt-BR' | 'en';
}

function LinkedInDashboardMockup({ lang }: LinkedInDashboardMockupProps) {
  const t = translations[lang].dashboard;

  const [activeTab, setActiveTab] = useState<'feed' | 'publisher' | 'logs'>('feed');
  const [applyState, setApplyState] = useState<'idle' | 'searching' | 'matching' | 'solving' | 'tailoring' | 'success'>('idle');
  const [publisherState, setPublisherState] = useState<'idle' | 'generating' | 'success'>('idle');

  // Interactive Counter Metrics
  const [submissionsCount, setSubmissionsCount] = useState(142);
  const [successRate, setSuccessRate] = useState(98.4);
  const [tokensSaved, setTokensSaved] = useState(42.5);

  const [typingText1, setTypingText1] = useState('');
  const [typingText2, setTypingText2] = useState('');

  const typingTimer1 = useRef<NodeJS.Timeout | null>(null);
  const typingTimer2 = useRef<NodeJS.Timeout | null>(null);

  // Simulation Sequence
  const runSimulation = () => {
    if (applyState !== 'idle') return;

    // Reset typings
    setTypingText1('');
    setTypingText2('');

    if (typingTimer1.current) clearTimeout(typingTimer1.current);
    if (typingTimer2.current) clearTimeout(typingTimer2.current);

    setApplyState('searching');

    setTimeout(() => {
      setApplyState('matching');
      setTimeout(() => {
        setApplyState('solving');

        // Typing Q1 answer
        const fullText1 = t.feed.mockJobs.job1.a1;
        let index1 = 0;
        const typeAnswer1 = () => {
          if (index1 <= fullText1.length) {
            setTypingText1(fullText1.slice(0, index1));
            index1++;
            typingTimer1.current = setTimeout(typeAnswer1, 30);
          } else {
            // Typing Q2 answer after Q1 is done
            setTimeout(() => {
              setApplyState('tailoring');
              const fullText2 = t.feed.mockJobs.job1.a2;
              let index2 = 0;
              const typeAnswer2 = () => {
                if (index2 <= fullText2.length) {
                  setTypingText2(fullText2.slice(0, index2));
                  index2++;
                  typingTimer2.current = setTimeout(typeAnswer2, 30);
                } else {
                  // Finish simulation
                  setTimeout(() => {
                    setApplyState('success');
                    // Increment metrics
                    setSubmissionsCount(prev => prev + 1);
                    setSuccessRate(prev => Math.min(99.2, parseFloat((prev + 0.1).toFixed(1))));
                    setTokensSaved(prev => parseFloat((prev + 1.2).toFixed(1)));
                    setTimeout(() => {
                      setApplyState('idle');
                    }, 4000);
                  }, 120000000000000000000); // Trigger finish immediately
                  setApplyState('success');
                  setTimeout(() => {
                    setApplyState('idle');
                  }, 4000);
                }
              };
              typeAnswer2();
            }, 1000);
          }
        };
        typeAnswer1();

      }, 1500);
    }, 1500);
  };

  const runPublisherSimulation = () => {
    if (publisherState !== 'idle') return;
    setPublisherState('generating');
    setTimeout(() => {
      setPublisherState('success');
      setTimeout(() => {
        setPublisherState('idle');
      }, 4000);
    }, 2500);
  };

  useEffect(() => {
    return () => {
      if (typingTimer1.current) clearTimeout(typingTimer1.current);
      if (typingTimer2.current) clearTimeout(typingTimer2.current);
    };
  }, []);

  return (
    <div className="relative max-w-5xl mx-auto mt-12 rounded-2xl border border-fd-border/30 bg-[#0c1017]/95 backdrop-blur-md overflow-hidden shadow-2xl z-10 transition-transform duration-500 hover:scale-[1.005]">
      {/* simulated premium linkedin top nav bar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-fd-border/15 bg-[#161b22]/90">
        <div className="flex items-center gap-4 w-full max-w-sm">
          {/* logo wrapper */}
          <div className="flex items-center justify-center size-9 rounded-lg bg-[#0077b5] text-white font-bold text-lg select-none shrink-0 shadow-lg shadow-[#0077b5]/15">
            JE
          </div>
          {/* simulated search bar */}
          <div className="relative w-full hidden sm:block">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-fd-muted-foreground">
              <Search className="size-3.5" />
            </span>
            <input
              type="text"
              readOnly
              placeholder={t.nav.searchPlaceholder}
              className="w-full bg-[#0d1117] border border-fd-border/15 rounded-full py-1.5 pl-9 pr-4 text-xs text-fd-foreground font-medium outline-none focus:border-[#0077b5]/50"
            />
          </div>
        </div>

        {/* nav navigation items */}
        <div className="flex items-center gap-3 md:gap-5">
          <button
            onClick={() => setActiveTab('feed')}
            className={`flex flex-col items-center gap-0.5 text-[10px] md:text-xs font-semibold py-1 border-b-2 transition-all cursor-pointer ${
              activeTab === 'feed'
                ? 'border-[#0077b5] text-[#0077b5]'
                : 'border-transparent text-fd-muted-foreground hover:text-fd-foreground'
            }`}
          >
            <Briefcase className="size-4" />
            <span className="hidden md:inline">{t.nav.jobs}</span>
          </button>
          <button
            onClick={() => setActiveTab('publisher')}
            className={`flex flex-col items-center gap-0.5 text-[10px] md:text-xs font-semibold py-1 border-b-2 transition-all cursor-pointer ${
              activeTab === 'publisher'
                ? 'border-[#0077b5] text-[#0077b5]'
                : 'border-transparent text-fd-muted-foreground hover:text-fd-foreground'
            }`}
          >
            <ImageIcon className="size-4" />
            <span className="hidden md:inline">{t.nav.publisher}</span>
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`flex flex-col items-center gap-0.5 text-[10px] md:text-xs font-semibold py-1 border-b-2 transition-all cursor-pointer ${
              activeTab === 'logs'
                ? 'border-[#0077b5] text-[#0077b5]'
                : 'border-transparent text-fd-muted-foreground hover:text-fd-foreground'
            }`}
          >
            <Terminal className="size-4" />
            <span className="hidden md:inline">{t.nav.logs}</span>
          </button>

          {/* status monitor */}
          <div className="h-6 w-[1px] bg-fd-border/15" />
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-bold text-emerald-400 tracking-wider uppercase font-mono hidden sm:inline">
              {t.nav.devMode}
            </span>
          </div>
        </div>
      </div>

      {/* Main dashboard content container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 p-4 gap-4 text-left bg-[#0d1117] min-h-[500px]">
        {/* Left Column: Sync center & metrics (Takes 3 columns) */}
        <div className="lg:col-span-3 space-y-4">
          {/* Card: Sync Status */}
          <div className="p-4 rounded-xl border border-fd-border/10 bg-[#161b22]/50 backdrop-blur-sm shadow-inner">
            <h4 className="text-xs font-bold text-fd-foreground tracking-wider uppercase mb-3 flex items-center gap-1.5">
              <Database className="size-3.5 text-[#0077b5]" />
              {t.syncCenter.title}
            </h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] text-fd-muted-foreground">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  {t.syncCenter.cookieStatus}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-fd-muted-foreground">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  {t.syncCenter.apiStatus}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-fd-muted-foreground">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  {t.syncCenter.dbStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Card: Dynamic Analytics */}
          <div className="p-4 rounded-xl border border-fd-border/10 bg-[#161b22]/50 backdrop-blur-sm">
            <h4 className="text-xs font-bold text-fd-foreground tracking-wider uppercase mb-3 flex items-center gap-1.5">
              <Cpu className="size-3.5 text-brand-lime" />
              {t.syncCenter.metricsTitle}
            </h4>
            <div className="space-y-3.5">
              <div>
                <span className="text-[10px] text-fd-muted-foreground block mb-0.5">{t.syncCenter.appliedCount}</span>
                <span className="text-xl font-bold font-mono text-fd-foreground">{submissionsCount}</span>
              </div>
              <div>
                <span className="text-[10px] text-fd-muted-foreground block mb-0.5">{t.syncCenter.successRate}</span>
                <span className="text-xl font-bold font-mono text-emerald-400">{successRate}%</span>
              </div>
              <div>
                <span className="text-[10px] text-fd-muted-foreground block mb-0.5">{t.syncCenter.tokensSaved}</span>
                <span className="text-xl font-bold font-mono text-brand-lime">{tokensSaved}k</span>
              </div>
            </div>
          </div>

          {/* Card: Active Search params */}
          <div className="p-4 rounded-xl border border-fd-border/10 bg-[#161b22]/50 backdrop-blur-sm">
            <h4 className="text-xs font-bold text-fd-foreground tracking-wider uppercase mb-3 flex items-center gap-1.5">
              <Search className="size-3.5 text-orange-400" />
              {t.syncCenter.searchParams}
            </h4>
            <div className="space-y-3 text-[11px]">
              <div>
                <span className="text-[9px] font-bold text-fd-muted-foreground block tracking-wider uppercase mb-1">
                  {t.syncCenter.keywords}
                </span>
                <div className="flex flex-wrap gap-1">
                  <span className="px-1.5 py-0.5 rounded bg-[#0d1117] border border-fd-border/15 text-[10px] text-brand-lime font-mono">
                    TypeScript
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-[#0d1117] border border-fd-border/15 text-[10px] text-brand-lime font-mono">
                    React
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-[#0d1117] border border-fd-border/15 text-[10px] text-brand-lime font-mono">
                    Node.js
                  </span>
                </div>
              </div>
              <div>
                <span className="text-[9px] font-bold text-fd-muted-foreground block tracking-wider uppercase mb-1">
                  {t.syncCenter.location}
                </span>
                <span className="text-fd-foreground font-mono font-medium">Remote / Worldwide</span>
              </div>
              <div>
                <span className="text-[9px] font-bold text-fd-muted-foreground block tracking-wider uppercase mb-1">
                  {t.syncCenter.applyMode}
                </span>
                <span className="text-fd-foreground font-mono font-medium text-emerald-400">Gemini 1.5 Pro</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center / Tab Contents (Takes 6 columns) */}
        <div className="lg:col-span-6 flex flex-col justify-between border-x border-fd-border/5 px-0 lg:px-4 min-h-[450px]">
          {/* TAB 1: Live Job Automation Feed */}
          {activeTab === 'feed' && (
            <div className="space-y-4 flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-fd-foreground">{t.feed.title}</h3>
                <button
                  onClick={runSimulation}
                  disabled={applyState !== 'idle'}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    applyState !== 'idle'
                      ? 'bg-fd-muted border border-fd-border text-fd-muted-foreground cursor-not-allowed'
                      : 'bg-brand-lime text-black hover:bg-[#d5f002] hover:scale-[1.02] shadow-lg shadow-brand-lime/10'
                  }`}
                >
                  <Play className="size-3 fill-black" />
                  {t.feed.runBtn}
                </button>
              </div>

              {/* Feed simulation area */}
              <div className="space-y-4 relative max-h-[450px] overflow-y-auto pr-1">
                {/* Search overlay indicator */}
                {applyState === 'searching' && (
                  <div className="p-5 rounded-xl border border-[#0077b5]/30 bg-[#161b22]/80 flex flex-col items-center justify-center text-center animate-pulse py-8">
                    <RefreshCw className="size-7 text-[#0077b5] animate-spin mb-3" />
                    <span className="text-xs text-fd-foreground font-semibold">Querying LinkedIn Voyager API...</span>
                    <span className="text-[10px] text-fd-muted-foreground mt-1">Keywords: "TypeScript, React"</span>
                  </div>
                )}

                {/* Job Found and answering simulation */}
                {(applyState === 'matching' || applyState === 'solving' || applyState === 'tailoring' || applyState === 'success') && (
                  <div className="rounded-xl border border-fd-border/15 bg-[#161b22]/40 backdrop-blur-md overflow-hidden shadow-md animate-fade-in transition-all">
                    {/* card header */}
                    <div className="p-4 border-b border-fd-border/10 bg-[#161b22]/30 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="size-8 rounded-md bg-[#0077b5]/10 text-[#0077b5] flex items-center justify-center font-bold text-xs">
                          V
                        </div>
                        <div>
                          <h5 className="text-xs font-bold text-fd-foreground">{t.feed.mockJobs.job1.title}</h5>
                          <span className="text-[10px] text-fd-muted-foreground">{t.feed.mockJobs.job1.company}</span>
                        </div>
                      </div>
                      <div className="text-[10px] bg-emerald-500/10 text-emerald-400 font-bold px-2 py-0.5 rounded border border-emerald-500/20">
                        {t.feed.match}: 94%
                      </div>
                    </div>

                    {/* AI Questionnaire logs */}
                    <div className="p-4 space-y-3 font-mono text-[11px] bg-[#0d1117]/30">
                      {applyState === 'matching' && (
                        <div className="flex items-center gap-1.5 text-fd-muted-foreground text-center justify-center py-4">
                          <Cpu className="size-4 text-brand-lime animate-spin" />
                          <span>Matching qualifications with database profiles...</span>
                        </div>
                      )}

                      {/* Question 1 */}
                      {(applyState === 'solving' || applyState === 'tailoring' || applyState === 'success') && (
                        <div className="p-2.5 rounded bg-[#0d1117]/60 border border-fd-border/10">
                          <span className="text-[#0077b5] block mb-1">Q1: {t.feed.mockJobs.job1.q1}</span>
                          <div className="text-emerald-400 min-h-[16px] break-words">
                            A1: {typingText1}
                            {applyState === 'solving' && typingText1.length < t.feed.mockJobs.job1.a1.length && (
                              <span className="w-1.5 h-3 bg-emerald-400 inline-block animate-pulse ml-0.5" />
                            )}
                          </div>
                        </div>
                      )}

                      {/* Question 2 */}
                      {(applyState === 'tailoring' || applyState === 'success') && (
                        <div className="p-2.5 rounded bg-[#0d1117]/60 border border-fd-border/10">
                          <span className="text-[#0077b5] block mb-1">Q2: {t.feed.mockJobs.job1.q2}</span>
                          <div className="text-emerald-400 min-h-[16px] break-words">
                            A2: {typingText2}
                            {applyState === 'tailoring' && typingText2.length < t.feed.mockJobs.job1.a2.length && (
                              <span className="w-1.5 h-3 bg-emerald-400 inline-block animate-pulse ml-0.5" />
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Status footer inside card */}
                    <div className="px-4 py-2 bg-[#161b22]/30 border-t border-fd-border/10 flex items-center justify-between text-[10px]">
                      <div className="flex items-center gap-1 text-fd-muted-foreground">
                        <Bot className="size-3.5 text-brand-lime" />
                        <span>
                          {applyState === 'solving'
                            ? t.feed.solving
                            : applyState === 'tailoring'
                            ? t.feed.tailoring
                            : applyState === 'success'
                            ? t.feed.submitted
                            : ''}
                        </span>
                      </div>
                      {applyState === 'success' && (
                        <span className="text-emerald-400 font-bold flex items-center gap-1 text-[11px] animate-bounce">
                          <Check className="size-3.5" />
                          {t.feed.submitted}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Always-on mock elements */}
                <div className="rounded-xl border border-fd-border/10 bg-[#161b22]/20 opacity-60 overflow-hidden text-xs">
                  <div className="p-3 bg-[#161b22]/10 border-b border-fd-border/5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="size-7 rounded bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold">O</div>
                      <div>
                        <h6 className="font-bold text-fd-foreground">{t.feed.mockJobs.job2.title}</h6>
                        <span className="text-[10px] text-fd-muted-foreground">{t.feed.mockJobs.job2.company}</span>
                      </div>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-500/5">98% Match</span>
                  </div>
                  <div className="p-3 font-mono text-[10px] space-y-1">
                    <div className="text-fd-muted-foreground">Q: {t.feed.mockJobs.job2.q1}</div>
                    <div className="text-emerald-500/80">A: {t.feed.mockJobs.job2.a1}</div>
                  </div>
                </div>

                <div className="rounded-xl border border-fd-border/10 bg-[#161b22]/20 opacity-60 overflow-hidden text-xs">
                  <div className="p-3 bg-[#161b22]/10 border-b border-fd-border/5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="size-7 rounded bg-orange-500/10 text-orange-400 flex items-center justify-center font-bold">S</div>
                      <div>
                        <h6 className="font-bold text-fd-foreground">{t.feed.mockJobs.job3.title}</h6>
                        <span className="text-[10px] text-fd-muted-foreground">{t.feed.mockJobs.job3.company}</span>
                      </div>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-500/5">90% Match</span>
                  </div>
                  <div className="p-3 font-mono text-[10px] space-y-1">
                    <div className="text-fd-muted-foreground">Q: {t.feed.mockJobs.job3.q1}</div>
                    <div className="text-emerald-500/80">A: {t.feed.mockJobs.job3.a1}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Publisher Slide Carousel Tool */}
          {activeTab === 'publisher' && (
            <div className="space-y-4 flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-fd-foreground">{t.publisher.title}</h3>
                <button
                  onClick={runPublisherSimulation}
                  disabled={publisherState !== 'idle'}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    publisherState !== 'idle'
                      ? 'bg-fd-muted border border-fd-border text-fd-muted-foreground cursor-not-allowed'
                      : 'bg-brand-lime text-black hover:bg-[#d5f002] hover:scale-[1.02] shadow-lg shadow-brand-lime/10'
                  }`}
                >
                  <RefreshCw className={`size-3 ${publisherState === 'generating' ? 'animate-spin' : ''}`} />
                  {t.publisher.btnText}
                </button>
              </div>

              <div className="p-4 rounded-xl border border-fd-border/10 bg-[#161b22]/40 backdrop-blur-md space-y-4 flex-1">
                {publisherState === 'generating' && (
                  <div className="p-6 rounded-lg border border-violet-500/20 bg-[#0d1117] flex flex-col items-center justify-center text-center animate-pulse">
                    <ImageIcon className="size-8 text-violet-400 animate-bounce mb-2" />
                    <span className="text-xs text-fd-foreground font-semibold">{t.publisher.generating}</span>
                    <span className="text-[10px] text-fd-muted-foreground mt-1">Topic: Next.js Server Actions</span>
                  </div>
                )}

                {publisherState === 'success' && (
                  <div className="p-6 rounded-lg border border-emerald-500/20 bg-[#0d1117] flex flex-col items-center justify-center text-center">
                    <Check className="size-8 text-emerald-400 mb-2" />
                    <span className="text-xs text-emerald-400 font-semibold">{t.publisher.published}!</span>
                    <span className="text-[10px] text-fd-muted-foreground mt-1">File: RSC-Survival-Guide.pdf (12 Slides)</span>
                  </div>
                )}

                {/* Queue status */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-fd-muted-foreground tracking-wider uppercase block">
                    {t.publisher.activeQueue}
                  </span>
                  <div className="space-y-2 text-xs font-mono">
                    <div className="p-2.5 rounded bg-[#0d1117] border border-fd-border/10 flex justify-between items-center">
                      <div>
                        <span className="text-fd-foreground font-bold">{t.publisher.carousels.c1}</span>
                        <span className="text-[9px] text-fd-muted-foreground block">Size: 4.8MB · Slides: 10</span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[9px] font-bold border border-emerald-500/20 uppercase">
                        {t.publisher.ready}
                      </span>
                    </div>

                    <div className="p-2.5 rounded bg-[#0d1117] border border-fd-border/10 flex justify-between items-center opacity-65">
                      <div>
                        <span className="text-fd-foreground font-bold">{t.publisher.carousels.c2}</span>
                        <span className="text-[9px] text-fd-muted-foreground block">Size: 3.2MB · Slides: 8</span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-[#0077b5]/10 text-[#0077b5] text-[9px] font-bold border border-[#0077b5]/20 uppercase">
                        Published
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Queue Microservice Logs */}
          {activeTab === 'logs' && (
            <div className="space-y-4 flex-1">
              <h3 className="text-sm font-bold text-fd-foreground">{t.publisher.activeQueue}</h3>
              <div className="p-3 bg-[#0d1117] border border-fd-border/10 rounded-lg flex-1 font-mono text-[10px] text-emerald-400 space-y-1.5 overflow-y-auto max-h-[360px] shadow-inner text-left">
                <div>[06:12:01] <span className="text-[#0077b5]">INFO</span> job-backend starting SQLite migrations...</div>
                <div>[06:12:02] <span className="text-emerald-500 font-semibold">SUCCESS</span> Migration 05_add_subscription_status successfully applied.</div>
                <div>[06:12:02] <span className="text-[#0077b5]">INFO</span> Voyager API connection established for user session (li_at).</div>
                <div>[06:12:05] <span className="text-brand-lime">BULLMQ</span> Worker queue initialized on port 6379 (Redis).</div>
                <div>[06:12:06] <span className="text-[#0077b5]">INFO</span> job-backend service active on port 3001.</div>
                <div>[06:12:07] <span className="text-[#0077b5]">INFO</span> gateway-api service active on port 3002.</div>
                <div>[06:12:08] <span className="text-[#0077b5]">INFO</span> publisher-backend service active on port 3003.</div>
                <div>[06:12:10] <span className="text-emerald-500 font-semibold">SYNC</span> Chrome extension synchronized 2 cookies in 120ms.</div>
                <div>[06:12:12] <span className="text-[#0077b5]">INFO</span> Running active search query for keywords: "TypeScript, React".</div>
                <div className="animate-pulse">[06:12:15] <span className="text-brand-lime">BULLMQ</span> Waiting for new execution triggers...</div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Microservices Status & Tools (Takes 3 columns) */}
        <div className="lg:col-span-3 space-y-4">
          {/* Card: Microservices Network */}
          <div className="p-4 rounded-xl border border-fd-border/10 bg-[#161b22]/50 backdrop-blur-sm">
            <h4 className="text-xs font-bold text-fd-foreground tracking-wider uppercase mb-3 flex items-center gap-1.5">
              <Layers className="size-3.5 text-[#0077b5]" />
              {t.publisher.microservices}
            </h4>
            <div className="space-y-3 font-mono text-[10px]">
              <div className="flex items-center justify-between p-2 rounded bg-[#0d1117] border border-fd-border/10">
                <span className="text-fd-foreground font-semibold">job-backend</span>
                <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold text-[8px] uppercase">
                  Active
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-[#0d1117] border border-fd-border/10">
                <span className="text-fd-foreground font-semibold">gateway-api</span>
                <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold text-[8px] uppercase">
                  Active
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-[#0d1117] border border-fd-border/10">
                <span className="text-fd-foreground font-semibold">publisher</span>
                <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold text-[8px] uppercase">
                  Active
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-[#0d1117] border border-fd-border/10">
                <span className="text-fd-foreground font-semibold">chrome-ext</span>
                <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold text-[8px] uppercase">
                  Synced
                </span>
              </div>
            </div>
          </div>

          {/* Quick instructions / tips info card */}
          <div className="p-4 rounded-xl border border-fd-border/10 bg-[#161b22]/30 text-xs space-y-2">
            <span className="font-bold text-fd-foreground block flex items-center gap-1 text-[11px] text-orange-400">
              <Award className="size-3.5" />
              Developer Tip
            </span>
            <p className="text-fd-muted-foreground leading-normal text-[11px]">
              Ensure the Chrome Extension captures the session correctly by signing in to LinkedIn first. Once synced, you do not need to keep LinkedIn tabs open.
            </p>
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

export default function LandingPage({ lang }: { lang: 'pt-BR' | 'en' }) {
  const text = translations[lang];

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
              {text.hero.badge}
            </div>

            <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-fd-foreground mb-6 leading-[1.08]">
              {text.hero.title1}
              <br />
              <span className="text-[#0077b5] dark:text-[#0077b5]">{text.hero.title2}</span>, <span className="text-brand-lime">{text.hero.title3}</span>.
            </h1>

            <p className="text-base sm:text-lg text-fd-muted-foreground mb-8 max-w-lg leading-relaxed">
              {text.hero.description}
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/docs/quickstart"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-bold text-black bg-brand-lime rounded-full shadow-lg shadow-brand-lime/10 hover:bg-[#d5f002] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer"
              >
                {text.hero.getStarted}
              </Link>
              <Link
                href="https://github.com/juliolimacostavalladares/linkedin-job-applier"
                target="_blank"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold text-fd-foreground bg-fd-card/50 hover:bg-fd-muted border border-fd-border/30 rounded-full transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                {text.hero.openGithub}
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

        {/* LinkedIn Redesign Concept Dashboard Mockup */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-0">
          <LinkedInDashboardMockup lang={lang} />
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
            <span className="text-xs text-brand-lime font-bold uppercase tracking-wider">{text.sections.flow.badge}</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-fd-foreground mt-2">
              {text.sections.flow.title}
            </h2>
            <p className="text-sm text-fd-muted-foreground mt-2 max-w-xl">
              {text.sections.flow.description}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
            {text.sections.flow.steps.map((item, index) => (
              <div key={index} className="p-5 rounded-xl border border-fd-border/20 bg-fd-card/40 backdrop-blur-sm relative hover:border-brand-lime/30 transition-colors">
                <div className="text-[10px] font-mono text-brand-lime font-bold mb-2 flex justify-between items-center">
                  <span>STEP 0{index + 1}</span>
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
              {text.sections.architecture.title}
            </h2>
            <p className="text-sm sm:text-base text-fd-muted-foreground max-w-xl leading-relaxed">
              {text.sections.architecture.description}
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
                <h3 className="text-2xl font-bold text-fd-foreground mb-3">{text.sections.architecture.gateway.title}</h3>
                <p className="text-sm text-fd-muted-foreground leading-relaxed max-w-md">
                  {text.sections.architecture.gateway.description}
                </p>
              </div>

              {/* Grid indicator badges */}
              <div className="grid grid-cols-2 gap-3 mt-8">
                <div className="p-3 rounded-lg bg-fd-muted/20 border border-fd-border/10 text-xs">
                  <span className="font-semibold text-fd-foreground block">{text.sections.architecture.gateway.features.graphql.title}</span>
                  <span className="text-fd-muted-foreground">{text.sections.architecture.gateway.features.graphql.desc}</span>
                </div>
                <div className="p-3 rounded-lg bg-fd-muted/20 border border-fd-border/10 text-xs">
                  <span className="font-semibold text-fd-foreground block">{text.sections.architecture.gateway.features.rest.title}</span>
                  <span className="text-fd-muted-foreground">{text.sections.architecture.gateway.features.rest.desc}</span>
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
                <h3 className="text-xl font-bold text-fd-foreground mb-3">{text.sections.architecture.jobBackend.title}</h3>
                <p className="text-sm text-fd-muted-foreground leading-relaxed">
                  {text.sections.architecture.jobBackend.description}
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold mt-6">
                {text.sections.architecture.jobBackend.cta}
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
                <h3 className="text-xl font-bold text-fd-foreground mb-3">{text.sections.architecture.publisher.title}</h3>
                <p className="text-sm text-fd-muted-foreground leading-relaxed">
                  {text.sections.architecture.publisher.description}
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-violet-400 font-semibold mt-6">
                {text.sections.architecture.publisher.cta}
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
                <h3 className="text-xl font-bold text-fd-foreground mb-3">{text.sections.architecture.extension.title}</h3>
                <p className="text-sm text-fd-muted-foreground leading-relaxed">
                  {text.sections.architecture.extension.description}
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-brand-lime font-semibold mt-6">
                {text.sections.architecture.extension.cta}
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
              <h3 className="text-3xl font-bold text-fd-foreground mb-4">{text.sections.testimonials.title}</h3>
              <p className="text-sm text-fd-muted-foreground leading-relaxed">
                {text.sections.testimonials.description}
              </p>
            </div>
            <div>
              <Link
                href="/docs/quickstart"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-black bg-brand-lime rounded-full shadow-lg shadow-brand-lime/10 hover:bg-[#d5f002] hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 cursor-pointer"
              >
                {text.sections.testimonials.cta}
              </Link>
            </div>
          </div>

          {/* Right testimonials block (Takes 7 cols) */}
          <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-fd-border/30 bg-fd-card/50 backdrop-blur-sm p-6 flex flex-col justify-between">
              <p className="text-sm text-fd-muted-foreground italic mb-6">
                {text.sections.testimonials.quote1}
              </p>
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
                  <Users className="size-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-fd-foreground">{text.sections.testimonials.person1.name}</div>
                  <div className="text-[10px] text-fd-muted-foreground">{text.sections.testimonials.person1.role}</div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-fd-border/30 bg-fd-card/50 backdrop-blur-sm p-6 flex flex-col justify-between">
              <p className="text-sm text-fd-muted-foreground italic mb-6">
                {text.sections.testimonials.quote2}
              </p>
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                  <Bot className="size-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-fd-foreground">{text.sections.testimonials.person2.name}</div>
                  <div className="text-[10px] text-fd-muted-foreground">{text.sections.testimonials.person2.role}</div>
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
              <h3 className="text-2xl font-bold text-fd-foreground mb-4">{text.sections.community.title}</h3>
              <p className="text-sm text-fd-muted-foreground leading-relaxed">
                {text.sections.community.description}
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
              <span className="text-[11px] text-fd-muted-foreground">{text.sections.community.contributors}</span>
            </div>
          </div>

          {/* Build Your Docs visual gradient card (Takes 6 cols) */}
          <div className="md:col-span-6 rounded-2xl border border-fd-border/30 bg-[#030712] overflow-hidden relative p-8 flex flex-col justify-between min-h-[350px]">
            {/* Dither mountain silhouette */}
            <MountainDither />
            <div className="absolute inset-0 bg-gradient-to-t from-orange-500/10 via-transparent to-transparent pointer-events-none" />

            <div className="relative z-10 text-center mt-6">
              <h3 className="text-4xl font-extrabold text-white tracking-widest uppercase font-mono">
                {text.sections.cta.title}
              </h3>
              <span className="text-xs text-fd-muted-foreground tracking-wide block mt-2">
                {text.sections.cta.subtitle}
              </span>
            </div>

            <div className="relative z-10 text-center mb-6">
              <Link
                href="/docs/quickstart"
                className="inline-flex items-center gap-1.5 px-6 py-3 text-xs font-bold text-black bg-brand-lime rounded-full shadow-lg shadow-brand-lime/10 hover:bg-[#d5f002] transition-colors cursor-pointer"
              >
                {text.sections.cta.button}
              </Link>
            </div>
          </div>
        </div>

        {/* Battery guaranteed footer panels (screenshot 12) */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 text-left relative z-10">
          {text.sections.footer.features.map((feature, idx) => (
            <div key={idx} className="p-6 rounded-xl border border-fd-border/20 bg-fd-card/35 backdrop-blur-sm">
              <span className="font-semibold text-fd-foreground text-sm block mb-1">
                {feature.title}
              </span>
              <span className="text-xs text-fd-muted-foreground">
                {feature.desc}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full px-6 py-12 border-t border-fd-border/20 relative z-10 bg-fd-background/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5 text-xs text-fd-muted-foreground">
            <Layers className="h-4 w-4 text-brand-lime" />
            <span className="font-semibold text-fd-foreground">LinkedIn Job Explorer</span>
            <span className="text-fd-border/40">·</span>
            <span>{text.sections.footer.built}</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/docs/quickstart" className="text-xs text-fd-muted-foreground hover:text-fd-foreground transition-colors">
              {text.sections.footer.links.docs}
            </Link>
            <Link href="/docs/job-backend/credentials/getCredentialsStatus" className="text-xs text-fd-muted-foreground hover:text-fd-foreground transition-colors">
              {text.sections.footer.links.gateway}
            </Link>
            <Link href="/docs/job-backend/overview" className="text-xs text-fd-muted-foreground hover:text-fd-foreground transition-colors">
              {text.sections.footer.links.jobBackend}
            </Link>
            <Link href="/docs/publisher-backend/overview" className="text-xs text-fd-muted-foreground hover:text-fd-foreground transition-colors">
              {text.sections.footer.links.publisher}
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
