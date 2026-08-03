import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { Users, Plus, ArrowLeft, Search, Filter, Music, Clock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface CollaborationProject {
  id: number;
  title: string;
  description: string;
  creatorName: string;
  creatorId: number;
  contributors: number;
  status: "draft" | "in_progress" | "completed";
  createdAt: string;
  genre: string;
  image?: string;
}

const MOCK_PROJECTS: CollaborationProject[] = [
  {
    id: 1,
    title: "Neon Dreams - Remix Collab",
    description: "Community remix of Neon Dreams with multiple artists contributing layers",
    creatorName: "SynthWave Master",
    creatorId: 1,
    contributors: 5,
    status: "in_progress",
    createdAt: "2026-07-15",
    genre: "Synthwave",
  },
  {
    id: 2,
    title: "Digital Horizons - Extended Mix",
    description: "Collaborative extended mix with electronic elements and ambient layers",
    creatorName: "Cyber Composer",
    creatorId: 2,
    contributors: 3,
    status: "in_progress",
    createdAt: "2026-07-10",
    genre: "Electronic",
  },
  {
    id: 3,
    title: "Cyber Nexus - Live Session",
    description: "Live collaborative jam session with real-time multi-track recording",
    creatorName: "Glitch Artist",
    creatorId: 3,
    contributors: 8,
    status: "completed",
    createdAt: "2026-07-01",
    genre: "Glitch Hop",
  },
];

export default function CollaborationHub() {
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState("");
  const [newProjectDesc, setNewProjectDesc] = useState("");
  const [newProjectGenre, setNewProjectGenre] = useState("Electronic");

  const filteredProjects = MOCK_PROJECTS.filter((project) => {
    const matchesSearch =
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.creatorName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = !statusFilter || project.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newProjectTitle.trim()) {
      toast.error("Please enter a project title");
      return;
    }

    if (!isAuthenticated) {
      toast.error("Please sign in to create a collaboration");
      return;
    }

    // Create new project (mock)
    const newProject: CollaborationProject = {
      id: MOCK_PROJECTS.length + 1,
      title: newProjectTitle,
      description: newProjectDesc,
      creatorName: user?.name || "Unknown",
      creatorId: user?.id || 0,
      contributors: 1,
      status: "draft",
      createdAt: new Date().toISOString().split("T")[0],
      genre: newProjectGenre,
    };

    toast.success(`Project "${newProjectTitle}" created successfully!`);
    setNewProjectTitle("");
    setNewProjectDesc("");
    setNewProjectGenre("Electronic");
    setShowCreateModal(false);

    // Navigate to the new project
    setTimeout(() => navigate(`/collaboration/${newProject.id}`), 1000);
  };

  const handleJoinProject = (projectId: number, projectTitle: string) => {
    if (!isAuthenticated) {
      toast.error("Please sign in to join a collaboration");
      return;
    }

    toast.success(`Joined "${projectTitle}"!`);
    setTimeout(() => navigate(`/collaboration/${projectId}`), 1000);
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
      case "in_progress":
        return "bg-cyan-400/20 text-cyan-400 border-cyan-400/30";
      case "completed":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      default:
        return "bg-white/10 text-white border-white/20";
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/40 backdrop-blur-md">
        <div className="container flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold neon-cyan">♪</div>
            <span className="text-xl font-bold tracking-wider">TuneCollab</span>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <button onClick={() => navigate("/")} className="text-sm hover:text-cyan-400 transition">
              Home
            </button>
            <button onClick={() => navigate("/explore")} className="text-sm hover:text-cyan-400 transition">
              Explore
            </button>
            <button className="text-sm text-cyan-400 font-semibold">Collaborate</button>
          </nav>

          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/")}
              className="px-3 py-2 text-gray-400 hover:text-cyan-400 transition flex items-center gap-1"
            >
              <ArrowLeft size={18} />
              <span className="hidden sm:inline text-sm">Back</span>
            </button>
            {isAuthenticated && (
              <button
                onClick={() => navigate("/dashboard")}
                className="px-4 py-2 text-sm bg-black/40 border border-white/10 rounded hover:bg-black/60 transition"
              >
                Dashboard
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 pb-12 px-4">
        <div className="container max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="mb-12">
            <h1 className="text-5xl font-bold mb-4">
              <span className="neon-cyan">COLLABORATE</span>
              <span className="text-white mx-2">×</span>
              <span className="neon-magenta">CREATE</span>
            </h1>
            <p className="text-gray-400 text-lg">
              Join forces with other musicians. Create, remix, and produce together in real-time.
            </p>
          </div>

          {/* Controls */}
          <div className="mb-8 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            {/* Search & Filter */}
            <div className="flex-1 flex gap-3 w-full md:w-auto">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                <Input
                  type="text"
                  placeholder="Search collaborations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder-gray-500"
                />
              </div>
              <button className="px-4 py-2 bg-white/5 border border-white/10 rounded hover:bg-white/10 transition flex items-center gap-2">
                <Filter size={18} />
                <span className="hidden sm:inline">Filter</span>
              </button>
            </div>

            {/* Create Button */}
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-2 bg-gradient-to-r from-cyan-400 to-cyan-500 text-black font-bold rounded hover:opacity-90 transition flex items-center gap-2 w-full md:w-auto justify-center"
            >
              <Plus size={20} />
              New Collaboration
            </button>
          </div>

          {/* Status Filter */}
          <div className="mb-8 flex gap-2 flex-wrap">
            {["draft", "in_progress", "completed"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(statusFilter === status ? null : status)}
                className={`px-4 py-2 rounded border transition capitalize ${
                  statusFilter === status
                    ? "bg-cyan-400/20 border-cyan-400/50 text-cyan-400"
                    : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
                }`}
              >
                {status.replace("_", " ")}
              </button>
            ))}
          </div>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.length > 0 ? (
              filteredProjects.map((project) => (
                <div
                  key={project.id}
                  className="border border-white/10 rounded-lg p-6 bg-white/5 hover:bg-white/10 hover:border-cyan-400/30 transition group cursor-pointer"
                  onClick={() => navigate(`/collaboration/${project.id}`)}
                >
                  {/* Project Header */}
                  <div className="mb-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition">
                        {project.title}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded text-xs font-semibold border ${getStatusBadgeColor(
                          project.status
                        )}`}
                      >
                        {project.status.replace("_", " ")}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 line-clamp-2">{project.description}</p>
                  </div>

                  {/* Project Info */}
                  <div className="space-y-2 mb-4 text-sm text-gray-400">
                    <div className="flex items-center gap-2">
                      <User size={16} />
                      <span>{project.creatorName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users size={16} />
                      <span>{project.contributors} contributors</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Music size={16} />
                      <span>{project.genre}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={16} />
                      <span>{project.createdAt}</span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleJoinProject(project.id, project.title);
                    }}
                    className="w-full px-4 py-2 bg-cyan-400/20 border border-cyan-400/50 text-cyan-400 rounded hover:bg-cyan-400/30 transition font-semibold text-sm"
                  >
                    Join Project
                  </button>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <Users className="mx-auto mb-4 text-gray-500" size={48} />
                <p className="text-gray-400 text-lg">No collaborations found</p>
                <p className="text-gray-500 text-sm mt-2">Try adjusting your search or create a new project</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-background border border-white/10 rounded-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-6">
              <span className="neon-cyan">CREATE</span>
              <span className="text-white mx-2">NEW</span>
              <span className="neon-magenta">PROJECT</span>
            </h2>

            <form onSubmit={handleCreateProject} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-semibold mb-2">Project Title *</label>
                <Input
                  type="text"
                  value={newProjectTitle}
                  onChange={(e) => setNewProjectTitle(e.target.value)}
                  placeholder="e.g., Neon Dreams Remix"
                  className="bg-white/5 border-white/10 text-white placeholder-gray-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold mb-2">Description</label>
                <textarea
                  value={newProjectDesc}
                  onChange={(e) => setNewProjectDesc(e.target.value)}
                  placeholder="Describe your collaboration project..."
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400/50 transition resize-none"
                />
              </div>

              {/* Genre */}
              <div>
                <label className="block text-sm font-semibold mb-2">Genre</label>
                <select
                  value={newProjectGenre}
                  onChange={(e) => setNewProjectGenre(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-cyan-400/50 transition"
                >
                  <option value="Electronic">Electronic</option>
                  <option value="Synthwave">Synthwave</option>
                  <option value="Glitch Hop">Glitch Hop</option>
                  <option value="Cyberpunk">Cyberpunk</option>
                  <option value="Ambient">Ambient</option>
                  <option value="Experimental">Experimental</option>
                </select>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded hover:bg-white/10 transition font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-400 to-cyan-500 text-black rounded hover:opacity-90 transition font-bold"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
