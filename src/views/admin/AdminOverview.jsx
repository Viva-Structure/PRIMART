import React from 'react';
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
  AlertTriangle
} from 'lucide-react';

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
