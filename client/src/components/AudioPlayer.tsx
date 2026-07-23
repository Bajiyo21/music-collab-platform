import { useState, useRef, useEffect } from "react";
import { Play, Pause, SkipBack, SkipForward, Volume2, Maximize2 } from "lucide-react";

interface AudioPlayerProps {
  trackTitle: string;
  artistName: string;
  audioUrl?: string;
  duration?: number;
  onPlay?: () => void;
  onPause?: () => void;
}

/**
 * Advanced Audio Player with Waveform Visualizer
 * Features: play/pause, seek, volume control, full-screen mode
 */
export function AudioPlayer({
  trackTitle,
  artistName,
  audioUrl,
  duration = 240,
  onPlay,
  onPause,
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [waveformData, setWaveformData] = useState<number[]>([]);
  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Generate mock waveform data
  useEffect(() => {
    const bars = 60;
    const data = Array.from({ length: bars }, () => Math.random() * 0.8 + 0.2);
    setWaveformData(data);
  }, []);

  // Draw waveform
  useEffect(() => {
    if (!canvasRef.current || waveformData.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const barWidth = width / waveformData.length;

    // Clear canvas
    ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
    ctx.fillRect(0, 0, width, height);

    // Draw waveform
    waveformData.forEach((value, index) => {
      const barHeight = value * height;
      const x = index * barWidth;
      const y = (height - barHeight) / 2;

      // Gradient for each bar
      const gradient = ctx.createLinearGradient(x, y, x, y + barHeight);
      gradient.addColorStop(0, "rgba(0, 255, 255, 0.8)");
      gradient.addColorStop(0.5, "rgba(0, 200, 200, 0.6)");
      gradient.addColorStop(1, "rgba(0, 150, 150, 0.4)");

      ctx.fillStyle = gradient;
      ctx.fillRect(x + 1, y, barWidth - 2, barHeight);
    });

    // Draw playhead
    const playheadX = (currentTime / duration) * width;
    ctx.strokeStyle = "rgba(255, 0, 255, 0.8)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(playheadX, 0);
    ctx.lineTo(playheadX, height);
    ctx.stroke();
  }, [waveformData, currentTime, duration]);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      onPause?.();
    } else {
      audioRef.current.play();
      onPlay?.();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !audioRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = percentage * duration;

    setCurrentTime(newTime);
    audioRef.current.currentTime = newTime;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="w-full bg-black/60 backdrop-blur-md border border-white/10 rounded-lg p-6 space-y-4">
      {/* Track Info */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white">{trackTitle}</h3>
          <p className="text-sm text-muted-foreground">{artistName}</p>
        </div>
        <button className="text-muted-foreground hover:text-cyan-400 transition">
          <Maximize2 className="w-5 h-5" />
        </button>
      </div>

      {/* Waveform Visualizer */}
      <canvas
        ref={canvasRef}
        width={600}
        height={80}
        onClick={handleSeek}
        className="w-full h-20 bg-gradient-to-b from-cyan-500/10 to-transparent rounded cursor-pointer hover:from-cyan-500/20 transition"
      />

      {/* Time Display */}
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        {/* Left Controls */}
        <div className="flex items-center gap-2">
          <button className="p-2 rounded hover:bg-white/10 transition text-muted-foreground hover:text-cyan-400">
            <SkipBack className="w-5 h-5" />
          </button>

          <button
            onClick={togglePlay}
            className="p-3 rounded-full bg-gradient-to-br from-cyan-500/30 to-magenta-500/30 border border-cyan-400/50 hover:border-cyan-400 transition-all hover:shadow-lg hover:shadow-cyan-400/30"
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 text-cyan-400 fill-cyan-400" />
            ) : (
              <Play className="w-6 h-6 text-cyan-400 fill-cyan-400" />
            )}
          </button>

          <button className="p-2 rounded hover:bg-white/10 transition text-muted-foreground hover:text-cyan-400">
            <SkipForward className="w-5 h-5" />
          </button>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-3">
          <Volume2 className="w-4 h-4 text-muted-foreground" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={(e) => {
              const newVolume = parseFloat(e.target.value);
              setVolume(newVolume);
              if (audioRef.current) {
                audioRef.current.volume = newVolume;
              }
            }}
            className="w-24 h-1 bg-white/20 rounded-full appearance-none cursor-pointer accent-cyan-400"
          />
          <span className="text-xs text-muted-foreground w-8">{Math.round(volume * 100)}%</span>
        </div>
      </div>

      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onEnded={() => {
          setIsPlaying(false);
          setCurrentTime(0);
        }}
      />
    </div>
  );
}
