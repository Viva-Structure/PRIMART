# PRIMART 2028 - Plateforme de vote des talents

Plateforme web permettant au public de voter pour ses talents préférés (artistes, chanteurs, danseurs, créateurs et autres) lors de l'événement **PRIMART 2028**, et de récompenser les gagnants dans 52 prix répartis en 5 catégories.

> **Statut :** en cours de conception / développement
> **Version du cahier des charges :** 1.0

---

## Sommaire

- [Présentation](#présentation)
- [Fonctionnalités](#fonctionnalités)
- [Acteurs et rôles](#acteurs-et-rôles)
- [Catégories et prix](#catégories-et-prix)
- [Parcours global](#parcours-global)
- [Règles métier clés](#règles-métier-clés)
- [Feuille de route](#feuille-de-route)
- [Stack technique](#stack-technique)
- [Installation](#installation)
- [Configuration](#configuration)
- [Structure du projet](#structure-du-projet)
- [Sécurité et conformité](#sécurité-et-conformité)
- [Contribuer](#contribuer)
- [Licence](#licence)

---

## Présentation

L'objectif est d'offrir :

- une vitrine moderne aux talents participants ;
- un système de vote simple, gratuit ou payant, utilisable depuis un téléphone ou un ordinateur ;
- des résultats fiables grâce à des mécanismes anti-fraude et à une traçabilité complète ;
- une source de revenus via les votes payants pour financer l'événement et les récompenses ;
- un contrôle total pour les organisateurs via un tableau de bord et des statistiques.

---

## Fonctionnalités

| # | Fonctionnalité | Description | Priorité |
|---|----------------|-------------|----------|
| 1 | **Validation des candidats** | Modération des candidatures (accepter, refuser avec motif, demander des corrections, suspendre) | Indispensable |
| 2 | **Page publique des candidats** | Galerie, recherche, filtres, fiche détaillée, lien de vote personnel, partage social, SEO | Indispensable |
| 3 | **Catégories** | Gestion des catégories et prix, dates et tarifs par catégorie, sous-catégories | Indispensable |
| 4 | **Votes gratuits** | Quota gratuit configurable (par jour, semaine ou période), vérification par OTP | Indispensable |
| 5 | **Votes payants** | Packs de votes, tarification flexible, codes promo, crédit instantané, reçus | Haute |
| 6 | **Paiement** | Mobile Money, cartes bancaires, webhooks, réconciliation, export comptable | Haute |
| 7 | **Classement en temps réel** | Classement dynamique par catégorie, indicateurs de mouvement, mode plein écran | Haute |
| 8 | **Compte à rebours** | Décompte avant ouverture ou fermeture, synchronisé avec l'horloge serveur | Moyenne |
| 9 | **Fermeture automatique des votes** | Planification, blocage côté serveur, gel des résultats, prolongation tracée | Haute |
| 10 | **Historique des votes** | Journal immuable des votes, historiques par rôle, exports, journal d'audit | Moyenne |
| 11 | **Tableau de bord candidat** | Suivi du profil, des votes, du rang, outils de promotion (lien, QR code, visuels) | Haute |
| 12 | **Tableau de bord administrateur** | Pilotage complet, rôles et permissions, paramètres de l'événement | Indispensable |
| 13 | **Notifications** | E-mail, SMS, notifications in-app, modèles personnalisables | Moyenne |
| 14 | **Protection anti-fraude** | OTP, CAPTCHA, limitation de débit, empreinte d'appareil, détection d'anomalies, quarantaine | Critique |
| 15 | **Statistiques** | Votes, revenus, audience, candidats, sécurité, exports PDF/CSV/Excel | Moyenne |
| 16 | **Résultats finaux** | Consolidation, pondération jury (optionnelle), validation, publication contrôlée, archivage | Indispensable |

Le détail de chaque fonctionnalité (objectif, description, fonctionnalités détaillées, règles de gestion) est disponible dans le cahier des fonctionnalités :
`docs/Cahier_des_fonctionnalites_Plateforme_Vote_Talents.pdf`

---

## Acteurs et rôles

| Acteur | Rôle principal |
|--------|----------------|
| **Visiteur / Votant** | Consulte les candidats, vote gratuitement ou en achetant des votes, suit le classement |
| **Candidat** | Dépose sa candidature, gère son profil, suit ses votes et sa progression |
| **Administrateur** | Valide les candidatures, configure l'événement, supervise votes et paiements, publie les résultats |
| **Super administrateur** | Gère les comptes administrateurs, les droits d'accès et les paramètres sensibles |

Rôles d'équipe suggérés : Super administrateur, Modérateur, Comptable, Support.

---

## Catégories et prix

L'événement comprend **52 prix** répartis en **5 catégories**.

### 1. Musique (24 prix)
Artiste masculin de l'année · Artiste féminin de l'année · Artiste masculin Diaspora · Artiste féminin Diaspora · Tube des vacances · Meilleur clip vidéo de l'année · Meilleur groupe musical · Meilleure collaboration musicale · Artiste Gospel · Artiste tradi-moderne · Artiste variété urbaine · Étoile montante variété urbaine · Tube de l'année · Artiste Rap de l'année · Étoile montante Rap de l'année · Artiste Drill de l'année · Étoile montante Drill de l'année · Artiste Slam masculin · Artiste Slam féminin · Feat Urbain · Artiste Afrique de l'Ouest · Artiste Amapiano · Album de l'année · Artiste Lover

### 2. Danse et performance (7 prix)
DJ Platine de l'année · Meilleur animateur événementiel · Chorégraphe · Groupe de danse féminin · Groupe de danse masculin · Meilleur acteur ou actrice · Meilleur web humoriste

### 3. Arts et créativité (10 prix)
Meilleur artiste peintre · Meilleur photographe · Meilleur réalisateur de clips · Styliste ou créateur de mode · Meilleur mannequin · Créateur de contenu digital · Meilleur réalisateur de films · Architecte de l'année · Dessinateur · Maison d'esthétique

### 4. Industrie musicale (8 prix)
Label / Maison de production de l'année · Meilleur beatmaker · Meilleur manager d'artiste · Promoteur / booker de l'année · Promoteur / booker Diaspora · Meilleur média culturel · Présentateur Radio/TV · Bar, Club, Maquis

### 5. Prix spéciaux (3 prix)
Révélation de l'année · PRIMART d'Or, Grand Prix · Femme des Arts

---

## Parcours global

1. **Inscription** : le talent soumet sa candidature (informations, photo, vidéo ou audio, réseaux sociaux).
2. **Validation** : l'équipe organisatrice examine, puis accepte ou refuse le dossier.
3. **Publication** : le profil validé apparaît dans sa catégorie sur la page publique.
4. **Votes** : le public vote (gratuitement ou avec paiement) pendant la période ouverte.
5. **Clôture** : les votes se ferment automatiquement à l'échéance.
6. **Résultats** : les gagnants sont validés par l'administrateur puis annoncés officiellement.

---

## Règles métier clés

- Un candidat n'est publié qu'après validation explicite d'un administrateur ; tout refus est motivé.
- Les votes gratuits et payants sont enregistrés séparément (pondération configurable).
- Un vote validé ne peut pas être annulé par le votant ; les votes enregistrés sont immuables, toute correction passe par une écriture d'annulation tracée.
- Les votes payants ne sont crédités qu'après confirmation certaine du paiement par le prestataire, et une transaction ne crédite jamais deux fois.
- Les votes sont fermés automatiquement à l'heure prévue ; le contrôle se fait côté serveur.
- Tout vote suspect est mis en quarantaine et n'est comptabilisé qu'après vérification.
- Les résultats ne sont publiés qu'après validation d'un administrateur, puis figés.
- La règle de départage en cas d'égalité est définie à l'avance dans le règlement.

---

## Feuille de route

### Phase 1 : MVP
- [ ] Validation des candidats
- [ ] Page publique des candidats
- [ ] Catégories
- [ ] Votes gratuits
- [ ] Protection anti-fraude (base : OTP, CAPTCHA, limitation de débit)
- [ ] Tableau de bord administrateur
- [ ] Fermeture automatique des votes

### Phase 2
- [ ] Votes payants
- [ ] Paiement
- [ ] Classement en temps réel
- [ ] Compte à rebours
- [ ] Tableau de bord candidat
- [ ] Historique des votes

### Phase 3 : avant l'événement
- [ ] Notifications
- [ ] Statistiques
- [ ] Résultats finaux

---

## Stack technique

> À compléter selon les choix du projet.

| Couche | Technologie |
|--------|-------------|
| Frontend | _à définir_ |
| Backend / API | _à définir_ |
| Base de données | _à définir (base relationnelle recommandée)_ |
| Temps réel | _WebSocket ou rafraîchissement automatique_ |
| Paiement | _agrégateur à choisir (ex. CinetPay, PayDunya, FedaPay, Flutterwave, Stripe)_ |
| SMS / E-mail | _prestataires à choisir_ |
| Hébergement | _à définir (évolutif, prévu pour les pics de trafic)_ |

Recommandations : application responsive pensée mobile d'abord, mise en cache du classement, file d'attente pour les votes lors des pics, sauvegardes automatiques.

---

## Installation

> À adapter à votre stack.

```bash
# Cloner le dépôt
git clone <url-du-depot>
cd primart-2028

# Installer les dépendances
# (commande à compléter)

# Copier le fichier d'environnement
cp .env.example .env

# Lancer le projet en développement
# (commande à compléter)
```

---

## Configuration

Variables d'environnement à prévoir (exemple) :

```env
# Application
APP_NAME="PRIMART 2028"
APP_URL=http://localhost:3000
APP_ENV=development

# Base de données
DB_HOST=
DB_PORT=
DB_NAME=
DB_USER=
DB_PASSWORD=

# Paiement
PAYMENT_PROVIDER=
PAYMENT_API_KEY=
PAYMENT_SECRET=
PAYMENT_WEBHOOK_SECRET=

# SMS / E-mail
SMS_API_KEY=
MAIL_HOST=
MAIL_USER=
MAIL_PASSWORD=

# Sécurité
CAPTCHA_SITE_KEY=
CAPTCHA_SECRET_KEY=
JWT_SECRET=
```

Paramètres métier à définir dans le tableau de bord administrateur : dates d'ouverture et de fermeture, quota de votes gratuits, prix et packs de votes, affichage du classement (public, partiel ou masqué), pondération jury / public.

---

## Structure du projet

> Exemple à adapter.

```
primart-2028/
├── docs/                  # Cahier des fonctionnalités, spécifications
├── src/
│   ├── public/            # Pages publiques (candidats, classement, résultats)
│   ├── candidate/         # Espace candidat
│   ├── admin/             # Tableau de bord administrateur
│   ├── api/               # Votes, paiements, notifications, anti-fraude
│   └── shared/            # Composants et utilitaires communs
├── tests/
├── .env.example
└── README.md
```

---

## Sécurité et conformité

- HTTPS partout, mots de passe chiffrés, protection contre les injections, XSS et CSRF.
- Authentification à deux facteurs recommandée pour tous les comptes administrateurs.
- Aucune donnée bancaire stockée sur la plateforme ; signature des webhooks de paiement vérifiée.
- Journal d'audit des actions sensibles (annulation de vote, changement de prix, prolongation, etc.).
- Documents légaux à prévoir : conditions générales d'utilisation, règlement du concours, politique de confidentialité, mentions légales.

---

## Points à préciser avant le développement

- Nombre de votes gratuits par votant et périodicité.
- Tarifs des votes payants et pondération entre votes gratuits, payants et jury.
- Pays et moyens de paiement à supporter.
- Affichage du classement : public, partiel ou masqué, et à quels moments.
- Règle de départage en cas d'égalité et rôle éventuel d'un jury.
- Calendrier : inscriptions, validation, votes, clôture, cérémonie.

---

## Contribuer

1. Créer une branche : `git checkout -b feature/nom-de-la-fonctionnalite`
2. Commiter vos changements : `git commit -m "Ajout de ..."`
3. Pousser la branche : `git push origin feature/nom-de-la-fonctionnalite`
4. Ouvrir une Pull Request

---

## Licence

_À définir (ex. MIT, propriétaire)._

---

## Contact

_Nom de l'organisation · e-mail · site web_