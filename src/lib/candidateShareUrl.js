/**
 * Génère le lien direct de vote pour un candidat.
 * Ce lien contient le paramètre ?vote=true pour ouvrir automatiquement
 * le formulaire de vote dès l'arrivée de l'utilisateur.
 */
export function getCandidateVoteUrl(candidateId) {
  if (typeof window === 'undefined') return `/candidat/${encodeURIComponent(candidateId)}?vote=true`;
  return `${window.location.origin}/candidat/${encodeURIComponent(candidateId)}?vote=true`;
}

/**
 * Génère l'URL de partage pour les réseaux sociaux et aperçus OpenGraph.
 * Redirige vers la fiche avec le formulaire de vote pré-ouvert.
 */
export function getCandidateShareUrl(candidateId, { directVote = true } = {}) {
  const projectUrl = import.meta.env.VITE_SUPABASE_URL;
  const suffix = directVote ? '?vote=true' : '';

  if (!projectUrl) {
    if (typeof window === 'undefined') return `/candidat/${encodeURIComponent(candidateId)}${suffix}`;
    return `${window.location.origin}/candidat/${encodeURIComponent(candidateId)}${suffix}`;
  }

  const shareUrl = new URL('/functions/v1/candidate-share', projectUrl);
  shareUrl.searchParams.set('id', candidateId);
  if (directVote) {
    shareUrl.searchParams.set('vote', 'true');
  }
  return shareUrl.href;
}
