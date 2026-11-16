import { CATEGORIES_TRINQUET } from './barem.js';

/** Propostes del trinquet d'un tipus ('positiu' | 'millora') que encara no estan actives a l'aula. */
export function suggerimentsDisponibles(categories, tipus) {
  const actives = new Set(categories.filter((c) => !c.arxivada).map((c) => c.id));
  return CATEGORIES_TRINQUET.filter((c) => c.tipus === tipus && !actives.has(c.id));
}
