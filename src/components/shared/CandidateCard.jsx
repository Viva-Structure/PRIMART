import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { VoteModal } from './VoteModal';
import { ShareModal } from './ShareModal';
import { Share2, Heart, Trophy, ArrowUpRight, CheckCircle } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export function CandidateCard({ candidate }) {
  const [isVoteOpen, setIsVoteOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const { eventSettings } = useApp();

  const getRankBadge = (rank) => {
    if (rank === 1) return <span className="bg-amber-400 text-black text-xs font-black px-2 py-0.5 rounded-full shadow-md flex items-center gap-1">🥇 #1</span>;
    if (rank === 2) return <span className="bg-slate-300 text-black text-xs font-black px-2 py-0.5 rounded-full shadow-md flex items-center gap-1">🥈 #2</span>;
    if (rank === 3) return <span className="bg-amber-700 text-white text-xs font-black px-2 py-0.5 rounded-full shadow-md flex items-center gap-1">🥉 #3</span>;
    if (rank > 0) return <span className="bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold px-2 py-0.5 rounded-full shadow-2xs">#{rank}</span>;
    return null;
  };

  return (
    <>
      <Card className="group overflow-hidden border-slate-200/80 bg-white hover:border-amber-400 hover:shadow-xl hover:shadow-amber-500/10 transition-all duration-300 flex flex-col justify-between shadow-xs">
        <div>
          {/* Candidate Image & Overlays */}
          <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
            <img
              src={candidate.photo}
              alt={candidate.stageName || candidate.name}
              width="800"
              height="600"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
              decoding="async"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

            {/* Top badges */}
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
              <Badge variant="purple" className="text-[11px] font-semibold backdrop-blur-md">
                {candidate.category}
              </Badge>
              {getRankBadge(candidate.currentRank)}
            </div>

            {/* Quick Share floating button */}
            <button
              type="button"
              onClick={() => setIsShareOpen(true)}
              aria-label={`Partager le profil de ${candidate.stageName || candidate.name}`}
              className="absolute bottom-3 right-3 rounded-full border border-slate-200 bg-white/90 p-2 text-slate-800 shadow-xs backdrop-blur-md transition-all hover:bg-white hover:text-slate-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-700"
              title="Partager le profil"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>

          {/* Body Content */}
          <CardContent className="p-4 pt-3 space-y-2.5">
            <div>
              <Link to={`/candidat/${candidate.id}`} className="hover:underline flex items-center justify-between">
                <h3 className="font-display font-bold text-lg text-slate-900 group-hover:text-amber-600 transition-colors truncate">
                  {candidate.stageName || candidate.name}
                </h3>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 transition-colors" />
              </Link>
              <p className="text-xs text-slate-500 truncate">
                {candidate.city ? `${candidate.city}, ` : ''}{candidate.country}
              </p>
            </div>

            {/* Prize category */}
            <div className="text-xs bg-amber-50/70 rounded-xl p-2 border border-amber-200/60 text-slate-700 flex items-center gap-1.5 truncate">
              <Trophy className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span className="truncate font-medium">{candidate.prize}</span>
            </div>

            {/* Votes tally */}
            {eventSettings.showExactVotes && (
              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                <span className="text-slate-500">Total votes :</span>
                <span className="font-bold text-amber-600 font-display text-sm">
                  {(candidate.votesTotal || 0).toLocaleString()} <span className="text-[10px] text-slate-400 font-normal">pts</span>
                </span>
              </div>
            )}
          </CardContent>
        </div>

        {/* Footer Actions */}
        <div className="p-4 pt-0">
          <Button
            onClick={() => setIsVoteOpen(true)}
            variant="default"
            className="w-full text-xs font-bold focus-visible:ring-2 focus-visible:ring-amber-700 focus-visible:ring-offset-2"
          >
            <Heart className="w-3.5 h-3.5 mr-1.5 text-black fill-black" />
            Voter pour {candidate.stageName ? candidate.stageName.split(' ')[0] : 'ce talent'}
          </Button>
        </div>
      </Card>

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
    </>
  );
}
