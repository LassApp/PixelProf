/**
 * invite_teacher — Supabase Edge Function
 * PixelProf v3.1.1
 *
 * Invita un nuovo docente tramite Supabase Admin API.
 * Usa la service_role key (disponibile solo server-side).
 *
 * Endpoint: POST /functions/v1/invite_teacher
 * Body JSON: { email: string, name: string }
 * Auth: richiede JWT del direttore (verificato internamente)
 *
 * Risposta OK:  { ok: true, user_id: string }
 * Risposta ERR: { ok: false, error: string }
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req: Request) => {

  // Gestione preflight CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // ── 1. Leggi body ────────────────────────────────────────────
    const { email, name } = await req.json();
    if (!email) {
      return Response.json({ ok: false, error: 'email obbligatoria' }, { status: 400, headers: corsHeaders });
    }

    // ── 2. Verifica che il chiamante sia un direttore ────────────
    // Il JWT del chiamante viene estratto dall'header Authorization.
    // Usiamo il client con anon key per verificare il token.
    const anonClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } } }
    );

    const { data: { user }, error: authErr } = await anonClient.auth.getUser();
    if (authErr || !user) {
      return Response.json({ ok: false, error: 'Non autenticato' }, { status: 401, headers: corsHeaders });
    }

    // Leggi il ruolo dal profilo
    const { data: profile, error: profileErr } = await anonClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileErr || profile?.role !== 'director') {
      return Response.json({ ok: false, error: 'Permesso negato — solo il direttore può invitare docenti' }, { status: 403, headers: corsHeaders });
    }

    // ── 3. Usa service_role per chiamare Admin API ───────────────
    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { data: inviteData, error: inviteErr } = await adminClient.auth.admin.inviteUserByEmail(email, {
      data: {
        name:  name || email,
        role: 'teacher',
      },
      // redirectTo opzionale: URL dove l'utente imposta la password
      // redirectTo: 'https://lassapp.github.io/PixelProf/',
    });

    if (inviteErr) {
      // Caso frequente: utente già esistente
      if (inviteErr.message?.includes('already been registered')) {
        return Response.json({ ok: false, error: 'Email già registrata. Il docente esiste già.' }, { status: 409, headers: corsHeaders });
      }
      throw inviteErr;
    }

    // ── 4. Aggiorna il profilo con nome e ruolo ─────────────────
    // Il trigger handle_new_user crea il profilo, ma potrebbe non avere il nome.
    // Aggiorniamo esplicitamente dopo l'invite.
    if (inviteData?.user?.id) {
      await adminClient
        .from('profiles')
        .upsert({
          id:   inviteData.user.id,
          name: name || email,
          role: 'teacher',
        }, { onConflict: 'id' });
    }

    return Response.json(
      { ok: true, user_id: inviteData?.user?.id ?? null },
      { status: 200, headers: corsHeaders }
    );

  } catch (err) {
    console.error('[invite_teacher] errore:', err);
    return Response.json(
      { ok: false, error: err instanceof Error ? err.message : 'Errore interno' },
      { status: 500, headers: corsHeaders }
    );
  }
});
