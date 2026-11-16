import { useEffect, useRef } from 'react';

/** Finestra emergent accessible: es tanca amb Esc o tocant fora. */
export default function Finestra({ titol, onTanca, children, ample = 'max-w-3xl', peu = null, capcalera = null }) {
  const ref = useRef(null);

  useEffect(() => {
    const anterior = document.activeElement;
    ref.current?.focus();
    const tecla = (e) => {
      if (e.key === 'Escape') onTanca();
    };
    document.addEventListener('keydown', tecla);
    return () => {
      document.removeEventListener('keydown', tecla);
      anterior?.focus?.();
    };
  }, [onTanca]);

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-llosa-900/60 p-3 sm:p-6"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onTanca();
      }}
    >
      <section
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={titol}
        tabIndex={-1}
        className={`flex max-h-full w-full ${ample} animate-apareix flex-col overflow-hidden rounded-3xl bg-calc shadow-2xl outline-none`}
      >
        <header className="flex items-center gap-4 bg-blau-700 px-5 py-3 text-white sm:px-7">
          <div className="min-w-0 flex-1">
            {capcalera ?? <h2 className="truncate font-display text-2xl sm:text-3xl">{titol}</h2>}
          </div>
          <button
            type="button"
            onClick={onTanca}
            className="grid size-12 shrink-0 place-items-center rounded-full bg-white/15 text-2xl font-semibold hover:bg-white/25"
            aria-label="Tanca"
          >
            ✕
          </button>
        </header>
        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-7">{children}</div>
        {peu && <footer className="border-t-2 border-llosa-200 bg-white px-5 py-3 sm:px-7">{peu}</footer>}
      </section>
    </div>
  );
}
