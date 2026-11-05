import React, { useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Settings,
  Clock,
  Lock,
  Unlock,
  Sliders,
  ShieldCheck,
  Save,
  Trophy
} from 'lucide-react';

export default function AdminSettings() {
  const { eventSettings, setEventSettings, showToast } = useApp();

  const [settings, setSettings] = useState({ ...eventSettings });
  const [saving, setSaving] = useState(false);
  const eventSettingsVersion = JSON.stringify(eventSettings);
  const [loadedSettingsVersion, setLoadedSettingsVersion] = useState(eventSettingsVersion);

  if (eventSettingsVersion !== loadedSettingsVersion) {
    setLoadedSettingsVersion(eventSettingsVersion);
    setSettings({ ...eventSettings });
  }

  const handleToggleVotes = async () => {
    const nextState = !settings.votesOpen;
    const updatedSettings = { ...settings, votesOpen: nextState };
    setSaving(true);
    try {
      await setEventSettings(updatedSettings);
      setSettings(updatedSettings);
      showToast(
        nextState ? "Votes réouverts" : "Votes clôturés avec succès",
        nextState ? "Les votants peuvent à nouveau voter." : "Tous les flux de vote sont désormais bloqués et les scores figés.",
        nextState ? "success" : "destructive"
      );
    } catch (error) {
      showToast('Modification refusée', error.message, 'destructive');
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await setEventSettings(settings);
      showToast("Paramètres enregistrés", "Les nouveaux paramètres de l'événement ont été appliqués.", "success");
    } catch (error) {
      showToast('Enregistrement impossible', error.message, 'destructive');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-4xl">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-amber-500" />
              <h1 className="text-2xl font-extrabold text-slate-900 font-display">
                Paramètres & Clôture Officielle
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Configuration des dates limites, blocage serveur des votes et règles de pondération.
            </p>
          </div>

          <Badge variant={settings.votesOpen ? "live" : "destructive"}>
            {settings.votesOpen ? "Scrutin Ouvert" : "Scrutin Verrouillé"}
          </Badge>
        </div>

        {/* Master Killswitch: Open / Close votes */}
        <div className={`p-6 rounded-3xl border transition-all ${
          settings.votesOpen
            ? 'bg-white border-slate-200'
            : 'bg-red-50 border-red-300'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                {settings.votesOpen ? (
                  <Unlock className="w-5 h-5 text-emerald-600" />
                ) : (
                  <Lock className="w-5 h-5 text-red-600" />
                )}
                <h3 className="font-display font-bold text-lg text-slate-900">
                  Contrôle Général du Scrutin
                </h3>
              </div>
              <p className="text-xs text-slate-600 max-w-xl leading-relaxed">
                {settings.votesOpen
                  ? "Les votes sont actuellement ouverts au public. En cas d'échéance ou d'incident, vous pouvez verrouiller instantanément la plateforme."
                  : "Les votes sont actuellement bloqués côté serveur. Aucun nouveau vote gratuit ou payant ne peut être enregistré."}
              </p>
            </div>

            <Button
              onClick={handleToggleVotes}
              disabled={saving}
              variant={settings.votesOpen ? "destructive" : "goldGlow"}
              className="text-xs font-bold shrink-0"
            >
              {settings.votesOpen ? (
                <>
                  <Lock className="w-4 h-4 mr-1.5" /> Clôturer les votes immédiatement
                </>
              ) : (
                <>
                  <Unlock className="w-4 h-4 mr-1.5" /> Réouvrir les votes
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Form settings */}
        <form onSubmit={handleSave} className="p-6 sm:p-8 rounded-3xl border border-slate-200 bg-white shadow-sm space-y-6">
          
          <h3 className="font-display font-bold text-base text-slate-900 border-b border-slate-200 pb-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-500" />
            Planification & Compte à Rebours Officiel
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="eventName" className="text-xs text-slate-600">Nom Officiel de l'Événement</Label>
              <Input
                id="eventName"
                value={settings.eventName}
                onChange={(e) => setSettings({ ...settings, eventName: e.target.value })}
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="endDate" className="text-xs text-slate-600">Date et Heure de Clôture Automatique (ISO / UTC)</Label>
              <Input
                id="endDate"
                value={settings.endDate}
                onChange={(e) => setSettings({ ...settings, endDate: e.target.value })}
                className="text-xs font-mono"
              />
            </div>
          </div>

          <h3 className="font-display font-bold text-base text-slate-900 border-b border-slate-200 pb-3 pt-2 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-purple-500" />
            Règles Métier & Pondération des Résultats
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-600">Quota Vote Gratuit (par votant/24h)</Label>
              <Input
                type="number"
                min="1"
                max="10"
                value={settings.freeVotesDailyQuota}
                onChange={(e) => setSettings({ ...settings, freeVotesDailyQuota: parseInt(e.target.value, 10) || 1 })}
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-slate-600">Pondération Public (%)</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={settings.publicWeight}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10) || 0;
                  setSettings({ ...settings, publicWeight: val, juryWeight: 100 - val });
                }}
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-slate-600">Pondération Jury (%)</Label>
              <Input
                type="number"
                disabled
                value={settings.juryWeight}
                className="text-xs opacity-70"
              />
            </div>
          </div>

          {/* Visibility options */}
          <div className="space-y-3 pt-2">
            <Label className="text-xs font-semibold text-slate-700">Options d'Affichage & Suspense :</Label>
            
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
              <input
                type="checkbox"
                id="showExactVotes"
                checked={settings.showExactVotes}
                onChange={(e) => setSettings({ ...settings, showExactVotes: e.target.checked })}
                className="rounded text-amber-500 focus:ring-amber-500"
              />
              <label htmlFor="showExactVotes" className="text-xs text-slate-700">
                Afficher le nombre exact de votes au public (décocher pour afficher uniquement les pourcentages ou le rang)
              </label>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={saving} variant="gold" size="default" className="text-xs font-bold">
              <Save className="w-4 h-4 mr-1.5" />
              {saving ? 'Enregistrement…' : 'Enregistrer les Nouveaux Paramètres'}
            </Button>
          </div>

        </form>

      </div>
    </AdminLayout>
  );
}
