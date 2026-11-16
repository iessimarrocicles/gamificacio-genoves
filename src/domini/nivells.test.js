import { describe, it, expect } from 'vitest';
import { NIVELLS, COMPLEMENTS } from './barem.js';
import { nivellDe, progresNivell, complementsDesbloquejats, complementsNous } from './nivells.js';

describe('nivells', () => {
  it('té els sis nivells de l’enunciat, en ordre', () => {
    expect(NIVELLS.map((n) => n.nom)).toEqual([
      'Aficionat/da',
      'Marxador/a',
      'Punter/a',
      'Mitger/a',
      'Rest',
      'Campió/ona del Genovés',
    ]);
  });

  it('comença en Aficionat/da amb 0 de rècord', () => {
    expect(nivellDe(0).nom).toBe('Aficionat/da');
    expect(nivellDe(0).numero).toBe(1);
  });

  it('puja de nivell just en arribar al mínim', () => {
    expect(nivellDe(9).nom).toBe('Aficionat/da');
    expect(nivellDe(10).nom).toBe('Marxador/a');
    expect(nivellDe(25).nom).toBe('Punter/a');
    expect(nivellDe(45).nom).toBe('Mitger/a');
    expect(nivellDe(70).nom).toBe('Rest');
    expect(nivellDe(100).nom).toBe('Campió/ona del Genovés');
    expect(nivellDe(999).numero).toBe(6);
  });

  it('calcula el progrés fins al nivell següent', () => {
    const p = progresNivell(15);
    expect(p.actual.nom).toBe('Marxador/a');
    expect(p.seguent.nom).toBe('Punter/a');
    expect(p.falten).toBe(10);
    expect(p.percentatge).toBeCloseTo(33.33, 1);
  });

  it('al nivell màxim no hi ha següent i el progrés és complet', () => {
    const p = progresNivell(120);
    expect(p.seguent).toBeNull();
    expect(p.falten).toBe(0);
    expect(p.percentatge).toBe(100);
  });
});

describe('complements', () => {
  it('els didals estan disponibles des del principi', () => {
    expect(complementsDesbloquejats(0).map((c) => c.id)).toEqual(['didals']);
  });

  it('es desbloquegen segons el rècord', () => {
    expect(complementsDesbloquejats(30).map((c) => c.id)).toEqual(['didals', 'faixa', 'mocador', 'guant']);
    expect(complementsDesbloquejats(100)).toHaveLength(COMPLEMENTS.length);
  });

  it('diu quins complements són nous entre dos rècords', () => {
    expect(complementsNous(4, 5).map((c) => c.id)).toEqual(['faixa']);
    expect(complementsNous(5, 6)).toEqual([]);
    expect(complementsNous(14, 31).map((c) => c.id)).toEqual(['mocador', 'guant']);
  });
});
