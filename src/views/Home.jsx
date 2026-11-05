import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { CATEGORIES } from '@/data/categoriesData';
import { CountdownTimer } from '@/components/shared/CountdownTimer';
import { CandidateCard } from '@/components/shared/CandidateCard';
import {
  ArrowRight,
  Award,
  ChevronDown,
  HeartHandshake,
  Mail,
  Music,
  Palette,
  RefreshCw,
  Sparkles,
  Trophy,
  Users,
  Theater,
  Film,
  ShieldCheck,
  Globe2,
} from 'lucide-react';

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1535016120720-40c646be5580?auto=format&fit=crop&w=2200&q=80';

const faqs = [
  {
    question: 'Comment voter gratuitement ?',
    answer:
      "Ouvrez la fiche de votre artiste favori et cliquez sur Voter. Renseignez votre e-mail ou numéro de téléphone pour recevoir un code à usage unique. Chaque citoyen dispose d'un vote gratuit offert par jour.",
  },
  {
    question: 'Un compte est-il nécessaire pour voter ?',
    answer:
      "Non. La vérification par code SMS ou e-mail suffit. Aucun mot de passe n'est requis pour les supporters.",
  },
  {
    question: "Comment soumettre une candidature d'artiste ?",
    answer:
      'Créez un compte avec un e-mail vérifié et complétez les trois étapes du formulaire : identité, discipline parmi les 52 catégories, puis médias et biographie. Le comité examine les dossiers sous 48h.',
  },
  {
    question: "Comment est garantie l'équité du concours ?",
    answer:
      "Chaque vote est horodaté et soumis à notre moteur d'analyse comportementale. Les votes automatisés ou suspects sont mis en quarantaine et examinés avant tout comptage.",
  },
];

function AnimatedCount({ value, loading }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const target = Number(value) || 0;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setCount(target);
      return;
    }
    const start = performance.now();
    const duration = 800;
    let frameId;
    const animate = (now) => {
      const p = Math.min((now - start) / duration, 1);
      setCount(Math.round(target * (1 - (1 - p) ** 3)));
      if (p < 1) frameId = requestAnimationFrame(animate);
    };
    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [value]);
  return (
    <span aria-label={loading ? 'Chargement' : String(value)}>
      {loading ? '—' : count.toLocaleString('fr-FR')}
    </span>
  );
}

function CategoryIcon({ id }) {
  const cls = 'h-5 w-5';
  if (id === 'musique') return <Music className={cls} />;
  if (id === 'danse') return <Sparkles className={cls} />;
  if (id === 'humour' || id === 'theatre') return <Theater className={cls} />;
  if (id === 'arts' || id === 'mode') return <Palette className={cls} />;
  if (id === 'cinema') return <Film className={cls} />;
  return <Trophy className={cls} />;
}

function CandidateSkeleton() {
  return (
    <div className="w-[min(84vw,290px)] shrink-0 overflow-hidden rounded-sm border border-stone-200 bg-white sm:w-[290px]">
      <div className="aspect-[4/3] animate-pulse bg-stone-100" />
      <div className="space-y-3 p-5">
        <div className="h-4 w-2/3 animate-pulse rounded-sm bg-stone-100" />
        <div className="h-3 w-1/2 animate-pulse rounded-sm bg-stone-50" />
        <div className="h-9 animate-pulse rounded-sm bg-stone-50" />
      </div>
    </div>
  );
}

export default function Home() {
  const { candidates, eventSettings, loading, dataError, refreshData } = useApp();
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);
  const [catFilter, setCatFilter] = useState('Tous');

  const accepted = useMemo(
    () =>
      candidates
        .filter((c) => c.status === 'Accepté')
        .sort((a, b) => (b.votesTotal || 0) - (a.votesTotal || 0)),
    [candidates]
  );

  const featured = useMemo(() => {
    const pool = catFilter === 'Tous' ? accepted : accepted.filter((c) => c.category === catFilter || c.categoryId === catFilter);
    return pool.slice(0, 10);
  }, [accepted, catFilter]);

  const prizeCount = CATEGORIES.reduce((t, c) => t + c.prizesCount, 0);

  useEffect(() => {
    const fn = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', fn);
    window.addEventListener('offline', fn);
    return () => { window.removeEventListener('online', fn); window.removeEventListener('offline', fn); };
  }, []);

  return (
    <div className="bg-[#F7F5F2]">

      {/* Offline banner */}
      {!isOnline && (
        <p role="status" className="bg-amber-100 px-4 py-2 text-center text-xs font-semibold text-amber-900">
          Vous êtes hors ligne — les données peuvent être obsolètes.
        </p>
      )}

      {/* ═══════════════════════════════════════════════
          HERO — PRESTIGE INSTITUTIONNEL
      ══════════════════════════════════════════════════ */}
      <section className="relative min-h-[85vh] flex items-end overflow-hidden bg-[#0F1117]">

        {/* Background photo — dark-tinted, calm */}
        <img
          src={HERO_IMAGE}
          alt=""
          aria-hidden="true"
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover opacity-20"
        />

        {/* Subtle vertical grain overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F1117] via-[#0F1117]/60 to-transparent" />

        {/* Gold accent line — left edge */}
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#B8973E]" />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 pb-20 sm:px-8 lg:px-10 pt-32">
          <div className="max-w-4xl">

            {/* Pre-title */}
            <div className="flex items-center gap-4 mb-8">
              <div className="h-px w-12 bg-[#B8973E]" />
              <span className="text-[#B8973E] text-xs font-semibold uppercase tracking-[.25em]">
                {eventSettings.eventName || 'PRIMART Awards 2028'} · Festival des Talents d'Afrique
              </span>
            </div>

            {/* Main title */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-[1.05] tracking-tight">
              Célébrer l'excellence<br />
              <span className="text-[#B8973E]">artistique africaine.</span>
            </h1>

            <p className="mt-8 max-w-2xl text-base text-stone-300 leading-7">
              52 prix officiels récompensant les meilleurs talents en musique, danse, arts de la scène, mode et cinéma. Un concours ouvert, transparent et entièrement certifié.
            </p>

            {/* Two primary actions only */}
            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Link
                to="/candidats"
                className="inline-flex items-center justify-center h-13 px-8 bg-[#B8973E] text-[#0F1117] text-sm font-black tracking-wide hover:bg-[#C9A84C] transition-colors duration-300"
              >
                Découvrir les candidats
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link
                to="/candidater"
                className="inline-flex items-center justify-center h-13 px-8 border border-white/30 text-white text-sm font-semibold tracking-wide hover:border-[#B8973E] hover:text-[#B8973E] transition-colors duration-300"
              >
                <Award className="mr-2 h-4 w-4" />
                Soumettre ma candidature
              </Link>
            </div>

            {/* Stats row */}
            <div className="mt-16 pt-8 border-t border-white/10 grid grid-cols-3 gap-6 max-w-lg">
              {[
                { value: prizeCount, label: 'Prix officiels' },
                { value: CATEGORIES.length, label: 'Disciplines' },
                { value: accepted.length, label: 'Talents validés' },
              ].map(({ value, label }) => (
                <div key={label}>
                  <div className="text-3xl font-black text-white">
                    <AnimatedCount value={value} loading={loading} />
                  </div>
                  <div className="mt-1 text-xs text-stone-400 font-medium uppercase tracking-widest">
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll cue */}
        <a
          href="#countdown"
          className="absolute bottom-6 right-8 z-10 flex items-center gap-2 text-xs text-stone-400 hover:text-[#B8973E] transition-colors"
        >
          Continuer <ChevronDown className="h-4 w-4" />
        </a>
      </section>

      {/* ═══════════════════════════════════════════════
          COUNTDOWN + CATEGORIES SECTION
      ══════════════════════════════════════════════════ */}
      <section id="countdown" className="bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-20 grid lg:grid-cols-2 gap-16 items-start">

          {/* Countdown block */}
          <div>
            <div className="flex items-center gap-4 mb-6">
              <div className="h-px w-8 bg-[#B8973E]" />
              <span className="text-[#B8973E] text-xs font-semibold uppercase tracking-[.25em]">
                Calendrier officiel
              </span>
            </div>
            <h2 className="text-3xl font-black text-[#0F1117] tracking-tight mb-6">
              Compte à rebours
            </h2>
            <CountdownTimer className="border border-stone-200 rounded-sm shadow-none bg-[#F7F5F2]" />
            <p className="mt-4 text-xs text-stone-400 leading-relaxed">
              L'ouverture et la clôture des votes sont contrôlées par le serveur du comité organisateur. Ces dates sont indicatives.
            </p>
          </div>

          {/* Quick filters by category */}
          <div>
            <div className="flex items-center gap-4 mb-6">
              <div className="h-px w-8 bg-[#B8973E]" />
              <span className="text-[#B8973E] text-xs font-semibold uppercase tracking-[.25em]">
                Chiffres du festival
              </span>
            </div>
            <h2 className="text-3xl font-black text-[#0F1117] tracking-tight mb-6">
              5 Disciplines, 52 Trophées
            </h2>
            <div className="space-y-3">
              {CATEGORIES.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center justify-between py-4 border-b border-stone-100"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 flex items-center justify-center bg-stone-100 text-[#B8973E]">
                      <CategoryIcon id={cat.id} />
                    </div>
                    <div>
                      <div className="font-bold text-[#0F1117] text-sm">{cat.name}</div>
                      <div className="text-xs text-stone-400">{cat.prizesCount} prix officiels</div>
                    </div>
                  </div>
                  <Link
                    to={`/categories`}
                    className="text-xs font-semibold text-[#B8973E] hover:underline underline-offset-4"
                  >
                    Voir les prix →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          TALENT CAROUSEL — SPOTLIGHT
      ══════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-24" id="talents">

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-4 mb-4">
              <div className="h-px w-8 bg-[#B8973E]" />
              <span className="text-[#B8973E] text-xs font-semibold uppercase tracking-[.25em]">
                En compétition
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-[#0F1117] tracking-tight">
              Les Talents PRIMART 2028
            </h2>
          </div>
          <Link
            to="/classement"
            className="text-sm font-semibold text-[#B8973E] hover:underline underline-offset-4 whitespace-nowrap"
          >
            Voir le classement complet →
          </Link>
        </div>

        {/* Category filter pills — restrained styling */}
        <div className="flex flex-wrap gap-2 mb-8">
          {['Tous', ...CATEGORIES.map((c) => c.name)].map((name) => (
            <button
              key={name}
              onClick={() => setCatFilter(name)}
              className={`px-4 py-1.5 text-xs font-semibold tracking-wide border transition-colors duration-200 ${
                catFilter === name
                  ? 'bg-[#0F1117] text-white border-[#0F1117]'
                  : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400'
              }`}
            >
              {name}
            </button>
          ))}
        </div>

        {/* Error state */}
        {dataError && (
          <div className="mb-6 p-4 border border-red-200 bg-red-50 text-sm text-red-800 flex items-center justify-between">
            <span>Impossible de charger les données. Vérifiez votre connexion.</span>
            <button
              onClick={() => void refreshData()}
              disabled={loading || !isOnline}
              className="flex items-center gap-1.5 text-xs font-semibold underline underline-offset-2"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Réessayer
            </button>
          </div>
        )}

        {/* Cards */}
        {loading ? (
          <div className="home-talent-track flex gap-5 overflow-hidden pb-4">
            {Array.from({ length: 4 }, (_, i) => <CandidateSkeleton key={i} />)}
          </div>
        ) : featured.length ? (
          <>
            <div
              role="region"
              aria-label="Talents en compétition"
              tabIndex={0}
              className="home-talent-track flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4"
            >
              {featured.map((c) => (
                <div key={c.id} className="w-[min(84vw,290px)] shrink-0 snap-start sm:w-[290px]">
                  <CandidateCard candidate={c} />
                </div>
              ))}
            </div>
            <p className="mt-2 text-center text-xs text-stone-400 sm:hidden">
              Faites glisser pour voir tous les candidats.
            </p>
          </>
        ) : (
          <div className="border border-stone-200 bg-white py-20 text-center">
            <Trophy className="h-10 w-10 text-stone-200 mx-auto mb-4" />
            <h3 className="text-base font-bold text-[#0F1117] mb-2">Les talents arrivent bientôt</h3>
            <p className="text-sm text-stone-500 max-w-md mx-auto">
              Les candidatures validées par le comité apparaîtront automatiquement ici.
            </p>
            <Link
              to="/candidater"
              className="inline-flex items-center gap-2 mt-6 text-sm font-semibold text-[#B8973E] hover:underline underline-offset-4"
            >
              Déposer une candidature <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </section>

      {/* ═══════════════════════════════════════════════
          3 COMMITMENTS — WHY PRIMART
      ══════════════════════════════════════════════════ */}
      <section className="bg-white border-t border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-24">

          <div className="max-w-2xl mb-14">
            <div className="flex items-center gap-4 mb-5">
              <div className="h-px w-8 bg-[#B8973E]" />
              <span className="text-[#B8973E] text-xs font-semibold uppercase tracking-[.25em]">
                Notre engagement
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-[#0F1117] tracking-tight">
              Un concours fondé sur la transparence et le mérite.
            </h2>
          </div>

          <div className="grid gap-px bg-stone-200 sm:grid-cols-3">
            {[
              {
                icon: <ShieldCheck className="h-6 w-6" />,
                title: 'Vote certifié',
                body: 'Chaque vote est horodaté et vérifié. Notre moteur anti-fraude identifie et met en quarantaine les votes automatisés en temps réel.',
              },
              {
                icon: <Users className="h-6 w-6" />,
                title: 'Accès universel',
                body: 'Un vote gratuit est offert chaque jour à chaque participant, sans compte et sans barrière financière. La popularité populaire compte.',
              },
              {
                icon: <Globe2 className="h-6 w-6" />,
                title: 'Rayonnement panafricain',
                body: "Les lauréats bénéficient d'une vitrine auprès des festivals, producteurs et médias partenaires à travers le continent et la diaspora.",
              },
            ].map(({ icon, title, body }) => (
              <div key={title} className="bg-white p-10">
                <div className="text-[#B8973E] mb-5">{icon}</div>
                <h3 className="font-bold text-[#0F1117] text-base mb-3">{title}</h3>
                <p className="text-sm text-stone-500 leading-6">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          PARTNER INVITATION — DARK SECTION
      ══════════════════════════════════════════════════ */}
      <section className="bg-[#0F1117] relative overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#B8973E]" />
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-24 grid lg:grid-cols-[1fr_auto] gap-12 items-center">
          <div>
            <div className="flex items-center gap-4 mb-6">
              <div className="h-px w-8 bg-[#B8973E]" />
              <span className="text-[#B8973E] text-xs font-semibold uppercase tracking-[.25em]">
                Partenaires & Mécènes
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-5">
              Associez votre institution au rayonnement culturel africain.
            </h2>
            <p className="text-stone-400 text-sm leading-7 max-w-xl">
              Médias, marques, fondations et institutions culturelles : rejoignez le comité de partenaires officiels et participez à la valorisation des meilleurs créateurs du continent.
            </p>
          </div>
          <div className="shrink-0">
            <a
              href="mailto:support@primart2028.org?subject=Partenariat%20PRIMART"
              className="inline-flex items-center gap-2 h-13 px-8 bg-[#B8973E] text-[#0F1117] text-sm font-black tracking-wide hover:bg-[#C9A84C] transition-colors whitespace-nowrap"
            >
              <HeartHandshake className="h-4 w-4" />
              Devenir partenaire officiel
            </a>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          FAQ
      ══════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-24 grid lg:grid-cols-[1fr_1.5fr] gap-20">
        <div>
          <div className="flex items-center gap-4 mb-5">
            <div className="h-px w-8 bg-[#B8973E]" />
            <span className="text-[#B8973E] text-xs font-semibold uppercase tracking-[.25em]">
              Informations pratiques
            </span>
          </div>
          <h2 className="text-3xl font-black text-[#0F1117] tracking-tight mb-6">
            Questions fréquentes
          </h2>
          <p className="text-sm text-stone-500 leading-6">
            Pour toute question spécifique, notre équipe est disponible à l'adresse ci-dessous.
          </p>
          <a
            href="mailto:support@primart2028.org"
            className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#B8973E] hover:underline underline-offset-4"
          >
            <Mail className="h-4 w-4" />
            support@primart2028.org
          </a>
        </div>

        <div className="divide-y divide-stone-200">
          {faqs.map((item, i) => (
            <details key={item.question} className="group py-5" open={i === 0}>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-bold text-[#0F1117] marker:hidden">
                {item.question}
                <ChevronDown className="h-4 w-4 shrink-0 text-[#B8973E] transition-transform group-open:rotate-180" />
              </summary>
              <p className="mt-4 pr-6 text-sm leading-6 text-stone-500">{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          FINAL CTA BAND
      ══════════════════════════════════════════════════ */}
      <section className="bg-white border-t border-stone-200">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-16 flex flex-col sm:flex-row items-center justify-between gap-8">
          <div>
            <p className="text-xs text-[#B8973E] font-semibold uppercase tracking-[.25em] mb-1">
              PRIMART Awards 2028
            </p>
            <h2 className="text-2xl font-black text-[#0F1117] tracking-tight">
              Votre voix contribue à révéler les talents de demain.
            </h2>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Link
              to="/candidats"
              className="inline-flex items-center justify-center h-12 px-8 bg-[#0F1117] text-white text-sm font-black tracking-wide hover:bg-[#B8973E] hover:text-[#0F1117] transition-colors duration-300"
            >
              Voter maintenant
            </Link>
            <Link
              to="/candidater"
              className="inline-flex items-center justify-center h-12 px-8 border border-stone-300 text-[#0F1117] text-sm font-semibold hover:border-[#B8973E] hover:text-[#B8973E] transition-colors duration-300"
            >
              Candidater à l'édition 2028
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
