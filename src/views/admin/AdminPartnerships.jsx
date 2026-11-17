import React, { useMemo, useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { useApp } from '@/context/AppContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Handshake, Mail, Phone, Globe2, CheckCircle2, XCircle } from 'lucide-react';

const STATUS_FILTERS = ['Toutes', 'En attente', 'Accepté', 'Refusé'];

function StatusBadge({ status }) {
  const className = status === 'Accepté'
    ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
    : status === 'Refusé'
      ? 'border-red-200 bg-red-50 text-red-800'
      : 'border-amber-200 bg-amber-50 text-amber-800';
  return <Badge variant="outline" className={className}>{status}</Badge>;
}

export default function AdminPartnerships() {
  const { partnershipRequests, moderatePartnershipRequest, showToast } = useApp();
  const [statusFilter, setStatusFilter] = useState('Toutes');
  const [updatingId, setUpdatingId] = useState(null);

  const filteredRequests = useMemo(
    () => statusFilter === 'Toutes'
      ? partnershipRequests
      : partnershipRequests.filter(request => request.status === statusFilter),
    [partnershipRequests, statusFilter]
  );
  const pendingCount = partnershipRequests.filter(request => request.status === 'En attente').length;

  const reviewRequest = async (request, status) => {
    if (status === 'Refusé' && !window.confirm(`Refuser la demande de ${request.organizationName} ?`)) return;
    setUpdatingId(request.id);
    try {
      await moderatePartnershipRequest(request.id, status);
      showToast(
        status === 'Accepté' ? 'Partenaire confirmé' : 'Demande refusée',
        status === 'Accepté'
          ? `${request.organizationName} apparaît maintenant dans la liste publique des partenaires.`
          : `La demande de ${request.organizationName} a été refusée.`,
        'success'
      );
    } catch (error) {
      showToast('Mise à jour impossible', error.message || 'Veuillez réessayer.', 'destructive');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <header className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Handshake className="h-5 w-5 text-amber-500" />
              <h1 className="font-display text-2xl font-extrabold text-slate-900">Demandes de partenariat</h1>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Examinez les propositions. Seuls les partenaires acceptés sont publiés sur le site.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
              <strong>{pendingCount}</strong> en attente
            </span>
            <div className="w-40">
              <Select value={statusFilter} onChange={event => setStatusFilter(event.target.value)} aria-label="Filtrer par statut">
                {STATUS_FILTERS.map(status => <option key={status} value={status}>{status}</option>)}
              </Select>
            </div>
          </div>
        </header>

        {filteredRequests.length ? (
          <div className="space-y-4">
            {filteredRequests.map(request => (
              <article key={request.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-display text-lg font-bold text-slate-900">{request.organizationName}</h2>
                      <StatusBadge status={request.status} />
                    </div>
                    <p className="mt-1 text-xs font-medium text-slate-500">
                      {request.category} · Reçue le {new Date(request.createdAt).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  {request.status === 'En attente' && (
                    <div className="flex shrink-0 gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={updatingId === request.id}
                        onClick={() => void reviewRequest(request, 'Refusé')}
                      >
                        <XCircle className="mr-1.5 h-4 w-4" /> Refuser
                      </Button>
                      <Button
                        size="sm"
                        variant="gold"
                        disabled={updatingId === request.id}
                        onClick={() => void reviewRequest(request, 'Accepté')}
                      >
                        <CheckCircle2 className="mr-1.5 h-4 w-4" />
                        {updatingId === request.id ? 'Enregistrement…' : 'Confirmer'}
                      </Button>
                    </div>
                  )}
                </div>

                <div className="mt-4 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                  <p><span className="font-semibold text-slate-800">Contact :</span> {request.contactName}</p>
                  <a className="inline-flex items-center gap-2 hover:text-amber-700" href={`mailto:${request.email}`}>
                    <Mail className="h-4 w-4 shrink-0" /> {request.email}
                  </a>
                  {request.phone && (
                    <a className="inline-flex items-center gap-2 hover:text-amber-700" href={`tel:${request.phone}`}>
                      <Phone className="h-4 w-4 shrink-0" /> {request.phone}
                    </a>
                  )}
                  {request.website && (
                    <a
                      className="inline-flex items-center gap-2 break-all hover:text-amber-700"
                      href={request.website}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Globe2 className="h-4 w-4 shrink-0" /> {request.website}
                    </a>
                  )}
                </div>

                {request.publicDescription && (
                  <p className="mt-4 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
                    <span className="font-semibold text-slate-800">Présentation publique proposée :</span> {request.publicDescription}
                  </p>
                )}
                <div className="mt-4 border-t border-slate-100 pt-4">
                  <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500">Proposition</h3>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">{request.message}</p>
                </div>
                {request.reviewedAt && (
                  <p className="mt-3 text-xs text-slate-400">
                    Traitée le {new Date(request.reviewedAt).toLocaleString('fr-FR')}
                  </p>
                )}
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <Handshake className="mx-auto h-9 w-9 text-slate-300" />
            <h2 className="mt-4 font-semibold text-slate-800">Aucune demande à afficher</h2>
            <p className="mt-1 text-sm text-slate-500">
              {statusFilter === 'Toutes' ? 'Les nouvelles propositions apparaîtront ici.' : `Aucune demande avec le statut « ${statusFilter} ».`}
            </p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
