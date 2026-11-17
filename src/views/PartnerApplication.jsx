import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Handshake, Send } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { PARTNER_CATEGORIES } from '@/data/partnerCategories';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const INITIAL_FORM = {
  organizationName: '',
  contactName: '',
  email: '',
  phone: '',
  category: '',
  website: '',
  publicDescription: '',
  message: '',
  consent: false,
};

export default function PartnerApplication() {
  const { submitPartnershipRequest } = useApp();
  const [form, setForm] = useState(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const updateField = (event) => {
    const { name, value, checked, type } = event.target;
    setForm(current => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitError('');
    setIsSubmitting(true);
    try {
      await submitPartnershipRequest({
        ...form,
        organizationName: form.organizationName.trim(),
        contactName: form.contactName.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        website: form.website.trim(),
        publicDescription: form.publicDescription.trim(),
        message: form.message.trim(),
      });
      setSubmitted(true);
      setForm(INITIAL_FORM);
    } catch (error) {
      setSubmitError(error.message || 'Votre demande n’a pas pu être envoyée. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[70vh] bg-[#F7F5F2] px-4 py-10 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-6xl">
        <Link to="/#partenaires" className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-stone-600 hover:text-[#B8973E]">
          <ArrowLeft className="h-4 w-4" />
          Retour aux partenaires
        </Link>

        <div className="mb-8 max-w-3xl">
          <div className="mb-4 flex items-center gap-3 text-[#B8973E]">
            <Handshake className="h-6 w-6" />
            <span className="text-xs font-semibold uppercase tracking-[.2em]">Partenariat PRIMART</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-[#0F1117] sm:text-4xl">Proposer un partenariat</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600">
            Présentez votre organisation et votre proposition. Notre équipe étudiera votre demande et vous recontactera.
          </p>
        </div>

        {submitted ? (
          <div role="status" className="rounded-2xl border border-emerald-200 bg-white p-8 shadow-sm sm:p-10">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
              <Send className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Demande envoyée</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Votre dossier est en attente d’examen par l’équipe PRIMART. Vos coordonnées ne seront pas publiées.
            </p>
            <Button type="button" variant="outline" className="mt-6" onClick={() => setSubmitted(false)}>
              Envoyer une autre demande
            </Button>
          </div>
        ) : (
          <div className="grid items-start gap-6 lg:grid-cols-[.85fr_1.15fr] lg:gap-8">
            <div className="relative min-h-[300px] overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm sm:min-h-[420px] lg:sticky lg:top-28 lg:h-[calc(100vh-9rem)] lg:min-h-[520px] lg:max-h-[760px]">
              <img
                src="/partenaire.jpg"
                alt="Deux partenaires scellent leur collaboration par une poignée de main."
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover object-[center_65%]"
              />
              <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-8">
                <p className="text-xs font-semibold uppercase tracking-[.2em] text-amber-300">Partenariat PRIMART</p>
                <p className="mt-2 max-w-sm text-xl font-bold leading-snug sm:text-2xl">
                  Ensemble, faisons rayonner les talents.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-8">
              {submitError && (
                <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                  {submitError}
                </p>
              )}

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="organizationName">Nom de l’organisation *</Label>
                  <Input id="organizationName" name="organizationName" value={form.organizationName} onChange={updateField} required minLength={2} maxLength={160} autoComplete="organization" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Type de partenariat *</Label>
                  <Select id="category" name="category" value={form.category} onChange={updateField} required>
                    <option value="" disabled>Choisir une catégorie</option>
                    {PARTNER_CATEGORIES.map(category => <option key={category} value={category}>{category}</option>)}
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactName">Nom de la personne à contacter *</Label>
                  <Input id="contactName" name="contactName" value={form.contactName} onChange={updateField} required minLength={2} maxLength={120} autoComplete="name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Adresse e-mail *</Label>
                  <Input id="email" name="email" type="email" value={form.email} onChange={updateField} required maxLength={254} autoComplete="email" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input id="phone" name="phone" type="tel" value={form.phone} onChange={updateField} maxLength={30} autoComplete="tel" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Site web</Label>
                  <Input id="website" name="website" type="url" value={form.website} onChange={updateField} maxLength={2048} placeholder="https://exemple.org" autoComplete="url" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="publicDescription">Présentation publique (facultatif)</Label>
                <Textarea
                  id="publicDescription"
                  name="publicDescription"
                  value={form.publicDescription}
                  onChange={updateField}
                  maxLength={400}
                  rows={3}
                  placeholder="Une courte présentation qui pourra apparaître sur la page des partenaires après validation."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Votre proposition *</Label>
                <Textarea
                  id="message"
                  name="message"
                  value={form.message}
                  onChange={updateField}
                  required
                  minLength={20}
                  maxLength={2000}
                  rows={6}
                  placeholder="Décrivez votre organisation, votre proposition et les formes de soutien envisagées (20 caractères minimum)."
                />
              </div>

              <label className="flex items-start gap-3 text-sm leading-5 text-slate-600">
                <input
                  type="checkbox"
                  name="consent"
                  checked={form.consent}
                  onChange={updateField}
                  required
                  className="mt-1 h-4 w-4 rounded border-slate-300 accent-amber-600"
                />
                <span>J’accepte que mes coordonnées soient utilisées par l’équipe PRIMART pour étudier et suivre cette demande. *</span>
              </label>

              <div className="flex flex-col-reverse gap-3 border-t border-stone-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-xs text-stone-500">Les champs marqués d’un astérisque sont obligatoires.</span>
                <Button type="submit" variant="gold" disabled={isSubmitting || !form.consent}>
                  {isSubmitting ? 'Envoi en cours…' : 'Envoyer la demande'}
                  {!isSubmitting && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>

    </div>
  );
}
