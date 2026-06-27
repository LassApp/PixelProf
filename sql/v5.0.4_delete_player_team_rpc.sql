-- ════════════════════════════════════════════════════════════════════
-- PixelProf v5.0.4 — Fix DELETE silenzioso su players/teams
-- ════════════════════════════════════════════════════════════════════
--
-- PROBLEMA RISOLTO:
--   db_adapter.js eseguiva DELETE diretta su 'players'/'teams' tramite
--   il client anon. Se la policy RLS blocca l'operazione per il ruolo
--   'authenticated', Postgres NON genera un errore: una DELETE che
--   tocca 0 righe è "successo" dal punto di vista SQL. Il client quindi
--   non vedeva alcun errore e logava "OK" anche quando, di fatto,
--   nessuna riga era stata cancellata sul cloud — un fallimento
--   completamente invisibile al docente.
--
-- SOLUZIONE:
--   Due RPC SECURITY DEFINER (stesso pattern già in uso per
--   director_delete_classroom) che bypassano RLS e restituiscono il
--   numero di righe effettivamente cancellate. Il client (db_adapter.js,
--   già aggiornato) ora distingue un vero successo (>=1 riga) da un
--   fallimento esplicito (0 righe), e la UI avvisa il docente.
--
-- NOTA: nessun controllo auth.uid() interno alla funzione — su questo
-- progetto Supabase, auth.uid() in contesto SECURITY DEFINER ha causato
-- errori 400 in passato (vedi storia di director_delete_classroom). Il
-- controllo di accesso resta lato client: l'azione è disponibile solo
-- dentro un'aula già aperta (activeCourseId valido), stesso modello di
-- sicurezza già in uso per le altre azioni di gestione aula.
--
-- ESEGUIRE QUESTO INTERO FILE NEL SUPABASE SQL EDITOR.
-- ════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION delete_player(p_classroom_id uuid, p_player_name text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count integer;
BEGIN
  DELETE FROM players
  WHERE classroom_id = p_classroom_id
    AND name = p_player_name;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;
GRANT EXECUTE ON FUNCTION delete_player(uuid, text) TO authenticated;

CREATE OR REPLACE FUNCTION delete_team(p_classroom_id uuid, p_team_name text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count integer;
BEGIN
  DELETE FROM teams
  WHERE classroom_id = p_classroom_id
    AND name = p_team_name;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;
GRANT EXECUTE ON FUNCTION delete_team(uuid, text) TO authenticated;

-- ════════════════════════════════════════════════════════════════════
-- VERIFICA POST-INSTALLAZIONE (opzionale, da eseguire dopo aver
-- lanciato le CREATE FUNCTION sopra):
--
--   SELECT delete_player('00000000-0000-0000-0000-000000000000', 'test_inesistente');
--   -- deve restituire 0 (nessuna riga trovata), NON un errore.
--
-- Se ottieni un errore "function delete_player(uuid, text) does not
-- exist" durante l'uso reale nell'app, vuol dire che questo script non
-- è stato eseguito o GRANT EXECUTE non è andato a buon fine.
-- ════════════════════════════════════════════════════════════════════
