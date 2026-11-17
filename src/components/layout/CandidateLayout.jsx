import React, { useEffect, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, ClipboardCheck, LayoutDashboard, LogOut, Menu, Trophy, UserRound, X } from 'lucide-react';
import { useApp } from '@/context/AppContext';

const candidateMenu = [
  { title: "Vue d'ensemble", value: 'promotion', icon: LayoutDashboard },
  { title: 'Mon profil', value: 'profile', icon: UserRound },
  { title: 'Suivi du dossier', value: 'status', icon: ClipboardCheck },
];

export function CandidateLayout({ candidate, activeSection, onSectionChange, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { session, authLoading, signOut, showToast } = useApp();

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [sidebarOpen]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && sidebarOpen) setSidebarOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sidebarOpen]);

  const handleSignOut = async () => {
    try {
      await signOut();
      showToast('Déconnexion réussie', '', 'success');
      navigate('/connexion', { replace: true });
    } catch (error) {
      showToast('Déconnexion impossible', error.message, 'destructive');
    }
  };

  const renderNavigation = () => (
    <>
      <div>
        <div className="flex items-center justify-between border-b border-slate-200 pb-5">
          <div className="flex min-w-0 items-center gap-3">
            {candidate?.photo ? (
              <img src={candidate.photo} alt="" className="h-10 w-10 shrink-0 rounded-xl object-cover" />
            ) : (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500 font-bold text-black">
                <Trophy className="h-5 w-5" />
              </div>
            )}
            <div className="min-w-0">
              <h2 className="truncate font-display text-sm font-extrabold text-slate-900">
                PRIMART <span className="text-amber-600">Candidat</span>
              </h2>
              <p className="truncate text-[11px] text-slate-500">
                {candidate ? candidate.stageName || candidate.name : 'Espace personnel'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 lg:hidden"
            aria-label="Fermer le menu candidat"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {candidate ? (
          <nav className="mt-6 space-y-1.5" aria-label="Navigation de l’espace candidat">
            {candidateMenu.map(item => {
              const Icon = item.icon;
              const active = activeSection === item.value;
              return (
                <button
                  key={item.value}
                  type="button"
                  aria-current={active ? 'page' : undefined}
                  onClick={() => {
                    onSectionChange(item.value);
                    setSidebarOpen(false);
                  }}
                  className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left text-sm font-semibold transition-colors ${
                    active
                      ? 'bg-amber-500 text-black shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.title}</span>
                </button>
              );
            })}
          </nav>
        ) : (
          <p className="mt-6 rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-500">
            Aucun dossier candidat n’est associé à ce compte.
          </p>
        )}
      </div>

      <div className="space-y-1 border-t border-slate-200 pt-4">
        <Link
          to="/"
          onClick={() => setSidebarOpen(false)}
          className="flex items-center gap-2 rounded-lg p-2.5 text-xs text-slate-500 transition-colors hover:bg-slate-100 hover:text-amber-700"
        >
          <ArrowLeft className="h-4 w-4 shrink-0" />
          Retour au site public
        </Link>
        <button
          type="button"
          onClick={() => void handleSignOut()}
          className="flex w-full items-center gap-2 rounded-lg p-2.5 text-left text-xs text-slate-500 transition-colors hover:bg-slate-100 hover:text-red-600"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Déconnexion
        </button>
      </div>
    </>
  );

  if (authLoading) {
    return <p role="status" className="p-8 text-center text-sm text-slate-600">Vérification de votre session…</p>;
  }

  if (!session) {
    return <Navigate to="/connexion" state={{ from: location.pathname }} replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <aside
        aria-label="Navigation principale de l’espace candidat"
        className="fixed inset-y-0 left-0 z-30 hidden w-72 flex-col justify-between overflow-y-auto border-r border-slate-200 bg-white p-5 shadow-sm lg:flex"
      >
        {renderNavigation()}
      </aside>

      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/95 px-4 py-3 shadow-sm backdrop-blur lg:hidden">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="-ml-1 rounded-xl bg-slate-100 p-2 text-slate-700 transition-colors hover:bg-slate-200"
            aria-label="Ouvrir le menu candidat"
            aria-expanded={sidebarOpen}
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex min-w-0 items-center gap-2">
            <Trophy className="h-5 w-5 shrink-0 text-amber-600" />
            <span className="truncate font-display text-sm font-extrabold text-slate-900">
              {candidate ? candidate.stageName || candidate.name : 'Espace candidat'}
            </span>
          </div>
        </div>
        {candidate && (
          <span className="ml-2 shrink-0 rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-semibold text-amber-800">
            {candidate.status}
          </span>
        )}
      </header>

      <div
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity lg:hidden ${
          sidebarOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />
      <aside
        aria-label="Menu candidat mobile"
        className={`fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col justify-between overflow-y-auto border-r border-slate-200 bg-white p-5 shadow-2xl transition-transform duration-300 lg:hidden ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {renderNavigation()}
      </aside>

      <main className="min-w-0 lg:pl-72">
        <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
