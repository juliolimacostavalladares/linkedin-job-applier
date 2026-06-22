"use client";

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import {
  Layers, Briefcase, Rocket, ArrowRight,
  Zap, Bot, FileText, Terminal, Globe, RefreshCw,
  ImageIcon, ChevronRight, Database, Cpu, Check, Users,
  Search, Play, AlertCircle, ShieldAlert, Award,
  ThumbsUp, MessageSquare, Share2, Send, Bookmark, MoreHorizontal, Sparkles
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
        <p>{text.sections.tryItOut.description}</p>
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

  return (
    <main className="relative flex flex-col items-center overflow-hidden bg-[#090e11] text-[#e9ecef] min-h-screen">
      {/* Background radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none z-0 bg-radial from-[#0a66c2]/10 via-[#0a66c2]/2 to-transparent blur-3xl opacity-80" />

      {/* Hero Section */}
      <section className="relative w-full px-6 pt-20 pb-20 overflow-hidden border-b border-[#2f3539]">
        <div className="absolute inset-0 z-0 pointer-events-none" />

        <div className="relative z-10 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-8">
          {/* Left Hero Column */}
          <div className="lg:col-span-7 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-[#1d2226] border border-[#2f3539] text-[#70b5f9] text-xs font-bold mb-8">
              <span className="flex h-1.5 w-1.5 rounded-full bg-[#70b5f9] animate-pulse" />
              {text.hero.badge}
            </div>

            <h1 className="text-4xl sm:text-6xl md:text-[66px] font-extrabold tracking-tight text-[#e9ecef] mb-6 leading-[1.08]">
              {text.hero.title1}
              <br />
              <span className="text-[#70b5f9]">{text.hero.title2}</span>, <span className="text-[#e9ecef]">{text.hero.title3}</span>.
            </h1>

            <p className="text-base sm:text-lg text-[#8f969b] mb-8 max-w-lg leading-relaxed">
              {text.hero.description}
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/docs/quickstart"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-bold text-white bg-[#0a66c2] hover:bg-[#004182] rounded-full shadow-md shadow-[#0a66c2]/20 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 cursor-pointer"
              >
                {text.hero.getStarted}
              </Link>
              <Link
                href="https://github.com/juliolimacostavalladares/linkedin-job-applier"
                target="_blank"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold text-[#e9ecef] bg-[#1d2226] hover:bg-[#2f3539] border border-[#2f3539] rounded-full transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
              >
                {text.hero.openGithub}
              </Link>
            </div>
          </div>

          {/* Right Hero Column: logo.svg */}
          <div className="lg:col-span-5 relative flex justify-center items-center h-[320px] sm:h-[400px]">
            <div className="w-[280px] sm:w-[340px] h-[280px] sm:h-[340px] relative">
              <div className="absolute inset-0 bg-radial from-[#0a66c2]/20 via-transparent to-transparent rounded-full scale-[1.3] blur-2xl" />
              <img
                src="/logo.svg"
                alt="LinkedIn Job Explorer Logo"
                className="w-full h-full object-contain animate-[pulse_8s_ease-in-out_infinite] select-none opacity-95"
              />
            </div>
          </div>
        </div>

        {/* LinkedIn Redesign Concept Dashboard Mockup */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-0">
          <LinkedInDashboardMockup lang={lang} />
        </div>
      </section>

      {/* Narrative Section (Rebranded as LinkedIn Feed Post) */}
      <section className="w-full px-6 py-16 border-b border-[#2f3539] bg-[#12161a]/10 relative">
        <div className="max-w-6xl mx-auto relative z-10 text-left">
          {/* Rebranded Feed post */}
          <LinkedInFeedPost lang={lang} />

          {/* Conversion Playgrounds Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12 items-stretch">
            <AIResumeOptimizerPreview lang={lang} />
            <LinkedInCarouselPreview lang={lang} />
          </div>

          <div className="h-[1px] w-full bg-[#2f3539]/40 my-16" />

          {/* Integration selectors playground */}
          <InteractiveIntegration />
        </div>
      </section>

      {/* LinkedIn Automation Flow Diagram (Rebranded as Job Application pipeline tracker) */}
      <section className="w-full px-6 py-20 border-b border-[#2f3539] bg-[#090e11] relative">
        <div className="max-w-6xl mx-auto relative z-10 text-left">
          <div className="text-left mb-12">
            <span className="text-xs text-[#70b5f9] font-bold uppercase tracking-widest">{text.sections.flow.badge}</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#e9ecef] mt-2">
              {text.sections.flow.title}
            </h2>
            <p className="text-sm text-[#8f969b] mt-2 max-w-xl leading-relaxed">
              {text.sections.flow.description}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
            {text.sections.flow.steps.map((item, index) => (
              <div key={index} className="p-5 rounded-xl border border-[#2f3539] bg-[#1d2226] relative hover:border-[#70b5f9]/30 transition-colors shadow-sm">
                <div className="text-[10px] font-mono text-[#70b5f9] font-bold mb-3 flex justify-between items-center">
                  <span>STEP 0{index + 1}</span>
                  <span className="px-2 py-0.5 rounded bg-[#12161a] border border-[#2f3539] text-[#e9ecef] text-[8px] font-bold uppercase tracking-wider">{item.tech}</span>
                </div>
                <h4 className="text-sm font-bold text-[#e9ecef] mb-2">{item.title}</h4>
                <p className="text-xs text-[#8f969b] leading-relaxed">{item.desc}</p>
                {index < 4 && (
                  <div className="hidden md:block absolute top-1/2 -right-3.5 -translate-y-1/2 z-20 text-[#70b5f9] text-xl font-extrabold font-mono">
                    →
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Bento Grid (Monorepo Architecture as LinkedIn profile widgets) */}
      <section className="w-full px-6 py-20 border-b border-[#2f3539] relative">
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-left mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#e9ecef] mb-4">
              {text.sections.architecture.title}
            </h2>
            <p className="text-sm sm:text-base text-[#8f969b] max-w-xl leading-relaxed">
              {text.sections.architecture.description}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
            {/* Left Card: Gateway API (Takes 7 cols) */}
            <div className="md:col-span-7 group relative overflow-hidden rounded-xl border border-[#2f3539] bg-[#1d2226] p-8 flex flex-col justify-between hover:border-[#70b5f9]/30 transition-all duration-300 min-h-[380px]">
              <div className="absolute inset-0 bg-gradient-to-br from-[#0a66c2]/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div>
                <div className="h-11 w-11 rounded-lg bg-[#0a66c2]/10 text-[#70b5f9] flex items-center justify-center mb-6 border border-[#0a66c2]/20">
                  <Globe className="h-5 w-5" />
                </div>
                <h3 className="text-2xl font-bold text-[#e9ecef] mb-3">{text.sections.architecture.gateway.title}</h3>
                <p className="text-sm text-[#8f969b] leading-relaxed max-w-md">
                  {text.sections.architecture.gateway.description}
                </p>
              </div>

              {/* Grid indicator badges */}
              <div className="grid grid-cols-2 gap-3 mt-8">
                <div className="p-3.5 rounded bg-[#12161a] border border-[#2f3539] text-xs">
                  <span className="font-bold text-[#e9ecef] block">{text.sections.architecture.gateway.features.graphql.title}</span>
                  <span className="text-[#8f969b] text-[11px] mt-0.5 block">{text.sections.architecture.gateway.features.graphql.desc}</span>
                </div>
                <div className="p-3.5 rounded bg-[#12161a] border border-[#2f3539] text-xs">
                  <span className="font-bold text-[#e9ecef] block">{text.sections.architecture.gateway.features.rest.title}</span>
                  <span className="text-[#8f969b] text-[11px] mt-0.5 block">{text.sections.architecture.gateway.features.rest.desc}</span>
                </div>
              </div>
            </div>

            {/* Right Card: Job Backend (Takes 5 cols) */}
            <Link
              href="/docs/job-backend/overview"
              className="md:col-span-5 group relative overflow-hidden rounded-xl border border-[#2f3539] bg-[#1d2226] p-8 flex flex-col justify-between hover:border-[#70b5f9]/30 transition-all duration-300 min-h-[380px] cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#0a66c2]/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div>
                <div className="h-11 w-11 rounded-lg bg-[#0a66c2]/10 text-[#70b5f9] flex items-center justify-center mb-6 group-hover:scale-105 transition-transform border border-[#0a66c2]/20">
                  <Bot className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-bold text-[#e9ecef] mb-3">{text.sections.architecture.jobBackend.title}</h3>
                <p className="text-sm text-[#8f969b] leading-relaxed">
                  {text.sections.architecture.jobBackend.description}
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[#70b5f9] font-bold mt-6">
                {text.sections.architecture.jobBackend.cta}
                <ArrowRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Bottom Row - Publisher Card (Takes 5 cols) */}
            <Link
              href="/docs/publisher-backend/overview"
              className="md:col-span-5 group relative overflow-hidden rounded-xl border border-[#2f3539] bg-[#1d2226] p-8 flex flex-col justify-between hover:border-[#70b5f9]/30 transition-all duration-300 min-h-[340px] cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#0a66c2]/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div>
                <div className="h-11 w-11 rounded-lg bg-[#0a66c2]/10 text-[#70b5f9] flex items-center justify-center mb-6 group-hover:scale-105 transition-transform border border-[#0a66c2]/20">
                  <ImageIcon className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-bold text-[#e9ecef] mb-3">{text.sections.architecture.publisher.title}</h3>
                <p className="text-sm text-[#8f969b] leading-relaxed">
                  {text.sections.architecture.publisher.description}
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[#70b5f9] font-bold mt-6">
                {text.sections.architecture.publisher.cta}
                <ArrowRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Bottom Row - Browser Extension Card (Takes 7 cols) */}
            <Link
              href="/docs/extension"
              className="md:col-span-7 group relative overflow-hidden rounded-xl border border-[#2f3539] bg-[#1d2226] p-8 flex flex-col justify-between hover:border-[#70b5f9]/30 transition-all duration-300 min-h-[340px] cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#0a66c2]/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div>
                <div className="h-11 w-11 rounded-lg bg-[#0a66c2]/10 text-[#70b5f9] flex items-center justify-center mb-6 group-hover:scale-105 transition-transform border border-[#0a66c2]/20">
                  <Zap className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-bold text-[#e9ecef] mb-3">{text.sections.architecture.extension.title}</h3>
                <p className="text-sm text-[#8f969b] leading-relaxed">
                  {text.sections.architecture.extension.description}
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[#70b5f9] font-bold mt-6">
                {text.sections.architecture.extension.cta}
                <ArrowRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials (Rebranded as LinkedIn Profile Recommendations) */}
      <section className="w-full px-6 py-20 relative border-b border-[#2f3539] bg-[#12161a]/10 overflow-hidden">
        {/* Connection networks decoration */}
        <NetworkNodesDither />

        <div className="max-w-6xl mx-auto relative z-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
          {/* Left info block */}
          <div className="md:col-span-4 rounded-xl border border-[#2f3539] bg-[#1d2226] p-8 flex flex-col justify-between min-h-[300px]">
            <div>
              <h3 className="text-2xl font-extrabold text-[#e9ecef] mb-4">{text.sections.testimonials.title}</h3>
              <p className="text-sm text-[#8f969b] leading-relaxed">
                {text.sections.testimonials.description}
              </p>
            </div>
            <div>
              <Link
                href="/docs/quickstart"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 text-xs font-bold text-white bg-[#0a66c2] hover:bg-[#004182] rounded-full hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
              >
                {text.sections.testimonials.cta}
              </Link>
            </div>
          </div>

          {/* Right Recommendations Column */}
          <div className="md:col-span-8 space-y-4">
            <h4 className="text-xs font-bold text-[#8f969b] tracking-wider uppercase text-left">
              Developer Recommendations
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
              {/* Recommendation 1 */}
              <div className="rounded-xl border border-[#2f3539] bg-[#1d2226] p-5 flex flex-col justify-between shadow-sm">
                <div>
                  <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-[#2f3539]/50">
                    <div className="size-9 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                      AS
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#e9ecef] flex items-center gap-1">
                        Alex S.
                        <span className="text-[10px] text-[#8f969b] font-normal">• 1st</span>
                      </div>
                      <span className="text-[10px] text-[#8f969b] block leading-tight">
                        {text.sections.testimonials.person1.role}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-[#8f969b] italic leading-relaxed">
                    {text.sections.testimonials.quote1}
                  </p>
                </div>
              </div>

              {/* Recommendation 2 */}
              <div className="rounded-xl border border-[#2f3539] bg-[#1d2226] p-5 flex flex-col justify-between shadow-sm">
                <div>
                  <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-[#2f3539]/50">
                    <div className="size-9 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                      JK
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#e9ecef] flex items-center gap-1">
                        Jessica K.
                        <span className="text-[10px] text-[#8f969b] font-normal">• 1st</span>
                      </div>
                      <span className="text-[10px] text-[#8f969b] block leading-tight">
                        {text.sections.testimonials.person2.role}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-[#8f969b] italic leading-relaxed">
                    {text.sections.testimonials.quote2}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA / Execution section */}
      <section className="w-full px-6 py-20 relative bg-[#090e11]">
        <div className="max-w-6xl mx-auto relative z-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
          {/* Made Possible Card (Takes 6 cols) */}
          <div className="md:col-span-6 rounded-xl border border-[#2f3539] bg-[#1d2226] p-8 flex flex-col justify-between min-h-[320px] shadow-sm text-left">
            <div>
              <div className="h-10 w-10 rounded-lg bg-[#0a66c2]/10 text-[#70b5f9] flex items-center justify-center mb-6 border border-[#0a66c2]/20">
                <Users className="size-5" />
              </div>
              <h3 className="text-2xl font-extrabold text-[#e9ecef] mb-4">{text.sections.community.title}</h3>
              <p className="text-sm text-[#8f969b] leading-relaxed">
                {text.sections.community.description}
              </p>
            </div>

            {/* Simulating active developers avatars list matching screenshot 11 */}
            <div className="mt-8">
              <div className="flex -space-x-2.5 overflow-hidden mb-3">
                {['JL', 'PV', 'AM', 'DR', 'SK', 'TR'].map((name, i) => (
                  <div
                    key={name}
                    className={`inline-flex items-center justify-center size-8 rounded-full border-2 border-[#1d2226] text-[10px] font-bold text-white shrink-0 ${
                      i % 3 === 0 ? 'bg-indigo-600' : i % 3 === 1 ? 'bg-emerald-600' : 'bg-orange-600'
                    }`}
                  >
                    {name}
                  </div>
                ))}
                <div className="inline-flex items-center justify-center size-8 rounded-full border-2 border-[#1d2226] bg-[#12161a] text-[10px] font-bold text-[#8f969b] shrink-0">
                  +12
                </div>
              </div>
              <span className="text-[11px] text-[#8f969b]">{text.sections.community.contributors}</span>
            </div>
          </div>

          {/* Rebranded Crescent visually designed Banner */}
          <div className="md:col-span-6 rounded-xl border border-[#2f3539] bg-[#1d2226] overflow-hidden relative p-8 flex flex-col justify-between min-h-[320px] shadow-sm">
            {/* Dither skyline representing network node layers */}
            <NetworkNodesDither />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a66c2]/5 via-transparent to-transparent pointer-events-none" />

            <div className="relative z-10 text-center mt-6">
              <h3 className="text-3xl font-extrabold text-[#e9ecef] tracking-widest uppercase font-mono">
                {text.sections.cta.title}
              </h3>
              <span className="text-xs text-[#8f969b] tracking-wide block mt-2">
                {text.sections.cta.subtitle}
              </span>
            </div>

            <div className="relative z-10 text-center mb-4">
              <Link
                href="/docs/quickstart"
                className="inline-flex items-center gap-1.5 px-6 py-3 text-xs font-bold text-white bg-[#0a66c2] hover:bg-[#004182] rounded-full transition-all cursor-pointer"
              >
                {text.sections.cta.button}
              </Link>
            </div>
          </div>
        </div>

        {/* Battery guaranteed footer panels (screenshot 12) */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 text-left relative z-10">
          {text.sections.footer.features.map((feature, idx) => (
            <div key={idx} className="p-6 rounded-xl border border-[#2f3539] bg-[#1d2226] shadow-sm">
              <span className="font-bold text-[#e9ecef] text-sm block mb-1.5 flex items-center gap-1.5">
                <Check className="size-4 text-[#70b5f9]" />
                {feature.title}
              </span>
              <span className="text-xs text-[#8f969b] leading-normal">
                {feature.desc}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full px-6 py-12 border-t border-[#2f3539] relative z-10 bg-[#1d2226] text-left">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5 text-xs text-[#8f969b]">
            <Layers className="h-4 w-4 text-[#70b5f9]" />
            <span className="font-bold text-[#e9ecef]">LinkedIn Job Explorer</span>
            <span className="text-[#2f3539]">·</span>
            <span>{text.sections.footer.built}</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/docs/quickstart" className="text-xs text-[#8f969b] hover:text-[#70b5f9] transition-colors">
              {text.sections.footer.links.docs}
            </Link>
            <Link href="/docs/job-backend/credentials/getCredentialsStatus" className="text-xs text-[#8f969b] hover:text-[#70b5f9] transition-colors">
              {text.sections.footer.links.gateway}
            </Link>
            <Link href="/docs/job-backend/overview" className="text-xs text-[#8f969b] hover:text-[#70b5f9] transition-colors">
              {text.sections.footer.links.jobBackend}
            </Link>
            <Link href="/docs/publisher-backend/overview" className="text-xs text-[#8f969b] hover:text-[#70b5f9] transition-colors">
              {text.sections.footer.links.publisher}
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
