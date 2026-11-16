import { useState } from 'react';

// Estils que es repeteixen en formularis i botons.
export const camp =
  'min-h-12 w-full rounded-xl border-[3px] border-llosa-200 bg-white px-3 text-lg focus:border-blau-500 focus:outline-none';
export const campLliure = camp.replace('w-full ', '');
export const botoPrimari =
  'min-h-12 rounded-xl bg-blau-600 px-5 text-lg font-semibold text-white hover:bg-blau-700 disabled:opacity-40';
export const botoSecundari =
  'min-h-12 rounded-xl border-[3px] border-llosa-300 bg-white px-4 text-lg font-semibold text-llosa-700 hover:bg-llosa-100 disabled:opacity-40';

/** Botó que demana confirmació amb un segon toc (sense finestres del navegador). */
export function BotoConfirma({ children, pregunta, onConfirma, className = botoSecundari, disabled = false }) {
  const [segur, setSegur] = useState(false);
  if (!segur) {
    return (
      <button type="button" className={className} disabled={disabled} onClick={() => setSegur(true)}>
        {children}
      </button>
    );
  }
  return (
    <span className="inline-flex flex-wrap items-center gap-2 rounded-xl bg-ambre-100 px-3 py-1.5">
      <span className="text-base font-semibold text-ambre-700">{pregunta}</span>
      <button
        type="button"
        className="min-h-11 rounded-lg bg-llosa-900 px-4 text-base font-semibold text-white"
        onClick={() => {
          setSegur(false);
          onConfirma();
        }}
      >
        Sí
      </button>
      <button type="button" className="min-h-11 rounded-lg bg-white px-4 text-base font-semibold" onClick={() => setSegur(false)}>
        No
      </button>
    </span>
  );
}

/** Marc d'una pàgina: títol, text d'ajuda opcional i contingut. */
export function Pagina({ titol, ajuda, accions, children, ample = 'max-w-5xl' }) {
  return (
    <div className={`mx-auto w-full ${ample}`}>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0 flex-1 basis-80">
          <h1 className="font-display text-4xl leading-tight sm:text-5xl">{titol}</h1>
          {ajuda && <p className="mt-1 text-lg text-llosa-700">{ajuda}</p>}
        </div>
        {accions && <div className="no-imprimir flex flex-wrap gap-2">{accions}</div>}
      </div>
      {children}
    </div>
  );
}
