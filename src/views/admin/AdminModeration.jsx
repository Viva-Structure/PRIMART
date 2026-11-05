import React, { useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { useApp } from '@/context/AppContext';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  PauseCircle,
  Eye,
  Search,
  Filter,
  UserCheck
} from 'lucide-react';

export default function AdminModeration() {
  const { candidates, moderateCandidate, showToast } = useApp();

  const [statusFilter, setStatusFilter] = useState("Tous");
  const [search, setSearch] = useState("");
  const [previewCandidate, setPreviewCandidate] = useState(null);
  
  // Rejection modal
  const [rejectingCandidate, setRejectingCandidate] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const filteredCandidates = candidates.filter(c => {
    const matchStatus = statusFilter === "Tous" || c.status === statusFilter;
    const matchSearch =
      (c.stageName && c.stageName.toLowerCase().includes(search.toLowerCase())) ||
      (c.name && c.name.toLowerCase().includes(search.toLowerCase())) ||
      (c.prize && c.prize.toLowerCase().includes(search.toLowerCase()));
    return matchStatus && matchSearch;
  });

  const handleModeration = async (candidateId, status, reason = "") => {
    try {
      await moderateCandidate(candidateId, status, reason);
    } catch (error) {
      showToast('Action de modération impossible', error.message, 'destructive');
    }
  };

  const handleAccept = async (candidateId) => {
    await handleModeration(candidateId, "Accepté");
  };

  const handleRequestCorrection = async (candidateId) => {
    const reason = prompt("Précisez la correction demandée au candidat (ex: pièce d'identité floue, photo non conforme) :");
    if (reason) {
      await handleModeration(candidateId, "Correction demandée", reason);
    }
  };

  const handleOpenRejectModal = (candidate) => {
    setRejectingCandidate(candidate);
    setRejectionReason("");
  };

  const handleConfirmReject = async (e) => {
    e.preventDefault();
    if (!rejectionReason.trim()) return;
    await handleModeration(rejectingCandidate.id, "Refusé", rejectionReason);
    setRejectingCandidate(null);
  };

  const handleSuspend = async (candidateId, currentStatus) => {
    const newStatus = currentStatus === "Suspendu" ? "Accepté" : "Suspendu";
    await handleModeration(candidateId, newStatus);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Accepté":
        return <Badge variant="success">Accepté (Visible)</Badge>;
      case "En attente":
        return <Badge variant="secondary">En attente</Badge>;
      case "Correction demandée":
        return <Badge variant="warning">Correction demandée</Badge>;
      case "Refusé":
        return <Badge variant="destructive">Refusé</Badge>;
      case "Suspendu":
        return <Badge variant="destructive">Suspendu</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-amber-500" />
              <h1 className="text-2xl font-extrabold text-slate-900 font-display">
                Modération des Candidatures
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Validation juridique et artistique des dossiers avant publication publique.
            </p>
          </div>

          <div className="text-xs text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-xl">
            Total : <strong>{filteredCandidates.length}</strong> dossiers
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Rechercher par nom, prix..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>

          <div>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs"
            >
              <option value="Tous">Tous les statuts</option>
              <option value="En attente">En attente de modération</option>
              <option value="Accepté">Accepté (En ligne)</option>
              <option value="Correction demandée">Correction demandée</option>
              <option value="Refusé">Refusé</option>
              <option value="Suspendu">Suspendu</option>
            </Select>
          </div>
        </div>

        {/* Candidature Table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Candidat</TableHead>
              <TableHead>Catégorie & Prix</TableHead>
              <TableHead>Origine</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions de modération</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCandidates.map(cand => (
              <TableRow key={cand.id}>
                
                {/* Talent */}
                <TableCell>
                  <div className="flex items-center gap-3">
                    <img
                      src={cand.photo}
                      alt={cand.name}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-200 shrink-0"
                    />
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{cand.stageName || cand.name}</div>
                      <div className="text-slate-500 text-xs">{cand.name}</div>
                    </div>
                  </div>
                </TableCell>

                {/* Category & Prize */}
                <TableCell className="text-xs">
                  <div className="text-slate-800 font-medium">{cand.category}</div>
                  <div className="text-slate-500 text-[11px]">{cand.prize}</div>
                </TableCell>

                {/* Country */}
                <TableCell className="text-xs text-slate-600">
                  {cand.city ? `${cand.city}, ` : ''}{cand.country}
                </TableCell>

                {/* Status */}
                <TableCell>
                  {getStatusBadge(cand.status)}
                </TableCell>

                {/* Actions */}
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    
                    {/* View full dossier */}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setPreviewCandidate(cand)}
                      className="h-8 w-8 p-0"
                      title="Aperçu du dossier"
                    >
                      <Eye className="w-4 h-4 text-slate-300" />
                    </Button>

                    {/* Accept */}
                    {cand.status !== "Accepté" && (
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => handleAccept(cand.id)}
                        className="text-xs h-8 px-2.5 bg-emerald-600 hover:bg-emerald-500 text-white"
                        title="Accepter et publier"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Valider
                      </Button>
                    )}

                    {/* Request corrections */}
                    {cand.status === "En attente" && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleRequestCorrection(cand.id)}
                        className="text-xs h-8 px-2 text-amber-300 border-amber-500/30"
                        title="Demander des corrections"
                      >
                        Corriger
                      </Button>
                    )}

                    {/* Refuse */}
                    {cand.status !== "Refusé" && cand.status !== "Accepté" && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleOpenRejectModal(cand)}
                        className="text-xs h-8 px-2"
                        title="Refuser avec motif obligatoire"
                      >
                        Refuser
                      </Button>
                    )}

                    {/* Suspend / Unsuspend */}
                    {cand.status === "Accepté" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSuspend(cand.id, cand.status)}
                        className="text-xs h-8 px-2 text-slate-400 hover:text-red-400"
                        title="Suspendre temporairement"
                      >
                        <PauseCircle className="w-3.5 h-3.5 mr-1" /> Suspendre
                      </Button>
                    )}
                    {cand.status === "Suspendu" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSuspend(cand.id, cand.status)}
                        className="text-xs h-8 px-2 text-emerald-400"
                      >
                        Réactiver
                      </Button>
                    )}

                  </div>
                </TableCell>

              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Modal: Preview Candidate Dossier */}
        {previewCandidate && (
          <Dialog open={!!previewCandidate} onOpenChange={() => setPreviewCandidate(null)}>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Dossier : {previewCandidate.stageName || previewCandidate.name}</DialogTitle>
                <DialogDescription>
                  Inscrit le {new Date(previewCandidate.registeredAt).toLocaleString()}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 text-xs text-slate-600 py-2">
                <div className="flex gap-4">
                  <img src={previewCandidate.photo} alt="" className="w-20 h-20 rounded-xl object-cover ring-2 ring-slate-200" />
                  <div className="space-y-1">
                    <p><strong className="text-slate-900">Nom civil :</strong> {previewCandidate.name}</p>
                    <p><strong className="text-slate-900">Âge :</strong> {previewCandidate.age || '-'} ans</p>
                    <p><strong className="text-slate-900">Localisation :</strong> {previewCandidate.city}, {previewCandidate.country}</p>
                    <p><strong className="text-slate-900">E-mail :</strong> {previewCandidate.email || 'Non renseigné'}</p>
                    <p><strong className="text-slate-900">Téléphone :</strong> {previewCandidate.phone || 'Non renseigné'}</p>
                  </div>
                </div>

                <div className="space-y-1 bg-amber-50 p-3 rounded-xl border border-amber-200">
                  <span className="font-bold text-amber-700">Catégorie & Prix :</span>
                  <p className="text-slate-900 font-medium">{previewCandidate.category} — {previewCandidate.prize}</p>
                </div>

                <div className="space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="font-bold text-slate-600">Biographie :</span>
                  <p className="text-slate-700 leading-relaxed">{previewCandidate.bio}</p>
                </div>

                {previewCandidate.rejectionReason && (
                  <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-200">
                    <strong>Motif notifié :</strong> {previewCandidate.rejectionReason}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => setPreviewCandidate(null)}>
                  Fermer
                </Button>
                {previewCandidate.status !== "Accepté" && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => {
                      handleAccept(previewCandidate.id);
                      setPreviewCandidate(null);
                    }}
                    className="bg-emerald-600 hover:bg-emerald-500"
                  >
                    Valider le profil
                  </Button>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Modal: Mandatory Rejection Motive */}
        {rejectingCandidate && (
          <Dialog open={!!rejectingCandidate} onOpenChange={() => setRejectingCandidate(null)}>
            <DialogContent className="sm:max-w-md">
              <form onSubmit={handleConfirmReject} className="space-y-4">
                <DialogHeader>
                  <DialogTitle className="text-red-400 flex items-center gap-2">
                    <XCircle className="w-5 h-5" /> Refuser la candidature
                  </DialogTitle>
                  <DialogDescription className="text-xs">
                    Selon la règle de gestion n°1, tout refus de candidature doit obligatoirement être motivé. Ce motif sera communiqué au talent.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-1.5">
                  <Label htmlFor="motive" className="text-xs text-slate-600">Motif du refus *</Label>
                  <Textarea
                    id="motive"
                    required
                    rows={3}
                    placeholder="Ex: Le dossier ne respecte pas les critères d'éligibilité de la catégorie ou la qualité des médias est insuffisante..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="text-xs"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => setRejectingCandidate(null)}>
                    Annuler
                  </Button>
                  <Button type="submit" variant="destructive" size="sm" className="font-bold">
                    Confirmer le refus
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}

      </div>
    </AdminLayout>
  );
}
