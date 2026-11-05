import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Clock, Flame } from 'lucide-react';

export function CountdownTimer({ variant = "hero", className = "" }) {
  const { eventSettings } = useApp();
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, totalMs: 0 });

  useEffect(() => {
    const calculateTime = () => {
      const target = new Date(eventSettings.endDate).getTime();
      const now = Date.now();
      const difference = target - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, totalMs: 0 });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds, totalMs: difference });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [eventSettings.endDate]);

  const isUrgent = timeLeft.totalMs > 0 && timeLeft.totalMs < 24 * 60 * 60 * 1000;
  const isClosed = !eventSettings.votesOpen;
  const hasDeadline = eventSettings.endDate && Number.isFinite(new Date(eventSettings.endDate).getTime());

  if (variant === "compact") {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-amber-300 text-xs font-medium text-amber-800 shadow-xs ${className}`}>
        <Clock className="w-3.5 h-3.5 text-amber-600" />
        {isClosed ? (
          <span className="text-red-600 font-bold">Votes clôturés</span>
        ) : (
          hasDeadline
            ? <span>Décompte indicatif : <strong className="text-slate-900">{timeLeft.days}j {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s</strong></span>
            : <span>Date de clôture à confirmer</span>
        )}
      </div>
    );
  }

  return (
    <div className={`glass-panel-gold rounded-3xl p-5 md:p-6 text-center max-w-xl mx-auto shadow-md border border-amber-200/80 ${className}`}>
      <div className="flex items-center justify-center gap-2 mb-3">
        {isUrgent ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-red-700 bg-red-100 px-3 py-1 rounded-full border border-red-200 animate-pulse">
            <Flame className="w-4 h-4 text-red-600" /> Dernière ligne droite
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-amber-800 bg-amber-100 px-3 py-1 rounded-full border border-amber-300/60">
            <Clock className="w-3.5 h-3.5 text-amber-600" /> Décompte indicatif
          </span>
        )}
      </div>

      <h4 className="text-sm md:text-base text-slate-700 font-medium mb-4">
        {isClosed ? "Les votes sont fermés par l’organisation" : hasDeadline ? "Temps restant estimé selon l’horloge de votre appareil :" : "Date de clôture à confirmer par l’organisation"}
      </h4>

      <div className="grid grid-cols-4 gap-2 md:gap-4 max-w-md mx-auto">
        <div className="bg-white border border-amber-200/60 rounded-2xl p-2.5 md:p-3 shadow-xs">
          <div className="text-2xl md:text-4xl font-extrabold text-amber-600 font-display">
            {hasDeadline ? String(timeLeft.days).padStart(2, '0') : '—'}
          </div>
          <div className="text-[10px] md:text-xs text-slate-500 uppercase tracking-wider mt-1 font-semibold">Jours</div>
        </div>

        <div className="bg-white border border-amber-200/60 rounded-2xl p-2.5 md:p-3 shadow-xs">
          <div className="text-2xl md:text-4xl font-extrabold text-amber-600 font-display">
            {hasDeadline ? String(timeLeft.hours).padStart(2, '0') : '—'}
          </div>
          <div className="text-[10px] md:text-xs text-slate-500 uppercase tracking-wider mt-1 font-semibold">Heures</div>
        </div>

        <div className="bg-white border border-amber-200/60 rounded-2xl p-2.5 md:p-3 shadow-xs">
          <div className="text-2xl md:text-4xl font-extrabold text-amber-600 font-display">
            {hasDeadline ? String(timeLeft.minutes).padStart(2, '0') : '—'}
          </div>
          <div className="text-[10px] md:text-xs text-slate-500 uppercase tracking-wider mt-1 font-semibold">Minutes</div>
        </div>

        <div className="bg-white border border-amber-200/60 rounded-2xl p-2.5 md:p-3 shadow-xs">
          <div className="text-2xl md:text-4xl font-extrabold text-amber-600 font-display">
            {hasDeadline ? String(timeLeft.seconds).padStart(2, '0') : '—'}
          </div>
          <div className="text-[10px] md:text-xs text-slate-500 uppercase tracking-wider mt-1 font-semibold">Secondes</div>
        </div>
      </div>
    </div>
  );
}
