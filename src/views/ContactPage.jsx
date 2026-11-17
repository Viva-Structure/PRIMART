import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Clock3, Mail, MessageSquareText, Phone, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const CONTACT_EMAIL = 'support@primart2028.org';
const CONTACT_PHONE = '+228 70 00 00 00';

const INITIAL_FORM = {
  name: '',
  email: '',
  phone: '',
  subject: '',
  message: '',
};

function ContactCard({ icon, title, children }) {
  return (
    <div className="flex gap-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
        {icon}
      </div>
      <div className="min-w-0">
        <h2 className="text-sm font-bold text-slate-900">{title}</h2>
        <div className="mt-1 text-sm leading-6 text-slate-600">{children}</div>
      </div>
    </div>
  );
}

export default function ContactPage() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [mailClientOpened, setMailClientOpened] = useState(false);

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm(current => ({ ...current, [name]: value }));
    setMailClientOpened(false);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const subject = encodeURIComponent(form.subject.trim());
    const body = encodeURIComponent(
      `Nom : ${form.name.trim()}\nE-mail : ${form.email.trim()}\nTéléphone : ${form.phone.trim() || 'Non renseigné'}\n\n${form.message.trim()}`
    );
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
    setMailClientOpened(true);
  };

  return (
    <div className="min-h-[70vh] bg-[#F7F5F2] px-4 py-10 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-6xl">
        <Link to="/" className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-stone-600 hover:text-[#B8973E]">
          <ArrowLeft className="h-4 w-4" />
          Retour à l’accueil
        </Link>

        <header className="mb-10 max-w-2xl">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[.2em] text-[#B8973E]">Nous sommes à votre écoute</p>
          <h1 className="text-3xl font-black tracking-tight text-[#0F1117] sm:text-4xl">Contacter PRIMART</h1>
          <p className="mt-3 text-sm leading-6 text-stone-600">
            Retrouvez les coordonnées de l’équipe PRIMART ou préparez votre message à l’aide du formulaire.
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-[.9fr_1.1fr]">
          <section aria-label="Coordonnées de PRIMART" className="space-y-4">
            <ContactCard icon={<Mail className="h-5 w-5" />} title="E-mail">
              <a className="break-all font-medium text-amber-700 hover:underline" href={`mailto:${CONTACT_EMAIL}`}>
                {CONTACT_EMAIL}
              </a>
            </ContactCard>

            <ContactCard icon={<Phone className="h-5 w-5" />} title="Téléphone">
              <a className="font-medium text-amber-700 hover:underline" href="tel:+22870000000">
                {CONTACT_PHONE}
              </a>
            </ContactCard>

            <ContactCard icon={<Clock3 className="h-5 w-5" />} title="Horaires de contact">
              Du lundi au vendredi, de 9 h à 18 h (GMT).
            </ContactCard>

            <ContactCard icon={<Share2 className="h-5 w-5" />} title="Réseaux sociaux">
              Retrouvez PRIMART sous le nom <strong className="font-semibold text-slate-800">Primart-Officiel</strong> sur Facebook et ses autres réseaux.
            </ContactCard>
          </section>

          <section aria-labelledby="contact-form-title" className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-8">
            <div className="mb-6 flex items-center gap-3">
              <MessageSquareText className="h-5 w-5 text-amber-600" />
              <div>
                <h2 id="contact-form-title" className="font-display text-lg font-bold text-slate-900">Envoyer un message</h2>
                <p className="mt-1 text-xs text-slate-500">Le formulaire ouvrira votre application de messagerie.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="contact-name">Nom *</Label>
                  <Input id="contact-name" name="name" value={form.name} onChange={updateField} required maxLength={120} autoComplete="name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-email">Adresse e-mail *</Label>
                  <Input id="contact-email" name="email" type="email" value={form.email} onChange={updateField} required maxLength={254} autoComplete="email" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-phone">Téléphone (facultatif)</Label>
                  <Input id="contact-phone" name="phone" type="tel" value={form.phone} onChange={updateField} maxLength={30} autoComplete="tel" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-subject">Objet *</Label>
                  <Input id="contact-subject" name="subject" value={form.subject} onChange={updateField} required maxLength={160} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact-message">Votre message *</Label>
                <Textarea id="contact-message" name="message" value={form.message} onChange={updateField} required minLength={10} maxLength={3000} rows={6} />
              </div>

              {mailClientOpened && (
                <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                  Votre application de messagerie devrait s’ouvrir avec le message prérempli. Vérifiez-le puis envoyez-le depuis cette application.
                </p>
              )}

              <div className="flex flex-col gap-3 border-t border-stone-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-stone-500">Les champs marqués d’un astérisque sont obligatoires.</p>
                <Button type="submit" variant="gold">
                  Préparer le courriel <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
