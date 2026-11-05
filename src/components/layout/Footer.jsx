import React from 'react';
import { Link } from 'react-router-dom';
import { Trophy, ShieldCheck, Mail, Phone, ArrowRight } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-[#0F1117] text-stone-400 text-xs border-t border-white/5">

      {/* Top section */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">

          {/* Brand column — 2 cols */}
          <div className="lg:col-span-2 space-y-5">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-9 h-9 bg-[#B8973E] flex items-center justify-center">
                <Trophy className="w-4 h-4 text-[#0F1117]" />
              </div>
              <div>
                <span className="font-black text-white text-base tracking-tight">PRIMART</span>
                <span className="font-light text-white text-base tracking-tight ml-1.5">Awards</span>
                <div className="text-[9px] text-stone-500 uppercase tracking-widest mt-0.5">
                  Édition 2028
                </div>
              </div>
            </Link>

            <p className="text-stone-400 leading-relaxed max-w-sm text-xs">
              La plus grande célébration annuelle des talents artistiques et culturels d'Afrique et de sa diaspora. 52 prix officiels, 5 disciplines, une exigence d'excellence et de transparence.
            </p>

            <div className="flex items-center gap-2 text-emerald-400 text-xs font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              Concours certifié anti-fraude — votes horodatés
            </div>

            <div className="pt-2">
              <span className="inline-block text-[10px] font-semibold uppercase tracking-[.2em] text-stone-500 border border-stone-700 px-3 py-1">
                #PRIMART2028 · #LaVoixDesTalents
              </span>
            </div>
          </div>

          {/* Nav column */}
          <div className="space-y-4">
            <h4 className="text-white text-xs font-bold uppercase tracking-[.18em]">Le Festival</h4>
            <ul className="space-y-2.5">
              <li><Link to="/candidats" className="hover:text-[#B8973E] transition-colors">Tous les candidats</Link></li>
              <li><Link to="/categories" className="hover:text-[#B8973E] transition-colors">Les 52 prix officiels</Link></li>
              <li><Link to="/classement" className="hover:text-[#B8973E] transition-colors">Classement en direct</Link></li>
              <li><Link to="/direct-tv" className="hover:text-[#B8973E] transition-colors">Mode diffusion TV</Link></li>
              <li><Link to="/resultats" className="hover:text-[#B8973E] transition-colors">Palmarès & lauréats</Link></li>
            </ul>
          </div>

          {/* Talents & rules */}
          <div className="space-y-4">
            <h4 className="text-white text-xs font-bold uppercase tracking-[.18em]">Talents & Support</h4>
            <ul className="space-y-2.5">
              <li>
                <Link to="/candidater" className="text-[#B8973E] hover:text-amber-300 font-semibold transition-colors">
                  Déposer ma candidature →
                </Link>
              </li>
              <li><Link to="/candidat-dashboard" className="hover:text-[#B8973E] transition-colors">Mon espace candidat</Link></li>
              <li><span className="hover:text-[#B8973E] cursor-pointer transition-colors">Règlement officiel (PDF)</span></li>
              <li><span className="hover:text-[#B8973E] cursor-pointer transition-colors">Comment voter gratuitement</span></li>
              <li><span className="hover:text-[#B8973E] cursor-pointer transition-colors">Conditions générales</span></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="text-white text-xs font-bold uppercase tracking-[.18em]">Contact</h4>
            <p className="text-stone-400 leading-relaxed text-xs">
              Notre équipe vous répond du lundi au vendredi de 9h à 18h (GMT).
            </p>
            <div className="space-y-2.5">
              <a
                href="mailto:support@primart2028.org"
                className="flex items-center gap-2 hover:text-[#B8973E] transition-colors"
              >
                <Mail className="w-3.5 h-3.5 text-[#B8973E] shrink-0" />
                support@primart2028.org
              </a>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#B8973E] shrink-0" />
                +225 27 20 00 00 00
              </div>
            </div>
            <div className="pt-2 text-[10px] text-stone-600 leading-relaxed border-t border-white/5 pt-3">
              Paiements : Wave · Orange Money · MTN · Moov · CB Visa & Mastercard
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-stone-600">
          <p>© 2026-2028 PRIMART Awards. Tous droits réservés.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-stone-400 cursor-pointer transition-colors">Mentions légales</span>
            <span className="hover:text-stone-400 cursor-pointer transition-colors">Politique de confidentialité</span>
            <Link to="/admin" className="hover:text-stone-400 transition-colors">Administration</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
