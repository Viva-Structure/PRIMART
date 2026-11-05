import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function AccountAccess() {
  const { signIn, signUp, signOut, session } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const requestedPath = location.state?.from;
  const redirectTo = typeof requestedPath === 'string'
    && requestedPath.startsWith('/')
    && !requestedPath.startsWith('//')
    ? requestedPath
    : '/candidat-dashboard';
  const [mode, setMode] = useState('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);

  if (session?.user.email && session.user.email_confirmed_at) {
    return (
      <section className="max-w-lg mx-auto px-4 py-16 text-center space-y-4">
        <h1 className="text-2xl font-bold text-slate-900">Vous êtes connecté</h1>
        <p className="text-sm text-slate-600">Continuez vers votre espace candidat.</p>
        <Button onClick={() => navigate(redirectTo, { replace: true })}>Continuer</Button>
      </section>
    );
  }

  if (session) {
    return (
      <section className="max-w-lg mx-auto px-4 py-16 text-center space-y-4">
        <h1 className="text-2xl font-bold text-slate-900">Session de vote active</h1>
        <p className="text-sm text-slate-600">Pour déposer une candidature, déconnectez cette session de vote puis créez ou ouvrez un compte candidat avec e-mail vérifié.</p>
        <Button onClick={() => signOut().catch(error => setError(error.message))}>Continuer vers le compte candidat</Button>
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      </section>
    );
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setNotice('');
    setBusy(true);
    try {
      if (mode === 'signup') {
        const result = await signUp({ email, password, name });
        if (result.session) {
          navigate(redirectTo, { replace: true });
        } else {
          setNotice('Compte créé. Vérifiez votre e-mail, puis connectez-vous pour continuer.');
          setMode('signin');
        }
      } else {
        await signIn({ email, password });
        navigate(redirectTo, { replace: true });
      }
    } catch (requestError) {
      setError(requestError.message || 'La demande de connexion a échoué.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="max-w-lg mx-auto px-4 py-12">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold text-slate-900 font-display">
            {mode === 'signup' ? 'Créer un compte candidat' : 'Connexion candidat'}
          </h1>
          <p className="text-sm text-slate-600">
            Un compte est requis pour déposer et suivre une candidature. Les votes gratuits utilisent une vérification ponctuelle séparée.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div className="space-y-1.5">
              <Label htmlFor="account-name">Nom complet</Label>
              <Input id="account-name" autoComplete="name" required value={name} onChange={event => setName(event.target.value)} />
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="account-email">Adresse e-mail</Label>
            <Input id="account-email" type="email" autoComplete="email" required value={email} onChange={event => setEmail(event.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="account-password">Mot de passe</Label>
            <Input
              id="account-password"
              type="password"
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              minLength={8}
              required
              value={password}
              onChange={event => setPassword(event.target.value)}
            />
            {mode === 'signup' && <p className="text-xs text-slate-500">Au moins 8 caractères.</p>}
          </div>

          {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
          {notice && <p role="status" className="text-sm text-emerald-700">{notice}</p>}

          <Button type="submit" disabled={busy} className="w-full">
            {busy ? 'Veuillez patienter…' : mode === 'signup' ? 'Créer mon compte' : 'Se connecter'}
          </Button>
        </form>

        <p className="text-sm text-center text-slate-600">
          {mode === 'signup' ? 'Vous avez déjà un compte ?' : 'Pas encore de compte ?'}{' '}
          <button
            type="button"
            className="font-semibold text-amber-700 hover:underline"
            onClick={() => {
              setMode(mode === 'signup' ? 'signin' : 'signup');
              setError('');
              setNotice('');
            }}
          >
            {mode === 'signup' ? 'Se connecter' : 'Créer un compte'}
          </button>
        </p>
        <Link to="/candidater" className="block text-center text-sm text-slate-500 hover:text-amber-700">
          Retour au formulaire de candidature
        </Link>
      </div>
    </section>
  );
}
