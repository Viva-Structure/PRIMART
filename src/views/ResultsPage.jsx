import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { CATEGORIES } from '@/data/categoriesData';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Radio, Trophy } from 'lucide-react';

export function ResultsPage() {
  const { candidates, eventSettings, loading, dataError, refreshData } = useApp();
  const acceptedCandidates = candidates.filter(candidate => candidate.status === 'Accepté');

  return (
    <main className="mx-auto max-w-7xl space-y-10 px-4 py-10 sm:px-6 lg:px-8">
      <header className="mx-auto max-w-3xl space-y-4 text-center">
        <Badge variant="gold" className="text-xs">Classement PRIMART</Badge>
        <h1 className="font-display text-3xl font-extrabold text-slate-900 sm:text-5xl">Résultats & palmarès</h1>
        <p className="text-sm leading-6 text-slate-700 sm:text-base">
          Les rangs ci-dessous sont calculés par la base de données à partir des votes comptabilisés.
          {eventSettings.votesOpen
            ? ' Le classement est provisoire tant que le scrutin est ouvert.'
            : ' La clôture du scrutin ne vaut pas, à elle seule, certification officielle des lauréats.'}
        </p>
        <Link to="/direct-tv" className="mt-2 inline-flex h-9 items-center justify-center rounded-lg border border-amber-700 bg-amber-50 px-4 text-xs font-bold text-amber-900 hover:bg-amber-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-700">
          <Radio className="mr-2 h-4 w-4" aria-hidden="true" /> Ouvrir la cérémonie plein écran
        </Link>
      </header>

      {dataError && (
        <div role="alert" className="mx-auto flex max-w-2xl flex-col gap-3 rounded-2xl border border-red-300 bg-red-50 p-4 text-sm text-red-950 sm:flex-row sm:items-center sm:justify-between">
          <span>Impossible de charger les résultats.</span>
          <Button variant="outline" size="sm" onClick={() => void refreshData()} disabled={loading}>Réessayer</Button>
        </div>
      )}

      {loading ? (
        <div aria-label="Chargement des résultats" className="space-y-5">
          {CATEGORIES.slice(0, 3).map(category => (
            <div key={category.id} aria-hidden="true" className="h-48 animate-pulse rounded-3xl bg-slate-200" />
          ))}
        </div>
      ) : acceptedCandidates.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
          <Trophy className="mx-auto h-10 w-10 text-amber-700" aria-hidden="true" />
          <h2 className="mt-4 text-xl font-bold text-slate-900">Aucun résultat pour le moment</h2>
          <p className="mt-2 text-sm text-slate-700">Les candidats acceptés et leurs classements apparaîtront ici.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {CATEGORIES.map(category => {
            const rankedCandidates = acceptedCandidates
              .filter(candidate => candidate.categoryId === category.id)
              .sort((a, b) => a.currentRank - b.currentRank);

            if (rankedCandidates.length === 0) return null;

            return (
              <section key={category.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
                <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <Badge variant="purple" className="mb-2 text-xs">{category.name}</Badge>
                    <h2 className="font-display text-xl font-bold text-slate-900 sm:text-2xl">Classement par prix</h2>
                  </div>
                  <Trophy className="h-8 w-8 shrink-0 text-amber-600" aria-hidden="true" />
                </div>

                <ol className="mt-5 space-y-3">
                  {rankedCandidates.map(candidate => (
                    <li key={candidate.id} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 sm:gap-4 sm:p-4">
                      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-black ${candidate.currentRank === 1 ? 'bg-amber-300 text-slate-950' : 'bg-white text-slate-700'}`}>
                        #{candidate.currentRank}
                      </span>
                      <img
                        src={candidate.photo}
                        alt=""
                        width="48"
                        height="48"
                        loading="lazy"
                        decoding="async"
                        className="h-12 w-12 shrink-0 rounded-full object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <Link to={`/candidat/${candidate.id}`} className="truncate font-bold text-slate-900 hover:text-amber-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-700">
                          {candidate.stageName || candidate.name}
                        </Link>
                        <p className="truncate text-xs text-slate-700">{candidate.prize}</p>
                      </div>
                      {eventSettings.showExactVotes && (
                        <span className="shrink-0 text-right text-xs font-bold text-slate-700 sm:text-sm">
                          {candidate.votesTotal.toLocaleString('fr-FR')} votes
                        </span>
                      )}
                    </li>
                  ))}
                </ol>
              </section>
            );
          })}
        </div>
      )}

      <div className="text-center">
        <Link to="/classement" className="inline-flex items-center gap-2 font-semibold text-amber-800 hover:text-amber-950">
          Consulter le classement complet <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </main>
  );
}

export default ResultsPage;
