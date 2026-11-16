import { useCallback, useEffect, useState } from 'react';
import { ClasseProvider, useClasse } from './estat/ClasseContext.jsx';
import TargetaAlumne from './components/TargetaAlumne.jsx';
import MarcadorPartida from './components/MarcadorPartida.jsx';
import FinestraQuinzes from './components/FinestraQuinzes.jsx';
import Rifa from './components/Rifa.jsx';
import Celebracio from './components/Celebracio.jsx';
import VistaAlumne from './components/VistaAlumne.jsx';
import Configuracio from './components/Configuracio.jsx';
import Informes from './components/Informes.jsx';
import Pilota from './components/Pilota.jsx';
import { alumnesDemo } from './domini/demo.js';

const botoBarra =
  'min-h-14 rounded-2xl px-5 text-lg font-semibold transition-transform active:scale-95 disabled:opacity-40';

function TrinquetBuit({ onAfig }) {
  const { dispatch } = useClasse();
  return (
    <div className="mx-auto mt-10 max-w-2xl rounded-3xl border-[3px] border-dashed border-llosa-300 bg-white p-8 text-center">
      <Pilota mida={64} className="mx-auto" />
      <h2 className="mt-4 font-display text-4xl">El trinquet està buit</h2>
      <p className="mt-3 text-xl text-llosa-700">
        Afig els alumnes de la classe i cada un/a tindrà el seu pilotari per a començar a guanyar quinzes.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button type="button" onClick={onAfig} className={`${botoBarra} bg-blau-600 text-white hover:bg-blau-700`}>
          Afig els alumnes
        </button>
        <button
          type="button"
          onClick={() => dispatch({ type: 'ALUMNES_AFEGIR', alumnes: alumnesDemo() })}
          className={`${botoBarra} border-[3px] border-llosa-300 bg-white text-llosa-700 hover:bg-llosa-100`}
        >
          Prova amb una classe d’exemple
        </button>
      </div>
    </div>
  );
}

function AvisDesfer() {
  const { ultimaAccio, desfer, oblidaUltimaAccio } = useClasse();

  useEffect(() => {
    if (!ultimaAccio) return undefined;
    const t = setTimeout(oblidaUltimaAccio, 9000);
    return () => clearTimeout(t);
    // oblidaUltimaAccio és nova en cada render; només volem reiniciar el compte quan canvia l'acció.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ultimaAccio?.lot]);

  if (!ultimaAccio) return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-20 flex justify-center px-3" role="status">
      <div className="pointer-events-auto flex max-w-full items-center gap-4 rounded-2xl bg-llosa-900 py-2 pl-5 pr-2 text-white shadow-xl">
        <p className="min-w-0 text-lg">
          <span className="font-semibold">{ultimaAccio.text}.</span>{' '}
          <span className="hidden text-llosa-200 md:inline">{ultimaAccio.frase}</span>
        </p>
        <button
          type="button"
          onClick={desfer}
          className="min-h-12 shrink-0 rounded-xl bg-white px-5 text-lg font-semibold text-llosa-900 hover:bg-groc-200"
        >
          Desfés
        </button>
      </div>
    </div>
  );
}

function Trinquet() {
  const { estat, dispatch, esclats, errorGuardat } = useClasse();
  const [finestra, setFinestra] = useState(null);
  const [mode, setMode] = useState('mestre'); // 'mestre' | 'alumnat'
  const [triant, setTriant] = useState(false);
  const [triats, setTriats] = useState([]);

  const tanca = useCallback(() => setFinestra(null), []);
  const presents = estat.alumnes.filter((a) => !a.absent);
  const absents = estat.alumnes.length - presents.length;

  const tocaTargeta = (alumne) => {
    if (mode === 'alumnat') {
      setFinestra({ tipus: 'alumne', id: alumne.id });
    } else if (triant) {
      if (alumne.absent) return;
      setTriats((ids) => (ids.includes(alumne.id) ? ids.filter((id) => id !== alumne.id) : [...ids, alumne.id]));
    } else {
      setFinestra({ tipus: 'quinzes', alumneIds: [alumne.id] });
    }
  };

  const deixaDeTriar = () => {
    setTriant(false);
    setTriats([]);
  };

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="bg-blau-700 text-white">
        <div className="mx-auto flex max-w-[1800px] flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Pilota mida={48} />
            <div className="min-w-0">
              <h1 className="truncate font-display text-3xl leading-none sm:text-4xl">El Trinquet de 3r</h1>
              <p className="truncate text-base text-blau-100">
                {estat.aula.nom}, {estat.aula.escola}
              </p>
            </div>
          </div>

          <div className="ml-auto flex flex-wrap items-center gap-2">
            <div className="flex rounded-2xl bg-blau-800 p-1" role="group" aria-label="Qui usa la pantalla">
              {[
                { id: 'mestre', nom: 'Mestre/a' },
                { id: 'alumnat', nom: 'Alumnat' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  aria-pressed={mode === m.id}
                  onClick={() => {
                    setMode(m.id);
                    deixaDeTriar();
                  }}
                  className={`min-h-12 rounded-xl px-4 text-lg font-semibold ${
                    mode === m.id ? 'bg-white text-blau-800' : 'text-blau-100 hover:text-white'
                  }`}
                >
                  {m.nom}
                </button>
              ))}
            </div>
            {mode === 'mestre' && (
              <>
                <button type="button" onClick={() => setFinestra({ tipus: 'informes' })} className={`${botoBarra} bg-white/15 hover:bg-white/25`}>
                  Informes
                </button>
                <button
                  type="button"
                  onClick={() => setFinestra({ tipus: 'config' })}
                  className={`${botoBarra} bg-white/15 hover:bg-white/25`}
                  aria-label="Configuració"
                >
                  <span aria-hidden="true">⚙️</span> Configuració
                </button>
              </>
            )}
          </div>
        </div>
        <div className="h-2 bg-roig-600" aria-hidden="true" />
      </header>

      <main className="mx-auto w-full max-w-[1800px] flex-1 px-4 pb-28 pt-4 sm:px-6">
        {errorGuardat && (
          <p role="alert" className="mb-4 rounded-2xl bg-ambre-100 px-4 py-3 text-lg font-semibold text-ambre-700">
            No s’han pogut guardar els canvis en este navegador. Baixa una còpia des de Configuració, Dades.
          </p>
        )}

        <MarcadorPartida partida={estat.partida} onNova={mode === 'mestre' ? () => dispatch({ type: 'PARTIDA_NOVA' }) : undefined} />

        {estat.alumnes.length === 0 ? (
          <TrinquetBuit onAfig={() => setFinestra({ tipus: 'config' })} />
        ) : (
          <>
            {mode === 'mestre' ? (
              <div className="my-4 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  disabled={presents.length === 0 || triant}
                  onClick={() => setFinestra({ tipus: 'quinzes', alumneIds: presents.map((a) => a.id), titol: 'Tota la classe' })}
                  className={`${botoBarra} bg-groc-400 text-llosa-900 hover:bg-groc-200`}
                >
                  Tota la classe
                </button>
                <button
                  type="button"
                  disabled={presents.length === 0 || triant}
                  onClick={() => setFinestra({ tipus: 'rifa' })}
                  className={`${botoBarra} bg-blau-600 text-white hover:bg-blau-700`}
                >
                  La rifa de la pilota
                </button>
                <button
                  type="button"
                  aria-pressed={triant}
                  onClick={() => (triant ? deixaDeTriar() : setTriant(true))}
                  className={`${botoBarra} border-[3px] ${
                    triant ? 'border-llosa-900 bg-llosa-900 text-white' : 'border-llosa-300 bg-white text-llosa-700 hover:bg-llosa-100'
                  }`}
                >
                  {triant ? 'Deixa de triar' : 'Tria’n uns quants'}
                </button>
                {absents > 0 && (
                  <button
                    type="button"
                    onClick={() => dispatch({ type: 'ABSENTS_NETEJAR' })}
                    className={`${botoBarra} ml-auto border-[3px] border-llosa-300 bg-white text-llosa-700 hover:bg-llosa-100`}
                  >
                    {absents === 1 ? 'Hi ha 1 absent: ja ha vingut' : `Hi ha ${absents} absents: ja han vingut`}
                  </button>
                )}
              </div>
            ) : (
              <p className="my-4 rounded-2xl bg-blau-50 px-5 py-3 text-xl">
                Toca el teu nom per a veure el teu pilotari i els teus quinzes.
              </p>
            )}

            <ul className="grid grid-cols-[repeat(auto-fill,minmax(9.5rem,1fr))] gap-3 xl:grid-cols-[repeat(auto-fill,minmax(10.5rem,1fr))]">
              {estat.alumnes.map((a) => (
                <li key={a.id} className="grid">
                  <TargetaAlumne
                    alumne={a}
                    onToca={tocaTargeta}
                    esclat={esclats[a.id]}
                    triant={triant}
                    seleccionat={triats.includes(a.id)}
                  />
                </li>
              ))}
            </ul>
          </>
        )}
      </main>

      {triant && (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t-[3px] border-groc-400 bg-white px-4 py-3">
          <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-3">
            <p className="text-xl font-semibold">
              {triats.length === 0
                ? 'Toca les targetes dels alumnes que vols premiar'
                : `${triats.length} ${triats.length === 1 ? 'alumne/a triat/da' : 'alumnes triats'}`}
            </p>
            <button
              type="button"
              disabled={triats.length === 0}
              onClick={() => setFinestra({ tipus: 'quinzes', alumneIds: triats, titol: `${triats.length} alumnes` })}
              className={`${botoBarra} bg-groc-400 text-llosa-900 hover:bg-groc-200`}
            >
              Dona’ls quinzes
            </button>
          </div>
        </div>
      )}

      {!triant && <AvisDesfer />}

      {finestra?.tipus === 'quinzes' && (
        <FinestraQuinzes
          alumneIds={finestra.alumneIds}
          titol={finestra.alumneIds.length === 1 ? undefined : finestra.titol}
          onTanca={() => {
            tanca();
            deixaDeTriar();
          }}
          onVeuPilotari={(id) => setFinestra({ tipus: 'alumne', id })}
        />
      )}
      {finestra?.tipus === 'rifa' && (
        <Rifa onTanca={tanca} onDona={(id) => setFinestra({ tipus: 'quinzes', alumneIds: [id] })} />
      )}
      {finestra?.tipus === 'alumne' && <VistaAlumne alumneId={finestra.id} onTanca={tanca} />}
      {finestra?.tipus === 'config' && <Configuracio onTanca={tanca} />}
      {finestra?.tipus === 'informes' && <Informes onTanca={tanca} />}

      <Celebracio />
    </div>
  );
}

export default function App() {
  return (
    <ClasseProvider>
      <Trinquet />
    </ClasseProvider>
  );
}
