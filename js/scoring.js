/* ==================================================
   QUIZ SCORING ENGINE  v2.1.7
   Quiz:        base 100 + speed bonus + streak bonus
   Speed Quiz:  invariato (speedPtsPerQ  timer)
   Fill:        base 100 + streak bonus (no speed)
================================================== */

/**
 * Speed bonus per risposta (solo Quiz normale, non Speed Quiz).
 * Il tempo  soft: non esiste timeout, serve solo per bonus.
 * @param {number} ms  Millisecondi dalla visualizzazione alla risposta
 * @returns {number}   Bonus (0 | 10 | 30 | 50)
 */
function calcQuizSpeedBonus(ms){
  if(ms < 2000) return 50;
  if(ms < 5000) return 30;
  if(ms < 8000) return 10;
  return 0;
}

/**
 * Streak bonus milestone.
 * Chiamata una sola volta quando la streak raggiunge esattamente la soglia.
 * @param {number} streak  Streak corrente DOPO la risposta corretta
 * @returns {number}       Bonus one-shot (0 | 50 | 100 | 250)
 */
function calcStreakBonus(streak){
  if(streak === 10) return 250;
  if(streak ===  5) return 100;
  if(streak ===  3) return  50;
  return 0;
}

/**
 * Calcola il punteggio completo di una risposta Quiz.
 * @param {boolean} correct
 * @param {number}  responseTimeMs
 * @param {number}  newStreak        Streak aggiornata (post risposta)
 * @returns {{ scoreEarned:number, speedBonus:number, streakBonus:number }}
 */
function calcQuizAnswerScore(correct, responseTimeMs, newStreak){
  if(!correct) return { scoreEarned:0, speedBonus:0, streakBonus:0 };
  const speedBonus  = calcQuizSpeedBonus(responseTimeMs);
  const streakBonus = calcStreakBonus(newStreak);
  return { scoreEarned: 100 + speedBonus + streakBonus, speedBonus, streakBonus };
}

/**
 * Calcola il punteggio di una risposta Completa la frase.
 * No speed bonus; streak bonus dimezzato rispetto al Quiz.
 * @param {boolean} correct
 * @param {number}  newStreak
 * @returns {{ scoreEarned:number, streakBonus:number }}
 */
function calcFillAnswerScore(correct, newStreak){
  if(!correct) return { scoreEarned:0, streakBonus:0 };
  const streakBonus = Math.round(calcStreakBonus(newStreak) / 2);
  return { scoreEarned: 100 + streakBonus, streakBonus };
}


/* Points per correct answer in Speed Quiz — scales with question count */
function speedPtsPerQ(n){ return n<=5?1:n<=10?2:n<=15?3:4; }
