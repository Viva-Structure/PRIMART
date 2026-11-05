import React, { useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { useApp } from '@/context/AppContext';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import {
  CreditCard,
  Download,
  Search,
  Filter,
  DollarSign,
  TrendingUp,
  Smartphone,
  CheckCircle2
} from 'lucide-react';

export default function AdminPayments() {
  const { transactions, totalRevenueFCFA, showToast } = useApp();

  const [methodFilter, setMethodFilter] = useState("Tous");
  const [search, setSearch] = useState("");

  const filteredTransactions = transactions.filter(t => {
    const matchMethod = methodFilter === "Tous" || t.paymentMethod.toLowerCase().includes(methodFilter.toLowerCase());
    const matchSearch =
      t.id.toLowerCase().includes(search.toLowerCase()) ||
      t.candidateName.toLowerCase().includes(search.toLowerCase()) ||
      t.phoneNumber.toLowerCase().includes(search.toLowerCase());
    return matchMethod && matchSearch;
  });
  const successfulTransactions = transactions.filter(transaction => transaction.status === 'Réussie');
  const averageTransaction = successfulTransactions.length
    ? Math.round(totalRevenueFCFA / successfulTransactions.length)
    : 0;
  const mobileMoneyTransactions = successfulTransactions.filter(transaction => (
    !transaction.paymentMethod.toLowerCase().includes('carte')
  ));
  const mobileMoneyShare = successfulTransactions.length
    ? Math.round((mobileMoneyTransactions.length / successfulTransactions.length) * 100)
    : 0;

  const exportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8,ID,Date,Candidat,Votes,Montant,Devise,Moyen,Statut\n" +
      filteredTransactions.map(t =>
        `${t.id},${t.date},"${t.candidateName}",${t.votes},${t.amount},${t.currency},"${t.paymentMethod}",${t.status}`
      ).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `primart_transactions_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    showToast("Export comptable CSV généré", "Le fichier des transactions est prêt.", "success");
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-emerald-500" />
              <h1 className="text-2xl font-extrabold text-slate-900 font-display">
                Paiements & Réconciliation Comptable
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Aucun prestataire de paiement réel n'est encore connecté; aucun vote payant n'est crédité.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={exportCSV} className="text-xs font-bold text-slate-500">
              <Download className="w-4 h-4 mr-1.5 text-amber-400" />
              Exporter Registre CSV / Excel
            </Button>
          </div>
        </div>

        {/* Financial Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
            <span className="text-xs text-slate-500 font-semibold">Total Net Encaissé</span>
            <div className="text-2xl font-extrabold text-emerald-600 font-display">
              {totalRevenueFCFA.toLocaleString()} FCFA
            </div>
            <p className="text-[11px] text-slate-500">Somme des paiements réussis enregistrés</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
            <span className="text-xs text-slate-500 font-semibold">Panier Moyen par Votant</span>
            <div className="text-2xl font-extrabold text-amber-600 font-display">
              {averageTransaction.toLocaleString()} FCFA
            </div>
            <p className="text-[11px] text-slate-500">Calculé sur les paiements réussis</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
            <span className="text-xs text-slate-500 font-semibold">Part Mobile Money</span>
            <div className="text-2xl font-extrabold text-slate-900 font-display">
              {mobileMoneyShare}%
            </div>
            <p className="text-[11px] text-slate-500">Part des transactions Mobile Money confirmées</p>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Rechercher par référence, candidat, téléphone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>

          <div>
            <Select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="text-xs"
            >
              <option value="Tous">Tous les moyens de paiement</option>
              <option value="Orange">Orange Money</option>
              <option value="MTN">MTN MoMo</option>
              <option value="Moov">Moov Money</option>
              <option value="Wave">Wave</option>
              <option value="Carte">Carte Bancaire (Visa/MC)</option>
            </Select>
          </div>
        </div>

        {/* Transactions Table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Réf. Transaction</TableHead>
              <TableHead>Date & Heure</TableHead>
              <TableHead>Candidat Bénéficiaire</TableHead>
              <TableHead>Moyen Utilisé</TableHead>
              <TableHead>Votes Crédités</TableHead>
              <TableHead className="text-right">Montant (FCFA)</TableHead>
              <TableHead className="text-right">Statut</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center text-sm text-slate-500">
                  Aucune transaction enregistrée dans Supabase.
                </TableCell>
              </TableRow>
            ) : filteredTransactions.map(tx => (
              <TableRow key={tx.id}>
                <TableCell className="font-mono text-xs font-bold text-amber-600">
                  {tx.id}
                </TableCell>

                <TableCell className="text-xs text-slate-500">
                  {new Date(tx.date).toLocaleDateString()} {new Date(tx.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </TableCell>

                <TableCell className="text-xs font-semibold text-slate-900">
                  {tx.candidateName}
                </TableCell>

                <TableCell className="text-xs text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{tx.paymentMethod}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">{tx.phoneNumber}</div>
                </TableCell>

                <TableCell className="text-xs font-bold text-amber-600">
                  +{tx.votes} votes
                </TableCell>

                <TableCell className="text-right text-xs font-display font-bold text-slate-900">
                  {tx.amount.toLocaleString()} FCFA
                </TableCell>

                <TableCell className="text-right">
                  <Badge variant={tx.status === "Réussie" ? "success" : tx.status === "En attente" ? "warning" : "destructive"}>
                    {tx.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

      </div>
    </AdminLayout>
  );
}
