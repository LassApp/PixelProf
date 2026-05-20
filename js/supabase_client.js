/**
 * supabase_client.js — PixelProf v2.1.5
 *
 * Inizializzazione del client Supabase.
 * Importato da tutti gli altri moduli JS.
 *
 * CONFIGURAZIONE:
 *   1. Vai su https://supabase.com → il tuo progetto → Settings → API
 *   2. Copia "Project URL" e incollalo in SUPABASE_URL
 *   3. Copia "anon public" key e incollala in SUPABASE_ANON_KEY
 *
 * NOTA: la anon key è PUBBLICA per design (Supabase è BaaS).
 *       La sicurezza è garantita dalle RLS policies nel database.
 */

// ── Costanti di configurazione ────────────────────────────────────
// SOSTITUISCI con i tuoi valori reali da Supabase Dashboard → Settings → API
const SUPABASE_URL      = 'https://skrgqanqdyrybarinwwr.supabase.co';   // ← cambia qui
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNrcmdxYW5xZHlyeWJhcmlud3dyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxODk0MTYsImV4cCI6MjA5NDc2NTQxNn0.0k17FJuqYNWCk2bWwWkYF7-5l5qX3RLXdMsgh9cHrGQ';   // ← cambia qui

// ── Importazione SDK da CDN (compatibile GitHub Pages) ────────────
// Caricato via <script type="module"> nel HTML principale.
// Non serve npm, non serve build step.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

/**
 * Client singleton — usato da tutti gli altri moduli.
 * @type {import('@supabase/supabase-js').SupabaseClient}
 */
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    // Nessun login per ora — accesso anonimo puro
    persistSession: false,
    autoRefreshToken: false,
  },
  // Timeout generoso per reti scolastiche lente
  global: {
    fetch: (...args) => fetch(...args),
  },
});

/**
 * Test di connessione — chiama questa in console per verificare.
 * Esempio: await testSupabaseConnection()
 */
export async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase.from('classes').select('count').limit(1);
    if (error) throw error;
    console.log('[PixelProf] ✅ Supabase connesso correttamente');
    return true;
  } catch (err) {
    console.error('[PixelProf] ❌ Errore connessione Supabase:', err.message);
    return false;
  }
}
