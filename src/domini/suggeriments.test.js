import { describe, it, expect } from 'vitest';
import { CATEGORIES_TRINQUET, CATEGORIES_INICIALS } from './barem.js';
import { suggerimentsDisponibles } from './suggeriments.js';
import { reductor, estatInicial, crearAlumne } from './reductor.js';

describe('propostes de categories del trinquet', () => {
  it('n’hi ha de les dues menes i inclouen les de l’enunciat', () => {
    const ids = CATEGORIES_TRINQUET.map((c) => c.id);
    for (const c of CATEGORIES_INICIALS) expect(ids).toContain(c.id);
    expect(CATEGORIES_TRINQUET.filter((c) => c.tipus === 'positiu').length).toBeGreaterThanOrEqual(10);
    expect(CATEGORIES_TRINQUET.filter((c) => c.tipus === 'millora').length).toBeGreaterThanOrEqual(6);
  });

  it('totes tenen nom, icona, descripció i un valor entre 1 i 5, i cap id repetit', () => {
    for (const c of CATEGORIES_TRINQUET) {
      expect(c.nom.length).toBeGreaterThan(0);
      expect(c.icona.length).toBeGreaterThan(0);
      expect(c.descripcio.length).toBeGreaterThan(0);
      expect(c.valor).toBeGreaterThanOrEqual(1);
      expect(c.valor).toBeLessThanOrEqual(5);
    }
    expect(new Set(CATEGORIES_TRINQUET.map((c) => c.id)).size).toBe(CATEGORIES_TRINQUET.length);
  });

  it('només proposa les del tipus demanat que encara no estan en ús', () => {
    const estat = estatInicial();
    const positives = suggerimentsDisponibles(estat.categories, 'positiu');
    expect(positives.every((c) => c.tipus === 'positiu')).toBe(true);
    expect(positives.map((c) => c.id)).not.toContain('bon-traure');
    const millora = suggerimentsDisponibles(estat.categories, 'millora');
    expect(millora.every((c) => c.tipus === 'millora')).toBe(true);
    expect(millora.map((c) => c.id)).not.toContain('falta-traure');
  });

  it('una categoria esborrada (o arxivada) torna a eixir com a proposta', () => {
    let estat = reductor(estatInicial(), { type: 'CATEGORIA_ELIMINAR', id: 'bon-traure' });
    expect(suggerimentsDisponibles(estat.categories, 'positiu').map((c) => c.id)).toContain('bon-traure');

    estat = reductor(estatInicial(), { type: 'ALUMNE_AFEGIR', alumne: crearAlumne('Aitana', 0, 'a1') });
    estat = reductor(estat, { type: 'ATORGAR', alumneIds: ['a1'], categoriaId: 'joc-net', lot: 'l1', data: '2026-11-16T09:00:00Z' });
    estat = reductor(estat, { type: 'CATEGORIA_ELIMINAR', id: 'joc-net' });
    expect(suggerimentsDisponibles(estat.categories, 'positiu').map((c) => c.id)).toContain('joc-net');
  });

  it('tornar a afegir una categoria arxivada la recupera, sense duplicar-la', () => {
    let estat = reductor(estatInicial(), { type: 'ALUMNE_AFEGIR', alumne: crearAlumne('Aitana', 0, 'a1') });
    estat = reductor(estat, { type: 'ATORGAR', alumneIds: ['a1'], categoriaId: 'joc-net', lot: 'l1', data: '2026-11-16T09:00:00Z' });
    estat = reductor(estat, { type: 'CATEGORIA_ELIMINAR', id: 'joc-net' });
    const proposta = CATEGORIES_TRINQUET.find((c) => c.id === 'joc-net');
    estat = reductor(estat, { type: 'CATEGORIA_AFEGIR', categoria: proposta });
    const iguals = estat.categories.filter((c) => c.id === 'joc-net');
    expect(iguals).toHaveLength(1);
    expect(iguals[0].arxivada).toBeFalsy();
  });
});

describe('categories de millora amb més d’un quinze', () => {
  function aula() {
    let e = reductor(estatInicial(), { type: 'ALUMNE_AFEGIR', alumne: crearAlumne('Aitana', 0, 'a1') });
    e = reductor(e, { type: 'CATEGORIA_EDITAR', id: 'pilota-galeria', canvis: { valor: 2 } });
    return reductor(e, { type: 'ATORGAR', alumneIds: ['a1'], categoriaId: 'quinze-directe', mode: 'quinze', lot: 'l0', data: '2026-11-16T09:00:00Z' });
  }

  it('es pot configurar a −2', () => {
    expect(aula().categories.find((c) => c.id === 'pilota-galeria').valor).toBe(2);
  });

  it('el −2 resta dos quinzes', () => {
    const e = reductor(aula(), { type: 'ATORGAR', alumneIds: ['a1'], categoriaId: 'pilota-galeria', mode: 'resta', lot: 'l1', data: '2026-11-16T10:00:00Z' });
    expect(e.alumnes[0].quinzes).toBe(0);
    expect(e.esdeveniments.at(-1).valor).toBe(-2);
  });

  it('l’avís continua sense restar res', () => {
    const e = reductor(aula(), { type: 'ATORGAR', alumneIds: ['a1'], categoriaId: 'pilota-galeria', mode: 'avis', lot: 'l1', data: '2026-11-16T10:00:00Z' });
    expect(e.alumnes[0].quinzes).toBe(2);
  });
});
