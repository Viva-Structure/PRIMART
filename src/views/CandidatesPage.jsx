import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { CATEGORIES } from '@/data/categoriesData';
import { CandidateCard } from '@/components/shared/CandidateCard';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, RotateCcw, Users } from 'lucide-react';

export default function CandidatesPage() {
  const { candidates } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();

  const categoryParam = searchParams.get('category') || 'Tous';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [selectedPrize, setSelectedPrize] = useState('Tous');
  const [sortBy, setSortBy] = useState('popular'); // popular, alpha, recent

  // Only accepted candidates are visible publicly (rule 2 of specs)
  const acceptedCandidates = useMemo(() => {
    return candidates.filter(c => c.status === "Accepté");
  }, [candidates]);

  // List of unique prizes for current category
  const availablePrizes = useMemo(() => {
    if (selectedCategory === 'Tous') {
      return CATEGORIES.flatMap(c => c.prizes);
    }
    const cat = CATEGORIES.find(c => c.name === selectedCategory);
    return cat ? cat.prizes : [];
  }, [selectedCategory]);

  // Filter & Sort
  const filteredCandidates = useMemo(() => {
    return acceptedCandidates
      .filter(c => {
        // Search query
        const matchSearch =
          (c.stageName && c.stageName.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (c.name && c.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (c.city && c.city.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (c.country && c.country.toLowerCase().includes(searchQuery.toLowerCase()));

        // Category filter
        const matchCategory = selectedCategory === 'Tous' || c.category === selectedCategory;

        // Prize filter
        const matchPrize = selectedPrize === 'Tous' || c.prize === selectedPrize;

        return matchSearch && matchCategory && matchPrize;
      })
      .sort((a, b) => {
        if (sortBy === 'popular') {
          return selectedCategory === 'Tous'
            ? a.globalRank - b.globalRank
            : a.currentRank - b.currentRank;
        }
        if (sortBy === 'alpha') return (a.stageName || a.name).localeCompare(b.stageName || b.name);
        if (sortBy === 'recent') return new Date(b.registeredAt || 0) - new Date(a.registeredAt || 0);
        return 0;
      });
  }, [acceptedCandidates, searchQuery, selectedCategory, selectedPrize, sortBy]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('Tous');
    setSelectedPrize('Tous');
    setSortBy('popular');
    setSearchParams({});
  };

  const handleCategoryChange = (catName) => {
    setSelectedCategory(catName);
    setSelectedPrize('Tous');
    if (catName === 'Tous') {
      setSearchParams({});
    } else {
      setSearchParams({ category: catName });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Page Title & Stats */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-amber-600 text-xs font-bold uppercase tracking-wider mb-1">
            <Users className="w-4 h-4" /> Galerie Officielle des Talents
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-display">
            Votez pour vos Talents Favoris
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Découvrez les talents en lice, écoutez leurs créations et faites la différence avec vos votes.
          </p>
        </div>

        <div className="text-sm text-slate-700 bg-white border border-slate-200 shadow-xs px-4 py-2 rounded-xl self-start md:self-auto">
          <strong className="text-amber-600 font-bold">{filteredCandidates.length}</strong> / {acceptedCandidates.length} candidats visibles
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => handleCategoryChange('Tous')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === 'Tous'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80 border border-slate-200'
            }`}
          >
            Toutes les Catégories
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.name)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat.name
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80 border border-slate-200'
              }`}
            >
              {cat.name} ({cat.prizesCount})
            </button>
          ))}
        </div>

        {/* Inputs row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Rechercher par nom, ville, pays..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>

          {/* Specific prize selector */}
          <div>
            <Select
              value={selectedPrize}
              onChange={(e) => setSelectedPrize(e.target.value)}
              className="text-xs"
            >
              <option value="Tous">Tous les prix de la catégorie</option>
              {availablePrizes.map((prize, idx) => (
                <option key={idx} value={prize}>{prize}</option>
              ))}
            </Select>
          </div>

          {/* Sort order */}
          <div>
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs"
            >
              <option value="popular">Trier par Popularité (Plus votés)</option>
              <option value="alpha">Trier par Ordre Alphabétique (A-Z)</option>
              <option value="recent">Trier par Inscription Récente</option>
            </Select>
          </div>

          {/* Reset button */}
          <Button
            variant="outline"
            size="default"
            onClick={resetFilters}
            className="text-xs border-slate-200 hover:bg-slate-50 text-slate-700 flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Réinitialiser les filtres
          </Button>
        </div>

      </div>

      {/* Candidates Grid */}
      {filteredCandidates.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCandidates.map(candidate => (
            <CandidateCard key={candidate.id} candidate={candidate} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white border border-slate-200 shadow-xs rounded-3xl p-8 space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
            <Users className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 font-display">Aucun candidat trouvé</h3>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            Aucun profil ne correspond à vos critères de recherche. Essayez d'ajuster ou de réinitialiser vos filtres.
          </p>
          <Button variant="outlineGold" size="sm" onClick={resetFilters} className="text-xs">
            Afficher tous les candidats
          </Button>
        </div>
      )}

    </div>
  );
}
