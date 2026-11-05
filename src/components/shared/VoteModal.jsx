import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useApp } from '@/context/AppContext';
import { Heart, ShieldCheck } from 'lucide-react';

const COUNTRIES = [
  "Côte d'Ivoire",
  'Sénégal',
  'Cameroun',
  'Mali',
  'Burkina Faso',
  'Bénin',
  'Togo',
  'Ghana',
  'Guinée',
  'France',
  'Autre',
];

export function VoteModal({ candidate, isOpen, onClose }) {
  const { castFreeVote, canVoteFree, eventSettings, requestVoteOtp, verifyVoteOtp } = useApp();
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState(COUNTRIES[0]);
  const [channel, setChannel] = useState('email');
  const [otpCode, setOtpCode] = useState('');
  const [consent, setConsent] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  if (!candidate) return null;

  const reset = () => {
    setFirstName('');
    setEmail('');
    setPhone('');
    setCountry(COUNTRIES[0]);
    setChannel('email');
    setOtpCode('');
    setConsent(false);
    setOtpSent(false);
    setOtpVerified(false);
    setBusy(false);
    setError('');
  };

  const close = () => {
    reset();
    onClose();
  };

  const handleSendOtp = async (event) => {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      await requestVoteOtp({ channel, email, phone });
      setOtpSent(true);
    } catch (requestError) {
      setError(requestError.message || "Impossible d'envoyer le code de vérification.");
    } finally {
      setBusy(false);
    }
  };

  const handleConfirmVote = async (event) => {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      if (!otpVerified) {
        await verifyVoteOtp({ channel, email, phone, token: otpCode, firstName, country });
        setOtpVerified(true);
      }
      await castFreeVote(candidate.id);
      close();
    } catch (requestError) {
      setError(requestError.message || "Impossible d'enregistrer le vote.");
    } finally {
      setBusy(false);
    }
  };

  const isFreeEligible = canVoteFree(candidate.categoryId);

  return (
    <Dialog open={isOpen} onOpenChange={open => { if (!open) close(); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <img
              src={candidate.photo}
              alt={candidate.stageName || candidate.name}
              className="w-12 h-12 rounded-full object-cover ring-2 ring-amber-400"
            />
            <div>
              <DialogTitle>{candidate.stageName || candidate.name}</DialogTitle>
              <DialogDescription className="text-xs">
                {candidate.category} — {candidate.prize}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {!eventSettings.votesOpen ? (
          <Alert variant="warning">
            <AlertDescription>Les votes sont actuellement fermés.</AlertDescription>
          </Alert>
        ) : !isFreeEligible ? (
          <Alert variant="warning">
            <AlertDescription>
              Les votes gratuits ne sont pas disponibles actuellement. La disponibilité réelle est contrôlée par le serveur lors de la validation.
            </AlertDescription>
          </Alert>
        ) : (
          <form onSubmit={otpSent ? handleConfirmVote : handleSendOtp} className="space-y-4 pt-2">
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-xs text-amber-950 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-amber-700" />
              <span>
                Un vote gratuit par catégorie sur 24 heures. Le dernier contact renseigné choisit le canal OTP; vous pouvez le modifier avant l’envoi. Aucun mot de passe n'est demandé.
              </span>
            </div>

            {!otpSent ? (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="voter-name">Prénom</Label>
                  <Input id="voter-name" autoComplete="given-name" required value={firstName} onChange={event => setFirstName(event.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="voter-email">Adresse e-mail</Label>
                  <Input
                    id="voter-email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={event => {
                      setEmail(event.target.value);
                      if (event.target.value) setChannel('email');
                    }}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="voter-phone">Téléphone au format international</Label>
                  <Input
                    id="voter-phone"
                    type="tel"
                    autoComplete="tel"
                    placeholder="+225 07 00 00 00 00"
                    pattern="\+[1-9][0-9 ()-]{7,20}"
                    required
                    value={phone}
                    onChange={event => {
                      setPhone(event.target.value);
                      if (event.target.value) setChannel('phone');
                    }}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="voter-country">Pays</Label>
                  <Select id="voter-country" value={country} onChange={event => setCountry(event.target.value)}>
                    {COUNTRIES.map(option => <option key={option} value={option}>{option}</option>)}
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="verification-channel">Recevoir le code par</Label>
                  <Select id="verification-channel" value={channel} onChange={event => setChannel(event.target.value)}>
                    <option value="email">E-mail</option>
                    <option value="phone">SMS</option>
                  </Select>
                </div>
                <label className="flex items-start gap-2 text-xs leading-relaxed text-slate-600">
                  <input
                    type="checkbox"
                    required
                    checked={consent}
                    onChange={event => setConsent(event.target.checked)}
                    className="mt-0.5"
                  />
                  <span>
                    J'accepte que mon prénom, mon e-mail, mon téléphone et mon pays soient utilisés pour vérifier le vote et prévenir les doublons.
                  </span>
                </label>
                <Button type="submit" disabled={busy || !consent} className="w-full">
                  {busy ? 'Envoi en cours…' : `Recevoir le code par ${channel === 'email' ? 'e-mail' : 'SMS'}`}
                </Button>
              </>
            ) : (
              <>
                <p className="text-sm text-slate-600">
                  Saisissez le code envoyé par {channel === 'email' ? 'e-mail à' : 'SMS au'}{' '}
                  <strong>{channel === 'email' ? email : phone}</strong>.
                </p>
                <div className="space-y-1.5">
                  <Label htmlFor="vote-otp">Code de vérification</Label>
                  <Input
                    id="vote-otp"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    required={!otpVerified}
                    value={otpCode}
                    onChange={event => setOtpCode(event.target.value)}
                    disabled={otpVerified}
                    className="text-center font-mono text-lg tracking-widest"
                  />
                </div>
                <Button type="submit" disabled={busy || (!otpVerified && !otpCode.trim())} className="w-full">
                  {busy ? 'Vérification en cours…' : otpVerified ? 'Réessayer l’enregistrement du vote' : 'Vérifier et enregistrer mon vote'}
                  <Heart className="w-4 h-4 ml-2" />
                </Button>
                <Button type="button" variant="outline" disabled={busy} onClick={() => setOtpSent(false)} className="w-full">
                  Modifier mes coordonnées
                </Button>
              </>
            )}

            {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
          </form>
        )}

        <div className="border-t border-slate-200 pt-4 text-sm text-slate-600">
          <strong className="text-slate-900">Votes payants indisponibles.</strong>{' '}
          Le paiement Mobile Money ne sera activé qu'après intégration et vérification d'un prestataire.
        </div>
      </DialogContent>
    </Dialog>
  );
}
