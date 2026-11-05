# Configuration Supabase

## Préparer l'application

1. Dans le tableau de bord Supabase, récupérez l'URL du projet et la clé publishable (ou l'ancienne clé `anon`).
2. Copiez `.env.example` vers `.env.local` et renseignez ces deux valeurs. Ne copiez jamais une clé `service_role` ou une clé secrète dans une variable `VITE_*`.
3. Redémarrez Vite après toute modification de `.env.local`.
4. L'accès au client de navigateur se fait via `getSupabaseClient()` dans `src/lib/supabase.js`.

## Appliquer le schéma

Les scripts `20261104120000_initial_schema.sql` et `20261104120100_seed_catalog.sql` créent le schéma, les politiques RLS, les buckets Storage, les données de catégories/prix (52 prix) et les packs de votes. Le parcours de candidature et les profils de votants requièrent aussi `20261104130000_candidate_submission_and_voter_profiles.sql`. Appliquez enfin `20261104210000_server_side_candidate_rankings.sql` : il expose les rangs, parts des voix et totaux de vote calculés côté base de données. Si les trois premières migrations ont déjà été exécutées, appliquez uniquement cette dernière.

Gardez un point de restauration avant toute application sur une base non vide. Les migrations ne créent pas de candidats et n'importent aucun ancien profil, compteur, transaction ou vote fictif : ces éléments de démonstration ne représentent pas des données réelles. Les nouveaux candidats et votes seront ajoutés par les parcours applicatifs sécurisés.

Correspondance prévue avec le modèle actuel : `categoriesData.js` alimente `categories` et `prizes`; les profils vont dans `candidates`, tandis que courriel, téléphone et justificatifs sont séparés dans `candidate_private_details`; les votes sont enregistrés individuellement dans `votes` et les totaux affichés sont calculés; les commandes de paiement vont dans `payment_orders`; les alertes anti-fraude dans `suspect_votes`; les réglages et packs dans `event_settings` et `vote_packs`. Les rangs sont dérivés des votes, ils ne sont pas importés comme compteurs modifiables.

Il n'y a pas de table `public.users` : les comptes créés par l'inscription se trouvent dans `auth.users` (schéma `auth`, section Authentication du tableau de bord). La table `public.user_roles`, créée par la première migration, associe ces comptes à un rôle. Créez d'abord votre compte dans l'application et connectez-vous au moins une fois; dans Supabase, vous pouvez le retrouver sous **Authentication > Users**. Puis, dans **SQL Editor**, remplacez l'adresse ci-dessous par celle de ce compte et exécutez :

```sql
insert into public.user_roles (user_id, role)
select id, 'admin'::public.app_role
from auth.users
where lower(email) = lower('ADRESSE_ADMIN')
on conflict (user_id, role) do nothing;
```

La requête ne crée aucun compte : si l'adresse ne correspond pas à un compte existant, elle n'ajoute aucun rôle. Pour vérifier l'attribution :

```sql
select u.email, r.role
from public.user_roles r
join auth.users u on u.id = r.user_id
where lower(u.email) = lower('ADRESSE_ADMIN');
```

Le rôle n'est volontairement pas attribuable depuis le navigateur. Les profils publics passent par des vues SQL qui n'exposent pas l'identifiant Auth ni les notes internes; les coordonnées de candidature restent dans `candidate_private_details`. Les candidatures nécessitent un compte dont l'adresse e-mail est vérifiée; `submit_candidate` enregistre le profil et les coordonnées privées dans une seule transaction. Les photos sont téléversées dans `candidate-media`, limité aux images JPEG/PNG/WebP de 5 Mo.

Les votes gratuits n'exigent pas de mot de passe, mais utilisent Supabase Auth OTP : le votant saisit ses coordonnées et choisit la validation par e-mail ou SMS. L'adresse e-mail ou le numéro doit être vérifié par le service correspondant, et un consentement est demandé avant l'envoi du code. Le code SMS exige d'activer un fournisseur SMS dans Supabase Auth et de configurer ses limites d'envoi; l'e-mail nécessite un modèle Supabase Auth configuré pour envoyer un code OTP. Les coordonnées sont stockées dans `voter_profiles`, accessibles seulement au votant et aux administrateurs. Le quota est vérifié atomiquement par catégorie et par identité Supabase vérifiée sur 24 heures; il ne constitue pas une garantie d'identité civile contre la création de plusieurs coordonnées.

Les commandes et confirmations Mobile Money restent désactivées côté application tant que le fournisseur n'est pas choisi et intégré. Ne passez pas le scrutin en production avant d'avoir défini la politique de confidentialité, le délai de conservation des coordonnées et les règles de modération.

## Classement et partage des profils

La migration `20261104210000_server_side_candidate_rankings.sql` calcule rangs, parts de voix et totaux dans PostgreSQL. L'accueil, le classement, les résultats et le mode cérémonie affichent ces résultats serveur; ils ne recalculent pas les scores. La date de clôture est une information d'affichage : `cast_free_vote` vérifie la fenêtre du scrutin avec l'heure SQL (`now()`).

Pour que WhatsApp et les autres robots de partage obtiennent les métadonnées propres à chaque candidat, déployez la fonction Edge publique `candidate-share`. Elle ne lit que `candidate_public_profiles`, une vue publique sans coordonnées privées :

```powershell
supabase link --project-ref VOTRE_REFERENCE_PROJET
supabase functions deploy candidate-share
supabase secrets set SITE_URL=https://VOTRE-DOMAINE
```

Le paramètre `SITE_URL` doit être l'URL publique du frontend, sans barre oblique finale. La fonction utilise uniquement la clé publique `SUPABASE_ANON_KEY` fournie à l'environnement Edge; ne configurez jamais `service_role` côté navigateur. Après le déploiement, les liens de partage produits par l'application passent par cette fonction, qui émet les balises Open Graph puis redirige les visiteurs vers la fiche candidat. Testez le lien public avant de le diffuser.

Les images de l'accueil utilisent des variantes `srcSet` et `sizes`; les images de contenu sont chargées progressivement. Ce projet est une SPA React/Vite, pas Next.js : `next/image` n'est pas disponible sans migration de framework. Les métadonnées changent dans le navigateur pour les fiches, tandis que les aperçus des robots sociaux sont servis par la fonction Edge ci-dessus.

Pour générer les types TypeScript depuis le schéma effectivement déployé, installez et liez la Supabase CLI au projet après avoir appliqué les migrations, puis exécutez :

```powershell
supabase gen types typescript --linked --schema public | Set-Content -Encoding utf8 src/lib/database.types.ts
```

Cette génération n'est pas incluse dans le build Vite actuel (application JavaScript); le fichier généré devra être consommé lors d'une migration TypeScript ou par les annotations JSDoc appropriées.

## Contrôle après migration

- Vérifier que les 5 catégories et les 52 prix sont présents.
- Vérifier avec une session anonyme qu'aucun dossier candidat, vote individuel, détail privé ou événement de paiement n'est lisible.
- Vérifier qu'un utilisateur connecté ne peut accéder qu'à ses propres données, et que seul un administrateur peut consulter les données de modération.
- Garder `votes_open = false` tant que les règles, les comptes et le fournisseur de paiement ne sont pas validés.
- Exécuter un audit Lighthouse mobile sur l'URL de production; un seuil de score ne peut pas être garanti par le build seul.
