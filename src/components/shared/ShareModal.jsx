import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Copy, Check, Share2, QrCode } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { getCandidateShareUrl } from '@/lib/candidateShareUrl';

export function ShareModal({ candidate, isOpen, onClose }) {
  const [copied, setCopied] = useState(false);
  const { showToast } = useApp();

  if (!candidate) return null;

  const shareUrl = getCandidateShareUrl(candidate.id);
  const shareText = `Votez pour ${candidate.stageName || candidate.name} dans la catégorie "${candidate.category}" - ${candidate.prize} pour PRIMART 2028 ! 🏆✨`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    showToast("Lien copié !", "Lien direct de vote copié dans le presse-papier.", "success");
    setTimeout(() => setCopied(false), 2500);
  };

  const shareWhatsApp = () => {
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`, '_blank', 'noopener,noreferrer');
  };

  const shareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank', 'noopener,noreferrer');
  };

  const shareX = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 text-amber-400 mb-1">
            <Share2 className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Partager & Soutenir</span>
          </div>
          <DialogTitle>Soutenez {candidate.stageName || candidate.name}</DialogTitle>
          <DialogDescription>
            Partagez ce profil sur vos réseaux pour mobiliser un maximum de voix !
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Quick link input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Lien personnel de vote :</label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs text-slate-800 truncate font-mono select-all focus:outline-none focus:border-amber-400"
              />
              <Button size="sm" onClick={copyToClipboard} variant={copied ? "default" : "secondary"} className="shrink-0">
                {copied ? <Check className="w-4 h-4 mr-1 text-slate-950" /> : <Copy className="w-4 h-4 mr-1" />}
                {copied ? "Copié !" : "Copier"}
              </Button>
            </div>
          </div>

          {/* Social buttons */}
          <div className="grid grid-cols-3 gap-2 pt-2">
            <button
              onClick={shareWhatsApp}
              className="flex flex-col items-center justify-center p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100/70 transition-all text-xs font-semibold gap-1.5"
            >
              <span className="text-lg">💬</span>
              WhatsApp
            </button>

            <button
              onClick={shareFacebook}
              className="flex flex-col items-center justify-center p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100/70 transition-all text-xs font-semibold gap-1.5"
            >
              <span className="text-lg">📘</span>
              Facebook
            </button>

            <button
              onClick={shareX}
              className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200/70 transition-all text-xs font-semibold gap-1.5"
            >
              <span className="text-lg">✖️</span>
              X (Twitter)
            </button>
          </div>

          {/* Share link */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-4">
            <div className="w-16 h-16 bg-white p-1 rounded-lg flex items-center justify-center shrink-0 shadow-sm border border-slate-200">
              <QrCode className="w-14 h-14 text-slate-900" />
            </div>
            <div className="text-xs text-slate-600">
              <p className="font-semibold text-slate-900">Lien du profil prêt à partager</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Vos proches peuvent ouvrir le profil avec le lien ci-dessus.</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
