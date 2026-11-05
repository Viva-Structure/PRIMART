import React, { useState, useMemo, useEffect } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  FolderOpen,
  Plus,
  Pencil,
  Trash2,
  Award,
  Search,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Layers,
  Coins,
  CheckCircle2,
  XCircle,
  Flame,
  Percent,
  RefreshCw,
  Users,
  Sparkles,
  Music,
  Palette,
  Briefcase,
  Trophy,
  Filter,
} from 'lucide-react';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getCategoryIcon(nameOrIcon) {
  const lower = (nameOrIcon || '').toLowerCase();
  if (lower.includes('music') || lower.includes('musique')) return Music;
  if (lower.includes('danse') || lower.includes('sparkle') || lower.includes('performance')) return Sparkles;
  if (lower.includes('art') || lower.includes('palette')) return Palette;
  if (lower.includes('industrie') || lower.includes('briefcase')) return Briefcase;
  return Trophy;
}

// ─── Reusable Pagination Component ───────────────────────────────────────────

function Pagination({ currentPage, totalPages, onPageChange, totalItems, itemsPerPage, itemName = "éléments" }) {
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-5 border-t border-slate-200 text-xs text-slate-500">
      <div>
        Affichage de <span className="font-semibold text-slate-900">{startItem}</span> à <span className="font-semibold text-slate-900">{endItem}</span> sur <span className="font-semibold text-slate-900">{totalItems}</span> {itemName}
      </div>
      <div className="flex items-center gap-1.5">
        <Button
          size="sm"
          variant="outline"
          className="h-8 w-8 p-0 text-slate-600 hover:text-slate-900"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          title="Page précédente"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        {getPageNumbers().map((page) => (
          <Button
            key={page}
            size="sm"
            variant={page === currentPage ? "gold" : "outline"}
            className={`h-8 w-8 p-0 text-xs font-semibold ${
              page === currentPage
                ? "bg-amber-500 text-black font-bold shadow-xs hover:bg-amber-600"
                : "text-slate-700 hover:bg-slate-100"
            }`}
            onClick={() => onPageChange(page)}
          >
            {page}
          </Button>
        ))}
        <Button
          size="sm"
          variant="outline"
          className="h-8 w-8 p-0 text-slate-600 hover:text-slate-900"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          title="Page suivante"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

// ─── Category Form Dialog ────────────────────────────────────────────────────

function CategoryFormDialog({ open, onOpenChange, category, onSubmit }) {
  const isEditing = Boolean(category?.id);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('Trophy');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setName(category?.name || '');
      setDescription(category?.description || '');
      setIcon(category?.icon || 'Trophy');
      setError('');
    }
  }, [open, category]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Le nom de la catégorie est obligatoire.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await onSubmit({
        id: category?.id,
        name: name.trim(),
        description: description.trim(),
        icon: icon.trim(),
      });
      onOpenChange(false);
    } catch (err) {
      setError(err.message || "Erreur lors de l'enregistrement.");
    } finally {
      setSaving(false);
    }
  };

  const iconOptions = ['Trophy', 'Music', 'Sparkles', 'Palette', 'Briefcase', 'Star', 'Heart', 'Flame', 'Crown', 'Mic'];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Modifier la catégorie' : 'Nouvelle catégorie'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Modifiez les informations de cette catégorie.'
              : 'Ajoutez une nouvelle catégorie pour regrouper des prix et trophées.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="cat-name">Nom de la catégorie *</Label>
            <Input
              id="cat-name"
              placeholder="Ex: Musique, Danse et performance…"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cat-desc">Description</Label>
            <Textarea
              id="cat-desc"
              placeholder="Décrivez brièvement les disciplines et profils visés…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cat-icon">Icône représentative</Label>
            <Select id="cat-icon" value={icon} onChange={(e) => setIcon(e.target.value)}>
              {iconOptions.map((ic) => (
                <option key={ic} value={ic}>{ic}</option>
              ))}
            </Select>
          </div>
          {error && <p role="alert" className="text-xs text-red-600 font-medium">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)} disabled={saving}>
              Annuler
            </Button>
            <Button type="submit" variant="gold" size="sm" disabled={saving}>
              {saving ? 'Enregistrement…' : isEditing ? 'Enregistrer' : 'Créer la catégorie'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Prize Form Dialog ───────────────────────────────────────────────────────

function PrizeFormDialog({ open, onOpenChange, prize, categories, defaultCategoryId, onSubmit }) {
  const isEditing = Boolean(prize?.id);
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setName(prize?.name || '');
      setCategoryId(prize?.category_id || defaultCategoryId || categories[0]?.id || '');
      setError('');
    }
  }, [open, prize, defaultCategoryId, categories]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Le nom du prix est obligatoire.');
      return;
    }
    if (!categoryId) {
      setError('Veuillez sélectionner une catégorie parente.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await onSubmit({
        id: prize?.id,
        name: name.trim(),
        category_id: categoryId,
      });
      onOpenChange(false);
    } catch (err) {
      setError(err.message || "Erreur lors de l'enregistrement.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Modifier le prix / trophée' : 'Nouveau prix / distinction'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Modifiez les informations de ce prix ou trophée.'
              : 'Ajoutez un nouveau prix au palmarès d’une catégorie.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="prize-name">Nom du prix / trophée *</Label>
            <Input
              id="prize-name"
              placeholder="Ex: Artiste masculin de l'année, Meilleur clip…"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="prize-cat">Catégorie associée *</Label>
            <Select id="prize-cat" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </Select>
          </div>
          {error && <p role="alert" className="text-xs text-red-600 font-medium">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)} disabled={saving}>
              Annuler
            </Button>
            <Button type="submit" variant="gold" size="sm" disabled={saving}>
              {saving ? 'Enregistrement…' : isEditing ? 'Enregistrer' : 'Créer le prix'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Vote Pack Form Dialog ───────────────────────────────────────────────────

function VotePackFormDialog({ open, onOpenChange, pack, onSubmit }) {
  const isEditing = Boolean(pack?.id);
  const [packId, setPackId] = useState('');
  const [votes, setVotes] = useState(10);
  const [price, setPrice] = useState(1000);
  const [discount, setDiscount] = useState('');
  const [badge, setBadge] = useState('');
  const [popular, setPopular] = useState(false);
  const [active, setActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setPackId(pack?.id || '');
      setVotes(pack?.votes || 10);
      setPrice(pack?.price || 1000);
      setDiscount(pack?.discount || '');
      setBadge(pack?.badge || '');
      setPopular(Boolean(pack?.popular));
      setActive(pack?.active !== false);
      setError('');
    }
  }, [open, pack]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (Number(votes) <= 0) {
      setError('Le nombre de votes doit être supérieur à zéro.');
      return;
    }
    if (Number(price) <= 0) {
      setError('Le prix doit être supérieur à zéro.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await onSubmit({
        id: pack?.id || (packId.trim() ? packId.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '') : `pack-${votes}`),
        votes: Number(votes),
        price: Number(price),
        discount: discount.trim() || null,
        badge: badge.trim() || null,
        popular,
        active,
      });
      onOpenChange(false);
    } catch (err) {
      setError(err.message || "Erreur lors de l'enregistrement du pack.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Modifier le tarif de vote' : 'Nouveau pack de votes'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Ajustez le prix en FCFA, le nombre de votes ou les remises associées.'
              : 'Créez une offre tarifaire de votes payants pour les supporters.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isEditing && (
            <div className="space-y-1.5">
              <Label htmlFor="pack-id">Identifiant unique (optionnel)</Label>
              <Input
                id="pack-id"
                placeholder="Ex: pack-5, pack-50, pack-vip…"
                value={packId}
                onChange={(e) => setPackId(e.target.value)}
              />
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="pack-votes">Nombre de votes *</Label>
              <Input
                id="pack-votes"
                type="number"
                min="1"
                value={votes}
                onChange={(e) => setVotes(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pack-price">Prix en FCFA (XOF) *</Label>
              <Input
                id="pack-price"
                type="number"
                min="100"
                step="50"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="pack-discount">Remise affichée</Label>
              <Input
                id="pack-discount"
                placeholder="Ex: -10%, -25%…"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pack-badge">Badge textuel</Label>
              <Input
                id="pack-badge"
                placeholder="Ex: Populaire, Meilleure offre…"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={popular}
                onChange={(e) => setPopular(e.target.checked)}
                className="rounded border-slate-300 text-amber-500 focus:ring-amber-400"
              />
              Mettre en avant (« Populaire »)
            </label>
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="rounded border-slate-300 text-emerald-500 focus:ring-emerald-400"
              />
              Pack actif (disponible au vote)
            </label>
          </div>
          {error && <p role="alert" className="text-xs text-red-600 font-medium">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)} disabled={saving}>
              Annuler
            </Button>
            <Button type="submit" variant="gold" size="sm" disabled={saving}>
              {saving ? 'Enregistrement…' : isEditing ? 'Enregistrer' : 'Créer le pack'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Delete Confirmation Dialog ──────────────────────────────────────────────

function DeleteDialog({ open, onOpenChange, title, description, onConfirm }) {
  const [deleting, setDeleting] = useState(false);

  const handleConfirm = async () => {
    setDeleting(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } catch {
      // Handled upstream
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)} disabled={deleting}>
            Annuler
          </Button>
          <Button type="button" variant="destructive" size="sm" onClick={handleConfirm} disabled={deleting}>
            {deleting ? 'Suppression…' : 'Supprimer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Admin Component ────────────────────────────────────────────────────

export default function AdminCategories() {
  const {
    categoriesRaw,
    prizesRaw,
    votePacksRaw,
    candidates,
    addCategory,
    updateCategory,
    deleteCategory,
    addPrize,
    updatePrize,
    deletePrize,
    addVotePack,
    updateVotePack,
    deleteVotePack,
    showToast,
    loading,
    dataError,
    refreshData,
  } = useApp();

  const categories = categoriesRaw || [];
  const prizes = prizesRaw || [];
  const votePacks = votePacksRaw || [];
  const candidatesList = candidates || [];

  const [activeTab, setActiveTab] = useState('categories'); // 'categories' | 'pricing'
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all'); // 'all' | category_id
  const [search, setSearch] = useState('');

  // Pagination states
  const [prizesPage, setPrizesPage] = useState(1);
  const PRIZES_PER_PAGE = 8;

  const [packsPage, setPacksPage] = useState(1);
  const PACKS_PER_PAGE = 8;

  // Dialog states
  const [catDialogOpen, setCatDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const [prizeDialogOpen, setPrizeDialogOpen] = useState(false);
  const [editingPrize, setEditingPrize] = useState(null);

  const [packDialogOpen, setPackDialogOpen] = useState(false);
  const [editingPack, setEditingPack] = useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null);

  // Reset page when search or category filter changes
  useEffect(() => {
    setPrizesPage(1);
  }, [search, selectedCategoryFilter]);

  useEffect(() => {
    setPacksPage(1);
  }, [search]);

  // Map of category by id for fast lookup
  const categoryMap = useMemo(() => {
    return new Map(categories.map((c) => [c.id, c]));
  }, [categories]);

  // Count candidates per prize
  const candidateCountByPrize = useMemo(() => {
    const map = new Map();
    candidatesList.forEach((c) => {
      if (c.prize) {
        map.set(c.prize, (map.get(c.prize) || 0) + 1);
      }
    });
    return map;
  }, [candidatesList]);

  // Filtered prizes
  const filteredPrizes = useMemo(() => {
    const q = search.toLowerCase().trim();
    return prizes.filter((prize) => {
      const matchCat =
        selectedCategoryFilter === 'all' || prize.category_id === selectedCategoryFilter;
      const catName = categoryMap.get(prize.category_id)?.name || '';
      const matchQuery =
        !q || prize.name.toLowerCase().includes(q) || catName.toLowerCase().includes(q);
      return matchCat && matchQuery;
    });
  }, [prizes, selectedCategoryFilter, search, categoryMap]);

  // Paginated prizes
  const totalPrizePages = Math.ceil(filteredPrizes.length / PRIZES_PER_PAGE) || 1;
  const paginatedPrizes = useMemo(() => {
    const start = (prizesPage - 1) * PRIZES_PER_PAGE;
    return filteredPrizes.slice(start, start + PRIZES_PER_PAGE);
  }, [filteredPrizes, prizesPage, PRIZES_PER_PAGE]);

  // Filtered vote packs
  const filteredPacks = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return votePacks;
    return votePacks.filter((p) => {
      const matchVotes = `${p.votes}`.includes(q);
      const matchPrice = `${p.price}`.includes(q);
      const matchBadge = (p.badge || '').toLowerCase().includes(q);
      return matchVotes || matchPrice || matchBadge;
    });
  }, [votePacks, search]);

  // Paginated vote packs
  const totalPackPages = Math.ceil(filteredPacks.length / PACKS_PER_PAGE) || 1;
  const paginatedPacks = useMemo(() => {
    const start = (packsPage - 1) * PACKS_PER_PAGE;
    return filteredPacks.slice(start, start + PACKS_PER_PAGE);
  }, [filteredPacks, packsPage, PACKS_PER_PAGE]);

  // ── Handlers ──

  const handleCategorySubmit = async (data) => {
    if (data.id) {
      await updateCategory(data.id, { name: data.name, description: data.description, icon: data.icon });
      showToast('Catégorie modifiée', `« ${data.name} » a été mise à jour.`, 'success');
    } else {
      await addCategory({ name: data.name, description: data.description, icon: data.icon });
      showToast('Catégorie créée', `« ${data.name} » a été ajoutée.`, 'success');
    }
  };

  const handleDeleteCategory = async () => {
    const cat = deleteTarget?.item;
    if (!cat) return;
    const catPrizes = prizes.filter((p) => p.category_id === cat.id);
    if (catPrizes.length > 0) {
      showToast(
        'Suppression impossible',
        `Cette catégorie contient encore ${catPrizes.length} prix. Veuillez supprimer ou réaffecter ces prix d'abord.`,
        'error'
      );
      return;
    }
    await deleteCategory(cat.id);
    if (selectedCategoryFilter === cat.id) {
      setSelectedCategoryFilter('all');
    }
    showToast('Catégorie supprimée', `« ${cat.name} » a été retirée.`, 'success');
  };

  const handlePrizeSubmit = async (data) => {
    if (data.id) {
      await updatePrize(data.id, { name: data.name, category_id: data.category_id });
      showToast('Prix modifié', `« ${data.name} » a été mis à jour.`, 'success');
    } else {
      await addPrize({ name: data.name, category_id: data.category_id });
      showToast('Prix créé', `« ${data.name} » a été ajouté au palmarès.`, 'success');
    }
  };

  const handleDeletePrize = async () => {
    const prize = deleteTarget?.item;
    if (!prize) return;
    await deletePrize(prize.id);
    showToast('Prix supprimé', `« ${prize.name} » a été retiré.`, 'success');
  };

  const handleVotePackSubmit = async (data) => {
    if (editingPack?.id) {
      await updateVotePack(data.id, data);
      showToast('Pack modifié', `Le tarif pour ${data.votes} votes a été mis à jour.`, 'success');
    } else {
      await addVotePack(data);
      showToast('Pack créé', `Nouveau pack de ${data.votes} votes (${data.price} FCFA) ajouté.`, 'success');
    }
  };

  const handleTogglePackActive = async (pack) => {
    const nextActive = !pack.active;
    await updateVotePack(pack.id, { active: nextActive });
    showToast(
      nextActive ? 'Pack activé' : 'Pack désactivé',
      `Le pack de ${pack.votes} votes est maintenant ${nextActive ? 'disponible' : 'masqué'}.`,
      'info'
    );
  };

  const handleDeletePack = async () => {
    const pack = deleteTarget?.item;
    if (!pack) return;
    await deleteVotePack(pack.id);
    showToast('Pack supprimé', `Le pack de ${pack.votes} votes a été supprimé.`, 'success');
  };

  const currentCategoryObj = selectedCategoryFilter !== 'all' ? categoryMap.get(selectedCategoryFilter) : null;
  const totalCategories = categories.length;
  const totalPrizes = prizes.length;
  const totalPacks = votePacks.length;
  const activePacksCount = votePacks.filter((p) => p.active !== false).length;

  return (
    <AdminLayout>
      <div className="space-y-6">

        {/* ── Page Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display tracking-tight">
                Catégories & Tarifs des Prix
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Pilotez les catégories du palmarès, les cartes de prix par discipline et la grille tarifaire des votes.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              size="sm"
              variant="outline"
              className="text-xs text-slate-700 hover:text-slate-900"
              onClick={() => refreshData()}
              disabled={loading}
              title="Synchroniser avec la base Supabase"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin text-amber-500' : ''}`} />
              Actualiser
            </Button>

            {activeTab === 'categories' ? (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs"
                  onClick={() => {
                    setEditingPrize(null);
                    setPrizeDialogOpen(true);
                  }}
                  disabled={totalCategories === 0}
                >
                  <Award className="w-3.5 h-3.5 mr-1.5 text-amber-600" />
                  Nouveau prix
                </Button>
                <Button
                  size="sm"
                  variant="gold"
                  className="text-xs font-bold"
                  onClick={() => {
                    setEditingCategory(null);
                    setCatDialogOpen(true);
                  }}
                >
                  <Plus className="w-3.5 h-3.5 mr-1.5" />
                  Nouvelle catégorie
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                variant="gold"
                className="text-xs font-bold"
                onClick={() => {
                  setEditingPack(null);
                  setPackDialogOpen(true);
                }}
              >
                <Plus className="w-3.5 h-3.5 mr-1.5" />
                Nouveau pack de votes
              </Button>
            )}
          </div>
        </div>

        {/* Error notification if any */}
        {dataError && (
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 text-xs flex items-center justify-between">
            <span className="font-medium">{dataError}</span>
            <Button size="sm" variant="ghost" className="h-6 text-xs text-amber-900 hover:underline" onClick={() => refreshData()}>
              Réessayer
            </Button>
          </div>
        )}

        {/* ── Main Section Tabs ── */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          <button
            type="button"
            onClick={() => { setActiveTab('categories'); setSearch(''); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'categories'
                ? 'bg-amber-500 text-black shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Palmarès & Cartes des Prix ({totalCategories} cat. • {totalPrizes} prix)</span>
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('pricing'); setSearch(''); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'pricing'
                ? 'bg-amber-500 text-black shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Coins className="w-4 h-4" />
            <span>Tarifs des Votes / Packs ({activePacksCount} actifs)</span>
          </button>
        </div>

        {/* ══════════════════════════════════════════════════════════════════════
            TAB 1: PALMARÈS & CARTES DE PRIX PAR CATÉGORIES
        ══════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'categories' && (
          <div className="space-y-6">

            {/* Category Selector Pills */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                <span className="flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5 text-amber-500" />
                  Filtrer par catégorie :
                </span>
                <span className="text-slate-400 font-normal">
                  {filteredPrizes.length} prix affiché(s)
                </span>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
                <button
                  type="button"
                  onClick={() => setSelectedCategoryFilter('all')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap shrink-0 border ${
                    selectedCategoryFilter === 'all'
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  Toutes les catégories ({totalPrizes})
                </button>

                {categories.map((cat) => {
                  const catPrizesCount = prizes.filter((p) => p.category_id === cat.id).length;
                  const IconComp = getCategoryIcon(cat.icon || cat.name);
                  const isSelected = selectedCategoryFilter === cat.id;

                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategoryFilter(cat.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap shrink-0 border ${
                        isSelected
                          ? 'bg-amber-500 text-black border-amber-500 shadow-xs font-bold'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-amber-300 hover:bg-amber-50/40'
                      }`}
                    >
                      <IconComp className="w-3.5 h-3.5 shrink-0" />
                      <span>{cat.name}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ml-0.5 ${
                        isSelected ? 'bg-black text-amber-400' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {catPrizesCount}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Category Focus Card (when a single category is selected) */}
            {currentCategoryObj && (
              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-amber-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-amber-50/50 to-white">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-amber-500 text-black flex items-center justify-center font-bold shadow-xs">
                    {React.createElement(getCategoryIcon(currentCategoryObj.icon || currentCategoryObj.name), {
                      className: 'w-5 h-5',
                    })}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base sm:text-lg font-bold text-slate-900 font-display">
                        Catégorie : {currentCategoryObj.name}
                      </h2>
                      <Badge variant="gold" className="text-[10px]">
                        {prizes.filter((p) => p.category_id === currentCategoryObj.id).length} Prix
                      </Badge>
                    </div>
                    {currentCategoryObj.description && (
                      <p className="text-xs text-slate-600 mt-0.5 line-clamp-2 max-w-2xl">
                        {currentCategoryObj.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs h-8"
                    onClick={() => {
                      setEditingCategory(currentCategoryObj);
                      setCatDialogOpen(true);
                    }}
                  >
                    <Pencil className="w-3.5 h-3.5 mr-1 text-slate-500" />
                    Modifier la catégorie
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-xs h-8 text-red-600 hover:bg-red-50"
                    onClick={() => setDeleteTarget({ type: 'category', item: currentCategoryObj })}
                    title="Supprimer la catégorie"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            )}

            {/* Search Bar */}
            <div className="relative w-full max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Rechercher un prix ou trophée spécifique…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 text-xs"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
                >
                  Effacer
                </button>
              )}
            </div>

            {/* ── PRIZES CARDS GRID ── */}
            {loading ? (
              <div className="text-center py-16 text-slate-500 text-sm">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto text-amber-500 mb-2" />
                Chargement des prix en cours…
              </div>
            ) : filteredPrizes.length === 0 ? (
              <div className="text-center py-16 space-y-3 bg-white rounded-2xl border border-slate-200 p-8">
                <Award className="w-12 h-12 mx-auto text-slate-300" />
                <p className="text-sm font-semibold text-slate-700">Aucun prix trouvé</p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {search
                    ? `Aucun prix ne correspond à « ${search} ».`
                    : 'Aucun prix n’est encore associé à cette catégorie.'}
                </p>
                <Button
                  size="sm"
                  variant="gold"
                  className="text-xs font-bold mt-2"
                  onClick={() => {
                    setEditingPrize({ category_id: selectedCategoryFilter !== 'all' ? selectedCategoryFilter : categories[0]?.id });
                    setPrizeDialogOpen(true);
                  }}
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Ajouter un nouveau prix
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
                  {paginatedPrizes.map((prize) => {
                    const cat = categoryMap.get(prize.category_id);
                    const candidateCount = candidateCountByPrize.get(prize.name) || 0;

                    return (
                      <div
                        key={prize.id}
                        className="group relative bg-white rounded-2xl p-4 border border-slate-200 hover:border-amber-400 hover:shadow-md transition-all flex flex-col justify-between gap-3 shadow-2xs"
                      >
                        {/* Top: Category Tag & Icon */}
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2.5">
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-200/60 truncate">
                              <Award className="w-3 h-3 shrink-0 text-amber-500" />
                              <span className="truncate">{cat?.name || 'Prix'}</span>
                            </span>

                            <span className="text-[10px] text-slate-500 font-medium px-2 py-0.5 rounded-full bg-slate-50 border border-slate-200 shrink-0 flex items-center gap-1">
                              <Users className="w-3 h-3 text-slate-400" />
                              {candidateCount} en liste
                            </span>
                          </div>

                          {/* Prize Title */}
                          <h3 className="font-display font-bold text-sm text-slate-900 group-hover:text-amber-700 transition-colors line-clamp-2 leading-snug">
                            {prize.name}
                          </h3>
                        </div>

                        {/* Bottom Actions */}
                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-[10px] text-slate-400 font-mono">
                            ID: {prize.id ? `${prize.id.substring(0, 6)}…` : '—'}
                          </span>

                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 w-7 p-0 text-slate-500 hover:text-amber-700 hover:bg-amber-50"
                              onClick={() => {
                                setEditingPrize(prize);
                                setPrizeDialogOpen(true);
                              }}
                              title="Modifier ce prix"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 w-7 p-0 text-slate-400 hover:text-red-600 hover:bg-red-50"
                              onClick={() => setDeleteTarget({ type: 'prize', item: prize })}
                              title="Supprimer ce prix"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Quick Add Prize Card (at the end of current page) */}
                  <button
                    type="button"
                    onClick={() => {
                      setEditingPrize({
                        category_id: selectedCategoryFilter !== 'all' ? selectedCategoryFilter : categories[0]?.id,
                      });
                      setPrizeDialogOpen(true);
                    }}
                    className="rounded-2xl p-4 border-2 border-dashed border-slate-200 hover:border-amber-400 hover:bg-amber-50/30 transition-all flex flex-col items-center justify-center text-center gap-2 group min-h-[140px]"
                  >
                    <div className="w-9 h-9 rounded-full bg-slate-100 group-hover:bg-amber-500 group-hover:text-black flex items-center justify-center transition-colors text-slate-600">
                      <Plus className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-slate-700 group-hover:text-amber-700 transition-colors">
                      Ajouter un nouveau prix
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {currentCategoryObj ? `dans « ${currentCategoryObj.name} »` : 'dans une catégorie'}
                    </span>
                  </button>
                </div>

                {/* Pagination Controls */}
                <Pagination
                  currentPage={prizesPage}
                  totalPages={totalPrizePages}
                  onPageChange={setPrizesPage}
                  totalItems={filteredPrizes.length}
                  itemsPerPage={PRIZES_PER_PAGE}
                  itemName="prix"
                />
              </div>
            )}

          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            TAB 2: CARTES DES PACKS DE VOTES & TARIFICATION
        ══════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'pricing' && (
          <div className="space-y-6">

            {/* KPI Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                <div className="text-xs font-semibold text-slate-500 mb-1">Total Packs</div>
                <div className="text-2xl font-extrabold text-slate-900 font-display">{totalPacks}</div>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                <div className="text-xs font-semibold text-slate-500 mb-1">Packs Actifs</div>
                <div className="text-2xl font-extrabold text-emerald-600 font-display">{activePacksCount}</div>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                <div className="text-xs font-semibold text-slate-500 mb-1">Prix Moyen / Vote</div>
                <div className="text-2xl font-extrabold text-slate-900 font-display">
                  {votePacks.length > 0
                    ? `${Math.round(
                        votePacks.reduce((sum, p) => sum + Number(p.price) / Number(p.votes || 1), 0) /
                          votePacks.length
                      )} FCFA`
                    : '—'}
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                <div className="text-xs font-semibold text-slate-500 mb-1">Pack le + Populaire</div>
                <div className="text-2xl font-extrabold text-amber-600 font-display">
                  {votePacks.find((p) => p.popular)?.votes
                    ? `${votePacks.find((p) => p.popular).votes} votes`
                    : 'Aucun'}
                </div>
              </div>
            </div>

            {/* Search Bar for Packs */}
            <div className="relative w-full max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Rechercher par volume, prix ou badge…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 text-xs"
              />
            </div>

            {/* ── VOTE PACKS CARDS GRID ── */}
            {filteredPacks.length === 0 ? (
              <div className="text-center py-16 space-y-3 bg-white rounded-2xl border border-slate-200 p-8">
                <Coins className="w-12 h-12 mx-auto text-slate-300" />
                <p className="text-sm font-semibold text-slate-700">Aucun pack de vote trouvé</p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {search ? `Aucun pack ne correspond à « ${search} ».` : 'Aucun tarif de vote n’est encore configuré.'}
                </p>
                <Button
                  size="sm"
                  variant="gold"
                  className="text-xs font-bold mt-2"
                  onClick={() => {
                    setEditingPack(null);
                    setPackDialogOpen(true);
                  }}
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Créer un pack de vote
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {paginatedPacks.map((pack) => {
                    const unitPrice = Math.round(Number(pack.price) / Number(pack.votes || 1));
                    const isActive = pack.active !== false;

                    return (
                      <div
                        key={pack.id}
                        className={`relative rounded-3xl p-5 border transition-all flex flex-col justify-between gap-4 bg-white shadow-xs ${
                          isActive
                            ? 'border-slate-200 hover:border-amber-400 hover:shadow-md'
                            : 'border-slate-200 opacity-60 bg-slate-50/80'
                        } ${pack.popular ? 'ring-2 ring-amber-500/80' : ''}`}
                      >
                        {/* Top Badges */}
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-3">
                            <button
                              type="button"
                              onClick={() => handleTogglePackActive(pack)}
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${
                                isActive
                                  ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                                  : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                              }`}
                              title={isActive ? 'Cliquer pour désactiver' : 'Cliquer pour activer'}
                            >
                              {isActive ? (
                                <>
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  <span>Actif</span>
                                </>
                              ) : (
                                <>
                                  <XCircle className="w-3 h-3 text-slate-500" />
                                  <span>Désactivé</span>
                                </>
                              )}
                            </button>

                            <div className="flex items-center gap-1">
                              {pack.popular && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500 text-black text-[10px] font-bold shadow-2xs">
                                  <Flame className="w-3 h-3" />
                                  Populaire
                                </span>
                              )}
                              {pack.discount && (
                                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold">
                                  <Percent className="w-2.5 h-2.5" />
                                  {pack.discount}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Center: Votes volume & Price */}
                          <div className="space-y-1.5">
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-display">
                                {pack.votes}
                              </span>
                              <span className="text-xs uppercase font-bold tracking-wider text-amber-600">
                                {pack.votes > 1 ? 'Votes' : 'Vote'}
                              </span>
                            </div>

                            <div className="flex items-baseline gap-1 text-2xl font-extrabold text-slate-900 font-display">
                              <span>{Number(pack.price).toLocaleString()}</span>
                              <span className="text-xs font-semibold text-slate-500">FCFA</span>
                            </div>

                            <p className="text-[11px] text-slate-500 font-medium">
                              ~{unitPrice} FCFA / vote
                            </p>

                            {pack.badge && !pack.popular && (
                              <div className="pt-1">
                                <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                                  {pack.badge}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Bottom: ID & Controls */}
                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-[10px] font-mono text-slate-400">
                            {pack.id}
                          </span>

                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 w-7 p-0 text-slate-500 hover:text-amber-700 hover:bg-amber-50"
                              onClick={() => {
                                setEditingPack(pack);
                                setPackDialogOpen(true);
                              }}
                              title="Modifier ce pack"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 w-7 p-0 text-slate-400 hover:text-red-600 hover:bg-red-50"
                              onClick={() => setDeleteTarget({ type: 'pack', item: pack })}
                              title="Supprimer ce pack"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Add Pack Quick Card */}
                  <button
                    type="button"
                    onClick={() => {
                      setEditingPack(null);
                      setPackDialogOpen(true);
                    }}
                    className="rounded-3xl p-5 border-2 border-dashed border-slate-200 hover:border-amber-400 hover:bg-amber-50/30 transition-all flex flex-col items-center justify-center text-center gap-2.5 group min-h-[190px]"
                  >
                    <div className="w-10 h-10 rounded-full bg-slate-100 group-hover:bg-amber-500 group-hover:text-black flex items-center justify-center transition-colors text-slate-600">
                      <Plus className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-slate-700 group-hover:text-amber-700 transition-colors">
                      Nouveau tarif de vote
                    </span>
                    <span className="text-[10px] text-slate-400 max-w-[150px]">
                      Définir un nombre de votes et son montant en FCFA
                    </span>
                  </button>
                </div>

                {/* Pagination Controls */}
                <Pagination
                  currentPage={packsPage}
                  totalPages={totalPackPages}
                  onPageChange={setPacksPage}
                  totalItems={filteredPacks.length}
                  itemsPerPage={PACKS_PER_PAGE}
                  itemName="packs de vote"
                />
              </div>
            )}

          </div>
        )}

      </div>

      {/* ── Dialogs ── */}
      <CategoryFormDialog
        open={catDialogOpen}
        onOpenChange={setCatDialogOpen}
        category={editingCategory}
        onSubmit={handleCategorySubmit}
      />

      <PrizeFormDialog
        open={prizeDialogOpen}
        onOpenChange={setPrizeDialogOpen}
        prize={editingPrize}
        categories={categories}
        defaultCategoryId={selectedCategoryFilter !== 'all' ? selectedCategoryFilter : undefined}
        onSubmit={handlePrizeSubmit}
      />

      <VotePackFormDialog
        open={packDialogOpen}
        onOpenChange={setPackDialogOpen}
        pack={editingPack}
        onSubmit={handleVotePackSubmit}
      />

      <DeleteDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        title={
          deleteTarget?.type === 'category'
            ? 'Supprimer la catégorie ?'
            : deleteTarget?.type === 'prize'
            ? 'Supprimer le prix ?'
            : 'Supprimer ce pack de votes ?'
        }
        description={
          deleteTarget?.type === 'category'
            ? `La catégorie « ${deleteTarget?.item?.name} » sera définitivement supprimée. Assurez-vous qu'aucun prix n'y est rattaché.`
            : deleteTarget?.type === 'prize'
            ? `Le prix « ${deleteTarget?.item?.name} » sera retiré du palmarès.`
            : `Le pack de ${deleteTarget?.item?.votes} votes (${deleteTarget?.item?.price} FCFA) sera supprimé.`
        }
        onConfirm={
          deleteTarget?.type === 'category'
            ? handleDeleteCategory
            : deleteTarget?.type === 'prize'
            ? handleDeletePrize
            : handleDeletePack
        }
      />
    </AdminLayout>
  );
}
