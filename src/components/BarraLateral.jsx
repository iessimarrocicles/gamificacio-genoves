import { useState } from 'react';
import Pilota from './Pilota.jsx';
import { useClasse } from '../estat/ClasseContext.jsx';
import { nouId } from '../domini/reductor.js';
import { plural } from '../domini/text.js';

export const SECCIONS = [
  { id: 'trinquet', nom: 'El trinquet' },
  { id: 'grups', nom: 'Grups' },
  { id: 'informes', nom: 'Informes' },
  { id: 'config', nom: 'Configuració' },
];

/**
 * Menú lateral: classes, seccions i qui usa la pantalla (mestre/a o alumnat).
 * En pantalles amples està sempre a la vista; en les estretes s'obri damunt de la pàgina (`oberta`)
 * i, mentre està fora de la vista (`amagada`), no es pot tocar ni amb el teclat.
 */
export default function BarraLateral({ seccio, onSeccio, mode, onMode, onClasseNova, oberta, amagada = false, onTanca }) {
  const { aules, dispatch } = useClasse();
  const [creant, setCreant] = useState(false);
  const [nom, setNom] = useState('');
  const esMestre = mode === 'mestre';

  const crea = (e) => {
    e.preventDefault();
    if (!nom.trim()) return;
    dispatch({ type: 'AULA_CREAR', id: nouId('aula'), nom });
    setNom('');
    setCreant(false);
    onClasseNova();
  };

  const element = 'flex min-h-12 w-full items-center gap-3 rounded-xl px-3 text-left text-lg font-semibold';

  return (
    <>
      {oberta && <div className="fixed inset-0 z-30 bg-llosa-900/50 lg:hidden" onClick={onTanca} aria-hidden="true" />}
      <aside
        inert={amagada}
        className={`no-imprimir fixed inset-y-0 left-0 z-40 flex w-72 shrink-0 flex-col border-r-8 border-roig-600 bg-blau-700 text-white transition-transform lg:sticky lg:top-0 lg:z-auto lg:h-dvh lg:translate-x-0 ${
          oberta ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Menú"
      >
        <div className="flex items-center gap-3 px-4 pb-3 pt-4">
          <Pilota mida={44} />
          <p className="min-w-0 flex-1 font-display text-2xl leading-none">
            El Trinquet
            <span className="mt-1 block font-sans text-sm font-normal text-blau-100">Gamificació d’aula</span>
          </p>
          <button
            type="button"
            onClick={onTanca}
            aria-label="Tanca el menú"
            className="grid size-12 shrink-0 place-items-center rounded-full bg-white/15 text-2xl font-semibold hover:bg-white/25 lg:hidden"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-3 pb-3">
          <nav aria-label="Classes">
            <h2 className="mb-1 px-3 text-sm font-semibold text-blau-100">Classes</h2>
            <ul className="space-y-1">
              {aules.map((a) => (
                <li key={a.id}>
                  <button
                    type="button"
                    aria-current={a.activa ? 'true' : undefined}
                    disabled={!esMestre && !a.activa}
                    onClick={() => {
                      dispatch({ type: 'AULA_ACTIVAR', id: a.id });
                      onSeccio('trinquet');
                    }}
                    className={`${element} justify-between ${
                      a.activa ? 'bg-white text-blau-800' : 'text-white hover:bg-white/15 disabled:opacity-40'
                    }`}
                  >
                    <span className="min-w-0 truncate">{a.nom}</span>
                    <span
                      className={`xifres shrink-0 rounded-full px-2 py-0.5 text-sm ${a.activa ? 'bg-blau-100' : 'bg-white/15'}`}
                      aria-label={`${a.alumnes} ${plural(a.alumnes, 'alumne/a', 'alumnes')}`}
                    >
                      {a.alumnes}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            {esMestre &&
              (creant ? (
                <form onSubmit={crea} className="mt-2 space-y-2 rounded-xl bg-blau-800 p-2">
                  <input
                    autoFocus
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    placeholder="Nom de la classe"
                    aria-label="Nom de la classe nova"
                    maxLength={30}
                    className="min-h-12 w-full rounded-lg border-0 bg-white px-3 text-lg text-llosa-900"
                  />
                  <div className="flex gap-2">
                    <button type="submit" disabled={!nom.trim()} className="min-h-11 flex-1 rounded-lg bg-groc-400 px-3 text-base font-semibold text-llosa-900 disabled:opacity-40">
                      Crea la classe
                    </button>
                    <button type="button" onClick={() => setCreant(false)} className="min-h-11 rounded-lg bg-white/15 px-3 text-base font-semibold">
                      Cancel·la
                    </button>
                  </div>
                </form>
              ) : (
                <button type="button" onClick={() => setCreant(true)} className={`${element} mt-1 border-2 border-dashed border-white/40 text-blau-100 hover:bg-white/10`}>
                  + Classe nova
                </button>
              ))}
          </nav>

          {esMestre && (
            <nav aria-label="Seccions">
              <h2 className="mb-1 px-3 text-sm font-semibold text-blau-100">Seccions</h2>
              <ul className="space-y-1">
                {SECCIONS.map((s) => (
                  <li key={s.id}>
                    <button
                      type="button"
                      aria-current={seccio === s.id ? 'page' : undefined}
                      onClick={() => onSeccio(s.id)}
                      className={`${element} ${seccio === s.id ? 'bg-groc-400 text-llosa-900' : 'text-white hover:bg-white/15'}`}
                    >
                      {s.nom}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </div>

        <div className="border-t-2 border-white/15 p-3">
          <p className="mb-1 px-1 text-sm font-semibold text-blau-100">Qui usa la pantalla</p>
          <div className="flex rounded-xl bg-blau-800 p-1" role="group" aria-label="Qui usa la pantalla">
            {[
              { id: 'mestre', nom: 'Mestre/a' },
              { id: 'alumnat', nom: 'Alumnat' },
            ].map((m) => (
              <button
                key={m.id}
                type="button"
                aria-pressed={mode === m.id}
                onClick={() => onMode(m.id)}
                className={`min-h-12 flex-1 rounded-lg px-2 text-lg font-semibold ${
                  mode === m.id ? 'bg-white text-blau-800' : 'text-blau-100 hover:text-white'
                }`}
              >
                {m.nom}
              </button>
            ))}
          </div>
        </div>
      </aside>
    </>
  );
}
