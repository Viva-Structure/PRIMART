import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Copy, Check, Share2, QrCode as QrCodeIcon, Sparkles } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { getCandidateVoteUrl, getCandidateShareUrl } from '@/lib/candidateShareUrl';
import { CandidateQRCode } from '@/components/shared/CandidateQRCode';

export function ShareModal({ candidate, isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('link'); // 'link' | 'qrcode'
  const [copied, setCopied] = useState(false);
  const { showToast } = useApp();

  if (!candidate) return null;

  const voteUrl = getCandidateVoteUrl(candidate.id);
  const shareUrl = getCandidateShareUrl(candidate.id, { directVote: true });
  const shareText = `Votez pour ${candidate.stageName || candidate.name} dans la catégorie "${candidate.category}" - ${candidate.prize} pour PRIMART 2028 ! 🏆✨\nVote direct :`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(voteUrl);
    setCopied(true);
    showToast("Lien direct copié !", "Le lien ouvre immédiatement le formulaire de vote.", "success");
    setTimeout(() => setCopied(false), 2500);
  };

  const shareWhatsApp = () => {
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + voteUrl)}`, '_blank', 'noopener,noreferrer');
  };

  const shareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank', 'noopener,noreferrer');
  };

  const shareX = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(voteUrl)}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 text-amber-500 mb-1">
            <Share2 className="w-5 h-5 text-[#B8973E]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#B8973E]">Partager & Mobiliser les votes</span>
          </div>
          <DialogTitle>Soutenez {candidate.stageName || candidate.name}</DialogTitle>
          <DialogDescription className="text-xs">
            Partagez le lien direct ou le QR Code pour que vos supporters votent instantanément.
          </DialogDescription>
        </DialogHeader>

        {/* Tab Switcher: Lien vs QR Code */}
        <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('link')}
            className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'link'
                ? 'bg-white text-slate-900 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            Lien & Réseaux Sociaux
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('qrcode')}
            className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'qrcode'
                ? 'bg-white text-slate-900 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <QrCodeIcon className="w-3.5 h-3.5" />
            QR Code & Affiche
          </button>
        </div>

        {activeTab === 'link' ? (
          <div className="space-y-4 py-2 animate-in fade-in-50 duration-200">
            {/* Quick direct vote link */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700">Lien direct de vote :</label>
                <span className="text-[10px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full font-bold">
                  Ouvre directement le vote
                </span>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={voteUrl}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs text-slate-800 truncate font-mono select-all focus:outline-none focus:border-amber-400"
                />
                <Button size="sm" onClick={copyToClipboard} variant={copied ? "gold" : "secondary"} className="shrink-0 text-xs">
                  {copied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                  {copied ? "Copié !" : "Copier"}
                </Button>
              </div>
            </div>

            {/* Social buttons */}
            <div className="space-y-1.5 pt-1">
              <label className="text-xs font-semibold text-slate-700">Partager en 1 clic :</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={shareWhatsApp}
                  className="flex flex-col items-center justify-center p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-100/80 transition-all text-xs font-semibold gap-1.5 shadow-2xs active:scale-95"
                >
                  <img src="/whatsapp.png" alt="icone whatsapp" className="w-8 h-8" />
                  {/* <span className="text-xl">💬</span> */}
                  WhatsApp
                </button>

                <button
                  type="button"
                  onClick={shareFacebook}
                  className="flex flex-col items-center justify-center p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 hover:bg-blue-100/80 transition-all text-xs font-semibold gap-1.5 shadow-2xs active:scale-95"
                >
                  <img src="/facebook.png" alt="icone facebook" className="w-8 h-8" />
                  Facebook
                </button>

                <button
                  type="button"
                  onClick={shareX}
                  className="flex flex-col items-center justify-center p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 hover:bg-red-100/80 transition-all text-xs font-semibold gap-1.5 shadow-2xs active:scale-95"
                >
                  <img src="/youtube.png" alt="icone youtube" className="w-8 h-8" />
                  youtube
                </button>
              </div> 
            </div>

            {/* Quick QR preview trigger */}
            <div
              onClick={() => setActiveTab('qrcode')}
              className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 flex items-center justify-between cursor-pointer hover:bg-amber-100/60 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white border border-amber-300 flex items-center justify-center text-slate-900 shadow-2xs">
                  <QrCodeIcon className="w-6 h-6 text-[#B8973E]" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Besoin du QR Code ?</h4>
                  <p className="text-[11px] text-slate-600">Téléchargez le QR Code ou l'affiche de campagne prête à imprimer.</p>
                </div>
              </div>
              <span className="text-xs font-bold text-amber-800">Voir →</span>
            </div>
          </div>
        ) : (
          <div className="py-2 animate-in fade-in-50 duration-200">
            <CandidateQRCode
              candidate={candidate}
              url={voteUrl}
              size={170}
              showDownload={true}
              showBadge={true}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
