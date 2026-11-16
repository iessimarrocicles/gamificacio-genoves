import { CATEGORIES_INICIALS, OPCIONS_AVATAR } from './barem.js';
import { PARTIDA_INICIAL, LIMITS_PARTIDA, objectiuPartida } from './partida.js';
import { colorValid } from './grups.js';

export const VERSIO_DADES = 1;

// Límit del registre perquè mai òmpliga l'emmagatzematge del navegador
// (uns 150 bytes per esdeveniment → menys d'1 MB).
export const MAX_ESDEVENIMENTS = 5000;

export function estatInicial() {
  return {
    versio: VERSIO_DADES,
    aula: { nom: '3r de Primària', escola: 'El Genovés' },
    alumnes: [],
    categories: CATEGORIES_INICIALS.map((c) => ({ ...c })),
    esdeveniments: [],
    partida: { ...PARTIDA_INICIAL },
    grups: [],
    config: { so: true, veu: false },
  };
}

export function nouId(prefix = 'id') {
  const atzar = Math.random().toString(36).slice(2, 8);
  return `${prefix}-${Date.now().toString(36)}${atzar}`;
}

/** Crea un/a alumne/a amb un pilotari per defecte. `index` només varia l'aspecte inicial. */
export function crearAlumne(nom, index = 0, id = nouId('al')) {
  const { samarreta, pell, cabellColor, cabellEstil } = OPCIONS_AVATAR;
  return {
    id,
    nom: String(nom).trim(),
    avatar: {
      samarreta: samarreta[index % samarreta.length],
      pell: pell[(index * 2 + 1) % pell.length],
      cabellColor: cabellColor[(index * 3) % cabellColor.length],
      cabellEstil: cabellEstil[index % cabellEstil.length],
      complements: ['didals'],
    },
    quinzes: 0,
    record: 0,
    absent: false,
  };
}

const limita = (valor, min, max, perDefecte) => {
  const n = Math.round(Number(valor));
  if (!Number.isFinite(n)) return perDefecte;
  return Math.max(min, Math.min(max, n));
};

function netejaCategoria(c) {
  return {
    ...c,
    nom: String(c.nom ?? '').trim() || 'Sense nom',
    icona: c.icona || '⭐',
    valor: limita(c.valor, 1, 5, 1),
    tipus: c.tipus === 'millora' ? 'millora' : 'positiu',
    descripcio: c.descripcio ?? '',
  };
}

function netejaGrup(g, alumnes) {
  const existeixen = new Set(alumnes.map((a) => a.id));
  return {
    id: g.id,
    nom: String(g.nom ?? '').trim() || 'Grup',
    color: colorValid(g.color),
    alumneIds: [...new Set(Array.isArray(g.alumneIds) ? g.alumneIds : [])].filter((id) => existeixen.has(id)),
  };
}

export function netejaPartida(p) {
  const { quinzesPerJoc: lq, jocsObjectiu: lj } = LIMITS_PARTIDA;
  const partida = {
    ...PARTIDA_INICIAL,
    ...p,
    quinzesPerJoc: limita(p.quinzesPerJoc, lq.min, lq.max, PARTIDA_INICIAL.quinzesPerJoc),
    jocsObjectiu: limita(p.jocsObjectiu, lj.min, lj.max, PARTIDA_INICIAL.jocsObjectiu),
    premi: String(p.premi ?? PARTIDA_INICIAL.premi),
    guanyades: Math.max(0, Number(p.guanyades) || 0),
  };
  partida.acumulat = Math.max(0, Math.min(Number(p.acumulat) || 0, objectiuPartida(partida)));
  return partida;
}

/** Completa un estat guardat (potser antic o parcial) amb els valors per defecte. */
export function normalitzaEstat(guardat) {
  const base = estatInicial();
  if (!guardat || typeof guardat !== 'object') return base;
  const alumnes = Array.isArray(guardat.alumnes)
    ? guardat.alumnes
        .filter((a) => a && a.id && a.nom)
        .map((a, i) => {
          const model = crearAlumne(a.nom, i, a.id);
          const quinzes = Math.max(0, Number(a.quinzes) || 0);
          return {
            ...model,
            avatar: { ...model.avatar, ...(a.avatar ?? {}) },
            quinzes,
            record: Math.max(quinzes, Number(a.record) || 0),
            absent: Boolean(a.absent),
          };
        })
    : base.alumnes;
  return {
    versio: VERSIO_DADES,
    aula: { ...base.aula, ...(guardat.aula ?? {}) },
    alumnes,
    categories:
      Array.isArray(guardat.categories) && guardat.categories.length > 0
        ? guardat.categories.filter((c) => c && c.id).map(netejaCategoria)
        : base.categories,
    esdeveniments: Array.isArray(guardat.esdeveniments) ? guardat.esdeveniments.slice(-MAX_ESDEVENIMENTS) : [],
    partida: netejaPartida(guardat.partida ?? {}),
    grups: Array.isArray(guardat.grups) ? guardat.grups.filter((g) => g && g.id).map((g) => netejaGrup(g, alumnes)) : [],
    config: { ...base.config, ...(guardat.config ?? {}) },
  };
}

function atorgar(estat, { alumneIds, categoriaId, mode = 'quinze', lot, data, grupId }) {
  const categoria = estat.categories.find((c) => c.id === categoriaId);
  const ids = new Set(alumneIds);
  if (!categoria || !estat.alumnes.some((a) => ids.has(a.id))) return estat;

  const esPositiva = categoria.tipus === 'positiu';
  const objectiu = objectiuPartida(estat.partida);
  let acumulat = estat.partida.acumulat;
  const nous = [];

  const alumnes = estat.alumnes.map((a) => {
    if (!ids.has(a.id)) return a;

    let valor = 0;
    let tipus = 'avis';
    if (esPositiva) {
      valor = categoria.valor;
      tipus = 'quinze';
    } else if (mode === 'resta') {
      valor = 0 - Math.min(categoria.valor, a.quinzes); // mai per davall de zero
      tipus = 'millora';
    }

    const quinzes = a.quinzes + valor;
    const record = Math.max(a.record, quinzes);
    const aLaPartida = valor > 0 ? Math.min(valor, Math.max(0, objectiu - acumulat)) : 0;
    acumulat += aLaPartida;

    nous.push({
      id: `${lot}:${a.id}`,
      data,
      lot,
      alumneId: a.id,
      categoriaId,
      valor,
      tipus,
      partida: aLaPartida,
      recordAbans: a.record,
      ...(grupId ? { grupId } : {}),
    });
    return valor === 0 ? a : { ...a, quinzes, record };
  });

  return {
    ...estat,
    alumnes,
    partida: { ...estat.partida, acumulat },
    esdeveniments: [...estat.esdeveniments, ...nous].slice(-MAX_ESDEVENIMENTS),
  };
}

function desfer(estat, lot) {
  const delLot = estat.esdeveniments.filter((ev) => ev.lot === lot);
  if (delLot.length === 0) return estat;
  const perAlumne = new Map(delLot.map((ev) => [ev.alumneId, ev]));
  const tornatALaPartida = delLot.reduce((s, ev) => s + (ev.partida ?? 0), 0);
  return {
    ...estat,
    alumnes: estat.alumnes.map((a) => {
      const ev = perAlumne.get(a.id);
      if (!ev || ev.valor === 0) return a;
      return { ...a, quinzes: Math.max(0, a.quinzes - ev.valor), record: ev.recordAbans ?? a.record };
    }),
    partida: { ...estat.partida, acumulat: Math.max(0, estat.partida.acumulat - tornatALaPartida) },
    esdeveniments: estat.esdeveniments.filter((ev) => ev.lot !== lot),
  };
}

export function reductor(estat, accio) {
  switch (accio.type) {
    case 'CARREGAR':
      return normalitzaEstat(accio.estat);

    case 'ATORGAR':
      return atorgar(estat, accio);

    case 'DESFER':
      return desfer(estat, accio.lot);

    case 'ALUMNE_AFEGIR':
      return { ...estat, alumnes: [...estat.alumnes, accio.alumne] };

    case 'ALUMNES_AFEGIR':
      return { ...estat, alumnes: [...estat.alumnes, ...accio.alumnes] };

    case 'ALUMNE_EDITAR':
      return {
        ...estat,
        alumnes: estat.alumnes.map((a) => {
          if (a.id !== accio.id) return a;
          const canvis = { ...accio.canvis };
          if ('nom' in canvis) canvis.nom = String(canvis.nom).trim() || a.nom;
          return { ...a, ...canvis, id: a.id };
        }),
      };

    case 'ALUMNE_ELIMINAR':
      return {
        ...estat,
        alumnes: estat.alumnes.filter((a) => a.id !== accio.id),
        esdeveniments: estat.esdeveniments.filter((ev) => ev.alumneId !== accio.id),
        grups: estat.grups.map((g) =>
          g.alumneIds.includes(accio.id) ? { ...g, alumneIds: g.alumneIds.filter((id) => id !== accio.id) } : g,
        ),
      };

    case 'ALUMNE_ABSENT':
      return {
        ...estat,
        alumnes: estat.alumnes.map((a) => (a.id === accio.id ? { ...a, absent: Boolean(accio.absent) } : a)),
      };

    case 'ABSENTS_NETEJAR':
      return { ...estat, alumnes: estat.alumnes.map((a) => (a.absent ? { ...a, absent: false } : a)) };

    case 'CATEGORIA_AFEGIR': {
      const nova = netejaCategoria(accio.categoria);
      // Si ja existeix (arxivada o no), es recupera en compte de duplicar l'id.
      if (estat.categories.some((c) => c.id === nova.id)) {
        return {
          ...estat,
          categories: estat.categories.map((c) => (c.id === nova.id ? { ...nova, arxivada: false } : c)),
        };
      }
      return { ...estat, categories: [...estat.categories, nova] };
    }

    case 'CATEGORIA_EDITAR':
      return {
        ...estat,
        categories: estat.categories.map((c) =>
          c.id === accio.id ? netejaCategoria({ ...c, ...accio.canvis, id: c.id }) : c,
        ),
      };

    case 'CATEGORIA_ELIMINAR': {
      const teRegistre = estat.esdeveniments.some((ev) => ev.categoriaId === accio.id);
      return {
        ...estat,
        categories: teRegistre
          ? estat.categories.map((c) => (c.id === accio.id ? { ...c, arxivada: true } : c))
          : estat.categories.filter((c) => c.id !== accio.id),
      };
    }

    case 'GRUP_AFEGIR':
      return { ...estat, grups: [...estat.grups, netejaGrup(accio.grup, estat.alumnes)] };

    case 'GRUP_EDITAR':
      return {
        ...estat,
        grups: estat.grups.map((g) =>
          g.id === accio.id ? netejaGrup({ ...g, ...accio.canvis, id: g.id }, estat.alumnes) : g,
        ),
      };

    case 'GRUP_ELIMINAR':
      return { ...estat, grups: estat.grups.filter((g) => g.id !== accio.id) };

    case 'GRUP_MEMBRE':
      return {
        ...estat,
        grups: estat.grups.map((g) => {
          if (g.id !== accio.id) return g;
          const sense = g.alumneIds.filter((id) => id !== accio.alumneId);
          return netejaGrup({ ...g, alumneIds: accio.dins ? [...sense, accio.alumneId] : sense }, estat.alumnes);
        }),
      };

    case 'GRUPS_SUBSTITUIR':
      return { ...estat, grups: accio.grups.map((g) => netejaGrup(g, estat.alumnes)) };

    case 'PARTIDA_CONFIG':
      return { ...estat, partida: netejaPartida({ ...estat.partida, ...accio.canvis }) };

    case 'PARTIDA_NOVA': {
      const guanyada = estat.partida.acumulat >= objectiuPartida(estat.partida);
      return {
        ...estat,
        partida: { ...estat.partida, acumulat: 0, guanyades: estat.partida.guanyades + (guanyada ? 1 : 0) },
      };
    }

    case 'AULA_EDITAR':
      return { ...estat, aula: { ...estat.aula, ...accio.canvis } };

    case 'CONFIG':
      return { ...estat, config: { ...estat.config, ...accio.canvis } };

    case 'QUINZES_REINICIAR':
      return {
        ...estat,
        alumnes: estat.alumnes.map((a) => ({
          ...a,
          quinzes: 0,
          record: 0,
          avatar: { ...a.avatar, complements: a.avatar.complements.filter((c) => c === 'didals') },
        })),
        esdeveniments: [],
        partida: { ...estat.partida, acumulat: 0, guanyades: 0 },
        categories: estat.categories.filter((c) => !c.arxivada),
      };

    case 'TOT_REINICIAR':
      return estatInicial();

    default:
      return estat;
  }
}
