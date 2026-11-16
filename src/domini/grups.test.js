import { describe, it, expect } from 'vitest';
import { reductor, estatInicial, crearAlumne } from './reductor.js';
import { repartirEnEquips, quinzesGrup, membresGrup, COLORS_GRUP } from './grups.js';
import { resumGrups } from './informes.js';

function aula() {
  return reductor(estatInicial(), {
    type: 'ALUMNES_AFEGIR',
    alumnes: ['Aitana', 'Blai', 'Carme', 'Dídac', 'Empar'].map((n, i) => crearAlumne(n, i, `a${i + 1}`)),
  });
}
const grup = (e, id) => e.grups.find((g) => g.id === id);
const nouGrup = (id, nom, alumneIds = [], color = 'blau') => ({ type: 'GRUP_AFEGIR', grup: { id, nom, color, alumneIds } });

describe('grups dins d’una classe', () => {
  it('una classe comença sense grups', () => {
    expect(estatInicial().grups).toEqual([]);
  });

  it('crea un grup amb nom, color i membres que existeixen', () => {
    const e = reductor(aula(), nouGrup('g1', '  Els Blaus ', ['a1', 'a2', 'no-existeix']));
    expect(grup(e, 'g1')).toEqual({ id: 'g1', nom: 'Els Blaus', color: 'blau', alumneIds: ['a1', 'a2'] });
  });

  it('un color desconegut es canvia per un de vàlid', () => {
    const e = reductor(aula(), nouGrup('g1', 'X', [], 'fúcsia'));
    expect(Object.keys(COLORS_GRUP)).toContain(grup(e, 'g1').color);
  });

  it('canvia el nom i el color', () => {
    let e = reductor(aula(), nouGrup('g1', 'Taula 1'));
    e = reductor(e, { type: 'GRUP_EDITAR', id: 'g1', canvis: { nom: 'Colla del Dau', color: 'roig' } });
    expect(grup(e, 'g1')).toMatchObject({ nom: 'Colla del Dau', color: 'roig' });
  });

  it('afig i lleva membres, sense repetir-los', () => {
    let e = reductor(aula(), nouGrup('g1', 'Taula 1', ['a1']));
    e = reductor(e, { type: 'GRUP_MEMBRE', id: 'g1', alumneId: 'a2', dins: true });
    e = reductor(e, { type: 'GRUP_MEMBRE', id: 'g1', alumneId: 'a2', dins: true });
    expect(grup(e, 'g1').alumneIds).toEqual(['a1', 'a2']);
    e = reductor(e, { type: 'GRUP_MEMBRE', id: 'g1', alumneId: 'a1', dins: false });
    expect(grup(e, 'g1').alumneIds).toEqual(['a2']);
  });

  it('un/a alumne/a pot estar en més d’un grup alhora', () => {
    let e = reductor(aula(), nouGrup('g1', 'Taula 1', ['a1']));
    e = reductor(e, nouGrup('g2', 'Lectura', ['a1', 'a3']));
    expect(e.grups.filter((g) => g.alumneIds.includes('a1'))).toHaveLength(2);
  });

  it('esborrar un grup no toca els alumnes ni els seus quinzes', () => {
    let e = reductor(aula(), nouGrup('g1', 'Taula 1', ['a1']));
    e = reductor(e, { type: 'ATORGAR', alumneIds: ['a1'], categoriaId: 'quinze-directe', lot: 'l1', data: '2026-11-16T09:00:00Z', grupId: 'g1' });
    e = reductor(e, { type: 'GRUP_ELIMINAR', id: 'g1' });
    expect(e.grups).toEqual([]);
    expect(e.alumnes[0].quinzes).toBe(2);
  });

  it('esborrar un/a alumne/a el lleva també dels grups', () => {
    let e = reductor(aula(), nouGrup('g1', 'Taula 1', ['a1', 'a2']));
    e = reductor(e, { type: 'ALUMNE_ELIMINAR', id: 'a1' });
    expect(grup(e, 'g1').alumneIds).toEqual(['a2']);
  });

  it('els quinzes del grup són la suma dels que tenen ara els seus membres', () => {
    let e = reductor(aula(), nouGrup('g1', 'Taula 1', ['a1', 'a2']));
    e = reductor(e, { type: 'ATORGAR', alumneIds: ['a1', 'a2', 'a3'], categoriaId: 'quinze-directe', lot: 'l1', data: '2026-11-16T09:00:00Z' });
    expect(quinzesGrup(e, grup(e, 'g1'))).toBe(4);
    expect(membresGrup(e, grup(e, 'g1')).map((a) => a.nom)).toEqual(['Aitana', 'Blai']);
    e = reductor(e, { type: 'GRUP_MEMBRE', id: 'g1', alumneId: 'a3', dins: true });
    expect(quinzesGrup(e, grup(e, 'g1'))).toBe(6);
  });

  it('donar quinzes a un grup deixa anotat el grup en el registre', () => {
    let e = reductor(aula(), nouGrup('g1', 'Taula 1', ['a1', 'a2']));
    e = reductor(e, { type: 'ATORGAR', alumneIds: ['a1', 'a2'], categoriaId: 'treball-equip', lot: 'l1', data: '2026-11-16T09:00:00Z', grupId: 'g1' });
    expect(e.esdeveniments.every((ev) => ev.grupId === 'g1')).toBe(true);
  });

  it('posar els quinzes a zero conserva els grups; substituir-los els canvia tots', () => {
    let e = reductor(aula(), nouGrup('g1', 'Taula 1', ['a1']));
    e = reductor(e, { type: 'QUINZES_REINICIAR' });
    expect(e.grups).toHaveLength(1);
    e = reductor(e, { type: 'GRUPS_SUBSTITUIR', grups: [{ id: 'n1', nom: 'Nou', color: 'verd', alumneIds: ['a2'] }] });
    expect(e.grups.map((g) => g.id)).toEqual(['n1']);
  });
});

describe('equips a l’atzar', () => {
  it('reparteix tots els alumnes en equips equilibrats, cada un en un sol equip', () => {
    const e = aula();
    let n = 0;
    const equips = repartirEnEquips(e.alumnes, 2, () => ((n += 0.37) % 1));
    expect(equips).toHaveLength(2);
    const tots = equips.flatMap((g) => g.alumneIds);
    expect([...tots].sort()).toEqual(['a1', 'a2', 'a3', 'a4', 'a5']);
    expect(equips.map((g) => g.alumneIds.length).sort()).toEqual([2, 3]);
    expect(new Set(equips.map((g) => g.color)).size).toBe(2);
    expect(new Set(equips.map((g) => g.nom)).size).toBe(2);
    expect(new Set(equips.map((g) => g.id)).size).toBe(2);
  });

  it('no fa més equips que alumnes ni menys de dos', () => {
    const e = aula();
    expect(repartirEnEquips(e.alumnes, 99)).toHaveLength(5);
    expect(repartirEnEquips(e.alumnes, 0)).toHaveLength(2);
    expect(repartirEnEquips([], 3)).toEqual([]);
  });
});

describe('informe per grups', () => {
  it('dona per cada grup els membres, els quinzes d’ara i els guanyats en el període', () => {
    const ara = new Date('2026-11-18T12:00:00');
    let e = reductor(aula(), nouGrup('g1', 'Taula 1', ['a1', 'a2']));
    e = reductor(e, nouGrup('g2', 'Taula 2', ['a3']));
    e = reductor(e, { type: 'ATORGAR', alumneIds: ['a1'], categoriaId: 'quinze-directe', lot: 'l0', data: new Date('2026-10-01T10:00:00').toISOString() });
    e = reductor(e, { type: 'ATORGAR', alumneIds: ['a1', 'a2'], categoriaId: 'bon-traure', lot: 'l1', data: new Date('2026-11-17T10:00:00').toISOString() });
    const r = resumGrups(e, 'setmana', ara);
    expect(r).toEqual([
      { id: 'g1', nom: 'Taula 1', color: 'blau', membres: 2, quinzes: 4, guanyats: 2 },
      { id: 'g2', nom: 'Taula 2', color: 'blau', membres: 1, quinzes: 0, guanyats: 0 },
    ]);
  });
});
