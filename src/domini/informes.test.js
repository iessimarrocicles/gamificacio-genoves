import { describe, it, expect } from 'vitest';
import { reductor, estatInicial, crearAlumne } from './reductor.js';
import { iniciPeriode, resumGrup, resumAlumne, evolucioDiaria } from './informes.js';

const ARA = new Date('2026-11-18T12:00:00'); // dimecres

function estatDeProva() {
  let e = reductor(estatInicial(), {
    type: 'ALUMNES_AFEGIR',
    alumnes: [crearAlumne('Aitana', 0, 'a1'), crearAlumne('Blai', 1, 'a2')],
  });
  const fets = [
    ['a1', 'treball-equip', 'quinze', '2026-10-01T10:00:00'], // fa més d’un mes
    ['a1', 'bon-traure', 'quinze', '2026-11-10T10:00:00'], // este mes, setmana passada
    ['a1', 'bon-traure', 'quinze', '2026-11-17T10:00:00'], // esta setmana
    ['a1', 'falta-traure', 'avis', '2026-11-17T11:00:00'],
    ['a2', 'quinze-directe', 'quinze', '2026-11-18T09:00:00'],
    ['a2', 'pilota-galeria', 'resta', '2026-11-18T09:30:00'],
  ];
  fets.forEach(([id, cat, mode, data], i) => {
    e = reductor(e, { type: 'ATORGAR', alumneIds: [id], categoriaId: cat, mode, lot: `l${i}`, data: new Date(data).toISOString() });
  });
  return e;
}

describe('períodes', () => {
  it('la setmana comença dilluns', () => {
    const d = iniciPeriode('setmana', ARA);
    expect(d.getDay()).toBe(1);
    expect(d.getDate()).toBe(16);
    expect(d.getHours()).toBe(0);
  });
  it('el mes comença el dia 1 i «tot» no té límit', () => {
    expect(iniciPeriode('mes', ARA).getDate()).toBe(1);
    expect(iniciPeriode('tot', ARA)).toBeNull();
  });
});

describe('informe de grup', () => {
  it('suma quinzes guanyats, restats i avisos del període', () => {
    const r = resumGrup(estatDeProva(), 'setmana', ARA);
    expect(r.guanyats).toBe(3);
    expect(r.restats).toBe(1);
    expect(r.avisos).toBe(1);
  });

  it('dona una fila per alumne/a ordenada per quinzes guanyats', () => {
    const r = resumGrup(estatDeProva(), 'tot', ARA);
    expect(r.files.map((f) => f.nom)).toEqual(['Aitana', 'Blai']);
    expect(r.files[0]).toMatchObject({ guanyats: 4, restats: 0, avisos: 1, quinzes: 4 });
    expect(r.files[1]).toMatchObject({ guanyats: 2, restats: 1, avisos: 0, quinzes: 1 });
  });

  it('desglossa per categoria', () => {
    const r = resumGrup(estatDeProva(), 'mes', ARA);
    const bon = r.categories.find((c) => c.id === 'bon-traure');
    expect(bon).toMatchObject({ vegades: 2, quinzes: 2 });
    expect(r.categories.find((c) => c.id === 'treball-equip')).toBeUndefined();
  });
});

describe('informe individual', () => {
  it('resumeix un/a alumne/a amb el seu nivell i les seues categories', () => {
    const r = resumAlumne(estatDeProva(), 'a1', 'tot', ARA);
    expect(r.alumne.nom).toBe('Aitana');
    expect(r.nivell.nom).toBe('Aficionat/da');
    expect(r.guanyats).toBe(4);
    expect(r.avisos).toBe(1);
    expect(r.categories.map((c) => c.id)).toEqual(['bon-traure', 'treball-equip', 'falta-traure']);
    expect(r.ultims[0].categoriaId).toBe('falta-traure');
  });

  it('retorna null si l’alumne/a no existeix', () => {
    expect(resumAlumne(estatDeProva(), 'zzz', 'tot', ARA)).toBeNull();
  });
});

describe('evolució diària', () => {
  it('dona els quinzes guanyats de cada un dels últims dies', () => {
    const dies = evolucioDiaria(estatDeProva(), 7, ARA);
    expect(dies).toHaveLength(7);
    expect(dies.at(-1)).toMatchObject({ guanyats: 2 }); // dimecres 18
    expect(dies.at(-2)).toMatchObject({ guanyats: 1 }); // dimarts 17
    expect(dies[0].guanyats).toBe(0);
  });

  it('es pot limitar a un/a alumne/a', () => {
    const dies = evolucioDiaria(estatDeProva(), 7, ARA, 'a1');
    expect(dies.at(-1).guanyats).toBe(0);
    expect(dies.at(-2).guanyats).toBe(1);
  });
});
