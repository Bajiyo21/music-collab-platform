import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Music, Zap, Users, Headphones } from "lucide-react";
import { startLogin } from "@/const";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  const handleExplore = () => navigate("/explore");
  const handleDashboard = () => navigate("/dashboard");
  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate("/dashboard");
    } else {
      startLogin();
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/40 backdrop-blur-md">
        <div className="container flex min-h-16 flex-wrap items-center justify-between gap-2 px-4 py-3 sm:h-16 sm:flex-nowrap sm:py-0">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-400 to-magenta-500 flex items-center justify-center font-bold text-black text-sm">♪</div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-cyan-200 to-cyan-400 bg-clip-text text-transparent">TuneCollab</span>
          </div>

          <nav className="hidden items-center gap-8 md:flex">
            <button onClick={handleExplore} className="text-sm text-gray-300 hover:text-cyan-400 transition">
              Explore
            </button>
            <button onClick={() => navigate("/ai-studio")} className="text-sm text-cyan-300 hover:text-cyan-200 transition font-medium flex items-center gap-1.5">
              ✨ AI Studio
            </button>
            <a href="#features" className="text-sm text-gray-300 hover:text-cyan-400 transition">
              Features
            </a>
          </nav>

          <nav className="order-3 flex w-full items-center justify-center gap-5 border-t border-white/10 pt-2 md:hidden">
            <button onClick={handleExplore} className="text-xs text-muted-foreground transition hover:text-cyan-400">Explore</button>
            <a href="#features" className="text-xs text-muted-foreground transition hover:text-cyan-400">Features</a>
            <a href="#about" className="text-xs text-muted-foreground transition hover:text-cyan-400">About</a>
          </nav>

          <div className="flex items-center gap-2 sm:gap-4">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-muted-foreground hidden sm:inline">{user?.name}</span>
                <button onClick={handleDashboard} className="px-4 py-2 bg-cyan-400/20 border border-cyan-400/50 text-cyan-400 hover:bg-cyan-400/30 rounded font-semibold transition-all cursor-pointer">
                  Dashboard
                </button>
              </>
            ) : (
              <button onClick={() => startLogin()} className="px-4 py-2 bg-magenta-400/20 border border-magenta-400/50 text-magenta-400 hover:bg-magenta-400/30 rounded font-semibold transition-all cursor-pointer">
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-4 pb-16 pt-36 sm:pb-20 sm:pt-32">
        <div className="container max-w-4xl mx-auto text-center">
          {/* Error Code Badge */}
          <div className="mb-6 inline-block max-w-full rounded border border-cyan-400/30 bg-black/40 px-3 py-2 text-center text-[0.65rem] font-mono text-cyan-400 sm:mb-8 sm:px-4 sm:text-xs">
            [ SYSTEM_INIT.MUSIC.COLLAB_v1.0 ]
          </div>

          {/* Main Heading */}
          <h1 className="mb-5 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-4xl font-black leading-tight tracking-tight sm:text-5xl md:mb-6 md:text-7xl">
            <span className="neon-cyan">TUNE</span>
            <span className="mx-2">×</span>
            <span className="neon-magenta">COLLAB</span>
          </h1>

          {/* Subheading */}
          <p className="mx-auto mb-8 max-w-2xl text-base leading-relaxed text-muted-foreground sm:mb-12 sm:text-xl">
            Immerse yourself in a retro-futuristic music collaboration platform. Create, discover, and collaborate with musicians worldwide.
          </p>

          {/* Waveform Visualizer */}
          <div className="mb-8 flex h-20 items-center justify-center overflow-hidden rounded-lg border border-cyan-400/30 bg-gradient-to-b from-cyan-500/20 to-transparent sm:mb-12 sm:h-24">
            <div className="flex h-12 w-full items-end justify-center gap-0.5 px-2 sm:h-16 sm:gap-1">
              {Array.from({ length: 40 }).map((_, i) => (
                <div
                  key={i}
                  className="flex-1 bg-gradient-to-t from-cyan-400 to-cyan-300 rounded-sm"
                  style={{
                    height: `${Math.random() * 100}%`,
                    animation: `pulse 0.5s ease-in-out ${i * 0.05}s infinite`,
                  }}
                />
              ))}
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <button onClick={handleExplore} className="px-8 py-4 bg-cyan-400 text-black font-bold rounded hover:bg-cyan-300 transition-all transform hover:scale-105 cursor-pointer">
              Explore Tracks
            </button>
            <button onClick={handleGetStarted} className="px-8 py-4 bg-black/40 border border-magenta-400/50 text-magenta-400 font-bold rounded hover:bg-black/60 transition-all cursor-pointer">
              Get Started
            </button>
          </div>

          {/* Status */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-center text-xs text-muted-foreground sm:text-sm mb-12">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span>System Online • Ready to Collaborate</span>
          </div>

          {/* Cover Art Banner Removed */}
        </div>

        {/* Floating Notes */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="absolute text-cyan-400/30 text-4xl"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `float ${3 + Math.random() * 2}s ease-in-out ${i * 0.2}s infinite`,
              }}
            >
              ♪
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4 bg-gradient-to-b from-black/40 to-black/80 border-t border-white/10">
        <div className="container max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs uppercase tracking-[0.3em] text-cyan-400 font-mono">Next-Gen Architecture</span>
            <h2 className="text-3xl sm:text-5xl font-black mt-2 tracking-tight">
              <span className="neon-cyan">POWERFUL FEATURES</span>
            </h2>
            <p className="text-gray-400 mt-3 max-w-xl mx-auto text-sm sm:text-base">
              Engineered for professional musicians, producers, and audio collaborators seeking absolute precision and speed.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Music, title: "Secure Uploads", desc: "SHA-256 copyright verification & lossless stems" },
              { icon: Users, title: "Real-time Collab", desc: "Multi-track room layers, chat & stem mixing" },
              { icon: Headphones, title: "AI Studio", desc: "Automated analysis, chord progressions & TuneAI chat" },
              { icon: Zap, title: "Instant Discovery", desc: "Trending charts, genre tags & persistent favorites" },
            ].map((feature, i) => (
              <div key={i} className="rounded-xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl transition-all duration-300 hover:border-cyan-400/40 hover:bg-white/[0.06] hover:-translate-y-1">
                <div className="mb-4 inline-flex rounded-lg border border-cyan-400/30 bg-cyan-400/10 p-3 text-cyan-400">
                  <feature.icon size={22} />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-gray-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-white/10 bg-black/80">
        <div className="container mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <span className="font-bold text-cyan-400 font-mono">♪ TUNE×COLLAB</span>
            <span>© 2026 Professional Music Ecosystem</span>
          </div>
          <div className="flex items-center gap-6">
            <button onClick={handleExplore} className="hover:text-cyan-400 transition">Explore</button>
            <button onClick={() => navigate("/ai-studio")} className="hover:text-cyan-400 transition">AI Studio</button>
            <button onClick={() => navigate("/collaborate")} className="hover:text-cyan-400 transition">Collaborate</button>
            <a href="#features" className="hover:text-cyan-400 transition">Features</a>
          </div>
          <div className="text-cyan-400/80 font-mono">SYSTEM_ONLINE_SECURE</div>
        </div>
      </footer>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-20px) translateX(10px); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
