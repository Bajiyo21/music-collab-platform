import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";

/**
 * TuneCollab Landing Page
 * Immersive retro-futuristic hero with 3D waveform, floating notes, and smooth animations
 */

// Floating Music Note Component
function FloatingNote({ delay, duration }: { delay: number; duration: number }) {
  return (
    <div
      className="absolute text-cyan-400 text-4xl opacity-30 pointer-events-none float"
      style={{
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        animation: `float ${duration}s ease-in-out infinite`,
        animationDelay: `${delay}s`,
      }}
    >
      ♪
    </div>
  );
}

// Waveform Visualizer Component
function WaveformVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const barsRef = useRef<number[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Initialize bars
    if (barsRef.current.length === 0) {
      const barCount = 64;
      barsRef.current = Array(barCount).fill(0);
    }

    const animate = () => {
      ctx.fillStyle = "rgba(2, 2, 2, 0.1)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const barCount = barsRef.current.length;
      const barWidth = canvas.width / barCount;

      // Update bars with random heights
      barsRef.current = barsRef.current.map((bar) => {
        const target = Math.random() * canvas.height * 0.8;
        return bar + (target - bar) * 0.1;
      });

      // Draw bars with gradient
      barsRef.current.forEach((height, i) => {
        const gradient = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - height);
        gradient.addColorStop(0, "rgba(0, 255, 255, 0.8)");
        gradient.addColorStop(1, "rgba(0, 255, 255, 0.3)");

        ctx.fillStyle = gradient;
        ctx.fillRect(i * barWidth + 1, canvas.height - height, barWidth - 2, height);

        // Add glow effect
        ctx.shadowColor = "rgba(0, 255, 255, 0.5)";
        ctx.shadowBlur = 10;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-32 rounded border border-cyan-400/30 bg-black/50 backdrop-blur-sm"
      style={{ boxShadow: "0 0 20px rgba(0, 255, 255, 0.2)" }}
    />
  );
}

export default function Home() {
  const { user, isAuthenticated, logout } = useAuth({});
  const [, navigate] = useLocation();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* Navigation Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/40 backdrop-blur-md">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold neon-cyan">♪</div>
            <span className="text-xl font-bold tracking-wider">TuneCollab</span>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm hover:text-cyan-400 transition">
              Features
            </a>
            <a href="#explore" className="text-sm hover:text-cyan-400 transition">
              Explore
            </a>
            <a href="#about" className="text-sm hover:text-cyan-400 transition">
              About
            </a>
          </nav>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-muted-foreground">Welcome, {user?.name || 'User'}</span>
                <Button
                  onClick={() => navigate("/explore")}
                  className="bg-black/40 backdrop-blur-md border border-white/10 px-6 py-2 font-semibold transition-all duration-200 hover:bg-black/60 hover:border-white/20 hover:shadow-lg active:scale-95 text-xs"
                >
                  Explore
                </Button>
                <Button
                  onClick={() => logout()}
                  variant="outline"
                  className="text-xs"
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={() => navigate("/login")}
                  variant="ghost"
                  className="text-xs"
                >
                  Login
                </Button>
                <Button
                  onClick={() => navigate("/signup")}
                  className="glass-button text-xs"
                >
                  Sign Up
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
        {/* Floating Notes Background */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(12)].map((_, i) => (
            <FloatingNote key={i} delay={i * 0.3} duration={8 + i} />
          ))}
        </div>

        {/* Animated Background Grid */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(0deg, transparent 24%, rgba(0, 255, 255, .05) 25%, rgba(0, 255, 255, .05) 26%, transparent 27%, transparent 74%, rgba(0, 255, 255, .05) 75%, rgba(0, 255, 255, .05) 76%, transparent 77%, transparent),
              linear-gradient(90deg, transparent 24%, rgba(0, 255, 255, .05) 25%, rgba(0, 255, 255, .05) 26%, transparent 27%, transparent 74%, rgba(0, 255, 255, .05) 75%, rgba(0, 255, 255, .05) 76%, transparent 77%, transparent)
            `,
            backgroundSize: "50px 50px",
            transform: `translateY(${scrollY * 0.5}px)`,
          }}
        />

        {/* Hero Content */}
        <div className="relative z-10 container text-center max-w-4xl mx-auto px-4">
          {/* Error Code Badge */}
          <div className="mb-8 inline-block">
            <div className="error-code bracket-left bracket-right">
              SYSTEM_INIT.MUSIC.COLLAB_v1.0
            </div>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-wider">
            <span className="neon-cyan">TUNE</span>
            <span className="mx-2">×</span>
            <span className="neon-magenta">COLLAB</span>
          </h1>

          {/* Subheading */}
          <p className="text-lg md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Immerse yourself in a retro-futuristic music collaboration platform. Create, discover,
            and collaborate with musicians worldwide.
          </p>

          {/* Waveform Visualizer */}
          <div className="mb-12 max-w-2xl mx-auto">
            <WaveformVisualizer />
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            {isAuthenticated ? (
              <>
                <Button
                  onClick={() => navigate("/explore")}
                  className="bg-black/40 backdrop-blur-md border border-white/10 px-8 py-3 font-semibold transition-all duration-200 hover:bg-black/60 hover:border-white/20 hover:shadow-lg active:scale-95 text-base"
                >
                  Explore Tracks
                </Button>
                <Button
                  onClick={() => navigate("/upload")}
                  variant="outline"
                  className="px-8 py-3 text-base"
                >
                  Upload Track
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={() => navigate("/signup")}
                  className="bg-black/40 backdrop-blur-md border border-white/10 px-8 py-3 font-semibold transition-all duration-200 hover:bg-black/60 hover:border-white/20 hover:shadow-lg active:scale-95 text-base"
                >
                  Get Started
                </Button>
                <Button
                  onClick={() => navigate("/login")}
                  variant="outline"
                  className="px-8 py-3 text-base"
                >
                  Sign In
                </Button>
              </>
            )}
          </div>

          {/* Status Indicator */}
          <div className="text-sm text-muted-foreground">
            <span className="inline-block w-2 h-2 bg-lime-400 rounded-full mr-2 animate-pulse" />
            System Online • Ready to Collaborate
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 border-t border-white/10">
        <div className="container">
          <h2 className="text-4xl font-bold text-center mb-16 neon-cyan">
            Core Features
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: "🎵",
                title: "Upload & Manage",
                desc: "Upload your tracks with AI-powered metadata generation",
              },
              {
                icon: "🎧",
                title: "Advanced Player",
                desc: "Interactive waveform visualizer with full playback control",
              },
              {
                icon: "🤝",
                title: "Collaborate",
                desc: "Invite musicians and create multi-track projects together",
              },
              {
                icon: "🔍",
                title: "Discover",
                desc: "Explore trending tracks and recommended artists",
              },
              {
                icon: "📋",
                title: "Playlists",
                desc: "Create and share curated playlists with your community",
              },
              {
                icon: "💬",
                title: "Social",
                desc: "Like, comment, and engage with the music community",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="bg-black/40 backdrop-blur-md border border-white/10 rounded p-6 scroll-fade-in"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 border-t border-white/10">
        <div className="container text-center">
          <h2 className="text-4xl font-bold mb-8">Ready to Create?</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of musicians collaborating on TuneCollab. Start creating today.
          </p>
          {!isAuthenticated && (
          <Button
            onClick={() => navigate("/signup")}
            className="bg-black/40 backdrop-blur-md border border-white/10 px-8 py-3 font-semibold transition-all duration-200 hover:bg-black/60 hover:border-white/20 hover:shadow-lg active:scale-95 text-base"
          >
            Start Creating Now
          </Button>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 text-center text-sm text-muted-foreground">
        <div className="container">
          <p>© 2026 TuneCollab. All rights reserved.</p>
          <div className="error-code mt-4">
            [SYSTEM_STATUS: OPERATIONAL] [VERSION: 1.0.0]
          </div>
        </div>
      </footer>
    </div>
  );
}
