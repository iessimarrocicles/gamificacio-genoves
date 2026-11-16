import { describe, it, expect } from 'vitest';
import { reductor, estatInicial, crearAlumne, MAX_ESDEVENIMENTS } from './reductor.js';
import { efectesAtorgar } from './efectes.js';

function aulaDeProva() {
  let e = estatInicial();
  e = reductor(e, {
    type: 'ALUMNES_AFEGIR',
    alumnes: [crearAlumne('Aitana', 0, 'a1'), crearAlumne('Blai', 1, 'a2'), crearAlumne('Carme', 2, 'a3')],
  });
  return e;
}

let comptador = 0;
function atorgar(e, alumneIds, categoriaId, mode = 'quinze', lot = `lot-${++comptador}`) {
  return reductor(e, { type: 'ATORGAR', alumneIds, categoriaId, mode, lot, data: '2026-11-16T09:00:00.000Z' });
}
const alumne = (e, id) => e.alumnes.find((a) => a.id === id);

describe('estat inicial', () => {
  it('porta el barem de l’enunciat', () => {
    const e = estatInicial();
    const perId = Object.fromEntries(e.categories.map((c) => [c.id, c]));
    expect(perId['bon-traure'].valor).toBe(1);
    expect(perId['joc-net'].valor).toBe(1);
    expect(perId['atencio-canxa'].valor).toBe(1);
    expect(perId['treball-equip'].valor).toBe(2);
    expect(perId['quinze-directe'].valor).toBe(2);
    expect(perId['falta-traure'].tipus).toBe('millora');
    expect(perId['pilota-galeria'].tipus).toBe('millora');
    expect(e.alumnes).toEqual([]);
  });
});

describe('atorgar quinzes', () => {
  it('suma el valor de la categoria a l’alumne/a, al rècord i a la partida', () => {
    const e = atorgar(aulaDeProva(), ['a1'], 'treball-equip');
    expect(alumne(e, 'a1').quinzes).toBe(2);
    expect(alumne(e, 'a1').record).toBe(2);
    expect(alumne(e, 'a2').quinzes).toBe(0);
    expect(e.partida.acumulat).toBe(2);
    expect(e.esdeveniments).toHaveLength(1);
    expect(e.esdeveniments[0]).toMatchObject({ alumneId: 'a1', categoriaId: 'treball-equip', valor: 2, tipus: 'quinze' });
  });

  it('pot premiar tota la classe d’un colp, sense comptar els absents', () => {
    let e = reductor(aulaDeProva(), { type: 'ALUMNE_ABSENT', id: 'a3', absent: true });
    const presents = e.alumnes.filter((a) => !a.absent).map((a) => a.id);
    e = atorgar(e, presents, 'bon-traure');
    expect(alumne(e, 'a1').quinzes).toBe(1);
    expect(alumne(e, 'a2').quinzes).toBe(1);
    expect(alumne(e, 'a3').quinzes).toBe(0);
    expect(e.partida.acumulat).toBe(2);
  });

  it('ignora alumnes o categories que no existeixen', () => {
    const e0 = aulaDeProva();
    expect(atorgar(e0, ['no-existeix'], 'bon-traure')).toBe(e0);
    expect(atorgar(e0, ['a1'], 'no-existeix')).toBe(e0);
  });
});

describe('barem de millora', () => {
  it('l’avís queda anotat però no resta res', () => {
    let e = atorgar(aulaDeProva(), ['a1'], 'quinze-directe');
    e = atorgar(e, ['a1'], 'falta-traure', 'avis');
    expect(alumne(e, 'a1').quinzes).toBe(2);
    expect(e.partida.acumulat).toBe(2);
    expect(e.esdeveniments.at(-1)).toMatchObject({ tipus: 'avis', valor: 0 });
  });

  it('el −1 resta un quinze però no toca el rècord ni la partida', () => {
    let e = atorgar(aulaDeProva(), ['a1'], 'quinze-directe');
    e = atorgar(e, ['a1'], 'pilota-galeria', 'resta');
    expect(alumne(e, 'a1').quinzes).toBe(1);
    expect(alumne(e, 'a1').record).toBe(2);
    expect(e.partida.acumulat).toBe(2);
    expect(e.esdeveniments.at(-1)).toMatchObject({ tipus: 'millora', valor: -1 });
  });

  it('els quinzes mai baixen de zero', () => {
    const e = atorgar(aulaDeProva(), ['a1'], 'falta-traure', 'resta');
    expect(alumne(e, 'a1').quinzes).toBe(0);
    expect(e.esdeveniments.at(-1).valor).toBe(0);
  });

  it('una categoria positiva sempre suma, encara que arribe el mode «avis»', () => {
    const e = atorgar(aulaDeProva(), ['a1'], 'bon-traure', 'avis');
    expect(alumne(e, 'a1').quinzes).toBe(1);
  });
});

describe('desfer', () => {
  it('desfà tot un lot (tota la classe) i deixa l’estat com estava', () => {
    const e0 = aulaDeProva();
    const e1 = atorgar(e0, ['a1', 'a2', 'a3'], 'treball-equip', 'quinze', 'lot-x');
    const e2 = reductor(e1, { type: 'DESFER', lot: 'lot-x' });
    expect(e2.alumnes).toEqual(e0.alumnes);
    expect(e2.partida.acumulat).toBe(0);
    expect(e2.esdeveniments).toEqual([]);
  });

  it('desfer un −1 torna el quinze', () => {
    let e = atorgar(aulaDeProva(), ['a1'], 'quinze-directe', 'quinze', 'l1');
    e = atorgar(e, ['a1'], 'falta-traure', 'resta', 'l2');
    e = reductor(e, { type: 'DESFER', lot: 'l2' });
    expect(alumne(e, 'a1').quinzes).toBe(2);
    expect(alumne(e, 'a1').record).toBe(2);
  });

  it('desfer torna el rècord al valor anterior', () => {
    let e = atorgar(aulaDeProva(), ['a1'], 'quinze-directe', 'quinze', 'l1');
    e = atorgar(e, ['a1'], 'falta-traure', 'resta', 'l2');
    e = atorgar(e, ['a1'], 'treball-equip', 'quinze', 'l3');
    expect(alumne(e, 'a1').record).toBe(3);
    e = reductor(e, { type: 'DESFER', lot: 'l3' });
    expect(alumne(e, 'a1').record).toBe(2);
    expect(alumne(e, 'a1').quinzes).toBe(1);
  });
});

describe('partida', () => {
  it('no acumula més enllà de l’objectiu', () => {
    let e = reductor(aulaDeProva(), { type: 'PARTIDA_CONFIG', canvis: { quinzesPerJoc: 4, jocsObjectiu: 1 } });
    e = atorgar(e, ['a1', 'a2', 'a3'], 'treball-equip');
    expect(e.partida.acumulat).toBe(4);
    expect(alumne(e, 'a3').quinzes).toBe(2);
  });

  it('una partida nova torna el marcador a zero i compta la guanyada', () => {
    let e = reductor(aulaDeProva(), { type: 'PARTIDA_CONFIG', canvis: { quinzesPerJoc: 4, jocsObjectiu: 1 } });
    e = atorgar(e, ['a1', 'a2'], 'treball-equip');
    e = reductor(e, { type: 'PARTIDA_NOVA' });
    expect(e.partida.acumulat).toBe(0);
    expect(e.partida.guanyades).toBe(1);
    expect(alumne(e, 'a1').quinzes).toBe(2);
  });

  it('una partida nova sense haver guanyat no compta com a guanyada', () => {
    let e = atorgar(aulaDeProva(), ['a1'], 'treball-equip');
    e = reductor(e, { type: 'PARTIDA_NOVA' });
    expect(e.partida.guanyades).toBe(0);
  });

  it('la configuració no accepta valors absurds', () => {
    const e = reductor(aulaDeProva(), { type: 'PARTIDA_CONFIG', canvis: { quinzesPerJoc: 0, jocsObjectiu: -3 } });
    expect(e.partida.quinzesPerJoc).toBeGreaterThanOrEqual(4);
    expect(e.partida.jocsObjectiu).toBeGreaterThanOrEqual(1);
  });
});

describe('gestió d’alumnes', () => {
  it('crea alumnes amb avatar de pilotari i didals posats', () => {
    const a = crearAlumne('  Neus ', 0, 'n1');
    expect(a.nom).toBe('Neus');
    expect(['blava', 'roja']).toContain(a.avatar.samarreta);
    expect(a.avatar.complements).toEqual(['didals']);
    expect(a).toMatchObject({ quinzes: 0, record: 0, absent: false });
  });

  it('edita el nom i l’avatar', () => {
    let e = reductor(aulaDeProva(), { type: 'ALUMNE_EDITAR', id: 'a1', canvis: { nom: 'Aitana M.' } });
    e = reductor(e, { type: 'ALUMNE_EDITAR', id: 'a1', canvis: { avatar: { ...alumne(e, 'a1').avatar, samarreta: 'roja' } } });
    expect(alumne(e, 'a1').nom).toBe('Aitana M.');
    expect(alumne(e, 'a1').avatar.samarreta).toBe('roja');
  });

  it('esborrar un/a alumne/a esborra també el seu registre', () => {
    let e = atorgar(aulaDeProva(), ['a1', 'a2'], 'bon-traure');
    e = reductor(e, { type: 'ALUMNE_ELIMINAR', id: 'a1' });
    expect(e.alumnes.map((a) => a.id)).toEqual(['a2', 'a3']);
    expect(e.esdeveniments.every((ev) => ev.alumneId !== 'a1')).toBe(true);
  });

  it('neteja totes les absències', () => {
    let e = reductor(aulaDeProva(), { type: 'ALUMNE_ABSENT', id: 'a1', absent: true });
    e = reductor(e, { type: 'ABSENTS_NETEJAR' });
    expect(e.alumnes.some((a) => a.absent)).toBe(false);
  });
});

describe('categories', () => {
  it('afig, edita i esborra categories', () => {
    let e = reductor(aulaDeProva(), {
      type: 'CATEGORIA_AFEGIR',
      categoria: { id: 'lectura', nom: 'Bona lectura', icona: '📖', valor: 1, tipus: 'positiu', descripcio: '' },
    });
    expect(e.categories.at(-1).id).toBe('lectura');
    e = reductor(e, { type: 'CATEGORIA_EDITAR', id: 'lectura', canvis: { valor: 3 } });
    expect(e.categories.at(-1).valor).toBe(3);
    e = reductor(e, { type: 'CATEGORIA_ELIMINAR', id: 'lectura' });
    expect(e.categories.find((c) => c.id === 'lectura')).toBeUndefined();
  });

  it('una categoria amb registre s’arxiva en compte d’esborrar-se, per no trencar els informes', () => {
    let e = atorgar(aulaDeProva(), ['a1'], 'bon-traure');
    e = reductor(e, { type: 'CATEGORIA_ELIMINAR', id: 'bon-traure' });
    expect(e.categories.find((c) => c.id === 'bon-traure').arxivada).toBe(true);
  });

  it('el valor es limita entre 1 i 5', () => {
    const e = reductor(aulaDeProva(), { type: 'CATEGORIA_EDITAR', id: 'bon-traure', canvis: { valor: 99 } });
    expect(e.categories.find((c) => c.id === 'bon-traure').valor).toBe(5);
  });
});

describe('reinicis i càrrega', () => {
  it('reiniciar els quinzes conserva alumnes, avatars i categories', () => {
    let e = atorgar(aulaDeProva(), ['a1'], 'quinze-directe');
    e = reductor(e, { type: 'QUINZES_REINICIAR' });
    expect(e.alumnes).toHaveLength(3);
    expect(alumne(e, 'a1')).toMatchObject({ quinzes: 0, record: 0 });
    expect(e.esdeveniments).toEqual([]);
    expect(e.partida.acumulat).toBe(0);
  });

  it('reiniciar-ho tot torna a l’estat inicial', () => {
    const e = reductor(atorgar(aulaDeProva(), ['a1'], 'bon-traure'), { type: 'TOT_REINICIAR' });
    expect(e).toEqual(estatInicial());
  });

  it('carregar completa els camps que falten amb els valors per defecte', () => {
    const e = reductor(estatInicial(), { type: 'CARREGAR', estat: { alumnes: [crearAlumne('Pau', 0, 'p1')] } });
    expect(e.alumnes).toHaveLength(1);
    expect(e.categories.length).toBeGreaterThan(0);
    expect(e.partida.quinzesPerJoc).toBeGreaterThan(0);
    expect(e.config.so).toBe(true);
  });

  it('el registre té un límit perquè no òmpliga l’emmagatzematge', () => {
    let e = aulaDeProva();
    e = { ...e, esdeveniments: Array.from({ length: MAX_ESDEVENIMENTS }, (_, i) => ({ id: `v${i}`, alumneId: 'a2', categoriaId: 'bon-traure', valor: 1, tipus: 'quinze', lot: 'vell', data: '2026-01-01T00:00:00.000Z' })) };
    e = atorgar(e, ['a1'], 'bon-traure');
    expect(e.esdeveniments).toHaveLength(MAX_ESDEVENIMENTS);
    expect(e.esdeveniments.at(-1).alumneId).toBe('a1');
  });
});

describe('efectes d’atorgar (per a les celebracions)', () => {
  it('detecta pujades de nivell i complements nous', () => {
    let e0 = aulaDeProva();
    e0 = { ...e0, alumnes: e0.alumnes.map((a) => (a.id === 'a1' ? { ...a, quinzes: 9, record: 9 } : a)) };
    const e1 = atorgar(e0, ['a1', 'a2'], 'bon-traure');
    const ef = efectesAtorgar(e0, e1);
    expect(ef.pujades).toEqual([{ alumneId: 'a1', nom: 'Aitana', nivell: expect.objectContaining({ nom: 'Marxador/a' }) }]);
    expect(ef.complements).toEqual([]);
  });

  it('detecta un complement nou', () => {
    let e0 = aulaDeProva();
    e0 = { ...e0, alumnes: e0.alumnes.map((a) => (a.id === 'a2' ? { ...a, quinzes: 4, record: 4 } : a)) };
    const ef = efectesAtorgar(e0, atorgar(e0, ['a2'], 'bon-traure'));
    expect(ef.complements).toEqual([{ alumneId: 'a2', nom: 'Blai', complement: expect.objectContaining({ id: 'faixa' }) }]);
  });

  it('detecta joc guanyat i partida guanyada', () => {
    let e0 = reductor(aulaDeProva(), { type: 'PARTIDA_CONFIG', canvis: { quinzesPerJoc: 4, jocsObjectiu: 2 } });
    const e1 = atorgar(e0, ['a1', 'a2'], 'treball-equip');
    expect(efectesAtorgar(e0, e1)).toMatchObject({ jocGuanyat: true, partidaGuanyada: false });
    const e2 = atorgar(e1, ['a1', 'a2'], 'treball-equip');
    expect(efectesAtorgar(e1, e2)).toMatchObject({ partidaGuanyada: true });
  });

  it('un avís no produeix cap efecte', () => {
    const e0 = aulaDeProva();
    const ef = efectesAtorgar(e0, atorgar(e0, ['a1'], 'falta-traure', 'avis'));
    expect(ef).toEqual({ pujades: [], complements: [], jocGuanyat: false, partidaGuanyada: false });
  });
});
