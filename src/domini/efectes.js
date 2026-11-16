import { nivellDe, complementsNous } from './nivells.js';
import { estatPartida } from './partida.js';

/**
 * Compara l'estat d'abans i de després d'atorgar quinzes i diu què s'ha de celebrar:
 * pujades de nivell, complements nous, joc guanyat i partida guanyada.
 */
export function efectesAtorgar(abans, despres) {
  const pujades = [];
  const complements = [];
  const anteriors = new Map(abans.alumnes.map((a) => [a.id, a]));

  for (const a of despres.alumnes) {
    const vell = anteriors.get(a.id);
    if (!vell || vell.record === a.record) continue;
    const nivell = nivellDe(a.record);
    if (nivell.numero > nivellDe(vell.record).numero) pujades.push({ alumneId: a.id, nom: a.nom, nivell });
    for (const complement of complementsNous(vell.record, a.record)) {
      complements.push({ alumneId: a.id, nom: a.nom, complement });
    }
  }

  const pAbans = estatPartida(abans.partida);
  const pDespres = estatPartida(despres.partida);
  return {
    pujades,
    complements,
    jocGuanyat: pDespres.jocs > pAbans.jocs,
    partidaGuanyada: pDespres.guanyada && !pAbans.guanyada,
  };
}
