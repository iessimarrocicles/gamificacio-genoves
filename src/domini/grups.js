// Grups dins d'una classe: taules, equips cooperatius, colles de lectura…
// Es poden crear, canviar i esborrar quan es vulga, i un/a alumne/a pot estar en més d'un.

export const COLORS_GRUP = {
  blau: { nom: 'Blau', fons: '#1f4fa3', clar: '#dbe6f8', text: '#ffffff' },
  roig: { nom: 'Roig', fons: '#d7263d', clar: '#fbdfe3', text: '#ffffff' },
  groc: { nom: 'Groc', fons: '#f9c22e', clar: '#fef3cf', text: '#1e2733' },
  verd: { nom: 'Verd', fons: '#1f8a5b', clar: '#d9f0e5', text: '#ffffff' },
  taronja: { nom: 'Taronja', fons: '#e2711d', clar: '#fbe5d3', text: '#ffffff' },
  lila: { nom: 'Lila', fons: '#7a4fb5', clar: '#e9dff6', text: '#ffffff' },
};

export const NOMS_EQUIP = [
  'Colla del Dau',
  'Colla de la Corda',
  'Colla de l’Escala',
  'Colla del Rebot',
  'Colla de la Galeria',
  'Colla de la Llotgeta',
  'Colla del Raspall',
  'Colla de la Vaqueta',
];

export function colorValid(color) {
  return Object.hasOwn(COLORS_GRUP, color) ? color : 'blau';
}

/** Color que encara no usa cap grup (o el primer, si s'han acabat). */
export function colorLliure(grups) {
  const usats = new Set(grups.map((g) => g.color));
  return Object.keys(COLORS_GRUP).find((c) => !usats.has(c)) ?? 'blau';
}

export function membresGrup(estat, grup) {
  const ids = new Set(grup.alumneIds);
  return estat.alumnes.filter((a) => ids.has(a.id));
}

/** Els quinzes d'un grup són la suma dels que tenen ara els seus membres. */
export function quinzesGrup(estat, grup) {
  return membresGrup(estat, grup).reduce((suma, a) => suma + a.quinzes, 0);
}

/** Reparteix tots els alumnes a l'atzar en `n` equips equilibrats. */
export function repartirEnEquips(alumnes, n, atzar = Math.random) {
  if (alumnes.length === 0) return [];
  const quants = Math.max(2, Math.min(Math.round(Number(n)) || 2, alumnes.length, NOMS_EQUIP.length));
  const barrejats = [...alumnes];
  for (let i = barrejats.length - 1; i > 0; i -= 1) {
    const j = Math.floor(atzar() * (i + 1));
    [barrejats[i], barrejats[j]] = [barrejats[j], barrejats[i]];
  }
  const colors = Object.keys(COLORS_GRUP);
  const segell = Date.now().toString(36);
  const equips = Array.from({ length: quants }, (_, i) => ({
    id: `grup-${segell}-${i}`,
    nom: NOMS_EQUIP[i],
    color: colors[i % colors.length],
    alumneIds: [],
  }));
  barrejats.forEach((a, i) => equips[i % quants].alumneIds.push(a.id));
  return equips;
}
