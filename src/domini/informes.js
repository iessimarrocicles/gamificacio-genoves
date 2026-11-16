import { nivellDe } from './nivells.js';

export const PERIODES = [
  { id: 'setmana', nom: 'Esta setmana' },
  { id: 'mes', nom: 'Este mes' },
  { id: 'tot', nom: 'Tot el curs' },
];

/** Primer instant del període (hora local) o null si no té límit. */
export function iniciPeriode(periode, ara = new Date()) {
  const d = new Date(ara);
  d.setHours(0, 0, 0, 0);
  if (periode === 'setmana') {
    const desDeDilluns = (d.getDay() + 6) % 7;
    d.setDate(d.getDate() - desDeDilluns);
    return d;
  }
  if (periode === 'mes') {
    d.setDate(1);
    return d;
  }
  return null;
}

function delPeriode(esdeveniments, periode, ara) {
  const inici = iniciPeriode(periode, ara);
  if (!inici) return esdeveniments;
  const t = inici.getTime();
  return esdeveniments.filter((ev) => new Date(ev.data).getTime() >= t);
}

function suma(esdeveniments) {
  let guanyats = 0;
  let restats = 0;
  let avisos = 0;
  for (const ev of esdeveniments) {
    if (ev.tipus === 'avis') avisos += 1;
    else if (ev.valor > 0) guanyats += ev.valor;
    else restats += -ev.valor;
  }
  return { guanyats, restats, avisos };
}

function perCategoria(estat, esdeveniments) {
  const ordre = new Map(estat.categories.map((c, i) => [c.id, i]));
  const mapa = new Map();
  for (const ev of esdeveniments) {
    const fila = mapa.get(ev.categoriaId) ?? { id: ev.categoriaId, vegades: 0, quinzes: 0, avisos: 0 };
    fila.vegades += 1;
    fila.quinzes += ev.valor;
    if (ev.tipus === 'avis') fila.avisos += 1;
    mapa.set(ev.categoriaId, fila);
  }
  return [...mapa.values()]
    .map((fila) => {
      const c = estat.categories.find((x) => x.id === fila.id);
      return { ...fila, nom: c?.nom ?? 'Categoria esborrada', icona: c?.icona ?? '❔', tipus: c?.tipus ?? 'positiu' };
    })
    .sort((a, b) => b.vegades - a.vegades || (ordre.get(a.id) ?? 999) - (ordre.get(b.id) ?? 999));
}

export function resumGrup(estat, periode = 'tot', ara = new Date()) {
  const esdeveniments = delPeriode(estat.esdeveniments, periode, ara);
  const files = estat.alumnes
    .map((a) => {
      const seus = esdeveniments.filter((ev) => ev.alumneId === a.id);
      return { id: a.id, nom: a.nom, quinzes: a.quinzes, record: a.record, nivell: nivellDe(a.record), ...suma(seus) };
    })
    .sort((a, b) => b.guanyats - a.guanyats || a.nom.localeCompare(b.nom, 'ca'));
  return { ...suma(esdeveniments), files, categories: perCategoria(estat, esdeveniments) };
}

export function resumAlumne(estat, alumneId, periode = 'tot', ara = new Date()) {
  const alumne = estat.alumnes.find((a) => a.id === alumneId);
  if (!alumne) return null;
  const seus = delPeriode(estat.esdeveniments, periode, ara).filter((ev) => ev.alumneId === alumneId);
  return {
    alumne,
    nivell: nivellDe(alumne.record),
    ...suma(seus),
    categories: perCategoria(estat, seus),
    ultims: [...seus].reverse().slice(0, 12),
  };
}

const clauDia = (d) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

/** Quinzes guanyats cada dia durant els últims `dies` dies (l'últim és hui). */
export function evolucioDiaria(estat, dies = 14, ara = new Date(), alumneId = null) {
  const perDia = new Map();
  for (const ev of estat.esdeveniments) {
    if (ev.valor <= 0 || (alumneId && ev.alumneId !== alumneId)) continue;
    const k = clauDia(new Date(ev.data));
    perDia.set(k, (perDia.get(k) ?? 0) + ev.valor);
  }
  const resultat = [];
  for (let i = dies - 1; i >= 0; i -= 1) {
    const d = new Date(ara);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    resultat.push({ data: d, guanyats: perDia.get(clauDia(d)) ?? 0 });
  }
  return resultat;
}

/** Una fila per grup: membres, quinzes que sumen ara i quinzes guanyats pels seus membres en el període. */
export function resumGrups(estat, periode = 'tot', ara = new Date()) {
  const esdeveniments = delPeriode(estat.esdeveniments, periode, ara);
  return (estat.grups ?? []).map((g) => {
    const ids = new Set(g.alumneIds);
    const membres = estat.alumnes.filter((a) => ids.has(a.id));
    return {
      id: g.id,
      nom: g.nom,
      color: g.color,
      membres: membres.length,
      quinzes: membres.reduce((total, a) => total + a.quinzes, 0),
      guanyats: suma(esdeveniments.filter((ev) => ids.has(ev.alumneId))).guanyats,
    };
  });
}
