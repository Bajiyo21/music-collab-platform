import { AlertTriangle, RotateCcw } from "lucide-react";
import { Component, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return <div className="flex min-h-screen items-center justify-center bg-background p-8 text-foreground">
        <div className="flex w-full max-w-2xl flex-col items-center rounded-xl border border-border bg-card p-8 text-center shadow-lg">
          <AlertTriangle size={48} className="mb-6 shrink-0 text-destructive" />
          <h2 className="text-xl font-semibold">An unexpected error occurred.</h2>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">TuneCollab could not render this screen. Reload to restore your session and return to your music.</p>
          {import.meta.env.DEV && <div className="mt-6 w-full overflow-auto rounded bg-muted p-4 text-left"><pre className="whitespace-break-spaces text-sm text-muted-foreground">{this.state.error?.stack}</pre></div>}
          <button onClick={() => window.location.reload()} className={cn("mt-6 flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-primary-foreground", "cursor-pointer transition hover:opacity-90")}>
            <RotateCcw size={16} /> Reload page
          </button>
        </div>
      </div>;
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
