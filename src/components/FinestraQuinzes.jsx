import { useState } from 'react';
import Finestra from './Finestra.jsx';
import AvatarPilotari from './AvatarPilotari.jsx';
import { useClasse } from '../estat/ClasseContext.jsx';
import { quinzes } from '../domini/text.js';

/** Finestra per a donar quinzes (o un avís, o un −1) a un/a alumne/a, a uns quants o a tota la classe. */
export default function FinestraQuinzes({ alumneIds, titol, onTanca, onVeuPilotari }) {
  const { estat, atorgar, dispatch } = useClasse();
  const [millora, setMillora] = useState(null);

  const alumnes = estat.alumnes.filter((a) => alumneIds.includes(a.id));
  const un = alumnes.length === 1 ? alumnes[0] : null;
  const categories = estat.categories.filter((c) => !c.arxivada);
  const positives = categories.filter((c) => c.tipus === 'positiu');
  const deMillora = categories.filter((c) => c.tipus === 'millora');

  const dona = (categoriaId, mode = 'quinze') => {
    atorgar(alumneIds, categoriaId, mode);
    onTanca();
  };

  const capcalera = (
    <div className="flex items-center gap-3">
      {un && (
        <span className="grid size-14 shrink-0 place-items-end overflow-hidden rounded-full bg-white">
          <AvatarPilotari avatar={un.avatar} mida={52} />
        </span>
      )}
      <div className="min-w-0">
        <h2 className="truncate font-display text-2xl sm:text-3xl">{titol ?? un?.nom}</h2>
        <p className="truncate text-base text-blau-100">
          {un ? quinzes(un.quinzes) : alumnes.map((a) => a.nom).join(', ')}
        </p>
      </div>
    </div>
  );

  if (un?.absent) {
    return (
      <Finestra titol={un.nom} capcalera={capcalera} onTanca={onTanca} ample="max-w-xl">
        <p className="text-xl">Hui {un.nom} no ha vingut a classe.</p>
        <button
          type="button"
          onClick={() => dispatch({ type: 'ALUMNE_ABSENT', id: un.id, absent: false })}
          className="mt-5 min-h-14 w-full rounded-2xl bg-blau-600 px-5 text-xl font-semibold text-white hover:bg-blau-700"
        >
          Ja ha arribat
        </button>
      </Finestra>
    );
  }

  return (
    <Finestra
      titol={titol ?? un?.nom ?? 'Dona quinzes'}
      capcalera={capcalera}
      onTanca={onTanca}
      peu={
        un && (
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => onVeuPilotari(un.id)}
              className="min-h-12 flex-1 rounded-2xl border-[3px] border-blau-600 px-4 text-lg font-semibold text-blau-700 hover:bg-blau-50"
            >
              Veure el seu pilotari
            </button>
            <button
              type="button"
              onClick={() => {
                dispatch({ type: 'ALUMNE_ABSENT', id: un.id, absent: true });
                onTanca();
              }}
              className="min-h-12 flex-1 rounded-2xl border-[3px] border-llosa-300 px-4 text-lg font-semibold text-llosa-700 hover:bg-llosa-100"
            >
              Hui no ha vingut
            </button>
          </div>
        )
      }
    >
      <h3 className="mb-3 text-xl font-semibold">Suma quinzes</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        {positives.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => dona(c.id)}
            className="flex min-h-20 items-center gap-3 rounded-2xl border-[3px] border-groc-400 bg-groc-100 px-4 py-2 text-left transition-transform hover:bg-groc-200 active:scale-95"
          >
            <span className="text-4xl" aria-hidden="true">{c.icona}</span>
            <span className="min-w-0 flex-1">
              <span className="block text-xl font-semibold leading-tight">{c.nom}</span>
              <span className="block text-base leading-snug text-llosa-700">{c.descripcio}</span>
            </span>
            <span className="grid size-14 shrink-0 place-items-center rounded-full bg-groc-400 font-display text-2xl">
              +{c.valor}
            </span>
          </button>
        ))}
      </div>

      {deMillora.length > 0 && (
        <>
          <h3 className="mb-1 mt-7 text-xl font-semibold">Per a millorar</h3>
          <p className="mb-3 text-base text-llosa-500">Tria si és només un avís o si es resta un quinze.</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {deMillora.map((c) => (
              <div key={c.id} className="rounded-2xl border-[3px] border-llosa-200 bg-white">
                <button
                  type="button"
                  onClick={() => setMillora(millora === c.id ? null : c.id)}
                  aria-expanded={millora === c.id}
                  className="flex min-h-20 w-full items-center gap-3 rounded-2xl px-4 py-2 text-left hover:bg-llosa-100"
                >
                  <span className="text-4xl" aria-hidden="true">{c.icona}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-xl font-semibold leading-tight">{c.nom}</span>
                    <span className="block text-base leading-snug text-llosa-700">{c.descripcio}</span>
                  </span>
                </button>
                {millora === c.id && (
                  <div className="flex gap-3 px-3 pb-3">
                    <button
                      type="button"
                      onClick={() => dona(c.id, 'avis')}
                      className="min-h-14 flex-1 rounded-xl bg-ambre-100 px-3 text-lg font-semibold text-ambre-700 hover:brightness-95"
                    >
                      Avís
                    </button>
                    <button
                      type="button"
                      onClick={() => dona(c.id, 'resta')}
                      className="min-h-14 flex-1 rounded-xl bg-llosa-700 px-3 text-lg font-semibold text-white hover:bg-llosa-900"
                    >
                      −1 quinze
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </Finestra>
  );
}
