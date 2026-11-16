import { useEffect } from 'react';
import AvatarPilotari from './AvatarPilotari.jsx';
import EditorAvatar from './EditorAvatar.jsx';
import MarcadorPartida from './MarcadorPartida.jsx';
import Pilota from './Pilota.jsx';
import { useClasse } from '../estat/ClasseContext.jsx';
import { progresNivell, seguentComplement } from '../domini/nivells.js';
import { NIVELLS } from '../domini/barem.js';
import { quinzes, plural } from '../domini/text.js';

/** La pantalla de l'alumne/a: el seu pilotari, els seus quinzes i la partida de la classe. */
export default function VistaAlumne({ alumneId, onTanca }) {
  const { estat, dispatch } = useClasse();
  const alumne = estat.alumnes.find((a) => a.id === alumneId);

  useEffect(() => {
    const tecla = (e) => {
      if (e.key === 'Escape') onTanca();
    };
    document.addEventListener('keydown', tecla);
    return () => document.removeEventListener('keydown', tecla);
  }, [onTanca]);

  if (!alumne) return null;
  const progres = progresNivell(alumne.record);
  const proper = seguentComplement(alumne.record);
  const blava = alumne.avatar.samarreta === 'blava';

  return (
    <div className="fixed inset-0 z-30 overflow-y-auto bg-calc" role="dialog" aria-modal="true" aria-label={`El pilotari de ${alumne.nom}`}>
      <header className={`flex items-center gap-4 px-4 py-3 text-white sm:px-8 ${blava ? 'bg-blau-600' : 'bg-roig-600'}`}>
        <button
          type="button"
          onClick={onTanca}
          className="min-h-12 rounded-2xl bg-white/20 px-5 text-lg font-semibold hover:bg-white/30"
        >
          Torna al trinquet
        </button>
        <h2 className="min-w-0 flex-1 truncate font-display text-3xl sm:text-4xl">{alumne.nom}</h2>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <section className="space-y-5">
          <div className="rounded-3xl border-[3px] border-llosa-200 bg-white p-5 text-center">
            <AvatarPilotari avatar={alumne.avatar} mida={230} className="mx-auto" titol={`Pilotari de ${alumne.nom}`} />
            <p className="mt-3 flex items-center justify-center gap-3">
              <Pilota mida={40} />
              <span className="xifres font-display text-7xl leading-none">{alumne.quinzes}</span>
              <span className="text-2xl text-llosa-700">{plural(alumne.quinzes, 'quinze', 'quinzes')}</span>
            </p>
          </div>

          <div className="rounded-3xl border-[3px] border-llosa-200 bg-white p-5">
            <p className="text-lg text-llosa-500">Nivell {progres.actual.numero} de {NIVELLS.length}</p>
            <p className="font-display text-4xl text-blau-700">{progres.actual.nom}</p>
            <p className="mt-1 text-lg text-llosa-700">{progres.actual.lema}</p>
            <div
              className="mt-4 h-6 overflow-hidden rounded-full bg-llosa-100"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(progres.percentatge)}
              aria-label="Progrés fins al nivell següent"
            >
              <div className="h-full rounded-full bg-groc-400 transition-[width] duration-700" style={{ width: `${progres.percentatge}%` }} />
            </div>
            <p className="mt-2 text-lg">
              {progres.seguent ? (
                <>
                  {plural(progres.falten, 'Et falta', 'Et falten')} <strong className="xifres">{quinzes(progres.falten)}</strong> per a ser{' '}
                  <strong>{progres.seguent.nom}</strong>.
                </>
              ) : (
                <>Has arribat al nivell més alt. Enhorabona!</>
              )}
            </p>
            {proper && (
              <p className="mt-1 text-lg text-llosa-700">
                Pròxim complement: <strong>{proper.nom.toLowerCase()}</strong>, als {proper.minim} quinzes.
              </p>
            )}
          </div>

          <MarcadorPartida partida={estat.partida} />
        </section>

        <section className="rounded-3xl border-[3px] border-llosa-200 bg-white p-5">
          <h3 className="mb-4 font-display text-3xl">Canvia el meu pilotari</h3>
          <EditorAvatar
            avatar={alumne.avatar}
            record={alumne.record}
            onCanvia={(avatar) => dispatch({ type: 'ALUMNE_EDITAR', id: alumne.id, canvis: { avatar } })}
          />
        </section>
      </div>
    </div>
  );
}
