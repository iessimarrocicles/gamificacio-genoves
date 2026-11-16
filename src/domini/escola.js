// L'escola: diverses classes (aules), cada una amb els seus alumnes, categories,
// partida, grups i registre. Les accions normals s'apliquen a la classe activa.

import { reductor, estatInicial, normalitzaEstat, netejaPartida } from './reductor.js';

export const VERSIO_ESCOLA = 2;
const ID_INICIAL = 'aula-inicial';

/** Separa el que és de la classe del que és comú (so i veu). */
function aAula(estat, id) {
  const { config: _config, versio: _versio, ...aula } = estat;
  return { id, ...aula };
}

export function escolaInicial() {
  const base = estatInicial();
  return {
    versio: VERSIO_ESCOLA,
    activaId: ID_INICIAL,
    aules: [aAula(base, ID_INICIAL)],
    config: base.config,
  };
}

/** L'estat de la classe activa, amb la forma que usen les pantalles i el reductor de classe. */
export function vistaActiva(escola) {
  const aula = escola.aules.find((a) => a.id === escola.activaId) ?? escola.aules[0];
  return { ...aula, config: escola.config };
}

/** Llista curta de classes per al menú. */
export function llistaAules(escola) {
  return escola.aules.map((a) => ({ id: a.id, nom: a.aula.nom, alumnes: a.alumnes.length, activa: a.id === escola.activaId }));
}

/** Accepta dades guardades noves (diverses classes) o antigues (una sola classe). */
export function normalitzaEscola(guardat) {
  if (!guardat || typeof guardat !== 'object') return escolaInicial();
  const configBase = estatInicial().config;

  if (!Array.isArray(guardat.aules)) {
    const unica = normalitzaEstat(guardat);
    return { versio: VERSIO_ESCOLA, activaId: ID_INICIAL, aules: [aAula(unica, ID_INICIAL)], config: unica.config };
  }

  const aules = guardat.aules.filter((a) => a && a.id).map((a) => aAula(normalitzaEstat(a), a.id));
  if (aules.length === 0) return escolaInicial();
  return {
    versio: VERSIO_ESCOLA,
    activaId: aules.some((a) => a.id === guardat.activaId) ? guardat.activaId : aules[0].id,
    aules,
    config: { ...configBase, ...(guardat.config ?? {}) },
  };
}

function crearAula(escola, id, nom) {
  const model = vistaActiva(escola);
  const base = estatInicial();
  return aAula(
    {
      ...base,
      aula: { ...model.aula, nom: String(nom ?? '').trim() || 'Classe nova' },
      categories: model.categories.filter((c) => !c.arxivada).map((c) => ({ ...c })),
      partida: netejaPartida({ ...model.partida, acumulat: 0, guanyades: 0 }),
    },
    id,
  );
}

export function reductorEscola(escola, accio) {
  switch (accio.type) {
    case 'CARREGAR':
      return normalitzaEscola(accio.estat);

    case 'TOT_REINICIAR':
      return escolaInicial();

    case 'AULA_CREAR': {
      if (!accio.id || escola.aules.some((a) => a.id === accio.id)) return escola;
      return { ...escola, activaId: accio.id, aules: [...escola.aules, crearAula(escola, accio.id, accio.nom)] };
    }

    case 'AULA_ACTIVAR':
      return escola.aules.some((a) => a.id === accio.id) && accio.id !== escola.activaId
        ? { ...escola, activaId: accio.id }
        : escola;

    case 'AULA_ELIMINAR': {
      if (escola.aules.length <= 1 || !escola.aules.some((a) => a.id === accio.id)) return escola;
      const aules = escola.aules.filter((a) => a.id !== accio.id);
      return { ...escola, aules, activaId: escola.activaId === accio.id ? aules[0].id : escola.activaId };
    }

    default: {
      const abans = vistaActiva(escola);
      const despres = reductor(abans, accio);
      if (despres === abans) return escola;
      return {
        ...escola,
        config: despres.config,
        aules: escola.aules.map((a) => (a.id === abans.id ? aAula(despres, a.id) : a)),
      };
    }
  }
}
