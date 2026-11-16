import { NIVELLS, COMPLEMENTS } from './barem.js';

/** Nivell que correspon a un rècord de quinzes. */
export function nivellDe(record) {
  let nivell = NIVELLS[0];
  for (const n of NIVELLS) {
    if (record >= n.minim) nivell = n;
  }
  return nivell;
}

/** Progrés dins del nivell actual cap al següent. */
export function progresNivell(record) {
  const actual = nivellDe(record);
  const seguent = NIVELLS.find((n) => n.numero === actual.numero + 1) ?? null;
  if (!seguent) return { actual, seguent: null, falten: 0, percentatge: 100 };
  const tram = seguent.minim - actual.minim;
  const fet = record - actual.minim;
  return {
    actual,
    seguent,
    falten: seguent.minim - record,
    percentatge: Math.max(0, Math.min(100, (fet / tram) * 100)),
  };
}

export function complementsDesbloquejats(record) {
  return COMPLEMENTS.filter((c) => record >= c.minim);
}

/** Complements que s'han desbloquejat en passar d'un rècord a un altre. */
export function complementsNous(recordAbans, recordDespres) {
  return COMPLEMENTS.filter((c) => c.minim > recordAbans && c.minim <= recordDespres);
}

export function seguentComplement(record) {
  return COMPLEMENTS.find((c) => c.minim > record) ?? null;
}
