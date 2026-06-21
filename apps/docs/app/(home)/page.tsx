import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="relative flex flex-col items-center justify-center flex-1 px-6 py-20 overflow-hidden bg-radial from-fd-background via-fd-background to-fd-background/80">
      {/* Decorative background grid */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />

      <div className="relative z-10 max-w-5xl mx-auto text-center flex flex-col items-center">
        {/* Top Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold rounded-full border border-fd-primary/30 bg-fd-primary/5 text-fd-primary mb-6 animate-fade-in backdrop-blur-xs">
          <span className="flex h-2 w-2 rounded-full bg-fd-primary" />
          LinkedIn Voyager Interface
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl md:text-7xl bg-linear-to-b from-fd-foreground to-fd-foreground/70 bg-clip-text text-transparent mb-6 max-w-4xl leading-tight">
          Secure Integration Gateway for{' '}
          <span className="bg-linear-to-r from-blue-500 via-sky-400 to-indigo-500 bg-clip-text text-transparent">
            LinkedIn API
          </span>
        </h1>

        {/* Hero Subtitle */}
        <p className="text-lg md:text-xl text-fd-muted-foreground mb-10 max-w-2xl leading-relaxed">
          Expose high-efficiency GraphQL queries and robust REST endpoints to automate easy-apply jobs, manage feed posts, and parse profile data securely using browser session cookies.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-16 justify-center w-full sm:w-auto">
          <Link
            href="/docs"
            className="inline-flex items-center justify-center px-6 py-3.5 text-base font-semibold text-white bg-linear-to-r from-blue-600 to-indigo-600 rounded-lg shadow-lg hover:from-blue-500 hover:to-indigo-500 transition-all duration-200 cursor-pointer text-center"
          >
            Start Integration
          </Link>
          <Link
            href="/docs/api/jobs/listJobs"
            className="inline-flex items-center justify-center px-6 py-3.5 text-base font-semibold text-fd-foreground bg-fd-muted/30 border border-fd-border/40 rounded-lg hover:bg-fd-muted/60 transition-all duration-200 cursor-pointer text-center backdrop-blur-xs"
          >
            API Reference
          </Link>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
          {/* Card 1 */}
          <div className="flex flex-col p-6 rounded-xl border border-fd-border/40 bg-fd-muted/10 hover:border-blue-500/40 hover:bg-fd-muted/20 transition-all duration-300 backdrop-blur-xs group">
            <div className="h-10 w-10 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-fd-foreground mb-2">Jobs Easy Apply</h3>
            <p className="text-sm text-fd-muted-foreground leading-relaxed">
              Programmatically list jobs, pull dynamic multi-step questionnaire URNs, and submit candidate applications securely.
            </p>
          </div>

          {/* Card 2 */}
          <div className="flex flex-col p-6 rounded-xl border border-fd-border/40 bg-fd-muted/10 hover:border-sky-500/40 hover:bg-fd-muted/20 transition-all duration-300 backdrop-blur-xs group">
            <div className="h-10 w-10 rounded-lg bg-sky-500/10 text-sky-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-fd-foreground mb-2">Post Publisher</h3>
            <p className="text-sm text-fd-muted-foreground leading-relaxed">
              Publish media rich texts, articles, shared documents, and images on LinkedIn feeds directly using custom Voyager APIs.
            </p>
          </div>

          {/* Card 3 */}
          <div className="flex flex-col p-6 rounded-xl border border-fd-border/40 bg-fd-muted/10 hover:border-indigo-500/40 hover:bg-fd-muted/20 transition-all duration-300 backdrop-blur-xs group">
            <div className="h-10 w-10 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-fd-foreground mb-2">Decoupled Security</h3>
            <p className="text-sm text-fd-muted-foreground leading-relaxed">
              No database token storage. Session parameters are processed on-the-fly and redacted from debugging console streams.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

