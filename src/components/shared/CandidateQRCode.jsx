import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Download, QrCode as QrCodeIcon, Check, Copy, Sparkles, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/context/AppContext';
import { getCandidateVoteUrl } from '@/lib/candidateShareUrl';

export function CandidateQRCode({
  candidate,
  url,
  size = 200,
  showDownload = true,
  showBadge = true,
  className = '',
}) {
  const { showToast } = useApp();
  const canvasRef = useRef(null);
  const [dataUrl, setDataUrl] = useState('');
  const [isGeneratingFlyer, setIsGeneratingFlyer] = useState(false);
  const [copied, setCopied] = useState(false);

  const targetUrl = url || (candidate ? getCandidateVoteUrl(candidate.id) : '');

  // Génération du QR Code sur le canvas
  useEffect(() => {
    if (!targetUrl || !canvasRef.current) return;

    QRCode.toCanvas(
      canvasRef.current,
      targetUrl,
      {
        width: size,
        margin: 2,
        color: {
          dark: '#0F1117',
          light: '#FFFFFF',
        },
        errorCorrectionLevel: 'H', // Haute tolérance pour permettre un scan ultra rapide
      },
      (error) => {
        if (error) {
          console.error('Erreur de génération du QR code:', error);
          return;
        }
        if (canvasRef.current) {
          setDataUrl(canvasRef.current.toDataURL('image/png'));
        }
      }
    );
  }, [targetUrl, size]);

  const copyUrl = () => {
    if (!targetUrl) return;
    navigator.clipboard.writeText(targetUrl);
    setCopied(true);
    showToast('Lien copié !', 'Le lien direct de vote a été copié.', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  // Télécharger le QR Code seul en haute résolution (1024x1024)
  const downloadQRCodeOnly = async () => {
    try {
      const highResDataUrl = await QRCode.toDataURL(targetUrl, {
        width: 1024,
        margin: 2,
        color: {
          dark: '#0F1117',
          light: '#FFFFFF',
        },
        errorCorrectionLevel: 'H',
      });

      const a = document.createElement('a');
      a.href = highResDataUrl;
      const stageNameSlug = (candidate?.stageName || candidate?.name || 'candidat')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-');
      a.download = `qrcode-vote-${stageNameSlug}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      showToast('Téléchargement lancé', 'Votre QR Code haute résolution est prêt.', 'success');
    } catch (err) {
      console.error(err);
      showToast('Erreur', 'Impossible de télécharger le QR code.', 'destructive');
    }
  };

  // Télécharger l'affiche officielle de campagne PRIMART (Flyer format Story / Poster)
  const downloadCampaignFlyer = async () => {
    if (!candidate) return;
    setIsGeneratingFlyer(true);
    showToast('Génération de l’affiche…', 'Création de votre flyer officiel de vote en cours.', 'info');

    try {
      // Dimensions format Story / Flyer (1080 x 1920)
      const flyerCanvas = document.createElement('canvas');
      flyerCanvas.width = 1080;
      flyerCanvas.height = 1920;
      const ctx = flyerCanvas.getContext('2d');

      // 1. Fond sombre luxueux
      const bgGradient = ctx.createLinearGradient(0, 0, 1080, 1920);
      bgGradient.addColorStop(0, '#0F1117');
      bgGradient.addColorStop(0.5, '#161922');
      bgGradient.addColorStop(1, '#080A0E');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, 1080, 1920);

      // Cercles décoratifs dorés légers
      ctx.beginPath();
      ctx.arc(540, 200, 400, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(184, 151, 62, 0.06)';
      ctx.fill();

      // Bordure dorée d'encadrement
      ctx.strokeStyle = '#B8973E';
      ctx.lineWidth = 4;
      ctx.strokeRect(40, 40, 1000, 1840);

      ctx.strokeStyle = 'rgba(184, 151, 62, 0.3)';
      ctx.lineWidth = 1;
      ctx.strokeRect(55, 55, 970, 1810);

      // 2. En-tête : PRIMART AWARDS 2028
      ctx.textAlign = 'center';
      ctx.fillStyle = '#B8973E';
      ctx.font = 'bold 36px sans-serif';
      ctx.letterSpacing = '6px';
      ctx.fillText('PRIMART AWARDS 2028', 540, 140);

      ctx.fillStyle = '#94A3B8';
      ctx.font = '22px sans-serif';
      ctx.letterSpacing = '3px';
      ctx.fillText('FESTIVAL OFFICIEL DES TALENTS D’AFRIQUE', 540, 185);

      // Trait séparateur doré
      ctx.fillStyle = '#B8973E';
      ctx.fillRect(440, 215, 200, 3);

      // 3. Photo du candidat (ou avatar)
      const photoSize = 360;
      const photoX = 540 - photoSize / 2;
      const photoY = 270;

      // Cadre extérieur photo doré
      ctx.save();
      ctx.beginPath();
      ctx.arc(540, photoY + photoSize / 2, photoSize / 2 + 8, 0, Math.PI * 2);
      ctx.strokeStyle = '#B8973E';
      ctx.lineWidth = 8;
      ctx.stroke();

      // Clip circulaire pour la photo
      ctx.beginPath();
      ctx.arc(540, photoY + photoSize / 2, photoSize / 2, 0, Math.PI * 2);
      ctx.clip();

      if (candidate.photo) {
        try {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = resolve; // fallback si échec de chargement
            img.src = candidate.photo;
          });
          if (img.width > 0) {
            ctx.drawImage(img, photoX, photoY, photoSize, photoSize);
          } else {
            ctx.fillStyle = '#1E293B';
            ctx.fillRect(photoX, photoY, photoSize, photoSize);
          }
        } catch {
          ctx.fillStyle = '#1E293B';
          ctx.fillRect(photoX, photoY, photoSize, photoSize);
        }
      } else {
        ctx.fillStyle = '#1E293B';
        ctx.fillRect(photoX, photoY, photoSize, photoSize);
      }
      ctx.restore();

      // 4. Informations du candidat
      const stageName = (candidate.stageName || candidate.name || '').toUpperCase();
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '900 68px sans-serif';
      ctx.letterSpacing = '1px';
      ctx.fillText(stageName, 540, 710);

      ctx.fillStyle = '#B8973E';
      ctx.font = 'bold 34px sans-serif';
      ctx.fillText(candidate.prize || 'Candidat Officiel', 540, 765);

      ctx.fillStyle = '#CBD5E1';
      ctx.font = '28px sans-serif';
      ctx.fillText(`Catégorie : ${candidate.category || ''}`, 540, 815);

      // 5. Zone QR Code au centre avec conteneur blanc éclatant
      const qrBoxSize = 520;
      const qrBoxX = 540 - qrBoxSize / 2;
      const qrBoxY = 880;

      // Ombre du conteneur QR
      ctx.shadowColor = 'rgba(184, 151, 62, 0.35)';
      ctx.shadowBlur = 40;
      ctx.fillStyle = '#FFFFFF';
      ctx.roundRect(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize, 28);
      ctx.fill();
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;

      // Bordure subtile autour du conteneur
      ctx.strokeStyle = '#B8973E';
      ctx.lineWidth = 4;
      ctx.stroke();

      // Dessin du QR Code haute résolution à l'intérieur
      const qrInnerSize = 440;
      const qrCanvas = document.createElement('canvas');
      await QRCode.toCanvas(qrCanvas, targetUrl, {
        width: qrInnerSize,
        margin: 1,
        color: { dark: '#0F1117', light: '#FFFFFF' },
        errorCorrectionLevel: 'H',
      });
      ctx.drawImage(qrCanvas, 540 - qrInnerSize / 2, qrBoxY + 40, qrInnerSize, qrInnerSize);

      // 6. Consignes de vote sous le QR Code
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 38px sans-serif';
      ctx.letterSpacing = '0.5px';
      ctx.fillText('SCANNEZ POUR VOTER', 540, 1480);

      // Badge doré "1 VOTE GRATUIT / JOUR"
      const badgeY = 1530;
      ctx.fillStyle = '#B8973E';
      ctx.roundRect(540 - 260, badgeY, 520, 60, 30);
      ctx.fill();

      ctx.fillStyle = '#0F1117';
      ctx.font = 'bold 26px sans-serif';
      ctx.letterSpacing = '1px';
      ctx.fillText('1 VOTE GRATUIT PAR JOUR', 540, badgeY + 40);

      // 7. Pied d’affiche
      ctx.fillStyle = '#94A3B8';
      ctx.font = '22px sans-serif';
      ctx.fillText('Pointez l’appareil photo de votre smartphone vers le QR Code.', 540, 1660);
      ctx.fillText('Accès direct au formulaire officiel de vote.', 540, 1700);

      ctx.fillStyle = '#B8973E';
      ctx.font = 'italic bold 22px sans-serif';
      ctx.fillText('www.primart-awards.com', 540, 1780);

      // Téléchargement
      const flyerDataUrl = flyerCanvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = flyerDataUrl;
      const stageNameSlug = (candidate?.stageName || candidate?.name || 'candidat')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-');
      a.download = `affiche-vote-${stageNameSlug}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      showToast('Affiche générée !', 'Votre affiche officielle de campagne a été téléchargée en HD.', 'success');
    } catch (err) {
      console.error(err);
      showToast('Erreur', 'Impossible de générer le flyer.', 'destructive');
    } finally {
      setIsGeneratingFlyer(false);
    }
  };

  return (
    <div className={`flex flex-col items-center text-center space-y-4 ${className}`}>
      {/* Conteneur d'affichage du QR Code */}
      <div className="relative group bg-white p-3 rounded-2xl border-2 border-[#B8973E]/30 shadow-md hover:border-[#B8973E] transition-all">
        <canvas ref={canvasRef} className="rounded-xl mx-auto block" />
        <div className="absolute inset-0 bg-[#0F1117]/80 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-3 gap-2">
          <Button
            size="sm"
            onClick={downloadQRCodeOnly}
            className="bg-[#B8973E] hover:bg-[#a68633] text-black font-bold text-xs h-9"
          >
            <Download className="w-3.5 h-3.5 mr-1" /> QR PNG
          </Button>
        </div>
      </div>

      {showBadge && (
        <div className="space-y-1 max-w-xs">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-bold">
            <Sparkles className="w-3 h-3 text-[#B8973E]" />
            Scannez pour voter directement
          </div>
          <p className="text-[11px] text-slate-500 leading-tight">
            Chaque scan ouvre directement le profil et le formulaire de vote.
          </p>
        </div>
      )}

      {/* Boutons d'action pour le candidat ou supporter */}
      {showDownload && (
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1 w-full max-w-sm">
          <Button
            size="sm"
            variant="gold"
            onClick={downloadCampaignFlyer}
            disabled={isGeneratingFlyer}
            className="w-full text-xs font-bold shadow-sm"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" />
            {isGeneratingFlyer ? 'Création de l’affiche…' : 'Télécharger l’affiche de campagne (HD)'}
          </Button>

          <div className="grid grid-cols-2 gap-2 w-full">
            <Button
              size="sm"
              variant="outline"
              onClick={downloadQRCodeOnly}
              className="text-xs border-slate-300 hover:bg-slate-50"
            >
              <QrCodeIcon className="w-3.5 h-3.5 mr-1" />
              QR Code seul
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={copyUrl}
              className="text-xs border-slate-300 hover:bg-slate-50"
            >
              {copied ? <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
              {copied ? 'Lien copié' : 'Copier le lien'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
