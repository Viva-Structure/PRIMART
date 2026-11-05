import { AdminLayout } from '@/components/layout/AdminLayout';
import { useApp } from '@/context/AppContext';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Download,
  Filter,
  Lock,
  Search,
  Radio
} from 'lucide-react';

export default function AdminVotes() {
  const { suspectVotes, auditLogs, resolveSuspectVote, showToast, eventSettings } = useApp();

  const exportAuditCSV = () => {
    const escapeCsv = value => `"${String(value ?? '').replaceAll('"', '""')}"`;
    const rows = [
      ['ID', 'Date', 'Action', 'Type', 'Identifiant'],
      ...auditLogs.map(log => [
        log.id,
        new Date(log.createdAt).toISOString(),
        log.action,
        log.entity,
        log.entityId,
      ]),
    ];
    const csvContent = `data:text/csv;charset=utf-8,${rows.map(row => row.map(escapeCsv).join(',')).join('\n')}`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `primart_audit_votes_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    showToast("Export CSV généré", "Le fichier d'audit des votes a été téléchargé.", "success");
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-500" />
              <h1 className="text-2xl font-extrabold text-slate-900 font-display">
                Votes & Module Anti-Fraude
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Surveillance algorithmique, quarantaine des votes suspects et journal immuable d'audit.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={exportAuditCSV} className="text-xs text-slate-500">
              <Download className="w-3.5 h-3.5 mr-1 text-amber-400" />
              Exporter Journal CSV
            </Button>
          </div>
        </div>

        {/* Anti-Fraud Metrics & Rate Limit settings */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
            <div className="text-xs text-slate-500 font-semibold">Limite de Débit (Rate Limit)</div>
            <div className="text-lg font-bold text-slate-900">{eventSettings.freeVotesDailyQuota} vote / 24h / compte vérifié</div>
            <p className="text-[11px] text-slate-500">Quota contrôlé côté base après code OTP</p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
            <div className="text-xs text-slate-500 font-semibold">Filtrage Numéros Jetables</div>
            <div className="text-lg font-bold text-slate-900">E-mail ou SMS par code OTP</div>
            <p className="text-[11px] text-slate-500">Le filtrage avancé anti-fraude reste à configurer</p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
            <div className="text-xs text-slate-500 font-semibold">En Quarantaine Actuelle</div>
            <div className="text-lg font-bold text-red-600">
              {suspectVotes.filter(s => s.status === "En quarantaine").length} incidents
            </div>
            <p className="text-[11px] text-slate-500">En attente de décision humaine</p>
          </div>
        </div>

        {/* Section 1: Quarantined Suspect Votes */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            File de Revue des Votes Suspects en Quarantaine
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID & Heure</TableHead>
                <TableHead>Candidat Visé</TableHead>
                <TableHead>Motif de Détection Anti-Fraude</TableHead>
                <TableHead>Origine Technique</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Décision</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {suspectVotes.map(suspect => (
                <TableRow key={suspect.id}>
                  <TableCell className="font-mono text-xs">
                    <div className="font-bold text-slate-900">{suspect.id}</div>
                    <div className="text-[10px] text-slate-500">{new Date(suspect.timestamp).toLocaleTimeString()}</div>
                  </TableCell>

                  <TableCell className="text-xs font-semibold text-slate-800">
                    {suspect.candidateName}
                  </TableCell>

                  <TableCell className="text-xs text-red-600 max-w-xs">
                    {suspect.reason}
                  </TableCell>

                  <TableCell className="text-xs font-mono text-slate-500">
                    <div>IP : {suspect.ipAddress}</div>
                    <div className="text-[10px] text-slate-400 truncate max-w-[120px]">{suspect.deviceFingerprint}</div>
                  </TableCell>

                  <TableCell>
                    <Badge variant={suspect.status === "En quarantaine" ? "destructive" : suspect.status === "Validé" ? "success" : "secondary"}>
                      {suspect.status}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-right">
                    {suspect.status === "En quarantaine" ? (
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="default"
                          onClick={async () => {
                            try {
                              await resolveSuspectVote(suspect.id, 'validate');
                            } catch (error) {
                              showToast('Action impossible', error.message, 'destructive');
                            }
                          }}
                          className="text-xs h-7 px-2.5 bg-emerald-600 hover:bg-emerald-500 text-white"
                        >
                          Valider
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={async () => {
                            try {
                              await resolveSuspectVote(suspect.id, 'cancel');
                            } catch (error) {
                              showToast('Action impossible', error.message, 'destructive');
                            }
                          }}
                          className="text-xs h-7 px-2"
                        >
                          Annuler
                        </Button>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-500">Traité</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Section 2: Audit Logs Trail */}
        <div className="space-y-3 pt-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <Radio className="w-4 h-4 text-emerald-500" />
            Flux d'Audit des Votes en Temps Réel
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 font-mono text-xs space-y-2">
            {auditLogs.length ? auditLogs.map(log => (
              <div key={log.id} className="flex items-center justify-between gap-3 border-b border-slate-200 pb-1.5 text-slate-700">
                <span className="text-slate-400">{new Date(log.createdAt).toLocaleString()}</span>
                <span className="text-amber-700 font-bold">{log.action}</span>
                <span>{log.entity} <strong className="text-slate-900">{log.entityId}</strong></span>
              </div>
            )) : <p className="text-slate-500">Aucune action réelle enregistrée pour le moment.</p>}
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}
