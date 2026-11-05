import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { CATEGORIES } from '@/data/categoriesData';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { VoteModal } from '@/components/shared/VoteModal';
import {
  Trophy,
  ArrowUp,
  ArrowDown,
  Minus,
  Tv,
  Heart,
  Sparkles,
  Flame,
  Radio
} from 'lucide-react';

export default function LeaderboardPage() {
  const { candidates } = useApp();
  const [selectedCategory, setSelectedCategory] = useState("Tous");
  const [displayMode, setDisplayMode] = useState("votes"); // "votes" | "percentage"
  const [votingCandidate, setVotingCandidate] = useState(null);

  // Filter candidates by category & status
  const acceptedCandidates = candidates.filter(c => c.status === "Accepté");
  const filteredCandidates = selectedCategory === "Tous"
    ? acceptedCandidates
    : acceptedCandidates.filter(c => c.category === selectedCategory);

  const rankedCandidates = [...filteredCandidates].sort((a, b) => (
    selectedCategory === 'Tous'
      ? a.globalRank - b.globalRank
      : a.currentRank - b.currentRank
  ));

  const top3 = rankedCandidates.slice(0, 3);
  const getVoteShare = candidate => selectedCategory === 'Tous'
    ? candidate.globalVoteShare
    : candidate.categoryVoteShare;

  const getTrendIcon = (cand, index) => {
    const current = index + 1;
    const prev = cand.previousRank || current;
    if (prev > current) {
      return (
        <span className="flex items-center text-emerald-400 text-xs font-bold gap-0.5" title={`Montée de ${prev - current} rangs`}>
          <ArrowUp className="w-3.5 h-3.5" /> +{prev - current}
        </span>
      );
    }
    if (prev < current) {
      return (
        <span className="flex items-center text-red-400 text-xs font-bold gap-0.5" title={`Recul de ${current - prev} rangs`}>
          <ArrowDown className="w-3.5 h-3.5" /> -{current - prev}
        </span>
      );
    }
    return (
      <span className="text-slate-500 text-xs flex items-center gap-0.5">
        <Minus className="w-3 h-3" />
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Header and Live indicator */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-red-600 bg-red-50 px-3 py-1 rounded-full border border-red-200">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              Direct Live Synchronisé
            </span>
            <span className="text-xs text-slate-500">Rafraîchissement instantané</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-display">
            Classement Officiel des Votes
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Découvrez l'évolution des scores en temps réel par catégorie et pour le grand prix.
          </p>
        </div>

        {/* Action button: Fullscreen mode for live projection screens */}
        <div className="flex items-center gap-3">
          <Link to="/direct-tv">
            <Button variant="outlineGold" size="sm" className="text-xs font-bold">
              <Tv className="w-4 h-4 mr-2 text-amber-600" />
              Mode Grand Écran / TV
            </Button>
          </Link>
        </div>
      </div>

      {/* Category Tabs & Mode Toggle */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        
        {/* Category switcher */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 max-w-full">
          <button
            onClick={() => setSelectedCategory("Tous")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === "Tous"
                ? "bg-amber-500 text-slate-950 shadow-xs font-bold"
                : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 shadow-2xs"
            }`}
          >
            Général (Toutes catégories)
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.name)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat.name
                  ? "bg-amber-500 text-slate-950 shadow-xs font-bold"
                  : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 shadow-2xs"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Display mode toggle (Votes count vs Percentages) */}
        <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs shrink-0 self-end sm:self-auto shadow-2xs">
          <button
            onClick={() => setDisplayMode("votes")}
            className={`px-3 py-1 rounded-lg transition-all ${
              displayMode === "votes" ? "bg-white text-slate-900 font-bold shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Points / Votes
          </button>
          <button
            onClick={() => setDisplayMode("percentage")}
            className={`px-3 py-1 rounded-lg transition-all ${
              displayMode === "percentage" ? "bg-white text-slate-900 font-bold shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Pourcentages (%)
          </button>
        </div>

      </div>

      {/* Top 3 Podium Cards */}
      {top3.length >= 3 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 max-w-4xl mx-auto items-end">
          
          {/* #2 Silver */}
          <div className="order-2 md:order-1 bg-white rounded-3xl p-5 border border-slate-200 text-center space-y-3 shadow-xs">
            <span className="text-2xl">🥈</span>
            <img
              src={top3[1].photo}
              alt={top3[1].name}
              className="w-20 h-20 rounded-full object-cover mx-auto ring-4 ring-slate-300 shadow-md"
            />
            <div>
              <h3 className="font-display font-bold text-slate-900 text-base truncate">{top3[1].stageName || top3[1].name}</h3>
              <p className="text-xs text-slate-500">{top3[1].prize}</p>
              <div className="text-sm font-bold text-slate-800 mt-1">
                {displayMode === "votes"
                  ? `${(top3[1].votesTotal || 0).toLocaleString()} votes`
                  : `${getVoteShare(top3[1])}% des voix`}
              </div>
            </div>
            <Button size="sm" variant="outline" className="w-full text-xs" onClick={() => setVotingCandidate(top3[1])}>
              <Heart className="w-3.5 h-3.5 mr-1" /> Voter
            </Button>
          </div>

          {/* #1 Gold */}
          <div className="order-1 md:order-2 bg-gradient-to-b from-amber-50/90 to-white rounded-3xl p-6 border-2 border-amber-400 text-center space-y-3 md:-translate-y-4 shadow-xl shadow-amber-500/10">
            <div className="inline-flex items-center gap-1 text-[10px] bg-amber-500 text-slate-950 font-black px-2.5 py-0.5 rounded-full uppercase shadow-2xs">
              <Flame className="w-3 h-3 fill-slate-950" /> Numéro 1 Actuel
            </div>
            <div className="text-3xl">🥇</div>
            <img
              src={top3[0].photo}
              alt={top3[0].name}
              className="w-24 h-24 rounded-full object-cover mx-auto ring-4 ring-amber-400 shadow-xl"
            />
            <div>
              <h3 className="font-display font-bold text-slate-900 text-lg truncate">{top3[0].stageName || top3[0].name}</h3>
              <p className="text-xs text-amber-700">{top3[0].prize}</p>
              <div className="text-base font-extrabold text-amber-600 mt-1">
                {displayMode === "votes"
                  ? `${(top3[0].votesTotal || 0).toLocaleString()} votes`
                  : `${getVoteShare(top3[0])}% des voix`}
              </div>
            </div>
            <Button size="sm" variant="gold" className="w-full text-xs font-bold" onClick={() => setVotingCandidate(top3[0])}>
              <Heart className="w-3.5 h-3.5 mr-1 text-slate-950 fill-slate-950" /> Voter
            </Button>
          </div>

          {/* #3 Bronze */}
          <div className="order-3 bg-white rounded-3xl p-5 border border-slate-200 text-center space-y-3 shadow-xs">
            <span className="text-2xl">🥉</span>
            <img
              src={top3[2].photo}
              alt={top3[2].name}
              className="w-20 h-20 rounded-full object-cover mx-auto ring-4 ring-amber-700/60 shadow-md"
            />
            <div>
              <h3 className="font-display font-bold text-slate-900 text-base truncate">{top3[2].stageName || top3[2].name}</h3>
              <p className="text-xs text-slate-500">{top3[2].prize}</p>
              <div className="text-sm font-bold text-slate-800 mt-1">
                {displayMode === "votes"
                  ? `${(top3[2].votesTotal || 0).toLocaleString()} votes`
                  : `${getVoteShare(top3[2])}% des voix`}
              </div>
            </div>
            <Button size="sm" variant="outline" className="w-full text-xs" onClick={() => setVotingCandidate(top3[2])}>
              <Heart className="w-3.5 h-3.5 mr-1" /> Voter
            </Button>
          </div>

        </div>
      )}

      {/* Complete Data Table */}
      <div className="space-y-4">
        <h3 className="font-display font-bold text-lg text-slate-900">
          Tableau des scores & tendances
        </h3>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16 text-center">Rang</TableHead>
              <TableHead className="w-16 text-center">Évol.</TableHead>
              <TableHead>Talent</TableHead>
              <TableHead className="hidden sm:table-cell">Discipline & Prix</TableHead>
              <TableHead className="text-right">Part des Voix</TableHead>
              <TableHead className="text-right">Total Score</TableHead>
              <TableHead className="w-24 text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rankedCandidates.map((cand, index) => {
              const rank = selectedCategory === 'Tous' ? cand.globalRank : cand.currentRank;
              const percent = getVoteShare(cand);

              return (
                <TableRow key={cand.id} className={rank === 1 ? "bg-amber-50/50" : ""}>
                  <TableCell className="text-center font-bold font-display">
                    {rank === 1 ? "🥇 1" : rank === 2 ? "🥈 2" : rank === 3 ? "🥉 3" : `#${rank}`}
                  </TableCell>

                  <TableCell className="text-center">
                    {getTrendIcon(cand, index)}
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-3">
                      <img
                        src={cand.photo}
                        alt={cand.name}
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-200 shrink-0"
                      />
                      <div>
                        <Link to={`/candidat/${cand.id}`} className="font-bold text-slate-900 hover:text-amber-600 text-sm">
                          {cand.stageName || cand.name}
                        </Link>
                        <div className="text-xs text-slate-500 sm:hidden">{cand.prize}</div>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="hidden sm:table-cell text-xs text-slate-700">
                    <div>{cand.category}</div>
                    <div className="text-slate-500 text-[11px]">{cand.prize}</div>
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Progress value={percent} className="w-20 hidden md:block" />
                      <span className="text-xs font-mono text-slate-700 font-semibold">{percent}%</span>
                    </div>
                  </TableCell>

                  <TableCell className="text-right font-display font-bold text-amber-600 text-sm">
                    {(cand.votesTotal || 0).toLocaleString()}
                  </TableCell>

                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant={rank <= 3 ? "default" : "outline"}
                      className="text-xs h-8 px-3"
                      onClick={() => setVotingCandidate(cand)}
                    >
                      Voter
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Voting modal */}
      {votingCandidate && (
        <VoteModal
          candidate={votingCandidate}
          isOpen={!!votingCandidate}
          onClose={() => setVotingCandidate(null)}
        />
      )}

    </div>
  );
}
