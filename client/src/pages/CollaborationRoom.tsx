import { useState } from "react";
import { Music, Users, MessageSquare, Plus, X, Volume2, Trash2, Download, Send, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { toast } from "sonner";

/**
 * Collaboration Room Page
 * Multi-track project editing with layer management, commenting, chat, and export
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

interface ChatMessage {
  id: number;
  author: string;
  message: string;
  timestamp: string;
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

const MOCK_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 1,
    author: "SynthWave Master",
    message: "Great start! Love the synth lead",
    timestamp: "2:30 PM",
  },
  {
    id: 2,
    author: "Cyber Composer",
    message: "Added some drums, let me know what you think",
    timestamp: "2:45 PM",
  },
  {
    id: 3,
    author: "Digital Prophet",
    message: "Bass line is ready! Should we adjust the mix?",
    timestamp: "3:00 PM",
  },
];

export default function CollaborationRoom() {
  const [, navigate] = useLocation();
  const [project] = useState<CollaborationProject>(MOCK_PROJECT);
  const [layers, setLayers] = useState<CollaborationLayer[]>(project.layers);
  const [selectedLayer, setSelectedLayer] = useState<number | null>(layers[0]?.id || null);
  const [showComments, setShowComments] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(MOCK_CHAT_MESSAGES);
  const [chatInput, setChatInput] = useState("");
  const [showExportModal, setShowExportModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewingLayer, setPreviewingLayer] = useState<CollaborationLayer | null>(null);

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

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;

    const newMessage: ChatMessage = {
      id: chatMessages.length + 1,
      author: "You",
      message: chatInput,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setChatMessages([...chatMessages, newMessage]);
    setChatInput("");
    toast.success("Message sent!");
  };

  const handleExportTrack = (format: "mp3" | "wav" | "flac") => {
    toast.success(`Exporting as ${format.toUpperCase()}...`);
    setTimeout(() => {
      toast.success(`Downloaded: ${project.title}.${format}`);
      setShowExportModal(false);
    }, 2000);
  };

  const handlePreviewLayer = (layer: CollaborationLayer) => {
    setPreviewingLayer(layer);
    setShowPreview(true);
    toast.success(`Playing: ${layer.trackTitle}`);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 border-b border-white/10 bg-black/40 backdrop-blur-md">
        <div className="container flex items-center justify-between h-16 px-4">
          <button onClick={() => navigate("/collaborate")} className="flex items-center gap-2 hover:opacity-80 transition">
            <div className="text-2xl font-bold neon-cyan">♪</div>
            <span className="text-lg font-bold tracking-wider">TuneCollab</span>
          </button>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowChat(!showChat)}
              className="px-4 py-2 bg-cyan-400/20 border border-cyan-400/50 text-cyan-400 rounded hover:bg-cyan-400/30 transition flex items-center gap-2"
            >
              <MessageSquare size={18} />
              Chat
            </button>
            <button
              onClick={() => setShowExportModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-cyan-400 to-cyan-500 text-black font-bold rounded hover:opacity-90 transition flex items-center gap-2"
            >
              <Download size={18} />
              Export
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20 pb-12 px-4">
        <div className="container max-w-7xl mx-auto">
          {/* Project Header */}
          <div className="mb-8 p-6 border border-white/10 rounded-lg bg-white/5">
            <div className="flex items-start justify-between mb-2">
              <h1 className="text-3xl font-bold">{project.title}</h1>
              <span className="px-3 py-1 bg-cyan-400/20 border border-cyan-400/50 text-cyan-400 rounded text-sm font-semibold">
                {project.status.replace("_", " ")}
              </span>
            </div>
            <p className="text-gray-400 mb-3">{project.description}</p>
            <div className="flex gap-6 text-sm text-gray-400">
              <span>Created by {project.creatorName}</span>
              <span>{project.contributors} contributors</span>
              <span>Started {project.createdAt}</span>
            </div>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Layers Panel */}
            <div className="lg:col-span-2 space-y-6">
              {/* Layers Section */}
              <div className="border border-white/10 rounded-lg p-6 bg-white/5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Music size={20} />
                    Layers
                  </h2>
                  <button className="px-3 py-1 bg-cyan-400/20 border border-cyan-400/50 text-cyan-400 rounded hover:bg-cyan-400/30 transition flex items-center gap-1 text-sm">
                    <Plus size={16} />
                    Add Layer
                  </button>
                </div>

                <div className="space-y-2">
                  {layers.map((layer) => (
                    <div
                      key={layer.id}
                      onClick={() => setSelectedLayer(layer.id)}
                      className={`p-4 rounded border transition cursor-pointer flex items-center justify-between ${
                        selectedLayer === layer.id
                          ? "bg-cyan-400/20 border-cyan-400/50"
                          : "bg-white/5 border-white/10 hover:bg-white/10"
                      }`}
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold">{layer.trackTitle}</h3>
                        <p className="text-sm text-gray-400">{layer.artistName}</p>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePreviewLayer(layer);
                          }}
                          className="p-2 bg-cyan-400/20 border border-cyan-400/50 text-cyan-400 rounded hover:bg-cyan-400/30 transition"
                          title="Preview track"
                        >
                          <Play size={16} />
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeLayer(layer.id);
                          }}
                          className="p-2 bg-red-500/20 border border-red-500/50 text-red-400 rounded hover:bg-red-500/30 transition"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Layer Controls */}
              {selectedLayerData && (
                <div className="border border-white/10 rounded-lg p-6 bg-white/5">
                  <h3 className="text-lg font-bold mb-6">Layer Controls: {selectedLayerData.trackTitle}</h3>

                  <div className="space-y-6">
                    {/* Volume */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="flex items-center gap-2 font-semibold">
                          <Volume2 size={18} />
                          Volume
                        </label>
                        <span className="text-cyan-400">{Math.round(selectedLayerData.volume * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={selectedLayerData.volume}
                        onChange={(e) => updateLayerVolume(selectedLayerData.id, parseFloat(e.target.value))}
                        className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                      />
                    </div>

                    {/* Pan */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="font-semibold">Pan</label>
                        <span className="text-cyan-400">
                          {selectedLayerData.pan > 0 ? "R" : selectedLayerData.pan < 0 ? "L" : "C"}{" "}
                          {Math.abs(selectedLayerData.pan).toFixed(1)}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="-1"
                        max="1"
                        step="0.01"
                        value={selectedLayerData.pan}
                        onChange={(e) => updateLayerPan(selectedLayerData.id, parseFloat(e.target.value))}
                        className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-magenta-400"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              {/* Comments Panel */}
              <div className="border border-white/10 rounded-lg p-6 bg-white/5">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <MessageSquare size={20} />
                  Comments
                </h3>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  <div className="text-sm text-gray-400 p-3 bg-white/5 rounded">
                    <p className="font-semibold text-white">SynthWave Master</p>
                    <p>Great synth work!</p>
                  </div>
                  <div className="text-sm text-gray-400 p-3 bg-white/5 rounded">
                    <p className="font-semibold text-white">Cyber Composer</p>
                    <p>Drums are locked in</p>
                  </div>
                </div>
              </div>

              {/* Project Info */}
              <div className="border border-white/10 rounded-lg p-6 bg-white/5">
                <h3 className="text-lg font-bold mb-4">Project Info</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-gray-400">Duration</p>
                    <p className="font-semibold">4:00</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Layers</p>
                    <p className="font-semibold">{layers.length}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Last Modified</p>
                    <p className="font-semibold">Today at 2:30 PM</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Chat Panel */}
      {showChat && (
        <div className="fixed right-0 bottom-0 w-96 h-96 bg-background border-l border-t border-white/10 rounded-tl-lg flex flex-col z-30">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <h3 className="font-bold flex items-center gap-2">
              <MessageSquare size={18} />
              Live Chat
            </h3>
            <button onClick={() => setShowChat(false)} className="p-1 hover:bg-white/10 rounded transition">
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {chatMessages.map((msg) => (
              <div key={msg.id} className="text-sm">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-semibold text-cyan-400">{msg.author}</p>
                  <p className="text-xs text-gray-500">{msg.timestamp}</p>
                </div>
                <p className="text-gray-300">{msg.message}</p>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-white/10 flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Type a message..."
              className="flex-1 bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400/50"
            />
            <button
              onClick={handleSendMessage}
              className="p-2 bg-cyan-400/20 border border-cyan-400/50 text-cyan-400 rounded hover:bg-cyan-400/30 transition"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-background border border-white/10 rounded-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-6">
              <span className="neon-cyan">EXPORT</span>
              <span className="text-white mx-2">×</span>
              <span className="neon-magenta">MIX</span>
            </h2>

            <p className="text-gray-400 mb-6">Choose your export format:</p>

            <div className="space-y-3 mb-6">
              <button
                onClick={() => handleExportTrack("mp3")}
                className="w-full px-4 py-3 bg-cyan-400/20 border border-cyan-400/50 text-cyan-400 rounded hover:bg-cyan-400/30 transition font-semibold"
              >
                Export as MP3 (Compressed)
              </button>
              <button
                onClick={() => handleExportTrack("wav")}
                className="w-full px-4 py-3 bg-cyan-400/20 border border-cyan-400/50 text-cyan-400 rounded hover:bg-cyan-400/30 transition font-semibold"
              >
                Export as WAV (Lossless)
              </button>
              <button
                onClick={() => handleExportTrack("flac")}
                className="w-full px-4 py-3 bg-cyan-400/20 border border-cyan-400/50 text-cyan-400 rounded hover:bg-cyan-400/30 transition font-semibold"
              >
                Export as FLAC (High Quality)
              </button>
            </div>

            <button
              onClick={() => setShowExportModal(false)}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded hover:bg-white/10 transition font-semibold"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && previewingLayer && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-background border border-white/10 rounded-lg p-8 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Now Playing</h2>
              <button onClick={() => setShowPreview(false)} className="p-1 hover:bg-white/10 rounded transition">
                <X size={20} />
              </button>
            </div>

            <div className="text-center mb-6">
              <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-cyan-400/20 to-magenta-400/20 rounded-lg flex items-center justify-center">
                <Music size={48} className="text-cyan-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">{previewingLayer.trackTitle}</h3>
              <p className="text-gray-400">{previewingLayer.artistName}</p>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Duration</span>
                <span className="font-semibold">{Math.floor(previewingLayer.duration / 60)}:00</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Volume</span>
                <span className="font-semibold">{Math.round(previewingLayer.volume * 100)}%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Pan</span>
                <span className="font-semibold">
                  {previewingLayer.pan > 0 ? "Right" : previewingLayer.pan < 0 ? "Left" : "Center"}
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowPreview(false)}
              className="w-full px-4 py-2 bg-gradient-to-r from-cyan-400 to-cyan-500 text-black font-bold rounded hover:opacity-90 transition flex items-center justify-center gap-2"
            >
              <Play size={18} />
              Play Full Preview
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
