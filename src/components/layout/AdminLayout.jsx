import React, { useState } from 'react';
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
  Bell,
  Lock,
  Trophy,
  Layers
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { candidates, suspectVotes, session, isAdmin, authLoading, adminRoleLoading, adminRoleError } = useApp();

  const pendingCandidatesCount = candidates.filter(c => c.status === "En attente" || c.status === "Correction demandée").length;
  const suspectVotesCount = suspectVotes.filter(s => s.status === "En quarantaine").length;

  const adminMenu = [
    {
      title: "Vue d'ensemble",
      path: "/admin",
      icon: LayoutDashboard,
      badge: null
    },
    {
      title: "Catégories & Prix",
      path: "/admin/categories",
      icon: Layers,
      badge: null
    },
    {
      title: "Modération Candidats",
      path: "/admin/moderation",
      icon: UserCheck,
      badge: pendingCandidatesCount > 0 ? pendingCandidatesCount : null
    },
    {
      title: "Votes & Anti-Fraude",
      path: "/admin/votes",
      icon: ShieldAlert,
      badge: suspectVotesCount > 0 ? `${suspectVotesCount} alertes` : null
    },
    {
      title: "Paiements & Finance",
      path: "/admin/paiements",
      icon: CreditCard,
      badge: null
    },
    {
      title: "Paramètres & Clôture",
      path: "/admin/parametres",
      icon: Settings,
      badge: null
    }
  ];

  const isCurrent = (path) => {
    if (path === "/admin") return location.pathname === "/admin";
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
        <Link to="/" className="text-sm font-semibold text-amber-700 hover:underline">Retour à l’accueil</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col lg:flex-row">
      
      {/* Sidebar for Desktop */}
      <aside className="hidden lg:flex flex-col w-72 bg-white border-r border-slate-200 p-5 shrink-0 justify-between shadow-xs">
        <div className="space-y-6">
          
          {/* Admin Header */}
          <div className="flex items-center gap-3 pb-5 border-b border-slate-200">
            <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-black font-bold shadow-md shadow-amber-500/20">
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

          {/* Nav items */}
          <nav className="space-y-1.5">
            {adminMenu.map(item => {
              const Icon = item.icon;
              const active = isCurrent(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    active
                      ? "bg-amber-500 text-black shadow-xs font-bold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.title}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${active ? 'bg-black text-amber-400' : 'bg-red-500 text-white'}`}>
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
            className="flex items-center gap-2 text-xs text-slate-500 hover:text-amber-600 transition-colors p-2 rounded-lg hover:bg-slate-100"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour au site public</span>
          </Link>
        </div>
      </aside>

      {/* Mobile Topbar */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-500" />
          <span className="font-display font-bold text-slate-900 text-sm">PRIMART Admin</span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg bg-slate-100 text-slate-600"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {sidebarOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 p-4 space-y-2 shadow-lg">
          {adminMenu.map(item => {
            const Icon = item.icon;
            const active = isCurrent(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center justify-between p-2.5 rounded-lg text-xs font-semibold ${
                  active ? "bg-amber-500 text-black font-bold" : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  <span>{item.title}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] bg-red-500 text-white px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
          <div className="pt-3 border-t border-slate-200">
            <Link
              to="/"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-2 text-xs text-slate-500 hover:text-amber-600"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Retour au site public</span>
            </Link>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto bg-slate-50">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
