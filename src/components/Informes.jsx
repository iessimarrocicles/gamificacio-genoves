import { useState } from 'react';
import AvatarPilotari from './AvatarPilotari.jsx';
import { Pagina, botoSecundari as boto } from './comuns.jsx';
import { useClasse } from '../estat/ClasseContext.jsx';
import { PERIODES, resumGrup, resumGrups, resumAlumne, evolucioDiaria } from '../domini/informes.js';
import { COLORS_GRUP } from '../domini/grups.js';
import { estatPartida } from '../domini/partida.js';
import { quinzes } from '../domini/text.js';
import { aCsv, baixaFitxer, dataPerAFitxer } from '../dades/copia.js';

const DIES = ['dg', 'dl', 'dt', 'dc', 'dj', 'dv', 'ds'];

function Xifra({ valor, titol, to = 'bg-white' }) {
  return (
    <div className={`rounded-2xl border-[3px] border-llosa-200 px-4 py-3 ${to}`}>
      <p className="xifres font-display text-4xl leading-none">{valor}</p>
      <p className="mt-1 text-base text-llosa-700">{titol}</p>
    </div>
  );
}

/** Barres dels quinzes guanyats cada dia. Cada barra porta el seu número: no cal eix. */
function Evolucio({ dies }) {
  const maxim = Math.max(1, ...dies.map((d) => d.guanyats));
  return (
    <figure>
      <figcaption className="mb-2 text-lg font-semibold">Quinzes guanyats els últims {dies.length} dies</figcaption>
      <ol className="flex h-40 items-end gap-1.5 rounded-2xl border-[3px] border-llosa-200 bg-white px-3 pb-2 pt-4">
        {dies.map((d) => (
          <li key={d.data.toISOString()} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1">
            <span className="xifres text-sm font-semibold text-llosa-700">{d.guanyats > 0 ? d.guanyats : ''}</span>
            <span
              className={`w-full max-w-10 rounded-t-md ${d.guanyats > 0 ? 'bg-blau-500' : 'bg-llosa-200'}`}
              style={{ height: d.guanyats > 0 ? `${Math.max(6, (d.guanyats / maxim) * 70)}%` : '3px' }}
            />
            <span className="text-xs text-llosa-500">
              {DIES[d.data.getDay()]} {d.data.getDate()}
            </span>
          </li>
        ))}
      </ol>
    </figure>
  );
}

function PerCategoria({ categories }) {
  if (categories.length === 0) return <p className="text-lg text-llosa-500">Encara no hi ha res anotat en este període.</p>;
  const maxim = Math.max(...categories.map((c) => c.vegades));
  return (
    <ul className="space-y-2">
      {categories.map((c) => (
        <li key={c.id} className="grid grid-cols-[minmax(0,14rem)_1fr_auto] items-center gap-3 text-lg">
          <span className="truncate">
            <span aria-hidden="true">{c.icona}</span> {c.nom}
          </span>
          <span className="h-5 overflow-hidden rounded-full bg-llosa-100">
            <span
              className={`block h-full rounded-full ${c.tipus === 'millora' ? 'bg-llosa-500' : 'bg-groc-400'}`}
              style={{ width: `${(c.vegades / maxim) * 100}%` }}
            />
          </span>
          <span className="xifres w-28 text-right text-base text-llosa-700">
            {c.vegades} {c.vegades === 1 ? 'vegada' : 'vegades'}
          </span>
        </li>
      ))}
    </ul>
  );
}

function Grup({ periode }) {
  const { estat } = useClasse();
  const r = resumGrup(estat, periode);
  const p = estatPartida(estat.partida);

  const baixa = () => {
    const csv = aCsv(
      ['Alumne/a', 'Nivell', 'Quinzes ara', 'Guanyats', 'Restats', 'Avisos'],
      r.files.map((f) => [f.nom, f.nivell.nom, f.quinzes, f.guanyats, f.restats, f.avisos]),
    );
    baixaFitxer(`informe-classe-${dataPerAFitxer()}.csv`, csv, 'text/csv');
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Xifra valor={r.guanyats} titol="quinzes guanyats" to="bg-groc-100" />
        <Xifra valor={r.avisos} titol="avisos" />
        <Xifra valor={r.restats} titol="quinzes restats" />
        <Xifra valor={`${p.jocs}/${p.jocsObjectiu}`} titol="jocs de la partida actual" />
      </div>

      <Evolucio dies={evolucioDiaria(estat, 14)} />

      <div>
        <h3 className="mb-2 text-lg font-semibold">Per categories</h3>
        <PerCategoria categories={r.categories} />
      </div>

      <div>
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-lg font-semibold">Alumne/a per alumne/a</h3>
          <button type="button" className={`${boto} no-imprimir`} onClick={baixa} disabled={r.files.length === 0}>
            Baixa en CSV
          </button>
        </div>
        <div className="overflow-x-auto rounded-2xl border-[3px] border-llosa-200 bg-white">
          <table className="w-full text-left text-lg">
            <thead className="bg-llosa-100 text-base">
              <tr>
                <th className="px-3 py-2 font-semibold">Alumne/a</th>
                <th className="px-3 py-2 font-semibold">Nivell</th>
                <th className="px-3 py-2 text-right font-semibold">Quinzes ara</th>
                <th className="px-3 py-2 text-right font-semibold">Guanyats</th>
                <th className="px-3 py-2 text-right font-semibold">Restats</th>
                <th className="px-3 py-2 text-right font-semibold">Avisos</th>
              </tr>
            </thead>
            <tbody>
              {r.files.map((f) => (
                <tr key={f.id} className="border-t-2 border-llosa-100">
                  <th scope="row" className="px-3 py-2 font-semibold">{f.nom}</th>
                  <td className="px-3 py-2">{f.nivell.nom}</td>
                  <td className="xifres px-3 py-2 text-right">{f.quinzes}</td>
                  <td className="xifres px-3 py-2 text-right">{f.guanyats}</td>
                  <td className="xifres px-3 py-2 text-right">{f.restats}</td>
                  <td className="xifres px-3 py-2 text-right">{f.avisos}</td>
                </tr>
              ))}
              {r.files.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-3 py-4 text-llosa-500">Encara no hi ha alumnes.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/** Una fila per grup. Els quinzes són dels membres d'ara: si un grup canvia, l'informe canvia amb ell. */
function PerGrups({ periode }) {
  const { estat } = useClasse();
  const files = resumGrups(estat, periode);
  const maxim = Math.max(1, ...files.map((f) => f.guanyats));

  if (files.length === 0) {
    return (
      <p className="rounded-3xl border-[3px] border-dashed border-llosa-300 bg-white p-8 text-center text-xl text-llosa-700">
        Esta classe encara no té grups. Es creen a la secció «Grups».
      </p>
    );
  }

  const baixa = () => {
    const csv = aCsv(
      ['Grup', 'Membres', 'Quinzes ara', 'Guanyats'],
      files.map((f) => [f.nom, f.membres, f.quinzes, f.guanyats]),
    );
    baixaFitxer(`informe-grups-${dataPerAFitxer()}.csv`, csv, 'text/csv');
  };

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-lg font-semibold">Grup per grup</h3>
        <button type="button" className={`${boto} no-imprimir`} onClick={baixa}>
          Baixa en CSV
        </button>
      </div>
      <div className="overflow-x-auto rounded-2xl border-[3px] border-llosa-200 bg-white">
        <table className="w-full text-left text-lg">
          <thead className="bg-llosa-100 text-base">
            <tr>
              <th className="px-3 py-2 font-semibold">Grup</th>
              <th className="px-3 py-2 text-right font-semibold">Membres</th>
              <th className="px-3 py-2 text-right font-semibold">Quinzes ara</th>
              <th className="px-3 py-2 font-semibold" colSpan={2}>Guanyats en el període</th>
            </tr>
          </thead>
          <tbody>
            {files.map((f) => (
              <tr key={f.id} className="border-t-2 border-llosa-100">
                <th scope="row" className="px-3 py-2 font-semibold">
                  <span className="flex items-center gap-2">
                    <span className="size-4 shrink-0 rounded-full" style={{ background: COLORS_GRUP[f.color].fons }} aria-hidden="true" />
                    {f.nom}
                  </span>
                </th>
                <td className="xifres px-3 py-2 text-right">{f.membres}</td>
                <td className="xifres px-3 py-2 text-right">{f.quinzes}</td>
                <td className="xifres w-16 px-3 py-2 text-right font-semibold">{f.guanyats}</td>
                <td className="w-2/5 py-2 pr-3" aria-hidden="true">
                  <span className="block h-5 overflow-hidden rounded-full bg-llosa-100">
                    <span
                      className="block h-full rounded-full"
                      style={{ width: `${(f.guanyats / maxim) * 100}%`, background: COLORS_GRUP[f.color].fons }}
                    />
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-base text-llosa-500">
        Compten els quinzes dels membres que té cada grup ara, els haja guanyat amb el grup o pel seu compte.
      </p>
    </div>
  );
}

function Individual({ periode, alumneId, setAlumneId }) {
  const { estat } = useClasse();
  const r = alumneId ? resumAlumne(estat, alumneId, periode) : null;
  const nomCategoria = (id) => estat.categories.find((c) => c.id === id)?.nom ?? 'Categoria esborrada';
  const format = new Intl.DateTimeFormat('ca-ES-valencia', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="space-y-6">
      <label className="no-imprimir block">
        <span className="mb-1 block text-lg font-semibold">Tria un/a alumne/a</span>
        <select
          className="min-h-12 w-full max-w-md rounded-xl border-[3px] border-llosa-200 bg-white px-3 text-lg"
          value={alumneId ?? ''}
          onChange={(e) => setAlumneId(e.target.value || null)}
        >
          <option value="">—</option>
          {[...estat.alumnes].sort((a, b) => a.nom.localeCompare(b.nom, 'ca')).map((a) => (
            <option key={a.id} value={a.id}>{a.nom}</option>
          ))}
        </select>
      </label>

      {r && (
        <>
          <div className="flex flex-wrap items-center gap-5 rounded-2xl border-[3px] border-llosa-200 bg-white p-4">
            <AvatarPilotari avatar={r.alumne.avatar} mida={96} />
            <div>
              <p className="font-display text-4xl">{r.alumne.nom}</p>
              <p className="text-xl text-blau-700">{r.nivell.nom}</p>
              <p className="xifres text-lg text-llosa-700">
                {quinzes(r.alumne.quinzes)} ara, rècord de {r.alumne.record}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Xifra valor={r.guanyats} titol="quinzes guanyats" to="bg-groc-100" />
            <Xifra valor={r.avisos} titol="avisos" />
            <Xifra valor={r.restats} titol="quinzes restats" />
          </div>

          <Evolucio dies={evolucioDiaria(estat, 14, new Date(), r.alumne.id)} />

          <div>
            <h3 className="mb-2 text-lg font-semibold">Per categories</h3>
            <PerCategoria categories={r.categories} />
          </div>

          {r.ultims.length > 0 && (
            <div>
              <h3 className="mb-2 text-lg font-semibold">Últimes anotacions</h3>
              <ul className="divide-y-2 divide-llosa-100 rounded-2xl border-[3px] border-llosa-200 bg-white">
                {r.ultims.map((ev) => (
                  <li key={ev.id} className="flex items-center justify-between gap-3 px-4 py-2 text-lg">
                    <span className="min-w-0 truncate">{nomCategoria(ev.categoriaId)}</span>
                    <span className="flex shrink-0 items-center gap-3">
                      <span className="text-base text-llosa-500">{format.format(new Date(ev.data))}</span>
                      <span className="xifres w-14 text-right font-semibold">
                        {ev.tipus === 'avis' ? 'Avís' : ev.valor > 0 ? `+${ev.valor}` : ev.valor < 0 ? `−${-ev.valor}` : '0'}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}

const VISTES = [
  { id: 'grup', nom: 'Tota la classe' },
  { id: 'grups', nom: 'Per grups' },
  { id: 'alumne', nom: 'Un/a alumne/a' },
];

/** Pàgina d'informes de la classe activa. */
export default function Informes() {
  const { estat } = useClasse();
  const [vista, setVista] = useState('grup');
  const [periode, setPeriode] = useState('setmana');
  const [alumneId, setAlumneId] = useState(null);
  const pastilla = (actiu) =>
    `min-h-12 rounded-full px-5 text-lg font-semibold ${actiu ? 'bg-llosa-900 text-white' : 'bg-white text-llosa-700 hover:bg-llosa-100'}`;

  return (
    <Pagina titol="Informes">
      <div className="no-imprimir mb-5 flex flex-wrap items-center gap-2">
        {VISTES.map((v) => (
          <button key={v.id} type="button" className={pastilla(vista === v.id)} aria-pressed={vista === v.id} onClick={() => setVista(v.id)}>
            {v.nom}
          </button>
        ))}
        <span className="mx-2 hidden h-8 w-0.5 bg-llosa-200 sm:block" aria-hidden="true" />
        {PERIODES.map((p) => (
          <button key={p.id} type="button" className={pastilla(periode === p.id)} aria-pressed={periode === p.id} onClick={() => setPeriode(p.id)}>
            {p.nom}
          </button>
        ))}
        <button type="button" className={`${boto} ml-auto`} onClick={() => window.print()}>
          Imprimeix
        </button>
      </div>

      <div className="per-imprimir">
        <p className="mb-4 text-lg text-llosa-700">
          {estat.aula.nom}, {estat.aula.escola}. {PERIODES.find((p) => p.id === periode).nom}.
        </p>
        {vista === 'grup' && <Grup periode={periode} />}
        {vista === 'grups' && <PerGrups periode={periode} />}
        {vista === 'alumne' && <Individual periode={periode} alumneId={alumneId} setAlumneId={setAlumneId} />}
      </div>
    </Pagina>
  );
}
