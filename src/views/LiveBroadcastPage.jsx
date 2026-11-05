import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { CATEGORIES } from '@/data/categoriesData';
import { Trophy, ArrowLeft, ArrowRight, Maximize2, Radio, Sparkles, Flame } from 'lucide-react';

export default function LiveBroadcastPage() {
  const { candidates, totalVotesCount, eventSettings, loading, dataError, refreshData } = useApp();
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [fullscreenError, setFullscreenError] = useState('');

  const categoriesWithAll = [{ id: "tous", name: "Classement Général", prizesCount: 52 }, ...CATEGORIES];

  // Auto rotate categories every 12 seconds for ceremony screens
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const timer = setInterval(() => {
      setCurrentCategoryIndex((prev) => (prev + 1) % categoriesWithAll.length);
    }, 12000);
    return () => clearInterval(timer);
  }, [categoriesWithAll.length]);

  const currentCategory = categoriesWithAll[currentCategoryIndex];

  // Candidates in this category
  const acceptedCandidates = candidates.filter(c => c.status === "Accepté");
  const filtered = currentCategory.id === "tous"
    ? acceptedCandidates
    : acceptedCandidates.filter(c => c.categoryId === currentCategory.id);

  const ranked = [...filtered]
    .sort((a, b) => (currentCategory.id === 'tous' ? a.globalRank - b.globalRank : a.currentRank - b.currentRank))
    .slice(0, 5);

  const toggleFullscreen = async () => {
    setFullscreenError('');
    if (!document.fullscreenElement) {
      try {
        await document.documentElement.requestFullscreen();
      } catch {
        setFullscreenError('Le mode plein écran n’est pas disponible dans ce navigateur.');
      }
    } else {
      try {
        await document.exitFullscreen();
      } catch {
        setFullscreenError('Impossible de quitter le mode plein écran.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#06060C] text-white flex flex-col justify-between p-6 sm:p-10 overflow-hidden select-none">
      
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-amber-500/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-600/10 blur-[150px] rounded-full pointer-events-none" />

      {/* Top Bar for Broadcast */}
      <div className="relative z-10 flex items-center justify-between border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-black font-extrabold shadow-lg shadow-amber-500/30">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-display font-black text-2xl tracking-wider text-white">
              PRIMART <span className="text-amber-400">2028</span> • DIRECT SCÈNE
            </h1>
            <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold">
              <span className="flex items-center gap-1.5 text-red-500 font-bold uppercase tracking-wider animate-pulse">
                <Radio className="w-3.5 h-3.5" /> En direct du gala
              </span>
              {eventSettings.showExactVotes && (
                <span>• Total votes : <strong className="text-amber-400 font-mono">{totalVotesCount.toLocaleString('fr-FR')}</strong></span>
              )}
            </div>
          </div>
        </div>

        {/* Action controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleFullscreen}
            aria-label={document.fullscreenElement ? 'Quitter le plein écran' : 'Passer en plein écran'}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            title="Plein Écran"
          >
            <Maximize2 className="w-5 h-5" />
          </button>
          <Link
            to="/classement"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Quitter l'écran de diffusion
          </Link>
        </div>
      </div>
      {fullscreenError && <p role="alert" className="relative z-10 text-center text-sm text-amber-200">{fullscreenError}</p>}
      {dataError && (
        <div role="alert" className="relative z-10 flex items-center justify-center gap-3 text-sm text-red-200">
          <span>Connexion aux résultats interrompue.</span>
          <button type="button" onClick={() => void refreshData()} disabled={loading} className="rounded border border-red-200 px-3 py-1 underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
            Réessayer
          </button>
        </div>
      )}

      {/* Category Header */}
      <div className="relative z-10 text-center py-4">
        <div className="inline-flex items-center gap-2 text-xs uppercase font-extrabold tracking-widest text-amber-400 bg-amber-500/10 px-4 py-1.5 rounded-full border border-amber-500/30 mb-2">
          <Sparkles className="w-4 h-4" /> Rotation automatique ({currentCategoryIndex + 1}/{categoriesWithAll.length})
        </div>
        <h2 aria-live="polite" className="text-4xl sm:text-5xl font-black text-white font-display tracking-tight">
          {currentCategory.name}
        </h2>
        <div className="mt-4 flex items-center justify-center gap-3">
          <button
            type="button"
            aria-label="Catégorie précédente"
            onClick={() => setCurrentCategoryIndex(index => (index - 1 + categoriesWithAll.length) % categoriesWithAll.length)}
            className="rounded-full border border-white/30 p-2 text-white hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          </button>
          <span className="text-xs text-slate-300">{currentCategoryIndex + 1} / {categoriesWithAll.length}</span>
          <button
            type="button"
            aria-label="Catégorie suivante"
            onClick={() => setCurrentCategoryIndex(index => (index + 1) % categoriesWithAll.length)}
            className="rounded-full border border-white/30 p-2 text-white hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300"
          >
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Main Broadcast Podium / Top 5 Horizontal Grid */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-5 gap-4 max-w-6xl mx-auto w-full my-auto items-end">
        {loading ? (
          <p role="status" className="col-span-full py-12 text-center text-slate-300">Chargement du classement…</p>
        ) : ranked.length === 0 ? (
          <p className="col-span-full py-12 text-center text-slate-300">Aucun candidat accepté à afficher pour cette catégorie.</p>
        ) : ranked.map((c, idx) => {
          const rank = idx + 1;
          const isLeader = rank === 1;

          return (
            <div
              key={c.id}
              className={`rounded-3xl p-5 border text-center transition-all duration-500 ${
                isLeader
                  ? "bg-gradient-to-t from-amber-950/60 via-[#18182E] to-[#201A35] border-2 border-amber-400 shadow-2xl shadow-amber-500/30 md:-translate-y-6"
                  : "bg-[#101020]/90 border-slate-800 shadow-xl"
              }`}
            >
              {/* Rank Medal */}
              <div className="mb-3">
                {rank === 1 && (
                  <span className="text-3xl filter drop-shadow">🥇</span>
                )}
                {rank === 2 && (
                  <span className="text-2xl filter drop-shadow">🥈</span>
                )}
                {rank === 3 && (
                  <span className="text-2xl filter drop-shadow">🥉</span>
                )}
                {rank > 3 && (
                  <span className="text-slate-400 font-bold font-display text-lg">#{rank}</span>
                )}
              </div>

              {/* Photo */}
              <div className="relative w-24 h-24 mx-auto mb-3">
                <img
                  src={c.photo}
                  alt={c.name}
                  className={`w-full h-full object-cover rounded-full ring-4 shadow-xl ${
                    isLeader ? "ring-amber-400" : rank === 2 ? "ring-slate-300" : rank === 3 ? "ring-amber-700" : "ring-slate-700"
                  }`}
                />
                {isLeader && (
                  <span className="absolute -bottom-1 -right-1 bg-amber-500 text-black text-[10px] font-black p-1 rounded-full shadow">
                    ⭐
                  </span>
                )}
              </div>

              {/* Names & Prize */}
              <h3 className="font-display font-extrabold text-white text-base truncate">
                {c.stageName || c.name}
              </h3>
              <p className="text-[11px] text-slate-400 truncate mt-0.5">{c.prize}</p>

              {eventSettings.showExactVotes && (
                <div className="mt-3 border-t border-white/10 pt-3">
                  <div className={`font-display font-black text-xl ${isLeader ? 'text-amber-400 text-2xl' : 'text-slate-200'}`}>
                    {c.votesTotal.toLocaleString('fr-FR')}
                  </div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-300">Votes comptabilisés</div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom News Ticker */}
      <div className="relative z-10 border-t border-slate-800/80 pt-4 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-3">
          <span className="bg-amber-500 text-black font-extrabold px-2.5 py-0.5 rounded text-[11px] uppercase tracking-wider">
            FLASH INFO
          </span>
          <span className="text-slate-200 truncate font-medium">
            Les votes se poursuivent selon les règles officielles • Le vote gratuit nécessite une vérification • La clôture est appliquée côté serveur.
          </span>
        </div>
        <div className="font-mono text-amber-400 font-bold shrink-0 hidden sm:block">
          PRIMART OFFICIAL SYSTEM
        </div>
      </div>

    </div>
  );
}
