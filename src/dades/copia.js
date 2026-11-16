import { normalitzaEscola } from '../domini/escola.js';

const MARCA = 'trinquet-de-3r';

/** Text d'una còpia de seguretat (JSON) de totes les classes. */
export function aCopia(estat, ara = new Date()) {
  return JSON.stringify({ app: MARCA, creada: ara.toISOString(), estat }, null, 2);
}

/** Llig una còpia de seguretat. Torna { estat, error }. */
export function deCopia(text) {
  let dades;
  try {
    dades = JSON.parse(text);
  } catch {
    return { estat: null, error: 'El fitxer no és vàlid: no s’ha pogut llegir.' };
  }
  if (!dades || dades.app !== MARCA || typeof dades.estat !== 'object') {
    return { estat: null, error: 'Este fitxer no és una còpia d’El Trinquet de 3r.' };
  }
  return { estat: normalitzaEscola(dades.estat), error: null };
}

/** CSV amb punt i coma (el que obri bé el full de càlcul en valencià/castellà). */
export function aCsv(capcalera, files) {
  const cella = (v) => {
    const s = String(v ?? '');
    return /[;"\r\n]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s;
  };
  return '﻿' + [capcalera, ...files].map((fila) => fila.map(cella).join(';')).join('\r\n');
}

/** Fa que el navegador baixe un fitxer de text. */
export function baixaFitxer(nom, contingut, tipus = 'text/plain') {
  const url = URL.createObjectURL(new Blob([contingut], { type: `${tipus};charset=utf-8` }));
  const enllac = document.createElement('a');
  enllac.href = url;
  enllac.download = nom;
  document.body.appendChild(enllac);
  enllac.click();
  enllac.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function dataPerAFitxer(ara = new Date()) {
  const dos = (n) => String(n).padStart(2, '0');
  return `${ara.getFullYear()}-${dos(ara.getMonth() + 1)}-${dos(ara.getDate())}`;
}
