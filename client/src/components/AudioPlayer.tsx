import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pause, Play, Repeat, Repeat1, Shuffle, SkipBack, SkipForward, Volume2 } from "lucide-react";

export type AudioQueueItem = {
  id: string;
  trackTitle: string;
  artistName: string;
  audioUrl?: string;
  duration?: number;
};

interface AudioPlayerProps {
  trackTitle: string;
  artistName: string;
  audioUrl?: string;
  duration?: number;
  queue?: AudioQueueItem[];
  onTrackChange?: (track: AudioQueueItem) => void;
  onPlay?: () => void;
  onPause?: () => void;
}

type RepeatMode = "off" | "all" | "one";

function makeWaveform(seed: string) {
  let state = Array.from(seed).reduce((total, character) => total + character.charCodeAt(0), 0) || 1;
  return Array.from({ length: 60 }, () => {
    state = (state * 9301 + 49297) % 233280;
    return 0.2 + (state / 233280) * 0.8;
  });
}

export function AudioPlayer({ trackTitle, artistName, audioUrl, duration = 240, queue, onTrackChange, onPlay, onPause }: AudioPlayerProps) {
  const fallbackTrack = useMemo<AudioQueueItem>(() => ({ id: `${trackTitle}-${audioUrl ?? "local"}`, trackTitle, artistName, audioUrl, duration }), [trackTitle, artistName, audioUrl, duration]);
  const playbackQueue = useMemo(() => queue?.length ? queue : [fallbackTrack], [queue, fallbackTrack]);
  const [queueIndex, setQueueIndex] = useState(() => Math.max(0, playbackQueue.findIndex((track) => track.id === fallbackTrack.id)));
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [trackDuration, setTrackDuration] = useState(duration);
  const [volume, setVolume] = useState(0.8);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>("off");
  const [waveformData, setWaveformData] = useState<number[]>([]);
  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const shouldAutoplayRef = useRef(false);
  const activeTrack = playbackQueue[queueIndex] ?? fallbackTrack;

  useEffect(() => {
    const nextIndex = playbackQueue.findIndex((track) => track.id === fallbackTrack.id);
    setQueueIndex(nextIndex >= 0 ? nextIndex : 0);
  }, [fallbackTrack.id, playbackQueue]);

  useEffect(() => {
    setWaveformData(makeWaveform(activeTrack.id));
    setTrackDuration(activeTrack.duration || duration);
    setCurrentTime(0);
  }, [activeTrack.id, activeTrack.duration, duration]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !shouldAutoplayRef.current) return;
    shouldAutoplayRef.current = false;
    void audio.play().then(() => {
      setIsPlaying(true);
      onPlay?.();
    }).catch(() => setIsPlaying(false));
  }, [activeTrack.audioUrl, activeTrack.id, onPlay]);

  const seekBy = useCallback((seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    const nextTime = Math.max(0, Math.min(trackDuration, audio.currentTime + seconds));
    audio.currentTime = nextTime;
    setCurrentTime(nextTime);
  }, [trackDuration]);

  const togglePlay = useCallback(() => {
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
  }, [isPlaying, onPause, onPlay]);

  const changeTrack = useCallback((direction: -1 | 1, autoplay = isPlaying) => {
    if (playbackQueue.length <= 1) return;
    let nextIndex: number;
    if (isShuffle) {
      const options = playbackQueue.map((_, index) => index).filter((index) => index !== queueIndex);
      nextIndex = options[Math.floor(Math.random() * options.length)] ?? queueIndex;
    } else {
      nextIndex = queueIndex + direction;
      if (nextIndex < 0) nextIndex = repeatMode === "all" ? playbackQueue.length - 1 : 0;
      if (nextIndex >= playbackQueue.length) nextIndex = repeatMode === "all" ? 0 : playbackQueue.length - 1;
      if (nextIndex === queueIndex && repeatMode !== "all") return;
    }
    shouldAutoplayRef.current = autoplay;
    setIsPlaying(false);
    setQueueIndex(nextIndex);
    onTrackChange?.(playbackQueue[nextIndex]);
  }, [isPlaying, isShuffle, onTrackChange, playbackQueue, queueIndex, repeatMode]);

  useEffect(() => {
    const handleKeyboard = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.tagName === "INPUT" || target?.tagName === "TEXTAREA" || target?.isContentEditable) return;
      if (event.code === "Space") { event.preventDefault(); togglePlay(); }
      else if (event.key === "ArrowLeft") { event.preventDefault(); seekBy(-5); }
      else if (event.key === "ArrowRight") { event.preventDefault(); seekBy(5); }
    };
    window.addEventListener("keydown", handleKeyboard);
    return () => window.removeEventListener("keydown", handleKeyboard);
  }, [seekBy, togglePlay]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || waveformData.length === 0) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    const barWidth = canvas.width / waveformData.length;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "rgba(0, 0, 0, 0.2)";
    context.fillRect(0, 0, canvas.width, canvas.height);
    waveformData.forEach((value, index) => {
      const barHeight = value * canvas.height;
      const x = index * barWidth;
      const y = (canvas.height - barHeight) / 2;
      const played = trackDuration > 0 && index / waveformData.length <= currentTime / trackDuration;
      const gradient = context.createLinearGradient(x, y, x, y + barHeight);
      gradient.addColorStop(0, played ? "rgba(255, 0, 255, 0.9)" : "rgba(0, 255, 255, 0.5)");
      gradient.addColorStop(1, played ? "rgba(0, 255, 255, 0.9)" : "rgba(0, 150, 150, 0.3)");
      context.fillStyle = gradient;
      context.fillRect(x + 1, y, Math.max(1, barWidth - 2), barHeight);
    });
  }, [currentTime, trackDuration, waveformData]);

  const formatTime = (seconds: number) => `${Math.floor(seconds / 60)}:${Math.floor(seconds % 60).toString().padStart(2, "0")}`;
  const handleSeek = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const audio = audioRef.current;
    if (!canvas || !audio || trackDuration <= 0) return;
    const rect = canvas.getBoundingClientRect();
    const nextTime = Math.max(0, Math.min(trackDuration, ((event.clientX - rect.left) / rect.width) * trackDuration));
    audio.currentTime = nextTime;
    setCurrentTime(nextTime);
  };
  const handleEnded = () => {
    if (repeatMode === "one" && audioRef.current) {
      audioRef.current.currentTime = 0;
      void audioRef.current.play();
      return;
    }
    const atQueueEnd = !isShuffle && queueIndex === playbackQueue.length - 1;
    if (atQueueEnd && repeatMode !== "all") { setIsPlaying(false); return; }
    changeTrack(1, true);
  };

  return <div className="w-full space-y-4 rounded-lg border border-white/10 bg-black/60 p-5 backdrop-blur-md sm:p-6">
    <div className="flex items-center justify-between gap-3"><div className="min-w-0"><h3 className="safe-wrap text-lg font-bold text-white">{activeTrack.trackTitle}</h3><p className="text-sm text-muted-foreground">{activeTrack.artistName}</p></div><span className="rounded border border-cyan-400/25 bg-cyan-400/10 px-2 py-1 text-xs text-cyan-300">{queueIndex + 1} / {playbackQueue.length}</span></div>
    <canvas ref={canvasRef} width={600} height={80} onClick={handleSeek} role="slider" aria-label="Track progress" aria-valuemin={0} aria-valuemax={trackDuration} aria-valuenow={currentTime} tabIndex={0} className="h-20 w-full cursor-pointer rounded bg-gradient-to-b from-cyan-500/10 to-transparent transition hover:from-cyan-500/20" />
    <div className="flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-1 sm:gap-2"><button aria-label="Previous track" onClick={() => changeTrack(-1)} disabled={playbackQueue.length <= 1} className="rounded p-2 text-muted-foreground transition hover:bg-white/10 hover:text-cyan-400 disabled:cursor-not-allowed disabled:opacity-35"><SkipBack className="h-5 w-5" /></button><button aria-label={isPlaying ? "Pause track" : "Play track"} onClick={togglePlay} className="rounded-full border border-cyan-400/50 bg-gradient-to-br from-cyan-500/30 to-magenta-500/30 p-3 transition-all hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-400/30">{isPlaying ? <Pause className="h-6 w-6 fill-cyan-400 text-cyan-400" /> : <Play className="h-6 w-6 fill-cyan-400 text-cyan-400" />}</button><button aria-label="Next track" onClick={() => changeTrack(1)} disabled={playbackQueue.length <= 1} className="rounded p-2 text-muted-foreground transition hover:bg-white/10 hover:text-cyan-400 disabled:cursor-not-allowed disabled:opacity-35"><SkipForward className="h-5 w-5" /></button><span className="ml-1 text-xs text-muted-foreground sm:ml-2">{formatTime(currentTime)} / {formatTime(trackDuration)}</span></div><div className="flex items-center gap-2"><button aria-label="Toggle shuffle" aria-pressed={isShuffle} onClick={() => setIsShuffle((enabled: boolean) => !enabled)} className={`rounded p-2 transition ${isShuffle ? "bg-cyan-400/15 text-cyan-300" : "text-muted-foreground hover:bg-white/10 hover:text-cyan-400"}`}><Shuffle className="h-4 w-4" /></button><button aria-label={`Repeat ${repeatMode === "off" ? "off" : repeatMode}`} aria-pressed={repeatMode !== "off"} onClick={() => setRepeatMode((mode: RepeatMode) => mode === "off" ? "all" : mode === "all" ? "one" : "off")} className={`rounded p-2 transition ${repeatMode !== "off" ? "bg-cyan-400/15 text-cyan-300" : "text-muted-foreground hover:bg-white/10 hover:text-cyan-400"}`}>{repeatMode === "one" ? <Repeat1 className="h-4 w-4" /> : <Repeat className="h-4 w-4" />}</button><Volume2 className="h-4 w-4 text-muted-foreground" /><input aria-label="Volume" type="range" min="0" max="1" step="0.1" value={volume} onChange={(event) => { const nextVolume = parseFloat(event.target.value); setVolume(nextVolume); if (audioRef.current) audioRef.current.volume = nextVolume; }} className="h-1 w-16 cursor-pointer appearance-none rounded-full bg-white/20 accent-cyan-400 sm:w-24" /><span className="hidden w-8 text-xs text-muted-foreground sm:inline">{Math.round(volume * 100)}%</span></div></div>
    <audio ref={audioRef} src={activeTrack.audioUrl} onTimeUpdate={() => { if (audioRef.current) setCurrentTime(audioRef.current.currentTime); }} onLoadedMetadata={() => { if (audioRef.current && Number.isFinite(audioRef.current.duration)) setTrackDuration(audioRef.current.duration); }} onEnded={handleEnded} />
  </div>;
}
