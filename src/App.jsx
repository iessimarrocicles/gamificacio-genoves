import { useCallback, useEffect, useState } from 'react';
import { ClasseProvider, useClasse } from './estat/ClasseContext.jsx';
import BarraLateral from './components/BarraLateral.jsx';
import TargetaAlumne from './components/TargetaAlumne.jsx';
import MarcadorPartida from './components/MarcadorPartida.jsx';
import FinestraQuinzes from './components/FinestraQuinzes.jsx';
import Rifa from './components/Rifa.jsx';
import Celebracio from './components/Celebracio.jsx';
import VistaAlumne from './components/VistaAlumne.jsx';
import Configuracio from './components/Configuracio.jsx';
import Informes from './components/Informes.jsx';
import Grups from './components/Grups.jsx';
import Pilota from './components/Pilota.jsx';
import { alumnesDemo } from './domini/demo.js';
import { COLORS_GRUP, membresGrup } from './domini/grups.js';

const botoBarra =
  'min-h-14 rounded-2xl px-5 text-lg font-semibold transition-transform active:scale-95 disabled:opacity-40';

const PANTALLA_AMPLA = '(min-width: 1024px)';

/** Cert quan el menú lateral cap sempre a la vista (pissarra, ordinador, tauleta apaïsada). */
function usePantallaAmpla() {
  const [ampla, setAmpla] = useState(() => globalThis.matchMedia?.(PANTALLA_AMPLA).matches ?? true);
  useEffect(() => {
    const consulta = globalThis.matchMedia?.(PANTALLA_AMPLA);
    if (!consulta) return undefined;
    const canvia = () => setAmpla(consulta.matches);
    consulta.addEventListener('change', canvia);
    return () => consulta.removeEventListener('change', canvia);
  }, []);
  return ampla;
}

/** Els membres d'un grup que hui han vingut. */
const presentsDe = (estat, grup) => membresGrup(estat, grup).filter((a) => !a.absent);

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
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-20 flex justify-center px-3 lg:left-72" role="status">
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

/** Un botó per grup, per a premiar tota una taula o un equip d'un sol toc. */
function BotonsGrups({ onDona, desactivats }) {
  const { estat } = useClasse();
  if (estat.grups.length === 0) return null;
  return (
    <div role="group" aria-label="Grups" className="mb-4 flex flex-wrap items-center gap-2">
      <span className="text-lg font-semibold text-llosa-700" aria-hidden="true">
        Grups
      </span>
      {estat.grups.map((g) => {
        const color = COLORS_GRUP[g.color];
        const presents = presentsDe(estat, g).length;
        return (
          <button
            key={g.id}
            type="button"
            disabled={desactivats || presents === 0}
            onClick={() => onDona(g)}
            className="flex min-h-12 items-center gap-2 rounded-full pl-4 pr-2 text-lg font-semibold transition-transform active:scale-95 disabled:opacity-40"
            style={{ background: color.fons, color: color.text }}
          >
            <span className="max-w-56 truncate">{g.nom}</span>
            <span
              className="xifres grid min-w-8 place-items-center rounded-full bg-white/90 px-2 py-0.5 text-base text-llosa-900"
              aria-label={`${presents} presents`}
            >
              {presents}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function Trinquet({ mode, onConfig }) {
  const { estat, dispatch, esclats } = useClasse();
  const [finestra, setFinestra] = useState(null);
  const [triant, setTriant] = useState(false);
  const [triats, setTriats] = useState([]);

  const tanca = useCallback(() => setFinestra(null), []);
  const esMestre = mode === 'mestre';
  const presents = estat.alumnes.filter((a) => !a.absent);
  const absents = estat.alumnes.length - presents.length;
  const colorsDe = (alumneId) => estat.grups.filter((g) => g.alumneIds.includes(alumneId)).map((g) => COLORS_GRUP[g.color].fons);

  const deixaDeTriar = () => {
    setTriant(false);
    setTriats([]);
  };

  // En passar la pantalla a l'alumnat s'acaba el que el/la mestre/a tenia a mitges.
  const [modeVist, setModeVist] = useState(mode);
  if (modeVist !== mode) {
    setModeVist(mode);
    setTriant(false);
    setTriats([]);
    setFinestra(null);
  }

  const tocaTargeta = (alumne) => {
    if (!esMestre) {
      setFinestra({ tipus: 'alumne', id: alumne.id });
    } else if (triant) {
      if (alumne.absent) return;
      setTriats((ids) => (ids.includes(alumne.id) ? ids.filter((id) => id !== alumne.id) : [...ids, alumne.id]));
    } else {
      setFinestra({ tipus: 'quinzes', alumneIds: [alumne.id] });
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1800px]">
      {/* En pantalles estretes el nom de la classe ja és a la barra de dalt. */}
      <div className="sr-only lg:not-sr-only">
        <div className="pb-4">
          <h1 className="font-display text-4xl leading-tight xl:text-5xl">{estat.aula.nom}</h1>
          <p className="text-lg text-llosa-700">{estat.aula.escola}</p>
        </div>
      </div>

      <MarcadorPartida partida={estat.partida} onNova={esMestre ? () => dispatch({ type: 'PARTIDA_NOVA' }) : undefined} />

      {estat.alumnes.length === 0 ? (
        <TrinquetBuit onAfig={onConfig} />
      ) : (
        <>
          {esMestre ? (
            <>
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
              <BotonsGrups
                desactivats={triant}
                onDona={(g) =>
                  setFinestra({ tipus: 'quinzes', alumneIds: presentsDe(estat, g).map((a) => a.id), titol: g.nom, grupId: g.id })
                }
              />
            </>
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
                  colorsGrup={colorsDe(a.id)}
                />
              </li>
            ))}
          </ul>
        </>
      )}

      {triant && (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t-[3px] border-groc-400 bg-white px-4 py-3 lg:left-72">
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
          titol={finestra.alumneIds.length === 1 && !finestra.grupId ? undefined : finestra.titol}
          grupId={finestra.grupId}
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
    </div>
  );
}

/** La pàgina de grups, amb la finestra per a donar-los quinzes. */
function PaginaGrups() {
  const { estat } = useClasse();
  const [grupId, setGrupId] = useState(null);
  const tanca = useCallback(() => setGrupId(null), []);
  const grup = estat.grups.find((g) => g.id === grupId);

  return (
    <>
      <Grups onDona={(g) => setGrupId(g.id)} />
      {grup && (
        <FinestraQuinzes alumneIds={presentsDe(estat, grup).map((a) => a.id)} titol={grup.nom} grupId={grup.id} onTanca={tanca} />
      )}
      <AvisDesfer />
    </>
  );
}

function Aplicacio() {
  const { estat, errorGuardat } = useClasse();
  const [seccio, setSeccio] = useState('trinquet');
  const [mode, setMode] = useState('mestre'); // 'mestre' | 'alumnat'
  const [menuObert, setMenuObert] = useState(false);
  const [visitaConfig, setVisitaConfig] = useState(0);
  const pantallaAmpla = usePantallaAmpla();

  const vesA = (nova) => {
    setSeccio(nova);
    setMenuObert(false);
  };

  return (
    <div className="lg:flex">
      <BarraLateral
        seccio={seccio}
        onSeccio={vesA}
        mode={mode}
        onMode={(nou) => {
          setMode(nou);
          // L'alumnat només veu el trinquet.
          if (nou === 'alumnat') setSeccio('trinquet');
          setMenuObert(false);
        }}
        onClasseNova={() => {
          // Una classe nova comença per la llista d'alumnes.
          setVisitaConfig((n) => n + 1);
          vesA('config');
        }}
        oberta={menuObert}
        amagada={!pantallaAmpla && !menuObert}
        onTanca={() => setMenuObert(false)}
      />

      <div className="flex min-h-dvh min-w-0 flex-1 flex-col">
        <header className="no-imprimir sticky top-0 z-10 flex items-center gap-3 border-b-4 border-roig-600 bg-blau-700 px-3 py-2 text-white lg:hidden">
          <button
            type="button"
            onClick={() => setMenuObert(true)}
            aria-expanded={menuObert}
            className="flex min-h-12 shrink-0 items-center gap-2 rounded-xl bg-white/15 px-4 text-lg font-semibold hover:bg-white/25"
          >
            <span aria-hidden="true">☰</span> Menú
          </button>
          <p className="min-w-0 flex-1 truncate font-display text-2xl leading-none">{estat.aula.nom}</p>
          <Pilota mida={36} />
        </header>

        <main className="flex-1 px-4 pb-28 pt-4 sm:px-6 lg:pt-6">
          {errorGuardat && (
            <p role="alert" className="mb-4 rounded-2xl bg-ambre-100 px-4 py-3 text-lg font-semibold text-ambre-700">
              No s’han pogut guardar els canvis en este navegador. Baixa una còpia des de Configuració, Dades.
            </p>
          )}

          {/* La clau fa que cada classe comence amb la pantalla neta (res triat, cap finestra oberta). */}
          {seccio === 'trinquet' && <Trinquet key={estat.id} mode={mode} onConfig={() => vesA('config')} />}
          {seccio === 'grups' && <PaginaGrups key={estat.id} />}
          {seccio === 'informes' && <Informes key={estat.id} />}
          {seccio === 'config' && <Configuracio key={visitaConfig} />}
        </main>
      </div>

      <Celebracio />
    </div>
  );
}

export default function App() {
  return (
    <ClasseProvider>
      <Aplicacio />
    </ClasseProvider>
  );
}
