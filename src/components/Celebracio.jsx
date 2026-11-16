import { useEffect, useMemo } from 'react';
import AvatarPilotari from './AvatarPilotari.jsx';
import Pilota from './Pilota.jsx';
import { useClasse } from '../estat/ClasseContext.jsx';

function PlujaDePilotes() {
  const pilotes = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => ({
        id: i,
        esquerra: (i * 53) % 100,
        durada: 2.6 + ((i * 7) % 10) / 4,
        retard: ((i * 3) % 10) / 6,
        mida: 20 + ((i * 5) % 4) * 6,
      })),
    [],
  );
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {pilotes.map((p) => (
        <span
          key={p.id}
          className="absolute -top-10 animate-cau"
          style={{ left: `${p.esquerra}%`, animationDuration: `${p.durada}s`, animationDelay: `${p.retard}s` }}
        >
          <Pilota mida={p.mida} />
        </span>
      ))}
    </div>
  );
}

/** Celebració a pantalla completa: pujada de nivell, complement nou, joc o partida guanyada. */
export default function Celebracio() {
  const { estat, celebracio, tancaCelebracio } = useClasse();

  useEffect(() => {
    if (!celebracio || celebracio.partidaGuanyada) return undefined;
    const t = setTimeout(tancaCelebracio, 7000);
    return () => clearTimeout(t);
  }, [celebracio, tancaCelebracio]);

  if (!celebracio) return null;
  const { pujades, complements, jocGuanyat, partidaGuanyada, premi } = celebracio;
  const alumne = (id) => estat.alumnes.find((a) => a.id === id);

  const titol = partidaGuanyada
    ? 'Partida guanyada!'
    : jocGuanyat
      ? 'Joc per a la classe!'
      : pujades.length > 0
        ? 'Puja de nivell!'
        : 'Complement nou!';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-blau-800/90 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={titol}
      onClick={tancaCelebracio}
    >
      <PlujaDePilotes />
      <div className="relative max-h-full w-full max-w-2xl animate-apareix overflow-y-auto rounded-[2rem] bg-calc p-6 text-center shadow-2xl sm:p-8">
        <p className="font-display text-5xl text-blau-700 sm:text-6xl">{titol}</p>

        {partidaGuanyada && (
          <p className="mt-4 text-2xl">
            Tota la classe ha guanyat el premi:
            <strong className="mt-2 block rounded-2xl bg-groc-400 px-4 py-3 font-display text-3xl">{premi}</strong>
          </p>
        )}
        {!partidaGuanyada && jocGuanyat && (
          <p className="mt-3 text-2xl">Entre tots i totes heu fet un joc més. Va de bo!</p>
        )}

        {pujades.length > 4 && (
          <div className="mt-5 rounded-2xl border-[3px] border-groc-400 bg-white px-4 py-3">
            <p className="text-xl font-semibold">{pujades.length} pilotaris pugen de nivell</p>
            <p className="mt-1 text-lg leading-snug text-llosa-700">{pujades.map((p) => p.nom).join(', ')}</p>
          </div>
        )}
        {pujades.length > 0 && pujades.length <= 4 && (
          <ul className="mt-5 flex flex-wrap justify-center gap-4">
            {pujades.map((p) => (
              <li key={p.alumneId} className="w-36 rounded-2xl border-[3px] border-groc-400 bg-white px-2 py-3">
                {alumne(p.alumneId) && <AvatarPilotari avatar={alumne(p.alumneId).avatar} mida={76} className="mx-auto" />}
                <p className="mt-1 truncate text-lg font-semibold">{p.nom}</p>
                <p className="text-base leading-tight text-blau-700">{p.nivell.nom}</p>
              </li>
            ))}
          </ul>
        )}
        {pujades.length === 1 && <p className="mt-3 text-xl text-llosa-700">{pujades[0].nivell.lema}</p>}

        {complements.length > 0 && (
          <div className="mt-5 rounded-2xl bg-blau-50 px-4 py-3 text-left">
            <p className="text-lg font-semibold">Complements nous per al pilotari</p>
            <ul className="mt-1 space-y-0.5 text-lg">
              {complements.slice(0, 4).map((c) => (
                <li key={`${c.alumneId}-${c.complement.id}`}>
                  <strong>{c.nom}</strong> ja pot posar-se: {c.complement.nom.toLowerCase()}
                </li>
              ))}
              {complements.length > 4 && <li>…i {complements.length - 4} més.</li>}
            </ul>
          </div>
        )}

        <button
          type="button"
          onClick={tancaCelebracio}
          className="mt-6 min-h-14 rounded-2xl bg-blau-600 px-8 text-xl font-semibold text-white hover:bg-blau-700"
        >
          Seguim jugant
        </button>
      </div>
    </div>
  );
}
