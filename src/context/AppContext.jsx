import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getSupabaseClient } from '../lib/supabase';

const AppContext = createContext(null);

const DEFAULT_EVENT_SETTINGS = {
  eventName: 'PRIMART 2028',
  votesOpen: false,
  endDate: null,
  showExactVotes: true,
  freeVotesDailyQuota: 1,
  juryWeight: 30,
  publicWeight: 70,
  hideLeaderboardLastHours: false,
};

const statusToFrench = {
  pending: 'En attente',
  under_review: 'En cours d’examen',
  accepted: 'Accepté',
  rejected: 'Refusé',
  changes_requested: 'Correction demandée',
  suspended: 'Suspendu',
};

const statusToDatabase = Object.fromEntries(
  Object.entries(statusToFrench).map(([databaseStatus, frenchStatus]) => [frenchStatus, databaseStatus])
);

function throwOnError(result) {
  if (result.error) throw result.error;
  return result.data;
}

function normalizePhone(phone) {
  return phone.trim().replace(/[\s()-]/g, '');
}

function mapCandidate(row, categories, prizes, rankings, currentUserId) {
  const category = categories.get(row.category_id);
  const ranking = rankings.get(row.id) || {};
  const isOwner = row.is_owner === true || Boolean(currentUserId && row.user_id && row.user_id === currentUserId);

  return {
    id: row.id,
    userId: row.user_id,
    isOwner,
    name: row.name,
    stageName: row.stage_name,
    age: row.age,
    categoryId: row.category_id,
    category: category?.name || row.category_id,
    prize: prizes.get(row.prize_id) || '',
    city: row.city,
    country: row.country,
    bio: row.bio,
    photo: row.photo_url,
    audioSample: row.audio_sample_url,
    videoUrl: row.video_url,
    socialLinks: row.social_links || {},
    status: statusToFrench[row.status] || row.status,
    rejectionReason: row.rejection_reason,
    votesFree: Number(ranking.votes_free || 0),
    votesPaid: Number(ranking.votes_paid || 0),
    votesTotal: Number(ranking.votes_total || 0),
    previousRank: 0,
    currentRank: Number(ranking.category_rank || 0),
    globalRank: Number(ranking.global_rank || 0),
    votesToLeader: Number(ranking.votes_to_leader || 0),
    categoryVoteShare: Number(ranking.category_vote_share || 0),
    globalVoteShare: Number(ranking.global_vote_share || 0),
    views: Number(row.views_count || 0),
    registeredAt: row.submitted_at || row.created_at,
  };
}

function mapAuditLog(row) {
  return {
    id: row.id,
    action: row.action,
    entity: row.entity_type,
    entityId: row.entity_id,
    metadata: row.metadata || {},
    createdAt: row.created_at,
  };
}

function mapPaymentStatus(status) {
  return {
    pending: 'En attente',
    succeeded: 'Réussie',
    failed: 'Échouée',
    cancelled: 'Annulée',
    refunded: 'Remboursée',
  }[status] || status;
}

function mapTransaction(row) {
  return {
    id: row.id,
    date: row.created_at,
    candidateName: row.candidates?.stage_name || row.candidates?.name || 'Candidat',
    candidateId: row.candidate_id,
    votes: row.votes_count,
    amount: row.amount,
    currency: row.currency,
    paymentMethod: row.payment_method,
    phoneNumber: row.phone_last_digits ? `•••• ${row.phone_last_digits}` : '',
    reference: row.provider_reference || row.id,
    status: mapPaymentStatus(row.status),
  };
}

function mapSuspectVote(row) {
  return {
    id: row.id,
    timestamp: row.created_at,
    candidateName: row.candidates?.stage_name || row.candidates?.name || 'Candidat',
    candidateId: row.candidate_id,
    ipAddress: row.ip_address || '',
    deviceFingerprint: row.device_fingerprint || '',
    type: row.vote_type === 'free' ? 'Gratuit' : 'Payant',
    reason: row.reason,
    status: row.status === 'quarantined' ? 'En quarantaine' : row.status === 'validated' ? 'Validé' : 'Annulé',
  };
}

function mapEventSettings(row) {
  if (!row) return DEFAULT_EVENT_SETTINGS;
  return {
    eventName: row.event_name,
    votesOpen: row.votes_open,
    endDate: row.ends_at,
    showExactVotes: row.show_exact_votes,
    freeVotesDailyQuota: row.free_votes_daily_quota,
    juryWeight: row.jury_weight,
    publicWeight: row.public_weight,
    hideLeaderboardLastHours: row.hide_leaderboard_last_hours,
  };
}

function mapVotePack(row) {
  return {
    id: row.id,
    votes: row.votes,
    price: row.price,
    currency: row.currency === 'XOF' ? 'FCFA' : row.currency,
    badge: row.badge,
    popular: row.popular,
    discount: row.discount,
  };
}

export function AppProvider({ children }) {
  const [candidates, setCandidates] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [suspectVotes, setSuspectVotes] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [eventSettings, setEventSettingsState] = useState(DEFAULT_EVENT_SETTINGS);
  const [voteTotals, setVoteTotals] = useState({ total: 0, free: 0, paid: 0 });
  const [packs, setPacks] = useState([]);
  const [categoriesRaw, setCategoriesRaw] = useState([]);
  const [prizesRaw, setPrizesRaw] = useState([]);
  const [votePacksRaw, setVotePacksRaw] = useState([]);
  const [session, setSession] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminRoleLoading, setAdminRoleLoading] = useState(true);
  const [adminRoleError, setAdminRoleError] = useState('');
  const [authLoading, setAuthLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [dataError, setDataError] = useState('');
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((title, message = '', type = 'info') => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, title, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(toast => toast.id !== id)), 4500);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const refreshData = useCallback(async () => {
    setLoading(true);
    setAdminRoleLoading(true);
    setAdminRoleError('');
    setDataError('');
    let adminRoleLoaded = false;
    try {
      const supabase = getSupabaseClient();
      const currentSession = (await supabase.auth.getSession()).data.session;
      const roleResult = currentSession
        ? await supabase.from('user_roles').select('role').eq('user_id', currentSession.user.id)
        : { data: [], error: null };
      if (roleResult.error) throw roleResult.error;
      const currentUserId = currentSession?.user?.id;
      const userIsAdmin = roleResult.data.some(role => role.role === 'admin');
      setIsAdmin(userIsAdmin);
      adminRoleLoaded = true;
      setAdminRoleLoading(false);

      const candidatePublicPromise = supabase
        .from('candidate_public_profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .then(async res => {
          if (res.error) {
            console.warn('[AppContext] candidate_public_profiles view fallback:', res.error.message);
            const fallback = await supabase
              .from('candidates')
              .select('*')
              .eq('status', 'accepted')
              .eq('is_demo', false)
              .order('created_at', { ascending: false });
            return fallback.error ? { data: [], error: null } : fallback;
          }
          return res;
        });

      const candidateAccountPromise = currentSession
        ? supabase
            .from('candidate_account_profiles')
            .select('*')
            .order('created_at', { ascending: false })
            .then(async res => {
              if (res.error || (userIsAdmin && (!res.data || res.data.length === 0))) {
                if (res.error) {
                  console.warn('[AppContext] candidate_account_profiles view fallback:', res.error.message);
                }
                const fallbackQuery = userIsAdmin
                  ? supabase.from('candidates').select('*').order('created_at', { ascending: false })
                  : supabase.from('candidates').select('*').eq('user_id', currentUserId).order('created_at', { ascending: false });
                const fallback = await fallbackQuery;
                if (!fallback.error && fallback.data && fallback.data.length > 0) {
                  return fallback;
                }
              }
              return res;
            })
        : Promise.resolve({ data: [], error: null });

      const [
        categoryResult,
        prizeResult,
        publicCandidateResult,
        accountCandidateResult,
        totalsResult,
        eventTotalsResult,
        eventResult,
        packsResult,
        transactionResult,
        suspectResult,
        auditResult
      ] = await Promise.all([
        supabase.from('categories').select('id,name,description,icon,sort_order').order('sort_order'),
        supabase.from('prizes').select('id,name,category_id,sort_order').order('sort_order'),
        candidatePublicPromise,
        candidateAccountPromise,
        // Fallback gracefully if candidate_rankings view hasn't been migrated yet
        supabase.from('candidate_rankings').select('candidate_id,votes_total,votes_free,votes_paid,category_rank,global_rank,votes_to_leader,category_vote_share,global_vote_share').then(res => {
          if (res.error) {
            return supabase.from('candidate_vote_totals').select('*').then(fallback => ({
              data: (fallback.data || []).map(r => ({
                candidate_id: r.candidate_id,
                votes_total: r.votes_total,
                votes_free: r.votes_free,
                votes_paid: r.votes_paid,
                category_rank: 0,
                global_rank: 0,
                votes_to_leader: 0,
                category_vote_share: 0,
                global_vote_share: 0,
              })),
              error: null,
            }));
          }
          return res;
        }),
        // Fallback gracefully if event_vote_totals view hasn't been migrated yet
        supabase.from('event_vote_totals').select('votes_total,votes_free,votes_paid').maybeSingle().then(res => {
          if (res.error) {
            return { data: { votes_total: 0, votes_free: 0, votes_paid: 0 }, error: null };
          }
          return res;
        }),
        supabase.from('event_settings').select('*').eq('id', 'primart').maybeSingle(),
        supabase.from('vote_packs').select('*').order('sort_order'),
        supabase.from('payment_orders').select('*, candidates(name,stage_name)').order('created_at', { ascending: false }).then(res => {
          if (res.error) {
            return supabase.from('payment_orders').select('*').order('created_at', { ascending: false });
          }
          return res;
        }),
        supabase.from('suspect_votes').select('*, candidates(name,stage_name)').order('created_at', { ascending: false }).then(res => {
          if (res.error) {
            return supabase.from('suspect_votes').select('*').order('created_at', { ascending: false });
          }
          return res;
        }),
        supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(100),
      ]);

      // Ensure critical catalog data loaded
      if (categoryResult.error) throw categoryResult.error;
      if (prizeResult.error) throw prizeResult.error;
      if (packsResult.error) throw packsResult.error;

      const categoriesData = categoryResult.data || [];
      const prizesData = prizeResult.data || [];
      const packsData = packsResult.data || [];
      const candidatesData = publicCandidateResult.data || [];
      const accountCandidatesData = accountCandidateResult.data || [];
      const totalsData = totalsResult.data || [];

      const categories = new Map(categoriesData.map(row => [row.id, row]));
      const prizes = new Map(prizesData.map(row => [row.id, row.name]));
      const rankings = new Map(totalsData.map(row => [row.candidate_id, row]));
      const candidateRows = new Map(candidatesData.map(row => [row.id, row]));
      accountCandidatesData.forEach(row => candidateRows.set(row.id, row));
      const mappedCandidates = [...candidateRows.values()].map(row => mapCandidate(row, categories, prizes, rankings, currentUserId));

      setCategoriesRaw(categoriesData);
      setPrizesRaw(prizesData);
      setVotePacksRaw(packsData);
      setCandidates(mappedCandidates);
      setTransactions((transactionResult.data || []).map(mapTransaction));
      setSuspectVotes((suspectResult.data || []).map(mapSuspectVote));
      setAuditLogs((auditResult.data || []).map(mapAuditLog));
      setEventSettingsState(mapEventSettings(eventResult.data));
      setVoteTotals({
        total: Number(eventTotalsResult.data?.votes_total || 0),
        free: Number(eventTotalsResult.data?.votes_free || 0),
        paid: Number(eventTotalsResult.data?.votes_paid || 0),
      });
      setPacks(packsData.filter(p => p.active !== false).map(mapVotePack));
    } catch (error) {
      const message = error.message || 'Impossible de charger les données Supabase.';
      setDataError(message);
      setCandidates([]);
      setTransactions([]);
      setSuspectVotes([]);
      setAuditLogs([]);
      setPacks([]);
      setCategoriesRaw([]);
      setPrizesRaw([]);
      setVotePacksRaw([]);
      setVoteTotals({ total: 0, free: 0, paid: 0 });
      if (!adminRoleLoaded) {
        setIsAdmin(false);
        setAdminRoleError(message);
      }
    } finally {
      setAdminRoleLoading(false);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    let subscription;

    void (async () => {
      try {
        const supabase = getSupabaseClient();
        const authState = supabase.auth.onAuthStateChange((_event, nextSession) => {
          if (!active) return;
          setSession(nextSession);
          void refreshData();
        });
        subscription = authState.data.subscription;

        const { data, error } = await supabase.auth.getSession();
        if (!active) return;
        if (error) {
          setDataError(error.message);
          setLoading(false);
        } else {
          setSession(data.session);
          void refreshData();
        }
        setAuthLoading(false);
      } catch (error) {
        if (!active) return;
        setDataError(error.message);
        setLoading(false);
        setAuthLoading(false);
      }
    })();

    return () => {
      active = false;
      subscription?.unsubscribe();
    };
  }, [refreshData]);

  const signUp = useCallback(async ({ email, password, name }) => {
    const { data, error } = await getSupabaseClient().auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: { data: { full_name: name.trim() } },
    });
    if (error) throw error;
    return data;
  }, []);

  const signIn = useCallback(async ({ email, password }) => {
    const { data, error } = await getSupabaseClient().auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    if (error) throw error;
    return data;
  }, []);

  const signOut = useCallback(async () => {
    const { error } = await getSupabaseClient().auth.signOut();
    if (error) throw error;
  }, []);

  const requestVoteOtp = useCallback(async ({ channel, email, phone }) => {
    const supabase = getSupabaseClient();
    const result = channel === 'email'
      ? await supabase.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: { shouldCreateUser: true },
      })
      : await supabase.auth.signInWithOtp({
        phone: normalizePhone(phone),
        options: { shouldCreateUser: true },
      });
    if (result.error) throw result.error;
  }, []);

  const verifyVoteOtp = useCallback(async ({ channel, email, phone, token, firstName, country }) => {
    const supabase = getSupabaseClient();
    const result = channel === 'email'
      ? await supabase.auth.verifyOtp({
        email: email.trim().toLowerCase(),
        token: token.trim(),
        type: 'email',
      })
      : await supabase.auth.verifyOtp({
        phone: normalizePhone(phone),
        token: token.trim(),
        type: 'sms',
      });
    if (result.error) throw result.error;

    const userId = result.data.user?.id;
    if (!userId) throw new Error('La vérification a réussi, mais la session votant est introuvable.');

    const { error: profileError } = await supabase.from('voter_profiles').upsert({
      user_id: userId,
      first_name: firstName.trim(),
      email: email.trim().toLowerCase() || null,
      phone: normalizePhone(phone) || null,
      country,
      verification_channel: channel,
      consent_at: new Date().toISOString(),
    });
    if (profileError) throw profileError;
  }, []);

  const canVoteFree = useCallback(() => eventSettings.votesOpen, [eventSettings.votesOpen]);

  const castFreeVote = useCallback(async (candidateId) => {
    const result = throwOnError(await getSupabaseClient().rpc('cast_free_vote', {
      p_candidate_id: candidateId,
    }));
    await refreshData();
    showToast('Vote gratuit validé !', 'Votre vote a été enregistré.', 'success');
    return result;
  }, [refreshData, showToast]);

  const castPaidVote = useCallback(async () => {
    throw new Error('Les paiements réels ne sont pas encore configurés. Aucun paiement ni vote payant n’a été enregistré.');
  }, []);

  const setEventSettings = useCallback(async (update) => {
    const next = typeof update === 'function' ? update(eventSettings) : update;
    const { error } = await getSupabaseClient()
      .from('event_settings')
      .update({
        event_name: next.eventName,
        votes_open: next.votesOpen,
        ends_at: next.endDate,
        show_exact_votes: next.showExactVotes,
        free_votes_daily_quota: next.freeVotesDailyQuota,
        jury_weight: next.juryWeight,
        public_weight: next.publicWeight,
        hide_leaderboard_last_hours: next.hideLeaderboardLastHours,
      })
      .eq('id', 'primart');
    if (error) throw error;
    setEventSettingsState(next);
  }, [eventSettings]);

  const moderateCandidate = useCallback(async (candidateId, newStatus, reason = '') => {
    const status = statusToDatabase[newStatus];
    if (!status) throw new Error('Statut de modération non reconnu.');
    const { error } = await getSupabaseClient()
      .from('candidates')
      .update({
        status,
        rejection_reason: reason || null,
        moderated_at: new Date().toISOString(),
      })
      .eq('id', candidateId);
    if (error) throw error;
    await refreshData();
    showToast('Statut mis à jour', `Candidat passé au statut « ${newStatus} ».`, 'success');
  }, [refreshData, showToast]);

  const addCandidate = useCallback(async (candidateData) => {
    const { data: candidateId, error } = await getSupabaseClient().rpc('submit_candidate', {
      p_name: candidateData.name,
      p_stage_name: candidateData.stageName || candidateData.name,
      p_age: candidateData.age,
      p_city: candidateData.city,
      p_country: candidateData.country,
      p_bio: candidateData.bio,
      p_photo_url: candidateData.photo,
      p_audio_sample_url: candidateData.audioSample,
      p_video_url: candidateData.videoUrl,
      p_social_links: candidateData.socialLinks || {},
      p_category_id: candidateData.categoryId,
      p_prize_name: candidateData.prize,
      p_email: candidateData.email,
      p_phone: candidateData.phone,
    });
    if (error) throw error;
    const candidate = {
      ...candidateData,
      id: candidateId,
      status: 'En attente',
      votesFree: 0,
      votesPaid: 0,
      votesTotal: 0,
      currentRank: 0,
      globalRank: 0,
      votesToLeader: 0,
      categoryVoteShare: 0,
      globalVoteShare: 0,
      previousRank: 0,
      registeredAt: new Date().toISOString(),
    };
    await refreshData();
    showToast('Candidature enregistrée', 'Votre dossier a été transmis au comité de modération.', 'success');
    return candidate;
  }, [refreshData, showToast]);

  const uploadCandidatePhoto = useCallback(async (file) => {
    if (!session?.user.id) throw new Error('Connectez-vous avant de téléverser une photo.');
    if (!file || !['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      throw new Error('La photo doit être au format JPEG, PNG ou WebP.');
    }
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('La photo ne peut pas dépasser 5 Mo.');
    }

    const path = `${session.user.id}/${crypto.randomUUID()}`;
    const supabase = getSupabaseClient();
    const { error } = await supabase.storage
      .from('candidate-media')
      .upload(path, file, { contentType: file.type, upsert: false });
    if (error) throw error;

    return {
      path,
      url: supabase.storage.from('candidate-media').getPublicUrl(path).data.publicUrl,
    };
  }, [session]);

  const removeCandidatePhoto = useCallback(async (path) => {
    const { error } = await getSupabaseClient().storage.from('candidate-media').remove([path]);
    if (error) throw error;
  }, []);

  const updateCandidate = useCallback(async (candidateId, fields) => {
    const { error } = await getSupabaseClient()
      .from('candidates')
      .update({
        bio: fields.bio,
        video_url: fields.videoUrl,
        social_links: fields.socialLinks,
      })
      .eq('id', candidateId);
    if (error) throw error;
    await refreshData();
    showToast('Profil actualisé', 'Vos modifications ont été enregistrées.', 'success');
  }, [refreshData, showToast]);

  const resolveSuspectVote = useCallback(async (suspectId, action) => {
    const { error } = await getSupabaseClient()
      .from('suspect_votes')
      .update({
        status: action === 'validate' ? 'validated' : 'cancelled',
        resolved_by: session?.user.id,
        resolved_at: new Date().toISOString(),
      })
      .eq('id', suspectId);
    if (error) throw error;
    await refreshData();
    showToast('Action anti-fraude exécutée', 'La décision a été enregistrée.', 'success');
  }, [refreshData, session, showToast]);

  // ─── Categories Management ───────────────────────────────────────────────

  const addCategory = useCallback(async ({ name, description, icon }) => {
    const id = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const maxOrder = categoriesRaw.reduce((max, c) => Math.max(max, c.sort_order || 0), 0);
    const { error } = await getSupabaseClient()
      .from('categories')
      .insert({ id, name, description: description || null, icon: icon || 'Trophy', sort_order: maxOrder + 1 });
    if (error) throw error;
    await refreshData();
  }, [categoriesRaw, refreshData]);

  const updateCategory = useCallback(async (categoryId, fields) => {
    const update = {};
    if (fields.name !== undefined) update.name = fields.name;
    if (fields.description !== undefined) update.description = fields.description || null;
    if (fields.icon !== undefined) update.icon = fields.icon;
    if (fields.sort_order !== undefined) update.sort_order = fields.sort_order;
    const { error } = await getSupabaseClient()
      .from('categories')
      .update(update)
      .eq('id', categoryId);
    if (error) throw error;
    await refreshData();
  }, [refreshData]);

  const deleteCategory = useCallback(async (categoryId) => {
    const { error } = await getSupabaseClient()
      .from('categories')
      .delete()
      .eq('id', categoryId);
    if (error) throw error;
    await refreshData();
  }, [refreshData]);

  // ─── Prizes Management ───────────────────────────────────────────────────

  const addPrize = useCallback(async ({ name, category_id }) => {
    const maxOrder = prizesRaw.filter(p => p.category_id === category_id).reduce((max, p) => Math.max(max, p.sort_order || 0), 0);
    const { error } = await getSupabaseClient()
      .from('prizes')
      .insert({ name, category_id, sort_order: maxOrder + 1 });
    if (error) throw error;
    await refreshData();
  }, [prizesRaw, refreshData]);

  const updatePrize = useCallback(async (prizeId, fields) => {
    const update = {};
    if (fields.name !== undefined) update.name = fields.name;
    if (fields.category_id !== undefined) update.category_id = fields.category_id;
    if (fields.sort_order !== undefined) update.sort_order = fields.sort_order;
    const { error } = await getSupabaseClient()
      .from('prizes')
      .update(update)
      .eq('id', prizeId);
    if (error) throw error;
    await refreshData();
  }, [refreshData]);

  const deletePrize = useCallback(async (prizeId) => {
    const { error } = await getSupabaseClient()
      .from('prizes')
      .delete()
      .eq('id', prizeId);
    if (error) throw error;
    await refreshData();
  }, [refreshData]);

  // ─── Vote Packs / Pricing Management ──────────────────────────────────────

  const addVotePack = useCallback(async ({ id, votes, price, discount, popular, badge, active }) => {
    const packId = id || `pack-${Date.now().toString(36)}`;
    const maxOrder = votePacksRaw.reduce((max, p) => Math.max(max, p.sort_order || 0), 0);
    const { error } = await getSupabaseClient()
      .from('vote_packs')
      .insert({
        id: packId,
        votes: Number(votes),
        price: Number(price),
        currency: 'XOF',
        badge: badge || null,
        popular: Boolean(popular),
        discount: discount || null,
        active: active !== undefined ? Boolean(active) : true,
        sort_order: maxOrder + 1,
      });
    if (error) throw error;
    await refreshData();
  }, [votePacksRaw, refreshData]);

  const updateVotePack = useCallback(async (packId, fields) => {
    const update = {};
    if (fields.votes !== undefined) update.votes = Number(fields.votes);
    if (fields.price !== undefined) update.price = Number(fields.price);
    if (fields.discount !== undefined) update.discount = fields.discount || null;
    if (fields.badge !== undefined) update.badge = fields.badge || null;
    if (fields.popular !== undefined) update.popular = Boolean(fields.popular);
    if (fields.active !== undefined) update.active = Boolean(fields.active);
    if (fields.sort_order !== undefined) update.sort_order = Number(fields.sort_order);
    const { error } = await getSupabaseClient()
      .from('vote_packs')
      .update(update)
      .eq('id', packId);
    if (error) throw error;
    await refreshData();
  }, [refreshData]);

  const deleteVotePack = useCallback(async (packId) => {
    const { error } = await getSupabaseClient()
      .from('vote_packs')
      .delete()
      .eq('id', packId);
    if (error) throw error;
    await refreshData();
  }, [refreshData]);

  const totalVotesCount = voteTotals.total;
  const totalFreeVotesCount = voteTotals.free;
  const totalPaidVotesCount = voteTotals.paid;
  const totalRevenueFCFA = transactions
    .filter(transaction => transaction.status === 'Réussie')
    .reduce((total, transaction) => total + Number(transaction.amount || 0), 0);

  const value = useMemo(() => ({
    candidates,
    transactions,
    suspectVotes,
    auditLogs,
    eventSettings,
    setEventSettings,
    toasts,
    showToast,
    removeToast,
    canVoteFree,
    castFreeVote,
    castPaidVote,
    moderateCandidate,
    addCandidate,
    uploadCandidatePhoto,
    removeCandidatePhoto,
    updateCandidate,
    resolveSuspectVote,
    totalVotesCount,
    totalFreeVotesCount,
    totalPaidVotesCount,
    totalRevenueFCFA,
    packs,
    categoriesRaw,
    prizesRaw,
    votePacksRaw,
    addCategory,
    updateCategory,
    deleteCategory,
    addPrize,
    updatePrize,
    deletePrize,
    addVotePack,
    updateVotePack,
    deleteVotePack,
    session,
    isAdmin,
    adminRoleLoading,
    adminRoleError,
    authLoading,
    signUp,
    signIn,
    signOut,
    requestVoteOtp,
    verifyVoteOtp,
    loading,
    dataError,
    refreshData,
  }), [
    candidates, transactions, suspectVotes, auditLogs, eventSettings, setEventSettings, toasts,
    showToast, removeToast, canVoteFree, castFreeVote, castPaidVote, moderateCandidate,
    addCandidate, uploadCandidatePhoto, removeCandidatePhoto, updateCandidate, resolveSuspectVote, totalVotesCount, totalFreeVotesCount,
    totalPaidVotesCount, totalRevenueFCFA, packs, categoriesRaw, prizesRaw, votePacksRaw,
    addCategory, updateCategory, deleteCategory, addPrize, updatePrize, deletePrize,
    addVotePack, updateVotePack, deleteVotePack,
    session, isAdmin, adminRoleLoading, adminRoleError, authLoading, signUp, signIn,
    signOut, requestVoteOtp, verifyVoteOtp, loading, dataError, refreshData,
  ]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
}
