import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { lazy, Suspense, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ThemeToggle } from "./components/ThemeToggle";
const Home = lazy(() => import("./pages/Home"));
const Explore = lazy(() => import("./pages/Explore"));
const Profile = lazy(() => import("./pages/Profile"));
const CollaborationRoom = lazy(() => import("./pages/CollaborationRoom"));
const CollaborationHub = lazy(() => import("./pages/CollaborationHub"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Upload = lazy(() => import("./pages/Upload"));
const Playlists = lazy(() => import("./pages/Playlists"));
const PlaylistDetail = lazy(() => import("./pages/PlaylistDetail"));
const TrackDetail = lazy(() => import("./pages/TrackDetail"));
const Notifications = lazy(() => import("./pages/Notifications"));
const AiStudio = lazy(() => import("./pages/AiStudio"));
const NotFound = lazy(() => import("./pages/NotFound"));

function OnboardingRedirect() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();
  const profileQuery = trpc.users.myProfile.useQuery(undefined, { enabled: Boolean(user), retry: false });

  useEffect(() => {
    const profile = profileQuery.data?.profile;
    if (loading || !user || profileQuery.isLoading || !profile) return;
    const needsOnboarding = !profile.avatar && !profile.bio && !profile.website && !profile.twitter && !profile.instagram && !profile.soundcloud && !profile.location;
    const destination = `/profile/${user.id}`;
    if (needsOnboarding && window.location.pathname !== destination) navigate(destination);
  }, [loading, navigate, profileQuery.data?.profile, profileQuery.isLoading, user]);

  return null;
}

function Router() {
  return <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground" role="status" aria-live="polite">Loading TuneCollab…</div>}>
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/explore" component={Explore} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/upload" component={Upload} />
      <Route path="/collaborate" component={CollaborationHub} />
      <Route path="/profile/:userId" component={Profile} />
      <Route path="/collaboration/:collabId" component={CollaborationRoom} />
      <Route path="/playlists" component={Playlists} />
      <Route path="/playlist/:playlistId" component={PlaylistDetail} />
      <Route path="/track/:trackId" component={TrackDetail} />
      <Route path="/notifications" component={Notifications} />
      <Route path="/ai-studio" component={AiStudio} />
      <Route path="/404" component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  </Suspense>;
}

function CollaborationThemeControl() {
  const [location] = useLocation();
  if (!location.startsWith("/collaboration/")) return null;

  return (
    <div className="fixed right-4 top-20 z-[60]">
      <ThemeToggle />
    </div>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
        <ThemeProvider
          defaultTheme="light"
          switchable
        >
        <TooltipProvider>
          <Toaster />
          <OnboardingRedirect />
          <CollaborationThemeControl />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
