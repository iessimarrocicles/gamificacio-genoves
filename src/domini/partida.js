// La Partida de la classe: tots els quinzes positius sumen a un marcador comú.
// Com en la pilota, cada joc es canta 15 · 30 · Val · Joc.

export const PARTIDA_INICIAL = {
  quinzesPerJoc: 100,
  jocsObjectiu: 5,
  premi: '10 minuts més de pati',
  acumulat: 0,
  guanyades: 0,
};

export const LIMITS_PARTIDA = {
  quinzesPerJoc: { min: 4, max: 1000 },
  jocsObjectiu: { min: 1, max: 12 },
};

export const CANTS = ['A traure!', '15', '30', 'Val'];

export function objectiuPartida(partida) {
  return partida.quinzesPerJoc * partida.jocsObjectiu;
}

export function estatPartida(partida) {
  const objectiu = objectiuPartida(partida);
  const acumulat = Math.max(0, Math.min(partida.acumulat, objectiu));
  const guanyada = acumulat >= objectiu;
  const jocs = Math.floor(acumulat / partida.quinzesPerJoc);
  const quinzesEnJoc = guanyada ? 0 : acumulat - jocs * partida.quinzesPerJoc;
  const quart = Math.min(3, Math.floor((quinzesEnJoc / partida.quinzesPerJoc) * 4));
  return {
    objectiu,
    acumulat,
    jocs,
    jocsObjectiu: partida.jocsObjectiu,
    quinzesEnJoc,
    quinzesPerJoc: partida.quinzesPerJoc,
    quart,
    cant: guanyada ? 'Partida!' : CANTS[quart],
    percentatge: objectiu === 0 ? 0 : (acumulat / objectiu) * 100,
    percentatgeJoc: guanyada ? 100 : (quinzesEnJoc / partida.quinzesPerJoc) * 100,
    falten: objectiu - acumulat,
    guanyada,
    premi: partida.premi,
  };
}
