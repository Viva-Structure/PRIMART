const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function htmlResponse(status: number, body: string): Response {
  return new Response(body, {
    status,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=60, s-maxage=300',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    },
  });
}

Deno.serve(async (request) => {
  const projectUrl = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const siteUrl = Deno.env.get('SITE_URL')?.replace(/\/+$/, '');
  let frontendUrl: URL | null = null;
  try {
    frontendUrl = siteUrl ? new URL(siteUrl) : null;
  } catch {
    frontendUrl = null;
  }
  if (!projectUrl || !anonKey || !frontendUrl || !['https:', 'http:'].includes(frontendUrl.protocol)) {
    return htmlResponse(503, '<!doctype html><title>Partage indisponible</title><p>Le partage de ce profil est momentanément indisponible.</p>');
  }

  const candidateId = new URL(request.url).searchParams.get('id') || '';
  if (!uuidPattern.test(candidateId)) {
    return htmlResponse(400, '<!doctype html><title>Profil introuvable</title><p>Ce profil n’est pas disponible.</p>');
  }

  const apiHeaders = {
    apikey: anonKey,
    Authorization: `Bearer ${anonKey}`,
    Accept: 'application/json',
  };
  const apiUrl = new URL('/rest/v1/candidate_public_profiles', projectUrl);
  apiUrl.searchParams.set('select', 'id,name,stage_name,category_id,prize_id,photo_url');
  apiUrl.searchParams.set('id', `eq.${candidateId}`);

  try {
    const candidateResponse = await fetch(apiUrl, { headers: apiHeaders });
    if (!candidateResponse.ok) {
      return htmlResponse(502, '<!doctype html><title>Partage indisponible</title><p>Impossible de charger ce profil.</p>');
    }
    const [candidate] = await candidateResponse.json();
    if (!candidate) {
      return htmlResponse(404, '<!doctype html><title>Profil introuvable</title><p>Ce profil n’est pas disponible.</p>');
    }

    const lookup = async (table: string, id: string): Promise<string> => {
      const url = new URL(`/rest/v1/${table}`, projectUrl);
      url.searchParams.set('select', 'name');
      url.searchParams.set('id', `eq.${id}`);
      const response = await fetch(url, { headers: apiHeaders });
      if (!response.ok) throw new Error(`Failed to load public ${table} metadata`);
      const [row] = await response.json();
      return row?.name || '';
    };
    const [category, prize] = await Promise.all([
      lookup('categories', candidate.category_id),
      lookup('prizes', candidate.prize_id),
    ]);

    const name = candidate.stage_name || candidate.name;
    const title = `${name} | PRIMART 2028`;
    const description = `Découvrez ${name}, candidat${category ? ` dans la catégorie ${category}` : ''}${prize ? ` pour le prix ${prize}` : ''}.`;
    const canonicalUrl = `${frontendUrl.origin}/candidat/${candidateId}`;
    const photoUrl = candidate.photo_url ? new URL(candidate.photo_url, projectUrl) : null;
    const imageUrl = photoUrl?.protocol === 'https:' ? photoUrl.href : '';
    const safeTitle = escapeHtml(title);
    const safeDescription = escapeHtml(description);
    const safeCanonicalUrl = escapeHtml(canonicalUrl);
    const safeImageUrl = escapeHtml(imageUrl);

    return htmlResponse(200, `<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${safeTitle}</title>
  <meta name="description" content="${safeDescription}">
  <link rel="canonical" href="${safeCanonicalUrl}">
  <meta property="og:site_name" content="PRIMART 2028">
  <meta property="og:type" content="profile">
  <meta property="og:title" content="${safeTitle}">
  <meta property="og:description" content="${safeDescription}">
  <meta property="og:url" content="${safeCanonicalUrl}">
  ${safeImageUrl ? `<meta property="og:image" content="${safeImageUrl}">` : ''}
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${safeTitle}">
  <meta name="twitter:description" content="${safeDescription}">
  ${safeImageUrl ? `<meta name="twitter:image" content="${safeImageUrl}">` : ''}
  <meta http-equiv="refresh" content="1;url=${safeCanonicalUrl}">
</head>
<body>
  <p>Ouverture du profil de ${escapeHtml(name)}… <a href="${safeCanonicalUrl}">Continuer</a></p>
  <script>window.location.replace(${JSON.stringify(canonicalUrl)});</script>
</body>
</html>`);
  } catch (error) {
    console.error('candidate-share metadata rendering failed:', error);
    return htmlResponse(502, '<!doctype html><title>Partage indisponible</title><p>Impossible de charger ce profil.</p>');
  }
});
