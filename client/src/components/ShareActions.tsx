import { Copy, Mail, MessageCircle, Share2, Twitter } from "lucide-react";
import { toast } from "sonner";

type ShareActionsProps = {
  url?: string;
  title: string;
  compact?: boolean;
};

export function ShareActions({ url = window.location.href, title, compact = false }: ShareActionsProps) {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied");
    } catch {
      toast.info(url);
    }
  }

  function openShare(target: string) {
    window.open(target, "_blank", "noopener,noreferrer");
  }

  const buttonClass = compact ? "rounded border border-white/10 p-2 text-gray-400 hover:border-cyan-400/40 hover:text-cyan-300" : "flex items-center gap-2 rounded border border-white/10 px-3 py-2 text-sm text-gray-400 hover:border-cyan-400/40 hover:text-cyan-300";

  return (
    <div className="flex flex-wrap items-center gap-2" aria-label="Share actions">
      <button onClick={copyLink} className={buttonClass} aria-label="Copy share link" title="Copy link"><Copy size={compact ? 16 : 15} />{!compact && "Copy link"}</button>
      <button onClick={() => openShare(`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`)} className={buttonClass} aria-label="Share on X" title="Share on X"><Twitter size={compact ? 16 : 15} />{!compact && "X"}</button>
      <button onClick={() => openShare(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`)} className={buttonClass} aria-label="Share on Facebook" title="Share on Facebook"><span className="text-sm font-bold">f</span>{!compact && "Facebook"}</button>
      <button onClick={() => openShare(`https://wa.me/?text=${encodedTitle}%20${encodedUrl}`)} className={buttonClass} aria-label="Share on WhatsApp" title="Share on WhatsApp"><MessageCircle size={compact ? 16 : 15} />{!compact && "WhatsApp"}</button>
      <a href={`mailto:?subject=${encodedTitle}&body=${encodedUrl}`} className={buttonClass} aria-label="Share by email" title="Share by email"><Mail size={compact ? 16 : 15} />{!compact && "Email"}</a>
      {!compact && <span className="ml-1 text-xs text-gray-600"><Share2 size={13} className="mr-1 inline" />Share signal</span>}
    </div>
  );
}
