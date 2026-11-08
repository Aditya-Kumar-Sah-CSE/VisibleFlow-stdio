import Link from 'next/link';
import {
  FileText,
  Presentation,
  GitBranch,
  Network,
  BarChart3,
  FileCheck2,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Cpu,
  Layers,
  Zap,
  Shield,
  Download,
  Sigma,
} from 'lucide-react';

export default function LandingPage() {
  const studios = [
    {
      title: 'Document Studio',
      description: 'A4 & Letter paginated document authoring with vector KaTeX formulas and print-perfect typography.',
      icon: FileText,
      badge: 'Prose & Math',
      color: 'bg-blue-500/10 text-blue-600 border-blue-200',
    },
    {
      title: 'Slide Studio',
      description: 'PowerPoint-grade presentation design with speaker notes, transitions, and native PPTX exports.',
      icon: Presentation,
      badge: 'Keynotes & Pitch',
      color: 'bg-orange-500/10 text-orange-600 border-orange-200',
    },
    {
      title: 'Flowchart Studio',
      description: 'Algorithmic node graphs, orthogonal smart connectors, and automated layout algorithms.',
      icon: GitBranch,
      badge: 'React Flow Powered',
      color: 'bg-emerald-500/10 text-emerald-600 border-emerald-200',
    },
    {
      title: 'Diagram Studio',
      description: 'System architecture, UML schemas, and cloud network topology maps with customizable shapes.',
      icon: Network,
      badge: 'Architecture & UML',
      color: 'bg-purple-500/10 text-purple-600 border-purple-200',
    },
    {
      title: 'Chart Studio',
      description: 'Apache ECharts data visualizations with inline spreadsheet data editor and CSV/Excel import.',
      icon: BarChart3,
      badge: 'Live Tabular Data',
      color: 'bg-cyan-500/10 text-cyan-600 border-cyan-200',
    },
    {
      title: 'Hidden LaTeX Math Engine',
      description: 'Visual palette for fractions, integrals, matrices and symbols. Users never see or touch raw LaTeX.',
      icon: Sigma,
      badge: 'Zero-LaTeX UI',
      color: 'bg-indigo-500/10 text-indigo-600 border-indigo-200',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-900/80 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
              <Layers className="w-5 h-5" />
            </div>
            <span className="font-bold text-xl tracking-tight text-white">VisualFlow <span className="text-blue-400 font-medium">Studio</span></span>
          </div>

          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-300">
            <a href="#studios" className="hover:text-white transition-colors">Studios</a>
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#math-engine" className="hover:text-white transition-colors">Zero-LaTeX Math</a>
            <a href="#exports" className="hover:text-white transition-colors">Export Engine</a>
          </nav>

          <div className="flex items-center space-x-4">
            <Link
              href="/dashboard"
              className="text-sm font-medium text-slate-300 hover:text-white px-3 py-1.5 rounded-lg transition-colors"
            >
              Log In
            </Link>
            <Link
              href="/dashboard"
              className="text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg shadow-md shadow-blue-600/25 transition-all flex items-center space-x-1.5"
            >
              <span>Open Studio</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-blue-900/25 via-slate-900 to-slate-900 pointer-events-none" />
        <div className="max-w-6xl mx-auto px-6 text-center relative z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-8 tracking-wide">
            <Sparkles className="w-3.5 h-3.5" />
            <span>ALL-IN-ONE VISUAL DOCUMENT & ARCHITECTURE PLATFORM</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.12]">
            Create Documents, Slides, Diagrams & Charts <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">Visually</span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            Replace five disconnected tools with one unified studio. Design publication-grade documents, flowcharts, presentation decks, and technical schemas without writing code or LaTeX.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center space-x-2 transition-all"
            >
              <span>Launch Studio for Free</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#studios"
              className="w-full sm:w-auto px-8 py-3.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold rounded-xl transition-all"
            >
              Explore Studios
            </a>
          </div>

          {/* Interactive UI Mockup Preview */}
          <div className="mt-16 relative rounded-2xl border border-slate-800 bg-slate-950/80 p-3 shadow-2xl shadow-blue-900/20 backdrop-blur-sm">
            <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 text-xs text-slate-400">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="ml-2 font-mono text-slate-400">visualflow.studio/studio/proj-demo</span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="flex items-center text-emerald-400"><span className="w-2 h-2 rounded-full bg-emerald-400 inline-block mr-1.5 animate-pulse" /> Autosaved</span>
                <span className="bg-blue-500/20 text-blue-300 px-2.5 py-0.5 rounded font-medium">Flowchart Studio</span>
              </div>
            </div>

            <div className="grid grid-cols-12 gap-0 h-[440px] bg-slate-900 rounded-b-xl overflow-hidden text-left">
              {/* Left element library bar */}
              <div className="col-span-3 border-r border-slate-800 p-4 bg-slate-950/50 flex flex-col justify-between">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Element Palette</div>
                  <div className="space-y-2">
                    <div className="p-2 rounded bg-slate-800/60 border border-slate-700/60 text-xs flex items-center justify-between text-slate-200">
                      <span className="flex items-center"><GitBranch className="w-4 h-4 mr-2 text-emerald-400" /> Start / End Node</span>
                      <span className="text-[10px] bg-slate-700 px-1.5 py-0.5 rounded text-slate-400">Drag</span>
                    </div>
                    <div className="p-2 rounded bg-slate-800/60 border border-slate-700/60 text-xs flex items-center justify-between text-slate-200">
                      <span className="flex items-center"><Layers className="w-4 h-4 mr-2 text-blue-400" /> Process Step</span>
                      <span className="text-[10px] bg-slate-700 px-1.5 py-0.5 rounded text-slate-400">Drag</span>
                    </div>
                    <div className="p-2 rounded bg-slate-800/60 border border-slate-700/60 text-xs flex items-center justify-between text-slate-200">
                      <span className="flex items-center"><Cpu className="w-4 h-4 mr-2 text-purple-400" /> Decision Rhombus</span>
                      <span className="text-[10px] bg-slate-700 px-1.5 py-0.5 rounded text-slate-400">Drag</span>
                    </div>
                    <div className="p-2 rounded bg-slate-800/60 border border-slate-700/60 text-xs flex items-center justify-between text-slate-200">
                      <span className="flex items-center"><Sigma className="w-4 h-4 mr-2 text-indigo-400" /> Visual Math Node</span>
                      <span className="text-[10px] bg-slate-700 px-1.5 py-0.5 rounded text-slate-400">KaTeX</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-blue-950/40 border border-blue-800/40 rounded-lg text-xs text-blue-300 flex items-start space-x-2">
                  <Sparkles className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <span>AI Assistant available: Click to synthesize diagrams from plain English prompts.</span>
                </div>
              </div>

              {/* Center Canvas */}
              <div className="col-span-6 relative bg-slate-900 canvas-grid-pattern p-6 flex items-center justify-center">
                <div className="w-full flex items-center justify-around">
                  <div className="p-3 rounded-xl bg-slate-800 border-2 border-emerald-500/80 shadow-lg text-center w-36">
                    <div className="text-[10px] text-emerald-400 font-semibold uppercase">Start Node</div>
                    <div className="text-xs font-bold text-white mt-1">API Ingestion</div>
                  </div>

                  <div className="w-16 h-0.5 bg-blue-500 relative">
                    <div className="absolute right-0 -top-1 w-2 h-2 border-t-2 border-r-2 border-blue-500 rotate-45" />
                  </div>

                  <div className="p-3 rounded-xl bg-slate-800 border-2 border-blue-500 shadow-lg text-center w-36">
                    <div className="text-[10px] text-blue-400 font-semibold uppercase">Process</div>
                    <div className="text-xs font-bold text-white mt-1">JSON Validation</div>
                  </div>

                  <div className="w-16 h-0.5 bg-blue-500 relative">
                    <div className="absolute right-0 -top-1 w-2 h-2 border-t-2 border-r-2 border-blue-500 rotate-45" />
                  </div>

                  <div className="p-3 rounded-xl bg-slate-800 border-2 border-purple-500 shadow-lg text-center w-36">
                    <div className="text-[10px] text-purple-400 font-semibold uppercase">Database</div>
                    <div className="text-xs font-bold text-white mt-1">PostgreSQL Store</div>
                  </div>
                </div>
              </div>

              {/* Right Properties Panel */}
              <div className="col-span-3 border-l border-slate-800 p-4 bg-slate-950/50">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Node Properties</div>
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="text-slate-400 block mb-1">Fill Color</label>
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 rounded bg-blue-600 border border-slate-600" />
                      <span className="font-mono text-slate-300">#2563eb</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Stroke Width</label>
                    <div className="h-1.5 w-full bg-slate-700 rounded-full overflow-hidden">
                      <div className="w-2/3 h-full bg-blue-500" />
                    </div>
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Connector Style</label>
                    <span className="inline-block px-2 py-1 bg-slate-800 rounded text-slate-300 text-[11px]">Orthogonal Step</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Six Dedicated Studios Showcase */}
      <section id="studios" className="py-24 border-t border-slate-800 bg-slate-950">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Five Dedicated Studios. One Seamless Data Architecture.
            </h2>
            <p className="mt-4 text-slate-400 text-base sm:text-lg">
              Switch freely between documents, presentations, flowcharts, technical schemas, and interactive charts. Every project is stored as structured, version-controlled JSON.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {studios.map((studio, idx) => {
              const Icon = studio.icon;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 hover:border-slate-700 hover:bg-slate-900 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-xl border ${studio.color}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300">
                        {studio.badge}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{studio.title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{studio.description}</p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-800/80">
                    <Link
                      href="/dashboard"
                      className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center space-x-1"
                    >
                      <span>Create with this studio</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Zero-LaTeX Visual Math Section */}
      <section id="math-engine" className="py-24 border-t border-slate-800 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-4">
                <Sigma className="w-4 h-4" />
                <span>NO LATEX KNOWLEDGE REQUIRED</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Visual Mathematical Equation Builder
              </h2>
              <p className="mt-4 text-slate-300 text-base leading-relaxed">
                Math is beautiful, but raw LaTeX syntax shouldn’t block non-technical authors. VisualFlow Studio provides an intuitive visual equation builder: pick fractions, roots, integrals, and matrices from categorized palettes, and our internal engine renders vector-perfect KaTeX typography instantly.
              </p>

              <div className="mt-6 space-y-3">
                <div className="flex items-start space-x-3 text-sm text-slate-300">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Interactive fraction, square root, power, and subscript builders.</span>
                </div>
                <div className="flex items-start space-x-3 text-sm text-slate-300">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Calculus integrals, summations, limits, and multi-row matrices.</span>
                </div>
                <div className="flex items-start space-x-3 text-sm text-slate-300">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Vector SVG export for crisp, infinite-resolution publication printing.</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4 flex items-center justify-between">
                <span>Visual Equation Palette</span>
                <span className="text-indigo-400">KaTeX Vector Render</span>
              </div>
              <div className="grid grid-cols-4 gap-2 mb-6">
                <button className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-sm font-serif text-center hover:border-indigo-500 transition-colors">
                  <span className="block text-indigo-300 font-bold">a / b</span>
                  <span className="text-[10px] text-slate-400">Fraction</span>
                </button>
                <button className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-sm font-serif text-center hover:border-indigo-500 transition-colors">
                  <span className="block text-indigo-300 font-bold">√x</span>
                  <span className="text-[10px] text-slate-400">Radical</span>
                </button>
                <button className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-sm font-serif text-center hover:border-indigo-500 transition-colors">
                  <span className="block text-indigo-300 font-bold">∫ f(x)</span>
                  <span className="text-[10px] text-slate-400">Integral</span>
                </button>
                <button className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-sm font-serif text-center hover:border-indigo-500 transition-colors">
                  <span className="block text-indigo-300 font-bold">[ M ]</span>
                  <span className="text-[10px] text-slate-400">Matrix</span>
                </button>
              </div>

              <div className="p-6 bg-slate-900/90 rounded-xl border border-slate-800 text-center">
                <div className="text-xs text-slate-400 mb-2">Real-Time Vector Preview</div>
                <div className="text-2xl font-serif text-white tracking-wide py-4">
                  x = <span className="inline-block align-middle text-indigo-300">(-b ± √(b² - 4ac)) / (2a)</span>
                </div>
                <div className="text-[11px] text-emerald-400 font-medium">✓ Stored as editable visual AST JSON</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Export Section */}
      <section id="exports" className="py-24 border-t border-slate-800 bg-slate-950">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
            Commercial-Grade Multi-Format Exports
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-base mb-12">
            No rasterized screenshot hacks. Export true vector PDFs with Playwright, native editable PowerPoint (.pptx) decks, structured Word docs, high-res PNGs, and scalable SVGs.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { format: 'PDF', desc: 'Vector Playwright print', icon: Download },
              { format: 'PPTX', desc: 'Editable shapes & text', icon: Presentation },
              { format: 'DOCX', desc: 'Structured OpenXML', icon: FileText },
              { format: 'SVG', desc: 'Lossless vector markup', icon: Network },
              { format: 'PNG', desc: 'High-DPI 4K raster', icon: Layers },
              { format: 'JSON', desc: 'Portable project schema', icon: Cpu },
            ].map((exp, i) => {
              const Icon = exp.icon;
              return (
                <div key={i} className="p-5 rounded-xl border border-slate-800 bg-slate-900/80 text-center">
                  <Icon className="w-6 h-6 mx-auto mb-2 text-blue-400" />
                  <div className="font-bold text-white text-base">{exp.format}</div>
                  <div className="text-[11px] text-slate-400 mt-1">{exp.desc}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <footer className="mt-auto border-t border-slate-800 bg-slate-950 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-blue-400" />
            <span className="font-semibold text-slate-300">VisualFlow Studio</span>
            <span>— Production-Grade Visual Creation Platform</span>
          </div>
          <div>Built with Next.js 15, NestJS, Prisma, React-Konva, React Flow & Apache ECharts.</div>
        </div>
      </footer>
    </div>
  );
}
