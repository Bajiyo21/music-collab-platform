import React, { type ReactNode } from "react";
import { Inbox } from "lucide-react";

export function ListSkeleton({ rows = 3 }: { rows?: number }) {
  return <div className="space-y-3" role="status" aria-live="polite" aria-label="Loading content">{Array.from({ length: rows }).map((_, index) => <div key={index} className="rounded-xl border border-border bg-card p-4"><div className="h-4 w-2/5 animate-pulse rounded bg-muted" /><div className="mt-3 h-3 w-full animate-pulse rounded bg-muted" /><div className="mt-2 h-3 w-3/5 animate-pulse rounded bg-muted" /></div>)}</div>;
}

export function EmptyState({ icon = <Inbox size={24} />, title, description, action }: { icon?: ReactNode; title: string; description?: string; action?: ReactNode }) {
  return <div className="rounded-xl border border-dashed border-border bg-card px-6 py-14 text-center"><div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-secondary text-primary">{icon}</div><h3 className="font-semibold">{title}</h3>{description && <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">{description}</p>}{action && <div className="mt-5">{action}</div>}</div>;
}
