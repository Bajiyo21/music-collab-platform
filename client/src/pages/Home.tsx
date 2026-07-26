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

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/40 backdrop-blur-md">
        <div className="container flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold neon-cyan">♪</div>
            <span className="text-xl font-bold tracking-wider">TuneCollab</span>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <button onClick={handleExplore} className="text-sm hover:text-cyan-400 transition">
              Explore
            </button>
            <a href="#features" className="text-sm hover:text-cyan-400 transition">
              Features
            </a>
            <a href="#about" className="text-sm hover:text-cyan-400 transition">
              About
            </a>
          </nav>

          <div className="flex items-center gap-4">
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
      <section className="pt-32 pb-20 px-4 relative">
        <div className="container max-w-4xl mx-auto text-center">
          {/* Error Code Badge */}
          <div className="inline-block mb-8 px-4 py-2 bg-black/40 border border-cyan-400/30 rounded text-xs font-mono text-cyan-400">
            [ SYSTEM_INIT.MUSIC.COLLAB_v1.0 ]
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight">
            <span className="neon-cyan">TUNE</span>
            <span className="mx-2">×</span>
            <span className="neon-magenta">COLLAB</span>
          </h1>

          {/* Subheading */}
          <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
            Immerse yourself in a retro-futuristic music collaboration platform. Create, discover, and collaborate with musicians worldwide.
          </p>

          {/* Waveform Visualizer */}
          <div className="mb-12 h-24 bg-gradient-to-b from-cyan-500/20 to-transparent rounded-lg border border-cyan-400/30 flex items-center justify-center overflow-hidden">
            <div className="flex items-end justify-center gap-1 h-16 w-full">
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
            <button onClick={handleExplore} className="px-8 py-4 bg-black/40 border border-magenta-400/50 text-magenta-400 font-bold rounded hover:bg-black/60 transition-all cursor-pointer">
              Get Started
            </button>
          </div>

          {/* Status */}
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span>System Online • Ready to Collaborate</span>
          </div>
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
      <section id="features" className="py-20 px-4 bg-black/20 border-t border-white/10">
        <div className="container max-w-5xl mx-auto">
          <h2 className="text-4xl font-bold mb-16 text-center">
            <span className="neon-cyan">FEATURES</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Music, title: "Upload Tracks", desc: "Share your music with the world" },
              { icon: Users, title: "Collaborate", desc: "Work with musicians globally" },
              { icon: Headphones, title: "Discover", desc: "Find trending music & artists" },
              { icon: Zap, title: "Real-time", desc: "Instant feedback & notifications" },
            ].map((feature, i) => (
              <div key={i} className="bg-black/40 backdrop-blur-md border border-white/10 rounded p-6 hover:border-cyan-400/50 transition-all group">
                <feature.icon className="w-8 h-8 text-cyan-400 mb-4 group-hover:text-magenta-400 transition" />
                <h3 className="font-bold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-white/10 bg-black/40">
        <div className="container max-w-5xl mx-auto text-center text-sm text-muted-foreground">
          <p>© 2026 TuneCollab. All rights reserved. | Retro-Futuristic Music Platform</p>
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
