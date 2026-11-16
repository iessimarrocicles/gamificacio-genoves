import { describe, it, expect, beforeEach } from 'vitest';
import { crearRepositoriLocal, CLAU } from './repositori.js';
import { aCopia, deCopia, aCsv } from './copia.js';
import { estatInicial, reductor, crearAlumne } from '../domini/reductor.js';
import { escolaInicial, reductorEscola } from '../domini/escola.js';

function memoria() {
  const m = new Map();
  return {
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => m.set(k, String(v)),
    removeItem: (k) => m.delete(k),
  };
}

describe('repositori local', () => {
  let magatzem;
  beforeEach(() => {
    magatzem = memoria();
  });

  it('torna null si no hi ha res guardat', () => {
    expect(crearRepositoriLocal(magatzem).carregar()).toBeNull();
  });

  it('guarda i recupera l’estat', () => {
    const repo = crearRepositoriLocal(magatzem);
    const estat = reductor(estatInicial(), { type: 'ALUMNE_AFEGIR', alumne: crearAlumne('Aitana', 0, 'a1') });
    expect(repo.guardar(estat)).toBe(true);
    expect(repo.carregar().alumnes[0].nom).toBe('Aitana');
    expect(magatzem.getItem(CLAU)).toContain('Aitana');
  });

  it('si les dades estan corruptes torna null en compte de petar', () => {
    magatzem.setItem(CLAU, '{açò no és json');
    expect(crearRepositoriLocal(magatzem).carregar()).toBeNull();
  });

  it('si el navegador no deixa guardar, avisa tornant false', () => {
    const ple = { ...memoria(), setItem: () => { throw new Error('QuotaExceededError'); } };
    expect(crearRepositoriLocal(ple).guardar(estatInicial())).toBe(false);
  });

  it('esborrar lleva les dades', () => {
    const repo = crearRepositoriLocal(magatzem);
    repo.guardar(estatInicial());
    repo.esborrar();
    expect(repo.carregar()).toBeNull();
  });
});

describe('còpia de seguretat', () => {
  it('exporta i torna a importar totes les classes', () => {
    let escola = reductorEscola(escolaInicial(), { type: 'ALUMNE_AFEGIR', alumne: crearAlumne('Blai', 1, 'b1') });
    escola = reductorEscola(escola, { type: 'AULA_CREAR', id: 'b', nom: '4t' });
    const text = aCopia(escola, new Date('2026-11-16T10:00:00Z'));
    const { estat: recuperada, error } = deCopia(text);
    expect(error).toBeNull();
    expect(recuperada).toEqual(escola);
  });

  it('una còpia antiga, d’una sola classe, es recupera com a primera classe', () => {
    const vell = reductor(estatInicial(), { type: 'ALUMNE_AFEGIR', alumne: crearAlumne('Blai', 1, 'b1') });
    const { estat: recuperada, error } = deCopia(aCopia(vell));
    expect(error).toBeNull();
    expect(recuperada.aules).toHaveLength(1);
    expect(recuperada.aules[0].alumnes).toEqual(vell.alumnes);
  });

  it('rebutja fitxers que no són una còpia del Trinquet', () => {
    expect(deCopia('hola').error).toMatch(/no és vàlid/i);
    expect(deCopia('{"altra":"cosa"}').error).toMatch(/no és una còpia/i);
  });
});

describe('CSV', () => {
  it('genera un CSV amb punt i coma i cometes quan cal', () => {
    const csv = aCsv(['Nom', 'Quinzes'], [['Aitana', 12], ['Blai; "el Roig"', 3]]);
    expect(csv).toBe('﻿Nom;Quinzes\r\nAitana;12\r\n"Blai; ""el Roig""";3');
  });
});
