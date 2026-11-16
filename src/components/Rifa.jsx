import { useCallback, useEffect, useRef, useState } from 'react';
import Finestra from './Finestra.jsx';
import AvatarPilotari from './AvatarPilotari.jsx';
import Pilota from './Pilota.jsx';
import { useClasse } from '../estat/ClasseContext.jsx';

const senseMoviment = () => globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

/** La rifa de la pilota: la pilota bota de nom en nom fins que s'atura en un/a alumne/a present. */
export default function Rifa({ onTanca, onDona }) {
  const { estat, so, digues } = useClasse();
  const presents = estat.alumnes.filter((a) => !a.absent);
  const [actual, setActual] = useState(null);
  const [triat, setTriat] = useState(null);
  const temporitzador = useRef(null);
  const actualRef = useRef(null);

  const tira = useCallback(() => {
    clearTimeout(temporitzador.current);
    if (presents.length === 0) return;
    const guanyador = presents[Math.floor(Math.random() * presents.length)];
    setTriat(null);

    const acaba = () => {
      setActual(guanyador);
      setTriat(guanyador);
      so('rifa');
      digues(`La pilota ha triat ${guanyador.nom}!`);
    };

    if (senseMoviment() || presents.length === 1) {
      acaba();
      return;
    }

    const salts = 16;
    let i = 0;
    const salta = () => {
      i += 1;
      if (i >= salts) {
        acaba();
        return;
      }
      let seguent;
      do {
        seguent = presents[Math.floor(Math.random() * presents.length)];
      } while (seguent.id === actualRef.current?.id);
      actualRef.current = seguent;
      setActual(seguent);
      so('tic');
      temporitzador.current = setTimeout(salta, 70 + i * i * 2.2);
    };
    salta();
    // presents canvia en cada render, però la tirada usa la llista del moment de tocar el botó.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estat.alumnes, so, digues]);

  useEffect(() => {
    tira();
    return () => clearTimeout(temporitzador.current);
    // Només en obrir la finestra.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Finestra titol="La rifa de la pilota" onTanca={onTanca} ample="max-w-xl">
      {presents.length === 0 ? (
        <p className="py-8 text-center text-xl">No hi ha cap alumne/a present per a fer la rifa.</p>
      ) : (
        <div className="flex flex-col items-center text-center">
          <div className={`mb-2 ${triat ? '' : 'animate-bot'}`} key={actual?.id ?? 'res'}>
            <Pilota mida={44} />
          </div>
          <div
            className={`grid w-full place-items-center rounded-3xl border-[3px] py-5 ${
              triat ? 'border-groc-400 bg-groc-100' : 'border-llosa-200 bg-white'
            }`}
            aria-live="polite"
          >
            {actual && <AvatarPilotari avatar={actual.avatar} mida={triat ? 150 : 120} />}
            <p className="mt-2 font-display text-4xl">{actual?.nom ?? '…'}</p>
            <p className="mt-1 min-h-7 text-lg text-llosa-700">{triat ? 'La pilota t’ha triat!' : 'La pilota va botant…'}</p>
          </div>

          <div className="mt-5 flex w-full flex-wrap gap-3">
            <button
              type="button"
              disabled={!triat}
              onClick={() => onDona(triat.id)}
              className="min-h-14 flex-1 rounded-2xl bg-groc-400 px-4 text-xl font-semibold text-llosa-900 hover:bg-groc-200 disabled:opacity-40"
            >
              Dona-li quinzes
            </button>
            <button
              type="button"
              disabled={!triat}
              onClick={tira}
              className="min-h-14 flex-1 rounded-2xl border-[3px] border-blau-600 px-4 text-xl font-semibold text-blau-700 hover:bg-blau-50 disabled:opacity-40"
            >
              Torna a tirar
            </button>
          </div>
        </div>
      )}
    </Finestra>
  );
}
