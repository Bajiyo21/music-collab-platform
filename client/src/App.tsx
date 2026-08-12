import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Explore from "./pages/Explore";
import Profile from "./pages/Profile";
import CollaborationRoom from "./pages/CollaborationRoom";
import CollaborationHub from "./pages/CollaborationHub";
import Dashboard from "./pages/Dashboard";
import Upload from "./pages/Upload";
import Playlists from "./pages/Playlists";
import PlaylistDetail from "./pages/PlaylistDetail";
import TrackDetail from "./pages/TrackDetail";
import Notifications from "./pages/Notifications";
import AiStudio from "./pages/AiStudio";

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
  // make sure to consider if you need authentication for certain routes
  return (
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
          // switchable
        >
        <TooltipProvider>
          <Toaster />
          <OnboardingRedirect />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
