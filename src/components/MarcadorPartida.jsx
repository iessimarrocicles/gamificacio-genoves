import Pilota from './Pilota.jsx';
import { estatPartida } from '../domini/partida.js';
import { quinzes, plural } from '../domini/text.js';

/**
 * El Marcador de Partida: el marcador manual del trinquet i «la corda» com a barra de progrés.
 * Tota la classe empeny la pilota cap al premi.
 */
export default function MarcadorPartida({ partida, onNova, compacte = false }) {
  const p = estatPartida(partida);
  const nusos = Array.from({ length: p.jocsObjectiu - 1 }, (_, i) => ((i + 1) / p.jocsObjectiu) * 100);

  return (
    <section
      aria-label="Partida de la classe"
      className="flex flex-col gap-4 rounded-3xl bg-llosa-900 p-4 text-white sm:flex-row sm:items-center sm:gap-6 sm:p-5"
    >
      {/* El cant: 15 · 30 · Val */}
      <div className="flex shrink-0 items-center gap-4">
        <div
          className={`grid h-20 min-w-32 place-items-center rounded-2xl px-4 font-display leading-none ${
            p.guanyada ? 'bg-groc-400 text-llosa-900' : 'bg-white text-llosa-900'
          } ${p.cant.length > 3 ? 'text-2xl' : 'text-5xl'}`}
          aria-live="polite"
        >
          {p.cant}
        </div>
        <div>
          <p className="text-sm text-llosa-300">Partida de la classe</p>
          <p className="xifres font-display text-3xl leading-tight">
            {p.jocs} <span className="text-xl text-llosa-300">de {p.jocsObjectiu} jocs</span>
          </p>
        </div>
      </div>

      {/* La corda */}
      <div className="min-w-0 flex-1">
        <div
          className="relative mx-3 h-10"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={p.objectiu}
          aria-valuenow={p.acumulat}
          aria-valuetext={`${p.acumulat} de ${quinzes(p.objectiu)}`}
        >
          <div className="absolute inset-x-0 top-1/2 h-2 -translate-y-1/2 rounded-full bg-llosa-700" />
          <div
            className="absolute left-0 top-1/2 h-2 -translate-y-1/2 rounded-full bg-groc-400 transition-[width] duration-700"
            style={{ width: `${p.percentatge}%` }}
          />
          {nusos.map((x) => (
            <span
              key={x}
              className={`absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-llosa-900 ${
                x <= p.percentatge ? 'bg-groc-400' : 'bg-llosa-500'
              }`}
              style={{ left: `${x}%` }}
              aria-hidden="true"
            />
          ))}
          <span
            className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 transition-[left] duration-700"
            style={{ left: `${p.percentatge}%` }}
            aria-hidden="true"
          >
            <Pilota mida={36} />
          </span>
          <span className="absolute -right-3 top-1/2 -translate-y-1/2 text-3xl" aria-hidden="true">
            🏆
          </span>
        </div>
        {!compacte && (
          <p className="mt-1 px-3 text-base text-llosa-200">
            {p.guanyada ? (
              <>
                Partida guanyada! Premi: <strong className="text-groc-400">{p.premi}</strong>
              </>
            ) : (
              <>
                {plural(p.falten, 'Falta', 'Falten')} <strong className="xifres text-white">{quinzes(p.falten)}</strong> per a guanyar:{' '}
                <strong className="text-groc-400">{p.premi}</strong>
              </>
            )}
          </p>
        )}
      </div>

      {p.guanyada && onNova && (
        <button
          type="button"
          onClick={onNova}
          className="min-h-14 shrink-0 rounded-2xl bg-groc-400 px-5 text-lg font-semibold text-llosa-900 hover:bg-groc-200"
        >
          Comença una partida nova
        </button>
      )}
    </section>
  );
}
