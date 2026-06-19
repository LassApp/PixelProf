/**
 * supabase_client.js — PixelProf v5.0.0
 *
 * Inizializzazione del client Supabase.
 * Importato da tutti gli altri moduli JS.
 *
 * CREDENZIALI: già configurate — non modificare.
 * La anon key è PUBBLICA by design (BaaS).
 * La sicurezza è garantita dalle RLS policies nel DB.
 *
 * v5.0.0 M5: SUPABASE_URL e SUPABASE_ANON_KEY sono ora
 * esportate come costanti named. Sono anche esposte su
 * window.__SB per i file <script> classici (app.js)
 * che non possono usare import. Nessuna credenziale
 * hardcoded altrove nel codebase.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export const SUPABASE_URL      = 'https://skrgqanqdyrybarinwwr.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNrcmdxYW5xZHlyeWJhcmlud3dyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxODk0MTYsImV4cCI6MjA5NDc2NTQxNn0.0k17FJuqYNWCk2bWwWkYF7-5l5qX3RLXdMsgh9cHrGQ';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession:    true,   // v3: necessario per login docente con JWT
    autoRefreshToken:  true,   // rinnovo silenzioso del token
    detectSessionInUrl: true,  // gestisce link di invito/reset password
  },
  global: {
    fetch: (...args) => fetch(...args),
  },
});

// Espone URL e KEY su window.__SB per i file <script> classici (app.js)
// che non possono usare import ES Module.
window.__SB = { url: SUPABASE_URL, key: SUPABASE_ANON_KEY };

/**
 * Test di connessione — usa in console: await testSupabaseConnection()
 */
export async function testSupabaseConnection() {
  try {
    const { error } = await supabase.from('classrooms').select('id').limit(1);
    if (error) throw error;
    console.log('[PixelProf] ✅ Supabase connesso correttamente');
    return true;
  } catch (err) {
    console.error('[PixelProf] ❌ Errore connessione Supabase:', err.message);
    return false;
  }
}
