import { useState } from "react";
import { Music, Users, MessageSquare, Plus, X, Volume2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

/**
 * Collaboration Room Page
 * Multi-track project editing with layer management and commenting
 */

interface CollaborationLayer {
  id: number;
  trackId: number;
  trackTitle: string;
  artistName: string;
  volume: number;
  pan: number;
  order: number;
  duration: number;
}

interface CollaborationProject {
  id: number;
  title: string;
  description: string;
  creatorName: string;
  contributors: number;
  status: "draft" | "in_progress" | "completed";
  createdAt: string;
  layers: CollaborationLayer[];
}

const MOCK_PROJECT: CollaborationProject = {
  id: 1,
  title: "Neon Dreams - Remix Collab",
  description: "Community remix of Neon Dreams with multiple artists contributing layers",
  creatorName: "SynthWave Master",
  contributors: 5,
  status: "in_progress",
  createdAt: "2026-07-15",
  layers: [
    {
      id: 1,
      trackId: 101,
      trackTitle: "Synth Lead",
      artistName: "SynthWave Master",
      volume: 1.0,
      pan: 0,
      order: 1,
      duration: 240,
    },
    {
      id: 2,
      trackId: 102,
      trackTitle: "Drum Beat",
      artistName: "Cyber Composer",
      volume: 0.8,
      pan: -0.3,
      order: 2,
      duration: 240,
    },
    {
      id: 3,
      trackId: 103,
      trackTitle: "Bass Line",
      artistName: "Digital Prophet",
      volume: 0.9,
      pan: 0.2,
      order: 3,
      duration: 240,
    },
  ],
};

export default function CollaborationRoom() {
  const [, navigate] = useLocation();
  const [project] = useState<CollaborationProject>(MOCK_PROJECT);
  const [layers, setLayers] = useState<CollaborationLayer[]>(project.layers);
  const [selectedLayer, setSelectedLayer] = useState<number | null>(layers[0]?.id || null);
  const [showComments, setShowComments] = useState(false);

  const selectedLayerData = layers.find((l) => l.id === selectedLayer);

  const updateLayerVolume = (layerId: number, volume: number) => {
    setLayers(layers.map((l) => (l.id === layerId ? { ...l, volume } : l)));
  };

  const updateLayerPan = (layerId: number, pan: number) => {
    setLayers(layers.map((l) => (l.id === layerId ? { ...l, pan } : l)));
  };

  const removeLayer = (layerId: number) => {
    setLayers(layers.filter((l) => l.id !== layerId));
    if (selectedLayer === layerId) {
      setSelectedLayer(layers[0]?.id || null);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/40 backdrop-blur-md">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/dashboard")} className="text-muted-foreground hover:text-white">
              ← Back
            </button>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold neon-cyan">♪</div>
              <span className="text-xl font-bold tracking-wider">TuneCollab</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm px-3 py-1 bg-cyan-400/20 border border-cyan-400/50 rounded text-cyan-400">
              {project.status.toUpperCase()}
            </span>
            <Button className="bg-black/40 backdrop-blur-md border border-white/10 px-6 py-2 font-semibold transition-all duration-200 hover:bg-black/60 hover:border-white/20 text-xs">
              Save Project
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 pb-12">
        <div className="container">
          {/* Project Header */}
          <div className="mb-8 bg-black/40 backdrop-blur-md border border-white/10 rounded p-6">
            <h1 className="text-4xl font-bold mb-2">{project.title}</h1>
            <p className="text-muted-foreground mb-4">{project.description}</p>
            <div className="flex gap-6 text-sm">
              <span className="text-muted-foreground">
                Created by <span className="text-white font-semibold">{project.creatorName}</span>
              </span>
              <span className="flex items-center gap-2 text-muted-foreground">
                <Users className="w-4 h-4" />
                {project.contributors} contributors
              </span>
              <span className="text-muted-foreground">Started {project.createdAt}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Layers Panel */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">Layers</h2>
                  <Button className="flex items-center gap-2 px-4 py-2 bg-cyan-400/20 border border-cyan-400/50 text-cyan-400 hover:bg-cyan-400/30 rounded transition-all">
                    <Plus className="w-4 h-4" />
                    Add Layer
                  </Button>
                </div>

                {/* Layers List */}
                <div className="space-y-3">
                  {layers.map((layer, index) => (
                    <div
                      key={layer.id}
                      onClick={() => setSelectedLayer(layer.id)}
                      className={`p-4 rounded cursor-pointer transition-all border ${
                        selectedLayer === layer.id
                          ? "bg-cyan-400/20 border-cyan-400/50"
                          : "bg-black/20 border-white/10 hover:border-white/20"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="font-bold">{layer.trackTitle}</div>
                          <div className="text-xs text-muted-foreground">{layer.artistName}</div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeLayer(layer.id);
                          }}
                          className="text-muted-foreground hover:text-red-400 transition"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="text-xs text-muted-foreground">Layer {index + 1}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Layer Controls */}
              {selectedLayerData && (
                <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded p-6 space-y-6">
                  <h3 className="text-lg font-bold">Layer Controls: {selectedLayerData.trackTitle}</h3>

                  {/* Volume Control */}
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-sm font-semibold">
                      <Volume2 className="w-4 h-4 text-cyan-400" />
                      Volume
                    </label>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={selectedLayerData.volume}
                        onChange={(e) => updateLayerVolume(selectedLayer!, parseFloat(e.target.value))}
                        className="flex-1 h-2 bg-white/20 rounded-full appearance-none cursor-pointer accent-cyan-400"
                      />
                      <span className="text-sm text-muted-foreground w-12">{Math.round(selectedLayerData.volume * 100)}%</span>
                    </div>
                  </div>

                  {/* Pan Control */}
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-sm font-semibold">
                      <span>🔊</span>
                      Pan
                    </label>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-muted-foreground">L</span>
                      <input
                        type="range"
                        min="-1"
                        max="1"
                        step="0.1"
                        value={selectedLayerData.pan}
                        onChange={(e) => updateLayerPan(selectedLayer!, parseFloat(e.target.value))}
                        className="flex-1 h-2 bg-white/20 rounded-full appearance-none cursor-pointer accent-magenta-400"
                      />
                      <span className="text-xs text-muted-foreground">R</span>
                      <span className="text-sm text-muted-foreground w-12">{selectedLayerData.pan.toFixed(1)}</span>
                    </div>
                  </div>

                  {/* Waveform Placeholder */}
                  <div className="bg-gradient-to-b from-cyan-500/10 to-transparent rounded p-4 h-24 flex items-center justify-center">
                    <span className="text-muted-foreground text-sm">Waveform Visualizer</span>
                  </div>
                </div>
              )}
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              {/* Comments Panel */}
              <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded p-6">
                <button
                  onClick={() => setShowComments(!showComments)}
                  className="w-full flex items-center justify-between font-bold mb-4 hover:text-cyan-400 transition"
                >
                  <span className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Comments
                  </span>
                  <span className="text-sm text-muted-foreground">12</span>
                </button>

                {showComments && (
                  <div className="space-y-4">
                    {/* Comment */}
                    <div className="border-t border-white/10 pt-4">
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-cyan-400/20 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs">👤</span>
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-sm">Cyber Composer</div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Love the drum pattern! Can we add some reverb?
                          </p>
                          <span className="text-xs text-muted-foreground mt-2 block">2 hours ago</span>
                        </div>
                      </div>
                    </div>

                    {/* Add Comment */}
                    <div className="border-t border-white/10 pt-4">
                      <input
                        type="text"
                        placeholder="Add a comment..."
                        className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-sm placeholder-muted-foreground focus:border-cyan-400 focus:outline-none transition"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Project Info */}
              <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded p-6">
                <h3 className="font-bold mb-4">Project Info</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <div className="text-muted-foreground">Duration</div>
                    <div className="font-semibold">4:00</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Layers</div>
                    <div className="font-semibold">{layers.length}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Last Modified</div>
                    <div className="font-semibold">Today at 2:30 PM</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
