export function getCandidateShareUrl(candidateId) {
  const projectUrl = import.meta.env.VITE_SUPABASE_URL;
  if (!projectUrl) return new URL(`/candidat/${encodeURIComponent(candidateId)}`, window.location.origin).href;

  const shareUrl = new URL('/functions/v1/candidate-share', projectUrl);
  shareUrl.searchParams.set('id', candidateId);
  return shareUrl.href;
}
