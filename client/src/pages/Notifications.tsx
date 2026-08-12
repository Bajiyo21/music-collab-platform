import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Bell, Check, CheckCheck, Loader2, X } from "lucide-react";
import { toast } from "sonner";

export default function Notifications() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();
  const notificationsQuery = trpc.notifications.list.useQuery({ limit: 50 }, { enabled: isAuthenticated });
  const invitationsQuery = trpc.collaborations.invitations.useQuery(undefined, { enabled: isAuthenticated });
  const markReadMutation = trpc.notifications.markAsRead.useMutation({
    onSuccess: () => {
      utils.notifications.list.invalidate();
      utils.notifications.unreadCount.invalidate();
    },
    onError: (error) => toast.error(error.message),
  });
  const markAllMutation = trpc.notifications.markAllAsRead.useMutation({
    onSuccess: () => {
      utils.notifications.list.invalidate();
      utils.notifications.unreadCount.invalidate();
    },
    onError: (error) => toast.error(error.message),
  });
  const respondInviteMutation = trpc.collaborations.respondToInvite.useMutation({
    onSuccess: (_result, variables) => {
      utils.collaborations.invitations.invalidate();
      utils.notifications.list.invalidate();
      utils.notifications.unreadCount.invalidate();
      toast.success(variables.response === "accepted" ? "Invitation accepted" : "Invitation declined");
    },
    onError: (error) => toast.error(error.message),
  });

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6 text-center">
        <div>
          <p className="mb-5 text-gray-400">Sign in to view notifications.</p>
          <button onClick={() => navigate("/")} className="rounded bg-cyan-400 px-4 py-2 font-bold text-black">Go home</button>
        </div>
      </div>
    );
  }

  const notifications = notificationsQuery.data ?? [];
  const invitations = invitationsQuery.data ?? [];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-white/10 bg-black/70 backdrop-blur-md">
        <div className="container flex min-h-16 items-center justify-between gap-3 px-4">
          <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2 text-gray-400 hover:text-cyan-300">
            <ArrowLeft size={18} /> <span className="hidden sm:inline">Dashboard</span>
          </button>
          <h1 className="flex min-w-0 items-center gap-2 text-right !text-base font-bold leading-tight sm:!text-lg">
            <Bell size={18} className="shrink-0 text-cyan-300" /> <span className="whitespace-nowrap">Notifications</span>
          </h1>
          <button onClick={() => markAllMutation.mutate()} disabled={markAllMutation.isPending || notifications.length === 0} className="flex items-center gap-2 rounded border border-white/10 px-3 py-2 text-sm text-gray-400 hover:text-cyan-300 disabled:opacity-40">
            <CheckCheck size={16} /> <span className="hidden sm:inline">Mark all read</span>
          </button>
        </div>
      </header>

      <main className="container max-w-3xl space-y-8 px-4 py-8 sm:py-12">
        {invitations.length > 0 && (
          <section>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-fuchsia-300">Action required</p>
                <h2 className="mt-1 text-xl font-bold">Collaboration invitations</h2>
              </div>
              <span className="rounded-full border border-fuchsia-400/30 px-2 py-1 text-xs text-fuchsia-300">{invitations.length}</span>
            </div>
            <div className="space-y-3">
              {invitations.map(({ invitation, collaboration }) => (
                <article key={invitation.id} className="rounded-lg border border-fuchsia-400/30 bg-fuchsia-400/5 p-4">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <h3 className="font-semibold">{collaboration.title}</h3>
                      <p className="mt-1 text-sm text-gray-400">{invitation.message ?? "You have been invited to contribute to this collaboration."}</p>
                      <p className="mt-2 text-[11px] text-gray-600">{invitation.expiresAt ? `Expires ${new Date(invitation.expiresAt).toLocaleDateString()}` : "No expiry set"}</p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <button
                        onClick={() => respondInviteMutation.mutate({ invitationId: invitation.id, response: "accepted" })}
                        disabled={respondInviteMutation.isPending}
                        className="flex items-center gap-1 rounded bg-cyan-400 px-3 py-2 text-xs font-bold text-black hover:bg-cyan-300 disabled:opacity-50"
                      >
                        <Check size={14} /> Accept
                      </button>
                      <button
                        onClick={() => respondInviteMutation.mutate({ invitationId: invitation.id, response: "declined" })}
                        disabled={respondInviteMutation.isPending}
                        className="flex items-center gap-1 rounded border border-white/10 px-3 py-2 text-xs text-gray-400 hover:border-red-400/40 hover:text-red-300 disabled:opacity-50"
                      >
                        <X size={14} /> Decline
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        <section>
          <div className="mb-4">
            <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">Activity feed</p>
            <h2 className="mt-1 text-xl font-bold">Recent notifications</h2>
          </div>
          {notificationsQuery.isLoading ? (
            <div className="py-20 text-center text-cyan-300"><Loader2 className="mx-auto animate-spin" /></div>
          ) : notifications.length === 0 ? (
            <div className="rounded border border-dashed border-white/15 px-6 py-16 text-center text-gray-500"><Bell className="mx-auto mb-4 opacity-40" /><p>No notifications yet.</p></div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <article key={notification.id} className={`rounded-lg border p-4 ${notification.isRead ? "border-white/10 bg-black/20" : "border-cyan-400/30 bg-cyan-400/5"}`}>
                  <div className="flex items-start gap-3">
                    <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${notification.isRead ? "bg-gray-700" : "bg-cyan-300"}`} />
                    <div className="min-w-0 flex-1">
                      <h2 className="font-semibold">{notification.title}</h2>
                      <p className="mt-1 text-sm text-gray-400">{notification.message}</p>
                      <p className="mt-2 text-[11px] text-gray-600">{new Date(notification.createdAt).toLocaleString()}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {notification.actionUrl && <button onClick={() => { if (!notification.isRead) markReadMutation.mutate({ notificationId: notification.id }); navigate(notification.actionUrl as string); }} className="rounded border border-cyan-400/30 px-3 py-2 text-xs text-cyan-300">Open</button>}
                        {!notification.isRead && <button onClick={() => markReadMutation.mutate({ notificationId: notification.id })} className="rounded border border-white/10 px-3 py-2 text-xs text-gray-400">Mark read</button>}
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
