import { useState } from 'react';
import AvatarPilotari from './AvatarPilotari.jsx';
import Pilota from './Pilota.jsx';
import { Pagina, BotoConfirma, campLliure, botoPrimari, botoSecundari } from './comuns.jsx';
import { useClasse } from '../estat/ClasseContext.jsx';
import { nouId } from '../domini/reductor.js';
import { COLORS_GRUP, colorLliure, quinzesGrup, repartirEnEquips, NOMS_EQUIP } from '../domini/grups.js';
import { plural } from '../domini/text.js';

function TargetaGrup({ grup, onDona }) {
  const { estat, dispatch } = useClasse();
  const color = COLORS_GRUP[grup.color];
  const dins = new Set(grup.alumneIds);
  const presents = estat.alumnes.filter((a) => dins.has(a.id) && !a.absent);
  const edita = (canvis) => dispatch({ type: 'GRUP_EDITAR', id: grup.id, canvis });
  // Un grup buit comença amb tota la llista de la classe a la vista, per a omplir-lo.
  const [canviant, setCanviant] = useState(grup.alumneIds.length === 0);

  return (
    <li className="overflow-hidden rounded-3xl border-[3px] bg-white" style={{ borderColor: color.fons }}>
      <div className="flex flex-wrap items-center gap-3 px-4 py-3" style={{ background: color.fons, color: color.text }}>
        <input
          key={grup.nom}
          defaultValue={grup.nom}
          aria-label="Nom del grup"
          maxLength={30}
          onBlur={(e) => {
            if (e.target.value.trim() && e.target.value.trim() !== grup.nom) edita({ nom: e.target.value });
            else e.target.value = grup.nom;
          }}
          className="min-h-12 min-w-40 flex-1 rounded-xl border-0 bg-white/95 px-3 font-display text-2xl text-llosa-900"
        />
        <p className="flex items-center gap-2">
          <Pilota mida={28} />
          <span className="xifres font-display text-3xl leading-none">{quinzesGrup(estat, grup)}</span>
          <span className="text-base">{plural(quinzesGrup(estat, grup), 'quinze', 'quinzes')}</span>
        </p>
      </div>

      <div className="space-y-4 p-4">
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label={`Color de ${grup.nom}`}>
          {Object.entries(COLORS_GRUP).map(([id, c]) => (
            <button
              key={id}
              type="button"
              aria-label={c.nom}
              aria-pressed={grup.color === id}
              onClick={() => edita({ color: id })}
              className={`size-11 rounded-full border-[3px] ${grup.color === id ? 'border-llosa-900 ring-4 ring-groc-200' : 'border-white'}`}
              style={{ background: c.fons }}
            />
          ))}
        </div>

        <div>
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <p className="text-lg font-semibold">
              {canviant
                ? grup.alumneIds.length === 0
                  ? 'Toca els noms per a posar-los al grup'
                  : `${grup.alumneIds.length} ${plural(grup.alumneIds.length, 'membre', 'membres')}. Toca un nom per a posar-lo o llevar-lo`
                : `${grup.alumneIds.length} ${plural(grup.alumneIds.length, 'membre', 'membres')}`}
            </p>
            <button type="button" className={botoSecundari} aria-pressed={canviant} onClick={() => setCanviant(!canviant)}>
              {canviant ? 'Fet' : 'Canvia els membres'}
            </button>
          </div>
          {canviant ? (
            <ul className="flex flex-wrap gap-2">
              {estat.alumnes.map((a) => {
                const es = dins.has(a.id);
                return (
                  <li key={a.id}>
                    <button
                      type="button"
                      aria-pressed={es}
                      onClick={() => dispatch({ type: 'GRUP_MEMBRE', id: grup.id, alumneId: a.id, dins: !es })}
                      className={`flex min-h-12 items-center gap-1.5 rounded-full border-[3px] py-0.5 pl-1.5 pr-4 text-lg font-semibold ${
                        es ? 'text-llosa-900' : 'border-llosa-200 bg-white text-llosa-500'
                      }`}
                      style={es ? { borderColor: color.fons, background: color.clar } : undefined}
                    >
                      <span className={es ? '' : 'opacity-40 grayscale'}>
                        <AvatarPilotari avatar={a.avatar} mida={30} />
                      </span>
                      {a.nom}
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <ul className="flex flex-wrap gap-2">
              {estat.alumnes
                .filter((a) => dins.has(a.id))
                .map((a) => (
                  <li
                    key={a.id}
                    className={`flex min-h-11 items-center gap-1.5 rounded-full py-0.5 pl-1.5 pr-4 text-lg font-semibold ${a.absent ? 'opacity-50' : ''}`}
                    style={{ background: color.clar }}
                  >
                    <AvatarPilotari avatar={a.avatar} mida={30} />
                    {a.nom}
                    <span className="xifres text-base font-normal text-llosa-700">{a.absent ? 'absent' : a.quinzes}</span>
                  </li>
                ))}
            </ul>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button type="button" className={botoPrimari} disabled={presents.length === 0} onClick={() => onDona(grup)}>
            Dona quinzes al grup
          </button>
          <BotoConfirma pregunta={`Esborrar «${grup.nom}»?`} onConfirma={() => dispatch({ type: 'GRUP_ELIMINAR', id: grup.id })}>
            Esborra el grup
          </BotoConfirma>
        </div>
      </div>
    </li>
  );
}

/** Pàgina de grups: crear-ne, canviar-ne els membres i fer equips a l'atzar. */
export default function Grups({ onDona }) {
  const { estat, dispatch } = useClasse();
  const [equips, setEquips] = useState(4);
  const maxEquips = Math.max(2, Math.min(NOMS_EQUIP.length, estat.alumnes.length));

  const grupNou = () =>
    dispatch({
      type: 'GRUP_AFEGIR',
      grup: { id: nouId('grup'), nom: `Grup ${estat.grups.length + 1}`, color: colorLliure(estat.grups), alumneIds: [] },
    });

  if (estat.alumnes.length === 0) {
    return (
      <Pagina titol="Grups">
        <p className="rounded-3xl border-[3px] border-dashed border-llosa-300 bg-white p-8 text-center text-xl text-llosa-700">
          Primer afig els alumnes de la classe. Després podràs fer grups.
        </p>
      </Pagina>
    );
  }

  return (
    <Pagina
      titol="Grups"
      ajuda={`Taules, equips o colles de ${estat.aula.nom}. Es poden canviar sempre que vulgues: els quinzes són de cada alumne/a i no es perden.`}
      accions={
        <button type="button" className={botoPrimari} onClick={grupNou}>
          Grup nou
        </button>
      }
    >
      <div className="mb-5 flex flex-wrap items-center gap-3 rounded-2xl bg-blau-50 px-4 py-3">
        <label className="flex items-center gap-2 text-lg font-semibold">
          Fes
          <select
            className={`${campLliure} w-20`}
            value={Math.min(equips, maxEquips)}
            onChange={(e) => setEquips(Number(e.target.value))}
            aria-label="Nombre d’equips"
          >
            {Array.from({ length: maxEquips - 1 }, (_, i) => i + 2).map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
          equips a l’atzar
        </label>
        {estat.grups.length === 0 ? (
          <button
            type="button"
            className={botoSecundari}
            onClick={() => dispatch({ type: 'GRUPS_SUBSTITUIR', grups: repartirEnEquips(estat.alumnes, equips) })}
          >
            Reparteix la classe
          </button>
        ) : (
          <BotoConfirma
            pregunta="Això substitueix els grups d’ara. Seguim?"
            onConfirma={() => dispatch({ type: 'GRUPS_SUBSTITUIR', grups: repartirEnEquips(estat.alumnes, equips) })}
          >
            Reparteix la classe
          </BotoConfirma>
        )}
      </div>

      {estat.grups.length === 0 ? (
        <p className="rounded-3xl border-[3px] border-dashed border-llosa-300 bg-white p-8 text-center text-xl text-llosa-700">
          Encara no hi ha cap grup. Crea’n un amb «Grup nou» o reparteix la classe en equips a l’atzar.
        </p>
      ) : (
        <ul className="grid gap-4 xl:grid-cols-2">
          {estat.grups.map((g) => (
            <TargetaGrup key={g.id} grup={g} onDona={onDona} />
          ))}
        </ul>
      )}
      <p className="mt-4 text-base text-llosa-500">
        Un/a alumne/a pot estar en més d’un grup alhora. Els quinzes d’un grup són la suma dels que tenen ara els seus membres.
      </p>
    </Pagina>
  );
}
