import React, { useState, useEffect } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import {
  LayoutDashboard,
  UserCheck,
  ShieldAlert,
  CreditCard,
  Settings,
  ArrowLeft,
  Menu,
  X,
  Trophy,
  Layers,
  Handshake
} from 'lucide-react';

export function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { candidates, suspectVotes, partnershipRequests, session, isAdmin, authLoading, adminRoleLoading, adminRoleError } = useApp();

  // Fermeture automatique du tiroir mobile lors du changement de route
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Bloque le défilement arrière-plan sur mobile quand le tiroir est ouvert
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [sidebarOpen]);

  // Fermeture avec la touche Échap
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && sidebarOpen) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sidebarOpen]);

  const pendingCandidatesCount = candidates.filter(
    (c) => c.status === 'En attente' || c.status === 'Correction demandée'
  ).length;
  const suspectVotesCount = suspectVotes.filter((s) => s.status === 'En quarantaine').length;
  const pendingPartnershipsCount = partnershipRequests.filter((request) => request.status === 'En attente').length;

  const adminMenu = [
    {
      title: "Vue d'ensemble",
      path: '/admin',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      title: 'Catégories & Prix',
      path: '/admin/categories',
      icon: Layers,
      badge: null,
    },
    {
      title: 'Modération Candidats',
      path: '/admin/moderation',
      icon: UserCheck,
      badge: pendingCandidatesCount > 0 ? pendingCandidatesCount : null,
    },
    {
      title: 'Partenariats',
      path: '/admin/partenariats',
      icon: Handshake,
      badge: pendingPartnershipsCount > 0 ? pendingPartnershipsCount : null,
    },
    {
      title: 'Votes & Anti-Fraude',
      path: '/admin/votes',
      icon: ShieldAlert,
      badge: suspectVotesCount > 0 ? `${suspectVotesCount} alertes` : null,
    },
    {
      title: 'Paiements & Finance',
      path: '/admin/paiements',
      icon: CreditCard,
      badge: null,
    },
    {
      title: 'Paramètres & Clôture',
      path: '/admin/parametres',
      icon: Settings,
      badge: null,
    },
  ];

  const isCurrent = (path) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  if (authLoading || adminRoleLoading) {
    return <p className="p-8 text-center text-sm text-slate-600">Vérification des droits…</p>;
  }

  if (!session) {
    return <Navigate to="/connexion" state={{ from: location.pathname }} replace />;
  }

  if (!isAdmin) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-3">
        <h1 className="text-xl font-bold text-slate-900">Accès réservé</h1>
        <p className="text-sm text-slate-600">Ce compte n’a pas les droits administrateur.</p>
        {adminRoleError && <p role="alert" className="text-sm text-red-700">{adminRoleError}</p>}
        <Link to="/" className="text-sm font-semibold text-amber-700 hover:underline">
          Retour à l’accueil
        </Link>
      </div>
    );
  }

  // Contenu partagé de la navigation (utilisé pour Desktop et pour le Drawer Mobile)
  const renderNavContent = () => (
    <>
      <div className="space-y-6">
        {/* Admin Header */}
        <div className="flex items-center justify-between pb-5 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-black font-bold shadow-md shadow-amber-500/20 shrink-0">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                PRIMART <span className="text-amber-600">Admin</span>
              </h2>
              <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Superviseur Actif
              </span>
            </div>
          </div>
          {/* Bouton fermer visible uniquement sur mobile dans le tiroir */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Fermer le menu latéral"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav items */}
        <nav className="space-y-1.5" aria-label="Menu du tableau de bord">
          {adminMenu.map((item) => {
            const Icon = item.icon;
            const active = isCurrent(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  active
                    ? 'bg-amber-500 text-black shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.title}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ml-2 ${
                      active ? 'bg-black text-amber-400' : 'bg-red-500 text-white'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom return link */}
      <div className="pt-4 border-t border-slate-200">
        <Link
          to="/"
          onClick={() => setSidebarOpen(false)}
          className="flex items-center gap-2 text-xs text-slate-500 hover:text-amber-600 transition-colors p-2.5 rounded-lg hover:bg-slate-100"
        >
          <ArrowLeft className="w-4 h-4 shrink-0" />
          <span>Retour au site public</span>
        </Link>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* ─────────────────────────────────────────────────────────────
          1. SIDEBAR FIXE DESKTOP (Ancrée à gauche, ne défile jamais avec la page)
      ───────────────────────────────────────────────────────────── */}
      <aside
        aria-label="Menu administration principal"
        className="hidden lg:flex fixed inset-y-0 left-0 z-30 w-72 bg-white border-r border-slate-200 p-5 flex-col justify-between shadow-xs overflow-y-auto"
      >
        {renderNavContent()}
      </aside>

      {/* ─────────────────────────────────────────────────────────────
          2. TOPBAR MOBILE (Sticky en haut avec bouton d'ouverture du tiroir)
      ───────────────────────────────────────────────────────────── */}
      <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-1 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors active:scale-95"
            aria-label="Ouvrir le menu latéral"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500 flex items-center justify-center text-black font-bold">
              <Trophy className="w-4 h-4" />
            </div>
            <span className="font-display font-extrabold text-slate-900 text-sm">
              PRIMART <span className="text-amber-600">Admin</span>
            </span>
          </div>
        </div>

        {/* Badges d'alertes résumés sur la topbar mobile */}
        <div className="flex items-center gap-2">
          {pendingCandidatesCount > 0 && (
            <Link
              to="/admin/moderation"
              className="text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 rounded-full"
              title={`${pendingCandidatesCount} candidats en attente`}
            >
              {pendingCandidatesCount} cand.
            </Link>
          )}
          {suspectVotesCount > 0 && (
            <Link
              to="/admin/votes"
              className="text-[10px] font-bold bg-red-100 text-red-700 border border-red-300 px-2 py-0.5 rounded-full"
              title={`${suspectVotesCount} votes suspects`}
            >
              {suspectVotesCount} alertes
            </Link>
          )}
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────
          3. DRAWER MOBILE GLISSANT DEPUIS LA GAUCHE (Off-canvas)
      ───────────────────────────────────────────────────────────── */}
      {/* Backdrop sombre semi-transparent */}
      <div
        className={`lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-xs transition-opacity duration-300 ease-in-out ${
          sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />

      {/* Volet coulissant depuis la gauche */}
      <aside
        aria-label="Menu latéral mobile"
        className={`lg:hidden fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-white p-5 flex flex-col justify-between shadow-2xl border-r border-slate-200 overflow-y-auto transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {renderNavContent()}
      </aside>

      {/* ─────────────────────────────────────────────────────────────
          4. ZONE DE CONTENU PRINCIPALE (Décalée de 72 sur Desktop pour la sidebar fixe)
      ───────────────────────────────────────────────────────────── */}
      <main className="flex-1 lg:pl-72 min-w-0">
        <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
