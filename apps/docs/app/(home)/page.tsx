import Link from 'next/link';
import {
  Layers, Briefcase, Rocket, ArrowRight,
  Zap, Bot, FileText, Terminal, Globe, RefreshCw,
  ImageIcon, ChevronRight, Database, Cpu
} from 'lucide-react';

export default function HomePage() {
  return (
    <main className="relative flex flex-col items-center overflow-hidden bg-fd-background">
      {/* Hero Section */}
      <section className="relative w-full px-6 pt-24 pb-20 overflow-hidden">
        {/* Decorative gradient background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-blue-500/8 via-indigo-500/5 to-transparent rounded-full blur-3xl" />
          <div className="absolute top-20 right-0 w-[400px] h-[400px] bg-gradient-to-bl from-violet-500/6 to-transparent rounded-full blur-3xl" />
          <div className="absolute top-40 left-0 w-[300px] h-[300px] bg-gradient-to-tr from-emerald-500/6 to-transparent rounded-full blur-3xl" />
          {/* Grid pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_30%,#000_70%,transparent_100%)]" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-medium rounded-full border border-fd-primary/20 bg-fd-primary/5 text-fd-primary mb-8">
            <span className="flex h-1.5 w-1.5 rounded-full bg-fd-primary animate-pulse" />
            Open Source Monorepo
          </div>

          <h1 className="text-5xl font-bold tracking-tight sm:text-7xl md:text-8xl text-fd-foreground mb-6 leading-[1.05]">
            LinkedIn Automation
            <br />
            <span className="bg-linear-to-r from-blue-400 via-sky-400 to-indigo-400 bg-clip-text text-transparent">
              Toolchain
            </span>
          </h1>

          <p className="text-lg md:text-xl text-fd-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            A full-stack monorepo for job automation, profile management, and content publishing — powered by AI.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-20">
            <Link
              href="/docs/quickstart"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 text-base font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 hover:from-blue-500 hover:to-indigo-500 transition-all duration-200"
            >
              Get Started
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/docs/gateway/overview"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 text-base font-semibold text-fd-foreground bg-fd-muted/40 border border-fd-border/40 rounded-xl hover:bg-fd-muted/60 transition-all duration-200"
            >
              API Reference
            </Link>
          </div>

          {/* Architecture Preview */}
          <div className="relative max-w-4xl mx-auto">
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 via-indigo-500/20 to-violet-500/20 rounded-3xl blur-xl opacity-40" />
            <div className="relative bg-fd-card/80 backdrop-blur-xl border border-fd-border/50 rounded-2xl p-8 shadow-2xl">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-4 rounded-xl bg-fd-muted/30 border border-fd-border/30">
                  <div className="h-10 w-10 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
                    <Layers className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-semibold text-fd-foreground">Gateway</div>
                    <div className="text-xs text-fd-muted-foreground">REST + GraphQL</div>
                  </div>
                  <div className="ml-auto text-xs text-fd-muted-foreground font-mono">:4000</div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-xl bg-fd-muted/30 border border-fd-border/30">
                  <div className="h-10 w-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                    <Briefcase className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-semibold text-fd-foreground">Job Backend</div>
                    <div className="text-xs text-fd-muted-foreground">AI + Applications</div>
                  </div>
                  <div className="ml-auto text-xs text-fd-muted-foreground font-mono">:3000</div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-xl bg-fd-muted/30 border border-fd-border/30">
                  <div className="h-10 w-10 rounded-lg bg-violet-500/10 text-violet-400 flex items-center justify-center shrink-0">
                    <Rocket className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-semibold text-fd-foreground">Publisher</div>
                    <div className="text-xs text-fd-muted-foreground">Content + Carousels</div>
                  </div>
                  <div className="ml-auto text-xs text-fd-muted-foreground font-mono">:3001</div>
                </div>
              </div>
              <div className="flex items-center justify-center gap-2 mt-4 text-xs text-fd-muted-foreground">
                <span className="h-px flex-1 bg-fd-border/30" />
                <span>Connected via GraphQL Gateway</span>
                <span className="h-px flex-1 bg-fd-border/30" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bento Features Grid */}
      <section className="w-full px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-fd-foreground mb-4">
              Everything you need
            </h2>
            <p className="text-lg text-fd-muted-foreground max-w-xl mx-auto">
              Three services, one toolchain. From job search to content publishing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Large Card - Gateway */}
            <div className="md:col-span-2 md:row-span-2 group relative overflow-hidden rounded-2xl border border-fd-border/40 bg-fd-card/50 hover:border-blue-500/30 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative p-8 h-full flex flex-col">
                <div className="h-12 w-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-6">
                  <Globe className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-bold text-fd-foreground mb-3">LinkedIn Gateway</h3>
                <p className="text-fd-muted-foreground mb-6 leading-relaxed max-w-md">
                  Dual REST + GraphQL proxy to LinkedIn Voyager APIs. Search jobs, publish posts, and parse profiles — all through a single service.
                </p>
                <div className="mt-auto grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-fd-muted/30 border border-fd-border/20">
                    <div className="text-sm font-medium text-fd-foreground">Job Search</div>
                    <div className="text-xs text-fd-muted-foreground mt-0.5">Easy Apply automation</div>
                  </div>
                  <div className="p-3 rounded-lg bg-fd-muted/30 border border-fd-border/20">
                    <div className="text-sm font-medium text-fd-foreground">Post Publishing</div>
                    <div className="text-xs text-fd-muted-foreground mt-0.5">Articles, images, docs</div>
                  </div>
                  <div className="p-3 rounded-lg bg-fd-muted/30 border border-fd-border/20">
                    <div className="text-sm font-medium text-fd-foreground">Profile Parsing</div>
                    <div className="text-xs text-fd-muted-foreground mt-0.5">PDF + structured data</div>
                  </div>
                  <div className="p-3 rounded-lg bg-fd-muted/30 border border-fd-border/20">
                    <div className="text-sm font-medium text-fd-foreground">GraphQL + REST</div>
                    <div className="text-xs text-fd-muted-foreground mt-0.5">Dual interface</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Job Backend */}
            <Link href="/docs/job-backend/overview" className="group relative overflow-hidden rounded-2xl border border-fd-border/40 bg-fd-card/50 hover:border-emerald-500/30 transition-all duration-300">
              <div className="p-6">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Bot className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-fd-foreground mb-2">AI Job Backend</h3>
                <p className="text-sm text-fd-muted-foreground leading-relaxed">
                  Auto-fill application forms with Gemini/Claude. Optimize resumes per job.
                </p>
              </div>
            </Link>

            {/* Publisher Backend */}
            <Link href="/docs/publisher-backend/overview" className="group relative overflow-hidden rounded-2xl border border-fd-border/40 bg-fd-card/50 hover:border-violet-500/30 transition-all duration-300">
              <div className="p-6">
                <div className="h-10 w-10 rounded-xl bg-violet-500/10 text-violet-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <ImageIcon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-fd-foreground mb-2">Publisher Platform</h3>
                <p className="text-sm text-fd-muted-foreground leading-relaxed">
                  AI content generation, carousel PDFs, scheduled publishing.
                </p>
              </div>
            </Link>

            {/* Application Tracking */}
            <Link href="/docs/job-backend/applications/listJobApplications" className="group relative overflow-hidden rounded-2xl border border-fd-border/40 bg-fd-card/50 hover:border-amber-500/30 transition-all duration-300">
              <div className="p-6">
                <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <RefreshCw className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-fd-foreground mb-2">Tracking</h3>
                <p className="text-sm text-fd-muted-foreground leading-relaxed">
                  Sync application statuses with LinkedIn in real-time.
                </p>
              </div>
            </Link>

            {/* Chrome Extension */}
            <Link href="/docs/extension" className="group relative overflow-hidden rounded-2xl border border-fd-border/40 bg-fd-card/50 hover:border-sky-500/30 transition-all duration-300">
              <div className="p-6">
                <div className="h-10 w-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Zap className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-fd-foreground mb-2">Browser Extension</h3>
                <p className="text-sm text-fd-muted-foreground leading-relaxed">
                  One-click credential sync from LinkedIn.
                </p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Code Example Section */}
      <section className="w-full px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-fd-foreground mb-6">
                Built for
                <span className="bg-linear-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent"> developers</span>.
              </h2>
              <p className="text-lg text-fd-muted-foreground mb-8 leading-relaxed">
                Auto-generated OpenAPI specs for every service. Add a new endpoint, run <code className="px-1.5 py-0.5 rounded bg-fd-muted/50 text-fd-foreground text-sm font-mono">pnpm generate</code>, and the docs update automatically.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Terminal className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-fd-foreground">Zero-config generation</div>
                    <div className="text-sm text-fd-muted-foreground">Swagger JSDoc annotations auto-generate Fumadoc pages</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Database className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-fd-foreground">Prisma + SQLite</div>
                    <div className="text-sm text-fd-muted-foreground">Type-safe database with auto-generated client</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Cpu className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-fd-foreground">AI-powered automation</div>
                    <div className="text-sm text-fd-muted-foreground">Gemini and Claude for content and form filling</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 rounded-2xl blur-xl" />
              <div className="relative bg-fd-card/80 backdrop-blur-xl border border-fd-border/50 rounded-2xl overflow-hidden shadow-2xl">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-fd-border/30 bg-fd-muted/20">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/60" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                    <div className="w-3 h-3 rounded-full bg-green-500/60" />
                  </div>
                  <span className="text-xs text-fd-muted-foreground ml-2 font-mono">terminal</span>
                </div>
                <div className="p-5 font-mono text-sm space-y-2">
                  <div className="text-fd-muted-foreground">$ <span className="text-fd-foreground">pnpm generate</span></div>
                  <div className="text-emerald-400/80">OpenAPI spec generated at public/openapi.json</div>
                  <div className="text-emerald-400/80">OpenAPI backend spec generated</div>
                  <div className="text-emerald-400/80">OpenAPI publisher spec generated</div>
                  <div className="text-fd-foreground/80 mt-2">Generated: gateway/jobs/listJobs.mdx</div>
                  <div className="text-fd-foreground/80">Generated: job-backend/ai/generateAnswers.mdx</div>
                  <div className="text-fd-foreground/80">Generated: publisher-backend/posts/createPost.mdx</div>
                  <div className="text-emerald-400/80 mt-2">All 3 services documented.</div>
                  <div className="text-fd-muted-foreground mt-2">$ <span className="text-fd-foreground">pnpm build</span></div>
                  <div className="text-emerald-400/80">✓ 42 pages generated</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="w-full px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-fd-border/40 bg-fd-card/50 p-8">
              <h3 className="text-xl font-bold text-fd-foreground mb-4">Service-Oriented Architecture</h3>
              <p className="text-fd-muted-foreground mb-6 leading-relaxed">
                Each service is independently deployable with its own database, routes, and OpenAPI spec. Connected via GraphQL gateway.
              </p>
              <div className="space-y-3">
                {[
                  { name: 'graphql-linkedin', desc: 'LinkedIn API proxy', color: 'blue' },
                  { name: 'linkedin-job-backend', desc: 'Job automation', color: 'emerald' },
                  { name: 'linkedin-publisher-backend', desc: 'Content platform', color: 'violet' },
                  { name: '@linkedin-job-applier/shared', desc: 'Types + components', color: 'amber' },
                ].map((pkg) => (
                  <div key={pkg.name} className="flex items-center gap-3 p-3 rounded-lg bg-fd-muted/20 border border-fd-border/20">
                    <div className={`h-2 w-2 rounded-full bg-${pkg.color}-400`} />
                    <code className="text-sm text-fd-foreground font-mono">{pkg.name}</code>
                    <span className="text-xs text-fd-muted-foreground ml-auto">{pkg.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-fd-border/40 bg-fd-card/50 p-8">
              <h3 className="text-xl font-bold text-fd-foreground mb-4">Automated Documentation</h3>
              <p className="text-fd-muted-foreground mb-6 leading-relaxed">
                Every API endpoint is documented from OpenAPI specs. Guides and overviews are hand-written with Fumadoc components.
              </p>
              <div className="space-y-3">
                {[
                  { icon: Globe, label: 'Gateway API', desc: '8 endpoints, REST + GraphQL', tag: 'auto' },
                  { icon: Briefcase, label: 'Job Backend API', desc: '11 endpoints, AI-powered', tag: 'auto' },
                  { icon: Rocket, label: 'Publisher API', desc: '11 endpoints, content creation', tag: 'auto' },
                  { icon: FileText, label: 'Guides & Overviews', desc: 'Architecture, security, setup', tag: 'manual' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3 p-3 rounded-lg bg-fd-muted/20 border border-fd-border/20">
                    <item.icon className="h-4 w-4 text-fd-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-fd-foreground">{item.label}</div>
                      <div className="text-xs text-fd-muted-foreground truncate">{item.desc}</div>
                    </div>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${item.tag === 'auto' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-blue-500/10 text-blue-400'}`}>
                      {item.tag}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="relative rounded-3xl border border-fd-border/40 bg-fd-card/50 p-12 md:p-16 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-violet-500/5" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold text-fd-foreground mb-4">
                Ready to automate?
              </h2>
              <p className="text-lg text-fd-muted-foreground mb-8 max-w-lg mx-auto">
                Get started with the Quick Start guide or explore the API reference.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/docs/quickstart"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 text-base font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all"
                >
                  Quick Start
                  <ChevronRight className="size-4" />
                </Link>
                <Link
                  href="/docs/gateway/overview"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 text-base font-semibold text-fd-foreground bg-fd-muted/40 border border-fd-border/40 rounded-xl hover:bg-fd-muted/60 transition-all"
                >
                  Explore APIs
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full px-6 py-8 border-t border-fd-border/30">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-fd-muted-foreground">
            <Layers className="h-4 w-4" />
            <span>LinkedIn Toolchain</span>
            <span className="text-fd-border">·</span>
            <span>Built with Fumadocs</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/docs" className="text-sm text-fd-muted-foreground hover:text-fd-foreground transition-colors">
              Docs
            </Link>
            <Link href="/docs/architecture" className="text-sm text-fd-muted-foreground hover:text-fd-foreground transition-colors">
              Architecture
            </Link>
            <Link href="/docs/security" className="text-sm text-fd-muted-foreground hover:text-fd-foreground transition-colors">
              Security
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
