import React, { useEffect, useState, useRef } from 'react';

// ─── Hooks ────────────────────────────────────────────────────────────────────

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

// ─── Animated Counter ─────────────────────────────────────────────────────────

const AnimatedCounter = ({
  end, duration = 2200, suffix = '', prefix = ''
}: { end: number; duration?: number; suffix?: string; prefix?: string }) => {
  const [count, setCount] = useState(0);
  const { ref, inView } = useInView(0.1);

  useEffect(() => {
    if (!inView) return;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));
      if (progress < 1) requestAnimationFrame(step);
      else setCount(end);
    };
    requestAnimationFrame(step);
  }, [inView, end, duration]);

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
};

// ─── Particle Background ──────────────────────────────────────────────────────

const ParticleCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    let animId: number;
    const particles: { x: number; y: number; vx: number; vy: number; r: number; alpha: number }[] = [];

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 2 + 0.5,
        alpha: Math.random() * 0.4 + 0.1,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(99,179,237,${p.alpha})`;
        ctx.fill();
      });
      // Lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(99,179,237,${0.12 * (1 - dist / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
};

// ─── Reveal Wrapper ───────────────────────────────────────────────────────────

const Reveal = ({
  children, delay = 0, direction = 'up', className = ''
}: { children: React.ReactNode; delay?: number; direction?: 'up' | 'left' | 'right' | 'scale'; className?: string }) => {
  const { ref, inView } = useInView(0.1);
  const dirs = {
    up:    'opacity-0 translate-y-12',
    left:  'opacity-0 -translate-x-12',
    right: 'opacity-0 translate-x-12',
    scale: 'opacity-0 scale-90',
  };
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${inView ? 'opacity-100 translate-y-0 translate-x-0 scale-100' : dirs[direction]} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

// ─── Feature Card ─────────────────────────────────────────────────────────────

const FeatureCard = ({
  icon, title, description, color, delay
}: { icon: string; title: string; description: string; color: string; delay: number }) => {
  const { ref, inView } = useInView(0.1);
  const [hovered, setHovered] = useState(false);

  return (
    <div
      ref={ref}
      className="feature-card group relative bg-white/[0.04] rounded-2xl p-8 border border-white/10 cursor-pointer overflow-hidden"
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0) scale(1)' : 'translateY(50px) scale(0.93)',
        transition: `opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms`,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Glow bg */}
      <div
        className="absolute inset-0 rounded-2xl transition-opacity duration-500"
        style={{ background: `radial-gradient(circle at 30% 30%, ${color}18, transparent 70%)`, opacity: hovered ? 1 : 0 }}
      />
      {/* Top gradient line */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] transition-opacity duration-500"
        style={{ background: `linear-gradient(to right, transparent, ${color}, transparent)`, opacity: hovered ? 1 : 0 }}
      />
      {/* Icon */}
      <div
        className="relative size-16 rounded-2xl flex items-center justify-center mb-6 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6"
        style={{ background: `linear-gradient(135deg, ${color}22, ${color}40)` }}
      >
        <span className="material-symbols-outlined text-3xl transition-transform duration-500" style={{ color, fontSize: '30px' }}>{icon}</span>
        {/* Orbiting dot */}
        <div
          className="absolute size-3 rounded-full transition-opacity duration-300"
          style={{
            background: color,
            opacity: hovered ? 1 : 0,
            animation: hovered ? 'orbitDot 1.5s linear infinite' : 'none',
            top: '50%', left: '50%', marginTop: '-6px', marginLeft: '-6px',
          }}
        />
      </div>
      <h3 className="relative text-xl font-bold text-white mb-3 transition-colors duration-300" style={{ color: hovered ? color : '' }}>
        {title}
      </h3>
      <p className="relative text-slate-400 leading-relaxed text-sm">{description}</p>
      {/* Bottom shine */}
      <div
        className="absolute bottom-0 left-4 right-4 h-[1px] transition-opacity duration-500"
        style={{ background: `linear-gradient(to right, transparent, ${color}60, transparent)`, opacity: hovered ? 1 : 0 }}
      />
    </div>
  );
};

// ─── Stat Card ────────────────────────────────────────────────────────────────

const StatCard = ({
  icon, value, suffix, label, color, delay
}: { icon: string; value: number; suffix: string; label: string; color: string; delay: number }) => {
  const { ref, inView } = useInView(0.1);
  return (
    <div
      ref={ref}
      className="relative group text-center"
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.9)',
        transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
      }}
    >
      {/* Glow circle behind */}
      <div
        className="absolute inset-0 rounded-2xl blur-xl transition-opacity duration-500 group-hover:opacity-60 opacity-0"
        style={{ background: `${color}30` }}
      />
      <div className="relative bg-white/[0.06] backdrop-blur-sm border border-white/10 rounded-2xl p-8 group-hover:border-white/20 transition-all duration-400">
        {/* Icon with pulse ring */}
        <div className="relative inline-flex items-center justify-center mb-4">
          <div
            className="absolute size-14 rounded-full animate-ping opacity-20"
            style={{ background: color, animationDuration: '2s', animationDelay: `${delay}ms` }}
          />
          <span className="material-symbols-outlined text-4xl relative z-10" style={{ color, fontSize: '40px' }}>{icon}</span>
        </div>
        {/* Count */}
        <div className="text-5xl font-black text-white mb-2 tabular-nums">
          {inView && <AnimatedCounter end={value} suffix={suffix} duration={2000} />}
        </div>
        <p className="text-slate-400 font-medium text-sm uppercase tracking-wider">{label}</p>
      </div>
    </div>
  );
};

// ─── Timeline Step ────────────────────────────────────────────────────────────

const WorkflowStep = ({
  step, icon, title, desc, color, delay, isLast
}: { step: number; icon: string; title: string; desc: string; color: string; delay: number; isLast: boolean }) => {
  const { ref, inView } = useInView(0.15);
  return (
    <div
      ref={ref}
      className="relative flex flex-col items-center text-center"
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(40px)',
        transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
      }}
    >
      {/* Connector line (desktop) */}
      {!isLast && (
        <div className="hidden lg:block absolute top-10 left-[calc(50%+36px)] right-[calc(-50%+36px)] h-[2px] overflow-hidden">
          <div
            className="h-full"
            style={{
              background: `linear-gradient(to right, ${color}, #8B5CF6)`,
              width: inView ? '100%' : '0%',
              transition: `width 1s ease ${delay + 400}ms`,
            }}
          />
          {/* Arrow */}
          <div
            className="absolute right-0 top-1/2 -translate-y-1/2 transition-opacity duration-300"
            style={{ opacity: inView ? 1 : 0, transitionDelay: `${delay + 900}ms` }}
          >
            <div className="w-0 h-0 border-t-4 border-b-4 border-l-8 border-t-transparent border-b-transparent" style={{ borderLeftColor: '#8B5CF6' }} />
          </div>
        </div>
      )}

      {/* Step number badge */}
      <div className="relative mb-4">
        <div
          className="size-20 rounded-full flex items-center justify-center border-2 transition-all duration-500 group"
          style={{
            background: `linear-gradient(135deg, ${color}30, ${color}10)`,
            borderColor: inView ? color : 'transparent',
            boxShadow: inView ? `0 0 30px ${color}40` : 'none',
          }}
        >
          <span className="material-symbols-outlined text-3xl" style={{ color, fontSize: '32px' }}>{icon}</span>
        </div>
        <div
          className="absolute -top-2 -right-2 size-7 rounded-full flex items-center justify-center text-xs font-black text-white shadow-lg"
          style={{ background: color }}
        >
          {step}
        </div>
      </div>
      <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
      <p className="text-slate-400 text-sm leading-relaxed max-w-[160px]">{desc}</p>
    </div>
  );
};

// ─── Tab Mock Visual ──────────────────────────────────────────────────────────

const MockVisual = ({ activeTab }: { activeTab: number }) => (
  <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-5 shadow-2xl border border-white/10 overflow-hidden">
    {/* Window chrome */}
    <div className="flex items-center gap-2 mb-4">
      <div className="w-3 h-3 rounded-full bg-red-400" />
      <div className="w-3 h-3 rounded-full bg-yellow-400" />
      <div className="w-3 h-3 rounded-full bg-green-400" />
      <div className="ml-4 flex-1 h-6 bg-slate-700/80 rounded-md text-xs flex items-center px-3 text-slate-500 font-mono">
        draftmate.ai/{['drafting', 'research', 'analysis'][activeTab]}
      </div>
    </div>
    <div className="bg-white rounded-xl p-5 min-h-[280px] transition-all duration-500">
      {activeTab === 0 && (
        <div className="space-y-4 animate-fade-in-up">
          <div className="flex items-center gap-3 mb-5">
            <span className="material-symbols-outlined text-blue-500 text-3xl">edit_document</span>
            <span className="font-bold text-slate-900 text-lg">AI Draft Generator</span>
            <span className="ml-auto text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-medium">✓ Ready</span>
          </div>
          <div className="space-y-2">
            {[1, 3/4, 5/6].map((w, i) => (
              <div key={i} className="h-3 bg-slate-100 rounded-full overflow-hidden" style={{ width: `${w * 100}%` }}>
                <div className="h-full bg-gradient-to-r from-blue-200 to-blue-300 rounded-full" style={{ width: '100%', animation: `waveIn 0.8s ease ${i * 150}ms both` }} />
              </div>
            ))}
          </div>
          <div className="mt-5 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-xl">
            <div className="flex items-center gap-2 text-blue-600 font-bold text-xs mb-2">
              <span className="material-symbols-outlined text-sm">auto_awesome</span>
              AI Suggestion Applied
            </div>
            <div className="h-2.5 bg-blue-200 rounded w-full mb-1.5" />
            <div className="h-2.5 bg-blue-100 rounded w-4/5" />
          </div>
          <div className="flex gap-2 mt-4">
            <div className="flex-1 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white text-xs font-bold">Export PDF</div>
            <div className="flex-1 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600 text-xs font-bold">Edit Draft</div>
          </div>
        </div>
      )}
      {activeTab === 1 && (
        <div className="space-y-4 animate-fade-in-up">
          <div className="flex items-center gap-3 mb-5">
            <span className="material-symbols-outlined text-purple-600 text-3xl">smart_toy</span>
            <span className="font-bold text-slate-900 text-lg">Lex Bot</span>
            <span className="ml-auto flex items-center gap-1 text-xs text-green-600 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />Online
            </span>
          </div>
          <div className="p-3 bg-slate-100 rounded-xl text-sm text-slate-600 border border-slate-200">
            "What are the grounds for anticipatory bail under CrPC?"
          </div>
          <div className="p-4 bg-purple-50 border-l-4 border-purple-500 rounded-r-xl">
            <p className="text-sm text-slate-700 mb-2 leading-relaxed">Under Section 438 of CrPC, anticipatory bail may be granted when a person has reason to believe they may be arrested...</p>
            <div className="flex items-center gap-1.5 text-xs text-purple-600 font-semibold mt-2">
              <span>📚</span> Gurbaksh Singh Sibbia v. State of Punjab (1980) 2 SCC 565
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 border border-slate-200 rounded-lg">
            <input className="flex-1 text-sm outline-none text-slate-700 bg-transparent" placeholder="Ask a follow-up..." readOnly />
            <span className="material-symbols-outlined text-purple-500 text-lg cursor-pointer">send</span>
          </div>
        </div>
      )}
      {activeTab === 2 && (
        <div className="space-y-4 animate-fade-in-up">
          <div className="flex items-center gap-3 mb-5">
            <span className="material-symbols-outlined text-amber-600 text-3xl">description</span>
            <span className="font-bold text-slate-900 text-lg">Document Analysis</span>
          </div>
          <div className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 hover:border-amber-400 transition-colors cursor-pointer group">
            <span className="material-symbols-outlined text-2xl mb-1 group-hover:text-amber-400 transition-colors">upload_file</span>
            <span className="text-xs">Drop PDF to analyze</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: 'summarize', label: 'Summary', color: 'emerald' },
              { icon: 'format_quote', label: 'Key Points', color: 'blue' },
              { icon: 'link', label: 'Citations', color: 'purple' },
              { icon: 'edit_note', label: 'Annotations', color: 'amber' },
            ].map((item, i) => (
              <div key={i} className={`p-3 bg-${item.color}-50 rounded-xl text-center border border-${item.color}-100`}>
                <span className={`material-symbols-outlined text-${item.color}-600 text-xl`}>{item.icon}</span>
                <p className={`text-xs font-semibold mt-1 text-${item.color}-700`}>{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  </div>
);

// ─── Roadmap Card ─────────────────────────────────────────────────────────────

const RoadmapCard = ({
  icon, title, desc, color, delay
}: { icon: string; title: string; desc: string; color: string; delay: number }) => {
  const { ref, inView } = useInView(0.1);
  const [hovered, setHovered] = useState(false);
  return (
    <div
      ref={ref}
      className="group relative rounded-2xl overflow-hidden cursor-pointer"
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0) scale(1)' : 'translateY(50px) scale(0.94)',
        transition: `opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms`,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Animated gradient border */}
      <div
        className="absolute inset-0 rounded-2xl transition-opacity duration-400"
        style={{
          background: `linear-gradient(135deg, ${color}, #8B5CF6)`,
          padding: '1px',
          opacity: hovered ? 1 : 0.3,
        }}
      />
      <div className="relative m-[1px] rounded-2xl bg-slate-900/95 p-6 h-full">
        {/* Glow blob */}
        <div
          className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-2xl transition-opacity duration-500"
          style={{ background: color, opacity: hovered ? 0.25 : 0.08 }}
        />
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-4">
            <div
              className="size-12 rounded-xl flex items-center justify-center transition-all duration-400"
              style={{
                background: hovered ? color : `${color}20`,
                boxShadow: hovered ? `0 0 20px ${color}60` : 'none',
              }}
            >
              <span className="material-symbols-outlined text-2xl" style={{ color: hovered ? '#fff' : color }}>{icon}</span>
            </div>
            <span className="px-2 py-1 rounded-md text-[10px] font-bold bg-white/5 text-slate-400 uppercase tracking-wider border border-white/10">
              Coming Soon
            </span>
          </div>
          <h3 className="text-lg font-bold text-white mb-2 transition-colors duration-300" style={{ color: hovered ? color : '' }}>
            {title}
          </h3>
          <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
        </div>
      </div>
    </div>
  );
};

// ─── Section Header ───────────────────────────────────────────────────────────

const SectionHeader = ({
  badge, title, subtitle, light = false
}: { badge: string; title: React.ReactNode; subtitle: string; light?: boolean }) => {
  const { ref, inView } = useInView(0.1);
  return (
    <div
      ref={ref}
      className="text-center mb-16"
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(30px)',
        transition: 'opacity 0.7s ease, transform 0.7s ease',
      }}
    >
      <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-widest mb-6 ${light ? 'border border-white/20 bg-white/10 text-blue-200' : 'border border-blue-500/30 bg-blue-500/10 text-blue-400'}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
        {badge}
      </div>
      <div className={`text-4xl md:text-5xl font-black leading-tight mb-4 ${light ? 'text-white' : 'text-white'}`}>
        {title}
      </div>
      <p className={`text-lg max-w-xl mx-auto ${light ? 'text-slate-300' : 'text-slate-400'}`}>{subtitle}</p>
    </div>
  );
};

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────────

const BG = 'bg-[#080D1A]'; // unified dark background

const Features = () => {
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    document.title = 'Features – DraftMate';
    window.scrollTo(0, 0);
  }, []);

  const mainFeatures = [
    { icon: 'edit_document',   title: 'AI-Powered Legal Drafting',     description: 'Generate court-ready petitions, agreements, affidavits, and legal notices in seconds with Indian legal context and precise court formatting.', color: '#3B82F6' },
    { icon: 'library_books',   title: 'Lex Bot Research Assistant',     description: 'Your personal legal research companion. Ask complex queries about Indian law and get precise answers with verified citations from SC & HCs.', color: '#8B5CF6' },
    { icon: 'verified',        title: 'Verified Case Citations',         description: 'Every citation is real and verified. Our AI only references actual judgments from authentic sources, eliminating hallucinated case laws.', color: '#10B981' },
    { icon: 'picture_as_pdf',  title: 'Smart PDF Editor',               description: 'Upload case files and chat with them. Extract summaries, key arguments, and relevant sections instantly with AI-powered analysis.', color: '#F59E0B' },
    { icon: 'psychology',      title: 'Personalized Writing Style',      description: 'The AI learns your unique drafting tone and vocabulary over time. Every document sounds exactly like you wrote it.', color: '#EC4899' },
    { icon: 'calculate',       title: 'Legal Calculators & Tools',       description: 'Built-in calculators for Court Fees, Limitation Periods, Interest and more — based on current Indian acts, regularly updated.', color: '#06B6D4' },
  ];

  const detailedFeatures = [
    {
      title: 'Smart AI Drafting', icon: 'edit_document', color: '#3B82F6',
      description: 'Transform raw case facts into professionally formatted legal documents',
      features: ['Support for 50+ document types (Petitions, Plaints, Applications)', 'Auto-formatting for Supreme Court, High Courts & District Courts', 'Intelligent clause suggestions based on case context', 'Built-in legal terminology and proper formatting', 'Voice-to-draft capability for quick input'],
    },
    {
      title: 'Lex Bot Research', icon: 'smart_toy', color: '#8B5CF6',
      description: 'Get instant answers with verified citations from Indian case law',
      features: ['Natural language legal queries in English or Hindi', 'Real-time access to SCC, AIR, and other reporters', 'Contextual understanding of IPC, CrPC, CPC & Constitution', 'Export research with proper citation format', 'Deep dive into specific acts and sections'],
    },
    {
      title: 'Document Intelligence', icon: 'description', color: '#F59E0B',
      description: 'Upload any legal document and extract insights instantly',
      features: ['PDF chat — ask questions about uploaded documents', 'Automatic summarization of lengthy judgments', 'Key argument and ratio extraction', 'Cross-reference with relevant case laws', 'Annotation and highlight capabilities'],
    },
  ];

  const roadmapCards = [
    { icon: 'badge',              title: 'Advocate Profile & Digital Presence', desc: 'Premium subscribers get a personalized SEO-optimized profile page — a digital visiting card showcasing expertise and contact details.', color: '#3B82F6' },
    { icon: 'share',              title: 'Real-Time Document Sharing',           desc: 'Securely share live drafts with colleagues or clients for review. Collaborate vertically with automatic version control.', color: '#10B981' },
    { icon: 'record_voice_over',  title: 'AI Voice Agent (Judge Mode)',          desc: 'Practice your arguments with an AI that simulates a judge. It listens to your voice and counters with legal queries to help you prepare.', color: '#8B5CF6' },
    { icon: 'gavel',              title: 'E-Courts Integration',                 desc: 'Direct access to E-Courts services. Track case status, next hearing dates, and orders for all your running cases in one dashboard.', color: '#F59E0B' },
    { icon: 'translate',          title: 'Multi-Language Translations',           desc: 'Draft in English and instantly translate to Hindi, Marathi, Tamil, and other regional languages for district court filings.', color: '#EC4899' },
    { icon: 'library_books',      title: 'Smart Legal Library',                  desc: 'A centralized repository of verified court templates, bare acts, and legal maxims available at your fingertips while drafting.', color: '#06B6D4' },
  ];

  return (
    <div className={`${BG} text-slate-100 overflow-x-hidden`}>

      {/* ── NAV ─────────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 lg:px-20 border-b border-white/5 bg-[#080D1A]/90 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-lg">balance</span>
          </div>
          <span className="font-black text-xl text-white tracking-tight">Draft<span className="text-blue-400">Mate</span></span>
        </div>
        <div className="flex items-center gap-4">
          <a href="#" className="text-slate-400 hover:text-white transition-colors text-sm font-medium">← Home</a>
          <a href="#" className="flex items-center justify-center rounded-lg h-9 px-5 bg-blue-500 text-white text-sm font-bold hover:bg-blue-400 transition-all shadow-lg shadow-blue-500/30 hover:-translate-y-0.5">
            Get Started
          </a>
        </div>
      </header>

      {/* ── HERO ────────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[90vh] flex items-center justify-center px-4 py-24 overflow-hidden">
        <ParticleCanvas />
        {/* Blobs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/15 rounded-full blur-[100px] animate-morph" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-600/15 rounded-full blur-[100px] animate-morph" style={{ animationDelay: '3s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px] animate-float" />

        {/* Grid lines */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'linear-gradient(#3B82F6 1px, transparent 1px), linear-gradient(90deg, #3B82F6 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <Reveal>
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-xs font-bold text-blue-400 uppercase tracking-widest mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              Powerful Features for Modern Advocates
            </div>
          </Reveal>

          <Reveal delay={100}>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight mb-6">
              <span className="text-white">Everything You Need to</span>
              <br />
              <span className="shimmer-text">Modernize Your Practice</span>
            </h1>
          </Reveal>

          <Reveal delay={200}>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10">
              From AI-powered drafting to verified case research, DraftMate provides a complete toolkit designed specifically for Indian legal professionals.
            </p>
          </Reveal>

          <Reveal delay={300}>
            <div className="flex flex-wrap gap-4 justify-center">
              <a href="#" className="group flex items-center gap-2 rounded-xl h-14 px-8 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-base font-bold hover:from-blue-400 hover:to-blue-500 transition-all shadow-xl shadow-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/50 hover:-translate-y-1">
                <span className="material-symbols-outlined transition-transform duration-300 group-hover:rotate-12">rocket_launch</span>
                Start Free Trial
              </a>
              <a href="#" className="group flex items-center gap-2 rounded-xl h-14 px-8 bg-white/5 border border-white/10 text-white text-base font-bold hover:bg-white/10 hover:border-white/20 transition-all hover:-translate-y-1">
                <span className="material-symbols-outlined text-blue-400">play_circle</span>
                See How It Works
              </a>
            </div>
          </Reveal>

          {/* Floating badges */}
          <div className="mt-20 flex flex-wrap justify-center gap-3">
            {['IPC & CrPC', 'SCC Verified', 'SC & HC Formats', 'Hindi Support', '50+ Templates'].map((tag, i) => (
              <Reveal key={tag} delay={400 + i * 80}>
                <div className="px-4 py-2 rounded-full bg-white/[0.06] border border-white/10 text-xs font-medium text-slate-400 hover:text-white hover:border-blue-500/40 transition-all cursor-default">
                  {tag}
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-500 text-xs animate-bounce">
          <span>Scroll to explore</span>
          <span className="material-symbols-outlined text-base">expand_more</span>
        </div>
      </section>

      {/* ── STATS ───────────────────────────────────────────────────────────── */}
      <section className="relative py-20 px-4 overflow-hidden">
        {/* Unified background */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-cyan-600/20" />
        <div className="absolute inset-0 bg-[#080D1A]/60" />
        <div className="absolute inset-0 border-y border-white/5" />

        {/* Animated gradient orbs */}
        <div className="absolute left-0 top-0 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-float" />
        <div className="absolute right-0 bottom-0 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />

        <div className="relative z-10 max-w-5xl mx-auto">
          <Reveal className="text-center mb-12">
            <p className="text-slate-400 text-sm uppercase tracking-widest font-bold">By the numbers</p>
          </Reveal>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard icon="description"    value={50}    suffix="+"  label="Document Types"   color="#3B82F6" delay={0}   />
            <StatCard icon="gavel"          value={10000} suffix="+"  label="Case Citations"   color="#8B5CF6" delay={150} />
            <StatCard icon="speed"          value={60}    suffix="%"  label="Time Saved"       color="#10B981" delay={300} />
            <StatCard icon="verified"       value={100}   suffix="%"  label="Verified Sources" color="#F59E0B" delay={450} />
          </div>
        </div>
      </section>

      {/* ── CORE FEATURES GRID ──────────────────────────────────────────────── */}
      <section className="relative py-24 px-4 overflow-hidden">
        {/* Subtle grid */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'radial-gradient(circle, #3B82F6 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

        <div className="relative z-10 max-w-6xl mx-auto">
          <SectionHeader
            badge="Core Features"
            title={<>Six Powerful Tools to<br /><span className="shimmer-text">Transform Your Practice</span></>}
            subtitle="Everything an Indian advocate needs — in one intelligent platform."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mainFeatures.map((f, i) => (
              <FeatureCard key={i} {...f} delay={i * 100} />
            ))}
          </div>
        </div>
      </section>

      {/* ── DEEP DIVE TABS ──────────────────────────────────────────────────── */}
      <section className="relative py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#080D1A] via-[#0C1228] to-[#080D1A]" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />

        <div className="relative z-10 max-w-6xl mx-auto">
          <SectionHeader
            badge="Deep Dive"
            title={<>Explore Features<br /><span className="shimmer-text">In Detail</span></>}
            subtitle="See exactly how each feature helps you work smarter and faster."
          />

          {/* Tab Buttons */}
          <div className="flex flex-wrap justify-center gap-3 mb-14">
            {detailedFeatures.map((f, i) => (
              <button
                key={i}
                onClick={() => setActiveTab(i)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all duration-400 ${
                  activeTab === i
                    ? 'text-white shadow-lg shadow-blue-500/30 scale-105'
                    : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white border border-white/10'
                }`}
                style={activeTab === i ? { background: `linear-gradient(135deg, ${f.color}, ${f.color}99)` } : {}}
              >
                <span className="material-symbols-outlined text-base">{f.icon}</span>
                {f.title}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Text side */}
            <Reveal key={activeTab} direction="left">
              <div>
                <div
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4"
                  style={{ background: `${detailedFeatures[activeTab].color}20`, color: detailedFeatures[activeTab].color }}
                >
                  <span className="material-symbols-outlined text-sm">{detailedFeatures[activeTab].icon}</span>
                  {detailedFeatures[activeTab].title}
                </div>
                <h3 className="text-3xl md:text-4xl font-black text-white mb-4 leading-tight">
                  {detailedFeatures[activeTab].description}
                </h3>
                <p className="text-slate-400 mb-8">Everything you need to work faster and smarter with legal documents.</p>
                <ul className="space-y-3">
                  {detailedFeatures[activeTab].features.map((item, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/10 hover:bg-white/[0.06] transition-all"
                      style={{
                        opacity: 1,
                        animation: `slideInStep 0.5s ease ${i * 80}ms both`,
                      }}
                    >
                      <span
                        className="size-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ background: `${detailedFeatures[activeTab].color}30` }}
                      >
                        <span className="material-symbols-outlined text-xs" style={{ color: detailedFeatures[activeTab].color, fontSize: '12px' }}>check</span>
                      </span>
                      <span className="text-slate-300 text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href="#"
                  className="inline-flex items-center gap-2 mt-8 px-6 py-3 rounded-xl font-bold text-white text-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
                  style={{
                    background: `linear-gradient(135deg, ${detailedFeatures[activeTab].color}, ${detailedFeatures[activeTab].color}99)`,
                    boxShadow: `0 8px 30px ${detailedFeatures[activeTab].color}30`,
                  }}
                >
                  Try {detailedFeatures[activeTab].title}
                  <span className="material-symbols-outlined text-base">arrow_forward</span>
                </a>
              </div>
            </Reveal>

            {/* Mock visual side */}
            <Reveal key={`mock-${activeTab}`} direction="right" delay={100}>
              <MockVisual activeTab={activeTab} />
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── WORKFLOW ─────────────────────────────────────────────────────────── */}
      <section className="relative py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0A0F1E] to-[#080D1A]" />
        {/* Animated diagonal lines */}
        <div className="absolute inset-0 overflow-hidden opacity-5">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="absolute h-px bg-gradient-to-r from-blue-500 to-purple-500" style={{ top: `${i * 14}%`, left: '-10%', right: '-10%', transform: 'rotate(-5deg)' }} />
          ))}
        </div>
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />

        <div className="relative z-10 max-w-6xl mx-auto">
          <SectionHeader
            badge="How It Works"
            title={<>A Seamless Workflow<br /><span className="shimmer-text">From Facts to Filing</span></>}
            subtitle="Four simple steps to go from raw case details to a court-ready document."
            light
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-8">
            {[
              { step: 1, icon: 'input',         title: 'Input Facts',   desc: 'Enter case details via text, voice, or file upload',               color: '#3B82F6' },
              { step: 2, icon: 'psychology',     title: 'AI Analysis',   desc: 'AI identifies relevant laws, sections & precedents',                color: '#8B5CF6' },
              { step: 3, icon: 'edit_document',  title: 'Generate Draft', desc: 'Receive a perfectly formatted document with citations',             color: '#F59E0B' },
              { step: 4, icon: 'download',       title: 'Export & File', desc: 'Edit, export to Word / PDF and file directly in court',             color: '#10B981' },
            ].map((item, i, arr) => (
              <WorkflowStep key={item.step} {...item} delay={i * 200} isLast={i === arr.length - 1} />
            ))}
          </div>

          {/* Process bar */}
          <Reveal delay={800} className="mt-16">
            <div className="relative h-2 bg-white/5 rounded-full overflow-hidden">
              <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500 rounded-full" style={{ width: '100%', animation: 'drawLine 2s ease 1s both' }} />
            </div>
            <div className="flex justify-between mt-2 text-xs text-slate-600">
              <span>Start</span><span>Analyse</span><span>Draft</span><span>Done ✓</span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── MADE FOR INDIA ───────────────────────────────────────────────────── */}
      <section className="relative py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#080D1A] via-[#0C1228] to-[#080D1A]" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />

        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left */}
            <Reveal direction="left">
              <div>
                <div className="inline-flex items-center gap-2 text-blue-400 font-bold uppercase tracking-widest text-xs mb-4">
                  <span className="w-8 h-0.5 bg-blue-400 rounded" />
                  Made for India
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
                  Built Specifically for<br />
                  <span className="shimmer-text">Indian Legal Practice</span>
                </h2>
                <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                  Unlike generic AI tools, DraftMate is trained on Indian statutes, case laws, and court procedures.
                  Every feature is designed with the Indian advocate in mind.
                </p>
                <div className="space-y-3">
                  {[
                    { icon: 'account_balance', text: 'IPC, CrPC, CPC & 200+ Indian Acts',     color: '#3B82F6' },
                    { icon: 'gavel',           text: 'Supreme Court & High Court formatting',  color: '#8B5CF6' },
                    { icon: 'translate',       text: 'Hindi & regional language support',      color: '#10B981' },
                    { icon: 'verified',        text: 'SCC, AIR & authentic reporters',         color: '#F59E0B' },
                  ].map((item, i) => (
                    <Reveal key={i} delay={i * 100} direction="left">
                      <div className="flex items-center gap-4 p-4 bg-white/[0.04] rounded-xl border border-white/8 hover:bg-white/[0.08] hover:border-white/15 transition-all group cursor-default">
                        <div className="size-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${item.color}20` }}>
                          <span className="material-symbols-outlined text-xl" style={{ color: item.color }}>{item.icon}</span>
                        </div>
                        <span className="text-slate-300 font-medium group-hover:text-white transition-colors">{item.text}</span>
                        <span className="material-symbols-outlined ml-auto text-slate-600 group-hover:text-white group-hover:translate-x-1 transition-all text-base">chevron_right</span>
                      </div>
                    </Reveal>
                  ))}
                </div>
              </div>
            </Reveal>

            {/* Right — Stats panel */}
            <Reveal direction="right" delay={200}>
              <div className="relative">
                {/* Glow */}
                <div className="absolute -inset-8 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-3xl blur-3xl" />
                <div className="relative bg-white/[0.04] backdrop-blur-sm rounded-2xl p-8 border border-white/10">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="size-14 rounded-xl bg-blue-500/20 flex items-center justify-center">
                      <span className="material-symbols-outlined text-blue-400 text-3xl">balance</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-lg">Indian Legal Database</h4>
                      <div className="flex items-center gap-1.5 text-green-400 text-xs font-medium mt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                        Updated in real-time
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {[
                      { label: 'Case Laws Indexed',  value: '500K+', color: '#3B82F6' },
                      { label: 'Acts & Amendments',  value: '200+',  color: '#8B5CF6' },
                      { label: 'Court Templates',    value: '50+',   color: '#10B981' },
                      { label: 'Citation Accuracy',  value: '100%',  color: '#F59E0B' },
                    ].map((s, i) => (
                      <Reveal key={i} delay={300 + i * 80}>
                        <div className="flex justify-between items-center p-4 bg-white/[0.04] rounded-xl border border-white/5 hover:border-white/10 transition-all group">
                          <span className="text-slate-400 text-sm group-hover:text-slate-200 transition-colors">{s.label}</span>
                          <span className="font-black text-lg" style={{ color: s.color }}>{s.value}</span>
                        </div>
                      </Reveal>
                    ))}
                  </div>

                  {/* Decorative floating badge */}
                  <div className="absolute -top-4 -right-4 px-3 py-2 bg-green-500 rounded-xl shadow-lg shadow-green-500/40 animate-float">
                    <span className="text-white text-xs font-black">🇮🇳 India-First</span>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── FUTURE ROADMAP ───────────────────────────────────────────────────── */}
      <section className="relative py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0A0F1E] via-[#0D1530] to-[#080D1A]" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />

        {/* Big background glow */}
        <div className="absolute top-1/4 right-0 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10 max-w-6xl mx-auto">
          <SectionHeader
            badge="Future Roadmap"
            title={<>The Future of Legal Tech<br /><span className="shimmer-text">Is Being Built Here</span></>}
            subtitle="We are constantly innovating. Here's what's coming next to DraftMate."
            light
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {roadmapCards.map((card, i) => (
              <RoadmapCard key={i} {...card} delay={i * 100} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────────────── */}
      <section className="relative py-28 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/30 via-purple-600/20 to-cyan-600/20" />
        <div className="absolute inset-0 bg-[#080D1A]/70" />
        {/* Animated grid */}
        <div className="absolute inset-0 opacity-[0.05]"
          style={{ backgroundImage: 'linear-gradient(#3B82F6 1px, transparent 1px), linear-gradient(90deg, #3B82F6 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#080D1A]" />

        {/* Glow orbs */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/20 rounded-full blur-[100px] animate-pulse-glow" />

        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <Reveal>
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-400/10 px-4 py-2 text-xs font-bold text-blue-300 uppercase tracking-widest mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              Ready to get started?
            </div>
          </Reveal>
          <Reveal delay={100}>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight">
              Ready to Transform<br />
              <span className="shimmer-text">Your Practice?</span>
            </h2>
          </Reveal>
          <Reveal delay={200}>
            <p className="text-xl text-slate-400 mb-10 max-w-xl mx-auto">
              Join thousands of advocates who are drafting faster, researching smarter, and delivering better results.
            </p>
          </Reveal>
          <Reveal delay={300}>
            <div className="flex flex-wrap gap-4 justify-center">
              <a href="#" className="group flex items-center gap-2 rounded-xl h-14 px-8 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-base font-bold hover:from-blue-400 hover:to-blue-500 transition-all shadow-2xl shadow-blue-500/40 hover:shadow-blue-500/60 hover:-translate-y-1">
                <span className="material-symbols-outlined transition-transform group-hover:rotate-12">rocket_launch</span>
                Start Free Trial
              </a>
              <a href="#" className="flex items-center gap-2 rounded-xl h-14 px-8 bg-white/5 border border-white/15 text-white text-base font-bold hover:bg-white/10 hover:border-white/25 transition-all hover:-translate-y-1">
                <span className="material-symbols-outlined text-blue-400">play_circle</span>
                Watch Demo
              </a>
            </div>
          </Reveal>
          <Reveal delay={400}>
            <p className="text-slate-600 text-sm mt-6">No credit card required · 7-day free trial · Cancel anytime</p>
          </Reveal>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────────────── */}
      <footer className="relative py-10 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-base">balance</span>
            </div>
            <span className="font-black text-lg text-white">Draft<span className="text-blue-400">Mate</span></span>
          </div>
          <div className="flex gap-6 text-sm">
            {['Home', 'How It Works', 'Features', 'Login'].map(link => (
              <a key={link} href="#" className="text-slate-500 hover:text-white transition-colors">{link}</a>
            ))}
          </div>
          <p className="text-slate-600 text-sm">© 2024 DraftMate. All rights reserved.</p>
        </div>
      </footer>

      {/* Keyframe injection */}
      <style>{`
        @keyframes orbitDot {
          from { transform: rotate(0deg) translateX(26px) rotate(0deg); }
          to   { transform: rotate(360deg) translateX(26px) rotate(-360deg); }
        }
        @keyframes slideInStep {
          from { opacity: 0; transform: translateX(-20px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes waveIn {
          from { width: 0; }
          to   { width: 100%; }
        }
        @keyframes drawLine {
          from { width: 0; }
          to   { width: 100%; }
        }
      `}</style>
    </div>
  );
};

export default Features;
