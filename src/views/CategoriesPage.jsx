import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CATEGORIES } from '@/data/categoriesData';
import { useApp } from '@/context/AppContext';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Trophy,
  Music,
  Sparkles,
  Palette,
  Briefcase,
  Search,
  ArrowRight,
  Award
} from 'lucide-react';

export default function CategoriesPage() {
  const { candidates } = useApp();
  const [searchPrize, setSearchPrize] = useState('');

  const getCategoryIcon = (id) => {
    switch (id) {
      case 'musique': return <Music className="w-5 h-5 text-amber-400" />;
      case 'danse': return <Sparkles className="w-5 h-5 text-amber-400" />;
      case 'arts': return <Palette className="w-5 h-5 text-amber-400" />;
      case 'industrie': return <Briefcase className="w-5 h-5 text-amber-400" />;
      default: return <Trophy className="w-5 h-5 text-amber-400" />;
    }
  };

  const getCandidatesCountForPrize = (prizeName) => {
    return candidates.filter(c => c.prize === prizeName && c.status === "Accepté").length;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <Badge variant="purple" className="text-xs">Palmarès Officiel PRIMART 2028</Badge>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 font-display">
          52 Prix d'Excellence & 5 Catégories
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          Découvrez la liste exhaustive des 52 trophées décernés lors de la grande cérémonie. Chaque prix met en lumière une facette unique de la créativité africaine.
        </p>

        {/* Search inside prizes */}
        <div className="pt-4 max-w-md mx-auto relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Rechercher un prix spécifique (ex: Beatmaker, Drill, Photographe...)"
            value={searchPrize}
            onChange={(e) => setSearchPrize(e.target.value)}
            className="pl-10 text-xs"
          />
        </div>
      </div>

      {/* Categories Loop */}
      <div className="space-y-10">
        {CATEGORIES.map(category => {
          const matchingPrizes = category.prizes.filter(prize =>
            prize.toLowerCase().includes(searchPrize.toLowerCase())
          );

          if (searchPrize && matchingPrizes.length === 0) return null;

          return (
            <div
              key={category.id}
              className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6"
            >
              {/* Category banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center">
                    {getCategoryIcon(category.id)}
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">
                      {category.name}
                    </h2>
                    <p className="text-xs text-slate-600 mt-0.5">{category.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <Badge variant="gold" className="text-xs">
                    {category.prizesCount} Prix
                  </Badge>
                  <Link to={`/candidats?category=${category.name}`}>
                    <Button size="sm" variant="outline" className="text-xs">
                      Voir les candidats
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Grid of Prizes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {matchingPrizes.map((prize, idx) => {
                  const candidateCount = getCandidatesCountForPrize(prize);
                  return (
                    <Link
                      key={idx}
                      to={`/candidats?category=${category.name}`}
                      className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200 hover:border-amber-400 hover:bg-amber-50/40 transition-all group flex items-center justify-between shadow-2xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Award className="w-4 h-4 text-amber-500 shrink-0 group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-semibold text-slate-800 group-hover:text-amber-700 transition-colors truncate">
                          {prize}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-600 shrink-0 ml-2 bg-white px-2 py-0.5 rounded-full border border-slate-200 font-medium">
                        {candidateCount} en liste
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
