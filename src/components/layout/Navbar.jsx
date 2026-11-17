import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import {
  Trophy,
  Menu,
  X,
  UserCheck,
  LogIn,
  ShieldAlert,
} from 'lucide-react';

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { eventSettings, session } = useApp();
  const accountAction = session
    ? { label: 'Mon espace', path: '/candidat-dashboard' }
    : { label: 'Connexion', path: '/connexion' };

  const navLinks = [
    { label: "Candidats", path: "/candidats" },
    { label: "52 Prix", path: "/categories" },
    { label: "Classement", path: "/classement" },
    { label: "Palmarès", path: "/resultats" },
    { label: "Contact", path: "/contact" },
  ];

  const isActive = (path) => {
    if (path === "/" && location.pathname !== "/") return false;
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-50 w-full">

      {/* Status bar — only shown when votes are open */}
      {eventSettings.votesOpen && (
        <div className="bg-[#0F1117] text-center py-2 px-4">
          <p className="text-xs text-[#B8973E] font-semibold tracking-widest uppercase">
            Les votes sont actuellement ouverts · 1 vote gratuit par personne et par jour
          </p>
        </div>
      )}

      {/* Main navigation */}
      <div className="bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">

            {/* Brand */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-sm bg-[#0F1117] flex items-center justify-center group-hover:bg-[#B8973E] transition-colors duration-300">
                <Trophy className="w-4 h-4 text-[#B8973E] group-hover:text-[#0F1117]" />
              </div>
              <div>
                <span className="font-display font-black text-[#0F1117] text-lg tracking-tight">
                  PRIMART
                </span>
                <span className="font-display font-light text-[#0F1117] text-lg tracking-tight ml-1.5">
                  Awards
                </span>
                <div className="text-[9px] text-stone-400 font-semibold uppercase tracking-[.2em] leading-none mt-0.5">
                  Édition 2028
                </div>
              </div>
            </Link>

            {/* Desktop nav links */}
            <nav className="hidden lg:flex items-center gap-8">
              {navLinks.map(link => {
                const active = isActive(link.path);
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`text-sm font-medium transition-colors duration-200 pb-0.5 ${
                      active
                        ? 'text-[#B8973E] border-b-2 border-[#B8973E]'
                        : 'text-stone-500 hover:text-[#0F1117]'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* Right actions */}
            <div className="hidden sm:flex items-center gap-3">
              {/* Primary CTA */}
              <Link to="/candidats">
                <button className="ml-2 h-10 px-5 bg-[#0F1117] text-white text-sm font-semibold hover:bg-[#B8973E] transition-colors duration-300 tracking-wide">
                  Voter maintenant
                </button>
              </Link>

              <Link to={accountAction.path}>
                <button className="h-10 px-5 border border-stone-300 text-[#0F1117] text-sm font-semibold hover:border-[#B8973E] hover:text-[#B8973E] transition-colors duration-300 tracking-wide">
                  {session ? <UserCheck className="mr-1.5 inline h-4 w-4" /> : <LogIn className="mr-1.5 inline h-4 w-4" />}
                  {accountAction.label}
                </button>
              </Link>

              {/* <Link to="/admin" title="Administration">
                <button className="p-2 text-stone-300 hover:text-stone-600 transition-colors">
                  <ShieldAlert className="w-4 h-4" />
                </button>
              </Link> */}
            </div>

            {/* Mobile toggle */}
            <div className="flex sm:hidden items-center gap-2">
              <Link to="/candidats">
                <button className="h-9 px-4 bg-[#0F1117] text-white text-xs font-semibold tracking-wide">
                  Voter
                </button>
              </Link>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-stone-700"
                aria-label="Menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-white border-b border-stone-200 px-6 py-6 space-y-1 shadow-sm">
          {navLinks.map(link => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`block py-3 text-sm font-medium border-b border-stone-100 ${
                isActive(link.path) ? 'text-[#B8973E]' : 'text-stone-700'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-4 space-y-2">
            <Link to={accountAction.path} onClick={() => setMobileMenuOpen(false)}>
              <button className="w-full h-11 border border-stone-300 text-sm font-semibold text-[#0F1117]">
                {session ? <UserCheck className="mr-2 inline h-4 w-4" /> : <LogIn className="mr-2 inline h-4 w-4" />}
                {accountAction.label}
              </button>
            </Link>
            <Link to="/admin" onClick={() => setMobileMenuOpen(false)}>
              <button className="w-full text-sm text-stone-400 py-2 flex items-center justify-center gap-2">
                <ShieldAlert className="w-4 h-4" /> Administration
              </button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
