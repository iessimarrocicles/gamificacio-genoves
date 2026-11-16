import { describe, it, expect } from 'vitest';
import { estatPartida, PARTIDA_INICIAL } from './partida.js';

const partida = (acumulat, extra = {}) => ({ ...PARTIDA_INICIAL, quinzesPerJoc: 40, jocsObjectiu: 5, acumulat, ...extra });

describe('partida de la classe', () => {
  it('comença a zero', () => {
    const e = estatPartida(partida(0));
    expect(e.jocs).toBe(0);
    expect(e.cant).toBe('A traure!');
    expect(e.percentatge).toBe(0);
    expect(e.guanyada).toBe(false);
  });

  it('canta 15, 30 i Val dins de cada joc', () => {
    expect(estatPartida(partida(9)).cant).toBe('A traure!');
    expect(estatPartida(partida(10)).cant).toBe('15');
    expect(estatPartida(partida(20)).cant).toBe('30');
    expect(estatPartida(partida(30)).cant).toBe('Val');
    expect(estatPartida(partida(39)).cant).toBe('Val');
  });

  it('en completar un joc suma un joc i torna a traure', () => {
    const e = estatPartida(partida(40));
    expect(e.jocs).toBe(1);
    expect(e.quinzesEnJoc).toBe(0);
    expect(e.cant).toBe('A traure!');
  });

  it('calcula el percentatge total i els quinzes que falten', () => {
    const e = estatPartida(partida(50));
    expect(e.percentatge).toBe(25);
    expect(e.falten).toBe(150);
    expect(e.objectiu).toBe(200);
  });

  it('es guanya en arribar als jocs objectiu i no passa del 100 %', () => {
    const e = estatPartida(partida(200));
    expect(e.guanyada).toBe(true);
    expect(e.jocs).toBe(5);
    expect(e.percentatge).toBe(100);
    expect(e.cant).toBe('Partida!');
    expect(estatPartida(partida(260)).jocs).toBe(5);
  });

  it('s’adapta a jocs de mida no múltiple de quatre', () => {
    const e = estatPartida(partida(5, { quinzesPerJoc: 10 }));
    expect(e.cant).toBe('30');
  });
});
