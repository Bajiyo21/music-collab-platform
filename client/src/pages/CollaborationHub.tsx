import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { Users, Plus, ArrowLeft, Search, Music, Clock, User } from "lucide-react";
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
}

const INITIAL_PROJECTS: CollaborationProject[] = [
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
  const [projects, setProjects] = useState<CollaborationProject[]>(INITIAL_PROJECTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    genre: "Electronic",
  });

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.creatorName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = !statusFilter || project.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted with data:", formData);

    if (!formData.title.trim()) {
      toast.error("Please enter a project title");
      return;
    }

    if (!isAuthenticated) {
      toast.error("Please sign in to create a collaboration");
      return;
    }

    const newProject: CollaborationProject = {
      id: Math.max(...projects.map((p) => p.id), 0) + 1,
      title: formData.title.trim(),
      description: formData.description.trim(),
      creatorName: user?.name || "Anonymous",
      creatorId: user?.id || 0,
      contributors: 1,
      status: "draft",
      createdAt: new Date().toISOString().split("T")[0],
      genre: formData.genre,
    };

    console.log("Creating new project:", newProject);
    setProjects([newProject, ...projects]);
    toast.success(`Project "${formData.title}" created successfully!`);
    
    // Reset form
    setFormData({ title: "", description: "", genre: "Electronic" });
    setShowCreateModal(false);

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
        <div className="container flex min-h-16 flex-wrap items-center justify-between gap-2 px-4 py-3 sm:h-16 sm:flex-nowrap sm:py-0">
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold neon-cyan">♪</div>
            <span className="text-xl font-bold tracking-wider">TuneCollab</span>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <button onClick={() => navigate("/")} className="text-sm hover:text-cyan-400 transition cursor-pointer">
              Home
            </button>
            <button onClick={() => navigate("/explore")} className="text-sm hover:text-cyan-400 transition cursor-pointer">
              Explore
            </button>
            <button className="text-sm text-cyan-400 font-semibold">Collaborate</button>
          </nav>

          <div className="flex items-center gap-1 sm:gap-4">
            <button
              onClick={() => navigate("/")}
              className="px-3 py-2 text-gray-400 hover:text-cyan-400 transition flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft size={18} />
              <span className="hidden sm:inline text-sm">Back</span>
            </button>
            {isAuthenticated && (
              <button
                onClick={() => navigate("/dashboard")}
                className="rounded border border-white/10 bg-black/40 px-3 py-2 text-xs transition hover:bg-black/60 cursor-pointer sm:px-4 sm:text-sm"
              >
                Dashboard
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 pb-12 pt-24 sm:px-6">
        <div className="container max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="mb-8 sm:mb-12">
            <h1 className="mobile-page-title flex flex-col items-start gap-0 text-2xl font-bold leading-tight sm:flex-row sm:items-baseline sm:gap-x-2 sm:gap-y-1 sm:text-5xl">
              <span className="neon-cyan break-words sm:whitespace-nowrap">COLLABORATE</span>
              <span className="text-white sm:mx-2">×</span>
              <span className="neon-magenta break-words sm:whitespace-nowrap">CREATE</span>
            </h1>
            <p className="max-w-2xl text-base leading-relaxed text-gray-400 sm:text-lg">
              Join forces with other musicians. Create, remix, and produce together in real-time.
            </p>
          </div>

          {/* Controls */}
          <div className="mb-8 flex flex-col items-stretch gap-3 sm:gap-4 md:flex-row md:items-center md:justify-between">
            {/* Search & Filter */}
            <div className="flex w-full min-w-0 flex-1 gap-3 md:w-auto">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                <Input
                  type="text"
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder-gray-500"
                />
              </div>
            </div>

            {/* Create Button */}
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex w-full items-center justify-center gap-2 rounded bg-gradient-to-r from-cyan-400 to-cyan-500 px-5 py-3 text-center font-bold text-black transition hover:opacity-90 cursor-pointer sm:w-auto sm:whitespace-nowrap sm:px-6"
            >
              <Plus size={20} />
              New Collaboration
            </button>
          </div>

          {/* Status Filter */}
          <div className="mb-8 flex flex-wrap gap-2">
            {["draft", "in_progress", "completed"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(statusFilter === status ? null : status)}
                className={`rounded border px-3 py-2 text-sm capitalize transition cursor-pointer sm:px-4 ${
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
                  className="group min-w-0 rounded-lg border border-white/10 bg-white/5 p-4 transition hover:border-cyan-400/30 hover:bg-white/10 sm:p-6"
                >
                  {/* Project Header */}
                  <div className="mb-4">
                    <div className="flex min-w-0 flex-col items-start gap-2 mb-2 sm:flex-row sm:items-start sm:justify-between">
                      <h3 className="safe-wrap text-lg font-bold text-white transition group-hover:text-cyan-400">
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

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2 border-t border-white/10 pt-4 sm:flex-row">
                    <button
                      onClick={() => handleJoinProject(project.id, project.title)}
                      className="w-full rounded border border-cyan-400/50 bg-cyan-400/20 px-4 py-2 font-semibold text-cyan-400 transition hover:bg-cyan-400/30 cursor-pointer sm:flex-1"
                    >
                      Join
                    </button>
                    <button
                      onClick={() => navigate(`/collaboration/${project.id}`)}
                      className="w-full rounded border border-magenta-400/50 bg-magenta-400/20 px-4 py-2 font-semibold text-magenta-400 transition hover:bg-magenta-400/30 cursor-pointer sm:flex-1"
                    >
                      Preview
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="max-w-2xl text-base leading-relaxed text-gray-400 sm:text-lg">No projects found. Create one to get started!</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg border border-white/10 bg-background p-4 sm:p-8">
            <h2 className="mb-6 flex flex-wrap gap-x-2 gap-y-1 text-xl font-bold sm:text-2xl">
              <span className="neon-cyan">CREATE</span>
              <span className="text-white mx-2">NEW</span>
              <span className="neon-magenta">PROJECT</span>
            </h2>

            <form onSubmit={handleCreateProject} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-semibold mb-2">Project Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., My Awesome Collab"
                  className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400/50 transition"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your collaboration project..."
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400/50 transition resize-none"
                />
              </div>

              {/* Genre */}
              <div>
                <label className="block text-sm font-semibold mb-2">Genre</label>
                <select
                  value={formData.genre}
                  onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
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
              <div className="flex flex-col-reverse gap-3 pt-4 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="w-full rounded border border-white/10 bg-white/5 px-4 py-2 font-semibold transition hover:bg-white/10 cursor-pointer sm:flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full rounded bg-gradient-to-r from-cyan-400 to-cyan-500 px-4 py-2 font-bold text-black transition hover:opacity-90 cursor-pointer sm:flex-1"
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
