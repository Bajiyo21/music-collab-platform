import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Music, Zap, Users, Headphones } from "lucide-react";
import { startLogin } from "@/const";
import { ThemeToggle } from "@/components/ThemeToggle";

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
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-card">
        <div className="container flex min-h-16 flex-wrap items-center justify-between gap-2 px-4 py-3 sm:h-16 sm:flex-nowrap sm:py-0">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground">♪</div>
            <span className="text-xl font-bold tracking-tight text-foreground">TuneCollab</span>
          </div>

          <nav className="hidden items-center gap-8 md:flex">
            <button onClick={handleExplore} className="text-sm text-muted-foreground hover:text-primary transition">
              Explore
            </button>
            <button onClick={() => navigate("/ai-studio")} className="flex items-center gap-1.5 text-sm font-medium text-primary transition hover:text-primary/75">
              AI Studio
            </button>
            <a href="#features" className="text-sm text-muted-foreground hover:text-primary transition">
              Features
            </a>
          </nav>

          <nav className="order-3 flex w-full items-center justify-center gap-5 border-t border-border pt-2 md:hidden">
            <button onClick={handleExplore} className="text-xs text-muted-foreground transition hover:text-primary">Explore</button>
            <a href="#features" className="text-xs text-muted-foreground transition hover:text-primary">Features</a>
            <a href="#about" className="text-xs text-muted-foreground transition hover:text-primary">About</a>
          </nav>

          <div className="flex items-center gap-2 sm:gap-4">
            <ThemeToggle />
            {isAuthenticated ? (
              <>
                <span className="text-sm text-muted-foreground hidden sm:inline">{user?.name}</span>
                <button onClick={handleDashboard} className="rounded-md border border-border bg-secondary px-4 py-2 font-semibold text-secondary-foreground transition hover:bg-muted">
                  Dashboard
                </button>
              </>
            ) : (
              <button onClick={() => startLogin()} className="rounded-md bg-primary px-4 py-2 font-semibold text-primary-foreground transition hover:bg-primary/90">
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
          <div className="mb-6 inline-block max-w-full rounded-md border border-border bg-secondary px-3 py-2 text-center text-[0.65rem] font-mono text-primary sm:mb-8 sm:px-4 sm:text-xs">
            MUSIC COLLABORATION WORKSPACE
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
          <div className="mb-8 flex h-20 items-center justify-center overflow-hidden rounded-xl border border-border bg-secondary sm:mb-12 sm:h-24">
            <div className="flex h-12 w-full items-end justify-center gap-0.5 px-2 sm:h-16 sm:gap-1">
              {Array.from({ length: 40 }).map((_, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-sm bg-primary/75"
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
            <button onClick={handleExplore} className="rounded-md bg-primary px-8 py-4 font-bold text-primary-foreground transition hover:bg-primary/90">
              Explore Tracks
            </button>
            <button onClick={handleGetStarted} className="rounded-md border border-border bg-card px-8 py-4 font-bold text-foreground transition hover:bg-secondary">
              Get Started
            </button>
          </div>

          {/* Status */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-center text-xs text-muted-foreground sm:text-sm mb-12">
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>Ready for your next session</span>
          </div>

          {/* Cover Art Banner Removed */}
        </div>

        {/* Floating Notes */}
      </section>

      {/* Features Section */}
      <section id="features" className="border-y border-border bg-secondary py-20 px-4">
        <div className="container max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="font-mono text-xs uppercase tracking-[0.22em] text-primary">Built for creators</span>
            <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-5xl">
              A better session starts here.
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
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
              <div key={i} className="rounded-xl border border-border bg-card p-6 transition hover:border-primary/40 hover:shadow-sm">
                <div className="mb-4 inline-flex rounded-lg bg-accent p-3 text-accent-foreground">
                  <feature.icon size={22} />
                </div>
                <h3 className="mb-2 text-lg font-bold">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-12 px-4">
        <div className="container mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 text-xs text-muted-foreground md:flex-row">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-primary">♪ TUNE×COLLAB</span>
            <span>© 2026 Professional Music Ecosystem</span>
          </div>
          <div className="flex items-center gap-6">
            <button onClick={handleExplore} className="transition hover:text-primary">Explore</button>
            <button onClick={() => navigate("/ai-studio")} className="transition hover:text-primary">AI Studio</button>
            <button onClick={() => navigate("/collaborate")} className="transition hover:text-primary">Collaborate</button>
            <a href="#features" className="transition hover:text-primary">Features</a>
          </div>
          <div className="font-mono text-primary">MADE FOR MUSIC MAKERS</div>
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
