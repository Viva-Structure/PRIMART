import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { CATEGORIES } from '@/data/categoriesData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Trophy,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  UploadCloud,
  FileCheck,
  ShieldCheck,
  Sparkles,
  AlertCircle
} from 'lucide-react';

export default function Register() {
  const {
    addCandidate,
    uploadCandidatePhoto,
    removeCandidatePhoto,
    session,
    authLoading,
    categoriesRaw,
    prizesRaw,
    showToast
  } = useApp();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    stageName: '',
    age: '',
    country: "Côte d'Ivoire",
    city: '',
    email: session?.user?.email || '',
    phone: '',
    categoryId: 'musique',
    category: 'Musique',
    prize: "Artiste masculin de l'année",
    bio: '',
    photo: '',
    videoUrl: '',
    audioSample: '',
    instagram: '',
    facebook: '',
    tiktok: '',
  });

  const [submittedCandidate, setSubmittedCandidate] = useState(null);
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);

  // Synchronize email from session if session arrives after mount
  useEffect(() => {
    if (session?.user?.email && !formData.email) {
      setFormData(prev => ({ ...prev, email: session.user.email }));
    }
  }, [session?.user?.email, formData.email]);

  // Categories from database (fallback to static data if not yet loaded)
  const availableCategories = useMemo(() => {
    if (categoriesRaw && categoriesRaw.length > 0) {
      return categoriesRaw;
    }
    return CATEGORIES;
  }, [categoriesRaw]);

  // Available prizes for currently selected category from database
  const availablePrizes = useMemo(() => {
    if (prizesRaw && prizesRaw.length > 0) {
      const filtered = prizesRaw.filter(p => p.category_id === formData.categoryId);
      if (filtered.length > 0) {
        return filtered.map(p => p.name);
      }
    }
    const catObj = CATEGORIES.find(c => c.id === formData.categoryId);
    return catObj ? catObj.prizes : [];
  }, [prizesRaw, formData.categoryId]);

  // Selected category metadata
  const selectedCategoryObj = useMemo(() => {
    return availableCategories.find(c => c.id === formData.categoryId) || availableCategories[0] || {};
  }, [availableCategories, formData.categoryId]);

  // Ensure category and prize are valid when availableCategories or prizes change
  useEffect(() => {
    if (availableCategories.length > 0) {
      const isValidCat = availableCategories.some(c => c.id === formData.categoryId);
      const catId = isValidCat ? formData.categoryId : availableCategories[0].id;
      const catObj = availableCategories.find(c => c.id === catId);

      let catPrizes = [];
      if (prizesRaw && prizesRaw.length > 0) {
        catPrizes = prizesRaw.filter(p => p.category_id === catId).map(p => p.name);
      }
      if (catPrizes.length === 0) {
        catPrizes = CATEGORIES.find(c => c.id === catId)?.prizes || [];
      }

      const isValidPrize = catPrizes.includes(formData.prize);
      const prize = isValidPrize ? formData.prize : (catPrizes[0] || '');

      setFormData(prev => ({
        ...prev,
        categoryId: catId,
        category: catObj?.name || prev.category,
        prize: prize || prev.prize
      }));
    }
  }, [availableCategories, prizesRaw]);

  const handleCategoryChange = (e) => {
    const catId = e.target.value;
    const catObj = availableCategories.find(c => c.id === catId);

    let catPrizes = [];
    if (prizesRaw && prizesRaw.length > 0) {
      catPrizes = prizesRaw.filter(p => p.category_id === catId).map(p => p.name);
    }
    if (catPrizes.length === 0) {
      catPrizes = CATEGORIES.find(c => c.id === catId)?.prizes || [];
    }

    setFormData(prev => ({
      ...prev,
      categoryId: catId,
      category: catObj ? catObj.name : 'Musique',
      prize: catPrizes[0] || ''
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // STEP 1 VALIDATION
  const handleStep1Next = () => {
    const name = (formData.name || '').trim();
    const stageName = (formData.stageName || '').trim();
    const age = parseInt(formData.age, 10);
    const city = (formData.city || '').trim();
    const phone = (formData.phone || '').trim();
    const email = (session?.user?.email || formData.email || '').trim();

    if (!stageName) {
      showToast("Nom d'artiste manquant", "Veuillez renseigner votre nom de scène ou d'artiste.", "warning");
      return;
    }
    if (!name) {
      showToast("Nom civil manquant", "Veuillez renseigner votre nom civil complet.", "warning");
      return;
    }
    if (!formData.age || isNaN(age) || age < 10 || age > 99) {
      showToast("Âge invalide", "Veuillez indiquer un âge valide compris entre 10 et 99 ans.", "warning");
      return;
    }
    if (!city) {
      showToast("Ville manquante", "Veuillez indiquer votre ville de résidence.", "warning");
      return;
    }
    if (!phone) {
      showToast("Téléphone manquant", "Veuillez renseigner un numéro de téléphone joignable (WhatsApp).", "warning");
      return;
    }
    if (!email) {
      showToast("E-mail manquant", "Aucune adresse e-mail valide n'est rattachée à votre compte.", "error");
      return;
    }

    setFormData(prev => ({ ...prev, email }));
    setStep(2);
  };

  // STEP 2 VALIDATION
  const handleStep2Next = () => {
    if (!formData.categoryId) {
      showToast("Catégorie requise", "Veuillez sélectionner une catégorie de compétition.", "warning");
      return;
    }
    if (!formData.prize) {
      showToast("Prix requis", "Veuillez sélectionner un prix en compétition.", "warning");
      return;
    }
    setStep(3);
  };

  // STEP 3 SUBMISSION
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    const bio = (formData.bio || '').trim();
    if (!bio || bio.length < 20) {
      showToast("Biographie trop courte", "Veuillez rédiger au moins 20 caractères pour présenter votre profil artistique.", "warning");
      return;
    }

    if (!photoFile) {
      showToast("Photo officielle requise", "Veuillez sélectionner une photo pour votre profil candidat.", "warning");
      return;
    }

    setIsSubmitting(true);
    let uploadedPhoto;
    try {
      showToast("Téléversement...", "Téléversement de votre photo officielle en cours…", "info");
      uploadedPhoto = await uploadCandidatePhoto(photoFile);

      showToast("Enregistrement...", "Enregistrement de votre candidature en base de données…", "info");
      const newCand = await addCandidate({
        name: formData.name.trim(),
        stageName: formData.stageName.trim() || formData.name.trim(),
        age: formData.age ? parseInt(formData.age, 10) : 25,
        country: formData.country,
        city: formData.city.trim(),
        email: (session?.user?.email || formData.email).trim(),
        phone: formData.phone.trim(),
        categoryId: formData.categoryId,
        category: formData.category,
        prize: formData.prize,
        bio: bio,
        photo: uploadedPhoto.url,
        videoUrl: (formData.videoUrl || '').trim(),
        audioSample: (formData.audioSample || '').trim(),
        socialLinks: {
          instagram: (formData.instagram || '').trim(),
          facebook: (formData.facebook || '').trim(),
          tiktok: (formData.tiktok || '').trim()
        }
      });

      setSubmittedCandidate(newCand);
      showToast("Candidature validée !", "Votre dossier a été soumis avec succès au comité.", "success");
    } catch (error) {
      let message = error.message || "Impossible d'enregistrer la candidature.";
      if (uploadedPhoto) {
        try {
          await removeCandidatePhoto(uploadedPhoto.path);
        } catch (cleanupError) {
          message = `${message} Le fichier temporaire n'a pas pu être retiré : ${cleanupError.message}`;
        }
      }
      setSubmitError(message);
      showToast("Erreur d'inscription", message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return <p className="py-16 text-center text-sm text-slate-600">Vérification de la session…</p>;
  }

  if (!session?.user.email || !session.user.email_confirmed_at) {
    return (
      <section className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <h1 className="text-2xl font-bold text-slate-900 font-display">Compte candidat vérifié requis</h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          Pour garantir l'intégrité de la compétition, vous devez être connecté avec une adresse e-mail vérifiée afin de déposer un dossier de candidature.
        </p>
        <Link to="/connexion" state={{ from: '/candidater' }}>
          <Button variant="gold" className="font-bold">Se connecter ou créer un compte</Button>
        </Link>
      </section>
    );
  }

  if (submittedCandidate) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-300 shadow-xs">
          <CheckCircle2 className="w-12 h-12" />
        </div>

        <div className="space-y-2">
          <Badge variant="success" className="text-xs">Candidature Enregistrée</Badge>
          <h1 className="text-3xl font-extrabold text-slate-900 font-display">
            Dossier Soumis avec Succès !
          </h1>
          <p className="text-slate-600 text-sm max-w-md mx-auto">
            Félicitations <strong>{submittedCandidate.stageName}</strong>. Votre dossier a bien été transmis au comité de sélection PRIMART 2028.
          </p>
        </div>

        <div className="bg-white border border-slate-200 shadow-xs rounded-2xl p-6 text-left text-xs space-y-2.5 max-w-md mx-auto">
          <div className="flex justify-between border-b border-slate-100 pb-2">
            <span className="text-slate-500">Statut initial :</span>
            <Badge variant="secondary">En attente de modération</Badge>
          </div>
          <div className="flex justify-between border-b border-slate-100 pb-2">
            <span className="text-slate-500">Catégorie :</span>
            <span className="text-slate-900 font-semibold">{submittedCandidate.category}</span>
          </div>
          <div className="flex justify-between border-b border-slate-100 pb-2">
            <span className="text-slate-500">Prix visé :</span>
            <span className="text-amber-600 font-semibold">{submittedCandidate.prize}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Délai d'examen :</span>
            <span className="text-slate-700">24 à 48 heures ouvrées</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Link to="/candidat-dashboard">
            <Button variant="gold" size="lg" className="w-full sm:w-auto text-xs font-bold">
              Accéder à mon Espace Candidat
            </Button>
          </Link>
          <Link to="/">
            <Button variant="outline" size="lg" className="w-full sm:w-auto text-xs">
              Retour à l'accueil
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Title & Progress Steps */}
      <div className="text-center space-y-2">
        <Badge variant="purple" className="text-xs">Inscriptions Ouvertes</Badge>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-display">
          Déposez votre Candidature
        </h1>
        <p className="text-sm text-slate-600 max-w-xl mx-auto">
          Rejoignez les talents les plus prometteurs de l'année et tentez de remporter l'un des 52 trophées officiels.
        </p>

        {/* Wizard step indicator */}
        <div className="flex items-center justify-center gap-2 pt-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center gap-2">
              <span
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step === i
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : step > i
                    ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {step > i ? '✓' : i}
              </span>
              <span className={`text-xs font-medium hidden sm:inline ${step === i ? 'text-slate-900 font-bold' : 'text-slate-500'}`}>
                {i === 1 ? 'Identité' : i === 2 ? 'Discipline & Prix' : 'Médias & Bio'}
              </span>
              {i < 3 && <span className="w-6 h-0.5 bg-slate-200" />}
            </div>
          ))}
        </div>
      </div>

      {/* Main Form Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* STEP 1: IDENTITY */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in-50 duration-200">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="font-display font-bold text-lg text-slate-900">
                  Étape 1 : Identité & Coordonnées du Talent
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Ces informations permettront au jury d'identifier officiellement votre profil d'artiste.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="stageName" className="text-xs font-semibold text-slate-700">Nom de scène / Artiste *</Label>
                  <Input
                    id="stageName"
                    name="stageName"
                    required
                    placeholder="Ex: Malik Star, DJ Vibe..."
                    value={formData.stageName}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-xs font-semibold text-slate-700">Nom civil complet *</Label>
                  <Input
                    id="name"
                    name="name"
                    required
                    placeholder="Ex: Malik Sangaré"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="age" className="text-xs font-semibold text-slate-700">Âge *</Label>
                  <Input
                    id="age"
                    name="age"
                    type="number"
                    min="10"
                    max="99"
                    required
                    placeholder="Ex: 24"
                    value={formData.age}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="country" className="text-xs font-semibold text-slate-700">Pays de résidence *</Label>
                  <Select
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                  >
                    <option value="Côte d'Ivoire">Côte d'Ivoire</option>
                    <option value="Sénégal">Sénégal</option>
                    <option value="Cameroun">Cameroun</option>
                    <option value="Mali">Mali</option>
                    <option value="Burkina Faso">Burkina Faso</option>
                    <option value="Bénin">Bénin</option>
                    <option value="Togo">Togo</option>
                    <option value="France (Diaspora)">France (Diaspora)</option>
                    <option value="Autre Pays">Autre Pays</option>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="city" className="text-xs font-semibold text-slate-700">Ville *</Label>
                  <Input
                    id="city"
                    name="city"
                    required
                    placeholder="Ex: Abidjan, Dakar..."
                    value={formData.city}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-semibold text-slate-700">Adresse E-mail du compte *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={session?.user?.email || formData.email}
                    readOnly
                    className="bg-slate-50 text-slate-700 font-medium cursor-not-allowed"
                  />
                  <p className="text-[11px] text-slate-500">Adresse certifiée liée à votre compte connecté.</p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-xs font-semibold text-slate-700">Numéro de Téléphone (WhatsApp) *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    required
                    placeholder="+225 07 12 34 56 78"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  type="button"
                  variant="gold"
                  size="default"
                  onClick={handleStep1Next}
                  className="text-xs font-bold"
                >
                  Continuer vers la sélection du prix <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2: CATEGORY & PRIZE (DYNAMIC FROM DATABASE) */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in-50 duration-200">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="font-display font-bold text-lg text-slate-900">
                  Étape 2 : Choisissez votre Catégorie & Trophée
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Sélectionnez la catégorie artistique et le prix précis dans lequel concourir.
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="categoryId" className="text-xs font-semibold text-slate-700">Catégorie Principale *</Label>
                <Select
                  id="categoryId"
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleCategoryChange}
                >
                  {availableCategories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name} {cat.description ? `— ${cat.description.substring(0, 50)}…` : ''}
                    </option>
                  ))}
                </Select>
                {selectedCategoryObj?.description && (
                  <p className="text-[11px] text-slate-500 mt-1">{selectedCategoryObj.description}</p>
                )}
              </div>

              <div className="space-y-1.5 pt-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="prize" className="text-xs font-semibold text-slate-700">Prix visé en compétition *</Label>
                  <span className="text-[11px] text-amber-700 font-medium">
                    {availablePrizes.length} prix disponible(s) dans cette catégorie
                  </span>
                </div>
                <Select
                  id="prize"
                  name="prize"
                  value={formData.prize}
                  onChange={handleChange}
                >
                  {availablePrizes.map((p, idx) => (
                    <option key={idx} value={p}>{p}</option>
                  ))}
                </Select>
              </div>

              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5 shadow-2xs">
                <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  <strong>Règle officielle :</strong> Une fois validé par le comité d'arbitrage, le changement de catégorie n'est plus autorisé sans dérogation formelle de l'administrateur.
                </span>
              </div>

              <div className="flex justify-between pt-4">
                <Button type="button" variant="outline" size="default" onClick={() => setStep(1)} className="text-xs">
                  <ArrowLeft className="w-4 h-4 mr-1" /> Retour
                </Button>
                <Button type="button" variant="gold" size="default" onClick={handleStep2Next} className="text-xs font-bold">
                  Continuer vers les médias & bio <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: MEDIA, BIO & SOCIALS */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in-50 duration-200">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="font-display font-bold text-lg text-slate-900">
                  Étape 3 : Biographie, Photo de profil & Liens Médias
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Complétez votre profil pour que les votants et le jury découvrent votre univers.
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="bio" className="text-xs font-semibold text-slate-700">
                  Biographie & Présentation artistique (min. 20 caractères) *
                </Label>
                <Textarea
                  id="bio"
                  name="bio"
                  required
                  rows={4}
                  placeholder="Décrivez votre style musical ou artistique, vos réalisations phares, votre vision et ce qui vous motive pour ce concours..."
                  value={formData.bio}
                  onChange={handleChange}
                />
              </div>

              {/* Candidate photo upload */}
              <div className="space-y-2">
                <Label htmlFor="candidate-photo" className="text-xs font-semibold text-slate-700">
                  Photo de profil officielle (JPEG, PNG ou WebP, 5 Mo max) *
                </Label>
                <Input
                  id="candidate-photo"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  required
                  onChange={event => setPhotoFile(event.target.files?.[0] || null)}
                  className="text-xs"
                />
                <p className="text-[11px] text-slate-500">
                  La photo sera téléversée dans le stockage sécurisé Supabase et visible publiquement sur votre fiche.
                </p>
              </div>

              {/* Media links */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5">
                  <Label htmlFor="videoUrl" className="text-xs font-semibold text-slate-700">Lien Vidéo YouTube / TikTok / Reels</Label>
                  <Input
                    id="videoUrl"
                    name="videoUrl"
                    placeholder="https://youtube.com/watch?v=..."
                    value={formData.videoUrl}
                    onChange={handleChange}
                    className="text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="audioSample" className="text-xs font-semibold text-slate-700">Extrait Audio MP3 (Optionnel)</Label>
                  <Input
                    id="audioSample"
                    name="audioSample"
                    placeholder="https://.../sample.mp3"
                    value={formData.audioSample}
                    onChange={handleChange}
                    className="text-xs"
                  />
                </div>
              </div>

              {/* Social handles */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="space-y-1">
                  <Label htmlFor="instagram" className="text-xs font-semibold text-slate-600">Instagram</Label>
                  <Input
                    id="instagram"
                    name="instagram"
                    placeholder="@nom_artiste"
                    value={formData.instagram}
                    onChange={handleChange}
                    className="text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="facebook" className="text-xs font-semibold text-slate-600">Facebook</Label>
                  <Input
                    id="facebook"
                    name="facebook"
                    placeholder="Page Artiste"
                    value={formData.facebook}
                    onChange={handleChange}
                    className="text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="tiktok" className="text-xs font-semibold text-slate-600">TikTok</Label>
                  <Input
                    id="tiktok"
                    name="tiktok"
                    placeholder="@tiktok_handle"
                    value={formData.tiktok}
                    onChange={handleChange}
                    className="text-xs"
                  />
                </div>
              </div>

              {/* Terms checkbox */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-start gap-2.5 pt-3">
                <input type="checkbox" id="terms" required className="mt-0.5 rounded text-amber-500 focus:ring-amber-500" />
                <label htmlFor="terms" className="leading-relaxed">
                  Je certifie sur l'honneur l'exactitude des informations fournies, être l'auteur ou le titulaire des droits des œuvres présentées, et accepter sans réserve le règlement officiel de PRIMART 2028.
                </label>
              </div>

              <div className="flex justify-between pt-4">
                <Button type="button" variant="outline" size="default" onClick={() => setStep(2)} className="text-xs">
                  <ArrowLeft className="w-4 h-4 mr-1" /> Retour
                </Button>
                <Button type="submit" disabled={isSubmitting} variant="gold" size="default" className="text-xs font-bold">
                  {isSubmitting ? 'Enregistrement en cours…' : 'Valider et Envoyer ma Candidature'}
                </Button>
              </div>
              {submitError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}
            </div>
          )}

        </form>
      </div>

    </div>
  );
}
