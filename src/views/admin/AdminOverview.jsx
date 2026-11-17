import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { useApp } from '@/context/AppContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Trophy,
  Users,
  CreditCard,
  ShieldAlert,
  Flame,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  BarChart3,
  Activity
} from 'lucide-react';

const ACTIVITY_SERIES = [
  { key: 'candidates', label: 'Candidatures', color: '#6366f1' },
  { key: 'payments', label: 'Paiements réussis', color: '#d6a64f' },
  { key: 'alerts', label: 'Alertes anti-fraude', color: '#f87171' },
];

function localDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function ActivityChart({ data }) {
  const width = 560;
  const height = 220;
  const left = 32;
  const right = 12;
  const top = 14;
  const bottom = 34;
  const chartWidth = width - left - right;
  const chartHeight = height - top - bottom;
  const maxValue = Math.max(1, ...data.flatMap(day => ACTIVITY_SERIES.map(series => day[series.key])));
  const hasActivity = data.some(day => ACTIVITY_SERIES.some(series => day[series.key] > 0));
  const x = (index) => left + (chartWidth * index) / Math.max(data.length - 1, 1);
  const y = (value) => top + chartHeight - (value / maxValue) * chartHeight;

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-x-5 gap-y-2" aria-label="Légende">
        {ACTIVITY_SERIES.map(series => (
          <span key={series.key} className="flex items-center gap-2 text-xs text-slate-600">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: series.color }} />
            {series.label}
          </span>
        ))}
      </div>
      {hasActivity ? (
        <svg
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label="Évolution quotidienne des candidatures, paiements réussis et alertes anti-fraude sur les sept derniers jours"
          className="block h-auto w-full overflow-visible"
        >
          {[0, 0.5, 1].map(ratio => {
            const gridY = top + chartHeight * ratio;
            return (
              <g key={ratio}>
                <line x1={left} x2={width - right} y1={gridY} y2={gridY} stroke="#e2e8f0" strokeDasharray="4 4" />
                <text x={left - 8} y={gridY + 4} textAnchor="end" fill="#94a3b8" fontSize="10">
                  {Math.round(maxValue * (1 - ratio))}
                </text>
              </g>
            );
          })}
          {ACTIVITY_SERIES.map(series => {
            const points = data.map((day, index) => `${x(index)},${y(day[series.key])}`).join(' ');
            return (
              <g key={series.key}>
                <polyline points={points} fill="none" stroke={series.color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
                {data.map((day, index) => (
                  <circle key={day.key} cx={x(index)} cy={y(day[series.key])} r="3.5" fill="white" stroke={series.color} strokeWidth="2" />
                ))}
              </g>
            );
          })}
          {data.map((day, index) => (
            <text key={day.key} x={x(index)} y={height - 8} textAnchor="middle" fill="#64748b" fontSize="10">
              {day.label}
            </text>
          ))}
        </svg>
      ) : (
        <p className="rounded-xl bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
          Aucune activité enregistrée sur les sept derniers jours.
        </p>
      )}
    </div>
  );
}

function VoteMixChart({ freeVotes, paidVotes }) {
  const total = freeVotes + paidVotes;
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const freeLength = total > 0 ? (freeVotes / total) * circumference : 0;
  const paidLength = total > 0 ? (paidVotes / total) * circumference : 0;

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row sm:justify-center">
      <svg viewBox="0 0 120 120" role="img" aria-label={`Répartition des votes : ${freeVotes} gratuits et ${paidVotes} payants`} className="h-36 w-36 shrink-0">
        <circle cx="60" cy="60" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="14" />
        {total > 0 && (
          <>
            <circle
              cx="60" cy="60" r={radius} fill="none" stroke="#6366f1" strokeWidth="14"
              strokeDasharray={`${freeLength} ${circumference - freeLength}`} transform="rotate(-90 60 60)"
            />
            <circle
              cx="60" cy="60" r={radius} fill="none" stroke="#d6a64f" strokeWidth="14"
              strokeDasharray={`${paidLength} ${circumference - paidLength}`}
              strokeDashoffset={-freeLength} transform="rotate(-90 60 60)"
            />
          </>
        )}
        <text x="60" y="57" textAnchor="middle" fill="#0f172a" fontSize="18" fontWeight="700">
          {total.toLocaleString('fr-FR')}
        </text>
        <text x="60" y="74" textAnchor="middle" fill="#64748b" fontSize="9">votes</text>
      </svg>
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-6 text-sm">
          <span className="flex items-center gap-2 text-slate-600"><span className="h-2.5 w-2.5 rounded-full bg-indigo-500" />Gratuits</span>
          <strong className="text-slate-900">{freeVotes.toLocaleString('fr-FR')}</strong>
        </div>
        <div className="flex items-center justify-between gap-6 text-sm">
          <span className="flex items-center gap-2 text-slate-600"><span className="h-2.5 w-2.5 rounded-full bg-amber-500" />Payants</span>
          <strong className="text-slate-900">{paidVotes.toLocaleString('fr-FR')}</strong>
        </div>
        {total === 0 && <p className="text-xs text-slate-500">Aucun vote enregistré pour le moment.</p>}
      </div>
    </div>
  );
}

export default function AdminOverview() {
  const {
    candidates,
    transactions,
    suspectVotes,
    totalVotesCount,
    totalFreeVotesCount,
    totalPaidVotesCount,
    totalRevenueFCFA,
    eventSettings
  } = useApp();

  const pendingCandidates = candidates.filter(c => c.status === "En attente" || c.status === "Correction demandée");
  const quarantinedVotes = suspectVotes.filter(s => s.status === "En quarantaine");

  const freePercent = totalVotesCount > 0 ? Math.round((totalFreeVotesCount / totalVotesCount) * 100) : 0;
  const paidPercent = totalVotesCount > 0 ? Math.round((totalPaidVotesCount / totalVotesCount) * 100) : 0;

  const activityByDay = useMemo(() => {
    const today = new Date();
    const days = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(today);
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() - (6 - index));
      return {
        key: localDateKey(date),
        label: date.toLocaleDateString('fr-FR', { weekday: 'short' }).replace('.', ''),
        candidates: 0,
        payments: 0,
        alerts: 0,
      };
    });
    const daysByKey = new Map(days.map(day => [day.key, day]));

    const increment = (value, key) => {
      if (!value) return;
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return;
      const day = daysByKey.get(localDateKey(date));
      if (day) day[key] += 1;
    };

    candidates.forEach(candidate => increment(candidate.registeredAt, 'candidates'));
    transactions
      .filter(transaction => transaction.status === 'Réussie')
      .forEach(transaction => increment(transaction.date, 'payments'));
    suspectVotes.forEach(vote => increment(vote.timestamp, 'alerts'));

    return days;
  }, [candidates, transactions, suspectVotes]);

  const votesByCategory = useMemo(() => {
    const totals = new Map();
    candidates.forEach(candidate => {
      const category = candidate.category || 'Autres';
      totals.set(category, (totals.get(category) || 0) + (Number(candidate.votesTotal) || 0));
    });
    return [...totals.entries()]
      .map(([category, votes]) => ({ category, votes }))
      .sort((a, b) => b.votes - a.votes)
      .slice(0, 6);
  }, [candidates]);
  const maxCategoryVotes = Math.max(0, ...votesByCategory.map(category => category.votes));

  return (
    <AdminLayout>
      <div className="space-y-8">
        
        {/* Header banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
                Tableau de Bord de Pilotage
              </h1>
              <Badge variant={eventSettings.votesOpen ? "live" : "secondary"}>
                {eventSettings.votesOpen ? "Votes en cours" : "Votes fermés"}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Supervision globale des candidatures, des flux de vote et des revenus de l'événement.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link to="/admin/moderation">
              <Button size="sm" variant="gold" className="text-xs font-bold">
                Modérer les dossiers ({pendingCandidates.length})
              </Button>
            </Link>
          </div>
        </div>

        {/* 4 Primary KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Revenue */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
              <span>Revenus Collectés</span>
              <CreditCard className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-display">
              {totalRevenueFCFA.toLocaleString()} <span className="text-xs font-normal text-slate-400">FCFA</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {transactions.filter(t => t.status === "Réussie").length} transactions Mobile Money / CB
            </p>
          </div>

          {/* Total Votes */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
              <span>Total Votes Cumulés</span>
              <Flame className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
              {totalVotesCount.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-500 mt-1 flex justify-between">
              <span>Gratuits : {freePercent}%</span>
              <span className="text-amber-600 font-semibold">Payants : {paidPercent}%</span>
            </div>
          </div>

          {/* Candidates */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
              <span>Dossiers Candidats</span>
              <Users className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
              {candidates.length}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              <strong className="text-emerald-600">{candidates.filter(c => c.status === "Accepté").length} validés</strong> • {pendingCandidates.length} en attente
            </p>
          </div>

          {/* Anti-fraud alerts */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
              <span>Alertes Anti-Fraude</span>
              <ShieldAlert className="w-4 h-4 text-red-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-red-400 font-display">
              {quarantinedVotes.length}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {quarantinedVotes.length > 0 ? "Votes suspects en quarantaine" : "Aucun vote suspect détecté"}
            </p>
          </div>

        </div>

        <section aria-labelledby="statistics-title" className="space-y-4">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-amber-600" />
            <div>
              <h2 id="statistics-title" className="font-display text-lg font-bold text-slate-900">Statistiques de l’événement</h2>
              <p className="text-xs text-slate-500">Suivi visuel de l’activité récente et des votes cumulés de la plateforme.</p>
            </div>
          </div>

          <Card className="rounded-2xl border-slate-200 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm text-slate-800">
                <TrendingUp className="h-4 w-4 text-indigo-500" />
                Activité de la plateforme — 7 derniers jours
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ActivityChart data={activityByDay} />
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <Card className="rounded-2xl border-slate-200 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm text-slate-800">
                  <BarChart3 className="h-4 w-4 text-amber-600" />
                  Votes cumulés par catégorie
                </CardTitle>
              </CardHeader>
              <CardContent>
                {votesByCategory.length > 0 && maxCategoryVotes > 0 ? (
                  <div className="space-y-4">
                    {votesByCategory.map(({ category, votes }) => (
                      <div key={category}>
                        <div className="mb-1.5 flex justify-between gap-3 text-xs">
                          <span className="truncate text-slate-600">{category}</span>
                          <strong className="shrink-0 text-slate-800">{votes.toLocaleString('fr-FR')}</strong>
                        </div>
                        <div
                          className="h-2.5 overflow-hidden rounded-full bg-slate-100"
                          role="img"
                          aria-label={`${category} : ${votes.toLocaleString('fr-FR')} votes`}
                        >
                          <div className="h-full rounded-full bg-amber-500" style={{ width: `${(votes / maxCategoryVotes) * 100}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="py-10 text-center text-sm text-slate-500">Aucun vote par catégorie à afficher pour le moment.</p>
                )}
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-slate-200 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-slate-800">Répartition des votes</CardTitle>
              </CardHeader>
              <CardContent>
                <VoteMixChart freeVotes={totalFreeVotesCount} paidVotes={totalPaidVotesCount} />
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Action Banners & Queues */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Pending Candidates Queue */}
          <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-500" />
                <h3 className="font-display font-bold text-base text-slate-900">File de Modération Candidats</h3>
              </div>
              <Link to="/admin/moderation" className="text-xs text-amber-600 hover:underline flex items-center">
                Gérer <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </div>

            {pendingCandidates.length > 0 ? (
              <div className="space-y-2.5">
                {pendingCandidates.slice(0, 3).map(c => (
                  <div key={c.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img src={c.photo} alt={c.name} className="w-9 h-9 rounded-full object-cover" />
                      <div>
                        <div className="font-bold text-slate-900 text-xs">{c.stageName || c.name}</div>
                        <div className="text-[11px] text-slate-500">{c.category} • {c.prize}</div>
                      </div>
                    </div>
                    <Badge variant={c.status === "Correction demandée" ? "destructive" : "secondary"} className="text-[10px]">
                      {c.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 py-6 text-center">Toutes les candidatures ont été traitées !</p>
            )}
          </div>

          {/* Anti-Fraud Quarantine Alert */}
          <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-500" />
                <h3 className="font-display font-bold text-base text-slate-900">File Anti-Fraude & Quarantaine</h3>
              </div>
              <Link to="/admin/votes" className="text-xs text-red-500 hover:underline flex items-center">
                Examiner <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </div>

            {quarantinedVotes.length > 0 ? (
              <div className="space-y-2.5">
                {quarantinedVotes.map(s => (
                  <div key={s.id} className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs space-y-1">
                    <div className="flex justify-between font-bold text-red-300">
                      <span>Candidat ciblé : {s.candidateName}</span>
                      <span className="font-mono text-[10px]">{s.id}</span>
                    </div>
                    <p className="text-slate-600 text-[11px]">{s.reason}</p>
                    <div className="text-[10px] text-slate-400">IP : {s.ipAddress} • {new Date(s.timestamp).toLocaleTimeString()}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 py-6 text-center">Aucun incident de sécurité en cours.</p>
            )}
          </div>

        </div>

      </div>
    </AdminLayout>
  );
}
