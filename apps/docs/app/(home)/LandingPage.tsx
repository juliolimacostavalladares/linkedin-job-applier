"use client";

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import {
  Layers, Briefcase, Rocket, ArrowRight,
  Zap, Bot, FileText, Terminal, Globe, RefreshCw,
  ImageIcon, ChevronRight, Database, Cpu, Check, Users,
  Search, Play, AlertCircle, ShieldAlert, Award,
  ThumbsUp, MessageSquare, Share2, Send, Bookmark, MoreHorizontal, Sparkles,
  PenTool, BookOpen, FileCheck2, Rss, Network, UserSearch, Code2, CheckCircle2,
  Menu, Code
} from 'lucide-react';
import { translations } from './translations';

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
                  setTimeout(() => {
                    setApplyState('success');
                    // Increment metrics
                    setSubmissionsCount(prev => prev + 1);
                    setSuccessRate(prev => Math.min(99.2, parseFloat((prev + 0.1).toFixed(1))));
                    setTokensSaved(prev => parseFloat((prev + 1.2).toFixed(1)));
                    setTimeout(() => {
                      setApplyState('idle');
                    }, 4000);
                  }, 100);
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
    <div className="relative w-full rounded-xl border border-[#2f3539] bg-[#1d2226] overflow-hidden shadow-2xl z-10 transition-transform duration-500 hover:scale-[1.002]">
      {/* simulated premium linkedin top nav bar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-[#2f3539] bg-[#1d2226]">
        <div className="flex items-center gap-4 w-full max-w-sm">
          {/* logo wrapper */}
          <div className="flex items-center justify-center size-8.5 rounded bg-[#0a66c2] text-white font-bold text-lg select-none shrink-0 shadow-md">
            in
          </div>
          {/* simulated search bar */}
          <div className="relative w-full hidden sm:block">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8f969b]">
              <Search className="size-3.5" />
            </span>
            <input
              type="text"
              readOnly
              placeholder={t.nav.searchPlaceholder}
              className="w-full bg-[#12161a] border border-[#2f3539] rounded-md py-1.5 pl-9 pr-4 text-xs text-[#e9ecef] font-medium outline-none"
            />
          </div>
        </div>

        {/* nav navigation items */}
        <div className="flex items-center gap-4 md:gap-6">
          <button
            onClick={() => setActiveTab('feed')}
            className={`flex flex-col items-center gap-0.5 text-[10px] md:text-xs font-semibold py-1 border-b-2 transition-all cursor-pointer ${
              activeTab === 'feed'
                ? 'border-[#70b5f9] text-[#70b5f9]'
                : 'border-transparent text-[#8f969b] hover:text-[#e9ecef]'
            }`}
          >
            <Briefcase className="size-4" />
            <span className="hidden md:inline">{t.nav.jobs}</span>
          </button>
          <button
            onClick={() => setActiveTab('publisher')}
            className={`flex flex-col items-center gap-0.5 text-[10px] md:text-xs font-semibold py-1 border-b-2 transition-all cursor-pointer ${
              activeTab === 'publisher'
                ? 'border-[#70b5f9] text-[#70b5f9]'
                : 'border-transparent text-[#8f969b] hover:text-[#e9ecef]'
            }`}
          >
            <ImageIcon className="size-4" />
            <span className="hidden md:inline">{t.nav.publisher}</span>
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`flex flex-col items-center gap-0.5 text-[10px] md:text-xs font-semibold py-1 border-b-2 transition-all cursor-pointer ${
              activeTab === 'logs'
                ? 'border-[#70b5f9] text-[#70b5f9]'
                : 'border-transparent text-[#8f969b] hover:text-[#e9ecef]'
            }`}
          >
            <Terminal className="size-4" />
            <span className="hidden md:inline">{t.nav.logs}</span>
          </button>

          {/* status monitor */}
          <div className="h-6 w-[1px] bg-[#2f3539]" />
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
      <div className="grid grid-cols-1 lg:grid-cols-12 p-4 gap-4 text-left bg-[#090e11] min-h-[500px]">
        {/* Left Column: Sync center & metrics (Takes 3 columns) */}
        <div className="lg:col-span-3 space-y-4">
          {/* Card: Sync Status */}
          <div className="p-4 rounded-xl border border-[#2f3539] bg-[#1d2226] shadow-sm">
            <h4 className="text-xs font-bold text-[#e9ecef] tracking-wider uppercase mb-3 flex items-center gap-1.5 border-b border-[#2f3539] pb-2">
              <Database className="size-3.5 text-[#70b5f9]" />
              {t.syncCenter.title}
            </h4>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-[11px] text-[#8f969b]">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  {t.syncCenter.cookieStatus}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-[#8f969b]">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  {t.syncCenter.apiStatus}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-[#8f969b]">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  {t.syncCenter.dbStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Card: Dynamic Analytics */}
          <div className="p-4 rounded-xl border border-[#2f3539] bg-[#1d2226] shadow-sm">
            <h4 className="text-xs font-bold text-[#e9ecef] tracking-wider uppercase mb-3 flex items-center gap-1.5 border-b border-[#2f3539] pb-2">
              <Cpu className="size-3.5 text-[#70b5f9]" />
              {t.syncCenter.metricsTitle}
            </h4>
            <div className="space-y-3.5">
              <div>
                <span className="text-[10px] text-[#8f969b] block mb-0.5">{t.syncCenter.appliedCount}</span>
                <span className="text-xl font-bold font-mono text-[#e9ecef]">{submissionsCount}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#8f969b] block mb-0.5">{t.syncCenter.successRate}</span>
                <span className="text-xl font-bold font-mono text-emerald-400">{successRate}%</span>
              </div>
              <div>
                <span className="text-[10px] text-[#8f969b] block mb-0.5">{t.syncCenter.tokensSaved}</span>
                <span className="text-xl font-bold font-mono text-[#70b5f9]">{tokensSaved}k</span>
              </div>
            </div>
          </div>

          {/* Card: Active Search params */}
          <div className="p-4 rounded-xl border border-[#2f3539] bg-[#1d2226] shadow-sm">
            <h4 className="text-xs font-bold text-[#e9ecef] tracking-wider uppercase mb-3 flex items-center gap-1.5 border-b border-[#2f3539] pb-2">
              <Search className="size-3.5 text-[#70b5f9]" />
              {t.syncCenter.searchParams}
            </h4>
            <div className="space-y-3 text-[11px]">
              <div>
                <span className="text-[9px] font-bold text-[#8f969b] block tracking-wider uppercase mb-1">
                  {t.syncCenter.keywords}
                </span>
                <div className="flex flex-wrap gap-1">
                  <span className="px-1.5 py-0.5 rounded bg-[#12161a] border border-[#2f3539] text-[10px] text-[#70b5f9] font-mono font-semibold">
                    TypeScript
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-[#12161a] border border-[#2f3539] text-[10px] text-[#70b5f9] font-mono font-semibold">
                    React
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-[#12161a] border border-[#2f3539] text-[10px] text-[#70b5f9] font-mono font-semibold">
                    Node.js
                  </span>
                </div>
              </div>
              <div>
                <span className="text-[9px] font-bold text-[#8f969b] block tracking-wider uppercase mb-1">
                  {t.syncCenter.location}
                </span>
                <span className="text-[#e9ecef] font-mono font-medium">Remote / Worldwide</span>
              </div>
              <div>
                <span className="text-[9px] font-bold text-[#8f969b] block tracking-wider uppercase mb-1">
                  {t.syncCenter.applyMode}
                </span>
                <span className="text-emerald-400 font-mono font-medium">Gemini 1.5 Pro</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center / Tab Contents (Takes 6 columns) */}
        <div className="lg:col-span-6 flex flex-col justify-between border-x border-[#2f3539] px-0 lg:px-4 min-h-[450px]">
          {/* TAB 1: Live Job Automation Feed */}
          {activeTab === 'feed' && (
            <div className="space-y-4 flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#e9ecef]">{t.feed.title}</h3>
                <button
                  onClick={runSimulation}
                  disabled={applyState !== 'idle'}
                  className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    applyState !== 'idle'
                      ? 'bg-[#2f3539] text-[#8f969b] cursor-not-allowed'
                      : 'bg-[#0a66c2] text-white hover:bg-[#004182] hover:scale-[1.01]'
                  }`}
                >
                  <Play className="size-3 fill-white" />
                  {t.feed.runBtn}
                </button>
              </div>

              {/* Feed simulation area */}
              <div className="space-y-4 relative max-h-[450px] overflow-y-auto pr-1">
                {/* Search overlay indicator */}
                {applyState === 'searching' && (
                  <div className="p-5 rounded-xl border border-[#0a66c2]/30 bg-[#1d2226] flex flex-col items-center justify-center text-center animate-pulse py-8">
                    <RefreshCw className="size-7 text-[#70b5f9] animate-spin mb-3" />
                    <span className="text-xs text-[#e9ecef] font-semibold">Querying LinkedIn Voyager API...</span>
                    <span className="text-[10px] text-[#8f969b] mt-1">Keywords: "TypeScript, React"</span>
                  </div>
                )}

                {/* Job Found and answering simulation */}
                {(applyState === 'matching' || applyState === 'solving' || applyState === 'tailoring' || applyState === 'success') && (
                  <div className="rounded-xl border border-[#2f3539] bg-[#1d2226] overflow-hidden shadow-md animate-fade-in transition-all">
                    {/* card header */}
                    <div className="p-4 border-b border-[#2f3539] bg-[#12161a]/30 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="size-9 rounded bg-[#0a66c2] text-white flex items-center justify-center font-bold text-sm">
                          V
                        </div>
                        <div>
                          <h5 className="text-xs font-bold text-[#e9ecef]">{t.feed.mockJobs.job1.title}</h5>
                          <span className="text-[10px] text-[#8f969b]">{t.feed.mockJobs.job1.company}</span>
                        </div>
                      </div>
                      <div className="text-[10px] bg-emerald-500/10 text-emerald-400 font-bold px-2 py-0.5 rounded border border-emerald-500/20">
                        {t.feed.match}: 94%
                      </div>
                    </div>

                    {/* AI Questionnaire logs */}
                    <div className="p-4 space-y-3 font-mono text-[11px] bg-[#12161a]/20">
                      {applyState === 'matching' && (
                        <div className="flex items-center gap-1.5 text-[#8f969b] text-center justify-center py-4">
                          <Cpu className="size-4 text-[#70b5f9] animate-spin" />
                          <span>Matching qualifications with database profiles...</span>
                        </div>
                      )}

                      {/* Question 1 */}
                      {(applyState === 'solving' || applyState === 'tailoring' || applyState === 'success') && (
                        <div className="p-2.5 rounded bg-[#090e11] border border-[#2f3539]">
                          <span className="text-[#70b5f9] block mb-1">Q1: {t.feed.mockJobs.job1.q1}</span>
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
                        <div className="p-2.5 rounded bg-[#090e11] border border-[#2f3539]">
                          <span className="text-[#70b5f9] block mb-1">Q2: {t.feed.mockJobs.job1.q2}</span>
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
                    <div className="px-4 py-2.5 bg-[#12161a]/30 border-t border-[#2f3539] flex items-center justify-between text-[10px]">
                      <div className="flex items-center gap-1.5 text-[#8f969b]">
                        <Bot className="size-3.5 text-[#70b5f9]" />
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
                <div className="rounded-xl border border-[#2f3539] bg-[#1d2226] opacity-60 overflow-hidden text-xs">
                  <div className="p-3 bg-[#12161a]/10 border-b border-[#2f3539] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="size-8 rounded bg-indigo-600 text-white flex items-center justify-center font-bold">O</div>
                      <div>
                        <h6 className="font-bold text-[#e9ecef]">{t.feed.mockJobs.job2.title}</h6>
                        <span className="text-[10px] text-[#8f969b]">{t.feed.mockJobs.job2.company}</span>
                      </div>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-500/5">98% Match</span>
                  </div>
                  <div className="p-3 font-mono text-[10px] space-y-1">
                    <div className="text-[#8f969b]">Q: {t.feed.mockJobs.job2.q1}</div>
                    <div className="text-emerald-500/80">A: {t.feed.mockJobs.job2.a1}</div>
                  </div>
                </div>

                <div className="rounded-xl border border-[#2f3539] bg-[#1d2226] opacity-60 overflow-hidden text-xs">
                  <div className="p-3 bg-[#12161a]/10 border-b border-[#2f3539] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="size-8 rounded bg-orange-600 text-white flex items-center justify-center font-bold">S</div>
                      <div>
                        <h6 className="font-bold text-[#e9ecef]">{t.feed.mockJobs.job3.title}</h6>
                        <span className="text-[10px] text-[#8f969b]">{t.feed.mockJobs.job3.company}</span>
                      </div>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-500/5">90% Match</span>
                  </div>
                  <div className="p-3 font-mono text-[10px] space-y-1">
                    <div className="text-[#8f969b]">Q: {t.feed.mockJobs.job3.q1}</div>
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
                <h3 className="text-sm font-bold text-[#e9ecef]">{t.publisher.title}</h3>
                <button
                  onClick={runPublisherSimulation}
                  disabled={publisherState !== 'idle'}
                  className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    publisherState !== 'idle'
                      ? 'bg-[#2f3539] text-[#8f969b] cursor-not-allowed'
                      : 'bg-[#0a66c2] text-white hover:bg-[#004182]'
                  }`}
                >
                  <RefreshCw className={`size-3 ${publisherState === 'generating' ? 'animate-spin' : ''}`} />
                  {t.publisher.btnText}
                </button>
              </div>

              <div className="p-4 rounded-xl border border-[#2f3539] bg-[#1d2226] space-y-4 flex-1">
                {publisherState === 'generating' && (
                  <div className="p-6 rounded-lg border border-[#2f3539] bg-[#090e11] flex flex-col items-center justify-center text-center animate-pulse">
                    <ImageIcon className="size-8 text-[#70b5f9] animate-bounce mb-2" />
                    <span className="text-xs text-[#e9ecef] font-semibold">{t.publisher.generating}</span>
                    <span className="text-[10px] text-[#8f969b] mt-1">Topic: Next.js Server Actions</span>
                  </div>
                )}

                {publisherState === 'success' && (
                  <div className="p-6 rounded-lg border border-[#2f3539] bg-[#090e11] flex flex-col items-center justify-center text-center">
                    <Check className="size-8 text-emerald-400 mb-2" />
                    <span className="text-xs text-emerald-400 font-semibold">{t.publisher.published}!</span>
                    <span className="text-[10px] text-[#8f969b] mt-1">File: RSC-Survival-Guide.pdf (12 Slides)</span>
                  </div>
                )}

                {/* Queue status */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-[#8f969b] tracking-wider uppercase block">
                    {t.publisher.activeQueue}
                  </span>
                  <div className="space-y-2 text-xs font-mono">
                    <div className="p-2.5 rounded bg-[#090e11] border border-[#2f3539] flex justify-between items-center">
                      <div>
                        <span className="text-[#e9ecef] font-bold">{t.publisher.carousels.c1}</span>
                        <span className="text-[9px] text-[#8f969b] block">Size: 4.8MB · Slides: 10</span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[9px] font-bold border border-emerald-500/20 uppercase">
                        {t.publisher.ready}
                      </span>
                    </div>

                    <div className="p-2.5 rounded bg-[#090e11] border border-[#2f3539] flex justify-between items-center opacity-65">
                      <div>
                        <span className="text-[#e9ecef] font-bold">{t.publisher.carousels.c2}</span>
                        <span className="text-[9px] text-[#8f969b] block">Size: 3.2MB · Slides: 8</span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-[#0a66c2]/15 text-[#70b5f9] text-[9px] font-bold border border-[#0a66c2]/30 uppercase">
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
              <h3 className="text-sm font-bold text-[#e9ecef]">{t.publisher.activeQueue}</h3>
              <div className="p-3 bg-[#090e11] border border-[#2f3539] rounded-lg flex-1 font-mono text-[10px] text-emerald-400 space-y-1.5 overflow-y-auto max-h-[360px] shadow-inner text-left">
                <div>[06:12:01] <span className="text-[#70b5f9]">INFO</span> job-backend starting SQLite migrations...</div>
                <div>[06:12:02] <span className="text-emerald-500 font-semibold">SUCCESS</span> Migration 05_add_subscription_status successfully applied.</div>
                <div>[06:12:02] <span className="text-[#70b5f9]">INFO</span> Voyager API connection established for user session (li_at).</div>
                <div>[06:12:05] <span className="text-[#70b5f9]">BULLMQ</span> Worker queue initialized on port 6379 (Redis).</div>
                <div>[06:12:06] <span className="text-[#70b5f9]">INFO</span> job-backend service active on port 3001.</div>
                <div>[06:12:07] <span className="text-[#70b5f9]">INFO</span> gateway-api service active on port 3002.</div>
                <div>[06:12:08] <span className="text-[#70b5f9]">INFO</span> publisher-backend service active on port 3003.</div>
                <div>[06:12:10] <span className="text-emerald-500 font-semibold">SYNC</span> Chrome extension synchronized 2 cookies in 120ms.</div>
                <div>[06:12:12] <span className="text-[#70b5f9]">INFO</span> Running active search query for keywords: "TypeScript, React".</div>
                <div className="animate-pulse">[06:12:15] <span className="text-emerald-400">BULLMQ</span> Waiting for new execution triggers...</div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Microservices Status & Tools (Takes 3 columns) */}
        <div className="lg:col-span-3 space-y-4">
          {/* Card: Microservices Network */}
          <div className="p-4 rounded-xl border border-[#2f3539] bg-[#1d2226] shadow-sm">
            <h4 className="text-xs font-bold text-[#e9ecef] tracking-wider uppercase mb-3 flex items-center gap-1.5 border-b border-[#2f3539] pb-2">
              <Layers className="size-3.5 text-[#70b5f9]" />
              {t.publisher.microservices}
            </h4>
            <div className="space-y-2.5 font-mono text-[10px]">
              <div className="flex items-center justify-between p-2 rounded bg-[#090e11] border border-[#2f3539]">
                <span className="text-[#e9ecef] font-semibold">job-backend</span>
                <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold text-[8px] uppercase">
                  Active
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-[#090e11] border border-[#2f3539]">
                <span className="text-[#e9ecef] font-semibold">gateway-api</span>
                <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold text-[8px] uppercase">
                  Active
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-[#090e11] border border-[#2f3539]">
                <span className="text-[#e9ecef] font-semibold">publisher</span>
                <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold text-[8px] uppercase">
                  Active
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-[#090e11] border border-[#2f3539]">
                <span className="text-[#e9ecef] font-semibold">chrome-ext</span>
                <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold text-[8px] uppercase">
                  Synced
                </span>
              </div>
            </div>
          </div>

          {/* Quick instructions / tips info card */}
          <div className="p-4 rounded-xl border border-[#2f3539] bg-[#1d2226] text-xs space-y-2 shadow-sm">
            <span className="font-bold text-[#e9ecef] block flex items-center gap-1.5 text-[11px] text-orange-400">
              <Award className="size-3.5 text-[#70b5f9]" />
              Developer Tip
            </span>
            <p className="text-[#8f969b] leading-relaxed text-[11px]">
              Ensure the Chrome Extension captures the session correctly by signing in to LinkedIn first. Once synced, you do not need to keep LinkedIn tabs open.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Rebranded LinkedIn Feed Post Component (narrative section replacement)
function LinkedInFeedPost({ lang }: { lang: 'pt-BR' | 'en' }) {
  const text = translations[lang];
  const [likes, setLikes] = useState(124);
  const [hasLiked, setHasLiked] = useState(false);

  const toggleLike = () => {
    if (hasLiked) {
      setLikes(prev => prev - 1);
      setHasLiked(false);
    } else {
      setLikes(prev => prev + 1);
      setHasLiked(true);
    }
  };

  return (
    <div className="max-w-3xl mx-auto rounded-xl border border-[#2f3539] bg-[#1d2226] overflow-hidden shadow-md text-left mt-8">
      {/* Post header user info */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="size-11 rounded-full bg-[#0a66c2] text-white flex items-center justify-center font-bold text-lg border border-[#2f3539]">
            in
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-[#e9ecef] hover:text-[#70b5f9] hover:underline cursor-pointer">
                LinkedIn Job Explorer
              </span>
              <span className="text-[10px] bg-[#2f3539] text-[#8f969b] px-1.5 py-0.2 rounded font-bold uppercase">
                Bot · 1st
              </span>
            </div>
            <span className="text-[11px] text-[#8f969b] block leading-normal">
              Developer Toolchain · Open Source Core Platform
            </span>
            <span className="text-[10px] text-[#8f969b] block mt-0.5">
              2h · Edited · 🌐
            </span>
          </div>
        </div>
        <button className="text-[#8f969b] hover:text-[#e9ecef] p-1.5 rounded-full hover:bg-[#2f3539]/20 cursor-pointer">
          <MoreHorizontal className="size-5" />
        </button>
      </div>

      {/* Post text content */}
      <div className="px-4 pb-3 pt-1 text-sm text-[#e9ecef] leading-relaxed space-y-3">
        <p>{text.hero.subtitle}</p>
        <p className="text-[#70b5f9] font-medium hover:underline cursor-pointer">
          #typescript #automation #linkedinapi #geminiai #opensource #monorepo
        </p>
      </div>

      {/* Reactions stats row */}
      <div className="px-4 py-2 border-t border-[#2f3539]/50 flex items-center justify-between text-[11px] text-[#8f969b]">
        <div className="flex items-center gap-1">
          <span className="flex items-center justify-center size-4.5 rounded-full bg-[#0a66c2] text-white text-[9px] font-bold">
            👍
          </span>
          <span className="flex items-center justify-center size-4.5 rounded-full bg-emerald-500 text-white text-[9px] font-bold -ml-1.5">
            👏
          </span>
          <span className="hover:text-[#70b5f9] hover:underline cursor-pointer ml-1">
            {likes} likes
          </span>
        </div>
        <div className="flex gap-2">
          <span className="hover:text-[#70b5f9] hover:underline cursor-pointer">12 comments</span>
          <span>•</span>
          <span className="hover:text-[#70b5f9] hover:underline cursor-pointer">4 shares</span>
        </div>
      </div>

      {/* Post Actions footer panel */}
      <div className="px-2 py-1 border-t border-[#2f3539] bg-[#12161a]/30 flex items-center justify-around text-xs font-semibold text-[#8f969b]">
        <button
          onClick={toggleLike}
          className={`flex items-center gap-2 py-2 px-3 rounded hover:bg-[#2f3539]/20 transition-colors w-full justify-center cursor-pointer ${
            hasLiked ? 'text-[#70b5f9]' : 'hover:text-[#e9ecef]'
          }`}
        >
          <ThumbsUp className={`size-4.5 ${hasLiked ? 'fill-[#70b5f9]/20' : ''}`} />
          <span>Like</span>
        </button>

        <button className="flex items-center gap-2 py-2 px-3 rounded hover:bg-[#2f3539]/20 hover:text-[#e9ecef] transition-colors w-full justify-center cursor-pointer">
          <MessageSquare className="size-4.5" />
          <span>Comment</span>
        </button>

        <button className="flex items-center gap-2 py-2 px-3 rounded hover:bg-[#2f3539]/20 hover:text-[#e9ecef] transition-colors w-full justify-center cursor-pointer">
          <Share2 className="size-4.5" />
          <span>Share</span>
        </button>

        <button className="flex items-center gap-2 py-2 px-3 rounded hover:bg-[#2f3539]/20 hover:text-[#e9ecef] transition-colors w-full justify-center cursor-pointer">
          <Send className="size-4.5" />
          <span>Send</span>
        </button>
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
      <div className="lg:col-span-7 relative flex flex-col rounded-xl border border-[#2f3539] bg-[#1d2226] overflow-hidden shadow-xl min-h-[320px]">
        {/* Editor bar */}
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
            onClick={() => {
              navigator.clipboard.writeText(active.code);
            }}
            className="text-[10px] text-[#e9ecef] border border-[#2f3539] px-2.5 py-0.5 rounded bg-[#12161a] hover:bg-[#2f3539] transition-all cursor-pointer"
          >
            Copy
          </button>
        </div>
        {/* Editor code area */}
        <div className="flex-1 p-5 font-mono text-[13px] text-[#e9ecef] bg-[#12161a]/10 overflow-auto text-left leading-relaxed">
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
                  ? 'bg-[#0a66c2] text-white border-[#0a66c2]'
                  : 'bg-[#1d2226] border-[#2f3539] text-[#8f969b] hover:text-[#e9ecef]'
              }`}
            >
              GraphQL
            </button>
            <button
              onClick={() => setTab('rest')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold border transition-all cursor-pointer ${
                tab === 'rest'
                  ? 'bg-[#0a66c2] text-white border-[#0a66c2]'
                  : 'bg-[#1d2226] border-[#2f3539] text-[#8f969b] hover:text-[#e9ecef]'
              }`}
            >
              REST API
            </button>
            <button
              onClick={() => setTab('cli')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold border transition-all cursor-pointer ${
                tab === 'cli'
                  ? 'bg-[#0a66c2] text-white border-[#0a66c2]'
                  : 'bg-[#1d2226] border-[#2f3539] text-[#8f969b] hover:text-[#e9ecef]'
              }`}
            >
              CLI Automation
            </button>
          </div>

          <h4 className="text-xl font-bold text-[#e9ecef] mb-3">{active.title}</h4>
          <p className="text-sm text-[#8f969b] mb-6 leading-relaxed">{active.desc}</p>

          <ul className="space-y-2">
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

function LinkedInCarouselPreview({ lang }: { lang: 'pt-BR' | 'en' }) {
  const t = translations[lang].landingPlayground.carousel;
  const [theme, setTheme] = useState<'premium' | 'purple' | 'yellow' | 'clean'>('premium');
  const [slideIndex, setSlideIndex] = useState(0);

  const themeClasses = {
    premium: "bg-[#161b22] border border-[#2f3539] text-[#e9ecef]",
    purple: "bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white",
    yellow: "bg-yellow-400 text-black",
    clean: "bg-white border border-[#e1e9ee] text-[#12161a]"
  };

  const activeSlide = t.slides[slideIndex] as unknown as { title: string; subtitle?: string; content?: string };

  return (
    <div className="rounded-xl border border-[#2f3539] bg-[#1d2226] p-6 flex flex-col justify-between shadow-md text-left min-h-[460px]">
      <div>
        <h4 className="text-sm font-bold text-[#e9ecef] tracking-wider uppercase mb-2 flex items-center gap-2">
          <ImageIcon className="size-4 text-[#70b5f9]" />
          {t.title}
        </h4>
        <p className="text-xs text-[#8f969b] mb-6 leading-relaxed">
          {t.subtitle}
        </p>

        {/* Carousel Theme Selectors */}
        <div className="flex gap-2 mb-6">
          {(Object.keys(themeClasses) as Array<keyof typeof themeClasses>).map((k) => (
            <button
              key={k}
              onClick={() => setTheme(k)}
              className={`px-2.5 py-1 rounded text-[10px] font-semibold transition-all border cursor-pointer ${
                theme === k
                  ? 'bg-[#0a66c2] text-white border-[#0a66c2]'
                  : 'bg-[#12161a] border-[#2f3539] text-[#8f969b] hover:text-[#e9ecef]'
              }`}
            >
              {t.themes[k]}
            </button>
          ))}
        </div>

        {/* Simulated Slide Canvas Card */}
        <div className={`aspect-square w-full max-w-[340px] mx-auto rounded-lg p-6 flex flex-col justify-between shadow-inner relative overflow-hidden transition-all duration-300 ${themeClasses[theme]}`}>
          {/* Slide author badge */}
          <div className="flex items-center gap-2">
            <div className={`size-7 rounded-full flex items-center justify-center font-bold text-[10px] ${theme === 'yellow' ? 'bg-black text-yellow-400' : 'bg-[#0a66c2] text-white'}`}>
              in
            </div>
            <div>
              <span className={`text-[10px] font-bold block leading-none ${theme === 'clean' ? 'text-[#12161a]' : 'text-current'}`}>
                Julio Lima
              </span>
              <span className={`text-[8px] opacity-60 block mt-0.5 ${theme === 'clean' ? 'text-[#8f969b]' : 'text-current'}`}>
                LinkedIn Automation Agent
              </span>
            </div>
          </div>

          {/* Slide Body */}
          <div className="my-auto text-left space-y-3">
            <h3 className={`text-base sm:text-lg font-extrabold leading-snug tracking-tight ${theme === 'clean' ? 'text-[#12161a]' : 'text-current'}`}>
              {activeSlide.title}
            </h3>
            {activeSlide.content && (
              <p className={`text-[11px] font-mono whitespace-pre-line leading-relaxed opacity-85 ${theme === 'clean' ? 'text-[#24292f]' : 'text-current'}`}>
                {activeSlide.content}
              </p>
            )}
            {activeSlide.subtitle && (
              <span className={`text-[10px] block font-semibold opacity-75 ${theme === 'clean' ? 'text-[#8f969b]' : 'text-current'}`}>
                {activeSlide.subtitle}
              </span>
            )}
          </div>

          {/* Slide navigation/pagination indicators inside slide */}
          <div className="flex justify-between items-center text-[9px] opacity-60">
            <span>in/job-explorer</span>
            <span>{slideIndex + 1} / {t.slides.length}</span>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center mt-6 pt-4 border-t border-[#2f3539]/50">
        <button
          onClick={() => setSlideIndex(prev => Math.max(0, prev - 1))}
          disabled={slideIndex === 0}
          className={`px-3 py-1 rounded text-xs transition-colors cursor-pointer ${
            slideIndex === 0 ? 'text-[#2f3539] cursor-not-allowed' : 'text-[#70b5f9] hover:bg-[#2f3539]/10'
          }`}
        >
          ← Prev
        </button>

        {/* Dots */}
        <div className="flex gap-1.5">
          {t.slides.map((_: unknown, idx: number) => (
            <span
              key={idx}
              className={`size-1.5 rounded-full transition-all ${
                slideIndex === idx ? 'bg-[#70b5f9] scale-125' : 'bg-[#2f3539]'
              }`}
            />
          ))}
        </div>

        <button
          onClick={() => setSlideIndex(prev => Math.min(t.slides.length - 1, prev + 1))}
          disabled={slideIndex === t.slides.length - 1}
          className={`px-3 py-1 rounded text-xs transition-colors cursor-pointer ${
            slideIndex === t.slides.length - 1 ? 'text-[#2f3539] cursor-not-allowed' : 'text-[#70b5f9] hover:bg-[#2f3539]/10'
          }`}
        >
          Next →
        </button>
      </div>
    </div>
  );
}

function AIResumeOptimizerPreview({ lang }: { lang: 'pt-BR' | 'en' }) {
  const t = translations[lang].landingPlayground.resume;
  const [viewState, setViewState] = useState<'original' | 'optimized'>('optimized');
  const [score, setScore] = useState(94);

  useEffect(() => {
    setScore(viewState === 'original' ? 58 : 94);
  }, [viewState]);

  return (
    <div className="rounded-xl border border-[#2f3539] bg-[#1d2226] p-6 flex flex-col justify-between shadow-md text-left min-h-[460px]">
      <div>
        <h4 className="text-sm font-bold text-[#e9ecef] tracking-wider uppercase mb-2 flex items-center gap-2">
          <Bot className="size-4 text-[#70b5f9]" />
          {t.title}
        </h4>
        <p className="text-xs text-[#8f969b] mb-6 leading-relaxed">
          {t.subtitle}
        </p>

        {/* View state selectors */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setViewState('original')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold border transition-all cursor-pointer ${
              viewState === 'original'
                ? 'bg-[#0a66c2] text-white border-[#0a66c2]'
                : 'bg-[#12161a] border-[#2f3539] text-[#8f969b] hover:text-[#e9ecef]'
            }`}
          >
            {t.original}
          </button>
          <button
            onClick={() => setViewState('optimized')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold border transition-all cursor-pointer ${
              viewState === 'optimized'
                ? 'bg-[#0a66c2] text-white border-[#0a66c2]'
                : 'bg-[#12161a] border-[#2f3539] text-[#8f969b] hover:text-[#e9ecef]'
            }`}
          >
            {t.optimized}
          </button>
        </div>

        {/* CV Match Card Preview */}
        <div className="p-4 rounded-lg bg-[#090e11] border border-[#2f3539] space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-[11px] font-bold text-[#e9ecef] tracking-wider uppercase">
              {t.analysis}
            </span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded font-mono border transition-all ${
              viewState === 'original'
                ? 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
            }`}>
              {t.match}: {score}%
            </span>
          </div>

          {/* Progress bar match */}
          <div className="w-full bg-[#1d2226] rounded-full h-2 overflow-hidden border border-[#2f3539]">
            <div
              className={`h-full transition-all duration-500 ${
                viewState === 'original' ? 'bg-orange-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${score}%` }}
            />
          </div>

          {/* Skill items tailoring analysis */}
          <div className="space-y-2.5 pt-2 text-xs">
            <div className="flex items-center justify-between p-2 rounded bg-[#161b22]/50 border border-[#2f3539]/30">
              <span className="text-[#8f969b]">{t.skills.s1}</span>
              <span className="font-semibold text-emerald-400 flex items-center gap-1">
                <Check className="size-3.5" /> Matched
              </span>
            </div>

            <div className="flex items-center justify-between p-2 rounded bg-[#161b22]/50 border border-[#2f3539]/30">
              <span className="text-[#8f969b]">{t.skills.s2}</span>
              {viewState === 'original' ? (
                <span className="font-semibold text-orange-400 flex items-center gap-1">
                  <AlertCircle className="size-3.5" /> Missing
                </span>
              ) : (
                <span className="font-semibold text-emerald-400 flex items-center gap-1 font-mono text-[11px] animate-pulse">
                  [+] AI Auto-Inserted
                </span>
              )}
            </div>

            <div className="flex items-center justify-between p-2 rounded bg-[#161b22]/50 border border-[#2f3539]/30">
              <span className="text-[#8f969b]">{t.skills.s3}</span>
              {viewState === 'original' ? (
                <span className="font-semibold text-orange-400 flex items-center gap-1">
                  <AlertCircle className="size-3.5" /> Missing
                </span>
              ) : (
                <span className="font-semibold text-emerald-400 flex items-center gap-1 font-mono text-[11px] animate-pulse">
                  [+] AI Auto-Tailored
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="text-[10px] text-[#8f969b] leading-normal pt-4 border-t border-[#2f3539]/50 flex items-center gap-1.5">
        <Sparkles className="size-3.5 text-[#70b5f9]" />
        <span>
          {viewState === 'original'
            ? "Original CV lacks job contextual search phrases."
            : "Optimization complete via Gemini LLM. Ready for Easy Apply submission."}
        </span>
      </div>
    </div>
  );
}

export default function LandingPage({ lang }: { lang: 'pt-BR' | 'en' }) {
  const text = translations[lang];
  const [activeTab, setActiveTab] = useState<'dashboard' | 'graphql' | 'resume' | 'carousel' | 'post'>('dashboard');

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
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none z-0 bg-radial from-[#0a66c2]/10 via-[#0a66c2]/2 to-transparent blur-3xl opacity-80" />

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
            {text.hero.titleNormal}
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

        {/* Abstract Dashboard Mockup with Node Graph background */}
        <div className="mt-20 relative mx-auto w-full max-w-5xl rounded-2xl border border-white/10 bg-zinc-900/50 p-4 backdrop-blur-sm shadow-2xl overflow-hidden transition-all duration-300 hover:border-white/20">
          <NetworkNodesDither />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent z-10 pointer-events-none rounded-2xl" />

          {/* Mockup Window */}
          <div className="rounded-xl border border-white/5 bg-zinc-950 overflow-hidden relative z-10">
            <div className="flex items-center border-b border-white/5 px-4 py-3 bg-zinc-900/50">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-red-500/50" />
                <div className="h-3 w-3 rounded-full bg-yellow-500/50" />
                <div className="h-3 w-3 rounded-full bg-green-500/50" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 md:h-[400px]">
              <div className="col-span-1 border border-white/5 bg-white/[0.02] rounded-lg p-4 flex flex-col gap-4">
                <div className="h-8 w-1/3 rounded-md bg-white/10" />
                <div className="space-y-2 flex-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center gap-3 p-2 rounded-md bg-white/5 border border-white/5">
                      <Zap className="h-4 w-4 text-blue-400 shrink-0" />
                      <div className="h-2 w-full rounded-full bg-white/10" />
                    </div>
                  ))}
                </div>
              </div>
              <div className="col-span-1 md:col-span-2 border border-blue-500/20 bg-blue-500/[0.02] rounded-lg p-6 flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4">
                  <div className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2 py-1 text-xs text-blue-400 border border-blue-500/20 font-mono">
                    <Code className="h-3 w-3" />
                    GraphQL
                  </div>
                </div>
                <div className="h-6 w-1/4 rounded-md bg-blue-500/20 mb-6" />
                <div className="flex-1 w-full rounded-md bg-zinc-950 border border-white/5 p-4 font-mono text-xs sm:text-sm text-slate-500 overflow-auto text-left leading-relaxed">
                  <span className="text-pink-400">query</span> {'{'} <br />
                  &nbsp;&nbsp;jobs(limit: <span className="text-orange-300">50</span>) {'{'} <br />
                  &nbsp;&nbsp;&nbsp;&nbsp;title <br />
                  &nbsp;&nbsp;&nbsp;&nbsp;easyApply <br />
                  &nbsp;&nbsp;&nbsp;&nbsp;aiMatchScore <br />
                  &nbsp;&nbsp;{'}'} <br />
                  {'}'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* EcosystemFeatures Section */}
      <section id="features" className="w-full px-6 py-24 border-t border-[#2f3539] bg-[#12161a]/15 z-10 relative">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16">
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
              <div className="relative z-10">
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
                    <div className="h-8 w-8 rounded bg-blue-500/20 flex items-center justify-center shrink-0">
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
                    <div className="h-8 w-8 rounded bg-purple-500/20 flex items-center justify-center shrink-0">
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
              <div className="relative z-10">
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
              <div className="relative z-10">
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
                  <div className="flex items-center gap-2 rounded bg-white/5 px-2 py-1.5 text-xs font-semibold text-slate-300 hover:bg-white/10 transition-colors">
                    <span className="text-[10px] font-bold text-blue-400 shrink-0">POST</span> /apply
                  </div>
                  <div className="flex items-center gap-2 rounded bg-white/5 px-2 py-1.5 text-xs font-semibold text-slate-300 hover:bg-white/10 transition-colors">
                    <span className="text-[10px] font-bold text-green-400 shrink-0">GET</span> /jobs
                  </div>
                  <div className="flex items-center gap-2 rounded bg-white/5 px-2 py-1.5 text-xs font-semibold text-slate-300 hover:bg-white/10 transition-colors">
                    <span className="text-[10px] font-bold text-blue-400 shrink-0">POST</span> /publish
                  </div>
                </div>
                <div className="flex-1 rounded-lg border border-white/5 bg-zinc-900 p-4 font-mono text-xs shadow-inner overflow-hidden">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Terminal className="h-4 w-4 text-emerald-400" />
                      <span className="text-slate-300 text-xs font-bold">
                        {text.features.docsHub.visual.reqExample}
                      </span>
                    </div>
                    <button className="text-[10px] font-semibold text-slate-500 hover:text-white hover:bg-white/5 px-2 py-0.5 rounded border border-white/5 transition-colors cursor-pointer">
                      {text.features.docsHub.visual.copy}
                    </button>
                  </div>
                  <div className="text-slate-400 leading-relaxed overflow-x-auto whitespace-pre">
                    <span className="text-purple-400">mutation</span> {'{'} <br />
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

      {/* Main Interactive Showcase Playground */}
      <section id="showcase-section" className="w-full px-6 py-20 z-10 relative border-t border-[#2f3539] bg-[#090e11]/50">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#e9ecef]">
              {lang === 'pt-BR' ? 'Explore a Plataforma' : 'Explore the Platform'}
            </h2>
            <p className="text-xs sm:text-sm text-[#8f969b] mt-2 max-w-xl mx-auto leading-relaxed">
              {lang === 'pt-BR'
                ? 'Selecione uma das guias abaixo para testar as ferramentas integradas e seus fluxos interativos de IA.'
                : 'Select one of the tabs below to test the integrated tools and their interactive AI workflows.'}
            </p>
          </div>

          {/* Interactive Showcase Sandbox */}
          <div className="rounded-2xl border border-[#2f3539] bg-[#12161a] overflow-hidden shadow-2xl flex flex-col min-h-[580px]">
            {/* Top Bar navigation */}
            <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-3 bg-[#1d2226]/60 border-b border-[#2f3539]/60">
              {/* Window buttons */}
              <div className="flex gap-1.5 items-center shrink-0">
                <span className="size-3 rounded-full bg-red-500/80" />
                <span className="size-3 rounded-full bg-yellow-500/80" />
                <span className="size-3 rounded-full bg-green-500/80" />
              </div>

              {/* Showcase Tab selectors */}
              <div className="flex flex-wrap gap-1 bg-[#12161a]/60 p-1 rounded-lg border border-[#2f3539]/40">
                {(['dashboard', 'graphql', 'resume', 'carousel', 'post'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3.5 py-1.5 rounded-md text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                      activeTab === tab
                        ? 'bg-[#0a66c2] text-white border border-[#0a66c2]/30 shadow-sm'
                        : 'text-[#8f969b] hover:text-[#e9ecef] bg-transparent'
                    }`}
                  >
                    {tab === 'dashboard' && text.dashboard.nav.jobs}
                    {tab === 'graphql' && "GraphQL Gateway"}
                    {tab === 'resume' && text.landingPlayground.resume.title}
                    {tab === 'carousel' && text.landingPlayground.carousel.title}
                    {tab === 'post' && (lang === 'pt-BR' ? 'Post no LinkedIn' : 'LinkedIn Feed Post')}
                  </button>
                ))}
              </div>

              {/* Status info */}
              <div className="text-[10px] text-[#8f969b] font-mono select-none">
                ENV: localhost:3000
              </div>
            </div>

            {/* Showcase Viewport */}
            <div className="flex-1 p-6 bg-[#090e11]/80 overflow-y-auto">
              <div className="max-w-4xl mx-auto h-full">
                {activeTab === 'dashboard' && <LinkedInDashboardMockup lang={lang} />}
                {activeTab === 'graphql' && <InteractiveIntegration />}
                {activeTab === 'resume' && <AIResumeOptimizerPreview lang={lang} />}
                {activeTab === 'carousel' && <LinkedInCarouselPreview lang={lang} />}
                {activeTab === 'post' && <LinkedInFeedPost lang={lang} />}
              </div>
            </div>
          </div>
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
                    <div className="pt-1">
                      <h4 className="text-base font-semibold text-white mb-1">{step.title}</h4>
                      <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Execution Log Visualizer Frame */}
            <div className="relative lg:h-[540px] w-full rounded-2xl border border-white/10 bg-zinc-900 p-2 overflow-hidden shadow-2xl text-left">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/20 via-zinc-900 to-purple-900/20 pointer-events-none" />
              <div className="relative h-full w-full rounded-xl border border-white/5 bg-zinc-950 p-6 flex flex-col gap-6">
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <div className="text-xs sm:text-sm font-medium text-slate-300">
                    {text.workflow.log.title}
                  </div>
                  <div className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                </div>

                <div className="flex-1 font-mono text-[11px] sm:text-xs text-slate-400 space-y-4 overflow-y-auto leading-relaxed">
                  <div className="pl-4 border-l-2 border-indigo-500/50">
                    <span className="text-slate-500">[10:42:01]</span> {text.workflow.log.l1}
                  </div>
                  <div className="pl-4 border-l-2 border-blue-500/50">
                    <span className="text-slate-500">[10:42:04]</span> {text.workflow.log.l2}
                    <br />
                    <span className="text-zinc-500 ml-4">{text.workflow.log.l2_sub}</span>
                  </div>
                  <div className="pl-4 border-l-2 border-purple-500/50">
                    <span className="text-slate-500">[10:42:15]</span> {text.workflow.log.l3}
                    <br />
                    <span className="text-zinc-500 ml-4">{text.workflow.log.l3_sub1}</span>
                    <br />
                    <span className="text-purple-400 ml-4 font-semibold">{text.workflow.log.l3_sub2}</span>
                  </div>
                  <div className="pl-4 border-l-2 border-emerald-500/50 py-2.5 bg-emerald-500/5 rounded-r-md">
                    <span className="text-slate-500">[10:42:22]</span> {text.workflow.log.l4}
                    <br />
                    <span className="text-emerald-400 font-bold ml-4">{text.workflow.log.l4_sub}</span>
                  </div>
                  <div className="pl-4 border-l-2 border-blue-500/50 opacity-50">
                    <span className="text-slate-500">[10:42:25]</span> {text.workflow.log.l5}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Audiences Section */}
      <section id="audiences" className="w-full px-6 py-24 relative border-t border-[#2f3539] bg-[#090e11]/30 z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="mx-auto max-w-6xl relative z-10">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl mb-4">
              {text.audiences.title}
            </h2>
            <p className="mx-auto max-w-2xl text-sm sm:text-base text-slate-400 leading-relaxed">
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

                  <ul className="space-y-4 mb-8">
                    {pkg.features.map((feature, fIdx) => (
                      <li key={fIdx} className="flex gap-3 items-start text-xs sm:text-sm text-slate-300">
                        <CheckCircle2 className={`h-4.5 w-4.5 shrink-0 text-emerald-400`} />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  href={`/docs/${lang}/quickstart`}
                  className={`w-full rounded-full py-2.5 text-center text-xs font-semibold tracking-wide transition-all ${
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
              <span className="font-bold text-white text-sm">Job Explorer</span>
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
