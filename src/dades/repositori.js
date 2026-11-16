// Únic lloc de l'app que sap ON es guarden les dades.
// Hui: localStorage del navegador. Per a passar al núvol més avant n'hi ha prou
// amb escriure un altre repositori amb les mateixes funcions (carregar, guardar, esborrar).

export const CLAU = 'trinquet-de-3r:v1';

export function crearRepositoriLocal(magatzem = globalThis.localStorage) {
  return {
    mode: 'local',

    carregar() {
      try {
        const text = magatzem.getItem(CLAU);
        return text ? JSON.parse(text) : null;
      } catch (error) {
        console.error('[dades] No s’han pogut llegir les dades guardades.', error);
        return null;
      }
    },

    /** Torna true si s'ha guardat bé; false si el navegador no ho ha permés. */
    guardar(estat) {
      try {
        magatzem.setItem(CLAU, JSON.stringify(estat));
        return true;
      } catch (error) {
        console.error('[dades] No s’han pogut guardar les dades.', error);
        return false;
      }
    },

    esborrar() {
      try {
        magatzem.removeItem(CLAU);
      } catch (error) {
        console.error('[dades] No s’han pogut esborrar les dades.', error);
      }
    },
  };
}
