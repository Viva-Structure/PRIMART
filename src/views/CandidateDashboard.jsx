import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { CandidateLayout } from '@/components/layout/CandidateLayout';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { getCandidateVoteUrl, getCandidateShareUrl } from '@/lib/candidateShareUrl';
import { CandidateQRCode } from '@/components/shared/CandidateQRCode';
import {
  Trophy,
  Flame,
  Users,
  Copy,
  Check,
  Share2,
  QrCode,
  Eye,
  TrendingUp,
  MessageSquare,
  Clock,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export default function CandidateDashboard() {
  const { candidates, updateCandidate, showToast, loading } = useApp();
  
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [activeSection, setActiveSection] = useState('promotion');

  const candidate = candidates.find(c => c.isOwner);

  // Editable fields
  const [editBio, setEditBio] = useState(candidate?.bio || '');
  const [editInstagram, setEditInstagram] = useState(candidate?.socialLinks?.instagram || '');
  const [editVideoUrl, setEditVideoUrl] = useState(candidate?.videoUrl || '');
  const [savingProfile, setSavingProfile] = useState(false);
  const candidateVersion = candidate
    ? `${candidate.id}|${candidate.bio}|${candidate.videoUrl}|${candidate.socialLinks?.instagram || ''}`
    : '';
  const [loadedCandidateVersion, setLoadedCandidateVersion] = useState(candidateVersion);

  if (candidateVersion !== loadedCandidateVersion) {
    setLoadedCandidateVersion(candidateVersion);
    setEditBio(candidate?.bio || '');
    setEditInstagram(candidate?.socialLinks?.instagram || '');
    setEditVideoUrl(candidate?.videoUrl || '');
  }

  if (loading) {
    return (
      <CandidateLayout candidate={candidate} activeSection={activeSection} onSectionChange={setActiveSection}>
        <p role="status" className="py-16 text-center text-sm text-slate-600">Chargement de votre dossier…</p>
      </CandidateLayout>
    );
  }

  if (!candidate) {
    return (
      <CandidateLayout candidate={null} activeSection={activeSection} onSectionChange={setActiveSection}>
        <section className="mx-auto max-w-xl space-y-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-slate-900">Aucune candidature liée à ce compte</h1>
          <p className="text-sm text-slate-600">Déposez un dossier pour accéder à votre espace candidat.</p>
          <Link to="/candidater" className="inline-flex rounded-xl bg-amber-500 px-4 py-2 text-sm font-bold text-slate-950">
            Déposer une candidature
          </Link>
        </section>
      </CandidateLayout>
    );
  }

  const gap = candidate.votesToLeader || 0;

  const voteUrl = getCandidateVoteUrl(candidate.id);
  const shareUrl = getCandidateShareUrl(candidate.id, { directVote: true });
  const promoText = `🚨 URGENT : Les votes pour PRIMART 2028 sont ouverts ! Soutenez ${candidate.stageName || candidate.name} dans la catégorie "${candidate.category}" - ${candidate.prize}.\nChaque vote compte, votez gratuitement dès maintenant sur ce lien direct : ${voteUrl} 🏆`;

  const copyLink = () => {
    navigator.clipboard.writeText(voteUrl);
    setCopiedLink(true);
    showToast("Lien direct copié !", "Lien direct ouvrant le formulaire de vote copié.", "success");
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const copyPromoText = () => {
    navigator.clipboard.writeText(promoText);
    setCopiedText(true);
    showToast("Message copié !", "Texte promotionnel copié pour WhatsApp et réseaux.", "success");
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await updateCandidate(candidate.id, {
        bio: editBio,
        videoUrl: editVideoUrl,
        socialLinks: {
          ...candidate.socialLinks,
          instagram: editInstagram
        }
      });
    } catch (error) {
      showToast('Enregistrement impossible', error.message, 'destructive');
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <CandidateLayout candidate={candidate} activeSection={activeSection} onSectionChange={setActiveSection}>
    <div className="space-y-8">

      <header className="flex flex-col gap-3 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-600">Espace candidat</p>
          <h1 className="mt-1 font-display text-2xl font-extrabold text-slate-900 sm:text-3xl">
            {candidate.stageName || candidate.name}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {candidate.prize} · {candidate.category}
          </p>
        </div>
        <Badge variant="success" className="w-fit">{candidate.status}</Badge>
      </header>

      {/* KPI Cards Row (Section 11) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Votes */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>Total Votes Reçus</span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 font-display">
            {(candidate.votesTotal || 0).toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex justify-between">
            <span>Gratuits : <strong>{(candidate.votesFree || 0).toLocaleString()}</strong></span>
            <span>Boosts : <strong>{(candidate.votesPaid || 0).toLocaleString()}</strong></span>
          </div>
        </div>

        {/* Rank */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>Rang dans la Catégorie</span>
            <Trophy className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-amber-600 font-display">
            {candidate.currentRank === 1 ? '🥇 #1 (Leader)' : `#${candidate.currentRank || '-'}`}
          </div>
          <p className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> En position éligible au podium
          </p>
        </div>

        {/* Distance to Leader */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>Écart avec le #1</span>
            <Sparkles className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 font-display">
            {candidate.currentRank === 1 ? '0 (En tête)' : `+${gap.toLocaleString()}`}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {candidate.currentRank === 1 ? 'Vous menez la course' : 'Votes à rattraper'}
          </p>
        </div>

        {/* Views */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>Visites du Profil</span>
            <Eye className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-3xl font-extrabold text-blue-600 font-display">
            {candidate.views.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Nombre de consultations enregistré sur la fiche.</p>
        </div>

      </div>

      {/* Tabs for Candidate actions */}
      <Tabs value={activeSection} onValueChange={setActiveSection} className="space-y-6">

        {/* TAB 1: PROMOTION TOOLKIT */}
        <TabsContent value="promotion" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Direct Link & QR Code */}
            <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-5">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-bold text-base text-slate-900 flex items-center gap-2">
                    <Share2 className="w-4 h-4 text-amber-500" /> Votre Lien Direct de Vote
                  </h3>
                  <span className="text-[10px] text-amber-800 bg-amber-50 border border-amber-200 font-bold px-2 py-0.5 rounded-full">
                    Ouvre directement le formulaire
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed mt-1">
                  Ce lien amène directement vos supporters sur votre profil avec la fenêtre de vote ouverte.
                </p>
              </div>

              <div className="flex gap-2">
                <Input readOnly value={voteUrl} className="text-xs font-mono truncate" />
                <Button size="sm" variant={copiedLink ? "gold" : "outline"} onClick={copyLink} className="shrink-0 text-xs">
                  {copiedLink ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                  {copiedLink ? "Copié !" : "Copier"}
                </Button>
              </div>

              {/* QR Code & Affiche officielle de campagne */}
              <div className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200">
                <CandidateQRCode
                  candidate={candidate}
                  url={voteUrl}
                  size={160}
                  showDownload={true}
                  showBadge={true}
                />
              </div>
            </div>

            {/* Ready to share message template */}
            <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-4">
              <h3 className="font-display font-bold text-base text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-500" /> Modèle de Message pour WhatsApp & TikTok
              </h3>
              <p className="text-xs text-slate-500">
                Copiez-collez ce texte prêt à l'emploi dans vos groupes WhatsApp, canaux Telegram et légendes de posts :
              </p>

              <Textarea
                readOnly
                value={promoText}
                rows={4}
                className="text-xs leading-relaxed text-slate-700 bg-slate-50 border-slate-200"
              />

              <Button size="sm" variant={copiedText ? "gold" : "secondary"} onClick={copyPromoText} className="w-full text-xs font-semibold">
                {copiedText ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                {copiedText ? "Texte copié !" : "Copier le message pour WhatsApp"}
              </Button>
            </div>

          </div>
        </TabsContent>

        {/* TAB 2: PROFILE EDIT */}
        <TabsContent value="profile">
          <form onSubmit={handleSaveProfile} className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm max-w-2xl space-y-4">
            <h3 className="font-display font-bold text-base text-slate-900">
              Actualiser vos informations publiques
            </h3>

            <div className="space-y-1.5">
              <Label htmlFor="edit-bio" className="text-xs text-slate-600">Votre Biographie & Présentation</Label>
              <Textarea
                id="edit-bio"
                rows={5}
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-video" className="text-xs text-slate-600">Lien Vidéo YouTube / TikTok</Label>
              <Input
                id="edit-video"
                value={editVideoUrl}
                onChange={(e) => setEditVideoUrl(e.target.value)}
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-insta" className="text-xs text-slate-600">Compte Instagram</Label>
              <Input
                id="edit-insta"
                value={editInstagram}
                onChange={(e) => setEditInstagram(e.target.value)}
                className="text-xs"
              />
            </div>

            <Button type="submit" disabled={savingProfile} variant="gold" size="default" className="text-xs font-bold">
              {savingProfile ? 'Enregistrement…' : 'Enregistrer les modifications'}
            </Button>
          </form>
        </TabsContent>

        {/* TAB 3: STATUS TRACKER */}
        <TabsContent value="status">
          <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm max-w-2xl space-y-4">
            <h3 className="font-display font-bold text-base text-slate-900">
              Suivi officiel de votre candidature
            </h3>

            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-xs">
                  ✓
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 text-xs">Dossier reçu</h4>
                  <p className="text-[11px] text-slate-500">{new Date(candidate.registeredAt).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-xs">
                  ✓
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 text-xs">Modération & Validation Juridique</h4>
                  <p className="text-[11px] text-emerald-600 font-semibold">Statut : {candidate.status}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-xs animate-pulse">
                  ●
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 text-xs">Campagne de votes en direct</h4>
                  <p className="text-[11px] text-slate-500">Les votes sont actuellement ouverts au public.</p>
                </div>
              </div>
            </div>

            <Link to={`/candidat/${candidate.id}`}>
              <Button variant="outlineGold" size="sm" className="mt-4 text-xs font-semibold">
                Voir ma page publique telle que les votants la voient <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </div>
        </TabsContent>

      </Tabs>

    </div>
    </CandidateLayout>
  );
}
