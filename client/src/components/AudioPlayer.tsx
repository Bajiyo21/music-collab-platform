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
 * Advanced Audio Player with Waveform Visualizer.
 * Features: play/pause, keyboard and button seeking, volume control, and real metadata duration.
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
  const [trackDuration, setTrackDuration] = useState(duration);
  const [volume, setVolume] = useState(0.8);
  const [waveformData, setWaveformData] = useState<number[]>([]);
  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const bars = 60;
    const data = Array.from({ length: bars }, () => Math.random() * 0.8 + 0.2);
    setWaveformData(data);
  }, []);

  useEffect(() => {
    setTrackDuration(duration);
    setCurrentTime(0);
    setIsPlaying(false);
  }, [duration, audioUrl]);

  useEffect(() => {
    const handleKeyboard = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.tagName === "INPUT" || target?.tagName === "TEXTAREA" || target?.isContentEditable) return;
      const audio = audioRef.current;
      if (!audio) return;

      if (event.code === "Space") {
        event.preventDefault();
        togglePlay();
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        seekBy(-5);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        seekBy(5);
      }
    };

    window.addEventListener("keydown", handleKeyboard);
    return () => window.removeEventListener("keydown", handleKeyboard);
  }, [isPlaying, trackDuration]);

  useEffect(() => {
    if (!canvasRef.current || waveformData.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const barWidth = width / waveformData.length;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
    ctx.fillRect(0, 0, width, height);

    waveformData.forEach((value, index) => {
      const barHeight = value * height;
      const x = index * barWidth;
      const y = (height - barHeight) / 2;
      const gradient = ctx.createLinearGradient(x, y, x, y + barHeight);
      gradient.addColorStop(0, "rgba(0, 255, 255, 0.8)");
      gradient.addColorStop(0.5, "rgba(0, 200, 200, 0.6)");
      gradient.addColorStop(1, "rgba(0, 150, 150, 0.4)");
      ctx.fillStyle = gradient;
      ctx.fillRect(x + 1, y, Math.max(1, barWidth - 2), barHeight);
    });

    const playheadX = trackDuration > 0 ? (currentTime / trackDuration) * width : 0;
    ctx.strokeStyle = "rgba(255, 0, 255, 0.8)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(playheadX, 0);
    ctx.lineTo(playheadX, height);
    ctx.stroke();
  }, [waveformData, currentTime, trackDuration]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      onPause?.();
      return;
    }

    void audio.play().then(() => {
      setIsPlaying(true);
      onPlay?.();
    }).catch(() => {
      setIsPlaying(false);
      onPause?.();
    });
  };

  const seekBy = (seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    const nextTime = Math.max(0, Math.min(trackDuration, audio.currentTime + seconds));
    audio.currentTime = nextTime;
    setCurrentTime(nextTime);
  };

  const handleSeek = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const audio = audioRef.current;
    if (!canvas || !audio || trackDuration <= 0) return;

    const rect = canvas.getBoundingClientRect();
    const percentage = (event.clientX - rect.left) / rect.width;
    const newTime = Math.max(0, Math.min(trackDuration, percentage * trackDuration));
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="w-full space-y-4 rounded-lg border border-white/10 bg-black/60 p-6 backdrop-blur-md">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h3 className="safe-wrap text-lg font-bold text-white">{trackTitle}</h3>
          <p className="text-sm text-muted-foreground">{artistName}</p>
        </div>
        <button aria-label="Expand player" className="text-muted-foreground transition hover:text-cyan-400">
          <Maximize2 className="h-5 w-5" />
        </button>
      </div>

      <canvas
        ref={canvasRef}
        width={600}
        height={80}
        onClick={handleSeek}
        role="slider"
        aria-label="Track progress"
        aria-valuemin={0}
        aria-valuemax={trackDuration}
        aria-valuenow={currentTime}
        tabIndex={0}
        className="h-20 w-full cursor-pointer rounded bg-gradient-to-b from-cyan-500/10 to-transparent transition hover:from-cyan-500/20"
      />

      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(trackDuration)}</span>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button aria-label="Seek back 5 seconds" onClick={() => seekBy(-5)} className="rounded p-2 text-muted-foreground transition hover:bg-white/10 hover:text-cyan-400">
            <SkipBack className="h-5 w-5" />
          </button>

          <button
            aria-label={isPlaying ? "Pause track" : "Play track"}
            onClick={togglePlay}
            className="rounded-full border border-cyan-400/50 bg-gradient-to-br from-cyan-500/30 to-magenta-500/30 p-3 transition-all hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-400/30"
          >
            {isPlaying ? <Pause className="h-6 w-6 fill-cyan-400 text-cyan-400" /> : <Play className="h-6 w-6 fill-cyan-400 text-cyan-400" />}
          </button>

          <button aria-label="Seek forward 5 seconds" onClick={() => seekBy(5)} className="rounded p-2 text-muted-foreground transition hover:bg-white/10 hover:text-cyan-400">
            <SkipForward className="h-5 w-5" />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <Volume2 className="h-4 w-4 text-muted-foreground" />
          <input
            aria-label="Volume"
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={(event) => {
              const newVolume = parseFloat(event.target.value);
              setVolume(newVolume);
              if (audioRef.current) audioRef.current.volume = newVolume;
            }}
            className="h-1 w-24 cursor-pointer appearance-none rounded-full bg-white/20 accent-cyan-400"
          />
          <span className="w-8 text-xs text-muted-foreground">{Math.round(volume * 100)}%</span>
        </div>
      </div>

      <audio
        ref={audioRef}
        src={audioUrl}
        preload="metadata"
        onLoadedMetadata={(event) => {
          const metadataDuration = event.currentTarget.duration;
          if (Number.isFinite(metadataDuration) && metadataDuration > 0) setTrackDuration(metadataDuration);
          event.currentTarget.volume = volume;
        }}
        onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
        onEnded={() => {
          setIsPlaying(false);
          setCurrentTime(0);
        }}
      />
    </div>
  );
}
