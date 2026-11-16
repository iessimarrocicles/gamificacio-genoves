import AvatarPilotari from './AvatarPilotari.jsx';
import Pilota from './Pilota.jsx';
import { nivellDe } from '../domini/nivells.js';
import { quinzes } from '../domini/text.js';

const TO_ESCLAT = {
  quinze: 'bg-groc-400 text-llosa-900',
  avis: 'bg-ambre-100 text-ambre-700',
  resta: 'bg-llosa-700 text-white',
};

/** Targeta d'un/a alumne/a al Trinquet Virtual. */
export default function TargetaAlumne({ alumne, onToca, esclat, seleccionat = false, triant = false, destacat = false, colorsGrup = [] }) {
  const nivell = nivellDe(alumne.record);
  const blava = alumne.avatar.samarreta === 'blava';

  return (
    <button
      type="button"
      onClick={() => onToca(alumne)}
      aria-pressed={triant ? seleccionat : undefined}
      aria-label={`${alumne.nom}: ${quinzes(alumne.quinzes)}, ${nivell.nom}${alumne.absent ? ', absent' : ''}`}
      className={[
        'group relative flex min-h-44 flex-col items-center rounded-3xl border-[3px] bg-white px-2 pb-3 pt-2 text-center transition-transform active:scale-95',
        seleccionat ? 'border-groc-400 ring-4 ring-groc-200' : blava ? 'border-blau-200' : 'border-roig-200',
        destacat ? 'animate-batec border-groc-400 ring-4 ring-groc-200' : '',
        alumne.absent ? 'opacity-45 grayscale' : 'hover:-translate-y-0.5',
      ].join(' ')}
    >
      {/* El pis de llosa on juga el pilotari */}
      <span className={`absolute inset-x-0 bottom-0 h-[42%] rounded-b-[20px] ${blava ? 'bg-blau-50' : 'bg-roig-100/60'}`} aria-hidden="true" />

      {triant && (
        <span
          className={`absolute left-2 top-2 z-10 grid size-8 place-items-center rounded-full border-[3px] text-lg font-bold ${
            seleccionat ? 'border-groc-600 bg-groc-400 text-llosa-900' : 'border-llosa-300 bg-white text-transparent'
          }`}
          aria-hidden="true"
        >
          ✓
        </span>
      )}

      {alumne.absent ? (
        <span className="absolute right-2 top-2 z-10 rounded-full bg-llosa-700 px-2.5 py-0.5 text-sm font-semibold text-white">
          Absent
        </span>
      ) : (
        colorsGrup.length > 0 && (
          // Un punt del color de cada grup on està.
          <span className="absolute right-2.5 top-2.5 z-10 flex gap-1" aria-hidden="true">
            {colorsGrup.map((color, i) => (
              <span key={`${color}-${i}`} className="size-3.5 rounded-full border-2 border-white" style={{ background: color }} />
            ))}
          </span>
        )
      )}

      <span className={`relative ${esclat ? 'animate-bot' : ''}`} key={`avatar-${esclat?.clau ?? 'quiet'}`}>
        <AvatarPilotari avatar={alumne.avatar} mida={84} />
      </span>

      <span className="relative mt-1 w-full truncate px-1 text-lg font-semibold leading-tight">{alumne.nom}</span>

      <span className="relative mt-1 flex items-center gap-1.5">
        <Pilota mida={22} />
        <span className="xifres font-display text-3xl leading-none">{alumne.quinzes}</span>
      </span>

      <span className="relative mt-1 w-full truncate px-1 text-sm text-llosa-500">{nivell.nom}</span>

      {esclat && (
        <span
          key={`esclat-${esclat.clau}`}
          className={`pointer-events-none absolute left-1/2 top-6 z-20 -ml-10 w-20 animate-puja rounded-full py-1 text-center font-display text-2xl shadow-lg ${TO_ESCLAT[esclat.to]}`}
          aria-hidden="true"
        >
          {esclat.text}
        </span>
      )}
    </button>
  );
}
