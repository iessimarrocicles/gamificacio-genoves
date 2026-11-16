import { describe, it, expect } from 'vitest';
import { escolaInicial, reductorEscola, normalitzaEscola, vistaActiva } from './escola.js';
import { estatInicial, reductor, crearAlumne } from './reductor.js';

const activa = (e) => e.aules.find((a) => a.id === e.activaId);

function ambAlumnes() {
  return reductorEscola(escolaInicial(), {
    type: 'ALUMNES_AFEGIR',
    alumnes: [crearAlumne('Aitana', 0, 'a1'), crearAlumne('Blai', 1, 'a2')],
  });
}

describe('escola amb diverses classes', () => {
  it('comença amb una sola classe buida, que és l’activa', () => {
    const e = escolaInicial();
    expect(e.aules).toHaveLength(1);
    expect(e.activaId).toBe(e.aules[0].id);
    expect(activa(e).alumnes).toEqual([]);
    expect(e.config).toEqual({ so: true, veu: false });
  });

  it('les accions normals s’apliquen només a la classe activa', () => {
    let e = ambAlumnes();
    e = reductorEscola(e, { type: 'AULA_CREAR', id: 'b', nom: '4t de Primària' });
    expect(e.activaId).toBe('b');
    e = reductorEscola(e, { type: 'ALUMNE_AFEGIR', alumne: crearAlumne('Carme', 0, 'c1') });
    expect(e.aules.find((a) => a.id === 'b').alumnes.map((a) => a.nom)).toEqual(['Carme']);
    expect(e.aules[0].alumnes.map((a) => a.nom)).toEqual(['Aitana', 'Blai']);
  });

  it('una classe nova copia les categories i la configuració de la partida, però no els quinzes', () => {
    let e = ambAlumnes();
    e = reductorEscola(e, { type: 'CATEGORIA_EDITAR', id: 'bon-traure', canvis: { valor: 3 } });
    e = reductorEscola(e, { type: 'PARTIDA_CONFIG', canvis: { quinzesPerJoc: 60, premi: 'Excursió' } });
    e = reductorEscola(e, { type: 'ATORGAR', alumneIds: ['a1'], categoriaId: 'bon-traure', lot: 'l1', data: '2026-11-16T09:00:00Z' });
    e = reductorEscola(e, { type: 'AULA_CREAR', id: 'b', nom: '  4t B ' });
    const nova = activa(e);
    expect(nova.aula.nom).toBe('4t B');
    expect(nova.alumnes).toEqual([]);
    expect(nova.esdeveniments).toEqual([]);
    expect(nova.categories.find((c) => c.id === 'bon-traure').valor).toBe(3);
    expect(nova.partida).toMatchObject({ quinzesPerJoc: 60, premi: 'Excursió', acumulat: 0, guanyades: 0 });
  });

  it('canvia de classe activa i ignora ids que no existeixen', () => {
    let e = reductorEscola(ambAlumnes(), { type: 'AULA_CREAR', id: 'b', nom: 'B' });
    const primera = e.aules[0].id;
    e = reductorEscola(e, { type: 'AULA_ACTIVAR', id: primera });
    expect(e.activaId).toBe(primera);
    expect(reductorEscola(e, { type: 'AULA_ACTIVAR', id: 'zzz' })).toBe(e);
  });

  it('esborra una classe, però mai l’última', () => {
    let e = reductorEscola(ambAlumnes(), { type: 'AULA_CREAR', id: 'b', nom: 'B' });
    e = reductorEscola(e, { type: 'AULA_ELIMINAR', id: 'b' });
    expect(e.aules).toHaveLength(1);
    expect(e.activaId).toBe(e.aules[0].id);
    expect(reductorEscola(e, { type: 'AULA_ELIMINAR', id: e.activaId })).toBe(e);
  });

  it('el so és comú a totes les classes', () => {
    let e = reductorEscola(escolaInicial(), { type: 'CONFIG', canvis: { so: false } });
    e = reductorEscola(e, { type: 'AULA_CREAR', id: 'b', nom: 'B' });
    expect(e.config.so).toBe(false);
    expect(vistaActiva(e).config.so).toBe(false);
  });

  it('la vista de la classe activa té la mateixa forma que usen les pantalles', () => {
    const v = vistaActiva(ambAlumnes());
    expect(v.alumnes).toHaveLength(2);
    expect(v.aula.nom).toBe('3r de Primària');
    expect(v.categories.length).toBeGreaterThan(0);
    expect(v.grups).toEqual([]);
    expect(v.config).toBeDefined();
  });

  it('esborrar-ho tot torna a l’escola inicial', () => {
    let e = reductorEscola(ambAlumnes(), { type: 'AULA_CREAR', id: 'b', nom: 'B' });
    expect(reductorEscola(e, { type: 'TOT_REINICIAR' })).toEqual(escolaInicial());
  });
});

describe('dades guardades', () => {
  it('unes dades antigues d’una sola classe passen a ser la primera classe, sense perdre res', () => {
    let vell = reductor(estatInicial(), { type: 'ALUMNE_AFEGIR', alumne: crearAlumne('Aitana', 0, 'a1') });
    vell = reductor(vell, { type: 'ATORGAR', alumneIds: ['a1'], categoriaId: 'quinze-directe', lot: 'l1', data: '2026-11-16T09:00:00Z' });
    vell = reductor(vell, { type: 'CONFIG', canvis: { so: false } });

    const e = normalitzaEscola(JSON.parse(JSON.stringify(vell)));
    expect(e.aules).toHaveLength(1);
    expect(activa(e).alumnes[0]).toMatchObject({ nom: 'Aitana', quinzes: 2 });
    expect(activa(e).esdeveniments).toHaveLength(1);
    expect(activa(e).partida.acumulat).toBe(2);
    expect(e.config.so).toBe(false);
  });

  it('recupera una escola guardada amb diverses classes', () => {
    let e = reductorEscola(ambAlumnes(), { type: 'AULA_CREAR', id: 'b', nom: 'B' });
    const recuperada = normalitzaEscola(JSON.parse(JSON.stringify(e)));
    expect(recuperada).toEqual(e);
  });

  it('si la classe activa guardada no existeix, activa la primera; i sense dades, comença de zero', () => {
    const e = normalitzaEscola({ aules: [{ id: 'x', aula: { nom: 'X' } }], activaId: 'no-hi-es' });
    expect(e.activaId).toBe('x');
    expect(normalitzaEscola(null)).toEqual(escolaInicial());
    expect(normalitzaEscola({ aules: [] })).toEqual(escolaInicial());
  });
});
