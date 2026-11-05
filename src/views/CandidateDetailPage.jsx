import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { VoteModal } from '@/components/shared/VoteModal';
import { ShareModal } from '@/components/shared/ShareModal';
import {
  Trophy,
  Heart,
  Share2,
  ArrowLeft,
  MapPin,
  Calendar,
  Volume2,
  ExternalLink,
  Flame,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

export default function CandidateDetailPage() {
  const { id } = useParams();
  const { candidates, loading, dataError, refreshData } = useApp();

  const [isVoteOpen, setIsVoteOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);

  const candidate = candidates.find(c => c.id === id);

  useEffect(() => {
    if (!candidate) return undefined;

    const title = `${candidate.stageName || candidate.name} | PRIMART 2028`;
    const description = `Découvrez ${candidate.stageName || candidate.name}, candidat dans la catégorie ${candidate.category} pour le prix ${candidate.prize}.`;
    const image = candidate.photo ? new URL(candidate.photo, window.location.origin).href : '';
    const url = window.location.href;
    const previousTitle = document.title;
    const previousValues = new Map();
    const metadata = [
      ['name', 'description', description],
      ['property', 'og:title', title],
      ['property', 'og:description', description],
      ['property', 'og:type', 'profile'],
      ['property', 'og:locale', 'fr_FR'],
      ['property', 'og:url', url],
      ['property', 'og:image', image],
      ['property', 'og:image:alt', `${candidate.stageName || candidate.name} - PRIMART 2028`],
      ['name', 'twitter:card', 'summary_large_image'],
      ['name', 'twitter:title', title],
      ['name', 'twitter:description', description],
      ['name', 'twitter:image', image],
    ];
    let canonical = document.head.querySelector('link[rel="canonical"]');
    const createdCanonical = !canonical;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    const previousCanonical = canonical.href;
    canonical.href = url;

    metadata.forEach(([attribute, key, content]) => {
      let element = document.head.querySelector(`meta[${attribute}="${key}"]`);
      const created = !element;
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, key);
        document.head.appendChild(element);
      }
      previousValues.set(element, { content: element.getAttribute('content'), created });
      element.setAttribute('content', content);
    });
    document.title = title;

    return () => {
      document.title = previousTitle;
      if (createdCanonical) canonical.remove();
      else canonical.href = previousCanonical;
      previousValues.forEach(({ content, created }, element) => {
        if (created) element.remove();
        else if (content === null) element.removeAttribute('content');
        else element.setAttribute('content', content);
      });
    };
  }, [candidate]);

  if (!candidate && loading) {
    return <div role="status" className="mx-auto max-w-6xl px-4 py-20 text-center text-sm text-slate-700">Chargement du profil…</div>;
  }

  if (!candidate) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-900 font-display">{dataError ? 'Profil indisponible' : 'Candidat non trouvé'}</h2>
        <p role={dataError ? 'alert' : undefined} className="text-slate-700 text-sm">
          {dataError || "Ce profil n'existe pas ou n'a pas encore été validé par la modération."}
        </p>
        {dataError && <Button variant="outline" onClick={() => void refreshData()}>Réessayer</Button>}
        <Link to="/candidats">
          <Button variant="default" size="sm">Retour aux candidats</Button>
        </Link>
      </div>
    );
  }

  const votesToLeader = candidate.votesToLeader || 0;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Back link */}
      <div>
        <Link to="/candidats" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-amber-600 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Retour à la galerie des talents
        </Link>
      </div>

      {/* Main Artist Profile Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Image & Quick Actions (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="relative aspect-[3/4] rounded-3xl overflow-hidden border border-slate-200 shadow-xl bg-slate-100 group">
            <img
              src={candidate.photo}
              alt={candidate.stageName || candidate.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
            
            {/* Top badges */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
              <Badge variant="purple" className="text-xs backdrop-blur-md">
                {candidate.category}
              </Badge>
              {candidate.currentRank === 1 ? (
                <span className="bg-amber-400 text-black font-extrabold text-xs px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                  🥇 #1 Leader
                </span>
              ) : candidate.currentRank > 0 ? (
                <span className="bg-white/95 text-amber-800 border border-amber-300 font-bold text-xs px-3 py-1 rounded-full shadow-xs">
                  Rang #{candidate.currentRank}
                </span>
              ) : null}
            </div>

            {/* Bottom Floating Stats */}
            <div className="absolute bottom-4 left-4 right-4 text-center">
              <div className="bg-black/60 backdrop-blur-md p-3 rounded-2xl border border-white/20 text-white">
                <div className="text-xs text-slate-200">Total votes comptabilisés</div>
                <div className="text-3xl font-extrabold text-amber-400 font-display">
                  {(candidate.votesTotal || 0).toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* Direct Vote & Share CTAs */}
          <div className="space-y-2">
            <Button
              onClick={() => setIsVoteOpen(true)}
              variant="goldGlow"
              size="lg"
              className="w-full text-sm font-bold shadow-xl"
            >
              <Heart className="w-4 h-4 mr-2 text-slate-950 fill-slate-950" />
              Voter maintenant pour ce talent
            </Button>

            <Button
              onClick={() => setIsShareOpen(true)}
              variant="outline"
              size="default"
              className="w-full text-xs font-semibold border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              <Share2 className="w-4 h-4 mr-2 text-amber-600" />
              Partager le profil & QR Code
            </Button>
          </div>
        </div>

        {/* Right Column: Bio, Targeted Prize, Media & Stats (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Header Info */}
          <div>
            <div className="flex items-center gap-2 text-xs text-amber-600 font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4" /> Candidat Officiel PRIMART 2028
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 font-display">
              {candidate.stageName || candidate.name}
            </h1>
            {candidate.stageName && candidate.name !== candidate.stageName && (
              <p className="text-sm text-slate-600 mt-1">Nom civil : {candidate.name}</p>
            )}

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 mt-3 pt-3 border-t border-slate-200">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-amber-600" />
                <span>{candidate.city ? `${candidate.city}, ` : ''}{candidate.country}</span>
              </div>
              {candidate.age && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-amber-600" />
                  <span>{candidate.age} ans</span>
                </div>
              )}
            </div>
          </div>

          {/* Targeted Prize Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-amber-100/50 border border-amber-200 shadow-xs flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Prix en compétition</span>
              <h4 className="text-base sm:text-lg font-bold text-slate-900 font-display">{candidate.prize}</h4>
              <p className="text-xs text-slate-700">Discipline : {candidate.category}</p>
            </div>
            <Trophy className="w-10 h-10 text-amber-600 shrink-0 opacity-90" />
          </div>

          {/* Gap with Leader or Leader Badge */}
          {candidate.currentRank === 1 ? (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2.5 shadow-2xs">
              <Flame className="w-5 h-5 text-amber-600 shrink-0" />
              <span>
                <strong>Actuel #1 de sa catégorie !</strong> Continuez de voter pour creuser l'écart et sécuriser le trophée.
              </span>
            </div>
          ) : votesToLeader > 0 ? (
            <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs text-slate-700 text-xs flex items-center justify-between">
              <span className="text-slate-600">Écart avec le leader de la catégorie :</span>
              <span className="font-bold text-amber-600 font-display">+{votesToLeader.toLocaleString()} votes nécessaires</span>
            </div>
          ) : null}

          {/* Biography */}
          <div className="space-y-2">
            <h3 className="text-base font-bold text-slate-900 font-display">Biographie & Parcours</h3>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              {candidate.bio}
            </p>
          </div>

          {/* Multimedia player demo */}
          {candidate.audioSample && (
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-600 flex items-center gap-1.5">
                  <Volume2 className="w-4 h-4" /> Extrait sonore en écoute
                </span>
                <span className="text-[10px] text-slate-500">Extrait audio</span>
              </div>
              <audio controls className="w-full h-10 rounded-lg">
                <source src={candidate.audioSample} type="audio/mpeg" />
                Votre navigateur ne supporte pas la lecture audio.
              </audio>
            </div>
          )}

          {/* Social Links */}
          {candidate.socialLinks && (
            <div className="space-y-2 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">Réseaux Sociaux</h4>
              <div className="flex flex-wrap gap-2">
                {Object.entries(candidate.socialLinks).map(([network, handle]) => (
                  <span
                    key={network}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 shadow-xs"
                  >
                    <span className="capitalize font-semibold text-amber-600">{network} :</span>
                    <span>{handle}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Modals */}
      <VoteModal
        candidate={candidate}
        isOpen={isVoteOpen}
        onClose={() => setIsVoteOpen(false)}
      />
      <ShareModal
        candidate={candidate}
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
      />
    </div>
  );
}
