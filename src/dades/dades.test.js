import { describe, it, expect, beforeEach } from 'vitest';
import { crearRepositoriLocal, CLAU } from './repositori.js';
import { aCopia, deCopia, aCsv } from './copia.js';
import { estatInicial, reductor, crearAlumne } from '../domini/reductor.js';

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
  it('exporta i torna a importar el mateix estat', () => {
    const estat = reductor(estatInicial(), { type: 'ALUMNE_AFEGIR', alumne: crearAlumne('Blai', 1, 'b1') });
    const text = aCopia(estat, new Date('2026-11-16T10:00:00Z'));
    const { estat: recuperat, error } = deCopia(text);
    expect(error).toBeNull();
    expect(recuperat.alumnes).toEqual(estat.alumnes);
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
